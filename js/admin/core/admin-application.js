/**
 * Admin Application
 * Hauptklasse für das modulare Admin Panel
 */
class AdminApplication {
    constructor() {
        this.stateManager = null;
        this.navigation = null;
        this.sectionLoader = null;
        this.sections = {};
        this.initialized = false;
        this.performanceMonitor = null;
        this.lazyLoader = null;
    }
    
    /**
     * Application initialisieren
     */
    async init() {
        if (this.initialized) return;
        
        try {
            console.log('Initializing Admin Application...');
            
            // Core Components initialisieren
            this.stateManager = new AdminStateManager();
            this.sectionLoader = new AdminSectionLoader();
            this.navigation = new AdminNavigation(this.stateManager);
            this.performanceMonitor = new AdminPerformanceMonitor();
            this.lazyLoader = new AdminLazyLoader();
            
            // Section Loader mit Navigation verbinden
            this.navigation.setSectionLoader(this.sectionLoader);
            
            // Performance Monitoring starten
            this.performanceMonitor.startMonitoring();
            
            // Lazy Loading initialisieren
            this.lazyLoader.init();
            
            // Routes registrieren
            this.registerRoutes();
            
            // Sections initialisieren
            this.initializeSections();
            
            // Navigation starten
            this.navigation.handleDirectLinks();
            
            this.initialized = true;
            console.log('Admin Application initialized successfully');
            
            // Global verfügbar machen
            window.AdminApp = this;
            
        } catch (error) {
            console.error('Failed to initialize Admin Application:', error);
            this.handleInitializationError(error);
        }
    }
    
    /**
     * Routes registrieren
     */
    registerRoutes() {
        const routes = [
            { id: 'dashboard', template: 'admin/sections/dashboard.html', script: 'js/admin/sections/dashboard.js' },
            { id: 'api-keys', template: 'admin/sections/api-keys.html', script: 'js/admin/sections/api-keys.js' },
            { id: 'applications', template: 'admin/sections/applications.html', script: 'js/admin/sections/applications.js' },
            { id: 'media', template: 'admin/sections/media.html', script: 'js/admin/sections/media.js' },
            { id: 'content', template: 'admin/sections/content.html', script: 'js/admin/sections/content.js' },
            { id: 'nutrition', template: 'admin/sections/nutrition.html', script: 'js/admin/sections/nutrition.js' },
            { id: 'personal-training', template: 'admin/sections/personal-training.html', script: 'js/admin/sections/personal-training.js' },
            { id: 'translations', template: 'admin/sections/translations.html', script: 'js/admin/sections/translations.js' },
            { id: 'ai-twin', template: 'admin/sections/ai-twin.html', script: 'js/admin/sections/ai-twin.js' },
            { id: 'rentals', template: 'admin/sections/rentals.html', script: 'js/admin/sections/rentals.js' },
            { id: 'bookings', template: 'admin/sections/bookings.html', script: 'js/admin/sections/bookings.js' },
            { id: 'system-health', template: 'admin/sections/system-health.html', script: 'js/admin/sections/system-health.js' },
            { id: 'analytics', template: 'admin/sections/analytics.html', script: 'js/admin/sections/analytics.js' },
            { id: 'hero-about', template: 'admin/sections/hero-about.html', script: 'js/admin/sections/hero-about.js' },
            { id: 'settings', template: 'admin/sections/settings.html', script: 'js/admin/sections/settings.js' },
            
            // Persönlichkeitsentwicklung Methoden
            { id: 'ikigai', template: 'admin/sections/personality-methods/ikigai.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'raisec', template: 'admin/sections/personality-methods/raisec.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'values-clarification', template: 'admin/sections/personality-methods/values-clarification.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'strengths-analysis', template: 'admin/sections/personality-methods/strengths-analysis.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'goal-setting', template: 'admin/sections/personality-methods/goal-setting.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'mindfulness', template: 'admin/sections/personality-methods/mindfulness.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'emotional-intelligence', template: 'admin/sections/personality-methods/emotional-intelligence.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'habit-building', template: 'admin/sections/personality-methods/habit-building.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'gallup-strengths', template: 'admin/sections/personality-methods/gallup-strengths.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'via-strengths', template: 'admin/sections/personality-methods/via-strengths.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'self-assessment', template: 'admin/sections/personality-methods/self-assessment.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'johari-window', template: 'admin/sections/personality-methods/johari-window.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'nlp-dilts', template: 'admin/sections/personality-methods/nlp-dilts.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'five-pillars', template: 'admin/sections/personality-methods/five-pillars.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'harvard-method', template: 'admin/sections/personality-methods/harvard-method.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'moment-excellence', template: 'admin/sections/personality-methods/moment-excellence.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'nlp-meta-goal', template: 'admin/sections/personality-methods/nlp-meta-goal.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'nonviolent-communication', template: 'admin/sections/personality-methods/nonviolent-communication.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'resource-analysis', template: 'admin/sections/personality-methods/resource-analysis.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'rafael-method', template: 'admin/sections/personality-methods/rafael-method.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'walt-disney', template: 'admin/sections/personality-methods/walt-disney.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'aek-communication', template: 'admin/sections/personality-methods/aek-communication.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'change-stages', template: 'admin/sections/personality-methods/change-stages.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'circular-interview', template: 'admin/sections/personality-methods/circular-interview.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'communication', template: 'admin/sections/personality-methods/communication.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'competence-map', template: 'admin/sections/personality-methods/competence-map.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'conflict-escalation', template: 'admin/sections/personality-methods/conflict-escalation.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'rubikon-model', template: 'admin/sections/personality-methods/rubikon-model.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'solution-focused', template: 'admin/sections/personality-methods/solution-focused.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'systemic-coaching', template: 'admin/sections/personality-methods/systemic-coaching.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'target-coaching', template: 'admin/sections/personality-methods/target-coaching.html', script: 'js/admin/sections/personality-methods.js' },
            { id: 'all-methods', template: 'admin/sections/personality-methods/all-methods.html', script: 'js/admin/sections/personality-methods.js' }
        ];
        
        routes.forEach(route => {
            this.navigation.registerRoute(route.id, {
                template: route.template,
                script: route.script,
                preload: this.shouldPreload(route.id)
            });
        });
    }
    
    /**
     * Prüfen ob Section preload werden soll
     */
    shouldPreload(sectionId) {
        const preloadSections = ['dashboard', 'api-keys', 'applications', 'media'];
        return preloadSections.includes(sectionId);
    }
    
    /**
     * Sections initialisieren
     */
    initializeSections() {
        // Dashboard Section
        this.sections.dashboard = new DashboardSection();
        
        // Content Section
        this.sections.content = new ContentSection();
        
        // Nutrition Section
        this.sections.nutrition = new NutritionSection();
        
        // Personal Training Section
        this.sections.personalTraining = new PersonalTrainingSection();
        
        // Translations Section
        this.sections.translations = new TranslationsSection();
        
        // API Keys Section
        this.sections.apiKeys = new ApiKeysSection();
        
        // Applications Section
        this.sections.applications = new ApplicationsSection();
        
        // Media Section
        this.sections.media = new MediaSection();
        
        // Personality Methods Section
        this.sections.personalityMethods = new PersonalityMethodsSection();
        
        // Weitere Sections werden lazy geladen
        console.log('Sections initialized');
    }
    
    /**
     * Initialization Error Handler
     */
    handleInitializationError(error) {
        console.error('Admin Application initialization failed:', error);
        
        // Fallback: Redirect zu Backup
        if (confirm('Fehler beim Laden des Admin Panels. Zur Backup-Version wechseln?')) {
            window.location.href = 'admin-backup.html';
        }
    }
    
    /**
     * Section laden
     */
    async loadSection(sectionId) {
        try {
            await this.navigation.navigateToSection(sectionId);
        } catch (error) {
            console.error(`Failed to load section ${sectionId}:`, error);
            this.stateManager.addNotification({
                type: 'error',
                title: 'Section Loading Error',
                message: `Failed to load ${sectionId}`,
                duration: 5000
            });
        }
    }
    
    /**
     * Application Status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            currentSection: this.stateManager?.getState('currentSection'),
            loadedSections: Array.from(this.stateManager?.getState('loadedSections') || []),
            cacheStatus: this.sectionLoader?.getCacheStatus()
        };
    }
    
    /**
     * Application zurücksetzen
     */
    reset() {
        this.stateManager?.reset();
        this.sectionLoader?.clearCache();
        this.sections = {};
        this.initialized = false;
    }
}

// Global verfügbar machen
window.AdminApplication = AdminApplication;
