/**
 * Admin Panel Navigation System
 * Hash-basierter Router für Section-Navigation
 */
class AdminNavigation {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.currentSection = null;
        this.sectionLoader = null;
        this.routes = new Map();
        this.middleware = [];
        
        this.init();
    }
    
    /**
     * Navigation initialisieren
     */
    init() {
        // Hash change listener
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
        
        // Initial load
        this.handleHashChange();
        
        // Legacy function support
        window.navigateToSection = (sectionId) => {
            this.navigateToSection(sectionId);
        };
    }
    
    /**
     * Section Loader setzen
     */
    setSectionLoader(loader) {
        this.sectionLoader = loader;
    }
    
    /**
     * Route registrieren
     */
    registerRoute(sectionId, options = {}) {
        this.routes.set(sectionId, {
            template: options.template || `admin/sections/${sectionId}.html`,
            script: options.script || `js/admin/sections/${sectionId}.js`,
            preload: options.preload || false,
            ...options
        });
    }
    
    /**
     * Middleware hinzufügen
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    
    /**
     * Hash Change Handler
     */
    handleHashChange() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.navigateToSection(hash);
    }
    
    /**
     * Navigation zu Section - Cookie-sichere Version
     */
    async navigateToSection(sectionId) {
        try {
            console.log('🚀 Navigating to section:', sectionId);
            
            // Middleware ausführen
            for (const middleware of this.middleware) {
                const result = await middleware(sectionId);
                if (result === false) return; // Navigation abgebrochen
            }
            
            // Section laden
            await this.loadSection(sectionId);
            
            // State aktualisieren (ohne automatisches Speichern)
            this.stateManager.setState('currentSection', sectionId);
            this.currentSection = sectionId;
            
            // URL aktualisieren (ohne Hash-Change zu triggern)
            const newUrl = `${window.location.pathname}#${sectionId}`;
            if (window.location.href !== newUrl) {
                window.history.pushState(null, '', newUrl);
            }
            
            // Event dispatchen
            this.dispatchNavigationEvent(sectionId);
            
            console.log('✅ Navigation completed:', sectionId);
            
        } catch (error) {
            console.error(`❌ Failed to navigate to section ${sectionId}:`, error);
            this.handleNavigationError(sectionId, error);
        }
    }
    
    /**
     * Section laden
     */
    async loadSection(sectionId) {
        console.log('Loading section:', sectionId);
        
        if (!this.sectionLoader) {
            throw new Error('Section loader not set');
        }
        
        const route = this.routes.get(sectionId);
        if (!route) {
            throw new Error(`Route not found for section: ${sectionId}`);
        }
        
        console.log('Route found:', route);
        
        // Section laden mit Route
        const result = await this.sectionLoader.loadSection(sectionId, route);
        
        console.log('Section loaded, template length:', result.template.length);
        
        // Content in DOM einfügen
        const container = document.getElementById('admin-content');
        if (container) {
            container.innerHTML = result.template;
            container.setAttribute('data-section', sectionId);
            console.log('Content inserted into DOM');
        } else {
            console.error('Admin content container not found');
        }
        
        // Section als geladen markieren
        this.stateManager.setState('currentSection', sectionId);
        
        // Section-spezifische Initialisierung
        this.initializeSection(sectionId);
    }
    
    /**
     * Section-spezifische Initialisierung
     */
    initializeSection(sectionId) {
        console.log('Initializing section:', sectionId);
        
        // Hero-About Section spezifische Initialisierung
        if (sectionId === 'hero-about') {
            // Warten auf DOM Update
            setTimeout(() => {
                if (window.HeroAboutSection && !window.heroAboutSection) {
                    console.log('Initializing HeroAboutSection');
                    window.heroAboutSection = new window.HeroAboutSection();
                    window.heroAboutSection.init();
                }
            }, 100);
        }
        
        // Website Users Section spezifische Initialisierung
        if (sectionId === 'website-users') {
            setTimeout(() => {
                if (window.WebsiteUsersManagement) {
                    const websiteUsers = window.AdminApp?.sections?.websiteUsers || new window.WebsiteUsersManagement();
                    if (!websiteUsers.isInitialized) {
                        console.log('Initializing WebsiteUsersManagement');
                        websiteUsers.init();
                    }
                    if (window.AdminApp && !window.AdminApp.sections.websiteUsers) {
                        window.AdminApp.sections.websiteUsers = websiteUsers;
                    }
                }
            }, 100);
        }
        
        // User Management Section spezifische Initialisierung
        if (sectionId === 'user-management') {
            setTimeout(() => {
                if (window.AdminUserManagement) {
                    const userManagement = window.AdminApp?.sections?.userManagement || new window.AdminUserManagement();
                    if (!userManagement.isInitialized) {
                        console.log('Initializing AdminUserManagement');
                        userManagement.init();
                    }
                    if (window.AdminApp && !window.AdminApp.sections.userManagement) {
                        window.AdminApp.sections.userManagement = userManagement;
                    }
                }
            }, 100);
        }
    }
    
    /**
     * Navigation Event dispatchen
     */
    dispatchNavigationEvent(sectionId) {
        const event = new CustomEvent('admin:navigation', {
            detail: {
                sectionId,
                previousSection: this.currentSection
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Navigation Error Handler
     */
    handleNavigationError(sectionId, error) {
        console.error(`Navigation error for ${sectionId}:`, error);
        
        // Fallback zu Dashboard
        if (sectionId !== 'dashboard') {
            this.navigateToSection('dashboard');
        }
        
        // Error Notification
        this.stateManager.addNotification({
            type: 'error',
            title: 'Navigation Error',
            message: `Failed to load section: ${sectionId}`,
            duration: 5000
        });
    }
    
    /**
     * Aktuelle Section abrufen
     */
    getCurrentSection() {
        return this.currentSection;
    }
    
    /**
     * Verfügbare Routes abrufen
     */
    getRoutes() {
        return Array.from(this.routes.keys());
    }
    
    /**
     * Route existiert
     */
    hasRoute(sectionId) {
        return this.routes.has(sectionId);
    }
    
    /**
     * Browser Back/Forward Support
     */
    handleBrowserNavigation() {
        window.addEventListener('popstate', () => {
            this.handleHashChange();
        });
    }
    
    /**
     * Direct Link Support
     */
    handleDirectLinks() {
        // Prüfen ob Hash in URL vorhanden
        const hash = window.location.hash.substring(1);
        if (hash && this.hasRoute(hash)) {
            this.navigateToSection(hash);
        } else {
            this.navigateToSection('dashboard');
        }
    }
}

// Global verfügbar machen
window.AdminNavigation = AdminNavigation;
