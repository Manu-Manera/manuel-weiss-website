// 📋 Application List Component - Intelligente Bewerbungsliste mit erweiterten Features
// Sortierung, Filterung, Suche, Bulk-Aktionen und Export-Funktionen

export class ApplicationList {
    constructor(applicationCore, options = {}) {
        this.applicationCore = applicationCore;
        this.options = {
            container: options.container,
            dashboard: options.dashboard,
            enableSearch: options.enableSearch !== false,
            enableFilters: options.enableFilters !== false,
            enableSorting: options.enableSorting !== false,
            enableBulkActions: options.enableBulkActions !== false,
            enablePagination: options.enablePagination !== false,
            pageSize: options.pageSize || 25,
            enableVirtualScrolling: options.enableVirtualScrolling || false,
            ...options
        };

        this.container = this.options.container;
        this.applications = [];
        this.filteredApplications = [];
        this.selectedApplications = new Set();
        
        this.currentPage = 1;
        this.currentSort = { field: 'createdAt', direction: 'desc' };
        this.currentFilters = {};
        this.searchQuery = '';
        
        this.isInitialized = false;
    }

    async init() {
        try {
            this.applications = this.applicationCore.getAllApplications();
            this.filteredApplications = [...this.applications];
            
            await this.render();
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ ApplicationList initialized');
        } catch (error) {
            console.error('❌ ApplicationList initialization failed:', error);
            throw error;
        }
    }

    async render() {
        this.container.innerHTML = this.getHTML();
        this.applyFiltersAndSort();
        this.renderApplicationItems();
        this.updateSummary();
    }

    getHTML() {
        return `
            <div class="application-list">
                <!-- List Header -->
                <div class="list-header">
                    <div class="list-title">
                        <h3>📋 Bewerbungen</h3>
                        <span class="list-count" id="listCount">${this.applications.length} Bewerbungen</span>
                    </div>
                    <div class="list-actions">
                        <button class="btn-icon" onclick="applicationList.refresh()" title="Aktualisieren">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-icon" onclick="applicationList.showFilters()" title="Filter">
                            <i class="fas fa-filter"></i>
                        </button>
                        <button class="btn-icon" onclick="applicationList.exportSelected()" title="Export">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>

                <!-- Search and Filter Bar -->
                <div class="list-controls">
                    ${this.getSearchHTML()}
                    ${this.getFilterHTML()}
                    ${this.getBulkActionsHTML()}
                </div>

                <!-- Sorting Header -->
                <div class="sort-header">
                    <div class="sort-item" data-field="company" onclick="applicationList.sort('company')">
                        <span>Unternehmen</span>
                        <i class="fas fa-sort"></i>
                    </div>
                    <div class="sort-item" data-field="position" onclick="applicationList.sort('position')">
                        <span>Position</span>
                        <i class="fas fa-sort"></i>
                    </div>
                    <div class="sort-item" data-field="status" onclick="applicationList.sort('status')">
                        <span>Status</span>
                        <i class="fas fa-sort"></i>
                    </div>
                    <div class="sort-item" data-field="createdAt" onclick="applicationList.sort('createdAt')">
                        <span>Bewerbungsdatum</span>
                        <i class="fas fa-sort-down"></i>
                    </div>
                    <div class="sort-actions">
                        <span>Aktionen</span>
                    </div>
                </div>

                <!-- Application Items Container -->
                <div class="applications-container" id="applicationsContainer">
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Bewerbungen werden geladen...</span>
                    </div>
                </div>

                <!-- Pagination -->
                ${this.options.enablePagination ? this.getPaginationHTML() : ''}
            </div>
        `;
    }

    getSearchHTML() {
        if (!this.options.enableSearch) return '';
        
        return `
            <div class="search-container">
                <div class="search-input-group">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="Suchen nach Unternehmen, Position oder Notizen..."
                        id="searchInput"
                        value="${this.searchQuery}"
                    >
                    ${this.searchQuery ? '<button class="search-clear" onclick="applicationList.clearSearch()"><i class="fas fa-times"></i></button>' : ''}
                </div>
            </div>
        `;
    }

    getFilterHTML() {
        if (!this.options.enableFilters) return '';
        
        return `
            <div class="filter-container" id="filterContainer">
                <div class="filter-tabs">
                    <button class="filter-tab ${this.currentFilters.status === undefined ? 'active' : ''}" 
                            data-status="" onclick="applicationList.filterByStatus('')">
                        Alle (${this.applications.length})
                    </button>
                    <button class="filter-tab ${this.currentFilters.status === 'pending' ? 'active' : ''}" 
                            data-status="pending" onclick="applicationList.filterByStatus('pending')">
                        Ausstehend (${this.getApplicationsByStatus('pending').length})
                    </button>
                    <button class="filter-tab ${this.currentFilters.status === 'interview' ? 'active' : ''}" 
                            data-status="interview" onclick="applicationList.filterByStatus('interview')">
                        Interview (${this.getApplicationsByStatus('interview').length})
                    </button>
                    <button class="filter-tab ${this.currentFilters.status === 'offer' ? 'active' : ''}" 
                            data-status="offer" onclick="applicationList.filterByStatus('offer')">
                        Zusage (${this.getApplicationsByStatus('offer').length})
                    </button>
                    <button class="filter-tab ${this.currentFilters.status === 'rejected' ? 'active' : ''}" 
                            data-status="rejected" onclick="applicationList.filterByStatus('rejected')">
                        Absage (${this.getApplicationsByStatus('rejected').length})
                    </button>
                </div>
                
                <div class="advanced-filters" id="advancedFilters" style="display: none;">
                    <div class="filter-group">
                        <label>Zeitraum:</label>
                        <select id="dateFilter" onchange="applicationList.applyDateFilter(this.value)">
                            <option value="">Alle</option>
                            <option value="week">Letzte Woche</option>
                            <option value="month">Letzter Monat</option>
                            <option value="quarter">Letztes Quartal</option>
                            <option value="year">Letztes Jahr</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Gehalt:</label>
                        <select id="salaryFilter" onchange="applicationList.applySalaryFilter(this.value)">
                            <option value="">Alle</option>
                            <option value="0-50000">bis 50k</option>
                            <option value="50000-70000">50k-70k</option>
                            <option value="70000-100000">70k-100k</option>
                            <option value="100000+">100k+</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    getBulkActionsHTML() {
        if (!this.options.enableBulkActions) return '';
        
        return `
            <div class="bulk-actions" id="bulkActions" style="display: none;">
                <div class="bulk-info">
                    <span id="selectedCount">0</span> Bewerbungen ausgewählt
                </div>
                <div class="bulk-buttons">
                    <button class="bulk-btn" onclick="applicationList.bulkUpdateStatus()">
                        <i class="fas fa-edit"></i>
                        Status ändern
                    </button>
                    <button class="bulk-btn" onclick="applicationList.bulkExport()">
                        <i class="fas fa-download"></i>
                        Export
                    </button>
                    <button class="bulk-btn danger" onclick="applicationList.bulkDelete()">
                        <i class="fas fa-trash"></i>
                        Löschen
                    </button>
                </div>
            </div>
        `;
    }

    getPaginationHTML() {
        const totalPages = Math.ceil(this.filteredApplications.length / this.options.pageSize);
        
        if (totalPages <= 1) return '';
        
        return `
            <div class="pagination" id="pagination">
                <button class="page-btn" onclick="applicationList.goToPage(1)" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="page-btn" onclick="applicationList.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-left"></i>
                </button>
                
                <span class="page-info">
                    Seite ${this.currentPage} von ${totalPages}
                </span>
                
                <button class="page-btn" onclick="applicationList.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-right"></i>
                </button>
                <button class="page-btn" onclick="applicationList.goToPage(${totalPages})" ${this.currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        `;
    }

    renderApplicationItems() {
        const container = this.container.querySelector('#applicationsContainer');
        
        if (this.filteredApplications.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const startIndex = this.options.enablePagination 
            ? (this.currentPage - 1) * this.options.pageSize
            : 0;
        const endIndex = this.options.enablePagination 
            ? startIndex + this.options.pageSize
            : this.filteredApplications.length;
        
        const visibleApplications = this.filteredApplications.slice(startIndex, endIndex);
        
        container.innerHTML = visibleApplications.map(app => this.getApplicationItemHTML(app)).join('');
        
        // Update pagination if enabled
        if (this.options.enablePagination) {
            this.updatePagination();
        }
    }

    getApplicationItemHTML(application) {
        return `
            <div class="application-item ${this.selectedApplications.has(application.id) ? 'selected' : ''}" 
                 data-id="${application.id}"
                 onclick="applicationList.selectApplication('${application.id}', event)">
                
                <div class="item-checkbox">
                    <input type="checkbox" 
                           ${this.selectedApplications.has(application.id) ? 'checked' : ''} 
                           onclick="applicationList.toggleSelection('${application.id}', event)">
                </div>
                
                <div class="item-main">
                    <div class="item-header">
                        <div class="company-name">
                            <strong>${this.escapeHtml(application.company)}</strong>
                            ${application.location ? `<span class="location">📍 ${this.escapeHtml(application.location)}</span>` : ''}
                        </div>
                        <div class="status-badge status-${application.status}">
                            <i class="fas ${this.getStatusIcon(application.status)}"></i>
                            <span>${this.getStatusText(application.status)}</span>
                        </div>
                    </div>
                    
                    <div class="item-content">
                        <div class="position-title">${this.escapeHtml(application.position)}</div>
                        ${application.salary ? `<div class="salary">💰 ${this.formatSalary(application.salary)}</div>` : ''}
                        ${application.notes ? `<div class="notes">${this.truncateText(this.escapeHtml(application.notes), 100)}</div>` : ''}
                    </div>
                    
                    <div class="item-footer">
                        <div class="item-dates">
                            <span class="applied-date">Beworben: ${this.formatDate(application.createdAt)}</span>
                            ${application.responseDate ? `<span class="response-date">Antwort: ${this.formatDate(application.responseDate)}</span>` : ''}
                        </div>
                        <div class="item-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.calculateProgress(application)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="item-actions">
                    <button class="action-btn view" onclick="applicationList.viewApplication('${application.id}', event)" title="Ansehen">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="applicationList.editApplication('${application.id}', event)" title="Bearbeiten">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn share" onclick="applicationList.shareApplication('${application.id}', event)" title="Teilen">
                        <i class="fas fa-share"></i>
                    </button>
                    <div class="action-dropdown">
                        <button class="action-btn dropdown-trigger" onclick="applicationList.toggleDropdown('${application.id}', event)">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu" id="dropdown-${application.id}">
                            <button class="dropdown-item" onclick="applicationList.duplicateApplication('${application.id}')">
                                <i class="fas fa-copy"></i>
                                Duplizieren
                            </button>
                            <button class="dropdown-item" onclick="applicationList.archiveApplication('${application.id}')">
                                <i class="fas fa-archive"></i>
                                Archivieren
                            </button>
                            <hr class="dropdown-divider">
                            <button class="dropdown-item danger" onclick="applicationList.deleteApplication('${application.id}')">
                                <i class="fas fa-trash"></i>
                                Löschen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getEmptyStateHTML() {
        if (this.searchQuery || Object.keys(this.currentFilters).length > 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-search empty-icon"></i>
                    <h4>Keine Ergebnisse gefunden</h4>
                    <p>Versuchen Sie andere Suchbegriffe oder entfernen Sie Filter</p>
                    <button class="btn btn-secondary" onclick="applicationList.clearFilters()">
                        Filter zurücksetzen
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="empty-state">
                <i class="fas fa-briefcase empty-icon"></i>
                <h4>Noch keine Bewerbungen</h4>
                <p>Erstellen Sie Ihre erste Bewerbung um zu beginnen</p>
                <button class="btn btn-primary" onclick="applicationManager.showAddApplicationModal()">
                    <i class="fas fa-plus"></i>
                    Erste Bewerbung erstellen
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Search input
        const searchInput = this.container.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.search(e.target.value);
            }, 300));
        }

        // Click outside to close dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.action-dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // Keyboard shortcuts
        this.container.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Escape':
                    this.clearSelection();
                    break;
                case 'a':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.selectAll();
                    }
                    break;
            }
        });
    }

    // 🔍 Search & Filter
    search(query) {
        this.searchQuery = query.trim();
        this.applyFiltersAndSort();
        this.renderApplicationItems();
        this.updateSummary();
    }

    clearSearch() {
        this.searchQuery = '';
        const searchInput = this.container.querySelector('#searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        this.applyFiltersAndSort();
        this.renderApplicationItems();
        this.updateSummary();
    }

    filterByStatus(status) {
        this.currentFilters.status = status || undefined;
        this.currentPage = 1;
        
        // Update active filter tab
        this.container.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        this.container.querySelector(`[data-status="${status}"]`)?.classList.add('active');
        
        this.applyFiltersAndSort();
        this.renderApplicationItems();
        this.updateSummary();
    }

    applyFiltersAndSort() {
        let filtered = [...this.applications];
        
        // Apply search
        if (this.searchQuery) {
            filtered = this.applicationCore.searchApplications(this.searchQuery);
        }
        
        // Apply status filter
        if (this.currentFilters.status) {
            filtered = filtered.filter(app => app.status === this.currentFilters.status);
        }
        
        // Apply date filter
        if (this.currentFilters.dateRange) {
            filtered = this.filterByDateRange(filtered, this.currentFilters.dateRange);
        }
        
        // Apply salary filter
        if (this.currentFilters.salaryRange) {
            filtered = this.filterBySalaryRange(filtered, this.currentFilters.salaryRange);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            return this.compareValues(
                a[this.currentSort.field],
                b[this.currentSort.field],
                this.currentSort.direction
            );
        });
        
        this.filteredApplications = filtered;
    }

    // 📊 Sorting
    sort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        this.updateSortHeader();
        this.applyFiltersAndSort();
        this.renderApplicationItems();
    }

    updateSortHeader() {
        this.container.querySelectorAll('.sort-item i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });
        
        const currentSortItem = this.container.querySelector(`[data-field="${this.currentSort.field}"] i`);
        if (currentSortItem) {
            currentSortItem.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'}`;
        }
    }

    compareValues(a, b, direction) {
        // Handle null/undefined values
        if (a == null && b == null) return 0;
        if (a == null) return direction === 'asc' ? -1 : 1;
        if (b == null) return direction === 'asc' ? 1 : -1;
        
        // Date comparison
        if (this.currentSort.field.includes('Date') || this.currentSort.field === 'createdAt') {
            a = new Date(a);
            b = new Date(b);
        }
        
        // String comparison
        if (typeof a === 'string' && typeof b === 'string') {
            a = a.toLowerCase();
            b = b.toLowerCase();
        }
        
        let result = a < b ? -1 : a > b ? 1 : 0;
        return direction === 'desc' ? -result : result;
    }

    // 🎯 Selection Management
    toggleSelection(applicationId, event) {
        event.stopPropagation();
        
        if (this.selectedApplications.has(applicationId)) {
            this.selectedApplications.delete(applicationId);
        } else {
            this.selectedApplications.add(applicationId);
        }
        
        this.updateSelectionUI();
    }

    selectAll() {
        this.filteredApplications.forEach(app => {
            this.selectedApplications.add(app.id);
        });
        this.updateSelectionUI();
    }

    clearSelection() {
        this.selectedApplications.clear();
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const selectedCount = this.selectedApplications.size;
        const bulkActions = this.container.querySelector('#bulkActions');
        const selectedCountElement = this.container.querySelector('#selectedCount');
        
        if (bulkActions) {
            bulkActions.style.display = selectedCount > 0 ? 'flex' : 'none';
        }
        
        if (selectedCountElement) {
            selectedCountElement.textContent = selectedCount;
        }
        
        // Update checkboxes and item styling
        this.container.querySelectorAll('.application-item').forEach(item => {
            const id = item.dataset.id;
            const checkbox = item.querySelector('input[type="checkbox"]');
            const isSelected = this.selectedApplications.has(id);
            
            checkbox.checked = isSelected;
            item.classList.toggle('selected', isSelected);
        });
    }

    // 🔧 Utility Methods
    getApplicationsByStatus(status) {
        return this.applications.filter(app => app.status === status);
    }

    getStatusIcon(status) {
        const icons = {
            pending: 'fa-clock',
            interview: 'fa-users',
            offer: 'fa-handshake',
            rejected: 'fa-times',
            withdrawn: 'fa-ban'
        };
        return icons[status] || 'fa-question';
    }

    getStatusText(status) {
        const texts = {
            pending: 'Ausstehend',
            interview: 'Interview',
            offer: 'Zusage',
            rejected: 'Absage',
            withdrawn: 'Zurückgezogen'
        };
        return texts[status] || status;
    }

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('de-DE');
    }

    formatSalary(salary) {
        if (!salary) return '';
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(salary);
    }

    calculateProgress(application) {
        const statusWeights = {
            pending: 25,
            interview: 60,
            offer: 100,
            rejected: 0,
            withdrawn: 0
        };
        return statusWeights[application.status] || 0;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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

    updateSummary() {
        const countElement = this.container.querySelector('#listCount');
        if (countElement) {
            countElement.textContent = `${this.filteredApplications.length} von ${this.applications.length} Bewerbungen`;
        }
    }

    async refresh() {
        this.applications = this.applicationCore.getAllApplications();
        this.applyFiltersAndSort();
        this.renderApplicationItems();
        this.updateSummary();
    }

    destroy() {
        this.selectedApplications.clear();
        this.container.innerHTML = '';
    }
}

// Make globally available for onclick handlers
window.applicationList = null;
export function setGlobalApplicationList(instance) {
    window.applicationList = instance;
}
