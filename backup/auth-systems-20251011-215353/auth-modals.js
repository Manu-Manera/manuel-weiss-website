// Authentication Modals
class AuthModals {
    constructor() {
        this.currentModal = null;
        this.init();
    }

    init() {
        this.createModals();
        this.setupEventListeners();
    }

    createModals() {
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'authModalContainer';
        modalContainer.innerHTML = `
            <!-- Login Modal -->
            <div class="auth-modal" id="loginModal">
                <div class="modal-backdrop" onclick="authModals.closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-sign-in-alt"></i> Anmelden</h2>
                        <button class="modal-close" onclick="authModals.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="loginForm" onsubmit="authModals.handleLogin(event)">
                            <div class="form-group">
                                <label for="loginEmail">E-Mail-Adresse</label>
                                <input type="email" id="loginEmail" required placeholder="ihre@email.com">
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Passwort</label>
                                <input type="password" id="loginPassword" required placeholder="Ihr Passwort">
                            </div>
                            <div class="form-options">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="rememberMe">
                                    <span class="checkmark"></span>
                                    Angemeldet bleiben
                                </label>
                                <a href="#" onclick="authModals.showForgotPassword()" class="forgot-link">
                                    Passwort vergessen?
                                </a>
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-sign-in-alt"></i>
                                Anmelden
                            </button>
                        </form>
                        <div class="modal-footer">
                            <p>Noch kein Konto? <a href="#" onclick="authModals.showRegister()">Jetzt registrieren</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Register Modal -->
            <div class="auth-modal" id="registerModal">
                <div class="modal-backdrop" onclick="authModals.closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-user-plus"></i> Registrieren</h2>
                        <button class="modal-close" onclick="authModals.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="registerForm" onsubmit="authModals.handleRegister(event)">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="registerFirstName">Vorname</label>
                                    <input type="text" id="registerFirstName" required placeholder="Ihr Vorname">
                                </div>
                                <div class="form-group">
                                    <label for="registerLastName">Nachname</label>
                                    <input type="text" id="registerLastName" required placeholder="Ihr Nachname">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">E-Mail-Adresse</label>
                                <input type="email" id="registerEmail" required placeholder="ihre@email.com">
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Passwort</label>
                                <input type="password" id="registerPassword" required placeholder="Mindestens 8 Zeichen">
                                <div class="password-requirements">
                                    <small>Mindestens 8 Zeichen, Groß- und Kleinbuchstaben, Zahlen</small>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="registerPasswordConfirm">Passwort bestätigen</label>
                                <input type="password" id="registerPasswordConfirm" required placeholder="Passwort wiederholen">
                            </div>
                            <div class="form-options">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="acceptTerms" required>
                                    <span class="checkmark"></span>
                                    Ich akzeptiere die <a href="nutzungsbedingungen.html" target="_blank">Nutzungsbedingungen</a> und <a href="datenschutz.html" target="_blank">Datenschutzerklärung</a>
                                </label>
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-user-plus"></i>
                                Registrieren
                            </button>
                        </form>
                        <div class="modal-footer">
                            <p>Bereits ein Konto? <a href="#" onclick="authModals.showLogin()">Jetzt anmelden</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Email Verification Modal -->
            <div class="auth-modal" id="verificationModal">
                <div class="modal-backdrop" onclick="authModals.closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-envelope"></i> E-Mail bestätigen</h2>
                        <button class="modal-close" onclick="authModals.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="verification-info">
                            <i class="fas fa-envelope-open"></i>
                            <h3>Bestätigungscode gesendet</h3>
                            <p>Wir haben einen Bestätigungscode an <strong id="verificationEmail"></strong> gesendet.</p>
                            <p>Bitte geben Sie den Code ein, um Ihr Konto zu aktivieren.</p>
                        </div>
                        <form id="verificationForm" onsubmit="authModals.handleVerification(event)">
                            <div class="form-group">
                                <label for="verificationCode">Bestätigungscode</label>
                                <input type="text" id="verificationCode" required placeholder="6-stelliger Code" maxlength="6">
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-check"></i>
                                Bestätigen
                            </button>
                        </form>
                        <div class="modal-footer">
                            <p>Code nicht erhalten? <a href="#" onclick="authModals.resendCode()">Erneut senden</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Forgot Password Modal -->
            <div class="auth-modal" id="forgotPasswordModal">
                <div class="modal-backdrop" onclick="authModals.closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-key"></i> Passwort vergessen</h2>
                        <button class="modal-close" onclick="authModals.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="forgot-info">
                            <i class="fas fa-question-circle"></i>
                            <h3>Passwort zurücksetzen</h3>
                            <p>Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Code zum Zurücksetzen des Passworts.</p>
                        </div>
                        <form id="forgotPasswordForm" onsubmit="authModals.handleForgotPassword(event)">
                            <div class="form-group">
                                <label for="forgotEmail">E-Mail-Adresse</label>
                                <input type="email" id="forgotEmail" required placeholder="ihre@email.com">
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-paper-plane"></i>
                                Code senden
                            </button>
                        </form>
                        <div class="modal-footer">
                            <p>Zurück zur <a href="#" onclick="authModals.showLogin()">Anmeldung</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reset Password Modal -->
            <div class="auth-modal" id="resetPasswordModal">
                <div class="modal-backdrop" onclick="authModals.closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-lock"></i> Neues Passwort</h2>
                        <button class="modal-close" onclick="authModals.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="reset-info">
                            <i class="fas fa-shield-alt"></i>
                            <h3>Passwort zurücksetzen</h3>
                            <p>Geben Sie den Code aus Ihrer E-Mail und Ihr neues Passwort ein.</p>
                        </div>
                        <form id="resetPasswordForm" onsubmit="authModals.handleResetPassword(event)">
                            <div class="form-group">
                                <label for="resetCode">Bestätigungscode</label>
                                <input type="text" id="resetCode" required placeholder="Code aus E-Mail">
                            </div>
                            <div class="form-group">
                                <label for="resetPassword">Neues Passwort</label>
                                <input type="password" id="resetPassword" required placeholder="Neues Passwort">
                            </div>
                            <div class="form-group">
                                <label for="resetPasswordConfirm">Passwort bestätigen</label>
                                <input type="password" id="resetPasswordConfirm" required placeholder="Passwort wiederholen">
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i>
                                Passwort ändern
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalContainer);
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }

            .auth-modal.active {
                display: flex;
            }

            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }

            .modal-content {
                position: relative;
                background: white;
                border-radius: 1rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease;
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

            .modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1.5rem 2rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .modal-header h2 {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.25rem;
                font-weight: 600;
                color: #1f2937;
                margin: 0;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 1.25rem;
                color: #6b7280;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 0.5rem;
                transition: all 0.2s ease;
            }

            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .modal-body {
                padding: 2rem;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }

            .form-group {
                margin-bottom: 1.5rem;
            }

            .form-group label {
                display: block;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.5rem;
            }

            .form-group input {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 1rem;
                transition: all 0.2s ease;
            }

            .form-group input:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .password-requirements {
                margin-top: 0.25rem;
            }

            .password-requirements small {
                color: #6b7280;
                font-size: 0.875rem;
            }

            .form-options {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1.5rem;
                flex-wrap: wrap;
                gap: 1rem;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                font-size: 0.875rem;
                color: #374151;
            }

            .checkbox-label input[type="checkbox"] {
                display: none;
            }

            .checkmark {
                width: 18px;
                height: 18px;
                border: 2px solid #d1d5db;
                border-radius: 0.25rem;
                position: relative;
                transition: all 0.2s ease;
            }

            .checkbox-label input[type="checkbox"]:checked + .checkmark {
                background: #6366f1;
                border-color: #6366f1;
            }

            .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: bold;
            }

            .forgot-link {
                color: #6366f1;
                text-decoration: none;
                font-size: 0.875rem;
                transition: color 0.2s ease;
            }

            .forgot-link:hover {
                color: #4f46e5;
            }

            .btn-primary {
                width: 100%;
                background: #6366f1;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }

            .btn-primary:hover {
                background: #4f46e5;
                transform: translateY(-1px);
            }

            .btn-primary:disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
            }

            .modal-footer {
                text-align: center;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
                margin-top: 1.5rem;
            }

            .modal-footer p {
                margin: 0;
                color: #6b7280;
            }

            .modal-footer a {
                color: #6366f1;
                text-decoration: none;
                font-weight: 500;
            }

            .modal-footer a:hover {
                color: #4f46e5;
            }

            .verification-info,
            .forgot-info,
            .reset-info {
                text-align: center;
                margin-bottom: 2rem;
            }

            .verification-info i,
            .forgot-info i,
            .reset-info i {
                font-size: 3rem;
                color: #6366f1;
                margin-bottom: 1rem;
            }

            .verification-info h3,
            .forgot-info h3,
            .reset-info h3 {
                margin: 0 0 0.5rem 0;
                color: #1f2937;
            }

            .verification-info p,
            .forgot-info p,
            .reset-info p {
                margin: 0;
                color: #6b7280;
            }

            @media (max-width: 640px) {
                .modal-content {
                    margin: 1rem;
                    max-height: calc(100vh - 2rem);
                }

                .modal-header,
                .modal-body {
                    padding: 1.5rem;
                }

                .form-row {
                    grid-template-columns: 1fr;
                }

                .form-options {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    showLogin() {
        this.closeModal();
        this.currentModal = 'loginModal';
        document.getElementById('loginModal').classList.add('active');
    }

    showRegister() {
        this.closeModal();
        this.currentModal = 'registerModal';
        document.getElementById('registerModal').classList.add('active');
    }

    showVerification(email) {
        this.closeModal();
        this.currentModal = 'verificationModal';
        document.getElementById('verificationEmail').textContent = email;
        document.getElementById('verificationModal').classList.add('active');
    }

    showForgotPassword() {
        this.closeModal();
        this.currentModal = 'forgotPasswordModal';
        document.getElementById('forgotPasswordModal').classList.add('active');
    }

    showResetPassword() {
        this.closeModal();
        this.currentModal = 'resetPasswordModal';
        document.getElementById('resetPasswordModal').classList.add('active');
    }

    closeModal() {
        if (this.currentModal) {
            document.getElementById(this.currentModal).classList.remove('active');
            this.currentModal = null;
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
        
        try {
            const result = await window.awsAuth.login(email, password);
            
            if (result.success) {
                window.awsAuth.showNotification('Erfolgreich angemeldet!', 'success');
                this.closeModal();
                
                // Redirect to profile or dashboard
                setTimeout(() => {
                    window.location.href = 'user-profile.html#personal';
                }, 1000);
            } else {
                window.awsAuth.showNotification(result.error, 'error');
            }
        } catch (error) {
            window.awsAuth.showNotification('Ein Fehler ist aufgetreten', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Anmelden';
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        // Validate passwords match
        if (password !== passwordConfirm) {
            window.awsAuth.showNotification('Passwörter stimmen nicht überein', 'error');
            return;
        }
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrieren...';
        
        try {
            const result = await window.awsAuth.register(email, password, firstName, lastName);
            
            if (result.success) {
                window.awsAuth.showNotification(result.message, 'success');
                this.showVerification(email);
            } else {
                window.awsAuth.showNotification(result.error, 'error');
            }
        } catch (error) {
            window.awsAuth.showNotification('Ein Fehler ist aufgetreten', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Registrieren';
        }
    }

    async handleVerification(event) {
        event.preventDefault();
        
        const email = document.getElementById('verificationEmail').textContent;
        const code = document.getElementById('verificationCode').value;
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bestätigen...';
        
        try {
            const result = await window.awsAuth.confirmRegistration(email, code);
            
            if (result.success) {
                window.awsAuth.showNotification(result.message, 'success');
                this.closeModal();
                this.showLogin();
            } else {
                window.awsAuth.showNotification(result.error, 'error');
            }
        } catch (error) {
            window.awsAuth.showNotification('Ein Fehler ist aufgetreten', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Bestätigen';
        }
    }

    async handleForgotPassword(event) {
        event.preventDefault();
        
        const email = document.getElementById('forgotEmail').value;
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Senden...';
        
        try {
            const result = await window.awsAuth.forgotPassword(email);
            
            if (result.success) {
                window.awsAuth.showNotification(result.message, 'success');
                this.closeModal();
                this.showResetPassword();
            } else {
                window.awsAuth.showNotification(result.error, 'error');
            }
        } catch (error) {
            window.awsAuth.showNotification('Ein Fehler ist aufgetreten', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Code senden';
        }
    }

    async handleResetPassword(event) {
        event.preventDefault();
        
        const code = document.getElementById('resetCode').value;
        const password = document.getElementById('resetPassword').value;
        const passwordConfirm = document.getElementById('resetPasswordConfirm').value;
        
        // Validate passwords match
        if (password !== passwordConfirm) {
            window.awsAuth.showNotification('Passwörter stimmen nicht überein', 'error');
            return;
        }
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ändern...';
        
        try {
            // Get email from previous step (you might need to store this)
            const email = localStorage.getItem('forgotPasswordEmail') || '';
            const result = await window.awsAuth.resetPassword(email, code, password);
            
            if (result.success) {
                window.awsAuth.showNotification(result.message, 'success');
                this.closeModal();
                this.showLogin();
            } else {
                window.awsAuth.showNotification(result.error, 'error');
            }
        } catch (error) {
            window.awsAuth.showNotification('Ein Fehler ist aufgetreten', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Passwort ändern';
        }
    }

    resendCode() {
        // Implement resend verification code
        window.awsAuth.showNotification('Code wird erneut gesendet...', 'info');
    }
}

// Initialize Auth Modals
window.authModals = new AuthModals();