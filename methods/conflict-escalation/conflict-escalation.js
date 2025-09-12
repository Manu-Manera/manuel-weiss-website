// Conflict Escalation Method JavaScript
class ConflictEscalation {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedData();
        this.updateNavigationButtons();
    }

    setupEventListeners() {
        document.querySelectorAll('.progress-step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(e.currentTarget.dataset.step);
                this.goToStep(stepNumber);
            });
        });

        document.querySelectorAll('textarea, input').forEach(input => {
            input.addEventListener('input', () => {
                this.saveProgress();
            });
        });

        window.nextStep = () => this.nextStep();
        window.previousStep = () => this.previousStep();
        window.goToStep = (step) => this.goToStep(step);
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            this.saveProgress();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            this.saveProgress();
        }
    }

    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.currentStep = step;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            this.saveProgress();
        }
    }

    updateStepDisplay() {
        document.querySelectorAll('.workflow-step').forEach(step => {
            step.classList.remove('active');
        });

        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prev-step');
        const nextButton = document.getElementById('next-step');

        if (prevButton) {
            prevButton.disabled = this.currentStep === 1;
        }

        if (nextButton) {
            nextButton.disabled = this.currentStep === this.totalSteps;
        }
    }

    saveProgress() {
        const formData = this.getFormData();
        localStorage.setItem('conflict-escalation-progress', JSON.stringify({
            currentStep: this.currentStep,
            formData: formData,
            timestamp: new Date().toISOString()
        }));
    }

    loadSavedData() {
        const savedData = localStorage.getItem('conflict-escalation-progress');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.currentStep = data.currentStep || 1;
                this.updateStepDisplay();
                this.updateNavigationButtons();
                
                if (data.formData) {
                    this.populateForm(data.formData);
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    getFormData() {
        const formData = {};
        document.querySelectorAll('textarea, input').forEach(input => {
            if (input.id) {
                formData[input.id] = input.value;
            }
        });
        return formData;
    }

    populateForm(formData) {
        Object.keys(formData).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = formData[id];
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ConflictEscalation();
});

window.ConflictEscalation = ConflictEscalation;
