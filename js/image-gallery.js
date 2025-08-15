// Image Gallery Component für Manuel Weiss Professional Services
class ImageGallery {
    constructor(containerId, images) {
        this.container = document.getElementById(containerId);
        this.images = images || [];
        this.currentIndex = 0;
        this.lightboxOpen = false;
        
        this.init();
    }

    init() {
        if (!this.container || !this.images.length) return;
        
        this.createGalleryHTML();
        this.bindEvents();
    }

    createGalleryHTML() {
        // Gallery Grid
        const galleryGrid = document.createElement('div');
        galleryGrid.className = 'image-gallery-grid';
        
        this.images.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'gallery-item';
            imageItem.dataset.index = index;
            
            // Verwende Placeholder für Demo, da echte Bilder im Admin hochgeladen werden
            let imageSrc = image.dataUrl || image.src || this.createImagePlaceholder(image);
            
            // Füge Fallback für relative Pfade hinzu
            if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http')) {
                if (!imageSrc.startsWith('./')) {
                    imageSrc = `./${imageSrc}`;
                }
            }
            
            imageItem.innerHTML = `
                <div class="gallery-image">
                    <img src="${imageSrc}" alt="${image.alt}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpbGQgbmljaHQgZ2VmdW5kZW48L3RleHQ+PC9zdmc+'">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h4>${image.title}</h4>
                            <p>${image.description}</p>
                        </div>
                        <button class="gallery-view-btn" data-index="${index}">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            `;
            
            galleryGrid.appendChild(imageItem);
        });
        
        this.container.appendChild(galleryGrid);
        
        // Create Lightbox
        this.createLightbox();
    }

    createImagePlaceholder(image) {
        // Erstelle SVG Placeholder für Demo-Zwecke
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="300" fill="${color}"/>
                <rect x="20" y="20" width="360" height="260" fill="none" stroke="white" stroke-width="2" stroke-dasharray="10,5"/>
                <circle cx="200" cy="120" r="30" fill="white" opacity="0.7"/>
                <path d="M185 110 L215 110 L205 95 Z" fill="white" opacity="0.5"/>
                <text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${image.title}</text>
                <text x="200" y="220" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.8">${image.filename}</text>
            </svg>
        `)}`;
    }

    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'image-lightbox';
        lightbox.id = 'image-lightbox';
        
        lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-nav lightbox-prev">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="lightbox-nav lightbox-next">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="lightbox-image-container">
                    <img class="lightbox-image" src="" alt="">
                </div>
                <div class="lightbox-info">
                    <h3 class="lightbox-title"></h3>
                    <p class="lightbox-description"></p>
                    <div class="lightbox-counter">
                        <span class="current-image">1</span> / <span class="total-images">${this.images.length}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
    }

    bindEvents() {
        // Gallery item clicks
        this.container.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.gallery-view-btn');
            if (viewBtn) {
                const index = parseInt(viewBtn.dataset.index);
                this.openLightbox(index);
            }
        });

        // Lightbox events
        const lightbox = document.getElementById('image-lightbox');
        
        // Close lightbox
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => this.closeLightbox());
        
        // Navigation
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prevImage());
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.nextImage());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightboxOpen) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
            }
        });
    }

    openLightbox(index) {
        this.currentIndex = index;
        this.lightboxOpen = true;
        
        const lightbox = document.getElementById('image-lightbox');
        const image = this.images[index];
        
        // Update lightbox content
        const imageSrc = image.dataUrl || this.createImagePlaceholder(image);
        lightbox.querySelector('.lightbox-image').src = imageSrc;
        lightbox.querySelector('.lightbox-image').alt = image.alt;
        lightbox.querySelector('.lightbox-title').textContent = image.title;
        lightbox.querySelector('.lightbox-description').textContent = image.description;
        lightbox.querySelector('.current-image').textContent = index + 1;
        
        // Show lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightboxOpen = false;
        
        const lightbox = document.getElementById('image-lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateLightboxImage();
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateLightboxImage();
    }

    updateLightboxImage() {
        const lightbox = document.getElementById('image-lightbox');
        const image = this.images[this.currentIndex];
        
        const imageSrc = image.dataUrl || this.createImagePlaceholder(image);
        lightbox.querySelector('.lightbox-image').src = imageSrc;
        lightbox.querySelector('.lightbox-image').alt = image.alt;
        lightbox.querySelector('.lightbox-title').textContent = image.title;
        lightbox.querySelector('.lightbox-description').textContent = image.description;
        lightbox.querySelector('.current-image').textContent = this.currentIndex + 1;
    }

    // Method to add new images (for admin use)
    addImage(image) {
        this.images.push(image);
        this.refresh();
    }

    // Method to remove image (for admin use)
    removeImage(index) {
        this.images.splice(index, 1);
        this.refresh();
    }

    // Method to update image (for admin use)
    updateImage(index, newImage) {
        this.images[index] = { ...this.images[index], ...newImage };
        this.refresh();
    }

    // Refresh gallery display
    refresh() {
        this.container.innerHTML = '';
        const lightbox = document.getElementById('image-lightbox');
        if (lightbox) lightbox.remove();
        
        this.init();
    }

    // Load images from localStorage (for persistence)
    static loadFromStorage(key) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Fehler beim Laden der Bilder:', error);
            return [];
        }
    }

    // Save images to localStorage (for persistence)
    saveToStorage(key) {
        try {
            localStorage.setItem(key, JSON.stringify(this.images));
            console.log('✅ Bilder gespeichert:', key);
        } catch (error) {
            console.error('❌ Fehler beim Speichern der Bilder:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageGallery;
}
