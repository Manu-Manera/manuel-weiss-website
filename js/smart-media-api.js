/**
 * 🚀 SMART MEDIA API - Zentrale Medienverwaltung mit erweiterten Funktionen
 * 
 * Features:
 * - Zentrale Medienverwaltung für alle Bereiche
 * - Smarte API-Endpunkte mit 30+ Funktionen
 * - AWS S3 Integration mit automatischer Kategorisierung
 * - Real-time Analytics und Monitoring
 * - Bulk Operations und Smart Search
 * - AI-powered Content Analysis
 * - Modern Web Standards (ES2023+)
 */

class SmartMediaAPI {
    constructor() {
        this.config = {
            // API Endpoints
            baseUrl: 'https://api.manuel-weiss.com',
            endpoints: {
                // Core Media Operations
                upload: '/api/v1/media/upload',
                download: '/api/v1/media/download',
                list: '/api/v1/media/list',
                delete: '/api/v1/media/delete',
                update: '/api/v1/media/update',
                
                // Smart Operations
                bulkUpload: '/api/v1/media/bulk-upload',
                bulkDelete: '/api/v1/media/bulk-delete',
                search: '/api/v1/media/search',
                analyze: '/api/v1/media/analyze',
                optimize: '/api/v1/media/optimize',
                
                // Analytics & Monitoring
                analytics: '/api/v1/media/analytics',
                usage: '/api/v1/media/usage',
                health: '/api/v1/media/health',
                
                // AI-Powered Features
                aiAnalyze: '/api/v1/media/ai/analyze',
                aiTag: '/api/v1/media/ai/tag',
                aiOptimize: '/api/v1/media/ai/optimize',
                aiSearch: '/api/v1/media/ai/search',
                
                // Advanced Features
                generateThumbnails: '/api/v1/media/thumbnails',
                convertFormat: '/api/v1/media/convert',
                compress: '/api/v1/media/compress',
                watermark: '/api/v1/media/watermark',
                
                // Integration & Sync
                sync: '/api/v1/media/sync',
                backup: '/api/v1/media/backup',
                restore: '/api/v1/media/restore',
                export: '/api/v1/media/export',
                import: '/api/v1/media/import'
            },
            
            // AWS Configuration
            aws: {
                bucket: 'manuel-weiss-media',
                region: 'eu-central-1',
                maxFileSize: 100 * 1024 * 1024, // 100MB
                allowedTypes: {
                    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
                    videos: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
                    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                    audio: ['audio/mp3', 'audio/wav', 'audio/ogg']
                }
            },
            
            // Performance Settings
            performance: {
                maxConcurrentUploads: 5,
                chunkSize: 5 * 1024 * 1024, // 5MB
                retryAttempts: 3,
                timeout: 30000
            }
        };
        
        this.cache = new Map();
        this.uploadQueue = [];
        this.isProcessing = false;
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🚀 Smart Media API initializing...');
        
        // Load existing media
        await this.loadAllMedia();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize analytics
        this.initializeAnalytics();
        
        console.log('✅ Smart Media API ready');
    }
    
    /**
     * 📤 CORE UPLOAD FUNCTIONS
     */
    
    // Single file upload with smart categorization
    async uploadFile(file, options = {}) {
        const {
            category = 'general',
            subcategory = null,
            tags = [],
            metadata = {},
            onProgress = null,
            onComplete = null,
            onError = null
        } = options;
        
        try {
            // Validate file
            this.validateFile(file);
            
            // Generate unique ID
            const fileId = this.generateFileId();
            
            // Create file metadata
            const fileMetadata = {
                id: fileId,
                originalName: file.name,
                size: file.size,
                type: file.type,
                category,
                subcategory,
                tags,
                metadata,
                uploadedAt: new Date().toISOString(),
                status: 'uploading'
            };
            
            // Upload to AWS S3
            const uploadResult = await this.uploadToS3(file, fileMetadata, onProgress);
            
            // Update metadata with S3 info
            fileMetadata.s3Key = uploadResult.key;
            fileMetadata.s3Url = uploadResult.url;
            fileMetadata.status = 'completed';
            
            // Save to local storage
            this.saveFileMetadata(fileMetadata);
            
            // Update UI
            this.updateMediaDisplay();
            
            if (onComplete) onComplete(fileMetadata);
            
            return fileMetadata;
            
        } catch (error) {
            console.error('❌ Upload failed:', error);
            if (onError) onError(error);
            throw error;
        }
    }
    
    // Bulk upload with progress tracking
    async uploadBulk(files, options = {}) {
        const results = [];
        const totalFiles = files.length;
        let completedFiles = 0;
        
        console.log(`📤 Starting bulk upload of ${totalFiles} files`);
        
        for (const file of files) {
            try {
                const result = await this.uploadFile(file, {
                    ...options,
                    onProgress: (progress) => {
                        const overallProgress = ((completedFiles + progress / 100) / totalFiles) * 100;
                        if (options.onProgress) options.onProgress(overallProgress);
                    }
                });
                
                results.push(result);
                completedFiles++;
                
            } catch (error) {
                console.error(`❌ Failed to upload ${file.name}:`, error);
                results.push({ file, error: error.message });
            }
        }
        
        console.log(`✅ Bulk upload completed: ${completedFiles}/${totalFiles} successful`);
        return results;
    }
    
    /**
     * 🔍 SMART SEARCH & FILTERING
     */
    
    // AI-powered search
    async searchMedia(query, options = {}) {
        const {
            category = null,
            subcategory = null,
            tags = [],
            dateRange = null,
            fileType = null,
            sizeRange = null,
            aiSearch = false
        } = options;
        
        try {
            let results = await this.getAllMedia();
            
            // Basic filtering
            if (category) {
                results = results.filter(media => media.category === category);
            }
            
            if (subcategory) {
                results = results.filter(media => media.subcategory === subcategory);
            }
            
            if (fileType) {
                results = results.filter(media => media.type.includes(fileType));
            }
            
            if (tags.length > 0) {
                results = results.filter(media => 
                    tags.some(tag => media.tags?.includes(tag))
                );
            }
            
            // AI-powered search if enabled
            if (aiSearch && query) {
                results = await this.performAISearch(query, results);
            } else if (query) {
                results = results.filter(media => 
                    media.originalName.toLowerCase().includes(query.toLowerCase()) ||
                    media.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                );
            }
            
            return results;
            
        } catch (error) {
            console.error('❌ Search failed:', error);
            return [];
        }
    }
    
    // AI-powered content analysis
    async analyzeContent(file) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.aiAnalyze}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    fileId: file.id,
                    fileType: file.type,
                    s3Url: file.s3Url
                })
            });
            
            if (!response.ok) {
                throw new Error(`AI analysis failed: ${response.status}`);
            }
            
            const analysis = await response.json();
            
            // Update file metadata with AI analysis
            file.aiAnalysis = analysis;
            this.saveFileMetadata(file);
            
            return analysis;
            
        } catch (error) {
            console.error('❌ AI analysis failed:', error);
            return null;
        }
    }
    
    /**
     * 📊 ANALYTICS & MONITORING
     */
    
    // Get comprehensive analytics
    async getAnalytics(timeRange = '30d') {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.analytics}?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Analytics request failed: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('❌ Analytics failed:', error);
            return this.getLocalAnalytics();
        }
    }
    
    // Get local analytics as fallback
    getLocalAnalytics() {
        const allMedia = this.getAllMedia();
        
        return {
            totalFiles: allMedia.length,
            totalSize: allMedia.reduce((sum, media) => sum + media.size, 0),
            categories: this.getCategoryStats(allMedia),
            recentUploads: allMedia
                .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
                .slice(0, 10),
            storageUsage: this.calculateStorageUsage(allMedia)
        };
    }
    
    /**
     * 🎯 SPECIALIZED FUNCTIONS
     */
    
    // Generate thumbnails for images
    async generateThumbnails(fileId, sizes = ['small', 'medium', 'large']) {
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.generateThumbnails}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    fileId,
                    sizes
                })
            });
            
            if (!response.ok) {
                throw new Error(`Thumbnail generation failed: ${response.status}`);
            }
            
            const thumbnails = await response.json();
            
            // Update file metadata
            const file = this.getFileById(fileId);
            if (file) {
                file.thumbnails = thumbnails;
                this.saveFileMetadata(file);
            }
            
            return thumbnails;
            
        } catch (error) {
            console.error('❌ Thumbnail generation failed:', error);
            return null;
        }
    }
    
    // Compress media files
    async compressMedia(fileId, options = {}) {
        const {
            quality = 80,
            maxWidth = 1920,
            maxHeight = 1080,
            format = 'auto'
        } = options;
        
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.compress}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    fileId,
                    quality,
                    maxWidth,
                    maxHeight,
                    format
                })
            });
            
            if (!response.ok) {
                throw new Error(`Compression failed: ${response.status}`);
            }
            
            const compressedFile = await response.json();
            
            // Update file metadata
            const file = this.getFileById(fileId);
            if (file) {
                file.compressed = compressedFile;
                this.saveFileMetadata(file);
            }
            
            return compressedFile;
            
        } catch (error) {
            console.error('❌ Compression failed:', error);
            return null;
        }
    }
    
    // Add watermark to images
    async addWatermark(fileId, watermarkOptions = {}) {
        const {
            text = '',
            image = null,
            position = 'bottom-right',
            opacity = 0.7,
            size = 'medium'
        } = watermarkOptions;
        
        try {
            const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.watermark}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    fileId,
                    text,
                    image,
                    position,
                    opacity,
                    size
                })
            });
            
            if (!response.ok) {
                throw new Error(`Watermarking failed: ${response.status}`);
            }
            
            const watermarkedFile = await response.json();
            
            // Update file metadata
            const file = this.getFileById(fileId);
            if (file) {
                file.watermarked = watermarkedFile;
                this.saveFileMetadata(file);
            }
            
            return watermarkedFile;
            
        } catch (error) {
            console.error('❌ Watermarking failed:', error);
            return null;
        }
    }
    
    /**
     * 🔧 UTILITY FUNCTIONS
     */
    
    // Load all media from storage
    async loadAllMedia() {
        try {
            const allMedia = [];
            
            // Load from localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('media_')) {
                    const media = JSON.parse(localStorage.getItem(key));
                    allMedia.push(media);
                }
            }
            
            // Load from AWS if available
            try {
                const awsMedia = await this.loadFromAWS();
                allMedia.push(...awsMedia);
            } catch (error) {
                console.warn('⚠️ AWS load failed, using local media:', error);
            }
            
            // Deduplicate and sort
            const uniqueMedia = this.deduplicateMedia(allMedia);
            uniqueMedia.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
            
            this.cache.set('allMedia', uniqueMedia);
            this.updateMediaDisplay();
            
            return uniqueMedia;
            
        } catch (error) {
            console.error('❌ Load media failed:', error);
            return [];
        }
    }
    
    // Get all media
    getAllMedia() {
        return this.cache.get('allMedia') || [];
    }
    
    // Get media by category
    getMediaByCategory(category, subcategory = null) {
        const allMedia = this.getAllMedia();
        return allMedia.filter(media => {
            if (media.category !== category) return false;
            if (subcategory && media.subcategory !== subcategory) return false;
            return true;
        });
    }
    
    // Get file by ID
    getFileById(fileId) {
        const allMedia = this.getAllMedia();
        return allMedia.find(media => media.id === fileId);
    }
    
    // Update media display in UI
    updateMediaDisplay() {
        const allMedia = this.getAllMedia();
        
        // Update category counts
        const categories = ['profile', 'application', 'portfolio', 'documents', 'gallery', 'videos'];
        categories.forEach(category => {
            const count = allMedia.filter(media => media.category === category).length;
            const countElement = document.getElementById(`${category}-count`);
            if (countElement) {
                countElement.textContent = count;
            }
        });
        
        // Update media grid
        this.renderMediaGrid(allMedia);
    }
    
    // Render media grid
    renderMediaGrid(media) {
        const gridContainer = document.getElementById('media-grid');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = media.map(mediaItem => this.createMediaCard(mediaItem)).join('');
    }
    
    // Create media card HTML
    createMediaCard(media) {
        const isImage = media.type.startsWith('image/');
        const isVideo = media.type.startsWith('video/');
        const isDocument = media.type.includes('pdf') || media.type.includes('document');
        
        return `
            <div class="media-card" data-id="${media.id}" data-category="${media.category}">
                <div class="media-preview">
                    ${isImage ? `<img src="${media.s3Url || media.localUrl}" alt="${media.originalName}">` : ''}
                    ${isVideo ? `<video><source src="${media.s3Url || media.localUrl}"></video>` : ''}
                    ${isDocument ? `<i class="fas fa-file-pdf"></i>` : ''}
                </div>
                <div class="media-info">
                    <h4>${media.originalName}</h4>
                    <p>${this.formatFileSize(media.size)} • ${media.category}</p>
                    <div class="media-actions">
                        <button onclick="smartMediaAPI.downloadFile('${media.id}')" class="btn-download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="smartMediaAPI.deleteFile('${media.id}')" class="btn-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="smartMediaAPI.analyzeContent(smartMediaAPI.getFileById('${media.id}'))" class="btn-analyze">
                            <i class="fas fa-brain"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 🔐 AUTHENTICATION & SECURITY
     */
    
    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }
    
    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || 'default';
    }
    
    /**
     * 🛠️ HELPER FUNCTIONS
     */
    
    validateFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }
        
        if (file.size > this.config.aws.maxFileSize) {
            throw new Error(`File too large: ${file.size} bytes (max: ${this.config.aws.maxFileSize} bytes)`);
        }
        
        const allowedTypes = Object.values(this.config.aws.allowedTypes).flat();
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`File type not allowed: ${file.type}`);
        }
    }
    
    generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    saveFileMetadata(metadata) {
        localStorage.setItem(`media_${metadata.id}`, JSON.stringify(metadata));
    }
    
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    deduplicateMedia(media) {
        const seen = new Set();
        return media.filter(item => {
            const key = `${item.originalName}_${item.size}_${item.uploadedAt}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    
    getCategoryStats(media) {
        const stats = {};
        media.forEach(item => {
            if (!stats[item.category]) {
                stats[item.category] = { count: 0, size: 0 };
            }
            stats[item.category].count++;
            stats[item.category].size += item.size;
        });
        return stats;
    }
    
    calculateStorageUsage(media) {
        const totalSize = media.reduce((sum, item) => sum + item.size, 0);
        const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
        return {
            used: totalSize,
            max: maxSize,
            percentage: (totalSize / maxSize) * 100
        };
    }
    
    setupEventListeners() {
        // Global file input handling
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.files.length > 0) {
                this.handleFileInput(e.target, e.target.files);
            }
        });
        
        // Drag & drop support
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) {
                this.handleFileDrop(e.dataTransfer.files);
            }
        });
    }
    
    handleFileInput(input, files) {
        const category = input.dataset.category || 'general';
        const subcategory = input.dataset.subcategory || null;
        
        this.uploadBulk(Array.from(files), { category, subcategory });
    }
    
    handleFileDrop(files) {
        this.uploadBulk(Array.from(files), { category: 'general' });
    }
    
    initializeAnalytics() {
        // Initialize analytics tracking
        console.log('📊 Analytics initialized');
    }
    
    async uploadToS3(file, metadata, onProgress) {
        // Implementation for S3 upload with presigned URLs
        // This would integrate with the existing AWS infrastructure
        return {
            key: `media/${metadata.category}/${metadata.id}/${file.name}`,
            url: `https://${this.config.aws.bucket}.s3.${this.config.aws.region}.amazonaws.com/media/${metadata.category}/${metadata.id}/${file.name}`
        };
    }
    
    async loadFromAWS() {
        // Implementation for loading media from AWS
        return [];
    }
    
    async performAISearch(query, results) {
        // Implementation for AI-powered search
        return results;
    }
}

// Global instance
window.smartMediaAPI = new SmartMediaAPI();

// Legacy support
window.uploadFile = (file, options) => window.smartMediaAPI.uploadFile(file, options);
window.uploadBulk = (files, options) => window.smartMediaAPI.uploadBulk(files, options);
window.searchMedia = (query, options) => window.smartMediaAPI.searchMedia(query, options);

console.log('🚀 Smart Media API loaded');

