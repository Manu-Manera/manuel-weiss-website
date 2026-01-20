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
        this.createModalsHTML(); // Create modals if not existing
        this.setupEventListeners();
        
        // Warte auf Auth-System
        this.waitForAuthSystem();
    }
    
    /**
     * Create modal HTML if it doesn't exist
     */
    createModalsHTML() {
        // Check if modals already exist
        if (document.getElementById('loginModal')) {
            console.log('✅ Auth modals already in DOM');
            return;
        }
        
        console.log('📝 Creating auth modals dynamically...');
        
        const container = document.createElement('div');
        container.id = 'authModalsContainer';
        container.innerHTML = `
            <!-- Login Modal -->
            <div class="auth-modal" id="loginModal" style="display: none;">
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
                                <a href="#" onclick="authModals.showForgotPassword(); return false;" class="forgot-link">
                                    Passwort vergessen?
                                </a>
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-sign-in-alt"></i>
                                Anmelden
                            </button>
                        </form>
                        <div class="modal-footer">
                            <p>Noch kein Konto? <a href="#" onclick="authModals.showRegister(); return false;">Jetzt registrieren</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Register Modal -->
            <div class="auth-modal" id="registerModal" style="display: none;">
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
                                    Ich akzeptiere die <a href="../nutzungsbedingungen.html" target="_blank">Nutzungsbedingungen</a> und <a href="../datenschutz.html" target="_blank">Datenschutzerklärung</a>
                                </label>
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-user-plus"></i>
                                Registrieren
                            </button>
                        </form>
                        <div class="modal-footer">
                            <p>Bereits ein Konto? <a href="#" onclick="authModals.showLogin(); return false;">Jetzt anmelden</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Verification Modal -->
            <div class="auth-modal" id="verificationModal" style="display: none;">
                <div class="modal-backdrop" onclick="authModals.closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-envelope-open"></i> E-Mail bestätigen</h2>
                        <button class="modal-close" onclick="authModals.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="verification-icon">📧</div>
                        <p class="verification-text">
                            Wir haben einen Bestätigungscode an <strong id="verificationEmail"></strong> gesendet.
                        </p>
                        <form id="verificationForm" onsubmit="authModals.handleVerification(event)">
                            <div class="form-group">
                                <label for="verificationCode">Bestätigungscode</label>
                                <input type="text" id="verificationCode" required placeholder="123456" maxlength="6">
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-check"></i>
                                E-Mail bestätigen
                            </button>
                        </form>
                        <div class="modal-footer">
                            <p>Keinen Code erhalten? <a href="#" onclick="authModals.resendCode(); return false;">Erneut senden</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Forgot Password Modal -->
            <div class="auth-modal" id="forgotPasswordModal" style="display: none;">
                <div class="modal-backdrop" onclick="authModals.closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-key"></i> Passwort vergessen</h2>
                        <button class="modal-close" onclick="authModals.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Code zum Zurücksetzen.</p>
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
                            <p><a href="#" onclick="authModals.showLogin(); return false;">Zurück zur Anmeldung</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reset Password Modal -->
            <div class="auth-modal" id="resetPasswordModal" style="display: none;">
                <div class="modal-backdrop" onclick="authModals.closeModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-lock"></i> Neues Passwort</h2>
                        <button class="modal-close" onclick="authModals.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="resetPasswordForm" onsubmit="authModals.handleResetPassword(event)">
                            <div class="form-group">
                                <label for="resetCode">Bestätigungscode</label>
                                <input type="text" id="resetCode" required placeholder="123456" maxlength="6">
                            </div>
                            <div class="form-group">
                                <label for="resetPassword">Neues Passwort</label>
                                <input type="password" id="resetPassword" required placeholder="Mindestens 8 Zeichen">
                            </div>
                            <div class="form-group">
                                <label for="resetPasswordConfirm">Passwort bestätigen</label>
                                <input type="password" id="resetPasswordConfirm" required placeholder="Passwort wiederholen">
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i>
                                Passwort speichern
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        console.log('✅ Auth modals created dynamically');
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
                
                // Dispatch auth state changed event
                window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: true } }));
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: result.user }));
                
                // Show success message
                this.showToast('Erfolgreich angemeldet!', 'success');
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
     * FIX: Passwort temporär speichern für Auto-Login nach Bestätigung
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
                // Passwort temporär speichern für Auto-Login nach Bestätigung
                // Wird nach erfolgreichem Login oder nach 10 Minuten gelöscht
                sessionStorage.setItem('tempRegPassword', password);
                setTimeout(() => sessionStorage.removeItem('tempRegPassword'), 600000); // 10 Min
                
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
     * FIX: Nach erfolgreicher Bestätigung automatisch einloggen wenn Passwort gespeichert
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
        
        console.log('🔐 Verification attempt for:', email, 'with code:', code);
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bestätigen...';
        
        try {
            const result = await window.awsAuth.confirmRegistration(email, code);
            
            console.log('🔐 Confirmation result:', result);
            
            if (result.success) {
                this.showToast('✅ E-Mail erfolgreich bestätigt!', 'success');
                
                // Versuche automatisches Login wenn Passwort temporär gespeichert
                const tempPassword = sessionStorage.getItem('tempRegPassword');
                if (tempPassword) {
                    console.log('🔐 Attempting auto-login after verification...');
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Anmelden...';
                    
                    // Kurz warten damit Cognito die Bestätigung verarbeiten kann
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const loginResult = await window.awsAuth.login(email, tempPassword);
                    sessionStorage.removeItem('tempRegPassword');
                    
                    if (loginResult.success) {
                        this.closeModal();
                        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: true } }));
                        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: loginResult.user }));
                        return;
                    }
                }
                
                // Fallback: Login-Modal anzeigen
                this.closeModal();
                setTimeout(() => {
                    this.showLogin();
                    this.showToast('Bitte melden Sie sich jetzt an', 'info');
                }, 500);
            } else {
                console.error('❌ Confirmation failed:', result);
                this.showError(result.error || 'Bestätigung fehlgeschlagen');
            }
        } catch (error) {
            console.error('❌ Verification error:', error);
            this.showError('Bestätigung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
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
     * FIX: Bessere Fehlerbehandlung und Feedback
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
        
        console.log('📧 Resending code to:', email);
        
        // Button-Feedback
        const resendLink = document.querySelector('#verificationModal .modal-footer a');
        const originalText = resendLink?.textContent;
        if (resendLink) {
            resendLink.textContent = 'Wird gesendet...';
            resendLink.style.pointerEvents = 'none';
        }
        
        try {
            const result = await window.awsAuth.resendConfirmationCode(email);
            console.log('✅ Resend result:', result);
            this.showToast('Neuer Code wurde gesendet!', 'success');
        } catch (error) {
            console.error('❌ Resend code error:', error);
            
            // Spezifische Fehlermeldungen
            let errorMsg = 'Code konnte nicht gesendet werden. ';
            if (error.code === 'LimitExceededException') {
                errorMsg = 'Zu viele Versuche. Bitte warten Sie einige Minuten.';
            } else if (error.code === 'NotAuthorizedException') {
                errorMsg = 'Benutzer ist bereits bestätigt. Bitte versuchen Sie sich anzumelden.';
                // Zeige Login Modal
                setTimeout(() => this.showLogin(), 2000);
            } else if (error.code === 'UserNotFoundException') {
                errorMsg = 'Benutzer nicht gefunden. Bitte registrieren Sie sich erneut.';
            } else {
                errorMsg += error.message || 'Unbekannter Fehler.';
            }
            
            this.showError(errorMsg);
        } finally {
            // Button zurücksetzen
            if (resendLink) {
                resendLink.textContent = originalText || 'Erneut senden';
                resendLink.style.pointerEvents = 'auto';
            }
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
    
    showToast(message, type = 'success') {
        if (window.awsAuth?.showNotification) {
            window.awsAuth.showNotification(message, type);
        } else {
            // Fallback Toast
            const toast = document.createElement('div');
            toast.className = `auth-toast auth-toast-${type}`;
            toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
                color: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                z-index: 100001;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                animation: slideIn 0.3s ease;
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
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

