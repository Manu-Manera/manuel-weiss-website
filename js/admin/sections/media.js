/**
 * Media Section Module
 * Medienverwaltung für das Admin Panel
 */
class MediaSection {
    constructor() {
        this.stateManager = null;
        this.initialized = false;
        this.mediaItems = [];
        this.currentCategory = 'profile';
        this.viewMode = 'grid';
        this.selectedItems = new Set();
    }
    
    /**
     * Section initialisieren
     */
    init() {
        if (this.initialized) return;
        
        // Dependencies prüfen
        if (window.AdminApp && window.AdminApp.stateManager) {
            this.stateManager = window.AdminApp.stateManager;
        }
        
        // Media Items laden
        this.loadMediaItems();
        
        // Event Listeners hinzufügen
        this.attachEventListeners();
        
        // Upload Area einrichten
        this.setupUploadArea();
        
        this.initialized = true;
        console.log('Media Section initialized');
    }
    
    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Category Tabs
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchCategory(e.currentTarget.dataset.category);
            });
        });
        
        // Search
        const searchInput = document.getElementById('media-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterMedia(e.target.value);
            });
        }
        
        // Filter
        const filterSelect = document.getElementById('media-filter-type');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterByType(e.target.value);
            });
        }
        
        // Bulk Actions
        const bulkBtn = document.getElementById('bulk-actions-btn');
        if (bulkBtn) {
            bulkBtn.addEventListener('click', () => {
                this.showBulkActions();
            });
        }
        
        // AI Search Toggle
        const aiSearchBtn = document.getElementById('ai-search-toggle');
        if (aiSearchBtn) {
            aiSearchBtn.addEventListener('click', () => {
                this.toggleAISearch();
            });
        }
    }
    
    /**
     * Upload Area einrichten
     */
    setupUploadArea() {
        const dragDropArea = document.getElementById('dragDropArea');
        const fileInput = document.getElementById('fileInput');
        
        if (dragDropArea) {
            // Drag & Drop Events
            dragDropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                dragDropArea.style.borderColor = '#10b981';
                dragDropArea.style.backgroundColor = '#f0fdf4';
            });
            
            dragDropArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dragDropArea.style.borderColor = '#cbd5e1';
                dragDropArea.style.backgroundColor = '#f8fafc';
            });
            
            dragDropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dragDropArea.style.borderColor = '#cbd5e1';
                dragDropArea.style.backgroundColor = '#f8fafc';
                
                const files = Array.from(e.dataTransfer.files);
                this.handleFileUpload(files);
            });
            
            dragDropArea.addEventListener('click', () => {
                fileInput.click();
            });
        }
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFileUpload(files);
            });
        }
    }
    
    /**
     * Media Items laden
     */
    async loadMediaItems() {
        try {
            // Mock data - in real implementation, load from API
            this.mediaItems = [
                {
                    id: 1,
                    name: 'profilbild.jpg',
                    type: 'image',
                    category: 'profile',
                    size: '2.3 MB',
                    date: '2024-01-15',
                    url: '/images/profilbild.jpg',
                    thumbnail: '/images/thumbnails/profilbild.jpg'
                },
                {
                    id: 2,
                    name: 'lebenslauf.pdf',
                    type: 'document',
                    category: 'application',
                    size: '1.2 MB',
                    date: '2024-01-14',
                    url: '/documents/lebenslauf.pdf',
                    thumbnail: '/images/thumbnails/pdf-icon.png'
                },
                {
                    id: 3,
                    name: 'portfolio-projekt1.jpg',
                    type: 'image',
                    category: 'portfolio',
                    size: '4.1 MB',
                    date: '2024-01-13',
                    url: '/images/portfolio-projekt1.jpg',
                    thumbnail: '/images/thumbnails/portfolio-projekt1.jpg'
                }
            ];
            
            // Category Counts aktualisieren
            this.updateCategoryCounts();
            
            // Gallery rendern
            this.renderGallery();
            
        } catch (error) {
            console.error('Failed to load media items:', error);
        }
    }
    
    /**
     * Category Counts aktualisieren
     */
    updateCategoryCounts() {
        const categories = ['profile', 'application', 'portfolio', 'documents', 'gallery', 'videos'];
        
        categories.forEach(category => {
            const count = this.mediaItems.filter(item => item.category === category).length;
            const countElement = document.getElementById(`${category}-count`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }
    
    /**
     * Gallery rendern
     */
    renderGallery() {
        const container = document.getElementById('galleryContent');
        if (!container) return;
        
        const filteredItems = this.getFilteredItems();
        
        if (filteredItems.length === 0) {
            container.innerHTML = `
                <div class="gallery-empty" style="text-align: center; padding: 3rem; color: #64748b;">
                    <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>Keine Medien gefunden</h3>
                    <p>Lade deine ersten Dateien hoch!</p>
                </div>
            `;
            return;
        }
        
        if (this.viewMode === 'grid') {
            this.renderGridView(container, filteredItems);
        } else {
            this.renderListView(container, filteredItems);
        }
    }
    
    /**
     * Grid View rendern
     */
    renderGridView(container, items) {
        container.innerHTML = `
            <div class="gallery-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${items.map(item => `
                    <div class="media-item" data-id="${item.id}" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: white; transition: all 0.3s ease; cursor: pointer;">
                        <div class="media-thumbnail" style="aspect-ratio: 1; background: #f8fafc; display: flex; align-items: center; justify-content: center; position: relative;">
                            ${item.type === 'image' ? 
                                `<img src="${item.thumbnail}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                `<i class="fas fa-${this.getFileIcon(item.type)}" style="font-size: 2rem; color: #94a3b8;"></i>`
                            }
                            <div class="media-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; gap: 0.5rem;">
                                <button class="btn btn-sm btn-white" onclick="viewMedia(${item.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-white" onclick="downloadMedia(${item.id})">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="btn btn-sm btn-white" onclick="deleteMedia(${item.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="media-info" style="padding: 0.75rem;">
                            <h4 style="margin: 0 0 0.25rem 0; font-size: 0.9rem; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h4>
                            <p style="margin: 0; font-size: 0.8rem; color: #64748b;">${item.size} • ${this.formatDate(item.date)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Hover Effects
        container.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.querySelector('.media-overlay').style.display = 'flex';
            });
            item.addEventListener('mouseleave', () => {
                item.querySelector('.media-overlay').style.display = 'none';
            });
        });
    }
    
    /**
     * List View rendern
     */
    renderListView(container, items) {
        container.innerHTML = `
            <div class="gallery-list">
                ${items.map(item => `
                    <div class="media-item-list" data-id="${item.id}" style="display: flex; align-items: center; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; background: white; transition: all 0.3s ease;">
                        <div class="media-thumbnail-small" style="width: 60px; height: 60px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                            ${item.type === 'image' ? 
                                `<img src="${item.thumbnail}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` :
                                `<i class="fas fa-${this.getFileIcon(item.type)}" style="font-size: 1.5rem; color: #94a3b8;"></i>`
                            }
                        </div>
                        <div class="media-info" style="flex: 1;">
                            <h4 style="margin: 0 0 0.25rem 0; color: #333;">${item.name}</h4>
                            <p style="margin: 0; font-size: 0.9rem; color: #64748b;">${item.size} • ${this.formatDate(item.date)}</p>
                        </div>
                        <div class="media-actions" style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-sm btn-secondary" onclick="viewMedia(${item.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="downloadMedia(${item.id})">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteMedia(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * File Icon
     */
    getFileIcon(type) {
        const icons = {
            'image': 'image',
            'video': 'video',
            'audio': 'music',
            'document': 'file-pdf',
            'pdf': 'file-pdf',
            'doc': 'file-word',
            'docx': 'file-word'
        };
        return icons[type] || 'file';
    }
    
    /**
     * Date Format
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE');
    }
    
    /**
     * Category wechseln
     */
    switchCategory(category) {
        this.currentCategory = category;
        
        // Tab States aktualisieren
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Gallery aktualisieren
        this.renderGallery();
    }
    
    /**
     * Media filtern
     */
    filterMedia(searchTerm) {
        this.searchTerm = searchTerm;
        this.renderGallery();
    }
    
    /**
     * Nach Typ filtern
     */
    filterByType(type) {
        this.filterType = type;
        this.renderGallery();
    }
    
    /**
     * Gefilterte Items abrufen
     */
    getFilteredItems() {
        let items = this.mediaItems.filter(item => item.category === this.currentCategory);
        
        if (this.searchTerm) {
            items = items.filter(item => 
                item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }
        
        if (this.filterType) {
            items = items.filter(item => item.type === this.filterType);
        }
        
        return items;
    }
    
    /**
     * File Upload behandeln
     */
    async handleFileUpload(files) {
        if (files.length === 0) return;
        
        // Progress anzeigen
        this.showUploadProgress();
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                await this.uploadFile(file, i + 1, files.length);
            }
            
            // Media Items neu laden
            await this.loadMediaItems();
            
            // Progress verstecken
            this.hideUploadProgress();
            
        } catch (error) {
            console.error('Upload failed:', error);
            this.hideUploadProgress();
        }
    }
    
    /**
     * Einzelne Datei hochladen
     */
    async uploadFile(file, current, total) {
        // Mock upload - in real implementation, upload to server
        return new Promise((resolve) => {
            setTimeout(() => {
                const newItem = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: this.getFileType(file.type),
                    category: this.currentCategory,
                    size: this.formatFileSize(file.size),
                    date: new Date().toISOString().split('T')[0],
                    url: URL.createObjectURL(file),
                    thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : '/images/thumbnails/file-icon.png'
                };
                
                this.mediaItems.push(newItem);
                resolve();
            }, 1000);
        });
    }
    
    /**
     * File Type bestimmen
     */
    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.includes('pdf')) return 'document';
        return 'document';
    }
    
    /**
     * File Size formatieren
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Upload Progress anzeigen
     */
    showUploadProgress() {
        const progress = document.getElementById('uploadProgress');
        if (progress) {
            progress.style.display = 'block';
        }
    }
    
    /**
     * Upload Progress verstecken
     */
    hideUploadProgress() {
        const progress = document.getElementById('uploadProgress');
        if (progress) {
            progress.style.display = 'none';
        }
    }
    
    /**
     * Bulk Actions anzeigen
     */
    showBulkActions() {
        // Bulk Actions Modal implementieren
        console.log('Bulk Actions');
    }
    
    /**
     * AI Search Toggle
     */
    toggleAISearch() {
        console.log('AI Search Toggle');
    }
    
    /**
     * View Mode wechseln
     */
    toggleGridView() {
        this.viewMode = 'grid';
        this.renderGallery();
    }
    
    /**
     * View Mode wechseln
     */
    toggleListView() {
        this.viewMode = 'list';
        this.renderGallery();
    }
    
    /**
     * Gallery aktualisieren
     */
    refreshGallery() {
        this.loadMediaItems();
    }
}

// Global Functions für Legacy Support
window.triggerFileUpload = function() {
    document.getElementById('fileInput').click();
};

window.triggerBulkUpload = function() {
    const input = document.getElementById('fileInput');
    input.multiple = true;
    input.click();
};

window.triggerCameraUpload = function() {
    console.log('Camera Upload');
};

window.triggerURLUpload = function() {
    console.log('URL Upload');
};

window.viewMedia = function(id) {
    console.log('View Media:', id);
};

window.downloadMedia = function(id) {
    console.log('Download Media:', id);
};

window.deleteMedia = function(id) {
    if (confirm('Medium wirklich löschen?')) {
        console.log('Delete Media:', id);
    }
};

window.toggleGridView = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.media) {
        window.AdminApp.sections.media.toggleGridView();
    }
};

window.toggleListView = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.media) {
        window.AdminApp.sections.media.toggleListView();
    }
};

window.refreshGallery = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.media) {
        window.AdminApp.sections.media.refreshGallery();
    }
};

// Section initialisieren wenn DOM bereit
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis AdminApp verfügbar ist
    const initSection = () => {
        if (window.AdminApp && window.AdminApp.sections) {
            window.AdminApp.sections.media = new MediaSection();
            window.AdminApp.sections.media.init();
        } else {
            setTimeout(initSection, 100);
        }
    };
    initSection();
});

// Global verfügbar machen
window.MediaSection = MediaSection;
