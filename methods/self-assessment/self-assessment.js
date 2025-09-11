// Self-Assessment Tool
class SelfAssessment {
    constructor() {
        this.currentStep = 1;
        this.currentArea = 0;
        this.answers = {};
        this.areas = {};
        this.totalSteps = 6;
        this.totalAreas = 8;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAreaDefinitions();
        this.updateProgress();
    }

    setupEventListeners() {
        document.getElementById('next-step').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-step').addEventListener('click', () => this.previousStep());
        document.getElementById('next-area').addEventListener('click', () => this.nextArea());
        document.getElementById('prev-area').addEventListener('click', () => this.previousArea());
        
        // Progress step click handlers
        this.setupProgressStepClicks();
    }

    setupProgressStepClicks() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Progress step clicked:', stepNumber);
                this.goToStep(stepNumber);
            });
        });
    }

    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
            this.currentStep = stepNumber;
            this.updateStep();
            this.updateProgress();
        }
    }

    loadAreaDefinitions() {
        this.areaDefinitions = {
            'cognitive': {
                name: 'Kognitive Fähigkeiten',
                icon: 'fas fa-brain',
                description: 'Deine Denk- und Lernfähigkeiten',
                questions: [
                    'Wie gut kannst du komplexe Probleme analysieren und lösen?',
                    'Wie schnell lernst du neue Konzepte und Fähigkeiten?',
                    'Wie gut kannst du Informationen strukturieren und organisieren?',
                    'Wie gut ist dein logisches Denkvermögen?',
                    'Wie gut kannst du kritisch denken und verschiedene Perspektiven einnehmen?',
                    'Wie gut ist dein Gedächtnis und deine Merkfähigkeit?',
                    'Wie gut kannst du abstrakt denken und Muster erkennen?',
                    'Wie gut bist du im Umgang mit Zahlen und Daten?'
                ]
            },
            'social': {
                name: 'Soziale Kompetenzen',
                icon: 'fas fa-users',
                description: 'Deine Fähigkeiten im Umgang mit anderen Menschen',
                questions: [
                    'Wie gut kannst du mit anderen Menschen kommunizieren?',
                    'Wie gut arbeitest du in Teams zusammen?',
                    'Wie gut kannst du andere führen und motivieren?',
                    'Wie gut kannst du Konflikte lösen?',
                    'Wie gut bist du im Netzwerken und Beziehungen aufbauen?',
                    'Wie gut kannst du anderen zuhören?',
                    'Wie gut kannst du Feedback geben und empfangen?',
                    'Wie gut bist du in der Präsentation vor Gruppen?'
                ]
            },
            'emotional': {
                name: 'Emotionale Intelligenz',
                icon: 'fas fa-heart',
                description: 'Deine Fähigkeit, Emotionen zu verstehen und zu regulieren',
                questions: [
                    'Wie gut kennst du deine eigenen Emotionen?',
                    'Wie gut kannst du deine Emotionen regulieren?',
                    'Wie gut kannst du die Emotionen anderer erkennen?',
                    'Wie gut bist du darin, Empathie zu zeigen?',
                    'Wie gut kannst du mit Stress umgehen?',
                    'Wie gut bist du darin, motiviert zu bleiben?',
                    'Wie gut kannst du mit Rückschlägen umgehen?',
                    'Wie gut bist du darin, positive Beziehungen zu führen?'
                ]
            },
            'practical': {
                name: 'Praktische Fähigkeiten',
                icon: 'fas fa-tools',
                description: 'Deine organisatorischen und technischen Fähigkeiten',
                questions: [
                    'Wie gut bist du in der Organisation und Planung?',
                    'Wie gut ist dein Zeitmanagement?',
                    'Wie gut kannst du mit Technologie umgehen?',
                    'Wie gut bist du darin, Projekte zu verwalten?',
                    'Wie gut kannst du Prioritäten setzen?',
                    'Wie gut bist du darin, effizient zu arbeiten?',
                    'Wie gut kannst du mit Ressourcen umgehen?',
                    'Wie gut bist du darin, Qualität zu kontrollieren?'
                ]
            },
            'creativity': {
                name: 'Kreativität',
                icon: 'fas fa-lightbulb',
                description: 'Deine Fähigkeit, kreativ und innovativ zu denken',
                questions: [
                    'Wie gut kannst du neue und originelle Ideen entwickeln?',
                    'Wie gut bist du darin, kreative Lösungen zu finden?',
                    'Wie gut kannst du verschiedene Perspektiven einnehmen?',
                    'Wie gut bist du darin, künstlerisch oder gestalterisch tätig zu sein?',
                    'Wie gut kannst du improvisieren?',
                    'Wie gut bist du darin, Inspiration zu finden?',
                    'Wie gut kannst du Ideen umsetzen?',
                    'Wie gut bist du darin, kreative Prozesse zu leiten?'
                ]
            },
            'physical': {
                name: 'Körperliche Fähigkeiten',
                icon: 'fas fa-dumbbell',
                description: 'Deine körperliche Gesundheit und Fitness',
                questions: [
                    'Wie gut ist deine allgemeine körperliche Fitness?',
                    'Wie gut ist deine Ausdauer?',
                    'Wie gut ist deine Kraft?',
                    'Wie gut ist deine Koordination und Balance?',
                    'Wie gut ist deine Flexibilität?',
                    'Wie gut achtest du auf deine Gesundheit?',
                    'Wie gut ist deine Stressresistenz?',
                    'Wie gut ist deine Energie und Vitalität?'
                ]
            },
            'ethical': {
                name: 'Ethische Werte',
                icon: 'fas fa-balance-scale',
                description: 'Deine Werte und ethische Grundsätze',
                questions: [
                    'Wie wichtig ist dir Integrität und Ehrlichkeit?',
                    'Wie gut behandelst du andere fair und gerecht?',
                    'Wie gut übernimmst du Verantwortung für deine Handlungen?',
                    'Wie wichtig ist dir Respekt vor anderen?',
                    'Wie gut achtest du auf Nachhaltigkeit und Umweltschutz?',
                    'Wie wichtig ist dir soziale Gerechtigkeit?',
                    'Wie gut hältst du dich an deine Werte?',
                    'Wie gut bist du darin, ethische Dilemmata zu lösen?'
                ]
            },
            'motivation': {
                name: 'Motivation & Antrieb',
                icon: 'fas fa-rocket',
                description: 'Deine Motivation und Zielstrebigkeit',
                questions: [
                    'Wie gut kannst du dich selbst motivieren?',
                    'Wie gut bist du darin, Ziele zu setzen und zu verfolgen?',
                    'Wie gut ist dein Durchhaltevermögen?',
                    'Wie gut kannst du mit Rückschlägen umgehen?',
                    'Wie gut bist du darin, Initiative zu ergreifen?',
                    'Wie gut ist deine Energie und Begeisterung?',
                    'Wie gut kannst du dich auf wichtige Aufgaben konzentrieren?',
                    'Wie gut bist du darin, langfristig motiviert zu bleiben?'
                ]
            }
        };
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStep();
            this.updateProgress();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStep();
            this.updateProgress();
        }
    }

    updateStep() {
        // Hide all steps
        document.querySelectorAll('.workflow-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update navigation buttons
        const prevButton = document.getElementById('prev-step');
        const nextButton = document.getElementById('next-step');

        prevButton.style.display = this.currentStep > 1 ? 'block' : 'none';
        nextButton.style.display = this.currentStep < this.totalSteps ? 'block' : 'none';

        // Update step info
        document.getElementById('step-info').textContent = `Schritt ${this.currentStep} von ${this.totalSteps}`;

        // Load step-specific content
        this.loadStepContent();
    }

    loadStepContent() {
        switch (this.currentStep) {
            case 2:
                this.loadAssessmentQuestions();
                break;
            case 3:
                this.calculateResults();
                this.displayResults();
                break;
            case 4:
                this.displayPersonalProfile();
                break;
            case 5:
                this.displayDevelopmentPlan();
                break;
            case 6:
                this.displayFinalResults();
                break;
        }
    }

    loadAssessmentQuestions() {
        const areaKeys = Object.keys(this.areaDefinitions);
        const currentAreaKey = areaKeys[this.currentArea];
        const currentArea = this.areaDefinitions[currentAreaKey];
        
        const container = document.getElementById('assessment-container');
        container.innerHTML = `
            <div class="area-assessment">
                <div class="area-header">
                    <div class="area-icon">
                        <i class="${currentArea.icon}"></i>
                    </div>
                    <div class="area-info">
                        <h4>${currentArea.name}</h4>
                        <p>${currentArea.description}</p>
                    </div>
                </div>
                
                <div class="questions-container">
                    ${currentArea.questions.map((question, index) => `
                        <div class="question-item">
                            <label>${question}</label>
                            <div class="rating-scale">
                                <span>1</span>
                                <input type="range" class="assessment-slider" min="1" max="10" value="5" 
                                       data-area="${currentAreaKey}" data-question="${index}">
                                <span>10</span>
                                <span class="rating-value">5</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners to sliders
        document.querySelectorAll('.assessment-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.nextElementSibling.textContent = value;
            });
        });

        // Update progress
        document.getElementById('current-area').textContent = this.currentArea + 1;
        document.getElementById('total-areas').textContent = this.totalAreas;
        
        const progressPercent = ((this.currentArea + 1) / this.totalAreas) * 100;
        document.getElementById('question-progress').style.width = `${progressPercent}%`;

        // Update navigation
        document.getElementById('prev-area').style.display = this.currentArea > 0 ? 'block' : 'none';
        document.getElementById('next-area').style.display = this.currentArea < this.totalAreas - 1 ? 'block' : 'none';
    }

    nextArea() {
        // Save current area answers
        this.saveCurrentAreaAnswers();

        if (this.currentArea < this.totalAreas - 1) {
            this.currentArea++;
            this.loadAssessmentQuestions();
        } else {
            // Assessment completed, move to results
            this.nextStep();
        }
    }

    previousArea() {
        if (this.currentArea > 0) {
            this.currentArea--;
            this.loadAssessmentQuestions();
        }
    }

    saveCurrentAreaAnswers() {
        const areaKeys = Object.keys(this.areaDefinitions);
        const currentAreaKey = areaKeys[this.currentArea];
        
        this.answers[currentAreaKey] = {};
        document.querySelectorAll(`[data-area="${currentAreaKey}"]`).forEach(slider => {
            const questionIndex = slider.dataset.question;
            this.answers[currentAreaKey][questionIndex] = parseInt(slider.value);
        });
    }

    calculateResults() {
        // Calculate area scores
        this.areas = {};
        Object.keys(this.answers).forEach(areaKey => {
            const answers = this.answers[areaKey];
            const scores = Object.values(answers);
            const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            this.areas[areaKey] = {
                score: Math.round(averageScore * 10) / 10,
                definition: this.areaDefinitions[areaKey]
            };
        });

        // Calculate overall score
        const allScores = Object.values(this.areas).map(area => area.score);
        this.overallScore = Math.round((allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 10) / 10;

        // Identify strengths and weaknesses
        this.strengths = Object.entries(this.areas)
            .filter(([key, area]) => area.score >= 7)
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, 3);

        this.weaknesses = Object.entries(this.areas)
            .filter(([key, area]) => area.score <= 6)
            .sort(([,a], [,b]) => a.score - b.score)
            .slice(0, 3);
    }

    displayResults() {
        // Overall score
        document.getElementById('overall-score').textContent = this.overallScore;

        // Areas overview
        const areasContainer = document.getElementById('areas-grid-results');
        areasContainer.innerHTML = Object.entries(this.areas).map(([key, area]) => `
            <div class="area-result">
                <div class="area-header">
                    <i class="${area.definition.icon}"></i>
                    <h5>${area.definition.name}</h5>
                </div>
                <div class="area-score">
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${(area.score / 10) * 100}%"></div>
                    </div>
                    <span class="score-number">${area.score}/10</span>
                </div>
            </div>
        `).join('');

        // Strengths
        const strengthsContainer = document.getElementById('strengths-list');
        strengthsContainer.innerHTML = this.strengths.map(([key, area]) => `
            <div class="strength-item">
                <div class="strength-icon">
                    <i class="${area.definition.icon}"></i>
                </div>
                <div class="strength-info">
                    <h6>${area.definition.name}</h6>
                    <p>Score: ${area.score}/10</p>
                </div>
            </div>
        `).join('');

        // Weaknesses
        const weaknessesContainer = document.getElementById('weaknesses-list');
        weaknessesContainer.innerHTML = this.weaknesses.map(([key, area]) => `
            <div class="weakness-item">
                <div class="weakness-icon">
                    <i class="${area.definition.icon}"></i>
                </div>
                <div class="weakness-info">
                    <h6>${area.definition.name}</h6>
                    <p>Score: ${area.score}/10</p>
                </div>
            </div>
        `).join('');
    }

    displayPersonalProfile() {
        // Skills profile
        const skillsContainer = document.getElementById('skills-profile');
        skillsContainer.innerHTML = Object.entries(this.areas).map(([key, area]) => `
            <div class="skill-item">
                <div class="skill-header">
                    <i class="${area.definition.icon}"></i>
                    <h6>${area.definition.name}</h6>
                    <span class="skill-score">${area.score}/10</span>
                </div>
                <div class="skill-description">
                    <p>${area.definition.description}</p>
                </div>
            </div>
        `).join('');

        // Personality traits
        this.displayPersonalityTraits();

        // Development recommendations
        this.displayDevelopmentRecommendations();
    }

    displayPersonalityTraits() {
        const traitsContainer = document.getElementById('personality-traits');
        const traits = this.analyzePersonalityTraits();
        traitsContainer.innerHTML = traits.map(trait => `
            <div class="trait-item">
                <h6>${trait.name}</h6>
                <p>${trait.description}</p>
                <div class="trait-level">
                    <span class="level-label">Level:</span>
                    <span class="level-value">${trait.level}</span>
                </div>
            </div>
        `).join('');
    }

    analyzePersonalityTraits() {
        const traits = [];
        
        // Analyze based on scores
        if (this.areas.social?.score >= 7 && this.areas.emotional?.score >= 7) {
            traits.push({
                name: 'Soziale Kompetenz',
                description: 'Du bist sehr gut darin, mit anderen Menschen umzugehen und Beziehungen aufzubauen.',
                level: 'Hoch'
            });
        }
        
        if (this.areas.cognitive?.score >= 7 && this.areas.creativity?.score >= 7) {
            traits.push({
                name: 'Analytisches Denken',
                description: 'Du denkst strukturiert und kreativ und kannst komplexe Probleme lösen.',
                level: 'Hoch'
            });
        }
        
        if (this.areas.motivation?.score >= 7 && this.areas.practical?.score >= 7) {
            traits.push({
                name: 'Zielstrebigkeit',
                description: 'Du bist sehr motiviert und organisierst dich gut, um deine Ziele zu erreichen.',
                level: 'Hoch'
            });
        }
        
        return traits;
    }

    displayDevelopmentRecommendations() {
        const recommendationsContainer = document.getElementById('development-recommendations');
        const recommendations = this.generateRecommendations();
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <h6>${rec.area}</h6>
                <p>${rec.recommendation}</p>
                <div class="recommendation-priority">
                    <span class="priority-label">Priorität:</span>
                    <span class="priority-value ${rec.priority.toLowerCase()}">${rec.priority}</span>
                </div>
            </div>
        `).join('');
    }

    generateRecommendations() {
        const recommendations = [];
        
        Object.entries(this.areas).forEach(([key, area]) => {
            if (area.score <= 6) {
                recommendations.push({
                    area: area.definition.name,
                    recommendation: this.getAreaRecommendation(key),
                    priority: area.score <= 4 ? 'Hoch' : 'Mittel'
                });
            }
        });
        
        return recommendations;
    }

    getAreaRecommendation(areaKey) {
        const recommendations = {
            'cognitive': 'Übe regelmäßig Denksportaufgaben und lerne neue Fähigkeiten.',
            'social': 'Nimm an Gruppenaktivitäten teil und übe aktives Zuhören.',
            'emotional': 'Führe ein Emotionstagebuch und übe Achtsamkeit.',
            'practical': 'Nutze Tools zur Organisation und plane deine Zeit besser.',
            'creativity': 'Probiere neue Hobbys aus und denke außerhalb der Box.',
            'physical': 'Integriere regelmäßige Bewegung in deinen Alltag.',
            'ethical': 'Reflektiere über deine Werte und lebe sie bewusst.',
            'motivation': 'Setze dir klare Ziele und feiere kleine Erfolge.'
        };
        return recommendations[areaKey] || 'Arbeite gezielt an diesem Bereich.';
    }

    displayDevelopmentPlan() {
        // Strengthen areas
        const strengthenContainer = document.getElementById('strengthen-areas');
        strengthenContainer.innerHTML = this.strengths.map(([key, area]) => `
            <div class="strengthen-item">
                <h5>${area.definition.name} weiter ausbauen</h5>
                <p>Nutze deine Stärke in ${area.definition.name} (${area.score}/10) für neue Herausforderungen.</p>
                <ul>
                    <li>Suche nach Möglichkeiten, diese Stärke einzusetzen</li>
                    <li>Teile dein Wissen mit anderen</li>
                    <li>Übernimm Verantwortung in diesem Bereich</li>
                </ul>
            </div>
        `).join('');

        // Improve areas
        const improveContainer = document.getElementById('improve-areas');
        improveContainer.innerHTML = this.weaknesses.map(([key, area]) => `
            <div class="improve-item">
                <h5>${area.definition.name} verbessern</h5>
                <p>Entwickle deine Fähigkeiten in ${area.definition.name} (${area.score}/10).</p>
                <ul>
                    <li>Setze dir konkrete Lernziele</li>
                    <li>Suche nach Mentoring oder Training</li>
                    <li>Übe regelmäßig in diesem Bereich</li>
                </ul>
            </div>
        `).join('');

        // Learning goals
        this.displayLearningGoals();

        // Timeline
        this.displayTimeline();
    }

    displayLearningGoals() {
        const goalsContainer = document.getElementById('learning-goals');
        const goals = this.generateLearningGoals();
        goalsContainer.innerHTML = goals.map(goal => `
            <div class="goal-item">
                <h5>${goal.title}</h5>
                <p>${goal.description}</p>
                <div class="goal-timeline">
                    <span class="timeline-label">Zeitrahmen:</span>
                    <span class="timeline-value">${goal.timeline}</span>
                </div>
            </div>
        `).join('');
    }

    generateLearningGoals() {
        const goals = [];
        
        this.weaknesses.forEach(([key, area]) => {
            goals.push({
                title: `${area.definition.name} verbessern`,
                description: `Erhöhe deinen Score in ${area.definition.name} von ${area.score} auf mindestens 7.`,
                timeline: '3-6 Monate'
            });
        });
        
        return goals;
    }

    displayTimeline() {
        const timelineContainer = document.getElementById('timeline');
        timelineContainer.innerHTML = `
            <div class="timeline-item">
                <h5>Erste 30 Tage</h5>
                <p>Fokussiere dich auf deine stärksten Bereiche und setze erste Verbesserungsziele.</p>
            </div>
            <div class="timeline-item">
                <h5>3 Monate</h5>
                <p>Arbeite gezielt an deinen Entwicklungsbereichen und messe deinen Fortschritt.</p>
            </div>
            <div class="timeline-item">
                <h5>6 Monate</h5>
                <p>Wiederhole die Selbsteinschätzung und vergleiche deine Ergebnisse.</p>
            </div>
        `;
    }

    displayFinalResults() {
        // Top strengths summary
        const topStrengthsContainer = document.getElementById('top-strengths-summary');
        topStrengthsContainer.innerHTML = this.strengths.map(([key, area]) => `
            <div class="top-strength-item">
                <span class="strength-name">${area.definition.name}</span>
                <span class="strength-score">${area.score}/10</span>
            </div>
        `).join('');

        // Top weaknesses summary
        const topWeaknessesContainer = document.getElementById('top-weaknesses-summary');
        topWeaknessesContainer.innerHTML = this.weaknesses.map(([key, area]) => `
            <div class="top-weakness-item">
                <span class="weakness-name">${area.definition.name}</span>
                <span class="weakness-score">${area.score}/10</span>
            </div>
        `).join('');

        // Action plan
        const actionContainer = document.getElementById('action-plan');
        actionContainer.innerHTML = `
            <div class="action-item">
                <h6>Nächste 30 Tage</h6>
                <ul>
                    <li>Fokussiere dich auf deine stärksten Bereiche</li>
                    <li>Setze konkrete Ziele für deine Entwicklungsbereiche</li>
                    <li>Beginne mit kleinen, täglichen Übungen</li>
                </ul>
            </div>
            <div class="action-item">
                <h6>Nächste 90 Tage</h6>
                <ul>
                    <li>Arbeite systematisch an deinen Schwächen</li>
                    <li>Suche nach Lernmöglichkeiten und Mentoring</li>
                    <li>Messe regelmäßig deinen Fortschritt</li>
                </ul>
            </div>
        `;
    }

    updateProgress() {
        // Update progress bar
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    exportResults(format) {
        const data = {
            overallScore: this.overallScore,
            areas: this.areas,
            strengths: this.strengths,
            weaknesses: this.weaknesses,
            timestamp: new Date().toISOString()
        };

        let content, filename, mimeType;

        switch (format) {
            case 'pdf':
                content = this.generatePDFContent();
                this.downloadHTML(content, 'self-assessment-results.html');
                break;
            case 'csv':
                content = this.generateCSVContent();
                filename = 'self-assessment-results.csv';
                mimeType = 'text/csv';
                this.downloadFile(content, filename, mimeType);
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename = 'self-assessment-results.json';
                mimeType = 'application/json';
                this.downloadFile(content, filename, mimeType);
                break;
        }
    }

    generatePDFContent() {
        return `
            <html>
            <head>
                <title>Selbsteinschätzung Ergebnisse</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .area-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                    .score { font-weight: bold; color: #6366f1; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Selbsteinschätzung Ergebnisse</h1>
                    <p>Generiert am: ${new Date().toLocaleDateString('de-DE')}</p>
                    <p>Gesamtpunktzahl: ${this.overallScore}/10</p>
                </div>
                
                <h2>Bewertung nach Bereichen</h2>
                ${Object.entries(this.areas).map(([key, area]) => `
                    <div class="area-item">
                        <h3>${area.definition.name}</h3>
                        <p><strong>Score:</strong> <span class="score">${area.score}/10</span></p>
                        <p><strong>Beschreibung:</strong> ${area.definition.description}</p>
                    </div>
                `).join('')}
                
                <h2>Deine Stärken</h2>
                ${this.strengths.map(([key, area]) => `
                    <div class="area-item">
                        <h3>${area.definition.name}</h3>
                        <p><strong>Score:</strong> <span class="score">${area.score}/10</span></p>
                    </div>
                `).join('')}
                
                <h2>Entwicklungsbereiche</h2>
                ${this.weaknesses.map(([key, area]) => `
                    <div class="area-item">
                        <h3>${area.definition.name}</h3>
                        <p><strong>Score:</strong> <span class="score">${area.score}/10</span></p>
                    </div>
                `).join('')}
            </body>
            </html>
        `;
    }

    generateCSVContent() {
        let csv = 'Bereich,Score,Beschreibung\n';
        Object.entries(this.areas).forEach(([key, area]) => {
            csv += `"${area.definition.name}",${area.score},"${area.definition.description}"\n`;
        });
        return csv;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    downloadHTML(content, filename) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize assessment when page loads
document.addEventListener('DOMContentLoaded', function() {
    new SelfAssessment();
});
