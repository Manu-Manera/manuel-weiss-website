// RAISEC Workflow JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('RAISEC Workflow initialized');
    
    // Slider functionality
    initializeSliders();
    
    // Form handling
    initializeForms();
    
    // Hexagon Sektor Klick-Handler
    const hexagonSectors = document.querySelectorAll('.hexagon-sector');
    hexagonSectors.forEach(sector => {
        sector.addEventListener('click', function() {
            const type = this.dataset.type;
            if (type) {
                navigateToType(type);
            }
        });
    });
    
    // Typ-Karten Klick-Handler
    const typeCards = document.querySelectorAll('.raisec-type-card');
    typeCards.forEach(card => {
        card.addEventListener('click', function() {
            const type = this.dataset.type;
            if (type) {
                navigateToType(type);
            }
        });
    });
    
    // Navigation zu Typ-spezifischen Seiten
    function navigateToType(type) {
        const typeMap = {
            'realistic': 'realistic-raisec.html',
            'investigative': 'investigative-raisec.html',
            'artistic': 'artistic-raisec.html',
            'social': 'social-raisec.html',
            'enterprising': 'enterprising-raisec.html',
            'conventional': 'conventional-raisec.html'
        };
        
        const targetPage = typeMap[type];
        if (targetPage) {
            window.location.href = targetPage;
        }
    }
    
    // Smooth Scrolling für interne Links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Intersection Observer für Animationen
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Beobachte alle animierbaren Elemente
    const animatedElements = document.querySelectorAll('.raisec-type-card, .feature-card, .hexagon-sector');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Hexagon Hover-Effekte
    const hexagon = document.querySelector('.raisec-hexagon');
    if (hexagon) {
        hexagon.addEventListener('mouseenter', function() {
            this.classList.add('hexagon-hover');
        });
        
        hexagon.addEventListener('mouseleave', function() {
            this.classList.add('hexagon-hover');
        });
    }
    
    // Auto-Save Funktionalität
    const autoSave = {
        data: {},
        save: function(key, value) {
            this.data[key] = value;
            localStorage.setItem('raisec-workflow', JSON.stringify(this.data));
        },
        load: function() {
            const saved = localStorage.getItem('raisec-workflow');
            if (saved) {
                this.data = JSON.parse(saved);
            }
        },
        clear: function() {
            this.data = {};
            localStorage.removeItem('raisec-workflow');
        }
    };
    
    // Lade gespeicherte Daten
    autoSave.load();
    
    // Progress Tracking
    const progressTracker = {
        currentStep: 0,
        totalSteps: 6,
        update: function(step) {
            this.currentStep = step;
            this.saveProgress();
        },
        saveProgress: function() {
            autoSave.save('progress', {
                currentStep: this.currentStep,
                totalSteps: this.totalSteps,
                timestamp: new Date().toISOString()
            });
        },
        loadProgress: function() {
            const progress = autoSave.data.progress;
            if (progress) {
                this.currentStep = progress.currentStep;
                this.totalSteps = progress.totalSteps;
            }
        }
    };
    
    // Lade Fortschritt
    progressTracker.loadProgress();
    
    // YouTube Video Integration
    const videoContainer = document.querySelector('.video-container iframe');
    if (videoContainer) {
        // Lazy Loading für YouTube Videos
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    if (!iframe.src.includes('youtube.com')) {
                        iframe.src = iframe.src || 'https://www.youtube.com/embed/VIDEO_ID';
                    }
                    videoObserver.unobserve(iframe);
                }
            });
        });
        
        videoObserver.observe(videoContainer);
    }
    
    // Performance Optimierung
    const performanceOptimizer = {
        lazyLoadImages: function() {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        },
        
        preloadCriticalResources: function() {
            // Preload kritische CSS und JS Dateien
            const criticalResources = [
                'css/raisec-smart-styles.css',
                'css/raisec-hexagon-styles.css',
                'js/raisec-workflow.js'
            ];
            
            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                link.as = resource.endsWith('.css') ? 'style' : 'script';
                document.head.appendChild(link);
            });
        }
    };
    
    // Initialisiere Performance-Optimierungen
    performanceOptimizer.lazyLoadImages();
    performanceOptimizer.preloadCriticalResources();
    
    // Error Handling
    window.addEventListener('error', function(e) {
        console.error('RAISEC Workflow Error:', e.error);
        // Hier könnte ein Error Reporting Service integriert werden
    });
    
    // Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', function(e) {
        console.error('RAISEC Workflow Promise Rejection:', e.reason);
        // Hier könnte ein Error Reporting Service integriert werden
    });
    
    // Service Worker Registration (für Offline-Funktionalität)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed');
                });
        });
    }
    
    // Analytics Integration (falls gewünscht)
    const analytics = {
        track: function(event, data) {
            // Hier könnte Google Analytics, Mixpanel, etc. integriert werden
            console.log('Analytics Event:', event, data);
        },
        
        trackPageView: function(page) {
            this.track('page_view', { page: page });
        },
        
        trackUserAction: function(action, data) {
            this.track('user_action', { action: action, data: data });
        }
    };
    
    // Track initial page view
    analytics.trackPageView('raisec-index');
    
    // Track user interactions
    document.addEventListener('click', function(e) {
        if (e.target.matches('.hexagon-sector, .raisec-type-card')) {
            analytics.trackUserAction('type_selected', { type: e.target.dataset.type });
        }
    });
    
    console.log('RAISEC Workflow fully initialized');
});

// Utility Functions
const utils = {
    // Debounce function für Performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function für Performance
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Format date
    formatDate: function(date) {
        return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },
    
    // Generate unique ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    }
};

// Slider functionality
function initializeSliders() {
    // Alle Slider initialisieren
    const allSliders = document.querySelectorAll('input[type="range"]');
    
    allSliders.forEach(slider => {
        // Event Listener für Slider-Änderungen
        slider.addEventListener('input', function() {
            updateSliderValue(this);
        });
        
        // Event Listener für Slider-Änderungen (auch bei Touch)
        slider.addEventListener('change', function() {
            updateSliderValue(this);
        });
        
        // Initiale Werte setzen
        updateSliderValue(slider);
    });
}

// Slider-Wert aktualisieren
function updateSliderValue(slider) {
    const value = slider.value;
    const valueDisplay = slider.parentElement.querySelector('.slider-value');
    
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
    
    // Visuelles Feedback
    slider.style.setProperty('--slider-value', value + '%');
}

// Form handling
function initializeForms() {
    // Alle RAISEC-Formulare finden
    const forms = document.querySelectorAll('form[id$="-form"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    });
}

// Form submission handling
function handleFormSubmission(form) {
    const formId = form.id;
    const formData = new FormData(form);
    const data = {};
    
    // Alle Form-Daten sammeln
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Slider-Werte hinzufügen
    const sliders = form.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        data[slider.name] = slider.value;
    });
    
    // Daten speichern
    const type = formId.replace('-form', '');
    localStorage.setItem(`raisec-${type}`, JSON.stringify(data));
    
    console.log(`RAISEC ${type} data saved:`, data);
    
    // Navigation zum nächsten Schritt
    navigateToNextStep(type);
}

// Navigation zum nächsten Schritt
function navigateToNextStep(currentType) {
    const navigationMap = {
        'realistic': 'investigative-raisec.html',
        'investigative': 'artistic-raisec.html',
        'artistic': 'social-raisec.html',
        'social': 'enterprising-raisec.html',
        'enterprising': 'conventional-raisec.html',
        'conventional': 'raisec-results.html'
    };
    
    const nextPage = navigationMap[currentType];
    if (nextPage) {
        window.location.href = nextPage;
    }
}

// Export für Module (falls gewünscht)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { utils };
}