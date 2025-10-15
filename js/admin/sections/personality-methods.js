/**
 * Personality Methods Section Module
 * Verwaltung aller Persönlichkeitsentwicklung Methoden
 */
class PersonalityMethodsSection {
    constructor() {
        this.stateManager = null;
        this.initialized = false;
        this.currentMethod = null;
        this.methods = [
            'ikigai', 'raisec', 'values-clarification', 'strengths-analysis', 
            'goal-setting', 'mindfulness', 'emotional-intelligence', 'habit-building',
            'gallup-strengths', 'via-strengths', 'self-assessment', 'johari-window',
            'nlp-dilts', 'five-pillars', 'harvard-method', 'moment-excellence',
            'nlp-meta-goal', 'nonviolent-communication', 'resource-analysis',
            'rafael-method', 'walt-disney', 'aek-communication', 'change-stages',
            'circular-interview', 'communication', 'competence-map', 'conflict-escalation',
            'rubikon-model', 'solution-focused', 'systemic-coaching', 'target-coaching'
        ];
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
        console.log('Personality Methods Section initialized');
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
     * Method laden
     */
    loadMethod(methodId) {
        this.currentMethod = methodId;
        
        // Method-spezifische Inhalte laden
        this.loadMethodContent(methodId);
    }
    
    /**
     * Method Content laden
     */
    async loadMethodContent(methodId) {
        try {
            // Template laden
            const templatePath = `admin/sections/personality-methods/${methodId}.html`;
            const response = await fetch(templatePath);
            
            if (!response.ok) {
                throw new Error(`Template not found: ${templatePath}`);
            }
            
            const content = await response.text();
            
            // Content in DOM einfügen
            const container = document.getElementById('admin-content');
            if (container) {
                container.innerHTML = content;
                
                // Event Listeners neu hinzufügen
                this.attachEventListeners();
            }
            
        } catch (error) {
            console.error(`Failed to load method ${methodId}:`, error);
            this.showMethodError(methodId, error);
        }
    }
    
    /**
     * Method Error anzeigen
     */
    showMethodError(methodId, error) {
        const container = document.getElementById('admin-content');
        if (container) {
            container.innerHTML = `
                <div class="method-error" style="text-align: center; padding: 3rem; color: #64748b;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #f59e0b;"></i>
                    <h3>Method nicht gefunden</h3>
                    <p>Die Methode "${methodId}" konnte nicht geladen werden.</p>
                    <button class="btn btn-primary" onclick="window.location.hash = 'dashboard'">
                        <i class="fas fa-home"></i> Zurück zum Dashboard
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Alle Methoden abrufen
     */
    getAllMethods() {
        return this.methods;
    }
    
    /**
     * Method existiert
     */
    methodExists(methodId) {
        return this.methods.includes(methodId);
    }
    
    /**
     * Method Details abrufen
     */
    getMethodDetails(methodId) {
        const methodDetails = {
            'ikigai': {
                name: 'Ikigai-Workflow',
                description: 'Finde deinen Lebenszweck durch die Verbindung von Leidenschaft, Mission, Beruf und Berufung',
                steps: 4,
                duration: '30-45 Minuten'
            },
            'raisec': {
                name: 'RAISEC-Modell',
                description: 'Entdecke deine beruflichen Interessen und Talente',
                steps: 6,
                duration: '20-30 Minuten'
            },
            'values-clarification': {
                name: 'Werte-Klärung',
                description: 'Identifiziere deine persönlichen Werte und Prioritäten',
                steps: 5,
                duration: '25-35 Minuten'
            },
            'strengths-analysis': {
                name: 'Stärken-Analyse',
                description: 'Erkenne und entwickle deine persönlichen Stärken',
                steps: 6,
                duration: '30-40 Minuten'
            }
        };
        
        return methodDetails[methodId] || {
            name: methodId,
            description: 'Persönlichkeitsentwicklung Methode',
            steps: 0,
            duration: 'Variable'
        };
    }
}

// Global Functions für Legacy Support
window.loadPersonalityMethod = function(methodId) {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.personalityMethods) {
        window.AdminApp.sections.personalityMethods.loadMethod(methodId);
    }
};

// Section initialisieren wenn DOM bereit
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis AdminApp verfügbar ist
    const initSection = () => {
        if (window.AdminApp && window.AdminApp.sections) {
            window.AdminApp.sections.personalityMethods = new PersonalityMethodsSection();
            window.AdminApp.sections.personalityMethods.init();
        } else {
            setTimeout(initSection, 100);
        }
    };
    initSection();
});

// Global verfügbar machen
window.PersonalityMethodsSection = PersonalityMethodsSection;
