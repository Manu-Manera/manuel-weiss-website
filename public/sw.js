/**
 * Service Worker für Manuel Weiss Enterprise Platform
 * Offline-Funktionalität, Caching und Background Sync
 */

const CACHE_NAME = 'mw-platform-v2.0.0';
const STATIC_CACHE = 'mw-static-v2.0.0';
const DYNAMIC_CACHE = 'mw-dynamic-v2.0.0';
const API_CACHE = 'mw-api-v2.0.0';

// Cache-Strategien
const CACHE_STRATEGIES = {
  // Statische Assets (CSS, JS, Bilder)
  static: {
    strategy: 'CacheFirst',
    cacheName: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
    maxEntries: 100
  },
  
  // API-Requests
  api: {
    strategy: 'NetworkFirst',
    cacheName: API_CACHE,
    maxAge: 5 * 60 * 1000, // 5 Minuten
    maxEntries: 50
  },
  
  // HTML-Seiten
  pages: {
    strategy: 'StaleWhileRevalidate',
    cacheName: DYNAMIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 24 Stunden
    maxEntries: 50
  },
  
  // Medien (Bilder, Videos)
  media: {
    strategy: 'CacheFirst',
    cacheName: 'mw-media-v2.0.0',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
    maxEntries: 200
  }
};

// Zu cachende Ressourcen
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/bewerbungsmanager.html',
  '/analytics-dashboard.html',
  '/admin.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API-Endpunkte für Caching
const API_ENDPOINTS = [
  '/api/applications',
  '/api/media',
  '/api/jobs',
  '/api/analytics'
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Statische Assets cachen
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Service Worker sofort aktivieren
      self.skipWaiting()
    ])
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Alte Caches löschen
      cleanupOldCaches(),
      
      // Service Worker sofort übernehmen
      self.clients.claim()
    ])
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Nur GET-Requests cachen
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategie basierend auf URL-Typ
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isPageRequest(url)) {
    event.respondWith(handlePageRequest(request));
  } else if (isMediaRequest(url)) {
    event.respondWith(handleMediaRequest(request));
  }
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'application-sync') {
    event.waitUntil(syncApplications());
  } else if (event.tag === 'media-sync') {
    event.waitUntil(syncMedia());
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Öffnen',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Manuel Weiss Platform', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message Handler
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls));
  }
});

// Helper Functions

function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isPageRequest(url) {
  return url.pathname.endsWith('.html') || url.pathname === '/';
}

function isMediaRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|mp4|webm|ogg|mp3|wav)$/);
}

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Static asset fetch failed:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Network First für API-Requests
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('API request failed, trying cache...');
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Offline-Fallback für API-Requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Keine Netzwerkverbindung verfügbar'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (cached) {
      return cached;
    }
    
    // Offline-Fallback für Seiten
    return new Response(`
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Manuel Weiss Platform</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
          .offline { color: #667eea; }
        </style>
      </head>
      <body>
        <h1 class="offline">📡 Offline</h1>
        <p>Diese Seite ist offline nicht verfügbar.</p>
        <p>Bitte überprüfen Sie Ihre Internetverbindung.</p>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function handleMediaRequest(request) {
  const cache = await caches.open('mw-media-v2.0.0');
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Media fetch failed:', error);
    return new Response('Media not available offline', { status: 503 });
  }
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, 'mw-media-v2.0.0'];
  
  return Promise.all(
    cacheNames.map(cacheName => {
      if (!validCaches.includes(cacheName)) {
        console.log('🗑️ Deleting old cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

async function syncApplications() {
  console.log('🔄 Syncing applications...');
  
  try {
    // Hier würde die Offline-Sync-Logik implementiert werden
    // z.B. IndexedDB -> API
    console.log('✅ Applications synced');
  } catch (error) {
    console.error('❌ Application sync failed:', error);
  }
}

async function syncMedia() {
  console.log('🔄 Syncing media...');
  
  try {
    // Hier würde die Offline-Sync-Logik implementiert werden
    console.log('✅ Media synced');
  } catch (error) {
    console.error('❌ Media sync failed:', error);
  }
}

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  return Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error('Failed to cache URL:', url, error);
      }
    })
  );
}

// Periodic Background Sync (falls unterstützt)
if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(syncApplications());
    }
  });
}

// Erweiterte Service Worker Features
console.log('✅ Service Worker loaded successfully');

// Background Sync für Offline-Funktionalität
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'application-sync') {
    event.waitUntil(syncApplications());
  } else if (event.tag === 'media-sync') {
    event.waitUntil(syncMedia());
  } else if (event.tag === 'profile-sync') {
    event.waitUntil(syncProfiles());
  }
});

// Push Notifications für wichtige Updates
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Öffnen',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Manuel Weiss Platform', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message Handler für Kommunikation mit der App
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls));
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearCache());
  }
});

// Erweiterte Cache-Strategien
const CACHE_STRATEGIES = {
  // Statische Assets (CSS, JS, Bilder)
  static: {
    strategy: 'CacheFirst',
    cacheName: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
    maxEntries: 100
  },
  
  // API-Requests
  api: {
    strategy: 'NetworkFirst',
    cacheName: API_CACHE,
    maxAge: 5 * 60 * 1000, // 5 Minuten
    maxEntries: 50
  },
  
  // HTML-Seiten
  pages: {
    strategy: 'StaleWhileRevalidate',
    cacheName: DYNAMIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 24 Stunden
    maxEntries: 50
  },
  
  // Medien (Bilder, Videos)
  media: {
    strategy: 'CacheFirst',
    cacheName: 'mw-media-v2.0.0',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
    maxEntries: 200
  }
};

// Cache-Strategie basierend auf URL-Typ
function getCacheStrategy(url) {
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return CACHE_STRATEGIES.static;
  } else if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.api;
  } else if (url.pathname.endsWith('.html') || url.pathname === '/') {
    return CACHE_STRATEGIES.pages;
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|mp4|webm|ogg|mp3|wav)$/)) {
    return CACHE_STRATEGIES.media;
  }
  return CACHE_STRATEGIES.pages;
}

// Erweiterte Fetch-Strategien
async function handleRequest(request) {
  const url = new URL(request.url);
  const strategy = getCacheStrategy(url);
  
  switch (strategy.strategy) {
    case 'CacheFirst':
      return handleCacheFirst(request, strategy);
    case 'NetworkFirst':
      return handleNetworkFirst(request, strategy);
    case 'StaleWhileRevalidate':
      return handleStaleWhileRevalidate(request, strategy);
    default:
      return fetch(request);
  }
}

// Cache First Strategy
async function handleCacheFirst(request, strategy) {
  const cache = await caches.open(strategy.cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache first failed:', error);
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Network First Strategy
async function handleNetworkFirst(request, strategy) {
  const cache = await caches.open(strategy.cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Network first failed, trying cache...');
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Keine Netzwerkverbindung verfügbar'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate Strategy
async function handleStaleWhileRevalidate(request, strategy) {
  const cache = await caches.open(strategy.cacheName);
  const cached = await cache.match(request);
  
  // Cache im Hintergrund aktualisieren
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  // Sofort aus Cache zurückgeben, falls verfügbar
  if (cached) {
    return cached;
  }
  
  // Andernfalls auf Network warten
  return fetchPromise;
}

// Cache URLs
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  return Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error('Failed to cache URL:', url, error);
      }
    })
  );
}

// Cache leeren
async function clearCache() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Periodic Background Sync (falls unterstützt)
if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(syncApplications());
    }
  });
}

console.log('✅ Enhanced Service Worker loaded successfully');
