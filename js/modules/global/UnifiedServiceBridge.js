// 🌐 Unified Service Bridge - Verbindet alle Services der Website
// Cross-Service Communication, Shared State Management, Unified Analytics

export class UnifiedServiceBridge {
    constructor() {
        this.services = new Map();
        this.globalState = this.initializeGlobalState();
        this.eventBridge = new EventTarget();
        this.analyticsQueue = [];
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('🌐 Initializing Unified Service Bridge...');
            
            this.setupGlobalEventHandlers();
            this.setupCrossServiceCommunication();
            this.setupUnifiedAnalytics();
            this.setupSharedUserPreferences();
            this.registerExistingServices();
            
            this.isInitialized = true;
            console.log('✅ Unified Service Bridge initialized');
            
            // Make globally available
            window.serviceBridge = this;
            
        } catch (error) {
            console.error('❌ Unified Service Bridge initialization failed:', error);
        }
    }

    initializeGlobalState() {
        return {
            user: {
                preferences: this.loadUserPreferences(),
                profile: this.loadUserProfile(),
                session: {
                    startTime: Date.now(),
                    pageViews: 0,
                    servicesUsed: new Set()
                }
            },
            services: new Map(),
            analytics: {
                events: [],
                performance: new Map(),
                errors: []
            },
            theme: {
                current: this.detectTheme(),
                systemPreference: this.getSystemTheme()
            }
        };
    }

    // 🔧 Service Registration
    registerService(serviceId, serviceInstance, metadata = {}) {
        const service = {
            id: serviceId,
            instance: serviceInstance,
            metadata: {
                name: metadata.name || serviceId,
                version: metadata.version || '1.0.0',
                capabilities: metadata.capabilities || [],
                dependencies: metadata.dependencies || [],
                ...metadata
            },
            registeredAt: Date.now(),
            status: 'active'
        };

        this.services.set(serviceId, service);
        this.globalState.services.set(serviceId, service);
        
        console.log(`📦 Service registered: ${serviceId}`, service);
        
        // Notify other services
        this.eventBridge.dispatchEvent(new CustomEvent('serviceRegistered', {
            detail: { serviceId, service }
        }));
        
        return service;
    }

    registerExistingServices() {
        // Detect and register existing services
        const detectedServices = [
            {
                id: 'applications',
                condition: () => window.applicationManager,
                getInstance: () => window.applicationManager,
                metadata: {
                    name: 'Bewerbungsverwaltung',
                    capabilities: ['crud', 'upload', 'analytics', 'export']
                }
            },
            {
                id: 'ki-strategy',
                condition: () => document.querySelector('.workflow-container'),
                getInstance: () => ({ element: document.querySelector('.workflow-container') }),
                metadata: {
                    name: 'KI-Strategieentwicklung', 
                    capabilities: ['workflow', 'assessment', 'recommendations']
                }
            },
            {
                id: 'personality',
                condition: () => window.personalityMethods,
                getInstance: () => window.personalityMethods,
                metadata: {
                    name: 'Persönlichkeitsentwicklung',
                    capabilities: ['methods', 'tracking', 'export']
                }
            }
        ];

        detectedServices.forEach(service => {
            if (service.condition()) {
                this.registerService(service.id, service.getInstance(), service.metadata);
            }
        });
    }

    // 💬 Cross-Service Communication
    setupCrossServiceCommunication() {
        // Service-to-service messaging
        this.eventBridge.addEventListener('serviceMessage', (event) => {
            const { from, to, message, data } = event.detail;
            
            const targetService = this.services.get(to);
            if (targetService && targetService.instance.handleMessage) {
                targetService.instance.handleMessage(from, message, data);
            }
            
            console.log(`📨 Service message: ${from} → ${to}`, { message, data });
        });

        // Global service events
        this.setupGlobalServiceEvents();
    }

    setupGlobalServiceEvents() {
        // User profile updates
        document.addEventListener('userProfileUpdated', (e) => {
            this.globalState.user.profile = { ...this.globalState.user.profile, ...e.detail };
            this.saveUserProfile(this.globalState.user.profile);
            
            // Notify all services
            this.broadcastToServices('userProfileUpdated', e.detail);
        });

        // Theme changes
        document.addEventListener('themeChanged', (e) => {
            this.globalState.theme.current = e.detail.theme;
            
            // Update all services
            this.broadcastToServices('themeChanged', e.detail);
        });

        // Data sharing between services
        document.addEventListener('crossServiceDataShare', (e) => {
            const { sourceService, targetService, data, dataType } = e.detail;
            
            this.shareDataBetweenServices(sourceService, targetService, data, dataType);
        });
    }

    broadcastToServices(eventType, data) {
        this.services.forEach((service, serviceId) => {
            if (service.instance && typeof service.instance.handleGlobalEvent === 'function') {
                try {
                    service.instance.handleGlobalEvent(eventType, data);
                } catch (error) {
                    console.error(`Error broadcasting to ${serviceId}:`, error);
                }
            }
        });
    }

    // 📊 Unified Analytics System
    setupUnifiedAnalytics() {
        window.unifiedAnalytics = {
            track: (category, action, label, value, customDimensions = {}) => {
                const event = {
                    id: this.generateEventId(),
                    category,
                    action,
                    label,
                    value,
                    customDimensions,
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId(),
                    userId: this.getUserId(),
                    page: window.location.pathname,
                    service: this.getCurrentService()
                };

                // Store locally
                this.globalState.analytics.events.push(event);
                this.analyticsQueue.push(event);
                
                // Process queue periodically
                this.processAnalyticsQueue();
                
                console.log('📊 Analytics event:', event);
            },

            trackPerformance: (metric, value, context = {}) => {
                const perfEvent = {
                    metric,
                    value,
                    context,
                    timestamp: Date.now(),
                    page: window.location.pathname
                };
                
                this.globalState.analytics.performance.set(`${metric}_${Date.now()}`, perfEvent);
                
                // Send to performance monitoring service
                this.sendPerformanceData(perfEvent);
            },

            trackError: (error, context = {}) => {
                const errorEvent = {
                    message: error.message || error.toString(),
                    stack: error.stack,
                    context,
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname,
                    userAgent: navigator.userAgent
                };
                
                this.globalState.analytics.errors.push(errorEvent);
                
                console.error('📊 Error tracked:', errorEvent);
            },

            getAnalytics: () => {
                return {
                    events: this.globalState.analytics.events,
                    performance: Object.fromEntries(this.globalState.analytics.performance),
                    errors: this.globalState.analytics.errors
                };
            }
        };

        // Set up error tracking
        window.addEventListener('error', (e) => {
            window.unifiedAnalytics.trackError(e.error, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            window.unifiedAnalytics.trackError(e.reason, {
                type: 'unhandledRejection'
            });
        });
    }

    processAnalyticsQueue() {
        if (this.analyticsQueue.length === 0) return;
        
        // Debounce queue processing
        clearTimeout(this.analyticsProcessTimeout);
        this.analyticsProcessTimeout = setTimeout(() => {
            this.flushAnalyticsQueue();
        }, 5000);
    }

    async flushAnalyticsQueue() {
        if (this.analyticsQueue.length === 0) return;
        
        try {
            // Batch send analytics (if API available)
            if (this.hasAnalyticsAPI()) {
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.analyticsQueue)
                });
            }
            
            // Clear queue
            this.analyticsQueue = [];
            
        } catch (error) {
            console.error('Analytics queue flush failed:', error);
            // Keep events in queue for retry
        }
    }

    // 🔄 Data Persistence
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('unified_user_preferences');
            return stored ? JSON.parse(stored) : {
                theme: 'auto',
                language: 'de',
                animations: true,
                notifications: true
            };
        } catch (error) {
            console.error('Error loading user preferences:', error);
            return {};
        }
    }

    saveUserPreferences(preferences) {
        try {
            this.globalState.user.preferences = preferences;
            localStorage.setItem('unified_user_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    }

    loadUserProfile() {
        try {
            const stored = localStorage.getItem('unified_user_profile');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading user profile:', error);
            return {};
        }
    }

    saveUserProfile(profile) {
        try {
            this.globalState.user.profile = profile;
            localStorage.setItem('unified_user_profile', JSON.stringify(profile));
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }

    // 🎯 Service Communication API
    sendMessageToService(serviceId, message, data = {}) {
        this.eventBridge.dispatchEvent(new CustomEvent('serviceMessage', {
            detail: {
                from: this.getCurrentService(),
                to: serviceId,
                message,
                data,
                timestamp: Date.now()
            }
        }));
    }

    shareDataBetweenServices(fromService, toService, data, dataType) {
        const shareEvent = {
            from: fromService,
            to: toService,
            data,
            dataType,
            timestamp: Date.now()
        };

        // Store for target service
        const targetService = this.services.get(toService);
        if (targetService) {
            if (!targetService.sharedData) {
                targetService.sharedData = new Map();
            }
            targetService.sharedData.set(dataType, data);
        }

        // Notify target service
        this.sendMessageToService(toService, 'dataShared', shareEvent);
        
        console.log(`🔄 Data shared: ${fromService} → ${toService}`, shareEvent);
    }

    // 📊 Global State Management
    getGlobalState() {
        return { ...this.globalState };
    }

    updateGlobalState(path, value) {
        this.setNestedValue(this.globalState, path, value);
        
        // Persist relevant state
        if (path.startsWith('user.preferences')) {
            this.saveUserPreferences(this.globalState.user.preferences);
        } else if (path.startsWith('user.profile')) {
            this.saveUserProfile(this.globalState.user.profile);
        }
    }

    // 🛠️ Utility Methods
    getCurrentService() {
        const page = window.location.pathname.split('/').pop();
        const serviceMap = {
            'applications-modern.html': 'applications',
            'ki-strategie-workflow.html': 'ki-strategy',
            'persoenlichkeitsentwicklung.html': 'personality',
            'admin.html': 'admin'
        };
        
        return serviceMap[page] || 'website';
    }

    detectTheme() {
        return localStorage.getItem('unified-theme') || 
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    hasAnalyticsAPI() {
        // Check if analytics API is available
        return this.services.has('analytics') || 
               typeof gtag !== 'undefined' ||
               window.location.hostname !== 'localhost';
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    sendPerformanceData(perfEvent) {
        // Send to monitoring service (if available)
        if (window.performanceOptimizer) {
            window.performanceOptimizer.recordMetric(perfEvent);
        }
    }

    // 🧹 Cleanup
    destroy() {
        this.services.clear();
        this.globalState = null;
        this.analyticsQueue = [];
        this.isInitialized = false;
        
        if (window.serviceBridge === this) {
            delete window.serviceBridge;
        }
    }
}

// 🌟 Service Integration Helpers
export class ServiceIntegrationHelpers {
    // 📊 Cross-service data sharing
    static shareApplicationDataWithStrategy(applicationData) {
        if (window.serviceBridge) {
            window.serviceBridge.shareDataBetweenServices(
                'applications', 
                'ki-strategy', 
                applicationData, 
                'jobApplicationData'
            );
        }
    }

    // 🎯 Smart service recommendations
    static getServiceRecommendations(currentService, userHistory) {
        const recommendationMatrix = {
            'applications': [
                { service: 'ki-strategy', reason: 'Optimieren Sie Ihre Bewerbungsstrategie', priority: 'high' },
                { service: 'personality', reason: 'Stärken Sie Ihr Profil', priority: 'medium' }
            ],
            'ki-strategy': [
                { service: 'applications', reason: 'Setzen Sie Ihre Strategie um', priority: 'high' },
                { service: 'hr-transformation', reason: 'Erweitern Sie Ihr HR-Wissen', priority: 'low' }
            ],
            'personality': [
                { service: 'applications', reason: 'Nutzen Sie Ihre Stärken bei Bewerbungen', priority: 'high' },
                { service: 'personal-training', reason: 'Ganzheitliche Entwicklung', priority: 'medium' }
            ]
        };

        const recommendations = recommendationMatrix[currentService] || [];
        
        // Filter out already used services
        return recommendations.filter(rec => !userHistory.includes(rec.service));
    }

    // 🔄 State synchronization between services
    static syncUserDataAcrossServices() {
        const sharedUserData = {
            profile: window.serviceBridge?.globalState.user.profile || {},
            preferences: window.serviceBridge?.globalState.user.preferences || {},
            progress: {}
        };

        // Collect progress from all services
        window.serviceBridge?.services.forEach((service, serviceId) => {
            if (service.instance.getUserProgress) {
                sharedUserData.progress[serviceId] = service.instance.getUserProgress();
            }
        });

        return sharedUserData;
    }

    // 📈 Cross-service analytics aggregation
    static getUnifiedAnalytics() {
        const analytics = {
            totalEvents: 0,
            serviceUsage: new Map(),
            userJourney: [],
            performance: new Map(),
            errors: []
        };

        if (window.serviceBridge) {
            const globalAnalytics = window.serviceBridge.globalState.analytics;
            
            analytics.totalEvents = globalAnalytics.events.length;
            analytics.performance = new Map(globalAnalytics.performance);
            analytics.errors = [...globalAnalytics.errors];
            
            // Aggregate service usage
            globalAnalytics.events.forEach(event => {
                const service = event.service || 'unknown';
                analytics.serviceUsage.set(service, (analytics.serviceUsage.get(service) || 0) + 1);
            });
            
            // Create user journey map
            analytics.userJourney = globalAnalytics.events
                .filter(event => event.action === 'page_view' || event.action === 'service_used')
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map(event => ({
                    service: event.service,
                    action: event.action,
                    timestamp: event.timestamp
                }));
        }

        return analytics;
    }
}

// 🏭 Factory and singleton management
let globalServiceBridge = null;

export function createUnifiedServiceBridge() {
    return new UnifiedServiceBridge();
}

export function getGlobalServiceBridge() {
    if (!globalServiceBridge) {
        globalServiceBridge = createUnifiedServiceBridge();
    }
    return globalServiceBridge;
}

export function initializeUnifiedServiceBridge() {
    const bridge = getGlobalServiceBridge();
    
    // Make helpers globally available
    window.ServiceHelpers = ServiceIntegrationHelpers;
    
    return bridge;
}

// 🚀 Auto-initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeUnifiedServiceBridge();
    });
}
