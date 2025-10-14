/**
 * Admin Data Sync - Synchronisiert Admin-Panel Daten mit Website
 * Löst das Problem mit Profilbild und Statistiken
 */

class AdminDataSync {
    constructor() {
        this.storageKey = 'manuel_weiss_website_data';
        this.init();
    }

    /**
     * Initialisierung
     */
    init() {
        console.log('🔄 Admin Data Sync initialisiert');
        this.loadStoredData();
        this.setupEventListeners();
        this.syncToWebsite();
    }

    /**
     * Gespeicherte Daten laden
     */
    loadStoredData() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                const data = JSON.parse(storedData);
                this.populateAdminForm(data);
                console.log('✅ Gespeicherte Daten geladen:', data);
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden der Daten:', error);
        }
    }

    /**
     * Admin-Formular mit Daten füllen
     */
    populateAdminForm(data) {
        // Hero-Statistiken
        if (data.stat1Number) {
            const stat1NumberEl = document.getElementById('hero-stat1-number');
            if (stat1NumberEl) stat1NumberEl.value = data.stat1Number;
        }
        if (data.stat1Label) {
            const stat1LabelEl = document.getElementById('hero-stat1-label');
            if (stat1LabelEl) stat1LabelEl.value = data.stat1Label;
        }
        if (data.stat2Number) {
            const stat2NumberEl = document.getElementById('hero-stat2-number');
            if (stat2NumberEl) stat2NumberEl.value = data.stat2Number;
        }
        if (data.stat2Label) {
            const stat2LabelEl = document.getElementById('hero-stat2-label');
            if (stat2LabelEl) stat2LabelEl.value = data.stat2Label;
        }
        if (data.stat3Number) {
            const stat3NumberEl = document.getElementById('hero-stat3-number');
            if (stat3NumberEl) stat3NumberEl.value = data.stat3Number;
        }
        if (data.stat3Label) {
            const stat3LabelEl = document.getElementById('hero-stat3-label');
            if (stat3LabelEl) stat3LabelEl.value = data.stat3Label;
        }

        // Profilbild
        if (data.profileImage) {
            this.updateProfileImage(data.profileImage);
        }

        // Weitere Daten
        if (data.name) {
            const nameEl = document.getElementById('hero-name');
            if (nameEl) nameEl.value = data.name;
        }
        if (data.title) {
            const titleEl = document.getElementById('hero-title');
            if (titleEl) titleEl.value = data.title;
        }
        if (data.description) {
            const descEl = document.getElementById('hero-description');
            if (descEl) descEl.value = data.description;
        }
    }

    /**
     * Event Listeners einrichten
     */
    setupEventListeners() {
        // Hero-Statistiken
        const statInputs = [
            'hero-stat1-number', 'hero-stat1-label',
            'hero-stat2-number', 'hero-stat2-label', 
            'hero-stat3-number', 'hero-stat3-label'
        ];

        statInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.saveData());
                element.addEventListener('change', () => this.saveData());
            }
        });

        // Profilbild-Upload
        const profileImageInput = document.getElementById('hero-image-upload');
        if (profileImageInput) {
            profileImageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Weitere Formular-Felder
        const formFields = ['hero-name', 'hero-title', 'hero-description'];
        formFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.saveData());
            }
        });

        // Speichern-Button
        const saveButton = document.getElementById('save-hero-data');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveData());
        }
    }

    /**
     * Daten speichern
     */
    saveData() {
        try {
            const data = {
                // Hero-Statistiken
                stat1Number: document.getElementById('hero-stat1-number')?.value || '5+',
                stat1Label: document.getElementById('hero-stat1-label')?.value || 'Jahre Erfahrung',
                stat2Number: document.getElementById('hero-stat2-number')?.value || '50+',
                stat2Label: document.getElementById('hero-stat2-label')?.value || 'Projekte',
                stat3Number: document.getElementById('hero-stat3-number')?.value || '100%',
                stat3Label: document.getElementById('hero-stat3-label')?.value || 'Zufriedenheit',
                
                // Profilbild
                profileImage: this.getCurrentProfileImage(),
                
                // Weitere Daten
                name: document.getElementById('hero-name')?.value || '',
                title: document.getElementById('hero-title')?.value || '',
                description: document.getElementById('hero-description')?.value || '',
                
                // Timestamp
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('💾 Daten gespeichert:', data);
            
            // Sofortige Synchronisation zur Website
            this.syncToWebsite();
            
            // Erfolgs-Feedback
            this.showSuccessMessage('Daten erfolgreich gespeichert!');
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            this.showErrorMessage('Fehler beim Speichern der Daten');
        }
    }

    /**
     * Aktuelles Profilbild abrufen
     */
    getCurrentProfileImage() {
        const currentImage = document.getElementById('current-profile-image');
        if (currentImage && currentImage.src) {
            return currentImage.src;
        }
        return 'manuel-weiss-photo.svg'; // Fallback
    }

    /**
     * Profilbild aktualisieren
     */
    updateProfileImage(imageSrc) {
        // Alle Profilbild-Vorschauen aktualisieren
        const imageElements = [
            'current-profile-image',
            'navLogoPreview',
            'heroImagePreview',
            'footerLogoPreview'
        ];

        imageElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.src = imageSrc;
                element.alt = 'Profilbild';
            }
        });

        console.log('🖼️ Profilbild aktualisiert:', imageSrc);
    }

    /**
     * Bild-Upload behandeln
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Datei-Validierung
        if (!file.type.startsWith('image/')) {
            this.showErrorMessage('Bitte wählen Sie eine Bilddatei aus');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB Limit
            this.showErrorMessage('Bild ist zu groß (max. 5MB)');
            return;
        }

        // Bild in Base64 konvertieren
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageSrc = e.target.result;
            this.updateProfileImage(imageSrc);
            this.saveData();
        };
        reader.readAsDataURL(file);
    }

    /**
     * Mit Website synchronisieren
     */
    syncToWebsite() {
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            
            // Website-Daten aktualisieren
            this.updateWebsiteData(data);
            
            console.log('🌐 Website-Synchronisation abgeschlossen');
        } catch (error) {
            console.error('❌ Website-Sync Fehler:', error);
        }
    }

    /**
     * Website-Daten aktualisieren
     */
    updateWebsiteData(data) {
        // Hero-Statistiken auf der Website aktualisieren
        if (data.stat1Number && data.stat1Label) {
            this.updateWebsiteElement('.hero-stat-1 .stat-number', data.stat1Number);
            this.updateWebsiteElement('.hero-stat-1 .stat-label', data.stat1Label);
        }
        
        if (data.stat2Number && data.stat2Label) {
            this.updateWebsiteElement('.hero-stat-2 .stat-number', data.stat2Number);
            this.updateWebsiteElement('.hero-stat-2 .stat-label', data.stat2Label);
        }
        
        if (data.stat3Number && data.stat3Label) {
            this.updateWebsiteElement('.hero-stat-3 .stat-number', data.stat3Number);
            this.updateWebsiteElement('.hero-stat-3 .stat-label', data.stat3Label);
        }

        // Profilbild auf der Website aktualisieren
        if (data.profileImage) {
            this.updateWebsiteElement('.profile-image', data.profileImage, 'src');
            this.updateWebsiteElement('.hero-image', data.profileImage, 'src');
        }

        // Weitere Website-Elemente
        if (data.name) {
            this.updateWebsiteElement('.hero-name', data.name);
        }
        if (data.title) {
            this.updateWebsiteElement('.hero-title', data.title);
        }
        if (data.description) {
            this.updateWebsiteElement('.hero-description', data.description);
        }
    }

    /**
     * Website-Element aktualisieren
     */
    updateWebsiteElement(selector, value, attribute = 'textContent') {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (attribute === 'src') {
                element.src = value;
            } else {
                element.textContent = value;
            }
        });
    }

    /**
     * Erfolgs-Nachricht anzeigen
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Fehler-Nachricht anzeigen
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Nachricht anzeigen
     */
    showMessage(message, type) {
        // Bestehende Nachrichten entfernen
        const existingMessage = document.querySelector('.admin-sync-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Neue Nachricht erstellen
        const messageEl = document.createElement('div');
        messageEl.className = `admin-sync-message ${type}`;
        messageEl.textContent = message;
        
        // Styling
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        document.body.appendChild(messageEl);

        // Nach 3 Sekunden entfernen
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 3000);
    }

    /**
     * Alle Daten zurücksetzen
     */
    resetData() {
        if (confirm('Möchten Sie wirklich alle Daten zurücksetzen?')) {
            localStorage.removeItem(this.storageKey);
            location.reload();
        }
    }

    /**
     * Daten exportieren
     */
    exportData() {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manuel-weiss-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Daten importieren
     */
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                localStorage.setItem(this.storageKey, JSON.stringify(data));
                this.populateAdminForm(data);
                this.showSuccessMessage('Daten erfolgreich importiert!');
            } catch (error) {
                this.showErrorMessage('Fehler beim Importieren der Daten');
            }
        };
        reader.readAsText(file);
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    window.adminDataSync = new AdminDataSync();
});

// Globale Funktionen für Admin-Panel
window.saveAdminData = function() {
    if (window.adminDataSync) {
        window.adminDataSync.saveData();
    }
};

window.resetAdminData = function() {
    if (window.adminDataSync) {
        window.adminDataSync.resetData();
    }
};

window.exportAdminData = function() {
    if (window.adminDataSync) {
        window.adminDataSync.exportData();
    }
};

window.importAdminData = function(event) {
    if (window.adminDataSync) {
        window.adminDataSync.importData(event);
    }
};
