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
            console.log('🚀 Initializing Real AWS Cognito System...');
            
            // Load AWS SDK if not already loaded
            if (typeof AWS === 'undefined') {
                console.log('📦 Loading AWS SDK...');
                await this.loadAWSSDK();
                console.log('✅ AWS SDK loaded successfully');
            }
            
            // Wait a bit for AWS to be fully available
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Configure AWS
            AWS.config.region = this.region;
            console.log('🌍 AWS region configured:', this.region);
            
            // Initialize Cognito Identity Service Provider
            this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            console.log('🔐 Cognito Identity Service Provider initialized');
            
            this.isInitialized = true;
            this.checkCurrentUser();
            
            console.log('✅ Real AWS Cognito System initialized successfully');
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
        console.log('🚀 Starting registration process...');
        console.log('📧 Email:', email);
        console.log('👤 Name:', name);
        console.log('🔐 System initialized:', this.isInitialized);
        
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
                        Value: name
                    }
                ]
            };

            console.log('📤 Sending registration request to AWS Cognito...');
            console.log('📋 Parameters:', JSON.stringify(params, null, 2));
            
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
            console.error('❌ Error details:', {
                code: error.code,
                message: error.message,
                statusCode: error.statusCode
            });
            
            let errorMessage = 'Registrierung fehlgeschlagen. ';
            
            if (error.code === 'UsernameExistsException') {
                // Check if user is unconfirmed and try to resend code
                try {
                    console.log('🔄 User exists, attempting to resend confirmation code...');
                    await this.resendConfirmationCode(email);
                    errorMessage = 'Diese E-Mail-Adresse ist bereits registriert. Eine neue Bestätigungs-E-Mail wurde gesendet.';
                } catch (resendError) {
                    console.error('❌ Could not resend confirmation code:', resendError);
                    errorMessage += 'Diese E-Mail-Adresse ist bereits registriert. Bitte prüfen Sie Ihr E-Mail-Postfach oder warten Sie auf die Bestätigung.';
                }
            } else if (error.code === 'InvalidPasswordException') {
                errorMessage += 'Passwort entspricht nicht den Anforderungen.';
            } else if (error.code === 'InvalidParameterException') {
                errorMessage += 'Ungültige Eingabedaten.';
            } else if (error.code === 'LimitExceededException') {
                errorMessage += 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
            } else {
                errorMessage += (error.message || 'Unbekannter Fehler.') + ' (Code: ' + (error.code || 'UNKNOWN') + ')';
            }
            
            this.showNotification(errorMessage, 'error');
            return { success: false, error: error.message || 'Unknown error' };
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
        // Remove existing notifications to prevent overlap
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
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
            throw error;
        }
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
