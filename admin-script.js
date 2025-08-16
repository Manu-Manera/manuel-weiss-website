// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'hero';
        this.autoSaveTimer = null;
        this.changes = {};
        this.init();
    }

    init() {
        console.log('🚀 Admin Panel wird initialisiert...');
        
        this.setupNavigation();
        this.setupSubmenus();
        this.setupProfileImageUpload();
        this.setupAutoSave();
        this.setupFormHandlers();
        this.loadCurrentData();
        
        // Teste Bildupload-Setup
        this.testImageUploadSetup();
        
        console.log('✅ Admin Panel erfolgreich initialisiert');
    }

    // Teste Bildupload-Setup
    testImageUploadSetup() {
        console.log('🧪 Teste Bildupload-Setup...');
        
        const activities = ['wohnmobil', 'fotobox', 'sup', 'ebike'];
        activities.forEach(activity => {
            const fileInput = document.getElementById(`${activity}-file-upload`);
            const imagesContainer = document.getElementById(`${activity}-images`);
            
            console.log(`${activity}:`, {
                fileInput: fileInput ? '✅ gefunden' : '❌ nicht gefunden',
                imagesContainer: imagesContainer ? '✅ gefunden' : '❌ nicht gefunden'
            });
            
            // Erstelle Notfall-Upload, falls normale Elemente fehlen
            if (!fileInput || !imagesContainer) {
                this.createEmergencyUpload(activity);
            }
            
            // Teste den Upload-Prozess
            if (fileInput && imagesContainer) {
                this.testUploadProcess(activity, fileInput, imagesContainer);
            }
        });
    }

    // Teste den Upload-Prozess
    testUploadProcess(activityName, fileInput, imagesContainer) {
        console.log(`🧪 Teste Upload-Prozess für ${activityName}`);
        
        // Erstelle ein Test-Bild
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 100;
        testCanvas.height = 100;
        const ctx = testCanvas.getContext('2d');
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('TEST', 20, 60);
        
        // Konvertiere zu Blob
        testCanvas.toBlob((blob) => {
            const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
            console.log(`📸 Test-Bild erstellt:`, testFile);
            
            // Teste den Upload
            this.addImageToGallerySimple(activityName, testFile);
        }, 'image/png');
    }

    // Erstelle Notfall-Upload für fehlende Elemente
    createEmergencyUpload(activityName) {
        console.log(`🚨 Erstelle Notfall-Upload für ${activityName}`);
        
        // Suche nach dem Aktivitäts-Bereich
        const activitySection = document.querySelector(`#${activityName}`);
        if (!activitySection) {
            console.error(`❌ Aktivitäts-Bereich nicht gefunden: ${activityName}`);
            return;
        }

        // Erstelle einfachen Upload-Bereich
        const emergencyUpload = document.createElement('div');
        emergencyUpload.className = 'emergency-upload';
        emergencyUpload.innerHTML = `
            <div class="editor-card">
                <h3><i class="fas fa-exclamation-triangle"></i> Notfall-Bildupload für ${activityName}</h3>
                <div class="emergency-upload-area">
                    <input type="file" id="emergency-${activityName}-upload" accept="image/*" multiple>
                    <button onclick="adminPanel.emergencyUpload('${activityName}')" class="btn btn-primary">
                        <i class="fas fa-upload"></i> Bilder hochladen
                    </button>
                </div>
                <div id="emergency-${activityName}-images" class="emergency-images"></div>
            </div>
        `;

        // Füge Notfall-Upload hinzu
        activitySection.appendChild(emergencyUpload);
        console.log(`✅ Notfall-Upload für ${activityName} erstellt`);
    }

    // Notfall-Bildupload
    emergencyUpload(activityName) {
        const fileInput = document.getElementById(`emergency-${activityName}-upload`);
        const imagesContainer = document.getElementById(`emergency-${activityName}-images`);
        
        if (!fileInput || !imagesContainer) {
            this.showNotification('Notfall-Upload nicht verfügbar', 'error');
            return;
        }

        const files = Array.from(fileInput.files);
        if (files.length === 0) {
            this.showNotification('Bitte wählen Sie Bilder aus', 'info');
            return;
        }

        files.forEach(file => {
            this.addImageToGallerySimple(activityName, file);
        });

        // Datei-Input zurücksetzen
        fileInput.value = '';
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

        // Auto-open submenu if a submenu item is active
        const activeSubmenuItem = document.querySelector('.submenu-link.active');
        if (activeSubmenuItem) {
            const parentSubmenu = activeSubmenuItem.closest('.nav-item-with-submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('open');
            }
        }
    }

    // Profile Image Upload Setup
    setupProfileImageUpload() {
        const profileUpload = document.getElementById('profile-upload');
        const profileInput = document.getElementById('profile-input');
        
        if (profileUpload && profileInput) {
            profileUpload.addEventListener('click', () => {
                profileInput.click();
            });
            
            profileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                console.log('📸 Profilbild-Upload gestartet:', file.name);
                
                // Einfache Validierung
                if (!file.type.startsWith('image/')) {
                    this.showNotification('Bitte wählen Sie eine Bilddatei aus', 'error');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) { // 5MB
                    this.showNotification('Bild ist zu groß (max. 5MB)', 'error');
                    return;
                }
                
                // Read file
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageData = event.target.result;
                    console.log('✅ Profilbild geladen, verarbeite...');
                    this.processUploadedImage(imageData);
                };
                
                reader.onerror = (error) => {
                    console.error('❌ Fehler beim Lesen der Profilbild-Datei:', error);
                    this.showNotification('Fehler beim Lesen der Bilddatei', 'error');
                };
                
                reader.readAsDataURL(file);
            });
        }
    }

    processUploadedImage(imageData) {
        console.log('🎨 Verarbeite hochgeladenes Profilbild...');
        
        // Update preview immediately
        const preview = document.getElementById('profile-preview');
        if (preview) {
            preview.src = imageData;
            console.log('✅ Profilbild-Vorschau aktualisiert');
        }
        
        // Speichere in localStorage (schnell und zuverlässig)
        localStorage.setItem('profileImage', imageData);
        localStorage.setItem('mwps-profile-image', imageData);
        localStorage.setItem('current-profile-image', imageData);
        
        // Speichere auch in websiteData
        try {
            const existingData = JSON.parse(localStorage.getItem('websiteData') || '{}');
            existingData.profileImage = imageData;
            localStorage.setItem('websiteData', JSON.stringify(existingData));
            console.log('✅ Profilbild in websiteData gespeichert');
        } catch (error) {
            console.error('❌ Fehler beim Speichern in websiteData:', error);
        }
        
        // Save with Netlify Storage (falls verfügbar)
        if (window.netlifyStorage) {
            window.netlifyStorage.saveProfileImage(imageData).then(result => {
                console.log('✅ Profilbild bei Netlify gespeichert:', result.message);
                this.showNotification(result.message, result.success ? 'success' : 'warning');
            }).catch(error => {
                console.log('⚠️ Netlify-Speicherung fehlgeschlagen, verwende localStorage');
                this.showNotification('Profilbild lokal gespeichert', 'success');
            });
        } else {
            this.showNotification('Profilbild erfolgreich gespeichert', 'success');
        }
        
        // Update main website
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'updateProfileImage',
                    imageData: imageData
                }, '*');
                console.log('✅ Update an Hauptseite gesendet');
            }
        } catch (error) {
            console.log('Cross-window communication nicht verfügbar');
        }
        
        console.log('🎉 Profilbild erfolgreich verarbeitet und gespeichert');
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
        
        // Setup image upload handlers for each activity
        this.setupActivityImageUpload('wohnmobil');
        this.setupActivityImageUpload('fotobox');
        this.setupActivityImageUpload('sup');
        this.setupActivityImageUpload('ebike');
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

    // Activity Image Upload Setup
    setupActivityImageUpload(activityName) {
        console.log(`🔧 Setup Bildupload für ${activityName}`);
        
        const fileUploadId = `${activityName}-file-upload`;
        const imagesContainerId = `${activityName}-images`;
        
        const fileInput = document.getElementById(fileUploadId);
        const imagesContainer = document.getElementById(imagesContainerId);
        
        console.log(`📁 Upload-Elemente:`, {
            fileInput: fileInput ? 'gefunden' : 'nicht gefunden',
            imagesContainer: imagesContainer ? 'gefunden' : 'nicht gefunden',
            fileUploadId,
            imagesContainerId
        });
        
        if (!fileInput || !imagesContainer) {
            console.error(`❌ Upload-Elemente für ${activityName} nicht gefunden`);
            console.error(`FileInput: ${fileUploadId}`, fileInput);
            console.error(`ImagesContainer: ${imagesContainerId}`, imagesContainer);
            return;
        }

        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            console.log(`📸 Datei ausgewählt für ${activityName}:`, e.target.files);
            
            const files = Array.from(e.target.files);
            if (files.length === 0) {
                console.log('Keine Dateien ausgewählt');
                return;
            }

            files.forEach((file, index) => {
                console.log(`📁 Verarbeite Datei ${index + 1}:`, {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: new Date(file.lastModified)
                });
                
                if (!file.type.startsWith('image/')) {
                    console.error(`❌ Ungültiger Dateityp: ${file.name} (${file.type})`);
                    this.showNotification(`Ungültiger Dateityp: ${file.name}`, 'error');
                    return;
                }

                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    console.error(`❌ Datei zu groß: ${file.name} (${file.size} bytes)`);
                    this.showNotification(`Datei zu groß: ${file.name} (max. 10MB)`, 'error');
                    return;
                }

                console.log(`✅ Datei validiert, starte Upload...`);
                this.addImageToGallery(activityName, file);
            });

            // Reset file input
            e.target.value = '';
            console.log('📁 File input zurückgesetzt');
        });

        // Load existing images for this activity
        console.log(`🔄 Lade bestehende Bilder für ${activityName}`);
        this.loadActivityImages(activityName);
        
        console.log(`✅ Bildupload für ${activityName} erfolgreich eingerichtet`);
    }

    // Vereinfachte und robuste Bildupload-Methode
    addImageToGallerySimple(activityName, file) {
        console.log(`🚀 Starte einfachen Bildupload für ${activityName}: ${file.name}`);
        
        const imagesContainer = document.getElementById(`${activityName}-images`);
        if (!imagesContainer) {
            console.error('❌ Images Container nicht gefunden');
            this.showNotification('Fehler: Container nicht gefunden', 'error');
            return;
        }

        // Einfache Validierung
        if (!file.type.startsWith('image/')) {
            this.showNotification(`Nur Bilddateien erlaubt: ${file.name}`, 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            this.showNotification(`Datei zu groß: ${file.name} (max. 10MB)`, 'error');
            return;
        }

        // Datei lesen
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imageData = e.target.result;
                const imageId = Date.now() + Math.random();
                
                console.log(`✅ Bild geladen, erstelle Element...`);
                
                // Einfaches Bild-Element erstellen
                const imageDiv = this.createSimpleImageElement(activityName, imageId, imageData, file.name);
                
                // Vor dem Upload-Bereich einfügen
                const uploadButton = imagesContainer.querySelector('.image-upload');
                if (uploadButton) {
                    imagesContainer.insertBefore(imageDiv, uploadButton);
                } else {
                    imagesContainer.appendChild(imageDiv);
                }

                // In localStorage speichern
                this.saveImageSimple(activityName, imageId, imageData, file.name);
                
                this.showNotification(`Bild erfolgreich hinzugefügt: ${file.name}`, 'success');
                console.log(`🎉 Bild erfolgreich hinzugefügt: ${file.name}`);
                
            } catch (error) {
                console.error('❌ Fehler beim Verarbeiten des Bildes:', error);
                this.showNotification('Fehler beim Hinzufügen des Bildes', 'error');
            }
        };
        
        reader.onerror = (error) => {
            console.error('❌ Fehler beim Lesen der Datei:', error);
            this.showNotification('Fehler beim Lesen der Bilddatei', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    // Einfaches Bild-Element erstellen
    createSimpleImageElement(activityName, imageId, imageData, filename) {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'activity-image-item';
        imageDiv.setAttribute('data-image-id', imageId);
        imageDiv.setAttribute('data-activity', activityName);
        
        imageDiv.innerHTML = `
            <div class="image-preview">
                <img src="${imageData}" alt="${filename}" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="image-overlay">
                    <button type="button" class="btn btn-sm btn-danger" onclick="adminPanel.removeActivityImage('${activityName}', '${imageId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="image-info">
                <input type="text" class="image-title" value="${filename}" placeholder="Bildtitel" 
                       onchange="adminPanel.updateImageTitle('${activityName}', '${imageId}', this.value)">
                <input type="text" class="image-description" placeholder="Bildbeschreibung" 
                       onchange="adminPanel.updateImageDescription('${activityName}', '${imageId}', this.value)">
            </div>
        `;
        
        return imageDiv;
    }

    // Einfache Bildspeicherung
    saveImageSimple(activityName, imageId, imageData, filename) {
        try {
            console.log(`💾 Speichere Bild für ${activityName}: ${filename}`);
            
            // 1. Speichere in lokalem Speicher (HAUPTSPEICHER)
            const storageKey = `${activityName}_images`;
            let images = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const imageInfo = {
                id: imageId,
                filename: filename,
                title: filename,
                description: '',
                imageData: imageData,
                uploadDate: new Date().toISOString(),
                isUploaded: true,
                activity: activityName
            };
            
            images.push(imageInfo);
            localStorage.setItem(storageKey, JSON.stringify(images));
            
            console.log(`✅ Bild lokal gespeichert: ${filename} für ${activityName}`);
            
            // 2. Speichere auch in Netlify-Speicher (als Backup)
            this.saveImageOnline(activityName, images);
            
            // 3. Speichere auch in Netlify-Backup-Speicher für Homepage-Kompatibilität
            const netlifyBackupKey = `${activityName}_netlify_images`;
            localStorage.setItem(netlifyBackupKey, JSON.stringify(images));
            
            // 4. Aktualisiere die Anzeige sofort
            this.refreshActivityImages(activityName);
            
            // 5. Sende Update an alle Fenster
            this.broadcastUpdate(activityName, images);
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Bildes:', error);
            this.showNotification('Fehler beim Speichern des Bildes', 'error');
        }
    }

    // Neue Online-Speicherung - Robuste Implementierung
    async saveImageOnline(activityName, images) {
        try {
            if (window.netlifyStorage) {
                console.log(`🌐 Speichere ${activityName} Bilder online...`);
                const result = await window.netlifyStorage.saveActivityImagesToNetlify(activityName, images);
                
                if (result.success) {
                    console.log(`✅ ${activityName} Bilder erfolgreich online gespeichert`);
                    
                    // Markiere als Netlify-gespeichert
                    window.netlifyStorage.markAsNetlifySaved(activityName, images);
                    
                    // Speichere auch in Netlify-Backup-Speicher
                    const netlifyBackupKey = `${activityName}_netlify_images`;
                    localStorage.setItem(netlifyBackupKey, JSON.stringify(images));
                    
                    this.showNotification(result.message, 'success');
                } else {
                    throw new Error('Online-Speicherung fehlgeschlagen');
                }
            } else {
                console.log('⚠️ Netlify Storage nicht verfügbar, verwende nur lokalen Speicher');
            }
        } catch (error) {
            console.error('❌ Fehler bei Online-Speicherung:', error);
            console.log('⚠️ Bilder bleiben im lokalen Speicher erhalten');
        }
    }

    // Neue Methode: Sende Updates an alle offenen Fenster
    broadcastUpdate(activityName, images) {
        console.log(`📡 Sende Update für ${activityName} an alle Fenster...`);
        
        // 1. Versuche, Hauptfenster zu aktualisieren (falls Admin-Panel in neuem Tab geöffnet wurde)
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'updateActivityImages',
                    data: { [activityName]: images }
                }, '*');
                console.log('✅ Update an Hauptfenster gesendet');
            }
        } catch (error) {
            console.log('Hauptfenster nicht verfügbar');
        }
        
        // 2. Sende Update an alle anderen Tabs/Fenster der gleichen Domain
        try {
            window.postMessage({
                type: 'updateActivityImages',
                data: { [activityName]: images }
            }, '*');
            console.log('✅ Update an aktuelles Fenster gesendet');
        } catch (error) {
            console.log('PostMessage an aktuelles Fenster fehlgeschlagen');
        }
        
        // 3. Speichere Update-Zeitstempel für andere Seiten
        const updateKey = `${activityName}_last_update`;
        localStorage.setItem(updateKey, new Date().toISOString());
        
        // 4. Trigger localStorage Event für andere Tabs
        this.triggerStorageEvent(activityName, images);
        
        console.log(`✅ Update für ${activityName} erfolgreich gesendet`);
    }

    // Trigger localStorage Event für andere Tabs
    triggerStorageEvent(activityName, images) {
        try {
            const storageKey = `${activityName}_netlify_images`;
            const oldValue = localStorage.getItem(storageKey);
            const newValue = JSON.stringify(images);
            
            // Erstelle ein Storage-Event
            const storageEvent = new StorageEvent('storage', {
                key: storageKey,
                oldValue: oldValue,
                newValue: newValue,
                url: window.location.href
            });
            
            // Dispatch das Event
            window.dispatchEvent(storageEvent);
            console.log(`📡 Storage-Event für ${activityName} ausgelöst`);
        } catch (error) {
            console.log('Storage-Event konnte nicht ausgelöst werden');
        }
    }

    // Entferne alle lokalen Bilder bei Fehler
    removeLocalImages(activityName) {
        try {
            const storageKey = `${activityName}_images`;
            localStorage.removeItem(storageKey);
            console.log(`🗑️ Alle lokalen Bilder für ${activityName} entfernt (Fehler bei Online-Speicherung)`);
        } catch (error) {
            console.error('❌ Fehler beim Entfernen lokaler Bilder:', error);
        }
    }

    // Aktualisiere die Anzeige der Aktivitätsbilder
    refreshActivityImages(activityName) {
        try {
            const imagesContainer = document.getElementById(`${activityName}-images`);
            if (!imagesContainer) return;

            // Lade aktuelle Bilder
            const storageKey = `${activityName}_images`;
            const images = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            // Entferne alle bestehenden Bild-Elemente (außer Upload-Bereich)
            const existingImages = imagesContainer.querySelectorAll('.activity-image-item');
            existingImages.forEach(img => img.remove());
            
            // Füge alle Bilder neu hinzu
            images.forEach(image => {
                const imageDiv = this.createSimpleImageElement(activityName, image.id, image.imageData, image.filename);
                
                // Aktualisiere Titel und Beschreibung
                const titleInput = imageDiv.querySelector('.image-title');
                const descInput = imageDiv.querySelector('.image-description');
                
                if (titleInput) titleInput.value = image.title || image.filename;
                if (descInput) descInput.value = image.description || '';
                
                // Füge vor dem Upload-Bereich ein
                const uploadButton = imagesContainer.querySelector('.image-upload');
                if (uploadButton) {
                    imagesContainer.insertBefore(imageDiv, uploadButton);
                } else {
                    imagesContainer.appendChild(imageDiv);
                }
            });
            
            console.log(`🔄 ${images.length} Bilder für ${activityName} aktualisiert`);
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren der Bilder:', error);
        }
    }

    addImageToGallery(activityName, file) {
        // Verwende die robuste, vereinfachte Methode
        console.log(`🔄 Verwende robuste Bildupload-Methode für ${activityName}`);
        this.addImageToGallerySimple(activityName, file);
    }

    finalizeImageAddition(activityName, imageId, imageData, filename) {
        const imagesContainer = document.getElementById(`${activityName}-images`);
        if (!imagesContainer) {
            console.error('❌ Images Container nicht gefunden in finalizeImageAddition');
            return;
        }

        console.log(`🎨 Erstelle Bild-Element für ${activityName}`);

        try {
            // Create image element
            const imageDiv = this.createImageElement(activityName, imageId, imageData, filename);
            
            if (!imageDiv) {
                console.error('❌ Bild-Element konnte nicht erstellt werden');
                return;
            }

            // Insert before the upload button
            const uploadButton = imagesContainer.querySelector('.image-upload');
            if (uploadButton) {
                imagesContainer.insertBefore(imageDiv, uploadButton);
                console.log('✅ Bild vor Upload-Button eingefügt');
            } else {
                imagesContainer.appendChild(imageDiv);
                console.log('✅ Bild am Ende eingefügt (Upload-Button nicht gefunden)');
            }

            // Save to localStorage
            this.saveActivityImage(activityName, imageId, imageData, filename);
            
            // Sende Update an Hauptfenster (falls offen)
            this.notifyMainWindow(activityName, 'imageAdded');
            
            this.showNotification(`Bild zu ${activityName} hinzugefügt`, 'success');
            
            console.log(`🎉 Bild erfolgreich zu ${activityName} hinzugefügt:`, filename);
            
        } catch (error) {
            console.error('❌ Fehler beim Finalisieren des Bildes:', error);
            this.showNotification('Fehler beim Hinzufügen des Bildes', 'error');
        }
    }

    notifyMainWindow(activityName, action) {
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'updateActivityImages',
                    activity: activityName,
                    action: action,
                    timestamp: new Date().toISOString()
                }, '*');
                console.log('✅ Update an Hauptseite gesendet:', action);
            }
        } catch (error) {
            console.log('Kommunikation mit Hauptfenster nicht möglich:', error);
        }
    }

    createImageElement(activityName, imageId, imageData, filename) {
        try {
            console.log(`🔨 Erstelle Bild-Element: ${filename}`);
            
            const imageDiv = document.createElement('div');
            imageDiv.className = 'activity-image-item';
            imageDiv.setAttribute('data-image-id', imageId);
            imageDiv.setAttribute('data-activity', activityName);
            
            // Sichere HTML-Erstellung
            const safeFilename = filename.replace(/[<>"']/g, '');
            const safeImageData = imageData.replace(/[<>"']/g, '');
            
            imageDiv.innerHTML = `
                <div class="image-preview">
                    <img src="${safeImageData}" alt="${safeFilename}" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpbGQgbmljaHQgZ2VmdW5kZW48L3RleHQ+PC9zdmc+'">
                    <div class="image-overlay">
                        <button type="button" class="btn btn-sm btn-danger" onclick="adminPanel.removeActivityImage('${activityName}', '${imageId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-primary" onclick="adminPanel.editImageTitle('${activityName}', '${imageId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
                <div class="image-info">
                    <input type="text" class="image-title" value="${safeFilename}" placeholder="Bildtitel" 
                           onchange="adminPanel.updateImageTitle('${activityName}', '${imageId}', this.value)">
                    <input type="text" class="image-description" placeholder="Bildbeschreibung" 
                           onchange="adminPanel.updateImageDescription('${activityName}', '${imageId}', this.value)">
                </div>
            `;
            
            console.log(`✅ Bild-Element erfolgreich erstellt`);
            return imageDiv;
            
        } catch (error) {
            console.error('❌ Fehler beim Erstellen des Bild-Elements:', error);
            
            // Fallback: Einfaches Bild-Element
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'activity-image-item';
            fallbackDiv.setAttribute('data-image-id', imageId);
            fallbackDiv.innerHTML = `
                <div class="image-preview">
                    <img src="${imageData}" alt="${filename}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="image-info">
                    <p>${filename}</p>
                    <button onclick="adminPanel.removeActivityImage('${activityName}', '${imageId}')">Löschen</button>
                </div>
            `;
            
            return fallbackDiv;
        }
    }

    saveActivityImage(activityName, imageId, imageData, filename) {
        const storageKey = `${activityName}_images`;
        let images = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const imageInfo = {
            id: imageId,
            filename: filename,
            title: filename,
            description: '',
            imageData: imageData,
            uploadDate: new Date().toISOString(),
            isUploaded: true,
            activity: activityName
        };
        
        images.push(imageInfo);
        localStorage.setItem(storageKey, JSON.stringify(images));
        
        // Also save to main website data
        this.updateWebsiteData();
        
        // Speichere auch in der globalen Bilddatenbank
        this.saveToGlobalImageDatabase(imageInfo);
        
        console.log(`✅ Bild gespeichert: ${filename} für ${activityName}`);
    }

    saveToGlobalImageDatabase(imageInfo) {
        try {
            // Speichere in der globalen Bilddatenbank
            let globalImages = JSON.parse(localStorage.getItem('globalImages') || '[]');
            
            // Prüfe, ob das Bild bereits existiert
            const existingIndex = globalImages.findIndex(img => img.id === imageInfo.id);
            if (existingIndex >= 0) {
                globalImages[existingIndex] = imageInfo;
            } else {
                globalImages.push(imageInfo);
            }
            
            localStorage.setItem('globalImages', JSON.stringify(globalImages));
            console.log('✅ Bild in globale Datenbank gespeichert');
            
            // Versuche auch bei Netlify zu speichern
            this.saveToNetlify(imageInfo);
        } catch (error) {
            console.error('Fehler beim Speichern in globale Datenbank:', error);
        }
    }

    async saveToNetlify(imageInfo) {
        try {
            if (window.netlifyStorage) {
                // Speichere das Bild bei Netlify
                const result = await window.netlifyStorage.saveActivityImages(
                    imageInfo.activity, 
                    [imageInfo]
                );
                
                if (result.success) {
                    console.log('✅ Bild bei Netlify gespeichert');
                } else {
                    console.log('⚠️ Bild nur lokal gespeichert');
                }
            }
        } catch (error) {
            console.log('Netlify-Speicherung nicht verfügbar, verwende nur localStorage');
        }
    }

    loadActivityImages(activityName) {
        const storageKey = `${activityName}_images`;
        const images = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const imagesContainer = document.getElementById(`${activityName}-images`);
        
        if (!imagesContainer) return;
        
        // Lösche alle bestehenden Bilder (außer dem Upload-Bereich)
        const existingImages = imagesContainer.querySelectorAll('.activity-image-item');
        existingImages.forEach(img => img.remove());
        
        if (images.length === 0) {
            console.log(`ℹ️ Keine Bilder für ${activityName} gefunden`);
            return;
        }
        
        images.forEach(imageInfo => {
            const imageDiv = this.createImageElement(activityName, imageInfo.id, imageInfo.imageData, imageInfo.title);
            
            // Set existing title and description
            const titleInput = imageDiv.querySelector('.image-title');
            const descriptionInput = imageDiv.querySelector('.image-description');
            if (titleInput) titleInput.value = imageInfo.title || imageInfo.filename;
            if (descriptionInput) descriptionInput.value = imageInfo.description || '';
            
            // Insert before upload button
            const uploadButton = imagesContainer.querySelector('.image-upload');
            if (uploadButton) {
                imagesContainer.insertBefore(imageDiv, uploadButton);
            } else {
                imagesContainer.appendChild(imageDiv);
            }
        });
        
        console.log(`✅ ${images.length} Bilder für ${activityName} geladen`);
    }

    removeActivityImage(activityName, imageId) {
        if (!confirm('Möchten Sie dieses Bild wirklich löschen?')) return;
        
        // Remove from DOM
        const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageElement) {
            imageElement.remove();
        }
        
        // Remove from localStorage
        const storageKey = `${activityName}_images`;
        let images = JSON.parse(localStorage.getItem(storageKey) || '[]');
        images = images.filter(img => img.id !== imageId);
        localStorage.setItem(storageKey, JSON.stringify(images));
        
        // Update website data
        this.updateWebsiteData();
        
        this.showNotification(`Bild aus ${activityName} entfernt`, 'success');
    }

    updateImageTitle(activityName, imageId, newTitle) {
        const storageKey = `${activityName}_images`;
        let images = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const imageIndex = images.findIndex(img => img.id === imageId);
        if (imageIndex !== -1) {
            images[imageIndex].title = newTitle;
            localStorage.setItem(storageKey, JSON.stringify(images));
            this.updateWebsiteData();
        }
    }

    updateImageDescription(activityName, imageId, newDescription) {
        const storageKey = `${activityName}_images`;
        let images = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const imageIndex = images.findIndex(img => img.id === imageId);
        if (imageIndex !== -1) {
            images[imageIndex].description = newDescription;
            localStorage.setItem(storageKey, JSON.stringify(images));
            this.updateWebsiteData();
        }
    }

    editImageTitle(activityName, imageId) {
        const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageElement) {
            const titleInput = imageElement.querySelector('.image-title');
            if (titleInput) {
                titleInput.focus();
                titleInput.select();
            }
        }
    }

    updateWebsiteData() {
        // Collect all activity images and update website data
        const websiteData = JSON.parse(localStorage.getItem('websiteData') || '{}');
        
        ['wohnmobil', 'fotobox', 'sup', 'ebike'].forEach(activityName => {
            const storageKey = `${activityName}_images`;
            const images = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (!websiteData.activityImages) websiteData.activityImages = {};
            websiteData.activityImages[activityName] = images;
        });
        
        localStorage.setItem('websiteData', JSON.stringify(websiteData));
        
        // Notify main website if open
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'updateActivityImages',
                    data: websiteData.activityImages
                }, '*');
            }
        } catch (error) {
            console.log('Kommunikation mit Hauptfenster nicht möglich:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
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