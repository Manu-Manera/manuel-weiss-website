/**
 * 🔐 UNIFIED AUTH MANAGER 2025
 * Einheitliches Authentifizierungssystem für alle Seiten
 * Basiert auf dem erfolgreichen System der Persönlichkeitsentwicklungsseite
 */

class UnifiedAuthManager {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.sessionKey = 'unified_auth_session';
        this.config = {
            userPoolId: 'eu-central-1_8gP4gLK9r',
            clientId: '7kc5tt6a23fgh53d60vkefm812',
            region: 'eu-central-1',
            domain: 'manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com'
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Unified Auth Manager...');
            
            // Load AWS SDK
            await this.loadAWSSDK();
            
            // Initialize Cognito
            this.cognito = new AWS.CognitoIdentityServiceProvider({
                region: this.config.region
            });
            
            this.isInitialized = true;
            console.log('✅ Unified Auth Manager initialized');
            
            // Check existing session
            this.checkExistingSession();
            
            // Setup cross-tab communication
            this.setupCrossTabCommunication();
            
        } catch (error) {
            console.error('❌ Failed to initialize Unified Auth Manager:', error);
            this.isInitialized = false;
        }
    }
    
    async loadAWSSDK() {
        return new Promise((resolve, reject) => {
            if (window.AWS) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load AWS SDK'));
            document.head.appendChild(script);
        });
    }
    
    checkExistingSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (this.isSessionValid(session)) {
                    this.currentUser = session.user;
                    this.updateUI(true);
                    console.log('✅ Existing session restored');
                } else {
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('❌ Error checking session:', error);
            this.clearSession();
        }
    }
    
    isSessionValid(session) {
        if (!session || !session.user || !session.timestamp) return false;
        
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        return sessionAge < maxAge;
    }
    
    async login(email, password) {
        if (!this.isInitialized) {
            throw new Error('Auth system not initialized');
        }
        
        try {
            console.log('🔐 Starting login process...');
            
            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.config.clientId,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            };
            
            const result = await this.cognito.initiateAuth(params).promise();
            
            if (result.AuthenticationResult) {
                this.currentUser = {
                    email: email,
                    name: email.split('@')[0],
                    accessToken: result.AuthenticationResult.AccessToken,
                    idToken: result.AuthenticationResult.IdToken,
                    refreshToken: result.AuthenticationResult.RefreshToken,
                    expiresIn: result.AuthenticationResult.ExpiresIn,
                    loginTime: Date.now()
                };
                
                this.saveSession();
                this.updateUI(true);
                this.broadcastAuthChange('login');
                
                console.log('✅ Login successful');
                this.showNotification('✅ Erfolgreich angemeldet!', 'success');
                
                return { success: true, user: this.currentUser };
            } else {
                throw new Error('Authentication failed');
            }
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            this.handleAuthError(error);
            return { success: false, error: error.message };
        }
    }
    
    async register(email, password, firstName, lastName) {
        if (!this.isInitialized) {
            throw new Error('Auth system not initialized');
        }
        
        try {
            console.log('📝 Starting registration process...');
            
            const params = {
                ClientId: this.config.clientId,
                Username: email,
                Password: password,
                UserAttributes: [
                    { Name: 'email', Value: email },
                    { Name: 'given_name', Value: firstName },
                    { Name: 'family_name', Value: lastName }
                ]
            };
            
            const result = await this.cognito.signUp(params).promise();
            
            console.log('✅ Registration successful');
            this.showNotification('✅ Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail.', 'success');
            
            return { success: true, userSub: result.UserSub };
            
        } catch (error) {
            console.error('❌ Registration failed:', error);
            this.handleAuthError(error);
            return { success: false, error: error.message };
        }
    }
    
    async confirmRegistration(email, code) {
        try {
            const params = {
                ClientId: this.config.clientId,
                Username: email,
                ConfirmationCode: code
            };
            
            await this.cognito.confirmSignUp(params).promise();
            
            console.log('✅ Email confirmation successful');
            this.showNotification('✅ E-Mail erfolgreich bestätigt!', 'success');
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Email confirmation failed:', error);
            this.handleAuthError(error);
            return { success: false, error: error.message };
        }
    }
    
    async logout() {
        try {
            if (this.currentUser && this.currentUser.accessToken) {
                const params = {
                    AccessToken: this.currentUser.accessToken
                };
                
                try {
                    await this.cognito.globalSignOut(params).promise();
                } catch (error) {
                    console.warn('⚠️ Global sign out failed, continuing with local logout');
                }
            }
            
            this.currentUser = null;
            this.clearSession();
            this.updateUI(false);
            this.broadcastAuthChange('logout');
            
            console.log('✅ Logout successful');
            this.showNotification('✅ Erfolgreich abgemeldet!', 'success');
            
        } catch (error) {
            console.error('❌ Logout failed:', error);
            // Force local logout even if server logout fails
            this.currentUser = null;
            this.clearSession();
            this.updateUI(false);
        }
    }
    
    saveSession() {
        if (this.currentUser) {
            const sessionData = {
                user: this.currentUser,
                timestamp: Date.now()
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        }
    }
    
    clearSession() {
        localStorage.removeItem(this.sessionKey);
    }
    
    updateUI(isLoggedIn) {
        const userSystem = document.getElementById('userSystem');
        const userInfo = document.getElementById('userInfo');
        const userLogin = document.getElementById('userLogin');
        
        if (!userSystem) return;
        
        if (isLoggedIn && this.currentUser) {
            // Show user info
            if (userInfo) {
                userInfo.style.display = 'flex';
                const userName = document.getElementById('userName');
                const userEmail = document.getElementById('userEmail');
                const userAvatar = document.getElementById('userAvatar');
                
                if (userName) userName.textContent = this.currentUser.name;
                if (userEmail) userEmail.textContent = this.currentUser.email;
                if (userAvatar) userAvatar.src = 'manuel-weiss-photo.svg';
            }
            
            // Hide login button
            if (userLogin) {
                userLogin.style.display = 'none';
            }
        } else {
            // Show login button
            if (userLogin) {
                userLogin.style.display = 'flex';
            }
            
            // Hide user info
            if (userInfo) {
                userInfo.style.display = 'none';
            }
        }
    }
    
    setupCrossTabCommunication() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.sessionKey) {
                if (e.newValue) {
                    // Session updated in another tab
                    const session = JSON.parse(e.newValue);
                    if (this.isSessionValid(session)) {
                        this.currentUser = session.user;
                        this.updateUI(true);
                    }
                } else {
                    // Session cleared in another tab
                    this.currentUser = null;
                    this.updateUI(false);
                }
            }
        });
    }
    
    broadcastAuthChange(action) {
        // Broadcast to other tabs
        const event = new CustomEvent('authChange', {
            detail: { action, user: this.currentUser }
        });
        window.dispatchEvent(event);
    }
    
    handleAuthError(error) {
        let message = 'Ein Fehler ist aufgetreten';
        
        if (error.code === 'NotAuthorizedException') {
            message = 'Ungültige Anmeldedaten';
        } else if (error.code === 'UserNotFoundException') {
            message = 'Benutzer nicht gefunden';
        } else if (error.code === 'InvalidPasswordException') {
            message = 'Ungültiges Passwort';
        } else if (error.code === 'UsernameExistsException') {
            message = 'Benutzer existiert bereits';
        } else if (error.code === 'InvalidParameterException') {
            message = 'Ungültige Eingabedaten';
        } else if (error.code === 'LimitExceededException') {
            message = 'Zu viele Versuche. Bitte warten Sie.';
        }
        
        this.showNotification(`❌ ${message}`, 'error');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        if (type === 'success') {
            notification.style.backgroundColor = '#10b981';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#ef4444';
        } else {
            notification.style.backgroundColor = '#3b82f6';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Global functions for HTML onclick handlers
    static loginUser() {
        if (window.unifiedAuthManager) {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.style.display = 'flex';
            }
        }
    }
    
    static logoutUser() {
        if (window.unifiedAuthManager) {
            window.unifiedAuthManager.logout();
        }
    }
}

// Initialize global instance
window.unifiedAuthManager = new UnifiedAuthManager();

// Global functions for HTML onclick handlers
window.loginUser = UnifiedAuthManager.loginUser;
window.logoutUser = UnifiedAuthManager.logoutUser;

// Auth modal functions
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function showSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeVerificationModal() {
    const modal = document.getElementById('verificationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions globally available
window.showLoginModal = showLoginModal;
window.showSignupModal = showSignupModal;
window.closeLoginModal = closeLoginModal;
window.closeSignupModal = closeSignupModal;
window.closeVerificationModal = closeVerificationModal;
