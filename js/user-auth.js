// User Authentication System
class UserAuth {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        // Reset password form
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => this.handleResetPassword(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Show/hide password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Form switching
        document.querySelectorAll('.auth-switch').forEach(link => {
            link.addEventListener('click', (e) => this.switchAuthForm(e));
        });

        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const formName = e.target.getAttribute('data-form');
                console.log('Switching to form:', formName);
                this.switchToForm(formName);
            });
        });
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');

        if (this.validateLogin(email, password)) {
            this.login(email, password, rememberMe);
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            birthDate: formData.get('birthDate'),
            goals: formData.get('goals'),
            experience: formData.get('experience')
        };

        if (this.validateRegistration(userData)) {
            this.register(userData);
        }
    }

    handleForgotPassword(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');

        if (this.validateEmail(email)) {
            this.sendPasswordReset(email);
        }
    }

    handleResetPassword(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const token = formData.get('token');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (this.validatePasswordReset(password, confirmPassword)) {
            this.resetPassword(token, password);
        }
    }

    validateLogin(email, password) {
        if (!email || !password) {
            this.showError('Bitte fülle alle Felder aus.');
            return false;
        }

        if (!this.validateEmail(email)) {
            this.showError('Bitte gib eine gültige E-Mail-Adresse ein.');
            return false;
        }

        return true;
    }

    validateRegistration(userData) {
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
            this.showError('Bitte fülle alle Pflichtfelder aus.');
            return false;
        }

        if (!this.validateEmail(userData.email)) {
            this.showError('Bitte gib eine gültige E-Mail-Adresse ein.');
            return false;
        }

        if (userData.password.length < 8) {
            this.showError('Das Passwort muss mindestens 8 Zeichen lang sein.');
            return false;
        }

        if (userData.password !== userData.confirmPassword) {
            this.showError('Die Passwörter stimmen nicht überein.');
            return false;
        }

        // Check if user already exists
        const existingUsers = this.getStoredUsers();
        if (existingUsers.find(user => user.email === userData.email)) {
            this.showError('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePasswordReset(password, confirmPassword) {
        if (!password || !confirmPassword) {
            this.showError('Bitte fülle alle Felder aus.');
            return false;
        }

        if (password.length < 8) {
            this.showError('Das Passwort muss mindestens 8 Zeichen lang sein.');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Die Passwörter stimmen nicht überein.');
            return false;
        }

        return true;
    }

    login(email, password, rememberMe) {
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === email && u.password === this.hashPassword(password));

        if (user) {
            this.currentUser = {
                ...user,
                lastLogin: new Date().toISOString(),
                loginCount: (user.loginCount || 0) + 1
            };

            this.isLoggedIn = true;
            this.saveUserToStorage(rememberMe);
            this.updateUserInStorage();
            this.updateUI();
            this.showSuccess('Erfolgreich eingeloggt!');
            this.closeAuthModal();
            
            // Initialize dashboard
            if (window.userDashboard) {
                window.userDashboard.init();
            }
        } else {
            this.showError('Ungültige E-Mail-Adresse oder Passwort.');
        }
    }

    register(userData) {
        const newUser = {
            id: this.generateUserId(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: this.hashPassword(userData.password),
            birthDate: userData.birthDate,
            goals: userData.goals,
            experience: userData.experience,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            loginCount: 0,
            profile: {
                avatar: null,
                bio: '',
                interests: [],
                currentGoals: [],
                completedMethods: [],
                progress: {}
            },
            settings: {
                notifications: true,
                emailUpdates: true,
                theme: 'light',
                language: 'de'
            }
        };

        const users = this.getStoredUsers();
        users.push(newUser);
        localStorage.setItem('personalityUsers', JSON.stringify(users));

        this.showSuccess('Registrierung erfolgreich! Du kannst dich jetzt einloggen.');
        this.switchToForm('login');
    }

    sendPasswordReset(email) {
        // In a real application, this would send an email
        // For demo purposes, we'll simulate it
        const resetToken = this.generateResetToken();
        this.storeResetToken(email, resetToken);
        
        this.showSuccess(`Ein Passwort-Reset-Link wurde an ${email} gesendet. (Demo: Token: ${resetToken})`);
        this.switchToForm('resetPassword');
        
        // Pre-fill the token field for demo
        setTimeout(() => {
            const tokenField = document.getElementById('resetToken');
            if (tokenField) {
                tokenField.value = resetToken;
            }
        }, 100);
    }

    resetPassword(token, newPassword) {
        const resetData = this.getResetTokenData(token);
        
        if (resetData && resetData.expires > Date.now()) {
            const users = this.getStoredUsers();
            const userIndex = users.findIndex(u => u.email === resetData.email);
            
            if (userIndex !== -1) {
                users[userIndex].password = this.hashPassword(newPassword);
                localStorage.setItem('personalityUsers', JSON.stringify(users));
                this.removeResetToken(token);
                
                this.showSuccess('Passwort erfolgreich zurückgesetzt! Du kannst dich jetzt einloggen.');
                this.switchToForm('login');
            } else {
                this.showError('Benutzer nicht gefunden.');
            }
        } else {
            this.showError('Ungültiger oder abgelaufener Reset-Token.');
        }
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('currentPersonalityUser');
        this.updateUI();
        this.showSuccess('Erfolgreich ausgeloggt!');
        
        // Hide dashboard
        if (window.userDashboard) {
            window.userDashboard.hide();
        }
    }

    switchAuthForm(e) {
        e.preventDefault();
        const targetForm = e.target.getAttribute('data-form');
        console.log('Switching to form:', targetForm);
        this.switchToForm(targetForm);
    }

    switchToForm(formName) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // Show target form
        const targetForm = document.getElementById(formName + 'Form');
        if (targetForm) {
            targetForm.classList.add('active');
        }

        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-form="${formName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    togglePasswordVisibility(e) {
        e.preventDefault();
        const button = e.target;
        const input = button.previousElementSibling;
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    hashPassword(password) {
        // Simple hash for demo - in production use proper hashing
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateResetToken() {
        return 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    storeResetToken(email, token) {
        const resetTokens = this.getResetTokens();
        resetTokens[token] = {
            email: email,
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('personalityResetTokens', JSON.stringify(resetTokens));
    }

    getResetTokenData(token) {
        const resetTokens = this.getResetTokens();
        return resetTokens[token] || null;
    }

    removeResetToken(token) {
        const resetTokens = this.getResetTokens();
        delete resetTokens[token];
        localStorage.setItem('personalityResetTokens', JSON.stringify(resetTokens));
    }

    getResetTokens() {
        const tokens = localStorage.getItem('personalityResetTokens');
        return tokens ? JSON.parse(tokens) : {};
    }

    getStoredUsers() {
        const users = localStorage.getItem('personalityUsers');
        return users ? JSON.parse(users) : [];
    }

    saveUserToStorage(rememberMe) {
        if (rememberMe) {
            localStorage.setItem('currentPersonalityUser', JSON.stringify(this.currentUser));
        } else {
            sessionStorage.setItem('currentPersonalityUser', JSON.stringify(this.currentUser));
        }
    }

    loadUserFromStorage() {
        let userData = localStorage.getItem('currentPersonalityUser') || 
                      sessionStorage.getItem('currentPersonalityUser');
        
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isLoggedIn = true;
        }
    }

    updateUserInStorage() {
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('personalityUsers', JSON.stringify(users));
        }
    }

    updateUI() {
        const authSection = document.getElementById('authSection');
        const dashboardSection = document.getElementById('dashboardSection');
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');

        if (this.isLoggedIn) {
            // Show dashboard, hide auth
            if (authSection) authSection.style.display = 'none';
            if (dashboardSection) dashboardSection.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';

            // Update user info
            this.updateUserInfo();
        } else {
            // Show auth, hide dashboard
            if (authSection) authSection.style.display = 'block';
            if (dashboardSection) dashboardSection.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');

        if (userName) {
            userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }

        if (userEmail) {
            userEmail.textContent = this.currentUser.email;
        }

        if (userAvatar) {
            userAvatar.src = this.currentUser.profile.avatar || 'https://via.placeholder.com/40x40/6366f1/ffffff?text=' + this.currentUser.firstName.charAt(0);
        }
    }

    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to page
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Public methods for external use
    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }

    updateUserProgress(methodId, step, data) {
        if (!this.currentUser) return;

        if (!this.currentUser.profile.progress[methodId]) {
            this.currentUser.profile.progress[methodId] = {};
        }

        this.currentUser.profile.progress[methodId][step] = {
            data: data,
            completedAt: new Date().toISOString()
        };

        this.updateUserInStorage();
        this.saveUserToStorage(true);
    }

    getUserProgress(methodId) {
        if (!this.currentUser || !this.currentUser.profile.progress[methodId]) {
            return {};
        }
        return this.currentUser.profile.progress[methodId];
    }

    markMethodCompleted(methodId) {
        if (!this.currentUser) return;

        if (!this.currentUser.profile.completedMethods.includes(methodId)) {
            this.currentUser.profile.completedMethods.push({
                methodId: methodId,
                completedAt: new Date().toISOString()
            });
        }

        this.updateUserInStorage();
        this.saveUserToStorage(true);
    }

    getCompletedMethods() {
        if (!this.currentUser) return [];
        return this.currentUser.profile.completedMethods;
    }
}

// Initialize authentication system
window.userAuth = new UserAuth();

// Global functions for HTML onclick handlers
function showLoginModal() {
    window.userAuth.showAuthModal();
    window.userAuth.switchToForm('login');
}

function showRegisterModal() {
    window.userAuth.showAuthModal();
    window.userAuth.switchToForm('register');
}

function showForgotPasswordModal() {
    window.userAuth.showAuthModal();
    window.userAuth.switchToForm('forgotPassword');
}

function closeAuthModal() {
    window.userAuth.closeAuthModal();
}

function logout() {
    window.userAuth.logout();
}
