// 📤 Upload Manager - Modernes Upload-System mit AWS S3 Integration
// Unterstützt Drag&Drop, Chunked Upload, Progress Tracking und Fehlerbehandlung

export class UploadManager {
    constructor(options = {}) {
        this.config = {
            maxFileSize: options.maxFileSize || 50 * 1024 * 1024, // 50MB
            allowedTypes: options.allowedTypes || [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/webp',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ],
            chunkSize: options.chunkSize || 5 * 1024 * 1024, // 5MB chunks
            maxConcurrentUploads: options.maxConcurrentUploads || 3,
            retryAttempts: options.retryAttempts || 3,
            apiEndpoint: options.apiEndpoint || '/api/v1/upload',
            awsConfig: options.awsConfig || {},
            enablePreview: options.enablePreview !== false,
            ...options
        };

        this.activeUploads = new Map();
        this.uploadQueue = [];
        this.observers = new Set();
        this.dropZones = new Set();
        
        this.init();
    }

    async init() {
        try {
            await this.setupAWSConfig();
            this.setupGlobalEventListeners();
            console.log('✅ UploadManager initialized successfully');
        } catch (error) {
            console.error('❌ UploadManager initialization failed:', error);
            throw error;
        }
    }

    // 🔧 Configuration
    async setupAWSConfig() {
        if (this.config.awsConfig.useAWS) {
            // Dynamically load AWS SDK if needed
            if (!window.AWS && this.config.awsConfig.loadSDK !== false) {
                await this.loadAWSSDK();
            }
            
            if (window.AWS && this.config.awsConfig.region) {
                window.AWS.config.update({
                    region: this.config.awsConfig.region,
                    credentials: this.config.awsConfig.credentials
                });
            }
        }
    }

    async loadAWSSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 📁 Drag & Drop Setup
    setupDropZone(element, options = {}) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) {
            throw new Error('Drop zone element not found');
        }

        const dropZone = {
            element,
            options: {
                acceptMultiple: options.acceptMultiple !== false,
                showPreview: options.showPreview !== false,
                autoUpload: options.autoUpload !== false,
                ...options
            }
        };

        this.dropZones.add(dropZone);
        this.attachDropZoneListeners(dropZone);
        
        return dropZone;
    }

    attachDropZoneListeners(dropZone) {
        const { element, options } = dropZone;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Visual feedback
        element.addEventListener('dragenter', () => {
            element.classList.add('drag-over');
            this.notifyObservers('dragEnter', { dropZone, element });
        });

        element.addEventListener('dragleave', (e) => {
            if (!element.contains(e.relatedTarget)) {
                element.classList.remove('drag-over');
                this.notifyObservers('dragLeave', { dropZone, element });
            }
        });

        element.addEventListener('dragover', (e) => {
            e.dataTransfer.dropEffect = 'copy';
        });

        element.addEventListener('drop', async (e) => {
            element.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            
            this.notifyObservers('filesDropped', { files, dropZone });
            
            if (options.autoUpload) {
                for (const file of files) {
                    await this.uploadFile(file, options);
                }
            }
        });

        // File input integration
        if (options.fileInput) {
            const input = typeof options.fileInput === 'string' 
                ? document.querySelector(options.fileInput)
                : options.fileInput;
                
            if (input) {
                input.addEventListener('change', async (e) => {
                    const files = Array.from(e.target.files);
                    for (const file of files) {
                        if (options.autoUpload) {
                            await this.uploadFile(file, options);
                        }
                    }
                });
            }
        }
    }

    // 📤 File Upload
    async uploadFile(file, options = {}) {
        try {
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            const uploadId = this.generateUploadId();
            const upload = {
                id: uploadId,
                file,
                options,
                status: 'pending',
                progress: 0,
                uploadedBytes: 0,
                totalBytes: file.size,
                startTime: Date.now(),
                chunks: [],
                retryCount: 0
            };

            this.activeUploads.set(uploadId, upload);
            this.notifyObservers('uploadStarted', upload);

            // Choose upload strategy
            if (file.size > this.config.chunkSize && this.config.enableChunkedUpload !== false) {
                return await this.chunkedUpload(upload);
            } else {
                return await this.directUpload(upload);
            }
        } catch (error) {
            console.error('❌ Upload failed:', error);
            this.notifyObservers('uploadError', { file, error });
            throw error;
        }
    }

    // 📊 Direct Upload (small files)
    async directUpload(upload) {
        const { file, options } = upload;
        
        try {
            upload.status = 'uploading';
            this.notifyObservers('uploadProgress', upload);

            let result;
            
            if (this.config.awsConfig.useAWS) {
                result = await this.uploadToAWS(upload);
            } else {
                result = await this.uploadToServer(upload);
            }

            upload.status = 'completed';
            upload.progress = 100;
            upload.result = result;
            upload.endTime = Date.now();
            
            this.activeUploads.delete(upload.id);
            this.notifyObservers('uploadCompleted', upload);
            
            return result;
        } catch (error) {
            return await this.handleUploadError(upload, error);
        }
    }

    // 🔄 Chunked Upload (large files)
    async chunkedUpload(upload) {
        const { file } = upload;
        const chunks = this.createChunks(file);
        
        upload.chunks = chunks.map((chunk, index) => ({
            index,
            data: chunk,
            status: 'pending',
            retryCount: 0
        }));

        try {
            upload.status = 'uploading';
            
            // Initialize multipart upload
            const multipartUpload = await this.initializeMultipartUpload(upload);
            upload.multipartUploadId = multipartUpload.uploadId;

            // Upload chunks concurrently (with limit)
            const results = await this.uploadChunksConcurrently(upload);
            
            // Complete multipart upload
            const result = await this.completeMultipartUpload(upload, results);
            
            upload.status = 'completed';
            upload.progress = 100;
            upload.result = result;
            upload.endTime = Date.now();
            
            this.activeUploads.delete(upload.id);
            this.notifyObservers('uploadCompleted', upload);
            
            return result;
        } catch (error) {
            // Cleanup failed multipart upload
            if (upload.multipartUploadId) {
                await this.abortMultipartUpload(upload);
            }
            return await this.handleUploadError(upload, error);
        }
    }

    createChunks(file) {
        const chunks = [];
        let start = 0;
        
        while (start < file.size) {
            const end = Math.min(start + this.config.chunkSize, file.size);
            chunks.push(file.slice(start, end));
            start = end;
        }
        
        return chunks;
    }

    async uploadChunksConcurrently(upload) {
        const { chunks } = upload;
        const results = [];
        const semaphore = new Semaphore(this.config.maxConcurrentUploads);
        
        const uploadPromises = chunks.map(async (chunk, index) => {
            return semaphore.acquire(async () => {
                return await this.uploadChunk(upload, chunk, index);
            });
        });

        const chunkResults = await Promise.all(uploadPromises);
        
        // Sort results by chunk index
        return chunkResults.sort((a, b) => a.index - b.index);
    }

    async uploadChunk(upload, chunk, index) {
        const maxRetries = this.config.retryAttempts;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.uploadSingleChunk(upload, chunk, index);
                
                // Update progress
                upload.uploadedBytes += chunk.data.size;
                upload.progress = Math.round((upload.uploadedBytes / upload.totalBytes) * 100);
                this.notifyObservers('uploadProgress', upload);
                
                return result;
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Exponential backoff
                const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async uploadSingleChunk(upload, chunk, index) {
        if (this.config.awsConfig.useAWS) {
            return await this.uploadChunkToAWS(upload, chunk, index);
        } else {
            return await this.uploadChunkToServer(upload, chunk, index);
        }
    }

    // 🌐 AWS Integration
    async uploadToAWS(upload) {
        const { file } = upload;
        
        if (!this.config.awsConfig.bucket) {
            throw new Error('AWS bucket not configured');
        }

        const s3 = new AWS.S3();
        const key = this.generateAWSKey(file);
        
        const params = {
            Bucket: this.config.awsConfig.bucket,
            Key: key,
            Body: file,
            ContentType: file.type,
            Metadata: {
                originalName: file.name,
                uploadId: upload.id,
                timestamp: Date.now().toString()
            }
        };

        return new Promise((resolve, reject) => {
            const request = s3.upload(params);
            
            request.on('httpUploadProgress', (progress) => {
                upload.progress = Math.round((progress.loaded / progress.total) * 100);
                upload.uploadedBytes = progress.loaded;
                this.notifyObservers('uploadProgress', upload);
            });
            
            request.send((error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.Location,
                        key: result.Key,
                        bucket: result.Bucket,
                        etag: result.ETag
                    });
                }
            });
        });
    }

    async initializeMultipartUpload(upload) {
        if (this.config.awsConfig.useAWS) {
            const s3 = new AWS.S3();
            const key = this.generateAWSKey(upload.file);
            
            const params = {
                Bucket: this.config.awsConfig.bucket,
                Key: key,
                ContentType: upload.file.type,
                Metadata: {
                    originalName: upload.file.name,
                    uploadId: upload.id
                }
            };

            const result = await s3.createMultipartUpload(params).promise();
            return { uploadId: result.UploadId, key };
        } else {
            // Server-based multipart upload initialization
            const response = await fetch(`${this.config.apiEndpoint}/multipart/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: upload.file.name,
                    contentType: upload.file.type,
                    size: upload.file.size
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to initialize multipart upload: ${response.statusText}`);
            }
            
            return await response.json();
        }
    }

    async uploadChunkToAWS(upload, chunk, index) {
        const s3 = new AWS.S3();
        
        const params = {
            Bucket: this.config.awsConfig.bucket,
            Key: upload.result?.key || this.generateAWSKey(upload.file),
            PartNumber: index + 1,
            UploadId: upload.multipartUploadId,
            Body: chunk.data
        };

        const result = await s3.uploadPart(params).promise();
        return {
            index,
            partNumber: index + 1,
            etag: result.ETag
        };
    }

    async completeMultipartUpload(upload, parts) {
        if (this.config.awsConfig.useAWS) {
            const s3 = new AWS.S3();
            
            const params = {
                Bucket: this.config.awsConfig.bucket,
                Key: upload.result?.key || this.generateAWSKey(upload.file),
                UploadId: upload.multipartUploadId,
                MultipartUpload: {
                    Parts: parts.map(part => ({
                        PartNumber: part.partNumber,
                        ETag: part.etag
                    }))
                }
            };

            const result = await s3.completeMultipartUpload(params).promise();
            return {
                url: result.Location,
                key: result.Key,
                bucket: result.Bucket,
                etag: result.ETag
            };
        } else {
            // Server-based completion
            const response = await fetch(`${this.config.apiEndpoint}/multipart/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uploadId: upload.multipartUploadId,
                    parts
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to complete multipart upload: ${response.statusText}`);
            }
            
            return await response.json();
        }
    }

    // 🚨 Error Handling
    async handleUploadError(upload, error) {
        upload.retryCount++;
        
        if (upload.retryCount <= this.config.retryAttempts) {
            console.warn(`⚠️ Upload attempt ${upload.retryCount} failed, retrying:`, error.message);
            
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, upload.retryCount - 1), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return await this.uploadFile(upload.file, upload.options);
        } else {
            upload.status = 'failed';
            upload.error = error;
            upload.endTime = Date.now();
            
            this.activeUploads.delete(upload.id);
            this.notifyObservers('uploadFailed', upload);
            
            throw error;
        }
    }

    // ✅ File Validation
    validateFile(file) {
        // Size check
        if (file.size > this.config.maxFileSize) {
            return {
                isValid: false,
                error: `File size exceeds limit (${this.formatFileSize(this.config.maxFileSize)})`
            };
        }

        // Type check
        if (this.config.allowedTypes.length > 0 && !this.config.allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: `File type not allowed. Allowed: ${this.config.allowedTypes.join(', ')}`
            };
        }

        // Name check
        if (file.name.length > 255) {
            return {
                isValid: false,
                error: 'Filename too long (max 255 characters)'
            };
        }

        return { isValid: true };
    }

    // 🖼️ Preview Generation
    async generatePreview(file) {
        if (!this.config.enablePreview) return null;
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const preview = {
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    url: e.target.result,
                    name: file.name,
                    size: file.size
                };
                resolve(preview);
            };
            
            reader.onerror = () => resolve(null);
            
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                resolve({
                    type: 'file',
                    name: file.name,
                    size: file.size,
                    icon: this.getFileIcon(file.type)
                });
            }
        });
    }

    // 🛠️ Utility Methods
    generateUploadId() {
        return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateAWSKey(file) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const extension = file.name.split('.').pop();
        return `uploads/${timestamp}_${random}.${extension}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(mimeType) {
        const iconMap = {
            'application/pdf': 'fas fa-file-pdf',
            'application/msword': 'fas fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
            'image/jpeg': 'fas fa-file-image',
            'image/png': 'fas fa-file-image',
            'image/webp': 'fas fa-file-image'
        };
        return iconMap[mimeType] || 'fas fa-file';
    }

    // 🔔 Observer Pattern
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ Observer callback error:', error);
            }
        });
    }

    // 📊 Status Methods
    getActiveUploads() {
        return Array.from(this.activeUploads.values());
    }

    getUploadProgress(uploadId) {
        return this.activeUploads.get(uploadId);
    }

    cancelUpload(uploadId) {
        const upload = this.activeUploads.get(uploadId);
        if (upload) {
            upload.status = 'cancelled';
            this.activeUploads.delete(uploadId);
            this.notifyObservers('uploadCancelled', upload);
        }
    }

    // 🧹 Cleanup
    destroy() {
        this.activeUploads.clear();
        this.uploadQueue = [];
        this.observers.clear();
        this.dropZones.clear();
    }
}

// 🎯 Semaphore for Concurrency Control
class Semaphore {
    constructor(capacity) {
        this.capacity = capacity;
        this.running = 0;
        this.queue = [];
    }

    async acquire(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.tryNext();
        });
    }

    tryNext() {
        if (this.running >= this.capacity || this.queue.length === 0) {
            return;
        }

        this.running++;
        const { task, resolve, reject } = this.queue.shift();

        task()
            .then(resolve, reject)
            .finally(() => {
                this.running--;
                this.tryNext();
            });
    }
}

// 🏭 Factory function
export function createUploadManager(options) {
    return new UploadManager(options);
}

// 📁 Upload Constants
export const UPLOAD_STATUS = {
    PENDING: 'pending',
    UPLOADING: 'uploading',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

export const FILE_TYPES = {
    PDF: 'application/pdf',
    WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    IMAGE_JPEG: 'image/jpeg',
    IMAGE_PNG: 'image/png',
    IMAGE_WEBP: 'image/webp'
};
