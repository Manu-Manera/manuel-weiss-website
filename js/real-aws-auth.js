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
            
            this.showNotification('✅ E-Mail erfolgreich bestätigt! Sie können sich jetzt anmelden.', 'success');
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
            
            // Store session with proper data
            this.currentUser = {
                email: email,
                accessToken: result.AuthenticationResult.AccessToken,
                idToken: result.AuthenticationResult.IdToken,
                refreshToken: result.AuthenticationResult.RefreshToken,
                expiresIn: result.AuthenticationResult.ExpiresIn,
                tokenType: result.AuthenticationResult.TokenType,
                loginTime: Date.now()
            };
            
            console.log('💾 Storing user session:', this.currentUser);
            localStorage.setItem('aws_auth_session', JSON.stringify(this.currentUser));
            this.updateUI(true);
            
            this.showNotification('✅ Erfolgreich angemeldet!', 'success');
            
            // Don't redirect automatically - let user stay on current page
            console.log('✅ Login completed, staying on current page');
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
                // Show confirmation code input modal
                this.showConfirmationCodeModal(email);
                errorMessage = 'E-Mail-Adresse wurde noch nicht bestätigt. Bitte geben Sie den Bestätigungscode ein.';
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

    getCurrentUser() {
        return this.currentUser;
    }

    checkCurrentUser() {
        const session = localStorage.getItem('aws_auth_session');
        if (session) {
            try {
                this.currentUser = JSON.parse(session);
                console.log('🔍 Checking user session:', this.currentUser);
                
                // Check if token is expired (but don't auto-logout)
                if (this.isTokenExpired()) {
                    console.log('⏰ Token expired, but keeping session for now');
                    // Don't logout automatically - let user continue
                }
                
                // Validate session data
                if (!this.currentUser.email || !this.currentUser.accessToken) {
                    console.log('❌ Invalid session data, logging out');
                    this.logout();
                    return;
                }
                
                this.updateUI(true);
                console.log('✅ User session restored successfully');
                return true;
            } catch (error) {
                console.error('❌ Error parsing session:', error);
                localStorage.removeItem('aws_auth_session');
                this.updateUI(false);
            }
        } else {
            console.log('ℹ️ No session found');
            this.updateUI(false);
        }
        return false;
    }

    isTokenExpired() {
        if (!this.currentUser || !this.currentUser.expiresIn || !this.currentUser.loginTime) {
            console.log('❌ Token validation failed: missing data');
            return true;
        }
        
        // Calculate token age in seconds
        const currentTime = Math.floor(Date.now() / 1000);
        const loginTime = Math.floor(this.currentUser.loginTime / 1000);
        const tokenAge = currentTime - loginTime;
        
        console.log('🕐 Token age:', tokenAge, 'seconds, expires in:', this.currentUser.expiresIn, 'seconds');
        
        // Check if token is expired (with 5 minute buffer)
        const isExpired = tokenAge >= (this.currentUser.expiresIn - 300);
        
        if (isExpired) {
            console.log('⏰ Token expired');
        }
        
        return isExpired;
    }

    getUserDataFromToken() {
        if (!this.currentUser || !this.currentUser.idToken) {
            return null;
        }
        
        try {
            // Decode JWT token (simple base64 decode)
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

    updateUI(isLoggedIn) {
        // Einheitliche UI-Updates für alle Seiten
        const loginButtons = document.querySelectorAll('.nav-login-btn, .login-btn, button[class*="login"]');
        const profileButtons = document.querySelectorAll('.nav-profile-btn, .profile-btn, button[class*="profile"]');
        
        console.log('🔄 Updating UI, isLoggedIn:', isLoggedIn);
        console.log('👤 Current user:', this.currentUser);
        
        loginButtons.forEach(btn => {
            if (isLoggedIn && this.currentUser) {
                // Get user data from token
                const userData = this.getUserDataFromToken();
                console.log('👤 User data from token:', userData);
                
                // Update login button
                btn.innerHTML = '<i class="fas fa-user"></i> Profil';
                btn.style.display = 'flex';
                btn.onclick = () => {
                    // Redirect to profile or show dropdown
                    if (window.location.pathname.includes('user-profile.html')) {
                        return; // Already on profile page
                    }
                    window.location.href = 'user-profile.html';
                };
            } else {
                // Not logged in
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
                btn.style.display = 'flex';
                btn.onclick = () => {
                    // Show login modal
                    if (window.authModals && window.authModals.showLogin) {
                        window.authModals.showLogin();
                    } else {
                        // Fallback: redirect to login page
                        window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
                    }
                };
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

    showConfirmationCodeModal(email) {
        // Remove existing modals
        const existingModal = document.querySelector('.confirmation-code-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'confirmation-code-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>📧 E-Mail-Bestätigung erforderlich</h3>
                        <button class="modal-close" onclick="this.closest('.confirmation-code-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <p>Ihre E-Mail-Adresse <strong>${email}</strong> wurde noch nicht bestätigt.</p>
                        <p>Bitte geben Sie den Bestätigungscode ein, den Sie per E-Mail erhalten haben:</p>
                        <div class="input-group">
                            <input type="text" id="confirmationCodeInput" placeholder="Bestätigungscode eingeben" maxlength="6">
                            <button id="confirmCodeBtn" class="btn-primary">Bestätigen</button>
                        </div>
                        <div class="modal-actions">
                            <button id="resendCodeBtn" class="btn-secondary">Code erneut senden</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .confirmation-code-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                max-width: 500px;
                width: 100%;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 1.25rem;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                padding: 24px;
            }
            
            .input-group {
                display: flex;
                gap: 12px;
                margin: 16px 0;
            }
            
            .input-group input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 16px;
                text-align: center;
                letter-spacing: 2px;
                font-weight: 600;
            }
            
            .input-group input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .btn-primary, .btn-secondary {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .modal-actions {
                margin-top: 16px;
                text-align: center;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Add event listeners
        const confirmBtn = modal.querySelector('#confirmCodeBtn');
        const resendBtn = modal.querySelector('#resendCodeBtn');
        const codeInput = modal.querySelector('#confirmationCodeInput');

        confirmBtn.addEventListener('click', async () => {
            const code = codeInput.value.trim();
            if (!code) {
                this.showNotification('Bitte geben Sie den Bestätigungscode ein.', 'error');
                return;
            }

            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Bestätige...';

            try {
                const result = await this.confirmRegistration(email, code);
                if (result.success) {
                    modal.remove();
                    this.showNotification('✅ E-Mail erfolgreich bestätigt! Sie können sich jetzt anmelden.', 'success');
                }
            } catch (error) {
                console.error('Confirmation error:', error);
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Bestätigen';
            }
        });

        resendBtn.addEventListener('click', async () => {
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sende...';

            try {
                await this.resendConfirmationCode(email);
            } catch (error) {
                console.error('Resend error:', error);
            } finally {
                resendBtn.disabled = false;
                resendBtn.textContent = 'Code erneut senden';
            }
        });

        // Focus on input
        setTimeout(() => {
            codeInput.focus();
        }, 100);
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
