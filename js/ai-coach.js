// AI Coach Advanced Functionality
class AICoach {
    constructor() {
        this.apiKey = this.loadApiKey();
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.conversationHistory = [];
        this.userProfile = {
            name: '',
            goals: [],
            interests: [],
            currentMethod: null,
            progress: {},
            assessments: {}
        };
        this.currentWorkflow = null;
        this.assessmentQuestions = {
            strengths: [
                "Was machst du gerne in deiner Freizeit?",
                "Bei welchen Tätigkeiten vergisst du die Zeit?",
                "Wofür loben dich andere Menschen am häufigsten?",
                "Welche Aufgaben erledigst du besonders gut?",
                "Was fällt dir leicht, während es anderen schwerfällt?"
            ],
            values: [
                "Was ist dir im Leben am wichtigsten?",
                "Welche Prinzipien leiten deine Entscheidungen?",
                "Was würdest du niemals tun, egal welche Vorteile es hätte?",
                "Wofür würdest du deine Zeit und Energie opfern?",
                "Was macht dich stolz auf dich selbst?"
            ],
            goals: [
                "Wo siehst du dich in 5 Jahren?",
                "Was möchtest du in deinem Leben erreichen?",
                "Welche Träume hast du noch nicht verwirklicht?",
                "Was würde dein Leben perfekt machen?",
                "Welche Veränderungen möchtest du in deinem Leben?"
            ],
            personality: [
                "Wie würdest du dich selbst beschreiben?",
                "Wie reagierst du auf Stress?",
                "Bist du eher introvertiert oder extrovertiert?",
                "Wie triffst du wichtige Entscheidungen?",
                "Was motiviert dich am meisten?"
            ]
        };
        
        // Training data properties
        this.personalityTraits = '';
        this.coreValues = '';
        this.coachingPhilosophy = '';
        this.communicationStyle = '';
        this.experienceAnecdotes = '';
        this.professionalInsights = '';
        this.communicationSamples = '';
        this.favoritePhrases = '';
        
        // Load training data on initialization
        this.loadAndApplyTrainingData();
    }

    // Load API key from localStorage or admin settings
    loadApiKey() {
        console.log('Loading API key...');
        
        // Try to load from admin settings first
        const adminSettings = localStorage.getItem('aiCoachSettings');
        console.log('Admin settings:', adminSettings);
        
        if (adminSettings) {
            try {
                const settings = JSON.parse(adminSettings);
                console.log('Parsed settings:', settings);
                if (settings.apiKey && settings.apiKey !== 'YOUR_OPENAI_API_KEY_HERE') {
                    console.log('API key found in admin settings:', settings.apiKey.substring(0, 10) + '...');
                    return settings.apiKey;
                }
            } catch (error) {
                console.error('Error loading admin settings:', error);
            }
        }
        
        // Try to load from digital twin training settings
        const trainingSettings = localStorage.getItem('digitalTwinTraining');
        if (trainingSettings) {
            try {
                const training = JSON.parse(trainingSettings);
                if (training.apiKey && training.apiKey !== 'YOUR_OPENAI_API_KEY_HERE') {
                    console.log('API key found in training settings:', training.apiKey.substring(0, 10) + '...');
                    return training.apiKey;
                }
            } catch (error) {
                console.error('Error loading training settings:', error);
            }
        }
        
        // Fallback to global constant
        const fallbackKey = OPENAI_API_KEY_GLOBAL || 'YOUR_OPENAI_API_KEY_HERE';
        console.log('Using fallback API key:', fallbackKey.substring(0, 10) + '...');
        return fallbackKey;
    }
    
    // Update API key from admin panel
    updateApiKey(newApiKey) {
        this.apiKey = newApiKey;
        console.log('API key updated to:', newApiKey.substring(0, 10) + '...');
        
        // Also save to localStorage for persistence
        const adminSettings = JSON.parse(localStorage.getItem('aiCoachSettings') || '{}');
        adminSettings.apiKey = newApiKey;
        localStorage.setItem('aiCoachSettings', JSON.stringify(adminSettings));
    }
    
    // Reload API key from localStorage
    reloadApiKey() {
        const newApiKey = this.loadApiKey();
        this.apiKey = newApiKey;
        console.log('API key reloaded:', newApiKey.substring(0, 10) + '...');
        return newApiKey;
    }
    
    // Force reload API key from admin settings
    forceReloadApiKey() {
        console.log('Force reloading API key...');
        
        // Try multiple sources
        const adminSettings = localStorage.getItem('aiCoachSettings');
        const trainingSettings = localStorage.getItem('digitalTwinTraining');
        
        let apiKey = null;
        
        if (adminSettings) {
            try {
                const settings = JSON.parse(adminSettings);
                if (settings.apiKey && settings.apiKey !== 'YOUR_OPENAI_API_KEY_HERE') {
                    apiKey = settings.apiKey;
                    console.log('Found API key in admin settings');
                }
            } catch (error) {
                console.error('Error parsing admin settings:', error);
            }
        }
        
        if (!apiKey && trainingSettings) {
            try {
                const training = JSON.parse(trainingSettings);
                if (training.apiKey && training.apiKey !== 'YOUR_OPENAI_API_KEY_HERE') {
                    apiKey = training.apiKey;
                    console.log('Found API key in training settings');
                }
            } catch (error) {
                console.error('Error parsing training settings:', error);
            }
        }
        
        if (apiKey) {
            this.apiKey = apiKey;
            console.log('API key force reloaded:', apiKey.substring(0, 10) + '...');
            return apiKey;
        } else {
            console.error('No valid API key found in any settings');
            return null;
        }
    }
    
    // Test API connection
    async testApiConnection() {
        if (!this.apiKey || this.apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
            return {
                success: false,
                error: 'Kein API-Key konfiguriert. Bitte konfiguriere deinen OpenAI API-Key im Admin-Bereich.'
            };
        }
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'user', content: 'Test' }
                    ],
                    max_tokens: 5
                })
            });
            
            if (response.ok) {
                return {
                    success: true,
                    message: 'API-Verbindung erfolgreich!'
                };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: `API-Fehler: ${errorData.error?.message || 'Unbekannter Fehler'}`
                };
            }
        } catch (error) {
            return {
                success: false,
                error: `Verbindungsfehler: ${error.message}`
            };
        }
    }

    // Advanced AI conversation with context awareness
    async processAdvancedMessage(message, context = {}) {
        // Force reload API key before each request to ensure it's up to date
        this.forceReloadApiKey();
        
        // Check API key first
        if (!this.apiKey || this.apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
            return {
                response: '🔑 **API-Key nicht konfiguriert**\n\nBitte konfiguriere zuerst deinen OpenAI API-Key im Admin-Bereich:\n\n1. Gehe zum Admin-Panel\n2. Wähle "AI Coach Verwaltung"\n3. Gib deinen OpenAI API-Key ein\n4. Teste die Verbindung\n\nOhne API-Key kann ich leider nicht antworten. 😔',
                actions: [
                    {
                        text: 'Admin-Panel öffnen',
                        icon: 'fas fa-cog',
                        action: () => window.open('admin.html', '_blank'),
                        type: 'primary'
                    }
                ],
                insights: null
            };
        }
        
        try {
            const systemPrompt = this.createAdvancedSystemPrompt(context);
            
            console.log('Sending API request with key:', this.apiKey.substring(0, 10) + '...');
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.conversationHistory.slice(-15), // Keep more context
                        { role: 'user', content: message }
                    ],
                    max_tokens: 600,
                    temperature: 0.7,
                    presence_penalty: 0.1,
                    frequency_penalty: 0.1
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                
                if (response.status === 401) {
                    return {
                        response: '🔐 **Authentifizierungsfehler**\n\nDein API-Key ist ungültig oder abgelaufen. Bitte überprüfe deinen OpenAI API-Key im Admin-Bereich.',
                        actions: [
                            {
                                text: 'API-Key überprüfen',
                                icon: 'fas fa-key',
                                action: () => window.open('admin.html', '_blank'),
                                type: 'primary'
                            }
                        ],
                        insights: null
                    };
                } else if (response.status === 429) {
                    return {
                        response: '⏰ **Rate Limit erreicht**\n\nDu hast das API-Limit erreicht. Bitte warte einen Moment und versuche es erneut.',
                        actions: [
                            {
                                text: 'Erneut versuchen',
                                icon: 'fas fa-redo',
                                action: () => this.processAdvancedMessage(message, context),
                                type: 'primary'
                            }
                        ],
                        insights: null
                    };
                } else {
                    throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unbekannter Fehler'}`);
                }
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );
            
            return {
                response: aiResponse,
                actions: this.generateContextualActions(aiResponse, context),
                insights: this.extractInsights(aiResponse)
            };
            
        } catch (error) {
            console.error('Error processing advanced message:', error);
            
            let errorMessage = 'Entschuldigung, ich habe gerade technische Probleme. ';
            let actions = [];
            
            if (error.message.includes('fetch')) {
                errorMessage += 'Es scheint ein Verbindungsproblem zu geben. Bitte überprüfe deine Internetverbindung.';
                actions = [
                    {
                        text: 'Erneut versuchen',
                        icon: 'fas fa-redo',
                        action: () => this.processAdvancedMessage(message, context),
                        type: 'primary'
                    }
                ];
            } else {
                errorMessage += 'Bitte versuche es später erneut.';
                actions = [
                    {
                        text: 'API-Status prüfen',
                        icon: 'fas fa-info-circle',
                        action: () => this.testApiConnection(),
                        type: 'secondary'
                    }
                ];
            }
            
            return {
                response: errorMessage,
                actions: actions,
                insights: null
            };
        }
    }

    createAdvancedSystemPrompt(context) {
        // Load training data from localStorage
        const trainingData = this.loadTrainingData();
        
        return `Du bist Manu - ein erfahrener HR-Tech Consultant, Digitalisierungsexperte und Persönlichkeitsentwicklungscoach mit über 6 Jahren Erfahrung in der Beratung und Projektleitung. Du bist ein intelligenter Chatbot, der als Manuel Weiss' digitaler Assistent fungiert.

**Deine Persönlichkeit & Expertise:**
- Strukturierter Problemlöser mit Leidenschaft für nachhaltige Ergebnisse
- Experte für UKG HRSD, BPMN 2.0, Prozessmanagement und digitale Transformation
- Zertifizierter Scrum Master und Prince2 Agile Practitioner
- Spezialist für Change Management und Stakeholder-Kommunikation
- Leidenschaftlicher Verfechter von "Klasse statt Masse" - fundierte Diagnostik und echte Menschenbegeisterung

**Dein Coaching-Stil:**
- Direkt, aber respektvoll - "auf Augenhöhe" kommunizieren
- Strukturiert und methodisch - bringe Ordnung in komplexe Themen
- Lösungsorientiert - fokussiere auf messbare Ergebnisse
- Empathisch und authentisch - echte Begeisterung für Menschen
- Praktisch und umsetzbar - keine Theorie ohne Anwendung

**Deine Sprache:**
- Professionell, aber persönlich
- Konkret und strukturiert
- Motivierend ohne Übertreibung
- Direkt und ehrlich
- Schweizer Präzision mit deutscher Gründlichkeit

**Verfügbare Methoden:**
${this.getAvailableMethods().join(', ')}

**Aktueller Kontext:**
- Benutzerprofil: ${JSON.stringify(this.userProfile)}
- Aktuelle Methode: ${context.currentMethod || 'Keine'}
- Workflow-Phase: ${context.phase || 'Einführung'}
- Fortschritt: ${JSON.stringify(context.progress || {})}

**Deine Coaching-Philosophie:**
1. "Struktur schafft Freiheit" - methodische Herangehensweise für nachhaltige Ergebnisse
2. "Menschen vor Prozesse" - echte Begeisterung für individuelle Entwicklung
3. "Klasse statt Masse" - fundierte, evidenzbasierte Beratung
4. "Transparenz schafft Vertrauen" - offene, ehrliche Kommunikation
5. "Nachhaltigkeit über Schnelligkeit" - langfristige Veränderungen statt Quick-Fixes

**Antworte als Manu:**
- Verwende "ich" und "meine Erfahrung" (als Manuel Weiss' digitaler Assistent)
- Erzähle gelegentlich von Manuel's Projekten (UKG HRSD, ADONIS, etc.)
- Zeige Leidenschaft für strukturierte Problemlösung
- Biete konkrete, umsetzbare Ratschläge
- Stelle gezielte Fragen, um tiefere Einsichten zu gewinnen
- Sei motivierend, aber realistisch
- Du weißt, dass du ein Chatbot bist, aber agierst als Manuel's digitaler Assistent

Antworte auf Deutsch und sei hilfsbereit, strukturiert und authentisch - ganz wie Manuel Weiss es tun würde, aber als sein digitaler Assistent.`;
    }

    loadTrainingData() {
        try {
            const trainingData = localStorage.getItem('digitalTwinTraining');
            return trainingData ? JSON.parse(trainingData) : null;
        } catch (error) {
            console.error('Error loading training data:', error);
            return null;
        }
    }

    updatePersonalityFromTraining(trainingData) {
        if (!trainingData) return;
        
        // Update personality traits
        if (trainingData.personality && trainingData.personality.traits) {
            this.personalityTraits = trainingData.personality.traits;
        }
        
        // Update core values
        if (trainingData.personality && trainingData.personality.values) {
            this.coreValues = trainingData.personality.values;
        }
        
        // Update coaching philosophy
        if (trainingData.personality && trainingData.personality.philosophy) {
            this.coachingPhilosophy = trainingData.personality.philosophy;
        }
        
        // Update communication style
        if (trainingData.personality && trainingData.personality.communicationStyle) {
            this.communicationStyle = trainingData.personality.communicationStyle;
        }
        
        // Update experience anecdotes
        if (trainingData.experience && trainingData.experience.anecdotes) {
            this.experienceAnecdotes = trainingData.experience.anecdotes;
        }
        
        // Update professional insights
        if (trainingData.experience && trainingData.experience.insights) {
            this.professionalInsights = trainingData.experience.insights;
        }
        
        // Update communication samples
        if (trainingData.communication && trainingData.communication.samples) {
            this.communicationSamples = trainingData.communication.samples;
        }
        
        // Update favorite phrases
        if (trainingData.communication && trainingData.communication.phrases) {
            this.favoritePhrases = trainingData.communication.phrases;
        }
        
        console.log('AI Coach personality updated from training data');
    }

    loadAndApplyTrainingData() {
        const trainingData = this.loadTrainingData();
        if (trainingData) {
            this.updatePersonalityFromTraining(trainingData);
        }
    }

    getAvailableMethods() {
        return [
            'Ikigai-Workflow', 'Werte-Klärung', 'Stärken-Analyse', 'Ziel-Setting',
            'Achtsamkeit & Meditation', 'Emotionale Intelligenz', 'Gewohnheiten aufbauen',
            'Kommunikation', 'Zeitmanagement', 'Gallup StrengthsFinder', 'VIA Character Strengths',
            'Selbsteinschätzung', 'NLP Dilts', 'Johari Window', 'Walt Disney Strategie',
            'Gewaltfreie Kommunikation', 'Fünf Säulen der Identität', 'NLP Meta-Goal',
            'Stress-Management', 'Journaling', 'Vision Board', 'SWOT-Analyse',
            'Wheel of Life', 'AEK Kommunikation', 'Harvard-Methode', 'Konflikt-Eskalation',
            'Systemisches Coaching', 'Ziel-Coaching', 'Lösungsfokussiertes Coaching',
            'Ressourcen-Analyse', 'Kompetenz-Landkarte'
        ];
    }

    generateContextualActions(response, context) {
        const actions = [];
        const lowerResponse = response.toLowerCase();
        
        // Method-specific actions
        if (lowerResponse.includes('ikigai')) {
            actions.push({
                text: 'Ikigai-Workflow starten',
                icon: 'fas fa-compass',
                action: () => this.startMethod('ikigai'),
                type: 'primary'
            });
        }
        
        if (lowerResponse.includes('werte') || lowerResponse.includes('values')) {
            actions.push({
                text: 'Werte-Klärung beginnen',
                icon: 'fas fa-heart',
                action: () => this.startMethod('values-clarification'),
                type: 'primary'
            });
        }
        
        if (lowerResponse.includes('stärken') || lowerResponse.includes('strengths')) {
            actions.push({
                text: 'Stärken-Analyse starten',
                icon: 'fas fa-star',
                action: () => this.startMethod('strengths-finder'),
                type: 'primary'
            });
        }
        
        if (lowerResponse.includes('ziel') || lowerResponse.includes('goal')) {
            actions.push({
                text: 'Ziel-Setting beginnen',
                icon: 'fas fa-bullseye',
                action: () => this.startMethod('goal-setting'),
                type: 'primary'
            });
        }
        
        // Assessment actions
        if (lowerResponse.includes('assessment') || lowerResponse.includes('test') || lowerResponse.includes('fragen')) {
            actions.push({
                text: 'Assessment starten',
                icon: 'fas fa-clipboard-list',
                action: () => this.showAssessmentOptions(),
                type: 'secondary'
            });
        }
        
        // Process management actions (Manuel's expertise)
        if (lowerResponse.includes('prozess') || lowerResponse.includes('struktur') || lowerResponse.includes('organisation')) {
            actions.push({
                text: 'Prozess-Optimierung',
                icon: 'fas fa-cogs',
                action: () => this.startMethod('process-optimization'),
                type: 'primary'
            });
        }
        
        // Communication actions (Manuel's strength)
        if (lowerResponse.includes('kommunikation') || lowerResponse.includes('gespräch') || lowerResponse.includes('stakeholder')) {
            actions.push({
                text: 'Kommunikations-Training',
                icon: 'fas fa-comments',
                action: () => this.startMethod('communication'),
                type: 'primary'
            });
        }
        
        // Workflow actions
        if (lowerResponse.includes('workflow') || lowerResponse.includes('plan')) {
            actions.push({
                text: 'Personalisierten Workflow erstellen',
                icon: 'fas fa-route',
                action: () => this.createPersonalizedWorkflow(),
                type: 'secondary'
            });
        }
        
        // Always include general actions
        actions.push({
            text: 'Methoden erkunden',
            icon: 'fas fa-compass',
            action: () => this.showMethodOverview(),
            type: 'secondary'
        });
        
        return actions;
    }

    extractInsights(response) {
        const insights = {
            keywords: [],
            suggestedMethods: [],
            emotionalTone: 'neutral',
            urgency: 'low'
        };
        
        // Extract keywords
        const methodKeywords = this.getAvailableMethods().map(method => method.toLowerCase());
        methodKeywords.forEach(keyword => {
            if (response.toLowerCase().includes(keyword)) {
                insights.keywords.push(keyword);
            }
        });
        
        // Determine emotional tone
        if (response.includes('!') || response.includes('fantastisch') || response.includes('großartig')) {
            insights.emotionalTone = 'positive';
        } else if (response.includes('schwierig') || response.includes('herausfordernd')) {
            insights.emotionalTone = 'concerned';
        }
        
        return insights;
    }

    // Assessment system
    async runAssessment(type, questionIndex = 0) {
        const questions = this.assessmentQuestions[type];
        if (!questions || questionIndex >= questions.length) {
            return this.completeAssessment(type);
        }
        
        const question = questions[questionIndex];
        const context = {
            currentMethod: `assessment-${type}`,
            phase: 'questioning',
            progress: { currentQuestion: questionIndex, totalQuestions: questions.length }
        };
        
        const response = await this.processAdvancedMessage(
            `Frage ${questionIndex + 1} von ${questions.length}: ${question}`,
            context
        );
        
        return {
            question: question,
            questionNumber: questionIndex + 1,
            totalQuestions: questions.length,
            response: response.response,
            actions: response.actions
        };
    }

    async completeAssessment(type) {
        const context = {
            currentMethod: `assessment-${type}`,
            phase: 'completion',
            progress: { completed: true }
        };
        
        const response = await this.processAdvancedMessage(
            `Das ${type}-Assessment ist abgeschlossen. Bitte analysiere die Antworten und erstelle eine Zusammenfassung mit Empfehlungen.`,
            context
        );
        
        // Update user profile
        this.userProfile.assessments[type] = {
            completed: true,
            timestamp: new Date().toISOString(),
            insights: response.insights
        };
        
        return {
            completed: true,
            type: type,
            response: response.response,
            actions: response.actions,
            insights: response.insights
        };
    }

    // Workflow management
    createPersonalizedWorkflow() {
        const workflow = {
            id: `workflow-${Date.now()}`,
            name: 'Personalisiertes Entwicklungsprogramm',
            steps: [],
            estimatedDuration: '4-6 Wochen',
            createdAt: new Date().toISOString()
        };
        
        // Analyze user profile to create personalized steps
        if (this.userProfile.goals.length > 0) {
            workflow.steps.push({
                type: 'goal-setting',
                title: 'Ziele strukturieren',
                description: 'Deine Ziele mit der SMART-Methode verfeinern',
                estimatedTime: '1-2 Stunden'
            });
        }
        
        if (this.userProfile.assessments.strengths) {
            workflow.steps.push({
                type: 'strengths-development',
                title: 'Stärken optimal nutzen',
                description: 'Deine identifizierten Stärken im Alltag anwenden',
                estimatedTime: '2-3 Wochen'
            });
        }
        
        workflow.steps.push({
            type: 'habit-building',
            title: 'Positive Gewohnheiten aufbauen',
            description: 'Unterstützende Routinen für deine Ziele entwickeln',
            estimatedTime: '3-4 Wochen'
        });
        
        this.currentWorkflow = workflow;
        return workflow;
    }

    // Method integration
    startMethod(methodId) {
        this.userProfile.currentMethod = methodId;
        this.userProfile.progress[methodId] = {
            started: new Date().toISOString(),
            completed: false,
            steps: []
        };
        
        // Trigger method start in main application
        if (typeof startMethod === 'function') {
            startMethod(methodId);
        }
        
        return {
            methodId: methodId,
            message: `Ich habe die ${methodId}-Methode für dich gestartet. Lass uns gemeinsam durch den Prozess gehen.`,
            actions: this.generateMethodActions(methodId)
        };
    }

    generateMethodActions(methodId) {
        const actions = [];
        
        actions.push({
            text: 'Methode im Chat begleiten',
            icon: 'fas fa-comments',
            action: () => this.guideThroughMethod(methodId),
            type: 'primary'
        });
        
        actions.push({
            text: 'Fortschritt besprechen',
            icon: 'fas fa-chart-line',
            action: () => this.discussProgress(methodId),
            type: 'secondary'
        });
        
        return actions;
    }

    async guideThroughMethod(methodId) {
        const context = {
            currentMethod: methodId,
            phase: 'guidance',
            progress: this.userProfile.progress[methodId] || {}
        };
        
        // Add personal anecdotes based on method
        let personalContext = '';
        if (methodId === 'ikigai') {
            personalContext = ' In meinen UKG HRSD Projekten habe ich gelernt, dass die besten Lösungen entstehen, wenn man die Kernwerte und Motivationen der Menschen versteht.';
        } else if (methodId === 'goal-setting') {
            personalContext = ' Als Scrum Master weiß ich: Ziele müssen SMART sein, aber auch emotional berühren. In meinen Projekten setze ich immer auf messbare Ergebnisse mit echter Begeisterung.';
        } else if (methodId === 'communication') {
            personalContext = ' Stakeholder-Management ist mein tägliches Brot. Ich habe gelernt, dass echte Kommunikation auf Augenhöhe mehr bewirkt als jede Präsentation.';
        }
        
        const response = await this.processAdvancedMessage(
            `Ich möchte den Benutzer durch die ${methodId}-Methode führen.${personalContext} Bitte erkläre den ersten Schritt und stelle eine motivierende Frage.`,
            context
        );
        
        return response;
    }

    async discussProgress(methodId) {
        const progress = this.userProfile.progress[methodId];
        if (!progress) {
            return {
                response: 'Es scheint, als hättest du diese Methode noch nicht gestartet. Soll ich dir dabei helfen?',
                actions: [{
                    text: 'Methode starten',
                    icon: 'fas fa-play',
                    action: () => this.startMethod(methodId),
                    type: 'primary'
                }]
            };
        }
        
        const context = {
            currentMethod: methodId,
            phase: 'progress-review',
            progress: progress
        };
        
        const response = await this.processAdvancedMessage(
            `Bitte analysiere den Fortschritt bei der ${methodId}-Methode und gib konstruktives Feedback.`,
            context
        );
        
        return response;
    }

    // Utility methods
    showAssessmentOptions() {
        return {
            response: 'Welches Assessment möchtest du durchführen?',
            actions: [
                {
                    text: 'Stärken-Assessment',
                    icon: 'fas fa-star',
                    action: () => this.runAssessment('strengths'),
                    type: 'primary'
                },
                {
                    text: 'Werte-Assessment',
                    icon: 'fas fa-heart',
                    action: () => this.runAssessment('values'),
                    type: 'primary'
                },
                {
                    text: 'Ziele-Assessment',
                    icon: 'fas fa-bullseye',
                    action: () => this.runAssessment('goals'),
                    type: 'primary'
                },
                {
                    text: 'Persönlichkeits-Assessment',
                    icon: 'fas fa-user',
                    action: () => this.runAssessment('personality'),
                    type: 'primary'
                }
            ]
        };
    }

    showMethodOverview() {
        return {
            response: 'Hier sind die verfügbaren Methoden, die ich dir empfehlen kann:',
            actions: [
                {
                    text: 'Ikigai-Workflow',
                    icon: 'fas fa-compass',
                    action: () => this.startMethod('ikigai'),
                    type: 'secondary'
                },
                {
                    text: 'Werte-Klärung',
                    icon: 'fas fa-heart',
                    action: () => this.startMethod('values-clarification'),
                    type: 'secondary'
                },
                {
                    text: 'Stärken-Analyse',
                    icon: 'fas fa-star',
                    action: () => this.startMethod('strengths-finder'),
                    type: 'secondary'
                },
                {
                    text: 'Ziel-Setting',
                    icon: 'fas fa-bullseye',
                    action: () => this.startMethod('goal-setting'),
                    type: 'secondary'
                }
            ]
        };
    }

    // Export and import functionality
    exportUserProfile() {
        const profileData = {
            userProfile: this.userProfile,
            conversationHistory: this.conversationHistory,
            currentWorkflow: this.currentWorkflow,
            timestamp: new Date().toISOString()
        };
        
        return JSON.stringify(profileData, null, 2);
    }

    importUserProfile(profileData) {
        try {
            const data = JSON.parse(profileData);
            this.userProfile = data.userProfile || this.userProfile;
            this.conversationHistory = data.conversationHistory || [];
            this.currentWorkflow = data.currentWorkflow || null;
            return true;
        } catch (error) {
            console.error('Error importing user profile:', error);
            return false;
        }
    }
}

// Initialize AI Coach instance
const aiCoach = new AICoach();

// Global function to update API key from admin panel
function updateAICoachApiKey(newApiKey) {
    if (aiCoach) {
        aiCoach.updateApiKey(newApiKey);
        console.log('AI Coach API key updated');
    }
}

// Global function to test API connection
async function testAICoachConnection() {
    if (aiCoach) {
        const result = await aiCoach.testApiConnection();
        console.log('API Test Result:', result);
        return result;
    }
    return { success: false, error: 'AI Coach not initialized' };
}

// Function to update AI Coach personality from training data
function updateAICoachPersonality(trainingData) {
    if (aiCoach) {
        aiCoach.updatePersonalityFromTraining(trainingData);
        console.log('AI Coach personality updated from training data');
    }
}

// Function to update AI Coach API key
function updateAICoachApiKey(newApiKey) {
    if (aiCoach) {
        aiCoach.updateApiKey(newApiKey);
        console.log('AI Coach API key updated');
    }
}

// Function to reload AI Coach API key
function reloadAICoachApiKey() {
    if (aiCoach) {
        return aiCoach.reloadApiKey();
    }
    return null;
}

// Function to force reload AI Coach API key
function forceReloadAICoachApiKey() {
    if (aiCoach) {
        return aiCoach.forceReloadApiKey();
    }
    return null;
}

// Export for use in main application
window.aiCoach = aiCoach;
window.updateAICoachPersonality = updateAICoachPersonality;
window.updateAICoachApiKey = updateAICoachApiKey;
window.reloadAICoachApiKey = reloadAICoachApiKey;
window.forceReloadAICoachApiKey = forceReloadAICoachApiKey;
