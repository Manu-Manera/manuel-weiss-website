// Resource Analysis Method Implementation

function initResourceAnalysis() {
    console.log('Initializing Resource Analysis method');
    
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
            const valueElement = document.getElementById(this.id.replace('-quality', '-value').replace('-availability', '-value').replace('-potential', '-value'));
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
    
    localStorage.setItem('resource-analysis-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('resource-analysis-progress');
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
                    } else if (input.type === 'range') {
                        input.value = value;
                        // Update display value
                        const valueElement = document.getElementById(inputId.replace('-quality', '-value').replace('-availability', '-value').replace('-potential', '-value'));
                        if (valueElement) {
                            valueElement.textContent = `${value}/10`;
                        }
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
        } else if (input.type === 'range') {
            formData[input.id] = input.value;
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
    document.getElementById('total-steps').textContent = '4';
    
    // Save current step
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
    showNotification('Resource Analysis erfolgreich abgeschlossen!', 'success');
    
    // Export results
    exportResults(summary);
}

function generateSummary() {
    const formData = getFormData();
    
    // Extract key information
    const personalSkills = formData['personal-skills'] || '';
    const availableCapital = formData['available-capital'] || '';
    const technicalEquipment = formData['technical-equipment'] || '';
    const knowledgeExpertise = formData['knowledge-expertise'] || '';
    const availableTime = formData['available-time'] || '';
    
    // Calculate average ratings
    const qualityRatings = [
        formData['quality-personal'] || '5',
        formData['quality-financial'] || '5',
        formData['quality-material'] || '5',
        formData['quality-information'] || '5',
        formData['quality-time'] || '5'
    ];
    
    const availabilityRatings = [
        formData['availability-personal'] || '5',
        formData['availability-financial'] || '5',
        formData['availability-material'] || '5',
        formData['availability-information'] || '5',
        formData['availability-time'] || '5'
    ];
    
    const potentialRatings = [
        formData['potential-personal'] || '5',
        formData['potential-financial'] || '5',
        formData['potential-material'] || '5',
        formData['potential-information'] || '5',
        formData['potential-time'] || '5'
    ];
    
    const avgQuality = qualityRatings.reduce((sum, rating) => sum + parseInt(rating), 0) / qualityRatings.length;
    const avgAvailability = availabilityRatings.reduce((sum, rating) => sum + parseInt(rating), 0) / availabilityRatings.length;
    const avgPotential = potentialRatings.reduce((sum, rating) => sum + parseInt(rating), 0) / potentialRatings.length;
    
    return {
        personalSkills: personalSkills,
        availableCapital: availableCapital,
        technicalEquipment: technicalEquipment,
        knowledgeExpertise: knowledgeExpertise,
        availableTime: availableTime,
        averageQuality: Math.round(avgQuality * 10) / 10,
        averageAvailability: Math.round(avgAvailability * 10) / 10,
        averagePotential: Math.round(avgPotential * 10) / 10,
        strongestCategory: formData['strongest-category'] || '',
        weakestCategory: formData['weakest-category'] || '',
        underutilizedResources: formData['underutilized-resources'] || '',
        missingResources: formData['missing-resources'] || '',
        completedAt: new Date().toISOString()
    };
}

function exportResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resource-analysis-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Global functions for workflow navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;