// AEK Communication Method Implementation
function initAEKCommunication() {
    console.log('Initializing AEK Communication method');
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
    localStorage.setItem('aek-communication-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('aek-communication-progress');
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
        completeAEKMethod();
    }
}

function previousStep() {
    const currentStep = getCurrentStep();
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function completeAEKMethod() {
    const summary = generateAEKSummary();
    showNotification('AEK-Communication erfolgreich abgeschlossen!', 'success');
    exportAEKResults(summary);
}

function generateAEKSummary() {
    const formData = getFormData();
    const summary = {
        method: 'AEK-Communication',
        formData: formData,
        completedAt: new Date().toISOString(),
        insights: {
            assertive: extractAssertiveInsights(formData),
            empathetic: extractEmpatheticInsights(formData),
            kind: extractKindInsights(formData),
            integration: extractIntegrationInsights(formData)
        }
    };
    return summary;
}

function extractAssertiveInsights(formData) {
    const insights = [];
    if (formData['assertive-message']) insights.push('Assertive Botschaft formuliert');
    if (formData['principle-direct']) insights.push('Direkte Kommunikation gewählt');
    if (formData['principle-respectful']) insights.push('Respektvolle Kommunikation');
    if (formData['principle-honest']) insights.push('Ehrliche Kommunikation');
    if (formData['principle-boundaries']) insights.push('Grenzen gesetzt');
    return insights;
}

function extractEmpatheticInsights(formData) {
    const insights = [];
    if (formData['empathetic-target']) insights.push('Empathisches Ziel definiert');
    if (formData['skill-active-listening']) insights.push('Aktives Zuhören geübt');
    if (formData['skill-perspective-taking']) insights.push('Perspektivenwechsel praktiziert');
    if (formData['skill-emotional-recognition']) insights.push('Emotionale Erkennung trainiert');
    if (formData['skill-validation']) insights.push('Validierung geübt');
    return insights;
}

function extractKindInsights(formData) {
    const insights = [];
    if (formData['kind-message']) insights.push('Kreative Kommunikation entwickelt');
    if (formData['element-playfulness']) insights.push('Spielerischer Ansatz gewählt');
    if (formData['element-creativity']) insights.push('Kreativität eingesetzt');
    if (formData['element-authenticity']) insights.push('Authentizität betont');
    if (formData['element-curiosity']) insights.push('Neugier entwickelt');
    return insights;
}

function extractIntegrationInsights(formData) {
    const insights = [];
    if (formData['integration-situation']) insights.push('Integrationssituation definiert');
    if (formData['strategy-balanced']) insights.push('Ausgewogene Strategie gewählt');
    if (formData['strategy-adaptive']) insights.push('Anpassungsfähige Strategie');
    if (formData['strategy-contextual']) insights.push('Kontextbezogene Strategie');
    if (formData['strategy-flexible']) insights.push('Flexible Strategie');
    return insights;
}

function exportAEKResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aek-communication-results.json';
    link.click();
    URL.revokeObjectURL(url);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-weight: 500;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAEKCommunication();
});

// Global functions for navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
