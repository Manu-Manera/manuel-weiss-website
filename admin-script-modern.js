// Modern Admin Panel Script
'use strict';

class ModernAdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.websiteData = null;
        this.mediaFiles = [];
        this.charts = {};
        this.unsavedChanges = false;
        this.init();
    }

    init() {
        this.loadWebsiteData();
        this.setupEventListeners();
        this.initializeCharts();
        this.checkAuthentication();
        this.hideLoading();
    }

    // Authentication
    checkAuthentication() {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (!isAuthenticated) {
            // In production, redirect to login
            console.log('Admin Panel - Demo Mode');
        }
    }

    // Data Management
    loadWebsiteData() {
        try {
            const savedData = localStorage.getItem('websiteData');
            if (savedData) {
                this.websiteData = JSON.parse(savedData);
            } else {
                // Load from website-content.json
                fetch('data/website-content.json')
                    .then(res => res.json())
                    .then(data => {
                        this.websiteData = data;
                        this.saveWebsiteData();
                    })
                    .catch(err => {
                        console.error('Error loading website data:', err);
                        this.showToast('Fehler beim Laden der Daten', 'error');
                    });
            }
            this.updateDashboard();
            this.loadContentSection();
        } catch (error) {
            console.error('Error in loadWebsiteData:', error);
        }
    }

    saveWebsiteData() {
        try {
            localStorage.setItem('websiteData', JSON.stringify(this.websiteData));
            this.unsavedChanges = false;
            this.showToast('Änderungen gespeichert', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            this.showToast('Fehler beim Speichern', 'error');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Sidebar Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.getElementById('adminSidebar').classList.toggle('collapsed');
            });
        }

        // Mobile Menu
        this.setupMobileMenu();

        // Dark Mode
        this.setupDarkMode();

        // Upload Area
        this.setupUploadArea();

        // Form Auto-Save
        this.setupAutoSave();

        // Window Events
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    // Section Management
    showSection(sectionId) {
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });

        // Update sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        // Update breadcrumb
        this.updateBreadcrumb(sectionId);

        // Load section-specific content
        this.loadSectionContent(sectionId);

        this.currentSection = sectionId;
    }

    updateBreadcrumb(sectionId) {
        const titles = {
            dashboard: 'Dashboard',
            content: 'Inhalte verwalten',
            media: 'Medien',
            rentals: 'Vermietungen',
            bookings: 'Buchungen',
            applications: 'Bewerbungen',
            analytics: 'Analytics',
            settings: 'Einstellungen'
        };

        document.getElementById('sectionTitle').textContent = titles[sectionId] || sectionId;
        document.getElementById('breadcrumbCurrent').textContent = titles[sectionId] || sectionId;
    }

    loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'content':
                this.loadContentSection();
                break;
            case 'media':
                this.loadMediaSection();
                break;
            case 'rentals':
                this.loadRentalsSection();
                break;
            case 'bookings':
                this.loadBookingsSection();
                break;
            case 'applications':
                this.loadApplicationsSection();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'settings':
                this.loadSettingsSection();
                break;
        }
    }

    // Dashboard
    updateDashboard() {
        // Update stats (mock data for demo)
        const stats = {
            views: '12,453',
            bookings: '24',
            inquiries: '87',
            projects: '6'
        };

        // Update activity feed
        this.updateActivityFeed();
    }

    updateActivityFeed() {
        // Mock activity data
        const activities = [
            { icon: 'fa-file-alt', text: 'Neue Bewerbung eingegangen', time: 'vor 2 Stunden' },
            { icon: 'fa-calendar-check', text: 'Wohnmobil-Buchung bestätigt', time: 'vor 5 Stunden' },
            { icon: 'fa-edit', text: 'Projektseite aktualisiert', time: 'gestern' }
        ];

        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <i class="fas ${activity.icon}"></i>
                    <div>
                        <p>${activity.text}</p>
                        <span>${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // Content Management
    loadContentSection() {
        const contentGrid = document.getElementById('contentGrid');
        if (!contentGrid || !this.websiteData) return;

        const allContent = [
            ...(this.websiteData.services || []),
            ...(this.websiteData.projects || []),
            ...(this.websiteData.rentals || [])
        ];

        contentGrid.innerHTML = allContent.map(item => `
            <div class="content-card" onclick="adminPanel.editContent('${item.id}', '${item.category || 'general'}')">
                <div class="content-icon">
                    <i class="${item.icon || 'fas fa-file'}"></i>
                </div>
                <h3>${item.title}</h3>
                <p>${item.description || item.subtitle || ''}</p>
                <div class="content-meta">
                    <span class="badge">${item.category || 'general'}</span>
                    ${item.lastUpdated ? `<span class="text-muted">Aktualisiert: ${new Date(item.lastUpdated).toLocaleDateString('de-DE')}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    editContent(id, category) {
        // Find content
        let content = null;
        if (category === 'beratung') {
            content = this.websiteData.services.find(s => s.id == id);
        } else if (category === 'projekte') {
            content = this.websiteData.projects.find(p => p.id == id);
        } else if (category === 'vermietung') {
            content = this.websiteData.rentals.find(r => r.id == id);
        }

        if (!content) return;

        // Show edit modal
        this.showContentModal(content, category);
    }

    showContentModal(content, category) {
        const modal = document.getElementById('contentModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <form id="contentEditForm">
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" class="form-control" name="title" value="${content.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea class="form-control" name="description" rows="4" required>${content.description || ''}</textarea>
                </div>
                ${content.features ? `
                    <div class="form-group">
                        <label>Features (eine pro Zeile)</label>
                        <textarea class="form-control" name="features" rows="6">${content.features.join('\n')}</textarea>
                    </div>
                ` : ''}
                ${content.link ? `
                    <div class="form-group">
                        <label>Link</label>
                        <input type="text" class="form-control" name="link" value="${content.link}">
                    </div>
                ` : ''}
                <input type="hidden" name="id" value="${content.id}">
                <input type="hidden" name="category" value="${category}">
            </form>
        `;

        modal.classList.add('active');
    }

    // Media Management
    loadMediaSection() {
        this.loadMediaGallery();
    }

    setupUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (!uploadArea || !fileInput) return;

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Click to select
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.uploadImage(file);
            } else {
                this.showToast(`${file.name} ist kein Bild`, 'warning');
            }
        });
    }

    uploadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const mediaItem = {
                id: Date.now(),
                name: file.name,
                url: e.target.result,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString()
            };

            // Save to localStorage (in production, upload to server)
            let savedMedia = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
            savedMedia.push(mediaItem);
            localStorage.setItem('mediaFiles', JSON.stringify(savedMedia));

            this.showToast(`${file.name} erfolgreich hochgeladen`, 'success');
            this.loadMediaGallery();
        };
        reader.readAsDataURL(file);
    }

    loadMediaGallery() {
        const gallery = document.getElementById('mediaGallery');
        if (!gallery) return;

        const savedMedia = JSON.parse(localStorage.getItem('mediaFiles') || '[]');

        if (savedMedia.length === 0) {
            gallery.innerHTML = '<p class="text-center text-muted">Keine Medien vorhanden</p>';
            return;
        }

        gallery.innerHTML = savedMedia.map(media => `
            <div class="media-item" data-id="${media.id}">
                <img src="${media.url}" alt="${media.name}">
                <div class="media-overlay">
                    <button class="btn-icon" onclick="adminPanel.deleteMedia(${media.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    deleteMedia(id) {
        if (confirm('Möchten Sie dieses Bild wirklich löschen?')) {
            let savedMedia = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
            savedMedia = savedMedia.filter(m => m.id !== id);
            localStorage.setItem('mediaFiles', JSON.stringify(savedMedia));
            this.showToast('Bild gelöscht', 'success');
            this.loadMediaGallery();
        }
    }

    // Rentals Management
    loadRentalsSection() {
        // Load first rental tab by default
        this.loadRentalContent('wohnmobil');

        // Setup tab clicks
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadRentalContent(btn.dataset.rental);
            });
        });
    }

    loadRentalContent(rentalType) {
        const rentalEditor = document.getElementById('rentalEditor');
        if (!rentalEditor || !this.websiteData) return;

        const rental = this.websiteData.rentals.find(r => r.adminKey === rentalType);
        if (!rental) return;

        rentalEditor.innerHTML = `
            <h3>${rental.title} bearbeiten</h3>
            <form id="rentalEditForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Titel</label>
                        <input type="text" class="form-control" name="title" value="${rental.title}">
                    </div>
                    <div class="form-group">
                        <label>Untertitel</label>
                        <input type="text" class="form-control" name="subtitle" value="${rental.subtitle || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <textarea class="form-control" name="description" rows="4">${rental.description}</textarea>
                </div>
                <div class="form-group">
                    <label>Detaillierte Beschreibung</label>
                    <textarea class="form-control" name="detailedDescription" rows="6">${rental.detailedDescription || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Features (eine pro Zeile)</label>
                    <textarea class="form-control" name="features" rows="6">${rental.features ? rental.features.join('\n') : ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Preis pro Tag</label>
                        <input type="text" class="form-control" name="priceDay" value="${rental.pricing?.day || ''}">
                    </div>
                    <div class="form-group">
                        <label>Preis pro Woche</label>
                        <input type="text" class="form-control" name="priceWeek" value="${rental.pricing?.week || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Bilder</label>
                    <div class="rental-images" id="${rentalType}Images">
                        ${this.renderRentalImages(rental)}
                    </div>
                    <button type="button" class="btn btn-outline" onclick="adminPanel.addRentalImage('${rentalType}')">
                        <i class="fas fa-plus"></i> Bild hinzufügen
                    </button>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        `;

        // Setup form submit
        document.getElementById('rentalEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRentalData(rentalType, e.target);
        });
    }

    renderRentalImages(rental) {
        if (!rental.images || rental.images.length === 0) {
            return '<p class="text-muted">Keine Bilder vorhanden</p>';
        }

        return rental.images.map((img, index) => `
            <div class="rental-image">
                <img src="${img}" alt="Bild ${index + 1}">
                <button class="btn-remove" onclick="adminPanel.removeRentalImage('${rental.adminKey}', ${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    // Charts
    initializeCharts() {
        // Initialize charts when analytics section is loaded
        if (typeof Chart !== 'undefined') {
            this.initVisitorsChart();
            this.initPagesChart();
            this.initDevicesChart();
            this.initRentalsChart();
        }
    }

    initVisitorsChart() {
        const ctx = document.getElementById('visitorsChart');
        if (!ctx) return;

        this.charts.visitors = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
                datasets: [{
                    label: 'Besucher',
                    data: [120, 150, 180, 200, 170, 250, 300],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Utility Functions
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    hideLoading() {
        const loading = document.getElementById('adminLoading');
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => loading.remove(), 300);
        }
    }

    // Dark Mode
    setupDarkMode() {
        const darkModeBtn = document.querySelector('[onclick="toggleDarkMode()"]');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                localStorage.setItem('adminDarkMode', isDark);
                document.getElementById('darkModeIcon').className = `fas fa-${isDark ? 'sun' : 'moon'}`;
            });
        }

        // Load saved preference
        if (localStorage.getItem('adminDarkMode') === 'true') {
            document.body.classList.add('dark-mode');
            document.getElementById('darkModeIcon').className = 'fas fa-sun';
        }
    }

    // Mobile Menu
    setupMobileMenu() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        // Mobile toggle
        const mobileToggle = document.getElementById('sidebarToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            });
        }
    }

    // Auto Save
    setupAutoSave() {
        let saveTimer;
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.unsavedChanges = true;
                clearTimeout(saveTimer);
                saveTimer = setTimeout(() => {
                    this.autoSave();
                }, 2000);
            }
        });
    }

    autoSave() {
        // Auto-save logic based on current section
        console.log('Auto-saving...');
        this.saveWebsiteData();
    }

    // Export data
    exportData() {
        const dataStr = JSON.stringify(this.websiteData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `website-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('Daten exportiert', 'success');
    }
}

// Global functions for onclick handlers
window.adminPanel = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new ModernAdminPanel();
});

// Global function definitions
window.showSection = (section) => adminPanel?.showSection(section);
window.toggleDarkMode = () => adminPanel?.toggleDarkMode();
window.showNotifications = () => adminPanel?.showToast('3 neue Benachrichtigungen', 'info');
window.logout = () => {
    if (confirm('Möchten Sie sich wirklich abmelden?')) {
        localStorage.removeItem('adminAuthenticated');
        window.location.href = 'index.html';
    }
};
window.addNewContent = () => adminPanel?.showContentModal({}, 'new');
window.refreshContent = () => adminPanel?.loadContentSection();
window.openMediaUpload = () => document.getElementById('fileInput')?.click();
window.selectFiles = () => document.getElementById('fileInput')?.click();
window.createFolder = () => adminPanel?.showToast('Ordner-Funktion kommt bald', 'info');
window.addNewBooking = () => adminPanel?.showToast('Buchungs-Funktion kommt bald', 'info');
window.createNewApplication = () => adminPanel?.showToast('Bewerbungs-Funktion kommt bald', 'info');
window.manageCompanies = () => adminPanel?.showToast('Firmen-Verwaltung kommt bald', 'info');
window.manageTemplates = () => adminPanel?.showToast('Vorlagen-Verwaltung kommt bald', 'info');
window.exportAnalytics = () => adminPanel?.showToast('Analytics-Export kommt bald', 'info');
window.exportData = () => adminPanel?.exportData();
window.saveContent = () => {
    const form = document.getElementById('contentEditForm');
    if (form) {
        // Save logic here
        adminPanel?.showToast('Inhalt gespeichert', 'success');
        closeModal('contentModal');
    }
};
window.closeModal = (modalId) => {
    document.getElementById(modalId)?.classList.remove('active');
};
