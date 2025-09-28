// js/docs.js - Complete API Integration
import { getUser, isLoggedIn } from './auth.js';

// API Configuration
const API_CONFIG = {
  base: '/api',  // Will be updated for production
  endpoints: {
    uploadUrl: '/upload-url',
    docs: '/docs',
    downloadUrl: '/download-url',
    userProfile: '/user-profile',
    progress: '/user-profile/progress'
  }
};

const API_BASE = API_CONFIG.base;

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

// User Profile APIs
export async function getUserProfile() {
  if (!isLoggedIn()) return null;
  return api(API_CONFIG.endpoints.userProfile);
}

export async function saveUserProfile(profileData) {
  if (!isLoggedIn()) throw new Error('Nicht eingeloggt');
  return api(API_CONFIG.endpoints.userProfile, {
    method: 'POST',
    body: JSON.stringify(profileData)
  });
}

// Progress Tracking APIs
export async function getUserProgress() {
  if (!isLoggedIn()) return null;
  return api(API_CONFIG.endpoints.progress);
}

export async function updateUserProgress(progressData) {
  if (!isLoggedIn()) throw new Error('Nicht eingeloggt');
  return api(API_CONFIG.endpoints.progress, {
    method: 'PUT',
    body: JSON.stringify(progressData)
  });
}

// Method-specific progress tracking
export async function saveMethodProgress(methodId, stepId, stepData) {
  if (!isLoggedIn()) return false;
  
  try {
    const currentProgress = await getUserProgress() || { methods: {} };
    
    if (!currentProgress.methods[methodId]) {
      currentProgress.methods[methodId] = {
        methodId,
        startedAt: new Date().toISOString(),
        completedSteps: [],
        currentStep: 0,
        status: 'in_progress',
        results: {}
      };
    }
    
    const method = currentProgress.methods[methodId];
    
    // Update step data
    if (!method.completedSteps.includes(stepId)) {
      method.completedSteps.push(stepId);
      method.currentStep = method.completedSteps.length;
    }
    
    method.results[stepId] = {
      ...stepData,
      completedAt: new Date().toISOString()
    };
    
    method.lastActivity = new Date().toISOString();
    
    // Save updated progress
    await updateUserProgress(currentProgress);
    
    console.log(`✅ Method progress saved: ${methodId} -> ${stepId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save method progress:', error);
    return false;
  }
}
