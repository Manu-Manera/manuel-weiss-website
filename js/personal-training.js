/**
 * Personal Training Planner - AI-powered workout plan generator
 * Handles the 5-step training plan creation process
 */

class PersonalTrainingPlanner {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.userData = {
            goals: [],
            level: null,
            equipment: null,
            additionalEquipment: [],
            time: null,
            frequency: null,
            trainingStyle: null,
            restrictions: [],
            specialRequests: ''
        };
        this.generatedPlan = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.updateNavigation();
        this.loadSavedData();
    }

    setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const generateBtn = document.getElementById('generate-plan');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousStep());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (generateBtn) generateBtn.addEventListener('click', () => this.generatePlan());

        // Goal cards
        document.querySelectorAll('.goal-card').forEach(card => {
            card.addEventListener('click', () => this.selectGoal(card));
        });

        // Level cards
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', () => this.selectLevel(card));
        });

        // Equipment cards
        document.querySelectorAll('.equipment-card').forEach(card => {
            card.addEventListener('click', () => this.selectEquipment(card));
        });

        // Additional equipment checkboxes
        document.querySelectorAll('.equipment-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateAdditionalEquipment());
        });

        // Time cards
        document.querySelectorAll('.time-card').forEach(card => {
            card.addEventListener('click', () => this.selectTime(card));
        });

        // Frequency cards
        document.querySelectorAll('.frequency-card').forEach(card => {
            card.addEventListener('click', () => this.selectFrequency(card));
        });

        // Training style options
        document.querySelectorAll('input[name="training-style"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateTrainingStyle());
        });

        // Restriction checkboxes
        document.querySelectorAll('.restriction-item input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateRestrictions());
        });

        // Special requests textarea
        const specialRequests = document.getElementById('special-requests');
        if (specialRequests) {
            specialRequests.addEventListener('input', () => this.updateSpecialRequests());
        }

        // Plan actions
        const exportCalendar = document.getElementById('export-calendar');
        const downloadPlan = document.getElementById('download-plan');
        const sharePlan = document.getElementById('share-plan');

        if (exportCalendar) exportCalendar.addEventListener('click', () => this.exportToCalendar());
        if (downloadPlan) downloadPlan.addEventListener('click', () => this.downloadPlan());
        if (sharePlan) sharePlan.addEventListener('click', () => this.sharePlan());

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Week selector
        document.querySelectorAll('.week-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchWeek(e.target.dataset.week));
        });

        // Exercise category filter
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterExercises(e.target.dataset.category));
        });

        // Progress tracking
        const saveProgress = document.getElementById('save-progress');
        if (saveProgress) saveProgress.addEventListener('click', () => this.saveProgress());
    }

    selectGoal(card) {
        const goal = card.dataset.goal;
        
        // Toggle selection
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            this.userData.goals = this.userData.goals.filter(g => g !== goal);
        } else {
            card.classList.add('selected');
            this.userData.goals.push(goal);
        }

        this.updateSummary();
        this.autoSave();
    }

    selectLevel(card) {
        // Remove previous selection
        document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        this.userData.level = card.dataset.level;

        this.updateSummary();
        this.autoSave();
    }

    selectEquipment(card) {
        // Remove previous selection
        document.querySelectorAll('.equipment-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        this.userData.equipment = card.dataset.equipment;

        this.updateSummary();
        this.autoSave();
    }

    updateAdditionalEquipment() {
        const checkboxes = document.querySelectorAll('.equipment-checkbox input:checked');
        this.userData.additionalEquipment = Array.from(checkboxes).map(cb => cb.dataset.equipment);
        
        this.updateSummary();
        this.autoSave();
    }

    selectTime(card) {
        // Remove previous selection
        document.querySelectorAll('.time-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        this.userData.time = card.dataset.time;

        this.updateSummary();
        this.autoSave();
    }

    selectFrequency(card) {
        // Remove previous selection
        document.querySelectorAll('.frequency-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        this.userData.frequency = card.dataset.frequency;

        this.updateSummary();
        this.autoSave();
    }

    updateTrainingStyle() {
        const selected = document.querySelector('input[name="training-style"]:checked');
        this.userData.trainingStyle = selected ? selected.value : null;
        
        this.autoSave();
    }

    updateRestrictions() {
        const checkboxes = document.querySelectorAll('.restriction-item input:checked');
        this.userData.restrictions = Array.from(checkboxes).map(cb => cb.dataset.restriction);
        
        this.autoSave();
    }

    updateSpecialRequests() {
        const textarea = document.getElementById('special-requests');
        this.userData.specialRequests = textarea ? textarea.value : '';
        
        this.autoSave();
    }

    updateSummary() {
        // Update summary display
        const goalElement = document.getElementById('summary-goal');
        const levelElement = document.getElementById('summary-level');
        const equipmentElement = document.getElementById('summary-equipment');
        const timeElement = document.getElementById('summary-time');
        const frequencyElement = document.getElementById('summary-frequency');

        if (goalElement) {
            goalElement.textContent = this.userData.goals.length > 0 
                ? this.userData.goals.join(', ') 
                : '-';
        }

        if (levelElement) {
            const levelNames = {
                'beginner': 'Anfänger',
                'intermediate': 'Fortgeschritten',
                'advanced': 'Experte'
            };
            levelElement.textContent = this.userData.level ? levelNames[this.userData.level] : '-';
        }

        if (equipmentElement) {
            const equipmentNames = {
                'full-gym': 'Vollausgestattetes Gym',
                'basic-gym': 'Basis-Gym',
                'home-gym': 'Home-Gym',
                'minimal': 'Minimal Equipment',
                'bodyweight': 'Nur Körpergewicht'
            };
            equipmentElement.textContent = this.userData.equipment ? equipmentNames[this.userData.equipment] : '-';
        }

        if (timeElement) {
            timeElement.textContent = this.userData.time ? `${this.userData.time} Minuten` : '-';
        }

        if (frequencyElement) {
            frequencyElement.textContent = this.userData.frequency ? `${this.userData.frequency}x pro Woche` : '-';
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.updateProgress();
            this.updateNavigation();
            this.showStep(this.currentStep);
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateProgress();
            this.updateNavigation();
            this.showStep(this.currentStep);
        }
    }

    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
        
        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 < step) {
                indicator.classList.add('completed');
            } else if (index + 1 === step) {
                indicator.classList.add('active');
            }
        });
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const generateBtn = document.getElementById('generate-plan');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn) {
            nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'inline-flex';
        }

        if (generateBtn) {
            generateBtn.style.display = this.currentStep === this.totalSteps ? 'inline-flex' : 'none';
        }
    }

    generatePlan() {
        // Show AI generation section
        this.startAIGeneration();
        
        // Simulate AI generation process
        setTimeout(() => {
            this.generatedPlan = this.createTrainingPlan();
            this.displayGeneratedPlan();
        }, 5000);
    }

    startAIGeneration() {
        const aiSteps = document.querySelectorAll('.ai-step');
        const progressFill = document.getElementById('ai-progress');
        const progressText = document.getElementById('progress-text');

        let currentStep = 0;
        const steps = [
            'Analysiere deine Daten...',
            'Wähle passende Übungen...',
            'Erstelle Zeitplan...',
            'Optimiere Trainingsplan...'
        ];

        const interval = setInterval(() => {
            if (currentStep < aiSteps.length) {
                // Update progress
                const progress = ((currentStep + 1) / aiSteps.length) * 100;
                if (progressFill) progressFill.style.width = `${progress}%`;
                if (progressText) progressText.textContent = steps[currentStep];

                // Update step
                if (currentStep > 0) {
                    aiSteps[currentStep - 1].classList.remove('active');
                    aiSteps[currentStep - 1].classList.add('completed');
                }
                aiSteps[currentStep].classList.add('active');

                currentStep++;
            } else {
                clearInterval(interval);
                // Complete all steps
                aiSteps.forEach(step => {
                    step.classList.remove('active');
                    step.classList.add('completed');
                });
                if (progressFill) progressFill.style.width = '100%';
                if (progressText) progressText.textContent = 'Trainingsplan erstellt!';
            }
        }, 1000);
    }

    createTrainingPlan() {
        // This would normally use AI to generate a personalized plan
        // For now, we'll create a sample plan based on user data
        return {
            duration: '4 Wochen',
            sessions: parseInt(this.userData.frequency) * 4,
            timePerSession: `${this.userData.time} Min`,
            description: `Ein personalisierter Trainingsplan für ${this.userData.goals.join(', ')} auf ${this.userData.level} Level.`,
            features: [
                'Progressive Überladung',
                'Ausgewogene Muskelgruppen',
                'Angepasst an dein Level',
                'Berücksichtigt deine Ausstattung'
            ],
            weeks: this.generateWeeklySchedule(),
            exercises: this.generateExerciseDatabase()
        };
    }

    generateWeeklySchedule() {
        const weeks = [];
        const frequency = parseInt(this.userData.frequency);
        
        for (let week = 1; week <= 4; week++) {
            const weekSchedule = {
                week: week,
                sessions: []
            };

            for (let day = 1; day <= frequency; day++) {
                weekSchedule.sessions.push({
                    day: this.getDayName(day),
                    type: this.getSessionType(day, frequency),
                    exercises: this.getSessionExercises(day, frequency),
                    duration: this.userData.time
                });
            }

            weeks.push(weekSchedule);
        }

        return weeks;
    }

    getDayName(day) {
        const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
        return days[day - 1];
    }

    getSessionType(day, frequency) {
        if (frequency === 2) {
            return day === 1 ? 'Ganzkörper A' : 'Ganzkörper B';
        } else if (frequency === 3) {
            const types = ['Push', 'Pull', 'Legs'];
            return types[(day - 1) % 3];
        } else if (frequency === 4) {
            return day % 2 === 1 ? 'Oberkörper' : 'Unterkörper';
        } else {
            const types = ['Brust & Trizeps', 'Rücken & Bizeps', 'Beine', 'Schultern', 'Arme'];
            return types[(day - 1) % types.length];
        }
    }

    getSessionExercises(day, frequency) {
        // Sample exercises based on session type
        const exerciseDatabase = {
            'Ganzkörper A': [
                { name: 'Kniebeugen', sets: 3, reps: '8-12', category: 'legs' },
                { name: 'Liegestütze', sets: 3, reps: '8-15', category: 'chest' },
                { name: 'Klimmzüge', sets: 3, reps: '5-10', category: 'back' },
                { name: 'Plank', sets: 3, reps: '30-60s', category: 'core' }
            ],
            'Push': [
                { name: 'Bankdrücken', sets: 4, reps: '6-10', category: 'chest' },
                { name: 'Schulterdrücken', sets: 3, reps: '8-12', category: 'shoulders' },
                { name: 'Dips', sets: 3, reps: '8-15', category: 'arms' },
                { name: 'Seitheben', sets: 3, reps: '10-15', category: 'shoulders' }
            ],
            'Pull': [
                { name: 'Klimmzüge', sets: 4, reps: '5-10', category: 'back' },
                { name: 'Rudern', sets: 3, reps: '8-12', category: 'back' },
                { name: 'Bizeps-Curls', sets: 3, reps: '10-15', category: 'arms' },
                { name: 'Face Pulls', sets: 3, reps: '12-20', category: 'back' }
            ],
            'Legs': [
                { name: 'Kniebeugen', sets: 4, reps: '6-10', category: 'legs' },
                { name: 'Ausfallschritte', sets: 3, reps: '10-15', category: 'legs' },
                { name: 'Rumänisches Kreuzheben', sets: 3, reps: '8-12', category: 'legs' },
                { name: 'Wadenheben', sets: 3, reps: '15-20', category: 'legs' }
            ]
        };

        const sessionType = this.getSessionType(day, frequency);
        return exerciseDatabase[sessionType] || exerciseDatabase['Ganzkörper A'];
    }

    generateExerciseDatabase() {
        return {
            'chest': [
                { name: 'Bankdrücken', description: 'Klassische Brustübung mit Langhantel' },
                { name: 'Liegestütze', description: 'Körpergewichtsübung für die Brust' },
                { name: 'Schrägbankdrücken', description: 'Brustübung mit erhöhter Bank' },
                { name: 'Dips', description: 'Brust und Trizeps Übung' }
            ],
            'back': [
                { name: 'Klimmzüge', description: 'Klassische Rückenübung' },
                { name: 'Rudern', description: 'Rückenübung mit Hantel oder Kabel' },
                { name: 'Latziehen', description: 'Rückenübung am Kabelzug' },
                { name: 'Face Pulls', description: 'Schulterblatt-Retraktion' }
            ],
            'legs': [
                { name: 'Kniebeugen', description: 'Königin der Beinübungen' },
                { name: 'Ausfallschritte', description: 'Einbeinige Beinübung' },
                { name: 'Rumänisches Kreuzheben', description: 'Hamstring und Gesäß' },
                { name: 'Wadenheben', description: 'Wadenmuskulatur' }
            ],
            'shoulders': [
                { name: 'Schulterdrücken', description: 'Hauptübung für die Schultern' },
                { name: 'Seitheben', description: 'Seitliche Schultermuskulatur' },
                { name: 'Frontheben', description: 'Vordere Schultermuskulatur' },
                { name: 'Reverse Flys', description: 'Hintere Schultermuskulatur' }
            ],
            'arms': [
                { name: 'Bizeps-Curls', description: 'Klassische Bizepsübung' },
                { name: 'Trizeps-Dips', description: 'Trizeps am Barren' },
                { name: 'Hammer-Curls', description: 'Bizeps mit neutralem Griff' },
                { name: 'Trizeps-Extensions', description: 'Trizeps mit Hantel' }
            ],
            'core': [
                { name: 'Plank', description: 'Statische Core-Übung' },
                { name: 'Crunches', description: 'Klassische Bauchübung' },
                { name: 'Russian Twists', description: 'Rotationsübung für den Core' },
                { name: 'Mountain Climbers', description: 'Dynamische Core-Übung' }
            ]
        };
    }

    displayGeneratedPlan() {
        // Hide wizard and show generated plan
        document.getElementById('training-planner').style.display = 'none';
        document.getElementById('generated-plan').style.display = 'block';

        // Update plan stats
        document.getElementById('plan-duration').textContent = this.generatedPlan.duration;
        document.getElementById('plan-sessions').textContent = `${this.generatedPlan.sessions} Sessions`;
        document.getElementById('plan-time').textContent = this.generatedPlan.timePerSession;

        // Update plan description
        document.getElementById('plan-description-text').textContent = this.generatedPlan.description;

        // Update features list
        const featuresList = document.getElementById('plan-features-list');
        featuresList.innerHTML = this.generatedPlan.features.map(feature => `<li>${feature}</li>`).join('');

        // Generate schedule content
        this.generateScheduleContent();
        
        // Generate exercises content
        this.generateExercisesContent();

        // Save generated plan
        this.saveGeneratedPlan();
    }

    generateScheduleContent() {
        const weekSchedule = document.getElementById('week-schedule');
        if (!weekSchedule) return;

        const currentWeek = this.generatedPlan.weeks[0];
        weekSchedule.innerHTML = currentWeek.sessions.map(session => `
            <div class="session-card">
                <div class="session-header">
                    <h4>${session.day}</h4>
                    <span class="session-type">${session.type}</span>
                </div>
                <div class="session-exercises">
                    ${session.exercises.map(exercise => `
                        <div class="exercise-item">
                            <span class="exercise-name">${exercise.name}</span>
                            <span class="exercise-sets">${exercise.sets} Sätze</span>
                            <span class="exercise-reps">${exercise.reps}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="session-duration">
                    <i class="fas fa-clock"></i>
                    ${session.duration}
                </div>
            </div>
        `).join('');
    }

    generateExercisesContent() {
        const exercisesGrid = document.getElementById('exercises-grid');
        if (!exercisesGrid) return;

        const allExercises = [];
        Object.values(this.generatedPlan.exercises).forEach(category => {
            allExercises.push(...category);
        });

        exercisesGrid.innerHTML = allExercises.map(exercise => `
            <div class="exercise-card" data-category="${exercise.category}">
                <div class="exercise-header">
                    <h4>${exercise.name}</h4>
                    <span class="exercise-category">${exercise.category}</span>
                </div>
                <p class="exercise-description">${exercise.description}</p>
                <div class="exercise-actions">
                    <button class="btn btn-sm btn-primary">Details</button>
                    <button class="btn btn-sm btn-secondary">Video</button>
                </div>
            </div>
        `).join('');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    }

    switchWeek(weekNumber) {
        // Update week buttons
        document.querySelectorAll('.week-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-week="${weekNumber}"]`).classList.add('active');

        // Update schedule content
        const weekSchedule = document.getElementById('week-schedule');
        if (weekSchedule && this.generatedPlan) {
            const week = this.generatedPlan.weeks[parseInt(weekNumber) - 1];
            weekSchedule.innerHTML = week.sessions.map(session => `
                <div class="session-card">
                    <div class="session-header">
                        <h4>${session.day}</h4>
                        <span class="session-type">${session.type}</span>
                    </div>
                    <div class="session-exercises">
                        ${session.exercises.map(exercise => `
                            <div class="exercise-item">
                                <span class="exercise-name">${exercise.name}</span>
                                <span class="exercise-sets">${exercise.sets} Sätze</span>
                                <span class="exercise-reps">${exercise.reps}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="session-duration">
                        <i class="fas fa-clock"></i>
                        ${session.duration}
                    </div>
                </div>
            `).join('');
        }
    }

    filterExercises(category) {
        // Update category buttons
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Filter exercises
        const exerciseCards = document.querySelectorAll('.exercise-card');
        exerciseCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    exportToCalendar() {
        if (!this.generatedPlan) return;

        // Generate iCal content
        let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Personal Training//Training Plan//EN\n';
        
        this.generatedPlan.weeks.forEach(week => {
            week.sessions.forEach((session, index) => {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() + (week.week - 1) * 7 + index);
                startDate.setHours(18, 0, 0, 0); // 6 PM
                
                const endDate = new Date(startDate);
                endDate.setMinutes(endDate.getMinutes() + parseInt(this.userData.time));

                icalContent += `BEGIN:VEVENT\n`;
                icalContent += `DTSTART:${this.formatDateForICS(startDate)}\n`;
                icalContent += `DTEND:${this.formatDateForICS(endDate)}\n`;
                icalContent += `SUMMARY:${session.type} Training\n`;
                icalContent += `DESCRIPTION:${session.exercises.map(ex => `${ex.name}: ${ex.sets} Sätze ${ex.reps}`).join('\\n')}\n`;
                icalContent += `END:VEVENT\n`;
            });
        });

        icalContent += 'END:VCALENDAR';

        // Download file
        const blob = new Blob([icalContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'trainingsplan.ics';
        link.click();
        URL.revokeObjectURL(url);

        this.showNotification('Trainingsplan wurde zu deinem Kalender hinzugefügt!', 'success');
    }

    formatDateForICS(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    downloadPlan() {
        if (!this.generatedPlan) return;

        const planData = {
            userData: this.userData,
            generatedPlan: this.generatedPlan,
            generatedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(planData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `trainingsplan-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showNotification('Trainingsplan wurde heruntergeladen!', 'success');
    }

    sharePlan() {
        if (!this.generatedPlan) return;

        const shareData = {
            title: 'Mein personalisierter Trainingsplan',
            text: `Ich habe einen personalisierten Trainingsplan erstellt: ${this.generatedPlan.description}`,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareData.url);
            this.showNotification('Link wurde in die Zwischenablage kopiert!', 'success');
        }
    }

    saveProgress() {
        const weight = document.getElementById('current-weight').value;
        const bodyFat = document.getElementById('body-fat').value;
        const muscleMass = document.getElementById('muscle-mass').value;

        const progressData = {
            date: new Date().toISOString(),
            weight: weight,
            bodyFat: bodyFat,
            muscleMass: muscleMass
        };

        // Save to localStorage
        const existingProgress = JSON.parse(localStorage.getItem('trainingProgress') || '[]');
        existingProgress.push(progressData);
        localStorage.setItem('trainingProgress', JSON.stringify(existingProgress));

        this.showNotification('Fortschritt wurde gespeichert!', 'success');
    }

    saveCurrentStepData() {
        localStorage.setItem('trainingWizardData', JSON.stringify(this.userData));
    }

    loadSavedData() {
        const savedData = localStorage.getItem('trainingWizardData');
        if (savedData) {
            this.userData = { ...this.userData, ...JSON.parse(savedData) };
            this.restoreSelections();
            this.updateSummary();
        }
    }

    restoreSelections() {
        // Restore goal selections
        this.userData.goals.forEach(goal => {
            const card = document.querySelector(`[data-goal="${goal}"]`);
            if (card) card.classList.add('selected');
        });

        // Restore level selection
        if (this.userData.level) {
            const card = document.querySelector(`[data-level="${this.userData.level}"]`);
            if (card) card.classList.add('selected');
        }

        // Restore equipment selection
        if (this.userData.equipment) {
            const card = document.querySelector(`[data-equipment="${this.userData.equipment}"]`);
            if (card) card.classList.add('selected');
        }

        // Restore additional equipment
        this.userData.additionalEquipment.forEach(equipment => {
            const checkbox = document.querySelector(`[data-equipment="${equipment}"]`);
            if (checkbox) checkbox.checked = true;
        });

        // Restore time selection
        if (this.userData.time) {
            const card = document.querySelector(`[data-time="${this.userData.time}"]`);
            if (card) card.classList.add('selected');
        }

        // Restore frequency selection
        if (this.userData.frequency) {
            const card = document.querySelector(`[data-frequency="${this.userData.frequency}"]`);
            if (card) card.classList.add('selected');
        }

        // Restore training style
        if (this.userData.trainingStyle) {
            const radio = document.querySelector(`input[value="${this.userData.trainingStyle}"]`);
            if (radio) radio.checked = true;
        }

        // Restore restrictions
        this.userData.restrictions.forEach(restriction => {
            const checkbox = document.querySelector(`[data-restriction="${restriction}"]`);
            if (checkbox) checkbox.checked = true;
        });

        // Restore special requests
        const textarea = document.getElementById('special-requests');
        if (textarea) textarea.value = this.userData.specialRequests;
    }

    saveGeneratedPlan() {
        localStorage.setItem('generatedTrainingPlan', JSON.stringify(this.generatedPlan));
    }

    autoSave() {
        this.saveCurrentStepData();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PersonalTrainingPlanner();
});
