/**
 * Admin Panel State Manager
 * Zentrale Verwaltung des Application State
 */
class AdminStateManager {
    constructor() {
        this.state = {
            currentSection: 'dashboard',
            sidebarCollapsed: false,
            user: {
                name: 'Manuel Weiss',
                avatar: 'MW'
            },
            notifications: [],
            settings: {},
            loadedSections: new Set(),
            apiKeys: {},
            media: {
                selected: [],
                uploadProgress: 0
            }
        };
        
        this.listeners = new Map();
        this.loadFromStorage();
    }
    
    /**
     * State abrufen
     */
    getState(path = null) {
        if (!path) return this.state;
        
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }
    
    /**
     * State setzen
     */
    setState(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.state);
        
        target[lastKey] = value;
        this.notifyListeners(path, value);
        this.saveToStorage();
    }
    
    /**
     * Event Listener hinzufügen
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        // Sofortigen Wert senden
        const currentValue = this.getState(path);
        if (currentValue !== undefined) {
            callback(currentValue);
        }
    }
    
    /**
     * Event Listener entfernen
     */
    unsubscribe(path, callback) {
        const listeners = this.listeners.get(path);
        if (listeners) {
            listeners.delete(callback);
        }
    }
    
    /**
     * Listeners benachrichtigen
     */
    notifyListeners(path, value) {
        const listeners = this.listeners.get(path);
        if (listeners) {
            listeners.forEach(callback => callback(value));
        }
    }
    
    /**
     * LocalStorage laden - Cookie-sichere Version
     */
    loadFromStorage() {
        try {
            // Prüfen ob localStorage verfügbar ist
            if (!this.isLocalStorageAvailable()) {
                console.warn('LocalStorage not available, using memory state');
                return;
            }
            
            const saved = localStorage.getItem('admin_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Nur sichere State-Teile laden, um Cookie-Konflikte zu vermeiden
                this.state = { 
                    ...this.state, 
                    currentSection: parsed.currentSection || 'dashboard',
                    sidebarCollapsed: parsed.sidebarCollapsed || false,
                    user: parsed.user || this.state.user,
                    notifications: parsed.notifications || [],
                    settings: parsed.settings || {}
                };
                
                // LoadedSections als Set wiederherstellen
                if (parsed.loadedSections && Array.isArray(parsed.loadedSections)) {
                    this.state.loadedSections = new Set(parsed.loadedSections);
                }
                
                console.log('✅ Admin state loaded from storage');
            }
        } catch (error) {
            console.warn('Failed to load state from storage:', error);
            // Bei Fehlern: State zurücksetzen
            this.reset();
        }
    }
    
    /**
     * LocalStorage speichern - Cookie-sichere Version
     */
    saveToStorage() {
        try {
            // Prüfen ob localStorage verfügbar ist
            if (!this.isLocalStorageAvailable()) {
                console.warn('LocalStorage not available, state not saved');
                return;
            }
            
            // Nur sichere State-Teile speichern, um Cookie-Konflikte zu vermeiden
            const safeState = {
                currentSection: this.state.currentSection,
                sidebarCollapsed: this.state.sidebarCollapsed,
                user: this.state.user,
                notifications: this.state.notifications.slice(0, 10), // Nur letzte 10 Notifications
                settings: this.state.settings,
                loadedSections: Array.from(this.state.loadedSections)
            };
            
            localStorage.setItem('admin_state', JSON.stringify(safeState));
            console.log('✅ Admin state saved to storage');
        } catch (error) {
            console.warn('Failed to save state to storage:', error);
        }
    }
    
    /**
     * LocalStorage Verfügbarkeit prüfen
     */
    isLocalStorageAvailable() {
        try {
            const test = '__admin_localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Section als geladen markieren
     */
    markSectionLoaded(sectionId) {
        this.state.loadedSections.add(sectionId);
        this.setState('currentSection', sectionId);
    }
    
    /**
     * Prüfen ob Section geladen ist
     */
    isSectionLoaded(sectionId) {
        return this.state.loadedSections.has(sectionId);
    }
    
    /**
     * API Keys State verwalten
     */
    setApiKey(service, key, value) {
        if (!this.state.apiKeys[service]) {
            this.state.apiKeys[service] = {};
        }
        this.state.apiKeys[service][key] = value;
        this.notifyListeners(`apiKeys.${service}.${key}`, value);
        this.saveToStorage();
    }
    
    getApiKey(service, key) {
        return this.state.apiKeys[service]?.[key];
    }
    
    /**
     * Notification hinzufügen
     */
    addNotification(notification) {
        const id = Date.now().toString();
        const newNotification = {
            id,
            timestamp: new Date(),
            ...notification
        };
        
        this.state.notifications.unshift(newNotification);
        this.notifyListeners('notifications', this.state.notifications);
        
        // Auto-remove nach 5 Sekunden
        setTimeout(() => {
            this.removeNotification(id);
        }, 5000);
    }
    
    /**
     * Notification entfernen
     */
    removeNotification(id) {
        this.state.notifications = this.state.notifications.filter(n => n.id !== id);
        this.notifyListeners('notifications', this.state.notifications);
    }
    
    /**
     * State zurücksetzen
     */
    reset() {
        this.state = {
            currentSection: 'dashboard',
            sidebarCollapsed: false,
            user: {
                name: 'Manuel Weiss',
                avatar: 'MW'
            },
            notifications: [],
            settings: {},
            loadedSections: new Set(),
            apiKeys: {},
            media: {
                selected: [],
                uploadProgress: 0
            }
        };
        this.saveToStorage();
    }
}

// Global verfügbar machen
window.AdminStateManager = AdminStateManager;
