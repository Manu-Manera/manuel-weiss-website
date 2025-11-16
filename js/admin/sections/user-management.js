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
    }
    
    async init() {
        if (this.isInitialized) return;
        
        console.log('👥 Initializing Admin User Management...');
        
        try {
            // Initialize AWS SDK if needed
            if (typeof AWS === 'undefined') {
                throw new Error('AWS SDK not loaded');
            }
            
            AWS.config.region = this.region;
            this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            
            this.setupEventListeners();
            await this.loadAdminUsers();
            
            this.isInitialized = true;
            console.log('✅ Admin User Management initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Admin User Management:', error);
            this.showError('Fehler beim Initialisieren der User-Verwaltung');
        }
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
        
        // Modal close handlers werden beim Öffnen des Modals registriert (in showCreateUserModal)
    }
    
    async loadAdminUsers() {
        const listEl = document.getElementById('admin-users-list');
        if (!listEl) return;
        
        try {
            listEl.innerHTML = `
                <div class="loading-placeholder" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
                    <p>Lade Admin-User...</p>
                </div>
            `;
            
            // Get all users in admin group
            const params = {
                UserPoolId: this.userPoolId,
                GroupName: this.groupName,
                Limit: 60
            };
            
            const result = await this.cognitoIdentityServiceProvider.listUsersInGroup(params).promise();
            
            this.users = result.Users || [];
            this.filteredUsers = [...this.users];
            
            this.renderUsersList();
            
        } catch (error) {
            console.error('❌ Error loading admin users:', error);
            listEl.innerHTML = `
                <div class="error-message" style="padding: 2rem; text-align: center; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Fehler beim Laden der Admin-User</p>
                    <p style="font-size: 0.9rem; color: #64748b;">${error.message}</p>
                    <button class="btn btn-outline" onclick="window.AdminApp?.sections?.userManagement?.loadAdminUsers()" style="margin-top: 1rem;">
                        <i class="fas fa-sync"></i> Erneut versuchen
                    </button>
                </div>
            `;
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
            
            // Setup close handlers when modal is shown
            this.setupModalCloseHandlers(modal);
        }
    }
    
    setupModalCloseHandlers(modal) {
        // Close button (X)
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            // Remove existing listeners
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
            // Remove existing listeners
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

