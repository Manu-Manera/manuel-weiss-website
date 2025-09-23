// Smart Workflow Steps with Requirement Analysis

// Initialize job analyzer when needed
async function initializeJobAnalyzer() {
    if (window.jobAnalyzer && !window.jobAnalyzer.userProfile.skills.length) {
        await window.jobAnalyzer.analyzeUserDocuments();
    }
}

// Override generateStep2 with new requirement analysis
window.generateStep2 = function() {
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
};

// New Step 3: Cover Letter Builder
window.generateStep3 = function() {
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
            <button onclick="saveAndContinue(5)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
};

// Shift other steps
window.generateStep4 = window.generateStep3; // Old Step 3 becomes Step 4
window.generateStep5 = window.generateStep4; // Old Step 4 becomes Step 5
window.generateStep6 = window.generateStep5; // Old Step 5 becomes Step 6

// Analyze requirements function
async function analyzeRequirements() {
    const analysisDiv = document.getElementById('requirementsAnalysis');
    analysisDiv.style.display = 'block';
    analysisDiv.innerHTML = '<p style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Analysiere Stellenbeschreibung...</p>';
    
    // Initialize job analyzer
    await initializeJobAnalyzer();
    
    // Analyze job description
    const requirements = window.jobAnalyzer.analyzeJobDescription(workflowData.jobDescription);
    
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
        const suggestions = await window.jobAnalyzer.generateMatchingSuggestions(req);
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
    const newSuggestions = await window.jobAnalyzer.generateMatchingSuggestions(req);
    
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
    
    if (!window.jobAnalyzer) return;
    
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

// Override the original generateSmartCoverLetter
window.generateSmartCoverLetter = async function() {
    // Initialize job analyzer
    await initializeJobAnalyzer();
    
    // Update greeting on load
    setTimeout(() => {
        updateGreeting();
        
        // Load selected requirements into main content
        const contentDiv = document.getElementById('coverLetterContent');
        if (contentDiv && workflowData.selectedRequirements) {
            contentDiv.innerHTML = workflowData.selectedRequirements
                .map((item, idx) => `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 6px;">
                        <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #666;">
                            <strong>Anforderung:</strong> ${item.requirement.text}
                        </p>
                        <p contenteditable="true" style="margin: 0; outline: none; padding: 0.5rem; background: white; border-radius: 4px;">
                            ${item.response}
                        </p>
                    </div>
                `)
                .join('');
        }
    }, 100);
};
