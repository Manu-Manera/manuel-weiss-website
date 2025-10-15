/**
 * Modern UI Patterns Module
 * Extracted from bewerbungsmanager-modern.html
 * Provides modern UI components and interactions
 */

class ModernUIPatterns {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.init();
    }

    init() {
        console.log('🎨 Modern UI Patterns: Initializing...');
        this.setupAnimations();
        this.setupIntersectionObserver();
        this.setupModernButtons();
        this.setupGradientBackgrounds();
        this.setupGlassmorphism();
        console.log('✅ Modern UI Patterns: Ready');
    }

    setupAnimations() {
        // Smooth scroll animations
        this.animations.set('fadeInUp', {
            keyframes: [
                { opacity: 0, transform: 'translateY(30px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ],
            options: { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
        });

        this.animations.set('scaleIn', {
            keyframes: [
                { opacity: 0, transform: 'scale(0.9)' },
                { opacity: 1, transform: 'scale(1)' }
            ],
            options: { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
        });

        this.animations.set('slideInRight', {
            keyframes: [
                { opacity: 0, transform: 'translateX(30px)' },
                { opacity: 1, transform: 'translateX(0)' }
            ],
            options: { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe all elements with animation classes
        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });

        this.observers.set('scroll', observer);
    }

    animateElement(element) {
        const animationType = element.dataset.animate;
        const animation = this.animations.get(animationType);
        
        if (animation) {
            element.animate(animation.keyframes, animation.options);
            element.classList.add('animated');
        }
    }

    setupModernButtons() {
        // Enhanced button interactions
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.btn-modern')) {
                this.enhanceButtonHover(e.target);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('.btn-modern')) {
                this.resetButtonHover(e.target);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-modern')) {
                this.animateButtonClick(e.target);
            }
        });
    }

    enhanceButtonHover(button) {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    resetButtonHover(button) {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    }

    animateButtonClick(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    setupGradientBackgrounds() {
        // Dynamic gradient backgrounds
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ];

        document.querySelectorAll('[data-gradient]').forEach(element => {
            const gradientIndex = Math.floor(Math.random() * gradients.length);
            element.style.background = gradients[gradientIndex];
        });
    }

    setupGlassmorphism() {
        // Glassmorphism effects
        const glassElements = document.querySelectorAll('.glass');
        glassElements.forEach(element => {
            element.style.background = 'rgba(255, 255, 255, 0.1)';
            element.style.backdropFilter = 'blur(10px)';
            element.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            element.style.borderRadius = '16px';
        });
    }

    // Modern Card Component
    createModernCard(content, options = {}) {
        const card = document.createElement('div');
        card.className = 'modern-card';
        
        const defaultOptions = {
            title: '',
            subtitle: '',
            actions: [],
            glass: false,
            gradient: false,
            animated: true
        };
        
        const config = { ...defaultOptions, ...options };
        
        card.innerHTML = `
            <div class="card-header">
                ${config.title ? `<h3>${config.title}</h3>` : ''}
                ${config.subtitle ? `<p>${config.subtitle}</p>` : ''}
            </div>
            <div class="card-content">
                ${content}
            </div>
            ${config.actions.length ? `
                <div class="card-actions">
                    ${config.actions.map(action => 
                        `<button class="btn-modern ${action.class || ''}" onclick="${action.onclick || ''}">
                            ${action.text}
                        </button>`
                    ).join('')}
                </div>
            ` : ''}
        `;
        
        if (config.glass) card.classList.add('glass');
        if (config.gradient) card.setAttribute('data-gradient', '');
        if (config.animated) card.setAttribute('data-animate', 'fadeInUp');
        
        return card;
    }

    // Modern Progress Indicator
    createProgressIndicator(steps, currentStep = 0) {
        const progress = document.createElement('div');
        progress.className = 'modern-progress';
        
        progress.innerHTML = `
            <div class="progress-track">
                ${steps.map((step, index) => `
                    <div class="progress-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-label">${step}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        return progress;
    }

    // Modern Loading Spinner
    createLoadingSpinner(size = 'medium', color = '#667eea') {
        const spinner = document.createElement('div');
        spinner.className = `modern-spinner spinner-${size}`;
        spinner.style.borderColor = `${color}20`;
        spinner.style.borderTopColor = color;
        
        return spinner;
    }

    // Enhanced Form Validation
    setupFormValidation() {
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target);
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        let isValid = true;
        let message = '';
        
        if (required && !value) {
            isValid = false;
            message = 'Dieses Feld ist erforderlich';
        } else if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        } else if (type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            message = 'Bitte geben Sie eine gültige Telefonnummer ein';
        }
        
        this.showFieldValidation(field, isValid, message);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
    }

    showFieldValidation(field, isValid, message) {
        const existingMessage = field.parentNode.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (!isValid) {
            const messageEl = document.createElement('div');
            messageEl.className = 'validation-message error';
            messageEl.textContent = message;
            field.parentNode.appendChild(messageEl);
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    }

    // Modern Toast Notifications
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `modern-toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${this.getToastIcon(type)}</div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        toast.animate([
            { opacity: 0, transform: 'translateX(100%)' },
            { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
        
        // Auto remove
        setTimeout(() => {
            toast.animate([
                { opacity: 1, transform: 'translateX(0)' },
                { opacity: 0, transform: 'translateX(100%)' }
            ], { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }).onfinish = () => {
                toast.remove();
            };
        }, duration);
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Initialize Modern UI Patterns
const modernUI = new ModernUIPatterns();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernUIPatterns;
}
