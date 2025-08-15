// Activity Gallery Management
class ActivityGallery {
    constructor() {
        this.init();
    }

    init() {
        // Initialize galleries for all activity pages
        this.initializeGalleries();
        
        // Listen for updates from admin panel
        window.addEventListener('message', (event) => {
            if (event.data.type === 'updateActivityImages') {
                this.updateGalleries(event.data.data);
            }
        });
        
        // Load images on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.loadActivityImages();
        });
    }

    initializeGalleries() {
        // Check if we're on an activity page
        const currentPage = window.location.pathname.split('/').pop();
        const activityMap = {
            'wohnmobil.html': 'wohnmobil',
            'fotobox.html': 'fotobox',
            'sup.html': 'sup',
            'ebike.html': 'ebike'
        };

        if (activityMap[currentPage]) {
            this.currentActivity = activityMap[currentPage];
            this.createGallerySection();
        }
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
            // Verwende den Image Manager für bessere Bildverwaltung
            if (window.imageManager) {
                const allImages = await window.imageManager.loadActivityImages(this.currentActivity);
                
                if (allImages.length > 0) {
                    this.renderGallery(allImages);
                } else {
                    this.showEmptyState();
                }
            } else {
                // Fallback zur ursprünglichen Methode
                const storageKey = `${this.currentActivity}_images`;
                const uploadedImages = JSON.parse(localStorage.getItem(storageKey) || '[]');
                const defaultImages = await this.getDefaultImages();
                const allImages = [...defaultImages, ...uploadedImages];
                
                if (allImages.length > 0) {
                    this.renderGallery(allImages);
                } else {
                    this.showEmptyState();
                }
            }
        } catch (error) {
            console.error('Fehler beim Laden der Aktivitätsbilder:', error);
            this.showEmptyState();
        }
    }

    getDefaultImages() {
        // Get default images from website-content.json structure
        try {
            // Lade zuerst aus der JSON-Datei
            const response = await fetch('/data/website-content.json');
            if (response.ok) {
                const websiteData = await response.json();
                const rentals = websiteData.rentals || [];
                const currentRental = rentals.find(rental => rental.adminKey === this.currentActivity);
                
                if (currentRental && currentRental.images) {
                    return currentRental.images.map(img => ({
                        id: img.id,
                        title: img.title,
                        description: img.description,
                        imageData: img.filename,
                        isDefault: true
                    }));
                }
            }
        } catch (error) {
            console.log('Could not load default images from JSON:', error);
            
            // Fallback: Versuche localStorage
            try {
                const websiteData = JSON.parse(localStorage.getItem('websiteData') || '{}');
                const rentals = websiteData.rentals || [];
                const currentRental = rentals.find(rental => rental.adminKey === this.currentActivity);
                
                if (currentRental && currentRental.images) {
                    return currentRental.images.map(img => ({
                        id: img.id,
                        title: img.title,
                        description: img.description,
                        imageData: img.filename,
                        isDefault: true
                    }));
                }
            } catch (localError) {
                console.log('Could not load default images from localStorage:', localError);
            }
        }
        
        return [];
    }

    renderGallery(images) {
        if (!this.galleryContainer) return;

        if (images.length === 0) {
            this.showEmptyState();
            return;
        }

        const galleryHTML = images.map(image => {
            // Bestimme die Bildquelle
            let imageSrc;
            if (image.isDefault) {
                // Standardbild aus JSON
                imageSrc = image.imageData;
            } else {
                // Hochgeladenes Bild (Base64 oder URL)
                imageSrc = image.imageData;
            }

            return `
                <div class="gallery-item" data-image-id="${image.id}" data-image-type="${image.isDefault ? 'default' : 'uploaded'}">
                    <div class="gallery-image">
                        <img src="${imageSrc}" 
                             alt="${image.title || 'Bild'}" 
                             title="${image.title || 'Bild'}"
                             onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpbGQgbmljaHQgZ2VmdW5kZW48L3RleHQ+PC9zdmc+'"
                             onclick="activityGallery.openLightbox('${image.id}', '${imageSrc}', '${image.title || ''}', '${image.description || ''}')" />
                        <div class="gallery-overlay">
                            <div class="gallery-info">
                                <h4>${image.title || 'Bild'}</h4>
                                ${image.description ? `<p>${image.description}</p>` : ''}
                                <div class="image-meta">
                                    <span class="image-type ${image.isDefault ? 'default' : 'uploaded'}">
                                        ${image.isDefault ? 'Standard' : 'Hochgeladen'}
                                    </span>
                                    ${image.uploadDate ? `<span class="upload-date">${new Date(image.uploadDate).toLocaleDateString('de-DE')}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.galleryContainer.innerHTML = `
            <div class="gallery-grid">
                ${galleryHTML}
            </div>
        `;

        this.createLightbox();
        console.log(`🎨 Galerie gerendert mit ${images.length} Bildern`);
    }

    showEmptyState() {
        if (!this.galleryContainer) return;
        
        this.galleryContainer.innerHTML = `
            <div class="gallery-empty">
                <i class="fas fa-images"></i>
                <h3>Noch keine Bilder verfügbar</h3>
                <p>Bilder werden bald hinzugefügt.</p>
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
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-overlay" onclick="activityGallery.closeLightbox()"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="activityGallery.closeLightbox()">
                    <i class="fas fa-times"></i>
                </button>
                <img id="lightbox-image" src="" alt="" />
                <div class="lightbox-info">
                    <h3 id="lightbox-title"></h3>
                    <p id="lightbox-description"></p>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);
    }

    openLightbox(imageId, imageSrc, title, description) {
        const lightbox = document.getElementById('image-lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDescription = document.getElementById('lightbox-description');

        if (lightbox && lightboxImage) {
            lightboxImage.src = imageSrc;
            lightboxImage.alt = title;
            lightboxTitle.textContent = title;
            lightboxDescription.textContent = description;
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
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
