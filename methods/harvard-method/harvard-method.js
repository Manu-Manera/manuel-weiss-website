// Harvard Method Implementation

function initHarvardMethod() {
    console.log('Initializing Harvard Method');
    
    // Initialize the workflow
    setupWorkflowNavigation();
    setupFormInputs();
    setupRatingSliders();
    setupCustomElements();
    
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
            const valueElement = document.getElementById(this.id.replace('-rating', '-value'));
            if (valueElement) {
                valueElement.textContent = `${value}/10`;
            }
            saveProgress();
        });
    });
}

function setupCustomElements() {
    // Setup custom interest addition
    const customInterestInput = document.getElementById('custom-interest-input');
    if (customInterestInput) {
        customInterestInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addCustomInterest();
            }
        });
    }
    
    // Setup custom counterparty interest addition
    const cpCustomInterestInput = document.getElementById('cp-custom-interest-input');
    if (cpCustomInterestInput) {
        cpCustomInterestInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addCustomCounterpartyInterest();
            }
        });
    }
}

function addCustomInterest() {
    const input = document.getElementById('custom-interest-input');
    const interestText = input.value.trim();
    if (!interestText) return;
    
    const customInterestsContainer = document.querySelector('.custom-interests .interest-items');
    if (!customInterestsContainer) return;
    
    const interestItem = document.createElement('div');
    interestItem.className = 'interest-item';
    interestItem.innerHTML = `
        <input type="checkbox" id="custom-${Date.now()}">
        <label for="custom-${Date.now()}">${interestText}</label>
        <button type="button" onclick="removeCustomInterest(this)" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem;">×</button>
    `;
    
    customInterestsContainer.appendChild(interestItem);
    input.value = '';
    
    // Add event listener for the new checkbox
    const checkbox = interestItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
        saveProgress();
    });
    
    saveProgress();
}

function addCustomCounterpartyInterest() {
    const input = document.getElementById('cp-custom-interest-input');
    const interestText = input.value.trim();
    if (!interestText) return;
    
    const customInterestsContainer = document.querySelector('.counterparty-interests .custom-interests .interest-items');
    if (!customInterestsContainer) return;
    
    const interestItem = document.createElement('div');
    interestItem.className = 'interest-item';
    interestItem.innerHTML = `
        <input type="checkbox" id="cp-custom-${Date.now()}">
        <label for="cp-custom-${Date.now()}">${interestText}</label>
        <button type="button" onclick="removeCustomInterest(this)" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem;">×</button>
    `;
    
    customInterestsContainer.appendChild(interestItem);
    input.value = '';
    
    // Add event listener for the new checkbox
    const checkbox = interestItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
        saveProgress();
    });
    
    saveProgress();
}

function removeCustomInterest(button) {
    const interestItem = button.closest('.interest-item');
    interestItem.remove();
    saveProgress();
}

function addCustomOption() {
    const titleInput = document.getElementById('option-title-input');
    const descriptionInput = document.getElementById('option-description-input');
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!title || !description) return;
    
    const additionalOptionsContainer = document.querySelector('.additional-options');
    if (!additionalOptionsContainer) return;
    
    const optionItem = document.createElement('div');
    optionItem.className = 'option-item';
    optionItem.innerHTML = `
        <h6>${title}</h6>
        <textarea placeholder="${description}" readonly></textarea>
        <button type="button" onclick="removeCustomOption(this)" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.5rem 1rem; cursor: pointer; margin-top: 0.5rem;">Option entfernen</button>
    `;
    
    additionalOptionsContainer.appendChild(optionItem);
    titleInput.value = '';
    descriptionInput.value = '';
    
    saveProgress();
}

function removeCustomOption(button) {
    const optionItem = button.closest('.option-item');
    optionItem.remove();
    saveProgress();
}

function addCustomCriterion() {
    const nameInput = document.getElementById('criterion-name-input');
    const descriptionInput = document.getElementById('criterion-description-input');
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!name || !description) return;
    
    const customCriteriaContainer = document.querySelector('.custom-criteria');
    if (!customCriteriaContainer) return;
    
    const criterionItem = document.createElement('div');
    criterionItem.className = 'criterion-item';
    criterionItem.innerHTML = `
        <label>${name}</label>
        <div class="criterion-options">
            <div class="criterion-option">
                <input type="checkbox" id="custom-criterion-${Date.now()}">
                <label for="custom-criterion-${Date.now()}">${description}</label>
                <button type="button" onclick="removeCustomCriterion(this)" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem;">×</button>
            </div>
        </div>
    `;
    
    customCriteriaContainer.appendChild(criterionItem);
    nameInput.value = '';
    descriptionInput.value = '';
    
    // Add event listener for the new checkbox
    const checkbox = criterionItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
        saveProgress();
    });
    
    saveProgress();
}

function removeCustomCriterion(button) {
    const criterionItem = button.closest('.criterion-item');
    criterionItem.remove();
    saveProgress();
}

function saveProgress() {
    const progressData = {
        formData: getFormData(),
        currentStep: getCurrentStep()
    };
    
    localStorage.setItem('harvard-method-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('harvard-method-progress');
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
    document.getElementById('total-steps').textContent = '6';
    
    // Save current step
    saveProgress();
}

function updateNavigationButtons(currentStep) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentStep === 1;
    nextBtn.disabled = currentStep === 6;
    
    if (currentStep === 6) {
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Abschließen';
    } else {
        nextBtn.innerHTML = 'Weiter <i class="fas fa-arrow-right"></i>';
    }
}

function nextStep() {
    const currentStep = getCurrentStep();
    if (currentStep < 6) {
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
    showNotification('Harvard-Methode erfolgreich abgeschlossen!', 'success');
    
    // Export results
    exportResults(summary);
}

function generateSummary() {
    const formData = getFormData();
    
    // Extract key information
    const mainGoal = formData['main-goal'] || '';
    const minimumGoal = formData['minimum-goal'] || '';
    const wishGoal = formData['wish-goal'] || '';
    const counterpartyName = formData['counterparty-name'] || '';
    
    // Count selected interests
    const selectedInterests = Object.entries(formData)
        .filter(([key, value]) => key.includes('interest') && value === true)
        .length;
    
    // Count selected criteria
    const selectedCriteria = Object.entries(formData)
        .filter(([key, value]) => key.includes('criterion') && value === true)
        .length;
    
    // Get satisfaction ratings
    const satisfactionRating = formData['satisfaction-rating'] || '5';
    const fairnessRating = formData['fairness-rating'] || '5';
    const relationshipRating = formData['relationship-rating'] || '5';
    
    return {
        mainGoal: mainGoal,
        minimumGoal: minimumGoal,
        wishGoal: wishGoal,
        counterpartyName: counterpartyName,
        selectedInterests: selectedInterests,
        selectedCriteria: selectedCriteria,
        satisfactionRating: satisfactionRating,
        fairnessRating: fairnessRating,
        relationshipRating: relationshipRating,
        completedAt: new Date().toISOString()
    };
}

function exportResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'harvard-method-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Global functions for workflow navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
window.addCustomInterest = addCustomInterest;
window.addCustomCounterpartyInterest = addCustomCounterpartyInterest;
window.removeCustomInterest = removeCustomInterest;
window.addCustomOption = addCustomOption;
window.removeCustomOption = removeCustomOption;
window.addCustomCriterion = addCustomCriterion;
window.removeCustomCriterion = removeCustomCriterion;
