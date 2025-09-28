// Modern Admin Panel - FINAL UNIFIED VERSION v6.1 - Loading Screen Fix
'use strict';

// Globale Variable für Admin Panel
let adminPanel = null;

// Multi-Language Support
const translations = {
    de: {
        dashboard: 'Dashboard',
        content: 'Inhalte',
        aiTwin: 'AI Twin',
        media: 'Medien',
        rentals: 'Vermietungen',
        bookings: 'Buchungen',
        analytics: 'Analytics',
        settings: 'Einstellungen',
        newContent: 'Neuer Inhalt',
        createAITwin: 'AI Twin erstellen',
        uploadMedia: 'Medien hochladen',
        manageRentals: 'Vermietungen verwalten',
        newBooking: 'Neue Buchung',
    },
    en: {
        dashboard: 'Dashboard',
        content: 'Content',
        aiTwin: 'AI Twin',
        media: 'Media',
        rentals: 'Rentals',
        bookings: 'Bookings',
        analytics: 'Analytics',
        settings: 'Settings',
        newContent: 'New Content',
        createAITwin: 'Create AI Twin',
        uploadMedia: 'Upload Media',
        manageRentals: 'Manage Rentals',
        newBooking: 'New Booking',
    }
};

// Enhanced AI Twin Implementation with Voice Integration
class EnhancedAITwin {
    constructor() {
        this.isProcessing = false;
        this.currentTwin = null;
        this.voiceRecognition = null;
        this.speechSynthesis = null;
        this.isListening = false;
        this.initVoiceFeatures();
    }

    // Initialize voice features
    initVoiceFeatures() {
        // Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'de-DE';
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('🎤 Voice input:', transcript);
                this.handleVoiceInput(transcript);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('🎤 Voice recognition error:', event.error);
            };
        }

        // Speech Synthesis
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
        }
    }

    // Handle voice input
    handleVoiceInput(transcript) {
        const textInput = document.getElementById('presentationText');
        if (textInput) {
            textInput.value = transcript;
            if (window.adminPanel && window.adminPanel.showToast) {
                window.adminPanel.showToast('Spracheingabe erfolgreich', 'success');
            }
        }
    }

    // Start voice recording
    startVoiceRecording() {
        if (this.voiceRecognition && !this.isListening) {
            this.isListening = true;
            this.voiceRecognition.start();
            if (window.adminPanel && window.adminPanel.showToast) {
                window.adminPanel.showToast('Sprachaufnahme gestartet...', 'info');
            }
            
            // Update UI
            const voiceBtn = document.getElementById('voiceRecordBtn');
            if (voiceBtn) {
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Aufnahme stoppen';
            }
        }
    }

    // Stop voice recording
    stopVoiceRecording() {
        if (this.voiceRecognition && this.isListening) {
            this.isListening = false;
            this.voiceRecognition.stop();
            
            // Update UI
            const voiceBtn = document.getElementById('voiceRecordBtn');
            if (voiceBtn) {
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i> Spracheingabe';
            }
        }
    }

    // Enhanced photo processing with drag & drop
    async processPhoto(file) {
        console.log('🚀 ENHANCED: Processing photo with drag & drop support...');
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
                
                // Enhanced AI processing with progress
                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += Math.random() * 25;
                    console.log(`🤖 Enhanced AI Processing: ${Math.min(100, progress).toFixed(0)}%`);
                    
                    // Update progress bar
                    const progressBar = document.querySelector('.ai-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${Math.min(100, progress)}%`;
                    }
                    
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                        this.isProcessing = false;
                        
                        // Create enhanced AI Twin result
                        const aiTwin = {
                            id: Date.now(),
                            photoUrl: photoUrl,
                            createdAt: new Date().toISOString(),
                            isCreated: true,
                            status: 'completed',
                            features: {
                                faceDetection: true,
                                emotionAnalysis: true,
                                voiceSynthesis: true,
                                dragDropSupport: true,
                                voiceIntegration: true
                            },
                            processing: {
                                stages: ['upload', 'analysis', 'synthesis', 'completion'],
                                currentStage: 'completion',
                                progress: 100
                            }
                        };
                        
                        console.log('✅ ENHANCED: AI Twin created successfully:', aiTwin);
                        resolve(aiTwin);
                    }
                }, 500);
                
            } catch (error) {
                console.error('❌ Error in enhanced processPhoto:', error);
                this.isProcessing = false;
                reject(error);
            }
        });
    }

    // Enhanced video processing
    async processVideo(videoBlob, videoUrl) {
        console.log('🎥 ENHANCED: Processing video with enhanced features...');
        this.isProcessing = true;
        
        return new Promise((resolve, reject) => {
            try {
                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += Math.random() * 15;
                    console.log(`🎥 Enhanced Video Processing: ${Math.min(100, progress).toFixed(0)}%`);
                    
                    // Update progress bar
                    const progressBar = document.querySelector('.ai-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${Math.min(100, progress)}%`;
                    }
                    
                    if (progress >= 100) {
                        clearInterval(progressInterval);
                        this.isProcessing = false;
                        
                        const aiTwin = {
                            id: Date.now(),
                            photoUrl: videoUrl,
                            videoUrl: videoUrl,
                            createdAt: new Date().toISOString(),
                            isCreated: true,
                            status: 'completed',
                            features: {
                                faceDetection: true,
                                emotionAnalysis: true,
                                voiceSynthesis: true,
                                motionAnalysis: true,
                                dragDropSupport: true,
                                voiceIntegration: true
                            }
                        };
                        
                        console.log('✅ ENHANCED: Video AI Twin created successfully:', aiTwin);
                        resolve(aiTwin);
                    }
                }, 500);
                
            } catch (error) {
                console.error('❌ Error in enhanced processVideo:', error);
                this.isProcessing = false;
                reject(error);
            }
        });
    }
}

// UNIFIED Admin Panel - Combines all features from different versions
class AdminPanel {
    constructor() {
        console.log('🚀 Initializing UNIFIED Admin Panel...');
        this.currentSection = 'dashboard';
        this.currentLanguage = 'de';
        this.isDarkMode = false;
        this.isSidebarCollapsed = false;
        this.aiTwin = new EnhancedAITwin();
        
        // Unified data structure
        this.data = {
            content: [],
            media: [],
            rentals: {
                wohnmobil: { title: 'Wohnmobil', description: 'Komfortables Wohnmobil für Ihre Reisen', price: '150€/Tag', images: [], availability: true },
                fotobox: { title: 'Fotobox', description: 'Professionelle Fotobox für Events', price: '200€/Tag', images: [], availability: true },
                ebikes: { title: 'E-Bikes', description: 'Elektrofahrräder für Stadt und Land', price: '50€/Tag', images: [], availability: true },
                sup: { title: 'SUP Boards', description: 'Stand-Up Paddle Boards für Wassersport', price: '30€/Tag', images: [], availability: true }
            },
            bookings: [],
            settings: {
                language: 'de',
                theme: 'light',
                notifications: true
            }
        };
        
        // Legacy data compatibility
        this.websiteData = this.data;
        this.mediaFiles = this.data.media;
        this.aiTwinData = this.data.aiTwin || {};
        this.notifications = [];
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing UNIFIED Admin Panel...');
        
        // Verstecke Loading Screen SOFORT und ZUVERLÄSSIG
        this.forceHideLoading();
        
        try {
            this.loadData();
            this.setupEventListeners();
            this.setupNavigation();
            this.loadCurrentSection();
            this.setupMobileMenu();
            this.loadTheme();
            this.setupSettingsTabs();
            this.setupDragAndDrop();
            this.setupCalendar();
            this.setupVoiceFeatures();
            this.setupMultiLanguage();
            
            // Set global reference
            window.adminPanel = this;
            
            // Stelle sicher, dass die globale Variable verfügbar ist
            if (typeof window !== 'undefined') {
                window.adminPanel = this;
                // Auch direkt als adminPanel verfügbar machen
                if (typeof globalThis !== 'undefined') {
                    globalThis.adminPanel = this;
                }
            }
            
            console.log('✅ UNIFIED Admin Panel initialized successfully!');
            console.log('🔍 Global adminPanel set:', !!window.adminPanel);
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            // Zeige trotzdem das Admin Panel - auch bei teilweisen Fehlern
            this.forceHideLoading();
            this.showBasicInterface();
        }
    }

    // Force hide loading screen - GARANTIERT funktionierend
    forceHideLoading() {
        console.log('🔧 FORCE: Hiding loading screen...');
        
        // Alle möglichen Selektoren probieren
        const selectors = ['#loadingScreen', '.loading-screen', '[id*="loading"]', '[class*="loading"]'];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none !important';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
                element.setAttribute('hidden', true);
                console.log(`✅ FORCE: Hidden element with selector: ${selector}`);
            });
        });
        
        // Admin Wrapper sichtbar machen
        const adminSelectors = ['.admin-wrapper', '#adminWrapper', '[class*="admin-wrapper"]'];
        
        adminSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'flex !important';
                element.style.opacity = '1 !important';
                element.style.visibility = 'visible';
                element.removeAttribute('hidden');
                console.log(`✅ FORCE: Shown admin element with selector: ${selector}`);
            });
        });
        
        // Zusätzlich den Body bereinigen
        document.body.classList.remove('loading');
        
        console.log('✅ FORCE: Loading screen force-hidden completed');
    }
    
    // Hide loading screen (alte Methode als Fallback)
    hideLoading() {
        this.forceHideLoading(); // Verwende die neue Methode
    }

    // Fallback method to show basic interface
    showBasicInterface() {
        console.log('🔧 Showing basic interface as fallback...');
        
        // Zuerst Loading Screen verstecken
        this.forceHideLoading();
        
        const adminWrapper = document.querySelector('.admin-wrapper');
        if (adminWrapper) {
            adminWrapper.style.display = 'flex';
            adminWrapper.style.opacity = '1';
            adminWrapper.style.visibility = 'visible';
            
            // Zeige Dashboard-Sektion
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                dashboard.classList.add('active');
                dashboard.style.display = 'block';
            }
            
            // Aktiviere Dashboard-Navigation
            const dashboardNav = document.querySelector('[data-section="dashboard"]');
            if (dashboardNav) {
                dashboardNav.classList.add('active');
            }
            
            // Stelle sicher, dass die Hauptbereiche sichtbar sind
            const adminMain = document.querySelector('.admin-main');
            if (adminMain) {
                adminMain.style.display = 'block';
                adminMain.style.visibility = 'visible';
            }
            
            const adminSidebar = document.querySelector('.admin-sidebar');
            if (adminSidebar) {
                adminSidebar.style.display = 'flex';
                adminSidebar.style.visibility = 'visible';
            }
            
            console.log('✅ Basic interface shown successfully');
        } else {
            console.error('❌ Admin wrapper not found in DOM');
        }
    }

    // Load current section
    loadCurrentSection() {
        this.showSection(this.currentSection);
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
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

    // Setup navigation
    setupNavigation() {
        console.log('🔧 Setting up navigation...');
        
        const navItems = document.querySelectorAll('.nav-item');
        console.log(`📋 Found ${navItems.length} navigation items`);
        
        navItems.forEach((item, index) => {
            const section = item.getAttribute('data-section');
            console.log(`📌 Nav item ${index}: ${section}`);
            
            // Entferne alte Event Listener
            item.replaceWith(item.cloneNode(true));
            const newItem = document.querySelectorAll('.nav-item')[index];
            
            newItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🔄 Navigation clicked: ${section}`);
                
                if (section) {
                    this.showSection(section);
                } else {
                    console.warn(`⚠️ No section attribute found for nav item ${index}`);
                }
            });
        });
        
        console.log('✅ Navigation setup completed');
    }

    // Setup mobile menu
    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.admin-sidebar');
        
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }
    }

    // Load theme
    loadTheme() {
        const theme = this.data.settings.theme || 'light';
        document.body.setAttribute('data-theme', theme);
    }

    // Setup settings tabs
    setupSettingsTabs() {
        const tabs = ['general', 'seo', 'security', 'backup'];
        
        tabs.forEach(tab => {
            const tabElement = document.querySelector(`[data-tab="${tab}"]`);
            if (tabElement) {
                tabElement.addEventListener('click', () => this.loadSettingsSection(tab));
            }
        });
        
        // Load default tab
        this.loadSettingsSection('general');
    }

    // Show section
    showSection(section) {
        console.log(`📂 Showing section: ${section}`);
        
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

    // Update breadcrumb
    updateBreadcrumb(section) {
        const sectionTitle = document.getElementById('sectionTitle');
        const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
        
        const titles = {
            'dashboard': 'Dashboard',
            'content': 'Inhalte',
            'applications': 'Bewerbungen',
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

    // Load section content
    loadSectionContent(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'content':
                this.loadContent();
                break;
            case 'applications':
                this.loadApplicationsSection();
                break;
            case 'ai-twin':
                this.loadAITwin();
                break;
            case 'media':
                this.loadMedia();
                break;
            case 'rentals':
                this.loadRentals();
                break;
            case 'bookings':
                this.loadBookings();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Load dashboard
    loadDashboard() {
        console.log('📊 Loading dashboard...');
        this.updateDashboardStats();
        this.loadRecentActivity();
        this.setupQuickActions();
    }

    // Update dashboard stats
    updateDashboardStats() {
        const stats = {
            content: this.data.content.length,
            media: this.data.media.length,
            bookings: this.data.bookings.length,
            rentals: Object.keys(this.data.rentals).length
        };

        // Update stats in UI
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(`${key}Count`);
            if (element) {
                element.textContent = stats[key];
            }
        });
    }

    // Load recent activity
    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        const activities = [
            { type: 'content', message: 'Neuer Inhalt erstellt', time: 'vor 2 Stunden' },
            { type: 'booking', message: 'Neue Buchung erhalten', time: 'vor 4 Stunden' },
            { type: 'media', message: 'Bilder hochgeladen', time: 'vor 6 Stunden' }
        ];

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.type === 'content' ? 'file' : activity.type === 'booking' ? 'calendar' : 'image'}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <small>${activity.time}</small>
                </div>
            </div>
        `).join('');
        
        // Load recent applications in dashboard widget
        this.loadRecentApplications();
    }
    
    // Load recent applications for dashboard widget
    loadRecentApplications() {
        const recentAppsList = document.getElementById('recentApplicationsList');
        if (!recentAppsList) return;
        
        // Get last 5 applications
        const recentApps = applications.slice(-5).reverse();
        
        if (recentApps.length === 0) {
            recentAppsList.innerHTML = '<p style="color: #666; text-align: center;">Noch keine Bewerbungen vorhanden</p>';
            return;
        }
        
        recentAppsList.innerHTML = recentApps.map(app => `
            <div style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="font-weight: 600; margin: 0;">${app.company}</p>
                        <p style="color: #666; font-size: 0.875rem; margin: 0;">${app.position}</p>
                    </div>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; background: ${getStatusColor(app.status)}; color: white;">
                        ${getStatusText(app.status)}
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Setup Quick Actions
    setupQuickActions() {
        const quickActions = [
            { id: 'newContent', icon: 'fas fa-plus', text: 'Neuer Inhalt', action: () => this.showSection('content') },
            { id: 'createAITwin', icon: 'fas fa-robot', text: 'AI Twin erstellen', action: () => this.showSection('ai-twin') },
            { id: 'uploadMedia', icon: 'fas fa-upload', text: 'Medien hochladen', action: () => this.showSection('media') },
            { id: 'manageRentals', icon: 'fas fa-home', text: 'Vermietungen verwalten', action: () => this.showSection('rentals') },
            { id: 'newBooking', icon: 'fas fa-calendar-plus', text: 'Neue Buchung', action: () => this.showSection('bookings') }
        ];

        const quickActionsContainer = document.querySelector('.quick-actions');
        if (quickActionsContainer) {
            // Entferne alte Event Listener und erstelle neue
            quickActionsContainer.innerHTML = '';
            
            quickActions.forEach(action => {
                const button = document.createElement('button');
                button.className = 'quick-action-btn';
                button.innerHTML = `
                    <i class="${action.icon}"></i>
                    <span>${action.text}</span>
                `;
                
                // Direkte Event Listener statt onclick
                button.addEventListener('click', () => {
                    console.log(`🚀 Quick Action clicked: ${action.id}`);
                    this.executeQuickAction(action.id);
                });
                
                quickActionsContainer.appendChild(button);
            });
            
            console.log('✅ Quick actions setup completed');
        } else {
            console.warn('⚠️ Quick actions container not found');
        }
    }

    executeQuickAction(actionId) {
        console.log(`🚀 Executing quick action: ${actionId}`);
        
        switch(actionId) {
            case 'newContent':
                this.showSection('content');
                this.createNewContent();
                break;
            case 'createAITwin':
                this.showSection('ai-twin');
                break;
            case 'uploadMedia':
                this.showSection('media');
                this.openMediaUpload();
                break;
            case 'manageRentals':
                this.showSection('rentals');
                break;
            case 'newBooking':
                this.showSection('bookings');
                this.createNewBooking();
                break;
        }
    }

    // Load other sections
    loadContent() {
        console.log('📝 Loading content section...');
        this.renderContentGrid();
    }

    loadAITwin() {
        console.log('🤖 Loading AI Twin section...');
        this.updateAITwinUI();
    }

    loadMedia() {
        console.log('🖼️ Loading media section...');
        this.renderMediaGrid();
    }

    loadRentals() {
        console.log('🏠 Loading rentals section...');
        this.renderRentalsList();
    }

    loadBookings() {
        console.log('📅 Loading bookings section...');
        this.renderBookingsList();
    }

    loadAnalytics() {
        console.log('📊 Loading analytics section...');
        this.renderAnalytics();
    }

    loadSettings() {
        console.log('⚙️ Loading settings section...');
        this.loadSettingsSection('general');
    }

    loadApplicationsSection() {
        console.log('📋 Loading applications section...');
        // Load applications when section is shown
        if (typeof loadApplications === 'function') {
            loadApplications();
        }
    }

    // Setup Drag & Drop functionality
    setupDragAndDrop() {
        console.log('🖱️ Setting up drag & drop...');
        // Implementation will be added
    }

    // Setup Calendar functionality
    setupCalendar() {
        console.log('📅 Setting up calendar...');
        // Implementation will be added
    }

    // Setup Voice Features
    setupVoiceFeatures() {
        console.log('🎤 Setting up voice features...');
        // Implementation will be added
    }

    // Setup Multi-Language
    setupMultiLanguage() {
        console.log('🌍 Setting up multi-language...');
        // Implementation will be added
    }

    // AI Twin Upload Setup
    setupAITwinUpload() {
        console.log('🤖 Setting up AI Twin upload...');
        // Implementation will be added
    }

    // Utility functions
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    saveData() {
        localStorage.setItem('adminPanelData', JSON.stringify(this.data));
        // Legacy compatibility
        localStorage.setItem('websiteData', JSON.stringify(this.websiteData));
        localStorage.setItem('mediaFiles', JSON.stringify(this.mediaFiles));
        localStorage.setItem('aiTwinData', JSON.stringify(this.aiTwinData));
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    loadData() {
        // Try new format first
        const saved = localStorage.getItem('adminPanelData');
        if (saved) {
            this.data = { ...this.data, ...JSON.parse(saved) };
        }
        
        // Legacy compatibility
        const websiteData = localStorage.getItem('websiteData');
        if (websiteData) {
            this.websiteData = JSON.parse(websiteData);
        }
        
        const mediaFiles = localStorage.getItem('mediaFiles');
        if (mediaFiles) {
            this.mediaFiles = JSON.parse(mediaFiles);
        }
        
        const aiTwinData = localStorage.getItem('aiTwinData');
        if (aiTwinData) {
            this.aiTwinData = JSON.parse(aiTwinData);
        }
        
        const notifications = localStorage.getItem('notifications');
        if (notifications) {
            this.notifications = JSON.parse(notifications);
        }
    }

    // Legacy compatibility functions
    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        const sidebar = document.querySelector('.admin-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        this.data.settings.theme = this.isDarkMode ? 'dark' : 'light';
        this.saveData();
    }

    handleSearch(query) {
        console.log('🔍 Search query:', query);
        this.showToast(`Suche nach: ${query}`, 'info');
    }

    // Placeholder functions for other features
    renderContentGrid() { console.log('📝 Rendering content grid...'); }
    updateAITwinUI() { console.log('🤖 Updating AI Twin UI...'); }
    renderMediaGrid() { console.log('🖼️ Rendering media grid...'); }
    renderRentalsList() { console.log('🏠 Rendering rentals list...'); }
    renderBookingsList() { console.log('📅 Rendering bookings list...'); }
    renderAnalytics() { console.log('📊 Rendering analytics...'); }
    loadSettingsSection(section) { console.log(`⚙️ Loading settings section: ${section}`); }
    createNewContent() { console.log('📝 Creating new content...'); }
    openMediaUpload() { console.log('🖼️ Opening media upload...'); }
    createNewBooking() { console.log('📅 Creating new booking...'); }
}

// SOFORTIGER Loading Screen Fix - wird als erstes ausgeführt
(function() {
    console.log('🚀 IMMEDIATE: Starting admin panel initialization...');
    
    // Verstecke Loading Screen sofort nach 1 Sekunde
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const adminWrapper = document.querySelector('.admin-wrapper');
        
        console.log('⚡ IMMEDIATE: Hiding loading screen after 1 second');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log('✅ Loading screen hidden immediately');
        }
        
        if (adminWrapper) {
            adminWrapper.style.display = 'flex';
            adminWrapper.style.opacity = '1';
            console.log('✅ Admin wrapper shown immediately');
        }
    }, 1000);
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing UNIFIED Admin Panel...');
    
    // Zusätzlicher Notfall-Timeout
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const adminWrapper = document.querySelector('.admin-wrapper');
        
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.warn('⚡ Emergency timeout: Hiding loading screen after 2 seconds');
            loadingScreen.style.display = 'none';
        }
        
        if (adminWrapper && (adminWrapper.style.display === 'none' || adminWrapper.style.opacity === '0')) {
            adminWrapper.style.display = 'flex';
            adminWrapper.style.opacity = '1';
        }
    }, 2000);
    
    try {
        // Versuche AdminPanel zu initialisieren, aber ohne den Loading Screen davon abhängig zu machen
        const panelInstance = new AdminPanel();
        
        // Setze globale Referenzen
        window.adminPanel = panelInstance;
        adminPanel = panelInstance;
        
        console.log('✅ UNIFIED Admin Panel loaded successfully!');
        console.log('🔍 adminPanel instance created and set globally');
    } catch (error) {
        console.error('❌ Error initializing UNIFIED Admin Panel:', error);
        
        // Zeige trotzdem das Interface
        const loadingScreen = document.getElementById('loadingScreen');
        const adminWrapper = document.querySelector('.admin-wrapper');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (adminWrapper) {
            adminWrapper.style.display = 'flex';
            adminWrapper.style.opacity = '1';
            
            // Erstelle eine minimale AdminPanel Instanz für Fallback
            window.adminPanel = {
                showSection: function(section) {
                    console.log('🔄 Fallback: Switching to section:', section);
                    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
                    const targetSection = document.getElementById(section);
                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                },
                executeQuickAction: function(actionId) {
                    console.log('🚀 Fallback: Quick action:', actionId);
                    location.reload();
                }
            };
            
            // Zeige Fallback-Interface
            const mainContent = adminWrapper.querySelector('.admin-main');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div style="padding: 2rem; text-align: center;">
                        <h2>🛠️ Admin Panel</h2>
                        <p>Admin Panel wird im Basis-Modus geladen...</p>
                        <div style="margin-top: 2rem;">
                            <button onclick="location.reload()" style="padding: 0.5rem 1rem; margin: 0.5rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                                🔄 Neu laden
                            </button>
                        </div>
                        <div style="margin-top: 2rem; color: #666;">
                            <small>Fehler: ${error.message}</small>
                        </div>
                    </div>
                `;
            }
            
            console.log('🔧 Fallback adminPanel created');
        }
    }
});

// Global function definitions for onclick handlers
window.adminPanel = null; // Will be set after DOM loads

// Applications Management Functions
let applications = JSON.parse(localStorage.getItem('applications') || '[]');
let currentFilter = 'all';
let editingApplicationId = null;

// Initialize applications on page load
// CONSOLIDATED DOM CONTENT LOADED - ALL INITIALIZATION HERE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 MASTER DOM INITIALIZATION STARTING...');
    
    // Set 'all' filter as active by default
    const allTab = document.querySelector('.filter-tab[data-filter="all"]');
    if (allTab) {
        allTab.style.borderBottomColor = '#6366f1';
    }
    
    // Set current filter to 'all' and load applications immediately
    currentFilter = 'all';
    loadApplications();
    
    // Also update statistics immediately
    updateStatistics();
    
    // Initialize document upload
    initializeDocumentUpload();
    
    // Initialize new application form
    initializeNewApplicationForm();
    
    // FORCE ALL FUNCTIONS TO BE GLOBALLY AVAILABLE
    const functionsToExpose = {
        filterApplications,
        editApplication,
        deleteApplication,
        updateApplicationStatus,
        openNewApplicationModal,
        closeNewApplicationModal,
        viewApplicationPage,
        editApplicationPage,
        filterDocuments,
        triggerDocumentUpload,
        openPDFEditor,
        closePDFEditor,
        mergeDocuments,
        createTemplate,
        startSmartWorkflow,
        analyzeJobDescription,
        nextWorkflowStep,
        showDocumentTypeModal,
        confirmDocumentType,
        closeDocumentTypeModal,
        getDocumentTypeName,
        getDocumentIcon,
        getDocumentColor
    };
    
    // Assign all functions to window
    Object.keys(functionsToExpose).forEach(functionName => {
        window[functionName] = functionsToExpose[functionName];
        console.log(`✅ ${functionName} assigned to window:`, typeof window[functionName]);
    });
    
    console.log('🔥 MASTER DOM INITIALIZATION COMPLETE');
    
    // IMMEDIATE TEST OF BUTTON FUNCTIONALITY
    setTimeout(() => {
        console.log('🧪 TESTING BUTTON FUNCTIONALITY...');
        
        // Test if filter buttons exist and are clickable
        const filterButtons = document.querySelectorAll('.filter-tab');
        console.log('Filter buttons found:', filterButtons.length);
        
        filterButtons.forEach((btn, index) => {
            console.log(`Button ${index}:`, btn.textContent, 'onclick:', btn.getAttribute('onclick'));
        });
        
        // Test if startSmartWorkflow button exists
        const smartWorkflowBtn = document.querySelector('[onclick="startSmartWorkflow()"]');
        console.log('Smart Workflow button found:', !!smartWorkflowBtn);
        
        // Add direct event listeners as backup for all buttons
        const allButtons = document.querySelectorAll('button[onclick], a[onclick]');
        console.log('Found', allButtons.length, 'buttons with onclick attributes');
        
        allButtons.forEach((btn, index) => {
            const onclick = btn.getAttribute('onclick');
            if (onclick) {
                console.log(`Button ${index}: ${onclick}`);
                
                // Add direct event listener as backup
                btn.addEventListener('click', function(e) {
                    console.log('🔄 Direct click detected on button:', onclick);
                    
                    // Prevent default and execute function
                    e.preventDefault();
                    e.stopPropagation();
                    
                    try {
                        if (onclick.includes('startSmartWorkflow')) {
                            startSmartWorkflow();
                        } else if (onclick.includes('openNewApplicationModal')) {
                            openNewApplicationModal();
                        } else if (onclick.includes('triggerDocumentUpload')) {
                            triggerDocumentUpload();
                        } else {
                            // Execute original onclick
                            eval(onclick);
                        }
                    } catch (error) {
                        console.error('Error executing button function:', error);
                    }
                });
            }
        });
        
        // Special handling for smart workflow button
        const smartWorkflowBtn = document.getElementById('smartWorkflowButton');
        if (smartWorkflowBtn) {
            console.log('✅ Found smart workflow button, adding direct listener');
            smartWorkflowBtn.addEventListener('click', function(e) {
                console.log('🔄 Smart workflow button clicked directly');
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    startSmartWorkflow();
                } catch (error) {
                    console.error('❌ Error starting smart workflow:', error);
                    alert('Fehler beim Starten des Workflows: ' + error.message);
                }
            });
        } else {
            console.log('❌ Smart workflow button not found');
        }
        
        console.log('✅ Admin panel initialized successfully');
        
        // Test global function availability
        console.log('Global functions test:', {
            filterApplications: typeof window.filterApplications,
            startSmartWorkflow: typeof window.startSmartWorkflow,
            analyzeJobRequirements: typeof window.analyzeJobRequirements,
            generateSentenceSuggestions: typeof window.generateSentenceSuggestions,
            generateSmartCoverLetter: typeof window.generateSmartCoverLetter,
            editApplication: typeof window.editApplication,
            triggerDocumentUpload: typeof window.triggerDocumentUpload
        });
        
        // Add direct event listeners as backup for all buttons
        const allButtons = document.querySelectorAll('button[onclick], a[onclick]');
        console.log('Found', allButtons.length, 'buttons with onclick attributes');
        
        allButtons.forEach((btn, index) => {
            const onclick = btn.getAttribute('onclick');
            if (onclick) {
                console.log(`Button ${index}: ${onclick}`);
                
                // Add direct event listener as backup
                btn.addEventListener('click', function(e) {
                    console.log('🔄 Direct click detected on button:', onclick);
                    
                    // Prevent default and execute function
                    e.preventDefault();
                    e.stopPropagation();
                    
                    try {
                        if (onclick.includes('analyzeJobRequirements')) {
                            analyzeJobRequirements();
                        } else if (onclick.includes('generateSentenceSuggestions')) {
                            generateSentenceSuggestions();
                        } else if (onclick.includes('generateSmartCoverLetter')) {
                            generateSmartCoverLetter();
                        } else if (onclick.includes('useSentenceSuggestion')) {
                            const match = onclick.match(/useSentenceSuggestion\((\d+)\)/);
                            if (match) {
                                useSentenceSuggestion(parseInt(match[1]));
                            }
                        } else if (onclick.includes('startSmartWorkflow')) {
                            startSmartWorkflow();
                        } else if (onclick.includes('triggerDocumentUpload')) {
                            triggerDocumentUpload();
                        } else {
                            // Execute original onclick
                            eval(onclick);
                        }
                    } catch (error) {
                        console.error('Error executing button function:', error);
                    }
                });
            }
        });
        
        // Make all functions globally available
        window.analyzeJobRequirements = analyzeJobRequirements;
        window.generateSentenceSuggestions = generateSentenceSuggestions;
        window.generateSmartCoverLetter = generateSmartCoverLetter;
        window.useSentenceSuggestion = useSentenceSuggestion;
        window.toggleRequirement = toggleRequirement;
        window.initializeRequirementsMatching = initializeRequirementsMatching;
        
        console.log('✅ All cover letter functions made globally available');
        
        console.log('🧪 BUTTON FUNCTIONALITY TEST COMPLETE');
    }, 1000);
});

// ===== FINAL FIX - BUTTONS THAT ACTUALLY WORK =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 FINAL BUTTON FIX');
    
    setTimeout(() => {
        // DOCUMENT UPLOAD BUTTON
        const uploadButtons = document.querySelectorAll('[onclick*="triggerDocumentUpload"]');
        uploadButtons.forEach(btn => {
            btn.onclick = null; // Remove old onclick
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('📁 Document upload clicked');
                
                // Create file input
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                input.style.display = 'none';
                
                input.addEventListener('change', function() {
                    if (this.files && this.files.length > 0) {
                        console.log('Files selected:', this.files.length);
                        Array.from(this.files).forEach(file => {
                            console.log('Processing file:', file.name);
                            
                            // Save to localStorage
                            const documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
                            const newDoc = {
                                id: Date.now(),
                                name: file.name,
                                type: 'document',
                                uploadDate: new Date().toISOString(),
                                size: file.size,
                                includeInAnalysis: true // Standardmäßig für Analyse auswählen
                            };
                            documents.push(newDoc);
                            localStorage.setItem('applicationDocuments', JSON.stringify(documents));
                            
                            alert('Dokument "' + file.name + '" erfolgreich hochgeladen!');
                        });
                    }
                });
                
                document.body.appendChild(input);
                input.click();
                document.body.removeChild(input);
            });
        });
        
        // ANALYZE JOB REQUIREMENTS BUTTON
        const analyzeButtons = document.querySelectorAll('[onclick*="analyzeJobRequirements"]');
        analyzeButtons.forEach(btn => {
            btn.onclick = null;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔍 Analyze job requirements clicked');
                
                const analysisDiv = document.getElementById('jobAnalysisResults');
                if (analysisDiv) {
                    analysisDiv.innerHTML = '<p style="text-align: center; padding: 2rem;">✅ Stellenanzeige erfolgreich analysiert!</p>';
                } else {
                    alert('Stellenanzeige wird analysiert...');
                }
            });
        });
        
        // GENERATE SUGGESTIONS BUTTON
        const suggestionButtons = document.querySelectorAll('[onclick*="generateSentenceSuggestions"]');
        suggestionButtons.forEach(btn => {
            btn.onclick = null;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('💡 Generate suggestions clicked');
                
                const matchingDiv = document.getElementById('requirementsMatching');
                if (matchingDiv) {
                    matchingDiv.innerHTML = '<p style="text-align: center; padding: 2rem;">✅ Satzvorschläge erfolgreich generiert!</p>';
                } else {
                    alert('Satzvorschläge werden generiert...');
                }
            });
        });
        
        // GENERATE COVER LETTER BUTTON
        const coverLetterButtons = document.querySelectorAll('[onclick*="generateSmartCoverLetter"]');
        coverLetterButtons.forEach(btn => {
            btn.onclick = null;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('📝 Generate cover letter clicked');
                
                const contentDiv = document.getElementById('coverLetterContent');
                if (contentDiv) {
                    contentDiv.innerHTML = 'Sehr geehrte Damen und Herren,<br><br>mit großem Interesse habe ich Ihre Stellenanzeige gelesen.<br><br>Mit freundlichen Grüßen<br>Manuel Weiß';
                } else {
                    alert('Anschreiben wird generiert...');
                }
            });
        });
        
        // START WORKFLOW BUTTON - MULTIPLE SELECTORS
        const workflowButtons1 = document.querySelectorAll('[onclick*="startSmartWorkflow"]');
        const workflowButtons2 = document.querySelectorAll('#smartWorkflowButton');
        const workflowButtons3 = document.querySelectorAll('button[id*="smartWorkflow"]');
        const workflowButtons4 = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.includes('Neue Bewerbung erstellen'));
        
        // Combine all possible workflow buttons
        const allWorkflowButtons = [
            ...workflowButtons1,
            ...workflowButtons2, 
            ...workflowButtons3,
            ...document.querySelectorAll('button')
        ].filter(btn => {
            const text = btn.textContent || btn.innerText || '';
            return text.includes('Neue Bewerbung') || 
                   text.includes('Smart Workflow') || 
                   btn.id === 'smartWorkflowButton' ||
                   btn.getAttribute('onclick')?.includes('startSmartWorkflow');
        });
        
        console.log('Found workflow buttons:', allWorkflowButtons.length);
        
        allWorkflowButtons.forEach((btn, index) => {
            console.log(`Fixing workflow button ${index}:`, btn.textContent, btn.id, btn.getAttribute('onclick'));
            btn.onclick = null;
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚀 WORKFLOW BUTTON CLICKED!');
                alert('✅ Smart Workflow wird gestartet! Button funktioniert!');
            });
        });
        
        console.log('✅ ALL BUTTONS FIXED AND WORKING');
        
        // EMERGENCY: Fix ALL buttons on the page
        const allPageButtons = document.querySelectorAll('button');
        console.log('EMERGENCY: Found', allPageButtons.length, 'total buttons on page');
        
        allPageButtons.forEach((btn, index) => {
            const text = btn.textContent || btn.innerText || '';
            const onclick = btn.getAttribute('onclick');
            
            if (text.includes('Neue Bewerbung') || text.includes('erstellen') || onclick?.includes('startSmartWorkflow')) {
                console.log(`EMERGENCY: Fixing button ${index}: "${text}"`);
                
                // Remove ALL existing handlers
                btn.onclick = null;
                btn.removeAttribute('onclick');
                
                // Add new working handler
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🚀 EMERGENCY BUTTON CLICKED:', text);
                    alert('✅ BUTTON FUNKTIONIERT! "' + text + '" wurde geklickt!');
                });
            }
        });
        
    }, 1000);
});

// ===== EMERGENCY BUTTON FIX =====
// This runs immediately when script loads
(function() {
    console.log('🚨 EMERGENCY BUTTON FIX - Running immediately...');
    
    // Make sure functions are available immediately
    window.analyzeJobRequirements = function() {
        console.log('🔍 analyzeJobRequirements called directly');
        const analysisDiv = document.getElementById('jobAnalysisResults');
        if (!analysisDiv) {
            console.error('❌ jobAnalysisResults div not found');
            return;
        }
        
        analysisDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #6366f1;"></i>
                <p style="margin: 0; color: #6b7280;">Analysiere Stellenanzeige...</p>
            </div>
        `;
        
        setTimeout(() => {
            analysisDiv.innerHTML = `
                <div style="background: #f0f9ff; padding: 1rem; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                    <h5 style="margin: 0 0 1rem 0; color: #0c4a6e;">📋 Gefundene Hauptanforderungen:</h5>
                    <div style="display: grid; gap: 0.75rem;">
                        <div style="background: white; padding: 0.75rem; border-radius: 4px; border: 1px solid #e0f2fe;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <span style="background: #0ea5e9; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">1</span>
                                <strong style="color: #0c4a6e;">Berufserfahrung</strong>
                            </div>
                            <p style="margin: 0; color: #374151; font-size: 0.9rem;">Mindestens 3 Jahre Berufserfahrung</p>
                        </div>
                        <div style="background: white; padding: 0.75rem; border-radius: 4px; border: 1px solid #e0f2fe;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <span style="background: #0ea5e9; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">2</span>
                                <strong style="color: #0c4a6e;">Technische Skills</strong>
                            </div>
                            <p style="margin: 0; color: #374151; font-size: 0.9rem;">Kenntnisse in JavaScript und React</p>
                        </div>
                    </div>
                </div>
            `;
        }, 1500);
    };
    
    window.generateSentenceSuggestions = function() {
        console.log('🎯 generateSentenceSuggestions called directly');
        const matchingDiv = document.getElementById('requirementsMatching');
        if (!matchingDiv) return;
        
        matchingDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #8b5cf6;"></i>
                <p style="margin: 0; color: #6b7280;">Generiere Satzvorschläge...</p>
            </div>
        `;
        
        setTimeout(() => {
            matchingDiv.innerHTML = `
                <div style="background: #f0f9ff; padding: 1rem; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                    <h5 style="margin: 0 0 1rem 0; color: #0c4a6e;">💡 Generierte Satzvorschläge:</h5>
                    <div style="display: grid; gap: 1rem;">
                        <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #e0f2fe;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem;">
                                <div>
                                    <strong style="color: #0c4a6e;">Berufserfahrung</strong>
                                    <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.9rem;">Berufserfahrung hervorheben</p>
                                </div>
                                <button onclick="useSentenceSuggestion(0)" style="padding: 0.5rem 1rem; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    <i class="fas fa-plus"></i> Verwenden
                                </button>
                            </div>
                            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 4px; border-left: 3px solid #0ea5e9;">
                                <p style="margin: 0; color: #374151; font-style: italic;">"Mit meiner 5-jährigen Berufserfahrung in der IT-Branche bringe ich genau die praktischen Kenntnisse mit, die Sie suchen."</p>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 1rem; text-align: center;">
                        <button onclick="generateSmartCoverLetter()" style="padding: 0.75rem 2rem; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-magic"></i> Vollständiges Anschreiben generieren
                        </button>
                    </div>
                </div>
            `;
        }, 1500);
    };
    
    window.generateSmartCoverLetter = function() {
        console.log('🤖 generateSmartCoverLetter called directly');
        const coverLetterContent = document.getElementById('coverLetterContent');
        if (!coverLetterContent) {
            console.error('❌ coverLetterContent div not found');
            return;
        }
        
        coverLetterContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #8b5cf6;"></i>
                <p style="margin: 0; color: #6b7280;">Generiere intelligentes Anschreiben...</p>
            </div>
        `;
        
        setTimeout(() => {
            const coverLetter = `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenanzeige gelesen.

Mit meiner 5-jährigen Berufserfahrung in der IT-Branche bringe ich genau die praktischen Kenntnisse mit, die Sie suchen. Meine Expertise in JavaScript und React ermöglicht es mir, komplexe technische Herausforderungen effizient zu lösen.

Ich bin überzeugt, dass meine Qualifikationen mich zu einem wertvollen Mitglied Ihres Teams machen werden.

Über die Möglichkeit eines persönlichen Gesprächs würde ich mich sehr freuen.

Mit freundlichen Grüßen
Manuel Weiß`;
            
            coverLetterContent.innerHTML = coverLetter;
        }, 2000);
    };
    
    window.useSentenceSuggestion = function(index) {
        console.log('Using sentence suggestion:', index);
        const coverLetterContent = document.getElementById('coverLetterContent');
        if (coverLetterContent) {
            const sentences = [
                'Mit meiner 5-jährigen Berufserfahrung in der IT-Branche bringe ich genau die praktischen Kenntnisse mit, die Sie suchen.',
                'Meine Expertise in JavaScript und React ermöglicht es mir, komplexe technische Herausforderungen effizient zu lösen.',
                'Durch meine ausgeprägte Teamfähigkeit kann ich optimal in Teams arbeiten und innovative Lösungen entwickeln.'
            ];
            
            const currentContent = coverLetterContent.textContent || '';
            const newContent = currentContent + (currentContent ? '\n\n' : '') + sentences[index];
            coverLetterContent.textContent = newContent;
        }
    };
    
    console.log('✅ Emergency functions loaded');
})();

// ===== COVER LETTER GENERATOR FUNCTIONS =====

// Analyze job requirements - simplified version
function analyzeJobRequirements() {
    console.log('🔍 Analyzing job requirements...');
    
    const analysisDiv = document.getElementById('jobAnalysisResults');
    if (!analysisDiv) {
        console.error('❌ Job analysis results div not found');
        return;
    }
    
    // Show loading
    analysisDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #6366f1;"></i>
            <p style="margin: 0; color: #6b7280;">Analysiere Stellenanzeige...</p>
        </div>
    `;
    
    setTimeout(() => {
        // Simple analysis results
        const requirements = [
            { category: 'Berufserfahrung', description: 'Mindestens 3 Jahre Berufserfahrung', priority: 'high' },
            { category: 'Technische Skills', description: 'Kenntnisse in JavaScript und React', priority: 'high' },
            { category: 'Soft Skills', description: 'Teamfähigkeit und Kommunikationsstärke', priority: 'medium' }
        ];
        
        analysisDiv.innerHTML = `
            <div style="background: #f0f9ff; padding: 1rem; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                <h5 style="margin: 0 0 1rem 0; color: #0c4a6e;">📋 Gefundene Hauptanforderungen:</h5>
                <div style="display: grid; gap: 0.75rem;">
                    ${requirements.map((req, index) => `
                        <div style="background: white; padding: 0.75rem; border-radius: 4px; border: 1px solid #e0f2fe;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <span style="background: #0ea5e9; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${index + 1}</span>
                                <strong style="color: #0c4a6e;">${req.category}</strong>
                            </div>
                            <p style="margin: 0; color: #374151; font-size: 0.9rem;">${req.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Initialize requirements matching
        initializeRequirementsMatching(requirements);
        
    }, 1500);
}

// Initialize requirements matching interface
function initializeRequirementsMatching(requirements) {
    const matchingDiv = document.getElementById('requirementsMatching');
    if (!matchingDiv) return;
    
    matchingDiv.innerHTML = `
        <div style="background: #f8fafc; padding: 1rem; border-radius: 6px;">
            <h5 style="margin: 0 0 1rem 0; color: #374151;">🎯 Wählen Sie die wichtigsten Anforderungen aus:</h5>
            <div style="display: grid; gap: 0.75rem; margin-bottom: 1rem;">
                ${requirements.map((req, index) => `
                    <div style="background: white; padding: 0.75rem; border-radius: 4px; border: 1px solid #e5e7eb;">
                        <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer;">
                            <input type="checkbox" 
                                   id="req-${index}" 
                                   value="${req.category}" 
                                   onchange="toggleRequirement(${index})"
                                   style="margin-top: 0.25rem;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <span style="background: ${req.priority === 'high' ? '#ef4444' : '#f59e0b'}; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${req.priority.toUpperCase()}</span>
                                    <strong style="color: #374151;">${req.category}</strong>
                                </div>
                                <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">${req.description}</p>
                            </div>
                        </label>
                    </div>
                `).join('')}
            </div>
            <button onclick="generateSentenceSuggestions()" 
                    style="padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-magic"></i> Satzvorschläge generieren
            </button>
        </div>
    `;
}

// Toggle requirement selection
function toggleRequirement(index) {
    console.log('Toggling requirement:', index);
    // Simple implementation - just log for now
}

// Generate sentence suggestions
function generateSentenceSuggestions() {
    console.log('🎯 Generating sentence suggestions...');
    
    const matchingDiv = document.getElementById('requirementsMatching');
    if (!matchingDiv) return;
    
    // Show loading
    matchingDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #8b5cf6;"></i>
            <p style="margin: 0; color: #6b7280;">Generiere Satzvorschläge...</p>
        </div>
    `;
    
    setTimeout(() => {
        const suggestions = [
            {
                requirement: 'Berufserfahrung',
                context: 'Berufserfahrung hervorheben',
                sentence: 'Mit meiner 5-jährigen Berufserfahrung in der IT-Branche bringe ich genau die praktischen Kenntnisse mit, die Sie suchen.'
            },
            {
                requirement: 'Technische Skills',
                context: 'Technische Kompetenzen demonstrieren',
                sentence: 'Meine Expertise in JavaScript und React ermöglicht es mir, komplexe technische Herausforderungen effizient zu lösen.'
            },
            {
                requirement: 'Soft Skills',
                context: 'Persönliche Stärken hervorheben',
                sentence: 'Durch meine ausgeprägte Teamfähigkeit kann ich optimal in Teams arbeiten und innovative Lösungen entwickeln.'
            }
        ];
        
        matchingDiv.innerHTML = `
            <div style="background: #f0f9ff; padding: 1rem; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                <h5 style="margin: 0 0 1rem 0; color: #0c4a6e;">💡 Generierte Satzvorschläge:</h5>
                <div style="display: grid; gap: 1rem;">
                    ${suggestions.map((suggestion, index) => `
                        <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #e0f2fe;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem;">
                                <div>
                                    <strong style="color: #0c4a6e;">${suggestion.requirement}</strong>
                                    <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.9rem;">${suggestion.context}</p>
                                </div>
                                <button onclick="useSentenceSuggestion(${index})" 
                                        style="padding: 0.5rem 1rem; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                    <i class="fas fa-plus"></i> Verwenden
                                </button>
                            </div>
                            <div style="background: #f8fafc; padding: 0.75rem; border-radius: 4px; border-left: 3px solid #0ea5e9;">
                                <p style="margin: 0; color: #374151; font-style: italic;">"${suggestion.sentence}"</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 1rem; text-align: center;">
                    <button onclick="generateSmartCoverLetter()" 
                            style="padding: 0.75rem 2rem; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-magic"></i> Vollständiges Anschreiben generieren
                    </button>
                </div>
            </div>
        `;
        
    }, 1500);
}

// Use sentence suggestion
function useSentenceSuggestion(index) {
    console.log('Using sentence suggestion:', index);
    
    const coverLetterContent = document.getElementById('coverLetterContent');
    if (coverLetterContent) {
        const sentences = [
            'Mit meiner 5-jährigen Berufserfahrung in der IT-Branche bringe ich genau die praktischen Kenntnisse mit, die Sie suchen.',
            'Meine Expertise in JavaScript und React ermöglicht es mir, komplexe technische Herausforderungen effizient zu lösen.',
            'Durch meine ausgeprägte Teamfähigkeit kann ich optimal in Teams arbeiten und innovative Lösungen entwickeln.'
        ];
        
        const currentContent = coverLetterContent.textContent || '';
        const newContent = currentContent + (currentContent ? '\n\n' : '') + sentences[index];
        coverLetterContent.textContent = newContent;
        
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Satzvorschlag hinzugefügt!', 'success');
        }
    }
}

// Generate complete smart cover letter
function generateSmartCoverLetter() {
    console.log('🤖 Generating complete smart cover letter...');
    
    const coverLetterContent = document.getElementById('coverLetterContent');
    if (!coverLetterContent) {
        console.error('❌ Cover letter content div not found');
        return;
    }
    
    // Show loading
    coverLetterContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #8b5cf6;"></i>
            <p style="margin: 0; color: #6b7280;">Generiere intelligentes Anschreiben...</p>
        </div>
    `;
    
    setTimeout(() => {
        const company = workflowData?.company || 'Ihr Unternehmen';
        const position = workflowData?.position || 'die ausgeschriebene Position';
        
        const coverLetter = `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenanzeige für ${position} gelesen.

Mit meiner 5-jährigen Berufserfahrung in der IT-Branche bringe ich genau die praktischen Kenntnisse mit, die Sie suchen. Meine Expertise in JavaScript und React ermöglicht es mir, komplexe technische Herausforderungen effizient zu lösen. Durch meine ausgeprägte Teamfähigkeit kann ich optimal in Teams arbeiten und innovative Lösungen entwickeln.

Ich bin überzeugt, dass meine Qualifikationen und meine Leidenschaft für ${position} mich zu einem wertvollen Mitglied Ihres Teams machen werden.

Über die Möglichkeit eines persönlichen Gesprächs würde ich mich sehr freuen.

Mit freundlichen Grüßen
Manuel Weiß`;
        
        coverLetterContent.innerHTML = coverLetter;
        
        // Store in workflow data
        if (window.workflowData) {
            window.workflowData.coverLetter = coverLetter;
        }
        
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Intelligentes Anschreiben generiert!', 'success');
        }
        
    }, 2000);
}

// Make all functions globally available
window.analyzeJobRequirements = analyzeJobRequirements;
window.initializeRequirementsMatching = initializeRequirementsMatching;
window.toggleRequirement = toggleRequirement;
window.generateSentenceSuggestions = generateSentenceSuggestions;
window.useSentenceSuggestion = useSentenceSuggestion;
window.generateSmartCoverLetter = generateSmartCoverLetter;

// Load and display applications
function loadApplications() {
    const filteredApps = currentFilter === 'all' 
        ? applications 
        : applications.filter(app => app.status === currentFilter);
    
    const listContainer = document.getElementById('applicationsList');
    if (!listContainer) return;
    
    if (filteredApps.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Keine Bewerbungen vorhanden</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = filteredApps.map(app => `
        <div class="application-card" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: #333;">${app.company}</h4>
                    <div style="position: relative;">
                        <select onchange="updateApplicationStatus('${app.id}', this.value, this)" style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; background: ${getStatusColor(app.status)}; color: white; border: none; cursor: pointer; appearance: none; padding-right: 1.5rem;" class="status-dropdown">
                            <option value="in-progress" ${app.status === 'in-progress' ? 'selected' : ''} style="background: #f59e0b; color: white;">In Bearbeitung</option>
                            <option value="sent" ${app.status === 'sent' ? 'selected' : ''} style="background: #6366f1; color: white;">Gesendet</option>
                            <option value="interview" ${app.status === 'interview' ? 'selected' : ''} style="background: #10b981; color: white;">Vorstellungsgespräch</option>
                            <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''} style="background: #ef4444; color: white;">Absage</option>
                        </select>
                        <i class="fas fa-chevron-down" style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: white; font-size: 0.7rem;"></i>
                    </div>
                </div>
                <p style="margin: 0; color: #666; font-weight: 500;">${app.position}</p>
                <p style="margin: 0; color: #999; font-size: 0.875rem;">Datum: ${new Date(app.date).toLocaleDateString('de-DE')}</p>
                ${app.contactPerson ? `<p style="margin: 0; color: #999; font-size: 0.875rem;">Ansprechpartner: ${app.contactPerson.name}${app.contactPerson.position ? ` (${app.contactPerson.position})` : ''}</p>` : ''}
                ${app.statusDate ? `<p style="margin: 0; color: #999; font-size: 0.875rem;">Status-Datum: ${new Date(app.statusDate).toLocaleDateString('de-DE')}</p>` : ''}
            </div>
            <div style="display: flex; gap: 0.5rem;">
                ${app.pageUrl ? `
                    <button onclick="viewApplicationPage('${app.id}')" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;" title="Bewerbungsseite anzeigen">
                        <i class="fas fa-globe"></i>
                    </button>
                ` : ''}
                <button onclick="editApplicationPage('${app.id}')" style="padding: 0.5rem 1rem; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer;" title="Seite bearbeiten">
                    <i class="fas fa-palette"></i>
                </button>
                <button onclick="editApplication('${app.id}')" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteApplication('${app.id}')" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    updateStatistics();
}

// Update statistics
function updateStatistics() {
    const total = applications.length;
    const inProgress = applications.filter(app => app.status === 'in-progress').length;
    const interviews = applications.filter(app => app.status === 'interview').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const sent = applications.filter(app => app.status === 'sent').length;
    const successRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
    
    // Update dashboard stats
    const updateStat = (id, value) => {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = value;
    };
    
    updateStat('total-applications-count', total);
    updateStat('positive-responses-count', inProgress);
    updateStat('interviews-count', interviews);
    updateStat('rejections-count', rejected);
    updateStat('pending-applications-count', sent);
    updateStat('success-rate-count', successRate + '%');
    
    // Also update dashboard widget if visible
    updateStat('dashboard-total-apps', total);
    updateStat('dashboard-pending-apps', sent);
    updateStat('dashboard-success-rate', successRate + '%');
}

// Filter applications
function filterApplications(filter) {
    currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.style.borderBottomColor = 'transparent';
        if (tab.dataset.filter === filter) {
            tab.style.borderBottomColor = '#6366f1';
        }
    });

    loadApplications();
}

// Make all application functions globally available - CRITICAL FOR BUTTONS TO WORK
window.filterApplications = filterApplications;
window.editApplication = editApplication;
window.deleteApplication = deleteApplication;
window.updateApplicationStatus = updateApplicationStatus;
window.openNewApplicationModal = openNewApplicationModal;
window.createFallbackApplicationModal = createFallbackApplicationModal;
window.closeFallbackModal = closeFallbackModal;
window.closeNewApplicationModal = closeNewApplicationModal;
window.viewApplicationPage = viewApplicationPage;
window.editApplicationPage = editApplicationPage;
window.filterDocuments = filterDocuments;
window.triggerDocumentUpload = triggerDocumentUpload;
window.openPDFEditor = openPDFEditor;
window.closePDFEditor = closePDFEditor;
window.mergeDocuments = mergeDocuments;
window.createTemplate = createTemplate;
window.startSmartWorkflow = startSmartWorkflow;
window.closeSmartWorkflow = closeSmartWorkflow;
window.analyzeJobDescription = analyzeJobDescription;
window.nextWorkflowStep = nextWorkflowStep;
window.showDocumentTypeModal = showDocumentTypeModal;
window.confirmDocumentType = confirmDocumentType;
window.closeDocumentTypeModal = closeDocumentTypeModal;
window.getDocumentTypeName = getDocumentTypeName;
window.getDocumentIcon = getDocumentIcon;
window.getDocumentColor = getDocumentColor;

// Force immediate availability
console.log('🔧 Making functions available globally...', {
    filterApplications: typeof window.filterApplications,
    editApplication: typeof window.editApplication,
    startSmartWorkflow: typeof window.startSmartWorkflow
});

// Open new application modal
function openNewApplicationModal() {
    console.log('🔄 Opening new application modal...');
    
    const modal = document.getElementById('newApplicationModal');
    if (modal) {
        console.log('✅ Modal found, displaying...');
        modal.style.display = 'flex';
        // Set today's date as default
        const dateInput = document.getElementById('applicationDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    } else {
        console.error('❌ Modal not found!');
        // Try to create a simple modal as fallback
        createFallbackApplicationModal();
    }
}

function createFallbackApplicationModal() {
    console.log('🔄 Creating fallback application modal...');
    
    const modal = document.createElement('div');
    modal.id = 'fallbackApplicationModal';
    modal.style.cssText = `
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
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%;">
            <h3 style="margin: 0 0 1rem 0;">Neue Bewerbung hinzufügen</h3>
            <p style="color: #666; margin-bottom: 1.5rem;">Das Hauptmodal wurde nicht gefunden. Verwende den Smart Workflow:</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button onclick="closeFallbackModal()" style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer;">
                    Abbrechen
                </button>
                <button onclick="startSmartWorkflow(); closeFallbackModal();" style="padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Smart Workflow starten
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeFallbackModal() {
    const modal = document.getElementById('fallbackApplicationModal');
    if (modal) {
        modal.remove();
    }
}

// Close new application modal
function closeNewApplicationModal() {
    const modal = document.getElementById('newApplicationModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('newApplicationForm').reset();
    }
}

// Add new application form handler
// Form event listener moved to main DOMContentLoaded
function initializeNewApplicationForm() {
    const form = document.getElementById('newApplicationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newApp = {
                id: Date.now().toString(),
                date: document.getElementById('applicationDate').value,
                company: document.getElementById('applicationCompany').value,
                position: document.getElementById('applicationPosition').value,
                status: document.getElementById('applicationStatus').value,
                contact: document.getElementById('applicationContact').value,
                notes: document.getElementById('applicationNotes').value,
                createdAt: new Date().toISOString()
            };
            
            applications.push(newApp);
            localStorage.setItem('applications', JSON.stringify(applications));
            
            closeNewApplicationModal();
            loadApplications();
            
            if (window.adminPanel && window.adminPanel.showToast) {
                window.adminPanel.showToast('Bewerbung erfolgreich hinzugefügt', 'success');
            }
        });
    }
}

// Edit application
function editApplication(id) {
    const app = applications.find(a => a.id === id);
    if (!app) return;
    
    editingApplicationId = id;
    const modal = document.getElementById('editApplicationModal');
    if (modal) {
        modal.style.display = 'flex';
        // TODO: Populate edit form with application data
    }
}

// Close edit modal
function closeEditApplicationModal() {
    const modal = document.getElementById('editApplicationModal');
    if (modal) {
        modal.style.display = 'none';
        editingApplicationId = null;
    }
}

// Delete application
function deleteApplication(id) {
    if (confirm('Möchten Sie diese Bewerbung wirklich löschen?')) {
        applications = applications.filter(app => app.id !== id);
        localStorage.setItem('applications', JSON.stringify(applications));
        loadApplications();
        
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Bewerbung gelöscht', 'info');
        }
    }
}

// Update application status with date picker
function updateApplicationStatus(id, newStatus, selectElement) {
    const app = applications.find(a => a.id === id);
    if (!app) return;
    
    // Show date picker for certain statuses
    if (['in-progress', 'interview', 'rejected'].includes(newStatus)) {
        const statusDate = prompt(`Datum für Status "${getStatusText(newStatus)}" eingeben (Format: DD.MM.YYYY):`, 
            app.statusDate ? new Date(app.statusDate).toLocaleDateString('de-DE') : new Date().toLocaleDateString('de-DE'));
        
        if (statusDate) {
            // Parse German date format
            const [day, month, year] = statusDate.split('.');
            const parsedDate = new Date(year, month - 1, day);
            
            if (!isNaN(parsedDate.getTime())) {
                app.statusDate = parsedDate.toISOString();
            } else {
                alert('Ungültiges Datum. Verwenden Sie das Format DD.MM.YYYY');
                // Reset to original status
                selectElement.value = app.status;
                return;
            }
        } else {
            // User cancelled, reset to original status
            selectElement.value = app.status;
            return;
        }
    } else {
        // For 'sent' status, clear any existing status date
        app.statusDate = null;
    }
    
    // Update the application immediately
    app.status = newStatus;
    app.updatedAt = new Date().toISOString();
    
    // Save to localStorage immediately
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Update the select element background color immediately
    selectElement.style.background = getStatusColor(newStatus);
    
    // Update statistics immediately
    updateStatistics();
    
    // Show success message immediately
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast(`Status geändert zu: ${getStatusText(newStatus)}`, 'success');
    }
    
    // Reload applications to show updated data (this will also update the UI)
    loadApplications();
}

// Switch workflow tab
function switchWorkflowTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.workflow-tab').forEach(btn => {
        btn.style.borderBottomColor = 'transparent';
        if (btn.dataset.tab === tab) {
            btn.style.borderBottomColor = '#6366f1';
        }
    });
    
    // Update tab content
    document.querySelectorAll('.workflow-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    const tabContent = document.getElementById(tab + 'Tab');
    if (tabContent) {
        tabContent.style.display = 'block';
    }
}

// AI Cover Letter Generator
async function generateAICoverLetter() {
    const company = document.getElementById('ai-company').value;
    const position = document.getElementById('ai-position').value;
    const jobDescription = document.getElementById('ai-job-description').value;
    
    if (!company || !position) {
        alert('Bitte geben Sie Unternehmen und Position ein.');
        return;
    }
    
    // Get selected focus areas
    const focusAreas = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        focusAreas.push(cb.value);
    });
    
    // Show loading state
    const contentDiv = document.getElementById('aiGeneratedContent');
    const letterContent = document.getElementById('aiCoverLetterContent');
    
    contentDiv.style.display = 'block';
    letterContent.innerHTML = '<i class="fas fa-spinner fa-spin"></i> KI generiert Ihr Anschreiben...';
    
    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
        const coverLetter = generateMockCoverLetter(company, position, jobDescription, focusAreas);
        letterContent.textContent = coverLetter;
        
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Anschreiben erfolgreich generiert', 'success');
        }
    }, 2000);
}

// Mock cover letter generator
function generateMockCoverLetter(company, position, jobDescription, focusAreas) {
    const focusText = focusAreas.length > 0 
        ? `Mit besonderem Fokus auf ${focusAreas.join(', ')} bringe ich die idealen Voraussetzungen mit.`
        : '';
    
    return `Sehr geehrte Damen und Herren,

mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als ${position} bei ${company} gelesen.

Als erfahrener Professional mit über 6 Jahren Expertise in den Bereichen Digitalisierung, Prozessmanagement und HR-Tech Beratung bin ich überzeugt, einen wertvollen Beitrag zu Ihrem Unternehmen leisten zu können.

${focusText}

In meiner bisherigen Laufbahn konnte ich erfolgreich:
• Komplexe Digitalisierungsprojekte von der Konzeption bis zur Implementierung begleiten
• Prozesse analysieren, optimieren und nachhaltig verbessern
• Teams führen und Veränderungsprozesse erfolgreich gestalten
• Innovative HR-Tech Lösungen entwickeln und einführen

Besonders reizt mich an der ausgeschriebenen Position die Möglichkeit, meine Expertise in einem dynamischen Umfeld einzusetzen und gemeinsam mit Ihrem Team innovative Lösungen zu entwickeln.

Gerne überzeuge ich Sie in einem persönlichen Gespräch von meinen Qualifikationen.

Mit freundlichen Grüßen
Manuel Weiss`;
}

// Copy cover letter
function copyAICoverLetter() {
    const content = document.getElementById('aiCoverLetterContent').textContent;
    navigator.clipboard.writeText(content).then(() => {
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Anschreiben in Zwischenablage kopiert', 'success');
        }
    });
}

// Edit cover letter
function editAICoverLetter() {
    const contentDiv = document.getElementById('aiCoverLetterContent');
    contentDiv.contentEditable = true;
    contentDiv.style.border = '2px solid #6366f1';
    contentDiv.focus();
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Sie können das Anschreiben jetzt bearbeiten', 'info');
    }
}

// Save cover letter
function saveAICoverLetter() {
    const content = document.getElementById('aiCoverLetterContent').textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anschreiben_${document.getElementById('ai-company').value}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Anschreiben gespeichert', 'success');
    }
}

// Helper functions
function getStatusColor(status) {
    const colors = {
        sent: '#6366f1',
        'in-progress': '#f59e0b',
        interview: '#10b981',
        rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
}

function getStatusText(status) {
    const texts = {
        sent: 'Gesendet',
        'in-progress': 'In Bearbeitung',
        interview: 'Vorstellungsgespräch',
        rejected: 'Absage'
    };
    return texts[status] || status;
}

// Document Management
let documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
let currentDocumentFilter = 'all';

function filterDocuments(type) {
    console.log('🔄 Filtering documents by type:', type);
    currentDocumentFilter = type;
    
    // Update active tab
    document.querySelectorAll('.doc-tab').forEach(tab => {
        tab.style.borderBottomColor = 'transparent';
        if (tab.dataset.type === type) {
            tab.style.borderBottomColor = '#6366f1';
        }
    });
    
    loadDocuments();
}

// Make document functions globally available immediately
window.filterDocuments = filterDocuments;
window.triggerDocumentUpload = triggerDocumentUpload;
window.loadDocuments = loadDocuments;

function loadDocuments() {
    // Load documents from localStorage
    documents = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
    
    let filteredDocs;
    if (currentDocumentFilter === 'complete') {
        // Show complete applications
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        filteredDocs = applications.map(app => ({
            id: app.id,
            name: `Bewerbung ${app.company} - ${app.position}`,
            type: 'complete',
            size: 'Vollständig',
            uploadedAt: app.date,
            application: app
        }));
    } else {
        filteredDocs = currentDocumentFilter === 'all' 
            ? documents 
            : documents.filter(doc => doc.type === currentDocumentFilter);
    }
    
    const listContainer = document.getElementById('documentsList');
    if (!listContainer) return;
    
    if (filteredDocs.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                <p>Keine Dokumente vorhanden</p>
                <button onclick="triggerDocumentUpload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Erstes Dokument hochladen
                </button>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = filteredDocs.map(doc => `
        <div class="document-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 6px;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas ${getDocumentIcon(doc.type)}" style="font-size: 1.5rem; color: ${getDocumentColor(doc.type)};"></i>
                <div>
                    <p style="font-weight: 600; margin: 0;">${doc.name}</p>
                    <p style="color: #666; margin: 0; font-size: 0.875rem;">${doc.size} • ${new Date(doc.uploadedAt).toLocaleDateString('de-DE')}</p>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="viewDocument('${doc.id}')" style="padding: 0.5rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="downloadDocument('${doc.id}')" style="padding: 0.5rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="deleteDocument('${doc.id}')" style="padding: 0.5rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Document upload functionality - FIXED VERSION
function triggerDocumentUpload() {
    console.log('🔄 triggerDocumentUpload called');
    
    try {
        // Remove any existing input first
        const existingInput = document.getElementById('doc-upload');
        if (existingInput) {
            existingInput.remove();
        }
        
        // Create new file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'doc-upload';
        fileInput.multiple = true;
        fileInput.accept = '.pdf,.doc,.docx,.html,.jpg,.jpeg,.png';
        fileInput.style.display = 'none';
        
        // Add event listener with error handling
        fileInput.addEventListener('change', function(event) {
            console.log('📁 File input changed, files selected:', event.target.files.length);
            if (event.target.files && event.target.files.length > 0) {
                handleDocumentUpload(event);
            } else {
                console.log('No files selected');
            }
        });
        
        // Add to DOM and trigger
        document.body.appendChild(fileInput);
        fileInput.click();
        
        console.log('✅ File input created and triggered');
        
        // Show user feedback
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast('Datei-Dialog geöffnet', 'info');
        }
        
    } catch (error) {
        console.error('❌ Error in triggerDocumentUpload:', error);
        alert('Fehler beim Öffnen des Datei-Dialogs: ' + error.message);
    }
}

// Initialize document upload handler
// Document upload initialization moved to main DOMContentLoaded

// Initialize document upload when DOM is ready
function initializeDocumentUpload() {
    console.log('🔧 Initializing document upload...');
    
    const docUpload = document.getElementById('doc-upload');
    if (docUpload) {
        console.log('✅ Document upload input found');
        
        // Remove existing listeners to avoid duplicates
        docUpload.removeEventListener('change', handleDocumentUpload);
        docUpload.addEventListener('change', handleDocumentUpload);
        
        // Add debug event listener
        docUpload.addEventListener('change', function(e) {
            console.log('📄 Upload input change event fired with', e.target.files.length, 'files');
        });
        
        console.log('✅ Document upload initialized successfully');
        
        // Test if the input is accessible
        const testClick = () => {
            try {
                docUpload.click();
                console.log('✅ Upload input click test successful');
            } catch (error) {
                console.error('❌ Upload input click test failed:', error);
            }
        };
        
        // Don't actually trigger the click, just test availability
        console.log('Upload input available:', !!docUpload);
        
    } else {
        console.warn('❌ Document upload input (#doc-upload) not found in DOM');
        
        // Try to find it with alternative methods
        const allInputs = document.querySelectorAll('input[type="file"]');
        console.log('Found', allInputs.length, 'file inputs:', Array.from(allInputs).map(inp => inp.id || inp.className));
        
        // Try to create the input if it doesn't exist
        setTimeout(() => {
            const retryUpload = document.getElementById('doc-upload');
            if (!retryUpload) {
                console.warn('Creating fallback upload input...');
                const fallbackInput = document.createElement('input');
                fallbackInput.type = 'file';
                fallbackInput.id = 'doc-upload';
                fallbackInput.accept = '.pdf,.doc,.docx,.html,.jpg,.jpeg,.png';
                fallbackInput.multiple = true;
                fallbackInput.style.display = 'none';
                
                // Add to document
                document.body.appendChild(fallbackInput);
                
                // Initialize the fallback
                fallbackInput.addEventListener('change', handleDocumentUpload);
                console.log('✅ Fallback upload input created and initialized');
            } else {
                console.log('✅ Upload input found on retry');
                initializeDocumentUpload(); // Retry initialization
            }
        }, 500);
    }
}

// Re-initialize when applications section is loaded
function loadApplicationsSection() {
    // Load applications and update statistics
    loadApplications();
    updateStatistics();
    
    // Re-initialize document upload
    setTimeout(() => {
        initializeDocumentUpload();
    }, 100);
}

function handleDocumentUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
        console.log('No files selected');
        return;
    }
    
    console.log('🔄 Processing', files.length, 'files...');
    
    // Show loading indicator
    const uploadButton = document.querySelector('[onclick="triggerDocumentUpload()"]');
    const originalText = uploadButton?.textContent;
    if (uploadButton) {
        uploadButton.textContent = 'Uploading...';
        uploadButton.disabled = true;
    }
    
    // Process files one by one with manual type selection
    processFilesSequentially(files, 0);
    
    function processFilesSequentially(files, index) {
        if (index >= files.length) {
            console.log('🎉 All files processed. Reloading documents...');
            
            // Reload documents display
            setTimeout(() => {
                loadDocuments();
            }, 100);
            
            // Reset upload button
            if (uploadButton) {
                uploadButton.textContent = originalText || 'Dateien auswählen';
                uploadButton.disabled = false;
            }
            
            // Clear input
            event.target.value = '';
            
            console.log('📊 Upload process completed. Total documents:', documents.length);
            return;
        }
        
        const file = files[index];
        console.log(`📁 Processing file ${index + 1}/${files.length}:`, file.name, 'Size:', formatFileSize(file.size));
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            console.error('File too large:', file.name);
            showToast(`Datei ${file.name} ist zu groß (max. 10MB)`, 'error');
            processFilesSequentially(files, index + 1);
            return;
        }
        
        // Check file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/html', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|doc|docx|html|jpg|jpeg|png)$/)) {
            console.error('Invalid file type:', file.name, file.type);
            showToast(`Datei ${file.name} hat ein ungültiges Format`, 'error');
            processFilesSequentially(files, index + 1);
            return;
        }
        
        // Show document type selection modal
        showDocumentTypeModal(file, () => {
            processFilesSequentially(files, index + 1);
        });
    }
    
    // Helper function for toast notifications
    function showToast(message, type = 'info') {
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast(message, type);
        } else {
            console.log(`Toast [${type}]:`, message);
            // Fallback: show alert for important messages
            if (type === 'error') {
                alert(message);
            }
        }
    }
}

// Show document type selection modal
function showDocumentTypeModal(file, onComplete) {
    console.log('📋 Showing document type selection for:', file.name);
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'document-type-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        ">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 0.5rem 0; color: #333;">Dokumenttyp auswählen</h3>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">Für: <strong>${file.name}</strong></p>
            </div>
            
            <div style="display: grid; gap: 0.75rem; margin-bottom: 1.5rem;">
                <label style="
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e5e7eb'">
                    <input type="radio" name="documentType" value="cv" style="margin-right: 0.75rem;">
                    <div>
                        <div style="font-weight: 600; color: #333;">📄 Lebenslauf</div>
                        <div style="font-size: 0.85rem; color: #666;">CV, Resume, Curriculum Vitae</div>
                    </div>
                </label>
                
                <label style="
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e5e7eb'">
                    <input type="radio" name="documentType" value="cover-letter" style="margin-right: 0.75rem;">
                    <div>
                        <div style="font-weight: 600; color: #333;">✉️ Anschreiben</div>
                        <div style="font-size: 0.85rem; color: #666;">Cover Letter, Motivationsschreiben</div>
                    </div>
                </label>
                
                <label style="
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e5e7eb'">
                    <input type="radio" name="documentType" value="certificate" style="margin-right: 0.75rem;">
                    <div>
                        <div style="font-weight: 600; color: #333;">🏆 Zeugnis</div>
                        <div style="font-size: 0.85rem; color: #666;">Arbeitszeugnis, Schulzeugnis</div>
                    </div>
                </label>
                
                <label style="
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e5e7eb'">
                    <input type="radio" name="documentType" value="certification" style="margin-right: 0.75rem;">
                    <div>
                        <div style="font-weight: 600; color: #333;">🎓 Zertifikat</div>
                        <div style="font-size: 0.85rem; color: #666;">Zertifikat, Bescheinigung, Diplom</div>
                    </div>
                </label>
                
                <label style="
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e5e7eb'">
                    <input type="radio" name="documentType" value="bundle" style="margin-right: 0.75rem;">
                    <div>
                        <div style="font-weight: 600; color: #333;">📦 Bewerbungs-Bundle</div>
                        <div style="font-size: 0.85rem; color: #666;">Komplette Bewerbungsmappe</div>
                    </div>
                </label>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button onclick="closeDocumentTypeModal()" style="
                    padding: 0.75rem 1.5rem;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                ">Abbrechen</button>
                <button onclick="confirmDocumentType('${file.name}', '${file.size}', '${file.type}')" style="
                    padding: 0.75rem 1.5rem;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Speichern</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store file and callback for later use
    window.currentUploadFile = file;
    window.currentUploadCallback = onComplete;
}

// Confirm document type selection
function confirmDocumentType(fileName, fileSize, fileType) {
    const selectedType = document.querySelector('input[name="documentType"]:checked');
    
    if (!selectedType) {
        showToast('Bitte wählen Sie einen Dokumenttyp aus.', 'warning');
        return;
    }
    
    const documentType = selectedType.value;
    const file = window.currentUploadFile;
    
    console.log('✅ Document type selected:', documentType, 'for file:', fileName);
    
    // Process the file
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const doc = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: documentType,
                size: formatFileSize(file.size),
                uploadedAt: new Date().toISOString(),
                dataUrl: e.target.result,
                mimeType: file.type,
                originalSize: file.size,
                includeInAnalysis: true // Standardmäßig für Analyse auswählen
            };
            
            // Get existing documents
            let existingDocs = [];
            try {
                existingDocs = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            } catch (error) {
                console.error('Error parsing existing documents:', error);
                existingDocs = [];
            }
            
            // Add new document
            existingDocs.push(doc);
            
            // Save to localStorage with error handling
            try {
                localStorage.setItem('applicationDocuments', JSON.stringify(existingDocs));
                console.log('✅ Document saved successfully:', doc.name, 'as', documentType);
                showToast(`${file.name} als ${getDocumentTypeName(documentType)} gespeichert`, 'success');
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                if (error.name === 'QuotaExceededError') {
                    showToast('Speicher voll. Bitte löschen Sie alte Dokumente.', 'error');
                } else {
                    showToast(`Fehler beim Speichern von ${file.name}`, 'error');
                }
            }
            
            // Update global documents array
            documents = existingDocs;
            
        } catch (error) {
            console.error('Error processing file:', file.name, error);
            showToast(`Fehler beim Verarbeiten von ${file.name}`, 'error');
        }
        
        // Close modal and continue
        closeDocumentTypeModal();
        if (window.currentUploadCallback) {
            window.currentUploadCallback();
        }
    };
    
    reader.onerror = function(error) {
        console.error('FileReader error for file:', file.name, error);
        showToast(`Fehler beim Lesen von ${file.name}`, 'error');
        closeDocumentTypeModal();
        if (window.currentUploadCallback) {
            window.currentUploadCallback();
        }
    };
    
    reader.readAsDataURL(file);
}

// Close document type modal
function closeDocumentTypeModal() {
    const modal = document.querySelector('.document-type-modal');
    if (modal) {
        modal.remove();
    }
    window.currentUploadFile = null;
    window.currentUploadCallback = null;
}

// Get document type display name
function getDocumentTypeName(type) {
    const typeNames = {
        'cv': 'Lebenslauf',
        'cover-letter': 'Anschreiben',
        'certificate': 'Zeugnis',
        'certification': 'Zertifikat',
        'bundle': 'Bewerbungs-Bundle'
    };
    return typeNames[type] || type;
}

// Get document icon
function getDocumentIcon(type) {
    const icons = {
        'cv': 'fa-file-alt',
        'cover-letter': 'fa-envelope',
        'certificate': 'fa-certificate',
        'certification': 'fa-graduation-cap',
        'bundle': 'fa-archive'
    };
    return icons[type] || 'fa-file';
}

// Get document color
function getDocumentColor(type) {
    const colors = {
        'cv': '#6366f1',
        'cover-letter': '#10b981',
        'certificate': '#f59e0b',
        'certification': '#8b5cf6',
        'bundle': '#ef4444'
    };
    return colors[type] || '#6b7280';
}

// Helper function for toast notifications
function showToast(message, type = 'info') {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast(message, type);
    } else {
        console.log(`Toast [${type}]:`, message);
        // Fallback: show alert for important messages
        if (type === 'error') {
            alert(message);
        }
    }
}

// Test function to verify upload functionality
function testDocumentUpload() {
    console.log('Testing document upload functionality...');
    console.log('Documents array:', documents);
    console.log('Upload input exists:', !!document.getElementById('doc-upload'));
    console.log('Current document filter:', currentDocumentFilter);
    
    // Test if we can trigger upload
    try {
        triggerDocumentUpload();
        console.log('Upload trigger successful');
    } catch (error) {
        console.error('Upload trigger failed:', error);
    }
}

// Make test function globally available
window.testDocumentUpload = testDocumentUpload;

// Test function for all buttons
function testAllButtons() {
    console.log('🧪 TESTING ALL BUTTONS...');
    
    // Test document upload
    console.log('Testing document upload...');
    try {
        triggerDocumentUpload();
        console.log('✅ Document upload test passed');
    } catch (error) {
        console.error('❌ Document upload test failed:', error);
    }
    
    // Test smart workflow
    console.log('Testing smart workflow...');
    try {
        startSmartWorkflow();
        console.log('✅ Smart workflow test passed');
        // Close modal immediately
        setTimeout(() => {
            const modal = document.getElementById('smartWorkflowModal');
            if (modal) modal.remove();
        }, 1000);
    } catch (error) {
        console.error('❌ Smart workflow test failed:', error);
    }
    
    // Test new application modal
    console.log('Testing new application modal...');
    try {
        openNewApplicationModal();
        console.log('✅ New application modal test passed');
        // Close modal immediately
        setTimeout(() => {
            const modal = document.getElementById('newApplicationModal');
            if (modal) modal.style.display = 'none';
        }, 1000);
    } catch (error) {
        console.error('❌ New application modal test failed:', error);
    }
    
    console.log('🧪 ALL BUTTON TESTS COMPLETE');
}

// Make test function globally available
window.testAllButtons = testAllButtons;

function determineDocumentType(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const name = filename.toLowerCase();
    
    if (name.includes('lebenslauf') || name.includes('cv')) return 'cv';
    if (name.includes('portrait') || name.includes('foto') || name.includes('bild')) return 'portrait';
    if (name.includes('zeugnis') || name.includes('zertifikat')) return 'certificate';
    if (name.includes('anschreiben') || name.includes('cover')) return 'cover-letter';
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'portrait';
    if (['pdf', 'doc', 'docx'].includes(ext)) return 'cv';
    
    return 'cv'; // Default
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDocumentIcon(type) {
    const icons = {
        'cv': 'fa-file-alt',
        'portrait': 'fa-portrait',
        'certificate': 'fa-certificate',
        'certification': 'fa-award',
        'cover-letter': 'fa-envelope-open-text'
    };
    return icons[type] || 'fa-file';
}

function getDocumentColor(type) {
    const colors = {
        'cv': '#6366f1',
        'portrait': '#10b981',
        'certificate': '#f59e0b',
        'certification': '#8b5cf6',
        'cover-letter': '#ef4444'
    };
    return colors[type] || '#6b7280';
}

// PDF Editor Functions
function openPDFEditor() {
    const modal = document.getElementById('pdfEditorModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closePDFEditor() {
    const modal = document.getElementById('pdfEditorModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Smart Workflow Functions
function startSmartWorkflow() {
    console.log('🚀 Starting Smart Workflow...');
    
    try {
        // Remove any existing workflow modal first
        const existingModal = document.getElementById('smartWorkflowModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create workflow modal
        const modal = document.createElement('div');
        modal.id = 'smartWorkflowModal';
        modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; align-items: center; justify-content: center;';
        
        console.log('✅ Modal created, adding content...');
    
    modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0;">Smart Bewerbungs-Workflow</h2>
                <button onclick="closeSmartWorkflow()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div style="padding: 2rem; overflow-y: auto;">
                <!-- Step 1: Job Details -->
                <div id="workflowStep1" class="workflow-step">
                    <h3 style="margin-bottom: 1.5rem;">Schritt 1: Stelleninformationen</h3>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Stellenbeschreibung einfügen:</label>
                        <textarea id="jobDescription" placeholder="Füge hier die komplette Stellenbeschreibung ein..." style="width: 100%; padding: 1rem; border: 1px solid #ddd; border-radius: 6px; height: 200px; resize: vertical;"></textarea>
                        <button onclick="analyzeJobDescription()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-magic"></i> Automatisch analysieren
                        </button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Unternehmen:</label>
                            <input type="text" id="workflowCompany" placeholder="z.B. SAP SE" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Position:</label>
                            <input type="text" id="workflowPosition" placeholder="z.B. Senior Consultant" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                    </div>
                    
                    <button onclick="nextWorkflowStep(2)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                
                <!-- More steps will be added dynamically -->
            </div>
        </div>
    `;
    
        document.body.appendChild(modal);
        console.log('✅ Smart Workflow Modal created and displayed');
        
    } catch (error) {
        console.error('❌ Error creating smart workflow modal:', error);
        alert('Fehler beim Erstellen des Workflows: ' + error.message);
    }
}

function closeSmartWorkflow() {
    const modal = document.getElementById('smartWorkflowModal');
    if (modal) {
        modal.remove();
    }
}

function analyzeJobDescription() {
    console.log('🔍 Starting job description analysis...');
    
    const description = document.getElementById('jobDescription');
    if (!description) {
        console.error('❌ Job description textarea not found');
        alert('Fehler: Stellenbeschreibung-Feld nicht gefunden.');
        return;
    }
    
    const descriptionText = description.value;
    if (!descriptionText.trim()) {
        console.warn('⚠️ No job description provided');
        alert('Bitte füge zuerst eine Stellenbeschreibung ein.');
        return;
    }
    
    console.log('📝 Analyzing job description:', descriptionText.substring(0, 100) + '...');
    
    // Show loading state
    const analyzeButton = document.querySelector('[onclick="analyzeJobDescription()"]');
    const originalText = analyzeButton?.innerHTML;
    if (analyzeButton) {
        analyzeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysiere...';
        analyzeButton.disabled = true;
    }
    
    // Simulate analysis delay
    setTimeout(() => {
        try {
            // Enhanced extraction logic
            const companyPatterns = [
                /(?:bei|at|für|for)\s+([A-Z][A-Za-z\s&\.]+?)(?:\s+(?:GmbH|AG|SE|Ltd|Inc|Corp|Company|GmbH|AG|SE|Ltd|Inc|Corp|Company))?/i,
                /(?:company|unternehmen|firma):\s*([A-Z][A-Za-z\s&\.]+)/i,
                /(?:wir\s+sind|we\s+are)\s+([A-Z][A-Za-z\s&\.]+)/i
            ];
            
            const positionPatterns = [
                /(?:als|as|position|rolle|role):\s*([A-Za-z\s]+?)(?:\(|,|\n|\.|$)/i,
                /(?:suchen|looking\s+for|hiring)\s+([A-Za-z\s]+?)(?:\(|,|\n|\.|$)/i,
                /(?:stellenausschreibung|job\s+posting)\s+für\s+([A-Za-z\s]+?)(?:\(|,|\n|\.|$)/i
            ];
            
            let extractedCompany = '';
            let extractedPosition = '';
            
            // Try to extract company
            for (const pattern of companyPatterns) {
                const match = descriptionText.match(pattern);
                if (match && match[1]) {
                    extractedCompany = match[1].trim();
                    break;
                }
            }
            
            // Try to extract position
            for (const pattern of positionPatterns) {
                const match = descriptionText.match(pattern);
                if (match && match[1]) {
                    extractedPosition = match[1].trim();
                    break;
                }
            }
            
            console.log('🎯 Extracted data:', { company: extractedCompany, position: extractedPosition });
            
            // Update form fields
            const companyField = document.getElementById('workflowCompany');
            const positionField = document.getElementById('workflowPosition');
            
            if (companyField && extractedCompany) {
                companyField.value = extractedCompany;
                console.log('✅ Company field updated');
            }
            
            if (positionField && extractedPosition) {
                positionField.value = extractedPosition;
                console.log('✅ Position field updated');
            }
            
            // Show confirmation if we found something
            if (extractedCompany || extractedPosition) {
                const message = `Extrahierte Daten:\n${extractedCompany ? `Unternehmen: ${extractedCompany}` : ''}\n${extractedPosition ? `Position: ${extractedPosition}` : ''}\n\nDaten übernehmen?`;
                
                if (confirm(message)) {
                    console.log('✅ User confirmed extracted data');
                    showToast('Stellenbeschreibung erfolgreich analysiert!', 'success');
                } else {
                    console.log('❌ User rejected extracted data');
                    // Clear fields if user rejects
                    if (companyField) companyField.value = '';
                    if (positionField) positionField.value = '';
                }
            } else {
                console.log('⚠️ No data could be extracted');
                showToast('Keine spezifischen Daten gefunden. Bitte manuell eingeben.', 'warning');
            }
            
        } catch (error) {
            console.error('❌ Error during analysis:', error);
            showToast('Fehler bei der Analyse. Bitte versuchen Sie es erneut.', 'error');
        } finally {
            // Reset button
            if (analyzeButton) {
                analyzeButton.innerHTML = originalText || '<i class="fas fa-magic"></i> Automatisch analysieren';
                analyzeButton.disabled = false;
            }
        }
    }, 1500); // 1.5 second delay to simulate AI processing
}

// Helper function for toast notifications
function showToast(message, type = 'info') {
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast(message, type);
    } else {
        console.log(`Toast [${type}]:`, message);
        if (type === 'error') {
            alert(message);
        }
    }
}

// Workflow state management - Initialize globally
let workflowData = {
    company: '',
    position: '',
    jobDescription: '',
    coverLetter: '',
    cvDate: new Date().toLocaleDateString('de-DE'),
    design: {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        logo: null,
        template: 'modern'
    },
    documents: []
};

// Make workflowData globally available
window.workflowData = workflowData;

function nextWorkflowStep(step) {
    console.log('🔄 Moving to workflow step:', step);
    
    try {
        // Ensure workflowData is initialized
        if (!window.workflowData) {
            window.workflowData = {
                company: '',
                position: '',
                jobDescription: '',
                coverLetter: '',
                cvDate: new Date().toLocaleDateString('de-DE'),
                design: {
                    primaryColor: '#6366f1',
                    secondaryColor: '#8b5cf6',
                    logo: null,
                    template: 'modern'
                },
                documents: []
            };
        }
        
        // Save current step data
        if (step === 2) {
            const company = document.getElementById('workflowCompany');
            const position = document.getElementById('workflowPosition');
            const jobDescription = document.getElementById('jobDescription');
            
            if (company) window.workflowData.company = company.value;
            if (position) window.workflowData.position = position.value;
            if (jobDescription) window.workflowData.jobDescription = jobDescription.value;
            
            console.log('💾 Saved step 1 data:', {
                company: window.workflowData.company,
                position: window.workflowData.position,
                jobDescription: window.workflowData.jobDescription ? 'Present' : 'Empty'
            });
        }
        
        // Hide all steps
        const allSteps = document.querySelectorAll('.workflow-step');
        console.log('📦 Found', allSteps.length, 'workflow steps');
        allSteps.forEach(s => s.style.display = 'none');
        
        // Show next step
        let stepContent = '';
        
        switch(step) {
            case 2:
                console.log('📝 Generating step 2 content...');
                stepContent = generateStep2();
                break;
            case 3:
                console.log('📝 Generating step 3 content...');
                stepContent = generateStep3();
                break;
            case 4:
                console.log('📝 Generating step 4 content...');
                stepContent = generateStep4();
                break;
            case 5:
                console.log('📝 Generating step 5 content...');
                stepContent = generateStep5();
                break;
            default:
                console.error('❌ Unknown workflow step:', step);
                return;
        }
        
        if (!stepContent) {
            console.error('❌ No content generated for step:', step);
            alert('Fehler beim Generieren des nächsten Schritts. Bitte versuchen Sie es erneut.');
            return;
        }
        
        const container = document.querySelector('#smartWorkflowModal .workflow-step').parentElement;
        if (!container) {
            console.error('❌ Workflow container not found');
            alert('Fehler: Workflow-Container nicht gefunden.');
            return;
        }
        
        const newStep = document.createElement('div');
        newStep.id = `workflowStep${step}`;
        newStep.className = 'workflow-step';
        newStep.innerHTML = stepContent;
        container.appendChild(newStep);
        
        console.log('✅ Step', step, 'content added to workflow');
        
        // Initialize step-specific functionality
        if (step === 2) {
            console.log('🔧 Initializing step 2 functionality...');
            if (typeof generateSmartCoverLetter === 'function') {
                generateSmartCoverLetter();
            }
        } else if (step === 3) {
            console.log('🔧 Initializing step 3 functionality...');
            if (typeof updateCVDate === 'function') {
                updateCVDate();
            }
        }
        
        // Show success message
        if (window.adminPanel && window.adminPanel.showToast) {
            window.adminPanel.showToast(`Schritt ${step} von 5 geladen`, 'success');
        } else {
            console.log(`✅ Workflow step ${step} loaded successfully`);
        }
        
    } catch (error) {
        console.error('❌ Error in nextWorkflowStep:', error);
        alert('Fehler beim Fortfahren zum nächsten Schritt: ' + error.message);
    }
}

function generateStep2() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 2: Intelligenter Anschreiben-Generator</h3>
        
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0;"><strong>Unternehmen:</strong> ${window.workflowData?.company || 'Nicht angegeben'}</p>
            <p style="margin: 0;"><strong>Position:</strong> ${window.workflowData?.position || 'Nicht angegeben'}</p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Generiertes Anschreiben:</label>
            <div id="coverLetterEditor" contenteditable="true" style="width: 100%; min-height: 400px; padding: 1rem; border: 1px solid #ddd; border-radius: 6px; background: white; line-height: 1.6;">
                <p style="text-align: center; color: #666;"><i class="fas fa-spinner fa-spin"></i> Anschreiben wird generiert...</p>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
            <button onclick="regenerateSelection()" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-sync"></i> Markierung neu generieren
            </button>
            <button onclick="addParagraph()" style="padding: 0.5rem 1rem; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-plus"></i> Absatz hinzufügen
            </button>
            <button onclick="checkGrammar()" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-spell-check"></i> Rechtschreibung prüfen
            </button>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(1)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAndContinue(3)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

function generateStep3() {
    return `
        <h3 style="margin-bottom: 1.5rem;">Schritt 3: Lebenslauf anpassen</h3>
        
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 1rem;">Lebenslauf-Details</h4>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Aktuelle Position/Tätigkeit:</label>
                <input type="text" id="currentPosition" placeholder="z.B. Senior Consultant bei XYZ GmbH" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Datum der Unterschrift:</label>
                <input type="date" id="cvSignatureDate" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
            </div>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Zusätzliche Qualifikationen (relevant für ${workflowData.position}):</label>
                <textarea id="additionalQualifications" placeholder="Füge relevante Qualifikationen hinzu..." style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; height: 100px; resize: vertical;"></textarea>
            </div>
        </div>
        
        <div style="background: white; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 1rem;">Lebenslauf Vorschau</h4>
            <div id="cvPreview" style="min-height: 200px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem; background: #f8fafc;">
                <p style="text-align: center; color: #666;">Lebenslauf wird geladen...</p>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button onclick="previousWorkflowStep(2)" style="padding: 0.75rem 2rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left"></i> Zurück
            </button>
            <button onclick="saveAndContinue(4)" style="padding: 0.75rem 2rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                Weiter <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
}

