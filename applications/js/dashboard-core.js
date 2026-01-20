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
    const startTime = performance.now();
    console.log('🚀 Initializing Bewerbungsmanager Dashboard...');
    
    // Zeige Loading-State sofort
    showDashboardLoading(true);
    
    // UnifiedProfileService Listener für automatische Updates
    if (window.unifiedProfileService) {
        window.unifiedProfileService.onProfileChange((profile) => {
            if (profile && profile.firstName && profile.firstName !== 'Test') {
                console.log('📊 Dashboard: UnifiedProfileService Update erhalten');
                DashboardState.profile = {
                    ...DashboardState.profile,
                    firstName: profile.firstName || DashboardState.profile.firstName,
                    lastName: profile.lastName || DashboardState.profile.lastName,
                    email: profile.email || DashboardState.profile.email,
                    phone: profile.phone || DashboardState.profile.phone,
                    location: profile.location || DashboardState.profile.location,
                    currentJob: profile.profession || DashboardState.profile.currentJob,
                    summary: profile.summary || DashboardState.profile.summary,
                    skills: profile.skills?.length > 0 ? profile.skills : DashboardState.profile.skills
                };
                updateProfileForm();
                prefillQuickApplyFromProfile();
            }
        });
    }
    
    // Setup UI sofort (sync operations)
    setupMobileMenu();
    setupAuth();
    
    // PARALLEL: Alle asynchronen Operationen gleichzeitig starten
    await Promise.all([
        loadSavedState(),
        updateDashboardStats()
    ]);
    
    // UI nach Datenladung aktualisieren
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
    
    // Nochmals Quick-Apply-Felder füllen
    setTimeout(() => prefillQuickApplyFromProfile(), 500);
    
    // Loading-State entfernen
    showDashboardLoading(false);
    
    DashboardState.initialized = true;
    const duration = Math.round(performance.now() - startTime);
    console.log(`✅ Dashboard initialized in ${duration}ms`);
    
    // Melde dem Parent-Frame dass wir fertig sind (für Iframe-Embedding)
    if (window.parent !== window) {
        window.parent.postMessage({ type: 'dashboard-initialized', duration }, '*');
    }
}

/**
 * Zeigt/Versteckt den Loading-State für das Dashboard
 */
function showDashboardLoading(show) {
    // Füge Loading-Overlay hinzu wenn nicht vorhanden
    let loadingOverlay = document.getElementById('dashboardLoadingOverlay');
    
    if (show) {
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'dashboardLoadingOverlay';
            loadingOverlay.innerHTML = `
                <div class="loading-spinner-container">
                    <div class="loading-spinner"></div>
                    <p>Lade Bewerbungsmanager...</p>
                </div>
            `;
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                flex-direction: column;
            `;
            document.body.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    } else if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            if (loadingOverlay) loadingOverlay.remove();
        }, 300);
    }
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
 * WICHTIG: Nutzt primär cloudDataService, mit awsProfileAPI als Fallback
 */
async function loadAWSProfile() {
    try {
        // Prüfe ob User angemeldet ist
        const auth = window.awsAuth || window.realUserAuth;
        if (!auth || typeof auth.isLoggedIn !== 'function' || !auth.isLoggedIn()) {
            console.log('ℹ️ Kein angemeldeter User - überspringe AWS-Profil');
            return;
        }
        
        let awsProfile = null;
        
        // PRIORITÄT 0: UnifiedProfileService (beste Datenquelle)
        if (window.unifiedProfileService?.isInitialized) {
            const unifiedProfile = window.unifiedProfileService.getProfile();
            if (unifiedProfile && unifiedProfile.firstName && unifiedProfile.firstName !== 'Test') {
                console.log('✅ Nutze UnifiedProfileService für Dashboard');
                awsProfile = unifiedProfile;
            }
        }
        
        // PRIORITÄT 1: cloudDataService (Netlify Function) - falls UnifiedProfile leer
        if (!awsProfile || Object.keys(awsProfile).length === 0) {
            if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
                console.log('📡 Lade Profil aus cloudDataService...');
                try {
                    awsProfile = await window.cloudDataService.getProfile(true); // forceRefresh
                    if (awsProfile) {
                        console.log('✅ Profil aus cloudDataService geladen:', Object.keys(awsProfile));
                    }
                } catch (e) {
                    console.warn('⚠️ cloudDataService Fehler:', e.message);
                }
            }
        }
        
        // PRIORITÄT 2: awsProfileAPI als Fallback
        if (!awsProfile) {
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
            
            if (window.awsProfileAPI?.isInitialized) {
                console.log('📡 Lade Profil aus awsProfileAPI...');
                awsProfile = await window.awsProfileAPI.loadProfile();
            } else {
                console.warn('⚠️ awsProfileAPI nicht verfügbar');
            }
        }
        
        if (awsProfile) {
            console.log('✅ AWS-Profil geladen:', awsProfile);
            
            // Coaching-Daten lokal ergänzen falls in Cloud fehlt
            if (!awsProfile.coaching) {
                try {
                    const coachingRaw = localStorage.getItem('coaching_workflow_data');
                    if (coachingRaw) {
                        awsProfile.coaching = JSON.parse(coachingRaw);
                    }
                } catch (e) {
                    console.warn('⚠️ Coaching-Daten konnten nicht gelesen werden:', e);
                }
            }
            
            // Konvertiere AWS-Profil-Format zu DashboardState-Format
            // WICHTIG: Ignoriere "Test User" Daten und behalte gültige UnifiedProfile-Daten!
            const rawFirstName = awsProfile.firstName || awsProfile.personal?.firstName || '';
            const rawLastName = awsProfile.lastName || awsProfile.personal?.lastName || '';
            const isTestUser = (rawFirstName === 'Test' && rawLastName === 'User') || 
                               (rawFirstName === 'Test' && !rawLastName);
            
            // Behalte existierende gültige Namen aus UnifiedProfileService
            const existingProfile = DashboardState.profile || {};
            const keepExistingName = existingProfile.firstName && 
                                     existingProfile.firstName !== 'Test' && 
                                     existingProfile.firstName.length > 0;
            
            DashboardState.profile = {
                firstName: keepExistingName ? existingProfile.firstName : (isTestUser ? '' : rawFirstName),
                lastName: keepExistingName ? existingProfile.lastName : (isTestUser ? '' : rawLastName),
                email: awsProfile.email || awsProfile.personal?.email || existingProfile.email || '',
                phone: awsProfile.phone || awsProfile.personal?.phone || existingProfile.phone || '',
                location: awsProfile.location || awsProfile.personal?.location || existingProfile.location || '',
                currentJob: awsProfile.currentPosition || awsProfile.profession || awsProfile.professional?.currentPosition || existingProfile.currentJob || '',
                experience: awsProfile.experience || awsProfile.professional?.experience || existingProfile.experience || '',
                summary: awsProfile.summary || awsProfile.professional?.summary || existingProfile.summary || '',
                skills: Array.isArray(awsProfile.skills) ? awsProfile.skills : (awsProfile.professional?.skills || existingProfile.skills || []),
                coaching: awsProfile.coaching || existingProfile.coaching || null
            };
            
            // Speichere auch lokal für Offline-Zugriff
            localStorage.setItem('bewerbungsmanager_profile', JSON.stringify(DashboardState.profile));
            
            // Aktualisiere Quick-Apply-Felder
            prefillQuickApplyFromProfile();
            
            // Aktualisiere Profil-Formular
            updateProfileForm();
            
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
    const coaching = profile.coaching || {};
    const coachingSkills = [
        coaching.naturalTalents,
        coaching.acquiredSkills,
        coaching.uniqueStrengths
    ].filter(Boolean).join(', ');
    const coachingMotivation = coaching.motivators || coaching.shortTermGoals || coaching.dreamJob || '';
    
    // Name
    const nameField = document.getElementById('quickName') || document.getElementById('quickUserName');
    if (nameField && !nameField.value) {
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
        nameField.value = fullName || '';
    }
    
    // Position
    const positionField = document.getElementById('quickPosition') || document.getElementById('quickUserPosition');
    if (positionField && !positionField.value) {
        positionField.value = profile.currentJob || coaching.dreamJob || '';
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
        skillsField.value = skills || coachingSkills || '';
    }
    
    const motivationField = document.getElementById('quickMotivation');
    if (motivationField && !motivationField.value) {
        motivationField.value = coachingMotivation || profile.summary || '';
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
        // Anschreiben-Liste laden
        loadCoverLetters();
    } else if (tabId === 'certificates' || tabId === 'documents') {
        // Zeugnisse laden
        loadCertificates();
    } else if (tabId === 'photos') {
        // Fotos-Tab initialisieren
        initPhotosTab();
    } else if (tabId === 'portfolio') {
        // Bewerbungsmappe-Tab initialisieren
        initPortfolioTab();
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

/**
 * Aktualisiert alle Dashboard-Statistiken (Anschreiben, Lebensläufe, Zeugnisse, Fotos, etc.)
 * OPTIMIERT: Alle API-Calls werden PARALLEL ausgeführt für schnellere Ladezeiten
 */
async function updateDashboardStats() {
    const startTime = performance.now();
    console.log('📊 Lade Dashboard Stats (parallel)...');
    
    try {
        const isLoggedIn = window.cloudDataService && window.cloudDataService.isUserLoggedIn();
        
        // PARALLEL: Alle Daten gleichzeitig laden mit Promise.all
        const [coverLetters, resumes, documents, photos, portfolios] = await Promise.all([
            // Anschreiben
            isLoggedIn 
                ? window.cloudDataService.getCoverLetters(false).catch(() => [])
                : Promise.resolve(JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]')),
            
            // Lebensläufe
            isLoggedIn 
                ? window.cloudDataService.getResumes(false).catch(() => [])
                : Promise.resolve(JSON.parse(localStorage.getItem('user_resumes') || '[]')),
            
            // Zeugnisse/Dokumente
            isLoggedIn 
                ? window.cloudDataService.getDocuments(false).catch(() => [])
                : Promise.resolve(JSON.parse(localStorage.getItem('user_certificates') || '[]')),
            
            // Fotos
            isLoggedIn 
                ? window.cloudDataService.getPhotos(false).catch(() => [])
                : Promise.resolve(JSON.parse(localStorage.getItem('user_photos') || '[]')),
            
            // Bewerbungsmappen
            isLoggedIn && window.cloudDataService.getPortfolios
                ? window.cloudDataService.getPortfolios(false).catch(() => [])
                : Promise.resolve(JSON.parse(localStorage.getItem('user_portfolios') || '[]'))
        ]);
        
        // UI Updates (schnell, da synchron)
        const updates = [
            ['statCoverLetters', coverLetters?.length || 0],
            ['statResumes', resumes?.length || 0],
            ['statDocuments', documents?.length || 0],
            ['statPhotos', photos?.length || 0],
            ['statPortfolios', portfolios?.length || 0],
            ['statTotal', DashboardState.stats.total || 0]
        ];
        
        updates.forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
        
        // Cache für spätere Tab-Nutzung speichern
        DashboardState._cachedData = {
            coverLetters: coverLetters || [],
            resumes: resumes || [],
            documents: documents || [],
            photos: photos || [],
            portfolios: portfolios || [],
            timestamp: Date.now()
        };
        
        const duration = Math.round(performance.now() - startTime);
        console.log(`✅ Dashboard Stats geladen in ${duration}ms:`, {
            coverLetters: coverLetters?.length || 0,
            resumes: resumes?.length || 0,
            documents: documents?.length || 0,
            photos: photos?.length || 0,
            portfolios: portfolios?.length || 0
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Dashboard-Stats:', error);
    }
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

async function saveProfile(event) {
    event.preventDefault();
    
    // Collect form data from Bewerbungsmanager form
    const formData = {
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
    
    // Update DashboardState
    DashboardState.profile = formData;
    
    // Save locally
    saveState();
    updateSkillsTags();
    
    // WICHTIG: Auch in AWS speichern (nur geänderte Felder - Merge!)
    try {
        const auth = window.awsAuth || window.realUserAuth;
        if (auth?.isLoggedIn() && window.cloudDataService) {
            console.log('☁️ Speichere Bewerbungsmanager-Profil in AWS...');
            
            // Nur die relevanten Felder senden - die Netlify Function merged automatisch
            const awsProfileData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                // Bewerbungsmanager-spezifische Felder mit eigenem Präfix/Namen
                profession: formData.currentJob, // Kompatibel mit user-profile.js
                currentJob: formData.currentJob,
                experience: formData.experience,
                summary: formData.summary,
                skills: formData.skills
            };
            
            await window.cloudDataService.saveProfile(awsProfileData);
            console.log('✅ Bewerbungsmanager-Profil in AWS gespeichert');
            showToast('Profil gespeichert & synchronisiert!', 'success');
        } else {
            showToast('Profil lokal gespeichert!', 'success');
        }
    } catch (error) {
        console.error('❌ Fehler beim Speichern in AWS:', error);
        showToast('Profil lokal gespeichert (Cloud-Sync fehlgeschlagen)', 'warning');
    }
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
            // Pre-fill ONLY empty profile fields from auth - NEVER overwrite existing data!
            let hasChanges = false;
            
            // Nur E-Mail übernehmen wenn leer
            if (!DashboardState.profile.email && userData.email) {
                DashboardState.profile.email = userData.email;
                hasChanges = true;
            }
            
            // Nur Namen übernehmen wenn BEIDE leer sind UND userData.name vorhanden ist
            // WICHTIG: Nicht überschreiben wenn bereits Daten vorhanden!
            if (!DashboardState.profile.firstName && !DashboardState.profile.lastName && userData.name) {
                DashboardState.profile.firstName = userData.name.split(' ')[0] || '';
                DashboardState.profile.lastName = userData.name.split(' ').slice(1).join(' ') || '';
                hasChanges = true;
            }
            
            if (hasChanges) {
                saveState();
                console.log('📝 Auth-Daten in leere Profilfelder übernommen');
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
    // Load resumes list from cloud or localStorage
    loadResumes();
    
    // Load saved resume data for quick form (falls noch vorhanden)
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
// CLOUD DATA FUNCTIONS - Anschreiben, Lebensläufe, Zeugnisse
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lädt Anschreiben aus Cloud oder localStorage
 */
async function loadCoverLetters() {
    console.log('📄 Lade Anschreiben...');
    const container = document.getElementById('coverLettersList');
    const emptyState = document.getElementById('coverLettersEmpty');
    
    if (!container) {
        console.warn('Cover letters container not found');
        return;
    }
    
    try {
        let coverLetters = [];
        
        // OPTIMIERT: Nutze gecachte Daten wenn vorhanden (< 30 Sekunden alt)
        const cache = DashboardState._cachedData;
        if (cache?.coverLetters && (Date.now() - cache.timestamp) < 30000) {
            coverLetters = cache.coverLetters;
            console.log('📦 Anschreiben aus Cache geladen');
        } else if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            try {
                coverLetters = await window.cloudDataService.getCoverLetters(false); // Cache nutzen
            } catch (error) {
                console.warn('Cloud-Laden fehlgeschlagen, verwende localStorage:', error);
                const local = localStorage.getItem('cover_letter_drafts');
                coverLetters = local ? JSON.parse(local) : [];
            }
        } else {
            // Fallback: localStorage
            const local = localStorage.getItem('cover_letter_drafts');
            coverLetters = local ? JSON.parse(local) : [];
        }
        
        if (coverLetters.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        
        // Sortiere nach neuestem zuerst (updatedAt > createdAt)
        coverLetters.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0);
            const dateB = new Date(b.updatedAt || b.createdAt || 0);
            return dateB - dateA; // Neueste zuerst
        });
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = coverLetters.map((cl, index) => {
            const date = new Date(cl.createdAt).toLocaleDateString('de-DE');
            const company = cl.jobData?.company || 'Unbekanntes Unternehmen';
            const position = cl.jobData?.title || cl.jobData?.position || 'Position';
            const preview = cl.content?.substring(0, 150) + '...' || '';
            
            const version = cl.version ? ` v${cl.version}` : '';
            return `
                <div class="cover-letter-item" data-id="${cl.id}">
                    <div class="cover-letter-info">
                        <h4>${position}${version}</h4>
                        <p class="company">${company}</p>
                        <p class="date">${date}</p>
                        <p class="preview">${preview}</p>
                    </div>
                    <div class="cover-letter-actions">
                        <button onclick="viewCoverLetter('${cl.id}')" class="btn-glass btn-icon" title="Ansehen">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editCoverLetter('${cl.id}')" class="btn-glass btn-icon" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="copyCoverLetter('${cl.id}')" class="btn-glass btn-icon" title="Kopieren">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="downloadCoverLetter('${cl.id}')" class="btn-glass btn-icon" title="Herunterladen">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="deleteCoverLetter('${cl.id}')" class="btn-glass btn-icon btn-danger" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log(`✅ ${coverLetters.length} Anschreiben geladen`);
        
    } catch (error) {
        console.error('Fehler beim Laden der Anschreiben:', error);
    }
}

/**
 * Lädt Lebensläufe aus Cloud oder localStorage
 */
async function loadResumes() {
    console.log('📄 Lade Lebensläufe...');
    const container = document.getElementById('resumesList');
    const emptyState = document.getElementById('resumesEmpty');
    
    if (!container) {
        console.warn('Resume list container not found');
        return;
    }
    
    try {
        let resumes = [];
        
        // OPTIMIERT: Nutze gecachte Daten wenn vorhanden (< 30 Sekunden alt)
        const cache = DashboardState._cachedData;
        if (cache?.resumes && (Date.now() - cache.timestamp) < 30000) {
            resumes = cache.resumes;
            console.log('📦 Lebensläufe aus Cache geladen');
        } else if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            try {
                resumes = await window.cloudDataService.getResumes(false); // Cache nutzen
            } catch (error) {
                console.warn('Cloud-Laden fehlgeschlagen, verwende localStorage:', error);
                const local = localStorage.getItem('user_resumes');
                resumes = local ? JSON.parse(local) : [];
            }
        } else {
            // Fallback: localStorage
            const local = localStorage.getItem('user_resumes');
            resumes = local ? JSON.parse(local) : [];
        }
        
        if (resumes.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        
        // Sortiere nach neuestem zuerst (updatedAt > createdAt > id)
        resumes.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0);
            const dateB = new Date(b.updatedAt || b.createdAt || 0);
            return dateB - dateA; // Neueste zuerst
        });
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = resumes.map((resume, index) => {
            const updateDate = new Date(resume.updatedAt || resume.createdAt || Date.now());
            const date = updateDate.toLocaleDateString('de-DE', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const time = updateDate.toLocaleTimeString('de-DE', {
                hour: '2-digit', minute: '2-digit'
            });
            // Unterstütze beide Datenstrukturen: personalInfo und direkte Felder
            const name = resume.name || (resume.personalInfo?.firstName && resume.personalInfo?.lastName 
                ? `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}` 
                : (resume.firstName && resume.lastName)
                    ? `${resume.firstName} ${resume.lastName}`.trim()
                    : 'Unbenannter Lebenslauf');
            const title = resume.personalInfo?.title || resume.title || 'Berufsbezeichnung';
            const summary = resume.personalInfo?.summary || resume.summary || '';
            const summaryPreview = summary ? summary.substring(0, 120) + (summary.length > 120 ? '...' : '') : '';
            
            return `
                <div class="resume-item" data-id="${resume.id}">
                    <div class="resume-item-info">
                        <h4>${escapeHtml(name)}</h4>
                        <p class="resume-title">${escapeHtml(title)}</p>
                        <p class="resume-date">Aktualisiert: ${date} um ${time} Uhr</p>
                        ${summaryPreview ? `<p class="resume-preview">${escapeHtml(summaryPreview)}</p>` : ''}
                    </div>
                    <div class="resume-item-actions">
                        <a href="resume-editor.html?id=${resume.id}" class="btn-icon" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button onclick="viewResumePDF('${resume.id}')" class="btn-icon" title="PDF anzeigen">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        ${typeof window.duplicateResume === 'function' ? `
                        <button onclick="duplicateResume('${resume.id}')" class="btn-icon" title="Duplizieren">
                            <i class="fas fa-copy"></i>
                        </button>
                        ` : ''}
                        <button onclick="deleteResume('${resume.id}')" class="btn-icon btn-danger" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log(`✅ ${resumes.length} Lebensläufe geladen`);
        
        // Stats aktualisieren
        await updateDashboardStats();
        
    } catch (error) {
        console.error('Fehler beim Laden der Lebensläufe:', error);
    }
}

/**
 * Lädt Zeugnisse/Dokumente aus Cloud oder localStorage
 */
async function loadCertificates() {
    console.log('📄 Lade Zeugnisse...');
    const container = document.getElementById('certificatesList');
    const emptyState = document.getElementById('certificatesEmpty');
    
    if (!container) {
        console.warn('Certificates container not found');
        return;
    }
    
    try {
        let documents = [];
        
        // OPTIMIERT: Nutze gecachte Daten wenn vorhanden (< 30 Sekunden alt)
        const cache = DashboardState._cachedData;
        if (cache?.documents && (Date.now() - cache.timestamp) < 30000) {
            documents = cache.documents;
            console.log('📦 Zeugnisse aus Cache geladen');
        } else if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            documents = await window.cloudDataService.getDocuments(false);
        } else {
            // Fallback: localStorage
            const local = localStorage.getItem('user_certificates');
            documents = local ? JSON.parse(local) : [];
        }
        
        if (documents.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = documents.map((doc) => {
            const date = new Date(doc.createdAt || doc.uploadedAt || Date.now()).toLocaleDateString('de-DE');
            const icon = doc.type === 'certificate' ? 'fa-certificate' 
                : doc.type === 'cv' ? 'fa-file-alt' 
                : 'fa-file-pdf';
            
            return `
                <div class="certificate-item" data-id="${doc.id}">
                    <div class="certificate-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="certificate-info">
                        <h4>${doc.name || doc.fileName || 'Dokument'}</h4>
                        <p class="type">${doc.category || doc.type || 'Sonstiges'}</p>
                        <p class="date">${date}</p>
                    </div>
                    <div class="certificate-actions">
                        <button onclick="viewDocument('${doc.id}')" class="btn-icon" title="Ansehen">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="downloadDocument('${doc.id}')" class="btn-icon" title="Herunterladen">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="deleteDocument('${doc.id}')" class="btn-icon btn-danger" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log(`✅ ${documents.length} Dokumente geladen`);
        
        // Stats aktualisieren
        await updateDashboardStats();
        
    } catch (error) {
        console.error('Fehler beim Laden der Dokumente:', error);
    }
}

// Cover Letter Actions
async function viewCoverLetter(id) {
    let coverLetters = [];
    if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
        coverLetters = await window.cloudDataService.getCoverLetters();
    } else {
        coverLetters = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
    }
    
    const cl = coverLetters.find(c => c.id === id);
    if (cl) {
        const modal = document.getElementById('viewCoverLetterModal');
        if (modal) {
            document.getElementById('viewCoverLetterContent').textContent = cl.content;
            modal.style.display = 'flex';
        } else {
            alert(cl.content);
        }
    }
}

async function copyCoverLetter(id) {
    let coverLetters = [];
    if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
        coverLetters = await window.cloudDataService.getCoverLetters();
    } else {
        coverLetters = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
    }
    
    const cl = coverLetters.find(c => c.id === id);
    if (cl) {
        await navigator.clipboard.writeText(cl.content);
        showToast('Anschreiben in Zwischenablage kopiert', 'success');
    }
}

function downloadCoverLetter(id) {
    let coverLetters = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
    const cl = coverLetters.find(c => c.id === id);
    if (cl) {
        const blob = new Blob([cl.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anschreiben_${cl.jobData?.company || 'bewerbung'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

async function deleteCoverLetter(id) {
    if (!confirm('Anschreiben wirklich löschen?')) return;
    
    try {
        // Cloud löschen
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            await window.cloudDataService.deleteCoverLetter(id);
            // Cache invalidieren
            if (window.cloudDataService.cache) {
                window.cloudDataService.cache.coverLetters = null;
                window.cloudDataService.cacheExpiry = window.cloudDataService.cacheExpiry || {};
                window.cloudDataService.cacheExpiry.coverLetters = 0;
            }
        }
        
        // IMMER auch localStorage aktualisieren
        let coverLetters = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
        coverLetters = coverLetters.filter(c => c.id !== id);
        localStorage.setItem('cover_letter_drafts', JSON.stringify(coverLetters));
        
        // Sofort Element entfernen
        const element = document.querySelector(`.cover-letter-item[data-id="${id}"]`);
        if (element) element.remove();
        
        // Liste neu laden
        await loadCoverLetters();
        
        // Stats aktualisieren
        await updateDashboardStats();
        
        showToast('Anschreiben gelöscht', 'success');
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        showToast('Fehler beim Löschen', 'error');
    }
}

// Resume Actions
async function viewResume(id) {
    window.location.href = `resume-editor.html?id=${id}&view=true`;
}

async function deleteResume(id) {
    if (!confirm('Lebenslauf wirklich löschen?')) return;
    
    try {
        // Cloud löschen
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            await window.cloudDataService.deleteResume(id);
            // Cache invalidieren für sofortige Aktualisierung
            if (window.cloudDataService.cache) {
                window.cloudDataService.cache.resumes = null;
                window.cloudDataService.cacheExpiry = window.cloudDataService.cacheExpiry || {};
                window.cloudDataService.cacheExpiry.resumes = 0;
            }
        }
        
        // IMMER auch localStorage aktualisieren
        let resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
        resumes = resumes.filter(r => r.id !== id);
        localStorage.setItem('user_resumes', JSON.stringify(resumes));
        
        // Sofort das Element aus dem DOM entfernen
        const element = document.querySelector(`.resume-item[data-id="${id}"]`);
        if (element) {
            element.remove();
        }
        
        // Liste neu laden
        await loadResumes();
        
        // Stats aktualisieren
        await updateDashboardStats();
        
        showToast('Lebenslauf gelöscht', 'success');
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        showToast('Fehler beim Löschen', 'error');
    }
}

async function downloadResumePDF(id) {
    // Redirect to editor with export action
    window.location.href = `resume-editor.html?id=${id}&action=export`;
}

// Document Actions
async function viewDocument(id) {
    let documents = [];
    if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
        documents = await window.cloudDataService.getDocuments();
    } else {
        documents = JSON.parse(localStorage.getItem('user_certificates') || '[]');
    }
    
    const doc = documents.find(d => d.id === id);
    if (doc && doc.url) {
        window.open(doc.url, '_blank');
    }
}

async function downloadDocument(id) {
    let documents = [];
    if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
        documents = await window.cloudDataService.getDocuments();
    } else {
        documents = JSON.parse(localStorage.getItem('user_certificates') || '[]');
    }
    
    const doc = documents.find(d => d.id === id);
    if (doc && doc.url) {
        const a = document.createElement('a');
        a.href = doc.url;
        a.download = doc.name || 'dokument.pdf';
        a.click();
    }
}

async function deleteDocument(id) {
    if (!confirm('Dokument wirklich löschen?')) return;
    
    if (window.cloudDataService) {
        await window.cloudDataService.deleteDocument(id);
    } else {
        let documents = JSON.parse(localStorage.getItem('user_certificates') || '[]');
        documents = documents.filter(d => d.id !== id);
        localStorage.setItem('user_certificates', JSON.stringify(documents));
    }
    
    loadCertificates();
    showToast('Dokument gelöscht', 'success');
}

// ═══════════════════════════════════════════════════════════════════════════

window.DashboardState = DashboardState;
window.ResumeState = ResumeState;
window.showTab = showTab;
window.showToast = showToast;
window.saveState = saveState;
window.updateStatsBar = updateStatsBar;
window.updateDashboardStats = updateDashboardStats;
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
window.loadCoverLetters = loadCoverLetters;
window.loadResumes = loadResumes;
window.loadCertificates = loadCertificates;
window.viewCoverLetter = viewCoverLetter;
window.copyCoverLetter = copyCoverLetter;
window.downloadCoverLetter = downloadCoverLetter;
window.deleteCoverLetter = deleteCoverLetter;
window.viewResume = viewResume;
window.deleteResume = deleteResume;
window.downloadResumePDF = downloadResumePDF;
window.viewDocument = viewDocument;
window.downloadDocument = downloadDocument;
window.deleteDocument = deleteDocument;

// ═══════════════════════════════════════════════════════════════════════════
// BEWERBUNGSFOTOS - Photo Upload & Gallery
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialisiert den Fotos-Tab
 */
function initPhotosTab() {
    console.log('📷 Initialisiere Fotos-Tab...');
    
    const dropzone = document.getElementById('photoDropzone');
    const fileInput = document.getElementById('photoFileInput');
    
    if (dropzone) {
        // Click to upload
        dropzone.addEventListener('click', () => fileInput?.click());
        
        // Drag & Drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) handlePhotoUpload(files[0]);
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handlePhotoUpload(e.target.files[0]);
            }
        });
    }
    
    loadPhotos();
}

/**
 * Lädt Bewerbungsfotos aus Cloud oder localStorage
 */
async function loadPhotos() {
    console.log('📷 Lade Bewerbungsfotos...');
    const grid = document.getElementById('galleryGrid');
    const emptyState = document.getElementById('galleryEmpty');
    
    if (!grid) return;
    
    try {
        let photos = [];
        
        // Aus Cloud laden (wenn verfügbar)
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            photos = await window.cloudDataService.getPhotos();
        } else {
            // Fallback: localStorage
            const local = localStorage.getItem('user_photos');
            photos = local ? JSON.parse(local) : [];
        }
        
        if (photos.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        grid.innerHTML = photos.map((photo, index) => `
            <div class="gallery-item" data-id="${photo.id}" onclick="selectPhoto('${photo.id}')">
                <img src="${photo.dataUrl || photo.url}" alt="Bewerbungsfoto ${index + 1}">
                <div class="photo-overlay">
                    <button onclick="event.stopPropagation(); viewPhoto('${photo.id}')" title="Vergrößern">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deletePhoto('${photo.id}')" class="btn-danger" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Markiere das ausgewählte Foto
        const selectedId = localStorage.getItem('selected_photo_id');
        if (selectedId) {
            document.querySelector(`.gallery-item[data-id="${selectedId}"]`)?.classList.add('selected');
        }
        
        console.log(`✅ ${photos.length} Fotos geladen`);
        
        // Stats aktualisieren
        await updateDashboardStats();
        
    } catch (error) {
        console.error('Fehler beim Laden der Fotos:', error);
    }
}

/**
 * Verarbeitet den Foto-Upload
 */
async function handlePhotoUpload(file) {
    if (!file) return;
    
    // Validierung
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showToast('Nur JPG, PNG oder WebP erlaubt', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        showToast('Datei zu groß (max. 5MB)', 'error');
        return;
    }
    
    try {
        showToast('Foto wird hochgeladen...', 'info');
        
        let dataUrl = '';
        let publicUrl = '';
        let storage = 'inline';
        
        // Bevorzugt: Upload zu S3 (kein Base64 in DynamoDB)
        if (window.awsMedia?.uploadProfileImage) {
            try {
                const user = window.awsAuth?.getCurrentUser?.() || window.realUserAuth?.getCurrentUser?.();
                const userId = user?.userId || user?.id || user?.email || 'anonymous';
                const uploadResult = await window.awsMedia.uploadProfileImage(file, userId);
                publicUrl = uploadResult.publicUrl;
                storage = 's3';
            } catch (uploadError) {
                console.warn('S3 Upload fehlgeschlagen, fallback zu Base64:', uploadError);
            }
        }
        
        if (!publicUrl) {
            dataUrl = await compressImageToDataUrl(file, 600, 800, 0.82);
            if (!dataUrl) {
                dataUrl = await readFileAsDataURL(file);
            }
        }
        
        // Foto speichern
        const photo = {
            id: `photo_${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: dataUrl || undefined,
            url: publicUrl || undefined,
            storage: publicUrl ? 's3' : 'local',
            createdAt: new Date().toISOString()
        };
        
        const dataUrlTooLarge = dataUrl && dataUrl.length > 350000;
        const canCloudSave = window.cloudDataService && window.cloudDataService.isUserLoggedIn() && !dataUrlTooLarge;
        
        // Cloud-Speicherung (wenn verfügbar und Daten klein genug)
        if (canCloudSave) {
            const result = await window.cloudDataService.savePhoto(photo);
            if (result?.success) {
                console.log('✅ Foto in Cloud gespeichert');
            }
        } else {
            // Fallback: In localStorage speichern
            let photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
            photos.unshift(photo);
            localStorage.setItem('user_photos', JSON.stringify(photos));
            if (dataUrlTooLarge) {
                showToast('Foto zu groß für Cloud-Speicherung – lokal gespeichert', 'warning');
            }
        }
        
        showToast('Foto erfolgreich hochgeladen!', 'success');
        loadPhotos();
        
    } catch (error) {
        console.error('Fehler beim Foto-Upload:', error);
        showToast('Fehler beim Hochladen', 'error');
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Export für Verwendung in dashboard.html
window.readFileAsDataURL = readFileAsDataURL;

function compressImageToDataUrl(file, maxWidth, maxHeight, quality = 0.82) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
                const width = Math.round(img.width * ratio);
                const height = Math.round(img.height * ratio);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                try {
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                } catch (e) {
                    console.warn('Image compression failed:', e);
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = reader.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

function selectPhoto(id) {
    // Entferne alle Selections
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Markiere ausgewähltes Foto
    document.querySelector(`.gallery-item[data-id="${id}"]`)?.classList.add('selected');
    localStorage.setItem('selected_photo_id', id);
    
    showToast('Foto ausgewählt für Bewerbungsmappe', 'success');
}

function viewPhoto(id) {
    const photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
    const photo = photos.find(p => p.id === id);
    if (photo) {
        window.open(photo.dataUrl || photo.url, '_blank');
    }
}

async function deletePhoto(id) {
    if (!confirm('Foto wirklich löschen?')) return;
    
    try {
        // Cloud-Löschung (wenn verfügbar)
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            await window.cloudDataService.deletePhoto(id);
        } else {
            // Fallback: localStorage
            let photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
            photos = photos.filter(p => p.id !== id);
            localStorage.setItem('user_photos', JSON.stringify(photos));
        }
        
        // Selection entfernen wenn das gelöschte Foto ausgewählt war
        if (localStorage.getItem('selected_photo_id') === id) {
            localStorage.removeItem('selected_photo_id');
        }
        
        // Liste neu laden
        await loadPhotos();
        
        // Stats aktualisieren (wird auch von loadPhotos aufgerufen, aber sicherheitshalber nochmal)
        await updateDashboardStats();
        
        showToast('Foto gelöscht', 'success');
    } catch (error) {
        console.error('Fehler beim Löschen des Fotos:', error);
        showToast('Fehler beim Löschen', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// BEWERBUNGSMAPPE - Portfolio Builder
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialisiert den Bewerbungsmappe-Tab
 */
function initPortfolioTab() {
    console.log('📁 Initialisiere Bewerbungsmappe-Tab...');
    
    // Lade verfügbare Dokumente in die Dropdowns
    loadPortfolioOptions();
    
    // Template-Auswahl
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            localStorage.setItem('portfolio_template', card.dataset.template);
        });
    });
    
    // Toggle-Checkboxen
    document.querySelectorAll('.selector-toggle input').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const selector = e.target.closest('.document-selector');
            const dropdown = selector.querySelector('.document-dropdown, .multi-select');
            if (dropdown) {
                dropdown.style.opacity = e.target.checked ? '1' : '0.5';
                dropdown.style.pointerEvents = e.target.checked ? 'auto' : 'none';
            }
        });
    });
    
    // Design-Controls initialisieren
    setupPortfolioDesignControls();
    
    // Lade Design-Einstellungen aus Anschreiben/Lebenslauf wenn vorhanden
    loadDesignFromEditors();
}

/**
 * Initialisiert die Design-Controls für die Bewerbungsmappe
 */
function setupPortfolioDesignControls() {
    // Schriftgröße
    const fontSizeSlider = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.addEventListener('input', (e) => {
            fontSizeValue.textContent = `${e.target.value}pt`;
        });
    }
    
    // Zeilenabstand
    const lineHeightSlider = document.getElementById('lineHeight');
    const lineHeightValue = document.getElementById('lineHeightValue');
    if (lineHeightSlider && lineHeightValue) {
        lineHeightSlider.addEventListener('input', (e) => {
            lineHeightValue.textContent = e.target.value;
        });
    }
    
    // Seitenrand
    const pageMarginSlider = document.getElementById('pageMargin');
    const pageMarginValue = document.getElementById('pageMarginValue');
    if (pageMarginSlider && pageMarginValue) {
        pageMarginSlider.addEventListener('input', (e) => {
            pageMarginValue.textContent = `${e.target.value}mm`;
        });
    }
    
    // Absatz-Abstand
    const paragraphSpacingSlider = document.getElementById('paragraphSpacing');
    const paragraphSpacingValue = document.getElementById('paragraphSpacingValue');
    if (paragraphSpacingSlider && paragraphSpacingValue) {
        paragraphSpacingSlider.addEventListener('input', (e) => {
            paragraphSpacingValue.textContent = `${e.target.value}px`;
        });
    }
}

/**
 * Lädt Design-Einstellungen aus Anschreiben- und Lebenslauf-Designern
 */
window.loadDesignFromEditors = function() {
    console.log('🎨 Lade Design-Einstellungen aus Editoren...');
    
    // Lade aus Anschreiben-Designer
    const coverLetterDesign = localStorage.getItem('cover_letter_design_settings');
    if (coverLetterDesign) {
        try {
            const design = JSON.parse(coverLetterDesign);
            if (design.color) document.getElementById('accentColor').value = design.color;
            if (design.font) document.getElementById('fontFamily').value = design.font;
            if (design.fontSize) {
                document.getElementById('fontSize').value = design.fontSize;
                document.getElementById('fontSizeValue').textContent = `${design.fontSize}pt`;
            }
            if (design.lineHeight) {
                document.getElementById('lineHeight').value = design.lineHeight;
                document.getElementById('lineHeightValue').textContent = design.lineHeight;
            }
            if (design.margin) {
                document.getElementById('pageMargin').value = design.margin;
                document.getElementById('pageMarginValue').textContent = `${design.margin}mm`;
            }
            if (design.paragraphSpacing) {
                document.getElementById('paragraphSpacing').value = design.paragraphSpacing;
                document.getElementById('paragraphSpacingValue').textContent = `${design.paragraphSpacing}px`;
            }
            console.log('✅ Design vom Anschreiben-Designer geladen');
        } catch (e) {
            console.warn('Fehler beim Laden des Anschreiben-Designs:', e);
        }
    }
    
    // Lade aus Lebenslauf-Designer
    const resumeDesign = localStorage.getItem('resume_design_settings');
    if (resumeDesign) {
        try {
            const design = JSON.parse(resumeDesign);
            // Überschreibe nur wenn nicht bereits vom Anschreiben-Designer gesetzt
            if (design.accentColor && !coverLetterDesign) {
                document.getElementById('accentColor').value = design.accentColor;
            }
            if (design.textColor) {
                document.getElementById('textColor').value = design.textColor;
            }
            if (design.backgroundColor) {
                document.getElementById('backgroundColor').value = design.backgroundColor;
            }
            if (design.fontFamily && !coverLetterDesign) {
                document.getElementById('fontFamily').value = design.fontFamily.replace(/'/g, '');
            }
            if (design.fontSize && !coverLetterDesign) {
                document.getElementById('fontSize').value = design.fontSize;
                document.getElementById('fontSizeValue').textContent = `${design.fontSize}pt`;
            }
            if (design.lineHeight && !coverLetterDesign) {
                document.getElementById('lineHeight').value = design.lineHeight;
                document.getElementById('lineHeightValue').textContent = design.lineHeight;
            }
            if (design.marginTop && !coverLetterDesign) {
                const avgMargin = (parseInt(design.marginTop) + parseInt(design.marginBottom || design.marginTop)) / 2;
                document.getElementById('pageMargin').value = Math.round(avgMargin);
                document.getElementById('pageMarginValue').textContent = `${Math.round(avgMargin)}mm`;
            }
            if (design.paragraphGap && !coverLetterDesign) {
                document.getElementById('paragraphSpacing').value = design.paragraphGap;
                document.getElementById('paragraphSpacingValue').textContent = `${design.paragraphGap}px`;
            }
            if (design.showPageNumbers !== undefined) {
                document.getElementById('showPageNumbers').checked = design.showPageNumbers;
            }
            console.log('✅ Design vom Lebenslauf-Designer geladen');
        } catch (e) {
            console.warn('Fehler beim Laden des Lebenslauf-Designs:', e);
        }
    }
    
    showToast('Design-Einstellungen geladen', 'success');
};

/**
 * Lädt verfügbare Dokumente für die Auswahlmenüs
 * OPTIMIERT: Nutzt Cache und lädt parallel
 */
async function loadPortfolioOptions() {
    const isLoggedIn = window.cloudDataService && window.cloudDataService.isUserLoggedIn();
    const cache = DashboardState._cachedData;
    const cacheValid = cache && (Date.now() - cache.timestamp) < 30000;
    
    // PARALLEL: Alle Daten gleichzeitig laden (oder aus Cache)
    const [coverLetters, resumes, documents] = await Promise.all([
        cacheValid && cache.coverLetters
            ? Promise.resolve(cache.coverLetters)
            : (isLoggedIn ? window.cloudDataService.getCoverLetters(false).catch(() => []) : Promise.resolve(JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]'))),
        
        cacheValid && cache.resumes
            ? Promise.resolve(cache.resumes)
            : (isLoggedIn ? window.cloudDataService.getResumes(false).catch(() => []) : Promise.resolve(JSON.parse(localStorage.getItem('user_resumes') || '[]'))),
        
        cacheValid && cache.documents
            ? Promise.resolve(cache.documents)
            : (isLoggedIn ? window.cloudDataService.getDocuments(false).catch(() => []) : Promise.resolve(JSON.parse(localStorage.getItem('user_certificates') || '[]')))
    ]);
    
    // UI Updates (sync - schnell)
    const coverSelect = document.getElementById('selectCoverLetter');
    if (coverSelect) {
        coverSelect.innerHTML = '<option value="">-- Anschreiben wählen --</option>' +
            coverLetters.map(cl => `<option value="${cl.id}">${cl.jobData?.title || cl.jobData?.company || 'Anschreiben'} (${new Date(cl.createdAt).toLocaleDateString('de-DE')})</option>`).join('');
    }
    
    const resumeSelect = document.getElementById('selectResume');
    if (resumeSelect) {
        resumeSelect.innerHTML = '<option value="">-- Lebenslauf wählen --</option>' +
            resumes.map(r => `<option value="${r.id}">${r.personalInfo?.firstName || ''} ${r.personalInfo?.lastName || 'Lebenslauf'}</option>`).join('');
    }
    
    // Fotos laden (aus lokalem Storage - schnell)
    const photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
    const photoSelect = document.getElementById('selectPhoto');
    if (photoSelect) {
        photoSelect.innerHTML = '<option value="">-- Foto wählen --</option>' +
            photos.map((p, i) => `<option value="${p.id}">Foto ${i + 1} (${new Date(p.createdAt).toLocaleDateString('de-DE')})</option>`).join('');
        
        const selectedId = localStorage.getItem('selected_photo_id');
        if (selectedId) {
            photoSelect.value = selectedId;
        }
    }
    
    const certList = document.getElementById('certificatesList');
    if (certList) {
        if (documents.length === 0) {
            certList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Keine Zeugnisse vorhanden</p>';
        } else {
            certList.innerHTML = documents.map(doc => `
                <label class="multi-select-item">
                    <input type="checkbox" value="${doc.id}" name="certificate">
                    ${doc.name || doc.fileName || 'Dokument'}
                </label>
            `).join('');
        }
    }
}

/**
 * Zeigt Vorschau der Bewerbungsmappe
 */
async function previewPortfolio() {
    const previewContainer = document.getElementById('portfolioPreview');
    if (!previewContainer) return;
    
    showToast('Erstelle Vorschau...', 'info');
    
    const settings = getPortfolioSettings();
    
    // Sammle alle Daten
    const data = await collectPortfolioData(settings);
    
    // Template und Design-Einstellungen
    const template = localStorage.getItem('portfolio_template') || 'classic';
    const designSettings = getPortfolioDesignSettings();
    
    // Generiere HTML-Vorschau mit allen Design-Einstellungen
    const html = generatePortfolioHTML(data, template, designSettings);
    
    // Wende Design-Einstellungen auf Container an
    const style = `
        font-family: ${designSettings.fontFamily}, sans-serif;
        font-size: ${designSettings.fontSize}pt;
        line-height: ${designSettings.lineHeight};
        color: ${designSettings.textColor};
        background: ${designSettings.backgroundColor};
        padding: ${designSettings.pageMargin}mm;
    `;
    
    previewContainer.innerHTML = `
        <div class="preview-document" style="${style}">
            ${html}
        </div>
    `;
    
    showToast('Vorschau erstellt', 'success');
}

function getPortfolioSettings() {
    return {
        includeCoverLetter: document.getElementById('includeCoverLetter')?.checked,
        includeResume: document.getElementById('includeResume')?.checked,
        includePhoto: document.getElementById('includePhoto')?.checked,
        includeCertificates: document.getElementById('includeCertificates')?.checked,
        coverLetterId: document.getElementById('selectCoverLetter')?.value,
        resumeId: document.getElementById('selectResume')?.value,
        photoId: document.getElementById('selectPhoto')?.value,
        certificateIds: Array.from(document.querySelectorAll('input[name="certificate"]:checked')).map(cb => cb.value)
    };
}

async function collectPortfolioData(settings) {
    const data = {
        coverLetter: null,
        resume: null,
        photo: null,
        certificates: []
    };
    
    // Anschreiben - CLOUD FIRST
    if (settings.includeCoverLetter && settings.coverLetterId) {
        let coverLetters = [];
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            try {
                coverLetters = await window.cloudDataService.getCoverLetters();
            } catch (e) {
                coverLetters = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
            }
        } else {
            coverLetters = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
        }
        data.coverLetter = coverLetters.find(cl => cl.id === settings.coverLetterId);
    }
    
    // Lebenslauf - CLOUD FIRST
    if (settings.includeResume && settings.resumeId) {
        let resumes = [];
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            try {
                resumes = await window.cloudDataService.getResumes();
            } catch (e) {
                resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
            }
        } else {
            resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
        }
        data.resume = resumes.find(r => r.id === settings.resumeId);
    }
    
    // Foto
    if (settings.includePhoto && settings.photoId) {
        const photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
        data.photo = photos.find(p => p.id === settings.photoId);
    }
    
    // Zeugnisse - CLOUD FIRST
    if (settings.includeCertificates && settings.certificateIds.length > 0) {
        let documents = [];
        if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
            try {
                documents = await window.cloudDataService.getDocuments();
            } catch (e) {
                documents = JSON.parse(localStorage.getItem('user_certificates') || '[]');
            }
        } else {
            documents = JSON.parse(localStorage.getItem('user_certificates') || '[]');
        }
        data.certificates = documents.filter(d => settings.certificateIds.includes(d.id));
    }
    
    return data;
}

/**
 * Sammelt alle Design-Einstellungen aus dem Portfolio-Design-Panel
 */
function getPortfolioDesignSettings() {
    return {
        template: localStorage.getItem('portfolio_template') || 'classic',
        accentColor: document.getElementById('accentColor')?.value || '#2563eb',
        textColor: document.getElementById('textColor')?.value || '#1e293b',
        backgroundColor: document.getElementById('backgroundColor')?.value || '#ffffff',
        fontFamily: document.getElementById('fontFamily')?.value || 'Inter',
        fontSize: parseFloat(document.getElementById('fontSize')?.value || 11),
        lineHeight: parseFloat(document.getElementById('lineHeight')?.value || 1.6),
        pageMargin: parseInt(document.getElementById('pageMargin')?.value || 25),
        paragraphSpacing: parseInt(document.getElementById('paragraphSpacing')?.value || 10),
        showPageNumbers: document.getElementById('showPageNumbers')?.checked || false,
        unifiedDesign: document.getElementById('unifiedDesign')?.checked !== false
    };
}

function generatePortfolioHTML(data, template, designSettings) {
    const { accentColor, textColor, fontSize, lineHeight, paragraphSpacing, showPageNumbers } = designSettings;
    let html = '';
    let pageNumber = 1;
    
    // Anschreiben-Seite
    if (data.coverLetter) {
        const pageNumberHTML = showPageNumbers ? `<div style="text-align: center; margin-top: 2rem; color: #999; font-size: 0.8rem;">Seite ${pageNumber}</div>` : '';
        html += `
            <div class="preview-page portfolio-page" style="border-bottom: 1px dashed #ccc; margin-bottom: ${paragraphSpacing}px; padding-bottom: ${paragraphSpacing}px;">
                <h3 style="color: ${accentColor}; margin-bottom: 1rem; font-size: ${fontSize + 2}pt;">Anschreiben</h3>
                <div style="white-space: pre-wrap; font-size: ${fontSize}pt; line-height: ${lineHeight}; color: ${textColor};">
                    ${data.coverLetter.content || ''}
                </div>
                ${pageNumberHTML}
            </div>
        `;
        pageNumber++;
    }
    
    // Lebenslauf-Seite
    if (data.resume) {
        const resumeHTML = generateResumePreview(data.resume, data.photo, template, designSettings);
        const pageNumberHTML = showPageNumbers ? `<div style="text-align: center; margin-top: 2rem; color: #999; font-size: 0.8rem;">Seite ${pageNumber}</div>` : '';
        html += `
            <div class="preview-page portfolio-page" style="border-bottom: 1px dashed #ccc; margin-bottom: ${paragraphSpacing}px; padding-bottom: ${paragraphSpacing}px;">
                ${resumeHTML}
                ${pageNumberHTML}
            </div>
        `;
        pageNumber++;
    }
    
    // Zeugnisse-Info
    if (data.certificates.length > 0) {
        const pageNumberHTML = showPageNumbers ? `<div style="text-align: center; margin-top: 2rem; color: #999; font-size: 0.8rem;">Seite ${pageNumber}</div>` : '';
        html += `
            <div class="preview-page portfolio-page">
                <h3 style="color: ${accentColor}; margin-bottom: 1rem; font-size: ${fontSize + 2}pt;">Anlagen</h3>
                <ul style="padding-left: 1.5rem; color: ${textColor}; font-size: ${fontSize}pt; line-height: ${lineHeight};">
                    ${data.certificates.map(c => `<li style="margin-bottom: ${paragraphSpacing / 2}px;">${c.name || c.fileName || 'Dokument'}</li>`).join('')}
                </ul>
                <p style="color: #666; font-size: ${fontSize - 1}pt; margin-top: 1rem;">
                    Die Zeugnisse werden dem PDF angehängt.
                </p>
                ${pageNumberHTML}
            </div>
        `;
    }
    
    if (!html) {
        html = `<div class="preview-page" style="text-align: center; padding: 3rem; color: ${textColor};"><p>Bitte wählen Sie mindestens ein Dokument aus.</p></div>`;
    }
    
    return html;
}

function generateResumePreview(resume, photo, template, designSettings) {
    const { accentColor, textColor, fontSize, lineHeight, paragraphSpacing } = designSettings;
    const personal = resume.personalInfo || {};
    const name = `${personal.firstName || ''} ${personal.lastName || ''}`.trim() || 'Ihr Name';
    
    let photoHTML = '';
    if (photo) {
        const photoStyle = template === 'creative' ? 'border-radius: 50%;' : 'border-radius: 8px;';
        photoHTML = `<img src="${photo.dataUrl || photo.url}" alt="Bewerbungsfoto" style="width: 100px; height: 130px; object-fit: cover; ${photoStyle}">`;
    }
    
    return `
        <div style="display: flex; gap: 1.5rem; margin-bottom: ${paragraphSpacing}px;">
            ${photoHTML}
            <div>
                <h2 style="color: ${accentColor}; margin-bottom: 0.5rem; font-size: ${fontSize + 4}pt;">${name}</h2>
                <p style="color: ${textColor}; opacity: 0.8; font-size: ${fontSize}pt; line-height: ${lineHeight};">${personal.title || ''}</p>
                <p style="color: ${textColor}; opacity: 0.7; font-size: ${fontSize - 1}pt; line-height: ${lineHeight};">${personal.email || ''}</p>
                <p style="color: ${textColor}; opacity: 0.7; font-size: ${fontSize - 1}pt; line-height: ${lineHeight};">${personal.phone || ''}</p>
            </div>
        </div>
        ${personal.summary ? `<div style="margin-bottom: ${paragraphSpacing}px;"><strong style="color: ${accentColor}; font-size: ${fontSize + 1}pt;">Profil</strong><p style="font-size: ${fontSize}pt; line-height: ${lineHeight}; color: ${textColor}; margin-top: 0.5rem;">${personal.summary}</p></div>` : ''}
        <p style="color: ${textColor}; opacity: 0.6; font-size: ${fontSize - 2}pt; text-align: center; margin-top: 2rem;">
            Vollständiger Lebenslauf wird im PDF generiert...
        </p>
    `;
}

/**
 * Generiert das komplette Bewerbungsmappe-PDF
 * Verbesserte Version mit echtem PDF-Merge
 */
async function generatePortfolioPDF() {
    showToast('Bewerbungsmappe wird erstellt...', 'info');
    
    try {
        const settings = getPortfolioSettings();
        const data = await collectPortfolioData(settings);
        
        // Lade PDF-Bibliotheken
        await loadPDFLibraries();
        
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        // Metadaten
        const applicantName = data.resume?.personalInfo 
            ? `${data.resume.personalInfo.firstName || ''} ${data.resume.personalInfo.lastName || ''}`.trim()
            : 'Bewerber';
        const position = data.coverLetter?.position || 'Position';
        const company = data.coverLetter?.company || 'Unternehmen';
        
        mergedPdf.setTitle(`Bewerbung - ${applicantName} - ${position}`);
        mergedPdf.setAuthor(applicantName);
        mergedPdf.setSubject(`Bewerbung für ${position} bei ${company}`);
        mergedPdf.setKeywords(['Bewerbung', 'Bewerbungsmappe', position, company]);
        mergedPdf.setCreationDate(new Date());
        
        const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
        const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
        
        let totalPages = 0;
        const bookmarks = [];
        
        // === 1. DECKBLATT (optional) ===
        if (settings.includeCoverPage) {
            const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4
            const { width, height } = coverPage.getSize();
            const accentColor = hexToRgb(document.getElementById('accentColor')?.value || '#2563eb');
            
            // Titel
            coverPage.drawText('BEWERBUNG', {
                x: 50,
                y: height - 200,
                size: 36,
                font: fontBold,
                color: rgb(accentColor.r / 255, accentColor.g / 255, accentColor.b / 255)
            });
            
            // Position
            coverPage.drawText(`als ${position}`, {
                x: 50,
                y: height - 250,
                size: 18,
                font: font,
                color: rgb(0.3, 0.3, 0.3)
            });
            
            // Bei Firma
            coverPage.drawText(`bei ${company}`, {
                x: 50,
                y: height - 280,
                size: 14,
                font: font,
                color: rgb(0.5, 0.5, 0.5)
            });
            
            // Bewerber
            coverPage.drawText(applicantName, {
                x: 50,
                y: height - 400,
                size: 24,
                font: fontBold,
                color: rgb(0.1, 0.1, 0.1)
            });
            
            // Datum
            const today = new Date().toLocaleDateString('de-DE', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            });
            coverPage.drawText(today, {
                x: 50,
                y: 80,
                size: 12,
                font: font,
                color: rgb(0.5, 0.5, 0.5)
            });
            
            totalPages++;
            bookmarks.push({ title: 'Deckblatt', page: totalPages });
        }
        
        // === 2. INHALTSVERZEICHNIS (optional) ===
        if (settings.includeTableOfContents) {
            // Platzhalter - wird am Ende aktualisiert
            const tocPage = mergedPdf.addPage([595.28, 841.89]);
            totalPages++;
        }
        
        // === 3. ANSCHREIBEN ===
        if (data.coverLetter?.content) {
            bookmarks.push({ title: 'Anschreiben', page: totalPages + 1 });
            
            // Versuche bestehendes PDF zu laden oder generiere neues
            let coverLetterPdf;
            try {
                if (data.coverLetter.pdfData) {
                    coverLetterPdf = await PDFDocument.load(data.coverLetter.pdfData);
                } else {
                    // Generiere PDF aus Content
                    coverLetterPdf = await generateCoverLetterPDF(data.coverLetter, font, fontBold);
                }
                
                const pages = await mergedPdf.copyPages(coverLetterPdf, coverLetterPdf.getPageIndices());
                pages.forEach(page => {
                    mergedPdf.addPage(page);
                    totalPages++;
                });
            } catch (e) {
                console.warn('Anschreiben konnte nicht als PDF geladen werden, erstelle neu');
                const clPage = mergedPdf.addPage([595.28, 841.89]);
                const lines = splitTextIntoLines(data.coverLetter.content, 80);
                let y = 750;
                for (const line of lines) {
                    if (y < 50) {
                        const newPage = mergedPdf.addPage([595.28, 841.89]);
                        y = 750;
                        totalPages++;
                    }
                    clPage.drawText(line, { x: 50, y, size: 11, font });
                    y -= 16;
                }
                totalPages++;
            }
        }
        
        // === 4. LEBENSLAUF ===
        if (data.resume) {
            bookmarks.push({ title: 'Lebenslauf', page: totalPages + 1 });
            
            try {
                if (data.resume.pdfData) {
                    const resumePdf = await PDFDocument.load(data.resume.pdfData);
                    const pages = await mergedPdf.copyPages(resumePdf, resumePdf.getPageIndices());
                    pages.forEach(page => {
                        mergedPdf.addPage(page);
                        totalPages++;
                    });
                } else {
                    // Erstelle vereinfachten Lebenslauf
                    const resumePage = await createResumePages(mergedPdf, data.resume, font, fontBold);
                    totalPages += resumePage;
                }
            } catch (e) {
                console.warn('Lebenslauf Fehler:', e);
            }
        }
        
        // === 5. ZEUGNISSE / ANLAGEN ===
        if (data.certificates && data.certificates.length > 0) {
            bookmarks.push({ title: 'Anlagen', page: totalPages + 1 });
            
            for (const cert of data.certificates) {
                try {
                    let certData;
                    
                    // Verschiedene Datenquellen prüfen
                    if (cert.pdfData) {
                        certData = cert.pdfData;
                    } else if (cert.data) {
                        certData = cert.data;
                    } else if (cert.url && cert.url.startsWith('data:application/pdf')) {
                        // Base64 PDF
                        const base64 = cert.url.split(',')[1];
                        certData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                    } else if (cert.base64) {
                        certData = Uint8Array.from(atob(cert.base64), c => c.charCodeAt(0));
                    }
                    
                    if (certData) {
                        const certPdf = await PDFDocument.load(certData);
                        const pages = await mergedPdf.copyPages(certPdf, certPdf.getPageIndices());
                        pages.forEach(page => {
                            mergedPdf.addPage(page);
                            totalPages++;
                        });
                        console.log(`✅ Zeugnis hinzugefügt: ${cert.name || cert.fileName}`);
                    }
                } catch (e) {
                    console.warn(`Zeugnis konnte nicht hinzugefügt werden: ${cert.name}`, e);
                }
            }
        }
        
        // === SEITENZAHLEN HINZUFÜGEN ===
        if (settings.addPageNumbers) {
            const pages = mergedPdf.getPages();
            const startPage = settings.includeCoverPage ? 1 : 0;
            
            for (let i = startPage; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const text = `Seite ${i + 1 - startPage} von ${pages.length - startPage}`;
                const textWidth = font.widthOfTextAtSize(text, 10);
                
                page.drawText(text, {
                    x: (width - textWidth) / 2,
                    y: 25,
                    size: 10,
                    font,
                    color: rgb(0.5, 0.5, 0.5)
                });
            }
        }
        
        // === PDF SPEICHERN ===
        const pdfBytes = await mergedPdf.save();
        
        // Download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const filename = `Bewerbungsmappe_${applicantName.replace(/\s+/g, '_')}_${company.replace(/\s+/g, '_')}.pdf`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`Bewerbungsmappe erstellt! (${totalPages} Seiten, ${(pdfBytes.byteLength / 1024).toFixed(0)} KB)`, 'success');
        console.log(`✅ Bewerbungsmappe: ${totalPages} Seiten, ${(pdfBytes.byteLength / 1024).toFixed(0)} KB`);
        
    } catch (error) {
        console.error('Portfolio PDF Error:', error);
        showToast('Fehler beim Erstellen der Bewerbungsmappe', 'error');
        
        // Fallback zur alten Methode
        createPortfolioPDFLegacy();
    }
}

async function loadPDFLibraries() {
    // pdf-lib laden falls nicht vorhanden
    if (!window.PDFLib) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function splitTextIntoLines(text, maxChars) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
        if ((currentLine + ' ' + word).length > maxChars) {
            if (currentLine) lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine += ' ' + word;
        }
    }
    if (currentLine) lines.push(currentLine.trim());
    
    return lines;
}

async function generateCoverLetterPDF(coverLetter, font, fontBold) {
    const { PDFDocument, rgb } = PDFLib;
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const { height } = page.getSize();
    
    let y = height - 50;
    const lines = splitTextIntoLines(coverLetter.content || '', 85);
    
    for (const line of lines) {
        if (y < 50) {
            const newPage = doc.addPage([595.28, 841.89]);
            y = height - 50;
        }
        page.drawText(line, { x: 50, y, size: 11, font, color: rgb(0, 0, 0) });
        y -= 16;
    }
    
    return doc;
}

async function createResumePages(pdfDoc, resumeData, font, fontBold) {
    const { rgb } = PDFLib;
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    
    let y = height - 50;
    const personal = resumeData.personalInfo || {};
    const name = `${personal.firstName || ''} ${personal.lastName || ''}`.trim();
    
    // Name
    page.drawText(name || 'Lebenslauf', {
        x: 50, y, size: 24, font: fontBold, color: rgb(0.1, 0.1, 0.1)
    });
    y -= 30;
    
    // Kontaktdaten
    if (personal.email) {
        page.drawText(`E-Mail: ${personal.email}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
        y -= 14;
    }
    if (personal.phone) {
        page.drawText(`Telefon: ${personal.phone}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
        y -= 14;
    }
    
    y -= 20;
    
    // Erfahrung
    if (resumeData.experience?.length) {
        page.drawText('BERUFSERFAHRUNG', { x: 50, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.8) });
        y -= 20;
        
        for (const exp of resumeData.experience) {
            page.drawText(`${exp.position || ''} - ${exp.company || ''}`, { x: 50, y, size: 11, font: fontBold });
            y -= 14;
            page.drawText(`${exp.startDate || ''} - ${exp.endDate || 'heute'}`, { x: 50, y, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
            y -= 20;
        }
    }
    
    y -= 10;
    
    // Ausbildung
    if (resumeData.education?.length) {
        page.drawText('AUSBILDUNG', { x: 50, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.8) });
        y -= 20;
        
        for (const edu of resumeData.education) {
            page.drawText(`${edu.degree || ''} - ${edu.institution || ''}`, { x: 50, y, size: 11, font: fontBold });
            y -= 14;
            page.drawText(`${edu.startDate || ''} - ${edu.endDate || ''}`, { x: 50, y, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
            y -= 20;
        }
    }
    
    return 1; // Anzahl der erstellten Seiten
}

function createPortfolioPDFLegacy() {
    // Alte Fallback-Methode mit html2pdf
    console.log('⚠️ Verwende Legacy-PDF-Export');
    
    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
            showToast('Bitte erneut versuchen', 'info');
        };
        document.head.appendChild(script);
        return;
    }
    
    const previewContainer = document.getElementById('portfolioPreview');
    if (previewContainer) {
        html2pdf()
            .set({
                margin: 10,
                filename: 'Bewerbungsmappe.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(previewContainer)
            .save()
            .then(() => showToast('Bewerbungsmappe erstellt (Legacy)', 'success'));
    }
}

// Export neue Funktionen
window.initPhotosTab = initPhotosTab;
window.loadPhotos = loadPhotos;
window.selectPhoto = selectPhoto;
window.viewPhoto = viewPhoto;
window.deletePhoto = deletePhoto;
window.initPortfolioTab = initPortfolioTab;
window.loadPortfolioOptions = loadPortfolioOptions;
window.previewPortfolio = previewPortfolio;
window.generatePortfolioPDF = generatePortfolioPDF;

// Export DashboardCore for external access
window.DashboardCore = {
    checkAuthStatus,
    updateAuthUI,
    closeMobileMenu,
    showTab,
    showToast
};

