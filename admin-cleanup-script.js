// 🧹 Admin Panel Cleanup Script - Entfernt veraltete Funktionen
// Modernisiert Event-Handler und bereinigt Legacy-Code

(function() {
    'use strict';
    
    console.log('🧹 Starting Admin Panel Cleanup...');
    
    // 🚨 Deprecated Functions - These will be removed
    const deprecatedFunctions = [
        'showNewApplicationModal',
        'closeNewApplicationModal', 
        'addNewApplication',
        'filterApplications',
        'editApplication',
        'deleteApplication'
    ];
    
    // Mark deprecated functions
    deprecatedFunctions.forEach(funcName => {
        if (window[funcName] && typeof window[funcName] === 'function') {
            const originalFunc = window[funcName];
            
            window[funcName] = function(...args) {
                console.warn(`⚠️ DEPRECATED: ${funcName}() is deprecated. Use applications-modern.html instead.`);
                
                // Show modern migration notice
                showMigrationNotice(funcName);
                
                // Still execute original function as fallback
                return originalFunc.apply(this, args);
            };
        }
    });
    
    // 🔄 Modern Function Replacements
    window.modernAdminFunctions = {
        // Redirect to modern application management
        openApplications: () => {
            const currentUrl = window.location.href;
            const newUrl = currentUrl.replace(/admin\.html.*$/, 'applications-modern.html');
            
            // Use View Transition if available
            if ('startViewTransition' in document) {
                document.startViewTransition(() => {
                    window.location.href = newUrl;
                });
            } else {
                window.location.href = newUrl;
            }
        },
        
        // Show migration notice
        showApplicationMigration: () => {
            showMigrationNotice('applications');
        },
        
        // Clean up legacy elements
        cleanupLegacyElements: () => {
            cleanupDeprecatedElements();
        }
    };
    
    // 🔔 Migration Notice System
    function showMigrationNotice(context) {
        // Don't show if already shown recently
        const lastShown = localStorage.getItem(`migration_notice_${context}`);
        if (lastShown && Date.now() - parseInt(lastShown) < 24 * 60 * 60 * 1000) {
            return;
        }
        
        const notice = document.createElement('div');
        notice.className = 'migration-notice-modal';
        notice.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            animation: fadeIn 0.3s ease-out;
        `;
        
        notice.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 3rem;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUpIn 0.4s ease-out;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🚀</div>
                <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem;">
                    Moderne Architektur verfügbar!
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
                    Die ${context === 'applications' ? 'Bewerbungsverwaltung' : 'Funktion'} ist jetzt mit modernster 
                    Technologie verfügbar: KI-Integration, Real-time Analytics, Mobile-optimiert.
                </p>
                
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="applications-modern.html" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 1rem 2rem;
                        border-radius: 12px;
                        text-decoration: none;
                        font-weight: 600;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-arrow-right"></i>
                        Jetzt upgraden
                    </a>
                    
                    <button onclick="this.closest('.migration-notice-modal').remove()" style="
                        background: #e5e7eb;
                        color: #6b7280;
                        padding: 1rem 2rem;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    ">
                        Später
                    </button>
                </div>
                
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <label style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; color: #9ca3af; font-size: 0.875rem; cursor: pointer;">
                        <input type="checkbox" onchange="if(this.checked) localStorage.setItem('migration_notice_${context}', Date.now().toString())">
                        24h nicht mehr anzeigen
                    </label>
                </div>
            </div>
        `;
        
        document.body.appendChild(notice);
        
        // Add styles for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUpIn {
                from { 
                    opacity: 0;
                    transform: translateY(30px) scale(0.9);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (notice.parentNode) {
                notice.style.animation = 'fadeOut 0.3s ease-in forwards';
                setTimeout(() => notice.remove(), 300);
            }
        }, 10000);
    }
    
    // 🧹 Cleanup deprecated elements
    function cleanupDeprecatedElements() {
        const elementsToCleanup = [
            // Old application form elements
            '#newApplicationForm input[name="old-field"]',
            // Deprecated buttons
            'button[data-deprecated="true"]',
            // Legacy modals
            '.old-modal-structure',
            // Unused CSS classes
            '.deprecated-class'
        ];
        
        elementsToCleanup.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                console.log(`🗑️ Removing deprecated element: ${selector}`);
                element.remove();
            });
        });
    }
    
    // 🎯 Modern Event Handler Replacements
    function modernizeEventHandlers() {
        // Replace old onclick handlers with modern event listeners
        const legacyButtons = document.querySelectorAll('[data-action="new-application"]');
        
        legacyButtons.forEach(button => {
            // Remove old handler
            button.removeAttribute('onclick');
            button.setAttribute('data-action', 'show-modern-applications');
            
            // Add modern handler
            button.addEventListener('click', (e) => {
                e.preventDefault();
                window.modernAdminFunctions.showApplicationMigration();
            });
        });
        
        // Update filter buttons to show migration
        const filterButtons = document.querySelectorAll('[data-action="filter-applications"]');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                showMigrationNotice('applications');
            });
        });
    }
    
    // 📊 Performance Optimizations for Admin Panel
    function optimizeAdminPerformance() {
        // Lazy load heavy sections
        const heavySections = document.querySelectorAll('.admin-section');
        
        heavySections.forEach(section => {
            if (section.id !== 'dashboard') {
                // Add content-visibility for performance
                section.style.contentVisibility = 'auto';
                section.style.containIntrinsicSize = '400px';
            }
        });
        
        // Debounce search inputs
        const searchInputs = document.querySelectorAll('input[type="search"], input[data-search="true"]');
        searchInputs.forEach(input => {
            let timeout;
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    // Process search with modern method
                    console.log('🔍 Search (modern):', e.target.value);
                }, 300);
            });
        });
    }
    
    // 🎨 Apply Modern Styling Classes
    function applyModernStyling() {
        // Add modern classes to existing elements
        const elements = [
            { selector: '.admin-container', class: 'modern-admin-container' },
            { selector: '.admin-sidebar', class: 'modern-admin-sidebar' },
            { selector: '.admin-header', class: 'modern-admin-header' },
            { selector: '.stat-card', class: 'modern-stat-card' }
        ];
        
        elements.forEach(({ selector, class: className }) => {
            const els = document.querySelectorAll(selector);
            els.forEach(el => el.classList.add(className));
        });
        
        // Remove deprecated classes
        const deprecatedClasses = [
            'old-button-style',
            'legacy-card',
            'deprecated-layout'
        ];
        
        deprecatedClasses.forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(el => el.classList.remove(className));
        });
    }
    
    // 🔧 Initialize Admin Modernization
    function initializeModernAdmin() {
        try {
            modernizeEventHandlers();
            optimizeAdminPerformance();
            applyModernStyling();
            
            // Add modern admin capabilities
            window.modernAdmin = {
                openApplications: window.modernAdminFunctions.openApplications,
                showMigration: window.modernAdminFunctions.showApplicationMigration,
                cleanup: window.modernAdminFunctions.cleanupLegacyElements,
                
                // Analytics for admin actions
                trackAction: (action, details = {}) => {
                    if (window.unifiedAnalytics) {
                        window.unifiedAnalytics.track('admin', action, 'panel_action', 1, details);
                    }
                },
                
                // Modern admin notifications
                showNotification: (message, type = 'info') => {
                    console.log(`${type.toUpperCase()}: ${message}`);
                }
            };
            
            console.log('✅ Modern Admin System initialized');
            
        } catch (error) {
            console.error('❌ Admin modernization failed:', error);
        }
    }
    
    // 🚀 Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeModernAdmin);
    } else {
        initializeModernAdmin();
    }
    
    // 🎯 Export for testing
    window.adminCleanup = {
        initializeModernAdmin,
        cleanupDeprecatedElements,
        showMigrationNotice,
        modernizeEventHandlers
    };
    
})();
