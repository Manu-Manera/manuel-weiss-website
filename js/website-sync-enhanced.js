/**
 * Enhanced Website Data Sync
 * Robuste Synchronisation zwischen Admin Panel und Website
 */

class WebsiteDataSync {
    constructor() {
        this.storageKey = 'adminProfileData';
        this.profileImageKey = 'adminProfileImage';
        this.galleryKey = 'adminProfileGallery';
        this.init();
    }

    init() {
        console.log('🔄 Enhanced Website Data Sync initialisiert');
        
        // Sofortige Synchronisation beim Laden
        this.syncAllData();
        
        // Storage Event Listener für Admin-Änderungen
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey || e.key === this.profileImageKey || e.key === this.galleryKey) {
                console.log('📡 Storage Event erkannt:', e.key);
                this.syncAllData();
            }
        });
        
        // Polling als Fallback (alle 5 Sekunden)
        setInterval(() => {
            this.syncAllData();
        }, 5000);
        
        // Global verfügbar machen
        window.loadWebsiteDataFromLocalStorage = () => this.syncAllData();
    }

    /**
     * Alle Daten synchronisieren
     */
    syncAllData() {
        try {
            this.syncProfileData();
            this.syncProfileImage();
            this.syncStatistics();
            console.log('✅ Website-Synchronisation abgeschlossen');
        } catch (error) {
            console.error('❌ Website-Sync Fehler:', error);
        }
    }

    /**
     * Profildaten synchronisieren
     */
    syncProfileData() {
        const data = this.getStoredData();
        if (!data) return;

        // Hero-Titel aktualisieren (falls vorhanden)
        if (data.title) {
            const heroTitle = document.getElementById('hero-title');
            if (heroTitle) {
                heroTitle.innerHTML = `<span data-de="HR Berater für" data-en="HR Consultant for">HR Berater für</span> <span class="gradient-text">${data.title}</span>`;
            }
        }
        
        // Hero-Untertitel aktualisieren
        if (data.subtitle) {
            this.updateElement('#hero-subtitle', data.subtitle);
        }
        
        // Kontaktdaten aktualisieren (falls entsprechende Elemente vorhanden)
        this.updateElement('#hero-email', data.email);
        this.updateElement('#hero-phone', data.phone);
        this.updateElement('#hero-location', data.location);
        
        // Meta-Tags aktualisieren
        this.updateMetaTags(data);
        
        console.log('📝 Profildaten synchronisiert');
    }

    /**
     * Profilbild synchronisieren
     */
    syncProfileImage() {
        const imageData = localStorage.getItem(this.profileImageKey);
        if (!imageData) return;

        // Hauptprofilbild aktualisieren
        const profilePhoto = document.getElementById('profile-photo');
        if (profilePhoto) {
            profilePhoto.src = imageData;
            console.log('🖼️ Hauptprofilbild aktualisiert');
        }

        // Navigation-Logo aktualisieren
        const navLogo = document.querySelector('.nav-logo');
        if (navLogo) {
            navLogo.src = imageData;
            console.log('🖼️ Navigation-Logo aktualisiert');
        }

        // Weitere Profilbilder aktualisieren
        const profileImages = document.querySelectorAll('.profile-image, .avatar-image');
        profileImages.forEach(img => {
            if (img.tagName === 'IMG') {
                img.src = imageData;
            } else {
                img.style.backgroundImage = `url(${imageData})`;
            }
        });

        console.log('🖼️ Profilbild synchronisiert');
    }

    /**
     * Statistiken synchronisieren
     */
    syncStatistics() {
        const data = this.getStoredData();
        if (!data) return;

        // Statistiken aktualisieren
        this.updateElement('#stat1-number', data.stat1Number);
        this.updateElement('#stat1-label', data.stat1Label);
        this.updateElement('#stat2-number', data.stat2Number);
        this.updateElement('#stat2-label', data.stat2Label);
        this.updateElement('#stat3-number', data.stat3Number);
        this.updateElement('#stat3-label', data.stat3Label);

        console.log('📊 Statistiken synchronisiert');
    }

    /**
     * Gespeicherte Daten abrufen
     */
    getStoredData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    /**
     * Element aktualisieren
     */
    updateElement(selector, value) {
        if (!value) return;
        
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = value;
            } else {
                el.textContent = value;
            }
        });
    }

    /**
     * Meta-Tags aktualisieren
     */
    updateMetaTags(data) {
        if (data.name) {
            document.title = `${data.name} - ${data.title || 'HR Berater'}`;
            
            // Open Graph Tags
            this.updateMetaProperty('og:title', `${data.name} - ${data.title || 'HR Berater'}`);
            this.updateMetaProperty('og:description', data.subtitle || 'HR Berater für AI & Transformation');
        }
    }

    /**
     * Meta-Property aktualisieren
     */
    updateMetaProperty(property, content) {
        const meta = document.querySelector(`meta[property="${property}"]`);
        if (meta) {
            meta.setAttribute('content', content);
        }
    }
}

// Auto-Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new WebsiteDataSync();
});

// Global verfügbar machen
window.WebsiteDataSync = WebsiteDataSync;
