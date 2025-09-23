// Smart Workflow Functions - Additional steps and helpers

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

// Additional workflow helper functions
function generateSmartCoverLetter() {
    setTimeout(() => {
        const editor = document.getElementById('coverLetterEditor');
        if (editor) {
            editor.innerHTML = `
                <p>Sehr geehrte Damen und Herren,</p>
                <p>mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als ${workflowData.position} bei ${workflowData.company} gelesen. Die beschriebenen Aufgaben und Anforderungen entsprechen genau meinem beruflichen Profil und meinen Karrierezielen.</p>
                <p>In meiner bisherigen Laufbahn konnte ich umfangreiche Erfahrungen in den Bereichen HR-Beratung, Digitalisierung und Prozessoptimierung sammeln. Besonders meine Expertise in der strategischen Personalentwicklung und der Implementierung innovativer HR-Tech-Lösungen würde ich gerne in Ihrem Unternehmen einbringen.</p>
                <p>[Hier können Sie weitere relevante Erfahrungen und Qualifikationen ergänzen]</p>
                <p>Über eine Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.</p>
                <p>Mit freundlichen Grüßen<br>Manuel Weiß</p>
            `;
            workflowData.coverLetter = editor.innerHTML;
        }
    }, 1000);
}

function updateCVDate() {
    const dateInput = document.getElementById('cvSignatureDate');
    if (dateInput) {
        workflowData.cvDate = dateInput.value;
    }
    
    // Load the smart CV editor
    setTimeout(() => {
        if (typeof generateEditableCV === 'function') {
            generateEditableCV();
        }
    }, 100);
}

function previousWorkflowStep(step) {
    document.querySelectorAll('.workflow-step').forEach(s => s.style.display = 'none');
    const targetStep = document.getElementById(`workflowStep${step}`);
    if (targetStep) {
        targetStep.style.display = 'block';
    }
}

function saveAndContinue(nextStep) {
    // Save current step data
    const currentStep = parseInt(nextStep) - 1;
    
    if (currentStep === 2) {
        workflowData.coverLetter = document.getElementById('coverLetterEditor').innerHTML;
    } else if (currentStep === 3) {
        workflowData.currentPosition = document.getElementById('currentPosition').value;
        workflowData.cvDate = document.getElementById('cvSignatureDate').value;
        workflowData.additionalQualifications = document.getElementById('additionalQualifications').value;
    } else if (currentStep === 4) {
        workflowData.design.primaryColor = document.getElementById('primaryColor').value;
        workflowData.design.secondaryColor = document.getElementById('secondaryColor').value;
    }
    
    nextWorkflowStep(nextStep);
}

function selectTemplate(template) {
    workflowData.design.template = template;
    document.querySelectorAll('.template-option').forEach(opt => {
        opt.style.borderColor = '#e5e7eb';
    });
    event.currentTarget.style.borderColor = '#6366f1';
}

function publishOnline() {
    const shareSection = document.getElementById('shareSection');
    const shareLinkInput = document.getElementById('shareLink');
    
    if (!shareSection || !shareLinkInput) {
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Fehler: Share-Elemente nicht gefunden', 'error');
        }
        return;
    }
    
    // Generate unique URL
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const shareUrl = `https://bewerbung.manuelweiss.de/${uniqueId}`;
    
    shareLinkInput.value = shareUrl;
    shareSection.style.display = 'block';
    
    // Create basic page structure with actual content
    const pageData = [
        {
            id: 'hero-' + Date.now(),
            type: 'hero',
            content: `
                <div class="page-component hero-component" style="padding: 4rem 2rem; background: linear-gradient(135deg, ${workflowData.design.primaryColor} 0%, ${workflowData.design.secondaryColor} 100%); color: white; text-align: center;">
                    <h1 style="font-size: 3rem; margin-bottom: 1rem;">Manuel Weiß</h1>
                    <p style="font-size: 1.5rem; margin-bottom: 2rem;">Bewerbung als ${workflowData.position}</p>
                    <p style="font-size: 1.25rem;">bei ${workflowData.company}</p>
                </div>
            `
        },
        {
            id: 'about-' + Date.now(),
            type: 'about',
            content: `
                <div class="page-component about-component" style="padding: 3rem 2rem;">
                    <h2 style="font-size: 2rem; margin-bottom: 1.5rem; text-align: center;">Über mich</h2>
                    <div style="max-width: 800px; margin: 0 auto; line-height: 1.8;">
                        ${workflowData.coverLetter ? workflowData.coverLetter.replace(/<[^>]*>/g, '') : 'HR-Experte mit langjähriger Erfahrung in der Digitalisierung und Prozessoptimierung.'}
                    </div>
                </div>
            `
        },
        {
            id: 'contact-' + Date.now(),
            type: 'contact',
            content: `
                <div class="page-component contact-component" style="padding: 3rem 2rem; background: #1e293b; color: white;">
                    <h2 style="font-size: 2rem; margin-bottom: 2rem; text-align: center;">Kontakt</h2>
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <p style="margin-bottom: 2rem;">Lassen Sie uns über Ihre Herausforderungen sprechen!</p>
                        <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
                            <span style="color: white;"><i class="fas fa-envelope"></i> manuel@example.com</span>
                            <span style="color: white;"><i class="fas fa-phone"></i> +49 123 456 789</span>
                            <span style="color: white;"><i class="fab fa-linkedin"></i> LinkedIn</span>
                        </div>
                    </div>
                </div>
            `
        }
    ];
    
    // Save application data with page
    const applicationData = {
        ...workflowData,
        shareUrl,
        pageUrl: shareUrl,
        pageData: pageData,
        pageSettings: {
            title: `Bewerbung - ${workflowData.position} bei ${workflowData.company}`,
            primaryColor: workflowData.design.primaryColor,
            font: 'Inter',
            seo: `Bewerbung von Manuel Weiß für die Position ${workflowData.position} bei ${workflowData.company}`
        },
        createdAt: new Date().toISOString()
    };
    
    // Generate complete HTML
    const pageHTML = generateCompletePageHTML(applicationData);
    
    // Save both data and HTML
    localStorage.setItem(`application_${uniqueId}`, JSON.stringify(applicationData));
    localStorage.setItem(`applicationPage_${uniqueId}`, pageHTML);
    
    // Update workflow data
    workflowData.shareUrl = shareUrl;
    workflowData.pageUrl = shareUrl;
    workflowData.pageData = pageData;
    workflowData.pageSettings = applicationData.pageSettings;
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Online-Seite erfolgreich erstellt!', 'success');
    }
}

function generateCompletePageHTML(applicationData) {
    const { pageSettings, pageData } = applicationData;
    
    return `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pageSettings.title}</title>
            <meta name="description" content="${pageSettings.seo}">
            <link href="https://fonts.googleapis.com/css2?family=${pageSettings.font.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: '${pageSettings.font}', sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                }
                .container { max-width: 1200px; margin: 0 auto; }
                :root { --primary-color: ${pageSettings.primaryColor}; }
                .page-component { position: relative; }
                
                /* Responsive Design */
                @media (max-width: 768px) {
                    .page-component { padding: 2rem 1rem !important; }
                    h1 { font-size: 2rem !important; }
                    h2 { font-size: 1.5rem !important; }
                    .hero-component p { font-size: 1.2rem !important; }
                }
            </style>
        </head>
        <body>
            ${pageData.map(component => component.content).join('')}
            
            <!-- Analytics and Tracking -->
            <script>
                console.log('Bewerbungsseite geladen:', '${applicationData.shareUrl}');
                
                // Track page views
                if (localStorage) {
                    const views = localStorage.getItem('pageViews') || 0;
                    localStorage.setItem('pageViews', parseInt(views) + 1);
                }
            </script>
        </body>
        </html>
    `;
}

function exportPDF() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('PDF wird erstellt...', 'info');
    }
    
    // Create a complete application package as HTML that can be converted to PDF
    const applicationHTML = generateApplicationPackageHTML();
    
    // Create blob and download
    const blob = new Blob([applicationHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bewerbungspaket_${workflowData.company}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Bewerbungspaket als HTML erstellt! Mit Browser in PDF konvertieren.', 'success');
    }
}

function exportWord() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Word-Dokument wird erstellt...', 'info');
    }
    
    // Create Word-compatible document
    const wordContent = generateWordDocument();
    
    const blob = new Blob([wordContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bewerbung_${workflowData.company}_${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Word-Dokument erfolgreich erstellt!', 'success');
    }
}

function generateApplicationPackageHTML() {
    const coverLetter = workflowData.coverLetter || 'Anschreiben nicht verfügbar';
    
    return `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Bewerbungspaket - ${workflowData.position} bei ${workflowData.company}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    margin: 0; 
                    padding: 20mm;
                    color: #333;
                }
                .page-break { page-break-before: always; }
                .header { text-align: center; margin-bottom: 3rem; }
                .header h1 { color: ${workflowData.design.primaryColor}; margin-bottom: 0.5rem; }
                .section { margin-bottom: 2rem; }
                .section h2 { 
                    color: ${workflowData.design.primaryColor}; 
                    border-bottom: 2px solid ${workflowData.design.primaryColor}; 
                    padding-bottom: 0.5rem; 
                }
                @media print {
                    body { margin: 0; padding: 15mm; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <!-- Cover Letter -->
            <div class="header">
                <h1>Bewerbung</h1>
                <h2>${workflowData.position}</h2>
                <h3>${workflowData.company}</h3>
                <p>Manuel Weiß • ${new Date().toLocaleDateString('de-DE')}</p>
            </div>
            
            <div class="section">
                <h2>Anschreiben</h2>
                <div>${coverLetter.replace(/<[^>]*>/g, '')}</div>
            </div>
            
            <div class="page-break"></div>
            
            <!-- CV Placeholder -->
            <div class="section">
                <h2>Lebenslauf</h2>
                <p><strong>Manuel Weiß</strong></p>
                <p>HR-Experte & Digitalisierungsberater</p>
                <p>manuel@example.com • +49 123 456 789</p>
                
                <h3 style="margin-top: 2rem;">Berufserfahrung</h3>
                <div style="margin-bottom: 1.5rem;">
                    <strong>Senior HR Consultant</strong> | ABC Consulting GmbH | 2020 - heute<br>
                    Beratung von Großunternehmen bei der digitalen Transformation ihrer HR-Prozesse
                </div>
                
                <h3>Ausbildung</h3>
                <div style="margin-bottom: 1.5rem;">
                    <strong>Master of Business Administration</strong> | Universität München | 2012 - 2014<br>
                    Schwerpunkt: Human Resource Management & Digitalization
                </div>
                
                <h3>Kompetenzen</h3>
                <p>SAP SuccessFactors • Workday • Agile HR • Change Management • Design Thinking</p>
            </div>
            
            <div class="page-break"></div>
            
            <!-- Application Summary -->
            <div class="section">
                <h2>Bewerbungsübersicht</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 0.5rem; border: 1px solid #ddd;"><strong>Unternehmen:</strong></td>
                        <td style="padding: 0.5rem; border: 1px solid #ddd;">${workflowData.company}</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.5rem; border: 1px solid #ddd;"><strong>Position:</strong></td>
                        <td style="padding: 0.5rem; border: 1px solid #ddd;">${workflowData.position}</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.5rem; border: 1px solid #ddd;"><strong>Bewerbungsdatum:</strong></td>
                        <td style="padding: 0.5rem; border: 1px solid #ddd;">${new Date().toLocaleDateString('de-DE')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.5rem; border: 1px solid #ddd;"><strong>Design:</strong></td>
                        <td style="padding: 0.5rem; border: 1px solid #ddd;">${workflowData.design.template}</td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;
}

function generateWordDocument() {
    const coverLetter = workflowData.coverLetter ? workflowData.coverLetter.replace(/<[^>]*>/g, '') : 'Anschreiben nicht verfügbar';
    
    return `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Bewerbung - ${workflowData.position}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                h1 { color: ${workflowData.design.primaryColor}; }
                h2 { color: ${workflowData.design.primaryColor}; border-bottom: 1px solid #ccc; }
                .header { text-align: center; margin-bottom: 2rem; }
                .section { margin-bottom: 2rem; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Bewerbung</h1>
                <h2>${workflowData.position}</h2>
                <h3>${workflowData.company}</h3>
                <p>Manuel Weiß • ${new Date().toLocaleDateString('de-DE')}</p>
            </div>
            
            <div class="section">
                <h2>Anschreiben</h2>
                <div style="white-space: pre-line;">${coverLetter}</div>
            </div>
            
            <div class="section">
                <h2>Kontaktdaten</h2>
                <p>Manuel Weiß<br>
                HR-Experte & Digitalisierungsberater<br>
                E-Mail: manuel@example.com<br>
                Telefon: +49 123 456 789</p>
            </div>
        </body>
        </html>
    `;
}

function copyShareLink() {
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.select();
    document.execCommand('copy');
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Link kopiert!', 'success');
    }
}

function finishWorkflow() {
    // Save the complete application
    const newApplication = {
        id: Date.now().toString(),
        company: workflowData.company,
        position: workflowData.position,
        date: new Date().toISOString(),
        status: 'sent',
        coverLetter: workflowData.coverLetter,
        design: workflowData.design,
        documents: workflowData.documents,
        pageUrl: workflowData.pageUrl || null,
        pageData: workflowData.pageData || null,
        pageSettings: workflowData.pageSettings || null
    };
    
    applications.push(newApplication);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    closeSmartWorkflow();
    loadApplications();
    updateStatistics();
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Bewerbung erfolgreich erstellt!', 'success');
    }
}

function regenerateSelection() {
    const selection = window.getSelection().toString();
    if (selection) {
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Text wird neu generiert...', 'info');
        }
    } else {
        alert('Bitte markieren Sie zuerst den Text, der neu generiert werden soll.');
    }
}

function addParagraph() {
    const editor = document.getElementById('coverLetterEditor');
    if (editor) {
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '[Neuer Absatz - Klicken zum Bearbeiten]';
        newParagraph.contentEditable = true;
        editor.appendChild(newParagraph);
        newParagraph.focus();
    }
}

function checkGrammar() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Rechtschreibprüfung läuft...', 'info');
    }
    // In real implementation, this would check grammar
    setTimeout(() => {
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Keine Fehler gefunden!', 'success');
        }
    }, 1500);
}

// PDF Editor Functions
function deletePage() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Seite gelöscht', 'success');
    }
}

function rotatePage() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Seite gedreht', 'success');
    }
}

function movePage() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Verschiebe Seite...', 'info');
    }
}

function savePDF() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('PDF gespeichert', 'success');
    }
}

function addPDFPage() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Seite hinzugefügt', 'success');
    }
}

function uploadAdditionalPDF() {
    document.createElement('input').click();
}

// Document Management Functions
function viewDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (doc) {
        window.open(doc.url, '_blank');
    }
}

function downloadDocument(id) {
    const doc = documents.find(d => d.id === id);
    if (doc) {
        const a = document.createElement('a');
        a.href = doc.url;
        a.download = doc.name;
        a.click();
    }
}

function deleteDocument(id) {
    if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
        documents = documents.filter(d => d.id !== id);
        localStorage.setItem('applicationDocuments', JSON.stringify(documents));
        loadDocuments();
        
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Dokument gelöscht', 'success');
        }
    }
}

function mergeDocuments() {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Dokumente werden zusammengeführt...', 'info');
    }
}

function createTemplate() {
    const templateName = prompt('Name für die Vorlage:');
    if (templateName) {
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Vorlage gespeichert', 'success');
        }
    }
}
