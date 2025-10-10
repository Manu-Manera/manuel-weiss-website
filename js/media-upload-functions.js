/**
 * 📸 MEDIA UPLOAD FUNCTIONS
 * Funktionen für die Medien-Upload-Verwaltung
 */

// Upload-Funktionen
function triggerFileUpload() {
    console.log('📤 Triggering file upload...');
    const input = document.getElementById('media-file-input');
    if (input) {
        input.click();
    } else {
        console.error('❌ Media file input not found');
        showNotification('Upload-Input nicht gefunden', 'error');
    }
}

function triggerBulkUpload() {
    console.log('📤 Triggering bulk upload...');
    const input = document.getElementById('media-file-input');
    if (input) {
        input.multiple = true;
        input.click();
    } else {
        console.error('❌ Media file input not found');
        showNotification('Upload-Input nicht gefunden', 'error');
    }
}

function triggerCameraUpload() {
    console.log('📷 Triggering camera upload...');
    const input = document.getElementById('media-file-input');
    if (input) {
        input.accept = 'image/*';
        input.capture = 'camera';
        input.click();
    } else {
        console.error('❌ Media file input not found');
        showNotification('Upload-Input nicht gefunden', 'error');
    }
}

// File Upload Handler
function handleFileUpload(files) {
    console.log('📤 Handling file upload:', files);
    
    if (!files || files.length === 0) {
        console.warn('⚠️ No files selected');
        return;
    }
    
    // Show upload progress
    showUploadProgress();
    
    // Process each file
    Array.from(files).forEach((file, index) => {
        uploadSingleFile(file, index, files.length);
    });
}

// Upload single file
async function uploadSingleFile(file, index, total) {
    console.log(`📤 Uploading file ${index + 1}/${total}:`, file.name);
    
    try {
        // Update status
        updateUploadStatus(`Lade ${file.name} hoch... (${index + 1}/${total})`);
        
        // Determine category based on file type
        const category = getFileCategory(file);
        const subcategory = getFileSubcategory(file);
        
        // Upload using unified system
        if (window.unifiedAWS && typeof window.unifiedAWS.uploadMedia === 'function') {
            const result = await window.unifiedAWS.uploadMedia([file], {
                category: category,
                subcategory: subcategory,
                onProgress: (progress) => {
                    updateUploadProgress(progress);
                }
            });
            
            console.log('✅ Upload successful:', result);
            showNotification(`${file.name} erfolgreich hochgeladen`, 'success');
            
        } else {
            // Fallback to localStorage
            await uploadToLocalStorage(file, category, subcategory);
            showNotification(`${file.name} in LocalStorage gespeichert`, 'info');
        }
        
        // Update progress
        const progress = ((index + 1) / total) * 100;
        updateUploadProgress(progress);
        
    } catch (error) {
        console.error('❌ Upload failed:', error);
        showNotification(`Upload von ${file.name} fehlgeschlagen: ${error.message}`, 'error');
    }
}

// Upload to localStorage (fallback)
async function uploadToLocalStorage(file, category, subcategory) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                category: category,
                subcategory: subcategory,
                uploadedAt: new Date().toISOString()
            };
            
            // Store in localStorage
            const key = `media_${category}_${subcategory}_${Date.now()}`;
            localStorage.setItem(key, JSON.stringify(fileData));
            
            // Update media grid
            updateMediaGrid();
            
            resolve(fileData);
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

// Get file category based on type
function getFileCategory(file) {
    const type = file.type.toLowerCase();
    
    if (type.startsWith('image/')) {
        return 'images';
    } else if (type.startsWith('video/')) {
        return 'videos';
    } else if (type.includes('pdf') || type.includes('document')) {
        return 'documents';
    } else {
        return 'general';
    }
}

// Get file subcategory based on type
function getFileSubcategory(file) {
    const type = file.type.toLowerCase();
    
    if (type.startsWith('image/')) {
        return 'gallery';
    } else if (type.startsWith('video/')) {
        return 'profile';
    } else if (type.includes('pdf')) {
        return 'cv';
    } else {
        return 'files';
    }
}

// Drag & Drop handlers
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#6366f1';
    event.currentTarget.style.backgroundColor = '#f0f9ff';
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#6366f1';
    event.currentTarget.style.backgroundColor = '#f8f9ff';
}

function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#6366f1';
    event.currentTarget.style.backgroundColor = '#f8f9ff';
    
    const files = event.dataTransfer.files;
    console.log('📤 Files dropped:', files);
    
    if (files.length > 0) {
        handleFileUpload(files);
    }
}

// Upload progress functions
function showUploadProgress() {
    const progressDiv = document.getElementById('upload-progress');
    if (progressDiv) {
        progressDiv.style.display = 'block';
    }
}

function updateUploadProgress(percentage) {
    const progressBar = document.getElementById('upload-progress-bar');
    const percentageSpan = document.getElementById('upload-percentage');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    if (percentageSpan) {
        percentageSpan.textContent = `${Math.round(percentage)}%`;
    }
}

function updateUploadStatus(status) {
    const statusDiv = document.getElementById('upload-status');
    if (statusDiv) {
        statusDiv.textContent = status;
    }
}

// Update media grid
function updateMediaGrid() {
    console.log('🔄 Updating media grid...');
    
    // Get all media from localStorage
    const mediaItems = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('media_')) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                mediaItems.push({ key, ...item });
            } catch (error) {
                console.warn('⚠️ Invalid media item:', key);
            }
        }
    }
    
    // Update grid
    const grid = document.getElementById('media-grid');
    if (grid) {
        grid.innerHTML = '';
        
        mediaItems.forEach(item => {
            const card = createMediaCard(item);
            grid.appendChild(card);
        });
    }
    
    // Update category counts
    updateCategoryCounts(mediaItems);
}

// Create media card
function createMediaCard(item) {
    const card = document.createElement('div');
    card.className = 'media-card';
    card.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
        cursor: pointer;
    `;
    
    card.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">
                ${getFileIcon(item.type)}
            </div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #333; word-break: break-all;">
                ${item.name}
            </h4>
            <p style="margin: 0; font-size: 0.8rem; color: #666;">
                ${formatFileSize(item.size)}
            </p>
            <div style="margin-top: 0.5rem;">
                <span style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; color: #666;">
                    ${item.category}
                </span>
            </div>
        </div>
    `;
    
    // Add click handler
    card.onclick = () => {
        if (item.data) {
            // Open file in new tab
            const newWindow = window.open();
            newWindow.document.write(`
                <html>
                    <head><title>${item.name}</title></head>
                    <body style="margin: 0; padding: 1rem; text-align: center;">
                        <img src="${item.data}" style="max-width: 100%; height: auto;" />
                    </body>
                </html>
            `);
        }
    };
    
    return card;
}

// Get file icon based on type
function getFileIcon(type) {
    if (type.startsWith('image/')) {
        return '🖼️';
    } else if (type.startsWith('video/')) {
        return '🎥';
    } else if (type.includes('pdf')) {
        return '📄';
    } else if (type.includes('document')) {
        return '📝';
    } else {
        return '📁';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update category counts
function updateCategoryCounts(mediaItems) {
    const categories = ['profile', 'application', 'portfolio', 'documents', 'gallery', 'videos', 'analytics'];
    
    categories.forEach(category => {
        const count = mediaItems.filter(item => item.category === category).length;
        const countElement = document.getElementById(`${category}-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize media system
function initializeMediaSystem() {
    console.log('🚀 Initializing media system...');
    
    // Update media grid on load
    updateMediaGrid();
    
    // Add event listeners
    const dragDropZone = document.getElementById('dragDropZone');
    if (dragDropZone) {
        dragDropZone.addEventListener('dragover', handleDragOver);
        dragDropZone.addEventListener('dragleave', handleDragLeave);
        dragDropZone.addEventListener('drop', handleFileDrop);
    }
    
    console.log('✅ Media system initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeMediaSystem);

console.log('📸 Media Upload Functions loaded');
