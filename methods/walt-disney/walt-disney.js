// Walt Disney Method Implementation

function initWaltDisney() {
    console.log('Initializing Walt Disney method');
    
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

function saveProgress() {
    const progressData = {
        formData: getFormData(),
        currentStep: getCurrentStep()
    };
    
    localStorage.setItem('walt-disney-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('walt-disney-progress');
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
    showNotification('Walt Disney Methode erfolgreich abgeschlossen!', 'success');
    
    // Export results
    exportResults(summary);
}

function generateSummary() {
    const formData = getFormData();
    
    // Extract key information from each perspective
    const dreamerData = {
        biggestVision: formData['biggest-vision'] || '',
        idealSolution: formData['ideal-solution'] || '',
        unlimitedBudget: formData['unlimited-budget'] || '',
        innovativeApproaches: formData['innovative-approaches'] || '',
        wildIdeas: [
            formData['wild-idea-1'] || '',
            formData['wild-idea-2'] || '',
            formData['wild-idea-3'] || ''
        ],
        revolutionaryIdea: formData['revolutionary-idea'] || ''
    };
    
    const realistData = {
        promisingIdeas: formData['promising-ideas'] || '',
        concreteSteps: formData['concrete-steps'] || '',
        requiredResources: formData['required-resources'] || '',
        responsibilities: formData['responsibilities'] || '',
        immediateActions: formData['immediate-actions'] || '',
        shortTermGoals: formData['short-term-goals'] || '',
        mediumTermGoals: formData['medium-term-goals'] || '',
        longTermGoals: formData['long-term-goals'] || '',
        financialResources: formData['financial-resources'] || '',
        humanResources: formData['human-resources'] || '',
        technicalResources: formData['technical-resources'] || '',
        externalSupport: formData['external-support'] || '',
        identifiedRisks: formData['identified-risks'] || '',
        riskMitigation: formData['risk-mitigation'] || '',
        fallbackPlans: formData['fallback-plans'] || ''
    };
    
    const criticData = {
        planWeaknesses: formData['plan-weaknesses'] || '',
        falseAssumptions: formData['false-assumptions'] || '',
        potentialFailures: formData['potential-failures'] || '',
        unexpectedChallenges: formData['unexpected-challenges'] || '',
        realisticPlan: formData['realistic-plan'] || '',
        sufficientResources: formData['sufficient-resources'] || '',
        feasibleTimeline: formData['feasible-timeline'] || '',
        stakeholderConsideration: formData['stakeholder-consideration'] || '',
        betterAlternatives: formData['better-alternatives'] || '',
        planImprovements: formData['plan-improvements'] || '',
        additionalMeasures: formData['additional-measures'] || '',
        betterRiskManagement: formData['better-risk-management'] || '',
        qualityControls: formData['quality-controls'] || '',
        alternatives: [
            formData['alternative-1'] || '',
            formData['alternative-2'] || ''
        ],
        hybridSolution: formData['hybrid-solution'] || ''
    };
    
    const integrationData = {
        relevantDreams: formData['relevant-dreams'] || '',
        improvedPlans: formData['improved-plans'] || '',
        necessaryCompromises: formData['necessary-compromises'] || '',
        innovativePractical: formData['innovative-practical'] || '',
        optimalSolution: formData['optimal-solution'] || '',
        finalImplementation: formData['final-implementation'] || '',
        successMeasurement: formData['success-measurement'] || '',
        nextSteps: formData['next-steps'] || '',
        valuableInputs: formData['valuable-inputs'] || '',
        changedUnderstanding: formData['changed-understanding'] || '',
        nextTimeDifferent: formData['next-time-different'] || ''
    };
    
    // Count selected techniques
    const selectedTechniques = Object.entries(formData)
        .filter(([key, value]) => key.includes('brainstorm-') || key.includes('roleplay-') || key.includes('analogy-'))
        .filter(([key, value]) => value === true)
        .length;
    
    return {
        dreamer: dreamerData,
        realist: realistData,
        critic: criticData,
        integration: integrationData,
        selectedTechniques: selectedTechniques,
        completedAt: new Date().toISOString()
    };
}

function exportResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'walt-disney-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Global functions for workflow navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;