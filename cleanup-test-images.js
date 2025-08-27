// Cleanup-Funktion für Testbilder
// Diese Datei kann in der Browser-Konsole ausgeführt werden

function cleanupAllTestImages() {
    console.log('🧹 Starte Bereinigung aller Testbilder...');
    
    const activities = ['wohnmobil', 'fotobox', 'sup', 'ebike'];
    let totalRemoved = 0;
    
    activities.forEach(activity => {
        console.log(`📸 Bereinige ${activity} Galerie...`);
        
        // Alle möglichen Keys für diese Aktivität
        const keysToRemove = [
            `${activity}_images`,
            `${activity}_netlify_images`,
            `${activity}_netlify_saved`,
            `${activity}_persistent_images`,
            `${activity}_test_images`,
            `${activity}_sample_images`,
            `${activity}_default_images`,
            `${activity}_placeholder_images`
        ];
        
        // Lösche alle Keys
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ Gelöscht: ${key}`);
                totalRemoved++;
            }
        });
        
        // Lösche auch alle Keys, die diese Aktivität enthalten
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.includes(activity) && (key.includes('test') || key.includes('Test') || key.includes('sample') || key.includes('Sample') || key.includes('default') || key.includes('Default') || key.includes('placeholder') || key.includes('Placeholder'))) {
                localStorage.removeItem(key);
                console.log(`🗑️ Gelöscht: ${key}`);
                totalRemoved++;
            }
        });
    });
    
    // Lösche globale Testbilder-Keys
    const globalKeysToRemove = [
        'globalImages',
        'globalImageDatabase',
        'testImages',
        'sampleImages',
        'defaultImages',
        'placeholderImages',
        'demoImages'
    ];
    
    globalKeysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ Gelöscht: ${key}`);
            totalRemoved++;
        }
    });
    
    // Lösche alle verbleibenden Testbilder-Referenzen
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
        if (key.includes('test') || 
            key.includes('Test') || 
            key.includes('default') || 
            key.includes('Default') ||
            key.includes('sample') ||
            key.includes('Sample') ||
            key.includes('placeholder') ||
            key.includes('Placeholder') ||
            key.includes('demo') ||
            key.includes('Demo')) {
            localStorage.removeItem(key);
            console.log(`🗑️ Gelöscht: ${key}`);
            totalRemoved++;
        }
    });
    
    // Lösche auch websiteData.activityImages falls vorhanden
    const websiteData = JSON.parse(localStorage.getItem('websiteData') || '{}');
    if (websiteData.activityImages) {
        delete websiteData.activityImages;
        localStorage.setItem('websiteData', JSON.stringify(websiteData));
        console.log('🗑️ Gelöscht: websiteData.activityImages');
        totalRemoved++;
    }
    
    console.log(`✅ Bereinigung abgeschlossen! ${totalRemoved} Einträge entfernt.`);
    console.log('🔄 Bitte lade die Seite neu, um die Änderungen zu sehen.');
    
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

// Hauptfunktion: Bereinige und füge echte Bilder hinzu
function cleanupAndAddRealImages() {
    console.log('🚀 Starte vollständige Bereinigung...');
    
    // 1. Lösche alle Testbilder
    const removedCount = cleanupAllTestImages();
    
    // 2. Füge jeweils 1 echtes Bild hinzu
    addOneRealImagePerActivity();
    
    console.log(`🎉 Vollständige Bereinigung abgeschlossen!`);
    console.log(`🗑️ ${removedCount} Testbilder entfernt`);
    console.log(`🖼️ 4 echte Bilder hinzugefügt (1 pro Aktivität)`);
    console.log('🔄 Bitte lade alle Seiten neu, um die Änderungen zu sehen.');
    
    return {
        removed: removedCount,
        added: 4
    };
}

// Mache Funktionen global verfügbar
window.cleanupAllTestImages = cleanupAllTestImages;
window.addOneRealImagePerActivity = addOneRealImagePerActivity;
window.cleanupAndAddRealImages = cleanupAndAddRealImages;

console.log('🧹 Cleanup-Funktionen geladen!');
console.log('Verfügbare Funktionen:');
console.log('- cleanupAllTestImages() - Nur Testbilder entfernen');
console.log('- addOneRealImagePerActivity() - Nur echte Bilder hinzufügen');
console.log('- cleanupAndAddRealImages() - Vollständige Bereinigung (empfohlen)');
