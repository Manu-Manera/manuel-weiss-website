/**
 * 🚀 Fachliche Entwicklung Smart Workflow
 * Moderne, interaktive Methode für berufliche Weiterentwicklung
 * Mit KI-gestützten Lernempfehlungen und Skill-Tracking
 * Autor: Manuel Weiss
 * Version: 1.0
 */

class FachlicheEntwicklungWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.workflowData = {
            selfAnalysis: {},
            skillGapAnalysis: {},
            learningPath: {},
            progressTracking: {},
            certifications: {},
            synthesis: {},
            actionPlan: {}
        };
        this.init();
    }

    init() {
        this.getCurrentStepFromURL();
        this.loadSavedData();
        this.setupEventListeners();
        this.updateProgress();
        this.initializeSkillGapAnalyzer();
        this.initializeLearningPathGenerator();
        this.initializeProgressTracker();
        this.initializeExportFunctions();
        console.log('🚀 Fachliche Entwicklung Workflow initialized');
    }

    loadSavedData() {
        // Load data from localStorage
        for (let i = 1; i <= this.totalSteps; i++) {
            const savedData = localStorage.getItem(`fachlicheEntwicklungStep${i}`);
            if (savedData) {
                try {
                    this.workflowData[this.getStepKey(i)] = JSON.parse(savedData);
                } catch (e) {
                    console.error('Error loading step data:', e);
                }
            }
        }
    }

    getStepKey(stepNumber) {
        const stepKeys = {
            1: 'selfAnalysis',
            2: 'skillGapAnalysis',
            3: 'learningPath',
            4: 'progressTracking',
            5: 'certifications',
            6: 'synthesis',
            7: 'actionPlan'
        };
        return stepKeys[stepNumber] || 'unknown';
    }

    setupEventListeners() {
        // Auto-save functionality
        document.querySelectorAll('textarea, input[type="text"], input[type="email"], select').forEach(element => {
            element.addEventListener('input', () => {
                this.autoSave();
            });
            element.addEventListener('change', () => {
                this.autoSave();
            });
        });

        // Form submission
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAndContinue();
            });
        });
    }

    autoSave() {
        const currentStepData = this.collectCurrentStepData();
        if (currentStepData) {
            localStorage.setItem(`fachlicheEntwicklungStep${this.currentStep}`, JSON.stringify(currentStepData));
            this.workflowData[this.getStepKey(this.currentStep)] = currentStepData;
        }
    }

    collectCurrentStepData() {
        const form = document.querySelector('form');
        if (!form) return null;

        const formData = new FormData(form);
        const data = {
            step: this.currentStep,
            timestamp: new Date().toISOString()
        };

        // Collect all form fields
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Also collect textarea values
        document.querySelectorAll('textarea').forEach(textarea => {
            const key = textarea.name || textarea.id;
            if (key) {
                data[key] = textarea.value;
            }
        });

        // Collect select values
        document.querySelectorAll('select').forEach(select => {
            const key = select.name || select.id;
            if (key) {
                data[key] = select.value;
            }
        });

        // Collect checkbox values
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            const key = checkbox.name || checkbox.id;
            if (key) {
                if (!data[key]) data[key] = [];
                if (checkbox.checked) {
                    data[key].push(checkbox.value);
                }
            }
        });

        return data;
    }

    saveAndContinue() {
        const currentStepData = this.collectCurrentStepData();
        if (currentStepData) {
            localStorage.setItem(`fachlicheEntwicklungStep${this.currentStep}`, JSON.stringify(currentStepData));
            this.workflowData[this.getStepKey(this.currentStep)] = currentStepData;
        }

        // Navigate to next step
        const nextStep = this.currentStep + 1;
        if (nextStep <= this.totalSteps) {
            window.location.href = `step${nextStep}-fachliche-entwicklung.html`;
        } else {
            this.completeWorkflow();
        }
    }

    getCurrentStepFromURL() {
        // Extrahiere aktuellen Schritt aus URL
        const path = window.location.pathname;
        const match = path.match(/step(\d+)-fachliche-entwicklung/);
        if (match) {
            this.currentStep = parseInt(match[1]);
        }
    }

    completeWorkflow() {
        // Generate final analysis
        const analysis = this.generateFinalAnalysis();
        
        // Save final analysis
        localStorage.setItem('fachlicheEntwicklungFinalAnalysis', JSON.stringify(analysis));
        
        // Show completion modal
        this.showCompletionModal();
    }

    showCompletionModal() {
        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎉 Fachliche Entwicklung Workflow abgeschlossen!</h2>
                    <p>Dein persönlicher Entwicklungsplan wurde erfolgreich erstellt.</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="viewInsights()">
                        <i class="fas fa-brain"></i>
                        KI-Insights anzeigen
                    </button>
                    <button class="btn btn-outline" onclick="exportPDF()">
                        <i class="fas fa-download"></i>
                        PDF herunterladen
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-home"></i>
                        Zurück zur Übersicht
                    </button>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .completion-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(10px);
            }
            .modal-content {
                background: white;
                border-radius: 20px;
                padding: 3rem;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            .modal-header h2 {
                color: #333;
                margin-bottom: 1rem;
                font-size: 2rem;
            }
            .modal-header p {
                color: #666;
                margin-bottom: 2rem;
                line-height: 1.6;
            }
            .modal-actions {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .modal-actions .btn {
                width: 100%;
                padding: 1rem 2rem;
                font-size: 1.1rem;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    generateFinalAnalysis() {
        const analysis = {
            timestamp: new Date().toISOString(),
            steps: this.workflowData,
            skills: this.extractSkills(),
            gaps: this.extractSkillGaps(),
            learningPath: this.extractLearningPath(),
            progress: this.extractProgress(),
            certifications: this.extractCertifications(),
            strategy: this.generateStrategy(),
            actionPlan: this.extractActionPlan()
        };

        return analysis;
    }

    extractSkills() {
        const step1Data = this.workflowData.selfAnalysis;
        if (!step1Data) return null;

        return {
            technical: step1Data.technicalSkills || '',
            soft: step1Data.softSkills || '',
            experience: step1Data.experience || '',
            tools: step1Data.tools || '',
            projects: step1Data.projects || ''
        };
    }

    extractSkillGaps() {
        const step2Data = this.workflowData.skillGapAnalysis;
        if (!step2Data) return null;

        return {
            gaps: step2Data.gaps || '',
            priorities: step2Data.priorities || '',
            trends: step2Data.trends || '',
            critical: step2Data.criticalSkills || ''
        };
    }

    extractLearningPath() {
        const step3Data = this.workflowData.learningPath;
        if (!step3Data) return null;

        return {
            goals: step3Data.learningGoals || '',
            methods: step3Data.learningMethods || '',
            time: step3Data.timeInvestment || '',
            resources: step3Data.resources || '',
            formats: step3Data.learningFormats || ''
        };
    }

    extractProgress() {
        const step4Data = this.workflowData.progressTracking;
        if (!step4Data) return null;

        return {
            metrics: step4Data.metrics || '',
            milestones: step4Data.milestones || '',
            reflection: step4Data.reflection || '',
            rewards: step4Data.rewards || ''
        };
    }

    extractCertifications() {
        const step5Data = this.workflowData.certifications;
        if (!step5Data) return null;

        return {
            planned: step5Data.plannedCertifications || '',
            priorities: step5Data.certificationPriorities || '',
            timeline: step5Data.certificationTimeline || '',
            investment: step5Data.investment || ''
        };
    }

    generateStrategy() {
        const step6Data = this.workflowData.synthesis;
        if (!step6Data) return null;

        return {
            priorities: step6Data.priorities || '',
            dependencies: step6Data.dependencies || '',
            challenges: step6Data.challenges || '',
            roadmap: step6Data.roadmap || ''
        };
    }

    extractActionPlan() {
        const step7Data = this.workflowData.actionPlan;
        if (!step7Data) return null;

        return {
            firstSteps: step7Data.firstSteps || '',
            resources: step7Data.resources || '',
            support: step7Data.support || '',
            obstacles: step7Data.obstacles || '',
            motivation: step7Data.motivation || ''
        };
    }

    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${this.currentStep} von ${this.totalSteps}`;
        }
    }

    // Initialize specialized modules
    initializeSkillGapAnalyzer() {
        if (typeof SkillGapAnalyzer !== 'undefined') {
            this.skillGapAnalyzer = new SkillGapAnalyzer();
        }
    }

    initializeLearningPathGenerator() {
        if (typeof LearningPathGenerator !== 'undefined') {
            this.learningPathGenerator = new LearningPathGenerator();
        }
    }

    initializeProgressTracker() {
        if (typeof ProgressTracker !== 'undefined') {
            this.progressTracker = new ProgressTracker();
        }
    }

    initializeExportFunctions() {
        if (typeof FachlicheEntwicklungExportFunctions !== 'undefined') {
            this.exportFunctions = new FachlicheEntwicklungExportFunctions();
        }
    }

    // Public methods
    getCurrentStep() {
        return this.currentStep;
    }

    getWorkflowData() {
        return this.workflowData;
    }

    resetWorkflow() {
        for (let i = 1; i <= this.totalSteps; i++) {
            localStorage.removeItem(`fachlicheEntwicklungStep${i}`);
        }
        localStorage.removeItem('fachlicheEntwicklungFinalAnalysis');
        this.workflowData = {
            selfAnalysis: {},
            skillGapAnalysis: {},
            learningPath: {},
            progressTracking: {},
            certifications: {},
            synthesis: {},
            actionPlan: {}
        };
        this.currentStep = 1;
    }

    exportData() {
        const data = {
            workflow: this.workflowData,
            analysis: JSON.parse(localStorage.getItem('fachlicheEntwicklungFinalAnalysis') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fachliche-entwicklung-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Global functions for HTML onclick handlers
function startFachlicheEntwicklungWorkflow() {
    window.location.href = 'step1-fachliche-entwicklung.html';
}

function saveAndContinue() {
    if (window.fachlicheEntwicklungWorkflow) {
        window.fachlicheEntwicklungWorkflow.saveAndContinue();
    }
}

function viewInsights() {
    window.location.href = 'insights-overview.html';
}

function exportPDF() {
    if (window.fachlicheEntwicklungWorkflow && window.fachlicheEntwicklungWorkflow.exportFunctions) {
        window.fachlicheEntwicklungWorkflow.exportFunctions.exportToPDF();
    } else {
        window.location.href = 'insights-overview.html';
    }
}

function closeModal() {
    const modal = document.querySelector('.completion-modal');
    if (modal) {
        modal.remove();
    }
    window.location.href = 'index-fachliche-entwicklung.html';
}

// Initialize workflow when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on a step page
    if (window.location.pathname.includes('step')) {
        window.fachlicheEntwicklungWorkflow = new FachlicheEntwicklungWorkflow();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FachlicheEntwicklungWorkflow;
}

