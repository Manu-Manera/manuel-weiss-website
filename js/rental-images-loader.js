/**
 * Rental Images Loader
 * Lädt hochgeladene Rental-Bilder aus LocalStorage und zeigt sie auf der Website an
 */

(function() {
    'use strict';

    // Mapping von Rental-Typen zu Activity-Card-Selektoren
    const rentalMapping = {
        'wohnmobil': {
            cardSelector: 'a[href="wohnmobil.html"]',
            imageSelector: 'a[href="wohnmobil.html"] .activity-image img',
            storageKey: 'wohnmobil_images'
        },
        'fotobox': {
            cardSelector: 'a[href="fotobox.html"]',
            imageSelector: 'a[href="fotobox.html"] .activity-image img',
            storageKey: 'fotobox_images'
        },
        'ebike': {
            cardSelector: 'a[href="ebike.html"]',
            imageSelector: 'a[href="ebike.html"] .activity-image img',
            storageKey: 'ebike_images'
        },
        'sup': {
            cardSelector: 'a[href="sup.html"]',
            imageSelector: 'a[href="sup.html"] .activity-image img',
            storageKey: 'sup_images'
        }
    };

    /**
     * Lädt Bilder für einen Rental-Typ
     */
    function loadRentalImages(rentalType) {
        const config = rentalMapping[rentalType];
        if (!config) {
            console.warn(`⚠️ Kein Mapping für Rental-Typ: ${rentalType}`);
            return;
        }

        try {
            // Lade Bilder aus LocalStorage
            const stored = localStorage.getItem(config.storageKey);
            if (!stored) {
                console.log(`ℹ️ Keine Bilder gefunden für ${rentalType}`);
                return;
            }

            const images = JSON.parse(stored);
            if (!images || images.length === 0) {
                console.log(`ℹ️ Keine Bilder im Array für ${rentalType}`);
                return;
            }

            // Finde das erste Bild (Hauptbild)
            const firstImage = images[0];
            const imageUrl = firstImage.url || firstImage.imageData || firstImage.src;

            if (!imageUrl) {
                console.warn(`⚠️ Keine gültige Bild-URL für ${rentalType}`);
                return;
            }

            // Finde das img-Element in der Activity-Card
            const imgElement = document.querySelector(config.imageSelector);
            if (!imgElement) {
                console.warn(`⚠️ Kein img-Element gefunden für ${rentalType}`);
                return;
            }

            // Setze das Bild
            imgElement.src = imageUrl;
            imgElement.alt = firstImage.filename || firstImage.alt || rentalType;
            
            // Entferne onerror-Handler, damit das Bild angezeigt wird
            imgElement.onerror = null;
            
            // Zeige das Bild an (falls es versteckt war)
            imgElement.style.display = '';
            
            console.log(`✅ Bild geladen für ${rentalType}:`, imageUrl);
        } catch (error) {
            console.error(`❌ Fehler beim Laden der Bilder für ${rentalType}:`, error);
        }
    }

    /**
     * Lädt alle Rental-Bilder
     */
    function loadAllRentalImages() {
        console.log('🖼️ Lade Rental-Bilder...');
        
        Object.keys(rentalMapping).forEach(rentalType => {
            loadRentalImages(rentalType);
        });
    }

    /**
     * Migriert Bilder vom alten Format (rentalImages_*) zum neuen Format (*_images)
     */
    function migrateOldImages() {
        const rentalTypes = ['wohnmobil', 'fotobox', 'ebike', 'sup'];
        
        rentalTypes.forEach(type => {
            const oldKey = `rentalImages_${type}`;
            const newKey = `${type}_images`;
            
            try {
                const oldData = localStorage.getItem(oldKey);
                if (oldData) {
                    const images = JSON.parse(oldData);
                    if (images && images.length > 0) {
                        // Konvertiere Format für Website
                        const formattedImages = images.map(img => ({
                            url: img.url || img.imageData,
                            imageData: img.url || img.imageData,
                            filename: img.filename || 'uploaded-image.jpg',
                            uploadedAt: img.uploadedAt || new Date().toISOString(),
                            isUploaded: true
                        }));
                        
                        // Speichere im neuen Format
                        localStorage.setItem(newKey, JSON.stringify(formattedImages));
                        console.log(`✅ Migriert ${formattedImages.length} Bilder von ${oldKey} zu ${newKey}`);
                    }
                }
            } catch (error) {
                console.error(`❌ Fehler beim Migrieren von ${oldKey}:`, error);
            }
        });
    }

    /**
     * Initialisierung
     */
    function init() {
        // Migriere alte Bilder zuerst
        migrateOldImages();
        
        // Warte bis DOM bereit ist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAllRentalImages);
        } else {
            // DOM ist bereits bereit
            loadAllRentalImages();
        }

        // Höre auf Storage-Events, um Bilder automatisch zu aktualisieren
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.endsWith('_images')) {
                const rentalType = e.key.replace('_images', '');
                if (rentalMapping[rentalType]) {
                    console.log(`🔄 Storage-Event erkannt für ${rentalType}, aktualisiere Bild...`);
                    loadRentalImages(rentalType);
                }
            }
        });

        // Auch auf Custom Events hören (für Updates innerhalb desselben Tabs)
        window.addEventListener('rentalImagesUpdated', (e) => {
            if (e.detail && e.detail.rentalType) {
                console.log(`🔄 Custom Event erkannt für ${e.detail.rentalType}, aktualisiere Bild...`);
                loadRentalImages(e.detail.rentalType);
            }
        });
    }

    // Initialisierung starten
    init();

    // Globale Funktion für manuelle Aktualisierung
    window.loadRentalImages = loadRentalImages;
    window.loadAllRentalImages = loadAllRentalImages;

    console.log('✅ Rental Images Loader initialisiert');
})();

