/**
 * 🚀 ADDITIONAL API ENDPOINTS
 * Erweiterte API-Endpunkte für alle Bereiche des Manuel Weiss Systems
 */

class AdditionalAPIEndpoints {
    constructor() {
        this.config = {
            baseUrl: 'https://api.manuel-weiss.com',
            endpoints: {
                // =================== BEWERBUNGSWORKFLOW ENDPOINTS ===================
                applications: {
                    // Workflow Management
                    startWorkflow: '/api/v1/applications/workflow/start',
                    nextStep: '/api/v1/applications/workflow/next-step',
                    previousStep: '/api/v1/applications/workflow/previous-step',
                    saveStep: '/api/v1/applications/workflow/save-step',
                    completeWorkflow: '/api/v1/applications/workflow/complete',
                    
                    // Application Management
                    createApplication: '/api/v1/applications/create',
                    getApplication: '/api/v1/applications/{id}',
                    updateApplication: '/api/v1/applications/{id}',
                    deleteApplication: '/api/v1/applications/{id}',
                    listApplications: '/api/v1/applications',
                    
                    // AI Integration
                    analyzeJobDescription: '/api/v1/applications/ai/analyze-job',
                    generateCoverLetter: '/api/v1/applications/ai/generate-cover-letter',
                    optimizeCV: '/api/v1/applications/ai/optimize-cv',
                    matchRequirements: '/api/v1/applications/ai/match-requirements'
                },
                
                // =================== PERSÖNLICHKEITSENTWICKLUNG ENDPOINTS ===================
                personality: {
                    // Methods Management
                    getMethods: '/api/v1/personality/methods',
                    getMethod: '/api/v1/personality/methods/{id}',
                    startMethod: '/api/v1/personality/methods/{id}/start',
                    saveProgress: '/api/v1/personality/methods/{id}/progress',
                    completeMethod: '/api/v1/personality/methods/{id}/complete',
                    
                    // AI Coach
                    getAICoach: '/api/v1/personality/ai-coach',
                    chatWithCoach: '/api/v1/personality/ai-coach/chat',
                    getRecommendations: '/api/v1/personality/ai-coach/recommendations',
                    
                    // Progress Tracking
                    getProgress: '/api/v1/personality/progress',
                    getStatistics: '/api/v1/personality/statistics',
                    exportProgress: '/api/v1/personality/export'
                },
                
                // =================== ERNÄHRUNGSPLAN ENDPOINTS ===================
                nutrition: {
                    // Recipe Management
                    generateRecipe: '/api/v1/nutrition/recipes/generate',
                    getRecipes: '/api/v1/nutrition/recipes',
                    saveRecipe: '/api/v1/nutrition/recipes/save',
                    deleteRecipe: '/api/v1/nutrition/recipes/{id}',
                    
                    // Meal Planning
                    createMealPlan: '/api/v1/nutrition/meal-plans/create',
                    getMealPlan: '/api/v1/nutrition/meal-plans/{id}',
                    updateMealPlan: '/api/v1/nutrition/meal-plans/{id}',
                    
                    // AI Features
                    analyzeNutrition: '/api/v1/nutrition/ai/analyze',
                    getRecommendations: '/api/v1/nutrition/ai/recommendations',
                    optimizeDiet: '/api/v1/nutrition/ai/optimize'
                },
                
                // =================== PERSONAL TRAINING ENDPOINTS ===================
                training: {
                    // Workout Management
                    getWorkouts: '/api/v1/training/workouts',
                    createWorkout: '/api/v1/training/workouts/create',
                    getWorkout: '/api/v1/training/workouts/{id}',
                    updateWorkout: '/api/v1/training/workouts/{id}',
                    deleteWorkout: '/api/v1/training/workouts/{id}',
                    
                    // Exercise Database
                    getExercises: '/api/v1/training/exercises',
                    getExercise: '/api/v1/training/exercises/{id}',
                    searchExercises: '/api/v1/training/exercises/search',
                    
                    // AI Training
                    generateWorkout: '/api/v1/training/ai/generate-workout',
                    analyzeForm: '/api/v1/training/ai/analyze-form',
                    getPersonalizedPlan: '/api/v1/training/ai/personalized-plan'
                },
                
                // =================== KI-STRATEGIE ENDPOINTS ===================
                kiStrategy: {
                    // Strategy Development
                    startStrategy: '/api/v1/ki-strategy/start',
                    analyzeBusiness: '/api/v1/ki-strategy/analyze-business',
                    generateStrategy: '/api/v1/ki-strategy/generate',
                    saveStrategy: '/api/v1/ki-strategy/save',
                    
                    // AI Integration
                    getAIInsights: '/api/v1/ki-strategy/ai/insights',
                    optimizeStrategy: '/api/v1/ki-strategy/ai/optimize',
                    predictOutcomes: '/api/v1/ki-strategy/ai/predict'
                },
                
                // =================== HR TRANSFORMATION ENDPOINTS ===================
                hrTransformation: {
                    // Process Analysis
                    analyzeProcesses: '/api/v1/hr/analyze-processes',
                    identifyBottlenecks: '/api/v1/hr/identify-bottlenecks',
                    getRecommendations: '/api/v1/hr/recommendations',
                    
                    // Automation
                    automateProcess: '/api/v1/hr/automate/{processId}',
                    getAutomationStatus: '/api/v1/hr/automation/status',
                    
                    // AI Features
                    predictTrends: '/api/v1/hr/ai/predict-trends',
                    optimizeWorkflow: '/api/v1/hr/ai/optimize-workflow'
                },
                
                // =================== DIGITAL WORKPLACE ENDPOINTS ===================
                digitalWorkplace: {
                    // Assessment
                    startAssessment: '/api/v1/digital-workplace/assessment/start',
                    saveAssessment: '/api/v1/digital-workplace/assessment/save',
                    getResults: '/api/v1/digital-workplace/assessment/results',
                    
                    // Implementation
                    createRoadmap: '/api/v1/digital-workplace/roadmap/create',
                    getRoadmap: '/api/v1/digital-workplace/roadmap/{id}',
                    trackProgress: '/api/v1/digital-workplace/progress/track'
                },
                
                // =================== SYSTEM ENDPOINTS ===================
                system: {
                    // Health & Monitoring
                    health: '/api/v1/system/health',
                    status: '/api/v1/system/status',
                    metrics: '/api/v1/system/metrics',
                    
                    // Configuration
                    getConfig: '/api/v1/system/config',
                    updateConfig: '/api/v1/system/config',
                    
                    // Backup & Restore
                    createBackup: '/api/v1/system/backup/create',
                    restoreBackup: '/api/v1/system/backup/restore',
                    listBackups: '/api/v1/system/backup/list'
                }
            }
        };
    }
    
    /**
     * 📤 BEWERBUNGSWORKFLOW API FUNCTIONS
     */
    
    // Start new application workflow
    async startApplicationWorkflow(applicationType = 'job-posting') {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.applications.startWorkflow}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ applicationType })
            });
            
            if (!response.ok) {
                throw new Error(`Workflow start failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Start workflow failed:', error);
            throw error;
        }
    }
    
    // Analyze job description with AI
    async analyzeJobDescription(jobDescription, options = {}) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.applications.analyzeJobDescription}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    jobDescription,
                    options
                })
            });
            
            if (!response.ok) {
                throw new Error(`Job analysis failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Job analysis failed:', error);
            throw error;
        }
    }
    
    // Generate cover letter with AI
    async generateCoverLetter(requirements, personalInfo, options = {}) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.applications.generateCoverLetter}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    requirements,
                    personalInfo,
                    options
                })
            });
            
            if (!response.ok) {
                throw new Error(`Cover letter generation failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Cover letter generation failed:', error);
            throw error;
        }
    }
    
    /**
     * 🧠 PERSÖNLICHKEITSENTWICKLUNG API FUNCTIONS
     */
    
    // Get all personality development methods
    async getPersonalityMethods() {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.personality.getMethods}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to get methods: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Get methods failed:', error);
            throw error;
        }
    }
    
    // Start a personality development method
    async startPersonalityMethod(methodId, userId) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.personality.startMethod.replace('{id}', methodId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ userId })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to start method: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Start method failed:', error);
            throw error;
        }
    }
    
    // Chat with AI Coach
    async chatWithAICoach(message, context = {}) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.personality.chatWithCoach}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    message,
                    context
                })
            });
            
            if (!response.ok) {
                throw new Error(`AI Coach chat failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ AI Coach chat failed:', error);
            throw error;
        }
    }
    
    /**
     * 🍎 ERNÄHRUNGSPLAN API FUNCTIONS
     */
    
    // Generate AI recipe
    async generateAIRecipe(requirements) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.nutrition.generateRecipe}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(requirements)
            });
            
            if (!response.ok) {
                throw new Error(`Recipe generation failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Recipe generation failed:', error);
            throw error;
        }
    }
    
    // Create personalized meal plan
    async createMealPlan(preferences, goals) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.nutrition.createMealPlan}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    preferences,
                    goals
                })
            });
            
            if (!response.ok) {
                throw new Error(`Meal plan creation failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Meal plan creation failed:', error);
            throw error;
        }
    }
    
    /**
     * 🏋️ PERSONAL TRAINING API FUNCTIONS
     */
    
    // Generate personalized workout
    async generateWorkout(userProfile, goals) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.training.generateWorkout}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    userProfile,
                    goals
                })
            });
            
            if (!response.ok) {
                throw new Error(`Workout generation failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Workout generation failed:', error);
            throw error;
        }
    }
    
    // Get exercise database
    async getExercises(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.training.getExercises}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to get exercises: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Get exercises failed:', error);
            throw error;
        }
    }
    
    /**
     * 🤖 KI-STRATEGIE API FUNCTIONS
     */
    
    // Start KI strategy development
    async startKIStrategy(businessContext) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.kiStrategy.startStrategy}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(businessContext)
            });
            
            if (!response.ok) {
                throw new Error(`KI strategy start failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ KI strategy start failed:', error);
            throw error;
        }
    }
    
    // Analyze business with AI
    async analyzeBusiness(businessData) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.kiStrategy.analyzeBusiness}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(businessData)
            });
            
            if (!response.ok) {
                throw new Error(`Business analysis failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Business analysis failed:', error);
            throw error;
        }
    }
    
    /**
     * 🏢 HR TRANSFORMATION API FUNCTIONS
     */
    
    // Analyze HR processes
    async analyzeHRProcesses(processData) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.hrTransformation.analyzeProcesses}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(processData)
            });
            
            if (!response.ok) {
                throw new Error(`HR process analysis failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ HR process analysis failed:', error);
            throw error;
        }
    }
    
    /**
     * 💻 DIGITAL WORKPLACE API FUNCTIONS
     */
    
    // Start digital workplace assessment
    async startDigitalWorkplaceAssessment(companyData) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.digitalWorkplace.startAssessment}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(companyData)
            });
            
            if (!response.ok) {
                throw new Error(`Assessment start failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Assessment start failed:', error);
            throw error;
        }
    }
    
    /**
     * 🔧 SYSTEM API FUNCTIONS
     */
    
    // Get system health
    async getSystemHealth() {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.system.health}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Health check failed:', error);
            throw error;
        }
    }
    
    // Get system metrics
    async getSystemMetrics() {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.system.metrics}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Metrics retrieval failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ Metrics retrieval failed:', error);
            throw error;
        }
    }
    
    /**
     * 🔐 AUTHENTICATION HELPERS
     */
    
    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }
    
    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || 'default';
    }
}

// Global instance
window.additionalAPI = new AdditionalAPIEndpoints();

console.log('🚀 Additional API Endpoints loaded');

