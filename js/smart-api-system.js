// 🚀 Smart API System - Intelligentes API-System mit spezialisierten Endpunkten
const SMART_API_CONFIG = {
    // Base URLs für verschiedene Umgebungen
    baseUrls: {
        production: 'https://api.manuel-weiss.com',
        staging: 'https://staging-api.manuel-weiss.com',
        development: 'https://dev-api.manuel-weiss.com',
        local: 'http://localhost:3001'
    },
    
    // Spezialisierte API-Endpunkte
    endpoints: {
        // 📤 UPLOAD ENDPOINTS
        upload: {
            // Standard Upload
            standard: '/api/v1/upload',
            // Bulk Upload (mehrere Dateien)
            bulk: '/api/v1/upload/bulk',
            // Chunked Upload (große Dateien)
            chunked: '/api/v1/upload/chunked',
            // Resume Upload (Upload fortsetzen)
            resume: '/api/v1/upload/resume',
            // Direct S3 Upload (Presigned URL)
            direct: '/api/v1/upload/direct',
            // Quick Upload (ohne Metadaten)
            quick: '/api/v1/upload/quick'
        },
        
        // 📥 DOWNLOAD ENDPOINTS
        download: {
            // Standard Download
            standard: '/api/v1/download',
            // Bulk Download (mehrere Dateien)
            bulk: '/api/v1/download/bulk',
            // Stream Download (große Dateien)
            stream: '/api/v1/download/stream',
            // Preview Download (Vorschau)
            preview: '/api/v1/download/preview',
            // Thumbnail Download
            thumbnail: '/api/v1/download/thumbnail',
            // Direct S3 Download (Presigned URL)
            direct: '/api/v1/download/direct'
        },
        
        // 📊 ANALYTICS ENDPOINTS
        analytics: {
            // Upload Statistiken
            uploadStats: '/api/v1/analytics/upload-stats',
            // Download Statistiken
            downloadStats: '/api/v1/analytics/download-stats',
            // User Statistiken
            userStats: '/api/v1/analytics/user-stats',
            // Storage Statistiken
            storageStats: '/api/v1/analytics/storage-stats',
            // Performance Statistiken
            performanceStats: '/api/v1/analytics/performance-stats',
            // Error Statistiken
            errorStats: '/api/v1/analytics/error-stats'
        },
        
        // 📁 MANAGEMENT ENDPOINTS
        management: {
            // Dateien auflisten
            list: '/api/v1/files',
            // Datei-Details
            details: '/api/v1/files/details',
            // Datei löschen
            delete: '/api/v1/files/delete',
            // Datei umbenennen
            rename: '/api/v1/files/rename',
            // Datei verschieben
            move: '/api/v1/files/move',
            // Datei kopieren
            copy: '/api/v1/files/copy',
            // Datei teilen
            share: '/api/v1/files/share',
            // Berechtigungen verwalten
            permissions: '/api/v1/files/permissions'
        },
        
        // 🔍 SEARCH ENDPOINTS
        search: {
            // Volltext-Suche
            fulltext: '/api/v1/search/fulltext',
            // Metadaten-Suche
            metadata: '/api/v1/search/metadata',
            // Tag-Suche
            tags: '/api/v1/search/tags',
            // Dateityp-Suche
            filetype: '/api/v1/search/filetype',
            // Zeitraum-Suche
            dateRange: '/api/v1/search/date-range',
            // Größe-Suche
            sizeRange: '/api/v1/search/size-range'
        },
        
        // 👤 USER ENDPOINTS
        user: {
            // User-Profile
            profile: '/api/v1/user/profile',
            // User-Einstellungen
            settings: '/api/v1/user/settings',
            // User-Statistiken
            stats: '/api/v1/user/stats',
            // User-Dokumente
            documents: '/api/v1/user/documents',
            // User-Ordner
            folders: '/api/v1/user/folders',
            // User-Berechtigungen
            permissions: '/api/v1/user/permissions'
        },
        
        // 🔐 AUTH ENDPOINTS
        auth: {
            // Login
            login: '/api/v1/auth/login',
            // Logout
            logout: '/api/v1/auth/logout',
            // Token erneuern
            refresh: '/api/v1/auth/refresh',
            // Passwort ändern
            changePassword: '/api/v1/auth/change-password',
            // Account löschen
            deleteAccount: '/api/v1/auth/delete-account'
        },
        
        // 📈 MONITORING ENDPOINTS
        monitoring: {
            // System-Status
            health: '/api/v1/health',
            // System-Metriken
            metrics: '/api/v1/metrics',
            // Logs
            logs: '/api/v1/logs',
            // Alerts
            alerts: '/api/v1/alerts',
            // Performance
            performance: '/api/v1/performance'
        }
    },
    
    // API-Konfiguration
    config: {
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        chunkSize: 1024 * 1024, // 1MB
        enableProgress: true,
        enableCaching: true,
        cacheTimeout: 300000 // 5 Minuten
    }
};

// 🚀 Smart API Client
class SmartAPIClient {
    constructor(environment = 'production') {
        this.config = SMART_API_CONFIG;
        this.baseUrl = this.config.baseUrls[environment] || this.config.baseUrls.production;
        this.cache = new Map();
        this.retryCount = 0;
    }
    
    // 📤 UPLOAD FUNCTIONS
    async uploadFile(file, options = {}) {
        const endpoint = this.config.endpoints.upload.standard;
        return await this.makeRequest('POST', endpoint, { file, ...options });
    }
    
    async uploadBulk(files, options = {}) {
        const endpoint = this.config.endpoints.upload.bulk;
        return await this.makeRequest('POST', endpoint, { files, ...options });
    }
    
    async uploadChunked(file, chunkSize = this.config.config.chunkSize, options = {}) {
        const endpoint = this.config.endpoints.upload.chunked;
        const chunks = this.createChunks(file, chunkSize);
        const uploadId = Date.now().toString();
        
        for (let i = 0; i < chunks.length; i++) {
            await this.makeRequest('POST', endpoint, {
                uploadId,
                chunkIndex: i,
                totalChunks: chunks.length,
                chunk: chunks[i],
                ...options
            });
        }
        
        return { uploadId, totalChunks: chunks.length };
    }
    
    async getDirectUploadUrl(fileName, fileType, options = {}) {
        const endpoint = this.config.endpoints.upload.direct;
        return await this.makeRequest('POST', endpoint, { fileName, fileType, ...options });
    }
    
    // 📥 DOWNLOAD FUNCTIONS
    async downloadFile(fileId, options = {}) {
        const endpoint = this.config.endpoints.download.standard;
        return await this.makeRequest('GET', `${endpoint}/${fileId}`, options);
    }
    
    async downloadBulk(fileIds, options = {}) {
        const endpoint = this.config.endpoints.download.bulk;
        return await this.makeRequest('POST', endpoint, { fileIds, ...options });
    }
    
    async getDownloadUrl(fileId, options = {}) {
        const endpoint = this.config.endpoints.download.direct;
        return await this.makeRequest('GET', `${endpoint}/${fileId}`, options);
    }
    
    async getThumbnail(fileId, size = 'medium', options = {}) {
        const endpoint = this.config.endpoints.download.thumbnail;
        return await this.makeRequest('GET', `${endpoint}/${fileId}?size=${size}`, options);
    }
    
    // 📊 ANALYTICS FUNCTIONS
    async getUploadStats(options = {}) {
        const endpoint = this.config.endpoints.analytics.uploadStats;
        return await this.makeRequest('GET', endpoint, options);
    }
    
    async getDownloadStats(options = {}) {
        const endpoint = this.config.endpoints.analytics.downloadStats;
        return await this.makeRequest('GET', endpoint, options);
    }
    
    async getUserStats(userId, options = {}) {
        const endpoint = this.config.endpoints.analytics.userStats;
        return await this.makeRequest('GET', `${endpoint}/${userId}`, options);
    }
    
    async getStorageStats(options = {}) {
        const endpoint = this.config.endpoints.analytics.storageStats;
        return await this.makeRequest('GET', endpoint, options);
    }
    
    // 📁 MANAGEMENT FUNCTIONS
    async listFiles(options = {}) {
        const endpoint = this.config.endpoints.management.list;
        return await this.makeRequest('GET', endpoint, options);
    }
    
    async getFileDetails(fileId, options = {}) {
        const endpoint = this.config.endpoints.management.details;
        return await this.makeRequest('GET', `${endpoint}/${fileId}`, options);
    }
    
    async deleteFile(fileId, options = {}) {
        const endpoint = this.config.endpoints.management.delete;
        return await this.makeRequest('DELETE', `${endpoint}/${fileId}`, options);
    }
    
    async renameFile(fileId, newName, options = {}) {
        const endpoint = this.config.endpoints.management.rename;
        return await this.makeRequest('PUT', `${endpoint}/${fileId}`, { newName, ...options });
    }
    
    async moveFile(fileId, newPath, options = {}) {
        const endpoint = this.config.endpoints.management.move;
        return await this.makeRequest('PUT', `${endpoint}/${fileId}`, { newPath, ...options });
    }
    
    async copyFile(fileId, newPath, options = {}) {
        const endpoint = this.config.endpoints.management.copy;
        return await this.makeRequest('POST', `${endpoint}/${fileId}`, { newPath, ...options });
    }
    
    async shareFile(fileId, permissions, options = {}) {
        const endpoint = this.config.endpoints.management.share;
        return await this.makeRequest('POST', `${endpoint}/${fileId}`, { permissions, ...options });
    }
    
    // 🔍 SEARCH FUNCTIONS
    async searchFulltext(query, options = {}) {
        const endpoint = this.config.endpoints.search.fulltext;
        return await this.makeRequest('POST', endpoint, { query, ...options });
    }
    
    async searchMetadata(filters, options = {}) {
        const endpoint = this.config.endpoints.search.metadata;
        return await this.makeRequest('POST', endpoint, { filters, ...options });
    }
    
    async searchByTags(tags, options = {}) {
        const endpoint = this.config.endpoints.search.tags;
        return await this.makeRequest('POST', endpoint, { tags, ...options });
    }
    
    async searchByFiletype(fileType, options = {}) {
        const endpoint = this.config.endpoints.search.filetype;
        return await this.makeRequest('POST', endpoint, { fileType, ...options });
    }
    
    // 👤 USER FUNCTIONS
    async getUserProfile(userId, options = {}) {
        const endpoint = this.config.endpoints.user.profile;
        return await this.makeRequest('GET', `${endpoint}/${userId}`, options);
    }
    
    async getUserSettings(userId, options = {}) {
        const endpoint = this.config.endpoints.user.settings;
        return await this.makeRequest('GET', `${endpoint}/${userId}`, options);
    }
    
    async getUserDocuments(userId, options = {}) {
        const endpoint = this.config.endpoints.user.documents;
        return await this.makeRequest('GET', `${endpoint}/${userId}`, options);
    }
    
    async getUserFolders(userId, options = {}) {
        const endpoint = this.config.endpoints.user.folders;
        return await this.makeRequest('GET', `${endpoint}/${userId}`, options);
    }
    
    // 🔐 AUTH FUNCTIONS
    async login(credentials, options = {}) {
        const endpoint = this.config.endpoints.auth.login;
        return await this.makeRequest('POST', endpoint, { credentials, ...options });
    }
    
    async logout(options = {}) {
        const endpoint = this.config.endpoints.auth.logout;
        return await this.makeRequest('POST', endpoint, options);
    }
    
    async refreshToken(token, options = {}) {
        const endpoint = this.config.endpoints.auth.refresh;
        return await this.makeRequest('POST', endpoint, { token, ...options });
    }
    
    // 📈 MONITORING FUNCTIONS
    async getHealthStatus(options = {}) {
        const endpoint = this.config.endpoints.monitoring.health;
        return await this.makeRequest('GET', endpoint, options);
    }
    
    async getMetrics(options = {}) {
        const endpoint = this.config.endpoints.monitoring.metrics;
        return await this.makeRequest('GET', endpoint, options);
    }
    
    async getLogs(options = {}) {
        const endpoint = this.config.endpoints.monitoring.logs;
        return await this.makeRequest('GET', endpoint, options);
    }
    
    // 🔧 UTILITY FUNCTIONS
    createChunks(file, chunkSize) {
        const chunks = [];
        let offset = 0;
        
        while (offset < file.size) {
            const chunk = file.slice(offset, offset + chunkSize);
            chunks.push(chunk);
            offset += chunkSize;
        }
        
        return chunks;
    }
    
    async makeRequest(method, endpoint, data = null, options = {}) {
        const url = this.baseUrl + endpoint;
        const cacheKey = `${method}:${url}:${JSON.stringify(data)}`;
        
        // Check cache first
        if (this.config.config.enableCaching && method === 'GET' && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.config.cacheTimeout) {
                console.log('📦 Using cached response:', endpoint);
                return cached.data;
            }
        }
        
        const requestOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`,
                ...options.headers
            },
            timeout: this.config.config.timeout
        };
        
        if (data && method !== 'GET') {
            requestOptions.body = JSON.stringify(data);
        }
        
        try {
            console.log(`🚀 Making ${method} request to: ${endpoint}`);
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Cache GET requests
            if (this.config.config.enableCaching && method === 'GET') {
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }
            
            return result;
        } catch (error) {
            console.error(`❌ Request failed: ${endpoint}`, error);
            
            // Retry logic
            if (this.retryCount < this.config.config.retries) {
                this.retryCount++;
                console.log(`🔄 Retrying request (${this.retryCount}/${this.config.config.retries}): ${endpoint}`);
                await this.delay(this.config.config.retryDelay);
                return await this.makeRequest(method, endpoint, data, options);
            }
            
            throw error;
        }
    }
    
    getAuthToken() {
        // Try to get token from various sources
        if (typeof getUser === 'function') {
            const user = getUser();
            return user?.idToken || user?.accessToken || '';
        }
        
        if (typeof simpleAuth !== 'undefined' && simpleAuth.getUser) {
            const user = simpleAuth.getUser();
            return user?.idToken || '';
        }
        
        return localStorage.getItem('auth_token') || '';
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }
}

// Global Smart API Client instance
window.smartAPI = new SmartAPIClient('production');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SmartAPIClient, SMART_API_CONFIG };
}
