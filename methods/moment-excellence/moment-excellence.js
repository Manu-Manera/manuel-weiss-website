// Moment of Excellence Method Implementation

function initMomentExcellence() {
    console.log('Initializing Moment of Excellence method');
    
    // Initialize the workflow
    setupWorkflowNavigation();
    setupFormInputs();
    setupRatingSliders();
    
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
    const formInputs = document.querySelectorAll('input, textarea');
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

function setupRatingSliders() {
    // Add event listeners for rating sliders
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('input', function() {
            const value = this.value;
            const valueElement = document.getElementById(this.id.replace('-rating', '-value').replace('-intensity', '-value').replace('-satisfaction', '-value'));
            if (valueElement) {
                valueElement.textContent = `${value}/10`;
            }
            saveProgress();
        });
    });
}

function saveProgress() {
    const progressData = {
        formData: getFormData(),
        currentStep: getCurrentStep()
    };
    
    localStorage.setItem('moment-excellence-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('moment-excellence-progress');
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
    showNotification('Moment of Excellence erfolgreich abgeschlossen!', 'success');
    
    // Export results
    exportResults(summary);
}

function generateSummary() {
    const formData = getFormData();
    
    // Extract key information
    const excellenceMemory1 = formData['excellence-memory-1'] || '';
    const excellenceMemory2 = formData['excellence-memory-2'] || '';
    const excellenceMemory3 = formData['excellence-memory-3'] || '';
    
    // Count selected factors
    const selectedFactors = Object.entries(formData)
        .filter(([key, value]) => key.includes('mental-') || key.includes('energy-') || key.includes('environment-') && value === true)
        .length;
    
    // Get anchor intensity
    const anchorIntensity = formData['anchor-intensity'] || '5';
    
    // Count selected techniques
    const selectedTechniques = Object.entries(formData)
        .filter(([key, value]) => key.includes('pre-') || key.includes('challenge-') || key.includes('creative-') && value === true)
        .length;
    
    // Get performance satisfaction
    const performanceSatisfaction = formData['performance-satisfaction'] || '5';
    
    return {
        excellenceMemories: [excellenceMemory1, excellenceMemory2, excellenceMemory3],
        selectedFactors: selectedFactors,
        anchorIntensity: anchorIntensity,
        selectedTechniques: selectedTechniques,
        performanceSatisfaction: performanceSatisfaction,
        completedAt: new Date().toISOString()
    };
}

function exportResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'moment-excellence-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Global functions for workflow navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
