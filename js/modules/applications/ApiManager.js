// 🌐 API Manager - Zentrale API-Abstraktionsschicht für Bewerbungssystem
// RESTful API Client mit Caching, Retry-Logic und Error Handling

export class ApiManager {
    constructor(options = {}) {
        this.config = {
            baseUrl: options.baseUrl || '/api/v1',
            timeout: options.timeout || 30000,
            retryAttempts: options.retryAttempts || 3,
            retryDelay: options.retryDelay || 1000,
            enableCaching: options.enableCaching !== false,
            cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
            enableOfflineMode: options.enableOfflineMode !== false,
            enableRequestQueue: options.enableRequestQueue !== false,
            ...options
        };

        this.cache = new Map();
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        this.observers = new Set();
        this.interceptors = {
            request: [],
            response: []
        };
        
        this.init();
    }

    init() {
        this.setupNetworkMonitoring();
        this.setupDefaultInterceptors();
        console.log('✅ ApiManager initialized');
    }

    // 🌐 Network Monitoring
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyObservers('networkOnline');
            this.processQueuedRequests();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyObservers('networkOffline');
        });
    }

    setupDefaultInterceptors() {
        // Request interceptor for authentication
        this.addRequestInterceptor((config) => {
            const token = this.getAuthToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Response interceptor for error handling
        this.addResponseInterceptor(
            (response) => response,
            (error) => {
                if (error.status === 401) {
                    this.notifyObservers('authenticationRequired');
                }
                return Promise.reject(error);
            }
        );
    }

    // 🔄 HTTP Methods
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }

    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    async patch(endpoint, data, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }

    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    // 🚀 Core Request Method
    async request(method, endpoint, data = null, options = {}) {
        const requestConfig = {
            method,
            url: this.buildUrl(endpoint),
            data,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: options.timeout || this.config.timeout,
            cache: options.cache !== false && this.config.enableCaching,
            ...options
        };

        // Apply request interceptors
        for (const interceptor of this.interceptors.request) {
            requestConfig = await interceptor(requestConfig);
        }

        // Check cache first
        if (requestConfig.cache && method === 'GET') {
            const cached = this.getCachedResponse(requestConfig.url);
            if (cached) {
                return cached;
            }
        }

        // Handle offline mode
        if (!this.isOnline && this.config.enableOfflineMode) {
            if (method === 'GET') {
                // Try to return cached data
                const cached = this.getCachedResponse(requestConfig.url, true); // Allow stale
                if (cached) {
                    return cached;
                }
            }
            
            if (this.config.enableRequestQueue && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                // Queue the request for later
                return this.queueRequest(requestConfig);
            }
            
            throw new ApiError('Network not available', 'NETWORK_ERROR', 0);
        }

        // Make the request with retry logic
        return this.makeRequestWithRetry(requestConfig);
    }

    async makeRequestWithRetry(config, attempt = 1) {
        try {
            const response = await this.makeRequest(config);
            
            // Apply response interceptors
            let processedResponse = response;
            for (const interceptor of this.interceptors.response) {
                processedResponse = await interceptor.onFulfilled(processedResponse);
            }
            
            // Cache successful GET requests
            if (config.cache && config.method === 'GET' && response.ok) {
                this.setCachedResponse(config.url, processedResponse);
            }
            
            return processedResponse;
        } catch (error) {
            // Apply error interceptors
            let processedError = error;
            for (const interceptor of this.interceptors.response) {
                if (interceptor.onRejected) {
                    processedError = await interceptor.onRejected(processedError);
                }
            }
            
            // Retry logic
            if (this.shouldRetry(error, attempt)) {
                const delay = this.calculateRetryDelay(attempt);
                await this.sleep(delay);
                return this.makeRequestWithRetry(config, attempt + 1);
            }
            
            throw processedError;
        }
    }

    async makeRequest(config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            const response = await fetch(config.url, {
                method: config.method,
                headers: config.headers,
                body: config.data ? JSON.stringify(config.data) : undefined,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new ApiError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    'HTTP_ERROR',
                    response.status,
                    await this.safeJsonParse(response)
                );
            }

            const result = await this.safeJsonParse(response);
            return {
                data: result,
                status: response.status,
                headers: response.headers,
                ok: response.ok
            };
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 'TIMEOUT_ERROR', 408);
            }
            
            if (error instanceof ApiError) {
                throw error;
            }
            
            throw new ApiError(
                error.message || 'Network request failed',
                'NETWORK_ERROR',
                0
            );
        }
    }

    async safeJsonParse(response) {
        try {
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            return null;
        }
    }

    // 🧩 Application-Specific API Methods
    async getApplications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/applications${queryString ? `?${queryString}` : ''}`;
        const response = await this.get(endpoint);
        return response.data;
    }

    async getApplication(id) {
        const response = await this.get(`/applications/${id}`);
        return response.data;
    }

    async createApplication(applicationData) {
        const response = await this.post('/applications', applicationData);
        return response.data;
    }

    async updateApplication(id, updates) {
        const response = await this.put(`/applications/${id}`, updates);
        return response.data;
    }

    async deleteApplication(id) {
        const response = await this.delete(`/applications/${id}`);
        return response.data;
    }

    async searchApplications(query, filters = {}) {
        const response = await this.post('/applications/search', { query, filters });
        return response.data;
    }

    async getStatistics(dateRange = {}) {
        const response = await this.get('/applications/statistics', { params: dateRange });
        return response.data;
    }

    async exportApplications(format = 'json', filters = {}) {
        const response = await this.post('/applications/export', { format, filters });
        return response.data;
    }

    async importApplications(data, format = 'json') {
        const response = await this.post('/applications/import', { data, format });
        return response.data;
    }

    // 📤 File Upload Methods
    async uploadFile(file, category = 'documents') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        const response = await fetch(this.buildUrl('/upload'), {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${this.getAuthToken()}`
            }
        });

        if (!response.ok) {
            throw new ApiError(`Upload failed: ${response.statusText}`, 'UPLOAD_ERROR', response.status);
        }

        return await response.json();
    }

    async getUploadUrl(filename, contentType) {
        const response = await this.post('/upload/presigned-url', {
            filename,
            contentType
        });
        return response.data;
    }

    async initializeMultipartUpload(filename, contentType) {
        const response = await this.post('/upload/multipart/init', {
            filename,
            contentType
        });
        return response.data;
    }

    async uploadPart(uploadId, partNumber, data) {
        const response = await this.put(`/upload/multipart/${uploadId}/${partNumber}`, data, {
            headers: { 'Content-Type': 'application/octet-stream' }
        });
        return response.data;
    }

    async completeMultipartUpload(uploadId, parts) {
        const response = await this.post(`/upload/multipart/${uploadId}/complete`, { parts });
        return response.data;
    }

    // 💾 Caching System
    getCachedResponse(url, allowStale = false) {
        const cached = this.cache.get(url);
        if (!cached) return null;
        
        const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeout;
        if (isExpired && !allowStale) {
            this.cache.delete(url);
            return null;
        }
        
        return cached.data;
    }

    setCachedResponse(url, data) {
        this.cache.set(url, {
            data,
            timestamp: Date.now()
        });
        
        // Clean old cache entries periodically
        if (this.cache.size > 100) {
            this.cleanCache();
        }
    }

    cleanCache() {
        const now = Date.now();
        for (const [url, cached] of this.cache.entries()) {
            if (now - cached.timestamp > this.config.cacheTimeout) {
                this.cache.delete(url);
            }
        }
    }

    clearCache() {
        this.cache.clear();
    }

    // 📥 Request Queue (for offline support)
    async queueRequest(config) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                config,
                resolve,
                reject,
                timestamp: Date.now()
            });
            
            this.notifyObservers('requestQueued', { queueLength: this.requestQueue.length });
        });
    }

    async processQueuedRequests() {
        if (!this.isOnline || this.requestQueue.length === 0) return;
        
        const queue = [...this.requestQueue];
        this.requestQueue = [];
        
        for (const request of queue) {
            try {
                const response = await this.makeRequestWithRetry(request.config);
                request.resolve(response);
            } catch (error) {
                request.reject(error);
            }
        }
        
        this.notifyObservers('queueProcessed');
    }

    getQueuedRequestsCount() {
        return this.requestQueue.length;
    }

    // 🔧 Interceptors
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
        return () => {
            const index = this.interceptors.request.indexOf(interceptor);
            if (index > -1) {
                this.interceptors.request.splice(index, 1);
            }
        };
    }

    addResponseInterceptor(onFulfilled, onRejected) {
        const interceptor = { onFulfilled, onRejected };
        this.interceptors.response.push(interceptor);
        return () => {
            const index = this.interceptors.response.indexOf(interceptor);
            if (index > -1) {
                this.interceptors.response.splice(index, 1);
            }
        };
    }

    // 🛠️ Utility Methods
    buildUrl(endpoint) {
        const baseUrl = this.config.baseUrl.replace(/\/$/, '');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${cleanEndpoint}`;
    }

    shouldRetry(error, attempt) {
        if (attempt >= this.config.retryAttempts) return false;
        
        // Don't retry client errors (4xx) except for specific cases
        if (error.status >= 400 && error.status < 500) {
            return error.status === 429 || error.status === 408; // Rate limit or timeout
        }
        
        // Retry server errors (5xx) and network errors
        return error.status >= 500 || error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT_ERROR';
    }

    calculateRetryDelay(attempt) {
        // Exponential backoff with jitter
        const baseDelay = this.config.retryDelay;
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 0.1 * exponentialDelay;
        return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getAuthToken() {
        // Try different sources for auth token
        return localStorage.getItem('authToken') || 
               sessionStorage.getItem('authToken') ||
               this.config.authToken ||
               null;
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

    // 📊 Status & Health
    getStatus() {
        return {
            isOnline: this.isOnline,
            queuedRequests: this.requestQueue.length,
            cachedResponses: this.cache.size,
            config: {
                baseUrl: this.config.baseUrl,
                timeout: this.config.timeout,
                retryAttempts: this.config.retryAttempts
            }
        };
    }

    async healthCheck() {
        try {
            await this.get('/health');
            return { healthy: true, timestamp: new Date().toISOString() };
        } catch (error) {
            return { 
                healthy: false, 
                error: error.message, 
                timestamp: new Date().toISOString() 
            };
        }
    }

    // 🧹 Cleanup
    destroy() {
        this.cache.clear();
        this.requestQueue = [];
        this.observers.clear();
        this.interceptors.request = [];
        this.interceptors.response = [];
    }
}

// 🚨 Custom Error Class
export class ApiError extends Error {
    constructor(message, code, status, data = null) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.status = status;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            status: this.status,
            data: this.data,
            timestamp: this.timestamp
        };
    }
}

// 🏭 Factory function
export function createApiManager(options) {
    return new ApiManager(options);
}

// 📋 API Constants
export const API_ENDPOINTS = {
    APPLICATIONS: '/applications',
    STATISTICS: '/applications/statistics',
    SEARCH: '/applications/search',
    EXPORT: '/applications/export',
    IMPORT: '/applications/import',
    UPLOAD: '/upload',
    HEALTH: '/health'
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// 🎯 Response Types
export const RESPONSE_TYPES = {
    JSON: 'application/json',
    TEXT: 'text/plain',
    BLOB: 'application/octet-stream',
    FORM_DATA: 'multipart/form-data'
};
