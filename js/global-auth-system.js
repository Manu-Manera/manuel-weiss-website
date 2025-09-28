// Global Auth System für die gesamte Website
// Macht jede Seite multi-user fähig

import { initAuth, isLoggedIn, getUser, setUser } from './auth.js';

class GlobalAuthSystem {
    constructor() {
        this.currentUser = null;
        this.authCallbacks = [];
        this.progressData = {};
        this.userProfile = {};
        
        // AWS Configuration
        this.config = {
            cognito: {
                userPoolId: 'eu-central-1_8gP4gLK9r',
                clientId: '7kc5tt6a23fgh53d60vkefm812',
                region: 'eu-central-1',
                domain: 'manuel-weiss-userfiles-auth-038333965110'
            },
            aws: {
                bucket: 'manuel-weiss-userfiles-files-038333965110',
                dynamodb: 'manuel-weiss-userfiles-documents',
                region: 'eu-central-1'
            }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Global Auth System initializing...');
        
        // Initialize Cognito Auth
        initAuth();
        
        // Check current auth state
        this.checkAuthState();
        
        // Load user data if logged in
        if (this.isAuthenticated()) {
            await this.loadUserProfile();
            await this.loadUserProgress();
        }
        
        // Add auth UI to current page
        this.addAuthUI();
        
        // Setup periodic auth check
        setInterval(() => this.checkAuthState(), 30000);
        
        console.log('✅ Global Auth System ready');
    }
    
    checkAuthState() {
        const wasLoggedIn = !!this.currentUser;
        const isNowLoggedIn = isLoggedIn();
        
        if (isNowLoggedIn && !wasLoggedIn) {
            // User just logged in
            this.currentUser = getUser();
            this.onLogin();
        } else if (!isNowLoggedIn && wasLoggedIn) {
            // User just logged out
            this.currentUser = null;
            this.onLogout();
        }
        
        this.updateAuthUI();
    }
    
    async onLogin() {
        console.log('🔓 User logged in:', this.currentUser?.email);
        
        // Load user data
        await this.loadUserProfile();
        await this.loadUserProgress();
        
        // Notify callbacks
        this.authCallbacks.forEach(callback => {
            if (callback.onLogin) callback.onLogin(this.currentUser);
        });
        
        // Update UI
        this.updateAuthUI();
        
        // Show welcome message
        this.showNotification(`Willkommen zurück, ${this.currentUser?.email || 'User'}!`, 'success');
    }
    
    onLogout() {
        console.log('🔒 User logged out');
        
        // Clear user data
        this.userProfile = {};
        this.progressData = {};
        
        // Notify callbacks
        this.authCallbacks.forEach(callback => {
            if (callback.onLogout) callback.onLogout();
        });
        
        // Update UI
        this.updateAuthUI();
        
        this.showNotification('Erfolgreich abgemeldet', 'info');
    }
    
    // Public API
    isAuthenticated() {
        return isLoggedIn() && !!this.currentUser;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserProfile() {
        return this.userProfile;
    }
    
    // Progress Tracking
    async saveProgress(category, methodId, progressData) {
        if (!this.isAuthenticated()) {
            console.warn('Cannot save progress - user not authenticated');
            return false;
        }
        
        const key = `${category}:${methodId}`;
        
        // Update local progress
        if (!this.progressData[category]) {
            this.progressData[category] = {};
        }
        
        this.progressData[category][methodId] = {
            ...progressData,
            lastUpdated: new Date().toISOString(),
            userId: this.currentUser.userId
        };
        
        // Save to DynamoDB (simplified - would need Lambda API)
        try {
            await this.saveToStorage('user_progress', this.progressData);
            console.log(`✅ Progress saved: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to save progress:', error);
            return false;
        }
    }
    
    getProgress(category, methodId = null) {
        if (!category) return this.progressData;
        if (!this.progressData[category]) return methodId ? null : {};
        if (methodId) return this.progressData[category][methodId] || null;
        return this.progressData[category];
    }
    
    // User Profile Management
    async updateUserProfile(updates) {
        if (!this.isAuthenticated()) return false;
        
        this.userProfile = { ...this.userProfile, ...updates };
        
        try {
            await this.saveToStorage('user_profile', this.userProfile);
            console.log('✅ User profile updated');
            return true;
        } catch (error) {
            console.error('❌ Failed to update profile:', error);
            return false;
        }
    }
    
    // Data Storage (simplified - would use real API)
    async saveToStorage(type, data) {
        if (!this.isAuthenticated()) throw new Error('Not authenticated');
        
        // For now, save to localStorage with user prefix
        const key = `${this.currentUser.userId}:${type}`;
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: new Date().toISOString(),
            userId: this.currentUser.userId
        }));
        
        // TODO: Implement real API calls to DynamoDB via Lambda
        return true;
    }
    
    async loadFromStorage(type) {
        if (!this.isAuthenticated()) return null;
        
        try {
            const key = `${this.currentUser.userId}:${type}`;
            const stored = localStorage.getItem(key);
            
            if (!stored) return null;
            
            const parsed = JSON.parse(stored);
            return parsed.data;
        } catch (error) {
            console.error(`Failed to load ${type}:`, error);
            return null;
        }
    }
    
    async loadUserProfile() {
        this.userProfile = await this.loadFromStorage('user_profile') || {
            name: this.currentUser?.email?.split('@')[0] || 'User',
            email: this.currentUser?.email,
            preferences: {},
            settings: {
                language: 'de',
                theme: 'light',
                notifications: true
            }
        };
    }
    
    async loadUserProgress() {
        this.progressData = await this.loadFromStorage('user_progress') || {};
    }
    
    // UI Management
    addAuthUI() {
        // Check if auth UI already exists
        if (document.getElementById('global-auth-ui')) return;
        
        const authUI = document.createElement('div');
        authUI.id = 'global-auth-ui';
        authUI.innerHTML = this.getAuthUIHTML();
        
        // Add to top of body
        document.body.insertBefore(authUI, document.body.firstChild);
        
        // Add event listeners
        this.setupAuthUIEvents();
    }
    
    getAuthUIHTML() {
        const isAuth = this.isAuthenticated();
        const loginUrl = this.getLoginURL();
        const logoutUrl = this.getLogoutURL();
        
        return `
            <div style="
                position: fixed; top: 0; right: 0; z-index: 10000;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 0.75rem 1.5rem;
                border-bottom-left-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 0.875rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(0px)'" onmouseout="this.style.transform='translateY(-2px)'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">${isAuth ? '🔓' : '🔒'}</span>
                        <div>
                            <div style="font-weight: 600; font-size: 0.75rem; opacity: 0.9;">
                                ${isAuth ? 'Angemeldet' : 'Multi-User System'}
                            </div>
                            <div style="font-size: 0.7rem; opacity: 0.8;" id="auth-user-info">
                                ${isAuth ? (this.currentUser?.email || 'User') : 'Klicken zum Anmelden'}
                            </div>
                        </div>
                    </div>
                    <div>
                        <button id="global-auth-btn" style="
                            background: rgba(255,255,255,0.2);
                            border: 1px solid rgba(255,255,255,0.3);
                            color: white; padding: 0.4rem 0.8rem;
                            border-radius: 6px; cursor: pointer;
                            font-size: 0.75rem; font-weight: 500;
                            transition: all 0.2s ease;
                        " onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                           onmouseout="this.style.background='rgba(255,255,255,0.2)'"
                        >
                            ${isAuth ? 'Abmelden' : 'Anmelden'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateAuthUI() {
        const authUI = document.getElementById('global-auth-ui');
        if (authUI) {
            authUI.innerHTML = this.getAuthUIHTML();
            this.setupAuthUIEvents();
        }
    }
    
    setupAuthUIEvents() {
        const btn = document.getElementById('global-auth-btn');
        if (!btn) return;
        
        btn.onclick = () => {
            if (this.isAuthenticated()) {
                window.location.href = this.getLogoutURL();
            } else {
                window.location.href = this.getLoginURL();
            }
        };
    }
    
    getLoginURL() {
        const currentUrl = encodeURIComponent(window.location.href);
        return `https://${this.config.cognito.domain}.auth.${this.config.cognito.region}.amazoncognito.com/login?client_id=${this.config.cognito.clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${currentUrl}`;
    }
    
    getLogoutURL() {
        const currentUrl = encodeURIComponent(window.location.origin);
        return `https://${this.config.cognito.domain}.auth.${this.config.cognito.region}.amazoncognito.com/logout?client_id=${this.config.cognito.clientId}&logout_uri=${currentUrl}`;
    }
    
    // Event System
    onAuthChange(callback) {
        this.authCallbacks.push(callback);
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.global-auth-notification');
        existing.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'global-auth-notification';
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.cssText = `
            position: fixed; top: 80px; right: 20px; z-index: 10001;
            background: ${colors[type]}; color: white;
            padding: 1rem 1.5rem; border-radius: 8px;
            font-size: 0.875rem; font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => notification.remove(), 4000);
    }
    
    // Method Integration Helper
    requireAuth(callback) {
        if (!this.isAuthenticated()) {
            this.showNotification('Bitte melden Sie sich an, um diese Funktion zu nutzen', 'warning');
            return false;
        }
        
        if (callback) callback(this.currentUser);
        return true;
    }
    
    // Export user data
    async exportUserData() {
        if (!this.isAuthenticated()) return null;
        
        return {
            profile: this.userProfile,
            progress: this.progressData,
            exported: new Date().toISOString()
        };
    }
}

// Global instance
window.GlobalAuth = new GlobalAuthSystem();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

console.log('🌍 Global Auth System loaded for entire website');

export default GlobalAuthSystem;
