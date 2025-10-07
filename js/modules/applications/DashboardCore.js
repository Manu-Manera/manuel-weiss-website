// 📊 Dashboard Core - Modernes Dashboard-System für Bewerbungsmanagement
// Reaktive Komponenten, Real-time Updates und Analytics

export class DashboardCore {
    constructor(applicationCore, options = {}) {
        this.applicationCore = applicationCore;
        this.config = {
            container: options.container || '#dashboard-container',
            autoRefresh: options.autoRefresh !== false,
            refreshInterval: options.refreshInterval || 30000,
            enableAnimations: options.enableAnimations !== false,
            theme: options.theme || 'light',
            language: options.language || 'de',
            ...options
        };

        this.components = new Map();
        this.widgets = new Map();
        this.observers = new Set();
        this.isInitialized = false;
        this.refreshTimer = null;
        
        this.init();
    }

    async init() {
        try {
            await this.setupContainer();
            this.registerComponents();
            this.setupEventListeners();
            this.startAutoRefresh();
            
            // Subscribe to application updates
            this.applicationCore.subscribe((event, data) => {
                this.handleApplicationEvent(event, data);
            });
            
            this.isInitialized = true;
            console.log('✅ DashboardCore initialized successfully');
            
            // Initial render
            await this.render();
        } catch (error) {
            console.error('❌ DashboardCore initialization failed:', error);
            throw error;
        }
    }

    async setupContainer() {
        const container = typeof this.config.container === 'string' 
            ? document.querySelector(this.config.container)
            : this.config.container;
            
        if (!container) {
            throw new Error('Dashboard container not found');
        }
        
        this.container = container;
        this.container.className = `dashboard-container theme-${this.config.theme}`;
        
        // Add CSS if not already present
        if (!document.querySelector('#dashboard-styles')) {
            this.injectStyles();
        }
    }

    // 🎨 Component Registration
    registerComponents() {
        // Statistics Panel
        this.registerComponent('statistics', StatisticsPanel);
        
        // Application List
        this.registerComponent('applicationList', ApplicationList);
        
        // Quick Actions
        this.registerComponent('quickActions', QuickActions);
        
        // Charts & Analytics
        this.registerComponent('charts', ChartsWidget);
        
        // Recent Activity
        this.registerComponent('recentActivity', RecentActivity);
        
        // Performance Metrics
        this.registerComponent('performance', PerformanceMetrics);
        
        // Calendar Integration
        this.registerComponent('calendar', CalendarWidget);
        
        // Notifications
        this.registerComponent('notifications', NotificationCenter);
    }

    registerComponent(name, ComponentClass, options = {}) {
        this.components.set(name, {
            ComponentClass,
            options,
            instance: null,
            container: null
        });
    }

    // 🏗️ Layout & Rendering
    async render() {
        try {
            this.container.innerHTML = this.getLayoutHTML();
            
            // Initialize components
            for (const [name, component] of this.components) {
                await this.initializeComponent(name, component);
            }
            
            this.notifyObservers('dashboardRendered');
        } catch (error) {
            console.error('❌ Dashboard render failed:', error);
            this.showError('Fehler beim Laden des Dashboards');
        }
    }

    getLayoutHTML() {
        return `
            <div class="dashboard-layout">
                <!-- Header -->
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>📊 Bewerbungs-Dashboard</h1>
                        <p class="last-updated" id="lastUpdated">Zuletzt aktualisiert: ${new Date().toLocaleString('de-DE')}</p>
                    </div>
                    <div class="dashboard-actions">
                        <button class="btn-refresh" onclick="dashboard.refresh()">
                            <i class="fas fa-sync-alt"></i>
                            Aktualisieren
                        </button>
                        <button class="btn-export" onclick="dashboard.export()">
                            <i class="fas fa-download"></i>
                            Export
                        </button>
                    </div>
                </div>

                <!-- Main Grid -->
                <div class="dashboard-grid">
                    <!-- Statistics Row -->
                    <div class="grid-item statistics-panel" id="statistics-container">
                        <div class="loading-placeholder">
                            <i class="fas fa-spinner fa-spin"></i>
                            Statistiken werden geladen...
                        </div>
                    </div>

                    <!-- Charts Row -->
                    <div class="grid-item charts-widget" id="charts-container">
                        <div class="loading-placeholder">
                            <i class="fas fa-spinner fa-spin"></i>
                            Charts werden geladen...
                        </div>
                    </div>

                    <!-- Application List -->
                    <div class="grid-item application-list" id="applicationList-container">
                        <div class="loading-placeholder">
                            <i class="fas fa-spinner fa-spin"></i>
                            Bewerbungen werden geladen...
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="grid-sidebar">
                        <!-- Quick Actions -->
                        <div class="sidebar-widget" id="quickActions-container">
                            <div class="loading-placeholder">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="sidebar-widget" id="recentActivity-container">
                            <div class="loading-placeholder">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                        </div>

                        <!-- Performance -->
                        <div class="sidebar-widget" id="performance-container">
                            <div class="loading-placeholder">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                        </div>

                        <!-- Calendar -->
                        <div class="sidebar-widget" id="calendar-container">
                            <div class="loading-placeholder">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                        </div>

                        <!-- Notifications -->
                        <div class="sidebar-widget" id="notifications-container">
                            <div class="loading-placeholder">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async initializeComponent(name, component) {
        try {
            const container = this.container.querySelector(`#${name}-container`);
            if (!container) {
                console.warn(`⚠️ Container for component '${name}' not found`);
                return;
            }

            const instance = new component.ComponentClass(this.applicationCore, {
                container,
                dashboard: this,
                ...component.options
            });

            await instance.init();
            
            component.instance = instance;
            component.container = container;
            
            console.log(`✅ Component '${name}' initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize component '${name}':`, error);
            this.showComponentError(name, error);
        }
    }

    // 📊 Data Management
    async refreshData() {
        try {
            this.showLoading();
            
            // Update timestamp
            const lastUpdated = this.container.querySelector('#lastUpdated');
            if (lastUpdated) {
                lastUpdated.textContent = `Zuletzt aktualisiert: ${new Date().toLocaleString('de-DE')}`;
            }
            
            // Refresh all components
            const refreshPromises = [];
            for (const [name, component] of this.components) {
                if (component.instance && typeof component.instance.refresh === 'function') {
                    refreshPromises.push(
                        component.instance.refresh().catch(error => {
                            console.error(`❌ Failed to refresh component '${name}':`, error);
                        })
                    );
                }
            }
            
            await Promise.allSettled(refreshPromises);
            
            this.hideLoading();
            this.notifyObservers('dashboardRefreshed');
        } catch (error) {
            console.error('❌ Dashboard refresh failed:', error);
            this.hideLoading();
            this.showError('Fehler beim Aktualisieren der Daten');
        }
    }

    // 🔄 Event Handling
    handleApplicationEvent(event, data) {
        // Update components based on application events
        switch (event) {
            case 'applicationCreated':
            case 'applicationUpdated':
            case 'applicationDeleted':
                this.refreshRelevantComponents(['statistics', 'applicationList', 'charts', 'recentActivity']);
                break;
            default:
                // Handle other events
                break;
        }
    }

    async refreshRelevantComponents(componentNames) {
        for (const name of componentNames) {
            const component = this.components.get(name);
            if (component?.instance?.refresh) {
                try {
                    await component.instance.refresh();
                } catch (error) {
                    console.error(`❌ Failed to refresh component '${name}':`, error);
                }
            }
        }
    }

    // 🎛️ Controls
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refresh();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.export();
                        break;
                }
            }
        });

        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Visibility change (for pausing/resuming auto-refresh)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoRefresh();
            } else {
                this.resumeAutoRefresh();
            }
        });
    }

    handleResize() {
        // Notify components about resize
        for (const [name, component] of this.components) {
            if (component.instance && typeof component.instance.handleResize === 'function') {
                component.instance.handleResize();
            }
        }
    }

    // ⏰ Auto Refresh
    startAutoRefresh() {
        if (this.config.autoRefresh && !this.refreshTimer) {
            this.refreshTimer = setInterval(() => {
                if (!document.hidden) {
                    this.refreshData();
                }
            }, this.config.refreshInterval);
        }
    }

    pauseAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    resumeAutoRefresh() {
        if (this.config.autoRefresh && !this.refreshTimer) {
            this.startAutoRefresh();
        }
    }

    // 📤 Export
    async export(format = 'json') {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                statistics: this.applicationCore.getStatistics(),
                applications: this.applicationCore.getAllApplications(),
                dashboard: {
                    theme: this.config.theme,
                    language: this.config.language
                }
            };

            let exported;
            let filename;
            let mimeType;

            switch (format) {
                case 'csv':
                    exported = this.applicationCore.exportApplications('csv');
                    filename = `bewerbungen_${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;
                    
                case 'excel':
                    exported = await this.exportAsExcel(data);
                    filename = `bewerbungen_${new Date().toISOString().split('T')[0]}.xlsx`;
                    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                    
                default: // json
                    exported = JSON.stringify(data, null, 2);
                    filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
            }

            this.downloadFile(exported, filename, mimeType);
            this.showSuccess('Export erfolgreich heruntergeladen');
        } catch (error) {
            console.error('❌ Export failed:', error);
            this.showError('Export fehlgeschlagen: ' + error.message);
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    // 🎨 UI Methods
    showLoading() {
        this.container.classList.add('loading');
    }

    hideLoading() {
        this.container.classList.remove('loading');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        notificationContainer.appendChild(notification);

        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Add animation
        if (this.config.enableAnimations) {
            notification.style.animation = 'slideInRight 0.3s ease-out';
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    showComponentError(componentName, error) {
        const container = this.container.querySelector(`#${componentName}-container`);
        if (container) {
            container.innerHTML = `
                <div class="component-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Fehler beim Laden der Komponente</p>
                    <button onclick="dashboard.retryComponent('${componentName}')" class="btn-retry">
                        Erneut versuchen
                    </button>
                </div>
            `;
        }
    }

    async retryComponent(componentName) {
        const component = this.components.get(componentName);
        if (component) {
            await this.initializeComponent(componentName, component);
        }
    }

    // 🎨 Style Injection
    injectStyles() {
        const styles = `
            <style id="dashboard-styles">
            .dashboard-container {
                width: 100%;
                min-height: 100vh;
                background: var(--bg-color, #f8fafc);
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }

            .dashboard-layout {
                padding: 2rem;
                max-width: 1400px;
                margin: 0 auto;
            }

            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .dashboard-title h1 {
                margin: 0;
                font-size: 1.875rem;
                font-weight: 700;
                color: #1f2937;
            }

            .last-updated {
                margin: 0.5rem 0 0 0;
                color: #6b7280;
                font-size: 0.875rem;
            }

            .dashboard-actions {
                display: flex;
                gap: 1rem;
            }

            .btn-refresh, .btn-export {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-refresh {
                background: #667eea;
                color: white;
            }

            .btn-export {
                background: #10b981;
                color: white;
            }

            .btn-refresh:hover, .btn-export:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .dashboard-grid {
                display: grid;
                grid-template-columns: 1fr 320px;
                gap: 1.5rem;
            }

            .grid-item {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .grid-sidebar {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .sidebar-widget {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                padding: 1.5rem;
            }

            .loading-placeholder {
                text-align: center;
                padding: 2rem;
                color: #6b7280;
            }

            .loading-placeholder i {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
            }

            .component-error {
                text-align: center;
                padding: 2rem;
                color: #ef4444;
            }

            .btn-retry {
                background: #ef4444;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 1rem;
            }

            .notification-container {
                position: fixed;
                top: 2rem;
                right: 2rem;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .notification {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 1.25rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                min-width: 300px;
                background: white;
            }

            .notification-success { border-left: 4px solid #10b981; }
            .notification-error { border-left: 4px solid #ef4444; }
            .notification-warning { border-left: 4px solid #f59e0b; }
            .notification-info { border-left: 4px solid #3b82f6; }

            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                margin-left: auto;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @media (max-width: 768px) {
                .dashboard-grid {
                    grid-template-columns: 1fr;
                }
                
                .dashboard-header {
                    flex-direction: column;
                    gap: 1rem;
                    text-align: center;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    // 🛠️ Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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

    // 🔄 Public API
    async refresh() {
        await this.refreshData();
    }

    getComponent(name) {
        return this.components.get(name)?.instance;
    }

    // 🧹 Cleanup
    destroy() {
        this.pauseAutoRefresh();
        
        // Destroy all components
        for (const [name, component] of this.components) {
            if (component.instance && typeof component.instance.destroy === 'function') {
                component.instance.destroy();
            }
        }
        
        this.components.clear();
        this.widgets.clear();
        this.observers.clear();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// 🏭 Factory function
export function createDashboard(applicationCore, options) {
    return new DashboardCore(applicationCore, options);
}

// Import component classes (to be created separately)
import { StatisticsPanel } from './components/StatisticsPanel.js';
import { ApplicationList } from './components/ApplicationList.js';
import { QuickActions } from './components/QuickActions.js';
import { ChartsWidget } from './components/ChartsWidget.js';
import { RecentActivity } from './components/RecentActivity.js';
import { PerformanceMetrics } from './components/PerformanceMetrics.js';
import { CalendarWidget } from './components/CalendarWidget.js';
import { NotificationCenter } from './components/NotificationCenter.js';
