// 🔧 FIXED AUTH SYSTEM - Komplette Lösung für alle Token-Probleme
// Ersetzt alle bestehenden Auth-Systeme mit einer robusten Lösung

class FixedAuthSystem {
    constructor() {
        this.userPoolId = 'eu-central-1_8gP4gLK9r';
        this.clientId = '7kc5tt6a23fgh53d60vkefm812';
        this.region = 'eu-central-1';
        this.currentUser = null;
        this.isInitialized = false;
        this.cognitoIdentityServiceProvider = null;
        this.refreshTimer = null;
        
        // Konfiguration
        this.config = {
            storageKey: 'aws_auth_session',
            refreshThreshold: 300, // 5 Minuten vor Ablauf
            maxRetries: 3,
            retryDelay: 1000
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Fixed Auth System...');
            
            // AWS SDK laden
            await this.loadAWSSDK();
            
            // AWS konfigurieren
            this.configureAWS();
            
            // Session aus localStorage wiederherstellen
            this.restoreSession();
            
            // Event Listeners
            this.setupEventListeners();
            
            // Periodische Token-Prüfung
            this.setupTokenRefresh();
            
            this.isInitialized = true;
            console.log('✅ Fixed Auth System initialized');
            
        } catch (error) {
            console.error('❌ Fixed Auth System initialization failed:', error);
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
        AWS.config.update({
            region: this.region,
            retryDelayOptions: {
                customBackoff: function(retryCount) {
                    return Math.pow(2, retryCount) * 100;
                }
            }
        });
        
        this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
            region: this.region
        });
        
        console.log('🌍 AWS configured for region:', this.region);
    }
    
    setupEventListeners() {
        // Storage Change (Multi-Tab Sync)
        window.addEventListener('storage', (event) => {
            if (event.key === this.config.storageKey) {
                this.restoreSession();
            }
        });
        
        // Page Visibility Change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkTokenValidity();
            }
        });
        
        // Before Unload (Session speichern)
        window.addEventListener('beforeunload', () => {
            this.saveSession();
        });
    }
    
    setupTokenRefresh() {
        // Alle 5 Minuten Token prüfen
        this.refreshTimer = setInterval(() => {
            this.checkTokenValidity();
        }, 300000);
        
        // Bei Page Focus Token prüfen
        window.addEventListener('focus', () => {
            this.checkTokenValidity();
        });
    }
    
    async login(email, password) {
        if (!this.isInitialized) {
            throw new Error('System not initialized');
        }
        
        try {
            console.log('🔐 Starting login process...');
            
            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            };
            
            const result = await this.cognitoIdentityServiceProvider.initiateAuth(params).promise();
            
            console.log('✅ Login successful');
            
            // Session speichern
            this.currentUser = {
                email: email,
                accessToken: result.AuthenticationResult.AccessToken,
                idToken: result.AuthenticationResult.IdToken,
                refreshToken: result.AuthenticationResult.RefreshToken,
                expiresIn: result.AuthenticationResult.ExpiresIn,
                tokenType: result.AuthenticationResult.TokenType,
                loginTime: Date.now()
            };
            
            // Persistent speichern
            this.saveSession();
            
            // UI aktualisieren
            this.updateUI(true);
            
            // Success Notification
            this.showNotification('✅ Erfolgreich angemeldet!', 'success');
            
            return { success: true, user: this.currentUser };
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            this.handleLoginError(error);
            return { success: false, error: error.message };
        }
    }
    
    async register(email, password, name) {
        if (!this.isInitialized) {
            throw new Error('System not initialized');
        }
        
        try {
            console.log('📝 Starting registration process...');
            
            const params = {
                ClientId: this.clientId,
                Username: email,
                Password: password,
                UserAttributes: [
                    {
                        Name: 'email',
                        Value: email
                    },
                    {
                        Name: 'name',
                        Value: name
                    }
                ]
            };
            
            const result = await this.cognitoIdentityServiceProvider.signUp(params).promise();
            
            console.log('✅ Registration successful');
            
            this.showNotification(
                '✅ Registrierung erfolgreich! Bitte prüfen Sie Ihr E-Mail-Postfach für den Bestätigungscode.',
                'success'
            );
            
            return { 
                success: true, 
                userSub: result.UserSub,
                codeDeliveryDetails: result.CodeDeliveryDetails
            };
            
        } catch (error) {
            console.error('❌ Registration failed:', error);
            this.handleRegistrationError(error);
            return { success: false, error: error.message };
        }
    }
    
    async confirmRegistration(email, confirmationCode) {
        try {
            const params = {
                ClientId: this.clientId,
                Username: email,
                ConfirmationCode: confirmationCode
            };
            
            await this.cognitoIdentityServiceProvider.confirmSignUp(params).promise();
            
            this.showNotification('✅ E-Mail erfolgreich bestätigt! Sie können sich jetzt anmelden.', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Confirmation failed:', error);
            this.handleError('Bestätigung fehlgeschlagen', error);
            return { success: false, error: error.message };
        }
    }
    
    async logout() {
        try {
            // Refresh Token widerrufen (falls vorhanden)
            if (this.currentUser && this.currentUser.refreshToken) {
                const params = {
                    ClientId: this.clientId,
                    Token: this.currentUser.refreshToken
                };
                
                await this.cognitoIdentityServiceProvider.revokeToken(params).promise();
                console.log('✅ Refresh token revoked');
            }
        } catch (error) {
            console.warn('⚠️ Could not revoke token:', error);
        }
        
        // Session löschen
        this.currentUser = null;
        localStorage.removeItem(this.config.storageKey);
        
        // Timer stoppen
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        // UI aktualisieren
        this.updateUI(false);
        
        this.showNotification('Erfolgreich abgemeldet!', 'success');
    }
    
    restoreSession() {
        const session = localStorage.getItem(this.config.storageKey);
        
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
                console.error('❌ Session restoration failed:', error);
                this.logout();
                return false;
            }
        } else {
            console.log('ℹ️ No session found');
            this.updateUI(false);
            return false;
        }
    }
    
    saveSession() {
        if (this.currentUser) {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.currentUser));
            console.log('💾 Session saved');
        }
    }
    
    isTokenExpired() {
        if (!this.currentUser || !this.currentUser.expiresIn || !this.currentUser.loginTime) {
            return true;
        }
        
        const currentTime = Math.floor(Date.now() / 1000);
        const loginTime = Math.floor(this.currentUser.loginTime / 1000);
        const tokenAge = currentTime - loginTime;
        const threshold = this.config.refreshThreshold;
        
        return tokenAge >= (this.currentUser.expiresIn - threshold);
    }
    
    async checkTokenValidity() {
        if (!this.currentUser) {
            return false;
        }
        
        if (this.isTokenExpired()) {
            console.log('⏰ Token expired, attempting refresh...');
            return await this.refreshToken();
        }
        
        return true;
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
                ClientId: this.clientId,
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
            
            // Speichern
            this.saveSession();
            
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
    
    handleLoginError(error) {
        let errorMessage = 'Anmeldung fehlgeschlagen. ';
        
        if (error.code === 'NotAuthorizedException') {
            errorMessage += 'Ungültige Anmeldedaten oder E-Mail nicht bestätigt.';
        } else if (error.code === 'UserNotFoundException') {
            errorMessage += 'Benutzer nicht gefunden.';
        } else if (error.code === 'InvalidPasswordException') {
            errorMessage += 'Ungültiges Passwort.';
        } else if (error.code === 'UserNotConfirmedException') {
            errorMessage += 'E-Mail-Adresse wurde noch nicht bestätigt.';
        } else if (error.code === 'TooManyRequestsException') {
            errorMessage += 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
        } else {
            errorMessage += error.message || 'Unbekannter Fehler.';
        }
        
        this.showNotification(errorMessage, 'error');
    }
    
    handleRegistrationError(error) {
        let errorMessage = 'Registrierung fehlgeschlagen. ';
        
        if (error.code === 'UsernameExistsException') {
            errorMessage += 'Diese E-Mail-Adresse ist bereits registriert.';
        } else if (error.code === 'InvalidPasswordException') {
            errorMessage += 'Passwort entspricht nicht den Anforderungen.';
        } else if (error.code === 'InvalidParameterException') {
            errorMessage += 'Ungültige Eingabedaten.';
        } else if (error.code === 'LimitExceededException') {
            errorMessage += 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
        } else {
            errorMessage += error.message || 'Unbekannter Fehler.';
        }
        
        this.showNotification(errorMessage, 'error');
    }
    
    handleError(message, error) {
        console.error('❌ Auth Error:', message, error);
        this.showNotification(message, 'error');
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
    
    // Public API
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getAccessToken() {
        return this.currentUser ? this.currentUser.accessToken : null;
    }
    
    getIdToken() {
        return this.currentUser ? this.currentUser.idToken : null;
    }
}

// Initialize Fixed Auth System
window.fixedAuth = new FixedAuthSystem();

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
