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
     * Navigation zu Section
     */
    async navigateToSection(sectionId) {
        try {
            // Middleware ausführen
            for (const middleware of this.middleware) {
                const result = await middleware(sectionId);
                if (result === false) return; // Navigation abgebrochen
            }
            
            // Section laden
            await this.loadSection(sectionId);
            
            // State aktualisieren
            this.stateManager.markSectionLoaded(sectionId);
            this.currentSection = sectionId;
            
            // URL aktualisieren (ohne Hash-Change zu triggern)
            const newUrl = `${window.location.pathname}#${sectionId}`;
            if (window.location.href !== newUrl) {
                window.history.pushState(null, '', newUrl);
            }
            
            // Event dispatchen
            this.dispatchNavigationEvent(sectionId);
            
        } catch (error) {
            console.error(`Failed to navigate to section ${sectionId}:`, error);
            this.handleNavigationError(sectionId, error);
        }
    }
    
    /**
     * Section laden
     */
    async loadSection(sectionId) {
        if (!this.sectionLoader) {
            throw new Error('Section loader not set');
        }
        
        const route = this.routes.get(sectionId);
        if (!route) {
            throw new Error(`Route not found for section: ${sectionId}`);
        }
        
        // Section laden mit Route
        const result = await this.sectionLoader.loadSection(sectionId, route);
        
        // Content in DOM einfügen
        const container = document.getElementById('admin-content');
        if (container) {
            container.innerHTML = result.template;
            container.setAttribute('data-section', sectionId);
        }
        
        // Section als geladen markieren
        this.stateManager.setState('currentSection', sectionId);
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
