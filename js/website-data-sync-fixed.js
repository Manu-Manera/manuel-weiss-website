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
        
        // Verschiedene Selektoren für Profilbild - WICHTIG: #profile-photo zuerst prüfen
        const imageSelectors = [
            '#profile-photo',
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
            console.log('📝 Lade Hero-Daten:', profileData);
            
            // Hero Titel aktualisieren
            if (profileData.title) {
                updateHeroTitle(profileData.title);
            }
            
            // Hero Untertitel aktualisieren
            if (profileData.subtitle) {
                updateHeroSubtitle(profileData.subtitle);
            }
            
            // Kontakt-Daten aktualisieren
            if (profileData.email) {
                updateContactEmail(profileData.email);
            }
            
            if (profileData.phone) {
                updateContactPhone(profileData.phone);
            }
            
            if (profileData.location) {
                updateContactLocation(profileData.location);
            }
            
            console.log('✅ Hero-Daten erfolgreich aktualisiert');
        } catch (error) {
            console.error('❌ Fehler beim Laden der Hero-Daten:', error);
        }
    }
}

/**
 * Hero Titel aktualisieren
 */
function updateHeroTitle(title) {
    const titleSelectors = [
        '.hero-title .gradient-text',
        '.hero-title span.gradient-text',
        '.hero h1 .gradient-text',
        '.hero h1 span:last-child'
    ];
    
    titleSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            // Prüfen ob Herz-Animation vorhanden ist
            const heartSpan = element.querySelector('.heart-animation');
            
            // Text aktualisieren, aber Herz-Animation beibehalten
            if (title.includes('❤️') || title.includes('<span')) {
                element.innerHTML = title;
            } else {
                // Herz-Animation hinzufügen wenn nicht vorhanden
                const heartHtml = heartSpan ? heartSpan.outerHTML : '<span class="heart-animation">❤️</span>';
                element.innerHTML = title + ' ' + heartHtml;
            }
            console.log(`✅ Hero Titel aktualisiert: ${selector} = ${title}`);
        }
    });
}

/**
 * Hero Untertitel aktualisieren
 */
function updateHeroSubtitle(subtitle) {
    const subtitleSelectors = [
        '.hero-subtitle',
        '.hero p',
        '.hero-content p'
    ];
    
    subtitleSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = subtitle;
            console.log(`✅ Hero Untertitel aktualisiert: ${selector} = ${subtitle}`);
        }
    });
}

/**
 * Kontakt E-Mail aktualisieren
 */
function updateContactEmail(email) {
    const emailSelectors = [
        'a[href^="mailto:"]',
        '.contact-item a[href^="mailto:"]',
        '.contact-details a[href^="mailto:"]'
    ];
    
    emailSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.href = `mailto:${email}`;
            element.textContent = email;
            console.log(`✅ E-Mail aktualisiert: ${selector} = ${email}`);
        }
    });
}

/**
 * Kontakt Telefon aktualisieren
 */
function updateContactPhone(phone) {
    const phoneSelectors = [
        'a[href^="tel:"]',
        '.contact-item a[href^="tel:"]',
        '.contact-details a[href^="tel:"]'
    ];
    
    phoneSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.href = `tel:${phone}`;
            element.textContent = phone;
            console.log(`✅ Telefon aktualisiert: ${selector} = ${phone}`);
        }
    });
}

/**
 * Kontakt Standort aktualisieren
 */
function updateContactLocation(location) {
    const locationSelectors = [
        '.contact-item p',
        '.contact-details p',
        '.contact-item:has(.fas.fa-map-marker-alt) p'
    ];
    
    locationSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element && element.textContent.includes('Pilatusstrasse')) {
            element.textContent = location;
            console.log(`✅ Standort aktualisiert: ${selector} = ${location}`);
        }
    });
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
    
    // Re-apply kurz nach nachgeladenen Skripten
    setTimeout(loadWebsiteDataFromLocalStorage, 300);
    setTimeout(loadWebsiteDataFromLocalStorage, 1000);
    
    console.log('✅ Website Data Sync initialisiert');
});

/**
 * Globale Funktionen für manuelle Updates
 */
window.loadWebsiteDataFromLocalStorage = loadWebsiteDataFromLocalStorage;
window.loadWebsiteProfileImage = loadWebsiteProfileImage;
window.loadWebsiteStatistics = loadWebsiteStatistics;

console.log('🚀 Website Data Sync - Korrigierte Version bereit!');
