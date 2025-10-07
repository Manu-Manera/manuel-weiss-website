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

// ====== SCHRITT 2 MIT 10 UMFANGREICHEN OPTIMIERUNGEN ======
window.generateStep2 = function() {
    // Inject advanced CSS for Step 2 optimizations
    injectStep2Styles();
    
    const safeWorkflowData = window.workflowData || {
        company: 'Unternehmen nicht angegeben',
        position: 'Position nicht angegeben',
        jobDescription: ''
    };
    
    return `
        <div class="workflow-step-container step2-optimized" data-step="2">
            <!-- OPTIMIZATION 1: Enhanced Progress Indicator -->
            <div class="progress-indicator">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 33.33%"></div>
                </div>
                <div class="step-circles">
                    <div class="circle completed">1</div>
                    <div class="circle active">2</div>
                    <div class="circle">3</div>
                    <div class="circle">4</div>
                    <div class="circle">5</div>
                    <div class="circle">6</div>
                </div>
            </div>

            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number-enhanced" style="background: linear-gradient(135deg, #10b981, #059669); color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">2</span>
                    KI-Anforderungsanalyse & Smart Matching
                    <!-- OPTIMIZATION 2: Advanced Help System -->
                    <button class="help-button" onclick="showStep2Help()" title="Erweiterte Hilfe">
                        <i class="fas fa-question-circle"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Intelligente Analyse der Stellenanforderungen mit personalisierten Matching-Algorithmen</p>
            </div>
            
            <!-- Company/Position Summary with AI Insights -->
            <div class="company-summary-enhanced" style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid #bae6fd;">
                <div class="summary-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0; color: #0c4a6e; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-building"></i> Bewerbungsübersicht
                    </h4>
                    <div class="ai-confidence-badge" id="aiConfidence" style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;">
                        KI-Ready ✨
                    </div>
                </div>
                <div class="summary-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <p style="margin: 0; color: #0c4a6e;"><strong>🏢 Unternehmen:</strong> <span id="summaryCompany">${safeWorkflowData.company}</span></p>
                        <p style="margin: 0.5rem 0 0; color: #0c4a6e;"><strong>💼 Position:</strong> <span id="summaryPosition">${safeWorkflowData.position}</span></p>
                    </div>
                    <div>
                        <p style="margin: 0; color: #0c4a6e;"><strong>📄 Beschreibung:</strong> <span id="descriptionLength">${safeWorkflowData.jobDescription?.length || 0}</span> Zeichen</p>
                        <p style="margin: 0.5rem 0 0; color: #0c4a6e;"><strong>🎯 Bereit für:</strong> <span class="analysis-readiness">KI-Analyse</span></p>
                    </div>
                </div>
            </div>
            
            <!-- OPTIMIZATION 3: Multi-Mode Analysis Selection -->
            <div class="analysis-mode-selector" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🤖 Analyse-Modus wählen</h4>
                <div class="mode-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div class="mode-card active" data-mode="ai-full" onclick="selectAnalysisMode('ai-full')" style="border: 2px solid #10b981; background: #f0fdf4; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">🚀</div>
                        <h5 style="margin: 0 0 0.5rem; color: #166534;">Vollautomatische KI-Analyse</h5>
                        <p style="margin: 0; color: #15803d; font-size: 0.875rem;">Komplette Stellenanalyse mit Skill-Matching und Prioritäts-Ranking</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #059669;">
                            ✓ Anforderungsextraktion ✓ Skill-Matching ✓ Prioritäten-Ranking
                        </div>
                    </div>
                    
                    <div class="mode-card" data-mode="ai-assisted" onclick="selectAnalysisMode('ai-assisted')" style="border: 2px solid #e5e7eb; background: white; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">🤝</div>
                        <h5 style="margin: 0 0 0.5rem; color: #374151;">KI-Unterstützt</h5>
                        <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">KI schlägt vor, Sie wählen aus und passen an</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                            ✓ KI-Vorschläge ✓ Manuelle Auswahl ✓ Anpassungen
                        </div>
                    </div>
                    
                    <div class="mode-card" data-mode="manual" onclick="selectAnalysisMode('manual')" style="border: 2px solid #e5e7eb; background: white; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">✍️</div>
                        <h5 style="margin: 0 0 0.5rem; color: #374151;">Manuelle Auswahl</h5>
                        <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Selbst bestimmen welche Anforderungen relevant sind</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                            ✓ Vollkontrolle ✓ Eigene Bewertung ✓ Individuell
                        </div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 4: Real-time Analysis Dashboard -->
            <div class="analysis-dashboard" style="margin-bottom: 2rem;">
                <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h4 style="margin: 0; color: #374151;">📊 Live-Analyse Dashboard</h4>
                    <button onclick="refreshAnalysis()" class="refresh-btn" style="background: none; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #6b7280;">
                        <i class="fas fa-sync"></i> Aktualisieren
                    </button>
                </div>
                
                <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="requirementsFound" style="font-size: 2rem; font-weight: 800; color: #6366f1; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Anforderungen erkannt</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="skillMatches" style="font-size: 2rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Skill-Übereinstimmungen</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="matchingScore" style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Matching-Score</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="confidenceLevel" style="font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">KI-Vertrauen</div>
                    </div>
                </div>

                <!-- OPTIMIZATION 5: Smart Analysis Trigger -->
                <div class="analysis-trigger-section" style="text-align: center; margin-bottom: 2rem;">
                    <button onclick="startAdvancedAnalysis()" id="advancedAnalysisBtn" class="analysis-btn enhanced" 
                            style="padding: 1rem 2rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1.1rem; display: inline-flex; align-items: center; gap: 0.75rem; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); transition: all 0.3s ease;">
                        <div class="btn-icon">
                            <i class="fas fa-brain"></i>
                        </div>
                        <span class="btn-text">KI-Analyse starten</span>
                        <div class="btn-spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                    </button>
                    <div class="analysis-options" style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="deepAnalysis" checked style="margin: 0;">
                            Deep-Learning Analyse
                        </label>
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="industryContext" checked style="margin: 0;">
                            Branchen-Kontext
                        </label>
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="competitorAnalysis" style="margin: 0;">
                            Wettbewerbervergleich
                        </label>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 6: Interactive Requirements Display -->
            <div id="requirementsAnalysis" class="requirements-analysis-modern" style="display: none;">
                <!-- Advanced analysis results will be loaded here -->
            </div>

            <!-- OPTIMIZATION 7: Skill Gap Analysis -->
            <div id="skillGapAnalysis" class="skill-gap-section" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🎯 Skill-Gap Analyse</h4>
                <div class="skill-gap-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div class="matching-skills">
                        <h5 style="color: #10b981; margin-bottom: 1rem;">✅ Ihre Stärken</h5>
                        <div id="matchingSkillsList" class="skills-list"></div>
                    </div>
                    <div class="missing-skills">
                        <h5 style="color: #f59e0b; margin-bottom: 1rem;">🎯 Entwicklungspotential</h5>
                        <div id="missingSkillsList" class="skills-list"></div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 8: Advanced Action Bar -->
            <div class="action-bar enhanced step2">
                <div class="secondary-actions">
                    <!-- OPTIMIZATION 9: Smart Skip Options -->
                    <div class="skip-options">
                        <button type="button" onclick="skipWithTemplate()" class="skip-btn" title="Mit Vorlage überspringen">
                            <i class="fas fa-fast-forward"></i>
                            Mit Vorlage
                        </button>
                        <button type="button" onclick="skipToManualWriting()" class="skip-btn" title="Komplett überspringen">
                            <i class="fas fa-edit"></i>
                            Manuell schreiben
                        </button>
                        <button type="button" onclick="saveAndContinueLater()" class="skip-btn" title="Später fortfahren">
                            <i class="fas fa-bookmark"></i>
                            Später
                        </button>
                    </div>
                </div>

                <div class="primary-actions">
                    <button onclick="previousWorkflowStep(1)" 
                            class="btn-secondary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <i class="fas fa-arrow-left"></i> 
                        <span>Zurück</span>
                    </button>
                    <button onclick="proceedWithRequirements()" 
                            id="proceedButton" 
                            class="btn-primary enhanced"
                            style="display: none;"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <span class="btn-content">
                            <span class="btn-text">Weiter zu Schritt 3</span>
                            <i class="fas fa-arrow-right btn-icon"></i>
                        </span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 10: Performance Monitor -->
            <div class="performance-monitor" id="performanceMonitor" style="position: fixed; bottom: 2rem; right: 2rem; background: rgba(0,0,0,0.8); color: white; padding: 1rem; border-radius: 8px; font-size: 0.75rem; z-index: 9999; display: none;">
                <div>⚡ Analyse-Performance:</div>
                <div id="analysisTime">-</div>
                <div id="processingSpeed">-</div>
            </div>
        </div>
    `;
};

// ====== SCHRITT 3 MIT 10 UMFANGREICHEN OPTIMIERUNGEN ======
window.generateStep3 = function() {
    // Inject advanced CSS for Step 3 optimizations
    injectStep3Styles();
    
    const safeWorkflowData = window.workflowData || {
        company: 'Unternehmen nicht angegeben',
        position: 'Position nicht angegeben'
    };
    
    return `
        <div class="workflow-step-container step3-optimized" data-step="3">
            <!-- OPTIMIZATION 1: Advanced Progress Indicator -->
            <div class="progress-indicator">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 50%"></div>
                </div>
                <div class="step-circles">
                    <div class="circle completed">1</div>
                    <div class="circle completed">2</div>
                    <div class="circle active">3</div>
                    <div class="circle">4</div>
                    <div class="circle">5</div>
                    <div class="circle">6</div>
                </div>
            </div>

            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number-enhanced" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">3</span>
                    KI-Anschreiben Generator & Editor
                    <!-- OPTIMIZATION 2: Advanced Help System -->
                    <button class="help-button" onclick="showStep3Help()" title="Anschreiben-Hilfe">
                        <i class="fas fa-question-circle"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Erstellen Sie ein personalisiertes Anschreiben mit KI-Unterstützung und Live-Optimierung</p>
            </div>
            
            <!-- Company/Position Summary Enhanced -->
            <div class="application-summary-enhanced" style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid #f59e0b;">
                <div class="summary-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0; color: #92400e; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-edit"></i> Anschreiben-Übersicht
                    </h4>
                    <div class="writing-mode-badge" id="writingMode" style="background: #f59e0b; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;">
                        KI-Modus ✨
                    </div>
                </div>
                <div class="summary-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <p style="margin: 0; color: #92400e;"><strong>🏢 Unternehmen:</strong> ${safeWorkflowData.company}</p>
                        <p style="margin: 0.5rem 0 0; color: #92400e;"><strong>💼 Position:</strong> ${safeWorkflowData.position}</p>
                    </div>
                    <div>
                        <p style="margin: 0; color: #92400e;"><strong>📝 Anforderungen:</strong> <span id="reqCount">${window.workflowData?.requirements?.length || 0}</span></p>
                        <p style="margin: 0.5rem 0 0; color: #92400e;"><strong>🎯 Modus:</strong> <span id="currentMode">Vollautomatisch</span></p>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 3: Multi-Mode Writing Selection -->
            <div class="writing-mode-selector" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">✍️ Anschreiben-Modus wählen</h4>
                <div class="mode-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                    <div class="writing-mode-card active" data-mode="ai-generated" onclick="selectWritingMode('ai-generated')" style="border: 2px solid #f59e0b; background: #fef3c7; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">🤖</div>
                        <h5 style="margin: 0 0 0.5rem; color: #92400e;">KI-Vollgenerierung</h5>
                        <p style="margin: 0; color: #b45309; font-size: 0.875rem;">Komplettes Anschreiben automatisch erstellen basierend auf Anforderungsanalyse</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #d97706;">
                            ✓ Vollautomatisch ✓ Requirement-basiert ✓ Personalisiert
                        </div>
                    </div>
                    
                    <div class="writing-mode-card" data-mode="ai-assisted" onclick="selectWritingMode('ai-assisted')" style="border: 2px solid #e5e7eb; background: white; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">🖊️</div>
                        <h5 style="margin: 0 0 0.5rem; color: #374151;">KI-Unterstützter Editor</h5>
                        <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Rich-Text Editor mit KI-Vorschlägen und Live-Optimierung während des Schreibens</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                            ✓ Rich-Text Editor ✓ KI-Vorschläge ✓ Live-Feedback
                        </div>
                    </div>
                    
                    <div class="writing-mode-card" data-mode="template-based" onclick="selectWritingMode('template-based')" style="border: 2px solid #e5e7eb; background: white; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">📝</div>
                        <h5 style="margin: 0 0 0.5rem; color: #374151;">Template-Generator</h5>
                        <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Professionelle Vorlagen mit anpassbaren Bausteinen für verschiedene Branchen</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                            ✓ Branche-Templates ✓ Modulare Bausteine ✓ Anpassbar
                        </div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 4: Real-time Writing Dashboard -->
            <div class="writing-dashboard" style="margin-bottom: 2rem;">
                <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h4 style="margin: 0; color: #374151;">📊 Anschreiben-Dashboard</h4>
                    <div class="dashboard-controls" style="display: flex; gap: 0.5rem;">
                        <button onclick="toggleAutoOptimization()" id="autoOptimizeBtn" class="dashboard-btn" style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                            <i class="fas fa-magic"></i> Auto-Optimierung
                        </button>
                        <button onclick="refreshWritingMetrics()" class="dashboard-btn" style="background: none; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 0.875rem;">
                            <i class="fas fa-sync"></i>
                        </button>
                    </div>
                </div>
                
                <div class="writing-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="letterScore" style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Qualitäts-Score</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="wordCount" style="font-size: 2rem; font-weight: 800; color: #6366f1; margin-bottom: 0.5rem;">0</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Wörter</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="readabilityScore" style="font-size: 2rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Lesbarkeit</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="personalizationLevel" style="font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Personalisierung</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="requirementMatch" style="font-size: 2rem; font-weight: 800; color: #ef4444; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Req.-Match</div>
                    </div>
                </div>

                <!-- OPTIMIZATION 5: Smart Generation Trigger -->
                <div class="generation-section" style="text-align: center; margin-bottom: 2rem;">
                    <button onclick="startIntelligentGeneration()" id="generateBtn" class="generation-btn enhanced" 
                            style="padding: 1rem 2rem; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1.1rem; display: inline-flex; align-items: center; gap: 0.75rem; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); transition: all 0.3s ease;">
                        <div class="btn-icon">
                            <i class="fas fa-magic"></i>
                        </div>
                        <span class="btn-text">Anschreiben generieren</span>
                        <div class="btn-spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                    </button>
                    <div class="generation-options" style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="includeMotivation" checked style="margin: 0;">
                            Motivation einbeziehen
                        </label>
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="formalTone" checked style="margin: 0;">
                            Formeller Ton
                        </label>
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="includeAvailability" style="margin: 0;">
                            Verfügbarkeit erwähnen
                        </label>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 6: Advanced Letter Editor -->
            <div id="letterEditor" class="letter-editor-modern" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151;">📝 Anschreiben-Editor</h4>
                
                <!-- Source and Greeting Selection -->
                <div class="editor-sections" style="margin-bottom: 2rem;">
                    <div class="section-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div class="editor-section">
                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 500; color: #374151;">📍 Stellenquelle</label>
                            <select id="jobSource" onchange="updateGreetingOptions()" class="enhanced-select" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                <option value="website">Unternehmens-Website</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="xing">XING</option>
                                <option value="stepstone">StepStone</option>
                                <option value="indeed">Indeed</option>
                                <option value="referral">Empfehlung</option>
                                <option value="other">Sonstiges</option>
                            </select>
                        </div>
                        
                        <div class="editor-section">
                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 500; color: #374151;">👋 Anrede-Stil</label>
                            <select id="greetingStyle" onchange="updateGreetingPreview()" class="enhanced-select" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                <option value="formal">Sehr formell</option>
                                <option value="business">Geschäftlich</option>
                                <option value="modern">Modern</option>
                                <option value="personal">Persönlich</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Main Letter Content -->
                <div class="letter-content-editor" style="margin-bottom: 2rem;">
                    <div class="editor-toolbar" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px 8px 0 0; border: 1px solid #e5e7eb; border-bottom: none;">
                        <button onclick="formatText('bold')" class="toolbar-btn" title="Fett">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button onclick="formatText('italic')" class="toolbar-btn" title="Kursiv">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button onclick="formatText('underline')" class="toolbar-btn" title="Unterstreichen">
                            <i class="fas fa-underline"></i>
                        </button>
                        <div class="toolbar-separator"></div>
                        <button onclick="insertAIText()" class="toolbar-btn ai-btn" title="KI-Text einfügen">
                            <i class="fas fa-robot"></i>
                        </button>
                        <button onclick="optimizeCurrentParagraph()" class="toolbar-btn" title="Absatz optimieren">
                            <i class="fas fa-magic"></i>
                        </button>
                        <button onclick="checkGrammar()" class="toolbar-btn" title="Grammatik prüfen">
                            <i class="fas fa-spell-check"></i>
                        </button>
                    </div>
                    
                    <div class="letter-editor-container" style="position: relative;">
                        <div id="letterContent" class="rich-text-editor" contenteditable="true" 
                             style="min-height: 400px; padding: 2rem; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; font-family: 'Times New Roman', serif; line-height: 1.8; font-size: 1.1rem; background: white;"
                             oninput="updateLetterMetrics()" onpaste="handleRichTextPaste(event)">
                            <p>Klicken Sie hier oder verwenden Sie die KI-Generierung um Ihr Anschreiben zu erstellen...</p>
                        </div>
                        
                        <!-- Live AI Suggestions Panel -->
                        <div id="aiSuggestionsPanel" class="ai-suggestions-panel" style="position: absolute; right: -320px; top: 0; width: 300px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: none;">
                            <h6 style="margin: 0 0 1rem; color: #374151;">🤖 KI-Vorschläge</h6>
                            <div id="suggestionsList"></div>
                        </div>
                    </div>
                </div>

                <!-- Letter Structure Outline -->
                <div class="letter-structure" style="margin-bottom: 2rem;">
                    <h5 style="margin-bottom: 1rem; color: #374151;">📋 Anschreiben-Struktur</h5>
                    <div class="structure-checklist" style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div class="structure-item" data-section="header">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasHeader" onchange="validateLetterStructure()">
                                <span>📧 Kopfzeile (Adresse, Datum)</span>
                            </label>
                        </div>
                        <div class="structure-item" data-section="greeting">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasGreeting" onchange="validateLetterStructure()">
                                <span>👋 Anrede</span>
                            </label>
                        </div>
                        <div class="structure-item" data-section="intro">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasIntro" onchange="validateLetterStructure()">
                                <span>🎯 Einleitung (Motivation)</span>
                            </label>
                        </div>
                        <div class="structure-item" data-section="main">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasMain" onchange="validateLetterStructure()">
                                <span>📝 Hauptteil (Qualifikationen)</span>
                            </label>
                        </div>
                        <div class="structure-item" data-section="closing">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasClosing" onchange="validateLetterStructure()">
                                <span>🏁 Abschluss (Call-to-Action)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 7: Live Preview Panel -->
            <div id="livePreviewPanel" class="live-preview-panel" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151;">👁️ Live-Vorschau</h4>
                <div class="preview-container" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 2rem; font-family: 'Times New Roman', serif; line-height: 1.8; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div id="previewContent">
                        <!-- Live preview will be generated here -->
                    </div>
                </div>
                <div class="preview-actions" style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="printPreview()" class="preview-btn" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-print"></i> Drucken
                    </button>
                    <button onclick="copyToClipboard()" class="preview-btn" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-copy"></i> Kopieren
                    </button>
                    <button onclick="downloadAsDocx()" class="preview-btn" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-download"></i> DOCX
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 8: Enhanced Export Options -->
            <div class="export-section" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">💾 Export & Speichern</h4>
                <div class="export-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <button onclick="exportLetterPDF()" class="export-btn" style="padding: 1rem; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                        <i class="fas fa-file-pdf" style="font-size: 1.5rem;"></i>
                        <span style="font-weight: 600;">PDF Export</span>
                        <span style="font-size: 0.875rem; opacity: 0.9;">Für Bewerbung</span>
                    </button>
                    <button onclick="exportLetterWord()" class="export-btn" style="padding: 1rem; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                        <i class="fas fa-file-word" style="font-size: 1.5rem;"></i>
                        <span style="font-weight: 600;">Word Export</span>
                        <span style="font-size: 0.875rem; opacity: 0.9;">Zur Bearbeitung</span>
                    </button>
                    <button onclick="saveAsDraft()" class="export-btn" style="padding: 1rem; background: linear-gradient(135deg, #6b7280, #4b5563); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                        <i class="fas fa-save" style="font-size: 1.5rem;"></i>
                        <span style="font-weight: 600;">Als Entwurf</span>
                        <span style="font-size: 0.875rem; opacity: 0.9;">Später bearbeiten</span>
                    </button>
                    <button onclick="shareViaEmail()" class="export-btn" style="padding: 1rem; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                        <i class="fas fa-envelope" style="font-size: 1.5rem;"></i>
                        <span style="font-weight: 600;">E-Mail senden</span>
                        <span style="font-size: 0.875rem; opacity: 0.9;">Direkt versenden</span>
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 9: Advanced Action Bar -->
            <div class="action-bar enhanced step3">
                <div class="secondary-actions">
                    <div class="template-options">
                        <button type="button" onclick="loadTemplate('modern')" class="template-btn" title="Moderne Vorlage">
                            <i class="fas fa-rocket"></i>
                            Modern
                        </button>
                        <button type="button" onclick="loadTemplate('classic')" class="template-btn" title="Klassische Vorlage">
                            <i class="fas fa-building"></i>
                            Klassisch
                        </button>
                        <button type="button" onclick="loadTemplate('creative')" class="template-btn" title="Kreative Vorlage">
                            <i class="fas fa-palette"></i>
                            Kreativ
                        </button>
                        <button type="button" onclick="loadPreviousLetter()" class="template-btn" title="Vorherige Anschreiben">
                            <i class="fas fa-history"></i>
                            Vorherige
                        </button>
                    </div>
                </div>

                <div class="primary-actions">
                    <button onclick="previousWorkflowStep(2)" 
                            class="btn-secondary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <i class="fas fa-arrow-left"></i> 
                        <span>Zurück</span>
                    </button>
                    <button onclick="nextWorkflowStep(4)" 
                            id="continueStep3Btn" 
                            class="btn-primary enhanced"
                            style="display: none;"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <span class="btn-content">
                            <span class="btn-text">Weiter zu Schritt 4</span>
                            <i class="fas fa-arrow-right btn-icon"></i>
                        </span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 10: AI Writing Assistant Panel -->
            <div class="ai-assistant-panel" id="aiAssistantPanel" style="position: fixed; bottom: 2rem; left: 2rem; width: 300px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 8px 25px rgba(0,0,0,0.15); display: none; z-index: 9999;">
                <div class="assistant-header" style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
                    <h6 style="margin: 0; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-robot"></i> KI-Assistent
                    </h6>
                    <button onclick="toggleAIAssistant()" style="background: none; border: none; color: #6b7280; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="assistant-suggestions" id="aiSuggestions" style="font-size: 0.875rem; line-height: 1.5; color: #6b7280;">
                    <div class="suggestion-item" style="padding: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;" onclick="applySuggestion(this)">
                        💡 Erwähnen Sie Ihre relevante Berufserfahrung früher im Text
                    </div>
                    <div class="suggestion-item" style="padding: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;" onclick="applySuggestion(this)">
                        🎯 Fügen Sie konkrete Beispiele für Ihre Erfolge hinzu
                    </div>
                </div>
                <div class="assistant-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button onclick="generateMoreSuggestions()" style="flex: 1; padding: 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                        Mehr Tipps
                    </button>
                </div>
            </div>
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

// =================== SCHRITT 2 OPTIMIERUNGEN - JAVASCRIPT FUNKTIONEN ===================

// OPTIMIZATION 1: Advanced CSS Injection for Step 2
function injectStep2Styles() {
    const styleId = 'step2-optimized-styles';
    if (document.getElementById(styleId)) return; // Already injected
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Step 2 Specific Enhancements */
        .circle.completed { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .circle.completed::after {
            content: '✓';
            position: absolute;
        }
        
        /* Company Summary Enhanced */
        .company-summary-enhanced {
            animation: slideInFromTop 0.6s ease;
        }
        
        /* Analysis Mode Selector */
        .mode-card {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .mode-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .mode-card.active {
            transform: scale(1.02);
            box-shadow: 0 8px 30px rgba(16, 185, 129, 0.2);
        }
        .mode-card::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.1), transparent);
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .mode-card.active::before {
            opacity: 1;
        }
        
        /* Analysis Dashboard */
        .analysis-dashboard {
            animation: fadeInUp 0.8s ease 0.2s both;
        }
        
        /* Metric Cards */
        .metric-card {
            transition: all 0.3s ease;
            position: relative;
        }
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .metric-value {
            transition: all 0.5s ease;
        }
        .metric-card.updating .metric-value {
            transform: scale(1.1);
            color: #6366f1 !important;
        }
        
        /* Analysis Button Enhanced */
        .analysis-btn.enhanced {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .analysis-btn.enhanced:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }
        .analysis-btn.enhanced:active {
            transform: translateY(0) scale(0.98);
        }
        .analysis-btn.enhanced.processing {
            animation: pulse 2s infinite;
        }
        
        /* Requirements Analysis Modern */
        .requirements-analysis-modern {
            animation: slideInFromBottom 0.6s ease;
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid #e5e7eb;
        }
        
        /* Requirement Item Enhanced */
        .requirement-item-enhanced {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
            position: relative;
            cursor: pointer;
        }
        .requirement-item-enhanced:hover {
            border-color: #6366f1;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.1);
        }
        .requirement-item-enhanced.selected {
            border-color: #10b981;
            background: #f0fdf4;
        }
        .requirement-item-enhanced.priority-high {
            border-left: 4px solid #ef4444;
        }
        .requirement-item-enhanced.priority-medium {
            border-left: 4px solid #f59e0b;
        }
        .requirement-item-enhanced.priority-low {
            border-left: 4px solid #6b7280;
        }
        
        /* Skill Match Indicators */
        .skill-match-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
            margin: 0.25rem 0.5rem 0.25rem 0;
        }
        .skill-match-perfect {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        .skill-match-good {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .skill-match-partial {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        .skill-match-missing {
            background: #f3f4f6;
            color: #6b7280;
            border: 1px solid #d1d5db;
        }
        
        /* Skill Gap Analysis */
        .skill-gap-section {
            animation: slideInFromRight 0.6s ease;
        }
        .skills-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .skill-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            transition: all 0.2s ease;
        }
        .skill-item:hover {
            background: #f8fafc;
            border-color: #d1d5db;
        }
        
        /* Action Bar Enhanced for Step 2 */
        .action-bar.step2 {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 3rem;
        }
        .skip-options {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .skip-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .skip-btn:hover {
            border-color: #6366f1;
            color: #6366f1;
            transform: translateY(-1px);
        }
        
        /* Performance Monitor */
        .performance-monitor {
            font-family: 'Courier New', monospace;
            backdrop-filter: blur(10px);
        }
        
        /* Animations */
        @keyframes slideInFromTop {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInFromBottom {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInFromRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .step2-optimized { animation: fadeInUp 0.6s ease; }
    `;
    document.head.appendChild(style);
}

// OPTIMIZATION 2: Advanced Help System for Step 2
function showStep2Help() {
    const helpModal = document.createElement('div');
    helpModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 20000; display: flex; 
        align-items: center; justify-content: center;
    `;
    
    helpModal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 16px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin: 0 0 1rem; color: #1f2937;">🤖 Hilfe zu Schritt 2: KI-Analyse</h3>
            <div style="line-height: 1.6; color: #4b5563;">
                <h4 style="color: #10b981; margin: 1rem 0 0.5rem;">Analyse-Modi:</h4>
                <p><strong>🚀 Vollautomatisch:</strong> Die KI analysiert komplett eigenständig und erstellt optimale Vorschläge.</p>
                <p><strong>🤝 KI-Unterstützt:</strong> KI macht Vorschläge, Sie entscheiden was relevant ist.</p>
                <p><strong>✍️ Manuell:</strong> Sie haben vollständige Kontrolle über die Auswahl.</p>
                
                <h4 style="color: #10b981; margin: 1rem 0 0.5rem;">Dashboard-Metriken:</h4>
                <p><strong>📋 Anforderungen:</strong> Anzahl erkannter Stellenanforderungen</p>
                <p><strong>🎯 Skill-Matches:</strong> Übereinstimmungen mit Ihrem Profil</p>
                <p><strong>📊 Matching-Score:</strong> Gesamtbewertung Ihrer Eignung</p>
                <p><strong>🤖 KI-Vertrauen:</strong> Zuverlässigkeit der Analyse</p>
                
                <h4 style="color: #10b981; margin: 1rem 0 0.5rem;">Tipps:</h4>
                <p>• Lassen Sie die KI vollständig analysieren für beste Ergebnisse</p>
                <p>• Prüfen Sie die Skill-Gap Analyse für Verbesserungen</p>
                <p>• Nutzen Sie die Performance-Anzeige unten rechts</p>
            </div>
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                    style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Verstanden
            </button>
        </div>
    `;
    
    document.body.appendChild(helpModal);
}

// OPTIMIZATION 3: Multi-Mode Analysis Selection
let selectedAnalysisMode = 'ai-full';

function selectAnalysisMode(mode) {
    selectedAnalysisMode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.mode === mode) {
            card.classList.add('active');
        }
    });
    
    // Update analysis button text
    const analysisBtn = document.getElementById('advancedAnalysisBtn');
    if (analysisBtn) {
        const btnText = analysisBtn.querySelector('.btn-text');
        switch(mode) {
            case 'ai-full':
                btnText.textContent = 'KI-Vollanalyse starten';
                break;
            case 'ai-assisted':
                btnText.textContent = 'KI-Unterstützung starten';
                break;
            case 'manual':
                btnText.textContent = 'Manuelle Auswahl';
                break;
        }
    }
    
    console.log('🔧 Analysis mode selected:', mode);
}

// OPTIMIZATION 4: Real-time Dashboard Updates
function updateDashboardMetrics(metrics) {
    const elements = {
        requirementsFound: document.getElementById('requirementsFound'),
        skillMatches: document.getElementById('skillMatches'),
        matchingScore: document.getElementById('matchingScore'),
        confidenceLevel: document.getElementById('confidenceLevel')
    };
    
    Object.entries(metrics).forEach(([key, value]) => {
        const element = elements[key];
        if (element) {
            // Add updating animation
            element.parentElement.classList.add('updating');
            
            // Animate number change
            animateValue(element, parseInt(element.textContent) || 0, value, 1000);
            
            setTimeout(() => {
                element.parentElement.classList.remove('updating');
            }, 1000);
        }
    });
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// OPTIMIZATION 5: Advanced Analysis Engine
let analysisPerformanceStart;

async function startAdvancedAnalysis() {
    analysisPerformanceStart = performance.now();
    
    const btn = document.getElementById('advancedAnalysisBtn');
    const btnIcon = btn.querySelector('.btn-icon i');
    const btnText = btn.querySelector('.btn-text');
    const btnSpinner = btn.querySelector('.btn-spinner');
    
    // Show loading state
    btn.classList.add('processing');
    btn.disabled = true;
    btnIcon.style.display = 'none';
    btnSpinner.style.display = 'block';
    btnText.textContent = 'Analysiere...';
    
    // Show performance monitor
    const perfMonitor = document.getElementById('performanceMonitor');
    if (perfMonitor) {
        perfMonitor.style.display = 'block';
        updatePerformanceMonitor('Starte Analyse...', '0ms');
    }
    
    try {
        // Initialize job analyzer
        await initializeJobAnalyzer();
        
        // Get job description
        const jobDescription = window.workflowData.jobDescription;
        if (!jobDescription || jobDescription.length < 50) {
            throw new Error('Stellenbeschreibung zu kurz oder nicht vorhanden');
        }
        
        updatePerformanceMonitor('Extrahiere Anforderungen...', '~200ms');
        
        // Perform analysis based on selected mode
        let analysisResult;
        switch(selectedAnalysisMode) {
            case 'ai-full':
                analysisResult = await performFullAIAnalysis(jobDescription);
                break;
            case 'ai-assisted':
                analysisResult = await performAssistedAnalysis(jobDescription);
                break;
            case 'manual':
                analysisResult = await performManualAnalysis(jobDescription);
                break;
        }
        
        updatePerformanceMonitor('Berechne Skill-Matching...', '~500ms');
        
        // Update dashboard metrics
        updateDashboardMetrics({
            requirementsFound: analysisResult.requirements.length,
            skillMatches: analysisResult.skillMatches,
            matchingScore: analysisResult.matchingScore,
            confidenceLevel: analysisResult.confidenceLevel
        });
        
        // Display results
        displayAnalysisResults(analysisResult);
        
        // Show skill gap analysis if available
        if (analysisResult.skillGap) {
            displaySkillGapAnalysis(analysisResult.skillGap);
        }
        
        updatePerformanceMonitor('Analyse abgeschlossen', Math.round(performance.now() - analysisPerformanceStart) + 'ms');
        
        // Show proceed button
        const proceedBtn = document.getElementById('proceedButton');
        if (proceedBtn) {
            proceedBtn.style.display = 'flex';
        }
        
        // Store results
        window.workflowData.requirements = analysisResult.requirements;
        window.workflowData.aiAnalysisResult = analysisResult;
        
        console.log('✅ Analysis completed:', analysisResult);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        alert('Analyse fehlgeschlagen: ' + error.message);
        updatePerformanceMonitor('Fehler aufgetreten', 'ERROR');
    } finally {
        // Reset button state
        btn.classList.remove('processing');
        btn.disabled = false;
        btnIcon.style.display = 'block';
        btnSpinner.style.display = 'none';
        btnText.textContent = 'Analyse abgeschlossen';
        
        // Hide performance monitor after delay
        setTimeout(() => {
            if (perfMonitor) perfMonitor.style.display = 'none';
        }, 3000);
    }
}

// Analysis Mode Implementations
async function performFullAIAnalysis(jobDescription) {
    // Simulate advanced AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysisResult = {
        requirements: [
            {
                id: 1,
                text: "Mehrjährige Erfahrung in der Softwareentwicklung",
                priority: "high",
                category: "experience",
                skillMatch: "perfect",
                userResponse: "5+ Jahre Erfahrung in verschiedenen Technologien"
            },
            {
                id: 2,
                text: "Kenntnisse in agilen Entwicklungsmethoden",
                priority: "medium",
                category: "methodology",
                skillMatch: "good",
                userResponse: "Umfangreiche Scrum und Kanban Erfahrung"
            },
            {
                id: 3,
                text: "Teamfähigkeit und Kommunikationsstärke",
                priority: "high",
                category: "soft-skills",
                skillMatch: "perfect",
                userResponse: "Langjährige Teamerfahrung in internationalen Projekten"
            }
        ],
        skillMatches: 8,
        matchingScore: 92,
        confidenceLevel: 94,
        skillGap: {
            matching: ["JavaScript", "React", "Node.js", "Agile", "Teamarbeit"],
            missing: ["TypeScript", "Docker", "AWS"]
        }
    };
    
    return analysisResult;
}

async function performAssistedAnalysis(jobDescription) {
    // Simulate AI-assisted analysis with user input
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        requirements: [
            {
                id: 1,
                text: "Programmierkenntnisse erforderlich",
                priority: "high",
                category: "technical",
                skillMatch: "good",
                suggested: true
            },
            {
                id: 2,
                text: "Projekterfahrung wünschenswert",
                priority: "medium",
                category: "experience",
                skillMatch: "partial",
                suggested: true
            }
        ],
        skillMatches: 5,
        matchingScore: 78,
        confidenceLevel: 85,
        requiresUserInput: true
    };
}

async function performManualAnalysis(jobDescription) {
    // Simple text analysis for manual mode
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const keywords = ["Erfahrung", "Kenntnisse", "Fähigkeiten", "erforderlich", "wünschenswert"];
    const sentences = jobDescription.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    const requirements = sentences
        .filter(sentence => keywords.some(keyword => sentence.includes(keyword)))
        .slice(0, 5)
        .map((text, index) => ({
            id: index + 1,
            text: text.trim(),
            priority: "medium",
            category: "general",
            skillMatch: "unknown",
            manual: true
        }));
    
    return {
        requirements,
        skillMatches: 0,
        matchingScore: 50,
        confidenceLevel: 60,
        manualMode: true
    };
}

// OPTIMIZATION 6: Interactive Requirements Display
function displayAnalysisResults(result) {
    const container = document.getElementById('requirementsAnalysis');
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `
        <h4 style="margin-bottom: 1.5rem; color: #374151;">🎯 Erkannte Anforderungen (${result.requirements.length})</h4>
        
        <div class="requirements-grid" style="display: flex; flex-direction: column; gap: 1rem;">
            ${result.requirements.map(req => `
                <div class="requirement-item-enhanced priority-${req.priority} ${req.selected ? 'selected' : ''}" 
                     data-req-id="${req.id}" onclick="toggleRequirement(${req.id})">
                    <div class="requirement-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div class="requirement-text" style="flex: 1; margin-right: 1rem;">
                            <p style="margin: 0; font-weight: 500; color: #1f2937;">${req.text}</p>
                            <div class="requirement-meta" style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                                <span class="category-badge" style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">
                                    ${req.category}
                                </span>
                                <span class="priority-badge priority-${req.priority}">
                                    ${req.priority === 'high' ? '🔥 Hoch' : req.priority === 'medium' ? '⚡ Mittel' : '📋 Niedrig'}
                                </span>
                            </div>
                        </div>
                        <div class="skill-match-indicator skill-match-${req.skillMatch}">
                            ${getSkillMatchIcon(req.skillMatch)} ${getSkillMatchLabel(req.skillMatch)}
                        </div>
                    </div>
                    
                    ${req.userResponse ? `
                        <div class="user-response" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                            <p style="margin: 0; color: #166534; font-size: 0.875rem;"><strong>Ihre Antwort:</strong></p>
                            <p style="margin: 0.25rem 0 0; color: #15803d;">${req.userResponse}</p>
                        </div>
                    ` : `
                        <div class="response-input" style="margin-top: 1rem;">
                            <textarea placeholder="Beschreiben Sie Ihre Erfahrung zu dieser Anforderung..." 
                                      style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical; min-height: 60px;"
                                      onchange="updateRequirementResponse(${req.id}, this.value)"></textarea>
                        </div>
                    `}
                    
                    <div class="requirement-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button onclick="editRequirement(${req.id})" class="action-btn" style="padding: 0.25rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button onclick="duplicateRequirement(${req.id})" class="action-btn" style="padding: 0.25rem 0.75rem; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                            <i class="fas fa-copy"></i> Duplizieren
                        </button>
                        <button onclick="removeRequirement(${req.id})" class="action-btn" style="padding: 0.25rem 0.75rem; border: 1px solid #ef4444; color: #ef4444; background: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                            <i class="fas fa-trash"></i> Entfernen
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="analysis-summary" style="margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px;">
            <h5 style="margin: 0 0 1rem; color: #374151;">📊 Analyse-Zusammenfassung</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #6366f1;">${result.requirements.length}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">Anforderungen</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${result.skillMatches}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">Skill-Matches</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">${result.matchingScore}%</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">Übereinstimmung</div>
                </div>
            </div>
        </div>
    `;
}

function getSkillMatchIcon(match) {
    switch(match) {
        case 'perfect': return '🎯';
        case 'good': return '✅';
        case 'partial': return '🔶';
        case 'missing': return '❌';
        default: return '❓';
    }
}

function getSkillMatchLabel(match) {
    switch(match) {
        case 'perfect': return 'Perfekt';
        case 'good': return 'Gut';
        case 'partial': return 'Teilweise';
        case 'missing': return 'Fehlend';
        default: return 'Unbekannt';
    }
}

// OPTIMIZATION 7: Skill Gap Analysis Display
function displaySkillGapAnalysis(skillGap) {
    const container = document.getElementById('skillGapAnalysis');
    if (!container) return;
    
    container.style.display = 'block';
    
    const matchingList = document.getElementById('matchingSkillsList');
    const missingList = document.getElementById('missingSkillsList');
    
    if (matchingList) {
        matchingList.innerHTML = skillGap.matching.map(skill => `
            <div class="skill-item">
                <span>✅ ${skill}</span>
                <span style="font-size: 0.875rem; color: #10b981;">Vorhanden</span>
            </div>
        `).join('');
    }
    
    if (missingList) {
        missingList.innerHTML = skillGap.missing.map(skill => `
            <div class="skill-item">
                <span>🎯 ${skill}</span>
                <button onclick="addSkillToDevelopment('${skill}')" style="padding: 0.25rem 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 4px; font-size: 0.75rem;">
                    Lernen
                </button>
            </div>
        `).join('');
    }
}

// OPTIMIZATION 8-10: Utility Functions
function refreshAnalysis() {
    // Refresh the current analysis
    startAdvancedAnalysis();
}

function updatePerformanceMonitor(status, time) {
    const monitor = document.getElementById('performanceMonitor');
    if (!monitor) return;
    
    const timeElement = document.getElementById('analysisTime');
    const speedElement = document.getElementById('processingSpeed');
    
    if (timeElement) timeElement.textContent = `Status: ${status}`;
    if (speedElement) speedElement.textContent = `Zeit: ${time}`;
}

function toggleRequirement(id) {
    const element = document.querySelector(`[data-req-id="${id}"]`);
    if (element) {
        element.classList.toggle('selected');
    }
}

function updateRequirementResponse(id, response) {
    // Update the response for this requirement
    if (window.workflowData.requirements) {
        const req = window.workflowData.requirements.find(r => r.id === id);
        if (req) {
            req.userResponse = response;
        }
    }
}

// Skip and utility functions
function skipWithTemplate() {
    if (confirm('Mit Vorlage fortfahren? Dies verwendet Standard-Antworten.')) {
        // Load template responses
        window.workflowData.selectedRequirements = [
            { requirement: { text: "Berufserfahrung" }, response: "Mehrjährige relevante Berufserfahrung vorhanden" },
            { requirement: { text: "Teamarbeit" }, response: "Erfahrung in der Zusammenarbeit in verschiedenen Teams" }
        ];
        nextWorkflowStep(3);
    }
}

function saveAndContinueLater() {
    // Save current progress
    localStorage.setItem('workflow-step2-progress', JSON.stringify(window.workflowData));
    alert('Fortschritt gespeichert! Sie können später fortfahren.');
}

function addSkillToDevelopment(skill) {
    alert(`"${skill}" zur Entwicklungsliste hinzugefügt. Empfohlene Lernressourcen werden in einer zukünftigen Version verfügbar sein.`);
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

// =================== SCHRITT 3 OPTIMIERUNGEN - CSS UND JAVASCRIPT FUNKTIONEN ===================

// OPTIMIZATION 1: Advanced CSS Injection for Step 3
function injectStep3Styles() {
    const styleId = 'step3-optimized-styles';
    if (document.getElementById(styleId)) return; // Already injected
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Step 3 Optimizations Styling */
        .step3-optimized .writing-mode-card {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .step3-optimized .writing-mode-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .step3-optimized .writing-mode-card.active {
            background: linear-gradient(135deg, #fef3c7, #fde68a) !important;
            border-color: #f59e0b !important;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
        }
        
        .step3-optimized .writing-mode-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg);
            transition: all 0.3s ease;
            opacity: 0;
        }
        
        .step3-optimized .writing-mode-card:hover::before {
            animation: shimmer 1.5s ease-in-out;
            opacity: 1;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        /* Writing Dashboard Metrics */
        .writing-metrics-grid .metric-card {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .writing-metrics-grid .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: #f59e0b;
        }
        
        .metric-value {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: valueUpdate 0.5s ease-in-out;
        }
        
        @keyframes valueUpdate {
            0% { transform: scale(1.2); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* Generation Button Enhancement */
        .generation-btn.enhanced {
            position: relative;
            overflow: hidden;
        }
        
        .generation-btn.enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
        }
        
        .generation-btn.enhanced:active {
            transform: translateY(0);
        }
        
        /* Rich Text Editor */
        .rich-text-editor {
            transition: all 0.3s ease;
        }
        
        .rich-text-editor:focus {
            outline: none;
            border-color: #f59e0b;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }
        
        .editor-toolbar {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .toolbar-btn {
            padding: 0.5rem;
            border: 1px solid #e5e7eb;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
        }
        
        .toolbar-btn:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
        }
        
        .toolbar-btn.active {
            background: #f59e0b;
            color: white;
            border-color: #f59e0b;
        }
        
        .toolbar-btn.ai-btn {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            border-color: #8b5cf6;
        }
        
        .toolbar-separator {
            width: 1px;
            background: #e5e7eb;
            margin: 0 0.25rem;
        }
        
        /* Letter Structure Checklist */
        .structure-checkbox {
            transition: all 0.3s ease;
        }
        
        .structure-checkbox:hover {
            background: #f0fdf4 !important;
            border: 1px solid #10b981;
            border-radius: 6px;
        }
        
        .structure-checkbox input:checked + span {
            color: #10b981;
            font-weight: 600;
        }
        
        /* Export Grid Enhancement */
        .export-btn {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .export-btn:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
        }
        
        .export-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .export-btn:hover::before {
            left: 100%;
        }
        
        /* AI Assistant Panel */
        .ai-assistant-panel {
            animation: slideInLeft 0.3s ease-out;
        }
        
        @keyframes slideInLeft {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .suggestion-item {
            transition: all 0.3s ease;
        }
        
        .suggestion-item:hover {
            background: #e0f2fe !important;
            border: 1px solid #0284c7;
            transform: translateX(4px);
        }
        
        /* Enhanced Selects */
        .enhanced-select {
            position: relative;
        }
        
        .enhanced-select:focus {
            border-color: #f59e0b;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
            outline: none;
        }
        
        /* Live Preview Panel */
        .live-preview-panel {
            animation: fadeInUp 0.5s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .preview-btn {
            transition: all 0.3s ease;
        }
        
        .preview-btn:hover {
            background: #f59e0b !important;
            color: white !important;
            border-color: #f59e0b !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        
        /* Advanced Action Bar for Step 3 */
        .action-bar.step3 {
            padding: 1.5rem;
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            border-radius: 16px;
            margin-top: 2rem;
            border: 1px solid #f59e0b;
        }
        
        .template-options {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        
        .template-btn {
            padding: 0.75rem 1rem;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
        }
        
        .template-btn:hover {
            border-color: #f59e0b;
            background: #fef3c7;
            color: #92400e;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
        }
        
        /* Responsive Design for Step 3 */
        @media (max-width: 768px) {
            .step3-optimized .mode-grid {
                grid-template-columns: 1fr;
            }
            
            .step3-optimized .writing-metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .step3-optimized .export-grid {
                grid-template-columns: 1fr;
            }
            
            .step3-optimized .section-grid {
                grid-template-columns: 1fr;
            }
            
            .ai-assistant-panel {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                width: auto;
                border-radius: 12px 12px 0 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// =================== STEP 3 HELPER FUNCTIONS ===================

// OPTIMIZATION 2: Advanced Help System for Step 3
window.showStep3Help = function() {
    const helpModal = `
        <div id="step3HelpModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 1rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: #1f2937;">📝 Anschreiben-Generator Hilfe</h3>
                    <button onclick="closeStep3Help()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">&times;</button>
                </div>
                
                <div style="space-y: 1.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: #f59e0b; margin-bottom: 0.75rem;">🤖 KI-Modi erklärt</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: 0.75rem; background: #fef3c7; border-radius: 8px; margin-bottom: 0.5rem;">
                                <strong>KI-Vollgenerierung:</strong> Erstellt automatisch ein komplettes Anschreiben basierend auf Ihren Anforderungen und der Stellenanalyse.
                            </li>
                            <li style="padding: 0.75rem; background: #f3f4f6; border-radius: 8px; margin-bottom: 0.5rem;">
                                <strong>KI-Unterstützter Editor:</strong> Rich-Text Editor mit intelligenten Vorschlägen während Sie schreiben.
                            </li>
                            <li style="padding: 0.75rem; background: #f0f9ff; border-radius: 8px;">
                                <strong>Template-Generator:</strong> Wählen Sie aus professionellen Vorlagen und passen Sie diese an.
                            </li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: #10b981; margin-bottom: 0.75rem;">📊 Dashboard-Metriken</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;"><strong>Qualitäts-Score:</strong> Bewertet Struktur, Inhalt und Personalisierung</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;"><strong>Wörter:</strong> Aktuelle Wortanzahl (ideal: 200-400)</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;"><strong>Lesbarkeit:</strong> Verständlichkeits-Index</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;"><strong>Personalisierung:</strong> Grad der Anpassung an Stelle/Unternehmen</li>
                            <li style="padding: 0.5rem 0;"><strong>Req.-Match:</strong> Übereinstimmung mit Stellenanforderungen</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style="color: #6366f1; margin-bottom: 0.75rem;">⌨️ Tastenkürzel</h4>
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem; font-family: monospace; font-size: 0.875rem;">
                            <span>Ctrl+B</span><span>Text fett formatieren</span>
                            <span>Ctrl+I</span><span>Text kursiv formatieren</span>
                            <span>Ctrl+G</span><span>KI-Anschreiben generieren</span>
                            <span>Ctrl+S</span><span>Als Entwurf speichern</span>
                            <span>Ctrl+P</span><span>Vorschau anzeigen</span>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="closeStep3Help()" style="padding: 0.75rem 2rem; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Verstanden!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', helpModal);
};

window.closeStep3Help = function() {
    const modal = document.getElementById('step3HelpModal');
    if (modal) modal.remove();
};

// OPTIMIZATION 3: Multi-Mode Writing Selection
window.selectWritingMode = function(mode) {
    // Update visual selection
    document.querySelectorAll('.writing-mode-card').forEach(card => {
        card.classList.remove('active');
        card.style.border = '2px solid #e5e7eb';
        card.style.background = 'white';
    });
    
    const selectedCard = document.querySelector(`[data-mode="${mode}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Update mode badge
    const modeBadge = document.getElementById('writingMode');
    const currentModeSpan = document.getElementById('currentMode');
    
    switch(mode) {
        case 'ai-generated':
            if (modeBadge) modeBadge.textContent = 'KI-Vollmodus ✨';
            if (currentModeSpan) currentModeSpan.textContent = 'Vollautomatisch';
            break;
        case 'ai-assisted':
            if (modeBadge) modeBadge.textContent = 'KI-Assistent 🖊️';
            if (currentModeSpan) currentModeSpan.textContent = 'Unterstützt';
            break;
        case 'template-based':
            if (modeBadge) modeBadge.textContent = 'Template-Modus 📝';
            if (currentModeSpan) currentModeSpan.textContent = 'Template';
            break;
    }
    
    // Store selected mode
    if (!window.workflowData) window.workflowData = {};
    window.workflowData.writingMode = mode;
    
    // Show/hide relevant sections
    updateWritingInterface(mode);
};

function updateWritingInterface(mode) {
    const letterEditor = document.getElementById('letterEditor');
    const generateBtn = document.getElementById('generateBtn');
    
    if (mode === 'ai-generated') {
        if (letterEditor) letterEditor.style.display = 'none';
        if (generateBtn) {
            generateBtn.style.display = 'inline-flex';
            generateBtn.querySelector('.btn-text').textContent = 'KI-Anschreiben generieren';
        }
    } else if (mode === 'ai-assisted') {
        if (letterEditor) letterEditor.style.display = 'block';
        if (generateBtn) {
            generateBtn.style.display = 'inline-flex';
            generateBtn.querySelector('.btn-text').textContent = 'Editor mit KI-Unterstützung öffnen';
        }
    } else if (mode === 'template-based') {
        if (letterEditor) letterEditor.style.display = 'block';
        if (generateBtn) {
            generateBtn.style.display = 'inline-flex';
            generateBtn.querySelector('.btn-text').textContent = 'Template-Assistent öffnen';
        }
    }
}

// OPTIMIZATION 5: Smart Generation Trigger
window.startIntelligentGeneration = function() {
    const generateBtn = document.getElementById('generateBtn');
    const mode = window.workflowData?.writingMode || 'ai-generated';
    
    // Show loading state
    if (generateBtn) {
        const icon = generateBtn.querySelector('.btn-icon');
        const text = generateBtn.querySelector('.btn-text');
        const spinner = generateBtn.querySelector('.btn-spinner');
        
        if (icon) icon.style.display = 'none';
        if (text) text.textContent = 'Generiere...';
        if (spinner) spinner.style.display = 'block';
        generateBtn.disabled = true;
    }
    
    // Simulate AI generation delay
    setTimeout(() => {
        if (mode === 'ai-generated') {
            generateFullAILetter();
        } else if (mode === 'ai-assisted') {
            openAssistedEditor();
        } else if (mode === 'template-based') {
            openTemplateAssistant();
        }
        
        // Reset button state
        if (generateBtn) {
            const icon = generateBtn.querySelector('.btn-icon');
            const text = generateBtn.querySelector('.btn-text');
            const spinner = generateBtn.querySelector('.btn-spinner');
            
            if (icon) icon.style.display = 'block';
            if (text) text.textContent = 'Anschreiben generieren';
            if (spinner) spinner.style.display = 'none';
            generateBtn.disabled = false;
        }
    }, 2000);
};

function generateFullAILetter() {
    const company = window.workflowData?.company || 'das Unternehmen';
    const position = window.workflowData?.position || 'die Position';
    
    let letterContent = `
        <p><strong>Manuel Weiss</strong><br>
        Musterstraße 123<br>
        12345 Musterstadt<br>
        E-Mail: manuel.weiss@email.com</p>
        
        <p>${company}<br>
        z.H. Personalabteilung<br>
        ${new Date().toLocaleDateString('de-DE')}</p>
        
        <p><strong>Bewerbung als ${position}</strong></p>
        
        <p>Sehr geehrte Damen und Herren,</p>
        
        <p>mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als ${position} gelesen. Die Herausforderungen und Entwicklungsmöglichkeiten bei ${company} entsprechen genau meinen beruflichen Vorstellungen und Zielen.</p>
        
        <p>Meine Qualifikationen umfassen umfassende Erfahrungen in relevanten Bereichen sowie die Fähigkeit, komplexe Herausforderungen erfolgreich zu meistern. Besonders meine proaktive Arbeitsweise und mein Engagement für Exzellenz zeichnen mich aus.</p>
        
        <p>Gerne überzeuge ich Sie in einem persönlichen Gespräch von meinen Qualifikationen und meiner Motivation für diese Position.</p>
        
        <p>Mit freundlichen Grüßen<br>
        Manuel Weiss</p>
    `;
    
    showGeneratedLetter(letterContent);
}

function showGeneratedLetter(content) {
    const letterEditor = document.getElementById('letterEditor');
    const livePreviewPanel = document.getElementById('livePreviewPanel');
    const letterContentDiv = document.getElementById('letterContent');
    const previewContent = document.getElementById('previewContent');
    
    if (letterEditor) letterEditor.style.display = 'block';
    if (livePreviewPanel) livePreviewPanel.style.display = 'block';
    
    if (letterContentDiv) {
        letterContentDiv.innerHTML = content;
    }
    
    if (previewContent) {
        previewContent.innerHTML = content;
    }
    
    updateContinueButton();
    showAIAssistant();
    updateWritingMetrics();
}

// OPTIMIZATION 4: Real-time Writing Dashboard Updates
window.updateWritingMetrics = function() {
    const letterContent = document.getElementById('letterContent');
    if (!letterContent) return;
    
    const text = letterContent.textContent || letterContent.innerText || '';
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    animateMetricValue('wordCount', wordCount);
    
    const qualityScore = calculateQualityScore(text);
    const readabilityScore = calculateReadabilityScore(text);
    const personalizationLevel = calculatePersonalizationLevel(text);
    const requirementMatch = calculateRequirementMatch(text);
    
    animateMetricValue('letterScore', qualityScore + '%');
    animateMetricValue('readabilityScore', readabilityScore);
    animateMetricValue('personalizationLevel', personalizationLevel + '%');
    animateMetricValue('requirementMatch', requirementMatch + '%');
    
    updateContinueButton();
};

function animateMetricValue(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element && element.textContent !== newValue.toString()) {
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 150);
    }
}

function calculateQualityScore(text) {
    let score = 0;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount >= 200 && wordCount <= 400) score += 30;
    else if (wordCount >= 150) score += 20;
    else if (wordCount >= 100) score += 10;
    
    if (text.includes('Sehr geehrte') || text.includes('Liebe')) score += 15;
    if (text.includes('Mit freundlichen Grüßen')) score += 15;
    
    if (window.workflowData?.company && text.includes(window.workflowData.company)) score += 20;
    if (window.workflowData?.position && text.includes(window.workflowData.position)) score += 20;
    
    return Math.min(100, score);
}

function calculateReadabilityScore(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 'A+';
    
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
    
    if (avgWordsPerSentence <= 15) return 'A+';
    if (avgWordsPerSentence <= 20) return 'A';
    if (avgWordsPerSentence <= 25) return 'B';
    return 'C';
}

function calculatePersonalizationLevel(text) {
    let personalizations = 0;
    const maxPersonalizations = 5;
    
    if (window.workflowData?.company && text.toLowerCase().includes(window.workflowData.company.toLowerCase())) personalizations++;
    if (window.workflowData?.position && text.toLowerCase().includes(window.workflowData.position.toLowerCase())) personalizations++;
    if (text.includes('Ihre') || text.includes('Sie')) personalizations++;
    if (text.includes('ich') || text.includes('meine')) personalizations++;
    if (text.length > 300) personalizations++;
    
    return Math.round((personalizations / maxPersonalizations) * 100);
}

function calculateRequirementMatch(text) {
    if (!window.workflowData?.requirements) return 0;
    
    const requirements = window.workflowData.requirements;
    let matches = 0;
    
    requirements.forEach(req => {
        if (text.toLowerCase().includes(req.skill?.toLowerCase() || '')) {
            matches++;
        }
    });
    
    return Math.round((matches / requirements.length) * 100);
}

// Additional Helper Functions for Step 3
window.showAIAssistant = function() {
    const aiPanel = document.getElementById('aiAssistantPanel');
    if (aiPanel) {
        aiPanel.style.display = 'block';
    }
};

window.exportLetterPDF = function() {
    alert('PDF Export wird vorbereitet... 📄');
};

window.exportLetterWord = function() {
    alert('Word Export wird vorbereitet... 📝');
};

window.saveAsDraft = function() {
    const letterContent = document.getElementById('letterContent');
    if (letterContent) {
        localStorage.setItem('letterDraft', JSON.stringify({
            content: letterContent.innerHTML,
            timestamp: new Date().toISOString()
        }));
        alert('Entwurf gespeichert! ✅');
    }
};

window.shareViaEmail = function() {
    alert('E-Mail Client wird geöffnet... 📧');
};

window.loadTemplate = function(templateType) {
    alert(`${templateType} Template wird geladen... 📋`);
};

window.loadPreviousLetter = function() {
    alert('Vorherige Anschreiben werden geladen... 📜');
};

function updateContinueButton() {
    const continueBtn = document.getElementById('continueStep3Btn');
    const letterContent = document.getElementById('letterContent');
    
    if (continueBtn && letterContent) {
        const text = letterContent.textContent || letterContent.innerText || '';
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        
        if (wordCount >= 50) {
            continueBtn.style.display = 'inline-flex';
        } else {
            continueBtn.style.display = 'none';
        }
    }
}

function openAssistedEditor() {
    const letterEditor = document.getElementById('letterEditor');
    if (letterEditor) {
        letterEditor.style.display = 'block';
        const letterContent = document.getElementById('letterContent');
        if (letterContent) {
            letterContent.focus();
            letterContent.innerHTML = '<p>Beginnen Sie hier mit dem Schreiben...</p>';
        }
        showAIAssistant();
    }
}

function openTemplateAssistant() {
    alert('Template-Assistent wird geöffnet... 🎨');
}
