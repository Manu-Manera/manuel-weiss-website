// =================== MODULARER WORKFLOW LOADER ===================
// Lädt alle Workflow-Module in der korrekten Reihenfolge
// Ersetzt die monolithische smart-workflow-steps.js

/**
 * WORKFLOW MODULE LOADER
 * Lädt alle Step-Module und gemeinsame Funktionen
 */

class WorkflowModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadOrder = [
            'shared-functions.js',    // Gemeinsame Utility-Funktionen
            'ai-integration.js',      // KI-Features & DACH-Templates
            'step0.js',              // Bewerbungsart Auswahl
            'step1.js',              // Stellenausschreibung + 10 Optimierungen
            'step2.js',              // KI-Analyse & DACH-Management
            'step3.js',              // Anschreiben mit Anforderungsmanagement
            'step4.js',              // Überarbeitung & Optimierung
            'step5.js',              // Finalisierung
            'step6.js'               // Export & Versand
        ];
    }

    async loadAllModules() {
        console.log('🚀 Lade modulare Workflow-Komponenten...');
        
        try {
            // Lade Module in korrekter Reihenfolge
            for (const module of this.loadOrder) {
                await this.loadModule(module);
            }
            
            console.log('✅ Alle Workflow-Module erfolgreich geladen');
            
            // Initialize workflow system
            this.initializeWorkflow();
            
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Module:', error);
            return false;
        }
    }

    async loadModule(moduleFile) {
        if (this.loadedModules.has(moduleFile)) {
            return; // Already loaded
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/workflow-steps/${moduleFile}`;
            script.async = false; // Ensure order
            
            script.onload = () => {
                this.loadedModules.add(moduleFile);
                console.log(`✅ ${moduleFile} geladen`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`❌ Fehler beim Laden von ${moduleFile}`);
                reject(new Error(`Failed to load ${moduleFile}`));
            };
            
            document.head.appendChild(script);
        });
    }

    initializeWorkflow() {
        // Initialize workflow data structure
        if (!window.workflowData) {
            window.workflowData = {
                currentStep: 0,
                applicationType: null,
                skipJobAnalysis: false,
                company: '',
                position: '',
                jobDescription: '',
                requirements: [],
                aiAnalysisResult: null
            };
        }

        // Initialize global workflow functions
        this.initializeGlobalFunctions();
        
        console.log('🎯 Modularer Workflow initialisiert');
    }

    initializeGlobalFunctions() {
        // Main workflow navigation function
        window.nextWorkflowStep = function(step) {
            console.log(`🔄 Navigiere zu Schritt ${step}`);
            
            if (!window.workflowData) {
                window.workflowData = { currentStep: 0 };
            }
            
            window.workflowData.currentStep = step;
            
            // Get modal and content elements
            const modal = document.getElementById('smartWorkflowModal');
            const contentDiv = document.getElementById('workflowContent');
            const stepCounter = document.getElementById('stepCounter');
            
            if (!modal || !contentDiv) {
                console.error('❌ Workflow-Modal nicht gefunden');
                return;
            }

            let content = '';
            
            // Route to appropriate step generator
            switch(step) {
                case 0:
                    if (typeof window.generateStep0 === 'function') {
                        content = window.generateStep0(); // Application type selection
                    } else {
                        console.error('❌ generateStep0 nicht verfügbar');
                        content = '<div style="text-align: center; padding: 2rem; color: #ef4444;">❌ Step 0 Modul nicht geladen</div>';
                    }
                    break;
                case 1:
                    if (typeof window.generateStep1 === 'function') {
                        content = window.generateStep1();
                    } else {
                        console.error('❌ generateStep1 nicht verfügbar');
                        content = '<div style="text-align: center; padding: 2rem; color: #ef4444;">❌ Step 1 Modul nicht geladen</div>';
                    }
                    break;
                case 2:
                    if (typeof window.generateStep2 === 'function') {
                        content = window.generateStep2();
                    } else {
                        console.error('❌ generateStep2 nicht verfügbar');
                        content = '<div style="text-align: center; padding: 2rem; color: #ef4444;">❌ Step 2 Modul nicht geladen</div>';
                    }
                    break;
                case 3:
                    if (typeof window.generateStep3 === 'function') {
                        content = window.generateStep3();
                        // Initialize greeting and closing options
                        setTimeout(() => {
                            if (typeof initializeGreetingOptions === 'function') {
                                initializeGreetingOptions();
                            }
                            if (typeof initializeClosingOptions === 'function') {
                                initializeClosingOptions();
                            }
                        }, 100);
                    } else {
                        console.error('❌ generateStep3 nicht verfügbar');
                        content = '<div style="text-align: center; padding: 2rem; color: #ef4444;">❌ Step 3 Modul nicht geladen</div>';
                    }
                    break;
                case 4:
                    if (typeof window.generateStep4 === 'function') {
                        content = window.generateStep4();
                    } else {
                        console.error('❌ generateStep4 nicht verfügbar');
                        content = '<div style="text-align: center; padding: 2rem; color: #ef4444;">❌ Step 4 Modul nicht geladen</div>';
                    }
                    break;
                case 5:
                    if (typeof window.generateStep5 === 'function') {
                        content = window.generateStep5();
                    } else {
                        console.error('❌ generateStep5 nicht verfügbar');
                        content = '<div style="text-align: center; padding: 2rem; color: #ef4444;">❌ Step 5 Modul nicht geladen</div>';
                    }
                    break;
                case 6:
                    if (typeof window.generateStep6 === 'function') {
                        content = window.generateStep6();
                    } else {
                        console.error('❌ generateStep6 nicht verfügbar');
                        content = '<div style="text-align: center; padding: 2rem; color: #ef4444;">❌ Step 6 Modul nicht geladen</div>';
                    }
                    break;
                default:
                    if (typeof window.generateStep1 === 'function') {
                        content = window.generateStep1();
                    } else {
                        content = '<div style="text-align: center; padding: 2rem; color: #ef4444;">❌ Workflow-Module nicht geladen</div>';
                    }
            }
            
            contentDiv.innerHTML = content;
            
            // Update step counter
            if (stepCounter) {
                if (step === 0) {
                    stepCounter.textContent = 'Auswahl';
                } else {
                    stepCounter.textContent = `Schritt ${step} von 6`;
                }
            }
            
            // Show modal if hidden
            if (modal.style.display === 'none') {
                modal.style.display = 'flex';
            }
        };

        // Previous step function
        window.previousWorkflowStep = function(targetStep) {
            if (targetStep >= 0) {
                nextWorkflowStep(targetStep);
            }
        };

        // Close workflow function
        window.closeSmartWorkflow = function() {
            const modal = document.getElementById('smartWorkflowModal');
            if (modal) {
                modal.style.display = 'none';
            }
        };

        // Start workflow function
        window.startSmartBewerbungsWorkflow = function() {
            console.log('🚀 Starte Smart Bewerbungs-Workflow...');
            
            // Initialize workflow data
            window.workflowData = {
                currentStep: 0,
                applicationType: null,
                skipJobAnalysis: false
            };
            
            // Start with step 0 (application type selection)
            nextWorkflowStep(0);
        };
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    const loader = new WorkflowModuleLoader();
    await loader.loadAllModules();
});

// Make loader available globally
window.WorkflowModuleLoader = WorkflowModuleLoader;

console.log('📦 Workflow Module Loader bereit');
