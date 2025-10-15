/**
 * Performance Monitor
 * Überwacht und optimiert die Performance des Admin Panels
 */
class AdminPerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            sectionLoadTimes: new Map(),
            memoryUsage: 0,
            networkRequests: 0,
            cacheHitRate: 0,
            userInteractions: 0
        };
        this.observers = [];
        this.isMonitoring = false;
    }
    
    /**
     * Monitoring starten
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.setupPerformanceObservers();
        this.setupMemoryMonitoring();
        this.setupNetworkMonitoring();
        this.setupUserInteractionTracking();
        
        console.log('Performance monitoring started');
    }
    
    /**
     * Performance Observer einrichten
     */
    setupPerformanceObservers() {
        if ('PerformanceObserver' in window) {
            // Navigation Timing
            const navObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        this.metrics.pageLoadTime = entry.loadEventEnd - entry.loadEventStart;
                    }
                });
            });
            navObserver.observe({ entryTypes: ['navigation'] });
            
            // Resource Timing
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name.includes('admin/sections/')) {
                        const sectionId = this.extractSectionId(entry.name);
                        this.metrics.sectionLoadTimes.set(sectionId, entry.duration);
                    }
                });
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
            
            this.observers.push(navObserver, resourceObserver);
        }
    }
    
    /**
     * Memory Monitoring einrichten
     */
    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
            }, 5000);
        }
    }
    
    /**
     * Network Monitoring einrichten
     */
    setupNetworkMonitoring() {
        if ('PerformanceObserver' in window) {
            const networkObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'resource') {
                        this.metrics.networkRequests++;
                    }
                });
            });
            networkObserver.observe({ entryTypes: ['resource'] });
            this.observers.push(networkObserver);
        }
    }
    
    /**
     * User Interaction Tracking
     */
    setupUserInteractionTracking() {
        const interactionEvents = ['click', 'keydown', 'scroll', 'resize'];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                this.metrics.userInteractions++;
            }, { passive: true });
        });
    }
    
    /**
     * Section ID aus URL extrahieren
     */
    extractSectionId(url) {
        const match = url.match(/admin\/sections\/([^\/]+)\.html/);
        return match ? match[1] : 'unknown';
    }
    
    /**
     * Performance-Metriken abrufen
     */
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            connectionType: this.getConnectionType(),
            deviceMemory: this.getDeviceMemory()
        };
    }
    
    /**
     * Verbindungstyp ermitteln
     */
    getConnectionType() {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }
    
    /**
     * Gerätespeicher ermitteln
     */
    getDeviceMemory() {
        if ('deviceMemory' in navigator) {
            return navigator.deviceMemory;
        }
        return 'unknown';
    }
    
    /**
     * Performance-Report generieren
     */
    generateReport() {
        const metrics = this.getMetrics();
        const report = {
            summary: {
                pageLoadTime: metrics.pageLoadTime,
                averageSectionLoadTime: this.calculateAverageSectionLoadTime(),
                memoryUsage: metrics.memoryUsage,
                networkRequests: metrics.networkRequests,
                cacheHitRate: metrics.cacheHitRate,
                userInteractions: metrics.userInteractions
            },
            details: metrics,
            recommendations: this.generateRecommendations(metrics)
        };
        
        return report;
    }
    
    /**
     * Durchschnittliche Section-Ladezeit berechnen
     */
    calculateAverageSectionLoadTime() {
        const times = Array.from(this.metrics.sectionLoadTimes.values());
        return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    }
    
    /**
     * Performance-Empfehlungen generieren
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.pageLoadTime > 3000) {
            recommendations.push({
                type: 'warning',
                message: 'Page load time is slow (>3s). Consider optimizing initial bundle size.',
                action: 'Implement code splitting and lazy loading'
            });
        }
        
        if (metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
            recommendations.push({
                type: 'warning',
                message: 'High memory usage detected. Consider implementing memory cleanup.',
                action: 'Add memory cleanup for unused sections'
            });
        }
        
        if (metrics.cacheHitRate < 50) {
            recommendations.push({
                type: 'info',
                message: 'Low cache hit rate. Consider improving caching strategy.',
                action: 'Implement more aggressive caching'
            });
        }
        
        if (metrics.networkRequests > 100) {
            recommendations.push({
                type: 'info',
                message: 'High number of network requests. Consider bundling resources.',
                action: 'Combine multiple requests into single bundles'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Performance-Alert senden
     */
    sendAlert(threshold, currentValue, metric) {
        if (currentValue > threshold) {
            console.warn(`Performance Alert: ${metric} exceeded threshold`, {
                threshold,
                currentValue,
                metric
            });
            
            // Optional: Send to analytics service
            this.sendToAnalytics({
                type: 'performance_alert',
                metric,
                threshold,
                currentValue
            });
        }
    }
    
    /**
     * Analytics-Daten senden
     */
    sendToAnalytics(data) {
        // Placeholder für Analytics-Integration
        console.log('Analytics data:', data);
    }
    
    /**
     * Monitoring stoppen
     */
    stopMonitoring() {
        this.isMonitoring = false;
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        console.log('Performance monitoring stopped');
    }
    
    /**
     * Cleanup
     */
    cleanup() {
        this.stopMonitoring();
        this.metrics = {
            pageLoadTime: 0,
            sectionLoadTimes: new Map(),
            memoryUsage: 0,
            networkRequests: 0,
            cacheHitRate: 0,
            userInteractions: 0
        };
    }
}

// Global verfügbar machen
window.AdminPerformanceMonitor = AdminPerformanceMonitor;
