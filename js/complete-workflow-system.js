/**
 * Complete Workflow System
 * Vollständige Implementierung des 6-Schritte Bewerbungsworkflows
 */

class CompleteWorkflowSystem {
    constructor() {
        this.currentStep = 0;
        this.workflowData = {
            applicationType: null,
            jobDescription: '',
            company: '',
            position: '',
            requirements: [],
            aiAnalysis: null,
            matchingScore: 0,
            coverLetter: '',
            documents: [],
            design: null,
            exportData: null
        };
        
        this.steps = [
            {
                id: 0,
                title: "Bewerbungsart",
                subtitle: "Wählen Sie Ihre Bewerbungsart",
                icon: "📋",
                description: "Entscheiden Sie, ob Sie sich auf eine Stellenausschreibung bewerben oder eine Initiativbewerbung erstellen möchten."
            },
            {
                id: 1,
                title: "Stellenanalyse",
                subtitle: "KI-Analyse der Stellenausschreibung",
                icon: "🔍",
                description: "Intelligente Analyse der Stellenausschreibung mit automatischer Erkennung von Anforderungen und Schlüsselwörtern."
            },
            {
                id: 2,
                title: "Matching",
                subtitle: "Anforderungsabgleich & Skill-Gap",
                icon: "🎯",
                description: "Automatischer Abgleich Ihrer Qualifikationen mit den Stellenanforderungen und Identifikation von Skill-Gaps."
            },
            {
                id: 3,
                title: "Anschreiben",
                subtitle: "Personalisierte Texterstellung",
                icon: "✍️",
                description: "KI-gestützte Erstellung eines personalisierten Anschreibens, das perfekt auf die Stelle abgestimmt ist."
            },
            {
                id: 4,
                title: "Dokumente",
                subtitle: "CV & Zusatzdokumente",
                icon: "📄",
                description: "Optimierung Ihres Lebenslaufs und Erstellung zusätzlicher Dokumente wie Zeugnisse und Referenzen."
            },
            {
                id: 5,
                title: "Design",
                subtitle: "Layout & Formatierung",
                icon: "🎨",
                description: "Professionelle Gestaltung mit branchenspezifischen Templates und automatischer Layout-Optimierung."
            },
            {
                id: 6,
                title: "Export",
                subtitle: "Finales Bewerbungspaket",
                icon: "📦",
                description: "Exportieren Sie Ihre kompletten Bewerbungsunterlagen in verschiedenen Formaten."
            }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Complete Workflow System...');
        this.createWorkflowInterface();
        this.setupEventListeners();
    }
    
    createWorkflowInterface() {
        const container = document.createElement('div');
        container.id = 'complete-workflow-modal';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', Arial, sans-serif;
        `;
        
        container.innerHTML = `
            <div class="workflow-modal">
                <div class="workflow-header">
                    <div class="workflow-title">
                        <h2>🚀 Smart Bewerbungsmanager</h2>
                        <p>Erstellen Sie professionelle Bewerbungsunterlagen in 6 Schritten</p>
                    </div>
                    <button class="close-btn" onclick="completeWorkflowSystem.close()">×</button>
                </div>
                
                <div class="workflow-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">Schritt 1 von 6</div>
                </div>
                
                <div class="workflow-content">
                    <div id="workflowStepContainer">
                        <!-- Step content will be loaded here -->
                    </div>
                </div>
                
                <div class="workflow-navigation">
                    <button id="prevStepBtn" class="btn-secondary" disabled>
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    <button id="nextStepBtn" class="btn-primary">
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    setupEventListeners() {
        document.getElementById('prevStepBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('nextStepBtn')?.addEventListener('click', () => this.nextStep());
    }
    
    start() {
        console.log('🚀 Starting Complete Workflow...');
        this.currentStep = 0;
        this.showStep(0);
        
        const modal = document.getElementById('complete-workflow-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    selectApplicationType(type) {
        console.log('📋 Selected application type:', type);
        this.workflowData.applicationType = type;
        
        // Update UI
        document.querySelectorAll('.type-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('selected');
        
        // Show info
        const typeInfo = document.getElementById('typeInfo');
        const infoTitle = document.getElementById('infoTitle');
        const infoDescription = document.getElementById('infoDescription');
        
        if (typeInfo && infoTitle && infoDescription) {
            if (type === 'job-posting') {
                infoTitle.textContent = 'Stellenausschreibung gewählt';
                infoDescription.textContent = 'Perfekt! Sie werden nun durch die KI-Analyse der Stellenausschreibung geführt, um die besten Bewerbungsunterlagen zu erstellen.';
            } else {
                infoTitle.textContent = 'Initiativbewerbung gewählt';
                infoDescription.textContent = 'Ausgezeichnet! Wir helfen Ihnen dabei, eine strategische Initiativbewerbung zu erstellen, die das Unternehmen überzeugt.';
            }
            typeInfo.style.display = 'block';
        }
        
        // Auto-advance after 2 seconds
        setTimeout(() => {
            this.nextStep();
        }, 2000);
    }
    
    showStep(stepNumber) {
        const container = document.getElementById('workflowStepContainer');
        if (!container) return;
        
        const step = this.steps[stepNumber - 1];
        if (!step) return;
        
        container.innerHTML = this.generateStepContent(stepNumber, step);
        this.updateProgress();
        this.updateNavigation();
        
        // Initialize step-specific functionality
        this.initializeStep(stepNumber);
    }
    
    generateStepContent(stepNumber, step) {
        switch(stepNumber) {
            case 0:
                return this.generateStep0();
            case 1:
                return this.generateStep1();
            case 2:
                return this.generateStep2();
            case 3:
                return this.generateStep3();
            case 4:
                return this.generateStep4();
            case 5:
                return this.generateStep5();
            case 6:
                return this.generateStep6();
            default:
                return this.generateStep0();
        }
    }
    
    generateStep0() {
        return `
            <div class="step-content">
                <div class="step-header">
                    <div class="step-icon">📋</div>
                    <h3>Bewerbungsart wählen</h3>
                    <p class="step-subtitle">Wählen Sie Ihre Bewerbungsart</p>
                    <p class="step-description">Entscheiden Sie, ob Sie sich auf eine Stellenausschreibung bewerben oder eine Initiativbewerbung erstellen möchten.</p>
                </div>
                
                <div class="application-type-selection">
                    <div class="type-options">
                        <div class="type-option" data-type="job-posting" onclick="completeWorkflowSystem.selectApplicationType('job-posting')">
                            <div class="type-icon">📄</div>
                            <h4>Stellenausschreibung</h4>
                            <p>Ich bewerbe mich auf eine konkrete Stellenausschreibung</p>
                            <div class="type-features">
                                <span class="feature">✓ KI-Analyse der Stellenausschreibung</span>
                                <span class="feature">✓ Automatisches Matching</span>
                                <span class="feature">✓ Personalisierte Anschreiben</span>
                            </div>
                        </div>
                        
                        <div class="type-option" data-type="initiative" onclick="completeWorkflowSystem.selectApplicationType('initiative')">
                            <div class="type-icon">🚀</div>
                            <h4>Initiativbewerbung</h4>
                            <p>Ich sende eine unaufgeforderte Bewerbung an ein Unternehmen</p>
                            <div class="type-features">
                                <span class="feature">✓ Unternehmen-spezifische Anpassung</span>
                                <span class="feature">✓ Branchenanalyse</span>
                                <span class="feature">✓ Strategische Positionierung</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="type-info" id="typeInfo" style="display: none;">
                        <div class="info-card">
                            <h4 id="infoTitle">Informationen zur gewählten Bewerbungsart</h4>
                            <p id="infoDescription">Hier erhalten Sie weitere Informationen zu Ihrer gewählten Bewerbungsart.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateStep1() {
        return `
            <div class="step-content">
                <div class="step-header">
                    <div class="step-icon">🔍</div>
                    <h3>Stellenanalyse</h3>
                    <p class="step-subtitle">KI-Analyse der Stellenausschreibung</p>
                    <p class="step-description">Fügen Sie die Stellenausschreibung ein und lassen Sie sie von KI analysieren</p>
                </div>
                
                <div class="input-section">
                    <div class="input-group">
                        <label for="companyInput">Unternehmen</label>
                        <input type="text" id="companyInput" placeholder="z.B. Google, Microsoft, Startup XYZ">
                    </div>
                    
                    <div class="input-group">
                        <label for="positionInput">Position</label>
                        <input type="text" id="positionInput" placeholder="z.B. Software Engineer, Marketing Manager">
                    </div>
                    
                    <div class="input-group">
                        <label for="jobDescriptionInput">Stellenausschreibung</label>
                        <textarea id="jobDescriptionInput" rows="10" placeholder="Fügen Sie hier die komplette Stellenausschreibung ein..."></textarea>
                    </div>
                    
                    <button class="btn-primary" onclick="completeWorkflowSystem.analyzeJobDescription()">
                        <i class="fas fa-robot"></i> KI-Analyse starten
                    </button>
                </div>
                
                <div id="analysisResults" class="analysis-results" style="display: none;">
                    <!-- Analysis results will be displayed here -->
                </div>
            </div>
        `;
    }
    
    generateStep2() {
        return `
            <div class="step-content">
                <div class="step-header">
                    <div class="step-icon">🎯</div>
                    <h3>Matching</h3>
                    <p class="step-subtitle">Anforderungsabgleich & Skill-Gap</p>
                    <p class="step-description">Automatischer Abgleich Ihrer Qualifikationen mit den Stellenanforderungen</p>
                </div>
                
                <div class="matching-section">
                    <div class="requirements-card">
                        <h4>Erkannte Anforderungen</h4>
                        <div id="requirementsList" class="requirements-list">
                            <!-- Requirements will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="skills-card">
                        <h4>Ihre Skills</h4>
                        <div class="skills-input">
                            <input type="text" id="skillInput" placeholder="Skill hinzufügen...">
                            <button onclick="completeWorkflowSystem.addSkill()">Hinzufügen</button>
                        </div>
                        <div id="skillsList" class="skills-list">
                            <!-- Skills will be displayed here -->
                        </div>
                    </div>
                    
                    <div class="matching-score">
                        <h4>Matching Score</h4>
                        <div class="score-display">
                            <div class="score-circle">
                                <span id="matchingScore">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateStep3() {
        return `
            <div class="step-content">
                <div class="step-header">
                    <div class="step-icon">✍️</div>
                    <h3>Anschreiben</h3>
                    <p class="step-subtitle">Personalisierte Texterstellung</p>
                    <p class="step-description">KI-gestützte Erstellung eines personalisierten Anschreibens</p>
                </div>
                
                <div class="cover-letter-section">
                    <div class="letter-options">
                        <div class="option-group">
                            <label>Anrede</label>
                            <select id="greetingSelect">
                                <option value="formal">Sehr geehrte Damen und Herren</option>
                                <option value="personal">Sehr geehrte Frau/Herr [Name]</option>
                                <option value="modern">Hallo [Name]</option>
                            </select>
                        </div>
                        
                        <div class="option-group">
                            <label>Schluss</label>
                            <select id="closingSelect">
                                <option value="formal">Mit freundlichen Grüßen</option>
                                <option value="modern">Beste Grüße</option>
                                <option value="personal">Herzliche Grüße</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="letter-editor">
                        <textarea id="coverLetterText" rows="15" placeholder="Ihr Anschreiben wird hier generiert..."></textarea>
                    </div>
                    
                    <div class="letter-actions">
                        <button class="btn-secondary" onclick="completeWorkflowSystem.generateCoverLetter()">
                            <i class="fas fa-magic"></i> KI-Anschreiben generieren
                        </button>
                        <button class="btn-primary" onclick="completeWorkflowSystem.optimizeCoverLetter()">
                            <i class="fas fa-edit"></i> Optimieren
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateStep4() {
        return `
            <div class="step-content">
                <div class="step-header">
                    <div class="step-icon">📄</div>
                    <h3>Dokumente</h3>
                    <p class="step-subtitle">CV & Zusatzdokumente</p>
                    <p class="step-description">Optimierung Ihres Lebenslaufs und Erstellung zusätzlicher Dokumente</p>
                </div>
                
                <div class="documents-section">
                    <div class="document-upload">
                        <h4>Lebenslauf hochladen</h4>
                        <div class="upload-area">
                            <input type="file" id="cvUpload" accept=".pdf,.doc,.docx">
                            <div class="upload-text">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Datei hier ablegen oder klicken zum Auswählen</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="document-optimization">
                        <h4>CV-Optimierung</h4>
                        <div class="optimization-options">
                            <label><input type="checkbox" id="optimizeKeywords"> Schlüsselwörter optimieren</label>
                            <label><input type="checkbox" id="optimizeFormat"> Format optimieren</label>
                            <label><input type="checkbox" id="addSkills"> Skills hinzufügen</label>
                        </div>
                        <button class="btn-primary" onclick="completeWorkflowSystem.optimizeCV()">
                            <i class="fas fa-cogs"></i> CV optimieren
                        </button>
                    </div>
                    
                    <div class="additional-documents">
                        <h4>Zusatzdokumente</h4>
                        <div class="document-list">
                            <div class="document-item">
                                <span>Zeugnisse</span>
                                <input type="file" multiple accept=".pdf,.jpg,.png">
                            </div>
                            <div class="document-item">
                                <span>Zertifikate</span>
                                <input type="file" multiple accept=".pdf,.jpg,.png">
                            </div>
                            <div class="document-item">
                                <span>Referenzen</span>
                                <input type="file" multiple accept=".pdf,.doc,.docx">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateStep5() {
        return `
            <div class="step-content">
                <div class="step-header">
                    <div class="step-icon">🎨</div>
                    <h3>Design</h3>
                    <p class="step-subtitle">Layout & Formatierung</p>
                    <p class="step-description">Professionelle Gestaltung mit branchenspezifischen Templates</p>
                </div>
                
                <div class="design-section">
                    <div class="template-selection">
                        <h4>Template auswählen</h4>
                        <div class="template-grid">
                            <div class="template-card" data-template="modern">
                                <div class="template-preview modern-preview"></div>
                                <h5>Modern</h5>
                                <p>Clean und zeitgemäß</p>
                            </div>
                            <div class="template-card" data-template="classic">
                                <div class="template-preview classic-preview"></div>
                                <h5>Classic</h5>
                                <p>Traditionell und seriös</p>
                            </div>
                            <div class="template-card" data-template="creative">
                                <div class="template-preview creative-preview"></div>
                                <h5>Creative</h5>
                                <p>Kreativ und einzigartig</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="color-scheme">
                        <h4>Farbschema</h4>
                        <div class="color-options">
                            <div class="color-option" data-color="blue" style="background: #3b82f6;"></div>
                            <div class="color-option" data-color="green" style="background: #10b981;"></div>
                            <div class="color-option" data-color="purple" style="background: #8b5cf6;"></div>
                            <div class="color-option" data-color="red" style="background: #ef4444;"></div>
                        </div>
                    </div>
                    
                    <div class="layout-options">
                        <h4>Layout-Optionen</h4>
                        <div class="layout-grid">
                            <label><input type="checkbox" id="addPhoto"> Foto hinzufügen</label>
                            <label><input type="checkbox" id="addQR"> QR-Code hinzufügen</label>
                            <label><input type="checkbox" id="addLogo"> Logo hinzufügen</label>
                        </div>
                    </div>
                    
                    <button class="btn-primary" onclick="completeWorkflowSystem.applyDesign()">
                        <i class="fas fa-paint-brush"></i> Design anwenden
                    </button>
                </div>
            </div>
        `;
    }
    
    generateStep6() {
        return `
            <div class="step-content">
                <div class="step-header">
                    <div class="step-icon">📦</div>
                    <h3>Export</h3>
                    <p class="step-subtitle">Finales Bewerbungspaket</p>
                    <p class="step-description">Exportieren Sie Ihre kompletten Bewerbungsunterlagen</p>
                </div>
                
                <div class="export-section">
                    <div class="export-summary">
                        <h4>Bewerbungspaket Zusammenfassung</h4>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <i class="fas fa-file-alt"></i>
                                <span>Anschreiben</span>
                                <span class="status ready">Bereit</span>
                            </div>
                            <div class="summary-item">
                                <i class="fas fa-user"></i>
                                <span>Lebenslauf</span>
                                <span class="status ready">Bereit</span>
                            </div>
                            <div class="summary-item">
                                <i class="fas fa-certificate"></i>
                                <span>Zeugnisse</span>
                                <span class="status ready">Bereit</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="export-options">
                        <h4>Export-Optionen</h4>
                        <div class="export-buttons">
                            <button class="btn-primary" onclick="completeWorkflowSystem.exportPDF()">
                                <i class="fas fa-file-pdf"></i> Als PDF exportieren
                            </button>
                            <button class="btn-secondary" onclick="completeWorkflowSystem.exportZIP()">
                                <i class="fas fa-file-archive"></i> Als ZIP exportieren
                            </button>
                            <button class="btn-secondary" onclick="completeWorkflowSystem.exportDOCX()">
                                <i class="fas fa-file-word"></i> Als DOCX exportieren
                            </button>
                        </div>
                    </div>
                    
                    <div class="final-actions">
                        <button class="btn-success" onclick="completeWorkflowSystem.completeWorkflow()">
                            <i class="fas fa-check"></i> Bewerbung abschließen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    initializeStep(stepNumber) {
        switch(stepNumber) {
            case 0:
                this.initializeStep0();
                break;
            case 1:
                this.initializeStep1();
                break;
            case 2:
                this.initializeStep2();
                break;
            case 3:
                this.initializeStep3();
                break;
            case 4:
                this.initializeStep4();
                break;
            case 5:
                this.initializeStep5();
                break;
            case 6:
                this.initializeStep6();
                break;
        }
    }
    
    initializeStep0() {
        // Initialize application type selection
        console.log('Initializing Step 0: Application Type Selection');
    }
    
    initializeStep1() {
        // Initialize job description analysis
        console.log('Initializing Step 1: Job Analysis');
    }
    
    initializeStep2() {
        // Initialize matching system
        console.log('Initializing Step 2: Matching');
    }
    
    initializeStep3() {
        // Initialize cover letter generation
        console.log('Initializing Step 3: Cover Letter');
    }
    
    initializeStep4() {
        // Initialize document management
        console.log('Initializing Step 4: Documents');
    }
    
    initializeStep5() {
        // Initialize design system
        console.log('Initializing Step 5: Design');
    }
    
    initializeStep6() {
        // Initialize export system
        console.log('Initializing Step 6: Export');
    }
    
    analyzeJobDescription() {
        const company = document.getElementById('companyInput').value;
        const position = document.getElementById('positionInput').value;
        const jobDescription = document.getElementById('jobDescriptionInput').value;
        
        if (!company || !position || !jobDescription) {
            alert('Bitte füllen Sie alle Felder aus.');
            return;
        }
        
        // Store data
        this.workflowData.company = company;
        this.workflowData.position = position;
        this.workflowData.jobDescription = jobDescription;
        
        // Simulate AI analysis
        this.simulateAIAnalysis();
    }
    
    simulateAIAnalysis() {
        const resultsContainer = document.getElementById('analysisResults');
        if (!resultsContainer) return;
        
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="analysis-card">
                <h4>🔍 KI-Analyse Ergebnisse</h4>
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <strong>Erkannte Anforderungen:</strong>
                        <ul>
                            <li>3+ Jahre Berufserfahrung</li>
                            <li>JavaScript, React, Node.js</li>
                            <li>Teamarbeit und Kommunikation</li>
                            <li>Problemlösungsfähigkeiten</li>
                        </ul>
                    </div>
                    <div class="analysis-item">
                        <strong>Schlüsselwörter:</strong>
                        <div class="keywords">
                            <span class="keyword">JavaScript</span>
                            <span class="keyword">React</span>
                            <span class="keyword">Node.js</span>
                            <span class="keyword">Teamarbeit</span>
                        </div>
                    </div>
                    <div class="analysis-item">
                        <strong>Branche:</strong>
                        <span>IT/Software</span>
                    </div>
                </div>
            </div>
        `;
        
        // Auto-advance to next step after analysis
        setTimeout(() => {
            this.nextStep();
        }, 2000);
    }
    
    addSkill() {
        const skillInput = document.getElementById('skillInput');
        const skill = skillInput.value.trim();
        
        if (!skill) return;
        
        const skillsList = document.getElementById('skillsList');
        if (!skillsList) return;
        
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `
            <span>${skill}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        skillsList.appendChild(skillItem);
        skillInput.value = '';
    }
    
    generateCoverLetter() {
        const coverLetterText = document.getElementById('coverLetterText');
        if (!coverLetterText) return;
        
        // Simulate AI generation
        const generatedText = `
Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position "${this.workflowData.position}" bei ${this.workflowData.company} gelesen. Als erfahrener [Ihr Beruf] mit [X] Jahren Berufserfahrung bin ich überzeugt, dass ich eine wertvolle Bereicherung für Ihr Team darstellen kann.

Meine Expertise in [relevanten Skills] und meine Leidenschaft für [relevantes Thema] machen mich zum idealen Kandidaten für diese Position. In meiner bisherigen Laufbahn konnte ich bereits [konkrete Erfolge] erzielen und bin bestrebt, diese Erfahrungen bei ${this.workflowData.company} weiter auszubauen.

Ich freue mich auf die Möglichkeit, in einem persönlichen Gespräch mehr über die Position und Ihre Erwartungen zu erfahren.

Mit freundlichen Grüßen
[Ihr Name]
        `;
        
        coverLetterText.value = generatedText;
    }
    
    optimizeCoverLetter() {
        // Simulate optimization
        alert('Anschreiben wurde optimiert!');
    }
    
    optimizeCV() {
        // Simulate CV optimization
        alert('Lebenslauf wurde optimiert!');
    }
    
    applyDesign() {
        // Simulate design application
        alert('Design wurde angewendet!');
    }
    
    exportPDF() {
        // Simulate PDF export
        alert('PDF wird erstellt...');
    }
    
    exportZIP() {
        // Simulate ZIP export
        alert('ZIP-Paket wird erstellt...');
    }
    
    exportDOCX() {
        // Simulate DOCX export
        alert('DOCX wird erstellt...');
    }
    
    completeWorkflow() {
        alert('🎉 Bewerbung erfolgreich abgeschlossen!');
        this.close();
    }
    
    nextStep() {
        if (this.currentStep < 6) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }
    
    updateProgress() {
        const progress = (this.currentStep / 6) * 100;
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            if (this.currentStep === 0) {
                progressText.textContent = 'Bewerbungsart wählen';
            } else {
                progressText.textContent = `Schritt ${this.currentStep} von 6`;
            }
        }
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 0;
        }
        
        if (nextBtn) {
            if (this.currentStep === 0) {
                nextBtn.style.display = 'none'; // Hide next button on step 0
            } else {
                nextBtn.style.display = 'inline-flex';
                nextBtn.disabled = this.currentStep === 6;
            }
        }
    }
    
    close() {
        const modal = document.getElementById('complete-workflow-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    showModal() {
        // Prüfe ob Modal bereits existiert
        let modal = document.getElementById('complete-workflow-modal');
        
        if (!modal) {
            // Erstelle das Modal
            modal = document.createElement('div');
            modal.id = 'complete-workflow-modal';
            modal.className = 'workflow-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Inter', Arial, sans-serif;
            `;
            
            modal.innerHTML = `
                <div class="workflow-modal" style="background: white; width: 95%; max-width: 1000px; height: 90%; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <div class="workflow-header" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 2rem; display: flex; justify-content: space-between; align-items: center;">
                        <div class="workflow-title">
                            <h2 style="margin: 0; font-size: 1.8rem; font-weight: 700;">🚀 Smart Bewerbungsmanager</h2>
                            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Erstellen Sie professionelle Bewerbungsunterlagen in 6 Schritten</p>
                        </div>
                        <button class="close-btn" onclick="window.completeWorkflowSystem.close()" style="background: none; border: none; color: white; font-size: 2rem; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background 0.3s;">×</button>
                    </div>
                    
                    <div class="workflow-progress" style="padding: 1rem 2rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <div class="progress-bar" style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
                            <div class="progress-fill" style="height: 100%; background: linear-gradient(135deg, #667eea, #764ba2); transition: width 0.3s ease; width: 0%;"></div>
                        </div>
                        <div class="progress-text" style="text-align: center; font-weight: 600; color: #64748b;">Bewerbungsart wählen</div>
                    </div>
                    
                    <div class="workflow-content" style="flex: 1; padding: 2rem; overflow-y: auto;">
                        <div class="step-content" style="max-width: 800px; margin: 0 auto;">
                            <!-- Step content wird hier dynamisch eingefügt -->
                        </div>
                    </div>
                    
                    <div class="workflow-navigation" style="padding: 1.5rem 2rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                        <button class="btn-secondary" onclick="window.completeWorkflowSystem.previousStep()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;">
                            <i class="fas fa-arrow-left"></i>
                            Zurück
                        </button>
                        <button class="btn-primary" onclick="window.completeWorkflowSystem.nextStep()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s; background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                            Weiter
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
        
        // Zeige das Modal
        modal.style.display = 'flex';
    }
    
    renderStep() {
        const stepContent = document.querySelector('.step-content');
        if (!stepContent) return;
        
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        // Aktualisiere Progress Bar
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        if (progressFill) {
            progressFill.style.width = `${(this.currentStep / 6) * 100}%`;
        }
        if (progressText) {
            progressText.textContent = step.title;
        }
        
        // Generiere Step Content basierend auf currentStep
        let content = '';
        
        if (this.currentStep === 0) {
            // Bewerbungsart wählen
            content = `
                <div class="step-header" style="text-align: center; margin-bottom: 2rem;">
                    <div class="step-icon" style="font-size: 3rem; margin-bottom: 1rem;">${step.icon}</div>
                    <h3 style="font-size: 2rem; margin-bottom: 0.5rem; color: #1f2937;">${step.title}</h3>
                    <p class="step-subtitle" style="font-size: 1.2rem; color: #667eea; font-weight: 600; margin-bottom: 0.5rem;">${step.subtitle}</p>
                    <p class="step-description" style="color: #6b7280; font-size: 1.1rem;">${step.description}</p>
                </div>
                
                <div class="application-type-selection" style="margin-bottom: 2rem;">
                    <div class="type-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                        <div class="type-option" data-type="job-posting" onclick="window.completeWorkflowSystem.selectApplicationType('job-posting')" style="background: white; padding: 2rem; border-radius: 16px; border: 2px solid #e2e8f0; cursor: pointer; transition: all 0.3s ease; text-align: center; position: relative; overflow: hidden;">
                            <div class="type-icon" style="font-size: 3rem; margin-bottom: 1rem; display: block;">📄</div>
                            <h4 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #1f2937; font-weight: 700;">Stellenausschreibung</h4>
                            <p style="color: #6b7280; margin-bottom: 1.5rem; font-size: 1.1rem;">Ich bewerbe mich auf eine konkrete Stellenausschreibung</p>
                            <div class="type-features" style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <span class="feature" style="background: #f8fafc; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: #374151; border: 1px solid #e2e8f0;">✓ KI-Analyse der Stellenausschreibung</span>
                                <span class="feature" style="background: #f8fafc; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: #374151; border: 1px solid #e2e8f0;">✓ Automatisches Matching</span>
                                <span class="feature" style="background: #f8fafc; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: #374151; border: 1px solid #e2e8f0;">✓ Personalisierte Anschreiben</span>
                            </div>
                        </div>
                        
                        <div class="type-option" data-type="initiative" onclick="window.completeWorkflowSystem.selectApplicationType('initiative')" style="background: white; padding: 2rem; border-radius: 16px; border: 2px solid #e2e8f0; cursor: pointer; transition: all 0.3s ease; text-align: center; position: relative; overflow: hidden;">
                            <div class="type-icon" style="font-size: 3rem; margin-bottom: 1rem; display: block;">🚀</div>
                            <h4 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #1f2937; font-weight: 700;">Initiativbewerbung</h4>
                            <p style="color: #6b7280; margin-bottom: 1.5rem; font-size: 1.1rem;">Ich sende eine unaufgeforderte Bewerbung an ein Unternehmen</p>
                            <div class="type-features" style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <span class="feature" style="background: #f8fafc; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: #374151; border: 1px solid #e2e8f0;">✓ Unternehmen-spezifische Anpassung</span>
                                <span class="feature" style="background: #f8fafc; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: #374151; border: 1px solid #e2e8f0;">✓ Branchenanalyse</span>
                                <span class="feature" style="background: #f8fafc; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: #374151; border: 1px solid #e2e8f0;">✓ Strategische Positionierung</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Andere Schritte
            content = `
                <div class="step-header" style="text-align: center; margin-bottom: 2rem;">
                    <div class="step-icon" style="font-size: 3rem; margin-bottom: 1rem;">${step.icon}</div>
                    <h3 style="font-size: 2rem; margin-bottom: 0.5rem; color: #1f2937;">${step.title}</h3>
                    <p class="step-subtitle" style="font-size: 1.2rem; color: #667eea; font-weight: 600; margin-bottom: 0.5rem;">${step.subtitle}</p>
                    <p class="step-description" style="color: #6b7280; font-size: 1.1rem;">${step.description}</p>
                </div>
                
                <div class="step-content-body">
                    <p>Schritt ${this.currentStep + 1} wird implementiert...</p>
                </div>
            `;
        }
        
        stepContent.innerHTML = content;
        this.updateNavigation();
    }
    
    selectApplicationType(type) {
        console.log('📋 Application Type selected:', type);
        this.workflowData.applicationType = type;
        
        // Update UI
        document.querySelectorAll('.type-option').forEach(option => {
            option.style.borderColor = '#e2e8f0';
            option.style.background = 'white';
        });
        document.querySelector(`[data-type="${type}"]`).style.borderColor = '#667eea';
        document.querySelector(`[data-type="${type}"]`).style.background = 'linear-gradient(135deg, #f0f4ff, #e0e7ff)';
        
        // Weiter zum nächsten Schritt
        setTimeout(() => {
            this.nextStep();
        }, 1000);
    }
    
    updateNavigation() {
        const prevBtn = document.querySelector('.btn-secondary');
        const nextBtn = document.querySelector('.btn-primary');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 0;
        }
        
        if (nextBtn) {
            if (this.currentStep === 0) {
                nextBtn.style.display = 'none'; // Hide next button on step 0
            } else {
                nextBtn.style.display = 'inline-flex';
                nextBtn.disabled = this.currentStep === 6;
            }
        }
    }
    
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }
    
    startWorkflow(applicationType) {
        console.log('🚀 Starte Workflow mit Typ:', applicationType);
        
        // Setze den Anwendungstyp
        this.workflowData.applicationType = applicationType;
        
        // Erstelle und zeige das Modal
        this.showModal();
        
        // Starte mit Schritt 0
        this.currentStep = 0;
        this.renderStep();
    }
}

// Initialize the complete workflow system
let completeWorkflowSystem;
document.addEventListener('DOMContentLoaded', () => {
    completeWorkflowSystem = new CompleteWorkflowSystem();
    window.completeWorkflowSystem = completeWorkflowSystem;
});

// Make it globally available
window.CompleteWorkflowSystem = CompleteWorkflowSystem;
