/**
 * Training Dashboard - Fortschritts-Tracking und Statistiken
 */

class TrainingDashboard {
    constructor() {
        this.userId = null;
        this.trainingData = null;
        this.init();
    }

    async init() {
        // Warte auf Auth-System
        await this.waitForAuth();
        
        // Prüfe ob Benutzer angemeldet ist
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn()) {
            // Weiterleitung zur Login-Seite oder Trainingsplan-Erstellung
            this.showLoginPrompt();
            return;
        }

        // Lade Benutzer-ID
        const user = window.realUserAuth.getCurrentUser();
        if (user) {
            this.userId = user.id || user.userId || user.email;
        }

        // Lade Trainingsdaten
        await this.loadTrainingData();
        
        // Rendere Dashboard
        this.renderDashboard();
    }

    async waitForAuth() {
        let retries = 0;
        while ((!window.realUserAuth || !window.realUserAuth.isLoggedIn) && retries < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
    }

    showLoginPrompt() {
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                    <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #1e293b;">Anmeldung erforderlich</h1>
                    <p style="color: #64748b; margin-bottom: 2rem; font-size: 1.125rem;">
                        Bitte melde dich an, um dein Trainings-Dashboard zu sehen.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="window.realUserAuth?.showLoginModal()" class="btn btn-primary" style="padding: 0.75rem 1.5rem; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-sign-in-alt"></i> Anmelden
                        </button>
                        <a href="personal-training.html" class="btn btn-secondary" style="padding: 0.75rem 1.5rem; border-radius: 8px; background: white; color: #667eea; border: 2px solid #667eea; text-decoration: none; font-weight: 500;">
                            <i class="fas fa-dumbbell"></i> Trainingsplan erstellen
                        </a>
                    </div>
                </div>
            `;
        }
    }

    async loadTrainingData() {
        try {
            // Versuche von AWS zu laden
            if (window.awsProfileAPI && this.userId) {
                const profile = await window.awsProfileAPI.getProfile(this.userId);
                if (profile && profile.trainingData) {
                    this.trainingData = profile.trainingData;
                    return;
                }
            }

            // Fallback: localStorage
            const stored = localStorage.getItem(`trainingData_${this.userId}`);
            if (stored) {
                this.trainingData = JSON.parse(stored);
            } else {
                this.trainingData = {
                    plans: [],
                    workouts: [],
                    exerciseProgress: {},
                    stats: {
                        totalWorkouts: 0,
                        workoutsThisWeek: 0,
                        lastWorkout: null,
                        streak: 0
                    }
                };
            }
        } catch (error) {
            console.error('Fehler beim Laden der Trainingsdaten:', error);
            this.trainingData = {
                plans: [],
                workouts: [],
                exerciseProgress: {},
                stats: {
                    totalWorkouts: 0,
                    workoutsThisWeek: 0,
                    lastWorkout: null,
                    streak: 0
                }
            };
        }
    }

    async saveTrainingData() {
        try {
            // Speichere in AWS
            if (window.awsProfileAPI && this.userId) {
                const profile = await window.awsProfileAPI.getProfile(this.userId);
                if (profile) {
                    profile.trainingData = this.trainingData;
                    await window.awsProfileAPI.saveProfile(profile);
                }
            }

            // Fallback: localStorage
            localStorage.setItem(`trainingData_${this.userId}`, JSON.stringify(this.trainingData));
        } catch (error) {
            console.error('Fehler beim Speichern der Trainingsdaten:', error);
            // Fallback: localStorage
            localStorage.setItem(`trainingData_${this.userId}`, JSON.stringify(this.trainingData));
        }
    }

    renderDashboard() {
        this.updateStats();
        this.renderTrainingPlan();
        this.renderRecentWorkouts();
        this.renderExerciseProgress();
    }

    updateStats() {
        const stats = this.calculateStats();
        
        // Total Workouts
        const totalWorkoutsEl = document.getElementById('total-workouts');
        if (totalWorkoutsEl) totalWorkoutsEl.textContent = stats.totalWorkouts;
        
        // Workouts this week
        const workoutsThisWeekEl = document.getElementById('workouts-this-week');
        if (workoutsThisWeekEl) workoutsThisWeekEl.textContent = stats.workoutsThisWeek;
        
        // Last workout
        const lastWorkoutEl = document.getElementById('last-workout');
        if (lastWorkoutEl) {
            if (stats.lastWorkout) {
                const date = new Date(stats.lastWorkout);
                lastWorkoutEl.textContent = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
            } else {
                lastWorkoutEl.textContent = '-';
            }
        }
        
        // Days since
        const daysSinceEl = document.getElementById('days-since');
        if (daysSinceEl) {
            if (stats.lastWorkout) {
                const days = Math.floor((Date.now() - new Date(stats.lastWorkout).getTime()) / (1000 * 60 * 60 * 24));
                daysSinceEl.textContent = `Vor ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
            } else {
                daysSinceEl.textContent = 'Noch nie';
            }
        }
        
        // Streak
        const streakEl = document.getElementById('streak');
        if (streakEl) streakEl.textContent = stats.streak;
        
        // Workouts change
        const workoutsChangeEl = document.getElementById('workouts-change');
        if (workoutsChangeEl) {
            workoutsChangeEl.textContent = `+${stats.workoutsThisWeek} diese Woche`;
        }
        
        // Week progress
        const weekProgressEl = document.getElementById('week-progress');
        if (weekProgressEl) {
            const goal = this.trainingData.currentPlan?.frequency || 3;
            const progress = Math.round((stats.workoutsThisWeek / goal) * 100);
            weekProgressEl.textContent = `${progress}% des Ziels`;
        }
    }

    calculateStats() {
        const workouts = this.trainingData.workouts || [];
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        
        const workoutsThisWeek = workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= weekStart;
        }).length;
        
        const lastWorkout = workouts.length > 0 ? workouts[workouts.length - 1].date : null;
        
        // Calculate streak
        let streak = 0;
        if (workouts.length > 0) {
            const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            for (const workout of sortedWorkouts) {
                const workoutDate = new Date(workout.date);
                workoutDate.setHours(0, 0, 0, 0);
                
                const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === streak) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else if (daysDiff > streak) {
                    break;
                }
            }
        }
        
        return {
            totalWorkouts: workouts.length,
            workoutsThisWeek,
            lastWorkout,
            streak
        };
    }

    renderTrainingPlan() {
        const container = document.getElementById('training-plan-container');
        if (!container) return;
        
        const currentPlan = this.trainingData.currentPlan;
        
        if (!currentPlan) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>Noch kein Trainingsplan</h3>
                    <p>Erstelle deinen ersten personalisierten Trainingsplan</p>
                    <a href="personal-training.html" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        Trainingsplan erstellen
                    </a>
                </div>
            `;
            return;
        }
        
        const completedSessions = this.trainingData.workouts?.length || 0;
        const totalSessions = currentPlan.weeks?.reduce((sum, week) => sum + (week.sessions?.length || 0), 0) || 0;
        const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        
        container.innerHTML = `
            <div class="plan-card">
                <div class="plan-card-header">
                    <div>
                        <div class="plan-card-title">${currentPlan.title || 'Mein Trainingsplan'}</div>
                        <div class="plan-card-meta">${currentPlan.goals?.join(', ') || 'Allgemeine Fitness'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.875rem; opacity: 0.8;">Fortschritt</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${progress}%</div>
                    </div>
                </div>
                <div class="plan-card-stats">
                    <div class="plan-stat">
                        <div class="plan-stat-value">${currentPlan.weeks?.length || 4}</div>
                        <div class="plan-stat-label">Wochen</div>
                    </div>
                    <div class="plan-stat">
                        <div class="plan-stat-value">${currentPlan.frequency || 3}x</div>
                        <div class="plan-stat-label">Pro Woche</div>
                    </div>
                    <div class="plan-stat">
                        <div class="plan-stat-value">${currentPlan.timePerSession || 45}</div>
                        <div class="plan-stat-label">Min/Session</div>
                    </div>
                    <div class="plan-stat">
                        <div class="plan-stat-value">${completedSessions}/${totalSessions}</div>
                        <div class="plan-stat-label">Sessions</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <a href="personal-training.html?plan=${currentPlan.id}" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                    <i class="fas fa-eye"></i>
                    Trainingsplan ansehen
                </a>
            </div>
        `;
    }

    renderRecentWorkouts() {
        const container = document.getElementById('recent-workouts-container');
        if (!container) return;
        
        const workouts = (this.trainingData.workouts || []).slice(-5).reverse();
        
        if (workouts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💪</div>
                    <h3>Noch keine Trainings</h3>
                    <p>Beginne mit deinem ersten Training</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = workouts.map(workout => {
            const date = new Date(workout.date);
            const duration = workout.duration || '45';
            const exercises = workout.exercises?.length || 0;
            
            return `
                <div class="workout-item">
                    <div class="workout-info">
                        <div class="workout-icon">
                            <i class="fas fa-dumbbell"></i>
                        </div>
                        <div class="workout-details">
                            <h4>${workout.type || 'Training'}</h4>
                            <p>${date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} • ${duration} Min • ${exercises} Übungen</p>
                        </div>
                    </div>
                    <div class="workout-status completed">
                        <i class="fas fa-check"></i> Abgeschlossen
                    </div>
                </div>
            `;
        }).join('');
    }

    renderExerciseProgress() {
        const container = document.getElementById('exercise-progress-container');
        if (!container) return;
        
        const progress = this.trainingData.exerciseProgress || {};
        const exercises = Object.keys(progress);
        
        if (exercises.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3>Noch keine Daten</h3>
                    <p>Führe Trainings durch, um deinen Fortschritt zu sehen</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = exercises.map(exerciseName => {
            const exerciseData = progress[exerciseName];
            const currentWeight = exerciseData.currentWeight || 0;
            const targetWeight = exerciseData.targetWeight || 0;
            const progressPercent = targetWeight > 0 ? Math.round((currentWeight / targetWeight) * 100) : 0;
            
            return `
                <div class="exercise-item">
                    <div class="exercise-header">
                        <span class="exercise-name">${exerciseName}</span>
                        <span style="font-size: 0.875rem; color: #64748b;">${currentWeight}kg / ${targetWeight}kg</span>
                    </div>
                    <div class="exercise-progress-bar">
                        <div class="exercise-progress-fill" style="width: ${Math.min(progressPercent, 100)}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Global function to log workout
async function logWorkout() {
    if (!window.trainingDashboard) {
        alert('Dashboard nicht initialisiert');
        return;
    }
    
    const workout = {
        date: new Date().toISOString(),
        type: 'Training',
        duration: 45,
        exercises: []
    };
    
    if (!window.trainingDashboard.trainingData.workouts) {
        window.trainingDashboard.trainingData.workouts = [];
    }
    
    window.trainingDashboard.trainingData.workouts.push(workout);
    await window.trainingDashboard.saveTrainingData();
    window.trainingDashboard.renderDashboard();
    
    alert('Training wurde gespeichert!');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.trainingDashboard = new TrainingDashboard();
});

