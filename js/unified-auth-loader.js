/**
 * UNIFIED AUTH LOADER
 * Lädt alle Auth-Komponenten und stellt sie global zur Verfügung
 * Sollte auf allen Seiten geladen werden
 */

(function() {
    'use strict';

    console.log('📦 Loading Unified Auth System...');

    // Prüfe ob bereits geladen
    if (window.unifiedAuthLoaded) {
        console.log('⚠️ Unified Auth bereits geladen');
        return;
    }

    window.unifiedAuthLoaded = true;

    /**
     * Lädt Auth Modals HTML
     */
    async function loadAuthModals() {
        const containerId = 'authModalsContainer';
        let container = document.getElementById(containerId);
        
        // Container erstellen falls nicht vorhanden
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            document.body.appendChild(container);
        }

        // Prüfe ob bereits geladen
        if (container.innerHTML.trim() !== '') {
            console.log('✅ Auth Modals bereits geladen');
            return;
        }

        try {
            const response = await fetch('components/unified-auth-modals.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            container.innerHTML = html;
            console.log('✅ Auth Modals loaded');
        } catch (error) {
            console.error('❌ Error loading auth modals:', error);
            // Fallback: Leerer Container
            container.innerHTML = '<!-- Auth Modals werden geladen... -->';
        }
    }

    /**
     * Lädt alle Auth-Skripte in der richtigen Reihenfolge
     */
    function loadAuthScripts() {
        return new Promise((resolve, reject) => {
            // Script-Ladereihenfolge
            const scripts = [
                // 1. AWS SDK (wenn noch nicht geladen)
                {
                    src: 'https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js',
                    condition: () => typeof AWS === 'undefined',
                    name: 'AWS SDK'
                },
                // 2. Unified Auth System
                {
                    src: 'js/unified-aws-auth.js',
                    condition: () => !window.awsAuth,
                    name: 'Unified AWS Auth'
                },
                // 3. Unified Auth Modals
                {
                    src: 'js/unified-auth-modals.js',
                    condition: () => !window.authModals,
                    name: 'Unified Auth Modals'
                }
            ];

            let loadedCount = 0;
            let totalToLoad = 0;

            // Zähle wie viele tatsächlich geladen werden müssen
            scripts.forEach(script => {
                if (!script.condition || script.condition()) {
                    totalToLoad++;
                }
            });

            if (totalToLoad === 0) {
                console.log('✅ Alle Auth-Skripte bereits geladen');
                resolve();
                return;
            }

            // Lade alle benötigten Skripte
            scripts.forEach((script, index) => {
                // Überspringe wenn Bedingung nicht erfüllt
                if (script.condition && !script.condition()) {
                    console.log(`⏭️ Skipping ${script.name} (already loaded)`);
                    return;
                }

                // Prüfe ob bereits geladen
                const existingScript = document.querySelector(`script[src="${script.src}"]`);
                if (existingScript) {
                    console.log(`⏭️ ${script.name} already in DOM`);
                    loadedCount++;
                    if (loadedCount === totalToLoad) {
                        resolve();
                    }
                    return;
                }

                const scriptElement = document.createElement('script');
                scriptElement.src = script.src;
                scriptElement.async = false; // Wichtig für Reihenfolge

                scriptElement.onload = () => {
                    console.log(`✅ ${script.name} loaded`);
                    loadedCount++;
                    if (loadedCount === totalToLoad) {
                        resolve();
                    }
                };

                scriptElement.onerror = () => {
                    console.error(`❌ Failed to load ${script.name}`);
                    loadedCount++;
                    if (loadedCount === totalToLoad) {
                        // Resolve auch bei Fehler, damit System weiterläuft
                        resolve();
                    }
                };

                // Füge Script hinzu
                document.head.appendChild(scriptElement);
            });
        });
    }

    /**
     * Initialisiert das gesamte Auth-System
     */
    async function initializeAuthSystem() {
        try {
            // Warte auf DOM
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Lade Modals
            await loadAuthModals();

            // Lade Skripte
            await loadAuthScripts();

            // Warte kurz auf Initialisierung
            await new Promise(resolve => setTimeout(resolve, 500));

            // Prüfe Status
            const authReady = window.awsAuth && window.awsAuth.isInitialized;
            const modalsReady = window.authModals !== undefined;

            if (authReady && modalsReady) {
                console.log('✅ Unified Auth System vollständig geladen und initialisiert');
                
                // Event: Auth System Ready
                window.dispatchEvent(new CustomEvent('unifiedAuthReady', {
                    detail: {
                        auth: window.awsAuth,
                        modals: window.authModals
                    }
                }));
            } else {
                console.warn('⚠️ Unified Auth System teilweise geladen:', {
                    auth: authReady,
                    modals: modalsReady
                });
            }

        } catch (error) {
            console.error('❌ Error initializing auth system:', error);
        }
    }

    /**
     * Setup Login Button Listeners
     */
    function setupLoginButtons() {
        // Warte auf Auth System
        const checkAuth = setInterval(() => {
            if (window.awsAuth && window.authModals) {
                clearInterval(checkAuth);
                
                // Finde alle Login-Buttons und füge Event Listener hinzu
                const loginButtons = document.querySelectorAll(
                    '.nav-login-btn, .login-btn, button[onclick*="login"], button[onclick*="Login"], #realAuthButton'
                );

                loginButtons.forEach(btn => {
                    // Entferne alte onclick Handler
                    btn.onclick = null;
                    
                    // Füge neuen Listener hinzu
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (window.awsAuth && window.awsAuth.isLoggedIn()) {
                            // Benutzer ist angemeldet - zeige Profil
                            const userData = window.awsAuth.getUserDataFromToken();
                            if (userData) {
                                // Optional: Weiterleitung zum Profil
                                // window.location.href = 'user-profile.html';
                            }
                        } else {
                            // Benutzer nicht angemeldet - zeige Login
                            if (window.authModals) {
                                window.authModals.showLogin();
                            }
                        }
                    });
                });

                // Finde Logout-Buttons
                const logoutButtons = document.querySelectorAll(
                    '.logout-btn, button[onclick*="logout"], button[onclick*="Logout"]'
                );

                logoutButtons.forEach(btn => {
                    btn.onclick = null;
                    btn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        if (window.awsAuth) {
                            await window.awsAuth.logout();
                        }
                    });
                });

                console.log('✅ Login/Logout buttons configured');
            }
        }, 100);

        // Timeout nach 10 Sekunden
        setTimeout(() => {
            clearInterval(checkAuth);
        }, 10000);
    }

    // Initialisierung starten
    initializeAuthSystem().then(() => {
        setupLoginButtons();
    });

    // Expose Helper Functions
    window.showLogin = () => {
        if (window.authModals) {
            window.authModals.showLogin();
        }
    };

    window.showRegister = () => {
        if (window.authModals) {
            window.authModals.showRegister();
        }
    };

    window.logout = async () => {
        if (window.awsAuth) {
            await window.awsAuth.logout();
        }
    };

    console.log('✅ Unified Auth Loader initialized');
})();

