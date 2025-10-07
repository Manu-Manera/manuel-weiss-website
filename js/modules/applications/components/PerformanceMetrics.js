// 📊 Performance Metrics Component - System-Performance und User-Analytics
// Real-time Monitoring, Lighthouse Metrics und User Journey Analytics

export class PerformanceMetrics {
    constructor(applicationCore, options = {}) {
        this.applicationCore = applicationCore;
        this.options = {
            container: options.container,
            dashboard: options.dashboard,
            enableRealTimeMonitoring: options.enableRealTimeMonitoring !== false,
            enableUserAnalytics: options.enableUserAnalytics !== false,
            enableSystemMetrics: options.enableSystemMetrics !== false,
            updateInterval: options.updateInterval || 5000,
            historyLimit: options.historyLimit || 100,
            ...options
        };

        this.container = this.options.container;
        this.metrics = {
            system: {},
            user: {},
            application: {}
        };
        this.metricsHistory = [];
        this.observers = [];
        this.updateTimer = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            await this.collectInitialMetrics();
            await this.render();
            this.setupEventListeners();
            this.startRealTimeMonitoring();
            
            this.isInitialized = true;
            console.log('✅ PerformanceMetrics initialized');
        } catch (error) {
            console.error('❌ PerformanceMetrics initialization failed:', error);
            throw error;
        }
    }

    async render() {
        this.container.innerHTML = this.getHTML();
        this.updateAllMetrics();
    }

    getHTML() {
        return `
            <div class="performance-metrics">
                <div class="metrics-header">
                    <h4>📊 Performance</h4>
                    <div class="metrics-controls">
                        <button class="btn-icon" onclick="performanceMetrics.refresh()" title="Aktualisieren">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="performanceMetrics.exportMetrics()" title="Exportieren">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>

                <!-- System Metrics -->
                <div class="metrics-section">
                    <h5>⚡ System</h5>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <div class="metric-label">Ladezeit</div>
                            <div class="metric-value" id="loadTime">-</div>
                            <div class="metric-trend" id="loadTimeTrend"></div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Speicher</div>
                            <div class="metric-value" id="memoryUsage">-</div>
                            <div class="metric-trend" id="memoryTrend"></div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">FPS</div>
                            <div class="metric-value" id="frameRate">-</div>
                            <div class="metric-trend" id="fpsTrend"></div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Lighthouse</div>
                            <div class="metric-value" id="lighthouseScore">-</div>
                            <div class="metric-trend" id="lighthouseTrend"></div>
                        </div>
                    </div>
                </div>

                <!-- User Metrics -->
                <div class="metrics-section">
                    <h5>👤 Benutzer</h5>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <div class="metric-label">Session Zeit</div>
                            <div class="metric-value" id="sessionTime">-</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Aktionen</div>
                            <div class="metric-value" id="userActions">-</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Klicks</div>
                            <div class="metric-value" id="clickCount">-</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Verweildauer</div>
                            <div class="metric-value" id="avgPageTime">-</div>
                        </div>
                    </div>
                </div>

                <!-- Application Metrics -->
                <div class="metrics-section">
                    <h5>📱 App-Metriken</h5>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <div class="metric-label">API Calls</div>
                            <div class="metric-value" id="apiCalls">-</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Cache Hit Rate</div>
                            <div class="metric-value" id="cacheHitRate">-</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Fehlerrate</div>
                            <div class="metric-value" id="errorRate">-</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Upload Success</div>
                            <div class="metric-value" id="uploadSuccessRate">-</div>
                        </div>
                    </div>
                </div>

                <!-- Health Status -->
                <div class="health-status" id="healthStatus">
                    <div class="health-indicator healthy" id="healthIndicator">
                        <i class="fas fa-heart"></i>
                        <span>System gesund</span>
                    </div>
                </div>

                <!-- Performance Chart -->
                <div class="performance-chart" id="performanceChart">
                    <canvas id="metricsChart" width="300" height="120"></canvas>
                </div>
            </div>
        `;
    }

    async collectInitialMetrics() {
        // System metrics
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.metrics.system.loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart);
                this.metrics.system.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart);
                this.metrics.system.firstPaint = Math.round(navigation.loadEventEnd - navigation.fetchStart);
            }
        }

        // Memory metrics (if available)
        if ('memory' in performance) {
            this.metrics.system.memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // MB
            this.metrics.system.memoryTotal = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024); // MB
            this.metrics.system.memoryLimit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024); // MB
        }

        // Connection info
        if ('connection' in navigator) {
            this.metrics.system.connectionType = navigator.connection.effectiveType;
            this.metrics.system.downlink = navigator.connection.downlink;
        }

        // User session metrics
        this.metrics.user.sessionStart = Date.now();
        this.metrics.user.pageViews = this.getStoredMetric('pageViews', 0) + 1;
        this.metrics.user.totalSessions = this.getStoredMetric('totalSessions', 0) + 1;

        this.storeMetric('pageViews', this.metrics.user.pageViews);
        this.storeMetric('totalSessions', this.metrics.user.totalSessions);
    }

    updateAllMetrics() {
        this.updateSystemMetrics();
        this.updateUserMetrics();
        this.updateApplicationMetrics();
        this.updateHealthStatus();
    }

    updateSystemMetrics() {
        // Load Time
        const loadTimeElement = this.container.querySelector('#loadTime');
        if (loadTimeElement && this.metrics.system.loadTime) {
            loadTimeElement.textContent = `${this.metrics.system.loadTime}ms`;
            this.updateTrend('loadTimeTrend', this.metrics.system.loadTime, 'lower-is-better');
        }

        // Memory Usage
        const memoryElement = this.container.querySelector('#memoryUsage');
        if (memoryElement && this.metrics.system.memoryUsed) {
            memoryElement.textContent = `${this.metrics.system.memoryUsed}MB`;
            this.updateTrend('memoryTrend', this.metrics.system.memoryUsed, 'lower-is-better');
        }

        // Frame Rate (approximate)
        this.measureFrameRate((fps) => {
            const fpsElement = this.container.querySelector('#frameRate');
            if (fpsElement) {
                fpsElement.textContent = `${fps}fps`;
                this.updateTrend('fpsTrend', fps, 'higher-is-better');
            }
        });

        // Lighthouse Score (simulated)
        const lighthouseElement = this.container.querySelector('#lighthouseScore');
        if (lighthouseElement) {
            const estimatedScore = this.calculateLighthouseScore();
            lighthouseElement.textContent = `${estimatedScore}/100`;
            this.updateTrend('lighthouseTrend', estimatedScore, 'higher-is-better');
        }
    }

    updateUserMetrics() {
        // Session Time
        const sessionTimeElement = this.container.querySelector('#sessionTime');
        if (sessionTimeElement) {
            const sessionTime = Math.floor((Date.now() - this.metrics.user.sessionStart) / 1000 / 60); // minutes
            sessionTimeElement.textContent = `${sessionTime}min`;
        }

        // User Actions
        const actionsElement = this.container.querySelector('#userActions');
        if (actionsElement) {
            const actions = this.getStoredMetric('userActions', 0);
            actionsElement.textContent = actions.toString();
        }

        // Click Count
        const clickElement = this.container.querySelector('#clickCount');
        if (clickElement) {
            const clicks = this.getStoredMetric('clickCount', 0);
            clickElement.textContent = clicks.toString();
        }

        // Average Page Time
        const avgTimeElement = this.container.querySelector('#avgPageTime');
        if (avgTimeElement) {
            const avgTime = this.getStoredMetric('avgPageTime', 0);
            avgTimeElement.textContent = `${avgTime}s`;
        }
    }

    updateApplicationMetrics() {
        // API Calls
        const apiCallsElement = this.container.querySelector('#apiCalls');
        if (apiCallsElement) {
            const apiCalls = this.getStoredMetric('apiCalls', 0);
            apiCallsElement.textContent = apiCalls.toString();
        }

        // Cache Hit Rate
        const cacheElement = this.container.querySelector('#cacheHitRate');
        if (cacheElement) {
            const hitRate = this.calculateCacheHitRate();
            cacheElement.textContent = `${hitRate}%`;
        }

        // Error Rate
        const errorElement = this.container.querySelector('#errorRate');
        if (errorElement) {
            const errorRate = this.calculateErrorRate();
            errorElement.textContent = `${errorRate}%`;
        }

        // Upload Success Rate
        const uploadElement = this.container.querySelector('#uploadSuccessRate');
        if (uploadElement) {
            const uploadRate = this.calculateUploadSuccessRate();
            uploadElement.textContent = `${uploadRate}%`;
        }
    }

    updateHealthStatus() {
        const indicator = this.container.querySelector('#healthIndicator');
        if (!indicator) return;

        const health = this.calculateOverallHealth();
        
        indicator.className = `health-indicator ${health.status}`;
        indicator.innerHTML = `
            <i class="fas ${health.icon}"></i>
            <span>${health.message}</span>
        `;
    }

    calculateOverallHealth() {
        let score = 100;
        let issues = [];

        // Check system metrics
        if (this.metrics.system.memoryUsed > 50) {
            score -= 20;
            issues.push('Hoher Speicherverbrauch');
        }

        if (this.metrics.system.loadTime > 2000) {
            score -= 15;
            issues.push('Langsame Ladezeit');
        }

        // Check error rates
        const errorRate = this.calculateErrorRate();
        if (errorRate > 5) {
            score -= 25;
            issues.push('Erhöhte Fehlerrate');
        }

        // Determine status
        if (score >= 90) {
            return {
                status: 'healthy',
                icon: 'fa-heart',
                message: 'System läuft optimal'
            };
        } else if (score >= 70) {
            return {
                status: 'warning',
                icon: 'fa-exclamation-triangle',
                message: `System OK (${issues.length} Warnung${issues.length > 1 ? 'en' : ''})`
            };
        } else {
            return {
                status: 'critical',
                icon: 'fa-exclamation-circle',
                message: `System-Probleme (${issues.length} Fehler)`
            };
        }
    }

    measureFrameRate(callback) {
        let frames = 0;
        let lastTime = performance.now();
        
        const measureFrame = (currentTime) => {
            frames++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round(frames * 1000 / (currentTime - lastTime));
                callback(fps);
                frames = 0;
                lastTime = currentTime;
                return;
            }
            
            requestAnimationFrame(measureFrame);
        };
        
        requestAnimationFrame(measureFrame);
    }

    calculateLighthouseScore() {
        // Simplified Lighthouse score estimation
        let score = 100;
        
        // Performance factors
        if (this.metrics.system.loadTime > 3000) score -= 30;
        else if (this.metrics.system.loadTime > 1500) score -= 15;
        
        if (this.metrics.system.memoryUsed > 25) score -= 10;
        
        // Accessibility (basic check)
        const hasAltTags = document.querySelectorAll('img[alt]').length > 0;
        if (!hasAltTags) score -= 10;
        
        // SEO (basic check)
        const hasMetaDescription = document.querySelector('meta[name="description"]') !== null;
        if (!hasMetaDescription) score -= 5;
        
        // Best Practices
        const hasServiceWorker = 'serviceWorker' in navigator;
        if (!hasServiceWorker) score -= 5;
        
        return Math.max(0, Math.min(100, score));
    }

    calculateCacheHitRate() {
        const hits = this.getStoredMetric('cacheHits', 0);
        const misses = this.getStoredMetric('cacheMisses', 0);
        const total = hits + misses;
        
        return total > 0 ? Math.round((hits / total) * 100) : 0;
    }

    calculateErrorRate() {
        const errors = this.getStoredMetric('errorCount', 0);
        const total = this.getStoredMetric('totalRequests', 0);
        
        return total > 0 ? Math.round((errors / total) * 100) : 0;
    }

    calculateUploadSuccessRate() {
        const successful = this.getStoredMetric('uploadsSuccessful', 0);
        const total = this.getStoredMetric('uploadsTotal', 0);
        
        return total > 0 ? Math.round((successful / total) * 100) : 100;
    }

    updateTrend(elementId, currentValue, direction = 'higher-is-better') {
        const element = this.container.querySelector(`#${elementId}`);
        if (!element) return;

        const metricKey = elementId.replace('Trend', '');
        const previousValue = this.getStoredMetric(`previous_${metricKey}`, currentValue);
        
        if (previousValue === currentValue) {
            element.innerHTML = '<i class="fas fa-minus"></i>';
            element.className = 'metric-trend neutral';
            return;
        }

        const isImproving = direction === 'higher-is-better' 
            ? currentValue > previousValue
            : currentValue < previousValue;
            
        const change = Math.abs(currentValue - previousValue);
        const percentChange = previousValue > 0 ? Math.round((change / previousValue) * 100) : 0;

        element.innerHTML = `
            <i class="fas fa-arrow-${isImproving ? 'up' : 'down'}"></i>
            <span>${percentChange}%</span>
        `;
        element.className = `metric-trend ${isImproving ? 'positive' : 'negative'}`;
        
        this.storeMetric(`previous_${metricKey}`, currentValue);
    }

    setupEventListeners() {
        // Track user interactions
        if (this.options.enableUserAnalytics) {
            this.trackUserInteractions();
        }

        // Monitor API calls
        if (this.options.enableSystemMetrics) {
            this.monitorAPIPerformance();
        }

        // Error monitoring
        window.addEventListener('error', (e) => {
            this.trackError(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(e.reason);
        });
    }

    trackUserInteractions() {
        let clickCount = 0;
        let lastActionTime = Date.now();

        document.addEventListener('click', () => {
            clickCount++;
            this.storeMetric('clickCount', clickCount);
            
            // Update last action time for session tracking
            lastActionTime = Date.now();
        });

        // Track page engagement
        let engagementTime = 0;
        let isActive = true;
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isActive = false;
            } else {
                isActive = true;
                lastActionTime = Date.now();
            }
        });

        // Update engagement time periodically
        setInterval(() => {
            if (isActive) {
                engagementTime += 1;
                this.storeMetric('engagementTime', engagementTime);
            }
        }, 1000);
    }

    monitorAPIPerformance() {
        // Intercept fetch requests to monitor API performance
        const originalFetch = window.fetch;
        let apiCallCount = 0;
        let totalResponseTime = 0;

        window.fetch = async (...args) => {
            const startTime = performance.now();
            apiCallCount++;
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                totalResponseTime += responseTime;
                
                this.storeMetric('apiCalls', apiCallCount);
                this.storeMetric('avgApiResponseTime', Math.round(totalResponseTime / apiCallCount));
                
                if (response.ok) {
                    this.incrementMetric('apiSuccesses');
                } else {
                    this.incrementMetric('apiErrors');
                }
                
                return response;
            } catch (error) {
                this.incrementMetric('apiErrors');
                throw error;
            }
        };
    }

    trackError(error) {
        console.error('Performance Metrics - Error tracked:', error);
        this.incrementMetric('errorCount');
        this.incrementMetric('totalRequests');
    }

    startRealTimeMonitoring() {
        if (this.options.enableRealTimeMonitoring) {
            this.updateTimer = setInterval(() => {
                this.updateAllMetrics();
                this.recordMetricsSnapshot();
            }, this.options.updateInterval);
        }
    }

    stopRealTimeMonitoring() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    recordMetricsSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            system: { ...this.metrics.system },
            user: { ...this.metrics.user },
            application: { ...this.metrics.application }
        };

        this.metricsHistory.push(snapshot);
        
        // Limit history size
        if (this.metricsHistory.length > this.options.historyLimit) {
            this.metricsHistory = this.metricsHistory.slice(-this.options.historyLimit);
        }
    }

    // 💾 Storage Methods
    getStoredMetric(key, defaultValue = 0) {
        try {
            const stored = localStorage.getItem(`metric_${key}`);
            return stored ? parseInt(stored) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }

    storeMetric(key, value) {
        try {
            localStorage.setItem(`metric_${key}`, value.toString());
        } catch (error) {
            console.error('Error storing metric:', error);
        }
    }

    incrementMetric(key) {
        const current = this.getStoredMetric(key, 0);
        this.storeMetric(key, current + 1);
    }

    // 📊 Export
    exportMetrics() {
        const exportData = {
            timestamp: new Date().toISOString(),
            currentMetrics: this.metrics,
            history: this.metricsHistory,
            summary: {
                sessionTime: Math.floor((Date.now() - this.metrics.user.sessionStart) / 1000 / 60),
                totalPageViews: this.metrics.user.pageViews,
                totalSessions: this.metrics.user.totalSessions,
                averageLoadTime: this.metrics.system.loadTime,
                memoryUsage: this.metrics.system.memoryUsed,
                errorRate: this.calculateErrorRate()
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_metrics_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async refresh() {
        await this.collectInitialMetrics();
        this.updateAllMetrics();
    }

    // 🧹 Cleanup
    destroy() {
        this.stopRealTimeMonitoring();
        this.observers = [];
        this.metrics = { system: {}, user: {}, application: {} };
        this.metricsHistory = [];
        this.container.innerHTML = '';
    }
}

// Global reference
window.performanceMetrics = null;
export function setGlobalPerformanceMetrics(instance) {
    window.performanceMetrics = instance;
}
