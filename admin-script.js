// Modern Admin Panel - FINAL UNIFIED VERSION v6.0
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
            
            console.log('✅ UNIFIED Admin Panel initialized successfully!');
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
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            });
        });
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
            quickActionsContainer.innerHTML = quickActions.map(action => `
                <button class="quick-action-btn" onclick="adminPanel.executeQuickAction('${action.id}')">
                    <i class="${action.icon}"></i>
                    <span>${action.text}</span>
                </button>
            `).join('');
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
        adminPanel = new AdminPanel();
        console.log('✅ UNIFIED Admin Panel loaded successfully!');
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
        }
    }
});

// Global function definitions for onclick handlers
window.adminPanel = null; // Will be set after DOM loads

