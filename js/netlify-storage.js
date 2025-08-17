class NetlifyStorage {
    constructor() {
        this.baseUrl = window.location.origin;
        this.isNetlify = window.location.hostname.includes('netlify.app');
        this.apiEndpoint = this.isNetlify ? '/.netlify/functions/images' : '/api/images';
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

            // Verwende Netlify-Form für echte Website
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
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Markiere als gespeichert
                this.markAsNetlifySaved(activityName, images);
                
                return { success: true, message: 'Bilder lokal gespeichert (Entwicklung)' };
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

    // Lade alle verfügbaren Bilder von Netlify
    async loadAllActivityImages(activityName) {
        try {
            console.log(`🔄 Lade Bilder für ${activityName} von Netlify...`);
            
            if (this.isNetlify) {
                // Auf echter Netlify-Website: Verwende API
                const images = await this.fetchImagesFromNetlify(activityName);
                if (images && images.length > 0) {
                    console.log(`✅ ${images.length} Bilder von Netlify geladen`);
                    return images;
                }
            } else {
                // Lokale Entwicklung: Verwende simulierte Daten
                console.log('🔄 Lokale Entwicklung: Verwende simulierte Netlify-Daten...');
                const simulatedImages = await this.getSimulatedNetlifyImages(activityName);
                if (simulatedImages && simulatedImages.length > 0) {
                    console.log(`✅ ${simulatedImages.length} simulierte Bilder geladen`);
                    return simulatedImages;
                }
            }
            
            console.log(`ℹ️ Keine Bilder für ${activityName} gefunden`);
            return [];
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Bilder von Netlify:', error);
            return [];
        }
    }

    // Hole Bilder von Netlify API
    async fetchImagesFromNetlify(activityName) {
        try {
            console.log(`🌐 Hole Bilder von Netlify API für ${activityName}...`);
            
            // Versuche verschiedene API-Endpunkte
            const endpoints = [
                `/.netlify/functions/get-images?activity=${activityName}`,
                `/api/images?activity=${activityName}`,
                `/.netlify/functions/images?activity=${activityName}`
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.images && data.images.length > 0) {
                            console.log(`✅ Bilder von ${endpoint} geladen`);
                            return data.images;
                        }
                    }
                } catch (error) {
                    console.log(`⚠️ Endpoint ${endpoint} nicht verfügbar`);
                }
            }
            
            // Fallback: Versuche Netlify-Form-Daten zu lesen
            return await this.readImagesFromNetlifyForm(activityName);
            
        } catch (error) {
            console.error('❌ Fehler beim Abrufen von Netlify API:', error);
            return [];
        }
    }

    // Lese Bilder aus Netlify-Form-Daten (Fallback)
    async readImagesFromNetlifyForm(activityName) {
        try {
            console.log(`📖 Versuche Bilder aus Netlify-Form-Daten zu lesen...`);
            
            // Da Netlify-Forms keine GET-API haben, verwenden wir einen anderen Ansatz
            // Hier könnten wir eine separate Funktion implementieren, die Bilder aus der Datenbank lädt
            
            return [];
        } catch (error) {
            console.error('❌ Fehler beim Lesen der Netlify-Form-Daten:', error);
            return [];
        }
    }

    // Simuliere Netlify-Bilder für lokale Entwicklung
    async getSimulatedNetlifyImages(activityName) {
        try {
            console.log(`🔄 Simuliere Netlify-Bilder für ${activityName}...`);
            
            // Für lokale Entwicklung können wir hier Beispieldaten zurückgeben
            // In der Produktion würden diese von Netlify kommen
            
            return [];
        } catch (error) {
            console.error('❌ Fehler bei simulierten Netlify-Bildern:', error);
            return [];
        }
    }

    // Markiere Bilder als Netlify-gespeichert
    markAsNetlifySaved(activityName, images) {
        try {
            // Speichere in globalem Speicher für lokale Entwicklung
            if (!window.netlifyImageStorage) {
                window.netlifyImageStorage = {};
            }
            window.netlifyImageStorage[activityName] = images;
            
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
                return { success: true, message: 'Profilbild gespeichert!' };
            } else {
                throw new Error('Netlify Form submission failed');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern bei Netlify:', error);
            throw error;
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
                return { success: true, message: 'Website-Daten gespeichert!' };
            } else {
                throw new Error('Netlify Form submission failed');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern bei Netlify:', error);
            throw error;
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
            throw error;
        }
    }

    // Load profile image from Netlify
    async loadProfileImage() {
        try {
            if (this.isNetlify) {
                // Versuche, Profilbild von Netlify zu laden
                const response = await fetch('/.netlify/functions/get-profile-image');
                if (response.ok) {
                    const data = await response.json();
                    if (data.imageData) {
                        console.log('✅ Profilbild von Netlify geladen');
                        return data.imageData;
                    }
                }
            }
            
            // Fallback: Kein Profilbild verfügbar
            console.log('ℹ️ Kein Profilbild von Netlify verfügbar');
            return null;
            
        } catch (error) {
            console.error('❌ Fehler beim Laden des Profilbilds von Netlify:', error);
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
