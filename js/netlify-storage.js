class NetlifyStorage {
    constructor() {
        this.baseUrl = window.location.origin;
        this.init();
    }

    init() {
        console.log('🚀 Netlify Storage initialisiert');
        // Lade gespeicherte Bilder beim Start
        this.loadAllStoredImages();
    }

    // Lade alle gespeicherten Bilder aus Netlify-Forms
    async loadAllStoredImages() {
        try {
            console.log('🔄 Lade alle gespeicherten Bilder...');
            
            const activities = ['wohnmobil', 'fotobox', 'sup', 'ebike'];
            
            for (const activity of activities) {
                await this.loadActivityImagesFromNetlify(activity);
            }
            
            console.log('✅ Alle gespeicherten Bilder geladen');
        } catch (error) {
            console.error('❌ Fehler beim Laden der Bilder:', error);
        }
    }

    // Lade Aktivitätsbilder aus Netlify-Forms
    async loadActivityImagesFromNetlify(activityName) {
        try {
            console.log(`🔄 Lade ${activityName} Bilder aus Netlify...`);
            
            // Verwende Netlify-Form-Daten (falls verfügbar)
            const netlifyData = this.getNetlifyFormData(activityName);
            
            if (netlifyData && netlifyData.length > 0) {
                console.log(`✅ ${netlifyData.length} Netlify-Bilder für ${activityName} gefunden`);
                return netlifyData;
            } else {
                console.log(`ℹ️ Keine Netlify-Bilder für ${activityName} gefunden`);
                return [];
            }
        } catch (error) {
            console.error(`❌ Fehler beim Laden der ${activityName} Bilder:`, error);
            return [];
        }
    }

    // Hole Netlify-Form-Daten (Simulation - in der Praxis würden diese von Netlify kommen)
    getNetlifyFormData(activityName) {
        // Da Netlify-Forms die Daten nicht direkt zurückgeben können,
        // verwenden wir eine Kombination aus localStorage und Netlify-Form-Submission
        try {
            const storageKey = `${activityName}_netlify_images`;
            const images = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return images;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Netlify-Form-Daten:', error);
            return [];
        }
    }

    // Speichere Aktivitätsbilder bei Netlify (Hauptfunktion)
    async saveActivityImagesToNetlify(activityName, images) {
        try {
            console.log(`🔄 Speichere ${images.length} Bilder für ${activityName} bei Netlify...`);
            
            if (!navigator.onLine) {
                throw new Error('Keine Internetverbindung verfügbar');
            }

            // 1. Sende an Netlify-Form
            const formResult = await this.submitToNetlifyForm(activityName, images);
            
            if (formResult.success) {
                // 2. Speichere auch lokal als Backup (für sofortige Anzeige)
                this.saveLocalBackup(activityName, images);
                
                // 3. Markiere als Netlify-gespeichert
                this.markAsNetlifySaved(activityName, images);
                
                console.log(`✅ ${images.length} Bilder für ${activityName} erfolgreich bei Netlify gespeichert`);
                return { success: true, message: 'Bilder bei Netlify gespeichert!' };
            } else {
                throw new Error('Netlify-Form-Submission fehlgeschlagen');
            }
            
        } catch (error) {
            console.error('❌ Fehler bei Netlify-Speicherung:', error);
            
            // Fallback: Lokale Speicherung
            this.saveLocalBackup(activityName, images);
            return { success: false, message: 'Lokal gespeichert (Netlify-Fehler)' };
        }
    }

    // Sende Daten an Netlify-Form
    async submitToNetlifyForm(activityName, images) {
        try {
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

    // Speichere lokales Backup
    saveLocalBackup(activityName, images) {
        try {
            const storageKey = `${activityName}_images`;
            localStorage.setItem(storageKey, JSON.stringify(images));
            console.log(`💾 Lokales Backup für ${activityName} erstellt`);
        } catch (error) {
            console.error('❌ Fehler beim lokalen Backup:', error);
        }
    }

    // Markiere Bilder als Netlify-gespeichert
    markAsNetlifySaved(activityName, images) {
        try {
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

    // Lade alle verfügbaren Bilder (Netlify + Lokal)
    async loadAllActivityImages(activityName) {
        try {
            console.log(`🔄 Lade alle Bilder für ${activityName}...`);
            
            let allImages = [];
            
            // 1. PRIORITÄT: Netlify-gespeicherte Bilder
            const netlifyImages = this.getNetlifyFormData(activityName);
            if (netlifyImages.length > 0) {
                console.log(`🌐 ${netlifyImages.length} Netlify-Bilder gefunden`);
                allImages.push(...netlifyImages);
            }
            
            // 2. PRIORITÄT: Lokale Backup-Bilder (falls keine Netlify verfügbar)
            if (allImages.length === 0) {
                const localImages = this.getLocalBackup(activityName);
                if (localImages.length > 0) {
                    console.log(`📱 ${localImages.length} lokale Backup-Bilder gefunden`);
                    allImages.push(...localImages);
                }
            }
            
            // 3. PRIORITÄT: Standard-Bilder (falls gar keine verfügbar)
            if (allImages.length === 0) {
                const defaultImages = await this.getDefaultImages(activityName);
                if (defaultImages.length > 0) {
                    console.log(`📸 ${defaultImages.length} Standard-Bilder gefunden`);
                    allImages.push(...defaultImages);
                }
            }
            
            console.log(`✅ Insgesamt ${allImages.length} Bilder für ${activityName} geladen`);
            return allImages;
            
        } catch (error) {
            console.error('❌ Fehler beim Laden aller Bilder:', error);
            return [];
        }
    }

    // Hole lokales Backup
    getLocalBackup(activityName) {
        try {
            const storageKey = `${activityName}_images`;
            const images = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return images;
        } catch (error) {
            console.error('❌ Fehler beim Laden des lokalen Backups:', error);
            return [];
        }
    }

    // Hole Standard-Bilder
    async getDefaultImages(activityName) {
        const defaultImages = {
            'wohnmobil': [
                {
                    src: './images/wohnmobil/wohnmobil-exterior.jpg',
                    alt: 'Wohnmobil Außenansicht',
                    title: 'Wohnmobil Außenansicht',
                    description: 'Gemütliches Wohnmobil für Ihre Reisen',
                    filename: 'wohnmobil-exterior.jpg',
                    isDefault: true
                }
            ],
            'fotobox': [
                {
                    src: './images/fotobox/fotobox-1.jpg',
                    alt: 'Fotobox',
                    title: 'Professionelle Fotobox',
                    description: 'Perfekt für Events und Feiern',
                    filename: 'fotobox-1.jpg',
                    isDefault: true
                }
            ],
            'sup': [
                {
                    src: './images/sup/sup-1.jpg',
                    alt: 'Stand-Up-Paddle',
                    title: 'Stand-Up-Paddle',
                    description: 'Entdecken Sie das Wasser',
                    filename: 'sup-1.jpg',
                    isDefault: true
                }
            ],
            'ebike': [
                {
                    src: './images/ebike/ebike-1.jpg',
                    alt: 'E-Bike',
                    title: 'E-Bike',
                    description: 'Elektrisch unterstütztes Radfahren',
                    filename: 'ebike-1.jpg',
                    isDefault: true
                }
            ]
        };

        return defaultImages[activityName] || [];
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
