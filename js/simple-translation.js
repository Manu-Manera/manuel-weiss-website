// Einfacher Translation Manager - nur data-de/data-en Attribute
// Einmal einstellen, alle Seiten übersetzt

class SimpleTranslation {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'de';
        this.init();
    }
    
    init() {
        // Prüfe URL-Pfad für Sprache
        this.detectLanguageFromURL();
        
        // Warte auf DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyLanguage());
        } else {
            this.applyLanguage();
        }
        
        // Update Language Switcher
        this.updateLanguageSwitcher();
    }
    
    detectLanguageFromURL() {
        // Prüfe ob URL mit /en/ beginnt
        const path = window.location.pathname;
        if (path.startsWith('/en/') || path.includes('/en/')) {
            this.currentLanguage = 'en';
            localStorage.setItem('selectedLanguage', 'en');
            document.documentElement.lang = 'en';
        } else {
            // Standard: Deutsch, außer explizit auf Englisch
            const storedLang = localStorage.getItem('selectedLanguage');
            if (storedLang === 'en' && !path.startsWith('/en/')) {
                // Wenn gespeichert ist EN, aber URL ist nicht /en/, dann zu /en/ weiterleiten
                const newPath = '/en' + path;
                if (newPath !== path) {
                    window.location.href = newPath;
                    return;
                }
            }
            this.currentLanguage = storedLang || 'de';
            document.documentElement.lang = this.currentLanguage;
        }
    }
    
    switchLanguage(lang) {
        if (lang === 'de' || lang === 'en') {
            const currentPath = window.location.pathname;
            let newPath;
            
            if (lang === 'en') {
                // Wechsel zu Englisch: Füge /en/ hinzu
                if (currentPath.startsWith('/en/')) {
                    newPath = currentPath; // Bereits auf /en/
                } else if (currentPath === '/' || currentPath === '/index.html') {
                    newPath = '/en/index.html';
                } else {
                    newPath = '/en' + currentPath.replace(/^\/en/, '');
                }
            } else {
                // Wechsel zu Deutsch: Entferne /en/
                if (currentPath.startsWith('/en/')) {
                    newPath = currentPath.replace('/en/', '/');
                } else {
                    newPath = currentPath;
                }
            }
            
            // Navigiere zur neuen URL
            if (newPath !== currentPath) {
                window.location.href = newPath;
            } else {
                // Gleiche URL, nur Sprache ändern
                this.setLanguage(lang);
            }
        }
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
                    // Für Elemente mit Kindern (z.B. Buttons mit Icons): Suche nach <span> mit data-de/data-en
                    const childSpan = element.querySelector('span[data-de][data-en]');
                    if (childSpan) {
                        // Wenn ein <span> mit Übersetzungsattributen gefunden wird, aktualisiere diesen
                        const childText = childSpan.getAttribute(`data-${this.currentLanguage}`);
                        if (childText) {
                            childSpan.textContent = childText;
                        }
                    } else {
                        // Kein <span> mit Übersetzungen: Suche nach erstem <span> ohne Übersetzungen
                        const span = element.querySelector('span:not([data-de]):not([data-en])');
                        if (span) {
                            span.textContent = text;
                        } else {
                            // Kein <span> gefunden: Ersetze nur Text-Knoten, behalte Icons/HTML bei
                            const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                            if (textNodes.length > 0) {
                                textNodes.forEach(node => {
                                    node.textContent = text;
                                });
                            } else if (element.children.length === 0) {
                                // Keine Kinder: Text direkt setzen
                                element.textContent = text;
                            }
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

