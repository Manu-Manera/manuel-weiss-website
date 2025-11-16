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
    }
    
    async init() {
        if (this.isInitialized) return;
        
        console.log('👤 Initializing Website Users Management...');
        
        try {
            // Initialize AWS SDK if needed
            if (typeof AWS === 'undefined') {
                throw new Error('AWS SDK not loaded');
            }
            
            AWS.config.region = this.region;
            this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            
            // Load admin users first to exclude them
            await this.loadAdminUsers();
            
            this.setupEventListeners();
            await this.loadWebsiteUsers();
            
            this.isInitialized = true;
            console.log('✅ Website Users Management initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Website Users Management:', error);
            this.showError('Fehler beim Initialisieren der Website-Benutzer-Verwaltung');
        }
    }
    
    async loadAdminUsers() {
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
            
            // Get all users from the user pool
            const params = {
                UserPoolId: this.userPoolId,
                Limit: 60
            };
            
            let allUsers = [];
            let paginationToken = null;
            
            do {
                if (paginationToken) {
                    params.PaginationToken = paginationToken;
                }
                
                const result = await this.cognitoIdentityServiceProvider.listUsers(params).promise();
                allUsers = allUsers.concat(result.Users || []);
                paginationToken = result.PaginationToken;
            } while (paginationToken);
            
            // Filter out admin users
            this.users = allUsers.filter(user => !this.adminUsers.includes(user.Username));
            this.filteredUsers = [...this.users];
            
            console.log(`📊 Website-Benutzer geladen: ${this.users.length} (${allUsers.length} insgesamt, ${this.adminUsers.length} Admin)`);
            
            this.renderUsersList();
            
        } catch (error) {
            console.error('❌ Error loading website users:', error);
            listEl.innerHTML = `
                <div class="error-message" style="padding: 2rem; text-align: center; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Fehler beim Laden der Website-Benutzer</p>
                    <p style="font-size: 0.9rem; color: #64748b;">${error.message}</p>
                    <button class="btn btn-outline" onclick="window.AdminApp?.sections?.websiteUsers?.loadWebsiteUsers()" style="margin-top: 1rem;">
                        <i class="fas fa-sync"></i> Erneut versuchen
                    </button>
                </div>
            `;
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
        
        // Add event listeners for delete buttons
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
            <tr data-email="${email}">
                <td>${email}</td>
                <td>${name}</td>
                <td><span class="status-badge status-${user.UserStatus}">${status}</span></td>
                <td>${created}</td>
                <td>
                    <div class="action-buttons">
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
    
    async handleDeleteUser() {
        if (!this.userToDelete) return;
        
        const confirmBtn = document.getElementById('btn-confirm-delete-website-user');
        const originalText = confirmBtn.innerHTML;
        
        try {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lösche User...';
            
            console.log('🗑️ Lösche Website-Benutzer:', this.userToDelete);
            
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

// Auto-initialize when section is loaded
if (document.getElementById('website-users-list')) {
    const websiteUsers = new WebsiteUsersManagement();
    websiteUsers.init();
    
    // Make it globally available
    if (window.AdminApp) {
        if (!window.AdminApp.sections) {
            window.AdminApp.sections = {};
        }
        window.AdminApp.sections.websiteUsers = websiteUsers;
    }
}

// Export for Admin Application
if (typeof window !== 'undefined') {
    window.WebsiteUsersManagement = WebsiteUsersManagement;
}

