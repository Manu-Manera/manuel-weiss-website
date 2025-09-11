// Emotionale Intelligenz JavaScript Functions

let eqScores = {
    'self-awareness': 0,
    'self-regulation': 0,
    'social-skills': 0,
    'empathy': 0
};
let emotionLogs = [];
let toolUsage = [];
let empathyExercises = [];

function initEmotionalIntelligence() {
    console.log('Initializing Emotional Intelligence...');
    
    // Load saved data
    loadSavedEQData();
    loadSavedEmotionLogs();
    
    // Setup event listeners
    setupEQEventListeners();
    
    // Set current datetime
    const now = new Date();
    const datetime = now.toISOString().slice(0, 16);
    document.getElementById('emotion-timestamp').value = datetime;
    
    // Update statistics
    updateEQStatistics();
}

function setupEQEventListeners() {
    // EQ assessment sliders
    document.querySelectorAll('.eq-slider').forEach(slider => {
        slider.addEventListener('input', updateEQScores);
    });
    
    // Emotion intensity slider
    const intensitySlider = document.getElementById('emotion-intensity');
    if (intensitySlider) {
        intensitySlider.addEventListener('input', (e) => {
            document.getElementById('intensity-value').textContent = e.target.value;
        });
    }
}

function updateEQScores() {
    // Calculate scores for each pillar
    const pillars = ['self-awareness', 'self-regulation', 'social-skills', 'empathy'];
    
    pillars.forEach(pillar => {
        const sliders = document.querySelectorAll(`[data-pillar="${pillar}"]`);
        let totalScore = 0;
        
        sliders.forEach(slider => {
            totalScore += parseInt(slider.value);
        });
        
        eqScores[pillar] = Math.round((totalScore / sliders.length) * 10);
    });
    
    // Update display
    updateEQDisplay();
    
    // Save assessment
    saveEQData();
}

function updateEQDisplay() {
    // Calculate overall score
    const overallScore = Math.round(Object.values(eqScores).reduce((sum, score) => sum + score, 0) / 4);
    
    document.getElementById('overall-eq-score').textContent = overallScore;
    document.getElementById('eq-score-description').textContent = getEQDescription(overallScore);
    
    // Update pillar scores
    Object.keys(eqScores).forEach(pillar => {
        const score = eqScores[pillar];
        const fillElement = document.getElementById(`${pillar}-fill`);
        const valueElement = document.getElementById(`${pillar}-value`);
        
        if (fillElement && valueElement) {
            fillElement.style.width = `${score}%`;
            valueElement.textContent = score;
        }
    });
    
    // Update development plan
    updateDevelopmentPlan();
}

function getEQDescription(score) {
    if (score >= 80) {
        return "Ausgezeichnet! Du hast eine sehr hohe emotionale Intelligenz.";
    } else if (score >= 60) {
        return "Gut! Du bist auf dem richtigen Weg. Es gibt noch Raum für Verbesserungen.";
    } else if (score >= 40) {
        return "Durchschnittlich. Emotionale Intelligenz kann trainiert werden.";
    } else {
        return "Es gibt viel Potenzial! Beginne mit kleinen Schritten zur emotionalen Entwicklung.";
    }
}

function saveEmotionLog() {
    const timestamp = document.getElementById('emotion-timestamp').value;
    const situation = document.getElementById('emotion-situation').value;
    const emotion = document.querySelector('input[name="emotion"]:checked')?.value;
    const intensity = parseInt(document.getElementById('emotion-intensity').value);
    const thoughts = document.getElementById('emotion-thoughts').value;
    const response = document.getElementById('emotion-response').value;
    const coping = document.getElementById('emotion-coping').value;
    
    if (!situation.trim() || !emotion) {
        showNotification('Bitte fülle mindestens Situation und Emotion aus!', 'warning');
        return;
    }
    
    const log = {
        id: Date.now(),
        timestamp: timestamp,
        situation: situation,
        emotion: emotion,
        intensity: intensity,
        thoughts: thoughts,
        response: response,
        coping: coping,
        createdAt: new Date().toISOString()
    };
    
    emotionLogs.push(log);
    saveEmotionLogs();
    updateEmotionPatterns();
    updateEQStatistics();
    
    // Clear form
    document.getElementById('emotion-situation').value = '';
    document.getElementById('emotion-thoughts').value = '';
    document.getElementById('emotion-response').value = '';
    document.getElementById('emotion-coping').value = '';
    document.getElementById('emotion-intensity').value = '5';
    document.getElementById('intensity-value').textContent = '5';
    
    // Clear emotion selection
    document.querySelectorAll('input[name="emotion"]').forEach(radio => {
        radio.checked = false;
    });
    
    showNotification('Emotion gespeichert!', 'success');
}

function updateEmotionPatterns() {
    if (emotionLogs.length === 0) return;
    
    // Analyze frequent emotions
    const emotionCounts = {};
    const triggerCounts = {};
    const copingCounts = {};
    
    emotionLogs.forEach(log => {
        // Count emotions
        emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
        
        // Count triggers (simplified - first few words of situation)
        const trigger = log.situation.split(' ').slice(0, 3).join(' ');
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        
        // Count coping strategies
        if (log.coping) {
            const coping = log.coping.split(' ').slice(0, 3).join(' ');
            copingCounts[coping] = (copingCounts[coping] || 0) + 1;
        }
    });
    
    // Update frequent emotions
    const frequentEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([emotion, count]) => `<div class="pattern-item">${emotion}: ${count}x</div>`)
        .join('');
    
    document.getElementById('frequent-emotions').innerHTML = frequentEmotions || '<p>Noch keine Muster erkennbar.</p>';
    
    // Update triggers
    const topTriggers = Object.entries(triggerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([trigger, count]) => `<div class="pattern-item">${trigger}: ${count}x</div>`)
        .join('');
    
    document.getElementById('emotional-triggers').innerHTML = topTriggers || '<p>Noch keine Auslöser erkennbar.</p>';
    
    // Update coping strategies
    const topCoping = Object.entries(copingCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([coping, count]) => `<div class="pattern-item">${coping}: ${count}x</div>`)
        .join('');
    
    document.getElementById('coping-strategies').innerHTML = topCoping || '<p>Noch keine Strategien erkennbar.</p>';
}

function startTool(toolType) {
    const toolData = getToolData(toolType);
    
    // Show tool player
    document.getElementById('tool-player').style.display = 'block';
    document.getElementById('current-tool-title').textContent = toolData.title;
    
    // Load instructions
    loadToolInstructions(toolData);
    
    // Track tool usage
    trackToolUsage(toolType);
    
    showNotification(`${toolData.title} gestartet!`, 'success');
}

function getToolData(toolType) {
    const tools = {
        'breathing-technique': {
            title: '4-7-8 Atemtechnik',
            instructions: [
                'Setze dich bequem hin und schließe die Augen.',
                'Atme durch die Nase ein und zähle bis 4.',
                'Halte den Atem und zähle bis 7.',
                'Atme durch den Mund aus und zähle bis 8.',
                'Wiederhole diesen Zyklus 4-8 Mal.',
                'Konzentriere dich nur auf das Zählen.',
                'Spüre, wie dein Körper entspannt.'
            ]
        },
        'countdown': {
            title: 'Countdown-Technik',
            instructions: [
                'Stoppe alles, was du gerade tust.',
                'Zähle langsam von 10 rückwärts.',
                'Bei jeder Zahl atme tief ein und aus.',
                'Konzentriere dich nur auf das Zählen.',
                'Wenn du bei 1 angekommen bist, fühle dich ruhiger.',
                'Nimm dir einen Moment, bevor du weitermachst.'
            ]
        },
        'perspective-shift': {
            title: 'Perspektivenwechsel',
            instructions: [
                'Stelle dir vor, du bist ein neutraler Beobachter.',
                'Betrachte die Situation aus der Vogelperspektive.',
                'Frage dich: "Was würde ich einem Freund raten?"',
                'Überlege: "Wie wird das in einem Jahr aussehen?"',
                'Denke an ähnliche Situationen, die gut ausgegangen sind.',
                'Nimm eine neue, gelassenere Perspektive ein.'
            ]
        },
        'grounding': {
            title: '5-4-3-2-1 Technik',
            instructions: [
                'Nenne 5 Dinge, die du sehen kannst.',
                'Nenne 4 Dinge, die du berühren kannst.',
                'Nenne 3 Dinge, die du hören kannst.',
                'Nenne 2 Dinge, die du riechen kannst.',
                'Nenne 1 Ding, das du schmecken kannst.',
                'Spüre, wie du dich erdest und beruhigst.'
            ]
        },
        'worry-time': {
            title: 'Sorgen-Zeit',
            instructions: [
                'Sage dir: "Jetzt ist nicht die Zeit für Sorgen."',
                'Notiere die Sorge kurz auf einem Zettel.',
                'Vereinbare mit dir eine feste "Sorgen-Zeit" (z.B. 19:00).',
                'Verschiebe alle Sorgen auf diese Zeit.',
                'Konzentriere dich auf das Hier und Jetzt.',
                'In der Sorgen-Zeit kannst du dir 15 Minuten Sorgen machen.'
            ]
        },
        'reality-check': {
            title: 'Realitäts-Check',
            instructions: [
                'Schreibe deine Sorge auf.',
                'Bewerte die Wahrscheinlichkeit von 0-100%.',
                'Überlege: "Was ist das Schlimmste, was passieren könnte?"',
                'Frage: "Wie wahrscheinlich ist das wirklich?"',
                'Denke an Beweise, die dagegen sprechen.',
                'Komm zu einer realistischen Einschätzung.'
            ]
        },
        'self-compassion': {
            title: 'Selbstmitgefühl',
            instructions: [
                'Erkenne an: "Das ist ein schwieriger Moment."',
                'Erinnere dich: "Schwierigkeiten gehören zum Leben dazu."',
                'Sage dir: "Ich bin nicht allein mit diesem Gefühl."',
                'Behandle dich wie einen guten Freund.',
                'Sage dir liebevolle Worte.',
                'Spüre Mitgefühl für dich selbst.'
            ]
        },
        'gratitude-practice': {
            title: 'Dankbarkeits-Übung',
            instructions: [
                'Denke an 3 Dinge, für die du dankbar bist.',
                'Kleine Dinge zählen genauso wie große.',
                'Spüre die Dankbarkeit in deinem Körper.',
                'Denke an Menschen, die dir wichtig sind.',
                'Erkenne positive Aspekte in deinem Leben.',
                'Lasse die Dankbarkeit deine Stimmung heben.'
            ]
        },
        'activity-scheduling': {
            title: 'Aktivitäts-Planung',
            instructions: [
                'Überlege, was dir normalerweise Freude macht.',
                'Plane eine angenehme Aktivität für heute.',
                'Kann etwas Einfaches sein (Musik hören, spazieren).',
                'Setze dir ein konkretes Ziel.',
                'Führe die Aktivität durch.',
                'Genieße den Moment bewusst.'
            ]
        }
    };
    
    return tools[toolType] || tools['breathing-technique'];
}

function loadToolInstructions(toolData) {
    const instructionsContainer = document.getElementById('tool-instructions');
    instructionsContainer.innerHTML = toolData.instructions.map((instruction, index) => `
        <div class="instruction-step ${index === 0 ? 'active' : ''}" data-step="${index}">
            <div class="step-number">${index + 1}</div>
            <div class="step-text">${instruction}</div>
        </div>
    `).join('');
    
    // Start instruction progression
    startInstructionProgression(toolData.instructions.length);
}

function startInstructionProgression(totalSteps) {
    let currentStep = 0;
    const stepInterval = setInterval(() => {
        // Remove active class from current step
        document.querySelector(`.instruction-step[data-step="${currentStep}"]`)?.classList.remove('active');
        
        currentStep++;
        
        if (currentStep < totalSteps) {
            // Add active class to next step
            document.querySelector(`.instruction-step[data-step="${currentStep}"]`)?.classList.add('active');
        } else {
            clearInterval(stepInterval);
        }
    }, 10000); // 10 seconds per step
}

function stopTool() {
    document.getElementById('tool-player').style.display = 'none';
}

function trackToolUsage(toolType) {
    const usage = {
        id: Date.now(),
        tool: toolType,
        date: new Date().toISOString()
    };
    
    toolUsage.push(usage);
    saveToolUsage();
    updateEQStatistics();
}

function startEmpathyExercise(exerciseType) {
    const exerciseData = getEmpathyExerciseData(exerciseType);
    
    // Show exercise modal
    showEmpathyExerciseModal(exerciseData);
    
    // Track exercise
    trackEmpathyExercise(exerciseType);
}

function getEmpathyExerciseData(exerciseType) {
    const exercises = {
        'facial-expressions': {
            title: 'Gesichtsausdrücke lesen',
            description: 'Lerne, Emotionen in Gesichtern zu erkennen.',
            steps: [
                'Schau dir das Gesicht genau an.',
                'Achte auf Augenbrauen, Augen, Mund.',
                'Welche Emotion siehst du?',
                'Überprüfe deine Einschätzung.',
                'Lerne aus deinen Beobachtungen.'
            ]
        },
        'body-language': {
            title: 'Körpersprache verstehen',
            description: 'Erkenne Emotionen in der Körpersprache.',
            steps: [
                'Beobachte die Körperhaltung.',
                'Achte auf Arme und Hände.',
                'Schau auf die Beinstellung.',
                'Interpretiere die Körpersprache.',
                'Überprüfe deine Einschätzung.'
            ]
        },
        'role-switching': {
            title: 'Rollentausch',
            description: 'Versetze dich in die Lage anderer.',
            steps: [
                'Wähle eine Person aus.',
                'Stelle dir vor, du wärst diese Person.',
                'Wie würdest du dich fühlen?',
                'Was würdest du denken?',
                'Wie würdest du handeln?'
            ]
        },
        'conflict-mediation': {
            title: 'Konflikt-Mediation',
            description: 'Lerne, Konflikte aus verschiedenen Blickwinkeln zu sehen.',
            steps: [
                'Identifiziere die Konfliktparteien.',
                'Verstehe die Position von Person A.',
                'Verstehe die Position von Person B.',
                'Finde Gemeinsamkeiten.',
                'Entwickle eine Lösung.'
            ]
        },
        'listening-techniques': {
            title: 'Zuhör-Techniken',
            description: 'Verbessere deine Zuhör-Fähigkeiten.',
            steps: [
                'Gib deine volle Aufmerksamkeit.',
                'Stelle offene Fragen.',
                'Paraphrasiere das Gehörte.',
                'Zeige Empathie.',
                'Vermeide Urteile.'
            ]
        },
        'emotional-validation': {
            title: 'Emotionale Validierung',
            description: 'Lerne, die Emotionen anderer anzuerkennen.',
            steps: [
                'Erkenne die Emotion an.',
                'Zeige Verständnis.',
                'Vermeide Abwertungen.',
                'Biete Unterstützung an.',
                'Respektiere die Gefühle.'
            ]
        }
    };
    
    return exercises[exerciseType] || exercises['facial-expressions'];
}

function showEmpathyExerciseModal(exerciseData) {
    const modalContent = `
        <h4>${exerciseData.title}</h4>
        <p>${exerciseData.description}</p>
        <ol>
            ${exerciseData.steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
        <div class="exercise-actions">
            <button class="btn btn-primary" onclick="completeEmpathyExercise()">Übung abgeschlossen</button>
        </div>
    `;
    
    showModal('Empathie-Übung', modalContent);
}

function completeEmpathyExercise() {
    closeModal();
    showNotification('Empathie-Übung abgeschlossen!', 'success');
}

function trackEmpathyExercise(exerciseType) {
    const exercise = {
        id: Date.now(),
        type: exerciseType,
        date: new Date().toISOString()
    };
    
    empathyExercises.push(exercise);
    saveEmpathyExercises();
    updateEQStatistics();
}

function startScenario(scenarioType) {
    const scenarioData = getScenarioData(scenarioType);
    showScenarioModal(scenarioData);
}

function getScenarioData(scenarioType) {
    const scenarios = {
        'stressed-colleague': {
            title: 'Gestresster Kollege',
            description: 'Dein Kollege wirkt überfordert und gereizt.',
            options: [
                'Frage nach, ob alles in Ordnung ist',
                'Biete deine Hilfe an',
                'Ignoriere es und arbeite weiter',
                'Sage ihm, er soll sich zusammenreißen'
            ],
            correct: 0,
            explanation: 'Nachfragen zeigt Empathie und Interesse. Es ist der erste Schritt, um zu verstehen, was los ist.'
        },
        'sad-friend': {
            title: 'Trauriger Freund',
            description: 'Ein guter Freund hat eine schlechte Nachricht erhalten.',
            options: [
                'Sage "Das wird schon wieder"',
                'Höre zu und zeige Mitgefühl',
                'Erzähle von deinen eigenen Problemen',
                'Bringe ihn zum Lachen'
            ],
            correct: 1,
            explanation: 'Aktives Zuhören und Mitgefühl zeigen ist am wichtigsten. Lass ihn seine Gefühle ausdrücken.'
        },
        'family-conflict': {
            title: 'Familienkonflikt',
            description: 'Es gibt Spannungen in der Familie.',
            options: [
                'Ergreife Partei für eine Seite',
                'Höre beiden Seiten zu',
                'Vermeide das Thema',
                'Sage, dass alle übertreiben'
            ],
            correct: 1,
            explanation: 'Als Mediator solltest du neutral bleiben und beiden Seiten zuhören, um eine Lösung zu finden.'
        }
    };
    
    return scenarios[scenarioType] || scenarios['stressed-colleague'];
}

function showScenarioModal(scenarioData) {
    const modalContent = `
        <h4>${scenarioData.title}</h4>
        <p>${scenarioData.description}</p>
        <div class="scenario-options">
            ${scenarioData.options.map((option, index) => `
                <button class="btn btn-outline scenario-option" onclick="selectScenarioOption(${index}, ${scenarioData.correct})">
                    ${option}
                </button>
            `).join('')}
        </div>
        <div class="scenario-explanation" id="scenario-explanation" style="display: none;">
            <h5>Erklärung:</h5>
            <p>${scenarioData.explanation}</p>
        </div>
    `;
    
    showModal('Empathie-Szenario', modalContent);
}

function selectScenarioOption(selected, correct) {
    const explanation = document.getElementById('scenario-explanation');
    const options = document.querySelectorAll('.scenario-option');
    
    // Show explanation
    explanation.style.display = 'block';
    
    // Update button styles
    options.forEach((option, index) => {
        if (index === correct) {
            option.classList.remove('btn-outline');
            option.classList.add('btn-success');
        } else if (index === selected && index !== correct) {
            option.classList.remove('btn-outline');
            option.classList.add('btn-danger');
        } else {
            option.disabled = true;
        }
    });
    
    if (selected === correct) {
        showNotification('Richtige Antwort! 🎉', 'success');
    } else {
        showNotification('Überlege nochmal! 💭', 'warning');
    }
}

function updateDevelopmentPlan() {
    Object.keys(eqScores).forEach(pillar => {
        const score = eqScores[pillar];
        const scoreElement = document.getElementById(`${pillar}-score`);
        const suggestionsElement = document.getElementById(`${pillar}-suggestions`);
        
        if (scoreElement) {
            scoreElement.textContent = `${score}/100`;
        }
        
        if (suggestionsElement) {
            suggestionsElement.innerHTML = getImprovementSuggestions(pillar, score);
        }
    });
}

function getImprovementSuggestions(pillar, score) {
    const suggestions = {
        'self-awareness': {
            high: '<p>Ausgezeichnet! Du bist sehr selbstbewusst. Arbeite an der Feinabstimmung deiner Wahrnehmung.</p>',
            medium: '<p>Gut! Übe täglich, deine Emotionen zu benennen und zu beobachten.</p>',
            low: '<p>Beginne mit einem Emotionen-Tagebuch. Notiere täglich deine Gefühle.</p>'
        },
        'self-regulation': {
            high: '<p>Fantastisch! Du kannst deine Emotionen gut regulieren. Teile deine Strategien mit anderen.</p>',
            medium: '<p>Übe Atemtechniken und Achtsamkeit, um deine Selbstregulation zu verbessern.</p>',
            low: '<p>Lerne grundlegende Entspannungstechniken. Beginne mit der 4-7-8 Atemtechnik.</p>'
        },
        'social-skills': {
            high: '<p>Hervorragend! Du hast ausgezeichnete soziale Fähigkeiten. Werde zum Mentor für andere.</p>',
            medium: '<p>Übe aktives Zuhören und verbessere deine Kommunikationsfähigkeiten.</p>',
            low: '<p>Beginne mit kleinen Gesprächen. Übe, Fragen zu stellen und zuzuhören.</p>'
        },
        'empathy': {
            high: '<p>Wunderbar! Du bist sehr empathisch. Nutze diese Gabe, um anderen zu helfen.</p>',
            medium: '<p>Übe, dich in andere hineinzuversetzen. Stelle dir vor, wie sie sich fühlen.</p>',
            low: '<p>Beginne damit, die Körpersprache und Gesichtsausdrücke anderer zu beobachten.</p>'
        }
    };
    
    const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
    return suggestions[pillar][level];
}

function updateEQStatistics() {
    // Calculate overall progress
    const currentScore = Math.round(Object.values(eqScores).reduce((sum, score) => sum + score, 0) / 4);
    const initialScore = getInitialEQScore();
    document.getElementById('eq-progress').textContent = `${initialScore} → ${currentScore}`;
    
    // Update other metrics
    document.getElementById('emotions-tracked').textContent = emotionLogs.length;
    document.getElementById('tools-used').textContent = toolUsage.length;
    document.getElementById('empathy-exercises').textContent = empathyExercises.length;
}

function getInitialEQScore() {
    // This would be stored from the first assessment
    const saved = localStorage.getItem('initial-eq-score');
    return saved ? parseInt(saved) : 0;
}

function saveInitialEQScore() {
    const currentScore = Math.round(Object.values(eqScores).reduce((sum, score) => sum + score, 0) / 4);
    localStorage.setItem('initial-eq-score', currentScore.toString());
}

// Data persistence functions
function saveEQData() {
    localStorage.setItem('eq-scores', JSON.stringify(eqScores));
    saveInitialEQScore();
}

function loadSavedEQData() {
    const saved = localStorage.getItem('eq-scores');
    if (saved) {
        eqScores = JSON.parse(saved);
        updateEQDisplay();
    }
}

function saveEmotionLogs() {
    localStorage.setItem('emotion-logs', JSON.stringify(emotionLogs));
}

function loadSavedEmotionLogs() {
    const saved = localStorage.getItem('emotion-logs');
    if (saved) {
        emotionLogs = JSON.parse(saved);
        updateEmotionPatterns();
    }
}

function saveToolUsage() {
    localStorage.setItem('tool-usage', JSON.stringify(toolUsage));
}

function loadSavedToolUsage() {
    const saved = localStorage.getItem('tool-usage');
    if (saved) {
        toolUsage = JSON.parse(saved);
    }
}

function saveEmpathyExercises() {
    localStorage.setItem('empathy-exercises', JSON.stringify(empathyExercises));
}

function loadSavedEmpathyExercises() {
    const saved = localStorage.getItem('empathy-exercises');
    if (saved) {
        empathyExercises = JSON.parse(saved);
    }
}

function loadSavedEQData() {
    const saved = localStorage.getItem('eq-scores');
    if (saved) {
        eqScores = JSON.parse(saved);
        updateEQDisplay();
    }
    
    loadSavedEmotionLogs();
    loadSavedToolUsage();
    loadSavedEmpathyExercises();
}
