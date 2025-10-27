/**
 * Admin Panel Utilities
 * Hilfsfunktionen für das Admin Panel
 */
class AdminUtils {
    /**
     * DOM Element erstellen
     */
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Attributes setzen
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Content setzen
        if (content) {
            element.textContent = content;
        }
        
        return element;
    }
    
    /**
     * Element nach Selector finden
     */
    static $(selector, parent = document) {
        return parent.querySelector(selector);
    }
    
    /**
     * Alle Elemente nach Selector finden
     */
    static $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }
    
    /**
     * Event Listener hinzufügen
     */
    static on(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        return () => element.removeEventListener(event, handler, options);
    }
    
    /**
     * Debounce Funktion
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }
    
    /**
     * Throttle Funktion
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Deep Clone
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            Object.keys(obj).forEach(key => {
                clonedObj[key] = this.deepClone(obj[key]);
            });
            return clonedObj;
        }
    }
    
    /**
     * LocalStorage Helper - Cookie-sichere Version
     */
    static storage = {
        get(key, defaultValue = null) {
            try {
                // Prüfen ob localStorage verfügbar ist
                if (!this.isAvailable()) {
                    console.warn('LocalStorage not available, returning default value');
                    return defaultValue;
                }
                
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('LocalStorage get error:', error);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                // Prüfen ob localStorage verfügbar ist
                if (!this.isAvailable()) {
                    console.warn('LocalStorage not available, cannot save');
                    return false;
                }
                
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('LocalStorage set error:', error);
                return false;
            }
        },
        
        remove(key) {
            try {
                // Prüfen ob localStorage verfügbar ist
                if (!this.isAvailable()) {
                    console.warn('LocalStorage not available, cannot remove');
                    return false;
                }
                
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('LocalStorage remove error:', error);
                return false;
            }
        },
        
        clear() {
            try {
                // Prüfen ob localStorage verfügbar ist
                if (!this.isAvailable()) {
                    console.warn('LocalStorage not available, cannot clear');
                    return false;
                }
                
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('LocalStorage clear error:', error);
                return false;
            }
        },
        
        /**
         * LocalStorage Verfügbarkeit prüfen
         */
        isAvailable() {
            try {
                const test = '__admin_utils_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    /**
     * SessionStorage Helper - Cookie-sichere Version
     */
    static session = {
        get(key, defaultValue = null) {
            try {
                // Prüfen ob sessionStorage verfügbar ist
                if (!this.isAvailable()) {
                    console.warn('SessionStorage not available, returning default value');
                    return defaultValue;
                }
                
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('SessionStorage get error:', error);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                // Prüfen ob sessionStorage verfügbar ist
                if (!this.isAvailable()) {
                    console.warn('SessionStorage not available, cannot save');
                    return false;
                }
                
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('SessionStorage set error:', error);
                return false;
            }
        },
        
        remove(key) {
            try {
                // Prüfen ob sessionStorage verfügbar ist
                if (!this.isAvailable()) {
                    console.warn('SessionStorage not available, cannot remove');
                    return false;
                }
                
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('SessionStorage remove error:', error);
                return false;
            }
        },
        
        /**
         * SessionStorage Verfügbarkeit prüfen
         */
        isAvailable() {
            try {
                const test = '__admin_session_test__';
                sessionStorage.setItem(test, test);
                sessionStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    /**
     * URL Helper
     */
    static url = {
        getHash() {
            return window.location.hash.substring(1);
        },
        
        setHash(hash) {
            window.location.hash = hash;
        },
        
        getParams() {
            const params = new URLSearchParams(window.location.search);
            const result = {};
            for (const [key, value] of params) {
                result[key] = value;
            }
            return result;
        },
        
        setParam(key, value) {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            window.history.replaceState({}, '', url);
        }
    };
    
    /**
     * Format Helper
     */
    static format = {
        bytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },
        
        date(date, options = {}) {
            const defaultOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(date).toLocaleDateString('de-DE', { ...defaultOptions, ...options });
        },
        
        number(num, decimals = 0) {
            return new Intl.NumberFormat('de-DE').format(num);
        }
    };
    
    /**
     * Validation Helper
     */
    static validate = {
        email(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        url(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        
        required(value) {
            return value !== null && value !== undefined && value !== '';
        },
        
        minLength(value, min) {
            return value && value.length >= min;
        },
        
        maxLength(value, max) {
            return value && value.length <= max;
        }
    };
    
    /**
     * Animation Helper
     */
    static animate = {
        fadeIn(element, duration = 300) {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            let start = performance.now();
            
            function animate(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
            
            requestAnimationFrame(animate);
        },
        
        fadeOut(element, duration = 300) {
            let start = performance.now();
            const initialOpacity = parseFloat(getComputedStyle(element).opacity);
            
            function animate(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = initialOpacity * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            }
            
            requestAnimationFrame(animate);
        },
        
        slideDown(element, duration = 300) {
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.display = 'block';
            
            const targetHeight = element.scrollHeight;
            let start = performance.now();
            
            function animate(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.height = (targetHeight * progress) + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.height = 'auto';
                    element.style.overflow = '';
                }
            }
            
            requestAnimationFrame(animate);
        },
        
        slideUp(element, duration = 300) {
            const initialHeight = element.offsetHeight;
            element.style.height = initialHeight + 'px';
            element.style.overflow = 'hidden';
            
            let start = performance.now();
            
            function animate(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.height = (initialHeight * (1 - progress)) + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    element.style.height = '';
                    element.style.overflow = '';
                }
            }
            
            requestAnimationFrame(animate);
        }
    };
    
    /**
     * Error Handler
     */
    static handleError(error, context = '') {
        console.error(`Admin Panel Error${context ? ` in ${context}` : ''}:`, error);
        
        // Error Notification
        if (window.AdminApp && window.AdminApp.stateManager) {
            window.AdminApp.stateManager.addNotification({
                type: 'error',
                title: 'Error',
                message: error.message || 'An error occurred',
                duration: 5000
            });
        }
    }
    
    /**
     * Performance Monitor
     */
    static performance = {
        measure(name, fn) {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`${name} took ${end - start} milliseconds`);
            return result;
        },
        
        async measureAsync(name, fn) {
            const start = performance.now();
            const result = await fn();
            const end = performance.now();
            console.log(`${name} took ${end - start} milliseconds`);
            return result;
        }
    };
}

// Global verfügbar machen
window.AdminUtils = AdminUtils;
