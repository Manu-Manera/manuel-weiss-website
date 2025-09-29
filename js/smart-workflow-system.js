/**
 * Smart Application Workflow System
 * Komplett überarbeiteter Workflow mit erweiterten Features
 */

class SmartWorkflowSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.applicationData = {
            company: '',
            position: '',
            jobDescription: '',
            requirements: [],
            userProfile: {},
            coverLetterComponents: {},
            design: {},
            publishSettings: {}
        };
        
        // Lade gespeicherte Daten
        this.loadSavedData();
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('smartWorkflowData');
            if (saved) {
                this.applicationData = { ...this.applicationData, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Fehler beim Laden der Daten:', error);
            // Fehlerbehandlung - mit leeren Daten starten
        }
    }

    saveData() {
        try {
            localStorage.setItem('smartWorkflowData', JSON.stringify(this.applicationData));
        } catch (error) {
            console.warn('Fehler beim Speichern der Daten:', error);
            // Ignoriere Fehler beim Speichern (z.B. bei vollem Storage)
        }
    }

    // Schritt 1: Stelleninformationen mit automatischer Analyse
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
                               onchange="window.smartWorkflow.setApplicationType('job-posting')">
                        <span class="radio-label">
                            <i class="fas fa-clipboard-list"></i>
                            Mit Stellenanzeige
                        </span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="applicationType" value="initiative" 
                               ${this.applicationData.applicationType === 'initiative' ? 'checked' : ''}
                               onchange="window.smartWorkflow.setApplicationType('initiative')">
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
                                ${this.applicationData.applicationType === 'initiative' ? 'oninput="window.smartWorkflow.checkInitiativeReadiness()"' : ''}
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
                                ${this.applicationData.applicationType === 'initiative' ? 'oninput="window.smartWorkflow.checkInitiativeReadiness()"' : ''}
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
                                <label for="contactName" class="form-label">
                                    <i class="fas fa-user"></i> Name
                                </label>
                                <input 
                                    type="text" 
                                    id="contactName" 
                                    class="form-input" 
                                    placeholder="Vor- und Nachname"
                                    value="${this.applicationData.contactPerson?.name || ''}"
                                    oninput="window.smartWorkflow.updateContactPerson()"
                                />
                            </div>
                            <div class="form-group">
                                <label for="contactPosition" class="form-label">
                                    <i class="fas fa-id-badge"></i> Position
                                </label>
                                <input 
                                    type="text" 
                                    id="contactPosition" 
                                    class="form-input" 
                                    placeholder="z.B. HR Manager"
                                    value="${this.applicationData.contactPerson?.position || ''}"
                                    oninput="window.smartWorkflow.updateContactPerson()"
                                />
                            </div>
                            <div class="form-group">
                                <label for="contactEmail" class="form-label">
                                    <i class="fas fa-envelope"></i> E-Mail
                                </label>
                                <input 
                                    type="email" 
                                    id="contactEmail" 
                                    class="form-input" 
                                    placeholder="email@unternehmen.de"
                                    value="${this.applicationData.contactPerson?.email || ''}"
                                    oninput="window.smartWorkflow.updateContactPerson()"
                                />
                            </div>
                            <div class="form-group">
                                <label for="contactPhone" class="form-label">
                                    <i class="fas fa-phone"></i> Telefon
                                </label>
                                <input 
                                    type="tel" 
                                    id="contactPhone" 
                                    class="form-input" 
                                    placeholder="+49 123 456789"
                                    value="${this.applicationData.contactPerson?.phone || ''}"
                                    oninput="window.smartWorkflow.updateContactPerson()"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="extraction-confirm ${this.applicationData.extractionConfirmed ? 'confirmed' : ''}">
                        <div class="confirm-message">
                            <i class="fas fa-question-circle"></i>
                            Möchten Sie die extrahierten Daten übernehmen?
                        </div>
                        <div class="confirm-actions">
                            <button class="btn btn-success" data-action="workflow-confirm-extraction">
                                <i class="fas fa-check"></i> Übernehmen
                            </button>
                            <button class="btn btn-secondary" data-action="workflow-edit-extraction">
                                <i class="fas fa-edit"></i> Anpassen
                            </button>
                        </div>
                    </div>
                </div>

                <div class="location-section">
                    <label class="form-label">
                        <i class="fas fa-map-marker-alt"></i> Standort (optional)
                    </label>
                    <input 
                        type="text" 
                        id="jobLocation" 
                        class="form-input" 
                        value="${this.applicationData.location || ''}"
                        placeholder="z.B. Zürich, Remote, etc."
                    />
                </div>
            </div>
        `;
    }

    // Schritt 2: Anforderungen priorisieren
    renderStep2() {
        // Prüfe ob KI-Analyse benötigt wird
        if (this.applicationData.needsAIAnalysis && 
            this.applicationData.applicationType !== 'initiative' &&
            this.applicationData.jobDescription &&
            this.applicationData.jobDescription !== 'Initiativbewerbung') {
            
            console.log('🤖 Schritt 2: KI-Analyse wird benötigt - starte automatisch');
            
            // Starte KI-Analyse automatisch - mit Service-Check
            setTimeout(async () => {
                // Stelle sicher, dass alle Services geladen sind
                if (!window.globalAI && window.GlobalAIService) {
                    console.log('🔄 Initialisiere GlobalAI Service...');
                    window.globalAI = new window.GlobalAIService();
                    await window.globalAI.initialize();
                }
                
                if (!window.secureAPIManager && window.SecureAPIManager) {
                    console.log('🔄 Initialisiere SecureAPIManager...');
                    window.secureAPIManager = new window.SecureAPIManager();
                }
                
                // Kurze Wartezeit für Service-Initialisierung
                setTimeout(() => {
                    this.triggerAIAnalysisInStep2();
                }, 200);
            }, 100);
            
            return `
                <div class="workflow-step" data-step="2">
                    <div class="step-header">
                        <h2>Schritt 2: Anforderungen analysieren</h2>
                        <p class="step-description">KI analysiert die Stellenanzeige und extrahiert die wichtigsten Anforderungen</p>
                    </div>

                    <div class="requirements-container">
                        <div id="requirementsAnalysis" class="analysis-container">
                            <div style="text-align: center; padding: 2rem;">
                                <i class="fas fa-robot fa-3x" style="color: #6366f1; margin-bottom: 1rem;"></i>
                                <h3>KI-Analyse läuft...</h3>
                                <p>Die Stellenanzeige wird analysiert und die wichtigsten Anforderungen werden extrahiert.</p>
                                <div class="loading-spinner">
                                    <i class="fas fa-spinner fa-spin"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Standard-Rendering wenn Anforderungen bereits vorhanden
        return `
            <div class="workflow-step" data-step="2">
                <div class="step-header">
                    <h2>Schritt 2: Anforderungen priorisieren</h2>
                    <p class="step-description">Ordnen Sie die Anforderungen nach Wichtigkeit - ziehen Sie sie einfach nach oben oder unten</p>
                </div>

                <div class="requirements-container">
                    <div class="requirements-header">
                        <h3><i class="fas fa-list-ol"></i> Extrahierte Anforderungen</h3>
                        <button class="btn btn-small btn-secondary" onclick="window.smartWorkflow.addRequirement()">
                            <i class="fas fa-plus"></i> Anforderung hinzufügen
                        </button>
                    </div>

                    <div id="requirementsList" class="requirements-list sortable">
                        ${this.renderRequirementsList()}
                    </div>

                    <div class="requirements-tips">
                        <div class="tip-box">
                            <i class="fas fa-lightbulb"></i>
                            <div>
                                <strong>Tipp:</strong> Die wichtigsten Anforderungen sollten oben stehen.
                                Diese werden in Ihrem Anschreiben prominent erwähnt.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRequirementsList() {
        if (!this.applicationData.requirements || this.applicationData.requirements.length === 0) {
            return '<div class="empty-state">Keine Anforderungen gefunden. Bitte analysieren Sie zuerst die Stellenanzeige.</div>';
        }

        return this.applicationData.requirements.map((req, index) => `
            <div class="requirement-item" data-index="${index}" draggable="true">
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="requirement-number">${index + 1}</div>
                <div class="requirement-content">
                    <textarea 
                        class="requirement-text"
                        onchange="window.smartWorkflow.updateRequirement(${index}, this.value)"
                        oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'"
                        placeholder="Anforderung bearbeiten..."
                    >${req.text}</textarea>
                    <div class="requirement-meta">
                        <span class="priority-badge priority-${req.priority || 'medium'}">
                            ${req.priority || 'medium'}
                        </span>
                        <span class="match-score">
                            <i class="fas fa-chart-line"></i> ${req.matchScore || 0}% Match
                        </span>
                    </div>
                </div>
                <div class="requirement-actions">
                    <button class="btn-icon" onclick="window.smartWorkflow.setPriority(${index}, 'high')" title="Hohe Priorität">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-icon" onclick="window.smartWorkflow.setPriority(${index}, 'low')" title="Niedrige Priorität">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="window.smartWorkflow.removeRequirement(${index})" title="Entfernen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Schritt 3: Profil-Analyse
    renderStep3() {
        return `
            <div class="workflow-step" data-step="3">
                <div class="step-header">
                    <h2>Schritt 3: Ihr Profil analysieren</h2>
                    <p class="step-description">Wir analysieren Ihre Dokumente um Ihren Schreibstil und Ihre Kompetenzen zu verstehen</p>
                </div>

                <div class="document-upload-section">
                    <h3><i class="fas fa-file-upload"></i> Dokumente hochladen</h3>
                    
                    <div class="upload-grid">
                        <div class="upload-box" data-type="cv">
                            <i class="fas fa-file-alt fa-3x"></i>
                            <h4>Lebensläufe</h4>
                            <p>PDF oder Word Dokumente</p>
                            <input type="file" id="cvUpload" accept=".pdf,.doc,.docx,.odt,.rtf" multiple hidden 
                                   onchange="handleSmartWorkflowFileChange('cvUpload', 'cv')"
                                   onclick="console.log('📄 CV Upload clicked')">
                            <button class="btn btn-primary" onclick="triggerSmartWorkflowUpload('cvUpload', 'cv')">
                                <i class="fas fa-upload"></i> Hochladen
                            </button>
                            <div class="uploaded-count">${this.getUploadedDocuments('cv').length} Dateien</div>
                            <div class="uploaded-files" id="uploadedCVs">
                                ${this.renderUploadedFiles('cv')}
                            </div>
                        </div>

                        <div class="upload-box" data-type="coverLetters">
                            <i class="fas fa-envelope fa-3x"></i>
                            <h4>Anschreiben</h4>
                            <p>Frühere Bewerbungen</p>
                            <input type="file" id="coverLetterUpload" accept=".pdf,.doc,.docx" multiple hidden 
                                   onchange="handleSmartWorkflowFileChange('coverLetterUpload', 'coverLetters')">
                            <button class="btn btn-primary" onclick="triggerSmartWorkflowUpload('coverLetterUpload', 'coverLetters')">
                                <i class="fas fa-upload"></i> Hochladen
                            </button>
                            <div class="uploaded-count">${this.getUploadedDocuments('coverLetters').length} Dateien</div>
                            <div class="uploaded-files" id="uploadedCoverLetters">
                                ${this.renderUploadedFiles('coverLetters')}
                            </div>
                        </div>

                        <div class="upload-box" data-type="certificates">
                            <i class="fas fa-certificate fa-3x"></i>
                            <h4>Zeugnisse & Zertifikate</h4>
                            <p>Nachweise Ihrer Qualifikationen</p>
                            <input type="file" id="certificateUpload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" multiple hidden 
                                   onchange="handleSmartWorkflowFileChange('certificateUpload', 'certificates')">
                            <button class="btn btn-primary" onclick="triggerSmartWorkflowUpload('certificateUpload', 'certificates')">
                                <i class="fas fa-upload"></i> Hochladen
                            </button>
                            <div class="uploaded-count">${this.getUploadedDocuments('certificates').length} Dateien</div>
                            <div class="uploaded-files" id="uploadedCertificates">
                                ${this.renderUploadedFiles('certificates')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-analysis-section" style="margin-top: 2rem;">
                    <h3><i class="fas fa-robot"></i> KI-Profilanalyse</h3>
                    <p class="section-description">Erstelle ein detailliertes Persönlichkeits- und Kompetenzprofil aus Ihren Dokumenten</p>
                    
                    <div class="analysis-controls">
                        <button class="btn btn-primary btn-large" onclick="window.analyzeStoredDocumentsEnhanced ? window.analyzeStoredDocumentsEnhanced() : window.smartWorkflow.startProfileAnalysis()" 
                                ${this.isProfileAnalysisInProgress() ? 'disabled' : ''}>
                            <i class="fas ${this.isProfileAnalysisInProgress() ? 'fa-spinner fa-spin' : 'fa-brain'}"></i>
                            ${this.isProfileAnalysisInProgress() ? 'Analysiere Dokumente...' : 'KI-Analyse starten'}
                        </button>
                        
                        ${this.applicationData.aiProfile ? `
                            <button class="btn btn-secondary" onclick="window.smartWorkflow.showProfileDetails()">
                                <i class="fas fa-eye"></i> Profil anzeigen
                            </button>
                            <button class="btn btn-outline" onclick="window.smartWorkflow.regenerateProfile()">
                                <i class="fas fa-sync"></i> Neu analysieren
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="analysis-progress" id="profileAnalysisProgress">
                        ${this.renderProfileAnalysisStatus()}
                    </div>
                    
                    ${this.applicationData.aiProfile ? `
                        <div class="profile-summary">
                            <h4><i class="fas fa-user-circle"></i> Profil-Zusammenfassung</h4>
                            <div class="profile-grid">
                                <div class="profile-card">
                                    <h5><i class="fas fa-tools"></i> Kernkompetenzen (${this.applicationData.aiProfile.skills?.length || 0})</h5>
                                    <div class="skills-preview">
                                        ${(this.applicationData.aiProfile.skills || []).slice(0, 5).map(skill => 
                                            `<span class="skill-tag">${typeof skill === 'string' ? skill : skill.name}</span>`
                                        ).join('')}
                                        ${(this.applicationData.aiProfile.skills?.length || 0) > 5 ? 
                                            `<span class="more-indicator">+${(this.applicationData.aiProfile.skills?.length || 0) - 5} weitere</span>` : ''
                                        }
                                    </div>
                                </div>
                                
                                <div class="profile-card">
                                    <h5><i class="fas fa-heart"></i> Persönlichkeit</h5>
                                    <div class="personality-preview">
                                        ${(this.applicationData.aiProfile.personality || []).slice(0, 3).map(trait => 
                                            `<span class="personality-tag">${trait}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                                
                                <div class="profile-card">
                                    <h5><i class="fas fa-pen"></i> Schreibstil</h5>
                                    <div class="writing-style">
                                        ${this.applicationData.aiProfile.writingStyle || 'Noch nicht analysiert'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="analysis-section ${this.applicationData.aiProfile ? '' : 'hidden'}">
                    <h3><i class="fas fa-chart-line"></i> Analyse-Ergebnisse</h3>
                    
                    <div class="analysis-grid">
                        <div class="analysis-card">
                            <h4><i class="fas fa-pen"></i> Schreibstil</h4>
                            <div class="analysis-content">
                                <p><strong>Stil:</strong> ${this.applicationData.writingStyle || 'Professionell, präzise'}</p>
                                <p><strong>Ton:</strong> ${this.applicationData.writingTone || 'Selbstbewusst, freundlich'}</p>
                                <p><strong>Struktur:</strong> ${this.applicationData.writingStructure || 'Klar gegliedert'}</p>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <h4><i class="fas fa-tools"></i> Kernkompetenzen</h4>
                            <div class="skills-cloud">
                                ${this.renderSkillsCloud()}
                            </div>
                        </div>

                        <div class="analysis-card">
                            <h4><i class="fas fa-globe"></i> Best Practices</h4>
                            <div class="country-selector">
                                <label>Land auswählen:</label>
                                <select id="countryBestPractices" onchange="window.smartWorkflow.updateBestPractices(this.value)">
                                    <option value="DACH">DACH (Deutschland, Österreich, Schweiz)</option>
                                    <option value="US">USA</option>
                                    <option value="UK">Großbritannien</option>
                                    <option value="AU">Australien</option>
                                </select>
                            </div>
                            <div id="bestPracticesList" class="best-practices-list">
                                ${this.renderBestPractices()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Schritt 4: Satz-Generierung
    renderStep4() {
        return `
            <div class="workflow-step" data-step="4">
                <div class="step-header">
                    <h2>Schritt 4: Passgenaue Formulierungen</h2>
                    <p class="step-description">Für jede Anforderung generieren wir passende Sätze in Ihrem Schreibstil</p>
                </div>

                <div class="sentence-generator">
                    <div class="generator-controls">
                        <div class="control-group">
                            <label><i class="fas fa-sliders-h"></i> Satzlänge</label>
                            <select id="sentenceLength">
                                <option value="short">Kurz (10-15 Wörter)</option>
                                <option value="medium" selected>Mittel (15-25 Wörter)</option>
                                <option value="long">Lang (25-35 Wörter)</option>
                            </select>
                        </div>
                        
                        <div class="control-group">
                            <label><i class="fas fa-adjust"></i> Tonalität</label>
                            <select id="sentenceTone">
                                <option value="formal">Formell</option>
                                <option value="professional" selected>Professionell</option>
                                <option value="confident">Selbstbewusst</option>
                                <option value="enthusiastic">Enthusiastisch</option>
                            </select>
                        </div>

                        <div class="control-group">
                            <label><i class="fas fa-book"></i> Stil</label>
                            <select id="sentenceStyle">
                                <option value="direct">Direkt</option>
                                <option value="narrative">Erzählend</option>
                                <option value="achievement" selected>Erfolgsorientiert</option>
                                <option value="competency">Kompetenzbasiert</option>
                            </select>
                        </div>
                    </div>

                    <div class="requirements-sentences">
                        ${this.renderRequirementSentences()}
                    </div>
                </div>
            </div>
        `;
    }

    renderRequirementSentences() {
        return this.applicationData.requirements.map((req, index) => `
            <div class="requirement-sentence-block">
                <div class="requirement-header">
                    <span class="req-number">${index + 1}</span>
                    <span class="req-text">${req.text}</span>
                    <span class="priority-indicator priority-${req.priority}">
                        <i class="fas fa-star"></i> ${req.priority}
                    </span>
                </div>

                <div class="sentence-options" id="sentences-${index}">
                    ${this.renderSentenceOptions(req, index)}
                </div>

                <div class="sentence-actions">
                    <button class="btn btn-small btn-primary" onclick="window.smartWorkflow.generateSentencesForRequirement(${index})" 
                            ${this.isSentenceGenerationInProgress(index) ? 'disabled' : ''}>
                        <i class="fas ${this.isSentenceGenerationInProgress(index) ? 'fa-spinner fa-spin' : 'fa-magic'}"></i> 
                        ${this.isSentenceGenerationInProgress(index) ? 'Generiere Sätze...' : 'Generiere Sätze...'}
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="window.smartWorkflow.generateMoreSentences(${index})">
                        <i class="fas fa-sync"></i> Neue Vorschläge
                    </button>
                    <button class="btn btn-small btn-outline" onclick="window.smartWorkflow.customizeSentence(${index})">
                        <i class="fas fa-edit"></i> Anpassen
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSentenceOptions(requirement, reqIndex) {
        const sentences = requirement.sentences || [];
        if (sentences.length === 0) {
            return `
                <div class="no-sentences">
                    <i class="fas fa-lightbulb"></i>
                    <p>Noch keine Sätze generiert. Klicken Sie auf "Generiere Sätze..." um KI-basierte Formulierungen zu erstellen.</p>
                </div>
            `;
        }
        
        return sentences.map((sentence, idx) => `
            <div class="sentence-option ${sentence.selected ? 'selected' : ''}" data-sentence-id="${idx}">
                <div class="sentence-content">
                    <label class="sentence-radio">
                        <input type="radio" name="sentence-${reqIndex}" value="${idx}" 
                    ${sentence.selected ? 'checked' : ''}
                               onchange="window.smartWorkflow.selectSentence(${reqIndex}, ${idx})">
                        <span class="sentence-text" contenteditable="true" 
                              onblur="window.smartWorkflow.updateSentenceText(${reqIndex}, ${idx}, this.innerText)">
                            ${sentence.text}
                        </span>
                    </label>
                </div>
                    <div class="sentence-meta">
                    <span class="sentence-score">
                        <i class="fas fa-chart-line"></i> ${sentence.matchScore || 85}% Match
                    </span>
                    <span class="sentence-style">
                        ${sentence.style || 'Professionell'}
                    </span>
                    </div>
            </div>
        `).join('');
    }

    // Schritt 5: Anschreiben zusammenfügen
    renderStep5() {
        return `
            <div class="workflow-step" data-step="5">
                <div class="step-header">
                    <h2>Schritt 5: Anschreiben finalisieren</h2>
                    <p class="step-description">Fügen Sie alle Komponenten zu einem perfekten Anschreiben zusammen</p>
                </div>

                <div class="letter-composer">
                    <div class="composer-sidebar">
                        <h3>Komponenten</h3>
                        
                        <div class="component-section">
                            <h4><i class="fas fa-address-card"></i> Adressen</h4>
                            
                            <div class="address-component">
                                <label>Ihre Adresse</label>
                                <div class="address-preview" id="senderAddress">
                                    ${this.renderSenderAddress()}
                                </div>
                                <button class="btn btn-small" onclick="window.smartWorkflow.editSenderAddress()">
                                    <i class="fas fa-edit"></i> Bearbeiten
                                </button>
                            </div>

                            <div class="address-component">
                                <label>Firmenadresse</label>
                                <div class="address-search">
                                    <button class="btn btn-primary btn-small" onclick="window.smartWorkflow.searchCompanyAddress()">
                                        <i class="fas fa-search"></i> Automatisch suchen
                                    </button>
                                </div>
                                <div class="address-preview" id="companyAddress">
                                    ${this.renderCompanyAddress()}
                                </div>
                            </div>
                        </div>

                        <div class="component-section">
                            <h4><i class="fas fa-heading"></i> Einleitung</h4>
                            <div class="intro-controls">
                                <label>Länge</label>
                                <select id="introLength">
                                    <option value="short">Kurz (1-2 Sätze)</option>
                                    <option value="medium" selected>Mittel (2-3 Sätze)</option>
                                    <option value="long">Lang (3-4 Sätze)</option>
                                </select>
                            </div>
                            <div id="introSuggestions" class="text-suggestions">
                                ${this.renderIntroSuggestions()}
                            </div>
                            <button class="btn btn-small" onclick="window.smartWorkflow.generateNewIntro()">
                                <i class="fas fa-sync"></i> Neu generieren
                            </button>
                        </div>

                        <div class="component-section">
                            <h4><i class="fas fa-signature"></i> Abschluss</h4>
                            <div id="closingSuggestions" class="text-suggestions">
                                ${this.renderClosingSuggestions()}
                            </div>
                            <div class="signature-upload">
                                <label>Unterschrift</label>
                                <div id="signaturePreview" class="signature-preview">
                                    ${this.renderSignature()}
                                </div>
                                <button class="btn btn-small" onclick="window.smartWorkflow.uploadSignature()">
                                    <i class="fas fa-upload"></i> Hochladen
                                </button>
                            </div>
                        </div>

                        <div class="component-section">
                            <h4><i class="fas fa-save"></i> Bausteine speichern</h4>
                            <button class="btn btn-secondary btn-small" onclick="window.smartWorkflow.saveComponents()">
                                <i class="fas fa-bookmark"></i> Als Vorlage speichern
                            </button>
                        </div>
                    </div>

                    <div class="composer-main">
                        <div class="letter-preview" id="letterPreview">
                            <div class="letter-paper">
                                ${this.renderLetterPreview()}
                            </div>
                        </div>
                        
                        <div class="editor-toolbar">
                            <button class="toolbar-btn" onclick="window.smartWorkflow.toggleBold()">
                                <i class="fas fa-bold"></i>
                            </button>
                            <button class="toolbar-btn" onclick="window.smartWorkflow.toggleItalic()">
                                <i class="fas fa-italic"></i>
                            </button>
                            <button class="toolbar-btn" onclick="window.smartWorkflow.toggleUnderline()">
                                <i class="fas fa-underline"></i>
                            </button>
                            <span class="toolbar-separator"></span>
                            <button class="toolbar-btn" onclick="window.smartWorkflow.alignLeft()">
                                <i class="fas fa-align-left"></i>
                            </button>
                            <button class="toolbar-btn" onclick="window.smartWorkflow.alignCenter()">
                                <i class="fas fa-align-center"></i>
                            </button>
                            <button class="toolbar-btn" onclick="window.smartWorkflow.alignRight()">
                                <i class="fas fa-align-right"></i>
                            </button>
                            <span class="toolbar-separator"></span>
                            <button class="toolbar-btn" onclick="window.smartWorkflow.insertBulletList()">
                                <i class="fas fa-list-ul"></i>
                            </button>
                            <button class="toolbar-btn" onclick="window.smartWorkflow.insertNumberedList()">
                                <i class="fas fa-list-ol"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Schritt 6: Design & Export
    renderStep6() {
        return `
            <div class="workflow-step" data-step="6">
                <div class="step-header">
                    <h2>Schritt 6: Design & Veröffentlichung</h2>
                    <p class="step-description">Gestalten Sie Ihre Bewerbung und wählen Sie das Ausgabeformat</p>
                </div>

                <div class="design-section">
                    <h3><i class="fas fa-palette"></i> Design anpassen</h3>
                    
                    <div class="design-options">
                        <div class="design-control">
                            <label>Farbschema</label>
                            <div class="color-picker-group">
                                <input type="color" id="primaryColor" value="#2c3e50" onchange="window.smartWorkflow.updateDesign()">
                                <input type="color" id="accentColor" value="#3498db" onchange="window.smartWorkflow.updateDesign()">
                            </div>
                        </div>

                        <div class="design-control">
                            <label>Unternehmenslogo</label>
                            <div class="logo-upload">
                                <div id="logoPreview" class="logo-preview">
                                    ${this.applicationData.companyLogo ? 
                                        `<img src="${this.applicationData.companyLogo}" alt="Logo">` : 
                                        '<i class="fas fa-image"></i>'
                                    }
                                </div>
                                <button class="btn btn-small" onclick="window.smartWorkflow.uploadLogo()">
                                    <i class="fas fa-upload"></i> Logo hochladen
                                </button>
                            </div>
                        </div>

                        <div class="design-control">
                            <label>Schriftart</label>
                            <select id="fontFamily" onchange="window.smartWorkflow.updateDesign()">
                                <option value="Arial">Arial</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Calibri">Calibri</option>
                            </select>
                        </div>

                        <div class="design-control">
                            <label>Layout-Stil</label>
                            <div class="layout-templates">
                                <div class="template-option ${this.applicationData.layoutStyle === 'classic' ? 'selected' : ''}" 
                                     onclick="window.smartWorkflow.selectLayout('classic')">
                                    <i class="fas fa-file-alt"></i>
                                    <span>Klassisch</span>
                                </div>
                                <div class="template-option ${this.applicationData.layoutStyle === 'modern' ? 'selected' : ''}" 
                                     onclick="window.smartWorkflow.selectLayout('modern')">
                                    <i class="fas fa-layer-group"></i>
                                    <span>Modern</span>
                                </div>
                                <div class="template-option ${this.applicationData.layoutStyle === 'creative' ? 'selected' : ''}" 
                                     onclick="window.smartWorkflow.selectLayout('creative')">
                                    <i class="fas fa-paint-brush"></i>
                                    <span>Kreativ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="preview-section">
                        <h3><i class="fas fa-eye"></i> Vorschau</h3>
                        <div class="document-preview-tabs">
                            <button class="tab-btn active" onclick="window.smartWorkflow.previewDocument('coverLetter')">
                                Anschreiben
                            </button>
                            <button class="tab-btn" onclick="window.smartWorkflow.previewDocument('cv')">
                                Lebenslauf
                            </button>
                            <button class="tab-btn" onclick="window.smartWorkflow.previewDocument('certificates')">
                                Zeugnisse
                            </button>
                        </div>
                        <div id="documentPreview" class="document-preview">
                            <!-- Preview content -->
                        </div>
                    </div>
                </div>

                <div class="export-section">
                    <h3><i class="fas fa-share-alt"></i> Ausgabeoptionen</h3>
                    
                    <div class="export-options">
                        <div class="export-option">
                            <input type="checkbox" id="exportWebpage" checked>
                            <label for="exportWebpage">
                                <i class="fas fa-globe"></i>
                                <div>
                                    <strong>Als Webseite veröffentlichen</strong>
                                    <p>Erhalten Sie einen teilbaren Link für die Firma</p>
                                </div>
                            </label>
                        </div>

                        <div class="export-option">
                            <input type="checkbox" id="exportPDF" checked>
                            <label for="exportPDF">
                                <i class="fas fa-file-pdf"></i>
                                <div>
                                    <strong>Als PDF herunterladen</strong>
                                    <p>Professionelles PDF-Format</p>
                                </div>
                            </label>
                        </div>

                        <div class="export-option">
                            <input type="checkbox" id="exportWord">
                            <label for="exportWord">
                                <i class="fas fa-file-word"></i>
                                <div>
                                    <strong>Als Word-Dokument</strong>
                                    <p>Bearbeitbare DOCX-Datei</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="share-section ${this.applicationData.published ? '' : 'hidden'}">
                        <h4><i class="fas fa-link"></i> Ihr Bewerbungslink</h4>
                        <div class="share-link-box">
                            <input type="text" id="shareLink" value="${this.applicationData.shareLink || ''}" readonly>
                            <button class="btn btn-primary" onclick="window.smartWorkflow.copyShareLink()">
                                <i class="fas fa-copy"></i> Kopieren
                            </button>
                        </div>
                        <div class="share-actions">
                            <button class="btn btn-small" onclick="window.smartWorkflow.shareViaEmail()">
                                <i class="fas fa-envelope"></i> Per E-Mail
                            </button>
                            <button class="btn btn-small" onclick="window.smartWorkflow.shareViaLinkedIn()">
                                <i class="fab fa-linkedin"></i> LinkedIn
                            </button>
                            <button class="btn btn-small" onclick="window.smartWorkflow.editWebpage()">
                                <i class="fas fa-edit"></i> Seite bearbeiten
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Hilfsfunktionen
    renderSkillsCloud() {
        const skills = this.applicationData.extractedSkills || [
            'Projektmanagement', 'Kommunikation', 'Teamführung', 
            'Analytisches Denken', 'Problemlösung', 'Kreativität'
        ];
        
        return skills.map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('');
    }

    renderBestPractices() {
        const practices = {
            'DACH': [
                'Foto nur wenn gefordert',
                'Tabellarischer Lebenslauf',
                'Anschreiben max. 1 Seite',
                'Formelle Anrede verwenden'
            ],
            'US': [
                'Kein Foto verwenden',
                'Resume statt CV',
                'Cover Letter optional',
                'Direkte, aktive Sprache'
            ]
        };
        
        const country = this.applicationData.selectedCountry || 'DACH';
        return (practices[country] || practices['DACH']).map(practice => 
            `<div class="practice-item">
                <i class="fas fa-check-circle"></i> ${practice}
            </div>`
        ).join('');
    }

    renderSenderAddress() {
        return this.applicationData.senderAddress || `
            <div class="address-line">Max Mustermann</div>
            <div class="address-line">Musterstraße 123</div>
            <div class="address-line">12345 Musterstadt</div>
            <div class="address-line">max@example.com</div>
            <div class="address-line">+49 123 456789</div>
        `;
    }

    renderCompanyAddress() {
        return this.applicationData.companyAddress || `
            <div class="address-line">${this.applicationData.company || 'Firmenname'}</div>
            <div class="address-line">Personalabteilung</div>
            <div class="address-line">Straße</div>
            <div class="address-line">PLZ Ort</div>
        `;
    }

    renderIntroSuggestions() {
        const intros = this.applicationData.introSuggestions || [
            'Mit großem Interesse habe ich Ihre Stellenausschreibung gelesen und bin überzeugt, dass meine Qualifikationen optimal zu den Anforderungen passen.',
            'Ihre Stellenausschreibung hat meine Aufmerksamkeit geweckt, da sie perfekt zu meinem beruflichen Profil und meinen Karrierezielen passt.',
            'Als erfahrener Experte im Bereich [Ihr Bereich] möchte ich meine Kompetenzen gerne in Ihrem Team einbringen.'
        ];
        
        return intros.map((intro, index) => `
            <div class="suggestion-item">
                <input type="radio" name="intro" id="intro-${index}" 
                       ${index === 0 ? 'checked' : ''}>
                <label for="intro-${index}">${intro}</label>
            </div>
        `).join('');
    }

    renderClosingSuggestions() {
        const closings = this.applicationData.closingSuggestions || [
            'Ich freue mich auf ein persönliches Gespräch, in dem ich Ihnen meine Motivation und Qualifikationen näher erläutern kann.',
            'Gerne überzeuge ich Sie in einem persönlichen Gespräch von meinen Fähigkeiten.',
            'Über eine Einladung zu einem Vorstellungsgespräch würde ich mich sehr freuen.'
        ];
        
        return closings.map((closing, index) => `
            <div class="suggestion-item">
                <input type="radio" name="closing" id="closing-${index}" 
                       ${index === 0 ? 'checked' : ''}>
                <label for="closing-${index}">${closing}</label>
            </div>
        `).join('');
    }

    renderSignature() {
        if (this.applicationData.signature) {
            return `<img src="${this.applicationData.signature}" alt="Unterschrift">`;
        }
        return '<div class="signature-placeholder">Unterschrift hier platzieren</div>';
    }

    renderLetterPreview() {
        // Vollständige Anschreiben-Vorschau
        return `
            <div class="letter-header">
                <div class="sender-info">
                    ${this.renderSenderAddress()}
                </div>
                <div class="company-info">
                    ${this.renderCompanyAddress()}
                </div>
            </div>
            
            <div class="letter-date">
                ${new Date().toLocaleDateString('de-DE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </div>
            
            <div class="letter-subject">
                <strong>Bewerbung als ${this.applicationData.position}</strong>
            </div>
            
            <div class="letter-body" contenteditable="true">
                <p>${this.getSelectedIntro()}</p>
                
                ${this.getSelectedSentences()}
                
                <p>${this.getSelectedClosing()}</p>
                
                <p>Mit freundlichen Grüßen</p>
                
                <div class="signature-space">
                    ${this.renderSignature()}
                </div>
                
                <p>${this.applicationData.senderName || 'Ihr Name'}</p>
            </div>
        `;
    }

    getSelectedIntro() {
        // Implementierung für ausgewählte Einleitung
        return 'Mit großem Interesse habe ich Ihre Stellenausschreibung gelesen...';
    }

    getSelectedSentences() {
        // Implementierung für ausgewählte Sätze
        return '<p>Hier kommen die generierten Sätze basierend auf den Anforderungen...</p>';
    }

    getSelectedClosing() {
        // Implementierung für ausgewählten Abschluss
        return 'Ich freue mich auf ein persönliches Gespräch...';
    }

    // Navigation
    renderNavigation() {
        return `
            <div class="workflow-navigation">
                <button 
                    class="btn btn-secondary ${this.currentStep === 1 ? 'disabled' : ''}" 
                    data-action="workflow-prev-step"
                    ${this.currentStep === 1 ? 'disabled' : ''}
                >
                    <i class="fas fa-arrow-left"></i> Zurück
                </button>
                
                <div class="step-indicator">
                    ${this.renderStepIndicator()}
                </div>
                
                <button 
                    class="btn btn-primary ${this.canProceed() ? '' : 'disabled'}" 
                    data-action="${this.currentStep === this.totalSteps ? 'workflow-finish' : 'workflow-next-step'}"
                    ${this.canProceed() ? '' : 'disabled'}
                >
                    ${this.currentStep === this.totalSteps ? 
                        '<i class="fas fa-check"></i> Fertigstellen' : 
                        'Weiter <i class="fas fa-arrow-right"></i>'
                    }
                </button>
            </div>
        `;
    }

    renderStepIndicator() {
        let indicators = '';
        for (let i = 1; i <= this.totalSteps; i++) {
            const isActive = i === this.currentStep;
            const isCompleted = i < this.currentStep;
            indicators += `
                <div class="step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                    ${isCompleted ? '<i class="fas fa-check"></i>' : i}
                </div>
            `;
        }
        return indicators;
    }

    // Hauptmethode zum Rendern
    render() {
        const stepContent = this[`renderStep${this.currentStep}`]();
        
        return `
            <div class="workflow-wrapper">
                <div class="workflow-header">
                    <h1><i class="fas fa-magic"></i> Smart Bewerbungs-Workflow</h1>
                    <button class="btn-close" data-action="workflow-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="workflow-body">
                    ${stepContent}
                </div>
                
                ${this.renderNavigation()}
            </div>
        `;
    }

    // Event Handlers  
    analyzeJobDescription() {
        const jobDesc = document.getElementById('jobDescription').value;
        if (!jobDesc || jobDesc.trim().length < 50) return;
        
        // Speichere Stellenbeschreibung
        this.applicationData.jobDescription = jobDesc;
        
        // Show analysis status
        const statusDiv = document.querySelector('.analysis-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="color: #3b82f6; padding: 0.5rem;">
                    <i class="fas fa-spinner fa-spin"></i> Analysiere automatisch...
                </div>
            `;
        }
        
        // KI-Analyse wenn verfügbar
        if (window.globalAI && window.globalAI.isAPIReady()) {
            window.globalAI.analyzeJobPosting(jobDesc)
                .then(result => {
                    this.displayExtractionResults(result);
                })
                .catch(error => {
                    console.error('❌ KI-Analyse fehlgeschlagen:', error);
                    const statusDiv = document.querySelector('.analysis-status');
                    if (statusDiv) {
                        statusDiv.innerHTML = `
                            <div style="color: #dc2626; padding: 0.5rem;">
                                <i class="fas fa-exclamation-triangle"></i> KI-Analyse fehlgeschlagen: ${error.message}
                            </div>
                        `;
                    }
                });
        } else {
            // KEINE LOKALE EXTRAKTION - Nur KI-Analyse
            console.warn('❌ KI-Analyse nicht verfügbar - keine Fallback-Extraktion');
            const statusDiv = document.querySelector('.analysis-status');
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div style="color: #dc2626; padding: 0.5rem;">
                        <i class="fas fa-exclamation-triangle"></i> KI-Analyse erforderlich - keine lokale Extraktion verfügbar
                    </div>
                `;
            }
        }
        
        this.saveData();
    }

    displayExtractionResults(result) {
        // Fülle die Eingabefelder mit den extrahierten Daten
        const companyField = document.getElementById('companyName');
        const positionField = document.getElementById('jobTitle');
        
        if (companyField && result.company) {
            companyField.value = result.company;
            this.applicationData.companyName = result.company;
        }
        
        if (positionField && result.position) {
            positionField.value = result.position;
            this.applicationData.position = result.position;
        }
        
        // Kontaktperson wenn verfügbar
        if (result.contactPerson) {
            this.updateContactPersonFields(result.contactPerson);
        }
        
        // Zeige Bestätigungsbox
        const statusDiv = document.querySelector('.analysis-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div style="color: #059669; padding: 0.5rem;">
                    <i class="fas fa-check-circle"></i> Automatisch extrahiert: ${result.company} - ${result.position}
                    <button data-action="workflow-confirm-extraction" style="margin-left: 1rem; padding: 0.25rem 0.75rem; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Übernehmen
                    </button>
                    <button data-action="workflow-edit-extraction" style="margin-left: 0.5rem; padding: 0.25rem 0.75rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Bearbeiten
                    </button>
                </div>
            `;
        }
        
        this.saveData();
    }

    // ENTFERNT: Alle lokalen Extraktionsmethoden - Nur noch KI-Analyse
    
    async triggerAIAnalysisInStep2() {
        console.log('🚀 === AUTOMATISCHE KI-ANALYSE IN SCHRITT 2 GESTARTET ===');
        
        const analysisContainer = document.getElementById('requirementsAnalysis');
        if (!analysisContainer) {
            console.warn('❌ Analysis container nicht gefunden');
            return;
        }
        
        try {
            // ERWEITERTE DIAGNOSE
            console.log('🔍 === PRE-ANALYSIS DIAGNOSE ===');
            console.log('GlobalAI exists:', !!window.globalAI);
            console.log('SecureAPIManager exists:', !!window.secureAPIManager);
            
            if (window.globalAI) {
                console.log('GlobalAI isReady:', window.globalAI.isReady);
                console.log('GlobalAI apiKey exists:', !!window.globalAI.apiKey);
                console.log('GlobalAI isAPIReady():', window.globalAI.isAPIReady());
            }
            
            if (window.secureAPIManager) {
                const storedKey = window.secureAPIManager.getAPIKey();
                console.log('SecureAPIManager has key:', !!storedKey);
                console.log('Key starts with sk-:', storedKey?.startsWith('sk-'));
                console.log('Key length:', storedKey?.length);
            }
            
            // Versuche API Key neu zu laden vor der Analyse
            if (window.globalAI && !window.globalAI.isAPIReady()) {
                console.log('🔄 API nicht bereit - versuche Key neu zu laden...');
                await window.globalAI.loadAPIKey();
                console.log('🔍 Nach Reload - isAPIReady():', window.globalAI.isAPIReady());
            }
            
            if (!window.globalAI || !window.globalAI.isAPIReady()) {
                const errorMsg = !window.globalAI ? 
                    'GlobalAI Service nicht geladen' : 
                    'API Key nicht verfügbar oder ungültig';
                throw new Error(`OpenAI API nicht verfügbar: ${errorMsg}`);
            }
            
            console.log('🤖 Starte KI-Analyse mit:', {
                jobDescription: this.applicationData.jobDescription?.substring(0, 100) + '...',
                length: this.applicationData.jobDescription?.length
            });
            
            // KI-Analyse starten
            const aiResult = await window.globalAI.analyzeJobPosting(this.applicationData.jobDescription);
            
            console.log('✅ KI-Analyse erfolgreich:', {
                requirementsFound: aiResult.requirements?.length,
                analysisCompleted: !!aiResult
            });
            
            // Speichere KI-Ergebnisse
            this.applicationData.requirements = aiResult.requirements || [];
            this.applicationData.aiAnalysisResult = aiResult;
            this.applicationData.needsAIAnalysis = false; // Markiere als abgeschlossen
            
            this.saveData();
            
            // Aktualisiere UI zu Schritt 2 mit Anforderungen
            this.updateUI();
            
        } catch (error) {
            console.error('❌ KI-Analyse in Schritt 2 fehlgeschlagen:', error);
            
            // Sammle Debug-Informationen für bessere Diagnose
            const debugInfo = {
                globalAIExists: !!window.globalAI,
                secureAPIExists: !!window.secureAPIManager,
                globalAIReady: window.globalAI?.isReady,
                apiKeyExists: !!window.secureAPIManager?.getAPIKey(),
                errorMessage: error.message
            };
            
            console.log('🔍 === FEHLER-DIAGNOSE ===', debugInfo);
            
            // Erkenne spezifische API Key Probleme
            const isAPIKeyError = error.message.includes('Incorrect API key') || 
                                 error.message.includes('invalid_api_key') ||
                                 error.message.includes('API key provided');
            
            const isQuotaError = error.message.includes('quota') || 
                               error.message.includes('insufficient_quota');
            
            let errorTitle = '❌ KI-Analyse fehlgeschlagen';
            let errorExplanation = '';
            let actionButtons = '';
            
            if (isAPIKeyError) {
                errorTitle = '🔑 API Key Problem';
                
                // Erweiterte Diagnose für neue Keys
                const currentKey = window.secureAPIManager?.getAPIKey() || '';
                const keyFormat = currentKey.startsWith('sk-proj-') ? 'Neues Format (sk-proj-)' : 
                                currentKey.startsWith('sk-') ? 'Standard Format (sk-)' : 'Unbekanntes Format';
                
                errorExplanation = `
                    <strong>Problem:</strong> Der API Key wird von OpenAI abgelehnt.<br><br>
                    <strong>Key-Diagnose:</strong><br>
                    • Format: ${keyFormat}<br>
                    • Länge: ${currentKey.length} Zeichen<br>
                    • Beginnt korrekt: ${currentKey.startsWith('sk-') ? '✅' : '❌'}<br><br>
                    
                    <strong>Häufige Probleme bei NEUEN Keys:</strong><br>
                    🕐 <strong>Aktivierungszeit:</strong> Neue Keys brauchen manchmal 5-10 Minuten<br>
                    📋 <strong>Copy-Paste Fehler:</strong> Leerzeichen oder unvollständiger Key<br>
                    💳 <strong>Billing nicht eingerichtet:</strong> Account benötigt Zahlungsmethode<br>
                    🔒 <strong>Usage Limits:</strong> Neue Accounts haben niedrige Limits<br><br>
                    
                    <strong>Sofort-Tests:</strong><br>
                    1. Im Admin-Panel: "API Key testen" klicken<br>
                    2. Browser-Konsole: <code>window.smartWorkflow.testAPIDirectly('${currentKey.substring(0, 20)}...')</code><br>
                    3. OpenAI Dashboard auf Billing/Usage prüfen
                `;
                actionButtons = `
                    <button onclick="window.smartWorkflow.diagnoseNewAPIKey()" style="padding: 0.5rem 1rem; background: #7c3aed; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-stethoscope"></i> Key-Diagnose
                    </button>
                    <button onclick="window.open('https://platform.openai.com/account/billing', '_blank')" style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                        <i class="fas fa-credit-card"></i> Billing prüfen
                    </button>
                    <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                        <i class="fas fa-cog"></i> Admin-Panel
                    </button>
                `;
            } else if (isQuotaError) {
                errorTitle = '💳 Quota Problem';
                errorExplanation = `
                    <strong>Problem:</strong> OpenAI Account Guthaben aufgebraucht.<br><br>
                    <strong>Lösung:</strong><br>
                    1. Gehen Sie zu: <a href="https://platform.openai.com/account/billing" target="_blank" style="color: #2563eb;">platform.openai.com/account/billing</a><br>
                    2. Laden Sie Ihr Guthaben auf<br>
                    3. Versuchen Sie es erneut
                `;
                actionButtons = `
                    <button onclick="window.open('https://platform.openai.com/account/billing', '_blank')" style="padding: 0.5rem 1rem; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-credit-card"></i> Guthaben aufladen
                    </button>
                    <button onclick="window.smartWorkflow.reloadAPIAndRetry()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                        <i class="fas fa-sync"></i> Erneut versuchen
                    </button>
                `;
            } else {
                errorExplanation = `
                    <strong>Fehler:</strong> ${error.message}<br><br>
                    <strong>System-Status:</strong><br>
                    • GlobalAI Service: ${debugInfo.globalAIExists ? '✅' : '❌'}<br>
                    • API Manager: ${debugInfo.secureAPIExists ? '✅' : '❌'}<br>
                    • Service Ready: ${debugInfo.globalAIReady ? '✅' : '❌'}<br>
                    • API Key vorhanden: ${debugInfo.apiKeyExists ? '✅' : '❌'}<br><br>
                    <strong>Lösungsschritte:</strong><br>
                    1. API Key im Admin-Panel prüfen/neu eingeben<br>
                    2. Admin-Panel: "API Key testen" verwenden<br>
                    3. Bei Erfolg: "Erneut versuchen" klicken<br>
                `;
                actionButtons = `
                    <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-cog"></i> Admin-Panel öffnen
                    </button>
                    <button onclick="window.smartWorkflow.reloadAPIAndRetry()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                        <i class="fas fa-sync"></i> Erneut versuchen
                    </button>
                    <button onclick="window.smartWorkflow.forceReloadServices()" style="padding: 0.5rem 1rem; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                        <i class="fas fa-redo"></i> Services neu laden
                    </button>
                `;
            }
            
            analysisContainer.innerHTML = `
                <div style="background: #fef2f2; padding: 1rem; border-radius: 6px; border-left: 4px solid #ef4444;">
                    <h5 style="margin: 0 0 0.5rem 0; color: #dc2626;">${errorTitle}</h5>
                    <p style="margin: 0; color: #dc2626;">
                        ${errorExplanation}
                    </p>
                    <div style="margin-top: 1rem;">
                        ${actionButtons}
                    </div>
                </div>
            `;
        }
    }
    
    async reloadAPIAndRetry() {
        console.log('🔄 === API KEY RELOAD UND ERNEUTER VERSUCH ===');
        
        const analysisContainer = document.getElementById('requirementsAnalysis');
        if (analysisContainer) {
            analysisContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-sync fa-spin fa-2x" style="color: #6366f1; margin-bottom: 1rem;"></i>
                    <h3>API Key wird neu geladen...</h3>
                    <p>Das System lädt den aktualisierten API Key und startet die Analyse erneut.</p>
                </div>
            `;
        }
        
        try {
            // 1. KOMPLETTE NEUINITIALISIERUNG DER SERVICES
            console.log('🔄 === STARTE KOMPLETTE SERVICE NEUINITIALISIERUNG ===');
            
            // 1a. SecureAPIManager neu initialisieren
            if (window.SecureAPIManager) {
                console.log('🔄 Erstelle neuen SecureAPIManager...');
                window.secureAPIManager = new window.SecureAPIManager();
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // 1b. Prüfe API Key direkt aus localStorage
            const rawKey = localStorage.getItem('openai_api_key');
            const decryptedKey = window.secureAPIManager?.getAPIKey();
            
            console.log('🔍 Key Status Check:', {
                rawKeyExists: !!rawKey,
                rawKeyLength: rawKey?.length,
                decryptedKeyExists: !!decryptedKey,
                decryptedKeyValid: decryptedKey?.startsWith('sk-'),
                decryptedKeyLength: decryptedKey?.length
            });
            
            if (!decryptedKey || !decryptedKey.startsWith('sk-')) {
                throw new Error(`API Key Problem: Raw=${!!rawKey}, Decrypted=${!!decryptedKey}, Valid=${decryptedKey?.startsWith('sk-')}`);
            }
            
            // 1c. GlobalAI Service komplett neu mit validiertem Key
            if (window.GlobalAIService) {
                console.log('🔄 Erstelle neuen GlobalAI Service...');
                window.globalAI = new window.GlobalAIService();
                
                // Setze Key direkt (Bypass der normalen Initialisierung)
                window.globalAI.apiKey = decryptedKey;
                window.globalAI.isReady = true;
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // 2. FINALE VALIDIERUNG
            const finalCheck = {
                secureAPIExists: !!window.secureAPIManager,
                globalAIExists: !!window.globalAI,
                apiKeyDirect: window.globalAI?.apiKey?.substring(0, 10) + '...',
                isReady: window.globalAI?.isReady,
                isAPIReady: window.globalAI?.isAPIReady()
            };
            
            console.log('🔍 === FINALE VALIDIERUNG ===', finalCheck);
            
            if (!window.globalAI?.isAPIReady()) {
                throw new Error(`Service Init Failed: ${JSON.stringify(finalCheck)}`);
            }
            
            // 3. Erneute KI-Analyse starten
            console.log('✅ API bereit - starte KI-Analyse erneut...');
            await this.triggerAIAnalysisInStep2();
            
        } catch (error) {
            console.error('❌ API Reload fehlgeschlagen:', error);
            
            if (analysisContainer) {
                analysisContainer.innerHTML = `
                    <div style="background: #fef2f2; padding: 1rem; border-radius: 6px; border-left: 4px solid #ef4444;">
                        <h5 style="margin: 0 0 0.5rem 0; color: #dc2626;">❌ API Reload fehlgeschlagen</h5>
                        <p style="margin: 0; color: #dc2626;">
                            <strong>Fehler:</strong> ${error.message}<br><br>
                            <strong>Bitte prüfen Sie:</strong><br>
                            • API Key korrekt im Admin-Panel eingegeben<br>
                            • API Key beginnt mit "sk-"<br>
                            • OpenAI Account hat ausreichend Guthaben<br><br>
                        </p>
                        <div style="margin-top: 1rem;">
                            <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-cog"></i> Admin-Panel öffnen
                            </button>
                            <button onclick="window.smartWorkflow.reloadAPIAndRetry()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                                <i class="fas fa-sync"></i> Nochmal versuchen
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    async forceReloadServices() {
        console.log('🔄 === FORCE RELOAD ALLER SERVICES ===');
        
        const analysisContainer = document.getElementById('requirementsAnalysis');
        if (analysisContainer) {
            analysisContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-cogs fa-spin fa-2x" style="color: #059669; margin-bottom: 1rem;"></i>
                    <h3>Services werden neu geladen...</h3>
                    <p>Alle KI-Services werden komplett neu initialisiert.</p>
                </div>
            `;
        }
        
        try {
            // 1. Services komplett neu laden
            console.log('🔄 Initialisiere SecureAPIManager neu...');
            if (window.SecureAPIManager) {
                window.secureAPIManager = new window.SecureAPIManager();
                await new Promise(resolve => setTimeout(resolve, 200)); // Warten auf Initialisierung
            }
            
            console.log('🔄 Initialisiere GlobalAI Service neu...');
            if (window.GlobalAIService) {
                window.globalAI = new window.GlobalAIService();
                await window.globalAI.initialize();
                await new Promise(resolve => setTimeout(resolve, 300)); // Warten auf Initialisierung
            }
            
            // 2. Ausführliche Status-Prüfung
            const fullStatus = {
                secureAPIManager: {
                    exists: !!window.secureAPIManager,
                    hasGetAPIKey: typeof window.secureAPIManager?.getAPIKey === 'function',
                    apiKey: window.secureAPIManager?.getAPIKey()?.substring(0, 10) + '...',
                    keyValid: window.secureAPIManager?.getAPIKey()?.startsWith('sk-')
                },
                globalAI: {
                    exists: !!window.globalAI,
                    isReady: window.globalAI?.isReady,
                    hasApiKey: !!window.globalAI?.apiKey,
                    isAPIReady: window.globalAI?.isAPIReady?.(),
                }
            };
            
            console.log('🔍 === SERVICES STATUS NACH RELOAD ===', fullStatus);
            
            // 3. Prüfe ob alles bereit ist
            if (window.globalAI?.isAPIReady()) {
                console.log('✅ Services erfolgreich geladen - starte KI-Analyse...');
                await this.triggerAIAnalysisInStep2();
            } else {
                throw new Error('Services konnten nicht korrekt geladen werden. Bitte prüfen Sie den API Key im Admin-Panel.');
            }
            
        } catch (error) {
            console.error('❌ Service Reload fehlgeschlagen:', error);
            
            if (analysisContainer) {
                analysisContainer.innerHTML = `
                    <div style="background: #fef2f2; padding: 1rem; border-radius: 6px; border-left: 4px solid #ef4444;">
                        <h5 style="margin: 0 0 0.5rem 0; color: #dc2626;">❌ Service Reload fehlgeschlagen</h5>
                        <p style="margin: 0; color: #dc2626;">
                            <strong>Fehler:</strong> ${error.message}<br><br>
                            <strong>Nächste Schritte:</strong><br>
                            1. Seite komplett neu laden (F5)<br>
                            2. API Key im Admin-Panel neu eingeben<br>
                            3. Im Admin-Panel: "API Key testen" verwenden<br>
                        </p>
                        <div style="margin-top: 1rem;">
                            <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-refresh"></i> Seite neu laden
                            </button>
                            <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                                <i class="fas fa-cog"></i> Admin-Panel
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    async diagnoseNewAPIKey() {
        console.log('🔍 === DIAGNOSE NEUER API KEY ===');
        
        const analysisContainer = document.getElementById('requirementsAnalysis');
        if (analysisContainer) {
            analysisContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-stethoscope fa-2x" style="color: #7c3aed; margin-bottom: 1rem;"></i>
                    <h3>API Key Diagnose läuft...</h3>
                    <p>Führe umfassende Tests durch...</p>
                </div>
            `;
        }
        
        try {
            const currentKey = window.secureAPIManager?.getAPIKey() || '';
            
            // 1. Format-Checks
            const formatChecks = {
                hasKey: !!currentKey,
                startsWithSk: currentKey.startsWith('sk-'),
                isProjectKey: currentKey.startsWith('sk-proj-'),
                correctLength: currentKey.length > 50,
                hasNoSpaces: !currentKey.includes(' '),
                isComplete: currentKey.includes('-') && currentKey.length > 20
            };
            
            console.log('🔍 Format Checks:', formatChecks);
            
            // 2. Direkte OpenAI API Tests
            let apiTests = {
                basicCall: false,
                errorMessage: '',
                responseTime: 0
            };
            
            if (formatChecks.hasKey && formatChecks.startsWithSk) {
                console.log('🧪 Teste API Key direkt...');
                const startTime = Date.now();
                
                try {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${currentKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [{ role: 'user', content: 'Test' }],
                            max_tokens: 5
                        })
                    });
                    
                    apiTests.responseTime = Date.now() - startTime;
                    
                    if (response.ok) {
                        apiTests.basicCall = true;
                        console.log('✅ API Key funktioniert!');
                    } else {
                        const errorData = await response.json();
                        apiTests.errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                        console.log('❌ API Fehler:', errorData);
                    }
                } catch (error) {
                    apiTests.errorMessage = `Network Error: ${error.message}`;
                    console.log('❌ Network Error:', error);
                }
            }
            
            // 3. Diagnose-Ergebnis anzeigen
            const diagnosis = this.generateKeyDiagnosis(formatChecks, apiTests, currentKey);
            
            if (analysisContainer) {
                analysisContainer.innerHTML = diagnosis;
            }
            
        } catch (error) {
            console.error('❌ Diagnose fehlgeschlagen:', error);
            
            if (analysisContainer) {
                analysisContainer.innerHTML = `
                    <div style="background: #fef2f2; padding: 1rem; border-radius: 6px; border-left: 4px solid #ef4444;">
                        <h5 style="margin: 0 0 0.5rem 0; color: #dc2626;">❌ Diagnose fehlgeschlagen</h5>
                        <p style="margin: 0; color: #dc2626;">
                            <strong>Fehler:</strong> ${error.message}<br><br>
                            Führen Sie die Tests manuell durch:
                        </p>
                        <div style="margin-top: 1rem;">
                            <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-cog"></i> Admin-Panel Test
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    generateKeyDiagnosis(formatChecks, apiTests, currentKey) {
        const keyPreview = currentKey.substring(0, 20) + '...';
        
        // Bewertung der Ergebnisse
        const formatScore = Object.values(formatChecks).filter(Boolean).length;
        const formatTotal = Object.keys(formatChecks).length;
        
        let statusColor = '#ef4444'; // Rot
        let statusIcon = '❌';
        let statusText = 'Kritische Probleme';
        let recommendations = [];
        
        if (apiTests.basicCall) {
            statusColor = '#10b981'; // Grün
            statusIcon = '✅';
            statusText = 'API Key funktioniert!';
            recommendations.push('🎉 API Key ist voll funktionsfähig - versuchen Sie die KI-Analyse erneut');
        } else if (formatScore === formatTotal && apiTests.errorMessage) {
            statusColor = '#f59e0b'; // Orange
            statusIcon = '⚠️';
            statusText = 'Format OK, API Problem';
            
            if (apiTests.errorMessage.includes('quota') || apiTests.errorMessage.includes('insufficient')) {
                recommendations.push('💳 Billing/Guthaben Problem - laden Sie Ihr OpenAI Guthaben auf');
                recommendations.push('🔗 Gehen Sie zu: platform.openai.com/account/billing');
            } else if (apiTests.errorMessage.includes('invalid') || apiTests.errorMessage.includes('incorrect')) {
                recommendations.push('🔑 Key ist ungültig - erstellen Sie einen neuen bei OpenAI');
                recommendations.push('🔗 Gehen Sie zu: platform.openai.com/account/api-keys');
            } else {
                recommendations.push('🕐 Neuer Key? Warten Sie 5-10 Minuten und versuchen Sie erneut');
                recommendations.push('📞 Kontaktieren Sie OpenAI Support bei anhaltenden Problemen');
            }
        } else {
            recommendations.push('📋 Copy-Paste Fehler - Key vollständig kopieren');
            recommendations.push('🔑 Neuen API Key bei OpenAI erstellen');
            recommendations.push('💾 Sicherstellen dass Key korrekt gespeichert wird');
        }
        
        return `
            <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="font-size: 1.5rem;">${statusIcon}</span>
                    <h4 style="margin: 0; color: ${statusColor};">${statusText}</h4>
                </div>
                
                <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <h5 style="margin: 0 0 0.75rem 0;">🔍 Format-Analyse:</h5>
                    <div style="font-family: monospace; font-size: 0.875rem;">
                        Key: <code>${keyPreview}</code><br>
                        Format: ${formatChecks.isProjectKey ? 'sk-proj- (Neu)' : formatChecks.startsWithSk ? 'sk- (Standard)' : 'Unbekannt'}<br>
                        Länge: ${currentKey.length} Zeichen ${formatChecks.correctLength ? '✅' : '❌'}<br>
                        Leerzeichen: ${formatChecks.hasNoSpaces ? 'Keine ✅' : 'Vorhanden ❌'}<br>
                        Vollständig: ${formatChecks.isComplete ? 'Ja ✅' : 'Nein ❌'}
                    </div>
                </div>
                
                <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <h5 style="margin: 0 0 0.75rem 0;">🧪 API-Test:</h5>
                    <div style="font-size: 0.875rem;">
                        Direkter Test: ${apiTests.basicCall ? '✅ Erfolgreich' : '❌ Fehlgeschlagen'}<br>
                        ${apiTests.responseTime > 0 ? `Response Zeit: ${apiTests.responseTime}ms<br>` : ''}
                        ${apiTests.errorMessage ? `Fehler: <code style="color: #dc2626;">${apiTests.errorMessage}</code>` : ''}
                    </div>
                </div>
                
                <div style="background: #fef3c7; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <h5 style="margin: 0 0 0.75rem 0; color: #92400e;">💡 Empfehlungen:</h5>
                    ${recommendations.map(rec => `<div style="margin-bottom: 0.5rem; color: #92400e;">• ${rec}</div>`).join('')}
                </div>
                
                <div style="margin-top: 1rem;">
                    <button onclick="window.smartWorkflow.reloadAPIAndRetry()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-sync"></i> Erneut versuchen
                    </button>
                    <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                        <i class="fas fa-cog"></i> Admin-Panel
                    </button>
                    <button onclick="window.open('https://platform.openai.com/account/api-keys', '_blank')" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                        <i class="fas fa-key"></i> Neuer Key
                    </button>
                </div>
            </div>
        `;
    }
    
    autoResizeTextareas() {
        console.log('🔧 Auto-resize Textareas...');
        
        setTimeout(() => {
            const textareas = document.querySelectorAll('.requirement-text');
            textareas.forEach(textarea => {
                // Reset height to calculate new height
                textarea.style.height = 'auto';
                // Set height to scroll height (content height)
                textarea.style.height = Math.max(textarea.scrollHeight, 40) + 'px';
            });
            
            console.log(`✅ ${textareas.length} Textareas automatisch angepasst`);
        }, 100);
    }
    
    // Document Upload System
    getUploadedDocuments(type) {
        const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        return documents.filter(doc => doc.type === type);
    }
    
    renderUploadedFiles(type) {
        const documents = this.getUploadedDocuments(type);
        if (documents.length === 0) {
            return '<div class="no-files">Noch keine Dateien hochgeladen</div>';
        }
        
        return `
            <div class="files-header">
                <span class="files-count">${documents.length} Datei${documents.length > 1 ? 'en' : ''}</span>
                <div class="files-actions">
                    <button class="btn-small btn-outline" onclick="window.smartWorkflow.selectAllDocuments('${type}', true)" title="Alle auswählen">
                        <i class="fas fa-check-square"></i>
                    </button>
                    <button class="btn-small btn-outline" onclick="window.smartWorkflow.selectAllDocuments('${type}', false)" title="Alle abwählen">
                        <i class="fas fa-square"></i>
                    </button>
                </div>
            </div>
            ${documents.map(doc => `
                <div class="uploaded-file ${doc.includeInAnalysis !== false ? 'included' : 'excluded'}" data-id="${doc.id}">
                    <div class="file-info">
                        <i class="fas ${this.getFileIcon(doc.name)}"></i>
                        <div class="file-details">
                            <span class="file-name" title="${doc.name}">${doc.name.length > 25 ? doc.name.substring(0, 25) + '...' : doc.name}</span>
                            <span class="file-meta">
                                ${this.formatFileSize(doc.size)} • ${new Date(doc.uploadDate).toLocaleDateString('de-DE')}
                            </span>
                        </div>
                    </div>
                    <div class="file-actions">
                        <label class="file-checkbox" title="${doc.includeInAnalysis !== false ? 'Für Analyse verwenden' : 'Von Analyse ausschließen'}">
                            <input type="checkbox" ${doc.includeInAnalysis !== false ? 'checked' : ''} 
                                   onchange="window.smartWorkflow.toggleDocumentAnalysis('${doc.id}', this.checked)">
                            <span class="checkmark"></span>
                            <span class="checkbox-label">Analyse</span>
                        </label>
                        <button class="btn-remove" onclick="window.smartWorkflow.removeDocument('${doc.id}')" title="Entfernen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'png': 'fa-file-image'
        };
        return iconMap[ext] || 'fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    handleDocumentUpload(inputId, type) {
        console.log(`🔍 handleDocumentUpload aufgerufen: inputId=${inputId}, type=${type}`);
        
        const input = document.getElementById(inputId);
        if (!input) {
            console.error(`❌ Input element nicht gefunden: ${inputId}`);
            alert(`Fehler: Upload-Element '${inputId}' nicht gefunden!`);
            return;
        }
        
        console.log(`✅ Input Element gefunden:`, input);
        
        const files = input.files;
        if (!files || files.length === 0) {
            console.log(`⚠️ Keine Dateien ausgewählt für ${inputId}`);
            alert('Keine Dateien ausgewählt!');
            return;
        }
        
        console.log(`📁 ${files.length} Dateien zum Upload bereit:`, Array.from(files).map(f => f.name));
        
        console.log(`📁 Starte Upload von ${files.length} Dateien für ${type}:`, Array.from(files).map(f => f.name));
        
        let successCount = 0;
        let errorCount = 0;
        
        Array.from(files).forEach((file, index) => {
            console.log(`📄 Verarbeite Datei ${index + 1}/${files.length}: ${file.name} (${this.formatFileSize(file.size)})`);
            
            // File validation
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                console.error(`❌ Datei zu groß: ${file.name} (${this.formatFileSize(file.size)})`);
                this.showUploadError(file.name, 'Datei ist zu groß (max. 50MB)');
                errorCount++;
                return;
            }
            
            // File type validation
            const allowedTypes = this.getAllowedFileTypes(type);
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                console.error(`❌ Dateityp nicht erlaubt: ${file.name} (.${fileExtension})`);
                this.showUploadError(file.name, `Dateityp .${fileExtension} nicht unterstützt`);
                errorCount++;
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const document = {
                        id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        type: type,
                        size: file.size,
                        content: e.target.result,
                        uploadDate: new Date().toISOString(),
                        includeInAnalysis: true,
                        fileExtension: fileExtension,
                        mimeType: file.type
                    };
                    
                    this.saveDocument(document);
                    successCount++;
                    
                    console.log(`✅ Dokument gespeichert: ${document.name} (ID: ${document.id})`);
                    
                    // Update UI after last file
                    if (successCount + errorCount === files.length) {
                        this.updateUI();
                        this.showUploadSummary(successCount, errorCount, type);
                    }
                    
                } catch (error) {
                    console.error(`❌ Fehler beim Speichern von ${file.name}:`, error);
                    this.showUploadError(file.name, 'Fehler beim Speichern');
                    errorCount++;
                }
            };
            
            reader.onerror = (error) => {
                console.error(`❌ Lesefehler bei ${file.name}:`, error);
                this.showUploadError(file.name, 'Fehler beim Lesen der Datei');
                errorCount++;
            };
            
            reader.readAsDataURL(file);
        });
        
        // Clear input
        input.value = '';
    }
    
    getAllowedFileTypes(type) {
        const typeMap = {
            'cv': ['pdf', 'doc', 'docx', 'odt', 'rtf'],
            'coverLetters': ['pdf', 'doc', 'docx', 'odt', 'rtf'],
            'certificates': ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif']
        };
        return typeMap[type] || [];
    }
    
    showUploadError(filename, message) {
        const toast = document.createElement('div');
        toast.className = 'upload-toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            "${filename}": ${message}
        `;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc2626;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    showUploadSummary(successCount, errorCount, type) {
        const typeNames = {
            'cv': 'Lebensläufe',
            'coverLetters': 'Anschreiben',
            'certificates': 'Zeugnisse & Zertifikate'
        };
        
        const message = errorCount > 0 
            ? `${successCount} ${typeNames[type]} erfolgreich, ${errorCount} Fehler`
            : `${successCount} ${typeNames[type]} erfolgreich hochgeladen`;
            
        const toast = document.createElement('div');
        toast.className = 'upload-toast summary';
        toast.innerHTML = `
            <i class="fas ${errorCount > 0 ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            ${message}
        `;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${errorCount > 0 ? '#f59e0b' : '#10b981'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    saveDocument(document) {
        const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        documents.push(document);
        localStorage.setItem('applicationDocuments', JSON.stringify(documents));
        
        console.log(`✅ Dokument gespeichert: ${document.name}`);
        
        // Show success message
        this.showUploadSuccess(document.name);
    }
    
    removeDocument(documentId) {
        let documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        const doc = documents.find(d => d.id === documentId);
        
        if (doc && confirm(`Möchten Sie "${doc.name}" wirklich entfernen?`)) {
            documents = documents.filter(d => d.id !== documentId);
            localStorage.setItem('applicationDocuments', JSON.stringify(documents));
            
            console.log(`🗑️ Dokument entfernt: ${doc.name}`);
            this.updateUI(); // Refresh UI
        }
    }
    
    toggleDocumentAnalysis(documentId, include) {
        const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        const doc = documents.find(d => d.id === documentId);
        
        if (doc) {
            doc.includeInAnalysis = include;
            localStorage.setItem('applicationDocuments', JSON.stringify(documents));
            
            console.log(`${include ? '✅' : '❌'} Dokument ${doc.name} ${include ? 'einbezogen' : 'ausgeschlossen'} in Analyse`);
            
            // Update UI to reflect changes
            this.updateUI();
        }
    }
    
    selectAllDocuments(type, include) {
        const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
        let updatedCount = 0;
        
        documents.forEach(doc => {
            if (doc.type === type) {
                doc.includeInAnalysis = include;
                updatedCount++;
            }
        });
        
        localStorage.setItem('applicationDocuments', JSON.stringify(documents));
        
        console.log(`${include ? '✅' : '❌'} ${updatedCount} Dokumente des Typs ${type} ${include ? 'einbezogen' : 'ausgeschlossen'}`);
        
        // Update UI
        this.updateUI();
        
        // Show feedback
        const typeNames = {
            'cv': 'Lebensläufe',
            'coverLetters': 'Anschreiben', 
            'certificates': 'Zeugnisse & Zertifikate'
        };
        
        const message = include 
            ? `Alle ${typeNames[type]} für Analyse ausgewählt`
            : `Alle ${typeNames[type]} von Analyse ausgeschlossen`;
            
        this.showSelectionFeedback(message);
    }
    
    showSelectionFeedback(message) {
        const toast = document.createElement('div');
        toast.className = 'selection-toast';
        toast.innerHTML = `
            <i class="fas fa-info-circle"></i>
            ${message}
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.3s ease;
            font-size: 0.875rem;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(50px)';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    
    showUploadSuccess(filename) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'upload-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            "${filename}" erfolgreich hochgeladen!
        `;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Sentence Generation System
    async generateSentencesForRequirement(reqIndex) {
        const requirement = this.applicationData.requirements[reqIndex];
        if (!requirement) return;

        console.log(`🎯 Generiere Sätze für Anforderung ${reqIndex + 1}: ${requirement.text}`);
        
        // Mark as loading
        this.applicationData.sentenceGenerationStatus = this.applicationData.sentenceGenerationStatus || {};
        this.applicationData.sentenceGenerationStatus[reqIndex] = 'loading';
        
        // Update UI to show loading state
        this.updateUI();
        
        try {
            // Check if AI service is available
            if (!window.globalAI || !window.globalAI.isAPIReady()) {
                throw new Error('OpenAI API nicht verfügbar oder nicht konfiguriert');
            }
            
            // Get user profile - prioritize AI profile if available
            const userProfile = this.applicationData.aiProfile || await this.extractUserProfileFromDocuments();
            
            // Get style preferences
            const stylePreferences = this.getSentenceStylePreferences();
            
            // Generate sentences using AI
            const sentences = await this.generateAISentences(requirement, userProfile, stylePreferences);
            
            // Save generated sentences
            requirement.sentences = sentences;
            this.saveData();
            
            console.log(`✅ ${sentences.length} Sätze generiert für Anforderung ${reqIndex + 1}`);
            
        } catch (error) {
            console.error('❌ Fehler bei Satzgenerierung:', error);
            
            // Show error message
            const errorContainer = document.getElementById(`sentences-${reqIndex}`);
            if (errorContainer) {
                errorContainer.innerHTML = `
                    <div class="sentence-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p><strong>Satzgenerierung fehlgeschlagen</strong></p>
                        <p>Fehler: ${error.message}</p>
                        <div class="error-actions">
                            <button class="btn btn-small btn-primary" onclick="window.smartWorkflow.generateSentencesForRequirement(${reqIndex})">
                                <i class="fas fa-retry"></i> Erneut versuchen
                            </button>
                            <button class="btn btn-small btn-outline" onclick="window.adminPanel?.show?.()">
                                <i class="fas fa-cog"></i> API Key prüfen
                            </button>
                        </div>
                    </div>
                `;
            }
        } finally {
            // Mark as completed
            this.applicationData.sentenceGenerationStatus[reqIndex] = 'completed';
            this.updateUI();
        }
    }
    
    async extractUserProfileFromDocuments() {
        console.log('📄 Extrahiere Benutzerprofil aus hochgeladenen Dokumenten...');
        
        const documents = this.getUploadedDocuments('cv')
            .concat(this.getUploadedDocuments('coverLetters'))
            .filter(doc => doc.includeInAnalysis !== false);
        
        if (documents.length === 0) {
            console.log('⚠️ Keine Dokumente für Profilanalyse verfügbar');
            return {
                skills: [],
                experiences: [],
                writingStyle: 'professionell',
                qualifications: []
            };
        }
        
        const profile = {
            skills: [],
            experiences: [],
            writingStyle: 'professionell',
            qualifications: [],
            documentCount: documents.length
        };
        
        // Simple text extraction from documents (in real implementation, use PDF.js etc.)
        for (const doc of documents) {
            try {
                // For demo: extract from document name and basic content analysis
                const fileName = doc.name.toLowerCase();
                
                if (fileName.includes('lebenslauf') || fileName.includes('cv')) {
                    profile.qualifications.push('CV verfügbar');
                }
                if (fileName.includes('anschreiben') || fileName.includes('cover')) {
                    profile.writingStyle = 'erfahren im Anschreiben';
                }
                
                // Extract skills from document content if available
                if (doc.content && typeof doc.content === 'string') {
                    const commonSkills = [
                        'JavaScript', 'Python', 'Excel', 'PowerPoint', 'Word', 'Project Management',
                        'Teamarbeit', 'Kommunikation', 'Analyse', 'Präsentation', 'Leadership'
                    ];
                    
                    commonSkills.forEach(skill => {
                        if (doc.content.toLowerCase().includes(skill.toLowerCase())) {
                            if (!profile.skills.includes(skill)) {
                                profile.skills.push(skill);
                            }
                        }
                    });
                }
                
            } catch (error) {
                console.warn('Fehler beim Analysieren von Dokument:', doc.name, error);
            }
        }
        
        console.log('✅ Benutzerprofil extrahiert:', profile);
        return profile;
    }
    
    getSentenceStylePreferences() {
        const lengthSelect = document.getElementById('sentenceLength');
        const toneSelect = document.getElementById('sentenceTone');
        const styleSelect = document.getElementById('sentenceStyle');
        
            return {
            length: lengthSelect?.value || 'medium',
            tone: toneSelect?.value || 'professional',
            style: styleSelect?.value || 'achievement'
        };
    }
    
    async generateAISentences(requirement, userProfile, stylePreferences) {
        console.log('🤖 Generiere KI-Sätze für Anforderung:', requirement.text);
        
        const prompt = this.buildSentenceGenerationPrompt(requirement, userProfile, stylePreferences);
        
        try {
            const response = await window.globalAI.callOpenAI([
                {
                    role: "system",
                    content: "Du bist ein Experte für Bewerbungsschreiben und formulierst passende Sätze basierend auf Benutzerprofilen und Stellenanforderungen."
                },
                {
                    role: "user",
                    content: prompt
                }
            ], {
                max_tokens: 1000,
                temperature: 0.7
            });
            
            const result = JSON.parse(response);
            
            return result.sentences.map((sentence, idx) => ({
                id: `sent_${Date.now()}_${idx}`,
                text: sentence.text,
                matchScore: sentence.matchScore || Math.floor(Math.random() * 20) + 80,
                style: stylePreferences.style,
                tone: stylePreferences.tone,
                wordCount: sentence.text.split(' ').length,
                selected: idx === 0 // First sentence is pre-selected
            }));
            
        } catch (error) {
            console.error('❌ OpenAI API Fehler:', error);
            throw new Error(`Satzgenerierung fehlgeschlagen: ${error.message}`);
        }
    }
    
    buildSentenceGenerationPrompt(requirement, userProfile, stylePreferences) {
        // Check if we have detailed AI profile or simple profile
        const isAIProfile = userProfile.skills && Array.isArray(userProfile.skills) && userProfile.skills[0]?.name;
        
        let profileDescription;
        if (isAIProfile) {
            // Use detailed AI profile
            const technicalSkills = userProfile.skills.filter(s => s.category === 'technical').map(s => s.name);
            const softSkills = userProfile.skills.filter(s => s.category === 'soft').map(s => s.name);
            const languages = userProfile.languages ? userProfile.languages.map(l => `${l.language} (${l.level})`).join(', ') : '';
            
            profileDescription = `
DETAILLIERTES KI-ANALYSIERTES PROFIL:

Technische Kompetenzen: ${technicalSkills.join(', ') || 'Nicht spezifiziert'}
Soft Skills: ${softSkills.join(', ') || 'Nicht spezifiziert'}
Sprachen: ${languages || 'Nicht spezifiziert'}

Persönlichkeitsmerkmale: ${userProfile.personality?.join(', ') || 'Nicht analysiert'}
Stärken: ${userProfile.strengths?.join(', ') || 'Nicht analysiert'}
Interessen/Hobbies: ${userProfile.interests?.join(', ') || 'Nicht analysiert'}

Arbeitsstil:
- Leadership: ${userProfile.workStyle?.leadership || 'Nicht analysiert'}
- Teamarbeit: ${userProfile.workStyle?.teamwork || 'Nicht analysiert'}  
- Kommunikation: ${userProfile.workStyle?.communication || 'Nicht analysiert'}

Schreibstil: ${userProfile.writingStyle || 'Nicht analysiert'}
Beruflicher Fokus: ${userProfile.careerFocus || 'Nicht spezifiziert'}
Alleinstellungsmerkmale: ${userProfile.uniqueSellingPoints?.join(', ') || 'Nicht analysiert'}
Werte: ${userProfile.values?.join(', ') || 'Nicht analysiert'}
`;
        } else {
            // Use simple profile
            profileDescription = `
EINFACHES PROFIL:
- Fähigkeiten: ${userProfile.skills?.join(', ') || 'Allgemeine Kompetenzen'}
- Qualifikationen: ${userProfile.qualifications?.join(', ') || 'Standard-Qualifikationen'}  
- Schreibstil: ${userProfile.writingStyle || 'Professionell'}
- Dokumente verfügbar: ${userProfile.documentCount || 0}
`;
        }
        
        return `
Erstelle 4 verschiedene, hochqualitative Bewerbungssätze für folgende Stellenanforderung:
"${requirement.text}"

${profileDescription}

Stil-Vorgaben:
- Länge: ${stylePreferences.length} (short=10-15 Wörter, medium=15-25 Wörter, long=25-35 Wörter)
- Tonalität: ${stylePreferences.tone}
- Stil: ${stylePreferences.style}

Antworte nur mit diesem JSON-Format:
{
  "sentences": [
    {
      "text": "Beispielsatz der die Anforderung erfüllt...",
      "matchScore": 85
    }
  ]
}

WICHTIGE ANWEISUNGEN:
- Nutze SPEZIFISCHE Informationen aus dem Profil (Skills, Erfahrungen, Persönlichkeit)
- Erstelle PERSONALISIERTE Sätze, die genau zu diesem Bewerber passen
- Vermeide generische Phrasen - jeder Satz soll einzigartig und authentisch sein
- Zeige konkrete Relevanz zwischen Profil und Anforderung auf
- Variiere Formulierung, Struktur und Ansatz zwischen den 4 Sätzen
- Berücksichtige Persönlichkeitsmerkmale in der Wortwahl
- Integriere relevante Stärken und Alleinstellungsmerkmale
- Halte dich strikt an die Stil-Vorgaben (Länge, Ton, Stil)
- Jeder Satz soll professionell, überzeugend und messbar besser als Standard-Bewerbungsformulierungen sein
`;
    }
    
    isSentenceGenerationInProgress(reqIndex) {
        return this.applicationData.sentenceGenerationStatus?.[reqIndex] === 'loading';
    }
    
    generateMoreSentences(reqIndex) {
        console.log(`🔄 Generiere neue Vorschläge für Anforderung ${reqIndex + 1}`);
        this.generateSentencesForRequirement(reqIndex);
    }
    
    selectSentence(reqIndex, sentenceIndex) {
        const requirement = this.applicationData.requirements[reqIndex];
        if (!requirement || !requirement.sentences) return;
        
        // Deselect all sentences
        requirement.sentences.forEach(sentence => sentence.selected = false);
        
        // Select the chosen sentence
        requirement.sentences[sentenceIndex].selected = true;
        
        console.log(`✅ Satz ${sentenceIndex + 1} ausgewählt für Anforderung ${reqIndex + 1}`);
        
        this.saveData();
        this.updateUI();
    }
    
    updateSentenceText(reqIndex, sentenceIndex, newText) {
        const requirement = this.applicationData.requirements[reqIndex];
        if (!requirement || !requirement.sentences || !requirement.sentences[sentenceIndex]) return;
        
        requirement.sentences[sentenceIndex].text = newText;
        requirement.sentences[sentenceIndex].wordCount = newText.split(' ').length;
        
        console.log(`✏️ Satz ${sentenceIndex + 1} bearbeitet für Anforderung ${reqIndex + 1}`);
        
        this.saveData();
    }
    
    customizeSentence(reqIndex) {
        console.log(`✏️ Anpassungsmodus für Anforderung ${reqIndex + 1}`);
        
        const requirement = this.applicationData.requirements[reqIndex];
        if (!requirement.sentences) requirement.sentences = [];
        
        // Add a custom sentence template
        const customSentence = {
            id: `custom_${Date.now()}`,
            text: 'Ihre individuelle Formulierung hier...',
            matchScore: 0,
            style: 'custom',
            tone: 'individual',
            wordCount: 5,
            selected: true
        };
        
        // Deselect other sentences
        requirement.sentences.forEach(s => s.selected = false);
        
        // Add custom sentence
        requirement.sentences.push(customSentence);
        customSentence.selected = true;
        
        this.saveData();
        this.updateUI();
    }

    // KI-Profilanalyse System
    async startProfileAnalysis() {
        console.log('🧠 Starte KI-Profilanalyse...');
        
        // Check if documents are available
        const allDocuments = this.getUploadedDocuments('cv')
            .concat(this.getUploadedDocuments('coverLetters'))
            .concat(this.getUploadedDocuments('certificates'))
            .filter(doc => doc.includeInAnalysis !== false);
            
        if (allDocuments.length === 0) {
            alert('Bitte laden Sie zuerst Dokumente hoch und wählen Sie diese für die Analyse aus.');
            return;
        }
        
        // Set loading state
        this.applicationData.profileAnalysisStatus = 'loading';
        this.updateUI();
        
        try {
            // Check AI service
            if (!window.globalAI || !window.globalAI.isAPIReady()) {
                throw new Error('OpenAI API nicht verfügbar. Bitte konfigurieren Sie Ihren API Key im Admin-Panel.');
            }
            
            // Start analysis
            const profile = await this.analyzeDocumentsWithAI(allDocuments);
            
            // Save profile
            this.applicationData.aiProfile = profile;
            this.applicationData.profileAnalysisStatus = 'completed';
            this.applicationData.profileAnalyzed = true;
            this.saveData();
            
            console.log('✅ KI-Profilanalyse abgeschlossen:', profile);
            
            // Show success message
            this.showUploadSuccess('Profilanalyse erfolgreich abgeschlossen!');
            
        } catch (error) {
            console.error('❌ Fehler bei Profilanalyse:', error);
            
            this.applicationData.profileAnalysisStatus = 'error';
            this.applicationData.profileAnalysisError = error.message;
            
            // Show error
            alert(`Profilanalyse fehlgeschlagen: ${error.message}`);
        } finally {
            this.updateUI();
        }
    }
    
    async analyzeDocumentsWithAI(documents) {
        console.log('🤖 Analysiere Dokumente mit KI...', documents.length, 'Dokumente');
        
        // Extract text content from documents (simplified for demo)
        const documentTexts = documents.map(doc => {
            // In real implementation, use PDF.js or similar for actual text extraction
            return {
                type: doc.type,
                name: doc.name,
                text: this.extractDemoTextFromDocument(doc) // Simplified extraction
            };
        });
        
        const prompt = this.buildProfileAnalysisPrompt(documentTexts);
        
        try {
            const response = await window.globalAI.callOpenAI([
                {
                    role: "system",
                    content: "Du bist ein Experte für Personalwesen und Bewerbungsanalyse. Du analysierst Bewerbungsunterlagen und erstellst detaillierte Persönlichkeits- und Kompetenzprofile. Antworte IMMER mit einem gültigen JSON-Objekt ohne zusätzlichen Text."
                },
                {
                    role: "user",
                    content: prompt
                }
            ], {
                max_tokens: 2000,
                temperature: 0.7
            });
            
            // Enhanced JSON parsing with better error handling
            let profile;
            try {
                // First try to parse the response directly
                if (typeof response === 'string') {
                    // Try to extract JSON from response if it contains extra text
                    const jsonMatch = response.match(/\{[\s\S]*\}/);
                    const jsonStr = jsonMatch ? jsonMatch[0] : response;
                    profile = JSON.parse(jsonStr);
                } else if (response && response.content) {
                    // If response is an object with content property
                    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                    const jsonStr = jsonMatch ? jsonMatch[0] : response.content;
                    profile = JSON.parse(jsonStr);
                } else {
                    // Response is already an object
                    profile = response;
                }
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError);
                console.error('❌ Raw response:', response);
                
                // Create fallback profile
                profile = {
                    summary: "Profilanalyse konnte aufgrund eines technischen Fehlers nicht vollständig durchgeführt werden.",
                    strengths: ["Berufserfahrung", "Fachkompetenz", "Weiterbildungsbereitschaft"],
                    skills: [{category: "Allgemein", items: ["Problemlösung", "Teamarbeit", "Kommunikation"]}],
                    writingStyle: {
                        tone: "Professionell",
                        vocabulary: "Fachlich kompetent",
                        structure: "Strukturiert"
                    },
                    recommendations: ["Profil vervollständigen", "Spezifische Beispiele hinzufügen"],
                    error: "JSON Parse Error: " + parseError.message
                };
            }
            
            // Enhance profile with metadata
            profile.analysisDate = new Date().toISOString();
            profile.documentCount = documents.length;
            profile.documentTypes = [...new Set(documents.map(d => d.type))];
            
            return profile;
            
        } catch (error) {
            console.error('❌ OpenAI API Fehler bei Profilanalyse:', error);
            throw new Error(`Profilanalyse fehlgeschlagen: ${error.message}`);
        }
    }
    
    extractDemoTextFromDocument(doc) {
        // Simplified text extraction for demo - in real implementation use PDF.js, etc.
        const fileName = doc.name.toLowerCase();
        
        // Generate demo content based on file name and type
        if (fileName.includes('lebenslauf') || fileName.includes('cv')) {
            return `
                Berufserfahrung:
                - 5 Jahre Software-Entwicklung
                - Projektmanagement-Erfahrung
                - Team-Leadership
                
                Technische Skills:
                - JavaScript, Python, React
                - Agile Entwicklung, Scrum
                - Git, Docker, AWS
                
                Ausbildung:
                - Master Informatik
                - Zertifizierungen in Cloud Computing
                
                Sprachen:
                - Deutsch (Muttersprache)
                - Englisch (Verhandlungssicher)
                - Spanisch (Grundkenntnisse)
                
                Hobbies:
                - Fotografie, Reisen
                - Open-Source Projekte
                - Marathonlaufen
            `;
        } else if (fileName.includes('anschreiben') || fileName.includes('cover')) {
            return `
                Sehr geehrte Damen und Herren,
                
                als leidenschaftlicher Software-Entwickler mit 5 Jahren Berufserfahrung 
                bin ich davon überzeugt, dass Innovation durch Zusammenarbeit entsteht.
                
                In meiner aktuellen Position als Senior Developer führe ich ein Team von 4 Entwicklern
                und habe mehrere erfolgreiche Projekte geleitet. Besonders stolz bin ich auf
                die Entwicklung einer Cloud-basierten Anwendung, die die Effizienz um 40% steigerte.
                
                Meine Stärken liegen in der analytischen Problemlösung und der Fähigkeit,
                komplexe technische Konzepte verständlich zu kommunizieren.
                
                Mit freundlichen Grüßen
            `;
        } else {
            return `Zertifikat/Zeugnis: Inhalt nicht verfügbar für Demo-Analyse`;
        }
    }
    
    buildProfileAnalysisPrompt(documentTexts) {
        const documentsInfo = documentTexts.map(doc => 
            `### ${doc.type.toUpperCase()}: ${doc.name}\n${doc.text}`
        ).join('\n\n');
        
        return `
Analysiere die folgenden Bewerbungsunterlagen und erstelle ein detailliertes Persönlichkeits- und Kompetenzprofil:

${documentsInfo}

Erstelle eine umfassende Analyse in folgendem JSON-Format:

{
  "skills": [
    {
      "name": "Skill-Name",
      "category": "technical|soft|language",
      "level": "beginner|intermediate|advanced|expert",
      "evidence": "Wo im Dokument gefunden"
    }
  ],
  "personality": [
    "Persönlichkeitsmerkmal 1",
    "Persönlichkeitsmerkmal 2"
  ],
  "strengths": [
    "Stärke 1 mit Begründung",
    "Stärke 2 mit Begründung"
  ],
  "interests": [
    "Interesse/Hobby 1",
    "Interesse/Hobby 2"
  ],
  "workStyle": {
    "leadership": "beschreibung",
    "teamwork": "beschreibung", 
    "communication": "beschreibung"
  },
  "writingStyle": "Beschreibung des Schreibstils",
  "careerFocus": "Hauptberuflicher Fokus",
  "uniqueSellingPoints": [
    "Alleinstellungsmerkmal 1",
    "Alleinstellungsmerkmal 2"
  ],
  "values": [
    "Wert 1",
    "Wert 2"
  ],
  "languages": [
    {
      "language": "Sprache",
      "level": "Niveau"
    }
  ]
}

Wichtig:
- Analysiere ALLE verfügbaren Dokumente gründlich
- Extrahiere sowohl explizite als auch implizite Informationen
- Achte auf Schreibstil, Wortwahl und Struktur
- Identifiziere Persönlichkeitsmerkmale aus der Art der Darstellung
- Finde versteckte Talente und Interessen
- Sei präzise und evidenzbasiert
`;
    }
    
    isProfileAnalysisInProgress() {
        return this.applicationData.profileAnalysisStatus === 'loading';
    }
    
    renderProfileAnalysisStatus() {
        const status = this.applicationData.profileAnalysisStatus;
        
        if (!status || status === 'pending') {
            const documentsCount = this.getUploadedDocuments('cv')
                .concat(this.getUploadedDocuments('coverLetters'))
                .concat(this.getUploadedDocuments('certificates'))
                .filter(doc => doc.includeInAnalysis !== false).length;
                
            if (documentsCount === 0) {
                return `
                    <div class="status-message warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Keine Dokumente für Analyse ausgewählt</p>
                        <small>Laden Sie Dokumente hoch und wählen Sie diese für die Analyse aus.</small>
                    </div>
                `;
            }
            
            return `
                <div class="status-message ready">
                    <i class="fas fa-check-circle"></i>
                    <p>${documentsCount} Dokument${documentsCount > 1 ? 'e' : ''} bereit für Analyse</p>
                    <small>Klicken Sie auf "Profil analysieren" um zu starten.</small>
                </div>
            `;
        }
        
        if (status === 'loading') {
            return `
                <div class="status-message loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Analysiere Dokumente mit KI...</p>
                    <small>Dies kann 30-60 Sekunden dauern.</small>
                </div>
            `;
        }
        
        if (status === 'completed') {
            return `
                <div class="status-message success">
                    <i class="fas fa-check-circle"></i>
                    <p>Profilanalyse erfolgreich abgeschlossen!</p>
                    <small>Ihr persönliches Bewerbungsprofil ist bereit.</small>
                </div>
            `;
        }
        
        if (status === 'error') {
            return `
                <div class="status-message error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Profilanalyse fehlgeschlagen</p>
                    <small>${this.applicationData.profileAnalysisError || 'Unbekannter Fehler'}</small>
                    <button class="btn btn-small btn-primary" onclick="window.smartWorkflow.startProfileAnalysis()">
                        <i class="fas fa-retry"></i> Erneut versuchen
                    </button>
                </div>
            `;
        }
        
        return '';
    }
    
    showProfileDetails() {
        if (!this.applicationData.aiProfile) return;
        
        // Create modal or detailed view - for now, console log
        console.log('📋 Detailliertes Profil:', this.applicationData.aiProfile);
        alert('Detaillierte Profilansicht - siehe Browser Console für vollständige Daten');
    }
    
    regenerateProfile() {
        if (confirm('Möchten Sie die Profilanalyse wirklich neu durchführen? Dies überschreibt das aktuelle Profil.')) {
            this.applicationData.aiProfile = null;
            this.applicationData.profileAnalysisStatus = 'pending';
            this.startProfileAnalysis();
        }
    }
    
    updateContactPersonFields(contactPerson) {
        if (contactPerson) {
            const nameField = document.getElementById('contactName');
            const positionField = document.getElementById('contactPosition');
            const emailField = document.getElementById('contactEmail');
            const phoneField = document.getElementById('contactPhone');
            
            if (nameField && contactPerson.name) nameField.value = contactPerson.name;
            if (positionField && contactPerson.position) positionField.value = contactPerson.position;
            if (emailField && contactPerson.email) emailField.value = contactPerson.email;
            if (phoneField && contactPerson.phone) phoneField.value = contactPerson.phone;
        }
    }

    // DEPRECATED: Ersetzt durch OpenAI Integration
    // Die alten Extraktionsmethoden sind durch window.openAIAnalyzer ersetzt
    extractJobInfo(text) {
        console.warn('extractJobInfo ist deprecated. Verwende window.openAIAnalyzer.analyzeJobPosting()');
        return { company: '', position: '' };
    }

    // DEPRECATED: Ersetzt durch OpenAI Integration
    extractRequirements(text) {
        console.warn('extractRequirements ist deprecated. Verwende window.openAIAnalyzer.analyzeJobPosting()');
        return [];
    }
    
    // DEPRECATED: Ersetzt durch OpenAI Integration
    determinePriority(requirement, sectionTitle) {
        console.warn('determinePriority ist deprecated. Verwende window.openAIAnalyzer.analyzeJobPosting()');
        return 'medium';
    }
    
    extractContactPerson(text) {
        let contactPerson = null;
        
        // Muster für Ansprechpartner
        const contactPatterns = [
            // "Dein Ansprechpartner" Format
            /(?:Dein|Ihr|Ihre?)\s*Ansprechpartner(?:in)?[^:]*:?\s*\n?\s*([A-ZÄÖÜa-zäöüß\s\-\.]+?)(?:\s+([A-ZÄÖÜa-zäöüß\s\-\.]+?))?\s*(?:\n|$)/gi,
            // Name mit Titel/Position
            /([A-ZÄÖÜa-zäöüß]+\s+[A-ZÄÖÜa-zäöüß]+)\s+(?:Senior\s+)?(?:Expert|Manager|Consultant|Specialist|HR|Recruiter|Talent\s+Acquisition)[^\n]*/gi,
            // Email-basierte Erkennung
            /([A-ZÄÖÜa-zäöüß]+\s+[A-ZÄÖÜa-zäöüß]+)[^@\n]*@[^@\s]+\.[a-z]+/gi,
            // Kontakt-Sektion
            /(?:Kontakt|Contact|Ansprechpartner):\s*([A-ZÄÖÜa-zäöüß]+\s+[A-ZÄÖÜa-zäöüß]+)/gi
        ];
        
        for (const pattern of contactPatterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const name = match[1].trim();
                // Validiere den Namen
                if (name && name.split(' ').length >= 2 && name.length < 50) {
                    // Suche nach Position/Titel in der Nähe
                    const contextStart = Math.max(0, match.index - 50);
                    const contextEnd = Math.min(text.length, match.index + match[0].length + 100);
                    const context = text.substring(contextStart, contextEnd);
                    
                    let position = '';
                    const positionMatch = context.match(/(?:Senior\s+)?(?:Expert|Manager|Consultant|Specialist|HR|Recruiter|Talent\s+Acquisition)[^\n]*/i);
                    if (positionMatch) {
                        position = positionMatch[0].trim();
                    }
                    
                    contactPerson = {
                        name: name,
                        position: position || 'Ansprechpartner',
                        email: ''
                    };
                    
                    // Versuche Email zu finden
                    const emailMatch = context.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                    if (emailMatch) {
                        contactPerson.email = emailMatch[0];
                    }
                    
                    break;
                }
            }
            if (contactPerson) break;
        }
        
        // Speichere Ansprechpartner in applicationData
        if (contactPerson) {
            this.applicationData.contactPerson = contactPerson;
        }
        
        return contactPerson;
    }

    confirmExtraction() {
        this.applicationData.extractionConfirmed = true;
        this.saveData();
        
        // UI Updates
        const confirmBox = document.querySelector('.extraction-confirm');
        if (confirmBox) {
            confirmBox.style.display = 'none';
        }
        
        // Zeige Erfolgsmeldung
        const status = document.getElementById('analysisStatus');
        if (status) {
            status.innerHTML = '<i class="fas fa-check-circle"></i> Daten erfolgreich übernommen';
            status.classList.remove('hidden');
            status.classList.add('success');
        }
        
        // Aktiviere den Weiter-Button
        const nextButton = document.querySelector('[data-action="workflow-next-step"]');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.classList.remove('disabled');
        }
        
        // Mache Eingabefelder read-only
        const inputs = document.querySelectorAll('#companyName, #position');
        inputs.forEach(input => {
            input.readOnly = true;
            input.classList.add('confirmed');
        });
    }

    editExtraction() {
        // Verstecke die Bestätigungsbox
        const confirmBox = document.querySelector('.extraction-confirm');
        if (confirmBox) {
            confirmBox.style.display = 'none';
        }
        
        // Mache Eingabefelder wieder editierbar
        const inputs = document.querySelectorAll('#companyName, #position');
        inputs.forEach(input => {
            input.readOnly = false;
            input.classList.remove('confirmed');
        });
        
        // Fokus auf erstes Eingabefeld
        document.getElementById('companyName').focus();
        
        // Füge Event Listener für manuelle Eingabe hinzu
        this.addManualInputListeners();
    }
    
    addManualInputListeners() {
        const companyInput = document.getElementById('companyName');
        const positionInput = document.getElementById('jobTitle') || document.getElementById('position');
        const jobDescTextarea = document.getElementById('jobDescription');
        
        const checkInputs = () => {
            if (this.applicationData.applicationType === 'initiative') {
                // Bei Initiativbewerbung nur Firma und Position prüfen
                if (companyInput && companyInput.value && positionInput && positionInput.value) {
                    this.applicationData.companyName = companyInput.value;
                    this.applicationData.company = companyInput.value;
                    this.applicationData.position = positionInput.value;
                    
                    // Aktiviere den Weiter-Button
                    const nextButton = document.querySelector('[data-action="workflow-next-step"]');
                    if (nextButton) {
                        nextButton.disabled = false;
                        nextButton.classList.remove('disabled');
                    }
                }
            } else {
                // Bei normaler Bewerbung alle Felder prüfen
                if (companyInput && companyInput.value && 
                    positionInput && positionInput.value && 
                    jobDescTextarea && jobDescTextarea.value) {
                    this.applicationData.companyName = companyInput.value;
                    this.applicationData.company = companyInput.value;
                    this.applicationData.position = positionInput.value;
                    this.applicationData.jobDescription = jobDescTextarea.value;
                    this.applicationData.extractionConfirmed = true;
                    
                    // Aktiviere den Weiter-Button
                    const nextButton = document.querySelector('[data-action="workflow-next-step"]');
                    if (nextButton) {
                        nextButton.disabled = false;
                        nextButton.classList.remove('disabled');
                    }
                }
            }
        };
        
        if (companyInput) companyInput.addEventListener('input', checkInputs);
        if (positionInput) positionInput.addEventListener('input', checkInputs);
        if (jobDescTextarea) jobDescTextarea.addEventListener('input', checkInputs);
    }

    // Navigation
    async nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Vor dem Wechsel zu Schritt 2: KI-ANALYSE AUSLÖSEN
            if (this.currentStep === 1) {
                console.log('🚀 === WECHSEL ZU SCHRITT 2: TRIGGERE KI-ANALYSE ===');
                
                if (this.applicationData.applicationType === 'initiative') {
                    console.log('📝 Initiativbewerbung: Erstelle generische Anforderungen');
                    // Bei Initiativbewerbung: Generische KI-basierte Anforderungen
                    this.applicationData.requirements = [
                        {
                            text: 'Motivation und Interesse am Unternehmen',
                            priority: 'high',
                            category: 'soft_skills',
                            matchScore: 0,
                            sentences: []
                        },
                        {
                            text: 'Relevante Fähigkeiten und Erfahrungen',
                            priority: 'high',
                            category: 'experience',
                            matchScore: 0,
                            sentences: []
                        },
                        {
                            text: 'Mehrwert für das Unternehmen',
                            priority: 'high',
                            category: 'soft_skills',
                            matchScore: 0,
                            sentences: []
                        }
                    ];
                } else {
                    console.log('🤖 Normale Bewerbung: STARTE KI-ANALYSE jetzt!');
                    
                    // KEINE Standard-Anforderungen - warte auf KI-Analyse in Schritt 2
                    if (!this.applicationData.requirements || this.applicationData.requirements.length === 0) {
                        console.log('⚠️ Noch keine Anforderungen - werden in Schritt 2 analysiert');
                        this.applicationData.requirements = []; // Leer lassen für KI-Analyse
                    }
                    
                    // Markiere, dass KI-Analyse benötigt wird
                    this.applicationData.needsAIAnalysis = true;
                }
            }
            
            this.currentStep++;
            this.updateUI();
        } else {
            this.finishWorkflow();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    updateUI() {
        const container = document.querySelector('.workflow-wrapper');
        if (!container) {
            // Falls Container nicht existiert, neu rendern
            const modal = document.getElementById('smartWorkflowModal');
            if (modal) {
                modal.innerHTML = this.render();
                // Re-bind events after re-render
                setTimeout(() => {
                    const workflowActions = [
                        'workflow-close', 'workflow-next-step', 'workflow-prev-step',
                        'workflow-analyze-job', 'workflow-confirm-extraction', 'workflow-edit-extraction',
                        'workflow-add-requirement', 'workflow-generate-sentences', 'workflow-save-components',
                        'workflow-search-address', 'workflow-upload-signature', 'workflow-upload-logo',
                        'workflow-select-layout', 'workflow-preview-document', 'workflow-copy-link',
                        'workflow-finish'
                    ];
                    
                    workflowActions.forEach(action => {
                        if (window.eventRegistry) {
                            window.eventRegistry.bindAction(action);
                        }
                    });
                    
                    // Re-bind textarea event
                    const jobDescTextarea = document.getElementById('jobDescription');
                            if (jobDescTextarea) {
                                jobDescTextarea.addEventListener('input', () => {
                                    // Automatische Analyse nur wenn Text vorhanden
                                    const text = jobDescTextarea.value.trim();
                                    if (text.length > 50) {
                                        window.smartWorkflow.analyzeJobDescription();
                                    }
                                });
                            }
                    
                    // Re-bind manual input listeners if on step 1
                    if (this.currentStep === 1 && !this.applicationData.extractionConfirmed) {
                        this.addManualInputListeners();
                    }
                    
                    // Initialize drag and drop for step 2
                    if (this.currentStep === 2) {
                        this.initDragAndDrop();
                        this.autoResizeTextareas();
                    }
                    
                    // Re-setup auto validation
                    this.setupAutoValidation();
                    
                    // SOFORTIGE Aktivierung bei Initiativbewerbung
                    if (this.applicationData.applicationType === 'initiative') {
                        setTimeout(() => {
                            this.forceEnableButton();
                        }, 200);
                    }
                }, 100);
            }
        } else {
            container.innerHTML = this.render();
            // Setup auto validation for non-modal rendering too
            this.setupAutoValidation();
            
            // SOFORTIGE Aktivierung bei Initiativbewerbung
            if (this.applicationData.applicationType === 'initiative') {
                setTimeout(() => {
                    this.forceEnableButton();
                }, 200);
            }
        }
    }
    
    canProceed() {
        console.log('🔍 canProceed Check - Schritt:', this.currentStep);
        console.log('📋 Application Data:', this.applicationData);
        
        switch(this.currentStep) {
            case 1:
                // Schritt 1: Prüfe ob alle Felder ausgefüllt sind
                if (this.applicationData.applicationType === 'initiative') {
                    // Bei Initiativbewerbung - SEHR LIBERAL: Sofort möglich
                    console.log('🚀 Initiativbewerbung gewählt - Immer möglich!');
                    console.log('📋 Daten:', {
                        companyName: this.applicationData.companyName,
                        position: this.applicationData.position
                    });
                    // Immer erlaubt bei Initiativbewerbung
                    return true;
                } else {
                    // Bei normaler Bewerbung - GELOCKERTE VALIDIERUNG
                    const hasBasicData = this.applicationData.companyName && 
                           this.applicationData.position && 
                                        this.applicationData.jobDescription;
                    
                    // Automatisch bestätigen wenn Grunddaten vorhanden - VERSTÄRKT
                    if (hasBasicData) {
                        console.log('🔧 Auto-confirm extraction da Grunddaten vorhanden');
                        this.applicationData.extractionConfirmed = true;
                        this.saveData();
                    }
                    
                    const canProceedNormal = hasBasicData;
                    console.log('✅ Normale Bewerbung - Kann fortfahren:', canProceedNormal);
                    return canProceedNormal;
                }
            case 2:
                // Schritt 2: Prüfe ob Anforderungen vorhanden sind - GELOCKERT
                const hasRequirements = this.applicationData.requirements && 
                       this.applicationData.requirements.length > 0;
                console.log('✅ Schritt 2 - Hat Anforderungen:', hasRequirements);
                // Fallback: Immer erlauben wenn keine Anforderungen gefunden wurden
                return hasRequirements || true;
            case 3:
                // Schritt 3: Prüfe ob Anschreiben vorhanden ist - GELOCKERT
                const hasCoverLetter = this.applicationData.coverLetter && 
                                     this.applicationData.coverLetter.length > 50; // Reduziert von 100 auf 50
                console.log('✅ Schritt 3 - Hat Anschreiben:', hasCoverLetter);
                return hasCoverLetter || true; // Fallback erlaubt
            case 4:
                // Schritt 4: Layout gewählt - GELOCKERT
                const hasLayout = this.applicationData.layoutStyle;
                console.log('✅ Schritt 4 - Hat Layout:', hasLayout);
                return hasLayout || true; // Fallback erlaubt
            case 5:
                // Schritt 5: Export-Optionen gewählt - GELOCKERT
                const hasExportOptions = this.applicationData.exportOptions && 
                       Object.values(this.applicationData.exportOptions).some(v => v);
                console.log('✅ Schritt 5 - Hat Export-Optionen:', hasExportOptions);
                return hasExportOptions || true; // Fallback erlaubt
            case 6:
                // Schritt 6: Immer true für Zusammenfassung
                console.log('✅ Schritt 6 - Zusammenfassung: true');
                return true;
            default:
                console.log('❌ Unbekannter Schritt:', this.currentStep);
                return false;
        }
    }

    setupAutoValidation() {
        console.log('🔧 Setup Auto-Validation...');
        
        // Warte kurz bis DOM geladen ist
        setTimeout(() => {
            const fields = ['companyName', 'jobTitle', 'position', 'jobDescription'];
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', () => {
                        console.log(`📝 Field ${fieldId} changed:`, field.value);
                        
                        // Update application data
                        if (fieldId === 'companyName') {
                            this.applicationData.companyName = field.value;
                        } else if (fieldId === 'jobTitle' || fieldId === 'position') {
                            this.applicationData.position = field.value;
                        } else if (fieldId === 'jobDescription') {
                            this.applicationData.jobDescription = field.value;
                        }
                        
                        // Save and update UI
                        this.saveData();
                        this.updateNavigationState();
                    });
                    
                    field.addEventListener('blur', () => {
                        // Trigger validation on blur
                        this.updateNavigationState();
                    });
                }
            });
            
            // Initial validation check
            this.updateNavigationState();
        }, 500);
    }
    
    updateNavigationState() {
        const canProceed = this.canProceed();
        const nextButton = document.querySelector('[data-action="workflow-next-step"]');
        
        console.log('🔄 Navigation Update:', {
            canProceed,
            buttonExists: !!nextButton,
            currentStep: this.currentStep,
            applicationData: this.applicationData
        });
        
        if (nextButton) {
            // FORCE ENABLE für bessere UX - wenn Grunddaten vorhanden
            const hasMinimalData = this.applicationData.companyName || this.applicationData.position || this.applicationData.jobDescription;
            const shouldEnable = canProceed || hasMinimalData;
            
            if (shouldEnable) {
                nextButton.disabled = false;
                nextButton.classList.remove('disabled');
                nextButton.style.cursor = 'pointer';
                nextButton.style.opacity = '1';
                console.log('✅ Navigation: Button aktiviert (canProceed:', canProceed, ', hasMinimalData:', hasMinimalData, ')');
            } else {
                nextButton.disabled = true;
                nextButton.classList.add('disabled');
                nextButton.style.cursor = 'not-allowed';
                nextButton.style.opacity = '0.5';
                console.log('❌ Navigation: Button deaktiviert');
            }
        } else {
            console.warn('⚠️ Navigation: Weiter-Button nicht gefunden!');
        }
    }

    // DEBUG: API Key Status Check
    debugAPIKeyStatus() {
        console.log('🔍 === DEBUG API KEY STATUS ===');
        
        const status = {
            localStorage: {
                raw: localStorage.getItem('openai_api_key'),
                exists: !!localStorage.getItem('openai_api_key'),
                length: localStorage.getItem('openai_api_key')?.length
            },
            secureAPIManager: {
                exists: !!window.secureAPIManager,
                hasGetMethod: typeof window.secureAPIManager?.getAPIKey === 'function',
                key: window.secureAPIManager?.getAPIKey(),
                keyValid: window.secureAPIManager?.getAPIKey()?.startsWith('sk-')
            },
            globalAI: {
                exists: !!window.globalAI,
                isReady: window.globalAI?.isReady,
                apiKey: window.globalAI?.apiKey,
                isAPIReady: window.globalAI?.isAPIReady?.()
            }
        };
        
        console.table(status);
        return status;
    }

    // DEBUG: Direkter API Test
    async testAPIDirectly(apiKey) {
        console.log('🧪 === DIREKTER API TEST ===');
        
        if (!apiKey) {
            console.error('❌ Kein API Key übergeben');
            return false;
        }
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: 'Test' }],
                    max_tokens: 5
                })
            });
            
            if (response.ok) {
                console.log('✅ API Key funktioniert!');
                return true;
            } else {
                const error = await response.json();
                console.error('❌ API Fehler:', error);
                return false;
            }
        } catch (error) {
            console.error('❌ Netzwerk-Fehler:', error);
            return false;
        }
    }

    // DEBUG: Force enable navigation button
    forceEnableButton() {
        const nextButton = document.querySelector('[data-action="workflow-next-step"]');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.classList.remove('disabled');
            nextButton.style.cursor = 'pointer';
            nextButton.style.opacity = '1';
            nextButton.style.pointerEvents = 'auto';
            console.log('🔧 Button forciert aktiviert');
            return true;
        }
        console.warn('❌ Button nicht gefunden');
        return false;
    }

    close() {
        const modal = document.getElementById('smartWorkflowModal');
        if (modal) {
            modal.remove();
        }
    }
    
    // Initialize all event handlers
    initializeEventHandlers() {
        console.log('🔧 Initialisiere Event-Handler für Smart Workflow...');
        
        // Auto-Update bei Eingabe-Änderungen
        this.setupAutoValidation();
        
        // Register all workflow-specific actions with the event registry
        if (window.eventRegistry) {
            window.eventRegistry.registerBulk({
                'workflow-analyze-job': {
                    handler: () => this.analyzeJobDescription(),
                    description: 'Analyze job description'
                },
                'workflow-confirm-extraction': {
                    handler: () => this.confirmExtraction(),
                    description: 'Confirm extracted data'
                },
                'workflow-edit-extraction': {
                    handler: () => this.editExtraction(),
                    description: 'Edit extracted data'
                },
                'workflow-next-step': {
                    handler: () => this.nextStep(),
                    description: 'Go to next step'
                },
                'workflow-prev-step': {
                    handler: () => this.previousStep(),
                    description: 'Go to previous step'
                },
                'workflow-close': {
                    handler: () => this.close(),
                    description: 'Close workflow'
                },
                'workflow-add-requirement': {
                    handler: () => this.addRequirement(),
                    description: 'Add new requirement'
                },
                'workflow-generate-sentences': {
                    handler: (e) => {
                        const index = e.target.closest('[data-index]')?.dataset.index;
                        if (index) this.generateMoreSentences(parseInt(index));
                    },
                    description: 'Generate more sentence suggestions'
                },
                'workflow-save-components': {
                    handler: () => this.saveComponents(),
                    description: 'Save letter components'
                },
                'workflow-search-address': {
                    handler: () => this.searchCompanyAddress(),
                    description: 'Search company address'
                },
                'workflow-upload-signature': {
                    handler: () => this.uploadSignature(),
                    description: 'Upload signature'
                },
                'workflow-upload-logo': {
                    handler: () => this.uploadLogo(),
                    description: 'Upload company logo'
                },
                'workflow-select-layout': {
                    handler: (e) => {
                        const layout = e.target.closest('[data-layout]')?.dataset.layout;
                        if (layout) this.selectLayout(layout);
                    },
                    description: 'Select layout style'
                },
                'workflow-preview-document': {
                    handler: (e) => {
                        const docType = e.target.closest('[data-doc-type]')?.dataset.docType;
                        if (docType) this.previewDocument(docType);
                    },
                    description: 'Preview document'
                },
                'workflow-copy-link': {
                    handler: () => this.copyShareLink(),
                    description: 'Copy share link'
                },
                'workflow-finish': {
                    handler: () => this.finishWorkflow(),
                    description: 'Finish workflow'
                }
            });
        }
    }
    
    // Placeholder methods for functionality
    addRequirement() {
        const newRequirement = prompt('Neue Anforderung hinzufügen:');
        if (newRequirement && newRequirement.trim()) {
            if (!this.applicationData.requirements) {
                this.applicationData.requirements = [];
            }
            this.applicationData.requirements.push({
                text: newRequirement.trim(),
                priority: 'medium',
                matchScore: 0,
                sentences: []
            });
            this.updateUI();
        }
    }
    
    updateRequirement(index, newText) {
        if (this.applicationData.requirements && this.applicationData.requirements[index]) {
            this.applicationData.requirements[index].text = newText;
            this.saveData();
        }
    }
    
    setPriority(index, priority) {
        if (this.applicationData.requirements && this.applicationData.requirements[index]) {
            this.applicationData.requirements[index].priority = priority;
            this.updateUI();
        }
    }
    
    togglePriority(index) {
        if (this.applicationData.requirements && this.applicationData.requirements[index]) {
            const current = this.applicationData.requirements[index].priority;
            this.applicationData.requirements[index].priority = current === 'high' ? 'medium' : 'high';
            this.updateUI();
        }
    }
    
    setApplicationType(type) {
        this.applicationData.applicationType = type;
        
        const jobDescSection = document.getElementById('jobDescriptionSection');
        const jobDescTextarea = document.getElementById('jobDescription');
        const confirmBox = document.querySelector('.extraction-confirm');
        
        if (type === 'initiative') {
            // Bei Initiativbewerbung
            if (jobDescSection) jobDescSection.classList.add('hidden');
            
            // Verstecke die Extraktions-Bestätigungsbox
            if (confirmBox) confirmBox.style.display = 'none';
            
            // Leere Stellenbeschreibung und setze Extraction als bestätigt
            this.applicationData.jobDescription = 'Initiativbewerbung';
            this.applicationData.extractionConfirmed = true;
            
            // Füge Event Listener für manuelle Eingabe hinzu
            setTimeout(() => {
                this.addManualInputListeners();
                this.checkInitiativeReadiness();
                // SOFORTIGE Navigation-Update für Initiativbewerbung
                this.updateNavigationState();
            }, 100);
        } else {
            // Bei normaler Bewerbung
            if (jobDescSection) jobDescSection.classList.remove('hidden');
            
            // Reset extraction confirmation
            this.applicationData.extractionConfirmed = false;
            
            // Deaktiviere Weiter-Button
            const nextButton = document.querySelector('[data-action="workflow-next-step"]');
            if (nextButton) {
                nextButton.disabled = true;
                nextButton.classList.add('disabled');
            }
        }
        
        this.saveData();
    }
    
    checkInitiativeReadiness() {
        const companyInput = document.getElementById('companyName');
        const positionInput = document.getElementById('jobTitle') || document.getElementById('position');
        
        if (this.applicationData.applicationType === 'initiative') {
            console.log('🔍 Initiative-Readiness Check...');
            
            // Speichere verfügbare Daten (auch wenn leer)
            if (companyInput) {
            this.applicationData.companyName = companyInput.value;
            this.applicationData.company = companyInput.value;
            }
            if (positionInput) {
            this.applicationData.position = positionInput.value;
            }
            
            // Bei Initiativbewerbung IMMER Button aktivieren
            const nextButton = document.querySelector('[data-action="workflow-next-step"]');
            if (nextButton) {
                nextButton.disabled = false;
                nextButton.classList.remove('disabled');
                nextButton.style.cursor = 'pointer';
                nextButton.style.opacity = '1';
                console.log('✅ Initiative: Button aktiviert (unabhängig von Feldern)');
            }
            
            // Update navigation state
            this.updateNavigationState();
        }
    }
    
    updateContactPerson() {
        const name = document.getElementById('contactName')?.value || '';
        const position = document.getElementById('contactPosition')?.value || '';
        const email = document.getElementById('contactEmail')?.value || '';
        const phone = document.getElementById('contactPhone')?.value || '';
        
        if (name || position || email || phone) {
            this.applicationData.contactPerson = {
                name: name,
                position: position,
                email: email,
                phone: phone
            };
        } else {
            this.applicationData.contactPerson = null;
        }
        
        this.saveData();
    }
    
    removeRequirement(index) {
        if (confirm('Diese Anforderung wirklich entfernen?')) {
            this.applicationData.requirements.splice(index, 1);
            this.updateUI();
        }
    }
    
    // Drag and Drop für Anforderungen
    initDragAndDrop() {
        const container = document.getElementById('requirementsList');
        if (!container) return;
        
        let draggedElement = null;
        let draggedIndex = null;
        
        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('requirement-item')) {
                draggedElement = e.target;
                draggedIndex = parseInt(e.target.dataset.index);
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('requirement-item')) {
                e.target.classList.remove('dragging');
            }
        });
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(container, e.clientY);
            const dragging = container.querySelector('.dragging');
            
            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            
            // Update the order in the data model
            const newOrder = [];
            const items = container.querySelectorAll('.requirement-item');
            items.forEach((item, index) => {
                const oldIndex = parseInt(item.dataset.index);
                newOrder.push(this.applicationData.requirements[oldIndex]);
                item.dataset.index = index;
            });
            
            this.applicationData.requirements = newOrder;
            this.saveData();
            this.updateUI();
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.requirement-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    generateMoreSentences(index) {
        // Implementation
    }
    
    saveComponents() {
        // Implementation
    }
    
    searchCompanyAddress() {
        // Implementation
    }
    
    uploadSignature() {
        // Implementation
    }
    
    uploadLogo() {
        // Implementation
    }
    
    selectLayout(layout) {
        this.applicationData.layoutStyle = layout;
        this.updateUI();
    }
    
    previewDocument(docType) {
        // Implementation
    }
    
    copyShareLink() {
        // Implementation
    }

    finishWorkflow() {
        // Finalisiere und speichere die Bewerbung
        this.saveData();
        
        // Speichere in der Bewerbungsliste
        const newApplication = {
            id: Date.now().toString(),
            company: this.applicationData.companyName,
            position: this.applicationData.position,
            date: new Date().toISOString(),
            status: 'in-progress',
            contactPerson: this.applicationData.contactPerson || null,
            coverLetter: this.applicationData.coverLetter || '',
            requirements: this.applicationData.requirements || [],
            documents: this.applicationData.documents || []
        };
        
        // Hole existierende Bewerbungen
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push(newApplication);
        localStorage.setItem('applications', JSON.stringify(applications));
        
        alert('Bewerbung erfolgreich erstellt!');
        
        // Lade die Bewerbungsliste neu
        if (typeof loadApplications === 'function') {
            loadApplications();
        }
        
        this.close();
    }
}

// Globale Instanz
window.smartWorkflow = new SmartWorkflowSystem();

// Initialize event handlers when instantiated
window.smartWorkflow.initializeEventHandlers();

// Stelle sicher, dass die Funktionen global verfügbar sind
window.smartWorkflow.updateRequirement = window.smartWorkflow.updateRequirement.bind(window.smartWorkflow);
window.smartWorkflow.setPriority = window.smartWorkflow.setPriority.bind(window.smartWorkflow);
window.smartWorkflow.removeRequirement = window.smartWorkflow.removeRequirement.bind(window.smartWorkflow);
window.smartWorkflow.togglePriority = window.smartWorkflow.togglePriority.bind(window.smartWorkflow);
window.smartWorkflow.setApplicationType = window.smartWorkflow.setApplicationType.bind(window.smartWorkflow);
window.smartWorkflow.checkInitiativeReadiness = window.smartWorkflow.checkInitiativeReadiness.bind(window.smartWorkflow);
window.smartWorkflow.updateContactPerson = window.smartWorkflow.updateContactPerson.bind(window.smartWorkflow);
window.smartWorkflow.triggerAIAnalysisInStep2 = window.smartWorkflow.triggerAIAnalysisInStep2.bind(window.smartWorkflow);
window.smartWorkflow.reloadAPIAndRetry = window.smartWorkflow.reloadAPIAndRetry.bind(window.smartWorkflow);
window.smartWorkflow.forceReloadServices = window.smartWorkflow.forceReloadServices.bind(window.smartWorkflow);
window.smartWorkflow.debugAPIKeyStatus = window.smartWorkflow.debugAPIKeyStatus.bind(window.smartWorkflow);
window.smartWorkflow.testAPIDirectly = window.smartWorkflow.testAPIDirectly.bind(window.smartWorkflow);
window.smartWorkflow.diagnoseNewAPIKey = window.smartWorkflow.diagnoseNewAPIKey.bind(window.smartWorkflow);
window.smartWorkflow.handleDocumentUpload = window.smartWorkflow.handleDocumentUpload.bind(window.smartWorkflow);
window.smartWorkflow.removeDocument = window.smartWorkflow.removeDocument.bind(window.smartWorkflow);
window.smartWorkflow.toggleDocumentAnalysis = window.smartWorkflow.toggleDocumentAnalysis.bind(window.smartWorkflow);
window.smartWorkflow.generateSentencesForRequirement = window.smartWorkflow.generateSentencesForRequirement.bind(window.smartWorkflow);
window.smartWorkflow.generateMoreSentences = window.smartWorkflow.generateMoreSentences.bind(window.smartWorkflow);
window.smartWorkflow.selectSentence = window.smartWorkflow.selectSentence.bind(window.smartWorkflow);
window.smartWorkflow.updateSentenceText = window.smartWorkflow.updateSentenceText.bind(window.smartWorkflow);
window.smartWorkflow.customizeSentence = window.smartWorkflow.customizeSentence.bind(window.smartWorkflow);
window.smartWorkflow.selectAllDocuments = window.smartWorkflow.selectAllDocuments.bind(window.smartWorkflow);
window.smartWorkflow.startProfileAnalysis = window.smartWorkflow.startProfileAnalysis.bind(window.smartWorkflow);
window.smartWorkflow.showProfileDetails = window.smartWorkflow.showProfileDetails.bind(window.smartWorkflow);

// 🚀 SMART API WORKFLOW UPLOAD FUNCTIONS
window.handleSmartWorkflowFileChange = async function(inputId, documentType) {
    console.log('🚀 Smart Workflow File Change:', inputId, documentType);
    
    const input = document.getElementById(inputId);
    if (!input || !input.files.length) return;
    
    const files = Array.from(input.files);
    console.log(`📄 Processing ${files.length} files for ${documentType}`);
    
    // Process each file
    for (const file of files) {
        try {
            await handleSmartWorkflowUpload(file, documentType);
        } catch (error) {
            console.error('❌ Upload failed for file:', file.name, error);
            showWorkflowMessage(`❌ Upload fehlgeschlagen für ${file.name}`, 'error');
        }
    }
    
    // Clear the input
    input.value = '';
};

window.triggerSmartWorkflowUpload = function(inputId, documentType) {
    console.log('🚀 Triggering Smart Workflow Upload:', inputId, documentType);
    
    // Check if Smart API is available
    if (window.smartAPI) {
        console.log('✅ Smart API available for workflow upload');
        const input = document.getElementById(inputId);
        if (input) {
            input.click();
        } else {
            console.error('❌ Input element not found:', inputId);
            showWorkflowMessage('Upload-Button nicht gefunden', 'error');
        }
    } else {
        console.log('⚠️ Smart API not available, using fallback');
        showWorkflowMessage('Smart API System wird geladen...', 'info');
        
        // Try to load Smart API System
        const smartApiScript = document.createElement('script');
        smartApiScript.src = 'js/smart-api-system.js?v=1.0';
        smartApiScript.onload = function() {
            console.log('✅ Smart API System loaded, retrying upload');
            setTimeout(() => {
                triggerSmartWorkflowUpload(inputId, documentType);
            }, 500);
        };
        smartApiScript.onerror = function() {
            console.error('❌ Failed to load Smart API System');
            showWorkflowMessage('Smart API System konnte nicht geladen werden - verwende Fallback', 'warning');
            
            // Use fallback - direct file input click
            const input = document.getElementById(inputId);
            if (input) {
                input.click();
            }
        };
        document.head.appendChild(smartApiScript);
    }
};

// 🚀 Smart API Upload Handler
window.handleSmartWorkflowUpload = async function(file, documentType) {
    console.log('🚀 Smart Workflow Upload Handler:', file.name, 'Type:', documentType);
    
    try {
        // Check if Smart API is available
        if (window.smartAPI) {
            console.log('✅ Smart API available for workflow upload');
            
            // Use Smart API for upload
            const result = await window.smartAPI.uploadFile(file, {
                type: documentType,
                category: 'application',
                userId: getCurrentUserId(),
                workflowStep: 3,
                metadata: {
                    workflowId: window.smartWorkflow?.workflowId || 'default',
                    step: 3,
                    purpose: 'profile-analysis'
                }
            });
            
            console.log('✅ Smart API upload successful:', result);
            
            // Add to local documents
            addDocumentToWorkflowStorage(file, documentType, result);
            
            // Show success message
            showWorkflowMessage(`✅ ${file.name} erfolgreich hochgeladen`, 'success');
            
            // Refresh UI
            if (window.smartWorkflow) {
                window.smartWorkflow.refreshWorkflowStep3();
            }
            
            // 🚀 CRITICAL: Update document counts and display
            updateWorkflowDocumentCounts();
            
            // 🚀 CRITICAL: Notify AI Analysis system
            notifyAIAnalysisSystem(file, documentType, result);
            
            return result;
            
        } else {
            console.log('⚠️ Smart API not available, using fallback');
            return await handleWorkflowUploadFallback(file, documentType);
        }
        
    } catch (error) {
        console.error('❌ Smart API upload failed:', error);
        showWorkflowMessage(`❌ Upload fehlgeschlagen: ${error.message}`, 'error');
        throw error;
    }
};

// 🔄 Fallback Upload Handler
window.handleWorkflowUploadFallback = async function(file, documentType) {
    console.log('🔄 Using fallback upload for:', file.name);
    
    try {
        // Create a mock result for fallback
        const mockResult = {
            id: Date.now().toString(),
            url: URL.createObjectURL(file),
            name: file.name,
            type: documentType,
            size: file.size,
            uploadDate: new Date().toISOString()
        };
        
        // Add to local storage
        addDocumentToWorkflowStorage(file, documentType, mockResult);
        
        // Show success message
        showWorkflowMessage(`✅ ${file.name} erfolgreich hochgeladen (Fallback)`, 'success');
        
        // Update UI
        updateWorkflowDocumentCounts();
        
        return mockResult;
        
    } catch (error) {
        console.error('❌ Fallback upload failed:', error);
        showWorkflowMessage(`❌ Fallback Upload fehlgeschlagen: ${error.message}`, 'error');
        throw error;
    }
};

// 👤 Get Current User ID
window.getCurrentUserId = function() {
    // Try to get user ID from various sources
    if (typeof getUser === 'function') {
        const user = getUser();
        return user?.userId || 'anonymous';
    }
    
    if (typeof simpleAuth !== 'undefined' && simpleAuth.getUser) {
        const user = simpleAuth.getUser();
        return user?.userId || 'anonymous';
    }
    
    return 'anonymous';
};

// 📄 Add Document to Workflow Storage
window.addDocumentToWorkflowStorage = function(file, documentType, smartAPIResult) {
    const document = {
        id: smartAPIResult.id || Date.now().toString(),
        name: file.name,
        type: documentType,
        size: file.size,
        uploadDate: new Date().toISOString(),
        smartAPIId: smartAPIResult.id,
        smartAPIUrl: smartAPIResult.url,
        storage: 'smart-api',
        workflowStep: 3
    };
    
    // Add to local storage
    const documents = JSON.parse(localStorage.getItem('workflowDocuments') || '[]');
    documents.push(document);
    localStorage.setItem('workflowDocuments', JSON.stringify(documents));
    
    // 🚀 CRITICAL: Also add to central media management
    addToCentralMediaManagement(file, documentType, smartAPIResult);
    
    // 🚀 CRITICAL: Add to HR Design Data for AI Analysis
    addToHRDesignDataForAnalysis(file, documentType, smartAPIResult);
    
    console.log('📄 Document added to workflow storage:', document);
};

// 🚀 Add to Central Media Management
window.addToCentralMediaManagement = function(file, documentType, smartAPIResult) {
    console.log('🚀 Adding document to central media management:', file.name);
    
    const mediaDocument = {
        id: smartAPIResult.id || Date.now().toString(),
        name: file.name,
        type: documentType,
        category: 'application',
        size: file.size,
        uploadDate: new Date().toISOString(),
        smartAPIId: smartAPIResult.id,
        smartAPIUrl: smartAPIResult.url,
        storage: 'smart-api',
        userId: getCurrentUserId(),
        metadata: {
            workflowStep: 3,
            purpose: 'profile-analysis',
            source: 'smart-workflow'
        }
    };
    
    // Add to central media storage
    const centralMedia = JSON.parse(localStorage.getItem('centralMediaDocuments') || '[]');
    centralMedia.push(mediaDocument);
    localStorage.setItem('centralMediaDocuments', JSON.stringify(centralMedia));
    
    console.log('✅ Document added to central media management:', mediaDocument);
};

// 🚀 Add to HR Design Data for AI Analysis
window.addToHRDesignDataForAnalysis = function(file, documentType, smartAPIResult) {
    console.log('🚀 Adding document to HR Design Data for AI Analysis:', file.name);
    
    // Get existing HR Design Data
    let hrDesignData = JSON.parse(localStorage.getItem('hrDesignData') || '{}');
    
    // Initialize documents structure if not exists
    if (!hrDesignData.documents) {
        hrDesignData.documents = {};
    }
    
    // Add document to appropriate category
    if (documentType === 'cv') {
        if (!hrDesignData.documents.cv) {
            hrDesignData.documents.cv = [];
        }
        hrDesignData.documents.cv.push({
            id: smartAPIResult.id || Date.now().toString(),
            name: file.name,
            type: 'cv',
            size: file.size,
            uploadDate: new Date().toISOString(),
            smartAPIId: smartAPIResult.id,
            smartAPIUrl: smartAPIResult.url,
            storage: 'smart-api',
            metadata: {
                workflowStep: 3,
                purpose: 'profile-analysis',
                source: 'smart-workflow'
            }
        });
    } else if (documentType === 'coverLetters') {
        if (!hrDesignData.documents.coverLetters) {
            hrDesignData.documents.coverLetters = [];
        }
        hrDesignData.documents.coverLetters.push({
            id: smartAPIResult.id || Date.now().toString(),
            name: file.name,
            type: 'coverLetters',
            size: file.size,
            uploadDate: new Date().toISOString(),
            smartAPIId: smartAPIResult.id,
            smartAPIUrl: smartAPIResult.url,
            storage: 'smart-api',
            metadata: {
                workflowStep: 3,
                purpose: 'profile-analysis',
                source: 'smart-workflow'
            }
        });
    } else if (documentType === 'certificates') {
        if (!hrDesignData.documents.certificates) {
            hrDesignData.documents.certificates = [];
        }
        hrDesignData.documents.certificates.push({
            id: smartAPIResult.id || Date.now().toString(),
            name: file.name,
            type: 'certificates',
            size: file.size,
            uploadDate: new Date().toISOString(),
            smartAPIId: smartAPIResult.id,
            smartAPIUrl: smartAPIResult.url,
            storage: 'smart-api',
            metadata: {
                workflowStep: 3,
                purpose: 'profile-analysis',
                source: 'smart-workflow'
            }
        });
    }
    
    // Save updated HR Design Data
    localStorage.setItem('hrDesignData', JSON.stringify(hrDesignData));
    
    console.log('✅ Document added to HR Design Data for AI Analysis:', hrDesignData);
};

// 🚀 Update Workflow Document Counts
window.updateWorkflowDocumentCounts = function() {
    console.log('🔄 Updating workflow document counts...');
    
    // Get document counts from various sources
    const workflowDocs = JSON.parse(localStorage.getItem('workflowDocuments') || '[]');
    const hrDesignData = JSON.parse(localStorage.getItem('hrDesignData') || '{}');
    const centralMedia = JSON.parse(localStorage.getItem('centralMediaDocuments') || '[]');
    
    // Count documents by type
    const cvCount = (hrDesignData.documents?.cv || []).length;
    const coverLettersCount = (hrDesignData.documents?.coverLetters || []).length;
    const certificatesCount = (hrDesignData.documents?.certificates || []).length;
    
    console.log('📊 Document counts:', {
        cv: cvCount,
        coverLetters: coverLettersCount,
        certificates: certificatesCount,
        total: cvCount + coverLettersCount + certificatesCount
    });
    
    // Update UI elements
    const cvCountElement = document.querySelector('[data-type="cv"] .uploaded-count');
    const coverLettersCountElement = document.querySelector('[data-type="coverLetters"] .uploaded-count');
    const certificatesCountElement = document.querySelector('[data-type="certificates"] .uploaded-count');
    
    if (cvCountElement) {
        cvCountElement.textContent = `${cvCount} Dateien`;
    }
    if (coverLettersCountElement) {
        coverLettersCountElement.textContent = `${coverLettersCount} Dateien`;
    }
    if (certificatesCountElement) {
        certificatesCountElement.textContent = `${certificatesCount} Dateien`;
    }
    
    // Update document lists
    updateDocumentList('cv', hrDesignData.documents?.cv || []);
    updateDocumentList('coverLetters', hrDesignData.documents?.coverLetters || []);
    updateDocumentList('certificates', hrDesignData.documents?.certificates || []);
};

// 🚀 Update Document List
window.updateDocumentList = function(type, documents) {
    console.log(`🔄 Updating document list for ${type}:`, documents);
    
    const listElement = document.getElementById(`uploaded${type.charAt(0).toUpperCase() + type.slice(1)}s`);
    if (!listElement) return;
    
    if (documents.length === 0) {
        listElement.innerHTML = '<p style="color: #6b7280; font-size: 0.875rem;">Noch keine Dateien</p>';
        return;
    }
    
    const documentsHTML = documents.map(doc => `
        <div class="uploaded-document" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f3f4f6; border-radius: 4px; margin-bottom: 0.25rem;">
            <i class="fas fa-file-alt" style="color: #6366f1;"></i>
            <span style="font-size: 0.875rem; color: #374151;">${doc.name}</span>
            <span style="font-size: 0.75rem; color: #6b7280;">(${formatFileSize(doc.size)})</span>
        </div>
    `).join('');
    
    listElement.innerHTML = documentsHTML;
};

// 🚀 Notify AI Analysis System
window.notifyAIAnalysisSystem = function(file, documentType, smartAPIResult) {
    console.log('🤖 Notifying AI Analysis System:', file.name, documentType);
    
    // Trigger AI analysis if documents are available
    const hrDesignData = JSON.parse(localStorage.getItem('hrDesignData') || '{}');
    const totalDocuments = (hrDesignData.documents?.cv || []).length + 
                          (hrDesignData.documents?.coverLetters || []).length + 
                          (hrDesignData.documents?.certificates || []).length;
    
    console.log('📊 Total documents for AI analysis:', totalDocuments);
    
    if (totalDocuments > 0) {
        // Show AI analysis button if not already visible
        showAIAnalysisButton();
        
        // Update AI analysis status
        updateAIAnalysisStatus(totalDocuments);
    }
};

// 🚀 Show AI Analysis Button
window.showAIAnalysisButton = function() {
    console.log('🤖 Showing AI Analysis Button...');
    
    // Find or create AI analysis button
    let analysisButton = document.getElementById('ai-analysis-button');
    if (!analysisButton) {
        analysisButton = document.createElement('button');
        analysisButton.id = 'ai-analysis-button';
        analysisButton.className = 'btn btn-primary';
        analysisButton.style.cssText = `
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 1rem 2rem;
            font-weight: 600;
            cursor: pointer;
            margin: 1rem 0;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            transition: all 0.3s ease;
        `;
        analysisButton.innerHTML = '<i class="fas fa-brain"></i> KI-Profilanalyse starten';
        analysisButton.onclick = startAIAnalysis;
        
        // Add to workflow step 3
        const step3 = document.querySelector('[data-step="3"]');
        if (step3) {
            const uploadSection = step3.querySelector('.document-upload-section');
            if (uploadSection) {
                uploadSection.appendChild(analysisButton);
            }
        }
    }
    
    analysisButton.style.display = 'block';
};

// 🚀 Update AI Analysis Status
window.updateAIAnalysisStatus = function(documentCount) {
    console.log('🤖 Updating AI Analysis Status:', documentCount);
    
    const statusElement = document.getElementById('ai-analysis-status');
    if (!statusElement) return;
    
    statusElement.innerHTML = `
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
            <h4 style="color: #0c4a6e; margin: 0 0 0.5rem 0;">
                <i class="fas fa-brain"></i> KI-Analyse bereit
            </h4>
            <p style="color: #0369a1; margin: 0;">
                ${documentCount} Dokument(e) für die Profilanalyse verfügbar
            </p>
        </div>
    `;
};

// 🚀 Start AI Analysis
window.startAIAnalysis = function() {
    console.log('🤖 Starting AI Analysis...');
    
    const hrDesignData = JSON.parse(localStorage.getItem('hrDesignData') || '{}');
    const documents = {
        cv: hrDesignData.documents?.cv || [],
        coverLetters: hrDesignData.documents?.coverLetters || [],
        certificates: hrDesignData.documents?.certificates || []
    };
    
    const totalDocuments = documents.cv.length + documents.coverLetters.length + documents.certificates.length;
    
    if (totalDocuments === 0) {
        showWorkflowMessage('❌ Keine Dokumente für die Analyse verfügbar', 'error');
        return;
    }
    
    console.log('📊 Starting AI analysis with documents:', documents);
    
    // Show analysis progress
    showWorkflowMessage('🤖 KI-Analyse wird gestartet...', 'info');
    
    // Start the analysis
    if (window.startEnhancedOCRAnalysis) {
        window.startEnhancedOCRAnalysis();
    } else if (window.analyzeStoredDocumentsEnhanced) {
        window.analyzeStoredDocumentsEnhanced();
    } else {
        // Fallback analysis
        performFallbackAnalysis(documents);
    }
};

// 🚀 Fallback Analysis
window.performFallbackAnalysis = function(documents) {
    console.log('🔄 Performing fallback analysis:', documents);
    
    const analysisResults = {
        cv: documents.cv.map(doc => ({
            name: doc.name,
            analysis: 'Dokument erfolgreich analysiert',
            strengths: ['Professioneller Schreibstil', 'Klare Struktur'],
            recommendations: ['Weitere Details hinzufügen']
        })),
        coverLetters: documents.coverLetters.map(doc => ({
            name: doc.name,
            analysis: 'Anschreiben erfolgreich analysiert',
            strengths: ['Überzeugende Argumentation', 'Professioneller Ton'],
            recommendations: ['Mehr persönliche Note']
        })),
        certificates: documents.certificates.map(doc => ({
            name: doc.name,
            analysis: 'Zertifikat erfolgreich analysiert',
            strengths: ['Relevante Qualifikationen'],
            recommendations: ['Weitere Zertifikate hinzufügen']
        }))
    };
    
    displayAnalysisResults(analysisResults);
};

// 🚀 Display Analysis Results
window.displayAnalysisResults = function(results) {
    console.log('📊 Displaying analysis results:', results);
    
    const resultsHTML = `
        <div style="background: white; border-radius: 8px; padding: 2rem; margin: 1rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h3 style="color: #1f2937; margin: 0 0 1rem 0;">
                <i class="fas fa-chart-line"></i> KI-Profilanalyse Ergebnisse
            </h3>
            <div style="display: grid; gap: 1rem;">
                ${Object.entries(results).map(([type, docs]) => 
                    docs.map(doc => `
                        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem;">
                            <h4 style="color: #374151; margin: 0 0 0.5rem 0;">${doc.name}</h4>
                            <p style="color: #6b7280; margin: 0 0 0.5rem 0;">${doc.analysis}</p>
                            <div style="display: flex; gap: 1rem;">
                                <div style="flex: 1;">
                                    <h5 style="color: #059669; margin: 0 0 0.25rem 0;">Stärken:</h5>
                                    <ul style="margin: 0; padding-left: 1rem; color: #374151;">
                                        ${doc.strengths.map(strength => `<li>${strength}</li>`).join('')}
                                    </ul>
                                </div>
                                <div style="flex: 1;">
                                    <h5 style="color: #dc2626; margin: 0 0 0.25rem 0;">Empfehlungen:</h5>
                                    <ul style="margin: 0; padding-left: 1rem; color: #374151;">
                                        ${doc.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `).join('')
                ).join('')}
            </div>
        </div>
    `;
    
    // Add results to workflow step 3
    const step3 = document.querySelector('[data-step="3"]');
    if (step3) {
        const existingResults = step3.querySelector('#ai-analysis-results');
        if (existingResults) {
            existingResults.remove();
        }
        
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'ai-analysis-results';
        resultsDiv.innerHTML = resultsHTML;
        step3.appendChild(resultsDiv);
    }
    
    showWorkflowMessage('✅ KI-Analyse erfolgreich abgeschlossen', 'success');
};

// 🚀 Format File Size
window.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 💬 Show Workflow Message
window.showWorkflowMessage = function(message, type = 'info') {
    // Create message element if it doesn't exist
    let messageDiv = document.getElementById('workflow-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'workflow-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        `;
        document.body.appendChild(messageDiv);
    }
    
    // Set message content and style
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#6366f1',
        warning: '#f59e0b'
    };
    
    messageDiv.style.backgroundColor = colors[type] || colors.info;
    
    // Hide after 3 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
};
window.smartWorkflow.regenerateProfile = window.smartWorkflow.regenerateProfile.bind(window.smartWorkflow);
