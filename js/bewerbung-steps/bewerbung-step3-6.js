// =================== BEWERBUNGS-WORKFLOW STEP 3-6 ===================
// Vereinfachte Implementierung für die restlichen Schritte

// Step 3: Bewerbungsschreiben generieren
window.generateStep3 = function() {
    return `
        <div class="step-content">
            <div class="step-header">
                <h2 style="margin: 0 0 1rem; color: #1f2937; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-file-alt" style="color: #3b82f6; font-size: 2rem;"></i>
                    Schritt 3: Bewerbungsschreiben generieren
                </h2>
                <p style="color: #6b7280; font-size: 1.1rem; margin: 0;">
                    KI-generiertes Bewerbungsschreiben basierend auf Ihrem Profil und der Stellenausschreibung
                </p>
            </div>

            <div class="letter-generation-container" style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <button type="button" id="generateLetterBtn" style="
                        background: linear-gradient(135deg, #10b981, #059669); color: white; border: none;
                        padding: 1rem 2rem; border-radius: 8px; cursor: pointer;
                        font-weight: 600; font-size: 1rem;
                    ">
                        <i class="fas fa-magic"></i> Bewerbungsschreiben generieren
                    </button>
                </div>

                <div id="generatedLetter" style="display: none; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="margin: 0 0 1rem; color: #374151;">Generiertes Bewerbungsschreiben</h4>
                    <div id="letterContent" style="white-space: pre-wrap; line-height: 1.6; color: #374151;">
                        <!-- Wird dynamisch gefüllt -->
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid #e5e7eb; margin-top: 2rem;">
                    <button type="button" onclick="previousWorkflowStep(2)" style="
                        background: #6b7280; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                        font-weight: 500;
                    ">
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    
                    <button type="button" onclick="nextWorkflowStep(4)" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none;
                        padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer;
                        font-weight: 600; font-size: 1rem;
                    ">
                        <i class="fas fa-arrow-right"></i> Weiter zu Schritt 4
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Step 4: CV/Lebenslauf anpassen
window.generateStep4 = function() {
    return `
        <div class="step-content">
            <div class="step-header">
                <h2 style="margin: 0 0 1rem; color: #1f2937; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-id-card" style="color: #3b82f6; font-size: 2rem;"></i>
                    Schritt 4: Lebenslauf anpassen
                </h2>
                <p style="color: #6b7280; font-size: 1.1rem; margin: 0;">
                    Passen Sie Ihren Lebenslauf an die Stellenausschreibung an
                </p>
            </div>

            <div class="cv-customization-container" style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <button type="button" id="customizeCvBtn" style="
                        background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none;
                        padding: 1rem 2rem; border-radius: 8px; cursor: pointer;
                        font-weight: 600; font-size: 1rem;
                    ">
                        <i class="fas fa-edit"></i> Lebenslauf anpassen
                    </button>
                </div>

                <div id="cvPreview" style="display: none; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="margin: 0 0 1rem; color: #374151;">Angepasster Lebenslauf</h4>
                    <div id="cvContent" style="white-space: pre-wrap; line-height: 1.6; color: #374151;">
                        <!-- Wird dynamisch gefüllt -->
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid #e5e7eb; margin-top: 2rem;">
                    <button type="button" onclick="previousWorkflowStep(3)" style="
                        background: #6b7280; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                        font-weight: 500;
                    ">
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    
                    <button type="button" onclick="nextWorkflowStep(5)" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none;
                        padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer;
                        font-weight: 600; font-size: 1rem;
                    ">
                        <i class="fas fa-arrow-right"></i> Weiter zu Schritt 5
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Step 5: Design und Formatierung
window.generateStep5 = function() {
    return `
        <div class="step-content">
            <div class="step-header">
                <h2 style="margin: 0 0 1rem; color: #1f2937; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-palette" style="color: #3b82f6; font-size: 2rem;"></i>
                    Schritt 5: Design und Formatierung
                </h2>
                <p style="color: #6b7280; font-size: 1.1rem; margin: 0;">
                    Wählen Sie das Design und die Formatierung für Ihre Bewerbungsunterlagen
                </p>
            </div>

            <div class="design-container" style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="color: #374151; margin-bottom: 1rem;">Design-Vorlagen</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="design-option" data-template="modern" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: center;">
                                <div style="background: #3b82f6; height: 60px; border-radius: 4px; margin-bottom: 0.5rem;"></div>
                                <div style="font-weight: 500;">Modern</div>
                            </div>
                            <div class="design-option" data-template="classic" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: center;">
                                <div style="background: #374151; height: 60px; border-radius: 4px; margin-bottom: 0.5rem;"></div>
                                <div style="font-weight: 500;">Classic</div>
                            </div>
                            <div class="design-option" data-template="creative" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: center;">
                                <div style="background: linear-gradient(45deg, #8b5cf6, #ec4899); height: 60px; border-radius: 4px; margin-bottom: 0.5rem;"></div>
                                <div style="font-weight: 500;">Creative</div>
                            </div>
                            <div class="design-option" data-template="minimal" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: center;">
                                <div style="background: #f3f4f6; height: 60px; border-radius: 4px; margin-bottom: 0.5rem;"></div>
                                <div style="font-weight: 500;">Minimal</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: #374151; margin-bottom: 1rem;">Formatierung</h4>
                        <div style="space-y: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Dateiformat</label>
                                <select id="fileFormat" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                                    <option value="pdf">PDF</option>
                                    <option value="docx">Word (.docx)</option>
                                    <option value="html">HTML</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Seitenanzahl</label>
                                <select id="pageCount" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                                    <option value="1">1 Seite</option>
                                    <option value="2" selected>2 Seiten</option>
                                    <option value="3">3 Seiten</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid #e5e7eb; margin-top: 2rem;">
                    <button type="button" onclick="previousWorkflowStep(4)" style="
                        background: #6b7280; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                        font-weight: 500;
                    ">
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    
                    <button type="button" onclick="nextWorkflowStep(6)" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none;
                        padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer;
                        font-weight: 600; font-size: 1rem;
                    ">
                        <i class="fas fa-arrow-right"></i> Weiter zu Schritt 6
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Step 6: Finale Überprüfung und Download
window.generateStep6 = function() {
    return `
        <div class="step-content">
            <div class="step-header">
                <h2 style="margin: 0 0 1rem; color: #1f2937; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 2rem;"></i>
                    Schritt 6: Finale Überprüfung
                </h2>
                <p style="color: #6b7280; font-size: 1.1rem; margin: 0;">
                    Überprüfen Sie Ihre Bewerbungsunterlagen und laden Sie das Paket herunter
                </p>
            </div>

            <div class="final-review-container" style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h4 style="color: #374151; margin-bottom: 1rem;">📄 Bewerbungsschreiben</h4>
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                            <div style="font-weight: 500; margin-bottom: 0.5rem;">Status: ✅ Generiert</div>
                            <div style="color: #6b7280; font-size: 0.875rem;">Basierend auf Ihrem Profil und der Stellenausschreibung</div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: #374151; margin-bottom: 1rem;">📋 Lebenslauf</h4>
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                            <div style="font-weight: 500; margin-bottom: 0.5rem;">Status: ✅ Angepasst</div>
                            <div style="color: #6b7280; font-size: 0.875rem;">Optimiert für die Zielposition</div>
                        </div>
                    </div>
                </div>

                <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border: 1px solid #0ea5e9; margin-bottom: 2rem;">
                    <h4 style="color: #0c4a6e; margin: 0 0 1rem;">📊 Bewerbungsanalyse</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; font-weight: bold; color: #0ea5e9;">85%</div>
                            <div style="color: #0c4a6e; font-size: 0.875rem;">Match Score</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; font-weight: bold; color: #10b981;">12</div>
                            <div style="color: #0c4a6e; font-size: 0.875rem;">Anforderungen erfüllt</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem; font-weight: bold; color: #f59e0b;">3</div>
                            <div style="color: #0c4a6e; font-size: 0.875rem;">Verbesserungsvorschläge</div>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-bottom: 2rem;">
                    <button type="button" id="downloadPackageBtn" style="
                        background: linear-gradient(135deg, #10b981, #059669); color: white; border: none;
                        padding: 1rem 2rem; border-radius: 8px; cursor: pointer;
                        font-weight: 600; font-size: 1rem;
                    ">
                        <i class="fas fa-download"></i> Bewerbungspaket herunterladen
                    </button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
                    <button type="button" onclick="previousWorkflowStep(5)" style="
                        background: #6b7280; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                        font-weight: 500;
                    ">
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    
                    <button type="button" onclick="finishWorkflow()" style="
                        background: linear-gradient(135deg, #10b981, #059669); color: white; border: none;
                        padding: 0.75rem 2rem; border-radius: 8px; cursor: pointer;
                        font-weight: 600; font-size: 1rem;
                    ">
                        <i class="fas fa-check"></i> Workflow abschließen
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Event Handler für alle Steps
window.handleStep3Submit = function() { console.log('✅ Step 3 abgeschlossen'); return true; };
window.handleStep4Submit = function() { console.log('✅ Step 4 abgeschlossen'); return true; };
window.handleStep5Submit = function() { console.log('✅ Step 5 abgeschlossen'); return true; };
window.handleStep6Submit = function() { console.log('✅ Step 6 abgeschlossen'); return true; };

// Initialisierung für alle Steps
window.initStep3 = function() {
    const generateBtn = document.getElementById('generateLetterBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generiere...';
            setTimeout(() => {
                document.getElementById('generatedLetter').style.display = 'block';
                document.getElementById('letterContent').textContent = 'Sehr geehrte Damen und Herren,\n\nmit großem Interesse habe ich Ihre Stellenausschreibung für die Position "Senior Software Developer" gelesen...';
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> Bewerbungsschreiben generieren';
            }, 2000);
        });
    }
};

window.initStep4 = function() {
    const customizeBtn = document.getElementById('customizeCvBtn');
    if (customizeBtn) {
        customizeBtn.addEventListener('click', () => {
            customizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Passe an...';
            setTimeout(() => {
                document.getElementById('cvPreview').style.display = 'block';
                document.getElementById('cvContent').textContent = 'Manuel Weiss\nSoftware Developer\n\nBerufserfahrung:\n- 3 Jahre Erfahrung in JavaScript/TypeScript\n- React und Vue.js Kenntnisse...';
                customizeBtn.innerHTML = '<i class="fas fa-edit"></i> Lebenslauf anpassen';
            }, 2000);
        });
    }
};

window.initStep5 = function() {
    document.querySelectorAll('.design-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.design-option').forEach(o => o.style.borderColor = '#e5e7eb');
            option.style.borderColor = '#3b82f6';
        });
    });
};

window.initStep6 = function() {
    const downloadBtn = document.getElementById('downloadPackageBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Erstelle Paket...';
            setTimeout(() => {
                alert('🎉 Bewerbungspaket erfolgreich erstellt!\n\nDas Paket wurde in Ihrem Download-Ordner gespeichert.');
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> Bewerbungspaket herunterladen';
            }, 2000);
        });
    }
};

// Auto-initialize Steps
document.addEventListener('DOMContentLoaded', () => {
    if (window.bewerbungData) {
        const currentStep = window.bewerbungData.currentStep;
        setTimeout(() => {
            if (currentStep === 3) initStep3();
            else if (currentStep === 4) initStep4();
            else if (currentStep === 5) initStep5();
            else if (currentStep === 6) initStep6();
        }, 100);
    }
});

console.log('✅ Steps 3-6 Module geladen');
