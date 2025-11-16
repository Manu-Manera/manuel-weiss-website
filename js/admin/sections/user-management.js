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
        
        // Add existing user form
        const formAddExisting = document.getElementById('form-add-existing-user');
        if (formAddExisting) {
            formAddExisting.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddExistingUser(e.target);
            });
        }
        
        // Modal close buttons
        document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
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
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            // Reset forms
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }
    
    async handleCreateUser(form) {
        const formData = new FormData(form);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const name = formData.get('name').trim();
        const sendEmail = formData.get('sendEmail') === 'on';
        
        const submitBtn = document.getElementById('btn-submit-create');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Erstelle User...';
            
            // Create user
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
            
            const createResult = await this.cognitoIdentityServiceProvider.adminCreateUser(createParams).promise();
            
            // Set password
            await this.cognitoIdentityServiceProvider.adminSetUserPassword({
                UserPoolId: this.userPoolId,
                Username: email,
                Password: password,
                Permanent: true
            }).promise();
            
            // Add to admin group
            await this.cognitoIdentityServiceProvider.adminAddUserToGroup({
                UserPoolId: this.userPoolId,
                Username: email,
                GroupName: this.groupName
            }).promise();
            
            this.showSuccess(`Admin-User ${email} wurde erfolgreich erstellt!`);
            this.closeModal('modal-create-user');
            await this.loadAdminUsers();
            
        } catch (error) {
            console.error('❌ Error creating user:', error);
            this.showError(`Fehler beim Erstellen des Users: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    async handleAddExistingUser(form) {
        const formData = new FormData(form);
        const email = formData.get('email').trim();
        
        const submitBtn = document.getElementById('btn-submit-add-existing');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Füge hinzu...';
            
            // Add to admin group
            await this.cognitoIdentityServiceProvider.adminAddUserToGroup({
                UserPoolId: this.userPoolId,
                Username: email,
                GroupName: this.groupName
            }).promise();
            
            this.showSuccess(`User ${email} wurde zur Admin-Gruppe hinzugefügt!`);
            this.closeModal('modal-add-existing-user');
            await this.loadAdminUsers();
            
        } catch (error) {
            console.error('❌ Error adding user to group:', error);
            let errorMsg = error.message;
            if (error.code === 'UserNotFoundException') {
                errorMsg = 'User nicht gefunden. Bitte prüfe die E-Mail-Adresse.';
            } else if (error.code === 'ResourceNotFoundException') {
                errorMsg = 'User oder Gruppe nicht gefunden.';
            }
            this.showError(`Fehler: ${errorMsg}`);
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

