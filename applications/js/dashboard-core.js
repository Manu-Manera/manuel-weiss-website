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

async function initDashboard() {
    console.log('🚀 Initializing Bewerbungsmanager Dashboard...');
    
    // Load saved data (inkl. AWS-Profil - asynchron)
    await loadSavedState();
    
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
    
    // Initialize Quick Apply (nachdem Profil geladen wurde)
    if (typeof initQuickApply === 'function') {
        await initQuickApply();
    }
    
    // Nochmals Quick-Apply-Felder füllen (falls initQuickApply sie zurückgesetzt hat)
    setTimeout(() => prefillQuickApplyFromProfile(), 500);
    
    DashboardState.initialized = true;
    console.log('✅ Dashboard initialized');
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════════════════

async function loadSavedState() {
    try {
        // Zuerst: Lade lokale Daten als Fallback
        const savedProfile = localStorage.getItem('bewerbungsmanager_profile');
        if (savedProfile) {
            DashboardState.profile = JSON.parse(savedProfile);
        }
        
        const savedApplications = localStorage.getItem('bewerbungsmanager_applications');
        if (savedApplications) {
            DashboardState.applications = JSON.parse(savedApplications);
        }
        
        // Dann: Versuche AWS-Profil zu laden (überschreibt lokale Daten)
        await loadAWSProfile();
        
        // Calculate stats
        calculateStats();
        
        console.log('📂 State loaded');
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

/**
 * Lädt das Benutzerprofil aus AWS und synchronisiert es mit DashboardState
 */
async function loadAWSProfile() {
    try {
        // Prüfe ob User angemeldet ist
        const auth = window.awsAuth || window.realUserAuth;
        if (!auth || typeof auth.isLoggedIn !== 'function' || !auth.isLoggedIn()) {
            console.log('ℹ️ Kein angemeldeter User - überspringe AWS-Profil');
            return;
        }
        
        // Warte auf awsProfileAPI
        if (!window.awsProfileAPI) {
            console.log('⏳ Warte auf awsProfileAPI...');
            await new Promise((resolve) => {
                let attempts = 0;
                const check = setInterval(() => {
                    attempts++;
                    if (window.awsProfileAPI || attempts > 30) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
            });
        }
        
        if (!window.awsProfileAPI?.isInitialized) {
            console.log('⏳ Warte auf awsProfileAPI Initialisierung...');
            await new Promise((resolve) => {
                let attempts = 0;
                const check = setInterval(() => {
                    attempts++;
                    if (window.awsProfileAPI?.isInitialized || attempts > 30) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
            });
        }
        
        if (!window.awsProfileAPI?.isInitialized) {
            console.warn('⚠️ awsProfileAPI nicht verfügbar');
            return;
        }
        
        console.log('📡 Lade Profil aus AWS...');
        const awsProfile = await window.awsProfileAPI.loadProfile();
        
        if (awsProfile) {
            console.log('✅ AWS-Profil geladen:', awsProfile);
            
            // Konvertiere AWS-Profil-Format zu DashboardState-Format
            DashboardState.profile = {
                firstName: awsProfile.firstName || awsProfile.personal?.firstName || '',
                lastName: awsProfile.lastName || awsProfile.personal?.lastName || '',
                email: awsProfile.email || awsProfile.personal?.email || '',
                phone: awsProfile.phone || awsProfile.personal?.phone || '',
                location: awsProfile.location || awsProfile.personal?.location || '',
                currentJob: awsProfile.currentPosition || awsProfile.professional?.currentPosition || '',
                experience: awsProfile.experience || awsProfile.professional?.experience || '',
                summary: awsProfile.summary || awsProfile.professional?.summary || '',
                skills: awsProfile.skills || awsProfile.professional?.skills || []
            };
            
            // Speichere auch lokal für Offline-Zugriff
            localStorage.setItem('bewerbungsmanager_profile', JSON.stringify(DashboardState.profile));
            
            // Aktualisiere Quick-Apply-Felder
            prefillQuickApplyFromProfile();
            
            console.log('✅ DashboardState.profile aktualisiert:', DashboardState.profile);
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden des AWS-Profils:', error);
    }
}

/**
 * Füllt die Quick-Apply-Felder mit Profildaten vor
 */
function prefillQuickApplyFromProfile() {
    const profile = DashboardState.profile;
    if (!profile) return;
    
    // Name
    const nameField = document.getElementById('quickName') || document.getElementById('quickUserName');
    if (nameField && !nameField.value) {
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
        nameField.value = fullName || '';
    }
    
    // Position
    const positionField = document.getElementById('quickPosition') || document.getElementById('quickUserPosition');
    if (positionField && !positionField.value) {
        positionField.value = profile.currentJob || '';
    }
    
    // Erfahrung
    const experienceField = document.getElementById('quickExperience');
    if (experienceField && !experienceField.value) {
        experienceField.value = profile.experience || '';
    }
    
    // Standort
    const locationField = document.getElementById('quickLocation') || document.getElementById('quickUserLocation');
    if (locationField && !locationField.value) {
        locationField.value = profile.location || '';
    }
    
    // Skills
    const skillsField = document.getElementById('quickSkills') || document.getElementById('quickUserSkills');
    if (skillsField && !skillsField.value) {
        const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills;
        skillsField.value = skills || '';
    }
    
    console.log('📝 Quick-Apply-Felder mit Profildaten vorausgefüllt');
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
        // Sync vom Lebenslauf zum Profil bei Tab-Wechsel
        if (typeof syncProfileToResume === 'function') syncProfileToResume();
    } else if (tabId === 'resume') {
        initResumeTab();
        // Sync vom Profil zum Lebenslauf bei Tab-Wechsel
        if (typeof syncResumeToProfile === 'function') syncResumeToProfile();
    } else if (tabId === 'cover') {
        // Anschreiben-Liste neu laden
        if (typeof loadCoverLetters === 'function') {
            loadCoverLetters();
        } else if (window.loadCoverLetters) {
            window.loadCoverLetters();
        }
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
                <div class="company-name">
                    ${escapeHtml(app.company)}
                    ${app.location ? `<span class="company-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(app.location)}</span>` : ''}
                </div>
                ${app.url ? `<a href="${escapeHtml(app.url)}" target="_blank" class="job-link"><i class="fas fa-external-link-alt"></i> Stellenanzeige</a>` : ''}
            </div>
            <div class="card-meta">
                <span><i class="fas fa-calendar"></i> ${formatDate(app.date)}</span>
                <select class="status-select status-${app.status}" onchange="changeStatus('${app.id}', this.value)">
                    <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>📤 Offen</option>
                    <option value="interview" ${app.status === 'interview' ? 'selected' : ''}>🗓 Interview</option>
                    <option value="offer" ${app.status === 'offer' ? 'selected' : ''}>🎉 Angebot</option>
                    <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>❌ Absage</option>
                </select>
            </div>
            ${app.notes ? `<div class="card-notes"><i class="fas fa-sticky-note"></i> ${escapeHtml(app.notes).substring(0, 50)}${app.notes.length > 50 ? '...' : ''}</div>` : ''}
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
        location: document.getElementById('newAppLocation')?.value.trim() || '',
        date: document.getElementById('newAppDate').value || new Date().toISOString().split('T')[0],
        status: document.getElementById('newAppStatus').value,
        url: document.getElementById('newAppUrl')?.value.trim() || '',
        notes: document.getElementById('newAppNotes').value.trim(),
        coverLetter: '',
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
    const app = DashboardState.applications.find(a => a.id === id);
    if (!app) return;
    
    // Fill edit form
    document.getElementById('editAppId').value = app.id;
    document.getElementById('editAppPosition').value = app.position || '';
    document.getElementById('editAppCompany').value = app.company || '';
    document.getElementById('editAppLocation').value = app.location || '';
    document.getElementById('editAppDate').value = app.date || '';
    document.getElementById('editAppStatus').value = app.status || 'pending';
    document.getElementById('editAppUrl').value = app.url || '';
    document.getElementById('editAppNotes').value = app.notes || '';
    document.getElementById('editAppCoverLetter').value = app.coverLetter || '';
    
    openModal('editApplicationModal');
}

function updateApplication(event) {
    event.preventDefault();
    
    const id = document.getElementById('editAppId').value;
    const appIndex = DashboardState.applications.findIndex(a => a.id === id);
    
    if (appIndex === -1) {
        showToast('Bewerbung nicht gefunden', 'error');
        return;
    }
    
    const oldStatus = DashboardState.applications[appIndex].status;
    const newStatus = document.getElementById('editAppStatus').value;
    
    DashboardState.applications[appIndex] = {
        ...DashboardState.applications[appIndex],
        position: document.getElementById('editAppPosition').value.trim(),
        company: document.getElementById('editAppCompany').value.trim(),
        location: document.getElementById('editAppLocation').value.trim(),
        date: document.getElementById('editAppDate').value,
        status: newStatus,
        url: document.getElementById('editAppUrl').value.trim(),
        notes: document.getElementById('editAppNotes').value.trim(),
        coverLetter: document.getElementById('editAppCoverLetter').value,
        updatedAt: new Date().toISOString()
    };
    
    calculateStats();
    saveState();
    updateStatsBar();
    updateApplicationsList();
    closeModal('editApplicationModal');
    
    // Special messages for status changes
    if (oldStatus !== newStatus) {
        if (newStatus === 'interview') {
            showToast('🎉 Glückwunsch zum Interview!', 'success');
        } else if (newStatus === 'offer') {
            showToast('🎊 Großartig - ein Angebot!', 'success');
        } else {
            showToast('Bewerbung aktualisiert', 'success');
        }
    } else {
        showToast('Bewerbung aktualisiert', 'success');
    }
}

function changeStatus(id, newStatus) {
    const app = DashboardState.applications.find(a => a.id === id);
    if (!app) return;
    
    const oldStatus = app.status;
    app.status = newStatus;
    app.updatedAt = new Date().toISOString();
    
    calculateStats();
    saveState();
    updateStatsBar();
    updateApplicationsList();
    
    // Celebrate milestones
    if (newStatus === 'interview' && oldStatus !== 'interview') {
        showToast('🎉 Interview-Einladung! Viel Erfolg!', 'success');
    } else if (newStatus === 'offer' && oldStatus !== 'offer') {
        showToast('🎊 Herzlichen Glückwunsch zum Angebot!', 'success');
    }
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
// AUTHENTICATION (Updated for unified-aws-auth.js)
// ═══════════════════════════════════════════════════════════════════════════

function setupAuth() {
    // Auth is now handled in dashboard.html with setupAuthUI()
    // This function remains for backwards compatibility
    
    // Check auth status and update UI
    checkAuthStatus();
    
    // Listen for auth changes
    window.addEventListener('authStateChanged', () => {
        checkAuthStatus();
    });
}

function checkAuthStatus() {
    const isLoggedIn = window.awsAuth && window.awsAuth.isLoggedIn();
    
    if (isLoggedIn) {
        const userData = window.awsAuth.getUserDataFromToken();
        if (userData) {
            // Pre-fill profile from auth
            if (!DashboardState.profile.email) {
                DashboardState.profile.email = userData.email || '';
                DashboardState.profile.firstName = userData.name?.split(' ')[0] || '';
                DashboardState.profile.lastName = userData.name?.split(' ').slice(1).join(' ') || '';
                saveState();
            }
        }
    }
    
    updateAuthUI(isLoggedIn);
}

function updateAuthUI(isLoggedIn) {
    // Main auth UI is handled in dashboard.html's setupAuthUI()
    // This function handles dashboard-specific auth state updates
    
    if (isLoggedIn && window.awsAuth) {
        const userData = window.awsAuth.getUserDataFromToken();
        if (userData) {
            // Update profile display if on profile tab
            const profileDisplay = document.getElementById('profileDisplay');
            if (profileDisplay) {
                // Update any profile-specific elements
            }
        }
    }
    
    // Update API status display if it exists
    if (typeof updateAPIStatusDisplay === 'function') {
        updateAPIStatusDisplay();
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// closeMobileMenu - exposed globally for auth buttons
function closeMobileMenu() {
    const hamburger = document.getElementById('mobileHamburger');
    const overlay = document.getElementById('mobileMenuOverlay');
    const menu = document.getElementById('mobileMenuFullscreen');
    
    if (hamburger) hamburger.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (menu) menu.classList.remove('active');
    document.body.style.overflow = '';
}

// Expose globally
window.closeMobileMenu = closeMobileMenu;

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
// RESUME TAB FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Resume State
const ResumeState = {
    experiences: [],
    education: []
};

function initResumeTab() {
    // Load saved resume data
    loadResumeData();
    
    // Setup skills input
    const skillsInput = document.getElementById('resumeSkills');
    if (skillsInput) {
        skillsInput.addEventListener('input', updateSkillsPreview);
    }
}

function loadResumeData() {
    try {
        const saved = localStorage.getItem('bewerbungsmanager_resume');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Fill form fields
            const fields = ['resumeFirstName', 'resumeLastName', 'resumeTitle', 'resumeEmail', 
                           'resumePhone', 'resumeLocation', 'resumeSummary', 'resumeSkills'];
            
            fields.forEach(id => {
                const el = document.getElementById(id);
                if (el && data[id]) el.value = data[id];
            });
            
            // Load experiences
            if (data.experiences) {
                ResumeState.experiences = data.experiences;
                renderExperiences();
            }
            
            // Load education
            if (data.education) {
                ResumeState.education = data.education;
                renderEducation();
            }
            
            // Update skills preview
            updateSkillsPreview();
        }
    } catch (e) {
        console.error('Error loading resume:', e);
    }
}

function saveResume() {
    try {
        const data = {
            resumeFirstName: document.getElementById('resumeFirstName')?.value || '',
            resumeLastName: document.getElementById('resumeLastName')?.value || '',
            resumeTitle: document.getElementById('resumeTitle')?.value || '',
            resumeEmail: document.getElementById('resumeEmail')?.value || '',
            resumePhone: document.getElementById('resumePhone')?.value || '',
            resumeLocation: document.getElementById('resumeLocation')?.value || '',
            resumeSummary: document.getElementById('resumeSummary')?.value || '',
            resumeSkills: document.getElementById('resumeSkills')?.value || '',
            experiences: ResumeState.experiences,
            education: ResumeState.education,
            languages: [
                { name: document.getElementById('resumeLang1')?.value, level: document.getElementById('resumeLang1Level')?.value },
                { name: document.getElementById('resumeLang2')?.value, level: document.getElementById('resumeLang2Level')?.value }
            ],
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('bewerbungsmanager_resume', JSON.stringify(data));
        
        // Sync with profile
        DashboardState.profile.firstName = data.resumeFirstName;
        DashboardState.profile.lastName = data.resumeLastName;
        DashboardState.profile.email = data.resumeEmail;
        DashboardState.profile.phone = data.resumePhone;
        DashboardState.profile.location = data.resumeLocation;
        DashboardState.profile.currentJob = data.resumeTitle;
        DashboardState.profile.skills = data.resumeSkills.split(',').map(s => s.trim()).filter(s => s);
        saveState();
        
        showToast('Lebenslauf gespeichert!', 'success');
    } catch (e) {
        console.error('Error saving resume:', e);
        showToast('Fehler beim Speichern', 'error');
    }
}

function clearResumeForm() {
    if (!confirm('Alle Lebenslauf-Daten löschen?')) return;
    
    localStorage.removeItem('bewerbungsmanager_resume');
    ResumeState.experiences = [];
    ResumeState.education = [];
    
    // Clear all inputs
    document.querySelectorAll('.resume-quick-form input, .resume-quick-form textarea').forEach(el => {
        el.value = '';
    });
    
    renderExperiences();
    renderEducation();
    updateSkillsPreview();
    
    showToast('Lebenslauf zurückgesetzt', 'info');
}

function addExperienceEntry() {
    const id = Date.now().toString(36);
    ResumeState.experiences.push({
        id,
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
    });
    renderExperiences();
}

function removeExperience(id) {
    ResumeState.experiences = ResumeState.experiences.filter(e => e.id !== id);
    renderExperiences();
}

function renderExperiences() {
    const container = document.getElementById('experienceList');
    if (!container) return;
    
    if (ResumeState.experiences.length === 0) {
        container.innerHTML = '<p class="empty-hint">Noch keine Berufserfahrung hinzugefügt</p>';
        return;
    }
    
    container.innerHTML = ResumeState.experiences.map((exp, index) => `
        <div class="experience-entry" data-id="${exp.id}">
            <div class="entry-header">
                <h4>Position ${index + 1}</h4>
                <button class="entry-remove" onclick="removeExperience('${exp.id}')" title="Entfernen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Jobtitel</label>
                    <input type="text" value="${escapeHtml(exp.title)}" 
                           onchange="updateExperience('${exp.id}', 'title', this.value)"
                           placeholder="z.B. Software Engineer">
                </div>
                <div class="form-group">
                    <label>Unternehmen</label>
                    <input type="text" value="${escapeHtml(exp.company)}"
                           onchange="updateExperience('${exp.id}', 'company', this.value)"
                           placeholder="z.B. Tech GmbH">
                </div>
                <div class="form-group">
                    <label>Von</label>
                    <input type="month" value="${exp.startDate}"
                           onchange="updateExperience('${exp.id}', 'startDate', this.value)">
                </div>
                <div class="form-group">
                    <label>Bis</label>
                    <input type="month" value="${exp.endDate}" ${exp.current ? 'disabled' : ''}
                           onchange="updateExperience('${exp.id}', 'endDate', this.value)">
                    <label class="checkbox-label" style="margin-top: 4px;">
                        <input type="checkbox" ${exp.current ? 'checked' : ''}
                               onchange="updateExperience('${exp.id}', 'current', this.checked)">
                        <span>Aktuell</span>
                    </label>
                </div>
                <div class="form-group full-width">
                    <label>Beschreibung</label>
                    <textarea rows="2" 
                              onchange="updateExperience('${exp.id}', 'description', this.value)"
                              placeholder="Hauptaufgaben und Erfolge...">${escapeHtml(exp.description)}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

function updateExperience(id, field, value) {
    const exp = ResumeState.experiences.find(e => e.id === id);
    if (exp) {
        exp[field] = value;
        if (field === 'current' && value) {
            exp.endDate = '';
        }
    }
}

function addEducationEntry() {
    const id = Date.now().toString(36);
    ResumeState.education.push({
        id,
        degree: '',
        institution: '',
        field: '',
        startDate: '',
        endDate: ''
    });
    renderEducation();
}

function removeEducation(id) {
    ResumeState.education = ResumeState.education.filter(e => e.id !== id);
    renderEducation();
}

function renderEducation() {
    const container = document.getElementById('educationList');
    if (!container) return;
    
    if (ResumeState.education.length === 0) {
        container.innerHTML = '<p class="empty-hint">Noch keine Ausbildung hinzugefügt</p>';
        return;
    }
    
    container.innerHTML = ResumeState.education.map((edu, index) => `
        <div class="education-entry" data-id="${edu.id}">
            <div class="entry-header">
                <h4>Ausbildung ${index + 1}</h4>
                <button class="entry-remove" onclick="removeEducation('${edu.id}')" title="Entfernen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Abschluss</label>
                    <select onchange="updateEducation('${edu.id}', 'degree', this.value)">
                        <option value="">Bitte wählen...</option>
                        <option value="Bachelor" ${edu.degree === 'Bachelor' ? 'selected' : ''}>Bachelor</option>
                        <option value="Master" ${edu.degree === 'Master' ? 'selected' : ''}>Master</option>
                        <option value="Diplom" ${edu.degree === 'Diplom' ? 'selected' : ''}>Diplom</option>
                        <option value="Promotion" ${edu.degree === 'Promotion' ? 'selected' : ''}>Promotion</option>
                        <option value="Ausbildung" ${edu.degree === 'Ausbildung' ? 'selected' : ''}>Ausbildung</option>
                        <option value="Abitur" ${edu.degree === 'Abitur' ? 'selected' : ''}>Abitur</option>
                        <option value="Sonstiges" ${edu.degree === 'Sonstiges' ? 'selected' : ''}>Sonstiges</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" value="${escapeHtml(edu.institution)}"
                           onchange="updateEducation('${edu.id}', 'institution', this.value)"
                           placeholder="z.B. TU München">
                </div>
                <div class="form-group">
                    <label>Fachrichtung</label>
                    <input type="text" value="${escapeHtml(edu.field)}"
                           onchange="updateEducation('${edu.id}', 'field', this.value)"
                           placeholder="z.B. Informatik">
                </div>
                <div class="form-group">
                    <label>Zeitraum</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="month" value="${edu.startDate}" style="flex: 1;"
                               onchange="updateEducation('${edu.id}', 'startDate', this.value)">
                        <span>–</span>
                        <input type="month" value="${edu.endDate}" style="flex: 1;"
                               onchange="updateEducation('${edu.id}', 'endDate', this.value)">
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateEducation(id, field, value) {
    const edu = ResumeState.education.find(e => e.id === id);
    if (edu) {
        edu[field] = value;
    }
}

function updateSkillsPreview() {
    const input = document.getElementById('resumeSkills');
    const preview = document.getElementById('skillsPreview');
    
    if (!input || !preview) return;
    
    const skills = input.value.split(',').map(s => s.trim()).filter(s => s);
    
    if (skills.length === 0) {
        preview.innerHTML = '<span class="empty-hint">Skills erscheinen hier als Tags...</span>';
        return;
    }
    
    preview.innerHTML = skills.map(skill => 
        `<span class="skill-tag">${escapeHtml(skill)}</span>`
    ).join('');
}

async function uploadResumePdf() {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 10 * 1024 * 1024) {
            showToast('Datei zu groß (max. 10MB)', 'error');
            return;
        }
        
        showToast('PDF wird analysiert mit KI...', 'info');
        
        try {
            // 1. PDF Text mit PDF.js extrahieren
            if (typeof pdfjsLib === 'undefined') {
                showToast('PDF.js wird geladen, bitte erneut versuchen...', 'info');
                return;
            }
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            const totalPages = pdf.numPages;
            
            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
            }
            
            if (!fullText.trim()) {
                showToast('Kein Text in der PDF gefunden', 'error');
                return;
            }
            
            // 2. API-Key holen
            let apiKey = null;
            try {
                const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
                if (globalKeys.openai?.key && !globalKeys.openai.key.includes('...')) {
                    apiKey = globalKeys.openai.key;
                }
            } catch (e) {}
            
            if (!apiKey && window.awsAPISettings) {
                try {
                    if (window.awsAPISettings.isUserLoggedIn && window.awsAPISettings.isUserLoggedIn()) {
                        apiKey = await window.awsAPISettings.getFullApiKey('openai');
                    }
                } catch (e) {}
            }
            
            if (!apiKey) {
                showToast('Kein API-Key gefunden. Nutze den vollständigen Editor.', 'info');
                window.location.href = 'resume-editor.html';
                return;
            }
            
            // 3. GPT-3.5 für Strukturierung
            showToast('KI analysiert Lebenslauf...', 'info');
            
            const prompt = `Analysiere den folgenden Lebenslauf-Text und extrahiere alle Daten im JSON-Format.
            
{
    "firstName": "Vorname",
    "lastName": "Nachname",
    "title": "Berufsbezeichnung",
    "email": "Email",
    "phone": "Telefon",
    "location": "Standort",
    "summary": "Kurzes Profil (2-3 Sätze)",
    "experience": [{"position": "", "company": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": ""}],
    "education": [{"degree": "", "institution": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM"}],
    "skills": ["Skill1", "Skill2"],
    "languages": [{"language": "", "level": ""}]
}

TEXT:
${fullText.substring(0, 12000)}`;
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'Extrahiere strukturierte Daten aus Lebensläufen. Antworte NUR mit validem JSON.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 2000,
                    temperature: 0.1
                })
            });
            
            if (!response.ok) {
                throw new Error('KI-Analyse fehlgeschlagen');
            }
            
            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content || '';
            
            // JSON parsen
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsedData = JSON.parse(jsonMatch[0]);
                fillResumeFromData(parsedData);
                syncResumeToProfile(); // Synchronisiere auch zum Profil
                showToast('✅ Lebenslauf erfolgreich importiert!', 'success');
            } else {
                throw new Error('Keine gültigen Daten erkannt');
            }
            
        } catch (error) {
            console.error('PDF OCR Error:', error);
            showToast('Fehler: ' + error.message + '. Nutze den vollständigen Editor.', 'error');
        }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

/**
 * LinkedIn PDF Import
 * Nutzer lädt LinkedIn PDF hoch, wir parsen und füllen Formular
 */
function importFromLinkedIn() {
    // Create hidden file input for PDF
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Bitte laden Sie eine PDF-Datei hoch', 'error');
            return;
        }
        
        showToast('LinkedIn PDF wird analysiert...', 'info');
        
        try {
            // Read and parse the PDF using pdf.js
            const text = await extractTextFromPDF(file);
            
            if (text) {
                // Parse LinkedIn format
                const data = parseLinkedInPDF(text);
                fillResumeFromData(data);
                showToast('LinkedIn-Daten erfolgreich importiert!', 'success');
            } else {
                showToast('PDF konnte nicht gelesen werden. Nutze den vollständigen Editor.', 'error');
                window.location.href = 'resume-editor.html';
            }
        } catch (error) {
            console.error('LinkedIn import error:', error);
            showToast('Import fehlgeschlagen: ' + error.message, 'error');
        }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

/**
 * Extrahiert Text aus PDF mit pdf.js
 */
async function extractTextFromPDF(file) {
    try {
        // Load pdf.js dynamically if not available
        if (!window.pdfjsLib) {
            // Fallback: Use FileReader to get basic text
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Basic text extraction from PDF bytes
                    const text = extractTextFromPDFBytes(e.target.result);
                    resolve(text);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
        }
        
        return text;
    } catch (error) {
        console.warn('PDF extraction failed:', error);
        return null;
    }
}

/**
 * Fallback: Basic text extraction from PDF bytes
 */
function extractTextFromPDFBytes(buffer) {
    const bytes = new Uint8Array(buffer);
    let text = '';
    
    // Very basic PDF text extraction (works for simple PDFs)
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] >= 32 && bytes[i] <= 126) {
            text += String.fromCharCode(bytes[i]);
        } else if (bytes[i] === 10 || bytes[i] === 13) {
            text += '\n';
        }
    }
    
    // Clean up the text
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

/**
 * Parst LinkedIn PDF Format
 */
function parseLinkedInPDF(text) {
    const data = {
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        skills: '',
        experience: [],
        education: []
    };
    
    // Try to extract name (usually first line in LinkedIn PDF)
    const nameMatch = text.match(/^([A-ZÄÖÜ][a-zäöüß]+)\s+([A-ZÄÖÜ][a-zäöüß]+)/);
    if (nameMatch) {
        data.firstName = nameMatch[1];
        data.lastName = nameMatch[2];
    }
    
    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) data.email = emailMatch[0];
    
    // Extract phone
    const phoneMatch = text.match(/(\+?\d[\d\s()-]{8,})/);
    if (phoneMatch) data.phone = phoneMatch[0].trim();
    
    // Extract skills (often listed with commas or bullets)
    const skillsMatch = text.match(/Skills[:\s]+([\w,\s•·-]+)/i);
    if (skillsMatch) {
        data.skills = skillsMatch[1].replace(/[•·]/g, ',').trim();
    }
    
    return data;
}

/**
 * Füllt das Lebenslauf-Formular mit importierten Daten
 */
function fillResumeFromData(data) {
    const setField = (id, value) => {
        const el = document.getElementById(id);
        if (el && value) el.value = value;
    };
    
    setField('resumeFirstName', data.firstName);
    setField('resumeLastName', data.lastName);
    setField('resumeTitle', data.title);
    setField('resumeEmail', data.email);
    setField('resumePhone', data.phone);
    setField('resumeLocation', data.location);
    setField('resumeSummary', data.summary);
    
    // Skills können Array oder String sein
    const skills = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills;
    setField('resumeSkills', skills);
    
    // Experience hinzufügen
    if (data.experience && Array.isArray(data.experience)) {
        const container = document.getElementById('experienceContainer');
        if (container) {
            container.innerHTML = ''; // Clear existing
            data.experience.forEach(exp => {
                addExperienceEntry({
                    position: exp.position,
                    company: exp.company,
                    startDate: exp.startDate,
                    endDate: exp.endDate,
                    description: exp.description,
                    current: exp.endDate === 'heute' || exp.endDate === 'present'
                });
            });
        }
    }
    
    // Education hinzufügen
    if (data.education && Array.isArray(data.education)) {
        const container = document.getElementById('educationContainer');
        if (container) {
            container.innerHTML = ''; // Clear existing
            data.education.forEach(edu => {
                addEducationEntry({
                    degree: edu.degree,
                    institution: edu.institution,
                    startDate: edu.startDate,
                    endDate: edu.endDate
                });
            });
        }
    }
    
    // Languages hinzufügen
    if (data.languages && Array.isArray(data.languages)) {
        // Sprache 1
        if (data.languages[0]) {
            setField('resumeLanguage1', data.languages[0].language);
            const level1 = document.getElementById('resumeLanguageLevel1');
            if (level1 && data.languages[0].level) {
                const levelMap = { 'muttersprache': 'native', 'c2': 'c2', 'c1': 'c1', 'b2': 'b2', 'b1': 'b1' };
                level1.value = levelMap[data.languages[0].level.toLowerCase()] || '';
            }
        }
        // Sprache 2
        if (data.languages[1]) {
            setField('resumeLanguage2', data.languages[1].language);
            const level2 = document.getElementById('resumeLanguageLevel2');
            if (level2 && data.languages[1].level) {
                const levelMap = { 'muttersprache': 'native', 'c2': 'c2', 'c1': 'c1', 'b2': 'b2', 'b1': 'b1' };
                level2.value = levelMap[data.languages[1].level.toLowerCase()] || '';
            }
        }
    }
    
    // Save the resume after import
    saveResume();
    
    // Auch zum Profil synchronisieren
    syncResumeToProfile();
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FOR OTHER MODULES
// ═══════════════════════════════════════════════════════════════════════════
// SYNCHRONISATION ZWISCHEN LEBENSLAUF UND PROFIL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Synchronisiert Daten vom Lebenslauf-Manager zum Profil
 */
function syncResumeToProfile() {
    const fieldMappings = [
        ['resumeFirstName', 'profileFirstName'],
        ['resumeLastName', 'profileLastName'],
        ['resumeEmail', 'profileEmail'],
        ['resumePhone', 'profilePhone'],
        ['resumeLocation', 'profileLocation'],
        ['resumeTitle', 'profilePosition'],
        ['resumeSummary', 'profileSummary'],
        ['resumeSkills', 'profileSkills']
    ];
    
    fieldMappings.forEach(([resumeId, profileId]) => {
        const resumeField = document.getElementById(resumeId);
        const profileField = document.getElementById(profileId);
        if (resumeField && profileField && resumeField.value) {
            profileField.value = resumeField.value;
        }
    });
    
    // Berufserfahrung Jahre abgleichen (wenn vorhanden)
    const experienceCount = document.querySelectorAll('.experience-entry').length;
    const yearsSelect = document.getElementById('profileExperience');
    if (yearsSelect && experienceCount > 0) {
        // Grobe Schätzung basierend auf Anzahl der Einträge
        if (experienceCount >= 4) yearsSelect.value = 'expert';
        else if (experienceCount >= 3) yearsSelect.value = 'senior';
        else if (experienceCount >= 2) yearsSelect.value = 'mid';
        else yearsSelect.value = 'junior';
    }
    
    console.log('✅ Lebenslauf → Profil synchronisiert');
}

/**
 * Synchronisiert Daten vom Profil zum Lebenslauf-Manager
 */
function syncProfileToResume() {
    const fieldMappings = [
        ['profileFirstName', 'resumeFirstName'],
        ['profileLastName', 'resumeLastName'],
        ['profileEmail', 'resumeEmail'],
        ['profilePhone', 'resumePhone'],
        ['profileLocation', 'resumeLocation'],
        ['profilePosition', 'resumeTitle'],
        ['profileSummary', 'resumeSummary'],
        ['profileSkills', 'resumeSkills']
    ];
    
    fieldMappings.forEach(([profileId, resumeId]) => {
        const profileField = document.getElementById(profileId);
        const resumeField = document.getElementById(resumeId);
        if (profileField && resumeField && profileField.value) {
            resumeField.value = profileField.value;
        }
    });
    
    console.log('✅ Profil → Lebenslauf synchronisiert');
}

/**
 * Automatische Synchronisation bei Feldänderungen
 */
function setupFieldSync() {
    // Resume-Felder -> Profil
    const resumeFields = ['resumeFirstName', 'resumeLastName', 'resumeEmail', 'resumePhone', 'resumeLocation', 'resumeTitle', 'resumeSummary', 'resumeSkills'];
    resumeFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('blur', () => {
                syncResumeToProfile();
            });
        }
    });
    
    // Profil-Felder -> Resume
    const profileFields = ['profileFirstName', 'profileLastName', 'profileEmail', 'profilePhone', 'profileLocation', 'profilePosition', 'profileSummary', 'profileSkills'];
    profileFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('blur', () => {
                syncProfileToResume();
            });
        }
    });
}

// Setup Sync nach DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupFieldSync, 500);
});

// ═══════════════════════════════════════════════════════════════════════════

window.DashboardState = DashboardState;
window.ResumeState = ResumeState;
window.showTab = showTab;
window.showToast = showToast;
window.saveState = saveState;
window.updateStatsBar = updateStatsBar;
window.updateApplicationsList = updateApplicationsList;
window.updateApplication = updateApplication;
window.changeStatus = changeStatus;
window.saveResume = saveResume;
window.clearResumeForm = clearResumeForm;
window.addExperienceEntry = addExperienceEntry;
window.removeExperience = removeExperience;
window.updateExperience = updateExperience;
window.addEducationEntry = addEducationEntry;
window.removeEducation = removeEducation;
window.updateEducation = updateEducation;
window.uploadResumePdf = uploadResumePdf;
window.importFromLinkedIn = importFromLinkedIn;
window.initResumeTab = initResumeTab;
window.syncResumeToProfile = syncResumeToProfile;
window.syncProfileToResume = syncProfileToResume;

// Export DashboardCore for external access
window.DashboardCore = {
    checkAuthStatus,
    updateAuthUI,
    closeMobileMenu,
    showTab,
    showToast
};

