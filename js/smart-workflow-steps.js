// Smart Workflow Steps with Requirement Analysis

// Main workflow function with Modal
window.startSmartBewerbungsWorkflow = function() {
    console.log('🚀 Starting Smart Bewerbungsworkflow...');
    try {
        showSmartWorkflowModal();
    } catch (error) {
        console.error('❌ Fehler beim Starten des Workflows:', error);
        alert('Workflow konnte nicht gestartet werden. Bitte versuchen Sie es erneut.');
    }
};

// Show Smart Workflow Modal
function showSmartWorkflowModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('smartWorkflowModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'smartWorkflowModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 0;
            width: 90%;
            max-width: 900px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px 16px 0 0;
                text-align: center;
            ">
                <h2 style="margin: 0 0 0.5rem; font-size: 2rem; font-weight: 700;">
                    🚀 Smart Bewerbungs-Workflow
                </h2>
                <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">
                    KI-unterstützte Bewerbungserstellung in 6 Schritten
                </p>
            </div>
            
            <div id="workflowContent" style="padding: 2rem;">
                <!-- Workflow content will be loaded here -->
            </div>
            
            <div style="
                padding: 1rem 2rem;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
                border-radius: 0 0 16px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div style="color: #6b7280; font-size: 0.875rem;">
                    Schritt <span id="currentStep">1</span> von 6
                </div>
                <button onclick="closeSmartWorkflow()" style="
                    padding: 0.5rem 1rem;
                    background: none;
                    border: 1px solid #d1d5db;
                    color: #6b7280;
                    border-radius: 6px;
                    cursor: pointer;
                ">
                    ✕ Schließen
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Start with step 1
    nextWorkflowStep(1);
};

// Initialize job analyzer when needed
async function initializeJobAnalyzer() {
    console.log('🔧 Initialisiere Job-Analyzer...');
    
    console.log('🔍 Prüfe window.jobAnalyzer Verfügbarkeit:', {
        jobAnalyzerExists: !!window.jobAnalyzer,
        hasUserProfile: !!(window.jobAnalyzer && window.jobAnalyzer.userProfile),
        hasSkills: !!(window.jobAnalyzer && window.jobAnalyzer.userProfile && window.jobAnalyzer.userProfile.skills),
        skillsLength: window.jobAnalyzer?.userProfile?.skills?.length || 0
    });
    
    if (!window.jobAnalyzer) {
        console.error('❌ FEHLER: window.jobAnalyzer ist nicht verfügbar!');
        console.log('💡 Stelle sicher, dass job-requirement-analyzer.js geladen ist');
        return;
    }
    
    if (!window.jobAnalyzer.userProfile.skills.length) {
        console.log('📚 User-Profile ist leer, analysiere Benutzerdokumente...');
        try {
        await window.jobAnalyzer.analyzeUserDocuments();
            console.log('✅ Benutzerdokumente analysiert');
            console.log('👤 User-Profile nach Analyse:', {
                skillsCount: window.jobAnalyzer.userProfile.skills.length,
                experiencesCount: window.jobAnalyzer.userProfile.experiences.length,
                hasWritingStyle: !!window.jobAnalyzer.userProfile.writingStyle
            });
        } catch (error) {
            console.error('❌ Fehler beim Analysieren der Benutzerdokumente:', error);
        }
    } else {
        console.log('✅ User-Profile bereits verfügbar mit', window.jobAnalyzer.userProfile.skills.length, 'Skills');
    }
}

// Initialize workflowData if not exists - FIXES "Cannot access uninitialized variable"
if (typeof workflowData === 'undefined') {
    window.workflowData = {
        company: 'Unternehmen nicht angegeben',
        position: 'Position nicht angegeben',
        jobDescription: '',
        requirements: [],
        selectedRequirements: [],
        currentStep: 1,
        skipRequirements: false,
        aiAnalysisResult: null,
        coverLetter: '',
        cv: null,
        design: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2'
        }
    };
    console.log('🔧 FIXED: workflowData initialized to prevent "Cannot access uninitialized variable" error');
}

// ======= MAIN WORKFLOW NAVIGATION FUNCTION =======
function nextWorkflowStep(step) {
    console.log('🔄 Moving to Smart-Workflow step:', step);
    window.workflowData.currentStep = step;
    
    const contentDiv = document.getElementById('workflowContent');
    if (!contentDiv) {
        console.error('❌ Workflow content div not found!');
        return;
    }
    
    // Update step counter
    const stepCounter = document.getElementById('currentStep');
    if (stepCounter) {
        stepCounter.textContent = step;
    }
    
    let content = '';
    
    switch(step) {
        case 1:
            content = generateStep1();
            break;
        case 2:
            content = window.generateStep2();
            break;
        case 3:
            content = window.generateStep3();
            // Initialize greeting and closing options
            setTimeout(() => {
                if (typeof updateGreeting === 'function') {
                    updateGreeting();
                }
            }, 100);
            break;
        case 4:
            content = generateStep4();
            break;
        case 5:
            content = generateStep5();
            break;
        case 6:
            content = generateStep6();
            break;
        default:
            content = generateStep1();
    }
    
    contentDiv.innerHTML = content;
    
    // Add smooth scroll animation
    contentDiv.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    console.log('✅ Smart-Workflow step content updated');
}

function previousWorkflowStep(step) {
    nextWorkflowStep(step);
}

// ====== SCHRITT 1 MIT 10 UMFANGREICHEN OPTIMIERUNGEN ======
function generateStep1() {
    // Inject advanced CSS for Step 1 optimizations
    injectStep1Styles();
    
    return `
        <div class="workflow-step-container step1-optimized" data-step="1">
            <!-- OPTIMIZATION 1: Progress Indicator with Animation -->
            <div class="progress-indicator">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 16.66%"></div>
                </div>
                <div class="step-circles">
                    <div class="circle active">1</div>
                    <div class="circle">2</div>
                    <div class="circle">3</div>
                    <div class="circle">4</div>
                    <div class="circle">5</div>
                    <div class="circle">6</div>
                </div>
            </div>

            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number-enhanced" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">1</span>
                    Stellenausschreibung analysieren
                    <!-- OPTIMIZATION 2: Real-time Help System -->
                    <button class="help-button" onclick="showStep1Help()" title="Hilfe zu diesem Schritt">
                        <i class="fas fa-question-circle"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Geben Sie die Grunddaten für Ihre Bewerbung ein - mit KI-Unterstützung</p>
            </div>
            
            <!-- OPTIMIZATION 3: Smart Company Input with Auto-Complete -->
            <div class="form-group enhanced" style="margin-bottom: 1.5rem;">
                <label class="enhanced-label" for="company">
                    <span class="label-text">Unternehmen *</span>
                    <span class="validation-indicator" id="companyValidation"></span>
                </label>
                <div class="input-container">
                    <input type="text" 
                           id="company" 
                           placeholder="Tippen Sie den Unternehmensnamen..." 
                           autocomplete="organization"
                           class="enhanced-input"
                           oninput="handleCompanyInput(this)"
                           onchange="window.workflowData.company = this.value"
                           onfocus="showInputFocus(this)"
                           onblur="hideInputFocus(this)"
                           onkeydown="handleKeyNavigation(event, 'company')"
                           aria-describedby="companyHelp">
                    <div class="input-actions">
                        <button type="button" class="clear-btn" onclick="clearInput('company')" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                        <button type="button" class="smart-fill-btn" onclick="smartFillCompany()" title="KI-Vorschläge">
                            <i class="fas fa-magic"></i>
                        </button>
                    </div>
                </div>
                <div id="companyAutocomplete" class="autocomplete-dropdown"></div>
                <div id="companyHelp" class="field-help">Wir finden automatisch Informationen über das Unternehmen</div>
            </div>
            
            <!-- OPTIMIZATION 4: Enhanced Position Input with Suggestions -->
            <div class="form-group enhanced" style="margin-bottom: 1.5rem;">
                <label class="enhanced-label" for="position">
                    <span class="label-text">Position *</span>
                    <span class="validation-indicator" id="positionValidation"></span>
                </label>
                <div class="input-container">
                    <input type="text" 
                           id="position" 
                           placeholder="z.B. Senior HR Consultant" 
                           autocomplete="job-title"
                           class="enhanced-input"
                           oninput="handlePositionInput(this)"
                           onchange="window.workflowData.position = this.value"
                           onfocus="showInputFocus(this)"
                           onblur="hideInputFocus(this)"
                           onkeydown="handleKeyNavigation(event, 'position')"
                           aria-describedby="positionHelp">
                    <div class="input-actions">
                        <button type="button" class="clear-btn" onclick="clearInput('position')" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                        <button type="button" class="suggest-btn" onclick="suggestPositions()" title="Positions-Vorschläge">
                            <i class="fas fa-lightbulb"></i>
                        </button>
                    </div>
                </div>
                <div id="positionSuggestions" class="suggestions-dropdown"></div>
                <div id="positionHelp" class="field-help">Wählen Sie eine passende Positionsbezeichnung</div>
            </div>
            
            <!-- OPTIMIZATION 5: Advanced Job Description Editor -->
            <div class="form-group enhanced" style="margin-bottom: 1.5rem;">
                <label class="enhanced-label" for="jobDescription">
                    <span class="label-text">Stellenbeschreibung</span>
                    <span class="char-counter">
                        <span id="charCount">0</span> / 5000 Zeichen
                    </span>
                </label>
                <div class="textarea-container">
                    <div class="textarea-toolbar">
                        <button type="button" onclick="pasteFromClipboard()" class="toolbar-btn" title="Aus Zwischenablage einfügen">
                            <i class="fas fa-clipboard"></i> Einfügen
                        </button>
                        <button type="button" onclick="formatJobDescription()" class="toolbar-btn" title="Text formatieren">
                            <i class="fas fa-magic"></i> Format
                        </button>
                        <button type="button" onclick="analyzeJobDescriptionLive()" class="toolbar-btn" title="Live-Analyse">
                            <i class="fas fa-search"></i> Analysieren
                        </button>
                    </div>
                    <textarea id="jobDescription" 
                              placeholder="Fügen Sie hier die komplette Stellenausschreibung ein...
                              
💡 Tipp: Kopieren Sie den kompletten Text aus der Original-Stellenanzeige
🔍 Die KI analysiert automatisch Anforderungen und Qualifikationen
📊 Je detaillierter, desto präziser wird das Anschreiben" 
                              class="enhanced-textarea"
                              oninput="handleJobDescriptionInput(this)"
                              onchange="window.workflowData.jobDescription = this.value"
                              onfocus="showInputFocus(this)"
                              onblur="hideInputFocus(this)"
                              onpaste="handlePasteEvent(event)"
                              aria-describedby="jobDescHelp"
                              spellcheck="true"></textarea>
                    
                    <!-- OPTIMIZATION 6: Live Analysis Panel -->
                    <div id="liveAnalysis" class="live-analysis-panel" style="display: none;">
                        <div class="analysis-header">
                            <span>Live-Analyse</span>
                            <div class="analysis-indicators">
                                <div class="indicator" id="companyDetection">
                                    <i class="fas fa-building"></i>
                                    <span>Firma erkannt</span>
                                </div>
                                <div class="indicator" id="requirementsDetection">
                                    <i class="fas fa-list"></i>
                                    <span>Anforderungen</span>
                                </div>
                                <div class="indicator" id="qualificationsDetection">
                                    <i class="fas fa-graduation-cap"></i>
                                    <span>Qualifikationen</span>
                                </div>
                            </div>
                        </div>
                        <div id="analysisContent" class="analysis-content"></div>
                    </div>
                </div>
                <div id="jobDescHelp" class="field-help">
                    <i class="fas fa-lightbulb"></i> 
                    Die KI analysiert automatisch Schlüsselwörter, Anforderungen und Unternehmenskultur
                </div>
            </div>

            <!-- OPTIMIZATION 7: Auto-Save Status -->
            <div class="auto-save-status">
                <div id="saveStatus" class="save-indicator">
                    <i class="fas fa-cloud"></i>
                    <span>Automatisch gespeichert</span>
                </div>
                <div class="last-saved">
                    Letzte Änderung: <span id="lastSaved">nie</span>
                </div>
            </div>

            <!-- OPTIMIZATION 8: Enhanced Action Bar -->
            <div class="action-bar enhanced">
                <div class="secondary-actions">
                    <!-- OPTIMIZATION 9: Import Options -->
                    <div class="import-options">
                        <button type="button" onclick="importFromLinkedIn()" class="import-btn" title="Von LinkedIn importieren">
                            <i class="fab fa-linkedin"></i>
                            LinkedIn
                        </button>
                        <button type="button" onclick="importFromXing()" class="import-btn" title="Von XING importieren">
                            <i class="fab fa-xing"></i>
                            XING
                        </button>
                        <button type="button" onclick="loadPreviousApplication()" class="import-btn" title="Vorherige Bewerbung laden">
                            <i class="fas fa-history"></i>
                            Vorlage
                        </button>
                    </div>
                </div>

                <div class="primary-actions">
                    <button onclick="closeSmartWorkflow()" 
                            class="btn-secondary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')"
                            onmousedown="addButtonEffect(this, 'active')"
                            onmouseup="removeButtonEffect(this, 'active')">
                        <i class="fas fa-times"></i> 
                        <span>Abbrechen</span>
                    </button>
                    <button onclick="saveStep1AndContinue()" 
                            id="step1ContinueBtn"
                            class="btn-primary enhanced"
                            disabled
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')"
                            onmousedown="addButtonEffect(this, 'active')"
                            onmouseup="removeButtonEffect(this, 'active')">
                        <span class="btn-content">
                            <span class="btn-text">Weiter zu Schritt 2</span>
                            <i class="fas fa-arrow-right btn-icon"></i>
                        </span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 10: Keyboard Shortcuts Help -->
            <div class="keyboard-shortcuts" id="keyboardHelp" style="display: none;">
                <div class="shortcuts-title">Tastenkürzel</div>
                <div class="shortcuts-list">
                    <div class="shortcut"><kbd>Ctrl</kbd> + <kbd>V</kbd> Stellenausschreibung einfügen</div>
                    <div class="shortcut"><kbd>Tab</kbd> Zwischen Feldern wechseln</div>
                    <div class="shortcut"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> Weiter zum nächsten Schritt</div>
                    <div class="shortcut"><kbd>F1</kbd> Diese Hilfe anzeigen</div>
                </div>
            </div>
        </div>
    `;
}

// Save Step 1 and Continue
function saveStep1AndContinue() {
    // Validate required fields
    const company = document.getElementById('company').value.trim();
    const position = document.getElementById('position').value.trim();
    const jobDescription = document.getElementById('jobDescription').value.trim();
    
    if (!company) {
        alert('Bitte geben Sie ein Unternehmen ein.');
        document.getElementById('company').focus();
        return;
    }
    
    if (!position) {
        alert('Bitte geben Sie eine Position ein.');
        document.getElementById('position').focus();
        return;
    }
    
    // Save to workflowData
    window.workflowData.company = company;
    window.workflowData.position = position;
    window.workflowData.jobDescription = jobDescription;
    
    console.log('✅ Step 1 data saved:', window.workflowData);
    
    // Move to next step
    nextWorkflowStep(2);
}

// Safe generateStep2 with error handling
window.generateStep2 = function() {
    // Ensure workflowData exists and has required properties
    const safeWorkflowData = window.workflowData || {
        company: 'Unternehmen nicht angegeben',
        position: 'Position nicht angegeben',
        jobDescription: ''
    };
    
    return `
        <div class="workflow-error-notice" style="background: #fef3c7; color: #92400e; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #f59e0b;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Legacy Workflow - Upgrade empfohlen</strong>
            </div>
            <p style="margin: 0.5rem 0 0;">Diese Version kann Fehler verursachen. Verwenden Sie die <a href="applications-modern.html" style="color: #92400e; font-weight: 600;">neue Architektur</a>.</p>
        </div>
        
        <h3 style="margin-bottom: 1.5rem;">Schritt 2: Anforderungsanalyse & Matching</h3>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0;"><strong>Unternehmen:</strong> ${safeWorkflowData.company || 'Nicht angegeben'}</p>
            <p style="margin: 0;"><strong>Position:</strong> ${safeWorkflowData.position || 'Nicht angegeben'}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">📋 Stellenanforderungen analysieren</h4>
            <button onclick="analyzeRequirements()" style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 1rem;">
                <i class="fas fa-search"></i> Anforderungen analysieren
            </button>
            
            <div id="requirementsAnalysis" style="display: none;">
                <!-- Requirements will be loaded here -->
            </div>
        </div>
        
        <div style="text-align: center; margin: 2rem 0;">
            <button onclick="skipToManualWriting()" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Überspringen - Ich schreibe selbst
            </button>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(1)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="proceedWithRequirements()" id="proceedButton" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: none;">
                Weiter zum Anschreiben <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
};

// New Step 3: Cover Letter Builder
window.generateStep3 = function() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 3: Anschreiben erstellen</h3>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0;"><strong>Unternehmen:</strong> ${safeWorkflowData.company || 'Nicht angegeben'}</p>
            <p style="margin: 0;"><strong>Position:</strong> ${safeWorkflowData.position || 'Nicht angegeben'}</p>
        </div>
        
        <!-- Source Selection -->
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Wo haben Sie die Stelle gefunden?</label>
            <select id="jobSource" onchange="updateGreeting()" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                <option value="Stellenanzeige">Stellenanzeige auf Ihrer Webseite</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Xing">Xing</option>
                <option value="Indeed">Indeed</option>
                <option value="StepStone">StepStone</option>
                <option value="Sonstiges">Sonstiges</option>
            </select>
        </div>
        
        <!-- Greeting Selection -->
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Einleitung:</label>
            <div id="greetingOptions" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <!-- Greeting options will be loaded here -->
            </div>
        </div>
        
        <!-- Main Content -->
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Hauptteil:</label>
            <div id="coverLetterContent" style="background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 6px; min-height: 300px;">
                <!-- Selected requirements and responses will be shown here -->
            </div>
        </div>
        
        <!-- Closing Selection -->
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Abschluss:</label>
            <div id="closingOptions" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <!-- Closing options will be loaded here -->
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <button onclick="previewFullLetter()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-eye"></i> Vorschau
            </button>
            <button onclick="exportCoverLetterPDF()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-file-pdf"></i> Als PDF
            </button>
            <button onclick="exportCoverLetterWord()" style="padding: 0.5rem 1rem; background: #0061a8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-file-word"></i> Als Word
            </button>
            <button onclick="exportCoverLetterODT()" style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-file-alt"></i> Als ODT
            </button>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(2)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAndContinue(5)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
};

// Generate Step 4: Document Creation and CV
function generateStep4() {
    return `
        <div class="workflow-step-container">
            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number" style="background: #6366f1; color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">4</span>
                    Lebenslauf und Dokumente
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Vervollständigen Sie Ihre Bewerbungsunterlagen</p>
            </div>
            
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <p style="margin: 0;"><strong>Unternehmen:</strong> ${window.workflowData.company || 'Nicht angegeben'}</p>
                <p style="margin: 0;"><strong>Position:</strong> ${window.workflowData.position || 'Nicht angegeben'}</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">📄 Lebenslauf optimieren</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <button onclick="loadExistingCV()" style="padding: 0.75rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-upload"></i> Vorhandenen CV laden
                    </button>
                    <button onclick="optimizeCV()" style="padding: 0.75rem 1rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-magic"></i> KI-Optimierung
                    </button>
                </div>
                <div id="cvPreview" style="display: none; background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 6px;">
                    <!-- CV Preview will be loaded here -->
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">📋 Zusätzliche Dokumente</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div style="border: 2px dashed #d1d5db; padding: 2rem; text-align: center; border-radius: 8px;">
                        <i class="fas fa-certificate" style="font-size: 2rem; color: #6b7280; margin-bottom: 1rem;"></i>
                        <p style="margin: 0;">Zertifikate</p>
                        <button onclick="uploadCertificates()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Hinzufügen
                        </button>
                    </div>
                    <div style="border: 2px dashed #d1d5db; padding: 2rem; text-align: center; border-radius: 8px;">
                        <i class="fas fa-graduation-cap" style="font-size: 2rem; color: #6b7280; margin-bottom: 1rem;"></i>
                        <p style="margin: 0;">Zeugnisse</p>
                        <button onclick="uploadReferences()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Hinzufügen
                        </button>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between;">
                <button onclick="previousWorkflowStep(3)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-arrow-left"></i> Zurück
                </button>
                <button onclick="nextWorkflowStep(5)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    Weiter <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

// Generate Step 5: Design and Layout
function generateStep5() {
    return `
        <div class="workflow-step-container">
            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number" style="background: #6366f1; color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">5</span>
                    Design und Layout
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Personalisieren Sie das Design Ihrer Bewerbung</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">🎨 Farbschema wählen</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem;">
                    <div onclick="selectColorScheme('blue')" style="cursor: pointer; padding: 1rem; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px; text-align: center; color: white;">
                        <div style="width: 40px; height: 40px; background: white; border-radius: 50%; margin: 0 auto 0.5rem; opacity: 0.8;"></div>
                        <span>Blau</span>
                    </div>
                    <div onclick="selectColorScheme('green')" style="cursor: pointer; padding: 1rem; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; text-align: center; color: white;">
                        <div style="width: 40px; height: 40px; background: white; border-radius: 50%; margin: 0 auto 0.5rem; opacity: 0.8;"></div>
                        <span>Grün</span>
                    </div>
                    <div onclick="selectColorScheme('purple')" style="cursor: pointer; padding: 1rem; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 8px; text-align: center; color: white;">
                        <div style="width: 40px; height: 40px; background: white; border-radius: 50%; margin: 0 auto 0.5rem; opacity: 0.8;"></div>
                        <span>Lila</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">📑 Layout-Vorlage</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div onclick="selectTemplate('modern')" style="cursor: pointer; border: 2px solid #e5e7eb; padding: 1rem; border-radius: 8px; text-align: center;">
                        <i class="fas fa-file-alt" style="font-size: 2rem; color: #6366f1; margin-bottom: 0.5rem;"></i>
                        <p style="margin: 0;">Modern</p>
                    </div>
                    <div onclick="selectTemplate('classic')" style="cursor: pointer; border: 2px solid #e5e7eb; padding: 1rem; border-radius: 8px; text-align: center;">
                        <i class="fas fa-file" style="font-size: 2rem; color: #6366f1; margin-bottom: 0.5rem;"></i>
                        <p style="margin: 0;">Klassisch</p>
                    </div>
                    <div onclick="selectTemplate('creative')" style="cursor: pointer; border: 2px solid #e5e7eb; padding: 1rem; border-radius: 8px; text-align: center;">
                        <i class="fas fa-paint-brush" style="font-size: 2rem; color: #6366f1; margin-bottom: 0.5rem;"></i>
                        <p style="margin: 0;">Kreativ</p>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between;">
                <button onclick="previousWorkflowStep(4)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-arrow-left"></i> Zurück
                </button>
                <button onclick="nextWorkflowStep(6)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    Weiter <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

// Generate Step 6: Download and Finish
function generateStep6() {
    return `
        <div class="workflow-step-container">
            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number" style="background: #10b981; color: white; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">6</span>
                    Download-Paket erstellen
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Ihre Bewerbungsunterlagen sind fertig!</p>
            </div>
            
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h4 style="color: #0c4a6e; margin-bottom: 1rem;">✅ Bewerbungspaket fertig!</h4>
                <p style="color: #0c4a6e; margin: 0;">Alle Dokumente wurden erfolgreich erstellt und sind bereit zum Download.</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">📦 Download-Optionen</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <button onclick="downloadPDF()" style="padding: 1rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-file-pdf" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                        Komplett-PDF
                    </button>
                    <button onclick="downloadWord()" style="padding: 1rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-file-word" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                        Word-Dokumente
                    </button>
                    <button onclick="downloadZIP()" style="padding: 1rem; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-file-archive" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                        ZIP-Paket
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">📧 E-Mail Vorlage</h4>
                <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 1rem; font-weight: 500;">Bewerbung als ${window.workflowData.position || '[Position]'} bei ${window.workflowData.company || '[Unternehmen]'}</p>
                    <button onclick="copyEmailTemplate()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-copy"></i> Vorlage kopieren
                    </button>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between;">
                <button onclick="previousWorkflowStep(5)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-arrow-left"></i> Zurück
                </button>
                <button onclick="finishWorkflow()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-check"></i> Workflow beenden
                </button>
            </div>
        </div>
    `;
}

// Close Smart Workflow
function closeSmartWorkflow() {
    const modal = document.getElementById('smartWorkflowModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Reset workflow data
    window.workflowData.currentStep = 1;
}

// Finish Workflow
function finishWorkflow() {
    alert('✅ Bewerbungsworkflow erfolgreich abgeschlossen!');
    closeSmartWorkflow();
}

// =================== SCHRITT 1 OPTIMIERUNGEN - JAVASCRIPT FUNKTIONEN ===================

// OPTIMIZATION 1: Advanced CSS Injection
function injectStep1Styles() {
    const styleId = 'step1-optimized-styles';
    if (document.getElementById(styleId)) return; // Already injected
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Progress Indicator */
        .progress-indicator { margin-bottom: 2rem; }
        .progress-bar { 
            height: 4px; 
            background: #e5e7eb; 
            border-radius: 2px; 
            margin-bottom: 1rem;
            overflow: hidden;
        }
        .progress-fill { 
            height: 100%; 
            background: linear-gradient(90deg, #6366f1, #8b5cf6); 
            transition: width 0.3s ease;
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }
        .step-circles { 
            display: flex; 
            justify-content: space-between; 
            max-width: 300px;
            margin: 0 auto;
        }
        .circle { 
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            background: #e5e7eb; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 600;
            color: #6b7280;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        .circle.active { 
            background: linear-gradient(135deg, #6366f1, #8b5cf6); 
            color: white; 
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        /* Enhanced Form Groups */
        .form-group.enhanced { 
            position: relative; 
            margin-bottom: 2rem;
        }
        .enhanced-label { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 0.5rem; 
            font-weight: 600; 
            color: #374151;
        }
        .validation-indicator {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
        }
        .validation-indicator.valid { background: #10b981; color: white; }
        .validation-indicator.invalid { background: #ef4444; color: white; }
        .validation-indicator.pending { background: #f59e0b; color: white; }
        
        /* Enhanced Inputs */
        .input-container { 
            position: relative; 
        }
        .enhanced-input { 
            width: 100%; 
            padding: 0.75rem 3rem 0.75rem 1rem; 
            border: 2px solid #e5e7eb; 
            border-radius: 12px; 
            font-size: 1rem; 
            transition: all 0.3s ease;
            background: white;
        }
        .enhanced-input:focus { 
            outline: none; 
            border-color: #6366f1; 
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            transform: translateY(-1px);
        }
        .enhanced-input.valid { border-color: #10b981; }
        .enhanced-input.invalid { border-color: #ef4444; }
        
        /* Input Actions */
        .input-actions { 
            position: absolute; 
            right: 8px; 
            top: 50%; 
            transform: translateY(-50%); 
            display: flex; 
            gap: 4px;
        }
        .clear-btn, .smart-fill-btn, .suggest-btn { 
            width: 32px; 
            height: 32px; 
            border: none; 
            border-radius: 6px; 
            background: #f3f4f6; 
            color: #6b7280; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            transition: all 0.2s ease;
        }
        .clear-btn:hover { background: #ef4444; color: white; }
        .smart-fill-btn:hover, .suggest-btn:hover { background: #6366f1; color: white; }
        
        /* Autocomplete Dropdown */
        .autocomplete-dropdown, .suggestions-dropdown { 
            position: absolute; 
            top: 100%; 
            left: 0; 
            right: 0; 
            background: white; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            max-height: 200px; 
            overflow-y: auto; 
            z-index: 1000;
            display: none;
        }
        .autocomplete-item, .suggestion-item { 
            padding: 0.75rem 1rem; 
            cursor: pointer; 
            border-bottom: 1px solid #f3f4f6;
            transition: background 0.2s ease;
        }
        .autocomplete-item:hover, .suggestion-item:hover { background: #f8fafc; }
        .autocomplete-item.selected, .suggestion-item.selected { background: #6366f1; color: white; }
        
        /* Enhanced Textarea */
        .textarea-container { position: relative; }
        .textarea-toolbar { 
            display: flex; 
            gap: 0.5rem; 
            margin-bottom: 0.5rem; 
            padding: 0.5rem; 
            background: #f8fafc; 
            border-radius: 8px 8px 0 0;
            border: 1px solid #e5e7eb;
            border-bottom: none;
        }
        .toolbar-btn { 
            padding: 0.5rem 1rem; 
            border: none; 
            background: white; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 0.875rem;
            transition: all 0.2s ease;
        }
        .toolbar-btn:hover { background: #6366f1; color: white; }
        
        .enhanced-textarea { 
            width: 100%; 
            min-height: 200px; 
            padding: 1rem; 
            border: 1px solid #e5e7eb; 
            border-top: none;
            border-radius: 0 0 8px 8px; 
            font-size: 1rem; 
            line-height: 1.6; 
            resize: vertical;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        .enhanced-textarea:focus { 
            outline: none; 
            border-color: #6366f1; 
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        /* Character Counter */
        .char-counter { 
            font-size: 0.875rem; 
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        .char-counter.warning { color: #f59e0b; }
        .char-counter.danger { color: #ef4444; }
        
        /* Live Analysis Panel */
        .live-analysis-panel { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            margin-top: 1rem; 
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .analysis-header { 
            padding: 1rem; 
            background: #f8fafc; 
            border-bottom: 1px solid #e5e7eb; 
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .analysis-indicators { 
            display: flex; 
            gap: 1rem;
        }
        .indicator { 
            display: flex; 
            align-items: center; 
            gap: 0.25rem; 
            font-size: 0.875rem; 
            color: #6b7280;
        }
        .indicator.active { color: #10b981; }
        .analysis-content { 
            padding: 1rem; 
            font-size: 0.875rem;
        }
        
        /* Auto-Save Status */
        .auto-save-status { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin: 1rem 0; 
            padding: 0.75rem 1rem; 
            background: #f0f9ff; 
            border-radius: 8px;
            border: 1px solid #bae6fd;
        }
        .save-indicator { 
            display: flex; 
            align-items: center; 
            gap: 0.5rem; 
            font-size: 0.875rem; 
            color: #0c4a6e;
        }
        .last-saved { 
            font-size: 0.875rem; 
            color: #6b7280;
        }
        
        /* Enhanced Action Bar */
        .action-bar.enhanced { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
            margin-top: 3rem; 
            padding-top: 2rem; 
            border-top: 1px solid #e5e7eb;
        }
        .import-options { 
            display: flex; 
            gap: 0.5rem; 
            flex-wrap: wrap;
        }
        .import-btn { 
            padding: 0.5rem 1rem; 
            border: 1px solid #e5e7eb; 
            background: white; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 0.875rem;
            transition: all 0.2s ease;
        }
        .import-btn:hover { border-color: #6366f1; color: #6366f1; }
        
        /* Enhanced Buttons */
        .btn-primary.enhanced, .btn-secondary.enhanced { 
            position: relative; 
            overflow: hidden; 
            padding: 1rem 2rem; 
            border: none; 
            border-radius: 12px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .btn-primary.enhanced { 
            background: linear-gradient(135deg, #6366f1, #8b5cf6); 
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .btn-primary.enhanced:hover:not(:disabled) { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }
        .btn-primary.enhanced:disabled { 
            opacity: 0.5; 
            cursor: not-allowed; 
            transform: none;
            box-shadow: none;
        }
        .btn-secondary.enhanced { 
            background: #6b7280; 
            color: white;
        }
        .btn-secondary.enhanced:hover { 
            background: #4b5563; 
            transform: translateY(-1px);
        }
        
        /* Ripple Effect */
        .btn-ripple { 
            position: absolute; 
            border-radius: 50%; 
            background: rgba(255,255,255,0.3); 
            transform: scale(0); 
            animation: ripple 0.6s linear;
        }
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
        
        /* Keyboard Shortcuts */
        .keyboard-shortcuts { 
            position: absolute; 
            bottom: 100%; 
            right: 0; 
            background: #1f2937; 
            color: white; 
            padding: 1rem; 
            border-radius: 8px; 
            width: 250px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .shortcuts-title { 
            font-weight: 600; 
            margin-bottom: 0.75rem; 
            color: #f9fafb;
        }
        .shortcuts-list { 
            display: flex; 
            flex-direction: column; 
            gap: 0.5rem;
        }
        .shortcut { 
            display: flex; 
            justify-content: space-between; 
            font-size: 0.875rem;
        }
        kbd { 
            background: #374151; 
            padding: 0.2rem 0.4rem; 
            border-radius: 4px; 
            font-size: 0.75rem;
        }
        
        /* Field Help */
        .field-help { 
            margin-top: 0.5rem; 
            font-size: 0.875rem; 
            color: #6b7280; 
            display: flex; 
            align-items: center; 
            gap: 0.25rem;
        }
        
        /* Help Button */
        .help-button { 
            background: none; 
            border: none; 
            color: #6366f1; 
            cursor: pointer; 
            font-size: 1.2rem;
            transition: all 0.2s ease;
        }
        .help-button:hover { 
            color: #4f46e5; 
            transform: scale(1.1);
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .step1-optimized { animation: fadeInUp 0.5s ease; }
    `;
    document.head.appendChild(style);
}

// OPTIMIZATION 2: Real-time Help System
function showStep1Help() {
    const helpModal = document.createElement('div');
    helpModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 20000; display: flex; 
        align-items: center; justify-content: center;
    `;
    
    helpModal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 16px; max-width: 500px; width: 90%;">
            <h3 style="margin: 0 0 1rem; color: #1f2937;">💡 Hilfe zu Schritt 1</h3>
            <div style="line-height: 1.6; color: #4b5563;">
                <p><strong>🏢 Unternehmen:</strong> Geben Sie den exakten Firmennamen ein. Wir suchen automatisch nach Informationen.</p>
                <p><strong>💼 Position:</strong> Verwenden Sie die genaue Stellenbezeichnung aus der Ausschreibung.</p>
                <p><strong>📋 Stellenbeschreibung:</strong> Kopieren Sie den kompletten Text der Stellenanzeige. Je mehr Details, desto besser wird die KI-Analyse.</p>
                <p><strong>⌨️ Tastenkürzel:</strong> Drücken Sie F1 für weitere Shortcuts.</p>
            </div>
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                    style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Verstanden
            </button>
        </div>
    `;
    
    document.body.appendChild(helpModal);
}

// OPTIMIZATION 3 & 4: Smart Input Handling
let companyAutocompleteData = [
    'Microsoft Deutschland GmbH', 'SAP SE', 'Siemens AG', 'BMW Group', 'Mercedes-Benz Group AG',
    'Bosch GmbH', 'Volkswagen AG', 'Allianz SE', 'Deutsche Bank AG', 'Bayer AG'
];

let positionSuggestions = [
    'Software Developer', 'Senior HR Consultant', 'Product Manager', 'Data Scientist',
    'Marketing Manager', 'Sales Representative', 'Business Analyst', 'Project Manager'
];

function handleCompanyInput(input) {
    const value = input.value;
    updateAutoSave();
    
    // Show/hide clear button
    const clearBtn = input.parentNode.querySelector('.clear-btn');
    if (clearBtn) {
        clearBtn.style.display = value ? 'flex' : 'none';
    }
    
    // Validate input
    validateField('company', value);
    
    // Show autocomplete
    if (value.length >= 2) {
        showAutocomplete('company', value);
    } else {
        hideAutocomplete('company');
    }
    
    // Update continue button state
    updateContinueButtonState();
}

function handlePositionInput(input) {
    const value = input.value;
    updateAutoSave();
    
    // Show/hide clear button
    const clearBtn = input.parentNode.querySelector('.clear-btn');
    if (clearBtn) {
        clearBtn.style.display = value ? 'flex' : 'none';
    }
    
    // Validate input
    validateField('position', value);
    
    // Update continue button state
    updateContinueButtonState();
}

function showAutocomplete(fieldType, query) {
    const dropdown = document.getElementById(fieldType + 'Autocomplete');
    if (!dropdown) return;
    
    const data = fieldType === 'company' ? companyAutocompleteData : positionSuggestions;
    const filtered = data.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filtered.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = filtered.map(item => `
        <div class="autocomplete-item" onclick="selectAutocomplete('${fieldType}', '${item}')">
            ${item}
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function hideAutocomplete(fieldType) {
    const dropdown = document.getElementById(fieldType + 'Autocomplete');
    if (dropdown) {
        setTimeout(() => dropdown.style.display = 'none', 200);
    }
}

function selectAutocomplete(fieldType, value) {
    const input = document.getElementById(fieldType);
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        hideAutocomplete(fieldType);
    }
}

// OPTIMIZATION 5 & 6: Advanced Job Description Handling
function handleJobDescriptionInput(textarea) {
    const value = textarea.value;
    updateAutoSave();
    
    // Update character counter
    updateCharCounter(value.length);
    
    // Live analysis
    if (value.length > 100) {
        performLiveAnalysis(value);
    } else {
        hideLiveAnalysis();
    }
    
    // Update continue button state
    updateContinueButtonState();
}

function updateCharCounter(count) {
    const counter = document.getElementById('charCount');
    const charCounter = counter?.parentElement;
    if (!counter || !charCounter) return;
    
    counter.textContent = count;
    
    charCounter.className = 'char-counter';
    if (count > 4500) charCounter.classList.add('danger');
    else if (count > 4000) charCounter.classList.add('warning');
}

function performLiveAnalysis(text) {
    const panel = document.getElementById('liveAnalysis');
    if (!panel) return;
    
    panel.style.display = 'block';
    
    // Simulate AI analysis
    setTimeout(() => {
        const results = analyzeJobText(text);
        updateAnalysisIndicators(results);
        updateAnalysisContent(results);
    }, 500);
}

function analyzeJobText(text) {
    const companies = text.match(/\b[A-Z][a-zA-Z\s]+(?:GmbH|AG|SE|Inc|Corp|Ltd)\b/g) || [];
    const requirements = text.match(/(?:erforderlich|notwendig|vorausgesetzt|benötigt|erwarten)[\s\S]*?(?:\.|;)/gi) || [];
    const qualifications = text.match(/(?:Studium|Ausbildung|Abschluss|Erfahrung|Jahre)[\s\S]*?(?:\.|;)/gi) || [];
    
    return {
        companies: [...new Set(companies)],
        requirements: requirements.slice(0, 5),
        qualifications: qualifications.slice(0, 5)
    };
}

function updateAnalysisIndicators(results) {
    const indicators = ['companyDetection', 'requirementsDetection', 'qualificationsDetection'];
    const counts = [results.companies.length, results.requirements.length, results.qualifications.length];
    
    indicators.forEach((id, index) => {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.className = 'indicator ' + (counts[index] > 0 ? 'active' : '');
        }
    });
}

function updateAnalysisContent(results) {
    const content = document.getElementById('analysisContent');
    if (!content) return;
    
    content.innerHTML = `
        ${results.companies.length > 0 ? `<p><strong>🏢 Erkannte Unternehmen:</strong> ${results.companies.join(', ')}</p>` : ''}
        ${results.requirements.length > 0 ? `<p><strong>📋 Anforderungen gefunden:</strong> ${results.requirements.length}</p>` : ''}
        ${results.qualifications.length > 0 ? `<p><strong>🎓 Qualifikationen gefunden:</strong> ${results.qualifications.length}</p>` : ''}
    `;
}

// OPTIMIZATION 7: Auto-Save System
let autoSaveTimeout;
function updateAutoSave() {
    clearTimeout(autoSaveTimeout);
    
    // Show saving status
    const saveStatus = document.getElementById('saveStatus');
    if (saveStatus) {
        saveStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Speichere...</span>';
    }
    
    autoSaveTimeout = setTimeout(() => {
        // Save to localStorage
        const data = {
            company: document.getElementById('company')?.value || '',
            position: document.getElementById('position')?.value || '',
            jobDescription: document.getElementById('jobDescription')?.value || '',
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('workflow-step1-draft', JSON.stringify(data));
        
        // Update UI
        if (saveStatus) {
            saveStatus.innerHTML = '<i class="fas fa-cloud"></i><span>Automatisch gespeichert</span>';
        }
        
        const lastSaved = document.getElementById('lastSaved');
        if (lastSaved) {
            lastSaved.textContent = new Date().toLocaleTimeString();
        }
    }, 1000);
}

// OPTIMIZATION 8 & 9: Enhanced Interactions
function showInputFocus(input) {
    input.style.borderColor = '#6366f1';
    input.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
}

function hideInputFocus(input) {
    if (!input.classList.contains('invalid')) {
        input.style.borderColor = '#e5e7eb';
        input.style.boxShadow = 'none';
    }
}

function clearInput(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        input.focus();
    }
}

function addButtonEffect(button, type) {
    if (type === 'hover' && !button.disabled) {
        button.style.transform = 'translateY(-2px)';
    } else if (type === 'active' && !button.disabled) {
        // Add ripple effect
        const rect = button.getBoundingClientRect();
        const ripple = button.querySelector('.btn-ripple') || document.createElement('div');
        ripple.className = 'btn-ripple';
        
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.transform = 'translate(-50%, -50%) scale(0)';
        
        if (!button.querySelector('.btn-ripple')) {
            button.appendChild(ripple);
        }
        
        ripple.style.animation = 'ripple 0.6s linear';
    }
}

function removeButtonEffect(button, type) {
    if (type === 'hover') {
        button.style.transform = '';
    }
}

// OPTIMIZATION 10: Validation & State Management
function validateField(fieldName, value) {
    const indicator = document.getElementById(fieldName + 'Validation');
    const input = document.getElementById(fieldName);
    
    if (!indicator || !input) return false;
    
    let isValid = false;
    
    switch (fieldName) {
        case 'company':
            isValid = value.length >= 2;
            break;
        case 'position':
            isValid = value.length >= 3;
            break;
        case 'jobDescription':
            isValid = value.length >= 50;
            break;
    }
    
    // Update UI
    indicator.className = 'validation-indicator ' + (isValid ? 'valid' : (value.length > 0 ? 'invalid' : ''));
    indicator.innerHTML = isValid ? '✓' : (value.length > 0 ? '✗' : '');
    
    input.className = input.className.replace(/(valid|invalid)/g, '') + (isValid ? ' valid' : (value.length > 0 ? ' invalid' : ''));
    
    return isValid;
}

function updateContinueButtonState() {
    const button = document.getElementById('step1ContinueBtn');
    if (!button) return;
    
    const company = document.getElementById('company')?.value || '';
    const position = document.getElementById('position')?.value || '';
    
    const isValid = validateField('company', company) && validateField('position', position);
    
    button.disabled = !isValid;
    button.style.opacity = isValid ? '1' : '0.5';
}

// Utility Functions
function pasteFromClipboard() {
    navigator.clipboard.readText().then(text => {
        const textarea = document.getElementById('jobDescription');
        if (textarea) {
            textarea.value = text;
            textarea.dispatchEvent(new Event('input'));
        }
    });
}

function formatJobDescription() {
    const textarea = document.getElementById('jobDescription');
    if (textarea) {
        // Simple formatting: clean up extra whitespace
        textarea.value = textarea.value.replace(/\n\s*\n/g, '\n\n').trim();
        textarea.dispatchEvent(new Event('input'));
    }
}

function handlePasteEvent(event) {
    setTimeout(() => {
        const textarea = event.target;
        textarea.dispatchEvent(new Event('input'));
    }, 10);
}

function handleKeyNavigation(event, fieldName) {
    // Ctrl+Enter to continue
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        const continueBtn = document.getElementById('step1ContinueBtn');
        if (continueBtn && !continueBtn.disabled) {
            continueBtn.click();
        }
    }
    
    // F1 for help
    if (event.key === 'F1') {
        event.preventDefault();
        showStep1Help();
    }
}

// Import Functions (Placeholders for future implementation)
function importFromLinkedIn() {
    alert('LinkedIn Import wird in einer zukünftigen Version verfügbar sein.');
}

function importFromXing() {
    alert('XING Import wird in einer zukünftigen Version verfügbar sein.');
}

function loadPreviousApplication() {
    const saved = localStorage.getItem('workflow-step1-draft');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('company').value = data.company || '';
        document.getElementById('position').value = data.position || '';
        document.getElementById('jobDescription').value = data.jobDescription || '';
        
        // Trigger input events to update validation
        ['company', 'position', 'jobDescription'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.dispatchEvent(new Event('input'));
        });
    }
}

// Analyze requirements function
async function analyzeRequirements() {
    console.log('🚀 === SMART WORKFLOW SCHRITT 2: KI-ANFORDERUNGSANALYSE ===');
    
    const analysisDiv = document.getElementById('requirementsAnalysis');
    if (!analysisDiv) {
        console.error('❌ Element "requirementsAnalysis" nicht gefunden!');
        return;
    }
    
    console.log('✅ UI-Element gefunden, zeige Loading-Status...');
    analysisDiv.style.display = 'block';
    analysisDiv.innerHTML = '<p style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> KI analysiert Stellenbeschreibung...</p>';
    
    console.log('📋 Workflow-Daten verfügbar:', {
        hasWorkflowData: !!workflowData,
        hasJobDescription: !!(workflowData && workflowData.jobDescription),
        jobDescriptionLength: workflowData?.jobDescription?.length || 0,
        company: workflowData?.company || 'NICHT GESETZT',
        position: workflowData?.position || 'NICHT GESETZT'
    });
    
    if (!workflowData || !workflowData.jobDescription) {
        console.error('❌ FEHLER: Keine Stellenbeschreibung in workflowData gefunden!');
        console.log('🔍 workflowData Inhalt:', workflowData);
        analysisDiv.innerHTML = '<p style="color: #ef4444;">❌ Fehler: Keine Stellenbeschreibung gefunden. Bitte gehen Sie zurück zu Schritt 1.</p>';
        return;
    }
    
    console.log('🤖 Prüfe KI-Service Verfügbarkeit...');
    if (window.globalAI && window.globalAI.isAPIReady()) {
        console.log('✅ GlobalAI Service verfügbar, starte KI-Analyse...');
        
        try {
            // KI-basierte Analyse verwenden
            console.log('🔍 Starte KI-Analyse der Stellenbeschreibung...');
            console.log('📄 Stellenbeschreibung Vorschau:', window.workflowData.jobDescription.substring(0, 200) + '...');
            
            const aiResult = await window.globalAI.analyzeJobPosting(window.workflowData.jobDescription);
            console.log('🤖 KI-Analyse erfolgreich abgeschlossen:', aiResult);
            
            // Verwende die KI-analysierten Anforderungen
            const requirements = aiResult.requirements || [];
            
            console.log('📊 KI-Analyse-Ergebnisse:', {
                requirementsFound: requirements.length,
                mustHave: aiResult.aiAnalysis?.mustHaveCount || 0,
                niceToHave: aiResult.aiAnalysis?.niceToHaveCount || 0,
                technologies: aiResult.technologies?.length || 0,
                benefits: aiResult.benefits?.length || 0
            });
            
            if (requirements.length === 0) {
                console.warn('⚠️ KI konnte keine Anforderungen extrahieren!');
                analysisDiv.innerHTML = `
                    <div style="background: #fef3c7; padding: 1rem; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; color: #92400e;"><strong>⚠️ Keine Anforderungen erkannt</strong><br>
                        Die KI-Analyse konnte keine spezifischen Anforderungen identifizieren. Bitte überprüfen Sie die Stellenbeschreibung.</p>
                    </div>
                `;
                return;
            }
            
            console.log('✅ Speichere KI-Anforderungen in Workflow-Daten...');
    // Store requirements in workflow data
    window.workflowData.requirements = requirements;
            window.workflowData.aiAnalysisResult = aiResult; // Speichere vollständiges KI-Ergebnis
            
            // Zeige KI-Anforderungen in der UI an
            await displayAIRequirements(aiResult, requirements);
            
        } catch (error) {
            console.error('❌ KI-Analyse fehlgeschlagen:', error);
            
            // KEINE FALLBACK-ANALYSE - KI ist erforderlich
            analysisDiv.innerHTML = `
                <div style="background: #fef2f2; padding: 1rem; border-radius: 6px; border-left: 4px solid #ef4444;">
                    <h5 style="margin: 0 0 0.5rem 0; color: #dc2626;">❌ KI-Analyse fehlgeschlagen</h5>
                    <p style="margin: 0; color: #dc2626;">
                        <strong>Fehler:</strong> ${error.message}<br><br>
                        <strong>Mögliche Ursachen:</strong><br>
                        • OpenAI API Key nicht konfiguriert<br>
                        • Keine Internet-Verbindung<br>
                        • API-Quota aufgebraucht<br><br>
                        <strong>Lösung:</strong> Bitte konfigurieren Sie Ihren OpenAI API Key im Admin-Panel.
                    </p>
                    <div style="margin-top: 1rem;">
                        <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-cog"></i> Admin-Panel öffnen
                        </button>
                        <button onclick="analyzeRequirements()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                            <i class="fas fa-sync"></i> Erneut versuchen
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
    } else {
        console.warn('⚠️ GlobalAI Service nicht verfügbar oder API Key fehlt');
        console.log('🔧 GlobalAI Status:', {
            serviceExists: !!window.globalAI,
            isReady: window.globalAI?.isAPIReady?.(),
            status: window.globalAI?.getAPIStatus?.()
        });
        
        // KEINE FALLBACK-ANALYSE - KI ist zwingend erforderlich
        analysisDiv.innerHTML = `
            <div style="background: #fef2f2; padding: 1rem; border-radius: 6px; border-left: 4px solid #ef4444;">
                <h5 style="margin: 0 0 0.5rem 0; color: #dc2626;">❌ KI-Service nicht verfügbar</h5>
                <p style="margin: 0; color: #dc2626;">
                    <strong>Problem:</strong> OpenAI API Key nicht konfiguriert oder ungültig<br><br>
                    
                    <strong>Status:</strong><br>
                    • Service existiert: ${!!window.globalAI ? '✅' : '❌'}<br>
                    • API Ready: ${window.globalAI?.isAPIReady?.() ? '✅' : '❌'}<br><br>
                    
                    <strong>Erforderlich:</strong> Die Stellenanforderungen können nur mit KI-Analyse extrahiert werden.<br>
                    Lokale Pattern-Erkennung ist nicht mehr verfügbar.
                </p>
                <div style="margin-top: 1rem;">
                    <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-cog"></i> API Key konfigurieren
                    </button>
                    <button onclick="analyzeRequirements()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                        <i class="fas fa-sync"></i> Erneut versuchen
                    </button>
                </div>
            </div>
        `;
        return;
    }
}

// Funktion zur Anzeige der KI-analysierten Anforderungen
async function displayAIRequirements(aiResult, requirements) {
    console.log('🎨 Erstelle UI für KI-Anforderungen...');
    
    const analysisDiv = document.getElementById('requirementsAnalysis');
    
    let html = '<div style="margin-top: 1rem;">';
    
    // KI-Analyse Header mit Metadaten
    html += `
        <div style="background: #f0fdf4; padding: 1rem; border-radius: 6px; border-left: 4px solid #10b981; margin-bottom: 1.5rem;">
            <h5 style="margin: 0 0 0.5rem 0; color: #065f46;">🤖 KI-Analyse erfolgreich abgeschlossen</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 0.75rem;">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #10b981;">${aiResult.aiAnalysis.totalRequirements}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">Gesamt Anforderungen</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #ef4444;">${aiResult.aiAnalysis.mustHaveCount}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">Muss-Anforderungen</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #f59e0b;">${aiResult.aiAnalysis.niceToHaveCount}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">Kann-Anforderungen</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #6366f1;">${aiResult.technologies?.length || 0}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">Technologien</div>
                </div>
            </div>
        </div>
    `;
    
    // Zusätzliche Informationen falls verfügbar
    if (aiResult.technologies && aiResult.technologies.length > 0) {
        html += `
            <div style="background: #faf5ff; padding: 1rem; border-radius: 6px; border-left: 4px solid #8b5cf6; margin-bottom: 1rem;">
                <h6 style="margin: 0 0 0.5rem 0; color: #6b21a8;">🔧 Erkannte Technologien:</h6>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${aiResult.technologies.map(tech => `
                        <span style="background: #8b5cf6; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">
                            ${tech}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += '<h5 style="margin-bottom: 1rem;">🎯 Intelligente Anforderungsanalyse (nach Wichtigkeit sortiert):</h5>';
    
    // Zeige jede Anforderung mit verbesserter Darstellung
    for (const req of requirements) {
        // Lade Vorschläge wenn Job-Analyzer verfügbar ist
        let suggestions = [];
        if (window.jobAnalyzer && window.jobAnalyzer.generateMatchingSuggestions) {
            try {
                suggestions = await window.jobAnalyzer.generateMatchingSuggestions(req);
            } catch (error) {
                console.warn('Vorschläge-Generierung fehlgeschlagen für:', req.id, error);
                suggestions = ['Meine Erfahrung in diesem Bereich ermöglicht es mir, diese Anforderung zu erfüllen.'];
            }
        } else {
            // Standard-Vorschläge falls Job-Analyzer nicht verfügbar
            suggestions = [
                'Meine Erfahrung in diesem Bereich ermöglicht es mir, diese Anforderung zu erfüllen.',
                'Durch meine bisherige Tätigkeit konnte ich diese Kompetenzen erfolgreich entwickeln.'
            ];
        }
        req.matchingSuggestions = suggestions;
        
        const importanceColor = req.importance > 0.8 ? '#ef4444' : req.importance > 0.6 ? '#f59e0b' : req.importance > 0.4 ? '#10b981' : '#6b7280';
        const priorityText = req.isRequired ? 'MUSS' : 'KANN';
        const priorityColor = req.isRequired ? '#ef4444' : '#10b981';
        
        html += `
            <div class="requirement-item" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                            <span style="background: ${priorityColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                                ${priorityText}
                            </span>
                            <span style="background: ${importanceColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                                Wichtigkeit: ${Math.round(req.importance * 100)}%
                            </span>
                            <span style="background: #6b7280; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                                ${req.category || req.type}
                            </span>
                            ${req.years ? `<span style="background: #8b5cf6; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${req.years} Jahre</span>` : ''}
                        </div>
                        <div style="margin: 0; font-weight: 500; color: #1f2937; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; max-width: 100%;">
                            ${req.text}
                        </div>
                        ${req.keywords && req.keywords.length > 0 ? `
                            <div style="margin-top: 0.5rem;">
                                <span style="font-size: 0.75rem; color: #6b7280;">Keywords: </span>
                                ${req.keywords.map(keyword => `<span style="background: #f3f4f6; color: #374151; padding: 0.125rem 0.375rem; border-radius: 8px; font-size: 0.625rem; margin-right: 0.25rem;">${keyword}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <input type="checkbox" id="req-${req.id}" checked style="width: 20px; height: 20px; cursor: pointer; margin-left: 1rem;">
                </div>
                
                <div style="background: #f8fafc; padding: 1rem; border-radius: 6px;">
                    <p style="margin: 0 0 0.75rem 0; font-weight: 500; color: #666;">💡 Passende Formulierungen:</p>
                    <div id="suggestions-${req.id}">
                        ${suggestions.map((sug, idx) => `
                            <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
                                <input type="radio" name="suggestion-${req.id}" value="${idx}" ${idx === 0 ? 'checked' : ''} 
                                       style="margin-right: 0.5rem;">
                                <span contenteditable="true" style="outline: none; display: inline-block; padding: 0.5rem; background: white; border-radius: 4px; width: calc(100% - 30px);">
                                    ${sug.content || sug}
                                </span>
                            </label>
                        `).join('')}
                        <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
                            <input type="radio" name="suggestion-${req.id}" value="custom" style="margin-right: 0.5rem;">
                            <span contenteditable="true" style="outline: none; display: inline-block; padding: 0.5rem; background: white; border-radius: 4px; width: calc(100% - 30px);" 
                                  placeholder="Eigene Formulierung..."></span>
                        </label>
                    </div>
                    <button onclick="regenerateSuggestions('${req.id}')" style="margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                        <i class="fas fa-sync"></i> Neue Vorschläge
                    </button>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    analysisDiv.innerHTML = html;
    document.getElementById('proceedButton').style.display = 'block';
    
    console.log('✅ KI-Anforderungen UI erstellt');
}

// ENTFERNT: displayLocalRequirements - Nur noch KI-Analyse erlaubt

// Regenerate suggestions for a requirement
async function regenerateSuggestions(reqId) {
    const req = (window.workflowData.requirements || []).find(r => r.id === reqId);
    if (!req) return;
    
    // Generate new suggestions
    const newSuggestions = await window.jobAnalyzer.generateMatchingSuggestions(req);
    
    // Update UI
    const suggestionsDiv = document.getElementById(`suggestions-${reqId}`);
    if (suggestionsDiv) {
        suggestionsDiv.innerHTML = newSuggestions.map((sug, idx) => `
            <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
                <input type="radio" name="suggestion-${reqId}" value="${idx}" ${idx === 0 ? 'checked' : ''} 
                       style="margin-right: 0.5rem;">
                <span contenteditable="true" style="outline: none; display: inline-block; padding: 0.5rem; background: white; border-radius: 4px; width: calc(100% - 30px);">
                    ${sug.content}
                </span>
            </label>
        `).join('') + `
        <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
            <input type="radio" name="suggestion-${reqId}" value="custom" style="margin-right: 0.5rem;">
            <span contenteditable="true" style="outline: none; display: inline-block; padding: 0.5rem; background: white; border-radius: 4px; width: calc(100% - 30px);" 
                  placeholder="Eigene Formulierung..."></span>
        </label>
        `;
    }
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Neue Vorschläge generiert', 'success');
    }
}

// Skip to manual writing
function skipToManualWriting() {
    window.workflowData.skipRequirements = true;
    nextWorkflowStep(3);
}

// Proceed with selected requirements
function proceedWithRequirements() {
    // Collect selected requirements and their responses
    const selectedRequirements = [];
    
    (window.workflowData.requirements || []).forEach(req => {
        const checkbox = document.getElementById(`req-${req.id}`);
        if (checkbox && checkbox.checked) {
            const selectedRadio = document.querySelector(`input[name="suggestion-${req.id}"]:checked`);
            if (selectedRadio) {
                const suggestionText = selectedRadio.nextElementSibling.textContent.trim();
                selectedRequirements.push({
                    requirement: req,
                    response: suggestionText
                });
            }
        }
    });
    
    window.workflowData.selectedRequirements = selectedRequirements;
    nextWorkflowStep(3);
}

// Update greeting based on source
async function updateGreeting() {
    const source = document.getElementById('jobSource').value;
    const greetingDiv = document.getElementById('greetingOptions');
    
    if (!window.jobAnalyzer) return;
    
    const greetings = window.jobAnalyzer.generateGreetings(source);
    
    greetingDiv.innerHTML = `
        <label style="display: block; padding: 1rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;">
            <input type="radio" name="greeting" value="0" checked style="margin-right: 0.5rem;">
            <span contenteditable="true" style="outline: none;">${greetings.formal}</span>
        </label>
        ${greetings.variations.map((variation, idx) => `
            <label style="display: block; padding: 1rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;">
                <input type="radio" name="greeting" value="${idx + 1}" style="margin-right: 0.5rem;">
                <span contenteditable="true" style="outline: none;">${variation}</span>
            </label>
        `).join('')}
    `;
    
    // Also load closings
    loadClosingOptions();
}

// Load closing options
function loadClosingOptions() {
    const closingDiv = document.getElementById('closingOptions');
    
    if (!window.jobAnalyzer || !closingDiv) return;
    
    const closings = window.jobAnalyzer.generateClosings();
    
    closingDiv.innerHTML = `
        ${closings.variations.map((closing, idx) => `
            <label style="display: block; padding: 1rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;">
                <input type="radio" name="closing" value="${idx}" ${idx === 0 ? 'checked' : ''} style="margin-right: 0.5rem;">
                <span contenteditable="true" style="outline: none;">${closing}</span>
            </label>
        `).join('')}
        <div style="margin-top: 0.5rem; padding: 0.5rem; background: #f8fafc; border-radius: 6px;">
            <span style="font-weight: 500;">${closings.formal}</span>
        </div>
    `;
}

// Preview full letter
function previewFullLetter() {
    const selectedGreeting = document.querySelector('input[name="greeting"]:checked');
    const selectedClosing = document.querySelector('input[name="closing"]:checked');
    
    const greeting = selectedGreeting ? selectedGreeting.nextElementSibling.textContent : '';
    const closing = selectedClosing ? selectedClosing.nextElementSibling.textContent : '';
    const formal = window.jobAnalyzer ? window.jobAnalyzer.generateClosings().formal : 'Mit freundlichen Grüßen';
    
    // Build content from selected requirements
    let mainContent = '';
    if (window.workflowData.selectedRequirements) {
        mainContent = window.workflowData.selectedRequirements
            .map(item => `<p>${item.response}</p>`)
            .join('\n');
    }
    
    const fullLetter = `
        ${greeting}
        
        ${mainContent}
        
        <p>${closing}</p>
        
        <p>${formal}<br>
        Manuel Weiß</p>
    `;
    
    // Create preview modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h3 style="margin-bottom: 1.5rem;">Anschreiben Vorschau</h3>
            <div style="background: #f8fafc; padding: 2rem; border-radius: 6px; white-space: pre-line;">
                ${fullLetter}
            </div>
            <div style="margin-top: 1.5rem; text-align: right;">
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" 
                        style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Schließen
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Save to workflow data
    window.workflowData.coverLetter = fullLetter;
}

// Override the original generateSmartCoverLetter
window.generateSmartCoverLetter = async function() {
    // Initialize job analyzer
    await initializeJobAnalyzer();
    
    // Update greeting on load
    setTimeout(() => {
        updateGreeting();
        
        // Load selected requirements into main content
        const contentDiv = document.getElementById('coverLetterContent');
        if (contentDiv && window.workflowData.selectedRequirements) {
            contentDiv.innerHTML = window.workflowData.selectedRequirements
                .map((item, idx) => `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 6px;">
                        <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #666;">
                            <strong>Anforderung:</strong> ${item.requirement.text}
                        </p>
                        <p contenteditable="true" style="margin: 0; outline: none; padding: 0.5rem; background: white; border-radius: 4px;">
                            ${item.response}
                        </p>
                    </div>
                `)
                .join('');
        }
    }, 100);
};
