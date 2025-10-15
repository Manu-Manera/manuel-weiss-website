/**
 * Admin Panel Section Loader
 * Template und Script Loading mit Caching
 */
class AdminSectionLoader {
    constructor() {
        this.templateCache = new Map();
        this.scriptCache = new Map();
        this.loadingPromises = new Map();
        this.basePath = '';
    }
    
    /**
     * Template laden
     */
    async loadTemplate(templatePath) {
        const fullPath = this.basePath + templatePath;
        
        // Cache prüfen
        if (this.templateCache.has(fullPath)) {
            return this.templateCache.get(fullPath);
        }
        
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
            
            // Script ausführen
            const script = document.createElement('script');
            script.textContent = scriptContent;
            script.setAttribute('data-section', sectionId);
            script.setAttribute('data-script-path', scriptPath);
            
            document.head.appendChild(script);
            
            // Cleanup nach Ausführung
            setTimeout(() => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }, 100);
            
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
}

// Global verfügbar machen
window.AdminSectionLoader = AdminSectionLoader;
