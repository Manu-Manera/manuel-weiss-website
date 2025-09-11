// User Dashboard System
class UserDashboard {
    constructor() {
        this.currentUser = null;
        this.progressData = {};
        this.init();
    }

    init() {
        this.currentUser = window.userAuth ? window.userAuth.getCurrentUser() : null;
        if (this.currentUser) {
            this.loadProgressData();
            this.setupEventListeners();
            this.renderDashboard();
        }
    }

    setupEventListeners() {
        // Dashboard navigation
        document.querySelectorAll('.dashboard-nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchDashboardTab(e));
        });

        // Progress tracking
        document.addEventListener('methodProgressUpdate', (e) => {
            this.updateProgress(e.detail.methodId, e.detail.step, e.detail.data);
        });

        // Method completion
        document.addEventListener('methodCompleted', (e) => {
            this.markMethodCompleted(e.detail.methodId);
        });
    }

    renderDashboard() {
        this.renderOverview();
        this.renderProgress();
        this.renderCompletedMethods();
        this.renderGoals();
        this.renderStatistics();
    }

    renderOverview() {
        const overviewSection = document.getElementById('overviewSection');
        if (!overviewSection) return;

        const completedCount = this.getCompletedMethodsCount();
        const inProgressCount = this.getInProgressMethodsCount();
        const totalMethods = this.getTotalMethodsCount();
        const streakDays = this.getCurrentStreak();

        overviewSection.innerHTML = `
            <div class="overview-cards">
                <div class="overview-card">
                    <div class="card-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="card-content">
                        <h3>${completedCount}</h3>
                        <p>Abgeschlossene Methoden</p>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-icon">
                        <i class="fas fa-play-circle"></i>
                    </div>
                    <div class="card-content">
                        <h3>${inProgressCount}</h3>
                        <p>In Bearbeitung</p>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-icon">
                        <i class="fas fa-fire"></i>
                    </div>
                    <div class="card-content">
                        <h3>${streakDays}</h3>
                        <p>Tage am Stück</p>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="card-content">
                        <h3>${Math.round((completedCount / totalMethods) * 100)}%</h3>
                        <p>Fortschritt</p>
                    </div>
                </div>
            </div>
            
            <div class="welcome-section">
                <h2>Willkommen zurück, ${this.currentUser.firstName}!</h2>
                <p>Du hast bereits ${completedCount} von ${totalMethods} Methoden abgeschlossen. Weiter so!</p>
                
                <div class="quick-actions">
                    <button class="btn btn-primary" onclick="this.continueLastMethod()">
                        <i class="fas fa-play"></i> Letzte Methode fortsetzen
                    </button>
                    <button class="btn btn-outline" onclick="this.startNewMethod()">
                        <i class="fas fa-plus"></i> Neue Methode starten
                    </button>
                </div>
            </div>
        `;
    }

    renderProgress() {
        const progressSection = document.getElementById('progressSection');
        if (!progressSection) return;

        const inProgressMethods = this.getInProgressMethods();
        
        if (inProgressMethods.length === 0) {
            progressSection.innerHTML = `
                <div class="no-progress">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Noch keine Methoden in Bearbeitung</h3>
                    <p>Starte deine erste Methode, um deinen Fortschritt hier zu verfolgen.</p>
                    <button class="btn btn-primary" onclick="this.startNewMethod()">
                        <i class="fas fa-plus"></i> Methode starten
                    </button>
                </div>
            `;
            return;
        }

        progressSection.innerHTML = `
            <div class="progress-methods">
                ${inProgressMethods.map(method => this.renderProgressMethod(method)).join('')}
            </div>
        `;
    }

    renderProgressMethod(method) {
        const progress = this.getMethodProgress(method.id);
        const progressPercentage = this.calculateProgressPercentage(progress);
        const lastActivity = this.getLastActivity(method.id);

        return `
            <div class="progress-method-card" data-method="${method.id}">
                <div class="method-header">
                    <div class="method-icon">
                        <i class="${method.icon}"></i>
                    </div>
                    <div class="method-info">
                        <h4>${method.title}</h4>
                        <p>${method.description}</p>
                    </div>
                    <div class="method-actions">
                        <button class="btn btn-sm btn-primary" onclick="this.continueMethod('${method.id}')">
                            <i class="fas fa-play"></i> Fortsetzen
                        </button>
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                
                <div class="progress-info">
                    <span class="progress-percentage">${progressPercentage}%</span>
                    <span class="last-activity">Zuletzt: ${lastActivity}</span>
                </div>
            </div>
        `;
    }

    renderCompletedMethods() {
        const completedSection = document.getElementById('completedSection');
        if (!completedSection) return;

        const completedMethods = this.getCompletedMethods();
        
        if (completedMethods.length === 0) {
            completedSection.innerHTML = `
                <div class="no-completed">
                    <i class="fas fa-trophy"></i>
                    <h3>Noch keine Methoden abgeschlossen</h3>
                    <p>Arbeite an deinen ersten Methoden, um sie hier zu sehen.</p>
                </div>
            `;
            return;
        }

        completedSection.innerHTML = `
            <div class="completed-methods">
                ${completedMethods.map(method => this.renderCompletedMethod(method)).join('')}
            </div>
        `;
    }

    renderCompletedMethod(method) {
        const completedAt = new Date(method.completedAt).toLocaleDateString('de-DE');
        
        return `
            <div class="completed-method-card">
                <div class="method-icon">
                    <i class="${method.icon}"></i>
                </div>
                <div class="method-info">
                    <h4>${method.title}</h4>
                    <p>Abgeschlossen am ${completedAt}</p>
                </div>
                <div class="method-actions">
                    <button class="btn btn-sm btn-outline" onclick="this.reviewMethod('${method.methodId}')">
                        <i class="fas fa-eye"></i> Ansehen
                    </button>
                </div>
            </div>
        `;
    }

    renderGoals() {
        const goalsSection = document.getElementById('goalsSection');
        if (!goalsSection) return;

        const currentGoals = this.currentUser.profile.currentGoals || [];
        
        goalsSection.innerHTML = `
            <div class="goals-header">
                <h3>Deine Ziele</h3>
                <button class="btn btn-sm btn-primary" onclick="this.addGoal()">
                    <i class="fas fa-plus"></i> Ziel hinzufügen
                </button>
            </div>
            
            <div class="goals-list">
                ${currentGoals.length === 0 ? 
                    '<div class="no-goals"><p>Noch keine Ziele gesetzt. Füge dein erstes Ziel hinzu!</p></div>' :
                    currentGoals.map(goal => this.renderGoal(goal)).join('')
                }
            </div>
        `;
    }

    renderGoal(goal) {
        const progress = goal.progress || 0;
        const dueDate = goal.dueDate ? new Date(goal.dueDate).toLocaleDateString('de-DE') : 'Kein Datum';
        
        return `
            <div class="goal-card" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <h4>${goal.title}</h4>
                    <div class="goal-actions">
                        <button class="btn btn-sm btn-outline" onclick="this.editGoal('${goal.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="this.deleteGoal('${goal.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <p class="goal-description">${goal.description}</p>
                
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}%</span>
                </div>
                
                <div class="goal-meta">
                    <span class="due-date">Fällig: ${dueDate}</span>
                    <span class="goal-category">${goal.category}</span>
                </div>
            </div>
        `;
    }

    renderStatistics() {
        const statisticsSection = document.getElementById('statisticsSection');
        if (!statisticsSection) return;

        const stats = this.calculateStatistics();
        
        statisticsSection.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Zeit investiert</h4>
                    <div class="stat-value">${stats.totalTimeSpent}h</div>
                    <p>Gesamtzeit für alle Methoden</p>
                </div>
                
                <div class="stat-card">
                    <h4>Durchschnittliche Bewertung</h4>
                    <div class="stat-value">${stats.averageRating}/5</div>
                    <p>Deine Zufriedenheit mit den Methoden</p>
                </div>
                
                <div class="stat-card">
                    <h4>Beliebteste Kategorie</h4>
                    <div class="stat-value">${stats.favoriteCategory}</div>
                    <p>Meist genutzte Methoden-Kategorie</p>
                </div>
                
                <div class="stat-card">
                    <h4>Längste Serie</h4>
                    <div class="stat-value">${stats.longestStreak} Tage</div>
                    <p>Längste ununterbrochene Nutzung</p>
                </div>
            </div>
            
            <div class="activity-chart">
                <h4>Aktivität der letzten 30 Tage</h4>
                <canvas id="activityChart" width="400" height="200"></canvas>
            </div>
        `;

        // Initialize chart if Chart.js is available
        if (window.Chart) {
            this.initializeActivityChart();
        }
    }

    switchDashboardTab(e) {
        e.preventDefault();
        const tabName = e.target.getAttribute('data-tab');
        
        // Update active tab
        document.querySelectorAll('.dashboard-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Show corresponding section
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const targetSection = document.getElementById(tabName + 'Section');
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    loadProgressData() {
        if (window.userAuth) {
            this.progressData = window.userAuth.getUserProgress();
        }
    }

    updateProgress(methodId, step, data) {
        if (window.userAuth) {
            window.userAuth.updateUserProgress(methodId, step, data);
            this.loadProgressData();
            this.renderProgress();
        }
    }

    markMethodCompleted(methodId) {
        if (window.userAuth) {
            window.userAuth.markMethodCompleted(methodId);
            this.renderOverview();
            this.renderCompletedMethods();
        }
    }

    getCompletedMethodsCount() {
        return this.currentUser.profile.completedMethods ? this.currentUser.profile.completedMethods.length : 0;
    }

    getInProgressMethodsCount() {
        const allMethods = this.getAllMethods();
        return allMethods.filter(method => {
            const progress = this.getMethodProgress(method.id);
            return Object.keys(progress).length > 0 && !this.isMethodCompleted(method.id);
        }).length;
    }

    getTotalMethodsCount() {
        return this.getAllMethods().length;
    }

    getCurrentStreak() {
        // Calculate current streak based on activity
        const activities = this.getActivityData();
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (activities[dateStr]) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    }

    getInProgressMethods() {
        const allMethods = this.getAllMethods();
        return allMethods.filter(method => {
            const progress = this.getMethodProgress(method.id);
            return Object.keys(progress).length > 0 && !this.isMethodCompleted(method.id);
        });
    }

    getCompletedMethods() {
        const completedIds = this.currentUser.profile.completedMethods || [];
        const allMethods = this.getAllMethods();
        
        return completedIds.map(completed => {
            const method = allMethods.find(m => m.id === completed.methodId);
            return method ? {
                ...method,
                completedAt: completed.completedAt
            } : null;
        }).filter(Boolean);
    }

    getMethodProgress(methodId) {
        return this.progressData[methodId] || {};
    }

    calculateProgressPercentage(progress) {
        const steps = Object.keys(progress).length;
        const totalSteps = 7; // Assuming 7 steps per method
        return Math.round((steps / totalSteps) * 100);
    }

    getLastActivity(methodId) {
        const progress = this.getMethodProgress(methodId);
        const steps = Object.values(progress);
        
        if (steps.length === 0) return 'Nie';
        
        const lastStep = steps.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
        const date = new Date(lastStep.completedAt);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Heute';
        if (diffDays === 1) return 'Gestern';
        if (diffDays < 7) return `vor ${diffDays} Tagen`;
        return date.toLocaleDateString('de-DE');
    }

    isMethodCompleted(methodId) {
        const completedMethods = this.currentUser.profile.completedMethods || [];
        return completedMethods.some(method => method.methodId === methodId);
    }

    getAllMethods() {
        // This should match the methods from your method definitions
        return [
            { id: 'ikigai', title: 'Ikigai-Workflow', description: 'Entdecke deinen Lebenssinn', icon: 'fas fa-heart' },
            { id: 'values', title: 'Werte-Klärung', description: 'Identifiziere deine persönlichen Werte', icon: 'fas fa-gem' },
            { id: 'strengths', title: 'Stärken-Analyse', description: 'Entdecke deine natürlichen Talente', icon: 'fas fa-star' },
            { id: 'goals', title: 'Ziel-Setting', description: 'Setze dir klare, erreichbare Ziele', icon: 'fas fa-bullseye' },
            { id: 'mindfulness', title: 'Achtsamkeit & Meditation', description: 'Entwickle Achtsamkeit und innere Ruhe', icon: 'fas fa-leaf' },
            { id: 'eq', title: 'Emotionale Intelligenz', description: 'Verbessere deine emotionale Intelligenz', icon: 'fas fa-brain' },
            { id: 'habits', title: 'Gewohnheiten aufbauen', description: 'Entwickle positive Gewohnheiten', icon: 'fas fa-sync' },
            { id: 'communication', title: 'Kommunikation', description: 'Verbessere deine Kommunikationsfähigkeiten', icon: 'fas fa-comments' },
            { id: 'time-management', title: 'Zeitmanagement', description: 'Optimiere dein Zeitmanagement', icon: 'fas fa-clock' },
            { id: 'gallup-strengths', title: 'Gallup StrengthsFinder', description: 'Entdecke deine Top 5 Talente', icon: 'fas fa-chart-bar' },
            { id: 'via-strengths', title: 'VIA Character Strengths', description: 'Identifiziere deine Charakterstärken', icon: 'fas fa-heart' },
            { id: 'self-assessment', title: 'Selbsteinschätzung', description: 'Umfassende Selbsteinschätzung', icon: 'fas fa-user-check' }
        ];
    }

    calculateStatistics() {
        const completedMethods = this.getCompletedMethods();
        const totalTimeSpent = completedMethods.length * 2; // Assuming 2 hours per method
        const averageRating = 4.2; // This would be calculated from user ratings
        const favoriteCategory = 'Selbstfindung'; // This would be calculated from usage data
        const longestStreak = this.getCurrentStreak(); // Simplified
        
        return {
            totalTimeSpent,
            averageRating,
            favoriteCategory,
            longestStreak
        };
    }

    getActivityData() {
        // This would be calculated from actual user activity
        const activities = {};
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Simulate some activity
            if (Math.random() > 0.3) {
                activities[dateStr] = Math.floor(Math.random() * 3) + 1;
            }
        }
        
        return activities;
    }

    initializeActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        
        const activities = this.getActivityData();
        const labels = Object.keys(activities).map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' });
        }).reverse();
        
        const data = Object.values(activities).reverse();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Aktivität',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Action methods
    continueLastMethod() {
        const inProgressMethods = this.getInProgressMethods();
        if (inProgressMethods.length > 0) {
            const lastMethod = inProgressMethods[0];
            this.continueMethod(lastMethod.id);
        } else {
            this.startNewMethod();
        }
    }

    startNewMethod() {
        // This would open the method selection modal
        console.log('Starting new method...');
    }

    continueMethod(methodId) {
        // This would load the specific method
        console.log('Continuing method:', methodId);
    }

    reviewMethod(methodId) {
        // This would show the completed method results
        console.log('Reviewing method:', methodId);
    }

    addGoal() {
        // This would open the goal creation modal
        console.log('Adding new goal...');
    }

    editGoal(goalId) {
        // This would open the goal editing modal
        console.log('Editing goal:', goalId);
    }

    deleteGoal(goalId) {
        if (confirm('Möchtest du dieses Ziel wirklich löschen?')) {
            const goals = this.currentUser.profile.currentGoals || [];
            this.currentUser.profile.currentGoals = goals.filter(goal => goal.id !== goalId);
            this.saveUserData();
            this.renderGoals();
        }
    }

    saveUserData() {
        if (window.userAuth) {
            window.userAuth.updateUserInStorage();
        }
    }

    show() {
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
        }
    }

    hide() {
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) {
            dashboardSection.style.display = 'none';
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userDashboard = new UserDashboard();
});
