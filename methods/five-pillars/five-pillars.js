// Five Pillars Method Implementation

function initFivePillars() {
    console.log('Initializing Five Pillars method');
    
    // Initialize the workflow
    setupWorkflowNavigation();
    setupPillarSliders();
    setupActivityTracking();
    setupPlanCreation();
    
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

function setupPillarSliders() {
    // Add event listeners for pillar sliders
    document.querySelectorAll('.pillar-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const pillar = this.dataset.pillar;
            const value = this.value;
            
            // Update rating display
            const ratingElement = document.getElementById(`${pillar}-rating`);
            if (ratingElement) {
                ratingElement.textContent = `${value}/10`;
            }
            
            // Update pillar card visual feedback
            updatePillarCardVisual(pillar, value);
            
            // Save progress
            saveProgress();
        });
    });
}

function updatePillarCardVisual(pillar, value) {
    const pillarCard = document.querySelector(`[data-pillar="${pillar}"]`);
    if (!pillarCard) return;
    
    // Remove existing strength classes
    pillarCard.classList.remove('weak', 'moderate', 'strong');
    
    // Add appropriate strength class
    if (value <= 3) {
        pillarCard.classList.add('weak');
    } else if (value <= 7) {
        pillarCard.classList.add('moderate');
    } else {
        pillarCard.classList.add('strong');
    }
}

function setupActivityTracking() {
    // Add event listeners for activity checkboxes
    document.querySelectorAll('.activity-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const activityItem = this.closest('.activity-item');
            if (this.checked) {
                activityItem.style.background = '#e0f2fe';
                activityItem.style.borderColor = '#0ea5e9';
            } else {
                activityItem.style.background = '#f8fafc';
                activityItem.style.borderColor = '#e2e8f0';
            }
            saveProgress();
        });
    });
}

function setupPlanCreation() {
    // Add event listeners for plan inputs
    const planInputs = document.querySelectorAll('#priority-1, #priority-2, #priority-3, #milestone-1, #milestone-2, #milestone-3, #goal-1, #goal-2, #goal-3');
    planInputs.forEach(input => {
        input.addEventListener('input', function() {
            saveProgress();
        });
    });
    
    // Add event listeners for plan checkboxes
    document.querySelectorAll('.plan-section input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveProgress();
        });
    });
}

function saveProgress() {
    const progressData = {
        pillarRatings: getPillarRatings(),
        completedActivities: getCompletedActivities(),
        planData: getPlanData(),
        currentStep: getCurrentStep()
    };
    
    localStorage.setItem('five-pillars-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('five-pillars-progress');
    if (!savedData) return;
    
    try {
        const progressData = JSON.parse(savedData);
        
        // Restore pillar ratings
        if (progressData.pillarRatings) {
            Object.entries(progressData.pillarRatings).forEach(([pillar, rating]) => {
                const slider = document.querySelector(`[data-pillar="${pillar}"]`);
                const ratingElement = document.getElementById(`${pillar}-rating`);
                if (slider && ratingElement) {
                    slider.value = rating;
                    ratingElement.textContent = `${rating}/10`;
                    updatePillarCardVisual(pillar, rating);
                }
            });
        }
        
        // Restore completed activities
        if (progressData.completedActivities) {
            progressData.completedActivities.forEach(activityId => {
                const checkbox = document.getElementById(activityId);
                if (checkbox) {
                    checkbox.checked = true;
                    const activityItem = checkbox.closest('.activity-item');
                    activityItem.style.background = '#e0f2fe';
                    activityItem.style.borderColor = '#0ea5e9';
                }
            });
        }
        
        // Restore plan data
        if (progressData.planData) {
            Object.entries(progressData.planData).forEach(([inputId, value]) => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = value;
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

function getPillarRatings() {
    const ratings = {};
    document.querySelectorAll('.pillar-slider').forEach(slider => {
        ratings[slider.dataset.pillar] = parseInt(slider.value);
    });
    return ratings;
}

function getCompletedActivities() {
    const completed = [];
    document.querySelectorAll('.activity-item input[type="checkbox"]:checked').forEach(checkbox => {
        completed.push(checkbox.id);
    });
    return completed;
}

function getPlanData() {
    const planData = {};
    const planInputs = document.querySelectorAll('#priority-1, #priority-2, #priority-3, #milestone-1, #milestone-2, #milestone-3, #goal-1, #goal-2, #goal-3');
    planInputs.forEach(input => {
        if (input.value.trim()) {
            planData[input.id] = input.value;
        }
    });
    return planData;
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
    document.getElementById('total-steps').textContent = '7';
    
    // Save current step
    saveProgress();
}

function updateNavigationButtons(currentStep) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentStep === 1;
    nextBtn.disabled = currentStep === 7;
    
    if (currentStep === 7) {
        nextBtn.innerHTML = '<i class="fas fa-check"></i> Abschließen';
    } else {
        nextBtn.innerHTML = 'Weiter <i class="fas fa-arrow-right"></i>';
    }
}

function nextStep() {
    const currentStep = getCurrentStep();
    if (currentStep < 7) {
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
    showNotification('Five Pillars erfolgreich abgeschlossen!', 'success');
    
    // Export results
    exportResults(summary);
}

function generateSummary() {
    const pillarRatings = getPillarRatings();
    const completedActivities = getCompletedActivities();
    const planData = getPlanData();
    
    // Calculate overall score
    const totalScore = Object.values(pillarRatings).reduce((sum, rating) => sum + rating, 0);
    const averageScore = totalScore / Object.keys(pillarRatings).length;
    
    // Find strongest and weakest pillars
    const sortedPillars = Object.entries(pillarRatings).sort((a, b) => b[1] - a[1]);
    const strongestPillar = sortedPillars[0];
    const weakestPillar = sortedPillars[sortedPillars.length - 1];
    
    return {
        overallScore: Math.round(averageScore * 10) / 10,
        pillarRatings: pillarRatings,
        strongestPillar: strongestPillar,
        weakestPillar: weakestPillar,
        completedActivities: completedActivities.length,
        planData: planData,
        completedAt: new Date().toISOString()
    };
}

function exportResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'five-pillars-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Global functions for workflow navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
