// Verbessertes Bildverwaltungssystem
class ImageManager {
    constructor() {
        this.imageCache = new Map();
        this.fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpbGQgbmljaHQgZ2VmdW5kZW48L3RleHQ+PC9zdmc+';
        this.init();
    }

    init() {
        this.setupImageErrorHandling();
        this.preloadCriticalImages();
    }

    // Behandelt Bildfehler und zeigt Fallback-Bilder an
    setupImageErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    }

    handleImageError(imgElement) {
        if (imgElement.dataset.fallbackHandled) return;
        
        imgElement.dataset.fallbackHandled = 'true';
        imgElement.src = this.fallbackImage;
        imgElement.alt = 'Bild nicht verfügbar';
        
        console.log('⚠️ Bildfehler behandelt für:', imgElement.src);
    }

    // Lädt kritische Bilder vor
    async preloadCriticalImages() {
        const criticalImages = [
            'manuel-weiss-photo.svg',
            'images/wohnmobil/wohnmobil-exterior.jpg',
            'images/fotobox/fotobox-1.jpg'
        ];

        for (const imagePath of criticalImages) {
            try {
                await this.preloadImage(imagePath);
            } catch (error) {
                console.log('Kritisches Bild konnte nicht vorgeladen werden:', imagePath);
            }
        }
    }

    // Lädt ein Bild vor
    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache.set(src, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Bild konnte nicht geladen werden: ${src}`));
            img.src = src;
        });
    }

    // Lädt ein Bild mit Fallback-Logik
    async loadImage(src, fallbackSrc = null) {
        try {
            // Prüfe Cache
            if (this.imageCache.has(src)) {
                return this.imageCache.get(src);
            }

            // Versuche das Bild zu laden
            const img = await this.preloadImage(src);
            return img;
        } catch (error) {
            console.log('Bild konnte nicht geladen werden:', src);
            
            // Versuche Fallback
            if (fallbackSrc && fallbackSrc !== src) {
                try {
                    return await this.loadImage(fallbackSrc);
                } catch (fallbackError) {
                    console.log('Auch Fallback-Bild konnte nicht geladen werden:', fallbackSrc);
                }
            }
            
            // Verwende Standard-Fallback
            return null;
        }
    }

    // Erstellt ein Bild-Element mit Fehlerbehandlung
    createImageElement(src, alt = '', className = '', fallbackSrc = null) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        if (className) img.className = className;
        
        // Fehlerbehandlung
        img.onerror = () => {
            if (fallbackSrc && fallbackSrc !== src) {
                img.src = fallbackSrc;
            } else {
                img.src = this.fallbackImage;
                img.alt = 'Bild nicht verfügbar';
            }
        };
        
        return img;
    }

    // Lädt alle Bilder für eine Aktivität
    async loadActivityImages(activityName) {
        try {
            // Lade zuerst hochgeladene Bilder aus localStorage (schneller)
            const storageKey = `${activityName}_images`;
            const uploadedImages = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Lade dann Standardbilder aus der JSON-Datei
            let defaultImages = [];
            try {
                const response = await fetch('/data/website-content.json');
                if (response.ok) {
                    const data = await response.json();
                    const rental = data.rentals?.find(r => r.adminKey === activityName);
                    
                    if (rental?.images) {
                        defaultImages = rental.images.map(img => ({
                            ...img,
                            isDefault: true,
                            imageData: img.filename,
                            activity: activityName
                        }));
                    }
                }
            } catch (jsonError) {
                console.log('Standardbilder konnten nicht geladen werden, verwende nur hochgeladene Bilder');
            }
            
            // Kombiniere beide Bildquellen (hochgeladene zuerst)
            const allImages = [...uploadedImages, ...defaultImages];
            
            console.log(`📸 ${allImages.length} Bilder geladen für ${activityName}: ${uploadedImages.length} hochgeladen, ${defaultImages.length} Standard`);
            
            return allImages;
        } catch (error) {
            console.error('Fehler beim Laden der Aktivitätsbilder:', error);
            return [];
        }
    }

    // Lädt alle Bilder aus der globalen Datenbank
    loadAllImages() {
        try {
            const globalImages = JSON.parse(localStorage.getItem('globalImages') || '[]');
            return globalImages;
        } catch (error) {
            console.error('Fehler beim Laden der globalen Bilder:', error);
            return [];
        }
    }

    // Sucht nach Bildern in allen Aktivitäten
    searchImages(query) {
        try {
            const globalImages = this.loadAllImages();
            const searchTerm = query.toLowerCase();
            
            return globalImages.filter(img => 
                img.title.toLowerCase().includes(searchTerm) ||
                img.description.toLowerCase().includes(searchTerm) ||
                img.activity.toLowerCase().includes(searchTerm)
            );
        } catch (error) {
            console.error('Fehler bei der Bildsuche:', error);
            return [];
        }
    }

    // Validiert ein Bild
    validateImage(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Nur Bilddateien sind erlaubt (JPEG, PNG, GIF, WebP)' };
        }
        
        if (file.size > maxSize) {
            return { valid: false, error: 'Datei ist zu groß (max. 10MB)' };
        }
        
        return { valid: true };
    }

    // Komprimiert ein Bild
    async compressImage(file, maxWidth = 1920, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Berechne neue Dimensionen
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Zeichne komprimiertes Bild
                ctx.drawImage(img, 0, 0, width, height);
                
                // Konvertiere zu Blob
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
}

// Globale Instanz erstellen
window.imageManager = new ImageManager();
