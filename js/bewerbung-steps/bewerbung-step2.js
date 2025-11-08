// =================== BEWERBUNGS-WORKFLOW STEP 2 ===================
// Stellenausschreibung analysieren

window.generateStep2 = function() {
    return `
        <div class="step-content">
            <div class="step-header">
                <h2 style="margin: 0 0 1rem; color: #1f2937; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-search" style="color: #3b82f6; font-size: 2rem;"></i>
                    Schritt 2: Stellenausschreibung analysieren
                </h2>
                <p style="color: #6b7280; font-size: 1.1rem; margin: 0;">
                    Analysieren Sie die Stellenausschreibung für optimale Bewerbungsanpassung
                </p>
            </div>

            <div class="job-analysis-container" style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <form id="workflowJobAnalysisForm">
                    <!-- Job Information -->
                    <div class="form-section" style="margin-bottom: 2rem;">
                        <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-briefcase" style="color: #10b981;"></i>
                            Stelleninformationen
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Position *</label>
                                <input type="text" id="wfJobPosition" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" placeholder="z.B. Senior Software Developer">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Unternehmen *</label>
                                <input type="text" id="wfJobCompany" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" placeholder="z.B. Tech Innovations GmbH">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Standort</label>
                                <input type="text" id="wfJobLocation" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" placeholder="z.B. Berlin, München">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Gehaltsspanne</label>
                                <input type="text" id="wfJobSalary" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;" placeholder="z.B. 60.000 - 80.000 €">
                            </div>
                        </div>
                    </div>

                    <!-- Job Description -->
                    <div class="form-section" style="margin-bottom: 2rem;">
                        <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-file-alt" style="color: #f59e0b;"></i>
                            Stellenausschreibung
                        </h3>
                        
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Vollständige Stellenausschreibung *</label>
                            <textarea id="wfJobDescription" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; min-height: 200px; resize: vertical;" placeholder="Fügen Sie hier die komplette Stellenausschreibung ein..."></textarea>
                            <small style="color: #6b7280; font-size: 0.875rem;">
                                Je detaillierter die Beschreibung, desto besser können wir Ihre Bewerbung anpassen
                            </small>
                        </div>
                    </div>

                    <!-- AI Analysis Options -->
                    <div class="form-section" style="margin-bottom: 2rem;">
                        <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-robot" style="color: #8b5cf6;"></i>
                            KI-Analyse Optionen
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Analyse-Tiefe</label>
                                <select id="wfAnalysisDepth" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
                                    <option value="basic">Basis-Analyse</option>
                                    <option value="detailed" selected>Detaillierte Analyse</option>
                                    <option value="comprehensive">Umfassende Analyse</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Fokus-Bereich</label>
                                <select id="wfAnalysisFocus" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
                                    <option value="all" selected>Alle Bereiche</option>
                                    <option value="technical">Technische Fähigkeiten</option>
                                    <option value="soft-skills">Soft Skills</option>
                                    <option value="experience">Berufserfahrung</option>
                                    <option value="education">Bildung</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Analysis Button -->
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <button type="button" id="quickAnalysisBtn" style="
                            background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none;
                            padding: 1rem 2rem; border-radius: 8px; cursor: pointer;
                            font-weight: 600; font-size: 1rem;
                        ">
                            <i class="fas fa-magic"></i> KI-Analyse starten
                        </button>
                    </div>

                    <!-- Analysis Results -->
                    <div id="analysisResults" style="display: none; background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid #e5e7eb;">
                        <h4 style="margin: 0 0 1rem; color: #374151;">Analyse-Ergebnisse</h4>
                        <div id="analysisContent">
                            <!-- Wird dynamisch gefüllt -->
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                        <button type="button" onclick="previousWorkflowStep(1)" style="
                            background: #6b7280; color: white; border: none;
                            padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                            font-weight: 500;
                        ">
                            <i class="fas fa-arrow-left"></i> Zurück
                        </button>
                        
                        <button type="submit" style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none;
                            padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer;
                            font-weight: 600; font-size: 1rem;
                        ">
                            <i class="fas fa-arrow-right"></i> Weiter zu Schritt 3
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

// Step 2 Event Handler
window.handleStep2Submit = function(formData) {
    console.log('📋 Step 2 Daten:', formData);
    
    // Daten in globales Workflow-Objekt speichern
    window.bewerbungData.jobAnalysis = {
        position: formData.position,
        company: formData.company,
        location: formData.location,
        salary: formData.salary,
        description: formData.description,
        analysisDepth: formData.analysisDepth,
        analysisFocus: formData.analysisFocus,
        analysisResults: formData.analysisResults
    };
    
    console.log('✅ Step 2 Daten gespeichert');
    return true;
};

// Step 2 Initialisierung
window.initStep2 = function() {
    console.log('🚀 Step 2 wird initialisiert...');
    
    // Form Event Listener
    const form = document.getElementById('workflowJobAnalysisForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                position: document.getElementById('wfJobPosition')?.value,
                company: document.getElementById('wfJobCompany')?.value,
                location: document.getElementById('wfJobLocation')?.value,
                salary: document.getElementById('wfJobSalary')?.value,
                description: document.getElementById('wfJobDescription')?.value,
                analysisDepth: document.getElementById('wfAnalysisDepth')?.value,
                analysisFocus: document.getElementById('wfAnalysisFocus')?.value,
                analysisResults: window.currentAnalysisResults || null
            };
            
            // Validierung
            if (!formData.position || !formData.company || !formData.description) {
                alert('❌ Bitte füllen Sie alle Pflichtfelder aus.');
                return;
            }
            
            // Daten verarbeiten
            if (window.handleStep2Submit(formData)) {
                // Weiter zu Schritt 3
                nextWorkflowStep(3);
            }
        });
    }
    
    // Quick Analysis Button
    const quickAnalysisBtn = document.getElementById('quickAnalysisBtn');
    if (quickAnalysisBtn) {
        quickAnalysisBtn.addEventListener('click', async () => {
            await performQuickAnalysis();
        });
    }
};

// KI-Analyse Funktion
async function performQuickAnalysis() {
    const description = document.getElementById('wfJobDescription')?.value;
    const analysisDepth = document.getElementById('wfAnalysisDepth')?.value;
    const analysisFocus = document.getElementById('wfAnalysisFocus')?.value;
    
    if (!description) {
        alert('❌ Bitte geben Sie zuerst eine Stellenausschreibung ein.');
        return;
    }
    
    const quickAnalysisBtn = document.getElementById('quickAnalysisBtn');
    const analysisResults = document.getElementById('analysisResults');
    const analysisContent = document.getElementById('analysisContent');
    
    // Loading State
    quickAnalysisBtn.disabled = true;
    quickAnalysisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysiere...';
    
    try {
        // Simuliere KI-Analyse (in echter Implementierung würde hier eine API aufgerufen)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock Analysis Results
        const mockResults = {
            keyRequirements: [
                'JavaScript/TypeScript Erfahrung',
                'React oder Vue.js Kenntnisse',
                'Node.js Backend-Entwicklung',
                'Datenbank-Erfahrung (SQL/NoSQL)',
                'Agile Arbeitsweise'
            ],
            softSkills: [
                'Teamfähigkeit',
                'Kommunikationsfähigkeit',
                'Problemlösungskompetenz',
                'Lernbereitschaft'
            ],
            experienceLevel: '3-5 Jahre',
            industryFocus: 'IT & Software',
            matchScore: 85
        };
        
        // Ergebnisse anzeigen
        analysisContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div>
                    <h5 style="color: #374151; margin-bottom: 0.75rem;">🔑 Schlüssel-Anforderungen</h5>
                    <ul style="margin: 0; padding-left: 1.5rem; color: #6b7280;">
                        ${mockResults.keyRequirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h5 style="color: #374151; margin-bottom: 0.75rem;">🤝 Soft Skills</h5>
                    <ul style="margin: 0; padding-left: 1.5rem; color: #6b7280;">
                        ${mockResults.softSkills.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #374151;">Erfahrungslevel:</strong> ${mockResults.experienceLevel}<br>
                        <strong style="color: #374151;">Branche:</strong> ${mockResults.industryFocus}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 2rem; font-weight: bold; color: #10b981;">${mockResults.matchScore}%</div>
                        <div style="color: #6b7280; font-size: 0.875rem;">Match Score</div>
                    </div>
                </div>
            </div>
        `;
        
        analysisResults.style.display = 'block';
        window.currentAnalysisResults = mockResults;
        
    } catch (error) {
        console.error('❌ Analyse-Fehler:', error);
        alert('❌ Fehler bei der Analyse. Bitte versuchen Sie es erneut.');
    } finally {
        // Reset Button
        quickAnalysisBtn.disabled = false;
        quickAnalysisBtn.innerHTML = '<i class="fas fa-magic"></i> KI-Analyse starten';
    }
}

// Auto-initialize Step 2
if (window.bewerbungData && window.bewerbungData.currentStep === 2) {
    setTimeout(() => {
        initStep2();
    }, 100);
}

console.log('✅ Step 2 Modul geladen');







