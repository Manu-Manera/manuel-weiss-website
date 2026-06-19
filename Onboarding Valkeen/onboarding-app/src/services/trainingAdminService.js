/**
 * Training Admin API Service
 *
 * Sprache zum Lambda lambda/training-admin-api/index.js.
 *
 * Drei Bereiche:
 *  1. Legacy-Config (Logo/Tabs/Pages/Screenshots der alten Tempus-Training-Seite)
 *  2. Asset-Upload (Pre-Signed URLs, jetzt customer-aware)
 *  3. Customer/Tour/Slide/Branding/Progress (neu, für das Trainings-Tool)
 *
 * Alle Aufrufe nutzen den Bearer-Token aus localStorage ("trainingAuth").
 * Wenn keine API erreichbar ist, fällt die Legacy-Config sauber auf localStorage zurück;
 * neue Endpoints werfen Fehler, die das Authoring-UI anzeigt.
 */

import * as Local from './trainingLocalStore';

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const STORAGE_KEY = 'training-admin-config-local';
const AUTH_KEY = 'trainingAuth';

/**
 * Local-Mode-Steuerung:
 *  - "auto": versucht zuerst die API, fällt bei Netzwerk-/5xx-Fehlern auf localStorage
 *  - "force": komplett offline, keine API-Calls
 *  - "off": nur API, keine Fallbacks
 *
 * Default ist "auto", kann zur Laufzeit umgestellt werden via setLocalMode().
 */

const LOCAL_MODE_KEY = 'trainingLocalMode';

export function getLocalMode() {
  try { return localStorage.getItem(LOCAL_MODE_KEY) || 'auto'; }
  catch { return 'auto'; }
}

export function setLocalMode(mode) {
  if (!['auto', 'force', 'off'].includes(mode)) return;
  try { localStorage.setItem(LOCAL_MODE_KEY, mode); } catch {}
  if (mode === 'force') Local.enableLocalMode();
}

function shouldUseLocalFor(error) {
  const mode = getLocalMode();
  if (mode === 'force') return true;
  if (mode === 'off') return false;
  if (!error) return false;
  if (error.name === 'TypeError') return true;
  if (error.message?.includes('Failed to fetch')) return true;
  if (error.message?.includes('NetworkError')) return true;
  if (error.status === 0) return true;
  if (error.status >= 500) return true;
  if (error.status === 401 || error.status === 403) return true;
  if (error.status === 404) return true;
  return false;
}

function isForceLocal() { return getLocalMode() === 'force'; }

export const __local = Local;

/* === Auth === */

export function getAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const auth = JSON.parse(raw);
    if (auth.expiresAt && auth.expiresAt * 1000 < Date.now()) return null;
    return auth;
  } catch {
    return null;
  }
}

export function setAuth(auth) {
  if (!auth) {
    localStorage.removeItem(AUTH_KEY);
    return;
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

async function request(path, init = {}) {
  const auth = getAuth();
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (auth?.token) headers.set('Authorization', `Bearer ${auth.token}`);
  if (auth?.customerId) headers.set('X-Customer-Id', auth.customerId);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { error: text }; }
    const err = new Error(parsed.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = parsed;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json().catch(() => ({}));
}

async function withLocalFallback(callRemote, callLocal) {
  if (isForceLocal()) return callLocal();
  try {
    return await callRemote();
  } catch (e) {
    if (shouldUseLocalFor(e)) {
      try { return callLocal(); } catch { throw e; }
    }
    throw e;
  }
}

/* === Auth Endpoints === */

export async function requestMagicLink({ email, customerId, role = 'trainee', expiresInSec }) {
  return withLocalFallback(
    () => request('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email, customerId, role, expiresInSec })
    }),
    () => Local.localIssueToken(email, customerId, role)
  );
}

export async function adminLogin({ adminPassword, userId, customerId, role = 'admin' }) {
  return withLocalFallback(
    () => request('/auth/token', {
      method: 'POST',
      body: JSON.stringify({ adminPassword, userId, customerId, role })
    }),
    () => Local.localIssueToken(userId, customerId, role)
  );
}

/* === Customers === */

export async function getCustomerIndex() {
  if (isForceLocal()) return Local.localGetCustomerIndex();
  try {
    const res = await fetch(`${API_BASE}/training-admin/customers/index`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    if (shouldUseLocalFor(e)) return Local.localGetCustomerIndex();
    return { customers: [] };
  }
}

export async function listCustomers() {
  return withLocalFallback(
    () => request('/training-admin/customers'),
    () => Local.localGetCustomerIndex()
  );
}

export async function saveCustomerIndex(index) {
  return withLocalFallback(
    () => request('/training-admin/customers/index', { method: 'PUT', body: JSON.stringify(index) }),
    () => Local.localSaveCustomerIndex(index)
  );
}

/* === Branding === */

export async function getBranding(customerId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/branding`),
    () => Local.localGetBranding(customerId)
  );
}

export async function saveBranding(customerId, branding) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/branding`, {
      method: 'PUT',
      body: JSON.stringify(branding)
    }),
    () => Local.localSaveBranding(customerId, branding)
  );
}

/* === Tours === */

export async function listTours(customerId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/tours`),
    () => Local.localListTours(customerId)
  );
}

export async function getTour(customerId, tourId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/tours/${encodeURIComponent(tourId)}`),
    () => Local.localGetTour(customerId, tourId)
  );
}

export async function putTour(customerId, tour) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/tours/${encodeURIComponent(tour.id)}`, {
      method: 'PUT',
      body: JSON.stringify(tour)
    }),
    () => Local.localPutTour(customerId, tour)
  );
}

export async function deleteTour(customerId, tourId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/tours/${encodeURIComponent(tourId)}`, { method: 'DELETE' }),
    () => Local.localDeleteTour(customerId, tourId)
  );
}

/* === Slides === */

export async function listSlides(customerId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/slides`),
    () => Local.localListSlides(customerId)
  );
}

export async function getSlide(customerId, slideId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/slides/${encodeURIComponent(slideId)}`),
    () => Local.localGetSlide(customerId, slideId)
  );
}

export async function putSlide(customerId, slide) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/slides/${encodeURIComponent(slide.id)}`, {
      method: 'PUT',
      body: JSON.stringify(slide)
    }),
    () => Local.localPutSlide(customerId, slide)
  );
}

export async function deleteSlide(customerId, slideId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/slides/${encodeURIComponent(slideId)}`, { method: 'DELETE' }),
    () => Local.localDeleteSlide(customerId, slideId)
  );
}

/* === Progress === */

export async function putProgress(customerId, userId, eventPayload) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/progress/${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify(eventPayload)
    }),
    () => Local.localPutProgress(customerId, userId, eventPayload)
  );
}

export async function getProgress(customerId, userId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/progress/${encodeURIComponent(userId)}`),
    () => Local.localGetProgress(customerId, userId)
  );
}

export async function getProgressAggregate(customerId) {
  return withLocalFallback(
    () => request(`/training-admin/customers/${encodeURIComponent(customerId)}/progress`),
    () => Local.localGetProgressAggregate(customerId)
  );
}

/**
 * Lädt alle lokalen Daten eines Kunden in die Cloud, sobald AWS wieder verfügbar ist.
 */
export async function pushLocalToCloud(customerId) {
  return Local.pushAllToCloud(customerId, { saveBranding, putTour, putSlide });
}

/* === Legacy Training-Admin Config === */

export async function getTrainingConfig() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE}/training-admin/config`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    if (res.ok) return res.json();
  } catch (_) { /* fall through */ }
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);
  } catch (_) {}
  return {};
}

export async function saveTrainingConfig(config) {
  try {
    const res = await fetch(`${API_BASE}/training-admin/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) return res.json();
    throw new Error('API nicht verfügbar');
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return { success: true, local: true };
  }
}

/* === Asset Upload (Customer-aware) === */

export async function getUploadUrl(editId, contentType = 'image/png', customerId) {
  const auth = getAuth();
  const headers = { 'Content-Type': 'application/json' };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;
  const res = await fetch(`${API_BASE}/training-admin/upload-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ editId, contentType, customerId })
  });
  if (!res.ok) throw new Error('Upload-URL konnte nicht erstellt werden');
  return res.json();
}

export async function uploadImageToS3(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type }
  });
  if (!res.ok) throw new Error('Upload fehlgeschlagen');
}

/* === Extension-Bridge ===
 *
 * 1) Optional: chrome.runtime.sendMessage(EXTENSION_ID, …) wenn VITE_VALKEEN_EXTENSION_ID gesetzt.
 * 2) Immer: postMessage → Content-Script hub-bridge (kein ID nötig), solange die Extension auf
 *    localhost / manuel-weiss geladen ist.
 */

const EXTENSION_ID = (typeof window !== 'undefined' && window.__VALKEEN_EXTENSION_ID__) || null;

const HUB_BRIDGE_PAGE = 'valkeen-training-hub';
const HUB_BRIDGE_REPLY = 'valkeen-extension-bridge';

function extensionSend(message) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const tryDirect = () =>
      new Promise((res) => {
        if (!EXTENSION_ID || typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
          res(null);
          return;
        }
        try {
          chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
            if (chrome.runtime.lastError) res(null);
            else res(response ?? null);
          });
        } catch {
          res(null);
        }
      });

    void (async () => {
      const direct = await tryDirect();
      if (direct != null) {
        resolve(direct);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const timeoutMs = 8000;
      const t = setTimeout(() => {
        window.removeEventListener('message', onMsg);
        resolve(null);
      }, timeoutMs);
      function onMsg(ev) {
        if (ev.data?.source !== HUB_BRIDGE_REPLY || ev.data?.id !== id) return;
        clearTimeout(t);
        window.removeEventListener('message', onMsg);
        resolve(ev.data.response ?? null);
      }
      window.addEventListener('message', onMsg);
      window.postMessage({ source: HUB_BRIDGE_PAGE, id, message }, '*');
    })();
  });
}

export async function pingExtension() {
  try {
    const response = await extensionSend({ type: 'EXT_PING' });
    return response;
  } catch {
    return null;
  }
}

export async function pushAuthToExtension(auth) {
  if (!auth?.token || !auth?.customerId) return false;
  try {
    const response = await extensionSend({
      type: 'EXT_AUTH',
      token: auth.token,
      customerId: auth.customerId,
      userId: auth.userId,
      role: auth.role || 'trainee',
      expiresAt: auth.expiresAt
    });
    return !!response?.ok;
  } catch {
    return false;
  }
}

export async function startTourViaExtension(tourId, customerId) {
  try {
    const response = await extensionSend({ type: 'EXT_START_TOUR', tourId, customerId });
    return !!response?.ok;
  } catch {
    return false;
  }
}

export async function getRecorderSteps() {
  try {
    const response = await extensionSend({ type: 'EXT_GET_RECORDING' });
    if (response?.ok && Array.isArray(response.data)) return response.data;
    return [];
  } catch {
    return [];
  }
}

/** Drag-Sequenz auf dem aktiven Tempus-Tab ausführen (Extension erforderlich). */
export async function runMouseDragViaExtension(drags, options = {}) {
  try {
    const response = await extensionSend({
      type: 'EXT_MOUSE_DRAG',
      drags,
      steps: options.steps,
      stepDelayMs: options.stepDelayMs,
      pauseBeforeMs: options.pauseBeforeMs,
      pauseAfterMs: options.pauseAfterMs,
      tabId: options.tabId
    });
    return response ?? { ok: false, error: 'Extension nicht erreichbar' };
  } catch (e) {
    return { ok: false, error: e?.message || 'Extension-Fehler' };
  }
}

/** Einmal auf Tempus klicken lassen und clientX/clientY zurückgeben. */
export async function pickMouseCoordViaExtension() {
  try {
    const response = await extensionSend({ type: 'EXT_MOUSE_PICK_COORD' });
    return response ?? { ok: false, error: 'Extension nicht erreichbar' };
  } catch (e) {
    return { ok: false, error: e?.message || 'Extension-Fehler' };
  }
}
