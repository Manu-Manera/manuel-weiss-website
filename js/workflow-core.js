// =================== SMART WORKFLOW CORE SYSTEM ===================
// Haupt-Koordinator für den modularen Smart Workflow
// Lädt und koordiniert alle Step-Module

// Global Workflow Data
window.workflowData = {
    currentStep: 1,
    company: '',
    position: '',
    jobDescription: '',
    requirements: [],
    selectedRequirements: [],
    writingMode: 'ai-generated',
    letterContent: '',
    cvData: {},
    designSettings: {},
    finalPackage: {}
};

// Module Loading System
const WorkflowCore = {
    loadedModules: new Set(),
    
    async loadModule(stepName) {
        if (this.loadedModules.has(stepName)) {
            return true;
        }
        
        try {
            const script = document.createElement('script');
            script.src = `js/workflow-steps/${stepName}.js`;
            script.async = false;
            
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    this.loadedModules.add(stepName);
                    console.log(`✅ Modul ${stepName} erfolgreich geladen`);
                    resolve(true);
                };
                script.onerror = () => {
                    console.error(`❌ Fehler beim Laden von ${stepName}`);
                    reject(false);
                };
                document.head.appendChild(script);
            });
        } catch (error) {
            console.error(`❌ Fehler beim Laden von ${stepName}:`, error);
            return false;
        }
    },
    
    async loadAllModules() {
        const modules = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'];
        const loadPromises = modules.map(module => this.loadModule(module));
        
        try {
            await Promise.all(loadPromises);
            console.log('🚀 Alle Workflow-Module erfolgreich geladen');
            return true;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Module:', error);
            return false;
        }
    }
};

// Main Workflow Functions
window.showSmartWorkflowModal = function() {
    const modal = `
        <div id="smartWorkflowModal" class="workflow-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="workflow-container" style="background: white; border-radius: 20px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.3); position: relative;">
                <!-- Workflow Header -->
                <div class="workflow-header" style="padding: 2rem 2rem 1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px 20px 0 0;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.75rem; font-weight: 700;">🚀 Smart Bewerbungs-Workflow</h2>
                        <p style="margin: 0.5rem 0 0; opacity: 0.9; font-size: 1.1rem;">KI-gestützte Bewerbungserstellung mit modernster Technologie</p>
                    </div>
                    <button onclick="closeSmartWorkflow()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 3rem; height: 3rem; border-radius: 50%; cursor: pointer; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                        ✕
                    </button>
                </div>
                
                <!-- Step Navigation -->
                <div class="step-navigation" style="padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid #e5e7eb;">
                    <div id="stepCounter" style="text-align: center; color: #6b7280; font-weight: 600; margin-bottom: 1rem;">
                        Schritt <span id="currentStepNumber">1</span> von 6
                    </div>
                    <div class="step-progress" style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                        <div class="step-dot active" data-step="1">1</div>
                        <div class="step-line"></div>
                        <div class="step-dot" data-step="2">2</div>
                        <div class="step-line"></div>
                        <div class="step-dot" data-step="3">3</div>
                        <div class="step-line"></div>
                        <div class="step-dot" data-step="4">4</div>
                        <div class="step-line"></div>
                        <div class="step-dot" data-step="5">5</div>
                        <div class="step-line"></div>
                        <div class="step-dot" data-step="6">6</div>
                    </div>
                </div>
                
                <!-- Workflow Content -->
                <div id="workflowContent" class="workflow-content" style="padding: 2rem; min-height: 400px;">
                    <div class="loading-state" style="text-align: center; padding: 3rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔄</div>
                        <p style="color: #6b7280; font-size: 1.1rem;">Workflow wird initialisiert...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Inject modal styles
    injectModalStyles();
    
    // Initialize first step
    setTimeout(() => {
        nextWorkflowStep(1);
    }, 500);
};

window.closeSmartWorkflow = function() {
    const modal = document.getElementById('smartWorkflowModal');
    if (modal) {
        modal.remove();
        window.workflowData.currentStep = 1;
    }
};

window.nextWorkflowStep = async function(stepNumber) {
    if (!stepNumber) {
        stepNumber = window.workflowData.currentStep + 1;
    }
    
    // Validate step range
    if (stepNumber < 1 || stepNumber > 6) {
        console.warn('Ungültiger Schritt:', stepNumber);
        return;
    }
    
    // Load required module
    const stepModuleName = `step${stepNumber}`;
    await WorkflowCore.loadModule(stepModuleName);
    
    // Update current step
    window.workflowData.currentStep = stepNumber;
    
    // Update UI
    updateStepNavigation(stepNumber);
    
    // Generate step content
    const contentDiv = document.getElementById('workflowContent');
    if (contentDiv) {
        try {
            let stepContent = '';
            
            switch(stepNumber) {
                case 1:
                    stepContent = window.generateStep1 ? window.generateStep1() : '<p>Step 1 wird geladen...</p>';
                    break;
                case 2:
                    stepContent = window.generateStep2 ? window.generateStep2() : '<p>Step 2 wird geladen...</p>';
                    break;
                case 3:
                    stepContent = window.generateStep3 ? window.generateStep3() : '<p>Step 3 wird geladen...</p>';
                    break;
                case 4:
                    stepContent = window.generateStep4 ? window.generateStep4() : '<p>Step 4 wird geladen...</p>';
                    break;
                case 5:
                    stepContent = window.generateStep5 ? window.generateStep5() : '<p>Step 5 wird geladen...</p>';
                    break;
                case 6:
                    stepContent = window.generateStep6 ? window.generateStep6() : '<p>Step 6 wird geladen...</p>';
                    break;
                default:
                    stepContent = '<p>Ungültiger Schritt</p>';
            }
            
            contentDiv.innerHTML = stepContent;
            
            // Scroll to top
            contentDiv.scrollTop = 0;
            
        } catch (error) {
            console.error(`Fehler beim Laden von Schritt ${stepNumber}:`, error);
            contentDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #ef4444;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <p>Fehler beim Laden von Schritt ${stepNumber}</p>
                    <button onclick="nextWorkflowStep(${stepNumber})" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 1rem;">
                        Erneut versuchen
                    </button>
                </div>
            `;
        }
    }
};

window.previousWorkflowStep = function(targetStep) {
    if (targetStep) {
        nextWorkflowStep(targetStep);
    } else if (window.workflowData.currentStep > 1) {
        nextWorkflowStep(window.workflowData.currentStep - 1);
    }
};

function updateStepNavigation(currentStep) {
    // Update step counter
    const stepNumberSpan = document.getElementById('currentStepNumber');
    if (stepNumberSpan) {
        stepNumberSpan.textContent = currentStep;
    }
    
    // Update step dots
    document.querySelectorAll('.step-dot').forEach(dot => {
        const stepNum = parseInt(dot.dataset.step);
        dot.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            dot.classList.add('active');
        } else if (stepNum < currentStep) {
            dot.classList.add('completed');
        }
    });
}

function injectModalStyles() {
    if (document.getElementById('workflow-modal-styles')) return;
    
    const styles = `
        <style id="workflow-modal-styles">
            .workflow-modal {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: modalFadeIn 0.3s ease-out;
            }
            
            .workflow-container {
                animation: modalSlideUp 0.3s ease-out;
                width: 90vw;
                max-width: 1200px;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes modalSlideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .step-dot {
                width: 3rem;
                height: 3rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                background: #e5e7eb;
                color: #6b7280;
                border: 3px solid #e5e7eb;
            }
            
            .step-dot.active {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                color: white;
                border-color: #3b82f6;
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            }
            
            .step-dot.completed {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border-color: #10b981;
            }
            
            .step-dot:hover {
                transform: scale(1.05);
            }
            
            .step-line {
                width: 2rem;
                height: 3px;
                background: #e5e7eb;
                border-radius: 2px;
            }
            
            .workflow-content {
                position: relative;
            }
            
            @media (max-width: 768px) {
                .workflow-container {
                    width: 95vw;
                    margin: 1rem;
                }
                
                .step-progress {
                    flex-wrap: wrap;
                    gap: 0.5rem !important;
                }
                
                .step-dot {
                    width: 2.5rem;
                    height: 2.5rem;
                    font-size: 1rem;
                }
                
                .step-line {
                    width: 1rem;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Entry point for starting the workflow
window.startSmartBewerbungsWorkflow = async function() {
    console.log('🚀 Smart Bewerbungs-Workflow wird gestartet...');
    
    // Load all modules first
    const modulesLoaded = await WorkflowCore.loadAllModules();
    
    if (modulesLoaded) {
        showSmartWorkflowModal();
    } else {
        alert('❌ Fehler beim Laden der Workflow-Module. Bitte versuchen Sie es erneut.');
    }
};

window.finishWorkflow = function() {
    alert('🎉 Bewerbung erfolgreich erstellt!\n\nIhr komplettes Bewerbungspaket wurde generiert.');
    closeSmartWorkflow();
};

// Auto-initialize when loaded
console.log('✅ Workflow Core System geladen');
