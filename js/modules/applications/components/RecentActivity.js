// 🔔 Recent Activity Component - Intelligenter Aktivitätsfeed mit Real-time Updates
// Timeline-View, Action-Grouping und Smart Notifications

export class RecentActivity {
    constructor(applicationCore, options = {}) {
        this.applicationCore = applicationCore;
        this.options = {
            container: options.container,
            dashboard: options.dashboard,
            maxItems: options.maxItems || 10,
            enableGrouping: options.enableGrouping !== false,
            enableFiltering: options.enableFiltering !== false,
            showTimestamps: options.showTimestamps !== false,
            autoRefresh: options.autoRefresh !== false,
            refreshInterval: options.refreshInterval || 30000,
            ...options
        };

        this.container = this.options.container;
        this.activities = [];
        this.filteredActivities = [];
        this.currentFilter = 'all';
        this.refreshTimer = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            await this.loadActivities();
            await this.render();
            this.setupEventListeners();
            this.startAutoRefresh();
            
            // Subscribe to application events
            this.applicationCore.subscribe((event, data) => {
                this.handleApplicationEvent(event, data);
            });
            
            this.isInitialized = true;
            console.log('✅ RecentActivity initialized');
        } catch (error) {
            console.error('❌ RecentActivity initialization failed:', error);
            throw error;
        }
    }

    async render() {
        this.container.innerHTML = this.getHTML();
        this.renderActivityItems();
    }

    getHTML() {
        return `
            <div class="recent-activity">
                <div class="activity-header">
                    <h4>🔔 Kürzliche Aktivitäten</h4>
                    <div class="activity-controls">
                        ${this.getFilterHTML()}
                        <button class="btn-icon" onclick="recentActivity.refresh()" title="Aktualisieren">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="activity-timeline" id="activityTimeline">
                    <div class="loading-activities">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Aktivitäten werden geladen...</span>
                    </div>
                </div>

                <div class="activity-footer">
                    <button class="btn-text" onclick="recentActivity.showAllActivities()">
                        <span>Alle Aktivitäten anzeigen</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getFilterHTML() {
        if (!this.options.enableFiltering) return '';
        
        return `
            <div class="activity-filters">
                <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" 
                        data-filter="all" onclick="recentActivity.setFilter('all')">
                    Alle
                </button>
                <button class="filter-btn ${this.currentFilter === 'applications' ? 'active' : ''}" 
                        data-filter="applications" onclick="recentActivity.setFilter('applications')">
                    Bewerbungen
                </button>
                <button class="filter-btn ${this.currentFilter === 'uploads' ? 'active' : ''}" 
                        data-filter="uploads" onclick="recentActivity.setFilter('uploads')">
                    Uploads
                </button>
                <button class="filter-btn ${this.currentFilter === 'updates' ? 'active' : ''}" 
                        data-filter="updates" onclick="recentActivity.setFilter('updates')">
                    Updates
                </button>
            </div>
        `;
    }

    async loadActivities() {
        try {
            // Load from localStorage and API
            const stored = this.loadStoredActivities();
            const realTime = await this.loadRealTimeActivities();
            
            // Merge and deduplicate
            const allActivities = [...realTime, ...stored];
            const uniqueActivities = this.deduplicateActivities(allActivities);
            
            // Sort by timestamp (newest first)
            this.activities = uniqueActivities.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            // Apply filtering
            this.applyFilter();
            
        } catch (error) {
            console.error('Error loading activities:', error);
            this.activities = this.loadStoredActivities();
            this.applyFilter();
        }
    }

    loadStoredActivities() {
        try {
            const stored = localStorage.getItem('application_activities');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading stored activities:', error);
            return [];
        }
    }

    async loadRealTimeActivities() {
        // This would fetch from API
        return [];
    }

    deduplicateActivities(activities) {
        const seen = new Set();
        return activities.filter(activity => {
            const key = `${activity.type}_${activity.entityId}_${activity.timestamp}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    renderActivityItems() {
        const timeline = this.container.querySelector('#activityTimeline');
        
        if (this.filteredActivities.length === 0) {
            timeline.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const groupedActivities = this.options.enableGrouping 
            ? this.groupActivitiesByTime(this.filteredActivities)
            : { 'Aktivitäten': this.filteredActivities };

        timeline.innerHTML = Object.entries(groupedActivities).map(([group, activities]) => `
            <div class="activity-group">
                <div class="group-header">
                    <span class="group-title">${group}</span>
                    <span class="group-count">${activities.length}</span>
                </div>
                <div class="group-activities">
                    ${activities.slice(0, this.options.maxItems).map(activity => this.getActivityItemHTML(activity)).join('')}
                </div>
            </div>
        `).join('');
    }

    getActivityItemHTML(activity) {
        const timeAgo = this.getTimeAgo(activity.timestamp);
        const icon = this.getActivityIcon(activity.type);
        const color = this.getActivityColor(activity.type);
        
        return `
            <div class="activity-item" data-type="${activity.type}" data-id="${activity.id}">
                <div class="activity-indicator">
                    <div class="activity-dot" style="background-color: ${color}"></div>
                    <div class="activity-line"></div>
                </div>
                <div class="activity-content">
                    <div class="activity-icon" style="color: ${color}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-description">${activity.description}</div>
                        <div class="activity-metadata">
                            ${this.options.showTimestamps ? `<span class="activity-time">${timeAgo}</span>` : ''}
                            ${activity.entityName ? `<span class="activity-entity">${activity.entityName}</span>` : ''}
                        </div>
                    </div>
                    ${activity.actionable ? this.getActivityActionsHTML(activity) : ''}
                </div>
            </div>
        `;
    }

    getActivityActionsHTML(activity) {
        const actions = this.getAvailableActions(activity);
        
        if (actions.length === 0) return '';
        
        return `
            <div class="activity-actions">
                ${actions.map(action => `
                    <button class="action-btn ${action.type}" 
                            onclick="recentActivity.executeAction('${activity.id}', '${action.id}')"
                            title="${action.tooltip || action.label}">
                        <i class="fas ${action.icon}"></i>
                        <span>${action.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    getAvailableActions(activity) {
        const actions = [];
        
        switch (activity.type) {
            case 'application_created':
                actions.push({
                    id: 'edit',
                    label: 'Bearbeiten',
                    icon: 'fa-edit',
                    type: 'primary'
                });
                actions.push({
                    id: 'view',
                    label: 'Ansehen',
                    icon: 'fa-eye',
                    type: 'secondary'
                });
                break;
                
            case 'upload_failed':
                actions.push({
                    id: 'retry',
                    label: 'Wiederholen',
                    icon: 'fa-redo',
                    type: 'warning'
                });
                break;
                
            case 'interview_scheduled':
                actions.push({
                    id: 'prepare',
                    label: 'Vorbereiten',
                    icon: 'fa-graduation-cap',
                    type: 'success'
                });
                break;
        }
        
        return actions;
    }

    getEmptyStateHTML() {
        const emptyMessages = {
            all: {
                icon: 'fa-history',
                title: 'Keine Aktivitäten',
                description: 'Starten Sie mit einer Bewerbung um Aktivitäten zu sehen'
            },
            applications: {
                icon: 'fa-briefcase',
                title: 'Keine Bewerbungsaktivitäten',
                description: 'Erstellen Sie eine Bewerbung um hier Updates zu sehen'
            },
            uploads: {
                icon: 'fa-cloud-upload-alt',
                title: 'Keine Upload-Aktivitäten',
                description: 'Laden Sie Dokumente hoch um hier Updates zu sehen'
            },
            updates: {
                icon: 'fa-edit',
                title: 'Keine Updates',
                description: 'Bearbeiten Sie Bewerbungen um hier Änderungen zu sehen'
            }
        };
        
        const message = emptyMessages[this.currentFilter] || emptyMessages.all;
        
        return `
            <div class="activity-empty">
                <i class="fas ${message.icon}"></i>
                <h5>${message.title}</h5>
                <p>${message.description}</p>
            </div>
        `;
    }

    // 📊 Data Processing
    groupActivitiesByTime(activities) {
        const groups = {
            'Heute': [],
            'Gestern': [],
            'Diese Woche': [],
            'Letzte Woche': [],
            'Älter': []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
        const lastWeekStart = new Date(weekStart.getTime() - (7 * 24 * 60 * 60 * 1000));

        activities.forEach(activity => {
            const activityDate = new Date(activity.timestamp);
            
            if (activityDate >= today) {
                groups['Heute'].push(activity);
            } else if (activityDate >= yesterday) {
                groups['Gestern'].push(activity);
            } else if (activityDate >= weekStart) {
                groups['Diese Woche'].push(activity);
            } else if (activityDate >= lastWeekStart) {
                groups['Letzte Woche'].push(activity);
            } else {
                groups['Älter'].push(activity);
            }
        });

        // Remove empty groups
        Object.keys(groups).forEach(key => {
            if (groups[key].length === 0) {
                delete groups[key];
            }
        });

        return groups;
    }

    // 🎭 Event Handling
    handleApplicationEvent(event, data) {
        const activityMap = {
            'applicationCreated': {
                type: 'application_created',
                title: 'Neue Bewerbung erstellt',
                description: `Bewerbung bei ${data.company} für ${data.position}`,
                icon: 'fa-plus-circle',
                color: '#10b981',
                entityId: data.id,
                entityName: data.company,
                actionable: true
            },
            'applicationUpdated': {
                type: 'application_updated',
                title: 'Bewerbung aktualisiert',
                description: `Status geändert zu: ${this.getStatusText(data.status)}`,
                icon: 'fa-edit',
                color: '#3b82f6',
                entityId: data.id,
                entityName: data.company,
                actionable: true
            },
            'applicationDeleted': {
                type: 'application_deleted',
                title: 'Bewerbung gelöscht',
                description: `Bewerbung bei ${data.application?.company} entfernt`,
                icon: 'fa-trash',
                color: '#ef4444',
                entityId: data.id,
                actionable: false
            }
        };

        const activityTemplate = activityMap[event];
        if (activityTemplate) {
            const activity = {
                id: this.generateActivityId(),
                timestamp: new Date().toISOString(),
                ...activityTemplate
            };
            
            this.addActivity(activity);
        }
    }

    addActivity(activity) {
        // Add to beginning of array
        this.activities.unshift(activity);
        
        // Limit array size
        this.activities = this.activities.slice(0, 100);
        
        // Save to storage
        this.saveActivities();
        
        // Update display
        this.applyFilter();
        this.renderActivityItems();
        
        // Show notification for important events
        if (activity.type === 'application_created') {
            this.showNotification('Neue Bewerbung erstellt', 'success');
        }
    }

    // 🔍 Filtering
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.applyFilter();
        this.renderActivityItems();
    }

    applyFilter() {
        if (this.currentFilter === 'all') {
            this.filteredActivities = [...this.activities];
        } else {
            const filterMap = {
                applications: ['application_created', 'application_updated', 'application_deleted'],
                uploads: ['file_uploaded', 'upload_failed', 'upload_completed'],
                updates: ['application_updated', 'status_changed', 'note_added']
            };
            
            const allowedTypes = filterMap[this.currentFilter] || [];
            this.filteredActivities = this.activities.filter(activity => 
                allowedTypes.includes(activity.type)
            );
        }
    }

    // 🎬 Actions
    executeAction(activityId, actionId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        switch (actionId) {
            case 'edit':
                this.editApplication(activity.entityId);
                break;
            case 'view':
                this.viewApplication(activity.entityId);
                break;
            case 'retry':
                this.retryAction(activity);
                break;
            case 'prepare':
                this.prepareInterview(activity.entityId);
                break;
        }
    }

    editApplication(applicationId) {
        // Trigger edit modal
        const event = new CustomEvent('editApplication', {
            detail: { applicationId }
        });
        document.dispatchEvent(event);
    }

    viewApplication(applicationId) {
        // Trigger view modal
        const event = new CustomEvent('viewApplication', {
            detail: { applicationId }
        });
        document.dispatchEvent(event);
    }

    retryAction(activity) {
        // Implementation depends on activity type
        console.log(`Retrying action for activity: ${activity.id}`);
    }

    prepareInterview(applicationId) {
        // Open interview preparation
        const event = new CustomEvent('prepareInterview', {
            detail: { applicationId }
        });
        document.dispatchEvent(event);
    }

    showAllActivities() {
        // Open detailed activity view
        const event = new CustomEvent('showAllActivities');
        document.dispatchEvent(event);
    }

    // 🛠️ Utility Methods
    getActivityIcon(type) {
        const iconMap = {
            application_created: 'fa-plus-circle',
            application_updated: 'fa-edit',
            application_deleted: 'fa-trash',
            file_uploaded: 'fa-cloud-upload-alt',
            upload_failed: 'fa-exclamation-triangle',
            upload_completed: 'fa-check-circle',
            status_changed: 'fa-exchange-alt',
            interview_scheduled: 'fa-calendar-plus',
            note_added: 'fa-sticky-note'
        };
        return iconMap[type] || 'fa-info-circle';
    }

    getActivityColor(type) {
        const colorMap = {
            application_created: '#10b981',    // Green
            application_updated: '#3b82f6',    // Blue
            application_deleted: '#ef4444',    // Red
            file_uploaded: '#8b5cf6',         // Purple
            upload_failed: '#f59e0b',         // Orange
            upload_completed: '#10b981',      // Green
            status_changed: '#06b6d4',        // Cyan
            interview_scheduled: '#f59e0b',   // Orange
            note_added: '#6b7280'            // Gray
        };
        return colorMap[type] || '#6b7280';
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'Ausstehend',
            interview: 'Interview',
            offer: 'Zusage',
            rejected: 'Absage',
            withdrawn: 'Zurückgezogen'
        };
        return statusMap[status] || status;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Gerade eben';
        if (diffMins < 60) return `vor ${diffMins} Min.`;
        if (diffHours < 24) return `vor ${diffHours} Std.`;
        if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
        
        return time.toLocaleDateString('de-DE');
    }

    generateActivityId() {
        return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    setupEventListeners() {
        // Click on activity items
        this.container.addEventListener('click', (e) => {
            const activityItem = e.target.closest('.activity-item');
            if (activityItem && !e.target.closest('.activity-actions')) {
                this.handleActivityClick(activityItem);
            }
        });
    }

    handleActivityClick(activityItem) {
        const activityId = activityItem.dataset.id;
        const activity = this.activities.find(a => a.id === activityId);
        
        if (activity && activity.entityId) {
            // Navigate to related entity
            this.viewApplication(activity.entityId);
        }
    }

    startAutoRefresh() {
        if (this.options.autoRefresh) {
            this.refreshTimer = setInterval(() => {
                this.refresh();
            }, this.options.refreshInterval);
        }
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    async refresh() {
        await this.loadActivities();
        this.renderActivityItems();
    }

    // 💾 Persistence
    saveActivities() {
        try {
            const toSave = this.activities.slice(0, 50); // Keep last 50
            localStorage.setItem('application_activities', JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving activities:', error);
        }
    }

    // 🔔 Notifications
    showNotification(message, type = 'info') {
        if (this.options.dashboard?.showNotification) {
            this.options.dashboard.showNotification(message, type);
        }
    }

    // 🧹 Cleanup
    destroy() {
        this.stopAutoRefresh();
        this.activities = [];
        this.filteredActivities = [];
        this.container.innerHTML = '';
    }
}

// Global reference
window.recentActivity = null;
export function setGlobalRecentActivity(instance) {
    window.recentActivity = instance;
}
