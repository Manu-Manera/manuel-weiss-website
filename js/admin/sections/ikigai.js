/**
 * Ikigai Section Module
 * Verwaltung des Ikigai-Workflows
 */
class IkigaiSection {
    constructor() {
        this.stateManager = null;
        this.initialized = false;
        this.currentStep = 1;
        this.totalSteps = 4;
    }
    
    /**
     * Section initialisieren
     */
    init() {
        if (this.initialized) return;
        
        // Dependencies prüfen
        if (window.AdminApp && window.AdminApp.stateManager) {
            this.stateManager = window.AdminApp.stateManager;
        }
        
        // Event Listeners hinzufügen
        this.attachEventListeners();
        
        this.initialized = true;
        console.log('Ikigai Section initialized');
    }
    
    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Tab Buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });
        
        // Workflow Steps
        const stepItems = document.querySelectorAll('.step-item');
        stepItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectStep(index + 1);
            });
        });
    }
    
    /**
     * Tab wechseln
     */
    switchTab(tabId) {
        // Tab Buttons aktualisieren
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Tab Panels aktualisieren
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabId}-panel`).classList.add('active');
    }
    
    /**
     * Step auswählen
     */
    selectStep(stepNumber) {
        this.currentStep = stepNumber;
        
        // Step Items aktualisieren
        document.querySelectorAll('.step-item').forEach((item, index) => {
            item.classList.remove('active');
            if (index + 1 === stepNumber) {
                item.classList.add('active');
            }
        });
        
        console.log(`Selected Ikigai step: ${stepNumber}`);
    }
    
    /**
     * Workflow starten
     */
    startWorkflow() {
        console.log('Starting Ikigai workflow...');
        // Hier würde der eigentliche Workflow gestartet werden
        this.showNotification('Ikigai-Workflow wird gestartet...', 'info');
    }
    
    /**
     * Workflow-Einstellungen speichern
     */
    saveSettings() {
        const settings = {
            autoSave: document.getElementById('auto-save')?.checked || false,
            reminderInterval: document.getElementById('reminder-interval')?.value || 'daily',
            notifications: document.getElementById('notifications')?.checked || true
        };
        
        if (this.stateManager) {
            this.stateManager.set('ikigaiSettings', settings);
        }
        
        this.showNotification('Einstellungen gespeichert!', 'success');
    }
    
    /**
     * Notification anzeigen
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Section aktualisieren
     */
    refresh() {
        console.log('Refreshing Ikigai section...');
        // Section-spezifische Aktualisierung
    }
}

// Global Functions für Legacy Support
window.startIkigaiWorkflow = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.ikigai) {
        window.AdminApp.sections.ikigai.startWorkflow();
    }
};

window.saveIkigaiSettings = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.ikigai) {
        window.AdminApp.sections.ikigai.saveSettings();
    }
};

// Section initialisieren wenn DOM bereit
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis AdminApp verfügbar ist
    const initSection = () => {
        if (window.AdminApp && window.AdminApp.sections) {
            window.AdminApp.sections.ikigai = new IkigaiSection();
            window.AdminApp.sections.ikigai.init();
        } else {
            setTimeout(initSection, 100);
        }
    };
    initSection();
});

// Global verfügbar machen
window.IkigaiSection = IkigaiSection;
