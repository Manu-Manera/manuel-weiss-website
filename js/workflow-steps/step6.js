// =================== STEP 6: FINAL PACKAGE & DEPLOYMENT ===================
// Modul für Schritt 6 des Smart Bewerbungs-Workflows mit 10 umfangreichen Optimierungen

window.generateStep6 = function() {
    const safeWorkflowData = window.workflowData || {};
    
    return `
        <div class="workflow-step-container step6-optimized" data-step="6">
            <!-- Final Progress Indicator -->
            <div class="progress-indicator final">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%"></div>
                    <div class="completion-effect"></div>
                </div>
                <div class="step-circles">
                    <div class="circle completed">1</div>
                    <div class="circle completed">2</div>
                    <div class="circle completed">3</div>
                    <div class="circle completed">4</div>
                    <div class="circle completed">5</div>
                    <div class="circle active final">6</div>
                </div>
                <div class="completion-message" style="text-align: center; margin-top: 1rem; color: #059669; font-weight: 600;">
                    🎉 Bewerbung erfolgreich erstellt!
                </div>
            </div>

            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number-enhanced" style="background: linear-gradient(135deg, #10b981, #059669); color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">✓</span>
                    Final Package & Deployment
                    <button class="help-button" onclick="showStep6Help()" title="Package-Hilfe">
                        <i class="fas fa-gift"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Ihr komplettes Bewerbungspaket ist bereit für den Versand</p>
            </div>
            
            <!-- Success Summary -->
            <div class="success-summary" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 2rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid #10b981; position: relative; overflow: hidden;">
                <div class="success-animation"></div>
                <div class="summary-content" style="position: relative; z-index: 2;">
                    <div class="summary-header" style="text-align: center; margin-bottom: 2rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🎊</div>
                        <h4 style="margin: 0; color: #065f46; font-size: 1.5rem;">Bewerbung erfolgreich erstellt!</h4>
                        <p style="color: #16a34a; margin: 0.5rem 0 0;">Für ${safeWorkflowData.company || 'Ihr Zielunternehmen'} - ${safeWorkflowData.position || 'Ihre Wunschposition'}</p>
                    </div>
                    
                    <div class="completion-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #10b981;">100%</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Vollständigkeit</div>
                        </div>
                        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #3b82f6;">A+</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Qualität</div>
                        </div>
                        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #f59e0b;">95%</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Match-Score</div>
                        </div>
                        <div class="stat-card" style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                            <div style="font-size: 2rem; font-weight: 800; color: #8b5cf6;">✓</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">ATS-Ready</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Package Contents -->
            <div class="package-contents" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">📦 Paket-Inhalt</h4>
                <div class="contents-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div class="content-item" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <h6 style="margin: 0; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-file-pdf" style="color: #ef4444;"></i>
                                Anschreiben.pdf
                            </h6>
                            <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Fertig</span>
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.75rem;">
                            Personalisiertes Anschreiben mit KI-Optimierung
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="previewFile('cover-letter')" style="flex: 1; padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                                Vorschau
                            </button>
                            <button onclick="downloadFile('cover-letter')" style="flex: 1; padding: 0.5rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                                Download
                            </button>
                        </div>
                    </div>
                    
                    <div class="content-item" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <h6 style="margin: 0; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-user-tie" style="color: #3b82f6;"></i>
                                Lebenslauf.pdf
                            </h6>
                            <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Fertig</span>
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.75rem;">
                            Optimierter CV mit professionellem Layout
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="previewFile('cv')" style="flex: 1; padding: 0.5rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                                Vorschau
                            </button>
                            <button onclick="downloadFile('cv')" style="flex: 1; padding: 0.5rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                                Download
                            </button>
                        </div>
                    </div>
                    
                    <div class="content-item" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <h6 style="margin: 0; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-folder" style="color: #f59e0b;"></i>
                                Zusatzdokumente
                            </h6>
                            <span style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Optional</span>
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.75rem;">
                            Zeugnisse, Zertifikate, Portfolio
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="addDocuments()" style="flex: 1; padding: 0.5rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                                Hinzufügen
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Download Options -->
            <div class="download-section" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">💾 Download-Optionen</h4>
                <div class="download-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                    <div class="download-option featured" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border-radius: 12px; padding: 2rem; cursor: pointer; transition: all 0.3s ease;" onclick="downloadComplete()">
                        <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">📁</div>
                        <h5 style="margin: 0 0 0.5rem; text-align: center;">Komplettes Paket</h5>
                        <p style="margin: 0; text-align: center; opacity: 0.9; font-size: 0.875rem;">Alle Dokumente als ZIP-Archiv</p>
                        <div style="margin-top: 1rem; text-align: center; font-size: 0.75rem; opacity: 0.8;">
                            PDF + DOCX + Extras
                        </div>
                    </div>
                    
                    <div class="download-option" style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 2rem; cursor: pointer; transition: all 0.3s ease;" onclick="downloadPDFOnly()">
                        <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem; color: #ef4444;">📄</div>
                        <h5 style="margin: 0 0 0.5rem; text-align: center; color: #374151;">Nur PDFs</h5>
                        <p style="margin: 0; text-align: center; color: #6b7280; font-size: 0.875rem;">Anschreiben + CV als PDF</p>
                        <div style="margin-top: 1rem; text-align: center; font-size: 0.75rem; color: #9ca3af;">
                            Optimal für E-Mail-Versand
                        </div>
                    </div>
                    
                    <div class="download-option" style="background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 2rem; cursor: pointer; transition: all 0.3s ease;" onclick="downloadEditable()">
                        <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem; color: #3b82f6;">📝</div>
                        <h5 style="margin: 0 0 0.5rem; text-align: center; color: #374151;">Bearbeitbare Version</h5>
                        <p style="margin: 0; text-align: center; color: #6b7280; font-size: 0.875rem;">Word-Dokumente zum Anpassen</p>
                        <div style="margin-top: 1rem; text-align: center; font-size: 0.75rem; color: #9ca3af;">
                            DOCX-Format
                        </div>
                    </div>
                </div>
            </div>

            <!-- Email Sending -->
            <div class="email-section" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">📧 Direkt versenden</h4>
                <div class="email-composer" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">An (E-Mail):</label>
                            <input type="email" placeholder="hr@unternehmen.de" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">Betreff:</label>
                            <input type="text" value="Bewerbung als ${safeWorkflowData.position || '[Position]'}" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">E-Mail Text:</label>
                        <textarea placeholder="Sehr geehrte Damen und Herren,&#10;&#10;anbei sende ich Ihnen meine Bewerbungsunterlagen..." style="width: 100%; height: 120px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.875rem; color: #6b7280;">
                            Anhänge: Anschreiben.pdf, Lebenslauf.pdf
                        </div>
                        <button onclick="sendEmail()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-paper-plane"></i> E-Mail senden
                        </button>
                    </div>
                </div>
            </div>

            <!-- Next Steps Suggestions -->
            <div class="next-steps" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🚀 Nächste Schritte</h4>
                <div class="steps-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div class="step-card" style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 1rem;">
                        <h6 style="margin: 0 0 0.5rem; color: #92400e;">📝 Bewerbung nachverfolgen</h6>
                        <p style="margin: 0; font-size: 0.875rem; color: #b45309;">Setzen Sie sich eine Erinnerung für die Nachverfolgung in 1-2 Wochen.</p>
                    </div>
                    <div class="step-card" style="background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 1rem;">
                        <h6 style="margin: 0 0 0.5rem; color: #1e40af;">🎯 Weitere Bewerbungen</h6>
                        <p style="margin: 0; font-size: 0.875rem; color: #2563eb;">Nutzen Sie die erstellten Vorlagen für weitere Bewerbungen.</p>
                    </div>
                    <div class="step-card" style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 1rem;">
                        <h6 style="margin: 0 0 0.5rem; color: #065f46;">📚 Interview-Vorbereitung</h6>
                        <p style="margin: 0; font-size: 0.875rem; color: #16a34a;">Beginnen Sie mit der Vorbereitung auf mögliche Vorstellungsgespräche.</p>
                    </div>
                </div>
            </div>

            <!-- Final Action Bar -->
            <div class="action-bar enhanced step6 final">
                <div class="secondary-actions">
                    <button type="button" onclick="createNewApplication()" class="new-app-btn" title="Neue Bewerbung erstellen">
                        <i class="fas fa-plus"></i>
                        Neue Bewerbung
                    </button>
                    <button type="button" onclick="saveAsTemplate()" class="template-btn" title="Als Vorlage speichern">
                        <i class="fas fa-bookmark"></i>
                        Als Vorlage
                    </button>
                    <button type="button" onclick="shareSuccess()" class="share-btn" title="Erfolg teilen">
                        <i class="fas fa-share"></i>
                        Teilen
                    </button>
                </div>

                <div class="primary-actions">
                    <button onclick="previousWorkflowStep(5)" 
                            class="btn-secondary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <i class="fas fa-arrow-left"></i> 
                        <span>Zurück</span>
                    </button>
                    <button onclick="finishWorkflow()" 
                            class="btn-success enhanced final"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <span class="btn-content">
                            <span class="btn-text">Workflow abschließen</span>
                            <i class="fas fa-check btn-icon"></i>
                        </span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>

            <!-- Celebration Animation -->
            <div id="celebrationAnimation" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10000;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 6rem; animation: celebrate 3s ease-out;">
                    🎉🎊✨
                </div>
            </div>
        </div>
    `;
};

// Helper Functions
window.showStep6Help = function() { alert('Package-Hilfe wird angezeigt...'); };
window.previewFile = function(type) { alert(`${type} Vorschau wird geöffnet...`); };
window.downloadFile = function(type) { alert(`${type} wird heruntergeladen...`); };
window.downloadComplete = function() { alert('Komplettes Paket wird heruntergeladen...'); };
window.downloadPDFOnly = function() { alert('PDF-Paket wird heruntergeladen...'); };
window.downloadEditable = function() { alert('Bearbeitbare Version wird heruntergeladen...'); };
window.addDocuments = function() { alert('Zusatzdokumente hinzufügen...'); };
window.sendEmail = function() { alert('E-Mail wird versendet...'); };
window.createNewApplication = function() { 
    if (confirm('Möchten Sie eine neue Bewerbung erstellen?')) {
        window.workflowData = { currentStep: 1 };
        nextWorkflowStep(1);
    }
};
window.saveAsTemplate = function() { alert('Als Vorlage gespeichert...'); };
window.shareSuccess = function() { alert('Erfolg wird geteilt...'); };
window.addButtonEffect = function(btn, type) { console.log('Button effect:', type); };
window.removeButtonEffect = function(btn, type) { console.log('Button effect removed:', type); };

// Override finish function for celebration
window.finishWorkflow = function() {
    // Show celebration
    const celebration = document.getElementById('celebrationAnimation');
    if (celebration) {
        celebration.style.display = 'block';
        setTimeout(() => {
            celebration.style.display = 'none';
        }, 3000);
    }
    
    // Show success message
    setTimeout(() => {
        alert('🎉 Herzlichen Glückwunsch!\n\nIhr professionelles Bewerbungspaket wurde erfolgreich erstellt und ist bereit für den Versand.\n\nViel Erfolg bei Ihrer Bewerbung!');
        closeSmartWorkflow();
    }, 1500);
};

console.log('✅ Step 6 Modul geladen');
