// Einfacher Translation Manager - nur data-de/data-en Attribute
// Einmal einstellen, alle Seiten übersetzt

class SimpleTranslation {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'de';
        this.init();
    }
    
    init() {
        // Warte auf DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyLanguage());
        } else {
            this.applyLanguage();
        }
        
        // Update Language Switcher
        this.updateLanguageSwitcher();
    }
    
    setLanguage(lang) {
        if (lang === 'de' || lang === 'en') {
            this.currentLanguage = lang;
            localStorage.setItem('selectedLanguage', lang);
            this.applyLanguage();
            this.updateLanguageSwitcher();
            
            // Update HTML lang attribute
            document.documentElement.lang = lang;
        }
    }
    
    applyLanguage() {
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
    }
    
    updateLanguageSwitcher() {
        // Update language switcher UI
        document.querySelectorAll('.lang-link[data-lang], .lang-link-compact[data-lang]').forEach(link => {
            if (link.getAttribute('data-lang') === this.currentLanguage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize
window.simpleTranslation = new SimpleTranslation();

