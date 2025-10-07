// 🌟 Modern Website Enhancer - Nahtlose Integration moderner Features
// Verbindet neue Bewerbungsarchitektur mit bestehender Website-Infrastruktur

export class ModernWebsiteEnhancer {
    constructor(options = {}) {
        this.config = {
            enableCrossPageTransitions: options.enableCrossPageTransitions !== false,
            enableUnifiedNavigation: options.enableUnifiedNavigation !== false,
            enableProgressiveEnhancement: options.enableProgressiveEnhancement !== false,
            enableServiceIntegration: options.enableServiceIntegration !== false,
            enableSmartPreloading: options.enableSmartPreloading !== false,
            enableUnifiedTheme: options.enableUnifiedTheme !== false,
            baseUrl: options.baseUrl || window.location.origin,
            ...options
        };

        this.pageCache = new Map();
        this.preloadedModules = new Set();
        this.navigationObserver = null;
        this.intersectionObserver = null;
        this.isInitialized = false;

        this.init();
    }

    async init() {
        try {
            console.log('🌟 Initializing Modern Website Enhancer...');

            this.detectCurrentPage();
            this.setupUnifiedNavigation();
            this.setupProgressiveEnhancement();
            this.setupSmartPreloading();
            this.setupCrossServiceIntegration();
            this.setupUnifiedTheme();

            this.isInitialized = true;
            console.log('✅ Modern Website Enhancer initialized');

        } catch (error) {
            console.error('❌ Website Enhancer initialization failed:', error);
        }
    }

    // 🎯 Page Detection & Context
    detectCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        this.currentPage = page;
        this.pageType = this.getPageType(page);
        this.serviceContext = this.getServiceContext(page);
        
        console.log(`📍 Current page: ${this.currentPage} (${this.pageType})`);
        
        // Set page-specific enhancements
        this.applyPageSpecificEnhancements();
    }

    getPageType(page) {
        const typeMap = {
            'index.html': 'home',
            'applications-modern.html': 'app',
            'ki-strategie-workflow.html': 'workflow',
            'ki-strategieentwicklung.html': 'service',
            'persoenlichkeitsentwicklung.html': 'service',
            'admin.html': 'admin'
        };
        
        return typeMap[page] || 'page';
    }

    getServiceContext(page) {
        const contextMap = {
            'ai-digitalisierung.html': 'ai',
            'hr-transformation.html': 'hr',
            'ki-strategieentwicklung.html': 'strategy',
            'persoenlichkeitsentwicklung.html': 'development',
            'applications-modern.html': 'applications'
        };
        
        return contextMap[page] || null;
    }

    // 🎨 Unified Navigation System
    setupUnifiedNavigation() {
        if (!this.config.enableUnifiedNavigation) return;

        // Enhanced navigation with View Transitions
        this.enhanceNavigationLinks();
        this.setupIntelligentPrefetching();
        this.createGlobalNavigationState();
        
        console.log('🧭 Unified navigation system active');
    }

    enhanceNavigationLinks() {
        const navigationLinks = document.querySelectorAll('a[href$=".html"]');
        
        navigationLinks.forEach(link => {
            // Skip external links
            if (link.hostname !== window.location.hostname) return;
            
            link.addEventListener('click', async (e) => {
                const href = link.getAttribute('href');
                
                // Use View Transitions API if available
                if ('startViewTransition' in document && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    await this.navigateWithTransition(href);
                }
            });
            
            // Preload on hover (with delay to avoid unnecessary requests)
            let preloadTimeout;
            link.addEventListener('mouseenter', () => {
                preloadTimeout = setTimeout(() => {
                    this.preloadPage(link.href);
                }, 100);
            });
            
            link.addEventListener('mouseleave', () => {
                if (preloadTimeout) {
                    clearTimeout(preloadTimeout);
                }
            });
        });
    }

    async navigateWithTransition(url) {
        if (!('startViewTransition' in document)) {
            window.location.href = url;
            return;
        }

        try {
            // Start view transition
            const transition = document.startViewTransition(async () => {
                const response = await fetch(url);
                const html = await response.text();
                
                // Parse new document
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(html, 'text/html');
                
                // Update document title
                document.title = newDoc.title;
                
                // Update main content
                const newBody = newDoc.body;
                const currentBody = document.body;
                
                // Preserve scripts and maintain state
                this.preserveGlobalState();
                
                // Replace body content
                currentBody.innerHTML = newBody.innerHTML;
                
                // Re-initialize for new page
                this.reinitializeForNewPage(url);
                
                // Update history
                history.pushState({ url }, '', url);
            });

            await transition.finished;
            console.log(`✅ Navigated to ${url} with View Transition`);

        } catch (error) {
            console.error('Navigation failed:', error);
            window.location.href = url;
        }
    }

    // 🔄 Progressive Enhancement
    setupProgressiveEnhancement() {
        if (!this.config.enableProgressiveEnhancement) return;

        // Feature detection and graceful fallbacks
        this.featureSupport = {
            viewTransitions: 'startViewTransition' in document,
            containerQueries: CSS.supports('container-type', 'inline-size'),
            hasSelector: CSS.supports('selector(:has(.test))'),
            popoverAPI: 'popover' in HTMLElement.prototype,
            viewportUnits: CSS.supports('height', '100dvh'),
            cssNesting: CSS.supports('selector(& .test)'),
            webComponents: 'customElements' in window
        };

        console.log('📊 Feature Support:', this.featureSupport);

        // Apply progressive enhancement based on support
        this.applyProgressiveEnhancement();
    }

    applyProgressiveEnhancement() {
        // Enhance based on capabilities
        if (this.featureSupport.containerQueries) {
            document.documentElement.classList.add('supports-container-queries');
        }
        
        if (this.featureSupport.viewTransitions) {
            document.documentElement.classList.add('supports-view-transitions');
        }
        
        if (this.featureSupport.hasSelector) {
            document.documentElement.classList.add('supports-has-selector');
        }

        // Add enhancement styles
        const enhancementCSS = `
            /* Progressive Enhancement Styles */
            .supports-container-queries .responsive-component {
                container-type: inline-size;
            }
            
            .supports-view-transitions .page-link {
                cursor: pointer;
                transition: opacity 0.2s ease;
            }
            
            .supports-has-selector .form-container:has(input:focus) {
                box-shadow: 0 0 0 2px var(--primary);
            }
            
            /* Fallbacks for unsupported features */
            .no-container-queries .grid-responsive {
                display: flex;
                flex-wrap: wrap;
            }
            
            .no-view-transitions .page-transition {
                opacity: 1 !important;
                transform: none !important;
            }
        `;

        const style = document.createElement('style');
        style.textContent = enhancementCSS;
        document.head.appendChild(style);
    }

    // 🔗 Cross-Service Integration
    setupCrossServiceIntegration() {
        if (!this.config.enableServiceIntegration) return;

        // Unified service registry
        this.serviceRegistry = new Map([
            ['applications', {
                url: 'applications-modern.html',
                module: './js/modules/applications/ApplicationManager.js',
                preload: ['ApplicationCore.js', 'DashboardCore.js']
            }],
            ['ki-strategy', {
                url: 'ki-strategie-workflow.html',
                module: './js/ki-strategy/StrategyManager.js',
                preload: ['AssessmentEngine.js', 'RecommendationSystem.js']
            }],
            ['personality', {
                url: 'persoenlichkeitsentwicklung.html',
                module: './js/personality/PersonalityManager.js',
                preload: ['MethodLoader.js', 'ProgressTracker.js']
            }]
        ]);

        // Cross-service data sharing
        this.setupDataBridge();
        
        // Unified analytics across services
        this.setupUnifiedAnalytics();
        
        console.log('🔗 Cross-service integration active');
    }

    setupDataBridge() {
        // Create shared data layer between services
        window.unifiedDataBridge = {
            userData: this.loadUnifiedUserData(),
            serviceStates: new Map(),
            
            // Share data between services
            shareData: (serviceId, data) => {
                this.serviceStates.set(serviceId, data);
                this.saveUnifiedUserData();
                
                // Notify other services
                document.dispatchEvent(new CustomEvent('dataShared', {
                    detail: { serviceId, data }
                }));
            },
            
            // Get data from other services
            getData: (serviceId) => {
                return this.serviceStates.get(serviceId);
            },
            
            // Cross-service user preferences
            setUserPreference: (key, value) => {
                this.userData.preferences = this.userData.preferences || {};
                this.userData.preferences[key] = value;
                this.saveUnifiedUserData();
            },
            
            getUserPreference: (key, defaultValue) => {
                return this.userData.preferences?.[key] || defaultValue;
            }
        };

        // Listen for data sharing events
        document.addEventListener('dataShared', (e) => {
            console.log(`📊 Data shared from ${e.detail.serviceId}:`, e.detail.data);
        });
    }

    loadUnifiedUserData() {
        try {
            const stored = localStorage.getItem('unified_user_data');
            return stored ? JSON.parse(stored) : {
                preferences: {},
                analytics: {},
                crossServiceData: {}
            };
        } catch (error) {
            console.error('Error loading unified user data:', error);
            return { preferences: {}, analytics: {}, crossServiceData: {} };
        }
    }

    saveUnifiedUserData() {
        try {
            localStorage.setItem('unified_user_data', 
                JSON.stringify(window.unifiedDataBridge.userData));
        } catch (error) {
            console.error('Error saving unified user data:', error);
        }
    }

    // 📊 Unified Analytics
    setupUnifiedAnalytics() {
        window.unifiedAnalytics = {
            trackEvent: (category, action, label, value) => {
                // Internal analytics storage
                const event = {
                    category,
                    action,
                    label,
                    value,
                    timestamp: new Date().toISOString(),
                    page: this.currentPage,
                    service: this.serviceContext
                };
                
                this.storeAnalyticsEvent(event);
                
                // Send to external analytics if available
                if (window.gtag) {
                    window.gtag('event', action, {
                        event_category: category,
                        event_label: label,
                        value: value,
                        custom_map: {
                            page: this.currentPage,
                            service: this.serviceContext
                        }
                    });
                }
                
                console.log('📊 Event tracked:', event);
            },
            
            getAnalyticsData: () => {
                const stored = localStorage.getItem('unified_analytics');
                return stored ? JSON.parse(stored) : [];
            }
        };
    }

    storeAnalyticsEvent(event) {
        try {
            const analytics = JSON.parse(localStorage.getItem('unified_analytics') || '[]');
            analytics.push(event);
            
            // Keep only last 1000 events
            if (analytics.length > 1000) {
                analytics.splice(0, analytics.length - 1000);
            }
            
            localStorage.setItem('unified_analytics', JSON.stringify(analytics));
        } catch (error) {
            console.error('Error storing analytics event:', error);
        }
    }

    // 🚀 Smart Preloading System
    setupSmartPreloading() {
        if (!this.config.enableSmartPreloading) return;

        // Intelligent preloading based on user behavior
        this.setupBehaviorBasedPreloading();
        
        // Critical resource preloading
        this.preloadCriticalResources();
        
        // Intersection-based preloading
        this.setupIntersectionPreloading();
        
        console.log('🚀 Smart preloading system active');
    }

    setupBehaviorBasedPreloading() {
        // Track user navigation patterns
        const navigationPattern = this.getNavigationPattern();
        
        // Preload likely next pages based on current page
        const preloadMap = {
            'index.html': ['applications-modern.html', 'ki-strategieentwicklung.html'],
            'ki-strategieentwicklung.html': ['ki-strategie-workflow.html'],
            'applications-modern.html': ['ki-strategieentwicklung.html', 'persoenlichkeitsentwicklung.html']
        };
        
        const likelyPages = preloadMap[this.currentPage] || [];
        likelyPages.forEach(page => {
            this.preloadPage(page);
        });
    }

    preloadCriticalResources() {
        const criticalResources = [
            // Fonts
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
            // Icons
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
            // Critical modules for current service
            ...this.getCriticalModulesForCurrentPage()
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            
            if (resource.endsWith('.js')) {
                link.rel = 'modulepreload';
            } else if (resource.endsWith('.css')) {
                link.rel = 'preload';
                link.as = 'style';
            } else {
                link.rel = 'prefetch';
            }
            
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    getCriticalModulesForCurrentPage() {
        const moduleMap = {
            'applications-modern.html': [
                './js/modules/applications/ApplicationManager.js',
                './js/modules/applications/ApplicationCore.js',
                './js/modules/applications/DashboardCore.js'
            ],
            'ki-strategie-workflow.html': [
                './js/ki-strategy/WorkflowEngine.js',
                './js/ki-strategy/AssessmentCore.js'
            ]
        };
        
        return moduleMap[this.currentPage] || [];
    }

    setupIntersectionPreloading() {
        // Preload resources when they come into viewport
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Preload linked page
                    if (element.tagName === 'A' && element.href) {
                        this.preloadPage(element.href);
                    }
                    
                    // Preload service module
                    if (element.dataset.serviceModule) {
                        this.preloadModule(element.dataset.serviceModule);
                    }
                    
                    this.intersectionObserver.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });

        // Observe service cards and important links
        document.querySelectorAll('.service-card, .nav-link, .important-link').forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }

    async preloadPage(url) {
        if (this.pageCache.has(url)) return;

        try {
            const response = await fetch(url);
            const html = await response.text();
            
            this.pageCache.set(url, {
                html,
                timestamp: Date.now(),
                url
            });
            
            console.log(`📄 Page preloaded: ${url}`);
        } catch (error) {
            console.warn(`Failed to preload ${url}:`, error);
        }
    }

    async preloadModule(moduleUrl) {
        if (this.preloadedModules.has(moduleUrl)) return;

        try {
            await import(moduleUrl);
            this.preloadedModules.add(moduleUrl);
            console.log(`📦 Module preloaded: ${moduleUrl}`);
        } catch (error) {
            console.warn(`Failed to preload module ${moduleUrl}:`, error);
        }
    }

    // 🎨 Unified Theme System
    setupUnifiedTheme() {
        if (!this.config.enableUnifiedTheme) return;

        // Global theme manager
        window.unifiedTheme = {
            current: this.detectSystemTheme(),
            
            setTheme: (theme) => {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('preferred-theme', theme);
                
                // Notify all services about theme change
                document.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { theme }
                }));
                
                this.updateThemeBasedOptimizations(theme);
            },
            
            toggleTheme: () => {
                const current = this.getCurrentTheme();
                const newTheme = current === 'dark' ? 'light' : 'dark';
                window.unifiedTheme.setTheme(newTheme);
            },
            
            getCurrentTheme: () => {
                return document.documentElement.getAttribute('data-theme') || 
                       this.detectSystemTheme();
            }
        };

        // Initialize theme
        const preferredTheme = localStorage.getItem('preferred-theme') || 
                              this.detectSystemTheme();
        window.unifiedTheme.setTheme(preferredTheme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('preferred-theme')) {
                window.unifiedTheme.setTheme(e.matches ? 'dark' : 'light');
            }
        });

        // Add theme toggle to all pages
        this.addThemeToggle();
    }

    detectSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    updateThemeBasedOptimizations(theme) {
        // Optimize animations for dark theme (battery saving on mobile)
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--animation-duration', '0.2s');
        } else {
            document.documentElement.style.setProperty('--animation-duration', '0.3s');
        }
    }

    addThemeToggle() {
        // Only add if not already present
        if (document.querySelector('.theme-toggle')) return;

        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.innerHTML = '🌙';
        toggle.title = 'Theme umschalten';
        toggle.onclick = () => window.unifiedTheme.toggleTheme();

        // Style the toggle
        const toggleStyle = `
            .theme-toggle {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                border: none;
                background: var(--primary-gradient);
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .theme-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
            }
            
            @media (max-width: 768px) {
                .theme-toggle {
                    bottom: 1rem;
                    right: 1rem;
                    width: 48px;
                    height: 48px;
                    font-size: 1.25rem;
                }
            }
        `;

        const style = document.createElement('style');
        style.textContent = toggleStyle;
        document.head.appendChild(style);

        document.body.appendChild(toggle);
    }

    // 🔧 Page-Specific Enhancements  
    applyPageSpecificEnhancements() {
        switch (this.pageType) {
            case 'home':
                this.enhanceHomePage();
                break;
            case 'service':
                this.enhanceServicePage();
                break;
            case 'workflow':
                this.enhanceWorkflowPage();
                break;
            case 'app':
                this.enhanceApplicationPage();
                break;
            case 'admin':
                this.enhanceAdminPage();
                break;
        }
    }

    enhanceHomePage() {
        // Add smart service recommendations
        this.addServiceRecommendations();
        
        // Enhanced hero section with scroll effects
        this.enhanceHeroSection();
        
        // Smart navigation predictions
        this.setupNavigationPredictions();
    }

    enhanceServicePage() {
        // Add cross-service suggestions
        this.addCrossServiceSuggestions();
        
        // Enhanced CTA buttons with micro-interactions
        this.enhanceCTAButtons();
    }

    enhanceWorkflowPage() {
        // Add smart progress persistence across page reloads
        this.setupProgressPersistence();
        
        // Context-aware help system
        this.setupContextualHelp();
    }

    enhanceApplicationPage() {
        // Already handled by ApplicationManager
        console.log('📱 Application page enhancements managed by ApplicationManager');
    }

    // 🎯 Smart Service Recommendations
    addServiceRecommendations() {
        const userHistory = this.getServiceUsageHistory();
        const recommendations = this.generateServiceRecommendations(userHistory);
        
        if (recommendations.length > 0) {
            this.displayServiceRecommendations(recommendations);
        }
    }

    generateServiceRecommendations(history) {
        const recommendations = [];
        
        // If user used KI-Strategy, recommend Applications
        if (history.includes('ki-strategy') && !history.includes('applications')) {
            recommendations.push({
                service: 'applications-modern.html',
                title: 'Bewerbungsverwaltung',
                reason: 'Perfekt für die Umsetzung Ihrer KI-Strategie',
                priority: 'high'
            });
        }
        
        // If user used Applications, recommend Personality Development
        if (history.includes('applications') && !history.includes('personality')) {
            recommendations.push({
                service: 'persoenlichkeitsentwicklung.html',
                title: 'Persönlichkeitsentwicklung',
                reason: 'Stärken Sie sich für erfolgreiche Bewerbungen',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }

    displayServiceRecommendations(recommendations) {
        const container = document.querySelector('.services-grid');
        if (!container) return;

        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'service-card recommendation-card';
            card.innerHTML = `
                <div class="recommendation-badge">💡 Empfohlen</div>
                <div class="service-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <h3>${rec.title}</h3>
                <p>${rec.reason}</p>
                <a href="${rec.service}" class="btn btn-outline">
                    Jetzt ausprobieren
                </a>
            `;
            
            container.appendChild(card);
        });
    }

    // 💾 State Management
    preserveGlobalState() {
        // Store important global state before navigation
        const globalState = {
            theme: window.unifiedTheme?.getCurrentTheme(),
            userData: window.unifiedDataBridge?.userData,
            timestamp: Date.now()
        };
        
        sessionStorage.setItem('global_state', JSON.stringify(globalState));
    }

    async reinitializeForNewPage(url) {
        // Restore global state after navigation
        const storedState = sessionStorage.getItem('global_state');
        if (storedState) {
            const state = JSON.parse(storedState);
            
            // Restore theme
            if (state.theme && window.unifiedTheme) {
                window.unifiedTheme.setTheme(state.theme);
            }
        }

        // Re-initialize page-specific features
        this.detectCurrentPage();
        this.setupUnifiedNavigation();
        
        // Track navigation
        if (window.unifiedAnalytics) {
            window.unifiedAnalytics.trackEvent('navigation', 'page_view', url);
        }
    }

    // 📊 Analytics & Insights
    getServiceUsageHistory() {
        const analytics = window.unifiedAnalytics?.getAnalyticsData() || [];
        const services = new Set();
        
        analytics.forEach(event => {
            if (event.service) {
                services.add(event.service);
            }
        });
        
        return Array.from(services);
    }

    getNavigationPattern() {
        const analytics = window.unifiedAnalytics?.getAnalyticsData() || [];
        const navigationEvents = analytics.filter(event => event.action === 'page_view');
        
        return navigationEvents.slice(-10); // Last 10 page views
    }

    // 🧹 Cleanup
    cleanup() {
        if (this.memoryMonitor) {
            clearInterval(this.memoryMonitor);
        }
        
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.pageCache.clear();
        this.preloadedModules.clear();
    }

    destroy() {
        this.cleanup();
        this.isInitialized = false;
    }
}

// 🏭 Factory function
export function createModernWebsiteEnhancer(options) {
    return new ModernWebsiteEnhancer(options);
}

// 🌐 Global initialization
let globalEnhancer = null;

export function initializeWebsiteEnhancer(options = {}) {
    if (!globalEnhancer) {
        globalEnhancer = createModernWebsiteEnhancer(options);
        window.websiteEnhancer = globalEnhancer;
    }
    return globalEnhancer;
}

// 🚀 Auto-initialize when script loads
if (typeof window !== 'undefined') {
    // Initialize after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeWebsiteEnhancer({
                enableCrossPageTransitions: true,
                enableUnifiedNavigation: true,
                enableServiceIntegration: true,
                enableSmartPreloading: true
            });
        });
    } else {
        initializeWebsiteEnhancer();
    }
}
