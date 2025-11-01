/**
 * UNIFIED AUTHENTICATION MODALS
 * Einheitliche Modal-Verwaltung für alle Auth-Operationen
 * Integriert mit unified-aws-auth.js
 */

class UnifiedAuthModals {
    constructor() {
        this.currentModal = null;
        this.currentEmail = null; // Für Verifikation und Passwort-Reset
        this.init();
    }

    init() {
        this.addStyles();
        this.setupEventListeners();
        
        // Warte auf Auth-System
        this.waitForAuthSystem();
    }

    /**
     * Warte auf Auth-System Initialisierung
     */
    async waitForAuthSystem() {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!window.awsAuth && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.awsAuth) {
            console.error('❌ Auth System nicht gefunden');
        } else {
            console.log('✅ Auth Modals ready');
        }
    }

    /**
     * Event Listeners einrichten
     */
    setupEventListeners() {
        // ESC-Taste zum Schließen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });

        // Formular-Validierung
        this.setupFormValidation();
    }

    /**
     * Formular-Validierung einrichten
     */
    setupFormValidation() {
        // Passwort-Bestätigung in Echtzeit prüfen
        const passwordConfirmInputs = document.querySelectorAll('#registerPasswordConfirm, #resetPasswordConfirm');
        passwordConfirmInputs.forEach(input => {
            input.addEventListener('input', () => {
                const passwordInput = input.id === 'registerPasswordConfirm' 
                    ? document.getElementById('registerPassword')
                    : document.getElementById('resetPassword');
                
                if (passwordInput && input.value) {
                    if (passwordInput.value !== input.value) {
                        input.setCustomValidity('Passwörter stimmen nicht überein');
                    } else {
                        input.setCustomValidity('');
                    }
                }
            });
        });

        // Passwort-Anforderungen prüfen
        const passwordInputs = document.querySelectorAll('#registerPassword, #resetPassword');
        passwordInputs.forEach(input => {
            input.addEventListener('input', () => {
                const password = input.value;
                const minLength = 8;
                const hasUpper = /[A-Z]/.test(password);
                const hasLower = /[a-z]/.test(password);
                const hasNumber = /[0-9]/.test(password);

                if (password.length < minLength) {
                    input.setCustomValidity(`Passwort muss mindestens ${minLength} Zeichen lang sein`);
                } else if (!hasUpper || !hasLower) {
                    input.setCustomValidity('Passwort muss Groß- und Kleinbuchstaben enthalten');
                } else if (!hasNumber) {
                    input.setCustomValidity('Passwort muss mindestens eine Zahl enthalten');
                } else {
                    input.setCustomValidity('');
                }
            });
        });
    }

    /**
     * Styles hinzufügen
     */
    addStyles() {
        const styleId = 'unified-auth-modals-styles';
        if (document.getElementById(styleId)) {
            return; // Styles bereits vorhanden
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }

            .auth-modal[style*="display: block"],
            .auth-modal.show {
                display: flex !important;
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
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
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
                font-size: 0.875rem;
            }

            .form-group input {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 1rem;
                transition: all 0.2s ease;
                box-sizing: border-box;
            }

            .form-group input:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .form-group input:invalid {
                border-color: #ef4444;
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

            .btn-primary:hover:not(:disabled) {
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
                font-size: 0.875rem;
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
                font-size: 1.125rem;
            }

            .verification-info p,
            .forgot-info p,
            .reset-info p {
                margin: 0.5rem 0;
                color: #6b7280;
                font-size: 0.875rem;
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

    /**
     * Modal anzeigen
     */
    showModal(modalId) {
        this.closeModal();
        this.currentModal = modalId;
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            // Focus auf erstes Input
            setTimeout(() => {
                const firstInput = modal.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }

    /**
     * Modal schließen
     */
    closeModal() {
        if (this.currentModal) {
            const modal = document.getElementById(this.currentModal);
            if (modal) {
                modal.style.display = 'none';
            }
            this.currentModal = null;
        }
    }

    /**
     * Login Modal anzeigen
     */
    showLogin() {
        this.showModal('loginModal');
    }

    /**
     * Register Modal anzeigen
     */
    showRegister() {
        this.showModal('registerModal');
    }

    /**
     * Verification Modal anzeigen
     */
    showVerification(email) {
        this.currentEmail = email;
        const emailEl = document.getElementById('verificationEmail');
        if (emailEl) {
            emailEl.textContent = email;
        }
        this.showModal('verificationModal');
    }

    /**
     * Forgot Password Modal anzeigen
     */
    showForgotPassword() {
        this.showModal('forgotPasswordModal');
    }

    /**
     * Reset Password Modal anzeigen
     */
    showResetPassword(email) {
        this.currentEmail = email || localStorage.getItem('forgotPasswordEmail');
        this.showModal('resetPasswordModal');
    }

    /**
     * Login Handler
     */
    async handleLogin(event) {
        event.preventDefault();
        
        if (!window.awsAuth) {
            this.showError('Auth-System nicht verfügbar. Bitte Seite neu laden.');
            return;
        }
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
        
        try {
            const result = await window.awsAuth.login(email, password);
            
            if (result.success) {
                this.closeModal();
                // Optional: Weiterleitung zur Profilseite nach kurzer Verzögerung
                setTimeout(() => {
                    // Nur weiterleiten wenn auf bestimmten Seiten
                    const currentPath = window.location.pathname;
                    if (currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
                        // Optional: Weiterleitung zu Profil
                        // window.location.href = 'user-profile.html';
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }

    /**
     * Register Handler
     */
    async handleRegister(event) {
        event.preventDefault();
        
        if (!window.awsAuth) {
            this.showError('Auth-System nicht verfügbar. Bitte Seite neu laden.');
            return;
        }
        
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        // Passwort-Validierung
        if (password !== passwordConfirm) {
            window.awsAuth.showNotification('Passwörter stimmen nicht überein', 'error');
            return;
        }
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrieren...';
        
        try {
            const name = `${firstName} ${lastName}`.trim();
            const result = await window.awsAuth.registerWithAttributes(email, password, firstName, lastName);
            
            if (result.success) {
                this.showVerification(email);
            }
        } catch (error) {
            console.error('Register error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }

    /**
     * Verification Handler
     */
    async handleVerification(event) {
        event.preventDefault();
        
        if (!window.awsAuth) {
            this.showError('Auth-System nicht verfügbar. Bitte Seite neu laden.');
            return;
        }
        
        const email = this.currentEmail || document.getElementById('verificationEmail')?.textContent;
        const code = document.getElementById('verificationCode').value;
        
        if (!email) {
            this.showError('E-Mail-Adresse nicht gefunden');
            return;
        }
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bestätigen...';
        
        try {
            const result = await window.awsAuth.confirmRegistration(email, code);
            
            if (result.success) {
                this.closeModal();
                setTimeout(() => {
                    this.showLogin();
                }, 500);
            }
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }

    /**
     * Forgot Password Handler
     */
    async handleForgotPassword(event) {
        event.preventDefault();
        
        if (!window.awsAuth) {
            this.showError('Auth-System nicht verfügbar. Bitte Seite neu laden.');
            return;
        }
        
        const email = document.getElementById('forgotEmail').value;
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Senden...';
        
        try {
            const result = await window.awsAuth.forgotPassword(email);
            
            if (result.success) {
                this.closeModal();
                setTimeout(() => {
                    this.showResetPassword(email);
                }, 500);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }

    /**
     * Reset Password Handler
     */
    async handleResetPassword(event) {
        event.preventDefault();
        
        if (!window.awsAuth) {
            this.showError('Auth-System nicht verfügbar. Bitte Seite neu laden.');
            return;
        }
        
        const email = this.currentEmail || localStorage.getItem('forgotPasswordEmail');
        const code = document.getElementById('resetCode').value;
        const password = document.getElementById('resetPassword').value;
        const passwordConfirm = document.getElementById('resetPasswordConfirm').value;
        
        if (!email) {
            this.showError('E-Mail-Adresse nicht gefunden');
            return;
        }
        
        // Passwort-Validierung
        if (password !== passwordConfirm) {
            window.awsAuth.showNotification('Passwörter stimmen nicht überein', 'error');
            return;
        }
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ändern...';
        
        try {
            const result = await window.awsAuth.resetPassword(email, code, password);
            
            if (result.success) {
                this.closeModal();
                setTimeout(() => {
                    this.showLogin();
                }, 500);
            }
        } catch (error) {
            console.error('Reset password error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }

    /**
     * Code erneut senden
     */
    async resendCode() {
        if (!window.awsAuth) {
            this.showError('Auth-System nicht verfügbar.');
            return;
        }
        
        const email = this.currentEmail || document.getElementById('verificationEmail')?.textContent;
        
        if (!email) {
            this.showError('E-Mail-Adresse nicht gefunden');
            return;
        }
        
        try {
            await window.awsAuth.resendConfirmationCode(email);
        } catch (error) {
            console.error('Resend code error:', error);
        }
    }

    /**
     * Fehler anzeigen
     */
    showError(message) {
        if (window.awsAuth) {
            window.awsAuth.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Globale Instanz erstellen
window.authModals = new UnifiedAuthModals();

// Globale Helper-Funktionen für Rückwärtskompatibilität
window.showLoginModal = () => window.authModals.showLogin();
window.showRegisterModal = () => window.authModals.showRegister();
window.showForgotPasswordModal = () => window.authModals.showForgotPassword();
window.closeLoginModal = () => window.authModals.closeModal();
window.closeSignupModal = () => window.authModals.closeModal();

console.log('✅ Unified Auth Modals loaded');

