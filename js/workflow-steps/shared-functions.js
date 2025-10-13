// =================== SHARED WORKFLOW FUNCTIONS ===================
// Gemeinsame Funktionen für alle Workflow-Steps
// Teil des modularen Smart Bewerbungs-Workflows

/**
 * SHARED FUNCTIONS
 * Utility-Funktionen, die von mehreren Steps verwendet werden
 */

// =================== WORKFLOW DATA MANAGEMENT ===================

// Initialize workflow data structure
window.initializeWorkflowData = function() {
    if (!window.workflowData) {
        window.workflowData = {
            currentStep: 0,
            applicationType: null,
            skipJobAnalysis: false,
            company: '',
            position: '',
            jobDescription: '',
            requirements: [],
            aiAnalysisResult: null,
            isInitiativeApplication: false
        };
    }
    return window.workflowData;
};

// Save workflow data to localStorage
window.saveWorkflowData = function() {
    try {
        localStorage.setItem('smartWorkflowData', JSON.stringify(window.workflowData));
        console.log('💾 Workflow-Daten gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
    }
};

// Load workflow data from localStorage
window.loadWorkflowData = function() {
    try {
        const saved = localStorage.getItem('smartWorkflowData');
        if (saved) {
            window.workflowData = { ...window.workflowData, ...JSON.parse(saved) };
            console.log('📁 Workflow-Daten geladen');
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden:', error);
    }
};

// =================== UI UTILITY FUNCTIONS ===================

// Show loading state for buttons
window.showButtonLoading = function(button, text = 'Lädt...') {
    if (!button) return;
    
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
};

// Hide loading state for buttons
window.hideButtonLoading = function(button) {
    if (!button || !button.dataset.originalText) return;
    
    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
    delete button.dataset.originalText;
};

// Add button effects (hover, active)
window.addButtonEffect = function(button, effect) {
    if (!button) return;
    
    switch(effect) {
        case 'hover':
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            break;
        case 'active':
            button.style.transform = 'translateY(0px)';
            button.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            break;
    }
};

// Remove button effects
window.removeButtonEffect = function(button, effect) {
    if (!button) return;
    
    button.style.transform = '';
    button.style.boxShadow = '';
};

// =================== FORM VALIDATION ===================

// Validate email format
window.validateEmail = function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validate required fields
window.validateRequiredFields = function(fields) {
    const errors = [];
    
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element ? element.value.trim() : '';
        
        if (!value) {
            errors.push(`${field.label} ist erforderlich`);
            if (element) {
                element.classList.add('error');
                element.focus();
            }
        } else if (element) {
            element.classList.remove('error');
        }
    });
    
    return errors;
};

// Show validation errors
window.showValidationErrors = function(errors) {
    if (errors.length === 0) return;
    
    const errorMessage = errors.join('\n');
    alert('Bitte korrigieren Sie folgende Fehler:\n\n' + errorMessage);
};

// =================== MODAL MANAGEMENT ===================

// Show workflow modal
window.showSmartWorkflowModal = function() {
    console.log('📱 Zeige Smart Workflow Modal');
    
    let modal = document.getElementById('smartWorkflowModal');
    
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = 'smartWorkflowModal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="event.target === this && closeSmartWorkflow()">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="header-content">
                            <div class="header-left">
                                <h2><i class="fas fa-briefcase"></i> Smart Bewerbungsmanager</h2>
                                <div class="step-subtitle">KI-gestützte Bewerbungserstellung</div>
                            </div>
                            <div class="header-right">
                                <div class="step-indicator-modern">
                                    <div class="step-progress-bar">
                                        <div class="step-progress-fill" id="progressFill"></div>
                                    </div>
                                    <div class="step-info">
                                        <span id="stepCounter">Schritt 1</span>
                                        <div class="step-dots">
                                            <div class="step-dot active" data-step="0"></div>
                                            <div class="step-dot" data-step="1"></div>
                                            <div class="step-dot" data-step="2"></div>
                                            <div class="step-dot" data-step="3"></div>
                                            <div class="step-dot" data-step="4"></div>
                                            <div class="step-dot" data-step="5"></div>
                                            <div class="step-dot" data-step="6"></div>
                                        </div>
                                    </div>
                                </div>
                                <button class="close-btn" onclick="closeSmartWorkflow()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div id="workflowContent"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(modal);
        
        // Add modal CSS
        if (!document.getElementById('workflow-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'workflow-modal-styles';
            styles.textContent = `
                #smartWorkflowModal .modal-content {
                    background: white;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 900px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                    animation: modalSlideIn 0.3s ease-out;
                }
                
                #smartWorkflowModal .modal-header {
                    padding: 2rem;
                    border-bottom: 1px solid #e5e7eb;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 20px 20px 0 0;
                }
                
                #smartWorkflowModal .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 2rem;
                }
                
                #smartWorkflowModal .header-left h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                #smartWorkflowModal .step-subtitle {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    font-weight: 400;
                }
                
                #smartWorkflowModal .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                
                #smartWorkflowModal .step-indicator-modern {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.75rem;
                }
                
                #smartWorkflowModal .step-progress-bar {
                    width: 200px;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                #smartWorkflowModal .step-progress-fill {
                    height: 100%;
                    background: white;
                    border-radius: 3px;
                    transition: width 0.5s ease;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }
                
                #smartWorkflowModal .step-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                #smartWorkflowModal .step-info #stepCounter {
                    font-size: 0.9rem;
                    font-weight: 600;
                    white-space: nowrap;
                }
                
                #smartWorkflowModal .step-dots {
                    display: flex;
                    gap: 0.5rem;
                }
                
                #smartWorkflowModal .step-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.4);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                #smartWorkflowModal .step-dot.active {
                    background: white;
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
                    transform: scale(1.2);
                }
                
                #smartWorkflowModal .step-dot.completed {
                    background: #10b981;
                    box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
                }
                
                #smartWorkflowModal .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }
                
                #smartWorkflowModal .close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }
                
                #smartWorkflowModal .modal-body {
                    padding: 2rem;
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                #smartWorkflowModal .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    modal.style.display = 'flex';
    return modal;
};

// =================== LOCAL STORAGE HELPERS ===================

// Get from localStorage with fallback
window.getStorageItem = function(key, fallback = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.warn(`Storage read error for ${key}:`, error);
        return fallback;
    }
};

// Set to localStorage safely
window.setStorageItem = function(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`Storage write error for ${key}:`, error);
        return false;
    }
};

// =================== DATE & TIME HELPERS ===================

// Format date for display
window.formatDate = function(date) {
    if (!date) date = new Date();
    
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Get relative time (e.g., "vor 5 Minuten")
window.getRelativeTime = function(date) {
    if (!date) return 'nie';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'gerade eben';
    if (minutes < 60) return `vor ${minutes} Min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours} Std`;
    
    const days = Math.floor(hours / 24);
    return `vor ${days} Tagen`;
};

// =================== TEXT PROCESSING ===================

// Truncate text with ellipsis
window.truncateText = function(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

// Clean and normalize text
window.cleanText = function(text) {
    if (!text) return '';
    
    return text
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\-\.\,\!\?]/g, '');
};

// Extract keywords from text
window.extractKeywords = function(text, maxKeywords = 10) {
    if (!text) return [];
    
    const commonWords = ['der', 'die', 'das', 'und', 'oder', 'aber', 'ist', 'sind', 'ein', 'eine', 'mit', 'für', 'von', 'zu', 'in', 'auf', 'bei'];
    
    const words = text.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !commonWords.includes(word));
    
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, maxKeywords)
        .map(([word]) => word);
};

// =================== PERFORMANCE HELPERS ===================

// Debounce function calls
window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function calls
window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// =================== MODERNE STEP INDICATOR FUNCTIONS ===================

/**
 * Update modern step indicator
 */
window.updateModernStepIndicator = function(currentStep) {
    // Update step counter text
    const stepCounter = document.getElementById('stepCounter');
    if (stepCounter) {
        const stepNames = [
            'Bewerbungsart auswählen',
            'Stellenausschreibung eingeben', 
            'KI-Analyse & Anforderungen',
            'Anschreiben erstellen',
            'Überarbeitung & Optimierung',
            'Finalisierung & Design',
            'Export & Versand'
        ];
        
        if (currentStep === 0) {
            stepCounter.textContent = 'Auswahl';
        } else {
            stepCounter.textContent = `Schritt ${currentStep} von 6`;
        }
    }
    
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        const totalSteps = 6;
        const progressPercent = currentStep === 0 ? 5 : (currentStep / totalSteps) * 100;
        progressFill.style.width = `${progressPercent}%`;
    }
    
    // Update step dots
    const stepDots = document.querySelectorAll('.step-dot');
    stepDots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        
        if (index === currentStep) {
            dot.classList.add('active');
        } else if (index < currentStep) {
            dot.classList.add('completed');
        }
    });
    
    console.log(`✅ Modern Step Indicator aktualisiert: Schritt ${currentStep}`);
};

/**
 * Enhanced step navigation with modern indicator
 */
window.navigateToStep = function(targetStep) {
    // Update workflow data
    if (window.workflowData) {
        window.workflowData.currentStep = targetStep;
    }
    
    // Update modern indicator
    window.updateModernStepIndicator(targetStep);
    
    // Navigate to step
    if (typeof nextWorkflowStep === 'function') {
        nextWorkflowStep(targetStep);
    }
    
    console.log(`🚀 Navigiert zu Schritt ${targetStep} mit modernem Indicator`);
};

console.log('✅ Shared Functions Module mit moderner Step-Anzeige geladen');
