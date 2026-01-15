/**
 * ═══════════════════════════════════════════════════════════════════════════
 * INTERVIEW PREPARATION
 * AI-powered interview question generation and preparation
 * ═══════════════════════════════════════════════════════════════════════════
 */

class InterviewPrep {
    constructor() {
        this.selectedApplication = null;
        this.generatedQuestions = [];
        this.currentQuestionIndex = 0;
        this.practiceTimer = null;
        this.practiceTimeRemaining = 120; // 2 minutes per question
        
        this.init();
    }
    
    init() {
        this.loadApplications();
        this.setupEventListeners();
        console.log('🎤 Interview Prep initialized');
    }
    
    setupEventListeners() {
        // Application selection
        const applicationSelect = document.getElementById('applicationSelect');
        if (applicationSelect) {
            applicationSelect.addEventListener('change', (e) => {
                this.selectApplication(e.target.value);
            });
        }
        
        // Manual entry toggle
        const manualBtn = document.getElementById('manualEntryBtn');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => {
                this.toggleManualEntry();
            });
        }
        
        // Generate questions
        const generateBtn = document.getElementById('generateQuestionsBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateQuestions();
            });
        }
        
        // Export
        const exportBtn = document.getElementById('exportPrepBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }
        
        // Practice mode
        const practiceBtn = document.getElementById('practiceBtn');
        if (practiceBtn) {
            practiceBtn.addEventListener('click', () => {
                this.startPracticeMode();
            });
        }
        
        // Practice modal controls
        const closePractice = document.getElementById('closePractice');
        if (closePractice) {
            closePractice.addEventListener('click', () => {
                this.closePracticeMode();
            });
        }
        
        const nextQuestion = document.getElementById('nextQuestionBtn');
        if (nextQuestion) {
            nextQuestion.addEventListener('click', () => {
                this.nextPracticeQuestion();
            });
        }
        
        const skipQuestion = document.getElementById('skipQuestionBtn');
        if (skipQuestion) {
            skipQuestion.addEventListener('click', () => {
                this.nextPracticeQuestion();
            });
        }
        
        const showHint = document.getElementById('showHintBtn');
        if (showHint) {
            showHint.addEventListener('click', () => {
                this.showHint();
            });
        }
    }
    
    async loadApplications() {
        const select = document.getElementById('applicationSelect');
        if (!select) return;
        
        try {
            let applications = [];
            
            // Try cloud data service
            if (window.cloudDataService) {
                const coverLetters = await window.cloudDataService.getCoverLetters(true);
                applications = coverLetters || [];
            }
            
            // Fallback to localStorage
            if (!applications.length) {
                const stored = localStorage.getItem('cover_letter_drafts') || 
                              localStorage.getItem('cover_letters');
                applications = stored ? JSON.parse(stored) : [];
            }
            
            // Populate select
            if (applications.length) {
                applications.forEach(app => {
                    const option = document.createElement('option');
                    option.value = app.id;
                    const company = app.jobData?.companyName || 'Unbekannt';
                    const position = app.jobData?.jobTitle || 'Position';
                    option.textContent = `${company} - ${position}`;
                    select.appendChild(option);
                });
            }
            
            this.applications = applications;
            
        } catch (error) {
            console.error('Error loading applications:', error);
        }
    }
    
    selectApplication(id) {
        if (!id) {
            this.selectedApplication = null;
            return;
        }
        
        const app = this.applications?.find(a => a.id === id);
        if (app) {
            this.selectedApplication = app;
            
            // Hide manual entry if shown
            const manualForm = document.getElementById('manualEntryForm');
            if (manualForm) manualForm.style.display = 'none';
        }
    }
    
    toggleManualEntry() {
        const form = document.getElementById('manualEntryForm');
        const select = document.getElementById('applicationSelect');
        
        if (form) {
            const isVisible = form.style.display !== 'none';
            form.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible && select) {
                select.value = '';
                this.selectedApplication = null;
            }
        }
    }
    
    async generateQuestions() {
        // Get job data from selection or manual entry
        let jobData;
        
        if (this.selectedApplication) {
            jobData = this.selectedApplication.jobData;
        } else {
            jobData = {
                jobTitle: document.getElementById('manualPosition')?.value || '',
                companyName: document.getElementById('manualCompany')?.value || '',
                jobDescription: document.getElementById('manualJobDescription')?.value || ''
            };
        }
        
        if (!jobData.jobTitle && !jobData.companyName) {
            this.showToast('Bitte wählen Sie eine Bewerbung oder geben Sie die Daten manuell ein.', 'error');
            return;
        }
        
        // Show loading
        document.getElementById('loadingState').style.display = 'flex';
        document.getElementById('generatedContent').style.display = 'none';
        
        try {
            const apiKey = await this.getAPIKey();
            
            if (apiKey) {
                await this.generateWithAI(jobData, apiKey);
            } else {
                this.generateFallback(jobData);
            }
            
            // Show generated content
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('generatedContent').style.display = 'block';
            
        } catch (error) {
            console.error('Generation error:', error);
            this.showToast('Fehler bei der Generierung. Verwende Standardfragen.', 'warning');
            this.generateFallback(jobData);
            
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('generatedContent').style.display = 'block';
        }
    }
    
    async getAPIKey() {
        if (window.awsAPISettings) {
            try {
                const key = await window.awsAPISettings.getFullApiKey('openai');
                if (key && !key.includes('...')) return key;
            } catch (e) {}
        }
        
        try {
            const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
            if (globalKeys.openai?.key && !globalKeys.openai.key.includes('...')) {
                return globalKeys.openai.key;
            }
        } catch (e) {}
        
        return null;
    }
    
    async generateWithAI(jobData, apiKey) {
        // Load profile data for context
        let profileData = {};
        try {
            if (window.cloudDataService) {
                profileData = await window.cloudDataService.getProfile(true) || {};
            } else {
                const stored = localStorage.getItem('bewerbungsmanager_profile');
                profileData = stored ? JSON.parse(stored) : {};
            }
        } catch (e) {}
        
        const prompt = this.buildPrompt(jobData, profileData);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo-16k',
                messages: [
                    {
                        role: 'system',
                        content: `Du bist ein erfahrener HR-Manager und Interview-Coach. 
                        Generiere realistische Interviewfragen und hilfreiche Antwortvorschläge auf Deutsch.
                        Antworte ausschließlich mit einem validen JSON-Objekt.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 3000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        
        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            this.displayGeneratedContent(parsed);
        } else {
            throw new Error('Invalid AI response');
        }
    }
    
    buildPrompt(jobData, profileData) {
        return `
Generiere Interview-Vorbereitungsmaterial für folgende Stelle:

POSITION: ${jobData.jobTitle || 'Nicht angegeben'}
UNTERNEHMEN: ${jobData.companyName || 'Nicht angegeben'}
STELLENBESCHREIBUNG:
${jobData.jobDescription || 'Keine Beschreibung verfügbar'}

BEWERBER-PROFIL:
- Name: ${profileData.firstName || ''} ${profileData.lastName || ''}
- Aktuelle Position: ${profileData.currentJob || profileData.title || 'Nicht angegeben'}
- Erfahrung: ${profileData.summary || 'Nicht angegeben'}

Erstelle ein JSON-Objekt mit folgendem Format:
{
    "questions": [
        {
            "question": "Die Interviewfrage",
            "category": "Kategorie (Motivation/Erfahrung/Fachlich/Persönlich/Situativ)",
            "difficulty": "leicht/mittel/schwer",
            "hint": "Kurzer Tipp für die Beantwortung",
            "sampleAnswer": "Beispiel für eine gute Antwort (2-3 Sätze)"
        }
    ],
    "starAnswers": [
        {
            "situation": "Beschreibung einer relevanten Situation aus dem Profil",
            "task": "Die Aufgabe/Herausforderung",
            "action": "Die ergriffene Maßnahme",
            "result": "Das Ergebnis"
        }
    ],
    "strengths": ["Stärke 1 mit Bezug zur Stelle", "Stärke 2", "Stärke 3"],
    "gapQuestions": ["Mögliche kritische Frage 1", "Mögliche kritische Frage 2"],
    "questionsToAsk": [
        {
            "question": "Frage an den Interviewer",
            "reason": "Warum diese Frage gut ist"
        }
    ],
    "salaryRange": {
        "min": 45000,
        "max": 65000,
        "note": "Hinweis zur Gehaltsverhandlung"
    }
}

Generiere mindestens 10 realistische Interviewfragen, 3 STAR-Antworten, 5 Stärken, 3 Gap-Fragen und 5 Fragen für den Bewerber.
`;
    }
    
    generateFallback(jobData) {
        // Generate standard questions based on position type
        const position = (jobData.jobTitle || '').toLowerCase();
        
        const standardQuestions = [
            {
                question: "Erzählen Sie uns etwas über sich.",
                category: "Persönlich",
                difficulty: "leicht",
                hint: "Fokussieren Sie sich auf relevante berufliche Erfahrungen.",
                sampleAnswer: "Ich bin [Ihr Beruf] mit [X] Jahren Erfahrung in [Bereich]. Meine Stärken liegen in [relevante Skills]."
            },
            {
                question: "Warum haben Sie sich bei uns beworben?",
                category: "Motivation",
                difficulty: "mittel",
                hint: "Zeigen Sie, dass Sie sich über das Unternehmen informiert haben.",
                sampleAnswer: `${jobData.companyName || 'Ihr Unternehmen'} ist bekannt für [positiven Aspekt]. Diese Werte entsprechen meinen eigenen Vorstellungen.`
            },
            {
                question: "Was sind Ihre größten Stärken?",
                category: "Persönlich",
                difficulty: "leicht",
                hint: "Nennen Sie Stärken, die für die Position relevant sind.",
                sampleAnswer: "Meine größten Stärken sind [Stärke 1], [Stärke 2] und [Stärke 3]. In meiner letzten Position konnte ich..."
            },
            {
                question: "Was sind Ihre Schwächen?",
                category: "Persönlich",
                difficulty: "mittel",
                hint: "Nennen Sie eine echte Schwäche und wie Sie daran arbeiten.",
                sampleAnswer: "Früher neigte ich dazu, [Schwäche]. Ich habe gelernt, dies durch [Strategie] zu verbessern."
            },
            {
                question: "Wo sehen Sie sich in 5 Jahren?",
                category: "Motivation",
                difficulty: "mittel",
                hint: "Zeigen Sie Ambition, aber bleiben Sie realistisch.",
                sampleAnswer: "In 5 Jahren sehe ich mich in einer verantwortungsvolleren Position, in der ich meine Erfahrungen einbringen kann."
            },
            {
                question: "Beschreiben Sie eine herausfordernde Situation und wie Sie sie gemeistert haben.",
                category: "Situativ",
                difficulty: "schwer",
                hint: "Nutzen Sie die STAR-Methode: Situation, Task, Action, Result.",
                sampleAnswer: "In meiner vorherigen Position stand ich vor der Herausforderung [Situation]. Ich habe [Aktion] ergriffen und konnte [Ergebnis] erzielen."
            },
            {
                question: "Warum möchten Sie Ihren aktuellen Job wechseln?",
                category: "Motivation",
                difficulty: "mittel",
                hint: "Bleiben Sie positiv - keine Kritik am aktuellen Arbeitgeber.",
                sampleAnswer: "Ich suche nach neuen Herausforderungen und Möglichkeiten zur Weiterentwicklung, die diese Position bietet."
            },
            {
                question: "Was wissen Sie über unser Unternehmen?",
                category: "Motivation",
                difficulty: "mittel",
                hint: "Recherchieren Sie vor dem Interview gründlich.",
                sampleAnswer: `${jobData.companyName || 'Ihr Unternehmen'} ist [Branche], bekannt für [Besonderheit]. Besonders beeindruckt hat mich...`
            },
            {
                question: "Wie gehen Sie mit Stress und Druck um?",
                category: "Persönlich",
                difficulty: "mittel",
                hint: "Geben Sie konkrete Beispiele für Stressbewältigung.",
                sampleAnswer: "Ich priorisiere Aufgaben und teile große Projekte in kleinere Schritte auf. So behalte ich auch unter Druck den Überblick."
            },
            {
                question: "Haben Sie Fragen an uns?",
                category: "Allgemein",
                difficulty: "leicht",
                hint: "Stellen Sie durchdachte Fragen über die Rolle und das Team.",
                sampleAnswer: "Ja, ich würde gerne mehr über die Teamstruktur und die typischen Herausforderungen in dieser Position erfahren."
            }
        ];
        
        // Add position-specific questions
        if (position.includes('entwickl') || position.includes('developer') || position.includes('engineer')) {
            standardQuestions.push(
                {
                    question: "Mit welchen Programmiersprachen und Frameworks haben Sie Erfahrung?",
                    category: "Fachlich",
                    difficulty: "leicht",
                    hint: "Nennen Sie konkrete Technologien und Projekte.",
                    sampleAnswer: "Ich habe umfangreiche Erfahrung mit [Technologie 1] und [Technologie 2]. In meinem letzten Projekt..."
                },
                {
                    question: "Wie gehen Sie bei der Fehlersuche in Code vor?",
                    category: "Fachlich",
                    difficulty: "mittel",
                    hint: "Beschreiben Sie Ihren systematischen Debugging-Prozess.",
                    sampleAnswer: "Ich beginne mit der Analyse der Fehlermeldung, reproduziere das Problem, und nutze Debugging-Tools..."
                }
            );
        }
        
        const content = {
            questions: standardQuestions,
            starAnswers: [
                {
                    situation: "In meiner vorherigen Position gab es ein dringendes Projekt mit knapper Deadline.",
                    task: "Ich musste die Koordination zwischen Teams übernehmen und die Qualität sicherstellen.",
                    action: "Ich etablierte tägliche Kurz-Meetings und priorisierte kritische Aufgaben.",
                    result: "Das Projekt wurde pünktlich und in hoher Qualität abgeschlossen."
                }
            ],
            strengths: [
                "Schnelle Einarbeitung in neue Themen",
                "Strukturierte und organisierte Arbeitsweise",
                "Starke Kommunikationsfähigkeiten",
                "Teamorientiert und kollegial",
                "Hohe Eigenmotivation und Zuverlässigkeit"
            ],
            gapQuestions: [
                "Haben Sie Erfahrung in [spezifische Anforderung]?",
                "Wie haben Sie mit [herausfordernde Situation] umgegangen?"
            ],
            questionsToAsk: [
                { question: "Wie sieht ein typischer Arbeitstag in dieser Position aus?", reason: "Zeigt Interesse an der täglichen Arbeit" },
                { question: "Welche Entwicklungsmöglichkeiten gibt es?", reason: "Zeigt langfristiges Interesse" },
                { question: "Wie würden Sie die Teamkultur beschreiben?", reason: "Wichtig für Cultural Fit" },
                { question: "Was sind die größten Herausforderungen in dieser Rolle?", reason: "Zeigt realistische Erwartungen" },
                { question: "Wie sieht der weitere Bewerbungsprozess aus?", reason: "Zeigt Initiative und Interesse" }
            ],
            salaryRange: {
                min: 45000,
                max: 65000,
                note: "Recherchieren Sie branchenübliche Gehälter für Ihre Position und Region."
            }
        };
        
        this.displayGeneratedContent(content);
    }
    
    displayGeneratedContent(content) {
        this.generatedQuestions = content.questions || [];
        
        // Display questions
        const questionsList = document.getElementById('questionsList');
        if (questionsList && content.questions) {
            questionsList.innerHTML = content.questions.map((q, index) => `
                <div class="question-card" data-index="${index}">
                    <div class="question-header">
                        <span class="question-number">${index + 1}</span>
                        <span class="question-category ${q.category?.toLowerCase()}">${q.category}</span>
                        <span class="question-difficulty ${q.difficulty}">${q.difficulty}</span>
                    </div>
                    <h3 class="question-text">${q.question}</h3>
                    <div class="question-hint">
                        <i class="fas fa-lightbulb"></i>
                        <span>${q.hint}</span>
                    </div>
                    <div class="question-answer">
                        <button type="button" class="toggle-answer-btn">
                            <i class="fas fa-eye"></i> Beispielantwort anzeigen
                        </button>
                        <div class="answer-content" style="display: none;">
                            <p>${q.sampleAnswer}</p>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Toggle answer buttons
            questionsList.querySelectorAll('.toggle-answer-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const content = btn.nextElementSibling;
                    const isVisible = content.style.display !== 'none';
                    content.style.display = isVisible ? 'none' : 'block';
                    btn.innerHTML = isVisible ? 
                        '<i class="fas fa-eye"></i> Beispielantwort anzeigen' :
                        '<i class="fas fa-eye-slash"></i> Antwort ausblenden';
                });
            });
        }
        
        // Display STAR answers
        const starAnswers = document.getElementById('starAnswers');
        if (starAnswers && content.starAnswers) {
            starAnswers.innerHTML = content.starAnswers.map(star => `
                <div class="star-card">
                    <div class="star-item">
                        <span class="star-label">S</span>
                        <div class="star-content">
                            <strong>Situation</strong>
                            <p>${star.situation}</p>
                        </div>
                    </div>
                    <div class="star-item">
                        <span class="star-label">T</span>
                        <div class="star-content">
                            <strong>Task</strong>
                            <p>${star.task}</p>
                        </div>
                    </div>
                    <div class="star-item">
                        <span class="star-label">A</span>
                        <div class="star-content">
                            <strong>Action</strong>
                            <p>${star.action}</p>
                        </div>
                    </div>
                    <div class="star-item">
                        <span class="star-label">R</span>
                        <div class="star-content">
                            <strong>Result</strong>
                            <p>${star.result}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Display strengths
        const strengthsList = document.getElementById('strengthsList');
        if (strengthsList && content.strengths) {
            strengthsList.innerHTML = content.strengths.map(s => 
                `<li><i class="fas fa-check"></i> ${s}</li>`
            ).join('');
        }
        
        // Display gap questions
        const weaknessesList = document.getElementById('weaknessesList');
        if (weaknessesList && content.gapQuestions) {
            weaknessesList.innerHTML = content.gapQuestions.map(q => 
                `<li><i class="fas fa-exclamation"></i> ${q}</li>`
            ).join('');
        }
        
        // Display questions to ask
        const questionsToAsk = document.getElementById('questionsToAsk');
        if (questionsToAsk && content.questionsToAsk) {
            questionsToAsk.innerHTML = content.questionsToAsk.map(q => `
                <div class="ask-card">
                    <p class="ask-question">"${q.question}"</p>
                    <span class="ask-reason"><i class="fas fa-info-circle"></i> ${q.reason}</span>
                </div>
            `).join('');
        }
        
        // Display salary estimate if available
        if (content.salaryRange) {
            const salarySection = document.getElementById('salarySection');
            const salaryMin = document.getElementById('salaryMin');
            const salaryMax = document.getElementById('salaryMax');
            
            if (salarySection && salaryMin && salaryMax) {
                salarySection.style.display = 'block';
                salaryMin.textContent = `€${content.salaryRange.min.toLocaleString('de-DE')}`;
                salaryMax.textContent = `€${content.salaryRange.max.toLocaleString('de-DE')}`;
            }
        }
    }
    
    startPracticeMode() {
        if (!this.generatedQuestions.length) {
            this.showToast('Bitte generieren Sie zuerst Fragen.', 'warning');
            return;
        }
        
        this.currentQuestionIndex = 0;
        this.showPracticeQuestion();
        
        const modal = document.getElementById('practiceModal');
        if (modal) modal.classList.add('active');
    }
    
    closePracticeMode() {
        const modal = document.getElementById('practiceModal');
        if (modal) modal.classList.remove('active');
        
        if (this.practiceTimer) {
            clearInterval(this.practiceTimer);
        }
    }
    
    showPracticeQuestion() {
        const question = this.generatedQuestions[this.currentQuestionIndex];
        if (!question) {
            this.showToast('Alle Fragen durchgearbeitet!', 'success');
            this.closePracticeMode();
            return;
        }
        
        const questionNumber = document.querySelector('.question-number');
        const currentQuestion = document.getElementById('currentQuestion');
        const hintText = document.getElementById('hintText');
        
        if (questionNumber) {
            questionNumber.textContent = `Frage ${this.currentQuestionIndex + 1}/${this.generatedQuestions.length}`;
        }
        
        if (currentQuestion) {
            currentQuestion.textContent = question.question;
        }
        
        if (hintText) {
            hintText.textContent = question.hint || '';
            hintText.style.display = 'none';
        }
        
        // Reset and start timer
        this.practiceTimeRemaining = 120;
        this.updateTimerDisplay();
        
        if (this.practiceTimer) {
            clearInterval(this.practiceTimer);
        }
        
        this.practiceTimer = setInterval(() => {
            this.practiceTimeRemaining--;
            this.updateTimerDisplay();
            
            if (this.practiceTimeRemaining <= 0) {
                this.nextPracticeQuestion();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const timerEl = document.getElementById('practiceTimer');
        if (timerEl) {
            const minutes = Math.floor(this.practiceTimeRemaining / 60);
            const seconds = this.practiceTimeRemaining % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Change color when time is running out
            if (this.practiceTimeRemaining <= 30) {
                timerEl.style.color = '#ef4444';
            } else {
                timerEl.style.color = '';
            }
        }
    }
    
    nextPracticeQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.generatedQuestions.length) {
            this.showToast('Gratulation! Alle Fragen durchgearbeitet!', 'success');
            this.closePracticeMode();
        } else {
            this.showPracticeQuestion();
        }
    }
    
    showHint() {
        const hintText = document.getElementById('hintText');
        if (hintText) {
            hintText.style.display = hintText.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    exportToPDF() {
        window.print();
        this.showToast('PDF-Export gestartet', 'success');
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.interviewPrep = new InterviewPrep();
});
