/**
 * Demo Script State API
 *
 * PM:    GET/POST /v1/demo-script
 * RM:    GET/POST /v1/demo-script/rm
 * BPAFG: GET/POST /v1/demo-script/bpafg
 * Team:  GET/POST /v1/demo-script/team-resources
 * Catalog: GET/POST /v1/demo-script/catalog
 * Custom:  GET/POST /v1/demo-script/custom/{slug}
 */

const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const BUCKET = process.env.S3_BUCKET || 'manuel-weiss-website';
const EDIT_PW = process.env.EDIT_PASSWORD || 'tempus-demo-edit-2024';

const STATE_KEY_PM = 'data/tempus-demo-pm-state.json';
const STATE_KEY_RM = 'data/tempus-demo-rm-state.json';
const STATE_KEY_BPAFG = 'data/tempus-demo-bpafg-state.json';
const STATE_KEY_TEAM_RESOURCES = 'data/tempus-demo-team-resources-state.json';
const CATALOG_KEY = 'data/tempus-demo-catalog.json';

const RESERVED_SLUGS = new Set(['pm', 'rm', 'bpafg', 'team-resources', 'catalog', 'custom']);

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
  'http://127.0.0.1:5500',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type,X-Demo-Password',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      CacheControl: 'no-cache, no-store, must-revalidate',
    })
  );
}

function parseRoute(event) {
  const p = (event.path || event.requestContext?.path || event.rawPath || '').toLowerCase();
  if (p.includes('/demo-script/catalog')) return { type: 'catalog' };
  const customMatch = p.match(/\/demo-script\/custom\/([a-z0-9][a-z0-9-]{0,48})/i);
  if (customMatch) return { type: 'custom', slug: customMatch[1].toLowerCase() };
  if (p.includes('/demo-script/team-resources')) return { type: 'legacy', key: STATE_KEY_TEAM_RESOURCES };
  if (p.includes('/demo-script/bpafg')) return { type: 'legacy', key: STATE_KEY_BPAFG };
  if (p.includes('/demo-script/rm')) return { type: 'legacy', key: STATE_KEY_RM };
  if (p.includes('/demo-script')) return { type: 'legacy', key: STATE_KEY_PM };
  return { type: 'unknown' };
}

function customStateKey(slug) {
  return `data/tempus-demo-custom/${slug}/state.json`;
}

function isValidSlug(slug) {
  return /^[a-z0-9][a-z0-9-]{0,48}$/.test(slug) && !RESERVED_SLUGS.has(slug);
}

async function handleCatalog(method, body, origin, pw) {
  if (method === 'GET') {
    const catalog = (await loadState(CATALOG_KEY)) || { version: 1, demos: [] };
    return response(200, catalog, origin);
  }

  if (method === 'POST') {
    if (pw !== EDIT_PW) return response(403, { error: 'Ungültiges Passwort' }, origin);
    const demo = body.demo;
    if (!demo?.id || !demo?.name) {
      return response(400, { error: 'demo.id und demo.name erforderlich' }, origin);
    }
    const id = String(demo.id).toLowerCase();
    if (!isValidSlug(id)) {
      return response(400, { error: 'Ungültiger demo.id (Slug)' }, origin);
    }

    const catalog = (await loadState(CATALOG_KEY)) || { version: 1, demos: [] };
    const now = Date.now();
    const entry = {
      ...demo,
      id,
      updatedAt: now,
      createdAt: demo.createdAt || now,
    };
    const idx = catalog.demos.findIndex((d) => d.id === id);
    if (idx >= 0) catalog.demos[idx] = { ...catalog.demos[idx], ...entry };
    else catalog.demos.push(entry);
    catalog.version = 1;
    await saveState(catalog, CATALOG_KEY);
    return response(200, { ok: true, demo: entry }, origin);
  }

  return response(405, { error: 'Method not allowed' }, origin);
}

async function handleCustom(method, slug, body, origin, pw) {
  if (!isValidSlug(slug)) {
    return response(400, { error: 'Ungültiger Demo-Slug' }, origin);
  }
  const key = customStateKey(slug);

  if (method === 'GET') {
    const state = await loadState(key);
    if (!state) return response(204, { message: 'No saved state' }, origin);
    return response(200, state, origin);
  }

  if (method === 'POST') {
    if (pw !== EDIT_PW) return response(403, { error: 'Ungültiges Passwort' }, origin);
    if (!Array.isArray(body.scenes)) {
      return response(400, { error: 'scenes array fehlt' }, origin);
    }
    const state = {
      ...body,
      savedBy: 'editor',
      ts: typeof body.ts === 'number' ? body.ts : Date.now(),
    };
    await saveState(state, key);
    return response(200, { ok: true, ts: state.ts }, origin);
  }

  return response(405, { error: 'Method not allowed' }, origin);
}

async function handleLegacy(method, s3Key, body, origin, pw) {
  if (method === 'GET') {
    const state = await loadState(s3Key);
    if (!state) return response(204, { message: 'No saved state' }, origin);
    return response(200, state, origin);
  }

  if (method === 'POST') {
    if (pw !== EDIT_PW) return response(403, { error: 'Ungültiges Passwort' }, origin);
    if (!Array.isArray(body.scenes)) {
      return response(400, { error: 'scenes array fehlt' }, origin);
    }
    const state = {
      ...body,
      savedBy: 'editor',
      ts: typeof body.ts === 'number' ? body.ts : Date.now(),
    };
    await saveState(state, s3Key);
    return response(200, { ok: true, ts: state.ts }, origin);
  }

  return response(405, { error: 'Method not allowed' }, origin);
}

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = event.httpMethod;

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(origin), body: '' };
  }

  const route = parseRoute(event);
  const pw = event.headers?.['x-demo-password'] || event.headers?.['X-Demo-Password'] || '';

  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      return response(400, { error: 'Ungültiges JSON' }, origin);
    }
  }

  try {
    if (route.type === 'catalog') {
      return await handleCatalog(method, body, origin, pw);
    }
    if (route.type === 'custom') {
      return await handleCustom(method, route.slug, body, origin, pw);
    }
    if (route.type === 'legacy') {
      return await handleLegacy(method, route.key, body, origin, pw);
    }
    return response(404, { error: 'Route not found' }, origin);
  } catch (err) {
    console.error('demo-script-api error:', err);
    return response(500, { error: 'Interner Fehler' }, origin);
  }
};
