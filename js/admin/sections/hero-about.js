/**
 * Hero & Über mich Section
 */
class HeroAboutSection {
    constructor() {
        this.storageKey = 'adminProfileData';
    }

    init() {
        console.log('🚀 HeroAbout.init() aufgerufen');
        
        // Warte bis DOM bereit ist
        const tryInit = () => {
            // Prüfe ob alle kritischen Elemente vorhanden sind
            const hasForm = document.getElementById('heroName');
            const hasUploadBtn = document.getElementById('upload-image-btn');
            const hasImageUpload = document.getElementById('image-upload');
            
            console.log('🔍 Prüfe DOM-Elemente:', {
                hasForm: !!hasForm,
                hasUploadBtn: !!hasUploadBtn,
                hasImageUpload: !!hasImageUpload
            });
            
            if (hasForm && hasUploadBtn && hasImageUpload) {
                console.log('✅ Alle Elemente gefunden, initialisiere...');
                this.cacheEls();
                this.loadFromStorage();
                this.attachEvents();
                this.loadGallery();
                this.loadCurrentProfileImage();
                console.log('✅ HeroAbout Section initialized successfully');
            } else {
                console.log('⏳ HeroAbout: Warte auf DOM-Elemente...', {
                    hasForm: !!hasForm,
                    hasUploadBtn: !!hasUploadBtn,
                    hasImageUpload: !!hasImageUpload
                });
                // Retry nach 100ms (max 50 Versuche = 5 Sekunden)
                const retries = (tryInit._retries || 0) + 1;
                tryInit._retries = retries;
                if (retries < 50) {
                    setTimeout(tryInit, 100);
                } else {
                    console.error('❌ Timeout: DOM-Elemente nicht gefunden nach 5 Sekunden');
                }
            }
        };
        
        // Starte Initialisierung
        tryInit();
    }

    cacheEls() {
        this.els = {
            name: document.getElementById('heroName'),
            title: document.getElementById('heroTitle'),
            subtitle: document.getElementById('heroSubtitle'),
            email: document.getElementById('heroEmail'),
            phone: document.getElementById('heroPhone'),
            location: document.getElementById('heroLocation'),
            stat1Number: document.getElementById('stat1Number'),
            stat1Label: document.getElementById('stat1Label'),
            stat2Number: document.getElementById('stat2Number'),
            stat2Label: document.getElementById('stat2Label'),
            stat3Number: document.getElementById('stat3Number'),
            stat3Label: document.getElementById('stat3Label'),
            saveBtn: document.getElementById('heroSaveBtn'),
            applyBtn: document.getElementById('heroApplyBtn'),
            resetBtn: document.getElementById('heroResetBtn'),
            // Profilbild-Elemente
            currentProfileImage: document.getElementById('current-profile-image'),
            changeProfileBtn: document.getElementById('change-profile-btn'),
            uploadImageBtn: document.getElementById('upload-image-btn'),
            imageUpload: document.getElementById('image-upload'),
            galleryUploadInput: document.getElementById('gallery-upload-input'),
            selectGalleryImagesBtn: document.getElementById('select-gallery-images-btn'),
            profileGalleryGrid: document.getElementById('profile-gallery-grid'),
            refreshGalleryBtn: document.getElementById('refresh-gallery-btn'),
            clearGalleryBtn: document.getElementById('clear-gallery-btn')
        };
        
        // Debug: Prüfe ob kritische Elemente gefunden wurden
        console.log('🔍 HeroAbout: Elemente gecacht:', {
            uploadImageBtn: !!this.els.uploadImageBtn,
            imageUpload: !!this.els.imageUpload,
            changeProfileBtn: !!this.els.changeProfileBtn
        });
    }

    attachEvents() {
        this.els.saveBtn?.addEventListener('click', () => this.save());
        this.els.applyBtn?.addEventListener('click', () => this.applyToWebsite());
        this.els.resetBtn?.addEventListener('click', () => this.reset());
        
        // Profilbild-Events
        if (this.els.changeProfileBtn) {
            this.els.changeProfileBtn.addEventListener('click', () => {
                console.log('🖼️ Change Profile Button clicked');
                if (this.els.imageUpload) {
                    this.els.imageUpload.click();
                } else {
                    console.error('❌ imageUpload Element nicht gefunden!');
                }
            });
        } else {
            console.warn('⚠️ changeProfileBtn nicht gefunden');
        }
        
        // Upload Button Event
        if (this.els.uploadImageBtn) {
            // Entferne alte Listener
            const newBtn = this.els.uploadImageBtn.cloneNode(true);
            this.els.uploadImageBtn.parentNode.replaceChild(newBtn, this.els.uploadImageBtn);
            this.els.uploadImageBtn = newBtn;
            
            this.els.uploadImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📤 Upload Image Button clicked');
                if (this.els.imageUpload) {
                    this.els.imageUpload.click();
                } else {
                    console.error('❌ imageUpload Element nicht gefunden!');
                    // Versuche direkt zu finden
                    this.els.imageUpload = document.getElementById('image-upload');
                    if (this.els.imageUpload) {
                        this.els.imageUpload.click();
                    }
                }
            });
            console.log('✅ Upload Button Event-Listener angehängt');
        } else {
            console.warn('⚠️ uploadImageBtn nicht gefunden');
        }
        
        // File Input Event
        if (this.els.imageUpload) {
            // Entferne alte Listener
            const newInput = this.els.imageUpload.cloneNode(true);
            this.els.imageUpload.parentNode.replaceChild(newInput, this.els.imageUpload);
            this.els.imageUpload = newInput;
            
            // Füge Event-Listener hinzu
            this.els.imageUpload.addEventListener('change', (e) => {
                console.log('📁 File input changed, starting upload...');
                console.log('   Files:', e.target.files);
                console.log('   File count:', e.target.files.length);
                if (e.target.files.length > 0) {
                    console.log('   First file:', e.target.files[0].name, e.target.files[0].type, e.target.files[0].size);
                }
                this.handleImageUpload(e);
            });
            
            console.log('✅ File input Event-Listener angehängt');
        } else {
            console.error('❌ imageUpload Element nicht gefunden - Upload wird nicht funktionieren!');
        }
        
        this.els.selectGalleryImagesBtn?.addEventListener('click', () => this.els.galleryUploadInput?.click());
        this.els.galleryUploadInput?.addEventListener('change', (e) => this.handleGalleryUpload(e));
        this.els.refreshGalleryBtn?.addEventListener('click', () => this.loadGallery());
        this.els.clearGalleryBtn?.addEventListener('click', () => this.clearGallery());
        
        // Drag & Drop für Galerie
        this.setupDragAndDrop();
        
            console.log('✅ HeroAbout: Event-Handler angehängt');
    }

    loadFromStorage() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return;
            const data = JSON.parse(raw);
            Object.entries(this.els).forEach(([key, el]) => {
                if (el && key in data) {
                    el.value = data[key] || '';
                }
            });
        } catch (e) {
            console.error('HeroAbout load error', e);
        }
    }

    getFormData() {
        const get = (el) => (el ? el.value?.trim() : '');
        return {
            name: get(this.els.name),
            title: get(this.els.title),
            subtitle: get(this.els.subtitle),
            email: get(this.els.email),
            phone: get(this.els.phone),
            location: get(this.els.location),
            stat1Number: get(this.els.stat1Number),
            stat1Label: get(this.els.stat1Label),
            stat2Number: get(this.els.stat2Number),
            stat2Label: get(this.els.stat2Label),
            stat3Number: get(this.els.stat3Number),
            stat3Label: get(this.els.stat3Label)
        };
    }

    save() {
        try {
            const data = this.getFormData();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.toast('Gespeichert');
            // trigger website sync immediately if available
            if (window.loadWebsiteDataFromLocalStorage) {
                window.loadWebsiteDataFromLocalStorage();
            }
        } catch (e) {
            console.error('HeroAbout save error', e);
            this.toast('Fehler beim Speichern', 'error');
        }
    }

    applyToWebsite() {
        this.save();
        
        // Profilbild auch anwenden
        this.syncToWebsite();
        
        // Hero-Text auch in heroData speichern (für Kompatibilität)
        this.syncHeroDataToWebsite();
        
        // Direkte Website-Sync aufrufen
        if (window.loadWebsiteDataFromLocalStorage) {
            window.loadWebsiteDataFromLocalStorage();
            this.toast('Auf Website angewendet');
        } else {
            // Fallback: Storage Event triggern
            window.dispatchEvent(new StorageEvent('storage', {
                key: this.storageKey,
                newValue: localStorage.getItem(this.storageKey)
            }));
            this.toast('Daten gespeichert - Website wird aktualisiert');
        }
    }
    
    /**
     * Synchronisiert Hero-Daten zur Website
     */
    syncHeroDataToWebsite() {
        const data = this.getFormData();
        
        // heroData laden oder erstellen
        let heroData = {};
        try {
            const stored = localStorage.getItem('heroData');
            if (stored) {
                heroData = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('heroData nicht gefunden oder ungültig');
        }
        
        // Hero-Text in heroData speichern
        if (data.title) {
            heroData.title = data.title;
        }
        if (data.subtitle) {
            heroData.subtitle = data.subtitle;
        }
        
        // Profilbild auch in heroData speichern
        const profileImage = localStorage.getItem('adminProfileImage');
        if (profileImage) {
            heroData.profileImage = profileImage;
        }
        
        // heroData speichern
        localStorage.setItem('heroData', JSON.stringify(heroData));
        
        // Storage Events auslösen für beide Keys
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'heroData',
            newValue: JSON.stringify(heroData),
            oldValue: localStorage.getItem('heroData')
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'adminProfileData',
            newValue: localStorage.getItem('adminProfileData'),
            oldValue: localStorage.getItem('adminProfileData')
        }));
        
        console.log('✅ Hero-Daten zur Website synchronisiert:', heroData);
    }
    
    /**
     * Synchronisiert Profilbild zur Website
     */
    syncToWebsite() {
        const profileImage = localStorage.getItem('adminProfileImage');
        if (!profileImage) return;
        
        // Storage Events auslösen für alle relevanten Keys
        const keys = ['adminProfileImage', 'heroProfileImage', 'profileImage', 'heroData'];
        keys.forEach(key => {
            if (localStorage.getItem(key)) {
                window.dispatchEvent(new StorageEvent('storage', {
                    key: key,
                    newValue: localStorage.getItem(key),
                    oldValue: localStorage.getItem(key)
                }));
            }
        });
        
        // Direkte Website-Funktionen aufrufen falls verfügbar
        if (window.loadWebsiteProfileImage) {
            window.loadWebsiteProfileImage();
        }
        
        if (window.updateProfileImageLive) {
            window.updateProfileImageLive();
        }
        
        console.log('✅ Profilbild zur Website synchronisiert');
    }

    reset() {
        localStorage.removeItem(this.storageKey);
        Object.values(this.els).forEach((el) => {
            if (el && 'value' in el) el.value = '';
        });
        this.toast('Zurückgesetzt');
    }

    /**
     * Profilbild-Upload behandeln
     */
    async handleImageUpload(event) {
        console.log('🚀 handleImageUpload aufgerufen!');
        console.log('   Event:', event);
        console.log('   Event target:', event.target);
        console.log('   Files:', event.target?.files);
        
        const file = event?.target?.files?.[0];
        if (!file) {
            console.error('❌ Keine Datei ausgewählt!');
            console.error('   Event target:', event.target);
            console.error('   Files length:', event.target?.files?.length);
            this.toast('Keine Datei ausgewählt', 'error');
            return;
        }
        
        console.log('✅ File selected:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);
        
        if (!this.validateImageFile(file)) {
            console.error('❌ Datei-Validierung fehlgeschlagen');
            return;
        }
        
        // SOFORT: Base64-Konvertierung für Vorschau (parallel zum Upload)
        let base64Preview = null;
        try {
            console.log('🔄 Konvertiere Bild zu Base64 für Vorschau...');
            base64Preview = await this.fileToBase64(file);
            console.log('✅ Base64-Konvertierung erfolgreich, Länge:', base64Preview.length);
            
            // SOFORT Vorschau anzeigen
            if (!this.els.currentProfileImage) {
                this.els.currentProfileImage = document.getElementById('current-profile-image');
            }
            this.updateCurrentProfileImage(base64Preview);
            console.log('✅ Vorschau-Bild angezeigt');
        } catch (previewError) {
            console.error('❌ Fehler bei Base64-Konvertierung:', previewError);
        }
        
        try {
            this.toast('Profilbild wird hochgeladen...', 'info');
            console.log('📤 Starting profile image upload:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);
            
            // 1) PRIORITÄT: Upload nach AWS S3 via Presigned URL
            let uploadedUrl = null;
            let uploadMethod = 'Base64 (Fallback)';
            
            try {
                // Prüfe ob awsMedia verfügbar ist
                if (!window.awsMedia) {
                    console.error('❌ window.awsMedia nicht verfügbar');
                    console.error('   Verfügbare window-Objekte:', Object.keys(window).filter(k => k.includes('aws')));
                    throw new Error('AWS Upload Module nicht geladen. Bitte Seite neu laden.');
                }
                
                // Prüfe ob AWS_APP_CONFIG verfügbar ist
                if (!window.AWS_APP_CONFIG) {
                    console.error('❌ window.AWS_APP_CONFIG nicht verfügbar');
                    throw new Error('AWS API Konfiguration nicht geladen. Bitte Seite neu laden.');
                }
                
                if (!window.AWS_APP_CONFIG.MEDIA_API_BASE) {
                    console.error('❌ AWS_APP_CONFIG.MEDIA_API_BASE nicht gesetzt');
                    console.error('   AWS_APP_CONFIG:', window.AWS_APP_CONFIG);
                    throw new Error('AWS API Base URL nicht konfiguriert. Bitte js/aws-app-config.js prüfen.');
                }
                
                console.log('✅ AWS Module verfügbar, starte S3 Upload...');
                console.log('   API Base:', window.AWS_APP_CONFIG.MEDIA_API_BASE);
                console.log('   File:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);
                
                const userId = 'owner';
                const result = await window.awsMedia.uploadProfileImage(file, userId);
                console.log('📦 S3 Upload Result:', result);
                
                if (result && result.publicUrl) {
                    uploadedUrl = result.publicUrl;
                    uploadMethod = 'AWS S3';
                    console.log('✅ S3 Upload erfolgreich:', uploadedUrl);
                } else {
                    throw new Error('S3 Upload erfolgreich, aber keine publicUrl zurückgegeben');
                }
                
            } catch (e) {
                console.warn('❌ S3 Upload fehlgeschlagen, verwende Base64 Fallback:', e.message);
                console.warn('   Fehler-Details:', e);
                // Spezielle Behandlung für Quota-Fehler
                if (e.message && e.message.includes('quota')) {
                    console.warn('⚠️ Quota-Limit erreicht. Verwende Base64-Fallback.');
                    this.toast('AWS Quota-Limit erreicht. Bild wird lokal gespeichert.', 'warning');
                }
            }
            
            // 2) Finale Quelle: S3 URL oder Base64
            let finalSrc = uploadedUrl || base64Preview;
            if (!finalSrc) {
                console.log('🔄 Konvertiere Bild zu Base64 (Fallback)...');
                finalSrc = await this.fileToBase64(file);
            }
            
            // 3) In localStorage speichern (als Cache)
            console.log('💾 Speichere Bild in localStorage...');
            localStorage.setItem('adminProfileImage', finalSrc);
            localStorage.setItem('heroProfileImage', finalSrc);
            localStorage.setItem('profileImage', finalSrc);
            console.log('✅ Bild in localStorage gespeichert');
            
            // heroData updaten
            let heroData = {};
            try {
                const stored = localStorage.getItem('heroData');
                if (stored) heroData = JSON.parse(stored);
            } catch {}
            heroData.profileImage = finalSrc;
            localStorage.setItem('heroData', JSON.stringify(heroData));
            
            // 4) WICHTIG: Wenn S3 Upload erfolgreich war, in DynamoDB speichern
            if (uploadedUrl && window.awsProfileAPI) {
                try {
                    console.log('☁️ Speichere S3 URL in AWS DynamoDB...');
                    console.log('📤 S3 URL:', uploadedUrl);
                    
                    const imageData = {
                        userId: 'owner', // WICHTIG: userId muss explizit gesetzt sein
                        profileImageDefault: uploadedUrl, // S3 URL verwenden
                        profileImageHover: localStorage.getItem('profileImageHover') || uploadedUrl
                    };
                    
                    console.log('📦 Image Data für DynamoDB:', imageData);
                    const result = await window.awsProfileAPI.saveWebsiteImages(imageData);
                    console.log('✅ S3 URL in AWS DynamoDB gespeichert:', result);
                } catch (awsError) {
                    console.error('❌ AWS DynamoDB Speicherung fehlgeschlagen:', awsError);
                    console.warn('⚠️ Fehler-Details:', awsError.message, awsError.stack);
                    console.log('ℹ️ Bild ist trotzdem in localStorage verfügbar');
                }
            } else {
                if (!uploadedUrl) {
                    console.warn('⚠️ Keine S3 URL verfügbar - DynamoDB Speicherung übersprungen');
                }
                if (!window.awsProfileAPI) {
                    console.warn('⚠️ awsProfileAPI nicht verfügbar - DynamoDB Speicherung übersprungen');
                }
            }
            
            // 5) Vorschau und Website aktualisieren (falls noch nicht geschehen)
            if (!this.els.currentProfileImage) {
                this.els.currentProfileImage = document.getElementById('current-profile-image');
            }
            this.updateCurrentProfileImage(finalSrc);
            this.loadGallery();
            this.syncToWebsite();
            
            // Erfolgsmeldung mit Details
            let successMsg = '';
            if (uploadedUrl) {
                successMsg = '✅ Profilbild erfolgreich auf AWS S3 & DynamoDB gespeichert!';
                console.log('✅ Bild ist in AWS gespeichert und wird auf der Website angezeigt');
            } else {
                successMsg = '⚠️ Profilbild nur lokal gespeichert (AWS Upload fehlgeschlagen - Quota überschritten)';
                console.warn('⚠️ Bild ist NUR in localStorage - wird NICHT auf der Website angezeigt!');
                console.warn('⚠️ Bitte AWS Quota prüfen oder später erneut versuchen');
            }
            
            this.toast(successMsg, uploadedUrl ? 'success' : 'warning');
            console.log('🎉 Profile image upload completed:', uploadMethod);
            
        } catch (error) {
            console.error('❌ Profilbild-Upload Fehler:', error);
            console.error('   Error stack:', error.stack);
            
            // Auch bei Fehler: Base64-Vorschau anzeigen falls verfügbar
            if (base64Preview) {
                console.log('🔄 Zeige Base64-Vorschau trotz Fehler...');
                this.updateCurrentProfileImage(base64Preview);
                localStorage.setItem('adminProfileImage', base64Preview);
                localStorage.setItem('heroProfileImage', base64Preview);
                this.toast('Bild lokal gespeichert (Upload fehlgeschlagen)', 'warning');
            } else {
                this.toast('Fehler beim Hochladen des Profilbilds: ' + error.message, 'error');
            }
        } finally {
            // Input zurücksetzen, damit derselbe File wieder ausgewählt werden kann
            if (this.els.imageUpload) {
                this.els.imageUpload.value = '';
            }
        }
    }
    
    /**
     * Galerie-Upload behandeln
     */
    async handleGalleryUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        // Alle Dateien validieren
        const validFiles = files.filter(file => this.validateImageFile(file));
        if (validFiles.length === 0) return;
        
        try {
            this.toast(`${validFiles.length} Bilder werden hochgeladen...`, 'info');
            
            const gallery = this.getGallery();
            
            for (const file of validFiles) {
                const base64 = await this.fileToBase64(file);
                const imageData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    data: base64,
                    uploaded: new Date().toISOString()
                };
                gallery.push(imageData);
            }
            
            // Galerie speichern
            localStorage.setItem('adminProfileGallery', JSON.stringify(gallery));
            
            // Galerie anzeigen
            this.loadGallery();
            
            this.toast(`${validFiles.length} Bilder erfolgreich hochgeladen!`, 'success');
            
        } catch (error) {
            console.error('Galerie-Upload Fehler:', error);
            this.toast('Fehler beim Hochladen der Bilder', 'error');
        }
    }
    
    /**
     * Drag & Drop Setup
     */
    setupDragAndDrop() {
        const uploadArea = document.getElementById('gallery-upload-area');
        if (!uploadArea) return;
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleGalleryUpload({ target: { files } });
            }
        });
    }
    
    /**
     * Bild-Datei validieren
     */
    validateImageFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
        
        if (file.size > maxSize) {
            this.toast('Datei ist zu groß (max. 5MB)', 'error');
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.toast('Nicht unterstütztes Dateiformat', 'error');
            return false;
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
     * Aktuelles Profilbild aktualisieren
     */
    updateCurrentProfileImage(base64) {
        // Stelle sicher, dass Element gecacht ist
        if (!this.els.currentProfileImage) {
            this.els.currentProfileImage = document.getElementById('current-profile-image');
        }
        
        if (this.els.currentProfileImage) {
            console.log('🖼️ Updating profile image preview:', base64.substring(0, 50) + '...');
            this.els.currentProfileImage.src = base64;
            this.els.currentProfileImage.style.display = 'block';
            
            // Aktualisiere auch den Namen falls vorhanden
            const nameEl = document.getElementById('current-profile-name');
            if (nameEl) {
                nameEl.textContent = 'Profilbild hochgeladen';
            }
        } else {
            console.error('❌ current-profile-image Element nicht gefunden!');
            // Versuche direkt zu finden
            const imgEl = document.getElementById('current-profile-image');
            if (imgEl) {
                console.log('✅ Element direkt gefunden, aktualisiere...');
                imgEl.src = base64;
                imgEl.style.display = 'block';
                this.els.currentProfileImage = imgEl;
            }
        }
    }
    
    /**
     * Galerie laden
     */
    loadGallery() {
        const gallery = this.getGallery();
        const grid = this.els.profileGalleryGrid;
        
        if (!grid) return;
        
        if (gallery.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Keine Bilder in der Galerie</p>';
            return;
        }
        
        grid.innerHTML = gallery.map(image => `
            <div class="gallery-item" data-id="${image.id}">
                <img src="${image.data}" alt="${image.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
                <div class="gallery-item-actions">
                    <button onclick="heroAboutSection.setAsProfile('${image.id}')" class="btn btn-sm btn-primary">
                        <i class="fas fa-user"></i> Als Profilbild
                    </button>
                    <button onclick="heroAboutSection.deleteFromGallery('${image.id}')" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <p style="font-size: 0.8rem; margin-top: 0.5rem; text-align: center;">${image.name}</p>
            </div>
        `).join('');
    }
    
    /**
     * Galerie aus LocalStorage laden
     */
    getGallery() {
        try {
            const stored = localStorage.getItem('adminProfileGallery');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }
    
    /**
     * Als Profilbild setzen
     */
    setAsProfile(imageId) {
        const gallery = this.getGallery();
        const image = gallery.find(img => img.id === imageId);
        
        if (image) {
            const base64 = image.data;
            
            // In LocalStorage speichern - MEHRERE KEYS für Kompatibilität
            localStorage.setItem('adminProfileImage', base64);
            localStorage.setItem('heroProfileImage', base64);
            localStorage.setItem('profileImage', base64);
            
            // Profilbild auch in heroData speichern
            let heroData = {};
            try {
                const stored = localStorage.getItem('heroData');
                if (stored) {
                    heroData = JSON.parse(stored);
                }
            } catch (e) {
                console.warn('heroData nicht gefunden oder ungültig');
            }
            
            heroData.profileImage = base64;
            localStorage.setItem('heroData', JSON.stringify(heroData));
            
            this.updateCurrentProfileImage(base64);
            
            // Website sofort aktualisieren
            this.syncToWebsite();
            
            this.toast('Profilbild geändert!', 'success');
        }
    }
    
    /**
     * Aus Galerie löschen
     */
    deleteFromGallery(imageId) {
        if (!confirm('Bild wirklich löschen?')) return;
        
        const gallery = this.getGallery();
        const filtered = gallery.filter(img => img.id !== imageId);
        
        localStorage.setItem('adminProfileGallery', JSON.stringify(filtered));
        this.loadGallery();
        this.toast('Bild gelöscht!', 'success');
    }
    
    /**
     * Galerie leeren
     */
    clearGallery() {
        if (!confirm('Alle Bilder wirklich löschen?')) return;
        
        localStorage.removeItem('adminProfileGallery');
        this.loadGallery();
        this.toast('Galerie geleert!', 'success');
    }
    
    /**
     * Aktuelles Profilbild laden
     */
    loadCurrentProfileImage() {
        const storedImage = localStorage.getItem('adminProfileImage');
        if (storedImage && this.els.currentProfileImage) {
            this.els.currentProfileImage.src = storedImage;
        }
    }

    toast(msg, type = 'success') {
        try {
            const t = document.createElement('div');
            t.className = `toast toast-${type}`;
            t.style.cssText = 'position:fixed;right:1rem;bottom:1rem;background:#111;color:#fff;padding:.75rem 1rem;border-radius:8px;z-index:9999;opacity:0;transition:opacity .2s';
            t.textContent = msg;
            document.body.appendChild(t);
            requestAnimationFrame(() => (t.style.opacity = '1'));
            setTimeout(() => {
                t.style.opacity = '0';
                setTimeout(() => t.remove(), 200);
            }, 2000);
        } catch {}
    }
}

// Global
window.HeroAboutSection = HeroAboutSection;

// Auto-Bootstrapping: initialisiert, sobald das Section-Template im DOM ist
(function bootstrapHeroAbout() {
    const tryInit = () => {
        // Prüfe ob alle kritischen Elemente vorhanden sind
        const hasForm = document.getElementById('heroName');
        const hasUploadBtn = document.getElementById('upload-image-btn');
        const hasImageUpload = document.getElementById('image-upload');
        
        if (hasForm && hasUploadBtn && hasImageUpload) {
            if (!window.heroAboutSection) {
                console.log('🚀 HeroAbout: Initialisiere Section...');
                window.heroAboutSection = new HeroAboutSection();
                window.heroAboutSection.init();
                console.log('✅ HeroAbout: Section initialisiert');
            } else {
                // Re-initialisiere Event-Handler falls nötig
                console.log('🔄 HeroAbout: Section existiert bereits, prüfe Event-Handler...');
                if (window.heroAboutSection.els && !window.heroAboutSection.els.uploadImageBtn) {
                    console.log('🔄 HeroAbout: Re-initialisiere Elemente und Events...');
                    window.heroAboutSection.cacheEls();
                    window.heroAboutSection.attachEvents();
                }
            }
            return; // fertig
        } else {
            console.log('⏳ HeroAbout: Warte auf Elemente...', {
                hasForm: !!hasForm,
                hasUploadBtn: !!hasUploadBtn,
                hasImageUpload: !!hasImageUpload
            });
        }
        setTimeout(tryInit, 200);
    };

    // beim Laden und bei Navigationswechseln probieren
    document.addEventListener('DOMContentLoaded', tryInit);
    window.addEventListener('hashchange', () => {
        // Nur für hero-about Route versuchen
        if (location.hash.replace('#', '') === 'hero-about') {
            console.log('🔗 HeroAbout: Hash changed to hero-about, initialisiere...');
            setTimeout(tryInit, 100);
        }
    });
})();

// Global verfügbar machen für onclick-Handler
window.heroAboutSection = null;

