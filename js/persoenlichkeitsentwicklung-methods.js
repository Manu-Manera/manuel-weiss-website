// Persönlichkeitsentwicklung Methods - JavaScript Module

// Method Navigation Functions - Enhanced with error handling
function startMethod(methodId) {
    console.log('startMethod called with:', methodId);
    
    // Direct navigation to specific workflow pages
    const methodUrls = {
        'ikigai': 'persoenlichkeitsentwicklung.html',
        'gallup-strengths': 'methods/gallup-strengths/gallup-strengths.html',
        'via-strengths': 'methods/via-strengths/via-strengths.html',
        'self-assessment': 'methods/self-assessment/self-assessment.html',
        'values-clarification': 'methods/values-clarification/values-clarification.html',
        'strengths-analysis': 'methods/strengths-analysis/strengths-analysis.html',
        'goal-setting': 'methods/goal-setting/goal-setting.html',
        'mindfulness': 'methods/mindfulness/mindfulness.html',
        'emotional-intelligence': 'methods/emotional-intelligence/emotional-intelligence.html',
        'habit-building': 'methods/habit-building/habit-building.html',
        'johari-window': 'methods/johari-window/johari-window.html',
        'nlp-dilts': 'methods/nlp-dilts/nlp-dilts.html',
        'five-pillars': 'methods/five-pillars/five-pillars.html',
        'harvard-method': 'methods/harvard-method/harvard-method.html',
        'moment-excellence': 'methods/moment-excellence/moment-excellence.html',
        'nlp-meta-goal': 'methods/nlp-meta-goal/nlp-meta-goal.html',
        'nonviolent-communication': 'methods/nonviolent-communication/nonviolent-communication.html',
        'resource-analysis': 'methods/resource-analysis/resource-analysis.html',
        'rafael-method': 'methods/rafael-method/rafael-method.html',
        'walt-disney': 'methods/walt-disney/walt-disney.html',
        'aek-communication': 'methods/aek-communication/aek-communication.html',
        'change-stages': 'methods/change-stages/change-stages.html',
        'circular-interview': 'methods/circular-interview/circular-interview.html',
        'communication': 'methods/communication/communication.html',
        'competence-map': 'methods/competence-map/competence-map.html',
        'conflict-escalation': 'methods/conflict-escalation/conflict-escalation.html',
        'rubikon-model': 'methods/rubikon-model/rubikon-model.html',
        'solution-focused': 'methods/solution-focused/solution-focused.html',
        'systemic-coaching': 'methods/systemic-coaching/systemic-coaching.html',
        'target-coaching': 'methods/target-coaching/target-coaching.html'
    };
    
    const url = methodUrls[methodId];
    if (url) {
        console.log('Navigating to:', url);
        window.location.href = url;
    } else {
        console.error(`Method ${methodId} not found`);
        alert('Diese Methode ist noch nicht verfügbar.');
    }
}

// Ensure startMethod is globally available and not overwritten
window.startMethod = startMethod;

// Add event listeners for method buttons as fallback
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - Setting up method event listeners');
    
    // Method 1: Use data-method attribute
    document.querySelectorAll('button[data-method]').forEach(button => {
        const methodId = button.getAttribute('data-method');
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Button clicked for method (data-method):', methodId);
            startMethod(methodId);
        });
    });
    
    // Method 2: Parse onclick attribute
    document.querySelectorAll('button[onclick*="startMethod"]').forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes('startMethod')) {
            // Extract method ID from onclick attribute
            const match = onclickAttr.match(/startMethod\('([^']+)'\)/);
            if (match) {
                const methodId = match[1];
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked for method (onclick):', methodId);
                    startMethod(methodId);
                });
            }
        }
    });
    
    console.log('Method event listeners set up for', document.querySelectorAll('button[data-method], button[onclick*="startMethod"]').length, 'buttons');
});

// Ensure startMethod is available after all scripts load
window.addEventListener('load', function() {
    // Re-ensure startMethod is available
    if (typeof window.startMethod !== 'function') {
        window.startMethod = startMethod;
        console.log('startMethod function restored');
    }
});

// Workflow Navigation Functions
function switchWorkflowStep(stepNumber) {
    // Remove active class from all steps
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Add active class to current step
    const currentStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
    
    // Hide all workflow steps
    document.querySelectorAll('.workflow-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current workflow step
    const currentWorkflowStep = document.querySelector(`.workflow-step[data-step="${stepNumber}"]`);
    if (currentWorkflowStep) {
        currentWorkflowStep.classList.add('active');
    }
    
    // Update progress bar
    updateProgressBar(stepNumber);
    
    // Update navigation buttons
    updateNavigationButtons(stepNumber);
}

function updateProgressBar(stepNumber) {
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
        const totalSteps = document.querySelectorAll('.progress-step').length;
        const percentage = ((stepNumber - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

function updateNavigationButtons(stepNumber) {
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const totalSteps = document.querySelectorAll('.progress-step').length;
    
    if (prevBtn) {
        prevBtn.disabled = stepNumber === 1;
        prevBtn.style.opacity = stepNumber === 1 ? '0.5' : '1';
    }
    
    if (nextBtn) {
        nextBtn.disabled = stepNumber === totalSteps;
        nextBtn.style.opacity = stepNumber === totalSteps ? '0.5' : '1';
    }
}

function showOverview() {
    document.getElementById('methods-overview').style.display = 'block';
    document.getElementById('method-workflow').style.display = 'none';
    document.getElementById('methods-overview').scrollIntoView({ behavior: 'smooth' });
}

// Export functions for global use
window.switchWorkflowStep = switchWorkflowStep;
window.updateProgressBar = updateProgressBar;
window.updateNavigationButtons = updateNavigationButtons;
window.showOverview = showOverview;
