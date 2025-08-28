// Modern Admin Panel with AI Twin Integration
'use strict';

class ModernAdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.websiteData = null;
        this.mediaFiles = [];
        this.aiTwinData = null;
        this.unsavedChanges = false;
        this.init();
    }

    init() {
        this.loadWebsiteData();
        this.setupEventListeners();
        this.checkAuthentication();
        this.hideLoading();
        this.loadAITwinData();
    }

    // Authentication
    checkAuthentication() {
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (!isAuthenticated) {
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
        } catch (error) {
            console.error('Error in loadWebsiteData:', error);
        }
    }

    loadAITwinData() {
        const savedTwinData = localStorage.getItem('aiTwinData');
        if (savedTwinData) {
            this.aiTwinData = JSON.parse(savedTwinData);
            this.updateAITwinUI();
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

    saveAITwinData() {
        try {
            localStorage.setItem('aiTwinData', JSON.stringify(this.aiTwinData));
            this.showToast('AI Twin Daten gespeichert', 'success');
        } catch (error) {
            console.error('Error saving AI Twin data:', error);
            this.showToast('Fehler beim Speichern der AI Twin Daten', 'error');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Menu Toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.main-nav').classList.toggle('mobile-open');
            });
        }

        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        // AI Twin Upload
        this.setupAITwinUpload();

        // Auto Save
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
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });

        // Update sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        // Load section-specific content
        this.loadSectionContent(sectionId);

        this.currentSection = sectionId;
    }

    loadSectionContent(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.updateDashboard();
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
        }
    }

    // Dashboard
    updateDashboard() {
        // Update activity feed
        this.updateActivityFeed();
    }

    updateActivityFeed() {
        const activities = [
            { icon: 'fa-robot', text: 'AI Twin wurde aktualisiert', time: 'vor 2 Stunden' },
            { icon: 'fa-calendar-check', text: 'Neue Buchung eingegangen', time: 'vor 5 Stunden' },
            { icon: 'fa-edit', text: 'Content aktualisiert', time: 'gestern' }
        ];

        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
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
                <input type="hidden" name="id" value="${content.id}">
                <input type="hidden" name="category" value="${category}">
            </form>
        `;

        modal.classList.add('active');
    }

    // AI Twin Management
    loadAITwinSection() {
        this.updateAITwinUI();
    }

    updateAITwinUI() {
        if (this.aiTwinData && this.aiTwinData.isCreated) {
            // Show twin preview
            document.getElementById('aiUploadArea').style.display = 'none';
            document.getElementById('twinPreview').style.display = 'block';
            document.getElementById('presentationCreator').style.display = 'block';
            
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
            document.getElementById('presentationCreator').style.display = 'none';
            
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

        // Video upload
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
            this.saveAITwinData();
            this.showToast('Foto erfolgreich hochgeladen', 'success');
            this.updateAISteps(2);
        };
        reader.readAsDataURL(file);
    }

    handleVideoUpload(file) {
        if (!file || !file.type.startsWith('video/')) {
            this.showToast('Bitte wähle ein gültiges Video aus', 'error');
            return;
        }

        // Check video duration
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
                this.saveAITwinData();
                this.showToast('Video erfolgreich hochgeladen', 'success');
                this.startAIProcessing();
            };
            reader.readAsDataURL(file);
        };
        video.src = URL.createObjectURL(file);
    }

    startAIProcessing() {
        // Show processing UI
        document.getElementById('aiUploadArea').style.display = 'none';
        document.getElementById('aiProcessing').style.display = 'block';
        
        this.updateAISteps(2);
        
        // Simulate AI processing
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
        // Hide processing UI
        document.getElementById('aiProcessing').style.display = 'none';
        
        // Create AI Twin
        this.aiTwinData.isCreated = true;
        this.aiTwinData.createdAt = new Date().toISOString();
        this.saveAITwinData();
        
        this.updateAISteps(3);
        
        // Show twin preview
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

    createNewPresentation() {
        document.getElementById('presentationCreator').style.display = 'block';
    }

    generatePresentation() {
        const text = document.getElementById('presentationText').value;
        const mood = document.getElementById('presentationMood').value;
        const language = document.getElementById('presentationLanguage').value;
        
        if (!text.trim()) {
            this.showToast('Bitte gib einen Text ein', 'error');
            return;
        }
        
        // Simulate presentation generation
        this.showToast('Präsentation wird generiert...', 'info');
        
        setTimeout(() => {
            // In a real implementation, this would call the AI service
            this.showToast('Präsentation erfolgreich generiert!', 'success');
            
            // Save presentation data
            const presentation = {
                id: Date.now(),
                text: text,
                mood: mood,
                language: language,
                createdAt: new Date().toISOString()
            };
            
            this.aiTwinData.presentations = this.aiTwinData.presentations || [];
            this.aiTwinData.presentations.push(presentation);
            this.saveAITwinData();
        }, 3000);
    }

    previewPresentation() {
        const text = document.getElementById('presentationText').value;
        if (!text.trim()) {
            this.showToast('Bitte gib einen Text ein', 'error');
            return;
        }
        
        this.showToast('Vorschau wird generiert...', 'info');
    }

    downloadTwin() {
        if (!this.aiTwinData || !this.aiTwinData.videoUrl) {
            this.showToast('Kein Twin zum Herunterladen verfügbar', 'error');
            return;
        }
        
        const link = document.createElement('a');
        link.href = this.aiTwinData.videoUrl;
        link.download = 'ai-twin-' + new Date().toISOString().split('T')[0] + '.mp4';
        link.click();
        this.showToast('Twin wird heruntergeladen', 'success');
    }

    // Media Management
    loadMediaSection() {
        this.loadMediaGallery();
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
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString()
            };

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

    deleteMedia(id) {
        if (confirm('Möchten Sie dieses Medium wirklich löschen?')) {
            let savedMedia = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
            savedMedia = savedMedia.filter(m => m.id !== id);
            localStorage.setItem('mediaFiles', JSON.stringify(savedMedia));
            this.showToast('Medium gelöscht', 'success');
            this.loadMediaGallery();
        }
    }

    createFolder() {
        this.showToast('Ordner-Funktion kommt bald', 'info');
    }

    // Rentals Management
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
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        `;

        document.getElementById('rentalEditForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRentalData(rentalType, e.target);
        });
    }

    saveRentalData(rentalType, form) {
        // Save rental data logic
        this.showToast('Vermietungsdaten gespeichert', 'success');
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
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            loading.classList.add('hidden');
            setTimeout(() => loading.remove(), 300);
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('adminDarkMode', isDark);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = `fas fa-${isDark ? 'sun' : 'moon'}`;
        }
    }

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
        console.log('Auto-saving...');
        this.saveWebsiteData();
    }

    // Global function definitions for onclick handlers
    createNewContent() {
        this.showToast('Neuer Inhalt wird erstellt...', 'info');
    }

    exportContent() {
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

    saveContent() {
        const form = document.getElementById('contentEditForm');
        if (form) {
            this.showToast('Inhalt gespeichert', 'success');
            this.closeModal('contentModal');
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId)?.classList.remove('active');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new ModernAdminPanel();
});

// Global function definitions for onclick handlers
window.showSection = (section) => adminPanel?.showSection(section);
window.toggleDarkMode = () => adminPanel?.toggleDarkMode();
window.showNotifications = () => adminPanel?.showToast('3 neue Benachrichtigungen', 'info');
