// Johari Window Method Implementation

function initJohariWindow() {
    console.log('Initializing Johari Window method');
    
    // Initialize the workflow
    setupWorkflowNavigation();
    setupTraitSelection();
    setupCustomTraits();
    
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

function setupTraitSelection() {
    // Add event listeners for trait checkboxes
    document.querySelectorAll('.trait-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const traitItem = this.closest('.trait-item');
            if (this.checked) {
                traitItem.style.background = '#e0f2fe';
                traitItem.style.borderColor = '#0ea5e9';
            } else {
                traitItem.style.background = '#f8fafc';
                traitItem.style.borderColor = '#e2e8f0';
            }
            saveProgress();
        });
    });
}

function setupCustomTraits() {
    // Add custom traits functionality
    const addTraitForm = document.querySelector('.add-trait-form');
    if (addTraitForm) {
        const input = addTraitForm.querySelector('input');
        const button = addTraitForm.querySelector('button');
        
        button.addEventListener('click', function() {
            const traitText = input.value.trim();
            if (traitText) {
                addCustomTrait(traitText);
                input.value = '';
            }
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                button.click();
            }
        });
    }
}

function addCustomTrait(traitText) {
    const customTraitsContainer = document.querySelector('.custom-traits');
    if (!customTraitsContainer) return;
    
    // Create new trait item
    const traitItem = document.createElement('div');
    traitItem.className = 'trait-item';
    traitItem.innerHTML = `
        <input type="checkbox" id="custom-${Date.now()}">
        <span>${traitText}</span>
        <button type="button" onclick="removeTrait(this)" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem;">×</button>
    `;
    
    // Add to container
    customTraitsContainer.appendChild(traitItem);
    
    // Add event listener for the new checkbox
    const checkbox = traitItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function() {
        const traitItem = this.closest('.trait-item');
        if (this.checked) {
            traitItem.style.background = '#e0f2fe';
            traitItem.style.borderColor = '#0ea5e9';
        } else {
            traitItem.style.background = '#f8fafc';
            traitItem.style.borderColor = '#e2e8f0';
        }
        saveProgress();
    });
    
    saveProgress();
}

function removeTrait(button) {
    const traitItem = button.closest('.trait-item');
    traitItem.remove();
    saveProgress();
}

function saveProgress() {
    const progressData = {
        selectedTraits: getSelectedTraits(),
        customTraits: getCustomTraits(),
        feedback: getFeedbackText(),
        exploration: getExplorationText(),
        currentStep: getCurrentStep()
    };
    
    localStorage.setItem('johari-window-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('johari-window-progress');
    if (!savedData) return;
    
    try {
        const progressData = JSON.parse(savedData);
        
        // Restore selected traits
        if (progressData.selectedTraits) {
            progressData.selectedTraits.forEach(traitId => {
                const checkbox = document.getElementById(traitId);
                if (checkbox) {
                    checkbox.checked = true;
                    const traitItem = checkbox.closest('.trait-item');
                    traitItem.style.background = '#e0f2fe';
                    traitItem.style.borderColor = '#0ea5e9';
                }
            });
        }
        
        // Restore custom traits
        if (progressData.customTraits) {
            progressData.customTraits.forEach(trait => {
                addCustomTrait(trait);
            });
        }
        
        // Restore feedback text
        if (progressData.feedback) {
            const feedbackTextarea = document.querySelector('.feedback-section textarea');
            if (feedbackTextarea) {
                feedbackTextarea.value = progressData.feedback;
            }
        }
        
        // Restore exploration text
        if (progressData.exploration) {
            const explorationTextareas = document.querySelectorAll('.exploration-questions textarea');
            explorationTextareas.forEach((textarea, index) => {
                if (progressData.exploration[index]) {
                    textarea.value = progressData.exploration[index];
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

function getSelectedTraits() {
    const selectedTraits = [];
    document.querySelectorAll('.trait-item input[type="checkbox"]:checked').forEach(checkbox => {
        selectedTraits.push(checkbox.id);
    });
    return selectedTraits;
}

function getCustomTraits() {
    const customTraits = [];
    document.querySelectorAll('.custom-traits .trait-item span').forEach(span => {
        customTraits.push(span.textContent);
    });
    return customTraits;
}

function getFeedbackText() {
    const feedbackTextarea = document.querySelector('.feedback-section textarea');
    return feedbackTextarea ? feedbackTextarea.value : '';
}

function getExplorationText() {
    const explorationTexts = [];
    document.querySelectorAll('.exploration-questions textarea').forEach(textarea => {
        explorationTexts.push(textarea.value);
    });
    return explorationTexts;
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
    document.getElementById('stepCounter').textContent = `Schritt ${stepNumber} von 4`;
    
    // Save current step
    saveProgress();
}

function updateNavigationButtons(currentStep) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
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
    showNotification('Johari Window erfolgreich abgeschlossen!', 'success');
    
    // Export results
    exportResults(summary);
}

function generateSummary() {
    const selectedTraits = getSelectedTraits();
    const customTraits = getCustomTraits();
    const feedback = getFeedbackText();
    const exploration = getExplorationText();
    
    return {
        selectedTraits: selectedTraits.length,
        customTraits: customTraits,
        feedback: feedback,
        exploration: exploration,
        completedAt: new Date().toISOString()
    };
}

function exportResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'johari-window-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Global functions for workflow navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
