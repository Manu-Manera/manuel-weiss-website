// Advanced Progress Tracking System
class ProgressTracker {
    constructor() {
        this.currentUser = null;
        this.trackingData = {};
        this.init();
    }

    init() {
        this.currentUser = window.userAuth ? window.userAuth.getCurrentUser() : null;
        if (this.currentUser) {
            this.loadTrackingData();
            this.setupEventListeners();
            this.startAutoTracking();
        }
    }

    setupEventListeners() {
        // Track method interactions
        document.addEventListener('methodStarted', (e) => this.trackMethodStart(e.detail));
        document.addEventListener('methodStepCompleted', (e) => this.trackStepCompletion(e.detail));
        document.addEventListener('methodCompleted', (e) => this.trackMethodCompletion(e.detail));
        document.addEventListener('methodAbandoned', (e) => this.trackMethodAbandonment(e.detail));
        
        // Track goal interactions
        document.addEventListener('goalCreated', (e) => this.trackGoalCreation(e.detail));
        document.addEventListener('goalUpdated', (e) => this.trackGoalUpdate(e.detail));
        document.addEventListener('goalCompleted', (e) => this.trackGoalCompletion(e.detail));
        
        // Track time spent
        document.addEventListener('timeSpent', (e) => this.trackTimeSpent(e.detail));
    }

    startAutoTracking() {
        // Track page visits
        this.trackPageVisit();
        
        // Track daily activity
        this.trackDailyActivity();
        
        // Set up periodic tracking
        setInterval(() => this.trackPeriodicActivity(), 30000); // Every 30 seconds
    }

    trackMethodStart(methodData) {
        const trackingEntry = {
            methodId: methodData.methodId,
            methodName: methodData.methodName,
            startTime: new Date().toISOString(),
            sessionId: this.generateSessionId(),
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        };

        this.addTrackingEntry('method_starts', trackingEntry);
        this.updateMethodStats(methodData.methodId, 'started');
        
        console.log('Method started:', trackingEntry);
    }

    trackStepCompletion(stepData) {
        const trackingEntry = {
            methodId: stepData.methodId,
            stepNumber: stepData.stepNumber,
            stepName: stepData.stepName,
            completionTime: new Date().toISOString(),
            timeSpent: stepData.timeSpent,
            timestamp: Date.now()
        };

        this.addTrackingEntry('step_completions', trackingEntry);
        this.updateMethodStats(stepData.methodId, 'step_completed', stepData.stepNumber);
        
        // Update user progress
        if (window.userAuth) {
            window.userAuth.updateUserProgress(stepData.methodId, stepData.stepNumber, stepData.data);
        }
        
        console.log('Step completed:', trackingEntry);
    }

    trackMethodCompletion(methodData) {
        const trackingEntry = {
            methodId: methodData.methodId,
            methodName: methodData.methodName,
            completionTime: new Date().toISOString(),
            totalTimeSpent: methodData.totalTimeSpent,
            stepsCompleted: methodData.stepsCompleted,
            rating: methodData.rating,
            feedback: methodData.feedback,
            timestamp: Date.now()
        };

        this.addTrackingEntry('method_completions', trackingEntry);
        this.updateMethodStats(methodData.methodId, 'completed');
        
        // Mark method as completed
        if (window.userAuth) {
            window.userAuth.markMethodCompleted(methodData.methodId);
        }
        
        console.log('Method completed:', trackingEntry);
    }

    trackMethodAbandonment(abandonmentData) {
        const trackingEntry = {
            methodId: abandonmentData.methodId,
            methodName: abandonmentData.methodName,
            abandonmentTime: new Date().toISOString(),
            lastStep: abandonmentData.lastStep,
            timeSpent: abandonmentData.timeSpent,
            reason: abandonmentData.reason,
            timestamp: Date.now()
        };

        this.addTrackingEntry('method_abandonments', trackingEntry);
        this.updateMethodStats(abandonmentData.methodId, 'abandoned');
        
        console.log('Method abandoned:', trackingEntry);
    }

    trackGoalCreation(goalData) {
        const trackingEntry = {
            goalId: goalData.goalId,
            goalTitle: goalData.goalTitle,
            category: goalData.category,
            priority: goalData.priority,
            creationTime: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.addTrackingEntry('goal_creations', trackingEntry);
        this.updateGoalStats('created');
        
        console.log('Goal created:', trackingEntry);
    }

    trackGoalUpdate(goalData) {
        const trackingEntry = {
            goalId: goalData.goalId,
            goalTitle: goalData.goalTitle,
            previousProgress: goalData.previousProgress,
            newProgress: goalData.newProgress,
            updateTime: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.addTrackingEntry('goal_updates', trackingEntry);
        this.updateGoalStats('updated');
        
        console.log('Goal updated:', trackingEntry);
    }

    trackGoalCompletion(goalData) {
        const trackingEntry = {
            goalId: goalData.goalId,
            goalTitle: goalData.goalTitle,
            completionTime: new Date().toISOString(),
            timeToComplete: goalData.timeToComplete,
            timestamp: Date.now()
        };

        this.addTrackingEntry('goal_completions', trackingEntry);
        this.updateGoalStats('completed');
        
        console.log('Goal completed:', trackingEntry);
    }

    trackTimeSpent(timeData) {
        const trackingEntry = {
            methodId: timeData.methodId,
            timeSpent: timeData.timeSpent,
            activity: timeData.activity,
            timestamp: Date.now()
        };

        this.addTrackingEntry('time_tracking', trackingEntry);
        this.updateTimeStats(timeData.timeSpent);
        
        console.log('Time tracked:', trackingEntry);
    }

    trackPageVisit() {
        const trackingEntry = {
            page: window.location.pathname,
            visitTime: new Date().toISOString(),
            referrer: document.referrer,
            timestamp: Date.now()
        };

        this.addTrackingEntry('page_visits', trackingEntry);
    }

    trackDailyActivity() {
        const today = new Date().toISOString().split('T')[0];
        const activityKey = `daily_activity_${today}`;
        
        if (!this.trackingData[activityKey]) {
            this.trackingData[activityKey] = {
                date: today,
                visits: 0,
                methodsStarted: 0,
                methodsCompleted: 0,
                stepsCompleted: 0,
                timeSpent: 0,
                goalsCreated: 0,
                goalsCompleted: 0
            };
        }
        
        this.trackingData[activityKey].visits++;
        this.saveTrackingData();
    }

    trackPeriodicActivity() {
        // Track active time if user is actively using the site
        if (document.hasFocus() && this.isUserActive()) {
            this.trackTimeSpent({
                methodId: 'general',
                timeSpent: 30, // 30 seconds
                activity: 'active_browsing'
            });
        }
    }

    updateMethodStats(methodId, action, stepNumber = null) {
        if (!this.trackingData.method_stats) {
            this.trackingData.method_stats = {};
        }
        
        if (!this.trackingData.method_stats[methodId]) {
            this.trackingData.method_stats[methodId] = {
                starts: 0,
                completions: 0,
                abandonments: 0,
                stepsCompleted: 0,
                totalTimeSpent: 0,
                lastAccessed: null
            };
        }
        
        const stats = this.trackingData.method_stats[methodId];
        stats.lastAccessed = new Date().toISOString();
        
        switch (action) {
            case 'started':
                stats.starts++;
                break;
            case 'completed':
                stats.completions++;
                break;
            case 'abandoned':
                stats.abandonments++;
                break;
            case 'step_completed':
                stats.stepsCompleted++;
                break;
        }
        
        this.saveTrackingData();
    }

    updateGoalStats(action) {
        if (!this.trackingData.goal_stats) {
            this.trackingData.goal_stats = {
                created: 0,
                updated: 0,
                completed: 0,
                abandoned: 0
            };
        }
        
        this.trackingData.goal_stats[action]++;
        this.saveTrackingData();
    }

    updateTimeStats(timeSpent) {
        if (!this.trackingData.time_stats) {
            this.trackingData.time_stats = {
                totalTimeSpent: 0,
                sessionTime: 0,
                dailyTime: 0,
                weeklyTime: 0
            };
        }
        
        this.trackingData.time_stats.totalTimeSpent += timeSpent;
        this.trackingData.time_stats.sessionTime += timeSpent;
        
        // Update daily time
        const today = new Date().toISOString().split('T')[0];
        const dailyKey = `daily_time_${today}`;
        if (!this.trackingData[dailyKey]) {
            this.trackingData[dailyKey] = 0;
        }
        this.trackingData[dailyKey] += timeSpent;
        
        this.saveTrackingData();
    }

    addTrackingEntry(category, entry) {
        if (!this.trackingData[category]) {
            this.trackingData[category] = [];
        }
        
        this.trackingData[category].push(entry);
        
        // Keep only last 1000 entries per category to prevent storage bloat
        if (this.trackingData[category].length > 1000) {
            this.trackingData[category] = this.trackingData[category].slice(-1000);
        }
        
        this.saveTrackingData();
    }

    loadTrackingData() {
        const stored = localStorage.getItem(`progress_tracking_${this.currentUser.id}`);
        if (stored) {
            this.trackingData = JSON.parse(stored);
        }
    }

    saveTrackingData() {
        localStorage.setItem(`progress_tracking_${this.currentUser.id}`, JSON.stringify(this.trackingData));
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    isUserActive() {
        // Simple heuristic to determine if user is actively using the site
        return document.visibilityState === 'visible' && 
               (document.hasFocus() || this.hasRecentMouseMovement());
    }

    hasRecentMouseMovement() {
        // Check if mouse has moved recently (within last 30 seconds)
        const lastMovement = this.trackingData.lastMouseMovement || 0;
        return (Date.now() - lastMovement) < 30000;
    }

    // Analytics and reporting methods
    getMethodAnalytics(methodId) {
        const stats = this.trackingData.method_stats?.[methodId];
        if (!stats) return null;
        
        const completionRate = stats.starts > 0 ? (stats.completions / stats.starts) * 100 : 0;
        const abandonmentRate = stats.starts > 0 ? (stats.abandonments / stats.starts) * 100 : 0;
        const averageStepsPerSession = stats.starts > 0 ? stats.stepsCompleted / stats.starts : 0;
        
        return {
            ...stats,
            completionRate: Math.round(completionRate),
            abandonmentRate: Math.round(abandonmentRate),
            averageStepsPerSession: Math.round(averageStepsPerSession * 10) / 10
        };
    }

    getOverallAnalytics() {
        const methodStats = this.trackingData.method_stats || {};
        const goalStats = this.trackingData.goal_stats || {};
        const timeStats = this.trackingData.time_stats || {};
        
        const totalMethodsStarted = Object.values(methodStats).reduce((sum, stats) => sum + stats.starts, 0);
        const totalMethodsCompleted = Object.values(methodStats).reduce((sum, stats) => sum + stats.completions, 0);
        const totalStepsCompleted = Object.values(methodStats).reduce((sum, stats) => sum + stats.stepsCompleted, 0);
        
        const overallCompletionRate = totalMethodsStarted > 0 ? (totalMethodsCompleted / totalMethodsStarted) * 100 : 0;
        
        return {
            totalMethodsStarted,
            totalMethodsCompleted,
            totalStepsCompleted,
            overallCompletionRate: Math.round(overallCompletionRate),
            totalGoalsCreated: goalStats.created || 0,
            totalGoalsCompleted: goalStats.completed || 0,
            totalTimeSpent: timeStats.totalTimeSpent || 0,
            averageSessionTime: this.calculateAverageSessionTime(),
            mostUsedMethod: this.getMostUsedMethod(),
            leastUsedMethod: this.getLeastUsedMethod(),
            dailyActivity: this.getDailyActivityData()
        };
    }

    calculateAverageSessionTime() {
        const sessions = this.trackingData.time_tracking || [];
        if (sessions.length === 0) return 0;
        
        const totalTime = sessions.reduce((sum, session) => sum + session.timeSpent, 0);
        return Math.round(totalTime / sessions.length);
    }

    getMostUsedMethod() {
        const methodStats = this.trackingData.method_stats || {};
        let mostUsed = null;
        let maxStarts = 0;
        
        for (const [methodId, stats] of Object.entries(methodStats)) {
            if (stats.starts > maxStarts) {
                maxStarts = stats.starts;
                mostUsed = { methodId, ...stats };
            }
        }
        
        return mostUsed;
    }

    getLeastUsedMethod() {
        const methodStats = this.trackingData.method_stats || {};
        let leastUsed = null;
        let minStarts = Infinity;
        
        for (const [methodId, stats] of Object.entries(methodStats)) {
            if (stats.starts < minStarts && stats.starts > 0) {
                minStarts = stats.starts;
                leastUsed = { methodId, ...stats };
            }
        }
        
        return leastUsed;
    }

    getDailyActivityData(days = 30) {
        const dailyData = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const activityKey = `daily_activity_${dateStr}`;
            const timeKey = `daily_time_${dateStr}`;
            
            dailyData.push({
                date: dateStr,
                visits: this.trackingData[activityKey]?.visits || 0,
                methodsStarted: this.trackingData[activityKey]?.methodsStarted || 0,
                methodsCompleted: this.trackingData[activityKey]?.methodsCompleted || 0,
                timeSpent: this.trackingData[timeKey] || 0
            });
        }
        
        return dailyData;
    }

    // Export methods
    exportTrackingData(format = 'json') {
        const data = {
            user: {
                id: this.currentUser.id,
                name: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
                email: this.currentUser.email
            },
            trackingData: this.trackingData,
            analytics: this.getOverallAnalytics(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        if (format === 'json') {
            this.downloadJSON(data, 'fortschritts-tracking-daten.json');
        } else if (format === 'csv') {
            this.downloadCSV(this.convertToCSV(data), 'fortschritts-tracking-daten.csv');
        }
    }

    convertToCSV(data) {
        const rows = [];
        
        // Add method statistics
        if (data.trackingData.method_stats) {
            rows.push(['Method Statistics']);
            rows.push(['Method ID', 'Starts', 'Completions', 'Abandonments', 'Steps Completed', 'Completion Rate']);
            
            for (const [methodId, stats] of Object.entries(data.trackingData.method_stats)) {
                const completionRate = stats.starts > 0 ? (stats.completions / stats.starts) * 100 : 0;
                rows.push([methodId, stats.starts, stats.completions, stats.abandonments, stats.stepsCompleted, `${completionRate.toFixed(1)}%`]);
            }
        }
        
        return rows;
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    downloadCSV(rows, filename) {
        const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, filename);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Cleanup old data
    cleanupOldData(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffTimestamp = cutoffDate.getTime();
        
        // Clean up old tracking entries
        for (const [category, entries] of Object.entries(this.trackingData)) {
            if (Array.isArray(entries)) {
                this.trackingData[category] = entries.filter(entry => 
                    entry.timestamp && entry.timestamp > cutoffTimestamp
                );
            }
        }
        
        this.saveTrackingData();
    }
}

// Initialize progress tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.progressTracker = new ProgressTracker();
});

// Global functions for tracking events
function trackMethodStart(methodId, methodName) {
    const event = new CustomEvent('methodStarted', {
        detail: { methodId, methodName }
    });
    document.dispatchEvent(event);
}

function trackStepCompletion(methodId, stepNumber, stepName, timeSpent, data) {
    const event = new CustomEvent('methodStepCompleted', {
        detail: { methodId, stepNumber, stepName, timeSpent, data }
    });
    document.dispatchEvent(event);
}

function trackMethodCompletion(methodId, methodName, totalTimeSpent, stepsCompleted, rating, feedback) {
    const event = new CustomEvent('methodCompleted', {
        detail: { methodId, methodName, totalTimeSpent, stepsCompleted, rating, feedback }
    });
    document.dispatchEvent(event);
}

function trackGoalCreation(goalId, goalTitle, category, priority) {
    const event = new CustomEvent('goalCreated', {
        detail: { goalId, goalTitle, category, priority }
    });
    document.dispatchEvent(event);
}

function trackGoalUpdate(goalId, goalTitle, previousProgress, newProgress) {
    const event = new CustomEvent('goalUpdated', {
        detail: { goalId, goalTitle, previousProgress, newProgress }
    });
    document.dispatchEvent(event);
}

function trackGoalCompletion(goalId, goalTitle, timeToComplete) {
    const event = new CustomEvent('goalCompleted', {
        detail: { goalId, goalTitle, timeToComplete }
    });
    document.dispatchEvent(event);
}
