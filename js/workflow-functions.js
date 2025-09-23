// Smart Workflow Functions - Additional steps and helpers

// Workflow Data Management
let workflowData = {
    currentStep: 1,
    company: '',
    position: '',
    jobDescription: '',
    coverLetter: '',
    cv: null,
    design: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2'
    },
    requirements: [],
    selectedRequirements: []
};

// Generate Step 1: Company and Position
function generateStep1() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 1: Stellenausschreibung analysieren</h3>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Unternehmen:</label>
            <input type="text" id="company" placeholder="z.B. ABC Consulting GmbH" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Position:</label>
            <input type="text" id="position" placeholder="z.B. Senior HR Consultant" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Stellenbeschreibung (vollständig einfügen):</label>
            <textarea id="jobDescription" placeholder="Fügen Sie hier die komplette Stellenausschreibung ein..." style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 200px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="closeSmartWorkflow()" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Abbrechen
            </button>
            <button onclick="saveAndContinue(2)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Generate Step 2: Requirement Analysis
function generateStep2() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 2: Anforderungsanalyse & Matching</h3>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0;"><strong>Unternehmen:</strong> ${workflowData.company}</p>
            <p style="margin: 0;"><strong>Position:</strong> ${workflowData.position}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">📋 Stellenanforderungen analysieren</h4>
            <button onclick="analyzeRequirements()" style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 1rem;">
                <i class="fas fa-search"></i> Anforderungen analysieren
            </button>
            
            <div id="requirementsAnalysis" style="display: none;">
                <!-- Requirements will be loaded here -->
            </div>
        </div>
        
        <div style="text-align: center; margin: 2rem 0;">
            <button onclick="skipToManualWriting()" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Überspringen - Ich schreibe selbst
            </button>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(1)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="proceedWithRequirements()" id="proceedButton" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: none;">
                Weiter zum Anschreiben <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Generate Step 3: Cover Letter Builder
function generateStep3() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 3: Anschreiben erstellen</h3>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0;"><strong>Unternehmen:</strong> ${workflowData.company}</p>
            <p style="margin: 0;"><strong>Position:</strong> ${workflowData.position}</p>
        </div>
        
        <!-- Source Selection -->
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Wo haben Sie die Stelle gefunden?</label>
            <select id="jobSource" onchange="updateGreeting()" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                <option value="Stellenanzeige">Stellenanzeige auf Ihrer Webseite</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Xing">Xing</option>
                <option value="Indeed">Indeed</option>
                <option value="StepStone">StepStone</option>
                <option value="Sonstiges">Sonstiges</option>
            </select>
        </div>
        
        <!-- Greeting Selection -->
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Einleitung:</label>
            <div id="greetingOptions" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <!-- Greeting options will be loaded here -->
            </div>
        </div>
        
        <!-- Main Content -->
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Hauptteil:</label>
            <div id="coverLetterContent" style="background: white; padding: 1rem; border: 1px solid #ddd; border-radius: 6px; min-height: 300px;">
                <!-- Selected requirements and responses will be shown here -->
            </div>
        </div>
        
        <!-- Closing Selection -->
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Abschluss:</label>
            <div id="closingOptions" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <!-- Closing options will be loaded here -->
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <button onclick="previewFullLetter()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-eye"></i> Vorschau
            </button>
            <button onclick="exportCoverLetterPDF()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-file-pdf"></i> Als PDF
            </button>
            <button onclick="exportCoverLetterWord()" style="padding: 0.5rem 1rem; background: #0061a8; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-file-word"></i> Als Word
            </button>
            <button onclick="exportCoverLetterODT()" style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-file-alt"></i> Als ODT
            </button>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(2)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAndContinue(4)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Analyze requirements function
async function analyzeRequirements() {
    const analysisDiv = document.getElementById('requirementsAnalysis');
    analysisDiv.style.display = 'block';
    analysisDiv.innerHTML = '<p style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Analysiere Stellenbeschreibung...</p>';
    
    // Initialize job analyzer
    if (window.jobAnalyzer) {
        await window.jobAnalyzer.analyzeUserDocuments();
    }
    
    // Analyze job description
    const requirements = window.jobAnalyzer ? window.jobAnalyzer.analyzeJobDescription(workflowData.jobDescription) : [];
    
    if (requirements.length === 0) {
        analysisDiv.innerHTML = '<p style="color: #ef4444;">Keine spezifischen Anforderungen gefunden. Bitte überprüfen Sie die Stellenbeschreibung.</p>';
        return;
    }
    
    // Store requirements in workflow data
    workflowData.requirements = requirements;
    
    // Display requirements with matching suggestions
    let html = '<div style="margin-top: 1rem;">';
    html += '<h5 style="margin-bottom: 1rem;">Gefundene Anforderungen (nach Wichtigkeit sortiert):</h5>';
    
    for (const req of requirements) {
        const suggestions = window.jobAnalyzer ? await window.jobAnalyzer.generateMatchingSuggestions(req) : [];
        req.matchingSuggestions = suggestions;
        
        const importanceColor = req.importance > 0.7 ? '#ef4444' : req.importance > 0.5 ? '#f59e0b' : '#10b981';
        
        html += `
            <div class="requirement-item" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            ${req.isRequired ? '<span style="color: #ef4444; font-weight: 600;">MUSS</span>' : '<span style="color: #10b981;">KANN</span>'}
                            <span style="background: ${importanceColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;">
                                Priorität: ${Math.round(req.importance * 100)}%
                            </span>
                        </div>
                        <p style="margin: 0; font-weight: 500;">${req.text}</p>
                    </div>
                    <input type="checkbox" id="req-${req.id}" checked style="width: 20px; height: 20px; cursor: pointer;">
                </div>
                
                <div style="background: #f8fafc; padding: 1rem; border-radius: 6px;">
                    <p style="margin: 0 0 0.75rem 0; font-weight: 500; color: #666;">Passende Formulierungen:</p>
                    <div id="suggestions-${req.id}">
                        ${suggestions.map((sug, idx) => `
                            <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
                                <input type="radio" name="suggestion-${req.id}" value="${idx}" ${idx === 0 ? 'checked' : ''} 
                                       style="margin-right: 0.5rem;">
                                <span contenteditable="true" style="outline: none; display: inline-block; padding: 0.5rem; background: white; border-radius: 4px; width: calc(100% - 30px);">
                                    ${sug.content}
                                </span>
                            </label>
                        `).join('')}
                        <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
                            <input type="radio" name="suggestion-${req.id}" value="custom" style="margin-right: 0.5rem;">
                            <span contenteditable="true" style="outline: none; display: inline-block; padding: 0.5rem; background: white; border-radius: 4px; width: calc(100% - 30px);" 
                                  placeholder="Eigene Formulierung..."></span>
                        </label>
                    </div>
                    <button onclick="regenerateSuggestions('${req.id}')" style="margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                        <i class="fas fa-sync"></i> Neue Vorschläge
                    </button>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    analysisDiv.innerHTML = html;
    document.getElementById('proceedButton').style.display = 'block';
}

// Regenerate suggestions for a requirement
async function regenerateSuggestions(reqId) {
    const req = workflowData.requirements.find(r => r.id === reqId);
    if (!req) return;
    
    // Generate new suggestions
    const newSuggestions = window.jobAnalyzer ? await window.jobAnalyzer.generateMatchingSuggestions(req) : [];
    
    // Update UI
    const suggestionsDiv = document.getElementById(`suggestions-${reqId}`);
    if (suggestionsDiv) {
        suggestionsDiv.innerHTML = newSuggestions.map((sug, idx) => `
            <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
                <input type="radio" name="suggestion-${reqId}" value="${idx}" ${idx === 0 ? 'checked' : ''} 
                       style="margin-right: 0.5rem;">
                <span contenteditable="true" style="outline: none; display: inline-block; padding: 0.5rem; background: white; border-radius: 4px; width: calc(100% - 30px);">
                    ${sug.content}
                </span>
            </label>
        `).join('') + `
        <label style="display: block; margin-bottom: 0.5rem; cursor: pointer;">
            <input type="radio" name="suggestion-${reqId}" value="custom" style="margin-right: 0.5rem;">
            <span contenteditable="true" style="outline: none; display: inline-block; padding: 0.5rem; background: white; border-radius: 4px; width: calc(100% - 30px);" 
                  placeholder="Eigene Formulierung..."></span>
        </label>
        `;
    }
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Neue Vorschläge generiert', 'success');
    }
}

// Skip to manual writing
function skipToManualWriting() {
    workflowData.skipRequirements = true;
    nextWorkflowStep(3);
}

// Proceed with selected requirements
function proceedWithRequirements() {
    // Collect selected requirements and their responses
    const selectedRequirements = [];
    
    workflowData.requirements.forEach(req => {
        const checkbox = document.getElementById(`req-${req.id}`);
        if (checkbox && checkbox.checked) {
            const selectedRadio = document.querySelector(`input[name="suggestion-${req.id}"]:checked`);
            if (selectedRadio) {
                const suggestionText = selectedRadio.nextElementSibling.textContent.trim();
                selectedRequirements.push({
                    requirement: req,
                    response: suggestionText
                });
            }
        }
    });
    
    workflowData.selectedRequirements = selectedRequirements;
    nextWorkflowStep(3);
}

// Update greeting based on source
async function updateGreeting() {
    const source = document.getElementById('jobSource').value;
    const greetingDiv = document.getElementById('greetingOptions');
    
    if (!window.jobAnalyzer || !greetingDiv) return;
    
    const greetings = window.jobAnalyzer.generateGreetings(source);
    
    greetingDiv.innerHTML = `
        <label style="display: block; padding: 1rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;">
            <input type="radio" name="greeting" value="0" checked style="margin-right: 0.5rem;">
            <span contenteditable="true" style="outline: none;">${greetings.formal}</span>
        </label>
        ${greetings.variations.map((variation, idx) => `
            <label style="display: block; padding: 1rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;">
                <input type="radio" name="greeting" value="${idx + 1}" style="margin-right: 0.5rem;">
                <span contenteditable="true" style="outline: none;">${variation}</span>
            </label>
        `).join('')}
    `;
    
    // Also load closings
    loadClosingOptions();
}

// Load closing options
function loadClosingOptions() {
    const closingDiv = document.getElementById('closingOptions');
    
    if (!window.jobAnalyzer || !closingDiv) return;
    
    const closings = window.jobAnalyzer.generateClosings();
    
    closingDiv.innerHTML = `
        ${closings.variations.map((closing, idx) => `
            <label style="display: block; padding: 1rem; background: #f8fafc; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer;">
                <input type="radio" name="closing" value="${idx}" ${idx === 0 ? 'checked' : ''} style="margin-right: 0.5rem;">
                <span contenteditable="true" style="outline: none;">${closing}</span>
            </label>
        `).join('')}
        <div style="margin-top: 0.5rem; padding: 0.5rem; background: #f8fafc; border-radius: 6px;">
            <span style="font-weight: 500;">${closings.formal}</span>
        </div>
    `;
}

// Preview full letter
function previewFullLetter() {
    const selectedGreeting = document.querySelector('input[name="greeting"]:checked');
    const selectedClosing = document.querySelector('input[name="closing"]:checked');
    
    const greeting = selectedGreeting ? selectedGreeting.nextElementSibling.textContent : '';
    const closing = selectedClosing ? selectedClosing.nextElementSibling.textContent : '';
    const formal = window.jobAnalyzer ? window.jobAnalyzer.generateClosings().formal : 'Mit freundlichen Grüßen';
    
    // Build content from selected requirements
    let mainContent = '';
    if (workflowData.selectedRequirements) {
        mainContent = workflowData.selectedRequirements
            .map(item => `<p>${item.response}</p>`)
            .join('\n');
    }
    
    const fullLetter = `
        ${greeting}
        
        ${mainContent}
        
        <p>${closing}</p>
        
        <p>${formal}<br>
        Manuel Weiß</p>
    `;
    
    // Create preview modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h3 style="margin-bottom: 1.5rem;">Anschreiben Vorschau</h3>
            <div style="background: #f8fafc; padding: 2rem; border-radius: 6px; white-space: pre-line;">
                ${fullLetter}
            </div>
            <div style="margin-top: 1.5rem; text-align: right;">
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" 
                        style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Schließen
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Save to workflow data
    workflowData.coverLetter = fullLetter;
}

// Workflow document upload functions
function triggerWorkflowDocumentUpload() {
    const uploadInput = document.getElementById('workflow-doc-upload');
    if (uploadInput) {
        console.log('Triggering workflow document upload...');
        uploadInput.click();
    } else {
        console.error('Workflow upload input not found!');
    }
}

// Initialize workflow document upload
function initializeWorkflowDocumentUpload() {
    const uploadInput = document.getElementById('workflow-doc-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleWorkflowDocumentUpload);
        console.log('Workflow document upload initialized');
    }
}

// Handle workflow document upload
function handleWorkflowDocumentUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    console.log('Uploading workflow documents:', files.length);
    
    Array.from(files).forEach(file => {
        console.log('Processing workflow file:', file.name, file.size);
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            if (window.adminPanel && window.adminPanel.showToast) {
                window.adminPanel.showToast(`Datei ${file.name} ist zu groß (max. 10MB)`, 'error');
            }
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const doc = {
                id: Date.now().toString() + Math.random().toString(36).substr(2),
                name: file.name,
                type: determineDocumentType(file.name),
                size: formatFileSize(file.size),
                uploadedAt: new Date().toISOString(),
                dataUrl: e.target.result,
                mimeType: file.type
            };
            
            // Get existing documents
            const existingDocs = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            existingDocs.push(doc);
            
            // Save to localStorage
            localStorage.setItem('applicationDocuments', JSON.stringify(existingDocs));
            
            // Update global documents array
            if (window.documents) {
                window.documents = existingDocs;
            }
            
            // Reload documents in workflow
            loadWorkflowDocuments();
            
            if (window.adminPanel && window.adminPanel.showToast) {
                window.adminPanel.showToast(`${file.name} erfolgreich hochgeladen`, 'success');
            }
            
            console.log('Workflow document saved:', doc.name);
        };
        
        reader.onerror = function() {
            console.error('Error reading workflow file:', file.name);
            if (window.adminPanel && window.adminPanel.showToast) {
                window.adminPanel.showToast(`Fehler beim Lesen von ${file.name}`, 'error');
            }
        };
        
        reader.readAsDataURL(file);
    });
    
    // Clear input
    event.target.value = '';
}

// Load documents for workflow
function loadWorkflowDocuments() {
    const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
    
    // Filter certificates and certifications
    const certificates = documents.filter(doc => doc.type === 'certificate');
    const certifications = documents.filter(doc => doc.type === 'certification');
    
    // Load certificates
    const certificatesList = document.getElementById('certificatesList');
    if (certificatesList) {
        if (certificates.length === 0) {
            certificatesList.innerHTML = '<p style="color: #666; text-align: center;">Keine Zeugnisse verfügbar</p>';
        } else {
            certificatesList.innerHTML = certificates.map(doc => `
                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                    <input type="checkbox" class="workflow-doc-checkbox" data-doc-id="${doc.id}" data-doc-type="certificate">
                    <span style="font-size: 0.9rem;">${doc.name}</span>
                </label>
            `).join('');
        }
    }
    
    // Load certifications
    const certificationsList = document.getElementById('certificationsList');
    if (certificationsList) {
        if (certifications.length === 0) {
            certificationsList.innerHTML = '<p style="color: #666; text-align: center;">Keine Zertifikate verfügbar</p>';
        } else {
            certificationsList.innerHTML = certifications.map(doc => `
                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                    <input type="checkbox" class="workflow-doc-checkbox" data-doc-id="${doc.id}" data-doc-type="certification">
                    <span style="font-size: 0.9rem;">${doc.name}</span>
                </label>
            `).join('');
        }
    }
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.workflow-doc-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedDocuments);
    });
}

// Update selected documents display
function updateSelectedDocuments() {
    const selectedDocs = [];
    const checkboxes = document.querySelectorAll('.workflow-doc-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
        const docId = checkbox.dataset.docId;
        const docType = checkbox.dataset.docType;
        const docName = checkbox.nextElementSibling.textContent;
        
        selectedDocs.push({
            id: docId,
            type: docType,
            name: docName
        });
    });
    
    const selectedDiv = document.getElementById('selectedDocuments');
    if (selectedDiv) {
        if (selectedDocs.length === 0) {
            selectedDiv.innerHTML = '<p style="color: #666; text-align: center; margin: 0;">Keine Dokumente ausgewählt</p>';
        } else {
            selectedDiv.innerHTML = selectedDocs.map(doc => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: white; border-radius: 4px; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.9rem;">${doc.name}</span>
                    <button onclick="removeSelectedDocument('${doc.id}')" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }
    
    // Store in workflow data
    workflowData.selectedDocuments = selectedDocs;
}

// Remove selected document
function removeSelectedDocument(docId) {
    const checkbox = document.querySelector(`input[data-doc-id="${docId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateSelectedDocuments();
    }
}

// Workflow navigation functions
function nextWorkflowStep(step) {
    console.log('🔄 Moving to workflow step:', step);
    workflowData.currentStep = step;
    
    const contentDiv = document.getElementById('workflowContent');
    if (!contentDiv) {
        console.error('❌ Workflow content div not found!');
        return;
    }
    
    let content = '';
    
    switch(step) {
        case 1:
            content = generateStep1();
            break;
        case 2:
            content = generateStep2();
            break;
        case 3:
            content = generateStep3();
            // Initialize greeting and closing options
            setTimeout(() => {
                updateGreeting();
            }, 100);
            break;
        case 4:
            content = generateStep4();
            // Initialize workflow document upload and load documents
            setTimeout(() => {
                initializeWorkflowDocumentUpload();
                loadWorkflowDocuments();
            }, 100);
            break;
        case 5:
            content = generateStep5();
            break;
        case 6:
            content = generateStep6();
            break;
        default:
            content = generateStep1();
    }
    
    contentDiv.innerHTML = content;
    console.log('✅ Workflow step content updated');
}

function previousWorkflowStep(step) {
    nextWorkflowStep(step);
}

function saveAndContinue(nextStep) {
    console.log('💾 Saving workflow step data...');
    
    try {
        // Save current step data
        if (workflowData.currentStep === 1) {
            const company = document.getElementById('company').value;
            const position = document.getElementById('position').value;
            const jobDescription = document.getElementById('jobDescription').value;
            
            console.log('Saving data:', { company, position, jobDescription });
            
            workflowData.company = company;
            workflowData.position = position;
            workflowData.jobDescription = jobDescription;
            
            // Validate required fields
            if (!company.trim() || !position.trim() || !jobDescription.trim()) {
                alert('Bitte füllen Sie alle Felder aus.');
                return;
            }
        }
        
        console.log('✅ Data saved, proceeding to step:', nextStep);
        
        // Ensure nextWorkflowStep is available
        if (typeof nextWorkflowStep === 'function') {
            nextWorkflowStep(nextStep);
        } else {
            console.error('❌ nextWorkflowStep function not available');
            alert('Fehler beim Fortfahren. Bitte laden Sie die Seite neu.');
        }
        
    } catch (error) {
        console.error('❌ Error in saveAndContinue:', error);
        alert('Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.');
    }
}

// Generate Step 4: Certificates and Documents
function generateStep4() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 4: Zeugnisse & Zertifikate hinzufügen</h3>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0;"><strong>Unternehmen:</strong> ${workflowData.company}</p>
            <p style="margin: 0;"><strong>Position:</strong> ${workflowData.position}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">📄 Relevante Dokumente auswählen</h4>
            
            <!-- Document Selection -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <h5 style="margin-bottom: 1rem;">Verfügbare Zeugnisse:</h5>
                    <div id="certificatesList" style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem;">
                        <!-- Certificates will be loaded here -->
                    </div>
                </div>
                
                <div>
                    <h5 style="margin-bottom: 1rem;">Verfügbare Zertifikate:</h5>
                    <div id="certificationsList" style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem;">
                        <!-- Certifications will be loaded here -->
                    </div>
                </div>
            </div>
            
            <!-- Selected Documents -->
            <div style="margin-bottom: 2rem;">
                <h5 style="margin-bottom: 1rem;">Ausgewählte Dokumente für diese Bewerbung:</h5>
                <div id="selectedDocuments" style="min-height: 100px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem; background: #f8fafc;">
                    <p style="color: #666; text-align: center; margin: 0;">Keine Dokumente ausgewählt</p>
                </div>
            </div>
            
            <!-- Upload New Documents -->
            <div style="border: 2px dashed #6366f1; border-radius: 8px; padding: 2rem; text-align: center; margin-bottom: 2rem; background: #f8f9ff;">
                <input type="file" id="workflow-doc-upload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" multiple style="display: none;">
                <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: #6366f1; margin-bottom: 1rem;"></i>
                <p style="font-weight: 600; margin-bottom: 0.5rem;">Weitere Dokumente hochladen</p>
                <button onclick="triggerWorkflowDocumentUpload()" style="padding: 0.75rem 2rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    Dateien auswählen
                </button>
                <p style="color: #666; margin: 1rem 0 0 0; font-size: 0.9rem;">PDF, Word, JPG, PNG</p>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(3)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAndContinue(5)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter zum Design <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Generate Step 5: Design & Layout
function generateStep5() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 5: Design & Layout</h3>
        
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
            <button onclick="saveAndContinue(6)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Analyze job description - IMPROVED VERSION
async function analyzeJobDescription() {
    const jobDescription = document.getElementById('jobDescription').value;
    if (!jobDescription.trim()) {
        alert('Bitte geben Sie eine Stellenbeschreibung ein.');
        return;
    }
    
    console.log('🔍 Analyzing job description...');
    
    // Simulate AI analysis with better extraction
    const analysis = {
        company: extractCompanyName(jobDescription),
        position: extractPosition(jobDescription)
    };
    
    console.log('Analysis result:', analysis);
    
    // Show confirmation dialog with better formatting
    const confirmed = confirm(`Möchten Sie die extrahierten Daten verwenden?\n\nUnternehmen: ${analysis.company}\nPosition: ${analysis.position}`);
    
    if (confirmed) {
        // Auto-fill the form
        document.getElementById('company').value = analysis.company;
        document.getElementById('position').value = analysis.position;
        
        console.log('✅ Form filled with extracted data');
        
        // Enable continue button
        const continueBtn = document.querySelector('button[onclick*="saveAndContinue"]');
        if (continueBtn) {
            continueBtn.style.display = 'inline-block';
            continueBtn.disabled = false;
            console.log('✅ Continue button enabled');
        }
    }
}

// Extract company name from job description
function extractCompanyName(jobDescription) {
    console.log('🏢 Extracting company name...');
    
    // Look for common company indicators
    const companyPatterns = [
        /(?:bei|in|der|die)\s+([A-Z][a-zA-Z\s&.-]+(?:GmbH|AG|KG|GmbH & Co\. KG|Ltd\.|Inc\.|Corp\.|Company|Unternehmen))/i,
        /(?:Company|Unternehmen):\s*([A-Z][a-zA-Z\s&.-]+)/i,
        /(?:Firma|Firmenname):\s*([A-Z][a-zA-Z\s&.-]+)/i,
        /(?:Wir sind|Wir suchen|Bei uns)\s+([A-Z][a-zA-Z\s&.-]+)/i
    ];
    
    for (const pattern of companyPatterns) {
        const match = jobDescription.match(pattern);
        if (match && match[1]) {
            const company = match[1].trim();
            console.log('✅ Company found:', company);
            return company;
        }
    }
    
    // Fallback: look for capitalized words that might be company names
    const words = jobDescription.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
        if (words[i].match(/^(bei|in|der|die)$/i) && words[i + 1].match(/^[A-Z]/)) {
            console.log('✅ Company found (fallback):', words[i + 1]);
            return words[i + 1];
        }
    }
    
    console.log('❌ No company found, using default');
    return 'Unbekanntes Unternehmen';
}

// Extract position from job description - IMPROVED VERSION
function extractPosition(jobDescription) {
    console.log('💼 Extracting position...');
    
    // Look for position indicators
    const positionPatterns = [
        /(?:Position|Stelle|Job|Rolle):\s*([A-Za-z\s]+?)(?:\n|$|\.|,)/i,
        /(?:Wir suchen|Wir bieten|Stellenausschreibung für)\s+([A-Za-z\s]+?)(?:\n|$|\.|,)/i,
        /(?:als|für)\s+([A-Za-z\s]+?)(?:\n|$|\.|,)/i,
        /(?:Senior|Junior|Lead|Manager|Consultant|Specialist|Expert|Analyst|Developer|Engineer|Designer|Coordinator|Director|Head|Chief)\s+([A-Za-z\s]+?)(?:\n|$|\.|,)/i
    ];
    
    for (const pattern of positionPatterns) {
        const match = jobDescription.match(pattern);
        if (match && match[1]) {
            let position = match[1].trim();
            
            // Clean up the position
            position = position.replace(/\s+/g, ' '); // Remove extra spaces
            position = position.replace(/[.,;]$/, ''); // Remove trailing punctuation
            
            // Limit length to avoid too much text
            if (position.length > 50) {
                position = position.substring(0, 50).trim() + '...';
            }
            
            console.log('✅ Position found:', position);
            return position;
        }
    }
    
    // Fallback: look for common job titles
    const commonTitles = [
        'Manager', 'Consultant', 'Specialist', 'Expert', 'Analyst', 
        'Developer', 'Engineer', 'Designer', 'Coordinator', 'Director',
        'Head', 'Chief', 'Senior', 'Junior', 'Lead'
    ];
    
    for (const title of commonTitles) {
        const regex = new RegExp(`\\b${title}\\s+([A-Za-z\\s]+?)(?:\\n|$|\\.|,)`, 'i');
        const match = jobDescription.match(regex);
        if (match && match[1]) {
            const position = `${title} ${match[1].trim()}`;
            console.log('✅ Position found (fallback):', position);
            return position;
        }
    }
    
    console.log('❌ No position found, using default');
    return 'Unbekannte Position';
}

// Make workflow functions globally available
window.startSmartWorkflow = startSmartWorkflow;
window.closeSmartWorkflow = closeSmartWorkflow;
window.nextWorkflowStep = nextWorkflowStep;
window.previousWorkflowStep = previousWorkflowStep;
window.saveAndContinue = saveAndContinue;
window.analyzeRequirements = analyzeRequirements;
window.regenerateSuggestions = regenerateSuggestions;
window.skipToManualWriting = skipToManualWriting;
window.proceedWithRequirements = proceedWithRequirements;
window.updateGreeting = updateGreeting;
window.previewFullLetter = previewFullLetter;
window.exportCoverLetterPDF = exportCoverLetterPDF;
window.exportCoverLetterWord = exportCoverLetterWord;
window.exportCoverLetterODT = exportCoverLetterODT;
window.triggerWorkflowDocumentUpload = triggerWorkflowDocumentUpload;
window.removeSelectedDocument = removeSelectedDocument;
window.publishOnline = publishOnline;
window.exportPDF = exportPDF;
window.exportWord = exportWord;
window.finishWorkflow = finishWorkflow;
window.copyShareLink = copyShareLink;
window.analyzeJobDescription = analyzeJobDescription;
window.extractCompanyName = extractCompanyName;
window.extractPosition = extractPosition;

// Generate Step 6: Final Review and Export
function generateStep6() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 6: Veröffentlichung & Export</h3>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0;"><strong>Unternehmen:</strong> ${workflowData.company}</p>
            <p style="margin: 0;"><strong>Position:</strong> ${workflowData.position}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="margin-bottom: 1rem;">📄 Bewerbungsunterlagen</h4>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>Anschreiben:</strong> ✅ Erstellt</p>
                    <p style="margin: 0 0 0.5rem 0;"><strong>Lebenslauf:</strong> ✅ Angepasst</p>
                    <p style="margin: 0 0 0.5rem 0;"><strong>Zeugnisse:</strong> ${workflowData.selectedDocuments ? workflowData.selectedDocuments.filter(d => d.type === 'certificate').length : 0} ausgewählt</p>
                    <p style="margin: 0;"><strong>Zertifikate:</strong> ${workflowData.selectedDocuments ? workflowData.selectedDocuments.filter(d => d.type === 'certification').length : 0} ausgewählt</p>
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: 1rem;">🎨 Design</h4>
                <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>Primärfarbe:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${workflowData.design.primaryColor}; border-radius: 3px; vertical-align: middle; margin-left: 0.5rem;"></span></p>
                    <p style="margin: 0 0 0.5rem 0;"><strong>Sekundärfarbe:</strong> <span style="display: inline-block; width: 20px; height: 20px; background: ${workflowData.design.secondaryColor}; border-radius: 3px; vertical-align: middle; margin-left: 0.5rem;"></span></p>
                    <p style="margin: 0;"><strong>Schriftart:</strong> ${workflowData.design.font || 'Inter'}</p>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
            <button onclick="publishOnline()" style="padding: 1.5rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: center;">
                <i class="fas fa-globe" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                Online veröffentlichen
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; opacity: 0.9;">Erstelle eine öffentliche Seite</p>
            </button>
            
            <button onclick="exportPDF()" style="padding: 1.5rem; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: center;">
                <i class="fas fa-file-pdf" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                Als PDF herunterladen
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; opacity: 0.9;">Komplettes Bewerbungspaket</p>
            </button>
            
            <button onclick="exportWord()" style="padding: 1.5rem; background: linear-gradient(135deg, #0061a8 0%, #004d87 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; text-align: center;">
                <i class="fas fa-file-word" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                Als Word herunterladen
                <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; opacity: 0.9;">Bearbeitbare Dokumente</p>
            </button>
        </div>
        
        <div id="shareSection" style="display: none; background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">🔗 Bewerbungsseite veröffentlicht!</h4>
            <p style="margin-bottom: 1rem;">Ihre Bewerbung ist jetzt online verfügbar:</p>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <input type="text" id="shareLink" readonly style="flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; background: white;">
                <button onclick="copyShareLink()" style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-copy"></i> Kopieren
                </button>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(5)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="finishWorkflow()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Bewerbung abschließen <i class="fas fa-check"></i>
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
            
            <!-- AI Twin Integration -->
            <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
            <script>
                // AI Twin Presenter embedded
                ${getAITwinCode()}
                
                // Initialize AI Twin when page loads
                window.addEventListener('DOMContentLoaded', function() {
                    // Store application data
                    const applicationData = ${JSON.stringify(applicationData)};
                    localStorage.setItem('currentApplicationForAITwin', JSON.stringify(applicationData));
                    
                    // Initialize AI Twin
                    window.aiTwin = new AITwinPresenter();
                    window.aiTwin.applicationData = applicationData;
                    window.aiTwin.userProfile = applicationData.userProfile || {};
                    window.aiTwin.createAITwinUI();
                });
            </script>
        </body>
        </html>
    `;
}

// Get AI Twin code to embed
function getAITwinCode() {
    return `
class AITwinPresenter {
    constructor() {
        this.userProfile = null;
        this.applicationData = null;
        this.conversationHistory = [];
        this.isActive = false;
    }
    
    createAITwinUI() {
        const aiTwinHTML = \`
            <div id="ai-twin-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
                <!-- AI Twin Avatar -->
                <div id="ai-twin-avatar" style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: all 0.3s ease;">
                    <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 24px; font-weight: bold; color: #667eea;">MW</span>
                    </div>
                    <div id="ai-twin-pulse" style="position: absolute; width: 100%; height: 100%; border: 3px solid #667eea; border-radius: 50%; animation: pulse 2s infinite;"></div>
                </div>
                
                <!-- AI Twin Chat Window -->
                <div id="ai-twin-chat" style="display: none; position: absolute; bottom: 100px; right: 0; width: 400px; height: 600px; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); overflow: hidden;">
                    <!-- Chat Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0; font-size: 1.2rem;">Manuel Weiß - AI Assistant</h3>
                            <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Ich beantworte Ihre Fragen zu meiner Bewerbung</p>
                        </div>
                        <button onclick="aiTwin.toggleChat()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    
                    <!-- Chat Messages -->
                    <div id="ai-twin-messages" style="height: 400px; overflow-y: auto; padding: 1.5rem; background: #f8fafc;">
                        <div class="ai-message" style="margin-bottom: 1rem;">
                            <div style="background: #e0e7ff; padding: 1rem; border-radius: 12px; border-bottom-left-radius: 0;">
                                <p style="margin: 0;">Hallo! Ich bin Manuel Weiß. Schön, dass Sie sich Zeit für meine Bewerbung nehmen. Haben Sie Fragen zu meinen Qualifikationen oder möchten Sie mehr über meine Erfahrungen erfahren?</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Quick Questions -->
                    <div style="padding: 0 1.5rem; background: white;">
                        <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Häufige Fragen:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                            <button onclick="aiTwin.askQuestion('experience')" style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                Berufserfahrung
                            </button>
                            <button onclick="aiTwin.askQuestion('skills')" style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                Kernkompetenzen
                            </button>
                            <button onclick="aiTwin.askQuestion('motivation')" style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                Motivation
                            </button>
                            <button onclick="aiTwin.askQuestion('projects')" style="padding: 0.5rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; cursor: pointer; font-size: 0.875rem;">
                                Projekte
                            </button>
                        </div>
                    </div>
                    
                    <!-- Chat Input -->
                    <div style="padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;">
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="ai-twin-input" placeholder="Stellen Sie mir eine Frage..." style="flex: 1; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; outline: none;" onkeypress="if(event.key === 'Enter') aiTwin.sendMessage()">
                            <button onclick="aiTwin.sendMessage()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                #ai-twin-avatar:hover { transform: scale(1.1); }
                
                .ai-message { animation: fadeIn 0.5s ease; }
                .user-message { animation: fadeIn 0.5s ease; text-align: right; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @media (max-width: 768px) {
                    #ai-twin-chat {
                        width: 100% !important;
                        height: 100% !important;
                        bottom: 0 !important;
                        right: 0 !important;
                        border-radius: 0 !important;
                    }
                }
            </style>
        \`;
        
        const container = document.createElement('div');
        container.innerHTML = aiTwinHTML;
        document.body.appendChild(container);
        
        document.getElementById('ai-twin-avatar').addEventListener('click', () => this.toggleChat());
    }
    
    toggleChat() {
        const chat = document.getElementById('ai-twin-chat');
        const avatar = document.getElementById('ai-twin-avatar');
        
        if (chat.style.display === 'none') {
            chat.style.display = 'block';
            avatar.style.transform = 'scale(0.8)';
            this.isActive = true;
            setTimeout(() => {
                document.getElementById('ai-twin-input').focus();
            }, 100);
        } else {
            chat.style.display = 'none';
            avatar.style.transform = 'scale(1)';
            this.isActive = false;
        }
    }
    
    sendMessage() {
        const input = document.getElementById('ai-twin-input');
        const message = input.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'ai');
        }, 1000);
    }
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('ai-twin-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
        messageDiv.style.marginBottom = '1rem';
        
        if (sender === 'user') {
            messageDiv.innerHTML = \`
                <div style="background: #667eea; color: white; padding: 1rem; border-radius: 12px; border-bottom-right-radius: 0; display: inline-block; max-width: 80%;">
                    <p style="margin: 0;">\${text}</p>
                </div>
            \`;
        } else {
            messageDiv.innerHTML = \`
                <div style="background: #e0e7ff; padding: 1rem; border-radius: 12px; border-bottom-left-radius: 0; display: inline-block; max-width: 90%;">
                    <p style="margin: 0;">\${text}</p>
                </div>
            \`;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.conversationHistory.push({ sender, text, timestamp: new Date() });
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('erfahrung') || lowerMessage.includes('beruf')) {
            return 'In meiner aktuellen Position als Senior HR Consultant konnte ich umfangreiche Erfahrungen in der Digitalisierung von HR-Prozessen sammeln. Besonders stolz bin ich auf die erfolgreiche Transformation eines DAX-Unternehmens mit über 10.000 Mitarbeitern.';
        } else if (lowerMessage.includes('kompetenz') || lowerMessage.includes('fähigkeit')) {
            return 'Meine Kernkompetenzen umfassen SAP SuccessFactors, Workday, Change Management und agile Methoden. Darüber hinaus verfüge ich über ausgeprägte Führungsqualitäten und Kommunikationsstärke.';
        } else if (lowerMessage.includes('motivation') || lowerMessage.includes('warum')) {
            return 'Die Kombination aus strategischer HR-Arbeit und digitaler Innovation bei Ihrem Unternehmen entspricht genau meinen Karrierezielen. Ich möchte meine Expertise nutzen, um Ihre HR-Prozesse auf das nächste Level zu heben.';
        } else if (lowerMessage.includes('projekt')) {
            return 'Ein Highlight war die Einführung einer KI-basierten Recruiting-Lösung, die die Time-to-Hire um 40% reduzierte. Gerne erzähle ich Ihnen in einem persönlichen Gespräch mehr Details.';
        } else {
            return 'Das ist eine interessante Frage! Können Sie mir etwas mehr Kontext geben, damit ich Ihnen eine präzise Antwort geben kann?';
        }
    }
    
    askQuestion(topic) {
        const questions = {
            'experience': 'Können Sie mir mehr über Ihre Berufserfahrung erzählen?',
            'skills': 'Welche Kernkompetenzen bringen Sie mit?',
            'motivation': 'Was motiviert Sie für diese Position?',
            'projects': 'Welche Projekte haben Sie erfolgreich umgesetzt?'
        };
        
        const question = questions[topic];
        if (question) {
            this.addMessage(question, 'user');
            setTimeout(() => {
                const response = this.generateResponse(question);
                this.addMessage(response, 'ai');
            }, 1000);
        }
    }
}
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
