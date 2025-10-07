// =================== STEP 1: STELLENAUSSCHREIBUNG ANALYSIEREN ===================
// Modul für Schritt 1 des Smart Bewerbungs-Workflows

// Step 1 Main Generator Function
window.generateStep1 = function() {
    // Inject Step 1 specific styles
    injectStep1Styles();
    
    const safeWorkflowData = window.workflowData || {};
    
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
                    <span class="step-number-enhanced" style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">1</span>
                    Stellenausschreibung & Grunddaten
                    <!-- OPTIMIZATION 2: Real-time Help System -->
                    <button class="help-button" onclick="showStep1Help()" title="Hilfe anzeigen">
                        <i class="fas fa-question-circle"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Erfassen Sie die Stellendetails und lassen Sie die KI die Anforderungen analysieren</p>
            </div>
            
            <!-- OPTIMIZATION 3: Smart Company Input with Auto-Complete -->
            <div class="form-group enhanced">
                <label for="companyInput" style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
                    🏢 Unternehmen *
                </label>
                <div class="input-wrapper">
                    <input type="text" 
                           id="companyInput" 
                           class="enhanced-input" 
                           placeholder="z.B. Microsoft Deutschland GmbH"
                           value="${safeWorkflowData.company || ''}"
                           oninput="handleCompanyInput(this)"
                           onfocus="showInputFocus('company')"
                           onblur="hideInputFocus('company')"
                           required
                           style="width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 1rem; transition: all 0.3s ease; padding-right: 4rem;">
                    <div class="input-actions">
                        <button type="button" onclick="clearInput('companyInput')" class="clear-btn" title="Leeren">
                            <i class="fas fa-times"></i>
                        </button>
                        <button type="button" onclick="smartFillCompany()" class="smart-btn" title="Smart-Fill">
                            <i class="fas fa-magic"></i>
                        </button>
                    </div>
                </div>
                <div id="companyAutocomplete" class="autocomplete-dropdown" style="display: none;"></div>
                <div class="input-feedback" id="companyFeedback"></div>
            </div>

            <!-- OPTIMIZATION 4: Enhanced Position Input with Suggestions -->
            <div class="form-group enhanced">
                <label for="positionInput" style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
                    💼 Position/Berufsbezeichnung *
                </label>
                <div class="input-wrapper">
                    <input type="text" 
                           id="positionInput" 
                           class="enhanced-input"
                           placeholder="z.B. Senior Frontend Developer"
                           value="${safeWorkflowData.position || ''}"
                           oninput="handlePositionInput(this)"
                           onfocus="showInputFocus('position')"
                           onblur="hideInputFocus('position')"
                           required
                           style="width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 1rem; transition: all 0.3s ease; padding-right: 4rem;">
                    <div class="input-actions">
                        <button type="button" onclick="clearInput('positionInput')" class="clear-btn" title="Leeren">
                            <i class="fas fa-times"></i>
                        </button>
                        <button type="button" onclick="suggestPositions()" class="suggest-btn" title="Vorschläge">
                            <i class="fas fa-lightbulb"></i>
                        </button>
                    </div>
                </div>
                <div id="positionAutocomplete" class="autocomplete-dropdown" style="display: none;"></div>
                <div class="input-feedback" id="positionFeedback"></div>
            </div>

            <!-- OPTIMIZATION 5: Advanced Job Description Editor -->
            <div class="form-group enhanced">
                <label for="jobDescriptionInput" style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151;">
                    📝 Stellenausschreibung
                </label>
                <div class="editor-container">
                    <!-- Editor Toolbar -->
                    <div class="job-description-toolbar">
                        <button type="button" onclick="pasteFromClipboard()" class="toolbar-action" title="Aus Zwischenablage einfügen">
                            <i class="fas fa-paste"></i>
                            <span>Einfügen</span>
                        </button>
                        <button type="button" onclick="formatJobDescription()" class="toolbar-action" title="Text formatieren">
                            <i class="fas fa-align-left"></i>
                            <span>Formatieren</span>
                        </button>
                        <button type="button" onclick="performLiveAnalysis()" class="toolbar-action ai-action" title="Live KI-Analyse">
                            <i class="fas fa-brain"></i>
                            <span>Analysieren</span>
                        </button>
                    </div>
                    
                    <textarea id="jobDescriptionInput" 
                              class="enhanced-textarea"
                              placeholder="Kopieren Sie hier die vollständige Stellenausschreibung ein...

💡 Tipps für bessere Ergebnisse:
• Fügen Sie die komplette Stellenausschreibung ein
• Inkl. Anforderungen, Aufgaben und Unternehmensbeschreibung  
• Die KI erkennt automatisch alle relevanten Informationen"
                              oninput="handleJobDescriptionInput(this)"
                              onpaste="handlePasteEvent(event)"
                              onkeydown="handleKeyNavigation(event)"
                              style="width: 100%; min-height: 250px; padding: 1.5rem; border: 2px solid #e5e7eb; border-radius: 0 0 12px 12px; border-top: none; font-size: 1rem; line-height: 1.6; resize: vertical; transition: all 0.3s ease;">${safeWorkflowData.jobDescription || ''}</textarea>
                    
                    <!-- Character Counter -->
                    <div class="char-counter">
                        <span id="charCount">0</span> Zeichen
                        <span class="char-status" id="charStatus">Optimal ab 500 Zeichen</span>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 6: Live Analysis Panel -->
            <div class="live-analysis-panel" id="liveAnalysisPanel" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-line"></i>
                    Live-Analyse Ergebnisse
                </h4>
                
                <div class="analysis-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="analysis-card detection">
                        <div class="analysis-header">
                            <i class="fas fa-building"></i>
                            <span>Unternehmen</span>
                        </div>
                        <div class="analysis-content" id="detectedCompany">-</div>
                        <div class="analysis-indicator" id="companyIndicator">
                            <i class="fas fa-circle"></i>
                        </div>
                    </div>
                    
                    <div class="analysis-card detection">
                        <div class="analysis-header">
                            <i class="fas fa-list-check"></i>
                            <span>Anforderungen</span>
                        </div>
                        <div class="analysis-content" id="detectedRequirements">0</div>
                        <div class="analysis-indicator" id="requirementsIndicator">
                            <i class="fas fa-circle"></i>
                        </div>
                    </div>
                    
                    <div class="analysis-card detection">
                        <div class="analysis-header">
                            <i class="fas fa-medal"></i>
                            <span>Qualifikationen</span>
                        </div>
                        <div class="analysis-content" id="detectedQualifications">0</div>
                        <div class="analysis-indicator" id="qualificationsIndicator">
                            <i class="fas fa-circle"></i>
                        </div>
                    </div>
                    
                    <div class="analysis-card detection">
                        <div class="analysis-header">
                            <i class="fas fa-percentage"></i>
                            <span>Analyse-Qualität</span>
                        </div>
                        <div class="analysis-content" id="analysisQuality">-</div>
                        <div class="analysis-indicator" id="qualityIndicator">
                            <i class="fas fa-circle"></i>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-details" id="analysisDetails"></div>
            </div>

            <!-- OPTIMIZATION 7: Auto-Save Status -->
            <div class="auto-save-status" id="autoSaveStatus">
                <div class="save-indicator">
                    <i class="fas fa-cloud" id="saveIcon"></i>
                    <span id="saveText">Automatisch gespeichert</span>
                    <span id="saveTimestamp"></span>
                </div>
            </div>

            <!-- OPTIMIZATION 8: Enhanced Action Bar -->
            <div class="action-bar enhanced">
                <div class="secondary-actions">
                    <!-- OPTIMIZATION 9: Import Options -->
                    <div class="import-options">
                        <button type="button" onclick="importFromLinkedIn()" class="import-btn linkedin-btn" title="Von LinkedIn importieren">
                            <i class="fab fa-linkedin"></i>
                            <span>LinkedIn</span>
                        </button>
                        <button type="button" onclick="importFromXing()" class="import-btn xing-btn" title="Von XING importieren">
                            <i class="fab fa-xing"></i>
                            <span>XING</span>
                        </button>
                        <button type="button" onclick="loadPreviousApplication()" class="import-btn previous-btn" title="Vorherige Bewerbung laden">
                            <i class="fas fa-history"></i>
                            <span>Vorherige</span>
                        </button>
                    </div>
                </div>

                <div class="primary-actions">
                    <button onclick="saveAndContinueLater()" 
                            class="btn-secondary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <i class="fas fa-save"></i> 
                        <span>Später bearbeiten</span>
                    </button>
                    <button onclick="saveStep1AndContinue()" 
                            id="continueStep1Btn" 
                            class="btn-primary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <span class="btn-content">
                            <span class="btn-text">Weiter zu Schritt 2</span>
                            <i class="fas fa-arrow-right btn-icon"></i>
                        </span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 10: Keyboard Shortcuts Help -->
            <div class="keyboard-shortcuts-panel" id="keyboardShortcuts" style="display: none;">
                <h5 style="margin-bottom: 1rem; color: #374151;">⌨️ Tastenkürzel</h5>
                <div class="shortcuts-grid">
                    <div class="shortcut-item">
                        <span class="shortcut-key">Ctrl + V</span>
                        <span class="shortcut-desc">Stellenausschreibung einfügen</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">Ctrl + A</span>
                        <span class="shortcut-desc">Live-Analyse starten</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">Ctrl + S</span>
                        <span class="shortcut-desc">Fortschritt speichern</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">Ctrl + Enter</span>
                        <span class="shortcut-desc">Zum nächsten Schritt</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">F1</span>
                        <span class="shortcut-desc">Hilfe anzeigen</span>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button onclick="toggleKeyboardShortcuts()" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    `;
};

// =================== STEP 1 HELPER FUNCTIONS ===================

// OPTIMIZATION 1 & 2: Help System
window.showStep1Help = function() {
    const helpModal = `
        <div id="step1HelpModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 1rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: #1f2937;">📋 Schritt 1 Hilfe</h3>
                    <button onclick="closeStep1Help()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">&times;</button>
                </div>
                
                <div style="space-y: 1.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: #3b82f6; margin-bottom: 0.75rem;">🏢 Unternehmensdaten</h4>
                        <p style="color: #6b7280; line-height: 1.6;">Geben Sie den vollständigen Firmennamen ein. Die KI erkennt automatisch zusätzliche Informationen über das Unternehmen.</p>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: #10b981; margin-bottom: 0.75rem;">💼 Position</h4>
                        <p style="color: #6b7280; line-height: 1.6;">Verwenden Sie die exakte Berufsbezeichnung aus der Stellenausschreibung für beste Ergebnisse.</p>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: #f59e0b; margin-bottom: 0.75rem;">📝 Stellenausschreibung</h4>
                        <p style="color: #6b7280; line-height: 1.6;">Fügen Sie die komplette Stellenausschreibung ein. Je mehr Details, desto präziser die KI-Analyse. Mindestens 500 Zeichen empfohlen.</p>
                    </div>
                    
                    <div>
                        <h4 style="color: #8b5cf6; margin-bottom: 0.75rem;">🤖 Live-Analyse</h4>
                        <p style="color: #6b7280; line-height: 1.6;">Die KI analysiert automatisch Anforderungen, Qualifikationen und Unternehmensinfos während der Eingabe.</p>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="closeStep1Help()" style="padding: 0.75rem 2rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Verstanden!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', helpModal);
};

window.closeStep1Help = function() {
    const modal = document.getElementById('step1HelpModal');
    if (modal) modal.remove();
};

// OPTIMIZATION 3 & 4: Smart Input Handling
window.handleCompanyInput = function(input) {
    const value = input.value;
    
    // Auto-save
    if (!window.workflowData) window.workflowData = {};
    window.workflowData.company = value;
    updateAutoSave();
    
    // Show/hide autocomplete
    if (value.length >= 2) {
        showAutocomplete('company', value);
    } else {
        hideAutocomplete('company');
    }
    
    // Validate and update UI
    validateField('company', value);
    updateContinueButtonState();
};

window.handlePositionInput = function(input) {
    const value = input.value;
    
    // Auto-save  
    if (!window.workflowData) window.workflowData = {};
    window.workflowData.position = value;
    updateAutoSave();
    
    // Show/hide autocomplete
    if (value.length >= 2) {
        showAutocomplete('position', value);
    } else {
        hideAutocomplete('position');
    }
    
    // Validate and update UI
    validateField('position', value);
    updateContinueButtonState();
};

// OPTIMIZATION 5: Job Description Handling
window.handleJobDescriptionInput = function(textarea) {
    const value = textarea.value;
    
    // Update character counter
    updateCharCounter(value);
    
    // Auto-save
    if (!window.workflowData) window.workflowData = {};
    window.workflowData.jobDescription = value;
    updateAutoSave();
    
    // Trigger live analysis after delay
    clearTimeout(window.analysisTimeout);
    window.analysisTimeout = setTimeout(() => {
        if (value.length >= 100) {
            performLiveAnalysis();
        }
    }, 1000);
    
    updateContinueButtonState();
};

// Continue function
window.saveStep1AndContinue = function() {
    const company = document.getElementById('companyInput')?.value?.trim();
    const position = document.getElementById('positionInput')?.value?.trim();
    const jobDescription = document.getElementById('jobDescriptionInput')?.value?.trim();
    
    // Validation
    if (!company) {
        alert('Bitte geben Sie das Unternehmen an.');
        document.getElementById('companyInput')?.focus();
        return;
    }
    
    if (!position) {
        alert('Bitte geben Sie die Position an.');
        document.getElementById('positionInput')?.focus();
        return;
    }
    
    // Save data
    if (!window.workflowData) window.workflowData = {};
    window.workflowData.company = company;
    window.workflowData.position = position;
    window.workflowData.jobDescription = jobDescription;
    
    // Continue to step 2
    nextWorkflowStep(2);
};

// Helper Functions (simplified versions)
window.showAutocomplete = function(type, query) { 
    console.log(`Autocomplete für ${type}: ${query}`);
};

window.hideAutocomplete = function(type) { 
    const dropdown = document.getElementById(type + 'Autocomplete');
    if (dropdown) dropdown.style.display = 'none';
};

window.clearInput = function(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
        input.focus();
        input.dispatchEvent(new Event('input'));
    }
};

window.validateField = function(fieldName, value) {
    const feedback = document.getElementById(fieldName + 'Feedback');
    if (feedback) {
        if (value.length >= 2) {
            feedback.innerHTML = '<i class="fas fa-check text-green-500"></i> Gültig';
        } else {
            feedback.innerHTML = '<i class="fas fa-times text-red-500"></i> Mindestens 2 Zeichen';
        }
    }
};

window.updateCharCounter = function(text) {
    const charCount = document.getElementById('charCount');
    const charStatus = document.getElementById('charStatus');
    
    if (charCount) charCount.textContent = text.length;
    if (charStatus) {
        if (text.length >= 500) {
            charStatus.textContent = 'Optimal für KI-Analyse';
            charStatus.style.color = '#10b981';
        } else {
            charStatus.textContent = `Noch ${500 - text.length} Zeichen für optimale Analyse`;
            charStatus.style.color = '#f59e0b';
        }
    }
};

window.performLiveAnalysis = function() {
    const jobDesc = document.getElementById('jobDescriptionInput')?.value || '';
    if (jobDesc.length < 50) return;
    
    // Show analysis panel
    const panel = document.getElementById('liveAnalysisPanel');
    if (panel) panel.style.display = 'block';
    
    // Simulate analysis (in real app, this would call actual AI)
    setTimeout(() => {
        const mockResults = analyzeJobText(jobDesc);
        updateAnalysisContent(mockResults);
    }, 500);
};

function analyzeJobText(text) {
    // Mock analysis - in real implementation this would use AI
    const words = text.toLowerCase().split(/\s+/);
    
    return {
        company: extractCompanyFromText(text),
        requirements: Math.floor(words.length / 30),
        qualifications: Math.floor(words.length / 40),
        quality: words.length >= 500 ? 'Ausgezeichnet' : words.length >= 200 ? 'Gut' : 'Ausreichend'
    };
}

function extractCompanyFromText(text) {
    // Simple company extraction (in real app would use NLP)
    const lines = text.split('\n');
    for (let line of lines.slice(0, 5)) {
        if (line.includes('GmbH') || line.includes('AG') || line.includes('Inc') || line.includes('Ltd')) {
            return line.trim().substring(0, 50);
        }
    }
    return 'Automatisch erkannt';
}

window.updateAnalysisContent = function(results) {
    document.getElementById('detectedCompany').textContent = results.company;
    document.getElementById('detectedRequirements').textContent = results.requirements;
    document.getElementById('detectedQualifications').textContent = results.qualifications; 
    document.getElementById('analysisQuality').textContent = results.quality;
};

window.updateAutoSave = function() {
    const status = document.getElementById('autoSaveStatus');
    const timestamp = document.getElementById('saveTimestamp');
    
    if (status) {
        status.style.opacity = '1';
        if (timestamp) {
            timestamp.textContent = new Date().toLocaleTimeString('de-DE');
        }
        
        setTimeout(() => {
            status.style.opacity = '0.7';
        }, 2000);
    }
};

window.updateContinueButtonState = function() {
    const continueBtn = document.getElementById('continueStep1Btn');
    const company = document.getElementById('companyInput')?.value?.trim();
    const position = document.getElementById('positionInput')?.value?.trim();
    
    if (continueBtn) {
        if (company && position) {
            continueBtn.disabled = false;
            continueBtn.style.opacity = '1';
        } else {
            continueBtn.disabled = true;
            continueBtn.style.opacity = '0.6';
        }
    }
};

// Additional helper functions (placeholder implementations)
window.addButtonEffect = function(btn, type) { console.log('Button effect:', type); };
window.removeButtonEffect = function(btn, type) { console.log('Button effect removed:', type); };
window.showInputFocus = function(type) { console.log('Input focus:', type); };
window.hideInputFocus = function(type) { console.log('Input blur:', type); };
window.smartFillCompany = function() { alert('Smart-Fill für Unternehmen...'); };
window.suggestPositions = function() { alert('Positions-Vorschläge werden geladen...'); };
window.pasteFromClipboard = function() { alert('Aus Zwischenablage einfügen...'); };
window.formatJobDescription = function() { alert('Text wird formatiert...'); };
window.handlePasteEvent = function(e) { console.log('Paste event:', e); };
window.handleKeyNavigation = function(e) { console.log('Key navigation:', e); };
window.importFromLinkedIn = function() { alert('LinkedIn Import...'); };
window.importFromXing = function() { alert('XING Import...'); };
window.loadPreviousApplication = function() { alert('Vorherige Bewerbung laden...'); };
window.saveAndContinueLater = function() { alert('Entwurf gespeichert!'); };
window.toggleKeyboardShortcuts = function() { 
    const panel = document.getElementById('keyboardShortcuts');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};

// Auto-save on page unload
window.addEventListener('beforeunload', function() {
    if (window.workflowData) {
        localStorage.setItem('workflowStep1Draft', JSON.stringify(window.workflowData));
    }
});

console.log('✅ Step 1 Modul geladen');
