/**
 * Einheitliche Login-Integration für alle Persönlichkeitsentwicklungs-Methoden
 * Stellt sicher, dass alle Methoden das gleiche Login-System verwenden
 */

class PersonalityAuthIntegration {
    constructor() {
        this.isInitialized = false;
        this.init();
    }
    
    async init() {
        console.log('🔐 Initializing Personality Auth Integration...');
        
        // Wait for AWS Auth to be available
        await this.waitForAWSAuth();
        
        // Initialize auth system
        this.initializeAuthSystem();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI
        this.updateUI();
        
        this.isInitialized = true;
        console.log('✅ Personality Auth Integration initialized');
    }
    
    async waitForAWSAuth() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        while (!window.awsAuth && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.awsAuth) {
            console.warn('⚠️ AWS Auth not available, using fallback');
        }
    }
    
    initializeAuthSystem() {
        // Ensure AWS Auth is available
        if (!window.awsAuth) {
            console.log('🔧 Creating fallback auth system...');
            this.createFallbackAuth();
        }
    }
    
    createFallbackAuth() {
        // Simple fallback auth system
        window.awsAuth = {
            isLoggedIn: () => {
                const session = localStorage.getItem('aws_auth_session');
                return !!session;
            },
            getCurrentUser: () => {
                const session = localStorage.getItem('aws_auth_session');
                if (session) {
                    try {
                        return JSON.parse(session);
                    } catch (e) {
                        return null;
                    }
                }
                return null;
            },
            logout: () => {
                localStorage.removeItem('aws_auth_session');
                this.updateUI();
            }
        };
    }
    
    setupEventListeners() {
        // Login button click
        document.addEventListener('click', (e) => {
            if (e.target.matches('.personality-login-btn, .nav-login-btn')) {
                e.preventDefault();
                this.handleLoginClick();
            }
        });
        
        // Profile button click
        document.addEventListener('click', (e) => {
            if (e.target.matches('.personality-profile-btn, .nav-profile-btn')) {
                e.preventDefault();
                this.handleProfileClick();
            }
        });
        
        // Logout button click
        document.addEventListener('click', (e) => {
            if (e.target.matches('.personality-logout-btn, .nav-logout-btn')) {
                e.preventDefault();
                this.handleLogoutClick();
            }
        });
    }
    
    handleLoginClick() {
        console.log('🔐 Login button clicked');
        
        // Store current URL for return after login
        localStorage.setItem('returnUrl', window.location.href);
        
        // Redirect to main page with login
        window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
    }
    
    handleProfileClick() {
        console.log('👤 Profile button clicked');
        
        if (this.isLoggedIn()) {
            // Redirect to user profile
            window.location.href = 'user-profile.html';
        } else {
            // Show login prompt
            this.showLoginPrompt();
        }
    }
    
    handleLogoutClick() {
        console.log('🚪 Logout button clicked');
        
        if (window.awsAuth && window.awsAuth.logout) {
            window.awsAuth.logout();
        } else {
            localStorage.removeItem('aws_auth_session');
        }
        
        this.updateUI();
        this.showNotification('Erfolgreich abgemeldet!', 'success');
    }
    
    isLoggedIn() {
        if (window.awsAuth && window.awsAuth.isLoggedIn) {
            return window.awsAuth.isLoggedIn();
        }
        return false;
    }
    
    getCurrentUser() {
        if (window.awsAuth && window.awsAuth.getCurrentUser) {
            return window.awsAuth.getCurrentUser();
        }
        return null;
    }
    
    updateUI() {
        const isLoggedIn = this.isLoggedIn();
        const currentUser = this.getCurrentUser();
        
        console.log('🔄 Updating UI, isLoggedIn:', isLoggedIn);
        console.log('👤 Current user:', currentUser);
        
        // Update all login buttons
        document.querySelectorAll('.personality-login-btn, .nav-login-btn').forEach(btn => {
            if (isLoggedIn) {
                btn.innerHTML = '<i class="fas fa-user"></i> Profil';
                btn.className = btn.className.replace('personality-login-btn', 'personality-profile-btn');
                btn.className = btn.className.replace('nav-login-btn', 'nav-profile-btn');
            } else {
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
                btn.className = btn.className.replace('personality-profile-btn', 'personality-login-btn');
                btn.className = btn.className.replace('nav-profile-btn', 'nav-login-btn');
            }
        });
        
        // Update user info in navigation
        this.updateUserInfo(currentUser);
    }
    
    updateUserInfo(user) {
        // Update user name in navigation
        const userNameElements = document.querySelectorAll('.user-name, .nav-user-name');
        userNameElements.forEach(el => {
            if (user && user.email) {
                el.textContent = user.name || user.email.split('@')[0];
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
        
        // Update user email in navigation
        const userEmailElements = document.querySelectorAll('.user-email, .nav-user-email');
        userEmailElements.forEach(el => {
            if (user && user.email) {
                el.textContent = user.email;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    showLoginPrompt() {
        this.showNotification('Bitte melden Sie sich an, um fortzufahren', 'info');
        
        // Store current URL for return after login
        localStorage.setItem('returnUrl', window.location.href);
        
        setTimeout(() => {
            window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
        }, 2000);
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.personality-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `personality-notification personality-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // Method to save user progress
    saveUserProgress(progressData) {
        if (!this.isLoggedIn()) {
            this.showLoginPrompt();
            return false;
        }
        
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.showLoginPrompt();
            return false;
        }
        
        // Save progress to localStorage with user ID
        const userId = currentUser.email || 'anonymous';
        const progressKey = `user_progress_${userId}`;
        
        try {
            const existingProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            const updatedProgress = { ...existingProgress, ...progressData };
            localStorage.setItem(progressKey, JSON.stringify(updatedProgress));
            
            console.log('✅ User progress saved:', progressData);
            this.showNotification('Fortschritt gespeichert!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Error saving progress:', error);
            this.showNotification('Fehler beim Speichern des Fortschritts', 'error');
            return false;
        }
    }
    
    // Method to load user progress
    loadUserProgress() {
        if (!this.isLoggedIn()) {
            return null;
        }
        
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return null;
        }
        
        const userId = currentUser.email || 'anonymous';
        const progressKey = `user_progress_${userId}`;
        
        try {
            const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            console.log('📊 User progress loaded:', progress);
            return progress;
        } catch (error) {
            console.error('❌ Error loading progress:', error);
            return null;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personalityAuth = new PersonalityAuthIntegration();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .personality-notification {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
    }
    
    .personality-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .personality-notification i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);
