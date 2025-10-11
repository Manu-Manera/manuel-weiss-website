/**
 * Complete Ikigai Workflow
 * Vollständige Implementierung des Ikigai-Workflows
 */

class IkigaiCompleteWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.workflowData = {
            whatYouLove: [],
            whatYouGoodAt: [],
            whatWorldNeeds: [],
            whatYouPaidFor: [],
            ikigai: null
        };
        
        this.steps = [
            {
                id: 1,
                title: "Was du liebst",
                subtitle: "Was macht dich glücklich?",
                description: "Denke an Aktivitäten, die dir Freude bereiten und bei denen du die Zeit vergisst.",
                icon: "❤️",
                category: "whatYouLove"
            },
            {
                id: 2,
                title: "Was du gut kannst",
                subtitle: "Deine Stärken und Talente",
                description: "Was sind deine natürlichen Fähigkeiten und worin bist du besonders gut?",
                icon: "💪",
                category: "whatYouGoodAt"
            },
            {
                id: 3,
                title: "Was die Welt braucht",
                subtitle: "Dein Beitrag zur Gesellschaft",
                description: "Welche Probleme möchtest du lösen oder womit möchtest du anderen helfen?",
                icon: "🌍",
                category: "whatWorldNeeds"
            },
            {
                id: 4,
                title: "Wofür du bezahlt werden könntest",
                subtitle: "Deine beruflichen Möglichkeiten",
                description: "Welche deiner Fähigkeiten und Interessen könnten zu einem Beruf werden?",
                icon: "💰",
                category: "whatYouPaidFor"
            },
            {
                id: 5,
                title: "Dein Ikigai",
                subtitle: "Die Schnittmenge aller Bereiche",
                description: "Hier findest du dein persönliches Ikigai - deinen Lebenszweck.",
                icon: "🎯",
                category: "ikigai"
            }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing Complete Ikigai Workflow...');
        this.createWorkflowInterface();
        this.loadStep(1);
    }
    
    createWorkflowInterface() {
        const container = document.createElement('div');
        container.id = 'ikigai-complete-workflow';
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
            <div class="ikigai-modal">
                <div class="ikigai-header">
                    <h2>🎯 Ikigai - Finde deinen Lebenszweck</h2>
                    <p>Entdecke was du liebst, was du gut kannst, was die Welt braucht und wofür du bezahlt werden könntest</p>
                    <button class="close-btn" onclick="ikigaiCompleteWorkflow.close()">×</button>
                </div>
                
                <div class="ikigai-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 20%"></div>
                    </div>
                    <div class="progress-text">Schritt 1 von 5</div>
                </div>
                
                <div class="ikigai-content">
                    <div id="ikigaiStepContainer">
                        <!-- Step content will be loaded here -->
                    </div>
                </div>
                
                <div class="ikigai-navigation">
                    <button id="prevStepBtn" class="btn-secondary" disabled>
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    <button id="nextStepBtn" class="btn-primary">
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('prevStepBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('nextStepBtn')?.addEventListener('click', () => this.nextStep());
    }
    
    loadStep(stepNumber) {
        const step = this.steps[stepNumber - 1];
        if (!step) return;
        
        const container = document.getElementById('ikigaiStepContainer');
        if (!container) return;
        
        if (stepNumber <= 4) {
            this.showInputStep(step);
        } else {
            this.showIkigaiResult();
        }
        
        this.updateProgress();
        this.updateNavigation();
    }
    
    showInputStep(step) {
        const container = document.getElementById('ikigaiStepContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="step-content">
                <div class="step-header">
                    <div class="step-icon">${step.icon}</div>
                    <h3>${step.title}</h3>
                    <p class="step-subtitle">${step.subtitle}</p>
                    <p class="step-description">${step.description}</p>
                </div>
                
                <div class="input-section">
                    <div class="input-group">
                        <input type="text" id="ikigaiInput" placeholder="Gib deine Antwort ein..." autocomplete="off">
                        <button id="addItemBtn" class="btn-add">
                            <i class="fas fa-plus"></i> Hinzufügen
                        </button>
                    </div>
                    
                    <div class="suggestions">
                        <h4>Vorschläge:</h4>
                        <div class="suggestion-tags">
                            ${this.getSuggestions(step.category).map(suggestion => `
                                <span class="suggestion-tag" onclick="ikigaiCompleteWorkflow.addSuggestion('${suggestion}')">
                                    ${suggestion}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="items-list">
                    <h4>Deine Antworten (${this.workflowData[step.category].length}):</h4>
                    <div id="itemsContainer" class="items-container">
                        ${this.workflowData[step.category].map((item, index) => `
                            <div class="item-card">
                                <span class="item-text">${item}</span>
                                <button class="remove-btn" onclick="ikigaiCompleteWorkflow.removeItem('${step.category}', ${index})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.setupStepEventListeners(step.category);
    }
    
    getSuggestions(category) {
        const suggestions = {
            whatYouLove: [
                "Musik hören", "Lesen", "Sport treiben", "Kochen", "Reisen", 
                "Fotografieren", "Gärtnern", "Tanzen", "Malen", "Schreiben"
            ],
            whatYouGoodAt: [
                "Probleme lösen", "Kommunizieren", "Organisieren", "Kreativ sein", 
                "Analysieren", "Führen", "Lernen", "Zuhören", "Planen", "Motivieren"
            ],
            whatWorldNeeds: [
                "Umweltschutz", "Bildung", "Gesundheit", "Gerechtigkeit", "Frieden", 
                "Innovation", "Gemeinschaft", "Nachhaltigkeit", "Toleranz", "Hilfsbereitschaft"
            ],
            whatYouPaidFor: [
                "Beratung", "Coaching", "Design", "Programmierung", "Verkauf", 
                "Marketing", "Beratung", "Training", "Schreiben", "Fotografie"
            ]
        };
        
        return suggestions[category] || [];
    }
    
    setupStepEventListeners(category) {
        document.getElementById('addItemBtn')?.addEventListener('click', () => this.addItem(category));
        document.getElementById('ikigaiInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addItem(category);
            }
        });
    }
    
    addItem(category) {
        const input = document.getElementById('ikigaiInput');
        if (!input || !input.value.trim()) return;
        
        const value = input.value.trim();
        if (!this.workflowData[category].includes(value)) {
            this.workflowData[category].push(value);
            this.updateItemsDisplay(category);
            input.value = '';
        }
    }
    
    addSuggestion(suggestion) {
        const currentStep = this.steps[this.currentStep - 1];
        if (!this.workflowData[currentStep.category].includes(suggestion)) {
            this.workflowData[currentStep.category].push(suggestion);
            this.updateItemsDisplay(currentStep.category);
        }
    }
    
    removeItem(category, index) {
        this.workflowData[category].splice(index, 1);
        this.updateItemsDisplay(category);
    }
    
    updateItemsDisplay(category) {
        const container = document.getElementById('itemsContainer');
        if (!container) return;
        
        container.innerHTML = this.workflowData[category].map((item, index) => `
            <div class="item-card">
                <span class="item-text">${item}</span>
                <button class="remove-btn" onclick="ikigaiCompleteWorkflow.removeItem('${category}', ${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    showIkigaiResult() {
        const container = document.getElementById('ikigaiStepContainer');
        if (!container) return;
        
        // Find intersections
        const intersections = this.findIntersections();
        
        container.innerHTML = `
            <div class="ikigai-result">
                <div class="result-header">
                    <h3>🎯 Dein Ikigai</h3>
                    <p>Die Schnittmenge deiner Antworten zeigt deinen Lebenszweck:</p>
                </div>
                
                <div class="ikigai-diagram">
                    <div class="ikigai-circle">
                        <div class="circle-section love">
                            <h4>Was du liebst</h4>
                            <div class="items">${this.workflowData.whatYouLove.map(item => `<span>${item}</span>`).join(', ')}</div>
                        </div>
                        <div class="circle-section good">
                            <h4>Was du gut kannst</h4>
                            <div class="items">${this.workflowData.whatYouGoodAt.map(item => `<span>${item}</span>`).join(', ')}</div>
                        </div>
                        <div class="circle-section needs">
                            <h4>Was die Welt braucht</h4>
                            <div class="items">${this.workflowData.whatWorldNeeds.map(item => `<span>${item}</span>`).join(', ')}</div>
                        </div>
                        <div class="circle-section paid">
                            <h4>Wofür du bezahlt werden könntest</h4>
                            <div class="items">${this.workflowData.whatYouPaidFor.map(item => `<span>${item}</span>`).join(', ')}</div>
                        </div>
                        <div class="ikigai-center">
                            <h3>Dein Ikigai</h3>
                            <div class="ikigai-items">
                                ${intersections.map(item => `<span>${item}</span>`).join(', ')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button id="saveIkigaiBtn" class="btn-primary">
                        <i class="fas fa-save"></i> Ikigai speichern
                    </button>
                    <button id="exportIkigaiBtn" class="btn-secondary">
                        <i class="fas fa-download"></i> Als PDF exportieren
                    </button>
                </div>
            </div>
        `;
        
        this.setupResultEventListeners();
    }
    
    findIntersections() {
        const allItems = [
            ...this.workflowData.whatYouLove,
            ...this.workflowData.whatYouGoodAt,
            ...this.workflowData.whatWorldNeeds,
            ...this.workflowData.whatYouPaidFor
        ];
        
        // Find items that appear in multiple categories
        const itemCounts = {};
        allItems.forEach(item => {
            itemCounts[item] = (itemCounts[item] || 0) + 1;
        });
        
        return Object.entries(itemCounts)
            .filter(([item, count]) => count > 1)
            .map(([item, count]) => item)
            .slice(0, 5); // Top 5 intersections
    }
    
    setupResultEventListeners() {
        document.getElementById('saveIkigaiBtn')?.addEventListener('click', () => this.saveIkigai());
        document.getElementById('exportIkigaiBtn')?.addEventListener('click', () => this.exportIkigai());
    }
    
    saveIkigai() {
        const ikigaiData = {
            ...this.workflowData,
            timestamp: new Date().toISOString(),
            method: 'ikigai'
        };
        
        localStorage.setItem('ikigaiResult', JSON.stringify(ikigaiData));
        this.showNotification('Ikigai gespeichert!', 'success');
    }
    
    exportIkigai() {
        const pdfContent = this.createIkigaiPDF();
        this.downloadIkigaiPDF(pdfContent);
    }
    
    createIkigaiPDF() {
        const intersections = this.findIntersections();
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Mein Ikigai</title>
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
                        background: linear-gradient(135deg, #667eea, #764ba2);
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
                    .ikigai-section { 
                        margin-bottom: 30px; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 12px; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                    }
                    .ikigai-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .ikigai-card { 
                        background: linear-gradient(135deg, #f0f4ff, #e0e7ff); 
                        padding: 20px; 
                        border-radius: 12px; 
                        border-left: 4px solid #667eea;
                    }
                    .ikigai-title { 
                        font-size: 1.2rem; 
                        font-weight: 700; 
                        color: #667eea; 
                        margin-bottom: 10px; 
                    }
                    .ikigai-items { 
                        color: #64748b; 
                        font-size: 0.95rem;
                    }
                    .ikigai-center {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        padding: 30px;
                        border-radius: 12px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .ikigai-center h3 {
                        font-size: 1.5rem;
                        margin-bottom: 15px;
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
                    <div class="logo">Mein Ikigai</div>
                    <div class="subtitle">Dein persönlicher Lebenszweck</div>
                </div>

                <div class="ikigai-section">
                    <h2>Dein Ikigai-Diagramm</h2>
                    <div class="ikigai-grid">
                        <div class="ikigai-card">
                            <div class="ikigai-title">Was du liebst</div>
                            <div class="ikigai-items">${this.workflowData.whatYouLove.join(', ')}</div>
                        </div>
                        <div class="ikigai-card">
                            <div class="ikigai-title">Was du gut kannst</div>
                            <div class="ikigai-items">${this.workflowData.whatYouGoodAt.join(', ')}</div>
                        </div>
                        <div class="ikigai-card">
                            <div class="ikigai-title">Was die Welt braucht</div>
                            <div class="ikigai-items">${this.workflowData.whatWorldNeeds.join(', ')}</div>
                        </div>
                        <div class="ikigai-card">
                            <div class="ikigai-title">Wofür du bezahlt werden könntest</div>
                            <div class="ikigai-items">${this.workflowData.whatYouPaidFor.join(', ')}</div>
                        </div>
                    </div>
                    
                    <div class="ikigai-center">
                        <h3>Dein Ikigai</h3>
                        <div>${intersections.join(', ')}</div>
                    </div>
                </div>

                <div class="footer">
                    <p><strong>Manuel Weiss HR-Beratung</strong></p>
                    <p>www.manuel-weiss.de • ${new Date().toLocaleDateString('de-DE')}</p>
                    <p>Erstellt mit dem Ikigai-Workflow</p>
                </div>
            </body>
            </html>
        `;
    }
    
    downloadIkigaiPDF(content) {
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
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.loadStep(this.currentStep);
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.loadStep(this.currentStep);
        }
    }
    
    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Schritt ${this.currentStep} von ${this.totalSteps}`;
        }
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'inline-flex';
            }
        }
    }
    
    close() {
        const container = document.getElementById('ikigai-complete-workflow');
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
window.IkigaiCompleteWorkflow = IkigaiCompleteWorkflow;
