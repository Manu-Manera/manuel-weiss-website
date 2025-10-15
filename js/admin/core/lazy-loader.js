/**
 * Lazy Loader
 * Intelligentes Lazy Loading für Admin Panel Sections
 */
class AdminLazyLoader {
    constructor() {
        this.intersectionObserver = null;
        this.loadedSections = new Set();
        this.pendingSections = new Map();
        this.preloadThreshold = 0.1; // 10% sichtbar = preload
        this.loadThreshold = 0.5; // 50% sichtbar = load
        this.maxConcurrentLoads = 3;
        this.currentLoads = 0;
    }
    
    /**
     * Lazy Loading initialisieren
     */
    init() {
        this.setupIntersectionObserver();
        this.setupPreloadStrategy();
        this.setupLoadBalancing();
    }
    
    /**
     * Intersection Observer einrichten
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    root: null,
                    rootMargin: '50px',
                    threshold: [this.preloadThreshold, this.loadThreshold]
                }
            );
        }
    }
    
    /**
     * Intersection Events behandeln
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            const sectionId = entry.target.dataset.sectionId;
            
            if (!sectionId) return;
            
            if (entry.intersectionRatio >= this.loadThreshold) {
                this.loadSection(sectionId);
            } else if (entry.intersectionRatio >= this.preloadThreshold) {
                this.preloadSection(sectionId);
            }
        });
    }
    
    /**
     * Section beobachten
     */
    observeSection(element) {
        if (this.intersectionObserver) {
            this.intersectionObserver.observe(element);
        }
    }
    
    /**
     * Section nicht mehr beobachten
     */
    unobserveSection(element) {
        if (this.intersectionObserver) {
            this.intersectionObserver.unobserve(element);
        }
    }
    
    /**
     * Section laden
     */
    async loadSection(sectionId) {
        if (this.loadedSections.has(sectionId)) {
            return; // Bereits geladen
        }
        
        if (this.currentLoads >= this.maxConcurrentLoads) {
            // In Queue einreihen
            this.pendingSections.set(sectionId, 'load');
            return;
        }
        
        this.currentLoads++;
        this.loadedSections.add(sectionId);
        
        try {
            if (window.AdminApp && window.AdminApp.sectionLoader) {
                await window.AdminApp.sectionLoader.loadSection(sectionId);
                console.log(`Lazy loaded section: ${sectionId}`);
            }
        } catch (error) {
            console.error(`Failed to lazy load section ${sectionId}:`, error);
            this.loadedSections.delete(sectionId);
        } finally {
            this.currentLoads--;
            this.processPendingSections();
        }
    }
    
    /**
     * Section preloaden
     */
    async preloadSection(sectionId) {
        if (this.loadedSections.has(sectionId) || this.pendingSections.has(sectionId)) {
            return; // Bereits geladen oder in Queue
        }
        
        this.pendingSections.set(sectionId, 'preload');
        
        try {
            if (window.AdminApp && window.AdminApp.sectionLoader) {
                await window.AdminApp.sectionLoader.preloadSection(sectionId);
                console.log(`Preloaded section: ${sectionId}`);
            }
        } catch (error) {
            console.warn(`Failed to preload section ${sectionId}:`, error);
        } finally {
            this.pendingSections.delete(sectionId);
        }
    }
    
    /**
     * Ausstehende Sections verarbeiten
     */
    processPendingSections() {
        if (this.currentLoads >= this.maxConcurrentLoads) {
            return;
        }
        
        const nextSection = this.pendingSections.entries().next().value;
        if (nextSection) {
            const [sectionId, action] = nextSection;
            this.pendingSections.delete(sectionId);
            
            if (action === 'load') {
                this.loadSection(sectionId);
            } else if (action === 'preload') {
                this.preloadSection(sectionId);
            }
        }
    }
    
    /**
     * Preload-Strategie einrichten
     */
    setupPreloadStrategy() {
        // Preload basierend auf User-Verhalten
        this.setupUserBehaviorPreloading();
        
        // Preload basierend auf Zeit
        this.setupTimeBasedPreloading();
        
        // Preload basierend auf Gerät
        this.setupDeviceBasedPreloading();
    }
    
    /**
     * User-Verhalten basiertes Preloading
     */
    setupUserBehaviorPreloading() {
        // Häufig besuchte Sections preloaden
        const frequentSections = this.getFrequentSections();
        frequentSections.forEach(sectionId => {
            setTimeout(() => this.preloadSection(sectionId), 1000);
        });
    }
    
    /**
     * Häufig besuchte Sections ermitteln
     */
    getFrequentSections() {
        const visits = JSON.parse(localStorage.getItem('admin_section_visits') || '{}');
        return Object.entries(visits)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([sectionId]) => sectionId);
    }
    
    /**
     * Zeit-basiertes Preloading
     */
    setupTimeBasedPreloading() {
        // Preload nach 5 Sekunden Inaktivität
        let inactivityTimer;
        
        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                this.preloadIdleSections();
            }, 5000);
        };
        
        ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });
        
        resetTimer();
    }
    
    /**
     * Inaktive Sections preloaden
     */
    preloadIdleSections() {
        const idleSections = ['content', 'translations', 'settings'];
        idleSections.forEach(sectionId => {
            if (!this.loadedSections.has(sectionId)) {
                this.preloadSection(sectionId);
            }
        });
    }
    
    /**
     * Gerät-basiertes Preloading
     */
    setupDeviceBasedPreloading() {
        const connection = navigator.connection;
        const deviceMemory = navigator.deviceMemory;
        
        // Anpassung basierend auf Geräteleistung
        if (connection && connection.effectiveType === 'slow-2g') {
            this.maxConcurrentLoads = 1;
            this.preloadThreshold = 0.3;
        } else if (deviceMemory && deviceMemory < 4) {
            this.maxConcurrentLoads = 2;
        } else {
            this.maxConcurrentLoads = 3;
        }
    }
    
    /**
     * Load Balancing einrichten
     */
    setupLoadBalancing() {
        // Load Balancing basierend auf Netzwerk
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            connection.addEventListener('change', () => {
                this.adjustLoadStrategy(connection);
            });
            
            this.adjustLoadStrategy(connection);
        }
    }
    
    /**
     * Load-Strategie anpassen
     */
    adjustLoadStrategy(connection) {
        switch (connection.effectiveType) {
            case 'slow-2g':
                this.maxConcurrentLoads = 1;
                this.preloadThreshold = 0.5;
                break;
            case '2g':
                this.maxConcurrentLoads = 2;
                this.preloadThreshold = 0.3;
                break;
            case '3g':
                this.maxConcurrentLoads = 3;
                this.preloadThreshold = 0.2;
                break;
            case '4g':
                this.maxConcurrentLoads = 4;
                this.preloadThreshold = 0.1;
                break;
        }
    }
    
    /**
     * Section-Statistiken
     */
    getStats() {
        return {
            loadedSections: Array.from(this.loadedSections),
            pendingSections: Array.from(this.pendingSections.keys()),
            currentLoads: this.currentLoads,
            maxConcurrentLoads: this.maxConcurrentLoads
        };
    }
    
    /**
     * Cleanup
     */
    cleanup() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.loadedSections.clear();
        this.pendingSections.clear();
        this.currentLoads = 0;
    }
}

// Global verfügbar machen
window.AdminLazyLoader = AdminLazyLoader;
