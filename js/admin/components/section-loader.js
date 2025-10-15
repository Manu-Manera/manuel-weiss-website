/**
 * Admin Panel Section Loader
 * Template und Script Loading mit Caching und Performance-Optimierung
 */
class AdminSectionLoader {
    constructor() {
        this.templateCache = new Map();
        this.scriptCache = new Map();
        this.loadingPromises = new Map();
        this.basePath = '';
        this.preloadQueue = new Set();
        this.performanceMetrics = {
            loadTimes: new Map(),
            cacheHits: 0,
            cacheMisses: 0
        };
        this.preloadPriority = [
            'dashboard',
            'api-keys',
            'applications',
            'media'
        ];
    }
    
    /**
     * Template laden mit Performance-Monitoring
     */
    async loadTemplate(templatePath) {
        const startTime = performance.now();
        const fullPath = this.basePath + templatePath;
        
        // Cache prüfen
        if (this.templateCache.has(fullPath)) {
            this.performanceMetrics.cacheHits++;
            return this.templateCache.get(fullPath);
        }
        
        this.performanceMetrics.cacheMisses++;
        
        // Loading Promise prüfen
        if (this.loadingPromises.has(fullPath)) {
            return this.loadingPromises.get(fullPath);
        }
        
        // Template laden
        const loadingPromise = this.fetchTemplate(fullPath);
        this.loadingPromises.set(fullPath, loadingPromise);
        
        try {
            const content = await loadingPromise;
            this.templateCache.set(fullPath, content);
            this.loadingPromises.delete(fullPath);
            
            // Performance-Metriken speichern
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.loadTimes.set(templatePath, loadTime);
            
            return content;
        } catch (error) {
            this.loadingPromises.delete(fullPath);
            throw error;
        }
    }
    
    /**
     * Template von Server laden
     */
    async fetchTemplate(templatePath) {
        try {
            const response = await fetch(templatePath, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            
            // Template validieren
            if (!content.trim()) {
                throw new Error('Empty template content');
            }
            
            return content;
            
        } catch (error) {
            console.error(`Failed to load template ${templatePath}:`, error);
            throw new Error(`Template loading failed: ${error.message}`);
        }
    }
    
    /**
     * Script laden
     */
    async loadScript(scriptPath, sectionId) {
        const fullPath = this.basePath + scriptPath;
        
        // Cache prüfen
        if (this.scriptCache.has(fullPath)) {
            return this.scriptCache.get(fullPath);
        }
        
        // Loading Promise prüfen
        if (this.loadingPromises.has(fullPath)) {
            return this.loadingPromises.get(fullPath);
        }
        
        // Script laden
        const loadingPromise = this.fetchScript(fullPath, sectionId);
        this.loadingPromises.set(fullPath, loadingPromise);
        
        try {
            const result = await loadingPromise;
            this.scriptCache.set(fullPath, result);
            this.loadingPromises.delete(fullPath);
            return result;
        } catch (error) {
            this.loadingPromises.delete(fullPath);
            throw error;
        }
    }
    
    /**
     * Script von Server laden und ausführen
     */
    async fetchScript(scriptPath, sectionId) {
        try {
            const response = await fetch(scriptPath, {
                method: 'GET',
                headers: {
                    'Accept': 'application/javascript',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const scriptContent = await response.text();
            
            // Script nicht ausführen, nur zurückgeben
            // Das Script wird von der Section selbst verwaltet
            console.log(`Script loaded for section ${sectionId}: ${scriptPath}`);
            
            return true;
            
        } catch (error) {
            console.error(`Failed to load script ${scriptPath}:`, error);
            throw new Error(`Script loading failed: ${error.message}`);
        }
    }
    
    /**
     * Cache leeren
     */
    clearCache() {
        this.templateCache.clear();
        this.scriptCache.clear();
        this.loadingPromises.clear();
    }
    
    /**
     * Template aus Cache entfernen
     */
    removeTemplateFromCache(templatePath) {
        const fullPath = this.basePath + templatePath;
        this.templateCache.delete(fullPath);
    }
    
    /**
     * Script aus Cache entfernen
     */
    removeScriptFromCache(scriptPath) {
        const fullPath = this.basePath + scriptPath;
        this.scriptCache.delete(fullPath);
    }
    
    /**
     * Cache Status abrufen
     */
    getCacheStatus() {
        return {
            templates: this.templateCache.size,
            scripts: this.scriptCache.size,
            loading: this.loadingPromises.size
        };
    }
    
    /**
     * Preload Template
     */
    async preloadTemplate(templatePath) {
        try {
            await this.loadTemplate(templatePath);
            return true;
        } catch (error) {
            console.warn(`Preload failed for ${templatePath}:`, error);
            return false;
        }
    }
    
    /**
     * Preload Script
     */
    async preloadScript(scriptPath) {
        try {
            await this.loadScript(scriptPath, 'preload');
            return true;
        } catch (error) {
            console.warn(`Preload failed for ${scriptPath}:`, error);
            return false;
        }
    }
    
    /**
     * Batch Preload
     */
    async preloadBatch(items) {
        const results = await Promise.allSettled(
            items.map(item => {
                if (item.type === 'template') {
                    return this.preloadTemplate(item.path);
                } else if (item.type === 'script') {
                    return this.preloadScript(item.path);
                }
                return Promise.resolve(false);
            })
        );
        
        return results.map((result, index) => ({
            item: items[index],
            success: result.status === 'fulfilled' && result.value,
            error: result.status === 'rejected' ? result.reason : null
        }));
    }
    
    /**
     * Base Path setzen
     */
    setBasePath(path) {
        this.basePath = path.endsWith('/') ? path : path + '/';
    }
    
    /**
     * Template existiert
     */
    async templateExists(templatePath) {
        try {
            const response = await fetch(this.basePath + templatePath, {
                method: 'HEAD'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
    
    /**
     * Script existiert
     */
    async scriptExists(scriptPath) {
        try {
            const response = await fetch(this.basePath + scriptPath, {
                method: 'HEAD'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
    
    /**
     * Section laden mit Preloading
     */
    async loadSection(sectionId, route = null) {
        try {
            let templatePath, scriptPath;
            
            if (route) {
                // Route-basierte Pfade verwenden
                templatePath = route.template;
                scriptPath = route.script;
            } else {
                // Fallback zu Standard-Pfaden
                templatePath = `admin/sections/${sectionId}.html`;
                scriptPath = `js/admin/sections/${sectionId}.js`;
            }
            
            // Template und Script parallel laden
            const [templateContent, scriptContent] = await Promise.all([
                this.loadTemplate(templatePath),
                this.loadScript(scriptPath, sectionId)
            ]);
            
            // Preload verwandte Sections
            this.preloadRelatedSections(sectionId);
            
            return {
                template: templateContent,
                script: scriptContent
            };
            
        } catch (error) {
            console.error(`Failed to load section ${sectionId}:`, error);
            throw error;
        }
    }
    
    /**
     * Verwandte Sections preloaden
     */
    async preloadRelatedSections(currentSectionId) {
        const relatedSections = this.getRelatedSections(currentSectionId);
        
        // Preload im Hintergrund
        relatedSections.forEach(sectionId => {
            if (!this.preloadQueue.has(sectionId)) {
                this.preloadQueue.add(sectionId);
                this.preloadSection(sectionId);
            }
        });
    }
    
    /**
     * Verwandte Sections ermitteln
     */
    getRelatedSections(sectionId) {
        const relations = {
            'dashboard': ['applications', 'api-keys'],
            'api-keys': ['dashboard', 'applications'],
            'applications': ['dashboard', 'media'],
            'media': ['applications', 'content'],
            'content': ['media', 'translations'],
            'translations': ['content', 'settings'],
            'settings': ['translations', 'system-health']
        };
        
        return relations[sectionId] || [];
    }
    
    /**
     * Section preloaden
     */
    async preloadSection(sectionId) {
        try {
            await Promise.all([
                this.loadTemplate(`admin/sections/${sectionId}.html`),
                this.loadScript(`js/admin/sections/${sectionId}.js`, sectionId)
            ]);
            console.log(`Preloaded section: ${sectionId}`);
        } catch (error) {
            console.warn(`Preload failed for ${sectionId}:`, error);
        }
    }
    
    /**
     * Prioritäts-Sections preloaden
     */
    async preloadPrioritySections() {
        const preloadPromises = this.preloadPriority.map(sectionId => 
            this.preloadSection(sectionId).catch(err => 
                console.warn(`Priority preload failed for ${sectionId}:`, err)
            )
        );
        
        await Promise.allSettled(preloadPromises);
    }
    
    /**
     * Performance-Metriken abrufen
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            cacheHitRate: this.performanceMetrics.cacheHits / 
                (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100,
            averageLoadTime: Array.from(this.performanceMetrics.loadTimes.values())
                .reduce((a, b) => a + b, 0) / this.performanceMetrics.loadTimes.size
        };
    }
    
    /**
     * Performance-Metriken zurücksetzen
     */
    resetPerformanceMetrics() {
        this.performanceMetrics.loadTimes.clear();
        this.performanceMetrics.cacheHits = 0;
        this.performanceMetrics.cacheMisses = 0;
    }
}

// Global verfügbar machen
window.AdminSectionLoader = AdminSectionLoader;
