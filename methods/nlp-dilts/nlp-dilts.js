// NLP Dilts JavaScript Functions

let diltsData = {
    levels: {
        spirituality: '',
        identity: '',
        beliefs: '',
        capabilities: '',
        behavior: '',
        environment: ''
    },
    strategies: {
        environment: '',
        behavior: '',
        capabilities: '',
        beliefs: '',
        identity: '',
        spirituality: ''
    },
    mainGoal: '',
    alignment: {
        environment: 5,
        behavior: 5,
        capabilities: 5,
        beliefs: 5,
        identity: 5,
        spirituality: 5
    },
    alignmentNotes: {
        environment: '',
        behavior: '',
        capabilities: '',
        beliefs: '',
        identity: '',
        spirituality: ''
    },
    transformationSteps: [],
    commitment: {
        startDate: '',
        reflectionFrequency: 'weekly',
        supportPerson: '',
        personalCommitment: ''
    }
};

function initNlpDilts() {
    console.log('Initializing NLP Dilts...');
    
    // Load saved data
    loadSavedDiltsData();
    
    // Setup event listeners
    setupDiltsEventListeners();
    
    // Initialize UI
    updateAlignmentSummary();
}

function setupDiltsEventListeners() {
    // Setup level textareas
    document.querySelectorAll('.pyramid-level textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const level = this.closest('.pyramid-level').classList[1]; // Get level class
            diltsData.levels[level] = this.value;
            saveDiltsData();
        });
    });
    
    // Setup strategy textareas
    document.querySelectorAll('.strategy-input textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const level = this.closest('.strategy-level').querySelector('h5').textContent.toLowerCase();
            const levelKey = getLevelKey(level);
            diltsData.strategies[levelKey] = this.value;
            saveDiltsData();
        });
    });
    
    // Setup main goal
    document.getElementById('main-goal').addEventListener('input', function() {
        diltsData.mainGoal = this.value;
        saveDiltsData();
    });
    
    // Setup alignment sliders
    document.querySelectorAll('.alignment-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const level = this.closest('.alignment-level').querySelector('h5').textContent.toLowerCase();
            const levelKey = getLevelKey(level);
            diltsData.alignment[levelKey] = parseInt(this.value);
            
            const valueDisplay = this.parentElement.querySelector('.alignment-value');
            valueDisplay.textContent = this.value;
            
            updateAlignmentSummary();
            saveDiltsData();
        });
    });
    
    // Setup alignment notes
    document.querySelectorAll('.alignment-level textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const level = this.closest('.alignment-level').querySelector('h5').textContent.toLowerCase();
            const levelKey = getLevelKey(level);
            diltsData.alignmentNotes[levelKey] = this.value;
            saveDiltsData();
        });
    });
    
    // Setup commitment form
    document.getElementById('start-date').addEventListener('change', function() {
        diltsData.commitment.startDate = this.value;
        saveDiltsData();
    });
    
    document.getElementById('reflection-frequency').addEventListener('change', function() {
        diltsData.commitment.reflectionFrequency = this.value;
        saveDiltsData();
    });
    
    document.getElementById('support-person').addEventListener('input', function() {
        diltsData.commitment.supportPerson = this.value;
        saveDiltsData();
    });
    
    document.getElementById('personal-commitment').addEventListener('input', function() {
        diltsData.commitment.personalCommitment = this.value;
        saveDiltsData();
    });
}

function getLevelKey(levelText) {
    const levelMap = {
        '🌍 umgebung': 'environment',
        '🎭 verhalten': 'behavior',
        '🧠 fähigkeiten': 'capabilities',
        '💭 überzeugungen': 'beliefs',
        '👤 identität': 'identity',
        '🌍 spiritualität': 'spirituality'
    };
    
    return levelMap[levelText] || 'environment';
}

function updateAlignmentSummary() {
    const alignmentValues = Object.values(diltsData.alignment);
    const totalAlignment = alignmentValues.reduce((sum, value) => sum + value, 0);
    const averageAlignment = Math.round(totalAlignment / alignmentValues.length);
    
    // Update alignment score
    document.getElementById('alignment-score').textContent = averageAlignment;
    
    // Find strongest and weakest levels
    const levelNames = {
        environment: 'Umgebung',
        behavior: 'Verhalten',
        capabilities: 'Fähigkeiten',
        beliefs: 'Überzeugungen',
        identity: 'Identität',
        spirituality: 'Spiritualität'
    };
    
    let maxValue = 0;
    let minValue = 10;
    let strongestLevel = '';
    let weakestLevel = '';
    
    Object.entries(diltsData.alignment).forEach(([level, value]) => {
        if (value > maxValue) {
            maxValue = value;
            strongestLevel = levelNames[level];
        }
        if (value < minValue) {
            minValue = value;
            weakestLevel = levelNames[level];
        }
    });
    
    document.getElementById('strongest-level').textContent = strongestLevel;
    document.getElementById('weakest-level').textContent = weakestLevel;
}

function addTransformationStep() {
    const input = document.getElementById('transformation-input');
    const level = document.getElementById('transformation-level');
    const step = input.value.trim();
    
    if (!step) {
        showNotification('Bitte gib einen Transformationsschritt ein!', 'warning');
        return;
    }
    
    diltsData.transformationSteps.push({
        id: Date.now(),
        text: step,
        level: level.value,
        date: new Date().toISOString()
    });
    
    input.value = '';
    updateTransformationSteps();
    saveDiltsData();
    showNotification('Transformationsschritt hinzugefügt!', 'success');
}

function updateTransformationSteps() {
    const stepsList = document.getElementById('transformation-steps');
    const steps = diltsData.transformationSteps;
    
    if (steps.length === 0) {
        stepsList.innerHTML = '<p>Füge deine Transformationsschritte hinzu.</p>';
        return;
    }
    
    const levelNames = {
        environment: '🌍 Umgebung',
        behavior: '🎭 Verhalten',
        capabilities: '🧠 Fähigkeiten',
        beliefs: '💭 Überzeugungen',
        identity: '👤 Identität',
        spirituality: '🌍 Spiritualität'
    };
    
    stepsList.innerHTML = steps.map(step => `
        <div class="transformation-step">
            <div class="step-content">
                <span class="step-level">${levelNames[step.level]}</span>
                <span class="step-text">${step.text}</span>
            </div>
            <button class="remove-step" onclick="removeTransformationStep(${step.id})">&times;</button>
        </div>
    `).join('');
}

function removeTransformationStep(stepId) {
    diltsData.transformationSteps = diltsData.transformationSteps.filter(s => s.id !== stepId);
    updateTransformationSteps();
    saveDiltsData();
}

function showSMARTGoals() {
    showToolModal('SMART-Ziele', `
        <h4>SMART-Ziele definieren:</h4>
        <div class="smart-criteria">
            <div class="criterion">
                <h5>S - Spezifisch</h5>
                <p>Was genau möchtest du erreichen?</p>
                <textarea placeholder="Beschreibe dein Ziel so spezifisch wie möglich..." rows="2"></textarea>
            </div>
            <div class="criterion">
                <h5>M - Messbar</h5>
                <p>Wie kannst du den Fortschritt messen?</p>
                <textarea placeholder="Definiere messbare Kriterien..." rows="2"></textarea>
            </div>
            <div class="criterion">
                <h5>A - Erreichbar</h5>
                <p>Ist das Ziel realistisch erreichbar?</p>
                <textarea placeholder="Bewerte die Erreichbarkeit..." rows="2"></textarea>
            </div>
            <div class="criterion">
                <h5>R - Relevant</h5>
                <p>Warum ist dieses Ziel wichtig für dich?</p>
                <textarea placeholder="Erkläre die Relevanz..." rows="2"></textarea>
            </div>
            <div class="criterion">
                <h5>T - Zeitgebunden</h5>
                <p>Bis wann möchtest du das Ziel erreichen?</p>
                <textarea placeholder="Setze einen konkreten Zeitrahmen..." rows="2"></textarea>
            </div>
        </div>
        <button class="btn btn-primary" onclick="saveSMARTGoal()">Ziel speichern</button>
    `);
}

function showHabitStacking() {
    showToolModal('Gewohnheits-Stacking', `
        <h4>Gewohnheits-Stacking:</h4>
        <p>Verankere neue Gewohnheiten an bestehende Routinen.</p>
        
        <div class="habit-stacking-form">
            <div class="existing-habit">
                <label>Bestehende Gewohnheit:</label>
                <input type="text" placeholder="z.B. Ich trinke morgens meinen ersten Kaffee">
            </div>
            <div class="new-habit">
                <label>Neue Gewohnheit:</label>
                <input type="text" placeholder="z.B. Ich meditiere 5 Minuten">
            </div>
            <div class="stacked-habit">
                <label>Gewohnheits-Stack:</label>
                <input type="text" placeholder="Nachdem ich morgens meinen ersten Kaffee getrunken habe, meditiere ich 5 Minuten" readonly>
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="createHabitStack()">Stack erstellen</button>
    `);
}

function showAffirmations() {
    showToolModal('Affirmationen', `
        <h4>Positive Affirmationen:</h4>
        <p>Erstelle unterstützende Affirmationen für jede Ebene.</p>
        
        <div class="affirmation-levels">
            <div class="affirmation-level">
                <h5>🌍 Umgebung</h5>
                <textarea placeholder="z.B. Ich umgebe mich mit Menschen, die mich unterstützen..." rows="2"></textarea>
            </div>
            <div class="affirmation-level">
                <h5>🎭 Verhalten</h5>
                <textarea placeholder="z.B. Ich handle konsequent in Richtung meiner Ziele..." rows="2"></textarea>
            </div>
            <div class="affirmation-level">
                <h5>🧠 Fähigkeiten</h5>
                <textarea placeholder="z.B. Ich lerne kontinuierlich und entwickle neue Fähigkeiten..." rows="2"></textarea>
            </div>
            <div class="affirmation-level">
                <h5>💭 Überzeugungen</h5>
                <textarea placeholder="z.B. Ich glaube an meine Fähigkeit, meine Ziele zu erreichen..." rows="2"></textarea>
            </div>
            <div class="affirmation-level">
                <h5>👤 Identität</h5>
                <textarea placeholder="z.B. Ich bin eine Person, die ihre Träume verwirklicht..." rows="2"></textarea>
            </div>
            <div class="affirmation-level">
                <h5>🌍 Spiritualität</h5>
                <textarea placeholder="z.B. Ich lebe in Übereinstimmung mit meinem höheren Zweck..." rows="2"></textarea>
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="saveAffirmations()">Affirmationen speichern</button>
    `);
}

function showVisualization() {
    showToolModal('Visualisierung', `
        <h4>Ziel-Visualisierung:</h4>
        <p>Visualisiere dein Ziel auf allen 6 Ebenen.</p>
        
        <div class="visualization-exercise">
            <h5>Schließe die Augen und stelle dir vor:</h5>
            <div class="visualization-steps">
                <div class="step">
                    <h6>🌍 Umgebung</h6>
                    <p>Wie sieht deine ideale Umgebung aus?</p>
                </div>
                <div class="step">
                    <h6>🎭 Verhalten</h6>
                    <p>Wie verhältst du dich in deiner gewünschten Zukunft?</p>
                </div>
                <div class="step">
                    <h6>🧠 Fähigkeiten</h6>
                    <p>Welche Fähigkeiten hast du entwickelt?</p>
                </div>
                <div class="step">
                    <h6>💭 Überzeugungen</h6>
                    <p>Welche Überzeugungen hast du?</p>
                </div>
                <div class="step">
                    <h6>👤 Identität</h6>
                    <p>Wer bist du in deiner gewünschten Zukunft?</p>
                </div>
                <div class="step">
                    <h6>🌍 Spiritualität</h6>
                    <p>Wie verbindest du dich mit deinem höheren Zweck?</p>
                </div>
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="startVisualization()">Visualisierung starten</button>
    `);
}

function showActionPlan() {
    showToolModal('Aktionsplan', `
        <h4>Detaillierter Aktionsplan:</h4>
        
        <div class="action-plan-builder">
            <div class="plan-input">
                <label>Aktion:</label>
                <input type="text" placeholder="Was möchtest du tun?">
            </div>
            <div class="plan-input">
                <label>Ebene:</label>
                <select>
                    <option value="environment">Umgebung</option>
                    <option value="behavior">Verhalten</option>
                    <option value="capabilities">Fähigkeiten</option>
                    <option value="beliefs">Überzeugungen</option>
                    <option value="identity">Identität</option>
                    <option value="spirituality">Spiritualität</option>
                </select>
            </div>
            <div class="plan-input">
                <label>Zeitrahmen:</label>
                <input type="text" placeholder="z.B. 30 Tage, 3 Monate">
            </div>
            <div class="plan-input">
                <label>Meilensteine:</label>
                <textarea placeholder="Definiere Zwischenziele..." rows="3"></textarea>
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="addActionPlan()">Zum Plan hinzufügen</button>
    `);
}

function showProgressTracking() {
    showToolModal('Fortschritts-Tracking', `
        <h4>Fortschritts-Tracking:</h4>
        <p>Verfolge deinen Fortschritt auf allen Ebenen.</p>
        
        <div class="progress-tracking">
            <div class="tracking-level">
                <h5>🌍 Umgebung</h5>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 60%"></div>
                </div>
                <span>60%</span>
            </div>
            <div class="tracking-level">
                <h5>🎭 Verhalten</h5>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 40%"></div>
                </div>
                <span>40%</span>
            </div>
            <div class="tracking-level">
                <h5>🧠 Fähigkeiten</h5>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 80%"></div>
                </div>
                <span>80%</span>
            </div>
            <div class="tracking-level">
                <h5>💭 Überzeugungen</h5>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 30%"></div>
                </div>
                <span>30%</span>
            </div>
            <div class="tracking-level">
                <h5>👤 Identität</h5>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 50%"></div>
                </div>
                <span>50%</span>
            </div>
            <div class="tracking-level">
                <h5>🌍 Spiritualität</h5>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 70%"></div>
                </div>
                <span>70%</span>
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="updateProgress()">Fortschritt aktualisieren</button>
    `);
}

function showToolModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'tool-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function saveCommitment() {
    const startDate = document.getElementById('start-date').value;
    const reflectionFrequency = document.getElementById('reflection-frequency').value;
    const supportPerson = document.getElementById('support-person').value;
    const personalCommitment = document.getElementById('personal-commitment').value;
    
    if (!startDate || !personalCommitment) {
        showNotification('Bitte fülle alle Pflichtfelder aus!', 'warning');
        return;
    }
    
    diltsData.commitment = {
        startDate,
        reflectionFrequency,
        supportPerson,
        personalCommitment
    };
    
    saveDiltsData();
    showNotification('Commitment gespeichert! Du kannst jetzt mit deiner Transformation beginnen.', 'success');
}

function closeModal(button) {
    const modal = button.closest('.tool-modal');
    modal.remove();
}

// Data persistence functions
function saveDiltsData() {
    localStorage.setItem('nlp-dilts-data', JSON.stringify(diltsData));
}

function loadSavedDiltsData() {
    const saved = localStorage.getItem('nlp-dilts-data');
    if (saved) {
        diltsData = JSON.parse(saved);
        
        // Restore level textareas
        Object.keys(diltsData.levels).forEach(level => {
            const textarea = document.querySelector(`.pyramid-level.${level} textarea`);
            if (textarea) {
                textarea.value = diltsData.levels[level];
            }
        });
        
        // Restore strategy textareas
        Object.keys(diltsData.strategies).forEach(level => {
            const textarea = document.querySelector(`.strategy-level textarea`);
            if (textarea) {
                textarea.value = diltsData.strategies[level];
            }
        });
        
        // Restore main goal
        if (diltsData.mainGoal) {
            document.getElementById('main-goal').value = diltsData.mainGoal;
        }
        
        // Restore alignment sliders
        Object.keys(diltsData.alignment).forEach(level => {
            const slider = document.querySelector(`.alignment-level input[type="range"]`);
            if (slider) {
                slider.value = diltsData.alignment[level];
                const valueDisplay = slider.parentElement.querySelector('.alignment-value');
                if (valueDisplay) {
                    valueDisplay.textContent = diltsData.alignment[level];
                }
            }
        });
        
        // Restore alignment notes
        Object.keys(diltsData.alignmentNotes).forEach(level => {
            const textarea = document.querySelector(`.alignment-level textarea`);
            if (textarea) {
                textarea.value = diltsData.alignmentNotes[level];
            }
        });
        
        // Restore commitment
        if (diltsData.commitment.startDate) {
            document.getElementById('start-date').value = diltsData.commitment.startDate;
        }
        if (diltsData.commitment.reflectionFrequency) {
            document.getElementById('reflection-frequency').value = diltsData.commitment.reflectionFrequency;
        }
        if (diltsData.commitment.supportPerson) {
            document.getElementById('support-person').value = diltsData.commitment.supportPerson;
        }
        if (diltsData.commitment.personalCommitment) {
            document.getElementById('personal-commitment').value = diltsData.commitment.personalCommitment;
        }
        
        // Restore transformation steps
        updateTransformationSteps();
        
        // Update alignment summary
        updateAlignmentSummary();
    }
}
