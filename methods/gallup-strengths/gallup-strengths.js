// Gallup StrengthsFinder Assessment
class GallupStrengthsAssessment {
    constructor() {
        this.currentStep = 1;
        this.currentQuestion = 0;
        this.answers = {};
        this.talents = {};
        this.top5Talents = [];
        this.totalSteps = 7;
        this.totalQuestions = 177; // Original Gallup format - 177 forced choice pairs
        this.timePerQuestion = 20; // 20 seconds per question as per Gallup methodology
        
        this.init();
    }

    init() {
        console.log('Initializing Gallup StrengthsFinder Assessment');
        this.loadTalentDefinitions();
        this.generateQuestions();
        
        // Wait for DOM to be fully ready
        setTimeout(() => {
            console.log('Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('Updating progress...');
            this.updateProgress();
            
            console.log('Assessment initialized successfully');
            
            // Force show step 1 content immediately
            const step1 = document.querySelector('[data-step="1"]');
            if (step1) {
                step1.classList.add('active');
                step1.style.display = 'block';
                console.log('Force activated step 1 with inline style');
            }
            
            // Update step display after a short delay
            setTimeout(() => {
                console.log('Updating step display...');
                this.updateStep();
            }, 100);
        }, 200);
    }

    setupEventListeners() {
        // Wait for DOM to be ready
        setTimeout(() => {
            const nextStepBtn = document.getElementById('next-step');
            const prevStepBtn = document.getElementById('prev-step');
            const nextQuestionBtn = document.getElementById('next-question');
            const prevQuestionBtn = document.getElementById('prev-question');
            
            if (nextStepBtn) {
                nextStepBtn.addEventListener('click', () => this.nextStep());
            }
            if (prevStepBtn) {
                prevStepBtn.addEventListener('click', () => this.previousStep());
            }
            if (nextQuestionBtn) {
                nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
            }
            if (prevQuestionBtn) {
                prevQuestionBtn.addEventListener('click', () => this.previousQuestion());
            }
        }, 100);
    }

    loadTalentDefinitions() {
        this.talentDefinitions = {
            // Executing Talents
            'Achiever': {
                name: 'Achiever',
                category: 'Executing',
                description: 'Du hast eine konstante Notwendigkeit, Dinge zu erreichen. Jeder Tag beginnt bei null und muss bis zum Ende des Tages als erfolgreich abgeschlossen werden.',
                strengths: ['Antrieb', 'Produktivität', 'Zielorientierung', 'Energie', 'Durchhaltevermögen'],
                challenges: ['Burnout-Risiko', 'Perfektionismus', 'Schwierigkeit zu entspannen', 'Überarbeitung'],
                applications: {
                    career: ['Projektmanagement', 'Vertrieb', 'Unternehmertum', 'Führungspositionen'],
                    relationships: ['Motivation anderer', 'Familienziele setzen', 'Teamführung'],
                    personal: ['Fitness-Ziele', 'Lernziele', 'Hobbys', 'Persönliche Entwicklung']
                }
            },
            'Arranger': {
                name: 'Arranger',
                category: 'Executing',
                description: 'Du kannst viele Variablen gleichzeitig organisieren.',
                strengths: ['Organisation', 'Flexibilität', 'Multitasking'],
                challenges: ['Überforderung', 'Schwierigkeit Nein zu sagen'],
                applications: {
                    career: ['Event-Management', 'Logistik', 'Teamleitung'],
                    relationships: ['Familienorganisation', 'Freundeskreis koordinieren'],
                    personal: ['Zeitmanagement', 'Lebensplanung']
                }
            },
            'Belief': {
                name: 'Belief',
                category: 'Executing',
                description: 'Du hast feste, unveränderliche Werte.',
                strengths: ['Integrität', 'Konsistenz', 'Werteorientierung'],
                challenges: ['Rigidität', 'Schwierigkeit zu kompromittieren'],
                applications: {
                    career: ['Ethik-Beratung', 'Non-Profit', 'Führungspositionen'],
                    relationships: ['Vertrauen aufbauen', 'Kindererziehung'],
                    personal: ['Lebensphilosophie', 'Spiritualität']
                }
            },
            'Consistency': {
                name: 'Consistency',
                category: 'Executing',
                description: 'Du behandelst alle Menschen gleich.',
                strengths: ['Fairness', 'Gerechtigkeit', 'Objektivität'],
                challenges: ['Schwierigkeit mit Ausnahmen', 'Rigidität'],
                applications: {
                    career: ['HR', 'Recht', 'Qualitätskontrolle'],
                    relationships: ['Konfliktlösung', 'Familienregeln'],
                    personal: ['Ethik', 'Gerechtigkeit']
                }
            },
            'Deliberative': {
                name: 'Deliberative',
                category: 'Executing',
                description: 'Du triffst Entscheidungen sehr sorgfältig.',
                strengths: ['Vorsicht', 'Durchdachte Entscheidungen', 'Risikobewusstsein'],
                challenges: ['Entscheidungsschwierigkeiten', 'Übervorsicht'],
                applications: {
                    career: ['Finanzen', 'Recht', 'Risikomanagement'],
                    relationships: ['Wichtige Lebensentscheidungen'],
                    personal: ['Investitionen', 'Lebensplanung']
                }
            },
            'Discipline': {
                name: 'Discipline',
                category: 'Executing',
                description: 'Du brauchst Struktur und Routine.',
                strengths: ['Organisation', 'Zuverlässigkeit', 'Struktur'],
                challenges: ['Flexibilitätsschwierigkeiten', 'Stress bei Chaos'],
                applications: {
                    career: ['Projektmanagement', 'Buchhaltung', 'Administration'],
                    relationships: ['Familienroutinen', 'Verlässlichkeit'],
                    personal: ['Zeitmanagement', 'Gewohnheiten']
                }
            },
            'Focus': {
                name: 'Focus',
                category: 'Executing',
                description: 'Du kannst Ziele setzen und verfolgen.',
                strengths: ['Zielorientierung', 'Konzentration', 'Effizienz'],
                challenges: ['Schwierigkeit zu delegieren', 'Tunnelblick'],
                applications: {
                    career: ['Projektleitung', 'Vertrieb', 'Forschung'],
                    relationships: ['Beziehungsziele', 'Familienplanung'],
                    personal: ['Lebensziele', 'Karriereplanung']
                }
            },
            'Responsibility': {
                name: 'Responsibility',
                category: 'Executing',
                description: 'Du übernimmst psychologisch Besitz von dem, was du sagst.',
                strengths: ['Zuverlässigkeit', 'Verantwortung', 'Vertrauen'],
                challenges: ['Überverantwortung', 'Schwierigkeit Nein zu sagen'],
                applications: {
                    career: ['Führung', 'Kundenbetreuung', 'Projektmanagement'],
                    relationships: ['Vertrauen aufbauen', 'Familienverantwortung'],
                    personal: ['Selbstverantwortung', 'Lebensführung']
                }
            },
            'Restorative': {
                name: 'Restorative',
                category: 'Executing',
                description: 'Du liebst es, Probleme zu lösen.',
                strengths: ['Problemlösung', 'Kreativität', 'Durchhaltevermögen'],
                challenges: ['Schwierigkeit mit Routine', 'Probleme suchen'],
                applications: {
                    career: ['Beratung', 'Technik', 'Medizin'],
                    relationships: ['Konfliktlösung', 'Beziehungsprobleme'],
                    personal: ['Lebensprobleme', 'Herausforderungen']
                }
            },
            // Influencing Talents
            'Activator': {
                name: 'Activator',
                category: 'Influencing',
                description: 'Du kannst Dinge in Bewegung setzen.',
                strengths: ['Initiative', 'Dynamik', 'Umsetzungskraft'],
                challenges: ['Ungeduld', 'Schwierigkeit zu warten'],
                applications: {
                    career: ['Unternehmertum', 'Vertrieb', 'Projektleitung'],
                    relationships: ['Motivation anderer', 'Familienaktivitäten'],
                    personal: ['Zielerreichung', 'Lebensveränderungen']
                }
            },
            'Command': {
                name: 'Command',
                category: 'Influencing',
                description: 'Du kannst die Kontrolle übernehmen. Du bist nicht schüchtern, deine Meinung zu äußern.',
                strengths: ['Führung', 'Entscheidungsfähigkeit', 'Autorität', 'Selbstvertrauen', 'Direktheit'],
                challenges: ['Dominanz', 'Schwierigkeit zu delegieren', 'Konfrontation', 'Autoritär wirken'],
                applications: {
                    career: ['Management', 'Militär', 'Politik', 'Führungspositionen'],
                    relationships: ['Familienführung', 'Krisenmanagement', 'Teamführung'],
                    personal: ['Selbstführung', 'Lebensentscheidungen', 'Persönliche Autorität']
                }
            },
            'Communication': {
                name: 'Communication',
                category: 'Influencing',
                description: 'Du kannst Ideen lebendig werden lassen.',
                strengths: ['Überzeugungskraft', 'Klarheit', 'Engagement'],
                challenges: ['Überkommunikation', 'Schwierigkeit zuzuhören'],
                applications: {
                    career: ['Verkauf', 'Training', 'Medien'],
                    relationships: ['Konfliktlösung', 'Familienkommunikation'],
                    personal: ['Selbstausdruck', 'Networking']
                }
            },
            'Competition': {
                name: 'Competition',
                category: 'Influencing',
                description: 'Du misst deinen Fortschritt an dem anderer.',
                strengths: ['Antrieb', 'Leistungsorientierung', 'Motivation'],
                challenges: ['Aggressivität', 'Schwierigkeit zu kooperieren'],
                applications: {
                    career: ['Vertrieb', 'Sport', 'Wettbewerb'],
                    relationships: ['Familienaktivitäten', 'Freundschaften'],
                    personal: ['Fitness', 'Lernziele']
                }
            },
            'Maximizer': {
                name: 'Maximizer',
                category: 'Influencing',
                description: 'Du willst Stärken zu Exzellenz entwickeln.',
                strengths: ['Exzellenz', 'Verbesserung', 'Qualität'],
                challenges: ['Perfektionismus', 'Schwierigkeit mit Durchschnitt'],
                applications: {
                    career: ['Qualitätsmanagement', 'Training', 'Beratung'],
                    relationships: ['Beziehungsverbesserung', 'Familienentwicklung'],
                    personal: ['Selbstverbesserung', 'Fähigkeiten']
                }
            },
            'Self-Assurance': {
                name: 'Self-Assurance',
                category: 'Influencing',
                description: 'Du vertraust auf deine Fähigkeiten.',
                strengths: ['Vertrauen', 'Unabhängigkeit', 'Entscheidungsfähigkeit'],
                challenges: ['Arroganz', 'Schwierigkeit Hilfe anzunehmen'],
                applications: {
                    career: ['Führung', 'Unternehmertum', 'Beratung'],
                    relationships: ['Selbstvertrauen', 'Familienführung'],
                    personal: ['Selbstvertrauen', 'Lebensentscheidungen']
                }
            },
            'Significance': {
                name: 'Significance',
                category: 'Influencing',
                description: 'Du willst von anderen als wichtig angesehen werden.',
                strengths: ['Motivation', 'Leistung', 'Einfluss'],
                challenges: ['Egoismus', 'Schwierigkeit zu teilen'],
                applications: {
                    career: ['Führung', 'Öffentlichkeitsarbeit', 'Politik'],
                    relationships: ['Familienführung', 'Gemeinschaft'],
                    personal: ['Selbstwert', 'Lebensziele']
                }
            },
            'Woo': {
                name: 'Woo',
                category: 'Influencing',
                description: 'Du genießt es, neue Menschen kennenzulernen.',
                strengths: ['Networking', 'Beziehungsaufbau', 'Charme'],
                challenges: ['Oberflächlichkeit', 'Schwierigkeit tiefe Beziehungen'],
                applications: {
                    career: ['Vertrieb', 'Marketing', 'Event-Management'],
                    relationships: ['Freundschaften', 'Networking'],
                    personal: ['Soziale Fähigkeiten', 'Gemeinschaft']
                }
            },
            // Relationship Building Talents
            'Adaptability': {
                name: 'Adaptability',
                category: 'Relationship Building',
                description: 'Du lebst im Moment und gehst mit dem Strom.',
                strengths: ['Flexibilität', 'Gelassenheit', 'Anpassungsfähigkeit'],
                challenges: ['Schwierigkeit zu planen', 'Unvorhersagbarkeit'],
                applications: {
                    career: ['Beratung', 'Krisenmanagement', 'Service'],
                    relationships: ['Familienflexibilität', 'Konfliktlösung'],
                    personal: ['Lebensveränderungen', 'Stressmanagement']
                }
            },
            'Connectedness': {
                name: 'Connectedness',
                category: 'Relationship Building',
                description: 'Du glaubst, dass alles miteinander verbunden ist.',
                strengths: ['Ganzheitlichkeit', 'Spiritualität', 'Zusammenhalt'],
                challenges: ['Schwierigkeit mit Details', 'Übermäßige Spiritualität'],
                applications: {
                    career: ['Beratung', 'Therapie', 'Spiritualität'],
                    relationships: ['Familienzusammenhalt', 'Gemeinschaft'],
                    personal: ['Lebenssinn', 'Spiritualität']
                }
            },
            'Developer': {
                name: 'Developer',
                category: 'Relationship Building',
                description: 'Du siehst das Potenzial in anderen.',
                strengths: ['Mentoring', 'Entwicklung', 'Geduld'],
                challenges: ['Schwierigkeit mit Leistungsschwachen', 'Übermäßige Geduld'],
                applications: {
                    career: ['Training', 'HR', 'Bildung'],
                    relationships: ['Familienentwicklung', 'Freundschaften'],
                    personal: ['Selbstentwicklung', 'Mentoring']
                }
            },
            'Empathy': {
                name: 'Empathy',
                category: 'Relationship Building',
                description: 'Du kannst die Gefühle anderer spüren.',
                strengths: ['Verständnis', 'Mitgefühl', 'Intuition'],
                challenges: ['Emotionale Überlastung', 'Schwierigkeit Abstand zu halten'],
                applications: {
                    career: ['Therapie', 'Beratung', 'Pflege'],
                    relationships: ['Familienverständnis', 'Freundschaften'],
                    personal: ['Emotionale Intelligenz', 'Beziehungen']
                }
            },
            'Harmony': {
                name: 'Harmony',
                category: 'Relationship Building',
                description: 'Du suchst nach Übereinstimmung.',
                strengths: ['Konfliktlösung', 'Harmonie', 'Vermittlung'],
                challenges: ['Schwierigkeit mit Konflikten', 'Vermeidung'],
                applications: {
                    career: ['Mediation', 'HR', 'Teamleitung'],
                    relationships: ['Familienharmonie', 'Freundschaften'],
                    personal: ['Beziehungen', 'Konfliktlösung']
                }
            },
            'Includer': {
                name: 'Includer',
                category: 'Relationship Building',
                description: 'Du akzeptierst andere.',
                strengths: ['Inklusion', 'Akzeptanz', 'Vielfalt'],
                challenges: ['Schwierigkeit Grenzen zu setzen', 'Übermäßige Toleranz'],
                applications: {
                    career: ['Diversity Management', 'Bildung', 'Sozialarbeit'],
                    relationships: ['Familienintegration', 'Gemeinschaft'],
                    personal: ['Toleranz', 'Vielfalt']
                }
            },
            'Individualization': {
                name: 'Individualization',
                category: 'Relationship Building',
                description: 'Du interessierst dich für die Einzigartigkeit anderer.',
                strengths: ['Individualität', 'Verständnis', 'Anpassung'],
                challenges: ['Schwierigkeit mit Gruppen', 'Übermäßige Individualisierung'],
                applications: {
                    career: ['Beratung', 'HR', 'Therapie'],
                    relationships: ['Familienverständnis', 'Freundschaften'],
                    personal: ['Selbstverständnis', 'Beziehungen']
                }
            },
            'Positivity': {
                name: 'Positivity',
                category: 'Relationship Building',
                description: 'Du bist enthusiastisch und optimistisch.',
                strengths: ['Optimismus', 'Enthusiasmus', 'Motivation'],
                challenges: ['Schwierigkeit mit Negativität', 'Übermäßiger Optimismus'],
                applications: {
                    career: ['Training', 'Vertrieb', 'Event-Management'],
                    relationships: ['Familienstimmung', 'Freundschaften'],
                    personal: ['Lebensfreude', 'Motivation']
                }
            },
            'Relator': {
                name: 'Relator',
                category: 'Relationship Building',
                description: 'Du genießt enge Beziehungen.',
                strengths: ['Tiefe', 'Loyalität', 'Vertrauen'],
                challenges: ['Schwierigkeit mit neuen Menschen', 'Übermäßige Abhängigkeit'],
                applications: {
                    career: ['Beratung', 'Kundenbetreuung', 'Teamarbeit'],
                    relationships: ['Familie', 'Freundschaften'],
                    personal: ['Beziehungen', 'Vertrauen']
                }
            },
            // Strategic Thinking Talents
            'Analytical': {
                name: 'Analytical',
                category: 'Strategic Thinking',
                description: 'Du suchst nach Gründen und Ursachen.',
                strengths: ['Logik', 'Objektivität', 'Genauigkeit'],
                challenges: ['Übermäßige Analyse', 'Schwierigkeit mit Intuition'],
                applications: {
                    career: ['Forschung', 'Finanzen', 'Datenanalyse'],
                    relationships: ['Problemlösung', 'Entscheidungen'],
                    personal: ['Logisches Denken', 'Problemlösung']
                }
            },
            'Context': {
                name: 'Context',
                category: 'Strategic Thinking',
                description: 'Du verstehst die Gegenwart durch die Vergangenheit.',
                strengths: ['Geschichtsverständnis', 'Lernen', 'Perspektive'],
                challenges: ['Schwierigkeit mit Neuem', 'Übermäßige Vergangenheitsorientierung'],
                applications: {
                    career: ['Geschichte', 'Beratung', 'Forschung'],
                    relationships: ['Familienverständnis', 'Lernen'],
                    personal: ['Selbstverständnis', 'Lernen']
                }
            },
            'Futuristic': {
                name: 'Futuristic',
                category: 'Strategic Thinking',
                description: 'Du siehst die Zukunft mit Begeisterung.',
                strengths: ['Vision', 'Inspiration', 'Zukunftsorientierung'],
                challenges: ['Schwierigkeit mit Gegenwart', 'Übermäßige Zukunftsfokussierung'],
                applications: {
                    career: ['Strategie', 'Innovation', 'Führung'],
                    relationships: ['Familienplanung', 'Zukunftsgestaltung'],
                    personal: ['Lebensplanung', 'Visionen']
                }
            },
            'Ideation': {
                name: 'Ideation',
                category: 'Strategic Thinking',
                description: 'Du liebst Ideen.',
                strengths: ['Kreativität', 'Innovation', 'Konzepte'],
                challenges: ['Schwierigkeit mit Details', 'Übermäßige Ideen'],
                applications: {
                    career: ['Innovation', 'Marketing', 'Beratung'],
                    relationships: ['Kreative Lösungen', 'Problemlösung'],
                    personal: ['Kreativität', 'Innovation']
                }
            },
            'Input': {
                name: 'Input',
                category: 'Strategic Thinking',
                description: 'Du sammelst gerne Dinge.',
                strengths: ['Wissenssammlung', 'Ressourcen', 'Information'],
                challenges: ['Übermäßige Sammlung', 'Schwierigkeit zu organisieren'],
                applications: {
                    career: ['Forschung', 'Bibliothek', 'Beratung'],
                    relationships: ['Wissensvermittlung', 'Ressourcen'],
                    personal: ['Lernen', 'Wissenssammlung']
                }
            },
            'Intellection': {
                name: 'Intellection',
                category: 'Strategic Thinking',
                description: 'Du liebst es zu denken.',
                strengths: ['Reflexion', 'Tiefe', 'Philosophie'],
                challenges: ['Übermäßige Reflexion', 'Schwierigkeit mit Aktion'],
                applications: {
                    career: ['Forschung', 'Philosophie', 'Beratung'],
                    relationships: ['Tiefe Gespräche', 'Reflexion'],
                    personal: ['Selbstreflexion', 'Philosophie']
                }
            },
            'Learner': {
                name: 'Learner',
                category: 'Strategic Thinking',
                description: 'Du liebst es zu lernen.',
                strengths: ['Wachstum', 'Neugier', 'Entwicklung'],
                challenges: ['Schwierigkeit mit Routine', 'Übermäßiges Lernen'],
                applications: {
                    career: ['Bildung', 'Forschung', 'Beratung'],
                    relationships: ['Wissensvermittlung', 'Entwicklung'],
                    personal: ['Lebenslanges Lernen', 'Entwicklung']
                }
            },
            'Strategic': {
                name: 'Strategic',
                category: 'Strategic Thinking',
                description: 'Du kannst alternative Wege sehen. Du siehst Muster, wo andere nur Komplexität sehen.',
                strengths: ['Strategie', 'Alternativen', 'Effizienz', 'Mustererkennung', 'Vision'],
                challenges: ['Übermäßige Strategie', 'Schwierigkeit mit Spontaneität', 'Unentschlossenheit'],
                applications: {
                    career: ['Strategie', 'Führung', 'Beratung', 'Innovation'],
                    relationships: ['Problemlösung', 'Planung', 'Familienstrategien'],
                    personal: ['Lebensstrategie', 'Entscheidungen', 'Persönliche Entwicklung']
                }
            }
        };
    }

    generateQuestions() {
        this.questions = [];
        const talentNames = Object.keys(this.talentDefinitions);
        
        // Generate 177 questions following Gallup's scientific methodology
        // Each question is a forced choice pair designed to reveal natural preferences
        
        // Create strategic question pairs that mirror Gallup's approach
        const strategicPairs = this.createStrategicQuestionPairs();
        
        for (let i = 0; i < this.totalQuestions; i++) {
            let talent1, talent2;
            
            if (i < strategicPairs.length) {
                // Use strategic pairs for better coverage
                const pair = strategicPairs[i];
                talent1 = pair.talent1;
                talent2 = pair.talent2;
            } else {
                // Fill remaining with random pairs
                talent1 = talentNames[Math.floor(Math.random() * talentNames.length)];
                talent2 = talentNames[Math.floor(Math.random() * talentNames.length)];
                
                while (talent2 === talent1) {
                    talent2 = talentNames[Math.floor(Math.random() * talentNames.length)];
                }
            }
            
            this.questions.push({
                id: i + 1,
                talent1: talent1,
                talent2: talent2,
                question: `Welche Aussage beschreibt dich besser?`,
                option1: this.getTalentStatement(talent1),
                option2: this.getTalentStatement(talent2),
                timeLimit: this.timePerQuestion
            });
        }
        
        console.log(`Generated ${this.questions.length} questions following Gallup's scientific methodology`);
    }
    
    createStrategicQuestionPairs() {
        // Create strategic pairs that mirror Gallup's approach
        // These pairs are designed to reveal natural preferences
        const pairs = [];
        
        // Executing vs Influencing pairs
        pairs.push({talent1: 'Achiever', talent2: 'Command'});
        pairs.push({talent1: 'Discipline', talent2: 'Activator'});
        pairs.push({talent1: 'Focus', talent2: 'Communication'});
        pairs.push({talent1: 'Responsibility', talent2: 'Woo'});
        pairs.push({talent1: 'Restorative', talent2: 'Competition'});
        
        // Executing vs Relationship Building pairs
        pairs.push({talent1: 'Achiever', talent2: 'Developer'});
        pairs.push({talent1: 'Discipline', talent2: 'Adaptability'});
        pairs.push({talent1: 'Focus', talent2: 'Empathy'});
        pairs.push({talent1: 'Responsibility', talent2: 'Harmony'});
        pairs.push({talent1: 'Restorative', talent2: 'Relator'});
        
        // Executing vs Strategic Thinking pairs
        pairs.push({talent1: 'Achiever', talent2: 'Strategic'});
        pairs.push({talent1: 'Discipline', talent2: 'Analytical'});
        pairs.push({talent1: 'Focus', talent2: 'Futuristic'});
        pairs.push({talent1: 'Responsibility', talent2: 'Learner'});
        pairs.push({talent1: 'Restorative', talent2: 'Ideation'});
        
        // Influencing vs Relationship Building pairs
        pairs.push({talent1: 'Command', talent2: 'Developer'});
        pairs.push({talent1: 'Activator', talent2: 'Adaptability'});
        pairs.push({talent1: 'Communication', talent2: 'Empathy'});
        pairs.push({talent1: 'Woo', talent2: 'Harmony'});
        pairs.push({talent1: 'Competition', talent2: 'Relator'});
        
        // Influencing vs Strategic Thinking pairs
        pairs.push({talent1: 'Command', talent2: 'Strategic'});
        pairs.push({talent1: 'Activator', talent2: 'Analytical'});
        pairs.push({talent1: 'Communication', talent2: 'Futuristic'});
        pairs.push({talent1: 'Woo', talent2: 'Learner'});
        pairs.push({talent1: 'Competition', talent2: 'Ideation'});
        
        // Relationship Building vs Strategic Thinking pairs
        pairs.push({talent1: 'Developer', talent2: 'Strategic'});
        pairs.push({talent1: 'Adaptability', talent2: 'Analytical'});
        pairs.push({talent1: 'Empathy', talent2: 'Futuristic'});
        pairs.push({talent1: 'Harmony', talent2: 'Learner'});
        pairs.push({talent1: 'Relator', talent2: 'Ideation'});
        
        // Within-category pairs for fine-tuning
        pairs.push({talent1: 'Achiever', talent2: 'Focus'});
        pairs.push({talent1: 'Discipline', talent2: 'Responsibility'});
        pairs.push({talent1: 'Command', talent2: 'Self-Assurance'});
        pairs.push({talent1: 'Communication', talent2: 'Woo'});
        pairs.push({talent1: 'Developer', talent2: 'Empathy'});
        pairs.push({talent1: 'Harmony', talent2: 'Adaptability'});
        pairs.push({talent1: 'Strategic', talent2: 'Analytical'});
        pairs.push({talent1: 'Learner', talent2: 'Input'});
        
        return pairs;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getTalentStatement(talent) {
        const statements = {
            // Executing Talents - Multiple statements per talent for variety
            'Achiever': [
                'Ich fühle mich am besten, wenn ich produktiv bin und Dinge erreiche.',
                'Ich brauche das Gefühl, jeden Tag etwas geschafft zu haben.',
                'Meine Energie kommt aus dem Erreichen von Zielen.',
                'Ich bin motiviert, wenn ich Fortschritte sehe.',
                'Ich fühle mich unwohl, wenn ich nicht produktiv bin.'
            ],
            'Arranger': [
                'Ich kann viele verschiedene Dinge gleichzeitig organisieren.',
                'Ich sehe, wie verschiedene Elemente zusammenpassen.',
                'Ich bin gut darin, komplexe Situationen zu koordinieren.',
                'Ich kann flexibel auf Veränderungen reagieren.',
                'Ich organisiere gerne Menschen und Ressourcen.'
            ],
            'Belief': [
                'Ich habe feste Werte, die mein Handeln leiten.',
                'Meine Überzeugungen geben meinem Leben Sinn.',
                'Ich handele nach meinen tiefsten Überzeugungen.',
                'Meine Werte sind wichtiger als Geld oder Ruhm.',
                'Ich brauche eine Arbeit, die zu meinen Werten passt.'
            ],
            'Consistency': [
                'Ich behandle alle Menschen gleich und fair.',
                'Ich glaube an klare Regeln und Standards.',
                'Ich bin gegen Bevorzugung oder Diskriminierung.',
                'Ich schätze Vorhersagbarkeit und Gleichheit.',
                'Ich setze mich für Gerechtigkeit ein.'
            ],
            'Deliberative': [
                'Ich treffe Entscheidungen sehr sorgfältig und durchdacht.',
                'Ich denke über alle Konsequenzen nach.',
                'Ich bin vorsichtig und überlege gründlich.',
                'Ich vermeide Risiken und unüberlegte Entscheidungen.',
                'Ich plane gerne im Voraus.'
            ],
            'Discipline': [
                'Ich brauche Struktur und Routine in meinem Leben.',
                'Ich organisiere gerne und schaffe Ordnung.',
                'Ich fühle mich wohl in vorhersagbaren Abläufen.',
                'Ich schätze Regelmäßigkeit und Systematik.',
                'Ich kann gut mit Fristen und Plänen umgehen.'
            ],
            'Focus': [
                'Ich kann mich sehr gut auf Ziele konzentrieren.',
                'Ich lasse mich nicht leicht ablenken.',
                'Ich richte meine Energie auf das Wichtigste.',
                'Ich brauche klare Prioritäten.',
                'Ich arbeite gerne an einem Ziel nach dem anderen.'
            ],
            'Responsibility': [
                'Ich übernehme gerne Verantwortung für meine Aufgaben.',
                'Ich fühle mich verpflichtet, meine Versprechen zu halten.',
                'Ich bin zuverlässig und vertrauenswürdig.',
                'Ich übernehme die Verantwortung für meine Handlungen.',
                'Ich fühle mich verantwortlich für andere.'
            ],
            'Restorative': [
                'Ich liebe es, Probleme zu lösen und Dinge zu reparieren.',
                'Ich sehe Herausforderungen als Rätsel, die gelöst werden müssen.',
                'Ich bin gut darin, kaputte Dinge wieder funktionsfähig zu machen.',
                'Ich fühle mich erfüllt, wenn ich Probleme behebe.',
                'Ich analysiere gerne, was schiefgelaufen ist.'
            ],
            
            // Influencing Talents - Multiple statements per talent for variety
            'Activator': [
                'Ich kann Dinge in Bewegung setzen und andere motivieren.',
                'Ich werde ungeduldig, wenn nichts passiert.',
                'Ich liebe es, Aktionen zu starten.',
                'Ich kann andere dazu bringen, zu handeln.',
                'Ich bin gut darin, Dinge ins Rollen zu bringen.'
            ],
            'Command': [
                'Ich kann die Kontrolle übernehmen und führen.',
                'Ich bin nicht schüchtern, meine Meinung zu äußern.',
                'Ich kann schwierige Situationen meistern.',
                'Ich übernehme gerne die Führung.',
                'Ich kann andere überzeugen und beeinflussen.'
            ],
            'Communication': [
                'Ich kann Ideen lebendig werden lassen und überzeugen.',
                'Ich liebe es, Geschichten zu erzählen.',
                'Ich kann komplexe Dinge einfach erklären.',
                'Ich bin gut darin, andere zu motivieren.',
                'Ich verwende gerne Bilder und Metaphern.'
            ],
            'Competition': [
                'Ich messe meinen Fortschritt an dem anderer.',
                'Ich liebe es, zu gewinnen.',
                'Ich brauche Vergleichsmöglichkeiten.',
                'Ich bin motiviert durch Wettbewerb.',
                'Ich sehe andere als Maßstab für meine Leistung.'
            ],
            'Maximizer': [
                'Ich will Stärken zu Exzellenz entwickeln.',
                'Ich konzentriere mich auf das, was gut funktioniert.',
                'Ich will aus dem Guten das Beste machen.',
                'Ich ignoriere Schwächen und fokussiere auf Stärken.',
                'Ich bin motiviert, Exzellenz zu erreichen.'
            ],
            'Self-Assurance': [
                'Ich vertraue auf meine Fähigkeiten und Entscheidungen.',
                'Ich bin mir meiner selbst sicher.',
                'Ich kann schwierige Entscheidungen treffen.',
                'Ich vertraue auf mein Urteilsvermögen.',
                'Ich bin unabhängig in meinen Entscheidungen.'
            ],
            'Significance': [
                'Ich will von anderen als wichtig angesehen werden.',
                'Ich brauche Anerkennung für meine Leistungen.',
                'Ich will einen Unterschied machen.',
                'Ich strebe nach Einfluss und Bedeutung.',
                'Ich will, dass andere meine Arbeit schätzen.'
            ],
            'Woo': [
                'Ich genieße es, neue Menschen kennenzulernen.',
                'Ich kann leicht mit Fremden ins Gespräch kommen.',
                'Ich fühle mich wohl in neuen sozialen Situationen.',
                'Ich liebe es, neue Kontakte zu knüpfen.',
                'Ich bin gut darin, andere für mich zu gewinnen.'
            ],
            
            // Relationship Building Talents - Multiple statements per talent for variety
            'Adaptability': [
                'Ich lebe im Moment und gehe mit dem Strom.',
                'Ich kann mich gut an Veränderungen anpassen.',
                'Ich bin flexibel und spontan.',
                'Ich reagiere gut auf unerwartete Situationen.',
                'Ich fühle mich wohl mit Ungewissheit.'
            ],
            'Connectedness': [
                'Ich glaube, dass alles miteinander verbunden ist.',
                'Ich sehe Verbindungen zwischen verschiedenen Ereignissen.',
                'Ich glaube an eine höhere Macht oder Schicksal.',
                'Ich fühle mich mit anderen und der Welt verbunden.',
                'Ich sehe einen größeren Sinn in den Dingen.'
            ],
            'Developer': [
                'Ich sehe das Potenzial in anderen Menschen.',
                'Ich liebe es, andere zu fördern und zu entwickeln.',
                'Ich kann das Beste in Menschen zum Vorschein bringen.',
                'Ich bin geduldig mit dem Wachstum anderer.',
                'Ich fühle mich erfüllt, wenn andere Fortschritte machen.'
            ],
            'Empathy': [
                'Ich kann die Gefühle anderer spüren und verstehen.',
                'Ich fühle mit anderen mit.',
                'Ich kann mich in die Lage anderer versetzen.',
                'Ich spüre die Emotionen anderer Menschen.',
                'Ich bin einfühlsam und mitfühlend.'
            ],
            'Harmony': [
                'Ich suche nach Übereinstimmung und Harmonie.',
                'Ich vermeide Konflikte und Streit.',
                'Ich bringe Menschen zusammen.',
                'Ich schätze Frieden und Einigkeit.',
                'Ich bin gut darin, Kompromisse zu finden.'
            ],
            'Includer': [
                'Ich akzeptiere andere und schließe sie ein.',
                'Ich will, dass sich alle willkommen fühlen.',
                'Ich vermeide es, Menschen auszuschließen.',
                'Ich bin offen für alle Arten von Menschen.',
                'Ich schätze Vielfalt und Inklusion.'
            ],
            'Individualization': [
                'Ich interessiere mich für die Einzigartigkeit anderer.',
                'Ich sehe, was jeden Menschen besonders macht.',
                'Ich kann die individuellen Stärken anderer erkennen.',
                'Ich behandle jeden Menschen als Individuum.',
                'Ich schätze die Unterschiede zwischen Menschen.'
            ],
            'Positivity': [
                'Ich bin enthusiastisch und optimistisch.',
                'Ich kann andere motivieren und begeistern.',
                'Ich sehe das Positive in schwierigen Situationen.',
                'Ich verbreite gute Laune.',
                'Ich bin eine Quelle der Ermutigung für andere.'
            ],
            'Relator': [
                'Ich genieße enge, tiefe Beziehungen.',
                'Ich baue gerne vertrauensvolle Freundschaften auf.',
                'Ich bevorzuge wenige, aber intensive Beziehungen.',
                'Ich bin loyal und treu zu meinen Freunden.',
                'Ich teile gerne persönliche Erfahrungen.'
            ],
            
            // Strategic Thinking Talents - Multiple statements per talent for variety
            'Analytical': [
                'Ich suche nach Gründen und Ursachen.',
                'Ich denke logisch und systematisch.',
                'Ich analysiere gerne Daten und Fakten.',
                'Ich hinterfrage Annahmen und suche Beweise.',
                'Ich bin objektiv und unvoreingenommen.'
            ],
            'Context': [
                'Ich verstehe die Gegenwart durch die Vergangenheit.',
                'Ich lerne gerne aus der Geschichte.',
                'Ich schaue gerne zurück, um die Zukunft zu verstehen.',
                'Ich schätze Traditionen und Erfahrungen.',
                'Ich sehe Muster in historischen Ereignissen.'
            ],
            'Futuristic': [
                'Ich sehe die Zukunft mit Begeisterung.',
                'Ich liebe es, über die Zukunft nachzudenken.',
                'Ich kann andere für Zukunftsvisionen begeistern.',
                'Ich plane gerne langfristig.',
                'Ich sehe Möglichkeiten, die andere nicht sehen.'
            ],
            'Ideation': [
                'Ich liebe Ideen und Konzepte.',
                'Ich denke gerne über abstrakte Dinge nach.',
                'Ich komme gerne auf neue Ideen.',
                'Ich sehe Verbindungen zwischen verschiedenen Konzepten.',
                'Ich bin kreativ und innovativ.'
            ],
            'Input': [
                'Ich sammle gerne Informationen und Wissen.',
                'Ich lese gerne und lerne ständig dazu.',
                'Ich sammle gerne interessante Dinge.',
                'Ich bin neugierig und wissbegierig.',
                'Ich teile gerne mein Wissen mit anderen.'
            ],
            'Intellection': [
                'Ich liebe es zu denken und zu reflektieren.',
                'Ich denke gerne über komplexe Themen nach.',
                'Ich brauche Zeit zum Nachdenken.',
                'Ich genieße intellektuelle Diskussionen.',
                'Ich bin ein nachdenklicher Mensch.'
            ],
            'Learner': [
                'Ich liebe es zu lernen und mich zu entwickeln.',
                'Ich bin motiviert, neue Fähigkeiten zu erwerben.',
                'Ich genieße den Lernprozess selbst.',
                'Ich bin neugierig auf neue Themen.',
                'Ich sehe Lernen als lebenslangen Prozess.'
            ],
            'Strategic': [
                'Ich kann alternative Wege und Strategien sehen.',
                'Ich sehe Muster, wo andere nur Komplexität sehen.',
                'Ich kann verschiedene Optionen durchdenken.',
                'Ich bin gut darin, Pläne zu entwickeln.',
                'Ich sehe die großen Zusammenhänge.'
            ]
        };
        
        const talentStatements = statements[talent];
        if (talentStatements && talentStatements.length > 0) {
            // Return a random statement from the array
            return talentStatements[Math.floor(Math.random() * talentStatements.length)];
        }
        
        return `Ich zeige Eigenschaften von ${talent}.`;
    }

    nextStep() {
        console.log('Next step clicked, current step:', this.currentStep);
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            console.log('Moving to step:', this.currentStep);
            this.updateStep();
            this.updateProgress();
        } else {
            console.log('Already at last step');
        }
    }

    previousStep() {
        console.log('Previous step clicked, current step:', this.currentStep);
        if (this.currentStep > 1) {
            this.currentStep--;
            console.log('Moving to step:', this.currentStep);
            this.updateStep();
            this.updateProgress();
        } else {
            console.log('Already at first step');
        }
    }

    updateStep() {
        // Wait for DOM to be ready
        setTimeout(() => {
            console.log('Updating to step:', this.currentStep);
            
            // Hide all steps except current one
            const allSteps = document.querySelectorAll('.workflow-step');
            console.log('Found workflow steps:', allSteps.length);
            
            allSteps.forEach((step, index) => {
                const stepNumber = step.getAttribute('data-step');
                if (stepNumber == this.currentStep) {
                    step.classList.add('active');
                    step.style.display = 'block';
                    console.log(`Activated step ${stepNumber}`);
                } else {
                    step.classList.remove('active');
                    step.style.display = 'none';
                    console.log(`Deactivated step ${stepNumber}`);
                }
            });

            // Update navigation buttons
            const prevButton = document.getElementById('prev-step');
            const nextButton = document.getElementById('next-step');

            if (prevButton) {
                prevButton.style.display = this.currentStep > 1 ? 'block' : 'none';
                console.log('Previous button display:', prevButton.style.display);
            }
            if (nextButton) {
                nextButton.style.display = this.currentStep < this.totalSteps ? 'block' : 'none';
                console.log('Next button display:', nextButton.style.display);
            }

            // Update step info
            const stepInfo = document.getElementById('step-info');
            if (stepInfo) {
                stepInfo.textContent = `Schritt ${this.currentStep} von ${this.totalSteps}`;
                console.log('Updated step info:', stepInfo.textContent);
            }

            // Load step-specific content
            this.loadStepContent();
        }, 50);
    }

    loadStepContent() {
        console.log('Loading content for step:', this.currentStep);
        switch (this.currentStep) {
            case 1:
                // Step 1 content is already in HTML, just ensure it's visible
                console.log('Step 1: Introduction - content should be visible');
                break;
            case 2:
                this.loadAssessmentQuestions();
                break;
            case 3:
                this.calculateResults();
                this.displayResults();
                break;
            case 4:
                this.displayTop5Talents();
                break;
            case 5:
                this.displayDevelopmentPlan();
                break;
            case 6:
                this.displayPracticalApplication();
                break;
            case 7:
                this.displayFinalResults();
                break;
            default:
                console.log('Unknown step:', this.currentStep);
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
                        <input type="radio" name="question-${currentQ.id}" value="${currentQ.talent1}">
                        <div class="option-content">
                            <strong>Option A:</strong>
                            <p>${currentQ.option1}</p>
                        </div>
                    </label>
                    <label class="option-card">
                        <input type="radio" name="question-${currentQ.id}" value="${currentQ.talent2}">
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
        
        // Start timer for this question
        this.startQuestionTimer();
    }

    nextQuestion() {
        // Stop current timer
        this.stopQuestionTimer();
        
        // Save current answer
        const selectedOption = document.querySelector(`input[name="question-${this.questions[this.currentQuestion].id}"]:checked`);
        if (selectedOption) {
            this.answers[this.questions[this.currentQuestion].id] = selectedOption.value;
        }

        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.loadAssessmentQuestions();
            this.startQuestionTimer();
        } else {
            // Assessment completed, move to results
            this.calculateResults();
            this.nextStep();
        }
    }
    
    startQuestionTimer() {
        // Clear any existing timer
        this.stopQuestionTimer();
        
        let timeLeft = this.timePerQuestion;
        const timerDisplay = document.getElementById('timer-display');
        
        // Update timer display immediately
        if (timerDisplay) {
            timerDisplay.textContent = timeLeft;
        }
        
        // Update timer every second
        this.timerInterval = setInterval(() => {
            timeLeft--;
            if (timerDisplay) {
                timerDisplay.textContent = timeLeft;
                
                // Change color when time is running low using CSS classes
                timerDisplay.className = '';
                if (timeLeft <= 5) {
                    timerDisplay.classList.add('danger');
                } else if (timeLeft <= 10) {
                    timerDisplay.classList.add('warning');
                }
            }
            
            if (timeLeft <= 0) {
                this.stopQuestionTimer();
                // Auto-advance if no answer given within 20 seconds
                if (this.currentQuestion < this.totalQuestions - 1) {
                    console.log(`Auto-advancing question ${this.currentQuestion + 1} after 20 seconds`);
                    this.nextQuestion();
                }
            }
        }, 1000);
    }
    
    stopQuestionTimer() {
        if (this.questionTimer) {
            clearTimeout(this.questionTimer);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Reset timer display color
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.style.background = '#8B5CF6';
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.loadAssessmentQuestions();
        }
    }

    calculateResults() {
        // Count answers for each talent
        const talentCounts = {};
        
        Object.values(this.answers).forEach(talent => {
            talentCounts[talent] = (talentCounts[talent] || 0) + 1;
        });

        // Sort talents by count
        this.top5Talents = Object.entries(talentCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([talent, count]) => ({
                name: talent,
                score: count,
                definition: this.talentDefinitions[talent]
            }));

        // Calculate all talent scores
        this.talents = talentCounts;
    }

    displayResults() {
        // Display talent categories
        this.displayTalentCategories();
        
        // Display top 5 preview
        this.displayTop5Preview();
    }

    displayTalentCategories() {
        const categories = {
            'Executing': ['Achiever', 'Arranger', 'Belief', 'Consistency', 'Deliberative', 'Discipline', 'Focus', 'Responsibility', 'Restorative'],
            'Influencing': ['Activator', 'Command', 'Communication', 'Competition', 'Maximizer', 'Self-Assurance', 'Significance', 'Woo'],
            'Relationship Building': ['Adaptability', 'Connectedness', 'Developer', 'Empathy', 'Harmony', 'Includer', 'Individualization', 'Positivity', 'Relator'],
            'Strategic Thinking': ['Analytical', 'Context', 'Futuristic', 'Ideation', 'Input', 'Intellection', 'Learner', 'Strategic']
        };

        Object.entries(categories).forEach(([category, talents]) => {
            const categoryKey = category.toLowerCase().replace(' ', '-');
            const container = document.getElementById(`${categoryKey}-talents`);
            if (container) {
                container.innerHTML = talents.map(talent => {
                    const score = this.talents[talent] || 0;
                    const isTop5 = this.top5Talents.some(t => t.name === talent);
                    return `
                        <div class="talent-item ${isTop5 ? 'top-talent' : ''}">
                            <span class="talent-name">${talent}</span>
                            <span class="talent-score">${score}</span>
                        </div>
                    `;
                }).join('');
            }
        });
    }

    displayTop5Preview() {
        const container = document.getElementById('top-talents-preview');
        container.innerHTML = this.top5Talents.map((talent, index) => `
            <div class="top-talent-preview">
                <div class="talent-rank">${index + 1}</div>
                <div class="talent-info">
                    <h5>${talent.name}</h5>
                    <p>${talent.definition.description}</p>
                </div>
            </div>
        `).join('');
    }

    displayTop5Talents() {
        const container = document.getElementById('talent-detail-container');
        container.innerHTML = this.top5Talents.map((talent, index) => `
            <div class="talent-detail-card">
                <div class="talent-header">
                    <div class="talent-rank">#${index + 1}</div>
                    <h4>${talent.name}</h4>
                    <div class="talent-score">Score: ${talent.score}</div>
                </div>
                
                <div class="talent-content">
                    <div class="talent-description">
                        <h5>Beschreibung</h5>
                        <p>${talent.definition.description}</p>
                    </div>
                    
                    <div class="talent-strengths">
                        <h5>Stärken</h5>
                        <ul>
                            ${talent.definition.strengths.map(strength => `<li>${strength}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="talent-challenges">
                        <h5>Herausforderungen</h5>
                        <ul>
                            ${talent.definition.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="talent-applications">
                        <h5>Anwendungsbereiche</h5>
                        <div class="application-areas">
                            <div class="application-area">
                                <h6>Beruf</h6>
                                <ul>
                                    ${talent.definition.applications.career.map(app => `<li>${app}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="application-area">
                                <h6>Beziehungen</h6>
                                <ul>
                                    ${talent.definition.applications.relationships.map(app => `<li>${app}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="application-area">
                                <h6>Persönlich</h6>
                                <ul>
                                    ${talent.definition.applications.personal.map(app => `<li>${app}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayDevelopmentPlan() {
        // Strengthening plan
        const strengtheningContainer = document.getElementById('strengthening-plan');
        strengtheningContainer.innerHTML = this.top5Talents.map(talent => `
            <div class="strengthening-item">
                <h5>${talent.name} stärken</h5>
                <ul>
                    <li>Täglich 15 Minuten für ${talent.name}-Aktivitäten einplanen</li>
                    <li>Wöchentlich reflektieren: Wo habe ich ${talent.name} eingesetzt?</li>
                    <li>Monatlich neue Anwendungsmöglichkeiten suchen</li>
                    <li>Feedback von anderen zu deinem ${talent.name}-Einsatz einholen</li>
                </ul>
            </div>
        `).join('');

        // Application areas
        this.displayApplicationAreas();
        this.displayTeamIntegration();
    }

    displayApplicationAreas() {
        // Career applications
        const careerContainer = document.getElementById('career-applications');
        careerContainer.innerHTML = this.top5Talents.map(talent => `
            <div class="career-application">
                <h6>${talent.name} im Beruf</h6>
                <p>${talent.definition.applications.career.join(', ')}</p>
            </div>
        `).join('');

        // Relationship applications
        const relationshipContainer = document.getElementById('relationship-applications');
        relationshipContainer.innerHTML = this.top5Talents.map(talent => `
            <div class="relationship-application">
                <h6>${talent.name} in Beziehungen</h6>
                <p>${talent.definition.applications.relationships.join(', ')}</p>
            </div>
        `).join('');

        // Personal applications
        const personalContainer = document.getElementById('personal-applications');
        personalContainer.innerHTML = this.top5Talents.map(talent => `
            <div class="personal-application">
                <h6>${talent.name} persönlich</h6>
                <p>${talent.definition.applications.personal.join(', ')}</p>
            </div>
        `).join('');
    }

    displayTeamIntegration() {
        const teamContainer = document.getElementById('team-roles');
        teamContainer.innerHTML = this.top5Talents.map(talent => `
            <div class="team-role">
                <h6>${talent.name} im Team</h6>
                <p>Du bringst ${talent.name} als deine Stärke in Teams ein. Nutze diese Fähigkeit, um das Team zu unterstützen.</p>
            </div>
        `).join('');
    }

    displayPracticalApplication() {
        // Daily strategies
        const dailyContainer = document.getElementById('daily-strategies');
        dailyContainer.innerHTML = this.top5Talents.map(talent => `
            <div class="daily-strategy">
                <h6>${talent.name} täglich nutzen</h6>
                <ul>
                    <li>Morgens: Überlege, wo du ${talent.name} heute einsetzen kannst</li>
                    <li>Abends: Reflektiere, wie du ${talent.name} genutzt hast</li>
                    <li>Wöchentlich: Plane spezifische ${talent.name}-Aktivitäten</li>
                </ul>
            </div>
        `).join('');

        // Weekly exercises
        const weeklyContainer = document.getElementById('weekly-exercises');
        weeklyContainer.innerHTML = `
            <div class="weekly-exercise">
                <h6>Wöchentliche Talent-Reflexion</h6>
                <p>Jeden Sonntag: Analysiere, wie du deine Top 5 Talente in der vergangenen Woche eingesetzt hast.</p>
            </div>
        `;

        // Long-term goals
        const longTermContainer = document.getElementById('long-term-goals');
        longTermContainer.innerHTML = this.top5Talents.map(talent => `
            <div class="long-term-goal">
                <h6>${talent.name} langfristig entwickeln</h6>
                <p>Ziel: ${talent.name} zu einer echten Stärke entwickeln, die dir in allen Lebensbereichen hilft.</p>
            </div>
        `).join('');

        // Challenges
        const challengesContainer = document.getElementById('challenges-list');
        challengesContainer.innerHTML = this.top5Talents.map(talent => `
            <div class="challenge-item">
                <h6>${talent.name} - Herausforderungen</h6>
                <ul>
                    ${talent.definition.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    displayFinalResults() {
        // Top 5 summary
        const top5Container = document.getElementById('top-5-summary');
        top5Container.innerHTML = this.top5Talents.map((talent, index) => `
            <div class="top-5-item">
                <span class="rank">${index + 1}.</span>
                <span class="talent-name">${talent.name}</span>
                <span class="score">(${talent.score})</span>
            </div>
        `).join('');

        // Category summary
        const categoryContainer = document.getElementById('category-summary');
        const categories = this.calculateCategoryDistribution();
        categoryContainer.innerHTML = Object.entries(categories).map(([category, count]) => `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <span class="category-count">${count} Talente</span>
            </div>
        `).join('');

        // Action plan
        const actionContainer = document.getElementById('action-plan');
        actionContainer.innerHTML = `
            <div class="action-item">
                <h6>Nächste 30 Tage</h6>
                <ul>
                    <li>Fokussiere dich auf dein #1 Talent: ${this.top5Talents[0].name}</li>
                    <li>Identifiziere täglich 3 Situationen, wo du es einsetzen kannst</li>
                    <li>Führe ein Talent-Tagebuch</li>
                </ul>
            </div>
            <div class="action-item">
                <h6>Nächste 90 Tage</h6>
                <ul>
                    <li>Entwickle alle 5 Talente systematisch</li>
                    <li>Suche nach Mentoring-Möglichkeiten</li>
                    <li>Integriere deine Talente in deine Karriereplanung</li>
                </ul>
            </div>
        `;
    }

    calculateCategoryDistribution() {
        const categories = {};
        this.top5Talents.forEach(talent => {
            const category = talent.definition.category;
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
            top5Talents: this.top5Talents,
            allTalents: this.talents,
            timestamp: new Date().toISOString()
        };

        let content, filename, mimeType;

        switch (format) {
            case 'pdf':
                // For PDF, we'll create HTML content that can be printed
                content = this.generatePDFContent();
                this.downloadHTML(content, 'gallup-strengths-results.html');
                break;
            case 'csv':
                content = this.generateCSVContent();
                filename = 'gallup-strengths-results.csv';
                mimeType = 'text/csv';
                this.downloadFile(content, filename, mimeType);
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename = 'gallup-strengths-results.json';
                mimeType = 'application/json';
                this.downloadFile(content, filename, mimeType);
                break;
        }
    }

    generatePDFContent() {
        return `
            <html>
            <head>
                <title>Gallup StrengthsFinder Ergebnisse</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .talent-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                    .rank { font-weight: bold; color: #6366f1; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Gallup StrengthsFinder Ergebnisse</h1>
                    <p>Generiert am: ${new Date().toLocaleDateString('de-DE')}</p>
                </div>
                
                <h2>Deine Top 5 Talente</h2>
                ${this.top5Talents.map((talent, index) => `
                    <div class="talent-item">
                        <h3><span class="rank">#${index + 1}</span> ${talent.name}</h3>
                        <p><strong>Score:</strong> ${talent.score}</p>
                        <p><strong>Beschreibung:</strong> ${talent.definition.description}</p>
                        <p><strong>Stärken:</strong> ${talent.definition.strengths.join(', ')}</p>
                        <p><strong>Herausforderungen:</strong> ${talent.definition.challenges.join(', ')}</p>
                    </div>
                `).join('')}
            </body>
            </html>
        `;
    }

    generateCSVContent() {
        let csv = 'Talent,Rank,Score,Category,Description\n';
        this.top5Talents.forEach((talent, index) => {
            csv += `"${talent.name}",${index + 1},${talent.score},"${talent.definition.category}","${talent.definition.description}"\n`;
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
    console.log('DOM Content Loaded - Starting Gallup StrengthsFinder Assessment');
    try {
        window.gallupAssessment = new GallupStrengthsAssessment();
        console.log('Gallup Assessment instance created:', window.gallupAssessment);
        
        // Additional safety check to ensure step 1 is visible
        setTimeout(() => {
            const step1 = document.querySelector('[data-step="1"]');
            if (step1 && !step1.classList.contains('active')) {
                step1.classList.add('active');
                step1.style.display = 'block';
                console.log('Emergency activation of step 1');
            }
        }, 500);
        
    } catch (error) {
        console.error('Error initializing Gallup Assessment:', error);
    }
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    console.log('DOM already loaded - Starting Gallup StrengthsFinder Assessment immediately');
    try {
        window.gallupAssessment = new GallupStrengthsAssessment();
        console.log('Gallup Assessment instance created (fallback):', window.gallupAssessment);
        
        // Additional safety check to ensure step 1 is visible
        setTimeout(() => {
            const step1 = document.querySelector('[data-step="1"]');
            if (step1 && !step1.classList.contains('active')) {
                step1.classList.add('active');
                step1.style.display = 'block';
                console.log('Emergency activation of step 1 (fallback)');
            }
        }, 500);
        
    } catch (error) {
        console.error('Error initializing Gallup Assessment (fallback):', error);
    }
}
