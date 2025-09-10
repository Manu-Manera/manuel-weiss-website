/**
 * Ikigai Planner - Interactive Workflow for Personal Development
 * Handles the 7-step Ikigai discovery process
 */

class IkigaiPlanner {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.userData = {};
        this.init();
    }

    init() {
        this.loadSavedData();
        this.setupEventListeners();
        this.updateProgress();
        this.updateNavigation();
    }

    setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const saveBtn = document.getElementById('save-progress');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousStep());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveProgress());

        // Video links
        document.querySelectorAll('.video-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleVideoClick(e));
        });

        // Auto-save on input changes
        document.querySelectorAll('textarea, input[type="text"], input[type="checkbox"]').forEach(input => {
            input.addEventListener('input', () => this.autoSave());
        });

        // Ikigai quadrant interactions
        document.querySelectorAll('.ikigai-quadrant').forEach(quadrant => {
            quadrant.addEventListener('click', () => this.highlightQuadrant(quadrant));
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.saveCurrentStepData();
            this.currentStep++;
            this.updateProgress();
            this.updateNavigation();
            this.scrollToTop();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.saveCurrentStepData();
            this.currentStep--;
            this.updateProgress();
            this.updateNavigation();
            this.scrollToTop();
        }
    }

    updateProgress() {
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update workflow steps
        document.querySelectorAll('.workflow-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update Ikigai quadrants based on current step
        this.updateIkigaiQuadrants();
    }

    updateIkigaiQuadrants() {
        const quadrants = document.querySelectorAll('.ikigai-quadrant');
        quadrants.forEach(quadrant => {
            quadrant.classList.remove('highlighted');
        });

        // Highlight relevant quadrant based on current step
        if (this.currentStep === 2) {
            document.querySelector('[data-quadrant="passion"]')?.classList.add('highlighted');
        } else if (this.currentStep === 3) {
            document.querySelector('[data-quadrant="mission"]')?.classList.add('highlighted');
        } else if (this.currentStep === 4) {
            document.querySelector('[data-quadrant="profession"]')?.classList.add('highlighted');
        } else if (this.currentStep === 5) {
            document.querySelector('[data-quadrant="vocation"]')?.classList.add('highlighted');
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const saveBtn = document.getElementById('save-progress');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
                if (saveBtn) saveBtn.style.display = 'inline-block';
            } else {
                nextBtn.style.display = 'inline-block';
                if (saveBtn) saveBtn.style.display = 'none';
            }
        }
    }

    saveCurrentStepData() {
        const stepData = {};
        const currentStepElement = document.querySelector(`.workflow-step[data-step="${this.currentStep}"]`);
        
        if (currentStepElement) {
            // Save all textarea and input values
            currentStepElement.querySelectorAll('textarea, input[type="text"]').forEach(input => {
                if (input.id) {
                    stepData[input.id] = input.value;
                }
            });

            // Save checkbox values
            currentStepElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                if (checkbox.value) {
                    stepData[checkbox.value] = checkbox.checked;
                }
            });
        }

        this.userData[`step${this.currentStep}`] = stepData;
    }

    autoSave() {
        this.saveCurrentStepData();
        this.saveToLocalStorage();
    }

    saveProgress() {
        this.saveCurrentStepData();
        this.saveToLocalStorage();
        this.showSaveNotification();
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('ikigaiProgress', JSON.stringify({
                currentStep: this.currentStep,
                userData: this.userData,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error saving Ikigai progress:', error);
        }
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('ikigaiProgress');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentStep = data.currentStep || 1;
                this.userData = data.userData || {};
                this.populateFormData();
            }
        } catch (error) {
            console.error('Error loading Ikigai progress:', error);
        }
    }

    populateFormData() {
        Object.keys(this.userData).forEach(stepKey => {
            const stepData = this.userData[stepKey];
            Object.keys(stepData).forEach(fieldKey => {
                const element = document.getElementById(fieldKey);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = stepData[fieldKey];
                    } else {
                        element.value = stepData[fieldKey];
                    }
                }
            });
        });
    }

    handleVideoClick(e) {
        e.preventDefault();
        const videoType = e.target.getAttribute('data-video');
        this.showVideoModal(videoType);
    }

    showVideoModal(videoType) {
        // Create modal for video content
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3>Video-Tutorial</h3>
                    <button class="video-modal-close">&times;</button>
                </div>
                <div class="video-modal-body">
                    <div class="video-placeholder">
                        <i class="fab fa-youtube"></i>
                        <p>Video-Tutorial für: ${this.getVideoTitle(videoType)}</p>
                        <p class="video-description">${this.getVideoDescription(videoType)}</p>
                        <div class="video-actions">
                            <button class="btn btn-primary" onclick="window.open('${this.getVideoUrl(videoType)}', '_blank')">
                                Video auf YouTube ansehen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .video-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .video-modal-content {
                background: white;
                border-radius: 1rem;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .video-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e2e8f0;
            }
            .video-modal-header h3 {
                margin: 0;
                color: #1e293b;
            }
            .video-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #64748b;
            }
            .video-modal-body {
                padding: 2rem;
            }
            .video-placeholder {
                text-align: center;
                padding: 2rem;
            }
            .video-placeholder i {
                font-size: 3rem;
                color: #ef4444;
                margin-bottom: 1rem;
            }
            .video-placeholder p {
                color: #64748b;
                margin-bottom: 1rem;
            }
            .video-description {
                font-size: 0.875rem;
                color: #9ca3af;
            }
            .video-actions {
                margin-top: 1.5rem;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.video-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    getVideoTitle(videoType) {
        const titles = {
            'ikigai-basics': 'Ikigai Grundlagen',
            'self-reflection': 'Selbstreflexion Techniken',
            'goal-setting': 'Lebensziele setzen',
            'daily-ikigai': 'Ikigai im Alltag',
            'discover-passions': 'Leidenschaften entdecken',
            'find-mission': 'Sinn und Mission finden',
            'professional-strengths': 'Berufliche Stärken',
            'discover-strengths': 'Stärken entdecken',
            'synthesize-ikigai': 'Ikigai synthetisieren'
        };
        return titles[videoType] || 'Video-Tutorial';
    }

    getVideoDescription(videoType) {
        const descriptions = {
            'ikigai-basics': 'Lerne die Grundlagen der japanischen Ikigai-Philosophie kennen.',
            'self-reflection': 'Entdecke Techniken zur tiefen Selbstreflexion und Selbsterkenntnis.',
            'goal-setting': 'Lerne, wie du deine Lebensziele strukturiert und effektiv setzt.',
            'daily-ikigai': 'Erfahre, wie du dein Ikigai in den Alltag integrierst.',
            'discover-passions': 'Techniken zur Identifikation deiner wahren Leidenschaften.',
            'find-mission': 'Wie du deine persönliche Mission und deinen Lebenssinn findest.',
            'professional-strengths': 'Systematische Analyse deiner beruflichen Stärken.',
            'discover-strengths': 'Methoden zur Entdeckung deiner natürlichen Talente.',
            'synthesize-ikigai': 'Wie du alle Bereiche zu einem kohärenten Ikigai verbindest.'
        };
        return descriptions[videoType] || 'Ein hilfreiches Video-Tutorial für deine Ikigai-Reise.';
    }

    getVideoUrl(videoType) {
        // Placeholder URLs - in a real implementation, these would be actual YouTube URLs
        const urls = {
            'ikigai-basics': 'https://youtube.com/watch?v=ikigai-basics',
            'self-reflection': 'https://youtube.com/watch?v=self-reflection',
            'goal-setting': 'https://youtube.com/watch?v=goal-setting',
            'daily-ikigai': 'https://youtube.com/watch?v=daily-ikigai',
            'discover-passions': 'https://youtube.com/watch?v=discover-passions',
            'find-mission': 'https://youtube.com/watch?v=find-mission',
            'professional-strengths': 'https://youtube.com/watch?v=professional-strengths',
            'discover-strengths': 'https://youtube.com/watch?v=discover-strengths',
            'synthesize-ikigai': 'https://youtube.com/watch?v=synthesize-ikigai'
        };
        return urls[videoType] || 'https://youtube.com';
    }

    highlightQuadrant(quadrant) {
        // Remove highlight from all quadrants
        document.querySelectorAll('.ikigai-quadrant').forEach(q => {
            q.classList.remove('highlighted');
        });
        
        // Add highlight to clicked quadrant
        quadrant.classList.add('highlighted');
        
        // Add CSS for highlight effect
        if (!document.getElementById('quadrant-highlight-style')) {
            const style = document.createElement('style');
            style.id = 'quadrant-highlight-style';
            style.textContent = `
                .ikigai-quadrant.highlighted {
                    background: rgba(255, 255, 255, 0.3) !important;
                    transform: scale(1.1) !important;
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    showSaveNotification() {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.innerHTML = `
            <div class="save-notification-content">
                <i class="fas fa-check-circle"></i>
                <span>Fortschritt gespeichert!</span>
            </div>
        `;

        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .save-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            }
            .save-notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }
        }, 3000);
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Method to generate Ikigai summary
    generateIkigaiSummary() {
        const summary = {
            passion: this.userData.step2 || {},
            mission: this.userData.step3 || {},
            profession: this.userData.step4 || {},
            vocation: this.userData.step5 || {},
            synthesis: this.userData.step6 || {},
            actionPlan: this.userData.step7 || {}
        };
        return summary;
    }

    // Method to export Ikigai data
    exportIkigaiData() {
        const summary = this.generateIkigaiSummary();
        const dataStr = JSON.stringify(summary, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ikigai-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize Ikigai Planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IkigaiPlanner();
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add intersection observer for progress animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.exercise-card, .video-card, .element').forEach(el => {
        observer.observe(el);
    });
});

// Add CSS for animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    .exercise-card,
    .video-card,
    .element {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .exercise-card.animate-in,
    .video-card.animate-in,
    .element.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(animationStyle);
