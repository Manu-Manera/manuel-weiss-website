/**
 * 📸 Media Management System 2025 - Enhanced
 * Moderne Lösung für Service-Bilder mit AWS S3 Integration
 * Integriert alle Features aus den bestehenden Media Management Systemen
 */

class MediaManagement2025 {
    constructor() {
        this.awsS3 = new AWSS3Manager();
        this.imageProcessor = new ImageProcessor();
        this.currentService = 'wohnmobil';
        this.uploadProgress = new UploadProgress();
        this.mediaGallery = new MediaGallery();
        this.smartAPI = new SmartMediaAPI();
        this.unifiedUpload = new UnifiedAWSUpload();
        
        // Enhanced Features
        this.analytics = new MediaAnalytics();
        this.searchEngine = new MediaSearchEngine();
        this.bulkOperations = new BulkOperations();
        this.aiFeatures = new AIFeatures();
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Media Management System 2025...');
        this.setupEventListeners();
        this.loadExistingImages();
        this.setupDragAndDrop();
    }
    
    setupEventListeners() {
        // Service Tab Switching
        document.querySelectorAll('.category-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const service = e.currentTarget.dataset.category;
                if (['wohnmobil', 'photobox', 'sup'].includes(service)) {
                    this.switchService(service);
                }
            });
        });
        
        // File Input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }
        
        // Upload Methods
        document.querySelectorAll('.upload-method-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method || 'standard';
                this.triggerUpload(method);
            });
        });
    }
    
    setupDragAndDrop() {
        const uploadZone = document.getElementById('uploadZone');
        if (!uploadZone) return;
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
        
        uploadZone.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }
    
    async switchService(service) {
        this.currentService = service;
        await this.loadExistingImages();
        this.updateActiveTab(service);
        console.log(`📸 Switched to service: ${service}`);
    }
    
    updateActiveTab(service) {
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-category="${service}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    
    triggerUpload(method = 'standard') {
        console.log(`📤 Triggering upload method: ${method}`);
        
        switch (method) {
            case 'standard':
                document.getElementById('fileInput').click();
                break;
            case 'bulk':
                document.getElementById('fileInput').click();
                break;
            case 'drag':
                this.showDragZone();
                break;
            case 'camera':
                this.triggerCameraCapture();
                break;
        }
    }
    
    async handleFileSelect(files) {
        if (!files || files.length === 0) return;
        
        console.log(`📁 Processing ${files.length} files for service: ${this.currentService}`);
        
        this.uploadProgress.show();
        
        try {
            const uploadPromises = Array.from(files).map(file => 
                this.processAndUpload(file)
            );
            
            await Promise.all(uploadPromises);
            
            this.uploadProgress.update(100, 'Upload complete!');
            setTimeout(() => this.uploadProgress.hide(), 2000);
            
            await this.loadExistingImages();
            this.showNotification('Bilder erfolgreich hochgeladen!', 'success');
            
        } catch (error) {
            this.uploadProgress.hide();
            this.showNotification('Upload fehlgeschlagen!', 'error');
            console.error('Upload error:', error);
        }
    }
    
    async processAndUpload(file) {
        // 1. Validate file
        if (!this.validateFile(file)) {
            throw new Error('Invalid file type or size');
        }
        
        // 2. Process image (resize, optimize)
        const processedFile = await this.imageProcessor.process(file);
        
        // 3. Upload to AWS S3
        const result = await this.awsS3.uploadFile(
            processedFile, 
            this.currentService
        );
        
        // 4. Save metadata to localStorage
        await this.saveImageMetadata(result, file);
        
        return result;
    }
    
    validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Nur JPEG, PNG und WebP Dateien erlaubt!', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            this.showNotification('Datei zu groß! Maximum 10MB.', 'error');
            return false;
        }
        
        return true;
    }
    
    async saveImageMetadata(s3Result, originalFile) {
        const metadata = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            service: this.currentService,
            originalName: originalFile.name,
            s3Key: s3Result.Key,
            s3Url: s3Result.Location,
            fileSize: originalFile.size,
            mimeType: originalFile.type,
            uploadDate: new Date().toISOString(),
            isFeatured: false,
            sortOrder: 0
        };
        
        // Save to localStorage
        const existingMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        existingMedia.push(metadata);
        localStorage.setItem('mediaLibrary', JSON.stringify(existingMedia));
        
        console.log('💾 Metadata saved:', metadata);
    }
    
    async loadExistingImages() {
        const existingMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        const serviceMedia = existingMedia.filter(media => media.service === this.currentService);
        
        this.mediaGallery.render(serviceMedia);
        this.updateMediaCount(serviceMedia.length);
        
        console.log(`📚 Loaded ${serviceMedia.length} images for ${this.currentService}`);
    }
    
    updateMediaCount(count) {
        const countElement = document.getElementById(`${this.currentService}-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                font-weight: 500;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

/**
 * AWS S3 Manager für Media Uploads
 */
class AWSS3Manager {
    constructor() {
        this.bucketName = 'mawps-media-2025';
        this.region = 'eu-central-1';
        this.folders = {
            wohnmobil: 'services/wohnmobil/',
            photobox: 'services/photobox/',
            sup: 'services/sup/',
            thumbnails: 'thumbnails/',
            optimized: 'optimized/'
        };
    }
    
    async uploadFile(file, service, folder = 'images') {
        // Simulate AWS S3 upload for now
        // In production, this would use AWS SDK v3
        
        const key = `${this.folders[service]}${Date.now()}-${file.name}`;
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const result = {
            Key: key,
            Location: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`,
            ETag: `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`,
            Bucket: this.bucketName
        };
        
        console.log('☁️ File uploaded to S3:', result);
        return result;
    }
    
    async getSignedUploadUrl(key, contentType) {
        // Simulate signed URL generation
        const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}?X-Amz-Signature=simulated`;
        return url;
    }
}

/**
 * Image Processor für Client-side Optimization
 */
class ImageProcessor {
    async process(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate optimal dimensions
                const maxWidth = 1200;
                const maxHeight = 1200;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and optimize
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    const processedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    console.log(`🖼️ Image processed: ${file.size} → ${processedFile.size} bytes`);
                    resolve(processedFile);
                }, 'image/jpeg', 0.85);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    async generateThumbnail(file, size = 200) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = size;
                canvas.height = size;
                
                ctx.drawImage(img, 0, 0, size, size);
                
                canvas.toBlob((blob) => {
                    const thumbnail = new File([blob], `thumb_${file.name}`, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    resolve(thumbnail);
                }, 'image/jpeg', 0.8);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
}

/**
 * Upload Progress Tracker
 */
class UploadProgress {
    constructor() {
        this.progressBar = document.getElementById('uploadProgress');
        this.progressFill = document.querySelector('.progress-fill');
        this.progressText = document.querySelector('.progress-text');
    }
    
    show() {
        if (this.progressBar) {
            this.progressBar.style.display = 'block';
        }
    }
    
    update(percentage, text) {
        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = text;
        }
    }
    
    hide() {
        if (this.progressBar) {
            this.progressBar.style.display = 'none';
        }
    }
}

/**
 * Media Gallery Renderer
 */
class MediaGallery {
    constructor() {
        this.gallery = document.getElementById('mediaGallery');
    }
    
    render(mediaItems) {
        if (!this.gallery) return;
        
        if (mediaItems.length === 0) {
            this.gallery.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #6b7280;">
                    <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Noch keine Bilder hochgeladen</p>
                    <p style="font-size: 0.9rem; opacity: 0.7;">Ziehen Sie Bilder hierher oder klicken Sie auf "Dateien auswählen"</p>
                </div>
            `;
            return;
        }
        
        this.gallery.innerHTML = mediaItems.map(item => `
            <div class="media-item" data-id="${item.id}">
                <img src="${item.s3Url}" alt="${item.originalName}" loading="lazy">
                <div class="media-actions">
                    <button onclick="mediaManager.deleteImage('${item.id}')" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button onclick="mediaManager.setFeatured('${item.id}')" title="Als Hauptbild setzen">
                        <i class="fas fa-star"></i>
                    </button>
                    <button onclick="mediaManager.downloadImage('${item.id}')" title="Herunterladen">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                <div class="media-info">
                    <span class="media-name">${item.originalName}</span>
                    <span class="media-size">${this.formatFileSize(item.fileSize)}</span>
                </div>
            </div>
        `).join('');
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize Media Management System
let mediaManager;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('media')) {
        mediaManager = new MediaManagement2025();
        console.log('✅ Media Management System 2025 initialized');
    }
});

/**
 * 🚀 SMART MEDIA API - Enhanced Features
 */
class SmartMediaAPI {
    constructor() {
        this.config = {
            baseUrl: 'https://api.manuel-weiss.com',
            endpoints: {
                upload: '/api/v1/media/upload',
                download: '/api/v1/media/download',
                list: '/api/v1/media/list',
                delete: '/api/v1/media/delete',
                bulkUpload: '/api/v1/media/bulk-upload',
                search: '/api/v1/media/search',
                analytics: '/api/v1/media/analytics',
                aiAnalyze: '/api/v1/media/ai/analyze',
                generateThumbnails: '/api/v1/media/thumbnails'
            }
        };
    }
    
    async uploadFile(file, options = {}) {
        // Enhanced upload with smart categorization
        const fileMetadata = {
            id: this.generateFileId(),
            originalName: file.name,
            size: file.size,
            type: file.type,
            category: options.category || 'general',
            subcategory: options.subcategory || null,
            tags: options.tags || [],
            uploadedAt: new Date().toISOString(),
            status: 'uploading'
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        fileMetadata.s3Key = `media/${Date.now()}-${file.name}`;
        fileMetadata.s3Url = `https://mawps-media-2025.s3.eu-central-1.amazonaws.com/${fileMetadata.s3Key}`;
        fileMetadata.status = 'completed';
        
        return fileMetadata;
    }
    
    async bulkUpload(files, options = {}) {
        const results = [];
        for (const file of files) {
            try {
                const result = await this.uploadFile(file, options);
                results.push(result);
            } catch (error) {
                results.push({ file, error: error.message });
            }
        }
        return results;
    }
    
    async searchMedia(query, filters = {}) {
        // Enhanced search functionality
        const allMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        return allMedia.filter(media => 
            media.originalName.toLowerCase().includes(query.toLowerCase()) ||
            media.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
    }
    
    generateFileId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }
}

/**
 * 🔄 UNIFIED AWS UPLOAD - Enhanced Integration
 */
class UnifiedAWSUpload {
    constructor() {
        this.config = {
            s3: {
                bucket: 'mawps-media-2025',
                region: 'eu-central-1',
                maxFileSize: 50 * 1024 * 1024, // 50MB
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
            }
        };
    }
    
    async uploadFile(file, service, options = {}) {
        // Enhanced upload with chunking and retry logic
        const maxRetries = 3;
        let retries = 0;
        
        while (retries < maxRetries) {
            try {
                return await this.performUpload(file, service, options);
            } catch (error) {
                retries++;
                if (retries >= maxRetries) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }
    }
    
    async performUpload(file, service, options) {
        // Simulate chunked upload
        const key = `${service}/${Date.now()}-${file.name}`;
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
            Key: key,
            Location: `https://mawps-media-2025.s3.eu-central-1.amazonaws.com/${key}`,
            ETag: `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`,
            Bucket: 'mawps-media-2025'
        };
    }
}

/**
 * 📊 MEDIA ANALYTICS - Enhanced Analytics
 */
class MediaAnalytics {
    constructor() {
        this.metrics = {
            totalUploads: 0,
            totalSize: 0,
            uploadsByService: {},
            uploadsByType: {},
            uploadsByDate: {}
        };
    }
    
    trackUpload(mediaItem) {
        this.metrics.totalUploads++;
        this.metrics.totalSize += mediaItem.size;
        
        // Track by service
        if (!this.metrics.uploadsByService[mediaItem.service]) {
            this.metrics.uploadsByService[mediaItem.service] = 0;
        }
        this.metrics.uploadsByService[mediaItem.service]++;
        
        // Track by type
        const type = mediaItem.type.split('/')[0];
        if (!this.metrics.uploadsByType[type]) {
            this.metrics.uploadsByType[type] = 0;
        }
        this.metrics.uploadsByType[type]++;
        
        // Track by date
        const date = new Date(mediaItem.uploadDate).toDateString();
        if (!this.metrics.uploadsByDate[date]) {
            this.metrics.uploadsByDate[date] = 0;
        }
        this.metrics.uploadsByDate[date]++;
        
        this.saveMetrics();
    }
    
    getAnalytics() {
        return {
            ...this.metrics,
            averageFileSize: this.metrics.totalSize / this.metrics.totalUploads || 0,
            mostUsedService: this.getMostUsedService(),
            mostUsedType: this.getMostUsedType()
        };
    }
    
    getMostUsedService() {
        return Object.keys(this.metrics.uploadsByService).reduce((a, b) => 
            this.metrics.uploadsByService[a] > this.metrics.uploadsByService[b] ? a : b, 'none'
        );
    }
    
    getMostUsedType() {
        return Object.keys(this.metrics.uploadsByType).reduce((a, b) => 
            this.metrics.uploadsByType[a] > this.metrics.uploadsByType[b] ? a : b, 'none'
        );
    }
    
    saveMetrics() {
        localStorage.setItem('mediaAnalytics', JSON.stringify(this.metrics));
    }
    
    loadMetrics() {
        const saved = localStorage.getItem('mediaAnalytics');
        if (saved) {
            this.metrics = { ...this.metrics, ...JSON.parse(saved) };
        }
    }
}

/**
 * 🔍 MEDIA SEARCH ENGINE - Enhanced Search
 */
class MediaSearchEngine {
    constructor() {
        this.searchIndex = new Map();
        this.buildIndex();
    }
    
    buildIndex() {
        const allMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        allMedia.forEach(media => {
            this.indexMedia(media);
        });
    }
    
    indexMedia(media) {
        const searchableText = [
            media.originalName,
            media.service,
            ...(media.tags || []),
            media.type
        ].join(' ').toLowerCase();
        
        this.searchIndex.set(media.id, searchableText);
    }
    
    search(query, filters = {}) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [id, searchableText] of this.searchIndex) {
            if (searchableText.includes(queryLower)) {
                const media = this.getMediaById(id);
                if (media && this.matchesFilters(media, filters)) {
                    results.push(media);
                }
            }
        }
        
        return results;
    }
    
    getMediaById(id) {
        const allMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        return allMedia.find(media => media.id === id);
    }
    
    matchesFilters(media, filters) {
        if (filters.service && media.service !== filters.service) return false;
        if (filters.type && !media.type.startsWith(filters.type)) return false;
        if (filters.dateFrom && new Date(media.uploadDate) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(media.uploadDate) > new Date(filters.dateTo)) return false;
        return true;
    }
}

/**
 * 📦 BULK OPERATIONS - Enhanced Bulk Features
 */
class BulkOperations {
    constructor() {
        this.selectedItems = new Set();
    }
    
    selectItem(id) {
        this.selectedItems.add(id);
    }
    
    deselectItem(id) {
        this.selectedItems.delete(id);
    }
    
    selectAll() {
        const allMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        this.selectedItems = new Set(allMedia.map(media => media.id));
    }
    
    clearSelection() {
        this.selectedItems.clear();
    }
    
    async bulkDelete() {
        const allMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        const remainingMedia = allMedia.filter(media => !this.selectedItems.has(media.id));
        localStorage.setItem('mediaLibrary', JSON.stringify(remainingMedia));
        this.clearSelection();
        return this.selectedItems.size;
    }
    
    async bulkDownload() {
        const selectedMedia = Array.from(this.selectedItems);
        // Simulate bulk download
        console.log(`📥 Downloading ${selectedMedia.length} files...`);
        return selectedMedia;
    }
    
    async bulkTag(tags) {
        const allMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        allMedia.forEach(media => {
            if (this.selectedItems.has(media.id)) {
                media.tags = [...(media.tags || []), ...tags];
            }
        });
        localStorage.setItem('mediaLibrary', JSON.stringify(allMedia));
    }
}

/**
 * 🤖 AI FEATURES - Enhanced AI Integration
 */
class AIFeatures {
    constructor() {
        this.aiEnabled = true;
    }
    
    async analyzeImage(imageUrl) {
        if (!this.aiEnabled) return null;
        
        // Simulate AI analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
            tags: ['outdoor', 'nature', 'adventure'],
            description: 'A beautiful outdoor scene',
            confidence: 0.95,
            colors: ['#4a90e2', '#7ed321', '#f5a623'],
            objects: ['person', 'mountain', 'sky']
        };
    }
    
    async generateTags(imageUrl) {
        const analysis = await this.analyzeImage(imageUrl);
        return analysis?.tags || [];
    }
    
    async optimizeImage(imageUrl, options = {}) {
        // Simulate AI optimization
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            optimizedUrl: imageUrl.replace('.jpg', '_optimized.jpg'),
            sizeReduction: '30%',
            qualityImprovement: '15%'
        };
    }
}

// Global functions for HTML onclick handlers
function triggerFileUpload() {
    if (mediaManager) {
        mediaManager.triggerUpload('standard');
    }
}

function triggerBulkUpload() {
    if (mediaManager) {
        mediaManager.triggerUpload('bulk');
    }
}

function triggerDragUpload() {
    if (mediaManager) {
        mediaManager.triggerUpload('drag');
    }
}

function triggerCameraUpload() {
    if (mediaManager) {
        mediaManager.triggerUpload('camera');
    }
}

// Enhanced global functions
function triggerSmartSearch() {
    if (mediaManager) {
        const query = document.getElementById('media-search')?.value;
        if (query) {
            mediaManager.searchEngine.search(query);
        }
    }
}

function triggerBulkDelete() {
    if (mediaManager && confirm('Alle ausgewählten Dateien löschen?')) {
        mediaManager.bulkOperations.bulkDelete();
    }
}

function triggerBulkDownload() {
    if (mediaManager) {
        mediaManager.bulkOperations.bulkDownload();
    }
}

function triggerAIAnalysis() {
    if (mediaManager) {
        // Trigger AI analysis for selected images
        console.log('🤖 Starting AI analysis...');
    }
}
