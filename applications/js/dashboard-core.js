/**
 * BEWERBUNGSMANAGER DASHBOARD - CORE
 * Tab Management, State Management, Authentication
 */

// ═══════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const DashboardState = {
    // User Profile
    profile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        currentJob: '',
        experience: '',
        summary: '',
        skills: []
    },
    
    // Applications
    applications: [],
    
    // Stats
    stats: {
        total: 0,
        pending: 0,
        interviews: 0,
        offers: 0,
        rejected: 0,
        successRate: 0
    },
    
    // Quick Apply State
    quickApply: {
        jobData: null,
        tone: 'formal',
        length: 'medium',
        generatedText: ''
    },
    
    // Current Tab
    currentTab: 'quick',
    
    // Initialized
    initialized: false
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function initDashboard() {
    console.log('🚀 Initializing Bewerbungsmanager Dashboard...');
    
    // Load saved data
    loadSavedState();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup authentication
    setupAuth();
    
    // Update UI
    updateStatsBar();
    updateApplicationsList();
    updateProfileForm();
    
    // Check URL hash for tab
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`tab-${hash}`)) {
        showTab(hash);
    }
    
    // Initialize Quick Apply
    if (typeof initQuickApply === 'function') {
        initQuickApply();
    }
    
    DashboardState.initialized = true;
    console.log('✅ Dashboard initialized');
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════════════════

function loadSavedState() {
    try {
        // Load profile
        const savedProfile = localStorage.getItem('bewerbungsmanager_profile');
        if (savedProfile) {
            DashboardState.profile = JSON.parse(savedProfile);
        }
        
        // Load applications
        const savedApplications = localStorage.getItem('bewerbungsmanager_applications');
        if (savedApplications) {
            DashboardState.applications = JSON.parse(savedApplications);
        }
        
        // Calculate stats
        calculateStats();
        
        console.log('📂 State loaded from localStorage');
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

function saveState() {
    try {
        localStorage.setItem('bewerbungsmanager_profile', JSON.stringify(DashboardState.profile));
        localStorage.setItem('bewerbungsmanager_applications', JSON.stringify(DashboardState.applications));
        console.log('💾 State saved to localStorage');
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function calculateStats() {
    const apps = DashboardState.applications;
    DashboardState.stats = {
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        interviews: apps.filter(a => a.status === 'interview').length,
        offers: apps.filter(a => a.status === 'offer').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
        successRate: apps.length > 0 
            ? Math.round((apps.filter(a => a.status === 'offer').length / apps.length) * 100) 
            : 0
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

function showTab(tabId) {
    // Update URL hash
    window.location.hash = tabId;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
    
    DashboardState.currentTab = tabId;
    
    // Trigger tab-specific init
    if (tabId === 'tracking') {
        updateApplicationsList();
    } else if (tabId === 'profile') {
        updateProfileForm();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS BAR
// ═══════════════════════════════════════════════════════════════════════════

function updateStatsBar() {
    const stats = DashboardState.stats;
    
    const elements = {
        statTotal: stats.total,
        statPending: stats.pending,
        statInterviews: stats.interviews,
        statSuccess: `${stats.successRate}%`
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
            // Animate number change
            el.classList.add('updated');
            setTimeout(() => el.classList.remove('updated'), 300);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICATIONS LIST (Tracking Tab)
// ═══════════════════════════════════════════════════════════════════════════

function updateApplicationsList(filter = 'all') {
    const listContainer = document.getElementById('applicationsList');
    const emptyState = document.getElementById('emptyState');
    
    if (!listContainer) return;
    
    // Filter applications
    let apps = [...DashboardState.applications];
    if (filter !== 'all') {
        apps = apps.filter(a => a.status === filter);
    }
    
    // Sort by date (newest first)
    apps.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update filter counts
    updateFilterCounts();
    
    // Show empty state or list
    if (apps.length === 0) {
        emptyState.style.display = 'block';
        // Remove any existing cards
        listContainer.querySelectorAll('.application-card').forEach(card => card.remove());
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Generate HTML
    const html = apps.map(app => `
        <div class="application-card" data-id="${app.id}">
            <div class="status-indicator ${app.status}"></div>
            <div class="card-content">
                <div class="job-title">${escapeHtml(app.position)}</div>
                <div class="company-name">${escapeHtml(app.company)}</div>
            </div>
            <div class="card-meta">
                <span><i class="fas fa-calendar"></i> ${formatDate(app.date)}</span>
                <span><i class="fas fa-tag"></i> ${getStatusLabel(app.status)}</span>
            </div>
            <div class="card-actions">
                <button onclick="editApplication('${app.id}')" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteApplication('${app.id}')" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Clear and insert (keep empty state)
    listContainer.querySelectorAll('.application-card').forEach(card => card.remove());
    listContainer.insertAdjacentHTML('afterbegin', html);
}

function updateFilterCounts() {
    const apps = DashboardState.applications;
    
    const counts = {
        filterAll: apps.length,
        filterPending: apps.filter(a => a.status === 'pending').length,
        filterInterview: apps.filter(a => a.status === 'interview').length,
        filterOffer: apps.filter(a => a.status === 'offer').length,
        filterRejected: apps.filter(a => a.status === 'rejected').length
    };
    
    Object.entries(counts).forEach(([id, count]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    });
}

function filterApplications(filter) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    updateApplicationsList(filter);
}

function getStatusLabel(status) {
    const labels = {
        pending: 'Offen',
        interview: 'Interview',
        offer: 'Angebot',
        rejected: 'Absage'
    };
    return labels[status] || status;
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION CRUD
// ═══════════════════════════════════════════════════════════════════════════

function showAddApplicationModal() {
    const modal = document.getElementById('addApplicationModal');
    modal.classList.remove('hidden');
    
    // Set default date to today
    document.getElementById('newAppDate').value = new Date().toISOString().split('T')[0];
    
    // Focus first input
    document.getElementById('newAppPosition').focus();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function addApplication(event) {
    event.preventDefault();
    
    const newApp = {
        id: generateId(),
        position: document.getElementById('newAppPosition').value.trim(),
        company: document.getElementById('newAppCompany').value.trim(),
        date: document.getElementById('newAppDate').value || new Date().toISOString().split('T')[0],
        status: document.getElementById('newAppStatus').value,
        notes: document.getElementById('newAppNotes').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    DashboardState.applications.unshift(newApp);
    calculateStats();
    saveState();
    updateStatsBar();
    updateApplicationsList();
    
    closeModal('addApplicationModal');
    showToast('Bewerbung hinzugefügt!', 'success');
    
    // Reset form
    event.target.reset();
}

function deleteApplication(id) {
    if (!confirm('Diese Bewerbung wirklich löschen?')) return;
    
    DashboardState.applications = DashboardState.applications.filter(a => a.id !== id);
    calculateStats();
    saveState();
    updateStatsBar();
    updateApplicationsList();
    
    showToast('Bewerbung gelöscht', 'info');
}

function editApplication(id) {
    // TODO: Implement edit modal
    showToast('Bearbeiten kommt bald!', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function updateProfileForm() {
    const profile = DashboardState.profile;
    
    // Fill form fields
    const fields = {
        profileFirstName: profile.firstName,
        profileLastName: profile.lastName,
        profileEmail: profile.email,
        profilePhone: profile.phone,
        profileLocation: profile.location,
        profileCurrentJob: profile.currentJob,
        profileExperience: profile.experience,
        profileSummary: profile.summary,
        profileSkills: profile.skills.join(', ')
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    });
    
    // Update skills tags
    updateSkillsTags();
}

function updateSkillsTags() {
    const container = document.getElementById('skillsTags');
    if (!container) return;
    
    const skills = DashboardState.profile.skills;
    
    if (skills.length === 0) {
        container.innerHTML = '<span class="skill-tag empty">Keine Skills hinzugefügt</span>';
        return;
    }
    
    container.innerHTML = skills.map(skill => 
        `<span class="skill-tag">${escapeHtml(skill)}</span>`
    ).join('');
}

function saveProfile(event) {
    event.preventDefault();
    
    // Collect form data
    DashboardState.profile = {
        firstName: document.getElementById('profileFirstName').value.trim(),
        lastName: document.getElementById('profileLastName').value.trim(),
        email: document.getElementById('profileEmail').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        location: document.getElementById('profileLocation').value.trim(),
        currentJob: document.getElementById('profileCurrentJob').value.trim(),
        experience: document.getElementById('profileExperience').value,
        summary: document.getElementById('profileSummary').value.trim(),
        skills: document.getElementById('profileSkills').value
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
    };
    
    saveState();
    updateSkillsTags();
    showToast('Profil gespeichert!', 'success');
}

function resetProfile() {
    if (!confirm('Alle Profildaten zurücksetzen?')) return;
    
    DashboardState.profile = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        currentJob: '',
        experience: '',
        summary: '',
        skills: []
    };
    
    saveState();
    updateProfileForm();
    showToast('Profil zurückgesetzt', 'info');
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════════════════════════════════════

function setupMobileMenu() {
    const hamburger = document.getElementById('mobileHamburger');
    const overlay = document.getElementById('mobileMenuOverlay');
    const menu = document.getElementById('mobileMenuFullscreen');
    
    if (!hamburger || !overlay || !menu) return;
    
    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        overlay.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    };
    
    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════

function setupAuth() {
    const authBtn = document.getElementById('authButton');
    const mobileAuthBtn = document.getElementById('mobileAuthButton');
    
    // Check if already logged in (via real-user-auth.js)
    if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
        updateAuthUI(true);
    }
    
    // Auth button click handlers
    [authBtn, mobileAuthBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
                    toggleUserDropdown();
                } else {
                    if (window.realUserAuth) {
                        window.realUserAuth.showLoginModal();
                    } else {
                        showToast('Login-System wird geladen...', 'info');
                    }
                }
            });
        }
    });
}

function updateAuthUI(isLoggedIn) {
    const authBtn = document.getElementById('authButton');
    const authText = document.getElementById('authButtonText');
    const dropdown = document.getElementById('userDropdown');
    
    if (isLoggedIn && window.realUserAuth) {
        const user = window.realUserAuth.getCurrentUser();
        if (user) {
            authText.textContent = user.firstName || user.email.split('@')[0];
            document.getElementById('userName').textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Benutzer';
            document.getElementById('userEmail').textContent = user.email;
            
            // Pre-fill profile from auth
            if (!DashboardState.profile.email) {
                DashboardState.profile.email = user.email;
                DashboardState.profile.firstName = user.firstName || '';
                DashboardState.profile.lastName = user.lastName || '';
                saveState();
            }
        }
    } else {
        authText.textContent = 'Anmelden';
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function logout() {
    if (window.realUserAuth) {
        window.realUserAuth.logout();
    }
    updateAuthUI(false);
    showToast('Abgemeldet', 'info');
}

// Close dropdown on click outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    const authBtn = document.getElementById('authButton');
    
    if (dropdown && authBtn && !authBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: 'check-circle',
        error: 'times-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    }[type] || 'info-circle';
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${escapeHtml(message)}`;
    
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FOR OTHER MODULES
// ═══════════════════════════════════════════════════════════════════════════

window.DashboardState = DashboardState;
window.showTab = showTab;
window.showToast = showToast;
window.saveState = saveState;
window.updateStatsBar = updateStatsBar;
window.updateApplicationsList = updateApplicationsList;

