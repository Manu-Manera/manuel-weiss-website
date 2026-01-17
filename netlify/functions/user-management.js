/**
 * User Management API (Netlify Function)
 * Admin-Funktionen für Benutzerverwaltung
 */

const { CognitoIdentityProviderClient, ListUsersCommand, AdminGetUserCommand, 
        AdminDeleteUserCommand, AdminDisableUserCommand, AdminEnableUserCommand,
        AdminResetUserPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');

// AWS Configuration
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.NETLIFY_AWS_REGION || process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
  }
});

const USER_POOL_ID = process.env.USER_POOL_ID || 'eu-central-1_xxxxxxxx';

const ALLOWED_ORIGINS = [
  'https://manuel-weiss.ch',
  'https://www.manuel-weiss.ch',
  'https://mawps.netlify.app',
  'http://localhost:3000',
  'http://localhost:5500'
];

const getCORSHeaders = (origin) => {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
};

// Admin prüfen (vereinfacht - in Produktion sollte JWT geprüft werden)
function isAdmin(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    // Prüfe ob Admin-Gruppe
    const groups = payload['cognito:groups'] || [];
    return groups.includes('admin') || groups.includes('Admin');
  } catch (e) {
    return false;
  }
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const headers = getCORSHeaders(origin);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Admin-Check
    if (!isAdmin(event)) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Admin access required' }) };
    }

    const path = event.path.replace('/.netlify/functions/user-management', '') || '/';
    const method = event.httpMethod;

    // GET /users - Alle Benutzer laden
    if (method === 'GET' && (path === '/users' || path === '/')) {
      const result = await cognitoClient.send(new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Limit: 60
      }));

      const users = (result.Users || []).map(user => ({
        username: user.Username,
        email: user.Attributes?.find(a => a.Name === 'email')?.Value,
        name: user.Attributes?.find(a => a.Name === 'name')?.Value,
        status: user.UserStatus,
        enabled: user.Enabled,
        createdAt: user.UserCreateDate,
        lastModified: user.UserLastModifiedDate
      }));

      return { statusCode: 200, headers, body: JSON.stringify(users) };
    }

    // GET /users/{username} - Einzelnen Benutzer laden
    if (method === 'GET' && path.match(/^\/users\/[^\/]+$/)) {
      const username = decodeURIComponent(path.split('/')[2]);

      const result = await cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          username: result.Username,
          email: result.UserAttributes?.find(a => a.Name === 'email')?.Value,
          name: result.UserAttributes?.find(a => a.Name === 'name')?.Value,
          status: result.UserStatus,
          enabled: result.Enabled,
          createdAt: result.UserCreateDate,
          lastModified: result.UserLastModifiedDate,
          attributes: result.UserAttributes
        })
      };
    }

    // DELETE /users/{username} - Benutzer löschen
    if (method === 'DELETE' && path.match(/^\/users\/[^\/]+$/)) {
      const username = decodeURIComponent(path.split('/')[2]);

      await cognitoClient.send(new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'User deleted' }) };
    }

    // PUT /users/{username}/disable - Benutzer deaktivieren
    if (method === 'PUT' && path.match(/^\/users\/[^\/]+\/disable$/)) {
      const username = decodeURIComponent(path.split('/')[2]);

      await cognitoClient.send(new AdminDisableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'User disabled' }) };
    }

    // PUT /users/{username}/enable - Benutzer aktivieren
    if (method === 'PUT' && path.match(/^\/users\/[^\/]+\/enable$/)) {
      const username = decodeURIComponent(path.split('/')[2]);

      await cognitoClient.send(new AdminEnableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'User enabled' }) };
    }

    // POST /users/{username}/reset-password - Passwort zurücksetzen
    if (method === 'POST' && path.match(/^\/users\/[^\/]+\/reset-password$/)) {
      const username = decodeURIComponent(path.split('/')[2]);

      await cognitoClient.send(new AdminResetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: username
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Password reset initiated' }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };

  } catch (error) {
    console.error('User Management Error:', error);
    
    if (error.name === 'UserNotFoundException') {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
    }
    
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
