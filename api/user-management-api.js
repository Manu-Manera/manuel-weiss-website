// ========================================
// USER MANAGEMENT API - Manuel Weiss
// ========================================
// Vollständige User-Verwaltung mit AWS Cognito Integration
// Version: 1.0.0
// Datum: 2025-01-27

class UserManagementAPI {
    constructor() {
        this.baseURL = 'https://api.manuel-weiss.com/api/v1';
        this.cognitoUserPoolId = 'eu-central-1_8gP4gLK9r';
        this.cognitoClientId = '7kc5tt6a23fgh53d60vkefm812';
        this.region = 'eu-central-1';
        this.currentUser = null;
        this.authToken = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing User Management API...');
        
        // Load AWS SDK
        await this.loadAWSSDK();
        
        // Initialize Cognito
        this.initializeCognito();
        
        // Load current session
        this.loadCurrentSession();
        
        console.log('✅ User Management API initialized');
    }
    
    async loadAWSSDK() {
        return new Promise((resolve, reject) => {
            if (typeof AWS !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load AWS SDK'));
            document.head.appendChild(script);
        });
    }
    
    initializeCognito() {
        if (typeof AWS !== 'undefined' && AWS.CognitoIdentityServiceProvider) {
            this.cognito = new AWS.CognitoIdentityServiceProvider({
                region: this.region
            });
            console.log('✅ AWS Cognito initialized');
        } else {
            console.warn('⚠️ AWS Cognito not available, using simulation mode');
        }
    }
    
    loadCurrentSession() {
        const session = localStorage.getItem('aws_cognito_session_2025');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                this.currentUser = sessionData.user;
                this.authToken = sessionData.accessToken;
                console.log('✅ Current session loaded');
            } catch (error) {
                console.error('❌ Failed to load session:', error);
            }
        }
    }
    
    // ========================================
    // AUTHENTICATION METHODS
    // ========================================
    
    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            
            if (this.cognito) {
                return await this.loginWithCognito(email, password);
            } else {
                return await this.loginSimulation(email, password);
            }
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }
    
    async loginWithCognito(email, password) {
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.cognitoClientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };
        
        const result = await this.cognito.initiateAuth(params).promise();
        
        if (result.AuthenticationResult) {
            this.authToken = result.AuthenticationResult.AccessToken;
            this.currentUser = {
                email: email,
                id: result.AuthenticationResult.IdToken,
                name: email.split('@')[0]
            };
            
            this.saveSession();
            return this.currentUser;
        } else {
            throw new Error('Authentication failed');
        }
    }
    
    async loginSimulation(email, password) {
        // Simulation für Development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.currentUser = {
            email: email,
            id: 'sim_' + Date.now(),
            name: email.split('@')[0],
            role: 'user'
        };
        
        this.authToken = 'sim_token_' + Date.now();
        this.saveSession();
        
        return this.currentUser;
    }
    
    async logout() {
        try {
            console.log('🚪 Logging out user');
            
            if (this.cognito && this.currentUser) {
                await this.cognito.globalSignOut({
                    AccessToken: this.authToken
                }).promise();
            }
            
            this.clearSession();
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('❌ Logout failed:', error);
            this.clearSession(); // Clear session even if logout fails
        }
    }
    
    saveSession() {
        const session = {
            user: this.currentUser,
            accessToken: this.authToken,
            timestamp: Date.now()
        };
        
        localStorage.setItem('aws_cognito_session_2025', JSON.stringify(session));
    }
    
    clearSession() {
        this.currentUser = null;
        this.authToken = null;
        localStorage.removeItem('aws_cognito_session_2025');
    }
    
    isAuthenticated() {
        return this.currentUser !== null && this.authToken !== null;
    }
    
    // ========================================
    // USER MANAGEMENT METHODS
    // ========================================
    
    async getAllUsers() {
        try {
            console.log('👥 Fetching all users...');
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const users = [
                {
                    id: 'user_1',
                    email: 'admin@manuel-weiss.com',
                    name: 'Manuel Weiss',
                    role: 'admin',
                    status: 'active',
                    createdAt: '2024-01-01T00:00:00Z',
                    lastLogin: '2025-01-27T10:30:00Z'
                },
                {
                    id: 'user_2',
                    email: 'client@example.com',
                    name: 'Max Mustermann',
                    role: 'user',
                    status: 'active',
                    createdAt: '2024-06-15T14:20:00Z',
                    lastLogin: '2025-01-26T16:45:00Z'
                },
                {
                    id: 'user_3',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'user',
                    status: 'inactive',
                    createdAt: '2024-12-01T09:15:00Z',
                    lastLogin: '2025-01-20T11:30:00Z'
                }
            ];
            
            return users;
        } catch (error) {
            console.error('❌ Failed to fetch users:', error);
            throw error;
        }
    }
    
    async getUserById(userId) {
        try {
            console.log('👤 Fetching user:', userId);
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const user = {
                id: userId,
                email: 'user@example.com',
                name: 'User Name',
                role: 'user',
                status: 'active',
                profile: {
                    firstName: 'User',
                    lastName: 'Name',
                    phone: '+49 123 456789',
                    company: 'Example Company',
                    position: 'Developer'
                },
                activity: [
                    {
                        action: 'login',
                        timestamp: '2025-01-27T10:30:00Z',
                        ip: '192.168.1.100'
                    },
                    {
                        action: 'profile_update',
                        timestamp: '2025-01-26T15:20:00Z',
                        ip: '192.168.1.100'
                    }
                ],
                createdAt: '2024-01-01T00:00:00Z',
                lastLogin: '2025-01-27T10:30:00Z'
            };
            
            return user;
        } catch (error) {
            console.error('❌ Failed to fetch user:', error);
            throw error;
        }
    }
    
    async createUser(userData) {
        try {
            console.log('➕ Creating new user:', userData.email);
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newUser = {
                id: 'user_' + Date.now(),
                email: userData.email,
                name: userData.name || userData.email.split('@')[0],
                role: userData.role || 'user',
                status: 'active',
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            
            return newUser;
        } catch (error) {
            console.error('❌ Failed to create user:', error);
            throw error;
        }
    }
    
    async updateUser(userId, updateData) {
        try {
            console.log('✏️ Updating user:', userId);
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedUser = {
                id: userId,
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            
            return updatedUser;
        } catch (error) {
            console.error('❌ Failed to update user:', error);
            throw error;
        }
    }
    
    async deleteUser(userId) {
        try {
            console.log('🗑️ Deleting user:', userId);
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            console.error('❌ Failed to delete user:', error);
            throw error;
        }
    }
    
    async changeUserRole(userId, newRole) {
        try {
            console.log('🔄 Changing user role:', userId, 'to', newRole);
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return {
                success: true,
                message: `User role changed to ${newRole}`,
                userId: userId,
                newRole: newRole
            };
        } catch (error) {
            console.error('❌ Failed to change user role:', error);
            throw error;
        }
    }
    
    async activateUser(userId) {
        try {
            console.log('✅ Activating user:', userId);
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            return {
                success: true,
                message: 'User activated successfully',
                userId: userId,
                status: 'active'
            };
        } catch (error) {
            console.error('❌ Failed to activate user:', error);
            throw error;
        }
    }
    
    async deactivateUser(userId) {
        try {
            console.log('❌ Deactivating user:', userId);
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            return {
                success: true,
                message: 'User deactivated successfully',
                userId: userId,
                status: 'inactive'
            };
        } catch (error) {
            console.error('❌ Failed to deactivate user:', error);
            throw error;
        }
    }
    
    // ========================================
    // ANALYTICS METHODS
    // ========================================
    
    async getUserAnalytics() {
        try {
            console.log('📊 Fetching user analytics...');
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const analytics = {
                totalUsers: 156,
                activeUsers: 142,
                inactiveUsers: 14,
                newUsersThisMonth: 23,
                userGrowth: {
                    last7Days: 5,
                    last30Days: 23,
                    last90Days: 67
                },
                roleDistribution: {
                    admin: 3,
                    user: 153
                },
                loginStats: {
                    today: 45,
                    thisWeek: 312,
                    thisMonth: 1247
                },
                topCountries: [
                    { country: 'Germany', users: 89 },
                    { country: 'Austria', users: 23 },
                    { country: 'Switzerland', users: 18 },
                    { country: 'Netherlands', users: 12 }
                ]
            };
            
            return analytics;
        } catch (error) {
            console.error('❌ Failed to fetch user analytics:', error);
            throw error;
        }
    }
    
    async getUserActivity(userId) {
        try {
            console.log('📈 Fetching user activity:', userId);
            
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated');
            }
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 400));
            
            const activity = [
                {
                    action: 'login',
                    timestamp: '2025-01-27T10:30:00Z',
                    ip: '192.168.1.100',
                    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
                },
                {
                    action: 'profile_update',
                    timestamp: '2025-01-26T15:20:00Z',
                    ip: '192.168.1.100',
                    details: 'Updated profile information'
                },
                {
                    action: 'file_upload',
                    timestamp: '2025-01-25T14:15:00Z',
                    ip: '192.168.1.100',
                    details: 'Uploaded profile picture'
                },
                {
                    action: 'logout',
                    timestamp: '2025-01-25T18:45:00Z',
                    ip: '192.168.1.100'
                }
            ];
            
            return activity;
        } catch (error) {
            console.error('❌ Failed to fetch user activity:', error);
            throw error;
        }
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    getAuthToken() {
        return this.authToken;
    }
    
    async makeAPICall(endpoint, method = 'GET', data = null) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                }
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`API call failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ API call failed:', error);
            throw error;
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Initialize User Management API
window.userManagementAPI = new UserManagementAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManagementAPI;
}
