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
        const saved = localStorage.getItem('smartWorkflowData');
        if (saved) {
            this.applicationData = { ...this.applicationData, ...JSON.parse(saved) };
        }
    }

    saveData() {
        localStorage.setItem('smartWorkflowData', JSON.stringify(this.applicationData));
    }

    // Schritt 1: Stelleninformationen mit automatischer Analyse
    renderStep1() {
        return `
            <div class="workflow-step" data-step="1">
                <div class="step-header">
                    <h2>Schritt 1: Stelleninformationen</h2>
                    <p class="step-description">Fügen Sie die Stellenanzeige ein - wir analysieren sie automatisch für Sie</p>
                </div>

                <div class="form-section">
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
                                value="${this.applicationData.company || ''}"
                                placeholder="Firmenname eingeben..."
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
                            />
                            <div id="positionSuggestions" class="suggestions-box"></div>
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
        if (!jobDesc) return;

        // Zeige Analyse-Status
        document.getElementById('analysisStatus').classList.remove('hidden');
        
        // Simuliere Analyse (in Produktion würde hier die echte KI-Analyse stattfinden)
        setTimeout(() => {
            // Extrahiere Firma und Position
            const extracted = this.extractJobInfo(jobDesc);
            
            // Update UI
            document.getElementById('companyName').value = extracted.company;
            document.getElementById('jobTitle').value = extracted.position;
            
            // Extrahiere Anforderungen
            this.applicationData.requirements = this.extractRequirements(jobDesc);
            
            // Verstecke Status, zeige Ergebnisse
            document.getElementById('analysisStatus').classList.add('hidden');
            document.getElementById('extractedInfo').classList.remove('hidden');
            
            // Speichere Daten
            this.applicationData.jobDescription = jobDesc;
            this.applicationData.company = extracted.company;
            this.applicationData.position = extracted.position;
            this.saveData();
        }, 1500);
    }

    extractJobInfo(text) {
        // Verbesserte Extraktion wie bereits implementiert
        let company = '';
        let position = '';
        
        // Firmenname-Muster
        const companyPatterns = [
            /^([^·\n]+(?:AG|GmbH|SE|SA|Ltd|Inc|Corporation|Corp))\s*$/im,
            /bei\s+([^·\n]+(?:AG|GmbH|SE|SA|Ltd|Inc|Corporation|Corp))/i
        ];
        
        for (const pattern of companyPatterns) {
            const match = text.match(pattern);
            if (match) {
                company = match[1].trim();
                break;
            }
        }
        
        // Position-Muster
        const positionPatterns = [
            /^([^·\n]+?)\s*\((?:all genders|m\/w\/d)\)/im,
            /^((?:Consultant|Manager|Developer|Engineer|Analyst)[^·\n]+)/im
        ];
        
        for (const pattern of positionPatterns) {
            const match = text.match(pattern);
            if (match) {
                position = match[1].trim();
                break;
            }
        }
        
        return { company, position };
    }

    extractRequirements(text) {
        // Extrahiere Anforderungen aus der Stellenbeschreibung
        const requirements = [];
        
        // Verschiedene Muster für Anforderungen
        const sectionPatterns = [
            /(?:Ihr Profil|Ihre Aufgaben|Was Sie mitbringen|Anforderungen|Requirements|Wir erwarten|Sie haben|Sie bringen mit):?\s*\n([\s\S]+?)(?=\n\n[A-Z]|\n\n|$)/gi,
            /(?:Qualifikationen?|Kompetenzen|Skills?):?\s*\n([\s\S]+?)(?=\n\n[A-Z]|\n\n|$)/gi
        ];
        
        let requirementsText = '';
        
        // Versuche Anforderungs-Sektionen zu finden
        for (const pattern of sectionPatterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                requirementsText += match[1] + '\n';
            }
        }
        
        // Falls keine Sektionen gefunden, suche nach Aufzählungen
        if (!requirementsText) {
            const bulletPatterns = [
                /(?:^|\n)\s*[•\-\*]\s*([^\n]+)/gm,
                /(?:^|\n)\s*\d+\.\s*([^\n]+)/gm
            ];
            
            for (const pattern of bulletPatterns) {
                const matches = text.matchAll(pattern);
                for (const match of matches) {
                    requirementsText += match[1] + '\n';
                }
            }
        }
        
        // Extrahiere einzelne Anforderungen
        const lines = requirementsText.split('\n').filter(line => line.trim());
        
        // Schlüsselwörter für wichtige Anforderungen
        const highPriorityKeywords = [
            'zwingend', 'erforderlich', 'vorausgesetzt', 'must have', 'required',
            'abgeschlossen', 'studium', 'ausbildung', 'erfahrung', 'kenntnisse',
            'mehrjährig', 'fundiert', 'nachweislich', 'expertise'
        ];
        
        // Verarbeite jede Zeile als potenzielle Anforderung
        lines.forEach((line, index) => {
            const cleanLine = line.trim();
            if (cleanLine.length > 10 && cleanLine.length < 300) {
                // Bestimme Priorität
                const isHighPriority = highPriorityKeywords.some(keyword => 
                    cleanLine.toLowerCase().includes(keyword)
                ) || index < 3;
                
                requirements.push({
                    text: cleanLine,
                    priority: isHighPriority ? 'high' : 'medium',
                    matchScore: 0, // Wird später berechnet
                    sentences: []
                });
            }
        });
        
        // Falls keine Anforderungen gefunden, extrahiere aus dem gesamten Text
        if (requirements.length === 0) {
            // Suche nach Schlüsselwörtern im gesamten Text
            const keyPhrases = [
                /Sie verfügen über.+?(?=\.|$)/gi,
                /Sie haben.+?(?=\.|$)/gi,
                /Sie bringen.+?(?=\.|$)/gi,
                /Erfahrung in.+?(?=\.|$)/gi,
                /Kenntnisse in.+?(?=\.|$)/gi,
                /[A-Z]\w+(?:kenntnisse|erfahrung|kompetenz)/gi
            ];
            
            const foundPhrases = new Set();
            
            for (const pattern of keyPhrases) {
                const matches = text.matchAll(pattern);
                for (const match of matches) {
                    const phrase = match[0].trim();
                    if (phrase.length > 10 && phrase.length < 200) {
                        foundPhrases.add(phrase);
                    }
                }
            }
            
            Array.from(foundPhrases).slice(0, 10).forEach((phrase, index) => {
                requirements.push({
                    text: phrase,
                    priority: index < 3 ? 'high' : 'medium',
                    matchScore: 0,
                    sentences: []
                });
            });
        }
        
        // Begrenze auf maximal 8 Anforderungen und sortiere nach Priorität
        return requirements
            .slice(0, 8)
            .sort((a, b) => {
                if (a.priority === 'high' && b.priority !== 'high') return -1;
                if (a.priority !== 'high' && b.priority === 'high') return 1;
                return 0;
            });
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
        const positionInput = document.getElementById('position');
        const jobDescTextarea = document.getElementById('jobDescription');
        
        const checkInputs = () => {
            if (companyInput.value && positionInput.value && jobDescTextarea.value) {
                this.applicationData.companyName = companyInput.value;
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
        };
        
        companyInput.addEventListener('input', checkInputs);
        positionInput.addEventListener('input', checkInputs);
        jobDescTextarea.addEventListener('input', checkInputs);
    }

    // Navigation
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Vor dem Wechsel zu Schritt 2: Extrahiere Anforderungen
            if (this.currentStep === 1) {
                const jobDesc = this.applicationData.jobDescription || '';
                this.applicationData.requirements = this.extractRequirements(jobDesc);
                
                // Falls keine Anforderungen gefunden, zeige Warnung
                if (this.applicationData.requirements.length === 0) {
                    alert('Keine Anforderungen in der Stellenanzeige gefunden. Bitte überprüfen Sie die Stellenbeschreibung.');
                    return;
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
                            window.smartWorkflow.analyzeJobDescription();
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
                }, 100);
            }
        } else {
            container.innerHTML = this.render();
        }
    }
    
    canProceed() {
        switch(this.currentStep) {
            case 1:
                // Schritt 1: Prüfe ob alle Felder ausgefüllt und bestätigt sind
                return this.applicationData.companyName && 
                       this.applicationData.position && 
                       this.applicationData.jobDescription &&
                       this.applicationData.extractionConfirmed;
            case 2:
                // Schritt 2: Prüfe ob Anforderungen vorhanden sind
                return this.applicationData.requirements && 
                       this.applicationData.requirements.length > 0;
            case 3:
                // Schritt 3: Prüfe ob Anschreiben vorhanden ist
                return this.applicationData.coverLetter && 
                       this.applicationData.coverLetter.length > 100;
            case 4:
                // Schritt 4: Layout gewählt
                return this.applicationData.layoutStyle;
            case 5:
                // Schritt 5: Export-Optionen gewählt
                return this.applicationData.exportOptions && 
                       Object.values(this.applicationData.exportOptions).some(v => v);
            case 6:
                // Schritt 6: Immer true für Zusammenfassung
                return true;
            default:
                return false;
        }
    }

    close() {
        const modal = document.getElementById('smartWorkflowModal');
        if (modal) {
            modal.remove();
        }
    }
    
    // Initialize all event handlers
    initializeEventHandlers() {
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
        console.log('Generating more sentences for requirement', index);
        // Implementation
    }
    
    saveComponents() {
        console.log('Saving components...');
        // Implementation
    }
    
    searchCompanyAddress() {
        console.log('Searching company address...');
        // Implementation
    }
    
    uploadSignature() {
        console.log('Uploading signature...');
        // Implementation
    }
    
    uploadLogo() {
        console.log('Uploading logo...');
        // Implementation
    }
    
    selectLayout(layout) {
        console.log('Selecting layout:', layout);
        this.applicationData.layoutStyle = layout;
        this.updateUI();
    }
    
    previewDocument(docType) {
        console.log('Previewing document:', docType);
        // Implementation
    }
    
    copyShareLink() {
        console.log('Copying share link...');
        // Implementation
    }

    finishWorkflow() {
        // Finalisiere und speichere die Bewerbung
        this.saveData();
        alert('Bewerbung erfolgreich erstellt!');
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
