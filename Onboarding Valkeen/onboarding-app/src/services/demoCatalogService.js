const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const CATALOG_URL = `${API_BASE}/demo-script/catalog`;

export const DEMO_EDIT_PASSWORD = 'tempus-demo-edit-2024';

export function customDemoUrl(slug) {
  const base = import.meta.env.BASE_URL || '/onboarding/';
  const path = `${base.endsWith('/') ? base : `${base}/`}tempus-demo.html?demo=${encodeURIComponent(slug)}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return new URL(path, window.location.origin).href;
  }
  return path;
}

export async function fetchDemoCatalog() {
  const res = await fetch(CATALOG_URL, { headers: { Accept: 'application/json' } });
  if (res.status === 204) return { version: 1, demos: [] };
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * @param {{ id: string, name: string, description?: string, features?: string[], badge?: string, color?: string, icon?: string, source?: string }} entry
 * @param {object} demoState — scenes, heroHtml, …
 */
export async function registerCustomDemo(entry, demoState, password = DEMO_EDIT_PASSWORD) {
  const slug = entry.id;
  const stateUrl = `${API_BASE}/demo-script/custom/${encodeURIComponent(slug)}`;

  const catRes = await fetch(CATALOG_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Password': password,
    },
    body: JSON.stringify({ demo: entry }),
  });
  const catData = await catRes.json().catch(() => ({}));
  if (!catRes.ok) throw new Error(catData.error || `Katalog HTTP ${catRes.status}`);

  const stateRes = await fetch(stateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Password': password,
    },
    body: JSON.stringify({
      ...demoState,
      ts: Date.now(),
    }),
  });
  const stateData = await stateRes.json().catch(() => ({}));
  if (!stateRes.ok) throw new Error(stateData.error || `State HTTP ${stateRes.status}`);

  return { catalog: catData, state: stateData, url: customDemoUrl(slug) };
}
