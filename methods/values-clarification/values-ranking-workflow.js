/**
 * Values Ranking Workflow
 * Ermöglicht das Priorisieren und Ranking von Werten
 */

class ValuesRankingWorkflow {
    constructor(selectedValues) {
        this.selectedValues = selectedValues || [];
        this.rankedValues = [];
        this.currentComparison = 0;
        this.comparisons = [];
        this.init();
    }
    
    init() {
        this.generateComparisons();
        this.showRankingInterface();
    }
    
    generateComparisons() {
        // Generate all possible pairwise comparisons
        this.comparisons = [];
        for (let i = 0; i < this.selectedValues.length; i++) {
            for (let j = i + 1; j < this.selectedValues.length; j++) {
                this.comparisons.push({
                    value1: this.selectedValues[i],
                    value2: this.selectedValues[j],
                    index: this.comparisons.length
                });
            }
        }
        
        // Shuffle comparisons for randomness
        this.comparisons = this.shuffleArray(this.comparisons);
        console.log(`Generated ${this.comparisons.length} comparisons`);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    showRankingInterface() {
        const questionContainer = document.getElementById('questionContainer');
        if (!questionContainer) return;
        
        questionContainer.innerHTML = `
            <div class="ranking-card">
                <div class="card-header">
                    <h3><i class="fas fa-trophy"></i> Werte-Ranking</h3>
                    <p>Vergleiche deine Werte und entscheide, welcher dir wichtiger ist:</p>
                    <div class="progress-info">
                        <span class="progress-text">0%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
                
                <div id="comparisonContainer" class="comparison-container">
                    <!-- Comparison will be loaded here -->
                </div>
                
                <div class="ranking-actions">
                    <button id="skipComparisonBtn" class="btn-outline">
                        <i class="fas fa-forward"></i> Überspringen
                    </button>
                </div>
            </div>
        `;
        
        this.showNextComparison();
        this.setupRankingListeners();
    }
    
    setupRankingListeners() {
        document.getElementById('skipComparisonBtn')?.addEventListener('click', () => this.skipComparison());
    }
    
    showNextComparison() {
        if (this.currentComparison >= this.comparisons.length) {
            this.completeRanking();
            return;
        }
        
        const comparison = this.comparisons[this.currentComparison];
        const comparisonContainer = document.getElementById('comparisonContainer');
        if (!comparisonContainer) return;
        
        comparisonContainer.innerHTML = `
            <div class="comparison-card">
                <div class="comparison-header">
                    <h4>Welcher Wert ist dir wichtiger?</h4>
                    <p>Vergleiche ${comparison.value1} mit ${comparison.value2}</p>
                </div>
                
                <div class="comparison-options">
                    <div class="comparison-option" data-choice="value1">
                        <div class="option-card">
                            <div class="option-icon">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="option-content">
                                <h5>${comparison.value1}</h5>
                                <p>Dieser Wert ist mir wichtiger</p>
                            </div>
                            <div class="option-selector">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="comparison-divider">
                        <span>oder</span>
                    </div>
                    
                    <div class="comparison-option" data-choice="value2">
                        <div class="option-card">
                            <div class="option-icon">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="option-content">
                                <h5>${comparison.value2}</h5>
                                <p>Dieser Wert ist mir wichtiger</p>
                            </div>
                            <div class="option-selector">
                                <i class="fas fa-check"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="comparison-navigation">
                    <button id="continueComparisonBtn" class="btn-primary" disabled>
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to options
        document.querySelectorAll('.comparison-option').forEach(option => {
            option.addEventListener('click', () => this.selectComparison(option));
        });
        
        // Add event listener to continue button
        document.getElementById('continueComparisonBtn')?.addEventListener('click', () => this.continueComparison());
        
        this.updateProgress();
    }
    
    selectComparison(optionElement) {
        // Remove previous selection
        document.querySelectorAll('.comparison-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select current option
        optionElement.classList.add('selected');
        
        // Enable continue button
        document.getElementById('continueComparisonBtn').disabled = false;
    }
    
    continueComparison() {
        const selectedOption = document.querySelector('.comparison-option.selected');
        if (!selectedOption) return;
        
        const choice = selectedOption.dataset.choice;
        const comparison = this.comparisons[this.currentComparison];
        
        // Record the choice
        if (choice === 'value1') {
            this.recordChoice(comparison.value1, comparison.value2);
        } else {
            this.recordChoice(comparison.value2, comparison.value1);
        }
        
        this.currentComparison++;
        this.showNextComparison();
    }
    
    skipComparison() {
        this.currentComparison++;
        this.showNextComparison();
    }
    
    recordChoice(winner, loser) {
        // Add points to winner
        this.addPoints(winner, 1);
        
        // Subtract points from loser (optional)
        // this.addPoints(loser, -0.5);
    }
    
    addPoints(value, points) {
        const existing = this.rankedValues.find(item => item.value === value);
        if (existing) {
            existing.points += points;
        } else {
            this.rankedValues.push({ value, points });
        }
    }
    
    completeRanking() {
        // Sort by points
        this.rankedValues.sort((a, b) => b.points - a.points);
        
        this.showRankingResults();
    }
    
    showRankingResults() {
        const questionContainer = document.getElementById('questionContainer');
        if (!questionContainer) return;
        
        questionContainer.innerHTML = `
            <div class="ranking-results-card">
                <div class="card-header">
                    <h3><i class="fas fa-trophy"></i> Dein Werte-Ranking</h3>
                    <p>Hier ist deine persönliche Werte-Hierarchie:</p>
                </div>
                
                <div class="ranking-list">
                    ${this.rankedValues.map((item, index) => `
                        <div class="ranking-item" data-rank="${index + 1}">
                            <div class="rank-number">${index + 1}</div>
                            <div class="rank-content">
                                <div class="rank-value">${item.value}</div>
                                <div class="rank-points">${item.points.toFixed(1)} Punkte</div>
                            </div>
                            <div class="rank-actions">
                                <button class="btn-move-up" onclick="rankingWorkflow.moveUp(${index})" ${index === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-arrow-up"></i>
                                </button>
                                <button class="btn-move-down" onclick="rankingWorkflow.moveDown(${index})" ${index === this.rankedValues.length - 1 ? 'disabled' : ''}>
                                    <i class="fas fa-arrow-down"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="ranking-actions">
                    <button id="saveRankingBtn" class="btn-primary">
                        <i class="fas fa-save"></i> Ranking speichern
                    </button>
                    <button id="exportRankingBtn" class="btn-secondary">
                        <i class="fas fa-download"></i> Als PDF exportieren
                    </button>
                    <button id="restartRankingBtn" class="btn-outline">
                        <i class="fas fa-redo"></i> Neu starten
                    </button>
                </div>
            </div>
        `;
        
        this.setupResultsListeners();
    }
    
    setupResultsListeners() {
        document.getElementById('saveRankingBtn')?.addEventListener('click', () => this.saveRanking());
        document.getElementById('exportRankingBtn')?.addEventListener('click', () => this.exportRanking());
        document.getElementById('restartRankingBtn')?.addEventListener('click', () => this.restartRanking());
    }
    
    moveUp(index) {
        if (index > 0) {
            [this.rankedValues[index], this.rankedValues[index - 1]] = [this.rankedValues[index - 1], this.rankedValues[index]];
            this.updateRankingDisplay();
        }
    }
    
    moveDown(index) {
        if (index < this.rankedValues.length - 1) {
            [this.rankedValues[index], this.rankedValues[index + 1]] = [this.rankedValues[index + 1], this.rankedValues[index]];
            this.updateRankingDisplay();
        }
    }
    
    updateRankingDisplay() {
        const rankingList = document.querySelector('.ranking-list');
        if (!rankingList) return;
        
        rankingList.innerHTML = this.rankedValues.map((item, index) => `
            <div class="ranking-item" data-rank="${index + 1}">
                <div class="rank-number">${index + 1}</div>
                <div class="rank-content">
                    <div class="rank-value">${item.value}</div>
                    <div class="rank-points">${item.points.toFixed(1)} Punkte</div>
                </div>
                <div class="rank-actions">
                    <button class="btn-move-up" onclick="rankingWorkflow.moveUp(${index})" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-move-down" onclick="rankingWorkflow.moveDown(${index})" ${index === this.rankedValues.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    saveRanking() {
        // Save to localStorage
        const rankingData = {
            values: this.rankedValues,
            timestamp: new Date().toISOString(),
            method: 'values-ranking'
        };
        
        localStorage.setItem('valuesRanking', JSON.stringify(rankingData));
        this.showNotification('Werte-Ranking gespeichert!', 'success');
    }
    
    exportRanking() {
        // Create PDF content
        const pdfContent = this.createRankingPDF();
        this.downloadRankingPDF(pdfContent);
    }
    
    createRankingPDF() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Mein Werte-Ranking</title>
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
                    .ranking-section { 
                        margin-bottom: 30px; 
                        background: white; 
                        padding: 30px; 
                        border-radius: 12px; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                    }
                    .ranking-item { 
                        display: flex; 
                        align-items: center; 
                        padding: 15px 0; 
                        border-bottom: 1px solid #e2e8f0; 
                    }
                    .rank-number { 
                        font-size: 1.5rem; 
                        font-weight: 700; 
                        color: #6366f1; 
                        margin-right: 20px; 
                        min-width: 40px; 
                    }
                    .rank-value { 
                        font-size: 1.2rem; 
                        font-weight: 600; 
                        color: #1e293b; 
                    }
                    .rank-points { 
                        color: #64748b; 
                        font-size: 0.9rem; 
                        margin-left: auto; 
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
                    <div class="logo">Mein Werte-Ranking</div>
                    <div class="subtitle">Persönliche Werte-Hierarchie</div>
                </div>

                <div class="ranking-section">
                    <h2>Deine Werte-Hierarchie</h2>
                    ${this.rankedValues.map((item, index) => `
                        <div class="ranking-item">
                            <div class="rank-number">${index + 1}</div>
                            <div class="rank-value">${item.value}</div>
                            <div class="rank-points">${item.points.toFixed(1)} Punkte</div>
                        </div>
                    `).join('')}
                </div>

                <div class="footer">
                    <p><strong>Manuel Weiss HR-Beratung</strong></p>
                    <p>www.manuel-weiss.de • ${new Date().toLocaleDateString('de-DE')}</p>
                    <p>Erstellt mit dem Werte-Klarstellungs-Workflow</p>
                </div>
            </body>
            </html>
        `;
    }
    
    downloadRankingPDF(content) {
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
    
    restartRanking() {
        this.currentComparison = 0;
        this.rankedValues = [];
        this.generateComparisons();
        this.showRankingInterface();
    }
    
    updateProgress() {
        const progress = Math.round((this.currentComparison / this.comparisons.length) * 100);
        const progressText = document.querySelector('.progress-text');
        const progressFill = document.querySelector('.progress-fill');
        
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
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
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Make it globally available
window.ValuesRankingWorkflow = ValuesRankingWorkflow;
