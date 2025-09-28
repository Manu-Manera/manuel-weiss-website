// js/docs.js
import { getUser, isLoggedIn } from './auth.js';
const API_BASE = '/api';

async function api(path, opts={}) {
  const u = getUser();
  const headers = {'Content-Type':'application/json'};
  if (u?.idToken) headers['Authorization'] = `Bearer ${u.idToken}`;
  const r = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...headers, ...(opts.headers||{}) }});
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  if (r.status === 204) return null;
  return r.json();
}

export async function uploadDocument(file) {
  if (!isLoggedIn()) throw new Error('Nicht eingeloggt');
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const { url, key, sizeLimit } = await api('/upload-url', {
    method: 'POST',
    body: JSON.stringify({ filename: safeName, contentType: file.type || 'application/octet-stream', size: file.size })
  });
  if (sizeLimit && file.size > sizeLimit) throw new Error('Datei zu groß');
  const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
  if (!put.ok) throw new Error('S3 PUT fehlgeschlagen');
  return api('/docs', { method: 'POST', body: JSON.stringify({ key, name: file.name, type: file.type || 'application/octet-stream', size: file.size }) });
}

export async function listDocuments() {
  if (!isLoggedIn()) return [];
  return api('/docs');
}
export async function deleteDocument(id) {
  return api(`/docs/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
export async function getDownloadUrl(key) {
  return api(`/download-url?key=${encodeURIComponent(key)}`);
}
