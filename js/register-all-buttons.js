/**
 * Register All Button Actions
 * Central registration of all button handlers across the website
 */

// Wait for EventRegistry to be available
function registerAllButtons() {
    if (!window.eventRegistry) {
        return;
    }


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
            
            // KI-Einstellungen Actions
            'test-ai-analysis': {
                handler: async () => {
                    const button = event.target;
                    const originalText = button.innerHTML;
                    const testText = document.getElementById('test-job-posting').value;
                    const resultsDiv = document.getElementById('test-results');
                    const resultsContent = document.getElementById('test-results-content');
                    
                    if (!testText.trim()) {
                        alert('Bitte fügen Sie eine Stellenanzeige für den Test ein.');
                        return;
                    }
                    
                    try {
                        // Button-Status aktualisieren
                        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> KI analysiert...';
                        button.disabled = true;
                        
                        // Aktuelle Einstellungen temporär speichern
                        const currentSettings = {
                            apiKey: document.getElementById('openai-api-key').value,
                            model: document.getElementById('openai-model').value,
                            language: document.getElementById('analysis-language').value,
                            maxRequirements: parseInt(document.getElementById('max-requirements').value),
                            temperature: parseFloat(document.getElementById('ai-temperature').value)
                        };
                        
                        if (!currentSettings.apiKey) {
                            throw new Error('API Key ist erforderlich für den Test');
                        }
                        
                        // Temporär Einstellungen setzen
                        window.openAIAnalyzer.saveSettings(currentSettings);
                        
                        // Live-Test durchführen
                        const startTime = Date.now();
                        const result = await window.openAIAnalyzer.analyzeJobPosting(testText);
                        const duration = Date.now() - startTime;
                        
                        // Erfolgreiche Ergebnisse anzeigen
                        resultsContent.innerHTML = `
                            <div style="display: grid; gap: 1rem;">
                                <div style="display: flex; justify-content: between; align-items: center; padding: 0.75rem; background: #dcfce7; border-radius: 8px;">
                                    <span style="color: #15803d; font-weight: 600;">
                                        <i class="fas fa-check-circle"></i> Test erfolgreich
                                    </span>
                                    <span style="color: #15803d; font-size: 0.875rem;">
                                        ${duration}ms
                                    </span>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                                        <h5 style="margin: 0 0 0.5rem 0; color: #374151;">
                                            <i class="fas fa-building"></i> Firma
                                        </h5>
                                        <p style="margin: 0; font-weight: 600; color: #111827;">${result.company || 'Nicht erkannt'}</p>
                                    </div>
                                    
                                    <div style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                                        <h5 style="margin: 0 0 0.5rem 0; color: #374151;">
                                            <i class="fas fa-briefcase"></i> Position
                                        </h5>
                                        <p style="margin: 0; font-weight: 600; color: #111827;">${result.position || 'Nicht erkannt'}</p>
                                    </div>
                                </div>
                                
                                ${result.location ? `
                                <div style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    <h5 style="margin: 0 0 0.5rem 0; color: #374151;">
                                        <i class="fas fa-map-marker-alt"></i> Standort
                                    </h5>
                                    <p style="margin: 0; color: #6b7280;">${result.location}</p>
                                </div>
                                ` : ''}
                                
                                ${result.contactPerson ? `
                                <div style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    <h5 style="margin: 0 0 0.5rem 0; color: #374151;">
                                        <i class="fas fa-user-tie"></i> Ansprechpartner
                                    </h5>
                                    <p style="margin: 0; color: #6b7280;">
                                        ${result.contactPerson.name || ''}
                                        ${result.contactPerson.position ? `(${result.contactPerson.position})` : ''}
                                    </p>
                                </div>
                                ` : ''}
                                
                                <div style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    <h5 style="margin: 0 0 0.5rem 0; color: #374151;">
                                        <i class="fas fa-list-check"></i> Anforderungen extrahiert
                                    </h5>
                                    <p style="margin: 0; color: #6b7280;">
                                        ${result.requirements ? result.requirements.length : 0} Anforderungen gefunden
                                        ${result.requirements && result.requirements.length > 0 ? `
                                        <details style="margin-top: 0.5rem;">
                                            <summary style="cursor: pointer; color: #6366f1;">Details anzeigen</summary>
                                            <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">
                                                ${result.requirements.slice(0, 5).map(req => `
                                                    <li style="margin: 0.25rem 0; font-size: 0.875rem;">
                                                        <span style="background: ${req.priority === 'high' ? '#fecaca' : req.priority === 'medium' ? '#fed7aa' : '#d1fae5'}; 
                                                                     color: ${req.priority === 'high' ? '#7f1d1d' : req.priority === 'medium' ? '#9a3412' : '#14532d'}; 
                                                                     padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.75rem; margin-right: 0.5rem;">
                                                            ${req.priority}
                                                        </span>
                                                        ${req.text.length > 80 ? req.text.substring(0, 80) + '...' : req.text}
                                                    </li>
                                                `).join('')}
                                                ${result.requirements.length > 5 ? `<li style="color: #6b7280; font-style: italic;">... und ${result.requirements.length - 5} weitere</li>` : ''}
                                            </ul>
                                        </details>
                                        ` : ''}
                                    </p>
                                </div>
                            </div>
                        `;
                        
                        resultsDiv.style.display = 'block';
                        resultsDiv.scrollIntoView({ behavior: 'smooth' });
                        
                        // Button-Status auf Erfolg
                        button.innerHTML = '<i class="fas fa-check"></i> Test erfolgreich!';
                        button.style.background = '#059669';
                        
                    } catch (error) {
                        console.error('Live-Test fehlgeschlagen:', error);
                        
                        resultsContent.innerHTML = `
                            <div style="padding: 1rem; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                                <h5 style="margin: 0 0 0.5rem 0; color: #7f1d1d;">
                                    <i class="fas fa-exclamation-triangle"></i> Test fehlgeschlagen
                                </h5>
                                <p style="margin: 0; color: #7f1d1d; font-size: 0.875rem;">
                                    ${error.message}
                                </p>
                                ${error.message.includes('API') ? `
                                <p style="margin: 0.5rem 0 0 0; color: #7f1d1d; font-size: 0.875rem;">
                                    <strong>Häufige Ursachen:</strong><br>
                                    • Ungültiger API Key<br>
                                    • Unzureichendes Guthaben<br>
                                    • Netzwerkprobleme
                                </p>
                                ` : ''}
                            </div>
                        `;
                        
                        resultsDiv.style.display = 'block';
                        
                        // Button-Status auf Fehler
                        button.innerHTML = '<i class="fas fa-times"></i> Test fehlgeschlagen';
                        button.style.background = '#ef4444';
                    }
                    
                    // Button nach 3 Sekunden zurücksetzen
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.background = '';
                        button.disabled = false;
                    }, 3000);
                },
                description: 'Test AI analysis with real job posting'
            },
            'load-sample-job': {
                handler: () => {
                    const sampleJob = `IBM
Teilen
Weitere Optionen anzeigen
HR AI & Automation SME (f/m/x) 
Zürich, Zürich, Schweiz · Vor 5 Tagen · 51 Kandidat:innen haben auf „Bewerben" geklickt
Gesponsert von Personaler:in · Außerhalb von LinkedIn verwaltete Antworten

Hybrid
Vollzeit

Bewerben

HR AI & Automation SME (f/m/x)
IBM · Zürich, Zürich, Schweiz (Hybrid)

Details zum Jobangebot
Introduction

A career in IBM embraces long-term relationships and close collaboration with clients across the globe. You'll work with visionaries across multiple industries to improve the hybrid and AI journey for the most innovative and valuable companies in the world. Your ability to accelerate impact and make meaningful change for your clients is enabled by our strategic partner ecosystem and our robust technology platforms across the IBM portfolio; including IBM Software and Red Hat. Curiosity and a constant quest for knowledge serve as the foundation to success in IBM. In your role, you'll be encouraged to challenge the norm, investigate ideas outside of your role, and come up with creative solutions resulting in ground breaking impact for a wide network of clients. Our culture of evolution and empathy centers on long-term career growth and development opportunities in an environment that embraces your unique skills and experience.

Your Role And Responsibilities

As an HR AI Automation SME, you will be responsible for designing, implementing, and scaling AI-driven automation solutions that optimize HR service delivery and create a seamless employee experience.

Your work will bridge HR process expertise with advanced automation technologies, enabling intelligent workflows, predictive insights, and streamlined HR operations. You will partner with the HR BA/Process Expert to ensure AI solutions are process-aligned, ethically implemented, and adopted at scale.

Primary Roles And Responsibilities

Identify and prioritize high-impact AI and automation opportunities within HR processes.
Define functional requirements and solution architecture for AI-enabled HR use cases.
Collaborate with technical teams to implement and integrate AI/automation solutions.
Drive adoption of AI capabilities through training, communication, and change management.
Establish AI governance practices to ensure compliance, fairness, and transparency.
Track performance of AI solutions and continuously refine use cases for greater value.

Required Technical And Professional Expertise

Strong understanding of HR processes combined with AI/automation expertise.
Experience with RPA tools (UiPath, Blue Prism) and AI services (Azure AI, AWS AI, Google AI).
Business analysis and requirements translation skills for AI-driven solutions.
Strong stakeholder engagement and cross-functional collaboration skills.
Deep expertise in AI and end-to-end automation within the HR domain, with strong knowledge of both business and technical architecture and the role of AI in transforming HR services.
Expertise in AI ethics, governance, and compliance in HR.
Fluency in English and German. 
Swiss/EU passport or valid permit required.

Preferred Technical And Professional Experience

Familiarity with HR platforms such as Workday, SuccessFactors, or ServiceNow HRSD.
Proven track record in scaling automation from pilot to enterprise-level adoption.`;

                    document.getElementById('test-job-posting').value = sampleJob;
                    document.getElementById('test-job-posting').focus();
                    
                    // Smooth scroll to textarea
                    document.getElementById('test-job-posting').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                },
                description: 'Load sample job posting for testing'
            },
            'save-ai-settings': {
                handler: () => {
                    try {
                        const apiKey = document.getElementById('openai-api-key').value;
                        
                        if (!apiKey) {
                            alert('API Key ist erforderlich!');
                            return;
                        }
                        
                        const settings = {
                            apiKey: apiKey,
                            model: document.getElementById('openai-model').value,
                            language: document.getElementById('analysis-language').value,
                            maxRequirements: parseInt(document.getElementById('max-requirements').value),
                            temperature: parseFloat(document.getElementById('ai-temperature').value)
                        };
                        
                        // Speichere und aktiviere sofort
                        window.openAIAnalyzer.saveSettings(settings);
                        
                        // Erfolgsmeldung
                        const button = event.target;
                        const originalText = button.innerHTML;
                        
                        button.innerHTML = '<i class="fas fa-check"></i> Aktiviert und bereit!';
                        button.style.background = '#059669';
                        
                        // Automatisch nach 2 Sekunden zur Bewerbungen Sektion wechseln
                        setTimeout(() => {
                            button.innerHTML = originalText;
                            button.style.background = '';
                            
                            // Wechsle zur Bewerbungen Sektion
                            showSection('applications');
                            
                            alert('✅ KI-Integration aktiviert! Sie können jetzt Stellenanzeigen intelligent analysieren lassen.');
                        }, 2000);
                        
                    } catch (error) {
                        console.error('Save settings failed:', error);
                        alert('Fehler beim Speichern: ' + error.message);
                    }
                },
                description: 'Save and activate AI settings'
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
                        
                        // Initialize event handlers for the workflow
                        window.smartWorkflow.initializeEventHandlers();
                        
                        // Bind actions after DOM is ready
                        setTimeout(() => {
                            // Bind all workflow actions
                            const workflowActions = [
                                'workflow-close', 'workflow-next-step', 'workflow-prev-step',
                                'workflow-analyze-job', 'workflow-confirm-extraction', 'workflow-edit-extraction',
                                'workflow-add-requirement', 'workflow-generate-sentences', 'workflow-save-components',
                                'workflow-search-address', 'workflow-upload-signature', 'workflow-upload-logo',
                                'workflow-select-layout', 'workflow-preview-document', 'workflow-copy-link',
                                'workflow-finish'
                            ];
                            
                            workflowActions.forEach(action => {
                                if (window.eventRegistry) {
                                    window.eventRegistry.bindAction(action);
                                }
                            });
                            
                            // Special handling for textarea input event
                            const jobDescTextarea = document.getElementById('jobDescription');
                            if (jobDescTextarea) {
                                jobDescTextarea.addEventListener('input', () => {
                                    window.smartWorkflow.analyzeJobDescription();
                                });
                            }
                        }, 100);
                        
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
