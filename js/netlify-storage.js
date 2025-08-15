class NetlifyStorage {
    constructor() {
        this.baseUrl = window.location.origin;
        this.init();
    }

    init() {
        console.log('🚀 Netlify Storage initialisiert - NUR ONLINE SPEICHERUNG');
    }

    // Speichere Aktivitätsbilder bei Netlify (Hauptfunktion)
    async saveActivityImagesToNetlify(activityName, images) {
        try {
            console.log(`🔄 Speichere ${images.length} Bilder für ${activityName} bei Netlify...`);
            
            if (!navigator.onLine) {
                throw new Error('Keine Internetverbindung verfügbar');
            }

            // Sende an Netlify-Form
            const formResult = await this.submitToNetlifyForm(activityName, images);
            
            if (formResult.success) {
                console.log(`✅ ${images.length} Bilder für ${activityName} erfolgreich bei Netlify gespeichert`);
                return { success: true, message: 'Bilder bei Netlify gespeichert!' };
            } else {
                throw new Error('Netlify-Form-Submission fehlgeschlagen');
            }
            
        } catch (error) {
            console.error('❌ Fehler bei Netlify-Speicherung:', error);
            throw error; // Kein Fallback mehr!
        }
    }

    // Sende Daten an Netlify-Form
    async submitToNetlifyForm(activityName, images) {
        try {
            console.log(`📤 Sende ${images.length} Bilder für ${activityName} an Netlify...`);
            
            const formData = new FormData();
            formData.append('form-name', 'activity-images');
            formData.append('activity-name', activityName);
            formData.append('images-data', JSON.stringify(images));
            formData.append('timestamp', new Date().toISOString());
            formData.append('image-count', images.length.toString());

            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });

            if (response.ok) {
                console.log(`✅ Netlify-Form erfolgreich gesendet für ${activityName}`);
                return { success: true };
            } else {
                throw new Error(`Netlify-Form-Fehler: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Fehler beim Senden an Netlify-Form:', error);
            throw error;
        }
    }

    // Lade alle verfügbaren Bilder (NUR aus Netlify)
    async loadAllActivityImages(activityName) {
        try {
            console.log(`🔄 Lade Bilder für ${activityName} aus Netlify...`);
            
            // Versuche, Bilder aus Netlify zu laden
            const netlifyImages = await this.loadImagesFromNetlify(activityName);
            
            if (netlifyImages && netlifyImages.length > 0) {
                console.log(`✅ ${netlifyImages.length} Netlify-Bilder für ${activityName} geladen`);
                return netlifyImages;
            } else {
                console.log(`ℹ️ Keine Netlify-Bilder für ${activityName} gefunden`);
                return [];
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Bilder:', error);
            return [];
        }
    }

    // Lade Bilder aus Netlify (Simulation - da Netlify-Forms keine GET-API haben)
    async loadImagesFromNetlify(activityName) {
        try {
            // Da Netlify-Forms keine direkte GET-API haben, verwenden wir eine andere Strategie:
            // Wir speichern die Bilder in einer globalen Variable, die beim Laden der Seite verfügbar ist
            
            // Versuche, Bilder aus dem globalen Netlify-Speicher zu laden
            if (window.netlifyImageStorage && window.netlifyImageStorage[activityName]) {
                return window.netlifyImageStorage[activityName];
            }
            
            // Fallback: Versuche localStorage (aber nur für bereits gespeicherte Netlify-Bilder)
            const storageKey = `${activityName}_netlify_images`;
            const netlifyImages = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (netlifyImages.length > 0) {
                // Initialisiere globalen Speicher
                if (!window.netlifyImageStorage) {
                    window.netlifyImageStorage = {};
                }
                window.netlifyImageStorage[activityName] = netlifyImages;
                return netlifyImages;
            }
            
            return [];
        } catch (error) {
            console.error('❌ Fehler beim Laden der Netlify-Bilder:', error);
            return [];
        }
    }

    // Markiere Bilder als Netlify-gespeichert
    markAsNetlifySaved(activityName, images) {
        try {
            // Speichere in globalem Speicher
            if (!window.netlifyImageStorage) {
                window.netlifyImageStorage = {};
            }
            window.netlifyImageStorage[activityName] = images;
            
            // Speichere auch in localStorage als Backup
            const storageKey = `${activityName}_netlify_images`;
            const netlifyImages = images.map(img => ({
                ...img,
                isNetlifySaved: true,
                netlifySavedAt: new Date().toISOString()
            }));
            localStorage.setItem(storageKey, JSON.stringify(netlifyImages));
            
            console.log(`🌐 ${activityName} Bilder als Netlify-gespeichert markiert`);
        } catch (error) {
            console.error('❌ Fehler beim Markieren als Netlify-gespeichert:', error);
        }
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
                
                // Speichere auch lokal als Backup
                localStorage.setItem('profileImage', imageData);
                localStorage.setItem('profileImageUploaded', 'true');
                localStorage.setItem('profileImageNetlifyTime', new Date().toISOString());
                
                return { success: true, message: 'Profilbild gespeichert!' };
            } else {
                throw new Error('Netlify Form submission failed');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern bei Netlify:', error);
            throw error; // Kein Fallback mehr!
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
                
                // Speichere auch lokal als Backup
                localStorage.setItem('websiteData', JSON.stringify(contentData));
                
                return { success: true, message: 'Website-Daten gespeichert!' };
            } else {
                throw new Error('Netlify Form submission failed');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern bei Netlify:', error);
            throw error; // Kein Fallback mehr!
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
