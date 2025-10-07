// =================== STEP 0: BEWERBUNGSART AUSWAHL ===================
// Modul für die initiale Auswahl zwischen Stellenausschreibung und Initiativbewerbung
// Teil des modularen Smart Bewerbungs-Workflows

/**
 * STEP 0 - Application Type Selection
 * Ermöglicht die Auswahl zwischen:
 * - Stellenausschreibung (mit KI-Analyse)
 * - Initiativbewerbung (ohne Stellenausschreibung)
 */

// ====== SCHRITT 0: BEWERBUNGSART AUSWAHL ======
function generateStep0() {
    return `
        <div class="workflow-step-container application-type-selection" data-step="0">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="color: #1f2937; font-size: 2rem; margin-bottom: 1rem; font-weight: 700;">
                    🚀 Bewerbungsart wählen
                </h2>
                <p style="color: #6b7280; font-size: 1.1rem; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                    Wählen Sie, ob Sie sich auf eine konkrete Stellenausschreibung bewerben möchten oder eine Initiativbewerbung erstellen wollen.
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; max-width: 800px; margin: 0 auto;">
                <!-- Stellenausschreibung Option -->
                <div class="application-type-card" onclick="selectApplicationType('job-posting')" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
                    border: 3px solid transparent;
                " onmouseover="this.style.transform='translateY(-8px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(102, 126, 234, 0.4)'" 
                   onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(102, 126, 234, 0.3)'">
                    
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                    <h3 style="margin: 0 0 1rem; font-size: 1.5rem; font-weight: 700;">
                        Stellenausschreibung
                    </h3>
                    <p style="margin: 0 0 1.5rem; opacity: 0.9; line-height: 1.5;">
                        Bewerben Sie sich auf eine konkrete Stelle mit KI-basierter Analyse der Stellenausschreibung
                    </p>
                    
                    <div style="background: rgba(255, 255, 255, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">✨ Enthält:</div>
                        <ul style="text-align: left; margin: 0; padding-left: 1rem; font-size: 0.85rem; line-height: 1.4;">
                            <li>🤖 KI-Analyse der Stellenausschreibung</li>
                            <li>🎯 Automatische Anforderungserfassung</li>
                            <li>📊 Skill-Gap Analyse</li>
                            <li>✍️ Maßgeschneidertes Anschreiben</li>
                        </ul>
                    </div>
                    
                    <button style="
                        background: white;
                        color: #667eea;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 8px;
                        font-weight: 700;
                        cursor: pointer;
                        width: 100%;
                        font-size: 1rem;
                    ">
                        <i class="fas fa-search"></i> Stelle analysieren
                    </button>
                </div>

                <!-- Initiativbewerbung Option -->
                <div class="application-type-card" onclick="selectApplicationType('initiative')" style="
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
                    border: 3px solid transparent;
                " onmouseover="this.style.transform='translateY(-8px) scale(1.02)'; this.style.boxShadow='0 20px 40px rgba(16, 185, 129, 0.4)'" 
                   onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(16, 185, 129, 0.3)'">
                    
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💡</div>
                    <h3 style="margin: 0 0 1rem; font-size: 1.5rem; font-weight: 700;">
                        Initiativbewerbung
                    </h3>
                    <p style="margin: 0 0 1.5rem; opacity: 0.9; line-height: 1.5;">
                        Erstellen Sie eine überzeugende Bewerbung ohne konkreten Stellenbezug
                    </p>
                    
                    <div style="background: rgba(255, 255, 255, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">✨ Enthält:</div>
                        <ul style="text-align: left; margin: 0; padding-left: 1rem; font-size: 0.85rem; line-height: 1.4;">
                            <li>🎯 Unternehmensfokussierte Bewerbung</li>
                            <li>💼 Ihre Stärken im Mittelpunkt</li>
                            <li>🚀 Proaktive Positionierung</li>
                            <li>✍️ Überzeugendes Motivationsschreiben</li>
                        </ul>
                    </div>
                    
                    <button style="
                        background: white;
                        color: #10b981;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 8px;
                        font-weight: 700;
                        cursor: pointer;
                        width: 100%;
                        font-size: 1rem;
                    ">
                        <i class="fas fa-lightbulb"></i> Initiativ bewerben
                    </button>
                </div>
            </div>

            <div style="text-align: center; margin-top: 2rem; color: #6b7280; font-size: 0.9rem;">
                💡 <strong>Tipp:</strong> Bei einer Initiativbewerbung liegt der Fokus auf Ihren Qualifikationen und der Motivation, für das Unternehmen zu arbeiten.
            </div>
        </div>
    `;
}

// Application type selection handler
function selectApplicationType(type) {
    console.log('🎯 Bewerbungsart ausgewählt:', type);
    
    // Store selection in workflow data
    window.workflowData.applicationType = type;
    
    // Show selection feedback
    const cards = document.querySelectorAll('.application-type-card');
    cards.forEach(card => {
        card.style.opacity = '0.6';
        card.style.transform = 'scale(0.95)';
    });
    
    // Highlight selected card
    const selectedCard = event.currentTarget;
    selectedCard.style.opacity = '1';
    selectedCard.style.transform = 'scale(1.05)';
    selectedCard.style.borderColor = '#f59e0b';
    selectedCard.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.3), 0 20px 40px rgba(0, 0, 0, 0.3)';
    
    // Add checkmark
    if (!selectedCard.querySelector('.selection-checkmark')) {
        const checkmark = document.createElement('div');
        checkmark.className = 'selection-checkmark';
        checkmark.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: #f59e0b;
            color: white;
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            animation: checkmarkPop 0.3s ease-out;
        `;
        checkmark.innerHTML = '✓';
        selectedCard.style.position = 'relative';
        selectedCard.appendChild(checkmark);
    }
    
    // Add animation keyframe
    const style = document.createElement('style');
    style.textContent = `
        @keyframes checkmarkPop {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(0deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Auto-proceed after short delay
    setTimeout(() => {
        if (type === 'job-posting') {
            // Normal workflow with job posting analysis
            nextWorkflowStep(1);
        } else {
            // Skip to step 2 for initiative applications (no job posting to analyze)
            window.workflowData.skipJobAnalysis = true;
            nextWorkflowStep(2);
        }
    }, 1500);
}

// Make functions globally available
window.generateStep0 = generateStep0;
window.selectApplicationType = selectApplicationType;

console.log('✅ Step 0 Module (Bewerbungsart Auswahl) geladen');
