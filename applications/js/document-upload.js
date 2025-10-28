/**
 * DOCUMENT UPLOAD - JAVASCRIPT
 * Handles file uploads, preview, and document management
 */

class DocumentUpload {
    constructor() {
        this.applicationsCore = null;
        this.uploadedFiles = {
            cv: null,
            certificates: [],
            portfolio: [],
            photo: null
        };
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = {
            cv: ['.pdf', '.docx'],
            certificates: ['.pdf', '.jpg', '.jpeg', '.png'],
            portfolio: ['.pdf', '.docx', '.zip'],
            photo: ['.jpg', '.jpeg', '.png']
        };
        this.init();
    }

    async init() {
        console.log('📁 Initializing Document Upload...');
        
        // Wait for applications core
        await this.waitForApplicationsCore();
        
        // Setup file input handlers
        this.setupFileInputs();
        
        // Setup drag and drop
        this.setupDragAndDrop();
        
        // Load existing documents
        this.loadExistingDocuments();
        
        // Update summary
        this.updateSummary();
        
        console.log('✅ Document Upload initialized');
    }

    async waitForApplicationsCore() {
        return new Promise((resolve) => {
            const checkCore = () => {
                if (window.applicationsCore && window.applicationsCore.isInitialized) {
                    this.applicationsCore = window.applicationsCore;
                    resolve();
                } else {
                    setTimeout(checkCore, 100);
                }
            };
            checkCore();
        });
    }

    setupFileInputs() {
        // CV file input
        const cvInput = document.getElementById('cvFile');
        cvInput.addEventListener('change', (e) => {
            this.handleFileSelect(e, 'cv');
        });

        // Certificates file input
        const certificatesInput = document.getElementById('certificatesFile');
        certificatesInput.addEventListener('change', (e) => {
            this.handleFileSelect(e, 'certificates');
        });

        // Portfolio file input
        const portfolioInput = document.getElementById('portfolioFile');
        portfolioInput.addEventListener('change', (e) => {
            this.handleFileSelect(e, 'portfolio');
        });

        // Photo file input
        const photoInput = document.getElementById('photoFile');
        photoInput.addEventListener('change', (e) => {
            this.handleFileSelect(e, 'photo');
        });
    }

    setupDragAndDrop() {
        const uploadAreas = document.querySelectorAll('.upload-area');
        
        uploadAreas.forEach(area => {
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('drag-over');
            });
            
            area.addEventListener('dragleave', (e) => {
                e.preventDefault();
                area.classList.remove('drag-over');
            });
            
            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('drag-over');
                
                const files = Array.from(e.dataTransfer.files);
                const type = this.getUploadType(area);
                this.handleFiles(files, type);
            });
        });
    }

    getUploadType(area) {
        if (area.id === 'cvUploadArea') return 'cv';
        if (area.id === 'certificatesUploadArea') return 'certificates';
        if (area.id === 'portfolioUploadArea') return 'portfolio';
        if (area.id === 'photoUploadArea') return 'photo';
        return null;
    }

    handleFileSelect(event, type) {
        const files = Array.from(event.target.files);
        this.handleFiles(files, type);
    }

    handleFiles(files, type) {
        if (!files.length) return;
        
        // Validate files
        const validFiles = this.validateFiles(files, type);
        if (!validFiles.length) return;
        
        // Process files
        if (type === 'cv' || type === 'photo') {
            // Single file
            this.uploadedFiles[type] = validFiles[0];
            this.showFilePreview(validFiles[0], type);
        } else {
            // Multiple files
            this.uploadedFiles[type] = [...this.uploadedFiles[type], ...validFiles];
            this.showFilesList(validFiles, type);
        }
        
        // Update summary
        this.updateSummary();
        
        // Save to storage
        this.saveDocuments();
    }

    validateFiles(files, type) {
        const validFiles = [];
        const allowedTypes = this.allowedTypes[type];
        
        files.forEach(file => {
            // Check file size
            if (file.size > this.maxFileSize) {
                this.showNotification(`Datei ${file.name} ist zu groß (max. 10MB)`, 'error');
                return;
            }
            
            // Check file type
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                this.showNotification(`Datei ${file.name} hat ein nicht unterstütztes Format`, 'error');
                return;
            }
            
            validFiles.push(file);
        });
        
        return validFiles;
    }

    showFilePreview(file, type) {
        const preview = document.getElementById(`${type}Preview`);
        if (!preview) return;
        
        const fileName = document.querySelector(`#${type}Preview .file-name`);
        const fileSize = document.querySelector(`#${type}Preview .file-size`);
        const fileIcon = document.querySelector(`#${type}Preview .file-icon`);
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
        if (fileIcon) {
            fileIcon.className = this.getFileIcon(file.name);
        }
        
        preview.style.display = 'block';
        
        // Hide upload area
        const uploadArea = document.getElementById(`${type}UploadArea`);
        if (uploadArea) uploadArea.style.display = 'none';
    }

    showFilesList(files, type) {
        const list = document.getElementById(`${type}List`);
        if (!list) return;
        
        files.forEach(file => {
            const fileItem = this.createFileItem(file, type);
            list.appendChild(fileItem);
        });
        
        list.style.display = 'block';
        
        // Hide upload area if files exist
        const uploadArea = document.getElementById(`${type}UploadArea`);
        if (uploadArea && this.uploadedFiles[type].length > 0) {
            uploadArea.style.display = 'none';
        }
    }

    createFileItem(file, type) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div class="file-info">
                <i class="${this.getFileIcon(file.name)} file-icon"></i>
                <div class="file-details">
                    <h4 class="file-name">${file.name}</h4>
                    <p class="file-size">${this.formatFileSize(file.size)}</p>
                </div>
            </div>
            <div class="file-actions">
                <button type="button" class="btn btn-outline btn-sm" onclick="previewFile('${type}', '${file.name}')">
                    <i class="fas fa-eye"></i>
                    Vorschau
                </button>
                <button type="button" class="btn btn-outline btn-sm" onclick="removeFile('${type}', '${file.name}')">
                    <i class="fas fa-trash"></i>
                    Entfernen
                </button>
            </div>
        `;
        return item;
    }

    getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'fas fa-file-pdf',
            'docx': 'fas fa-file-word',
            'doc': 'fas fa-file-word',
            'jpg': 'fas fa-image',
            'jpeg': 'fas fa-image',
            'png': 'fas fa-image',
            'zip': 'fas fa-file-archive'
        };
        return iconMap[extension] || 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateSummary() {
        const totalFiles = this.getTotalFiles();
        const totalSize = this.getTotalSize();
        const completionRate = this.getCompletionRate();
        
        document.getElementById('totalFiles').textContent = totalFiles;
        document.getElementById('totalSize').textContent = this.formatFileSize(totalSize);
        document.getElementById('completionRate').textContent = completionRate + '%';
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = completionRate + '%';
        }
    }

    getTotalFiles() {
        let total = 0;
        Object.values(this.uploadedFiles).forEach(files => {
            if (Array.isArray(files)) {
                total += files.length;
            } else if (files) {
                total += 1;
            }
        });
        return total;
    }

    getTotalSize() {
        let total = 0;
        Object.values(this.uploadedFiles).forEach(files => {
            if (Array.isArray(files)) {
                files.forEach(file => total += file.size);
            } else if (files) {
                total += files.size;
            }
        });
        return total;
    }

    getCompletionRate() {
        let completed = 0;
        let total = 4; // CV, Certificates, Portfolio, Photo
        
        if (this.uploadedFiles.cv) completed++;
        if (this.uploadedFiles.certificates.length > 0) completed++;
        if (this.uploadedFiles.portfolio.length > 0) completed++;
        if (this.uploadedFiles.photo) completed++;
        
        return Math.round((completed / total) * 100);
    }

    saveDocuments() {
        if (!this.applicationsCore) return;
        
        const documentData = {
            files: this.uploadedFiles,
            uploadedAt: new Date().toISOString(),
            totalFiles: this.getTotalFiles(),
            totalSize: this.getTotalSize()
        };
        
        this.applicationsCore.saveDocumentData(documentData);
        this.applicationsCore.trackProgress('document-upload', documentData);
        
        console.log('💾 Documents saved:', documentData);
    }

    loadExistingDocuments() {
        if (!this.applicationsCore) return;
        
        const existingDocuments = this.applicationsCore.getDocumentData();
        if (!existingDocuments || !existingDocuments.length) return;
        
        // Get the most recent document data
        const latestDocument = existingDocuments[existingDocuments.length - 1];
        if (latestDocument && latestDocument.files) {
            this.uploadedFiles = latestDocument.files;
            this.renderExistingFiles();
            this.updateSummary();
        }
    }

    renderExistingFiles() {
        // Render CV
        if (this.uploadedFiles.cv) {
            this.showFilePreview(this.uploadedFiles.cv, 'cv');
        }
        
        // Render certificates
        if (this.uploadedFiles.certificates.length > 0) {
            this.showFilesList(this.uploadedFiles.certificates, 'certificates');
        }
        
        // Render portfolio
        if (this.uploadedFiles.portfolio.length > 0) {
            this.showFilesList(this.uploadedFiles.portfolio, 'portfolio');
        }
        
        // Render photo
        if (this.uploadedFiles.photo) {
            this.showFilePreview(this.uploadedFiles.photo, 'photo');
        }
    }

    showNotification(message, type = 'info') {
        if (this.applicationsCore) {
            this.applicationsCore.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }
}

// Global functions for inline event handlers
function previewFile(type, fileName) {
    console.log('Preview file:', type, fileName);
    // Implementation for file preview
    const modal = document.getElementById('previewModal');
    const content = document.getElementById('previewContent');
    
    content.innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-file"></i>
            <p>Vorschau für ${fileName}</p>
            <p class="text-muted">Vorschau-Funktion wird implementiert...</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

function removeFile(type, fileName) {
    console.log('Remove file:', type, fileName);
    
    if (window.documentUpload) {
        if (type === 'cv' || type === 'photo') {
            window.documentUpload.uploadedFiles[type] = null;
            const preview = document.getElementById(`${type}Preview`);
            if (preview) preview.style.display = 'none';
            
            const uploadArea = document.getElementById(`${type}UploadArea`);
            if (uploadArea) uploadArea.style.display = 'block';
        } else {
            // Remove from array
            window.documentUpload.uploadedFiles[type] = window.documentUpload.uploadedFiles[type].filter(
                file => file.name !== fileName
            );
            
            // Update UI
            const list = document.getElementById(`${type}List`);
            if (list) {
                const items = list.querySelectorAll('.file-item');
                items.forEach(item => {
                    const name = item.querySelector('.file-name').textContent;
                    if (name === fileName) {
                        item.remove();
                    }
                });
                
                // Show upload area if no files left
                if (window.documentUpload.uploadedFiles[type].length === 0) {
                    list.style.display = 'none';
                    const uploadArea = document.getElementById(`${type}UploadArea`);
                    if (uploadArea) uploadArea.style.display = 'block';
                }
            }
        }
        
        // Update summary and save
        window.documentUpload.updateSummary();
        window.documentUpload.saveDocuments();
    }
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    modal.style.display = 'none';
}

function handleContinue() {
    // Validate that at least CV is uploaded
    if (!window.documentUpload.uploadedFiles.cv) {
        window.documentUpload.showNotification('Bitte laden Sie mindestens Ihren Lebenslauf hoch', 'error');
        return;
    }
    
    // Save final state
    window.documentUpload.saveDocuments();
    
    // Show success message
    window.documentUpload.showNotification('Dokumente erfolgreich hochgeladen!', 'success');
    
    // Redirect to next step
    setTimeout(() => {
        window.location.href = 'application-generator.html';
    }, 1500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.documentUpload = new DocumentUpload();
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('previewModal');
    if (e.target === modal) {
        closePreview();
    }
});







