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
        
        // Show login modal instead of redirecting
        if (window.authModals && window.authModals.showLogin) {
            window.authModals.showLogin();
        } else {
            // Fallback: redirect to main page
            window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
        }
    }
    
    handleProfileClick() {
        console.log('👤 Profile button clicked');
        
        if (this.isLoggedIn()) {
            // Show profile dropdown or redirect to user profile
            this.showProfileDropdown();
        } else {
            // Show login prompt
            this.showLoginPrompt();
        }
    }
    
    showProfileDropdown() {
        // Create profile dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.innerHTML = `
            <div class="profile-dropdown-content">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="profile-info">
                        <div class="profile-name">${this.getCurrentUser()?.name || 'Benutzer'}</div>
                        <div class="profile-email">${this.getCurrentUser()?.email || ''}</div>
                    </div>
                </div>
                <div class="profile-actions">
                    <button onclick="window.location.href='user-profile.html'" class="profile-action-btn">
                        <i class="fas fa-user-cog"></i> Profil verwalten
                    </button>
                    <button onclick="window.location.href='user-profile.html#settings'" class="profile-action-btn">
                        <i class="fas fa-cog"></i> Einstellungen
                    </button>
                    <button onclick="window.location.href='user-profile.html#progress'" class="profile-action-btn">
                        <i class="fas fa-chart-line"></i> Fortschritt
                    </button>
                    <button onclick="personalityAuth.handleLogoutClick()" class="profile-action-btn logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Abmelden
                    </button>
                </div>
            </div>
        `;
        
        // Add styles
        dropdown.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            min-width: 300px;
            animation: slideInDown 0.3s ease;
        `;
        
        dropdown.querySelector('.profile-dropdown-content').style.cssText = `
            padding: 1rem;
        `;
        
        dropdown.querySelector('.profile-header').style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 1rem;
        `;
        
        dropdown.querySelector('.profile-avatar').style.cssText = `
            width: 50px;
            height: 50px;
            background: #7c3aed;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        `;
        
        dropdown.querySelector('.profile-info').style.cssText = `
            flex: 1;
        `;
        
        dropdown.querySelector('.profile-name').style.cssText = `
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.25rem;
        `;
        
        dropdown.querySelector('.profile-email').style.cssText = `
            color: #6b7280;
            font-size: 0.9rem;
        `;
        
        dropdown.querySelector('.profile-actions').style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        `;
        
        dropdown.querySelectorAll('.profile-action-btn').forEach(btn => {
            btn.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                border: none;
                background: #f9fafb;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
                width: 100%;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#f3f4f6';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#f9fafb';
            });
        });
        
        dropdown.querySelector('.logout-btn').style.cssText = `
            color: #ef4444;
            background: #fef2f2;
        `;
        
        dropdown.querySelector('.logout-btn').addEventListener('mouseenter', () => {
            dropdown.querySelector('.logout-btn').style.background = '#fee2e2';
        });
        
        dropdown.querySelector('.logout-btn').addEventListener('mouseleave', () => {
            dropdown.querySelector('.logout-btn').style.background = '#fef2f2';
        });
        
        // Remove existing dropdowns
        document.querySelectorAll('.profile-dropdown').forEach(d => d.remove());
        
        // Add to page
        document.body.appendChild(dropdown);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !e.target.closest('.personality-profile-btn, .nav-profile-btn')) {
                    dropdown.remove();
                }
            });
        }, 100);
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

// Add CSS for notifications and dropdowns
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
    
    @keyframes slideInDown {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
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
    
    .profile-dropdown {
        font-family: 'Inter', sans-serif;
    }
    
    .profile-dropdown .profile-action-btn i {
        width: 20px;
        text-align: center;
    }
`;
document.head.appendChild(style);
