// Einfaches Admin Dashboard - funktionierend + Live Updates
class SimpleAdminDashboard {
    constructor() {
        this.contentManager = null;
        this.currentSection = 'hero';
        this.autoSaveTimer = null;
        this.init();
    }

    async init() {
        console.log('Admin Dashboard wird initialisiert...');
        
        // Warte auf Content Manager
        await this.waitForContentManager();
        
        // Setup
        this.setupNavigation();
        this.setupImageUploads();
        this.setupAutoSave();
        this.loadHeroData();
        
        console.log('✅ Admin Dashboard bereit!');
    }

    async waitForContentManager() {
        let attempts = 0;
        while (!window.contentManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.contentManager) {
            this.contentManager = window.contentManager;
            console.log('✅ Content Manager verbunden');
            this.updateSyncStatus(true);
        } else {
            console.log('⚠️ Content Manager nicht gefunden - lokaler Modus');
            this.updateSyncStatus(false);
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section || e.target.closest('[data-section]').dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(sectionName) {
        // Navigation aktualisieren
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Sektionen aktualisieren
        document.querySelectorAll('.editor-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Titel aktualisieren
        const titles = {
            hero: 'Hero-Bereich bearbeiten',
            services: 'Beratungs-Services verwalten',
            activities: 'Sonstige Tätigkeiten verwalten',
            projects: 'Projekte verwalten',
            contact: 'Kontaktinformationen bearbeiten',
            settings: 'Einstellungen verwalten'
        };
        document.getElementById('section-title').textContent = titles[sectionName] || 'Bereich bearbeiten';

        this.currentSection = sectionName;
    }

    setupImageUploads() {
        // Profilbild Upload
        document.getElementById('profile-upload').addEventListener('click', () => {
            document.getElementById('profile-input').click();
        });

        document.getElementById('profile-input').addEventListener('change', (e) => {
            this.handleProfileImageUpload(e.target.files[0]);
        });

        // Service Image Uploads
        ['wohnmobil', 'fotobox', 'ebike', 'sup'].forEach(service => {
            const fileInput = document.getElementById(`${service}-files`);
            const dropZone = fileInput.parentElement;

            // Click to upload
            dropZone.addEventListener('click', () => fileInput.click());

            // File change
            fileInput.addEventListener('change', (e) => {
                this.handleServiceImageUpload(service, e.target.files);
            });

            // Drag and drop
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                this.handleServiceImageUpload(service, e.dataTransfer.files);
            });
        });
    }

    handleProfileImageUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profile-preview').src = e.target.result;
            
            if (this.contentManager && this.contentManager.content.hero) {
                this.contentManager.content.hero.profileImage = e.target.result;
                this.saveToContentManager();
            }
            
            this.showNotification('✅ Profilbild aktualisiert!', 'success');
        };
        reader.readAsDataURL(file);
    }

    handleServiceImageUpload(service, files) {
        if (!files || files.length === 0) return;

        const gallery = document.getElementById(`${service}-gallery`);
        
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    id: Date.now() + index,
                    title: `${service} Bild ${index + 1}`,
                    filename: file.name,
                    src: e.target.result,
                    uploadedAt: new Date().toISOString()
                };

                // Bild zur Galerie hinzufügen
                this.addImageToGallery(gallery, imageData, service);

                // Zu Content Manager hinzufügen
                if (this.contentManager) {
                    this.contentManager.addImage(service, imageData);
                    this.saveToContentManager();
                }
            };
            reader.readAsDataURL(file);
        });

        this.showNotification(`✅ ${files.length} Bilder für ${service} hochgeladen!`, 'success');
    }

    addImageToGallery(gallery, imageData, service) {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'image-item';
        imageDiv.innerHTML = `
            <img src="${imageData.src}" alt="${imageData.title}">
            <div class="image-overlay">
                <button class="btn btn-danger btn-sm" onclick="adminDashboard.removeImage('${service}', ${imageData.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="image-title">${imageData.title}</p>
        `;
        gallery.appendChild(imageDiv);
    }

    removeImage(service, imageId) {
        // Aus DOM entfernen
        const gallery = document.getElementById(`${service}-gallery`);
        const imageItems = gallery.querySelectorAll('.image-item');
        imageItems.forEach(item => {
            const button = item.querySelector(`[onclick*="${imageId}"]`);
            if (button) {
                item.remove();
            }
        });

        // Aus Content Manager entfernen
        if (this.contentManager) {
            this.contentManager.removeImage(service, imageId);
            this.saveToContentManager();
        }

        this.showNotification('✅ Bild entfernt!', 'success');
    }

    setupAutoSave() {
        // Auto-save bei Eingaben
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea')) {
                this.scheduleAutoSave();
            }
        });
    }

    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveAllData();
        }, 1000); // 1 Sekunde nach letzter Änderung
    }

    loadHeroData() {
        if (!this.contentManager || !this.contentManager.content.hero) return;

        const hero = this.contentManager.content.hero;
        
        // Grunddaten laden
        if (hero.name) document.getElementById('hero-name').value = hero.name;
        if (hero.title) document.getElementById('hero-title').value = hero.title;
        if (hero.subtitle) document.getElementById('hero-subtitle').value = hero.subtitle;
        if (hero.description) document.getElementById('hero-description').value = hero.description;

        // Statistiken laden
        if (hero.stats && hero.stats.length >= 3) {
            document.getElementById('stat1-name').value = hero.stats[0].name || '';
            document.getElementById('stat1-value').value = hero.stats[0].value || '';
            document.getElementById('stat1-unit').value = hero.stats[0].unit || '';
            
            document.getElementById('stat2-name').value = hero.stats[1].name || '';
            document.getElementById('stat2-value').value = hero.stats[1].value || '';
            document.getElementById('stat2-unit').value = hero.stats[1].unit || '';
            
            document.getElementById('stat3-name').value = hero.stats[2].name || '';
            document.getElementById('stat3-value').value = hero.stats[2].value || '';
            document.getElementById('stat3-unit').value = hero.stats[2].unit || '';
        }

        // Profilbild laden
        if (hero.profileImage) {
            document.getElementById('profile-preview').src = hero.profileImage;
        }
    }

    saveAllData() {
        this.collectHeroData();
        this.saveToContentManager();
        this.updateSaveStatus('Automatisch gespeichert');
    }

    collectHeroData() {
        if (!this.contentManager || !this.contentManager.content.hero) return;

        const hero = this.contentManager.content.hero;
        
        // Grunddaten sammeln
        hero.name = document.getElementById('hero-name').value;
        hero.title = document.getElementById('hero-title').value;
        hero.subtitle = document.getElementById('hero-subtitle').value;
        hero.description = document.getElementById('hero-description').value;

        // Statistiken sammeln
        if (!hero.stats) hero.stats = [];
        
        hero.stats[0] = {
            name: document.getElementById('stat1-name').value,
            value: parseInt(document.getElementById('stat1-value').value) || 0,
            unit: document.getElementById('stat1-unit').value
        };
        
        hero.stats[1] = {
            name: document.getElementById('stat2-name').value,
            value: parseInt(document.getElementById('stat2-value').value) || 0,
            unit: document.getElementById('stat2-unit').value
        };
        
        hero.stats[2] = {
            name: document.getElementById('stat3-name').value,
            value: parseInt(document.getElementById('stat3-value').value) || 0,
            unit: document.getElementById('stat3-unit').value
        };
    }

    async saveToContentManager() {
        if (!this.contentManager) return;

        try {
            // Website neu rendern
            this.contentManager.renderWebsite();
            
            // Daten speichern
            await this.contentManager.saveContent();
            
            console.log('✅ Daten gespeichert und Website aktualisiert');
            this.updateSyncStatus(true);
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            this.updateSyncStatus(false);
        }
    }

    updateSyncStatus(success) {
        const indicator = document.getElementById('sync-indicator');
        if (!indicator) return;

        if (success) {
            indicator.innerHTML = '🟢 Live Updates aktiv';
            indicator.className = 'sync-live';
        } else {
            indicator.innerHTML = '🔴 Offline Modus';
            indicator.className = 'sync-error';
        }
    }

    updateSaveStatus(message) {
        const status = document.getElementById('save-status');
        if (status) {
            status.textContent = message;
            status.style.color = '#10b981';
            
            setTimeout(() => {
                status.style.color = '#6b7280';
            }, 2000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Entfernen nach 3 Sekunden
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Globale Instanz
let adminDashboard;

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new SimpleAdminDashboard();
});

// Globale Funktionen
function saveAllChanges() {
    adminDashboard.saveAllData();
    adminDashboard.showNotification('✅ Alle Änderungen gespeichert und live aktualisiert!', 'success');
}

function previewWebsite() {
    window.open('/', '_blank');
}

function publishChanges() {
    adminDashboard.saveToContentManager();
    adminDashboard.showNotification('✅ Änderungen live veröffentlicht!', 'success');
}

function resetChanges() {
    if (confirm('Möchtest du alle ungespeicherten Änderungen zurücksetzen?')) {
        adminDashboard.loadHeroData();
        adminDashboard.showNotification('Änderungen zurückgesetzt', 'info');
    }
}