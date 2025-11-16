/**
 * Admin Sidebar Web Component
 * Wiederverwendbare Sidebar-Komponente für das Admin Panel
 */
class AdminSidebar extends HTMLElement {
    constructor() {
        super();
        this.stateManager = null;
        this.navigation = null;
        this.collapsed = false;
        this.activeSection = 'dashboard';
    }
    
    /**
     * Component initialisieren
     */
    connectedCallback() {
        console.log('AdminSidebar connectedCallback');
        this.render();
        this.attachEventListeners();
        this.initializeState();
        
        // Debug: AdminApp Status prüfen
        setTimeout(() => {
            console.log('AdminApp status:', {
                AdminApp: !!window.AdminApp,
                navigation: !!(window.AdminApp && window.AdminApp.navigation),
                stateManager: !!(window.AdminApp && window.AdminApp.stateManager)
            });
        }, 1000);
    }
    
    /**
     * Component rendern
     */
    render() {
        this.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-brand">
                    <div class="avatar">
                        <span class="avatar-text">MW</span>
                    </div>
                    <div class="brand-text">
                        <h3>Admin Panel</h3>
                        <p>Manuel Weiss</p>
                    </div>
                </div>
                <button class="sidebar-toggle" id="sidebarToggle" title="Sidebar ein-/ausklappen">
                    <i class="fas fa-bars"></i>
                    <span class="toggle-label">Einklappen</span>
                </button>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-section-title">Hauptmenü</div>
                    <ul>
                        <li class="nav-item" data-section="dashboard" data-tooltip="Dashboard">
                            <a href="#dashboard">
                                <i class="fas fa-chart-line"></i>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="content" data-tooltip="Inhalte">
                            <a href="#content">
                                <i class="fas fa-edit"></i>
                                <span>Inhalte</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="hero-about" data-tooltip="Hero & Über mich">
                            <a href="#hero-about">
                                <i class="fas fa-home"></i>
                                <span>Hero & Über mich</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="nutrition" data-tooltip="Ernährungsplan">
                            <a href="#nutrition">
                                <i class="fas fa-apple-alt"></i>
                                <span>Ernährungsplan</span>
                            </a>
                        </li>
                        <li class="nav-item has-submenu" data-section="personality-development">
                            <a href="#personality-development">
                                <i class="fas fa-seedling"></i>
                                <span>Persönlichkeitsentwicklung</span>
                                <i class="fas fa-chevron-down submenu-arrow"></i>
                            </a>
                            <ul class="submenu">
                                <li class="nav-item" data-section="ikigai">
                                    <a href="#ikigai">
                                        <i class="fas fa-circle"></i>
                                        <span>Ikigai-Workflow</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="raisec">
                                    <a href="#raisec">
                                        <i class="fas fa-circle"></i>
                                        <span>RAISEC-Modell</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="values-clarification">
                                    <a href="#values-clarification">
                                        <i class="fas fa-circle"></i>
                                        <span>Werte-Klärung</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="strengths-analysis">
                                    <a href="#strengths-analysis">
                                        <i class="fas fa-circle"></i>
                                        <span>Stärken-Analyse</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="goal-setting">
                                    <a href="#goal-setting">
                                        <i class="fas fa-circle"></i>
                                        <span>Ziel-Setting</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="mindfulness">
                                    <a href="#mindfulness">
                                        <i class="fas fa-circle"></i>
                                        <span>Achtsamkeit & Meditation</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="emotional-intelligence">
                                    <a href="#emotional-intelligence">
                                        <i class="fas fa-circle"></i>
                                        <span>Emotionale Intelligenz</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="habit-building">
                                    <a href="#habit-building">
                                        <i class="fas fa-circle"></i>
                                        <span>Gewohnheiten aufbauen</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="gallup-strengths">
                                    <a href="#gallup-strengths">
                                        <i class="fas fa-circle"></i>
                                        <span>Gallup StrengthsFinder</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="via-strengths">
                                    <a href="#via-strengths">
                                        <i class="fas fa-circle"></i>
                                        <span>VIA Character Strengths</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="self-assessment">
                                    <a href="#self-assessment">
                                        <i class="fas fa-circle"></i>
                                        <span>Selbsteinschätzung</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="johari-window">
                                    <a href="#johari-window">
                                        <i class="fas fa-circle"></i>
                                        <span>Johari Window</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="nlp-dilts">
                                    <a href="#nlp-dilts">
                                        <i class="fas fa-circle"></i>
                                        <span>NLP Dilts</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="five-pillars">
                                    <a href="#five-pillars">
                                        <i class="fas fa-circle"></i>
                                        <span>Five Pillars</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="harvard-method">
                                    <a href="#harvard-method">
                                        <i class="fas fa-circle"></i>
                                        <span>Harvard Method</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="moment-excellence">
                                    <a href="#moment-excellence">
                                        <i class="fas fa-circle"></i>
                                        <span>Moment of Excellence</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="nlp-meta-goal">
                                    <a href="#nlp-meta-goal">
                                        <i class="fas fa-circle"></i>
                                        <span>NLP Meta Goal</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="nonviolent-communication">
                                    <a href="#nonviolent-communication">
                                        <i class="fas fa-circle"></i>
                                        <span>Nonviolent Communication</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="resource-analysis">
                                    <a href="#resource-analysis">
                                        <i class="fas fa-circle"></i>
                                        <span>Resource Analysis</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="rafael-method">
                                    <a href="#rafael-method">
                                        <i class="fas fa-circle"></i>
                                        <span>Rafael Method</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="walt-disney">
                                    <a href="#walt-disney">
                                        <i class="fas fa-circle"></i>
                                        <span>Walt Disney</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="aek-communication">
                                    <a href="#aek-communication">
                                        <i class="fas fa-circle"></i>
                                        <span>AEK Communication</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="change-stages">
                                    <a href="#change-stages">
                                        <i class="fas fa-circle"></i>
                                        <span>Change Stages</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="circular-interview">
                                    <a href="#circular-interview">
                                        <i class="fas fa-circle"></i>
                                        <span>Circular Interview</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="communication">
                                    <a href="#communication">
                                        <i class="fas fa-circle"></i>
                                        <span>Communication</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="competence-map">
                                    <a href="#competence-map">
                                        <i class="fas fa-circle"></i>
                                        <span>Competence Map</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="conflict-escalation">
                                    <a href="#conflict-escalation">
                                        <i class="fas fa-circle"></i>
                                        <span>Conflict Escalation</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="rubikon-model">
                                    <a href="#rubikon-model">
                                        <i class="fas fa-circle"></i>
                                        <span>Rubikon Model</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="solution-focused">
                                    <a href="#solution-focused">
                                        <i class="fas fa-circle"></i>
                                        <span>Solution Focused</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="systemic-coaching">
                                    <a href="#systemic-coaching">
                                        <i class="fas fa-circle"></i>
                                        <span>Systemic Coaching</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="target-coaching">
                                    <a href="#target-coaching">
                                        <i class="fas fa-circle"></i>
                                        <span>Target Coaching</span>
                                    </a>
                                </li>
                                <li class="nav-item" data-section="all-methods">
                                    <a href="#all-methods">
                                        <i class="fas fa-circle"></i>
                                        <span>Alle Methoden verwalten</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="nav-item" data-section="personal-training" data-tooltip="Personal Training">
                            <a href="#personal-training">
                                <i class="fas fa-dumbbell"></i>
                                <span>Personal Training</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="applications" data-tooltip="Bewerbungen">
                            <a href="#applications">
                                <i class="fas fa-briefcase"></i>
                                <span>Bewerbungen</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="api-keys" data-tooltip="API Keys">
                            <a href="#api-keys">
                                <i class="fas fa-key"></i>
                                <span>API Keys</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="user-management" data-tooltip="Admin-User Verwaltung">
                            <a href="#user-management">
                                <i class="fas fa-users-cog"></i>
                                <span>Admin-User</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="ai-twin" data-tooltip="AI Twin">
                            <a href="#ai-twin">
                                <i class="fas fa-user-robot"></i>
                                <span>AI Twin</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="translations" data-tooltip="Translations">
                            <a href="#translations">
                                <i class="fas fa-language"></i>
                                <span>Translations</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="media" data-tooltip="Medien">
                            <a href="#media">
                                <i class="fas fa-images"></i>
                                <span>Medien</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="rentals" data-tooltip="VERMIETUNG">
                            <a href="#rentals">
                                <i class="fas fa-home"></i>
                                <span>VERMIETUNG</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="bookings" data-tooltip="Buchungen">
                            <a href="#bookings">
                                <i class="fas fa-calendar-check"></i>
                                <span>Buchungen</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="system-health" data-tooltip="System Health">
                            <a href="#system-health">
                                <i class="fas fa-heartbeat"></i>
                                <span>System Health</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="analytics" data-tooltip="Analytics">
                            <a href="#analytics">
                                <i class="fas fa-chart-bar"></i>
                                <span>Analytics</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="settings" data-tooltip="Einstellungen">
                            <a href="#settings">
                                <i class="fas fa-cog"></i>
                                <span>Einstellungen</span>
                            </a>
                        </li>
                        <li class="nav-item" data-section="website" data-tooltip="Website ansehen">
                            <a href="/" target="_blank">
                                <i class="fas fa-external-link-alt"></i>
                                <span>Website ansehen</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
            
            <div class="sidebar-footer">
                <button class="test-media-upload-btn" onclick="testMediaUpload()">
                    Test Media Upload
                </button>
            </div>
        `;
    }
    
    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Toggle Button
        const toggleBtn = this.querySelector('#sidebarToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
        
        // Navigation Items
        const navItems = this.querySelectorAll('.nav-item[data-section]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const sectionId = item.dataset.section;
                console.log('Nav item clicked:', sectionId);
                this.navigateToSection(sectionId);
            });
        });
        
        // Auch Links in den Nav Items
        const navLinks = this.querySelectorAll('.nav-item a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const href = link.getAttribute('href');
                const sectionId = href.substring(1); // Remove #
                console.log('Nav link clicked:', sectionId);
                this.navigateToSection(sectionId);
            });
        });
        
        // Submenu Toggle
        const submenuItems = this.querySelectorAll('.has-submenu');
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubmenu(item);
            });
        });
        
        // Tooltip Support
        this.setupTooltips();
    }
    
    /**
     * State initialisieren
     */
    initializeState() {
        // Warten auf AdminApp Initialisierung
        const checkAdminApp = () => {
            if (window.AdminApp && window.AdminApp.stateManager) {
                this.stateManager = window.AdminApp.stateManager;
                this.navigation = window.AdminApp.navigation;
                
                console.log('Sidebar connected to AdminApp');
                
                // State Changes abonnieren
                this.stateManager.subscribe('currentSection', (sectionId) => {
                    this.setActiveSection(sectionId);
                });
                
                this.stateManager.subscribe('sidebarCollapsed', (collapsed) => {
                    this.setCollapsed(collapsed);
                });
                
                // Initial State setzen
                this.setActiveSection(this.activeSection);
            } else {
                // Retry nach 100ms
                setTimeout(checkAdminApp, 100);
            }
        };
        
        checkAdminApp();
    }
    
    /**
     * Navigation zu Section
     */
    navigateToSection(sectionId) {
        console.log('Sidebar navigation to:', sectionId);
        
        // Direkte Navigation über AdminApp
        if (window.AdminApp && window.AdminApp.navigation) {
            console.log('Using AdminApp navigation');
            window.AdminApp.navigation.navigateToSection(sectionId);
        } else if (this.navigation) {
            console.log('Using local navigation');
            this.navigation.navigateToSection(sectionId);
        } else {
            // Fallback: Direkte Hash-Änderung
            console.log('Using fallback navigation');
            window.location.hash = '#' + sectionId;
            
            // Manuell Section laden falls AdminApp nicht verfügbar
            setTimeout(() => {
                this.loadSectionManually(sectionId);
            }, 100);
        }
    }
    
    /**
     * Section manuell laden (Fallback)
     */
    async loadSectionManually(sectionId) {
        try {
            console.log('Loading section manually:', sectionId);
            
            // Template laden
            const response = await fetch(`admin/sections/${sectionId}.html`);
            if (!response.ok) {
                throw new Error(`Template not found: ${sectionId}`);
            }
            
            const template = await response.text();
            
            // Content in DOM einfügen
            const container = document.getElementById('admin-content');
            if (container) {
                container.innerHTML = template;
                container.setAttribute('data-section', sectionId);
                console.log('Section loaded manually:', sectionId);
                
                // Section-spezifische Initialisierung
                this.initializeSectionManually(sectionId);
            }
        } catch (error) {
            console.error('Manual section loading failed:', error);
        }
    }
    
    /**
     * Section manuell initialisieren
     */
    initializeSectionManually(sectionId) {
        if (sectionId === 'hero-about') {
            // Hero-About Section initialisieren
            setTimeout(() => {
                if (window.HeroAboutSection && !window.heroAboutSection) {
                    console.log('Initializing HeroAboutSection manually');
                    window.heroAboutSection = new window.HeroAboutSection();
                    window.heroAboutSection.init();
                }
            }, 200);
        }
    }
    
    /**
     * Active Section setzen
     */
    setActiveSection(sectionId) {
        this.activeSection = sectionId;
        
        // Alle Items deaktivieren
        const navItems = this.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Aktives Item finden und aktivieren
        const activeItem = this.querySelector(`[data-section="${sectionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            
            // Parent Submenu öffnen
            const parentSubmenu = activeItem.closest('.submenu');
            if (parentSubmenu) {
                const parentItem = parentSubmenu.previousElementSibling;
                if (parentItem && parentItem.classList.contains('has-submenu')) {
                    this.openSubmenu(parentItem);
                }
            }
        }
    }
    
    /**
     * Sidebar Toggle
     */
    toggle() {
        this.collapsed = !this.collapsed;
        this.setCollapsed(this.collapsed);
        
        // State Manager aktualisieren
        if (this.stateManager) {
            this.stateManager.setState('sidebarCollapsed', this.collapsed);
        }
    }
    
    /**
     * Collapsed State setzen
     */
    setCollapsed(collapsed) {
        this.collapsed = collapsed;
        
        if (collapsed) {
            this.classList.add('collapsed');
            const toggleLabel = this.querySelector('.toggle-label');
            if (toggleLabel) {
                toggleLabel.textContent = 'Ausklappen';
            }
            // shift main layout when collapsed
            const adminMain = document.querySelector('.admin-main');
            if (adminMain) {
                adminMain.classList.add('sidebar-collapsed');
            }
        } else {
            this.classList.remove('collapsed');
            const toggleLabel = this.querySelector('.toggle-label');
            if (toggleLabel) {
                toggleLabel.textContent = 'Einklappen';
            }
            // reset main layout when expanded
            const adminMain = document.querySelector('.admin-main');
            if (adminMain) {
                adminMain.classList.remove('sidebar-collapsed');
            }
        }
    }
    
    /**
     * Submenu Toggle
     */
    toggleSubmenu(item) {
        const submenu = item.querySelector('.submenu');
        if (submenu) {
            if (submenu.style.display === 'block') {
                this.closeSubmenu(item);
            } else {
                this.openSubmenu(item);
            }
        }
    }
    
    /**
     * Submenu öffnen
     */
    openSubmenu(item) {
        const submenu = item.querySelector('.submenu');
        const arrow = item.querySelector('.submenu-arrow');
        
        if (submenu) {
            submenu.style.display = 'block';
            if (arrow) {
                arrow.classList.remove('fa-chevron-down');
                arrow.classList.add('fa-chevron-up');
            }
        }
    }
    
    /**
     * Submenu schließen
     */
    closeSubmenu(item) {
        const submenu = item.querySelector('.submenu');
        const arrow = item.querySelector('.submenu-arrow');
        
        if (submenu) {
            submenu.style.display = 'none';
            if (arrow) {
                arrow.classList.remove('fa-chevron-up');
                arrow.classList.add('fa-chevron-down');
            }
        }
    }
    
    /**
     * Tooltips einrichten
     */
    setupTooltips() {
        const tooltipItems = this.querySelectorAll('[data-tooltip]');
        tooltipItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            
            item.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }
    
    /**
     * Tooltip anzeigen
     */
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'sidebar-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.right + 10 + 'px';
        tooltip.style.top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2) + 'px';
    }
    
    /**
     * Tooltip verstecken
     */
    hideTooltip() {
        const tooltip = document.querySelector('.sidebar-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    /**
     * Component Properties
     */
    static get observedAttributes() {
        return ['collapsed', 'active-section'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'collapsed') {
            this.setCollapsed(newValue === 'true');
        } else if (name === 'active-section') {
            this.setActiveSection(newValue);
        }
    }
}

// Custom Element registrieren
customElements.define('admin-sidebar', AdminSidebar);

// Global verfügbar machen
window.AdminSidebar = AdminSidebar;
