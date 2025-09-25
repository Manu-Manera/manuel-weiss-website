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
                    const resultsDiv = document.getElementById('test-results');
                    const resultsContent = document.getElementById('test-results-content');
                    
                    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Teste API...';
                    button.disabled = true;
                    
                    try {
                        // SICHERE API Key Verwaltung - nur aus localStorage
                        const apiKey = document.getElementById('openai-api-key').value || 
                                      localStorage.getItem('openai-api-key');
                        
                        if (!apiKey || !apiKey.startsWith('sk-')) {
                            throw new Error('Gültiger OpenAI API Key erforderlich. Bitte API Key eingeben.');
                        }
                        
                        // Sichere Speicherung des API Keys (nur lokal, nie im Code)
                        localStorage.setItem('openai-api-key', apiKey);
                        
                        // ⚠️ WARNUNG: Client-Side API Calls sind NICHT sicher für Produktion
                        // Best Practice: API Calls sollten über einen Backend-Server laufen
                        
                        // Retry-Logik für neue API Keys (können Rate Limits haben)
                        let response;
                        let retryCount = 0;
                        const maxRetries = 2;
                        
                        while (retryCount <= maxRetries) {
                            try {
                                response = await fetch('https://api.openai.com/v1/chat/completions', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${apiKey}`
                                    },
                                    body: JSON.stringify({
                                        model: 'gpt-4o-mini',
                                        messages: [{
                                            role: 'user',
                                            content: 'Antworte nur mit: OK'
                                        }],
                                        max_tokens: 5,
                                        temperature: 0
                                    })
                                });
                                
                                // Erfolg - verlasse die Retry-Schleife
                                if (response.ok) {
                                    break;
                                }
                                
                                // Rate Limit (429) - versuche Retry
                                if (response.status === 429 && retryCount < maxRetries) {
                                    retryCount++;
                                    const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
                                    
                                    button.innerHTML = `<i class="fas fa-clock"></i> Rate Limit - Retry ${retryCount}/${maxRetries} in ${waitTime/1000}s...`;
                                    
                                    await new Promise(resolve => setTimeout(resolve, waitTime));
                                    continue;
                                }
                                
                                // Andere Fehler - verlasse die Schleife
                                break;
                                
                            } catch (fetchError) {
                                if (retryCount < maxRetries) {
                                    retryCount++;
                                    const waitTime = 2000; // 2 Sekunden bei Netzwerkfehlern
                                    
                                    button.innerHTML = `<i class="fas fa-wifi"></i> Netzwerkfehler - Retry ${retryCount}/${maxRetries}...`;
                                    
                                    await new Promise(resolve => setTimeout(resolve, waitTime));
                                    continue;
                                }
                                throw fetchError;
                            }
                        }
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            
                            // Spezifische Fehlerbehandlung für neue API Keys
                            if (response.status === 401) {
                                throw new Error('❌ Ungültiger API Key. Bitte überprüfen Sie Ihren OpenAI API Key.');
                            } else if (response.status === 429) {
                                // Bei neuen Keys kann Rate Limit auftreten
                                const retryAfter = response.headers.get('retry-after');
                                const waitTime = retryAfter ? `${retryAfter} Sekunden` : '1-2 Minuten';
                                throw new Error(`⏱️ Rate Limit erreicht.\n\nBei neuen API Keys normal!\nBitte warten Sie ${waitTime} und versuchen Sie es erneut.\n\nTipp: Versuchen Sie es in 2-3 Minuten nochmal.`);
                            } else if (response.status === 403) {
                                throw new Error('🚫 Unzureichende Berechtigung.\n\nMögliche Ursachen:\n• Kein Guthaben auf dem OpenAI Konto\n• API Key hat keine Chat-Berechtigung\n• Organisationsbeschränkung');
                            } else if (response.status === 400) {
                                throw new Error('📝 Ungültige Anfrage. Bitte API Key erneut eingeben.');
                            }
                            
                            throw new Error(`API Fehler (${response.status}): ${errorData.error?.message || response.statusText}`);
                        }
                        
                        const data = await response.json();
                        const testResult = data.choices[0].message.content;
                        
                        // Erfolg - zeige Warnung über Client-Side Implementierung
                        resultsContent.innerHTML = `
                            <div style="padding: 1rem; background: #dcfce7; border-radius: 8px; border-left: 4px solid #22c55e;">
                                <h5 style="margin: 0 0 1rem 0; color: #15803d;">
                                    <i class="fas fa-check-circle"></i> API Key Test erfolgreich!
                                </h5>
                                <div style="background: white; padding: 0.75rem; border-radius: 6px; border: 1px solid #d1fae5; margin-bottom: 1rem;">
                                    <div style="margin-bottom: 0.5rem;"><strong>API Antwort:</strong> "${testResult}"</div>
                                    <small style="color: #15803d;">
                                        <strong>✓ API Key gültig</strong><br>
                                        <strong>✓ Modell gpt-4o-mini verfügbar</strong><br>
                                        <strong>✓ Verbindung erfolgreich</strong><br>
                                        <strong>✓ Token verbraucht: ~${data.usage?.total_tokens || 'N/A'}</strong>
                                    </small>
                                </div>
                                <div style="background: #fef3c7; padding: 0.75rem; border-radius: 6px; border-left: 4px solid #f59e0b;">
                                    <small style="color: #92400e;">
                                        <strong>⚠️ Sicherheitshinweis:</strong><br>
                                        Diese Client-Side Implementierung ist nur für Tests geeignet.<br>
                                        Für Produktion sollten API Calls über einen sicheren Backend-Server erfolgen.
                                    </small>
                                </div>
                            </div>
                        `;
                        
                        button.innerHTML = '<i class="fas fa-check"></i> API funktioniert!';
                        button.style.background = '#059669';
                        
                    } catch (error) {
                        console.error('API Test Fehler:', error);
                        
                        // Fehler
                        resultsContent.innerHTML = `
                            <div style="padding: 1rem; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                                <h5 style="margin: 0 0 0.5rem 0; color: #7f1d1d;">
                                    <i class="fas fa-times-circle"></i> API Test fehlgeschlagen
                                </h5>
                                <p style="margin: 0; color: #7f1d1d; font-size: 0.875rem;">
                                    ${error.message}
                                </p>
                                <div style="background: #fecaca; padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem;">
                                    <small style="color: #7f1d1d;">
                                        Mögliche Ursachen:<br>
                                        • CORS-Einschränkung im Browser<br>
                                        • API Key ungültig oder abgelaufen<br>
                                        • Netzwerkprobleme
                                    </small>
                                </div>
                            </div>
                        `;
                        
                        button.innerHTML = '<i class="fas fa-times"></i> Fehlgeschlagen';
                        button.style.background = '#ef4444';
                    }
                    
                    resultsDiv.style.display = 'block';
                    
                    // Reset nach 3 Sekunden
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.background = '';
                        button.disabled = false;
                    }, 3000);
                },
                description: 'Direct OpenAI API test'
            },
            // ENTFERNT: load-sample-job - Keine Demo-Daten mehr erlaubt
            
            'toggle-api-key-visibility': {
                handler: () => {
                    const input = document.getElementById('openai-api-key');
                    const icon = event.target.closest('button').querySelector('i');
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.className = 'fas fa-eye-slash';
                    } else {
                        input.type = 'password';
                        icon.className = 'fas fa-eye';
                    }
                },
                description: 'Toggle API key visibility'
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
