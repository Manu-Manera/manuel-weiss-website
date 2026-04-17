/**
 * Tempus Login Mailer API
 *
 * Verwaltet E-Mail-Vorlagen (HTML/Word + Bilder) in S3.
 * Passwortgeschützt (Shared-Secret-Header) – Schutz clientseitig zusätzlich
 * via Admin-Login in der Onboarding-App.
 *
 * S3-Layout (Bucket: manuel-weiss-website):
 *   tempus-mailer/templates/<slug>/template.json
 *   tempus-mailer/templates/<slug>/body.html   (oder body.docx / body.txt)
 *   tempus-mailer/templates/<slug>/bilder/<datei>
 *
 * Endpoints (alle Pfade mit Proxy → method=event.httpMethod):
 *   GET    /tempus-mailer/templates                      → Liste
 *   GET    /tempus-mailer/templates/{slug}                → Details + Body (HTML base64 bei .docx)
 *   POST   /tempus-mailer/templates                       → Neues Template (title/subject/bodyHtml | bodyBase64Docx)
 *   PUT    /tempus-mailer/templates/{slug}                → Metadaten + Body aktualisieren
 *   DELETE /tempus-mailer/templates/{slug}                → Template löschen
 *   POST   /tempus-mailer/templates/{slug}/images         → Bild hochladen ({fileName, contentType, bodyBase64})
 *   DELETE /tempus-mailer/templates/{slug}/images/{name}  → Bild löschen
 *
 * Auth:
 *   - Schreib-Operationen (POST/PUT/DELETE) erwarten Header X-Mailer-Password
 *   - Lese-Operationen (GET) sind offen (Admin-Panel ist clientseitig geschützt)
 */

'use strict';

const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });

const BUCKET    = process.env.S3_BUCKET    || 'manuel-weiss-website';
const PREFIX    = (process.env.S3_PREFIX   || 'tempus-mailer/templates/').replace(/^\/+/, '');
const EDIT_PW   = process.env.EDIT_PASSWORD || 'tempus-mailer-edit-2024';

const ALLOWED_ORIGINS = [
  'https://manuel-weiss.ch',
  'https://www.manuel-weiss.ch',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type,X-Mailer-Password',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };
}

function json(statusCode, body, origin) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify(body),
  };
}

function normalizeSlug(raw) {
  const s = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return s.slice(0, 80);
}

function safeFileName(name) {
  return String(name || '')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .slice(0, 160);
}

async function streamToString(body) {
  if (!body) return '';
  if (typeof body.transformToString === 'function') {
    return body.transformToString();
  }
  const chunks = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}

async function streamToBuffer(body) {
  if (!body) return Buffer.alloc(0);
  if (typeof body.transformToByteArray === 'function') {
    return Buffer.from(await body.transformToByteArray());
  }
  const chunks = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function s3GetJson(key) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const text = await streamToString(res.Body);
    return text ? JSON.parse(text) : null;
  } catch (err) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) return null;
    throw err;
  }
}

async function s3GetText(key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return streamToString(res.Body);
}

async function s3GetBinary(key) {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return streamToBuffer(res.Body);
}

async function s3PutJson(key, data) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
    CacheControl: 'no-cache',
  }));
}

async function s3PutText(key, text, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: text,
    ContentType: contentType || 'text/html; charset=utf-8',
    CacheControl: 'no-cache',
  }));
}

async function s3PutBinary(key, buffer, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType || 'application/octet-stream',
    CacheControl: 'no-cache',
  }));
}

async function s3DeletePrefix(prefix) {
  let token;
  do {
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: token,
    }));
    const objs = (list.Contents || []).map((o) => ({ Key: o.Key }));
    if (objs.length) {
      await s3.send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: objs },
      }));
    }
    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);
}

async function listSlugs() {
  const slugs = [];
  let token;
  do {
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: PREFIX,
      Delimiter: '/',
      ContinuationToken: token,
    }));
    for (const cp of list.CommonPrefixes || []) {
      const p = cp.Prefix || '';
      const slug = p.slice(PREFIX.length).replace(/\/$/, '');
      if (slug) slugs.push(slug);
    }
    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);
  return slugs;
}

function bodyFileExt(fileName) {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.htm') || lower.endsWith('.html')) return 'html';
  return 'txt';
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleListTemplates(origin) {
  const slugs = await listSlugs();
  const items = [];
  for (const slug of slugs) {
    const meta = await s3GetJson(`${PREFIX}${slug}/template.json`);
    if (!meta) continue;
    items.push({
      id: slug,
      slug,
      title: meta.title || slug,
      subject: meta.subject || '',
      bodyFile: meta.body_file || meta.bodyFile || 'body.html',
      updatedAt: meta.updatedAt || null,
    });
  }
  items.sort((a, b) => a.title.localeCompare(b.title, 'de'));
  return json(200, { templates: items }, origin);
}

async function handleGetTemplate(origin, slug) {
  slug = normalizeSlug(slug);
  if (!slug) return json(400, { error: 'slug fehlt' }, origin);

  const meta = await s3GetJson(`${PREFIX}${slug}/template.json`);
  if (!meta) return json(404, { error: 'Template nicht gefunden' }, origin);

  const bodyFile = meta.body_file || meta.bodyFile || 'body.html';
  const ext = bodyFileExt(bodyFile);

  let bodyText = null;
  let bodyBase64 = null;
  try {
    if (ext === 'docx') {
      const buf = await s3GetBinary(`${PREFIX}${slug}/${bodyFile}`);
      bodyBase64 = buf.toString('base64');
    } else {
      bodyText = await s3GetText(`${PREFIX}${slug}/${bodyFile}`);
    }
  } catch (err) {
    console.warn('Body file missing for', slug, err?.message);
  }

  // Liste der Bilder
  const images = [];
  try {
    let token;
    do {
      const list = await s3.send(new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `${PREFIX}${slug}/bilder/`,
        ContinuationToken: token,
      }));
      for (const o of list.Contents || []) {
        const key = o.Key || '';
        const name = key.split('/').pop() || '';
        if (!name) continue;
        images.push({ name, size: o.Size || 0 });
      }
      token = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (token);
  } catch (_) { /* ignore */ }

  return json(200, {
    id: slug,
    slug,
    title: meta.title || slug,
    subject: meta.subject || '',
    bodyFile,
    bodyExt: ext,
    bodyText,
    bodyBase64,
    images,
    updatedAt: meta.updatedAt || null,
  }, origin);
}

function assertAuth(event, origin) {
  const h = event.headers || {};
  const pw = h['x-mailer-password'] || h['X-Mailer-Password'] || h['x-Mailer-Password'] || '';
  if (pw !== EDIT_PW) {
    return json(403, { error: 'Ungültiges Passwort' }, origin);
  }
  return null;
}

async function handleCreateOrUpdateTemplate(event, origin, slugFromPath) {
  const unauth = assertAuth(event, origin);
  if (unauth) return unauth;

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Ungültiges JSON' }, origin); }

  const slug = normalizeSlug(slugFromPath || body.slug || body.id || body.title);
  if (!slug) return json(400, { error: 'slug fehlt' }, origin);

  const keyBase = `${PREFIX}${slug}/`;
  const existing = await s3GetJson(`${keyBase}template.json`);
  const title   = (body.title   || existing?.title   || slug).toString();
  const subject = (body.subject || existing?.subject || '').toString();

  let bodyFile = existing?.body_file || existing?.bodyFile || 'body.html';

  if (typeof body.bodyHtml === 'string') {
    bodyFile = 'body.html';
    await s3PutText(`${keyBase}${bodyFile}`, body.bodyHtml, 'text/html; charset=utf-8');
  } else if (typeof body.bodyText === 'string') {
    bodyFile = 'body.txt';
    await s3PutText(`${keyBase}${bodyFile}`, body.bodyText, 'text/plain; charset=utf-8');
  } else if (typeof body.bodyBase64Docx === 'string' && body.bodyBase64Docx) {
    bodyFile = 'body.docx';
    const buf = Buffer.from(body.bodyBase64Docx, 'base64');
    await s3PutBinary(`${keyBase}${bodyFile}`, buf,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  const meta = {
    title,
    subject,
    body_file: bodyFile,
    updatedAt: new Date().toISOString(),
  };
  await s3PutJson(`${keyBase}template.json`, meta);

  return json(200, { ok: true, id: slug, slug, ...meta }, origin);
}

async function handleDeleteTemplate(event, origin, slug) {
  const unauth = assertAuth(event, origin);
  if (unauth) return unauth;
  slug = normalizeSlug(slug);
  if (!slug) return json(400, { error: 'slug fehlt' }, origin);
  await s3DeletePrefix(`${PREFIX}${slug}/`);
  return json(200, { ok: true, id: slug }, origin);
}

async function handleUploadImage(event, origin, slug) {
  const unauth = assertAuth(event, origin);
  if (unauth) return unauth;

  slug = normalizeSlug(slug);
  if (!slug) return json(400, { error: 'slug fehlt' }, origin);

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Ungültiges JSON' }, origin); }

  const fileName = safeFileName(body.fileName || '');
  const b64      = String(body.bodyBase64 || '');
  const ct       = String(body.contentType || 'application/octet-stream');
  if (!fileName || !b64) return json(400, { error: 'fileName und bodyBase64 benötigt' }, origin);

  const buf = Buffer.from(b64, 'base64');
  const key = `${PREFIX}${slug}/bilder/${fileName}`;
  await s3PutBinary(key, buf, ct);

  return json(200, { ok: true, name: fileName, path: `bilder/${fileName}` }, origin);
}

async function handleDeleteImage(event, origin, slug, imageName) {
  const unauth = assertAuth(event, origin);
  if (unauth) return unauth;
  slug = normalizeSlug(slug);
  const name = safeFileName(imageName);
  if (!slug || !name) return json(400, { error: 'slug/name fehlt' }, origin);
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: `${PREFIX}${slug}/bilder/${name}`,
  }));
  return json(200, { ok: true }, origin);
}

async function handleGetImage(origin, slug, imageName) {
  slug = normalizeSlug(slug);
  const name = safeFileName(imageName);
  if (!slug || !name) return json(400, { error: 'slug/name fehlt' }, origin);
  try {
    const res = await s3.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${slug}/bilder/${name}`,
    }));
    const buf = await streamToBuffer(res.Body);
    const ct = res.ContentType || 'application/octet-stream';
    return json(200, {
      contentType: ct,
      bodyBase64: buf.toString('base64'),
      size: buf.length,
    }, origin);
  } catch (err) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return json(404, { error: 'Bild nicht gefunden' }, origin);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = (event.httpMethod || event.requestContext?.http?.method || 'GET').toUpperCase();

  // CORS Preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(origin), body: '' };
  }

  try {
    const rawPath = event.path || event.rawPath || '';
    // Pfad vor der Lambda: /tempus-mailer/templates[/slug][/images[/name]]
    const parts = rawPath
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter(Boolean);

    // Strip potentielle Stage-Prefixes; wir suchen ab dem Token "templates"
    const idx = parts.lastIndexOf('templates');
    const tail = idx >= 0 ? parts.slice(idx + 1) : [];
    const slug = tail[0] ? decodeURIComponent(tail[0]) : '';
    const sub  = tail[1] ? decodeURIComponent(tail[1]) : '';
    const name = tail[2] ? decodeURIComponent(tail[2]) : '';

    // /tempus-mailer/templates
    if (!slug) {
      if (method === 'GET')  return await handleListTemplates(origin);
      if (method === 'POST') return await handleCreateOrUpdateTemplate(event, origin, null);
      return json(405, { error: 'Method not allowed' }, origin);
    }

    // /tempus-mailer/templates/{slug}
    if (!sub) {
      if (method === 'GET')    return await handleGetTemplate(origin, slug);
      if (method === 'PUT')    return await handleCreateOrUpdateTemplate(event, origin, slug);
      if (method === 'POST')   return await handleCreateOrUpdateTemplate(event, origin, slug);
      if (method === 'DELETE') return await handleDeleteTemplate(event, origin, slug);
      return json(405, { error: 'Method not allowed' }, origin);
    }

    // /tempus-mailer/templates/{slug}/images[/{name}]
    if (sub === 'images') {
      if (!name) {
        if (method === 'POST') return await handleUploadImage(event, origin, slug);
        return json(405, { error: 'Method not allowed' }, origin);
      }
      if (method === 'GET')    return await handleGetImage(origin, slug, name);
      if (method === 'DELETE') return await handleDeleteImage(event, origin, slug, name);
      return json(405, { error: 'Method not allowed' }, origin);
    }

    return json(404, { error: 'Unbekannter Pfad', path: rawPath }, origin);
  } catch (err) {
    console.error('tempus-mailer-api error:', err);
    return json(500, { error: 'Interner Fehler', details: err?.message }, origin);
  }
};
