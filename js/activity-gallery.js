// Activity Gallery Management
class ActivityGallery {
    constructor() {
        this.currentActivity = null;
        this.galleryContainer = null;
        this.currentImagesHash = null;
        this.init();
    }

    init() {
        console.log('🔄 Activity Gallery wird initialisiert...');
        
        // Initialize galleries for all activity pages
        this.initializeGalleries();
        
        // Listen for updates from admin panel
        window.addEventListener('message', (event) => {
            if (event.data.type === 'updateActivityImages') {
                console.log('📨 Update erhalten:', event.data);
                this.updateGalleries(event.data.data);
            }
        });
        
        // Load images on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.loadActivityImages();
        });
        
        // Einfache Synchronisation alle 3 Sekunden
        setInterval(() => {
            this.checkForUpdates();
        }, 3000);
    }

    // Neue Methode für automatische Synchronisation
    setupAutoSync() {
        // This method is no longer needed as synchronization is handled by setInterval
    }

    // Neue Methode: Automatische Diagnose
    runDiagnostics() {
        // This method is no longer needed
    }

    // Prüfe auf Updates
    async checkForUpdates() {
        if (!this.currentActivity) return;
        
        try {
            console.log(`Prüfe auf Updates für ${this.currentActivity}...`);
            
            // Lade aktuelle Bilder aus verschiedenen Speicherorten
            let currentImages = [];
            
            // 1. Versuche Netlify-Speicher
            if (window.netlifyStorage) {
                const netlifyImages = await window.netlifyStorage.loadAllActivityImages(this.currentActivity);
                if (netlifyImages && netlifyImages.length > 0) {
                    currentImages = netlifyImages;
                }
            }
            
            // 2. Fallback: Lokaler Speicher
            if (currentImages.length === 0) {
                const localImages = JSON.parse(localStorage.getItem(`${this.currentActivity}_images`) || '[]');
                if (localImages.length > 0) {
                    currentImages = localImages;
                }
            }
            
            // 3. Fallback: Netlify-Backup
            if (currentImages.length === 0) {
                const netlifyBackupImages = JSON.parse(localStorage.getItem(`${this.currentActivity}_netlify_images`) || '[]');
                if (netlifyBackupImages.length > 0) {
                    currentImages = netlifyBackupImages;
                }
            }
            
            // Vergleiche mit aktuell angezeigten Bildern
            const newHash = this.hashImages(currentImages);
            if (this.currentImagesHash !== newHash) {
                console.log(`Neue Bilder gefunden für ${this.currentActivity}, aktualisiere...`);
                this.currentImagesHash = newHash;
                await this.loadActivityImages();
            }
        } catch (error) {
            console.error('Fehler beim Prüfen auf Updates:', error);
        }
    }

    // Hash für Bilder erstellen
    hashImages(images) {
        return JSON.stringify(images.map(img => ({
            id: img.id,
            filename: img.filename,
            uploadDate: img.uploadDate
        })));
    }

    initializeGalleries() {
        // Check if we're on an activity page or main page
        const currentPage = window.location.pathname.split('/').pop();
        const activityMap = {
            'wohnmobil.html': 'wohnmobil',
            'fotobox.html': 'fotobox',
            'sup.html': 'sup',
            'ebike.html': 'ebike',
            'index.html': 'main', // Hauptseite
            '': 'main' // Root-Verzeichnis
        };

        if (activityMap[currentPage]) {
            if (activityMap[currentPage] === 'main') {
                // Auf der Hauptseite alle Galerien initialisieren
                this.initializeMainPageGalleries();
            } else {
                // Auf einer Aktivitätsseite nur eine Galerie initialisieren
                this.currentActivity = activityMap[currentPage];
                this.createGallerySection();
            }
        }
    }

    // Neue Methode für Hauptseite
    initializeMainPageGalleries() {
        console.log('Initialisiere Galerien für Hauptseite...');
        
        const activities = ['wohnmobil', 'fotobox', 'sup', 'ebike'];
        
        activities.forEach(activity => {
            const galleryContainer = document.getElementById(`${activity}-gallery`);
            if (galleryContainer) {
                console.log(`Galerie-Container gefunden: ${activity}`);
                this.currentActivity = activity;
                this.galleryContainer = galleryContainer;
                this.loadActivityImages();
            } else {
                console.warn(`Galerie-Container nicht gefunden: ${activity}`);
            }
        });
    }

    createGallerySection() {
        // Find existing gallery or create one
        let galleryContainer = document.getElementById(`${this.currentActivity}-gallery`);
        
        if (!galleryContainer) {
            // Create gallery section if it doesn't exist
            const detailsSection = document.querySelector('.details-section');
            if (detailsSection) {
                const gallerySection = document.createElement('section');
                gallerySection.className = 'gallery-section';
                gallerySection.innerHTML = `
                    <div class="container">
                        <div class="section-header">
                            <h2>Bildergalerie</h2>
                            <p>Entdecken Sie unsere ${this.getActivityDisplayName()} in allen Details</p>
                        </div>
                        <div id="${this.currentActivity}-gallery" class="activity-gallery"></div>
                    </div>
                `;
                
                // Insert after details section
                detailsSection.parentNode.insertBefore(gallerySection, detailsSection.nextSibling);
                galleryContainer = document.getElementById(`${this.currentActivity}-gallery`);
            }
        }

        this.galleryContainer = galleryContainer;
    }

    getActivityDisplayName() {
        const displayNames = {
            'wohnmobil': 'Wohnmobil',
            'fotobox': 'Fotobox',
            'sup': 'Stand-Up-Paddles',
            'ebike': 'E-Bikes'
        };
        return displayNames[this.currentActivity] || 'Aktivität';
    }

    async loadActivityImages() {
        if (!this.currentActivity || !this.galleryContainer) return;

        try {
            console.log(`Lade Bilder für Aktivität: ${this.currentActivity} von Netlify...`);
            
            // Lade Bilder nur noch von Netlify
            let allImages = [];
            
            if (window.netlifyStorage) {
                console.log('Lade Bilder von Netlify...');
                allImages = await window.netlifyStorage.loadAllActivityImages(this.currentActivity);
                if (allImages && allImages.length > 0) {
                    console.log(`${allImages.length} Bilder von Netlify geladen`);
                }
            }
            
            if (allImages.length > 0) {
                this.renderGallery(allImages);
                // Speichere aktuelle Bilder für Hash-Vergleich
                this.currentImagesHash = this.hashImages(allImages);
            } else {
                console.log('Keine Bilder von Netlify gefunden');
                this.showEmptyState();
            }
            
        } catch (error) {
            console.error('Fehler beim Laden der Aktivitätsbilder von Netlify:', error);
            this.showEmptyState();
        }
    }

    async getDefaultImages() {
        // Keine Standard-Bilder mehr - nur noch echte hochgeladene Bilder
        return [];
    }

    renderGallery(images) {
        if (!this.galleryContainer) return;

        if (images.length === 0) {
            this.showEmptyState();
            return;
        }

        // Normalisiere alle Bilder auf ein einheitliches Format
        const normalizedImages = images.map((image, index) => {
            // Bestimme die Bildquelle - unterstütze verschiedene Formate
            let imageSrc = '';
            
            if (image.src) {
                // Standard-Bilder mit src-Feld
                imageSrc = image.src;
            } else if (image.imageData) {
                // Hochgeladene Bilder (Base64 oder URL) - das ist der wichtige Teil!
                imageSrc = image.imageData;
            } else if (image.filename) {
                // Bilder mit Dateinamen
                imageSrc = `./images/${this.currentActivity}/${image.filename}`;
            }
            
            // Füge Fallback für relative Pfade hinzu
            if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http')) {
                if (!imageSrc.startsWith('./')) {
                    imageSrc = `./${imageSrc}`;
                }
            }
            
            // Erstelle einheitliches Bild-Objekt
            return {
                id: image.id || `image-${index}`,
                src: imageSrc,
                alt: image.alt || image.title || image.filename || 'Bild',
                title: image.title || image.filename || `Bild ${index + 1}`,
                description: image.description || '',
                isDefault: image.isDefault || false,
                uploadDate: image.uploadDate || null,
                originalImage: image, // Behalte Original für Debugging
                isUploaded: image.isUploaded || false,
                filename: image.filename || null
            };
        });

        // Erstelle Hauptbild-Sektion (erstes Bild)
        const mainImage = normalizedImages[0];
        const mainImageSrc = mainImage.src;

        const mainImageHTML = `
            <div class="main-image-section">
                <div class="section-header">
                    <h3>Hauptbild</h3>
                    <p>${mainImage.title || 'Hauptbild der Aktivität'}</p>
                </div>
                <div class="main-image-container">
                    <img src="${mainImageSrc}" 
                         alt="${mainImage.alt}" 
                         title="${mainImage.title}"
                         onclick="activityGallery.openLightbox('${mainImage.id}', '${mainImageSrc}', '${mainImage.title}', '${mainImage.description}')"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpbGQgbmljaHQgZ2VmdW5kZW48L3RleHQ+PC9zdmc+'">
                    <div class="main-image-overlay">
                        <div class="main-image-info">
                            <h4>${mainImage.title}</h4>
                            ${mainImage.description ? `<p>${mainImage.description}</p>` : ''}
                            <button class="main-image-view-btn" onclick="activityGallery.openLightbox('${mainImage.id}', '${mainImageSrc}', '${mainImage.title}', '${mainImage.description}')">
                                <i class="fas fa-expand"></i> Vergrößern
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Erstelle Galerie-Grid mit den restlichen Bildern (maximal 4 nebeneinander)
        const remainingImages = normalizedImages.slice(1);
        const galleryHTML = remainingImages.map(image => {
            return `
                <div class="gallery-item" data-image-id="${image.id}" data-image-type="${image.isDefault ? 'default' : 'uploaded'}">
                    <div class="gallery-image">
                        <img src="${image.src}" 
                             alt="${image.alt}" 
                             title="${image.title}"
                             onclick="activityGallery.openLightbox('${image.id}', '${image.src}', '${image.title}', '${image.description}')"
                             onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpbGQgbmljaHQgZ2VmdW5kZW48L3RleHQ+PC9zdmc+'">
                        <div class="gallery-overlay">
                            <div class="gallery-info">
                                <h4>${image.title}</h4>
                                ${image.description ? `<p>${image.description}</p>` : ''}
                                <div class="image-meta">
                                    <span class="image-type ${image.isDefault ? 'default' : 'uploaded'}">
                                        ${image.isDefault ? 'Standard' : 'Hochgeladen'}
                                    </span>
                                    ${image.uploadDate ? `<span class="upload-date">${new Date(image.uploadDate).toLocaleDateString('de-DE')}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <button class="gallery-view-btn" onclick="activityGallery.openLightbox('${image.id}', '${image.src}', '${image.title}', '${image.description}')">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Kombiniere Hauptbild und Galerie
        this.galleryContainer.innerHTML = `
            ${mainImageHTML}
            ${remainingImages.length > 0 ? `
                <div class="gallery-section-secondary">
                    <div class="section-header">
                        <h3>Weitere Bilder</h3>
                        <p>${remainingImages.length} weitere Bilder verfügbar</p>
                    </div>
                    <div class="gallery-grid">
                        ${galleryHTML}
                    </div>
                </div>
            ` : ''}
        `;

        this.createLightbox();
        console.log(`Galerie gerendert mit ${images.length} Bildern (1 Hauptbild + ${remainingImages.length} weitere)`);
    }

    showEmptyState() {
        if (!this.galleryContainer) return;
        
        this.galleryContainer.innerHTML = `
            <div class="gallery-empty">
                <i class="fas fa-images"></i>
                <h3>Noch keine Bilder verfügbar</h3>
                <p>Fügen Sie über das Admin-Panel Bilder hinzu, um Ihre ${this.getActivityDisplayName()} zu präsentieren.</p>
                <div class="gallery-empty-actions">
                    <a href="admin.html" class="btn btn-primary" target="_blank">
                        <i class="fas fa-upload"></i> Bilder hochladen
                    </a>
                </div>
            </div>
        `;
    }

    createLightbox() {
        // Remove existing lightbox if any
        const existingLightbox = document.getElementById('image-lightbox');
        if (existingLightbox) {
            existingLightbox.remove();
        }

        // Create lightbox
        const lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'image-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-overlay" onclick="activityGallery.closeLightbox()"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="activityGallery.closeLightbox()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="lightbox-image-container">
                    <img class="lightbox-image" src="" alt="">
                </div>
                <div class="lightbox-info">
                    <h3 class="lightbox-title"></h3>
                    <p class="lightbox-description"></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        
        // Event-Listener für Tastatur
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox();
            }
        });
    }

    openLightbox(imageId, imageSrc, title, description) {
        const lightbox = document.getElementById('image-lightbox');
        const lightboxImage = lightbox.querySelector('.lightbox-image');
        const lightboxTitle = lightbox.querySelector('.lightbox-title');
        const lightboxDescription = lightbox.querySelector('.lightbox-description');
        
        // Setze Bild und Informationen
        if (lightboxImage) lightboxImage.src = imageSrc;
        if (lightboxTitle) lightboxTitle.textContent = title || 'Bild';
        if (lightboxDescription) lightboxDescription.textContent = description || '';
        
        // Zeige Lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const lightbox = document.getElementById('image-lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateGalleries(activityImages) {
        // Update gallery when admin uploads new images
        if (activityImages && activityImages[this.currentActivity]) {
            this.loadActivityImages();
        }
    }
}

// Initialize gallery system
const activityGallery = new ActivityGallery();

// Keyboard support for lightbox
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        activityGallery.closeLightbox();
    }
});
