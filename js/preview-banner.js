/**
 * Preview/Test Environment Banner
 * Zeigt einen Banner an, um die Test-Umgebung zu kennzeichnen
 */

(function() {
    'use strict';
    
    // Prüfe ob Preview-Banner angezeigt werden soll
    const isPreview = true; // Auf false setzen um Banner zu deaktivieren
    const showBanner = localStorage.getItem('hidePreviewBanner') !== 'true';
    
    if (!isPreview || !showBanner) return;
    
    // Warte auf DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBanner);
    } else {
        createBanner();
    }
    
    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'preview-banner';
        banner.innerHTML = `
            <div class="preview-banner-content">
                <span class="preview-badge">🧪 PREVIEW</span>
                <span class="preview-text">Test-Umgebung - Änderungen werden hier getestet</span>
                <button class="preview-close" onclick="closePreviewBanner()" title="Für diese Session ausblenden">×</button>
            </div>
        `;
        
        // Styles
        const styles = document.createElement('style');
        styles.textContent = `
            #preview-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 8px 16px;
                z-index: 99999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            
            .preview-banner-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .preview-badge {
                background: rgba(0,0,0,0.2);
                padding: 4px 10px;
                border-radius: 4px;
                font-weight: 600;
                font-size: 11px;
                letter-spacing: 0.5px;
            }
            
            .preview-text {
                opacity: 0.95;
            }
            
            .preview-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                margin-left: auto;
                transition: background 0.2s;
            }
            
            .preview-close:hover {
                background: rgba(255,255,255,0.3);
            }
            
            /* Verschiebe den Body-Inhalt nach unten */
            body.has-preview-banner {
                padding-top: 40px !important;
            }
            
            body.has-preview-banner .navbar {
                top: 40px !important;
            }
            
            @media (max-width: 600px) {
                .preview-text {
                    display: none;
                }
                
                #preview-banner {
                    padding: 6px 12px;
                }
            }
        `;
        
        document.head.appendChild(styles);
        document.body.insertBefore(banner, document.body.firstChild);
        document.body.classList.add('has-preview-banner');
    }
    
    // Global function to close banner
    window.closePreviewBanner = function() {
        const banner = document.getElementById('preview-banner');
        if (banner) {
            banner.style.display = 'none';
            document.body.classList.remove('has-preview-banner');
            // Für diese Session merken
            sessionStorage.setItem('hidePreviewBanner', 'true');
        }
    };
    
    // Prüfe Session Storage
    if (sessionStorage.getItem('hidePreviewBanner') === 'true') {
        // Banner nicht anzeigen für diese Session
        const checkBanner = setInterval(() => {
            const banner = document.getElementById('preview-banner');
            if (banner) {
                banner.style.display = 'none';
                document.body.classList.remove('has-preview-banner');
                clearInterval(checkBanner);
            }
        }, 100);
    }
})();
