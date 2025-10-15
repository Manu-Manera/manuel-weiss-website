/**
 * 🚀 SMARTE WORKFLOW-ENHANCEMENTS
 * 
 * Moderne Web-App Features für bessere UX und Performance
 * Basierend auf 2025 Best Practices
 */

class WorkflowEnhancements {
    constructor() {
        this.init();
    }

    /**
     * 🚀 INITIALISIERE ALLE ENHANCEMENTS
     */
    init() {
        this.setupPWA();
        this.setupAutoSave();
        this.setupSmartNavigation();
        this.setupPerformanceMonitoring();
        this.setupFormValidation();
        this.setupKeyboardShortcuts();
        this.setupDarkMode();
        this.setupVoiceToText();
        this.setupDragAndDrop();
        this.setupRealTimePreview();
    }

    /**
     * 📱 PWA FEATURES
     */
    setupPWA() {
        // Service Worker Registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ PWA Service Worker registriert');
                    this.showNotification('PWA bereit - Offline-Funktionalität aktiviert');
                })
                .catch(error => console.log('❌ SW Registration fehlgeschlagen:', error));
        }

        // Install Prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });

        // App Installed
        window.addEventListener('appinstalled', () => {
            this.showNotification('App erfolgreich installiert!');
        });
    }

    /**
     * 💾 AUTO-SAVE FUNKTIONALITÄT
     */
    setupAutoSave() {
        const autoSaveElements = document.querySelectorAll('textarea, input[type="text"], input[type="email"]');
        
        autoSaveElements.forEach(element => {
            let timeout;
            
            element.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    const key = `draft_${element.name || element.id || 'default'}`;
                    localStorage.setItem(key, element.value);
                    
                    // Visual Feedback
                    this.showAutoSaveIndicator(element);
                }, 1000);
            });

            // Restore Draft
            const key = `draft_${element.name || element.id || 'default'}`;
            const draft = localStorage.getItem(key);
            if (draft) {
                element.value = draft;
                this.showRestoreIndicator(element);
            }
        });
    }

    /**
     * 🧭 SMARTE NAVIGATION
     */
    setupSmartNavigation() {
        // Speichere aktuellen Schritt
        const currentStep = window.location.pathname.split('/').pop();
        localStorage.setItem('currentStep', currentStep);
        
        // Intelligente Weiterleitung
        window.smartProceedToNextStep = () => {
            const nextStep = this.getNextStep(currentStep);
            if (nextStep) {
                // Speichere Fortschritt
                this.saveProgress();
                
                // Smooth Transition
                this.animateTransition(() => {
                    window.location.href = nextStep;
                });
            }
        };

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                if (document.querySelector('.proceed-btn')) {
                    document.querySelector('.proceed-btn').click();
                }
            }
        });
    }

    /**
     * 📊 PERFORMANCE MONITORING
     */
    setupPerformanceMonitoring() {
        window.addEventListener('load', () => {
            // Core Web Vitals
            this.measureCoreWebVitals();
            
            // Custom Metrics
            this.measureCustomMetrics();
        });
    }

    /**
     * ✅ FORM VALIDATION
     */
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showValidationErrors(form);
                }
            });

            // Real-time Validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    /**
     * ⌨️ KEYBOARD SHORTCUTS
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveProgress();
                this.showNotification('Fortschritt gespeichert!');
            }
            
            // Ctrl/Cmd + Enter = Next Step
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (window.smartProceedToNextStep) {
                    window.smartProceedToNextStep();
                }
            }
            
            // Escape = Back
            if (e.key === 'Escape') {
                this.goBack();
            }
        });
    }

    /**
     * 🌙 DARK MODE
     */
    setupDarkMode() {
        const darkModeToggle = document.createElement('button');
        darkModeToggle.innerHTML = '🌙';
        darkModeToggle.className = 'dark-mode-toggle';
        darkModeToggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: rgba(0,0,0,0.1);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(darkModeToggle);
        
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });
        
        // Restore Dark Mode
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }

    /**
     * 🎤 VOICE-TO-TEXT
     */
    setupVoiceToText() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'de-DE';
            
            // Voice Button für Textareas
            const textareas = document.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                const voiceBtn = document.createElement('button');
                voiceBtn.innerHTML = '🎤';
                voiceBtn.className = 'voice-btn';
                voiceBtn.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                `;
                
                textarea.style.position = 'relative';
                textarea.parentNode.style.position = 'relative';
                textarea.parentNode.appendChild(voiceBtn);
                
                voiceBtn.addEventListener('click', () => {
                    recognition.start();
                    voiceBtn.innerHTML = '🔴';
                    voiceBtn.disabled = true;
                });
            });
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const activeTextarea = document.activeElement;
                if (activeTextarea.tagName === 'TEXTAREA') {
                    activeTextarea.value += transcript;
                }
            };
            
            recognition.onend = () => {
                document.querySelectorAll('.voice-btn').forEach(btn => {
                    btn.innerHTML = '🎤';
                    btn.disabled = false;
                });
            };
        }
    }

    /**
     * 🖱️ DRAG & DROP
     */
    setupDragAndDrop() {
        const dropZones = document.querySelectorAll('.drop-zone, .file-upload-area');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                this.handleDroppedFiles(files);
            });
        });
    }

    /**
     * 👁️ REAL-TIME PREVIEW
     */
    setupRealTimePreview() {
        const previewElements = document.querySelectorAll('textarea[name*="anschreiben"], textarea[name*="cover"]');
        
        previewElements.forEach(textarea => {
            // Erstelle Preview Container
            const previewContainer = document.createElement('div');
            previewContainer.className = 'real-time-preview';
            previewContainer.style.cssText = `
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin-top: 10px;
                background: #f9f9f9;
                min-height: 100px;
                white-space: pre-wrap;
            `;
            
            textarea.parentNode.appendChild(previewContainer);
            
            // Real-time Update
            textarea.addEventListener('input', () => {
                previewContainer.textContent = textarea.value;
            });
        });
    }

    /**
     * 🔧 HELPER METHODS
     */
    getNextStep(current) {
        const steps = [
            'bewerbungsart-wahl.html',
            'ki-stellenanalyse.html', 
            'matching-skillgap.html',
            'anschreiben-generieren.html',
            'dokumente-optimieren.html',
            'design-layout.html',
            'export-versand.html'
        ];
        
        const currentIndex = steps.indexOf(current);
        return steps[currentIndex + 1] || null;
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                input.style.borderColor = '#27ae60';
            }
        });
        
        return isValid;
    }

    validateField(field) {
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            return false;
        } else {
            field.style.borderColor = '#27ae60';
            return true;
        }
    }

    saveProgress() {
        const formData = {};
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name || input.id) {
                formData[input.name || input.id] = input.value;
            }
        });
        
        localStorage.setItem('workflowProgress', JSON.stringify(formData));
    }

    measureCoreWebVitals() {
        // LCP - Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({entryTypes: ['largest-contentful-paint']});

        // FID - First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({entryTypes: ['first-input']});

        // CLS - Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
        }).observe({entryTypes: ['layout-shift']});
    }

    measureCustomMetrics() {
        // Page Load Time
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page Load Time:', loadTime + 'ms');
        
        // DOM Content Loaded
        const domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        console.log('DOM Content Loaded:', domContentLoaded + 'ms');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showAutoSaveIndicator(element) {
        element.style.borderColor = '#28a745';
        setTimeout(() => {
            element.style.borderColor = '';
        }, 1000);
    }

    showRestoreIndicator(element) {
        element.style.backgroundColor = '#d4edda';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 2000);
    }

    animateTransition(callback) {
        document.body.style.opacity = '0.5';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            callback();
        }, 300);
    }

    handleDroppedFiles(files) {
        Array.from(files).forEach(file => {
            console.log('Dropped file:', file.name, file.type, file.size);
            // Hier kann die Datei-Verarbeitung implementiert werden
        });
    }

    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        }
    }
}

// Initialisiere Enhancements
document.addEventListener('DOMContentLoaded', () => {
    new WorkflowEnhancements();
});

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkflowEnhancements;
}
