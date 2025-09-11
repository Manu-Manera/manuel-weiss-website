// VIA Character Strengths Assessment
class VIAStrengthsAssessment {
    constructor() {
        this.currentStep = 1;
        this.currentQuestion = 0;
        this.answers = {};
        this.strengths = {};
        this.top5Strengths = [];
        this.totalSteps = 7;
        this.totalQuestions = 120;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStrengthDefinitions();
        this.generateQuestions();
        this.updateProgress();
    }

    setupEventListeners() {
        const nextStepBtn = document.getElementById('next-step');
        const prevStepBtn = document.getElementById('prev-step');
        const nextQuestionBtn = document.getElementById('next-question');
        const prevQuestionBtn = document.getElementById('prev-question');
        
        if (nextStepBtn) nextStepBtn.addEventListener('click', () => this.nextStep());
        if (prevStepBtn) prevStepBtn.addEventListener('click', () => this.previousStep());
        if (nextQuestionBtn) nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
        if (prevQuestionBtn) prevQuestionBtn.addEventListener('click', () => this.previousQuestion());
        
        // Add global navigation functions
        window.nextStep = () => this.nextStep();
        window.previousStep = () => this.previousStep();
        window.nextQuestion = () => this.nextQuestion();
        window.previousQuestion = () => this.previousQuestion();
    }

    loadStrengthDefinitions() {
        this.strengthDefinitions = {
            // Wisdom & Knowledge
            'Creativity': {
                name: 'Creativity',
                category: 'Wisdom & Knowledge',
                description: 'Du denkst über neue und produktive Wege nach, Dinge zu tun.',
                strengths: ['Innovation', 'Originalität', 'Kreative Problemlösung'],
                applications: {
                    career: ['Design', 'Marketing', 'Forschung', 'Kunst'],
                    relationships: ['Kreative Geschenke', 'Originelle Aktivitäten'],
                    personal: ['Hobbys', 'Problemlösung', 'Selbstausdruck']
                }
            },
            'Curiosity': {
                name: 'Curiosity',
                category: 'Wisdom & Knowledge',
                description: 'Du interessierst dich für viele verschiedene Dinge.',
                strengths: ['Lernbereitschaft', 'Offenheit', 'Entdeckungsfreude'],
                applications: {
                    career: ['Journalismus', 'Forschung', 'Beratung'],
                    relationships: ['Interesse an anderen', 'Neue Erfahrungen'],
                    personal: ['Lebenslanges Lernen', 'Reisen', 'Hobbys']
                }
            },
            'Judgment': {
                name: 'Judgment',
                category: 'Wisdom & Knowledge',
                description: 'Du denkst über Dinge nach und betrachtest sie von allen Seiten.',
                strengths: ['Kritisches Denken', 'Objektivität', 'Weisheit'],
                applications: {
                    career: ['Recht', 'Beratung', 'Management'],
                    relationships: ['Konfliktlösung', 'Entscheidungsfindung'],
                    personal: ['Lebensentscheidungen', 'Problemlösung']
                }
            },
            'Love of Learning': {
                name: 'Love of Learning',
                category: 'Wisdom & Knowledge',
                description: 'Du liebst es, neue Dinge zu lernen.',
                strengths: ['Wissbegierde', 'Bildung', 'Persönliches Wachstum'],
                applications: {
                    career: ['Bildung', 'Training', 'Entwicklung'],
                    relationships: ['Gemeinsames Lernen', 'Wissensaustausch'],
                    personal: ['Kurse', 'Bücher', 'Neue Fähigkeiten']
                }
            },
            'Perspective': {
                name: 'Perspective',
                category: 'Wisdom & Knowledge',
                description: 'Du kannst anderen Menschen gute Ratschläge geben.',
                strengths: ['Weisheit', 'Beratung', 'Überblick'],
                applications: {
                    career: ['Mentoring', 'Beratung', 'Führung'],
                    relationships: ['Freundschaft', 'Familie', 'Gemeinschaft'],
                    personal: ['Lebensphilosophie', 'Spiritualität']
                }
            },
            // Courage
            'Bravery': {
                name: 'Bravery',
                category: 'Courage',
                description: 'Du bist nicht davor zurückzuschrecken, deine Meinung zu sagen.',
                strengths: ['Mut', 'Standhaftigkeit', 'Prinzipientreue'],
                applications: {
                    career: ['Führung', 'Vertrieb', 'Recht'],
                    relationships: ['Ehrlichkeit', 'Konflikte angehen'],
                    personal: ['Herausforderungen', 'Werte vertreten']
                }
            },
            'Perseverance': {
                name: 'Perseverance',
                category: 'Courage',
                description: 'Du arbeitest hart, um das zu beenden, was du begonnen hast.',
                strengths: ['Durchhaltevermögen', 'Zielstrebigkeit', 'Ausdauer'],
                applications: {
                    career: ['Projektmanagement', 'Sport', 'Forschung'],
                    relationships: ['Langfristige Beziehungen', 'Familie'],
                    personal: ['Ziele erreichen', 'Gewohnheiten', 'Hobbys']
                }
            },
            'Honesty': {
                name: 'Honesty',
                category: 'Courage',
                description: 'Du sagst die Wahrheit und präsentierst dich authentisch.',
                strengths: ['Ehrlichkeit', 'Authentizität', 'Integrität'],
                applications: {
                    career: ['Vertrauen aufbauen', 'Führung', 'Beratung'],
                    relationships: ['Vertrauen', 'Ehrliche Kommunikation'],
                    personal: ['Selbstakzeptanz', 'Werte leben']
                }
            },
            'Zest': {
                name: 'Zest',
                category: 'Courage',
                description: 'Du näherst dich dem Leben mit Begeisterung und Energie.',
                strengths: ['Enthusiasmus', 'Lebensfreude', 'Motivation'],
                applications: {
                    career: ['Motivation', 'Teamgeist', 'Kreativität'],
                    relationships: ['Positive Energie', 'Aktivitäten'],
                    personal: ['Lebensqualität', 'Gesundheit', 'Hobbys']
                }
            },
            // Humanity
            'Love': {
                name: 'Love',
                category: 'Humanity',
                description: 'Du schätzt enge Beziehungen zu anderen Menschen.',
                strengths: ['Bindungsfähigkeit', 'Intimität', 'Liebe'],
                applications: {
                    career: ['Beziehungsarbeit', 'Beratung', 'Pflege'],
                    relationships: ['Partnerschaft', 'Familie', 'Freundschaft'],
                    personal: ['Selbstliebe', 'Spiritualität']
                }
            },
            'Kindness': {
                name: 'Kindness',
                category: 'Humanity',
                description: 'Du tust gerne Gefälligkeiten und hilfst anderen.',
                strengths: ['Hilfsbereitschaft', 'Mitgefühl', 'Großzügigkeit'],
                applications: {
                    career: ['Soziale Arbeit', 'Pflege', 'Bildung'],
                    relationships: ['Unterstützung', 'Fürsorge'],
                    personal: ['Freiwilligenarbeit', 'Gemeinschaft']
                }
            },
            'Social Intelligence': {
                name: 'Social Intelligence',
                category: 'Humanity',
                description: 'Du bist dir der Motive und Gefühle anderer bewusst.',
                strengths: ['Empathie', 'Soziale Kompetenz', 'Emotionale Intelligenz'],
                applications: {
                    career: ['Führung', 'Beratung', 'Verkauf'],
                    relationships: ['Konfliktlösung', 'Verständnis'],
                    personal: ['Selbstreflexion', 'Kommunikation']
                }
            },
            // Justice
            'Teamwork': {
                name: 'Teamwork',
                category: 'Justice',
                description: 'Du arbeitest gut als Mitglied einer Gruppe.',
                strengths: ['Kooperation', 'Teamgeist', 'Loyalität'],
                applications: {
                    career: ['Projektarbeit', 'Führung', 'Sport'],
                    relationships: ['Familie', 'Freundeskreis'],
                    personal: ['Gemeinschaft', 'Vereine']
                }
            },
            'Fairness': {
                name: 'Fairness',
                category: 'Justice',
                description: 'Du behandelst alle Menschen gleich.',
                strengths: ['Gerechtigkeit', 'Objektivität', 'Ethik'],
                applications: {
                    career: ['Recht', 'HR', 'Management'],
                    relationships: ['Konfliktlösung', 'Familie'],
                    personal: ['Werte', 'Gemeinschaft']
                }
            },
            'Leadership': {
                name: 'Leadership',
                category: 'Justice',
                description: 'Du kannst eine Gruppe dazu bringen, Dinge zu tun.',
                strengths: ['Führung', 'Motivation', 'Vision'],
                applications: {
                    career: ['Management', 'Politik', 'Sport'],
                    relationships: ['Familie', 'Gemeinschaft'],
                    personal: ['Projekte', 'Initiativen']
                }
            },
            // Temperance
            'Forgiveness': {
                name: 'Forgiveness',
                category: 'Temperance',
                description: 'Du vergibst denen, die dir Unrecht getan haben.',
                strengths: ['Vergebung', 'Großzügigkeit', 'Frieden'],
                applications: {
                    career: ['Konfliktlösung', 'Mediation'],
                    relationships: ['Beziehungen retten', 'Familie'],
                    personal: ['Seelenfrieden', 'Spiritualität']
                }
            },
            'Humility': {
                name: 'Humility',
                category: 'Temperance',
                description: 'Du lässt andere das Rampenlicht haben.',
                strengths: ['Bescheidenheit', 'Demut', 'Selbstlosigkeit'],
                applications: {
                    career: ['Teamarbeit', 'Dienstleistung'],
                    relationships: ['Bescheidenheit', 'Höflichkeit'],
                    personal: ['Spiritualität', 'Selbstreflexion']
                }
            },
            'Prudence': {
                name: 'Prudence',
                category: 'Temperance',
                description: 'Du bist vorsichtig in deinen Entscheidungen.',
                strengths: ['Vorsicht', 'Weisheit', 'Besonnenheit'],
                applications: {
                    career: ['Risikomanagement', 'Planung'],
                    relationships: ['Durchdachte Entscheidungen'],
                    personal: ['Lebensplanung', 'Finanzen']
                }
            },
            'Self-Regulation': {
                name: 'Self-Regulation',
                category: 'Temperance',
                description: 'Du regulierst deine Gefühle und Handlungen.',
                strengths: ['Selbstkontrolle', 'Disziplin', 'Ausgeglichenheit'],
                applications: {
                    career: ['Stressmanagement', 'Führung'],
                    relationships: ['Emotionale Stabilität'],
                    personal: ['Gesundheit', 'Gewohnheiten']
                }
            },
            // Transcendence
            'Appreciation of Beauty': {
                name: 'Appreciation of Beauty',
                category: 'Transcendence',
                description: 'Du bemerkst und schätzt Schönheit in vielen Bereichen.',
                strengths: ['Ästhetik', 'Kunstverständnis', 'Inspiration'],
                applications: {
                    career: ['Kunst', 'Design', 'Architektur'],
                    relationships: ['Gemeinsame Erlebnisse'],
                    personal: ['Kunst', 'Natur', 'Kultur']
                }
            },
            'Hope': {
                name: 'Hope',
                category: 'Transcendence',
                description: 'Du erwartest das Beste in der Zukunft.',
                strengths: ['Optimismus', 'Zuversicht', 'Motivation'],
                applications: {
                    career: ['Motivation', 'Vision', 'Führung'],
                    relationships: ['Unterstützung', 'Ermutigung'],
                    personal: ['Ziele', 'Träume', 'Resilienz']
                }
            },
            'Humor': {
                name: 'Humor',
                category: 'Transcendence',
                description: 'Du magst es, Menschen zum Lachen zu bringen.',
                strengths: ['Humor', 'Freude', 'Leichtigkeit'],
                applications: {
                    career: ['Teamgeist', 'Präsentationen'],
                    relationships: ['Freude', 'Entspannung'],
                    personal: ['Stressabbau', 'Lebensfreude']
                }
            },
            'Spirituality': {
                name: 'Spirituality',
                category: 'Transcendence',
                description: 'Du hast starke und kohärente Überzeugungen über den höheren Zweck.',
                strengths: ['Sinn', 'Zweck', 'Spiritualität'],
                applications: {
                    career: ['Sinnvolle Arbeit', 'Werte'],
                    relationships: ['Tiefe Verbindung'],
                    personal: ['Lebenssinn', 'Meditation']
                }
            }
        };
    }

    generateQuestions() {
        this.questions = [];
        const strengthNames = Object.keys(this.strengthDefinitions);
        
        // Generate 120 questions (5 per strength)
        for (let i = 0; i < this.totalQuestions; i++) {
            const strength1 = strengthNames[Math.floor(Math.random() * strengthNames.length)];
            const strength2 = strengthNames[Math.floor(Math.random() * strengthNames.length)];
            
            if (strength1 !== strength2) {
                this.questions.push({
                    id: i + 1,
                    strength1: strength1,
                    strength2: strength2,
                    question: `Welche Aussage beschreibt dich besser?`,
                    option1: this.getStrengthStatement(strength1),
                    option2: this.getStrengthStatement(strength2)
                });
            }
        }
    }

    getStrengthStatement(strength) {
        const statements = {
            'Creativity': 'Ich denke gerne über neue und kreative Wege nach, Dinge zu tun.',
            'Curiosity': 'Ich interessiere mich für viele verschiedene Dinge und Themen.',
            'Judgment': 'Ich denke gerne über Dinge nach und betrachte sie von allen Seiten.',
            'Love of Learning': 'Ich liebe es, neue Dinge zu lernen und zu entdecken.',
            'Perspective': 'Ich kann anderen Menschen gute Ratschläge geben.',
            'Bravery': 'Ich bin nicht davor zurückzuschrecken, meine Meinung zu sagen.',
            'Perseverance': 'Ich arbeite hart daran, das zu beenden, was ich begonnen habe.',
            'Honesty': 'Ich sage die Wahrheit und präsentiere mich authentisch.',
            'Zest': 'Ich nähere mich dem Leben mit Begeisterung und Energie.',
            'Love': 'Ich schätze enge Beziehungen zu anderen Menschen sehr.',
            'Kindness': 'Ich tue gerne Gefälligkeiten und helfe anderen.',
            'Social Intelligence': 'Ich bin mir der Motive und Gefühle anderer bewusst.',
            'Teamwork': 'Ich arbeite gut als Mitglied einer Gruppe.',
            'Fairness': 'Ich behandle alle Menschen gleich und fair.',
            'Leadership': 'Ich kann eine Gruppe dazu bringen, Dinge zu tun.',
            'Forgiveness': 'Ich vergebe denen, die mir Unrecht getan haben.',
            'Humility': 'Ich lasse andere das Rampenlicht haben.',
            'Prudence': 'Ich bin vorsichtig in meinen Entscheidungen.',
            'Self-Regulation': 'Ich reguliere meine Gefühle und Handlungen gut.',
            'Appreciation of Beauty': 'Ich bemerke und schätze Schönheit in vielen Bereichen.',
            'Hope': 'Ich erwarte das Beste in der Zukunft.',
            'Humor': 'Ich mag es, Menschen zum Lachen zu bringen.',
            'Spirituality': 'Ich habe starke Überzeugungen über den höheren Zweck.'
        };
        return statements[strength] || `Ich zeige Eigenschaften von ${strength}.`;
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
                this.displayTop5Strengths();
                break;
            case 5:
                this.displayPracticalApplication();
                break;
            case 6:
                this.displayDevelopmentPlan();
                break;
            case 7:
                this.displayFinalResults();
                break;
        }
    }

    loadAssessmentQuestions() {
        const container = document.getElementById('question-container');
        const currentQ = this.questions[this.currentQuestion];
        
        container.innerHTML = `
            <div class="question-card">
                <h4>${currentQ.question}</h4>
                <div class="question-options">
                    <label class="option-card">
                        <input type="radio" name="question-${currentQ.id}" value="${currentQ.strength1}">
                        <div class="option-content">
                            <strong>Option A:</strong>
                            <p>${currentQ.option1}</p>
                        </div>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="question-${currentQ.id}" value="${currentQ.strength2}">
                        <div class="option-content">
                            <strong>Option B:</strong>
                            <p>${currentQ.option2}</p>
                        </div>
                    </label>
                </div>
            </div>
        `;

        // Update progress
        document.getElementById('current-question').textContent = this.currentQuestion + 1;
        document.getElementById('total-questions').textContent = this.totalQuestions;
        
        const progressPercent = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
        document.getElementById('question-progress').style.width = `${progressPercent}%`;

        // Update navigation
        document.getElementById('prev-question').style.display = this.currentQuestion > 0 ? 'block' : 'none';
        document.getElementById('next-question').style.display = this.currentQuestion < this.totalQuestions - 1 ? 'block' : 'none';
    }

    nextQuestion() {
        // Save current answer
        const selectedOption = document.querySelector(`input[name="question-${this.questions[this.currentQuestion].id}"]:checked`);
        if (selectedOption) {
            this.answers[this.questions[this.currentQuestion].id] = selectedOption.value;
        }

        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.loadAssessmentQuestions();
        } else {
            // Assessment completed, move to results
            this.nextStep();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.loadAssessmentQuestions();
        }
    }

    calculateResults() {
        // Count answers for each strength
        const strengthCounts = {};
        
        Object.values(this.answers).forEach(strength => {
            strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
        });

        // Sort strengths by count
        this.top5Strengths = Object.entries(strengthCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([strength, count]) => ({
                name: strength,
                score: count,
                definition: this.strengthDefinitions[strength]
            }));

        // Calculate all strength scores
        this.strengths = strengthCounts;
    }

    displayResults() {
        // Display strength categories
        this.displayStrengthCategories();
        
        // Display top 5 preview
        this.displayTop5Preview();
    }

    displayStrengthCategories() {
        const categories = {
            'Wisdom & Knowledge': ['Creativity', 'Curiosity', 'Judgment', 'Love of Learning', 'Perspective'],
            'Courage': ['Bravery', 'Perseverance', 'Honesty', 'Zest'],
            'Humanity': ['Love', 'Kindness', 'Social Intelligence'],
            'Justice': ['Teamwork', 'Fairness', 'Leadership'],
            'Temperance': ['Forgiveness', 'Humility', 'Prudence', 'Self-Regulation'],
            'Transcendence': ['Appreciation of Beauty', 'Hope', 'Humor', 'Spirituality']
        };

        Object.entries(categories).forEach(([category, strengths]) => {
            const container = document.getElementById(`${category.toLowerCase().replace(' & ', '-').replace(' ', '-')}-strengths`);
            if (container) {
                container.innerHTML = strengths.map(strength => {
                    const score = this.strengths[strength] || 0;
                    const isTop5 = this.top5Strengths.some(s => s.name === strength);
                    return `
                        <div class="strength-item ${isTop5 ? 'top-strength' : ''}">
                            <span class="strength-name">${strength}</span>
                            <span class="strength-score">${score}</span>
                        </div>
                    `;
                }).join('');
            }
        });
    }

    displayTop5Preview() {
        const container = document.getElementById('top-strengths-preview');
        container.innerHTML = this.top5Strengths.map((strength, index) => `
            <div class="top-strength-preview">
                <div class="strength-rank">${index + 1}</div>
                <div class="strength-info">
                    <h5>${strength.name}</h5>
                    <p>${strength.definition.description}</p>
                </div>
            </div>
        `).join('');
    }

    displayTop5Strengths() {
        const container = document.getElementById('strength-detail-container');
        container.innerHTML = this.top5Strengths.map((strength, index) => `
            <div class="strength-detail-card">
                <div class="strength-header">
                    <div class="strength-rank">#${index + 1}</div>
                    <h4>${strength.name}</h4>
                    <div class="strength-score">Score: ${strength.score}</div>
                </div>
                
                <div class="strength-content">
                    <div class="strength-description">
                        <h5>Beschreibung</h5>
                        <p>${strength.definition.description}</p>
                    </div>
                    
                    <div class="strength-category">
                        <h5>Kategorie</h5>
                        <p>${strength.definition.category}</p>
                    </div>
                    
                    <div class="strength-applications">
                        <h5>Anwendungsbereiche</h5>
                        <div class="application-areas">
                            <div class="application-area">
                                <h6>Beruf</h6>
                                <ul>
                                    ${strength.definition.applications.career.map(app => `<li>${app}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="application-area">
                                <h6>Beziehungen</h6>
                                <ul>
                                    ${strength.definition.applications.relationships.map(app => `<li>${app}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="application-area">
                                <h6>Persönlich</h6>
                                <ul>
                                    ${strength.definition.applications.personal.map(app => `<li>${app}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayPracticalApplication() {
        // Application areas
        this.displayApplicationAreas();
        this.displayStrengthCombinations();
    }

    displayApplicationAreas() {
        // Career applications
        const careerContainer = document.getElementById('career-applications');
        careerContainer.innerHTML = this.top5Strengths.map(strength => `
            <div class="career-application">
                <h6>${strength.name} im Beruf</h6>
                <p>${strength.definition.applications.career.join(', ')}</p>
            </div>
        `).join('');

        // Relationship applications
        const relationshipContainer = document.getElementById('relationship-applications');
        relationshipContainer.innerHTML = this.top5Strengths.map(strength => `
            <div class="relationship-application">
                <h6>${strength.name} in Beziehungen</h6>
                <p>${strength.definition.applications.relationships.join(', ')}</p>
            </div>
        `).join('');

        // Personal applications
        const personalContainer = document.getElementById('personal-applications');
        personalContainer.innerHTML = this.top5Strengths.map(strength => `
            <div class="personal-application">
                <h6>${strength.name} persönlich</h6>
                <p>${strength.definition.applications.personal.join(', ')}</p>
            </div>
        `).join('');

        // Community applications
        const communityContainer = document.getElementById('community-applications');
        communityContainer.innerHTML = this.top5Strengths.map(strength => `
            <div class="community-application">
                <h6>${strength.name} in der Gemeinschaft</h6>
                <p>Nutze ${strength.name} für gesellschaftliches Engagement und Gemeinschaftsarbeit.</p>
            </div>
        `).join('');
    }

    displayStrengthCombinations() {
        const container = document.getElementById('combinations-list');
        const combinations = this.generateStrengthCombinations();
        container.innerHTML = combinations.map(combination => `
            <div class="combination-item">
                <h6>${combination.title}</h6>
                <p>${combination.description}</p>
                <ul>
                    ${combination.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    generateStrengthCombinations() {
        const combinations = [];
        const strengths = this.top5Strengths.map(s => s.name);
        
        // Generate meaningful combinations
        if (strengths.includes('Leadership') && strengths.includes('Teamwork')) {
            combinations.push({
                title: 'Leadership + Teamwork',
                description: 'Du kannst sowohl führen als auch im Team arbeiten.',
                benefits: ['Effektive Teamführung', 'Kooperative Zusammenarbeit', 'Flexible Rollen']
            });
        }
        
        if (strengths.includes('Creativity') && strengths.includes('Curiosity')) {
            combinations.push({
                title: 'Creativity + Curiosity',
                description: 'Du verbindest kreatives Denken mit natürlicher Neugier.',
                benefits: ['Innovative Lösungen', 'Kontinuierliches Lernen', 'Neue Perspektiven']
            });
        }
        
        if (strengths.includes('Kindness') && strengths.includes('Love')) {
            combinations.push({
                title: 'Kindness + Love',
                description: 'Du zeigst sowohl Liebe als auch Freundlichkeit.',
                benefits: ['Tiefe Beziehungen', 'Mitgefühl', 'Unterstützung anderer']
            });
        }
        
        return combinations;
    }

    displayDevelopmentPlan() {
        // Strengthening plan
        const strengtheningContainer = document.getElementById('strengthening-plan');
        strengtheningContainer.innerHTML = this.top5Strengths.map(strength => `
            <div class="strengthening-item">
                <h5>${strength.name} stärken</h5>
                <ul>
                    <li>Täglich 15 Minuten für ${strength.name}-Aktivitäten einplanen</li>
                    <li>Wöchentlich reflektieren: Wo habe ich ${strength.name} eingesetzt?</li>
                    <li>Monatlich neue Anwendungsmöglichkeiten suchen</li>
                    <li>Feedback von anderen zu deinem ${strength.name}-Einsatz einholen</li>
                </ul>
            </div>
        `).join('');

        // Development areas
        this.displayDevelopmentAreas();
        this.displayStrengthHabits();
        this.displayLongTermDevelopment();
    }

    displayDevelopmentAreas() {
        const container = document.getElementById('development-areas');
        const weakerStrengths = this.getWeakerStrengths();
        container.innerHTML = weakerStrengths.map(strength => `
            <div class="development-item">
                <h5>${strength.name} entwickeln</h5>
                <p>${strength.definition.description}</p>
                <ul>
                    <li>Kleine Schritte: Beginne mit 5 Minuten täglich</li>
                    <li>Suche nach Vorbildern in diesem Bereich</li>
                    <li>Übe in sicheren Umgebungen</li>
                </ul>
            </div>
        `).join('');
    }

    getWeakerStrengths() {
        const allStrengths = Object.keys(this.strengthDefinitions);
        const top5Names = this.top5Strengths.map(s => s.name);
        const weakerStrengths = allStrengths
            .filter(s => !top5Names.includes(s))
            .slice(0, 3)
            .map(s => ({
                name: s,
                definition: this.strengthDefinitions[s]
            }));
        return weakerStrengths;
    }

    displayStrengthHabits() {
        const container = document.getElementById('strength-habits');
        container.innerHTML = this.top5Strengths.map(strength => `
            <div class="habit-item">
                <h5>${strength.name} Gewohnheit</h5>
                <p>Entwickle eine tägliche Gewohnheit, um ${strength.name} zu stärken:</p>
                <ul>
                    <li>Morgens: Überlege, wo du ${strength.name} heute einsetzen kannst</li>
                    <li>Abends: Reflektiere, wie du ${strength.name} genutzt hast</li>
                    <li>Wöchentlich: Plane spezifische ${strength.name}-Aktivitäten</li>
                </ul>
            </div>
        `).join('');
    }

    displayLongTermDevelopment() {
        const container = document.getElementById('long-term-development');
        container.innerHTML = `
            <div class="long-term-item">
                <h5>6-Monats-Ziel</h5>
                <p>Entwickle alle deine Top 5 Stärken zu echten Stärken, die dir in allen Lebensbereichen helfen.</p>
            </div>
            <div class="long-term-item">
                <h5>1-Jahres-Ziel</h5>
                <p>Integriere deine Stärken in deine Karriereplanung und persönliche Entwicklung.</p>
            </div>
            <div class="long-term-item">
                <h5>Langfristiges Ziel</h5>
                <p>Nutze deine Stärken, um einen positiven Einfluss auf andere und die Gesellschaft zu haben.</p>
            </div>
        `;
    }

    displayFinalResults() {
        // Top 5 summary
        const top5Container = document.getElementById('top-5-summary');
        top5Container.innerHTML = this.top5Strengths.map((strength, index) => `
            <div class="top-5-item">
                <span class="rank">${index + 1}.</span>
                <span class="strength-name">${strength.name}</span>
                <span class="score">(${strength.score})</span>
            </div>
        `).join('');

        // Category summary
        const categoryContainer = document.getElementById('category-summary');
        const categories = this.calculateCategoryDistribution();
        categoryContainer.innerHTML = Object.entries(categories).map(([category, count]) => `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <span class="category-count">${count} Stärken</span>
            </div>
        `).join('');

        // Action plan
        const actionContainer = document.getElementById('action-plan');
        actionContainer.innerHTML = `
            <div class="action-item">
                <h6>Nächste 30 Tage</h6>
                <ul>
                    <li>Fokussiere dich auf deine #1 Stärke: ${this.top5Strengths[0].name}</li>
                    <li>Identifiziere täglich 3 Situationen, wo du sie einsetzen kannst</li>
                    <li>Führe ein Stärken-Tagebuch</li>
                </ul>
            </div>
            <div class="action-item">
                <h6>Nächste 90 Tage</h6>
                <ul>
                    <li>Entwickle alle 5 Stärken systematisch</li>
                    <li>Suche nach Mentoring-Möglichkeiten</li>
                    <li>Integriere deine Stärken in deine Karriereplanung</li>
                </ul>
            </div>
        `;
    }

    calculateCategoryDistribution() {
        const categories = {};
        this.top5Strengths.forEach(strength => {
            const category = strength.definition.category;
            categories[category] = (categories[category] || 0) + 1;
        });
        return categories;
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
            top5Strengths: this.top5Strengths,
            allStrengths: this.strengths,
            timestamp: new Date().toISOString()
        };

        let content, filename, mimeType;

        switch (format) {
            case 'pdf':
                content = this.generatePDFContent();
                this.downloadHTML(content, 'via-strengths-results.html');
                break;
            case 'csv':
                content = this.generateCSVContent();
                filename = 'via-strengths-results.csv';
                mimeType = 'text/csv';
                this.downloadFile(content, filename, mimeType);
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename = 'via-strengths-results.json';
                mimeType = 'application/json';
                this.downloadFile(content, filename, mimeType);
                break;
        }
    }

    generatePDFContent() {
        return `
            <html>
            <head>
                <title>VIA Character Strengths Ergebnisse</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .strength-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                    .rank { font-weight: bold; color: #6366f1; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>VIA Character Strengths Ergebnisse</h1>
                    <p>Generiert am: ${new Date().toLocaleDateString('de-DE')}</p>
                </div>
                
                <h2>Deine Top 5 Charakterstärken</h2>
                ${this.top5Strengths.map((strength, index) => `
                    <div class="strength-item">
                        <h3><span class="rank">#${index + 1}</span> ${strength.name}</h3>
                        <p><strong>Score:</strong> ${strength.score}</p>
                        <p><strong>Kategorie:</strong> ${strength.definition.category}</p>
                        <p><strong>Beschreibung:</strong> ${strength.definition.description}</p>
                    </div>
                `).join('')}
            </body>
            </html>
        `;
    }

    generateCSVContent() {
        let csv = 'Strength,Rank,Score,Category,Description\n';
        this.top5Strengths.forEach((strength, index) => {
            csv += `"${strength.name}",${index + 1},${strength.score},"${strength.definition.category}","${strength.definition.description}"\n`;
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
    new VIAStrengthsAssessment();
});
