// Working Authentication System (ohne AWS Cognito)
class WorkingAuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.isInitialized = true;
        
        console.log('✅ Working Auth System initialized');
    }

    loadUsers() {
        const stored = localStorage.getItem('working_users');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    }

    saveUsers() {
        localStorage.setItem('working_users', JSON.stringify(this.users));
    }

    // Login with email and password
    async login(email, password) {
        try {
            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                if (!user.verified) {
                    return { 
                        success: false, 
                        error: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.' 
                    };
                }
                
                this.currentUser = {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    accessToken: this.generateToken(),
                    idToken: this.generateToken(),
                    refreshToken: this.generateToken()
                };
                
                this.storeTokens(this.currentUser);
                this.updateUI(true);
                
                return { success: true, user: this.currentUser };
            } else {
                return { 
                    success: false, 
                    error: 'Falsche E-Mail-Adresse oder Passwort.' 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: 'Ein Fehler ist aufgetreten.' 
            };
        }
    }

    // Register new user
    async register(email, password, firstName, lastName) {
        try {
            // Check if user already exists
            const existingUser = this.users.find(u => u.email === email);
            if (existingUser) {
                return { 
                    success: false, 
                    error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.' 
                };
            }

            // Validate password
            if (password.length < 8) {
                return { 
                    success: false, 
                    error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' 
                };
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                email: email,
                password: password, // In production, this would be hashed
                firstName: firstName,
                lastName: lastName,
                verified: true, // Auto-verify in demo
                createdAt: new Date().toISOString()
            };

            this.users.push(newUser);
            this.saveUsers();

            return { 
                success: true, 
                message: 'Registrierung erfolgreich! Sie können sich jetzt anmelden.',
                userSub: newUser.id
            };
        } catch (error) {
            console.error('Registration error:', error);
            return { 
                success: false, 
                error: 'Ein Fehler ist aufgetreten.' 
            };
        }
    }

    // Confirm registration with verification code
    async confirmRegistration(email, code) {
        try {
            const user = this.users.find(u => u.email === email);
            if (user) {
                user.verified = true;
                this.saveUsers();
                return { success: true, message: 'E-Mail erfolgreich bestätigt' };
            } else {
                return { 
                    success: false, 
                    error: 'Benutzer nicht gefunden.' 
                };
            }
        } catch (error) {
            console.error('Confirmation error:', error);
            return { 
                success: false, 
                error: 'Ein Fehler ist aufgetreten.' 
            };
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const user = this.users.find(u => u.email === email);
            if (user) {
                // In demo, just show notification
                this.showNotification('Demo: Passwort-Reset-Code würde an ' + email + ' gesendet werden.', 'info');
                return { 
                    success: true, 
                    message: 'Passwort-Reset-Code gesendet (Demo-Modus)' 
                };
            } else {
                return { 
                    success: false, 
                    error: 'Benutzer nicht gefunden.' 
                };
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            return { 
                success: false, 
                error: 'Ein Fehler ist aufgetreten.' 
            };
        }
    }

    // Reset password with code
    async resetPassword(email, code, newPassword) {
        try {
            const user = this.users.find(u => u.email === email);
            if (user) {
                user.password = newPassword;
                this.saveUsers();
                return { 
                    success: true, 
                    message: 'Passwort erfolgreich zurückgesetzt' 
                };
            } else {
                return { 
                    success: false, 
                    error: 'Benutzer nicht gefunden.' 
                };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            return { 
                success: false, 
                error: 'Ein Fehler ist aufgetreten.' 
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
            this.currentUser = tokens;
            this.updateUI(true);
        }
    }

    // Generate demo token
    generateToken() {
        return 'working_token_' + Math.random().toString(36).substr(2, 9);
    }

    // Store tokens in localStorage
    storeTokens(user) {
        const tokenData = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            accessToken: user.accessToken,
            idToken: user.idToken,
            refreshToken: user.refreshToken,
            timestamp: Date.now()
        };
        
        localStorage.setItem('working_auth_tokens', JSON.stringify(tokenData));
    }

    // Get stored tokens
    getStoredTokens() {
        try {
            const tokens = localStorage.getItem('working_auth_tokens');
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
        localStorage.removeItem('working_auth_tokens');
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

// Initialize Working Auth System
window.awsAuth = new WorkingAuthSystem();

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
