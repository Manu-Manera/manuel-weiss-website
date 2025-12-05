/**
 * Rentals Section Module
 * Vermietungsverwaltung für das Admin Panel
 */
class RentalsSection {
    constructor() {
        this.currentRentalType = 'wohnmobil';
        this.rentalItems = [];
        this.initialized = false;
    }

    /**
     * Section initialisieren
     */
    init() {
        if (this.initialized) return;
        
        console.log('🏠 Rentals Section initialisieren...');
        
        // Warte bis DOM bereit ist
        const tryInit = () => {
            const hasTabs = document.querySelectorAll('.tab-btn[data-rental]').length > 0;
            const hasEditor = document.getElementById('rentalEditor');
            
            if (hasTabs && hasEditor) {
                console.log('✅ Rentals DOM-Elemente gefunden');
                this.loadRentalItems();
                this.attachEventListeners();
                this.renderRentalEditor();
                this.initialized = true;
                console.log('✅ Rentals Section initialized successfully');
            } else {
                console.log('⏳ Rentals: Warte auf DOM-Elemente...');
                const retries = (tryInit._retries || 0) + 1;
                tryInit._retries = retries;
                if (retries < 50) {
                    setTimeout(tryInit, 100);
                } else {
                    console.error('❌ Timeout: Rentals DOM-Elemente nicht gefunden');
                }
            }
        };
        
        tryInit();
    }

    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Tab-Buttons für Vermietungen
        const tabButtons = document.querySelectorAll('.tab-btn[data-rental]');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const rentalType = btn.getAttribute('data-rental');
                console.log('🏠 Tab geklickt:', rentalType);
                
                this.switchRentalTab(rentalType);
            });
        });

        // Button zum Erstellen eines neuen Vermietungsgegenstands
        const createBtn = document.querySelector('[data-action="create-new-rental-item"]');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.createNewRentalItem();
            });
        }

        // Bild-Upload für neue Vermietungsgegenstände
        const imageInput = document.getElementById('newRentalImages');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImagePreview(e.target.files);
            });
        }
    }

    /**
     * Zwischen Vermietungs-Tabs umschalten
     */
    switchRentalTab(rentalType) {
        console.log('🏠 Wechsle zu Tab:', rentalType);
        
        // Alle Tabs deaktivieren
        document.querySelectorAll('.tab-btn[data-rental]').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Gewählten Tab aktivieren
        const activeTab = document.querySelector(`.tab-btn[data-rental="${rentalType}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Aktuellen Typ speichern
        this.currentRentalType = rentalType;
        
        // Editor aktualisieren
        this.renderRentalEditor();
    }

    /**
     * Rental Editor rendern
     */
    renderRentalEditor() {
        const editor = document.getElementById('rentalEditor');
        if (!editor) return;

        const rentalTypes = {
            wohnmobil: { title: 'Wohnmobil', icon: 'fa-campground' },
            fotobox: { title: 'Fotobox', icon: 'fa-camera' },
            ebike: { title: 'E-Bikes', icon: 'fa-bicycle' },
            sup: { title: 'SUP Boards', icon: 'fa-water' }
        };

        const current = rentalTypes[this.currentRentalType] || rentalTypes.wohnmobil;
        
        editor.innerHTML = `
            <div class="rental-editor-content" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #333; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas ${current.icon}"></i>
                    ${current.title} Verwaltung
                </h3>
                
                <div class="rental-form">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Titel:</label>
                        <input type="text" id="rentalTitle" placeholder="${current.title} Titel" 
                               style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Beschreibung:</label>
                        <textarea id="rentalDescription" placeholder="Beschreibung..." rows="4" 
                                  style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Preis pro Tag (€):</label>
                            <input type="number" id="rentalPrice" placeholder="150" 
                                   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Kaution (€):</label>
                            <input type="number" id="rentalDeposit" placeholder="500" 
                                   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Bilder hochladen:</label>
                        <div style="border: 2px dashed #ddd; border-radius: 6px; padding: 1.5rem; text-align: center; background: #f9fafb;">
                            <input type="file" id="rentalImageUpload" accept="image/*" multiple 
                                   style="display: none;">
                            <button type="button" id="rentalImageUploadBtn" 
                                    style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                <i class="fas fa-upload"></i> Bilder auswählen
                            </button>
                            <p style="margin-top: 0.5rem; color: #666; font-size: 0.875rem;">
                                Mehrere Bilder können gleichzeitig hochgeladen werden
                            </p>
                        </div>
                        <div id="rentalImagePreview" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            <!-- Vorschau wird hier angezeigt -->
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button type="button" id="rentalSaveBtn" 
                                style="flex: 1; padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-save"></i> Speichern
                        </button>
                        <button type="button" id="rentalResetBtn" 
                                style="flex: 1; padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            <i class="fas fa-undo"></i> Zurücksetzen
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners für den Editor hinzufügen
        this.attachEditorEventListeners();
        
        // Gespeicherte Daten laden
        this.loadRentalData();
    }

    /**
     * Event Listeners für den Editor hinzufügen
     */
    attachEditorEventListeners() {
        // Bild-Upload Button
        const uploadBtn = document.getElementById('rentalImageUploadBtn');
        const fileInput = document.getElementById('rentalImageUpload');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', async (e) => {
                await this.handleImageUpload(e.target.files);
            });
        }

        // Speichern Button
        const saveBtn = document.getElementById('rentalSaveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveRentalData();
            });
        }

        // Zurücksetzen Button
        const resetBtn = document.getElementById('rentalResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetRentalForm();
            });
        }
    }

    /**
     * Bilder hochladen (ähnlich wie Profilbild)
     */
    async handleImageUpload(files) {
        if (!files || files.length === 0) return;

        const previewContainer = document.getElementById('rentalImagePreview');
        if (!previewContainer) return;

        this.toast('Bilder werden hochgeladen...', 'info');

        const uploadedImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                // Prüfe ob awsMedia verfügbar ist
                if (!window.awsMedia || !window.awsMedia.uploadProfileImage) {
                    console.error('❌ awsMedia nicht verfügbar');
                    this.toast('Upload-System nicht verfügbar', 'error');
                    return;
                }

                // Lade Bild zu AWS S3 hoch
                const userId = 'rentals'; // Oder eine spezifische User-ID
                const result = await window.awsMedia.uploadProfileImage(file, userId);
                
                console.log('📦 S3 Upload Result:', result);
                
                if (result && result.publicUrl) {
                    uploadedImages.push({
                        url: result.publicUrl,
                        filename: file.name,
                        uploadedAt: new Date().toISOString()
                    });

                    // Vorschau hinzufügen
                    const preview = document.createElement('div');
                    preview.style.position = 'relative';
                    preview.innerHTML = `
                        <img src="${result.publicUrl}" alt="${file.name}" 
                             style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; border: 2px solid #ddd;">
                        <button type="button" class="remove-image-btn" data-url="${result.publicUrl}"
                                style="position: absolute; top: 5px; right: 5px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-times" style="font-size: 0.75rem;"></i>
                        </button>
                    `;
                    
                    previewContainer.appendChild(preview);

                    // Remove-Button Event Listener
                    const removeBtn = preview.querySelector('.remove-image-btn');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', () => {
                            this.removeImage(result.publicUrl);
                            preview.remove();
                        });
                    }

                    this.toast(`Bild ${i + 1} erfolgreich hochgeladen`, 'success');
                } else {
                    console.error('❌ Keine publicUrl im Upload-Result');
                    this.toast(`Fehler beim Upload von ${file.name}`, 'error');
                }
            } catch (error) {
                console.error('❌ Upload-Fehler:', error);
                
                // Fallback: Base64-Vorschau (lokal speichern)
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Url = e.target.result;
                    uploadedImages.push({
                        url: base64Url,
                        filename: file.name,
                        uploadedAt: new Date().toISOString(),
                        isBase64: true
                    });

                    const preview = document.createElement('div');
                    preview.style.position = 'relative';
                    preview.innerHTML = `
                        <img src="${base64Url}" alt="${file.name}" 
                             style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; border: 2px solid #ddd;">
                        <button type="button" class="remove-image-btn" data-url="${base64Url}"
                                style="position: absolute; top: 5px; right: 5px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-times" style="font-size: 0.75rem;"></i>
                        </button>
                    `;
                    
                    previewContainer.appendChild(preview);

                    const removeBtn = preview.querySelector('.remove-image-btn');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', () => {
                            this.removeImage(base64Url);
                            preview.remove();
                        });
                    }
                };
                reader.readAsDataURL(file);
                
                this.toast(`Bild ${file.name} lokal gespeichert (Upload fehlgeschlagen)`, 'warning');
            }
        }

        // Bilder in LocalStorage speichern
        this.saveUploadedImages(uploadedImages);
    }

    /**
     * Hochgeladene Bilder speichern
     */
    saveUploadedImages(newImages) {
        const storageKey = `rentalImages_${this.currentRentalType}`;
        let existingImages = [];
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                existingImages = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Fehler beim Laden gespeicherter Bilder:', e);
        }

        // Neue Bilder hinzufügen
        existingImages = [...existingImages, ...newImages];
        
        // Duplikate entfernen (basierend auf URL)
        existingImages = existingImages.filter((img, index, self) => 
            index === self.findIndex(i => i.url === img.url)
        );

        localStorage.setItem(storageKey, JSON.stringify(existingImages));
        console.log('✅ Bilder gespeichert:', existingImages);
    }

    /**
     * Bild entfernen
     */
    removeImage(imageUrl) {
        const storageKey = `rentalImages_${this.currentRentalType}`;
        let images = [];
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                images = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Fehler beim Laden gespeicherter Bilder:', e);
        }

        images = images.filter(img => img.url !== imageUrl);
        localStorage.setItem(storageKey, JSON.stringify(images));
        
        this.toast('Bild entfernt', 'info');
    }

    /**
     * Rental-Daten speichern
     */
    saveRentalData() {
        const data = {
            type: this.currentRentalType,
            title: document.getElementById('rentalTitle')?.value || '',
            description: document.getElementById('rentalDescription')?.value || '',
            price: document.getElementById('rentalPrice')?.value || '',
            deposit: document.getElementById('rentalDeposit')?.value || '',
            images: this.getStoredImages()
        };

        const storageKey = `rentalData_${this.currentRentalType}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        this.toast('Daten gespeichert', 'success');
        console.log('✅ Rental-Daten gespeichert:', data);
    }

    /**
     * Rental-Daten laden
     */
    loadRentalData() {
        const storageKey = `rentalData_${this.currentRentalType}`;
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                
                if (document.getElementById('rentalTitle')) {
                    document.getElementById('rentalTitle').value = data.title || '';
                }
                if (document.getElementById('rentalDescription')) {
                    document.getElementById('rentalDescription').value = data.description || '';
                }
                if (document.getElementById('rentalPrice')) {
                    document.getElementById('rentalPrice').value = data.price || '';
                }
                if (document.getElementById('rentalDeposit')) {
                    document.getElementById('rentalDeposit').value = data.deposit || '';
                }

                // Bilder-Vorschau laden
                this.loadImagePreviews();
            }
        } catch (e) {
            console.warn('Fehler beim Laden der Rental-Daten:', e);
        }
    }

    /**
     * Gespeicherte Bilder laden und anzeigen
     */
    loadImagePreviews() {
        const previewContainer = document.getElementById('rentalImagePreview');
        if (!previewContainer) return;

        const images = this.getStoredImages();
        
        previewContainer.innerHTML = '';
        
        images.forEach(img => {
            const preview = document.createElement('div');
            preview.style.position = 'relative';
            preview.innerHTML = `
                <img src="${img.url}" alt="${img.filename || 'Bild'}" 
                     style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; border: 2px solid #ddd;">
                <button type="button" class="remove-image-btn" data-url="${img.url}"
                        style="position: absolute; top: 5px; right: 5px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-times" style="font-size: 0.75rem;"></i>
                </button>
            `;
            
            previewContainer.appendChild(preview);

            const removeBtn = preview.querySelector('.remove-image-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.removeImage(img.url);
                    preview.remove();
                });
            }
        });
    }

    /**
     * Gespeicherte Bilder abrufen
     */
    getStoredImages() {
        const storageKey = `rentalImages_${this.currentRentalType}`;
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Fehler beim Laden gespeicherter Bilder:', e);
        }
        
        return [];
    }

    /**
     * Formular zurücksetzen
     */
    resetRentalForm() {
        if (confirm('Möchten Sie das Formular wirklich zurücksetzen?')) {
            document.getElementById('rentalTitle').value = '';
            document.getElementById('rentalDescription').value = '';
            document.getElementById('rentalPrice').value = '';
            document.getElementById('rentalDeposit').value = '';
            
            const previewContainer = document.getElementById('rentalImagePreview');
            if (previewContainer) {
                previewContainer.innerHTML = '';
            }
            
            this.toast('Formular zurückgesetzt', 'info');
        }
    }

    /**
     * Rental Items laden
     */
    loadRentalItems() {
        try {
            const stored = localStorage.getItem('rentalItems');
            if (stored) {
                this.rentalItems = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Fehler beim Laden der Rental Items:', e);
            this.rentalItems = [];
        }
    }

    /**
     * Neuen Vermietungsgegenstand erstellen
     */
    createNewRentalItem() {
        const type = document.getElementById('newRentalType')?.value;
        const name = document.getElementById('newRentalName')?.value;
        const price = document.getElementById('newRentalPrice')?.value;
        const deposit = document.getElementById('newRentalDeposit')?.value;
        const description = document.getElementById('newRentalDescription')?.value;
        const status = document.getElementById('newRentalStatus')?.value;
        const imageFiles = document.getElementById('newRentalImages')?.files;

        if (!name || !type) {
            this.toast('Bitte füllen Sie alle Pflichtfelder aus', 'error');
            return;
        }

        // Bilder hochladen (falls vorhanden)
        if (imageFiles && imageFiles.length > 0) {
            this.handleImageUploadForNewItem(imageFiles, type, name, {
                price, deposit, description, status
            });
        } else {
            this.saveNewRentalItem(type, name, {
                price, deposit, description, status, images: []
            });
        }
    }

    /**
     * Bilder für neuen Vermietungsgegenstand hochladen
     */
    async handleImageUploadForNewItem(files, type, name, itemData) {
        const uploadedImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            try {
                if (window.awsMedia && window.awsMedia.uploadProfileImage) {
                    const userId = `rentals_${type}_${name}`;
                    const result = await window.awsMedia.uploadProfileImage(file, userId);
                    
                    if (result && result.publicUrl) {
                        uploadedImages.push({
                            url: result.publicUrl,
                            filename: file.name,
                            uploadedAt: new Date().toISOString()
                        });
                    }
                } else {
                    // Fallback: Base64
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        uploadedImages.push({
                            url: e.target.result,
                            filename: file.name,
                            uploadedAt: new Date().toISOString(),
                            isBase64: true
                        });
                    };
                    reader.readAsDataURL(file);
                }
            } catch (error) {
                console.error('Upload-Fehler:', error);
            }
        }

        itemData.images = uploadedImages;
        this.saveNewRentalItem(type, name, itemData);
    }

    /**
     * Neuen Vermietungsgegenstand speichern
     */
    saveNewRentalItem(type, name, itemData) {
        const newItem = {
            id: `${type}_${name}_${Date.now()}`,
            type,
            name,
            ...itemData,
            createdAt: new Date().toISOString()
        };

        this.rentalItems.push(newItem);
        localStorage.setItem('rentalItems', JSON.stringify(this.rentalItems));
        
        this.toast('Vermietungsgegenstand erstellt', 'success');
        
        // Formular zurücksetzen
        document.getElementById('newRentalName').value = '';
        document.getElementById('newRentalPrice').value = '';
        document.getElementById('newRentalDeposit').value = '';
        document.getElementById('newRentalDescription').value = '';
        document.getElementById('newRentalImages').value = '';
        
        // Liste aktualisieren
        this.renderRentalItemsList();
    }

    /**
     * Rental Items Liste rendern
     */
    renderRentalItemsList() {
        const listContainer = document.getElementById('rentalItemsList');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        this.rentalItems.forEach(item => {
            const card = document.createElement('div');
            card.style.cssText = 'background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
            
            card.innerHTML = `
                <h4 style="color: #333; margin-bottom: 0.5rem;">${item.name}</h4>
                <p style="color: #666; font-size: 0.875rem; margin-bottom: 1rem;">${item.type}</p>
                ${item.images && item.images.length > 0 ? `
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                        ${item.images.slice(0, 3).map(img => `
                            <img src="${img.url}" alt="${img.filename}" 
                                 style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;">
                        `).join('')}
                    </div>
                ` : ''}
                <div style="display: flex; gap: 0.5rem;">
                    <button class="edit-rental-item" data-id="${item.id}" 
                            style="flex: 1; padding: 0.5rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Bearbeiten
                    </button>
                    <button class="delete-rental-item" data-id="${item.id}" 
                            style="flex: 1; padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Löschen
                    </button>
                </div>
            `;
            
            listContainer.appendChild(card);
        });
    }

    /**
     * Toast-Nachricht anzeigen
     */
    toast(message, type = 'info') {
        // Einfache Toast-Implementierung
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Globale Verfügbarkeit
window.RentalsSection = RentalsSection;

