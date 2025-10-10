// Real AWS Cognito Authentication System - No Demo Fallback
class RealAWSAuth {
    constructor() {
        this.userPoolId = 'eu-central-1_8gP4gLK9r';
        this.clientId = '7kc5tt6a23fgh53d60vkefm812';
        this.region = 'eu-central-1';
        this.currentUser = null;
        this.isInitialized = false;
        this.cognitoIdentityServiceProvider = null;
        
        this.init();
    }

    async init() {
        try {
            // Load AWS SDK if not already loaded
            if (typeof AWS === 'undefined') {
                await this.loadAWSSDK();
            }
            
            // Configure AWS
            AWS.config.region = this.region;
            
            // Initialize Cognito Identity Service Provider
            this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            
            this.isInitialized = true;
            this.checkCurrentUser();
            
            console.log('✅ Real AWS Cognito System initialized');
        } catch (error) {
            console.error('❌ Real AWS Cognito System initialization failed:', error);
            this.showNotification('AWS SDK konnte nicht geladen werden. Bitte Seite neu laden.', 'error');
        }
    }

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

    async register(email, password, name) {
        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return { success: false, error: 'System not initialized' };
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
                        Value: name
                    }
                ]
            };

            console.log('📤 Sending registration request to AWS Cognito...');
            const result = await this.cognitoIdentityServiceProvider.signUp(params).promise();
            
            console.log('✅ Registration successful:', result);
            
            this.showNotification(
                'Registrierung erfolgreich! Bitte prüfen Sie Ihr E-Mail-Postfach für den Bestätigungscode.',
                'success'
            );
            
            return { 
                success: true, 
                userSub: result.UserSub,
                codeDeliveryDetails: result.CodeDeliveryDetails
            };
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            
            let errorMessage = 'Registrierung fehlgeschlagen. ';
            
            if (error.code === 'UsernameExistsException') {
                errorMessage += 'Diese E-Mail-Adresse ist bereits registriert.';
            } else if (error.code === 'InvalidPasswordException') {
                errorMessage += 'Passwort entspricht nicht den Anforderungen.';
            } else if (error.code === 'InvalidParameterException') {
                errorMessage += 'Ungültige Eingabedaten.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            this.showNotification(errorMessage, 'error');
            return { success: false, error: error.message };
        }
    }

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
                ConfirmationCode: confirmationCode
            };

            console.log('📤 Sending confirmation request to AWS Cognito...');
            await this.cognitoIdentityServiceProvider.confirmSignUp(params).promise();
            
            console.log('✅ Confirmation successful');
            
            this.showNotification('E-Mail erfolgreich bestätigt! Sie können sich jetzt anmelden.', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Confirmation error:', error);
            
            let errorMessage = 'Bestätigung fehlgeschlagen. ';
            
            if (error.code === 'CodeMismatchException') {
                errorMessage += 'Ungültiger Bestätigungscode.';
            } else if (error.code === 'ExpiredCodeException') {
                errorMessage += 'Bestätigungscode ist abgelaufen.';
            } else if (error.code === 'NotAuthorizedException') {
                errorMessage += 'Benutzer ist bereits bestätigt oder existiert nicht.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            this.showNotification(errorMessage, 'error');
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return { success: false, error: 'System not initialized' };
        }

        try {
            console.log('🚀 Starting real AWS Cognito login...');
            
            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            };

            console.log('📤 Sending login request to AWS Cognito...');
            const result = await this.cognitoIdentityServiceProvider.initiateAuth(params).promise();
            
            console.log('✅ Login successful:', result);
            
            // Store session
            this.currentUser = {
                email: email,
                accessToken: result.AuthenticationResult.AccessToken,
                idToken: result.AuthenticationResult.IdToken,
                refreshToken: result.AuthenticationResult.RefreshToken,
                expiresIn: result.AuthenticationResult.ExpiresIn
            };
            
            localStorage.setItem('aws_auth_session', JSON.stringify(this.currentUser));
            this.updateUI(true);
            
            this.showNotification('Erfolgreich angemeldet!', 'success');
            return { success: true };
            
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
                errorMessage += 'E-Mail-Adresse wurde noch nicht bestätigt.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            this.showNotification(errorMessage, 'error');
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            if (this.currentUser && this.currentUser.refreshToken) {
                // Revoke refresh token
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
        
        this.currentUser = null;
        localStorage.removeItem('aws_auth_session');
        this.updateUI(false);
        this.showNotification('Erfolgreich abgemeldet!', 'success');
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    checkCurrentUser() {
        const session = localStorage.getItem('aws_auth_session');
        if (session) {
            try {
                this.currentUser = JSON.parse(session);
                
                // Check if token is expired
                if (this.isTokenExpired()) {
                    console.log('🔄 Token expired, logging out');
                    this.logout();
                    return;
                }
                
                this.updateUI(true);
                console.log('✅ User session restored');
            } catch (error) {
                console.error('❌ Error parsing session:', error);
                localStorage.removeItem('aws_auth_session');
                this.updateUI(false);
            }
        } else {
            this.updateUI(false);
        }
    }

    isTokenExpired() {
        if (!this.currentUser || !this.currentUser.expiresIn) {
            return true;
        }
        
        // Simple expiration check (in production, you'd want more sophisticated token validation)
        const tokenAge = Date.now() - (this.currentUser.expiresIn * 1000);
        return tokenAge > 0;
    }

    updateUI(isLoggedIn) {
        const loginBtn = document.querySelector('.nav-login-btn');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (loginBtn) {
            if (isLoggedIn) {
                loginBtn.innerHTML = '<i class="fas fa-user"></i> Profil';
                loginBtn.style.display = 'none';
                if (userDropdown) {
                    userDropdown.style.display = 'block';
                }
            } else {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
                loginBtn.style.display = 'flex';
                if (userDropdown) {
                    userDropdown.style.display = 'none';
                }
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
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
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 8 seconds for error messages
        const duration = type === 'error' ? 8000 : 5000;
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Test method to create a test user
    async createTestUser() {
        const testEmail = 'test@mawps.netlify.app';
        const testPassword = 'TestPassword123!';
        const testName = 'Test User';
        
        console.log('🧪 Creating test user...');
        
        try {
            const result = await this.register(testEmail, testPassword, testName);
            if (result.success) {
                console.log('✅ Test user created successfully');
                this.showNotification('Test-Benutzer erstellt! E-Mail: test@mawps.netlify.app', 'success');
                return result;
            } else {
                console.error('❌ Test user creation failed:', result.error);
                return result;
            }
        } catch (error) {
            console.error('❌ Test user creation error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize the real AWS auth system
window.awsAuth = new RealAWSAuth();

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
`;
document.head.appendChild(style);

// Global test function
window.createTestUser = () => {
    if (window.awsAuth) {
        window.awsAuth.createTestUser();
    }
};
