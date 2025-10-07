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
                        <h2>Smart Bewerbungsmanager</h2>
                        <div class="step-indicator">
                            Schritt <span id="stepCounter">1</span>
                        </div>
                        <button class="close-btn" onclick="closeSmartWorkflow()">
                            <i class="fas fa-times"></i>
                        </button>
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
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #e5e7eb;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 20px 20px 0 0;
                }
                
                #smartWorkflowModal .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                
                #smartWorkflowModal .step-indicator {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 600;
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

console.log('✅ Shared Functions Module geladen');
