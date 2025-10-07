// ⚡ Performance Optimizer - 2024/2025 Web Performance Best Practices
// Core Web Vitals, Resource Hints, Code Splitting, Memory Management

export class PerformanceOptimizer {
    constructor(options = {}) {
        this.config = {
            enableWebVitals: options.enableWebVitals !== false,
            enableResourceHints: options.enableResourceHints !== false,
            enableCodeSplitting: options.enableCodeSplitting !== false,
            enableMemoryManagement: options.enableMemoryManagement !== false,
            enableImageOptimization: options.enableImageOptimization !== false,
            enableServiceWorker: options.enableServiceWorker || false,
            performanceBudget: options.performanceBudget || {
                fcp: 1800, // First Contentful Paint
                lcp: 2500, // Largest Contentful Paint  
                fid: 100,  // First Input Delay
                cls: 0.1,  // Cumulative Layout Shift
                ttfb: 800, // Time to First Byte
                bundle: 250 * 1024 // 250KB
            },
            ...options
        };

        this.metrics = new Map();
        this.observers = [];
        this.resourceHints = new Set();
        this.memoryMonitor = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('⚡ Initializing Performance Optimizer...');
            
            await this.setupWebVitalsTracking();
            this.setupResourceHints();
            this.setupMemoryManagement();
            this.setupImageOptimization();
            this.injectPerformanceCSS();
            
            // Start monitoring
            this.startPerformanceMonitoring();
            
            this.isInitialized = true;
            console.log('✅ Performance Optimizer initialized');
            
            // Run initial performance audit
            setTimeout(() => this.runPerformanceAudit(), 2000);
            
        } catch (error) {
            console.error('❌ Performance Optimizer initialization failed:', error);
        }
    }

    // 📊 Web Vitals Tracking (2024 Standards)
    async setupWebVitalsTracking() {
        if (!this.config.enableWebVitals) return;

        // Core Web Vitals measurement
        const vitals = {
            fcp: null,
            lcp: null,
            fid: null,
            cls: null,
            ttfb: null
        };

        // First Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.name === 'first-contentful-paint') {
                    vitals.fcp = Math.round(entry.startTime);
                    this.trackVital('FCP', vitals.fcp, this.config.performanceBudget.fcp);
                }
            });
        }).observe({ type: 'paint', buffered: true });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries[entries.length - 1];
            vitals.lcp = Math.round(lcp.startTime);
            this.trackVital('LCP', vitals.lcp, this.config.performanceBudget.lcp);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                vitals.fid = Math.round(entry.processingStart - entry.startTime);
                this.trackVital('FID', vitals.fid, this.config.performanceBudget.fid);
            });
        }).observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            vitals.cls = Math.round(clsValue * 10000) / 10000;
            this.trackVital('CLS', vitals.cls, this.config.performanceBudget.cls);
        }).observe({ type: 'layout-shift', buffered: true });

        // Time to First Byte
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            vitals.ttfb = Math.round(navigation.responseStart - navigation.requestStart);
            this.trackVital('TTFB', vitals.ttfb, this.config.performanceBudget.ttfb);
        }

        this.webVitals = vitals;
    }

    trackVital(name, value, budget) {
        const status = value <= budget ? '✅' : '⚠️';
        const percentOfBudget = Math.round((value / budget) * 100);
        
        console.log(`${status} ${name}: ${value}ms (${percentOfBudget}% of budget)`);
        
        this.metrics.set(name, { value, budget, status, percentOfBudget });
        
        // Send to analytics if available
        if (window.gtag) {
            window.gtag('event', 'web_vital', {
                name: name,
                value: value,
                within_budget: value <= budget
            });
        }
    }

    // 🔗 Resource Hints for Better Loading
    setupResourceHints() {
        if (!this.config.enableResourceHints) return;

        const hints = [
            // DNS prefetch for external resources
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
            { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
            
            // Preconnect for critical resources
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
            
            // Module preload for critical JavaScript
            { rel: 'modulepreload', href: './js/modules/applications/ApplicationManager.js' },
            { rel: 'modulepreload', href: './js/modules/applications/ApplicationCore.js' },
            
            // Prefetch for likely next pages
            { rel: 'prefetch', href: './ki-strategie-workflow.html' },
            { rel: 'prefetch', href: './persoenlichkeitsentwicklung.html' }
        ];

        hints.forEach(hint => {
            if (!this.resourceHints.has(hint.href)) {
                const link = document.createElement('link');
                Object.assign(link, hint);
                document.head.appendChild(link);
                this.resourceHints.add(hint.href);
            }
        });

        console.log('🔗 Resource hints added:', hints.length);
    }

    // 🧠 Memory Management
    setupMemoryManagement() {
        if (!this.config.enableMemoryManagement) return;

        // Memory usage monitoring
        if ('memory' in performance) {
            this.memoryMonitor = setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
                const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
                
                this.metrics.set('memory', { used: usedMB, total: totalMB, limit: limitMB });
                
                // Warning if memory usage is high
                const usagePercent = (usedMB / limitMB) * 100;
                if (usagePercent > 70) {
                    console.warn(`⚠️ High memory usage: ${usedMB}MB (${usagePercent.toFixed(1)}%)`);
                    this.triggerGarbageCollection();
                }
            }, 30000); // Check every 30 seconds
        }

        // Cleanup event listeners for memory leaks
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Visibility change optimizations
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseNonCriticalOperations();
            } else {
                this.resumeOperations();
            }
        });

        console.log('🧠 Memory management active');
    }

    triggerGarbageCollection() {
        // Force garbage collection if available (Chrome DevTools)
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
            console.log('🗑️ Garbage collection triggered');
        }
        
        // Clear caches that might hold references
        if (window.applicationManager?.modules?.api) {
            window.applicationManager.modules.api.clearCache();
        }
        
        // Clean up event listeners
        this.cleanupEventListeners();
    }

    cleanupEventListeners() {
        // Remove unused event listeners to prevent memory leaks
        const elementsWithListeners = document.querySelectorAll('[data-has-listeners]');
        elementsWithListeners.forEach(element => {
            // Clone element to remove all event listeners
            const newElement = element.cloneNode(true);
            element.parentNode?.replaceChild(newElement, element);
        });
    }

    // 🖼️ Image Optimization
    setupImageOptimization() {
        if (!this.config.enableImageOptimization) return;

        // Intersection Observer for lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load high-quality version
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Add loading animation
                    img.style.transition = 'opacity 0.3s ease';
                    img.style.opacity = '1';
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Modern image formats with fallbacks
        this.setupModernImageFormats();
        
        console.log('🖼️ Image optimization active');
    }

    setupModernImageFormats() {
        // Replace images with modern formats where supported
        const images = document.querySelectorAll('img[src$=".jpg"], img[src$=".png"]');
        
        images.forEach(img => {
            const picture = document.createElement('picture');
            
            // WebP version
            const webpSource = document.createElement('source');
            webpSource.srcset = img.src.replace(/\.(jpg|png)$/, '.webp');
            webpSource.type = 'image/webp';
            
            // AVIF version (even better compression)
            const avifSource = document.createElement('source');
            avifSource.srcset = img.src.replace(/\.(jpg|png)$/, '.avif');
            avifSource.type = 'image/avif';
            
            picture.appendChild(avifSource);
            picture.appendChild(webpSource);
            picture.appendChild(img.cloneNode(true));
            
            img.parentNode?.replaceChild(picture, img);
        });
    }

    // 📦 Code Splitting Optimizer
    async optimizeCodeSplitting() {
        if (!this.config.enableCodeSplitting) return;

        // Dynamic imports for non-critical modules
        const nonCriticalModules = [
            './components/ChartsWidget.js',
            './components/PerformanceMetrics.js',
            './components/NotificationCenter.js'
        ];

        // Preload critical modules
        const criticalModules = [
            './ApplicationManager.js',
            './ApplicationCore.js',
            './DashboardCore.js'
        ];

        // Add modulepreload hints for critical modules
        criticalModules.forEach(moduleUrl => {
            const link = document.createElement('link');
            link.rel = 'modulepreload';
            link.href = moduleUrl;
            document.head.appendChild(link);
        });

        // Prefetch non-critical modules
        nonCriticalModules.forEach(moduleUrl => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = moduleUrl;
            document.head.appendChild(link);
        });

        console.log('📦 Code splitting optimized');
    }

    // 🔧 Performance CSS Injection
    injectPerformanceCSS() {
        const performanceCSS = `
            /* ⚡ Performance-optimized CSS */
            
            /* GPU acceleration for animations */
            .animate-on-scroll {
                will-change: transform;
                transform: translateZ(0);
            }
            
            .animation-finished {
                will-change: auto;
            }
            
            /* Efficient repaints */
            .isolated-layer {
                isolation: isolate;
            }
            
            /* Content-visibility for performance */
            .below-fold {
                content-visibility: auto;
                contain-intrinsic-size: 400px;
            }
            
            .above-fold {
                content-visibility: visible;
            }
            
            /* Efficient grid layouts */
            .performance-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
                gap: clamp(1rem, 2vw, 2rem);
            }
            
            /* Optimized transforms */
            .smooth-hover {
                transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            .smooth-hover:hover {
                transform: translateY(-2px) scale(1.02);
            }
            
            /* Contain layout thrashing */
            .stable-layout {
                contain: layout style;
            }
            
            /* Efficient scrolling */
            .smooth-scroll {
                scroll-behavior: smooth;
                scroll-padding-top: 2rem;
            }
            
            /* Critical path optimization */
            @media (max-width: 768px) {
                .desktop-only {
                    display: none;
                }
            }
            
            @media (min-width: 769px) {
                .mobile-only {
                    display: none;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'performance-optimizations';
        style.textContent = performanceCSS;
        document.head.appendChild(style);
    }

    // 📊 Performance Monitoring
    startPerformanceMonitoring() {
        // Long Tasks monitoring
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        console.warn(`🐌 Long task detected: ${Math.round(entry.duration)}ms`);
                        this.metrics.set('longTask', {
                            duration: entry.duration,
                            timestamp: entry.startTime
                        });
                    }
                });
            }).observe({ type: 'longtask' });
        }

        // Resource loading performance
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.transferSize > 100 * 1024) { // Resources > 100KB
                    console.warn(`📦 Large resource: ${entry.name} (${Math.round(entry.transferSize / 1024)}KB)`);
                }
            });
        }).observe({ type: 'resource' });

        // Frame timing (for smooth animations)
        this.monitorFrameRates();
    }

    monitorFrameRates() {
        let frames = 0;
        let startTime = performance.now();
        let dropped = 0;

        const checkFrame = (currentTime) => {
            frames++;
            
            // Check for dropped frames
            const expectedFrames = Math.floor((currentTime - startTime) / (1000 / 60));
            if (frames < expectedFrames * 0.95) { // Allow 5% tolerance
                dropped++;
                if (dropped > 10) {
                    console.warn('🎬 Animation performance degraded - consider reducing complexity');
                    this.optimizeAnimations();
                    dropped = 0;
                }
            }
            
            // Reset every second
            if (currentTime - startTime >= 1000) {
                const fps = Math.round(frames * 1000 / (currentTime - startTime));
                this.metrics.set('fps', fps);
                
                if (fps < 30) {
                    console.warn(`🎬 Low FPS detected: ${fps}fps`);
                }
                
                frames = 0;
                startTime = currentTime;
            }
            
            requestAnimationFrame(checkFrame);
        };

        requestAnimationFrame(checkFrame);
    }

    // 🎨 Animation Optimization
    optimizeAnimations() {
        // Reduce animation complexity on performance issues
        document.querySelectorAll('.complex-animation').forEach(element => {
            element.classList.add('simple-animation');
            element.classList.remove('complex-animation');
        });

        // Disable non-essential animations
        document.querySelectorAll('.optional-animation').forEach(element => {
            element.style.animation = 'none';
        });

        console.log('🎨 Animations optimized for performance');
    }

    // 🏃 Bundle Size Optimization
    async optimizeBundleSize() {
        const moduleSize = await this.calculateModuleSize();
        
        if (moduleSize > this.config.performanceBudget.bundle) {
            console.warn(`📦 Bundle size exceeds budget: ${Math.round(moduleSize / 1024)}KB`);
            
            // Suggest optimizations
            this.suggestBundleOptimizations(moduleSize);
        }
    }

    async calculateModuleSize() {
        // Estimate JavaScript bundle size
        const scripts = document.querySelectorAll('script[src]');
        let totalSize = 0;
        
        for (const script of scripts) {
            try {
                const response = await fetch(script.src, { method: 'HEAD' });
                const contentLength = response.headers.get('content-length');
                if (contentLength) {
                    totalSize += parseInt(contentLength);
                }
            } catch (error) {
                console.warn(`Could not get size for ${script.src}`);
            }
        }
        
        return totalSize;
    }

    suggestBundleOptimizations(currentSize) {
        const suggestions = [
            '📦 Consider tree-shaking unused code',
            '🔄 Implement code splitting for non-critical modules',
            '📝 Use dynamic imports for conditional features',
            '🗜️ Enable gzip/brotli compression on server',
            '📱 Consider separate mobile bundle'
        ];

        console.log('💡 Bundle optimization suggestions:');
        suggestions.forEach(suggestion => console.log(`  ${suggestion}`);
    }

    // 🎯 Critical Path Optimization
    optimizeCriticalPath() {
        // Identify critical CSS
        const criticalCSS = this.extractCriticalCSS();
        
        // Inline critical CSS
        const criticalStyle = document.createElement('style');
        criticalStyle.innerHTML = criticalCSS;
        document.head.insertBefore(criticalStyle, document.head.firstChild);
        
        // Defer non-critical CSS
        const nonCriticalLinks = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        nonCriticalLinks.forEach(link => {
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
        });
    }

    extractCriticalCSS() {
        // Extract CSS rules for above-fold content
        const criticalSelectors = [
            '.app-header',
            '.app-sidebar',
            '.loading-spinner',
            '.hero-section',
            '.navigation'
        ];
        
        let criticalCSS = '';
        
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.type === CSSRule.STYLE_RULE) {
                        const selector = rule.selectorText;
                        if (criticalSelectors.some(critical => selector.includes(critical))) {
                            criticalCSS += rule.cssText + '\n';
                        }
                    }
                }
            } catch (error) {
                // Cross-origin stylesheet, skip
                console.warn('Could not read stylesheet rules');
            }
        }
        
        return criticalCSS;
    }

    // 📊 Performance Audit
    async runPerformanceAudit() {
        console.log('🔍 Running Performance Audit...');
        
        const audit = {
            timestamp: new Date().toISOString(),
            webVitals: this.webVitals,
            metrics: Object.fromEntries(this.metrics),
            suggestions: []
        };

        // Check Web Vitals against budgets
        Object.entries(this.config.performanceBudget).forEach(([metric, budget]) => {
            const vital = this.webVitals[metric];
            if (vital && vital > budget) {
                audit.suggestions.push({
                    type: 'performance',
                    severity: 'high',
                    message: `${metric.toUpperCase()} exceeds budget: ${vital}ms > ${budget}ms`,
                    recommendation: this.getPerformanceRecommendation(metric)
                });
            }
        });

        // Memory usage check
        const memoryMetric = this.metrics.get('memory');
        if (memoryMetric) {
            const usagePercent = (memoryMetric.used / memoryMetric.limit) * 100;
            if (usagePercent > 60) {
                audit.suggestions.push({
                    type: 'memory',
                    severity: usagePercent > 80 ? 'critical' : 'medium',
                    message: `High memory usage: ${memoryMetric.used}MB (${usagePercent.toFixed(1)}%)`,
                    recommendation: 'Consider cleaning up unused data and event listeners'
                });
            }
        }

        // FPS check
        const fpsMetric = this.metrics.get('fps');
        if (fpsMetric && fpsMetric < 30) {
            audit.suggestions.push({
                type: 'rendering',
                severity: 'medium',
                message: `Low frame rate: ${fpsMetric}fps`,
                recommendation: 'Reduce animation complexity or use CSS transforms'
            });
        }

        console.log('📊 Performance Audit Results:', audit);
        return audit;
    }

    getPerformanceRecommendation(metric) {
        const recommendations = {
            fcp: 'Optimize critical rendering path, inline critical CSS',
            lcp: 'Optimize largest elements, use responsive images',
            fid: 'Reduce JavaScript execution time, use web workers',
            cls: 'Set dimensions on images and ads, avoid dynamic content',
            ttfb: 'Optimize server response time, use CDN'
        };
        
        return recommendations[metric] || 'Consult performance best practices';
    }

    // 🔄 Operation Management
    pauseNonCriticalOperations() {
        // Pause timers and animations when page is hidden
        clearInterval(this.memoryMonitor);
        
        // Pause any running animations
        document.querySelectorAll('.pause-when-hidden').forEach(element => {
            element.style.animationPlayState = 'paused';
        });
        
        console.log('⏸️ Non-critical operations paused');
    }

    resumeOperations() {
        // Resume operations when page is visible again
        if (this.config.enableMemoryManagement) {
            this.setupMemoryManagement();
        }
        
        // Resume animations
        document.querySelectorAll('.pause-when-hidden').forEach(element => {
            element.style.animationPlayState = 'running';
        });
        
        console.log('▶️ Operations resumed');
    }

    // 📊 Public API
    getMetrics() {
        return {
            webVitals: this.webVitals,
            metrics: Object.fromEntries(this.metrics),
            resourceHints: Array.from(this.resourceHints)
        };
    }

    async getPerformanceReport() {
        const audit = await this.runPerformanceAudit();
        const metrics = this.getMetrics();
        
        return {
            ...audit,
            ...metrics,
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Based on current metrics
        const memory = this.metrics.get('memory');
        if (memory && (memory.used / memory.limit) > 0.5) {
            recommendations.push('Consider implementing memory cleanup strategies');
        }
        
        const fps = this.metrics.get('fps');
        if (fps && fps < 45) {
            recommendations.push('Optimize animations for better frame rates');
        }
        
        return recommendations;
    }

    // 🧹 Cleanup
    cleanup() {
        if (this.memoryMonitor) {
            clearInterval(this.memoryMonitor);
        }
        
        this.observers.forEach(observer => {
            if (observer.disconnect) {
                observer.disconnect();
            }
        });
        
        this.metrics.clear();
        this.resourceHints.clear();
        
        console.log('🧹 Performance Optimizer cleaned up');
    }

    destroy() {
        this.cleanup();
        this.isInitialized = false;
    }
}

// 🏭 Factory function
export function createPerformanceOptimizer(options) {
    return new PerformanceOptimizer(options);
}

// 🌐 Global Performance Optimizer
let globalPerformanceOptimizer = null;

export function initializeGlobalPerformanceOptimizer(options = {}) {
    if (!globalPerformanceOptimizer) {
        globalPerformanceOptimizer = createPerformanceOptimizer(options);
        
        // Make available globally for debugging
        window.performanceOptimizer = globalPerformanceOptimizer;
    }
    
    return globalPerformanceOptimizer;
}

export function getGlobalPerformanceOptimizer() {
    return globalPerformanceOptimizer;
}
