// 🎭 View Transitions API - Smooth Page Transitions (2024 Feature)
// Native browser animations zwischen Views ohne JavaScript-Frameworks

export class ViewTransitions {
    constructor(options = {}) {
        this.config = {
            enableViewTransitions: options.enableViewTransitions !== false,
            fallbackAnimations: options.fallbackAnimations !== false,
            transitionDuration: options.transitionDuration || 300,
            enableReducedMotion: options.enableReducedMotion !== false,
            ...options
        };

        this.isSupported = 'startViewTransition' in document;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }

    init() {
        if (this.config.enableViewTransitions && this.isSupported) {
            console.log('✅ View Transitions API supported');
            this.setupViewTransitions();
        } else if (this.config.fallbackAnimations) {
            console.log('📱 View Transitions fallback enabled');
            this.setupFallbackAnimations();
        }
    }

    // 🚀 Modern View Transitions API (2024)
    async transitionToView(viewName, updateFunction) {
        if (!this.isSupported || this.reducedMotion && this.config.enableReducedMotion) {
            // Fallback to direct update
            updateFunction();
            return;
        }

        try {
            const transition = document.startViewTransition(async () => {
                await updateFunction();
            });

            // Add custom view-transition-name for specific transitions
            this.setTransitionNames(viewName);
            
            await transition.finished;
            console.log(`✅ View transition to ${viewName} completed`);
            
        } catch (error) {
            console.error('View transition failed:', error);
            // Fallback to direct update
            updateFunction();
        }
    }

    setTransitionNames(viewName) {
        // Set CSS view-transition-names for specific elements
        const transitionMappings = {
            dashboard: {
                '.app-header': 'header',
                '.statistics-panel': 'stats',
                '.application-list': 'list'
            },
            applications: {
                '.app-header': 'header',  
                '.application-list': 'list-main',
                '.quick-actions': 'actions'
            },
            analytics: {
                '.app-header': 'header',
                '.charts-widget': 'charts-main'
            }
        };

        const mapping = transitionMappings[viewName];
        if (mapping) {
            Object.entries(mapping).forEach(([selector, name]) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.viewTransitionName = name;
                }
            });
        }
    }

    // 🎨 Enhanced CSS Transitions for Fallback
    setupFallbackAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            /* Fallback animations for browsers without View Transitions API */
            .view-transition-enter {
                animation: viewEnter ${this.config.transitionDuration}ms ease-out;
            }
            
            .view-transition-leave {
                animation: viewLeave ${this.config.transitionDuration}ms ease-in;
            }
            
            @keyframes viewEnter {
                from {
                    opacity: 0;
                    transform: translateX(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }
            
            @keyframes viewLeave {
                from {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateX(-20px) scale(0.95);
                }
            }
            
            /* Respect reduced motion preference */
            @media (prefers-reduced-motion: reduce) {
                .view-transition-enter,
                .view-transition-leave {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupViewTransitions() {
        // Inject CSS for View Transitions API
        const style = document.createElement('style');
        style.textContent = `
            /* 🎭 View Transitions API CSS (2024) */
            ::view-transition-old(root),
            ::view-transition-new(root) {
                animation-duration: ${this.config.transitionDuration}ms;
                animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            /* Custom transitions for specific elements */
            ::view-transition-old(header),
            ::view-transition-new(header) {
                animation: slideHeader ${this.config.transitionDuration}ms ease-out;
            }
            
            ::view-transition-old(stats),
            ::view-transition-new(stats) {
                animation: fadeStats ${this.config.transitionDuration}ms ease-out;
            }
            
            ::view-transition-old(list),
            ::view-transition-new(list) {
                animation: slideList ${this.config.transitionDuration}ms ease-out;
            }
            
            @keyframes slideHeader {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes fadeStats {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            
            @keyframes slideList {
                from { transform: translateX(30px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                ::view-transition-old(*),
                ::view-transition-new(*) {
                    animation: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // 🛠️ Utility Methods
    async animateNavigation(fromView, toView, updateFunction) {
        if (this.isSupported) {
            return this.transitionToView(toView, updateFunction);
        } else {
            return this.fallbackTransition(fromView, toView, updateFunction);
        }
    }

    async fallbackTransition(fromView, toView, updateFunction) {
        const container = document.querySelector('.app-content');
        if (!container) {
            updateFunction();
            return;
        }

        // Add leave animation
        container.classList.add('view-transition-leave');
        
        await new Promise(resolve => setTimeout(resolve, this.config.transitionDuration / 2));
        
        // Update content
        updateFunction();
        
        // Add enter animation
        container.classList.remove('view-transition-leave');
        container.classList.add('view-transition-enter');
        
        await new Promise(resolve => setTimeout(resolve, this.config.transitionDuration));
        
        container.classList.remove('view-transition-enter');
    }

    // 🎯 Page Transition Helpers
    async navigateWithTransition(url, options = {}) {
        if (!this.isSupported) {
            window.location.href = url;
            return;
        }

        try {
            // Start view transition
            const transition = document.startViewTransition(async () => {
                // Prefetch and update content
                const response = await fetch(url);
                const html = await response.text();
                
                // Parse and update specific sections
                const parser = new DOMParser();
                const newDoc = parser.parseFromString(html, 'text/html');
                
                if (options.updateMain !== false) {
                    const newMain = newDoc.querySelector('.app-main');
                    const currentMain = document.querySelector('.app-main');
                    if (newMain && currentMain) {
                        currentMain.innerHTML = newMain.innerHTML;
                    }
                }
                
                // Update title
                if (newDoc.title) {
                    document.title = newDoc.title;
                }
                
                // Update URL
                history.pushState({ url }, '', url);
            });

            await transition.finished;
            
        } catch (error) {
            console.error('Navigation with transition failed:', error);
            window.location.href = url;
        }
    }

    // 🔧 Configuration
    enableViewTransitions(enabled = true) {
        this.config.enableViewTransitions = enabled;
        
        if (enabled && this.isSupported) {
            this.setupViewTransitions();
        }
    }

    setTransitionDuration(duration) {
        this.config.transitionDuration = duration;
    }

    // 📊 Analytics
    getTransitionMetrics() {
        return {
            isSupported: this.isSupported,
            reducedMotion: this.reducedMotion,
            transitionsEnabled: this.config.enableViewTransitions,
            avgTransitionTime: this.config.transitionDuration
        };
    }
}

// 🏭 Factory function
export function createViewTransitions(options) {
    return new ViewTransitions(options);
}

// 🌐 Global instance
let globalViewTransitions = null;

export function getGlobalViewTransitions() {
    if (!globalViewTransitions) {
        globalViewTransitions = createViewTransitions();
    }
    return globalViewTransitions;
}
