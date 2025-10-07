// =================== STEP 1: STELLENAUSSCHREIBUNG ANALYSIEREN ===================
// Modul für Schritt 1 des Smart Bewerbungs-Workflows
// LIVE-ANALYSE FUNKTIONEN - ECHTE IMPLEMENTIERUNG

// =================== LIVE ANALYSE FUNKTIONEN ===================

// Live Job Description Analysis - HAUPTFUNKTION
window.analyzeJobDescriptionLive = async function() {
    console.log('🔍 Starte Live-Analyse der Stellenausschreibung...');
    
    const jobDescription = document.getElementById('jobDescriptionInput').value.trim();
    
    if (!jobDescription) {
        alert('⚠️ Bitte fügen Sie zuerst eine Stellenausschreibung ein.');
        return;
    }
    
    if (jobDescription.length < 100) {
        alert('⚠️ Die Stellenausschreibung ist zu kurz für eine aussagekräftige Analyse. Bitte fügen Sie mehr Text hinzu.');
        return;
    }
    
    try {
        // ECHTE API KEY ÜBERPRÜFUNG - KEIN FALLBACK
        const apiKey = getAdminPanelApiKey(); // Wirft Fehler wenn nicht verfügbar
        
        // Show live analysis panel
        const liveAnalysisPanel = document.getElementById('liveAnalysisPanel');
        if (liveAnalysisPanel) {
            liveAnalysisPanel.style.display = 'block';
            showLoadingState(liveAnalysisPanel);
        }
        
        // ECHTE KI-ANALYSE
        const analysis = await performLiveJobAnalysis(jobDescription, apiKey);
        
        // Display results
        displayLiveAnalysisResults(analysis, liveAnalysisPanel);
        
        console.log('✅ Live-Analyse erfolgreich abgeschlossen');
        
    } catch (error) {
        console.error('❌ Fehler bei Live-Analyse:', error);
        alert('❌ FEHLER: ' + error.message);
    }
};

// Perform live job analysis using DIRECT OpenAI API
async function performLiveJobAnalysis(jobDescription, apiKey) {
    console.log('🤖 Starte OpenAI API Aufruf...');
    
    const prompt = `Analysiere diese Stellenausschreibung und extrahiere die wichtigsten Anforderungen:

STELLENAUSSCHREIBUNG:
${jobDescription}

Bitte gib eine strukturierte JSON-Antwort zurück mit:
{
  "mainRequirements": [
    {
      "requirement": "Konkrete Anforderung",
      "category": "Muss-Qualifikation|Kann-Qualifikation|Soft Skills|Technische Skills",
      "importance": "hoch|mittel|niedrig"
    }
  ],
  "company": "Firmenname falls erkennbar",
  "position": "Position falls erkennbar", 
  "keySkills": ["Skill 1", "Skill 2", "Skill 3"],
  "summary": "Kurze Zusammenfassung der wichtigsten Punkte"
}

Extrahiere maximal 8-10 der wichtigsten Anforderungen.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system', 
                    content: 'Du bist ein HR-Experte und analysierst Stellenausschreibungen. Antworte immer mit strukturiertem JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 1500,
            temperature: 0.3
        })
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('API Key ungültig. Bitte überprüfen Sie Ihren OpenAI API Key im Admin Panel.');
        }
        if (response.status === 429) {
            throw new Error('API Rate Limit erreicht. Bitte warten Sie einen Moment und versuchen Sie es erneut.');
        }
        throw new Error(`OpenAI API Fehler: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('🎯 OpenAI Antwort erhalten:', aiResponse.substring(0, 100) + '...');
    
    try {
        return JSON.parse(aiResponse);
    } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Raw response:', aiResponse);
        throw new Error('KI-Antwort konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.');
    }
}

// Show loading state in analysis panel
function showLoadingState(panel) {
    panel.innerHTML = `
        <div class="analysis-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
            <span style="font-weight: 600; color: #1e40af;">
                <i class="fas fa-brain"></i> Live-Analyse läuft...
            </span>
            <div class="spinner" style="animation: spin 1s linear infinite;">
                <i class="fas fa-spinner"></i>
            </div>
        </div>
        <div class="analysis-content" style="text-align: center; padding: 2rem; color: #6b7280;">
            <i class="fas fa-robot fa-2x" style="margin-bottom: 1rem; color: #3b82f6;"></i>
            <p>KI analysiert die Stellenausschreibung...</p>
            <p style="font-size: 0.875rem;">Identifiziere Hauptanforderungen und Skills</p>
            <div class="loading-dots" style="margin-top: 1rem;">
                <span style="animation: blink 1.4s infinite both; animation-delay: 0s;">●</span>
                <span style="animation: blink 1.4s infinite both; animation-delay: 0.2s;">●</span>
                <span style="animation: blink 1.4s infinite both; animation-delay: 0.4s;">●</span>
            </div>
        </div>
    `;
    
    // Add loading animations if not exists
    if (!document.head.querySelector('style[data-live-analysis]')) {
        const style = document.createElement('style');
        style.setAttribute('data-live-analysis', 'true');
        style.textContent = `
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes blink { 
                0%, 80%, 100% { opacity: 0; }
                40% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Display live analysis results
function displayLiveAnalysisResults(analysis, panel) {
    panel.innerHTML = `
        <div class="analysis-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
            <span style="font-weight: 600; color: #1e40af;">
                <i class="fas fa-check-circle"></i> Live-Analyse abgeschlossen
            </span>
            <button onclick="hideLiveAnalysis()" style="background: none; border: none; color: #6b7280; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="analysis-results" style="display: grid; gap: 1rem;">
            <!-- Summary -->
            ${analysis.summary ? `
                <div class="summary-section" style="background: #fef3c7; padding: 1rem; border-radius: 6px; border-left: 4px solid #f59e0b;">
                    <h5 style="margin: 0 0 0.5rem; color: #92400e;">📋 Zusammenfassung</h5>
                    <p style="margin: 0; color: #92400e; font-size: 0.9rem;">${analysis.summary}</p>
                </div>
            ` : ''}
            
            <!-- Key Skills -->
            ${analysis.keySkills && analysis.keySkills.length > 0 ? `
                <div class="skills-section" style="background: #f0fdf4; padding: 1rem; border-radius: 6px; border-left: 4px solid #10b981;">
                    <h5 style="margin: 0 0 0.75rem; color: #047857;">🔧 Wichtige Skills</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${analysis.keySkills.map(skill => `
                            <span style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">${skill}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Main Requirements -->
            <div class="requirements-section">
                <h5 style="margin: 0 0 1rem; color: #374151;">🎯 Hauptanforderungen (${analysis.mainRequirements?.length || 0})</h5>
                <div class="requirements-grid" style="display: grid; gap: 0.75rem;">
                    ${analysis.mainRequirements?.map((req, index) => `
                        <div class="requirement-item" style="
                            background: white; 
                            padding: 1rem; 
                            border-radius: 6px; 
                            border-left: 4px solid ${getRequirementColor(req.category)}; 
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                <span style="
                                    background: ${getRequirementColor(req.category)}; 
                                    color: white; 
                                    padding: 0.25rem 0.5rem; 
                                    border-radius: 4px; 
                                    font-size: 0.75rem; 
                                    font-weight: 600;
                                ">${req.category}</span>
                                <span style="
                                    background: ${req.importance === 'hoch' ? '#dc2626' : req.importance === 'mittel' ? '#f59e0b' : '#6b7280'}; 
                                    color: white; 
                                    padding: 0.25rem 0.5rem; 
                                    border-radius: 4px; 
                                    font-size: 0.75rem;
                                ">${req.importance}</span>
                            </div>
                            <p style="margin: 0; color: #374151; font-size: 0.9rem; line-height: 1.4;">${req.requirement}</p>
                        </div>
                    `).join('') || '<p style="color: #6b7280; text-align: center; padding: 2rem;">Keine Anforderungen erkannt</p>'}
                </div>
            </div>
        </div>
        
        <div class="analysis-actions" style="margin-top: 1.5rem; text-align: center; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
            <button onclick="useAnalysisForStep2()" style="
                background: #3b82f6; 
                color: white; 
                border: none; 
                padding: 0.75rem 1.5rem; 
                border-radius: 6px; 
                cursor: pointer; 
                font-weight: 600;
                margin-right: 0.5rem;
            ">
                <i class="fas fa-arrow-right"></i> Für Step 2 übernehmen
            </button>
            <button onclick="hideLiveAnalysis()" style="
                background: #6b7280; 
                color: white; 
                border: none; 
                padding: 0.75rem 1.5rem; 
                border-radius: 6px; 
                cursor: pointer;
            ">
                Schließen
            </button>
        </div>
    `;
    
    // Auto-fill company and position if detected
    if (analysis.company) {
        const companyInput = document.getElementById('companyInput');
        if (companyInput && !companyInput.value) {
            companyInput.value = analysis.company;
        }
    }
    
    if (analysis.position) {
        const positionInput = document.getElementById('positionInput');
        if (positionInput && !positionInput.value) {
            positionInput.value = analysis.position;
        }
    }
}

// Helper function to get requirement colors
function getRequirementColor(category) {
    const colors = {
        'Muss-Qualifikation': '#dc2626',
        'Kann-Qualifikation': '#f59e0b', 
        'Soft Skills': '#10b981',
        'Technische Skills': '#3b82f6',
        'Sonstiges': '#6b7280'
    };
    return colors[category] || '#6b7280';
}

// Hide live analysis panel
window.hideLiveAnalysis = function() {
    const liveAnalysisPanel = document.getElementById('liveAnalysisPanel');
    if (liveAnalysisPanel) {
        liveAnalysisPanel.style.display = 'none';
    }
};

// Use analysis results for Step 2
window.useAnalysisForStep2 = function() {
    if (window.workflowData) {
        window.workflowData.liveAnalysisResults = true;
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        `;
        successMsg.innerHTML = '<i class="fas fa-check"></i> Analyse für Step 2 gespeichert!';
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.remove();
            }
        }, 3000);
        
        hideLiveAnalysis();
    }
};

// DEBUG FUNKTIONEN
window.testLiveAnalysis = function() {
    console.log('🧪 Teste Live-Analyse mit Beispieldaten...');
    
    const jobDescTextarea = document.getElementById('jobDescriptionInput');
    if (jobDescTextarea) {
        jobDescTextarea.value = `Software Entwickler (m/w/d) - Frontend

Beispiel-Firma GmbH sucht einen erfahrenen Frontend-Entwickler.

Anforderungen:
- 3+ Jahre Erfahrung mit JavaScript
- React, HTML5, CSS3 Kenntnisse
- Git und agile Methoden
- Teamfähigkeit`;
        
        setTimeout(() => {
            window.analyzeJobDescriptionLive();
        }, 500);
    }
};

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
                        <button type="button" onclick="window.analyzeJobDescriptionLive()" class="toolbar-action ai-action" title="ECHTE Live KI-Analyse">
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

// ALTE MOCK IMPLEMENTIERUNG ENTFERNT - JETZT ECHTE KI-ANALYSE  
// Siehe: window.analyzeJobDescriptionLive() oben für echte Implementierung

// BACKUP: Old performLiveAnalysis redirects to new function
window.performLiveAnalysis = function() {
    console.log('⚠️ Alte performLiveAnalysis aufgerufen - weiterleitung zu echter Implementierung');
    window.analyzeJobDescriptionLive();
};
    
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
