// ⚙️ Application Configuration - Zentrale Konfiguration für modulares Bewerbungssystem
// Environment-spezifische Settings, Feature Flags und API-Endpunkte

export const APP_CONFIG = {
    // 🏷️ Application Metadata
    name: 'Modern Application Management System',
    version: '2.0.0',
    buildDate: new Date().toISOString(),
    
    // 🌍 Environment Settings
    environment: {
        development: {
            apiBaseUrl: 'http://localhost:3001/api/v1',
            enableLogging: true,
            enableDebugMode: true,
            enableDevTools: true,
            enableMockData: true
        },
        staging: {
            apiBaseUrl: 'https://staging-api.manuel-weiss.com/api/v1',
            enableLogging: true,
            enableDebugMode: false,
            enableDevTools: true,
            enableMockData: false
        },
        production: {
            apiBaseUrl: 'https://api.manuel-weiss.com/api/v1',
            enableLogging: false,
            enableDebugMode: false,
            enableDevTools: false,
            enableMockData: false
        }
    },
    
    // 🎚️ Feature Flags
    features: {
        enableRealTimeSync: true,
        enableOfflineMode: true,
        enableValidation: true,
        enableUpload: true,
        enableDashboard: true,
        enableAnalytics: true,
        enableNotifications: true,
        enableExport: true,
        enableImport: true,
        enableBulkActions: true,
        enableSearch: true,
        enableFilters: true,
        enableSorting: true,
        enablePagination: true,
        enableDragAndDrop: true,
        enableFilePreview: true,
        enableAutoSave: true,
        enableKeyboardShortcuts: true,
        enableDarkMode: true,
        enablePWA: false, // Future feature
        enableWebSockets: false, // Future feature
        enableAI: false // Future feature
    },
    
    // 🗄️ Database/Storage Settings
    storage: {
        strategy: 'hybrid', // 'local', 'api', 'hybrid'
        localStorage: {
            prefix: 'app_mgmt_v2_',
            maxSize: 50 * 1024 * 1024, // 50MB
            enableCompression: true
        },
        api: {
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 1000,
            enableCaching: true,
            cacheTimeout: 300000 // 5 minutes
        },
        sync: {
            enabled: true,
            interval: 30000, // 30 seconds
            batchSize: 100,
            enableConflictResolution: true
        }
    },
    
    // 📤 Upload Configuration
    upload: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        chunkSize: 5 * 1024 * 1024, // 5MB
        maxConcurrentUploads: 3,
        enableResumableUpload: true,
        enablePreview: true,
        aws: {
            enabled: true,
            region: 'eu-central-1',
            bucket: 'manuel-weiss-applications',
            enablePresignedUrls: true,
            enableMultipartUpload: true
        }
    },
    
    // 🎨 UI/UX Settings
    ui: {
        theme: {
            default: 'light',
            enableDarkMode: true,
            enableSystemPreference: true
        },
        language: {
            default: 'de',
            supported: ['de', 'en'],
            enableAutoDetection: true
        },
        layout: {
            sidebarWidth: 280,
            headerHeight: 80,
            enableCollapsibleSidebar: true,
            enableMobileOptimization: true
        },
        animations: {
            enabled: true,
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        pagination: {
            defaultPageSize: 25,
            pageSizeOptions: [10, 25, 50, 100],
            enableVirtualScrolling: false // For very large lists
        }
    },
    
    // ✅ Validation Rules
    validation: {
        enableRealTimeValidation: true,
        enableAsyncValidation: true,
        debounceDelay: 300,
        showInlineErrors: true,
        enableAccessibility: true,
        schemas: {
            application: {
                company: {
                    required: true,
                    minLength: 2,
                    maxLength: 100,
                    pattern: /^[a-zA-Z0-9\s\-\.&]+$/
                },
                position: {
                    required: true,
                    minLength: 2,
                    maxLength: 200
                },
                salary: {
                    type: 'number',
                    min: 0,
                    max: 1000000
                },
                email: {
                    type: 'email',
                    enableDomainValidation: true
                }
            }
        }
    },
    
    // 📊 Analytics Configuration
    analytics: {
        enabled: true,
        trackUserActions: true,
        trackPerformance: true,
        trackErrors: true,
        enableHeatmaps: false,
        providers: {
            googleAnalytics: {
                enabled: false,
                measurementId: 'G-XXXXXXXXXX'
            },
            customAnalytics: {
                enabled: true,
                endpoint: '/api/v1/analytics'
            }
        },
        events: {
            applicationCreated: true,
            applicationUpdated: true,
            applicationDeleted: true,
            fileUploaded: true,
            searchPerformed: true,
            filterApplied: true,
            exportGenerated: true
        }
    },
    
    // 🔔 Notification Settings
    notifications: {
        enabled: true,
        position: 'top-right',
        autoHideDuration: 5000,
        enableSound: false,
        enableDesktopNotifications: false,
        types: {
            success: { icon: 'fa-check-circle', color: '#10b981' },
            error: { icon: 'fa-exclamation-circle', color: '#ef4444' },
            warning: { icon: 'fa-exclamation-triangle', color: '#f59e0b' },
            info: { icon: 'fa-info-circle', color: '#3b82f6' }
        }
    },
    
    // 🛡️ Security Settings
    security: {
        enableCSP: true,
        enableXSRF: true,
        sanitizeInputs: true,
        validateFileTypes: true,
        maxRequestRate: 100, // per minute
        enableSessionTimeout: true,
        sessionTimeoutMinutes: 60
    },
    
    // 🎯 Performance Settings
    performance: {
        enableLazyLoading: true,
        enableBundleSplitting: true,
        enableCompression: true,
        enableCaching: true,
        enableServiceWorker: false, // Future PWA feature
        memoryLimits: {
            maxApplicationsInMemory: 1000,
            maxCacheSize: 50 * 1024 * 1024, // 50MB
            gcInterval: 300000 // 5 minutes
        }
    },
    
    // 🔌 Integration Settings
    integrations: {
        aws: {
            enabled: true,
            services: ['s3', 'cognito', 'lambda'],
            region: 'eu-central-1'
        },
        calendar: {
            enabled: true,
            provider: 'google', // 'google', 'outlook', 'apple'
            syncInterval: 3600000 // 1 hour
        },
        email: {
            enabled: true,
            provider: 'aws-ses',
            templates: {
                applicationCreated: 'app-created-template',
                interviewScheduled: 'interview-scheduled-template'
            }
        }
    },
    
    // 📱 Mobile Settings
    mobile: {
        enablePWA: false,
        enableOfflineSync: true,
        enablePushNotifications: false,
        enableTouchGestures: true,
        optimizeForTouch: true
    }
};

// 🛠️ Configuration Utilities
export class ConfigManager {
    constructor(environment = 'production') {
        this.environment = environment;
        this.config = this.buildConfig();
    }

    buildConfig() {
        const baseConfig = { ...APP_CONFIG };
        const envConfig = APP_CONFIG.environment[this.environment] || APP_CONFIG.environment.production;
        
        return {
            ...baseConfig,
            ...envConfig,
            environment: this.environment
        };
    }

    get(path) {
        return this.getNestedValue(this.config, path);
    }

    set(path, value) {
        this.setNestedValue(this.config, path, value);
    }

    isFeatureEnabled(featureName) {
        return this.get(`features.${featureName}`) === true;
    }

    getApiEndpoint(endpoint = '') {
        const baseUrl = this.get('apiBaseUrl').replace(/\/$/, '');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${cleanEndpoint}`;
    }

    getUploadConfig() {
        return this.get('upload');
    }

    getUIConfig() {
        return this.get('ui');
    }

    getStorageConfig() {
        return this.get('storage');
    }

    getValidationConfig() {
        return this.get('validation');
    }

    // 🔧 Utility Methods
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    validate() {
        const requiredFields = [
            'apiBaseUrl',
            'upload.maxFileSize',
            'ui.theme.default',
            'ui.language.default'
        ];

        const missing = requiredFields.filter(field => this.get(field) === undefined);
        
        if (missing.length > 0) {
            throw new Error(`Missing required configuration: ${missing.join(', ')}`);
        }
        
        return true;
    }

    // 🔄 Runtime Updates
    updateFeature(featureName, enabled) {
        this.set(`features.${featureName}`, enabled);
        this.notifyConfigChange('featureToggled', { featureName, enabled });
    }

    updateEnvironment(newEnvironment) {
        if (APP_CONFIG.environment[newEnvironment]) {
            this.environment = newEnvironment;
            this.config = this.buildConfig();
            this.notifyConfigChange('environmentChanged', { environment: newEnvironment });
        }
    }

    notifyConfigChange(event, data) {
        // This would notify all subscribers about config changes
        if (typeof CustomEvent !== 'undefined') {
            document.dispatchEvent(new CustomEvent('configChanged', { 
                detail: { event, data } 
            }));
        }
    }
}

// 🌍 Environment Detection
export function detectEnvironment() {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        
        if (hostname.includes('staging') || hostname.includes('dev')) {
            return 'staging';
        }
        
        return 'production';
    }
    
    return 'production';
}

// 🏭 Factory function
export function createConfigManager(environment) {
    const env = environment || detectEnvironment();
    return new ConfigManager(env);
}

// 🌐 Global Config Instance
let globalConfig = null;

export function getGlobalConfig() {
    if (!globalConfig) {
        globalConfig = createConfigManager();
    }
    return globalConfig;
}

export function setGlobalConfig(config) {
    globalConfig = config;
    return config;
}

// 📋 Export commonly used configs
export const ENDPOINTS = {
    APPLICATIONS: '/applications',
    STATISTICS: '/applications/statistics',
    UPLOAD: '/upload',
    HEALTH: '/health'
};

export const FILE_TYPES = {
    PDF: 'application/pdf',
    WORD_OLD: 'application/msword',
    WORD_NEW: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    WEBP: 'image/webp'
};

export const APPLICATION_STATUS = {
    PENDING: 'pending',
    INTERVIEW: 'interview',
    OFFER: 'offer',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn'
};
