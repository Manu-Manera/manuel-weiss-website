const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.FOKUS_TABLE || 'mawps-fokus-tagebuch';
const MAX_FIELD_LEN = 6000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEK_RE = /^\d{4}-W\d{2}$/;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Id',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Content-Type': 'application/json'
};

function response(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

function getUserIdFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.substring(7);
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub || payload.username || payload.email || null;
  } catch (e) {
    console.error('JWT parse error:', e);
    return null;
  }
}

function truncateStrings(obj, path = '') {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return obj.length > MAX_FIELD_LEN ? obj.slice(0, MAX_FIELD_LEN) : obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item, i) => truncateStrings(item, `${path}[${i}]`));
  }
  if (typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      out[k] = truncateStrings(obj[k], `${path}.${k}`);
    }
    return out;
  }
  return obj;
}

async function getEntry(userId, entryKey) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: { userId, entryKey }
    })
  );
  return result.Item || null;
}

async function putEntry(userId, entryKey, payload) {
  const now = new Date().toISOString();
  const safePayload = truncateStrings(payload);
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        userId,
        entryKey,
        schemaVersion: 1,
        updatedAt: now,
        payload: safePayload
      }
    })
  );
  return { success: true, updatedAt: now };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const userId = getUserIdFromToken(authHeader);
  if (!userId) {
    return response(401, { error: 'Nicht autorisiert' });
  }

  const rawPath = event.path || event.resource || '';
  const path = rawPath.split('?')[0];

  try {
    const method = event.httpMethod;

    // ----- DAY -----
    if (path.includes('/fokus-tagebuch/day')) {
      if (method === 'GET') {
        const date = event.queryStringParameters?.date;
        if (!date || !DATE_RE.test(date)) {
          return response(400, { error: 'Ungültiger Parameter date (YYYY-MM-DD)' });
        }
        const entryKey = `DAY#${date}`;
        const item = await getEntry(userId, entryKey);
        return response(200, { entry: item?.payload || null, updatedAt: item?.updatedAt || null });
      }
      if (method === 'PUT') {
        const body = JSON.parse(event.body || '{}');
        const date = body.date;
        if (!date || !DATE_RE.test(date)) {
          return response(400, { error: 'Ungültiges Feld date (YYYY-MM-DD)' });
        }
        const { date: _d, ...rest } = body;
        const result = await putEntry(userId, `DAY#${date}`, rest);
        return response(200, result);
      }
    }

    // ----- WEEK -----
    if (path.includes('/fokus-tagebuch/week')) {
      if (method === 'GET') {
        const week = event.queryStringParameters?.week;
        if (!week || !WEEK_RE.test(week)) {
          return response(400, { error: 'Ungültiger Parameter week (z.B. 2026-W20)' });
        }
        const entryKey = `WEEK#${week}`;
        const item = await getEntry(userId, entryKey);
        return response(200, { entry: item?.payload || null, updatedAt: item?.updatedAt || null });
      }
      if (method === 'PUT') {
        const body = JSON.parse(event.body || '{}');
        const week = body.week;
        if (!week || !WEEK_RE.test(week)) {
          return response(400, { error: 'Ungültiges Feld week (YYYY-Www)' });
        }
        const { week: _w, ...rest } = body;
        const result = await putEntry(userId, `WEEK#${week}`, rest);
        return response(200, result);
      }
    }

    return response(404, { error: 'Route nicht gefunden', path: rawPath });
  } catch (err) {
    console.error('fokus-tagebuch error:', err);
    return response(500, { error: err.message || 'Serverfehler' });
  }
};
