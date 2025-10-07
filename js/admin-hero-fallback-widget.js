// =================== ADMIN HERO FALLBACK WIDGET ===================
// Widget für das Admin Panel zur Verwaltung von Hero-Fallback-Daten

/**
 * ADMIN HERO FALLBACK WIDGET
 * - Einfache Buttons zur Fallback-Verwaltung
 * - Integration in das Admin Panel
 * - Backup & Restore Funktionalität
 */

function createHeroFallbackWidget() {
    const widget = document.createElement('div');
    widget.id = 'hero-fallback-widget';
    widget.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        padding: 1rem;
        border: 2px solid #e5e7eb;
        z-index: 1000;
        min-width: 280px;
    `;
    
    widget.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h4 style="margin: 0; color: #374151; font-size: 0.875rem; font-weight: 600;">
                <i class="fas fa-shield-alt" style="color: #10b981; margin-right: 0.5rem;"></i>
                Hero Fallback
            </h4>
            <button onclick="toggleHeroFallbackWidget()" style="background: none; border: none; color: #6b7280; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div style="display: grid; gap: 0.5rem;">
            <button onclick="window.restoreHeroFallback()" style="
                background: #10b981; 
                color: white; 
                border: none; 
                padding: 0.5rem 1rem; 
                border-radius: 6px; 
                cursor: pointer; 
                font-size: 0.75rem;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                <i class="fas fa-undo"></i> Fallback wiederherstellen
            </button>
            
            <button onclick="window.createHeroBackup()" style="
                background: #3b82f6; 
                color: white; 
                border: none; 
                padding: 0.5rem 1rem; 
                border-radius: 6px; 
                cursor: pointer; 
                font-size: 0.75rem;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                <i class="fas fa-save"></i> Aktuelles Backup erstellen
            </button>
            
            <button onclick="window.showHeroFallbackInfo()" style="
                background: #f59e0b; 
                color: white; 
                border: none; 
                padding: 0.5rem 1rem; 
                border-radius: 6px; 
                cursor: pointer; 
                font-size: 0.75rem;
                font-weight: 600;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                <i class="fas fa-info"></i> Fallback Info
            </button>
        </div>
        
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb; font-size: 0.625rem; color: #6b7280;">
            💾 Fallback-Daten: ${new Date().toLocaleDateString()}<br>
            🔧 Für Admin & Notfälle
        </div>
    `;
    
    return widget;
}

// Widget Toggle Funktionen
window.showHeroFallbackWidget = function() {
    let existingWidget = document.getElementById('hero-fallback-widget');
    
    if (!existingWidget) {
        const widget = createHeroFallbackWidget();
        document.body.appendChild(widget);
        
        // Fade-in Animation
        widget.style.opacity = '0';
        widget.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            widget.style.transition = 'all 0.3s ease';
            widget.style.opacity = '1';
            widget.style.transform = 'translateY(0)';
        }, 10);
        
        console.log('✅ Hero Fallback Widget gezeigt');
    } else {
        existingWidget.style.display = 'block';
    }
};

window.hideHeroFallbackWidget = function() {
    const widget = document.getElementById('hero-fallback-widget');
    if (widget) {
        widget.style.display = 'none';
        console.log('✅ Hero Fallback Widget ausgeblendet');
    }
};

window.toggleHeroFallbackWidget = function() {
    const widget = document.getElementById('hero-fallback-widget');
    if (widget && widget.style.display !== 'none') {
        window.hideHeroFallbackWidget();
    } else {
        window.showHeroFallbackWidget();
    }
};

// Auto-Show im Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    // Nur im Admin Panel anzeigen
    if (window.location.pathname.includes('admin.html') || 
        document.body.classList.contains('admin-panel')) {
        
        // Nach 2 Sekunden anzeigen
        setTimeout(() => {
            window.showHeroFallbackWidget();
        }, 2000);
    }
});

// Keyboard Shortcut: Ctrl+Alt+H
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.altKey && e.key === 'h') {
        e.preventDefault();
        window.toggleHeroFallbackWidget();
    }
});

console.log('✅ Admin Hero Fallback Widget geladen (Shortcut: Ctrl+Alt+H)');
