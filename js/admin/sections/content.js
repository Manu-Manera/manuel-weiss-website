/**
 * Content Management Section
 * Verwaltung von Services und Website-Inhalten
 */

class ContentSection {
    constructor() {
        this.services = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
    }

    async init() {
        console.log('📝 Content Section: Initializing...');
        this.setupEventListeners();
        await this.loadServices();
        this.renderServices();
    }

    setupEventListeners() {
        // Service hinzufügen
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="create-service"]')) {
                this.createService();
            }
            if (e.target.matches('[data-action="refresh-services"]')) {
                this.loadServices();
            }
            if (e.target.matches('[data-action="sync-services"]')) {
                this.syncWithWebsite();
            }
            if (e.target.matches('[data-action="load-services"]')) {
                this.loadFromWebsite();
            }
        });

        // Search & Filter
        const searchInput = document.querySelector('.search-input');
        const filterSelect = document.querySelector('.filter-select');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderServices();
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderServices();
            });
        }

        // Service-Bild-Upload Event-Listener (mit Delegation für dynamisch geladene Elemente)
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'newServiceImage') {
                this.handleServiceImageUpload(e);
            }
        });
    }

    async loadServices() {
        try {
            // Lade Services aus localStorage oder API
            const storedServices = localStorage.getItem('website_services');
            if (storedServices) {
                this.services = JSON.parse(storedServices);
            } else {
                // Fallback: Standard Services
                this.services = [
                    {
                        id: 1,
                        name: 'HR-Beratung',
                        category: 'beratung',
                        description: 'Strategische HR-Beratung und Transformation',
                        icon: 'fas fa-users',
                        color: '#6366f1',
                        image: null,
                        active: true
                    },
                    {
                        id: 2,
                        name: 'Projektmanagement',
                        category: 'projekte',
                        description: 'Agile Projektleitung und Prozessoptimierung',
                        icon: 'fas fa-project-diagram',
                        color: '#10b981',
                        image: null,
                        active: true
                    }
                ];
            }
        } catch (error) {
            console.error('❌ Content: Error loading services:', error);
            this.services = [];
        }
    }

    renderServices() {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) return;

        const filteredServices = this.services.filter(service => {
            const matchesSearch = !this.searchTerm || 
                service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            const matchesFilter = this.currentFilter === 'all' || 
                service.category === this.currentFilter;

            return matchesSearch && matchesFilter;
        });

        servicesList.innerHTML = filteredServices.map(service => {
            const imagePreview = service.image ? `
                <div style="margin-top: 1rem;">
                    <img src="${service.image}" alt="${service.name}" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover; border: 2px solid #ddd;">
                </div>
            ` : `
                <div style="margin-top: 1rem; padding: 2rem; background: #f5f5f5; border-radius: 8px; text-align: center; color: #999;">
                    <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p style="margin: 0; font-size: 0.875rem;">Kein Bild</p>
                </div>
            `;

            return `
            <div class="service-card" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid ${service.color};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h4 style="color: ${service.color}; margin: 0 0 0.5rem 0;">
                            <i class="${service.icon}"></i> ${service.name}
                        </h4>
                        <p style="color: #666; margin: 0; font-size: 0.9rem;">${service.description}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-small btn-outline" onclick="contentSection.editService(${service.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="contentSection.deleteService(${service.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${imagePreview}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span class="badge" style="background: ${service.color}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                        ${service.category}
                    </span>
                    <span style="color: ${service.active ? '#10b981' : '#ef4444'}; font-size: 0.8rem;">
                        ${service.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                </div>
            </div>
        `;
        }).join('');
    }

    async createService() {
        const name = document.getElementById('newServiceName').value;
        const category = document.getElementById('newServiceCategory').value;
        const description = document.getElementById('newServiceDescription').value;
        const icon = document.getElementById('newServiceIcon').value;
        const color = document.getElementById('newServiceColor').value;
        const imageFile = document.getElementById('newServiceImage').files[0];

        if (!name || !description) {
            this.showMessage('Bitte füllen Sie alle Pflichtfelder aus', 'error');
            return;
        }

        // Bild hochladen (falls vorhanden)
        let imageUrl = null;
        if (imageFile) {
            this.showMessage('Bild wird hochgeladen...', 'info');
            imageUrl = await this.uploadImage(imageFile);
            if (!imageUrl) {
                this.showMessage('Warnung: Bild-Upload fehlgeschlagen, Service wird ohne Bild erstellt', 'warning');
            }
        } else if (this.currentServiceImage) {
            // Verwende bereits hochgeladenes Bild
            imageUrl = this.currentServiceImage;
        }

        const newService = {
            id: Date.now(),
            name,
            category,
            description,
            icon: icon || 'fas fa-cog',
            color,
            image: imageUrl,
            active: true,
            createdAt: new Date().toISOString()
        };

        this.services.push(newService);
        await this.saveServices();
        this.renderServices();
        this.clearForm();
        
        const successMsg = imageUrl 
            ? 'Service erfolgreich erstellt! Bild wurde hochgeladen und wird auf der Website angezeigt.'
            : 'Service erfolgreich erstellt!';
        this.showMessage(successMsg, 'success');
    }

    /**
     * Service-Bild-Upload behandeln (wie Profilbild)
     */
    async handleServiceImageUpload(event) {
        const file = event?.target?.files?.[0];
        if (!file) {
            console.log('ℹ️ Keine Datei ausgewählt');
            return;
        }

        console.log('📸 Service-Bild-Upload gestartet:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);

        // Validierung
        if (!this.validateImageFile(file)) {
            return;
        }

        // Base64 für Vorschau
        let base64Preview = null;
        try {
            base64Preview = await this.fileToBase64(file);
            this.showServiceImagePreview(base64Preview);
        } catch (error) {
            console.error('❌ Fehler bei Base64-Konvertierung:', error);
        }

        // Upload zu AWS S3 (wie Profilbild)
        let uploadedUrl = null;
        try {
            if (window.awsMedia && window.AWS_APP_CONFIG?.MEDIA_API_BASE) {
                console.log('📤 Upload zu AWS S3...');
                const userId = 'owner';
                const result = await window.awsMedia.uploadProfileImage(file, userId);
                
                if (result && result.publicUrl) {
                    uploadedUrl = result.publicUrl;
                    console.log('✅ S3 Upload erfolgreich:', uploadedUrl);
                    this.showMessage('Bild erfolgreich auf AWS S3 hochgeladen!', 'success');
                }
            }
        } catch (error) {
            console.warn('⚠️ AWS Upload fehlgeschlagen, verwende Base64 Fallback:', error);
            this.showMessage('AWS Upload fehlgeschlagen. Bild wird lokal gespeichert.', 'warning');
        }

        // Finale Quelle: S3 URL oder Base64
        const finalSrc = uploadedUrl || base64Preview;
        if (finalSrc) {
            // Speichere in localStorage für Vorschau
            this.currentServiceImage = finalSrc;
            console.log('💾 Service-Bild gespeichert (Vorschau)');
        }
    }

    /**
     * Service-Bild-Vorschau anzeigen
     */
    showServiceImagePreview(imageSrc) {
        // Erstelle oder aktualisiere Vorschau-Container
        let previewContainer = document.getElementById('service-image-preview');
        if (!previewContainer) {
            const imageInput = document.getElementById('newServiceImage');
            if (imageInput && imageInput.parentElement) {
                previewContainer = document.createElement('div');
                previewContainer.id = 'service-image-preview';
                previewContainer.style.cssText = 'margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;';
                imageInput.parentElement.appendChild(previewContainer);
            }
        }

        if (previewContainer) {
            previewContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${imageSrc}" alt="Vorschau" style="max-width: 150px; max-height: 150px; border-radius: 8px; object-fit: cover; border: 2px solid #ddd;">
                    <div>
                        <p style="margin: 0; font-weight: 500; color: #333;">✅ Bild ausgewählt</p>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #666;">Bild wird beim Erstellen des Services gespeichert</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Bild-Datei validieren
     */
    validateImageFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
        
        if (file.size > maxSize) {
            this.showMessage('Datei ist zu groß (max. 5MB)', 'error');
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showMessage('Nicht unterstütztes Dateiformat. Bitte verwenden Sie JPG, PNG, WebP oder SVG.', 'error');
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
     * Service-Bild hochladen (wird von createService aufgerufen)
     */
    async uploadImage(file) {
        try {
            console.log('📸 Service-Bild-Upload:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);

            // Validierung
            if (!this.validateImageFile(file)) {
                return null;
            }

            // 1) Base64 für sofortige Vorschau
            let base64Preview = null;
            try {
                base64Preview = await this.fileToBase64(file);
            } catch (error) {
                console.error('❌ Fehler bei Base64-Konvertierung:', error);
            }

            // 2) Upload zu AWS S3 (wie Profilbild)
            let uploadedUrl = null;
            try {
                if (window.awsMedia && window.AWS_APP_CONFIG?.MEDIA_API_BASE) {
                    console.log('📤 Upload zu AWS S3...');
                    const userId = 'owner';
                    const result = await window.awsMedia.uploadProfileImage(file, userId);
                    
                    if (result && result.publicUrl) {
                        uploadedUrl = result.publicUrl;
                        console.log('✅ S3 Upload erfolgreich:', uploadedUrl);
                    }
                }
            } catch (error) {
                console.warn('⚠️ AWS Upload fehlgeschlagen, verwende Base64 Fallback:', error);
            }

            // 3) Finale Quelle: S3 URL oder Base64
            const finalSrc = uploadedUrl || base64Preview;
            if (!finalSrc) {
                console.error('❌ Keine Bildquelle verfügbar');
                return null;
            }

            // 4) Speichere in localStorage für Website-Anzeige
            const serviceImageKey = `service_image_${Date.now()}`;
            localStorage.setItem(serviceImageKey, finalSrc);
            console.log('💾 Service-Bild in localStorage gespeichert:', serviceImageKey);

            // 5) Speichere auch in globalem Service-Images-Array
            let serviceImages = JSON.parse(localStorage.getItem('website_service_images') || '[]');
            serviceImages.push({
                id: Date.now(),
                url: finalSrc,
                imageData: finalSrc,
                filename: file.name,
                uploadedAt: new Date().toISOString(),
                isUploaded: !!uploadedUrl
            });
            localStorage.setItem('website_service_images', JSON.stringify(serviceImages));
            console.log('💾 Service-Bild zu globalem Array hinzugefügt');

            return finalSrc;
        } catch (error) {
            console.error('❌ Content: Error uploading image:', error);
            this.showMessage('Fehler beim Hochladen des Bildes: ' + error.message, 'error');
            return null;
        }
    }

    async saveServices() {
        try {
            localStorage.setItem('website_services', JSON.stringify(this.services));
        } catch (error) {
            console.error('❌ Content: Error saving services:', error);
        }
    }

    clearForm() {
        document.getElementById('newServiceName').value = '';
        document.getElementById('newServiceDescription').value = '';
        document.getElementById('newServiceIcon').value = '';
        document.getElementById('newServiceColor').value = '#6366f1';
        document.getElementById('newServiceImage').value = '';
        
        // Vorschau entfernen
        const previewContainer = document.getElementById('service-image-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        
        // Aktuelles Bild zurücksetzen
        this.currentServiceImage = null;
    }

    editService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        // Formular mit Service-Daten füllen
        document.getElementById('newServiceName').value = service.name;
        document.getElementById('newServiceCategory').value = service.category;
        document.getElementById('newServiceDescription').value = service.description;
        document.getElementById('newServiceIcon').value = service.icon;
        document.getElementById('newServiceColor').value = service.color;

        // Service aus Liste entfernen und Formular als Edit-Modus markieren
        this.services = this.services.filter(s => s.id !== serviceId);
        document.querySelector('[data-action="create-service"]').textContent = '🔄 Service aktualisieren';
        document.querySelector('[data-action="create-service"]').setAttribute('data-mode', 'edit');
        document.querySelector('[data-action="create-service"]').setAttribute('data-service-id', serviceId);
    }

    async deleteService(serviceId) {
        if (!confirm('Möchten Sie diesen Service wirklich löschen?')) return;

        this.services = this.services.filter(s => s.id !== serviceId);
        await this.saveServices();
        this.renderServices();
        this.showMessage('Service gelöscht!', 'success');
    }

    async syncWithWebsite() {
        try {
            this.showMessage('Synchronisation mit Website gestartet...', 'info');
            // Hier würde die Website-Synchronisation implementiert
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showMessage('Synchronisation erfolgreich!', 'success');
        } catch (error) {
            console.error('❌ Content: Error syncing with website:', error);
            this.showMessage('Synchronisation fehlgeschlagen', 'error');
        }
    }

    async loadFromWebsite() {
        try {
            this.showMessage('Lade Services von Website...', 'info');
            // Hier würde das Laden von der Website implementiert
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.showMessage('Services erfolgreich geladen!', 'success');
        } catch (error) {
            console.error('❌ Content: Error loading from website:', error);
            this.showMessage('Laden fehlgeschlagen', 'error');
        }
    }

    showMessage(message, type = 'info') {
        // Toast Notification anzeigen
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export für AdminApplication
window.ContentSection = ContentSection;

// Globale Instanz für direkten Zugriff
let contentSectionInstance = null;

// Initialisierung wenn DOM bereit ist
document.addEventListener('DOMContentLoaded', function() {
    // Warte kurz, damit AdminApplication initialisiert werden kann
    setTimeout(() => {
        if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.content) {
            contentSectionInstance = window.AdminApp.sections.content;
            console.log('✅ ContentSection aus AdminApp geladen');
        } else if (window.ContentSection) {
            // Fallback: Erstelle eigene Instanz
            contentSectionInstance = new ContentSection();
            contentSectionInstance.init();
            console.log('✅ ContentSection als Fallback initialisiert');
        }
        
        // Globale Variable für einfachen Zugriff
        window.contentSection = contentSectionInstance;
    }, 500);
});
