class ImageUploadHandler {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.setupProfileImageUpload();
        this.setupGalleryUploads();
    }

    setupProfileImageUpload() {
        const profileInput = document.getElementById('profile-input');
        const profileUpload = document.getElementById('profile-upload');
        
        if (profileUpload && profileInput) {
            profileUpload.addEventListener('click', () => {
                profileInput.click();
            });
            
            profileInput.addEventListener('change', (e) => {
                this.handleProfileImageUpload(e);
            });
        }
    }

    setupGalleryUploads() {
        // Setup für alle Activity-Galerien
        ['wohnmobil', 'fotobox', 'sup', 'ebike'].forEach(activity => {
            const uploadInput = document.getElementById(`${activity}-file-upload`);
            if (uploadInput) {
                uploadInput.addEventListener('change', (e) => {
                    this.handleGalleryUpload(e, activity);
                });
            }
        });
    }

    handleProfileImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.validateFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            // Update preview in admin
            const preview = document.getElementById('profile-preview');
            if (preview) {
                preview.src = imageData;
            }
            
            // Save to localStorage with multiple keys for reliability
            this.saveProfileImage(imageData);
            
            // Update main website immediately
            this.updateMainWebsiteProfileImage(imageData);
            
            this.showSuccess('Profilbild erfolgreich hochgeladen!');
        };
        
        reader.readAsDataURL(file);
    }

    handleGalleryUpload(event, activityName) {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        files.forEach(file => {
            if (!this.validateFile(file)) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                this.addImageToGallery(activityName, imageData, file.name);
            };
            
            reader.readAsDataURL(file);
        });
    }

    validateFile(file) {
        if (!this.allowedTypes.includes(file.type)) {
            this.showError('Nur Bilddateien sind erlaubt (JPG, PNG, GIF, WebP)');
            return false;
        }
        
        if (file.size > this.maxFileSize) {
            this.showError('Datei ist zu groß (max. 5MB)');
            return false;
        }
        
        return true;
    }

    saveProfileImage(imageData) {
        try {
            localStorage.setItem('profileImage', imageData);
            localStorage.setItem('mwps-profile-image', imageData);
            
            const websiteData = JSON.parse(localStorage.getItem('websiteData') || '{}');
            websiteData.profileImage = imageData;
            localStorage.setItem('websiteData', JSON.stringify(websiteData));
            
            console.log('✅ Profilbild in localStorage gespeichert');
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Profilbilds:', error);
            this.showError('Fehler beim Speichern des Bildes');
        }
    }

    updateMainWebsiteProfileImage(imageData) {
        try {
            // Try to update main website if in same domain
            if (window.opener || window.parent !== window) {
                window.postMessage({
                    type: 'updateProfileImage',
                    imageData: imageData
                }, '*');
            }
        } catch (error) {
            console.log('Cross-window communication not available');
        }
    }

    addImageToGallery(activityName, imageData, fileName) {
        const galleryContainer = document.getElementById(`${activityName}-images`);
        if (!galleryContainer) return;

        // Create image preview element
        const imagePreview = document.createElement('div');
        imagePreview.className = 'uploaded-image';
        imagePreview.innerHTML = `
            <div class="uploaded-image-preview">
                <img src="${imageData}" alt="${fileName}">
                <div class="image-actions">
                    <button class="image-action-btn delete" onclick="this.closest('.uploaded-image').remove()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="uploaded-image-info">
                <span>${fileName}</span>
            </div>
        `;

        // Insert before upload area
        const uploadArea = galleryContainer.querySelector('.image-upload');
        if (uploadArea) {
            galleryContainer.insertBefore(imagePreview, uploadArea);
        } else {
            galleryContainer.appendChild(imagePreview);
        }

        // Save to activity data
        this.saveActivityImage(activityName, imageData, fileName);
        
        this.showSuccess(`Bild zu ${activityName} hinzugefügt!`);
    }

    saveActivityImage(activityName, imageData, fileName) {
        try {
            const websiteData = JSON.parse(localStorage.getItem('websiteData') || '{}');
            
            if (!websiteData.activityImages) {
                websiteData.activityImages = {};
            }
            
            if (!websiteData.activityImages[activityName]) {
                websiteData.activityImages[activityName] = [];
            }
            
            websiteData.activityImages[activityName].push({
                id: Date.now(),
                fileName: fileName,
                imageData: imageData,
                uploadDate: new Date().toISOString()
            });
            
            localStorage.setItem('websiteData', JSON.stringify(websiteData));
            console.log(`✅ Bild für ${activityName} gespeichert`);
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Activity-Bildes:', error);
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageUploadHandler();
});
