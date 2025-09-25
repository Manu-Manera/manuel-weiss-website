/**
 * Cache Buster
 * Löst Browser-Cache Probleme
 */

(function() {
    'use strict';
    
    console.log('🧹 Cache Buster - Starting...');
    
    const VERSION = Date.now();
    
    // Cache-Control Headers setzen
    function setCacheHeaders() {
        const metas = [
            { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
            { httpEquiv: 'Pragma', content: 'no-cache' },
            { httpEquiv: 'Expires', content: '0' }
        ];
        
        metas.forEach(meta => {
            const element = document.createElement('meta');
            element.setAttribute('http-equiv', meta.httpEquiv);
            element.setAttribute('content', meta.content);
            document.head.appendChild(element);
        });
        
        console.log('✅ Cache headers set');
    }
    
    // ServiceWorker löschen
    async function clearServiceWorkers() {
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
                console.log('✅ ServiceWorkers cleared');
            } catch (error) {
                console.log('ℹ️ No ServiceWorkers to clear');
            }
        }
    }
    
    // Browser-Cache löschen
    function clearBrowserCache() {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
    }
    
    // Force reload Funktion
    function forceReload() {
        // URL mit Timestamp versehen
        const url = new URL(window.location);
        url.searchParams.set('v', VERSION);
        
        // Hard reload
        window.location.href = url.toString();
    }
    
    // Cache-Status anzeigen
    function showCacheStatus() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 10000;
            background: #1f2937; color: white; padding: 1rem; border-radius: 8px;
            font-size: 0.875rem; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        notification.innerHTML = `
            <div style="margin-bottom: 0.5rem; font-weight: 600;">🧹 Cache-Status</div>
            <div>Version: ${VERSION}</div>
            <div style="margin-top: 0.5rem;">
                <button onclick="window.location.reload(true)" style="background: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">
                    Hard Reload
                </button>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #6b7280; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                    OK
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    
    // Initialisierung
    function initialize() {
        console.log(`🧹 Cache Buster - Version: ${VERSION}`);
        
        setCacheHeaders();
        clearServiceWorkers();
        clearBrowserCache();
        
        // Cache-Status nur im privaten Modus nicht anzeigen
        const isPrivate = !window.indexedDB;
        if (!isPrivate) {
            setTimeout(showCacheStatus, 2000);
        }
        
        console.log('✅ Cache Buster - Ready');
    }
    
    // Starten
    initialize();
    
})();
