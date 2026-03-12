/**
 * Training Admin API Service
 * Lädt/speichert Training-Config und generiert Upload-URLs für Screenshots
 */

const API_BASE = 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1';

export async function getTrainingConfig() {
  const res = await fetch(`${API_BASE}/training-admin/config`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Config konnte nicht geladen werden');
  return res.json();
}

export async function saveTrainingConfig(config) {
  const res = await fetch(`${API_BASE}/training-admin/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Config konnte nicht gespeichert werden');
  return res.json();
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
