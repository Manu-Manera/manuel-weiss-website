/**
 * Bewerbung Documents Manager
 * Manages application documents storage in AWS S3 with DynamoDB metadata
 */

class BewerbungDocumentsManager {
    constructor() {
        this.s3Bucket = window.AWS_CONFIG?.s3?.bucket || 'mawps-user-files-1760106396';
        this.apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl || '';
        this.userId = null;
        this.documents = [];
        this.isInitialized = false;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
            'application/zip'
        ];
    }

    /**
     * Initialize the documents manager
     */
    async init() {
        if (this.isInitialized) return;
        
        // Wait for auth
        if (!window.realUserAuth || !window.realUserAuth.isAuthenticated()) {
            console.error('Documents manager: User not authenticated');
            return false;
        }
        
        const user = window.realUserAuth.getUser();
        if (!user) return false;
        
        this.userId = user.userId;
        
        // Load existing documents
        await this.loadDocuments();
        
        this.isInitialized = true;
        console.log('Bewerbung documents manager initialized');
        return true;
    }

    /**
     * Get auth token
     */
    async getAuthToken() {
        if (!window.realUserAuth) {
            throw new Error('Auth system not available');
        }
        
        const tokens = await window.realUserAuth.getTokens();
        if (!tokens || !tokens.idToken) {
            throw new Error('No valid auth token');
        }
        
        return tokens.idToken;
    }

    /**
     * Upload a document
     */
    async uploadDocument(file, documentType = 'general', metadata = {}) {
        if (!this.isInitialized) await this.init();
        
        try {
            // Validate file
            this.validateFile(file);
            
            // Show upload progress
            const progressId = this.showUploadProgress(file.name);
            
            // Get presigned upload URL from API
            const idToken = await this.getAuthToken();
            const timestamp = Date.now();
            const safeFileName = this.sanitizeFileName(file.name);
            const s3Key = `users/${this.userId}/documents/${documentType}/${timestamp}-${safeFileName}`;
            
            // Step 1: Get presigned URL
            const presignedResponse = await fetch(`${this.apiBaseUrl}/documents/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    fileName: safeFileName,
                    fileType: file.type,
                    fileSize: file.size,
                    documentType: documentType,
                    s3Key: s3Key
                })
            });
            
            if (!presignedResponse.ok) {
                throw new Error('Failed to get upload URL');
            }
            
            const { uploadUrl, documentId } = await presignedResponse.json();
            
            // Step 2: Upload to S3 using presigned URL
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file to S3');
            }
            
            // Step 3: Save document metadata
            const documentData = {
                documentId: documentId,
                userId: this.userId,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                documentType: documentType,
                s3Key: s3Key,
                uploadedAt: new Date().toISOString(),
                metadata: {
                    ...metadata,
                    originalName: file.name,
                    lastModified: new Date(file.lastModified).toISOString()
                }
            };
            
            const metadataResponse = await fetch(`${this.apiBaseUrl}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(documentData)
            });
            
            if (!metadataResponse.ok) {
                throw new Error('Failed to save document metadata');
            }
            
            const savedDocument = await metadataResponse.json();
            
            // Add to local documents list
            this.documents.unshift(savedDocument);
            
            // Update UI
            this.hideUploadProgress(progressId);
            this.showNotification('Dokument erfolgreich hochgeladen', 'success');
            this.updateDocumentsList();
            
            return savedDocument;
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(`Upload fehlgeschlagen: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Load user documents
     */
    async loadDocuments() {
        try {
            const idToken = await this.getAuthToken();
            
            const response = await fetch(`${this.apiBaseUrl}/documents`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load documents');
            }
            
            this.documents = await response.json();
            console.log(`Loaded ${this.documents.length} documents`);
            
            this.updateDocumentsList();
            return this.documents;
            
        } catch (error) {
            console.error('Error loading documents:', error);
            // Load from local storage as fallback
            this.loadFromLocalStorage();
            return this.documents;
        }
    }

    /**
     * Download a document
     */
    async downloadDocument(documentId) {
        try {
            const document = this.documents.find(d => d.documentId === documentId);
            if (!document) {
                throw new Error('Document not found');
            }
            
            const idToken = await this.getAuthToken();
            
            // Get presigned download URL
            const response = await fetch(`${this.apiBaseUrl}/documents/${documentId}/download-url`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get download URL');
            }
            
            const { downloadUrl } = await response.json();
            
            // Download file
            const fileResponse = await fetch(downloadUrl);
            const blob = await fileResponse.blob();
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = document.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Download gestartet', 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Download fehlgeschlagen', 'error');
            throw error;
        }
    }

    /**
     * Delete a document
     */
    async deleteDocument(documentId) {
        try {
            const idToken = await this.getAuthToken();
            
            const response = await fetch(`${this.apiBaseUrl}/documents/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete document');
            }
            
            // Remove from local list
            this.documents = this.documents.filter(d => d.documentId !== documentId);
            this.updateDocumentsList();
            
            this.showNotification('Dokument gelöscht', 'success');
            
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Löschen fehlgeschlagen', 'error');
            throw error;
        }
    }

    /**
     * Validate file
     */
    validateFile(file) {
        if (!file) {
            throw new Error('Keine Datei ausgewählt');
        }
        
        if (file.size > this.maxFileSize) {
            throw new Error(`Datei zu groß. Maximum: ${this.maxFileSize / 1024 / 1024}MB`);
        }
        
        if (!this.allowedTypes.includes(file.type)) {
            throw new Error(`Dateityp nicht erlaubt. Erlaubte Typen: PDF, Word, Bilder, ZIP`);
        }
        
        return true;
    }

    /**
     * Sanitize filename
     */
    sanitizeFileName(fileName) {
        return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    /**
     * Update documents list UI
     */
    updateDocumentsList() {
        const container = document.getElementById('documentsListContainer');
        if (!container) return;
        
        if (this.documents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>Noch keine Dokumente hochgeladen</p>
                </div>
            `;
            return;
        }
        
        const documentsByType = this.groupDocumentsByType();
        
        let html = '';
        for (const [type, docs] of Object.entries(documentsByType)) {
            html += `
                <div class="document-group">
                    <h4>${this.getTypeLabel(type)}</h4>
                    <div class="documents-grid">
                        ${docs.map(doc => this.renderDocument(doc)).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
        // Add event listeners
        this.attachDocumentListeners();
    }

    /**
     * Group documents by type
     */
    groupDocumentsByType() {
        const groups = {};
        this.documents.forEach(doc => {
            const type = doc.documentType || 'general';
            if (!groups[type]) groups[type] = [];
            groups[type].push(doc);
        });
        return groups;
    }

    /**
     * Get type label
     */
    getTypeLabel(type) {
        const labels = {
            'lebenslauf': 'Lebensläufe',
            'anschreiben': 'Anschreiben',
            'zeugnisse': 'Zeugnisse',
            'zertifikate': 'Zertifikate',
            'portfolio': 'Portfolio',
            'general': 'Sonstige Dokumente'
        };
        return labels[type] || type;
    }

    /**
     * Render single document
     */
    renderDocument(doc) {
        const icon = this.getFileIcon(doc.fileType);
        const size = this.formatFileSize(doc.fileSize);
        const date = new Date(doc.uploadedAt).toLocaleDateString('de-DE');
        
        return `
            <div class="document-card" data-document-id="${doc.documentId}">
                <div class="document-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="document-info">
                    <h5 class="document-name">${doc.fileName}</h5>
                    <p class="document-meta">${size} • ${date}</p>
                </div>
                <div class="document-actions">
                    <button class="btn-icon" data-action="download" title="Herunterladen">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" data-action="delete" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get file icon
     */
    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
        if (fileType.includes('image')) return 'fas fa-file-image';
        if (fileType.includes('zip')) return 'fas fa-file-archive';
        return 'fas fa-file';
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
        return Math.round(bytes / 1024 / 1024 * 10) / 10 + ' MB';
    }

    /**
     * Attach document listeners
     */
    attachDocumentListeners() {
        document.querySelectorAll('[data-action="download"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const documentId = e.currentTarget.closest('[data-document-id]').dataset.documentId;
                this.downloadDocument(documentId);
            });
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const documentId = e.currentTarget.closest('[data-document-id]').dataset.documentId;
                if (confirm('Dokument wirklich löschen?')) {
                    this.deleteDocument(documentId);
                }
            });
        });
    }

    /**
     * Show upload progress
     */
    showUploadProgress(fileName) {
        const progressId = 'upload-' + Date.now();
        const progressHTML = `
            <div id="${progressId}" class="upload-progress">
                <div class="progress-header">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>${fileName}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        
        // Add to page or update existing container
        let container = document.getElementById('uploadProgressContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'uploadProgressContainer';
            container.className = 'upload-progress-container';
            document.body.appendChild(container);
        }
        
        container.insertAdjacentHTML('beforeend', progressHTML);
        return progressId;
    }

    /**
     * Hide upload progress
     */
    hideUploadProgress(progressId) {
        const element = document.getElementById(progressId);
        if (element) {
            setTimeout(() => element.remove(), 2000);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (window.personalityAuthIntegration && window.personalityAuthIntegration.showNotification) {
            window.personalityAuthIntegration.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    /**
     * Setup drag and drop
     */
    setupDragAndDrop(dropZoneId, documentType = 'general') {
        const dropZone = document.getElementById(dropZoneId);
        if (!dropZone) return;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            for (const file of files) {
                try {
                    await this.uploadDocument(file, documentType);
                } catch (error) {
                    console.error('Drop upload error:', error);
                }
            }
        });
    }

    /**
     * Local storage fallback
     */
    saveToLocalStorage() {
        if (!this.userId) return;
        const key = `bewerbungDocuments_${this.userId}`;
        localStorage.setItem(key, JSON.stringify(this.documents));
    }

    loadFromLocalStorage() {
        if (!this.userId) return;
        const key = `bewerbungDocuments_${this.userId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                this.documents = JSON.parse(stored);
            } catch (error) {
                this.documents = [];
            }
        }
    }
}

// Create global instance
window.bewerbungDocumentsManager = new BewerbungDocumentsManager();

// Auto-initialize when auth is ready
if (window.realUserAuth) {
    window.realUserAuth.onAuthStateChange((isAuthenticated) => {
        if (isAuthenticated) {
            window.bewerbungDocumentsManager.init();
        }
    });
}

// Add styles
if (!document.querySelector('#bewerbungDocumentsStyles')) {
    const styles = `
        <style id="bewerbungDocumentsStyles">
            .documents-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 16px;
                margin-top: 16px;
            }
            
            .document-card {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .document-card:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
            }
            
            .document-icon {
                width: 48px;
                height: 48px;
                background: #f7fafc;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            .document-icon i {
                font-size: 24px;
                color: #667eea;
            }
            
            .document-info {
                flex: 1;
                min-width: 0;
            }
            
            .document-name {
                font-weight: 600;
                font-size: 14px;
                color: #1a202c;
                margin: 0 0 4px 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .document-meta {
                font-size: 12px;
                color: #718096;
                margin: 0;
            }
            
            .document-actions {
                display: flex;
                gap: 8px;
            }
            
            .btn-icon {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .btn-icon:hover {
                background: #f7fafc;
                border-color: #cbd5e0;
            }
            
            .btn-icon i {
                font-size: 14px;
                color: #4a5568;
            }
            
            .upload-progress-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .upload-progress {
                background: white;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            
            .progress-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
                font-size: 14px;
                color: #4a5568;
            }
            
            .progress-header i {
                color: #667eea;
            }
            
            .progress-bar {
                width: 100%;
                height: 4px;
                background: #e2e8f0;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                transition: width 0.3s ease;
                animation: progress 2s ease infinite;
            }
            
            @keyframes progress {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #a0aec0;
            }
            
            .empty-state i {
                font-size: 48px;
                margin-bottom: 16px;
            }
            
            .drop-zone {
                border: 2px dashed #cbd5e0;
                border-radius: 8px;
                padding: 40px;
                text-align: center;
                transition: all 0.2s ease;
            }
            
            .drop-zone.drag-over {
                border-color: #667eea;
                background: #f7f9ff;
            }
            
            .document-group {
                margin-bottom: 32px;
            }
            
            .document-group h4 {
                font-size: 18px;
                font-weight: 600;
                color: #1a202c;
                margin-bottom: 16px;
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
}
