// Circular Interview Method JavaScript
class CircularInterview {
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
        // Progress step navigation
        document.querySelectorAll('.progress-step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(e.currentTarget.dataset.step);
                this.goToStep(stepNumber);
            });
        });

        // Auto-save on input change
        document.querySelectorAll('textarea, input').forEach(input => {
            input.addEventListener('input', () => {
                this.saveProgress();
            });
        });

        // Add global navigation functions
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
        // Hide all steps
        document.querySelectorAll('.workflow-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update progress steps
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
        localStorage.setItem('circular-interview-progress', JSON.stringify({
            currentStep: this.currentStep,
            formData: formData,
            timestamp: new Date().toISOString()
        }));
    }

    loadSavedData() {
        const savedData = localStorage.getItem('circular-interview-progress');
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

    // Method-specific functions
    generateCircularQuestions() {
        const questions = {
            hypothetical: [
                "Was wäre, wenn das Problem plötzlich verschwunden wäre?",
                "Was wäre, wenn alle Beteiligten ihre Meinung ändern würden?",
                "Was wäre, wenn Sie eine andere Rolle hätten?"
            ],
            circular: [
                "Wie würde Ihr Partner das Problem beschreiben?",
                "Was würde Ihre Mutter dazu sagen?",
                "Wie würde Ihr bester Freund die Situation einschätzen?"
            ],
            scaling: [
                "Auf einer Skala von 1-10, wie zufrieden sind Sie mit der aktuellen Situation?",
                "Wie würden Sie Ihre Beziehung auf einer Skala von 1-10 bewerten?",
                "Wie stark ist Ihr Wunsch nach Veränderung auf einer Skala von 1-10?"
            ],
            miracle: [
                "Angenommen, ein Wunder würde passieren und das Problem wäre gelöst - was wäre anders?",
                "Wenn Sie morgen aufwachen und alles wäre perfekt - was würden Sie bemerken?",
                "Was würde passieren, wenn das Problem auf magische Weise verschwinden würde?"
            ]
        };
        return questions;
    }

    analyzeSystemicPatterns() {
        const patterns = {
            communication: "Kommunikationsmuster analysieren",
            relationships: "Beziehungsdynamiken verstehen",
            roles: "Rollen und Funktionen identifizieren",
            boundaries: "Grenzen und Regeln erkennen",
            feedback: "Feedback-Loops verstehen"
        };
        return patterns;
    }

    generateHypotheses() {
        const hypotheses = {
            functional: "Das Problem erfüllt eine Funktion im System",
            circular: "Es gibt zirkuläre Kausalitäten",
            structural: "Die Struktur des Systems verursacht das Problem",
            communication: "Kommunikationsmuster verstärken das Problem",
            boundary: "Grenzprobleme verursachen Konflikte"
        };
        return hypotheses;
    }

    // Export functionality
    exportData() {
        const formData = this.getFormData();
        const data = {
            method: "Circular Interview",
            timestamp: new Date().toISOString(),
            currentStep: this.currentStep,
            data: formData
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circular-interview-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Reset functionality
    resetProgress() {
        if (confirm('Möchten Sie wirklich alle Eingaben zurücksetzen?')) {
            localStorage.removeItem('circular-interview-progress');
            document.querySelectorAll('textarea, input').forEach(input => {
                input.value = '';
            });
            this.currentStep = 1;
            this.updateStepDisplay();
            this.updateNavigationButtons();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CircularInterview();
});

// Global functions for external access
window.CircularInterview = CircularInterview;
