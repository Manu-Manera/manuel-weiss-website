/**
 * 🚀 SMART MEDIA UPLOAD
 * Intelligente, konsolidierte Upload-Lösung für alle Medien-Typen
 * 
 * Unterstützt:
 * - Profilbilder (Profile Images)
 * - Service-Bilder (Service Images)
 * - Rental-Bilder (Rental Images)
 * - Dokumente (Documents)
 * - Galerie-Bilder (Gallery Images)
 * 
 * Features:
 * - AWS S3 Upload mit Presigned URLs
 * - Base64 Fallback bei Fehlern
 * - Automatische Kategorisierung
 * - Progress Tracking
 * - Error Handling
 * - LocalStorage Caching
 */

(function() {
    'use strict';

    /**
     * Smart Media Upload Class
     */
    class SmartMediaUpload {
        constructor() {
            // API Base aus verschiedenen Quellen holen
            const apiBase = window.AWS_APP_CONFIG?.API_BASE 
                         || window.AWS_APP_CONFIG?.MEDIA_API_BASE 
                         || window.awsMedia?.API_BASE 
                         || '';
            
            this.config = {
                apiBase: apiBase,
                maxFileSize: 10 * 1024 * 1024, // 10MB (erhöht für größere PDFs)
                allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
                allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                defaultUserId: 'owner'
            };
            
            this.uploadQueue = [];
            this.isUploading = false;
            
            console.log('🔧 Smart Media Upload initialisiert:', {
                apiBase: this.config.apiBase ? '✅ Konfiguriert' : '❌ Nicht konfiguriert',
                maxFileSize: `${this.config.maxFileSize / 1024 / 1024}MB`
            });
        }

        /**
         * Haupt-Upload-Funktion - automatisch Kategorie erkennen
         */
        async upload(file, options = {}) {
            const {
                category = this.detectCategory(file),
                userId = this.config.defaultUserId,
                metadata = {},
                onProgress = null,
                onSuccess = null,
                onError = null
            } = options;

            console.log(`📤 Smart Upload: ${file.name} → ${category}`);

            // Validierung
            if (!this.validateFile(file, category)) {
                const error = new Error('Datei-Validierung fehlgeschlagen');
                if (onError) onError(error);
                throw error;
            }

            try {
                // 1) Base64 für sofortige Vorschau (auch für PDFs/Dokumente als Fallback)
                let base64Preview = null;
                // Für Bilder: immer Base64 für Vorschau
                // Für PDFs/Dokumente: Base64 als Fallback wenn S3 fehlschlägt
                if (file.type.startsWith('image/')) {
                    base64Preview = await this.fileToBase64(file);
                }

                // 2) Upload zu AWS S3
                let uploadedUrl = null;
                let uploadMethod = 'Base64 (Fallback)';
                let s3Error = null;
                
                try {
                    if (window.awsMedia) {
                        // Prüfe ob API_BASE konfiguriert ist
                        const apiBase = window.AWS_APP_CONFIG?.API_BASE || window.awsMedia?.API_BASE;
                        if (!apiBase) {
                            console.warn('⚠️ API_BASE nicht konfiguriert, überspringe S3 Upload');
                            throw new Error('API Endpoint nicht konfiguriert');
                        }
                        
                        console.log('📤 Upload zu AWS S3...', { category, fileType: file.type, userId });
                        
                        if (category === 'profile' || category === 'service' || file.type.startsWith('image/')) {
                            const result = await window.awsMedia.uploadProfileImage(file, userId);
                            if (result && result.publicUrl) {
                                uploadedUrl = result.publicUrl;
                                uploadMethod = 'AWS S3';
                                console.log('✅ S3 Upload erfolgreich:', uploadedUrl);
                            } else {
                                throw new Error('Upload erfolgreich, aber keine URL erhalten');
                            }
                        } else if (category === 'document' || category === 'cv' || category === 'certificate') {
                            const fileType = category === 'cv' ? 'cv' : category === 'certificate' ? 'certificate' : 'document';
                            console.log(`📄 Uploading document: ${file.name} (${fileType})`);
                            const result = await window.awsMedia.uploadDocument(file, userId, fileType);
                            if (result && result.publicUrl) {
                                uploadedUrl = result.publicUrl;
                                uploadMethod = 'AWS S3';
                                console.log('✅ S3 Document Upload erfolgreich:', uploadedUrl);
                            } else {
                                throw new Error('Upload erfolgreich, aber keine URL erhalten');
                            }
                        }
                    } else {
                        throw new Error('awsMedia nicht verfügbar');
                    }
                } catch (error) {
                    s3Error = error;
                    console.warn('⚠️ AWS Upload fehlgeschlagen, verwende Base64 Fallback:', error);
                    
                    // Für PDFs/Dokumente: Base64 als Fallback erstellen
                    if (!base64Preview && (file.type === 'application/pdf' || category === 'document' || category === 'cv' || category === 'certificate')) {
                        try {
                            console.log('📄 Erstelle Base64 Fallback für Dokument...');
                            base64Preview = await this.fileToBase64(file);
                            console.log('✅ Base64 Fallback erstellt');
                        } catch (base64Error) {
                            console.error('❌ Base64 Fallback fehlgeschlagen:', base64Error);
                            throw new Error(`Upload fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}. Base64 Fallback ebenfalls fehlgeschlagen: ${base64Error.message}`);
                        }
                    }
                }

                // 3) Finale Quelle: S3 URL oder Base64
                const finalSrc = uploadedUrl || base64Preview;
                if (!finalSrc) {
                    const errorMsg = s3Error 
                        ? `Upload fehlgeschlagen: ${s3Error.message || 'Unbekannter Fehler'}. Keine Fallback-Quelle verfügbar.`
                        : 'Keine Bildquelle verfügbar';
                    throw new Error(errorMsg);
                }

                // 4) Speichere in localStorage (kategorie-spezifisch)
                const savedData = await this.saveToStorage(file, finalSrc, category, {
                    uploadedUrl,
                    uploadMethod,
                    ...metadata
                });

                // 5) Progress Callback
                if (onProgress) {
                    onProgress(100);
                }

                // 6) Success Callback
                if (onSuccess) {
                    onSuccess({
                        url: finalSrc,
                        s3Url: uploadedUrl,
                        base64: base64Preview,
                        category,
                        uploadMethod,
                        ...savedData
                    });
                }

                return {
                    url: finalSrc,
                    s3Url: uploadedUrl,
                    base64: base64Preview,
                    category,
                    uploadMethod,
                    ...savedData
                };

            } catch (error) {
                console.error('❌ Smart Upload Fehler:', error);
                if (onError) {
                    onError(error);
                }
                throw error;
            }
        }

        /**
         * Bulk Upload - mehrere Dateien gleichzeitig
         */
        async uploadBulk(files, options = {}) {
            const results = [];
            const errors = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    const result = await this.upload(file, {
                        ...options,
                        onProgress: (progress) => {
                            if (options.onProgress) {
                                const totalProgress = ((i + progress / 100) / files.length) * 100;
                                options.onProgress(totalProgress, i + 1, files.length);
                            }
                        }
                    });
                    results.push(result);
                } catch (error) {
                    errors.push({ file: file.name, error });
                }
            }

            return {
                successful: results,
                failed: errors,
                total: files.length,
                successCount: results.length,
                errorCount: errors.length
            };
        }

        /**
         * Kategorie automatisch erkennen
         */
        detectCategory(file) {
            const name = file.name.toLowerCase();
            const type = file.type.toLowerCase();

            // Service-Bilder
            if (name.includes('service') || name.includes('service-')) {
                return 'service';
            }

            // Rental-Bilder
            if (name.includes('rental') || name.includes('wohnmobil') || name.includes('ebike') || 
                name.includes('sup') || name.includes('fotobox')) {
                return 'rental';
            }

            // Dokumente
            if (type.includes('pdf') || type.includes('document') || type.includes('word')) {
                if (name.includes('cv') || name.includes('lebenslauf')) return 'cv';
                if (name.includes('zeugnis') || name.includes('certificate')) return 'certificate';
                return 'document';
            }

            // Profile-Bilder (Standard für Bilder)
            if (type.startsWith('image/')) {
                if (name.includes('profile') || name.includes('avatar') || name.includes('profil')) {
                    return 'profile';
                }
                return 'gallery';
            }

            // Default
            return 'general';
        }

        /**
         * Datei validieren
         */
        validateFile(file, category) {
            // Größe prüfen
            if (file.size > this.config.maxFileSize) {
                console.error('❌ Datei zu groß:', file.size, 'max:', this.config.maxFileSize);
                return false;
            }

            // Typ prüfen
            if (file.type.startsWith('image/')) {
                if (!this.config.allowedImageTypes.includes(file.type)) {
                    console.error('❌ Nicht unterstütztes Bildformat:', file.type);
                    return false;
                }
            } else if (category === 'document' || category === 'cv' || category === 'certificate') {
                if (!this.config.allowedDocumentTypes.includes(file.type)) {
                    console.error('❌ Nicht unterstütztes Dokumentformat:', file.type);
                    return false;
                }
            }

            return true;
        }

        /**
         * Datei zu Base64 konvertieren
         */
        fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        /**
         * In Storage speichern (kategorie-spezifisch)
         */
        async saveToStorage(file, url, category, metadata = {}) {
            const storageData = {
                id: Date.now() + Math.random(),
                name: file.name,
                filename: file.name,
                url: url,
                imageData: url, // Für Kompatibilität
                size: file.size,
                type: file.type,
                category: category,
                uploadedAt: new Date().toISOString(),
                isUploaded: !!metadata.uploadedUrl,
                uploadMethod: metadata.uploadMethod,
                ...metadata
            };

            // Kategorie-spezifische Speicherung
            switch (category) {
                case 'profile':
                    // Profilbild-Speicherung
                    localStorage.setItem('heroProfileImage', url);
                    localStorage.setItem('adminProfileImage', url);
                    localStorage.setItem('profileImage', url);
                    break;

                case 'service':
                    // Service-Bilder-Speicherung
                    let serviceImages = JSON.parse(localStorage.getItem('website_service_images') || '[]');
                    serviceImages.push(storageData);
                    localStorage.setItem('website_service_images', JSON.stringify(serviceImages));
                    break;

                case 'rental':
                    // Rental-Bilder-Speicherung (dynamisch basierend auf Dateiname)
                    const rentalType = this.detectRentalType(file.name);
                    if (rentalType) {
                        const rentalKey = `${rentalType}_images`;
                        let rentalImages = JSON.parse(localStorage.getItem(rentalKey) || '[]');
                        rentalImages.push(storageData);
                        localStorage.setItem(rentalKey, JSON.stringify(rentalImages));
                    }
                    break;

                case 'gallery':
                    // Galerie-Speicherung
                    let gallery = JSON.parse(localStorage.getItem('adminProfileGallery') || '[]');
                    gallery.push(storageData);
                    localStorage.setItem('adminProfileGallery', JSON.stringify(gallery));
                    break;

                case 'cv':
                case 'certificate':
                case 'document':
                    // Dokument-Speicherung
                    let documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
                    documents.push({
                        ...storageData,
                        category: category,
                        includeInAnalysis: true
                    });
                    localStorage.setItem('applicationDocuments', JSON.stringify(documents));
                    break;

                default:
                    // Allgemeine Medien-Speicherung
                    const mediaKey = `media_${category}_${Date.now()}`;
                    localStorage.setItem(mediaKey, JSON.stringify(storageData));
            }

            console.log(`💾 Gespeichert in localStorage (Kategorie: ${category})`);
            return storageData;
        }

        /**
         * Rental-Typ aus Dateiname erkennen
         */
        detectRentalType(filename) {
            const name = filename.toLowerCase();
            if (name.includes('wohnmobil')) return 'wohnmobil';
            if (name.includes('ebike')) return 'ebike';
            if (name.includes('sup')) return 'sup';
            if (name.includes('fotobox')) return 'fotobox';
            return null;
        }

        /**
         * Alle Medien einer Kategorie laden
         */
        loadMedia(category) {
            const media = [];

            switch (category) {
                case 'profile':
                    const profileImage = localStorage.getItem('heroProfileImage') || 
                                        localStorage.getItem('adminProfileImage') || 
                                        localStorage.getItem('profileImage');
                    if (profileImage) {
                        media.push({
                            url: profileImage,
                            category: 'profile',
                            type: 'image'
                        });
                    }
                    break;

                case 'service':
                    const serviceImages = JSON.parse(localStorage.getItem('website_service_images') || '[]');
                    media.push(...serviceImages);
                    break;

                case 'rental':
                    const rentalTypes = ['wohnmobil', 'ebike', 'sup', 'fotobox'];
                    rentalTypes.forEach(type => {
                        const rentalImages = JSON.parse(localStorage.getItem(`${type}_images`) || '[]');
                        media.push(...rentalImages);
                    });
                    break;

                case 'gallery':
                    const gallery = JSON.parse(localStorage.getItem('adminProfileGallery') || '[]');
                    media.push(...gallery);
                    break;

                case 'document':
                case 'cv':
                case 'certificate':
                    const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
                    const filtered = documents.filter(doc => 
                        category === 'document' || doc.category === category
                    );
                    media.push(...filtered);
                    break;
            }

            return media;
        }

        /**
         * Medien löschen
         */
        deleteMedia(mediaId, category) {
            switch (category) {
                case 'service':
                    let serviceImages = JSON.parse(localStorage.getItem('website_service_images') || '[]');
                    serviceImages = serviceImages.filter(img => img.id !== mediaId);
                    localStorage.setItem('website_service_images', JSON.stringify(serviceImages));
                    break;

                case 'rental':
                    const rentalTypes = ['wohnmobil', 'ebike', 'sup', 'fotobox'];
                    rentalTypes.forEach(type => {
                        const rentalImages = JSON.parse(localStorage.getItem(`${type}_images`) || '[]');
                        const filtered = rentalImages.filter(img => img.id !== mediaId);
                        localStorage.setItem(`${type}_images`, JSON.stringify(filtered));
                    });
                    break;

                case 'gallery':
                    let gallery = JSON.parse(localStorage.getItem('adminProfileGallery') || '[]');
                    gallery = gallery.filter(img => img.id !== mediaId);
                    localStorage.setItem('adminProfileGallery', JSON.stringify(gallery));
                    break;

                case 'document':
                case 'cv':
                case 'certificate':
                    let documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
                    documents = documents.filter(doc => doc.id !== mediaId);
                    localStorage.setItem('applicationDocuments', JSON.stringify(documents));
                    break;
            }

            console.log(`🗑️ Medien gelöscht: ${mediaId} (${category})`);
        }
    }

    // Globale Instanz erstellen
    window.smartMediaUpload = new SmartMediaUpload();

    // Legacy-Kompatibilität
    window.unifiedAWS = {
        uploadMedia: async (files, options = {}) => {
            const results = await window.smartMediaUpload.uploadBulk(Array.from(files), {
                category: options.category,
                userId: options.userId || 'owner',
                onProgress: options.onProgress
            });
            return results.successful;
        }
    };

    console.log('✅ Smart Media Upload geladen');
})();

