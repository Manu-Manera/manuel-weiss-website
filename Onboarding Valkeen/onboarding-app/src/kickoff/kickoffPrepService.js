import { DEFAULT_EDIT_PASSWORD } from './kickoffStudioService';

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const KICKOFF_URL = `${API_BASE}/kickoff-studio`;

export async function fetchPrepPublic(prepId, prepPassword = '') {
  const url = new URL(KICKOFF_URL);
  url.searchParams.set('prepId', prepId);
  const headers = { Accept: 'application/json' };
  if (prepPassword) headers['X-Kickoff-Prep-Password'] = prepPassword;
  const res = await fetch(url.toString(), { method: 'GET', headers });
  if (res.status === 204) return null;
  if (res.status === 401) throw new Error('PREP_AUTH_REQUIRED');
  if (res.status === 403) throw new Error('PREP_AUTH_INVALID');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function savePrepAnswers(prepId, patch, prepPassword = '') {
  const res = await fetch(KICKOFF_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(prepPassword ? { 'X-Kickoff-Prep-Password': prepPassword } : {}),
    },
    body: JSON.stringify({ action: 'prep-save', prepId, answers: patch.answers, partial: true }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('PREP_AUTH_REQUIRED');
  if (res.status === 403) throw new Error('PREP_AUTH_INVALID');
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function submitPrep(prepId, prepPassword = '') {
  const res = await fetch(KICKOFF_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(prepPassword ? { 'X-Kickoff-Prep-Password': prepPassword } : {}),
    },
    body: JSON.stringify({ action: 'prep-submit', prepId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function adminUpsertPrep(prepPayload, editPassword = DEFAULT_EDIT_PASSWORD) {
  const res = await fetch(KICKOFF_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Password': editPassword,
    },
    body: JSON.stringify({ action: 'prep-admin-upsert', ...prepPayload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function adminGetPrep(prepId, editPassword = DEFAULT_EDIT_PASSWORD) {
  const url = new URL(KICKOFF_URL);
  url.searchParams.set('prepId', prepId);
  url.searchParams.set('admin', '1');
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Demo-Password': editPassword,
    },
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
