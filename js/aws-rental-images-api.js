/**
 * AWS Rental Images API
 * API-First System für Rental-Bilder (wie Profilbilder)
 * 
 * Verwendet:
 * - DynamoDB für Metadaten
 * - S3 für Bild-Speicherung
 * - Presigned URLs für Uploads
 */

class AWSRentalImagesAPI {
    constructor() {
        this.isInitialized = false;
        this.apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl || '';
        this.initPromise = null;
    }

    /**
     * Initialisierung
     */
    async init() {
        if (this.isInitialized) return;
        
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._initialize();
        return this.initPromise;
    }

    async _initialize() {
        try {
            if (!this.apiBaseUrl) {
                console.warn('⚠️ AWS API Base URL nicht konfiguriert');
                this.isInitialized = true;
                return;
            }
            
            this.isInitialized = true;
            console.log('✅ AWS Rental Images API initialisiert');
        } catch (error) {
            console.error('❌ Fehler bei Initialisierung:', error);
            this.isInitialized = true; // Trotzdem als initialisiert markieren
        }
    }

    async waitForInit() {
        if (!this.isInitialized) {
            await this.init();
        }
    }

    /**
     * Lade alle Bilder für einen Rental-Typ
     */
    async getRentalImages(rentalType) {
        await this.waitForInit();
        
        if (!this.apiBaseUrl) {
            throw new Error('API Base URL nicht konfiguriert');
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/rentals/${rentalType}/images`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Fehler beim Laden der Rental-Bilder:', error);
            throw error;
        }
    }

    /**
     * Upload Bild zu S3
     */
    async uploadRentalImage(file, rentalType) {
        await this.waitForInit();
        
        if (!this.apiBaseUrl) {
            throw new Error('API Base URL nicht konfiguriert');
        }
        
        try {
            console.log(`📤 Uploading rental image: ${file.name} für ${rentalType}`);
            
            // 1. Generiere Presigned URL
            const presignResponse = await fetch(`${this.apiBaseUrl}/rentals/${rentalType}/images/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type
                })
            });
            
            if (!presignResponse.ok) {
                throw new Error('Failed to get upload URL');
            }
            
            const { uploadUrl, imageUrl, imageKey } = await presignResponse.json();
            
            // 2. Upload direkt zu S3
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image to S3');
            }
            
            // 3. Speichere Metadaten in DynamoDB
            const saveResponse = await fetch(`${this.apiBaseUrl}/rentals/${rentalType}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageUrl,
                    imageKey,
                    filename: file.name,
                    uploadedAt: new Date().toISOString()
                })
            });
            
            if (!saveResponse.ok) {
                throw new Error('Failed to save image metadata');
            }
            
            const savedData = await saveResponse.json();
            
            console.log('✅ Rental image uploaded successfully');
            return {
                url: imageUrl,
                imageKey,
                id: savedData.image?.id,
                ...savedData.image
            };
            
        } catch (error) {
            console.error('❌ Fehler beim Upload:', error);
            throw error;
        }
    }

    /**
     * Setze Hauptbild
     */
    async setDisplayImage(rentalType, imageUrl) {
        await this.waitForInit();
        
        if (!this.apiBaseUrl) {
            throw new Error('API Base URL nicht konfiguriert');
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/rentals/${rentalType}/images/display`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageUrl
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Fehler beim Setzen des Hauptbilds:', error);
            throw error;
        }
    }

    /**
     * Lösche Bild
     */
    async deleteRentalImage(rentalType, imageId) {
        await this.waitForInit();
        
        if (!this.apiBaseUrl) {
            throw new Error('API Base URL nicht konfiguriert');
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/rentals/${rentalType}/images/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Fehler beim Löschen des Bilds:', error);
            throw error;
        }
    }
}

// Globale Instanz erstellen
window.awsRentalImagesAPI = new AWSRentalImagesAPI();

// Initialisierung beim Laden
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.awsRentalImagesAPI.init();
    });
} else {
    window.awsRentalImagesAPI.init();
}

console.log('✅ AWS Rental Images API geladen');

