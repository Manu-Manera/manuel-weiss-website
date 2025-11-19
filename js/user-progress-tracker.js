/**
 * User Progress Tracker
 * Tracks user progress across personality development methods and workflows
 */

class UserProgressTracker {
    constructor() {
        this.userId = null;
        this.progressData = {};
        this.autoSaveInterval = null;
        this.pendingChanges = false;
        this.isInitialized = false;
    }

    /**
     * Initialize the progress tracker
     */
    async init() {
        if (this.isInitialized) return;
        
        // Check if user is authenticated
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) {
            console.log('Progress tracker: User not authenticated');
            return;
        }

        const user = window.realUserAuth.getCurrentUser ? window.realUserAuth.getCurrentUser() : null;
        if (!user) return;
        
        this.userId = user.id || user.userId || user.email || null;
        if (!this.userId) {
            console.warn('Progress tracker: could not determine userId');
            return;
        }
        
        // Load existing progress data
        await this.loadProgress();
        
        // Set up auto-save every 30 seconds if there are changes
        this.autoSaveInterval = setInterval(() => {
            if (this.pendingChanges) {
                this.saveProgress();
            }
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            if (this.pendingChanges) {
                this.saveProgress();
            }
        });
        
        this.isInitialized = true;
        console.log('Progress tracker initialized for user:', this.userId);
    }

    /**
     * Load progress data from AWS
     */
    async loadProgress() {
        try {
            if (!window.awsProfileAPI) {
                console.error('AWS Profile API not available');
                return;
            }

            const profile = await window.awsProfileAPI.loadProfile();
            if (profile && profile.progressData) {
                this.progressData = profile.progressData;
                console.log('Progress data loaded:', this.progressData);
            } else {
                this.progressData = this.getDefaultProgressData();
            }
        } catch (error) {
            console.error('Error loading progress:', error);
            // Load from local storage as fallback
            this.loadFromLocalStorage();
        }
    }

    /**
     * Save progress data to AWS
     */
    async saveProgress() {
        // WICHTIG: Prüfe ob User angemeldet ist
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) {
            console.warn('Cannot save progress: User not authenticated');
            // Speichere trotzdem lokal als Fallback
            this.saveToLocalStorage();
            return;
        }

        // Stelle sicher, dass userId gesetzt ist
        if (!this.userId) {
            const user = window.realUserAuth.getCurrentUser ? window.realUserAuth.getCurrentUser() : null;
            if (user) {
                this.userId = user.id || user.userId || user.email || null;
            }
        }

        if (!this.userId || !this.pendingChanges) {
            if (!this.userId) {
                console.warn('Cannot save progress: No userId available');
            }
            return;
        }
        
        try {
            if (!window.awsProfileAPI) {
                console.error('AWS Profile API not available');
                this.saveToLocalStorage();
                return;
            }

            // Stelle sicher, dass progressData userId enthält
            if (!this.progressData.userId) {
                this.progressData.userId = this.userId;
            }

            // Get current profile data
            const profile = await window.awsProfileAPI.loadProfile();
            const updatedProfile = {
                ...profile,
                userId: this.userId, // Stelle sicher, dass userId gesetzt ist
                progressData: this.progressData,
                lastProgressUpdate: new Date().toISOString()
            };
            
            // Save to AWS
            await window.awsProfileAPI.saveProfile(updatedProfile);
            
            this.pendingChanges = false;
            console.log('✅ Progress saved to AWS for user:', this.userId);
            
            // Also save to local storage as backup
            this.saveToLocalStorage();
        } catch (error) {
            console.error('Error saving progress:', error);
            // Fallback to local storage
            this.saveToLocalStorage();
        }
    }

    /**
     * Generic progress update helper for workflows
     */
    async updateProgress(sectionId, stepId, data) {
        if (!sectionId || !stepId) return;

        // Prüfe ob User angemeldet ist
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) {
            console.warn('Cannot update progress: User not authenticated');
            return;
        }

        if (!this.isInitialized) {
            await this.init();
        }

        // Stelle sicher, dass userId gesetzt ist
        if (!this.userId) {
            const user = window.realUserAuth.getCurrentUser ? window.realUserAuth.getCurrentUser() : null;
            if (user) {
                this.userId = user.id || user.userId || user.email || null;
            }
        }

        if (!this.userId) {
            console.warn('Progress tracker: Cannot update progress without userId');
            return;
        }

        if (!this.progressData.sections) {
            this.progressData.sections = {};
        }

        if (!this.progressData.sections[sectionId]) {
            this.progressData.sections[sectionId] = {};
        }

        this.progressData.sections[sectionId][stepId] = {
            data,
            updatedAt: new Date().toISOString()
        };

        // Stelle sicher, dass userId im progressData enthalten ist
        if (!this.progressData.userId) {
            this.progressData.userId = this.userId;
        }

        this.pendingChanges = true;
        try {
            await this.saveProgress();
        } catch (error) {
            console.error('Error updating progress section:', error);
        }
    }

    /**
     * Track page visit
     */
    trackPageVisit(pageId, pageType = 'method') {
        if (!this.userId) return;
        
        const timestamp = new Date().toISOString();
        
        if (!this.progressData.pages) {
            this.progressData.pages = {};
        }
        
        if (!this.progressData.pages[pageId]) {
            this.progressData.pages[pageId] = {
                firstVisit: timestamp,
                lastVisit: timestamp,
                visitCount: 0,
                completed: false,
                completionPercentage: 0,
                pageType: pageType
            };
        }
        
        this.progressData.pages[pageId].lastVisit = timestamp;
        this.progressData.pages[pageId].visitCount++;
        
        this.pendingChanges = true;
        this.updateOverallProgress();
    }

    /**
     * Track step completion in multi-step workflows
     */
    trackStepCompletion(pageId, stepId, totalSteps) {
        if (!this.userId) return;
        
        if (!this.progressData.pages) {
            this.progressData.pages = {};
        }
        
        if (!this.progressData.pages[pageId]) {
            this.trackPageVisit(pageId, 'workflow');
        }
        
        if (!this.progressData.pages[pageId].steps) {
            this.progressData.pages[pageId].steps = {};
        }
        
        this.progressData.pages[pageId].steps[stepId] = {
            completed: true,
            completedAt: new Date().toISOString()
        };
        
        // Calculate completion percentage
        const completedSteps = Object.keys(this.progressData.pages[pageId].steps).length;
        this.progressData.pages[pageId].completionPercentage = Math.round((completedSteps / totalSteps) * 100);
        
        if (completedSteps >= totalSteps) {
            this.progressData.pages[pageId].completed = true;
            this.progressData.pages[pageId].completedAt = new Date().toISOString();
        }
        
        this.pendingChanges = true;
        this.updateOverallProgress();
    }

    /**
     * Track form data or answers
     */
    trackFormData(pageId, formData) {
        if (!this.userId) return;
        
        if (!this.progressData.pages) {
            this.progressData.pages = {};
        }
        
        if (!this.progressData.pages[pageId]) {
            this.trackPageVisit(pageId);
        }
        
        if (!this.progressData.pages[pageId].formData) {
            this.progressData.pages[pageId].formData = {};
        }
        
        Object.assign(this.progressData.pages[pageId].formData, formData);
        this.progressData.pages[pageId].lastUpdate = new Date().toISOString();
        
        this.pendingChanges = true;
    }

    /**
     * Track test results
     */
    trackTestResult(pageId, results) {
        if (!this.userId) return;
        
        if (!this.progressData.pages) {
            this.progressData.pages = {};
        }
        
        if (!this.progressData.pages[pageId]) {
            this.trackPageVisit(pageId, 'test');
        }
        
        if (!this.progressData.pages[pageId].results) {
            this.progressData.pages[pageId].results = [];
        }
        
        this.progressData.pages[pageId].results.push({
            timestamp: new Date().toISOString(),
            ...results
        });
        
        this.progressData.pages[pageId].completed = true;
        this.progressData.pages[pageId].completedAt = new Date().toISOString();
        this.progressData.pages[pageId].completionPercentage = 100;
        
        this.pendingChanges = true;
        this.updateOverallProgress();
    }

    /**
     * Get progress for a specific page
     */
    getPageProgress(pageId) {
        if (!this.progressData.pages || !this.progressData.pages[pageId]) {
            return null;
        }
        return this.progressData.pages[pageId];
    }

    /**
     * Get overall progress statistics
     */
    getOverallProgress() {
        if (!this.progressData.pages) {
            return {
                totalPages: 0,
                visitedPages: 0,
                completedPages: 0,
                completionPercentage: 0
            };
        }
        
        const pages = Object.values(this.progressData.pages);
        const totalPages = pages.length;
        const completedPages = pages.filter(p => p.completed).length;
        const totalPercentage = pages.reduce((sum, p) => sum + (p.completionPercentage || 0), 0);
        
        return {
            totalPages,
            visitedPages: totalPages,
            completedPages,
            completionPercentage: totalPages > 0 ? Math.round(totalPercentage / totalPages) : 0
        };
    }

    /**
     * Update overall progress statistics
     */
    updateOverallProgress() {
        const stats = this.getOverallProgress();
        this.progressData.overallStats = {
            ...stats,
            lastUpdate: new Date().toISOString()
        };
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('progressUpdated', { 
            detail: { 
                userId: this.userId, 
                stats: stats 
            } 
        }));
    }

    /**
     * Get default progress data structure
     */
    getDefaultProgressData() {
        return {
            userId: this.userId,
            pages: {},
            overallStats: {
                totalPages: 0,
                visitedPages: 0,
                completedPages: 0,
                completionPercentage: 0
            },
            createdAt: new Date().toISOString(),
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Save to local storage (fallback)
     */
    saveToLocalStorage() {
        if (!this.userId) return;
        
        const key = `userProgress_${this.userId}`;
        localStorage.setItem(key, JSON.stringify(this.progressData));
        console.log('Progress saved to local storage');
    }

    /**
     * Load from local storage (fallback)
     */
    loadFromLocalStorage() {
        if (!this.userId) return;
        
        const key = `userProgress_${this.userId}`;
        const stored = localStorage.getItem(key);
        
        if (stored) {
            try {
                this.progressData = JSON.parse(stored);
                console.log('Progress loaded from local storage');
            } catch (error) {
                console.error('Error parsing local storage progress:', error);
                this.progressData = this.getDefaultProgressData();
            }
        } else {
            this.progressData = this.getDefaultProgressData();
        }
    }

    /**
     * Clear all progress data
     */
    clearProgress() {
        this.progressData = this.getDefaultProgressData();
        this.pendingChanges = true;
        this.saveProgress();
    }

    /**
     * Export progress data
     */
    exportProgress() {
        return JSON.stringify(this.progressData, null, 2);
    }

    /**
     * Import progress data
     */
    importProgress(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data && data.userId === this.userId) {
                this.progressData = data;
                this.pendingChanges = true;
                this.saveProgress();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing progress:', error);
            return false;
        }
    }

    /**
     * Cleanup on logout
     */
    cleanup() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        if (this.pendingChanges) {
            this.saveProgress();
        }
        
        this.userId = null;
        this.progressData = {};
        this.pendingChanges = false;
        this.isInitialized = false;
    }
}

// Create global instance
window.userProgressTracker = new UserProgressTracker();

// Initialize on auth state change
if (window.realUserAuth && typeof window.realUserAuth.onAuthStateChange === 'function') {
    window.realUserAuth.onAuthStateChange((isAuthenticated) => {
        if (isAuthenticated) {
            window.userProgressTracker.init();
        } else {
            window.userProgressTracker.cleanup();
        }
    });
}

// Auto-initialize if user is already authenticated
document.addEventListener('DOMContentLoaded', () => {
    if (window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) {
        window.userProgressTracker.init();
    }
});