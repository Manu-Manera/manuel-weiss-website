// AI Coach Advanced Functionality
class AICoach {
    constructor() {
        this.apiKey = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with actual API key
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
    }

    // Advanced AI conversation with context awareness
    async processAdvancedMessage(message, context = {}) {
        try {
            const systemPrompt = this.createAdvancedSystemPrompt(context);
            
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
                throw new Error(`API request failed: ${response.status}`);
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
            return {
                response: 'Entschuldigung, ich habe gerade technische Probleme. Bitte versuche es später erneut.',
                actions: [],
                insights: null
            };
        }
    }

    createAdvancedSystemPrompt(context) {
        return `Du bist ein hochqualifizierter Persönlichkeitsentwicklungscoach mit tiefgreifendem Wissen in Psychologie, Coaching-Methoden und persönlicher Entwicklung. 

Deine Expertise umfasst:
- Klinische Psychologie und Verhaltensanalyse
- Positive Psychologie und Stärken-basierte Entwicklung
- Systemisches Coaching und NLP-Techniken
- Achtsamkeits- und Meditationstechniken
- Zielsetzung und Habit-Formation
- Emotionale Intelligenz und Kommunikation

Verfügbare Methoden und Tools:
${this.getAvailableMethods().join(', ')}

Aktueller Kontext:
- Benutzerprofil: ${JSON.stringify(this.userProfile)}
- Aktuelle Methode: ${context.currentMethod || 'Keine'}
- Workflow-Phase: ${context.phase || 'Einführung'}
- Fortschritt: ${JSON.stringify(context.progress || {})}

Deine Coaching-Philosophie:
1. Empathisch und unterstützend, aber auch herausfordernd
2. Evidenz-basiert und wissenschaftlich fundiert
3. Ganzheitlich und systemisch denkend
4. Zielorientiert mit Fokus auf nachhaltige Veränderung
5. Personalisiert und anpassungsfähig

Verwende eine warme, professionelle Sprache. Stelle gezielte Fragen, um tiefere Einsichten zu gewinnen. Biete konkrete, umsetzbare Ratschläge. Erkenne Muster und biete neue Perspektiven.

Antworte auf Deutsch und sei hilfsbereit, strukturiert und motivierend.`;
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
        
        const response = await this.processAdvancedMessage(
            `Ich möchte den Benutzer durch die ${methodId}-Methode führen. Bitte erkläre den ersten Schritt und stelle eine motivierende Frage.`,
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

// Export for use in main application
window.aiCoach = aiCoach;
