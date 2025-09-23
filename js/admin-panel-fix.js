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
        
        <!-- AI Twin Creation & Training Section -->
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
        
        <!-- AI Twin Status Dashboard -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
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
        
        <!-- AI Twin Management Tools -->
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 3rem;">
            <h3 style="color: #333; margin-bottom: 1.5rem;">
                <i class="fas fa-tools" style="color: #6366f1; margin-right: 0.5rem;"></i>
                AI Twin Verwaltung
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <button onclick="viewAITwinProfile()" style="padding: 1.5rem; background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.3s ease;">
                    <i class="fas fa-user-circle" style="font-size: 2rem; color: #10b981; margin-bottom: 0.5rem; display: block;"></i>
                    <h4 style="margin: 0.5rem 0; color: #333;">Profil anzeigen</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">AI Twin Profil und Einstellungen</p>
                </button>
                
                <button onclick="editAITwinProfile()" style="padding: 1.5rem; background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.3s ease;">
                    <i class="fas fa-edit" style="font-size: 2rem; color: #6366f1; margin-bottom: 0.5rem; display: block;"></i>
                    <h4 style="margin: 0.5rem 0; color: #333;">Profil bearbeiten</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">Persönlichkeit und Wissen anpassen</p>
                </button>
                
                <button onclick="viewAITwinConversations()" style="padding: 1.5rem; background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.3s ease;">
                    <i class="fas fa-comments" style="font-size: 2rem; color: #f59e0b; margin-bottom: 0.5rem; display: block;"></i>
                    <h4 style="margin: 0.5rem 0; color: #333;">Gespräche anzeigen</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">Training und Feedback verwalten</p>
                </button>
                
                <button onclick="exportAITwinData()" style="padding: 1.5rem; background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.3s ease;">
                    <i class="fas fa-download" style="font-size: 2rem; color: #8b5cf6; margin-bottom: 0.5rem; display: block;"></i>
                    <h4 style="margin: 0.5rem 0; color: #333;">Daten exportieren</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">AI Twin Daten sichern</p>
                </button>
            </div>
        </div>
        
        <!-- AI Twin Analytics -->
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-bottom: 1.5rem;">
                <i class="fas fa-chart-bar" style="color: #10b981; margin-right: 0.5rem;"></i>
                AI Twin Analytics
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 6px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #10b981;" id="aiTwinConversationCount">0</div>
                    <div style="color: #666; font-size: 0.9rem;">Gespräche geführt</div>
                </div>
                
                <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 6px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #6366f1;" id="aiTwinTrainingHours">0</div>
                    <div style="color: #666; font-size: 0.9rem;">Training Stunden</div>
                </div>
                
                <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 6px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #f59e0b;" id="aiTwinAccuracy">-</div>
                    <div style="color: #666; font-size: 0.9rem;">Antwortgenauigkeit</div>
                </div>
                
                <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 6px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #8b5cf6;" id="aiTwinLastActive">-</div>
                    <div style="color: #666; font-size: 0.9rem;">Letzte Aktivität</div>
                </div>
            </div>
        </div>
    `;
    
    mainContent.appendChild(aiTwinSection);
    
    // Load AI Twin data after section is created
    setTimeout(() => {
        loadAITwinData();
    }, 100);
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

// AI Twin Management Functions
function loadAITwinData() {
    console.log('🤖 Loading AI Twin data...');
    
    // Load AI Twin profile from localStorage
    const aiTwinProfile = JSON.parse(localStorage.getItem('aiTwinProfile') || '{}');
    
    if (aiTwinProfile && aiTwinProfile.profile) {
        // Update training status
        const trainingStatus = document.getElementById('aiTwinTrainingStatus');
        if (trainingStatus) {
            const conversations = aiTwinProfile.training?.conversations?.length || 0;
            const feedback = aiTwinProfile.training?.feedback?.length || 0;
            
            trainingStatus.innerHTML = `
                <p style="color: #10b981; font-weight: 600; margin: 0.5rem 0;">✅ AI Twin aktiv</p>
                <p style="color: #666; margin: 0.25rem 0;">Gespräche: ${conversations}</p>
                <p style="color: #666; margin: 0.25rem 0;">Feedback: ${feedback}</p>
            `;
        }
        
        // Update settings
        const settings = document.getElementById('aiTwinSettings');
        if (settings) {
            settings.innerHTML = `
                <p style="color: #10b981; font-weight: 600; margin: 0.5rem 0;">✅ Konfiguriert</p>
                <p style="color: #666; margin: 0.25rem 0;">Name: ${aiTwinProfile.profile.name}</p>
                <p style="color: #666; margin: 0.25rem 0;">Position: ${aiTwinProfile.profile.position}</p>
                <p style="color: #666; margin: 0.25rem 0;">Avatar: ${aiTwinProfile.settings?.avatar || '👔'}</p>
            `;
        }
        
        // Update analytics
        updateAITwinAnalytics(aiTwinProfile);
    }
}

function updateAITwinAnalytics(profile) {
    const conversationCount = profile.training?.conversations?.length || 0;
    const feedbackCount = profile.training?.feedback?.length || 0;
    const goodRatings = profile.training?.feedback?.filter(f => f.rating === 'good').length || 0;
    const accuracy = feedbackCount > 0 ? Math.round((goodRatings / feedbackCount) * 100) : 0;
    const lastActive = profile.training?.feedback?.length > 0 ? 
        new Date(profile.training.feedback[profile.training.feedback.length - 1].timestamp).toLocaleDateString('de-DE') : 
        'Nie';
    
    // Update analytics elements
    const elements = {
        aiTwinConversationCount: conversationCount,
        aiTwinTrainingHours: Math.round(conversationCount * 0.5), // Estimate
        aiTwinAccuracy: accuracy > 0 ? `${accuracy}%` : '-',
        aiTwinLastActive: lastActive
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// AI Twin Management Functions
function viewAITwinProfile() {
    console.log('👤 Viewing AI Twin profile...');
    const profile = JSON.parse(localStorage.getItem('aiTwinProfile') || '{}');
    
    if (!profile.profile) {
        alert('Noch kein AI Twin erstellt. Bitte erstellen Sie zuerst einen AI Twin.');
        return;
    }
    
    // Create modal to show profile
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 600px; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; position: relative;">
                <h3 style="margin: 0; font-size: 1.5rem;">AI Twin Profil</h3>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div style="padding: 2rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h4 style="color: #333; margin-bottom: 1rem;">Grunddaten</h4>
                        <p><strong>Name:</strong> ${profile.profile.name}</p>
                        <p><strong>Position:</strong> ${profile.profile.position}</p>
                        <p><strong>Avatar:</strong> ${profile.settings?.avatar || '👔'}</p>
                        <p><strong>Kommunikationsstil:</strong> ${profile.profile.communicationStyle}</p>
                    </div>
                    
                    <div>
                        <h4 style="color: #333; margin-bottom: 1rem;">Kompetenzen</h4>
                        <ul style="margin: 0; padding-left: 1.5rem;">
                            ${profile.profile.expertise.map(skill => `<li>${skill}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: #333; margin-bottom: 1rem;">Persönlichkeit</h4>
                    <p style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin: 0;">${profile.profile.personality}</p>
                </div>
                
                <div style="text-align: right;">
                    <button onclick="editAITwinProfile()" style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 1rem;">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function editAITwinProfile() {
    console.log('✏️ Editing AI Twin profile...');
    // Close any existing modals
    document.querySelectorAll('[style*="position: fixed"]').forEach(modal => modal.remove());
    
    // Start AI Twin creation workflow
    if (window.startAITwinCreation) {
        window.startAITwinCreation();
    } else {
        alert('AI Twin Creation Workflow nicht verfügbar. Bitte laden Sie die Seite neu.');
    }
}

function viewAITwinConversations() {
    console.log('💬 Viewing AI Twin conversations...');
    const profile = JSON.parse(localStorage.getItem('aiTwinProfile') || '{}');
    
    if (!profile.training || !profile.training.conversations) {
        alert('Noch keine Gespräche geführt. Starten Sie das Training!');
        return;
    }
    
    // Create modal to show conversations
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 800px; height: 80%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 1.5rem; position: relative;">
                <h3 style="margin: 0; font-size: 1.5rem;">Training Gespräche</h3>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div style="flex: 1; padding: 1.5rem; overflow-y: auto;">
                <div id="conversationsList">
                    ${profile.training.conversations.map((conv, index) => `
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                            <h4 style="margin: 0 0 0.5rem 0; color: #333;">Frage ${index + 1}</h4>
                            <p style="margin: 0 0 0.5rem 0; font-weight: 600;">${conv.question}</p>
                            <p style="margin: 0; color: #666;">${conv.answer}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="padding: 1.5rem; border-top: 1px solid #e5e7eb; text-align: right;">
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Schließen
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function exportAITwinData() {
    console.log('📥 Exporting AI Twin data...');
    const profile = JSON.parse(localStorage.getItem('aiTwinProfile') || '{}');
    
    if (!profile.profile) {
        alert('Noch kein AI Twin erstellt. Nichts zu exportieren.');
        return;
    }
    
    // Create export data
    const exportData = {
        profile: profile.profile,
        settings: profile.settings,
        training: profile.training,
        exportedAt: new Date().toISOString()
    };
    
    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-twin-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('AI Twin Daten erfolgreich exportiert!', 'success');
    }
}

// Make AI Twin functions globally available
window.viewAITwinProfile = viewAITwinProfile;
window.editAITwinProfile = editAITwinProfile;
window.viewAITwinConversations = viewAITwinConversations;
window.exportAITwinData = exportAITwinData;
window.loadAITwinData = loadAITwinData;

// Export for debugging
window.adminPanelFix = {
    initializeAdminPanel,
    fixDocumentTabs,
    fixUploadFunctionality,
    addAITwinSectionHandlers,
    fixAllButtonHandlers,
    loadAITwinData,
    viewAITwinProfile,
    editAITwinProfile,
    viewAITwinConversations,
    exportAITwinData
};
