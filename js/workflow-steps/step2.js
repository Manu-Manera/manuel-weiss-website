// =================== STEP 2: KI-ANFORDERUNGSANALYSE & SMART MATCHING ===================
// Modul für Schritt 2 des Smart Bewerbungs-Workflows

// Step 2 Main Generator Function
window.generateStep2 = function() {
    // Inject Step 2 specific styles
    injectStep2Styles();
    
    const safeWorkflowData = window.workflowData || {};
    
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
                    <button class="help-button" onclick="showStep2Help()" title="Analyse-Hilfe">
                        <i class="fas fa-question-circle"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Intelligente Analyse der Stellenanforderungen und Matching mit Ihrem Profil</p>
            </div>
            
            <!-- Company/Position Summary -->
            <div class="application-summary" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid #10b981;">
                <div class="summary-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0; color: #065f46; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-briefcase"></i> Bewerbungsübersicht
                    </h4>
                    <div class="analysis-mode-badge" id="analysisMode" style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;">
                        Vollautomatisch ⚡
                    </div>
                </div>
                <div class="summary-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <p style="margin: 0; color: #065f46;"><strong>🏢 Unternehmen:</strong> ${safeWorkflowData.company || 'Nicht angegeben'}</p>
                        <p style="margin: 0.5rem 0 0; color: #065f46;"><strong>💼 Position:</strong> ${safeWorkflowData.position || 'Nicht angegeben'}</p>
                    </div>
                    <div>
                        <p style="margin: 0; color: #065f46;"><strong>📄 Beschreibung:</strong> ${(safeWorkflowData.jobDescription?.length || 0) > 0 ? 'Vorhanden' : 'Nicht verfügbar'}</p>
                        <p style="margin: 0.5rem 0 0; color: #065f46;"><strong>🎯 Status:</strong> <span id="analysisStatus">Bereit für Analyse</span></p>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 3: Multi-Mode Analysis Selection -->
            <div class="analysis-mode-selector" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🧠 Analyse-Modus wählen</h4>
                <div class="mode-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                    <div class="analysis-mode-card active" data-mode="full-auto" onclick="selectAnalysisMode('full-auto')" style="border: 2px solid #10b981; background: #f0fdf4; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">🤖</div>
                        <h5 style="margin: 0 0 0.5rem; color: #065f46;">Vollautomatische KI-Analyse</h5>
                        <p style="margin: 0; color: #16a34a; font-size: 0.875rem;">KI analysiert alle Anforderungen und erstellt automatisch Matching-Vorschläge</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #059669;">
                            ✓ Komplett automatisch ✓ Schnellste Option ✓ KI-optimiert
                        </div>
                    </div>
                    
                    <div class="analysis-mode-card" data-mode="ai-assisted" onclick="selectAnalysisMode('ai-assisted')" style="border: 2px solid #e5e7eb; background: white; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">🧑‍💻</div>
                        <h5 style="margin: 0 0 0.5rem; color: #374151;">KI-Unterstützt</h5>
                        <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">KI-Vorschläge mit manueller Überprüfung und Anpassung</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                            ✓ KI + Kontrolle ✓ Anpassbar ✓ Präzise Ergebnisse
                        </div>
                    </div>
                    
                    <div class="analysis-mode-card" data-mode="manual" onclick="selectAnalysisMode('manual')" style="border: 2px solid #e5e7eb; background: white; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">✋</div>
                        <h5 style="margin: 0 0 0.5rem; color: #374151;">Manuelle Auswahl</h5>
                        <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Selbständige Auswahl und Bearbeitung aller Anforderungen</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                            ✓ Volle Kontrolle ✓ Individuelle Anpassung ✓ Detailliert
                        </div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 4: Real-time Analysis Dashboard -->
            <div class="analysis-dashboard" style="margin-bottom: 2rem;">
                <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h4 style="margin: 0; color: #374151;">📊 Analyse-Dashboard</h4>
                    <div class="dashboard-controls" style="display: flex; gap: 0.5rem;">
                        <button onclick="toggleAutoAnalysis()" id="autoAnalysisBtn" class="dashboard-btn" style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                            <i class="fas fa-play"></i> Auto-Analyse
                        </button>
                        <button onclick="refreshAnalysis()" class="dashboard-btn" style="background: none; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 0.875rem;">
                            <i class="fas fa-sync"></i>
                        </button>
                    </div>
                </div>
                
                <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="requirementsDetected" style="font-size: 2rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Anforderungen erkannt</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="skillMatches" style="font-size: 2rem; font-weight: 800; color: #3b82f6; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Skill-Übereinstimmungen</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="matchingScore" style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Matching-Score</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="aiConfidence" style="font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">KI-Vertrauen</div>
                    </div>
                </div>

                <!-- OPTIMIZATION 5: Smart Analysis Trigger -->
                <div class="analysis-section" style="text-align: center; margin-bottom: 2rem;">
                    <button onclick="startAdvancedAnalysis()" id="analysisBtn" class="analysis-btn enhanced" 
                            style="padding: 1rem 2rem; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1.1rem; display: inline-flex; align-items: center; gap: 0.75rem; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                        <div class="btn-icon">
                            <i class="fas fa-brain"></i>
                        </div>
                        <span class="btn-text">Erweiterte KI-Analyse starten</span>
                        <div class="btn-spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                    </button>
                    <div class="analysis-options" style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="deepLearning" checked style="margin: 0;">
                            Deep-Learning Analyse
                        </label>
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="industryContext" checked style="margin: 0;">
                            Branchenkontext
                        </label>
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="competitorAnalysis" style="margin: 0;">
                            Konkurrenzanalyse
                        </label>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 6: Interactive Requirements Display -->
            <div id="requirementsDisplay" class="requirements-display" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151;">📋 Erkannte Anforderungen</h4>
                <div id="requirementsList" class="requirements-list"></div>
            </div>

            <!-- OPTIMIZATION 7: Skill Gap Analysis -->
            <div id="skillGapSection" class="skill-gap-section" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🎯 Skill-Gap Analyse</h4>
                <div class="skill-categories" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div class="matching-skills">
                        <h5 style="color: #10b981; margin-bottom: 0.75rem;">✅ Passende Skills</h5>
                        <div id="matchingSkillsList" class="skill-list"></div>
                    </div>
                    <div class="missing-skills">
                        <h5 style="color: #ef4444; margin-bottom: 0.75rem;">📚 Entwicklungspotential</h5>
                        <div id="missingSkillsList" class="skill-list"></div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 8: Advanced Action Bar -->
            <div class="action-bar enhanced step2">
                <div class="secondary-actions">
                    <!-- OPTIMIZATION 9: Smart Skip Options -->
                    <div class="skip-options">
                        <button type="button" onclick="skipWithTemplate()" class="skip-btn template-btn" title="Mit Vorlage überspringen">
                            <i class="fas fa-file-alt"></i>
                            Mit Vorlage
                        </button>
                        <button type="button" onclick="skipManual()" class="skip-btn manual-btn" title="Manuell schreiben">
                            <i class="fas fa-edit"></i>
                            Manuell schreiben
                        </button>
                        <button type="button" onclick="saveAndContinueLater()" class="skip-btn later-btn" title="Später bearbeiten">
                            <i class="fas fa-clock"></i>
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
                    <button onclick="nextWorkflowStep(3)" 
                            id="continueStep2Btn" 
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
            <div class="performance-monitor" id="performanceMonitor" style="position: fixed; top: 2rem; right: 2rem; background: rgba(0,0,0,0.8); color: white; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.75rem; display: none; z-index: 9999;">
                <div style="margin-bottom: 0.5rem;"><strong>⚡ Analyse-Performance</strong></div>
                <div>Status: <span id="perfStatus">Bereit</span></div>
                <div>Zeit: <span id="perfTime">0ms</span></div>
                <div>Anforderungen/s: <span id="perfRate">-</span></div>
            </div>
        </div>
    `;
};

// =================== STEP 2 HELPER FUNCTIONS ===================

// OPTIMIZATION 2: Advanced Help System for Step 2
window.showStep2Help = function() {
    const helpModal = `
        <div id="step2HelpModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 1rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: #1f2937;">🧠 KI-Analyse Hilfe</h3>
                    <button onclick="closeStep2Help()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">&times;</button>
                </div>
                
                <div style="space-y: 1.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: #10b981; margin-bottom: 0.75rem;">🤖 Analyse-Modi erklärt</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: 0.75rem; background: #f0fdf4; border-radius: 8px; margin-bottom: 0.5rem;">
                                <strong>Vollautomatisch:</strong> KI analysiert alle Anforderungen und erstellt sofort Matching-Vorschläge.
                            </li>
                            <li style="padding: 0.75rem; background: #f3f4f6; border-radius: 8px; margin-bottom: 0.5rem;">
                                <strong>KI-Unterstützt:</strong> KI-Vorschläge mit manueller Überprüfung und Anpassungsmöglichkeiten.
                            </li>
                            <li style="padding: 0.75rem; background: #f0f9ff; border-radius: 8px;">
                                <strong>Manuell:</strong> Vollständige Kontrolle über Auswahl und Bearbeitung aller Anforderungen.
                            </li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="color: #3b82f6; margin-bottom: 0.75rem;">📊 Dashboard-Metriken</h4>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;"><strong>Anforderungen erkannt:</strong> Anzahl identifizierter Job-Requirements</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;"><strong>Skill-Übereinstimmungen:</strong> Passende Fähigkeiten zu Requirements</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;"><strong>Matching-Score:</strong> Gesamt-Passungsgrad in Prozent</li>
                            <li style="padding: 0.5rem 0;"><strong>KI-Vertrauen:</strong> Zuverlässigkeit der KI-Analyse</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style="color: #f59e0b; margin-bottom: 0.75rem;">🎯 Skill-Gap Analyse</h4>
                        <p style="color: #6b7280; line-height: 1.6;">Zeigt Ihre vorhandenen Skills und identifiziert Bereiche für berufliche Weiterentwicklung basierend auf den Stellenanforderungen.</p>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="closeStep2Help()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Verstanden!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', helpModal);
};

window.closeStep2Help = function() {
    const modal = document.getElementById('step2HelpModal');
    if (modal) modal.remove();
};

// OPTIMIZATION 3: Multi-Mode Analysis Selection
window.selectAnalysisMode = function(mode) {
    // Update visual selection
    document.querySelectorAll('.analysis-mode-card').forEach(card => {
        card.classList.remove('active');
        card.style.border = '2px solid #e5e7eb';
        card.style.background = 'white';
    });
    
    const selectedCard = document.querySelector(`[data-mode="${mode}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
        selectedCard.style.border = '2px solid #10b981';
        selectedCard.style.background = '#f0fdf4';
    }
    
    // Update mode badge
    const modeBadge = document.getElementById('analysisMode');
    switch(mode) {
        case 'full-auto':
            if (modeBadge) modeBadge.textContent = 'Vollautomatisch ⚡';
            break;
        case 'ai-assisted':
            if (modeBadge) modeBadge.textContent = 'KI-Unterstützt 🧑‍💻';
            break;
        case 'manual':
            if (modeBadge) modeBadge.textContent = 'Manuell ✋';
            break;
    }
    
    // Store selected mode
    if (!window.workflowData) window.workflowData = {};
    window.workflowData.analysisMode = mode;
    
    // Update analysis button
    const analysisBtn = document.getElementById('analysisBtn');
    if (analysisBtn) {
        const btnText = analysisBtn.querySelector('.btn-text');
        if (btnText) {
            switch(mode) {
                case 'full-auto':
                    btnText.textContent = 'Vollautomatische Analyse starten';
                    break;
                case 'ai-assisted':
                    btnText.textContent = 'KI-unterstützte Analyse starten';
                    break;
                case 'manual':
                    btnText.textContent = 'Manuelle Auswahl starten';
                    break;
            }
        }
    }
};

// OPTIMIZATION 4: Real-time Dashboard Updates
window.updateDashboardMetrics = function(metrics) {
    animateValue('requirementsDetected', metrics.requirements || 0);
    animateValue('skillMatches', metrics.matches || 0);
    animateValue('matchingScore', (metrics.score || 0) + '%');
    animateValue('aiConfidence', (metrics.confidence || 0) + '%');
};

function animateValue(elementId, endValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const endNum = parseInt(endValue) || 0;
    const duration = 1000;
    const stepTime = 50;
    const steps = duration / stepTime;
    const increment = (endNum - startValue) / steps;
    
    let current = startValue;
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= endNum) || (increment < 0 && current <= endNum)) {
            current = endNum;
            clearInterval(timer);
        }
        element.textContent = typeof endValue === 'string' && endValue.includes('%') 
            ? Math.round(current) + '%' 
            : Math.round(current);
    }, stepTime);
}

// OPTIMIZATION 5: Smart Analysis Engine
window.startAdvancedAnalysis = function() {
    const analysisBtn = document.getElementById('analysisBtn');
    const mode = window.workflowData?.analysisMode || 'full-auto';
    
    // Show loading state
    if (analysisBtn) {
        const icon = analysisBtn.querySelector('.btn-icon');
        const text = analysisBtn.querySelector('.btn-text');
        const spinner = analysisBtn.querySelector('.btn-spinner');
        
        if (icon) icon.style.display = 'none';
        if (text) text.textContent = 'Analysiere...';
        if (spinner) spinner.style.display = 'block';
        analysisBtn.disabled = true;
    }
    
    // Update performance monitor
    updatePerformanceMonitor('Analyse läuft...');
    
    // Start analysis based on mode
    setTimeout(() => {
        switch(mode) {
            case 'full-auto':
                performFullAIAnalysis();
                break;
            case 'ai-assisted':
                performAssistedAnalysis();
                break;
            case 'manual':
                performManualAnalysis();
                break;
        }
        
        // Reset button state
        if (analysisBtn) {
            const icon = analysisBtn.querySelector('.btn-icon');
            const text = analysisBtn.querySelector('.btn-text');
            const spinner = analysisBtn.querySelector('.btn-spinner');
            
            if (icon) icon.style.display = 'block';
            if (text) text.textContent = 'Analyse abgeschlossen';
            if (spinner) spinner.style.display = 'none';
            analysisBtn.disabled = false;
        }
        
        updatePerformanceMonitor('Abgeschlossen');
        
    }, 2000 + Math.random() * 1000);
};

function performFullAIAnalysis() {
    const jobDescription = window.workflowData?.jobDescription || '';
    
    // Mock AI analysis results
    const mockResults = {
        requirements: Math.floor(Math.random() * 15) + 5,
        matches: Math.floor(Math.random() * 12) + 3,
        score: Math.floor(Math.random() * 40) + 60,
        confidence: Math.floor(Math.random() * 20) + 80
    };
    
    updateDashboardMetrics(mockResults);
    displayAnalysisResults(mockResults);
    displaySkillGapAnalysis();
    
    // Show continue button
    document.getElementById('continueStep2Btn').style.display = 'inline-flex';
}

function performAssistedAnalysis() {
    // Similar to full auto but with user interaction opportunities
    performFullAIAnalysis();
    alert('KI-Analyse abgeschlossen! Sie können die Ergebnisse nun überprüfen und anpassen.');
}

function performManualAnalysis() {
    alert('Manuelle Auswahl-Modus aktiviert. Sie können nun Requirements manuell auswählen und bearbeiten.');
    displayAnalysisResults({
        requirements: 0,
        matches: 0,
        score: 0,
        confidence: 100
    });
    document.getElementById('continueStep2Btn').style.display = 'inline-flex';
}

// OPTIMIZATION 6: Display Analysis Results
function displayAnalysisResults(results) {
    const requirementsDisplay = document.getElementById('requirementsDisplay');
    const requirementsList = document.getElementById('requirementsList');
    
    if (requirementsDisplay) requirementsDisplay.style.display = 'block';
    if (requirementsList) {
        // Generate mock requirements
        const mockRequirements = generateMockRequirements(results.requirements);
        
        requirementsList.innerHTML = mockRequirements.map(req => `
            <div class="requirement-item" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 1rem; transition: all 0.3s ease;">
                <div class="requirement-header" style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
                    <div class="requirement-info" style="flex: 1;">
                        <h6 style="margin: 0; color: #374151; font-weight: 600;">${req.skill}</h6>
                        <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                            <span class="priority-badge" style="background: ${getPriorityColor(req.priority)}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${req.priority}</span>
                            <span class="category-badge" style="background: #f3f4f6; color: #6b7280; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${req.category}</span>
                        </div>
                    </div>
                    <div class="skill-match-indicator" style="display: flex; align-items: center; gap: 0.5rem;">
                        ${getSkillMatchIcon(req.match)}
                        <span style="font-size: 0.875rem; font-weight: 600; color: ${getSkillMatchColor(req.match)};">${getSkillMatchLabel(req.match)}</span>
                    </div>
                </div>
                <div class="requirement-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button onclick="addUserResponse(${req.id})" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Antwort hinzufügen</button>
                    <button onclick="editRequirement(${req.id})" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Bearbeiten</button>
                    <button onclick="duplicateRequirement(${req.id})" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Duplizieren</button>
                    <button onclick="removeRequirement(${req.id})" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Entfernen</button>
                </div>
            </div>
        `).join('');
    }
}

// OPTIMIZATION 7: Skill Gap Analysis Display
function displaySkillGapAnalysis() {
    const skillGapSection = document.getElementById('skillGapSection');
    const matchingSkillsList = document.getElementById('matchingSkillsList');
    const missingSkillsList = document.getElementById('missingSkillsList');
    
    if (skillGapSection) skillGapSection.style.display = 'block';
    
    // Mock skill data
    const matchingSkills = ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Git'];
    const missingSkills = ['Python', 'Docker', 'AWS', 'Machine Learning'];
    
    if (matchingSkillsList) {
        matchingSkillsList.innerHTML = matchingSkills.map(skill => `
            <div class="skill-item matching" style="background: #f0fdf4; border: 1px solid #10b981; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #065f46; font-weight: 600;">${skill}</span>
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
            </div>
        `).join('');
    }
    
    if (missingSkillsList) {
        missingSkillsList.innerHTML = missingSkills.map(skill => `
            <div class="skill-item missing" style="background: #fef2f2; border: 1px solid #ef4444; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #991b1b; font-weight: 600;">${skill}</span>
                <button onclick="addSkillToDevelopment('${skill}')" style="background: #f59e0b; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                    Lernen
                </button>
            </div>
        `).join('');
    }
}

// Helper Functions
function generateMockRequirements(count) {
    const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Git', 'SQL', 'REST APIs', 'Agile'];
    const priorities = ['Hoch', 'Mittel', 'Niedrig'];
    const categories = ['Technisch', 'Soft Skills', 'Tools', 'Methodisch'];
    const matches = ['perfect', 'good', 'partial', 'none'];
    
    return Array.from({length: count}, (_, i) => ({
        id: i,
        skill: skills[Math.floor(Math.random() * skills.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        match: matches[Math.floor(Math.random() * matches.length)]
    }));
}

function getPriorityColor(priority) {
    switch(priority) {
        case 'Hoch': return '#ef4444';
        case 'Mittel': return '#f59e0b';
        case 'Niedrig': return '#10b981';
        default: return '#6b7280';
    }
}

function getSkillMatchIcon(match) {
    switch(match) {
        case 'perfect': return '<i class="fas fa-star" style="color: #10b981;"></i>';
        case 'good': return '<i class="fas fa-thumbs-up" style="color: #3b82f6;"></i>';
        case 'partial': return '<i class="fas fa-adjust" style="color: #f59e0b;"></i>';
        case 'none': return '<i class="fas fa-times" style="color: #ef4444;"></i>';
        default: return '<i class="fas fa-question" style="color: #6b7280;"></i>';
    }
}

function getSkillMatchLabel(match) {
    switch(match) {
        case 'perfect': return 'Perfekt';
        case 'good': return 'Gut';
        case 'partial': return 'Teilweise';
        case 'none': return 'Fehlend';
        default: return 'Unbekannt';
    }
}

function getSkillMatchColor(match) {
    switch(match) {
        case 'perfect': return '#10b981';
        case 'good': return '#3b82f6';
        case 'partial': return '#f59e0b';
        case 'none': return '#ef4444';
        default: return '#6b7280';
    }
}

// OPTIMIZATION 10: Performance Monitor
function updatePerformanceMonitor(status) {
    const monitor = document.getElementById('performanceMonitor');
    if (monitor) {
        monitor.style.display = 'block';
        document.getElementById('perfStatus').textContent = status;
        document.getElementById('perfTime').textContent = Math.floor(Math.random() * 2000 + 500) + 'ms';
        document.getElementById('perfRate').textContent = Math.floor(Math.random() * 50 + 10) + '/s';
    }
}

// Additional Helper Functions (placeholder implementations)
window.refreshAnalysis = function() { alert('Analyse wird aktualisiert...'); };
window.skipWithTemplate = function() { nextWorkflowStep(3); };
window.skipManual = function() { nextWorkflowStep(3); };
window.addUserResponse = function(id) { alert(`Antwort für Requirement ${id} hinzufügen...`); };
window.editRequirement = function(id) { alert(`Requirement ${id} bearbeiten...`); };
window.duplicateRequirement = function(id) { alert(`Requirement ${id} duplizieren...`); };
window.removeRequirement = function(id) { alert(`Requirement ${id} entfernen...`); };
window.addSkillToDevelopment = function(skill) { alert(`${skill} zu Entwicklungsplan hinzufügen...`); };
window.addButtonEffect = function(btn, type) { console.log('Button effect:', type); };
window.removeButtonEffect = function(btn, type) { console.log('Button effect removed:', type); };

console.log('✅ Step 2 Modul geladen');
