/* ========================================
   WHEEL OF LIFE WORKFLOW JAVASCRIPT
   Interaktive Lebensbalance-Analyse
   ======================================== */

class WheelOfLifeWorkflow {
    constructor() {
        this.lifeAreas = {
            career: { score: 5, color: '#2196F3', name: 'Karriere' },
            finances: { score: 5, color: '#4CAF50', name: 'Finanzen' },
            health: { score: 5, color: '#F44336', name: 'Gesundheit' },
            family: { score: 5, color: '#FF9800', name: 'Familie' },
            relationships: { score: 5, color: '#9C27B0', name: 'Beziehungen' },
            'personal-development': { score: 5, color: '#FFC107', name: 'Entwicklung' },
            leisure: { score: 5, color: '#00BCD4', name: 'Freizeit' },
            spirituality: { score: 5, color: '#607D8B', name: 'Spiritualität' }
        };
        
        this.autoSaveInterval = null;
        this.init();
    }

    init() {
        this.loadSavedData();
        this.setupEventListeners();
        this.setupAutoSave();
        this.updateWheel();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Score Sliders
        document.querySelectorAll('.score-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const area = e.target.dataset.area;
                const score = parseInt(e.target.value);
                this.updateAreaScore(area, score);
            });
        });

        // Life Area Cards
        document.querySelectorAll('.life-area-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const area = card.dataset.area;
                this.highlightArea(area);
            });
        });

        // Wheel Areas
        document.querySelectorAll('.life-area').forEach(area => {
            area.addEventListener('click', (e) => {
                const areaName = e.currentTarget.dataset.area;
                this.navigateToArea(areaName);
            });
        });

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Form Auto-save
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', () => {
                this.saveToLocalStorage();
            });
        });
    }

    setupAnimations() {
        // Intersection Observer for Animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.life-area-card, .feature-card, .life-area').forEach(el => {
            observer.observe(el);
        });

        // Staggered Animation for Cards
        document.querySelectorAll('.life-area-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    updateAreaScore(area, score) {
        this.lifeAreas[area].score = score;
        
        // Update slider display
        const slider = document.querySelector(`[data-area="${area}"]`);
        if (slider) {
            const display = slider.parentElement.querySelector('.score-display');
            if (display) {
                display.textContent = score;
            }
        }
        
        // Update wheel area
        const wheelArea = document.querySelector(`.life-area[data-area="${area}"]`);
        if (wheelArea) {
            wheelArea.dataset.score = score;
            wheelArea.querySelector('.area-score').textContent = score;
        }
        
        this.updateWheel();
        this.saveToLocalStorage();
    }

    updateWheel() {
        // Calculate average score
        const scores = Object.values(this.lifeAreas).map(area => area.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        // Update center score
        const centerScore = document.getElementById('centerScore');
        if (centerScore) {
            centerScore.textContent = Math.round(averageScore * 10) / 10;
        }
        
        // Update wheel areas
        Object.keys(this.lifeAreas).forEach(area => {
            const wheelArea = document.querySelector(`.life-area[data-area="${area}"]`);
            if (wheelArea) {
                const score = this.lifeAreas[area].score;
                wheelArea.dataset.score = score;
                wheelArea.querySelector('.area-score').textContent = score;
                
                // Update visual intensity based on score
                wheelArea.style.opacity = 0.3 + (score / 10) * 0.7;
            }
        });
    }

    highlightArea(area) {
        // Remove existing highlights
        document.querySelectorAll('.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        // Highlight related elements
        const card = document.querySelector(`[data-area="${area}"]`);
        const wheelArea = document.querySelector(`.life-area[data-area="${area}"]`);
        
        if (card) card.classList.add('highlighted');
        if (wheelArea) wheelArea.classList.add('highlighted');
        
        // Auto-remove highlight after 2 seconds
        setTimeout(() => {
            document.querySelectorAll('.highlighted').forEach(el => {
                el.classList.remove('highlighted');
            });
        }, 2000);
    }

    navigateToArea(area) {
        const routes = {
            'career': 'career-wheel.html',
            'finances': 'finances-wheel.html',
            'health': 'health-wheel.html',
            'family': 'family-wheel.html',
            'relationships': 'relationships-wheel.html',
            'personal-development': 'personal-development-wheel.html',
            'leisure': 'leisure-wheel.html',
            'spirituality': 'spirituality-wheel.html'
        };

        const route = routes[area];
        if (route) {
            this.showLoadingState();
            setTimeout(() => {
                window.location.href = route;
            }, 300);
        }
    }

    handleKeyboardNavigation(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('life-area') || 
                focusedElement.classList.contains('life-area-card')) {
                e.preventDefault();
                const area = focusedElement.dataset.area;
                this.navigateToArea(area);
            }
        }
    }

    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveToLocalStorage();
        }, 30000); // Auto-save every 30 seconds
    }

    saveToLocalStorage() {
        try {
            const data = {
                lifeAreas: this.lifeAreas,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('wheel-of-life-data', JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('wheel-of-life-data');
            if (saved) {
                const data = JSON.parse(saved);
                this.lifeAreas = data.lifeAreas || this.lifeAreas;
                
                // Update UI with saved data
                Object.keys(this.lifeAreas).forEach(area => {
                    const score = this.lifeAreas[area].score;
                    const slider = document.querySelector(`[data-area="${area}"]`);
                    if (slider) {
                        slider.value = score;
                        const display = slider.parentElement.querySelector('.score-display');
                        if (display) {
                            display.textContent = score;
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
        }
    }

    showLoadingState() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Lade Lebensbereich...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            
            .loading-spinner {
                text-align: center;
                color: white;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Analytics Integration
    trackEvent(eventName, properties = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'Wheel of Life',
                event_label: properties.label || '',
                value: properties.value || 0
            });
        }
    }

    // Generate Report
    generateReport() {
        const scores = Object.values(this.lifeAreas).map(area => area.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        // Find lowest and highest areas
        const sortedAreas = Object.entries(this.lifeAreas)
            .sort(([,a], [,b]) => a.score - b.score);
        
        const lowestArea = sortedAreas[0];
        const highestArea = sortedAreas[sortedAreas.length - 1];
        
        // Create report content
        const reportContent = `
            <div class="wheel-report">
                <h2>Deine Lebensbalance-Analyse</h2>
                <div class="report-summary">
                    <p><strong>Durchschnittliche Zufriedenheit:</strong> ${Math.round(averageScore * 10) / 10}/10</p>
                    <p><strong>Stärkster Bereich:</strong> ${highestArea[1].name} (${highestArea[1].score}/10)</p>
                    <p><strong>Entwicklungsbereich:</strong> ${lowestArea[1].name} (${lowestArea[1].score}/10)</p>
                </div>
                <div class="report-areas">
                    ${Object.entries(this.lifeAreas).map(([key, area]) => `
                        <div class="report-area">
                            <span class="area-name">${area.name}</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${area.score * 10}%; background: ${area.color}"></div>
                            </div>
                            <span class="area-score">${area.score}/10</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Show report in modal or new window
        this.showReportModal(reportContent);
    }

    showReportModal(content) {
        const modal = document.createElement('div');
        modal.className = 'report-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Lebensbalance-Bericht</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="window.print()">Drucken</button>
                    <button class="btn-secondary" onclick="this.closest('.report-modal').remove()">Schließen</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .report-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .modal-content {
                background: white;
                border-radius: 1rem;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                margin: 1rem;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-footer {
                display: flex;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 1px solid #e5e7eb;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
            }
            
            .report-area {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .score-bar {
                flex: 1;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .score-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
        `;
        
        document.head.appendChild(style);
        
        // Close modal handlers
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Error Handling
    handleError(error, context = '') {
        console.error(`Wheel of Life Error${context ? ` in ${context}` : ''}:`, error);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `
            <div class="error-content">
                <h3>Oops! Etwas ist schiefgelaufen</h3>
                <p>Bitte lade die Seite neu oder versuche es später erneut.</p>
                <button onclick="location.reload()" class="btn-primary">Seite neu laden</button>
            </div>
        `;
        
        document.body.appendChild(errorMsg);
    }
}

// Global Functions
function startWheelAnalysis() {
    // Start the wheel analysis process
    const workflow = new WheelOfLifeWorkflow();
    workflow.trackEvent('wheel_analysis_started');
}

function generateReport() {
    const workflow = new WheelOfLifeWorkflow();
    workflow.generateReport();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new WheelOfLifeWorkflow();
    } catch (error) {
        console.error('Failed to initialize Wheel of Life Workflow:', error);
    }
});

// Add CSS for animations and interactions
const additionalStyles = `
    .life-area-card.highlighted,
    .life-area.highlighted {
        transform: scale(1.05);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        z-index: 10;
    }
    
    .life-area-card,
    .feature-card,
    .life-area {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .life-area-card.animate-in,
    .feature-card.animate-in,
    .life-area.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .error-message {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .error-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 400px;
        margin: 1rem;
    }
    
    .error-content h3 {
        color: #ef4444;
        margin-bottom: 1rem;
    }
    
    .error-content p {
        color: #6b7280;
        margin-bottom: 1.5rem;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Export for potential external use
window.WheelOfLifeWorkflow = WheelOfLifeWorkflow;
