// Kommunikation JavaScript Functions

let communicationScores = {
    listening: 0,
    verbal: 0,
    nonverbal: 0,
    conflict: 0
};

let communicationData = {
    assessment: {},
    practice: [],
    improvements: []
};

function initCommunication() {
    console.log('Initializing Communication...');
    
    // Load saved data
    loadSavedCommunicationData();
    
    // Setup event listeners
    setupCommunicationEventListeners();
    
    // Initialize UI
    updateCommunicationScores();
}

function setupCommunicationEventListeners() {
    // Communication sliders
    document.querySelectorAll('.communication-slider').forEach(slider => {
        slider.addEventListener('input', updateCommunicationScores);
    });
}

function updateCommunicationScores() {
    // Calculate scores for each category
    const categories = ['listening', 'verbal', 'nonverbal', 'conflict'];
    
    categories.forEach(category => {
        const sliders = document.querySelectorAll(`[data-category="${category}"]`);
        let total = 0;
        let count = 0;
        
        sliders.forEach(slider => {
            total += parseInt(slider.value);
            count++;
        });
        
        const average = count > 0 ? Math.round((total / count) * 10) : 0;
        communicationScores[category] = average;
        
        // Update UI
        const scoreElement = document.getElementById(`${category}-score`);
        const valueElement = document.getElementById(`${category}-value`);
        
        if (scoreElement && valueElement) {
            scoreElement.style.width = average + '%';
            valueElement.textContent = average + '/100';
        }
    });
    
    // Calculate overall score
    const overallScore = Math.round(
        (communicationScores.listening + communicationScores.verbal + 
         communicationScores.nonverbal + communicationScores.conflict) / 4
    );
    
    const overallElement = document.getElementById('overall-communication-score');
    const descriptionElement = document.getElementById('communication-description');
    
    if (overallElement) {
        overallElement.textContent = overallScore;
    }
    
    if (descriptionElement) {
        descriptionElement.textContent = getCommunicationDescription(overallScore);
    }
    
    // Save data
    saveCommunicationData();
}

function getCommunicationDescription(score) {
    if (score >= 90) {
        return 'Hervorragend! Du bist ein Kommunikations-Profi.';
    } else if (score >= 80) {
        return 'Sehr gut! Du kommunizierst sehr effektiv.';
    } else if (score >= 70) {
        return 'Gut! Du hast solide Kommunikationsfähigkeiten.';
    } else if (score >= 60) {
        return 'Durchschnittlich. Es gibt noch Verbesserungspotential.';
    } else if (score >= 50) {
        return 'Verbesserungsbedarf. Fokussiere dich auf die schwächeren Bereiche.';
    } else {
        return 'Signifikante Verbesserung nötig. Arbeite systematisch an deinen Kommunikationsfähigkeiten.';
    }
}

function practiceTechnique(technique) {
    const techniques = {
        'paraphrasing': {
            title: 'Paraphrasieren üben',
            description: 'Wiederhole das Gehörte in deinen eigenen Worten.',
            examples: [
                'Du sagst also, dass du dich überfordert fühlst, weil...',
                'Wenn ich dich richtig verstehe, dann...',
                'Du meinst, dass die Situation schwierig ist, weil...'
            ]
        },
        'open-questions': {
            title: 'Offene Fragen üben',
            description: 'Stelle Fragen, die zu ausführlichen Antworten einladen.',
            examples: [
                'Wie hast du dich dabei gefühlt?',
                'Was denkst du über diese Situation?',
                'Kannst du mir mehr darüber erzählen?'
            ]
        },
        'summarizing': {
            title: 'Zusammenfassen üben',
            description: 'Fasse die wichtigsten Punkte zusammen.',
            examples: [
                'Lass mich zusammenfassen, was ich verstanden habe...',
                'Die wichtigsten Punkte sind...',
                'Zusammenfassend kann ich sagen...'
            ]
        },
        'reflecting': {
            title: 'Gefühle spiegeln üben',
            description: 'Erkenne und spiegle die Emotionen des Sprechers.',
            examples: [
                'Du wirkst frustriert über diese Situation.',
                'Ich höre Traurigkeit in deiner Stimme.',
                'Du scheinst begeistert von dieser Idee zu sein.'
            ]
        }
    };
    
    const techniqueData = techniques[technique];
    if (!techniqueData) return;
    
    showTechniqueModal(techniqueData);
}

function showTechniqueModal(techniqueData) {
    const modal = document.createElement('div');
    modal.className = 'technique-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${techniqueData.title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p>${techniqueData.description}</p>
                <div class="examples">
                    <h4>Beispiele:</h4>
                    <ul>
                        ${techniqueData.examples.map(example => `<li>${example}</li>`).join('')}
                    </ul>
                </div>
                <div class="practice-area">
                    <h4>Übe jetzt:</h4>
                    <textarea placeholder="Schreibe hier deine eigene Formulierung..." rows="3"></textarea>
                    <button class="btn btn-primary" onclick="savePractice(this)">Speichern</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeModal(button) {
    const modal = button.closest('.technique-modal');
    modal.remove();
}

function savePractice(button) {
    const textarea = button.previousElementSibling;
    const practice = textarea.value.trim();
    
    if (practice) {
        communicationData.practice.push({
            technique: button.closest('.modal-content').querySelector('h3').textContent,
            practice: practice,
            timestamp: new Date().toISOString()
        });
        
        saveCommunicationData();
        showNotification('Übung gespeichert!', 'success');
        textarea.value = '';
    }
}

function startListeningExercise(scenario) {
    const scenarios = {
        'workplace-conflict': {
            title: 'Arbeitsplatz-Konflikt',
            description: 'Ein Kollege beschwert sich über die Arbeitsbelastung.',
            script: [
                'Kollege: "Ich kann das alles nicht mehr! Die Arbeitsbelastung ist einfach zu hoch."',
                'Du: [Übe aktives Zuhören]',
                'Kollege: "Ich fühle mich völlig überfordert und niemand hört mir zu."',
                'Du: [Zeige Verständnis und stelle Rückfragen]'
            ]
        },
        'family-issue': {
            title: 'Familienproblem',
            description: 'Ein Familienmitglied teilt persönliche Sorgen mit.',
            script: [
                'Familienmitglied: "Ich mache mir große Sorgen um die Zukunft."',
                'Du: [Übe aktives Zuhören]',
                'Familienmitglied: "Ich weiß nicht, ob ich die richtigen Entscheidungen treffe."',
                'Du: [Spiegle Gefühle und stelle offene Fragen]'
            ]
        },
        'friendship-crisis': {
            title: 'Freundschafts-Krise',
            description: 'Ein Freund ist verletzt und möchte reden.',
            script: [
                'Freund: "Ich bin wirklich verletzt von dem, was passiert ist."',
                'Du: [Übe aktives Zuhören]',
                'Freund: "Ich dachte, wir wären enger befreundet."',
                'Du: [Zeige Empathie und fasse zusammen]'
            ]
        }
    };
    
    const scenarioData = scenarios[scenario];
    if (!scenarioData) return;
    
    showListeningExerciseModal(scenarioData);
}

function showListeningExerciseModal(scenarioData) {
    const modal = document.createElement('div');
    modal.className = 'listening-exercise-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${scenarioData.title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p>${scenarioData.description}</p>
                <div class="exercise-script">
                    ${scenarioData.script.map((line, index) => `
                        <div class="script-line ${index % 2 === 0 ? 'other-person' : 'your-response'}">
                            <strong>${index % 2 === 0 ? 'Andere Person:' : 'Deine Antwort:'}</strong>
                            <p>${line.replace(/\[.*?\]/g, '<span class="instruction">$&</span>')}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="exercise-notes">
                    <h4>Deine Notizen:</h4>
                    <textarea placeholder="Notiere hier deine Antworten und Erkenntnisse..." rows="4"></textarea>
                    <button class="btn btn-primary" onclick="saveExerciseNotes(this, '${scenarioData.title}')">Notizen speichern</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function saveExerciseNotes(button, exerciseTitle) {
    const textarea = button.previousElementSibling;
    const notes = textarea.value.trim();
    
    if (notes) {
        communicationData.practice.push({
            type: 'listening-exercise',
            title: exerciseTitle,
            notes: notes,
            timestamp: new Date().toISOString()
        });
        
        saveCommunicationData();
        showNotification('Notizen gespeichert!', 'success');
        textarea.value = '';
    }
}

function startMirrorExercise() {
    showNotification('Spiegel-Übung: Übe vor dem Spiegel verschiedene Gesichtsausdrücke und Gesten.', 'info');
}

function startObservationExercise() {
    showNotification('Beobachtungs-Übung: Beobachte heute die Körpersprache von 3 verschiedenen Menschen.', 'info');
}

function startVideoAnalysis() {
    showNotification('Video-Analyse: Nimm dich bei einer Präsentation auf und analysiere deine Körpersprache.', 'info');
}

function startConflictExercise(scenario) {
    const scenarios = {
        'workplace': {
            title: 'Arbeitsplatz-Konflikt',
            description: 'Meinungsverschiedenheit mit einem Kollegen über ein Projekt.',
            steps: [
                'Identifiziere die Interessen beider Seiten',
                'Finde gemeinsame Ziele',
                'Entwickle Win-Win-Lösungen',
                'Kommuniziere konstruktiv'
            ]
        },
        'family': {
            title: 'Familien-Konflikt',
            description: 'Streit mit Familienmitgliedern über wichtige Entscheidungen.',
            steps: [
                'Verstehe die Bedürfnisse aller',
                'Verwende Ich-Botschaften',
                'Suche nach Kompromissen',
                'Schütze die Beziehung'
            ]
        },
        'friendship': {
            title: 'Freundschafts-Konflikt',
            description: 'Missverständnis mit einem guten Freund.',
            steps: [
                'Aktives Zuhören praktizieren',
                'Gefühle spiegeln',
                'Gemeinsam Lösungen finden',
                'Vertrauen wieder aufbauen'
            ]
        }
    };
    
    const scenarioData = scenarios[scenario];
    if (!scenarioData) return;
    
    showConflictExerciseModal(scenarioData);
}

function showConflictExerciseModal(scenarioData) {
    const modal = document.createElement('div');
    modal.className = 'conflict-exercise-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${scenarioData.title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p>${scenarioData.description}</p>
                <div class="conflict-steps">
                    <h4>Lösungsschritte:</h4>
                    <ol>
                        ${scenarioData.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                <div class="conflict-practice">
                    <h4>Deine Lösung:</h4>
                    <textarea placeholder="Beschreibe hier, wie du den Konflikt lösen würdest..." rows="4"></textarea>
                    <button class="btn btn-primary" onclick="saveConflictSolution(this, '${scenarioData.title}')">Lösung speichern</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function saveConflictSolution(button, exerciseTitle) {
    const textarea = button.previousElementSibling;
    const solution = textarea.value.trim();
    
    if (solution) {
        communicationData.practice.push({
            type: 'conflict-exercise',
            title: exerciseTitle,
            solution: solution,
            timestamp: new Date().toISOString()
        });
        
        saveCommunicationData();
        showNotification('Lösung gespeichert!', 'success');
        textarea.value = '';
    }
}

// Data persistence functions
function saveCommunicationData() {
    communicationData.assessment = communicationScores;
    localStorage.setItem('communication-data', JSON.stringify(communicationData));
}

function loadSavedCommunicationData() {
    const saved = localStorage.getItem('communication-data');
    if (saved) {
        communicationData = JSON.parse(saved);
        communicationScores = communicationData.assessment || communicationScores;
        
        // Restore slider values
        Object.keys(communicationScores).forEach(category => {
            const sliders = document.querySelectorAll(`[data-category="${category}"]`);
            sliders.forEach(slider => {
                // Set default value if no saved data
                if (communicationScores[category] > 0) {
                    slider.value = Math.round(communicationScores[category] / 10);
                }
            });
        });
    }
}
