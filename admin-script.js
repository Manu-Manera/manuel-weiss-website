// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'hero';
        this.autoSaveTimer = null;
        this.changes = {};
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupImageUpload();
        this.setupAutoSave();
        this.setupFormHandlers();
        this.loadCurrentData();
    }

    // Navigation Setup
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.editor-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        // Update title
        const titles = {
            'hero': 'Hero-Bereich bearbeiten',
            'services': 'Beratungs-Services bearbeiten',
            'rental': 'Vermietung bearbeiten',
            'projects': 'Projekte bearbeiten',
            'contact': 'Kontakt bearbeiten',
            'settings': 'Einstellungen bearbeiten'
        };
        document.getElementById('section-title').textContent = titles[section];

        this.currentSection = section;
    }

    // Image Upload Setup
    setupImageUpload() {
        const uploadArea = document.getElementById('profile-upload');
        const fileInput = document.getElementById('profile-input');

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drop-zone');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drop-zone');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drop-zone');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file);
            }
        });
    }

    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('profile-preview');
            preview.src = e.target.result;
            
            // Update main website image
            const mainImage = document.getElementById('profile-photo');
            if (mainImage) {
                mainImage.src = e.target.result;
            }

            this.showNotification('Profilbild erfolgreich aktualisiert', 'success');
            this.markAsChanged('profile-image', e.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Auto Save Setup
    setupAutoSave() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.scheduleAutoSave();
            });
        });
    }

    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.autoSave();
        }, 2000);
    }

    autoSave() {
        this.collectChanges();
        this.showAutoSaveIndicator();
        // In a real implementation, this would save to localStorage or server
        setTimeout(() => {
            this.hideAutoSaveIndicator();
        }, 2000);
    }

    showAutoSaveIndicator() {
        let indicator = document.querySelector('.auto-save');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'auto-save';
            document.body.appendChild(indicator);
        }
        indicator.textContent = 'Automatisch gespeichert';
        indicator.classList.add('show');
    }

    hideAutoSaveIndicator() {
        const indicator = document.querySelector('.auto-save');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    // Form Handlers
    setupFormHandlers() {
        // Hero section
        this.setupHeroHandlers();
        
        // Services
        this.setupServiceHandlers();
        
        // Rental
        this.setupRentalHandlers();
        
        // Projects
        this.setupProjectHandlers();
        
        // Contact
        this.setupContactHandlers();
        
        // Settings
        this.setupSettingsHandlers();
    }

    setupHeroHandlers() {
        const heroInputs = ['hero-name', 'hero-title', 'hero-subtitle', 'hero-description'];
        heroInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateHeroContent(id, input.value);
                });
            }
        });

        // Stats
        const statInputs = ['stat-years', 'stat-projects', 'stat-satisfaction'];
        statInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateStats(id, input.value);
                });
            }
        });
    }

    setupServiceHandlers() {
        // Service cards are handled dynamically
        this.updateServiceCards();
    }

    setupRentalHandlers() {
        // Rental cards are handled dynamically
        this.updateRentalCards();
    }

    setupProjectHandlers() {
        // Project cards are handled dynamically
        this.updateProjectCards();
    }

    setupContactHandlers() {
        const contactInputs = ['contact-name', 'contact-title', 'contact-location', 'contact-email', 'contact-phone'];
        contactInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateContactInfo(id, input.value);
                });
            }
        });
    }

    setupSettingsHandlers() {
        // Color pickers
        const primaryColor = document.getElementById('primary-color');
        if (primaryColor) {
            primaryColor.addEventListener('change', () => {
                this.updatePrimaryColor(primaryColor.value);
            });
        }

        const secondaryColor = document.getElementById('secondary-color');
        if (secondaryColor) {
            secondaryColor.addEventListener('change', () => {
                this.updateSecondaryColor(secondaryColor.value);
            });
        }

        // Gradient selector
        const gradientSelect = document.getElementById('hero-gradient');
        if (gradientSelect) {
            gradientSelect.addEventListener('change', () => {
                this.updateHeroGradient(gradientSelect.value);
            });
        }
    }

    // Content Update Functions
    updateHeroContent(field, value) {
        const mappings = {
            'hero-name': '.profile-info h1',
            'hero-title': '.profile-info h2',
            'hero-subtitle': '.hero-subtitle',
            'hero-description': '.hero-description'
        };

        const selector = mappings[field];
        if (selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        }

        this.markAsChanged(field, value);
    }

    updateStats(field, value) {
        const mappings = {
            'stat-years': '.stat:nth-child(1) .stat-number',
            'stat-projects': '.stat:nth-child(2) .stat-number',
            'stat-satisfaction': '.stat:nth-child(3) .stat-number'
        };

        const selector = mappings[field];
        if (selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value + (field === 'stat-satisfaction' ? '%' : '+');
            }
        }

        this.markAsChanged(field, value);
    }

    updateContactInfo(field, value) {
        const mappings = {
            'contact-name': '.contact-item:nth-child(1) h4',
            'contact-title': '.contact-item:nth-child(1) p',
            'contact-location': '.contact-item:nth-child(2) p',
            'contact-email': '.contact-item:nth-child(3) p',
            'contact-phone': '.contact-item:nth-child(4) p'
        };

        const selector = mappings[field];
        if (selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        }

        this.markAsChanged(field, value);
    }

    updatePrimaryColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        this.markAsChanged('primary-color', color);
    }

    updateSecondaryColor(color) {
        document.documentElement.style.setProperty('--secondary-color', color);
        this.markAsChanged('secondary-color', color);
    }

    updateHeroGradient(gradient) {
        const gradients = {
            'blue-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'green-blue': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'orange-red': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'purple-pink': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        };

        const hero = document.querySelector('.hero');
        if (hero && gradients[gradient]) {
            hero.style.background = gradients[gradient];
        }

        this.markAsChanged('hero-gradient', gradient);
    }

    // Dynamic Content Management
    addService() {
        const container = document.getElementById('services-container');
        const serviceId = Date.now();
        const serviceCard = this.createServiceCard(serviceId);
        container.appendChild(serviceCard);
        this.updateServiceCards();
    }

    removeService(id) {
        const serviceCard = document.querySelector(`[data-service-id="${id}"]`);
        if (serviceCard) {
            serviceCard.remove();
            this.updateServiceCards();
        }
    }

    createServiceCard(id) {
        const card = document.createElement('div');
        card.className = 'service-editor-card';
        card.setAttribute('data-service-id', id);
        card.innerHTML = `
            <div class="service-header">
                <h4>Service ${id}: Neuer Service</h4>
                <button class="btn btn-danger btn-sm" onclick="adminPanel.removeService(${id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="service-content">
                <div class="form-group">
                    <label>Icon (FontAwesome Klasse)</label>
                    <input type="text" value="fas fa-cog" class="service-icon">
                </div>
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" value="Neuer Service" class="service-title">
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea rows="3" class="service-description">Beschreibung des neuen Services.</textarea>
                </div>
                <div class="form-group">
                    <label>Leistungen (durch Kommas getrennt)</label>
                    <input type="text" value="Leistung 1, Leistung 2, Leistung 3" class="service-features">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" class="service-primary"> Primärer Service (hervorgehoben)
                    </label>
                </div>
            </div>
        `;
        return card;
    }

    addRental() {
        const container = document.getElementById('rental-container');
        const rentalId = Date.now();
        const rentalCard = this.createRentalCard(rentalId);
        container.appendChild(rentalCard);
        this.updateRentalCards();
    }

    removeRental(id) {
        const rentalCard = document.querySelector(`[data-rental-id="${id}"]`);
        if (rentalCard) {
            rentalCard.remove();
            this.updateRentalCards();
        }
    }

    createRentalCard(id) {
        const card = document.createElement('div');
        card.className = 'rental-editor-card';
        card.setAttribute('data-rental-id', id);
        card.innerHTML = `
            <div class="rental-header">
                <h4>Vermietung ${id}: Neue Vermietung</h4>
                <button class="btn btn-danger btn-sm" onclick="adminPanel.removeRental(${id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="rental-content">
                <div class="form-group">
                    <label>Icon (FontAwesome Klasse)</label>
                    <input type="text" value="fas fa-box" class="rental-icon">
                </div>
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" value="Neue Vermietung" class="rental-title">
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea rows="3" class="rental-description">Beschreibung der neuen Vermietung.</textarea>
                </div>
                <div class="form-group">
                    <label>Features (durch Kommas getrennt)</label>
                    <input type="text" value="Feature 1, Feature 2, Feature 3" class="rental-features">
                </div>
            </div>
        `;
        return card;
    }

    addProject() {
        const container = document.getElementById('projects-container');
        const projectId = Date.now();
        const projectCard = this.createProjectCard(projectId);
        container.appendChild(projectCard);
        this.updateProjectCards();
    }

    removeProject(id) {
        const projectCard = document.querySelector(`[data-project-id="${id}"]`);
        if (projectCard) {
            projectCard.remove();
            this.updateProjectCards();
        }
    }

    createProjectCard(id) {
        const card = document.createElement('div');
        card.className = 'project-editor-card';
        card.setAttribute('data-project-id', id);
        card.innerHTML = `
            <div class="project-header">
                <h4>Projekt ${id}: Neues Projekt</h4>
                <button class="btn btn-danger btn-sm" onclick="adminPanel.removeProject(${id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="project-content">
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" value="Neues Projekt" class="project-title">
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea rows="3" class="project-description">Beschreibung des neuen Projekts.</textarea>
                </div>
                <div class="form-group">
                    <label>Tags (durch Kommas getrennt)</label>
                    <input type="text" value="Tag1, Tag2, Tag3" class="project-tags">
                </div>
            </div>
        `;
        return card;
    }

    addCertificate() {
        const container = document.getElementById('certificates-container');
        const certificateItem = document.createElement('div');
        certificateItem.className = 'certificate-item';
        certificateItem.innerHTML = `
            <input type="text" value="Neues Zertifikat" class="certificate-name">
            <button class="btn btn-danger btn-sm" onclick="adminPanel.removeCertificate(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(certificateItem);
    }

    removeCertificate(button) {
        button.parentElement.remove();
    }

    // Update Functions
    updateServiceCards() {
        // This would update the main website services section
        // Implementation depends on how you want to sync with the main site
    }

    updateRentalCards() {
        // This would update the main website rental section
    }

    updateProjectCards() {
        // This would update the main website projects section
    }

    // Utility Functions
    markAsChanged(field, value) {
        this.changes[field] = value;
    }

    collectChanges() {
        // Collect all form data
        const formData = {};
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.id) {
                formData[input.id] = input.value;
            }
        });
        return formData;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    loadCurrentData() {
        // Load current website data into admin panel
        // This would typically fetch from localStorage or server
    }

    // Save and Publish Functions
    saveAllChanges() {
        const changes = this.collectChanges();
        // Save to localStorage for now
        localStorage.setItem('websiteData', JSON.stringify(changes));
        this.showNotification('Alle Änderungen gespeichert', 'success');
    }

    publishChanges() {
        this.saveAllChanges();
        // In a real implementation, this would deploy to the live website
        this.showNotification('Änderungen veröffentlicht', 'success');
    }

    resetChanges() {
        if (confirm('Möchten Sie alle Änderungen zurücksetzen?')) {
            location.reload();
        }
    }

    previewWebsite() {
        // Open website in new tab for preview
        window.open('index.html', '_blank');
    }
}

// Global Functions for HTML onclick handlers
function saveAllChanges() {
    adminPanel.saveAllChanges();
}

function publishChanges() {
    adminPanel.publishChanges();
}

function resetChanges() {
    adminPanel.resetChanges();
}

function previewWebsite() {
    adminPanel.previewWebsite();
}

function addService() {
    adminPanel.addService();
}

function removeService(id) {
    adminPanel.removeService(id);
}

function addRental() {
    adminPanel.addRental();
}

function removeRental(id) {
    adminPanel.removeRental(id);
}

function addProject() {
    adminPanel.addProject();
}

function removeProject(id) {
    adminPanel.removeProject(id);
}

function addCertificate() {
    adminPanel.addCertificate();
}

function removeCertificate(button) {
    adminPanel.removeCertificate(button);
}

// Initialize Admin Panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                adminPanel.saveAllChanges();
                break;
            case 'p':
                e.preventDefault();
                adminPanel.publishChanges();
                break;
        }
    }
}); 