/**
 * Applications Section Module
 * Bewerbungsverwaltung für das Admin Panel
 */
class ApplicationsSection {
    constructor() {
        this.stateManager = null;
        this.initialized = false;
        this.applications = [];
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
        
        // Applications laden
        this.loadApplications();
        
        // Event Listeners hinzufügen
        this.attachEventListeners();
        
        this.initialized = true;
        console.log('Applications Section initialized');
    }
    
    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Add New Application Button
        const addBtn = document.querySelector('[onclick="addNewApplication()"]');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addNewApplication();
            });
        }
    }
    
    /**
     * Applications laden
     */
    async loadApplications() {
        try {
            // Mock data - in real implementation, load from API
            this.applications = [
                {
                    id: 1,
                    company: 'TechCorp GmbH',
                    position: 'Frontend Developer',
                    date: '2024-01-15',
                    status: 'sent',
                    response: null
                },
                {
                    id: 2,
                    company: 'StartupXYZ',
                    position: 'Full Stack Developer',
                    date: '2024-01-14',
                    status: 'pending',
                    response: null
                },
                {
                    id: 3,
                    company: 'BigCorp AG',
                    position: 'Senior Developer',
                    date: '2024-01-13',
                    status: 'interview',
                    response: 'Interview am 20.01.2024'
                }
            ];
            
            // Stats aktualisieren
            this.updateStats();
            
            // Applications List rendern
            this.renderApplicationsList();
            
        } catch (error) {
            console.error('Failed to load applications:', error);
        }
    }
    
    /**
     * Stats aktualisieren
     */
    updateStats() {
        const total = this.applications.length;
        const positive = this.applications.filter(app => app.status === 'pending' || app.status === 'interview').length;
        const interviews = this.applications.filter(app => app.status === 'interview').length;
        const rejections = this.applications.filter(app => app.status === 'rejected').length;
        const successRate = total > 0 ? Math.round((positive / total) * 100) : 0;
        
        // Stats anzeigen
        const totalEl = document.getElementById('total-applications-count');
        const positiveEl = document.getElementById('positive-responses-count');
        const interviewsEl = document.getElementById('interviews-count');
        const rejectionsEl = document.getElementById('rejections-count');
        const successRateEl = document.getElementById('success-rate-count');
        
        if (totalEl) totalEl.textContent = total;
        if (positiveEl) positiveEl.textContent = positive;
        if (interviewsEl) interviewsEl.textContent = interviews;
        if (rejectionsEl) rejectionsEl.textContent = rejections;
        if (successRateEl) successRateEl.textContent = successRate + '%';
    }
    
    /**
     * Applications List rendern
     */
    renderApplicationsList() {
        const container = document.getElementById('applicationsList');
        if (!container) return;
        
        if (this.applications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-briefcase" style="font-size: 3rem; color: #94a3b8; margin-bottom: 1rem;"></i>
                    <h3>Keine Bewerbungen vorhanden</h3>
                    <p>Erstelle deine erste Bewerbung, um loszulegen.</p>
                    <button class="btn btn-primary" onclick="addNewApplication()">
                        <i class="fas fa-plus"></i> Erste Bewerbung erstellen
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.applications.map(app => `
            <div class="application-item" data-id="${app.id}">
                <div class="application-info">
                    <div class="application-header">
                        <h4>${app.company}</h4>
                        <span class="application-status status-${app.status}">
                            ${this.getStatusText(app.status)}
                        </span>
                    </div>
                    <p class="application-position">${app.position}</p>
                    <p class="application-date">Beworben am: ${this.formatDate(app.date)}</p>
                    ${app.response ? `<p class="application-response">${app.response}</p>` : ''}
                </div>
                <div class="application-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editApplication(${app.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteApplication(${app.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Status Text
     */
    getStatusText(status) {
        const statusTexts = {
            'sent': 'Gesendet',
            'pending': 'Wartend',
            'interview': 'Interview',
            'rejected': 'Abgelehnt',
            'accepted': 'Angenommen'
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
     * Neue Bewerbung hinzufügen
     */
    addNewApplication() {
        // Redirect zu Bewerbungsmanager
        window.location.href = 'bewerbung.html';
    }
    
    /**
     * Bewerbung bearbeiten
     */
    editApplication(id) {
        const application = this.applications.find(app => app.id === id);
        if (application) {
            // Redirect zu Bewerbungsmanager mit ID
            window.location.href = `bewerbung.html?id=${id}`;
        }
    }
    
    /**
     * Bewerbung löschen
     */
    deleteApplication(id) {
        if (confirm('Bewerbung wirklich löschen?')) {
            this.applications = this.applications.filter(app => app.id !== id);
            this.updateStats();
            this.renderApplicationsList();
        }
    }
    
    /**
     * Applications aktualisieren
     */
    async refresh() {
        await this.loadApplications();
    }
}

// Global Functions für Legacy Support
window.addNewApplication = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.applications) {
        window.AdminApp.sections.applications.addNewApplication();
    }
};

window.editApplication = function(id) {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.applications) {
        window.AdminApp.sections.applications.editApplication(id);
    }
};

window.deleteApplication = function(id) {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.applications) {
        window.AdminApp.sections.applications.deleteApplication(id);
    }
};

// Section initialisieren wenn DOM bereit
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis AdminApp verfügbar ist
    const initSection = () => {
        if (window.AdminApp && window.AdminApp.sections) {
            window.AdminApp.sections.applications = new ApplicationsSection();
            window.AdminApp.sections.applications.init();
        } else {
            setTimeout(initSection, 100);
        }
    };
    initSection();
});

// Global verfügbar machen
window.ApplicationsSection = ApplicationsSection;
