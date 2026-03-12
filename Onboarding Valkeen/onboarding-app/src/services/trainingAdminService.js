/**
 * Training Admin API Service
 * Lädt/speichert Training-Config und generiert Upload-URLs für Screenshots
 * Fallback: localStorage wenn API nicht erreichbar
 */

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';
const STORAGE_KEY = 'training-admin-config-local';

export async function getTrainingConfig() {
  try {
    const res = await fetch(`${API_BASE}/training-admin/config`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) return res.json();
    throw new Error('API nicht verfügbar');
  } catch (e) {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);
    return {};
  }
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

export async function getUploadUrl(editId, contentType = 'image/png') {
  const res = await fetch(`${API_BASE}/training-admin/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editId, contentType })
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
