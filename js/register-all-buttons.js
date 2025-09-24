/**
 * Register All Button Actions
 * Central registration of all button handlers across the website
 */

// Wait for EventRegistry to be available
function registerAllButtons() {
    if (!window.eventRegistry) {
        console.error('[RegisterButtons] EventRegistry not available');
        return;
    }

    console.log('[RegisterButtons] Starting button registration...');

    // Admin Panel Actions
    window.eventRegistry.registerBulk({
        // Sidebar & Navigation
        'toggle-sidebar': {
            handler: () => document.getElementById('adminSidebar')?.classList.toggle('collapsed'),
            description: 'Toggle sidebar visibility'
        },
        'logout': {
            handler: () => {
                if (confirm('Möchten Sie sich wirklich abmelden?')) {
                    localStorage.removeItem('adminAuth');
                    window.location.href = '/';
                }
            },
            description: 'Logout from admin panel'
        },
        'toggle-dark-mode': {
            handler: () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', isDark);
                const icon = document.getElementById('darkModeIcon');
                if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            },
            description: 'Toggle dark mode'
        },
        'show-notifications': {
            handler: () => {
                alert('Benachrichtigungen werden noch implementiert');
            },
            description: 'Show notifications panel'
        },

        // Quick Actions
        'quick-action-content': {
            handler: () => window.adminPanel?.showSection('content'),
            description: 'Navigate to content management'
        },
        'quick-action-nutrition': {
            handler: () => window.adminPanel?.showSection('nutrition'),
            description: 'Navigate to nutrition section'
        },
        'quick-action-ikigai': {
            handler: () => window.adminPanel?.showSection('ikigai'),
            description: 'Navigate to Ikigai workflow'
        },
        'quick-action-personal-training': {
            handler: () => window.adminPanel?.showSection('personal-training'),
            description: 'Navigate to personal training'
        },
        'quick-action-applications': {
            handler: () => window.adminPanel?.showSection('applications'),
            description: 'Navigate to applications'
        },
        'quick-action-ai-twin': {
            handler: () => window.adminPanel?.showSection('ai-twin'),
            description: 'Navigate to AI Twin'
        },
        'quick-action-media': {
            handler: () => window.adminPanel?.showSection('media'),
            description: 'Navigate to media management'
        },
        'quick-action-rentals': {
            handler: () => window.adminPanel?.showSection('rentals'),
            description: 'Navigate to rentals'
        },

        // Application Management
        'start-workflow': {
            handler: () => {
                console.log('[EventRegistry] Starting new Smart Workflow...');
                
                try {
                    // Remove any existing workflow modal
                    const existingModal = document.getElementById('smartWorkflowModal');
                    if (existingModal) {
                        existingModal.remove();
                    }
                    
                    // Load Smart Workflow System if not already loaded
                    if (!window.smartWorkflow) {
                        const script = document.createElement('script');
                        script.src = 'js/smart-workflow-system.js';
                        script.onload = () => {
                            // Load CSS
                            const link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.href = 'css/smart-workflow.css';
                            document.head.appendChild(link);
                            
                            // Initialize and show workflow
                            setTimeout(() => {
                                showSmartWorkflow();
                            }, 100);
                        };
                        document.body.appendChild(script);
                    } else {
                        showSmartWorkflow();
                    }
                    
                    function showSmartWorkflow() {
                        // Create modal container
                        const modal = document.createElement('div');
                        modal.id = 'smartWorkflowModal';
                        modal.className = 'smart-workflow-modal';
                        
                        // Render workflow
                        modal.innerHTML = window.smartWorkflow.render();
                        
                        // Add to DOM
                        document.body.appendChild(modal);
                        
                        console.log('✅ Smart Workflow loaded and displayed');
                    }
                    
                } catch (error) {
                    console.error('❌ Fehler beim Starten des Smart Workflows:', error);
                    alert('Fehler beim Starten des Workflows. Bitte laden Sie die Seite neu.');
                }
            },
            description: 'Start new application workflow'
        },
        'save-application': {
            handler: () => {
                console.log('[EventRegistry] Saving application...');
                if (window.saveApplication) {
                    window.saveApplication();
                } else {
                    alert('Bewerbung wird gespeichert...');
                }
            },
            description: 'Save current application'
        },
        'upload-document': {
            handler: () => {
                console.log('[EventRegistry] Opening document upload...');
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        console.log('[EventRegistry] File selected:', file.name);
                        if (window.handleDocumentUpload) {
                            window.handleDocumentUpload(file);
                        } else {
                            alert(`Dokument "${file.name}" wird hochgeladen...`);
                        }
                    }
                };
                input.click();
            },
            description: 'Upload application document'
        },
        'analyze-job': {
            handler: () => {
                if (window.analyzeJobRequirements) {
                    window.analyzeJobRequirements();
                } else {
                    alert('Stellenanzeige wird analysiert...');
                }
            },
            description: 'Analyze job requirements'
        },
        'generate-cover-letter': {
            handler: () => {
                if (window.generateSmartCoverLetter) {
                    window.generateSmartCoverLetter();
                } else {
                    alert('Anschreiben wird generiert...');
                }
            },
            description: 'Generate AI cover letter'
        },

        // Service Management
        'add-service': {
            handler: () => {
                if (window.addNewService) {
                    window.addNewService();
                } else {
                    console.log('[EventRegistry] Add service function not found');
                }
            },
            description: 'Add new service'
        },
        'refresh-services': {
            handler: () => {
                if (window.refreshServices) {
                    window.refreshServices();
                } else {
                    location.reload();
                }
            },
            description: 'Refresh services list'
        },
        'sync-services': {
            handler: () => {
                if (window.syncServicesWithWebsite) {
                    window.syncServicesWithWebsite();
                } else {
                    alert('Services werden synchronisiert...');
                }
            },
            description: 'Sync services with website'
        },
        'load-services': {
            handler: () => {
                if (window.loadServicesFromWebsite) {
                    window.loadServicesFromWebsite();
                } else {
                    alert('Services werden geladen...');
                }
            },
            description: 'Load services from website'
        },
        'create-service': {
            handler: () => {
                if (window.createNewService) {
                    window.createNewService();
                } else {
                    alert('Neuer Service wird erstellt...');
                }
            },
            description: 'Create new service'
        },

        // AI Configuration
        'save-openai-key': {
            handler: () => {
                const keyInput = document.getElementById('openai-api-key');
                if (keyInput && keyInput.value) {
                    localStorage.setItem('openai-api-key', keyInput.value);
                    alert('API Key gespeichert!');
                    keyInput.value = '';
                }
            },
            description: 'Save OpenAI API key'
        },
        'test-openai-connection': {
            handler: () => {
                if (window.testOpenAIConnection) {
                    window.testOpenAIConnection();
                } else {
                    alert('Verbindung wird getestet...');
                }
            },
            description: 'Test OpenAI connection'
        },
        'toggle-api-key': {
            handler: () => {
                const input = document.getElementById('openai-api-key');
                if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                }
            },
            description: 'Toggle API key visibility'
        },

        // Recipe Generation
        'generate-recipe': {
            handler: () => {
                if (window.generateAIRecipe) {
                    window.generateAIRecipe();
                } else {
                    alert('Rezept wird generiert...');
                }
            },
            description: 'Generate AI recipe'
        },
        'save-recipe': {
            handler: () => {
                if (window.saveGeneratedRecipe) {
                    window.saveGeneratedRecipe();
                } else {
                    alert('Rezept wird gespeichert...');
                }
            },
            description: 'Save generated recipe'
        },
        'regenerate-recipe': {
            handler: () => {
                if (window.regenerateRecipe) {
                    window.regenerateRecipe();
                } else {
                    alert('Rezept wird neu generiert...');
                }
            },
            description: 'Regenerate recipe'
        },

        // Ikigai Workflow
        'edit-ikigai-step': {
            handler: (event, element) => {
                const step = element.getAttribute('data-step');
                if (window.editIkigaiStep) {
                    window.editIkigaiStep(step);
                } else {
                    alert(`Bearbeite Ikigai Schritt ${step}`);
                }
            },
            description: 'Edit Ikigai workflow step'
        },
        'manage-templates': {
            handler: () => {
                if (window.manageTemplates) {
                    window.manageTemplates();
                } else {
                    alert('Template-Verwaltung öffnet sich...');
                }
            },
            description: 'Manage workflow templates'
        },

        // Training Plans
        'edit-training-plan': {
            handler: (event, element) => {
                const planId = element.getAttribute('data-plan');
                if (window.openPlanEditor) {
                    window.openPlanEditor(planId);
                } else {
                    alert(`Bearbeite Trainingsplan: ${planId}`);
                }
            },
            description: 'Edit training plan'
        },

        // Media Management
        'upload-image': {
            handler: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                    const files = Array.from(e.target.files);
                    if (window.handleImageUpload) {
                        window.handleImageUpload(files);
                    } else {
                        alert(`${files.length} Bilder werden hochgeladen...`);
                    }
                };
                input.click();
            },
            description: 'Upload images'
        },

        // Generic Actions
        'save': {
            handler: () => {
                console.log('[EventRegistry] Generic save action');
                // Context-dependent save logic
                const activeSection = document.querySelector('.admin-section.active');
                if (activeSection) {
                    const sectionId = activeSection.id;
                    console.log(`[EventRegistry] Saving in section: ${sectionId}`);
                }
            },
            description: 'Generic save action'
        },
        'cancel': {
            handler: () => {
                console.log('[EventRegistry] Generic cancel action');
                // Close modals or reset forms
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    modal.classList.remove('active');
                }
            },
            description: 'Generic cancel action'
        },
        'delete': {
            handler: () => {
                if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
                    console.log('[EventRegistry] Delete confirmed');
                }
            },
            description: 'Generic delete action'
        },
        
        // Workflow Modal Actions
        'close-workflow': {
            handler: () => {
                const modal = document.getElementById('smartWorkflowModal');
                if (modal) modal.remove();
            },
            description: 'Close workflow modal'
        },
    });

    // Register dynamic button handlers
    registerDynamicHandlers();

    console.log('[RegisterButtons] Registration complete!');
}

// Handle dynamically created buttons
function registerDynamicHandlers() {
    // Application status buttons
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action^="status-"]');
        if (target) {
            const status = target.getAttribute('data-action').replace('status-', '');
            const applicationId = target.getAttribute('data-application-id');
            console.log(`[EventRegistry] Status change: ${status} for application ${applicationId}`);
            if (window.updateApplicationStatus) {
                window.updateApplicationStatus(applicationId, status);
            }
        }
    });

    // Edit buttons
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action="edit"]');
        if (target) {
            const itemId = target.getAttribute('data-item-id');
            const itemType = target.getAttribute('data-item-type');
            console.log(`[EventRegistry] Edit: ${itemType} ${itemId}`);
            if (window.editItem) {
                window.editItem(itemType, itemId);
            }
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerAllButtons);
} else {
    registerAllButtons();
}

// Re-register when new content is loaded
window.addEventListener('contentLoaded', registerAllButtons);
