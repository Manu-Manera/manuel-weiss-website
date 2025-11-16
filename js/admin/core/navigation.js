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
            console.log('🚀 Navigating to section:', sectionId);
            
            // State sofort aktualisieren
            this.stateManager.setState('currentSection', sectionId);
            this.currentSection = sectionId;
            
            // URL sofort aktualisieren
            const newUrl = `${window.location.pathname}#${sectionId}`;
            if (window.location.href !== newUrl) {
                window.history.pushState(null, '', newUrl);
            }
            
            // Event dispatchen
            this.dispatchNavigationEvent(sectionId);
            
            // Section laden (mit Timeout)
            try {
                await Promise.race([
                    this.loadSection(sectionId),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation timeout (5s)')), 5000))
                ]);
            } catch (loadError) {
                console.error(`Error loading section ${sectionId}:`, loadError);
                this.handleNavigationError(sectionId, loadError);
            }
            
            console.log('✅ Navigation completed:', sectionId);
            
        } catch (error) {
            console.error(`❌ Failed to navigate to section ${sectionId}:`, error);
            this.handleNavigationError(sectionId, error);
        }
    }
    
    /**
     * Section laden (mit Timeout-Protection)
     */
    async loadSection(sectionId) {
        console.log('Loading section:', sectionId);
        
        try {
            if (!this.sectionLoader) {
                throw new Error('Section loader not set');
            }
            
            const route = this.routes.get(sectionId);
            if (!route) {
                throw new Error(`Route not found for section: ${sectionId}`);
            }
            
            console.log('Route found:', route);
            
            // Section laden mit Route (mit Timeout)
            const loadPromise = this.sectionLoader.loadSection(sectionId, route);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Section load timeout (5s)')), 5000)
            );
            
            const result = await Promise.race([loadPromise, timeoutPromise]);
            
            console.log('Section loaded, template length:', result.template.length);
            
            // Content in DOM einfügen
            const container = document.getElementById('admin-content');
            if (container) {
                container.innerHTML = result.template;
                container.setAttribute('data-section', sectionId);
                console.log('Content inserted into DOM');
            } else {
                console.error('Admin content container not found');
                throw new Error('Admin content container not found');
            }
            
            // Section-spezifische Initialisierung (non-blocking)
            this.initializeSection(sectionId);
            
        } catch (error) {
            console.error(`Error loading section ${sectionId}:`, error);
            // Zeige Fehlermeldung im Container
            const container = document.getElementById('admin-content');
            if (container) {
                container.innerHTML = `
                    <div class="error-message" style="padding: 2rem; text-align: center; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p><strong>Fehler beim Laden der Section</strong></p>
                        <p style="font-size: 0.9rem; color: #64748b; margin-top: 0.5rem;">${error.message}</p>
                        <button class="btn btn-outline" onclick="window.AdminApp?.navigation?.navigateToSection('${sectionId}')" style="margin-top: 1rem;">
                            <i class="fas fa-sync"></i> Erneut versuchen
                        </button>
                    </div>
                `;
            }
            throw error;
        }
    }
    
    /**
     * Section-spezifische Initialisierung (komplett non-blocking)
     */
    initializeSection(sectionId) {
        console.log('Initializing section:', sectionId);
        
        // Initialisierung mit längerer Verzögerung, um sicherzustellen, dass DOM bereit ist
        setTimeout(() => {
            try {
                // Hero-About Section spezifische Initialisierung
                if (sectionId === 'hero-about') {
                    if (window.HeroAboutSection && !window.heroAboutSection) {
                        console.log('Initializing HeroAboutSection');
                        window.heroAboutSection = new window.HeroAboutSection();
                        // Non-blocking
                        window.heroAboutSection.init().catch(err => {
                            console.error('Error initializing HeroAboutSection:', err);
                        });
                    }
                }
                
                // Website Users Section spezifische Initialisierung
                if (sectionId === 'website-users') {
                    if (window.WebsiteUsersManagement) {
                        const websiteUsers = window.AdminApp?.sections?.websiteUsers || new window.WebsiteUsersManagement();
                        if (!websiteUsers.isInitialized && !websiteUsers.isInitializing) {
                            console.log('Initializing WebsiteUsersManagement');
                            // Non-blocking - läuft komplett im Hintergrund
                            websiteUsers.init().catch(err => {
                                console.error('Error initializing WebsiteUsersManagement:', err);
                            });
                        }
                        if (window.AdminApp && !window.AdminApp.sections.websiteUsers) {
                            window.AdminApp.sections.websiteUsers = websiteUsers;
                        }
                    }
                }
                
                // User Management Section spezifische Initialisierung
                if (sectionId === 'user-management') {
                    if (window.AdminUserManagement) {
                        const userManagement = window.AdminApp?.sections?.userManagement || new window.AdminUserManagement();
                        if (!userManagement.isInitialized && !userManagement.isInitializing) {
                            console.log('Initializing AdminUserManagement');
                            // Non-blocking - läuft komplett im Hintergrund
                            userManagement.init().catch(err => {
                                console.error('Error initializing AdminUserManagement:', err);
                            });
                        }
                        if (window.AdminApp && !window.AdminApp.sections.userManagement) {
                            window.AdminApp.sections.userManagement = userManagement;
                        }
                    }
                }
            } catch (error) {
                console.error(`Error in initializeSection for ${sectionId}:`, error);
            }
        }, 200); // Längere Verzögerung für sichereres DOM-Rendering
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
