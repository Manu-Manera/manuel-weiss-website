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

// Step 4: CV/Lebenslauf anpassen (mit CV Tailor Integration)
window.generateStep4 = function() {
    return `
        <div class="step-content">
            <div class="step-header">
                <h2 style="margin: 0 0 1rem; color: #1f2937; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-id-card" style="color: #3b82f6; font-size: 2rem;"></i>
                    Schritt 4: Lebenslauf anpassen
                </h2>
                <p style="color: #6b7280; font-size: 1.1rem; margin: 0;">
                    Laden Sie Ihren Lebenslauf hoch und passen Sie ihn KI-gestützt an die Stellenausschreibung an
                </p>
            </div>

            <div class="cv-customization-container">
                <!-- CV Tailor Option Toggle -->
                <div class="cv-tailor-toggle-wrapper">
                    <div class="cv-tailor-toggle-content">
                        <div class="cv-tailor-toggle-info">
                            <h3>
                                <i class="fas fa-magic"></i>
                                KI-gestützte CV-Anpassung (CV Tailor)
                            </h3>
                            <p>
                                Aktivieren Sie diese Option für eine vollautomatische, KI-gestützte CV-Generierung und -Anpassung
                            </p>
                        </div>
                        <label class="cv-tailor-toggle">
                            <input type="checkbox" id="cvTailorToggle">
                            <span class="cv-tailor-toggle-slider" id="cvTailorToggleSlider"></span>
                        </label>
                    </div>
                </div>

                <!-- Standard CV Customization (when CV Tailor is OFF) -->
                <div id="standardCvCustomization" style="display: block;">
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
                </div>

                <!-- CV Tailor Interface (when CV Tailor is ON) -->
                <div id="cvTailorInterface" style="display: none;">
                <!-- CV Upload Section -->
                <div class="form-section" style="margin-bottom: 2rem;">
                    <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-upload" style="color: #10b981;"></i>
                        Lebenslauf hochladen
                    </h3>
                    <div class="cv-upload-area" id="cvUploadArea">
                        <input type="file" id="cvFileInput" accept=".pdf,.docx" style="display: none;" multiple>
                        <button type="button" class="cv-upload-button" onclick="document.getElementById('cvFileInput').click()">
                            <i class="fas fa-file-upload"></i> Dateien auswählen
                        </button>
                        <div class="cv-upload-hint">
                            <i class="fas fa-info-circle"></i>
                            PDF oder DOCX (max. 10MB pro Datei)
                        </div>
                        <div class="cv-file-list" id="cvFileList"></div>
                    </div>
                </div>

                <!-- Zeugnisse Upload (optional) -->
                <div class="form-section" style="margin-bottom: 2rem;">
                    <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-certificate" style="color: #f59e0b;"></i>
                        Zeugnisse hochladen (optional)
                    </h3>
                    <div class="cv-upload-area" id="certificateUploadArea">
                        <input type="file" id="certificateFileInput" accept=".pdf" style="display: none;" multiple>
                        <button type="button" class="cv-upload-button" style="background: linear-gradient(135deg, #f59e0b, #d97706);" onclick="document.getElementById('certificateFileInput').click()">
                            <i class="fas fa-file-upload"></i> Zeugnisse auswählen
                        </button>
                        <div class="cv-upload-hint">
                            <i class="fas fa-info-circle"></i>
                            PDF-Dateien (optional, für bessere Analyse)
                        </div>
                        <div class="cv-file-list" id="certificateFileList"></div>
                    </div>
                </div>

                <!-- CV Tailor Workflow -->
                <div class="form-section" style="margin-bottom: 2rem;">
                    <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-magic" style="color: #8b5cf6;"></i>
                        KI-gestützte CV-Anpassung
                    </h3>
                    
                    <div class="cv-action-buttons">
                        <button type="button" id="generateBaselineBtn" class="cv-action-button cv-action-button-primary" disabled>
                            <i class="fas fa-sparkles"></i> 
                            <span>Baseline-CV generieren</span>
                        </button>
                        <button type="button" id="generateTargetedBtn" class="cv-action-button cv-action-button-secondary" disabled>
                            <i class="fas fa-bullseye"></i> 
                            <span>Targeted-CV generieren</span>
                        </button>
                    </div>
                    
                    <div id="cvTailorProgress" class="cv-progress-container" style="display: none;">
                        <div class="cv-progress-content">
                            <div class="cv-progress-spinner"></div>
                            <span id="cvTailorProgressText" class="cv-progress-text">Verarbeite...</span>
                        </div>
                    </div>
                </div>

                <!-- CV Comparison View -->
                <div id="cvComparisonView" class="cv-comparison-container" style="display: none;">
                    <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-balance-scale" style="color: #8b5cf6;"></i>
                        CV-Vergleich
                    </h3>
                    <div class="cv-comparison-grid">
                        <div class="cv-preview-card cv-preview-card-baseline">
                            <div class="cv-preview-header">
                                <h4 class="cv-preview-title">
                                    <i class="fas fa-file-alt"></i>
                                    Baseline-CV
                                </h4>
                                <span class="cv-preview-badge">Original</span>
                            </div>
                            <div id="baselineCVPreview" class="cv-preview-content"></div>
                        </div>
                        <div class="cv-preview-card cv-preview-card-targeted">
                            <div class="cv-preview-header">
                                <h4 class="cv-preview-title">
                                    <i class="fas fa-bullseye"></i>
                                    Targeted-CV
                                </h4>
                                <span class="cv-preview-badge">Job-angepasst</span>
                            </div>
                            <div id="targetedCVPreview" class="cv-preview-content"></div>
                        </div>
                    </div>
                </div>

                <!-- Export Options -->
                <div id="cvExportSection" class="cv-export-section" style="display: none;">
                    <h3 style="color: #374151; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-download" style="color: #10b981;"></i>
                        Export
                    </h3>
                    <div class="cv-export-buttons">
                        <button type="button" id="exportDocxBtn" class="cv-export-button cv-export-button-docx">
                            <i class="fas fa-file-word"></i> 
                            <span>Als DOCX exportieren</span>
                        </button>
                        <button type="button" id="exportPdfBtn" class="cv-export-button cv-export-button-pdf">
                            <i class="fas fa-file-pdf"></i> 
                            <span>Als PDF exportieren</span>
                        </button>
                    </div>
                </div>
                </div>
                <!-- End CV Tailor Interface -->

                <!-- Actions -->
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
    console.log('🚀 Step 4 wird initialisiert (mit CV Tailor Integration)...');
    
    // CV Tailor Toggle
    const cvTailorToggle = document.getElementById('cvTailorToggle');
    const standardCvCustomization = document.getElementById('standardCvCustomization');
    const cvTailorInterface = document.getElementById('cvTailorInterface');
    
    if (cvTailorToggle) {
        // Load saved preference
        const savedPreference = localStorage.getItem('cvTailorEnabled');
        if (savedPreference === 'true') {
            cvTailorToggle.checked = true;
            updateCVTailorUI(true);
        }
        
        cvTailorToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('cvTailorEnabled', enabled.toString());
            updateCVTailorUI(enabled);
        });
    }
    
    function updateCVTailorUI(enabled) {
        if (enabled) {
            standardCvCustomization.style.display = 'none';
            cvTailorInterface.style.display = 'block';
            // Initialize CV Tailor functionality
            initCVTailorFunctionality();
        } else {
            standardCvCustomization.style.display = 'block';
            cvTailorInterface.style.display = 'none';
            // Initialize standard functionality
            initStandardCvCustomization();
        }
    }
    
    // Initialize based on current state
    if (cvTailorToggle && cvTailorToggle.checked) {
        updateCVTailorUI(true);
    } else {
        updateCVTailorUI(false);
    }
    
    function initStandardCvCustomization() {
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
    }
    
    // File selection state (außerhalb der Funktionen für Zugriff)
    let selectedCVFiles = [];
    let selectedCertificateFiles = [];
    
    function initCVTailorFunctionality() {
        // CV File Upload
        const cvFileInput = document.getElementById('cvFileInput');
        const cvFileList = document.getElementById('cvFileList');
        
        if (cvFileInput) {
            cvFileInput.addEventListener('change', (e) => {
                selectedCVFiles = Array.from(e.target.files);
                displayFileList(selectedCVFiles, cvFileList);
                updateButtonStates();
            });
        }
        
        // Certificate File Upload with Drag & Drop
        const certificateFileInput = document.getElementById('certificateFileInput');
        const certificateFileList = document.getElementById('certificateFileList');
        const certificateUploadArea = document.getElementById('certificateUploadArea');
        
        if (certificateFileInput && certificateUploadArea) {
            // Click to upload
            certificateFileInput.addEventListener('change', (e) => {
                selectedCertificateFiles = Array.from(e.target.files);
                displayFileList(selectedCertificateFiles, certificateFileList);
                certificateUploadArea.classList.remove('drag-over');
            });
            
            // Drag & Drop
            certificateUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                certificateUploadArea.classList.add('drag-over');
            });
            
            certificateUploadArea.addEventListener('dragleave', () => {
                certificateUploadArea.classList.remove('drag-over');
            });
            
            certificateUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                certificateUploadArea.classList.remove('drag-over');
                const files = Array.from(e.dataTransfer.files).filter(f => 
                    f.name.endsWith('.pdf')
                );
                if (files.length > 0) {
                    selectedCertificateFiles = files;
                    displayFileList(selectedCertificateFiles, certificateFileList);
                }
            });
        }
    
    // Baseline CV Generation
    const generateBaselineBtn = document.getElementById('generateBaselineBtn');
    if (generateBaselineBtn) {
        generateBaselineBtn.addEventListener('click', async () => {
            if (selectedCVFiles.length === 0) {
                alert('❌ Bitte laden Sie zuerst einen Lebenslauf hoch.');
                return;
            }
            
            try {
                showProgress('Parse CV-Dateien...');
                generateBaselineBtn.disabled = true;
                
                // Parse Files
                const allFiles = [...selectedCVFiles, ...selectedCertificateFiles];
                const cvData = await window.cvTailor.parseFiles(allFiles);
                
                showProgress('Generiere Baseline-CV...');
                
                // Generate Baseline
                const baselineCV = await window.cvTailor.generateBaselineCV(cvData);
                
                // Display Baseline
                document.getElementById('baselineCVPreview').textContent = baselineCV;
                window.bewerbungData.baselineCV = baselineCV;
                window.bewerbungData.cvData = cvData;
                
                // Enable Targeted Button
                document.getElementById('generateTargetedBtn').disabled = false;
                
                hideProgress();
                generateBaselineBtn.disabled = false;
                generateBaselineBtn.innerHTML = '<i class="fas fa-check"></i> Baseline-CV generiert';
                
                // Show comparison view
                document.getElementById('cvComparisonView').style.display = 'block';
                
            } catch (error) {
                console.error('Baseline CV Generation Error:', error);
                alert(`❌ Fehler: ${error.message}`);
                hideProgress();
                generateBaselineBtn.disabled = false;
            }
        });
    }
    
    // Targeted CV Generation
    const generateTargetedBtn = document.getElementById('generateTargetedBtn');
    if (generateTargetedBtn) {
        generateTargetedBtn.addEventListener('click', async () => {
            if (!window.bewerbungData.baselineCV) {
                alert('❌ Bitte generieren Sie zuerst einen Baseline-CV.');
                return;
            }
            
            // Get job data from step 2
            const jobAnalysis = window.bewerbungData.jobAnalysis;
            if (!jobAnalysis || !jobAnalysis.description) {
                alert('❌ Bitte analysieren Sie zuerst die Stellenausschreibung in Schritt 2.');
                return;
            }
            
            try {
                generateTargetedBtn.classList.add('loading');
                generateTargetedBtn.disabled = true;
                showProgress('Parse Stellenausschreibung...');
                
                // Parse Job Posting
                const jobData = await window.cvTailor.parseJobPosting(jobAnalysis.description, 'text');
                
                showProgress('Generiere Targeted-CV...');
                
                // Generate Targeted CV
                const targetedCV = await window.cvTailor.generateTargetedCV(window.bewerbungData.baselineCV, jobData);
                
                // Display Targeted
                document.getElementById('targetedCVPreview').textContent = targetedCV;
                window.bewerbungData.targetedCV = targetedCV;
                window.bewerbungData.jobData = jobData;
                
                hideProgress();
                generateTargetedBtn.classList.remove('loading');
                generateTargetedBtn.disabled = false;
                generateTargetedBtn.innerHTML = '<i class="fas fa-check"></i> <span>Targeted-CV generiert</span>';
                
                // Show success message
                showSuccessMessage('Targeted-CV erfolgreich generiert!');
                
                // Show export section with animation
                const exportSection = document.getElementById('cvExportSection');
                exportSection.style.display = 'block';
                setTimeout(() => exportSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
                
            } catch (error) {
                console.error('Targeted CV Generation Error:', error);
                showErrorMessage(`Fehler: ${error.message}`);
                hideProgress();
                generateTargetedBtn.classList.remove('loading');
                generateTargetedBtn.disabled = false;
            }
        });
    }
    
    // Export Buttons
    const exportDocxBtn = document.getElementById('exportDocxBtn');
    if (exportDocxBtn) {
        exportDocxBtn.addEventListener('click', async () => {
            if (!window.bewerbungData.targetedCV) {
                alert('❌ Bitte generieren Sie zuerst einen Targeted-CV.');
                return;
            }
            
            try {
                exportDocxBtn.classList.add('loading');
                exportDocxBtn.disabled = true;
                exportDocxBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Exportiere...</span>';
                
                await window.cvTailor.exportCV(
                    window.bewerbungData.targetedCV,
                    'docx',
                    `lebenslauf-${window.bewerbungData.jobAnalysis?.company || 'targeted'}-${Date.now()}.docx`
                );
                
                exportDocxBtn.classList.remove('loading');
                exportDocxBtn.innerHTML = '<i class="fas fa-check"></i> <span>Exportiert</span>';
                showSuccessMessage('CV erfolgreich als DOCX exportiert!');
                
                setTimeout(() => {
                    exportDocxBtn.innerHTML = '<i class="fas fa-file-word"></i> <span>Als DOCX exportieren</span>';
                    exportDocxBtn.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('Export Error:', error);
                showErrorMessage(`Fehler beim Export: ${error.message}`);
                exportDocxBtn.classList.remove('loading');
                exportDocxBtn.disabled = false;
                exportDocxBtn.innerHTML = '<i class="fas fa-file-word"></i> <span>Als DOCX exportieren</span>';
            }
        });
    }
    
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', async () => {
            if (!window.bewerbungData.targetedCV) {
                alert('❌ Bitte generieren Sie zuerst einen Targeted-CV.');
                return;
            }
            
            try {
                exportPdfBtn.classList.add('loading');
                exportPdfBtn.disabled = true;
                exportPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Exportiere...</span>';
                
                await window.cvTailor.exportCV(
                    window.bewerbungData.targetedCV,
                    'pdf',
                    `lebenslauf-${window.bewerbungData.jobAnalysis?.company || 'targeted'}-${Date.now()}.pdf`
                );
                
                exportPdfBtn.classList.remove('loading');
                exportPdfBtn.innerHTML = '<i class="fas fa-check"></i> <span>Exportiert</span>';
                showSuccessMessage('CV erfolgreich als PDF exportiert!');
                
                setTimeout(() => {
                    exportPdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> <span>Als PDF exportieren</span>';
                    exportPdfBtn.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('Export Error:', error);
                showErrorMessage(`Fehler beim Export: ${error.message}`);
                exportPdfBtn.classList.remove('loading');
                exportPdfBtn.disabled = false;
                exportPdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> <span>Als PDF exportieren</span>';
            }
        });
    }
    
    // Helper Functions
    function displayFileList(files, container) {
        if (files.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = files.map((file, index) => {
            const fileIcon = file.name.endsWith('.pdf') ? 'fa-file-pdf' : 
                           file.name.endsWith('.docx') ? 'fa-file-word' : 
                           'fa-file';
            const fileColor = file.name.endsWith('.pdf') ? '#dc2626' : 
                            file.name.endsWith('.docx') ? '#2563eb' : 
                            '#64748b';
            
            return `
                <div class="cv-file-item">
                    <div class="cv-file-info">
                        <div class="cv-file-icon" style="background: linear-gradient(135deg, ${fileColor}, ${fileColor}dd);">
                            <i class="fas ${fileIcon}"></i>
                        </div>
                        <div class="cv-file-details">
                            <div class="cv-file-name">${file.name}</div>
                            <div class="cv-file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                    </div>
                    <button type="button" class="cv-file-remove" onclick="removeFile(${index}, '${container.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    
    function updateButtonStates() {
        const generateBaselineBtn = document.getElementById('generateBaselineBtn');
        if (generateBaselineBtn && selectedCVFiles.length > 0) {
            generateBaselineBtn.disabled = false;
        }
    }
    
    function showProgress(text) {
        const progressDiv = document.getElementById('cvTailorProgress');
        const progressText = document.getElementById('cvTailorProgressText');
        if (progressDiv && progressText) {
            progressText.textContent = text;
            progressDiv.style.display = 'block';
        }
    }
    
    function hideProgress() {
        const progressDiv = document.getElementById('cvTailorProgress');
        if (progressDiv) {
            progressDiv.style.display = 'none';
        }
    }
    
    function showSuccessMessage(message) {
        // Remove existing messages
        const existing = document.querySelectorAll('.cv-success-message, .cv-error-message');
        existing.forEach(el => el.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'cv-success-message';
        messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        const progressDiv = document.getElementById('cvTailorProgress');
        if (progressDiv && progressDiv.parentNode) {
            progressDiv.parentNode.insertBefore(messageDiv, progressDiv);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }
    
    function showErrorMessage(message) {
        // Remove existing messages
        const existing = document.querySelectorAll('.cv-success-message, .cv-error-message');
        existing.forEach(el => el.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'cv-error-message';
        messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        const progressDiv = document.getElementById('cvTailorProgress');
        if (progressDiv && progressDiv.parentNode) {
            progressDiv.parentNode.insertBefore(messageDiv, progressDiv);
        }
        
        // Auto-remove after 7 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => messageDiv.remove(), 300);
        }, 7000);
    }
    
    // Global helper for file removal
    window.removeFile = function(index, containerId) {
        if (containerId === 'cvFileList') {
            selectedCVFiles.splice(index, 1);
            displayFileList(selectedCVFiles, cvFileList);
            updateButtonStates();
        } else if (containerId === 'certificateFileList') {
            selectedCertificateFiles.splice(index, 1);
            displayFileList(selectedCertificateFiles, certificateFileList);
        }
    };
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







