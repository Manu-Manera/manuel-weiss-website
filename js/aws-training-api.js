/**
 * AWS Training API Client
 * Handles training plan and workout data synchronization with AWS
 */

class AWSTrainingAPI {
    constructor() {
        this.isInitialized = false;
        this.apiBaseUrl = null;
        this.cache = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }

    async init() {
        try {
            if (!window.AWS_CONFIG?.apiBaseUrl) {
                console.log('⏳ Training API waiting for AWS_CONFIG...');
                setTimeout(() => this.init(), 100);
                return;
            }

            this.apiBaseUrl = window.AWS_CONFIG.apiBaseUrl;
            this.isInitialized = true;
            console.log('✅ AWS Training API initialized');
        } catch (error) {
            console.error('❌ AWS Training API initialization failed:', error);
        }
    }

    async waitForInit() {
        const maxWait = 5000;
        const startTime = Date.now();
        
        while (!this.isInitialized && Date.now() - startTime < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!this.isInitialized) {
            throw new Error('AWS Training API initialization timeout');
        }
    }

    async getAuthHeaders() {
        const sessionStr = localStorage.getItem('aws_auth_session');
        if (!sessionStr) {
            throw new Error('Not authenticated');
        }
        
        const session = JSON.parse(sessionStr);
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.idToken}`
        };
    }

    /**
     * Load user's training data from AWS
     */
    async loadTraining() {
        if (!this.isInitialized) await this.waitForInit();

        // Check cache
        if (this.cache && this.cacheExpiry > Date.now()) {
            return this.cache;
        }

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/training`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Update cache
            this.cache = data;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            
            console.log('✅ Training data loaded from AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to load training:', error);
            throw error;
        }
    }

    /**
     * Save training plan to AWS
     */
    async saveTraining(trainingData) {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/training`, {
                method: 'POST',
                headers,
                body: JSON.stringify(trainingData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Invalidate cache
            this.cache = null;
            this.cacheExpiry = null;
            
            console.log('✅ Training saved to AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to save training:', error);
            throw error;
        }
    }

    /**
     * Log a workout session
     */
    async logWorkout(workoutData) {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/training/workout`, {
                method: 'POST',
                headers,
                body: JSON.stringify(workoutData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Invalidate cache
            this.cache = null;
            
            console.log('✅ Workout logged to AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to log workout:', error);
            throw error;
        }
    }

    /**
     * Get workout history
     */
    async getWorkoutHistory() {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/training/history`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Failed to get workout history:', error);
            throw error;
        }
    }

    /**
     * Save training plan (wrapper for saveTraining with plan focus)
     */
    async savePlan(plan) {
        const existing = await this.loadTraining().catch(() => ({}));
        return this.saveTraining({
            ...existing,
            currentPlan: plan
        });
    }

    /**
     * Get current training plan
     */
    async getCurrentPlan() {
        const data = await this.loadTraining();
        return data.currentPlan;
    }

    /**
     * Get training statistics
     */
    async getStats() {
        const data = await this.loadTraining();
        return data.stats || {
            totalWorkouts: 0,
            totalMinutes: 0,
            currentStreak: 0,
            longestStreak: 0
        };
    }

    /**
     * Clear cache (useful after updates from other sources)
     */
    clearCache() {
        this.cache = null;
        this.cacheExpiry = null;
    }
}

// Global instance
window.awsTrainingAPI = new AWSTrainingAPI();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AWSTrainingAPI;
}
