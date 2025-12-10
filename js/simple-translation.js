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
                    // Für Elemente mit Kindern (z.B. Buttons mit Icons): Nur den Text-Content aktualisieren
                    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                    const hasOnlyText = element.children.length === 0 || (element.children.length === 1 && element.querySelector('i, svg, img'));
                    
                    if (hasOnlyText && textNodes.length > 0) {
                        // Ersetze nur Text-Knoten, behalte Icons/HTML bei
                        textNodes.forEach(node => {
                            node.textContent = text;
                        });
                    } else if (element.children.length === 0) {
                        // Keine Kinder: Text direkt setzen
                        element.textContent = text;
                    } else {
                        // Elemente mit Kindern: Suche nach <span> oder direktem Text
                        const span = element.querySelector('span:not([data-de]):not([data-en])');
                        if (span) {
                            span.textContent = text;
                        } else {
                            // Fallback: Ersetze Text-Knoten
                            textNodes.forEach(node => {
                                node.textContent = text;
                            });
                        }
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
        // Update language switcher UI (Desktop und Mobile)
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

