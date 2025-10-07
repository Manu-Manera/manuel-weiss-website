// 🎯 Application Core Module - Moderne ES6 Klassen-basierte Architektur
// Zentrale Verwaltung aller Bewerbungsfunktionen nach neuesten Best Practices

export class ApplicationCore {
    constructor(options = {}) {
        this.config = {
            storageKey: 'applications_v2',
            apiEndpoint: options.apiEndpoint || '/api/v1/applications',
            enableRealTimeSync: options.enableRealTimeSync || false,
            enableAnalytics: options.enableAnalytics || true,
            maxApplications: options.maxApplications || 1000,
            ...options
        };
        
        this.applications = new Map();
        this.observers = new Set();
        this.isInitialized = false;
        this.syncQueue = [];
        
        this.init();
    }

    async init() {
        try {
            await this.loadApplications();
            this.setupEventListeners();
            this.startPeriodicSync();
            this.isInitialized = true;
            
            console.log('✅ ApplicationCore initialized successfully');
            this.notifyObservers('initialized');
        } catch (error) {
            console.error('❌ ApplicationCore initialization failed:', error);
            throw error;
        }
    }

    // 📊 Application Management
    async createApplication(applicationData) {
        try {
            const application = this.validateAndSanitizeApplication(applicationData);
            application.id = this.generateId();
            application.createdAt = new Date().toISOString();
            application.updatedAt = application.createdAt;
            application.status = application.status || 'pending';
            
            this.applications.set(application.id, application);
            await this.saveApplications();
            
            this.notifyObservers('applicationCreated', application);
            
            if (this.config.enableAnalytics) {
                this.trackEvent('application_created', { 
                    position: application.position,
                    company: application.company 
                });
            }
            
            return application;
        } catch (error) {
            console.error('❌ Error creating application:', error);
            throw new Error(`Failed to create application: ${error.message}`);
        }
    }

    async updateApplication(id, updates) {
        try {
            if (!this.applications.has(id)) {
                throw new Error(`Application with id ${id} not found`);
            }
            
            const application = this.applications.get(id);
            const sanitizedUpdates = this.validateAndSanitizeApplication(updates, true);
            
            const updatedApplication = {
                ...application,
                ...sanitizedUpdates,
                updatedAt: new Date().toISOString()
            };
            
            this.applications.set(id, updatedApplication);
            await this.saveApplications();
            
            this.notifyObservers('applicationUpdated', updatedApplication);
            
            if (this.config.enableAnalytics && updates.status !== application.status) {
                this.trackEvent('application_status_changed', {
                    from: application.status,
                    to: updates.status,
                    company: application.company
                });
            }
            
            return updatedApplication;
        } catch (error) {
            console.error('❌ Error updating application:', error);
            throw error;
        }
    }

    async deleteApplication(id) {
        try {
            if (!this.applications.has(id)) {
                throw new Error(`Application with id ${id} not found`);
            }
            
            const application = this.applications.get(id);
            this.applications.delete(id);
            await this.saveApplications();
            
            this.notifyObservers('applicationDeleted', { id, application });
            
            if (this.config.enableAnalytics) {
                this.trackEvent('application_deleted', {
                    company: application.company,
                    status: application.status
                });
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error deleting application:', error);
            throw error;
        }
    }

    // 📋 Query Methods
    getApplication(id) {
        return this.applications.get(id);
    }

    getAllApplications() {
        return Array.from(this.applications.values());
    }

    getApplicationsByStatus(status) {
        return this.getAllApplications().filter(app => app.status === status);
    }

    getApplicationsByCompany(company) {
        return this.getAllApplications().filter(app => 
            app.company.toLowerCase().includes(company.toLowerCase())
        );
    }

    searchApplications(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.getAllApplications().filter(app => 
            app.company.toLowerCase().includes(lowercaseQuery) ||
            app.position.toLowerCase().includes(lowercaseQuery) ||
            (app.notes && app.notes.toLowerCase().includes(lowercaseQuery))
        );
    }

    // 📊 Analytics & Statistics
    getStatistics() {
        const applications = this.getAllApplications();
        const total = applications.length;
        
        if (total === 0) {
            return {
                total: 0,
                pending: 0,
                interview: 0,
                offer: 0,
                rejected: 0,
                successRate: 0,
                averageResponseTime: 0
            };
        }

        const statusCounts = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});

        const positive = (statusCounts.interview || 0) + (statusCounts.offer || 0);
        const successRate = Math.round((positive / total) * 100);

        return {
            total,
            pending: statusCounts.pending || 0,
            interview: statusCounts.interview || 0,
            offer: statusCounts.offer || 0,
            rejected: statusCounts.rejected || 0,
            successRate,
            averageResponseTime: this.calculateAverageResponseTime(applications),
            monthlyStats: this.getMonthlyStatistics(applications),
            topCompanies: this.getTopCompanies(applications)
        };
    }

    calculateAverageResponseTime(applications) {
        const responseTimes = applications
            .filter(app => app.status !== 'pending' && app.responseDate)
            .map(app => {
                const applied = new Date(app.createdAt);
                const responded = new Date(app.responseDate);
                return Math.ceil((responded - applied) / (1000 * 60 * 60 * 24)); // Days
            });

        return responseTimes.length > 0 
            ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
            : 0;
    }

    getMonthlyStatistics(applications) {
        const monthlyStats = {};
        
        applications.forEach(app => {
            const month = new Date(app.createdAt).toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyStats[month]) {
                monthlyStats[month] = { total: 0, interview: 0, offer: 0, rejected: 0 };
            }
            monthlyStats[month].total++;
            if (app.status === 'interview') monthlyStats[month].interview++;
            if (app.status === 'offer') monthlyStats[month].offer++;
            if (app.status === 'rejected') monthlyStats[month].rejected++;
        });

        return monthlyStats;
    }

    getTopCompanies(applications) {
        const companyCounts = applications.reduce((acc, app) => {
            acc[app.company] = (acc[app.company] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(companyCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([company, count]) => ({ company, count }));
    }

    // 💾 Data Persistence
    async loadApplications() {
        try {
            // Try to load from API first, then fallback to localStorage
            if (this.config.enableRealTimeSync) {
                await this.syncWithServer();
            } else {
                const stored = localStorage.getItem(this.config.storageKey);
                if (stored) {
                    const applications = JSON.parse(stored);
                    applications.forEach(app => this.applications.set(app.id, app));
                }
            }
        } catch (error) {
            console.error('❌ Error loading applications:', error);
            // Fallback to localStorage
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored) {
                const applications = JSON.parse(stored);
                applications.forEach(app => this.applications.set(app.id, app));
            }
        }
    }

    async saveApplications() {
        try {
            const applications = Array.from(this.applications.values());
            
            // Save locally immediately
            localStorage.setItem(this.config.storageKey, JSON.stringify(applications));
            
            // Queue for server sync if enabled
            if (this.config.enableRealTimeSync) {
                this.queueSync();
            }
        } catch (error) {
            console.error('❌ Error saving applications:', error);
            throw error;
        }
    }

    // 🔄 Real-time Sync
    async syncWithServer() {
        if (!this.config.enableRealTimeSync) return;

        try {
            const response = await fetch(this.config.apiEndpoint);
            if (response.ok) {
                const serverApplications = await response.json();
                this.mergeServerData(serverApplications);
            }
        } catch (error) {
            console.error('❌ Sync with server failed:', error);
        }
    }

    queueSync() {
        if (this.syncQueue.length === 0) {
            // Debounce sync requests
            setTimeout(() => this.processSyncQueue(), 1000);
        }
        this.syncQueue.push(Date.now());
    }

    async processSyncQueue() {
        if (this.syncQueue.length === 0) return;
        
        try {
            const applications = Array.from(this.applications.values());
            await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applications)
            });
            this.syncQueue = [];
        } catch (error) {
            console.error('❌ Sync queue processing failed:', error);
        }
    }

    startPeriodicSync() {
        if (this.config.enableRealTimeSync) {
            setInterval(() => this.syncWithServer(), 30000); // Every 30 seconds
        }
    }

    // 🔧 Utility Methods
    validateAndSanitizeApplication(data, isUpdate = false) {
        const required = ['company', 'position'];
        const allowed = [
            'company', 'position', 'status', 'appliedDate', 'responseDate',
            'notes', 'salary', 'location', 'jobUrl', 'contactPerson',
            'contactEmail', 'contactPhone', 'requirements', 'benefits'
        ];

        if (!isUpdate) {
            for (const field of required) {
                if (!data[field] || data[field].trim() === '') {
                    throw new Error(`Field '${field}' is required`);
                }
            }
        }

        const sanitized = {};
        for (const key of allowed) {
            if (data[key] !== undefined) {
                sanitized[key] = typeof data[key] === 'string' 
                    ? data[key].trim() 
                    : data[key];
            }
        }

        // Validate status
        const validStatuses = ['pending', 'interview', 'offer', 'rejected', 'withdrawn'];
        if (sanitized.status && !validStatuses.includes(sanitized.status)) {
            sanitized.status = 'pending';
        }

        return sanitized;
    }

    generateId() {
        return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    // 📈 Analytics
    trackEvent(event, data) {
        if (!this.config.enableAnalytics) return;
        
        try {
            // Send to analytics service
            if (window.gtag) {
                window.gtag('event', event, data);
            }
            
            // Store locally for internal analytics
            const analytics = JSON.parse(localStorage.getItem('application_analytics') || '[]');
            analytics.push({
                event,
                data,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 1000 events
            if (analytics.length > 1000) {
                analytics.splice(0, analytics.length - 1000);
            }
            
            localStorage.setItem('application_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('❌ Analytics tracking error:', error);
        }
    }

    setupEventListeners() {
        // Handle page visibility changes for sync
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.config.enableRealTimeSync) {
                this.syncWithServer();
            }
        });

        // Handle before page unload
        window.addEventListener('beforeunload', () => {
            this.processSyncQueue();
        });
    }

    // 📤 Export/Import
    exportApplications(format = 'json') {
        const applications = this.getAllApplications();
        
        switch (format) {
            case 'csv':
                return this.exportAsCSV(applications);
            case 'excel':
                return this.exportAsExcel(applications);
            default:
                return JSON.stringify(applications, null, 2);
        }
    }

    exportAsCSV(applications) {
        const headers = [
            'Company', 'Position', 'Status', 'Applied Date', 'Response Date',
            'Salary', 'Location', 'Notes'
        ];
        
        const rows = applications.map(app => [
            app.company, app.position, app.status, app.appliedDate || '',
            app.responseDate || '', app.salary || '', app.location || '',
            (app.notes || '').replace(/,/g, ';')
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    async importApplications(data, format = 'json') {
        try {
            let applications;
            
            switch (format) {
                case 'csv':
                    applications = this.parseCSV(data);
                    break;
                case 'json':
                default:
                    applications = JSON.parse(data);
            }
            
            const importedCount = 0;
            for (const appData of applications) {
                try {
                    await this.createApplication(appData);
                    importedCount++;
                } catch (error) {
                    console.warn(`⚠️ Skipped invalid application:`, error.message);
                }
            }
            
            return { imported: importedCount, total: applications.length };
        } catch (error) {
            throw new Error(`Import failed: ${error.message}`);
        }
    }

    // 🧹 Cleanup
    destroy() {
        this.observers.clear();
        this.applications.clear();
        this.syncQueue = [];
        this.isInitialized = false;
    }
}

// 🏭 Factory function for easy instantiation
export function createApplicationCore(options) {
    return new ApplicationCore(options);
}

// 📊 Application Status Constants
export const APPLICATION_STATUS = {
    PENDING: 'pending',
    INTERVIEW: 'interview', 
    OFFER: 'offer',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn'
};

// 🔧 Utility functions
export const ApplicationUtils = {
    formatDate: (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('de-DE');
    },
    
    getStatusColor: (status) => {
        const colors = {
            pending: '#f59e0b',
            interview: '#3b82f6',
            offer: '#10b981',
            rejected: '#ef4444',
            withdrawn: '#6b7280'
        };
        return colors[status] || colors.pending;
    },
    
    getStatusIcon: (status) => {
        const icons = {
            pending: 'fas fa-clock',
            interview: 'fas fa-users',
            offer: 'fas fa-handshake',
            rejected: 'fas fa-times',
            withdrawn: 'fas fa-ban'
        };
        return icons[status] || icons.pending;
    }
};
