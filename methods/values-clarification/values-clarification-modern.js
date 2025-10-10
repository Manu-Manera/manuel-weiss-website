/**
 * Modern Values Clarification JavaScript
 * Vollständig modernisierte UX und Funktionalität
 */

class ModernValuesClarification {
    constructor() {
        this.currentStep = 1;
        this.selectedValues = [];
        this.rankedValues = [];
        this.conflicts = [];
        this.lifeAreas = {
            career: [],
            relationships: [],
            health: [],
            personal: []
        };
        
        this.valuesDatabase = [
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
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadValues();
        this.updateProgress();
        this.updateSelectedCount();
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('valuesSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterValues(e.target.value));
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.category));
        });
        
        // Custom value input
        const customInput = document.getElementById('customValue');
        if (customInput) {
            customInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addCustomValue();
                }
            });
        }
        
        // Life area cards
        document.querySelectorAll('.area-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectLifeArea(e.currentTarget));
        });
    }
    
    loadValues() {
        const grid = document.getElementById('valuesGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.valuesDatabase.forEach(value => {
            const card = this.createValueCard(value);
            grid.appendChild(card);
        });
    }
    
    createValueCard(value) {
        const card = document.createElement('div');
        card.className = 'value-card';
        card.dataset.valueId = value.id;
        card.dataset.category = value.category;
        
        card.innerHTML = `
            <div class="value-title">${value.title}</div>
            <div class="value-description">${value.description}</div>
            <div class="value-category">${this.getCategoryName(value.category)}</div>
        `;
        
        card.addEventListener('click', () => this.toggleValue(value));
        
        return card;
    }
    
    getCategoryName(category) {
        const names = {
            personal: 'Persönlich',
            professional: 'Beruflich',
            relationships: 'Beziehungen',
            spiritual: 'Spirituell'
        };
        return names[category] || category;
    }
    
    toggleValue(value) {
        const card = document.querySelector(`[data-value-id="${value.id}"]`);
        const isSelected = this.selectedValues.some(v => v.id === value.id);
        
        if (isSelected) {
            this.selectedValues = this.selectedValues.filter(v => v.id !== value.id);
            card.classList.remove('selected');
        } else {
            this.selectedValues.push(value);
            card.classList.add('selected');
        }
        
        this.updateSelectedValues();
        this.updateSelectedCount();
        this.updateNextButton();
    }
    
    updateSelectedValues() {
        const container = document.getElementById('selectedValues');
        if (!container) return;
        
        if (this.selectedValues.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <p>Wähle Werte aus, die dir wichtig sind</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.selectedValues.map(value => `
            <div class="selected-value">
                <span>${value.title}</span>
                <button class="remove-btn" onclick="valuesClarification.removeValue(${value.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    removeValue(valueId) {
        this.selectedValues = this.selectedValues.filter(v => v.id !== valueId);
        const card = document.querySelector(`[data-value-id="${valueId}"]`);
        if (card) {
            card.classList.remove('selected');
        }
        this.updateSelectedValues();
        this.updateSelectedCount();
        this.updateNextButton();
    }
    
    updateSelectedCount() {
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = this.selectedValues.length;
        }
    }
    
    updateNextButton() {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.disabled = this.selectedValues.length === 0;
        }
    }
    
    filterValues(searchTerm) {
        const cards = document.querySelectorAll('.value-card');
        const term = searchTerm.toLowerCase();
        
        cards.forEach(card => {
            const title = card.querySelector('.value-title').textContent.toLowerCase();
            const description = card.querySelector('.value-description').textContent.toLowerCase();
            const matches = title.includes(term) || description.includes(term);
            
            card.style.display = matches ? 'block' : 'none';
        });
    }
    
    setFilter(category) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Filter values
        const cards = document.querySelectorAll('.value-card');
        cards.forEach(card => {
            const cardCategory = card.dataset.category;
            const matches = category === 'all' || cardCategory === category;
            card.style.display = matches ? 'block' : 'none';
        });
    }
    
    addCustomValue() {
        const input = document.getElementById('customValue');
        const value = input.value.trim();
        
        if (!value) return;
        
        const customValue = {
            id: Date.now(),
            title: value,
            description: 'Eigener Wert',
            category: 'personal'
        };
        
        this.valuesDatabase.push(customValue);
        this.selectedValues.push(customValue);
        
        // Add to grid
        const grid = document.getElementById('valuesGrid');
        const card = this.createValueCard(customValue);
        card.classList.add('selected');
        grid.appendChild(card);
        
        // Clear input
        input.value = '';
        
        this.updateSelectedValues();
        this.updateSelectedCount();
        this.updateNextButton();
    }
    
    nextStep() {
        if (this.currentStep < 5) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
            
            if (this.currentStep === 2) {
                this.setupRanking();
            } else if (this.currentStep === 3) {
                this.analyzeConflicts();
            } else if (this.currentStep === 4) {
                this.setupLifeAreas();
            } else if (this.currentStep === 5) {
                this.setupTracking();
            }
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
        }
    }
    
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.workflow-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStep = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
        
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum === stepNumber) {
                step.classList.add('active');
            } else if (stepNum < stepNumber) {
                step.classList.add('completed');
            }
        });
    }
    
    updateProgress() {
        const progress = (this.currentStep / 5) * 100;
        const progressText = document.querySelector('.progress-text');
        const progressCircle = document.querySelector('.progress-circle');
        
        if (progressText) {
            progressText.textContent = Math.round(progress) + '%';
        }
        
        if (progressCircle) {
            progressCircle.style.background = `conic-gradient(#6366f1 ${progress * 3.6}deg, #e5e7eb 0deg)`;
        }
    }
    
    setupRanking() {
        const rankingList = document.getElementById('rankingList');
        if (!rankingList) return;
        
        rankingList.innerHTML = '';
        
        this.selectedValues.forEach((value, index) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            item.draggable = true;
            item.dataset.valueId = value.id;
            
            item.innerHTML = `
                <div class="ranking-number">${index + 1}</div>
                <div class="ranking-content">
                    <div class="ranking-title">${value.title}</div>
                    <div class="ranking-description">${value.description}</div>
                </div>
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
            `;
            
            // Drag and drop functionality
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', '');
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleRankingDrop(item);
            });
            
            rankingList.appendChild(item);
        });
        
        this.rankedValues = [...this.selectedValues];
    }
    
    handleRankingDrop(droppedItem) {
        // Simple reordering logic - in a real implementation, you'd use a proper drag-and-drop library
        const items = Array.from(document.querySelectorAll('.ranking-item'));
        const droppedIndex = items.indexOf(droppedItem);
        
        // Update ranking numbers
        items.forEach((item, index) => {
            const number = item.querySelector('.ranking-number');
            if (number) {
                number.textContent = index + 1;
            }
        });
    }
    
    analyzeConflicts() {
        const conflictResults = document.getElementById('conflictResults');
        if (!conflictResults) return;
        
        // Simulate conflict analysis
        const conflicts = this.detectConflicts();
        
        if (conflicts.length === 0) {
            conflictResults.innerHTML = `
                <div class="conflict-card">
                    <h4>✅ Keine Konflikte gefunden</h4>
                    <p>Deine Werte sind gut miteinander vereinbar!</p>
                </div>
            `;
        } else {
            conflictResults.innerHTML = conflicts.map(conflict => `
                <div class="conflict-card">
                    <h4>⚠️ ${conflict.title}</h4>
                    <p>${conflict.description}</p>
                    <div class="conflict-solution">
                        <h5>💡 Lösungsvorschlag:</h5>
                        <p>${conflict.solution}</p>
                    </div>
                </div>
            `).join('');
        }
    }
    
    detectConflicts() {
        // Simple conflict detection logic
        const conflicts = [];
        
        const hasCareer = this.selectedValues.some(v => v.category === 'professional');
        const hasFamily = this.selectedValues.some(v => v.title === 'Familie');
        const hasAdventure = this.selectedValues.some(v => v.title === 'Abenteuer');
        const hasSecurity = this.selectedValues.some(v => v.title === 'Finanzielle Sicherheit');
        
        if (hasCareer && hasFamily) {
            conflicts.push({
                title: 'Work-Life-Balance',
                description: 'Berufliche Ambitionen und Familienzeit können sich widersprechen.',
                solution: 'Definiere klare Prioritäten und schaffe feste Zeiten für beide Bereiche.'
            });
        }
        
        if (hasAdventure && hasSecurity) {
            conflicts.push({
                title: 'Sicherheit vs. Abenteuer',
                description: 'Finanzielle Sicherheit und Abenteuerlust können sich gegenseitig einschränken.',
                solution: 'Finde einen Mittelweg durch geplante Abenteuer und finanzielle Rücklagen.'
            });
        }
        
        return conflicts;
    }
    
    setupLifeAreas() {
        // Reset life areas
        this.lifeAreas = {
            career: [],
            relationships: [],
            health: [],
            personal: []
        };
        
        // Update area cards
        document.querySelectorAll('.area-card').forEach(card => {
            card.classList.remove('selected');
            const areaValues = card.querySelector('.area-values');
            if (areaValues) {
                areaValues.innerHTML = '';
            }
        });
    }
    
    selectLifeArea(card) {
        const area = card.dataset.area;
        const isSelected = card.classList.contains('selected');
        
        if (isSelected) {
            card.classList.remove('selected');
            this.lifeAreas[area] = [];
        } else {
            card.classList.add('selected');
            // In a real implementation, you'd show a modal to select values for this area
            this.lifeAreas[area] = [...this.selectedValues];
        }
        
        this.updateLifeAreaValues(card, area);
    }
    
    updateLifeAreaValues(card, area) {
        const areaValues = card.querySelector('.area-values');
        if (!areaValues) return;
        
        const values = this.lifeAreas[area];
        areaValues.innerHTML = values.map(value => `
            <div class="area-value">${value.title}</div>
        `).join('');
    }
    
    setupTracking() {
        // Simulate tracking data
        const trackingCards = document.querySelectorAll('.tracking-card');
        trackingCards.forEach(card => {
            const percentage = card.querySelector('.progress-percentage');
            const fill = card.querySelector('.progress-fill');
            
            if (percentage && fill) {
                const value = Math.floor(Math.random() * 40) + 60; // 60-100%
                percentage.textContent = value + '%';
                fill.style.width = value + '%';
            }
        });
    }
    
    completeWorkflow() {
        // Show success modal
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('active');
        }
        
        // Save results
        this.saveResults();
    }
    
    saveResults() {
        const results = {
            selectedValues: this.selectedValues,
            rankedValues: this.rankedValues,
            conflicts: this.conflicts,
            lifeAreas: this.lifeAreas,
            completedAt: new Date().toISOString()
        };
        
        localStorage.setItem('valuesClarificationResults', JSON.stringify(results));
    }
    
    downloadResults() {
        const results = JSON.parse(localStorage.getItem('valuesClarificationResults') || '{}');
        
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'werte-klarung-ergebnisse.json';
        link.click();
    }
    
    closeModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Global functions for HTML onclick handlers
function nextStep() {
    window.valuesClarification.nextStep();
}

function prevStep() {
    window.valuesClarification.prevStep();
}

function skipStep() {
    window.valuesClarification.nextStep();
}

function addCustomValue() {
    window.valuesClarification.addCustomValue();
}

function downloadResults() {
    window.valuesClarification.downloadResults();
}

function closeModal() {
    window.valuesClarification.closeModal();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.valuesClarification = new ModernValuesClarification();
});

console.log('🎯 Modern Values Clarification loaded');
