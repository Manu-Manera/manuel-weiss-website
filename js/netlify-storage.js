class NetlifyStorage {
    constructor() {
        this.baseUrl = window.location.origin;
    }

    // Save profile image to Netlify
    async saveProfileImage(imageData, filename = 'profile-image') {
        try {
            const formData = new FormData();
            formData.append('form-name', 'profile-images');
            formData.append('image-data', imageData);
            formData.append('filename', filename);
            formData.append('upload-time', new Date().toISOString());

            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                console.log('✅ Profilbild erfolgreich bei Netlify gespeichert');
                
                // Also save to localStorage as backup
                localStorage.setItem('profileImage', imageData);
                localStorage.setItem('profileImageUploaded', 'true');
                localStorage.setItem('profileImageNetlifyTime', new Date().toISOString());
                
                return { success: true, message: 'Profilbild gespeichert!' };
            } else {
                throw new Error('Netlify Form submission failed');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern bei Netlify:', error);
            
            // Fallback to localStorage
            localStorage.setItem('profileImage', imageData);
            localStorage.setItem('profileImageUploaded', 'true');
            console.log('💾 Fallback: Profilbild in localStorage gespeichert');
            
            return { success: false, message: 'Offline gespeichert (Fallback)' };
        }
    }

    // Save website content to Netlify
    async saveWebsiteContent(contentData) {
        try {
            const formData = new FormData();
            formData.append('form-name', 'admin-data');
            formData.append('data-type', 'website-content');
            formData.append('website-content', JSON.stringify(contentData));
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                console.log('✅ Website-Daten erfolgreich bei Netlify gespeichert');
                
                // Also save to localStorage as backup
                localStorage.setItem('websiteData', JSON.stringify(contentData));
                
                return { success: true, message: 'Website-Daten gespeichert!' };
            } else {
                throw new Error('Netlify Form submission failed');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern bei Netlify:', error);
            
            // Fallback to localStorage
            localStorage.setItem('websiteData', JSON.stringify(contentData));
            console.log('💾 Fallback: Website-Daten in localStorage gespeichert');
            
            return { success: false, message: 'Offline gespeichert (Fallback)' };
        }
    }

    // Save activity images to Netlify
    async saveActivityImages(activityName, images) {
        try {
            const formData = new FormData();
            formData.append('form-name', 'activity-images');
            formData.append('activity-name', activityName);
            formData.append('images-data', JSON.stringify(images));
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                console.log(`✅ ${activityName} Bilder erfolgreich bei Netlify gespeichert`);
                return { success: true, message: `${activityName} Bilder gespeichert!` };
            } else {
                throw new Error('Netlify Form submission failed');
            }
        } catch (error) {
            console.error(`❌ Fehler beim Speichern der ${activityName} Bilder bei Netlify:`, error);
            return { success: false, message: 'Offline gespeichert (Fallback)' };
        }
    }

    // Save global image database to Netlify
    async saveGlobalImageDatabase(images) {
        try {
            const formData = new FormData();
            formData.append('form-name', 'global-images');
            formData.append('images-data', JSON.stringify(images));
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                console.log('✅ Globale Bilddatenbank erfolgreich bei Netlify gespeichert');
                return { success: true, message: 'Bilddatenbank gespeichert!' };
            } else {
                throw new Error('Netlify Form submission failed');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern der Bilddatenbank bei Netlify:', error);
            return { success: false, message: 'Offline gespeichert (Fallback)' };
        }
    }

    // Load profile image (try Netlify, fallback to localStorage)
    async loadProfileImage() {
        try {
            // First try localStorage (faster)
            const localImage = localStorage.getItem('profileImage');
            const hasUploaded = localStorage.getItem('profileImageUploaded') === 'true';
            
            if (localImage && hasUploaded && localImage.startsWith('data:image/')) {
                console.log('✅ Profilbild aus localStorage geladen');
                return localImage;
            }
            
            // TODO: In a future version, we could fetch from Netlify API
            // For now, localStorage is the primary storage
            
            return null;
        } catch (error) {
            console.error('❌ Fehler beim Laden des Profilbilds:', error);
            return null;
        }
    }

    // Show notification helper
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Global instance
window.netlifyStorage = new NetlifyStorage();
