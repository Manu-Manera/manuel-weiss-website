/**
 * Interactive Values Discovery Workflow
 * Entdeckt Werte durch gezielte Fragen
 */

class ValuesQuestionsWorkflow {
    constructor() {
        this.currentQuestion = 0;
        this.answers = [];
        this.discoveredValues = [];
        this.selectedValues = [];
        this.questions = [
            {
                id: 1,
                title: "Was motiviert dich am meisten?",
                type: "multiple",
                options: [
                    { text: "Neue Herausforderungen zu meistern", values: ["Abenteuer", "Wachstum", "Erfolg"] },
                    { text: "Anderen zu helfen und zu dienen", values: ["Hilfsbereitschaft", "Mitgefühl", "Gemeinschaft"] },
                    { text: "Kreativ und innovativ zu sein", values: ["Kreativität", "Innovation", "Authentizität"] },
                    { text: "Tiefe Beziehungen aufzubauen", values: ["Liebe", "Verbindung", "Vertrauen"] },
                    { text: "Wissen und Weisheit zu erlangen", values: ["Weisheit", "Wachstum", "Spiritualität"] }
                ]
            },
            {
                id: 2,
                title: "In welcher Situation fühlst du dich am lebendigsten?",
                type: "multiple",
                options: [
                    { text: "Wenn ich allein in der Natur bin", values: ["Frieden", "Spiritualität", "Freiheit"] },
                    { text: "Wenn ich mit Freunden zusammen bin", values: ["Freundschaft", "Gemeinschaft", "Verbindung"] },
                    { text: "Wenn ich etwas Neues lerne", values: ["Wachstum", "Weisheit", "Kreativität"] },
                    { text: "Wenn ich anderen helfe", values: ["Hilfsbereitschaft", "Mitgefühl", "Anerkennung"] },
                    { text: "Wenn ich ein Ziel erreiche", values: ["Erfolg", "Selbstachtung", "Anerkennung"] }
                ]
            },
            {
                id: 3,
                title: "Was ist dir in Beziehungen am wichtigsten?",
                type: "multiple",
                options: [
                    { text: "Vertrauen und Ehrlichkeit", values: ["Vertrauen", "Integrität", "Respekt"] },
                    { text: "Gegenseitige Unterstützung", values: ["Hilfsbereitschaft", "Liebe", "Verbindung"] },
                    { text: "Gemeinsame Abenteuer", values: ["Abenteuer", "Kreativität", "Freiheit"] },
                    { text: "Tiefe Gespräche", values: ["Weisheit", "Verbindung", "Authentizität"] },
                    { text: "Gegenseitige Akzeptanz", values: ["Respekt", "Liebe", "Mitgefühl"] }
                ]
            },
            {
                id: 4,
                title: "Was würdest du niemals opfern?",
                type: "multiple",
                options: [
                    { text: "Meine Familie", values: ["Familie", "Liebe", "Verbindung"] },
                    { text: "Meine Prinzipien", values: ["Integrität", "Authentizität", "Respekt"] },
                    { text: "Meine Freiheit", values: ["Freiheit", "Selbstachtung", "Autonomie"] },
                    { text: "Meine Gesundheit", values: ["Gesundheit", "Selbstachtung", "Balance"] },
                    { text: "Meine Spiritualität", values: ["Spiritualität", "Frieden", "Weisheit"] }
                ]
            },
            {
                id: 5,
                title: "Was gibt deinem Leben am meisten Sinn?",
                type: "multiple",
                options: [
                    { text: "Anderen zu helfen", values: ["Hilfsbereitschaft", "Mitgefühl", "Gemeinschaft"] },
                    { text: "Etwas zu erschaffen", values: ["Kreativität", "Innovation", "Authentizität"] },
                    { text: "Zu lernen und zu wachsen", values: ["Wachstum", "Weisheit", "Kreativität"] },
                    { text: "Liebe zu geben und zu empfangen", values: ["Liebe", "Verbindung", "Familie"] },
                    { text: "Einen Beitrag zu leisten", values: ["Einfluss", "Gemeinschaft", "Erfolg"] }
                ]
            },
            {
                id: 6,
                title: "Wie möchtest du in Erinnerung bleiben?",
                type: "multiple",
                options: [
                    { text: "Als jemand, der anderen geholfen hat", values: ["Hilfsbereitschaft", "Mitgefühl", "Gemeinschaft"] },
                    { text: "Als jemand, der authentisch gelebt hat", values: ["Authentizität", "Integrität", "Selbstachtung"] },
                    { text: "Als jemand, der etwas bewegt hat", values: ["Einfluss", "Erfolg", "Innovation"] },
                    { text: "Als jemand, der geliebt hat", values: ["Liebe", "Verbindung", "Familie"] },
                    { text: "Als jemand, der gewachsen ist", values: ["Wachstum", "Weisheit", "Kreativität"] }
                ]
            },
            {
                id: 7,
                title: "Was stresst dich am meisten?",
                type: "multiple",
                options: [
                    { text: "Wenn ich nicht ich selbst sein kann", values: ["Authentizität", "Freiheit", "Selbstachtung"] },
                    { text: "Wenn Beziehungen zerbrechen", values: ["Liebe", "Vertrauen", "Verbindung"] },
                    { text: "Wenn ich nicht wachsen kann", values: ["Wachstum", "Kreativität", "Weisheit"] },
                    { text: "Wenn ich anderen nicht helfen kann", values: ["Hilfsbereitschaft", "Mitgefühl", "Gemeinschaft"] },
                    { text: "Wenn ich meine Ziele nicht erreiche", values: ["Erfolg", "Selbstachtung", "Anerkennung"] }
                ]
            },
            {
                id: 8,
                title: "Was macht dich am glücklichsten?",
                type: "multiple",
                options: [
                    { text: "Zeit mit geliebten Menschen", values: ["Liebe", "Familie", "Verbindung"] },
                    { text: "Etwas Neues zu lernen", values: ["Wachstum", "Weisheit", "Kreativität"] },
                    { text: "Anderen zu helfen", values: ["Hilfsbereitschaft", "Mitgefühl", "Gemeinschaft"] },
                    { text: "Etwas zu erschaffen", values: ["Kreativität", "Innovation", "Authentizität"] },
                    { text: "In Ruhe zu meditieren", values: ["Frieden", "Spiritualität", "Weisheit"] }
                ]
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startWorkflow();
    }
    
    setupEventListeners() {
        // Start questions button
        document.getElementById('startQuestionsBtn')?.addEventListener('click', () => this.startQuestions());
        
        // Start manual selection button
        document.getElementById('startManualBtn')?.addEventListener('click', () => this.startManualSelection());
        
        // Next/Previous buttons
        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevQuestionBtn')?.addEventListener('click', () => this.prevQuestion());
        
        // Skip to manual selection
        document.getElementById('skipToManualBtn')?.addEventListener('click', () => this.skipToManualSelection());
        
        // Manual value selection
        document.getElementById('addCustomValueBtn')?.addEventListener('click', () => this.addCustomValue());
        document.getElementById('valuesSearchInput')?.addEventListener('input', (e) => this.filterValues(e.target.value));
    }
    
    startWorkflow() {
        // Don't start automatically - wait for user to choose
        console.log('🔄 Werte-Workflow ready, waiting for user choice...');
    }
    
    startQuestions() {
        console.log('❓ Starting questions workflow...');
        this.showQuestion(0);
        this.updateProgress();
    }
    
    startManualSelection() {
        console.log('🖱️ Starting manual selection...');
        this.showValueSelectionInterface();
    }
    
    showQuestion(questionIndex) {
        const question = this.questions[questionIndex];
        if (!question) return;
        
        const questionContainer = document.getElementById('questionContainer');
        if (!questionContainer) return;
        
        questionContainer.innerHTML = `
            <div class="question-card">
                <div class="question-header">
                    <div class="question-number">Frage ${questionIndex + 1} von ${this.questions.length}</div>
                    <h3 class="question-title">${question.title}</h3>
                </div>
                
                <div class="question-options">
                    ${question.options.map((option, index) => `
                        <div class="option-card" data-option="${index}">
                            <div class="option-content">
                                <div class="option-text">${option.text}</div>
                                <div class="option-values">
                                    ${option.values.map(value => `<span class="value-tag">${value}</span>`).join('')}
                                </div>
                            </div>
                            <div class="option-selector">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="question-navigation">
                    <button id="prevQuestionBtn" class="btn-secondary" ${questionIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    <button id="nextQuestionBtn" class="btn-primary" disabled>
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                    <button id="skipToManualBtn" class="btn-outline">
                        <i class="fas fa-hand-pointer"></i> Manuell auswählen
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to options
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => this.selectOption(card));
        });
        
        // Re-add event listeners
        document.getElementById('nextQuestionBtn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevQuestionBtn')?.addEventListener('click', () => this.prevQuestion());
        document.getElementById('skipToManualBtn')?.addEventListener('click', () => this.skipToManualSelection());
    }
    
    selectOption(optionCard) {
        // Remove previous selection
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select current option
        optionCard.classList.add('selected');
        
        // Enable next button
        document.getElementById('nextQuestionBtn').disabled = false;
        
        // Store answer
        const optionIndex = parseInt(optionCard.dataset.option);
        this.answers[this.currentQuestion] = optionIndex;
    }
    
    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
        } else {
            this.completeQuestions();
        }
        this.updateProgress();
    }
    
    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
        }
        this.updateProgress();
    }
    
    completeQuestions() {
        // Analyze answers and discover values
        this.analyzeAnswers();
        
        // Show results
        this.showDiscoveredValues();
    }
    
    analyzeAnswers() {
        this.discoveredValues = [];
        const valueCounts = {};
        
        // Count value occurrences from answers
        this.answers.forEach((answerIndex, questionIndex) => {
            if (answerIndex !== undefined) {
                const question = this.questions[questionIndex];
                const selectedOption = question.options[answerIndex];
                
                selectedOption.values.forEach(value => {
                    valueCounts[value] = (valueCounts[value] || 0) + 1;
                });
            }
        });
        
        // Sort by frequency
        this.discoveredValues = Object.entries(valueCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([value, count]) => ({ value, count }))
            .slice(0, 10); // Top 10 values
        
        console.log('🔍 Discovered values:', this.discoveredValues);
    }
    
    showDiscoveredValues() {
        const questionContainer = document.getElementById('questionContainer');
        if (!questionContainer) return;
        
        questionContainer.innerHTML = `
            <div class="discovered-values-card">
                <div class="card-header">
                    <h3><i class="fas fa-magic"></i> Deine entdeckten Werte</h3>
                    <p>Basierend auf deinen Antworten haben wir folgende Werte identifiziert:</p>
                </div>
                
                <div class="discovered-values-grid">
                    ${this.discoveredValues.map((item, index) => `
                        <div class="discovered-value-card" data-value="${item.value}">
                            <div class="value-rank">#${index + 1}</div>
                            <div class="value-name">${item.value}</div>
                            <div class="value-frequency">${item.count}x erwähnt</div>
                            <div class="value-actions">
                                <button class="btn-add-value" onclick="valuesWorkflow.addDiscoveredValue('${item.value}')">
                                    <i class="fas fa-plus"></i> Hinzufügen
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="discovered-actions">
                    <button id="addAllValuesBtn" class="btn-primary">
                        <i class="fas fa-check-double"></i> Alle hinzufügen
                    </button>
                    <button id="manualSelectionBtn" class="btn-secondary">
                        <i class="fas fa-hand-pointer"></i> Manuell auswählen
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('addAllValuesBtn')?.addEventListener('click', () => this.addAllDiscoveredValues());
        document.getElementById('manualSelectionBtn')?.addEventListener('click', () => this.showManualSelection());
    }
    
    addDiscoveredValue(value) {
        if (!this.selectedValues.includes(value)) {
            this.selectedValues.push(value);
            this.updateSelectedValuesDisplay();
        }
    }
    
    addAllDiscoveredValues() {
        this.discoveredValues.forEach(item => {
            if (!this.selectedValues.includes(item.value)) {
                this.selectedValues.push(item.value);
            }
        });
        this.updateSelectedValuesDisplay();
        this.showNotification('Alle entdeckten Werte hinzugefügt!', 'success');
    }
    
    showManualSelection() {
        this.showValueSelectionInterface();
    }
    
    showValueSelectionInterface() {
        const questionContainer = document.getElementById('questionContainer');
        if (!questionContainer) return;
        
        questionContainer.innerHTML = `
            <div class="manual-selection-card">
                <div class="card-header">
                    <h3><i class="fas fa-hand-pointer"></i> Werte manuell auswählen</h3>
                    <p>Wähle zusätzliche Werte aus oder füge eigene hinzu:</p>
                </div>
                
                <div class="search-section">
                    <div class="search-input-group">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="valuesSearchInput" placeholder="Suche nach Werten...">
                        <button id="addCustomValueBtn" class="btn-icon">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="values-categories">
                    <button class="filter-btn active" data-category="all">Alle</button>
                    <button class="filter-btn" data-category="personal">Persönlich</button>
                    <button class="filter-btn" data-category="relationships">Beziehungen</button>
                    <button class="filter-btn" data-category="professional">Beruflich</button>
                    <button class="filter-btn" data-category="spiritual">Spirituell</button>
                </div>
                
                <div id="valuesGrid" class="values-grid">
                    <!-- Values will be loaded here -->
                </div>
                
                <div class="selected-values-section">
                    <h4>Deine ausgewählten Werte (${this.selectedValues.length})</h4>
                    <div id="selectedValuesContainer" class="selected-values-container">
                        ${this.selectedValues.map(value => `
                            <div class="selected-value-tag">
                                <span>${value}</span>
                                <button onclick="valuesWorkflow.removeValue('${value}')" class="remove-btn">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="selection-actions">
                    <button id="continueToRankingBtn" class="btn-primary" ${this.selectedValues.length === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-right"></i> Weiter zum Ranking
                    </button>
                </div>
            </div>
        `;
        
        this.loadValuesGrid();
        this.setupManualSelectionListeners();
    }
    
    loadValuesGrid() {
        const grid = document.getElementById('valuesGrid');
        if (!grid) return;
        
        const valuesDatabase = [
            // Persönliche Werte
            { id: 1, title: 'Authentizität', description: 'Ehrlich zu sich selbst und anderen sein', category: 'personal' },
            { id: 2, title: 'Freiheit', description: 'Unabhängigkeit und Selbstbestimmung', category: 'personal' },
            { id: 3, title: 'Kreativität', description: 'Schöpferische Ausdrucksfähigkeit', category: 'personal' },
            { id: 4, title: 'Wachstum', description: 'Persönliche Entwicklung und Lernen', category: 'personal' },
            { id: 5, title: 'Abenteuer', description: 'Neue Erfahrungen und Herausforderungen', category: 'personal' },
            { id: 6, title: 'Spiritualität', description: 'Sinn und Verbindung zum Höheren', category: 'spiritual' },
            { id: 7, title: 'Selbstachtung', description: 'Respekt vor sich selbst', category: 'personal' },
            { id: 8, title: 'Integrität', description: 'Moralische Prinzipien und Ehrlichkeit', category: 'personal' },
            
            // Beziehungs-Werte
            { id: 9, title: 'Liebe', description: 'Tiefe emotionale Verbindung', category: 'relationships' },
            { id: 10, title: 'Familie', description: 'Bindung zu Familienmitgliedern', category: 'relationships' },
            { id: 11, title: 'Freundschaft', description: 'Loyale und vertrauensvolle Beziehungen', category: 'relationships' },
            { id: 12, title: 'Gemeinschaft', description: 'Zugehörigkeit zu einer Gruppe', category: 'relationships' },
            { id: 13, title: 'Hilfsbereitschaft', description: 'Anderen helfen und unterstützen', category: 'relationships' },
            { id: 14, title: 'Vertrauen', description: 'Gegenseitiges Vertrauen in Beziehungen', category: 'relationships' },
            { id: 15, title: 'Respekt', description: 'Achtung vor anderen Menschen', category: 'relationships' },
            { id: 16, title: 'Verbindung', description: 'Tiefe emotionale Verbundenheit', category: 'relationships' },
            
            // Berufliche Werte
            { id: 17, title: 'Erfolg', description: 'Ziele erreichen und Leistung zeigen', category: 'professional' },
            { id: 18, title: 'Karriere', description: 'Beruflicher Aufstieg und Entwicklung', category: 'professional' },
            { id: 19, title: 'Finanzielle Sicherheit', description: 'Materielle Absicherung', category: 'professional' },
            { id: 20, title: 'Einfluss', description: 'Wirkung auf andere und Gesellschaft', category: 'professional' },
            { id: 21, title: 'Anerkennung', description: 'Wertschätzung für Leistungen', category: 'professional' },
            { id: 22, title: 'Führung', description: 'Andere führen und inspirieren', category: 'professional' },
            { id: 23, title: 'Innovation', description: 'Neue Ideen entwickeln und umsetzen', category: 'professional' },
            { id: 24, title: 'Teamwork', description: 'Zusammenarbeit und Kooperation', category: 'professional' },
            
            // Spirituelle Werte
            { id: 25, title: 'Frieden', description: 'Innerer und äußerer Frieden', category: 'spiritual' },
            { id: 26, title: 'Harmonie', description: 'Ausgewogenheit und Einklang', category: 'spiritual' },
            { id: 27, title: 'Weisheit', description: 'Tiefes Verständnis und Einsicht', category: 'spiritual' },
            { id: 28, title: 'Dankbarkeit', description: 'Wertschätzung für das Leben', category: 'spiritual' },
            { id: 29, title: 'Vergebung', description: 'Loslassen von Groll und Verletzungen', category: 'spiritual' },
            { id: 30, title: 'Mitgefühl', description: 'Empathie und Verständnis für andere', category: 'spiritual' }
        ];
        
        grid.innerHTML = valuesDatabase.map(value => `
            <div class="value-card ${this.selectedValues.includes(value.title) ? 'selected' : ''}" 
                 data-value="${value.title}" 
                 data-category="${value.category}">
                <div class="value-header">
                    <h4 class="value-title">${value.title}</h4>
                    <div class="value-category">${value.category}</div>
                </div>
                <p class="value-description">${value.description}</p>
                <div class="value-actions">
                    <button class="btn-toggle-value" onclick="valuesWorkflow.toggleValue('${value.title}')">
                        <i class="fas fa-${this.selectedValues.includes(value.title) ? 'check' : 'plus'}"></i>
                        ${this.selectedValues.includes(value.title) ? 'Entfernen' : 'Hinzufügen'}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    setupManualSelectionListeners() {
        // Search functionality
        document.getElementById('valuesSearchInput')?.addEventListener('input', (e) => this.filterValues(e.target.value));
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.category));
        });
        
        // Continue button
        document.getElementById('continueToRankingBtn')?.addEventListener('click', () => this.continueToRanking());
    }
    
    toggleValue(value) {
        if (this.selectedValues.includes(value)) {
            this.removeValue(value);
        } else {
            this.addValue(value);
        }
    }
    
    addValue(value) {
        if (!this.selectedValues.includes(value)) {
            this.selectedValues.push(value);
            this.updateSelectedValuesDisplay();
            this.updateContinueButton();
        }
    }
    
    removeValue(value) {
        this.selectedValues = this.selectedValues.filter(v => v !== value);
        this.updateSelectedValuesDisplay();
        this.updateContinueButton();
    }
    
    updateSelectedValuesDisplay() {
        const container = document.getElementById('selectedValuesContainer');
        if (!container) return;
        
        container.innerHTML = this.selectedValues.map(value => `
            <div class="selected-value-tag">
                <span>${value}</span>
                <button onclick="valuesWorkflow.removeValue('${value}')" class="remove-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Update value cards
        document.querySelectorAll('.value-card').forEach(card => {
            const value = card.dataset.value;
            if (this.selectedValues.includes(value)) {
                card.classList.add('selected');
                card.querySelector('.btn-toggle-value').innerHTML = `
                    <i class="fas fa-check"></i> Entfernen
                `;
            } else {
                card.classList.remove('selected');
                card.querySelector('.btn-toggle-value').innerHTML = `
                    <i class="fas fa-plus"></i> Hinzufügen
                `;
            }
        });
    }
    
    updateContinueButton() {
        const btn = document.getElementById('continueToRankingBtn');
        if (btn) {
            btn.disabled = this.selectedValues.length === 0;
        }
    }
    
    continueToRanking() {
        if (this.selectedValues.length === 0) {
            this.showNotification('Bitte wähle mindestens einen Wert aus', 'warning');
            return;
        }
        
        // Proceed to ranking step
        this.showNotification('Werte ausgewählt! Weiter zum Ranking...', 'success');
        // Here you would proceed to the ranking step
        console.log('Selected values:', this.selectedValues);
    }
    
    filterValues(searchTerm) {
        const cards = document.querySelectorAll('.value-card');
        cards.forEach(card => {
            const title = card.querySelector('.value-title').textContent.toLowerCase();
            const description = card.querySelector('.value-description').textContent.toLowerCase();
            const matches = title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
            card.style.display = matches ? 'block' : 'none';
        });
    }
    
    setFilter(category) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Filter cards
        const cards = document.querySelectorAll('.value-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    skipToManualSelection() {
        this.showValueSelectionInterface();
    }
    
    updateProgress() {
        const progress = Math.round((this.currentQuestion / this.questions.length) * 100);
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the workflow
let valuesWorkflow;
document.addEventListener('DOMContentLoaded', () => {
    valuesWorkflow = new ValuesQuestionsWorkflow();
});
