/**
 * UNIFIED AWS AUTHENTICATION SYSTEM
 * Einheitliches Authentifizierungssystem für alle Seiten
 * Konsolidiert und optimiert aus real-aws-auth.js, aws-auth-system.js und unified-auth-config.js
 */

// ============================================================================
// KONFIGURATION
// ============================================================================

window.AWS_AUTH_CONFIG = {
    cognito: {
        userPoolId: 'eu-central-1_8gP4gLK9r',
        clientId: '7kc5tt6a23fgh53d60vkefm812',
        region: 'eu-central-1',
        domain: 'manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com'
    },
    token: {
        storageKey: 'aws_auth_session',
        refreshThreshold: 300, // 5 Minuten vor Ablauf
        maxRetries: 3
    },
    errorHandling: {
        showNotifications: true,
        logToConsole: true,
        retryAttempts: 3,
        retryDelay: 1000
    }
};

// ============================================================================
// HAUPTSYSTEM KLASSE
// ============================================================================

class UnifiedAWSAuth {
    constructor() {
        this.userPoolId = window.AWS_AUTH_CONFIG.cognito.userPoolId;
        this.clientId = window.AWS_AUTH_CONFIG.cognito.clientId;
        this.region = window.AWS_AUTH_CONFIG.cognito.region;
        this.currentUser = null;
        this.isInitialized = false;
        this.cognitoIdentityServiceProvider = null;
        this.retryCount = 0;
        
        this.init();
    }

    /**
     * Initialisierung des Auth-Systems
     */
    async init() {
        try {
            console.log('🚀 Initializing Unified AWS Auth System...');
            
            // AWS SDK laden
            if (typeof AWS === 'undefined') {
                console.log('📦 Loading AWS SDK...');
                await this.loadAWSSDK();
                console.log('✅ AWS SDK loaded successfully');
            }
            
            // Kurz warten für vollständige Verfügbarkeit
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // AWS konfigurieren
            AWS.config.region = this.region;
            console.log('🌍 AWS region configured:', this.region);
            
            // Cognito Identity Service Provider initialisieren
            this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            console.log('🔐 Cognito Identity Service Provider initialized');
            
            this.isInitialized = true;
            
            // Aktuelle Session prüfen
            this.checkCurrentUser();
            
            // Event Listeners einrichten
            this.setupEventListeners();
            
            // Session Monitoring
            this.setupSessionMonitoring();
            
            console.log('✅ Unified AWS Auth System initialized successfully');
        } catch (error) {
            console.error('❌ Unified AWS Auth System initialization failed:', error);
            this.showNotification('AWS SDK konnte nicht geladen werden. Bitte Seite neu laden.', 'error');
        }
    }

    /**
     * AWS SDK laden
     */
    async loadAWSSDK() {
        return new Promise((resolve, reject) => {
            if (typeof AWS !== 'undefined') {
                resolve();
                return;
            }
            
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

    /**
     * Event Listeners einrichten
     */
    setupEventListeners() {
        // Page Visibility Change - Session prüfen wenn Tab wieder aktiv wird
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkCurrentUser();
            }
        });
        
        // Storage Change - Multi-Tab Synchronisation
        window.addEventListener('storage', (event) => {
            if (event.key === window.AWS_AUTH_CONFIG.token.storageKey) {
                this.checkCurrentUser();
            }
        });
        
        // Window Focus - Session prüfen
        window.addEventListener('focus', () => {
            this.checkCurrentUser();
        });
    }

    /**
     * Session Monitoring einrichten
     */
    setupSessionMonitoring() {
        // Alle 30 Sekunden Session prüfen
        setInterval(() => {
            if (this.currentUser) {
                this.checkCurrentUser();
            }
        }, 30000);
    }

    // ============================================================================
    // REGISTRIERUNG
    // ============================================================================

    /**
     * Benutzer registrieren
     */
    async register(email, password, name) {
        console.log('🚀 Starting registration process...');
        console.log('📧 Email:', email);
        console.log('👤 Name:', name);
        
        if (!this.isInitialized) {
            const errorMsg = 'System wird noch initialisiert. Bitte warten...';
            console.error('❌', errorMsg);
            this.showNotification(errorMsg, 'error');
            return { success: false, error: 'System not initialized' };
        }

        if (!this.cognitoIdentityServiceProvider) {
            const errorMsg = 'AWS Cognito Service nicht verfügbar. Bitte Seite neu laden.';
            console.error('❌', errorMsg);
            this.showNotification(errorMsg, 'error');
            return { success: false, error: 'Cognito service not available' };
        }

        try {
            console.log('🚀 Starting real AWS Cognito registration...');
            
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
                        Value: name || email.split('@')[0]
                    }
                ]
            };

            console.log('📤 Sending registration request to AWS Cognito...');
            
            const result = await this.cognitoIdentityServiceProvider.signUp(params).promise();
            
            console.log('✅ Registration successful:', result);
            
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
            console.error('❌ Registration error:', error);
            console.error('❌ Error details:', {
                code: error.code,
                message: error.message,
                statusCode: error.statusCode
            });
            
            let errorMessage = 'Registrierung fehlgeschlagen. ';
            
            if (error.code === 'UsernameExistsException') {
                // Prüfe ob Benutzer unbestätigt ist und sende Code erneut
                try {
                    console.log('🔄 User exists, attempting to resend confirmation code...');
                    await this.resendConfirmationCode(email);
                    errorMessage = 'Diese E-Mail-Adresse ist bereits registriert. Eine neue Bestätigungs-E-Mail wurde gesendet.';
                } catch (resendError) {
                    console.error('❌ Could not resend confirmation code:', resendError);
                    errorMessage += 'Diese E-Mail-Adresse ist bereits registriert. Bitte prüfen Sie Ihr E-Mail-Postfach oder warten Sie auf die Bestätigung.';
                }
            } else if (error.code === 'InvalidPasswordException') {
                errorMessage += 'Passwort entspricht nicht den Anforderungen (min. 8 Zeichen, Groß- und Kleinbuchstaben, Zahlen).';
            } else if (error.code === 'InvalidParameterException') {
                errorMessage += 'Ungültige Eingabedaten. Bitte prüfen Sie Ihre Eingaben.';
            } else if (error.code === 'LimitExceededException') {
                errorMessage += 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
            } else {
                errorMessage += (error.message || 'Unbekannter Fehler.') + ' (Code: ' + (error.code || 'UNKNOWN') + ')';
            }
            
            this.showNotification(errorMessage, 'error');
            return { success: false, error: error.message || 'Unknown error' };
        }
    }

    /**
     * Registrierung mit zusätzlichen Attributen
     */
    async registerWithAttributes(email, password, firstName, lastName, attributes = {}) {
        if (!this.isInitialized) {
            return { success: false, error: 'System not initialized' };
        }

        try {
            const userAttributes = [
                {
                    Name: 'email',
                    Value: email
                },
                {
                    Name: 'given_name',
                    Value: firstName || ''
                },
                {
                    Name: 'family_name',
                    Value: lastName || ''
                }
            ];

            // Zusätzliche Attribute hinzufügen
            Object.keys(attributes).forEach(key => {
                userAttributes.push({
                    Name: key,
                    Value: attributes[key]
                });
            });

            const params = {
                ClientId: this.clientId,
                Username: email,
                Password: password,
                UserAttributes: userAttributes
            };

            const result = await this.cognitoIdentityServiceProvider.signUp(params).promise();
            
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
            console.error('❌ Registration error:', error);
            return this.handleAuthError(error, 'Registrierung');
        }
    }

    // ============================================================================
    // BESTÄTIGUNG
    // ============================================================================

    /**
     * Registrierung bestätigen
     */
    async confirmRegistration(email, confirmationCode) {
        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return { success: false, error: 'System not initialized' };
        }

        try {
            console.log('🚀 Starting real AWS Cognito confirmation...');
            
            const params = {
                ClientId: this.clientId,
                Username: email,
                ConfirmationCode: confirmationCode.trim()
            };

            console.log('📤 Sending confirmation request to AWS Cognito...');
            await this.cognitoIdentityServiceProvider.confirmSignUp(params).promise();
            
            console.log('✅ Confirmation successful');
            
            this.showNotification('✅ E-Mail erfolgreich bestätigt! Sie können sich jetzt anmelden.', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Confirmation error:', error);
            
            return this.handleAuthError(error, 'Bestätigung');
        }
    }

    /**
     * Bestätigungscode erneut senden
     */
    async resendConfirmationCode(email) {
        if (!this.isInitialized || !this.cognitoIdentityServiceProvider) {
            throw new Error('System not initialized');
        }

        try {
            console.log('📧 Resending confirmation code for:', email);
            
            const params = {
                ClientId: this.clientId,
                Username: email
            };

            const result = await this.cognitoIdentityServiceProvider.resendConfirmationCode(params).promise();
            console.log('✅ Confirmation code resent successfully');
            
            this.showNotification(
                'Neue Bestätigungs-E-Mail wurde gesendet! Bitte prüfen Sie Ihr E-Mail-Postfach.',
                'success'
            );
            
            return { success: true, codeDeliveryDetails: result.CodeDeliveryDetails };
            
        } catch (error) {
            console.error('❌ Resend confirmation code error:', error);
            this.handleAuthError(error, 'Code erneut senden');
            throw error;
        }
    }

    // ============================================================================
    // ANMELDUNG
    // ============================================================================

    /**
     * Benutzer anmelden
     */
    async login(email, password) {
        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return { success: false, error: 'System not initialized' };
        }

        try {
            console.log('🚀 Starting real AWS Cognito login...');
            
            // Für bekannte E-Mails: Verwende direkt den Username (UUID)
            // Das ist nötig weil Cognito den Username als UUID speichert, nicht als E-Mail
            const trimmedEmail = email.trim().toLowerCase();
            const usernameMappings = {
                'weiss-manuel@gmx.de': '037478a2-b031-7001-3e0d-2a116041afe1'
            };
            
            let usernameToTry = trimmedEmail;
            
            // Prüfe ob wir einen gespeicherten Username haben
            const storedUsername = localStorage.getItem(`cognito_username_${trimmedEmail}`);
            if (storedUsername) {
                usernameToTry = storedUsername;
                console.log('📝 Verwende gespeicherten Username:', usernameToTry);
            } else if (usernameMappings[trimmedEmail]) {
                // Verwende direkt den gemappten Username für bekannte E-Mails
                usernameToTry = usernameMappings[trimmedEmail];
                console.log('📝 Verwende gemappten Username für', trimmedEmail, ':', usernameToTry);
                // Speichere für zukünftige Logins
                localStorage.setItem(`cognito_username_${trimmedEmail}`, usernameToTry);
            }
            
            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    USERNAME: usernameToTry,
                    PASSWORD: password
                }
            };
            
            console.log('📤 Sending login request with params:', JSON.stringify(params, null, 2));
            console.log('🔑 Username wird verwendet:', usernameToTry);
            console.log('📧 E-Mail war:', trimmedEmail);
            
            const result = await this.cognitoIdentityServiceProvider.initiateAuth(params).promise();
            
            console.log('✅ Login successful:', result);
            
            // Session mit korrekten Daten speichern
            this.currentUser = {
                email: email.trim(),
                accessToken: result.AuthenticationResult.AccessToken,
                idToken: result.AuthenticationResult.IdToken,
                refreshToken: result.AuthenticationResult.RefreshToken,
                expiresIn: result.AuthenticationResult.ExpiresIn,
                tokenType: result.AuthenticationResult.TokenType,
                loginTime: Date.now()
            };
            
            console.log('💾 Storing user session:', this.currentUser);
            localStorage.setItem(window.AWS_AUTH_CONFIG.token.storageKey, JSON.stringify(this.currentUser));
            this.updateUI(true);
            
            this.showNotification('✅ Erfolgreich angemeldet!', 'success');
            
            console.log('✅ Login completed, staying on current page');
            return { success: true, user: this.currentUser };
            
        } catch (error) {
            console.error('❌ Login error:', error);
            
            let errorMessage = 'Anmeldung fehlgeschlagen. ';
            
            if (error.code === 'NotAuthorizedException') {
                errorMessage += 'Ungültige Anmeldedaten oder E-Mail nicht bestätigt.';
            } else if (error.code === 'UserNotFoundException') {
                errorMessage += 'Benutzer nicht gefunden.';
            } else if (error.code === 'InvalidPasswordException') {
                errorMessage += 'Ungültiges Passwort.';
            } else if (error.code === 'UserNotConfirmedException') {
                // Bestätigungsmodal anzeigen
                if (window.authModals) {
                    window.authModals.showVerification(email);
                }
                errorMessage = 'E-Mail-Adresse wurde noch nicht bestätigt. Bitte geben Sie den Bestätigungscode ein.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            this.showNotification(errorMessage, 'error');
            return { success: false, error: error.message };
        }
    }

    // ============================================================================
    // ABMELDUNG
    // ============================================================================

    /**
     * Benutzer abmelden
     */
    async logout() {
        try {
            // Refresh Token widerrufen falls vorhanden
            if (this.currentUser && this.currentUser.refreshToken) {
                try {
                    const params = {
                        ClientId: this.clientId,
                        Token: this.currentUser.refreshToken
                    };
                    
                    await this.cognitoIdentityServiceProvider.revokeToken(params).promise();
                    console.log('✅ Refresh token revoked');
                } catch (error) {
                    console.warn('⚠️ Could not revoke token:', error);
                }
            }
        } catch (error) {
            console.warn('⚠️ Logout token revocation failed:', error);
        }
        
        this.currentUser = null;
        localStorage.removeItem(window.AWS_AUTH_CONFIG.token.storageKey);
        this.updateUI(false);
        this.showNotification('Erfolgreich abgemeldet!', 'success');
        
        return { success: true };
    }

    // ============================================================================
    // PASSWORT ZURÜCKSETZEN
    // ============================================================================

    /**
     * Passwort zurücksetzen anfordern
     */
    async forgotPassword(email) {
        if (!this.isInitialized) {
            return { success: false, error: 'System not initialized' };
        }

        try {
            const params = {
                ClientId: this.clientId,
                Username: email.trim()
            };

            const result = await this.cognitoIdentityServiceProvider.forgotPassword(params).promise();
            
            this.showNotification(
                'Passwort-Reset-Code wurde an Ihre E-Mail-Adresse gesendet.',
                'success'
            );
            
            // E-Mail für Reset speichern
            localStorage.setItem('forgotPasswordEmail', email.trim());
            
            return { 
                success: true, 
                message: 'Password reset code sent',
                codeDeliveryDetails: result.CodeDeliveryDetails
            };
            
        } catch (error) {
            console.error('❌ Forgot password error:', error);
            return this.handleAuthError(error, 'Passwort zurücksetzen');
        }
    }

    /**
     * Passwort mit Code zurücksetzen
     */
    async resetPassword(email, confirmationCode, newPassword) {
        if (!this.isInitialized) {
            return { success: false, error: 'System not initialized' };
        }

        try {
            const params = {
                ClientId: this.clientId,
                Username: email.trim(),
                ConfirmationCode: confirmationCode.trim(),
                Password: newPassword
            };

            await this.cognitoIdentityServiceProvider.confirmForgotPassword(params).promise();
            
            // E-Mail aus localStorage entfernen
            localStorage.removeItem('forgotPasswordEmail');
            
            this.showNotification('✅ Passwort erfolgreich zurückgesetzt! Sie können sich jetzt anmelden.', 'success');
            
            return { success: true, message: 'Password reset successfully' };
            
        } catch (error) {
            console.error('❌ Reset password error:', error);
            return this.handleAuthError(error, 'Passwort zurücksetzen');
        }
    }

    // ============================================================================
    // SESSION VERWALTUNG
    // ============================================================================

    /**
     * Aktuelle Session prüfen
     */
    checkCurrentUser() {
        const session = localStorage.getItem(window.AWS_AUTH_CONFIG.token.storageKey);
        if (session) {
            try {
                this.currentUser = JSON.parse(session);
                console.log('🔍 Checking user session:', this.currentUser);
                
                // Token-Ablauf prüfen
                if (this.isTokenExpired()) {
                    console.log('⏰ Token expired, attempting refresh...');
                    this.refreshToken().catch(err => {
                        console.error('Token refresh failed:', err);
                        this.logout();
                    });
                    return false;
                }
                
                // Session-Daten validieren
                if (!this.currentUser.email || !this.currentUser.accessToken) {
                    console.log('❌ Invalid session data, logging out');
                    this.logout();
                    return false;
                }
                
                this.updateUI(true);
                console.log('✅ User session restored successfully');
                return true;
            } catch (error) {
                console.error('❌ Error parsing session:', error);
                localStorage.removeItem(window.AWS_AUTH_CONFIG.token.storageKey);
                this.updateUI(false);
            }
        } else {
            console.log('ℹ️ No session found');
            this.updateUI(false);
        }
        return false;
    }

    /**
     * Token-Ablauf prüfen
     */
    isTokenExpired() {
        if (!this.currentUser || !this.currentUser.expiresIn || !this.currentUser.loginTime) {
            console.log('❌ Token validation failed: missing data');
            return true;
        }
        
        // Token-Alter in Sekunden berechnen
        const currentTime = Math.floor(Date.now() / 1000);
        const loginTime = Math.floor(this.currentUser.loginTime / 1000);
        const tokenAge = currentTime - loginTime;
        
        console.log('🕐 Token age:', tokenAge, 'seconds, expires in:', this.currentUser.expiresIn, 'seconds');
        
        // Prüfe ob Token abgelaufen ist (mit 5 Minuten Puffer)
        const threshold = window.AWS_AUTH_CONFIG.token.refreshThreshold;
        const isExpired = tokenAge >= (this.currentUser.expiresIn - threshold);
        
        if (isExpired) {
            console.log('⏰ Token expired');
        }
        
        return isExpired;
    }

    /**
     * Token aktualisieren
     */
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
            
            localStorage.setItem(
                window.AWS_AUTH_CONFIG.token.storageKey,
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

    // ============================================================================
    // BENUTZERDATEN
    // ============================================================================

    /**
     * Benutzerdaten aus Token extrahieren
     */
    getUserDataFromToken() {
        if (!this.currentUser || !this.currentUser.idToken) {
            return null;
        }
        
        try {
            // JWT Token dekodieren (einfaches Base64)
            const tokenParts = this.currentUser.idToken.split('.');
            if (tokenParts.length !== 3) {
                console.error('❌ Invalid JWT token format');
                return null;
            }
            
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('👤 User data from token:', payload);
            
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

    /**
     * Prüfen ob Benutzer angemeldet ist
     */
    isLoggedIn() {
        return this.currentUser !== null && !this.isTokenExpired();
    }

    /**
     * Aktuellen Benutzer abrufen
     */
    getCurrentUser() {
        return this.currentUser;
    }

    // ============================================================================
    // UI UPDATES
    // ============================================================================

    /**
     * UI basierend auf Auth-Status aktualisieren
     */
    updateUI(isLoggedIn) {
        const loginBtn = document.querySelector('.nav-login-btn');
        const userDropdown = document.querySelector('.user-dropdown');
        const userAvatarSmall = document.querySelector('.user-avatar-small');
        const userNameSmall = document.querySelector('.user-name-small');
        const userEmailSmall = document.querySelector('.user-email-small');
        
        // Alle Login-Buttons finden
        const allLoginButtons = document.querySelectorAll('.nav-login-btn, .login-btn, button[onclick*="login"], button[onclick*="Login"]');
        const allUserMenus = document.querySelectorAll('.user-dropdown, .user-menu, .nav-user-menu');
        
        console.log('🔄 Updating UI, isLoggedIn:', isLoggedIn);
        console.log('👤 Current user:', this.currentUser);
        
        allLoginButtons.forEach(btn => {
            if (isLoggedIn && this.currentUser) {
                // Benutzer angemeldet
                const userData = this.getUserDataFromToken();
                
                if (userData) {
                    btn.innerHTML = `<i class="fas fa-user-circle"></i><span>${userData.name || 'Profil'}</span>`;
                    btn.style.display = 'flex';
                } else {
                    btn.innerHTML = '<i class="fas fa-user"></i> Profil';
                    btn.style.display = 'flex';
                }
            } else {
                // Nicht angemeldet
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
                btn.style.display = 'flex';
            }
        });
        
        // User Dropdown/Menu aktualisieren
        allUserMenus.forEach(menu => {
            if (isLoggedIn && this.currentUser) {
                const userData = this.getUserDataFromToken();
                
                if (userData) {
                    const nameEl = menu.querySelector('.user-name-small, .user-name, .nav-user-name');
                    const emailEl = menu.querySelector('.user-email-small, .user-email, .nav-user-email');
                    
                    if (nameEl) {
                        nameEl.textContent = userData.name || 'Benutzer';
                        console.log('✅ Updated user name:', userData.name);
                    }
                    if (emailEl) {
                        emailEl.textContent = userData.email || this.currentUser.email;
                        console.log('✅ Updated user email:', userData.email || this.currentUser.email);
                    }
                }
                
                menu.style.display = 'block';
            } else {
                menu.style.display = 'none';
            }
        });
        
        // Spezifische Elemente aktualisieren (für Rückwärtskompatibilität)
        if (loginBtn) {
            if (isLoggedIn && this.currentUser) {
                const userData = this.getUserDataFromToken();
                if (userData) {
                    loginBtn.innerHTML = `<i class="fas fa-user-circle"></i><span>${userData.name || 'Profil'}</span>`;
                    loginBtn.style.display = 'flex';
                }
            } else {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
                loginBtn.style.display = 'flex';
            }
        }
        
        if (userDropdown) {
            userDropdown.style.display = isLoggedIn && this.currentUser ? 'block' : 'none';
        }
        
        if (userAvatarSmall) {
            userAvatarSmall.style.display = isLoggedIn && this.currentUser ? 'flex' : 'none';
        }
        
        if (userNameSmall && isLoggedIn && this.currentUser) {
            const userData = this.getUserDataFromToken();
            if (userData) {
                userNameSmall.textContent = userData.name || 'Benutzer';
            }
        }
        
        if (userEmailSmall && isLoggedIn && this.currentUser) {
            const userData = this.getUserDataFromToken();
            if (userData) {
                userEmailSmall.textContent = userData.email || this.currentUser.email;
            }
        }
    }

    // ============================================================================
    // FEHLERBEHANDLUNG
    // ============================================================================

    /**
     * Auth-Fehler behandeln
     */
    handleAuthError(error, context = 'Operation') {
        let errorMessage = `${context} fehlgeschlagen. `;
        
        if (error.code === 'CodeMismatchException') {
            errorMessage += 'Ungültiger Bestätigungscode.';
        } else if (error.code === 'ExpiredCodeException') {
            errorMessage += 'Bestätigungscode ist abgelaufen. Bitte neuen Code anfordern.';
        } else if (error.code === 'NotAuthorizedException') {
            errorMessage += 'Benutzer ist bereits bestätigt oder existiert nicht.';
        } else if (error.code === 'InvalidPasswordException') {
            errorMessage += 'Passwort entspricht nicht den Anforderungen.';
        } else if (error.code === 'LimitExceededException') {
            errorMessage += 'Zu viele Versuche. Bitte warten Sie einen Moment.';
        } else if (error.code === 'UserNotFoundException') {
            errorMessage += 'Benutzer nicht gefunden.';
        } else {
            errorMessage += error.message || 'Unbekannter Fehler.';
        }
        
        this.showNotification(errorMessage, 'error');
        return { success: false, error: error.message };
    }

    // ============================================================================
    // NOTIFICATION SYSTEM
    // ============================================================================

    /**
     * Benachrichtigung anzeigen
     */
    showNotification(message, type = 'info') {
        // Entferne bestehende Notifications um Überlappungen zu vermeiden
        const existingNotifications = document.querySelectorAll('.aws-auth-notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // Notification-Element erstellen
        const notification = document.createElement('div');
        notification.className = `aws-auth-notification aws-auth-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Styles hinzufügen
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
            animation: slideInNotification 0.3s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        // Nach 8 Sekunden für Fehlermeldungen entfernen, 5 Sekunden für andere
        const duration = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            notification.style.animation = 'slideOutNotification 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

// Globale Instanz erstellen
window.awsAuth = new UnifiedAWSAuth();

// CSS für Notifications hinzufügen
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInNotification {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutNotification {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .aws-auth-notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .aws-auth-notification-content i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);

console.log('✅ Unified AWS Auth System loaded');

