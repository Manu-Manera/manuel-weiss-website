/**
 * Globales Login-System für alle Seiten
 * Stellt sicher, dass Login-Status seitenübergreifend funktioniert
 */

class GlobalAuthSystem {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.init();
    }
    
    async init() {
        console.log('🌐 Initializing Global Auth System...');
        
        // Wait for AWS Auth to be available
        await this.waitForAWSAuth();
        
        // Initialize auth system
        this.initializeAuthSystem();
        
        // Setup global event listeners
        this.setupGlobalEventListeners();
        
        // Update UI on all pages
        this.updateGlobalUI();
        
        // Setup periodic session check
        this.setupSessionCheck();
        
        this.isInitialized = true;
        console.log('✅ Global Auth System initialized');
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
            console.log('🔧 Creating global fallback auth system...');
            this.createGlobalFallbackAuth();
        }
    }
    
    createGlobalFallbackAuth() {
        // Global fallback auth system
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
                this.updateGlobalUI();
            }
        };
    }
    
    setupSessionCheck() {
        // Check session every 5 seconds
        setInterval(() => {
            this.checkAndUpdateSession();
        }, 5000);
        
        // Check session on page focus
        window.addEventListener('focus', () => {
            this.checkAndUpdateSession();
        });
        
        // Check session on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkAndUpdateSession();
            }
        });
    }
    
    checkAndUpdateSession() {
        const wasLoggedIn = this.isLoggedIn();
        const currentUser = this.getCurrentUser();
        
        // Update UI if session status changed
        if (wasLoggedIn !== this.lastLoginStatus || 
            (currentUser && currentUser.email !== this.lastUserEmail)) {
            
            console.log('🔄 Session status changed, updating UI...');
            this.updateGlobalUI();
            
            this.lastLoginStatus = wasLoggedIn;
            this.lastUserEmail = currentUser ? currentUser.email : null;
        }
    }
    
    setupGlobalEventListeners() {
        // Global login button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.global-login-btn, .nav-login-btn, .login-btn')) {
                e.preventDefault();
                this.handleGlobalLoginClick();
            }
        });
        
        // Global profile button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.global-profile-btn, .nav-profile-btn, .profile-btn')) {
                e.preventDefault();
                this.handleGlobalProfileClick();
            }
        });
        
        // Global logout button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.global-logout-btn, .nav-logout-btn, .logout-btn')) {
                e.preventDefault();
                this.handleGlobalLogoutClick();
            }
        });
    }
    
    handleGlobalLoginClick() {
        console.log('🔐 Global login button clicked');
        
        // Store current URL for return after login
        localStorage.setItem('returnUrl', window.location.href);
        
        // Redirect to main page with login
        window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
    }
    
    handleGlobalProfileClick() {
        console.log('👤 Global profile button clicked');
        
        if (this.isLoggedIn()) {
            // Show profile dropdown
            this.showGlobalProfileDropdown();
        } else {
            // Redirect to login
            this.handleGlobalLoginClick();
        }
    }
    
    handleGlobalLogoutClick() {
        console.log('🚪 Global logout button clicked');
        
        if (window.awsAuth && window.awsAuth.logout) {
            window.awsAuth.logout();
        } else {
            localStorage.removeItem('aws_auth_session');
        }
        
        this.updateGlobalUI();
        this.showGlobalNotification('Erfolgreich abgemeldet!', 'success');
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
    
    updateGlobalUI() {
        const isLoggedIn = this.isLoggedIn();
        const currentUser = this.getCurrentUser();
        
        console.log('🔄 Updating global UI, isLoggedIn:', isLoggedIn);
        console.log('👤 Current user:', currentUser);
        
        // Update all login buttons globally
        document.querySelectorAll('.global-login-btn, .nav-login-btn, .login-btn, .personality-login-btn').forEach(btn => {
            if (isLoggedIn) {
                btn.innerHTML = '<i class="fas fa-user"></i> Profil';
                btn.className = btn.className.replace('global-login-btn', 'global-profile-btn')
                                           .replace('nav-login-btn', 'nav-profile-btn')
                                           .replace('login-btn', 'profile-btn')
                                           .replace('personality-login-btn', 'personality-profile-btn');
                btn.style.display = 'flex';
            } else {
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
                btn.className = btn.className.replace('global-profile-btn', 'global-login-btn')
                                           .replace('nav-profile-btn', 'nav-login-btn')
                                           .replace('profile-btn', 'login-btn')
                                           .replace('personality-profile-btn', 'personality-login-btn');
                btn.style.display = 'flex';
            }
        });
        
        // Update user info in navigation
        this.updateGlobalUserInfo(currentUser);
        
        // Update personality development specific elements
        this.updatePersonalityDevelopmentUI(isLoggedIn, currentUser);
    }
    
    updateGlobalUserInfo(user) {
        // Update user name in navigation
        const userNameElements = document.querySelectorAll('.user-name, .nav-user-name, .global-user-name');
        userNameElements.forEach(el => {
            if (user && user.email) {
                el.textContent = user.name || user.email.split('@')[0];
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
        
        // Update user email in navigation
        const userEmailElements = document.querySelectorAll('.user-email, .nav-user-email, .global-user-email');
        userEmailElements.forEach(el => {
            if (user && user.email) {
                el.textContent = user.email;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    updatePersonalityDevelopmentUI(isLoggedIn, user) {
        // Update personality development specific UI elements
        const userDropdown = document.querySelector('.user-dropdown');
        const userAvatarSmall = document.querySelector('.user-avatar-small');
        const userNameSmall = document.querySelector('.user-name-small');
        const userEmailSmall = document.querySelector('.user-email-small');
        
        if (userDropdown) {
            userDropdown.style.display = isLoggedIn ? 'block' : 'none';
        }
        
        if (userAvatarSmall) {
            userAvatarSmall.style.display = isLoggedIn ? 'flex' : 'none';
        }
        
        if (userNameSmall && user) {
            userNameSmall.textContent = user.name || user.email.split('@')[0];
            userNameSmall.style.display = isLoggedIn ? 'block' : 'none';
        }
        
        if (userEmailSmall && user) {
            userEmailSmall.textContent = user.email;
            userEmailSmall.style.display = isLoggedIn ? 'block' : 'none';
        }
        
        // Update any personality development specific buttons
        document.querySelectorAll('.personality-login-btn, .personality-profile-btn').forEach(btn => {
            if (isLoggedIn) {
                btn.innerHTML = '<i class="fas fa-user"></i> Profil';
                btn.className = btn.className.replace('personality-login-btn', 'personality-profile-btn');
            } else {
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
                btn.className = btn.className.replace('personality-profile-btn', 'personality-login-btn');
            }
        });
    }
    
    showGlobalProfileDropdown() {
        // Create global profile dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'global-profile-dropdown';
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
                    <button onclick="globalAuth.handleGlobalLogoutClick()" class="profile-action-btn logout-btn">
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
        
        // Add content styles
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
        document.querySelectorAll('.global-profile-dropdown').forEach(d => d.remove());
        
        // Add to page
        document.body.appendChild(dropdown);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !e.target.closest('.global-profile-btn, .nav-profile-btn, .profile-btn')) {
                    dropdown.remove();
                }
            });
        }, 100);
    }
    
    showGlobalNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.global-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `global-notification global-notification-${type}`;
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.globalAuth = new GlobalAuthSystem();
});

// Add CSS for global notifications and dropdowns
const globalStyle = document.createElement('style');
globalStyle.textContent = `
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
    
    .global-notification {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
    }
    
    .global-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .global-notification i {
        font-size: 1.2rem;
    }
    
    .global-profile-dropdown {
        font-family: 'Inter', sans-serif;
    }
    
    .global-profile-dropdown .profile-action-btn i {
        width: 20px;
        text-align: center;
    }
`;
document.head.appendChild(globalStyle);
