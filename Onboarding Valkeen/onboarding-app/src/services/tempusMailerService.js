/**
 * Tempus Login Mailer – Service
 *
 * Speichert ALLE Templates + Bilder als einzelnes State-Objekt in S3:
 *   s3://manuel-weiss-website/data/tempus-mailer-state.json
 *
 * Zugriff läuft über eine dauerhafte API-Gateway-Route, die direkt in S3
 * schreibt/liest (AWS-Service-Integration, keine Lambda nötig):
 *
 *   GET / PUT https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/mailer-state
 *
 * Die Route nutzt die IAM-Rolle `apigw-mailer-state-s3` und läuft nicht
 * ab – kein 7-Tage-Presigned-URL-Refresh mehr nötig.
 *
 * Wenn das Schreiben trotzdem scheitert (Offline, AWS-Ausfall), fallen
 * wir automatisch auf localStorage zurück, damit man weiterarbeiten kann.
 * Die Public-API (listTemplates/getTemplate/…) ist ein dünner Wrapper über
 * ein normalisiertes In-Memory-State-Objekt.
 */

const MAILER_STATE_API_URL =
  'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1/mailer-state';

const MODE_KEY          = 'tempus_mailer_storage_mode';
const LOCAL_STATE_KEY   = 'tempus_mailer_state_v2';

// ---------------------------------------------------------------------------
// Speicher-Modus (Cloud vs. lokaler Fallback)
// ---------------------------------------------------------------------------

export function getStorageMode() {
  try { return localStorage.getItem(MODE_KEY) || 'auto'; } catch { return 'auto'; }
}

export function setStorageMode(mode) {
  try { localStorage.setItem(MODE_KEY, mode); } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// State laden / speichern (S3 bzw. lokaler Fallback)
// ---------------------------------------------------------------------------

const EMPTY_STATE = { schemaVersion: 1, ts: 0, templates: [] };

let cachedState = null;   // neueste Kopie im Memory
let cachedFrom  = null;   // 'cloud' | 'local' | null
let cloudBroken = false;

function shouldUseCloud() {
  const mode = getStorageMode();
  if (mode === 'local') return false;
  if (mode === 'cloud') return true;
  return !cloudBroken;
}

export function isUsingLocalFallback() {
  return !shouldUseCloud();
}

async function loadStateFromCloud() {
  const url = `${MAILER_STATE_API_URL}?t=${Date.now()}`;
  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error(`API GET ${res.status}`);
  const data = await res.json();
  return normalizeState(data);
}

function loadStateFromLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_STATE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    return normalizeState(JSON.parse(raw));
  } catch {
    return { ...EMPTY_STATE };
  }
}

function saveStateToLocal(state) {
  try {
    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    throw new Error('Lokaler Speicher voll: ' + err.message);
  }
}

async function saveStateToCloud(state) {
  const body = JSON.stringify(state);
  const res = await fetch(MAILER_STATE_API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!(res.status >= 200 && res.status < 300)) {
    throw new Error(`API PUT ${res.status}`);
  }
}

function normalizeState(data) {
  const s = data && typeof data === 'object' ? data : {};
  return {
    schemaVersion: 1,
    ts: Number(s.ts) || 0,
    templates: Array.isArray(s.templates) ? s.templates : [],
  };
}

async function getState({ forceReload = false } = {}) {
  if (cachedState && !forceReload) return cachedState;

  if (shouldUseCloud()) {
    try {
      cachedState = await loadStateFromCloud();
      cachedFrom  = 'cloud';
      return cachedState;
    } catch (err) {
      console.warn('[TempusMailer] Cloud-State nicht lesbar, Fallback lokal:', err.message);
      cloudBroken = true;
    }
  }

  cachedState = loadStateFromLocal();
  cachedFrom  = 'local';
  return cachedState;
}

async function persistState(nextState) {
  nextState.ts = Date.now();
  cachedState = nextState;

  if (shouldUseCloud()) {
    try {
      await saveStateToCloud(nextState);
      cachedFrom = 'cloud';
      // auch lokal spiegeln – falls später die Presigned-URL abläuft
      try { saveStateToLocal(nextState); } catch { /* ignore */ }
      return;
    } catch (err) {
      console.warn('[TempusMailer] Cloud-Save fehlgeschlagen, nur lokal:', err.message);
      cloudBroken = true;
    }
  }

  saveStateToLocal(nextState);
  cachedFrom = 'local';
}

// ---------------------------------------------------------------------------
// Template-Helpers
// ---------------------------------------------------------------------------

function findTemplateIndex(state, slug) {
  return (state.templates || []).findIndex((t) => t.slug === slug);
}

function templateSummary(t) {
  return {
    id: t.slug,
    slug: t.slug,
    title: t.title,
    subject: t.subject || '',
    bodyFile: t.bodyFile || (t.bodyExt === 'docx' ? 'body.docx' : 'body.html'),
    updatedAt: t.updatedAt || null,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listTemplates() {
  const state = await getState();
  return [...(state.templates || [])]
    .map(templateSummary)
    .sort((a, b) => (a.title || '').localeCompare(b.title || '', 'de'));
}

export async function getTemplate(slug) {
  const state = await getState();
  const t = state.templates.find((x) => x.slug === slug);
  if (!t) throw new Error('Template nicht gefunden');
  const images = (t.images || []).map((img) => ({ name: img.name, size: img.size || 0 }));
  return {
    id: t.slug,
    slug: t.slug,
    title: t.title,
    subject: t.subject || '',
    bodyFile: t.bodyFile || (t.bodyExt === 'docx' ? 'body.docx' : 'body.html'),
    bodyExt: t.bodyExt || 'html',
    bodyText: t.bodyExt === 'docx' ? null : (t.bodyText || ''),
    bodyBase64: t.bodyExt === 'docx' ? (t.bodyBase64 || '') : null,
    images,
    updatedAt: t.updatedAt || null,
  };
}

export async function saveTemplate({ slug, title, subject, bodyHtml, bodyText, bodyBase64Docx }) {
  if (!slug) throw new Error('slug fehlt');

  const state = await getState({ forceReload: true });
  const idx = findTemplateIndex(state, slug);
  const existing = idx >= 0 ? state.templates[idx] : { slug, images: [] };

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
  } else if (!next.bodyExt) {
    next.bodyExt = 'html';
    next.bodyFile = 'body.html';
    next.bodyText = '';
  }

  if (!Array.isArray(next.images)) next.images = [];

  if (idx >= 0) state.templates[idx] = next;
  else state.templates.push(next);

  await persistState(state);
  return { ok: true, id: slug, slug, title: next.title, subject: next.subject, bodyFile: next.bodyFile };
}

export async function deleteTemplate(slug) {
  const state = await getState({ forceReload: true });
  state.templates = (state.templates || []).filter((t) => t.slug !== slug);
  await persistState(state);
  return { ok: true, id: slug };
}

export async function uploadImage(slug, file) {
  const base64 = await fileToBase64(file);
  const state = await getState({ forceReload: true });
  const idx = findTemplateIndex(state, slug);
  if (idx < 0) throw new Error('Template nicht gefunden');
  const t = state.templates[idx];
  if (!Array.isArray(t.images)) t.images = [];
  const existingImgIdx = t.images.findIndex((i) => i.name === file.name);
  const entry = {
    name: file.name,
    contentType: file.type || 'application/octet-stream',
    bodyBase64: base64,
    size: file.size || 0,
  };
  if (existingImgIdx >= 0) t.images[existingImgIdx] = entry;
  else t.images.push(entry);
  state.templates[idx] = t;
  await persistState(state);
  return { ok: true, name: file.name };
}

export async function deleteImage(slug, name) {
  const state = await getState({ forceReload: true });
  const idx = findTemplateIndex(state, slug);
  if (idx < 0) return { ok: true };
  const t = state.templates[idx];
  t.images = (t.images || []).filter((i) => i.name !== name);
  state.templates[idx] = t;
  await persistState(state);
  return { ok: true };
}

export async function getImage(slug, name) {
  const state = await getState();
  const t = (state.templates || []).find((x) => x.slug === slug);
  if (!t) throw new Error('Template nicht gefunden');
  const img = (t.images || []).find((i) => i.name === name);
  if (!img) throw new Error('Bild nicht gefunden');
  return {
    name: img.name,
    contentType: img.contentType || 'application/octet-stream',
    bodyBase64: img.bodyBase64 || '',
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const i = result.indexOf('base64,');
      resolve(i >= 0 ? result.slice(i + 7) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}
