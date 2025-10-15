/**
 * Dashboard Section Module
 * Dashboard-Funktionalität für das Admin Panel
 */
class DashboardSection {
    constructor() {
        this.stateManager = null;
        this.initialized = false;
    }
    
    /**
     * Section initialisieren
     */
    init() {
        if (this.initialized) return;
        
        // Dependencies prüfen
        if (window.AdminApp && window.AdminApp.stateManager) {
            this.stateManager = window.AdminApp.stateManager;
        }
        
        // Dashboard Daten laden
        this.loadDashboardData();
        
        // Event Listeners hinzufügen
        this.attachEventListeners();
        
        this.initialized = true;
        console.log('Dashboard Section initialized');
    }
    
    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Applications Button
        const applicationsBtn = document.querySelector('.btn-applications[onclick*="applications"]');
        if (applicationsBtn) {
            applicationsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection('applications');
            });
        }
        
        // User Management Button
        const userManagementBtn = document.querySelector('.btn-applications[onclick*="user-management"]');
        if (userManagementBtn) {
            userManagementBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection('user-management');
            });
        }
    }
    
    /**
     * Dashboard Daten laden
     */
    async loadDashboardData() {
        try {
            // Applications Stats laden
            await this.loadApplicationsStats();
            
            // Recent Applications laden
            await this.loadRecentApplications();
            
            // User Stats laden
            await this.loadUserStats();
            
            // Recent Users laden
            await this.loadRecentUsers();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }
    
    /**
     * Applications Stats laden
     */
    async loadApplicationsStats() {
        try {
            // Mock data - in real implementation, load from API
            const stats = {
                total: 12,
                pending: 8,
                successRate: 75
            };
            
            // Stats anzeigen
            const totalApps = document.getElementById('dashboard-total-apps');
            const pendingApps = document.getElementById('dashboard-pending-apps');
            const successRate = document.getElementById('dashboard-success-rate');
            
            if (totalApps) totalApps.textContent = stats.total;
            if (pendingApps) pendingApps.textContent = stats.pending;
            if (successRate) successRate.textContent = stats.successRate + '%';
            
        } catch (error) {
            console.error('Failed to load applications stats:', error);
        }
    }
    
    /**
     * Recent Applications laden
     */
    async loadRecentApplications() {
        try {
            // Mock data
            const recentApplications = [
                {
                    id: 1,
                    company: 'TechCorp GmbH',
                    position: 'Frontend Developer',
                    date: '2024-01-15',
                    status: 'sent'
                },
                {
                    id: 2,
                    company: 'StartupXYZ',
                    position: 'Full Stack Developer',
                    date: '2024-01-14',
                    status: 'pending'
                },
                {
                    id: 3,
                    company: 'BigCorp AG',
                    position: 'Senior Developer',
                    date: '2024-01-13',
                    status: 'interview'
                }
            ];
            
            const container = document.getElementById('recentApplicationsList');
            if (container) {
                container.innerHTML = recentApplications.map(app => `
                    <div class="recent-item">
                        <div class="item-info">
                            <h5>${app.company}</h5>
                            <p>${app.position}</p>
                            <span class="item-date">${this.formatDate(app.date)}</span>
                        </div>
                        <div class="item-status status-${app.status}">
                            ${this.getStatusText(app.status)}
                        </div>
                    </div>
                `).join('');
            }
            
        } catch (error) {
            console.error('Failed to load recent applications:', error);
        }
    }
    
    /**
     * User Stats laden
     */
    async loadUserStats() {
        try {
            // Mock data
            const userStats = {
                total: 156,
                active: 23,
                satisfaction: 89
            };
            
            // Stats anzeigen
            const totalUsers = document.getElementById('dashboard-total-users');
            const activeUsers = document.getElementById('dashboard-active-users');
            const satisfaction = document.getElementById('dashboard-satisfaction');
            
            if (totalUsers) totalUsers.textContent = userStats.total;
            if (activeUsers) activeUsers.textContent = userStats.active;
            if (satisfaction) satisfaction.textContent = userStats.satisfaction + '%';
            
        } catch (error) {
            console.error('Failed to load user stats:', error);
        }
    }
    
    /**
     * Recent Users laden
     */
    async loadRecentUsers() {
        try {
            // Mock data
            const recentUsers = [
                {
                    id: 1,
                    name: 'Max Mustermann',
                    email: 'max@example.com',
                    date: '2024-01-15',
                    status: 'active'
                },
                {
                    id: 2,
                    name: 'Anna Schmidt',
                    email: 'anna@example.com',
                    date: '2024-01-14',
                    status: 'pending'
                },
                {
                    id: 3,
                    name: 'Tom Weber',
                    email: 'tom@example.com',
                    date: '2024-01-13',
                    status: 'active'
                }
            ];
            
            const container = document.getElementById('recentUsersList');
            if (container) {
                container.innerHTML = recentUsers.map(user => `
                    <div class="recent-item">
                        <div class="item-info">
                            <h5>${user.name}</h5>
                            <p>${user.email}</p>
                            <span class="item-date">${this.formatDate(user.date)}</span>
                        </div>
                        <div class="item-status status-${user.status}">
                            ${this.getStatusText(user.status)}
                        </div>
                    </div>
                `).join('');
            }
            
        } catch (error) {
            console.error('Failed to load recent users:', error);
        }
    }
    
    /**
     * Status Text
     */
    getStatusText(status) {
        const statusTexts = {
            'sent': 'Gesendet',
            'pending': 'Wartend',
            'interview': 'Interview',
            'active': 'Aktiv',
            'inactive': 'Inaktiv'
        };
        return statusTexts[status] || status;
    }
    
    /**
     * Date Format
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE');
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
     * Dashboard aktualisieren
     */
    async refresh() {
        await this.loadDashboardData();
    }
}

// Global Functions für Legacy Support
window.showAdminSection = function(sectionId) {
    if (window.AdminApp && window.AdminApp.navigation) {
        window.AdminApp.navigation.navigateToSection(sectionId);
    } else {
        window.location.hash = sectionId;
    }
};

// Section initialisieren wenn DOM bereit
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis AdminApp verfügbar ist
    const initSection = () => {
        if (window.AdminApp && window.AdminApp.sections) {
            window.AdminApp.sections.dashboard = new DashboardSection();
            window.AdminApp.sections.dashboard.init();
        } else {
            setTimeout(initSection, 100);
        }
    };
    initSection();
});

// Global verfügbar machen
window.DashboardSection = DashboardSection;
