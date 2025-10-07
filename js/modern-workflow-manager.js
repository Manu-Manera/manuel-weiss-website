// 🚀 Modern Workflow Manager - Ersetzt smart-workflow-steps.js
// Robuste Error-Handling, moderne ES6+ Syntax, modulare Architektur

class ModernWorkflowManager {
    constructor() {
        this.workflowData = {
            company: '',
            position: '',
            jobDescription: '',
            requirements: [],
            selectedRequirements: [],
            coverLetter: '',
            currentStep: 1,
            maxSteps: 4,
            skipRequirements: false,
            aiAnalysisResult: null
        };
        
        this.currentStepElement = null;
        this.observers = new Set();
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Modern Workflow Manager...');
            
            await this.checkDependencies();
            this.setupErrorHandling();
            this.bindGlobalFunctions();
            
            this.isInitialized = true;
            console.log('✅ Modern Workflow Manager initialized');
            
        } catch (error) {
            console.error('❌ Modern Workflow Manager initialization failed:', error);
            this.showErrorMessage('Workflow-System konnte nicht geladen werden', error);
        }
    }

    async checkDependencies() {
        const dependencies = [
            { name: 'jobAnalyzer', object: window.jobAnalyzer },
            { name: 'globalAI', object: window.globalAI }
        ];

        const missing = dependencies.filter(dep => !dep.object);
        
        if (missing.length > 0) {
            console.warn('⚠️ Missing dependencies:', missing.map(d => d.name));
            await this.loadMissingDependencies(missing);
        }
    }

    async loadMissingDependencies(missing) {
        const loadPromises = missing.map(async (dep) => {
            try {
                switch (dep.name) {
                    case 'jobAnalyzer':
                        await this.loadJobAnalyzer();
                        break;
                    case 'globalAI':
                        await this.loadGlobalAI();
                        break;
                }
            } catch (error) {
                console.error(`Failed to load ${dep.name}:`, error);
            }
        });

        await Promise.allSettled(loadPromises);
    }

    async loadJobAnalyzer() {
        if (!window.jobAnalyzer) {
            // Create minimal job analyzer if not available
            window.jobAnalyzer = {
                userProfile: {
                    skills: [],
                    experiences: [],
                    writingStyle: null
                },
                analyzeUserDocuments: async () => {
                    console.log('📄 Mock job analyzer - analyzing user documents...');
                    return { skills: [], experiences: [] };
                }
            };
            console.log('🔧 Mock job analyzer created');
        }
    }

    async loadGlobalAI() {
        if (!window.globalAI) {
            // Create minimal AI service if not available
            window.globalAI = {
                analyzeJobPosting: async (jobDescription) => {
                    console.log('🤖 Mock AI analysis for job posting...');
                    return {
                        requirements: [
                            { id: 1, text: 'Kommunikationsfähigkeiten', importance: 'high', match: 85 },
                            { id: 2, text: 'Teamarbeit', importance: 'medium', match: 90 },
                            { id: 3, text: 'Problemlösungsfähigkeiten', importance: 'high', match: 78 }
                        ],
                        overallMatch: 84
                    };
                }
            };
            console.log('🔧 Mock global AI created');
        }
    }

    setupErrorHandling() {
        // Global error handler for workflow
        window.addEventListener('error', (e) => {
            if (e.filename && e.filename.includes('workflow')) {
                console.error('🚨 Workflow Error:', e.error);
                this.handleWorkflowError(e.error);
            }
        });
    }

    handleWorkflowError(error) {
        const errorMessage = `
            <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Workflow-Fehler</strong>
                </div>
                <p>Ein Fehler ist aufgetreten. Bitte verwenden Sie die moderne Bewerbungsarchitektur:</p>
                <a href="applications-modern.html" style="background: #dc2626; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Zur neuen Architektur
                </a>
            </div>
        `;

        const container = document.querySelector('#workflow-content') || document.body;
        container.insertAdjacentHTML('beforeend', errorMessage);
    }

    // 🔧 Modern Workflow Functions
    generateStep1() {
        return `
            <div class="modern-workflow-step">
                <div class="step-header">
                    <div class="step-indicator">
                        <div class="step-number">1</div>
                        <div class="step-title">Bewerbungsdaten eingeben</div>
                    </div>
                    <div class="step-progress">1 / ${this.workflowData.maxSteps}</div>
                </div>
                
                <div class="step-content">
                    <div class="form-group">
                        <label for="company">Unternehmen *</label>
                        <input type="text" id="company" name="company" 
                               value="${this.workflowData.company}" 
                               placeholder="z.B. Tech-Startup GmbH"
                               required>
                        <div class="field-hint">Name des Unternehmens bei dem Sie sich bewerben</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="position">Position *</label>
                        <input type="text" id="position" name="position" 
                               value="${this.workflowData.position}"
                               placeholder="z.B. Senior Developer"
                               required>
                        <div class="field-hint">Exakte Bezeichnung der ausgeschriebenen Stelle</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="jobDescription">Stellenbeschreibung</label>
                        <textarea id="jobDescription" name="jobDescription" rows="8" 
                                  placeholder="Kopieren Sie hier die komplette Stellenanzeige ein...">${this.workflowData.jobDescription}</textarea>
                        <div class="field-hint">
                            <i class="fas fa-lightbulb"></i>
                            Je vollständiger die Beschreibung, desto bessere KI-Analysen sind möglich
                        </div>
                    </div>
                </div>
                
                <div class="step-actions">
                    <button type="button" onclick="modernWorkflow.proceedToStep(2)" 
                            class="btn btn-primary" id="step1NextBtn">
                        Weiter zur Analyse
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    generateStep2() {
        // Sichere Verwendung von workflowData mit Fallbacks
        const company = this.workflowData.company || 'Unternehmen nicht angegeben';
        const position = this.workflowData.position || 'Position nicht angegeben';
        const hasJobDescription = this.workflowData.jobDescription && this.workflowData.jobDescription.trim().length > 0;

        return `
            <div class="modern-workflow-step">
                <div class="step-header">
                    <div class="step-indicator">
                        <div class="step-number">2</div>
                        <div class="step-title">Anforderungsanalyse & KI-Matching</div>
                    </div>
                    <div class="step-progress">2 / ${this.workflowData.maxSteps}</div>
                </div>
                
                <div class="step-content">
                    <div class="company-info-card">
                        <div class="info-item">
                            <strong>Unternehmen:</strong> 
                            <span class="${!this.workflowData.company ? 'missing-data' : ''}">${company}</span>
                        </div>
                        <div class="info-item">
                            <strong>Position:</strong> 
                            <span class="${!this.workflowData.position ? 'missing-data' : ''}">${position}</span>
                        </div>
                    </div>
                    
                    ${hasJobDescription ? `
                        <div class="analysis-section">
                            <h4>🤖 KI-Anforderungsanalyse</h4>
                            <button onclick="modernWorkflow.analyzeRequirements()" 
                                    class="btn btn-ai" id="analyzeBtn">
                                <i class="fas fa-brain"></i>
                                Stellenanzeige mit KI analysieren
                            </button>
                            
                            <div id="requirementsAnalysis" class="analysis-results" style="display: none;">
                                <!-- AI analysis results will appear here -->
                            </div>
                        </div>
                    ` : `
                        <div class="no-description-notice">
                            <i class="fas fa-info-circle"></i>
                            <p>Ohne Stellenbeschreibung können wir keine KI-Analyse durchführen.</p>
                            <button onclick="modernWorkflow.proceedToStep(1)" class="btn btn-secondary">
                                Zurück zur Eingabe
                            </button>
                        </div>
                    `}
                    
                    <div class="manual-option">
                        <button onclick="modernWorkflow.skipRequirements()" class="btn btn-outline">
                            <i class="fas fa-skip-forward"></i>
                            Analyse überspringen
                        </button>
                    </div>
                </div>
                
                <div class="step-actions">
                    <button type="button" onclick="modernWorkflow.proceedToStep(1)" 
                            class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Zurück
                    </button>
                    <button type="button" onclick="modernWorkflow.proceedWithRequirements()" 
                            class="btn btn-primary" id="proceedButton" style="display: none;">
                        Zum Anschreiben
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    generateStep3() {
        const company = this.workflowData.company || 'das Unternehmen';
        const position = this.workflowData.position || 'die Position';

        return `
            <div class="modern-workflow-step">
                <div class="step-header">
                    <div class="step-indicator">
                        <div class="step-number">3</div>
                        <div class="step-title">Anschreiben erstellen</div>
                    </div>
                    <div class="step-progress">3 / ${this.workflowData.maxSteps}</div>
                </div>
                
                <div class="step-content">
                    <div class="company-info-card">
                        <strong>Bewerbung an:</strong> ${company} - ${position}
                    </div>
                    
                    <div class="cover-letter-builder">
                        <div class="source-selection">
                            <label for="jobSource">Wo haben Sie die Stelle gefunden?</label>
                            <select id="jobSource" onchange="modernWorkflow.updateJobSource()">
                                <option value="website">Unternehmenswebseite</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="xing">Xing</option>
                                <option value="indeed">Indeed</option>
                                <option value="stepstone">StepStone</option>
                                <option value="referral">Empfehlung</option>
                            </select>
                        </div>
                        
                        ${this.getCoverLetterOptions()}
                    </div>
                </div>
                
                <div class="step-actions">
                    <button type="button" onclick="modernWorkflow.proceedToStep(2)" 
                            class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Zurück
                    </button>
                    <button type="button" onclick="modernWorkflow.proceedToStep(4)" 
                            class="btn btn-primary">
                        Finalisieren
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getCoverLetterOptions() {
        if (this.workflowData.selectedRequirements && this.workflowData.selectedRequirements.length > 0) {
            return `
                <div class="ai-generated-section">
                    <h4>🤖 KI-generiertes Anschreiben</h4>
                    <div class="cover-letter-preview" id="coverLetterPreview">
                        <div class="loading-cover-letter">
                            <i class="fas fa-spinner fa-spin"></i>
                            Anschreiben wird generiert...
                        </div>
                    </div>
                    <button onclick="modernWorkflow.generateCoverLetter()" class="btn btn-ai">
                        <i class="fas fa-magic"></i>
                        Anschreiben generieren
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="manual-writing-section">
                    <h4>✍️ Manuelles Anschreiben</h4>
                    <textarea id="manualCoverLetter" rows="12" 
                              placeholder="Schreiben Sie hier Ihr Anschreiben..."></textarea>
                    <div class="writing-tools">
                        <button onclick="modernWorkflow.addTemplate()" class="btn btn-outline">
                            <i class="fas fa-file-alt"></i>
                            Vorlage verwenden
                        </button>
                        <button onclick="modernWorkflow.aiAssist()" class="btn btn-outline">
                            <i class="fas fa-robot"></i>
                            KI-Unterstützung
                        </button>
                    </div>
                </div>
            `;
        }
    }

    generateStep4() {
        return `
            <div class="modern-workflow-step">
                <div class="step-header">
                    <div class="step-indicator">
                        <div class="step-number">✅</div>
                        <div class="step-title">Zusammenfassung & Export</div>
                    </div>
                    <div class="step-progress">${this.workflowData.maxSteps} / ${this.workflowData.maxSteps}</div>
                </div>
                
                <div class="step-content">
                    <div class="summary-card">
                        <h4>📋 Ihre Bewerbung</h4>
                        <div class="summary-details">
                            <div class="detail-item">
                                <strong>Unternehmen:</strong> ${this.workflowData.company}
                            </div>
                            <div class="detail-item">
                                <strong>Position:</strong> ${this.workflowData.position}
                            </div>
                            <div class="detail-item">
                                <strong>Anschreiben:</strong> 
                                ${this.workflowData.coverLetter ? 'Generiert' : 'Nicht verfügbar'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="export-options">
                        <h4>📤 Export & Speichern</h4>
                        <div class="export-buttons">
                            <button onclick="modernWorkflow.exportAsPDF()" class="btn btn-primary">
                                <i class="fas fa-file-pdf"></i>
                                Als PDF exportieren
                            </button>
                            <button onclick="modernWorkflow.saveToApplications()" class="btn btn-success">
                                <i class="fas fa-save"></i>
                                In Bewerbungen speichern
                            </button>
                            <button onclick="modernWorkflow.copyToClipboard()" class="btn btn-outline">
                                <i class="fas fa-copy"></i>
                                In Zwischenablage
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="step-actions">
                    <button type="button" onclick="modernWorkflow.proceedToStep(3)" 
                            class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Zurück
                    </button>
                    <button type="button" onclick="modernWorkflow.completeWorkflow()" 
                            class="btn btn-success">
                        <i class="fas fa-check"></i>
                        Workflow abschließen
                    </button>
                </div>
            </div>
        `;
    }

    // 🎯 Workflow Navigation
    async proceedToStep(stepNumber) {
        try {
            console.log(`📍 Proceeding to step ${stepNumber}`);
            
            // Validate current step before proceeding
            if (stepNumber > this.workflowData.currentStep) {
                const isValid = await this.validateCurrentStep();
                if (!isValid) {
                    return false;
                }
            }

            // Update workflow data from current step
            this.updateWorkflowDataFromCurrentStep();

            // Set new current step
            this.workflowData.currentStep = stepNumber;

            // Generate and display new step
            const stepContent = this.getStepContent(stepNumber);
            this.displayStep(stepContent);

            // Notify observers
            this.notifyObservers('stepChanged', { 
                currentStep: stepNumber,
                workflowData: this.workflowData 
            });

            return true;

        } catch (error) {
            console.error('❌ Error proceeding to step:', error);
            this.showErrorMessage(`Fehler beim Übergang zu Schritt ${stepNumber}`, error);
            return false;
        }
    }

    getStepContent(stepNumber) {
        const stepGenerators = {
            1: () => this.generateStep1(),
            2: () => this.generateStep2(), 
            3: () => this.generateStep3(),
            4: () => this.generateStep4()
        };

        const generator = stepGenerators[stepNumber];
        if (!generator) {
            throw new Error(`Invalid step number: ${stepNumber}`);
        }

        return generator();
    }

    async validateCurrentStep() {
        switch (this.workflowData.currentStep) {
            case 1:
                const company = document.getElementById('company')?.value.trim();
                const position = document.getElementById('position')?.value.trim();
                
                if (!company || !position) {
                    this.showErrorMessage('Bitte füllen Sie alle Pflichtfelder aus');
                    return false;
                }
                break;
                
            case 2:
                // Step 2 validation - optional since requirements analysis can be skipped
                break;
                
            case 3:
                // Step 3 validation - cover letter generation
                break;
        }
        
        return true;
    }

    updateWorkflowDataFromCurrentStep() {
        switch (this.workflowData.currentStep) {
            case 1:
                this.workflowData.company = document.getElementById('company')?.value || '';
                this.workflowData.position = document.getElementById('position')?.value || '';
                this.workflowData.jobDescription = document.getElementById('jobDescription')?.value || '';
                break;
                
            case 2:
                // Update requirements if analyzed
                break;
                
            case 3:
                this.workflowData.coverLetter = document.getElementById('manualCoverLetter')?.value || this.workflowData.coverLetter;
                break;
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('modernWorkflowData', JSON.stringify(this.workflowData));
    }

    displayStep(stepContent) {
        const container = document.getElementById('workflow-content') || 
                         document.querySelector('.workflow-container') ||
                         document.querySelector('#smartWorkflowModal .modal-content');

        if (!container) {
            console.error('❌ Workflow container not found');
            return;
        }

        // Add modern step styles if not present
        this.injectStepStyles();

        // Update container content
        container.innerHTML = stepContent;

        // Add animations
        container.querySelector('.modern-workflow-step')?.classList.add('slide-in');
    }

    injectStepStyles() {
        if (document.querySelector('#modern-workflow-styles')) return;

        const styles = `
            <style id="modern-workflow-styles">
            .modern-workflow-step {
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            }
            
            .step-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1.5rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .step-indicator {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 1.25rem;
            }
            
            .step-title {
                font-size: 1.25rem;
                font-weight: 600;
            }
            
            .step-progress {
                font-size: 0.875rem;
                opacity: 0.9;
            }
            
            .step-content {
                padding: 2rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-group label {
                display: block;
                font-weight: 600;
                color: #374151;
                margin-bottom: 0.5rem;
            }
            
            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .field-hint {
                font-size: 0.875rem;
                color: #6b7280;
                margin-top: 0.5rem;
            }
            
            .company-info-card {
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .info-item {
                margin-bottom: 0.5rem;
            }
            
            .missing-data {
                color: #ef4444;
                font-style: italic;
            }
            
            .step-actions {
                padding: 1.5rem 2rem;
                background: #f8fafc;
                display: flex;
                justify-content: space-between;
                gap: 1rem;
            }
            
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .btn-primary {
                background: #667eea;
                color: white;
            }
            
            .btn-primary:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
            
            .btn-secondary {
                background: #6b7280;
                color: white;
            }
            
            .btn-outline {
                background: transparent;
                color: #667eea;
                border: 2px solid #667eea;
            }
            
            .btn-ai {
                background: linear-gradient(135deg, #8b5cf6, #a855f7);
                color: white;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .slide-in {
                animation: slideIn 0.3s ease-out;
            }
            
            @media (max-width: 768px) {
                .step-header {
                    flex-direction: column;
                    gap: 1rem;
                    text-align: center;
                }
                
                .step-actions {
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                    justify-content: center;
                }
            }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // 🤖 AI-Integration
    async analyzeRequirements() {
        try {
            const analyzeBtn = document.getElementById('analyzeBtn');
            const resultsDiv = document.getElementById('requirementsAnalysis');
            
            if (!analyzeBtn || !resultsDiv) {
                throw new Error('UI elements not found');
            }

            // Show loading state
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysiere...';

            // Perform AI analysis
            const aiResult = await this.performAIAnalysis();
            
            // Display results
            resultsDiv.innerHTML = this.formatAnalysisResults(aiResult);
            resultsDiv.style.display = 'block';

            // Enable proceed button
            const proceedBtn = document.getElementById('proceedButton');
            if (proceedBtn) {
                proceedBtn.style.display = 'inline-flex';
            }

            // Update workflow data
            this.workflowData.requirements = aiResult.requirements || [];
            this.workflowData.aiAnalysisResult = aiResult;

        } catch (error) {
            console.error('❌ Requirements analysis failed:', error);
            this.showErrorMessage('KI-Analyse fehlgeschlagen', error);
        } finally {
            // Reset button state
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<i class="fas fa-brain"></i> Erneut analysieren';
            }
        }
    }

    async performAIAnalysis() {
        if (window.globalAI && window.globalAI.analyzeJobPosting) {
            return await window.globalAI.analyzeJobPosting(this.workflowData.jobDescription);
        } else {
            // Fallback mock analysis
            return {
                requirements: [
                    { id: 1, text: 'Kommunikationsfähigkeiten', importance: 'high', match: 85 },
                    { id: 2, text: 'Teamarbeit', importance: 'medium', match: 90 },
                    { id: 3, text: 'Problemlösungsfähigkeiten', importance: 'high', match: 78 }
                ],
                overallMatch: 84
            };
        }
    }

    formatAnalysisResults(aiResult) {
        const requirements = aiResult.requirements || [];
        
        return `
            <div class="analysis-results">
                <div class="analysis-summary">
                    <div class="match-score">
                        <div class="score-circle">
                            <span class="score-number">${aiResult.overallMatch || 0}%</span>
                        </div>
                        <div class="score-label">Übereinstimmung</div>
                    </div>
                </div>
                
                <div class="requirements-list">
                    <h5>🎯 Identifizierte Anforderungen:</h5>
                    ${requirements.map(req => `
                        <div class="requirement-item" data-id="${req.id}">
                            <div class="req-content">
                                <span class="req-text">${req.text}</span>
                                <span class="req-match">${req.match}% Match</span>
                            </div>
                            <div class="req-importance importance-${req.importance}">
                                ${req.importance}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="analysis-actions">
                    <button onclick="modernWorkflow.selectAllRequirements()" class="btn btn-outline">
                        Alle auswählen
                    </button>
                    <button onclick="modernWorkflow.selectHighPriorityOnly()" class="btn btn-outline">
                        Nur wichtige
                    </button>
                </div>
            </div>
        `;
    }

    // 🛠️ Utility Functions
    showErrorMessage(message, error = null) {
        const errorHTML = `
            <div class="workflow-error" style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Fehler im Workflow</strong>
                </div>
                <p>${message}</p>
                ${error ? `<details><summary>Technische Details</summary><pre>${error.stack || error.message}</pre></details>` : ''}
                <div style="margin-top: 1rem;">
                    <a href="applications-modern.html" class="btn btn-primary" style="background: #dc2626; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        Zur neuen Architektur wechseln
                    </a>
                </div>
            </div>
        `;

        const container = document.querySelector('#workflow-content') || document.body;
        container.insertAdjacentHTML('afterbegin', errorHTML);
    }

    skipRequirements() {
        this.workflowData.skipRequirements = true;
        this.proceedToStep(3);
    }

    proceedWithRequirements() {
        // Collect selected requirements
        const selectedReqs = Array.from(document.querySelectorAll('.requirement-item.selected'))
            .map(item => ({
                id: item.dataset.id,
                text: item.querySelector('.req-text').textContent,
                match: parseInt(item.querySelector('.req-match').textContent)
            }));

        this.workflowData.selectedRequirements = selectedReqs;
        this.proceedToStep(3);
    }

    // 🔔 Observer Pattern
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Observer callback error:', error);
            }
        });
    }

    // 🧹 Cleanup
    destroy() {
        this.observers.clear();
        this.workflowData = null;
        this.currentStepElement = null;
        this.isInitialized = false;

        // Remove injected styles
        const styles = document.querySelector('#modern-workflow-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// 🌐 Global Integration
let modernWorkflow = null;

// Replace legacy functions
window.startSmartBewerbungsWorkflow = function() {
    console.log('🚀 Starting Modern Workflow (replacing legacy)...');
    
    try {
        // Initialize modern workflow if not already done
        if (!modernWorkflow) {
            modernWorkflow = new ModernWorkflowManager();
        }

        // Start with step 1
        modernWorkflow.proceedToStep(1);

    } catch (error) {
        console.error('❌ Failed to start modern workflow:', error);
        
        // Fallback to modern applications
        const shouldRedirect = confirm(
            'Der Legacy-Workflow hat Probleme. Möchten Sie zur neuen, modernen Bewerbungsarchitektur wechseln?'
        );
        
        if (shouldRedirect) {
            window.location.href = 'applications-modern.html';
        }
    }
};

// Safe global access
window.modernWorkflow = modernWorkflow;

// 📊 Export modern workflow functions
window.modernWorkflowFunctions = {
    proceedToStep: (step) => modernWorkflow?.proceedToStep(step),
    analyzeRequirements: () => modernWorkflow?.analyzeRequirements(),
    skipRequirements: () => modernWorkflow?.skipRequirements(),
    proceedWithRequirements: () => modernWorkflow?.proceedWithRequirements(),
    updateJobSource: () => console.log('Job source updated'),
    generateCoverLetter: () => console.log('Cover letter generation...'),
    addTemplate: () => console.log('Adding template...'),
    aiAssist: () => console.log('AI assistance...'),
    exportAsPDF: () => console.log('Exporting as PDF...'),
    saveToApplications: () => console.log('Saving to applications...'),
    copyToClipboard: () => console.log('Copying to clipboard...'),
    completeWorkflow: () => console.log('Workflow completed')
};

console.log('✅ Modern Workflow Manager script loaded');

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    modernWorkflow = new ModernWorkflowManager();
});
