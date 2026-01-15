/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVICE WORKER - PWA Offline Support
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CACHE_NAME = 'bewerbungsmanager-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Static files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/applications/dashboard.html',
    '/applications/resume-editor.html',
    '/applications/cover-letter-editor.html',
    '/applications/interview-prep.html',
    '/applications/css/applications-main.css',
    '/applications/css/resume-editor.css',
    '/applications/css/cover-letter-editor.css',
    '/applications/css/inline-suggestions.css',
    '/applications/css/job-match.css',
    '/applications/css/interview-prep.css',
    '/applications/css/split-view.css',
    '/applications/css/analytics.css',
    '/applications/css/collaboration.css',
    '/applications/js/inline-ai-coach.js',
    '/applications/js/job-match-analyzer.js',
    '/applications/js/industry-templates.js',
    '/applications/js/linkedin-import.js',
    '/applications/js/interview-prep.js',
    '/applications/js/split-view-editor.js',
    '/applications/js/analytics.js',
    '/applications/js/collaboration.js',
    '/js/cloud-data-service.js',
    '/js/user-profile.js',
    // External resources
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Pre-caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Static files cached');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Error caching static files:', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                        .map(name => {
                            console.log('[SW] Removing old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip API calls - always go to network
    if (url.pathname.includes('.netlify/functions') || 
        url.hostname.includes('api.openai.com') ||
        url.hostname.includes('amazonaws.com')) {
        event.respondWith(fetch(request));
        return;
    }
    
    // For HTML pages - network first, then cache
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Clone and cache the response
                    const clonedResponse = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Return offline page if available
                            return caches.match('/offline.html');
                        });
                })
        );
        return;
    }
    
    // For static assets - cache first, then network
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version, but also fetch fresh version in background
                    fetch(request).then(response => {
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, response);
                        });
                    });
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                return fetch(request)
                    .then(response => {
                        // Clone and cache the response
                        const clonedResponse = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(request, clonedResponse);
                        });
                        return response;
                    });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-profile-data') {
        event.waitUntil(syncProfileData());
    }
    
    if (event.tag === 'sync-applications') {
        event.waitUntil(syncApplications());
    }
});

// Sync profile data when online
async function syncProfileData() {
    try {
        const db = await openIndexedDB();
        const pendingUpdates = await getFromIndexedDB(db, 'pending-profile-updates');
        
        for (const update of pendingUpdates) {
            await fetch('/.netlify/functions/user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(update)
            });
        }
        
        await clearFromIndexedDB(db, 'pending-profile-updates');
        
    } catch (error) {
        console.error('[SW] Error syncing profile data:', error);
    }
}

// Sync applications when online
async function syncApplications() {
    try {
        const db = await openIndexedDB();
        const pendingApps = await getFromIndexedDB(db, 'pending-applications');
        
        for (const app of pendingApps) {
            await fetch('/.netlify/functions/user-data?path=/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(app)
            });
        }
        
        await clearFromIndexedDB(db, 'pending-applications');
        
    } catch (error) {
        console.error('[SW] Error syncing applications:', error);
    }
}

// IndexedDB helpers
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BewerbungsmanagerDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('pending-profile-updates')) {
                db.createObjectStore('pending-profile-updates', { keyPath: 'id', autoIncrement: true });
            }
            
            if (!db.objectStoreNames.contains('pending-applications')) {
                db.createObjectStore('pending-applications', { keyPath: 'id', autoIncrement: true });
            }
            
            if (!db.objectStoreNames.contains('cached-data')) {
                db.createObjectStore('cached-data', { keyPath: 'key' });
            }
        };
    });
}

function getFromIndexedDB(db, storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function clearFromIndexedDB(db, storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

// Push notifications
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    
    const options = {
        body: data.body || 'Neue Benachrichtigung',
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/applications/dashboard.html'
        },
        actions: [
            { action: 'open', title: 'Öffnen' },
            { action: 'dismiss', title: 'Schließen' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Bewerbungsmanager', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'dismiss') return;
    
    const url = event.notification.data?.url || '/applications/dashboard.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url.includes(url) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                return clients.openWindow(url);
            })
    );
});

console.log('[SW] Service Worker script loaded');
