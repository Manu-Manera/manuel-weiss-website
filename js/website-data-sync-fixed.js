/**
 * Website Data Sync - KORRIGIERTE VERSION
 * Synchronisiert Admin-Daten mit Website - Löst alle Probleme
 */

console.log('🚀 WEBSITE DATA SYNC - KORRIGIERTE VERSION GESTARTET');

const ADMIN_DATA_KEY = 'adminProfileData';
const PROFILE_IMAGE_KEY = 'adminProfileImage';

/**
 * Lädt Profilbild und Statistiken von LocalStorage und aktualisiert die Website
 */
function loadWebsiteDataFromLocalStorage() {
    console.log('🔄 Lade Website-Daten von LocalStorage...');
    
    try {
        // Profilbild laden
        loadWebsiteProfileImage();
        
        // Statistiken laden
        loadWebsiteStatistics();
        
        // Weitere Daten laden
        loadWebsiteAdditionalData();
        
        console.log('✅ Website-Daten erfolgreich geladen');
    } catch (error) {
        console.error('❌ Fehler beim Laden der Website-Daten:', error);
    }
}

/**
 * Lädt Profilbild von LocalStorage und aktualisiert die Website
 */
function loadWebsiteProfileImage() {
    const storedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
    if (storedImage) {
        console.log('🖼️ Profilbild gefunden, aktualisiere Website...');
        
        // Verschiedene Selektoren für Profilbild
        const imageSelectors = [
            '#hero-profile-image',
            '.hero-image',
            '.profile-image',
            '.main-image',
            'img[alt*="Manuel"]',
            'img[alt*="Profil"]',
            '.hero img',
            '.profile img'
        ];
        
        imageSelectors.forEach(selector => {
            const imageElement = document.querySelector(selector);
            if (imageElement) {
                imageElement.src = storedImage;
                console.log(`✅ Profilbild aktualisiert: ${selector}`);
            }
        });
        
        // Zusätzlich: Alle Bilder mit bestimmten Attributen aktualisieren
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            if (img.alt && (img.alt.includes('Manuel') || img.alt.includes('Profil'))) {
                img.src = storedImage;
                console.log(`✅ Profilbild aktualisiert: ${img.alt}`);
            }
        });
    } else {
        console.log('ℹ️ Kein Profilbild in LocalStorage gefunden');
    }
}

/**
 * Lädt Statistiken von LocalStorage und aktualisiert die Website
 */
function loadWebsiteStatistics() {
    const storedData = localStorage.getItem(ADMIN_DATA_KEY);
    if (storedData) {
        try {
            const profileData = JSON.parse(storedData);
            console.log('📊 Statistiken gefunden, aktualisiere Website...');
            
            // Statistik 1
            if (profileData.stat1Number) {
                updateStatisticElement('stat1', 'number', profileData.stat1Number);
            }
            if (profileData.stat1Label) {
                updateStatisticElement('stat1', 'label', profileData.stat1Label);
            }
            
            // Statistik 2
            if (profileData.stat2Number) {
                updateStatisticElement('stat2', 'number', profileData.stat2Number);
            }
            if (profileData.stat2Label) {
                updateStatisticElement('stat2', 'label', profileData.stat2Label);
            }
            
            // Statistik 3
            if (profileData.stat3Number) {
                updateStatisticElement('stat3', 'number', profileData.stat3Number);
            }
            if (profileData.stat3Label) {
                updateStatisticElement('stat3', 'label', profileData.stat3Label);
            }
            
            console.log('✅ Statistiken erfolgreich aktualisiert');
        } catch (error) {
            console.error('❌ Fehler beim Parsen der Statistiken:', error);
        }
    } else {
        console.log('ℹ️ Keine Statistiken in LocalStorage gefunden');
    }
}

/**
 * Aktualisiert ein Statistiken-Element mit verschiedenen Selektoren
 */
function updateStatisticElement(statNumber, type, value) {
    const selectors = [
        `#hero-${statNumber}-${type}`,
        `.hero-${statNumber}-${type}`,
        `.${statNumber}-${type}`,
        `[data-stat="${statNumber}"] .${type}`,
        `.stat-${statNumber} .${type}`,
        `.statistics .${statNumber} .${type}`,
        `.hero .${statNumber} .${type}`,
        `.main-stats .${statNumber} .${type}`
    ];
    
    let updated = false;
    
    selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
            console.log(`✅ Statistik aktualisiert: ${selector} = ${value}`);
            updated = true;
        }
    });
    
    if (!updated) {
        console.log(`ℹ️ Kein Element gefunden für Statistik ${statNumber}-${type}`);
    }
}

/**
 * Lädt weitere Daten von LocalStorage
 */
function loadWebsiteAdditionalData() {
    const storedData = localStorage.getItem(ADMIN_DATA_KEY);
    if (storedData) {
        try {
            const profileData = JSON.parse(storedData);
            
            // Name aktualisieren
            if (profileData.name) {
                updateElementWithSelectors([
                    '#hero-name', '.hero-name', '.main-name', 'h1'
                ], profileData.name);
            }
            
            // Titel aktualisieren
            if (profileData.title) {
                updateElementWithSelectors([
                    '#hero-title', '.hero-title', '.main-title', 'h2'
                ], profileData.title);
            }
            
            // Bio aktualisieren
            if (profileData.bio) {
                updateElementWithSelectors([
                    '#about-bio', '.about-bio', '.main-bio', '.bio'
                ], profileData.bio);
            }
            
            // E-Mail aktualisieren
            if (profileData.email) {
                updateElementWithSelectors([
                    '#about-email', '.about-email', '.contact-email', '.email'
                ], profileData.email);
            }
            
            // Telefon aktualisieren
            if (profileData.phone) {
                updateElementWithSelectors([
                    '#about-phone', '.about-phone', '.contact-phone', '.phone'
                ], profileData.phone);
            }
            
            // Standort aktualisieren
            if (profileData.location) {
                updateElementWithSelectors([
                    '#about-location', '.about-location', '.contact-location', '.location'
                ], profileData.location);
            }
            
            console.log('✅ Zusätzliche Daten erfolgreich aktualisiert');
        } catch (error) {
            console.error('❌ Fehler beim Laden der zusätzlichen Daten:', error);
        }
    }
}

/**
 * Aktualisiert Elemente mit verschiedenen Selektoren
 */
function updateElementWithSelectors(selectors, value) {
    let updated = false;
    
    selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
            console.log(`✅ Element aktualisiert: ${selector} = ${value}`);
            updated = true;
        }
    });
    
    if (!updated) {
        console.log(`ℹ️ Kein Element gefunden für Selektoren: ${selectors.join(', ')}`);
    }
}

/**
 * Event Listener für Storage-Änderungen
 */
window.addEventListener('storage', (event) => {
    if (event.key === ADMIN_DATA_KEY) {
        console.log('🔄 Storage-Event erkannt für Profil-Daten. Aktualisiere Website...');
        loadWebsiteDataFromLocalStorage();
    }
    if (event.key === PROFILE_IMAGE_KEY) {
        console.log('🔄 Storage-Event erkannt für Profilbild. Aktualisiere Website...');
        loadWebsiteProfileImage();
    }
});

/**
 * Initialisierung beim DOM-Load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM geladen, starte Website Data Sync...');
    loadWebsiteDataFromLocalStorage();
    
    // Zusätzlich: Alle 5 Sekunden prüfen (für den Fall, dass Storage-Events nicht funktionieren)
    setInterval(() => {
        loadWebsiteDataFromLocalStorage();
    }, 5000);
    
    console.log('✅ Website Data Sync initialisiert');
});

/**
 * Globale Funktionen für manuelle Updates
 */
window.loadWebsiteDataFromLocalStorage = loadWebsiteDataFromLocalStorage;
window.loadWebsiteProfileImage = loadWebsiteProfileImage;
window.loadWebsiteStatistics = loadWebsiteStatistics;

console.log('🚀 Website Data Sync - Korrigierte Version bereit!');
