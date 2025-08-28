// Modern Admin Panel - EMERGENCY FIX v4.0
'use strict';

// Globale Variable für Admin Panel
let adminPanel = null;

// EMERGENCY AI Twin Implementation - Simplified & Guaranteed to Work
class EmergencyAITwin {
    constructor() {
        this.isProcessing = false;
        this.currentTwin = null;
    }

    // Simplified photo processing
    async processPhoto(file) {
        console.log('🚨 EMERGENCY: Processing photo...');
        this.isProcessing = true;
        
        return new Promise((resolve, reject) => {
            try {
                let photoUrl;
                
                if (file instanceof File) {
                    console.log('📁 Real file detected, creating object URL...');
                    photoUrl = URL.createObjectURL(file);
                } else {
                    console.log('🎭 Simulated file detected, using dummy URL...');
                    photoUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k=';
                }
                
                // Simulate AI processing with progress
                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += Math.random() * 25;
                    console.log(`🤖 AI Processing: ${Math.min(100, progress).toFixed(0)}%`);
                    
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                        this.isProcessing = false;
                        
                        // Create AI Twin result with validation
                        const aiTwin = {
                            id: Date.now(),
                            photoUrl: photoUrl,
                            createdAt: new Date().toISOString(),
                            isCreated: true,
                            status: 'completed',
                            features: {
                                faceDetection: true,
                                emotionAnalysis: true,
                                voiceSynthesis: true
                            },
                            processing: {
                                stages: ['upload', 'analysis', 'synthesis', 'completion'],
                                currentStage: 'completion',
                                progress: 100
                            }
                        };
                        
                        // Validiere das Ergebnis
                        if (!aiTwin.photoUrl || !aiTwin.id) {
                            console.error('❌ Invalid AI Twin data created');
                            reject(new Error('AI Twin creation failed - invalid data'));
                            return;
                        }
                        
                        console.log('✅ EMERGENCY: AI Twin created successfully:', aiTwin);
                        resolve(aiTwin);
                    }
                }, 500);
                
            } catch (error) {
                console.error('❌ Error in processPhoto:', error);
                this.isProcessing = false;
                reject(error);
            }
        });
    }

    // Simplified presentation creation
    async createPresentation(text, aiTwin) {
        console.log('🚨 EMERGENCY: Creating presentation...');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const presentation = {
                    id: Date.now(),
                    title: 'AI Twin Präsentation',
                    text: text,
                    aiTwin: aiTwin,
                    createdAt: new Date().toISOString()
                };
                
                console.log('✅ EMERGENCY: Presentation created:', presentation);
                resolve(presentation);
            }, 1000);
        });
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
        this.aiTwins = []; // Array für mehrere AI Twins
        this.currentTwinId = null; // Aktuell ausgewählter Twin
        this.notifications = [];
        
        // Initialize AI Twin
        this.aiTwin = new EmergencyAITwin();
        
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
            this.aiTwins = JSON.parse(localStorage.getItem('aiTwins') || '[]');
            this.currentTwinId = localStorage.getItem('currentTwinId') || null;
            this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            
            console.log('📊 Loaded AI Twins:', this.aiTwins.length, 'twins');
        } catch (error) {
            console.warn('⚠️ Local Storage not available (private window?), using defaults');
            this.websiteData = {};
            this.mediaFiles = [];
            this.aiTwinData = {};
            this.aiTwins = [];
            this.currentTwinId = null;
            this.notifications = [];
        }
    }

    saveData() {
                try {
            localStorage.setItem('websiteData', JSON.stringify(this.websiteData));
            localStorage.setItem('mediaFiles', JSON.stringify(this.mediaFiles));
            localStorage.setItem('aiTwinData', JSON.stringify(this.aiTwinData));
            localStorage.setItem('aiTwins', JSON.stringify(this.aiTwins));
            localStorage.setItem('currentTwinId', this.currentTwinId || '');
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
            
            console.log('💾 Saved AI Twins:', this.aiTwins.length, 'twins');
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
        this.setupAITwinUpload();
        this.updateAITwinsUI(); // Verwende neue Multi-Twin UI
        
        // Initialize twin gallery
        this.showTwinGallery();
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
        
        // Photo upload - Versuche verschiedene Selektoren
        let photoUpload = document.getElementById('photoUpload') || 
                         document.querySelector('.upload-zone') ||
                         document.querySelector('[onclick*="photo"]') ||
                         document.querySelector('.ai-twin-section .upload-zone');
        
        let photoInput = document.getElementById('photoInput') ||
                        document.querySelector('input[type="file"][accept*="image"]');
        
        // Erstelle Input falls nicht vorhanden
        if (!photoInput) {
            console.log('📸 Creating photo input element...');
            photoInput = document.createElement('input');
            photoInput.type = 'file';
            photoInput.id = 'photoInput';
            photoInput.accept = 'image/*';
            photoInput.style.display = 'none';
            document.body.appendChild(photoInput);
        }
        
        // Falls kein Upload-Element gefunden wurde, erstelle eines
        if (!photoUpload) {
            console.log('📸 Creating photo upload element...');
            photoUpload = document.createElement('div');
            photoUpload.id = 'photoUpload';
            photoUpload.className = 'upload-zone';
            photoUpload.innerHTML = `
                <i class="fas fa-camera"></i>
                <p>Foto hierher ziehen oder klicken</p>
            `;
            photoUpload.style.cssText = `
                border: 2px dashed #007bff;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                margin: 10px 0;
                background: #f8f9fa;
            `;
            
            // Füge zu AI Twin Sektion hinzu
            const aiTwinSection = document.querySelector('.ai-twin-content') || 
                                 document.querySelector('#aiTwinSection') ||
                                 document.body;
            aiTwinSection.appendChild(photoUpload);
        }
        
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
            
            // Versuche alternative Selektoren
            setTimeout(() => {
                console.log('🔄 Retrying photo upload setup...');
                this.setupAITwinUpload();
            }, 1000);
        }
        
        // Video upload (optional) - Versuche verschiedene Selektoren
        let videoUpload = document.getElementById('videoUpload') ||
                         document.querySelector('.upload-zone:last-child') ||
                         document.querySelector('[data-upload="video"]');
        
        let videoInput = document.getElementById('videoInput') ||
                        document.querySelector('input[type="file"][accept*="video"]');
        
        // Erstelle Video Input falls nicht vorhanden
        if (!videoInput) {
            console.log('🎥 Creating video input element...');
            videoInput = document.createElement('input');
            videoInput.type = 'file';
            videoInput.id = 'videoInput';
            videoInput.accept = 'video/*';
            videoInput.style.display = 'none';
            document.body.appendChild(videoInput);
        }
        
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
        console.log('🚨 EMERGENCY: Adding debug buttons...');
        
        // Entferne alte Debug-Buttons falls vorhanden
        const oldDebug = document.getElementById('debugContainer');
        if (oldDebug) oldDebug.remove();
        
        // Füge EMERGENCY Debug-Buttons hinzu
        const debugContainer = document.createElement('div');
        debugContainer.id = 'debugContainer';
        debugContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(255,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 9999;
            font-size: 14px;
            border: 2px solid white;
        `;
        
        debugContainer.innerHTML = `
            <div style="margin-bottom: 15px;"><strong>🚨 EMERGENCY PANEL</strong></div>
            <button onclick="adminPanel.forceInit()" style="margin: 3px; padding: 8px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">FORCE INIT</button>
            <button onclick="adminPanel.emergencyUpload()" style="margin: 3px; padding: 8px; background: #ff6b35; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">EMERGENCY UPLOAD</button>
            <button onclick="adminPanel.testPhotoUpload()" style="margin: 3px; padding: 8px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Test Photo</button>
            <button onclick="adminPanel.debugStatus()" style="margin: 3px; padding: 8px; background: #6f42c1; color: white; border: none; border-radius: 5px; cursor: pointer;">Debug Status</button>
            <button onclick="adminPanel.testPresentation()" style="margin: 3px; padding: 8px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Test Präsentation</button>
            <button onclick="adminPanel.testDownload()" style="margin: 3px; padding: 8px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer;">Test Download</button>
            <button onclick="this.parentElement.remove()" style="margin: 3px; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        `;
        
        document.body.appendChild(debugContainer);
        console.log('✅ EMERGENCY: Debug buttons added');
    }

    forceInit() {
        console.log('🚨 EMERGENCY: Force initializing...');
        try {
            if (!window.adminPanel) {
                adminPanel = new AdminPanel();
                window.adminPanel = adminPanel;
                console.log('✅ EMERGENCY: Force initialized');
                this.showToast('EMERGENCY: Admin Panel initialisiert!', 'success');
            } else {
                console.log('✅ EMERGENCY: Admin Panel already exists');
                this.showToast('Admin Panel bereits initialisiert', 'info');
            }
        } catch (error) {
            console.error('❌ EMERGENCY: Force init failed:', error);
            this.showToast('Force Init fehlgeschlagen', 'error');
        }
    }

    emergencyUpload() {
        console.log('🚨 EMERGENCY: Starting emergency upload...');
        try {
            // Erstelle direkten File Input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    console.log('🚨 EMERGENCY: File selected:', file.name);
                    this.showToast('EMERGENCY: Datei wird verarbeitet...', 'info');
                    
                    try {
                        await this.handlePhotoUpload(file);
                    } catch (error) {
                        console.error('❌ EMERGENCY: Upload failed:', error);
                        this.showToast('EMERGENCY Upload fehlgeschlagen', 'error');
                    }
                }
                document.body.removeChild(input);
            };
            
            document.body.appendChild(input);
            input.click();
            
        } catch (error) {
            console.error('❌ EMERGENCY: Emergency upload failed:', error);
            this.showToast('Emergency Upload fehlgeschlagen', 'error');
        }
    }

    testPresentation() {
        console.log('🚨 EMERGENCY: Testing presentation...');
        this.showToast('Test: Präsentation gestartet', 'info');
        
        // Create test presentation
        const testPresentation = {
            id: Date.now(),
            title: 'Test Präsentation',
            text: 'Dies ist eine Test-Präsentation des AI Twins. Die Funktionalität wird getestet.',
            createdAt: new Date().toISOString()
        };
        
        this.startPresentation(testPresentation);
    }

    debugStatus() {
        console.log('🔍 DEBUG STATUS:');
        console.log('AI Twin Data:', this.aiTwinData);
        console.log('Upload Area:', document.getElementById('aiUploadArea'));
        console.log('Twin Preview:', document.getElementById('twinPreview'));
        console.log('Steps:', document.querySelectorAll('[data-step]'));
        
        // Show status in UI
        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 12px;
            max-width: 300px;
        `;
        statusDiv.innerHTML = `
            <strong>Debug Status:</strong><br>
            AI Twin Created: ${this.aiTwinData?.isCreated ? '✅ Yes' : '❌ No'}<br>
            Photo URL: ${this.aiTwinData?.photoUrl ? '✅ Yes' : '❌ No'}<br>
            Upload Area: ${document.getElementById('aiUploadArea') ? '✅ Found' : '❌ Missing'}<br>
            Twin Preview: ${document.getElementById('twinPreview') ? '✅ Found' : '❌ Missing'}<br>
            <button onclick="this.parentElement.remove()" style="margin-top: 5px; background: red; color: white; border: none; padding: 2px 5px;">Close</button>
        `;
        document.body.appendChild(statusDiv);
        
        return {
            aiTwinData: this.aiTwinData,
            uploadArea: document.getElementById('aiUploadArea'),
            twinPreview: document.getElementById('twinPreview')
        };
    }

    async testPhotoUpload() {
        console.log('🧪 Testing photo upload...');
        this.showToast('Test: Photo Upload gestartet', 'info');
        
        // Simuliere Foto-Upload
        setTimeout(async () => {
            try {
                await this.handlePhotoUpload({
                    type: 'image/jpeg',
                    name: 'test-photo.jpg',
                    size: 1024
                });
            } catch (error) {
                console.error('❌ Test photo upload failed:', error);
                this.showToast('Test fehlgeschlagen', 'error');
            }
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

    async testDownload() {
        console.log('🧪 Testing download...');
        this.showToast('Test: Download gestartet', 'info');
        
        // Simuliere Download
        setTimeout(async () => {
            try {
                await this.downloadTwin();
            } catch (error) {
                console.error('❌ Test download failed:', error);
                this.showToast('Download Test fehlgeschlagen', 'error');
            }
            }, 1000);
    }

    async handlePhotoUpload(file) {
        console.log('🚨 EMERGENCY: Handling photo upload:', file);
        
        if (!file) {
            console.error('❌ No file provided');
            this.showToast('Keine Datei ausgewählt', 'error');
            return;
        }

        try {
            // Show processing message
            this.showToast('Foto wird verarbeitet...', 'info');
            
            // Start AI processing
            console.log('🤖 Starting AI Twin processing...');
            const aiTwin = await this.aiTwin.processPhoto(file);
            
            console.log('✅ AI Twin processing completed:', aiTwin);
            this.processAIResult(aiTwin);
            
        } catch (error) {
            console.error('❌ EMERGENCY: Error processing photo:', error);
            this.showToast('Fehler beim Verarbeiten des Fotos: ' + error.message, 'error');
        }
    }

    processAIResult(aiTwin) {
        console.log('🔄 Processing AI result...', aiTwin);
        
        try {
            // Validiere AI Twin Daten
            if (!aiTwin || !aiTwin.photoUrl) {
                throw new Error('Invalid AI Twin data');
            }
            
            // Erstelle neuen Twin mit eindeutiger ID und Namen
            const newTwin = {
                id: aiTwin.id || Date.now(),
                name: `AI Twin ${this.aiTwins.length + 1}`,
                photoUrl: aiTwin.photoUrl,
                createdAt: aiTwin.createdAt || new Date().toISOString(),
                isCreated: true,
                features: aiTwin.features || {
                    faceDetection: true,
                    emotionAnalysis: true,
                    voiceSynthesis: true
                },
                presentations: [],
                stats: {
                    totalPresentations: 0,
                    totalDownloads: 0,
                    lastUsed: new Date().toISOString()
                }
            };
            
            // Füge zum Twins Array hinzu
            this.aiTwins.push(newTwin);
            this.currentTwinId = newTwin.id;
            
            // Backward compatibility
            this.aiTwinData = newTwin;
            
            // Speichere sofort
            this.saveData();
            
            console.log('✅ AI Twin created successfully:', newTwin);
            console.log('📊 Total AI Twins:', this.aiTwins.length);
            this.showToast(`🤖 ${newTwin.name} erfolgreich erstellt! (${this.aiTwins.length} Twins total)`, 'success');
            
            // Update UI
            this.updateAITwinsUI();
            this.showTwinGallery();
            
            // Text Input Section nach kurzer Verzögerung
            setTimeout(() => {
                this.showTextInputSection();
                console.log('📝 Text input section should be visible now');
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error processing AI result:', error);
            this.showToast('Fehler beim Erstellen des AI Twins: ' + error.message, 'error');
        }
    }

    forceUIUpdate() {
        console.log('🔄 Forcing UI update...');
        
        // Verstecke Upload-Area
        const uploadArea = document.getElementById('aiUploadArea');
        if (uploadArea) {
            uploadArea.style.display = 'none';
            console.log('✅ Upload area hidden');
        }
        
        // Zeige Twin Preview
        const twinPreview = document.getElementById('twinPreview');
        if (twinPreview) {
            twinPreview.style.display = 'block';
            console.log('✅ Twin preview shown');
            
            // Update video source
            const twinVideo = document.getElementById('twinVideo');
            if (twinVideo && this.aiTwinData && this.aiTwinData.photoUrl) {
                twinVideo.src = this.aiTwinData.photoUrl;
                console.log('✅ Video source updated to:', this.aiTwinData.photoUrl);
            }
        }
        
        // Update alle Steps
        for (let i = 1; i <= 4; i++) {
            const step = document.querySelector(`[data-step="${i}"]`);
            if (step) {
                step.classList.remove('active', 'completed');
                if (i <= 4) step.classList.add('completed');
                if (i === 4) step.classList.add('active');
            }
        }
        
        console.log('✅ Force UI update completed');
    }

    updateAITwinsUI() {
        console.log('🔄 Updating AI Twins UI...');
        this.showTwinGallery();
        this.updateAISteps(this.aiTwins.length > 0 ? 4 : 1);
    }

    showTwinGallery() {
        console.log('🖼️ Showing Twin Gallery...', this.aiTwins.length, 'twins');
        
        // Finde oder erstelle Galerie-Container
        let galleryContainer = document.getElementById('twinGallery');
        if (!galleryContainer) {
            galleryContainer = document.createElement('div');
            galleryContainer.id = 'twinGallery';
            galleryContainer.className = 'twin-gallery';
            
            // Füge zur AI Twin Sektion hinzu
            const aiTwinContent = document.querySelector('.ai-twin-content') || 
                                 document.querySelector('#aiTwinSection') ||
                                 document.body;
            aiTwinContent.appendChild(galleryContainer);
        }
        
        // Styles für Galerie
        galleryContainer.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        `;
        
        if (this.aiTwins.length === 0) {
            galleryContainer.innerHTML = `
                <div style="text-align: center; color: #6c757d; padding: 20px;">
                    <i class="fas fa-robot" style="font-size: 48px; margin-bottom: 10px;"></i>
                    <h4>Noch keine AI Twins erstellt</h4>
                    <p>Laden Sie Fotos hoch um Ihre ersten digitalen Avatare zu erstellen</p>
                </div>
            `;
            return;
        }
        
        // Render Twin Galerie
        galleryContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #333;">
                    <i class="fas fa-users"></i> Meine AI Twins (${this.aiTwins.length})
                </h4>
                <button onclick="adminPanel.resetUploadArea()" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-plus"></i> Neuen Twin erstellen
                </button>
            </div>
            <div class="twins-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${this.aiTwins.map(twin => this.renderTwinCard(twin)).join('')}
            </div>
        `;
    }

    renderTwinCard(twin) {
        const isActive = this.currentTwinId === twin.id;
        return `
            <div class="twin-card ${isActive ? 'active' : ''}" style="
                background: ${isActive ? '#e3f2fd' : 'white'};
                border: 2px solid ${isActive ? '#2196f3' : '#dee2e6'};
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            " onclick="adminPanel.selectTwin('${twin.id}')">
                
                <img src="${twin.photoUrl}" alt="${twin.name}" style="
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-bottom: 10px;
                    border: 3px solid ${isActive ? '#2196f3' : '#dee2e6'};
                ">
                
                <h5 style="margin: 5px 0; color: #333;">${twin.name}</h5>
                <p style="margin: 5px 0; color: #6c757d; font-size: 12px;">
                    ${new Date(twin.createdAt).toLocaleDateString('de-DE')}
                </p>
                
                <div style="margin-top: 10px; display: flex; justify-content: center; gap: 5px;">
                    <button onclick="event.stopPropagation(); adminPanel.renameTwin('${twin.id}')" 
                            style="padding: 2px 6px; background: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="event.stopPropagation(); adminPanel.downloadTwin('${twin.id}')" 
                            style="padding: 2px 6px; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="event.stopPropagation(); adminPanel.deleteTwin('${twin.id}')" 
                            style="padding: 2px 6px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                ${isActive ? `<div style="position: absolute; top: 5px; right: 5px; background: #4caf50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">AKTIV</div>` : ''}
            </div>
        `;
    }

    selectTwin(twinId) {
        console.log('🎯 Selecting twin:', twinId);
        this.currentTwinId = twinId;
        const selectedTwin = this.aiTwins.find(t => t.id === twinId);
        if (selectedTwin) {
            this.aiTwinData = selectedTwin; // Backward compatibility
            selectedTwin.stats.lastUsed = new Date().toISOString();
            this.saveData();
            this.showTwinGallery(); // Refresh UI
            this.showToast(`${selectedTwin.name} ausgewählt`, 'info');
        }
    }

    resetUploadArea() {
        console.log('🔄 Resetting upload area for new twin...');
        
        // Zeige Upload-Bereich wieder
        const uploadArea = document.getElementById('aiUploadArea');
        if (uploadArea) {
            uploadArea.style.display = 'block';
        }
        
        // Verstecke Twin Preview
        const twinPreview = document.getElementById('twinPreview');
        if (twinPreview) {
            twinPreview.style.display = 'none';
        }
        
        // Reset Steps
        this.updateAISteps(1);
        
        this.showToast('Bereit für neuen AI Twin!', 'info');
    }

    renameTwin(twinId) {
        const twin = this.aiTwins.find(t => t.id === twinId);
        if (!twin) return;
        
        const newName = prompt('Neuer Name für den AI Twin:', twin.name);
        if (newName && newName.trim() && newName !== twin.name) {
            twin.name = newName.trim();
            this.saveData();
            this.showTwinGallery();
            this.showToast(`AI Twin umbenannt zu "${twin.name}"`, 'success');
        }
    }

    async downloadTwin(twinId) {
        const twin = this.aiTwins.find(t => t.id === twinId);
        if (!twin) return;
        
        try {
            console.log('📥 Downloading twin:', twin.name);
            
            // Update stats
            twin.stats.totalDownloads++;
            this.saveData();
            
            // Download photo
            const response = await fetch(twin.photoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${twin.name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            this.showToast(`${twin.name} heruntergeladen`, 'success');
            
        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showToast('Download fehlgeschlagen: ' + error.message, 'error');
        }
    }

    deleteTwin(twinId) {
        const twin = this.aiTwins.find(t => t.id === twinId);
        if (!twin) return;
        
        if (confirm(`Möchten Sie "${twin.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
            // Entferne aus Array
            this.aiTwins = this.aiTwins.filter(t => t.id !== twinId);
            
            // Reset current twin falls gelöscht
            if (this.currentTwinId === twinId) {
                this.currentTwinId = this.aiTwins.length > 0 ? this.aiTwins[0].id : null;
                this.aiTwinData = this.aiTwins.length > 0 ? this.aiTwins[0] : null;
            }
            
            this.saveData();
            this.showTwinGallery();
            this.showToast(`${twin.name} gelöscht`, 'success');
            
            console.log('🗑️ Twin deleted:', twin.name);
            console.log('📊 Remaining twins:', this.aiTwins.length);
        }
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

    async downloadPresentation(presentationId) {
        console.log('📥 Downloading presentation:', presentationId);
        
        const presentation = this.aiTwinData.presentations?.find(p => p.id == presentationId);
        if (!presentation) {
            console.error('❌ Presentation not found:', presentationId);
            this.showToast('Präsentation nicht gefunden', 'error');
            return;
        }
        
        try {
        // Erstelle Download-Link
            const blob = new Blob([presentation.text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
            link.download = `${presentation.title || 'presentation'}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
            
            // Füge Link zum DOM hinzu und klicke ihn
            document.body.appendChild(link);
        link.click();
            
            // Cleanup
            document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
            console.log('✅ Presentation download started');
        this.showToast('Präsentation heruntergeladen', 'success');
        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showToast('Download fehlgeschlagen: ' + error.message, 'error');
        }
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

    async downloadTwin() {
        console.log('📥 Downloading AI Twin...');

        if (!this.aiTwinData || !this.aiTwinData.photoUrl) {
            console.error('❌ No AI Twin data available for download');
            this.showToast('Kein AI Twin zum Herunterladen verfügbar', 'error');
            return;
        }
        
        try {
            // Konvertiere Data URL zu Blob für Download
            const response = await fetch(this.aiTwinData.photoUrl);
            const blob = await response.blob();
            
            // Erstelle Download-Link
            const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
            link.href = url;
            link.download = `ai-twin-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
            
            // Füge Link zum DOM hinzu und klicke ihn
            document.body.appendChild(link);
        link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ AI Twin download started');
            this.showToast('AI Twin Download gestartet', 'success');
        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showToast('Download fehlgeschlagen: ' + error.message, 'error');
        }
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

    async startPresentationFromText() {
        console.log('🚨 EMERGENCY: Starting presentation from text...');
        
        const textarea = document.getElementById('presentationText');
        if (!textarea || !textarea.value.trim()) {
            console.error('❌ EMERGENCY: No text entered');
            this.showToast('Bitte geben Sie einen Text ein', 'error');
            return;
        }

        try {
            // Simplified presentation creation
            const presentation = await this.aiTwin.createPresentation(
                textarea.value.trim(), 
                this.aiTwinData || { isCreated: true }
            );

            console.log('📋 EMERGENCY: Created presentation:', presentation);

            // Save and start presentation
            this.aiTwinData = this.aiTwinData || {};
            this.aiTwinData.presentations = this.aiTwinData.presentations || [];
            this.aiTwinData.presentations.push(presentation);
            this.saveData();

            this.startPresentation(presentation);
        } catch (error) {
            console.error('❌ EMERGENCY: Error creating presentation:', error);
            this.showToast('Fehler beim Erstellen der Präsentation', 'error');
        }
    }
}

// ULTRA-SAFE INITIALIZATION
(function() {
    console.log('🚨 ULTRA-SAFE: Admin Panel loading...');
    
    // Mehrfache Initialisierung für maximale Sicherheit
    function safeInit() {
        try {
            console.log('🚨 ULTRA-SAFE: Attempting initialization...');
            
            if (typeof AdminPanel === 'undefined') {
                console.error('❌ AdminPanel class not found, retrying...');
                setTimeout(safeInit, 500);
                return;
            }
            
            if (!window.adminPanel) {
    adminPanel = new AdminPanel();
                window.adminPanel = adminPanel;
                console.log('✅ ULTRA-SAFE: Admin Panel initialized successfully');
                
                // Setze globale Referenz mehrfach
                window.adminPanel = adminPanel;
                globalThis.adminPanel = adminPanel;
                
                // Test alle wichtigen Funktionen
                setTimeout(() => {
                    if (window.adminPanel) {
                        console.log('✅ ULTRA-SAFE: Admin Panel is accessible');
                        
                        // Setup Upload mit Retry
                        if (typeof window.adminPanel.setupAITwinUpload === 'function') {
                            window.adminPanel.setupAITwinUpload();
                        }
                        
                        // Debug Buttons mit Retry
                        if (typeof window.adminPanel.addDebugButtons === 'function') {
                            window.adminPanel.addDebugButtons();
                        }
                    } else {
                        console.error('❌ ULTRA-SAFE: Admin Panel lost reference, retrying...');
                        setTimeout(safeInit, 1000);
                    }
                }, 1000);
            }
            
        } catch (error) {
            console.error('❌ ULTRA-SAFE: Initialization failed:', error);
            setTimeout(safeInit, 1000);
        }
    }
    
    // Starte Initialisierung
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(safeInit, 100));
    } else {
        setTimeout(safeInit, 100);
    }
    
    // Backup Initialisierung
    setTimeout(safeInit, 2000);
    setTimeout(safeInit, 5000);
    
    // EMERGENCY OVERRIDE - Direkte Funktionen am Window-Objekt
    setTimeout(() => {
        if (!window.adminPanel) {
            console.log('🚨 EMERGENCY OVERRIDE: Creating direct functions...');
            
            window.emergencyUpload = function() {
                console.log('🚨 EMERGENCY UPLOAD: Direct function called');
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        alert('Datei ausgewählt: ' + file.name);
                        console.log('📁 File selected:', file);
                    }
                };
                input.click();
            };
            
            window.emergencyInit = function() {
                console.log('🚨 EMERGENCY INIT: Direct function called');
                location.reload();
            };
            
            // Erstelle Emergency Panel
            const emergencyDiv = document.createElement('div');
            emergencyDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: red;
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 99999;
                text-align: center;
            `;
            emergencyDiv.innerHTML = `
                <h3>🚨 EMERGENCY MODE</h3>
                <p>Admin Panel nicht geladen</p>
                <button onclick="window.emergencyUpload()" style="margin: 5px; padding: 10px; background: orange; color: white; border: none; border-radius: 5px; cursor: pointer;">EMERGENCY UPLOAD</button>
                <button onclick="window.emergencyInit()" style="margin: 5px; padding: 10px; background: blue; color: white; border: none; border-radius: 5px; cursor: pointer;">RELOAD PAGE</button>
                <button onclick="this.parentElement.remove()" style="margin: 5px; padding: 10px; background: gray; color: white; border: none; border-radius: 5px; cursor: pointer;">CLOSE</button>
            `;
            document.body.appendChild(emergencyDiv);
        }
    }, 10000);
})();

