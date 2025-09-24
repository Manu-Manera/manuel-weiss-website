/**
 * Button System Loader
 * Include this single file to enable the button system on any page
 */

(function() {
    'use strict';
    
    console.log('[ButtonSystemLoader] Loading button system...');
    
    // Check if already loaded
    if (window._buttonSystemLoaded) {
        console.log('[ButtonSystemLoader] Already loaded');
        return;
    }
    
    window._buttonSystemLoaded = true;
    
    // Load CSS
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    
    // Load Script
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = () => console.error(`Failed to load: ${src}`);
        document.body.appendChild(script);
    }
    
    // Get base path
    const currentScript = document.currentScript;
    const basePath = currentScript ? currentScript.src.replace(/\/js\/[^\/]+$/, '') : '';
    
    // Load button system CSS
    loadCSS(basePath + '/css/button-system.css');
    
    // Load scripts in order
    loadScript(basePath + '/js/event-registry.js', () => {
        loadScript(basePath + '/js/button-components.js', () => {
            loadScript(basePath + '/js/register-all-buttons.js', () => {
                console.log('[ButtonSystemLoader] All components loaded');
                
                // Initialize when DOM is ready
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initializeButtonSystem);
                } else {
                    initializeButtonSystem();
                }
            });
        });
    });
    
    function initializeButtonSystem() {
        console.log('[ButtonSystemLoader] Initializing button system...');
        
        // Auto-detect page type and register appropriate handlers
        const pathname = window.location.pathname;
        
        if (pathname.includes('admin')) {
            console.log('[ButtonSystemLoader] Admin page detected');
            registerAdminHandlers();
        } else if (pathname.includes('persoenlichkeitsentwicklung')) {
            console.log('[ButtonSystemLoader] Personality development page detected');
            registerPersonalityHandlers();
        } else if (pathname.includes('bewerbung')) {
            console.log('[ButtonSystemLoader] Application page detected');
            registerApplicationHandlers();
        }
        
        // Register common handlers
        registerCommonHandlers();
        
        console.log('[ButtonSystemLoader] Button system ready!');
    }
    
    function registerCommonHandlers() {
        if (!window.eventRegistry) return;
        
        window.eventRegistry.registerBulk({
            'toggle-menu': {
                handler: () => {
                    const menu = document.querySelector('.mobile-menu, .nav-menu');
                    if (menu) menu.classList.toggle('active');
                },
                description: 'Toggle mobile menu'
            },
            'scroll-top': {
                handler: () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                description: 'Scroll to top'
            },
            'print': {
                handler: () => window.print(),
                description: 'Print page'
            },
            'share': {
                handler: () => {
                    if (navigator.share) {
                        navigator.share({
                            title: document.title,
                            url: window.location.href
                        });
                    } else {
                        // Fallback - copy to clipboard
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link kopiert!');
                    }
                },
                description: 'Share page'
            }
        });
    }
    
    function registerAdminHandlers() {
        // Admin-specific handlers are already in register-all-buttons.js
    }
    
    function registerPersonalityHandlers() {
        if (!window.eventRegistry) return;
        
        window.eventRegistry.registerBulk({
            'start-method': {
                handler: (event, element) => {
                    const method = element.getAttribute('data-method');
                    if (method) {
                        window.location.href = `/methods/${method}/${method}.html`;
                    }
                },
                description: 'Start personality development method'
            },
            'save-progress': {
                handler: () => {
                    console.log('[ButtonSystem] Saving progress...');
                    // Progress saving logic
                },
                description: 'Save workflow progress'
            }
        });
    }
    
    function registerApplicationHandlers() {
        if (!window.eventRegistry) return;
        
        window.eventRegistry.registerBulk({
            'download-pdf': {
                handler: () => {
                    console.log('[ButtonSystem] Downloading PDF...');
                    // PDF download logic
                },
                description: 'Download application as PDF'
            },
            'send-application': {
                handler: () => {
                    console.log('[ButtonSystem] Sending application...');
                    // Send application logic
                },
                description: 'Send application'
            }
        });
    }
    
    // Expose migration function globally
    window.migratePageButtons = function() {
        if (window.autoMigrateButtons) {
            return window.autoMigrateButtons();
        } else {
            console.error('[ButtonSystemLoader] Migration tool not loaded');
            loadScript(basePath + '/js/migrate-buttons.js', () => {
                window.autoMigrateButtons();
            });
        }
    };
    
})();
