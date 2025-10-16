// User Profile Dashboard - Modern Implementation 2025
// Integriert mit bestehendem Progress Tracking System

class UserProfileDashboard {
    constructor() {
        this.currentUser = null;
        this.progressData = {};
        this.achievements = [];
        this.goals = [];
        this.activityData = {};
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing User Profile Dashboard...');
        
        // Wait for auth system to be ready
        await this.waitForAuth();
        
        // Load user data
        this.loadUserData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render dashboard
        this.renderDashboard();
        
        console.log('✅ User Profile Dashboard initialized');
    }

    async waitForAuth() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (window.userAuth && window.userAuth.isInitialized()) {
                this.currentUser = window.userAuth.getCurrentUser();
                if (this.currentUser) {
                    console.log('✅ User authenticated:', this.currentUser.email);
                    return;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('⚠️ Auth system not ready, using demo data');
        this.currentUser = this.getDemoUser();
    }

    getDemoUser() {
        return {
            email: 'manuel@example.com',
            firstName: 'Manuel',
            lastName: 'Weiss',
            title: 'HR Berater für AI & Transformation',
            profile: {
                completedMethods: [
                    { methodId: 'ikigai', completedAt: '2024-01-15T10:30:00Z' },
                    { methodId: 'values', completedAt: '2024-01-20T14:15:00Z' }
                ],
                currentGoals: [
                    {
                        id: 'goal-1',
                        title: 'Persönliche Entwicklung',
                        description: 'Täglich 30 Minuten für Selbstreflexion',
                        progress: 75,
                        dueDate: '2024-03-01',
                        category: 'Entwicklung'
                    }
                ]
            }
        };
    }

    loadUserData() {
        // Load progress data from existing system
        if (window.userProgressTracker) {
            this.progressData = window.userProgressTracker.getProgressData();
        }
        
        // Load achievements
        this.loadAchievements();
        
        // Load goals
        this.loadGoals();
        
        // Load activity data
        this.loadActivityData();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        // Progress tracking events
        document.addEventListener('methodProgressUpdate', (e) => {
            this.updateProgress(e.detail.methodId, e.detail.step, e.detail.data);
        });

        document.addEventListener('methodCompleted', (e) => {
            this.markMethodCompleted(e.detail.methodId);
        });

        // Goal management events
        document.addEventListener('goalAdded', (e) => {
            this.addGoal(e.detail.goal);
        });

        document.addEventListener('goalUpdated', (e) => {
            this.updateGoal(e.detail.goalId, e.detail.goal);
        });

        document.addEventListener('goalDeleted', (e) => {
            this.deleteGoal(e.detail.goalId);
        });
    }

    renderDashboard() {
        this.renderProfileHeader();
        this.renderOverview();
        this.renderProgress();
        this.renderAchievements();
        this.renderGoals();
        this.renderStatistics();
    }

    renderProfileHeader() {
        const userName = document.getElementById('userName');
        const userTitle = document.getElementById('userTitle');
        const completedMethods = document.getElementById('completedMethods');
        const currentStreak = document.getElementById('currentStreak');
        const totalTimeSpent = document.getElementById('totalTimeSpent');

        if (userName) userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        if (userTitle) userTitle.textContent = this.currentUser.title;
        
        const completedCount = this.getCompletedMethodsCount();
        const streak = this.getCurrentStreak();
        const timeSpent = this.getTotalTimeSpent();

        if (completedMethods) completedMethods.textContent = completedCount;
        if (currentStreak) currentStreak.textContent = streak;
        if (totalTimeSpent) totalTimeSpent.textContent = `${timeSpent}h`;
    }

    renderOverview() {
        this.renderOverviewStats();
        this.renderRecentActivity();
    }

    renderOverviewStats() {
        const completed = this.getCompletedMethodsCount();
        const inProgress = this.getInProgressMethodsCount();
        const streak = this.getCurrentStreak();
        const rating = this.getAverageRating();

        // Update overview cards
        const overviewCompleted = document.getElementById('overviewCompleted');
        const overviewInProgress = document.getElementById('overviewInProgress');
        const overviewStreak = document.getElementById('overviewStreak');
        const overviewRating = document.getElementById('overviewRating');
        const overviewProgress = document.getElementById('overviewProgress');

        if (overviewCompleted) overviewCompleted.textContent = completed;
        if (overviewInProgress) overviewInProgress.textContent = inProgress;
        if (overviewStreak) overviewStreak.textContent = streak;
        if (overviewRating) overviewRating.textContent = rating.toFixed(1);

        // Update progress bar
        if (overviewProgress) {
            const totalMethods = this.getAllMethods().length;
            const progressPercentage = (completed / totalMethods) * 100;
            overviewProgress.style.width = `${progressPercentage}%`;
        }
    }

    renderRecentActivity() {
        const activityList = document.getElementById('recentActivityList');
        if (!activityList) return;

        const activities = this.getRecentActivities();
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-clock"></i>
                    <p>Noch keine Aktivitäten</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    renderProgress() {
        this.renderInProgressMethods();
        this.renderCompletedMethods();
    }

    renderInProgressMethods() {
        const container = document.getElementById('inProgressMethods');
        if (!container) return;

        const inProgressMethods = this.getInProgressMethods();
        
        if (inProgressMethods.length === 0) {
            container.innerHTML = `
                <div class="no-progress">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Noch keine Methoden in Bearbeitung</h3>
                    <p>Starte deine erste Methode, um deinen Fortschritt hier zu verfolgen.</p>
                    <button class="btn btn-primary" onclick="userProfileDashboard.startNewMethod()">
                        <i class="fas fa-plus"></i> Methode starten
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = inProgressMethods.map(method => this.renderMethodCard(method, 'in-progress')).join('');
    }

    renderCompletedMethods() {
        const container = document.getElementById('completedMethods');
        if (!container) return;

        const completedMethods = this.getCompletedMethods();
        
        if (completedMethods.length === 0) {
            container.innerHTML = `
                <div class="no-completed">
                    <i class="fas fa-trophy"></i>
                    <h3>Noch keine Methoden abgeschlossen</h3>
                    <p>Arbeite an deinen ersten Methoden, um sie hier zu sehen.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = completedMethods.map(method => this.renderMethodCard(method, 'completed')).join('');
    }

    renderMethodCard(method, status) {
        const progress = this.getMethodProgress(method.id);
        const progressPercentage = this.calculateProgressPercentage(progress);
        const lastActivity = this.getLastActivity(method.id);

        return `
            <div class="method-card" data-method="${method.id}">
                <div class="method-header">
                    <div class="method-icon">
                        <i class="${method.icon}"></i>
                    </div>
                    <div class="method-info">
                        <h4>${method.title}</h4>
                        <p>${method.description}</p>
                    </div>
                </div>
                
                ${status === 'in-progress' ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-info">
                        <span class="progress-percentage">${progressPercentage}%</span>
                        <span class="last-activity">Zuletzt: ${lastActivity}</span>
                    </div>
                    <div class="method-actions">
                        <button class="btn btn-sm btn-primary" onclick="userProfileDashboard.continueMethod('${method.id}')">
                            <i class="fas fa-play"></i> Fortsetzen
                        </button>
                    </div>
                ` : `
                    <div class="completion-info">
                        <span class="completion-date">Abgeschlossen am ${new Date(method.completedAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div class="method-actions">
                        <button class="btn btn-sm btn-outline" onclick="userProfileDashboard.reviewMethod('${method.id}')">
                            <i class="fas fa-eye"></i> Ansehen
                        </button>
                    </div>
                `}
            </div>
        `;
    }

    renderAchievements() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;

        const achievements = this.getAchievements();
        
        if (achievements.length === 0) {
            container.innerHTML = `
                <div class="no-achievements">
                    <i class="fas fa-trophy"></i>
                    <h3>Noch keine Erfolge</h3>
                    <p>Schließe deine ersten Methoden ab, um Erfolge zu sammeln!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-card">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-date">Erhalten am ${new Date(achievement.earnedAt).toLocaleDateString('de-DE')}</div>
            </div>
        `).join('');
    }

    renderGoals() {
        const container = document.getElementById('goalsList');
        if (!container) return;

        const goals = this.getGoals();
        
        if (goals.length === 0) {
            container.innerHTML = `
                <div class="no-goals">
                    <i class="fas fa-bullseye"></i>
                    <h3>Noch keine Ziele gesetzt</h3>
                    <p>Setze dir dein erstes Ziel, um deine Entwicklung zu fokussieren!</p>
                    <button class="btn btn-primary" onclick="userProfileDashboard.addNewGoal()">
                        <i class="fas fa-plus"></i> Erstes Ziel setzen
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => this.renderGoalCard(goal)).join('');
    }

    renderGoalCard(goal) {
        const dueDate = goal.dueDate ? new Date(goal.dueDate).toLocaleDateString('de-DE') : 'Kein Datum';
        
        return `
            <div class="goal-card" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <h4>${goal.title}</h4>
                    <div class="goal-actions">
                        <button class="btn btn-sm btn-outline" onclick="userProfileDashboard.editGoal('${goal.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="userProfileDashboard.deleteGoal('${goal.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <p class="goal-description">${goal.description}</p>
                
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                    <span class="progress-text">${goal.progress}%</span>
                </div>
                
                <div class="goal-meta">
                    <span class="due-date">Fällig: ${dueDate}</span>
                    <span class="goal-category">${goal.category}</span>
                </div>
            </div>
        `;
    }

    renderStatistics() {
        this.initializeCharts();
    }

    initializeCharts() {
        // Activity Chart
        this.initializeActivityChart();
        
        // Category Chart
        this.initializeCategoryChart();
        
        // Time Chart
        this.initializeTimeChart();
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

    initializeCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        const categories = this.getCategoryData();
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories.map(cat => cat.name),
                datasets: [{
                    data: categories.map(cat => cat.count),
                    backgroundColor: [
                        '#6366f1',
                        '#8b5cf6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initializeTimeChart() {
        const ctx = document.getElementById('timeChart');
        if (!ctx) return;
        
        const timeData = this.getTimeData();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: timeData.map(item => item.method),
                datasets: [{
                    label: 'Zeit (Stunden)',
                    data: timeData.map(item => item.time),
                    backgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Tab Management
    switchTab(e) {
        e.preventDefault();
        const tabName = e.target.getAttribute('data-tab');
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    // Data Management
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

    getCurrentStreak() {
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

    getTotalTimeSpent() {
        const completedMethods = this.getCompletedMethods();
        return completedMethods.length * 2; // Assuming 2 hours per method
    }

    getAverageRating() {
        return 4.2; // This would be calculated from actual user ratings
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

    getRecentActivities() {
        // This would be calculated from actual user activity
        return [
            {
                icon: 'fas fa-check-circle',
                title: 'Ikigai-Workflow abgeschlossen',
                time: 'vor 2 Stunden'
            },
            {
                icon: 'fas fa-play-circle',
                title: 'Werte-Klärung gestartet',
                time: 'vor 1 Tag'
            },
            {
                icon: 'fas fa-trophy',
                title: 'Erfolg "Erste Schritte" erhalten',
                time: 'vor 3 Tagen'
            }
        ];
    }

    getAchievements() {
        return this.achievements;
    }

    loadAchievements() {
        // This would load from actual user data
        this.achievements = [
            {
                icon: 'fas fa-trophy',
                title: 'Erste Schritte',
                description: 'Deine erste Methode abgeschlossen',
                earnedAt: '2024-01-15T10:30:00Z'
            },
            {
                icon: 'fas fa-fire',
                title: 'Durchhaltevermögen',
                description: '7 Tage am Stück aktiv',
                earnedAt: '2024-01-20T14:15:00Z'
            }
        ];
    }

    getGoals() {
        return this.currentUser.profile.currentGoals || [];
    }

    loadGoals() {
        // Goals are already loaded in currentUser.profile.currentGoals
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

    loadActivityData() {
        this.activityData = this.getActivityData();
    }

    getCategoryData() {
        return [
            { name: 'Selbstfindung', count: 3 },
            { name: 'Entwicklung', count: 2 },
            { name: 'Ziele', count: 1 },
            { name: 'Kommunikation', count: 1 }
        ];
    }

    getTimeData() {
        return [
            { method: 'Ikigai', time: 2.5 },
            { method: 'Werte', time: 1.8 },
            { method: 'Stärken', time: 2.2 }
        ];
    }

    // Event Handlers
    updateProgress(methodId, step, data) {
        if (window.userProgressTracker) {
            window.userProgressTracker.completeMethodStep(methodId, step, data);
        }
        this.loadUserData();
        this.renderProgress();
    }

    markMethodCompleted(methodId) {
        if (window.userProgressTracker) {
            window.userProgressTracker.completeMethod(methodId);
        }
        this.loadUserData();
        this.renderOverview();
        this.renderProgress();
        this.renderAchievements();
    }

    addGoal(goal) {
        if (!this.currentUser.profile.currentGoals) {
            this.currentUser.profile.currentGoals = [];
        }
        this.currentUser.profile.currentGoals.push(goal);
        this.saveUserData();
        this.renderGoals();
    }

    updateGoal(goalId, goal) {
        const goals = this.currentUser.profile.currentGoals || [];
        const index = goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            goals[index] = goal;
            this.saveUserData();
            this.renderGoals();
        }
    }

    deleteGoal(goalId) {
        const goals = this.currentUser.profile.currentGoals || [];
        this.currentUser.profile.currentGoals = goals.filter(g => g.id !== goalId);
        this.saveUserData();
        this.renderGoals();
    }

    saveUserData() {
        if (window.userAuth) {
            window.userAuth.updateUserInStorage();
        }
    }

    // Action Methods
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
        // Redirect to methods page
        window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
    }

    continueMethod(methodId) {
        // Redirect to specific method
        window.location.href = `methods/${methodId}/index-${methodId}.html`;
    }

    reviewMethod(methodId) {
        // Show method results
        console.log('Reviewing method:', methodId);
    }

    addNewGoal() {
        // Open goal creation modal
        console.log('Adding new goal...');
    }

    editGoal(goalId) {
        // Open goal editing modal
        console.log('Editing goal:', goalId);
    }

    deleteGoal(goalId) {
        if (confirm('Möchtest du dieses Ziel wirklich löschen?')) {
            this.deleteGoal(goalId);
        }
    }

    viewAllMethods() {
        window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
    }

    setNewGoal() {
        this.addNewGoal();
    }

    // Settings
    saveSettings() {
        const userName = document.getElementById('userNameInput').value;
        const userEmail = document.getElementById('userEmailInput').value;
        const userTitle = document.getElementById('userTitleInput').value;
        
        this.currentUser.firstName = userName.split(' ')[0];
        this.currentUser.lastName = userName.split(' ').slice(1).join(' ');
        this.currentUser.email = userEmail;
        this.currentUser.title = userTitle;
        
        this.saveUserData();
        this.renderProfileHeader();
        
        alert('Einstellungen gespeichert!');
    }

    exportData() {
        const data = {
            user: this.currentUser,
            progress: this.progressData,
            achievements: this.achievements,
            goals: this.getGoals(),
            activity: this.activityData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    changeAvatar() {
        console.log('Changing avatar...');
    }

    editProfile() {
        console.log('Editing profile...');
    }

    goToMethods() {
        window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userProfileDashboard = new UserProfileDashboard();
});

// Global functions for HTML onclick handlers
function continueLastMethod() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.continueLastMethod();
    }
}

function startNewMethod() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.startNewMethod();
    }
}

function viewAllMethods() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.viewAllMethods();
    }
}

function setNewGoal() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.setNewGoal();
    }
}

function addNewGoal() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.addNewGoal();
    }
}

function editGoal(goalId) {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.editGoal(goalId);
    }
}

function deleteGoal(goalId) {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.deleteGoal(goalId);
    }
}

function saveSettings() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.saveSettings();
    }
}

function exportData() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.exportData();
    }
}

function changeAvatar() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.changeAvatar();
    }
}

function editProfile() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.editProfile();
    }
}

function goToMethods() {
    if (window.userProfileDashboard) {
        window.userProfileDashboard.goToMethods();
    }
}
