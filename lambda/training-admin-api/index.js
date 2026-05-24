/**
 * AWS Lambda: Training Admin API (v2)
 *
 * Verwaltet Training-Inhalte für das Tempus-Trainings-Tool von Valkeen.
 *
 * Speicher: S3 (Bucket manuel-weiss-website, Prefix training-admin/)
 *
 * Pfade:
 *   training-admin/config.json                                – Legacy: Single-Tenant Tempus-Training
 *   training-admin/customers/index.json                        – Customer-Liste + Subdomain-Mapping
 *   training-admin/customers/<cid>/branding.json
 *   training-admin/customers/<cid>/tours/index.json            – Übersicht (id, title, status, updatedAt)
 *   training-admin/customers/<cid>/tours/<tid>.json
 *   training-admin/customers/<cid>/slides/<sid>.json
 *   training-admin/customers/<cid>/progress/<uid>.json
 *   training-admin/customers/<cid>/assets/<file>
 *   training-admin/screenshots/<file>                          – Legacy
 *
 * Routen (alle unter API-Gateway-Stage /v1):
 *
 *   POST   /auth/magic-link                                    – Magic-Link generieren (Mailversand TODO)
 *   POST   /auth/token                                         – Direkt-Token (für Trainer-Login mit Admin-Pwd)
 *
 *   GET    /training-admin/config                              – Legacy
 *   PUT    /training-admin/config                              – Legacy
 *   POST   /training-admin/upload-url                          – Pre-Signed URL (jetzt mit optional cid)
 *   GET    /training-admin/screenshots                         – Legacy
 *
 *   GET    /training-admin/customers/index                     – öffentlich (für Subdomain-Mapping)
 *   GET    /training-admin/customers                           – Liste (admin)
 *   PUT    /training-admin/customers/index                     – Mapping aktualisieren (admin)
 *   GET    /training-admin/customers/:cid/branding
 *   PUT    /training-admin/customers/:cid/branding             – trainer/admin
 *   GET    /training-admin/customers/:cid/tours
 *   GET    /training-admin/customers/:cid/tours/:tid
 *   PUT    /training-admin/customers/:cid/tours/:tid           – trainer/admin
 *   DELETE /training-admin/customers/:cid/tours/:tid           – admin
 *   GET    /training-admin/customers/:cid/slides
 *   GET    /training-admin/customers/:cid/slides/:sid
 *   PUT    /training-admin/customers/:cid/slides/:sid          – trainer/admin
 *   DELETE /training-admin/customers/:cid/slides/:sid          – admin
 *   POST   /training-admin/customers/:cid/progress/:uid        – Append Event (auth)
 *   GET    /training-admin/customers/:cid/progress/:uid        – auth
 *   GET    /training-admin/customers/:cid/progress             – Aggregat (trainer/admin)
 */

const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { issueToken, authorize, DEFAULT_EXPIRY_S } = require('./auth');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const BUCKET = process.env.TRAINING_BUCKET || 'manuel-weiss-website';
const PREFIX = 'training-admin/';
const SITE_ORIGIN = 'https://manuel-weiss.ch';
const UPLOAD_EXPIRY = 60 * 10;

const s3 = new S3Client({ region: REGION });

const ALLOWED_ORIGINS = new Set([
  'https://manuel-weiss.ch',
  'https://www.manuel-weiss.ch',
  'https://mawps.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8000'
]);

function corsHeaders(origin) {
  const o = ALLOWED_ORIGINS.has(origin) ? origin : 'https://manuel-weiss.ch';
  if (origin && origin.startsWith('chrome-extension://')) {
    return baseCors(origin);
  }
  return baseCors(o);
}

function baseCors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Customer-Id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
}

function reply(statusCode, body, origin) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

async function s3GetJson(key) {
  try {
    const result = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const body = await result.Body.transformToString();
    return body ? JSON.parse(body) : null;
  } catch (e) {
    if (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) return null;
    throw e;
  }
}

async function s3PutJson(key, value) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(value, null, 2),
    ContentType: 'application/json'
  }));
}

async function s3Delete(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

async function s3List(prefix) {
  const result = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
    MaxKeys: 1000
  }));
  return result.Contents || [];
}

function safeId(id) {
  return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

/* === Pfad-Helper === */
const KEYS = {
  legacyConfig: `${PREFIX}config.json`,
  customerIndex: `${PREFIX}customers/index.json`,
  branding: (cid) => `${PREFIX}customers/${safeId(cid)}/branding.json`,
  toursIndex: (cid) => `${PREFIX}customers/${safeId(cid)}/tours/_index.json`,
  tour: (cid, tid) => `${PREFIX}customers/${safeId(cid)}/tours/${safeId(tid)}.json`,
  slidesIndex: (cid) => `${PREFIX}customers/${safeId(cid)}/slides/_index.json`,
  slide: (cid, sid) => `${PREFIX}customers/${safeId(cid)}/slides/${safeId(sid)}.json`,
  progress: (cid, uid) => `${PREFIX}customers/${safeId(cid)}/progress/${safeId(uid)}.json`,
  progressDir: (cid) => `${PREFIX}customers/${safeId(cid)}/progress/`,
  assetDir: (cid) => `${PREFIX}customers/${safeId(cid)}/assets/`,
  screenshotsLegacyDir: `${PREFIX}screenshots/`
};

/* === Pfad-Routing === */

function parsePath(event) {
  const raw = event.path || event.rawPath || '';
  const path = raw.replace(/^\/(prod|dev|v\d+)/, '');
  const method = event.httpMethod || event.requestContext?.http?.method || '';
  return { path, method };
}

function origin(event) {
  return event.headers?.origin || event.headers?.Origin || '';
}

exports.handler = async (event) => {
  const o = origin(event);
  const { path, method } = parsePath(event);

  if (method === 'OPTIONS') return reply(200, '', o);

  try {
    /* === Auth === */
    if (method === 'POST' && /\/auth\/magic-link\/?$/.test(path)) {
      return await handleMagicLink(event, o);
    }
    if (method === 'POST' && /\/auth\/token\/?$/.test(path)) {
      return await handleAdminToken(event, o);
    }

    /* === Legacy === */
    if (method === 'GET' && /\/training-admin\/config\/?$/.test(path)) return await getLegacyConfig(o);
    if (method === 'PUT' && /\/training-admin\/config\/?$/.test(path)) return await putLegacyConfig(event, o);
    if (method === 'POST' && /\/training-admin\/upload-url\/?$/.test(path)) return await handleUploadUrl(event, o);
    if (method === 'GET' && /\/training-admin\/screenshots\/?$/.test(path)) return await listLegacyScreenshots(o);

    /* === Customer Index === */
    if (method === 'GET' && /\/training-admin\/customers\/index\/?$/.test(path)) {
      const idx = (await s3GetJson(KEYS.customerIndex)) || { schemaVersion: 1, customers: [], updatedAt: new Date().toISOString() };
      return reply(200, idx, o);
    }
    if (method === 'PUT' && /\/training-admin\/customers\/index\/?$/.test(path)) {
      const auth = authorize(event, { requiredRole: 'admin' });
      if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
      const body = JSON.parse(event.body || '{}');
      body.updatedAt = new Date().toISOString();
      await s3PutJson(KEYS.customerIndex, body);
      return reply(200, { success: true }, o);
    }
    if (method === 'GET' && /\/training-admin\/customers\/?$/.test(path)) {
      const auth = authorize(event, { requiredRole: 'trainer' });
      if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
      const idx = (await s3GetJson(KEYS.customerIndex)) || { schemaVersion: 1, customers: [], updatedAt: new Date().toISOString() };
      return reply(200, idx, o);
    }

    /* === Branding === */
    let m;
    m = /\/training-admin\/customers\/([^/]+)\/branding\/?$/.exec(path);
    if (m) {
      const cid = m[1];
      if (method === 'GET') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'trainee' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        const branding = await s3GetJson(KEYS.branding(cid));
        return reply(200, branding || { customerId: cid }, o);
      }
      if (method === 'PUT') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'trainer' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        const body = JSON.parse(event.body || '{}');
        body.customerId = cid;
        await s3PutJson(KEYS.branding(cid), body);
        return reply(200, { success: true }, o);
      }
    }

    /* === Tours-Listing === */
    m = /\/training-admin\/customers\/([^/]+)\/tours\/?$/.exec(path);
    if (m && method === 'GET') {
      const cid = m[1];
      const auth = authorize(event, { customerId: cid, requiredRole: 'trainee' });
      if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
      const idx = (await s3GetJson(KEYS.toursIndex(cid))) || { tours: [] };
      const role = auth.claims.role || 'trainee';
      const filtered = role === 'trainee'
        ? { tours: (idx.tours || []).filter((t) => t.status === 'published') }
        : idx;
      return reply(200, filtered, o);
    }

    /* === Tour-CRUD === */
    m = /\/training-admin\/customers\/([^/]+)\/tours\/([^/]+)\/?$/.exec(path);
    if (m) {
      const cid = m[1];
      const tid = m[2];
      if (method === 'GET') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'trainee' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        const tour = await s3GetJson(KEYS.tour(cid, tid));
        if (!tour) return reply(404, { error: 'Tour nicht gefunden' }, o);
        if (auth.claims.role === 'trainee' && tour.status !== 'published') {
          return reply(404, { error: 'Tour nicht veröffentlicht' }, o);
        }
        return reply(200, tour, o);
      }
      if (method === 'PUT') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'trainer' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        const body = JSON.parse(event.body || '{}');
        body.id = tid;
        body.customerId = cid;
        body.updatedAt = new Date().toISOString();
        if (!body.createdAt) body.createdAt = body.updatedAt;
        await s3PutJson(KEYS.tour(cid, tid), body);
        await updateToursIndex(cid, body);
        return reply(200, { success: true, id: tid }, o);
      }
      if (method === 'DELETE') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'admin' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        await s3Delete(KEYS.tour(cid, tid));
        await removeFromToursIndex(cid, tid);
        return reply(200, { success: true }, o);
      }
    }

    /* === Slides-Listing === */
    m = /\/training-admin\/customers\/([^/]+)\/slides\/?$/.exec(path);
    if (m && method === 'GET') {
      const cid = m[1];
      const auth = authorize(event, { customerId: cid, requiredRole: 'trainee' });
      if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
      const idx = (await s3GetJson(KEYS.slidesIndex(cid))) || { slides: [] };
      return reply(200, idx, o);
    }

    /* === Slide-CRUD === */
    m = /\/training-admin\/customers\/([^/]+)\/slides\/([^/]+)\/?$/.exec(path);
    if (m) {
      const cid = m[1];
      const sid = m[2];
      if (method === 'GET') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'trainee' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        const slide = await s3GetJson(KEYS.slide(cid, sid));
        if (!slide) return reply(404, { error: 'Slide nicht gefunden' }, o);
        return reply(200, slide, o);
      }
      if (method === 'PUT') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'trainer' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        const body = JSON.parse(event.body || '{}');
        body.id = sid;
        body.customerId = cid;
        body.updatedAt = new Date().toISOString();
        if (!body.createdAt) body.createdAt = body.updatedAt;
        await s3PutJson(KEYS.slide(cid, sid), body);
        await updateSlidesIndex(cid, body);
        return reply(200, { success: true, id: sid }, o);
      }
      if (method === 'DELETE') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'admin' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        await s3Delete(KEYS.slide(cid, sid));
        await removeFromSlidesIndex(cid, sid);
        return reply(200, { success: true }, o);
      }
    }

    /* === Progress (single user) === */
    m = /\/training-admin\/customers\/([^/]+)\/progress\/([^/]+)\/?$/.exec(path);
    if (m) {
      const cid = m[1];
      const uid = m[2];
      if (method === 'GET') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'trainee' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        if (auth.claims.role === 'trainee' && auth.claims.sub !== uid) {
          return reply(403, { error: 'Nur eigener Fortschritt einsehbar' }, o);
        }
        const progress = (await s3GetJson(KEYS.progress(cid, uid))) || { userId: uid, customerId: cid, events: [] };
        return reply(200, progress, o);
      }
      if (method === 'POST') {
        const auth = authorize(event, { customerId: cid, requiredRole: 'trainee' });
        if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
        if (auth.claims.role === 'trainee' && auth.claims.sub !== uid) {
          return reply(403, { error: 'Nur eigener Fortschritt schreibbar' }, o);
        }
        const body = JSON.parse(event.body || '{}');
        const existing = (await s3GetJson(KEYS.progress(cid, uid))) || {
          userId: uid,
          customerId: cid,
          tours: {},
          events: []
        };
        const ev = {
          timestamp: body.timestamp || new Date().toISOString(),
          tourId: body.tourId,
          stepId: body.stepId,
          status: body.status,
          meta: body.meta || {}
        };
        existing.events.push(ev);
        if (existing.events.length > 2000) {
          existing.events = existing.events.slice(-2000);
        }
        if (body.tourId) {
          if (!existing.tours) existing.tours = {};
          const tourState = existing.tours[body.tourId] || { startedAt: ev.timestamp, status: 'in-progress', events: 0 };
          tourState.lastStepId = body.stepId;
          tourState.lastStatus = body.status;
          tourState.updatedAt = ev.timestamp;
          tourState.events = (tourState.events || 0) + 1;
          if (body.status === 'completed' && body.stepId === 'final') {
            tourState.status = 'completed';
            tourState.completedAt = ev.timestamp;
          }
          existing.tours[body.tourId] = tourState;
        }
        existing.updatedAt = ev.timestamp;
        await s3PutJson(KEYS.progress(cid, uid), existing);
        return reply(200, { success: true }, o);
      }
    }

    /* === Progress aggregate (trainer/admin) === */
    m = /\/training-admin\/customers\/([^/]+)\/progress\/?$/.exec(path);
    if (m && method === 'GET') {
      const cid = m[1];
      const auth = authorize(event, { customerId: cid, requiredRole: 'trainer' });
      if (!auth.ok) return reply(auth.status, { error: auth.error }, o);
      const items = await s3List(KEYS.progressDir(cid));
      const trainees = [];
      for (const it of items) {
        if (!it.Key.endsWith('.json')) continue;
        const data = await s3GetJson(it.Key);
        if (!data) continue;
        const tourEntries = Object.entries(data.tours || {});
        trainees.push({
          userId: data.userId,
          updatedAt: data.updatedAt,
          tours: tourEntries.map(([tourId, t]) => ({
            tourId, status: t.status, lastStatus: t.lastStatus, updatedAt: t.updatedAt, events: t.events
          }))
        });
      }
      return reply(200, { customerId: cid, trainees }, o);
    }

    return reply(404, { error: 'Endpoint not found', path, method }, o);
  } catch (err) {
    console.error('[training-admin-api] error', err);
    return reply(500, { error: 'Internal error', message: err?.message }, o);
  }
};

/* =====================================================================
 * Auth-Routen
 * ===================================================================== */

async function handleMagicLink(event, o) {
  const body = JSON.parse(event.body || '{}');
  const { email, customerId, role = 'trainee', expiresInSec = DEFAULT_EXPIRY_S } = body;
  if (!email || !customerId) return reply(400, { error: 'email + customerId erforderlich' }, o);

  const userId = sanitizeEmail(email);
  const token = issueToken({ userId, customerId, role, expiresInSec });

  return reply(200, {
    success: true,
    token,
    userId,
    customerId,
    role,
    expiresAt: Math.floor(Date.now() / 1000) + expiresInSec,
    note: 'Mailversand wird in Phase 6 angeschlossen – Token wird vorerst direkt zurückgegeben.'
  }, o);
}

async function handleAdminToken(event, o) {
  const body = JSON.parse(event.body || '{}');
  const { adminPassword, userId, customerId, role = 'admin' } = body;
  if (!process.env.TRAINING_ADMIN_PASSWORD) {
    return reply(500, { error: 'TRAINING_ADMIN_PASSWORD nicht gesetzt' }, o);
  }
  if (adminPassword !== process.env.TRAINING_ADMIN_PASSWORD) {
    return reply(401, { error: 'Ungültiges Passwort' }, o);
  }
  if (!userId || !customerId) return reply(400, { error: 'userId + customerId erforderlich' }, o);
  const token = issueToken({ userId, customerId, role });
  return reply(200, { success: true, token, userId, customerId, role, expiresAt: Math.floor(Date.now() / 1000) + DEFAULT_EXPIRY_S }, o);
}

function sanitizeEmail(email) {
  return String(email).toLowerCase().replace(/[^a-z0-9._@-]/g, '_').slice(0, 120);
}

/* =====================================================================
 * Index-Updates für Touren / Slides
 * ===================================================================== */

async function updateToursIndex(cid, tour) {
  const idx = (await s3GetJson(KEYS.toursIndex(cid))) || { tours: [] };
  const meta = {
    id: tour.id,
    title: tour.title,
    status: tour.status,
    audience: tour.audience || [],
    updatedAt: tour.updatedAt
  };
  const others = (idx.tours || []).filter((t) => t.id !== tour.id);
  others.push(meta);
  others.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  await s3PutJson(KEYS.toursIndex(cid), { tours: others });
}

async function removeFromToursIndex(cid, tid) {
  const idx = (await s3GetJson(KEYS.toursIndex(cid))) || { tours: [] };
  const tours = (idx.tours || []).filter((t) => t.id !== tid);
  await s3PutJson(KEYS.toursIndex(cid), { tours });
}

async function updateSlidesIndex(cid, slide) {
  const idx = (await s3GetJson(KEYS.slidesIndex(cid))) || { slides: [] };
  const meta = {
    id: slide.id,
    title: slide.title,
    updatedAt: slide.updatedAt
  };
  const others = (idx.slides || []).filter((s) => s.id !== slide.id);
  others.push(meta);
  others.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  await s3PutJson(KEYS.slidesIndex(cid), { slides: others });
}

async function removeFromSlidesIndex(cid, sid) {
  const idx = (await s3GetJson(KEYS.slidesIndex(cid))) || { slides: [] };
  const slides = (idx.slides || []).filter((s) => s.id !== sid);
  await s3PutJson(KEYS.slidesIndex(cid), { slides });
}

/* =====================================================================
 * Legacy-Routen (Backwards-Compat zur ersten TrainingAdmin-Version)
 * ===================================================================== */

async function getLegacyConfig(o) {
  const config = await s3GetJson(KEYS.legacyConfig);
  return reply(200, config || {}, o);
}

async function putLegacyConfig(event, o) {
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return reply(400, { error: 'Invalid JSON' }, o); }
  await s3PutJson(KEYS.legacyConfig, body);
  return reply(200, { success: true }, o);
}

async function handleUploadUrl(event, o) {
  const body = JSON.parse(event.body || '{}');
  const { fileName, contentType = 'image/png', editId, customerId } = body;
  if (!fileName && !editId) return reply(400, { error: 'fileName oder editId erforderlich' }, o);

  const ext = (fileName || editId).match(/\.(png|jpg|jpeg|gif|webp|mp4|webm)$/i)
    ? ''
    : (contentType.includes('png') ? '.png' : contentType.includes('mp4') ? '.mp4' : contentType.includes('webm') ? '.webm' : '.jpg');
  const safeName = (editId || fileName || `img_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = customerId ? KEYS.assetDir(customerId) : KEYS.screenshotsLegacyDir;
  const key = `${dir}${safeName}${ext}`;

  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: UPLOAD_EXPIRY });
  const publicUrl = `${SITE_ORIGIN}/${key}`;

  return reply(200, { uploadUrl, publicUrl, key, expiresIn: UPLOAD_EXPIRY }, o);
}

async function listLegacyScreenshots(o) {
  const items = await s3List(KEYS.screenshotsLegacyDir);
  const screenshots = items.map((it) => ({
    key: it.Key,
    url: `${SITE_ORIGIN}/${it.Key}`,
    lastModified: it.LastModified,
    size: it.Size
  }));
  return reply(200, { screenshots }, o);
}
