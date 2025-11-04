/**
 * INTERVIEW ASSISTANT - JAVASCRIPT
 * Handles interview preparation, question generation, and practice mode
 */

class InterviewAssistant {
    constructor() {
        this.applicationsCore = null;
        this.generatedQuestions = [];
        this.currentQuestionIndex = 0;
        this.practiceMode = false;
        this.timer = null;
        this.timeRemaining = 0;
        this.init();
    }

    async init() {
        console.log('🎯 Initializing Interview Assistant...');
        
        // Wait for applications core
        await this.waitForApplicationsCore();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        console.log('✅ Interview Assistant initialized');
    }

    async waitForApplicationsCore() {
        return new Promise((resolve) => {
            const checkCore = () => {
                if (window.applicationsCore && window.applicationsCore.isInitialized) {
                    this.applicationsCore = window.applicationsCore;
                    resolve();
                } else {
                    setTimeout(checkCore, 100);
                }
            };
            checkCore();
        });
    }

    setupEventHandlers() {
        // Interview setup form
        document.getElementById('interviewSetupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateQuestions();
        });
    }

    async generateQuestions() {
        console.log('🤖 Generating interview questions...');
        
        // Show loading
        this.showLoading();
        
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Check API key
            const apiKey = localStorage.getItem('openai_api_key');
            if (!apiKey) {
                this.showTemplateQuestions(formData);
                return;
            }
            
            // Generate questions with AI
            const questions = await this.callOpenAI(formData);
            
            // Display questions
            this.displayQuestions(questions);
            
            // Track progress
            this.applicationsCore.trackProgress('interview-preparation', {
                formData,
                questionsGenerated: questions.length
            });
            
        } catch (error) {
            console.error('❌ Error generating questions:', error);
            this.showTemplateQuestions(this.collectFormData());
        } finally {
            this.hideLoading();
        }
    }

    collectFormData() {
        const form = document.getElementById('interviewSetupForm');
        const formData = new FormData(form);
        
        return {
            company: formData.get('company'),
            position: formData.get('position'),
            type: formData.get('type'),
            level: formData.get('level'),
            industry: formData.get('industry'),
            duration: formData.get('duration')
        };
    }

    async callOpenAI(formData) {
        const apiKey = localStorage.getItem('openai_api_key');
        
        const prompt = this.constructPrompt(formData);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein professioneller Interview-Coach. Erstelle personalisierte Interview-Fragen auf Deutsch für verschiedene Interview-Typen.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse questions from response
        return this.parseQuestions(content);
    }

    constructPrompt(formData) {
        const typeMap = {
            'technical': 'technisches Interview',
            'behavioral': 'Verhaltens-Interview',
            'case': 'Case-Study Interview',
            'panel': 'Panel-Interview',
            'phone': 'Telefon-Interview',
            'video': 'Video-Interview',
            'mixed': 'gemischtes Interview'
        };
        
        const levelMap = {
            'junior': 'Junior-Level (0-2 Jahre Erfahrung)',
            'mid': 'Mid-Level (2-5 Jahre Erfahrung)',
            'senior': 'Senior-Level (5+ Jahre Erfahrung)',
            'lead': 'Lead/Manager-Level'
        };
        
        return `
Erstelle 10 Interview-Fragen für:

POSITION: ${formData.position}
UNTERNEHMEN: ${formData.company}
INTERVIEW-TYP: ${typeMap[formData.type]}
ERFAHRUNGSLEVEL: ${levelMap[formData.level]}
BRANCHE: ${formData.industry}
DAUER: ${formData.duration} Minuten

Die Fragen sollen:
- Auf die Position und das Unternehmen zugeschnitten sein
- Verschiedene Kategorien abdecken (technisch, verhaltensbezogen, situativ)
- Dem Erfahrungslevel entsprechen
- Praktisch und relevant sein

Format: Gib jede Frage in einer neuen Zeile aus, gefolgt von der Kategorie in Klammern.
Beispiel: "Erzählen Sie mir von einer schwierigen technischen Herausforderung, die Sie gelöst haben. (Technisch)"

Erstelle nur die Fragen, keine zusätzlichen Erklärungen.
        `;
    }

    parseQuestions(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const questions = [];
        
        lines.forEach((line, index) => {
            if (line.trim()) {
                const match = line.match(/^(.+?)\s*\((.+?)\)$/);
                if (match) {
                    questions.push({
                        id: `q_${index + 1}`,
                        text: match[1].trim(),
                        category: match[2].trim(),
                        difficulty: this.getDifficultyLevel(match[2].trim())
                    });
                } else {
                    questions.push({
                        id: `q_${index + 1}`,
                        text: line.trim(),
                        category: 'Allgemein',
                        difficulty: 'medium'
                    });
                }
            }
        });
        
        return questions.slice(0, 10); // Limit to 10 questions
    }

    getDifficultyLevel(category) {
        const difficultyMap = {
            'Technisch': 'hard',
            'Verhaltensbezogen': 'medium',
            'Situativ': 'medium',
            'Allgemein': 'easy',
            'Führung': 'hard',
            'Problemlösung': 'medium'
        };
        return difficultyMap[category] || 'medium';
    }

    showTemplateQuestions(formData) {
        console.log('📄 Showing template questions...');
        
        const templateQuestions = this.getTemplateQuestions(formData);
        this.displayQuestions(templateQuestions);
        
        this.showNotification('KI-Generierung nicht verfügbar. Verwende Template-Fragen.', 'info');
    }

    getTemplateQuestions(formData) {
        const baseQuestions = [
            {
                id: 'q_1',
                text: 'Erzählen Sie mir etwas über sich selbst.',
                category: 'Allgemein',
                difficulty: 'easy'
            },
            {
                id: 'q_2',
                text: 'Warum möchten Sie bei unserem Unternehmen arbeiten?',
                category: 'Motivation',
                difficulty: 'medium'
            },
            {
                id: 'q_3',
                text: 'Was sind Ihre größten Stärken?',
                category: 'Verhaltensbezogen',
                difficulty: 'easy'
            },
            {
                id: 'q_4',
                text: 'Beschreiben Sie eine schwierige Situation, die Sie erfolgreich gemeistert haben.',
                category: 'Verhaltensbezogen',
                difficulty: 'medium'
            },
            {
                id: 'q_5',
                text: 'Wo sehen Sie sich in 5 Jahren?',
                category: 'Zukunft',
                difficulty: 'medium'
            }
        ];
        
        // Add technical questions for technical roles
        if (formData.type === 'technical') {
            baseQuestions.push(
                {
                    id: 'q_6',
                    text: 'Erklären Sie ein komplexes technisches Problem, das Sie gelöst haben.',
                    category: 'Technisch',
                    difficulty: 'hard'
                },
                {
                    id: 'q_7',
                    text: 'Wie bleiben Sie mit neuen Technologien auf dem Laufenden?',
                    category: 'Technisch',
                    difficulty: 'medium'
                }
            );
        }
        
        // Add leadership questions for senior roles
        if (formData.level === 'senior' || formData.level === 'lead') {
            baseQuestions.push(
                {
                    id: 'q_8',
                    text: 'Beschreiben Sie eine Situation, in der Sie ein Team geführt haben.',
                    category: 'Führung',
                    difficulty: 'hard'
                },
                {
                    id: 'q_9',
                    text: 'Wie motivieren Sie Ihr Team in schwierigen Zeiten?',
                    category: 'Führung',
                    difficulty: 'hard'
                }
            );
        }
        
        return baseQuestions.slice(0, 10);
    }

    displayQuestions(questions) {
        this.generatedQuestions = questions;
        
        const container = document.getElementById('questionsContainer');
        container.innerHTML = '';
        
        questions.forEach((question, index) => {
            const questionCard = this.createQuestionCard(question, index + 1);
            container.appendChild(questionCard);
        });
        
        // Show questions section
        document.getElementById('questionsSection').style.display = 'block';
        
        // Scroll to questions
        document.getElementById('questionsSection').scrollIntoView({ behavior: 'smooth' });
    }

    createQuestionCard(question, number) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <div class="question-header">
                <div class="question-number">Frage ${number}</div>
                <div class="question-category">${question.category}</div>
                <div class="question-difficulty difficulty-${question.difficulty}">
                    ${this.getDifficultyLabel(question.difficulty)}
                </div>
            </div>
            <div class="question-content">
                <h3 class="question-text">${question.text}</h3>
                <div class="question-tips">
                    <h4>Tipps zur Beantwortung:</h4>
                    <ul>
                        ${this.getAnswerTips(question.category)}
                    </ul>
                </div>
            </div>
        `;
        
        return card;
    }

    getDifficultyLabel(difficulty) {
        const labels = {
            'easy': 'Einfach',
            'medium': 'Mittel',
            'hard': 'Schwer'
        };
        return labels[difficulty] || 'Mittel';
    }

    getAnswerTips(category) {
        const tips = {
            'Technisch': [
                'Erklären Sie den technischen Kontext',
                'Beschreiben Sie Ihren Lösungsansatz',
                'Erwähnen Sie verwendete Technologien',
                'Quantifizieren Sie die Ergebnisse'
            ],
            'Verhaltensbezogen': [
                'Verwenden Sie die STAR-Methode',
                'Wählen Sie ein relevantes Beispiel',
                'Fokussieren Sie auf Ihre Rolle',
                'Zeigen Sie Lernerfolge'
            ],
            'Führung': [
                'Beschreiben Sie die Situation',
                'Erklären Sie Ihre Führungsstrategie',
                'Zeigen Sie Empathie und Verständnis',
                'Quantifizieren Sie den Erfolg'
            ],
            'Allgemein': [
                'Seien Sie ehrlich und authentisch',
                'Strukturieren Sie Ihre Antwort',
                'Verwenden Sie konkrete Beispiele',
                'Zeigen Sie Enthusiasmus'
            ]
        };
        
        const categoryTips = tips[category] || tips['Allgemein'];
        return categoryTips.map(tip => `<li>${tip}</li>`).join('');
    }

    startPractice() {
        if (this.generatedQuestions.length === 0) {
            this.showNotification('Bitte generieren Sie zuerst Fragen', 'error');
            return;
        }
        
        this.practiceMode = true;
        this.currentQuestionIndex = 0;
        this.timeRemaining = 5 * 60; // 5 minutes per question
        
        this.showPracticeMode();
        this.loadCurrentQuestion();
        this.startTimer();
    }

    showPracticeMode() {
        document.getElementById('practiceSection').style.display = 'block';
        document.getElementById('questionsSection').style.display = 'none';
        
        // Update question counter
        document.getElementById('totalQuestions').textContent = this.generatedQuestions.length;
        
        // Scroll to practice section
        document.getElementById('practiceSection').scrollIntoView({ behavior: 'smooth' });
    }

    loadCurrentQuestion() {
        if (this.currentQuestionIndex >= this.generatedQuestions.length) {
            this.completePractice();
            return;
        }
        
        const question = this.generatedQuestions[this.currentQuestionIndex];
        
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('practiceQuestionText').textContent = question.text;
        document.getElementById('practiceQuestionCategory').textContent = question.category;
        
        // Clear previous answer
        document.getElementById('practiceAnswer').value = '';
        
        // Show tips
        const tips = this.getAnswerTips(question.category);
        document.getElementById('answerTips').innerHTML = `
            <h4>Beantwortungstipps:</h4>
            <ul>${tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        `;
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.nextQuestion();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }

    nextQuestion() {
        // Save current answer
        const answer = document.getElementById('practiceAnswer').value;
        if (answer.trim()) {
            this.saveAnswer(this.currentQuestionIndex, answer);
        }
        
        // Move to next question
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.generatedQuestions.length) {
            this.timeRemaining = 5 * 60; // Reset timer
            this.loadCurrentQuestion();
        } else {
            this.completePractice();
        }
    }

    skipQuestion() {
        this.nextQuestion();
    }

    saveAnswer(questionIndex, answer) {
        // Save answer to localStorage or send to server
        const answers = JSON.parse(localStorage.getItem('interviewAnswers') || '{}');
        answers[questionIndex] = {
            question: this.generatedQuestions[questionIndex].text,
            answer: answer,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('interviewAnswers', JSON.stringify(answers));
    }

    completePractice() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.practiceMode = false;
        
        // Show completion message
        this.showNotification('Übungsmodus abgeschlossen! Gut gemacht!', 'success');
        
        // Hide practice section
        document.getElementById('practiceSection').style.display = 'none';
        
        // Show questions section again
        document.getElementById('questionsSection').style.display = 'block';
    }

    regenerateQuestions() {
        this.generateQuestions();
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        if (this.applicationsCore) {
            this.applicationsCore.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }
}

// Global functions for inline event handlers
function regenerateQuestions() {
    if (window.interviewAssistant) {
        window.interviewAssistant.regenerateQuestions();
    }
}

function startPractice() {
    if (window.interviewAssistant) {
        window.interviewAssistant.startPractice();
    }
}

function nextQuestion() {
    if (window.interviewAssistant) {
        window.interviewAssistant.nextQuestion();
    }
}

function skipQuestion() {
    if (window.interviewAssistant) {
        window.interviewAssistant.skipQuestion();
    }
}

function handleComplete() {
    // Show success message
    if (window.interviewAssistant) {
        window.interviewAssistant.showNotification('Interview-Vorbereitung erfolgreich abgeschlossen!', 'success');
    }
    
    // Redirect to main applications page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.interviewAssistant = new InterviewAssistant();
});











