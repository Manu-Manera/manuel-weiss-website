// Translation Manager for Multilingual Website
// Supports German (de), English (en), French (fr), Spanish (es)

class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'de';
        this.translations = {};
        this.availableLanguages = {
            'de': 'Deutsch',
            'en': 'English', 
            'fr': 'Français',
            'es': 'Español',
            'it': 'Italiano'
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Translation Manager...');
        await this.loadTranslations();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyLanguage();
                this.createLanguageSwitcher();
            });
        } else {
            this.applyLanguage();
            this.createLanguageSwitcher();
        }
    }
    
    async loadTranslations() {
        try {
            console.log('📥 Loading translation files...');
            // Load all translation files
            const languages = Object.keys(this.availableLanguages);
            
            for (const lang of languages) {
                try {
                    const response = await fetch(`translations/${lang}.json`);
                    if (response.ok) {
                        this.translations[lang] = await response.json();
                        console.log(`✅ Loaded translations for ${lang}:`, Object.keys(this.translations[lang]).length, 'keys');
                    } else {
                        console.warn(`⚠️ Translation file for ${lang} not found, using fallback`);
                        this.translations[lang] = this.getFallbackTranslations(lang);
                    }
                } catch (fetchError) {
                    console.error(`❌ Error loading ${lang}.json:`, fetchError);
                    this.translations[lang] = this.getFallbackTranslations(lang);
                }
            }
            
            console.log('📚 All translations loaded:', Object.keys(this.translations));
        } catch (error) {
            console.error('❌ Critical error loading translations:', error);
            this.translations = this.getFallbackTranslations();
        }
    }
    
    getFallbackTranslations(lang = 'de') {
        // Fallback translations if files are not available
        return {
            'de': {
                'nav.home': 'Startseite',
                'nav.about': 'Über mich',
                'nav.services': 'Leistungen',
                'nav.contact': 'Kontakt',
                'nav.admin': 'Admin Panel',
                'nav.personality': 'Persönlichkeitsentwicklung',
                'nav.ikigai': 'Ikigai Planner',
                'nav.nutrition': 'Ernährungsberatung',
                'nav.training': 'Personal Training',
                'nav.coaching': 'Personal Coaching',
                'nav.applications': 'Bewerbungen',
                'nav.media': 'Medien',
                'nav.ai-twin': 'AI Twin',
                'nav.data': 'Daten',
                'nav.settings': 'Einstellungen',
                'common.save': 'Speichern',
                'common.cancel': 'Abbrechen',
                'common.delete': 'Löschen',
                'common.edit': 'Bearbeiten',
                'common.add': 'Hinzufügen',
                'common.continue': 'Weiter',
                'common.back': 'Zurück',
                'common.finish': 'Abschließen',
                'common.loading': 'Lädt...',
                'common.error': 'Fehler',
                'common.success': 'Erfolgreich',
                'common.warning': 'Warnung',
                'common.info': 'Information'
            },
            'en': {
                'nav.home': 'Home',
                'nav.about': 'About',
                'nav.services': 'Services',
                'nav.contact': 'Contact',
                'nav.admin': 'Admin Panel',
                'nav.personality': 'Personality Development',
                'nav.ikigai': 'Ikigai Planner',
                'nav.nutrition': 'Nutrition Consulting',
                'nav.training': 'Personal Training',
                'nav.coaching': 'Personal Coaching',
                'nav.applications': 'Applications',
                'nav.media': 'Media',
                'nav.ai-twin': 'AI Twin',
                'nav.data': 'Data',
                'nav.settings': 'Settings',
                'common.save': 'Save',
                'common.cancel': 'Cancel',
                'common.delete': 'Delete',
                'common.edit': 'Edit',
                'common.add': 'Add',
                'common.continue': 'Continue',
                'common.back': 'Back',
                'common.finish': 'Finish',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.warning': 'Warning',
                'common.info': 'Information'
            },
            'fr': {
                'nav.home': 'Accueil',
                'nav.about': 'À propos',
                'nav.services': 'Services',
                'nav.contact': 'Contact',
                'nav.admin': 'Panneau Admin',
                'nav.personality': 'Développement Personnel',
                'nav.ikigai': 'Planificateur Ikigai',
                'nav.nutrition': 'Conseil Nutrition',
                'nav.training': 'Entraînement Personnel',
                'nav.coaching': 'Coaching Personnel',
                'nav.applications': 'Candidatures',
                'nav.media': 'Médias',
                'nav.ai-twin': 'Jumeau IA',
                'nav.data': 'Données',
                'nav.settings': 'Paramètres',
                'common.save': 'Enregistrer',
                'common.cancel': 'Annuler',
                'common.delete': 'Supprimer',
                'common.edit': 'Modifier',
                'common.add': 'Ajouter',
                'common.continue': 'Continuer',
                'common.back': 'Retour',
                'common.finish': 'Terminer',
                'common.loading': 'Chargement...',
                'common.error': 'Erreur',
                'common.success': 'Succès',
                'common.warning': 'Avertissement',
                'common.info': 'Information'
            },
            'es': {
                'nav.home': 'Inicio',
                'nav.about': 'Acerca de',
                'nav.services': 'Servicios',
                'nav.contact': 'Contacto',
                'nav.admin': 'Panel Admin',
                'nav.personality': 'Desarrollo Personal',
                'nav.ikigai': 'Planificador Ikigai',
                'nav.nutrition': 'Consultoría Nutricional',
                'nav.training': 'Entrenamiento Personal',
                'nav.coaching': 'Coaching Personal',
                'nav.applications': 'Aplicaciones',
                'nav.media': 'Medios',
                'nav.ai-twin': 'Gemelo IA',
                'nav.data': 'Datos',
                'nav.settings': 'Configuración',
                'common.save': 'Guardar',
                'common.cancel': 'Cancelar',
                'common.delete': 'Eliminar',
                'common.edit': 'Editar',
                'common.add': 'Agregar',
                'common.continue': 'Continuar',
                'common.back': 'Atrás',
                'common.finish': 'Finalizar',
                'common.loading': 'Cargando...',
                'common.error': 'Error',
                'common.success': 'Éxito',
                'common.warning': 'Advertencia',
                'common.info': 'Información'
            }
        }[lang] || {};
    }
    
    translate(key, params = {}) {
        // Try current language first
        let translation = this.translations[this.currentLanguage]?.[key];
        
        // Fallback to German if not found
        if (!translation) {
            translation = this.translations['de']?.[key];
        }
        
        // Final fallback to key itself
        if (!translation) {
            console.warn(`⚠️ Translation missing for key: ${key} in language: ${this.currentLanguage}`);
            translation = key;
        }
        
        // Replace parameters in translation
        return translation.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
    }
    
    setLanguage(lang) {
        if (this.availableLanguages[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('selectedLanguage', lang);
            this.applyLanguage();
            this.updateLanguageSwitcher();
        }
    }
    
    applyLanguage() {
        console.log('🔄 Applying language:', this.currentLanguage);
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update all elements with data-de and data-en attributes
        document.querySelectorAll('[data-de][data-en]').forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = text;
                } else if (element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', text);
                } else {
                    // Behalte HTML-Struktur bei (z.B. <span> mit Klassen)
                    if (element.children.length > 0) {
                        // Wenn Element Kinder hat, nur Text-Knoten aktualisieren
                        Array.from(element.childNodes).forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE) {
                                node.textContent = text;
                            }
                        });
                    } else {
                        element.textContent = text;
                    }
                }
            }
        });
        
        // Update elements with only data-de or data-en (single language)
        document.querySelectorAll('[data-de]:not([data-en])').forEach(element => {
            if (this.currentLanguage === 'de') {
                const text = element.getAttribute('data-de');
                if (text) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.value = text;
                    } else if (element.hasAttribute('placeholder')) {
                        element.setAttribute('placeholder', text);
                    } else {
                        element.textContent = text;
                    }
                }
            }
        });
        
        document.querySelectorAll('[data-en]:not([data-de])').forEach(element => {
            if (this.currentLanguage === 'en') {
                const text = element.getAttribute('data-en');
                if (text) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.value = text;
                    } else if (element.hasAttribute('placeholder')) {
                        element.setAttribute('placeholder', text);
                    } else {
                        element.textContent = text;
                    }
                }
            }
        });
        
        // Update all elements with data-translate attribute (fallback)
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                element.placeholder = translation;
            } else if (element.tagName === 'INPUT' && element.type === 'value') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Update page title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            const titleDe = titleElement.getAttribute('data-de') || titleElement.textContent;
            const titleEn = titleElement.getAttribute('data-en');
            if (this.currentLanguage === 'en' && titleEn) {
                titleElement.textContent = titleEn;
            } else {
                titleElement.textContent = titleDe;
            }
        }
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            const descDe = metaDescription.getAttribute('data-de') || metaDescription.getAttribute('content');
            const descEn = metaDescription.getAttribute('data-en');
            if (this.currentLanguage === 'en' && descEn) {
                metaDescription.setAttribute('content', descEn);
            } else {
                metaDescription.setAttribute('content', descDe);
            }
        }
        
        this.updateLanguageSwitcher();
    }
    
    createLanguageSwitcher() {
        // Create language switcher if it doesn't exist
        let switcher = document.getElementById('language-switcher');
        if (!switcher) {
            switcher = document.createElement('div');
            switcher.id = 'language-switcher';
            switcher.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 0.5rem;
            `;
            document.body.appendChild(switcher);
        }
        
        this.updateLanguageSwitcher();
    }
    
    updateLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (!switcher) return;
        
        switcher.innerHTML = `
            <select onchange="window.translationManager.setLanguage(this.value)" 
                    style="border: none; background: none; font-size: 0.9rem; cursor: pointer;">
                ${Object.entries(this.availableLanguages).map(([code, name]) => 
                    `<option value="${code}" ${code === this.currentLanguage ? 'selected' : ''}>${name}</option>`
                ).join('')}
            </select>
        `;
    }
    
    // Method to get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    // Method to check if translation exists
    hasTranslation(key) {
        return !!this.translations[this.currentLanguage]?.[key];
    }
}

// Initialize translation manager immediately
console.log('🚀 Initializing Translation Manager...');
window.translationManager = new TranslationManager();

// Also initialize when DOM is ready as backup
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM ready, re-initializing Translation Manager...');
    if (!window.translationManager) {
        window.translationManager = new TranslationManager();
    } else {
        // Re-apply translations if already initialized
        window.translationManager.applyLanguage();
    }
});

// Helper function for easy translation
function t(key, params = {}) {
    return window.translationManager.translate(key, params);
}

// Make translation function globally available
window.t = t;
