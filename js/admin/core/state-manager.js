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
     * LocalStorage laden
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('admin_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load state from storage:', error);
        }
    }
    
    /**
     * LocalStorage speichern
     */
    saveToStorage() {
        try {
            localStorage.setItem('admin_state', JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save state to storage:', error);
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
