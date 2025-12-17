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
     * Lädt Bilder für einen Rental-Typ - API-First
     */
    async function loadRentalImages(rentalType) {
        const config = rentalMapping[rentalType];
        if (!config) {
            console.warn(`⚠️ Kein Mapping für Rental-Typ: ${rentalType}`);
            return;
        }

        try {
            let displayImageUrl = null;
            
            // Versuche zuerst AWS API
            if (window.awsRentalImagesAPI) {
                try {
                    const data = await window.awsRentalImagesAPI.getRentalImages(rentalType);
                    displayImageUrl = data.displayImage || (data.images && data.images.length > 0 ? data.images[0].url : null);
                    console.log(`✅ Bilder von AWS API geladen für ${rentalType}`);
                } catch (apiError) {
                    console.warn(`⚠️ AWS API Fehler für ${rentalType}, verwende Fallback:`, apiError);
                }
            }
            
            // Fallback: LocalStorage (für Migration)
            if (!displayImageUrl) {
                const displayImageKey = `${rentalType}_display_image`;
                displayImageUrl = localStorage.getItem(displayImageKey);
                
                if (!displayImageUrl) {
                    const stored = localStorage.getItem(config.storageKey);
                    if (stored) {
                        const images = JSON.parse(stored);
                        if (images && images.length > 0) {
                            displayImageUrl = images[0].url || images[0].imageData || images[0].s3Url || images[0].src;
                        }
                    }
                }
            }

            if (!displayImageUrl) {
                console.log(`ℹ️ Keine Bilder gefunden für ${rentalType}`);
                return;
            }

            // Finde das img-Element in der Activity-Card
            const imgElement = document.querySelector(config.imageSelector);
            if (!imgElement) {
                console.warn(`⚠️ Kein img-Element gefunden für ${rentalType}`);
                return;
            }

            // Setze das Bild
            imgElement.src = displayImageUrl;
            imgElement.alt = rentalType;
            
            // Entferne onerror-Handler, damit das Bild angezeigt wird
            imgElement.onerror = null;
            
            // Zeige das Bild an (falls es versteckt war)
            imgElement.style.display = '';
            
            console.log(`✅ Bild geladen für ${rentalType}:`, displayImageUrl);
        } catch (error) {
            console.error(`❌ Fehler beim Laden der Bilder für ${rentalType}:`, error);
        }
    }

    /**
     * Lädt alle Rental-Bilder - API-First
     */
    async function loadAllRentalImages() {
        console.log('🖼️ Lade Rental-Bilder von AWS API...');
        
        // Warte auf API-Initialisierung
        if (window.awsRentalImagesAPI) {
            await window.awsRentalImagesAPI.waitForInit();
        }
        
        // Lade alle Bilder parallel
        const promises = Object.keys(rentalMapping).map(rentalType => 
            loadRentalImages(rentalType).catch(err => {
                console.error(`Fehler beim Laden von ${rentalType}:`, err);
            })
        );
        
        await Promise.all(promises);
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

        // Höre auf Custom Events für Updates (API-basiert)
        window.addEventListener('rentalImagesUpdated', async (e) => {
            if (e.detail && e.detail.rentalType) {
                console.log(`🔄 Custom Event erkannt für ${e.detail.rentalType}, aktualisiere Bild von API...`);
                await loadRentalImages(e.detail.rentalType);
            }
        });
        
        // Höre auf Display Image Updates
        window.addEventListener('rentalDisplayImageUpdated', async (e) => {
            if (e.detail && e.detail.rentalType) {
                console.log(`🔄 Display Image Update für ${e.detail.rentalType}, aktualisiere Bild von API...`);
                await loadRentalImages(e.detail.rentalType);
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

