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
            
            // Starte KI-Analyse automatisch
            setTimeout(() => {
                this.triggerAIAnalysisInStep2();
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
                    <input 
                        type="text" 
                        value="${req.text}" 
                        class="requirement-text"
                        onchange="window.smartWorkflow.updateRequirement(${index}, this.value)"
                    />
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
                            <input type="file" id="cvUpload" accept=".pdf,.doc,.docx" multiple hidden>
                            <button class="btn btn-primary" onclick="document.getElementById('cvUpload').click()">
                                <i class="fas fa-upload"></i> Hochladen
                            </button>
                            <div class="uploaded-count">${this.applicationData.uploadedCVs || 0} Dateien</div>
                        </div>

                        <div class="upload-box" data-type="coverLetters">
                            <i class="fas fa-envelope fa-3x"></i>
                            <h4>Anschreiben</h4>
                            <p>Frühere Bewerbungen</p>
                            <input type="file" id="coverLetterUpload" accept=".pdf,.doc,.docx" multiple hidden>
                            <button class="btn btn-primary" onclick="document.getElementById('coverLetterUpload').click()">
                                <i class="fas fa-upload"></i> Hochladen
                            </button>
                            <div class="uploaded-count">${this.applicationData.uploadedCoverLetters || 0} Dateien</div>
                        </div>

                        <div class="upload-box" data-type="certificates">
                            <i class="fas fa-certificate fa-3x"></i>
                            <h4>Zeugnisse & Zertifikate</h4>
                            <p>Nachweise Ihrer Qualifikationen</p>
                            <input type="file" id="certificateUpload" accept=".pdf,.jpg,.png" multiple hidden>
                            <button class="btn btn-primary" onclick="document.getElementById('certificateUpload').click()">
                                <i class="fas fa-upload"></i> Hochladen
                            </button>
                            <div class="uploaded-count">${this.applicationData.uploadedCertificates || 0} Dateien</div>
                        </div>
                    </div>
                </div>

                <div class="analysis-section ${this.applicationData.profileAnalyzed ? '' : 'hidden'}">
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
            return '<div class="loading-sentences"><i class="fas fa-spinner fa-spin"></i> Generiere Sätze...</div>';
        }

        return sentences.map((sentence, sentIndex) => `
            <div class="sentence-option ${sentence.selected ? 'selected' : ''}">
                <input 
                    type="radio" 
                    name="sentence-${reqIndex}" 
                    id="sentence-${reqIndex}-${sentIndex}"
                    ${sentence.selected ? 'checked' : ''}
                    onchange="window.smartWorkflow.selectSentence(${reqIndex}, ${sentIndex})"
                />
                <label for="sentence-${reqIndex}-${sentIndex}">
                    <div class="sentence-text">${sentence.text}</div>
                    <div class="sentence-meta">
                        <span class="word-count"><i class="fas fa-font"></i> ${sentence.wordCount} Wörter</span>
                        <span class="tone-tag">${sentence.tone}</span>
                        <span class="style-tag">${sentence.style}</span>
                    </div>
                </label>
                <button class="btn-icon" onclick="window.smartWorkflow.editSentence(${reqIndex}, ${sentIndex})">
                    <i class="fas fa-pen"></i>
                </button>
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
            if (!window.globalAI || !window.globalAI.isAPIReady()) {
                throw new Error('OpenAI API nicht verfügbar oder nicht konfiguriert');
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
            
            analysisContainer.innerHTML = `
                <div style="background: #fef2f2; padding: 1rem; border-radius: 6px; border-left: 4px solid #ef4444;">
                    <h5 style="margin: 0 0 0.5rem 0; color: #dc2626;">❌ KI-Analyse fehlgeschlagen</h5>
                    <p style="margin: 0; color: #dc2626;">
                        <strong>Fehler:</strong> ${error.message}<br><br>
                        <strong>Mögliche Ursachen:</strong><br>
                        • OpenAI API Key nicht konfiguriert<br>
                        • Keine Internet-Verbindung<br>
                        • API-Quota aufgebraucht<br><br>
                        <strong>Lösung:</strong> Bitte konfigurieren Sie Ihren OpenAI API Key im Admin-Panel.
                    </p>
                    <div style="margin-top: 1rem;">
                        <button onclick="window.open('admin.html', '_blank')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-cog"></i> Admin-Panel öffnen
                        </button>
                        <button onclick="window.smartWorkflow.triggerAIAnalysisInStep2()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
                            <i class="fas fa-sync"></i> Erneut versuchen
                        </button>
                    </div>
                </div>
            `;
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
