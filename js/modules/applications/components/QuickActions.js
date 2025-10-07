// ⚡ Quick Actions Component - Intelligente Schnellaktionen mit KI-Integration
// Context-aware Actions, Smart Suggestions und One-Click Operations

export class QuickActions {
    constructor(applicationCore, options = {}) {
        this.applicationCore = applicationCore;
        this.options = {
            container: options.container,
            dashboard: options.dashboard,
            enableAIAssistant: options.enableAIAssistant !== false,
            enableSmartSuggestions: options.enableSmartSuggestions !== false,
            enableContextActions: options.enableContextActions !== false,
            maxRecentActions: options.maxRecentActions || 5,
            ...options
        };

        this.container = this.options.container;
        this.recentActions = this.loadRecentActions();
        this.contextActions = [];
        this.aiSuggestions = [];
        this.isInitialized = false;
    }

    async init() {
        try {
            await this.render();
            this.setupEventListeners();
            this.loadSmartSuggestions();
            
            this.isInitialized = true;
            console.log('✅ QuickActions initialized');
        } catch (error) {
            console.error('❌ QuickActions initialization failed:', error);
            throw error;
        }
    }

    async render() {
        this.container.innerHTML = this.getHTML();
        await this.updateContextActions();
    }

    getHTML() {
        return `
            <div class="quick-actions">
                <div class="actions-header">
                    <h3>⚡ Schnellaktionen</h3>
                    <button class="btn-icon" onclick="quickActions.refresh()" title="Aktualisieren">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>

                <!-- Primary Actions -->
                <div class="primary-actions">
                    <button class="action-btn primary" onclick="quickActions.createApplication()">
                        <div class="action-icon">
                            <i class="fas fa-plus-circle"></i>
                        </div>
                        <div class="action-content">
                            <div class="action-title">Neue Bewerbung</div>
                            <div class="action-subtitle">Bewerbung erstellen</div>
                        </div>
                    </button>
                    
                    <button class="action-btn upload" onclick="quickActions.uploadDocument()">
                        <div class="action-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="action-content">
                            <div class="action-title">Dokument hochladen</div>
                            <div class="action-subtitle">Lebenslauf, Anschreiben</div>
                        </div>
                    </button>
                </div>

                <!-- Smart Suggestions -->
                <div class="smart-suggestions" id="smartSuggestions" style="display: none;">
                    <div class="suggestions-header">
                        <h4>🧠 KI-Empfehlungen</h4>
                    </div>
                    <div class="suggestions-list" id="suggestionsList">
                        <!-- Dynamic suggestions will be inserted here -->
                    </div>
                </div>

                <!-- Context Actions -->
                <div class="context-actions" id="contextActions">
                    <div class="context-header">
                        <h4>🎯 Empfohlene Aktionen</h4>
                    </div>
                    <div class="context-list" id="contextList">
                        <div class="loading-suggestions">
                            <i class="fas fa-brain fa-pulse"></i>
                            <span>Intelligente Vorschläge werden geladen...</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="quick-stats">
                    <div class="stats-header">
                        <h4>📊 Auf einen Blick</h4>
                    </div>
                    <div class="mini-stats">
                        <div class="mini-stat">
                            <div class="stat-value" id="todayApplications">0</div>
                            <div class="stat-label">Heute</div>
                        </div>
                        <div class="mini-stat">
                            <div class="stat-value" id="weekApplications">0</div>
                            <div class="stat-label">Diese Woche</div>
                        </div>
                        <div class="mini-stat">
                            <div class="stat-value" id="pendingCount">0</div>
                            <div class="stat-label">Ausstehend</div>
                        </div>
                        <div class="mini-stat">
                            <div class="stat-value" id="successRate">0%</div>
                            <div class="stat-label">Erfolgsrate</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Actions -->
                <div class="recent-actions">
                    <div class="recent-header">
                        <h4>🕒 Kürzliche Aktionen</h4>
                        <button class="btn-clear" onclick="quickActions.clearHistory()" title="Verlauf löschen">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="recent-list" id="recentList">
                        ${this.getRecentActionsHTML()}
                    </div>
                </div>

                <!-- Quick Export -->
                <div class="quick-export">
                    <button class="export-btn" onclick="quickActions.quickExport('csv')">
                        <i class="fas fa-file-csv"></i>
                        <span>CSV Export</span>
                    </button>
                    <button class="export-btn" onclick="quickActions.quickExport('pdf')">
                        <i class="fas fa-file-pdf"></i>
                        <span>PDF Report</span>
                    </button>
                </div>
            </div>
        `;
    }

    getRecentActionsHTML() {
        if (this.recentActions.length === 0) {
            return '<div class="no-recent">Noch keine Aktionen</div>';
        }

        return this.recentActions.map(action => `
            <div class="recent-item" onclick="quickActions.repeatAction('${action.id}')">
                <div class="recent-icon">
                    <i class="fas ${action.icon}"></i>
                </div>
                <div class="recent-content">
                    <div class="recent-title">${action.title}</div>
                    <div class="recent-time">${this.formatRelativeTime(action.timestamp)}</div>
                </div>
                <button class="recent-repeat" title="Wiederholen">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
        `).join('');
    }

    async updateContextActions() {
        const statistics = this.applicationCore.getStatistics();
        const applications = this.applicationCore.getAllApplications();
        
        // Generate intelligent context actions
        this.contextActions = [];

        // Based on statistics
        if (statistics.pending > 0) {
            this.contextActions.push({
                id: 'follow-up-pending',
                icon: 'fa-clock',
                title: 'Nachfassen bei ausstehenden Bewerbungen',
                description: `${statistics.pending} Bewerbungen warten auf Antwort`,
                action: () => this.showPendingApplications(),
                priority: 'high'
            });
        }

        if (statistics.interview > 0) {
            this.contextActions.push({
                id: 'prepare-interviews',
                icon: 'fa-users',
                title: 'Interview-Vorbereitung',
                description: `${statistics.interview} Interviews vorbereiten`,
                action: () => this.prepareInterviews(),
                priority: 'urgent'
            });
        }

        // Time-based suggestions
        const now = new Date();
        const todayApplications = applications.filter(app => {
            const appDate = new Date(app.createdAt);
            return appDate.toDateString() === now.toDateString();
        });

        if (todayApplications.length === 0 && now.getHours() >= 9 && now.getHours() <= 17) {
            this.contextActions.push({
                id: 'daily-application',
                icon: 'fa-plus',
                title: 'Tägliches Bewerbungsziel',
                description: 'Heute noch keine Bewerbung versendet',
                action: () => this.createApplication(),
                priority: 'medium'
            });
        }

        // AI-powered suggestions
        if (this.options.enableAIAssistant) {
            await this.generateAISuggestions();
        }

        this.renderContextActions();
        this.updateQuickStats();
    }

    async generateAISuggestions() {
        const applications = this.applicationCore.getAllApplications();
        const statistics = this.applicationCore.getStatistics();
        
        // Analyze patterns and generate suggestions
        const suggestions = [];

        // Success rate analysis
        if (statistics.successRate < 20 && applications.length > 5) {
            suggestions.push({
                id: 'optimize-strategy',
                icon: 'fa-chart-line',
                title: 'Bewerbungsstrategie optimieren',
                description: 'Erfolgsrate unter 20% - Strategie überdenken',
                action: () => this.showStrategyOptimizer(),
                aiGenerated: true,
                priority: 'high'
            });
        }

        // Response time patterns
        const avgResponseTime = statistics.averageResponseTime;
        if (avgResponseTime > 14) {
            suggestions.push({
                id: 'follow-up-strategy',
                icon: 'fa-bell',
                title: 'Nachfass-Strategie entwickeln',
                description: `Ø ${avgResponseTime} Tage Antwortzeit - Nachfassen könnte helfen`,
                action: () => this.setupFollowUpReminders(),
                aiGenerated: true,
                priority: 'medium'
            });
        }

        // Industry analysis
        const topCompanies = statistics.topCompanies;
        if (topCompanies.length > 3) {
            const diversityScore = this.calculateIndustryDiversity(applications);
            if (diversityScore < 0.5) {
                suggestions.push({
                    id: 'diversify-applications',
                    icon: 'fa-expand-arrows-alt',
                    title: 'Bewerbungen diversifizieren',
                    description: 'Verschiedene Branchen ausprobieren',
                    action: () => this.showIndustryAnalysis(),
                    aiGenerated: true,
                    priority: 'low'
                });
            }
        }

        this.aiSuggestions = suggestions;
        this.contextActions.push(...suggestions);
    }

    renderContextActions() {
        const contextList = this.container.querySelector('#contextList');
        
        if (this.contextActions.length === 0) {
            contextList.innerHTML = '<div class="no-context">Alle Aktionen auf dem neuesten Stand! ✅</div>';
            return;
        }

        // Sort by priority
        const sortedActions = this.contextActions.sort((a, b) => {
            const priorities = { urgent: 3, high: 2, medium: 1, low: 0 };
            return priorities[b.priority] - priorities[a.priority];
        });

        contextList.innerHTML = sortedActions.map(action => `
            <div class="context-item ${action.aiGenerated ? 'ai-generated' : ''} priority-${action.priority}" 
                 onclick="quickActions.executeContextAction('${action.id}')">
                <div class="context-icon">
                    <i class="fas ${action.icon}"></i>
                    ${action.aiGenerated ? '<div class="ai-badge">AI</div>' : ''}
                </div>
                <div class="context-content">
                    <div class="context-title">${action.title}</div>
                    <div class="context-description">${action.description}</div>
                </div>
                <div class="context-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `).join('');
    }

    updateQuickStats() {
        const statistics = this.applicationCore.getStatistics();
        const applications = this.applicationCore.getAllApplications();
        
        // Today's applications
        const today = new Date();
        const todayApps = applications.filter(app => {
            const appDate = new Date(app.createdAt);
            return appDate.toDateString() === today.toDateString();
        }).length;

        // This week's applications  
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekApps = applications.filter(app => {
            const appDate = new Date(app.createdAt);
            return appDate >= weekStart;
        }).length;

        // Update display
        this.updateStatValue('todayApplications', todayApps);
        this.updateStatValue('weekApplications', weekApps);
        this.updateStatValue('pendingCount', statistics.pending);
        this.updateStatValue('successRate', `${statistics.successRate}%`);
    }

    updateStatValue(elementId, value) {
        const element = this.container.querySelector(`#${elementId}`);
        if (element && element.textContent !== value.toString()) {
            // Animate value change
            element.style.transform = 'scale(1.1)';
            element.textContent = value;
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    setupEventListeners() {
        // File drag & drop for upload area
        const uploadBtn = this.container.querySelector('.action-btn.upload');
        if (uploadBtn) {
            this.setupDragAndDrop(uploadBtn);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.createApplication();
                        break;
                    case 'u':
                        e.preventDefault();
                        this.uploadDocument();
                        break;
                }
            }
        });
    }

    setupDragAndDrop(element) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        element.addEventListener('dragenter', () => {
            element.classList.add('drag-active');
        });

        element.addEventListener('dragleave', (e) => {
            if (!element.contains(e.relatedTarget)) {
                element.classList.remove('drag-active');
            }
        });

        element.addEventListener('drop', async (e) => {
            element.classList.remove('drag-active');
            const files = Array.from(e.dataTransfer.files);
            
            for (const file of files) {
                await this.uploadFile(file);
            }
        });
    }

    // 🎯 Action Methods
    async createApplication() {
        this.recordAction('create_application', 'Bewerbung erstellen', 'fa-plus');
        
        // This would open the create application modal
        const event = new CustomEvent('openCreateModal', {
            detail: { source: 'quickActions' }
        });
        document.dispatchEvent(event);
    }

    async uploadDocument() {
        this.recordAction('upload_document', 'Dokument hochladen', 'fa-upload');
        
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            for (const file of files) {
                await this.uploadFile(file);
            }
        };
        
        input.click();
    }

    async uploadFile(file) {
        try {
            // Use the upload manager from the application manager
            const result = await window.applicationManager.uploadFile(file, 'documents');
            
            this.showSuccess(`Datei "${file.name}" erfolgreich hochgeladen`);
            this.recordAction('file_uploaded', `${file.name} hochgeladen`, 'fa-check');
            
            return result;
        } catch (error) {
            console.error('Upload error:', error);
            this.showError(`Upload fehlgeschlagen: ${error.message}`);
        }
    }

    async quickExport(format) {
        this.recordAction(`export_${format}`, `${format.toUpperCase()} Export`, 'fa-download');
        
        try {
            await window.applicationManager.exportApplications(format);
            this.showSuccess(`${format.toUpperCase()}-Export erfolgreich`);
        } catch (error) {
            console.error('Export error:', error);
            this.showError(`Export fehlgeschlagen: ${error.message}`);
        }
    }

    // 🧠 Smart Suggestions
    async loadSmartSuggestions() {
        if (!this.options.enableSmartSuggestions) return;
        
        const statistics = this.applicationCore.getStatistics();
        const applications = this.applicationCore.getAllApplications();
        
        const suggestions = [];
        
        // Time-based suggestions
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 11) {
            suggestions.push({
                id: 'morning-routine',
                title: 'Morgen-Routine starten',
                description: 'Perfekte Zeit für Bewerbungen (9-11 Uhr)',
                action: () => this.createApplication(),
                icon: 'fa-sun'
            });
        }

        // Pattern-based suggestions
        if (statistics.successRate > 30 && applications.length > 10) {
            suggestions.push({
                id: 'leverage-success',
                title: 'Erfolg verstärken',
                description: 'Ihre Strategie funktioniert - mehr davon!',
                action: () => this.analyzePatternsAndSuggest(),
                icon: 'fa-chart-line'
            });
        }

        // Weekly planning
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 1) { // Monday
            suggestions.push({
                id: 'weekly-planning',
                title: 'Wochenplanung',
                description: 'Planen Sie Ihre Bewerbungen für diese Woche',
                action: () => this.openWeeklyPlanner(),
                icon: 'fa-calendar-week'
            });
        }

        if (suggestions.length > 0) {
            const suggestionsContainer = this.container.querySelector('#smartSuggestions');
            const suggestionsList = this.container.querySelector('#suggestionsList');
            
            suggestionsList.innerHTML = suggestions.map(suggestion => `
                <div class="suggestion-item" onclick="quickActions.executeSuggestion('${suggestion.id}')">
                    <div class="suggestion-icon">
                        <i class="fas ${suggestion.icon}"></i>
                    </div>
                    <div class="suggestion-content">
                        <div class="suggestion-title">${suggestion.title}</div>
                        <div class="suggestion-description">${suggestion.description}</div>
                    </div>
                </div>
            `).join('');
            
            suggestionsContainer.style.display = 'block';
        }
    }

    // 🎬 Action Execution
    executeContextAction(actionId) {
        const action = this.contextActions.find(a => a.id === actionId);
        if (action && action.action) {
            action.action();
            this.recordAction(actionId, action.title, action.icon);
        }
    }

    executeSuggestion(suggestionId) {
        const suggestion = this.aiSuggestions.find(s => s.id === suggestionId);
        if (suggestion && suggestion.action) {
            suggestion.action();
            this.recordAction(suggestionId, suggestion.title, suggestion.icon);
        }
    }

    repeatAction(actionId) {
        const action = this.recentActions.find(a => a.id === actionId);
        if (action && action.repeatAction) {
            action.repeatAction();
        }
    }

    // 📊 Analytics & Tracking
    recordAction(actionId, title, icon) {
        const action = {
            id: actionId,
            title,
            icon,
            timestamp: new Date().toISOString(),
            count: 1
        };

        // Update existing or add new
        const existingIndex = this.recentActions.findIndex(a => a.id === actionId);
        if (existingIndex >= 0) {
            this.recentActions[existingIndex].count++;
            this.recentActions[existingIndex].timestamp = action.timestamp;
        } else {
            this.recentActions.unshift(action);
        }

        // Keep only recent actions
        this.recentActions = this.recentActions.slice(0, this.options.maxRecentActions);
        
        this.saveRecentActions();
        this.updateRecentActionsDisplay();
        
        // Track in core analytics
        if (this.applicationCore.trackEvent) {
            this.applicationCore.trackEvent('quick_action', {
                actionId,
                title,
                source: 'quickActions'
            });
        }
    }

    updateRecentActionsDisplay() {
        const recentList = this.container.querySelector('#recentList');
        if (recentList) {
            recentList.innerHTML = this.getRecentActionsHTML();
        }
    }

    clearHistory() {
        this.recentActions = [];
        this.saveRecentActions();
        this.updateRecentActionsDisplay();
    }

    // 💾 Persistence
    loadRecentActions() {
        try {
            const stored = localStorage.getItem('quickActions_recent');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recent actions:', error);
            return [];
        }
    }

    saveRecentActions() {
        try {
            localStorage.setItem('quickActions_recent', JSON.stringify(this.recentActions));
        } catch (error) {
            console.error('Error saving recent actions:', error);
        }
    }

    // 🛠️ Utility Methods
    formatRelativeTime(timestamp) {
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

    calculateIndustryDiversity(applications) {
        // Simple diversity calculation based on company domains
        const domains = new Set();
        applications.forEach(app => {
            // Extract potential domain from company name or detect industry
            const company = app.company.toLowerCase();
            if (company.includes('tech') || company.includes('software')) domains.add('tech');
            else if (company.includes('bank') || company.includes('finance')) domains.add('finance');
            else if (company.includes('health') || company.includes('pharma')) domains.add('healthcare');
            else domains.add('other');
        });
        
        return domains.size / Math.max(applications.length, 1);
    }

    // 🎨 UI Feedback
    showSuccess(message) {
        if (this.options.dashboard?.showNotification) {
            this.options.dashboard.showNotification(message, 'success');
        } else {
            console.log(`✅ ${message}`);
        }
    }

    showError(message) {
        if (this.options.dashboard?.showNotification) {
            this.options.dashboard.showNotification(message, 'error');
        } else {
            console.error(`❌ ${message}`);
        }
    }

    // 🔄 Refresh
    async refresh() {
        await this.updateContextActions();
        this.updateQuickStats();
    }

    // 🧹 Cleanup
    destroy() {
        this.recentActions = [];
        this.contextActions = [];
        this.aiSuggestions = [];
        this.container.innerHTML = '';
    }
}

// Make globally available
window.quickActions = null;
export function setGlobalQuickActions(instance) {
    window.quickActions = instance;
}
