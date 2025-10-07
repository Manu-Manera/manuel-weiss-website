// 🎯 Application Manager - Zentrale Orchestrierung aller Bewerbungsmodule
// Koordiniert Core, Upload, Dashboard, API und Validation für optimale Integration

import { createApplicationCore, APPLICATION_STATUS } from './ApplicationCore.js';
import { createUploadManager, UPLOAD_STATUS } from './UploadManager.js';
import { createDashboard } from './DashboardCore.js';
import { createApiManager } from './ApiManager.js';
import { createValidationEngine, VALIDATION_SEVERITY } from './ValidationEngine.js';

export class ApplicationManager {
    constructor(options = {}) {
        this.config = {
            container: options.container || '#application-manager',
            apiEndpoint: options.apiEndpoint || '/api/v1',
            enableRealTimeSync: options.enableRealTimeSync !== false,
            enableOfflineMode: options.enableOfflineMode !== false,
            enableValidation: options.enableValidation !== false,
            enableUpload: options.enableUpload !== false,
            enableDashboard: options.enableDashboard !== false,
            theme: options.theme || 'light',
            language: options.language || 'de',
            ...options
        };

        this.modules = {};
        this.isInitialized = false;
        this.observers = new Set();
        this.eventBridge = new EventTarget();
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing ApplicationManager...');
            
            // Initialize core modules in dependency order
            await this.initializeCore();
            await this.initializeApi();
            await this.initializeValidation();
            await this.initializeUpload();
            await this.initializeDashboard();
            
            // Setup inter-module communication
            this.setupModuleCommunication();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            this.isInitialized = true;
            
            console.log('✅ ApplicationManager initialized successfully');
            this.notifyObservers('initialized');
            
            // Initial data load
            await this.loadInitialData();
            
        } catch (error) {
            console.error('❌ ApplicationManager initialization failed:', error);
            this.notifyObservers('initializationFailed', error);
            throw error;
        }
    }

    async initializeCore() {
        console.log('📦 Initializing ApplicationCore...');
        
        this.modules.core = createApplicationCore({
            enableRealTimeSync: this.config.enableRealTimeSync,
            enableAnalytics: true,
            apiEndpoint: this.config.apiEndpoint
        });
        
        // Subscribe to core events
        this.modules.core.subscribe((event, data) => {
            this.handleCoreEvent(event, data);
        });
    }

    async initializeApi() {
        if (!this.config.enableRealTimeSync) return;
        
        console.log('🌐 Initializing ApiManager...');
        
        this.modules.api = createApiManager({
            baseUrl: this.config.apiEndpoint,
            enableCaching: true,
            enableOfflineMode: this.config.enableOfflineMode,
            enableRequestQueue: true
        });
        
        // Subscribe to API events
        this.modules.api.subscribe((event, data) => {
            this.handleApiEvent(event, data);
        });
        
        // Integrate API with Core
        this.integrateApiWithCore();
    }

    async initializeValidation() {
        if (!this.config.enableValidation) return;
        
        console.log('✅ Initializing ValidationEngine...');
        
        this.modules.validation = createValidationEngine({
            language: this.config.language,
            enableAsyncValidation: true,
            showRealTimeErrors: true
        });
        
        // Subscribe to validation events
        this.modules.validation.subscribe((event, data) => {
            this.handleValidationEvent(event, data);
        });
    }

    async initializeUpload() {
        if (!this.config.enableUpload) return;
        
        console.log('📤 Initializing UploadManager...');
        
        this.modules.upload = createUploadManager({
            maxFileSize: 50 * 1024 * 1024, // 50MB
            maxConcurrentUploads: 3,
            apiEndpoint: `${this.config.apiEndpoint}/upload`,
            awsConfig: this.config.awsConfig || {}
        });
        
        // Subscribe to upload events
        this.modules.upload.subscribe((event, data) => {
            this.handleUploadEvent(event, data);
        });
    }

    async initializeDashboard() {
        if (!this.config.enableDashboard) return;
        
        console.log('📊 Initializing Dashboard...');
        
        this.modules.dashboard = createDashboard(this.modules.core, {
            container: this.config.container,
            theme: this.config.theme,
            language: this.config.language,
            autoRefresh: this.config.enableRealTimeSync
        });
        
        // Subscribe to dashboard events
        this.modules.dashboard.subscribe((event, data) => {
            this.handleDashboardEvent(event, data);
        });
    }

    // 🔗 Module Integration
    integrateApiWithCore() {
        if (!this.modules.api || !this.modules.core) return;
        
        // Override core methods to use API
        const originalCreateApplication = this.modules.core.createApplication.bind(this.modules.core);
        this.modules.core.createApplication = async (data) => {
            try {
                const result = await this.modules.api.createApplication(data);
                return originalCreateApplication(result);
            } catch (error) {
                // Fallback to local storage
                console.warn('API create failed, using local storage:', error);
                return originalCreateApplication(data);
            }
        };
        
        const originalUpdateApplication = this.modules.core.updateApplication.bind(this.modules.core);
        this.modules.core.updateApplication = async (id, updates) => {
            try {
                const result = await this.modules.api.updateApplication(id, updates);
                return originalUpdateApplication(id, result);
            } catch (error) {
                console.warn('API update failed, using local storage:', error);
                return originalUpdateApplication(id, updates);
            }
        };
        
        const originalDeleteApplication = this.modules.core.deleteApplication.bind(this.modules.core);
        this.modules.core.deleteApplication = async (id) => {
            try {
                await this.modules.api.deleteApplication(id);
                return originalDeleteApplication(id);
            } catch (error) {
                console.warn('API delete failed, using local storage:', error);
                return originalDeleteApplication(id);
            }
        };
    }

    setupModuleCommunication() {
        // Create a communication bridge between modules
        this.eventBridge.addEventListener('applicationValidationRequested', async (event) => {
            if (this.modules.validation) {
                const { schemaName, data, callback } = event.detail;
                try {
                    const result = await this.modules.validation.validate(schemaName, data);
                    if (callback) callback(null, result);
                } catch (error) {
                    if (callback) callback(error);
                }
            }
        });

        this.eventBridge.addEventListener('fileUploadRequested', async (event) => {
            if (this.modules.upload) {
                const { file, options, callback } = event.detail;
                try {
                    const result = await this.modules.upload.uploadFile(file, options);
                    if (callback) callback(null, result);
                } catch (error) {
                    if (callback) callback(error);
                }
            }
        });
    }

    // 🎧 Event Handlers
    handleCoreEvent(event, data) {
        switch (event) {
            case 'applicationCreated':
                this.notifyObservers('applicationCreated', data);
                this.eventBridge.dispatchEvent(new CustomEvent('coreApplicationCreated', { detail: data }));
                break;
                
            case 'applicationUpdated':
                this.notifyObservers('applicationUpdated', data);
                this.eventBridge.dispatchEvent(new CustomEvent('coreApplicationUpdated', { detail: data }));
                break;
                
            case 'applicationDeleted':
                this.notifyObservers('applicationDeleted', data);
                this.eventBridge.dispatchEvent(new CustomEvent('coreApplicationDeleted', { detail: data }));
                break;
                
            default:
                // Forward all other events
                this.notifyObservers(event, data);
        }
    }

    handleApiEvent(event, data) {
        switch (event) {
            case 'networkOffline':
                this.showNotification('Verbindung unterbrochen. Arbeite offline.', 'warning');
                break;
                
            case 'networkOnline':
                this.showNotification('Verbindung wiederhergestellt.', 'success');
                break;
                
            case 'requestQueued':
                this.showNotification(`${data.queueLength} Anfragen wartend.`, 'info');
                break;
                
            default:
                this.notifyObservers(`api_${event}`, data);
        }
    }

    handleValidationEvent(event, data) {
        this.notifyObservers(`validation_${event}`, data);
    }

    handleUploadEvent(event, data) {
        switch (event) {
            case 'uploadStarted':
                this.showNotification(`Upload gestartet: ${data.file.name}`, 'info');
                break;
                
            case 'uploadCompleted':
                this.showNotification(`Upload abgeschlossen: ${data.file.name}`, 'success');
                break;
                
            case 'uploadFailed':
                this.showNotification(`Upload fehlgeschlagen: ${data.file.name}`, 'error');
                break;
                
            default:
                this.notifyObservers(`upload_${event}`, data);
        }
    }

    handleDashboardEvent(event, data) {
        this.notifyObservers(`dashboard_${event}`, data);
    }

    setupGlobalEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseRealTimeUpdates();
            } else {
                this.resumeRealTimeUpdates();
            }
        });

        // Handle window beforeunload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Handle errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.notifyObservers('globalError', event.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.notifyObservers('unhandledRejection', event.reason);
        });
    }

    // 🎯 Public API Methods

    // Application Management
    async createApplication(applicationData) {
        try {
            // Validate first if validation is enabled
            if (this.modules.validation) {
                const validation = await this.modules.validation.validate('application', applicationData);
                if (!validation.isValid) {
                    throw new ApplicationError('Validation failed', validation.errors);
                }
            }
            
            const application = await this.modules.core.createApplication(applicationData);
            return application;
        } catch (error) {
            this.handleError('createApplication', error);
            throw error;
        }
    }

    async updateApplication(id, updates) {
        try {
            if (this.modules.validation) {
                const validation = await this.modules.validation.validate('application', updates);
                if (!validation.isValid) {
                    throw new ApplicationError('Validation failed', validation.errors);
                }
            }
            
            const application = await this.modules.core.updateApplication(id, updates);
            return application;
        } catch (error) {
            this.handleError('updateApplication', error);
            throw error;
        }
    }

    async deleteApplication(id) {
        try {
            await this.modules.core.deleteApplication(id);
            return true;
        } catch (error) {
            this.handleError('deleteApplication', error);
            throw error;
        }
    }

    // File Management
    async uploadFile(file, category = 'documents') {
        try {
            if (!this.modules.upload) {
                throw new Error('Upload module not enabled');
            }
            
            // Validate file if validation is enabled
            if (this.modules.validation) {
                const validation = await this.modules.validation.validate('fileUpload', { file, category });
                if (!validation.isValid) {
                    throw new ApplicationError('File validation failed', validation.errors);
                }
            }
            
            const result = await this.modules.upload.uploadFile(file, { category });
            return result;
        } catch (error) {
            this.handleError('uploadFile', error);
            throw error;
        }
    }

    // Data Access
    getApplications() {
        return this.modules.core.getAllApplications();
    }

    getApplication(id) {
        return this.modules.core.getApplication(id);
    }

    searchApplications(query) {
        return this.modules.core.searchApplications(query);
    }

    getStatistics() {
        return this.modules.core.getStatistics();
    }

    // Dashboard Control
    async refreshDashboard() {
        if (this.modules.dashboard) {
            await this.modules.dashboard.refresh();
        }
    }

    // Validation
    async validateData(schemaName, data) {
        if (this.modules.validation) {
            return await this.modules.validation.validate(schemaName, data);
        }
        return { isValid: true, errors: {}, warnings: {}, infos: {} };
    }

    // Export/Import
    async exportApplications(format = 'json') {
        try {
            const applications = this.getApplications();
            const statistics = this.getStatistics();
            
            const exportData = {
                applications,
                statistics,
                exportDate: new Date().toISOString(),
                version: '2.0'
            };
            
            if (this.modules.api) {
                // Use API export if available
                return await this.modules.api.exportApplications(format);
            } else {
                // Local export
                return this.modules.core.exportApplications(format);
            }
        } catch (error) {
            this.handleError('exportApplications', error);
            throw error;
        }
    }

    async importApplications(data, format = 'json') {
        try {
            if (this.modules.api) {
                return await this.modules.api.importApplications(data, format);
            } else {
                return await this.modules.core.importApplications(data, format);
            }
        } catch (error) {
            this.handleError('importApplications', error);
            throw error;
        }
    }

    // 🔄 Lifecycle Management
    async loadInitialData() {
        try {
            if (this.modules.api && this.config.enableRealTimeSync) {
                // Try to sync with server
                await this.syncWithServer();
            }
            
            // Load local data if needed
            await this.modules.core.loadApplications();
            
            console.log('✅ Initial data loaded');
        } catch (error) {
            console.error('❌ Failed to load initial data:', error);
            // Continue with local data
        }
    }

    async syncWithServer() {
        if (this.modules.api) {
            try {
                await this.modules.api.syncWithServer();
                this.notifyObservers('syncCompleted');
            } catch (error) {
                console.error('❌ Server sync failed:', error);
                this.notifyObservers('syncFailed', error);
            }
        }
    }

    pauseRealTimeUpdates() {
        if (this.modules.dashboard) {
            this.modules.dashboard.pauseAutoRefresh();
        }
    }

    resumeRealTimeUpdates() {
        if (this.modules.dashboard) {
            this.modules.dashboard.resumeAutoRefresh();
        }
    }

    // 🔧 Configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Update module configurations
        Object.values(this.modules).forEach(module => {
            if (module.updateConfig) {
                module.updateConfig(newConfig);
            }
        });
    }

    getConfig() {
        return { ...this.config };
    }

    // 📊 Status & Health
    getStatus() {
        const status = {
            isInitialized: this.isInitialized,
            modules: {},
            config: this.config
        };
        
        Object.entries(this.modules).forEach(([name, module]) => {
            status.modules[name] = {
                loaded: !!module,
                status: module.getStatus ? module.getStatus() : 'unknown'
            };
        });
        
        return status;
    }

    async healthCheck() {
        const health = {
            overall: 'healthy',
            modules: {},
            timestamp: new Date().toISOString()
        };
        
        for (const [name, module] of Object.entries(this.modules)) {
            try {
                if (module.healthCheck) {
                    health.modules[name] = await module.healthCheck();
                } else {
                    health.modules[name] = { healthy: true, message: 'No health check available' };
                }
            } catch (error) {
                health.modules[name] = { healthy: false, error: error.message };
                health.overall = 'degraded';
            }
        }
        
        return health;
    }

    // 🚨 Error Handling
    handleError(context, error) {
        console.error(`❌ ApplicationManager error in ${context}:`, error);
        
        // Track error for analytics
        if (this.modules.core && this.modules.core.trackEvent) {
            this.modules.core.trackEvent('error_occurred', {
                context,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        this.notifyObservers('error', { context, error });
    }

    // 📢 Notifications
    showNotification(message, type = 'info') {
        if (this.modules.dashboard) {
            this.modules.dashboard.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // 🔔 Observer Pattern
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ Observer callback error:', error);
            }
        });
    }

    // 🧹 Cleanup
    async cleanup() {
        console.log('🧹 Cleaning up ApplicationManager...');
        
        // Cleanup all modules
        Object.values(this.modules).forEach(module => {
            if (module.destroy) {
                module.destroy();
            }
        });
        
        this.modules = {};
        this.observers.clear();
        this.isInitialized = false;
        
        console.log('✅ ApplicationManager cleaned up');
    }

    destroy() {
        this.cleanup();
    }
}

// 🚨 Custom Error Class
export class ApplicationError extends Error {
    constructor(message, details = null) {
        super(message);
        this.name = 'ApplicationError';
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

// 🏭 Factory function and global instance management
let globalApplicationManager = null;

export function createApplicationManager(options) {
    return new ApplicationManager(options);
}

export function getGlobalApplicationManager() {
    return globalApplicationManager;
}

export function setGlobalApplicationManager(instance) {
    globalApplicationManager = instance;
    
    // Make it available globally for debugging
    if (typeof window !== 'undefined') {
        window.applicationManager = instance;
    }
    
    return instance;
}

// 📋 Constants
export const MANAGER_EVENTS = {
    INITIALIZED: 'initialized',
    APPLICATION_CREATED: 'applicationCreated',
    APPLICATION_UPDATED: 'applicationUpdated',
    APPLICATION_DELETED: 'applicationDeleted',
    SYNC_COMPLETED: 'syncCompleted',
    SYNC_FAILED: 'syncFailed',
    ERROR: 'error'
};

export const MODULE_NAMES = {
    CORE: 'core',
    API: 'api',
    VALIDATION: 'validation',
    UPLOAD: 'upload',
    DASHBOARD: 'dashboard'
};
