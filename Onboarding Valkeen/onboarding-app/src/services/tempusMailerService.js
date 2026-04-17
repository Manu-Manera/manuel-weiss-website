/**
 * Tempus Login Mailer - Service
 *
 * Versucht zuerst die AWS Lambda (website-tempus-mailer-api) anzusprechen.
 * Wenn diese nicht erreichbar ist (noch nicht deployed / Netzwerkfehler),
 * wird transparent auf IndexedDB / localStorage gefallen, damit das Tool
 * trotzdem nutzbar ist. Templates werden dann im Browser des Admins gehalten.
 *
 * - Liest Mode aus localStorage['tempus_mailer_storage_mode'] ('cloud' | 'local' | 'auto')
 * - Default 'auto': probiert Cloud, fällt bei Fehler auf Local zurück
 */

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const PW_STORAGE_KEY   = 'tempus_mailer_edit_password';
const MODE_KEY         = 'tempus_mailer_storage_mode';
const LOCAL_INDEX_KEY  = 'tempus_mailer_templates_v1';
const LOCAL_IMG_PREFIX = 'tempus_mailer_image_v1__';

// ---------------------------------------------------------------------------
// Mode / Password
// ---------------------------------------------------------------------------

export function getStorageMode() {
  try { return localStorage.getItem(MODE_KEY) || 'auto'; } catch { return 'auto'; }
}

export function setStorageMode(mode) {
  try { localStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
}

export function getEditPassword() {
  try { return localStorage.getItem(PW_STORAGE_KEY) || ''; } catch { return ''; }
}

export function setEditPassword(pw) {
  try {
    if (pw) localStorage.setItem(PW_STORAGE_KEY, pw);
    else localStorage.removeItem(PW_STORAGE_KEY);
  } catch { /* ignore */ }
}

function authHeaders(extra = {}) {
  const pw = getEditPassword();
  return {
    'Content-Type': 'application/json',
    ...(pw ? { 'X-Mailer-Password': pw } : {}),
    ...extra,
  };
}

async function handle(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch { /* ignore */ }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// LocalStorage backend
// ---------------------------------------------------------------------------

function loadLocalIndex() {
  try {
    const raw = localStorage.getItem(LOCAL_INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLocalIndex(idx) {
  try { localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify(idx)); }
  catch (err) { throw new Error('Lokaler Speicher voll: ' + err.message); }
}

function localImageKey(slug, name) { return `${LOCAL_IMG_PREFIX}${slug}__${name}`; }

function localListTemplates() {
  const idx = loadLocalIndex();
  return Object.values(idx).map((t) => ({
    id: t.slug,
    slug: t.slug,
    title: t.title,
    subject: t.subject,
    bodyFile: t.bodyFile,
    updatedAt: t.updatedAt,
  })).sort((a, b) => a.title.localeCompare(b.title, 'de'));
}

function localGetTemplate(slug) {
  const idx = loadLocalIndex();
  const t = idx[slug];
  if (!t) throw new Error('Template nicht gefunden');
  const images = (t.images || []).map((name) => ({ name, size: 0 }));
  return {
    id: slug,
    slug,
    title: t.title,
    subject: t.subject,
    bodyFile: t.bodyFile,
    bodyExt: t.bodyExt,
    bodyText: t.bodyExt === 'docx' ? null : (t.bodyText || ''),
    bodyBase64: t.bodyExt === 'docx' ? (t.bodyBase64 || '') : null,
    images,
    updatedAt: t.updatedAt,
  };
}

function localSaveTemplate({ slug, title, subject, bodyHtml, bodyText, bodyBase64Docx }) {
  if (!slug) throw new Error('slug fehlt');
  const idx = loadLocalIndex();
  const existing = idx[slug] || { images: [] };
  const next = {
    ...existing,
    slug,
    title: title || existing.title || slug,
    subject: subject ?? existing.subject ?? '',
    updatedAt: new Date().toISOString(),
  };
  if (typeof bodyHtml === 'string') {
    next.bodyExt = 'html';
    next.bodyFile = 'body.html';
    next.bodyText = bodyHtml;
    next.bodyBase64 = '';
  } else if (typeof bodyText === 'string') {
    next.bodyExt = 'txt';
    next.bodyFile = 'body.txt';
    next.bodyText = bodyText;
    next.bodyBase64 = '';
  } else if (typeof bodyBase64Docx === 'string' && bodyBase64Docx) {
    next.bodyExt = 'docx';
    next.bodyFile = 'body.docx';
    next.bodyText = '';
    next.bodyBase64 = bodyBase64Docx;
  } else {
    if (!next.bodyExt) {
      next.bodyExt = 'html';
      next.bodyFile = 'body.html';
      next.bodyText = '';
    }
  }
  idx[slug] = next;
  saveLocalIndex(idx);
  return { ok: true, id: slug, slug, title: next.title, subject: next.subject, bodyFile: next.bodyFile };
}

function localDeleteTemplate(slug) {
  const idx = loadLocalIndex();
  const t = idx[slug];
  if (t?.images) {
    for (const name of t.images) {
      try { localStorage.removeItem(localImageKey(slug, name)); } catch { /* ignore */ }
    }
  }
  delete idx[slug];
  saveLocalIndex(idx);
  return { ok: true, id: slug };
}

async function localUploadImage(slug, file) {
  const base64 = await fileToBase64(file);
  const idx = loadLocalIndex();
  const t = idx[slug];
  if (!t) throw new Error('Template nicht gefunden');
  t.images = t.images || [];
  if (!t.images.includes(file.name)) t.images.push(file.name);
  try {
    localStorage.setItem(localImageKey(slug, file.name), JSON.stringify({
      name: file.name,
      contentType: file.type || 'application/octet-stream',
      bodyBase64: base64,
    }));
  } catch (err) {
    throw new Error('Lokaler Speicher voll: ' + err.message);
  }
  idx[slug] = t;
  saveLocalIndex(idx);
  return { ok: true, name: file.name };
}

function localDeleteImage(slug, name) {
  const idx = loadLocalIndex();
  const t = idx[slug];
  if (!t) return { ok: true };
  t.images = (t.images || []).filter((n) => n !== name);
  try { localStorage.removeItem(localImageKey(slug, name)); } catch { /* ignore */ }
  idx[slug] = t;
  saveLocalIndex(idx);
  return { ok: true };
}

function localGetImage(slug, name) {
  try {
    const raw = localStorage.getItem(localImageKey(slug, name));
    if (!raw) throw new Error('Bild nicht gefunden');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(err.message || 'Bild nicht gefunden');
  }
}

// ---------------------------------------------------------------------------
// Cloud/Local Gateway (mit Auto-Fallback)
// ---------------------------------------------------------------------------

let cloudBroken = false; // sobald ein Cloud-Call fehlschlägt, verwenden wir lokal

function shouldUseCloud() {
  const mode = getStorageMode();
  if (mode === 'local') return false;
  if (mode === 'cloud') return true;
  return !cloudBroken; // 'auto'
}

async function tryCloud(fn, fallback) {
  if (!shouldUseCloud()) return fallback();
  try {
    return await fn();
  } catch (err) {
    if (err?.status === 403) throw err; // Passwort-Fehler nicht schlucken
    console.warn('[TempusMailer] Cloud nicht erreichbar, Fallback auf lokalen Speicher:', err.message);
    cloudBroken = true;
    return fallback();
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listTemplates() {
  return tryCloud(
    async () => {
      const res = await fetch(`${API_BASE}/tempus-mailer/templates`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const data = await handle(res);
      return Array.isArray(data?.templates) ? data.templates : [];
    },
    () => localListTemplates()
  );
}

export async function getTemplate(slug) {
  return tryCloud(
    async () => {
      const res = await fetch(`${API_BASE}/tempus-mailer/templates/${encodeURIComponent(slug)}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      return handle(res);
    },
    () => localGetTemplate(slug)
  );
}

export async function saveTemplate(payload) {
  const slug = payload?.slug;
  const url = slug
    ? `${API_BASE}/tempus-mailer/templates/${encodeURIComponent(slug)}`
    : `${API_BASE}/tempus-mailer/templates`;
  const method = slug ? 'PUT' : 'POST';
  return tryCloud(
    async () => {
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      return handle(res);
    },
    () => localSaveTemplate(payload)
  );
}

export async function deleteTemplate(slug) {
  return tryCloud(
    async () => {
      const res = await fetch(`${API_BASE}/tempus-mailer/templates/${encodeURIComponent(slug)}`, { method: 'DELETE', headers: authHeaders() });
      return handle(res);
    },
    () => localDeleteTemplate(slug)
  );
}

export async function uploadImage(slug, file) {
  return tryCloud(
    async () => {
      const base64 = await fileToBase64(file);
      const res = await fetch(`${API_BASE}/tempus-mailer/templates/${encodeURIComponent(slug)}/images`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ fileName: file.name, contentType: file.type || 'application/octet-stream', bodyBase64: base64 }),
      });
      return handle(res);
    },
    () => localUploadImage(slug, file)
  );
}

export async function deleteImage(slug, name) {
  return tryCloud(
    async () => {
      const res = await fetch(`${API_BASE}/tempus-mailer/templates/${encodeURIComponent(slug)}/images/${encodeURIComponent(name)}`, { method: 'DELETE', headers: authHeaders() });
      return handle(res);
    },
    () => localDeleteImage(slug, name)
  );
}

export async function getImage(slug, name) {
  return tryCloud(
    async () => {
      const res = await fetch(`${API_BASE}/tempus-mailer/templates/${encodeURIComponent(slug)}/images/${encodeURIComponent(name)}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      return handle(res);
    },
    () => localGetImage(slug, name)
  );
}

export function isUsingLocalFallback() {
  return !shouldUseCloud();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const idx = result.indexOf('base64,');
      resolve(idx >= 0 ? result.slice(idx + 7) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}
