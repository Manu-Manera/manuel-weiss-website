// 🔧 UNIFIED AUTH CONFIGURATION
// Zentrale Konfiguration für alle Authentifizierungsprobleme

window.UNIFIED_AUTH_CONFIG = {
    // AWS Cognito Konfiguration
    cognito: {
        userPoolId: 'eu-central-1_8gP4gLK9r',
        clientId: '7kc5tt6a23fgh53d60vkefm812',
        region: 'eu-central-1',
        domain: 'manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com'
    },
    
    // Einheitliche Callback URLs
    callbackUrls: {
        production: [
            'https://mawps.netlify.app',
            'https://mawps.netlify.app/bewerbung.html',
            'https://mawps.netlify.app/persoenlichkeitsentwicklung-uebersicht.html',
            'https://mawps.netlify.app/user-profile.html'
        ],
        development: [
            'http://localhost:8000',
            'http://localhost:8000/bewerbung.html',
            'http://localhost:8000/persoenlichkeitsentwicklung-uebersicht.html'
        ]
    },
    
    // Token-Konfiguration
    token: {
        storageKey: 'aws_auth_session',
        refreshThreshold: 300, // 5 Minuten vor Ablauf
        maxRetries: 3
    },
    
    // Fehlerbehandlung
    errorHandling: {
        showNotifications: true,
        logToConsole: true,
        retryAttempts: 3,
        retryDelay: 1000
    },
    
    // CORS-Konfiguration
    cors: {
        allowedOrigins: [
            'https://mawps.netlify.app',
            'http://localhost:8000',
            'http://localhost:3000'
        ]
    }
};

// 🔧 ENHANCED AUTH SYSTEM
class EnhancedAuthSystem {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
        this.retryCount = 0;
        this.maxRetries = window.UNIFIED_AUTH_CONFIG.errorHandling.retryAttempts;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Enhanced Auth System...');
            
            // AWS SDK laden
            await this.loadAWSSDK();
            
            // AWS konfigurieren
            this.configureAWS();
            
            // Session prüfen
            this.checkCurrentUser();
            
            // Event Listeners
            this.setupEventListeners();
            
            // Periodische Session-Prüfung
            this.setupSessionMonitoring();
            
            this.isInitialized = true;
            console.log('✅ Enhanced Auth System initialized');
            
        } catch (error) {
            console.error('❌ Enhanced Auth System initialization failed:', error);
            this.handleError('System-Initialisierung fehlgeschlagen', error);
        }
    }
    
    async loadAWSSDK() {
        if (typeof AWS !== 'undefined') {
            return;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js';
            script.onload = () => {
                console.log('✅ AWS SDK loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load AWS SDK');
                reject(new Error('Failed to load AWS SDK'));
            };
            document.head.appendChild(script);
        });
    }
    
    configureAWS() {
        const config = window.UNIFIED_AUTH_CONFIG.cognito;
        
        AWS.config.update({
            region: config.region,
            retryDelayOptions: {
                customBackoff: function(retryCount) {
                    return Math.pow(2, retryCount) * 100;
                }
            }
        });
        
        this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
            region: config.region
        });
        
        console.log('🌍 AWS configured for region:', config.region);
    }
    
    setupEventListeners() {
        // Globale Fehlerbehandlung
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error);
        });
        
        // Unhandled Promise Rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason);
        });
        
        // Page Visibility Change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkCurrentUser();
            }
        });
        
        // Storage Change (für Multi-Tab Sync)
        window.addEventListener('storage', (event) => {
            if (event.key === window.UNIFIED_AUTH_CONFIG.token.storageKey) {
                this.checkCurrentUser();
            }
        });
    }
    
    setupSessionMonitoring() {
        // Alle 30 Sekunden Session prüfen
        setInterval(() => {
            this.checkCurrentUser();
        }, 30000);
        
        // Bei Page Focus Session prüfen
        window.addEventListener('focus', () => {
            this.checkCurrentUser();
        });
    }
    
    checkCurrentUser() {
        const session = localStorage.getItem(window.UNIFIED_AUTH_CONFIG.token.storageKey);
        
        if (session) {
            try {
                this.currentUser = JSON.parse(session);
                
                // Token-Ablauf prüfen
                if (this.isTokenExpired()) {
                    console.log('⏰ Token expired, attempting refresh...');
                    this.refreshToken();
                    return;
                }
                
                // Session validieren
                if (!this.currentUser.email || !this.currentUser.accessToken) {
                    throw new Error('Invalid session data');
                }
                
                this.updateUI(true);
                console.log('✅ User session restored');
                return true;
                
            } catch (error) {
                console.error('❌ Session validation failed:', error);
                this.logout();
                return false;
            }
        } else {
            console.log('ℹ️ No session found');
            this.updateUI(false);
            return false;
        }
    }
    
    isTokenExpired() {
        if (!this.currentUser || !this.currentUser.expiresIn || !this.currentUser.loginTime) {
            return true;
        }
        
        const currentTime = Math.floor(Date.now() / 1000);
        const loginTime = Math.floor(this.currentUser.loginTime / 1000);
        const tokenAge = currentTime - loginTime;
        const threshold = window.UNIFIED_AUTH_CONFIG.token.refreshThreshold;
        
        return tokenAge >= (this.currentUser.expiresIn - threshold);
    }
    
    async refreshToken() {
        if (!this.currentUser || !this.currentUser.refreshToken) {
            console.log('❌ No refresh token available');
            this.logout();
            return false;
        }
        
        try {
            const params = {
                AuthFlow: 'REFRESH_TOKEN_AUTH',
                ClientId: window.UNIFIED_AUTH_CONFIG.cognito.clientId,
                AuthParameters: {
                    REFRESH_TOKEN: this.currentUser.refreshToken
                }
            };
            
            const result = await this.cognitoIdentityServiceProvider.initiateAuth(params).promise();
            
            // Session aktualisieren
            this.currentUser.accessToken = result.AuthenticationResult.AccessToken;
            this.currentUser.idToken = result.AuthenticationResult.IdToken;
            this.currentUser.expiresIn = result.AuthenticationResult.ExpiresIn;
            this.currentUser.loginTime = Date.now();
            
            localStorage.setItem(
                window.UNIFIED_AUTH_CONFIG.token.storageKey, 
                JSON.stringify(this.currentUser)
            );
            
            console.log('✅ Token refreshed successfully');
            this.updateUI(true);
            return true;
            
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            this.logout();
            return false;
        }
    }
    
    updateUI(isLoggedIn) {
        // Einheitliche UI-Updates für alle Seiten
        const loginButtons = document.querySelectorAll('.nav-login-btn, .login-btn, button[class*="login"]');
        const profileButtons = document.querySelectorAll('.nav-profile-btn, .profile-btn, button[class*="profile"]');
        
        loginButtons.forEach(btn => {
            if (isLoggedIn) {
                btn.innerHTML = '<i class="fas fa-user"></i> Profil';
                btn.style.display = 'none';
            } else {
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
                btn.style.display = 'flex';
            }
        });
        
        profileButtons.forEach(btn => {
            btn.style.display = isLoggedIn ? 'flex' : 'none';
        });
        
        // User Info aktualisieren
        if (isLoggedIn && this.currentUser) {
            const userData = this.getUserDataFromToken();
            this.updateUserInfo(userData);
        }
    }
    
    getUserDataFromToken() {
        if (!this.currentUser || !this.currentUser.idToken) {
            return null;
        }
        
        try {
            const tokenParts = this.currentUser.idToken.split('.');
            if (tokenParts.length !== 3) {
                return null;
            }
            
            const payload = JSON.parse(atob(tokenParts[1]));
            return {
                email: payload.email,
                name: payload.name || payload.given_name || 'Benutzer',
                sub: payload.sub,
                emailVerified: payload.email_verified
            };
        } catch (error) {
            console.error('❌ Error decoding token:', error);
            return null;
        }
    }
    
    updateUserInfo(userData) {
        const userNameElements = document.querySelectorAll('.user-name, .nav-user-name, .global-user-name');
        const userEmailElements = document.querySelectorAll('.user-email, .nav-user-email, .global-user-email');
        
        userNameElements.forEach(el => {
            if (userData && userData.name) {
                el.textContent = userData.name;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
        
        userEmailElements.forEach(el => {
            if (userData && userData.email) {
                el.textContent = userData.email;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    handleGlobalError(error) {
        console.error('🚨 Global Error:', error);
        
        if (error.message && error.message.includes('CORS')) {
            this.showNotification('CORS-Fehler: Bitte Domain in AWS Cognito konfigurieren', 'error');
        } else if (error.message && error.message.includes('Network')) {
            this.showNotification('Netzwerk-Fehler: Bitte Internetverbindung prüfen', 'error');
        } else if (error.message && error.message.includes('Token')) {
            this.showNotification('Token-Fehler: Bitte erneut anmelden', 'error');
            this.logout();
        }
    }
    
    handleError(message, error) {
        console.error('❌ Auth Error:', message, error);
        
        if (window.UNIFIED_AUTH_CONFIG.errorHandling.showNotifications) {
            this.showNotification(message, 'error');
        }
        
        if (window.UNIFIED_AUTH_CONFIG.errorHandling.logToConsole) {
            console.error('Full error details:', error);
        }
    }
    
    showNotification(message, type = 'info') {
        // Entferne bestehende Notifications
        document.querySelectorAll('.auth-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem(window.UNIFIED_AUTH_CONFIG.token.storageKey);
        this.updateUI(false);
        this.showNotification('Erfolgreich abgemeldet!', 'success');
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize Enhanced Auth System
window.enhancedAuth = new EnhancedAuthSystem();

// CSS für Notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .auth-notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
`;
document.head.appendChild(style);
