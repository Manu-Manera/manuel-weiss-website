/**
 * Personal Training Section
 * Trainingspläne und Übungsdatenbank verwalten
 */

class PersonalTrainingSection {
    constructor() {
        this.trainingPlans = [];
        this.exercises = [];
        this.stats = {
            totalExercises: 150,
            generatedPlans: 25,
            activeUsers: 12,
            averageRating: 4.8
        };
    }

    async init() {
        console.log('🏋️ Personal Training Section: Initializing...');
        this.setupEventListeners();
        await this.loadTrainingPlans();
        await this.loadExercises();
        this.renderStats();
        this.renderTrainingPlans();
        this.renderExercises();
    }

    setupEventListeners() {
        // Training Plan Actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="open-plan-editor"]')) {
                this.openPlanEditor(e.target.dataset.param);
            }
            if (e.target.matches('[data-action="open-exercise-editor"]')) {
                this.openExerciseEditor(e.target.dataset.param);
            }
        });
    }

    async loadTrainingPlans() {
        try {
            const storedPlans = localStorage.getItem('training_plans');
            if (storedPlans) {
                this.trainingPlans = JSON.parse(storedPlans);
            } else {
                // Fallback: Standard Trainingspläne
                this.trainingPlans = [
                    {
                        id: 'muscle-beginner',
                        name: 'Muskelaufbau - Anfänger',
                        description: '3x pro Woche, 45 Min, Ganzkörper-Training',
                        exercises: 12,
                        weeks: 4,
                        type: 'muscle-building'
                    },
                    {
                        id: 'weight-loss-advanced',
                        name: 'Gewichtsreduktion - Fortgeschritten',
                        description: '4x pro Woche, 60 Min, Split-Training',
                        exercises: 20,
                        weeks: 6,
                        type: 'weight-loss'
                    },
                    {
                        id: 'bodyweight-beginner',
                        name: 'Bodyweight - Anfänger',
                        description: '3x pro Woche, 30 Min, Körpergewicht',
                        exercises: 8,
                        weeks: 4,
                        type: 'bodyweight'
                    },
                    {
                        id: 'endurance-all',
                        name: 'Ausdauer - Alle Level',
                        description: '5x pro Woche, 45 Min, Cardio-Fokus',
                        exercises: 15,
                        weeks: 8,
                        type: 'endurance'
                    }
                ];
            }
        } catch (error) {
            console.error('❌ Personal Training: Error loading training plans:', error);
        }
    }

    async loadExercises() {
        try {
            const storedExercises = localStorage.getItem('exercise_database');
            if (storedExercises) {
                this.exercises = JSON.parse(storedExercises);
            } else {
                // Fallback: Standard Übungen
                this.exercises = [
                    {
                        category: 'Brust',
                        exercises: [
                            { id: 'bench-press', name: 'Bankdrücken' },
                            { id: 'push-ups', name: 'Liegestütze' },
                            { id: 'incline-bench', name: 'Schrägbankdrücken' }
                        ]
                    },
                    {
                        category: 'Rücken',
                        exercises: [
                            { id: 'pull-ups', name: 'Klimmzüge' },
                            { id: 'rowing', name: 'Rudern' },
                            { id: 'lat-pulldown', name: 'Latziehen' }
                        ]
                    },
                    {
                        category: 'Beine',
                        exercises: [
                            { id: 'squats', name: 'Kniebeugen' },
                            { id: 'lunges', name: 'Ausfallschritte' },
                            { id: 'romanian-deadlift', name: 'Rumänisches Kreuzheben' }
                        ]
                    }
                ];
            }
        } catch (error) {
            console.error('❌ Personal Training: Error loading exercises:', error);
        }
    }

    renderStats() {
        document.getElementById('total-exercises').textContent = this.stats.totalExercises + '+';
        document.getElementById('generated-plans').textContent = this.stats.generatedPlans;
        document.getElementById('active-users').textContent = this.stats.activeUsers;
        document.getElementById('average-rating').textContent = this.stats.averageRating;
    }

    renderTrainingPlans() {
        const plansGrid = document.querySelector('.plans-grid');
        if (!plansGrid) return;

        plansGrid.innerHTML = this.trainingPlans.map(plan => `
            <div class="plan-template-card">
                <div class="plan-header">
                    <h4>${plan.name}</h4>
                    <button class="edit-plan-btn" data-action="open-plan-editor" data-param="${plan.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="plan-content">
                    <p>${plan.description}</p>
                    <div class="plan-stats">
                        <span class="stat">${plan.exercises} Übungen</span>
                        <span class="stat">${plan.weeks} Wochen</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderExercises() {
        const exerciseCategories = document.querySelector('.exercise-categories');
        if (!exerciseCategories) return;

        exerciseCategories.innerHTML = this.exercises.map(category => `
            <div class="category-card">
                <div class="category-header">
                    <h4>${category.category}</h4>
                    <span class="exercise-count">${category.exercises.length} Übungen</span>
                </div>
                <div class="category-exercises">
                    ${category.exercises.map(exercise => `
                        <div class="exercise-item">
                            <span>${exercise.name}</span>
                            <button class="edit-exercise-btn" data-action="open-exercise-editor" data-param="${exercise.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    openPlanEditor(planId) {
        const plan = this.trainingPlans.find(p => p.id === planId);
        if (!plan) return;

        this.showMessage(`Trainingsplan "${plan.name}" wird bearbeitet...`, 'info');
        // Hier würde der Plan-Editor geöffnet werden
    }

    openExerciseEditor(exerciseId) {
        this.showMessage(`Übung "${exerciseId}" wird bearbeitet...`, 'info');
        // Hier würde der Exercise-Editor geöffnet werden
    }

    showMessage(message, type = 'info') {
        // Toast Notification anzeigen
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export für AdminApplication
window.PersonalTrainingSection = PersonalTrainingSection;
