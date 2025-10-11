// AWS Cognito Authentication System
class AWSAuthSystem {
    constructor() {
        // Use configuration from aws-config.js
        this.userPoolId = window.AWS_CONFIG?.userPoolId || 'eu-central-1_XXXXXXXXX';
        this.clientId = window.AWS_CONFIG?.clientId || 'XXXXXXXXXXXXXXXXXXXXXXXXXX';
        this.region = window.AWS_CONFIG?.region || 'eu-central-1';
        this.userPool = null;
        this.cognitoUser = null;
        this.currentUser = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Load AWS SDK
            if (typeof AWS === 'undefined') {
                await this.loadAWSSDK();
            }
            
            // Configure AWS
            AWS.config.region = this.region;
            
            // Initialize Cognito
            this.userPool = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            
            this.isInitialized = true;
            this.checkCurrentUser();
            
            console.log('✅ AWS Auth System initialized');
        } catch (error) {
            console.error('❌ AWS Auth System initialization failed:', error);
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
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load AWS SDK'));
            document.head.appendChild(script);
        });
    }

    // Login with email and password
    async login(email, password) {
        try {
            if (!this.isInitialized) {
                throw new Error('Auth system not initialized');
            }

            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            };

            const result = await this.userPool.initiateAuth(params).promise();
            
            if (result.AuthenticationResult) {
                this.currentUser = {
                    email: email,
                    accessToken: result.AuthenticationResult.AccessToken,
                    idToken: result.AuthenticationResult.IdToken,
                    refreshToken: result.AuthenticationResult.RefreshToken
                };
                
                // Store tokens
                this.storeTokens(this.currentUser);
                
                // Update UI
                this.updateUI(true);
                
                return { success: true, user: this.currentUser };
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error) 
            };
        }
    }

    // Register new user
    async register(email, password, firstName, lastName) {
        try {
            if (!this.isInitialized) {
                throw new Error('Auth system not initialized');
            }

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
                        Name: 'given_name',
                        Value: firstName
                    },
                    {
                        Name: 'family_name',
                        Value: lastName
                    }
                ]
            };

            const result = await this.userPool.signUp(params).promise();
            
            return { 
                success: true, 
                message: 'Registration successful. Please check your email for verification.',
                userSub: result.UserSub
            };
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error) 
            };
        }
    }

    // Confirm registration with verification code
    async confirmRegistration(email, code) {
        try {
            const params = {
                ClientId: this.clientId,
                Username: email,
                ConfirmationCode: code
            };

            await this.userPool.confirmSignUp(params).promise();
            
            return { success: true, message: 'Email verified successfully' };
        } catch (error) {
            console.error('Confirmation error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error) 
            };
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const params = {
                ClientId: this.clientId,
                Username: email
            };

            await this.userPool.forgotPassword(params).promise();
            
            return { 
                success: true, 
                message: 'Password reset code sent to your email' 
            };
        } catch (error) {
            console.error('Forgot password error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error) 
            };
        }
    }

    // Reset password with code
    async resetPassword(email, code, newPassword) {
        try {
            const params = {
                ClientId: this.clientId,
                Username: email,
                ConfirmationCode: code,
                Password: newPassword
            };

            await this.userPool.confirmForgotPassword(params).promise();
            
            return { 
                success: true, 
                message: 'Password reset successfully' 
            };
        } catch (error) {
            console.error('Reset password error:', error);
            return { 
                success: false, 
                error: this.getErrorMessage(error) 
            };
        }
    }

    // Logout
    async logout() {
        try {
            this.currentUser = null;
            this.clearTokens();
            this.updateUI(false);
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null && this.getStoredTokens() !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check current user from stored tokens
    async checkCurrentUser() {
        const tokens = this.getStoredTokens();
        if (tokens) {
            try {
                // Verify token is still valid
                const isValid = await this.verifyToken(tokens.accessToken);
                if (isValid) {
                    this.currentUser = tokens;
                    this.updateUI(true);
                } else {
                    this.clearTokens();
                    this.updateUI(false);
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                this.clearTokens();
                this.updateUI(false);
            }
        }
    }

    // Verify token validity
    async verifyToken(accessToken) {
        try {
            // Simple token validation - in production, you'd verify the JWT
            const params = {
                AccessToken: accessToken
            };
            
            await this.userPool.getUser(params).promise();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Store tokens in localStorage
    storeTokens(user) {
        const tokenData = {
            email: user.email,
            accessToken: user.accessToken,
            idToken: user.idToken,
            refreshToken: user.refreshToken,
            timestamp: Date.now()
        };
        
        localStorage.setItem('aws_auth_tokens', JSON.stringify(tokenData));
    }

    // Get stored tokens
    getStoredTokens() {
        try {
            const tokens = localStorage.getItem('aws_auth_tokens');
            if (tokens) {
                const tokenData = JSON.parse(tokens);
                // Check if tokens are not expired (24 hours)
                const isExpired = Date.now() - tokenData.timestamp > 24 * 60 * 60 * 1000;
                if (isExpired) {
                    this.clearTokens();
                    return null;
                }
                return tokenData;
            }
        } catch (error) {
            console.error('Error getting stored tokens:', error);
        }
        return null;
    }

    // Clear stored tokens
    clearTokens() {
        localStorage.removeItem('aws_auth_tokens');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userProgress');
    }

    // Update UI based on login status
    updateUI(isLoggedIn) {
        const loginBtn = document.querySelector('.nav-login-btn');
        const userDropdown = document.getElementById('userDropdown');
        const userSystem = document.getElementById('navUser');
        
        if (isLoggedIn && this.currentUser) {
            // Show user dropdown
            if (userSystem) {
                userSystem.style.display = 'block';
            }
            if (loginBtn) {
                loginBtn.style.display = 'none';
            }
            
            // Update user info
            this.updateUserInfo();
        } else {
            // Show login button
            if (loginBtn) {
                loginBtn.style.display = 'block';
            }
            if (userSystem) {
                userSystem.style.display = 'none';
            }
        }
    }

    // Update user information in UI
    updateUserInfo() {
        if (!this.currentUser) return;
        
        const userNameEl = document.querySelector('.user-name');
        const userEmailEl = document.querySelector('.user-email');
        
        if (userNameEl) {
            userNameEl.textContent = this.currentUser.firstName || 'User';
        }
        if (userEmailEl) {
            userEmailEl.textContent = this.currentUser.email;
        }
    }

    // Get user-friendly error message
    getErrorMessage(error) {
        if (error.code) {
            switch (error.code) {
                case 'UserNotFoundException':
                    return 'Benutzer nicht gefunden. Bitte überprüfen Sie Ihre E-Mail-Adresse.';
                case 'NotAuthorizedException':
                    return 'Falsches Passwort. Bitte versuchen Sie es erneut.';
                case 'UserNotConfirmedException':
                    return 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.';
                case 'UsernameExistsException':
                    return 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.';
                case 'InvalidPasswordException':
                    return 'Das Passwort entspricht nicht den Anforderungen.';
                case 'CodeMismatchException':
                    return 'Der Bestätigungscode ist falsch.';
                case 'ExpiredCodeException':
                    return 'Der Bestätigungscode ist abgelaufen.';
                case 'LimitExceededException':
                    return 'Zu viele Versuche. Bitte warten Sie einen Moment.';
                default:
                    return error.message || 'Ein unbekannter Fehler ist aufgetreten.';
            }
        }
        return error.message || 'Ein Fehler ist aufgetreten.';
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
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
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize AWS Auth System
window.awsAuth = new AWSAuthSystem();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);