/**
 * Admin Topbar Web Component
 * Wiederverwendbare Topbar-Komponente für das Admin Panel
 */
class AdminTopbar extends HTMLElement {
    constructor() {
        super();
        this.stateManager = null;
        this.notifications = [];
        this.darkMode = false;
    }
    
    /**
     * Component initialisieren
     */
    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.initializeState();
    }
    
    /**
     * Component rendern
     */
    render() {
        this.innerHTML = `
            <header class="admin-topbar">
                <div class="topbar-left">
                    <div class="breadcrumb">
                        <span id="breadcrumb-text">Dashboard</span>
                    </div>
                </div>
                
                <div class="topbar-right">
                    <div class="topbar-actions">
                        <button class="topbar-btn" data-action="toggle-dark-mode" title="Dark Mode">
                            <i class="fas fa-moon" id="darkModeIcon"></i>
                        </button>
                        <button class="topbar-btn" data-action="show-notifications" title="Benachrichtigungen">
                            <i class="fas fa-bell"></i>
                            <span class="notification-badge" id="notificationBadge">0</span>
                        </button>
                        <button class="topbar-btn" data-action="show-search" title="Suchen">
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="topbar-btn" data-action="show-help" title="Hilfe">
                            <i class="fas fa-question-circle"></i>
                        </button>
                    </div>
                    
                    <div class="topbar-user">
                        <div class="avatar avatar-small">
                            <span class="avatar-text">MW</span>
                        </div>
                        <span class="user-name">Manuel</span>
                        <div class="user-menu">
                            <button class="user-menu-toggle">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="user-menu-dropdown">
                                <a href="#profile" class="user-menu-item">
                                    <i class="fas fa-user"></i>
                                    Profil
                                </a>
                                <a href="#settings" class="user-menu-item">
                                    <i class="fas fa-cog"></i>
                                    Einstellungen
                                </a>
                                <div class="user-menu-divider"></div>
                                <a href="#logout" class="user-menu-item">
                                    <i class="fas fa-sign-out-alt"></i>
                                    Abmelden
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- Notifications Dropdown -->
            <div class="notifications-dropdown" id="notificationsDropdown">
                <div class="notifications-header">
                    <h3>Benachrichtigungen</h3>
                    <button class="clear-all-btn" data-action="clear-all-notifications">
                        Alle löschen
                    </button>
                </div>
                <div class="notifications-list" id="notificationsList">
                    <div class="notification-empty">
                        <i class="fas fa-bell-slash"></i>
                        <p>Keine Benachrichtigungen</p>
                    </div>
                </div>
            </div>
            
            <!-- Search Modal -->
            <div class="search-modal" id="searchModal">
                <div class="search-content">
                    <div class="search-header">
                        <input type="text" id="searchInput" placeholder="Suchen..." autocomplete="off">
                        <button class="search-close" data-action="close-search">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="search-results" id="searchResults">
                        <div class="search-empty">
                            <i class="fas fa-search"></i>
                            <p>Geben Sie einen Suchbegriff ein</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Action Buttons
        this.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });
        
        // User Menu
        const userMenuToggle = this.querySelector('.user-menu-toggle');
        const userMenu = this.querySelector('.user-menu-dropdown');
        
        if (userMenuToggle && userMenu) {
            userMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserMenu();
            });
        }
        
        // User Menu Items (especially logout)
        this.querySelectorAll('.user-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const href = item.getAttribute('href');
                if (href === '#logout') {
                    e.preventDefault();
                    e.stopPropagation();
                    // Logout Handler - Use Admin Auth System
                    if (window.adminAuth && typeof window.adminAuth.logout === 'function') {
                        console.log('🔐 Logging out via Admin Auth System...');
                        window.adminAuth.logout();
                    } else {
                        // Fallback: Clear session and redirect to login
                        console.warn('⚠️ Admin Auth System not available, using fallback logout');
                        localStorage.removeItem('admin_auth_session');
                        localStorage.removeItem('admin_user_data');
                        window.location.href = '/admin-login.html';
                    }
                    this.toggleUserMenu();
                } else if (href === '#profile') {
                    e.preventDefault();
                    this.navigateToSection('profile');
                    this.toggleUserMenu();
                } else if (href === '#settings') {
                    e.preventDefault();
                    this.navigateToSection('settings');
                    this.toggleUserMenu();
                }
            });
        });
        
        // Notifications
        const notificationsBtn = this.querySelector('[data-action="show-notifications"]');
        const notificationsDropdown = this.querySelector('#notificationsDropdown');
        
        if (notificationsBtn && notificationsDropdown) {
            notificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotifications();
            });
        }
        
        // Search
        const searchBtn = this.querySelector('[data-action="show-search"]');
        const searchModal = this.querySelector('#searchModal');
        
        if (searchBtn && searchModal) {
            searchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showSearch();
            });
        }
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                this.closeAllDropdowns();
            }
        });
        
        // Search Input
        const searchInput = this.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideSearch();
                }
            });
        }
    }
    
    /**
     * State initialisieren
     */
    initializeState() {
        // State Manager verbinden
        if (window.AdminApp && window.AdminApp.stateManager) {
            this.stateManager = window.AdminApp.stateManager;
            
            // State Changes abonnieren
            this.stateManager.subscribe('currentSection', (sectionId) => {
                this.updateBreadcrumb(sectionId);
            });
            
            this.stateManager.subscribe('notifications', (notifications) => {
                this.updateNotifications(notifications);
            });
        }
        
        // Dark Mode aus LocalStorage laden - Cookie-sichere Version
        try {
            this.darkMode = localStorage.getItem('darkMode') === 'true';
            this.updateDarkMode();
        } catch (error) {
            console.warn('Dark mode setting not available due to storage issues:', error);
            this.darkMode = false;
        }
        
        // Initial Notifications laden
        this.updateNotifications(this.stateManager?.getState('notifications') || []);
        
        // Update user info from auth system after a short delay (to ensure auth is initialized)
        setTimeout(() => {
            this.updateUserInfo();
        }, 500);
    }
    
    /**
     * Action Handler
     */
    handleAction(action) {
        switch (action) {
            case 'toggle-dark-mode':
                this.toggleDarkMode();
                break;
            case 'show-notifications':
                this.toggleNotifications();
                break;
            case 'show-search':
                this.showSearch();
                break;
            case 'show-help':
                this.showHelp();
                break;
            case 'close-search':
                this.hideSearch();
                break;
            case 'clear-all-notifications':
                this.clearAllNotifications();
                break;
        }
    }
    
    /**
     * Dark Mode Toggle
     */
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.updateDarkMode();
        localStorage.setItem('darkMode', this.darkMode.toString());
    }
    
    /**
     * Dark Mode aktualisieren
     */
    updateDarkMode() {
        const icon = this.querySelector('#darkModeIcon');
        if (icon) {
            if (this.darkMode) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                document.body.classList.add('dark-mode');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                document.body.classList.remove('dark-mode');
            }
        }
    }
    
    /**
     * User Menu Toggle
     */
    toggleUserMenu() {
        const dropdown = this.querySelector('.user-menu-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }
    
    /**
     * Notifications Toggle
     */
    toggleNotifications() {
        const dropdown = this.querySelector('#notificationsDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }
    
    /**
     * Search anzeigen
     */
    showSearch() {
        const modal = this.querySelector('#searchModal');
        const input = this.querySelector('#searchInput');
        
        if (modal && input) {
            modal.classList.add('show');
            input.focus();
        }
    }
    
    /**
     * Search verstecken
     */
    hideSearch() {
        const modal = this.querySelector('#searchModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    /**
     * Search Handler
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.showSearchEmpty();
            return;
        }
        
        // Search Results anzeigen
        this.showSearchResults(query);
    }
    
    /**
     * Search Results anzeigen
     */
    showSearchResults(query) {
        const resultsContainer = this.querySelector('#searchResults');
        if (!resultsContainer) return;
        
        // Mock Search Results
        const results = [
            { title: 'Dashboard', section: 'dashboard', icon: 'fas fa-chart-line' },
            { title: 'API Keys', section: 'api-keys', icon: 'fas fa-key' },
            { title: 'Media Management', section: 'media', icon: 'fas fa-images' },
            { title: 'Applications', section: 'applications', icon: 'fas fa-briefcase' }
        ].filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.section.toLowerCase().includes(query.toLowerCase())
        );
        
        if (results.length > 0) {
            resultsContainer.innerHTML = results.map(result => `
                <div class="search-result-item" data-section="${result.section}">
                    <i class="${result.icon}"></i>
                    <div class="search-result-content">
                        <h4>${result.title}</h4>
                        <p>${result.section}</p>
                    </div>
                </div>
            `).join('');
            
            // Click Handler für Results
            resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const sectionId = item.dataset.section;
                    this.navigateToSection(sectionId);
                    this.hideSearch();
                });
            });
        } else {
            resultsContainer.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>Keine Ergebnisse gefunden</p>
                </div>
            `;
        }
    }
    
    /**
     * Search Empty anzeigen
     */
    showSearchEmpty() {
        const resultsContainer = this.querySelector('#searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>Geben Sie einen Suchbegriff ein</p>
                </div>
            `;
        }
    }
    
    /**
     * Navigation zu Section
     */
    navigateToSection(sectionId) {
        if (window.AdminApp && window.AdminApp.navigation) {
            window.AdminApp.navigation.navigateToSection(sectionId);
        } else {
            window.location.hash = sectionId;
        }
    }
    
    /**
     * Breadcrumb aktualisieren
     */
    updateBreadcrumb(sectionId) {
        const breadcrumb = this.querySelector('#breadcrumb-text');
        if (breadcrumb) {
            const sectionNames = {
                'dashboard': 'Dashboard',
                'api-keys': 'API Keys',
                'applications': 'Bewerbungen',
                'media': 'Medien',
                'content': 'Inhalte',
                'nutrition': 'Ernährungsplan',
                'personal-training': 'Personal Training',
                'translations': 'Übersetzungen',
                'ai-twin': 'AI Twin',
                'rentals': 'Vermietung',
                'bookings': 'Buchungen',
                'system-health': 'System Health',
                'analytics': 'Analytics',
                'settings': 'Einstellungen'
            };
            
            breadcrumb.textContent = sectionNames[sectionId] || sectionId;
        }
    }
    
    /**
     * Notifications aktualisieren
     */
    updateNotifications(notifications) {
        this.notifications = notifications;
        
        // Badge aktualisieren
        const badge = this.querySelector('#notificationBadge');
        if (badge) {
            badge.textContent = notifications.length;
            badge.style.display = notifications.length > 0 ? 'block' : 'none';
        }
        
        // Notifications List aktualisieren
        const list = this.querySelector('#notificationsList');
        if (list) {
            if (notifications.length > 0) {
                list.innerHTML = notifications.map(notification => `
                    <div class="notification-item" data-id="${notification.id}">
                        <div class="notification-icon">
                            <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-content">
                            <h4>${notification.title}</h4>
                            <p>${notification.message}</p>
                            <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                        </div>
                        <button class="notification-close" data-id="${notification.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
                
                // Close Buttons
                list.querySelectorAll('.notification-close').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.currentTarget.dataset.id;
                        this.removeNotification(id);
                    });
                });
            } else {
                list.innerHTML = `
                    <div class="notification-empty">
                        <i class="fas fa-bell-slash"></i>
                        <p>Keine Benachrichtigungen</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Notification Icon
     */
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'bell';
    }
    
    /**
     * Time Format
     */
    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        if (diff < 60000) return 'Gerade eben';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        return time.toLocaleDateString('de-DE');
    }
    
    /**
     * Notification entfernen
     */
    removeNotification(id) {
        if (this.stateManager) {
            this.stateManager.removeNotification(id);
        }
    }
    
    /**
     * Alle Notifications löschen
     */
    clearAllNotifications() {
        if (this.stateManager) {
            this.stateManager.setState('notifications', []);
        }
    }
    
    /**
     * Alle Dropdowns schließen
     */
    closeAllDropdowns() {
        this.querySelectorAll('.user-menu-dropdown, #notificationsDropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
    
    /**
     * Help anzeigen
     */
    showHelp() {
        // Help Modal oder Tooltip anzeigen
        console.log('Help requested');
    }
    
    /**
     * User Info aus Auth System aktualisieren
     */
    updateUserInfo() {
        if (window.adminAuth && window.adminAuth.getCurrentUser) {
            const user = window.adminAuth.getCurrentUser();
            if (user) {
                const userNameEl = this.querySelector('.user-name');
                const avatarEl = this.querySelector('.avatar-text');
                
                if (userNameEl) {
                    // Use email or username
                    const displayName = user.userInfo?.Attributes?.name || 
                                       user.userInfo?.Attributes?.given_name || 
                                       user.email || 
                                       'Admin';
                    userNameEl.textContent = displayName;
                }
                
                if (avatarEl) {
                    // Use initials from name or email
                    const name = user.userInfo?.Attributes?.name || 
                                user.userInfo?.Attributes?.given_name || 
                                user.email || 
                                'A';
                    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    avatarEl.textContent = initials;
                }
            }
        }
    }
    
    /**
     * Component Properties
     */
    static get observedAttributes() {
        return ['dark-mode'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'dark-mode') {
            this.darkMode = newValue === 'true';
            this.updateDarkMode();
        }
    }
}

// Custom Element registrieren
customElements.define('admin-topbar', AdminTopbar);

// Global verfügbar machen
window.AdminTopbar = AdminTopbar;
