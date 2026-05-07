/**
 * Lambda: Demo Script State API
 *
 * PM: s3://…/data/tempus-demo-pm-state.json  — GET/POST /v1/demo-script
 * RM: s3://…/data/tempus-demo-rm-state.json  — GET/POST /v1/demo-script/rm
 */

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const BUCKET = process.env.S3_BUCKET || 'manuel-weiss-website';
const EDIT_PW = process.env.EDIT_PASSWORD || 'tempus-demo-edit-2024';

const STATE_KEY_PM = 'data/tempus-demo-pm-state.json';
const STATE_KEY_RM = 'data/tempus-demo-rm-state.json';

const ALLOWED_ORIGINS = [
  'https://manuel-weiss.ch',
  'https://www.manuel-weiss.ch',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5500',
  'http://localhost:8888',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5500'
];

function stateKeyFromEvent(event) {
  const p = event.path || event.requestContext?.path || '';
  if (p.includes('/demo-script/rm')) return STATE_KEY_RM;
  return STATE_KEY_PM;
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type,X-Demo-Password',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };
}

function response(statusCode, body, origin) {
  return { statusCode, headers: corsHeaders(origin), body: JSON.stringify(body) };
}

async function loadState(key) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const text = await res.Body.transformToString();
    return JSON.parse(text);
  } catch (err) {
    if (err.name === 'NoSuchKey') return null;
    throw err;
  }
}

async function saveState(data, key) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
    CacheControl: 'no-cache, no-store, must-revalidate'
  }));
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = event.httpMethod;

  // CORS Preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(origin), body: '' };
  }

  const s3Key = stateKeyFromEvent(event);

  try {
    if (method === 'GET') {
      const state = await loadState(s3Key);
      if (!state) return response(204, { message: 'No saved state' }, origin);
      return response(200, state, origin);
    }

    if (method === 'POST') {
      // Password check
      const pw = event.headers?.['x-demo-password'] || event.headers?.['X-Demo-Password'] || '';
      if (pw !== EDIT_PW) {
        return response(403, { error: 'Ungültiges Passwort' }, origin);
      }

      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return response(400, { error: 'Ungültiges JSON' }, origin);
      }

      if (!Array.isArray(body.scenes)) {
        return response(400, { error: 'scenes array fehlt' }, origin);
      }

      const state = {
        ...body,
        savedBy: 'editor',
        ts: typeof body.ts === 'number' ? body.ts : Date.now()
      };
      await saveState(state, s3Key);
      return response(200, { ok: true, ts: state.ts }, origin);
    }

    return response(405, { error: 'Method not allowed' }, origin);

  } catch (err) {
    console.error('demo-script-api error:', err);
    return response(500, { error: 'Interner Fehler' }, origin);
  }
};
