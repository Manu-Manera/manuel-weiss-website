/**
 * Error Prevention & Handling
 * Verhindert häufige JavaScript-Fehler und zeigt nützliche Debugging-Infos
 */

(function() {
    'use strict';
    
    console.log('🛡️ Error Prevention - Starting...');
    
    // Global Error Handler
    window.addEventListener('error', function(event) {
        console.error('🚨 GLOBAL ERROR:', event.error);
        console.error('📍 Location:', event.filename, 'Line:', event.lineno, 'Column:', event.colno);
        
        // Spezifische Fehlerbehandlung
        if (event.error && event.error.message) {
            const message = event.error.message;
            
            // CSS Selector Fehler
            if (message.includes('not a valid selector') || message.includes(':contains')) {
                console.error('❌ CSS SELECTOR ERROR: Invalid selector detected');
                console.error('💡 FIX: Replace :contains() with Array.from().find()');
                showErrorNotification('CSS Selektor Fehler behoben - bitte Seite neu laden', 'warning');
                return true; // Fehler als behandelt markieren
            }
            
            // Andere häufige Fehler
            if (message.includes('Cannot read property') || message.includes('Cannot read properties')) {
                console.error('❌ NULL/UNDEFINED ERROR:', message);
                showErrorNotification('Null-Referenz Fehler erkannt', 'error');
            }
            
            if (message.includes('is not a function')) {
                console.error('❌ FUNCTION ERROR:', message);
                showErrorNotification('Funktion nicht gefunden', 'error');
            }
        }
        
        return false; // Fehler nicht unterdrücken für andere Handler
    });
    
    // Promise Rejection Handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('🚨 UNHANDLED PROMISE REJECTION:', event.reason);
        
        if (event.reason && typeof event.reason === 'string') {
            if (event.reason.includes('selector') || event.reason.includes(':contains')) {
                console.error('❌ PROMISE SELECTOR ERROR');
                showErrorNotification('Async CSS Selektor Fehler', 'warning');
                event.preventDefault(); // Promise Rejection behandeln
            }
        }
    });
    
    // Override querySelector/querySelectorAll um :contains zu verhindern
    const originalQuerySelector = Document.prototype.querySelector;
    const originalQuerySelectorAll = Document.prototype.querySelectorAll;
    
    Document.prototype.querySelector = function(selector) {
        if (selector && selector.includes(':contains(')) {
            console.error('🚨 PREVENTED :contains() usage in querySelector:', selector);
            console.error('💡 Use Array.from(querySelectorAll).find() instead');
            showErrorNotification('Ungültiger CSS Selektor verhindert', 'warning');
            
            // Versuche automatische Korrektur
            const corrected = autoCorrectSelector(selector);
            if (corrected) {
                console.log('🔧 AUTO-CORRECTED to:', corrected.method);
                return corrected.result;
            }
            
            return null;
        }
        return originalQuerySelector.call(this, selector);
    };
    
    Document.prototype.querySelectorAll = function(selector) {
        if (selector && selector.includes(':contains(')) {
            console.error('🚨 PREVENTED :contains() usage in querySelectorAll:', selector);
            console.error('💡 Use Array.from(querySelectorAll).filter() instead');
            showErrorNotification('Ungültiger CSS Selektor verhindert', 'warning');
            
            // Return empty NodeList
            return document.createDocumentFragment().childNodes;
        }
        return originalQuerySelectorAll.call(this, selector);
    };
    
    // Automatische Selektor-Korrektur
    function autoCorrectSelector(selector) {
        try {
            // Extrahiere :contains() Pattern
            const containsMatch = selector.match(/(.+):contains\(["'](.+)["']\)/);
            if (containsMatch) {
                const baseSelector = containsMatch[1];
                const textContent = containsMatch[2];
                
                console.log(`🔧 Attempting auto-correction for: ${baseSelector} containing "${textContent}"`);
                
                // Versuche alle Elemente zu finden und nach Text zu filtern
                const elements = document.querySelectorAll(baseSelector);
                const found = Array.from(elements).find(el => el.textContent.includes(textContent));
                
                if (found) {
                    return {
                        result: found,
                        method: `Array.from(document.querySelectorAll('${baseSelector}')).find(el => el.textContent.includes('${textContent}'))`
                    };
                }
            }
        } catch (error) {
            console.error('❌ Auto-correction failed:', error);
        }
        
        return null;
    }
    
    // Error Notification System
    function showErrorNotification(message, type = 'error') {
        const colors = {
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6',
            'success': '#10b981'
        };
        
        const icons = {
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'success': '✅'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 99999;
            background: ${colors[type]}; color: white; padding: 1rem 2rem; border-radius: 8px;
            font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 500px;
            font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;
        `;
        
        notification.innerHTML = `
            <span style="font-size: 1.2rem;">${icons[type]}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 4px;
                padding: 0.25rem 0.5rem; margin-left: 1rem; cursor: pointer; font-size: 0.75rem;
            ">✕</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
    }
    
    // CSS Validation Helper
    function validateCSSSelector(selector) {
        if (!selector || typeof selector !== 'string') {
            return { valid: false, error: 'Selector is not a string' };
        }
        
        // Check for invalid pseudo-selectors
        const invalidPseudos = [':contains(', ':has-text(', ':text('];
        for (const invalid of invalidPseudos) {
            if (selector.includes(invalid)) {
                return { 
                    valid: false, 
                    error: `Invalid pseudo-selector: ${invalid}`,
                    suggestion: 'Use Array.from(querySelectorAll).find()/filter() with textContent'
                };
            }
        }
        
        // Try to validate by attempting to use it
        try {
            document.createDocumentFragment().querySelector(selector);
            return { valid: true };
        } catch (error) {
            return { 
                valid: false, 
                error: error.message,
                originalSelector: selector
            };
        }
    }
    
    // Debug Helper - Validate all selectors in code
    function scanForInvalidSelectors() {
        console.log('🔍 Scanning for invalid CSS selectors...');
        
        const scripts = document.querySelectorAll('script');
        let foundIssues = false;
        
        scripts.forEach((script, index) => {
            if (script.textContent) {
                const selectorMatches = script.textContent.match(/querySelector(?:All)?\s*\(\s*['"](.*?)['"]\s*\)/g);
                
                if (selectorMatches) {
                    selectorMatches.forEach(match => {
                        const selectorMatch = match.match(/querySelector(?:All)?\s*\(\s*['"](.*?)['"]\s*\)/);
                        if (selectorMatch) {
                            const selector = selectorMatch[1];
                            const validation = validateCSSSelector(selector);
                            
                            if (!validation.valid) {
                                console.error(`❌ Invalid selector in script ${index}:`, selector);
                                console.error('   Error:', validation.error);
                                if (validation.suggestion) {
                                    console.log('💡 Suggestion:', validation.suggestion);
                                }
                                foundIssues = true;
                            }
                        }
                    });
                }
            }
        });
        
        if (!foundIssues) {
            console.log('✅ No invalid selectors found in inline scripts');
        }
    }
    
    // Global Debug Functions
    window.validateSelector = validateCSSSelector;
    window.scanSelectors = scanForInvalidSelectors;
    window.showErrorNotification = showErrorNotification;
    
    // Initialize
    console.log('✅ Error Prevention - Ready');
    
    // Scan for issues after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(scanForInvalidSelectors, 1000);
        });
    } else {
        setTimeout(scanForInvalidSelectors, 1000);
    }
    
})();
