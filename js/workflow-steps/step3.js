// =================== STEP 3: KI-ANSCHREIBEN GENERATOR & EDITOR ===================
// Modul für Schritt 3 des Smart Bewerbungs-Workflows

// Load required styles
function loadStep3Dependencies() {
    if (!document.getElementById('step3-styles-loaded')) {
        const script = document.createElement('script');
        script.id = 'step3-styles-loaded';
        script.src = 'js/workflow-steps/step3-styles.js';
        document.head.appendChild(script);
    }
}

// Step 3 Main Generator Function
window.generateStep3 = function() {
    // Load dependencies first
    loadStep3Dependencies();
    
    // Inject Step 3 specific styles
    setTimeout(() => {
        if (window.injectStep3Styles) {
            window.injectStep3Styles();
        }
    }, 100);
    
    const safeWorkflowData = window.workflowData || {};
    
    return `
        <div class="workflow-step-container step3-optimized" data-step="3">
            <!-- OPTIMIZATION 1: Advanced Progress Indicator -->
            <div class="progress-indicator">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 50%"></div>
                </div>
                <div class="step-circles">
                    <div class="circle completed">1</div>
                    <div class="circle completed">2</div>
                    <div class="circle active">3</div>
                    <div class="circle">4</div>
                    <div class="circle">5</div>
                    <div class="circle">6</div>
                </div>
            </div>

            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number-enhanced" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">3</span>
                    KI-Anschreiben Generator & Editor
                    <!-- OPTIMIZATION 2: Advanced Help System -->
                    <button class="help-button" onclick="showStep3Help()" title="Anschreiben-Hilfe">
                        <i class="fas fa-question-circle"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Erstellen Sie ein personalisiertes Anschreiben mit KI-Unterstützung und Live-Optimierung</p>
            </div>
            
            <!-- Company/Position Summary Enhanced -->
            <div class="application-summary-enhanced" style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid #f59e0b;">
                <div class="summary-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="margin: 0; color: #92400e; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-edit"></i> Anschreiben-Übersicht
                    </h4>
                    <div class="writing-mode-badge" id="writingMode" style="background: #f59e0b; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;">
                        KI-Modus ✨
                    </div>
                </div>
                <div class="summary-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <p style="margin: 0; color: #92400e;"><strong>🏢 Unternehmen:</strong> ${safeWorkflowData.company || 'Nicht angegeben'}</p>
                        <p style="margin: 0.5rem 0 0; color: #92400e;"><strong>💼 Position:</strong> ${safeWorkflowData.position || 'Nicht angegeben'}</p>
                    </div>
                    <div>
                        <p style="margin: 0; color: #92400e;"><strong>📝 Anforderungen:</strong> <span id="reqCount">${safeWorkflowData.requirements?.length || 0}</span></p>
                        <p style="margin: 0.5rem 0 0; color: #92400e;"><strong>🎯 Modus:</strong> <span id="currentMode">Vollautomatisch</span></p>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 3: Multi-Mode Writing Selection -->
            <div class="writing-mode-selector" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">✍️ Anschreiben-Modus wählen</h4>
                <div class="mode-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                    <div class="writing-mode-card active" data-mode="ai-generated" onclick="selectWritingMode('ai-generated')" style="border: 2px solid #f59e0b; background: #fef3c7; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">🤖</div>
                        <h5 style="margin: 0 0 0.5rem; color: #92400e;">KI-Vollgenerierung</h5>
                        <p style="margin: 0; color: #b45309; font-size: 0.875rem;">Komplettes Anschreiben automatisch erstellen basierend auf Anforderungsanalyse</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #d97706;">
                            ✓ Vollautomatisch ✓ Requirement-basiert ✓ Personalisiert
                        </div>
                    </div>
                    
                    <div class="writing-mode-card" data-mode="ai-assisted" onclick="selectWritingMode('ai-assisted')" style="border: 2px solid #e5e7eb; background: white; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">🖊️</div>
                        <h5 style="margin: 0 0 0.5rem; color: #374151;">KI-Unterstützter Editor</h5>
                        <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Rich-Text Editor mit KI-Vorschlägen und Live-Optimierung während des Schreibens</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                            ✓ Rich-Text Editor ✓ KI-Vorschläge ✓ Live-Feedback
                        </div>
                    </div>
                    
                    <div class="writing-mode-card" data-mode="template-based" onclick="selectWritingMode('template-based')" style="border: 2px solid #e5e7eb; background: white; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                        <div class="mode-icon" style="font-size: 2rem; margin-bottom: 1rem;">📝</div>
                        <h5 style="margin: 0 0 0.5rem; color: #374151;">Template-Generator</h5>
                        <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Professionelle Vorlagen mit anpassbaren Bausteinen für verschiedene Branchen</p>
                        <div class="mode-features" style="margin-top: 1rem; font-size: 0.75rem; color: #6b7280;">
                            ✓ Branche-Templates ✓ Modulare Bausteine ✓ Anpassbar
                        </div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 4: Real-time Writing Dashboard -->
            <div class="writing-dashboard" style="margin-bottom: 2rem;">
                <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h4 style="margin: 0; color: #374151;">📊 Anschreiben-Dashboard</h4>
                    <div class="dashboard-controls" style="display: flex; gap: 0.5rem;">
                        <button onclick="toggleAutoOptimization()" id="autoOptimizeBtn" class="dashboard-btn" style="background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                            <i class="fas fa-magic"></i> Auto-Optimierung
                        </button>
                        <button onclick="refreshWritingMetrics()" class="dashboard-btn" style="background: none; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 0.875rem;">
                            <i class="fas fa-sync"></i>
                        </button>
                    </div>
                </div>
                
                <div class="writing-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="letterScore" style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Qualitäts-Score</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="wordCount" style="font-size: 2rem; font-weight: 800; color: #6366f1; margin-bottom: 0.5rem;">0</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Wörter</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="readabilityScore" style="font-size: 2rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Lesbarkeit</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="personalizationLevel" style="font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Personalisierung</div>
                    </div>
                    
                    <div class="metric-card" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                        <div class="metric-value" id="requirementMatch" style="font-size: 2rem; font-weight: 800; color: #ef4444; margin-bottom: 0.5rem;">-</div>
                        <div class="metric-label" style="color: #6b7280; font-size: 0.875rem;">Req.-Match</div>
                    </div>
                </div>

                <!-- OPTIMIZATION 5: Smart Generation Trigger -->
                <div class="generation-section" style="text-align: center; margin-bottom: 2rem;">
                    <button onclick="startIntelligentGeneration()" id="generateBtn" class="generation-btn enhanced" 
                            style="padding: 1rem 2rem; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 1.1rem; display: inline-flex; align-items: center; gap: 0.75rem; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); transition: all 0.3s ease;">
                        <div class="btn-icon">
                            <i class="fas fa-magic"></i>
                        </div>
                        <span class="btn-text">Anschreiben generieren</span>
                        <div class="btn-spinner" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                    </button>
                    <div class="generation-options" style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="includeMotivation" checked style="margin: 0;">
                            Motivation einbeziehen
                        </label>
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="formalTone" checked style="margin: 0;">
                            Formeller Ton
                        </label>
                        <label class="option-checkbox" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                            <input type="checkbox" id="includeAvailability" style="margin: 0;">
                            Verfügbarkeit erwähnen
                        </label>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 6: Advanced Letter Editor -->
            <div id="letterEditor" class="letter-editor-modern" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151;">📝 Anschreiben-Editor</h4>
                
                <!-- Source and Greeting Selection -->
                <div class="editor-sections" style="margin-bottom: 2rem;">
                    <div class="section-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div class="editor-section">
                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 500; color: #374151;">📍 Stellenquelle</label>
                            <select id="jobSource" onchange="updateGreetingOptions()" class="enhanced-select" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                <option value="website">Unternehmens-Website</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="xing">XING</option>
                                <option value="stepstone">StepStone</option>
                                <option value="indeed">Indeed</option>
                                <option value="referral">Empfehlung</option>
                                <option value="other">Sonstiges</option>
                            </select>
                        </div>
                        
                        <div class="editor-section">
                            <label style="display: block; margin-bottom: 0.75rem; font-weight: 500; color: #374151;">👋 Anrede-Stil</label>
                            <select id="greetingStyle" onchange="updateGreetingPreview()" class="enhanced-select" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease;">
                                <option value="formal">Sehr formell</option>
                                <option value="business">Geschäftlich</option>
                                <option value="modern">Modern</option>
                                <option value="personal">Persönlich</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Main Letter Content -->
                <div class="letter-content-editor" style="margin-bottom: 2rem;">
                    <div class="editor-toolbar" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px 8px 0 0; border: 1px solid #e5e7eb; border-bottom: none;">
                        <button onclick="formatText('bold')" class="toolbar-btn" title="Fett">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button onclick="formatText('italic')" class="toolbar-btn" title="Kursiv">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button onclick="formatText('underline')" class="toolbar-btn" title="Unterstreichen">
                            <i class="fas fa-underline"></i>
                        </button>
                        <div class="toolbar-separator"></div>
                        <button onclick="insertAIText()" class="toolbar-btn ai-btn" title="KI-Text einfügen">
                            <i class="fas fa-robot"></i>
                        </button>
                        <button onclick="optimizeCurrentParagraph()" class="toolbar-btn" title="Absatz optimieren">
                            <i class="fas fa-magic"></i>
                        </button>
                        <button onclick="checkGrammar()" class="toolbar-btn" title="Grammatik prüfen">
                            <i class="fas fa-spell-check"></i>
                        </button>
                    </div>
                    
                    <div class="letter-editor-container" style="position: relative;">
                        <div id="letterContent" class="rich-text-editor" contenteditable="true" 
                             style="min-height: 400px; padding: 2rem; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; font-family: 'Times New Roman', serif; line-height: 1.8; font-size: 1.1rem; background: white;"
                             oninput="updateLetterMetrics()" onpaste="handleRichTextPaste(event)">
                            <p>Klicken Sie hier oder verwenden Sie die KI-Generierung um Ihr Anschreiben zu erstellen...</p>
                        </div>
                    </div>
                </div>

                <!-- Letter Structure Outline -->
                <div class="letter-structure" style="margin-bottom: 2rem;">
                    <h5 style="margin-bottom: 1rem; color: #374151;">📋 Anschreiben-Struktur</h5>
                    <div class="structure-checklist" style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div class="structure-item" data-section="header">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasHeader" onchange="validateLetterStructure()">
                                <span>📧 Kopfzeile (Adresse, Datum)</span>
                            </label>
                        </div>
                        <div class="structure-item" data-section="greeting">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasGreeting" onchange="validateLetterStructure()">
                                <span>👋 Anrede</span>
                            </label>
                        </div>
                        <div class="structure-item" data-section="intro">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasIntro" onchange="validateLetterStructure()">
                                <span>🎯 Einleitung (Motivation)</span>
                            </label>
                        </div>
                        <div class="structure-item" data-section="main">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasMain" onchange="validateLetterStructure()">
                                <span>📝 Hauptteil (Qualifikationen)</span>
                            </label>
                        </div>
                        <div class="structure-item" data-section="closing">
                            <label class="structure-checkbox" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 6px; cursor: pointer;">
                                <input type="checkbox" id="hasClosing" onchange="validateLetterStructure()">
                                <span>🏁 Abschluss (Call-to-Action)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 7: Live Preview Panel -->
            <div id="livePreviewPanel" class="live-preview-panel" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151;">👁️ Live-Vorschau</h4>
                <div class="preview-container" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 2rem; font-family: 'Times New Roman', serif; line-height: 1.8; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div id="previewContent">
                        <!-- Live preview will be generated here -->
                    </div>
                </div>
                <div class="preview-actions" style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="printPreview()" class="preview-btn" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-print"></i> Drucken
                    </button>
                    <button onclick="copyToClipboard()" class="preview-btn" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-copy"></i> Kopieren
                    </button>
                    <button onclick="downloadAsDocx()" class="preview-btn" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-download"></i> DOCX
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 8: Enhanced Export Options -->
            <div class="export-section" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">💾 Export & Speichern</h4>
                <div class="export-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <button onclick="exportLetterPDF()" class="export-btn" style="padding: 1rem; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                        <i class="fas fa-file-pdf" style="font-size: 1.5rem;"></i>
                        <span style="font-weight: 600;">PDF Export</span>
                        <span style="font-size: 0.875rem; opacity: 0.9;">Für Bewerbung</span>
                    </button>
                    <button onclick="exportLetterWord()" class="export-btn" style="padding: 1rem; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                        <i class="fas fa-file-word" style="font-size: 1.5rem;"></i>
                        <span style="font-weight: 600;">Word Export</span>
                        <span style="font-size: 0.875rem; opacity: 0.9;">Zur Bearbeitung</span>
                    </button>
                    <button onclick="saveAsDraft()" class="export-btn" style="padding: 1rem; background: linear-gradient(135deg, #6b7280, #4b5563); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                        <i class="fas fa-save" style="font-size: 1.5rem;"></i>
                        <span style="font-weight: 600;">Als Entwurf</span>
                        <span style="font-size: 0.875rem; opacity: 0.9;">Später bearbeiten</span>
                    </button>
                    <button onclick="shareViaEmail()" class="export-btn" style="padding: 1rem; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                        <i class="fas fa-envelope" style="font-size: 1.5rem;"></i>
                        <span style="font-weight: 600;">E-Mail senden</span>
                        <span style="font-size: 0.875rem; opacity: 0.9;">Direkt versenden</span>
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 9: Advanced Action Bar -->
            <div class="action-bar enhanced step3">
                <div class="secondary-actions">
                    <div class="template-options">
                        <button type="button" onclick="loadTemplate('modern')" class="template-btn" title="Moderne Vorlage">
                            <i class="fas fa-rocket"></i>
                            Modern
                        </button>
                        <button type="button" onclick="loadTemplate('classic')" class="template-btn" title="Klassische Vorlage">
                            <i class="fas fa-building"></i>
                            Klassisch
                        </button>
                        <button type="button" onclick="loadTemplate('creative')" class="template-btn" title="Kreative Vorlage">
                            <i class="fas fa-palette"></i>
                            Kreativ
                        </button>
                        <button type="button" onclick="loadPreviousLetter()" class="template-btn" title="Vorherige Anschreiben">
                            <i class="fas fa-history"></i>
                            Vorherige
                        </button>
                    </div>
                </div>

                <div class="primary-actions">
                    <button onclick="previousWorkflowStep(2)" 
                            class="btn-secondary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <i class="fas fa-arrow-left"></i> 
                        <span>Zurück</span>
                    </button>
                    <button onclick="nextWorkflowStep(4)" 
                            id="continueStep3Btn" 
                            class="btn-primary enhanced"
                            style="display: none;"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <span class="btn-content">
                            <span class="btn-text">Weiter zu Schritt 4</span>
                            <i class="fas fa-arrow-right btn-icon"></i>
                        </span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 10: AI Writing Assistant Panel -->
            <div class="ai-assistant-panel" id="aiAssistantPanel" style="position: fixed; bottom: 2rem; left: 2rem; width: 300px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 8px 25px rgba(0,0,0,0.15); display: none; z-index: 9999;">
                <div class="assistant-header" style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
                    <h6 style="margin: 0; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-robot"></i> KI-Assistent
                    </h6>
                    <button onclick="toggleAIAssistant()" style="background: none; border: none; color: #6b7280; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="assistant-suggestions" id="aiSuggestions" style="font-size: 0.875rem; line-height: 1.5; color: #6b7280;">
                    <div class="suggestion-item" style="padding: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;" onclick="applySuggestion(this)">
                        💡 Erwähnen Sie Ihre relevante Berufserfahrung früher im Text
                    </div>
                    <div class="suggestion-item" style="padding: 0.5rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;" onclick="applySuggestion(this)">
                        🎯 Fügen Sie konkrete Beispiele für Ihre Erfolge hinzu
                    </div>
                </div>
                <div class="assistant-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button onclick="generateMoreSuggestions()" style="flex: 1; padding: 0.5rem; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                        Mehr Tipps
                    </button>
                </div>
            </div>
        </div>
    `;
};

console.log('✅ Step 3 Modul geladen');
