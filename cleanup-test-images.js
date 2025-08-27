// AGGRESSIVE Cleanup-Funktion für ALLE Testbilder
// Diese Datei kann in der Browser-Konsole ausgeführt werden

function aggressiveCleanupAllImages() {
    console.log('🔥 AGGRESSIVE BEREINIGUNG - Lösche ALLE Bilder...');
    
    const activities = ['wohnmobil', 'fotobox', 'sup', 'ebike'];
    let totalRemoved = 0;
    
    // 1. Lösche ALLE Keys, die Bilder enthalten könnten
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
        // Lösche ALLE Keys, die mit Bildern zu tun haben
        if (key.includes('image') || 
            key.includes('Image') || 
            key.includes('gallery') || 
            key.includes('Gallery') ||
            key.includes('photo') ||
            key.includes('Photo') ||
            key.includes('picture') ||
            key.includes('Picture') ||
            key.includes('upload') ||
            key.includes('Upload') ||
            key.includes('file') ||
            key.includes('File') ||
            key.includes('test') ||
            key.includes('Test') ||
            key.includes('sample') ||
            key.includes('Sample') ||
            key.includes('default') ||
            key.includes('Default') ||
            key.includes('placeholder') ||
            key.includes('Placeholder') ||
            key.includes('demo') ||
            key.includes('Demo')) {
            
            localStorage.removeItem(key);
            console.log(`🗑️ GELÖSCHT: ${key}`);
            totalRemoved++;
        }
    });
    
    // 2. Lösche spezifisch alle Aktivitäts-bezogenen Keys
    activities.forEach(activity => {
        const specificKeys = [
            `${activity}_images`,
            `${activity}_netlify_images`,
            `${activity}_netlify_saved`,
            `${activity}_persistent_images`,
            `${activity}_test_images`,
            `${activity}_sample_images`,
            `${activity}_default_images`,
            `${activity}_placeholder_images`,
            `${activity}_gallery`,
            `${activity}_photos`,
            `${activity}_uploads`,
            `${activity}_files`
        ];
        
        specificKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ GELÖSCHT: ${key}`);
                totalRemoved++;
            }
        });
    });
    
    // 3. Lösche globale Bild-Keys
    const globalImageKeys = [
        'globalImages',
        'globalImageDatabase',
        'testImages',
        'sampleImages',
        'defaultImages',
        'placeholderImages',
        'demoImages',
        'imageDatabase',
        'galleryData',
        'photoData',
        'uploadData',
        'fileData'
    ];
    
    globalImageKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ GELÖSCHT: ${key}`);
            totalRemoved++;
        }
    });
    
    // 4. Lösche websiteData komplett und erstelle neu
    const websiteData = JSON.parse(localStorage.getItem('websiteData') || '{}');
    if (websiteData.activityImages || websiteData.images || websiteData.gallery) {
        delete websiteData.activityImages;
        delete websiteData.images;
        delete websiteData.gallery;
        localStorage.setItem('websiteData', JSON.stringify(websiteData));
        console.log('🗑️ GELÖSCHT: websiteData Bilddaten');
        totalRemoved++;
    }
    
    // 5. Lösche auch alle anderen möglichen Bild-Referenzen
    const remainingKeys = Object.keys(localStorage);
    remainingKeys.forEach(key => {
        if (key.toLowerCase().includes('img') || 
            key.toLowerCase().includes('pic') || 
            key.toLowerCase().includes('photo') ||
            key.toLowerCase().includes('gallery') ||
            key.toLowerCase().includes('upload')) {
            localStorage.removeItem(key);
            console.log(`🗑️ GELÖSCHT: ${key}`);
            totalRemoved++;
        }
    });
    
    console.log(`🔥 AGGRESSIVE BEREINIGUNG ABGESCHLOSSEN!`);
    console.log(`🗑️ ${totalRemoved} Einträge komplett gelöscht!`);
    console.log('🔄 Alle Bilddaten wurden hart gelöscht!');
    
    return totalRemoved;
}

// VERCEL-SPEZIFISCHE BEREINIGUNG - Lösche auch Vercel-Cache
function cleanupVercelData() {
    console.log('🚀 VERCEL-BEREINIGUNG - Lösche Vercel-spezifische Daten...');
    
    let totalRemoved = 0;
    
    // Lösche alle Keys, die mit Vercel zu tun haben
    const vercelKeys = [
        'vercel_cache',
        'vercel_images',
        'vercel_data',
        'vercel_storage',
        'vercel_uploads',
        'vercel_files'
    ];
    
    vercelKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ VERCEL GELÖSCHT: ${key}`);
            totalRemoved++;
        }
    });
    
    // Lösche auch alle anderen möglichen Vercel-Referenzen
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
        if (key.includes('vercel') || key.includes('Vercel')) {
            localStorage.removeItem(key);
            console.log(`🗑️ VERCEL GELÖSCHT: ${key}`);
            totalRemoved++;
        }
    });
    
    // Lösche auch alle Bilddaten, die möglicherweise von Vercel gecacht wurden
    allKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data && typeof data === 'string' && (data.includes('vercel') || data.includes('Vercel'))) {
            localStorage.removeItem(key);
            console.log(`🗑️ VERCEL CACHE GELÖSCHT: ${key}`);
            totalRemoved++;
        }
    });
    
    console.log(`🚀 VERCEL-BEREINIGUNG ABGESCHLOSSEN!`);
    console.log(`🗑️ ${totalRemoved} Vercel-Daten gelöscht!`);
    
    return totalRemoved;
}

// WEBSITE-SPEZIFISCHE BEREINIGUNG - Lösche auch die Hauptseiten-Bilder
function cleanupWebsiteImages() {
    console.log('🌐 WEBSITE-SPEZIFISCHE BEREINIGUNG - Lösche Hauptseiten-Bilder...');
    
    let totalRemoved = 0;
    
    // Lösche alle Keys, die mit der Hauptseite zu tun haben
    const websiteKeys = [
        'mwps-website-data',
        'websiteData',
        'homepageImages',
        'mainPageImages',
        'indexImages',
        'activityImages',
        'homeImages',
        'mainImages'
    ];
    
    websiteKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            const data = JSON.parse(localStorage.getItem(key));
            if (data && (data.activityImages || data.images || data.gallery)) {
                delete data.activityImages;
                delete data.images;
                delete data.gallery;
                localStorage.setItem(key, JSON.stringify(data));
                console.log(`🗑️ GELÖSCHT: ${key} Bilddaten`);
                totalRemoved++;
            }
        }
    });
    
    // Lösche auch alle anderen möglichen Website-Bilddaten
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
        if (key.includes('mwps') || key.includes('website') || key.includes('homepage') || key.includes('main')) {
            const data = localStorage.getItem(key);
            if (data && data.includes('image') || data.includes('gallery') || data.includes('photo')) {
                localStorage.removeItem(key);
                console.log(`🗑️ GELÖSCHT: ${key}`);
                totalRemoved++;
            }
        }
    });
    
    console.log(`🌐 WEBSITE-BEREINIGUNG ABGESCHLOSSEN!`);
    console.log(`🗑️ ${totalRemoved} Website-Bilddaten gelöscht!`);
    
    return totalRemoved;
}

// KOMPLETTE BEREINIGUNG - Lösche ALLE Bilder von überall
function completeImageCleanup() {
    console.log('💥 KOMPLETTE BEREINIGUNG - Lösche ALLE Bilder von überall...');
    
    // 1. Aggressive Bereinigung
    const aggressiveRemoved = aggressiveCleanupAllImages();
    
    // 2. Vercel-spezifische Bereinigung
    const vercelRemoved = cleanupVercelData();
    
    // 3. Website-spezifische Bereinigung
    const websiteRemoved = cleanupWebsiteImages();
    
    // 4. Lösche auch alle verbleibenden Bild-Referenzen
    const allKeys = Object.keys(localStorage);
    let finalRemoved = 0;
    
    allKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data && typeof data === 'string' && data.includes('image')) {
            localStorage.removeItem(key);
            console.log(`🗑️ FINAL GELÖSCHT: ${key}`);
            finalRemoved++;
        }
    });
    
    const totalRemoved = aggressiveRemoved + vercelRemoved + websiteRemoved + finalRemoved;
    
    console.log(`💥 KOMPLETTE BEREINIGUNG ABGESCHLOSSEN!`);
    console.log(`🗑️ ${totalRemoved} Einträge komplett gelöscht!`);
    console.log(`🔥 Aggressive: ${aggressiveRemoved}`);
    console.log(`🚀 Vercel: ${vercelRemoved}`);
    console.log(`🌐 Website: ${websiteRemoved}`);
    console.log(`⚡ Final: ${finalRemoved}`);
    
    return totalRemoved;
}

// Funktion zum Hinzufügen von jeweils 1 echten Bild pro Aktivität
function addOneRealImagePerActivity() {
    console.log('🖼️ Füge jeweils 1 echtes Bild pro Aktivität hinzu...');
    
    const activities = {
        wohnmobil: {
            title: 'Wohnmobil Exterieur',
            description: 'Unser hochwertiges Wohnmobil von außen',
            filename: 'wohnmobil-exterior.jpg'
        },
        fotobox: {
            title: 'Fotobox Setup',
            description: 'Professionelle Fotobox für Events',
            filename: 'fotobox-1.jpg'
        },
        sup: {
            title: 'SUP Board',
            description: 'Hochwertiges Stand-Up-Paddle Board',
            filename: 'sup-board.jpg'
        },
        ebike: {
            title: 'E-Bike',
            description: 'Modernes Elektrofahrrad',
            filename: 'ebike-1.jpg'
        }
    };
    
    Object.keys(activities).forEach(activity => {
        const imageData = {
            id: `${activity}_real_image_1`,
            title: activities[activity].title,
            description: activities[activity].description,
            filename: activities[activity].filename,
            uploadDate: new Date().toISOString(),
            size: '1024x768',
            type: 'image/jpeg',
            // Verwende ein einfaches SVG als Platzhalter
            dataUrl: `data:image/svg+xml,${encodeURIComponent(`
                <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="300" fill="#3B82F6"/>
                    <rect x="20" y="20" width="360" height="260" fill="none" stroke="white" stroke-width="2"/>
                    <text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${activities[activity].title}</text>
                    <text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" opacity="0.8">${activities[activity].description}</text>
                </svg>
            `)}`
        };
        
        // Speichere das Bild
        localStorage.setItem(`${activity}_images`, JSON.stringify([imageData]));
        console.log(`✅ ${activity}: 1 echtes Bild hinzugefügt`);
    });
    
    console.log('✅ Alle echten Bilder hinzugefügt!');
}

// HARTE BEREINIGUNG: Lösche ALLES und füge nur 1 Bild pro Aktivität hinzu
function hardCleanupAndAddOneImage() {
    console.log('💥 HARTE BEREINIGUNG - Lösche ALLE Bilder und füge nur 1 pro Aktivität hinzu...');
    
    // 1. KOMPLETTE BEREINIGUNG - Lösche ALLE Bilder von überall
    const removedCount = completeImageCleanup();
    
    // 2. Füge nur 1 Bild pro Aktivität hinzu
    addOneRealImagePerActivity();
    
    console.log(`💥 HARTE BEREINIGUNG ABGESCHLOSSEN!`);
    console.log(`🗑️ ${removedCount} Bilder komplett gelöscht`);
    console.log(`🖼️ Nur noch 4 Bilder vorhanden (1 pro Aktivität)`);
    console.log('🔄 Bitte lade alle Seiten neu, um die Änderungen zu sehen.');
    console.log('⚠️ WARNUNG: Alle anderen Bilder sind unwiderruflich gelöscht!');
    
    return {
        removed: removedCount,
        added: 4
    };
}

// NUCLEAR OPTION: Lösche ALLE localStorage Daten komplett
function nuclearCleanup() {
    console.log('☢️ NUCLEAR OPTION - Lösche ALLE localStorage Daten...');
    
    const allKeys = Object.keys(localStorage);
    console.log(`🗑️ Lösche ${allKeys.length} localStorage Einträge...`);
    
    localStorage.clear();
    
    console.log('☢️ NUCLEAR CLEANUP ABGESCHLOSSEN!');
    console.log('🗑️ ALLE localStorage Daten gelöscht!');
    console.log('🔄 Website wird komplett zurückgesetzt!');
    
    return allKeys.length;
}

// Mache Funktionen global verfügbar
window.aggressiveCleanupAllImages = aggressiveCleanupAllImages;
window.cleanupVercelData = cleanupVercelData;
window.cleanupWebsiteImages = cleanupWebsiteImages;
window.completeImageCleanup = completeImageCleanup;
window.addOneRealImagePerActivity = addOneRealImagePerActivity;
window.hardCleanupAndAddOneImage = hardCleanupAndAddOneImage;
window.nuclearCleanup = nuclearCleanup;

console.log('🔥 AGGRESSIVE Cleanup-Funktionen geladen!');
console.log('Verfügbare Funktionen:');
console.log('- aggressiveCleanupAllImages() - Lösche alle Bilddaten');
console.log('- cleanupVercelData() - Lösche Vercel-spezifische Daten');
console.log('- cleanupWebsiteImages() - Lösche Website-spezifische Bilder');
console.log('- completeImageCleanup() - Komplette Bereinigung');
console.log('- addOneRealImagePerActivity() - Füge 1 Bild pro Aktivität hinzu');
console.log('- hardCleanupAndAddOneImage() - HARTE BEREINIGUNG (empfohlen)');
console.log('- nuclearCleanup() - ☢️ NUCLEAR OPTION (löscht ALLES)');
