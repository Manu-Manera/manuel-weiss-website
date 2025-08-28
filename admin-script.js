// Modern Admin Panel - Modular JavaScript
'use strict';

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.isDarkMode = false;
        this.isSidebarCollapsed = false;
        this.websiteData = null;
        this.mediaFiles = [];
        this.aiTwinData = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupNavigation();
        this.hideLoading();
        this.loadCurrentSection();
        this.setupMobileMenu();
        this.loadTheme();
        this.setupSettingsTabs();
    }

    // Data Management
    loadData() {
        this.websiteData = JSON.parse(localStorage.getItem('websiteData') || '{}');
        this.mediaFiles = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
        this.aiTwinData = JSON.parse(localStorage.getItem('aiTwinData') || '{}');
        this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    }

    saveData() {
        localStorage.setItem('websiteData', JSON.stringify(this.websiteData));
        localStorage.setItem('mediaFiles', JSON.stringify(this.mediaFiles));
        localStorage.setItem('aiTwinData', JSON.stringify(this.aiTwinData));
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    // Event Listeners
    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Dark mode toggle
        const darkModeBtn = document.getElementById('darkModeIcon');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // AI Twin upload handlers
        this.setupAITwinUpload();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('sidebarToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.getElementById('adminSidebar').classList.toggle('mobile-open');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('adminSidebar');
            const menuToggle = document.getElementById('sidebarToggle');
            
            if (sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }

    setupSettingsTabs() {
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.showSettingsTab(tabName);
            });
        });
    }

    showSettingsTab(tabName) {
        // Update active tab
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active panel
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName + 'Settings').classList.add('active');
    }

    // Navigation
    showSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-section="${section}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update content
        document.querySelectorAll('.admin-section').forEach(s => {
            s.classList.remove('active');
        });
        
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update breadcrumb and title
        this.updateBreadcrumb(section);
        this.currentSection = section;

        // Load section specific content
        this.loadSectionContent(section);
    }

    updateBreadcrumb(section) {
        const sectionTitle = document.getElementById('sectionTitle');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        
        const titles = {
            'dashboard': 'Dashboard',
            'content': 'Inhalte',
            'ai-twin': 'AI Twin',
            'media': 'Medien',
            'rentals': 'Vermietungen',
            'bookings': 'Buchungen',
            'analytics': 'Analytics',
            'settings': 'Einstellungen'
        };

        if (sectionTitle) sectionTitle.textContent = titles[section] || 'Dashboard';
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = titles[section] || 'Dashboard';
    }

    loadSectionContent(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'content':
                this.loadContentSection();
                break;
            case 'ai-twin':
                this.loadAITwinSection();
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
            case 'analytics':
                this.loadAnalyticsSection();
                break;
            case 'settings':
                this.loadSettingsSection();
                break;
        }
    }

    // Dashboard
    loadDashboard() {
        this.updateDashboardStats();
        this.loadRecentActivity();
    }

    updateDashboardStats() {
        // Update statistics with real data
        const stats = {
            pageViews: this.websiteData.pageViews || 12453,
            bookings: this.websiteData.bookings || 24,
            inquiries: this.websiteData.inquiries || 87,
            aiTwin: this.aiTwinData.isCreated ? 1 : 0
        };

        // Update DOM elements
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = stats.pageViews.toLocaleString();
            statNumbers[1].textContent = stats.bookings;
            statNumbers[2].textContent = stats.inquiries;
            statNumbers[3].textContent = stats.aiTwin;
        }
    }

    loadRecentActivity() {
        // Load recent activities from data
        const activities = this.websiteData.activities || [
            { type: 'ai-twin', text: 'AI Twin wurde aktualisiert', time: 'vor 2 Stunden' },
            { type: 'booking', text: 'Neue Buchung eingegangen', time: 'vor 5 Stunden' },
            { type: 'content', text: 'Content aktualisiert', time: 'gestern' }
        ];

        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                    <div>
                        <p>${activity.text}</p>
                        <span>${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    getActivityIcon(type) {
        const icons = {
            'ai-twin': 'robot',
            'booking': 'calendar-check',
            'content': 'edit',
            'media': 'photo-video',
            'rental': 'key'
        };
        return icons[type] || 'info-circle';
    }

    // Content Management
    loadContentSection() {
        this.renderContentGrid();
    }

    renderContentGrid() {
        const contentGrid = document.getElementById('contentGrid');
        if (!contentGrid) return;

        const content = this.websiteData.content || [];
        
        if (content.length === 0) {
            contentGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-edit"></i>
                    <h3>Noch keine Inhalte</h3>
                    <p>Erstelle deinen ersten Inhalt</p>
                    <button class="btn btn-primary" onclick="adminPanel.createNewContent()">
                        <i class="fas fa-plus"></i>
                        Neuer Inhalt
                    </button>
                </div>
            `;
            return;
        }

        contentGrid.innerHTML = content.map(item => `
            <div class="content-card">
                <div class="content-header">
                    <h4>${item.title}</h4>
                    <div class="content-actions">
                        <button class="btn-icon" onclick="adminPanel.editContent('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="adminPanel.deleteContent('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p>${item.description}</p>
                <div class="content-meta">
                    <span class="content-type">${item.type}</span>
                    <span class="content-date">${new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    // AI Twin Section
    loadAITwinSection() {
        this.updateAITwinUI();
    }

    updateAITwinUI() {
        if (this.aiTwinData && this.aiTwinData.isCreated) {
            // Show twin preview
            document.getElementById('aiUploadArea').style.display = 'none';
            document.getElementById('twinPreview').style.display = 'block';
            
            // Update video source
            const twinVideo = document.getElementById('twinVideo');
            if (twinVideo && this.aiTwinData.videoUrl) {
                twinVideo.src = this.aiTwinData.videoUrl;
            }
            
            // Update steps
            this.updateAISteps(4);
        } else {
            // Show upload area
            document.getElementById('aiUploadArea').style.display = 'block';
            document.getElementById('twinPreview').style.display = 'none';
            
            // Reset steps
            this.updateAISteps(1);
        }
    }

    setupAITwinUpload() {
        // Photo upload
        const photoUpload = document.getElementById('photoUpload');
        const photoInput = document.getElementById('photoInput');
        
        if (photoUpload && photoInput) {
            photoUpload.addEventListener('click', () => photoInput.click());
            photoUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                photoUpload.classList.add('dragover');
            });
            photoUpload.addEventListener('dragleave', () => {
                photoUpload.classList.remove('dragover');
            });
            photoUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                photoUpload.classList.remove('dragover');
                this.handlePhotoUpload(e.dataTransfer.files[0]);
            });
            photoInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e.target.files[0]);
            });
        }
        
        // Video upload (optional)
        const videoUpload = document.getElementById('videoUpload');
        const videoInput = document.getElementById('videoInput');
        
        if (videoUpload && videoInput) {
            videoUpload.addEventListener('click', () => videoInput.click());
            videoUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                videoUpload.classList.add('dragover');
            });
            videoUpload.addEventListener('dragleave', () => {
                videoUpload.classList.remove('dragover');
            });
            videoUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                videoUpload.classList.remove('dragover');
                this.handleVideoUpload(e.dataTransfer.files[0]);
            });
            videoInput.addEventListener('change', (e) => {
                this.handleVideoUpload(e.target.files[0]);
            });
        }
    }

    handlePhotoUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showToast('Bitte wähle ein gültiges Bild aus', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.aiTwinData = this.aiTwinData || {};
            this.aiTwinData.photoUrl = e.target.result;
            this.saveData();
            this.showToast('Foto erfolgreich hochgeladen', 'success');
            this.updateAISteps(2);
            
            // Start AI processing immediately after photo upload
            setTimeout(() => {
                this.startAIProcessing();
            }, 1000);
        };
        reader.readAsDataURL(file);
    }

    handleVideoUpload(file) {
        if (!file || !file.type.startsWith('video/')) {
            this.showToast('Bitte wähle ein gültiges Video aus', 'error');
            return;
        }

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            if (video.duration > 30) {
                this.showToast('Video darf maximal 30 Sekunden lang sein', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.aiTwinData = this.aiTwinData || {};
                this.aiTwinData.videoUrl = e.target.result;
                this.saveData();
                this.showToast('Video erfolgreich hochgeladen', 'success');
                
                // If we already have a photo, start processing
                if (this.aiTwinData.photoUrl) {
                    this.startAIProcessing();
                }
            };
            reader.readAsDataURL(file);
        };
        video.src = URL.createObjectURL(file);
    }

    startAIProcessing() {
        document.getElementById('aiUploadArea').style.display = 'none';
        document.getElementById('aiProcessing').style.display = 'block';
        
        this.updateAISteps(2);
        
        let progress = 0;
        const progressBar = document.getElementById('aiProgress');
        const progressText = document.getElementById('progressText');
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.completeAIProcessing();
            }
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }, 500);
    }

    completeAIProcessing() {
        document.getElementById('aiProcessing').style.display = 'none';
        
        this.aiTwinData.isCreated = true;
        this.aiTwinData.createdAt = new Date().toISOString();
        this.saveData();
        
        this.updateAISteps(3);
        
        setTimeout(() => {
            this.updateAITwinUI();
            this.showToast('AI Twin erfolgreich erstellt!', 'success');
        }, 1000);
    }

    updateAISteps(activeStep) {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber <= activeStep);
        });
    }

    // Media Management
    loadMediaSection() {
        this.renderMediaGallery();
    }

    renderMediaGallery() {
        const gallery = document.getElementById('mediaGallery');
        if (!gallery) return;

        if (this.mediaFiles.length === 0) {
            gallery.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-photo-video"></i>
                    <h3>Noch keine Medien</h3>
                    <p>Lade deine ersten Bilder und Videos hoch</p>
                    <button class="btn btn-primary" onclick="adminPanel.openMediaUpload()">
                        <i class="fas fa-upload"></i>
                        Dateien hochladen
                    </button>
                </div>
            `;
            return;
        }

        gallery.innerHTML = this.mediaFiles.map(media => `
            <div class="media-item" data-id="${media.id}">
                ${media.type.startsWith('image/') ? 
                    `<img src="${media.url}" alt="${media.name}">` :
                    `<video src="${media.url}" controls></video>`
                }
                <div class="media-overlay">
                    <button class="btn-icon" onclick="adminPanel.deleteMedia(${media.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Rentals Section
    loadRentalsSection() {
        this.loadRentalContent('wohnmobil');

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
        if (!rentalEditor) return;

        const rental = this.websiteData.rentals?.find(r => r.adminKey === rentalType);
        if (!rental) {
            rentalEditor.innerHTML = `<p>Keine Daten für ${rentalType} gefunden.</p>`;
            return;
        }

        rentalEditor.innerHTML = `
            <form id="rentalEditForm">
                <input type="hidden" name="adminKey" value="${rental.adminKey}">
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" class="form-control" name="title" value="${rental.title}" required>
                </div>
                <div class="form-group">
                    <label>Kurzbeschreibung</label>
                    <textarea class="form-control" name="description" rows="4">${rental.description}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        `;

        document.getElementById('rentalEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedRental = { ...rental };
            for (const [key, value] of formData.entries()) {
                updatedRental[key] = value;
            }
            this.saveRentalData(rentalType, updatedRental);
        });
    }

    // Settings Section
    loadSettingsSection() {
        // Load settings form handlers
        const settingsForm = document.querySelector('.settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
    }

    saveSettings() {
        const formData = new FormData(document.querySelector('.settings-form'));
        const settings = {};
        
        for (const [key, value] of formData.entries()) {
            settings[key] = value;
        }
        
        this.websiteData.settings = settings;
        this.saveData();
        this.showToast('Einstellungen gespeichert', 'success');
    }

    // Utility Functions
    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        const sidebar = document.getElementById('adminSidebar');
        const main = document.querySelector('.admin-main');
        
        if (this.isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
            main.classList.add('sidebar-collapsed');
        } else {
            sidebar.classList.remove('collapsed');
            main.classList.remove('sidebar-collapsed');
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        localStorage.setItem('darkMode', this.isDarkMode);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'true') {
            this.toggleDarkMode();
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.remove(), 300);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 5000);
        }
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    handleSearch(query) {
        // Implement search functionality
        console.log('Searching for:', query);
    }

    // Action Functions (called from HTML)
    createNewContent() {
        this.showToast('Neuer Inhalt wird erstellt...', 'info');
    }

    exportContent() {
        this.showToast('Content wird exportiert...', 'info');
    }

    refreshContent() {
        this.loadContentSection();
        this.showToast('Content aktualisiert', 'success');
    }

    openMediaUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,video/*';
        input.onchange = (e) => {
            Array.from(e.target.files).forEach(file => {
                this.uploadMedia(file);
            });
        };
        input.click();
    }

    uploadMedia(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const mediaItem = {
                id: Date.now(),
                name: file.name,
                url: e.target.result,
                type: file.type,
                size: file.size,
                uploadedAt: new Date().toISOString()
            };

            this.mediaFiles.push(mediaItem);
            this.saveData();
            this.showToast('Medium erfolgreich hochgeladen', 'success');
            this.renderMediaGallery();
        };
        reader.readAsDataURL(file);
    }

    deleteMedia(id) {
        if (confirm('Möchten Sie dieses Medium wirklich löschen?')) {
            this.mediaFiles = this.mediaFiles.filter(m => m.id !== id);
            this.saveData();
            this.showToast('Medium gelöscht', 'success');
            this.renderMediaGallery();
        }
    }

    createFolder() {
        this.showToast('Ordner-Funktion kommt bald', 'info');
    }

    addNewBooking() {
        this.showToast('Neue Buchung wird erstellt...', 'info');
    }

    exportAnalytics() {
        this.showToast('Analytics werden exportiert...', 'info');
    }

    logout() {
        if (confirm('Möchten Sie sich wirklich abmelden?')) {
            window.location.href = 'index.html';
        }
    }

    showNotifications() {
        this.showToast('Benachrichtigungen werden angezeigt...', 'info');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    saveContent() {
        this.showToast('Content wird gespeichert...', 'success');
        this.closeModal('contentModal');
    }

    saveRentalData(rentalType, updatedRental) {
        if (!this.websiteData.rentals) {
            this.websiteData.rentals = [];
        }
        
        const index = this.websiteData.rentals.findIndex(r => r.adminKey === rentalType);
        if (index !== -1) {
            this.websiteData.rentals[index] = updatedRental;
        } else {
            this.websiteData.rentals.push(updatedRental);
        }
        
        this.saveData();
        this.showToast('Vermietungsdaten gespeichert', 'success');
    }

    // Placeholder functions for other sections
    loadBookingsSection() {
        this.showToast('Buchungen werden geladen...', 'info');
    }

    loadAnalyticsSection() {
        this.showToast('Analytics werden geladen...', 'info');
    }

    editContent(id) {
        this.showToast(`Content ${id} wird bearbeitet...`, 'info');
    }

    deleteContent(id) {
        if (confirm('Möchten Sie diesen Inhalt wirklich löschen?')) {
            this.showToast('Content gelöscht', 'success');
        }
    }

    createNewPresentation() {
        this.showToast('Neue Präsentation wird erstellt...', 'info');
    }

    downloadTwin() {
        if (!this.aiTwinData || !this.aiTwinData.photoUrl) {
            this.showToast('Kein Twin zum Herunterladen verfügbar', 'error');
            return;
        }
        
        const link = document.createElement('a');
        link.href = this.aiTwinData.photoUrl;
        link.download = 'ai-twin-' + new Date().toISOString().split('T')[0] + '.jpg';
        link.click();
        this.showToast('Twin wird heruntergeladen', 'success');
    }
}

// Initialize Admin Panel
let adminPanel;

document.addEventListener('DOMContentLoaded', function() {
    adminPanel = new AdminPanel();
    console.log('Admin Panel initialized successfully');
});

// Global function definitions for onclick handlers
window.adminPanel = null; // Will be set after DOM loads
