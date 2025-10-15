/**
 * Translations Management Section
 * Mehrsprachige Website-Inhalte verwalten
 */

class TranslationsSection {
    constructor() {
        this.currentLanguage = 'de';
        this.translations = {};
        this.changes = {};
    }

    async init() {
        console.log('🌍 Translations Section: Initializing...');
        this.setupEventListeners();
        await this.loadTranslations();
        this.renderTranslations();
    }

    setupEventListeners() {
        // Language Tabs
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab-btn')) {
                this.switchLanguage(e.target.dataset.lang);
            }
        });

        // Translation Inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('input[data-original], textarea[data-original]')) {
                this.markAsChanged(e.target);
            }
        });

        // Actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="save-translations"]')) {
                this.saveTranslations();
            }
            if (e.target.matches('[data-action="preview-translations"]')) {
                this.previewTranslations();
            }
        });
    }

    async loadTranslations() {
        try {
            const storedTranslations = localStorage.getItem('website_translations');
            if (storedTranslations) {
                this.translations = JSON.parse(storedTranslations);
            } else {
                // Fallback: Standard Übersetzungen
                this.translations = {
                    de: {
                        'nav.home': 'Home',
                        'nav.services': 'Services',
                        'nav.about': 'Über mich',
                        'nav.contact': 'Kontakt',
                        'hero.title': 'HR Berater für AI & Transformation',
                        'hero.subtitle': 'Innovative Lösungen für moderne Unternehmen. Digitalisierung, Geschäftsprozesse und Personalwesen.',
                        'services.title': 'Meine Services',
                        'services.subtitle': 'Professionelle Beratung in den Bereichen HR, AI und Geschäftsprozesse',
                        'personality.title': 'Persönlichkeitsentwicklung',
                        'personality.subtitle': 'Entwickle dich kontinuierlich weiter mit bewährten Methoden'
                    },
                    en: {
                        'nav.home': 'Home',
                        'nav.services': 'Services',
                        'nav.about': 'About',
                        'nav.contact': 'Contact',
                        'hero.title': 'HR Consultant for AI & Transformation',
                        'hero.subtitle': 'Innovative solutions for modern companies. Digitalization, business processes and human resources.',
                        'services.title': 'My Services',
                        'services.subtitle': 'Professional consulting in HR, AI and business processes',
                        'personality.title': 'Personality Development',
                        'personality.subtitle': 'Continuously develop yourself with proven methods'
                    }
                };
            }
        } catch (error) {
            console.error('❌ Translations: Error loading translations:', error);
        }
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        
        // Tab States aktualisieren
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
        
        // Übersetzungen laden
        this.renderTranslations();
    }

    renderTranslations() {
        const currentTranslations = this.translations[this.currentLanguage] || {};
        
        // Alle Input-Felder mit Übersetzungen füllen
        document.querySelectorAll('input[data-original], textarea[data-original]').forEach(input => {
            const key = input.id;
            const translation = currentTranslations[key];
            
            if (translation) {
                input.value = translation;
            } else {
                // Fallback auf Original
                input.value = input.dataset.original || '';
            }
        });
    }

    markAsChanged(input) {
        const key = input.id;
        this.changes[key] = input.value;
        
        // Visual Indicator
        input.style.borderColor = '#f59e0b';
        input.style.backgroundColor = '#fef3c7';
    }

    async saveTranslations() {
        try {
            // Änderungen in translations speichern
            if (!this.translations[this.currentLanguage]) {
                this.translations[this.currentLanguage] = {};
            }
            
            Object.keys(this.changes).forEach(key => {
                this.translations[this.currentLanguage][key] = this.changes[key];
            });
            
            // In localStorage speichern
            localStorage.setItem('website_translations', JSON.stringify(this.translations));
            
            // Visual Feedback zurücksetzen
            document.querySelectorAll('input[data-original], textarea[data-original]').forEach(input => {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            });
            
            this.changes = {};
            this.showMessage('Übersetzungen erfolgreich gespeichert!', 'success');
            
        } catch (error) {
            console.error('❌ Translations: Error saving translations:', error);
            this.showMessage('Fehler beim Speichern der Übersetzungen', 'error');
        }
    }

    previewTranslations() {
        // Preview in neuem Tab öffnen
        const previewData = {
            language: this.currentLanguage,
            translations: this.translations[this.currentLanguage] || {}
        };
        
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html lang="${this.currentLanguage}">
            <head>
                <meta charset="UTF-8">
                <title>Translation Preview - ${this.currentLanguage.toUpperCase()}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 2rem; background: #f8fafc; }
                    .preview-container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .preview-section { margin-bottom: 2rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 6px; }
                    .preview-section h3 { color: #6366f1; margin-bottom: 1rem; }
                    .preview-item { margin-bottom: 0.5rem; }
                    .preview-label { font-weight: 600; color: #374151; }
                    .preview-value { color: #6b7280; margin-left: 1rem; }
                </style>
            </head>
            <body>
                <div class="preview-container">
                    <h1>🌍 Translation Preview - ${this.currentLanguage.toUpperCase()}</h1>
                    <div class="preview-section">
                        <h3>Navigation</h3>
                        <div class="preview-item">
                            <span class="preview-label">Home:</span>
                            <span class="preview-value">${previewData.translations['nav.home'] || 'Home'}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Services:</span>
                            <span class="preview-value">${previewData.translations['nav.services'] || 'Services'}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">About:</span>
                            <span class="preview-value">${previewData.translations['nav.about'] || 'About'}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Contact:</span>
                            <span class="preview-value">${previewData.translations['nav.contact'] || 'Contact'}</span>
                        </div>
                    </div>
                    <div class="preview-section">
                        <h3>Hero Section</h3>
                        <div class="preview-item">
                            <span class="preview-label">Title:</span>
                            <span class="preview-value">${previewData.translations['hero.title'] || 'HR Consultant'}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Subtitle:</span>
                            <span class="preview-value">${previewData.translations['hero.subtitle'] || 'Professional services'}</span>
                        </div>
                    </div>
                    <div class="preview-section">
                        <h3>Services</h3>
                        <div class="preview-item">
                            <span class="preview-label">Title:</span>
                            <span class="preview-value">${previewData.translations['services.title'] || 'My Services'}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Subtitle:</span>
                            <span class="preview-value">${previewData.translations['services.subtitle'] || 'Professional consulting'}</span>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    showMessage(message, type = 'info') {
        // Toast Notification anzeigen
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export für AdminApplication
window.TranslationsSection = TranslationsSection;
