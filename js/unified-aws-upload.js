/**
 * 🚀 UNIFIED AWS UPLOAD SYSTEM
 * Zentrale AWS-Integration für alle Bild- und Video-Uploads im gesamten System
 * 
 * Unterstützt:
 * - Profilbilder (Navigation, Hero, Footer)
 * - Bewerbungsbilder (Portraits, CV-Bilder)
 * - Dokumente (PDF, DOC, etc.)
 * - Videos (MP4, MOV, etc.)
 * - Galerie-Bilder
 * - AI-Twin Medien
 */

class UnifiedAWSUpload {
    constructor() {
        this.config = {
            // AWS S3 Configuration
            s3: {
                bucket: 'manuel-weiss-media',
                region: 'eu-central-1',
                maxFileSize: 50 * 1024 * 1024, // 50MB
                allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
                allowedVideoTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
                allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            },
            
            // API Endpoints
            endpoints: {
                upload: 'https://api.manuel-weiss.com/upload',
                download: 'https://api.manuel-weiss.com/download',
                presigned: 'https://api.manuel-weiss.com/presigned-url'
            },
            
            // Upload Settings
            upload: {
                maxRetries: 3,
                timeout: 60000, // 60 seconds
                chunkSize: 5 * 1024 * 1024, // 5MB chunks
                parallelUploads: 3
            }
        };
        
        this.uploadQueue = [];
        this.isUploading = false;
        
        this.initialize();
    }
    
    initialize() {
        console.log('🚀 Unified AWS Upload System initialized');
        this.setupEventListeners();
        this.loadStoredMedia();
    }
    
    /**
     * 🎯 HAUPTFUNKTION: Einheitlicher Upload für alle Medien
     */
    async uploadMedia(files, options = {}) {
        const {
            category = 'general',
            subcategory = null,
            userId = this.getCurrentUserId(),
            metadata = {},
            onProgress = null,
            onComplete = null,
            onError = null
        } = options;
        
        console.log(`📤 Uploading ${files.length} files to category: ${category}`);
        
        try {
            // Validierung
            this.validateFiles(files);
            
            // Upload-Queue erstellen
            const uploadPromises = Array.from(files).map(file => 
                this.uploadSingleFile(file, {
                    category,
                    subcategory,
                    userId,
                    metadata,
                    onProgress
                })
            );
            
            // Parallele Uploads
            const results = await Promise.all(uploadPromises);
            
            // Erfolg
            if (onComplete) onComplete(results);
            this.showSuccessMessage(`${files.length} Dateien erfolgreich hochgeladen`);
            
            return results;
            
        } catch (error) {
            console.error('❌ Upload failed:', error);
            if (onError) onError(error);
            this.showErrorMessage(`Upload fehlgeschlagen: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 📁 Einzelne Datei hochladen
     */
    async uploadSingleFile(file, options) {
        const {
            category,
            subcategory,
            userId,
            metadata,
            onProgress
        } = options;
        
        // 1. Lokal speichern für sofortige Anzeige
        const localUrl = await this.saveLocally(file);
        
        // 2. AWS-Upload
        let awsResult = null;
        try {
            awsResult = await this.uploadToAWS(file, {
                category,
                subcategory,
                userId,
                metadata,
                onProgress
            });
        } catch (awsError) {
            console.warn('⚠️ AWS upload failed, using local storage:', awsError);
        }
        
        // 3. Metadaten speichern
        const fileMetadata = {
            id: this.generateFileId(),
            originalName: file.name,
            size: file.size,
            type: file.type,
            category,
            subcategory,
            userId,
            localUrl,
            awsUrl: awsResult?.url || null,
            awsKey: awsResult?.key || null,
            uploadedAt: new Date().toISOString(),
            metadata
        };
        
        this.saveFileMetadata(fileMetadata);
        
        return fileMetadata;
    }
    
    /**
     * ☁️ AWS S3 Upload
     */
    async uploadToAWS(file, options) {
        const { category, subcategory, userId, metadata, onProgress } = options;
        
        // Presigned URL anfordern
        const presignedData = await this.getPresignedUrl(file, {
            category,
            subcategory,
            userId
        });
        
        // Direkter S3 Upload
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(presignedData.fields).forEach(key => {
            formData.append(key, presignedData.fields[key]);
        });
        
        // Upload mit Progress
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status === 200 || xhr.status === 204) {
                    resolve({
                        url: presignedData.url,
                        key: presignedData.key,
                        bucket: this.config.s3.bucket
                    });
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });
            
            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed: Network error'));
            });
            
            xhr.open('POST', presignedData.url);
            xhr.send(formData);
        });
    }
    
    /**
     * 🔗 Presigned URL anfordern
     */
    async getPresignedUrl(file, options) {
        const { category, subcategory, userId } = options;
        
        const response = await fetch(this.config.endpoints.presigned, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                category,
                subcategory,
                userId,
                bucket: this.config.s3.bucket
            })
        });
        
        if (!response.ok) {
            throw new Error(`Presigned URL request failed: ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * 💾 Lokal speichern
     */
    async saveLocally(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                const fileId = this.generateFileId();
                localStorage.setItem(`media_${fileId}`, dataUrl);
                resolve(dataUrl);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * 📋 Datei-Validierung
     */
    validateFiles(files) {
        Array.from(files).forEach(file => {
            // Größe prüfen
            if (file.size > this.config.s3.maxFileSize) {
                throw new Error(`Datei ${file.name} ist zu groß (max. ${this.config.s3.maxFileSize / 1024 / 1024}MB)`);
            }
            
            // Typ prüfen
            const allowedTypes = [
                ...this.config.s3.allowedImageTypes,
                ...this.config.s3.allowedVideoTypes,
                ...this.config.s3.allowedDocumentTypes
            ];
            
            if (!allowedTypes.includes(file.type)) {
                throw new Error(`Dateityp ${file.type} nicht unterstützt`);
            }
        });
    }
    
    /**
     * 🎯 SPEZIALISIERTE UPLOAD-FUNKTIONEN
     */
    
    // Profilbild Upload
    async uploadProfileImage(file, type = 'hero') {
        return await this.uploadMedia([file], {
            category: 'profile',
            subcategory: type,
            metadata: { type: 'profile-image' }
        });
    }
    
    // Bewerbungsbild Upload
    async uploadApplicationImage(file, type = 'portrait') {
        return await this.uploadMedia([file], {
            category: 'application',
            subcategory: type,
            metadata: { type: 'application-image' }
        });
    }
    
    // Dokument Upload
    async uploadDocument(file, type = 'cv') {
        return await this.uploadMedia([file], {
            category: 'documents',
            subcategory: type,
            metadata: { type: 'document' }
        });
    }
    
    // Video Upload
    async uploadVideo(file, type = 'presentation') {
        return await this.uploadMedia([file], {
            category: 'videos',
            subcategory: type,
            metadata: { type: 'video' }
        });
    }
    
    // Galerie Upload
    async uploadGalleryImages(files) {
        return await this.uploadMedia(files, {
            category: 'gallery',
            subcategory: 'images',
            metadata: { type: 'gallery-image' }
        });
    }
    
    /**
     * 📥 DOWNLOAD & ANZEIGE
     */
    
    // Medien laden
    async loadMedia(category, subcategory = null) {
        try {
            // Lokale Medien laden
            const localMedia = this.getLocalMedia(category, subcategory);
            
            // AWS Medien laden (falls verfügbar)
            let awsMedia = [];
            try {
                awsMedia = await this.loadFromAWS(category, subcategory);
            } catch (error) {
                console.warn('AWS load failed, using local media:', error);
            }
            
            // Kombinieren und sortieren
            const allMedia = [...localMedia, ...awsMedia];
            return this.deduplicateMedia(allMedia);
            
        } catch (error) {
            console.error('❌ Load media failed:', error);
            return [];
        }
    }
    
    // Lokale Medien abrufen
    getLocalMedia(category, subcategory) {
        const media = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('media_')) {
                const metadata = this.getFileMetadata(key.replace('media_', ''));
                if (metadata && metadata.category === category) {
                    if (!subcategory || metadata.subcategory === subcategory) {
                        media.push({
                            ...metadata,
                            url: localStorage.getItem(key)
                        });
                    }
                }
            }
        }
        return media;
    }
    
    // AWS Medien laden
    async loadFromAWS(category, subcategory) {
        const response = await fetch(`${this.config.endpoints.download}?category=${category}&subcategory=${subcategory || ''}`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`AWS load failed: ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * 🔧 HILFSFUNKTIONEN
     */
    
    generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('currentUserId') || 'default';
    }
    
    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }
    
    saveFileMetadata(metadata) {
        localStorage.setItem(`metadata_${metadata.id}`, JSON.stringify(metadata));
    }
    
    getFileMetadata(fileId) {
        const metadata = localStorage.getItem(`metadata_${fileId}`);
        return metadata ? JSON.parse(metadata) : null;
    }
    
    deduplicateMedia(media) {
        const seen = new Set();
        return media.filter(item => {
            const key = `${item.originalName}_${item.size}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    
    setupEventListeners() {
        // Globale Upload-Event-Listener
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.files.length > 0) {
                this.handleFileInput(e.target, e.target.files);
            }
        });
        
        // Drag & Drop Support
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
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
        
        this.uploadMedia(files, { category, subcategory });
    }
    
    handleFileDrop(files) {
        this.uploadMedia(files, { category: 'general' });
    }
    
    loadStoredMedia() {
        // Alle gespeicherten Medien beim Laden anzeigen
        console.log('📥 Loading stored media...');
        // Implementation für verschiedene Bereiche
    }
    
    showSuccessMessage(message) {
        console.log('✅', message);
        // UI Notification hier
    }
    
    showErrorMessage(message) {
        console.error('❌', message);
        // UI Error Notification hier
    }
}

// Globale Instanz erstellen
window.unifiedAWS = new UnifiedAWSUpload();

// Legacy-Support für bestehende Funktionen
window.uploadProfileImageToAWS = (file) => window.unifiedAWS.uploadProfileImage(file);
window.uploadDocument = (type, file) => window.unifiedAWS.uploadDocument(file, type);
window.uploadGalleryImages = (files) => window.unifiedAWS.uploadGalleryImages(files);

console.log('🚀 Unified AWS Upload System loaded');

