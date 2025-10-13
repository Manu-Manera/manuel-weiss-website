/**
 * Konsolidierter Bewerbungs-Workflow
 * Alle Workflow-Funktionen in einer einzigen Datei
 */

class ConsolidatedWorkflowSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.applicationData = {
            applicationType: 'job-posting', // 'job-posting' oder 'initiative'
            company: '',
            position: '',
            jobDescription: '',
            // Initiativbewerbung Felder
            initiativeCompanyName: '',
            initiativeCompanyAddress: '',
            initiativeContactPerson: '',
            initiativePosition: '',
            requirements: [],
            userProfile: {},
            coverLetterComponents: {},
            design: {},
            publishSettings: {}
        };
        
        this.loadSavedData();
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('consolidatedWorkflowData');
            if (saved) {
                this.applicationData = { ...this.applicationData, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Fehler beim Laden der Daten:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('consolidatedWorkflowData', JSON.stringify(this.applicationData));
        } catch (error) {
            console.warn('Fehler beim Speichern der Daten:', error);
        }
    }

    // Schritt 1: Stelleninformationen mit Initiativbewerbung
    renderStep1() {
        return `
            <div class="workflow-step" data-step="1">
                <div class="step-header">
                    <h2>Schritt 1: Stelleninformationen</h2>
                    <p class="step-description">Fügen Sie die Stellenanzeige ein - wir analysieren sie automatisch für Sie</p>
                </div>
                
                <div class="application-type-selector">
                    <label class="radio-option">
                        <input type="radio" name="applicationType" value="job-posting" 
                               ${this.applicationData.applicationType !== 'initiative' ? 'checked' : ''}
                               onchange="window.consolidatedWorkflow.setApplicationType('job-posting')">
                        <span class="radio-label">
                            <i class="fas fa-clipboard-list"></i>
                            Mit Stellenanzeige
                        </span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="applicationType" value="initiative" 
                               ${this.applicationData.applicationType === 'initiative' ? 'checked' : ''}
                               onchange="window.consolidatedWorkflow.setApplicationType('initiative')">
                        <span class="radio-label">
                            <i class="fas fa-lightbulb"></i>
                            Initiativbewerbung
                        </span>
                    </label>
                </div>

                <div class="form-section ${this.applicationData.applicationType === 'initiative' ? 'hidden' : ''}" id="jobDescriptionSection">
                    <label class="form-label required">
                        <i class="fas fa-paste"></i> Stellenbeschreibung
                        <span class="label-hint">Kopieren Sie die komplette Stellenanzeige hier hinein</span>
                    </label>
                    <textarea 
                        id="jobDescription" 
                        class="form-textarea large" 
                        placeholder="Fügen Sie hier die Stellenanzeige ein..."
                        data-action="workflow-analyze-job"
                    >${this.applicationData.jobDescription || ''}</textarea>
                    
                    <div id="analysisStatus" class="analysis-status hidden">
                        <i class="fas fa-spinner fa-spin"></i> Analysiere Stellenanzeige...
                    </div>
                </div>

                <!-- Initiativbewerbung Felder -->
                <div class="form-section ${this.applicationData.applicationType === 'initiative' ? '' : 'hidden'}" id="initiativeSection">
                    <div class="initiative-header">
                        <h4><i class="fas fa-lightbulb"></i> Initiativbewerbung - Firmeninformationen</h4>
                        <p class="section-description">Geben Sie die Firmendaten ein, um ein personalisiertes Bewerbungspaket zu erstellen</p>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label required">
                                <i class="fas fa-building"></i> Firmenname
                            </label>
                            <input 
                                type="text" 
                                id="initiativeCompanyName" 
                                class="form-input" 
                                value="${this.applicationData.initiativeCompanyName || ''}"
                                placeholder="z.B. ABC Consulting GmbH"
                                oninput="window.consolidatedWorkflow.checkInitiativeReadiness()"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-map-marker-alt"></i> Firmenadresse
                            </label>
                            <textarea 
                                id="initiativeCompanyAddress" 
                                class="form-textarea" 
                                placeholder="z.B. Musterstraße 123&#10;12345 Musterstadt"
                                oninput="window.consolidatedWorkflow.checkInitiativeReadiness()"
                            >${this.applicationData.initiativeCompanyAddress || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-user-tie"></i> Ansprechpartner
                            </label>
                            <input 
                                type="text" 
                                id="initiativeContactPerson" 
                                class="form-input" 
                                value="${this.applicationData.initiativeContactPerson || ''}"
                                placeholder="z.B. Frau Dr. Mustermann, HR-Leiterin"
                                oninput="window.consolidatedWorkflow.checkInitiativeReadiness()"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-briefcase"></i> Gewünschte Position
                            </label>
                            <input 
                                type="text" 
                                id="initiativePosition" 
                                class="form-input" 
                                value="${this.applicationData.initiativePosition || ''}"
                                placeholder="z.B. Senior HR Consultant"
                                oninput="window.consolidatedWorkflow.checkInitiativeReadiness()"
                            />
                        </div>
                    </div>
                    
                    <div class="initiative-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.consolidatedWorkflow.saveCompanyPackage()">
                            <i class="fas fa-save"></i> Als Bewerbungspaket speichern
                        </button>
                        <button type="button" class="btn btn-outline" onclick="window.consolidatedWorkflow.loadCompanyPackage()">
                            <i class="fas fa-folder-open"></i> Gespeichertes Paket laden
                        </button>
                    </div>
                </div>

                <div id="extractedInfo" class="extracted-info ${this.applicationData.company ? '' : 'hidden'}">
                    <div class="info-header">
                        <i class="fas fa-magic"></i> Extrahierte Informationen
                        <span class="info-hint">Überprüfen und ggf. anpassen</span>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-building"></i> Unternehmen
                            </label>
                            <input 
                                type="text" 
                                id="companyName" 
                                class="form-input" 
                                value="${this.applicationData.company || this.applicationData.companyName || ''}"
                                placeholder="Firmenname eingeben..."
                                ${this.applicationData.applicationType === 'initiative' ? 'oninput="window.consolidatedWorkflow.checkInitiativeReadiness()"' : ''}
                            />
                            <div id="companySuggestions" class="suggestions-box"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-briefcase"></i> Position
                            </label>
                            <input 
                                type="text" 
                                id="jobTitle" 
                                class="form-input" 
                                value="${this.applicationData.position || ''}"
                                placeholder="Positionsbezeichnung eingeben..."
                                ${this.applicationData.applicationType === 'initiative' ? 'oninput="window.consolidatedWorkflow.checkInitiativeReadiness()"' : ''}
                            />
                            <div id="positionSuggestions" class="suggestions-box"></div>
                        </div>
                    </div>
                    
                    <!-- Ansprechpartner Sektion -->
                    <div class="form-section" style="margin-top: 1.5rem;">
                        <h4 style="margin-bottom: 1rem;">
                            <i class="fas fa-user-tie"></i> Ansprechpartner (Optional)
                        </h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-user"></i> Name
                                </label>
                                <input 
                                    type="text" 
                                    id="contactPersonName" 
                                    class="form-input" 
                                    value="${this.applicationData.contactPersonName || ''}"
                                    placeholder="z.B. Frau Dr. Mustermann"
                                />
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-envelope"></i> E-Mail
                                </label>
                                <input 
                                    type="email" 
                                    id="contactPersonEmail" 
                                    class="form-input" 
                                    value="${this.applicationData.contactPersonEmail || ''}"
                                    placeholder="z.B. hr@unternehmen.de"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="workflow-navigation">
                    <button class="btn btn-secondary" data-action="workflow-prev-step" disabled>
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    <div class="step-indicators">
                        <span class="step-indicator active">1</span>
                        <span class="step-indicator">2</span>
                        <span class="step-indicator">3</span>
                        <span class="step-indicator">4</span>
                        <span class="step-indicator">5</span>
                        <span class="step-indicator">6</span>
                    </div>
                    <button class="btn btn-primary" data-action="workflow-next-step" id="nextStepBtn">
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    setApplicationType(type) {
        this.applicationData.applicationType = type;
        this.saveData();
        this.render();
    }

    checkInitiativeReadiness() {
        const companyName = document.getElementById('initiativeCompanyName')?.value;
        const position = document.getElementById('initiativePosition')?.value;
        
        if (companyName && position) {
            const nextButton = document.querySelector('[data-action="workflow-next-step"]');
            if (nextButton) {
                nextButton.disabled = false;
                nextButton.classList.remove('disabled');
            }
        }
    }

    saveCompanyPackage() {
        const packageData = {
            companyName: document.getElementById('initiativeCompanyName')?.value,
            companyAddress: document.getElementById('initiativeCompanyAddress')?.value,
            contactPerson: document.getElementById('initiativeContactPerson')?.value,
            position: document.getElementById('initiativePosition')?.value,
            savedAt: new Date().toISOString()
        };

        if (!packageData.companyName) {
            alert('Bitte geben Sie mindestens den Firmennamen ein.');
            return;
        }

        const savedPackages = JSON.parse(localStorage.getItem('companyPackages') || '[]');
        savedPackages.push(packageData);
        localStorage.setItem('companyPackages', JSON.stringify(savedPackages));

        this.showNotification('Bewerbungspaket gespeichert!', 'success');
    }

    loadCompanyPackage() {
        const savedPackages = JSON.parse(localStorage.getItem('companyPackages') || '[]');
        
        if (savedPackages.length === 0) {
            alert('Keine gespeicherten Bewerbungspakete gefunden.');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-folder-open"></i> Bewerbungspaket laden</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="package-list">
                        ${savedPackages.map((pkg, index) => `
                            <div class="package-item" onclick="window.consolidatedWorkflow.selectCompanyPackage(${index})">
                                <div class="package-company">${pkg.companyName}</div>
                                <div class="package-position">${pkg.position || 'Keine Position'}</div>
                                <div class="package-date">${new Date(pkg.savedAt).toLocaleDateString()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    selectCompanyPackage(index) {
        const savedPackages = JSON.parse(localStorage.getItem('companyPackages') || '[]');
        const packageData = savedPackages[index];

        if (packageData) {
            document.getElementById('initiativeCompanyName').value = packageData.companyName || '';
            document.getElementById('initiativeCompanyAddress').value = packageData.companyAddress || '';
            document.getElementById('initiativeContactPerson').value = packageData.contactPerson || '';
            document.getElementById('initiativePosition').value = packageData.position || '';

            document.querySelector('.modal').remove();
            this.checkInitiativeReadiness();
            this.showNotification('Bewerbungspaket geladen!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    render() {
        const container = document.getElementById('workflowContainer');
        if (container) {
            container.innerHTML = this.renderStep1();
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Event Listeners für Navigation
        const nextBtn = document.querySelector('[data-action="workflow-next-step"]');
        const prevBtn = document.querySelector('[data-action="workflow-prev-step"]');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.saveData();
            this.render();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.saveData();
            this.render();
        }
    }
}

// Globale Instanz erstellen
window.consolidatedWorkflow = new ConsolidatedWorkflowSystem();

// Globale Funktionen für Kompatibilität
window.consolidatedWorkflow.saveCompanyPackage = window.consolidatedWorkflow.saveCompanyPackage.bind(window.consolidatedWorkflow);
window.consolidatedWorkflow.loadCompanyPackage = window.consolidatedWorkflow.loadCompanyPackage.bind(window.consolidatedWorkflow);
window.consolidatedWorkflow.selectCompanyPackage = window.consolidatedWorkflow.selectCompanyPackage.bind(window.consolidatedWorkflow);
window.consolidatedWorkflow.setApplicationType = window.consolidatedWorkflow.setApplicationType.bind(window.consolidatedWorkflow);
window.consolidatedWorkflow.checkInitiativeReadiness = window.consolidatedWorkflow.checkInitiativeReadiness.bind(window.consolidatedWorkflow);

console.log('✅ Konsolidierter Workflow geladen');
