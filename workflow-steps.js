function generateStep4() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 4: Design & Layout</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div>
                <h4 style="margin-bottom: 1rem;">Unternehmensfarben</h4>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Primärfarbe:</label>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <input type="color" id="primaryColor" value="${workflowData.design.primaryColor}" style="width: 80px; height: 40px; border: none; border-radius: 6px; cursor: pointer;">
                        <input type="text" id="primaryColorHex" value="${workflowData.design.primaryColor}" style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Sekundärfarbe:</label>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <input type="color" id="secondaryColor" value="${workflowData.design.secondaryColor}" style="width: 80px; height: 40px; border: none; border-radius: 6px; cursor: pointer;">
                        <input type="text" id="secondaryColorHex" value="${workflowData.design.secondaryColor}" style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Unternehmenslogo:</label>
                    <div style="border: 2px dashed #6366f1; border-radius: 8px; padding: 1.5rem; text-align: center; background: #f8f9ff;">
                        <input type="file" id="companyLogo" accept="image/*" style="display: none;">
                        <i class="fas fa-image" style="font-size: 2rem; color: #6366f1; margin-bottom: 0.5rem;"></i>
                        <p style="margin-bottom: 0.5rem;">Logo hochladen</p>
                        <button onclick="document.getElementById('companyLogo').click()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Datei auswählen
                        </button>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: 1rem;">Vorlagen-Auswahl</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="template-option" onclick="selectTemplate('modern')" style="border: 2px solid #6366f1; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: center;">
                        <i class="fas fa-file-alt" style="font-size: 3rem; color: #6366f1; margin-bottom: 0.5rem;"></i>
                        <p style="font-weight: 600; margin: 0;">Modern</p>
                        <p style="font-size: 0.875rem; color: #666; margin: 0;">Klar & Professional</p>
                    </div>
                    
                    <div class="template-option" onclick="selectTemplate('creative')" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: center;">
                        <i class="fas fa-palette" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 0.5rem;"></i>
                        <p style="font-weight: 600; margin: 0;">Kreativ</p>
                        <p style="font-size: 0.875rem; color: #666; margin: 0;">Farbenfroh & Einzigartig</p>
                    </div>
                    
                    <div class="template-option" onclick="selectTemplate('classic')" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: center;">
                        <i class="fas fa-university" style="font-size: 3rem; color: #1e293b; margin-bottom: 0.5rem;"></i>
                        <p style="font-weight: 600; margin: 0;">Klassisch</p>
                        <p style="font-size: 0.875rem; color: #666; margin: 0;">Traditionell & Seriös</p>
                    </div>
                    
                    <div class="template-option" onclick="selectTemplate('minimal')" style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; text-align: center;">
                        <i class="fas fa-minus" style="font-size: 3rem; color: #6b7280; margin-bottom: 0.5rem;"></i>
                        <p style="font-weight: 600; margin: 0;">Minimal</p>
                        <p style="font-size: 0.875rem; color: #666; margin: 0;">Schlicht & Elegant</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 2rem; background: #f8fafc; padding: 1.5rem; border-radius: 8px;">
            <h4 style="margin-bottom: 1rem;">Vorschau</h4>
            <div id="designPreview" style="min-height: 300px; background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 2rem;">
                <p style="text-align: center; color: #666;">Design-Vorschau wird geladen...</p>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
            <button onclick="previousWorkflowStep(3)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAndContinue(5)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

function generateStep5() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 5: Veröffentlichung & Export</h3>
        
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">Zusammenfassung</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <p style="margin: 0.5rem 0;"><strong>Unternehmen:</strong> ${workflowData.company}</p>
                    <p style="margin: 0.5rem 0;"><strong>Position:</strong> ${workflowData.position}</p>
                </div>
                <div>
                    <p style="margin: 0.5rem 0;"><strong>Dokumente:</strong> Anschreiben, Lebenslauf, Zeugnisse</p>
                    <p style="margin: 0.5rem 0;"><strong>Design:</strong> ${workflowData.design.template}</p>
                </div>
            </div>
        </div>
        
        <h4 style="margin-bottom: 1rem;">Veröffentlichungsoptionen</h4>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; text-align: center;">
                <i class="fas fa-globe" style="font-size: 3rem; color: #6366f1; margin-bottom: 1rem;"></i>
                <h5 style="margin-bottom: 0.5rem;">Online-Seite</h5>
                <p style="color: #666; font-size: 0.875rem; margin-bottom: 1rem;">Erstelle eine teilbare Webseite</p>
                <button onclick="publishOnline()" style="width: 100%; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-link"></i> Link generieren
                </button>
            </div>
            
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; text-align: center;">
                <i class="fas fa-file-pdf" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <h5 style="margin-bottom: 0.5rem;">PDF Export</h5>
                <p style="color: #666; font-size: 0.875rem; margin-bottom: 1rem;">Download als PDF-Dokument</p>
                <button onclick="exportPDF()" style="width: 100%; padding: 0.75rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-download"></i> PDF erstellen
                </button>
            </div>
            
            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; text-align: center;">
                <i class="fas fa-file-word" style="font-size: 3rem; color: #0061a8; margin-bottom: 1rem;"></i>
                <h5 style="margin-bottom: 0.5rem;">Word Export</h5>
                <p style="color: #666; font-size: 0.875rem; margin-bottom: 1rem;">Download als Word-Dokument</p>
                <button onclick="exportWord()" style="width: 100%; padding: 0.75rem; background: #0061a8; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-download"></i> Word erstellen
                </button>
            </div>
        </div>
        
        <div id="shareSection" style="display: none; background: #e0f2fe; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">🎉 Bewerbung erfolgreich erstellt!</h4>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <input type="text" id="shareLink" value="" readonly style="flex: 1; padding: 0.75rem; border: 1px solid #0284c7; border-radius: 6px; background: white;">
                <button onclick="copyShareLink()" style="padding: 0.75rem 1.5rem; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-copy"></i> Kopieren
                </button>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(4)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="finishWorkflow()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-check"></i> Abschließen
            </button>
        </div>
    `;
}
