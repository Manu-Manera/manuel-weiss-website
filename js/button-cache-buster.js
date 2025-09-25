/**
 * Button Cache Buster
 * Ensures buttons work correctly across different browser states
 * Addresses issues with cached event handlers and localStorage conflicts
 */

(function() {
    'use strict';
    
    console.log('🧹 Button Cache Buster - Starting...');
    
    // Clear problematic cached data that might interfere with button functionality
    function clearProblematicCache() {
        try {
            // Clear specific localStorage items that might cause conflicts
            const problematicKeys = [
                'buttonEventHandlers',
                'cachedEventListeners',
                'workflowButtonState',
                'buttonRegistryCache'
            ];
            
            problematicKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`🧹 Cleared problematic cache: ${key}`);
                }
            });
            
            // Clear sessionStorage items that might interfere
            if (sessionStorage.getItem('buttonHandlersRegistered')) {
                sessionStorage.removeItem('buttonHandlersRegistered');
                console.log('🧹 Cleared session button handlers cache');
            }
            
        } catch (error) {
            console.warn('🧹 Cache clearing failed (this is okay):', error);
        }
    }
    
    // Force refresh of all button event handlers
    function refreshButtonHandlers() {
        console.log('🔄 Refreshing button handlers...');
        
        // Find all buttons with problematic cached handlers
        const buttons = document.querySelectorAll('button');
        let refreshed = 0;
        
        buttons.forEach(button => {
            const text = button.textContent || button.innerText || '';
            const onclick = button.getAttribute('onclick');
            
            // Check if this is a workflow-related button
            if (text.includes('Neue Bewerbung') || 
                text.includes('Smart Workflow') ||
                onclick?.includes('startSmartWorkflow') ||
                onclick?.includes('openNewApplicationModal')) {
                
                // Create a fresh button with the same properties
                const newButton = button.cloneNode(true);
                
                // Remove cached event handlers
                newButton.removeAttribute('onclick');
                newButton.onclick = null;
                
                // Replace in DOM
                button.parentNode.replaceChild(newButton, button);
                refreshed++;
            }
        });
        
        console.log(`🔄 Refreshed ${refreshed} button handlers`);
    }
    
    // Detect if we're in private/incognito mode
    function detectPrivateMode() {
        return new Promise((resolve) => {
            try {
                // Test localStorage availability (restricted in some private modes)
                localStorage.setItem('__test__', 'test');
                localStorage.removeItem('__test__');
                
                // Test if we can create a new worker (restricted in some browsers' private mode)
                if (window.Worker) {
                    try {
                        const worker = new Worker('data:text/javascript,');
                        worker.terminate();
                        resolve(false); // Not private mode
                    } catch (e) {
                        resolve(true); // Might be private mode
                    }
                } else {
                    resolve(false);
                }
            } catch (e) {
                resolve(true); // Likely private mode
            }
        });
    }
    
    // Initialize cache busting
    async function initialize() {
        console.log('🧹 Button Cache Buster - Initializing...');
        
        // Clear problematic cache first
        clearProblematicCache();
        
        // Detect private mode
        const isPrivateMode = await detectPrivateMode();
        console.log(`🔍 Private mode detected: ${isPrivateMode}`);
        
        if (!isPrivateMode) {
            // In normal mode, we might have cached issues - refresh handlers
            refreshButtonHandlers();
            
            // Set flag to prevent re-registration conflicts
            sessionStorage.setItem('buttonCacheBusted', 'true');
        }
        
        // Force event registry reinitialization if available
        if (window.eventRegistry && typeof window.eventRegistry.reinitialize === 'function') {
            console.log('🔄 Reinitializing EventRegistry...');
            window.eventRegistry.reinitialize();
        }
        
        console.log('✅ Button Cache Buster - Completed');
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Also run on window load as backup
    window.addEventListener('load', () => {
        setTimeout(initialize, 100);
    });
    
})();
