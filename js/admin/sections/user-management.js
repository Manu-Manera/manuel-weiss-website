// Admin User Management Section
class AdminUserManagement {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.isInitialized = false;
        
        // AWS Cognito Configuration
        this.userPoolId = window.AWS_CONFIG?.userPoolId || 'eu-central-1_8gP4gLK9r';
        this.region = window.AWS_CONFIG?.region || 'eu-central-1';
        this.groupName = 'admin';
        this.cognitoIdentityServiceProvider = null;
        this.isInitializing = false;
    }
    
    async init() {
        // Prevent multiple initializations
        if (this.isInitialized) {
            console.log('⚠️ Admin User Management already initialized, skipping...');
            return;
        }
        
        // Mark as initializing to prevent concurrent calls
        if (this.isInitializing) {
            console.log('⚠️ Admin User Management is already initializing, waiting...');
            // Wait for current initialization to complete
            while (this.isInitializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }
        
        this.isInitializing = true;
        console.log('👥 Initializing Admin User Management...');
        
        // Show loading state immediately
        const listEl = document.getElementById('admin-users-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="loading-placeholder" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
                    <p>Initialisiere Admin-User-Verwaltung...</p>
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
            console.error('❌ Error setting up Admin User Management:', error);
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
        console.log('✅ Admin User Management initialized');
        
        // Load data in background (don't block)
        this.loadDataAsync();
    }
    
    async loadDataAsync() {
        // Load admin users immediately - NON-BLOCKING
        // Don't await - let it run in background
        this.loadAdminUsers().catch(error => {
            console.error('❌ Error in loadAdminUsers:', error);
            this.handleInitializationError(error);
        });
    }
    
    handleInitializationError(error) {
        const listEl = document.getElementById('admin-users-list');
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
                        <button class="btn btn-outline" onclick="window.AdminApp?.sections?.userManagement?.init()">
                            <i class="fas fa-sync"></i> Erneut versuchen
                        </button>
                        <button class="btn btn-outline" onclick="window.location.reload()">
                            <i class="fas fa-redo"></i> Seite neu laden
                        </button>
                    </div>
                </div>
            `;
        }
        this.showError('Fehler beim Initialisieren der User-Verwaltung');
    }
    
    setupEventListeners() {
        // Create new user button
        const btnCreate = document.getElementById('btn-create-admin-user');
        if (btnCreate) {
            btnCreate.addEventListener('click', () => this.showCreateUserModal());
        }
        
        // Refresh users button
        const btnRefresh = document.getElementById('btn-refresh-users');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => this.loadAdminUsers());
        }
        
        // Search input
        const searchInput = document.getElementById('search-users');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterUsers(e.target.value));
        }
        
        // Create user form
        const formCreate = document.getElementById('form-create-user');
        if (formCreate) {
            formCreate.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateUser(e.target);
            });
        }
        
        // Setup modal close handlers for all modals (using event delegation)
        this.setupGlobalModalHandlers();
    }
    
    setupGlobalModalHandlers() {
        // Use event delegation for modal close buttons
        document.addEventListener('click', (e) => {
            // Close button (X) - check if clicked element or parent has modal-close class
            if (e.target.closest('.modal-close')) {
                e.preventDefault();
                e.stopPropagation();
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
                return;
            }
            
            // Cancel/Abbrechen button with data-dismiss
            if (e.target.closest('[data-dismiss="modal"]') && !e.target.closest('.modal-close')) {
                e.preventDefault();
                e.stopPropagation();
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
                return;
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal.id);
                }
            }
        });
        
        // Close modal on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.classList.contains('show')) {
                // Only close if clicking directly on the modal backdrop, not on modal-content
                if (e.target === e.currentTarget || !e.target.closest('.modal-content')) {
                    this.closeModal(e.target.id);
                }
            }
        });
    }
    
    async loadAdminUsers() {
        const listEl = document.getElementById('admin-users-list');
        if (!listEl) {
            console.error('❌ admin-users-list Element nicht gefunden');
            return;
        }
        
        // Show loading immediately
        listEl.innerHTML = `
            <div class="loading-placeholder" style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
                <p>Lade Admin-User...</p>
            </div>
        `;
        
        try {
            // Direct Cognito access only (no API calls)
            let allUsers = [];
            
            console.log('📡 Lade Admin-User direkt über Cognito...');
            const params = {
                UserPoolId: this.userPoolId,
                GroupName: this.groupName,
                Limit: 60
            };
            
            const result = await Promise.race([
                this.cognitoIdentityServiceProvider.listUsersInGroup(params).promise(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Cognito Timeout (10s)')), 10000))
            ]);
            
            allUsers = result.Users || [];
            console.log('✅ Admin-User über Cognito geladen:', allUsers.length);
        
        // Update users list
        this.users = allUsers;
        this.filteredUsers = [...this.users];
        
        console.log(`📊 Admin-User geladen: ${this.users.length}`);
        
        this.renderUsersList();
            
        } catch (error) {
            console.error('❌ Error loading admin users:', error);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Error details:', {
                message: error.message,
                name: error.name,
                code: error.code
            });
            
            const listEl = document.getElementById('admin-users-list');
            if (listEl) {
                listEl.innerHTML = `
                <div class="error-message" style="padding: 2rem; text-align: center; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p><strong>Fehler beim Laden der Admin-User</strong></p>
                    <p style="font-size: 0.9rem; color: #64748b; margin-top: 0.5rem;">${error.message}</p>
                    <details style="margin-top: 1rem; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                        <summary style="cursor: pointer; color: #667eea; font-weight: bold;">🔍 Debug-Informationen</summary>
                        <div style="background: #f1f5f9; padding: 1rem; border-radius: 6px; margin-top: 0.5rem; font-size: 0.75rem;">
                            <p><strong>API Base URL:</strong> ${window.AWS_CONFIG?.apiBaseUrl || window.AWS_CONFIG?.apiGateway?.baseUrl || 'NICHT KONFIGURIERT'}</p>
                            <p><strong>Admin Auth:</strong> ${window.adminAuth ? 'Verfügbar' : 'NICHT VERFÜGBAR'}</p>
                            <p><strong>Session:</strong> ${window.adminAuth?.getSession() ? 'Vorhanden' : 'NICHT VORHANDEN'}</p>
                            <p><strong>User Pool ID:</strong> ${this.userPoolId}</p>
                            <p><strong>Group Name:</strong> ${this.groupName}</p>
                            <pre style="background: #fff; padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem; overflow-x: auto; white-space: pre-wrap;">${error.stack || error.toString()}</pre>
                        </div>
                    </details>
                    <button class="btn btn-outline" onclick="window.AdminApp?.sections?.userManagement?.loadAdminUsers()" style="margin-top: 1rem;">
                        <i class="fas fa-sync"></i> Erneut versuchen
                    </button>
                </div>
            `;
        }
    }
    
    async getAdminGroupUsers() {
        try {
            const params = {
                UserPoolId: this.userPoolId,
                GroupName: this.groupName,
                Limit: 60
            };
            
            const result = await Promise.race([
                this.cognitoIdentityServiceProvider.listUsersInGroup(params).promise(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Cognito Timeout')), 5000))
            ]);
            
            return result.Users || [];
        } catch (error) {
            console.warn('⚠️ Could not get admin group users:', error);
            return [];
        }
    }
    
    renderUsersList() {
        const listEl = document.getElementById('admin-users-list');
        if (!listEl) return;
        
        if (this.filteredUsers.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-users" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <p style="color: #64748b; font-size: 1.1rem;">Keine Admin-User gefunden</p>
                    <button class="btn btn-primary" onclick="window.AdminApp?.sections?.userManagement?.showCreateUserModal()" style="margin-top: 1rem;">
                        <i class="fas fa-user-plus"></i> Ersten Admin-User erstellen
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
        listEl.querySelectorAll('[data-action="remove-admin"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const email = e.target.closest('tr').dataset.email;
                this.handleRemoveFromAdminGroup(email);
            });
        });
    }
    
    renderUserRow(user) {
        const attrs = user.Attributes.reduce((acc, attr) => {
            acc[attr.Name] = attr.Value;
            return acc;
        }, {});
        
        const email = attrs.email || user.Username;
        const name = attrs.name || attrs.given_name || attrs.family_name || '-';
        const status = user.UserStatus;
        const created = user.UserCreateDate ? new Date(user.UserCreateDate).toLocaleDateString('de-DE') : '-';
        
        const statusClass = status === 'CONFIRMED' ? 'status-confirmed' : 
                           status === 'FORCE_CHANGE_PASSWORD' ? 'status-pending' : 
                           'status-unconfirmed';
        
        return `
            <tr data-email="${email}">
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-envelope" style="color: #667eea;"></i>
                        <strong>${email}</strong>
                    </div>
                </td>
                <td>${name}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${this.getStatusLabel(status)}
                    </span>
                </td>
                <td>${created}</td>
                <td>
                    <div class="action-buttons">
                        <button 
                            class="btn-icon btn-danger" 
                            data-action="remove-admin"
                            title="Aus Admin-Gruppe entfernen"
                        >
                            <i class="fas fa-user-minus"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
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
        if (!searchTerm.trim()) {
            this.filteredUsers = [...this.users];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredUsers = this.users.filter(user => {
                const attrs = user.Attributes.reduce((acc, attr) => {
                    acc[attr.Name] = attr.Value;
                    return acc;
                }, {});
                const email = (attrs.email || user.Username || '').toLowerCase();
                const name = (attrs.name || attrs.given_name || attrs.family_name || '').toLowerCase();
                return email.includes(term) || name.includes(term);
            });
        }
        this.renderUsersList();
    }
    
    showCreateUserModal() {
        const modal = document.getElementById('modal-create-user');
        if (modal) {
            modal.classList.add('show');
            document.getElementById('new-user-email')?.focus();
        }
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
                // Clear any error states
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
        } else {
            console.warn('⚠️ Modal nicht gefunden:', modalId);
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
        
        const submitBtn = document.getElementById('btn-submit-create');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Erstelle neuen User...';
            
            console.log('👤 Erstelle neuen Admin-User:', email);
            
            // Prüfe ob User bereits existiert
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
                // User existiert bereits - füge nur zur Admin-Gruppe hinzu
                console.log('ℹ️ User existiert bereits, füge zur Admin-Gruppe hinzu...');
                await this.cognitoIdentityServiceProvider.adminAddUserToGroup({
                    UserPoolId: this.userPoolId,
                    Username: email,
                    GroupName: this.groupName
                }).promise();
                
                this.showSuccess(`User ${email} existiert bereits und wurde zur Admin-Gruppe hinzugefügt!`);
            } else {
                // Erstelle komplett neuen User
                console.log('➕ Erstelle komplett neuen User...');
                
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
                
                // Setze Passwort
                await this.cognitoIdentityServiceProvider.adminSetUserPassword({
                    UserPoolId: this.userPoolId,
                    Username: email,
                    Password: password,
                    Permanent: true
                }).promise();
                console.log('✅ Passwort gesetzt');
                
                // Füge zur Admin-Gruppe hinzu
                await this.cognitoIdentityServiceProvider.adminAddUserToGroup({
                    UserPoolId: this.userPoolId,
                    Username: email,
                    GroupName: this.groupName
                }).promise();
                console.log('✅ Zur Admin-Gruppe hinzugefügt');
                
                this.showSuccess(`✅ Neuer Admin-User ${email} wurde erfolgreich erstellt!`);
            }
            
            this.closeModal('modal-create-user');
            await this.loadAdminUsers();
            
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
    
    async handleRemoveFromAdminGroup(email) {
        if (!confirm(`Möchtest du ${email} wirklich aus der Admin-Gruppe entfernen?`)) {
            return;
        }
        
        try {
            await this.cognitoIdentityServiceProvider.adminRemoveUserFromGroup({
                UserPoolId: this.userPoolId,
                Username: email,
                GroupName: this.groupName
            }).promise();
            
            this.showSuccess(`User ${email} wurde aus der Admin-Gruppe entfernt.`);
            await this.loadAdminUsers();
            
        } catch (error) {
            console.error('❌ Error removing user from group:', error);
            this.showError(`Fehler beim Entfernen: ${error.message}`);
        }
    }
    
    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'notification notification-success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.className = 'notification notification-error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Register section
if (window.AdminApp && window.AdminApp.sections) {
    window.AdminApp.sections.userManagement = new AdminUserManagement();
} else {
    // Wait for AdminApp to be ready
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.AdminApp && window.AdminApp.sections) {
                window.AdminApp.sections.userManagement = new AdminUserManagement();
            }
        }, 1000);
    });
}

// Auto-initialize when section is loaded
if (document.getElementById('admin-users-list')) {
    const userManagement = new AdminUserManagement();
    userManagement.init();
    
    // Make it globally available
    if (window.AdminApp) {
        if (!window.AdminApp.sections) {
            window.AdminApp.sections = {};
        }
        window.AdminApp.sections.userManagement = userManagement;
    }
}

