/**
 * Service Worker für PWA-Funktionalität
 * Optimiert für den Bewerbungsmanager
 */

const CACHE_NAME = 'bewerbungsmanager-v1.0.0';
const urlsToCache = [
    '/',
    '/bewerbungsmanager-modern.html',
    '/css/advanced-features.css',
    '/js/complete-workflow-system.js',
    '/js/advanced-workflow-features.js',
    '/js/export-libraries.js',
    '/js/global-auth-system.js',
    '/js/real-aws-auth.js',
    '/js/auth-modals.js',
    '/Bewerbungsbild.jpeg'
];

// Install Event
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching app shell...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ App shell cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Cache failed:', error);
            })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('📦 Serving from cache:', event.request.url);
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        // Cache the response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/bewerbungsmanager-modern.html');
                        }
                    });
            })
    );
});

// Background Sync
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            syncOfflineData()
        );
    }
});

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('📱 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Neue Benachrichtigung vom Bewerbungsmanager',
        icon: '/Bewerbungsbild.jpeg',
        badge: '/Bewerbungsbild.jpeg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Öffnen',
                icon: '/Bewerbungsbild.jpeg'
            },
            {
                action: 'close',
                title: 'Schließen',
                icon: '/Bewerbungsbild.jpeg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Bewerbungsmanager', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/bewerbungsmanager-modern.html')
        );
    }
});

// Helper Functions
async function syncOfflineData() {
    try {
        console.log('🔄 Syncing offline data...');
        
        // Get offline data from IndexedDB or localStorage
        const offlineData = await getOfflineData();
        
        // Sync with server
        for (const data of offlineData) {
            try {
                await fetch('/api/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                console.log('✅ Data synced:', data.id);
            } catch (error) {
                console.error('❌ Sync failed for:', data.id, error);
            }
        }
        
        console.log('✅ Offline sync completed');
    } catch (error) {
        console.error('❌ Offline sync failed:', error);
    }
}

async function getOfflineData() {
    // This would typically read from IndexedDB
    // For now, return empty array
    return [];
}

// Message Handling
self.addEventListener('message', (event) => {
    console.log('📨 Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('🔧 Service Worker loaded');
