// Real User Authentication System - Echte Benutzerkonten mit AWS Cognito
// Vollständige Integration mit AWS Cognito für Produktion

class RealUserAuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.userData = null;
        this.progressData = {};
        this.achievements = [];
        this.goals = [];
        this.authStateListeners = [];
        this.lastAuthState = null;
        
        // AWS Cognito Configuration
        this.userPoolId = window.AWS_CONFIG?.userPoolId || 'eu-central-1_8gP4gLK9r';
        this.clientId = window.AWS_CONFIG?.clientId || '7kc5tt6a23fgh53d60vkefm812';
        this.region = window.AWS_CONFIG?.region || 'eu-central-1';
        this.cognitoIdentityServiceProvider = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Real User Auth System with AWS Cognito...');
        
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
            console.log('✅ AWS Cognito initialized');
        
        // Check for existing session
        await this.checkExistingSession();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.initializeUI();
        
            console.log('✅ Real User Auth System initialized with AWS Cognito');
        } catch (error) {
            console.error('❌ Initialization error:', error);
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
            // Check for stored AWS Cognito tokens
            const storedSession = localStorage.getItem('aws_auth_session');
            
            if (!storedSession) {
                console.log('ℹ️ No stored session found');
                return;
            }
            
            const session = JSON.parse(storedSession);
            console.log('🔍 Checking existing session...', {
                hasIdToken: !!session.idToken,
                hasRefreshToken: !!session.refreshToken,
                expiresAt: session.expiresAt,
                rememberMe: session.rememberMe
            });
            
            // Check if session is still valid (60 Minuten Standard oder 30 Tage mit "Angemeldet bleiben")
            const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
            const now = new Date();
            const isValid = session.idToken && expiresAt && expiresAt > now;
            
            console.log('⏰ Session expiration check:', {
                expiresAt: expiresAt?.toISOString(),
                now: now.toISOString(),
                isValid: isValid,
                timeRemaining: expiresAt ? Math.round((expiresAt - now) / 1000 / 60) + ' Minuten' : 'unbekannt'
            });
            
            if (isValid) {
                // Try to get user info from token
                try {
                    const userInfo = await this.getUserInfo(session.idToken);
                    this.currentUser = userInfo;
                    this.isAuthenticated = true;
                    this.userData = userInfo;
                    
                    // Load user progress and data
                    await this.loadUserData();
                    
                    // Update UI immediately
                    this.updateAuthUI();
                    this.notifyAuthStateChange(true);
                    
                    console.log('✅ Existing AWS Cognito session restored:', userInfo.email);
                    return;
                } catch (error) {
                    console.warn('⚠️ Token validation failed:', error);
                    
                    // Bei Netzwerkfehlern: Session behalten und aus gespeicherten Daten wiederherstellen
                    if (error.name === 'NetworkError' || !navigator.onLine) {
                        console.warn('📡 Netzwerkfehler erkannt - behalte Session bei');
                    }
                    
                    // Versuche aus gespeicherten Benutzerdaten wiederherzustellen
                    const storedUser = localStorage.getItem('realUser');
                    if (storedUser) {
                        try {
                            this.currentUser = JSON.parse(storedUser);
                            this.isAuthenticated = true;
                            this.userData = this.currentUser;
                            this.updateAuthUI();
                            console.log('✅ Session aus gespeicherten Daten wiederhergestellt:', this.currentUser.email);
                            this.notifyAuthStateChange(true);
                            
                            // Versuche Token-Refresh im Hintergrund
                            if (session.refreshToken) {
                                this.refreshSessionInBackground(session.refreshToken);
                            }
                            return;
                        } catch (e) {
                            console.warn('⚠️ Konnte nicht aus gespeicherten Daten wiederherstellen');
                        }
                    }
                    
                    // Nur bei definitiven Auth-Fehlern Session löschen
                    if (error.code === 'NotAuthorizedException') {
                        console.warn('🔒 Token ungültig - Session wird gelöscht');
                        this.clearSession();
                    }
                }
            } else {
                // Session expired, try to refresh
                if (session.refreshToken) {
                    console.log('🔄 Session expired, attempting refresh...');
                    try {
                        await this.refreshSession(session.refreshToken);
                        return;
                    } catch (error) {
                        console.warn('⚠️ Token refresh failed:', error);
                        // Only clear if refresh definitely failed
                        this.clearSession();
                    }
                } else {
                    console.warn('⚠️ Session expired and no refresh token available');
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('❌ Error checking existing session:', error);
            // Don't clear session on parse errors - might be recoverable
            // Try to restore from stored user data as fallback
            const storedUser = localStorage.getItem('realUser');
            if (storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                    this.isAuthenticated = true;
                    this.userData = this.currentUser;
                    this.updateAuthUI();
                    console.log('✅ Restored from stored user data (fallback):', this.currentUser.email);
                    this.notifyAuthStateChange(true);
                } catch (e) {
                    console.warn('⚠️ Could not restore from stored user data');
                }
            }
        }
    }
    
    async getUserInfo(idToken) {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        return {
            id: payload.sub,
            email: payload.email,
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            emailVerified: payload.email_verified
        };
    }
    
    async refreshSession(refreshToken) {
        if (!this.isInitialized) {
            throw new Error('System not initialized');
        }
        
        try {
            console.log('🔄 Refreshing session with refresh token...');
            
            const result = await this.cognitoIdentityServiceProvider.initiateAuth({
                AuthFlow: 'REFRESH_TOKEN_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    REFRESH_TOKEN: refreshToken
                }
            }).promise();
            
            // Get rememberMe from existing session
            const existingSession = localStorage.getItem('aws_auth_session');
            const rememberMe = existingSession ? JSON.parse(existingSession).rememberMe : false;
            
            // Save new session with same rememberMe setting
            const session = {
                idToken: result.AuthenticationResult.IdToken,
                accessToken: result.AuthenticationResult.AccessToken,
                refreshToken: refreshToken,
                expiresAt: new Date(Date.now() + result.AuthenticationResult.ExpiresIn * 1000).toISOString()
            };
            
            // Use saveSession to maintain rememberMe setting
            this.saveSession(session, rememberMe);
            
            const userInfo = await this.getUserInfo(session.idToken);
            this.currentUser = userInfo;
            this.isAuthenticated = true;
            this.userData = userInfo;
            
            // Load user data and update UI
            await this.loadUserData();
            this.updateAuthUI();
            this.notifyAuthStateChange(true);
            
            console.log('✅ Session refreshed successfully');
        } catch (error) {
            console.error('❌ Session refresh failed:', error);
            throw error;
        }
    }
    
    async refreshSessionInBackground(refreshToken) {
        // Refresh Session im Hintergrund ohne Fehler zu werfen
        try {
            console.log('🔄 Starte Hintergrund-Token-Refresh...');
            await this.refreshSession(refreshToken);
        } catch (error) {
            console.warn('⚠️ Hintergrund-Token-Refresh fehlgeschlagen:', error);
            // Fehler wird nur geloggt, nicht geworfen
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
        
        // Listen for storage events (Synchronisierung zwischen Tabs/Fenstern)
        window.addEventListener('storage', (e) => {
            if (e.key === 'aws_auth_session') {
                console.log('🔄 Session-Änderung in anderem Tab erkannt');
                // Session aus anderem Tab neu laden
                this.checkExistingSession().then(() => {
                    console.log('✅ Session synchronisiert');
                });
            }
        });
        
        // Prüfe Session beim Fokus-Wechsel (wichtig für Safari)
        window.addEventListener('focus', () => {
            console.log('🔍 Fenster hat Fokus erhalten - prüfe Session');
            this.checkExistingSession();
        });
        
        // Prüfe Session bei Sichtbarkeitsänderung (Page Visibility API)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('🔍 Seite ist wieder sichtbar - prüfe Session');
                this.checkExistingSession();
            }
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
        // Try immediately
        this.attachButtonListeners();
        
        // Also try after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('📋 DOMContentLoaded - attaching button listeners');
                this.attachButtonListeners();
            });
        } else {
            // DOM already ready, attach immediately
            this.attachButtonListeners();
        }
        
        // Also try after a short delay (in case button is added dynamically)
        setTimeout(() => {
            console.log('⏰ Delayed button listener attachment');
            this.attachButtonListeners();
        }, 100);
        
        // Also try after window load
        window.addEventListener('load', () => {
            console.log('🪟 Window loaded - attaching button listeners');
            this.attachButtonListeners();
        });
    }

    getUserDropdownElement() {
        return document.getElementById('userDropdown') || document.getElementById('realUserMenu');
    }

    ensureAuthButtonLabel(authButton) {
        if (!authButton) {
            return null;
        }

        let buttonSpan = authButton.querySelector('.auth-btn-label') || authButton.querySelector('span');
        if (!buttonSpan) {
            // Remove standalone text nodes (e.g., legacy markup without span)
            Array.from(authButton.childNodes).forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                    authButton.removeChild(node);
                }
            });

            buttonSpan = document.createElement('span');
            buttonSpan.className = 'auth-btn-label';
            authButton.appendChild(buttonSpan);
        }

        return buttonSpan;
    }
    
    attachButtonListeners() {
        const authButton = document.getElementById('realAuthButton');
        console.log('🔍 Looking for #realAuthButton:', authButton ? 'FOUND' : 'NOT FOUND');
        
        if (authButton) {
            // Remove existing listeners and onclick handlers
            authButton.onclick = null;
            if (this.handleAuthButtonClick) {
                authButton.removeEventListener('click', this.handleAuthButtonClick);
            }
            
            // Create handler function
            this.handleAuthButtonClick = (e) => {
                console.log('🔘 Login button clicked!', e);
                e.preventDefault();
                e.stopPropagation();
                
                // Use requestAnimationFrame for immediate response
                requestAnimationFrame(() => {
                    if (this.isAuthenticated) {
                        console.log('👤 User is authenticated - showing dropdown');
                        // Toggle user dropdown
                        const userDropdown = this.getUserDropdownElement();
                        if (userDropdown) {
                            const isVisible = userDropdown.style.display === 'block';
                            userDropdown.style.display = isVisible ? 'none' : 'block';
                            console.log('📋 Dropdown toggled:', isVisible ? 'hidden' : 'visible');
                        }
                    } else {
                        console.log('🔓 User not authenticated - showing login modal');
                        // Show login modal
                        const modal = document.getElementById('realAuthModal');
                        console.log('📦 Modal element:', modal ? 'FOUND' : 'NOT FOUND');
                        
                        if (modal) {
                            this.showAuthModal();
                        } else {
                            console.error('❌ Modal not found! Creating it now...');
                            this.createAuthUI();
                            setTimeout(() => this.showAuthModal(), 100);
                        }
                    }
                });
            };
            
            // Remove old listeners first
            authButton.removeEventListener('click', this.handleAuthButtonClick);
            authButton.onclick = null;
            
            // Add listener with capture phase for faster response
            authButton.addEventListener('click', this.handleAuthButtonClick, { capture: true });
            console.log('✅ Login button listener attached to:', authButton);
        } else {
            console.warn('⚠️ #realAuthButton not found in DOM yet');
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
                            <div class="form-group">
                                <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; color: #64748b;">
                                    <input type="checkbox" id="rememberMe" style="width: 18px; height: 18px; cursor: pointer;">
                                    <span>Angemeldet bleiben (30 Tage)</span>
                                </label>
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
                                <input 
                                    type="text" 
                                    id="verifyCode" 
                                    required 
                                    placeholder="000000" 
                                    maxlength="6"
                                    pattern="[0-9]{6}"
                                    inputmode="numeric"
                                    autocomplete="one-time-code"
                                    style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; font-weight: 600; font-family: 'Courier New', monospace;"
                                >
                                <small class="form-hint" style="color: #64748b; margin-top: 0.5rem; display: block;">
                                    <i class="fas fa-info-circle"></i> 
                                    Bitte geben Sie den 6-stelligen Code ein, den Sie per E-Mail erhalten haben.
                                </small>
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                <i class="fas fa-check"></i> E-Mail bestätigen
                            </button>
                            <div class="auth-links">
                                <a href="#" onclick="realUserAuth.resendVerificationCode(); return false;" id="resendCodeLink">
                                    <i class="fas fa-redo"></i> Code erneut senden
                                </a>
                                <small id="resendCooldown" style="display: none; color: #ef4444; margin-top: 0.5rem;">
                                    Bitte warten Sie <span id="cooldownSeconds">60</span> Sekunden
                                </small>
                            </div>
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
        const verifyForm = document.getElementById('verifyEmailForm');
        if (verifyForm) {
            verifyForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleEmailVerification();
            });
            
            // Auto-submit when 6 digits entered
            const verifyCodeInput = document.getElementById('verifyCode');
            if (verifyCodeInput) {
                verifyCodeInput.addEventListener('input', (e) => {
                    // Only allow numbers
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    
                    // Auto-submit when 6 digits entered
                    if (e.target.value.length === 6) {
                        setTimeout(() => {
                            verifyForm.dispatchEvent(new Event('submit'));
                        }, 300);
                    }
                });
                
                // Focus on input when form is shown
                verifyCodeInput.addEventListener('focus', () => {
                    verifyCodeInput.select();
                });
            }
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return;
        }

        try {
            this.showLoading('Anmeldung läuft...');

            // Real AWS Cognito login
            const result = await this.loginWithCognito(email, password);

            if (result.success) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.userData = result.user;
                this.notifyAuthStateChange(true);

                // Save session with rememberMe option
                // Bei neuem Login: Session ohne expiresAt übergeben, damit es basierend auf rememberMe berechnet wird
                const sessionToSave = {
                    idToken: result.session.idToken,
                    accessToken: result.session.accessToken,
                    refreshToken: result.session.refreshToken
                    // expiresAt wird in saveSession basierend auf rememberMe berechnet
                };
                this.saveSession(sessionToSave, rememberMe);

                // Load user data
                await this.loadUserData();

                // Update UI
                this.updateAuthUI();
                this.closeAuthModal();

                this.showNotification('Erfolgreich angemeldet!', 'success');

                // Dispatch login event
                document.dispatchEvent(new CustomEvent('userLogin', { detail: result.user }));
            } else if (result.requiresMFA) {
                // 2FA erforderlich - zeige 2FA-Modal
                this.showMFAChallenge(result.session, result.challengeName);
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Anmeldung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'), 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async loginWithCognito(email, password) {
        try {
            console.log('🚀 Starting AWS Cognito login...');
            console.log('📧 Email:', email);
            console.log('🔑 Client ID:', this.clientId);
            console.log('🏊 User Pool ID:', this.userPoolId);
            console.log('🌍 Region:', this.region);
            
            // Stelle sicher, dass Email getrimmt ist
            const trimmedEmail = email.trim().toLowerCase();
            console.log('📧 Eingabe E-Mail:', email, '→ Getrimmt:', trimmedEmail);
            
            // Für bekannte E-Mails: Verwende direkt den Username (UUID)
            // Das ist nötig weil Cognito den Username als UUID speichert, nicht als E-Mail
            const usernameMappings = {
                'weiss-manuel@gmx.de': '037478a2-b031-7001-3e0d-2a116041afe1'
            };
            
            let usernameToTry = trimmedEmail;
            
            // Prüfe ob wir einen gespeicherten Username haben
            const storedUsername = localStorage.getItem(`cognito_username_${trimmedEmail}`);
            if (storedUsername) {
                usernameToTry = storedUsername;
                console.log('📝 [1] Verwende gespeicherten Username aus localStorage:', usernameToTry);
            } else if (usernameMappings[trimmedEmail]) {
                // Verwende direkt den gemappten Username für bekannte E-Mails
                usernameToTry = usernameMappings[trimmedEmail];
                console.log('📝 [2] Verwende gemappten Username für', trimmedEmail, ':', usernameToTry);
                // Speichere für zukünftige Logins
                localStorage.setItem(`cognito_username_${trimmedEmail}`, usernameToTry);
            } else {
                console.log('⚠️ [3] Kein Mapping gefunden für', trimmedEmail, '- verwende E-Mail als Username');
            }
            
            console.log('🎯 Finaler Username für Login:', usernameToTry);
            
            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    USERNAME: usernameToTry,
                    PASSWORD: password
                }
            };
            
            // SECURITY: Niemals Passwort/Tokens in Logs ausgeben.
            console.log('📤 Sending login request (redacted):', {
                AuthFlow: params.AuthFlow,
                ClientId: params.ClientId,
                AuthParameters: {
                    USERNAME: usernameToTry,
                    PASSWORD: '[REDACTED]'
                }
            });
            console.log('🔑 Username wird verwendet:', usernameToTry);
            console.log('📧 E-Mail war:', trimmedEmail);
            
            const result = await this.cognitoIdentityServiceProvider.initiateAuth(params).promise();
            
            // Prüfe ob 2FA erforderlich ist
            if (result.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
                console.log('🔐 2FA erforderlich');
                return {
                    success: false,
                    requiresMFA: true,
                    challengeName: result.ChallengeName,
                    session: result.Session,
                    error: 'Bitte geben Sie den 2FA-Code aus Ihrer Authenticator-App ein.'
                };
            }
            
            console.log('✅ Login successful');
            
            // Extract tokens
            const authResult = result.AuthenticationResult;
            const session = {
                idToken: authResult.IdToken,
                accessToken: authResult.AccessToken,
                refreshToken: authResult.RefreshToken,
                expiresAt: new Date(Date.now() + authResult.ExpiresIn * 1000).toISOString()
            };
            
            // Get user info from token
            const userInfo = await this.getUserInfo(session.idToken);
            
            return {
                success: true,
                user: userInfo,
                session: session
            };
            
        } catch (error) {
            console.error('❌ Login error:', error);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error message:', error.message);
                // SECURITY: Fehlerobjekte können sensitive Details enthalten.
                console.error('❌ Full error:', { code: error.code, message: error.message, name: error.name });
            
            let errorMessage = 'Anmeldung fehlgeschlagen. ';
            
            if (error.code === 'NotAuthorizedException') {
                errorMessage += 'Ungültige E-Mail-Adresse oder Passwort.';
            } else if (error.code === 'UserNotConfirmedException') {
                errorMessage += 'E-Mail-Adresse wurde noch nicht bestätigt. Bitte prüfen Sie Ihr E-Mail-Postfach.';
                // Show verification form
                this.showEmailVerificationForm();
                localStorage.setItem('pendingVerification', email);
            } else if (error.code === 'UserNotFoundException') {
                // Für weiss-manuel@gmx.de: Der Username ist die UUID
                // Versuche bekannte Username-Mappings
                const usernameMappings = {
                    'weiss-manuel@gmx.de': '037478a2-b031-7001-3e0d-2a116041afe1'
                };
                
                if (usernameMappings[trimmedEmail]) {
                    console.log('🔄 UserNotFoundException - versuche mit bekanntem Username...');
                    try {
                        const retryParams = {
                            AuthFlow: 'USER_PASSWORD_AUTH',
                            ClientId: this.clientId,
                            AuthParameters: {
                                USERNAME: usernameMappings[trimmedEmail],
                                PASSWORD: password
                            }
                        };
                        
                        const retryResult = await this.cognitoIdentityServiceProvider.initiateAuth(retryParams).promise();
                        console.log('✅ Login erfolgreich mit Username!');
                        
                        // Speichere Username für zukünftige Logins
                        localStorage.setItem(`cognito_username_${trimmedEmail}`, usernameMappings[trimmedEmail]);
                        
                        const authResult = retryResult.AuthenticationResult;
                        const session = {
                            idToken: authResult.IdToken,
                            accessToken: authResult.AccessToken,
                            refreshToken: authResult.RefreshToken,
                            expiresAt: new Date(Date.now() + authResult.ExpiresIn * 1000).toISOString()
                        };
                        
                        const userInfoFromToken = await this.getUserInfo(session.idToken);
                        
                        return {
                            success: true,
                            user: userInfoFromToken,
                            session: session
                        };
                    } catch (retryError) {
                        console.error('❌ Retry login failed:', retryError);
                        errorMessage += 'Benutzer nicht gefunden. Bitte registrieren Sie sich zuerst.';
                    }
                } else {
                    errorMessage += 'Benutzer nicht gefunden. Bitte registrieren Sie sich zuerst.';
                }
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            return { success: false, error: errorMessage };
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

        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return;
        }

        try {
            this.showLoading('Registrierung läuft...');

            // Real AWS Cognito registration
            const result = await this.registerWithCognito({
                firstName,
                lastName,
                email,
                password,
                title
            });

            if (result.success) {
                this.showEmailVerificationForm();
                
                // Prüfe ob CodeDeliveryDetails vorhanden sind
                if (result.codeDeliveryDetails) {
                    const destination = result.codeDeliveryDetails.Destination || 'Ihr E-Mail-Postfach';
                    this.showNotification(
                        `✅ Registrierung erfolgreich! Bestätigungscode wurde an ${destination} gesendet. Bitte prüfen Sie Ihr E-Mail-Postfach (auch Spam-Ordner).`,
                        'success'
                    );
                } else {
                    // Versuche Code erneut zu senden
                    console.warn('⚠️ Keine CodeDeliveryDetails - versuche Code erneut zu senden...');
                    try {
                        await this.resendVerificationCode(email);
                        this.showNotification(
                            '✅ Registrierung erfolgreich! Bestätigungscode wurde gesendet. Bitte prüfen Sie Ihr E-Mail-Postfach (auch Spam-Ordner).',
                            'success'
                        );
                    } catch (resendError) {
                        console.error('❌ Fehler beim erneuten Senden:', resendError);
                        
                        // Prüfe ob Auto-Verify das Problem ist
                        if (resendError.message && resendError.message.includes('Auto verification')) {
                            this.showNotification(
                                '⚠️ Auto-Verify ist nicht aktiviert. Bitte aktivieren Sie Auto-Verify in der AWS Console oder kontaktieren Sie den Administrator.',
                                'error'
                            );
                        } else {
                            this.showNotification(
                                '✅ Registrierung erfolgreich! Bitte verwenden Sie "Code erneut senden" falls keine E-Mail angekommen ist. Falls das Problem weiterhin besteht, kontaktieren Sie den Administrator.',
                                'warning'
                            );
                        }
                    }
                }
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registrierung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'), 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async registerWithCognito(userData) {
        try {
            console.log('🚀 Starting AWS Cognito registration...');
            
            const buildAttributes = (includeTitle = true) => {
                const attrs = [
                    { Name: 'email', Value: userData.email },
                    { Name: 'given_name', Value: userData.firstName || '' },
                    { Name: 'family_name', Value: userData.lastName || '' }
                ];
                
                if (includeTitle && userData.title) {
                    attrs.push({
                        Name: 'custom:title',
                        Value: userData.title
                    });
                }
                
                return attrs;
            };
            
            const attemptSignUp = async (includeTitle) => {
                const params = {
                    ClientId: this.clientId,
                    Username: userData.email,
                    Password: userData.password,
                    UserAttributes: buildAttributes(includeTitle)
                };
                
                return this.cognitoIdentityServiceProvider.signUp(params).promise();
            };
            
            let result;
            let triedWithoutTitle = false;
            
            try {
                result = await attemptSignUp(true);
            } catch (initialError) {
                const isTitleAttributeError = 
                    initialError.code === 'InvalidParameterException' &&
                    userData.title &&
                    (
                        (initialError.message && initialError.message.toLowerCase().includes('custom:title')) ||
                        (initialError.message && initialError.message.toLowerCase().includes('attributes')) ||
                        initialError.message === '1 validation error detected: Value at \'userAttributes\' failed to satisfy constraint: Member must satisfy constraint: [Member must satisfy regular expression pattern: [\\p{L}\\p{M}\\p{S}\\p{N}\\p{P}\\p{Z}]+]'
                    );
                
                if (isTitleAttributeError) {
                    console.warn('⚠️ custom:title wird im User Pool nicht unterstützt. Starte erneuten Versuch ohne dieses Attribut.');
                    triedWithoutTitle = true;
                    try {
                        result = await attemptSignUp(false);
                    } catch (retryError) {
                        console.error('❌ Registrierung ohne custom:title ebenfalls fehlgeschlagen:', retryError);
                        throw retryError;
                    }
                } else {
                    throw initialError;
                }
            }
            
            if (triedWithoutTitle) {
                console.log('ℹ️ Registrierung ohne custom:title Attribut erfolgreich.');
            }
            
            console.log('✅ Registration successful');
            console.log('📋 Registration result:', JSON.stringify(result, null, 2));
            
            // Store email for verification
            localStorage.setItem('pendingVerification', userData.email);
            
            // WORKAROUND: Wenn keine CodeDeliveryDetails zurückgegeben werden,
            // versuche Code manuell zu senden (funktioniert nur wenn Auto-Verify aktiviert ist)
            if (!result.CodeDeliveryDetails) {
                console.warn('⚠️ Keine CodeDeliveryDetails in Antwort - versuche Code manuell zu senden...');
                console.warn('⚠️ HINWEIS: Dies funktioniert nur wenn Auto-Verify im User Pool aktiviert ist!');
                try {
                    const resendResult = await this.cognitoIdentityServiceProvider.resendConfirmationCode({
                        ClientId: this.clientId,
                        Username: userData.email
                    }).promise();
                    
                    console.log('✅ Code manuell gesendet:', resendResult.CodeDeliveryDetails);
                    
                    // Verwende die CodeDeliveryDetails vom resend
                    return { 
                        success: true, 
                        userSub: result.UserSub,
                        codeDeliveryDetails: resendResult.CodeDeliveryDetails
                    };
                } catch (resendError) {
                    console.error('❌ Fehler beim manuellen Senden des Codes:', resendError);
                    
                    // Wenn Auto-Verify nicht aktiviert ist, gibt es eine spezifische Fehlermeldung
                    if (resendError.code === 'NotAuthorizedException' && 
                        resendError.message && resendError.message.includes('Auto verification')) {
                        console.error('❌ Auto-Verify ist nicht aktiviert im User Pool!');
                        console.error('❌ Bitte aktivieren Sie Auto-Verify in der AWS Console (siehe FIX_AUTO_VERIFY_MANUAL.md)');
                    }
                    // Weiter mit dem ursprünglichen Ergebnis
                }
            }
            
            return { 
                success: true, 
                userSub: result.UserSub,
                codeDeliveryDetails: result.CodeDeliveryDetails
            };
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            
            let errorMessage = 'Registrierung fehlgeschlagen. ';
            
            if (error.code === 'UsernameExistsException') {
                // Try to resend confirmation code
                try {
                    await this.resendVerificationCode(userData.email);
                    errorMessage = 'Diese E-Mail-Adresse ist bereits registriert. Eine neue Bestätigungs-E-Mail wurde gesendet.';
                } catch (resendError) {
                    errorMessage += 'Diese E-Mail-Adresse ist bereits registriert. Bitte prüfen Sie Ihr E-Mail-Postfach.';
                }
            } else if (error.code === 'InvalidPasswordException') {
                errorMessage += 'Passwort entspricht nicht den Anforderungen (min. 8 Zeichen, Groß- und Kleinbuchstaben, Zahlen).';
            } else if (error.code === 'InvalidParameterException') {
                errorMessage += 'Ungültige Eingabedaten. Bitte prüfen Sie Ihre Eingaben.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            return { success: false, error: errorMessage };
        }
    }

    async handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value;

        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return;
        }

        try {
            this.showLoading('Passwort-Reset wird gesendet...');

            // Real AWS Cognito forgot password
            const result = await this.forgotPasswordWithCognito(email);

            if (result.success) {
                this.showNotification('✅ Reset-Code wurde an Ihre E-Mail gesendet. Bitte prüfen Sie Ihr E-Mail-Postfach.', 'success');
                this.showLoginForm();
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showNotification('Passwort-Reset fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'), 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async forgotPasswordWithCognito(email) {
        try {
            console.log('🚀 Starting AWS Cognito forgot password...');
            
            const params = {
                ClientId: this.clientId,
                Username: email
            };
            
            await this.cognitoIdentityServiceProvider.forgotPassword(params).promise();
            
            console.log('✅ Forgot password code sent');
            
            // Store email for password reset confirmation
            localStorage.setItem('pendingPasswordReset', email);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Forgot password error:', error);
            
            let errorMessage = 'Passwort-Reset fehlgeschlagen. ';
            
            if (error.code === 'UserNotFoundException') {
                errorMessage += 'Benutzer nicht gefunden.';
            } else if (error.code === 'LimitExceededException') {
                errorMessage += 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            return { success: false, error: errorMessage };
        }
    }

    async handleEmailVerification() {
        const code = document.getElementById('verifyCode').value;
        const email = localStorage.getItem('pendingVerification');

        if (!email) {
            this.showNotification('Keine E-Mail-Adresse gefunden. Bitte registrieren Sie sich erneut.', 'error');
            return;
        }

        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return;
        }

        try {
            this.showLoading('E-Mail wird bestätigt...');

            // Real AWS Cognito confirmation
            const result = await this.confirmRegistrationWithCognito(email, code);

            if (result.success) {
                this.showNotification('✅ E-Mail erfolgreich bestätigt! Sie können sich jetzt anmelden.', 'success');

                // Clear pending verification
                localStorage.removeItem('pendingVerification');
                localStorage.removeItem('lastResendVerificationCode');
                
                // Close modal and show login form after short delay
                setTimeout(() => {
                    this.closeAuthModal();
                    setTimeout(() => {
                        this.showAuthModal();
                        this.showLoginForm();
                    }, 300);
                }, 1500);
            } else {
                this.showNotification(result.error, 'error');
                
                // Clear code input on error
                const verifyCodeInput = document.getElementById('verifyCode');
                if (verifyCodeInput) {
                    verifyCodeInput.value = '';
                    verifyCodeInput.focus();
                }
            }
        } catch (error) {
            console.error('Email verification error:', error);
            this.showNotification('E-Mail-Bestätigung fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'), 'error');
        } finally {
            this.hideLoading();
        }
    }

    async confirmRegistrationWithCognito(email, confirmationCode) {
        try {
            console.log('🚀 Starting AWS Cognito confirmation...');
            
            const params = {
                ClientId: this.clientId,
                Username: email,
                ConfirmationCode: confirmationCode.trim()
            };
            
            await this.cognitoIdentityServiceProvider.confirmSignUp(params).promise();
            
            console.log('✅ Confirmation successful');
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Confirmation error:', error);
            
            let errorMessage = 'Bestätigung fehlgeschlagen. ';

            if (error.code === 'CodeMismatchException') {
                errorMessage += 'Ungültiger Bestätigungscode.';
            } else if (error.code === 'ExpiredCodeException') {
                errorMessage += 'Bestätigungscode ist abgelaufen. Bitte neuen Code anfordern.';
            } else if (error.code === 'NotAuthorizedException') {
                errorMessage += 'Benutzer ist bereits bestätigt oder existiert nicht.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            return { success: false, error: errorMessage };
        }
    }

    // All simulate methods have been replaced with real AWS Cognito implementations
    
    async resendVerificationCode(email = null) {
        const userEmail = email || localStorage.getItem('pendingVerification');

        if (!userEmail) {
            this.showNotification('Keine E-Mail-Adresse gefunden. Bitte registrieren Sie sich erneut.', 'error');
            return;
        }

        if (!this.isInitialized) {
            this.showNotification('System wird noch initialisiert. Bitte warten...', 'error');
            return;
        }

        // Rate limiting: Prüfe ob zu schnell erneut gesendet wurde
        const lastResendKey = 'lastResendVerificationCode';
        const lastResend = localStorage.getItem(lastResendKey);
        const cooldownSeconds = 60; // 60 Sekunden Cooldown
        
        if (lastResend) {
            const timeSinceLastResend = (Date.now() - parseInt(lastResend)) / 1000;
            if (timeSinceLastResend < cooldownSeconds) {
                const remaining = Math.ceil(cooldownSeconds - timeSinceLastResend);
                this.showNotification(`Bitte warten Sie noch ${remaining} Sekunden, bevor Sie den Code erneut anfordern.`, 'error');
                
                // Zeige Cooldown-Timer
                this.startResendCooldown(remaining);
                return;
            }
        }

        try {
            this.showLoading('Code wird erneut gesendet...');
            
            // Real AWS Cognito resend
            const params = {
                ClientId: this.clientId,
                Username: userEmail
            };
            
            const result = await this.cognitoIdentityServiceProvider.resendConfirmationCode(params).promise();
            
            console.log('✅ Confirmation code resent successfully');
            
            // Speichere Zeitpunkt des erneuten Sendens
            localStorage.setItem(lastResendKey, Date.now().toString());
            
            // Starte Cooldown-Timer
            this.startResendCooldown(cooldownSeconds);
            
            this.showNotification(
                '✅ Neue Bestätigungs-E-Mail wurde gesendet! Bitte prüfen Sie Ihr E-Mail-Postfach.',
                'success'
            );
            
        } catch (error) {
            console.error('❌ Resend verification code error:', error);
            
            let errorMessage = 'Fehler beim erneuten Senden des Codes. ';
        
            if (error.code === 'UserNotFoundException') {
                errorMessage += 'Benutzer nicht gefunden.';
            } else if (error.code === 'LimitExceededException') {
                errorMessage += 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
                // Setze Cooldown auch bei LimitExceeded
                localStorage.setItem(lastResendKey, Date.now().toString());
                this.startResendCooldown(cooldownSeconds);
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            this.showNotification(errorMessage, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    startResendCooldown(seconds) {
        const resendLink = document.getElementById('resendCodeLink');
        const cooldownElement = document.getElementById('resendCooldown');
        const cooldownSeconds = document.getElementById('cooldownSeconds');
        
        if (!resendLink || !cooldownElement || !cooldownSeconds) return;
        
        let remaining = seconds;
        resendLink.style.pointerEvents = 'none';
        resendLink.style.opacity = '0.5';
        cooldownElement.style.display = 'block';
        
        const interval = setInterval(() => {
            remaining--;
            cooldownSeconds.textContent = remaining;
            
            if (remaining <= 0) {
                clearInterval(interval);
                resendLink.style.pointerEvents = 'auto';
                resendLink.style.opacity = '1';
                cooldownElement.style.display = 'none';
            }
        }, 1000);
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

    saveSession(session, rememberMe = false) {
        // Standard: 60 Minuten (3600 Sekunden)
        // Mit "Angemeldet bleiben": 30 Tage
        const expiresIn = rememberMe ? (30 * 24 * 60 * 60) : (60 * 60); // 30 Tage oder 60 Minuten
        
        // Verwende das mitgegebene expiresAt oder berechne es neu
        let expiresAt;
        if (session.expiresAt) {
            // Bei refresh: verwende das existierende expiresAt
            expiresAt = session.expiresAt;
        } else {
            // Bei neuem Login: berechne expiresAt basierend auf rememberMe
            expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        }
        
        // Email aus dem idToken extrahieren für Kompatibilität mit unified-aws-auth.js
        let email = session.email;
        if (!email && session.idToken) {
            try {
                const parts = session.idToken.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    email = payload.email;
                }
            } catch (e) {
                console.warn('⚠️ Konnte Email nicht aus Token extrahieren:', e);
            }
        }
        
        // Save AWS Cognito session with expiration and email
        const sessionData = {
            ...session,
            email: email, // Für Kompatibilität mit unified-aws-auth.js
            expiresAt: expiresAt,
            rememberMe: rememberMe
        };
        localStorage.setItem('aws_auth_session', JSON.stringify(sessionData));
        
        // Also save user info for quick access
        if (this.currentUser) {
            localStorage.setItem('realUser', JSON.stringify(this.currentUser));
        }
        
        console.log('💾 Session gespeichert:', rememberMe ? '30 Tage (Angemeldet bleiben)' : '60 Minuten');
        console.log('⏰ Session läuft ab um:', new Date(expiresAt).toLocaleString());
        if (email) {
            console.log('📧 Email in Session:', email);
        }
    }

    clearSession() {
        localStorage.removeItem('aws_auth_session');
        localStorage.removeItem('realUser');
        localStorage.removeItem('pendingVerification');
        this.currentUser = null;
        this.isAuthenticated = false;
        this.userData = null;
        this.notifyAuthStateChange(false);
    }

    async logout() {
        try {
            // If we have a session, try to revoke tokens
            const storedSession = localStorage.getItem('aws_auth_session');
            if (storedSession && this.isInitialized) {
                try {
                    const session = JSON.parse(storedSession);
                    if (session.refreshToken) {
                        // Revoke refresh token
                        await this.cognitoIdentityServiceProvider.revokeToken({
                            Token: session.refreshToken,
                            ClientId: this.clientId
                        }).promise();
                    }
                } catch (error) {
                    console.warn('⚠️ Token revocation failed (non-critical):', error);
                }
            }
        } catch (error) {
            console.warn('⚠️ Logout error (non-critical):', error);
        }
        
        this.clearSession();
        this.updateAuthUI();
        this.showNotification('Erfolgreich abgemeldet', 'info');

        // Dispatch logout event
        document.dispatchEvent(new CustomEvent('userLogout'));
    }

    // UI Methods
    showAuthModal() {
        console.log('📱 showAuthModal called');
        const modal = document.getElementById('realAuthModal');
        if (!modal) {
            console.error('❌ Modal not found! Creating it...');
            this.createAuthUI();
            // Try again after creation
            setTimeout(() => {
                const newModal = document.getElementById('realAuthModal');
                if (newModal) {
                    newModal.style.display = 'flex';
                    this.showLoginForm();
                } else {
                    console.error('❌ Still cannot find modal after creation!');
                }
            }, 100);
            return;
        }
        console.log('✅ Showing modal');
        modal.style.display = 'flex';
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
        const email = document.getElementById('registerEmail')?.value || localStorage.getItem('pendingVerification');
        if (email) {
            localStorage.setItem('pendingVerification', email);
        }
        
        // Focus on code input and clear it
        const verifyCodeInput = document.getElementById('verifyCode');
        if (verifyCodeInput) {
            verifyCodeInput.value = '';
            setTimeout(() => {
                verifyCodeInput.focus();
                verifyCodeInput.select();
            }, 100);
        }
        
        // Reset cooldown display
        const cooldownElement = document.getElementById('resendCooldown');
        if (cooldownElement) {
            cooldownElement.style.display = 'none';
        }
        
        // Prüfe ob Cooldown aktiv ist
        const lastResendKey = 'lastResendVerificationCode';
        const lastResend = localStorage.getItem(lastResendKey);
        if (lastResend) {
            const timeSinceLastResend = (Date.now() - parseInt(lastResend)) / 1000;
            const cooldownSeconds = 60;
            if (timeSinceLastResend < cooldownSeconds) {
                const remaining = Math.ceil(cooldownSeconds - timeSinceLastResend);
                this.startResendCooldown(remaining);
            }
        }
    }

    /**
     * Zeige 2FA-Challenge-Modal
     */
    showMFAChallenge(session, challengeName) {
        // Erstelle 2FA-Modal falls nicht vorhanden
        if (!document.getElementById('mfaChallengeModal')) {
            this.createMFAChallengeModal();
        }

        // Speichere Session für 2FA-Verifizierung
        this.pendingMFASession = session;
        this.pendingMFAChallengeName = challengeName;

        // Zeige Modal
        const modal = document.getElementById('mfaChallengeModal');
        modal.style.display = 'flex';
        
        // Focus auf Code-Eingabe
        const mfaCodeInput = document.getElementById('mfaCodeInput');
        if (mfaCodeInput) {
            setTimeout(() => {
                mfaCodeInput.focus();
                mfaCodeInput.select();
            }, 100);
        }
    }

    /**
     * Erstelle 2FA-Challenge-Modal
     */
    createMFAChallengeModal() {
        const modalHTML = `
            <div id="mfaChallengeModal" class="auth-modal" style="display: none;">
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2><i class="fas fa-shield-alt"></i> 2FA-Bestätigung</h2>
                        <button class="auth-close" onclick="realUserAuth.closeMFAChallenge()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="auth-modal-body">
                        <p style="margin-bottom: 1.5rem;">
                            Bitte geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein:
                        </p>
                        <form id="mfaChallengeForm" class="auth-form">
                            <div class="form-group">
                                <label for="mfaCodeInput">2FA-Code</label>
                                <input 
                                    type="text" 
                                    id="mfaCodeInput" 
                                    required 
                                    placeholder="000000" 
                                    maxlength="6"
                                    pattern="[0-9]{6}"
                                    inputmode="numeric"
                                    autocomplete="one-time-code"
                                    style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; font-weight: 600; font-family: 'Courier New', monospace;"
                                >
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                <i class="fas fa-check"></i> Bestätigen
                            </button>
                            <div class="auth-links">
                                <a href="#" onclick="realUserAuth.closeMFAChallenge(); realUserAuth.showLoginForm(); return false;">
                                    <i class="fas fa-arrow-left"></i> Zurück zur Anmeldung
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup form handler
        document.getElementById('mfaChallengeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleMFAChallenge();
        });

        // Auto-submit when 6 digits entered
        const mfaCodeInput = document.getElementById('mfaCodeInput');
        if (mfaCodeInput) {
            mfaCodeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value.length === 6) {
                    setTimeout(() => {
                        document.getElementById('mfaChallengeForm').dispatchEvent(new Event('submit'));
                    }, 300);
                }
            });
        }
    }

    /**
     * Behandle 2FA-Challenge
     */
    async handleMFAChallenge() {
        const code = document.getElementById('mfaCodeInput').value;
        
        if (!code || code.length !== 6) {
            this.showNotification('Bitte geben Sie einen 6-stelligen Code ein.', 'error');
            return;
        }

        if (!this.pendingMFASession) {
            this.showNotification('Fehler: Keine gültige Session gefunden.', 'error');
            return;
        }

        const email = document.getElementById('loginEmail').value.trim();

        try {
            this.showLoading('2FA-Code wird verifiziert...');

            const params = {
                Session: this.pendingMFASession,
                ClientId: this.clientId,
                ChallengeName: this.pendingMFAChallengeName,
                ChallengeResponses: {
                    SOFTWARE_TOKEN_MFA_CODE: code.trim(),
                    USERNAME: email
                }
            };

            const result = await this.cognitoIdentityServiceProvider
                .respondToAuthChallenge(params)
                .promise();

            if (result.AuthenticationResult) {
                // 2FA erfolgreich verifiziert
                const session = {
                    idToken: result.AuthenticationResult.IdToken,
                    accessToken: result.AuthenticationResult.AccessToken,
                    refreshToken: result.AuthenticationResult.RefreshToken,
                    expiresAt: new Date(Date.now() + result.AuthenticationResult.ExpiresIn * 1000).toISOString()
                };

                const rememberMe = document.getElementById('rememberMe')?.checked || false;
                this.saveSession(session, rememberMe);

                const userInfo = await this.getUserInfo(session.idToken);
                this.currentUser = userInfo;
                this.isAuthenticated = true;
                this.userData = userInfo;

                // Load user data
                await this.loadUserData();

                // Update UI
                this.updateAuthUI();
                this.closeMFAChallenge();
                this.closeAuthModal();

                this.showNotification('✅ Erfolgreich angemeldet!', 'success');

                // Dispatch login event
                document.dispatchEvent(new CustomEvent('userLogin', { detail: userInfo }));
            } else {
                throw new Error('Ungültige Antwort von Cognito');
            }
        } catch (error) {
            console.error('2FA verification error:', error);
            
            let errorMessage = 'Ungültiger 2FA-Code. ';
            if (error.code === 'CodeMismatchException') {
                errorMessage += 'Bitte prüfen Sie die Zeit in Ihrer Authenticator-App.';
            } else {
                errorMessage += error.message || 'Unbekannter Fehler.';
            }
            
            this.showNotification(errorMessage, 'error');
            
            // Clear code input
            const mfaCodeInput = document.getElementById('mfaCodeInput');
            if (mfaCodeInput) {
                mfaCodeInput.value = '';
                mfaCodeInput.focus();
            }
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Schließe 2FA-Challenge-Modal
     */
    closeMFAChallenge() {
        const modal = document.getElementById('mfaChallengeModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.pendingMFASession = null;
        this.pendingMFAChallengeName = null;
    }

    updateAuthUI() {
        const authButton = document.getElementById('realAuthButton');
        const userDropdown = this.getUserDropdownElement();
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatarImg = document.getElementById('userAvatarImg');
        const buttonSpan = this.ensureAuthButtonLabel(authButton);

        if (this.isAuthenticated && this.currentUser) {
            if (authButton && buttonSpan) {
                buttonSpan.textContent = this.currentUser.firstName || this.currentUser.email || 'Benutzer';
                authButton.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            }
            
            if (userName) {
                userName.textContent = `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || this.currentUser.email || 'Benutzer';
            }
            if (userEmail) {
                userEmail.textContent = this.currentUser.email || '';
            }
        } else {
            if (authButton && buttonSpan) {
                buttonSpan.textContent = 'Anmelden';
                authButton.style.background = '';
            }
            if (userDropdown) {
                userDropdown.style.display = 'none';
            }
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

    onAuthStateChange(callback) {
        if (typeof callback !== 'function') {
            return;
        }
        this.authStateListeners.push(callback);
        if (this.lastAuthState !== null) {
            try {
                callback(this.lastAuthState, this.currentUser);
            } catch (error) {
                console.error('Auth state listener error:', error);
            }
        }
    }

    notifyAuthStateChange(isAuthenticated) {
        if (this.lastAuthState === isAuthenticated) {
            return;
        }
        this.lastAuthState = isAuthenticated;
        this.authStateListeners.forEach((listener) => {
            try {
                listener(isAuthenticated, this.currentUser);
            } catch (error) {
                console.error('Auth state listener callback failed:', error);
            }
        });

        // Broadcast global event for legacy listeners
        document.dispatchEvent(new CustomEvent('authStateChange', {
            detail: {
                isAuthenticated,
                user: this.currentUser
            }
        }));
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
        this.notifyAuthStateChange(true);
    }

    handleUserLogout() {
        console.log('User logged out');
        this.updateAuthUI();
        this.notifyAuthStateChange(false);
    }

    handleUserDataUpdate(data) {
        console.log('User data updated:', data);
    }
}

// Initialize global instance when DOM is ready
(function() {
    function initAuthSystem() {
        console.log('🚀 Creating RealUserAuthSystem instance...');
        if (!window.realUserAuth) {
            window.realUserAuth = new RealUserAuthSystem();
            console.log('✅ RealUserAuthSystem instance created:', window.realUserAuth);
        } else {
            console.log('ℹ️ RealUserAuthSystem already exists, re-attaching listeners...');
            if (typeof window.realUserAuth.setupButtonListeners === 'function') {
                window.realUserAuth.setupButtonListeners();
            }
        }
    }
    
    // Initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthSystem);
    } else {
        initAuthSystem();
    }
    
    // Also try after a short delay as fallback
    setTimeout(() => {
        if (!window.realUserAuth) {
            console.warn('⚠️ RealUserAuthSystem not initialized, trying again...');
            initAuthSystem();
        } else {
            // Re-attach listeners in case button was added later
            if (typeof window.realUserAuth.setupButtonListeners === 'function') {
                window.realUserAuth.setupButtonListeners();
            }
        }
    }, 1000);
})();

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

.form-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.form-hint i {
    color: #0ea5e9;
}

.form-hint span {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #0369a1;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', authCSS);
