/**
 * Complete RAISEC Assessment Workflow
 * Vollständige Implementierung des RAISEC-Modells nach Holland
 */

class RAISECCompleteWorkflow {
    constructor() {
        this.currentQuestion = 0;
        this.totalQuestions = 30;
        this.answers = [];
        this.scores = {
            R: 0, // Realistisch
            A: 0, // Analytisch
            I: 0, // Künstlerisch
            S: 0, // Sozial
            E: 0, // Unternehmerisch
            C: 0  // Konventionell
        };
        
        this.questions = this.generateQuestions();
        this.init();
    }
    
    generateQuestions() {
        return [
            // Realistische Fragen (R)
            { id: 1, text: "Ich arbeite gerne mit Werkzeugen und Maschinen", type: "R", category: "realistic" },
            { id: 2, text: "Ich bevorzuge praktische, handwerkliche Tätigkeiten", type: "R", category: "realistic" },
            { id: 3, text: "Ich fühle mich wohl bei körperlicher Arbeit", type: "R", category: "realistic" },
            { id: 4, text: "Ich mag es, Dinge zu reparieren oder zu konstruieren", type: "R", category: "realistic" },
            { id: 5, text: "Ich bevorzuge klare, strukturierte Aufgaben", type: "R", category: "realistic" },
            
            // Analytische Fragen (A)
            { id: 6, text: "Ich interessiere mich für wissenschaftliche Forschung", type: "A", category: "analytical" },
            { id: 7, text: "Ich mag es, komplexe Probleme zu lösen", type: "A", category: "analytical" },
            { id: 8, text: "Ich bevorzuge intellektuelle Herausforderungen", type: "A", category: "analytical" },
            { id: 9, text: "Ich arbeite gerne mit Daten und Statistiken", type: "A", category: "analytical" },
            { id: 10, text: "Ich mag es, neue Theorien zu entwickeln", type: "A", category: "analytical" },
            
            // Künstlerische Fragen (I)
            { id: 11, text: "Ich bin sehr kreativ und künstlerisch begabt", type: "I", category: "artistic" },
            { id: 12, text: "Ich bevorzuge unkonventionelle Arbeitsweisen", type: "I", category: "artistic" },
            { id: 13, text: "Ich mag es, mich künstlerisch auszudrücken", type: "I", category: "artistic" },
            { id: 14, text: "Ich bevorzuge flexible Arbeitszeiten", type: "I", category: "artistic" },
            { id: 15, text: "Ich mag es, neue Ideen zu entwickeln", type: "I", category: "artistic" },
            
            // Soziale Fragen (S)
            { id: 16, text: "Ich helfe gerne anderen Menschen", type: "S", category: "social" },
            { id: 17, text: "Ich arbeite gerne in Teams", type: "S", category: "social" },
            { id: 18, text: "Ich mag es, andere zu unterrichten oder zu beraten", type: "S", category: "social" },
            { id: 19, text: "Ich bevorzuge soziale Interaktionen", type: "S", category: "social" },
            { id: 20, text: "Ich mag es, anderen bei Problemen zu helfen", type: "S", category: "social" },
            
            // Unternehmerische Fragen (E)
            { id: 21, text: "Ich übernehme gerne Führungsverantwortung", type: "E", category: "entrepreneurial" },
            { id: 22, text: "Ich mag es, andere zu überzeugen und zu motivieren", type: "E", category: "entrepreneurial" },
            { id: 23, text: "Ich bevorzuge herausfordernde Verkaufssituationen", type: "E", category: "entrepreneurial" },
            { id: 24, text: "Ich mag es, neue Geschäftsideen zu entwickeln", type: "E", category: "entrepreneurial" },
            { id: 25, text: "Ich bevorzuge selbstständige Arbeit", type: "E", category: "entrepreneurial" },
            
            // Konventionelle Fragen (C)
            { id: 26, text: "Ich arbeite gerne nach festen Regeln und Strukturen", type: "C", category: "conventional" },
            { id: 27, text: "Ich bevorzuge organisierte und geplante Arbeitsabläufe", type: "C", category: "conventional" },
            { id: 28, text: "Ich mag es, mit Zahlen und Daten zu arbeiten", type: "C", category: "conventional" },
            { id: 29, text: "Ich bevorzuge sichere und stabile Arbeitsplätze", type: "C", category: "conventional" },
            { id: 30, text: "Ich arbeite gerne mit Computern und Software", type: "C", category: "conventional" }
        ];
    }
    
    init() {
        console.log('🎯 Initializing RAISEC Complete Workflow...');
        this.createWorkflowInterface();
        this.showQuestion(0);
    }
    
    createWorkflowInterface() {
        const container = document.createElement('div');
        container.id = 'raisec-complete-workflow';
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
            font-family: 'Inter', Arial, sans-serif;
        `;
        
        container.innerHTML = `
            <div class="raisec-modal">
                <div class="raisec-header">
                    <h2>🎯 RAISEC Assessment</h2>
                    <p>Entdecke deine beruflichen Interessen und finde passende Berufsfelder</p>
                    <button class="close-btn" onclick="raisecCompleteWorkflow.close()">×</button>
                </div>
                
                <div class="raisec-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">Frage 1 von ${this.totalQuestions}</div>
                </div>
                
                <div class="raisec-content">
                    <div id="raisecQuestionContainer">
                        <!-- Question content will be loaded here -->
                    </div>
                </div>
                
                <div class="raisec-navigation">
                    <button id="prevQuestionBtn" class="btn-secondary" disabled>
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    <button id="nextQuestionBtn" class="btn-primary" disabled>
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('prevQuestionBtn')?.addEventListener('click', () => this.prevQuestion());
        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => this.nextQuestion());
    }
    
    showQuestion(questionIndex) {
        const question = this.questions[questionIndex];
        if (!question) return;
        
        const container = document.getElementById('raisecQuestionContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="question-card">
                <div class="question-header">
                    <div class="question-number">Frage ${questionIndex + 1} von ${this.totalQuestions}</div>
                    <h3 class="question-text">${question.text}</h3>
                </div>
                
                <div class="answer-options">
                    <div class="option-group">
                        <label class="option-label">
                            <input type="radio" name="answer" value="1" class="option-radio">
                            <span class="option-text">Trifft gar nicht zu</span>
                        </label>
                        <label class="option-label">
                            <input type="radio" name="answer" value="2" class="option-radio">
                            <span class="option-text">Trifft wenig zu</span>
                        </label>
                        <label class="option-label">
                            <input type="radio" name="answer" value="3" class="option-radio">
                            <span class="option-text">Trifft teilweise zu</span>
                        </label>
                        <label class="option-label">
                            <input type="radio" name="answer" value="4" class="option-radio">
                            <span class="option-text">Trifft überwiegend zu</span>
                        </label>
                        <label class="option-label">
                            <input type="radio" name="answer" value="5" class="option-radio">
                            <span class="option-text">Trifft voll zu</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to radio buttons
        document.querySelectorAll('.option-radio').forEach(radio => {
            radio.addEventListener('change', () => this.selectAnswer(questionIndex, parseInt(radio.value)));
        });
        
        this.updateProgress();
        this.updateNavigation();
    }
    
    selectAnswer(questionIndex, answer) {
        this.answers[questionIndex] = answer;
        
        // Update scores
        const question = this.questions[questionIndex];
        this.scores[question.type] += answer;
        
        // Enable next button
        document.getElementById('nextQuestionBtn').disabled = false;
    }
    
    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
        } else {
            this.completeAssessment();
        }
    }
    
    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
        }
    }
    
    completeAssessment() {
        this.calculateResults();
        this.showResults();
    }
    
    calculateResults() {
        // Calculate percentages for each type
        const maxPossibleScore = 5 * 5; // 5 questions per type, max 5 points each
        this.percentages = {};
        
        Object.keys(this.scores).forEach(type => {
            this.percentages[type] = Math.round((this.scores[type] / maxPossibleScore) * 100);
        });
        
        // Sort by score
        this.rankedTypes = Object.entries(this.percentages)
            .sort(([,a], [,b]) => b - a)
            .map(([type, score]) => ({ type, score }));
        
        console.log('RAISEC Results:', this.rankedTypes);
    }
    
    showResults() {
        const container = document.getElementById('raisecQuestionContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="results-card">
                <div class="results-header">
                    <h3>🎯 Dein RAISEC-Profil</h3>
                    <p>Hier sind deine beruflichen Interessen nach dem Holland-Modell:</p>
                </div>
                
                <div class="results-grid">
                    ${this.rankedTypes.map((item, index) => `
                        <div class="result-card ${item.type.toLowerCase()}">
                            <div class="result-rank">#${index + 1}</div>
                            <div class="result-type">${this.getTypeName(item.type)}</div>
                            <div class="result-score">${item.score}%</div>
                            <div class="result-description">${this.getTypeDescription(item.type)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="career-recommendations">
                    <h4>💼 Berufsempfehlungen</h4>
                    <div class="recommendations-grid">
                        ${this.getCareerRecommendations().map(career => `
                            <div class="career-card">
                                <h5>${career.title}</h5>
                                <p>${career.description}</p>
                                <div class="career-types">${career.types.join(', ')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button id="saveRAISECBtn" class="btn-primary">
                        <i class="fas fa-save"></i> RAISEC-Profil speichern
                    </button>
                    <button id="exportRAISECBtn" class="btn-secondary">
                        <i class="fas fa-download"></i> Als PDF exportieren
                    </button>
                </div>
            </div>
        `;
        
        this.setupResultsEventListeners();
    }
    
    getTypeName(type) {
        const names = {
            R: 'Realistisch',
            A: 'Analytisch',
            I: 'Künstlerisch',
            S: 'Sozial',
            E: 'Unternehmerisch',
            C: 'Konventionell'
        };
        return names[type] || type;
    }
    
    getTypeDescription(type) {
        const descriptions = {
            R: 'Praktisch, handwerklich, technisch orientiert',
            A: 'Forschend, wissenschaftlich, intellektuell',
            I: 'Kreativ, expressiv, unkonventionell',
            S: 'Hilfsbereit, kommunikativ, kooperativ',
            E: 'Führungsstark, verkaufsorientiert, ehrgeizig',
            C: 'Strukturiert, organisiert, detailorientiert'
        };
        return descriptions[type] || '';
    }
    
    getCareerRecommendations() {
        const topTypes = this.rankedTypes.slice(0, 3).map(item => item.type);
        
        const careers = {
            R: [
                { title: 'Ingenieur', description: 'Maschinenbau, Elektrotechnik', types: ['R', 'A'] },
                { title: 'Techniker', description: 'Wartung und Reparatur', types: ['R'] },
                { title: 'Landwirt', description: 'Landwirtschaft und Forstwirtschaft', types: ['R'] }
            ],
            A: [
                { title: 'Wissenschaftler', description: 'Forschung und Entwicklung', types: ['A'] },
                { title: 'Arzt', description: 'Medizin und Gesundheit', types: ['A', 'S'] },
                { title: 'Programmierer', description: 'Software-Entwicklung', types: ['A', 'C'] }
            ],
            I: [
                { title: 'Künstler', description: 'Bildende Kunst und Design', types: ['I'] },
                { title: 'Musiker', description: 'Musik und Komposition', types: ['I'] },
                { title: 'Schriftsteller', description: 'Literatur und Journalismus', types: ['I', 'A'] }
            ],
            S: [
                { title: 'Lehrer', description: 'Bildung und Erziehung', types: ['S'] },
                { title: 'Sozialarbeiter', description: 'Soziale Arbeit', types: ['S'] },
                { title: 'Therapeut', description: 'Psychologie und Beratung', types: ['S', 'A'] }
            ],
            E: [
                { title: 'Manager', description: 'Führung und Management', types: ['E', 'S'] },
                { title: 'Verkäufer', description: 'Sales und Marketing', types: ['E'] },
                { title: 'Unternehmer', description: 'Gründung und Innovation', types: ['E', 'I'] }
            ],
            C: [
                { title: 'Buchhalter', description: 'Finanzen und Controlling', types: ['C'] },
                { title: 'Sekretär', description: 'Verwaltung und Organisation', types: ['C'] },
                { title: 'Banker', description: 'Finanzwesen', types: ['C', 'E'] }
            ]
        };
        
        const recommendations = [];
        topTypes.forEach(type => {
            if (careers[type]) {
                recommendations.push(...careers[type]);
            }
        });
        
        return recommendations.slice(0, 6); // Top 6 recommendations
    }
    
    setupResultsEventListeners() {
        document.getElementById('saveRAISECBtn')?.addEventListener('click', () => this.saveRAISEC());
        document.getElementById('exportRAISECBtn')?.addEventListener('click', () => this.exportRAISEC());
    }
    
    saveRAISEC() {
        const raisecData = {
            scores: this.scores,
            percentages: this.percentages,
            rankedTypes: this.rankedTypes,
            timestamp: new Date().toISOString(),
            method: 'raisec'
        };
        
        localStorage.setItem('raisecResult', JSON.stringify(raisecData));
        this.showNotification('RAISEC-Profil gespeichert!', 'success');
    }
    
    exportRAISEC() {
        const pdfContent = this.createRAISECPDF();
        this.downloadRAISECPDF(pdfContent);
    }
    
    createRAISECPDF() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Mein RAISEC-Profil</title>
                <style>
                    body { 
                        font-family: 'Inter', Arial, sans-serif; 
                        margin: 0; 
                        padding: 40px; 
                        background: #f8fafc; 
                        line-height: 1.6;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 40px; 
                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                        color: white;
                        padding: 40px;
                        border-radius: 16px;
                    }
                    .logo { 
                        font-size: 2.5rem; 
                        font-weight: 800; 
                        margin-bottom: 10px; 
                    }
                    .subtitle { 
                        font-size: 1.2rem; 
                        opacity: 0.9;
                    }
                    .results-section { 
                        margin-bottom: 30px; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 12px; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                    }
                    .results-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .result-card { 
                        background: linear-gradient(135deg, #f0f4ff, #e0e7ff); 
                        padding: 20px; 
                        border-radius: 12px; 
                        border-left: 4px solid #6366f1;
                    }
                    .result-rank { 
                        font-size: 1.5rem; 
                        font-weight: 700; 
                        color: #6366f1; 
                        margin-bottom: 10px; 
                    }
                    .result-type { 
                        font-size: 1.2rem; 
                        font-weight: 600; 
                        color: #1e293b; 
                        margin-bottom: 5px; 
                    }
                    .result-score { 
                        font-size: 1.1rem; 
                        font-weight: 700; 
                        color: #6366f1; 
                        margin-bottom: 10px; 
                    }
                    .result-description { 
                        color: #64748b; 
                        font-size: 0.9rem;
                    }
                    .footer { 
                        text-align: center; 
                        margin-top: 40px; 
                        color: #64748b; 
                        font-size: 0.9rem; 
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">Mein RAISEC-Profil</div>
                    <div class="subtitle">Berufliche Interessen nach dem Holland-Modell</div>
                </div>

                <div class="results-section">
                    <h2>Dein RAISEC-Profil</h2>
                    <div class="results-grid">
                        ${this.rankedTypes.map((item, index) => `
                            <div class="result-card">
                                <div class="result-rank">#${index + 1}</div>
                                <div class="result-type">${this.getTypeName(item.type)}</div>
                                <div class="result-score">${item.score}%</div>
                                <div class="result-description">${this.getTypeDescription(item.type)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="footer">
                    <p><strong>Manuel Weiss HR-Beratung</strong></p>
                    <p>www.manuel-weiss.de • ${new Date().toLocaleDateString('de-DE')}</p>
                    <p>Erstellt mit dem RAISEC-Modell nach Holland</p>
                </div>
            </body>
            </html>
        `;
    }
    
    downloadRAISECPDF(content) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(content);
        printWindow.document.close();
        
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 1000);
        };
    }
    
    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Frage ${this.currentQuestion + 1} von ${this.totalQuestions}`;
        }
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestion === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentQuestion >= this.totalQuestions - 1;
        }
    }
    
    close() {
        const container = document.getElementById('raisec-complete-workflow');
        if (container) {
            container.remove();
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Make it globally available
window.RAISECCompleteWorkflow = RAISECCompleteWorkflow;
