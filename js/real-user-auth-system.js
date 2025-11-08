// Real User Authentication System - Echte Benutzerkonten mit Datenverwaltung
// Integriert mit AWS Cognito und lokaler Datenverwaltung

class RealUserAuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.userData = null;
        this.progressData = {};
        this.achievements = [];
        this.goals = [];
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Real User Auth System...');
        
        // Check for existing session
        await this.checkExistingSession();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.initializeUI();
        
        console.log('✅ Real User Auth System initialized');
    }

    async checkExistingSession() {
        try {
            // Check localStorage for existing user
            const storedUser = localStorage.getItem('realUser');
            const storedAuth = localStorage.getItem('realAuth');
            
            if (storedUser && storedAuth) {
                const userData = JSON.parse(storedUser);
                const authData = JSON.parse(storedAuth);
                
                // Check if session is still valid (not expired)
                if (authData.expiresAt && new Date(authData.expiresAt) > new Date()) {
                    this.currentUser = userData;
                    this.isAuthenticated = true;
                    this.userData = userData;
                    
                    // Load user progress and data
                    await this.loadUserData();
                    
                    console.log('✅ Existing session found:', userData.email);
                    return;
                } else {
                    // Session expired, clear data
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('Error checking existing session:', error);
            this.clearSession();
        }
    }

    setupEventListeners() {
        // Listen for auth events
        document.addEventListener('userLogin', (e) => {
            this.handleUserLogin(e.detail);
        });

        document.addEventListener('userLogout', () => {
            this.handleUserLogout();
        });

        document.addEventListener('userDataUpdate', (e) => {
            this.handleUserDataUpdate(e.detail);
        });
    }

    initializeUI() {
        // Create auth UI if not exists
        this.createAuthUI();
        
        // Setup button listeners
        this.setupButtonListeners();
        
        // Update UI based on auth state
        this.updateAuthUI();
    }
    
    setupButtonListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachButtonListeners());
        } else {
            this.attachButtonListeners();
        }
    }
    
    attachButtonListeners() {
        const authButton = document.getElementById('realAuthButton');
        if (authButton) {
            // Remove existing listeners
            authButton.onclick = null;
            authButton.removeEventListener('click', this.handleAuthButtonClick);
            
            // Add new listener
            this.handleAuthButtonClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isAuthenticated) {
                    // Show user menu or profile
                    const userMenu = document.getElementById('realUserMenu');
                    if (userMenu) {
                        userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
                    }
                } else {
                    // Show login modal
                    this.showAuthModal();
                }
            };
            
            authButton.addEventListener('click', this.handleAuthButtonClick);
            console.log('✅ Login button listener attached');
        }
    }

    createAuthUI() {
        // Check if auth UI already exists
        if (document.getElementById('realAuthModal')) return;

        const modalHTML = `
            <div id="realAuthModal" class="auth-modal" style="display: none;">
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2 id="authModalTitle">Anmelden</h2>
                        <button class="auth-close" onclick="realUserAuth.closeAuthModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="auth-modal-body">
                        <!-- Login Form -->
                        <form id="loginForm" class="auth-form">
                            <div class="form-group">
                                <label for="loginEmail">E-Mail</label>
                                <input type="email" id="loginEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Passwort</label>
                                <input type="password" id="loginPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                <i class="fas fa-sign-in-alt"></i> Anmelden
                            </button>
                            <div class="auth-links">
                                <a href="#" onclick="realUserAuth.showRegisterForm()">Noch kein Konto? Registrieren</a>
                                <a href="#" onclick="realUserAuth.showForgotPasswordForm()">Passwort vergessen?</a>
                            </div>
                        </form>

                        <!-- Register Form -->
                        <form id="registerForm" class="auth-form" style="display: none;">
                            <div class="form-group">
                                <label for="registerFirstName">Vorname</label>
                                <input type="text" id="registerFirstName" required>
                            </div>
                            <div class="form-group">
                                <label for="registerLastName">Nachname</label>
                                <input type="text" id="registerLastName" required>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">E-Mail</label>
                                <input type="email" id="registerEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Passwort</label>
                                <input type="password" id="registerPassword" required minlength="8">
                            </div>
                            <div class="form-group">
                                <label for="registerConfirmPassword">Passwort bestätigen</label>
                                <input type="password" id="registerConfirmPassword" required>
                            </div>
                            <div class="form-group">
                                <label for="registerTitle">Beruf/Position</label>
                                <input type="text" id="registerTitle" placeholder="z.B. HR Manager">
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                <i class="fas fa-user-plus"></i> Registrieren
                            </button>
                            <div class="auth-links">
                                <a href="#" onclick="realUserAuth.showLoginForm()">Bereits ein Konto? Anmelden</a>
                            </div>
                        </form>

                        <!-- Forgot Password Form -->
                        <form id="forgotPasswordForm" class="auth-form" style="display: none;">
                            <div class="form-group">
                                <label for="forgotEmail">E-Mail</label>
                                <input type="email" id="forgotEmail" required>
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                <i class="fas fa-envelope"></i> Passwort zurücksetzen
                            </button>
                            <div class="auth-links">
                                <a href="#" onclick="realUserAuth.showLoginForm()">Zurück zur Anmeldung</a>
                            </div>
                        </form>

                        <!-- Email Verification Form -->
                        <form id="verifyEmailForm" class="auth-form" style="display: none;">
                            <div class="form-group">
                                <label for="verifyCode">Bestätigungscode</label>
                                <input type="text" id="verifyCode" required placeholder="Code aus E-Mail">
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                <i class="fas fa-check"></i> E-Mail bestätigen
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form handlers
        this.setupFormHandlers();
    }

    setupFormHandlers() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });

        // Forgot password form
        document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleForgotPassword();
        });

        // Email verification form
        document.getElementById('verifyEmailForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEmailVerification();
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            this.showLoading('Anmeldung läuft...');

            // Simulate API call (replace with real AWS Cognito)
            const result = await this.simulateLogin(email, password);

            if (result.success) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.userData = result.user;

                // Save session
                this.saveSession(result.user, result.auth);

                // Load user data
                await this.loadUserData();

                // Update UI
                this.updateAuthUI();
                this.closeAuthModal();

                this.showNotification('Erfolgreich angemeldet!', 'success');

                // Dispatch login event
                document.dispatchEvent(new CustomEvent('userLogin', { detail: result.user }));
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Anmeldung fehlgeschlagen', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleRegister() {
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const title = document.getElementById('registerTitle').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            this.showNotification('Passwörter stimmen nicht überein', 'error');
            return;
        }

        try {
            this.showLoading('Registrierung läuft...');

            // Simulate API call (replace with real AWS Cognito)
            const result = await this.simulateRegister({
                firstName,
                lastName,
                email,
                password,
                title
            });

            if (result.success) {
                this.showEmailVerificationForm();
                this.showNotification('Registrierung erfolgreich! Bitte E-Mail bestätigen.', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registrierung fehlgeschlagen', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value;

        try {
            this.showLoading('Passwort-Reset wird gesendet...');

            // Simulate API call
            const result = await this.simulateForgotPassword(email);

            if (result.success) {
                this.showNotification('Reset-Link wurde an Ihre E-Mail gesendet', 'success');
                this.showLoginForm();
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showNotification('Passwort-Reset fehlgeschlagen', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleEmailVerification() {
        const code = document.getElementById('verifyCode').value;

        try {
            this.showLoading('E-Mail wird bestätigt...');

            // Simulate API call
            const result = await this.simulateEmailVerification(code);

            if (result.success) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.userData = result.user;

                // Save session
                this.saveSession(result.user, result.auth);

                // Load user data
                await this.loadUserData();

                // Update UI
                this.updateAuthUI();
                this.closeAuthModal();

                this.showNotification('E-Mail erfolgreich bestätigt! Willkommen!', 'success');

                // Dispatch login event
                document.dispatchEvent(new CustomEvent('userLogin', { detail: result.user }));
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            this.showNotification('E-Mail-Bestätigung fehlgeschlagen', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Simulate API calls (replace with real AWS Cognito)
    async simulateLogin(email, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('realUsers') || '{}');
        const user = users[email];

        if (!user) {
            return { success: false, error: 'Benutzer nicht gefunden' };
        }

        if (user.password !== password) {
            return { success: false, error: 'Falsches Passwort' };
        }

        if (!user.verified) {
            return { success: false, error: 'E-Mail noch nicht bestätigt' };
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                title: user.title,
                createdAt: user.createdAt,
                lastLogin: new Date().toISOString()
            },
            auth: {
                token: 'simulated-token-' + Date.now(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            }
        };
    }

    async simulateRegister(userData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = JSON.parse(localStorage.getItem('realUsers') || '{}');

        if (users[userData.email]) {
            return { success: false, error: 'Benutzer existiert bereits' };
        }

        const userId = 'user_' + Date.now();
        const user = {
            id: userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            title: userData.title || '',
            password: userData.password,
            verified: false,
            createdAt: new Date().toISOString(),
            profile: {
                completedMethods: [],
                currentGoals: [],
                preferences: {
                    notifications: true,
                    dataSharing: true
                }
            }
        };

        users[userData.email] = user;
        localStorage.setItem('realUsers', JSON.stringify(users));

        return { success: true, userId };
    }

    async simulateForgotPassword(email) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = JSON.parse(localStorage.getItem('realUsers') || '{}');
        if (!users[email]) {
            return { success: false, error: 'Benutzer nicht gefunden' };
        }

        return { success: true };
    }

    async simulateEmailVerification(code) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In real implementation, verify code with AWS Cognito
        if (code !== '123456') {
            return { success: false, error: 'Ungültiger Bestätigungscode' };
        }

        // Find user by email (in real implementation, get from context)
        const users = JSON.parse(localStorage.getItem('realUsers') || '{}');
        const userEmail = localStorage.getItem('pendingVerification');
        
        if (!userEmail || !users[userEmail]) {
            return { success: false, error: 'Kein Benutzer zur Bestätigung gefunden' };
        }

        // Mark user as verified
        users[userEmail].verified = true;
        localStorage.setItem('realUsers', JSON.stringify(users));
        localStorage.removeItem('pendingVerification');

        return {
            success: true,
            user: {
                id: users[userEmail].id,
                email: users[userEmail].email,
                firstName: users[userEmail].firstName,
                lastName: users[userEmail].lastName,
                title: users[userEmail].title,
                createdAt: users[userEmail].createdAt,
                lastLogin: new Date().toISOString()
            },
            auth: {
                token: 'simulated-token-' + Date.now(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        };
    }

    async loadUserData() {
        if (!this.currentUser) return;

        try {
            // Load user progress data
            const progressKey = `userProgress_${this.currentUser.id}`;
            this.progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');

            // Load achievements
            const achievementsKey = `userAchievements_${this.currentUser.id}`;
            this.achievements = JSON.parse(localStorage.getItem(achievementsKey) || '[]');

            // Load goals
            const goalsKey = `userGoals_${this.currentUser.id}`;
            this.goals = JSON.parse(localStorage.getItem(goalsKey) || '[]');

            console.log('✅ User data loaded for:', this.currentUser.email);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async saveUserData() {
        if (!this.currentUser) return;

        try {
            // Save user progress data
            const progressKey = `userProgress_${this.currentUser.id}`;
            localStorage.setItem(progressKey, JSON.stringify(this.progressData));

            // Save achievements
            const achievementsKey = `userAchievements_${this.currentUser.id}`;
            localStorage.setItem(achievementsKey, JSON.stringify(this.achievements));

            // Save goals
            const goalsKey = `userGoals_${this.currentUser.id}`;
            localStorage.setItem(goalsKey, JSON.stringify(this.goals));

            console.log('✅ User data saved for:', this.currentUser.email);
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    saveSession(user, auth) {
        localStorage.setItem('realUser', JSON.stringify(user));
        localStorage.setItem('realAuth', JSON.stringify(auth));
    }

    clearSession() {
        localStorage.removeItem('realUser');
        localStorage.removeItem('realAuth');
        this.currentUser = null;
        this.isAuthenticated = false;
        this.userData = null;
    }

    logout() {
        this.clearSession();
        this.updateAuthUI();
        this.showNotification('Erfolgreich abgemeldet', 'info');

        // Dispatch logout event
        document.dispatchEvent(new CustomEvent('userLogout'));
    }

    // UI Methods
    showAuthModal() {
        document.getElementById('realAuthModal').style.display = 'flex';
        this.showLoginForm();
    }

    closeAuthModal() {
        document.getElementById('realAuthModal').style.display = 'none';
    }

    showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('verifyEmailForm').style.display = 'none';
        document.getElementById('authModalTitle').textContent = 'Anmelden';
    }

    showRegisterForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('verifyEmailForm').style.display = 'none';
        document.getElementById('authModalTitle').textContent = 'Registrieren';
    }

    showForgotPasswordForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'block';
        document.getElementById('verifyEmailForm').style.display = 'none';
        document.getElementById('authModalTitle').textContent = 'Passwort zurücksetzen';
    }

    showEmailVerificationForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('verifyEmailForm').style.display = 'block';
        document.getElementById('authModalTitle').textContent = 'E-Mail bestätigen';
        
        // Store email for verification
        const email = document.getElementById('registerEmail').value;
        localStorage.setItem('pendingVerification', email);
    }

    updateAuthUI() {
        const authButton = document.getElementById('realAuthButton');
        const userMenu = document.getElementById('realUserMenu');

        if (this.isAuthenticated && this.currentUser) {
            // Show user menu
            if (authButton) authButton.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                userMenu.innerHTML = `
                    <div class="user-menu">
                        <div class="user-info">
                            <i class="fas fa-user-circle"></i>
                            <span>${this.currentUser.firstName} ${this.currentUser.lastName}</span>
                        </div>
                        <div class="user-actions">
                            <a href="user-profile-dashboard.html" class="user-action">
                                <i class="fas fa-user"></i> Mein Profil
                            </a>
                            <a href="#" onclick="realUserAuth.logout()" class="user-action">
                                <i class="fas fa-sign-out-alt"></i> Abmelden
                            </a>
                        </div>
                    </div>
                `;
            }
        } else {
            // Show auth button
            if (authButton) authButton.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    showLoading(message) {
        // Create or update loading indicator
        let loading = document.getElementById('authLoading');
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'authLoading';
            loading.className = 'auth-loading';
            document.body.appendChild(loading);
        }
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        loading.style.display = 'flex';
    }

    hideLoading() {
        const loading = document.getElementById('authLoading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Public API
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    getUserData() {
        return this.userData;
    }

    getProgressData() {
        return this.progressData;
    }

    getAchievements() {
        return this.achievements;
    }

    getGoals() {
        return this.goals;
    }

    updateUserProfile(profileData) {
        if (!this.currentUser) return false;

        this.currentUser = { ...this.currentUser, ...profileData };
        this.saveSession(this.currentUser, JSON.parse(localStorage.getItem('realAuth')));
        
        // Dispatch update event
        document.dispatchEvent(new CustomEvent('userDataUpdate', { detail: profileData }));
        
        return true;
    }

    addAchievement(achievement) {
        if (!this.currentUser) return false;

        this.achievements.push({
            ...achievement,
            earnedAt: new Date().toISOString()
        });

        this.saveUserData();
        return true;
    }

    addGoal(goal) {
        if (!this.currentUser) return false;

        this.goals.push({
            ...goal,
            id: 'goal_' + Date.now(),
            createdAt: new Date().toISOString()
        });

        this.saveUserData();
        return true;
    }

    updateGoal(goalId, goalData) {
        if (!this.currentUser) return false;

        const goalIndex = this.goals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
            this.goals[goalIndex] = { ...this.goals[goalIndex], ...goalData };
            this.saveUserData();
            return true;
        }
        return false;
    }

    deleteGoal(goalId) {
        if (!this.currentUser) return false;

        this.goals = this.goals.filter(g => g.id !== goalId);
        this.saveUserData();
        return true;
    }

    // Event handlers
    handleUserLogin(user) {
        console.log('User logged in:', user);
        this.updateAuthUI();
    }

    handleUserLogout() {
        console.log('User logged out');
        this.updateAuthUI();
    }

    handleUserDataUpdate(data) {
        console.log('User data updated:', data);
    }
}

// Initialize global instance
window.realUserAuth = new RealUserAuthSystem();

// Add CSS for auth UI
const authCSS = `
<style>
.auth-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.auth-modal-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.auth-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.auth-modal-header h2 {
    margin: 0;
    color: #1e293b;
}

.auth-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #64748b;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
}

.form-group input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
}

.form-group input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.auth-btn {
    background: #6366f1;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.auth-btn:hover {
    background: #4f46e5;
}

.auth-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
    margin-top: 1rem;
}

.auth-links a {
    color: #6366f1;
    text-decoration: none;
    font-size: 0.875rem;
}

.auth-links a:hover {
    text-decoration: underline;
}

.auth-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
}

.loading-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.auth-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 10002;
}

.auth-notification.show {
    transform: translateX(0);
}

.auth-notification-success {
    border-left: 4px solid #10b981;
}

.auth-notification-error {
    border-left: 4px solid #ef4444;
}

.auth-notification-info {
    border-left: 4px solid #3b82f6;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.user-menu {
    position: relative;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.2s;
}

.user-info:hover {
    background: #f8fafc;
}

.user-actions {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    display: none;
}

.user-menu:hover .user-actions {
    display: block;
}

.user-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    color: #374151;
    text-decoration: none;
    transition: background 0.2s;
}

.user-action:hover {
    background: #f8fafc;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', authCSS);
