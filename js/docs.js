// js/docs.js - Complete API Integration
import { getUser, isLoggedIn } from './auth.js';

// API Configuration
const API_CONFIG = {
  base: 'https://api.manuel-weiss.com',  // Production API URL
  fallbackBase: '/api',  // Local fallback
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
  
  // Try production API first
  try {
    const r = await fetch(`${API_BASE}${path}`, { 
      ...opts, 
      headers: { ...headers, ...(opts.headers||{}) }
    });
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    if (r.status === 204) return null;
    return r.json();
  } catch (error) {
    console.warn(`🌐 Production API failed: ${path}`, error);
    
    // Try fallback API
    try {
      const r = await fetch(`${API_CONFIG.fallbackBase}${path}`, { 
        ...opts, 
        headers: { ...headers, ...(opts.headers||{}) }
      });
      if (!r.ok) throw new Error(`${r.status} ${path}`);
      if (r.status === 204) return null;
      return r.json();
    } catch (fallbackError) {
      console.warn(`🌐 Fallback API also failed: ${path}`, fallbackError);
      throw error; // Throw original error
    }
  }
}

export async function uploadDocument(file) {
  if (!isLoggedIn()) throw new Error('Nicht eingeloggt');
  
  try {
    // Try cloud upload first
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const { url, key, sizeLimit } = await api('/upload-url', {
      method: 'POST',
      body: JSON.stringify({ filename: safeName, contentType: file.type || 'application/octet-stream', size: file.size })
    });
    if (sizeLimit && file.size > sizeLimit) throw new Error('Datei zu groß');
    const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
    if (!put.ok) throw new Error('S3 PUT fehlgeschlagen');
    return api('/docs', { method: 'POST', body: JSON.stringify({ key, name: file.name, type: file.type || 'application/octet-stream', size: file.size }) });
  } catch (error) {
    console.warn('☁️ Cloud upload failed, using local storage:', error);
    // Fallback to local storage
    return uploadDocumentLocally(file);
  }
}

// Local storage fallback
async function uploadDocumentLocally(file) {
  const user = getUser();
  const docId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Convert file to base64 for local storage
  const reader = new FileReader();
  const base64Promise = new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
  reader.readAsDataURL(file);
  const base64Data = await base64Promise;
  
  // Store in localStorage
  const document = {
    id: docId,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    userId: user.userId,
    data: base64Data,
    storage: 'local'
  };
  
  // Get existing documents
  const existingDocs = JSON.parse(localStorage.getItem(`user_documents_${user.userId}`) || '[]');
  existingDocs.push(document);
  localStorage.setItem(`user_documents_${user.userId}`, JSON.stringify(existingDocs));
  
  console.log('✅ Document saved locally:', docId);
  return document;
}

export async function listDocuments() {
  if (!isLoggedIn()) return [];
  
  try {
    // Try cloud API first
    const cloudDocs = await api('/docs');
    return cloudDocs;
  } catch (error) {
    console.warn('☁️ Cloud API failed, using local storage:', error);
    // Fallback to local storage
    const user = getUser();
    const localDocs = JSON.parse(localStorage.getItem(`user_documents_${user.userId}`) || '[]');
    return localDocs;
  }
}
export async function deleteDocument(id) {
  try {
    // Try cloud API first
    return await api(`/docs/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (error) {
    console.warn('☁️ Cloud API failed, deleting from local storage:', error);
    // Fallback to local storage
    const user = getUser();
    const localDocs = JSON.parse(localStorage.getItem(`user_documents_${user.userId}`) || '[]');
    const filteredDocs = localDocs.filter(doc => doc.id !== id);
    localStorage.setItem(`user_documents_${user.userId}`, JSON.stringify(filteredDocs));
    return { success: true };
  }
}
export async function getDownloadUrl(key) {
  try {
    // Try cloud API first
    return await api(`/download-url?key=${encodeURIComponent(key)}`);
  } catch (error) {
    console.warn('☁️ Cloud API failed, using local data:', error);
    // For local documents, return the data directly
    const user = getUser();
    const localDocs = JSON.parse(localStorage.getItem(`user_documents_${user.userId}`) || '[]');
    const doc = localDocs.find(d => d.id === key || d.key === key);
    if (doc && doc.data) {
      return { url: doc.data };
    }
    throw new Error('Document not found');
  }
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
