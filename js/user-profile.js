// User Profile JavaScript
class UserProfile {
    constructor() {
        this.currentTab = 'personal';
        this.profileData = {};
        this.progressData = {};
        this.awsProfileAPI = window.awsProfileAPI;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadProfileDataFromAWS();
        
        // Initialisiere progressData, falls noch nicht gesetzt
        if (!this.progressData || Object.keys(this.progressData).length === 0) {
            this.progressData = this.loadProgressData();
        }
        
        this.updateProgressDisplay();
        this.updateStats();
        this.checkAuthStatus();
        
        // Check if we need to migrate local data to AWS
        await this.migrateLocalDataIfNeeded();
        
        // Aktiviere Auto-Save wenn User angemeldet ist
        this.setupAutoSave();
        
        // Aktiviere Auto-Save auch nach Login
        document.addEventListener('userLoggedIn', () => {
            // Reset Auto-Save Flag beim Login, damit es neu initialisiert werden kann
            this._autoSaveInitialized = false;
            this.setupAutoSave();
        });
        
        // Initialisiere Applications Tab
        this.initApplicationsTab();
        
        // Handle hash navigation - am Ende nach allen asynchronen Operationen
        // Verwende mehrschichtige Verzögerung für maximale Zuverlässigkeit
        const performHashNavigation = () => {
            // Prüfe sofort, ob Hash vorhanden ist
            const hash = window.location.hash.slice(1);
            if (hash && ['personal', 'applications', 'settings', 'progress', 'achievements'].includes(hash)) {
                // Hash vorhanden - führe Navigation mit Polling aus
                this.handleHashNavigation();
            } else {
                // Kein Hash - Standard-Tab aktivieren
                this.handleHashNavigation();
            }
        };

        // Mehrschichtige Verzögerung für maximale Zuverlässigkeit
        requestAnimationFrame(() => {
            setTimeout(() => {
                performHashNavigation();
            }, 100); // Erhöht von 50ms auf 100ms für bessere Zuverlässigkeit
        });
        
        // Event-Listener für Hash-Änderungen
        window.addEventListener('hashchange', () => this.handleHashNavigation());
        
        // Zusätzliche Hash-Navigation nach kurzer Verzögerung
        // Dies stellt sicher, dass auch bei sehr langsamen Verbindungen die Navigation funktioniert
        setTimeout(() => {
            const hash = window.location.hash.slice(1);
            if (hash && ['personal', 'applications', 'settings', 'progress', 'achievements'].includes(hash)) {
                // Prüfe ob Tab bereits aktiv ist
                const activeTab = document.querySelector('.tab-btn.active');
                const expectedTab = document.querySelector(`[data-tab="${hash}"]`);
                if (activeTab !== expectedTab) {
                    console.log('🔄 Zusätzliche Hash-Navigation nach Verzögerung...');
                    this.handleHashNavigation();
                }
            }
        }, 500); // Nach 500ms nochmal prüfen
    }
    
    handleHashNavigation(maxAttempts = 10, currentAttempt = 0) {
        // Prüfe, ob Tab-Elemente bereits geladen sind
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        // Prüfe auf spezifische Elemente für alle möglichen Tabs
        const requiredTabs = ['personal', 'applications', 'settings', 'progress', 'achievements'];
        const allTabsExist = requiredTabs.every(tabName => {
            const button = document.querySelector(`[data-tab="${tabName}"]`);
            const panel = document.getElementById(tabName);
            return button !== null && panel !== null;
        });
        
        if (!allTabsExist) {
            if (currentAttempt < maxAttempts) {
                console.log(`⏳ Tab-Elemente noch nicht geladen (Versuch ${currentAttempt + 1}/${maxAttempts}), verzögere Hash-Navigation...`);
                setTimeout(() => this.handleHashNavigation(maxAttempts, currentAttempt + 1), 100);
                return;
            } else {
                console.error('❌ Tab-Elemente nach', maxAttempts, 'Versuchen nicht gefunden. Verwende Standard-Tab.');
                // Fallback: Standard-Tab aktivieren
                const hash = window.location.hash.slice(1);
                if (!hash || !['personal', 'applications', 'settings', 'progress', 'achievements'].includes(hash)) {
                    this.switchTab('personal');
                }
                return;
            }
        }
        
        const hash = window.location.hash.slice(1); // Remove the #
        if (hash && ['personal', 'applications', 'settings', 'progress', 'achievements'].includes(hash)) {
            console.log('📍 Navigating to tab:', hash);
            this.switchTab(hash);
        } else if (!hash) {
            // Default to personal tab if no hash
            this.switchTab('personal');
        }
    }

    checkAuthStatus() {
        console.log('🔍 Checking auth status...');
        console.log('🔍 Real User Auth available:', !!window.realUserAuth);
        console.log('🔍 Is logged in:', window.realUserAuth ? window.realUserAuth.isLoggedIn() : false);
        
        // Check if user is authenticated with Real User Auth
        if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
            const currentUser = window.realUserAuth.getCurrentUser();
            console.log('👤 Current user from auth:', currentUser);
            
            if (currentUser) {
                this.updateUserInfoFromAuth(currentUser);
                console.log('✅ User authenticated, profile loaded');
            } else {
                console.log('❌ No current user found, showing login prompt');
                this.showLoginPrompt();
            }
        } else {
            console.log('❌ Not authenticated, showing login prompt');
            this.showLoginPrompt();
        }
    }

    updateUserInfoFromAuth(user) {
        console.log('🔄 Updating user info from auth:', user);
        
        // Get user data from Real User Auth
        let userData = window.realUserAuth ? window.realUserAuth.getUserData() : null;
        if (userData) {
            console.log('👤 User data from auth:', userData);
        }
        
        // Use real user data - prioritize userData over user parameter
        const authUser = userData || user || {};
        const displayEmail = authUser.email || user?.email || '';
        const firstName = authUser.firstName || user?.firstName || '';
        const lastName = authUser.lastName || user?.lastName || '';
        const displayName = firstName && lastName ? 
            `${firstName} ${lastName}` : 
            (firstName || lastName || displayEmail?.split('@')[0] || 'Benutzer');
        
        console.log('📧 Display email:', displayEmail);
        console.log('👤 Display name:', displayName);
        console.log('👤 First name:', firstName);
        console.log('👤 Last name:', lastName);
        
        // Update form fields - always update if we have data from auth
        if (firstName) {
            const firstNameInput = document.getElementById('firstName');
            if (firstNameInput) {
                firstNameInput.value = firstName;
                console.log('✅ Updated firstName input:', firstName);
            }
        }
        
        if (lastName) {
            const lastNameInput = document.getElementById('lastName');
            if (lastNameInput) {
                lastNameInput.value = lastName;
                console.log('✅ Updated lastName input:', lastName);
            }
        }
        
        if (displayEmail) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = displayEmail;
                console.log('✅ Updated email input:', displayEmail);
            }
        }
        
        // Update display name
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = displayName;
            console.log('✅ Updated user name display:', displayName);
        }
        
        // Update email display
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) {
            userEmailEl.textContent = displayEmail;
            console.log('✅ Updated user email display:', displayEmail);
        }
        
        // Update profile header
        const profileHeaderName = document.querySelector('.profile-header h1');
        if (profileHeaderName) {
            profileHeaderName.textContent = displayName;
        }
        
        const profileHeaderEmail = document.querySelector('.profile-header .profile-email');
        if (profileHeaderEmail) {
            profileHeaderEmail.textContent = displayEmail;
        }
        
        // Also update profileData object
        if (firstName || lastName || displayEmail) {
            this.profileData = {
                ...this.profileData,
                firstName: firstName || this.profileData.firstName,
                lastName: lastName || this.profileData.lastName,
                email: displayEmail || this.profileData.email
            };
        }
    }

    showLoginPrompt() {
        // Don't show any login prompt - just redirect silently
        console.log('🔄 Redirecting to login page...');
        window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
    }

    redirectToLogin() {
        // Silent redirect without notification
        console.log('🔄 Redirecting to login page...');
        window.location.href = 'persoenlichkeitsentwicklung-uebersicht.html';
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Avatar upload
        const avatarUpload = document.querySelector('.avatar-upload');
        if (avatarUpload) {
            avatarUpload.addEventListener('click', () => {
                this.uploadAvatar();
            });
        }

        // Save button
        const saveBtn = document.querySelector('.btn-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        // Note: Auto-save wird in setupAutoSave() eingerichtet
        // Das wird separat aufgerufen, nachdem die Felder geladen wurden
    }

    switchTab(tabName) {
        try {
            // Prüfe, ob Tab-Button existiert
            const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
            if (!tabButton) {
                console.warn(`⚠️ Tab-Button für "${tabName}" nicht gefunden`);
                return;
            }

            // Prüfe, ob Tab-Panel existiert
            const tabPanel = document.getElementById(tabName);
            if (!tabPanel) {
                console.warn(`⚠️ Tab-Panel für "${tabName}" nicht gefunden`);
                return;
            }

            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            tabButton.classList.add('active');

            // Update tab panels
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            tabPanel.classList.add('active');

            this.currentTab = tabName;
            console.log(`✅ Tab gewechselt zu: ${tabName}`);

            // Update progress display if switching to progress tab
            if (tabName === 'progress') {
                this.updateProgressDisplay();
            }
        } catch (error) {
            console.error(`❌ Fehler beim Wechseln zum Tab "${tabName}":`, error);
        }
    }

    loadProfileData() {
        const defaultData = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            birthDate: '',
            location: '',
            profession: '',
            company: '',
            experience: '',
            industry: '',
            goals: '',
            interests: '',
            emailNotifications: true,
            weeklySummary: true,
            reminders: false,
            theme: 'light',
            language: 'de',
            dataSharing: false
        };

        const savedData = localStorage.getItem('userProfile');
        if (savedData) {
            return { ...defaultData, ...JSON.parse(savedData) };
        }

        return defaultData;
    }
    
    async loadProfileDataFromAWS() {
        try {
            console.log('📥 Loading profile from AWS...');
            
            if (!window.realUserAuth || !window.realUserAuth.isLoggedIn()) {
                console.log('⚠️ User not authenticated, loading from local storage');
                this.profileData = this.loadProfileData();
                return;
            }
            
            // Get auth user data first
            const currentUser = window.realUserAuth.getCurrentUser();
            const userData = window.realUserAuth.getUserData();
            console.log('👤 Auth user data:', currentUser, userData);
            
            // Load from AWS
            let awsData = null;
            try {
                awsData = await this.awsProfileAPI.loadProfile();
                console.log('✅ Profile loaded from AWS:', awsData);
            } catch (error) {
                console.warn('⚠️ Could not load from AWS, using defaults:', error);
            }
            
            // Merge: AWS data + Auth data (AWS data has priority, auth only as fallback)
            // IMPORTANT: Saved profile data should not be overwritten by auth data
            this.profileData = {
                ...this.loadProfileData(), // Start with defaults
                ...awsData, // Override with AWS data (saved profile data has priority)
                // Use auth data ONLY if AWS data doesn't have these fields
                firstName: awsData?.firstName || userData?.firstName || currentUser?.firstName || '',
                lastName: awsData?.lastName || userData?.lastName || currentUser?.lastName || '',
                email: awsData?.email || userData?.email || currentUser?.email || ''
            };
            
            console.log('📋 Final profile data:', this.profileData);
            
            // Update form fields with merged data
            this.populateFormFields(this.profileData);
            
            // Update profile image if available
            if (this.profileData.profileImageUrl) {
                const profileImg = document.getElementById('profileImage');
                if (profileImg) {
                    profileImg.src = this.profileData.profileImageUrl;
                }
            }
            
            // Also update from auth to ensure display is correct
            if (currentUser || userData) {
                this.updateUserInfoFromAuth(currentUser || userData);
            }
            
            // Stelle sicher, dass Auto-Save nach dem Laden der Daten aktiviert ist
            // (falls es beim ersten Mal fehlgeschlagen ist, weil Felder noch nicht geladen waren)
            // Nur wenn noch nicht initialisiert
            if (!this._autoSaveInitialized) {
                setTimeout(() => {
                    if (window.realUserAuth?.isLoggedIn() && this.awsProfileAPI) {
                        this.setupAutoSave();
                    }
                }, 500);
            }
        } catch (error) {
            console.error('❌ Failed to load profile from AWS:', error);
            // Fallback to local storage
            this.profileData = this.loadProfileData();
            this.populateFormFields(this.profileData);
            
            // Still try to update from auth
            if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
                const currentUser = window.realUserAuth.getCurrentUser();
                if (currentUser) {
                    this.updateUserInfoFromAuth(currentUser);
                }
            }
        }
    }
    
    populateFormFields(data) {
        // Populate form fields with loaded data
        // IMPORTANT: Set all fields, even if empty (to preserve user data)
        const setField = (id, value) => {
            const field = document.getElementById(id);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = value === true || value === 'true';
                } else {
                    field.value = value !== undefined && value !== null ? String(value) : '';
                }
            }
        };
        
        // Text fields (set even if empty)
        setField('firstName', data.firstName);
        setField('lastName', data.lastName);
        setField('email', data.email);
        setField('phone', data.phone);
        setField('birthDate', data.birthDate);
        setField('location', data.location);
        setField('profession', data.profession);
        setField('company', data.company);
        setField('experience', data.experience);
        setField('industry', data.industry);
        setField('goals', data.goals);
        setField('interests', data.interests);
        
        // Settings (checkboxes and selects)
        setField('emailNotifications', data.emailNotifications);
        setField('weeklySummary', data.weeklySummary);
        setField('reminders', data.reminders);
        setField('theme', data.theme);
        setField('language', data.language);
        setField('dataSharing', data.dataSharing);
        
        console.log('✅ Form fields populated with data:', data);
    }
    
    async migrateLocalDataIfNeeded() {
        try {
            // Check if we have local data but no AWS data
            const localData = localStorage.getItem('userProfile');
            if (localData && window.realUserAuth?.isLoggedIn()) {
                const awsData = await this.awsProfileAPI.loadProfile();
                if (!awsData) {
                    console.log('🔄 Migrating local data to AWS...');
                    await this.awsProfileAPI.syncLocalToAWS();
                }
            }
        } catch (error) {
            console.error('❌ Migration failed:', error);
        }
    }

    loadProgressData() {
        const defaultProgress = {
            completedMethods: 5,
            totalMethods: 29,
            categories: {
                'Selbstfindung': { completed: 3, total: 5 },
                'Entwicklung': { completed: 2, total: 8 },
                'Beziehungen': { completed: 0, total: 6 },
                'Karriere': { completed: 3, total: 4 }
            },
            recentActivity: [
                { method: 'Werte-Klärung', status: 'completed', date: 'vor 2 Tagen' },
                { method: 'Ikigai-Methode', status: 'completed', date: 'vor 1 Woche' },
                { method: 'Emotionale Intelligenz', status: 'started', date: 'vor 3 Tagen' }
            ],
            achievements: [
                { id: 'first-method', name: 'Erste Schritte', description: 'Erste Methode abgeschlossen', earned: true, date: 'vor 2 Tagen' },
                { id: 'values-explorer', name: 'Werte-Entdecker', description: 'Werte-Klärung abgeschlossen', earned: true, date: 'vor 2 Tagen' },
                { id: 'streak-master', name: 'Streak-Master', description: '7 Tage in Folge aktiv', earned: false, progress: '3/7 Tage' },
                { id: 'development-expert', name: 'Entwicklungs-Experte', description: '10 Methoden abgeschlossen', earned: false, progress: '5/10 Methoden' }
            ]
        };

        const savedProgress = localStorage.getItem('userProgress');
        if (savedProgress) {
            return { ...defaultProgress, ...JSON.parse(savedProgress) };
        }

        return defaultProgress;
    }

    updateStats() {
        const stats = {
            completedMethods: this.progressData.completedMethods,
            totalProgress: Math.round((this.progressData.completedMethods / this.progressData.totalMethods) * 100),
            streakDays: 3 // This would be calculated from actual data
        };

        // Update stat displays
        const completedEl = document.getElementById('completedMethods');
        const progressEl = document.getElementById('totalProgress');
        const streakEl = document.getElementById('streakDays');

        if (completedEl) completedEl.textContent = stats.completedMethods;
        if (progressEl) progressEl.textContent = stats.totalProgress + '%';
        if (streakEl) streakEl.textContent = stats.streakDays;
    }

    updateProgressDisplay() {
        // Prüfe ob progressData verfügbar ist
        if (!this.progressData) {
            console.warn('⚠️ progressData nicht verfügbar, initialisiere mit Standardwerten');
            this.progressData = this.loadProgressData();
        }
        
        // Update overall progress
        const completedMethods = this.progressData.completedMethods || 0;
        const totalMethods = this.progressData.totalMethods || 29;
        const overallProgress = totalMethods > 0 ? Math.round((completedMethods / totalMethods) * 100) : 0;
        
        const overallProgressEl = document.getElementById('overallProgress');
        const overallProgressNumberEl = document.getElementById('overallProgressNumber');
        
        if (overallProgressEl) overallProgressEl.textContent = overallProgress + '%';
        if (overallProgressNumberEl) overallProgressNumberEl.textContent = completedMethods;

        // Update progress ring
        this.updateProgressRing(overallProgress);

        // Update category progress
        this.updateCategoryProgress();

        // Update recent activity
        this.updateRecentActivity();
    }

    updateProgressRing(percentage) {
        const circle = document.querySelector('.progress-ring-fill');
        if (circle) {
            const circumference = 2 * Math.PI * 54; // radius = 54
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }

    updateCategoryProgress() {
        // Prüfe ob progressData und categories existieren
        if (!this.progressData || !this.progressData.categories) {
            console.warn('⚠️ progressData.categories nicht verfügbar, überspringe updateCategoryProgress');
            return;
        }
        
        const categories = this.progressData.categories;
        
        Object.keys(categories).forEach(categoryKey => {
            const category = categories[categoryKey];
            const percentage = Math.round((category.completed / category.total) * 100);
            
            // Find the corresponding category card
            const categoryCards = document.querySelectorAll('.category-card');
            categoryCards.forEach(card => {
                const categoryName = card.querySelector('h4').textContent;
                if (categoryName === categoryKey) {
                    const progressFill = card.querySelector('.progress-fill');
                    const progressText = card.querySelector('.progress-text');
                    
                    if (progressFill) {
                        progressFill.style.width = percentage + '%';
                    }
                    if (progressText) {
                        progressText.textContent = `${category.completed}/${category.total} abgeschlossen`;
                    }
                }
            });
        });
    }

    updateRecentActivity() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        activityList.innerHTML = '';

        this.progressData.recentActivity.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const iconClass = activity.status === 'completed' ? 'fas fa-check-circle' : 'fas fa-play-circle';
            const iconColor = activity.status === 'completed' ? 'var(--success-color)' : 'var(--primary-color)';
            
            activityItem.innerHTML = `
                <div class="activity-icon" style="background: ${iconColor}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="activity-content">
                    <h5>${activity.method} ${activity.status === 'completed' ? 'abgeschlossen' : 'gestartet'}</h5>
                    <p>${activity.date}</p>
            </div>
        `;
        
            activityList.appendChild(activityItem);
        });
    }

    /**
     * Automatische Speicherung bei Änderungen (wenn angemeldet)
     */
    setupAutoSave(retryCount = 0) {
        // Prüfe ob User angemeldet ist
        if (!window.realUserAuth?.isLoggedIn() || !this.awsProfileAPI) {
            console.warn('⚠️ Auto-Save nicht aktiviert: User nicht angemeldet oder AWS API nicht verfügbar');
            return;
        }
        
        // Verhindere mehrfache Initialisierung
        if (this._autoSaveInitialized) {
            console.log('ℹ️ Auto-Save bereits initialisiert, überspringe erneute Initialisierung');
            return;
        }
        
        // Alle Input-Felder im Profil finden - suche in allen Tab-Panels
        // Da es kein Form-Element gibt, suchen wir direkt nach den Inputs in den Tab-Panels
        const profileInputs = document.querySelectorAll('.tab-panel input, .tab-panel textarea, .tab-panel select');
        
        if (profileInputs.length === 0) {
            if (retryCount < 3) {
                console.warn(`⚠️ Keine Profil-Input-Felder gefunden für Auto-Save (Versuch ${retryCount + 1}/3)`);
                // Retry nach kurzer Verzögerung, falls Felder noch nicht geladen sind
                setTimeout(() => this.setupAutoSave(retryCount + 1), 500);
            } else {
                console.error('❌ Auto-Save konnte nicht initialisiert werden: Keine Input-Felder gefunden nach 3 Versuchen');
            }
            return;
        }
        
        // Entferne alte Event-Listener falls vorhanden
        if (this._autoSaveHandler) {
            const oldInputs = document.querySelectorAll('.tab-panel input, .tab-panel textarea, .tab-panel select');
            oldInputs.forEach(input => {
                input.removeEventListener('input', this._autoSaveHandler);
                input.removeEventListener('change', this._autoSaveHandler);
                input.removeEventListener('blur', this._autoSaveHandler);
            });
        }
        
        // Debounce-Funktion für Auto-Save
        let autoSaveTimeout;
        const autoSave = async () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(async () => {
                try {
                    console.log('💾 Auto-Save: Speichere Profildaten...');
                    await this.saveProfileData();
                    console.log('✅ Profil automatisch gespeichert');
                    // Zeige nur stille Benachrichtigung (nicht zu aufdringlich)
                    // this.showNotification('Änderungen automatisch gespeichert', 'success');
                } catch (error) {
                    console.error('❌ Auto-Save fehlgeschlagen:', error);
                    // Zeige Fehler-Benachrichtigung
                    this.showNotification('Fehler beim automatischen Speichern: ' + (error.message || 'Unbekannter Fehler'), 'error');
                }
            }, 2000); // 2 Sekunden nach letzter Änderung
        };
        
        // Speichere Referenz zu autoSave für spätere Entfernung
        this._autoSaveHandler = autoSave;
        
        // Füge Event-Listener hinzu
        profileInputs.forEach(input => {
            input.addEventListener('input', autoSave, { passive: true });
            input.addEventListener('change', autoSave, { passive: true });
            input.addEventListener('blur', autoSave, { passive: true }); // Auch beim Verlassen des Feldes speichern
        });
        
        // Markiere als initialisiert
        this._autoSaveInitialized = true;
        
        console.log('✅ Auto-Save aktiviert für', profileInputs.length, 'Felder');
    }

    async saveProfileData() {
        // Sammle alle Formular-Daten
        const formData = {
            firstName: document.getElementById('firstName')?.value || '',
            lastName: document.getElementById('lastName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            birthDate: document.getElementById('birthDate')?.value || '',
            location: document.getElementById('location')?.value || '',
            profession: document.getElementById('profession')?.value || '',
            company: document.getElementById('company')?.value || '',
            experience: document.getElementById('experience')?.value || '',
            industry: document.getElementById('industry')?.value || '',
            goals: document.getElementById('goals')?.value || '',
            interests: document.getElementById('interests')?.value || '',
            emailNotifications: document.getElementById('emailNotifications')?.checked || false,
            weeklySummary: document.getElementById('weeklySummary')?.checked || false,
            reminders: document.getElementById('reminders')?.checked || false,
            theme: document.getElementById('theme')?.value || 'light',
            language: document.getElementById('language')?.value || 'de',
            dataSharing: document.getElementById('dataSharing')?.checked || false
        };

        console.log('📋 Gesammelte Formular-Daten:', formData);

        // Include profile image URL if available (always include if it exists in profileData)
        if (this.profileData.profileImageUrl !== undefined) {
            formData.profileImageUrl = this.profileData.profileImageUrl;
        }

        // Harmonisiertes Format: Speichere sowohl direkt als auch strukturiert
        const profileToSave = {
            // Direkte Felder (für Kompatibilität)
            ...formData,
            
            // Strukturierte Daten (für profile-setup.html Kompatibilität)
            personal: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                birthDate: formData.birthDate
            },
            
            // Metadaten
            type: 'user-profile', // Einheitlicher Typ
            updatedAt: new Date().toISOString()
        };

        // Preserve profileImageUrl if it exists
        if (this.profileData.profileImageUrl !== undefined) {
            profileToSave.profileImageUrl = this.profileData.profileImageUrl;
        }

        // Merge mit bestehenden Profildaten
        this.profileData = { ...this.profileData, ...profileToSave };
        
        console.log('💾 Zu speichernde Profildaten:', this.profileData);
        
        // Prüfe ob User angemeldet ist
        if (!window.realUserAuth?.isLoggedIn()) {
            const error = new Error('Benutzer nicht angemeldet');
            console.error('❌', error.message);
            throw error;
        }
        
        if (!this.awsProfileAPI) {
            const error = new Error('AWS Profile API nicht verfügbar');
            console.error('❌', error.message);
            throw error;
        }
        
        // Save to AWS (PRIMARY STORAGE - keine lokale Speicherung)
        try {
            console.log('💾 Speichere Profil in AWS...');
            console.log('📤 Gesendete Daten:', JSON.stringify(this.profileData, null, 2));
            
            const result = await this.awsProfileAPI.saveProfile(this.profileData);
            
            console.log('✅ Profil erfolgreich in AWS gespeichert:', result);
            
            // Validiere, dass die Daten wirklich gespeichert wurden
            // (Optional: Lade Profil nach kurzer Verzögerung erneut, um zu bestätigen)
            setTimeout(async () => {
                try {
                    const savedProfile = await this.awsProfileAPI.loadProfile();
                    if (savedProfile) {
                        console.log('✅ Validierung: Profil erfolgreich aus AWS geladen:', savedProfile);
                        // Prüfe ob wichtige Felder gespeichert wurden
                        if (savedProfile.firstName === this.profileData.firstName && 
                            savedProfile.lastName === this.profileData.lastName) {
                            console.log('✅ Validierung: Name-Felder korrekt gespeichert');
                        } else {
                            console.warn('⚠️ Validierung: Name-Felder stimmen nicht überein', {
                                saved: { firstName: savedProfile.firstName, lastName: savedProfile.lastName },
                                expected: { firstName: this.profileData.firstName, lastName: this.profileData.lastName }
                            });
                        }
                    }
                } catch (validationError) {
                    console.warn('⚠️ Validierung fehlgeschlagen:', validationError);
                }
            }, 1000);
            
            return result;
        } catch (error) {
            console.error('❌ Fehler beim Speichern des Profils in AWS:', error);
            console.error('Fehler-Details:', {
                message: error.message,
                stack: error.stack,
                response: error.response,
                profileData: this.profileData
            });
            
            // Detaillierte Fehlerbehandlung
            let errorMessage = 'Fehler beim Speichern des Profils';
            if (error.message) {
                errorMessage += ': ' + error.message;
            } else if (error.response) {
                try {
                    const errorData = await error.response.json();
                    errorMessage += ': ' + (errorData.error || errorData.message || 'Unbekannter Fehler');
                } catch (e) {
                    errorMessage += ': HTTP ' + error.response.status;
                }
            }
            
            throw new Error(errorMessage);
        }
    }

    async saveProfile() {
        try {
            this.showLoading('Profil wird gespeichert...');
            await this.saveProfileData();
            this.hideLoading();
            this.showNotification('Profil erfolgreich gespeichert!', 'success');
        } catch (error) {
            this.hideLoading();
            console.error('❌ Save profile error:', error);
            
            // Extract error message
            let errorMessage = 'Fehler beim Speichern des Profils.';
            
            if (error.message) {
                errorMessage += ' ' + error.message;
            } else if (error.response) {
                try {
                    const errorData = await error.response.json();
                    errorMessage += ' ' + (errorData.error || errorData.message || 'Unbekannter Fehler');
                } catch (e) {
                    errorMessage += ' HTTP ' + error.response.status;
                }
            } else if (typeof error === 'string') {
                errorMessage += ' ' + error;
            }
            
            // Check for specific error types
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                errorMessage = 'Sie sind nicht angemeldet. Bitte melden Sie sich erneut an.';
            } else if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
                errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
            } else if (errorMessage.includes('500') || errorMessage.includes('Internal')) {
                errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
            }
            
            this.showNotification(errorMessage, 'error');
            
            // Also log to console for debugging
            console.error('Full error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response,
                error: error
            });
        }
    }

    async uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    // Validierung der Datei
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (file.size > maxSize) {
                        throw new Error('Die Datei ist zu groß. Maximale Größe: 5MB');
                    }
                    
                    if (!file.type.startsWith('image/')) {
                        throw new Error('Bitte wählen Sie eine Bilddatei aus');
                    }
                    
                    this.showLoading('Profilbild wird hochgeladen...');
                    
                    // Upload to AWS S3
                    if (window.realUserAuth?.isLoggedIn() && this.awsProfileAPI) {
                        console.log('📤 Starte Profilbild-Upload...', {
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type
                        });
                        
                        const imageUrl = await this.awsProfileAPI.uploadProfileImage(file);
                        
                        console.log('✅ Profilbild erfolgreich hochgeladen:', imageUrl);
                        
                        // Update profile image
                        const img = document.getElementById('profileImage');
                        if (img) {
                            img.src = imageUrl + '?v=' + Date.now(); // Cache-Busting
                        }
                        
                        // Save image URL to profile data
                        this.profileData.profileImageUrl = imageUrl;
                        
                        // Save profile to persist the image URL
                        await this.saveProfileData();
                        
                        this.hideLoading();
                        this.showNotification('Profilbild erfolgreich hochgeladen!', 'success');
                    } else {
                        // Fallback to local storage
                        console.warn('⚠️ User nicht angemeldet oder AWS API nicht verfügbar, verwende lokalen Fallback');
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = document.getElementById('profileImage');
                            if (img) {
                                img.src = e.target.result;
                            }
                            this.hideLoading();
                            this.showNotification('Profilbild lokal gespeichert! (Bitte melden Sie sich an für Cloud-Speicherung)', 'warning');
                        };
                        reader.readAsDataURL(file);
                    }
                } catch (error) {
                    console.error('❌ Failed to upload avatar:', error);
                    this.hideLoading();
                    
                    // Detaillierte Fehlermeldung
                    let errorMessage = 'Fehler beim Hochladen des Profilbilds';
                    if (error.message) {
                        errorMessage += ': ' + error.message;
                    } else if (error.response) {
                        try {
                            const errorData = await error.response.json();
                            errorMessage += ': ' + (errorData.error || errorData.message || 'Unbekannter Fehler');
                        } catch (e) {
                            errorMessage += ': HTTP ' + error.response.status;
                        }
                    }
                    
                    this.showNotification(errorMessage, 'error');
                }
            }
        };
        input.click();
    }

    showLoading(message = 'Laden...') {
        // Remove any existing loading
        this.hideLoading();
        
        // Create loading overlay
        const loading = document.createElement('div');
        loading.id = 'profileLoading';
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        loading.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
                <div class="spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                "></div>
                <p style="margin: 0; color: #374151;">${message}</p>
            </div>
        `;
        
        document.body.appendChild(loading);
    }
    
    hideLoading() {
        const loading = document.getElementById('profileLoading');
        if (loading) {
            loading.remove();
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
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Applications Tab - Bewerbungsmanager
     */
    initApplicationsTab() {
        // Event Listener für "Neue Bewerbung erstellen" Button
        const startNewApplicationBtn = document.getElementById('startNewApplication');
        if (startNewApplicationBtn) {
            startNewApplicationBtn.addEventListener('click', () => {
                this.startNewApplication();
            });
        }

        // Event Listener für Status-Filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterApplications(statusFilter.value);
            });
        }

        // Lade Bewerbungsdaten wenn Tab aktiv ist
        if (this.currentTab === 'applications') {
            this.loadApplicationsData();
            this.loadCoverLetters();
            this.loadResumes();
        }
    }

    /**
     * Lade Anschreiben
     */
    async loadCoverLetters() {
        try {
            // TODO: API-Call für Anschreiben
            const coverLetters = []; // Placeholder
            
            const coverLettersList = document.getElementById('coverLettersList');
            if (!coverLettersList) return;

            if (coverLetters.length === 0) {
                // Empty state bleibt sichtbar
                return;
            }

            // Render cover letters
            coverLettersList.innerHTML = coverLetters.map(letter => `
                <div class="application-item">
                    <div class="application-info">
                        <h4>${letter.title || 'Anschreiben'}</h4>
                        <p>${letter.company || ''} - ${letter.date || ''}</p>
                    </div>
                    <div class="application-actions">
                        <button class="btn-icon" onclick="window.userProfile.editCoverLetter('${letter.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="window.userProfile.deleteCoverLetter('${letter.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading cover letters:', error);
        }
    }

    /**
     * Lade Lebensläufe
     */
    async loadResumes() {
        try {
            // API-Call für Lebensläufe
            const token = await this.getAuthToken();
            if (!token) return;

            const response = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const resumesList = document.getElementById('resumesList');
            if (!resumesList) return;

            if (response.status === 404) {
                // Kein Lebenslauf vorhanden - Empty state bleibt sichtbar
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load resumes');
            }

            const resume = await response.json();
            
            if (!resume || !resume.personalInfo) {
                // Empty state bleibt sichtbar
                return;
            }

            // Render resume
            const name = resume.personalInfo.firstName && resume.personalInfo.lastName
                ? `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`
                : 'Lebenslauf';
            
            const updatedAt = resume.updatedAt 
                ? new Date(resume.updatedAt).toLocaleDateString('de-DE')
                : '';

            resumesList.innerHTML = `
                <div class="application-item">
                    <div class="application-info">
                        <h4>${name}</h4>
                        <p>Zuletzt aktualisiert: ${updatedAt}</p>
                        ${resume.ocrProcessed ? '<span class="badge badge-success"><i class="fas fa-check"></i> OCR verarbeitet</span>' : ''}
                    </div>
                    <div class="application-actions">
                        <a href="applications/resume-editor.html" class="btn-icon" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn-icon" onclick="window.userProfile.deleteResume()" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading resumes:', error);
        }
    }

    /**
     * Get Auth Token
     */
    async getAuthToken() {
        if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
            const userData = window.realUserAuth.getUserData();
            return userData.idToken || '';
        }
        return '';
    }

    /**
     * Lösche Lebenslauf
     */
    async deleteResume() {
        if (!confirm('Möchten Sie Ihren Lebenslauf wirklich löschen?')) {
            return;
        }

        try {
            const token = await this.getAuthToken();
            if (!token) {
                this.showNotification('Bitte melden Sie sich an', 'error');
                return;
            }

            const response = await fetch('https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod/resume', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.loadResumes();
                this.showNotification('Lebenslauf gelöscht', 'success');
            } else {
                throw new Error('Failed to delete resume');
            }
        } catch (error) {
            console.error('Error deleting resume:', error);
            this.showNotification('Fehler beim Löschen', 'error');
        }
    }

    /**
     * Erstelle neues Anschreiben
     */
    createNewCoverLetter() {
        // TODO: Implementiere Anschreiben-Editor
        this.showNotification('Anschreiben-Editor wird noch implementiert', 'info');
    }

    /**
     * Lösche Anschreiben
     */
    deleteCoverLetter(id) {
        if (confirm('Möchten Sie dieses Anschreiben wirklich löschen?')) {
            // TODO: API-Call zum Löschen
            console.log('Delete cover letter:', id);
            this.loadCoverLetters();
        }
    }

    /**
     * Bearbeite Anschreiben
     */
    editCoverLetter(id) {
        // TODO: Implementiere Anschreiben-Editor
        this.showNotification('Anschreiben-Editor wird noch implementiert', 'info');
    }

    async loadApplicationsData() {
        try {
            console.log('📥 Loading applications data...');
            
            // Lade Bewerbungsdaten (kann aus verschiedenen Quellen kommen)
            let applications = [];
            
            // Versuche von Applications Core zu laden
            if (window.applicationsCore && window.applicationsCore.getApplicationData) {
                applications = await window.applicationsCore.getApplicationData();
            } else if (this.awsProfileAPI) {
                // Fallback: Lade aus Profil
                const profile = await this.awsProfileAPI.loadProfile();
                applications = profile?.applications || [];
            }
            
            console.log('✅ Applications loaded:', applications);
            
            // Update Statistics
            this.updateApplicationsStats(applications);
            
            // Render Applications List
            this.renderApplicationsList(applications);
            
        } catch (error) {
            console.error('❌ Failed to load applications data:', error);
            this.showNotification('Fehler beim Laden der Bewerbungsdaten', 'error');
        }
    }

    updateApplicationsStats(applications) {
        const total = applications.length;
        const active = applications.filter(app => 
            ['preparation', 'sent', 'confirmed', 'interview'].includes(app.status)
        ).length;
        const interviews = applications.filter(app => app.status === 'interview').length;
        const successful = applications.filter(app => 
            ['offer', 'confirmed'].includes(app.status)
        ).length;
        const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

        const totalEl = document.getElementById('totalApplications');
        const activeEl = document.getElementById('activeApplications');
        const successRateEl = document.getElementById('successRate');
        const interviewsEl = document.getElementById('interviewsScheduled');

        if (totalEl) totalEl.textContent = total;
        if (activeEl) activeEl.textContent = active;
        if (successRateEl) successRateEl.textContent = successRate + '%';
        if (interviewsEl) interviewsEl.textContent = interviews;
    }

    renderApplicationsList(applications) {
        const listContainer = document.getElementById('applicationsList');
        if (!listContainer) return;

        if (applications.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-briefcase"></i>
                    <h4>Noch keine Bewerbungen</h4>
                    <p>Erstelle deine erste Bewerbung mit dem Smart Workflow</p>
                    <button class="btn-primary" onclick="window.userProfile.startNewApplication()">
                        <i class="fas fa-plus"></i>
                        Neue Bewerbung erstellen
                    </button>
                </div>
            `;
            return;
        }

        const applicationsHTML = applications.map(app => {
            const statusClass = app.status || 'preparation';
            const statusLabels = {
                preparation: 'Vorbereitung',
                sent: 'Versendet',
                confirmed: 'Bestätigt',
                interview: 'Interview',
                offer: 'Angebot',
                rejected: 'Abgelehnt'
            };
            
            const date = app.appliedDate || app.createdAt || 'Nicht angegeben';
            const formattedDate = date !== 'Nicht angegeben' ? new Date(date).toLocaleDateString('de-DE') : date;

            return `
                <div class="application-item" data-status="${statusClass}">
                    <div class="application-info">
                        <h4>${app.position || app.jobTitle || 'Unbekannte Position'}</h4>
                        <p><strong>${app.company || 'Unbekanntes Unternehmen'}</strong></p>
                        <div class="application-meta">
                            <span class="application-status ${statusClass}">${statusLabels[statusClass] || statusClass}</span>
                            <span style="color: var(--text-secondary); font-size: 0.875rem;">
                                <i class="fas fa-calendar"></i> ${formattedDate}
                            </span>
                        </div>
                    </div>
                    <div class="application-actions">
                        <button class="btn-icon" onclick="window.userProfile.viewApplication('${app.id || app.appId}')" title="Ansehen">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="window.userProfile.editApplication('${app.id || app.appId}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="window.userProfile.deleteApplication('${app.id || app.appId}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = applicationsHTML;
    }

    filterApplications(status) {
        const items = document.querySelectorAll('.application-item');
        items.forEach(item => {
            if (status === 'all' || item.dataset.status === status) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Starte neue Bewerbung mit Workflow
     */
    async startNewApplication() {
        try {
            console.log('🚀 Starting new application workflow...');
            
            // Lade Profildaten für Vorausfüllung
            const profileData = this.profileData;
            
            // Vorausfüllen der Workflow-Daten mit Profildaten
            this.prefillWorkflowFromProfile(profileData);
            
            // Starte Workflow-Modal
            if (typeof window.showSmartWorkflowModal === 'function') {
                window.showSmartWorkflowModal();
            } else if (typeof window.startSmartWorkflow === 'function') {
                window.startSmartWorkflow();
            } else {
                throw new Error('Workflow-Funktion nicht gefunden');
            }
            
        } catch (error) {
            console.error('❌ Failed to start application workflow:', error);
            this.showNotification('Fehler beim Starten des Workflows: ' + (error.message || 'Unbekannter Fehler'), 'error');
        }
    }

    /**
     * Fülle Workflow-Daten mit Profildaten vor
     */
    prefillWorkflowFromProfile(profileData) {
        // Initialisiere Workflow-Daten falls nicht vorhanden
        if (!window.workflowData) {
            window.initializeWorkflowData();
        }

        // Mapping: Profil → Workflow
        const workflowData = {
            // Persönliche Daten
            firstName: profileData.firstName || profileData.personal?.firstName || '',
            lastName: profileData.lastName || profileData.personal?.lastName || '',
            email: profileData.email || profileData.personal?.email || '',
            phone: profileData.phone || profileData.personal?.phone || '',
            location: profileData.location || profileData.personal?.location || '',
            birthDate: profileData.birthDate || profileData.personal?.birthDate || '',
            
            // Berufliche Informationen
            currentPosition: profileData.profession || '',
            currentCompany: profileData.company || '',
            experienceYears: profileData.experience || '',
            industry: profileData.industry || '',
            
            // Karriereziele
            motivation: profileData.goals || '',
            interests: profileData.interests || ''
        };

        // Merge mit bestehenden Workflow-Daten
        window.workflowData = {
            ...window.workflowData,
            ...workflowData
        };

        // Speichere für späteren Zugriff
        window.saveWorkflowData();

        console.log('✅ Workflow-Daten mit Profildaten vorausgefüllt:', workflowData);
    }

    viewApplication(appId) {
        console.log('👁️ View application:', appId);
        // TODO: Implementiere Detail-Ansicht
        this.showNotification('Detail-Ansicht wird noch implementiert', 'info');
    }

    editApplication(appId) {
        console.log('✏️ Edit application:', appId);
        // TODO: Implementiere Bearbeitung
        this.showNotification('Bearbeitung wird noch implementiert', 'info');
    }

    async deleteApplication(appId) {
        if (!confirm('Möchten Sie diese Bewerbung wirklich löschen?')) {
            return;
        }

        try {
            console.log('🗑️ Delete application:', appId);
            // TODO: Implementiere Löschung
            this.showNotification('Löschung wird noch implementiert', 'info');
            // Nach Löschung: Daten neu laden
            await this.loadApplicationsData();
        } catch (error) {
            console.error('❌ Failed to delete application:', error);
            this.showNotification('Fehler beim Löschen der Bewerbung', 'error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userProfile = new UserProfile();
});

// Global functions for HTML onclick handlers
function saveProfile() {
    if (window.userProfile) {
        window.userProfile.saveProfile();
    }
}

function uploadAvatar() {
    if (window.userProfile) {
        window.userProfile.uploadAvatar();
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);