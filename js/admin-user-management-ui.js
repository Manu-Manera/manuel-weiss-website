// Admin User Management UI - Modern UX Best Practices
// Implementiert professionelle User-Verwaltung mit AWS Cognito Integration

class AdminUserManagementUI {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.selectedUsers = new Set();
        this.currentPage = 1;
        this.pageSize = 20;
        this.sortField = 'createdAt';
        this.sortDirection = 'desc';
        this.filters = {
            status: 'all',
            verified: 'all',
            activity: 'all',
            search: ''
        };
        
        // Warten auf API-Konfiguration
        this.waitForApiConfig().then(() => {
            this.apiBase = window.API_CONFIG?.baseUrl || window.API_BASE || '/api';
            console.log('🔧 Admin User Management using API base:', this.apiBase);
            this.init();
        });
    }
    
    async waitForApiConfig() {
        // Warten bis API-Konfiguration geladen ist
        let attempts = 0;
        while (!window.API_CONFIG && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (!window.API_CONFIG) {
            console.warn('⚠️ API_CONFIG not loaded, using fallback');
        }
    }
    
    async init() {
        console.log('👥 Admin User Management UI initializing...');
        
        // Wait for global auth
        if (!window.GlobalAuth?.isAuthenticated()) {
            console.warn('Admin not authenticated - delaying initialization');
            setTimeout(() => this.init(), 2000);
            return;
        }
        
        // Create UI
        this.createUserManagementSection();
        
        // Load initial data
        await this.loadUsers();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
        
        console.log('✅ Admin User Management UI ready');
    }
    
    createUserManagementSection() {
        // Find the user management container in admin panel
        const userManagementContainer = document.getElementById('user-management-container');
        if (!userManagementContainer) {
            console.error('User management container not found in admin panel');
            return;
        }
        
        // Replace the loading placeholder with actual UI
        userManagementContainer.innerHTML = this.getUserManagementHTML();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    getUserManagementHTML() {
        return `
            <div style="
                background: white; border-radius: 16px; padding: 2rem;
                margin: 2rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                border: 1px solid #e5e7eb;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="margin: 0; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-users" style="color: #3b82f6;"></i>
                        User Management
                        <span id="user-count-badge" style="
                            background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem;
                            border-radius: 12px; font-size: 0.875rem; font-weight: 600;
                        ">0</span>
                    </h2>
                    
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <button id="refresh-users-btn" style="
                            background: #6b7280; color: white; border: none;
                            padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;
                            display: flex; align-items: center; gap: 0.5rem;
                        ">
                            <i class="fas fa-sync"></i> Aktualisieren
                        </button>
                        <button id="create-user-btn" style="
                            background: #10b981; color: white; border: none;
                            padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;
                            font-weight: 600; display: flex; align-items: center; gap: 0.5rem;
                        ">
                            <i class="fas fa-plus"></i> Neuer User
                        </button>
                    </div>
                </div>
                
                <!-- Filters & Search -->
                <div style="
                    background: #f9fafb; padding: 1.5rem; border-radius: 12px;
                    margin-bottom: 2rem; border: 1px solid #f3f4f6;
                ">
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 1rem; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">
                                🔍 Suche
                            </label>
                            <input type="text" id="user-search" placeholder="Name, E-Mail oder ID suchen..." style="
                                width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
                                border-radius: 6px; font-size: 0.875rem;
                            ">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">
                                Status
                            </label>
                            <select id="status-filter" style="
                                width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
                                border-radius: 6px; font-size: 0.875rem;
                            ">
                                <option value="all">Alle Status</option>
                                <option value="CONFIRMED">Bestätigt</option>
                                <option value="UNCONFIRMED">Unbestätigt</option>
                                <option value="FORCE_CHANGE_PASSWORD">Passwort ändern</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">
                                Verifiziert
                            </label>
                            <select id="verified-filter" style="
                                width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
                                border-radius: 6px; font-size: 0.875rem;
                            ">
                                <option value="all">Alle</option>
                                <option value="true">Verifiziert</option>
                                <option value="false">Nicht verifiziert</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151;">
                                Aktivität
                            </label>
                            <select id="activity-filter" style="
                                width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
                                border-radius: 6px; font-size: 0.875rem;
                            ">
                                <option value="all">Alle</option>
                                <option value="active">Aktiv (7 Tage)</option>
                                <option value="inactive">Inaktiv (>30 Tage)</option>
                                <option value="new">Neu (7 Tage)</option>
                            </select>
                        </div>
                        <button id="clear-filters-btn" style="
                            background: #f3f4f6; color: #374151; border: 1px solid #d1d5db;
                            padding: 0.75rem; border-radius: 6px; cursor: pointer;
                            display: flex; align-items: center;
                        ">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Bulk Actions -->
                <div id="bulk-actions-bar" style="
                    background: #1e40af; color: white; padding: 1rem 1.5rem;
                    border-radius: 8px; margin-bottom: 1rem; display: none;
                    align-items: center; justify-content: space-between;
                ">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span id="selected-count">0 ausgewählt</span>
                        <div style="display: flex; gap: 0.5rem;">
                            <button id="bulk-enable-btn" class="bulk-action-btn">
                                <i class="fas fa-unlock"></i> Aktivieren
                            </button>
                            <button id="bulk-disable-btn" class="bulk-action-btn">
                                <i class="fas fa-lock"></i> Deaktivieren
                            </button>
                            <button id="bulk-reset-password-btn" class="bulk-action-btn">
                                <i class="fas fa-key"></i> Passwort zurücksetzen
                            </button>
                            <button id="bulk-delete-btn" class="bulk-action-btn" style="background: #ef4444;">
                                <i class="fas fa-trash"></i> Löschen
                            </button>
                        </div>
                    </div>
                    <button id="clear-selection-btn" style="
                        background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);
                        padding: 0.5rem; border-radius: 4px; cursor: pointer;
                    ">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- User Stats Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;" id="user-stats-cards">
                    ${this.getStatsCardsHTML()}
                </div>
                
                <!-- Users Table -->
                <div style="
                    background: white; border-radius: 12px; overflow: hidden;
                    border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">
                    <div style="
                        background: #f9fafb; padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb;
                        display: flex; justify-content: space-between; align-items: center;
                    ">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <input type="checkbox" id="select-all-users" style="
                                width: 18px; height: 18px; cursor: pointer;
                            ">
                            <span style="font-weight: 600; color: #374151;">Alle Benutzer</span>
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <select id="sort-field" style="
                                padding: 0.5rem; border: 1px solid #d1d5db;
                                border-radius: 4px; font-size: 0.875rem;
                            ">
                                <option value="createdAt">Nach Erstellung</option>
                                <option value="lastActivity">Nach Aktivität</option>
                                <option value="name">Nach Name</option>
                                <option value="email">Nach E-Mail</option>
                                <option value="progress">Nach Fortschritt</option>
                            </select>
                            <button id="sort-direction" style="
                                background: #f3f4f6; border: 1px solid #d1d5db;
                                padding: 0.5rem; border-radius: 4px; cursor: pointer;
                            ">
                                <i class="fas fa-sort-amount-down"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="users-table-container" style="max-height: 600px; overflow-y: auto;">
                        <div id="users-loading" style="
                            text-align: center; padding: 4rem; color: #6b7280;
                        ">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                            <p>Lade Benutzer...</p>
                        </div>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="pagination-container" style="
                        background: #f9fafb; padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;
                        display: flex; justify-content: between; align-items: center;
                    ">
                        <div id="pagination-info" style="color: #6b7280; font-size: 0.875rem;">
                            Zeige 1-20 von 0 Benutzern
                        </div>
                        <div id="pagination-controls" style="display: flex; gap: 0.5rem;">
                            <!-- Pagination buttons will be inserted here -->
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions Panel -->
                <div style="
                    background: #f8fafc; padding: 1.5rem; border-radius: 12px;
                    margin-top: 2rem; border: 1px solid #e5e7eb;
                ">
                    <h3 style="margin: 0 0 1rem; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-bolt" style="color: #f59e0b;"></i>
                        Quick Actions
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <button onclick="window.AdminUserUI.exportUserData()" style="
                            background: #3b82f6; color: white; border: none;
                            padding: 1rem; border-radius: 8px; cursor: pointer;
                            display: flex; align-items: center; gap: 0.5rem; font-weight: 500;
                        ">
                            <i class="fas fa-download"></i> Export User Data
                        </button>
                        <button onclick="window.AdminUserUI.generateUserReport()" style="
                            background: #059669; color: white; border: none;
                            padding: 1rem; border-radius: 8px; cursor: pointer;
                            display: flex; align-items: center; gap: 0.5rem; font-weight: 500;
                        ">
                            <i class="fas fa-chart-bar"></i> User Report
                        </button>
                        <button onclick="window.AdminUserUI.showSystemHealth()" style="
                            background: #dc2626; color: white; border: none;
                            padding: 1rem; border-radius: 8px; cursor: pointer;
                            display: flex; align-items: center; gap: 0.5rem; font-weight: 500;
                        ">
                            <i class="fas fa-heartbeat"></i> System Health
                        </button>
                        <button onclick="window.AdminUserUI.showActivityLogs()" style="
                            background: #7c3aed; color: white; border: none;
                            padding: 1rem; border-radius: 8px; cursor: pointer;
                            display: flex; align-items: center; gap: 0.5rem; font-weight: 500;
                        ">
                            <i class="fas fa-history"></i> Activity Logs
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- User Details Modal -->
            <div id="user-details-modal" style="
                display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7); z-index: 10000;
                align-items: center; justify-content: center; padding: 2rem;
            ">
                <div style="
                    background: white; border-radius: 16px; padding: 2rem;
                    max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;
                    position: relative;
                ">
                    <button onclick="window.AdminUserUI.closeModal()" style="
                        position: absolute; top: 1rem; right: 1rem;
                        background: #f3f4f6; border: none; padding: 0.5rem;
                        border-radius: 6px; cursor: pointer;
                    ">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div id="user-details-content">
                        <!-- User details will be populated here -->
                    </div>
                </div>
            </div>
            
            <!-- Create User Modal -->
            <div id="create-user-modal" style="
                display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7); z-index: 10000;
                align-items: center; justify-content: center; padding: 2rem;
            ">
                <div style="
                    background: white; border-radius: 16px; padding: 2rem;
                    max-width: 500px; width: 100%; position: relative;
                ">
                    <button onclick="window.AdminUserUI.closeCreateModal()" style="
                        position: absolute; top: 1rem; right: 1rem;
                        background: #f3f4f6; border: none; padding: 0.5rem;
                        border-radius: 6px; cursor: pointer;
                    ">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <h3 style="margin: 0 0 2rem; color: #1f2937;">
                        <i class="fas fa-user-plus" style="color: #10b981;"></i>
                        Neuen Benutzer erstellen
                    </h3>
                    
                    <form id="create-user-form">
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">E-Mail *</label>
                            <input type="email" id="new-user-email" required style="
                                width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
                                border-radius: 6px;
                            ">
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Name</label>
                            <input type="text" id="new-user-name" style="
                                width: 100%; padding: 0.75rem; border: 1px solid #d1d5db;
                                border-radius: 6px;
                            ">
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="send-welcome-email" checked>
                                <span>Willkommens-E-Mail senden</span>
                            </label>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button type="button" onclick="window.AdminUserUI.closeCreateModal()" style="
                                flex: 1; background: #6b7280; color: white; border: none;
                                padding: 0.75rem; border-radius: 6px; cursor: pointer;
                            ">
                                Abbrechen
                            </button>
                            <button type="submit" style="
                                flex: 1; background: #10b981; color: white; border: none;
                                padding: 0.75rem; border-radius: 6px; cursor: pointer; font-weight: 600;
                            ">
                                <i class="fas fa-plus"></i> Erstellen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <style>
                .bulk-action-btn {
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .bulk-action-btn:hover {
                    background: rgba(255,255,255,0.3);
                }
                
                .user-row {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                
                .user-row:hover {
                    background: #f8fafc;
                }
                
                .user-row.selected {
                    background: #eff6ff;
                    border-left: 4px solid #3b82f6;
                }
                
                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .status-confirmed {
                    background: #dcfce7;
                    color: #166534;
                }
                
                .status-unconfirmed {
                    background: #fef3c7;
                    color: #92400e;
                }
                
                .status-force-change {
                    background: #fee2e2;
                    color: #dc2626;
                }
                
                .risk-score {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .risk-low { background: #dcfce7; color: #166534; }
                .risk-medium { background: #fef3c7; color: #92400e; }
                .risk-high { background: #fee2e2; color: #dc2626; }
                
                .progress-bar {
                    width: 100%;
                    height: 6px;
                    background: #e5e7eb;
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #059669);
                    transition: width 0.3s ease;
                }
            </style>
        `;
    }
    
    getStatsCardsHTML() {
        return `
            <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 1.5rem; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-users" style="font-size: 1.25rem;"></i>
                    <span style="font-size: 0.875rem; opacity: 0.9;">Gesamt Users</span>
                </div>
                <div style="font-size: 2rem; font-weight: bold;" id="total-users-stat">-</div>
                <div style="font-size: 0.75rem; opacity: 0.8;" id="total-users-change">Lädt...</div>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 1.5rem; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-user-check" style="font-size: 1.25rem;"></i>
                    <span style="font-size: 0.875rem; opacity: 0.9;">Aktive Users</span>
                </div>
                <div style="font-size: 2rem; font-weight: bold;" id="active-users-stat">-</div>
                <div style="font-size: 0.75rem; opacity: 0.8;" id="active-users-change">Lädt...</div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 1.5rem; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 1.25rem;"></i>
                    <span style="font-size: 0.875rem; opacity: 0.9;">Risiko Users</span>
                </div>
                <div style="font-size: 2rem; font-weight: bold;" id="risk-users-stat">-</div>
                <div style="font-size: 0.75rem; opacity: 0.8;" id="risk-users-change">Lädt...</div>
            </div>
            
            <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 1.5rem; border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <i class="fas fa-crown" style="font-size: 1.25rem;"></i>
                    <span style="font-size: 0.875rem; opacity: 0.9;">Power Users</span>
                </div>
                <div style="font-size: 2rem; font-weight: bold;" id="power-users-stat">-</div>
                <div style="font-size: 0.75rem; opacity: 0.8;" id="power-users-change">Lädt...</div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.filters.search = searchInput.value;
                this.applyFilters();
            }, 300));
        }
        
        // Filters
        ['status-filter', 'verified-filter', 'activity-filter'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', () => {
                    this.filters[id.replace('-filter', '')] = select.value;
                    this.applyFilters();
                });
            }
        });
        
        // Clear filters
        const clearBtn = document.getElementById('clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }
        
        // Refresh
        const refreshBtn = document.getElementById('refresh-users-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadUsers());
        }
        
        // Create user
        const createBtn = document.getElementById('create-user-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateUserModal());
        }
        
        // Select all
        const selectAllBtn = document.getElementById('select-all-users');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }
        
        // Sort
        const sortField = document.getElementById('sort-field');
        const sortDirection = document.getElementById('sort-direction');
        
        if (sortField) {
            sortField.addEventListener('change', () => {
                this.sortField = sortField.value;
                this.applySort();
            });
        }
        
        if (sortDirection) {
            sortDirection.addEventListener('click', () => {
                this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
                sortDirection.innerHTML = this.sortDirection === 'desc' 
                    ? '<i class="fas fa-sort-amount-down"></i>' 
                    : '<i class="fas fa-sort-amount-up"></i>';
                this.applySort();
            });
        }
        
        // Bulk actions
        this.setupBulkActionListeners();
        
        // Create user form
        const createForm = document.getElementById('create-user-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createUser();
            });
        }
    }
    
    setupBulkActionListeners() {
        const bulkActions = {
            'bulk-enable-btn': () => this.performBulkAction('enable'),
            'bulk-disable-btn': () => this.performBulkAction('disable'),
            'bulk-reset-password-btn': () => this.performBulkAction('reset_password'),
            'bulk-delete-btn': () => this.performBulkAction('delete'),
            'clear-selection-btn': () => this.clearSelection()
        };
        
        Object.entries(bulkActions).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
    }
    
    async loadUsers() {
        console.log('📊 Loading users from AWS Cognito...');
        
        try {
            this.showLoading(true);
            
            // Load users from API (would call the Lambda function)
            const response = await this.apiCall('/admin/users', {
                method: 'GET',
                params: {
                    limit: this.pageSize,
                    page: this.currentPage
                }
            });
            
            this.users = response.users || [];
            this.applyFilters();
            this.updateStatsCards(response.stats);
            
            console.log(`✅ Loaded ${this.users.length} users`);
        } catch (error) {
            console.error('❌ Failed to load users:', error);
            this.showError('Fehler beim Laden der Benutzer: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }
    
    applyFilters() {
        this.filteredUsers = this.users.filter(user => {
            // Search filter
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                const searchFields = [user.email, user.name, user.id].filter(Boolean).join(' ').toLowerCase();
                if (!searchFields.includes(search)) return false;
            }
            
            // Status filter
            if (this.filters.status !== 'all' && user.status !== this.filters.status) {
                return false;
            }
            
            // Verified filter
            if (this.filters.verified !== 'all') {
                const isVerified = user.emailVerified;
                if (this.filters.verified === 'true' && !isVerified) return false;
                if (this.filters.verified === 'false' && isVerified) return false;
            }
            
            // Activity filter
            if (this.filters.activity !== 'all') {
                const daysSince = this.calculateDaysSince(user.profile?.lastLogin);
                switch (this.filters.activity) {
                    case 'active':
                        if (daysSince > 7) return false;
                        break;
                    case 'inactive':
                        if (daysSince <= 30) return false;
                        break;
                    case 'new':
                        if (this.calculateDaysSince(user.createdAt) > 7) return false;
                        break;
                }
            }
            
            return true;
        });
        
        this.applySort();
        this.renderUsersTable();
        this.updatePagination();
    }
    
    applySort() {
        this.filteredUsers.sort((a, b) => {
            let aVal, bVal;
            
            switch (this.sortField) {
                case 'createdAt':
                    aVal = new Date(a.createdAt || 0);
                    bVal = new Date(b.createdAt || 0);
                    break;
                case 'lastActivity':
                    aVal = new Date(a.profile?.lastLogin || 0);
                    bVal = new Date(b.profile?.lastLogin || 0);
                    break;
                case 'name':
                    aVal = (a.name || '').toLowerCase();
                    bVal = (b.name || '').toLowerCase();
                    break;
                case 'email':
                    aVal = (a.email || '').toLowerCase();
                    bVal = (b.email || '').toLowerCase();
                    break;
                case 'progress':
                    aVal = a.completionRate || 0;
                    bVal = b.completionRate || 0;
                    break;
                default:
                    return 0;
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    renderUsersTable() {
        const container = document.getElementById('users-table-container');
        if (!container) return;
        
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageUsers = this.filteredUsers.slice(startIndex, endIndex);
        
        if (pageUsers.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem; color: #6b7280;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3 style="margin: 0 0 0.5rem;">Keine Benutzer gefunden</h3>
                    <p style="margin: 0;">Ändern Sie die Filter oder erstellen Sie einen neuen Benutzer.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pageUsers.map(user => this.getUserRowHTML(user)).join('');
        
        // Add click listeners
        pageUsers.forEach((user, index) => {
            const row = container.children[index];
            if (row) {
                // Row selection
                const checkbox = row.querySelector('.user-checkbox');
                if (checkbox) {
                    checkbox.addEventListener('change', (e) => {
                        e.stopPropagation();
                        this.toggleUserSelection(user.id, e.target.checked);
                    });
                }
                
                // Row click for details
                row.addEventListener('click', (e) => {
                    if (!e.target.matches('input, button, .dropdown')) {
                        this.showUserDetails(user);
                    }
                });
            }
        });
        
        this.updateSelectionUI();
    }
    
    getUserRowHTML(user) {
        const riskClass = user.riskScore > 70 ? 'risk-high' : 
                         user.riskScore > 30 ? 'risk-medium' : 'risk-low';
        
        const statusClass = `status-${user.status.toLowerCase().replace('_', '-')}`;
        const daysSinceLogin = this.calculateDaysSince(user.profile?.lastLogin);
        
        return `
            <div class="user-row ${this.selectedUsers.has(user.id) ? 'selected' : ''}" 
                 data-user-id="${user.id}" style="
                display: grid;
                grid-template-columns: auto 1fr 150px 120px 100px 100px 120px auto;
                gap: 1rem;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #f3f4f6;
                align-items: center;
            ">
                <input type="checkbox" class="user-checkbox" 
                       ${this.selectedUsers.has(user.id) ? 'checked' : ''}
                       style="width: 18px; height: 18px; cursor: pointer;">
                
                <div>
                    <div style="font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">
                        ${user.name || user.email}
                    </div>
                    <div style="font-size: 0.875rem; color: #6b7280;">
                        ${user.email}
                        ${user.emailVerified ? '<i class="fas fa-check-circle" style="color: #10b981; margin-left: 0.5rem;"></i>' : 
                          '<i class="fas fa-exclamation-circle" style="color: #f59e0b; margin-left: 0.5rem;"></i>'}
                    </div>
                </div>
                
                <div>
                    <span class="status-badge ${statusClass}">
                        ${this.getStatusDisplayName(user.status)}
                    </span>
                </div>
                
                <div style="text-align: center;">
                    <div style="font-weight: 600; color: #1f2937;">${user.progress.completedMethods}/${user.progress.totalMethods}</div>
                    <div class="progress-bar" style="margin-top: 0.25rem;">
                        <div class="progress-fill" style="width: ${user.completionRate}%"></div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <span class="risk-score ${riskClass}">
                        ${user.riskScore}
                    </span>
                </div>
                
                <div style="text-align: center; font-size: 0.875rem; color: #6b7280;">
                    ${user.progress.streakDays > 0 ? 
                      `🔥 ${user.progress.streakDays} Tage` : 
                      '-'
                    }
                </div>
                
                <div style="text-align: center; font-size: 0.875rem; color: #6b7280;">
                    ${daysSinceLogin < 1 ? 'Heute' : 
                      daysSinceLogin < 7 ? `vor ${daysSinceLogin}d` :
                      daysSinceLogin < 30 ? `vor ${Math.floor(daysSinceLogin/7)}w` :
                      daysSinceLogin < 999 ? `vor ${Math.floor(daysSinceLogin/30)}m` : 'Nie'
                    }
                </div>
                
                <div class="dropdown" style="position: relative;">
                    <button onclick="window.AdminUserUI.toggleUserActions('${user.id}')" style="
                        background: #f3f4f6; border: 1px solid #d1d5db;
                        padding: 0.5rem; border-radius: 6px; cursor: pointer;
                    ">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div id="user-actions-${user.id}" class="dropdown-menu" style="
                        display: none; position: absolute; right: 0; top: 100%;
                        background: white; border: 1px solid #d1d5db; border-radius: 6px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000;
                        min-width: 180px;
                    ">
                        <button onclick="window.AdminUserUI.showUserDetails('${user.id}')" style="
                            width: 100%; text-align: left; background: none; border: none;
                            padding: 0.75rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                        ">
                            <i class="fas fa-eye"></i> Details anzeigen
                        </button>
                        <button onclick="window.AdminUserUI.editUser('${user.id}')" style="
                            width: 100%; text-align: left; background: none; border: none;
                            padding: 0.75rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                        ">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button onclick="window.AdminUserUI.resetPassword('${user.id}')" style="
                            width: 100%; text-align: left; background: none; border: none;
                            padding: 0.75rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                        ">
                            <i class="fas fa-key"></i> Passwort zurücksetzen
                        </button>
                        <button onclick="window.AdminUserUI.toggleUserStatus('${user.id}', ${user.enabled})" style="
                            width: 100%; text-align: left; background: none; border: none;
                            padding: 0.75rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                            color: ${user.enabled ? '#dc2626' : '#10b981'};
                        ">
                            <i class="fas fa-${user.enabled ? 'lock' : 'unlock'}"></i> 
                            ${user.enabled ? 'Deaktivieren' : 'Aktivieren'}
                        </button>
                        <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #f3f4f6;">
                        <button onclick="window.AdminUserUI.deleteUser('${user.id}')" style="
                            width: 100%; text-align: left; background: none; border: none;
                            padding: 0.75rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
                            color: #dc2626;
                        ">
                            <i class="fas fa-trash"></i> Löschen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // === USER ACTIONS ===
    
    async showUserDetails(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        // Load detailed user activity
        const activity = await this.apiCall(`/admin/user-activity?userId=${userId}&limit=20`);
        
        const modal = document.getElementById('user-details-modal');
        const content = document.getElementById('user-details-content');
        
        content.innerHTML = this.getUserDetailsHTML(user, activity);
        modal.style.display = 'flex';
    }
    
    getUserDetailsHTML(user, activity) {
        return `
            <h2 style="margin: 0 0 2rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-user-circle" style="color: #3b82f6;"></i>
                ${user.name || user.email}
            </h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <!-- User Info -->
                <div>
                    <h3 style="margin: 0 0 1rem; color: #374151;">👤 Benutzer-Informationen</h3>
                    <div style="background: #f9fafb; padding: 1rem; border-radius: 8px;">
                        <div style="margin-bottom: 0.75rem;">
                            <strong>E-Mail:</strong> ${user.email}
                            ${user.emailVerified ? 
                              '<span style="color: #10b981; margin-left: 0.5rem;">✅ Verifiziert</span>' :
                              '<span style="color: #f59e0b; margin-left: 0.5rem;">⚠️ Nicht verifiziert</span>'
                            }
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <strong>Name:</strong> ${user.name || 'Nicht angegeben'}
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <strong>Status:</strong> 
                            <span class="status-badge ${this.getStatusClass(user.status)}" style="margin-left: 0.5rem;">
                                ${this.getStatusDisplayName(user.status)}
                            </span>
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <strong>Erstellt:</strong> ${this.formatDate(user.createdAt)}
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <strong>Letzter Login:</strong> ${this.formatDate(user.profile?.lastLogin) || 'Nie'}
                        </div>
                        <div>
                            <strong>Risiko-Score:</strong> 
                            <span class="risk-score ${this.getRiskClass(user.riskScore)}" style="margin-left: 0.5rem;">
                                ${user.riskScore}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Progress Info -->
                <div>
                    <h3 style="margin: 0 0 1rem; color: #374151;">📊 Fortschritt & Aktivität</h3>
                    <div style="background: #f9fafb; padding: 1rem; border-radius: 8px;">
                        <div style="margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span><strong>Methods abgeschlossen:</strong></span>
                                <span>${user.progress.completedMethods}/${user.progress.totalMethods}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${user.completionRate}%"></div>
                            </div>
                            <div style="text-align: center; margin-top: 0.25rem; font-size: 0.875rem; color: #6b7280;">
                                ${user.completionRate}% abgeschlossen
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div style="text-align: center; padding: 0.75rem; background: white; border-radius: 6px;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: #8b5cf6;">
                                    ${user.progress.streakDays}
                                </div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Tage-Serie</div>
                            </div>
                            <div style="text-align: center; padding: 0.75rem; background: white; border-radius: 6px;">
                                <div style="font-size: 1.5rem; font-weight: bold; color: #059669;">
                                    ${Object.keys(user.profile?.preferences || {}).length}
                                </div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Einstellungen</div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 0.75rem;">
                            <strong>Letzte Aktivität:</strong> ${this.formatDate(user.progress.lastActivity) || 'Keine Aktivität'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div style="margin-top: 2rem;">
                <h3 style="margin: 0 0 1rem; color: #374151;">📋 Letzte Aktivitäten</h3>
                <div style="background: #f9fafb; border-radius: 8px; max-height: 300px; overflow-y: auto;">
                    ${activity?.activities?.length > 0 ? 
                        activity.activities.map(act => `
                            <div style="
                                padding: 0.75rem 1rem; border-bottom: 1px solid #f3f4f6;
                                display: flex; justify-content: space-between; align-items: center;
                            ">
                                <div>
                                    <span style="font-weight: 500;">${this.getActionDisplayName(act.action)}</span>
                                    ${act.method ? `<span style="color: #6b7280; margin-left: 0.5rem;">• ${act.method}</span>` : ''}
                                </div>
                                <span style="font-size: 0.875rem; color: #6b7280;">
                                    ${this.formatDate(act.timestamp)}
                                </span>
                            </div>
                        `).join('') :
                        '<div style="padding: 2rem; text-align: center; color: #6b7280;">Keine Aktivität</div>'
                    }
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="
                display: flex; gap: 1rem; margin-top: 2rem; padding-top: 2rem;
                border-top: 1px solid #e5e7eb;
            ">
                <button onclick="window.AdminUserUI.editUser('${user.id}')" style="
                    background: #3b82f6; color: white; border: none;
                    padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                    font-weight: 500;
                ">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
                <button onclick="window.AdminUserUI.resetPassword('${user.id}')" style="
                    background: #f59e0b; color: white; border: none;
                    padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                    font-weight: 500;
                ">
                    <i class="fas fa-key"></i> Passwort zurücksetzen
                </button>
                <button onclick="window.AdminUserUI.toggleUserStatus('${user.id}', ${user.enabled})" style="
                    background: ${user.enabled ? '#dc2626' : '#10b981'}; color: white; border: none;
                    padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;
                    font-weight: 500;
                ">
                    <i class="fas fa-${user.enabled ? 'lock' : 'unlock'}"></i> 
                    ${user.enabled ? 'Deaktivieren' : 'Aktivieren'}
                </button>
            </div>
        `;
    }
    
    // === API CALLS ===
    
    async apiCall(endpoint, options = {}) {
        const url = this.apiBase + endpoint;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.GlobalAuth?.getCurrentUser()?.idToken}`
            }
        };
        
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        return response.status === 204 ? null : response.json();
    }
    
    // === USER ACTIONS ===
    
    async createUser() {
        const email = document.getElementById('new-user-email').value;
        const name = document.getElementById('new-user-name').value;
        const sendEmail = document.getElementById('send-welcome-email').checked;
        
        if (!email) {
            this.showNotification('E-Mail ist erforderlich', 'error');
            return;
        }
        
        try {
            this.showLoading(true, 'Erstelle Benutzer...');
            
            const newUser = await this.apiCall('/admin/users', {
                method: 'POST',
                body: {
                    email,
                    name,
                    sendWelcomeEmail: sendEmail
                }
            });
            
            this.showNotification(`Benutzer ${email} erfolgreich erstellt`, 'success');
            this.closeCreateModal();
            await this.loadUsers();
            
        } catch (error) {
            this.showNotification(`Fehler beim Erstellen: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async toggleUserStatus(userId, currentEnabled) {
        const action = currentEnabled ? 'disable' : 'enable';
        const actionText = currentEnabled ? 'deaktivieren' : 'aktivieren';
        
        if (!confirm(`Benutzer wirklich ${actionText}?`)) return;
        
        try {
            await this.apiCall(`/admin/users/${userId}/${action}`, { method: 'POST' });
            this.showNotification(`Benutzer ${actionText}`, 'success');
            await this.loadUsers();
        } catch (error) {
            this.showNotification(`Fehler: ${error.message}`, 'error');
        }
    }
    
    async resetPassword(userId) {
        if (!confirm('Passwort wirklich zurücksetzen?')) return;
        
        try {
            const result = await this.apiCall(`/admin/users/${userId}/reset-password`, {
                method: 'POST',
                body: { temporaryPassword: this.generateTemporaryPassword() }
            });
            
            this.showNotification('Passwort zurückgesetzt', 'success');
            
            if (result.temporaryPassword) {
                // Show temporary password
                alert(`Temporäres Passwort: ${result.temporaryPassword}\n\nBitte sicher an den Benutzer weiterleiten.`);
            }
            
        } catch (error) {
            this.showNotification(`Fehler: ${error.message}`, 'error');
        }
    }
    
    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;
        
        if (!confirm(`Benutzer "${user.email}" wirklich PERMANENT löschen?\n\nAlle Daten gehen verloren!`)) return;
        
        try {
            await this.apiCall(`/admin/users/${userId}`, { method: 'DELETE' });
            this.showNotification('Benutzer gelöscht', 'success');
            await this.loadUsers();
        } catch (error) {
            this.showNotification(`Fehler beim Löschen: ${error.message}`, 'error');
        }
    }
    
    async performBulkAction(action) {
        if (this.selectedUsers.size === 0) {
            this.showNotification('Keine Benutzer ausgewählt', 'warning');
            return;
        }
        
        const actionNames = {
            enable: 'aktivieren',
            disable: 'deaktivieren',
            reset_password: 'Passwort zurücksetzen',
            delete: 'löschen'
        };
        
        const actionName = actionNames[action];
        if (!confirm(`${this.selectedUsers.size} Benutzer wirklich ${actionName}?`)) return;
        
        try {
            this.showLoading(true, `${actionName}...`);
            
            const result = await this.apiCall('/admin/bulk-actions', {
                method: 'POST',
                body: {
                    action,
                    userIds: Array.from(this.selectedUsers)
                }
            });
            
            this.showNotification(
                `${result.successful}/${result.total} Benutzer erfolgreich ${actionName}`, 
                result.failed > 0 ? 'warning' : 'success'
            );
            
            this.clearSelection();
            await this.loadUsers();
            
        } catch (error) {
            this.showNotification(`Bulk-Aktion fehlgeschlagen: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // === UTILITY FUNCTIONS ===
    
    toggleUserSelection(userId, selected) {
        if (selected) {
            this.selectedUsers.add(userId);
        } else {
            this.selectedUsers.delete(userId);
        }
        this.updateSelectionUI();
    }
    
    toggleSelectAll(selectAll) {
        if (selectAll) {
            this.filteredUsers.forEach(user => this.selectedUsers.add(user.id));
        } else {
            this.selectedUsers.clear();
        }
        this.renderUsersTable();
    }
    
    clearSelection() {
        this.selectedUsers.clear();
        this.updateSelectionUI();
        this.renderUsersTable();
    }
    
    updateSelectionUI() {
        const bulkBar = document.getElementById('bulk-actions-bar');
        const selectedCount = document.getElementById('selected-count');
        
        if (this.selectedUsers.size > 0) {
            bulkBar.style.display = 'flex';
            selectedCount.textContent = `${this.selectedUsers.size} ausgewählt`;
        } else {
            bulkBar.style.display = 'none';
        }
        
        // Update select-all checkbox
        const selectAllCheckbox = document.getElementById('select-all-users');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = this.selectedUsers.size > 0 && 
                this.selectedUsers.size === this.filteredUsers.length;
            selectAllCheckbox.indeterminate = this.selectedUsers.size > 0 && 
                this.selectedUsers.size < this.filteredUsers.length;
        }
    }
    
    updateStatsCards(stats) {
        if (!stats) return;
        
        document.getElementById('total-users-stat').textContent = stats.total || 0;
        document.getElementById('active-users-stat').textContent = stats.active || 0;
        document.getElementById('risk-users-stat').textContent = stats.highRisk || 0;
        document.getElementById('power-users-stat').textContent = stats.powerUsers || 0;
        
        // Update badge
        document.getElementById('user-count-badge').textContent = stats.total || 0;
    }
    
    showCreateUserModal() {
        document.getElementById('create-user-modal').style.display = 'flex';
        document.getElementById('new-user-email').focus();
    }
    
    closeCreateModal() {
        document.getElementById('create-user-modal').style.display = 'none';
        document.getElementById('create-user-form').reset();
    }
    
    closeModal() {
        document.getElementById('user-details-modal').style.display = 'none';
    }
    
    clearFilters() {
        this.filters = { status: 'all', verified: 'all', activity: 'all', search: '' };
        
        // Reset UI
        document.getElementById('user-search').value = '';
        document.getElementById('status-filter').value = 'all';
        document.getElementById('verified-filter').value = 'all';
        document.getElementById('activity-filter').value = 'all';
        
        this.applyFilters();
    }
    
    showLoading(show, message = 'Lädt...') {
        const loading = document.getElementById('users-loading');
        const container = document.getElementById('users-table-container');
        
        if (show) {
            if (loading) {
                loading.style.display = 'block';
                loading.innerHTML = `
                    <div style="text-align: center; padding: 4rem; color: #6b7280;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>${message}</p>
                    </div>
                `;
            }
        } else {
            if (loading) {
                loading.style.display = 'none';
            }
        }
    }
    
    showNotification(message, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10002;
            background: ${colors[type]}; color: white;
            padding: 1rem 1.5rem; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: 500; max-width: 400px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 4000);
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    // === HELPER FUNCTIONS ===
    
    calculateDaysSince(dateString) {
        if (!dateString) return 999;
        const date = new Date(dateString);
        const now = new Date();
        return Math.floor((now - date) / (1000 * 60 * 60 * 24));
    }
    
    formatDate(dateString) {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    getStatusDisplayName(status) {
        const names = {
            'CONFIRMED': 'Bestätigt',
            'UNCONFIRMED': 'Unbestätigt',
            'FORCE_CHANGE_PASSWORD': 'Passwort ändern',
            'RESET_REQUIRED': 'Reset erforderlich'
        };
        return names[status] || status;
    }
    
    getStatusClass(status) {
        return `status-${status.toLowerCase().replace('_', '-')}`;
    }
    
    getRiskClass(score) {
        return score > 70 ? 'risk-high' : score > 30 ? 'risk-medium' : 'risk-low';
    }
    
    getActionDisplayName(action) {
        const names = {
            'login': '🔓 Anmeldung',
            'logout': '🔒 Abmeldung',
            'method_completed': '✅ Method abgeschlossen',
            'document_uploaded': '📁 Dokument hochgeladen',
            'profile_updated': '👤 Profil aktualisiert',
            'password_changed': '🔑 Passwort geändert'
        };
        return names[action] || action;
    }
    
    generateTemporaryPassword() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        const symbols = '!@#$%&*';
        let password = '';
        
        // Ensure requirements
        password += chars[Math.floor(Math.random() * 26)]; // Uppercase
        password += chars[Math.floor(Math.random() * 26) + 26]; // Lowercase  
        password += '23456789'[Math.floor(Math.random() * 8)]; // Number
        password += symbols[Math.floor(Math.random() * symbols.length)]; // Symbol
        
        // Fill to 12 characters
        for (let i = 4; i < 12; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    setupRealTimeUpdates() {
        // Refresh users every 5 minutes
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.loadUsers();
            }
        }, 5 * 60 * 1000);
        
        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.loadUsers();
            }
        });
    }
    
    // === EXPORT FUNCTIONS ===
    
    async exportUserData() {
        try {
            const exportData = {
                users: this.users,
                stats: await this.apiCall('/admin/analytics'),
                exported: new Date().toISOString(),
                exportedBy: window.GlobalAuth?.getCurrentUser()?.email
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-export-${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            
            this.showNotification('User-Daten exportiert', 'success');
        } catch (error) {
            this.showNotification(`Export fehlgeschlagen: ${error.message}`, 'error');
        }
    }
    
    async generateUserReport() {
        this.showNotification('Report wird generiert...', 'info');
        
        try {
            const analytics = await this.apiCall('/admin/analytics');
            this.showUserReportModal(analytics);
        } catch (error) {
            this.showNotification(`Report-Generierung fehlgeschlagen: ${error.message}`, 'error');
        }
    }
    
    showUserReportModal(analytics) {
        // Implementation for detailed user report modal
        console.log('📊 User Report:', analytics);
        this.showNotification('User Report wird in separatem Fenster geöffnet', 'info');
    }
    
    async showSystemHealth() {
        try {
            const health = await this.apiCall('/admin/system-health');
            this.showSystemHealthModal(health);
        } catch (error) {
            this.showNotification(`System Health Check fehlgeschlagen: ${error.message}`, 'error');
        }
    }
    
    showSystemHealthModal(health) {
        // Implementation for system health modal
        console.log('💚 System Health:', health);
        this.showNotification(`System Health: ${health.overall}`, health.overall === 'healthy' ? 'success' : 'warning');
    }
    
    async showActivityLogs() {
        try {
            const activity = await this.apiCall('/admin/user-activity?limit=100');
            this.showActivityLogsModal(activity);
        } catch (error) {
            this.showNotification(`Activity Logs konnten nicht geladen werden: ${error.message}`, 'error');
        }
    }
    
    showActivityLogsModal(activity) {
        // Implementation for activity logs modal
        console.log('📋 Activity Logs:', activity);
        this.showNotification('Activity Logs werden geladen...', 'info');
    }
    
    // === MODAL FUNCTIONS ===
    
    toggleUserActions(userId) {
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (menu.id !== `user-actions-${userId}`) {
                menu.style.display = 'none';
            }
        });
        
        const menu = document.getElementById(`user-actions-${userId}`);
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    // Close dropdowns when clicking outside
    setupOutsideClickListeners() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
            }
        });
    }
}

// Initialize when admin page loads and wait for auth
document.addEventListener('DOMContentLoaded', () => {
    if (document.location.pathname.includes('admin')) {
        setTimeout(() => {
            window.AdminUserUI = new AdminUserManagementUI();
        }, 3000); // Wait for other systems to load
    }
});

console.log('👥 Admin User Management UI loaded');

export default AdminUserManagementUI;
