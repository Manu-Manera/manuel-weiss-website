/**
 * TRACKING SYSTEM - JAVASCRIPT
 * Handles application tracking, kanban board, and analytics
 */

class TrackingSystem {
    constructor() {
        this.applicationsCore = null;
        this.applications = [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('📊 Initializing Tracking System...');
        
        // Wait for applications core
        await this.waitForApplicationsCore();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Load applications
        this.loadApplications();
        
        // Setup drag and drop
        this.setupDragAndDrop();
        
        // Update UI
        this.updateDashboard();
        
        this.isInitialized = true;
        console.log('✅ Tracking System initialized');
    }

    async waitForApplicationsCore() {
        return new Promise((resolve) => {
            const checkCore = () => {
                if (window.applicationsCore && window.applicationsCore.isInitialized) {
                    this.applicationsCore = window.applicationsCore;
                    resolve();
                } else {
                    setTimeout(checkCore, 100);
                }
            };
            checkCore();
        });
    }

    setupEventHandlers() {
        // Add application form
        document.getElementById('addApplicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddApplication();
        });

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                this.closeAllModals();
            }
        });
    }

    setupDragAndDrop() {
        const columns = document.querySelectorAll('.kanban-column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            
            column.addEventListener('dragleave', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
            });
            
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                
                const applicationId = e.dataTransfer.getData('text/plain');
                const newStatus = column.dataset.status;
                
                this.moveApplication(applicationId, newStatus);
            });
        });
    }

    loadApplications() {
        this.applications = this.applicationsCore.getApplicationData();
        console.log('📋 Loaded applications:', this.applications.length);
    }

    updateDashboard() {
        this.updateStats();
        this.updateKanbanBoard();
        this.updateTimeline();
        this.updateAnalytics();
    }

    updateStats() {
        const total = this.applications.length;
        const pending = this.applications.filter(app => 
            ['preparation', 'sent', 'confirmed'].includes(app.status)
        ).length;
        const interviews = this.applications.filter(app => 
            app.status === 'interview'
        ).length;
        const successRate = this.calculateSuccessRate();
        
        document.getElementById('totalApplications').textContent = total;
        document.getElementById('pendingApplications').textContent = pending;
        document.getElementById('interviewApplications').textContent = interviews;
        document.getElementById('successRate').textContent = successRate + '%';
    }

    calculateSuccessRate() {
        if (this.applications.length === 0) return 0;
        
        const successful = this.applications.filter(app => 
            app.status === 'offer'
        ).length;
        
        return Math.round((successful / this.applications.length) * 100);
    }

    updateKanbanBoard() {
        const statuses = ['preparation', 'sent', 'confirmed', 'interview', 'offer', 'rejected'];
        
        statuses.forEach(status => {
            const column = document.getElementById(status + 'Column');
            const count = document.getElementById(status + 'Count');
            
            if (column && count) {
                // Clear existing cards
                column.innerHTML = '';
                
                // Get applications for this status
                const applications = this.applications.filter(app => app.status === status);
                count.textContent = applications.length;
                
                // Add application cards
                applications.forEach(app => {
                    const card = this.createApplicationCard(app);
                    column.appendChild(card);
                });
                
                // Add empty state if no applications
                if (applications.length === 0) {
                    column.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>Keine Bewerbungen</p>
                        </div>
                    `;
                }
            }
        });
    }

    createApplicationCard(application) {
        const card = document.createElement('div');
        card.className = 'application-card';
        card.draggable = true;
        card.dataset.applicationId = application.id;
        
        card.innerHTML = `
            <div class="application-header">
                <div>
                    <h4 class="application-title">${application.jobTitle || 'Unbekannter Titel'}</h4>
                    <p class="application-company">${application.company || 'Unbekanntes Unternehmen'}</p>
                </div>
                <span class="application-status status-${application.status}">
                    ${this.getStatusLabel(application.status)}
                </span>
            </div>
            
            <div class="application-meta">
                <div class="application-date">
                    <i class="fas fa-calendar"></i>
                    ${application.appliedDate ? this.formatDate(application.appliedDate) : 'Nicht angegeben'}
                </div>
                ${application.location ? `
                    <div class="application-date">
                        <i class="fas fa-map-marker-alt"></i>
                        ${application.location}
                    </div>
                ` : ''}
            </div>
            
            <div class="application-actions">
                <button class="action-btn" onclick="viewApplication('${application.id}')" title="Anzeigen">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="editApplication('${application.id}')" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="deleteApplication('${application.id}')" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add drag event listeners
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', application.id);
            card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        
        return card;
    }

    getStatusLabel(status) {
        const labels = {
            'preparation': 'Vorbereitung',
            'sent': 'Versendet',
            'confirmed': 'Bestätigt',
            'interview': 'Interview',
            'offer': 'Angebot',
            'rejected': 'Abgelehnt'
        };
        return labels[status] || status;
    }

    moveApplication(applicationId, newStatus) {
        const application = this.applications.find(app => app.id === applicationId);
        if (!application) return;
        
        application.status = newStatus;
        application.updatedAt = new Date().toISOString();
        
        // Save to storage
        this.applicationsCore.saveApplicationData(application);
        
        // Update UI
        this.updateKanbanBoard();
        this.updateStats();
        
        // Add to timeline
        this.addTimelineEvent(application, `Status geändert zu: ${this.getStatusLabel(newStatus)}`);
        
        console.log('📝 Application moved:', applicationId, 'to', newStatus);
    }

    updateTimeline() {
        const container = document.getElementById('timelineContainer');
        if (!container) return;
        
        // Sort applications by date
        const sortedApplications = [...this.applications].sort((a, b) => {
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });
        
        container.innerHTML = '';
        
        if (sortedApplications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>Keine Aktivitäten</h3>
                    <p>Hier werden Ihre Bewerbungsaktivitäten angezeigt.</p>
                </div>
            `;
            return;
        }
        
        sortedApplications.slice(0, 10).forEach(app => {
            const timelineItem = this.createTimelineItem(app);
            container.appendChild(timelineItem);
        });
    }

    createTimelineItem(application) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const icon = this.getStatusIcon(application.status);
        const title = `${application.jobTitle} bei ${application.company}`;
        const description = `Status: ${this.getStatusLabel(application.status)}`;
        const date = this.formatDate(application.updatedAt || application.createdAt);
        
        item.innerHTML = `
            <div class="timeline-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="timeline-content">
                <h4 class="timeline-title">${title}</h4>
                <p class="timeline-description">${description}</p>
                <span class="timeline-date">${date}</span>
            </div>
        `;
        
        return item;
    }

    getStatusIcon(status) {
        const icons = {
            'preparation': 'edit',
            'sent': 'paper-plane',
            'confirmed': 'check',
            'interview': 'comments',
            'offer': 'trophy',
            'rejected': 'times'
        };
        return icons[status] || 'file';
    }

    addTimelineEvent(application, event) {
        // This would typically be saved to a timeline/activity log
        console.log('📅 Timeline event:', event, 'for', application.id);
    }

    updateAnalytics() {
        this.updateResponseTime();
        this.updateTopCompanies();
    }

    updateResponseTime() {
        const respondedApplications = this.applications.filter(app => 
            app.responseDate && app.appliedDate
        );
        
        if (respondedApplications.length === 0) {
            document.getElementById('avgResponseTime').textContent = '-';
            return;
        }
        
        const totalDays = respondedApplications.reduce((sum, app) => {
            const applied = new Date(app.appliedDate);
            const responded = new Date(app.responseDate);
            return sum + (responded - applied) / (1000 * 60 * 60 * 24);
        }, 0);
        
        const avgDays = Math.round(totalDays / respondedApplications.length);
        document.getElementById('avgResponseTime').textContent = avgDays;
    }

    updateTopCompanies() {
        const companies = {};
        this.applications.forEach(app => {
            if (app.company) {
                companies[app.company] = (companies[app.company] || 0) + 1;
            }
        });
        
        const topCompanies = Object.entries(companies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        const container = document.getElementById('topCompanies');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (topCompanies.length === 0) {
            container.innerHTML = '<p class="text-muted">Keine Daten verfügbar</p>';
            return;
        }
        
        topCompanies.forEach(([company, count]) => {
            const item = document.createElement('div');
            item.className = 'company-item';
            item.innerHTML = `
                <span class="company-name">${company}</span>
                <span class="company-count">${count}</span>
            `;
            container.appendChild(item);
        });
    }

    handleAddApplication() {
        const form = document.getElementById('addApplicationForm');
        const formData = new FormData(form);
        
        const application = {
            id: 'app_' + Date.now(),
            jobTitle: formData.get('jobTitle'),
            company: formData.get('company'),
            location: formData.get('location'),
            status: formData.get('status'),
            appliedDate: formData.get('appliedDate'),
            deadline: formData.get('deadline'),
            notes: formData.get('notes'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save application
        this.applicationsCore.saveApplicationData(application);
        
        // Reload and update
        this.loadApplications();
        this.updateDashboard();
        
        // Close modal
        this.closeAddApplicationModal();
        
        // Show success message
        this.showNotification('Bewerbung erfolgreich hinzugefügt!', 'success');
    }

    showAddApplicationModal() {
        document.getElementById('addApplicationModal').style.display = 'block';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appAppliedDate').value = today;
    }

    closeAddApplicationModal() {
        document.getElementById('addApplicationModal').style.display = 'none';
        document.getElementById('addApplicationForm').reset();
    }

    closeApplicationDetailModal() {
        document.getElementById('applicationDetailModal').style.display = 'none';
    }

    closeAllModals() {
        this.closeAddApplicationModal();
        this.closeApplicationDetailModal();
    }

    formatDate(dateString) {
        if (!dateString) return 'Nicht angegeben';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        if (this.applicationsCore) {
            this.applicationsCore.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    }
}

// Global functions for inline event handlers
function showAddApplicationModal() {
    if (window.trackingSystem) {
        window.trackingSystem.showAddApplicationModal();
    }
}

function closeAddApplicationModal() {
    if (window.trackingSystem) {
        window.trackingSystem.closeAddApplicationModal();
    }
}

function closeApplicationDetailModal() {
    if (window.trackingSystem) {
        window.trackingSystem.closeApplicationDetailModal();
    }
}

function viewApplication(applicationId) {
    console.log('View application:', applicationId);
    // Implementation for viewing application details
}

function editApplication(applicationId) {
    console.log('Edit application:', applicationId);
    // Implementation for editing application
}

function deleteApplication(applicationId) {
    if (confirm('Möchten Sie diese Bewerbung wirklich löschen?')) {
        console.log('Delete application:', applicationId);
        // Implementation for deleting application
    }
}

function handleContinue() {
    // Show success message
    if (window.trackingSystem) {
        window.trackingSystem.showNotification('Bewerbungs-Tracking erfolgreich eingerichtet!', 'success');
    }
    
    // Redirect to next step
    setTimeout(() => {
        window.location.href = 'interview-prep.html';
    }, 1500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trackingSystem = new TrackingSystem();
});

























