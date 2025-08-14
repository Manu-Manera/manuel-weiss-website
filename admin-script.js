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
        this.setupSubmenus();
        this.setupImageUpload();
        this.setupAutoSave();
        this.setupFormHandlers();
        this.loadCurrentData();
    }

    // Submenu Setup
    setupSubmenus() {
        const submenuItems = document.querySelectorAll('.nav-item-with-submenu');
        submenuItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                item.classList.toggle('open');
            });
        });
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
            'profile': 'Beraterprofil bearbeiten',
            'services': 'Beratungs-Services bearbeiten',
            'activities': 'Sonstige Tätigkeiten bearbeiten',
            'wohnmobil': 'Wohnmobil bearbeiten',
            'fotobox': 'Fotobox bearbeiten',
            'sup': 'Stand-Up-Paddle bearbeiten',
            'ebike': 'E-Bike bearbeiten',
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
            
            // Update main website image immediately (falls die Seite offen ist)
            const mainImage = document.getElementById('profile-photo');
            if (mainImage) {
                mainImage.src = e.target.result;
            }

            // Speichere das Bild auch als Original-Datei-Ersatz
            // Damit die Hauptseite das neue Bild lädt
            try {
                // Simuliere Server-Update durch localStorage
                localStorage.setItem('current-profile-image', e.target.result);
                
                // Sende Update an Hauptfenster (falls offen)
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({
                        type: 'updateProfileImage',
                        imageData: e.target.result
                    }, '*');
                }
            } catch (error) {
                console.log('Kommunikation mit Hauptfenster nicht möglich:', error);
            }

            // Save to localStorage for persistence (multiple keys for reliability)
            localStorage.setItem('profileImage', e.target.result);
            localStorage.setItem('mwps-profile-image', e.target.result);
            
            // Also save to main website data
            const existingData = JSON.parse(localStorage.getItem('websiteData') || '{}');
            existingData.profileImage = e.target.result;
            localStorage.setItem('websiteData', JSON.stringify(existingData));

            // Automatisch alle Daten speichern nach Bildupload
            this.saveAllChanges();

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
        
        // Profile
        this.setupProfileHandlers();
        
        // Services
        this.setupServiceHandlers();
        
        // Activities
        this.setupActivityHandlers();
        
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
        const statFields = ['stat1', 'stat2', 'stat3'];
        statFields.forEach(stat => {
            const nameInput = document.getElementById(`${stat}-name`);
            const valueInput = document.getElementById(`${stat}-value`);
            const unitInput = document.getElementById(`${stat}-unit`);
            
            if (nameInput) {
                nameInput.addEventListener('input', () => {
                    this.updateStatLabel(stat, nameInput.value);
                });
            }
            if (valueInput) {
                valueInput.addEventListener('input', () => {
                    this.updateStatValue(stat, valueInput.value, unitInput ? unitInput.value : '');
                });
            }
            if (unitInput) {
                unitInput.addEventListener('input', () => {
                    this.updateStatValue(stat, valueInput ? valueInput.value : '', unitInput.value);
                });
            }
        });
    }

    setupProfileHandlers() {
        const profileInputs = ['profile-title', 'profile-description', 'profile-availability'];
        profileInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateProfileContent(id, input.value);
                });
            }
        });
    }

    setupServiceHandlers() {
        // Service cards are handled dynamically
        this.updateServiceCards();
    }

    setupActivityHandlers() {
        // Activity cards are handled dynamically
        this.updateActivityCards();
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

    updateProfileContent(field, value) {
        // This would update the profile PDF content
        // Implementation depends on how you want to sync with the profile page
        this.markAsChanged(field, value);
    }

    updateStatLabel(stat, value) {
        const statIndex = parseInt(stat.replace('stat', '')) - 1;
        const selector = `.stat:nth-child(${statIndex + 1}) .stat-label`;
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
        this.markAsChanged(`${stat}-name`, value);
    }

    updateStatValue(stat, value, unit) {
        const statIndex = parseInt(stat.replace('stat', '')) - 1;
        const selector = `.stat:nth-child(${statIndex + 1}) .stat-number`;
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value + unit;
        }
        this.markAsChanged(`${stat}-value`, value);
        this.markAsChanged(`${stat}-unit`, unit);
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

    addActivity() {
        const container = document.getElementById('activities-container');
        const activityId = Date.now();
        const activityCard = this.createActivityCard(activityId);
        container.appendChild(activityCard);
        this.updateActivityCards();
    }

    removeActivity(id) {
        const activityCard = document.querySelector(`[data-activity-id="${id}"]`);
        if (activityCard) {
            activityCard.remove();
            this.updateActivityCards();
        }
    }

    createActivityCard(id) {
        const card = document.createElement('div');
        card.className = 'activity-editor-card';
        card.setAttribute('data-activity-id', id);
        card.innerHTML = `
            <div class="activity-header">
                <h4>Tätigkeit ${id}: Neue Tätigkeit</h4>
                <button class="btn btn-danger btn-sm" onclick="adminPanel.removeActivity(${id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="activity-content">
                <div class="form-group">
                    <label>Icon (FontAwesome Klasse)</label>
                    <input type="text" value="fas fa-tasks" class="activity-icon">
                </div>
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" value="Neue Tätigkeit" class="activity-title">
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea rows="3" class="activity-description">Beschreibung der neuen Tätigkeit.</textarea>
                </div>
                <div class="form-group">
                    <label>Link zur Detailseite</label>
                    <input type="text" value="neue-taetigkeit.html" class="activity-link">
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

    updateActivityCards() {
        // This would update the main website activities section
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
            if (input.id && input.type !== 'file') {
                formData[input.id] = input.value;
            }
        });
        
        // Sammle aktuelles Profilbild
        const profilePreview = document.getElementById('profile-preview');
        if (profilePreview && profilePreview.src && !profilePreview.src.includes('manuel-weiss-photo.svg')) {
            formData.profileImage = profilePreview.src;
        }
        
        // Sammle Hero-Texte mit spezifischen Namen für bessere Kompatibilität
        const heroName = document.getElementById('hero-name');
        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        const heroDescription = document.getElementById('hero-description');
        
        if (heroName) formData.heroName = heroName.value;
        if (heroTitle) formData.heroTitle = heroTitle.value;
        if (heroSubtitle) formData.heroSubtitle = heroSubtitle.value;
        if (heroDescription) formData.heroDescription = heroDescription.value;
        
        // Sammle Profil-Informationen
        const profileTitle = document.getElementById('profile-title');
        const profileDescription = document.getElementById('profile-description');
        const profileAvailability = document.getElementById('profile-availability');
        
        if (profileTitle) formData.profileTitle = profileTitle.value;
        if (profileDescription) formData.profileDescription = profileDescription.value;
        if (profileAvailability) formData.profileAvailability = profileAvailability.value;
        
        // Sammle Services
        formData.services = [];
        const serviceCards = document.querySelectorAll('.service-editor-card');
        serviceCards.forEach((card, index) => {
            const service = {
                id: index + 1,
                icon: card.querySelector('.service-icon')?.value || 'fas fa-cogs',
                title: card.querySelector('.service-title')?.value || '',
                description: card.querySelector('.service-description')?.value || '',
                features: (card.querySelector('.service-features')?.value || '').split(',').map(f => f.trim()).filter(f => f),
                isPrimary: card.querySelector('.service-primary')?.checked || false
            };
            formData.services.push(service);
        });
        
        // Sammle Activities
        formData.activities = [];
        const activityCards = document.querySelectorAll('.activity-editor-card');
        activityCards.forEach((card, index) => {
            const activity = {
                id: index + 1,
                icon: card.querySelector('.activity-icon')?.value || 'fas fa-campground',
                title: card.querySelector('.activity-title')?.value || '',
                description: card.querySelector('.activity-description')?.value || '',
                link: card.querySelector('.activity-link')?.value || ''
            };
            formData.activities.push(activity);
        });
        
        // Sammle Projects
        formData.projects = [];
        const projectCards = document.querySelectorAll('.project-editor-card');
        projectCards.forEach((card, index) => {
            const project = {
                id: index + 1,
                title: card.querySelector('.project-title')?.value || '',
                description: card.querySelector('.project-description')?.value || '',
                tags: (card.querySelector('.project-tags')?.value || '').split(',').map(t => t.trim()).filter(t => t)
            };
            formData.projects.push(project);
        });
        
        // Sammle Kontaktdaten
        const contactName = document.getElementById('contact-name');
        const contactTitle = document.getElementById('contact-title');
        const contactLocation = document.getElementById('contact-location');
        const contactEmail = document.getElementById('contact-email');
        const contactPhone = document.getElementById('contact-phone');
        
        if (contactName) formData.contactName = contactName.value;
        if (contactTitle) formData.contactTitle = contactTitle.value;
        if (contactLocation) formData.contactLocation = contactLocation.value;
        if (contactEmail) formData.contactEmail = contactEmail.value;
        if (contactPhone) formData.contactPhone = contactPhone.value;
        
        // Sammle Zertifikate
        formData.certificates = [];
        const certificateInputs = document.querySelectorAll('.certificate-name');
        certificateInputs.forEach((input) => {
            if (input.value.trim()) {
                formData.certificates.push(input.value.trim());
            }
        });
        
        // Sammle Design-Einstellungen
        const primaryColor = document.getElementById('primary-color');
        const secondaryColor = document.getElementById('secondary-color');
        const heroGradient = document.getElementById('hero-gradient');
        const siteTitle = document.getElementById('site-title');
        const siteDescription = document.getElementById('site-description');
        
        if (primaryColor) formData.primaryColor = primaryColor.value;
        if (secondaryColor) formData.secondaryColor = secondaryColor.value;
        if (heroGradient) formData.heroGradient = heroGradient.value;
        if (siteTitle) formData.siteTitle = siteTitle.value;
        if (siteDescription) formData.siteDescription = siteDescription.value;
        
        // Sammle Statistiken
        const stat1Name = document.getElementById('stat1-name');
        const stat1Value = document.getElementById('stat1-value');
        const stat1Unit = document.getElementById('stat1-unit');
        const stat2Name = document.getElementById('stat2-name');
        const stat2Value = document.getElementById('stat2-value');
        const stat2Unit = document.getElementById('stat2-unit');
        const stat3Name = document.getElementById('stat3-name');
        const stat3Value = document.getElementById('stat3-value');
        const stat3Unit = document.getElementById('stat3-unit');
        
        formData.stats = [];
        if (stat1Name && stat1Value && stat1Unit) {
            formData.stats.push({
                name: stat1Name.value,
                value: parseInt(stat1Value.value) || 0,
                unit: stat1Unit.value
            });
        }
        if (stat2Name && stat2Value && stat2Unit) {
            formData.stats.push({
                name: stat2Name.value,
                value: parseInt(stat2Value.value) || 0,
                unit: stat2Unit.value
            });
        }
        if (stat3Name && stat3Value && stat3Unit) {
            formData.stats.push({
                name: stat3Name.value,
                value: parseInt(stat3Value.value) || 0,
                unit: stat3Unit.value
            });
        }
        
        // Sammle Daten der neuen Activity-Sektionen
        this.collectActivityData('wohnmobil', formData);
        this.collectActivityData('fotobox', formData);
        this.collectActivityData('sup', formData);
        this.collectActivityData('ebike', formData);
        
        return formData;
    }

    collectActivityData(activityName, formData) {
        const title = document.getElementById(`${activityName}-title`);
        const subtitle = document.getElementById(`${activityName}-subtitle`);
        const description = document.getElementById(`${activityName}-description`);
        const icon = document.getElementById(`${activityName}-icon`);
        const features = document.getElementById(`${activityName}-features`);
        
        if (title || subtitle || description) {
            if (!formData.activityDetails) formData.activityDetails = {};
            formData.activityDetails[activityName] = {
                title: title?.value || '',
                subtitle: subtitle?.value || '',
                description: description?.value || '',
                icon: icon?.value || '',
                features: features?.value.split('\n').filter(f => f.trim()) || []
            };
            
            // Sammle spezifische Preisfelder
            if (activityName === 'wohnmobil') {
                const priceDay = document.getElementById('wohnmobil-price-day');
                const priceWeek = document.getElementById('wohnmobil-price-week');
                if (priceDay || priceWeek) {
                    formData.activityDetails[activityName].pricing = {
                        day: priceDay?.value || '',
                        week: priceWeek?.value || ''
                    };
                }
            } else if (activityName === 'fotobox') {
                const price = document.getElementById('fotobox-price');
                if (price) {
                    formData.activityDetails[activityName].pricing = {
                        event: price.value || ''
                    };
                }
            } else if (activityName === 'sup') {
                const priceHalf = document.getElementById('sup-price-half');
                const priceFull = document.getElementById('sup-price-full');
                if (priceHalf || priceFull) {
                    formData.activityDetails[activityName].pricing = {
                        half: priceHalf?.value || '',
                        full: priceFull?.value || ''
                    };
                }
            } else if (activityName === 'ebike') {
                const priceDay = document.getElementById('ebike-price-day');
                const priceWeek = document.getElementById('ebike-price-week');
                if (priceDay || priceWeek) {
                    formData.activityDetails[activityName].pricing = {
                        day: priceDay?.value || '',
                        week: priceWeek?.value || ''
                    };
                }
            }
        }
    }

    loadActivityData(activityName, activityData) {
        const title = document.getElementById(`${activityName}-title`);
        const subtitle = document.getElementById(`${activityName}-subtitle`);
        const description = document.getElementById(`${activityName}-description`);
        const icon = document.getElementById(`${activityName}-icon`);
        const features = document.getElementById(`${activityName}-features`);
        
        if (title && activityData.title) title.value = activityData.title;
        if (subtitle && activityData.subtitle) subtitle.value = activityData.subtitle;
        if (description && activityData.description) description.value = activityData.description;
        if (icon && activityData.icon) icon.value = activityData.icon;
        if (features && activityData.features) features.value = activityData.features.join('\n');
        
        // Lade spezifische Preisfelder
        if (activityData.pricing) {
            if (activityName === 'wohnmobil') {
                const priceDay = document.getElementById('wohnmobil-price-day');
                const priceWeek = document.getElementById('wohnmobil-price-week');
                if (priceDay && activityData.pricing.day) priceDay.value = activityData.pricing.day;
                if (priceWeek && activityData.pricing.week) priceWeek.value = activityData.pricing.week;
            } else if (activityName === 'fotobox') {
                const price = document.getElementById('fotobox-price');
                if (price && activityData.pricing.event) price.value = activityData.pricing.event;
            } else if (activityName === 'sup') {
                const priceHalf = document.getElementById('sup-price-half');
                const priceFull = document.getElementById('sup-price-full');
                if (priceHalf && activityData.pricing.half) priceHalf.value = activityData.pricing.half;
                if (priceFull && activityData.pricing.full) priceFull.value = activityData.pricing.full;
            } else if (activityName === 'ebike') {
                const priceDay = document.getElementById('ebike-price-day');
                const priceWeek = document.getElementById('ebike-price-week');
                if (priceDay && activityData.pricing.day) priceDay.value = activityData.pricing.day;
                if (priceWeek && activityData.pricing.week) priceWeek.value = activityData.pricing.week;
            }
        }
        
        console.log(`✅ ${activityName} Daten geladen`);
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
        try {
            // Lade gespeicherte Daten aus localStorage
            const savedData = localStorage.getItem('websiteData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                        // Lade Profilbild (zuerst aus websiteData, dann aus separatem Key)
        const preview = document.getElementById('profile-preview');
        if (preview) {
            // Check if user has uploaded an image
            const hasUploadedImage = localStorage.getItem('profileImageUploaded') === 'true';
            
            if (hasUploadedImage) {
                // Try multiple sources for uploaded profile image
                const profileImage = data.profileImage || 
                                   localStorage.getItem('profileImage') || 
                                   localStorage.getItem('mwps-profile-image');
                
                if (profileImage && profileImage.startsWith('data:image/')) {
                    preview.src = profileImage;
                    console.log('✅ Hochgeladenes Profilbild aus localStorage geladen');
                    return; // Important: Exit here to prevent default loading
                }
            }
            
            // Only load default if no uploaded image exists
            console.log('ℹ️ Kein hochgeladenes Profilbild vorhanden, verwende Standard-SVG');
        }
        
        // Lade Hero-Daten
        if (data.heroName) {
            const element = document.getElementById('hero-name');
            if (element) element.value = data.heroName;
        }
        if (data.heroTitle) {
            const element = document.getElementById('hero-title');
            if (element) element.value = data.heroTitle;
        }
        if (data.heroSubtitle) {
            const element = document.getElementById('hero-subtitle');
            if (element) element.value = data.heroSubtitle;
        }
        if (data.heroDescription) {
            const element = document.getElementById('hero-description');
            if (element) element.value = data.heroDescription;
        }
        
        // Lade Profil-Informationen
        if (data.profileTitle) {
            const element = document.getElementById('profile-title');
            if (element) element.value = data.profileTitle;
        }
        if (data.profileDescription) {
            const element = document.getElementById('profile-description');
            if (element) element.value = data.profileDescription;
        }
        if (data.profileAvailability) {
            const element = document.getElementById('profile-availability');
            if (element) element.value = data.profileAvailability;
        }
        
        // Lade Kontaktdaten
        if (data.contactName) {
            const element = document.getElementById('contact-name');
            if (element) element.value = data.contactName;
        }
        if (data.contactTitle) {
            const element = document.getElementById('contact-title');
            if (element) element.value = data.contactTitle;
        }
        if (data.contactLocation) {
            const element = document.getElementById('contact-location');
            if (element) element.value = data.contactLocation;
        }
        if (data.contactEmail) {
            const element = document.getElementById('contact-email');
            if (element) element.value = data.contactEmail;
        }
        if (data.contactPhone) {
            const element = document.getElementById('contact-phone');
            if (element) element.value = data.contactPhone;
        }
        
        // Lade Design-Einstellungen
        if (data.primaryColor) {
            const element = document.getElementById('primary-color');
            if (element) element.value = data.primaryColor;
        }
        if (data.secondaryColor) {
            const element = document.getElementById('secondary-color');
            if (element) element.value = data.secondaryColor;
        }
        if (data.heroGradient) {
            const element = document.getElementById('hero-gradient');
            if (element) element.value = data.heroGradient;
        }
        if (data.siteTitle) {
            const element = document.getElementById('site-title');
            if (element) element.value = data.siteTitle;
        }
        if (data.siteDescription) {
            const element = document.getElementById('site-description');
            if (element) element.value = data.siteDescription;
        }
        
        // Lade Statistiken
        if (data.stats && data.stats.length > 0) {
            data.stats.forEach((stat, index) => {
                const nameElement = document.getElementById(`stat${index + 1}-name`);
                const valueElement = document.getElementById(`stat${index + 1}-value`);
                const unitElement = document.getElementById(`stat${index + 1}-unit`);
                
                if (nameElement) nameElement.value = stat.name;
                if (valueElement) valueElement.value = stat.value;
                if (unitElement) unitElement.value = stat.unit;
            });
        }
        
        // Lade Activity Details
        if (data.activityDetails) {
            Object.keys(data.activityDetails).forEach(activityName => {
                this.loadActivityData(activityName, data.activityDetails[activityName]);
            });
        }
        
        console.log('✅ Alle Admin-Daten geladen');
                
                // Legacy Statistiken-Code (wird durch obiges ersetzt)
                if (data.stat1Name) document.getElementById('stat1-name').value = data.stat1Name;
                if (data.stat1Value) document.getElementById('stat1-value').value = data.stat1Value;
                if (data.stat1Unit) document.getElementById('stat1-unit').value = data.stat1Unit;
                
                if (data.stat2Name) document.getElementById('stat2-name').value = data.stat2Name;
                if (data.stat2Value) document.getElementById('stat2-value').value = data.stat2Value;
                if (data.stat2Unit) document.getElementById('stat2-unit').value = data.stat2Unit;
                
                if (data.stat3Name) document.getElementById('stat3-name').value = data.stat3Name;
                if (data.stat3Value) document.getElementById('stat3-value').value = data.stat3Value;
                if (data.stat3Unit) document.getElementById('stat3-unit').value = data.stat3Unit;
                
                console.log('✅ Daten aus localStorage geladen');
            }
        } catch (error) {
            console.log('❌ Fehler beim Laden der Daten:', error);
        }
    }

    // Save and Publish Functions
    saveAllChanges() {
        const changes = this.collectChanges();
        // Save to localStorage for now
        localStorage.setItem('websiteData', JSON.stringify(changes));
        
        // Sende Update an Hauptfenster (falls offen)
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'updateHeroContent'
                }, '*');
                console.log('✅ Update an Hauptseite gesendet');
            }
        } catch (error) {
            console.log('Kommunikation mit Hauptfenster nicht möglich:', error);
        }
        
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

function addActivity() {
    adminPanel.addActivity();
}

function removeActivity(id) {
    adminPanel.removeActivity(id);
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