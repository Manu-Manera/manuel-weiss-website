// Multilingual Personality Development Methods
// Supports German (de), English (en), French (fr), Spanish (es)

class PersonalityMethodsMultilingual {
    constructor() {
        this.currentLanguage = window.translationManager?.getCurrentLanguage() || 'en';
        this.methods = {};
        this.init();
    }
    
    async init() {
        await this.loadMethods();
        this.createMethodsInterface();
    }
    
    async loadMethods() {
        // Load personality development methods for all languages
        this.methods = {
            'de': {
                'title': 'Persönlichkeitsentwicklungsmethoden',
                'subtitle': 'Entwickle dich kontinuierlich weiter mit bewährten Methoden',
                'methods': {
                    'ikigai': {
                        'name': 'Ikigai - Lebenszweck finden',
                        'description': 'Entdecke deinen Lebenszweck durch die Verbindung von Leidenschaft, Mission, Beruf und Berufung',
                        'steps': [
                            'Was du liebst',
                            'Was du gut kannst',
                            'Was die Welt braucht',
                            'Wofür du bezahlt wirst'
                        ]
                    },
                    'swot': {
                        'name': 'SWOT-Analyse',
                        'description': 'Analysiere deine Stärken, Schwächen, Chancen und Bedrohungen',
                        'steps': [
                            'Stärken identifizieren',
                            'Schwächen erkennen',
                            'Chancen finden',
                            'Bedrohungen bewerten'
                        ]
                    },
                    'wheel_of_life': {
                        'name': 'Rad des Lebens',
                        'description': 'Bewerte verschiedene Lebensbereiche und finde Verbesserungsmöglichkeiten',
                        'steps': [
                            'Lebensbereiche definieren',
                            'Aktuelle Situation bewerten',
                            'Ziele setzen',
                            'Aktionsplan erstellen'
                        ]
                    },
                    'johari_window': {
                        'name': 'Johari-Fenster',
                        'description': 'Erweitere dein Selbstbewusstsein durch Feedback von anderen',
                        'steps': [
                            'Selbstbild reflektieren',
                            'Fremdbild einholen',
                            'Blinde Flecken entdecken',
                            'Verborgene Talente freilegen'
                        ]
                    },
                    'values_clarification': {
                        'name': 'Werteklärung',
                        'description': 'Identifiziere deine wichtigsten Werte und lebe danach',
                        'steps': [
                            'Werte auflisten',
                            'Prioritäten setzen',
                            'Wertekonflikte lösen',
                            'Lebensentscheidungen treffen'
                        ]
                    }
                }
            },
            'en': {
                'title': 'Personality Development Methods',
                'subtitle': 'Continuously develop yourself with proven methods',
                'methods': {
                    'ikigai': {
                        'name': 'Ikigai - Find Your Life Purpose',
                        'description': 'Discover your life purpose through the connection of passion, mission, profession, and vocation',
                        'steps': [
                            'What you love',
                            'What you\'re good at',
                            'What the world needs',
                            'What you can be paid for'
                        ]
                    },
                    'swot': {
                        'name': 'SWOT Analysis',
                        'description': 'Analyze your strengths, weaknesses, opportunities, and threats',
                        'steps': [
                            'Identify strengths',
                            'Recognize weaknesses',
                            'Find opportunities',
                            'Assess threats'
                        ]
                    },
                    'wheel_of_life': {
                        'name': 'Wheel of Life',
                        'description': 'Evaluate different life areas and find improvement opportunities',
                        'steps': [
                            'Define life areas',
                            'Assess current situation',
                            'Set goals',
                            'Create action plan'
                        ]
                    },
                    'johari_window': {
                        'name': 'Johari Window',
                        'description': 'Expand your self-awareness through feedback from others',
                        'steps': [
                            'Reflect on self-image',
                            'Gather external feedback',
                            'Discover blind spots',
                            'Uncover hidden talents'
                        ]
                    },
                    'values_clarification': {
                        'name': 'Values Clarification',
                        'description': 'Identify your most important values and live by them',
                        'steps': [
                            'List values',
                            'Set priorities',
                            'Resolve value conflicts',
                            'Make life decisions'
                        ]
                    }
                }
            },
            'fr': {
                'title': 'Méthodes de Développement Personnel',
                'subtitle': 'Développez-vous continuellement avec des méthodes éprouvées',
                'methods': {
                    'ikigai': {
                        'name': 'Ikigai - Trouvez votre raison d\'être',
                        'description': 'Découvrez votre raison d\'être à travers la connexion de passion, mission, profession et vocation',
                        'steps': [
                            'Ce que vous aimez',
                            'Ce en quoi vous êtes doué',
                            'Ce dont le monde a besoin',
                            'Ce pour quoi vous pouvez être payé'
                        ]
                    },
                    'swot': {
                        'name': 'Analyse SWOT',
                        'description': 'Analysez vos forces, faiblesses, opportunités et menaces',
                        'steps': [
                            'Identifier les forces',
                            'Reconnaître les faiblesses',
                            'Trouver les opportunités',
                            'Évaluer les menaces'
                        ]
                    },
                    'wheel_of_life': {
                        'name': 'Roue de la Vie',
                        'description': 'Évaluez différents domaines de vie et trouvez des opportunités d\'amélioration',
                        'steps': [
                            'Définir les domaines de vie',
                            'Évaluer la situation actuelle',
                            'Fixer des objectifs',
                            'Créer un plan d\'action'
                        ]
                    },
                    'johari_window': {
                        'name': 'Fenêtre de Johari',
                        'description': 'Élargissez votre conscience de soi grâce aux commentaires des autres',
                        'steps': [
                            'Réfléchir sur l\'image de soi',
                            'Recueillir des commentaires externes',
                            'Découvrir les angles morts',
                            'Révéler les talents cachés'
                        ]
                    },
                    'values_clarification': {
                        'name': 'Clarification des Valeurs',
                        'description': 'Identifiez vos valeurs les plus importantes et vivez selon elles',
                        'steps': [
                            'Lister les valeurs',
                            'Définir les priorités',
                            'Résoudre les conflits de valeurs',
                            'Prendre des décisions de vie'
                        ]
                    }
                }
            },
            'es': {
                'title': 'Métodos de Desarrollo Personal',
                'subtitle': 'Desarróllate continuamente con métodos probados',
                'methods': {
                    'ikigai': {
                        'name': 'Ikigai - Encuentra tu Propósito de Vida',
                        'description': 'Descubre tu propósito de vida a través de la conexión de pasión, misión, profesión y vocación',
                        'steps': [
                            'Lo que amas',
                            'Lo que se te da bien',
                            'Lo que el mundo necesita',
                            'Por lo que te pueden pagar'
                        ]
                    },
                    'swot': {
                        'name': 'Análisis SWOT',
                        'description': 'Analiza tus fortalezas, debilidades, oportunidades y amenazas',
                        'steps': [
                            'Identificar fortalezas',
                            'Reconocer debilidades',
                            'Encontrar oportunidades',
                            'Evaluar amenazas'
                        ]
                    },
                    'wheel_of_life': {
                        'name': 'Rueda de la Vida',
                        'description': 'Evalúa diferentes áreas de vida y encuentra oportunidades de mejora',
                        'steps': [
                            'Definir áreas de vida',
                            'Evaluar situación actual',
                            'Establecer objetivos',
                            'Crear plan de acción'
                        ]
                    },
                    'johari_window': {
                        'name': 'Ventana de Johari',
                        'description': 'Expande tu autoconciencia a través de comentarios de otros',
                        'steps': [
                            'Reflexionar sobre autoimagen',
                            'Recopilar comentarios externos',
                            'Descubrir puntos ciegos',
                            'Revelar talentos ocultos'
                        ]
                    },
                    'values_clarification': {
                        'name': 'Clarificación de Valores',
                        'description': 'Identifica tus valores más importantes y vive según ellos',
                        'steps': [
                            'Listar valores',
                            'Establecer prioridades',
                            'Resolver conflictos de valores',
                            'Tomar decisiones de vida'
                        ]
                    }
                }
            }
        };
    }
    
    createMethodsInterface() {
        const container = document.createElement('div');
        container.id = 'personality-methods-multilingual';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        const currentMethods = this.methods[this.currentLanguage];
        
        container.innerHTML = `
            <div style="background: white; width: 90%; max-width: 1000px; height: 90%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; position: relative;">
                    <h2 style="margin: 0; font-size: 1.8rem;">🧠 ${currentMethods.title}</h2>
                    <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">${currentMethods.subtitle}</p>
                    <button onclick="window.personalityMethodsMultilingual.close()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <!-- Content -->
                <div style="flex: 1; padding: 2rem; overflow-y: auto;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                        ${Object.entries(currentMethods.methods).map(([key, method]) => `
                            <div style="background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 12px; padding: 2rem; transition: all 0.3s ease; cursor: pointer;" 
                                 onmouseover="this.style.borderColor='#667eea'; this.style.transform='translateY(-2px)'" 
                                 onmouseout="this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'"
                                 onclick="window.personalityMethodsMultilingual.startMethod('${key}')">
                                <h3 style="color: #374151; margin: 0 0 1rem 0; font-size: 1.3rem;">${method.name}</h3>
                                <p style="color: #6b7280; margin: 0 0 1.5rem 0; line-height: 1.6;">${method.description}</p>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <h4 style="color: #374151; margin: 0 0 0.5rem 0; font-size: 1rem;">Steps:</h4>
                                    <ul style="color: #6b7280; margin: 0; padding-left: 1.5rem; font-size: 0.9rem;">
                                        ${method.steps.map(step => `<li>${step}</li>`).join('')}
                                    </ul>
                                </div>
                                
                                <button style="width: 100%; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.3s ease;"
                                        onmouseover="this.style.background='#5a67d8'" 
                                        onmouseout="this.style.background='#667eea'">
                                    Start Method
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #f8fafc; padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; margin: 0; font-size: 0.9rem;">
                        Choose a method to start your personal development journey
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    startMethod(methodKey) {
        console.log(`Starting method: ${methodKey} in language: ${this.currentLanguage}`);
        
        // Close current interface
        this.close();
        
        // Start specific method based on key
        switch(methodKey) {
            case 'ikigai':
                if (this.currentLanguage === 'en') {
                    window.ikigaiWorkflowEN = new window.IkigaiWorkflowEN();
                } else {
                    // Start German or other language version
                    this.startIkigaiWorkflow();
                }
                break;
            case 'swot':
                this.startSWOTAnalysis();
                break;
            case 'wheel_of_life':
                this.startWheelOfLife();
                break;
            case 'johari_window':
                this.startJohariWindow();
                break;
            case 'values_clarification':
                this.startValuesClarification();
                break;
            default:
                alert('Method not yet implemented');
        }
    }
    
    startIkigaiWorkflow() {
        // Start Ikigai workflow in current language
        if (this.currentLanguage === 'en') {
            window.ikigaiWorkflowEN = new window.IkigaiWorkflowEN();
        } else {
            // For other languages, show a message that English version is available
            alert('Ikigai workflow is currently available in English. Would you like to start the English version?');
            if (confirm('Start English Ikigai workflow?')) {
                window.ikigaiWorkflowEN = new window.IkigaiWorkflowEN();
            }
        }
    }
    
    startSWOTAnalysis() {
        alert('SWOT Analysis method will be implemented soon!');
    }
    
    startWheelOfLife() {
        alert('Wheel of Life method will be implemented soon!');
    }
    
    startJohariWindow() {
        alert('Johari Window method will be implemented soon!');
    }
    
    startValuesClarification() {
        alert('Values Clarification method will be implemented soon!');
    }
    
    setLanguage(language) {
        this.currentLanguage = language;
        this.close();
        this.createMethodsInterface();
    }
    
    close() {
        const container = document.getElementById('personality-methods-multilingual');
        if (container) {
            container.remove();
        }
    }
}

// Make globally available
window.PersonalityMethodsMultilingual = PersonalityMethodsMultilingual;
