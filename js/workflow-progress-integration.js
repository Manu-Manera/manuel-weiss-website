/**
 * Workflow Progress Integration
 * Extends progress tracking for multi-step workflows (Bewerbung, etc.)
 */

class WorkflowProgressIntegration {
    constructor() {
        this.workflowId = null;
        this.currentStep = 1;
        this.totalSteps = 1;
        this.workflowData = {};
        this.isInitialized = false;
    }

    /**
     * Initialize workflow progress tracking
     */
    async init(workflowId, totalSteps = 1) {
        if (!window.personalityAuthIntegration) {
            console.error('PersonalityAuthIntegration not available');
            return false;
        }
        
        this.workflowId = workflowId || this.extractWorkflowId();
        this.totalSteps = totalSteps;
        
        // Initialize base auth integration
        const authInitialized = await window.personalityAuthIntegration.init(
            this.workflowId, 
            this.workflowId, 
            'workflow'
        );
        
        if (!authInitialized) {
            return false;
        }
        
        // Load existing workflow data
        await this.loadWorkflowData();
        
        // Update UI
        this.updateProgressUI();
        
        // Setup step navigation
        this.setupStepNavigation();
        
        this.isInitialized = true;
        console.log('Workflow progress integration initialized:', this.workflowId);
        return true;
    }

    /**
     * Extract workflow ID from page
     */
    extractWorkflowId() {
        // Try URL
        const urlMatch = window.location.pathname.match(/([^\/]+)-workflow/);
        if (urlMatch) {
            return urlMatch[1];
        }
        
        // Try data attribute
        const workflowEl = document.querySelector('[data-workflow-id]');
        if (workflowEl) {
            return workflowEl.getAttribute('data-workflow-id');
        }
        
        // Fallback to page name
        return 'unknown-workflow';
    }

    /**
     * Load existing workflow data
     */
    async loadWorkflowData() {
        if (!window.userProgressTracker) return;
        
        const progress = window.userProgressTracker.getPageProgress(this.workflowId);
        if (progress && progress.formData) {
            this.workflowData = progress.formData;
        }
        
        // Determine current step from progress
        if (progress && progress.steps) {
            const completedSteps = Object.keys(progress.steps).length;
            this.currentStep = Math.min(completedSteps + 1, this.totalSteps);
        }
        
        // Navigate to current step if not already there
        const urlStep = this.getStepFromURL();
        if (urlStep && urlStep !== this.currentStep) {
            this.navigateToStep(this.currentStep);
        }
    }

    /**
     * Get current step from URL
     */
    getStepFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const step = urlParams.get('step');
        return step ? parseInt(step) : 1;
    }

    /**
     * Navigate to specific step
     */
    navigateToStep(stepNumber) {
        const url = new URL(window.location);
        url.searchParams.set('step', stepNumber);
        window.history.pushState({step: stepNumber}, '', url);
        
        this.currentStep = stepNumber;
        this.showStep(stepNumber);
        this.updateProgressUI();
    }

    /**
     * Show specific step content
     */
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('[data-step]').forEach(el => {
            el.style.display = 'none';
            el.classList.remove('active');
        });
        
        // Show current step
        const currentStepEl = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStepEl) {
            currentStepEl.style.display = 'block';
            currentStepEl.classList.add('active');
        }
        
        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const indicatorStep = index + 1;
            indicator.classList.remove('active', 'completed', 'upcoming');
            
            if (indicatorStep < stepNumber) {
                indicator.classList.add('completed');
            } else if (indicatorStep === stepNumber) {
                indicator.classList.add('active');
            } else {
                indicator.classList.add('upcoming');
            }
        });
    }

    /**
     * Setup step navigation
     */
    setupStepNavigation() {
        // Previous step buttons
        document.querySelectorAll('[data-action="previous-step"]').forEach(btn => {
            btn.addEventListener('click', () => this.previousStep());
        });
        
        // Next step buttons
        document.querySelectorAll('[data-action="next-step"]').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
        
        // Step indicators
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                const targetStep = index + 1;
                if (targetStep <= this.currentStep) {
                    this.navigateToStep(targetStep);
                }
            });
        });
        
        // Browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.step) {
                this.showStep(event.state.step);
                this.currentStep = event.state.step;
                this.updateProgressUI();
            }
        });
    }

    /**
     * Go to previous step
     */
    previousStep() {
        if (this.currentStep > 1) {
            this.navigateToStep(this.currentStep - 1);
        }
    }

    /**
     * Go to next step
     */
    async nextStep() {
        // Prüfe Auth beim ersten "Weiter"-Klick
        const canProceed = await window.authRequiredAction.handleNextButton(async () => {
            // Diese Aktion wird ausgeführt, wenn User angemeldet ist
            await this.executeNextStep();
        }, {
            message: 'Bitte melde dich an, um fortzufahren. Dein Fortschritt wird automatisch gespeichert.'
        });

        // Wenn nicht angemeldet, wird Login-Prompt angezeigt
        // Die Aktion wird nach erfolgreicher Anmeldung automatisch ausgeführt
        if (!canProceed) {
            return;
        }
    }

    /**
     * Führt den eigentlichen "Weiter"-Schritt aus
     */
    async executeNextStep() {
        // Save current step data first
        await this.saveStepData();
        
        // Mark current step as completed
        if (window.personalityAuthIntegration) {
            window.personalityAuthIntegration.completeStep(
                `step-${this.currentStep}`, 
                this.totalSteps
            );
        }
        
        // Ensure progress tracker is initialized
        if (window.userProgressTracker && !window.userProgressTracker.isInitialized) {
            await window.userProgressTracker.init();
        }
        
        if (this.currentStep < this.totalSteps) {
            this.navigateToStep(this.currentStep + 1);
        } else {
            this.completeWorkflow();
        }
    }

    /**
     * Save current step data
     */
    async saveStepData() {
        const stepEl = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (!stepEl) return;
        
        const stepData = {};
        const inputs = stepEl.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.name) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    if (input.checked) {
                        stepData[input.name] = input.value;
                    }
                } else {
                    stepData[input.name] = input.value;
                }
            }
        });
        
        // Merge with existing workflow data
        Object.assign(this.workflowData, stepData);
        
        // Save to progress tracker
        if (window.userProgressTracker) {
            window.userProgressTracker.trackFormData(this.workflowId, this.workflowData);
        }
    }

    /**
     * Complete workflow
     */
    async completeWorkflow() {
        // Save final data
        await this.saveStepData();
        
        // Mark workflow as completed
        if (window.personalityAuthIntegration) {
            window.personalityAuthIntegration.completeTest({
                workflowId: this.workflowId,
                completedAt: new Date().toISOString(),
                data: this.workflowData
            });
        }
        
        // Show completion message
        this.showCompletionMessage();
    }

    /**
     * Update progress UI
     */
    updateProgressUI() {
        // Update progress bar
        const progressBar = document.querySelector('.workflow-progress-bar');
        if (progressBar) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressBar.style.width = `${percentage}%`;
        }
        
        // Update step counter
        const stepCounter = document.querySelector('.step-counter');
        if (stepCounter) {
            stepCounter.textContent = `Schritt ${this.currentStep} von ${this.totalSteps}`;
        }
        
        // Update completion percentage
        const completionText = document.querySelector('.completion-percentage');
        if (completionText) {
            const percentage = Math.round((this.currentStep - 1) / this.totalSteps * 100);
            completionText.textContent = `${percentage}% abgeschlossen`;
        }
        
        // Update navigation buttons
        const prevBtn = document.querySelector('[data-action="previous-step"]');
        const nextBtn = document.querySelector('[data-action="next-step"]');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep <= 1;
        }
        
        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.totalSteps ? 
                'Workflow abschließen' : 'Weiter';
        }
    }

    /**
     * Show completion message
     */
    showCompletionMessage() {
        const completionHTML = `
            <div class="workflow-completion-overlay">
                <div class="workflow-completion-card">
                    <div class="completion-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Workflow abgeschlossen!</h2>
                    <p>Herzlichen Glückwunsch! Du hast den ${this.workflowId}-Workflow erfolgreich abgeschlossen.</p>
                    <div class="completion-stats">
                        <div class="stat">
                            <i class="fas fa-tasks"></i>
                            <span>${this.totalSteps} Schritte</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-clock"></i>
                            <span>${new Date().toLocaleDateString('de-DE')}</span>
                        </div>
                    </div>
                    <div class="completion-actions">
                        <button class="btn btn-primary" onclick="window.location.href='/user-profile-dashboard.html'">
                            <i class="fas fa-chart-line"></i> Zum Dashboard
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.href='/persoenlichkeitsentwicklung-uebersicht.html'">
                            <i class="fas fa-th"></i> Weitere Methoden
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        if (!document.querySelector('#workflowCompletionStyles')) {
            const styles = `
                <style id="workflowCompletionStyles">
                    .workflow-completion-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                    }
                    
                    .workflow-completion-card {
                        background: white;
                        border-radius: 16px;
                        padding: 48px;
                        max-width: 600px;
                        width: 90%;
                        text-align: center;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        animation: scaleIn 0.3s ease;
                    }
                    
                    .completion-icon {
                        width: 100px;
                        height: 100px;
                        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                    }
                    
                    .completion-icon i {
                        font-size: 48px;
                        color: white;
                    }
                    
                    .workflow-completion-card h2 {
                        font-size: 32px;
                        font-weight: 700;
                        color: #1a202c;
                        margin-bottom: 16px;
                    }
                    
                    .workflow-completion-card p {
                        font-size: 18px;
                        color: #4a5568;
                        margin-bottom: 32px;
                        line-height: 1.6;
                    }
                    
                    .completion-stats {
                        display: flex;
                        justify-content: center;
                        gap: 48px;
                        margin-bottom: 40px;
                    }
                    
                    .completion-stats .stat {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-size: 16px;
                        color: #4a5568;
                    }
                    
                    .completion-stats i {
                        font-size: 20px;
                        color: #667eea;
                    }
                    
                    .completion-actions {
                        display: flex;
                        gap: 16px;
                        justify-content: center;
                    }
                    
                    .completion-actions button {
                        padding: 14px 28px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        transition: all 0.2s ease;
                        cursor: pointer;
                        border: none;
                    }
                    
                    .completion-actions .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    
                    .completion-actions .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                    }
                    
                    .completion-actions .btn-secondary {
                        background: #e2e8f0;
                        color: #4a5568;
                    }
                    
                    .completion-actions .btn-secondary:hover {
                        background: #cbd5e0;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes scaleIn {
                        from {
                            transform: scale(0.9);
                            opacity: 0;
                        }
                        to {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
        
        document.body.insertAdjacentHTML('beforeend', completionHTML);
    }

    /**
     * Get workflow summary data
     */
    getWorkflowSummary() {
        return {
            workflowId: this.workflowId,
            currentStep: this.currentStep,
            totalSteps: this.totalSteps,
            completionPercentage: Math.round((this.currentStep - 1) / this.totalSteps * 100),
            data: this.workflowData
        };
    }
}

// Create global instance
window.workflowProgressIntegration = new WorkflowProgressIntegration();

// Auto-initialize on DOM ready for workflow pages
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('workflow') || 
        document.querySelector('[data-workflow]')) {
        
        // Get total steps from DOM or default
        const totalStepsEl = document.querySelector('[data-total-steps]');
        const totalSteps = totalStepsEl ? 
            parseInt(totalStepsEl.getAttribute('data-total-steps')) : 
            document.querySelectorAll('[data-step]').length;
        
        // Initialize workflow progress
        window.workflowProgressIntegration.init(null, totalSteps);
    }
});
