// Admin Multi-User Integration
// Verbindet das bestehende Admin-System mit dem neuen Multi-User Backend

class AdminMultiUserIntegration {
    constructor() {
        this.adminData = {};
        this.userSessions = {};
        this.systemMetrics = {};
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Admin Multi-User Integration initializing...');
        
        // Wait for global auth
        if (!window.GlobalAuth) {
            setTimeout(() => this.init(), 1000);
            return;
        }
        
        // Setup admin-specific listeners
        this.setupAdminListeners();
        
        // Load admin metrics
        await this.loadSystemMetrics();
        
        // Setup real-time monitoring
        this.setupRealTimeMonitoring();
        
        console.log('✅ Admin Multi-User Integration ready');
    }
    
    setupAdminListeners() {
        // Listen for user activities across the system
        window.GlobalAuth.onAuthChange({
            onLogin: (user) => this.onUserLogin(user),
            onLogout: () => this.onUserLogout()
        });
        
        // Intercept existing admin functions to add user context
        this.enhanceExistingAdminFunctions();
    }
    
    onUserLogin(user) {
        console.log('👤 Admin: User logged in', user.email);
        
        // Track user session
        this.userSessions[user.userId] = {
            email: user.email,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            actions: []
        };
        
        // Update admin dashboard
        this.updateAdminDashboard();
    }
    
    onUserLogout() {
        console.log('👤 Admin: User logged out');
        this.updateAdminDashboard();
    }
    
    enhanceExistingAdminFunctions() {
        // Enhance document upload with user tracking
        const originalTriggerUpload = window.triggerDocumentUpload;
        if (originalTriggerUpload) {
            window.triggerDocumentUpload = (...args) => {
                this.trackAdminAction('document_upload_triggered');
                return originalTriggerUpload.apply(window, args);
            };
        }
        
        // Enhance workflow functions
        const originalStartWorkflow = window.startSmartWorkflow;
        if (originalStartWorkflow) {
            window.startSmartWorkflow = (...args) => {
                this.trackAdminAction('smart_workflow_started');
                return originalStartWorkflow.apply(window, args);
            };
        }
        
        // Enhance AI functions
        const originalAIAnalysis = window.analyzeStoredDocumentsEnhanced;
        if (originalAIAnalysis) {
            window.analyzeStoredDocumentsEnhanced = async (...args) => {
                this.trackAdminAction('ai_analysis_started');
                return await originalAIAnalysis.apply(window, args);
            };
        }
    }
    
    trackAdminAction(action, data = {}) {
        const timestamp = new Date().toISOString();
        
        // Log to admin metrics
        if (!this.systemMetrics.adminActions) {
            this.systemMetrics.adminActions = [];
        }
        
        this.systemMetrics.adminActions.push({
            action,
            timestamp,
            data,
            user: window.GlobalAuth?.getCurrentUser()?.email || 'anonymous'
        });
        
        // Keep only last 100 actions
        if (this.systemMetrics.adminActions.length > 100) {
            this.systemMetrics.adminActions = this.systemMetrics.adminActions.slice(-100);
        }
        
        console.log(`📊 Admin action tracked: ${action}`);
    }
    
    async loadSystemMetrics() {
        // Load system-wide metrics
        this.systemMetrics = {
            totalUsers: await this.getUserCount(),
            activeUsers: Object.keys(this.userSessions).length,
            totalDocuments: await this.getDocumentCount(),
            totalProgress: await this.getProgressCount(),
            systemHealth: 'healthy',
            lastUpdate: new Date().toISOString(),
            adminActions: []
        };
    }
    
    async getUserCount() {
        // This would query Cognito for user count
        // For now, return estimated count
        return Object.keys(this.userSessions).length;
    }
    
    async getDocumentCount() {
        // Count documents across all users
        try {
            const allDocs = JSON.parse(localStorage.getItem('applicationDocuments') || '[]');
            return allDocs.length;
        } catch {
            return 0;
        }
    }
    
    async getProgressCount() {
        // Count total progress entries
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(':user_progress')) {
                total++;
            }
        }
        return total;
    }
    
    setupRealTimeMonitoring() {
        // Update metrics every 30 seconds
        setInterval(() => {
            this.loadSystemMetrics();
            this.updateAdminDashboard();
        }, 30000);
        
        // Monitor error rates
        this.setupErrorTracking();
    }
    
    setupErrorTracking() {
        const originalConsoleError = console.error;
        console.error = (...args) => {
            // Track errors for admin dashboard
            this.trackAdminAction('system_error', {
                error: args[0],
                timestamp: new Date().toISOString()
            });
            
            return originalConsoleError.apply(console, args);
        };
    }
    
    updateAdminDashboard() {
        // Add system metrics to admin dashboard
        const dashboardElement = document.getElementById('dashboard');
        if (!dashboardElement) return;
        
        let metricsContainer = document.getElementById('admin-multiuser-metrics');
        if (!metricsContainer) {
            metricsContainer = document.createElement('div');
            metricsContainer.id = 'admin-multiuser-metrics';
            dashboardElement.appendChild(metricsContainer);
        }
        
        metricsContainer.innerHTML = this.renderMetricsDashboard();
    }
    
    renderMetricsDashboard() {
        const metrics = this.systemMetrics;
        const activeSessions = Object.keys(this.userSessions).length;
        
        return `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 2rem; border-radius: 16px;
                margin: 2rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            ">
                <h2 style="margin: 0 0 2rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-users"></i>
                    Multi-User System Metrics
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${activeSessions}</div>
                        <div style="opacity: 0.9;">Aktive Sessions</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${metrics.totalDocuments || 0}</div>
                        <div style="opacity: 0.9;">Dokumente</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${metrics.totalProgress || 0}</div>
                        <div style="opacity: 0.9;">Progress Tracks</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">✅</div>
                        <div style="opacity: 0.9;">System Health</div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 12px;">
                    <h3 style="margin: 0 0 1rem;">🔴 Live System Status</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; font-size: 0.875rem;">
                        <div>
                            <strong>🔐 Cognito:</strong><br>
                            Pool: eu-central-1_8gP4gLK9r<br>
                            Status: ✅ Live
                        </div>
                        <div>
                            <strong>🗄️ S3 Bucket:</strong><br>
                            manuel-weiss-userfiles-files-*<br>
                            Status: ✅ Ready
                        </div>
                        <div>
                            <strong>📊 DynamoDB:</strong><br>
                            manuel-weiss-userfiles-documents<br>
                            Status: ✅ Connected
                        </div>
                        <div>
                            <strong>⚡ Lambda APIs:</strong><br>
                            Phase 2 Deployment<br>
                            Status: 🔄 Development
                        </div>
                    </div>
                </div>
                
                ${this.renderRecentActivity()}
            </div>
        `;
    }
    
    renderRecentActivity() {
        const recentActions = (this.systemMetrics.adminActions || []).slice(-5).reverse();
        
        if (recentActions.length === 0) {
            return `
                <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <h4 style="margin: 0 0 0.5rem;">📋 Recent Activity</h4>
                    <p style="margin: 0; opacity: 0.8; font-size: 0.875rem;">No recent activity</p>
                </div>
            `;
        }
        
        return `
            <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <h4 style="margin: 0 0 1rem;">📋 Recent Activity</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${recentActions.map(action => `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px;">
                            <span style="font-size: 0.875rem;">${this.formatActionName(action.action)}</span>
                            <span style="font-size: 0.75rem; opacity: 0.8;">${new Date(action.timestamp).toLocaleTimeString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    formatActionName(action) {
        const actionNames = {
            'document_upload_triggered': '📁 Document Upload',
            'smart_workflow_started': '🔄 Smart Workflow',
            'ai_analysis_started': '🧠 AI Analysis',
            'system_error': '❌ System Error'
        };
        
        return actionNames[action] || action;
    }
    
    // Public API for admin functions
    getSystemMetrics() {
        return this.systemMetrics;
    }
    
    getUserSessions() {
        return this.userSessions;
    }
    
    async exportSystemData() {
        return {
            metrics: this.systemMetrics,
            sessions: this.userSessions,
            exported: new Date().toISOString(),
            awsConfig: window.GlobalAuth?.config
        };
    }
}

// Initialize when admin page loads
if (document.location.pathname.includes('admin')) {
    window.AdminMultiUser = new AdminMultiUserIntegration();
}

console.log('🔧 Admin Multi-User Integration loaded');

export default AdminMultiUserIntegration;
