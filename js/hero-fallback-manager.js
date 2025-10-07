// =================== HERO FALLBACK MANAGER ===================
// Verwaltet Fallback-Daten für den Hero-Bereich der Website
// Ermöglicht Wiederherstellung der ursprünglichen Hero-Konfiguration

/**
 * HERO FALLBACK SYSTEM
 * - Lädt Fallback-Daten aus hero-fallback.json
 * - Stellt ursprüngliche Hero-Konfiguration wieder her
 * - Bietet Backup & Restore Funktionalität
 */

class HeroFallbackManager {
    constructor() {
        this.fallbackData = null;
        this.currentData = null;
        this.isLoaded = false;
    }

    /**
     * Lädt Fallback-Daten aus der JSON-Datei
     */
    async loadFallbackData() {
        try {
            const response = await fetch('data/hero-fallback.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.fallbackData = await response.json();
            this.isLoaded = true;
            
            console.log('✅ Hero Fallback-Daten geladen:', this.fallbackData.timestamp);
            return this.fallbackData;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Fallback-Daten:', error);
            return null;
        }
    }

    /**
     * Stellt die ursprünglichen Hero-Daten wieder her
     */
    async restoreHeroData() {
        if (!this.isLoaded) {
            await this.loadFallbackData();
        }

        if (!this.fallbackData) {
            console.error('❌ Keine Fallback-Daten verfügbar');
            return false;
        }

        try {
            const hero = this.fallbackData.heroData;
            
            // Hero Title wiederherstellen
            this.restoreHeroTitle(hero.title);
            
            // Hero Subtitle wiederherstellen
            this.restoreHeroSubtitle(hero.subtitle);
            
            // Statistiken wiederherstellen
            this.restoreStatistics(hero.statistics);
            
            // Kontaktdaten wiederherstellen
            this.restoreContactData(hero.contact);
            
            // Meta-Daten wiederherstellen
            this.restoreMetaData(hero.metaData);
            
            console.log('✅ Hero-Daten erfolgreich wiederhergestellt');
            return true;
            
        } catch (error) {
            console.error('❌ Fehler bei der Wiederherstellung:', error);
            return false;
        }
    }

    /**
     * Stellt Hero Title wieder her
     */
    restoreHeroTitle(title) {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && title) {
            // Spezielle Formatierung für "AI & Transformation"
            if (title.includes('AI & Transformation')) {
                const parts = title.split('AI & Transformation');
                heroTitle.innerHTML = `
                    <span>${parts[0]}</span>
                    <span class="gradient-text">AI & Transformation</span>
                `;
            } else {
                heroTitle.textContent = title;
            }
            console.log('📝 Hero Title wiederhergestellt');
        }
    }

    /**
     * Stellt Hero Subtitle wieder her
     */
    restoreHeroSubtitle(subtitle) {
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle && subtitle) {
            heroSubtitle.textContent = subtitle;
            console.log('📝 Hero Subtitle wiederhergestellt');
        }
    }

    /**
     * Stellt Statistiken wieder her
     */
    restoreStatistics(stats) {
        if (!stats) return;

        // Statistik 1
        if (stats.stat1) {
            const stat1Number = document.querySelector('.hero-stats .stat-item:nth-child(1) .stat-number');
            const stat1Label = document.querySelector('.hero-stats .stat-item:nth-child(1) .stat-label');
            if (stat1Number) stat1Number.textContent = stats.stat1.number;
            if (stat1Label) stat1Label.textContent = stats.stat1.label;
        }

        // Statistik 2
        if (stats.stat2) {
            const stat2Number = document.querySelector('.hero-stats .stat-item:nth-child(2) .stat-number');
            const stat2Label = document.querySelector('.hero-stats .stat-item:nth-child(2) .stat-label');
            if (stat2Number) stat2Number.textContent = stats.stat2.number;
            if (stat2Label) stat2Label.textContent = stats.stat2.label;
        }

        // Statistik 3
        if (stats.stat3) {
            const stat3Number = document.querySelector('.hero-stats .stat-item:nth-child(3) .stat-number');
            const stat3Label = document.querySelector('.hero-stats .stat-item:nth-child(3) .stat-label');
            if (stat3Number) stat3Number.textContent = stats.stat3.number;
            if (stat3Label) stat3Label.textContent = stats.stat3.label;
        }

        console.log('📊 Statistiken wiederhergestellt');
    }

    /**
     * Stellt Kontaktdaten wieder her
     */
    restoreContactData(contact) {
        if (!contact) return;

        // E-Mail Links
        if (contact.email) {
            const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
            emailLinks.forEach(link => {
                link.href = `mailto:${contact.email}`;
                link.textContent = contact.email;
            });
        }

        // Telefonnummer
        if (contact.phone) {
            const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
            phoneLinks.forEach(link => {
                link.href = `tel:${contact.phone}`;
                link.textContent = contact.phone;
            });
        }

        // Standort
        if (contact.location) {
            const locationElements = document.querySelectorAll('.contact-item h4');
            locationElements.forEach(element => {
                if (element.textContent.includes('Standort')) {
                    const locationP = element.nextElementSibling;
                    if (locationP) {
                        locationP.textContent = contact.country || 'Schweiz';
                    }
                }
            });
        }

        console.log('📞 Kontaktdaten wiederhergestellt');
    }

    /**
     * Stellt Meta-Daten wieder her
     */
    restoreMetaData(metaData) {
        if (!metaData) return;

        // Page Title
        if (metaData.pageTitle) {
            document.title = metaData.pageTitle;
        }

        // Meta Description
        if (metaData.metaDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', metaData.metaDescription);
            }
        }

        // Meta Keywords
        if (metaData.keywords) {
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', metaData.keywords);
            }
        }

        console.log('🏷️ Meta-Daten wiederhergestellt');
    }

    /**
     * Erstellt ein aktuelles Backup der Hero-Daten
     */
    createCurrentBackup() {
        const currentData = this.extractCurrentHeroData();
        const timestamp = new Date().toISOString();
        
        const backup = {
            timestamp: timestamp,
            description: "Aktueller Hero-Zustand (Backup)",
            heroData: currentData
        };

        // In localStorage speichern
        localStorage.setItem('hero_current_backup', JSON.stringify(backup));
        
        console.log('💾 Aktuelles Hero-Backup erstellt:', timestamp);
        return backup;
    }

    /**
     * Extrahiert aktuelle Hero-Daten von der Seite
     */
    extractCurrentHeroData() {
        const heroTitle = document.querySelector('.hero-title')?.textContent || '';
        const heroSubtitle = document.querySelector('.hero-subtitle')?.textContent || '';
        
        // Statistiken extrahieren
        const stat1Number = document.querySelector('.hero-stats .stat-item:nth-child(1) .stat-number')?.textContent || '';
        const stat1Label = document.querySelector('.hero-stats .stat-item:nth-child(1) .stat-label')?.textContent || '';
        const stat2Number = document.querySelector('.hero-stats .stat-item:nth-child(2) .stat-number')?.textContent || '';
        const stat2Label = document.querySelector('.hero-stats .stat-item:nth-child(2) .stat-label')?.textContent || '';
        const stat3Number = document.querySelector('.hero-stats .stat-item:nth-child(3) .stat-number')?.textContent || '';
        const stat3Label = document.querySelector('.hero-stats .stat-item:nth-child(3) .stat-label')?.textContent || '';

        return {
            title: heroTitle,
            subtitle: heroSubtitle,
            statistics: {
                stat1: { number: stat1Number, label: stat1Label },
                stat2: { number: stat2Number, label: stat2Label },
                stat3: { number: stat3Number, label: stat3Label }
            }
        };
    }

    /**
     * Zeigt Fallback-Informationen an
     */
    showFallbackInfo() {
        if (!this.fallbackData) {
            console.log('❌ Keine Fallback-Daten verfügbar');
            return;
        }

        const hero = this.fallbackData.heroData;
        console.log('📋 HERO FALLBACK INFORMATIONEN:');
        console.log('   Timestamp:', this.fallbackData.timestamp);
        console.log('   Title:', hero.title);
        console.log('   Subtitle:', hero.subtitle);
        console.log('   Email:', hero.contact?.email);
        console.log('   Phone:', hero.contact?.phone);
        console.log('   Statistics:', hero.statistics);
    }
}

// Globale Instanz erstellen
window.heroFallbackManager = new HeroFallbackManager();

// Utility-Funktionen für einfache Nutzung
window.restoreHeroFallback = async function() {
    const success = await window.heroFallbackManager.restoreHeroData();
    if (success) {
        alert('✅ Hero-Daten erfolgreich wiederhergestellt!');
    } else {
        alert('❌ Fehler bei der Wiederherstellung der Hero-Daten.');
    }
    return success;
};

window.showHeroFallbackInfo = function() {
    window.heroFallbackManager.showFallbackInfo();
};

window.createHeroBackup = function() {
    const backup = window.heroFallbackManager.createCurrentBackup();
    alert('💾 Backup erstellt! Timestamp: ' + new Date(backup.timestamp).toLocaleString());
    return backup;
};

console.log('✅ Hero Fallback Manager geladen');
