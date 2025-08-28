// Modern Admin Panel - Fixed Version v2.0
'use strict';

// Globale Variable für Admin Panel
let adminPanel = null;

// Open Source AI Twin Implementation
class AITwin {
    constructor() {
        this.isProcessing = false;
        this.photoData = null;
        this.videoData = null;
        this.presentations = [];
        this.currentPresentation = null;
    }

    // Simuliere AI-Verarbeitung mit Open Source Ansatz
    async processPhoto(photoFile) {
        console.log('🤖 AI Twin: Processing photo...');
        this.isProcessing = true;
        
        return new Promise((resolve) => {
            // Simuliere AI-Verarbeitung
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    this.isProcessing = false;
                    
                    // Erstelle simulierten AI Twin
                    const aiTwin = {
                        id: Date.now(),
                        photoUrl: URL.createObjectURL(photoFile),
                        createdAt: new Date().toISOString(),
                        features: {
                            faceDetection: true,
                            emotionAnalysis: true,
                            voiceSynthesis: true
                        }
                    };
                    
                    console.log('✅ AI Twin created:', aiTwin);
                    resolve(aiTwin);
                }
            }, 200);
        });
    }

    // Text-to-Speech Simulation mit Open Source Ansatz
    async synthesizeSpeech(text) {
        console.log('🎤 AI Twin: Synthesizing speech...');
        
        return new Promise((resolve) => {
            // Simuliere Sprachsynthese
            const words = text.split(' ');
            const speechData = {
                text: text,
                words: words,
                duration: words.length * 0.3, // 300ms pro Wort
                audioUrl: null // In einer echten Implementierung würde hier Audio-URL stehen
            };
            
            setTimeout(() => {
                console.log('✅ Speech synthesized:', speechData);
                resolve(speechData);
            }, 1000);
        });
    }

    // Präsentation erstellen
    async createPresentation(text, aiTwin) {
        console.log('🎬 AI Twin: Creating presentation...');
        
        const speech = await this.synthesizeSpeech(text);
        
        const presentation = {
            id: Date.now(),
            title: 'AI Twin Präsentation',
            text: text,
            speech: speech,
            aiTwin: aiTwin,
            createdAt: new Date().toISOString()
        };
        
        this.presentations.push(presentation);
        this.currentPresentation = presentation;
        
        console.log('✅ Presentation created:', presentation);
        return presentation;
    }
}

class AdminPanel {
    constructor() {
        console.log('AdminPanel constructor called');
        this.currentSection = 'dashboard';
        this.isDarkMode = false;
        this.isSidebarCollapsed = false;
        this.websiteData = null;
        this.mediaFiles = [];
        this.aiTwinData = null;
        this.notifications = [];
        
        // Initialize AI Twin
        this.aiTwin = new AITwin();
        
        this.init();
    }

    init() {
        console.log('AdminPanel.init() called');
        this.loadData();
        this.setupEventListeners();
        this.setupNavigation();
        this.hideLoading();
        this.loadCurrentSection();
        this.setupMobileMenu();
        this.loadTheme();
        this.setupSettingsTabs();
        
        // Set global reference immediately
        window.adminPanel = this;
        console.log('Global adminPanel reference set in init():', window.adminPanel);
    }

    // Data Management mit Fallback für private Fenster
    loadData() {
        try {
            this.websiteData = JSON.parse(localStorage.getItem('websiteData') || '{}');
            this.mediaFiles = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
            this.aiTwinData = JSON.parse(localStorage.getItem('aiTwinData') || '{}');
            this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        } catch (error) {
            console.warn('⚠️ Local Storage not available (private window?), using defaults');
            this.websiteData = {};
            this.mediaFiles = [];
            this.aiTwinData = {};
            this.notifications = [];
        }
    }

    saveData() {
        try {
            localStorage.setItem('websiteData', JSON.stringify(this.websiteData));
            localStorage.setItem('mediaFiles', JSON.stringify(this.mediaFiles));
            localStorage.setItem('aiTwinData', JSON.stringify(this.aiTwinData));
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.warn('⚠️ Could not save to Local Storage (private window?)');
        }
    }

    // Event Listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            console.log('Sidebar toggle found, adding event listener');
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        } else {
            console.error('Sidebar toggle not found');
        }

        // Dark mode toggle
        const darkModeBtn = document.getElementById('darkModeIcon');
        if (darkModeBtn) {
            console.log('Dark mode button found, adding event listener');
            darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        } else {
            console.error('Dark mode button not found');
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            console.log('Search input found, adding event listener');
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        } else {
            console.error('Search input not found');
        }

        // AI Twin upload handlers
        console.log('Setting up AI Twin upload handlers...');
        this.setupAITwinUpload();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                console.log('Navigation clicked:', section);
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
        console.log('Showing section:', section);
        
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
        console.log('Loading section content:', section);
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
        console.log('Loading AI Twin section...');
        this.updateAITwinUI();
    }

    updateAITwinUI() {
        console.log('🔄 Updating AI Twin UI...');
        
        if (this.aiTwinData && this.aiTwinData.isCreated) {
            console.log('✅ AI Twin exists, showing preview...');
            
            // Show twin preview
            const uploadArea = document.getElementById('aiUploadArea');
            const twinPreview = document.getElementById('twinPreview');
            
            if (uploadArea) uploadArea.style.display = 'none';
            if (twinPreview) twinPreview.style.display = 'block';
            
            // Update video source
            const twinVideo = document.getElementById('twinVideo');
            if (twinVideo && this.aiTwinData.photoUrl) {
                twinVideo.src = this.aiTwinData.photoUrl;
                console.log('✅ Video source updated');
            }
            
            // Update steps
            this.updateAISteps(4);
        } else {
            console.log('📤 No AI Twin exists, showing upload area...');
            
            // Show upload area
            const uploadArea = document.getElementById('aiUploadArea');
            const twinPreview = document.getElementById('twinPreview');
            
            if (uploadArea) uploadArea.style.display = 'block';
            if (twinPreview) twinPreview.style.display = 'none';
            
            // Reset steps
            this.updateAISteps(1);
        }
        
        // Always show text input section
        console.log('📝 Showing text input section...');
        this.showTextInputSection();
    }

    setupAITwinUpload() {
        console.log('🔧 Setting up AI Twin upload handlers...');
        
        // Photo upload
        const photoUpload = document.getElementById('photoUpload');
        const photoInput = document.getElementById('photoInput');
        
        console.log('📸 Photo elements:', { photoUpload, photoInput });
        
        if (photoUpload && photoInput) {
            console.log('✅ Photo upload elements found, setting up event listeners...');
            
            // Entferne alte Event-Listener falls vorhanden
            photoUpload.replaceWith(photoUpload.cloneNode(true));
            const newPhotoUpload = document.getElementById('photoUpload');
            
            newPhotoUpload.addEventListener('click', (e) => {
                console.log('📸 Photo upload clicked!');
                e.preventDefault();
                e.stopPropagation();
                photoInput.click();
            });
            
            newPhotoUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                newPhotoUpload.classList.add('dragover');
            });
            
            newPhotoUpload.addEventListener('dragleave', () => {
                newPhotoUpload.classList.remove('dragover');
            });
            
            newPhotoUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newPhotoUpload.classList.remove('dragover');
                console.log('📸 Photo dropped:', e.dataTransfer.files[0]);
                this.handlePhotoUpload(e.dataTransfer.files[0]);
            });
            
            photoInput.addEventListener('change', (e) => {
                console.log('📸 Photo selected:', e.target.files[0]);
                this.handlePhotoUpload(e.target.files[0]);
            });
            
            console.log('✅ Photo upload event listeners set successfully');
        } else {
            console.error('❌ Photo upload elements not found:', { photoUpload, photoInput });
        }
        
        // Video upload (optional)
        const videoUpload = document.getElementById('videoUpload');
        const videoInput = document.getElementById('videoInput');
        
        console.log('🎥 Video elements:', { videoUpload, videoInput });
        
        if (videoUpload && videoInput) {
            console.log('✅ Video upload elements found, setting up event listeners...');
            
            // Entferne alte Event-Listener falls vorhanden
            videoUpload.replaceWith(videoUpload.cloneNode(true));
            const newVideoUpload = document.getElementById('videoUpload');
            
            newVideoUpload.addEventListener('click', (e) => {
                console.log('🎥 Video upload clicked!');
                e.preventDefault();
                e.stopPropagation();
                videoInput.click();
            });
            
            newVideoUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                newVideoUpload.classList.add('dragover');
            });
            
            newVideoUpload.addEventListener('dragleave', () => {
                newVideoUpload.classList.remove('dragover');
            });
            
            newVideoUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newVideoUpload.classList.remove('dragover');
                console.log('🎥 Video dropped:', e.dataTransfer.files[0]);
                this.handleVideoUpload(e.dataTransfer.files[0]);
            });
            
            videoInput.addEventListener('change', (e) => {
                console.log('🎥 Video selected:', e.target.files[0]);
                this.handleVideoUpload(e.target.files[0]);
            });
            
            console.log('✅ Video upload event listeners set successfully');
        } else {
            console.error('❌ Video upload elements not found:', { videoUpload, videoInput });
        }
        
        // Test-Buttons für Debugging
        this.addDebugButtons();
    }

    addDebugButtons() {
        console.log('🔧 Adding debug buttons...');
        
        // Entferne alte Debug-Buttons falls vorhanden
        const oldDebug = document.getElementById('debugContainer');
        if (oldDebug) oldDebug.remove();
        
        // Füge Debug-Buttons hinzu
        const debugContainer = document.createElement('div');
        debugContainer.id = 'debugContainer';
        debugContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 12px;
        `;
        
        debugContainer.innerHTML = `
            <div style="margin-bottom: 10px;"><strong>Debug Panel</strong></div>
            <button onclick="adminPanel.testPhotoUpload()" style="margin: 2px; padding: 5px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Test Photo</button>
            <button onclick="adminPanel.testVideoUpload()" style="margin: 2px; padding: 5px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">Test Video</button>
            <button onclick="adminPanel.testAIProcessing()" style="margin: 2px; padding: 5px; background: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer;">Test AI</button>
            <button onclick="this.parentElement.remove()" style="margin: 2px; padding: 5px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Close</button>
        `;
        
        document.body.appendChild(debugContainer);
        console.log('✅ Debug buttons added');
    }

    testPhotoUpload() {
        console.log('🧪 Testing photo upload...');
        this.showToast('Test: Photo Upload gestartet', 'info');
        
        // Simuliere Foto-Upload
        setTimeout(() => {
            this.handlePhotoUpload({
                type: 'image/jpeg',
                name: 'test-photo.jpg',
                size: 1024
            });
        }, 1000);
    }

    testVideoUpload() {
        console.log('🧪 Testing video upload...');
        this.showToast('Test: Video Upload gestartet', 'info');
        
        // Simuliere Video-Upload
        setTimeout(() => {
            this.handleVideoUpload({
                type: 'video/mp4',
                name: 'test-video.mp4',
                size: 2048
            });
        }, 1000);
    }

    testAIProcessing() {
        console.log('🧪 Testing AI processing...');
        this.showToast('Test: AI Processing gestartet', 'info');
        this.startAIProcessing();
    }

    async handlePhotoUpload(file) {
        console.log('🖼️ Handling photo upload:', file);
        
        // Prüfe ob es eine echte Datei oder simulierte Datei ist
        if (file && file.type && file.type.startsWith('image/')) {
            console.log('✅ Valid image file detected');
        } else if (file && file.type === 'image/jpeg') {
            console.log('✅ Simulated image file detected');
        } else {
            console.error('❌ Invalid file type:', file?.type);
            this.showToast('Bitte wähle ein gültiges Bild aus', 'error');
            return;
        }

        try {
            // Verwende AI Twin Klasse für Verarbeitung
            if (file instanceof File) {
                console.log('📁 Real file detected, processing with AI Twin...');
                const aiTwin = await this.aiTwin.processPhoto(file);
                this.processAIResult(aiTwin);
            } else {
                console.log('🎭 Simulated file detected, creating dummy AI Twin...');
                // Erstelle einen Dummy-DataURL für simulierte Dateien
                const dummyDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k=';
                const aiTwin = {
                    id: Date.now(),
                    photoUrl: dummyDataURL,
                    createdAt: new Date().toISOString(),
                    features: {
                        faceDetection: true,
                        emotionAnalysis: true,
                        voiceSynthesis: true
                    }
                };
                this.processAIResult(aiTwin);
            }
        } catch (error) {
            console.error('❌ Error processing photo:', error);
            this.showToast('Fehler beim Verarbeiten des Fotos', 'error');
        }
    }

    processAIResult(aiTwin) {
        console.log('🔄 Processing AI result...');
        
        this.aiTwinData = this.aiTwinData || {};
        this.aiTwinData.isCreated = true;
        this.aiTwinData.photoUrl = aiTwin.photoUrl;
        this.aiTwinData.createdAt = aiTwin.createdAt;
        this.aiTwinData.features = aiTwin.features;
        this.saveData();
        
        console.log('✅ AI Twin created successfully');
        this.showToast('AI Twin erfolgreich erstellt!', 'success');
        this.updateAISteps(4);
        
        // Update UI
        this.updateAITwinUI();
    }

    handleVideoUpload(file) {
        console.log('Handling video upload:', file);
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
        console.log('Starting AI processing...');
        const uploadArea = document.getElementById('aiUploadArea');
        const processingArea = document.getElementById('aiProcessing');
        
        if (uploadArea) uploadArea.style.display = 'none';
        if (processingArea) processingArea.style.display = 'block';
        
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
        console.log('AI processing completed');
        const processingArea = document.getElementById('aiProcessing');
        if (processingArea) processingArea.style.display = 'none';
        
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
        console.log('Updating AI steps to:', activeStep);
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber <= activeStep);
        });
    }

    // Präsentationen und Text-Eingabe
    createNewPresentation() {
        console.log('Creating new presentation...');
        const presentationModal = document.createElement('div');
        presentationModal.className = 'modal-overlay';
        presentationModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Neue Präsentation erstellen</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="presentationForm">
                        <div class="form-group">
                            <label>Titel der Präsentation</label>
                            <input type="text" name="title" class="form-control" placeholder="z.B. Bewerbung für HR-Position" required>
                        </div>
                        <div class="form-group">
                            <label>Text zum Vortragen</label>
                            <textarea name="text" class="form-control" rows="8" placeholder="Geben Sie hier den Text ein, den Ihr AI Twin vortragen soll..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Oder Datei hochladen</label>
                            <input type="file" name="file" accept=".txt,.doc,.docx,.pdf" class="form-control">
                            <small>Unterstützte Formate: TXT, DOC, DOCX, PDF</small>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Abbrechen</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-play"></i>
                                Präsentation starten
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(presentationModal);
        
        // Form submission handler
        document.getElementById('presentationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePresentationSubmit(e.target);
        });
        
        // File upload handler
        const fileInput = presentationModal.querySelector('input[type="file"]');
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0], presentationModal.querySelector('textarea[name="text"]'));
        });
    }

    handleFileUpload(file, textarea) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            let content = e.target.result;
            
            // Einfache Text-Extraktion (für bessere Ergebnisse würde man eine Bibliothek verwenden)
            if (file.type === 'application/pdf') {
                content = 'PDF-Inhalt wird extrahiert... (Simulation)';
            } else if (file.type.includes('word') || file.type.includes('document')) {
                content = 'Word-Dokument wird extrahiert... (Simulation)';
            }
            
            textarea.value = content;
            this.showToast('Datei erfolgreich geladen', 'success');
        };
        
        if (file.type === 'text/plain') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    }

    handlePresentationSubmit(form) {
        const formData = new FormData(form);
        const title = formData.get('title');
        const text = formData.get('text');
        
        if (!text.trim()) {
            this.showToast('Bitte geben Sie einen Text ein', 'error');
            return;
        }
        
        // Präsentation speichern
        this.aiTwinData.presentations = this.aiTwinData.presentations || [];
        const presentation = {
            id: Date.now(),
            title: title,
            text: text,
            createdAt: new Date().toISOString()
        };
        
        this.aiTwinData.presentations.push(presentation);
        this.saveData();
        
        // Modal schließen
        form.closest('.modal-overlay').remove();
        
        // Präsentation starten
        this.startPresentation(presentation);
    }

    startPresentation(presentation) {
        console.log('🎭 Starting presentation:', presentation);
        
        // Entferne alte Präsentations-Modals
        const oldModals = document.querySelectorAll('.presentation-modal');
        oldModals.forEach(modal => modal.remove());
        
        const presentationModal = document.createElement('div');
        presentationModal.className = 'modal-overlay presentation-modal';
        presentationModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        presentationModal.innerHTML = `
            <div class="modal-content presentation-content" style="
                background: white;
                border-radius: 8px;
                max-width: 800px;
                width: 90%;
                max-height: 90%;
                overflow-y: auto;
                padding: 20px;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                ">
                    <h3 style="margin: 0; color: #333;">${presentation.title}</h3>
                    <button 
                        onclick="this.closest('.modal-overlay').remove()"
                        style="
                            background: none;
                            border: none;
                            font-size: 20px;
                            cursor: pointer;
                            color: #666;
                        "
                    >
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <div class="presentation-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="twin-video-section">
                            <h4 style="margin-bottom: 15px; color: #333;">🤖 Ihr AI Twin präsentiert:</h4>
                            <div class="video-container" style="
                                background: #f8f9fa;
                                border-radius: 8px;
                                padding: 20px;
                                text-align: center;
                                border: 2px dashed #dee2e6;
                            ">
                                <div style="font-size: 48px; margin-bottom: 10px;">🤖</div>
                                <div style="color: #666; margin-bottom: 15px;">AI Twin Simulation</div>
                                <div class="presentation-status" style="
                                    background: #007bff;
                                    color: white;
                                    padding: 10px;
                                    border-radius: 4px;
                                    display: inline-block;
                                ">
                                    🎤 AI Twin spricht...
                                </div>
                            </div>
                        </div>
                        <div class="text-section">
                            <h4 style="margin-bottom: 15px; color: #333;">📝 Vorgetragener Text:</h4>
                            <div class="text-content" style="
                                background: #f8f9fa;
                                padding: 15px;
                                border-radius: 4px;
                                border-left: 4px solid #007bff;
                                max-height: 300px;
                                overflow-y: auto;
                            ">
                                <p style="margin: 0; line-height: 1.6; color: #333;">${presentation.text}</p>
                            </div>
                            <div class="presentation-controls" style="
                                margin-top: 20px;
                                display: flex;
                                gap: 10px;
                            ">
                                <button 
                                    onclick="adminPanel.replayPresentation()"
                                    style="
                                        padding: 10px 20px;
                                        background: #28a745;
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: pointer;
                                    "
                                >
                                    🔄 Wiederholen
                                </button>
                                <button 
                                    onclick="adminPanel.downloadPresentation('${presentation.id}')"
                                    style="
                                        padding: 10px 20px;
                                        background: #6c757d;
                                        color: white;
                                        border: none;
                                        border-radius: 4px;
                                        cursor: pointer;
                                    "
                                >
                                    📥 Herunterladen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(presentationModal);
        console.log('✅ Presentation modal created and displayed');
        
        // Simuliere Text-Hervorhebung
        this.simulateTextHighlighting(presentation.text);
        
        this.showToast('Präsentation gestartet!', 'success');
    }

    simulateTextHighlighting(text) {
        console.log('✨ Simulating text highlighting...');
        
        const textElement = document.querySelector('.text-content p');
        if (!textElement) return;
        
        const words = text.split(' ');
        let currentWordIndex = 0;
        
        const interval = setInterval(() => {
            if (currentWordIndex < words.length) {
                // Markiere aktuelles Wort
                const highlightedText = words.map((word, index) => {
                    return index === currentWordIndex ? 
                        `<span style="background: #ffeb3b; padding: 2px 4px; border-radius: 2px;">${word}</span>` : 
                        word;
                }).join(' ');
                
                textElement.innerHTML = highlightedText;
                currentWordIndex++;
            } else {
                clearInterval(interval);
                this.showToast('Präsentation abgeschlossen!', 'success');
            }
        }, 300); // 300ms pro Wort
    }

    replayPresentation() {
        const video = document.querySelector('#presentationVideo');
        if (video) {
            video.currentTime = 0;
            video.play();
        }
    }

    downloadPresentation(presentationId) {
        const presentation = this.aiTwinData.presentations?.find(p => p.id == presentationId);
        if (!presentation) {
            this.showToast('Präsentation nicht gefunden', 'error');
            return;
        }
        
        // Erstelle Download-Link
        const blob = new Blob([presentation.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${presentation.title}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Präsentation heruntergeladen', 'success');
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
        console.log('Showing toast:', message, type);
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
        } else {
            console.error('Toast container not found');
            // Fallback: alert
            alert(message);
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

    showTextInputSection() {
        console.log('📝 Creating text input section...');
        
        // Erstelle Text-Input-Sektion falls sie nicht existiert
        let textInputSection = document.getElementById('textInputSection');
        
        if (!textInputSection) {
            console.log('🆕 Creating new text input section...');
            textInputSection = document.createElement('div');
            textInputSection.id = 'textInputSection';
            textInputSection.className = 'text-input-section';
            textInputSection.style.cssText = `
                margin-top: 20px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #dee2e6;
            `;
            
            textInputSection.innerHTML = `
                <h4 style="margin-bottom: 15px; color: #333;">📝 Text für Präsentation eingeben</h4>
                <div class="text-input-container">
                    <textarea 
                        id="presentationText" 
                        placeholder="Geben Sie hier den Text ein, den Ihr AI Twin vortragen soll..." 
                        rows="6"
                        style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: inherit; resize: vertical;"
                    ></textarea>
                    <div class="text-input-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                        <button 
                            onclick="adminPanel.startPresentationFromText()"
                            style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
                        >
                            🎬 Präsentation starten
                        </button>
                        <button 
                            onclick="adminPanel.createNewPresentation()"
                            style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
                        >
                            ➕ Neue Präsentation
                        </button>
                    </div>
                </div>
            `;
            
            // Füge zur AI Twin Sektion hinzu
            const aiTwinContent = document.querySelector('.ai-twin-content');
            if (aiTwinContent) {
                aiTwinContent.appendChild(textInputSection);
                console.log('✅ Text input section added to AI Twin content');
            } else {
                console.error('❌ AI Twin content not found');
            }
        }
        
        textInputSection.style.display = 'block';
        console.log('✅ Text input section is now visible');
    }

    startPresentationFromText() {
        console.log('🎬 Starting presentation from text...');
        
        const textarea = document.getElementById('presentationText');
        if (!textarea) {
            console.error('❌ Textarea not found');
            this.showToast('Text-Eingabefeld nicht gefunden', 'error');
            return;
        }
        
        if (!textarea.value.trim()) {
            console.error('❌ No text entered');
            this.showToast('Bitte geben Sie einen Text ein', 'error');
            return;
        }

        console.log('📝 Text content:', textarea.value.trim());

        const presentation = {
            id: Date.now(),
            title: 'Präsentation ' + new Date().toLocaleTimeString(),
            text: textarea.value.trim(),
            createdAt: new Date().toISOString()
        };

        console.log('📋 Created presentation:', presentation);

        // Speichere Präsentation
        this.aiTwinData.presentations = this.aiTwinData.presentations || [];
        this.aiTwinData.presentations.push(presentation);
        this.saveData();

        console.log('💾 Presentation saved');

        // Starte Präsentation
        this.startPresentation(presentation);
    }
}

// Sofortige Initialisierung für bessere Kompatibilität
(function() {
    console.log('Admin Panel script loading...');
    
    // Warte auf DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAdminPanel);
    } else {
        initializeAdminPanel();
    }
    
    function initializeAdminPanel() {
        console.log('Initializing Admin Panel...');
        try {
            adminPanel = new AdminPanel();
            window.adminPanel = adminPanel;
            console.log('✅ Admin Panel successfully initialized');
            console.log('Global adminPanel reference:', window.adminPanel);
        } catch (error) {
            console.error('❌ Error initializing Admin Panel:', error);
        }
    }
})();

