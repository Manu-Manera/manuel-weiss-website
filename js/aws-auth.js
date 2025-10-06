/**
 * AWS Cognito Authentication System
 * Zentrale Authentifizierung für alle Seiten
 */

class AWSAuth {
    constructor() {
        this.userPoolId = 'eu-central-1_XXXXXXXXX'; // Wird durch CDK gesetzt
        this.clientId = 'XXXXXXXXXXXXXXXXXXXXXXXXXX'; // Wird durch CDK gesetzt
        this.region = 'eu-central-1';
        this.userPool = null;
        this.cognitoUser = null;
        this.currentUser = null;
        
        this.init();
    }

    async init() {
        try {
            // AWS SDK wird dynamisch geladen
            if (typeof AWS === 'undefined') {
                await this.loadAWSSDK();
            }
            
            // Cognito User Pool konfigurieren
            this.userPool = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            
            // Prüfen ob bereits eingeloggt
            await this.checkExistingSession();
        } catch (error) {
            console.error('AWS Auth Initialization Error:', error);
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
                AWS.config.region = this.region;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async checkExistingSession() {
        try {
            const session = await this.getCurrentSession();
            if (session && session.isValid()) {
                this.currentUser = session.getIdToken().payload;
                this.updateUI(true);
                return true;
            }
        } catch (error) {
            console.log('No valid session found');
        }
        return false;
    }

    async getCurrentSession() {
        return new Promise((resolve, reject) => {
            const cognitoUser = this.getCognitoUser();
            if (!cognitoUser) {
                reject(new Error('No user found'));
                return;
            }
            
            cognitoUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(session);
                }
            });
        });
    }

    getCognitoUser() {
        const userData = {
            Username: localStorage.getItem('cognitoUsername'),
            Pool: this.getUserPool()
        };
        
        if (!userData.Username) {
            return null;
        }
        
        return new AWS.CognitoIdentityServiceProvider.CognitoUser(userData);
    }

    getUserPool() {
        return new AWS.CognitoIdentityServiceProvider.CognitoUserPool({
            UserPoolId: this.userPoolId,
            ClientId: this.clientId
        });
    }

    async signUp(email, password, firstName, lastName) {
        try {
            const params = {
                ClientId: this.clientId,
                Username: email,
                Password: password,
                UserAttributes: [
                    { Name: 'email', Value: email },
                    { Name: 'given_name', Value: firstName },
                    { Name: 'family_name', Value: lastName }
                ]
            };

            const result = await this.userPool.signUp(params).promise();
            
            // Bestätigungscode senden
            this.showVerificationModal(email);
            
            return result;
        } catch (error) {
            console.error('Sign Up Error:', error);
            throw this.handleCognitoError(error);
        }
    }

    async signIn(email, password) {
        try {
            const authenticationData = {
                Username: email,
                Password: password
            };

            const authenticationDetails = new AWS.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
            
            const userData = {
                Username: email,
                Pool: this.getUserPool()
            };

            this.cognitoUser = new AWS.CognitoIdentityServiceProvider.CognitoUser(userData);
            
            return new Promise((resolve, reject) => {
                this.cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: (result) => {
                        this.currentUser = result.getIdToken().payload;
                        localStorage.setItem('cognitoUsername', email);
                        this.updateUI(true);
                        resolve(result);
                    },
                    onFailure: (err) => {
                        reject(this.handleCognitoError(err));
                    },
                    newPasswordRequired: (userAttributes, requiredAttributes) => {
                        // Neues Passwort erforderlich
                        this.showNewPasswordModal(userAttributes, requiredAttributes);
                        reject(new Error('New password required'));
                    }
                });
            });
        } catch (error) {
            console.error('Sign In Error:', error);
            throw this.handleCognitoError(error);
        }
    }

    async signOut() {
        try {
            if (this.cognitoUser) {
                this.cognitoUser.signOut();
            }
            
            localStorage.removeItem('cognitoUsername');
            this.currentUser = null;
            this.updateUI(false);
            
            return true;
        } catch (error) {
            console.error('Sign Out Error:', error);
            throw error;
        }
    }

    async forgotPassword(email) {
        try {
            const userData = {
                Username: email,
                Pool: this.getUserPool()
            };

            const cognitoUser = new AWS.CognitoIdentityServiceProvider.CognitoUser(userData);
            
            return new Promise((resolve, reject) => {
                cognitoUser.forgotPassword({
                    onSuccess: (result) => {
                        this.showPasswordResetModal(email);
                        resolve(result);
                    },
                    onFailure: (err) => {
                        reject(this.handleCognitoError(err));
                    }
                });
            });
        } catch (error) {
            console.error('Forgot Password Error:', error);
            throw this.handleCognitoError(error);
        }
    }

    async confirmPasswordReset(email, code, newPassword) {
        try {
            const userData = {
                Username: email,
                Pool: this.getUserPool()
            };

            const cognitoUser = new AWS.CognitoIdentityServiceProvider.CognitoUser(userData);
            
            return new Promise((resolve, reject) => {
                cognitoUser.confirmPassword(code, newPassword, {
                    onSuccess: () => {
                        resolve();
                    },
                    onFailure: (err) => {
                        reject(this.handleCognitoError(err));
                    }
                });
            });
        } catch (error) {
            console.error('Confirm Password Reset Error:', error);
            throw this.handleCognitoError(error);
        }
    }

    async changePassword(oldPassword, newPassword) {
        try {
            if (!this.cognitoUser) {
                throw new Error('User not authenticated');
            }

            return new Promise((resolve, reject) => {
                this.cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
                    if (err) {
                        reject(this.handleCognitoError(err));
                    } else {
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            console.error('Change Password Error:', error);
            throw this.handleCognitoError(error);
        }
    }

    async resendConfirmationCode(email) {
        try {
            const userData = {
                Username: email,
                Pool: this.getUserPool()
            };

            const cognitoUser = new AWS.CognitoIdentityServiceProvider.CognitoUser(userData);
            
            return new Promise((resolve, reject) => {
                cognitoUser.resendConfirmationCode((err, result) => {
                    if (err) {
                        reject(this.handleCognitoError(err));
                    } else {
                        resolve(result);
                    }
                });
            });
        } catch (error) {
            console.error('Resend Confirmation Code Error:', error);
            throw this.handleCognitoError(error);
        }
    }

    async confirmSignUp(email, code) {
        try {
            const params = {
                ClientId: this.clientId,
                Username: email,
                ConfirmationCode: code
            };

            const result = await this.userPool.confirmSignUp(params).promise();
            return result;
        } catch (error) {
            console.error('Confirm Sign Up Error:', error);
            throw this.handleCognitoError(error);
        }
    }

    handleCognitoError(error) {
        const errorMessages = {
            'UserNotFoundException': 'Benutzer nicht gefunden',
            'NotAuthorizedException': 'Ungültige Anmeldedaten',
            'UserNotConfirmedException': 'Konto nicht bestätigt. Bitte prüfen Sie Ihre E-Mails',
            'InvalidPasswordException': 'Passwort entspricht nicht den Anforderungen',
            'UsernameExistsException': 'Benutzer existiert bereits',
            'InvalidParameterException': 'Ungültige Eingabeparameter',
            'CodeMismatchException': 'Ungültiger Bestätigungscode',
            'ExpiredCodeException': 'Bestätigungscode abgelaufen',
            'LimitExceededException': 'Zu viele Versuche. Bitte warten Sie',
            'TooManyRequestsException': 'Zu viele Anfragen. Bitte warten Sie'
        };

        const errorCode = error.code || error.name;
        return new Error(errorMessages[errorCode] || error.message || 'Ein unbekannter Fehler ist aufgetreten');
    }

    updateUI(isLoggedIn) {
        const userInfo = document.getElementById('userInfo');
        const userLogin = document.getElementById('userLogin');
        
        if (isLoggedIn && this.currentUser) {
            if (userInfo) {
                document.getElementById('userName').textContent = 
                    `${this.currentUser.given_name} ${this.currentUser.family_name}`;
                document.getElementById('userEmail').textContent = this.currentUser.email;
                userInfo.style.display = 'flex';
            }
            if (userLogin) {
                userLogin.style.display = 'none';
            }
        } else {
            if (userInfo) {
                userInfo.style.display = 'none';
            }
            if (userLogin) {
                userLogin.style.display = 'flex';
            }
        }
    }

    showVerificationModal(email) {
        const modal = document.getElementById('verificationModal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('verificationEmail').textContent = email;
        }
    }

    showPasswordResetModal(email) {
        const modal = document.getElementById('passwordResetModal');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('resetEmail').textContent = email;
        }
    }

    showNewPasswordModal(userAttributes, requiredAttributes) {
        const modal = document.getElementById('newPasswordModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getAccessToken() {
        return new Promise((resolve, reject) => {
            if (!this.cognitoUser) {
                reject(new Error('User not authenticated'));
                return;
            }
            
            this.cognitoUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(session.getAccessToken().getJwtToken());
                }
            });
        });
    }
}

// Globale Instanz
window.awsAuth = new AWSAuth();

// Event Listeners für UI
document.addEventListener('DOMContentLoaded', function() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                await window.awsAuth.signIn(email, password);
                closeLoginModal();
                showSuccessMessage('Erfolgreich angemeldet!');
            } catch (error) {
                showErrorMessage(error.message);
            }
        });
    }

    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const firstName = document.getElementById('signupFirstName').value;
            const lastName = document.getElementById('signupLastName').value;
            
            try {
                await window.awsAuth.signUp(email, password, firstName, lastName);
                showSuccessMessage('Registrierung erfolgreich! Bitte prüfen Sie Ihre E-Mails.');
            } catch (error) {
                showErrorMessage(error.message);
            }
        });
    }

    // Verification Form
    const verificationForm = document.getElementById('verificationForm');
    if (verificationForm) {
        verificationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('verificationEmail').textContent;
            const code = document.getElementById('verificationCode').value;
            
            try {
                await window.awsAuth.confirmSignUp(email, code);
                closeVerificationModal();
                showSuccessMessage('Konto erfolgreich bestätigt!');
            } catch (error) {
                showErrorMessage(error.message);
            }
        });
    }

    // Password Reset Form
    const passwordResetForm = document.getElementById('passwordResetForm');
    if (passwordResetForm) {
        passwordResetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').textContent;
            const code = document.getElementById('resetCode').value;
            const newPassword = document.getElementById('newPassword').value;
            
            try {
                await window.awsAuth.confirmPasswordReset(email, code, newPassword);
                closePasswordResetModal();
                showSuccessMessage('Passwort erfolgreich zurückgesetzt!');
            } catch (error) {
                showErrorMessage(error.message);
            }
        });
    }
});

// Utility Functions
function showSuccessMessage(message) {
    // Implementierung für Success Message
    console.log('Success:', message);
}

function showErrorMessage(message) {
    // Implementierung für Error Message
    console.error('Error:', message);
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
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

function closePasswordResetModal() {
    const modal = document.getElementById('passwordResetModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeNewPasswordModal() {
    const modal = document.getElementById('newPasswordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AWSAuth;
}
