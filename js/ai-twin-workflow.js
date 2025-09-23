// AI Twin Creation and Training Workflow

// AI Twin data structure
let aiTwinData = {
    currentStep: 1,
    profile: {
        name: '',
        position: '',
        expertise: [],
        personality: '',
        communicationStyle: '',
        values: []
    },
    knowledge: {
        documents: [],
        experiences: [],
        skills: [],
        achievements: []
    },
    training: {
        conversations: [],
        feedback: [],
        improvements: []
    },
    settings: {
        avatar: '',
        voice: 'professional',
        language: 'de',
        responseStyle: 'detailed'
    }
};

// Start AI Twin Creation Workflow
function startAITwinCreation() {
    const modal = document.createElement('div');
    modal.id = 'aiTwinWorkflowModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 900px; height: 90%; max-height: 700px; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; position: relative;">
                <h2 style="margin: 0; font-size: 1.8rem;">🤖 AI Twin erstellen</h2>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Erstellen Sie Ihren digitalen Zwilling für automatisierte Bewerbungsgespräche</p>
                <button onclick="closeAITwinWorkflow()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div style="padding: 2rem; overflow-y: auto; flex: 1;">
                <div id="aiTwinWorkflowContent">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    nextAITwinStep(1);
}

// Close AI Twin Workflow
function closeAITwinWorkflow() {
    const modal = document.getElementById('aiTwinWorkflowModal');
    if (modal) {
        modal.remove();
    }
}

// Navigate AI Twin Steps
function nextAITwinStep(step) {
    aiTwinData.currentStep = step;
    
    const contentDiv = document.getElementById('aiTwinWorkflowContent');
    if (!contentDiv) return;
    
    let content = '';
    
    switch(step) {
        case 1:
            content = generateAITwinStep1();
            break;
        case 2:
            content = generateAITwinStep2();
            setTimeout(loadExistingDocuments, 100);
            break;
        case 3:
            content = generateAITwinStep3();
            break;
        case 4:
            content = generateAITwinStep4();
            break;
        case 5:
            content = generateAITwinStep5();
            break;
        default:
            content = generateAITwinStep1();
    }
    
    contentDiv.innerHTML = content;
}

// Step 1: Basic Profile
function generateAITwinStep1() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 1: Grundprofil erstellen</h3>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Name:</label>
            <input type="text" id="aiTwinName" placeholder="Ihr vollständiger Name" value="${aiTwinData.profile.name}" 
                   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Aktuelle Position:</label>
            <input type="text" id="aiTwinPosition" placeholder="z.B. Senior HR Consultant" value="${aiTwinData.profile.position}"
                   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Kernkompetenzen (eine pro Zeile):</label>
            <textarea id="aiTwinExpertise" placeholder="HR-Digitalisierung\nChange Management\nProzessoptimierung" 
                      style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 120px; resize: vertical;">${aiTwinData.profile.expertise.join('\n')}</textarea>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Persönlichkeit beschreiben:</label>
            <textarea id="aiTwinPersonality" placeholder="Beschreiben Sie Ihre Arbeitsweise und Persönlichkeit..." 
                      style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 100px; resize: vertical;">${aiTwinData.profile.personality}</textarea>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Kommunikationsstil:</label>
            <select id="aiTwinCommStyle" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                <option value="professional" ${aiTwinData.profile.communicationStyle === 'professional' ? 'selected' : ''}>Professionell & strukturiert</option>
                <option value="friendly" ${aiTwinData.profile.communicationStyle === 'friendly' ? 'selected' : ''}>Freundlich & nahbar</option>
                <option value="dynamic" ${aiTwinData.profile.communicationStyle === 'dynamic' ? 'selected' : ''}>Dynamisch & enthusiastisch</option>
                <option value="analytical" ${aiTwinData.profile.communicationStyle === 'analytical' ? 'selected' : ''}>Analytisch & detailliert</option>
            </select>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="closeAITwinWorkflow()" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Abbrechen
            </button>
            <button onclick="saveAITwinStep1()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Step 2: Knowledge Base
function generateAITwinStep2() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 2: Wissensbasis aufbauen</h3>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0;">Laden Sie Ihre Dokumente hoch, damit der AI Twin Ihr Wissen und Ihre Erfahrungen lernen kann.</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="margin-bottom: 1rem;">📄 Vorhandene Dokumente</h4>
                <div id="existingDocsList" style="max-height: 200px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem;">
                    <!-- Existing documents will be loaded here -->
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: 1rem;">📤 Neue Dokumente hochladen</h4>
                <div style="border: 2px dashed #6366f1; border-radius: 8px; padding: 2rem; text-align: center; background: #f8f9ff;">
                    <input type="file" id="aiTwinDocUpload" accept=".pdf,.doc,.docx,.txt" multiple style="display: none;">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: #6366f1; margin-bottom: 1rem;"></i>
                    <p style="font-weight: 600; margin-bottom: 0.5rem;">Dokumente für Training</p>
                    <button onclick="document.getElementById('aiTwinDocUpload').click()" style="padding: 0.75rem 2rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Dateien auswählen
                    </button>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">💼 Berufserfahrungen</h4>
            <textarea id="aiTwinExperiences" placeholder="Beschreiben Sie Ihre wichtigsten beruflichen Stationen und Projekte..." 
                      style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 150px; resize: vertical;">${aiTwinData.knowledge.experiences.join('\n')}</textarea>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">🏆 Erfolge & Achievements</h4>
            <textarea id="aiTwinAchievements" placeholder="Liste Ihrer wichtigsten Erfolge und Errungenschaften..." 
                      style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 120px; resize: vertical;">${aiTwinData.knowledge.achievements.join('\n')}</textarea>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="nextAITwinStep(1)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAITwinStep2()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Step 3: Personality & Values
function generateAITwinStep3() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 3: Persönlichkeit & Werte</h3>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">🎯 Ihre Kernwerte</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                ${['Integrität', 'Innovation', 'Teamwork', 'Exzellenz', 'Nachhaltigkeit', 'Kundenorientierung', 'Verantwortung', 'Wachstum'].map(value => `
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" value="${value}" class="value-checkbox" ${aiTwinData.profile.values.includes(value) ? 'checked' : ''}>
                        <span>${value}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">💬 Typische Antworten</h4>
            <p style="margin-bottom: 1rem; color: #666;">Wie würden Sie auf diese Fragen antworten?</p>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">"Warum möchten Sie bei uns arbeiten?"</label>
                <textarea id="answerWhy" placeholder="Ihre typische Antwort..." 
                          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 100px; resize: vertical;"></textarea>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">"Was sind Ihre Stärken?"</label>
                <textarea id="answerStrengths" placeholder="Ihre typische Antwort..." 
                          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 100px; resize: vertical;"></textarea>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">"Wo sehen Sie sich in 5 Jahren?"</label>
                <textarea id="answerFuture" placeholder="Ihre typische Antwort..." 
                          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 100px; resize: vertical;"></textarea>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="nextAITwinStep(2)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAITwinStep3()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Step 4: AI Twin Settings
function generateAITwinStep4() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 4: AI Twin Einstellungen</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div>
                <h4 style="margin-bottom: 1rem;">🎨 Avatar auswählen</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                    ${['👔', '👩‍💼', '👨‍💼', '🧑‍💼', '👩‍💻', '👨‍💻'].map((avatar, idx) => `
                        <label style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 2px solid ${aiTwinData.settings.avatar === avatar ? '#6366f1' : '#e5e7eb'}; border-radius: 8px; cursor: pointer;">
                            <input type="radio" name="avatar" value="${avatar}" ${aiTwinData.settings.avatar === avatar ? 'checked' : ''} style="display: none;">
                            <span style="font-size: 3rem;">${avatar}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: 1rem;">🎙️ Stimme & Stil</h4>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Sprachstil:</label>
                    <select id="voiceStyle" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                        <option value="professional" ${aiTwinData.settings.voice === 'professional' ? 'selected' : ''}>Professionell</option>
                        <option value="casual" ${aiTwinData.settings.voice === 'casual' ? 'selected' : ''}>Locker</option>
                        <option value="enthusiastic" ${aiTwinData.settings.voice === 'enthusiastic' ? 'selected' : ''}>Enthusiastisch</option>
                        <option value="formal" ${aiTwinData.settings.voice === 'formal' ? 'selected' : ''}>Formell</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Antwortlänge:</label>
                    <select id="responseStyle" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                        <option value="concise" ${aiTwinData.settings.responseStyle === 'concise' ? 'selected' : ''}>Kurz & prägnant</option>
                        <option value="balanced" ${aiTwinData.settings.responseStyle === 'balanced' ? 'selected' : ''}>Ausgewogen</option>
                        <option value="detailed" ${aiTwinData.settings.responseStyle === 'detailed' ? 'selected' : ''}>Ausführlich</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">⚙️ Erweiterte Einstellungen</h4>
            
            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                <input type="checkbox" id="autoLearn" checked>
                <span>Automatisch aus Gesprächen lernen</span>
            </label>
            
            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; cursor: pointer;">
                <input type="checkbox" id="askConfirmation" checked>
                <span>Bei unsicheren Antworten nachfragen</span>
            </label>
            
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="saveConversations" checked>
                <span>Gespräche für Training speichern</span>
            </label>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="nextAITwinStep(3)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAITwinStep4()" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// Step 5: Review & Activate
function generateAITwinStep5() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 5: Überprüfung & Aktivierung</h3>
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; text-align: center;">
            <h4 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🎉 Ihr AI Twin ist bereit!</h4>
            <p style="margin: 0;">Überprüfen Sie die Einstellungen und aktivieren Sie Ihren digitalen Zwilling.</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px;">
                <h5 style="margin-bottom: 1rem;">👤 Profil</h5>
                <p style="margin: 0.5rem 0;"><strong>Name:</strong> ${aiTwinData.profile.name}</p>
                <p style="margin: 0.5rem 0;"><strong>Position:</strong> ${aiTwinData.profile.position}</p>
                <p style="margin: 0.5rem 0;"><strong>Avatar:</strong> ${aiTwinData.settings.avatar}</p>
                <p style="margin: 0.5rem 0;"><strong>Kommunikationsstil:</strong> ${aiTwinData.profile.communicationStyle}</p>
            </div>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px;">
                <h5 style="margin-bottom: 1rem;">📚 Wissensbasis</h5>
                <p style="margin: 0.5rem 0;"><strong>Dokumente:</strong> ${aiTwinData.knowledge.documents.length} geladen</p>
                <p style="margin: 0.5rem 0;"><strong>Kompetenzen:</strong> ${aiTwinData.profile.expertise.length} definiert</p>
                <p style="margin: 0.5rem 0;"><strong>Erfahrungen:</strong> ${aiTwinData.knowledge.experiences.length} erfasst</p>
                <p style="margin: 0.5rem 0;"><strong>Werte:</strong> ${aiTwinData.profile.values.length} ausgewählt</p>
            </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">🚀 Nächste Schritte</h4>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.5rem;"></i>
                    <span>AI Twin wird auf Bewerbungsseiten aktiviert</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.5rem;"></i>
                    <span>Automatisches Training aus Gesprächen</span>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.5rem;"></i>
                    <span>Kontinuierliche Verbesserung durch Feedback</span>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button onclick="activateAITwin()" style="padding: 1rem 3rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1.1rem;">
                <i class="fas fa-power-off"></i> AI Twin aktivieren
            </button>
            <button onclick="startAITwinTraining()" style="padding: 1rem 3rem; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1.1rem;">
                <i class="fas fa-graduation-cap"></i> Training starten
            </button>
        </div>
    `;
}

// Save functions for each step
function saveAITwinStep1() {
    aiTwinData.profile.name = document.getElementById('aiTwinName').value;
    aiTwinData.profile.position = document.getElementById('aiTwinPosition').value;
    aiTwinData.profile.expertise = document.getElementById('aiTwinExpertise').value.split('\n').filter(e => e.trim());
    aiTwinData.profile.personality = document.getElementById('aiTwinPersonality').value;
    aiTwinData.profile.communicationStyle = document.getElementById('aiTwinCommStyle').value;
    
    nextAITwinStep(2);
}

function saveAITwinStep2() {
    aiTwinData.knowledge.experiences = document.getElementById('aiTwinExperiences').value.split('\n').filter(e => e.trim());
    aiTwinData.knowledge.achievements = document.getElementById('aiTwinAchievements').value.split('\n').filter(e => e.trim());
    
    nextAITwinStep(3);
}

function saveAITwinStep3() {
    // Save values
    const checkedValues = [];
    document.querySelectorAll('.value-checkbox:checked').forEach(cb => {
        checkedValues.push(cb.value);
    });
    aiTwinData.profile.values = checkedValues;
    
    // Save typical answers
    aiTwinData.training.conversations.push({
        question: "Warum möchten Sie bei uns arbeiten?",
        answer: document.getElementById('answerWhy').value
    });
    aiTwinData.training.conversations.push({
        question: "Was sind Ihre Stärken?",
        answer: document.getElementById('answerStrengths').value
    });
    aiTwinData.training.conversations.push({
        question: "Wo sehen Sie sich in 5 Jahren?",
        answer: document.getElementById('answerFuture').value
    });
    
    nextAITwinStep(4);
}

function saveAITwinStep4() {
    // Save avatar
    const selectedAvatar = document.querySelector('input[name="avatar"]:checked');
    if (selectedAvatar) {
        aiTwinData.settings.avatar = selectedAvatar.value;
    }
    
    // Save voice settings
    aiTwinData.settings.voice = document.getElementById('voiceStyle').value;
    aiTwinData.settings.responseStyle = document.getElementById('responseStyle').value;
    
    // Save advanced settings
    aiTwinData.settings.autoLearn = document.getElementById('autoLearn').checked;
    aiTwinData.settings.askConfirmation = document.getElementById('askConfirmation').checked;
    aiTwinData.settings.saveConversations = document.getElementById('saveConversations').checked;
    
    nextAITwinStep(5);
}

// Activate AI Twin
function activateAITwin() {
    // Save AI Twin data
    localStorage.setItem('aiTwinProfile', JSON.stringify(aiTwinData));
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('AI Twin erfolgreich aktiviert!', 'success');
    }
    
    closeAITwinWorkflow();
}

// Start AI Twin Training
function startAITwinTraining() {
    // Save AI Twin data first
    localStorage.setItem('aiTwinProfile', JSON.stringify(aiTwinData));
    
    // Close creation workflow
    closeAITwinWorkflow();
    
    // Start training workflow
    setTimeout(() => {
        startAITwinTrainingWorkflow();
    }, 300);
}

// AI Twin Training Workflow
function startAITwinTrainingWorkflow() {
    const modal = document.createElement('div');
    modal.id = 'aiTwinTrainingModal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 900px; height: 90%; max-height: 700px; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 2rem; position: relative;">
                <h2 style="margin: 0; font-size: 1.8rem;">🎓 AI Twin Training</h2>
                <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Trainieren Sie Ihren AI Twin durch Übungsgespräche</p>
                <button onclick="closeAITwinTraining()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div style="display: flex; flex: 1; overflow: hidden;">
                <!-- Chat Interface -->
                <div style="flex: 1; display: flex; flex-direction: column; border-right: 1px solid #e5e7eb;">
                    <div id="chatMessages" style="flex: 1; padding: 1rem; overflow-y: auto; background: #f8fafc;">
                        <div style="text-align: center; padding: 2rem; color: #666;">
                            <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                            <p>Starten Sie ein Übungsgespräch mit Ihrem AI Twin</p>
                        </div>
                    </div>
                    
                    <div style="padding: 1rem; background: white; border-top: 1px solid #e5e7eb;">
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="userMessage" placeholder="Stellen Sie eine Frage..." 
                                   style="flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;"
                                   onkeypress="if(event.key === 'Enter') sendTrainingMessage()">
                            <button onclick="sendTrainingMessage()" style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        
                        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button onclick="askSampleQuestion('Erzählen Sie etwas über sich')" style="padding: 0.5rem 1rem; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                                Über sich erzählen
                            </button>
                            <button onclick="askSampleQuestion('Was sind Ihre größten Stärken?')" style="padding: 0.5rem 1rem; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                                Stärken
                            </button>
                            <button onclick="askSampleQuestion('Warum wollen Sie wechseln?')" style="padding: 0.5rem 1rem; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                                Wechselgrund
                            </button>
                            <button onclick="askSampleQuestion('Was motiviert Sie?')" style="padding: 0.5rem 1rem; background: #e5e7eb; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                                Motivation
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Feedback Panel -->
                <div style="width: 350px; padding: 1.5rem; overflow-y: auto;">
                    <h3 style="margin-bottom: 1.5rem;">📊 Training Feedback</h3>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; font-size: 1rem;">Antwortqualität</h4>
                        <div id="answerQuality" style="background: #f8fafc; padding: 1rem; border-radius: 6px; text-align: center; color: #666;">
                            <p style="margin: 0;">Noch keine Bewertung</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; font-size: 1rem;">Verbesserungsvorschläge</h4>
                        <div id="improvementSuggestions" style="background: #f8fafc; padding: 1rem; border-radius: 6px;">
                            <p style="margin: 0; color: #666; font-size: 0.875rem;">Führen Sie Gespräche, um Feedback zu erhalten</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; font-size: 1rem;">Training Statistiken</h4>
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Gespräche geführt:</span>
                                <strong id="conversationCount">0</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Fragen beantwortet:</span>
                                <strong id="questionCount">0</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Durchschnittliche Bewertung:</span>
                                <strong id="avgRating">-</strong>
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="saveTrainingProgress()" style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-save"></i> Training speichern
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize training
    initializeTraining();
}

// Training functions
function closeAITwinTraining() {
    const modal = document.getElementById('aiTwinTrainingModal');
    if (modal) {
        modal.remove();
    }
}

function initializeTraining() {
    // Load AI Twin profile
    const profile = JSON.parse(localStorage.getItem('aiTwinProfile') || '{}');
    if (profile && profile.profile) {
        aiTwinData = profile;
    }
    
    // Load training stats
    updateTrainingStats();
}

function sendTrainingMessage() {
    const input = document.getElementById('userMessage');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    addChatMessage('user', message);
    
    // Clear input
    input.value = '';
    
    // Simulate AI Twin response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage('ai', response);
        
        // Update stats
        updateTrainingStats();
    }, 1000);
}

function askSampleQuestion(question) {
    document.getElementById('userMessage').value = question;
    sendTrainingMessage();
}

function addChatMessage(sender, message) {
    const chatDiv = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `margin-bottom: 1rem; ${sender === 'user' ? 'text-align: right;' : ''}`;
    
    const bubble = document.createElement('div');
    bubble.style.cssText = `
        display: inline-block;
        max-width: 70%;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        ${sender === 'user' 
            ? 'background: #6366f1; color: white;' 
            : 'background: white; border: 1px solid #e5e7eb;'}
    `;
    
    bubble.innerHTML = `
        ${sender === 'ai' ? '<strong style="display: block; margin-bottom: 0.25rem;">AI Twin:</strong>' : ''}
        ${message}
    `;
    
    messageDiv.appendChild(bubble);
    
    // Add feedback buttons for AI responses
    if (sender === 'ai') {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.style.cssText = 'margin-top: 0.5rem;';
        feedbackDiv.innerHTML = `
            <button onclick="rateResponse('good')" style="padding: 0.25rem 0.75rem; margin-right: 0.5rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                <i class="fas fa-thumbs-up"></i> Gut
            </button>
            <button onclick="rateResponse('improve')" style="padding: 0.25rem 0.75rem; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">
                <i class="fas fa-edit"></i> Verbessern
            </button>
        `;
        messageDiv.appendChild(feedbackDiv);
    }
    
    chatDiv.appendChild(messageDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function generateAIResponse(question) {
    // Simulate AI responses based on trained data
    const responses = {
        'erzählen sie etwas über sich': `Mein Name ist ${aiTwinData.profile.name} und ich bin ${aiTwinData.profile.position}. ${aiTwinData.profile.personality}`,
        'was sind ihre größten stärken': `Meine größten Stärken liegen in den Bereichen ${aiTwinData.profile.expertise.slice(0, 3).join(', ')}. ${aiTwinData.training.conversations.find(c => c.question.includes('Stärken'))?.answer || 'Diese Kompetenzen konnte ich in verschiedenen Projekten erfolgreich einsetzen.'}`,
        'warum wollen sie wechseln': 'Ich suche nach neuen Herausforderungen, bei denen ich meine Expertise in einem innovativen Umfeld einbringen und weiterentwickeln kann.',
        'was motiviert sie': `Mich motivieren besonders ${aiTwinData.profile.values.slice(0, 2).join(' und ')}. Die Möglichkeit, ${aiTwinData.profile.expertise[0]} voranzutreiben und dabei messbare Ergebnisse zu erzielen, treibt mich an.`
    };
    
    const lowerQuestion = question.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
        if (lowerQuestion.includes(key)) {
            return response;
        }
    }
    
    // Default response
    return `Das ist eine interessante Frage. Basierend auf meiner Erfahrung als ${aiTwinData.profile.position} würde ich sagen, dass ${aiTwinData.profile.expertise[0]} hier besonders relevant ist.`;
}

function rateResponse(rating) {
    const qualityDiv = document.getElementById('answerQuality');
    const suggestionsDiv = document.getElementById('improvementSuggestions');
    
    if (rating === 'good') {
        qualityDiv.innerHTML = '<p style="margin: 0; color: #10b981; font-weight: 600;">✅ Gute Antwort!</p>';
        suggestionsDiv.innerHTML = '<p style="margin: 0; color: #10b981; font-size: 0.875rem;">Die Antwort war überzeugend und authentisch.</p>';
    } else {
        qualityDiv.innerHTML = '<p style="margin: 0; color: #f59e0b; font-weight: 600;">⚠️ Verbesserungsbedarf</p>';
        suggestionsDiv.innerHTML = `
            <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.875rem;">
                <li>Mehr konkrete Beispiele einbauen</li>
                <li>Persönlichere Formulierungen verwenden</li>
                <li>Bezug zur Stellenausschreibung herstellen</li>
            </ul>
        `;
    }
    
    // Update training data
    if (!aiTwinData.training.feedback) {
        aiTwinData.training.feedback = [];
    }
    aiTwinData.training.feedback.push({
        timestamp: new Date().toISOString(),
        rating: rating
    });
    
    updateTrainingStats();
}

function updateTrainingStats() {
    const stats = {
        conversations: aiTwinData.training.conversations ? aiTwinData.training.conversations.length : 0,
        questions: aiTwinData.training.feedback ? aiTwinData.training.feedback.length : 0,
        avgRating: '-'
    };
    
    if (aiTwinData.training.feedback && aiTwinData.training.feedback.length > 0) {
        const goodRatings = aiTwinData.training.feedback.filter(f => f.rating === 'good').length;
        const percentage = Math.round((goodRatings / aiTwinData.training.feedback.length) * 100);
        stats.avgRating = `${percentage}%`;
    }
    
    document.getElementById('conversationCount').textContent = stats.conversations;
    document.getElementById('questionCount').textContent = stats.questions;
    document.getElementById('avgRating').textContent = stats.avgRating;
}

function saveTrainingProgress() {
    localStorage.setItem('aiTwinProfile', JSON.stringify(aiTwinData));
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Training-Fortschritt gespeichert!', 'success');
    }
}

// Load existing documents
function loadExistingDocuments() {
    const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
    const docsList = document.getElementById('existingDocsList');
    
    if (docsList) {
        if (documents.length === 0) {
            docsList.innerHTML = '<p style="color: #666; text-align: center;">Keine Dokumente vorhanden</p>';
        } else {
            docsList.innerHTML = documents.map(doc => `
                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;">
                    <input type="checkbox" class="doc-for-training" data-doc-id="${doc.id}">
                    <span style="font-size: 0.9rem;">${doc.name}</span>
                </label>
            `).join('');
        }
    }
    
    // Initialize file upload
    const uploadInput = document.getElementById('aiTwinDocUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleAITwinDocUpload);
    }
}

// Handle document upload for AI Twin
function handleAITwinDocUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const doc = {
                id: Date.now().toString() + Math.random().toString(36).substr(2),
                name: file.name,
                content: e.target.result,
                type: file.type
            };
            
            aiTwinData.knowledge.documents.push(doc);
            
            if (window.adminPanel && window.adminPanel.showToast) {
                window.adminPanel.showToast(`${file.name} für AI Twin Training hinzugefügt`, 'success');
            }
        };
        
        reader.readAsText(file);
    });
    
    event.target.value = '';
}

// Make functions globally available
window.startAITwinCreation = startAITwinCreation;
window.closeAITwinWorkflow = closeAITwinWorkflow;
window.nextAITwinStep = nextAITwinStep;
window.saveAITwinStep1 = saveAITwinStep1;
window.saveAITwinStep2 = saveAITwinStep2;
window.saveAITwinStep3 = saveAITwinStep3;
window.saveAITwinStep4 = saveAITwinStep4;
window.activateAITwin = activateAITwin;
window.startAITwinTraining = startAITwinTraining;
window.closeAITwinTraining = closeAITwinTraining;
window.sendTrainingMessage = sendTrainingMessage;
window.askSampleQuestion = askSampleQuestion;
window.rateResponse = rateResponse;
window.saveTrainingProgress = saveTrainingProgress;
window.startAITwinTrainingWorkflow = startAITwinTrainingWorkflow;
