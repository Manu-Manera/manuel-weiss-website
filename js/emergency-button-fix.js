/**
 * Emergency Button Fix for "Neue Bewerbung erstellen" Buttons
 * This script fixes the issue where workflow buttons only work in private mode
 * by ensuring multiple fallback event handlers are registered
 */

(function() {
    'use strict';
    
    console.log('🚨 Emergency Button Fix - Loading...');
    
    // Function to fix a single button
    function fixButton(button, description) {
        if (!button) return false;
        
        console.log(`🔧 Fixing button: ${description}`);
        
        // Remove existing onclick handlers that might be cached incorrectly
        button.removeAttribute('onclick');
        button.onclick = null;
        
        // Remove old event listeners by cloning the button
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add multiple event handlers for maximum compatibility
        const handlers = [
            // Handler 1: Direct workflow start
            function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚀 Emergency Handler 1 - Starting workflow...');
                
                if (typeof window.startSmartWorkflow === 'function') {
                    window.startSmartWorkflow();
                } else if (typeof window.showSmartWorkflow === 'function') {
                    window.showSmartWorkflow();
                } else {
                    // Load workflow system dynamically
                    loadWorkflowSystem();
                }
            },
            
            // Handler 2: EventRegistry fallback
            function(e) {
                if (window.eventRegistry && window.eventRegistry.handle) {
                    console.log('🚀 Emergency Handler 2 - Using EventRegistry...');
                    window.eventRegistry.handle('start-workflow', e);
                }
            },
            
            // Handler 3: Direct modal creation
            function(e) {
                console.log('🚀 Emergency Handler 3 - Creating modal directly...');
                createWorkflowModalDirectly();
            }
        ];
        
        // Register all handlers
        handlers.forEach((handler, index) => {
            newButton.addEventListener('click', handler);
        });
        
        // Set data attributes for EventRegistry
        newButton.setAttribute('data-action', 'start-workflow');
        newButton.setAttribute('data-emergency-fixed', 'true');
        
        console.log(`✅ Button fixed: ${description}`);
        return true;
    }
    
    // Function to load workflow system dynamically
    function loadWorkflowSystem() {
        console.log('📦 Loading workflow system dynamically...');
        
        // Check if already loaded
        if (window.smartWorkflow || window.SmartWorkflowSystem) {
            if (typeof window.startSmartWorkflow === 'function') {
                window.startSmartWorkflow();
                return;
            }
        }
        
        // Load workflow script
        const script = document.createElement('script');
        script.src = 'js/smart-workflow-system.js';
        script.onload = function() {
            console.log('✅ Workflow system loaded');
            
            // Try to start workflow
            setTimeout(() => {
                if (typeof window.startSmartWorkflow === 'function') {
                    window.startSmartWorkflow();
                } else {
                    createWorkflowModalDirectly();
                }
            }, 100);
        };
        script.onerror = function() {
            console.error('❌ Failed to load workflow system');
            createWorkflowModalDirectly();
        };
        document.head.appendChild(script);
    }
    
    // Function to create workflow modal directly as last resort
    function createWorkflowModalDirectly() {
        console.log('🚨 Creating emergency workflow modal...');
        
        // Remove any existing modals
        const existingModal = document.getElementById('emergencyWorkflowModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'emergencyWorkflowModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Inter', sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-rocket" style="color: white; font-size: 1.5rem;"></i>
                    </div>
                    <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem; font-weight: 700;">Smart Workflow wird geladen...</h2>
                    <p style="margin: 0.5rem 0 0; color: #6b7280;">Das System wird initialisiert. Bitte warten Sie einen Moment.</p>
                </div>
                
                <div style="text-align: center;">
                    <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top: 3px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
                
                <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="closeEmergencyModal()" style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Abbrechen
                    </button>
                    <button onclick="reloadPageForWorkflow()" style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Seite neu laden
                    </button>
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-close after 3 seconds and try to reload workflow
        setTimeout(() => {
            modal.remove();
            
            // Try one more time to start workflow
            if (typeof window.startSmartWorkflow === 'function') {
                window.startSmartWorkflow();
            } else {
                alert('⚠️ Workflow konnte nicht gestartet werden. Bitte laden Sie die Seite neu und versuchen Sie es erneut.');
            }
        }, 3000);
    }
    
    // Global functions for modal
    window.closeEmergencyModal = function() {
        const modal = document.getElementById('emergencyWorkflowModal');
        if (modal) modal.remove();
    };
    
    window.reloadPageForWorkflow = function() {
        // Save state before reload
        sessionStorage.setItem('startWorkflowAfterReload', 'true');
        window.location.reload();
    };
    
    // Main fix function
    function fixAllWorkflowButtons() {
        console.log('🔍 Searching for workflow buttons to fix...');
        
        const buttonSelectors = [
            // By onclick attribute
            'button[onclick*="startSmartWorkflow"]',
            'button[onclick*="openNewApplicationModal"]',
            
            // By ID
            '#startWorkflowBtn',
            '#newApplicationBtn',
            '#newApplicationMainBtn',
            '#smartWorkflowButton',
            
            // By data-action
            'button[data-action="start-workflow"]',
            
            // By text content
            'button',  // We'll filter these by text content
            
            // By class
            '.workflow-btn'
        ];
        
        let fixedCount = 0;
        
        buttonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            
            buttons.forEach(button => {
                // Skip if already fixed
                if (button.getAttribute('data-emergency-fixed') === 'true') {
                    return;
                }
                
                const text = button.textContent || button.innerText || '';
                const onclick = button.getAttribute('onclick') || '';
                const dataAction = button.getAttribute('data-action') || '';
                
                // Check if this is a workflow button
                const isWorkflowButton = (
                    text.includes('Neue Bewerbung') ||
                    text.includes('Smart Workflow') ||
                    onclick.includes('startSmartWorkflow') ||
                    onclick.includes('openNewApplicationModal') ||
                    dataAction === 'start-workflow' ||
                    button.id.includes('workflow') ||
                    button.id.includes('application')
                );
                
                if (isWorkflowButton) {
                    const description = `${button.id || 'no-id'} - "${text.trim()}"`;
                    if (fixButton(button, description)) {
                        fixedCount++;
                    }
                }
            });
        });
        
        console.log(`✅ Fixed ${fixedCount} workflow buttons`);
        return fixedCount;
    }
    
    // Initialize when DOM is ready
    function initialize() {
        console.log('🚨 Emergency Button Fix - Initializing...');
        
        // Check if we should start workflow after reload
        if (sessionStorage.getItem('startWorkflowAfterReload') === 'true') {
            sessionStorage.removeItem('startWorkflowAfterReload');
            setTimeout(() => {
                if (typeof window.startSmartWorkflow === 'function') {
                    window.startSmartWorkflow();
                }
            }, 1000);
        }
        
        // Fix buttons immediately
        fixAllWorkflowButtons();
        
        // Set up mutation observer to fix dynamically added buttons
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let needsFix = false;
                
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1 && node.tagName === 'BUTTON') {
                                needsFix = true;
                            }
                        });
                    }
                });
                
                if (needsFix) {
                    setTimeout(fixAllWorkflowButtons, 100);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // Re-run fix every 2 seconds for first 10 seconds (to catch dynamically loaded content)
        for (let i = 1; i <= 5; i++) {
            setTimeout(fixAllWorkflowButtons, i * 2000);
        }
        
        console.log('✅ Emergency Button Fix - Initialized');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Also run on window load as final backup
    window.addEventListener('load', function() {
        setTimeout(fixAllWorkflowButtons, 500);
    });
    
})();
