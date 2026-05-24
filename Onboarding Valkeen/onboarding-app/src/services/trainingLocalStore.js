/**
 * Local-Storage-Fallback für das Trainings-Tool.
 *
 * Aktiviert sich automatisch, wenn die AWS-API nicht erreichbar ist
 * (z.B. Account gesperrt, Offline-Demo, lokale Entwicklung).
 *
 * Verhalten:
 *  - Beim ersten Aufruf werden die Seed-Daten (DEMO_BRANDING/DEMO_TOUR/DEMO_SLIDES)
 *    in localStorage geschrieben, damit das UI sofort etwas anzuzeigen hat.
 *  - Speicherung pro Kunde getrennt unter "training-local-<cid>:<bereich>".
 *  - Auth: erzeugt ein lokales Pseudo-Token (Base64) ohne JWT-Signatur –
 *    das Backend würde es ablehnen, das ist Absicht: lokale Daten ≠ Cloud-Daten.
 *
 * Sobald AWS wieder läuft, kannst du via "Cloud-Push" alle lokalen Touren/Slides
 * hochladen (Funktion `pushAllToCloud`).
 */

import { DEMO_CUSTOMER_INDEX, DEMO_BRANDING, DEMO_SLIDES, DEMO_TOUR } from '../data/seedTours';

const PREFIX = 'training-local-';
const KEYS = {
  enabled: `${PREFIX}enabled`,
  customers: `${PREFIX}customers`,
  branding: (cid) => `${PREFIX}${cid}:branding`,
  toursIndex: (cid) => `${PREFIX}${cid}:tours-index`,
  tour: (cid, tid) => `${PREFIX}${cid}:tour:${tid}`,
  slidesIndex: (cid) => `${PREFIX}${cid}:slides-index`,
  slide: (cid, sid) => `${PREFIX}${cid}:slide:${sid}`,
  progress: (cid, uid) => `${PREFIX}${cid}:progress:${uid}`,
  progressIndex: (cid) => `${PREFIX}${cid}:progress-index`
};

function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.warn('[localStore] write failed', key, e); }
}

function remove(key) {
  try { localStorage.removeItem(key); } catch {}
}

/**
 * True, wenn der lokale Modus jemals aktiviert wurde (Seed durchgeführt).
 */
export function isLocalModeActive() {
  return read(KEYS.enabled) === true;
}

/**
 * Aktiviert den lokalen Modus und seedet die Demo-Daten, falls noch leer.
 */
export function enableLocalMode() {
  if (isLocalModeActive()) return;
  write(KEYS.enabled, true);

  if (!read(KEYS.customers)) write(KEYS.customers, DEMO_CUSTOMER_INDEX);
  if (!read(KEYS.branding(DEMO_BRANDING.customerId))) write(KEYS.branding(DEMO_BRANDING.customerId), DEMO_BRANDING);

  if (!read(KEYS.slidesIndex(DEMO_BRANDING.customerId))) {
    write(KEYS.slidesIndex(DEMO_BRANDING.customerId), {
      slides: DEMO_SLIDES.map((s) => ({ id: s.id, title: s.title, updatedAt: s.updatedAt }))
    });
    DEMO_SLIDES.forEach((s) => write(KEYS.slide(DEMO_BRANDING.customerId, s.id), s));
  }

  if (!read(KEYS.toursIndex(DEMO_TOUR.customerId))) {
    write(KEYS.toursIndex(DEMO_TOUR.customerId), {
      tours: [{
        id: DEMO_TOUR.id,
        title: DEMO_TOUR.title,
        status: DEMO_TOUR.status,
        audience: DEMO_TOUR.audience,
        updatedAt: DEMO_TOUR.updatedAt
      }]
    });
    write(KEYS.tour(DEMO_TOUR.customerId, DEMO_TOUR.id), DEMO_TOUR);
  }
}

export function disableLocalMode() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => remove(k));
}

/* === Customer === */

export function localGetCustomerIndex() {
  enableLocalMode();
  return read(KEYS.customers, { schemaVersion: 1, updatedAt: new Date().toISOString(), customers: [] });
}

export function localSaveCustomerIndex(index) {
  enableLocalMode();
  write(KEYS.customers, { ...index, updatedAt: new Date().toISOString() });
  return { success: true, local: true };
}

/* === Branding === */

export function localGetBranding(cid) {
  enableLocalMode();
  return read(KEYS.branding(cid));
}

export function localSaveBranding(cid, branding) {
  enableLocalMode();
  write(KEYS.branding(cid), { ...branding, customerId: cid });
  return { success: true, local: true };
}

/* === Tours === */

export function localListTours(cid) {
  enableLocalMode();
  return read(KEYS.toursIndex(cid), { tours: [] });
}

export function localGetTour(cid, tid) {
  enableLocalMode();
  return read(KEYS.tour(cid, tid));
}

export function localPutTour(cid, tour) {
  enableLocalMode();
  const t = { ...tour, customerId: cid, updatedAt: new Date().toISOString() };
  if (!t.createdAt) t.createdAt = t.updatedAt;
  write(KEYS.tour(cid, t.id), t);
  const idx = read(KEYS.toursIndex(cid), { tours: [] });
  const others = (idx.tours || []).filter((x) => x.id !== t.id);
  others.push({ id: t.id, title: t.title, status: t.status, audience: t.audience || [], updatedAt: t.updatedAt });
  others.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  write(KEYS.toursIndex(cid), { tours: others });
  return { success: true, id: t.id, local: true };
}

export function localDeleteTour(cid, tid) {
  enableLocalMode();
  remove(KEYS.tour(cid, tid));
  const idx = read(KEYS.toursIndex(cid), { tours: [] });
  write(KEYS.toursIndex(cid), { tours: (idx.tours || []).filter((x) => x.id !== tid) });
  return { success: true, local: true };
}

/* === Slides === */

export function localListSlides(cid) {
  enableLocalMode();
  return read(KEYS.slidesIndex(cid), { slides: [] });
}

export function localGetSlide(cid, sid) {
  enableLocalMode();
  return read(KEYS.slide(cid, sid));
}

export function localPutSlide(cid, slide) {
  enableLocalMode();
  const s = { ...slide, customerId: cid, updatedAt: new Date().toISOString() };
  if (!s.createdAt) s.createdAt = s.updatedAt;
  write(KEYS.slide(cid, s.id), s);
  const idx = read(KEYS.slidesIndex(cid), { slides: [] });
  const others = (idx.slides || []).filter((x) => x.id !== s.id);
  others.push({ id: s.id, title: s.title, updatedAt: s.updatedAt });
  others.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  write(KEYS.slidesIndex(cid), { slides: others });
  return { success: true, id: s.id, local: true };
}

export function localDeleteSlide(cid, sid) {
  enableLocalMode();
  remove(KEYS.slide(cid, sid));
  const idx = read(KEYS.slidesIndex(cid), { slides: [] });
  write(KEYS.slidesIndex(cid), { slides: (idx.slides || []).filter((x) => x.id !== sid) });
  return { success: true, local: true };
}

/* === Progress === */

export function localPutProgress(cid, uid, payload) {
  enableLocalMode();
  const existing = read(KEYS.progress(cid, uid), { userId: uid, customerId: cid, tours: {}, events: [] });
  const ev = { timestamp: payload.timestamp || new Date().toISOString(), ...payload };
  existing.events.push(ev);
  if (existing.events.length > 500) existing.events = existing.events.slice(-500);
  if (payload.tourId) {
    if (!existing.tours) existing.tours = {};
    const t = existing.tours[payload.tourId] || { startedAt: ev.timestamp, status: 'in-progress', events: 0 };
    t.lastStepId = payload.stepId;
    t.lastStatus = payload.status;
    t.updatedAt = ev.timestamp;
    t.events = (t.events || 0) + 1;
    existing.tours[payload.tourId] = t;
  }
  existing.updatedAt = ev.timestamp;
  write(KEYS.progress(cid, uid), existing);

  const idx = read(KEYS.progressIndex(cid), { users: [] });
  if (!idx.users.includes(uid)) {
    idx.users.push(uid);
    write(KEYS.progressIndex(cid), idx);
  }
  return { success: true, local: true };
}

export function localGetProgress(cid, uid) {
  enableLocalMode();
  return read(KEYS.progress(cid, uid), { userId: uid, customerId: cid, tours: {}, events: [] });
}

export function localGetProgressAggregate(cid) {
  enableLocalMode();
  const idx = read(KEYS.progressIndex(cid), { users: [] });
  const trainees = (idx.users || []).map((uid) => {
    const data = read(KEYS.progress(cid, uid));
    if (!data) return null;
    return {
      userId: uid,
      updatedAt: data.updatedAt,
      tours: Object.entries(data.tours || {}).map(([tourId, t]) => ({
        tourId, status: t.status, lastStatus: t.lastStatus, updatedAt: t.updatedAt, events: t.events
      }))
    };
  }).filter(Boolean);
  return { customerId: cid, trainees };
}

/* === Auth === */

export function localIssueToken(email, customerId, role = 'trainee') {
  enableLocalMode();
  const userId = String(email).toLowerCase().replace(/[^a-z0-9._@-]/g, '_').slice(0, 120);
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const payload = btoa(JSON.stringify({ sub: userId, cid: customerId, role, exp: expiresAt, local: true }));
  const token = `local.${payload}.local`;
  return { success: true, token, userId, customerId, role, expiresAt, local: true };
}

/* === Cloud-Push (sobald AWS wieder verfügbar) === */

export function listAllLocalCustomers() {
  const idx = read(KEYS.customers);
  return idx?.customers || [];
}

export function exportLocalDataForCustomer(cid) {
  enableLocalMode();
  const branding = read(KEYS.branding(cid));
  const toursIdx = read(KEYS.toursIndex(cid), { tours: [] });
  const slidesIdx = read(KEYS.slidesIndex(cid), { slides: [] });
  const tours = (toursIdx.tours || []).map((t) => read(KEYS.tour(cid, t.id))).filter(Boolean);
  const slides = (slidesIdx.slides || []).map((s) => read(KEYS.slide(cid, s.id))).filter(Boolean);
  return { customerId: cid, branding, tours, slides };
}

/**
 * Lädt für einen Kunden alle lokalen Daten in die Cloud.
 * Erwartet Service-Funktionen, die der Aufrufer (trainingAdminService) bereitstellt.
 */
export async function pushAllToCloud(cid, deps) {
  const { saveBranding, putTour, putSlide } = deps;
  const data = exportLocalDataForCustomer(cid);
  const stats = { branding: 0, tours: 0, slides: 0, errors: [] };
  if (data.branding) {
    try { await saveBranding(cid, data.branding); stats.branding = 1; }
    catch (e) { stats.errors.push(`branding: ${e.message}`); }
  }
  for (const slide of data.slides) {
    try { await putSlide(cid, slide); stats.slides++; }
    catch (e) { stats.errors.push(`slide ${slide.id}: ${e.message}`); }
  }
  for (const tour of data.tours) {
    try { await putTour(cid, tour); stats.tours++; }
    catch (e) { stats.errors.push(`tour ${tour.id}: ${e.message}`); }
  }
  return stats;
}
