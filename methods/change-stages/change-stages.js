// Change Stages Method Implementation
function initChangeStages() {
    console.log('Initializing Change Stages method');
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
    localStorage.setItem('change-stages-progress', JSON.stringify(progressData));
    showNotification('Fortschritt gespeichert!', 'success');
}

function loadSavedData() {
    const savedData = localStorage.getItem('change-stages-progress');
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
    document.getElementById('total-steps').textContent = '5';
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
        completeChangeStagesMethod();
    }
}

function previousStep() {
    const currentStep = getCurrentStep();
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

function completeChangeStagesMethod() {
    const summary = generateChangeStagesSummary();
    showNotification('Change Stages erfolgreich abgeschlossen!', 'success');
    exportChangeStagesResults(summary);
}

function generateChangeStagesSummary() {
    const formData = getFormData();
    const summary = {
        method: 'Change Stages',
        formData: formData,
        completedAt: new Date().toISOString(),
        stageInsights: {
            precontemplation: extractPrecontemplationInsights(formData),
            contemplation: extractContemplationInsights(formData),
            preparation: extractPreparationInsights(formData),
            action: extractActionInsights(formData),
            maintenance: extractMaintenanceInsights(formData)
        }
    };
    return summary;
}

function extractPrecontemplationInsights(formData) {
    const insights = [];
    if (formData['target-behavior']) insights.push('Zielverhalten definiert');
    if (formData['impact-life']) insights.push('Lebensauswirkungen erkannt');
    if (formData['consequences-no-change']) insights.push('Konsequenzen analysiert');
    if (formData['warning-signs']) insights.push('Warnsignale identifiziert');
    if (formData['factor-denial']) insights.push('Verleugnung erkannt');
    if (formData['factor-rationalization']) insights.push('Rationalisierung identifiziert');
    if (formData['factor-fear']) insights.push('Angst vor Veränderung erkannt');
    if (formData['factor-lack-awareness']) insights.push('Mangelndes Bewusstsein identifiziert');
    return insights;
}

function extractContemplationInsights(formData) {
    const insights = [];
    if (formData['ambivalence']) insights.push('Ambivalenz erkannt');
    if (formData['pro-health']) insights.push('Gesundheitsvorteile erkannt');
    if (formData['pro-relationships']) insights.push('Beziehungsvorteile erkannt');
    if (formData['pro-career']) insights.push('Karrierevorteile erkannt');
    if (formData['pro-self-esteem']) insights.push('Selbstwertvorteile erkannt');
    if (formData['cons-effort']) insights.push('Aufwand erkannt');
    if (formData['cons-comfort']) insights.push('Komfortzonenverlust erkannt');
    if (formData['cons-time']) insights.push('Zeitaufwand erkannt');
    if (formData['cons-uncertainty']) insights.push('Unsicherheit erkannt');
    return insights;
}

function extractPreparationInsights(formData) {
    const insights = [];
    if (formData['change-plan']) insights.push('Aktionsplan erstellt');
    if (formData['element-goals']) insights.push('Ziele definiert');
    if (formData['element-strategies']) insights.push('Strategien entwickelt');
    if (formData['element-support']) insights.push('Unterstützung organisiert');
    if (formData['element-resources']) insights.push('Ressourcen gesichert');
    return insights;
}

function extractActionInsights(formData) {
    const insights = [];
    if (formData['action-steps']) insights.push('Handlungsschritte definiert');
    if (formData['strategy-replacement']) insights.push('Verhaltensersatz gewählt');
    if (formData['strategy-environment']) insights.push('Umgebungsänderung geplant');
    if (formData['strategy-rewards']) insights.push('Belohnungssystem etabliert');
    if (formData['strategy-monitoring']) insights.push('Selbstüberwachung implementiert');
    return insights;
}

function extractMaintenanceInsights(formData) {
    const insights = [];
    if (formData['maintenance-strategies']) insights.push('Aufrechterhaltungsstrategien entwickelt');
    if (formData['element-routine']) insights.push('Routine etabliert');
    if (formData['element-triggers']) insights.push('Auslöser kontrolliert');
    if (formData['element-support']) insights.push('Unterstützung erhalten');
    if (formData['element-motivation']) insights.push('Motivation aufrechterhalten');
    return insights;
}

function exportChangeStagesResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'change-stages-results.json';
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
    initChangeStages();
});

// Global functions for navigation
window.nextStep = nextStep;
window.previousStep = previousStep;
window.goToStep = goToStep;
