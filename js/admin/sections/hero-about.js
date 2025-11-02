/**
 * Hero & Über mich Section
 */
class HeroAboutSection {
    constructor() {
        this.storageKey = 'adminProfileData';
    }

    init() {
        this.cacheEls();
        this.loadFromStorage();
        this.attachEvents();
        this.loadGallery();
        this.loadCurrentProfileImage();
        console.log('HeroAbout Section initialized');
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
            imageUpload: document.getElementById('image-upload'),
            galleryUploadInput: document.getElementById('gallery-upload-input'),
            selectGalleryImagesBtn: document.getElementById('select-gallery-images-btn'),
            profileGalleryGrid: document.getElementById('profile-gallery-grid'),
            refreshGalleryBtn: document.getElementById('refresh-gallery-btn'),
            clearGalleryBtn: document.getElementById('clear-gallery-btn')
        };
    }

    attachEvents() {
        this.els.saveBtn?.addEventListener('click', () => this.save());
        this.els.applyBtn?.addEventListener('click', () => this.applyToWebsite());
        this.els.resetBtn?.addEventListener('click', () => this.reset());
        
        // Profilbild-Events
        this.els.changeProfileBtn?.addEventListener('click', () => this.els.imageUpload?.click());
        this.els.imageUpload?.addEventListener('change', (e) => this.handleImageUpload(e));
        this.els.selectGalleryImagesBtn?.addEventListener('click', () => this.els.galleryUploadInput?.click());
        this.els.galleryUploadInput?.addEventListener('change', (e) => this.handleGalleryUpload(e));
        this.els.refreshGalleryBtn?.addEventListener('click', () => this.loadGallery());
        this.els.clearGalleryBtn?.addEventListener('click', () => this.clearGallery());
        
        // Drag & Drop für Galerie
        this.setupDragAndDrop();
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
        
        // heroData speichern
        localStorage.setItem('heroData', JSON.stringify(heroData));
        
        // Storage Event auslösen
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'heroData',
            newValue: JSON.stringify(heroData),
            oldValue: localStorage.getItem('heroData')
        }));
        
        console.log('✅ Hero-Daten zur Website synchronisiert');
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
        const file = event.target.files[0];
        if (!file) return;
        
        if (!this.validateImageFile(file)) return;
        
        try {
            this.toast('Profilbild wird hochgeladen...', 'info');
            
            // Bild zu Base64 konvertieren
            const base64 = await this.fileToBase64(file);
            
            // In LocalStorage speichern - MEHRERE KEYS für Kompatibilität
            localStorage.setItem('adminProfileImage', base64);
            localStorage.setItem('heroProfileImage', base64);
            localStorage.setItem('profileImage', base64);
            
            // Profilbild auch in heroData speichern (für Kompatibilität)
            let heroData = {};
            try {
                const stored = localStorage.getItem('heroData');
                if (stored) {
                    heroData = JSON.parse(stored);
                }
            } catch (e) {
                console.warn('heroData nicht gefunden oder ungültig, erstelle neues Objekt');
            }
            
            heroData.profileImage = base64;
            localStorage.setItem('heroData', JSON.stringify(heroData));
            
            // Aktuelles Profilbild aktualisieren
            this.updateCurrentProfileImage(base64);
            
            // Galerie neu laden
            this.loadGallery();
            
            // Website sofort aktualisieren
            this.syncToWebsite();
            
            this.toast('Profilbild erfolgreich hochgeladen!', 'success');
            
        } catch (error) {
            console.error('Profilbild-Upload Fehler:', error);
            this.toast('Fehler beim Hochladen des Profilbilds', 'error');
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
        if (this.els.currentProfileImage) {
            this.els.currentProfileImage.src = base64;
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
        // nur initialisieren, wenn die Felder vorhanden sind
        const hasForm = document.getElementById('heroName');
        if (hasForm) {
            if (!window.heroAboutSection) {
                window.heroAboutSection = new HeroAboutSection();
                window.heroAboutSection.init();
            }
            return; // fertig
        }
        setTimeout(tryInit, 200);
    };

    // beim Laden und bei Navigationswechseln probieren
    document.addEventListener('DOMContentLoaded', tryInit);
    window.addEventListener('hashchange', () => {
        // Nur für hero-about Route versuchen
        if (location.hash.replace('#', '') === 'hero-about') {
            setTimeout(tryInit, 100);
        }
    });
})();

// Global verfügbar machen für onclick-Handler
window.heroAboutSection = null;

