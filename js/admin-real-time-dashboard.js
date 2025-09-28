// Real-time Admin Dashboard - Live System Monitoring
// Erweitert das Admin Panel um Live-Metriken und Real-time Updates

class AdminRealTimeDashboard {
    constructor() {
        this.isActive = false;
        this.updateInterval = null;
        this.metricsHistory = [];
        this.alertThresholds = {
            errorRate: 5, // %
            responseTime: 1000, // ms
            memoryUsage: 80, // %
            diskUsage: 85 // %
        };
        
        this.init();
    }
    
    async init() {
        console.log('📊 Real-time Admin Dashboard initializing...');
        
        // Wait for admin auth
        if (!window.GlobalAuth?.isAuthenticated()) {
            setTimeout(() => this.init(), 2000);
            return;
        }
        
        // Setup real-time monitoring
        this.startRealTimeMonitoring();
        
        // Setup dashboard enhancements
        this.enhanceAdminDashboard();
        
        // Setup alert system
        this.setupAlertSystem();
        
        console.log('✅ Real-time Admin Dashboard ready');
    }
    
    startRealTimeMonitoring() {
        this.isActive = true;
        
        // Initial load
        this.updateMetrics();
        
        // Update every 30 seconds
        this.updateInterval = setInterval(() => {
            if (document.visibilityState === 'visible' && this.isActive) {
                this.updateMetrics();
            }
        }, 30000);
        
        // Update when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isActive) {
                this.updateMetrics();
            }
        });
    }
    
    async updateMetrics() {
        try {
            console.log('📊 Updating real-time metrics...');
            
            // Simulate API calls to get real metrics
            // In production, these would call your AWS APIs
            const metrics = await this.gatherSystemMetrics();
            
            // Update live counters
            this.updateLiveCounters(metrics);
            
            // Update health indicators
            this.updateHealthIndicators(metrics);
            
            // Check for alerts
            this.checkAlerts(metrics);
            
            // Store metrics history
            this.storeMetricsHistory(metrics);
            
        } catch (error) {
            console.error('❌ Failed to update metrics:', error);
            this.showSystemAlert('Metrics Update Failed', error.message, 'error');
        }
    }
    
    async gatherSystemMetrics() {
        // Simulate gathering metrics from various sources
        const baseMetrics = {
            timestamp: new Date().toISOString(),
            users: {
                total: Math.floor(Math.random() * 100) + 50,
                active: Math.floor(Math.random() * 25) + 10,
                online: Math.floor(Math.random() * 10) + 2
            },
            system: {
                responseTime: Math.floor(Math.random() * 300) + 150,
                errorRate: Math.random() * 2,
                uptime: 99.9,
                memoryUsage: Math.floor(Math.random() * 20) + 60
            },
            activity: {
                apiCalls24h: Math.floor(Math.random() * 1000) + 500,
                methodsCompleted: Math.floor(Math.random() * 50) + 25,
                documentsUploaded: Math.floor(Math.random() * 20) + 5,
                loginAttempts: Math.floor(Math.random() * 30) + 10
            },
            storage: {
                s3Usage: (Math.random() * 5 + 1).toFixed(1),
                dynamodbReads: Math.floor(Math.random() * 1000) + 200,
                dynamodbWrites: Math.floor(Math.random() * 500) + 100
            },
            costs: {
                currentMonth: (Math.random() * 20 + 5).toFixed(2),
                projectedMonth: (Math.random() * 40 + 20).toFixed(2),
                freeTrierRemaining: Math.floor(Math.random() * 30) + 70
            }
        };
        
        // Add some real data if available
        if (window.AdminUserUI?.users) {
            baseMetrics.users.total = window.AdminUserUI.users.length;
            baseMetrics.users.active = window.AdminUserUI.users.filter(u => 
                this.calculateDaysSince(u.profile?.lastLogin) <= 7
            ).length;
        }
        
        return baseMetrics;
    }
    
    updateLiveCounters(metrics) {
        // Update system health counters
        this.updateCounter('active-users-live', metrics.users.online);
        this.updateCounter('api-calls-live', metrics.activity.apiCalls24h);
        this.updateCounter('storage-used-live', metrics.storage.s3Usage + ' GB');
        this.updateCounter('methods-completed-live', metrics.activity.methodsCompleted);
        
        // Update user management stats if available
        if (window.AdminUserUI) {
            this.updateCounter('total-users-stat', metrics.users.total);
            this.updateCounter('active-users-stat', metrics.users.active);
            this.updateCounter('power-users-stat', Math.floor(metrics.users.total * 0.15));
            this.updateCounter('risk-users-stat', Math.floor(metrics.users.total * 0.08));
        }
    }
    
    updateCounter(elementId, value) {
        const element = document.getElementById(elementId);
        if (element && element.textContent != value) {
            // Animate counter change
            element.style.transform = 'scale(1.1)';
            element.style.color = '#10b981';
            element.textContent = value;
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 200);
        }
    }
    
    updateHealthIndicators(metrics) {
        // Update AWS health status indicators
        const indicators = [
            { id: 'cognito-health', status: metrics.system.uptime > 99 ? 'healthy' : 'degraded' },
            { id: 's3-health', status: metrics.storage.s3Usage < 10 ? 'healthy' : 'warning' },
            { id: 'dynamodb-health', status: metrics.system.responseTime < 500 ? 'healthy' : 'warning' },
            { id: 'lambda-health', status: metrics.system.errorRate < 2 ? 'healthy' : 'error' }
        ];
        
        indicators.forEach(indicator => {
            const element = document.getElementById(indicator.id);
            if (element) {
                this.updateHealthStatus(element, indicator.status);
            }
        });
    }
    
    updateHealthStatus(element, status) {
        const statusConfig = {
            healthy: { icon: '✅', text: 'Online', color: '#10b981' },
            warning: { icon: '⚠️', text: 'Warning', color: '#f59e0b' },
            error: { icon: '❌', text: 'Error', color: '#ef4444' },
            degraded: { icon: '🟡', text: 'Degraded', color: '#f59e0b' }
        };
        
        const config = statusConfig[status] || statusConfig.healthy;
        element.innerHTML = `<span style="color: ${config.color}; font-weight: 600;">${config.icon} ${config.text}</span>`;
    }
    
    checkAlerts(metrics) {
        const alerts = [];
        
        // Check error rate
        if (metrics.system.errorRate > this.alertThresholds.errorRate) {
            alerts.push({
                level: 'error',
                message: `High error rate: ${metrics.system.errorRate.toFixed(1)}%`,
                action: 'Check CloudWatch logs'
            });
        }
        
        // Check response time
        if (metrics.system.responseTime > this.alertThresholds.responseTime) {
            alerts.push({
                level: 'warning',
                message: `Slow response time: ${metrics.system.responseTime}ms`,
                action: 'Check Lambda performance'
            });
        }
        
        // Check memory usage
        if (metrics.system.memoryUsage > this.alertThresholds.memoryUsage) {
            alerts.push({
                level: 'warning',
                message: `High memory usage: ${metrics.system.memoryUsage}%`,
                action: 'Consider scaling up'
            });
        }
        
        // Show alerts
        alerts.forEach(alert => {
            this.showSystemAlert(alert.message, alert.action, alert.level);
        });
    }
    
    enhanceAdminDashboard() {
        // Add real-time indicators to existing elements
        this.addRealTimeIndicators();
        
        // Add performance widgets
        this.addPerformanceWidgets();
        
        // Add user activity feed
        this.addUserActivityFeed();
        
        // Add system shortcuts
        this.addSystemShortcuts();
    }
    
    addRealTimeIndicators() {
        // Add pulsing indicators to show live updates
        const liveElements = document.querySelectorAll('[id$="-live"]');
        liveElements.forEach(element => {
            if (!element.querySelector('.live-indicator')) {
                const indicator = document.createElement('span');
                indicator.className = 'live-indicator';
                indicator.style.cssText = `
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    margin-right: 0.5rem;
                    animation: pulse 2s infinite;
                `;
                element.parentNode.insertBefore(indicator, element);
            }
        });
        
        // Add pulse animation if not exists
        if (!document.getElementById('live-indicators-style')) {
            const style = document.createElement('style');
            style.id = 'live-indicators-style';
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }
                
                .live-indicator {
                    animation: pulse 2s infinite;
                }
                
                .metric-card {
                    transition: all 0.3s ease;
                }
                
                .metric-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                }
                
                .alert-banner {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slideInRight 0.3s ease;
                }
                
                .alert-error { background: #ef4444; }
                .alert-warning { background: #f59e0b; }
                .alert-info { background: #3b82f6; }
                .alert-success { background: #10b981; }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    border-bottom: 1px solid #f3f4f6;
                    transition: background 0.2s ease;
                }
                
                .activity-item:hover {
                    background: #f8fafc;
                }
                
                .activity-item:last-child {
                    border-bottom: none;
                }
                
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addPerformanceWidgets() {
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) return;
        
        // Add performance overview widget
        const performanceWidget = document.createElement('div');
        performanceWidget.id = 'performance-overview-widget';
        performanceWidget.innerHTML = `
            <div style="
                background: white; border-radius: 16px; padding: 2rem;
                margin: 2rem 0; border: 1px solid #e5e7eb;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            ">
                <h3 style="margin: 0 0 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-chart-line" style="color: #8b5cf6;"></i>
                    Performance Dashboard
                    <span class="live-indicator"></span>
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                    <div class="metric-card" style="
                        background: linear-gradient(135deg, #60a5fa, #3b82f6);
                        color: white; padding: 1.5rem; border-radius: 12px; text-align: center;
                    ">
                        <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">
                            <i class="fas fa-clock"></i> Avg Response Time
                        </div>
                        <div style="font-size: 2rem; font-weight: bold;" id="avg-response-time">-</div>
                        <div style="font-size: 0.75rem; opacity: 0.8;" id="response-time-trend">-</div>
                    </div>
                    
                    <div class="metric-card" style="
                        background: linear-gradient(135deg, #34d399, #10b981);
                        color: white; padding: 1.5rem; border-radius: 12px; text-align: center;
                    ">
                        <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">
                            <i class="fas fa-check-circle"></i> Success Rate
                        </div>
                        <div style="font-size: 2rem; font-weight: bold;" id="success-rate">-</div>
                        <div style="font-size: 0.75rem; opacity: 0.8;" id="success-rate-trend">-</div>
                    </div>
                    
                    <div class="metric-card" style="
                        background: linear-gradient(135deg, #fbbf24, #f59e0b);
                        color: white; padding: 1.5rem; border-radius: 12px; text-align: center;
                    ">
                        <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">
                            <i class="fas fa-memory"></i> Memory Usage
                        </div>
                        <div style="font-size: 2rem; font-weight: bold;" id="memory-usage">-</div>
                        <div style="font-size: 0.75rem; opacity: 0.8;" id="memory-trend">-</div>
                    </div>
                    
                    <div class="metric-card" style="
                        background: linear-gradient(135deg, #a78bfa, #8b5cf6);
                        color: white; padding: 1.5rem; border-radius: 12px; text-align: center;
                    ">
                        <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">
                            <i class="fas fa-users"></i> Active Sessions
                        </div>
                        <div style="font-size: 2rem; font-weight: bold;" id="active-sessions">-</div>
                        <div style="font-size: 0.75rem; opacity: 0.8;" id="sessions-trend">-</div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="window.RealTimeDashboard.refreshMetrics()" style="
                        background: #6366f1; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;
                        font-weight: 500; margin-right: 1rem;
                    ">
                        <i class="fas fa-sync"></i> Jetzt aktualisieren
                    </button>
                    <button onclick="window.RealTimeDashboard.toggleAutoUpdate()" style="
                        background: #059669; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;
                        font-weight: 500;
                    ">
                        <i class="fas fa-pause" id="auto-update-icon"></i> 
                        <span id="auto-update-text">Auto-Update pausieren</span>
                    </button>
                </div>
            </div>
        `;
        
        // Insert at top of dashboard
        const firstChild = dashboard.firstElementChild;
        dashboard.insertBefore(performanceWidget, firstChild);
    }
    
    addUserActivityFeed() {
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) return;
        
        const activityFeed = document.createElement('div');
        activityFeed.id = 'user-activity-feed';
        activityFeed.innerHTML = `
            <div style="
                background: white; border-radius: 16px; padding: 2rem;
                margin: 2rem 0; border: 1px solid #e5e7eb;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            ">
                <h3 style="margin: 0 0 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-stream" style="color: #059669;"></i>
                    Live User Activity Feed
                    <span class="live-indicator"></span>
                </h3>
                
                <div id="activity-feed-container" style="
                    background: #f9fafb; border-radius: 8px; 
                    max-height: 400px; overflow-y: auto;
                ">
                    <!-- Activity items will be populated here -->
                </div>
                
                <div style="margin-top: 1rem; text-align: center;">
                    <button onclick="window.RealTimeDashboard.loadMoreActivity()" style="
                        background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;
                        padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
                        font-size: 0.875rem;
                    ">
                        <i class="fas fa-chevron-down"></i> Mehr laden
                    </button>
                    <button onclick="window.RealTimeDashboard.clearActivityFeed()" style="
                        background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;
                        padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
                        font-size: 0.875rem; margin-left: 0.5rem;
                    ">
                        <i class="fas fa-trash"></i> Leeren
                    </button>
                </div>
            </div>
        `;
        
        dashboard.appendChild(activityFeed);
        
        // Initialize with sample activities
        this.updateActivityFeed();
    }
    
    addSystemShortcuts() {
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) return;
        
        const shortcuts = document.createElement('div');
        shortcuts.id = 'admin-system-shortcuts';
        shortcuts.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e293b, #334155);
                color: white; padding: 2rem; border-radius: 16px;
                margin: 2rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            ">
                <h3 style="margin: 0 0 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-rocket" style="color: #60a5fa;"></i>
                    System Management Shortcuts
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div class="shortcut-group">
                        <h4 style="margin: 0 0 1rem; color: #94a3b8; font-size: 0.875rem; text-transform: uppercase;">
                            🔐 User Management
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button onclick="document.querySelector('[data-section=\"user-management\"]').click()" class="shortcut-btn">
                                <i class="fas fa-users"></i> User Overview
                            </button>
                            <button onclick="window.AdminUserUI?.showCreateUserModal()" class="shortcut-btn">
                                <i class="fas fa-user-plus"></i> Create User
                            </button>
                            <button onclick="window.AdminUserUI?.exportUserData()" class="shortcut-btn">
                                <i class="fas fa-download"></i> Export Users
                            </button>
                        </div>
                    </div>
                    
                    <div class="shortcut-group">
                        <h4 style="margin: 0 0 1rem; color: #94a3b8; font-size: 0.875rem; text-transform: uppercase;">
                            📊 System Health
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button onclick="document.querySelector('[data-section=\"system-health\"]').click()" class="shortcut-btn">
                                <i class="fas fa-heartbeat"></i> Health Dashboard
                            </button>
                            <button onclick="window.open('./complete-system-test.html', '_blank')" class="shortcut-btn">
                                <i class="fas fa-flask"></i> Run System Test
                            </button>
                            <button onclick="window.open('https://console.aws.amazon.com/cloudwatch', '_blank')" class="shortcut-btn">
                                <i class="fas fa-chart-bar"></i> CloudWatch
                            </button>
                        </div>
                    </div>
                    
                    <div class="shortcut-group">
                        <h4 style="margin: 0 0 1rem; color: #94a3b8; font-size: 0.875rem; text-transform: uppercase;">
                            🚀 Quick Actions
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button onclick="window.RealTimeDashboard.refreshAllMetrics()" class="shortcut-btn">
                                <i class="fas fa-sync"></i> Refresh All Data
                            </button>
                            <button onclick="window.RealTimeDashboard.downloadSystemReport()" class="shortcut-btn">
                                <i class="fas fa-file-alt"></i> System Report
                            </button>
                            <button onclick="window.RealTimeDashboard.toggleMaintenanceMode()" class="shortcut-btn">
                                <i class="fas fa-tools"></i> Maintenance Mode
                            </button>
                        </div>
                    </div>
                </div>
                
                <style>
                    .shortcut-btn {
                        background: rgba(255,255,255,0.1);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.2);
                        padding: 0.75rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        text-align: left;
                        font-size: 0.875rem;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    }
                    
                    .shortcut-btn:hover {
                        background: rgba(255,255,255,0.2);
                        transform: translateX(4px);
                    }
                    
                    .shortcut-group {
                        background: rgba(255,255,255,0.05);
                        padding: 1rem;
                        border-radius: 8px;
                        border: 1px solid rgba(255,255,255,0.1);
                    }
                </style>
            </div>
        `;
        
        dashboard.appendChild(shortcuts);
    }
    
    updateActivityFeed(activities = null) {
        const container = document.getElementById('activity-feed-container');
        if (!container) return;
        
        // Generate sample activities if none provided
        if (!activities) {
            activities = this.generateSampleActivities();
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="user-avatar">
                    ${activity.userEmail ? activity.userEmail[0].toUpperCase() : '?'}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #1f2937; margin-bottom: 0.25rem;">
                        ${activity.action}
                    </div>
                    <div style="font-size: 0.875rem; color: #6b7280;">
                        ${activity.userEmail || 'Anonymer Benutzer'} • ${this.formatTimeAgo(activity.timestamp)}
                    </div>
                </div>
                <div style="color: #6b7280; font-size: 0.75rem;">
                    ${this.getActivityIcon(activity.type)}
                </div>
            </div>
        `).join('');
    }
    
    generateSampleActivities() {
        const actions = [
            { type: 'login', action: 'Benutzer angemeldet', userEmail: 'test@example.com' },
            { type: 'method', action: 'Johari-Window abgeschlossen', userEmail: 'user@test.de' },
            { type: 'upload', action: 'Dokument hochgeladen', userEmail: 'manuel@test.com' },
            { type: 'profile', action: 'Profil aktualisiert', userEmail: 'admin@test.de' },
            { type: 'method', action: 'SWOT-Analyse gestartet', userEmail: 'new@user.com' }
        ];
        
        return actions.map((activity, index) => ({
            ...activity,
            timestamp: new Date(Date.now() - index * 300000).toISOString() // 5 min intervals
        }));
    }
    
    getActivityIcon(type) {
        const icons = {
            login: '🔓',
            logout: '🔒',
            method: '🧠',
            upload: '📁',
            profile: '👤',
            admin: '⚙️'
        };
        return icons[type] || '📋';
    }
    
    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'gerade eben';
        if (diffMins < 60) return `vor ${diffMins} Min`;
        if (diffHours < 24) return `vor ${diffHours} Std`;
        if (diffDays < 7) return `vor ${diffDays} Tagen`;
        return time.toLocaleDateString('de-DE');
    }
    
    updateLiveCounters(metrics) {
        this.updateCounter('avg-response-time', metrics.system.responseTime + 'ms');
        this.updateCounter('success-rate', (100 - metrics.system.errorRate).toFixed(1) + '%');
        this.updateCounter('memory-usage', metrics.system.memoryUsage + '%');
        this.updateCounter('active-sessions', metrics.users.online);
        
        // Update trends
        this.updateTrend('response-time-trend', metrics.system.responseTime, 200);
        this.updateTrend('success-rate-trend', 100 - metrics.system.errorRate, 98);
        this.updateTrend('memory-trend', metrics.system.memoryUsage, 70);
        this.updateTrend('sessions-trend', metrics.users.online, 5);
    }
    
    updateTrend(elementId, current, baseline) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const diff = current - baseline;
        const percentage = ((diff / baseline) * 100).toFixed(1);
        
        if (Math.abs(diff) < baseline * 0.05) {
            element.innerHTML = '📊 Stabil';
            element.style.color = 'rgba(255,255,255,0.8)';
        } else if (diff > 0) {
            element.innerHTML = `📈 +${percentage}%`;
            element.style.color = current > baseline * 1.2 ? '#fca5a5' : '#86efac';
        } else {
            element.innerHTML = `📉 ${percentage}%`;
            element.style.color = '#86efac';
        }
    }
    
    setupAlertSystem() {
        // Create alert container
        if (!document.getElementById('admin-alert-container')) {
            const alertContainer = document.createElement('div');
            alertContainer.id = 'admin-alert-container';
            alertContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(alertContainer);
        }
    }
    
    showSystemAlert(title, message, level = 'info') {
        const alertContainer = document.getElementById('admin-alert-container');
        if (!alertContainer) return;
        
        const alert = document.createElement('div');
        alert.className = `alert-banner alert-${level}`;
        alert.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 1rem;">
                <div style="flex-shrink: 0; margin-top: 0.25rem;">
                    <i class="fas fa-${this.getAlertIcon(level)}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${title}</div>
                    <div style="font-size: 0.875rem; opacity: 0.9;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none; border: none; color: white;
                    cursor: pointer; padding: 0.25rem;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 10000);
    }
    
    getAlertIcon(level) {
        const icons = {
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle',
            success: 'check-circle'
        };
        return icons[level] || 'info-circle';
    }
    
    storeMetricsHistory(metrics) {
        this.metricsHistory.push({
            ...metrics,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 entries
        if (this.metricsHistory.length > 100) {
            this.metricsHistory = this.metricsHistory.slice(-100);
        }
    }
    
    // === PUBLIC API FUNCTIONS ===
    
    refreshMetrics() {
        this.updateMetrics();
        this.showSystemAlert('Metriken aktualisiert', 'Alle Daten wurden neu geladen', 'success');
    }
    
    refreshAllMetrics() {
        this.updateMetrics();
        if (window.AdminUserUI) {
            window.AdminUserUI.loadUsers();
        }
        this.showSystemAlert('Komplette Aktualisierung', 'Alle Systemdaten wurden neu geladen', 'success');
    }
    
    toggleAutoUpdate() {
        const icon = document.getElementById('auto-update-icon');
        const text = document.getElementById('auto-update-text');
        
        if (this.isActive) {
            this.isActive = false;
            clearInterval(this.updateInterval);
            icon.className = 'fas fa-play';
            text.textContent = 'Auto-Update starten';
            this.showSystemAlert('Auto-Update pausiert', 'Live-Updates wurden pausiert', 'info');
        } else {
            this.isActive = true;
            this.startRealTimeMonitoring();
            icon.className = 'fas fa-pause';
            text.textContent = 'Auto-Update pausieren';
            this.showSystemAlert('Auto-Update gestartet', 'Live-Updates wurden aktiviert', 'success');
        }
    }
    
    async downloadSystemReport() {
        try {
            const report = {
                generatedAt: new Date().toISOString(),
                generatedBy: window.GlobalAuth?.getCurrentUser()?.email,
                system: {
                    version: '2.0.0-multiuser',
                    environment: 'production',
                    region: 'eu-central-1'
                },
                metrics: this.metricsHistory.slice(-24), // Last 24 data points
                users: window.AdminUserUI?.users || [],
                health: await this.getSystemHealthSummary()
            };
            
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `system-report-${new Date().toISOString().slice(0,19)}.json`;
            a.click();
            
            this.showSystemAlert('Report generiert', 'System-Report wurde heruntergeladen', 'success');
        } catch (error) {
            this.showSystemAlert('Report-Fehler', error.message, 'error');
        }
    }
    
    toggleMaintenanceMode() {
        const isMaintenanceMode = localStorage.getItem('maintenanceMode') === 'true';
        
        if (isMaintenanceMode) {
            localStorage.removeItem('maintenanceMode');
            this.showSystemAlert('Maintenance Mode beendet', 'System ist wieder online', 'success');
        } else {
            if (confirm('System wirklich in Maintenance Mode versetzen?\n\nBenutzer können sich dann nicht anmelden.')) {
                localStorage.setItem('maintenanceMode', 'true');
                this.showSystemAlert('Maintenance Mode aktiviert', 'System ist offline für Wartung', 'warning');
            }
        }
    }
    
    loadMoreActivity() {
        // Load more activity entries
        const newActivities = this.generateSampleActivities();
        this.updateActivityFeed(newActivities);
    }
    
    clearActivityFeed() {
        const container = document.getElementById('activity-feed-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <p>Activity Feed geleert</p>
                </div>
            `;
        }
    }
    
    async getSystemHealthSummary() {
        return {
            overall: 'healthy',
            services: {
                cognito: 'online',
                s3: 'online', 
                dynamodb: 'online',
                lambda: 'development'
            },
            uptime: '99.9%',
            lastCheck: new Date().toISOString()
        };
    }
    
    calculateDaysSince(dateString) {
        if (!dateString) return 999;
        const date = new Date(dateString);
        const now = new Date();
        return Math.floor((now - date) / (1000 * 60 * 60 * 24));
    }
    
    stop() {
        this.isActive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        console.log('📊 Real-time dashboard stopped');
    }
}

// Initialize when admin page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.location.pathname.includes('admin')) {
        setTimeout(() => {
            window.RealTimeDashboard = new AdminRealTimeDashboard();
        }, 4000); // Start after other systems
    }
});

console.log('📊 Admin Real-time Dashboard loaded');

export default AdminRealTimeDashboard;
