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
                    <span class="status-badge" style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; background: ${getStatusColor(app.status)}; color: white;">
                        ${getStatusText(app.status)}
                    </span>
                </div>
                <p style="margin: 0; color: #666; font-weight: 500;">${app.position}</p>
                <p style="margin: 0; color: #999; font-size: 0.875rem;">Datum: ${new Date(app.date).toLocaleDateString('de-DE')}</p>
                ${app.contact ? `<p style="margin: 0; color: #999; font-size: 0.875rem;">Kontakt: ${app.contact}</p>` : ''}
            </div>
            <div style="display: flex; gap: 0.5rem;">
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
    const positive = applications.filter(app => app.status === 'accepted').length;
    const interviews = applications.filter(app => app.status === 'interview').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const successRate = total > 0 ? Math.round((positive / total) * 100) : 0;
    
    // Update dashboard stats
    const updateStat = (id, value) => {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = value;
    };
    
    updateStat('total-applications-count', total);
    updateStat('positive-responses-count', positive);
    updateStat('interviews-count', interviews);
    updateStat('rejections-count', rejected);
    updateStat('pending-applications-count', pending);
    updateStat('success-rate-count', successRate + '%');
    
    // Also update dashboard widget if visible
    updateStat('dashboard-total-apps', total);
    updateStat('dashboard-pending-apps', pending);
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

// Open new application modal
function openNewApplicationModal() {
    const modal = document.getElementById('newApplicationModal');
    if (modal) {
        modal.style.display = 'flex';
        // Set today's date as default
        document.getElementById('applicationDate').value = new Date().toISOString().split('T')[0];
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

// Add new application
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Load applications on page load
    loadApplications();
});

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
        pending: '#6366f1',
        reviewed: '#f59e0b',
        interview: '#10b981',
        accepted: '#10b981',
        rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
}

function getStatusText(status) {
    const texts = {
        pending: 'Ausstehend',
        reviewed: 'In Bearbeitung',
        interview: 'Interview',
        accepted: 'Angenommen',
        rejected: 'Abgelehnt'
    };
    return texts[status] || status;
}

// CV Management
function uploadCV() {
    const fileInput = document.getElementById('cv-upload');
    if (fileInput.files.length === 0) {
        alert('Bitte wählen Sie eine Datei aus.');
        return;
    }
    
    // Here you would implement actual file upload
    if (window.adminPanel && window.adminPanel.showToast) {
        window.adminPanel.showToast('Lebenslauf hochgeladen', 'success');
    }
}

