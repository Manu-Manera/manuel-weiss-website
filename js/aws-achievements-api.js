/**
 * AWS Achievements API Client
 * Handles achievements and gamification data synchronization with AWS
 */

class AWSAchievementsAPI {
    constructor() {
        this.isInitialized = false;
        this.apiBaseUrl = null;
        this.cache = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        // Achievement definitions
        this.achievementDefinitions = {
            // Personality Development Achievements
            personality_first_method: {
                id: 'personality_first_method',
                category: 'personality',
                title: 'Erster Schritt',
                description: 'Deine erste Methode abgeschlossen',
                icon: '🎯',
                points: 10
            },
            personality_five_methods: {
                id: 'personality_five_methods',
                category: 'personality',
                title: 'Auf dem Weg',
                description: '5 Methoden abgeschlossen',
                icon: '🚀',
                points: 50
            },
            personality_ten_methods: {
                id: 'personality_ten_methods',
                category: 'personality',
                title: 'Entdecker',
                description: '10 Methoden abgeschlossen',
                icon: '🔍',
                points: 100
            },
            personality_all_categories: {
                id: 'personality_all_categories',
                category: 'personality',
                title: 'Vielseitig',
                description: 'Methoden aus allen Kategorien abgeschlossen',
                icon: '🌈',
                points: 150
            },
            
            // Training Achievements
            training_first_workout: {
                id: 'training_first_workout',
                category: 'training',
                title: 'Fitness-Start',
                description: 'Erstes Workout abgeschlossen',
                icon: '💪',
                points: 10
            },
            training_week_streak: {
                id: 'training_week_streak',
                category: 'training',
                title: 'Wochenkrieger',
                description: '7 Tage hintereinander trainiert',
                icon: '🔥',
                points: 70
            },
            training_month_streak: {
                id: 'training_month_streak',
                category: 'training',
                title: 'Monatschampion',
                description: '30 Tage hintereinander trainiert',
                icon: '👑',
                points: 300
            },
            
            // Nutrition Achievements
            nutrition_first_meal: {
                id: 'nutrition_first_meal',
                category: 'nutrition',
                title: 'Tracking-Start',
                description: 'Erste Mahlzeit geloggt',
                icon: '🥗',
                points: 10
            },
            nutrition_week_tracking: {
                id: 'nutrition_week_tracking',
                category: 'nutrition',
                title: 'Bewusst essen',
                description: 'Eine Woche Mahlzeiten geloggt',
                icon: '📊',
                points: 50
            },
            nutrition_calorie_goal: {
                id: 'nutrition_calorie_goal',
                category: 'nutrition',
                title: 'Ziel erreicht',
                description: 'Kalorienziel 7 Tage in Folge erreicht',
                icon: '✅',
                points: 100
            },
            
            // Application Achievements
            application_first: {
                id: 'application_first',
                category: 'applications',
                title: 'Bewerbungsstart',
                description: 'Erste Bewerbung erstellt',
                icon: '📝',
                points: 10
            },
            application_five: {
                id: 'application_five',
                category: 'applications',
                title: 'Fleißig beworben',
                description: '5 Bewerbungen erstellt',
                icon: '📨',
                points: 50
            },
            application_interview: {
                id: 'application_interview',
                category: 'applications',
                title: 'Eingeladen',
                description: 'Zum Vorstellungsgespräch eingeladen',
                icon: '🤝',
                points: 100
            },
            application_offer: {
                id: 'application_offer',
                category: 'applications',
                title: 'Angebot erhalten',
                description: 'Job-Angebot erhalten',
                icon: '🎉',
                points: 200
            },
            
            // Snowflake Achievements
            snowflake_first_catch: {
                id: 'snowflake_first_catch',
                category: 'snowflakes',
                title: 'Schneeflocken-Jäger',
                description: 'Erste Schneeflocke gefangen',
                icon: '❄️',
                points: 5
            },
            snowflake_collector: {
                id: 'snowflake_collector',
                category: 'snowflakes',
                title: 'Sammler',
                description: '50 Schneeflocken gefangen',
                icon: '🌨️',
                points: 50
            },
            snowflake_master: {
                id: 'snowflake_master',
                category: 'snowflakes',
                title: 'Schneemeister',
                description: '500 Schneeflocken gefangen',
                icon: '⛄',
                points: 200
            }
        };
        
        this.init();
    }

    async init() {
        try {
            if (!window.AWS_CONFIG?.apiBaseUrl) {
                console.log('⏳ Achievements API waiting for AWS_CONFIG...');
                setTimeout(() => this.init(), 100);
                return;
            }

            this.apiBaseUrl = window.AWS_CONFIG.apiBaseUrl;
            this.isInitialized = true;
            console.log('✅ AWS Achievements API initialized');
        } catch (error) {
            console.error('❌ AWS Achievements API initialization failed:', error);
        }
    }

    async waitForInit() {
        const maxWait = 5000;
        const startTime = Date.now();
        
        while (!this.isInitialized && Date.now() - startTime < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!this.isInitialized) {
            throw new Error('AWS Achievements API initialization timeout');
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
     * Load user's achievements from AWS
     */
    async loadAchievements() {
        if (!this.isInitialized) await this.waitForInit();

        // Check cache
        if (this.cache && this.cacheExpiry > Date.now()) {
            return this.cache;
        }

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/achievements`, {
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
            
            console.log('✅ Achievements loaded from AWS');
            return data;
        } catch (error) {
            console.error('❌ Failed to load achievements:', error);
            throw error;
        }
    }

    /**
     * Unlock a new achievement
     */
    async unlockAchievement(achievementId, metadata = {}) {
        if (!this.isInitialized) await this.waitForInit();

        // Get achievement definition
        const definition = this.achievementDefinitions[achievementId];
        if (!definition) {
            console.warn(`Unknown achievement: ${achievementId}`);
            return null;
        }

        try {
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/achievements`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...definition,
                    metadata
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Invalidate cache
            this.cache = null;
            
            // Show notification if new achievement was unlocked
            if (data.newAchievement) {
                this.showAchievementNotification(data.newAchievement);
            }
            
            console.log('✅ Achievement unlocked:', achievementId);
            return data;
        } catch (error) {
            console.error('❌ Failed to unlock achievement:', error);
            throw error;
        }
    }

    /**
     * Check and unlock achievements based on current progress
     */
    async checkAndUnlockAchievements(category, stats) {
        const existing = await this.loadAchievements();
        const unlockedIds = existing.achievements.map(a => a.id);
        const toUnlock = [];

        switch (category) {
            case 'personality':
                if (stats.completedMethods >= 1 && !unlockedIds.includes('personality_first_method')) {
                    toUnlock.push('personality_first_method');
                }
                if (stats.completedMethods >= 5 && !unlockedIds.includes('personality_five_methods')) {
                    toUnlock.push('personality_five_methods');
                }
                if (stats.completedMethods >= 10 && !unlockedIds.includes('personality_ten_methods')) {
                    toUnlock.push('personality_ten_methods');
                }
                break;

            case 'training':
                if (stats.totalWorkouts >= 1 && !unlockedIds.includes('training_first_workout')) {
                    toUnlock.push('training_first_workout');
                }
                if (stats.currentStreak >= 7 && !unlockedIds.includes('training_week_streak')) {
                    toUnlock.push('training_week_streak');
                }
                if (stats.currentStreak >= 30 && !unlockedIds.includes('training_month_streak')) {
                    toUnlock.push('training_month_streak');
                }
                break;

            case 'nutrition':
                if (stats.mealsLogged >= 1 && !unlockedIds.includes('nutrition_first_meal')) {
                    toUnlock.push('nutrition_first_meal');
                }
                if (stats.mealsLogged >= 21 && !unlockedIds.includes('nutrition_week_tracking')) {
                    toUnlock.push('nutrition_week_tracking');
                }
                break;

            case 'applications':
                if (stats.total >= 1 && !unlockedIds.includes('application_first')) {
                    toUnlock.push('application_first');
                }
                if (stats.total >= 5 && !unlockedIds.includes('application_five')) {
                    toUnlock.push('application_five');
                }
                if (stats.interview >= 1 && !unlockedIds.includes('application_interview')) {
                    toUnlock.push('application_interview');
                }
                if (stats.offer >= 1 && !unlockedIds.includes('application_offer')) {
                    toUnlock.push('application_offer');
                }
                break;

            case 'snowflakes':
                if (stats.caught >= 1 && !unlockedIds.includes('snowflake_first_catch')) {
                    toUnlock.push('snowflake_first_catch');
                }
                if (stats.caught >= 50 && !unlockedIds.includes('snowflake_collector')) {
                    toUnlock.push('snowflake_collector');
                }
                if (stats.caught >= 500 && !unlockedIds.includes('snowflake_master')) {
                    toUnlock.push('snowflake_master');
                }
                break;
        }

        // Unlock all pending achievements
        for (const id of toUnlock) {
            await this.unlockAchievement(id, { triggeredBy: category, stats });
        }

        return toUnlock;
    }

    /**
     * Show achievement notification
     */
    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">🎉 ${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} Punkte</div>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('achievement-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'achievement-notification-styles';
            style.textContent = `
                .achievement-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
                    animation: achievementSlideIn 0.5s ease-out, achievementSlideOut 0.5s ease-in 4.5s forwards;
                    z-index: 10000;
                    max-width: 350px;
                }
                .achievement-icon {
                    font-size: 3rem;
                    animation: achievementBounce 0.5s ease-out 0.3s;
                }
                .achievement-title {
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin-bottom: 4px;
                }
                .achievement-description {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                .achievement-points {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #fbbf24;
                    margin-top: 4px;
                }
                @keyframes achievementSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes achievementSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes achievementBounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Get all achievement definitions
     */
    getDefinitions() {
        return this.achievementDefinitions;
    }

    /**
     * Get user's level and progress
     */
    async getLevelProgress() {
        const data = await this.loadAchievements();
        const pointsForNextLevel = (data.level || 1) * 100;
        const currentLevelPoints = data.totalPoints % 100;
        
        return {
            level: data.level || 1,
            totalPoints: data.totalPoints || 0,
            currentLevelPoints,
            pointsToNextLevel: pointsForNextLevel - currentLevelPoints,
            progress: (currentLevelPoints / 100) * 100
        };
    }

    /**
     * Get achievements by category
     */
    async getAchievementsByCategory(category) {
        const data = await this.loadAchievements();
        return data.achievements.filter(a => a.category === category);
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
window.awsAchievementsAPI = new AWSAchievementsAPI();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AWSAchievementsAPI;
}
