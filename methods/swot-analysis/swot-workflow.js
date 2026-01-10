/* ========================================
   SWOT-WORKFLOW JAVASCRIPT
   Interaktive SWOT-Analyse mit modernen Features
   ======================================== */

class SWOTWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.workflowData = {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
        };
        this.autoSaveInterval = null;
        this.init();
    }

    init() {
        this.loadSavedData();
        this.setupEventListeners();
        this.setupAutoSave();
        this.updateProgress();
        this.setupMatrixInteractions();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Matrix Quadrant Clicks
        document.querySelectorAll('.matrix-quadrant').forEach(quadrant => {
            quadrant.addEventListener('click', (e) => {
                const quadrantType = e.currentTarget.dataset.quadrant;
                this.navigateToQuadrant(quadrantType);
            });
        });

        // Area Card Clicks
        document.querySelectorAll('.swot-area-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const quadrantType = e.currentTarget.dataset.quadrant;
                this.navigateToQuadrant(quadrantType);
            });
        });

        // Navigation Buttons
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const href = btn.getAttribute('href');
                if (href && href.includes('swot.html')) {
                    this.navigateToQuadrant(href.split('-')[0]);
                }
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

    setupMatrixInteractions() {
        // Matrix Hover Effects
        document.querySelectorAll('.matrix-quadrant').forEach(quadrant => {
            quadrant.addEventListener('mouseenter', (e) => {
                this.highlightRelatedElements(e.currentTarget.dataset.quadrant);
            });

            quadrant.addEventListener('mouseleave', () => {
                this.removeHighlights();
            });
        });

        // Touch Support for Mobile
        document.querySelectorAll('.matrix-quadrant').forEach(quadrant => {
            quadrant.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.highlightRelatedElements(e.currentTarget.dataset.quadrant);
            });

            quadrant.addEventListener('touchend', (e) => {
                e.preventDefault();
                const quadrantType = e.currentTarget.dataset.quadrant;
                this.navigateToQuadrant(quadrantType);
                this.removeHighlights();
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
        document.querySelectorAll('.swot-area-card, .feature-card, .matrix-quadrant').forEach(el => {
            observer.observe(el);
        });

        // Staggered Animation for Cards
        document.querySelectorAll('.swot-area-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    navigateToQuadrant(quadrantType) {
        const routes = {
            'strengths': 'strengths-swot.html',
            'weaknesses': 'weaknesses-swot.html',
            'opportunities': 'opportunities-swot.html',
            'threats': 'threats-swot.html'
        };

        const route = routes[quadrantType];
        if (route) {
            // Add loading state
            this.showLoadingState();
            
            // Navigate with transition
            setTimeout(() => {
                window.location.href = route;
            }, 300);
        }
    }

    highlightRelatedElements(quadrantType) {
        // Highlight related area card
        const relatedCard = document.querySelector(`[data-quadrant="${quadrantType}"]`);
        if (relatedCard && relatedCard.classList.contains('swot-area-card')) {
            relatedCard.classList.add('highlighted');
        }

        // Highlight matrix quadrant
        const matrixQuadrant = document.querySelector(`.matrix-quadrant[data-quadrant="${quadrantType}"]`);
        if (matrixQuadrant) {
            matrixQuadrant.classList.add('highlighted');
        }
    }

    removeHighlights() {
        document.querySelectorAll('.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });
    }

    handleKeyboardNavigation(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('matrix-quadrant') || 
                focusedElement.classList.contains('swot-area-card')) {
                e.preventDefault();
                const quadrantType = focusedElement.dataset.quadrant;
                this.navigateToQuadrant(quadrantType);
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
                workflowData: this.workflowData,
                currentStep: this.currentStep,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('swot-workflow-data', JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('swot-workflow-data');
            if (saved) {
                const data = JSON.parse(saved);
                this.workflowData = data.workflowData || this.workflowData;
                this.currentStep = data.currentStep || 1;
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
        }
    }

    updateProgress() {
        const progressElements = document.querySelectorAll('.progress-bar, .progress-indicator');
        progressElements.forEach(element => {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            element.style.width = `${percentage}%`;
        });
    }

    showLoadingState() {
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Lade SWOT-Analyse...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add loading styles
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
                event_category: 'SWOT Analysis',
                event_label: properties.label || '',
                value: properties.value || 0
            });
        }
    }

    // Performance Monitoring
    measurePerformance() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
        }
    }

    // Error Handling
    handleError(error, context = '') {
        console.error(`SWOT Workflow Error${context ? ` in ${context}` : ''}:`, error);
        
        // Show user-friendly error message
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SWOTWorkflow();
    } catch (error) {
        console.error('Failed to initialize SWOT Workflow:', error);
    }
});

// Add CSS for animations and interactions
const additionalStyles = `
    .swot-area-card.highlighted,
    .matrix-quadrant.highlighted {
        transform: scale(1.05);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        z-index: 10;
    }
    
    .swot-area-card,
    .feature-card,
    .matrix-quadrant {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .swot-area-card.animate-in,
    .feature-card.animate-in,
    .matrix-quadrant.animate-in {
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
window.SWOTWorkflow = SWOTWorkflow;
