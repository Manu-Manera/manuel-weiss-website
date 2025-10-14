/**
 * Website Data Sync - Synchronisiert Admin-Daten mit Website
 * Löst das Problem mit Profilbild und Statistiken auf der Hauptseite
 */

class WebsiteDataSync {
    constructor() {
        this.storageKey = 'manuel_weiss_website_data';
        this.init();
    }

    /**
     * Initialisierung
     */
    init() {
        console.log('🌐 Website Data Sync initialisiert');
        this.loadAndApplyData();
        this.setupAutoSync();
    }

    /**
     * Daten laden und anwenden
     */
    loadAndApplyData() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                const data = JSON.parse(storedData);
                this.applyDataToWebsite(data);
                console.log('✅ Website-Daten angewendet:', data);
            } else {
                console.log('ℹ️ Keine gespeicherten Daten gefunden, verwende Standardwerte');
                this.applyDefaultData();
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden der Website-Daten:', error);
            this.applyDefaultData();
        }
    }

    /**
     * Daten auf Website anwenden
     */
    applyDataToWebsite(data) {
        // Hero-Statistiken aktualisieren
        this.updateHeroStats(data);
        
        // Profilbild aktualisieren
        this.updateProfileImage(data);
        
        // Weitere Daten aktualisieren
        this.updateHeroContent(data);
        
        console.log('🎯 Website-Daten erfolgreich angewendet');
    }

    /**
     * Hero-Statistiken aktualisieren
     */
    updateHeroStats(data) {
        const stats = [
            { number: data.stat1Number, label: data.stat1Label, selector: '.hero-stat-1' },
            { number: data.stat2Number, label: data.stat2Label, selector: '.hero-stat-2' },
            { number: data.stat3Number, label: data.stat3Label, selector: '.hero-stat-3' }
        ];

        stats.forEach((stat, index) => {
            if (stat.number && stat.label) {
                // Verschiedene Selektoren für verschiedene Seiten
                const selectors = [
                    `.hero-stat-${index + 1} .stat-number`,
                    `.stat-${index + 1} .stat-number`,
                    `.hero-stats .stat:nth-child(${index + 1}) .stat-number`,
                    `.stats .stat:nth-child(${index + 1}) .number`,
                    `#stat${index + 1}-number`,
                    `.hero-stat-${index + 1} .number`
                ];

                const labelSelectors = [
                    `.hero-stat-${index + 1} .stat-label`,
                    `.stat-${index + 1} .stat-label`,
                    `.hero-stats .stat:nth-child(${index + 1}) .stat-label`,
                    `.stats .stat:nth-child(${index + 1}) .label`,
                    `#stat${index + 1}-label`,
                    `.hero-stat-${index + 1} .label`
                ];

                // Zahl aktualisieren
                this.updateElements(selectors, stat.number);
                
                // Label aktualisieren
                this.updateElements(labelSelectors, stat.label);
            }
        });
    }

    /**
     * Profilbild aktualisieren
     */
    updateProfileImage(data) {
        if (data.profileImage) {
            const imageSelectors = [
                '.profile-image',
                '.hero-image',
                '.main-image',
                '.profile-photo',
                '.hero-photo',
                '#hero-image',
                '#profile-image',
                '.about-image',
                '.hero-section img',
                '.profile-section img'
            ];

            this.updateElements(imageSelectors, data.profileImage, 'src');
        }
    }

    /**
     * Hero-Content aktualisieren
     */
    updateHeroContent(data) {
        if (data.name) {
            const nameSelectors = [
                '.hero-name',
                '.main-name',
                '.profile-name',
                '#hero-name',
                '.hero-title h1',
                '.hero-content h1'
            ];
            this.updateElements(nameSelectors, data.name);
        }

        if (data.title) {
            const titleSelectors = [
                '.hero-title',
                '.main-title',
                '.profile-title',
                '#hero-title',
                '.hero-subtitle',
                '.hero-content h2'
            ];
            this.updateElements(titleSelectors, data.title);
        }

        if (data.description) {
            const descSelectors = [
                '.hero-description',
                '.main-description',
                '.profile-description',
                '#hero-description',
                '.hero-text',
                '.hero-content p'
            ];
            this.updateElements(descSelectors, data.description);
        }
    }

    /**
     * Elemente aktualisieren
     */
    updateElements(selectors, value, attribute = 'textContent') {
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (attribute === 'src') {
                    element.src = value;
                } else if (attribute === 'innerHTML') {
                    element.innerHTML = value;
                } else {
                    element.textContent = value;
                }
            });
        });
    }

    /**
     * Standard-Daten anwenden
     */
    applyDefaultData() {
        const defaultData = {
            stat1Number: '5+',
            stat1Label: 'Jahre Erfahrung',
            stat2Number: '50+',
            stat2Label: 'Projekte',
            stat3Number: '100%',
            stat3Label: 'Zufriedenheit',
            profileImage: 'manuel-weiss-photo.svg',
            name: 'Manuel Weiss',
            title: 'HR-Berater & Digitalisierungsexperte',
            description: 'Professionelle Beratung für HR, Digitalisierung und Persönlichkeitsentwicklung'
        };

        this.applyDataToWebsite(defaultData);
    }

    /**
     * Auto-Sync einrichten
     */
    setupAutoSync() {
        // Alle 5 Sekunden auf Änderungen prüfen
        setInterval(() => {
            this.checkForUpdates();
        }, 5000);

        // Storage-Event-Listener für sofortige Synchronisation
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                console.log('🔄 Storage-Event erkannt, synchronisiere...');
                this.loadAndApplyData();
            }
        });

        // Visibility-Change-Event für Tab-Wechsel
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👁️ Tab wieder sichtbar, synchronisiere...');
                this.loadAndApplyData();
            }
        });
    }

    /**
     * Auf Updates prüfen
     */
    checkForUpdates() {
        try {
            const currentData = localStorage.getItem(this.storageKey);
            if (currentData) {
                const data = JSON.parse(currentData);
                const lastUpdate = data.lastUpdated;
                
                if (lastUpdate && this.lastUpdateTime !== lastUpdate) {
                    console.log('🔄 Update erkannt, synchronisiere...');
                    this.lastUpdateTime = lastUpdate;
                    this.applyDataToWebsite(data);
                }
            }
        } catch (error) {
            console.error('❌ Fehler beim Update-Check:', error);
        }
    }

    /**
     * Manuelle Synchronisation
     */
    forceSync() {
        console.log('🔄 Manuelle Synchronisation gestartet...');
        this.loadAndApplyData();
    }

    /**
     * Debug-Informationen
     */
    getDebugInfo() {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return {
            hasData: !!localStorage.getItem(this.storageKey),
            dataKeys: Object.keys(data),
            lastUpdated: data.lastUpdated,
            currentStats: {
                stat1: `${data.stat1Number} ${data.stat1Label}`,
                stat2: `${data.stat2Number} ${data.stat2Label}`,
                stat3: `${data.stat3Number} ${data.stat3Label}`
            }
        };
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    window.websiteDataSync = new WebsiteDataSync();
    
    // Debug-Funktionen für Konsole
    window.debugWebsiteSync = () => {
        console.log('🔍 Website Sync Debug Info:', window.websiteDataSync.getDebugInfo());
    };
    
    window.forceWebsiteSync = () => {
        window.websiteDataSync.forceSync();
    };
});

// Globale Funktionen
window.syncWebsiteData = function() {
    if (window.websiteDataSync) {
        window.websiteDataSync.forceSync();
    }
};

window.getWebsiteData = function() {
    if (window.websiteDataSync) {
        return window.websiteDataSync.getDebugInfo();
    }
    return null;
};
