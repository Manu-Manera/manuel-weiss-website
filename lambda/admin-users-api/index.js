'use strict';

const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersInGroupCommand,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminSetUserPasswordCommand,
  AdminConfirmSignUpCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const USER_POOL_ID = process.env.USER_POOL_ID || 'eu-central-1_8gP4gLK9r';
const PROFILES_TABLE = process.env.PROFILES_TABLE || 'mawps-user-profiles';
const ADMIN_GROUP = process.env.ADMIN_GROUP || 'admin';

const cognito = new CognitoIdentityProviderClient({ region: REGION });
const dynamo = new DynamoDBClient({ region: REGION });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: CORS,
    body: JSON.stringify(body)
  };
}

function decodeJwt(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch (_e) {
    return null;
  }
}

function getBearerToken(event) {
  const h = event.headers || {};
  const auth = h.authorization || h.Authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(auth).trim());
  return m ? m[1] : null;
}

function isAdminToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return false;
  const groups = payload['cognito:groups'] || [];
  return Array.isArray(groups) && groups.includes(ADMIN_GROUP);
}

function requireAdmin(event) {
  const token = getBearerToken(event);
  if (!token) return { ok: false, status: 401, error: 'Nicht autorisiert' };
  if (!isAdminToken(token)) return { ok: false, status: 403, error: 'Admin-Berechtigung erforderlich' };
  const payload = decodeJwt(token);
  return { ok: true, token, adminId: payload.email || payload['cognito:username'] || payload.sub };
}

function requireUser(event) {
  const token = getBearerToken(event);
  if (!token) return { ok: false, status: 401, error: 'Nicht autorisiert' };
  const payload = decodeJwt(token);
  if (!payload) return { ok: false, status: 401, error: 'Ungültiges Token' };
  const userId = payload.email || payload['cognito:username'] || payload.sub;
  return { ok: true, token, userId, payload };
}

function attrMap(attrs) {
  const out = {};
  (attrs || []).forEach(function (a) {
    if (a && a.Name) out[a.Name] = a.Value;
  });
  return out;
}

function normalizeUser(cognitoUser, access) {
  const attrs = attrMap(cognitoUser.Attributes || cognitoUser.UserAttributes);
  const email = attrs.email || cognitoUser.Username;
  return {
    id: cognitoUser.Username,
    username: cognitoUser.Username,
    email: email,
    name: attrs.name || attrs.given_name || '',
    emailVerified: attrs.email_verified === 'true',
    status: cognitoUser.UserStatus,
    enabled: cognitoUser.Enabled !== false,
    createdAt: cognitoUser.UserCreateDate ? cognitoUser.UserCreateDate.toISOString() : null,
    access: {
      personality_song: access && access.features && access.features.personality_song === true
    }
  };
}

async function loadAccessRecord(userId) {
  if (!userId) return { features: { personality_song: false } };
  try {
    const res = await dynamo.send(new GetItemCommand({
      TableName: PROFILES_TABLE,
      Key: marshall({ userId: userId })
    }));
    if (!res.Item) return { features: { personality_song: false } };
    const data = unmarshall(res.Item);
    return {
      features: {
        personality_song: data.access && data.access.features && data.access.features.personality_song === true
      },
      updatedAt: data.access && data.access.updatedAt,
      updatedBy: data.access && data.access.updatedBy
    };
  } catch (err) {
    console.warn('loadAccessRecord failed for', userId, err.message);
    return { features: { personality_song: false } };
  }
}

async function saveAccessRecord(userId, personalitySong, updatedBy) {
  const now = new Date().toISOString();
  await dynamo.send(new UpdateItemCommand({
    TableName: PROFILES_TABLE,
    Key: marshall({ userId: userId }),
    UpdateExpression: 'SET #access = :access, #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#access': 'access',
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: marshall({
      ':access': {
        features: { personality_song: !!personalitySong },
        updatedAt: now,
        updatedBy: updatedBy || 'admin'
      },
      ':updatedAt': now
    })
  }));
  return {
    features: { personality_song: !!personalitySong },
    updatedAt: now,
    updatedBy: updatedBy || 'admin'
  };
}

async function listAdminUsernames() {
  const names = new Set();
  let token;
  do {
    const res = await cognito.send(new ListUsersInGroupCommand({
      UserPoolId: USER_POOL_ID,
      GroupName: ADMIN_GROUP,
      Limit: 60,
      NextToken: token
    }));
    (res.Users || []).forEach(function (u) {
      if (u.Username) names.add(u.Username);
    });
    token = res.NextToken;
  } while (token);
  return names;
}

async function listAllCognitoUsers() {
  const users = [];
  let token;
  let guard = 0;
  do {
    const res = await cognito.send(new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: 60,
      PaginationToken: token
    }));
    users.push.apply(users, res.Users || []);
    token = res.PaginationToken;
    guard += 1;
  } while (token && guard < 20);
  return users;
}

async function handleListUsers(event) {
  const auth = requireAdmin(event);
  if (!auth.ok) return respond(auth.status, { success: false, error: auth.error });

  const qs = event.queryStringParameters || {};
  const excludeAdmin = qs.excludeAdmin !== 'false';
  const onlyAdmin = qs.onlyAdmin === 'true';

  if (onlyAdmin) {
    const adminNames = await listAdminUsernames();
    const users = [];
    for (const username of adminNames) {
      try {
        const u = await cognito.send(new AdminGetUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username
        }));
        const access = await loadAccessRecord(username);
        users.push(normalizeUser(u, access));
      } catch (_e) {}
    }
    return respond(200, { success: true, users: users, count: users.length });
  }

  const adminSet = excludeAdmin ? await listAdminUsernames() : new Set();
  const all = await listAllCognitoUsers();
  const filtered = excludeAdmin
    ? all.filter(function (u) { return !adminSet.has(u.Username); })
    : all;

  const users = await Promise.all(filtered.map(async function (u) {
    const access = await loadAccessRecord(u.Username);
    return normalizeUser(u, access);
  }));

  users.sort(function (a, b) {
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });

  return respond(200, { success: true, users: users, count: users.length });
}

async function handleCreateUser(event, auth) {
  const body = JSON.parse(event.body || '{}');
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  const name = String(body.name || '').trim();
  const sendEmail = !!body.sendEmail;

  if (!email || !password) {
    return respond(400, { success: false, error: 'E-Mail und Passwort erforderlich' });
  }

  const attrs = [
    { Name: 'email', Value: email },
    { Name: 'email_verified', Value: 'true' }
  ];
  if (name) attrs.push({ Name: 'name', Value: name });

  await cognito.send(new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: attrs,
    MessageAction: sendEmail ? undefined : 'SUPPRESS'
  }));

  await cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    Password: password,
    Permanent: true
  }));

  await saveAccessRecord(email, false, auth.adminId);

  return respond(201, { success: true, user: { email: email, access: { personality_song: false } } });
}

async function handleDeleteUser(username) {
  await cognito.send(new AdminDeleteUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: username
  }));
  return respond(200, { success: true, message: 'User gelöscht' });
}

async function handleUpdateUser(username, event) {
  const body = JSON.parse(event.body || '{}');
  const attrs = [];
  if (body.email) attrs.push({ Name: 'email', Value: String(body.email).trim() });
  if (typeof body.name === 'string') attrs.push({ Name: 'name', Value: body.name.trim() });
  if (typeof body.emailVerified === 'boolean') {
    attrs.push({ Name: 'email_verified', Value: body.emailVerified ? 'true' : 'false' });
  }
  if (attrs.length) {
    await cognito.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: attrs
    }));
  }
  if (body.status === 'CONFIRMED') {
    await cognito.send(new AdminConfirmSignUpCommand({
      UserPoolId: USER_POOL_ID,
      Username: username
    }));
  }
  if (body.password) {
    await cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      Password: String(body.password),
      Permanent: body.temporary !== true
    }));
  }
  return respond(200, { success: true, message: 'User aktualisiert' });
}

async function handleGetAccess(username) {
  const access = await loadAccessRecord(username);
  return respond(200, { success: true, userId: username, access: access });
}

async function handlePutAccess(username, event, auth) {
  const body = JSON.parse(event.body || '{}');
  const personalitySong = body.personality_song === true || body.personalitySong === true;
  const access = await saveAccessRecord(username, personalitySong, auth.adminId);
  return respond(200, { success: true, userId: username, access: access });
}

async function handleUserAccess(event) {
  const auth = requireUser(event);
  if (!auth.ok) return respond(auth.status, { success: false, error: auth.error });
  const access = await loadAccessRecord(auth.userId);
  return respond(200, {
    success: true,
    userId: auth.userId,
    access: access,
    features: access.features
  });
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  try {
    const path = event.path || event.rawPath || '';
    const method = event.httpMethod;
    const params = event.pathParameters || {};

    if (path.endsWith('/user/access') && method === 'GET') {
      return await handleUserAccess(event);
    }

    const auth = requireAdmin(event);
    if (!auth.ok) return respond(auth.status, { success: false, error: auth.error });

    if (path.includes('/admin/users') && method === 'GET' && !params.username) {
      return await handleListUsers(event);
    }

    if (path.includes('/admin/users') && method === 'POST' && !params.username) {
      return await handleCreateUser(event, auth);
    }

    const username = params.username ? decodeURIComponent(params.username) : null;
    if (!username) return respond(404, { success: false, error: 'Route nicht gefunden' });

    if (path.endsWith('/access')) {
      if (method === 'GET') return await handleGetAccess(username);
      if (method === 'PUT') return await handlePutAccess(username, event, auth);
    }

    if (method === 'DELETE') return await handleDeleteUser(username);
    if (method === 'PUT') return await handleUpdateUser(username, event);

    return respond(404, { success: false, error: 'Route nicht gefunden' });
  } catch (err) {
    console.error('admin-users-api error:', err);
    return respond(500, { success: false, error: err.message || 'Interner Fehler' });
  }
};
