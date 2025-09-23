// Admin Panel Complete Fix - All Functions Working

// Initialize all admin panel functionality
function initializeAdminPanel() {
    console.log('🔧 INITIALIZING COMPLETE ADMIN PANEL FIX...');
    
    // Fix all document tab functionality
    fixDocumentTabs();
    
    // Fix all upload functionality
    fixUploadFunctionality();
    
    // Add AI Twin section handlers
    addAITwinSectionHandlers();
    
    // Fix all button click handlers
    fixAllButtonHandlers();
    
    console.log('✅ ADMIN PANEL FIX COMPLETE');
}

// Fix document tabs
function fixDocumentTabs() {
    console.log('🔄 Fixing document tabs...');
    
    // Ensure filterDocuments is globally available
    window.filterDocuments = function(type) {
        console.log('📁 Filtering documents by type:', type);
        window.currentDocumentFilter = type;
        
        // Update tab styles
        document.querySelectorAll('.doc-tab').forEach(tab => {
            tab.style.borderBottomColor = 'transparent';
            tab.classList.remove('active');
            if (tab.dataset.type === type) {
                tab.style.borderBottomColor = '#6366f1';
                tab.classList.add('active');
            }
        });
        
        // Reload documents
        if (window.loadDocuments) {
            window.loadDocuments();
        }
    };
}

// Fix upload functionality
function fixUploadFunctionality() {
    console.log('🔄 Fixing upload functionality...');
    
    // Ensure triggerDocumentUpload works
    window.triggerDocumentUpload = function() {
        console.log('📤 Trigger document upload called');
        const uploadInput = document.getElementById('doc-upload');
        
        if (uploadInput) {
            uploadInput.click();
        } else {
            // Create upload input if it doesn't exist
            const newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.id = 'doc-upload';
            newInput.accept = '.pdf,.doc,.docx,.html,.jpg,.jpeg,.png';
            newInput.multiple = true;
            newInput.style.display = 'none';
            document.body.appendChild(newInput);
            
            // Add event handler
            newInput.addEventListener('change', window.handleDocumentUpload || function(e) {
                console.log('Files selected:', e.target.files.length);
                if (window.handleDocumentUpload) {
                    window.handleDocumentUpload(e);
                }
            });
            
            // Click it
            newInput.click();
        }
    };
}

// Add AI Twin section handlers
function addAITwinSectionHandlers() {
    console.log('🤖 Adding AI Twin section handlers...');
    
    // Add AI Twin to AdminPanel sections
    if (window.AdminPanel && window.AdminPanel.loadSectionContent) {
        const originalLoadSection = window.AdminPanel.loadSectionContent;
        
        window.AdminPanel.loadSectionContent = function(sectionName) {
            console.log('Loading section:', sectionName);
            
            if (sectionName === 'ai-twin') {
                // Hide all sections
                document.querySelectorAll('section').forEach(s => s.style.display = 'none');
                
                // Show AI Twin section
                let aiTwinSection = document.getElementById('ai-twin-section');
                if (aiTwinSection) {
                    aiTwinSection.style.display = 'block';
                } else {
                    // Create AI Twin section if it doesn't exist
                    createAITwinSection();
                }
                
                // Update breadcrumb
                if (window.AdminPanel.updateBreadcrumb) {
                    window.AdminPanel.updateBreadcrumb('AI Twin');
                }
            } else {
                // Call original function for other sections
                originalLoadSection.call(this, sectionName);
            }
        };
    }
}

// Create AI Twin section
function createAITwinSection() {
    const mainContent = document.querySelector('main.content') || document.querySelector('main');
    if (!mainContent) return;
    
    const aiTwinSection = document.createElement('section');
    aiTwinSection.id = 'ai-twin-section';
    aiTwinSection.innerHTML = `
        <h2 style="color: #333; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
            <i class="fas fa-robot" style="color: #10b981;"></i>
            AI Twin Management
        </h2>
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); text-align: center; margin-bottom: 3rem;">
            <h3 style="color: white; margin-bottom: 1rem; font-size: 1.6rem;">
                🤖 Erstellen und trainieren Sie Ihren digitalen Zwilling
            </h3>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 2rem;">
                Ihr AI Twin kann Bewerbungsgespräche führen und Fragen zu Ihrer Person beantworten
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="startAITwinCreation()" style="padding: 1rem 2rem; background: white; color: #10b981; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <i class="fas fa-robot"></i>
                    AI Twin erstellen
                </button>
                <button onclick="startAITwinTrainingWorkflow()" style="padding: 1rem 2rem; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-graduation-cap"></i>
                    AI Twin trainieren
                </button>
            </div>
        </div>
        
        <!-- AI Twin Status -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h4 style="color: #333; margin-bottom: 1rem;">
                    <i class="fas fa-chart-line" style="color: #10b981; margin-right: 0.5rem;"></i>
                    Training Status
                </h4>
                <div id="aiTwinTrainingStatus">
                    <p style="color: #666;">Noch kein Training durchgeführt</p>
                </div>
            </div>
            
            <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h4 style="color: #333; margin-bottom: 1rem;">
                    <i class="fas fa-cog" style="color: #6366f1; margin-right: 0.5rem;"></i>
                    Einstellungen
                </h4>
                <div id="aiTwinSettings">
                    <p style="color: #666;">Noch kein AI Twin erstellt</p>
                </div>
            </div>
        </div>
    `;
    
    mainContent.appendChild(aiTwinSection);
}

// Fix all button handlers
function fixAllButtonHandlers() {
    console.log('🔘 Fixing all button handlers...');
    
    // List of all functions that need to be globally available
    const functionsToFix = [
        'filterApplications',
        'editApplication',
        'deleteApplication',
        'updateApplicationStatus',
        'openNewApplicationModal',
        'closeNewApplicationModal',
        'viewApplicationPage',
        'editApplicationPage',
        'filterDocuments',
        'triggerDocumentUpload',
        'openPDFEditor',
        'closePDFEditor',
        'mergeDocuments',
        'createTemplate',
        'startSmartWorkflow',
        'startAITwinCreation',
        'startAITwinTrainingWorkflow'
    ];
    
    // Check and log availability
    functionsToFix.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} is available`);
        } else {
            console.warn(`❌ ${funcName} is NOT available`);
        }
    });
}

// Run fix when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminPanel);
} else {
    // DOM already loaded
    initializeAdminPanel();
}

// Also run after a delay to ensure everything is loaded
setTimeout(initializeAdminPanel, 2000);

// Export for debugging
window.adminPanelFix = {
    initializeAdminPanel,
    fixDocumentTabs,
    fixUploadFunctionality,
    addAITwinSectionHandlers,
    fixAllButtonHandlers
};
