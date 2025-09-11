// NLP Meta Goal Method Implementation

function initNLPMetaGoal() {
    console.log('Initializing NLP Meta Goal method');
    
    // Initialize the workflow
    setupWorkflowNavigation();
    setupFormInputs();
    
    // Load saved data if available
    loadSavedData();
}

function setupWorkflowNavigation() {
    // Add click handlers for progress steps
    document.querySelectorAll('.progress-step').forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = parseInt(this.dataset.step);
            goToStep(stepNumber);
        });
    });
}

function setupFormInputs() {
    // Add event listeners for all form inputs
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            saveProgress();
        });
    });
    
    // Add event listeners for checkboxes and radio buttons
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
    
    localStorage.setItem('nlp-meta-goal-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('nlp-meta-goal-progress');
    if (!savedData) return;
    
    try {
        const progressData = JSON.parse(savedData);
        
        // Restore form data
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
        
        // Restore current step
        if (progressData.currentStep) {
            goToStep(progressData.currentStep);
        }
        
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function getFormData() {
    const formData = {};
    const formInputs = document.querySelectorAll('input, textarea, select');
    
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
    // Hide all steps
    document.querySelectorAll('.workflow-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Update progress steps
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
        const stepNum = parseInt(step.dataset.step);
        if (stepNum < stepNumber) {
            step.classList.add('completed');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
        }
    });
    
    // Update navigation buttons
    updateNavigationButtons(stepNumber);
    
    // Update step counter
    document.getElementById('current-step').textContent = `Schritt ${stepNumber}`;
    document.getElementById('total-steps').textContent = '5';
    
    // Save current step
    saveProgress();
}

function updateNavigationButtons(currentStep) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentStep === 1;
    nextBtn.disabled = currentStep === 5;
    
    if (currentStep === 5) {
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Abschließen';
    } else {
        nextBtn.innerHTML = 'Weiter <i class="fas fa-arrow-right"></i>';
    }
}

function nextStep() {
    const currentStep = getCurrentStep();
    if (currentStep < 5) {
        goToStep(currentStep + 1);
    } else {
        // Complete the method
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
    // Generate summary
    const summary = generateSummary();
    
    // Show completion message
    showNotification('NLP Meta Goal erfolgreich abgeschlossen!', 'success');
    
    // Export results
    exportResults(summary);
}

function generateSummary() {
    const formData = getFormData();
    
    // Extract key information
    const metaGoal1 = formData['meta-goal-1'] || '';
    const metaGoal2 = formData['meta-goal-2'] || '';
    const metaGoal3 = formData['meta-goal-3'] || '';
    
    const lifeVision = formData['life-vision-10'] || '';
    const lifeMission = formData['life-mission'] || '';
    const coreValues = formData['core-values'] || '';
    
    // Count selected criteria
    const selectedCriteria = Object.entries(formData)
        .filter(([key, value]) => key.includes('alignment-') && value === true)
        .length;
    
    // Get review frequency
    const reviewFrequency = Object.entries(formData)
        .find(([key, value]) => key.includes('review-') && value === true)?.[0] || '';
    
    return {
        metaGoals: [metaGoal1, metaGoal2, metaGoal3],
        lifeVision: lifeVision,
        lifeMission: lifeMission,
        coreValues: coreValues,
        selectedCriteria: selectedCriteria,
        reviewFrequency: reviewFrequency,
        completedAt: new Date().toISOString()
    };
}

function exportResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nlp-meta-goal-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Global functions for workflow navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
