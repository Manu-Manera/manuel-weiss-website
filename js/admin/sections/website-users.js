// Website Users Management Section
class WebsiteUsersManagement {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.isInitialized = false;
        this.adminUsers = []; // Liste der Admin-User, um sie auszuschließen
        
        // AWS Cognito Configuration
        this.userPoolId = window.AWS_CONFIG?.userPoolId || 'eu-central-1_8gP4gLK9r';
        this.region = window.AWS_CONFIG?.region || 'eu-central-1';
        this.groupName = 'admin';
        this.cognitoIdentityServiceProvider = null;
        this.userToDelete = null;
        this.isInitializing = false;
    }
    
    async init() {
        // Prevent multiple initializations
        if (this.isInitialized) {
            console.log('⚠️ Website Users Management already initialized, skipping...');
            return;
        }
        
        // Mark as initializing to prevent concurrent calls
        if (this.isInitializing) {
            console.log('⚠️ Website Users Management is already initializing, waiting...');
            // Wait for current initialization to complete
            while (this.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }
        
        this.isInitializing = true;
        console.log('👤 Initializing Website Users Management...');
        
        // Show loading state immediately
        const listEl = document.getElementById('website-users-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="loading-placeholder" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
                    <p>Initialisiere Website-Benutzer-Verwaltung...</p>
                </div>
            `;
        }
        
        // Initialize AWS SDK and setup event listeners immediately (non-blocking)
        try {
            if (typeof AWS === 'undefined') {
                throw new Error('AWS SDK not loaded');
            }
            
            AWS.config.region = this.region;
            this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            
            // Setup event listeners first (non-blocking)
            this.setupEventListeners();
            
        } catch (error) {
            console.error('❌ Error setting up Website Users Management:', error);
            this.isInitializing = false;
            if (listEl) {
                listEl.innerHTML = `
                    <div class="error-message" style="padding: 2rem; text-align: center; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p><strong>Fehler beim Setup</strong></p>
                        <p style="font-size: 0.9rem; color: #64748b; margin-top: 0.5rem;">${error.message}</p>
                    </div>
                `;
            }
            return;
        }
        
        // Mark as initialized immediately (non-blocking)
        this.isInitialized = true;
        this.isInitializing = false;
        console.log('✅ Website Users Management initialized');
        
        // Load data in background (don't block)
        this.loadDataAsync();
    }
    
    async loadDataAsync() {
        // Load admin users first to exclude them (with timeout)
        try {
            await Promise.race([
                this.loadAdminUsersList(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ]);
        } catch (adminError) {
            console.warn('⚠️ Could not load admin users list:', adminError);
            this.adminUsers = [];
        }
        
        // Load website users (with timeout)
        await Promise.race([
            this.loadWebsiteUsers(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout beim Laden der User')), 15000))
        ]);
    }
    
    handleInitializationError(error) {
        const listEl = document.getElementById('website-users-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="error-message" style="padding: 2rem; text-align: center; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p><strong>Fehler beim Initialisieren</strong></p>
                    <p style="font-size: 0.9rem; color: #64748b; margin-top: 0.5rem;">${error.message}</p>
                    <details style="margin-top: 1rem; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto;">
                        <summary style="cursor: pointer; color: #667eea;">Technische Details</summary>
                        <pre style="background: #f1f5f9; padding: 1rem; border-radius: 6px; margin-top: 0.5rem; font-size: 0.75rem; overflow-x: auto;">${error.stack || error.toString()}</pre>
                    </details>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-outline" onclick="window.AdminApp?.sections?.websiteUsers?.init()">
                            <i class="fas fa-sync"></i> Erneut versuchen
                        </button>
                        <button class="btn btn-outline" onclick="window.location.reload()">
                            <i class="fas fa-redo"></i> Seite neu laden
                        </button>
                    </div>
                </div>
            `;
        }
        this.showError('Fehler beim Initialisieren der Website-Benutzer-Verwaltung');
    }
    
    async loadAdminUsersList() {
        try {
            const params = {
                UserPoolId: this.userPoolId,
                GroupName: this.groupName,
                Limit: 60
            };
            
            const result = await this.cognitoIdentityServiceProvider.listUsersInGroup(params).promise();
            this.adminUsers = (result.Users || []).map(user => user.Username);
            console.log('📋 Admin-User geladen:', this.adminUsers.length);
        } catch (error) {
            console.error('❌ Error loading admin users:', error);
            this.adminUsers = [];
            throw error;
        }
    }
    
    setupEventListeners() {
        // Create new user button
        const btnCreate = document.getElementById('btn-create-website-user');
        if (btnCreate) {
            btnCreate.addEventListener('click', () => this.showCreateUserModal());
        }
        
        // Refresh users button
        const btnRefresh = document.getElementById('btn-refresh-website-users');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => this.loadWebsiteUsers());
        }
        
        // Search input
        const searchInput = document.getElementById('search-website-users');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterUsers(e.target.value));
        }
        
        // Create user form
        const formCreate = document.getElementById('form-create-website-user');
        if (formCreate) {
            formCreate.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateUser(e.target);
            });
        }
        
        // Edit user form
        const formEdit = document.getElementById('form-edit-website-user');
        if (formEdit) {
            formEdit.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditUser(e.target);
            });
        }
        
        // Reset password form
        const formResetPassword = document.getElementById('form-reset-password-website-user');
        if (formResetPassword) {
            formResetPassword.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleResetPassword(e.target);
            });
        }
        
        // Confirm delete button
        const btnConfirmDelete = document.getElementById('btn-confirm-delete-website-user');
        if (btnConfirmDelete) {
            btnConfirmDelete.addEventListener('click', () => this.handleDeleteUser());
        }
    }
    
    async loadWebsiteUsers() {
        const listEl = document.getElementById('website-users-list');
        if (!listEl) return;
        
        try {
            listEl.innerHTML = `
                <div class="loading-placeholder" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
                    <p>Lade Website-Benutzer...</p>
                </div>
            `;
            
            // Direct Cognito access only (no API calls)
            let allUsers = [];
            
            console.log('📡 Lade Website-Benutzer direkt über Cognito...');
            const params = {
                UserPoolId: this.userPoolId,
                Limit: 60
            };
            
            let paginationToken = null;
            const maxIterations = 10; // Prevent infinite loop
            let iterations = 0;
            
            do {
                if (paginationToken) {
                    params.PaginationToken = paginationToken;
                }
                
                const result = await Promise.race([
                    this.cognitoIdentityServiceProvider.listUsers(params).promise(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Cognito Timeout (10s)')), 10000))
                ]);
                
                allUsers = allUsers.concat(result.Users || []);
                paginationToken = result.PaginationToken;
                iterations++;
            } while (paginationToken && iterations < maxIterations);
            
            console.log('✅ Website-Benutzer über Cognito geladen:', allUsers.length);
            
            // Filter out admin users
            this.users = allUsers.filter(user => !this.adminUsers.includes(user.Username));
            this.filteredUsers = [...this.users];
            
            console.log(`📊 Website-Benutzer geladen: ${this.users.length} (${allUsers.length} insgesamt, ${this.adminUsers.length} Admin)`);
            
            this.renderUsersList();
            
        } catch (error) {
            console.error('❌ Error loading website users:', error);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Error details:', {
                message: error.message,
                name: error.name,
                code: error.code
            });
            
            // Zeige detaillierte Fehlermeldung
            const errorDetails = `
                <div class="error-message" style="padding: 2rem; text-align: center; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p><strong>Fehler beim Laden der Website-Benutzer</strong></p>
                    <p style="font-size: 0.9rem; color: #64748b; margin-top: 0.5rem;">${error.message}</p>
                    <details style="margin-top: 1rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                        <summary style="cursor: pointer; color: #667eea; font-weight: bold;">🔍 Debug-Informationen</summary>
                        <div style="background: #f1f5f9; padding: 1rem; border-radius: 6px; margin-top: 0.5rem; font-size: 0.75rem;">
                            <p><strong>API Base URL:</strong> ${window.AWS_CONFIG?.apiBaseUrl || window.AWS_CONFIG?.apiGateway?.baseUrl || 'NICHT KONFIGURIERT'}</p>
                            <p><strong>Admin Auth:</strong> ${window.adminAuth ? 'Verfügbar' : 'NICHT VERFÜGBAR'}</p>
                            <p><strong>Session:</strong> ${window.adminAuth?.getSession() ? 'Vorhanden' : 'NICHT VORHANDEN'}</p>
                            <p><strong>idToken:</strong> ${window.adminAuth?.getSession()?.idToken ? 'Vorhanden' : 'NICHT VORHANDEN'}</p>
                            <pre style="background: #fff; padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem; overflow-x: auto; white-space: pre-wrap;">${error.stack || error.toString()}</pre>
                        </div>
                    </details>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn btn-outline" onclick="window.AdminApp?.sections?.websiteUsers?.loadWebsiteUsers()">
                            <i class="fas fa-sync"></i> Erneut versuchen
                        </button>
                        <button class="btn btn-outline" onclick="console.log('API Base URL:', window.AWS_CONFIG?.apiBaseUrl); console.log('Admin Auth:', window.adminAuth); console.log('Session:', window.adminAuth?.getSession());">
                            <i class="fas fa-bug"></i> Debug Info
                        </button>
                    </div>
                </div>
            `;
            
            listEl.innerHTML = errorDetails;
        }
    }
    
    renderUsersList() {
        const listEl = document.getElementById('website-users-list');
        if (!listEl) return;
        
        if (this.filteredUsers.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-users" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <p style="color: #64748b; font-size: 1.1rem;">Keine Website-Benutzer gefunden</p>
                    <button class="btn btn-primary" onclick="window.AdminApp?.sections?.websiteUsers?.showCreateUserModal()" style="margin-top: 1rem;">
                        <i class="fas fa-user-plus"></i> Ersten Website-Benutzer erstellen
                    </button>
                </div>
            `;
            return;
        }
        
        listEl.innerHTML = `
            <div class="users-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>E-Mail</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Erstellt</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredUsers.map(user => this.renderUserRow(user)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Add event listeners for action buttons
        listEl.querySelectorAll('[data-action="edit-user"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const username = row.dataset.username;
                const user = this.users.find(u => u.Username === username);
                if (user) {
                    this.showEditUserModal(user);
                }
            });
        });
        
        listEl.querySelectorAll('[data-action="reset-password"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const email = row.dataset.email;
                const username = row.dataset.username;
                this.showResetPasswordModal(email, username);
            });
        });
        
        listEl.querySelectorAll('[data-action="delete-user"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const email = e.target.closest('tr').dataset.email;
                this.showDeleteConfirmModal(email);
            });
        });
    }
    
    renderUserRow(user) {
        const email = this.getUserAttribute(user, 'email') || user.Username;
        const name = this.getUserAttribute(user, 'name') || '-';
        const status = this.getStatusLabel(user.UserStatus);
        const created = user.UserCreateDate ? new Date(user.UserCreateDate).toLocaleDateString('de-DE') : '-';
        
        return `
            <tr data-email="${email}" data-username="${user.Username}">
                <td>${email}</td>
                <td>${name}</td>
                <td><span class="status-badge status-${user.UserStatus}">${status}</span></td>
                <td>${created}</td>
                <td>
                    <div class="action-buttons">
                        <button 
                            class="btn-icon" 
                            data-action="edit-user"
                            title="User bearbeiten"
                            style="color: #667eea;"
                        >
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="btn-icon" 
                            data-action="reset-password"
                            title="Passwort zurücksetzen"
                            style="color: #f59e0b;"
                        >
                            <i class="fas fa-key"></i>
                        </button>
                        <button 
                            class="btn-icon btn-danger" 
                            data-action="delete-user"
                            title="User löschen"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    getUserAttribute(user, attributeName) {
        const attr = user.Attributes?.find(a => a.Name === attributeName);
        return attr ? attr.Value : null;
    }
    
    getStatusLabel(status) {
        const labels = {
            'CONFIRMED': 'Bestätigt',
            'UNCONFIRMED': 'Nicht bestätigt',
            'FORCE_CHANGE_PASSWORD': 'Passwort ändern',
            'RESET_REQUIRED': 'Reset erforderlich'
        };
        return labels[status] || status;
    }
    
    filterUsers(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user => {
                const email = this.getUserAttribute(user, 'email') || user.Username || '';
                const name = this.getUserAttribute(user, 'name') || '';
                return email.toLowerCase().includes(term) || name.toLowerCase().includes(term);
            });
        }
        this.renderUsersList();
    }
    
    showCreateUserModal() {
        const modal = document.getElementById('modal-create-website-user');
        if (modal) {
            modal.classList.add('show');
            document.getElementById('website-user-email')?.focus();
            
            // Setup close handlers when modal is shown
            this.setupModalCloseHandlers(modal);
        }
    }
    
    setupModalCloseHandlers(modal) {
        // Close button (X)
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal(modal.id);
            });
        }
        
        // Cancel/Abbrechen button
        const cancelBtn = modal.querySelector('[data-dismiss="modal"]');
        if (cancelBtn && cancelBtn !== closeBtn) {
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            newCancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal(modal.id);
            });
        }
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal.id);
            }
        }, { once: false });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal(modal.id);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log('🔒 Schließe Modal:', modalId);
            modal.classList.remove('show');
            
            // Reset forms
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
                form.querySelectorAll('.error-message').forEach(el => {
                    el.classList.remove('show');
                    el.textContent = '';
                });
            }
            
            // Re-enable submit button if it was disabled
            const submitBtn = modal.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
            }
        }
    }
    
    async handleCreateUser(form) {
        const formData = new FormData(form);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const name = formData.get('name').trim();
        const sendEmail = formData.get('sendEmail') === 'on';
        
        // Validation
        if (!email || !password) {
            this.showError('Bitte fülle alle Pflichtfelder aus.');
            return;
        }
        
        if (password.length < 8) {
            this.showError('Das Passwort muss mindestens 8 Zeichen lang sein.');
            return;
        }
        
        const submitBtn = document.getElementById('btn-submit-create-website-user');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Erstelle User...';
            
            console.log('👤 Erstelle neuen Website-Benutzer:', email);
            
            // Direct Cognito access only (no API calls)
            console.log('📡 Erstelle User direkt über Cognito...');
            
            // Check if user already exists
            let userExists = false;
            try {
                await this.cognitoIdentityServiceProvider.adminGetUser({
                    UserPoolId: this.userPoolId,
                    Username: email
                }).promise();
                userExists = true;
            } catch (checkError) {
                if (checkError.code !== 'UserNotFoundException') {
                    throw checkError;
                }
            }
            
            if (userExists) {
                this.showError('Ein User mit dieser E-Mail-Adresse existiert bereits.');
                return;
            }
            
            // Create new user
            const createParams = {
                UserPoolId: this.userPoolId,
                Username: email,
                UserAttributes: [
                    { Name: 'email', Value: email },
                    { Name: 'email_verified', Value: 'true' }
                ],
                MessageAction: sendEmail ? 'SEND' : 'SUPPRESS'
            };
            
            if (name) {
                createParams.UserAttributes.push({ Name: 'name', Value: name });
            }
            
            await this.cognitoIdentityServiceProvider.adminCreateUser(createParams).promise();
            console.log('✅ User erstellt');
            
            // Set password
            await this.cognitoIdentityServiceProvider.adminSetUserPassword({
                UserPoolId: this.userPoolId,
                Username: email,
                Password: password,
                Permanent: true
            }).promise();
            console.log('✅ Passwort gesetzt');
            
            this.showSuccess(`✅ Neuer Website-Benutzer ${email} wurde erfolgreich erstellt!`);
            
            this.closeModal('modal-create-website-user');
            await this.loadWebsiteUsers();
            
        } catch (error) {
            console.error('❌ Error creating user:', error);
            let errorMsg = error.message;
            
            if (error.code === 'InvalidParameterException') {
                if (error.message.includes('password')) {
                    errorMsg = 'Das Passwort entspricht nicht den Anforderungen (min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen).';
                } else if (error.message.includes('email')) {
                    errorMsg = 'Ungültige E-Mail-Adresse.';
                }
            } else if (error.code === 'UsernameExistsException') {
                errorMsg = 'Ein User mit dieser E-Mail-Adresse existiert bereits.';
            } else if (error.code === 'InvalidPasswordException') {
                errorMsg = 'Das Passwort entspricht nicht den Sicherheitsanforderungen.';
            }
            
            this.showError(`Fehler beim Erstellen des Users: ${errorMsg}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    showEditUserModal(user) {
        const modal = document.getElementById('modal-edit-website-user');
        if (!modal) return;
        
        const email = this.getUserAttribute(user, 'email') || user.Username;
        const name = this.getUserAttribute(user, 'name') || '';
        const emailVerified = this.getUserAttribute(user, 'email_verified') === 'true';
        
        // Form fields füllen
        document.getElementById('edit-user-username').value = user.Username;
        document.getElementById('edit-user-email').value = email;
        document.getElementById('edit-user-name').value = name;
        document.getElementById('edit-user-status').value = user.UserStatus;
        document.getElementById('edit-user-email-verified').checked = emailVerified;
        
        modal.classList.add('show');
        document.getElementById('edit-user-email')?.focus();
        
        // Setup close handlers
        this.setupModalCloseHandlers(modal);
    }
    
    showResetPasswordModal(email, username) {
        const modal = document.getElementById('modal-reset-password-website-user');
        if (!modal) return;
        
        document.getElementById('reset-password-username').value = username;
        document.getElementById('reset-password-email').textContent = email;
        document.getElementById('reset-password-new').value = '';
        document.getElementById('reset-password-temporary').checked = false;
        
        modal.classList.add('show');
        document.getElementById('reset-password-new')?.focus();
        
        // Setup close handlers
        this.setupModalCloseHandlers(modal);
    }
    
    showDeleteConfirmModal(email) {
        this.userToDelete = email;
        const modal = document.getElementById('modal-delete-website-user');
        const emailEl = document.getElementById('delete-user-email');
        
        if (modal && emailEl) {
            emailEl.textContent = email;
            modal.classList.add('show');
            
            // Setup close handlers
            this.setupModalCloseHandlers(modal);
        }
    }
    
    async handleEditUser(form) {
        const formData = new FormData(form);
        const username = formData.get('username');
        const newEmail = formData.get('email').trim();
        const name = formData.get('name').trim();
        const status = formData.get('status');
        const emailVerified = formData.get('emailVerified') === 'on';
        
        if (!newEmail) {
            this.showError('E-Mail-Adresse ist erforderlich.');
            return;
        }
        
        const submitBtn = document.getElementById('btn-submit-edit-website-user');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichere Änderungen...';
            
            console.log('✏️ Bearbeite Website-Benutzer:', username);
            
            // Direct Cognito access only (no API calls)
            console.log('📡 Aktualisiere User direkt über Cognito...');
            
            // User-Attribute aktualisieren
            const attributes = [];
            
            // E-Mail-Adresse aktualisieren (wenn geändert)
            const currentUser = this.users.find(u => u.Username === username);
            const currentEmail = this.getUserAttribute(currentUser, 'email') || currentUser.Username;
            
            if (newEmail !== currentEmail) {
                attributes.push({ Name: 'email', Value: newEmail });
                console.log('⚠️ E-Mail-Änderung erfordert Username-Update');
            }
            
            // Name aktualisieren
            const currentName = this.getUserAttribute(currentUser, 'name') || '';
            if (name !== currentName) {
                if (name) {
                    attributes.push({ Name: 'name', Value: name });
                } else {
                    attributes.push({ Name: 'name', Value: '' });
                }
            }
            
            // E-Mail-Verifizierung aktualisieren
            const currentEmailVerified = this.getUserAttribute(currentUser, 'email_verified') === 'true';
            if (emailVerified !== currentEmailVerified) {
                attributes.push({ Name: 'email_verified', Value: emailVerified ? 'true' : 'false' });
            }
            
            // Attribute aktualisieren
            if (attributes.length > 0) {
                await this.cognitoIdentityServiceProvider.adminUpdateUserAttributes({
                    UserPoolId: this.userPoolId,
                    Username: username,
                    UserAttributes: attributes
                }).promise();
                console.log('✅ User-Attribute aktualisiert');
            }
            
            // Status aktualisieren (wenn geändert)
            if (status !== currentUser.UserStatus) {
                if (status === 'CONFIRMED' && currentUser.UserStatus !== 'CONFIRMED') {
                    await this.cognitoIdentityServiceProvider.adminConfirmSignUp({
                        UserPoolId: this.userPoolId,
                        Username: username
                    }).promise();
                    console.log('✅ User bestätigt');
                } else if (status === 'FORCE_CHANGE_PASSWORD') {
                    console.log('ℹ️ Status FORCE_CHANGE_PASSWORD wird durch Passwort-Reset gesetzt');
                }
            }
            
            if (newEmail !== currentEmail) {
                this.showSuccess(`✅ User-Daten aktualisiert! ⚠️ Hinweis: Die E-Mail-Adresse wurde geändert. Der User muss sich mit der neuen E-Mail-Adresse anmelden.`);
            } else {
                this.showSuccess(`✅ User-Daten wurden erfolgreich aktualisiert!`);
            }
            
            this.closeModal('modal-edit-website-user');
            await this.loadWebsiteUsers();
            
        } catch (error) {
            console.error('❌ Error updating user:', error);
            let errorMsg = error.message;
            
            if (error.code === 'InvalidParameterException') {
                if (error.message.includes('email')) {
                    errorMsg = 'Ungültige E-Mail-Adresse.';
                }
            } else if (error.code === 'AliasExistsException') {
                errorMsg = 'Diese E-Mail-Adresse wird bereits von einem anderen User verwendet.';
            }
            
            this.showError(`Fehler beim Aktualisieren des Users: ${errorMsg}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    async handleResetPassword(form) {
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');
        const temporary = formData.get('temporary') === 'on';
        
        if (!password || password.length < 8) {
            this.showError('Das Passwort muss mindestens 8 Zeichen lang sein.');
            return;
        }
        
        const submitBtn = document.getElementById('btn-submit-reset-password');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Setze Passwort...';
            
            console.log('🔑 Setze Passwort für Website-Benutzer:', username);
            
            // Direct Cognito access only (no API calls)
            console.log('📡 Setze Passwort direkt über Cognito...');
            
            await this.cognitoIdentityServiceProvider.adminSetUserPassword({
                UserPoolId: this.userPoolId,
                Username: username,
                Password: password,
                Permanent: !temporary
            }).promise();
            
            console.log('✅ Passwort gesetzt');
            
            this.showSuccess(`✅ Passwort wurde erfolgreich ${temporary ? 'als temporäres Passwort' : ''} gesetzt!`);
            
            this.closeModal('modal-reset-password-website-user');
            
        } catch (error) {
            console.error('❌ Error resetting password:', error);
            let errorMsg = error.message;
            
            if (error.code === 'InvalidPasswordException') {
                errorMsg = 'Das Passwort entspricht nicht den Sicherheitsanforderungen (min. 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen).';
            }
            
            this.showError(`Fehler beim Zurücksetzen des Passworts: ${errorMsg}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    async handleDeleteUser() {
        if (!this.userToDelete) return;
        
        const confirmBtn = document.getElementById('btn-confirm-delete-website-user');
        const originalText = confirmBtn.innerHTML;
        
        try {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lösche User...';
            
            console.log('🗑️ Lösche Website-Benutzer:', this.userToDelete);
            
            // Direct Cognito access only (no API calls)
            console.log('📡 Lösche User direkt über Cognito...');
            
            await this.cognitoIdentityServiceProvider.adminDeleteUser({
                UserPoolId: this.userPoolId,
                Username: this.userToDelete
            }).promise();
            
            console.log('✅ User gelöscht');
            
            this.showSuccess(`✅ Website-Benutzer ${this.userToDelete} wurde erfolgreich gelöscht!`);
            
            this.closeModal('modal-delete-website-user');
            this.userToDelete = null;
            
            await this.loadWebsiteUsers();
            
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            this.showError(`Fehler beim Löschen des Users: ${error.message}`);
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
        }
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Register section
if (window.AdminApp && window.AdminApp.sections) {
    window.AdminApp.sections.websiteUsers = new WebsiteUsersManagement();
} else {
    // Wait for AdminApp to be ready
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.AdminApp && window.AdminApp.sections) {
                window.AdminApp.sections.websiteUsers = new WebsiteUsersManagement();
            }
        }, 1000);
    });
}

// Auto-initialize when section is loaded (only if not already initialized)
if (document.getElementById('website-users-list')) {
    // Check if already initialized to prevent duplicate initialization
    if (!window.AdminApp?.sections?.websiteUsers?.isInitialized && 
        !window.AdminApp?.sections?.websiteUsers?.isInitializing) {
        const websiteUsers = new WebsiteUsersManagement();
        // Don't await - let it run in background
        websiteUsers.init().catch(err => {
            console.error('Error auto-initializing WebsiteUsersManagement:', err);
        });
        
        // Make it globally available
        if (window.AdminApp) {
            if (!window.AdminApp.sections) {
                window.AdminApp.sections = {};
            }
            window.AdminApp.sections.websiteUsers = websiteUsers;
        }
    }
}

// Export for Admin Application
if (typeof window !== 'undefined') {
    window.WebsiteUsersManagement = WebsiteUsersManagement;
}

