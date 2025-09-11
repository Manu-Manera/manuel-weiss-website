// Method Implementation
function initMethod() {
    console.log('Initializing method');
    setupWorkflowNavigation();
    setupFormInputs();
    loadSavedData();
}

function setupWorkflowNavigation() {
    document.querySelectorAll('.progress-step').forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = parseInt(this.dataset.step);
            goToStep(stepNumber);
        });
    });
}

function setupFormInputs() {
    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            saveProgress();
        });
    });
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveProgress();
        });
    });
}

function saveProgress() {
    const progressData = {
        formData: getFormData(),
        currentStep: getCurrentStep()
    };
    localStorage.setItem('method-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('method-progress');
    if (!savedData) return;
    
    try {
        const progressData = JSON.parse(savedData);
        if (progressData.formData) {
            Object.entries(progressData.formData).forEach(([inputId, value]) => {
                const input = document.getElementById(inputId);
                if (input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = value;
                    } else {
                        input.value = value;
                    }
                }
            });
        }
        if (progressData.currentStep) {
            goToStep(progressData.currentStep);
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function getFormData() {
    const formData = {};
    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            formData[input.id] = input.checked;
        } else if (input.value.trim()) {
            formData[input.id] = input.value;
        }
    });
    return formData;
}

function getCurrentStep() {
    const activeStep = document.querySelector('.workflow-step.active');
    return activeStep ? parseInt(activeStep.dataset.step) : 1;
}

function goToStep(stepNumber) {
    document.querySelectorAll('.workflow-step').forEach(step => {
        step.classList.remove('active');
    });
    
    const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
        const stepNum = parseInt(step.dataset.step);
        if (stepNum < stepNumber) {
            step.classList.add('completed');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
        }
    });
    
    updateNavigationButtons(stepNumber);
    document.getElementById('current-step').textContent = `Schritt ${stepNumber}`;
    document.getElementById('total-steps').textContent = '4';
    saveProgress();
}

function updateNavigationButtons(currentStep) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentStep === 1;
    nextBtn.disabled = currentStep === 4;
    
    if (currentStep === 4) {
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Abschließen';
    } else {
        nextBtn.innerHTML = 'Weiter <i class="fas fa-arrow-right"></i>';
    }
}

function nextStep() {
    const currentStep = getCurrentStep();
    if (currentStep < 4) {
        goToStep(currentStep + 1);
    } else {
        completeMethod();
    }
}

function previousStep() {
    const currentStep = getCurrentStep();
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function completeMethod() {
    const summary = generateSummary();
    showNotification('Methode erfolgreich abgeschlossen!', 'success');
    exportResults(summary);
}

function generateSummary() {
    const formData = getFormData();
    return {
        formData: formData,
        completedAt: new Date().toISOString()
    };
}

function exportResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'method-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
