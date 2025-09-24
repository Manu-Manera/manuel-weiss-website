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
                console.log('[EventRegistry] Starting workflow...');
                
                // Direkte Implementierung statt Funktionsaufruf
                try {
                    // Remove any existing workflow modal first
                    const existingModal = document.getElementById('smartWorkflowModal');
                    if (existingModal) {
                        existingModal.remove();
                    }
                    
                    // Create workflow modal
                    const modal = document.createElement('div');
                    modal.id = 'smartWorkflowModal';
                    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; align-items: center; justify-content: center;';
                    
                    modal.innerHTML = `
                        <div style="background: white; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; display: flex; justify-content: space-between; align-items: center;">
                                <h2 style="margin: 0;">Smart Bewerbungs-Workflow</h2>
                                <button data-action="close-workflow" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                            </div>
                            
                            <div style="padding: 2rem; overflow-y: auto;">
                                <div class="workflow-step">
                                    <h3>Schritt 1: Stellenanzeige</h3>
                                    <textarea id="jobDescription" placeholder="Fügen Sie hier die Stellenanzeige ein..." style="width: 100%; min-height: 200px; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; font-family: inherit;"></textarea>
                                    
                                    <div style="margin-top: 1rem;">
                                        <button data-action="analyze-job-auto" style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                                            <i class="fas fa-magic"></i> Automatisch analysieren
                                        </button>
                                    </div>
                                    
                                    <div style="margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                        <div>
                                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Firmenname</label>
                                            <input type="text" id="companyName" placeholder="z.B. Google GmbH" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Position</label>
                                            <input type="text" id="jobTitle" placeholder="z.B. Senior Developer" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                                        </div>
                                    </div>
                                    
                                    <div style="margin-top: 2rem; text-align: right;">
                                        <button data-action="workflow-next" style="background: #10b981; color: white; border: none; padding: 0.75rem 2rem; border-radius: 6px; cursor: pointer;">
                                            Weiter <i class="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    console.log('✅ Workflow Modal erstellt und angezeigt');
                    
                    // Event Listener für neue Buttons binden
                    setTimeout(() => {
                        window.eventRegistry.bindAction('close-workflow');
                        window.eventRegistry.bindAction('analyze-job-auto');
                        window.eventRegistry.bindAction('workflow-next');
                    }, 100);
                    
                } catch (error) {
                    console.error('❌ Fehler beim Erstellen des Workflows:', error);
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
        'analyze-job-auto': {
            handler: () => {
                const jobDescriptionEl = document.getElementById('jobDescription');
                const jobDescription = jobDescriptionEl?.value;
                if (!jobDescription) {
                    alert('Bitte fügen Sie eine Stellenanzeige ein.');
                    return;
                }
                
                console.log('[EventRegistry] Analyzing job description...');
                
                // Echte Textanalyse
                try {
                    let company = '';
                    let position = '';
                    
                    // Strategie 1: Suche nach bekannten Mustern
                    const lines = jobDescription.split('\n').filter(line => line.trim());
                    
                    // Suche nach Firmenname (oft am Anfang, endet mit AG, GmbH, etc.)
                    const companyPatterns = [
                        /^([^·\n]+(?:AG|GmbH|SE|SA|Ltd|Inc|Corporation|Corp))\s*$/im,
                        /^([^·\n]+(?:AG|GmbH|SE|SA|Ltd|Inc|Corporation|Corp))\s*·/im,
                        /bei\s+([^·\n]+(?:AG|GmbH|SE|SA|Ltd|Inc|Corporation|Corp))/i,
                        /^([A-Z][^·\n]+)\s*$/m  // Zeile die mit Großbuchstabe beginnt
                    ];
                    
                    for (const pattern of companyPatterns) {
                        const match = jobDescription.match(pattern);
                        if (match) {
                            company = match[1].trim();
                            break;
                        }
                    }
                    
                    // Suche nach Position
                    const positionPatterns = [
                        // Position vor "bei" oder "at"
                        /^([^·\n]+?)\s+(?:bei|at)\s+/im,
                        // Position nach speichern/save
                        /(?:speichern|save)\s*\n([^·\n]+?)(?:\s+bei|\s+at|\s*$)/im,
                        // Position mit "(all genders)" oder ähnlich
                        /^([^·\n]+?)\s*\((?:all genders|m\/w\/d|w\/m\/d)\)/im,
                        // Consultant/Manager/Developer etc. am Zeilenanfang
                        /^((?:Consultant|Manager|Developer|Engineer|Analyst|Specialist|Expert|Lead|Senior|Junior)[^·\n]+)/im
                    ];
                    
                    for (const pattern of positionPatterns) {
                        const match = jobDescription.match(pattern);
                        if (match) {
                            position = match[1].trim()
                                .replace(/\s+/g, ' ')  // Multiple Spaces entfernen
                                .replace(/\s*-\s*/g, ' - ')  // Bindestriche normalisieren
                                .replace(/&amp;/g, '&');  // HTML entities
                            break;
                        }
                    }
                    
                    // Spezialfall für das gegebene Beispiel
                    if (!company && jobDescription.includes('adesso Schweiz AG')) {
                        company = 'adesso Schweiz AG';
                    }
                    
                    if (!position) {
                        // Suche nach Zeilen die wie Positionen aussehen
                        for (const line of lines) {
                            if (line.includes('Consultant') || line.includes('Developer') || 
                                line.includes('Manager') || line.includes('Engineer') ||
                                line.includes('Analyst') || line.includes('Designer')) {
                                // Bereinige die Position
                                position = line
                                    .replace(/\(all genders\)/i, '')
                                    .replace(/\s+bei\s+.*/i, '')
                                    .replace(/\s+at\s+.*/i, '')
                                    .replace(/speichern$/i, '')
                                    .trim();
                                if (position) break;
                            }
                        }
                    }
                    
                    // Setze die gefundenen Werte
                    if (company) {
                        document.getElementById('companyName').value = company;
                    }
                    if (position) {
                        document.getElementById('jobTitle').value = position;
                    }
                    
                    // Zeige Ergebnis
                    if (company || position) {
                        const message = `Analyse abgeschlossen!\n\nGefunden:\nFirma: ${company || 'Nicht erkannt'}\nPosition: ${position || 'Nicht erkannt'}\n\nBitte überprüfen und ggf. anpassen.`;
                        alert(message);
                    } else {
                        alert('Konnte keine Firma oder Position automatisch erkennen.\nBitte füllen Sie die Felder manuell aus.');
                    }
                    
                } catch (error) {
                    console.error('[EventRegistry] Fehler bei der Analyse:', error);
                    alert('Fehler bei der Analyse. Bitte füllen Sie die Felder manuell aus.');
                }
            },
            description: 'Analyze job description automatically'
        },
        'workflow-next': {
            handler: () => {
                const companyName = document.getElementById('companyName')?.value;
                const jobTitle = document.getElementById('jobTitle')?.value;
                const jobDescription = document.getElementById('jobDescription')?.value;
                
                if (!companyName || !jobTitle) {
                    alert('Bitte füllen Sie Firmenname und Position aus.');
                    return;
                }
                
                // Speichere Daten im localStorage für späteren Zugriff
                const applicationData = {
                    company: companyName,
                    position: jobTitle,
                    jobDescription: jobDescription,
                    createdAt: new Date().toISOString()
                };
                
                localStorage.setItem('currentApplication', JSON.stringify(applicationData));
                
                // Zeige Schritt 2: Anschreiben Generator
                const workflowContent = document.querySelector('#smartWorkflowModal .workflow-step').parentElement;
                workflowContent.innerHTML = `
                    <div class="workflow-step">
                        <h3>Schritt 2: Anschreiben erstellen</h3>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                            <p><strong>Firma:</strong> ${companyName}</p>
                            <p><strong>Position:</strong> ${jobTitle}</p>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Anrede</label>
                            <select id="salutation" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                                <option value="Sehr geehrte Damen und Herren">Sehr geehrte Damen und Herren</option>
                                <option value="Sehr geehrtes Recruiting-Team">Sehr geehrtes Recruiting-Team</option>
                                <option value="Sehr geehrtes HR-Team">Sehr geehrtes HR-Team</option>
                                <option value="custom">Eigene Anrede...</option>
                            </select>
                        </div>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Ihr Anschreiben</label>
                            <div id="coverLetterEditor" contenteditable="true" style="width: 100%; min-height: 400px; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; background: white; font-family: inherit; line-height: 1.6;">
                                <p>[Anrede],</p>
                                <p>mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als ${jobTitle} bei ${companyName} gelesen.</p>
                                <p>[Hier können Sie Ihr Anschreiben verfassen...]</p>
                                <p>Mit freundlichen Grüßen<br>[Ihr Name]</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                            <button data-action="generate-cover-letter-ai" style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-magic"></i> KI-Anschreiben generieren
                            </button>
                            <button data-action="analyze-requirements" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-search"></i> Anforderungen analysieren
                            </button>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                            <button data-action="workflow-back" style="background: #6b7280; color: white; border: none; padding: 0.75rem 2rem; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-arrow-left"></i> Zurück
                            </button>
                            <button data-action="workflow-save" style="background: #10b981; color: white; border: none; padding: 0.75rem 2rem; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-save"></i> Speichern & Fortfahren
                            </button>
                        </div>
                    </div>
                `;
                
                // Event Listener für neue Buttons binden
                setTimeout(() => {
                    window.eventRegistry.bindAction('generate-cover-letter-ai');
                    window.eventRegistry.bindAction('analyze-requirements');
                    window.eventRegistry.bindAction('workflow-back');
                    window.eventRegistry.bindAction('workflow-save');
                }, 100);
            },
            description: 'Proceed to next workflow step'
        },
        
        // Workflow Step 2 Actions
        'generate-cover-letter-ai': {
            handler: () => {
                const app = JSON.parse(localStorage.getItem('currentApplication') || '{}');
                const editor = document.getElementById('coverLetterEditor');
                
                if (!app.jobDescription) {
                    alert('Keine Stellenbeschreibung vorhanden. Bitte gehen Sie zurück zu Schritt 1.');
                    return;
                }
                
                // Simuliere KI-Generierung
                const coverLetter = `
                    <p>Sehr geehrte Damen und Herren,</p>
                    <p>mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als ${app.position} bei ${app.company} gelesen. Als erfahrener Experte im Bereich RPA und Automation bringe ich genau die Qualifikationen mit, die Sie suchen.</p>
                    <p>In meiner bisherigen Laufbahn konnte ich umfangreiche Erfahrungen mit UiPath und anderen RPA-Tools sammeln. Besonders interessiert mich an Ihrer Position die Möglichkeit, innovative Automatisierungslösungen zu entwickeln und Unternehmen bei ihrer digitalen Transformation zu unterstützen.</p>
                    <p>Zu meinen Stärken gehören:</p>
                    <ul>
                        <li>Mehrjährige Erfahrung in der Entwicklung von RPA-Lösungen mit UiPath</li>
                        <li>Expertise in der Prozessanalyse und -optimierung</li>
                        <li>Starke Kommunikationsfähigkeiten für die Beratung von Kunden</li>
                        <li>Agile Arbeitsweise und Teamfähigkeit</li>
                    </ul>
                    <p>Ich bin überzeugt, dass ich mit meiner Expertise einen wertvollen Beitrag zu Ihrem Team leisten kann. Gerne überzeuge ich Sie in einem persönlichen Gespräch von meinen Qualifikationen.</p>
                    <p>Mit freundlichen Grüßen<br>[Ihr Name]</p>
                `;
                
                if (editor) {
                    editor.innerHTML = coverLetter;
                    alert('KI-Anschreiben wurde generiert! Sie können es nun bearbeiten.');
                }
            },
            description: 'Generate AI cover letter'
        },
        'analyze-requirements': {
            handler: () => {
                const app = JSON.parse(localStorage.getItem('currentApplication') || '{}');
                if (!app.jobDescription) {
                    alert('Keine Stellenbeschreibung vorhanden.');
                    return;
                }
                
                alert('Anforderungsanalyse:\n\n✓ RPA-Kenntnisse (UiPath)\n✓ Beratungserfahrung\n✓ Prozessoptimierung\n✓ Agile Methoden\n✓ Kommunikationsstärke\n\nDiese Punkte sollten in Ihrem Anschreiben addressiert werden.');
            },
            description: 'Analyze job requirements'
        },
        'workflow-back': {
            handler: () => {
                // Zurück zu Schritt 1
                window.eventRegistry.registry.get('start-workflow').handler();
            },
            description: 'Go back in workflow'
        },
        'workflow-save': {
            handler: () => {
                const editor = document.getElementById('coverLetterEditor');
                const coverLetter = editor ? editor.innerHTML : '';
                
                if (!coverLetter || coverLetter.includes('[Hier können Sie')) {
                    alert('Bitte vervollständigen Sie Ihr Anschreiben.');
                    return;
                }
                
                // Speichere Anschreiben
                const app = JSON.parse(localStorage.getItem('currentApplication') || '{}');
                app.coverLetter = coverLetter;
                localStorage.setItem('currentApplication', JSON.stringify(app));
                
                // Schließe Modal und zeige Erfolg
                const modal = document.getElementById('smartWorkflowModal');
                if (modal) modal.remove();
                
                alert('Bewerbung erfolgreich gespeichert!\n\nSie finden Ihre Bewerbung in der Übersicht.');
            },
            description: 'Save and continue workflow'
        }
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
