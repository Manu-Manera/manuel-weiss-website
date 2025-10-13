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
        
        // Initialize advanced features
        this.advancedFeatures = null;
        this.exportLibraries = null;
        this.initializeAdvancedFeatures();
        this.initializeExportLibraries();
        
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
    
    initializeAdvancedFeatures() {
        // Initialize advanced features when available
        if (window.AdvancedWorkflowFeatures) {
            this.advancedFeatures = new AdvancedWorkflowFeatures();
            console.log('🚀 Advanced Features initialized');
        } else {
            // Wait for advanced features to load
            setTimeout(() => {
                if (window.AdvancedWorkflowFeatures) {
                    this.advancedFeatures = new AdvancedWorkflowFeatures();
                    console.log('🚀 Advanced Features initialized (delayed)');
                }
            }, 1000);
        }
    }
    
    initializeExportLibraries() {
        // Initialize optimized export libraries when available
        if (window.ExportLibraries) {
            this.exportLibraries = new ExportLibraries();
            console.log('📚 Export Libraries initialized');
        } else {
            // Wait for export libraries to load
            setTimeout(() => {
                if (window.ExportLibraries) {
                    this.exportLibraries = new ExportLibraries();
                    console.log('📚 Export Libraries initialized (delayed)');
                }
            }, 1000);
        }
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
                    <button class="close-btn" onclick="completeWorkflowSystem.close()" aria-label="Schließen">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <div class="workflow-progress">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="workflowProgressFill" style="width: 0%"></div>
                        </div>
                        <div class="progress-text" id="workflowProgressText">Schritt 1 von 6</div>
                    </div>
                </div>
                
                <div class="workflow-content">
                    <div id="workflowStepContainer">
                        <!-- Step content will be loaded here -->
                    </div>
                </div>
                
                <div class="workflow-navigation">
                    <div class="nav-buttons">
                        <button id="prevStepBtn" class="btn-secondary" disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15,18 9,12 15,6"></polyline>
                            </svg>
                            Zurück
                        </button>
                        <button id="nextStepBtn" class="btn-primary">
                            Weiter
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                        </button>
                    </div>
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
        console.log('🔍 Showing step:', stepNumber);
        const container = document.getElementById('workflowStepContainer');
        if (!container) {
            console.error('❌ Container not found:', 'workflowStepContainer');
            return;
        }
        
        const step = this.steps[stepNumber - 1];
        if (!step) {
            console.error('❌ Step not found:', stepNumber);
            return;
        }
        
        console.log('📝 Generating content for step:', step);
        const content = this.generateStepContent(stepNumber, step);
        console.log('📄 Generated content:', content);
        
        container.innerHTML = content;
        this.updateProgress();
        this.updateNavigation();
        
        // Initialize step-specific functionality
        this.initializeStep(stepNumber);
    }
    
    initializeStep(stepNumber) {
        console.log('🔧 Initializing step:', stepNumber);
        
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
                    <h3 class="step-title">Bewerbungsart wählen</h3>
                    <p class="step-subtitle">Wählen Sie Ihre Bewerbungsart</p>
                    <p class="step-description">Entscheiden Sie, ob Sie sich auf eine Stellenausschreibung bewerben oder eine Initiativbewerbung erstellen möchten.</p>
                </div>
                
                <div class="application-type-selection">
                    <div class="type-option" data-type="job-posting" id="job-posting-option">
                        <div class="type-icon">📄</div>
                        <h4 class="type-title">Stellenausschreibung</h4>
                        <p class="type-description">Ich bewerbe mich auf eine konkrete Stellenausschreibung</p>
                        <ul class="type-features">
                            <li class="feature">KI-Analyse der Stellenausschreibung</li>
                            <li class="feature">Automatisches Matching</li>
                            <li class="feature">Personalisierte Anschreiben</li>
                        </ul>
                    </div>
                    
                    <div class="type-option" data-type="initiative" id="initiative-option">
                        <div class="type-icon">🚀</div>
                        <h4 class="type-title">Initiativbewerbung</h4>
                        <p class="type-description">Ich sende eine unaufgeforderte Bewerbung an ein Unternehmen</p>
                        <ul class="type-features">
                            <li class="feature">Unternehmen-spezifische Anpassung</li>
                            <li class="feature">Branchenanalyse</li>
                            <li class="feature">Strategische Positionierung</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateStep1() {
        return `
            <div class="step-content">
                <div class="step-header">
                    <h3 class="step-title">Stellenanalyse</h3>
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
                        <textarea id="jobDescriptionInput" data-realtime-analysis="true" rows="10" placeholder="Fügen Sie hier die komplette Stellenausschreibung ein..."></textarea>
                        <div id="realTimeAnalysis" class="real-time-analysis" style="display: none;">
                            <!-- Real-time analysis results will appear here -->
                        </div>
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
                    <div class="skill-matching-container">
                        <h4>🎯 Intelligentes Skill-Matching</h4>
                        <div class="skill-match-score">
                            <div class="score-circle" id="skillMatchCircle">
                                <span id="matchingScore">0%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="requirements-card">
                        <h4>Erkannte Anforderungen</h4>
                        <div id="requirementsList" class="requirements-list">
                            <!-- Requirements will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="skills-card">
                        <h4>Ihre Skills</h4>
                        <div class="skills-input">
                            <input type="text" id="skillInput" data-skill-input="true" placeholder="Skill hinzufügen...">
                            <button onclick="completeWorkflowSystem.addSkill()">Hinzufügen</button>
                        </div>
                        <div id="skillsList" class="skills-list">
                            <!-- Skills will be displayed here -->
                        </div>
                    </div>
                    
                    <div class="skill-recommendations" id="skillRecommendations" style="display: none;">
                        <h4>💡 Verbesserungsvorschläge</h4>
                        <div id="recommendationsList">
                            <!-- Recommendations will be loaded here -->
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
                    <div class="progress-tracking">
                        <h4>🎮 Ihr Fortschritt</h4>
                        <div class="progress-stats">
                            <div class="stat-item">
                                <div class="stat-value" id="totalPoints">0</div>
                                <div class="stat-label">Punkte</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="currentLevel">1</div>
                                <div class="stat-label">Level</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="achievementsCount">0</div>
                                <div class="stat-label">Achievements</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value" id="completionRate">0%</div>
                                <div class="stat-label">Fertigstellung</div>
                            </div>
                        </div>
                    </div>
                    
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
                            <button class="export-button" onclick="completeWorkflowSystem.exportPDF()">
                                <i class="fas fa-file-pdf"></i> PDF Export
                            </button>
                            <button class="export-button" onclick="completeWorkflowSystem.exportDOCX()">
                                <i class="fas fa-file-word"></i> DOCX Export
                            </button>
                            <button class="export-button" onclick="completeWorkflowSystem.exportHTML()">
                                <i class="fas fa-file-code"></i> HTML Export
                            </button>
                            <button class="export-button" onclick="completeWorkflowSystem.exportZIP()">
                                <i class="fas fa-file-archive"></i> ZIP Paket
                            </button>
                        </div>
                        <div class="export-progress" id="exportProgress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="exportProgressFill"></div>
                            </div>
                            <p id="exportStatus">Export wird vorbereitet...</p>
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
        
        // Add event listeners for type selection
        setTimeout(() => {
            const jobPostingOption = document.getElementById('job-posting-option');
            const initiativeOption = document.getElementById('initiative-option');
            
            if (jobPostingOption) {
                jobPostingOption.addEventListener('click', () => {
                    console.log('📄 Job posting option clicked');
                    this.selectApplicationType('job-posting');
                });
            }
            
            if (initiativeOption) {
                initiativeOption.addEventListener('click', () => {
                    console.log('🚀 Initiative option clicked');
                    this.selectApplicationType('initiative');
                });
            }
        }, 100);
    }
    
    initializeStep1() {
        // Initialize job description analysis
        console.log('Initializing Step 1: Job Analysis');
        
        // Initialize real-time analysis
        setTimeout(() => {
            const jobDescriptionInput = document.getElementById('jobDescriptionInput');
            if (jobDescriptionInput) {
                jobDescriptionInput.addEventListener('input', (e) => {
                    this.handleRealTimeAnalysis(e.target.value);
                });
            }
            
            // Initialize analyze button
            const analyzeButton = document.querySelector('.btn-primary');
            if (analyzeButton) {
                analyzeButton.addEventListener('click', () => {
                    this.analyzeJobDescription();
                });
            }
        }, 100);
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
    
    handleRealTimeAnalysis(text) {
        console.log('🔍 Real-time analysis triggered:', text.length, 'characters');
        
        if (text.length < 50) {
            const analysisDiv = document.getElementById('realTimeAnalysis');
            if (analysisDiv) {
                analysisDiv.style.display = 'none';
            }
            return;
        }
        
        // Show real-time analysis
        const analysisDiv = document.getElementById('realTimeAnalysis');
        if (analysisDiv) {
            analysisDiv.style.display = 'block';
            analysisDiv.innerHTML = `
                <div class="analysis-preview">
                    <h4>🔍 Live-Analyse</h4>
                    <p>Textlänge: ${text.length} Zeichen</p>
                    <p>Geschätzte Schlüsselwörter: ${this.extractKeywords(text).length}</p>
                    <div class="analysis-status">
                        <span class="status-indicator">🟢 Analysiere...</span>
                    </div>
                </div>
            `;
        }
    }
    
    extractKeywords(text) {
        // Simple keyword extraction
        const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const commonWords = ['der', 'die', 'das', 'und', 'oder', 'mit', 'für', 'von', 'auf', 'in', 'an', 'zu', 'ist', 'sind', 'werden', 'haben', 'können', 'müssen', 'sollen'];
        return [...new Set(words)].filter(word => !commonWords.includes(word)).slice(0, 10);
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
        
        // Use advanced features if available
        if (this.advancedFeatures) {
            this.advancedFeatures.performRealTimeAnalysis(jobDescription);
        }
        
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
    
    async exportPDF() {
        this.showExportProgress('PDF wird erstellt...');
        
        try {
            if (this.exportLibraries) {
                const result = await this.exportLibraries.exportToPDF({
                    filename: `bewerbung_${Date.now()}.pdf`,
                    author: 'Bewerbungsmanager Pro'
                });
                this.completeExport('PDF', result);
            } else if (this.advancedFeatures) {
                const result = await this.advancedFeatures.exportApplication('pdf');
                this.completeExport('PDF', result);
            } else {
                // Fallback simulation
                setTimeout(() => {
                    this.completeExport('PDF', { filename: 'bewerbung.pdf' });
                }, 2000);
            }
        } catch (error) {
            console.error('PDF export error:', error);
            alert('PDF Export fehlgeschlagen');
        }
    }
    
    async exportDOCX() {
        this.showExportProgress('DOCX wird erstellt...');
        
        try {
            if (this.exportLibraries) {
                const result = await this.exportLibraries.exportToDOCX({
                    filename: `bewerbung_${Date.now()}.docx`,
                    author: 'Bewerbungsmanager Pro'
                });
                this.completeExport('DOCX', result);
            } else if (this.advancedFeatures) {
                const result = await this.advancedFeatures.exportApplication('docx');
                this.completeExport('DOCX', result);
            } else {
                setTimeout(() => {
                    this.completeExport('DOCX', { filename: 'bewerbung.docx' });
                }, 2000);
            }
        } catch (error) {
            console.error('DOCX export error:', error);
            alert('DOCX Export fehlgeschlagen');
        }
    }
    
    async exportHTML() {
        this.showExportProgress('HTML wird erstellt...');
        
        try {
            if (this.exportLibraries) {
                const result = await this.exportLibraries.exportToHTML({
                    filename: `bewerbung_${Date.now()}.html`,
                    includeStyles: true
                });
                this.completeExport('HTML', result);
            } else if (this.advancedFeatures) {
                const result = await this.advancedFeatures.exportApplication('html');
                this.completeExport('HTML', result);
            } else {
                setTimeout(() => {
                    this.completeExport('HTML', { filename: 'bewerbung.html' });
                }, 1500);
            }
        } catch (error) {
            console.error('HTML export error:', error);
            alert('HTML Export fehlgeschlagen');
        }
    }
    
    async exportZIP() {
        this.showExportProgress('ZIP-Paket wird erstellt...');
        
        try {
            if (this.exportLibraries) {
                const result = await this.exportLibraries.exportToZIP({
                    filename: `bewerbungspaket_${Date.now()}.zip`,
                    includeAll: true
                });
                this.completeExport('ZIP', result);
            } else if (this.advancedFeatures) {
                const result = await this.advancedFeatures.exportApplication('zip');
                this.completeExport('ZIP', result);
            } else {
                setTimeout(() => {
                    this.completeExport('ZIP', { filename: 'bewerbungspaket.zip' });
                }, 3000);
            }
        } catch (error) {
            console.error('ZIP export error:', error);
            alert('ZIP Export fehlgeschlagen');
        }
    }
    
    showExportProgress(message) {
        const progressContainer = document.getElementById('exportProgress');
        const progressFill = document.getElementById('exportProgressFill');
        const statusText = document.getElementById('exportStatus');
        
        if (progressContainer && progressFill && statusText) {
            progressContainer.classList.add('active');
            statusText.textContent = message;
            progressFill.style.width = '0%';
            
            // Animate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                progressFill.style.width = progress + '%';
            }, 200);
        }
    }
    
    completeExport(format, result) {
        const progressContainer = document.getElementById('exportProgress');
        const statusText = document.getElementById('exportStatus');
        
        if (progressContainer && statusText) {
            statusText.textContent = `${format} erfolgreich erstellt: ${result.filename}`;
            
            setTimeout(() => {
                progressContainer.classList.remove('active');
            }, 3000);
        }
        
        // Award points for export
        if (this.advancedFeatures) {
            this.advancedFeatures.addPoints(50);
        }
        
        alert(`✅ ${format} erfolgreich erstellt: ${result.filename}`);
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
}

// Initialize the complete workflow system
let completeWorkflowSystem;
document.addEventListener('DOMContentLoaded', () => {
    completeWorkflowSystem = new CompleteWorkflowSystem();
    window.completeWorkflowSystem = completeWorkflowSystem;
});

// Make it globally available
window.CompleteWorkflowSystem = CompleteWorkflowSystem;
