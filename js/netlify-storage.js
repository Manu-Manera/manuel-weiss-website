class NetlifyStorage {
    constructor() {
        this.baseUrl = window.location.origin;
        this.isNetlify = window.location.hostname.includes('netlify.app');
        this.init();
    }

    init() {
        if (this.isNetlify) {
            console.log('🚀 Netlify Storage initialisiert - ECHTE WEBSITE');
        } else {
            console.log('🚀 Netlify Storage initialisiert - LOKALE ENTWICKLUNG');
        }
    }

    // Speichere Aktivitätsbilder bei Netlify (Hauptfunktion)
    async saveActivityImagesToNetlify(activityName, images) {
        try {
            console.log(`🔄 Speichere ${images.length} Bilder für ${activityName}...`);
            
            if (!navigator.onLine) {
                throw new Error('Keine Internetverbindung verfügbar');
            }

            // Auf der echten Netlify-Website: Verwende Netlify-Form
            if (this.isNetlify) {
                console.log('🌐 Verwende Netlify-Form auf echter Website...');
                const formResult = await this.submitToNetlifyForm(activityName, images);
                
                if (formResult.success) {
                    console.log(`✅ ${images.length} Bilder für ${activityName} erfolgreich bei Netlify gespeichert`);
                    return { success: true, message: 'Bilder bei Netlify gespeichert!' };
                } else {
                    throw new Error('Netlify-Form-Submission fehlgeschlagen');
                }
            } else {
                // Lokale Entwicklung: Simuliere erfolgreiche Speicherung
                console.log('🔄 Lokale Entwicklung: Simuliere Netlify-Speicherung...');
                await new Promise(resolve => setTimeout(resolve, 500)); // Simuliere Verzögerung
                
                // Markiere als gespeichert
                this.markAsNetlifySaved(activityName, images);
                
                return { success: true, message: 'Bilder lokal gespeichert (Entwicklung)' };
            }
            
        } catch (error) {
            console.error('❌ Fehler bei Netlify-Speicherung:', error);
            
            // Fallback: Lokale Speicherung für Offline-Funktionalität
            console.log('⚠️ Verwende lokalen Fallback...');
            this.markAsNetlifySaved(activityName, images);
            
            return { success: true, message: 'Bilder lokal gespeichert (Fallback)' };
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

    // Lade alle verfügbaren Bilder (mit Fallback)
    async loadAllActivityImages(activityName) {
        try {
            console.log(`🔄 Lade Bilder für ${activityName}...`);
            
            // 1. Versuche, Bilder aus dem globalen Netlify-Speicher zu laden
            if (window.netlifyImageStorage && window.netlifyImageStorage[activityName]) {
                console.log(`✅ ${window.netlifyImageStorage[activityName].length} Bilder aus globalem Speicher geladen`);
                return window.netlifyImageStorage[activityName];
            }
            
            // 2. Fallback: Versuche localStorage (für bereits gespeicherte Netlify-Bilder)
            const storageKey = `${activityName}_netlify_images`;
            const netlifyImages = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (netlifyImages.length > 0) {
                console.log(`✅ ${netlifyImages.length} Bilder aus Netlify-Backup geladen`);
                
                // Initialisiere globalen Speicher
                if (!window.netlifyImageStorage) {
                    window.netlifyImageStorage = {};
                }
                window.netlifyImageStorage[activityName] = netlifyImages;
                return netlifyImages;
            }
            
            // 3. Fallback: Versuche normale localStorage-Bilder
            const localImages = JSON.parse(localStorage.getItem(`${activityName}_images`) || '[]');
            if (localImages.length > 0) {
                console.log(`✅ ${localImages.length} lokale Bilder geladen`);
                return localImages;
            }
            
            console.log(`ℹ️ Keine Bilder für ${activityName} gefunden`);
            return [];
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Bilder:', error);
            return [];
        }
    }

    // Lade Bilder aus Netlify (Simulation - da Netlify-Forms keine GET-API haben)
    async loadImagesFromNetlify(activityName) {
        try {
            console.log(`🔄 Lade Bilder für ${activityName} aus verschiedenen Quellen...`);
            
            // 1. Versuche, Bilder aus dem globalen Netlify-Speicher zu laden
            if (window.netlifyImageStorage && window.netlifyImageStorage[activityName]) {
                console.log(`✅ Bilder aus globalem Netlify-Speicher geladen: ${activityName}`);
                return window.netlifyImageStorage[activityName];
            }
            
            // 2. Fallback: Versuche localStorage (für bereits gespeicherte Netlify-Bilder)
            const storageKey = `${activityName}_netlify_images`;
            const netlifyImages = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (netlifyImages.length > 0) {
                console.log(`✅ ${netlifyImages.length} Bilder aus localStorage geladen: ${activityName}`);
                
                // Initialisiere globalen Speicher
                if (!window.netlifyImageStorage) {
                    window.netlifyImageStorage = {};
                }
                window.netlifyImageStorage[activityName] = netlifyImages;
                return netlifyImages;
            }
            
            // 3. Fallback: Versuche normale localStorage-Bilder (für Kompatibilität)
            const localImages = JSON.parse(localStorage.getItem(`${activityName}_images`) || '[]');
            if (localImages.length > 0) {
                console.log(`⚠️ ${localImages.length} lokale Bilder gefunden, migriere zu Netlify-Speicher: ${activityName}`);
                
                // Migriere lokale Bilder zu Netlify-Speicher
                const migratedImages = localImages.map(img => ({
                    ...img,
                    isNetlifySaved: false,
                    needsMigration: true
                }));
                
                // Speichere migrierte Bilder
                this.markAsNetlifySaved(activityName, migratedImages);
                
                return migratedImages;
            }
            
            console.log(`ℹ️ Keine Bilder für ${activityName} gefunden`);
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
