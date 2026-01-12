/**
 * AWS Nutrition API Client
 * Handles nutrition plan and meal data synchronization with AWS
 */

class AWSNutritionAPI {
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
                console.log('⏳ Nutrition API waiting for AWS_CONFIG...');
                setTimeout(() => this.init(), 100);
                return;
            }

            this.apiBaseUrl = window.AWS_CONFIG.apiBaseUrl;
            this.isInitialized = true;
            console.log('✅ AWS Nutrition API initialized');
        } catch (error) {
            console.error('❌ AWS Nutrition API initialization failed:', error);
        }
    }

    async waitForInit() {
        const maxWait = 5000;
        const startTime = Date.now();
        
        while (!this.isInitialized && Date.now() - startTime < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!this.isInitialized) {
            throw new Error('AWS Nutrition API initialization timeout');
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
     * Load user's nutrition data from AWS
     */
    async loadNutrition() {
        if (!this.isInitialized) await this.waitForInit();

        // Check cache
        if (this.cache && this.cacheExpiry > Date.now()) {
            return this.cache;
        }

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/nutrition`, {
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
            
            console.log('✅ Nutrition data loaded from AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to load nutrition:', error);
            throw error;
        }
    }

    /**
     * Save nutrition plan to AWS
     */
    async saveNutrition(nutritionData) {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/nutrition`, {
                method: 'POST',
                headers,
                body: JSON.stringify(nutritionData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Invalidate cache
            this.cache = null;
            this.cacheExpiry = null;
            
            console.log('✅ Nutrition saved to AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to save nutrition:', error);
            throw error;
        }
    }

    /**
     * Log a meal
     */
    async logMeal(mealData) {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/nutrition/meal`, {
                method: 'POST',
                headers,
                body: JSON.stringify(mealData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Invalidate cache
            this.cache = null;
            
            console.log('✅ Meal logged to AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to log meal:', error);
            throw error;
        }
    }

    /**
     * Get meal history
     */
    async getMealHistory() {
        if (!this.isInitialized) await this.waitForInit();

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/nutrition/history`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Failed to get meal history:', error);
            throw error;
        }
    }

    /**
     * Save meal plan
     */
    async savePlan(plan) {
        const existing = await this.loadNutrition().catch(() => ({}));
        return this.saveNutrition({
            ...existing,
            currentPlan: plan
        });
    }

    /**
     * Get current meal plan
     */
    async getCurrentPlan() {
        const data = await this.loadNutrition();
        return data.currentPlan;
    }

    /**
     * Update preferences
     */
    async updatePreferences(preferences) {
        const existing = await this.loadNutrition().catch(() => ({}));
        return this.saveNutrition({
            ...existing,
            preferences: { ...existing.preferences, ...preferences }
        });
    }

    /**
     * Get nutrition statistics
     */
    async getStats() {
        const data = await this.loadNutrition();
        return data.stats || {
            totalCalories: 0,
            avgCaloriesPerDay: 0,
            mealsLogged: 0,
            currentStreak: 0
        };
    }

    /**
     * Get today's meals and calories
     */
    async getTodaysSummary() {
        const data = await this.loadNutrition();
        const today = new Date().toDateString();
        
        const todaysMeals = (data.meals || []).filter(
            m => new Date(m.date).toDateString() === today
        );
        
        const totalCalories = todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        const totalProtein = todaysMeals.reduce((sum, m) => sum + (m.macros?.protein || 0), 0);
        const totalCarbs = todaysMeals.reduce((sum, m) => sum + (m.macros?.carbs || 0), 0);
        const totalFat = todaysMeals.reduce((sum, m) => sum + (m.macros?.fat || 0), 0);
        
        return {
            meals: todaysMeals,
            calories: totalCalories,
            macros: { protein: totalProtein, carbs: totalCarbs, fat: totalFat },
            goal: data.preferences?.dailyCalorieGoal || 2000,
            remaining: (data.preferences?.dailyCalorieGoal || 2000) - totalCalories
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = null;
        this.cacheExpiry = null;
    }
}

// Global instance
window.awsNutritionAPI = new AWSNutritionAPI();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AWSNutritionAPI;
}
