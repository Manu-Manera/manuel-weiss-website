// Admin Authentication System - Speziell für Admin-Panel
// Verwendet AWS Cognito mit Admin-Gruppen-Prüfung

class AdminAuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.userData = null;
        
        // AWS Cognito Configuration
        this.userPoolId = window.AWS_CONFIG?.userPoolId || 'eu-central-1_8gP4gLK9r';
        this.clientId = window.AWS_CONFIG?.clientId || '7kc5tt6a23fgh53d60vkefm812';
        this.region = window.AWS_CONFIG?.region || 'eu-central-1';
        this.cognitoIdentityServiceProvider = null;
        this.isInitialized = false;
        
        // Session Storage Keys
        this.SESSION_KEY = 'admin_auth_session';
        this.USER_KEY = 'admin_user_data';
    }

    async init() {
        console.log('🔐 Initializing Admin Auth System...');
        
        try {
            // Load AWS SDK if not already loaded
            if (typeof AWS === 'undefined') {
                console.log('📦 Loading AWS SDK...');
                await this.loadAWSSDK();
            }
            
            // Configure AWS
            AWS.config.region = this.region;
            
            // Initialize Cognito Identity Service Provider
            this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            
            this.isInitialized = true;
            console.log('✅ Admin Auth System initialized');
            
            // Check for existing session
            await this.checkExistingSession();
            
            // Setup form handlers if on login page
            if (document.getElementById('login-form')) {
                this.setupLoginForm();
            }
            
            // Check if we're on admin page and need to verify auth
            if (window.location.pathname.includes('/admin.html') || window.location.pathname.includes('/admin')) {
                await this.verifyAdminAccess();
            }
            
        } catch (error) {
            console.error('❌ Admin Auth initialization error:', error);
            this.showNotification('Fehler beim Initialisieren des Auth-Systems. Bitte Seite neu laden.', 'error');
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

    async checkExistingSession() {
        try {
            const storedSession = localStorage.getItem(this.SESSION_KEY);
            
            if (!storedSession) {
                console.log('ℹ️ No stored admin session found');
                return;
            }
            
            const session = JSON.parse(storedSession);
            const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
            
            // Check if session is still valid
            if (expiresAt && expiresAt < new Date()) {
                console.log('⏰ Admin session expired');
                this.clearSession();
                return;
            }
            
            // Restore session
            this.currentUser = session.user;
            this.isAuthenticated = true;
            
            // Verify user is still admin
            await this.verifyAdminStatus();
            
            console.log('✅ Admin session restored');
            
        } catch (error) {
            console.error('❌ Error checking existing session:', error);
            this.clearSession();
        }
    }
    
    async verifyAdminStatus() {
        try {
            if (!this.currentUser || !this.currentUser.idToken) {
                this.isAdmin = false;
                return false;
            }
            
            // Decode JWT token to get user info und Gruppen
            const tokenPayload = this.decodeJWT(this.currentUser.idToken);
            const username = tokenPayload['cognito:username'] || tokenPayload.sub;
            
            // Gruppen aus ID Token extrahieren (Cognito fügt sie automatisch hinzu)
            const groups = tokenPayload['cognito:groups'] || [];
            this.isAdmin = groups.includes('admin');
            
            // Fallback: Versuche über Admin-API wenn nicht im Token
            if (!this.isAdmin) {
                try {
                    const apiGroups = await this.getUserGroups(username);
                    this.isAdmin = apiGroups.includes('admin');
                } catch (apiError) {
                    console.warn('⚠️ Admin-API nicht verfügbar für Status-Prüfung:', apiError);
                }
            }
            
            if (!this.isAdmin) {
                console.warn('⚠️ User is not in admin group');
                this.clearSession();
                this.redirectToLogin();
            }
            
            return this.isAdmin;
            
        } catch (error) {
            console.error('❌ Error verifying admin status:', error);
            this.isAdmin = false;
            return false;
        }
    }
    
    async getUserGroups(username) {
        try {
            const params = {
                UserPoolId: this.userPoolId,
                Username: username
            };
            
            const result = await this.cognitoIdentityServiceProvider.adminListGroupsForUser(params).promise();
            return result.Groups.map(group => group.GroupName);
            
        } catch (error) {
            console.error('❌ Error getting user groups:', error);
            return [];
        }
    }
    
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('❌ Error decoding JWT:', error);
            return {};
        }
    }
    
    async verifyAdminAccess() {
        if (!this.isAuthenticated || !this.isAdmin) {
            console.log('🔒 Admin access denied - redirecting to login');
            this.redirectToLogin();
            return false;
        }
        return true;
    }
    
    setupLoginForm() {
        const form = document.getElementById('login-form');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginButton = document.getElementById('login-button');
        
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            // Clear previous errors
            this.clearErrors();
            
            // Validate inputs
            if (!email) {
                this.showError('email', 'Bitte geben Sie eine E-Mail-Adresse ein');
                return;
            }
            
            if (!password) {
                this.showError('password', 'Bitte geben Sie ein Passwort ein');
                return;
            }
            
            // Show loading state
            loginButton.disabled = true;
            loginButton.classList.add('loading');
            
            try {
                const result = await this.login(email, password);
                
                if (result.success) {
                    // Show success message
                    const successMsg = document.getElementById('success-message');
                    if (successMsg) {
                        successMsg.classList.add('show');
                    }
                    
                    // Redirect to admin panel after short delay
                    setTimeout(() => {
                        window.location.href = '/admin.html';
                    }, 1000);
                } else {
                    this.showError('password', result.error || 'Anmeldung fehlgeschlagen');
                    loginButton.disabled = false;
                    loginButton.classList.remove('loading');
                }
                
            } catch (error) {
                console.error('❌ Login error:', error);
                this.showError('password', 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                loginButton.disabled = false;
                loginButton.classList.remove('loading');
            }
        });
    }
    
    async login(email, password) {
        if (!this.isInitialized) {
            throw new Error('Auth system not initialized');
        }
        
        try {
            console.log('🔐 Starting admin login...');
            
            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            };
            
            const result = await this.cognitoIdentityServiceProvider.initiateAuth(params).promise();
            
            if (!result.AuthenticationResult) {
                throw new Error('Authentication failed');
            }
            
            // Get user info
            const accessToken = result.AuthenticationResult.AccessToken;
            const idToken = result.AuthenticationResult.IdToken;
            const refreshToken = result.AuthenticationResult.RefreshToken;
            
            // Get user details
            const userInfo = await this.getUserInfo(accessToken);
            
            // Verify user is admin - Gruppen aus ID Token extrahieren (nicht über Admin-API)
            const username = userInfo.Username;
            
            // Gruppen aus ID Token extrahieren (Cognito fügt sie automatisch hinzu)
            const tokenPayload = this.decodeJWT(idToken);
            const groups = tokenPayload['cognito:groups'] || [];
            
            console.log('🔍 Gruppen aus ID Token:', groups);
            
            if (!groups.includes('admin')) {
                // Fallback: Versuche über Admin-API (kann fehlschlagen ohne Admin-Rechte)
                try {
                    const apiGroups = await this.getUserGroups(username);
                    console.log('🔍 Gruppen aus Admin-API:', apiGroups);
                    if (apiGroups.includes('admin')) {
                        console.log('✅ Admin-Gruppe über API gefunden');
                    } else {
                        throw new Error('Zugriff verweigert: Sie sind kein Administrator');
                    }
                } catch (apiError) {
                    console.warn('⚠️ Admin-API nicht verfügbar, verwende ID Token:', apiError);
                    if (!groups.includes('admin')) {
                        throw new Error('Zugriff verweigert: Sie sind kein Administrator');
                    }
                }
            }
            
            // Create session
            const expiresIn = result.AuthenticationResult.ExpiresIn || 3600;
            const expiresAt = new Date(Date.now() + expiresIn * 1000);
            
            this.currentUser = {
                email: email,
                username: username,
                accessToken: accessToken,
                idToken: idToken,
                refreshToken: refreshToken,
                expiresAt: expiresAt.toISOString(),
                userInfo: userInfo
            };
            
            this.isAuthenticated = true;
            this.isAdmin = true;
            
            // Save session
            this.saveSession();
            
            // Load user profile from DynamoDB
            await this.loadAdminProfile();
            
            console.log('✅ Admin login successful');
            
            return { success: true, user: this.currentUser };
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            
            let errorMessage = 'Anmeldung fehlgeschlagen';
            
            if (error.code === 'NotAuthorizedException') {
                errorMessage = 'Falsche E-Mail-Adresse oder Passwort';
            } else if (error.code === 'UserNotConfirmedException') {
                errorMessage = 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse';
            } else if (error.code === 'UserNotFoundException') {
                errorMessage = 'Benutzer nicht gefunden';
            } else if (error.message.includes('Administrator')) {
                errorMessage = error.message;
            } else {
                errorMessage = error.message || 'Ein Fehler ist aufgetreten';
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    async getUserInfo(accessToken) {
        try {
            const params = {
                AccessToken: accessToken
            };
            
            const result = await this.cognitoIdentityServiceProvider.getUser(params).promise();
            
            return {
                Username: result.Username,
                Attributes: result.UserAttributes.reduce((acc, attr) => {
                    acc[attr.Name] = attr.Value;
                    return acc;
                }, {})
            };
            
        } catch (error) {
            console.error('❌ Error getting user info:', error);
            throw error;
        }
    }
    
    async loadAdminProfile() {
        try {
            if (!this.currentUser || !this.currentUser.username) {
                return;
            }
            
            // Load profile from DynamoDB using awsProfileAPI if available
            // Note: awsProfileAPI.loadProfile() doesn't take parameters, it uses the current auth context
            // For admin, we need to load by userId directly from DynamoDB or API
            if (window.awsProfileAPI && window.awsProfileAPI.loadProfile) {
                try {
                    // Try to load profile - awsProfileAPI uses current auth context
                    const profile = await window.awsProfileAPI.loadProfile();
                    if (profile) {
                        this.userData = profile;
                        localStorage.setItem(this.USER_KEY, JSON.stringify(profile));
                        console.log('✅ Admin profile loaded from awsProfileAPI');
                    }
                } catch (apiError) {
                    console.warn('⚠️ Could not load via awsProfileAPI, trying direct API call:', apiError);
                    // Fallback: Try direct API call with admin's access token
                    await this.loadAdminProfileDirect();
                }
            } else {
                // Fallback: Direct API call
                await this.loadAdminProfileDirect();
            }
            
        } catch (error) {
            console.warn('⚠️ Error loading admin profile:', error);
        }
    }
    
    async loadAdminProfileDirect() {
        try {
            if (!this.currentUser || !this.currentUser.accessToken) {
                return;
            }
            
            // Direct API call to profile endpoint
            const apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl || window.AWS_CONFIG?.apiGateway?.baseUrl;
            if (apiBaseUrl) {
                const response = await fetch(`${apiBaseUrl}/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.currentUser.idToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const profile = await response.json();
                    this.userData = profile;
                    localStorage.setItem(this.USER_KEY, JSON.stringify(profile));
                    console.log('✅ Admin profile loaded from API');
                } else if (response.status === 404) {
                    console.log('ℹ️ No admin profile found in DynamoDB yet');
                }
            }
        } catch (error) {
            console.warn('⚠️ Error in direct profile load:', error);
        }
    }
    
    saveSession() {
        try {
            const session = {
                user: this.currentUser,
                expiresAt: this.currentUser?.expiresAt,
                isAdmin: this.isAdmin,
                idToken: this.currentUser?.idToken,
                accessToken: this.currentUser?.accessToken,
                refreshToken: this.currentUser?.refreshToken
            };
            
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            console.log('✅ Admin session saved');
            
        } catch (error) {
            console.error('❌ Error saving session:', error);
        }
    }
    
    getSession() {
        try {
            const storedSession = localStorage.getItem(this.SESSION_KEY);
            if (!storedSession) {
                return null;
            }
            
            const session = JSON.parse(storedSession);
            const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
            
            // Check if session is still valid
            if (expiresAt && expiresAt < new Date()) {
                console.log('⏰ Session expired');
                return null;
            }
            
            return session;
        } catch (error) {
            console.error('❌ Error getting session:', error);
            return null;
        }
    }
    
    clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.userData = null;
        console.log('✅ Admin session cleared');
    }
    
    async logout() {
        try {
            // Clear session
            this.clearSession();
            
            // Redirect to login
            this.redirectToLogin();
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Still redirect even if error
            this.redirectToLogin();
        }
    }
    
    redirectToLogin() {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('admin-login.html')) {
            window.location.href = '/admin-login.html?redirect=' + encodeURIComponent(currentPath);
        }
    }
    
    showError(field, message) {
        const errorElement = document.getElementById(field + '-error');
        const inputElement = document.getElementById(field);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
            
            // Remove error class after user starts typing
            inputElement.addEventListener('input', () => {
                inputElement.classList.remove('error');
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
            }, { once: true });
        }
    }
    
    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('.form-group input');
        
        errorElements.forEach(el => el.classList.remove('show'));
        inputElements.forEach(el => el.classList.remove('error'));
    }
    
    showNotification(message, type = 'info') {
        // Simple notification - can be enhanced with a toast library
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        if (type === 'error') {
            alert(message);
        }
    }
    
    // Public API
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserData() {
        return this.userData;
    }
    
    isAuthenticatedUser() {
        return this.isAuthenticated && this.isAdmin;
    }
}

