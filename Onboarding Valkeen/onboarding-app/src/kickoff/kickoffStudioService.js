import { getTenantBySlug } from './kickoffTenants';
import { kickoffSubdomainHref } from './kickoffTenantUrls';
import { slideToGammaBrief } from './kickoffStudioGamma';
import {
  buildValkeenMasterGammaRequest,
  kickoffDeckWithValkeenStyle,
  valkeenMasterToGammaInputText,
  valkeenModuleSectionGammaInput,
  masterManifest,
} from './kickoffGammaValkeenBrand';

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const KICKOFF_URL = `${API_BASE}/kickoff-studio`;
const LOCAL_KEY = 'kickoff_studio_session_v1';

/** Same password as demo-script editor when not overridden. */
export const DEFAULT_EDIT_PASSWORD = 'tempus-demo-edit-2024';
export const EDIT_PASSWORD_STORAGE_KEY = 'valkeen_kickoff_edit_pw';

export function resolveEditPassword(input) {
  const trimmed = String(input || '').trim();
  return trimmed || DEFAULT_EDIT_PASSWORD;
}

export function newSessionId() {
  const r = Math.random().toString(36).slice(2, 8);
  return `kickoff-${Date.now().toString(36)}-${r}`;
}

export function loadLocalSession(sessionId) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[sessionId] || null;
  } catch {
    return null;
  }
}

export function saveLocalSession(session) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[session.sessionId] = { ...session, updatedAt: Date.now() };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
}

export async function fetchCloudSession(sessionId) {
  const res = await fetch(`${KICKOFF_URL}?sessionId=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function saveCloudSession(session, password) {
  const res = await fetch(KICKOFF_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Password': password,
    },
    body: JSON.stringify({ action: 'save', ...session }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const GAMMA_POLL_MS = 5000;
const GAMMA_POLL_MAX = 72; // ~6 min

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeFetchError(err) {
  const msg = err?.message || '';
  if (msg === 'Load failed' || msg === 'Failed to fetch' || msg.includes('NetworkError')) {
    return new Error(
      'Verbindung zur API fehlgeschlagen (Load failed). Lambda/API prüfen oder später erneut versuchen.'
    );
  }
  return err;
}

async function kickoffPost(body, password) {
  let res;
  try {
    res = await fetch(KICKOFF_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Demo-Password': password,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw normalizeFetchError(err);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function pollGammaUntilDone(generationId, password) {
  for (let i = 0; i < GAMMA_POLL_MAX; i++) {
    if (i > 0) await sleep(GAMMA_POLL_MS);
    const st = await kickoffPost({ action: 'gamma-poll', generationId }, password);
    if (st.status === 'completed' && st.gammaUrl) {
      return { gammaUrl: st.gammaUrl, generationId };
    }
    if (st.status === 'failed') {
      throw new Error(st.error || 'Gamma generation failed');
    }
  }
  throw new Error('Gamma: Zeitüberschreitung beim Warten auf die Fertigstellung');
}

export async function requestGammaSlideDesign({ slide, locale, customer }, password) {
  const inputText = slideToGammaBrief(slide, locale, customer);
  const started = await kickoffPost({ action: 'gamma-slide', inputText, locale }, password);
  if (started.gammaUrl) return started;
  if (!started.generationId) {
    throw new Error(started.error || 'Gamma: keine generationId');
  }
  return pollGammaUntilDone(started.generationId, password);
}

export async function requestGammaExport(session, password) {
  const started = await kickoffPost(
    { action: 'gamma-export', session, exportDeck: session.exportDeck },
    password
  );
  if (started.gammaUrl) return started;
  if (!started.generationId) {
    throw new Error(started.error || 'Gamma: keine generationId');
  }
  return pollGammaUntilDone(started.generationId, password);
}

/**
 * Valkeen 2026 Master → Gamma (121-Folien-PPTX oder Workshop+Master-Stil).
 * @param {'full'|'module'|'workshop'} mode
 */
export async function requestGammaValkeenMaster(
  { mode = 'full', locale = 'de', customer = '', exportDeck },
  password
) {
  let inputText;
  let numCards;
  const cust = customer || exportDeck?.meta?.customer || '';

  if (mode === 'workshop') {
    if (!exportDeck?.slides?.length) {
      throw new Error('exportDeck required for workshop mode');
    }
    inputText = kickoffDeckWithValkeenStyle(exportDeck, locale);
    numCards = (exportDeck.slides?.length || 0) + (exportDeck.closing ? 1 : 0);
  } else if (mode === 'module') {
    inputText = valkeenModuleSectionGammaInput(locale, cust);
    numCards = (inputText.match(/\n---\n/g) || []).length + 1;
  } else {
    inputText = valkeenMasterToGammaInputText(locale, cust);
    numCards = masterManifest.slideCount || 121;
  }

  const gammaBody = buildValkeenMasterGammaRequest({
    inputText,
    locale,
    customer: cust,
    numCards,
  });

  const started = await kickoffPost(
    { action: 'gamma-valkeen-master', gammaBody },
    password
  );
  if (started.gammaUrl) return started;
  if (!started.generationId) {
    throw new Error(started.error || 'Gamma: keine generationId');
  }
  return pollGammaUntilDone(started.generationId, password);
}

export function sessionShareUrl(sessionId, tenantSlug, linkLabel, customer) {
  if (linkLabel || getTenantBySlug(tenantSlug)) {
    return kickoffSubdomainHref({ tenantSlug, linkLabel, sessionId, customer });
  }
  const base = window.location.origin + (import.meta.env.BASE_URL || '/');
  const path = tenantSlug
    ? `kickoff-presenter/${tenantSlug}`
    : 'kickoff-presenter';
  const url = new URL(path, base.endsWith('/') ? base : `${base}/`);
  url.searchParams.set('session', sessionId);
  return url.href;
}
