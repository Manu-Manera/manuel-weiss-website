// 🎨 Modern CSS Enhancements - 2024/2025 CSS Features Integration
// @layer, @container, CSS Nesting, :has(), Popover API

export class ModernCSS {
    constructor(options = {}) {
        this.config = {
            enableCSSLayers: options.enableCSSLayers !== false,
            enableContainerQueries: options.enableContainerQueries !== false,
            enableCSSNesting: options.enableCSSNesting !== false,
            enableHasSelector: options.enableHasSelector !== false,
            enablePopoverAPI: options.enablePopoverAPI !== false,
            enableViewportUnits: options.enableViewportUnits !== false,
            ...options
        };

        this.supportedFeatures = this.detectFeatureSupport();
        this.init();
    }

    init() {
        console.log('🎨 Initializing Modern CSS Features...');
        console.log('📊 Feature Support:', this.supportedFeatures);
        
        this.injectModernCSS();
        this.setupFeaturePolyfills();
        
        console.log('✅ Modern CSS Features initialized');
    }

    detectFeatureSupport() {
        const support = {};
        
        // CSS @layer support
        support.cssLayers = CSS.supports('@layer', 'base');
        
        // Container Queries support
        support.containerQueries = CSS.supports('container-type', 'inline-size');
        
        // CSS Nesting support (native)
        support.cssNesting = CSS.supports('selector(& .class)', 'color: red');
        
        // :has() pseudo-class support
        support.hasSelector = CSS.supports('selector(:has(.class))', 'color: red');
        
        // Popover API support
        support.popoverAPI = 'popover' in HTMLElement.prototype;
        
        // New viewport units (svh, dvh, lvh)
        support.viewportUnits = CSS.supports('height', '100svh');
        
        return support;
    }

    injectModernCSS() {
        const cssContent = this.buildModernCSS();
        
        const styleElement = document.createElement('style');
        styleElement.id = 'modern-css-enhancements';
        styleElement.textContent = cssContent;
        
        document.head.appendChild(styleElement);
    }

    buildModernCSS() {
        let css = `/* 🚀 Modern CSS Enhancements 2024/2025 */\n\n`;

        // CSS @layer for cascade control
        if (this.config.enableCSSLayers && this.supportedFeatures.cssLayers) {
            css += `
/* 📚 CSS Cascade Layers for Better Control */
@layer reset, base, components, utilities, overrides;

@layer base {
    :root {
        --dynamic-vh: 100vh;
        --safe-area-top: env(safe-area-inset-top, 0px);
        --safe-area-bottom: env(safe-area-inset-bottom, 0px);
    }
    
    html {
        /* Use dynamic viewport height */
        height: 100dvh;
        height: var(--dynamic-vh);
    }
}

@layer components {
    .app-container {
        /* Modern container query context */
        container-type: inline-size;
        container-name: app-main;
    }
    
    .dashboard-grid {
        container-type: inline-size;
        container-name: dashboard;
    }
}
`;
        }

        // Container Queries for responsive components
        if (this.config.enableContainerQueries && this.supportedFeatures.containerQueries) {
            css += `
/* 📐 Container Queries for True Component Responsiveness */
@container app-main (max-width: 768px) {
    .app-sidebar {
        transform: translateX(-100%);
    }
    
    .header-actions {
        gap: 0.5rem;
    }
    
    .header-btn span {
        display: none;
    }
}

@container dashboard (max-width: 600px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    
    .charts-widget {
        order: 1;
    }
    
    .statistics-panel {
        order: 2;
    }
}

/* Component-specific container queries */
@container stats-panel (max-width: 400px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .stat-number {
        font-size: 1.5rem;
    }
}
`;
        }

        // CSS Nesting for better organization
        if (this.config.enableCSSNesting && this.supportedFeatures.cssNesting) {
            css += `
/* 🏗️ CSS Nesting for Better Code Organization */
.application-item {
    transition: all 0.2s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        
        .item-actions {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    &.selected {
        border-left: 4px solid var(--primary);
        background: var(--primary-light-bg);
        
        .item-checkbox input {
            accent-color: var(--primary);
        }
    }
    
    .item-actions {
        opacity: 0;
        transform: translateX(10px);
        transition: all 0.2s ease;
        
        .action-btn {
            border-radius: 8px;
            transition: all 0.15s ease;
            
            &:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
        }
    }
}
`;
        }

        // :has() pseudo-class for advanced styling
        if (this.config.enableHasSelector && this.supportedFeatures.hasSelector) {
            css += `
/* 🎯 :has() Pseudo-Class for Advanced Logic */
.application-list:has(.application-item.selected) {
    .bulk-actions {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
    }
}

.form-group:has(input:focus) {
    .form-label {
        color: var(--primary);
        transform: translateY(-2px);
    }
}

.dashboard-grid:has(.charts-widget:hover) {
    .quick-actions {
        filter: blur(1px);
        opacity: 0.7;
    }
}

/* Context-aware styling based on form state */
.workflow-step:has(input:invalid) {
    border-left-color: var(--error);
    
    .step-header {
        background: var(--error-light-bg);
    }
}

.workflow-step:has(input:valid) {
    border-left-color: var(--success);
    
    .step-header {
        background: var(--success-light-bg);
    }
}
`;
        }

        // New Viewport Units for better mobile experience
        if (this.config.enableViewportUnits && this.supportedFeatures.viewportUnits) {
            css += `
/* 📱 New Viewport Units for Better Mobile Experience */
.app-container {
    min-height: 100svh; /* Small viewport height */
    height: 100dvh;     /* Dynamic viewport height */
}

.app-sidebar {
    height: 100dvh; /* Dynamic height that accounts for mobile bars */
}

/* Mobile-specific optimizations */
@media (max-width: 768px) {
    .app-main {
        min-height: 100svh;
        padding-bottom: env(safe-area-inset-bottom);
    }
    
    .modal-content {
        max-height: calc(100svh - 4rem);
        padding-bottom: env(safe-area-inset-bottom);
    }
}
`;
        }

        // Popover API integration
        if (this.config.enablePopoverAPI && this.supportedFeatures.popoverAPI) {
            css += `
/* 🎪 Popover API for Better Modal Experience */
[popover] {
    padding: 1rem;
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    background: white;
    color: #1f2937;
    
    &::backdrop {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }
}

.popover-trigger {
    anchor-name: --trigger;
}

.popover-content {
    position-anchor: --trigger;
    position-area: bottom right;
    margin: 0.5rem;
}

/* Animation for popover show/hide */
[popover]:popover-open {
    animation: popoverShow 0.2s ease-out;
}

@starting-style {
    [popover]:popover-open {
        opacity: 0;
        transform: scale(0.9);
    }
}

@keyframes popoverShow {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
`;
        }

        // Advanced CSS features
        css += `
/* 🔮 Cutting-edge CSS Features */

/* Light-dark() function for automatic theme switching */
.app-header {
    background: light-dark(white, #1e293b);
    color: light-dark(#1f2937, #f8fafc);
    border-color: light-dark(#e5e7eb, #374151);
}

/* CSS Anchor Positioning (experimental) */
.tooltip {
    position: absolute;
    position-anchor: --tooltip-anchor;
    position-area: top center;
    margin-top: -0.5rem;
}

/* Advanced CSS Grid with subgrid */
.dashboard-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    grid-template-rows: auto 1fr auto;
    gap: 1.5rem;
}

.grid-content {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
}

/* CSS Scroll-driven Animations (experimental) */
@supports (animation-timeline: scroll()) {
    .progress-indicator {
        animation: progressGrow;
        animation-timeline: scroll(nearest);
        animation-range: 0% 100%;
    }
    
    @keyframes progressGrow {
        to {
            transform: scaleX(1);
        }
    }
}

/* Enhanced focus-visible with modern selectors */
.interactive-element:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 4px;
}

/* Color-mix() for dynamic color generation */
.status-badge {
    background: color-mix(in srgb, var(--status-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--status-color) 40%, transparent);
}

/* Modern CSS Grid areas with named lines */
.application-card {
    display: grid;
    grid-template:
        [header-start] "icon title actions" auto [header-end]
        [content-start] "content content content" 1fr [content-end]
        [footer-start] "meta meta meta" auto [footer-end]
        / auto 1fr auto;
    gap: 1rem;
}
`;

        return css;
    }

    setupFeaturePolyfills() {
        // Polyfill for Container Queries if needed
        if (this.config.enableContainerQueries && !this.supportedFeatures.containerQueries) {
            this.loadContainerQueryPolyfill();
        }
        
        // Polyfill for :has() if needed
        if (this.config.enableHasSelector && !this.supportedFeatures.hasSelector) {
            this.loadHasSelectorPolyfill();
        }
        
        // Dynamic viewport height fallback
        if (!this.supportedFeatures.viewportUnits) {
            this.setupViewportHeightFallback();
        }
    }

    async loadContainerQueryPolyfill() {
        try {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/container-query-polyfill@1/dist/container-query-polyfill.modern.js';
            document.head.appendChild(script);
            console.log('📦 Container Query polyfill loaded');
        } catch (error) {
            console.error('Container Query polyfill failed to load:', error);
        }
    }

    async loadHasSelectorPolyfill() {
        try {
            // Simple :has() polyfill simulation
            const style = document.createElement('style');
            style.textContent = `
                /* :has() fallback using JavaScript-enhanced classes */
                .has-selected .bulk-actions {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: all;
                }
                
                .has-focused .form-label {
                    color: var(--primary);
                    transform: translateY(-2px);
                }
            `;
            document.head.appendChild(style);
            
            // Add JavaScript logic to simulate :has()
            this.simulateHasSelector();
            
            console.log('🔧 :has() selector fallback implemented');
        } catch (error) {
            console.error(':has() polyfill setup failed:', error);
        }
    }

    simulateHasSelector() {
        // Observer for form focus states
        const observer = new MutationObserver(() => {
            // Check for focused inputs and add classes to parents
            document.querySelectorAll('.form-group').forEach(group => {
                const focusedInput = group.querySelector('input:focus, textarea:focus, select:focus');
                group.classList.toggle('has-focused', !!focusedInput);
            });
            
            // Check for selected applications
            const selectedItems = document.querySelectorAll('.application-item.selected');
            const list = document.querySelector('.application-list');
            if (list) {
                list.classList.toggle('has-selected', selectedItems.length > 0);
            }
        });

        observer.observe(document, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        // Also handle focus events directly
        document.addEventListener('focusin', (e) => {
            const formGroup = e.target.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('has-focused');
            }
        });

        document.addEventListener('focusout', (e) => {
            const formGroup = e.target.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('has-focused');
            }
        });
    }

    setupViewportHeightFallback() {
        // Dynamic viewport height calculation for older browsers
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--dynamic-vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });

        console.log('📱 Dynamic viewport height fallback active');
    }

    // 🎨 Dynamic Theme System with CSS Custom Properties
    initializeAdvancedTheming() {
        const advancedThemeCSS = `
            /* 🌈 Advanced Color System with P3 Wide Gamut */
            @media (color-gamut: p3) {
                :root {
                    --primary: color(display-p3 0.4 0.48 0.92);
                    --success: color(display-p3 0.06 0.73 0.51);
                    --warning: color(display-p3 0.96 0.62 0.04);
                    --error: color(display-p3 0.94 0.27 0.27);
                }
            }
            
            /* Automatic dark/light mode with light-dark() */
            .card {
                background: light-dark(white, #1e293b);
                color: light-dark(#1f2937, #f8fafc);
                border: 1px solid light-dark(#e5e7eb, #374151);
            }
            
            /* CSS Color Level 5 - Relative Color Syntax */
            .primary-hover {
                background: from var(--primary) srgb r g b / 0.1;
            }
            
            .success-text {
                color: from var(--success) srgb calc(r * 0.8) calc(g * 0.8) calc(b * 0.8);
            }
        `;
        
        const themeStyle = document.createElement('style');
        themeStyle.textContent = advancedThemeCSS;
        document.head.appendChild(themeStyle);
    }

    // 🔮 Experimental Features (Future-proofing)
    enableExperimentalFeatures() {
        const experimentalCSS = `
            /* 🚀 Experimental CSS Features */
            
            /* CSS Anchored Positioning */
            .floating-tooltip {
                position: absolute;
                position-anchor: --tooltip-target;
                inset-area: top center;
                margin-top: -0.5rem;
            }
            
            /* Scroll-driven Animations */
            @supports (animation-timeline: scroll()) {
                .scroll-progress {
                    animation: scrollProgress linear;
                    animation-timeline: scroll(root);
                    animation-range: 0% 100%;
                }
                
                @keyframes scrollProgress {
                    to {
                        transform: scaleX(1);
                    }
                }
            }
            
            /* CSS Masonry Layout (experimental) */
            @supports (grid-template-rows: masonry) {
                .masonry-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    grid-template-rows: masonry;
                    gap: 1rem;
                }
            }
            
            /* CSS Cascade Layers with Import */
            @import url("base-components.css") layer(components);
            @import url("utilities.css") layer(utilities);
        `;
        
        const expStyle = document.createElement('style');
        expStyle.textContent = experimentalCSS;
        document.head.appendChild(expStyle);
        
        console.log('🔮 Experimental CSS features enabled');
    }

    // 📱 Advanced Mobile Optimizations
    optimizeForMobile() {
        const mobileCSS = `
            /* 📱 Advanced Mobile UX Optimizations */
            
            /* Touch target optimization */
            .touch-target {
                min-width: 44px;
                min-height: 44px;
                margin: 2px;
            }
            
            /* iOS-specific optimizations */
            @supports (-webkit-touch-callout: none) {
                .ios-safe-area {
                    padding-top: env(safe-area-inset-top);
                    padding-bottom: env(safe-area-inset-bottom);
                    padding-left: env(safe-area-inset-left);
                    padding-right: env(safe-area-inset-right);
                }
            }
            
            /* Android-specific optimizations */
            @media screen and (-webkit-device-pixel-ratio: 2) {
                .high-dpi-image {
                    image-rendering: -webkit-optimize-contrast;
                }
            }
            
            /* PWA-specific mobile styles */
            @media (display-mode: standalone) {
                .app-header {
                    padding-top: env(safe-area-inset-top);
                }
                
                .app-content {
                    padding-bottom: calc(2rem + env(safe-area-inset-bottom));
                }
            }
            
            /* Gesture-based interactions */
            .swipeable {
                touch-action: pan-x;
            }
            
            .scrollable {
                touch-action: pan-y;
                -webkit-overflow-scrolling: touch;
                overscroll-behavior: contain;
            }
        `;
        
        const mobileStyle = document.createElement('style');
        mobileStyle.textContent = mobileCSS;
        document.head.appendChild(mobileStyle);
    }

    // 🎨 CSS Custom Properties with Advanced Calculations
    setupAdvancedCustomProperties() {
        const advancedPropsCSS = `
            /* 🧮 Advanced CSS Custom Properties */
            :root {
                /* Fluid typography using clamp() */
                --font-size-fluid-sm: clamp(0.875rem, 0.8rem + 0.5vw, 1rem);
                --font-size-fluid-base: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
                --font-size-fluid-lg: clamp(1.25rem, 1rem + 1vw, 2rem);
                
                /* Container-based spacing */
                --space-xs: max(0.25rem, 1cqi);  /* Container query units */
                --space-sm: max(0.5rem, 2cqi);
                --space-md: max(1rem, 3cqi);
                --space-lg: max(1.5rem, 4cqi);
                
                /* Color-mix() for dynamic colors */
                --primary-10: color-mix(in srgb, var(--primary) 10%, transparent);
                --primary-20: color-mix(in srgb, var(--primary) 20%, transparent);
                --primary-90: color-mix(in srgb, var(--primary) 90%, black);
                
                /* Advanced shadows using light-dark() */
                --shadow-soft: light-dark(
                    0 2px 8px color-mix(in srgb, black 15%, transparent),
                    0 2px 8px color-mix(in srgb, black 40%, transparent)
                );
                
                /* Responsive border radius */
                --radius-responsive: max(8px, 1cqi);
            }
            
            /* Typography using fluid sizing */
            .text-fluid-sm { font-size: var(--font-size-fluid-sm); }
            .text-fluid-base { font-size: var(--font-size-fluid-base); }
            .text-fluid-lg { font-size: var(--font-size-fluid-lg); }
            
            /* Container-responsive spacing */
            .space-responsive {
                padding: var(--space-md);
                gap: var(--space-sm);
            }
        `;
        
        const propsStyle = document.createElement('style');
        propsStyle.textContent = advancedPropsCSS;
        document.head.appendChild(propsStyle);
    }

    // 🚀 Performance Optimizations
    enablePerformanceCSS() {
        const performanceCSS = `
            /* ⚡ CSS Performance Optimizations */
            
            /* GPU acceleration for animations */
            .will-animate {
                will-change: transform;
            }
            
            .no-longer-animating {
                will-change: auto;
            }
            
            /* CSS Containment for performance */
            .dashboard-widget {
                contain: layout style paint;
            }
            
            .list-item {
                contain: style layout;
            }
            
            /* Efficient transitions */
            .smooth-transition {
                transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            /* Critical rendering path optimization */
            .above-fold {
                content-visibility: visible;
            }
            
            .below-fold {
                content-visibility: auto;
                contain-intrinsic-size: 300px;
            }
            
            /* Layer promotion for smooth animations */
            .floating-element {
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
            }
        `;
        
        const perfStyle = document.createElement('style');
        perfStyle.textContent = performanceCSS;
        document.head.appendChild(perfStyle);
    }

    // 🔧 Public API
    updateFeatureSupport() {
        this.supportedFeatures = this.detectFeatureSupport();
        console.log('📊 Updated feature support:', this.supportedFeatures);
        return this.supportedFeatures;
    }

    enableFeature(featureName, enabled = true) {
        this.config[`enable${featureName}`] = enabled;
        
        if (enabled) {
            this.injectModernCSS();
        }
    }

    getFeatureSupport() {
        return this.supportedFeatures;
    }

    // 🧹 Cleanup
    destroy() {
        const modernStyle = document.querySelector('#modern-css-enhancements');
        if (modernStyle) {
            modernStyle.remove();
        }
        
        this.supportedFeatures = {};
        this.config = {};
    }
}

// 🏭 Factory function
export function createModernCSS(options) {
    return new ModernCSS(options);
}

// 🌐 Global initialization
export function initializeModernCSS(options = {}) {
    const modernCSS = createModernCSS(options);
    
    // Enable experimental features if explicitly requested
    if (options.enableExperimentalFeatures) {
        modernCSS.enableExperimentalFeatures();
    }
    
    // Mobile optimizations
    if (options.optimizeForMobile !== false) {
        modernCSS.optimizeForMobile();
    }
    
    // Advanced theming
    if (options.enableAdvancedTheming !== false) {
        modernCSS.initializeAdvancedTheming();
    }
    
    // Performance CSS
    if (options.enablePerformanceCSS !== false) {
        modernCSS.enablePerformanceCSS();
    }
    
    return modernCSS;
}
