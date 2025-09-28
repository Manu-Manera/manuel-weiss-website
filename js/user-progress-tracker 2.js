// User Progress Tracker für Persönlichkeitsentwicklung
// Speichert Fortschritt aller Methods pro Benutzer

class UserProgressTracker {
    constructor(globalAuth) {
        this.auth = globalAuth;
        this.methodProgress = {};
        this.achievements = [];
        this.streaks = {};
        
        this.init();
    }
    
    async init() {
        console.log('📊 User Progress Tracker initializing...');
        
        // Load existing progress if user is logged in
        if (this.auth.isAuthenticated()) {
            await this.loadProgress();
        }
        
        // Listen for auth changes
        this.auth.onAuthChange({
            onLogin: () => this.loadProgress(),
            onLogout: () => this.clearProgress()
        });
        
        console.log('✅ User Progress Tracker ready');
    }
    
    async loadProgress() {
        if (!this.auth.isAuthenticated()) return;
        
        const progress = this.auth.getProgress('personality_development');
        this.methodProgress = progress || {};
        
        console.log('📈 Loaded progress for', Object.keys(this.methodProgress).length, 'methods');
    }
    
    clearProgress() {
        this.methodProgress = {};
        this.achievements = [];
        this.streaks = {};
    }
    
    // Method Progress Tracking
    async completeMethodStep(methodId, stepId, stepData = {}) {
        if (!this.auth.requireAuth()) return false;
        
        if (!this.methodProgress[methodId]) {
            this.methodProgress[methodId] = {
                methodId,
                startedAt: new Date().toISOString(),
                completedSteps: [],
                currentStep: 0,
                totalSteps: stepData.totalSteps || 1,
                status: 'in_progress',
                results: {},
                timeSpent: 0
            };
        }
        
        const method = this.methodProgress[methodId];
        
        // Add completed step
        if (!method.completedSteps.includes(stepId)) {
            method.completedSteps.push(stepId);
            method.currentStep = method.completedSteps.length;
        }
        
        // Store step results
        method.results[stepId] = {
            ...stepData,
            completedAt: new Date().toISOString()
        };
        
        // Check if method is complete
        if (method.completedSteps.length >= method.totalSteps) {
            method.status = 'completed';
            method.completedAt = new Date().toISOString();
            
            // Award achievement
            await this.awardAchievement(methodId, 'method_completed');
            
            // Show completion message
            this.showCompletionMessage(methodId);
        }
        
        // Update last activity
        method.lastActivity = new Date().toISOString();
        
        // Save progress
        await this.saveProgress();
        
        // Update streak
        this.updateStreak();
        
        console.log(`✅ Step completed: ${methodId} -> ${stepId}`);
        return true;
    }
    
    async saveMethodResult(methodId, results) {
        if (!this.auth.requireAuth()) return false;
        
        if (!this.methodProgress[methodId]) {
            await this.completeMethodStep(methodId, 'initial', { totalSteps: 1 });
        }
        
        this.methodProgress[methodId].finalResults = {
            ...results,
            savedAt: new Date().toISOString()
        };
        
        await this.saveProgress();
        console.log(`💾 Method results saved: ${methodId}`);
        return true;
    }
    
    // Progress Analytics
    getMethodProgress(methodId) {
        return this.methodProgress[methodId] || null;
    }
    
    getOverallProgress() {
        const methods = Object.values(this.methodProgress);
        const total = methods.length;
        const completed = methods.filter(m => m.status === 'completed').length;
        const inProgress = methods.filter(m => m.status === 'in_progress').length;
        
        return {
            total,
            completed,
            inProgress,
            completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0,
            methods: this.methodProgress
        };
    }
    
    getRecentActivity(days = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        return Object.values(this.methodProgress)
            .filter(method => new Date(method.lastActivity || method.startedAt) > cutoff)
            .sort((a, b) => new Date(b.lastActivity || b.startedAt) - new Date(a.lastActivity || a.startedAt));
    }
    
    // Achievement System
    async awardAchievement(methodId, type, data = {}) {
        const achievement = {
            id: `${type}_${methodId}_${Date.now()}`,
            type,
            methodId,
            awardedAt: new Date().toISOString(),
            data
        };
        
        this.achievements.push(achievement);
        
        // Save to user profile
        await this.auth.updateUserProfile({
            achievements: this.achievements
        });
        
        // Show achievement notification
        this.showAchievementNotification(achievement);
        
        console.log('🏆 Achievement awarded:', achievement);
    }
    
    // Streak Tracking
    updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (!this.streaks.lastActivity || this.streaks.lastActivity === yesterdayStr) {
            // Continue or start streak
            this.streaks.current = (this.streaks.current || 0) + 1;
            this.streaks.lastActivity = today;
            
            // Check for streak milestones
            if ([7, 14, 30, 100].includes(this.streaks.current)) {
                this.awardAchievement('streak', 'streak_milestone', { days: this.streaks.current });
            }
        } else if (this.streaks.lastActivity !== today) {
            // Streak broken
            this.streaks.current = 1;
            this.streaks.lastActivity = today;
        }
        
        // Update longest streak
        this.streaks.longest = Math.max(this.streaks.longest || 0, this.streaks.current || 0);
    }
    
    // Data Persistence
    async saveProgress() {
        return await this.auth.saveProgress('personality_development', 'all', {
            methods: this.methodProgress,
            achievements: this.achievements,
            streaks: this.streaks,
            stats: this.getOverallProgress()
        });
    }
    
    // UI Helpers
    showCompletionMessage(methodId) {
        const methodName = this.getMethodName(methodId);
        this.auth.showNotification(`🎉 ${methodName} erfolgreich abgeschlossen!`, 'success');
    }
    
    showAchievementNotification(achievement) {
        let message = '';
        switch (achievement.type) {
            case 'method_completed':
                message = `🏆 Methode abgeschlossen: ${this.getMethodName(achievement.methodId)}`;
                break;
            case 'streak_milestone':
                message = `🔥 ${achievement.data.days} Tage in Folge aktiv!`;
                break;
            default:
                message = '🎯 Neue Errungenschaft!';
        }
        
        this.auth.showNotification(message, 'success');
    }
    
    getMethodName(methodId) {
        const methodNames = {
            'johari-window': 'Johari-Fenster',
            'swot-analysis': 'SWOT-Analyse', 
            'values-clarification': 'Werte-Klärung',
            'goal-setting': 'Ziele setzen',
            'wheel-of-life': 'Lebensrad',
            'strengths-finder': 'Stärken-Finder',
            'emotional-intelligence': 'Emotionale Intelligenz',
            'mindfulness': 'Achtsamkeit',
            'habit-building': 'Gewohnheiten entwickeln',
            'time-management': 'Zeitmanagement'
        };
        
        return methodNames[methodId] || methodId;
    }
    
    // Progress Dashboard
    createProgressDashboard() {
        const progress = this.getOverallProgress();
        const recent = this.getRecentActivity();
        
        return `
            <div style="
                background: white; padding: 1.5rem; border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 1rem 0;
            ">
                <h3 style="margin: 0 0 1rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">📊</span>
                    Ihr Fortschritt
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="text-align: center; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #0369a1;">${progress.completed}</div>
                        <div style="font-size: 0.875rem; color: #64748b;">Abgeschlossen</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #fef3c7; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #d97706;">${progress.inProgress}</div>
                        <div style="font-size: 0.875rem; color: #64748b;">In Bearbeitung</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #f0fdf4; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #16a34a;">${progress.completionRate}%</div>
                        <div style="font-size: 0.875rem; color: #64748b;">Fortschritt</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: #fdf4ff; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: bold; color: #a21caf;">${this.streaks.current || 0}</div>
                        <div style="font-size: 0.875rem; color: #64748b;">Aktuelle Serie</div>
                    </div>
                </div>
                
                ${recent.length > 0 ? `
                    <div>
                        <h4 style="margin: 0 0 0.5rem; color: #374151;">Letzte Aktivität</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${recent.slice(0, 3).map(method => `
                                <div style="
                                    display: flex; justify-content: space-between; align-items: center;
                                    padding: 0.5rem; background: #f9fafb; border-radius: 6px;
                                ">
                                    <span style="font-weight: 500;">${this.getMethodName(method.methodId)}</span>
                                    <span style="font-size: 0.75rem; color: #6b7280;">
                                        ${method.status === 'completed' ? '✅ Abgeschlossen' : `📊 ${method.currentStep}/${method.totalSteps}`}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // Export for global use
    exportProgress() {
        return {
            methods: this.methodProgress,
            achievements: this.achievements,
            streaks: this.streaks,
            stats: this.getOverallProgress()
        };
    }
}

// Initialize when global auth is ready
if (window.GlobalAuth) {
    window.ProgressTracker = new UserProgressTracker(window.GlobalAuth);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.GlobalAuth) {
            window.ProgressTracker = new UserProgressTracker(window.GlobalAuth);
        }
    });
}

console.log('📈 User Progress Tracker loaded');

export default UserProgressTracker;
