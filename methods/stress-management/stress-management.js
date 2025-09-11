// Stress Management JavaScript Functions

let stressData = {
    sources: {
        work: [],
        relationships: [],
        finances: [],
        daily: []
    },
    symptoms: {
        emotional: [],
        physical: [],
        cognitive: []
    },
    assessment: {
        stressFrequency: 3,
        sleepQuality: 3,
        lifeSatisfaction: 3
    },
    strategies: [],
    relaxationPlan: {
        time: 'evening',
        duration: 15,
        technique: 'breathing'
    },
    preventionMeasures: [],
    monitoring: {
        dailyLevels: [],
        weeklyReviews: [],
        goals: []
    }
};

function initStressManagement() {
    console.log('Initializing Stress Management...');
    
    // Load saved data
    loadSavedStressData();
    
    // Setup event listeners
    setupStressEventListeners();
    
    // Initialize UI
    updateStressAssessment();
}

function setupStressEventListeners() {
    // Setup stress sliders
    document.querySelectorAll('.stress-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const value = this.value;
            const valueDisplay = this.parentElement.querySelector('.stress-value');
            valueDisplay.textContent = value;
            updateStressAssessment();
        });
    });
    
    // Setup assessment sliders
    document.querySelectorAll('.assessment-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            updateStressAssessment();
        });
    });
    
    // Setup symptom checkboxes
    document.querySelectorAll('.symptom-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateStressAssessment();
        });
    });
    
    // Setup relaxation plan
    document.getElementById('relaxation-time').addEventListener('change', function() {
        stressData.relaxationPlan.time = this.value;
        saveStressData();
    });
    
    document.getElementById('relaxation-duration').addEventListener('change', function() {
        stressData.relaxationPlan.duration = parseInt(this.value);
        saveStressData();
    });
    
    document.getElementById('preferred-technique').addEventListener('change', function() {
        stressData.relaxationPlan.technique = this.value;
        saveStressData();
    });
    
    // Setup prevention checkboxes
    document.querySelectorAll('.prevention-tips input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveStressData();
        });
    });
}

function addStressSource(category) {
    const categoryElement = document.querySelector(`[onclick="addStressSource('${category}')"]`).closest('.source-category');
    const stressList = categoryElement.querySelector('.stress-list');
    
    const newItem = document.createElement('div');
    newItem.className = 'stress-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Neue Stressquelle hinzufügen...">
        <div class="stress-intensity">
            <label>Intensität:</label>
            <input type="range" min="1" max="10" value="5" class="stress-slider">
            <span class="stress-value">5</span>
        </div>
        <button class="remove-btn" onclick="removeStressSource(this)">&times;</button>
    `;
    
    stressList.appendChild(newItem);
    
    // Setup event listener for new slider
    const newSlider = newItem.querySelector('.stress-slider');
    newSlider.addEventListener('input', function() {
        const value = this.value;
        const valueDisplay = this.parentElement.querySelector('.stress-value');
        valueDisplay.textContent = value;
        updateStressAssessment();
    });
}

function removeStressSource(button) {
    button.closest('.stress-item').remove();
    updateStressAssessment();
}

function updateStressAssessment() {
    // Calculate stress level based on various factors
    let totalStress = 0;
    let factorCount = 0;
    
    // Get stress source intensities
    document.querySelectorAll('.stress-slider').forEach(slider => {
        totalStress += parseInt(slider.value);
        factorCount++;
    });
    
    // Get assessment scores (inverted for sleep and satisfaction)
    const stressFreq = parseInt(document.querySelector('.assessment-slider').value);
    const sleepQuality = 6 - parseInt(document.querySelectorAll('.assessment-slider')[1].value);
    const lifeSatisfaction = 6 - parseInt(document.querySelectorAll('.assessment-slider')[2].value);
    
    totalStress += stressFreq + sleepQuality + lifeSatisfaction;
    factorCount += 3;
    
    // Count symptoms
    const symptomCount = document.querySelectorAll('.symptom-item input[type="checkbox"]:checked').length;
    totalStress += symptomCount * 2;
    factorCount += 1;
    
    const averageStress = totalStress / factorCount;
    const stressLevel = Math.round(averageStress);
    
    // Update display
    const levelFill = document.getElementById('stress-level-fill');
    const levelText = document.getElementById('stress-level-text');
    
    levelFill.style.width = `${(stressLevel / 10) * 100}%`;
    
    if (stressLevel <= 3) {
        levelText.textContent = 'Niedrig';
        levelFill.style.background = '#10b981';
    } else if (stressLevel <= 6) {
        levelText.textContent = 'Mittel';
        levelFill.style.background = '#f59e0b';
    } else {
        levelText.textContent = 'Hoch';
        levelFill.style.background = '#ef4444';
    }
}

function showStrategyGuide(strategy) {
    const guides = {
        'thought-stopping': {
            title: 'Gedankenstopp-Technik',
            content: `
                <h4>Anleitung:</h4>
                <ol>
                    <li>Erkenne negative Gedankenspiralen</li>
                    <li>Sage laut oder innerlich "STOPP!"</li>
                    <li>Atme tief durch</li>
                    <li>Ersetze den negativen Gedanken durch einen positiven</li>
                </ol>
                <h4>Beispiel:</h4>
                <p>Negativ: "Ich schaffe das nie!"<br>
                Positiv: "Ich gebe mein Bestes und lerne dabei."</p>
            `
        },
        'reality-check': {
            title: 'Realitätscheck',
            content: `
                <h4>Fragen zur Realitätsprüfung:</h4>
                <ul>
                    <li>Ist meine Einschätzung realistisch?</li>
                    <li>Was würde ich einem Freund in dieser Situation raten?</li>
                    <li>Welche Beweise habe ich für meine Annahme?</li>
                    <li>Gibt es alternative Erklärungen?</li>
                </ul>
            `
        },
        'reframing': {
            title: 'Positive Umformulierung',
            content: `
                <h4>Technik:</h4>
                <ol>
                    <li>Identifiziere den negativen Aspekt</li>
                    <li>Suche nach positiven oder neutralen Aspekten</li>
                    <li>Formuliere die Situation neu</li>
                    <li>Fokussiere auf das, was du kontrollieren kannst</li>
                </ol>
            `
        },
        'problem-analysis': {
            title: 'Problem-Analyse',
            content: `
                <h4>Schritte:</h4>
                <ol>
                    <li>Definiere das Problem genau</li>
                    <li>Identifiziere die Ursachen</li>
                    <li>Brainstorme Lösungsansätze</li>
                    <li>Bewerte die Optionen</li>
                    <li>Wähle die beste Lösung</li>
                    <li>Setze sie um</li>
                </ol>
            `
        },
        'priorities': {
            title: 'Prioritäten setzen',
            content: `
                <h4>Eisenhower-Matrix:</h4>
                <ul>
                    <li><strong>Wichtig & Dringend:</strong> Sofort erledigen</li>
                    <li><strong>Wichtig & Nicht dringend:</strong> Terminieren</li>
                    <li><strong>Nicht wichtig & Dringend:</strong> Delegieren</li>
                    <li><strong>Nicht wichtig & Nicht dringend:</strong> Eliminieren</li>
                </ul>
            `
        },
        'time-management': {
            title: 'Zeitmanagement',
            content: `
                <h4>Tipps:</h4>
                <ul>
                    <li>Erstelle To-Do-Listen</li>
                    <li>Verwende Zeitblöcke</li>
                    <li>Setze realistische Deadlines</li>
                    <li>Vermeide Multitasking</li>
                    <li>Plane Pufferzeiten ein</li>
                </ul>
            `
        },
        'social-support': {
            title: 'Soziale Unterstützung',
            content: `
                <h4>Unterstützung finden:</h4>
                <ul>
                    <li>Familie und Freunde</li>
                    <li>Kollegen und Vorgesetzte</li>
                    <li>Selbsthilfegruppen</li>
                    <li>Online-Communities</li>
                    <li>Professionelle Beratung</li>
                </ul>
            `
        },
        'communication': {
            title: 'Kommunikation',
            content: `
                <h4>Grenzen kommunizieren:</h4>
                <ul>
                    <li>Sei klar und direkt</li>
                    <li>Verwende "Ich"-Botschaften</li>
                    <li>Erkläre deine Bedürfnisse</li>
                    <li>Biete Alternativen an</li>
                    <li>Bleibe respektvoll</li>
                </ul>
            `
        },
        'professional-help': {
            title: 'Professionelle Hilfe',
            content: `
                <h4>Wann professionelle Hilfe suchen:</h4>
                <ul>
                    <li>Anhaltende Stresssymptome</li>
                    <li>Schlafstörungen</li>
                    <li>Depressive Verstimmungen</li>
                    <li>Angstzustände</li>
                    <li>Probleme im Alltag</li>
                </ul>
                <h4>Anlaufstellen:</h4>
                <ul>
                    <li>Psychologen/Psychotherapeuten</li>
                    <li>Hausarzt</li>
                    <li>Beratungsstellen</li>
                    <li>Online-Therapie</li>
                </ul>
            `
        }
    };
    
    const guide = guides[strategy];
    if (guide) {
        showGuideModal(guide.title, guide.content);
    }
}

function addPersonalStrategy() {
    const input = document.getElementById('strategy-input');
    const strategy = input.value.trim();
    
    if (!strategy) {
        showNotification('Bitte gib eine Strategie ein!', 'warning');
        return;
    }
    
    stressData.strategies.push({
        id: Date.now(),
        text: strategy,
        date: new Date().toISOString()
    });
    
    input.value = '';
    updateStrategiesList();
    saveStressData();
    showNotification('Strategie hinzugefügt!', 'success');
}

function updateStrategiesList() {
    const strategiesList = document.getElementById('personal-strategies-list');
    const strategies = stressData.strategies;
    
    if (strategies.length === 0) {
        strategiesList.innerHTML = '<p>Füge deine eigenen Bewältigungsstrategien hinzu.</p>';
        return;
    }
    
    strategiesList.innerHTML = strategies.map(strategy => `
        <div class="strategy-item">
            <span class="strategy-text">${strategy.text}</span>
            <button class="remove-strategy" onclick="removeStrategy(${strategy.id})">&times;</button>
        </div>
    `).join('');
}

function removeStrategy(strategyId) {
    stressData.strategies = stressData.strategies.filter(s => s.id !== strategyId);
    updateStrategiesList();
    saveStressData();
}

function startBreathingExercise() {
    showBreathingModal('4-7-8 Atmung', {
        inhale: 4,
        hold: 7,
        exhale: 8,
        cycles: 4
    });
}

function startMeditation() {
    showMeditationModal('Achtsamkeitsmeditation', 10);
}

function startMuscleRelaxation() {
    showMuscleRelaxationModal('Progressive Muskelentspannung', 15);
}

function startVisualization() {
    showVisualizationModal('Ruheort visualisieren', 10);
}

function startMusicRelaxation() {
    showMusicModal('Entspannungsmusik', 15);
}

function startMovementRelaxation() {
    showMovementModal('Yoga & Dehnung', 20);
}

function showBreathingModal(title, settings) {
    const modal = document.createElement('div');
    modal.className = 'breathing-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="breathing-circle">
                    <div class="breathing-text" id="breathing-text">Bereit?</div>
                    <div class="breathing-instruction" id="breathing-instruction">Klicke auf Start</div>
                </div>
                <div class="breathing-controls">
                    <button class="btn btn-primary" id="breathing-start" onclick="startBreathing(${settings.inhale}, ${settings.hold}, ${settings.exhale}, ${settings.cycles})">Start</button>
                    <button class="btn btn-outline" id="breathing-pause" onclick="pauseBreathing()" style="display:none">Pause</button>
                    <button class="btn btn-outline" id="breathing-stop" onclick="stopBreathing()" style="display:none">Stop</button>
                </div>
                <div class="breathing-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="breathing-progress"></div>
                    </div>
                    <div class="cycle-counter" id="cycle-counter">Zyklus 0 von ${settings.cycles}</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function startBreathing(inhale, hold, exhale, cycles) {
    let currentCycle = 0;
    let isRunning = true;
    
    const breathingText = document.getElementById('breathing-text');
    const breathingInstruction = document.getElementById('breathing-instruction');
    const progressFill = document.getElementById('breathing-progress');
    const cycleCounter = document.getElementById('cycle-counter');
    const startBtn = document.getElementById('breathing-start');
    const pauseBtn = document.getElementById('breathing-pause');
    const stopBtn = document.getElementById('breathing-stop');
    
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    stopBtn.style.display = 'inline-block';
    
    function breathingCycle() {
        if (!isRunning || currentCycle >= cycles) {
            if (currentCycle >= cycles) {
                breathingText.textContent = 'Fertig!';
                breathingInstruction.textContent = 'Du hast die Übung abgeschlossen.';
                progressFill.style.width = '100%';
            }
            return;
        }
        
        currentCycle++;
        cycleCounter.textContent = `Zyklus ${currentCycle} von ${cycles}`;
        
        // Einatmen
        breathingText.textContent = 'Einatmen';
        breathingInstruction.textContent = `Atme langsam ein (${inhale} Sekunden)`;
        progressFill.style.width = '33%';
        
        setTimeout(() => {
            if (!isRunning) return;
            
            // Anhalten
            breathingText.textContent = 'Anhalten';
            breathingInstruction.textContent = `Halte den Atem an (${hold} Sekunden)`;
            progressFill.style.width = '66%';
            
            setTimeout(() => {
                if (!isRunning) return;
                
                // Ausatmen
                breathingText.textContent = 'Ausatmen';
                breathingInstruction.textContent = `Atme langsam aus (${exhale} Sekunden)`;
                progressFill.style.width = '100%';
                
                setTimeout(() => {
                    if (isRunning) {
                        breathingCycle();
                    }
                }, exhale * 1000);
            }, hold * 1000);
        }, inhale * 1000);
    }
    
    breathingCycle();
    
    // Store references for pause/stop
    window.currentBreathing = {
        isRunning: () => isRunning,
        pause: () => { isRunning = false; },
        stop: () => {
            isRunning = false;
            breathingText.textContent = 'Gestoppt';
            breathingInstruction.textContent = 'Die Übung wurde beendet.';
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
        }
    };
}

function pauseBreathing() {
    if (window.currentBreathing) {
        window.currentBreathing.pause();
        document.getElementById('breathing-text').textContent = 'Pausiert';
        document.getElementById('breathing-instruction').textContent = 'Klicke auf Fortsetzen';
    }
}

function stopBreathing() {
    if (window.currentBreathing) {
        window.currentBreathing.stop();
    }
}

function showMeditationModal(title, duration) {
    const modal = document.createElement('div');
    modal.className = 'meditation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="meditation-content">
                    <div class="meditation-timer" id="meditation-timer">${duration}:00</div>
                    <div class="meditation-instruction" id="meditation-instruction">
                        <p>Setze dich bequem hin und schließe die Augen.</p>
                        <p>Konzentriere dich auf deinen Atem.</p>
                        <p>Lasse Gedanken kommen und gehen, ohne sie zu bewerten.</p>
                    </div>
                </div>
                <div class="meditation-controls">
                    <button class="btn btn-primary" onclick="startMeditationTimer(${duration})">Start</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function startMeditationTimer(duration) {
    let timeLeft = duration * 60; // Convert to seconds
    const timer = document.getElementById('meditation-timer');
    const instruction = document.getElementById('meditation-instruction');
    
    const interval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            timer.textContent = 'Fertig!';
            instruction.innerHTML = '<p>Die Meditation ist beendet. Öffne langsam die Augen.</p>';
        }
        
        timeLeft--;
    }, 1000);
}

function showMuscleRelaxationModal(title, duration) {
    const modal = document.createElement('div');
    modal.className = 'muscle-relaxation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="relaxation-content">
                    <div class="relaxation-step" id="relaxation-step">
                        <h4>Bereit?</h4>
                        <p>Wir werden systematisch alle Muskelgruppen anspannen und entspannen.</p>
                    </div>
                </div>
                <div class="relaxation-controls">
                    <button class="btn btn-primary" onclick="startMuscleRelaxationSequence()">Start</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function startMuscleRelaxationSequence() {
    const muscleGroups = [
        { name: 'Füße', instruction: 'Spanne deine Füße an und halte 5 Sekunden...' },
        { name: 'Waden', instruction: 'Spanne deine Waden an und halte 5 Sekunden...' },
        { name: 'Oberschenkel', instruction: 'Spanne deine Oberschenkel an und halte 5 Sekunden...' },
        { name: 'Bauch', instruction: 'Spanne deine Bauchmuskeln an und halte 5 Sekunden...' },
        { name: 'Arme', instruction: 'Spanne deine Arme an und halte 5 Sekunden...' },
        { name: 'Schultern', instruction: 'Spanne deine Schultern an und halte 5 Sekunden...' },
        { name: 'Gesicht', instruction: 'Spanne dein Gesicht an und halte 5 Sekunden...' }
    ];
    
    let currentGroup = 0;
    const stepElement = document.getElementById('relaxation-step');
    
    function nextStep() {
        if (currentGroup >= muscleGroups.length) {
            stepElement.innerHTML = '<h4>Fertig!</h4><p>Du hast alle Muskelgruppen entspannt. Fühle die Entspannung in deinem ganzen Körper.</p>';
            return;
        }
        
        const group = muscleGroups[currentGroup];
        stepElement.innerHTML = `
            <h4>${group.name}</h4>
            <p>${group.instruction}</p>
            <div class="countdown" id="countdown">5</div>
        `;
        
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                stepElement.innerHTML += '<p>Jetzt entspanne und lasse los...</p>';
                setTimeout(() => {
                    currentGroup++;
                    nextStep();
                }, 3000);
            }
        }, 1000);
    }
    
    nextStep();
}

function showVisualizationModal(title, duration) {
    const modal = document.createElement('div');
    modal.className = 'visualization-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="visualization-content">
                    <div class="visualization-text" id="visualization-text">
                        <h4>Stelle dir einen ruhigen Ort vor...</h4>
                        <p>Schließe die Augen und stelle dir einen Ort vor, an dem du dich vollkommen entspannt und sicher fühlst.</p>
                        <p>Das kann ein Strand, ein Wald, ein Berg oder ein anderer Ort sein, der dir Ruhe gibt.</p>
                    </div>
                </div>
                <div class="visualization-controls">
                    <button class="btn btn-primary" onclick="startVisualization(${duration})">Start</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function startVisualization(duration) {
    const textElement = document.getElementById('visualization-text');
    const steps = [
        'Schließe deine Augen und atme tief ein...',
        'Stelle dir vor, du stehst an einem wunderschönen Strand...',
        'Du hörst das sanfte Rauschen der Wellen...',
        'Die Sonne wärmt deine Haut angenehm...',
        'Du spürst den weichen Sand unter deinen Füßen...',
        'Ein sanfter Wind weht durch deine Haare...',
        'Du fühlst dich vollkommen entspannt und friedlich...',
        'Langsam öffnest du deine Augen und kehrst zurück...'
    ];
    
    let currentStep = 0;
    const stepDuration = (duration * 60 * 1000) / steps.length; // Convert to milliseconds per step
    
    function nextVisualizationStep() {
        if (currentStep >= steps.length) {
            textElement.innerHTML = '<h4>Fertig!</h4><p>Du hast eine wunderschöne Visualisierung erlebt. Fühle die Entspannung in dir.</p>';
            return;
        }
        
        textElement.innerHTML = `<p>${steps[currentStep]}</p>`;
        currentStep++;
        
        setTimeout(nextVisualizationStep, stepDuration);
    }
    
    nextVisualizationStep();
}

function showMusicModal(title, duration) {
    const modal = document.createElement('div');
    modal.className = 'music-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="music-content">
                    <div class="music-options">
                        <h4>Wähle deine Entspannungsmusik:</h4>
                        <div class="music-types">
                            <button class="btn btn-outline" onclick="playRelaxationMusic('nature')">🌿 Naturgeräusche</button>
                            <button class="btn btn-outline" onclick="playRelaxationMusic('classical')">🎼 Klassische Musik</button>
                            <button class="btn btn-outline" onclick="playRelaxationMusic('ambient')">🎵 Ambient</button>
                            <button class="btn btn-outline" onclick="playRelaxationMusic('meditation')">🧘‍♀️ Meditationsmusik</button>
                        </div>
                    </div>
                    <div class="music-player" id="music-player" style="display:none">
                        <div class="music-info">
                            <h5 id="music-title">Musik läuft...</h5>
                            <p id="music-description">Entspanne dich und lass die Musik wirken.</p>
                        </div>
                        <div class="music-timer" id="music-timer">${duration}:00</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function playRelaxationMusic(type) {
    const musicTypes = {
        nature: { title: 'Naturgeräusche', description: 'Regen, Meeresrauschen, Vogelgezwitscher' },
        classical: { title: 'Klassische Musik', description: 'Sanfte Melodien von Mozart, Bach und anderen' },
        ambient: { title: 'Ambient Musik', description: 'Atmosphärische Klänge für tiefe Entspannung' },
        meditation: { title: 'Meditationsmusik', description: 'Speziell für Meditation komponierte Stücke' }
    };
    
    const music = musicTypes[type];
    document.getElementById('music-title').textContent = music.title;
    document.getElementById('music-description').textContent = music.description;
    document.getElementById('music-player').style.display = 'block';
    
    // Start timer
    let timeLeft = 15 * 60; // 15 minutes
    const timer = document.getElementById('music-timer');
    
    const interval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            timer.textContent = 'Fertig!';
        }
        
        timeLeft--;
    }, 1000);
}

function showMovementModal(title, duration) {
    const modal = document.createElement('div');
    modal.className = 'movement-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="movement-content">
                    <div class="movement-exercises">
                        <h4>Entspannungsübungen:</h4>
                        <div class="exercise-list">
                            <div class="exercise-item">
                                <h5>Schulterkreisen</h5>
                                <p>Kreise langsam mit den Schultern</p>
                            </div>
                            <div class="exercise-item">
                                <h5>Nackendehnung</h5>
                                <p>Dehne sanft deinen Nacken</p>
                            </div>
                            <div class="exercise-item">
                                <h5>Rückenstreckung</h5>
                                <p>Strecke deinen Rücken</p>
                            </div>
                            <div class="exercise-item">
                                <h5>Atemübungen</h5>
                                <p>Kombiniere Bewegung mit Atmung</p>
                            </div>
                        </div>
                    </div>
                    <div class="movement-timer" id="movement-timer">${duration}:00</div>
                </div>
                <div class="movement-controls">
                    <button class="btn btn-primary" onclick="startMovementTimer(${duration})">Start</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function startMovementTimer(duration) {
    let timeLeft = duration * 60;
    const timer = document.getElementById('movement-timer');
    
    const interval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            timer.textContent = 'Fertig!';
        }
        
        timeLeft--;
    }, 1000);
}

function createRelaxationPlan() {
    const time = document.getElementById('relaxation-time').value;
    const duration = document.getElementById('relaxation-duration').value;
    const technique = document.getElementById('preferred-technique').value;
    
    stressData.relaxationPlan = { time, duration: parseInt(duration), technique };
    
    showNotification('Entspannungsplan erstellt!', 'success');
    saveStressData();
}

function addPreventionMeasure() {
    const input = document.getElementById('prevention-input');
    const measure = input.value.trim();
    
    if (!measure) {
        showNotification('Bitte gib eine Präventionsmaßnahme ein!', 'warning');
        return;
    }
    
    stressData.preventionMeasures.push({
        id: Date.now(),
        text: measure,
        date: new Date().toISOString()
    });
    
    input.value = '';
    updatePreventionList();
    saveStressData();
    showNotification('Präventionsmaßnahme hinzugefügt!', 'success');
}

function updatePreventionList() {
    const preventionList = document.getElementById('prevention-measures-list');
    const measures = stressData.preventionMeasures;
    
    if (measures.length === 0) {
        preventionList.innerHTML = '<p>Füge deine eigenen Präventionsmaßnahmen hinzu.</p>';
        return;
    }
    
    preventionList.innerHTML = measures.map(measure => `
        <div class="prevention-item">
            <span class="prevention-text">${measure.text}</span>
            <button class="remove-prevention" onclick="removePreventionMeasure(${measure.id})">&times;</button>
        </div>
    `).join('');
}

function removePreventionMeasure(measureId) {
    stressData.preventionMeasures = stressData.preventionMeasures.filter(m => m.id !== measureId);
    updatePreventionList();
    saveStressData();
}

function openStressTracker() {
    showNotification('Stress-Tracker würde hier geöffnet werden', 'info');
}

function openWeeklyReview() {
    showNotification('Wöchentliche Bewertung würde hier geöffnet werden', 'info');
}

function setStressGoals() {
    showNotification('Zielsetzung würde hier geöffnet werden', 'info');
}

function showGuideModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'guide-modal';
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

function closeModal(button) {
    const modal = button.closest('.breathing-modal, .meditation-modal, .muscle-relaxation-modal, .visualization-modal, .music-modal, .movement-modal, .guide-modal');
    modal.remove();
}

// Data persistence functions
function saveStressData() {
    localStorage.setItem('stress-management-data', JSON.stringify(stressData));
}

function loadSavedStressData() {
    const saved = localStorage.getItem('stress-management-data');
    if (saved) {
        stressData = JSON.parse(saved);
        
        // Restore relaxation plan
        if (stressData.relaxationPlan) {
            document.getElementById('relaxation-time').value = stressData.relaxationPlan.time;
            document.getElementById('relaxation-duration').value = stressData.relaxationPlan.duration;
            document.getElementById('preferred-technique').value = stressData.relaxationPlan.technique;
        }
        
        // Restore strategies and prevention measures
        updateStrategiesList();
        updatePreventionList();
    }
}
