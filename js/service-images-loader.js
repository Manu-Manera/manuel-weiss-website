/**
 * Service Images Loader
 * Lädt hochgeladene Service-Bilder aus LocalStorage und zeigt sie auf der Website an
 */

(function() {
    'use strict';

    /**
     * Lädt Service-Bilder und zeigt sie auf der Website an
     */
    function loadServiceImages() {
        console.log('🖼️ Lade Service-Bilder...');

        try {
            // Lade Services aus localStorage
            const storedServices = localStorage.getItem('website_services');
            if (!storedServices) {
                console.log('ℹ️ Keine Services gefunden');
                return;
            }

            const services = JSON.parse(storedServices);
            if (!services || services.length === 0) {
                console.log('ℹ️ Keine Services im Array');
                return;
            }

            // Lade auch aus globalem Service-Images-Array
            const serviceImages = JSON.parse(localStorage.getItem('website_service_images') || '[]');
            console.log(`📸 ${serviceImages.length} Service-Bilder gefunden`);

            // Finde alle Service-Cards auf der Website
            const serviceCards = document.querySelectorAll('.service-card');
            console.log(`📋 ${serviceCards.length} Service-Cards gefunden`);

            serviceCards.forEach((card, index) => {
                // Versuche Service-Name aus der Card zu extrahieren
                const cardTitle = card.querySelector('h3');
                if (!cardTitle) return;

                const cardTitleText = cardTitle.textContent.trim();
                
                // Normalisiere Service-Namen für besseres Matching
                const normalizeName = (name) => {
                    return name.toLowerCase()
                        .replace(/&/g, 'und')
                        .replace(/[^a-z0-9]/g, '')
                        .trim();
                };

                const normalizedCardTitle = normalizeName(cardTitleText);
                
                // Finde passenden Service (verschiedene Matching-Strategien)
                let matchingService = services.find(s => {
                    const normalizedServiceName = normalizeName(s.name);
                    return normalizedServiceName === normalizedCardTitle ||
                           cardTitleText.toLowerCase().includes(s.name.toLowerCase()) ||
                           s.name.toLowerCase().includes(cardTitleText.toLowerCase());
                });

                // Fallback: Versuche über Index (falls Services in gleicher Reihenfolge)
                if (!matchingService && index < services.length) {
                    matchingService = services[index];
                }

                if (matchingService && matchingService.image) {
                    // Finde oder erstelle Bild-Container
                    let imageContainer = card.querySelector('.service-image-container');
                    if (!imageContainer) {
                        // Erstelle Bild-Container nach dem Icon
                        const serviceIcon = card.querySelector('.service-icon');
                        if (serviceIcon && serviceIcon.parentElement) {
                            imageContainer = document.createElement('div');
                            imageContainer.className = 'service-image-container';
                            imageContainer.style.cssText = 'width: 100%; height: 200px; margin: 1rem 0; border-radius: 12px; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                            
                            const img = document.createElement('img');
                            img.className = 'service-image dynamic-service-image';
                            img.src = matchingService.image;
                            img.alt = matchingService.name;
                            img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 12px; transition: transform 0.3s ease;';
                            
                            // Hover-Effekt
                            imageContainer.addEventListener('mouseenter', () => {
                                img.style.transform = 'scale(1.05)';
                            });
                            imageContainer.addEventListener('mouseleave', () => {
                                img.style.transform = 'scale(1)';
                            });
                            
                            img.onerror = function() {
                                console.warn(`⚠️ Fehler beim Laden des Service-Bildes für ${matchingService.name}`);
                                this.style.display = 'none';
                                imageContainer.style.display = 'none';
                            };
                            
                            img.onload = function() {
                                console.log(`✅ Service-Bild erfolgreich geladen für: ${matchingService.name}`);
                            };
                            
                            imageContainer.appendChild(img);
                            
                            // Füge nach dem Icon ein (vor dem Titel)
                            serviceIcon.parentElement.insertBefore(imageContainer, cardTitle);
                            
                            console.log(`✅ Service-Bild angezeigt für: ${matchingService.name}`);
                        }
                    } else {
                        // Aktualisiere vorhandenes Bild
                        const img = imageContainer.querySelector('img');
                        if (img) {
                            img.src = matchingService.image;
                            img.alt = matchingService.name;
                            console.log(`✅ Service-Bild aktualisiert für: ${matchingService.name}`);
                        }
                    }
                }
            });

            console.log('✅ Service-Bilder geladen');
        } catch (error) {
            console.error('❌ Fehler beim Laden der Service-Bilder:', error);
        }
    }

    /**
     * Initialisierung
     */
    function init() {
        // Warte bis DOM geladen ist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadServiceImages);
        } else {
            // DOM ist bereits geladen
            loadServiceImages();
        }

        // Lade auch nach kurzer Verzögerung (falls dynamisch geladen)
        setTimeout(loadServiceImages, 1000);
    }

    // Starte Initialisierung
    init();

    // Export für manuelles Laden
    window.loadServiceImages = loadServiceImages;
})();

