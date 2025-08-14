// Admin Dashboard für Manuel Weiss Professional Services - Original mit dynamischen Features
class OriginalAdminDashboard {
    constructor() {
        this.contentManager = null;
        this.currentSection = 'hero';
        this.services = [];
        this.activities = [];
        this.projects = [];
        this.images = {};
        this.autoSaveEnabled = true;
        this.init();
    }

    async init() {
        // Warte bis der Content Manager geladen ist
        await this.waitForContentManager();
        
        this.setupEventListeners();
        this.loadAllData();
        this.startAutoSave();
        this.updateSyncStatus();
    }

    async waitForContentManager() {
        // Warte bis der Content Manager verfügbar ist
        while (!window.contentManager) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.contentManager = window.contentManager;
        console.log('✅ Content Manager verbunden - Live Updates aktiviert');
    }

    setupEventListeners() {
        // Sidebar Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section || e.target.closest('[data-section]').dataset.section;
                this.switchSection(section);
            });
        });

        // Profile Image Upload
        document.getElementById('profile-upload').addEventListener('click', () => {
            document.getElementById('profile-input').click();
        });

        document.getElementById('profile-input').addEventListener('change', (e) => {
            this.handleProfileImageUpload(e.target.files[0]);
        });

        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.scheduleAutoSave();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"], input[type="radio"], select')) {
                this.scheduleAutoSave();
            }
        });

        // Activity image uploads
        document.getElementById('activity-image-input').addEventListener('change', (e) => {
            this.handleActivityImageUpload(e.target.files, this.currentActivityType);
        });

        // Data import
        document.getElementById('data-import-input').addEventListener('change', (e) => {
            this.handleDataImport(e.target.files[0]);
        });
    }

    switchSection(sectionName) {
        // Update sidebar navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update main content sections
        document.querySelectorAll('.editor-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        // Update section title
        const titles = {
            hero: 'Hero-Bereich bearbeiten',
            profile: 'Beraterprofil verwalten',
            services: 'Beratungs-Services verwalten',
            activities: 'Sonstige Tätigkeiten verwalten',
            projects: 'Projekte verwalten',
            contact: 'Kontaktinformationen bearbeiten',
            settings: 'Einstellungen verwalten'
        };
        document.getElementById('section-title').textContent = titles[sectionName] || 'Bereich bearbeiten';

        this.currentSection = sectionName;
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'hero':
                this.loadHeroData();
                break;
            case 'services':
                this.renderServices();
                break;
            case 'activities':
                this.renderActivities();
                this.renderActivityImages();
                break;
            case 'projects':
                this.renderProjects();
                break;
            case 'contact':
                this.loadContactData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    loadAllData() {
        if (!this.contentManager || !this.contentManager.content) return;

        const content = this.contentManager.content;
        
        // Load services
        if (content.services) {
            this.services = content.services;
        }

        // Load activities (rentals)
        if (content.rentals) {
            this.activities = content.rentals;
        }

        // Load projects
        if (content.projects) {
            this.projects = content.projects;
        }

        // Load images
        if (content.rentals) {
            content.rentals.forEach(rental => {
                if (rental.images) {
                    this.images[rental.id] = rental.images;
                }
            });
        }

        // Load current section
        this.loadSectionData(this.currentSection);
    }

    loadHeroData() {
        if (!this.contentManager || !this.contentManager.content.hero) return;

        const hero = this.contentManager.content.hero;
        
        // Load basic info
        document.getElementById('hero-name').value = hero.name || '';
        document.getElementById('hero-title').value = hero.title || '';
        document.getElementById('hero-subtitle').value = hero.subtitle || '';
        document.getElementById('hero-description').value = hero.description || '';

        // Load profile image
        if (hero.profileImage) {
            document.getElementById('profile-preview').src = hero.profileImage;
        }

        // Load stats
        this.loadStats(hero.stats || []);
    }

    loadStats(stats) {
        const container = document.getElementById('stats-container');
        container.innerHTML = '';

        stats.forEach((stat, index) => {
            const statElement = this.createStatElement(stat, index);
            container.appendChild(statElement);
        });

        // Add button after stats
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-secondary';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Statistik hinzufügen';
        addButton.onclick = () => this.addStat();
        container.appendChild(addButton);
    }

    createStatElement(stat, index) {
        const div = document.createElement('div');
        div.className = 'stat-item';
        div.innerHTML = `
            <label>Name der Statistik</label>
            <input type="text" class="stat-name" value="${stat.name || ''}" onchange="adminDashboard.updateStat(${index})">
            <label>Wert</label>
            <input type="number" class="stat-value" value="${stat.value || 0}" onchange="adminDashboard.updateStat(${index})">
            <label>Einheit</label>
            <input type="text" class="stat-unit" value="${stat.unit || ''}" onchange="adminDashboard.updateStat(${index})">
            <button class="btn btn-danger btn-sm" onclick="adminDashboard.removeStat(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        return div;
    }

    addStat() {
        if (!this.contentManager || !this.contentManager.content.hero) return;

        if (!this.contentManager.content.hero.stats) {
            this.contentManager.content.hero.stats = [];
        }

        this.contentManager.content.hero.stats.push({
            name: 'Neue Statistik',
            value: 0,
            unit: '+'
        });

        this.loadStats(this.contentManager.content.hero.stats);
        this.saveAndUpdate();
    }

    removeStat(index) {
        if (!this.contentManager || !this.contentManager.content.hero) return;

        this.contentManager.content.hero.stats.splice(index, 1);
        this.loadStats(this.contentManager.content.hero.stats);
        this.saveAndUpdate();
    }

    updateStat(index) {
        if (!this.contentManager || !this.contentManager.content.hero) return;

        const statItems = document.querySelectorAll('.stat-item');
        const statItem = statItems[index];
        
        if (statItem) {
            const name = statItem.querySelector('.stat-name').value;
            const value = parseInt(statItem.querySelector('.stat-value').value) || 0;
            const unit = statItem.querySelector('.stat-unit').value;

            this.contentManager.content.hero.stats[index] = { name, value, unit };
            this.saveAndUpdate();
        }
    }

    // Services Management
    addService() {
        const name = document.getElementById('service-name').value;
        const icon = document.getElementById('service-icon').value;
        const description = document.getElementById('service-description').value;
        const features = document.getElementById('service-features').value.split('\n').filter(f => f.trim());
        const isPrimary = document.getElementById('service-primary').checked;

        if (!name || !description) {
            this.showNotification('Bitte fülle alle Pflichtfelder aus', 'error');
            return;
        }

        const service = {
            id: Date.now(),
            title: name,
            icon: icon || 'fas fa-cog',
            description,
            features,
            isPrimary,
            category: 'beratung'
        };

        this.services.push(service);
        this.updateServicesInContentManager();
        this.renderServices();
        this.clearServiceForm();
        this.saveAndUpdate();
        this.showNotification('Service erfolgreich hinzugefügt', 'success');
    }

    updateServicesInContentManager() {
        if (this.contentManager && this.contentManager.content) {
            this.contentManager.content.services = this.services;
        }
    }

    renderServices() {
        const container = document.getElementById('current-services');
        if (!container) return;

        container.innerHTML = this.services.map(service => `
            <div class="service-item" data-id="${service.id}">
                <div class="service-header">
                    <i class="${service.icon}"></i>
                    <h4>${service.title}</h4>
                    ${service.isPrimary ? '<span class="primary-badge">Hauptservice</span>' : ''}
                </div>
                <p>${service.description}</p>
                <div class="service-features">
                    ${service.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="service-actions">
                    <button class="btn btn-secondary btn-sm" onclick="adminDashboard.editService(${service.id})">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminDashboard.removeService(${service.id})">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            </div>
        `).join('');
    }

    clearServiceForm() {
        document.getElementById('service-name').value = '';
        document.getElementById('service-icon').value = '';
        document.getElementById('service-description').value = '';
        document.getElementById('service-features').value = '';
        document.getElementById('service-primary').checked = false;
    }

    removeService(serviceId) {
        this.services = this.services.filter(s => s.id !== serviceId);
        this.updateServicesInContentManager();
        this.renderServices();
        this.saveAndUpdate();
        this.showNotification('Service erfolgreich entfernt', 'success');
    }

    // Activities Management
    addActivity() {
        const name = document.getElementById('activity-name').value;
        const icon = document.getElementById('activity-icon').value;
        const description = document.getElementById('activity-description').value;
        const link = document.getElementById('activity-link').value;

        if (!name || !description) {
            this.showNotification('Bitte fülle alle Pflichtfelder aus', 'error');
            return;
        }

        const activity = {
            id: Date.now(),
            title: name,
            icon: icon || 'fas fa-box',
            description,
            link: link || '#',
            category: 'vermietung',
            images: []
        };

        this.activities.push(activity);
        this.updateActivitiesInContentManager();
        this.renderActivities();
        this.clearActivityForm();
        this.saveAndUpdate();
        this.showNotification('Aktivität erfolgreich hinzugefügt', 'success');
    }

    updateActivitiesInContentManager() {
        if (this.contentManager && this.contentManager.content) {
            this.contentManager.content.rentals = this.activities;
        }
    }

    renderActivities() {
        const container = document.getElementById('current-activities');
        if (!container) return;

        container.innerHTML = this.activities.map(activity => `
            <div class="activity-item" data-id="${activity.id}">
                <div class="activity-header">
                    <i class="${activity.icon}"></i>
                    <h4>${activity.title}</h4>
                </div>
                <p>${activity.description}</p>
                <p><strong>Link:</strong> ${activity.link}</p>
                <div class="activity-actions">
                    <button class="btn btn-secondary btn-sm" onclick="adminDashboard.editActivity(${activity.id})">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminDashboard.removeActivity(${activity.id})">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            </div>
        `).join('');
    }

    clearActivityForm() {
        document.getElementById('activity-name').value = '';
        document.getElementById('activity-icon').value = '';
        document.getElementById('activity-description').value = '';
        document.getElementById('activity-link').value = '';
    }

    removeActivity(activityId) {
        this.activities = this.activities.filter(a => a.id !== activityId);
        this.updateActivitiesInContentManager();
        this.renderActivities();
        this.saveAndUpdate();
        this.showNotification('Aktivität erfolgreich entfernt', 'success');
    }

    // Image Management for Activities
    uploadActivityImage(activityType) {
        this.currentActivityType = activityType;
        document.getElementById('activity-image-input').click();
    }

    handleActivityImageUpload(files, activityType) {
        if (!files || files.length === 0) return;

        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    id: Date.now() + index,
                    title: `${activityType} Bild ${index + 1}`,
                    filename: file.name,
                    src: e.target.result,
                    uploadedAt: new Date().toISOString()
                };

                // Add to content manager
                if (this.contentManager) {
                    this.contentManager.addImage(activityType, imageData);
                }

                this.renderActivityImages();
                this.saveAndUpdate();
            };
            reader.readAsDataURL(file);
        });

        this.showNotification(`${files.length} Bilder erfolgreich hochgeladen`, 'success');
    }

    renderActivityImages() {
        const activityTypes = ['wohnmobil', 'fotobox', 'ebike', 'sup'];
        
        activityTypes.forEach(type => {
            const container = document.getElementById(`${type}-images`);
            if (!container) return;

            // Find matching activity
            const activity = this.activities.find(a => 
                a.title.toLowerCase().includes(type) || 
                a.id === type
            );

            const images = activity ? (activity.images || []) : [];
            
            container.innerHTML = images.map(image => `
                <div class="activity-image" data-id="${image.id}">
                    <img src="${image.src || '/placeholder.jpg'}" alt="${image.title}">
                    <div class="image-overlay">
                        <button class="btn btn-danger btn-sm" onclick="adminDashboard.removeActivityImage('${type}', ${image.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        });
    }

    removeActivityImage(activityType, imageId) {
        if (this.contentManager) {
            this.contentManager.removeImage(activityType, imageId);
        }
        
        this.renderActivityImages();
        this.saveAndUpdate();
        this.showNotification('Bild erfolgreich entfernt', 'success');
    }

    // Projects Management
    addProject() {
        const title = document.getElementById('project-title').value;
        const company = document.getElementById('project-company').value;
        const description = document.getElementById('project-description').value;
        const technologies = document.getElementById('project-technologies').value.split(',').map(t => t.trim()).filter(t => t);

        if (!title || !company || !description) {
            this.showNotification('Bitte fülle alle Pflichtfelder aus', 'error');
            return;
        }

        const project = {
            id: Date.now(),
            title,
            company,
            description,
            technologies,
            category: 'projekte'
        };

        this.projects.push(project);
        this.updateProjectsInContentManager();
        this.renderProjects();
        this.clearProjectForm();
        this.saveAndUpdate();
        this.showNotification('Projekt erfolgreich hinzugefügt', 'success');
    }

    updateProjectsInContentManager() {
        if (this.contentManager && this.contentManager.content) {
            this.contentManager.content.projects = this.projects;
        }
    }

    renderProjects() {
        const container = document.getElementById('current-projects');
        if (!container) return;

        container.innerHTML = this.projects.map(project => `
            <div class="project-item" data-id="${project.id}">
                <h4>${project.title}</h4>
                <p><strong>${project.company}</strong></p>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-actions">
                    <button class="btn btn-secondary btn-sm" onclick="adminDashboard.editProject(${project.id})">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminDashboard.removeProject(${project.id})">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            </div>
        `).join('');
    }

    clearProjectForm() {
        document.getElementById('project-title').value = '';
        document.getElementById('project-company').value = '';
        document.getElementById('project-description').value = '';
        document.getElementById('project-technologies').value = '';
    }

    removeProject(projectId) {
        this.projects = this.projects.filter(p => p.id !== projectId);
        this.updateProjectsInContentManager();
        this.renderProjects();
        this.saveAndUpdate();
        this.showNotification('Projekt erfolgreich entfernt', 'success');
    }

    // Contact Data
    loadContactData() {
        if (!this.contentManager || !this.contentManager.content.contact) return;

        const contact = this.contentManager.content.contact;
        document.getElementById('contact-email').value = contact.email || '';
        document.getElementById('contact-phone').value = contact.phone || '';
        document.getElementById('contact-location').value = contact.location || '';
        document.getElementById('contact-availability').value = contact.availability || '';
    }

    // Settings Data
    loadSettingsData() {
        if (!this.contentManager || !this.contentManager.content.settings) return;

        const settings = this.contentManager.content.settings;
        const meta = this.contentManager.content.meta;

        document.getElementById('site-title').value = meta?.title || '';
        document.getElementById('site-description').value = meta?.description || '';
        document.getElementById('site-keywords').value = meta?.keywords || '';
        
        document.getElementById('primary-color').value = settings?.primaryColor || '#2563eb';
        document.getElementById('secondary-color').value = settings?.secondaryColor || '#64748b';
        document.getElementById('enable-animations').checked = settings?.enableAnimations !== false;
    }

    // Auto-save functionality
    startAutoSave() {
        setInterval(() => {
            if (this.autoSaveEnabled) {
                this.saveCurrentData();
            }
        }, 5000); // Auto-save every 5 seconds
    }

    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentData();
        }, 1000); // Save 1 second after last change
    }

    saveCurrentData() {
        this.collectAllData();
        this.saveAndUpdate();
        this.updateSaveStatus('Automatisch gespeichert');
    }

    collectAllData() {
        if (!this.contentManager || !this.contentManager.content) return;

        // Collect hero data
        this.collectHeroData();
        this.collectContactData();
        this.collectSettingsData();
    }

    collectHeroData() {
        if (!this.contentManager.content.hero) return;

        this.contentManager.content.hero.name = document.getElementById('hero-name')?.value || '';
        this.contentManager.content.hero.title = document.getElementById('hero-title')?.value || '';
        this.contentManager.content.hero.subtitle = document.getElementById('hero-subtitle')?.value || '';
        this.contentManager.content.hero.description = document.getElementById('hero-description')?.value || '';
    }

    collectContactData() {
        if (!this.contentManager.content.contact) {
            this.contentManager.content.contact = {};
        }

        this.contentManager.content.contact.email = document.getElementById('contact-email')?.value || '';
        this.contentManager.content.contact.phone = document.getElementById('contact-phone')?.value || '';
        this.contentManager.content.contact.location = document.getElementById('contact-location')?.value || '';
        this.contentManager.content.contact.availability = document.getElementById('contact-availability')?.value || '';
    }

    collectSettingsData() {
        if (!this.contentManager.content.settings) {
            this.contentManager.content.settings = {};
        }
        if (!this.contentManager.content.meta) {
            this.contentManager.content.meta = {};
        }

        this.contentManager.content.meta.title = document.getElementById('site-title')?.value || '';
        this.contentManager.content.meta.description = document.getElementById('site-description')?.value || '';
        this.contentManager.content.meta.keywords = document.getElementById('site-keywords')?.value || '';
        
        this.contentManager.content.settings.primaryColor = document.getElementById('primary-color')?.value || '#2563eb';
        this.contentManager.content.settings.secondaryColor = document.getElementById('secondary-color')?.value || '#64748b';
        this.contentManager.content.settings.enableAnimations = document.getElementById('enable-animations')?.checked !== false;
    }

    // Save and update functionality
    async saveAndUpdate() {
        if (!this.contentManager) return;

        try {
            // Update content manager
            this.contentManager.renderWebsite();
            await this.contentManager.saveContent();
            
            this.updateSyncStatus(true);
            console.log('✅ Daten gespeichert und Live-Website aktualisiert');
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            this.updateSyncStatus(false);
        }
    }

    updateSyncStatus(success = null) {
        const indicator = document.getElementById('sync-indicator');
        if (!indicator) return;

        if (success === true) {
            indicator.innerHTML = '🟢 Live synchronisiert';
            indicator.className = 'sync-live';
        } else if (success === false) {
            indicator.innerHTML = '🔴 Sync-Fehler';
            indicator.className = 'sync-error';
        } else {
            indicator.innerHTML = '🟡 Synchronisiert...';
            indicator.className = 'sync-pending';
        }
    }

    updateSaveStatus(message) {
        const status = document.getElementById('save-status');
        if (status) {
            status.textContent = message;
        }
    }

    // Utility functions
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Show animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    handleProfileImageUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profile-preview').src = e.target.result;
            
            if (this.contentManager && this.contentManager.content.hero) {
                this.contentManager.content.hero.profileImage = e.target.result;
                this.saveAndUpdate();
            }
            
            this.showNotification('Profilbild erfolgreich aktualisiert', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Global functions for onclick events
let adminDashboard;

document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new OriginalAdminDashboard();
});

// Global functions
function saveAllChanges() {
    adminDashboard.saveCurrentData();
    adminDashboard.showNotification('Alle Änderungen gespeichert und live aktualisiert!', 'success');
}

function previewWebsite() {
    window.open('/', '_blank');
}

function publishChanges() {
    adminDashboard.saveAndUpdate();
    adminDashboard.showNotification('Änderungen live veröffentlicht!', 'success');
}

function resetChanges() {
    if (confirm('Möchtest du alle ungespeicherten Änderungen zurücksetzen?')) {
        location.reload();
    }
}

function addService() {
    adminDashboard.addService();
}

function addActivity() {
    adminDashboard.addActivity();
}

function addProject() {
    adminDashboard.addProject();
}

function addStat() {
    adminDashboard.addStat();
}

function removeStat(index) {
    adminDashboard.removeStat(index);
}

function exportData() {
    if (window.dataPersistence) {
        window.dataPersistence.exportData();
        adminDashboard.showNotification('Daten erfolgreich exportiert', 'success');
    }
}

function exportAllData() {
    exportData();
}

function importData() {
    document.getElementById('data-import-input').click();
}

function resetAllData() {
    if (confirm('Möchtest du wirklich alle Daten auf die Standardwerte zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        if (window.dataPersistence) {
            window.dataPersistence.resetData();
            location.reload();
        }
    }
}