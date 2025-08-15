class NetlifyStorage {
    constructor() {
        this.baseUrl = window.location.origin;
        this.onlineImages = new Map(); // Cache für online gespeicherte Bilder
        this.init();
    }

    init() {
        // Lade online gespeicherte Bilder beim Start
        this.loadOnlineImages();
        
        // Überwache Online/Offline-Status
        window.addEventListener('online', () => {
            console.log('🌐 Online - Lade online gespeicherte Bilder neu');
            this.loadOnlineImages();
        });
    }

    // Lade alle online gespeicherten Bilder
    async loadOnlineImages() {
        if (!navigator.onLine) {
            console.log('📴 Offline - Verwende gecachte online Bilder');
            return;
        }

        try {
            console.log('🔄 Lade online gespeicherte Bilder...');
            
            // Lade alle Aktivitätsbilder
            const activities = ['wohnmobil', 'fotobox', 'sup', 'ebike'];
            
            for (const activity of activities) {
                await this.loadActivityImagesFromOnline(activity);
            }
            
            console.log('✅ Online gespeicherte Bilder geladen');
        } catch (error) {
            console.error('❌ Fehler beim Laden der online Bilder:', error);
        }
    }

    // Lade Aktivitätsbilder aus dem Online-Speicher
    async loadActivityImagesFromOnline(activityName) {
        try {
            // Versuche, Bilder aus dem Online-Speicher zu laden
            const onlineImages = await this.getOnlineActivityImages(activityName);
            
            if (onlineImages && onlineImages.length > 0) {
                this.onlineImages.set(activityName, onlineImages);
                console.log(`✅ ${onlineImages.length} online Bilder für ${activityName} geladen`);
            } else {
                console.log(`ℹ️ Keine online Bilder für ${activityName} gefunden`);
            }
        } catch (error) {
            console.log(`⚠️ Konnte online Bilder für ${activityName} nicht laden:`, error);
        }
    }

    // Hole Aktivitätsbilder aus dem Online-Speicher
    async getOnlineActivityImages(activityName) {
        try {
            // Verwende Netlify Functions oder externe API
            const response = await fetch(`/api/activity-images?activity=${activityName}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.images || [];
            } else {
                // Fallback: Versuche localStorage als Online-Speicher zu verwenden
                return this.getLocalStorageAsOnline(activityName);
            }
        } catch (error) {
            console.log(`⚠️ Online-API nicht verfügbar für ${activityName}, verwende Fallback`);
            return this.getLocalStorageAsOnline(activityName);
        }
    }

    // Fallback: Verwende localStorage als Online-Speicher
    getLocalStorageAsOnline(activityName) {
        try {
            const storageKey = `${activityName}_images`;
            const images = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Markiere als online gespeichert
            return images.map(img => ({
                ...img,
                isOnline: true,
                lastSynced: new Date().toISOString()
            }));
        } catch (error) {
            console.error('❌ Fehler beim Laden aus localStorage:', error);
            return [];
        }
    }

    // Speichere Aktivitätsbilder online
    async saveActivityImagesOnline(activityName, images) {
        try {
            if (!navigator.onLine) {
                console.log('📴 Offline - Speichere Bilder lokal für späteren Upload');
                this.saveForLaterUpload(activityName, images);
                return { success: false, message: 'Offline - wird später hochgeladen' };
            }

            console.log(`🔄 Speichere ${images.length} Bilder für ${activityName} online...`);

            // Versuche Online-Speicherung
            const response = await fetch('/api/activity-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    activity: activityName,
                    images: images,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                // Aktualisiere lokalen Cache
                this.onlineImages.set(activityName, images);
                
                // Markiere als online gespeichert
                const onlineImages = images.map(img => ({
                    ...img,
                    isOnline: true,
                    lastSynced: new Date().toISOString()
                }));

                // Speichere auch lokal als Backup
                this.saveLocalBackup(activityName, onlineImages);
                
                console.log(`✅ ${images.length} Bilder für ${activityName} online gespeichert`);
                return { success: true, message: 'Bilder online gespeichert!' };
            } else {
                throw new Error('Online-Speicherung fehlgeschlagen');
            }
        } catch (error) {
            console.error('❌ Fehler bei Online-Speicherung:', error);
            
            // Fallback: Lokale Speicherung
            this.saveLocalBackup(activityName, images);
            return { success: false, message: 'Offline gespeichert (Fallback)' };
        }
    }

    // Speichere Bilder für späteren Upload
    saveForLaterUpload(activityName, images) {
        const pendingKey = `${activityName}_pending_upload`;
        const pendingImages = JSON.parse(localStorage.getItem(pendingKey) || '[]');
        
        // Füge neue Bilder hinzu
        const newPendingImages = [...pendingImages, ...images];
        localStorage.setItem(pendingKey, JSON.stringify(newPendingImages));
        
        console.log(`💾 ${images.length} Bilder für späteren Upload gespeichert`);
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

    // Lade alle verfügbaren Bilder (Online + Lokal)
    async loadAllActivityImages(activityName) {
        try {
            console.log(`🔄 Lade alle Bilder für ${activityName}...`);
            
            let allImages = [];
            
            // 1. PRIORITÄT: Online gespeicherte Bilder
            const onlineImages = this.onlineImages.get(activityName) || [];
            if (onlineImages.length > 0) {
                console.log(`📸 ${onlineImages.length} online Bilder gefunden`);
                allImages.push(...onlineImages);
            }
            
            // 2. PRIORITÄT: Lokale Bilder (falls keine online verfügbar)
            if (allImages.length === 0) {
                const localImages = this.getLocalStorageAsOnline(activityName);
                if (localImages.length > 0) {
                    console.log(`📸 ${localImages.length} lokale Bilder gefunden`);
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

    // Synchronisiere alle ausstehenden Uploads
    async syncPendingUploads() {
        if (!navigator.onLine) {
            console.log('📴 Offline - Synchronisation nicht möglich');
            return;
        }

        try {
            console.log('🔄 Synchronisiere ausstehende Uploads...');
            
            const activities = ['wohnmobil', 'fotobox', 'sup', 'ebike'];
            let totalSynced = 0;
            
            for (const activity of activities) {
                const pendingKey = `${activity}_pending_upload`;
                const pendingImages = JSON.parse(localStorage.getItem(pendingKey) || '[]');
                
                if (pendingImages.length > 0) {
                    console.log(`📤 Synchronisiere ${pendingImages.length} Bilder für ${activity}...`);
                    
                    const result = await this.saveActivityImagesOnline(activity, pendingImages);
                    
                    if (result.success) {
                        // Lösche ausstehende Uploads nach erfolgreicher Synchronisation
                        localStorage.removeItem(pendingKey);
                        totalSynced += pendingImages.length;
                        console.log(`✅ ${pendingImages.length} Bilder für ${activity} synchronisiert`);
                    }
                }
            }
            
            if (totalSynced > 0) {
                console.log(`🎉 Insgesamt ${totalSynced} Bilder synchronisiert`);
            } else {
                console.log('ℹ️ Keine ausstehenden Uploads gefunden');
            }
            
        } catch (error) {
            console.error('❌ Fehler bei der Synchronisation:', error);
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
