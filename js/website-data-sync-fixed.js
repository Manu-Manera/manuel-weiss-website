/**
 * Website Data Sync - KORRIGIERTE VERSION
 * Synchronisiert Admin-Daten mit Website - Löst alle Probleme
 */

console.log('🚀 WEBSITE DATA SYNC - KORRIGIERTE VERSION GESTARTET');

const ADMIN_DATA_KEY = 'adminProfileData';
const PROFILE_IMAGE_KEY = 'adminProfileImage';
const DEFAULT_PROFILE_IMAGE_FALLBACK = 'manuel-weiss-portrait.jpg';
const BROKEN_PROFILE_URL_PATTERNS = ['test-new-image.jpg'];

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
    
    if (!storedImage) {
        console.log('ℹ️ Kein Profilbild in LocalStorage gefunden');
        applyProfileImageToSelectors(DEFAULT_PROFILE_IMAGE_FALLBACK);
        return;
    }
    
    // Bekannte, kaputte URLs sofort entfernen
    if (BROKEN_PROFILE_URL_PATTERNS.some(pattern => storedImage.includes(pattern))) {
        console.warn('⚠️ Ungültige oder blockierte Profilbild-URL erkannt:', storedImage);
        localStorage.removeItem(PROFILE_IMAGE_KEY);
        applyProfileImageToSelectors(DEFAULT_PROFILE_IMAGE_FALLBACK);
        return;
    }
    
    // Base64-Images sofort anwenden
    if (storedImage.startsWith('data:')) {
        console.log('🖼️ Base64-Profilbild gefunden, aktualisiere Website...');
        applyProfileImageToSelectors(storedImage);
        return;
    }
    
    // Für HTTP/S-URLs sicherstellen, dass sie erreichbar sind
    console.log('🔎 Prüfe Profilbild-URL:', storedImage);
    verifyImageSource(storedImage)
        .then(() => {
            console.log('✅ Profilbild-URL ist erreichbar, aktualisiere Website...');
            applyProfileImageToSelectors(storedImage);
        })
        .catch(error => {
            console.error('❌ Profilbild-URL ist NICHT erreichbar:', error.message);
            localStorage.removeItem(PROFILE_IMAGE_KEY);
            applyProfileImageToSelectors(DEFAULT_PROFILE_IMAGE_FALLBACK);
        });
}

/**
 * Wendet das Profilbild auf alle relevanten Selektoren an
 * SCHUTZ: Überschreibt nicht, wenn bereits ein AWS-Profilbild gesetzt wurde
 */
function applyProfileImageToSelectors(src) {
    // SCHUTZ: Wenn bereits ein AWS-Profilbild gesetzt wurde, nicht überschreiben
    if (window.profileImageSetByAWS && window.currentProfileImageSrc) {
        const isAWSImage = window.currentProfileImageSrc.startsWith('http') || 
                          window.currentProfileImageSrc.includes('amazonaws') || 
                          window.currentProfileImageSrc.includes('s3') ||
                          window.currentProfileImageSrc.startsWith('data:');
        
        // Wenn das aktuelle Bild von AWS kommt und das neue Bild nicht, dann nicht überschreiben
        if (isAWSImage && !src.startsWith('http') && !src.includes('amazonaws') && !src.includes('s3') && !src.startsWith('data:')) {
            console.log('🛡️ WEBSITE DATA SYNC: AWS-Profilbild bereits gesetzt - überschreibe nicht mit localStorage-Bild');
            return;
        }
    }
    
    // SCHUTZ: Wenn bereits ein Profilbild gesetzt wurde (nicht Standard), prüfen ob überschreiben erlaubt
    const DEFAULT_IMAGES = ['manuel-weiss-portrait.jpg', 'manuel-weiss-photo.svg'];
    const isDefaultImage = DEFAULT_IMAGES.some(defaultImg => src.includes(defaultImg));
    const currentSrc = window.currentProfileImageSrc;
    
    if (currentSrc && !isDefaultImage) {
        const currentIsDefault = DEFAULT_IMAGES.some(defaultImg => currentSrc.includes(defaultImg));
        // Wenn aktuelles Bild nicht Standard ist und neues Bild auch nicht Standard, dann nicht überschreiben
        if (!currentIsDefault && !isDefaultImage && !src.startsWith('data:')) {
            console.log('🛡️ WEBSITE DATA SYNC: Profilbild bereits gesetzt - überschreibe nicht');
            return;
        }
    }
    
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
            // Nur setzen wenn es sich wirklich ändert
            if (imageElement.src !== src && imageElement.dataset.loadedSrc !== src) {
                imageElement.src = src;
                imageElement.dataset.loadedSrc = src;
                console.log(`✅ Profilbild aktualisiert: ${selector}`);
            }
        }
    });
    
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        if (img.alt && (img.alt.includes('Manuel') || img.alt.includes('Profil'))) {
            if (img.src !== src && img.dataset.loadedSrc !== src) {
                img.src = src;
                img.dataset.loadedSrc = src;
                console.log(`✅ Profilbild aktualisiert: ${img.alt}`);
            }
        }
    });
    
    // Aktualisiere window.currentProfileImageSrc
    window.currentProfileImageSrc = src;
}

/**
 * Prüft, ob eine Bild-URL geladen werden kann
 */
function verifyImageSource(src) {
    return new Promise((resolve, reject) => {
        const testImg = new Image();
        const cacheBustedSrc = src + (src.includes('?') ? '&' : '?') + 'cacheBust=' + Date.now();
        let finished = false;
        
        const cleanup = () => {
            finished = true;
            testImg.onload = null;
            testImg.onerror = null;
        };
        
        const timeoutId = setTimeout(() => {
            if (finished) return;
            cleanup();
            reject(new Error('Image load timeout'));
        }, 5000);
        
        testImg.onload = () => {
            if (finished) return;
            clearTimeout(timeoutId);
            cleanup();
            resolve();
        };
        
        testImg.onerror = () => {
            if (finished) return;
            clearTimeout(timeoutId);
            cleanup();
            reject(new Error('Image load error'));
        };
        
        testImg.src = cacheBustedSrc;
    });
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
    // Erst aus adminProfileData laden
    let storedData = localStorage.getItem(ADMIN_DATA_KEY);
    
    // Falls nicht vorhanden, auch aus heroData laden
    if (!storedData) {
        const heroData = localStorage.getItem('heroData');
        if (heroData) {
            try {
                const heroDataObj = JSON.parse(heroData);
                // heroData zu adminProfileData-Format konvertieren
                storedData = JSON.stringify({
                    title: heroDataObj.title || '',
                    subtitle: heroDataObj.subtitle || '',
                    email: heroDataObj.email || '',
                    phone: heroDataObj.phone || '',
                    location: heroDataObj.location || ''
                });
                console.log('📝 Lade Hero-Daten aus heroData');
            } catch (e) {
                console.error('❌ Fehler beim Konvertieren von heroData:', e);
            }
        }
    }
    
    if (storedData) {
        try {
            const profileData = JSON.parse(storedData);
            console.log('📝 Lade Hero-Daten:', profileData);
            
            if (document.body && document.body.getAttribute('data-hero-preset') === 'pe-landing') {
                console.log('ℹ️ Hero-Preset pe-landing: Titel/Untertitel bleiben fest (Backup in index-hr-backup.html)');
            } else {
                if (profileData.title) {
                    updateHeroTitle(profileData.title);
                }
                if (profileData.subtitle) {
                    updateHeroSubtitle(profileData.subtitle);
                }
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
    } else {
        console.log('ℹ️ Keine Hero-Daten in localStorage gefunden');
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
    if (event.key === ADMIN_DATA_KEY || event.key === 'adminProfileData') {
        console.log('🔄 Storage-Event erkannt für Profil-Daten. Aktualisiere Website...', event.key);
        loadWebsiteDataFromLocalStorage();
    }
    if (event.key === PROFILE_IMAGE_KEY || event.key === 'adminProfileImage' || event.key === 'heroProfileImage') {
        console.log('🔄 Storage-Event erkannt für Profilbild. Aktualisiere Website...', event.key);
        loadWebsiteProfileImage();
    }
    if (event.key === 'heroData') {
        console.log('🔄 Storage-Event erkannt für Hero-Daten. Aktualisiere Website...');
        loadWebsiteDataFromLocalStorage();
    }
});

/**
 * Initialisierung beim DOM-Load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM geladen, starte Website Data Sync...');
    
    // Warte kurz, damit AWS-Profilbild zuerst geladen werden kann
    setTimeout(() => {
        // Nur laden wenn noch kein Profilbild gesetzt wurde
        if (!window.currentProfileImageSrc || window.currentProfileImageSrc.includes('manuel-weiss-portrait.jpg') || window.currentProfileImageSrc.includes('manuel-weiss-photo.svg')) {
            loadWebsiteDataFromLocalStorage();
        } else {
            console.log('🛡️ WEBSITE DATA SYNC: Profilbild bereits gesetzt, überspringe localStorage-Laden');
        }
    }, 1500); // Warte länger, damit AWS-Profilbild zuerst geladen wird
    
    console.log('✅ Website Data Sync initialisiert');
});

/**
 * Globale Funktionen für manuelle Updates
 */
window.loadWebsiteDataFromLocalStorage = loadWebsiteDataFromLocalStorage;
window.loadWebsiteProfileImage = loadWebsiteProfileImage;
window.loadWebsiteStatistics = loadWebsiteStatistics;

console.log('🚀 Website Data Sync - Korrigierte Version bereit!');
