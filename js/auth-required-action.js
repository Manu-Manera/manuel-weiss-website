/**
 * Auth Required Action Handler
 * Prüft beim ersten "Weiter"-Klick, ob User angemeldet ist
 * und zeigt Login-Prompt falls nicht
 */

class AuthRequiredAction {
    constructor() {
        this.loginPromptShown = false;
        this.pendingAction = null;
    }

    /**
     * Prüft ob User angemeldet ist, zeigt Login-Prompt falls nicht
     * @param {Function} action - Die Aktion, die nach erfolgreicher Anmeldung ausgeführt werden soll
     * @param {Object} options - Optionen (message, showPrompt)
     * @returns {Promise<boolean>} - true wenn angemeldet, false wenn nicht
     */
    async requireAuth(action = null, options = {}) {
        // Prüfe ob Auth-System verfügbar ist
        if (!window.realUserAuth) {
            console.warn('Auth system not available');
            return false;
        }

        // Prüfe ob User angemeldet ist
        const isLoggedIn = window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn();
        
        if (isLoggedIn) {
            // User ist angemeldet, führe Aktion aus
            if (action && typeof action === 'function') {
                try {
                    await action();
                } catch (error) {
                    console.error('Error executing action after auth:', error);
                }
            }
            return true;
        }

        // User ist nicht angemeldet
        // Speichere Aktion für später
        if (action) {
            this.pendingAction = action;
        }

        // Zeige Login-Prompt (nur einmal)
        if (!this.loginPromptShown || options.forcePrompt) {
            this.showLoginPrompt(options.message || 'Bitte melde dich an, um fortzufahren und deinen Fortschritt zu speichern.');
            this.loginPromptShown = true;
        }

        return false;
    }

    /**
     * Zeigt Login-Prompt Modal
     */
    showLoginPrompt(message) {
        // Entferne existierende Prompts
        const existing = document.getElementById('authRequiredPrompt');
        if (existing) {
            existing.remove();
        }

        const promptHTML = `
            <div class="auth-required-overlay" id="authRequiredPrompt">
                <div class="auth-required-card">
                    <div class="auth-required-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h3 class="auth-required-title">Anmeldung erforderlich</h3>
                    <p class="auth-required-message">${message}</p>
                    <div class="auth-required-benefits">
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Dein Fortschritt wird automatisch gespeichert</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Zugriff von allen Geräten</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Persönliche Auswertungen und Ergebnisse</span>
                        </div>
                    </div>
                    <div class="auth-required-actions">
                        <button class="btn btn-primary" id="authRequiredLoginBtn">
                            <i class="fas fa-sign-in-alt"></i> Anmelden
                        </button>
                        <button class="btn btn-secondary" id="authRequiredRegisterBtn">
                            <i class="fas fa-user-plus"></i> Registrieren
                        </button>
                    </div>
                    <button class="auth-required-close" id="authRequiredCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#authRequiredStyles')) {
            const styles = `
                <style id="authRequiredStyles">
                    .auth-required-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.85);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        animation: fadeIn 0.3s ease;
                        backdrop-filter: blur(4px);
                    }
                    
                    .auth-required-card {
                        background: white;
                        border-radius: 16px;
                        padding: 48px;
                        max-width: 520px;
                        width: 90%;
                        position: relative;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        animation: slideUp 0.3s ease;
                    }
                    
                    .auth-required-icon {
                        width: 90px;
                        height: 90px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                    }
                    
                    .auth-required-icon i {
                        font-size: 42px;
                        color: white;
                    }
                    
                    .auth-required-title {
                        text-align: center;
                        font-size: 28px;
                        font-weight: 700;
                        color: #1a202c;
                        margin-bottom: 16px;
                    }
                    
                    .auth-required-message {
                        text-align: center;
                        color: #4a5568;
                        margin-bottom: 32px;
                        line-height: 1.6;
                        font-size: 16px;
                    }
                    
                    .auth-required-benefits {
                        background: #f7fafc;
                        border-radius: 12px;
                        padding: 24px;
                        margin-bottom: 32px;
                    }
                    
                    .benefit-item {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        margin-bottom: 16px;
                        color: #2d3748;
                        font-size: 15px;
                    }
                    
                    .benefit-item:last-child {
                        margin-bottom: 0;
                    }
                    
                    .benefit-item i {
                        color: #48bb78;
                        font-size: 20px;
                        flex-shrink: 0;
                    }
                    
                    .auth-required-actions {
                        display: flex;
                        gap: 16px;
                    }
                    
                    .auth-required-actions button {
                        flex: 1;
                        padding: 14px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        transition: all 0.2s ease;
                        cursor: pointer;
                        border: none;
                    }
                    
                    .auth-required-actions .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    
                    .auth-required-actions .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                    }
                    
                    .auth-required-actions .btn-secondary {
                        background: #e2e8f0;
                        color: #4a5568;
                    }
                    
                    .auth-required-actions .btn-secondary:hover {
                        background: #cbd5e0;
                    }
                    
                    .auth-required-close {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: none;
                        border: none;
                        font-size: 22px;
                        color: #a0aec0;
                        cursor: pointer;
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 6px;
                        transition: all 0.2s ease;
                    }
                    
                    .auth-required-close:hover {
                        background: #f7fafc;
                        color: #4a5568;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes slideUp {
                        from {
                            transform: translateY(30px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
        
        // Add prompt to page
        document.body.insertAdjacentHTML('beforeend', promptHTML);

        // Event Listeners
        const loginBtn = document.getElementById('authRequiredLoginBtn');
        const registerBtn = document.getElementById('authRequiredRegisterBtn');
        const closeBtn = document.getElementById('authRequiredCloseBtn');
        const overlay = document.getElementById('authRequiredPrompt');

        if (loginBtn && window.realUserAuth && window.realUserAuth.showLoginModal) {
            loginBtn.addEventListener('click', () => {
                window.realUserAuth.showLoginModal();
            });
        }

        if (registerBtn && window.realUserAuth && window.realUserAuth.showRegisterModal) {
            registerBtn.addEventListener('click', () => {
                window.realUserAuth.showRegisterModal();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (overlay) overlay.remove();
                this.loginPromptShown = false;
            });
        }

        // Listen for successful login
        const authHandler = (e) => {
            if (e.detail && e.detail.isAuthenticated) {
                if (overlay) overlay.remove();
                this.loginPromptShown = false;
                
                // Führe gespeicherte Aktion aus
                if (this.pendingAction) {
                    const action = this.pendingAction;
                    this.pendingAction = null;
                    setTimeout(() => {
                        action();
                    }, 500); // Kurze Verzögerung für UI-Update
                }
                
                // Entferne Event Listener
                window.removeEventListener('authStateChanged', authHandler);
                window.removeEventListener('userLogin', authHandler);
            }
        };

        window.addEventListener('authStateChanged', authHandler);
        window.addEventListener('userLogin', authHandler);
    }

    /**
     * Wrapper für "Weiter"-Button Handler
     * @param {Function} nextAction - Die eigentliche "Weiter"-Aktion
     * @param {Object} options - Optionen
     */
    async handleNextButton(nextAction, options = {}) {
        return await this.requireAuth(nextAction, {
            message: options.message || 'Bitte melde dich an, um fortzufahren und deinen Fortschritt zu speichern.',
            forcePrompt: options.forcePrompt || false
        });
    }

    /**
     * Reset (z.B. nach Logout)
     */
    reset() {
        this.loginPromptShown = false;
        this.pendingAction = null;
        const overlay = document.getElementById('authRequiredPrompt');
        if (overlay) overlay.remove();
    }
}

// Create global instance
window.authRequiredAction = new AuthRequiredAction();

// Reset on logout
if (window.realUserAuth && typeof window.realUserAuth.onAuthStateChange === 'function') {
    window.realUserAuth.onAuthStateChange((isAuthenticated) => {
        if (!isAuthenticated) {
            window.authRequiredAction.reset();
        }
    });
}

