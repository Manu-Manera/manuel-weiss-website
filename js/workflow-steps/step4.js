// =================== STEP 4: DOKUMENTENERSTELLUNG & CV-MANAGEMENT ===================
// Modul für Schritt 4 des Smart Bewerbungs-Workflows mit 10 umfangreichen Optimierungen

// Step 4 Main Generator Function
window.generateStep4 = function() {
    // Inject Step 4 specific styles
    injectStep4Styles();
    
    const safeWorkflowData = window.workflowData || {};
    
    return `
        <div class="workflow-step-container step4-optimized" data-step="4">
            <!-- OPTIMIZATION 1: Enhanced Progress Indicator with Milestone Animation -->
            <div class="progress-indicator milestone">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 66.66%"></div>
                    <div class="milestone-marker" style="left: 66.66%">
                        <i class="fas fa-star"></i>
                    </div>
                </div>
                <div class="step-circles">
                    <div class="circle completed">1</div>
                    <div class="circle completed">2</div>
                    <div class="circle completed">3</div>
                    <div class="circle active milestone">4</div>
                    <div class="circle">5</div>
                    <div class="circle">6</div>
                </div>
                <div class="milestone-text">📄 Dokumentenerstellung erreicht!</div>
            </div>

            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number-enhanced" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">4</span>
                    Smart Dokumentenerstellung & CV-Management
                    <!-- OPTIMIZATION 2: Advanced Help System with Interactive Tutorials -->
                    <button class="help-button interactive" onclick="showStep4Help()" title="Interaktive Hilfe">
                        <i class="fas fa-graduation-cap"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Automatische Erstellung und Optimierung aller Bewerbungsdokumente mit KI-gestütztem Layout</p>
            </div>
            
            <!-- Application Progress Summary -->
            <div class="application-progress-summary" style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid #8b5cf6; position: relative; overflow: hidden;">
                <div class="progress-animation-bg"></div>
                <div class="summary-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; position: relative; z-index: 2;">
                    <h4 style="margin: 0; color: #581c87; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-file-alt"></i> Dokumentenstatus
                    </h4>
                    <div class="completion-badge" id="completionBadge" style="background: #8b5cf6; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600; animation: pulse 2s infinite;">
                        66% Abgeschlossen 📈
                    </div>
                </div>
                <div class="progress-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; position: relative; z-index: 2;">
                    <div class="progress-item completed">
                        <div class="item-icon">✅</div>
                        <div class="item-text">Stellenanalyse</div>
                        <div class="item-status">Abgeschlossen</div>
                    </div>
                    <div class="progress-item completed">
                        <div class="item-icon">✅</div>
                        <div class="item-text">Anforderungsmatching</div>
                        <div class="item-status">Abgeschlossen</div>
                    </div>
                    <div class="progress-item completed">
                        <div class="item-icon">✅</div>
                        <div class="item-text">Anschreiben</div>
                        <div class="item-status">Abgeschlossen</div>
                    </div>
                    <div class="progress-item current">
                        <div class="item-icon">🔄</div>
                        <div class="item-text">Dokumente</div>
                        <div class="item-status">In Bearbeitung</div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 3: Multi-Document Management Dashboard -->
            <div class="document-management-dashboard" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                    📋 Dokument-Dashboard
                    <div class="dashboard-stats" style="margin-left: auto; display: flex; gap: 1rem; font-size: 0.875rem;">
                        <span class="stat-item" style="color: #10b981;"><i class="fas fa-check"></i> <span id="completedDocs">0</span> fertig</span>
                        <span class="stat-item" style="color: #f59e0b;"><i class="fas fa-clock"></i> <span id="pendingDocs">3</span> ausstehend</span>
                        <span class="stat-item" style="color: #ef4444;"><i class="fas fa-exclamation"></i> <span id="errorDocs">0</span> Fehler</span>
                    </div>
                </h4>
                
                <div class="document-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
                    <!-- CV Document Card -->
                    <div class="document-card cv-card active" data-doc-type="cv" style="background: white; border-radius: 12px; padding: 1.5rem; border: 2px solid #8b5cf6; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1); transition: all 0.3s ease; position: relative; overflow: hidden;">
                        <div class="card-gradient-bg"></div>
                        <div class="document-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; position: relative; z-index: 2;">
                            <div class="doc-info">
                                <h5 style="margin: 0; color: #581c87; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-user-tie"></i> Lebenslauf
                                </h5>
                                <p style="margin: 0.25rem 0 0; color: #8b5cf6; font-size: 0.875rem;">Optimiert für ${safeWorkflowData.position || 'die Position'}</p>
                            </div>
                            <div class="doc-status ready" style="width: 3rem; height: 3rem; border-radius: 50%; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                        
                        <div class="document-preview" style="margin-bottom: 1rem; position: relative; z-index: 2;">
                            <div class="preview-thumbnail" style="width: 100%; height: 120px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1;">
                                <div class="preview-content" style="text-align: center; color: #64748b;">
                                    <i class="fas fa-file-pdf" style="font-size: 2rem; margin-bottom: 0.5rem; color: #8b5cf6;"></i>
                                    <p style="margin: 0; font-size: 0.875rem;">CV-Vorschau wird generiert...</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="document-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; position: relative; z-index: 2;">
                            <button onclick="editCV()" class="doc-action-btn edit" style="padding: 0.75rem; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all 0.3s ease;">
                                <i class="fas fa-edit"></i> Bearbeiten
                            </button>
                            <button onclick="previewCV()" class="doc-action-btn preview" style="padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all 0.3s ease;">
                                <i class="fas fa-eye"></i> Vorschau
                            </button>
                        </div>
                    </div>

                    <!-- Cover Letter Document Card -->
                    <div class="document-card cover-letter-card" data-doc-type="cover-letter" style="background: white; border-radius: 12px; padding: 1.5rem; border: 2px solid #e5e7eb; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; position: relative; overflow: hidden;">
                        <div class="document-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div class="doc-info">
                                <h5 style="margin: 0; color: #374151; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-envelope"></i> Anschreiben
                                </h5>
                                <p style="margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem;">Aus Schritt 3 übernommen</p>
                            </div>
                            <div class="doc-status ready" style="width: 3rem; height: 3rem; border-radius: 50%; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                        
                        <div class="document-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div class="stat-item" style="text-align: center; padding: 0.75rem; background: #f8fafc; border-radius: 6px;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6;" id="letterWordCount">245</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Wörter</div>
                            </div>
                            <div class="stat-item" style="text-align: center; padding: 0.75rem; background: #f8fafc; border-radius: 6px;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;" id="letterScore">87%</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Qualität</div>
                            </div>
                        </div>
                        
                        <div class="document-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <button onclick="refineLetter()" class="doc-action-btn refine" style="padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all 0.3s ease;">
                                <i class="fas fa-magic"></i> Verfeinern
                            </button>
                            <button onclick="exportLetter()" class="doc-action-btn export" style="padding: 0.75rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all 0.3s ease;">
                                <i class="fas fa-download"></i> Export
                            </button>
                        </div>
                    </div>

                    <!-- Additional Documents Card -->
                    <div class="document-card additional-docs-card" data-doc-type="additional" style="background: white; border-radius: 12px; padding: 1.5rem; border: 2px solid #e5e7eb; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); transition: all 0.3s ease;">
                        <div class="document-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div class="doc-info">
                                <h5 style="margin: 0; color: #374151; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="fas fa-folder-plus"></i> Zusatzdokumente
                                </h5>
                                <p style="margin: 0.25rem 0 0; color: #6b7280; font-size: 0.875rem;">Zeugnisse, Zertifikate, Portfolio</p>
                            </div>
                            <div class="doc-status pending" style="width: 3rem; height: 3rem; border-radius: 50%; background: #f59e0b; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                                <i class="fas fa-plus"></i>
                            </div>
                        </div>
                        
                        <div class="upload-area" style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 2rem; text-align: center; margin-bottom: 1rem; transition: all 0.3s ease;" ondrop="handleDocumentDrop(event)" ondragover="handleDocumentDragOver(event)">
                            <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: #9ca3af; margin-bottom: 0.5rem;"></i>
                            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Dokumente hier ablegen oder klicken</p>
                        </div>
                        
                        <div class="document-actions" style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
                            <button onclick="addDocuments()" class="doc-action-btn add" style="padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all 0.3s ease;">
                                <i class="fas fa-plus"></i> Dokumente hinzufügen
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 4: Real-time CV Builder with AI Suggestions -->
            <div id="cvBuilder" class="cv-builder-section" style="display: none;">
                <h4 style="margin-bottom: 1rem; color: #374151;">👤 Intelligenter CV-Builder</h4>
                
                <div class="cv-builder-interface" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <!-- CV Editor Panel -->
                    <div class="cv-editor-panel" style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #e5e7eb;">
                        <div class="editor-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h5 style="margin: 0; color: #374151;">📝 CV-Editor</h5>
                            <div class="editor-controls">
                                <button onclick="aiOptimizeCV()" class="ai-optimize-btn" style="background: #8b5cf6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                                    <i class="fas fa-magic"></i> KI-Optimierung
                                </button>
                            </div>
                        </div>
                        
                        <!-- CV Sections -->
                        <div class="cv-sections">
                            <div class="cv-section personal-info" style="margin-bottom: 1.5rem;">
                                <h6 style="margin-bottom: 0.75rem; color: #374151; font-weight: 600;">Persönliche Daten</h6>
                                <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <input type="text" placeholder="Vorname" class="cv-input" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                                    <input type="text" placeholder="Nachname" class="cv-input" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                                    <input type="email" placeholder="E-Mail" class="cv-input" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                                    <input type="tel" placeholder="Telefon" class="cv-input" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                                </div>
                            </div>
                            
                            <div class="cv-section experience" style="margin-bottom: 1.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                    <h6 style="margin: 0; color: #374151; font-weight: 600;">Berufserfahrung</h6>
                                    <button onclick="addExperience()" style="background: #10b981; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                                        <i class="fas fa-plus"></i> Hinzufügen
                                    </button>
                                </div>
                                <div id="experienceList" class="experience-list"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- CV Preview Panel -->
                    <div class="cv-preview-panel" style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #e5e7eb;">
                        <div class="preview-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h5 style="margin: 0; color: #374151;">👁️ Live-Vorschau</h5>
                            <div class="preview-controls">
                                <button onclick="changeTemplate()" style="background: #6b7280; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                                    <i class="fas fa-palette"></i> Template
                                </button>
                            </div>
                        </div>
                        
                        <div class="cv-preview-content" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; min-height: 400px; background: #fafafa;">
                            <div class="preview-placeholder" style="text-align: center; color: #9ca3af; padding: 2rem;">
                                <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                                <p>CV-Vorschau wird hier angezeigt</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 5: Smart Template Engine with Industry-Specific Designs -->
            <div class="template-engine" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🎨 Smart Template Engine</h4>
                
                <div class="template-selector" style="margin-bottom: 1.5rem;">
                    <div class="template-categories" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                        <button onclick="filterTemplates('all')" class="category-btn active" data-category="all" style="padding: 0.5rem 1rem; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                            Alle Templates
                        </button>
                        <button onclick="filterTemplates('tech')" class="category-btn" data-category="tech" style="padding: 0.5rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                            IT & Tech
                        </button>
                        <button onclick="filterTemplates('business')" class="category-btn" data-category="business" style="padding: 0.5rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                            Business
                        </button>
                        <button onclick="filterTemplates('creative')" class="category-btn" data-category="creative" style="padding: 0.5rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                            Kreativ
                        </button>
                        <button onclick="filterTemplates('academic')" class="category-btn" data-category="academic" style="padding: 0.5rem 1rem; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                            Akademisch
                        </button>
                    </div>
                    
                    <div class="template-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <!-- Template cards will be dynamically generated -->
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 6: Advanced Document Quality Analyzer -->
            <div class="document-analyzer" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🔍 Dokument-Qualitätsanalyse</h4>
                
                <div class="analyzer-dashboard" style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #e5e7eb;">
                    <div class="analysis-overview" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="analysis-metric" style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 2rem; font-weight: 800; color: #10b981; margin-bottom: 0.5rem;" id="overallScore">92%</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Gesamt-Score</div>
                        </div>
                        <div class="analysis-metric" style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 2rem; font-weight: 800; color: #3b82f6; margin-bottom: 0.5rem;" id="readabilityScore">A+</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Lesbarkeit</div>
                        </div>
                        <div class="analysis-metric" style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 2rem; font-weight: 800; color: #f59e0b; margin-bottom: 0.5rem;" id="keywordDensity">87%</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Keyword-Match</div>
                        </div>
                        <div class="analysis-metric" style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 2rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.5rem;" id="atsCompatibility">95%</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">ATS-Kompatibilität</div>
                        </div>
                    </div>
                    
                    <div class="improvement-suggestions" id="improvementSuggestions">
                        <h6 style="margin-bottom: 0.75rem; color: #374151;">💡 Verbesserungsvorschläge</h6>
                        <!-- Suggestions will be dynamically populated -->
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 7: Batch Export & Format Conversion System -->
            <div class="batch-export-system" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">📦 Batch-Export System</h4>
                
                <div class="export-dashboard" style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #e5e7eb;">
                    <div class="export-options" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="export-option" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.3s ease;" onclick="selectExportOption('complete-package')">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.75rem;">
                                <h6 style="margin: 0; color: #374151;">📁 Komplettpaket</h6>
                                <input type="checkbox" class="export-checkbox" data-option="complete-package">
                            </div>
                            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Alle Dokumente als ZIP-Archiv in verschiedenen Formaten</p>
                            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af;">PDF, DOCX, TXT</div>
                        </div>
                        
                        <div class="export-option" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.3s ease;" onclick="selectExportOption('pdf-only')">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.75rem;">
                                <h6 style="margin: 0; color: #374151;">📄 PDF-Paket</h6>
                                <input type="checkbox" class="export-checkbox" data-option="pdf-only">
                            </div>
                            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Alle Dokumente als optimierte PDFs für E-Mail-Versand</p>
                            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af;">Komprimiert, ATS-optimiert</div>
                        </div>
                        
                        <div class="export-option" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.3s ease;" onclick="selectExportOption('print-ready')">
                            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.75rem;">
                                <h6 style="margin: 0; color: #374151;">🖨️ Druckfertig</h6>
                                <input type="checkbox" class="export-checkbox" data-option="print-ready">
                            </div>
                            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Hochqualitative PDFs für professionellen Druck</p>
                            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af;">300 DPI, CMYK</div>
                        </div>
                    </div>
                    
                    <div class="export-controls" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="export-settings" style="display: flex; gap: 1rem; align-items: center;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                                <input type="checkbox" id="includePortfolio"> Portfolio einschließen
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                                <input type="checkbox" id="watermarkDocuments"> Wasserzeichen hinzufügen
                            </label>
                        </div>
                        
                        <button onclick="startBatchExport()" class="batch-export-btn" style="padding: 1rem 2rem; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-download"></i>
                            Batch Export starten
                        </button>
                    </div>
                </div>
            </div>

            <!-- OPTIMIZATION 8: Real-time Collaboration & Feedback System -->
            <div class="collaboration-system" style="margin-bottom: 2rem; display: none;" id="collaborationSystem">
                <h4 style="margin-bottom: 1rem; color: #374151;">👥 Kollaboration & Feedback</h4>
                
                <div class="collaboration-dashboard" style="background: white; border-radius: 12px; padding: 1.5rem; border: 1px solid #e5e7eb;">
                    <!-- Collaboration features would go here -->
                </div>
            </div>

            <!-- OPTIMIZATION 9: Advanced Action Bar with Smart Suggestions -->
            <div class="action-bar enhanced step4">
                <div class="secondary-actions">
                    <div class="smart-suggestions">
                        <button type="button" onclick="optimizeForATS()" class="suggestion-btn ats" title="ATS-Optimierung">
                            <i class="fas fa-robot"></i>
                            ATS-Check
                        </button>
                        <button type="button" onclick="industryOptimize()" class="suggestion-btn industry" title="Branchen-Optimierung">
                            <i class="fas fa-industry"></i>
                            Branche
                        </button>
                        <button type="button" onclick="quickPreview()" class="suggestion-btn preview" title="Schnellvorschau">
                            <i class="fas fa-eye"></i>
                            Preview
                        </button>
                        <button type="button" onclick="shareForReview()" class="suggestion-btn share" title="Zur Überprüfung teilen">
                            <i class="fas fa-share-alt"></i>
                            Teilen
                        </button>
                    </div>
                </div>

                <div class="primary-actions">
                    <button onclick="previousWorkflowStep(3)" 
                            class="btn-secondary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <i class="fas fa-arrow-left"></i> 
                        <span>Zurück</span>
                    </button>
                    <button onclick="nextWorkflowStep(5)" 
                            id="continueStep4Btn" 
                            class="btn-primary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <span class="btn-content">
                            <span class="btn-text">Weiter zu Design & Layout</span>
                            <i class="fas fa-arrow-right btn-icon"></i>
                        </span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>

            <!-- OPTIMIZATION 10: Live Progress Tracker with Milestone Celebrations -->
            <div class="progress-tracker" id="progressTracker" style="position: fixed; top: 2rem; right: 2rem; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 1000; max-width: 250px;">
                <div class="tracker-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h6 style="margin: 0; color: #374151; font-size: 0.875rem;">📈 Fortschritt</h6>
                    <button onclick="toggleProgressTracker()" style="background: none; border: none; color: #6b7280; cursor: pointer;">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
                
                <div class="progress-items" style="font-size: 0.75rem;">
                    <div class="progress-item completed">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                        <span>Stellenanalyse (100%)</span>
                    </div>
                    <div class="progress-item completed">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                        <span>Requirements (100%)</span>
                    </div>
                    <div class="progress-item completed">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                        <span>Anschreiben (100%)</span>
                    </div>
                    <div class="progress-item current">
                        <i class="fas fa-clock" style="color: #f59e0b;"></i>
                        <span>Dokumente (67%)</span>
                    </div>
                    <div class="progress-item">
                        <i class="fas fa-circle" style="color: #d1d5db;"></i>
                        <span>Design (0%)</span>
                    </div>
                    <div class="progress-item">
                        <i class="fas fa-circle" style="color: #d1d5db;"></i>
                        <span>Final Package (0%)</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Helper function to inject Step 4 styles
function injectStep4Styles() {
    if (document.getElementById('step4-styles')) return;
    
    const styles = `
        <style id="step4-styles">
            /* Step 4 Optimizations */
            .step4-optimized .milestone .progress-fill {
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                position: relative;
            }
            
            .step4-optimized .milestone-marker {
                position: absolute;
                top: -8px;
                width: 20px;
                height: 20px;
                background: #fbbf24;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 0.75rem;
                animation: bounce 2s infinite;
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .step4-optimized .milestone-text {
                text-align: center;
                color: #8b5cf6;
                font-weight: 600;
                margin-top: 1rem;
                animation: fadeInUp 1s ease-out;
            }
            
            .step4-optimized .document-card {
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .step4-optimized .document-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }
            
            .step4-optimized .document-card.active {
                border-color: #8b5cf6;
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
            }
            
            .step4-optimized .card-gradient-bg {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05));
                border-radius: 12px;
            }
            
            .step4-optimized .doc-action-btn {
                transition: all 0.3s ease;
            }
            
            .step4-optimized .doc-action-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            
            .step4-optimized .progress-animation-bg {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                animation: progressShimmer 3s infinite;
            }
            
            @keyframes progressShimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .step4-optimized .export-option {
                transition: all 0.3s ease;
            }
            
            .step4-optimized .export-option:hover {
                border-color: #8b5cf6;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
            }
            
            .step4-optimized .progress-tracker {
                animation: slideInRight 0.3s ease-out;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Helper Functions (placeholder implementations)
window.showStep4Help = function() { alert('Schritt 4 Hilfe wird angezeigt...'); };
window.editCV = function() { alert('CV-Editor wird geöffnet...'); };
window.previewCV = function() { alert('CV-Vorschau wird angezeigt...'); };
window.refineLetter = function() { alert('Anschreiben wird verfeinert...'); };
window.exportLetter = function() { alert('Anschreiben wird exportiert...'); };
window.addDocuments = function() { alert('Dokument-Upload wird geöffnet...'); };
window.handleDocumentDrop = function(e) { console.log('Document dropped:', e); };
window.handleDocumentDragOver = function(e) { e.preventDefault(); };
window.aiOptimizeCV = function() { alert('KI-Optimierung wird gestartet...'); };
window.addExperience = function() { alert('Berufserfahrung hinzufügen...'); };
window.changeTemplate = function() { alert('Template wird geändert...'); };
window.filterTemplates = function(category) { alert(`Filter auf ${category} angewendet...`); };
window.selectExportOption = function(option) { alert(`Export-Option ${option} ausgewählt...`); };
window.startBatchExport = function() { alert('Batch-Export wird gestartet...'); };
window.optimizeForATS = function() { alert('ATS-Optimierung wird durchgeführt...'); };
window.industryOptimize = function() { alert('Branchen-Optimierung wird angewendet...'); };
window.quickPreview = function() { alert('Schnellvorschau wird angezeigt...'); };
window.shareForReview = function() { alert('Dokumente werden zum Review geteilt...'); };
window.toggleProgressTracker = function() { 
    const tracker = document.getElementById('progressTracker');
    if (tracker) tracker.style.display = tracker.style.display === 'none' ? 'block' : 'none';
};
window.addButtonEffect = function(btn, type) { console.log('Button effect:', type); };
window.removeButtonEffect = function(btn, type) { console.log('Button effect removed:', type); };

console.log('✅ Step 4 Modul geladen');
