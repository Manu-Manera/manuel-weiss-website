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
        
        // PRIORITÄT: UnifiedProfileService nutzen wenn verfügbar
        if (window.unifiedProfileService) {
            window.unifiedProfileService.onProfileChange((profile) => {
                console.log('📊 UnifiedProfileService Änderung empfangen:', profile);
                if (profile && profile.firstName) {
                    this.profileData = { ...this.profileData, ...profile };
                    this.populateFormFields(this.profileData);
                    this.updateUIWithProfile(profile);
                }
            });
        }
        
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
        document.addEventListener('userLoggedIn', async () => {
            console.log('🔐 User logged in Event empfangen - lade Profildaten');
            // Reset Auto-Save Flag beim Login, damit es neu initialisiert werden kann
            this._autoSaveInitialized = false;
            this.setupAutoSave();
            // Auth-Status erneut prüfen nach Login
            this.checkAuthStatus();
            // Profildaten aus AWS laden
            await this.loadProfileDataFromAWS();
        });
        
        // Höre auf Auth-Ready Event
        document.addEventListener('awsAuthReady', async () => {
            console.log('🔐 AWS Auth Ready Event empfangen - lade Profildaten');
            this.checkAuthStatus();
            // Profildaten nochmal laden wenn Auth bereit
            if (window.realUserAuth?.isLoggedIn()) {
                await this.loadProfileDataFromAWS();
            }
        });
        
        // Initialisiere Applications Tab
        this.initApplicationsTab();
        
        // Handle hash navigation - am Ende nach allen asynchronen Operationen
        // Verwende mehrschichtige Verzögerung für maximale Zuverlässigkeit
        const performHashNavigation = () => {
            // Prüfe sofort, ob Hash vorhanden ist
            const hash = window.location.hash.slice(1);
            if (hash && ['personal', 'applications', 'settings', 'progress', 'achievements', 'training', 'nutrition', 'coach', 'journal'].includes(hash)) {
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
            if (hash && ['personal', 'applications', 'settings', 'progress', 'achievements', 'training', 'nutrition', 'coach', 'journal'].includes(hash)) {
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
        const requiredTabs = ['personal', 'applications', 'settings', 'progress', 'achievements', 'training', 'nutrition', 'coach', 'journal'];
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
                if (!hash || !['personal', 'applications', 'settings', 'progress', 'achievements', 'training', 'nutrition', 'coach', 'journal'].includes(hash)) {
                    this.switchTab('personal');
                }
                return;
            }
        }
        
        const hash = window.location.hash.slice(1); // Remove the #
        if (hash && ['personal', 'applications', 'settings', 'progress', 'achievements', 'training', 'nutrition', 'coach', 'journal'].includes(hash)) {
            console.log('📍 Navigating to tab:', hash);
            this.switchTab(hash);
        } else if (!hash) {
            // Default to personal tab if no hash
            this.switchTab('personal');
        }
    }

    checkAuthStatus(retryCount = 0) {
        console.log('🔍 Checking auth status (Versuch', retryCount + 1, ')...');
        
        // Prüfe direkt localStorage auf bestehende Session
        const hasStoredSession = localStorage.getItem('aws_auth_session') !== null;
        console.log('🔍 Has stored session:', hasStoredSession);
        
        // Prüfe ob Auth-System initialisiert ist
        const authSystem = window.realUserAuth || window.awsAuth;
        const isAuthInitialized = authSystem?.isInitialized;
        
        // Wenn Session im Storage existiert, warte länger auf Auth-System
        const maxRetries = hasStoredSession ? 20 : 10;
        
        // Warte bis Auth-System vollständig initialisiert ist
        if (!isAuthInitialized && retryCount < maxRetries) {
            console.log('⏳ Auth-System noch nicht vollständig initialisiert, warte...');
            setTimeout(() => this.checkAuthStatus(retryCount + 1), 200);
            return;
        }
        
        console.log('🔍 Real User Auth available:', !!window.realUserAuth);
        console.log('🔍 Is logged in:', window.realUserAuth ? window.realUserAuth.isLoggedIn() : false);
        
        // Check if user is authenticated with Real User Auth
        if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
            const currentUser = window.realUserAuth.getCurrentUser();
            console.log('👤 Current user from auth:', currentUser);
            
            if (currentUser) {
                this.updateUserInfoFromAuth(currentUser, { allowOverwrite: false });
                console.log('✅ User authenticated, profile loaded');
            } else {
                console.log('❌ No current user found, showing login prompt');
                this.showLoginPrompt();
            }
        } else {
            // Extra Check: Wenn Session existiert aber Auth sagt nicht eingeloggt
            // Dann warte noch etwas länger
            if (hasStoredSession && retryCount < 25) {
                console.log('⏳ Session existiert aber Auth noch nicht bereit, warte...');
                setTimeout(() => this.checkAuthStatus(retryCount + 1), 300);
                return;
            }
            console.log('❌ Not authenticated, showing login prompt');
            this.showLoginPrompt();
        }
    }

    updateUserInfoFromAuth(user, options = {}) {
        console.log('🔄 Updating user info from auth:', user);
        const allowOverwrite = options.allowOverwrite === true;
        
        // Get user data from Real User Auth (Methode heißt getUserDataFromToken)
        let userData = window.realUserAuth?.getUserDataFromToken?.() || null;
        if (userData) {
            console.log('👤 User data from auth:', userData);
        }
        
        // Use real user data - prioritize userData over user parameter
        const authUser = userData || user || {};
        const displayEmail = authUser.email || user?.email || '';
        let firstName = authUser.firstName || user?.firstName || '';
        let lastName = authUser.lastName || user?.lastName || '';
        
        // WICHTIG: "Test User" aus Auth-Daten ignorieren!
        const isTestUser = (firstName === 'Test' && lastName === 'User') || 
                          (firstName === 'Test' && !lastName) ||
                          (firstName === 'TestUser');
        if (isTestUser) {
            console.log('⚠️ "Test User" erkannt in Auth-Daten, ignoriere Namen');
            firstName = '';
            lastName = '';
        }
        
        const currentProfile = this.profileData || {};
        const resolvedFirstName = currentProfile.firstName || firstName || '';
        const resolvedLastName = currentProfile.lastName || lastName || '';
        const resolvedEmail = currentProfile.email || displayEmail || '';
        
        // WICHTIG: "Test" auch aus displayName entfernen
        let displayName = resolvedFirstName && resolvedLastName ? 
            `${resolvedFirstName} ${resolvedLastName}` : 
            (resolvedFirstName || resolvedLastName || resolvedEmail?.split('@')[0] || 'Benutzer');
        
        // Filter "Test" aus displayName
        if (displayName === 'Test' || displayName === 'Test User' || displayName === 'TestUser' || displayName.startsWith('Test ')) {
            displayName = resolvedEmail?.split('@')[0] || 'Benutzer';
        }
        
        console.log('📧 Display email:', displayEmail);
        console.log('👤 Display name:', displayName);
        console.log('👤 First name:', firstName);
        console.log('👤 Last name:', lastName);
        
        const shouldUpdateField = (fieldId, value, profileKey) => {
            if (!value) return false;
            if (allowOverwrite) return true;
            const input = document.getElementById(fieldId);
            const currentValue = input?.value?.trim() || '';
            const profileValue = (currentProfile?.[profileKey] || '').toString().trim();
            return !currentValue && !profileValue;
        };
        
        // Update form fields - only if empty or overwrite allowed
        if (shouldUpdateField('firstName', firstName, 'firstName')) {
            const firstNameInput = document.getElementById('firstName');
            if (firstNameInput) {
                firstNameInput.value = firstName;
                console.log('✅ Updated firstName input:', firstName);
            }
        }
        
        if (shouldUpdateField('lastName', lastName, 'lastName')) {
            const lastNameInput = document.getElementById('lastName');
            if (lastNameInput) {
                lastNameInput.value = lastName;
                console.log('✅ Updated lastName input:', lastName);
            }
        }
        
        if (shouldUpdateField('email', displayEmail, 'email')) {
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
            userEmailEl.textContent = resolvedEmail;
            console.log('✅ Updated user email display:', displayEmail);
        }
        
        // Update profile header
        const profileHeaderName = document.querySelector('.profile-header h1');
        if (profileHeaderName) {
            profileHeaderName.textContent = displayName;
        }
        
        const profileHeaderEmail = document.querySelector('.profile-header .profile-email');
        if (profileHeaderEmail) {
            profileHeaderEmail.textContent = resolvedEmail;
        }
        
        // Also update profileData object
        if (firstName || lastName || displayEmail) {
            this.profileData = {
                ...this.profileData,
                firstName: allowOverwrite ? (firstName || this.profileData.firstName) : (this.profileData.firstName || firstName),
                lastName: allowOverwrite ? (lastName || this.profileData.lastName) : (this.profileData.lastName || lastName),
                email: allowOverwrite ? (displayEmail || this.profileData.email) : (this.profileData.email || displayEmail)
            };
        }
    }

    showLoginPrompt() {
        // Zeige Login-Modal automatisch - Profilseite erfordert Anmeldung
        console.log('🔒 Profilseite erfordert Anmeldung - zeige Login-Modal');
        
        // Update the auth button to show "Anmelden" state
        this.updateAuthButtonState();
        
        // Zeige eine Info-Nachricht
        this.showNotification('Bitte anmelden um dein Profil zu sehen', 'info');
        
        // Öffne Login-Modal automatisch nach kurzer Verzögerung
        setTimeout(() => {
            if (window.authModals?.showLogin) {
                window.authModals.showLogin();
            } else if (window.showLoginModal) {
                window.showLoginModal();
            }
        }, 500);
    }
    
    updateAuthButtonState() {
        const authButton = document.getElementById('profileAuthButton');
        const authText = document.getElementById('profileAuthText');
        
        if (authButton && authText) {
            authButton.classList.remove('logged-in');
            authText.textContent = 'Anmelden';
        }
    }

    redirectToLogin() {
        // DON'T auto-redirect or auto-show modal
        // Just update the UI to show user is not logged in
        console.log('ℹ️ User not authenticated - login available via button');
        this.updateAuthButtonState();
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
        
        // Listen for login events to reload profile data
        window.addEventListener('userLoggedIn', async (e) => {
            console.log('🔄 User logged in event received, reloading profile data...');
            const user = e.detail?.user;
            if (user) {
                console.log('👤 Logged in user:', user.email);
                this.updateUserInfoFromAuth(user, { allowOverwrite: false });
                await this.loadProfileData();
                this.checkAuthStatus();
                this.setupAutoSave();
            }
        });
    }

    async switchTab(tabName) {
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
            
            // Initialize journal if switching to journal tab
            if (tabName === 'journal') {
                this.initJournalTab();
            }
            
            // Lade Bewerbungsdaten beim Wechsel zum applications-Tab
            if (tabName === 'applications') {
                // Dashboard wird im iframe geladen
                const iframe = document.getElementById('dashboardIframe');
                const loading = document.getElementById('iframeLoading');
                const error = document.getElementById('iframeError');
                
                if (!iframe) {
                    console.error('❌ Dashboard iframe nicht gefunden!');
                    return;
                }
                
                console.log('🔄 Initialisiere Dashboard iframe...');
                
                // Zeige Loading-State
                if (loading) loading.style.display = 'block';
                if (error) error.style.display = 'none';
                
                // Setze iframe src (falls noch nicht gesetzt)
                const dashboardUrl = 'applications/dashboard.html?action=new-application&embedded=true';
                const currentSrc = iframe.src || '';
                
                if (!currentSrc.includes('dashboard.html')) {
                    console.log('📡 Setze iframe src:', dashboardUrl);
                    iframe.src = dashboardUrl;
                } else {
                    console.log('ℹ️ iframe src bereits gesetzt');
                }
                
                // Load-Event Handler (einmalig)
                const loadHandler = () => {
                    console.log('✅ Dashboard iframe load-Event empfangen');
                    setTimeout(() => {
                        if (loading) loading.style.display = 'none';
                        if (error) error.style.display = 'none';
                    }, 500);
                    iframe.removeEventListener('load', loadHandler);
                };
                iframe.addEventListener('load', loadHandler);
                
                // Error-Event Handler
                const errorHandler = () => {
                    console.error('❌ Dashboard iframe Error-Event');
                    if (loading) loading.style.display = 'none';
                    if (error) error.style.display = 'block';
                    iframe.removeEventListener('error', errorHandler);
                };
                iframe.addEventListener('error', errorHandler);
                
                // PostMessage Handler für Dashboard-Kommunikation
                const messageHandler = (event) => {
                    if (event.data && event.data.source === 'dashboard') {
                        if (event.data.type === 'dashboard-loaded' || event.data.type === 'dashboard-initialized') {
                            console.log('✅ Dashboard hat geladen-Signal gesendet:', event.data.type);
                            if (loading) loading.style.display = 'none';
                            if (error) error.style.display = 'none';
                        }
                    }
                };
                window.addEventListener('message', messageHandler);
                
                // Timeout-Fallback (nach 5 Sekunden)
                setTimeout(() => {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                        if (iframeDoc && iframeDoc.body && iframeDoc.body.children.length > 0) {
                            console.log('✅ Dashboard iframe Inhalt gefunden');
                            if (loading) loading.style.display = 'none';
                        } else {
                            console.warn('⚠️ Dashboard iframe scheint leer zu sein');
                            if (loading) loading.style.display = 'none';
                        }
                    } catch (e) {
                        // CORS-Fehler ist normal bei iframes
                        console.log('ℹ️ CORS-Check nicht möglich (normal bei iframe)');
                        if (loading) loading.style.display = 'none';
                    }
                }, 5000);
            }
            
            // API-First: Lade Tab-Daten über API (nur wenn nicht applications, da das im iframe lädt)
            if (tabName !== 'applications') {
                await this.loadTabDataFromAPI(tabName);
            }
        } catch (error) {
            console.error(`❌ Fehler beim Wechseln zum Tab "${tabName}":`, error);
        }
    }

    getCoachingDataFromStorage() {
        try {
            const raw = localStorage.getItem('coaching_workflow_data');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && Object.keys(parsed).length > 0 ? parsed : null;
        } catch (error) {
            console.warn('⚠️ Konnte Coaching-Daten nicht lesen:', error);
            return null;
        }
    }

    getFachlicheEntwicklungFromStorage() {
        try {
            const steps = {};
            for (let i = 1; i <= 7; i++) {
                const raw = localStorage.getItem(`fachlicheEntwicklungStep${i}`);
                if (raw) {
                    steps[`step${i}`] = JSON.parse(raw);
                }
            }
            const finalRaw = localStorage.getItem('fachlicheEntwicklungFinalAnalysis');
            const finalAnalysis = finalRaw ? JSON.parse(finalRaw) : null;
            if (!Object.keys(steps).length && !finalAnalysis) {
                return null;
            }
            return {
                steps,
                finalAnalysis
            };
        } catch (error) {
            console.warn('⚠️ Konnte Fachliche-Entwicklung-Daten nicht lesen:', error);
            return null;
        }
    }

    async loadFachlicheEntwicklungFromCloud() {
        if (!window.workflowAPI) return null;
        try {
            const steps = {};
            for (let i = 1; i <= 7; i++) {
                const response = await window.workflowAPI.loadWorkflowStep('fachlicheEntwicklung', `step${i}`);
                if (response && response.stepData) {
                    steps[`step${i}`] = response.stepData;
                    localStorage.setItem(`fachlicheEntwicklungStep${i}`, JSON.stringify(response.stepData));
                }
            }
            let finalAnalysis = null;
            try {
                const results = await window.workflowAPI.getWorkflowResults('fachlicheEntwicklung');
                if (results && results.results) {
                    finalAnalysis = results.results;
                    localStorage.setItem('fachlicheEntwicklungFinalAnalysis', JSON.stringify(finalAnalysis));
                }
            } catch (error) {
                console.warn('⚠️ Fachliche-Entwicklung-Results konnten nicht geladen werden:', error);
            }
            if (!Object.keys(steps).length && !finalAnalysis) return null;
            return { steps, finalAnalysis };
        } catch (error) {
            console.warn('⚠️ Fachliche-Entwicklung-Clouddaten konnten nicht geladen werden:', error);
            return null;
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

        const coachingData = this.getCoachingDataFromStorage();
        // Fachliche Entwicklung wird nur aus localStorage geladen (sync)
        // Cloud-Daten werden in loadProfileDataFromAWS geladen
        const fachlicheData = this.getFachlicheEntwicklungFromStorage();
        const savedData = localStorage.getItem('userProfile');
        if (savedData) {
            const parsed = { ...defaultData, ...JSON.parse(savedData) };
            if (coachingData && !parsed.coaching) {
                parsed.coaching = coachingData;
            }
            if (fachlicheData && !parsed.fachlicheEntwicklung) {
                parsed.fachlicheEntwicklung = fachlicheData;
            }
            return parsed;
        }

        if (coachingData || fachlicheData) {
            return {
                ...defaultData,
                ...(coachingData ? { coaching: coachingData } : {}),
                ...(fachlicheData ? { fachlicheEntwicklung: fachlicheData } : {})
            };
        }
        return defaultData;
    }
    
    async loadProfileDataFromAWS(retryCount = 0) {
        try {
            console.log('📥 Loading profile from AWS (Versuch', retryCount + 1, ')...');
            
            // Prüfe ob Session im localStorage existiert
            const hasStoredSession = localStorage.getItem('aws_auth_session') !== null;
            
            // Warte auf Auth-Initialisierung wenn Session existiert
            if (hasStoredSession && (!window.realUserAuth || !window.realUserAuth.isLoggedIn()) && retryCount < 15) {
                console.log('⏳ Session existiert, warte auf Auth-Initialisierung...');
                await new Promise(resolve => setTimeout(resolve, 300));
                return this.loadProfileDataFromAWS(retryCount + 1);
            }
            
            if (!window.realUserAuth || !window.realUserAuth.isLoggedIn()) {
                console.log('⚠️ User not authenticated, loading from local storage');
                this.profileData = this.loadProfileData();
                return;
            }
            
            // PRIORITÄT 1: UnifiedProfileService verwenden (beste Datenquelle)
            if (window.unifiedProfileService?.isInitialized) {
                const unifiedData = window.unifiedProfileService.getProfile();
                if (unifiedData && unifiedData.firstName && unifiedData.firstName !== 'Test') {
                    console.log('✅ Nutze UnifiedProfileService:', unifiedData);
                    this.profileData = {
                        ...this.loadProfileData(), // Start with defaults
                        ...unifiedData,
                    };
                    this.populateFormFields(this.profileData);
                    if (this.profileData.profileImageUrl) {
                        const profileImg = document.getElementById('profileImage');
                        if (profileImg) profileImg.src = this.profileData.profileImageUrl;
                    }
                    return;
                }
            }
            
            // Get auth user data first
            const currentUser = window.realUserAuth.getCurrentUser();
            const userData = window.realUserAuth.getUserDataFromToken?.() || null;
            console.log('👤 Auth user data:', currentUser, userData);
            
            // Load from CloudDataService (primär) oder AWS API
            let awsData = null;
            if (window.cloudDataService && window.cloudDataService.isUserLoggedIn()) {
                try {
                    awsData = await window.cloudDataService.getProfile(true);
                    console.log('✅ Profile loaded from CloudDataService:', awsData);
                } catch (error) {
                    console.warn('⚠️ CloudDataService failed, fallback to awsProfileAPI:', error);
                }
            }
            
            if (!awsData) {
                try {
                    awsData = await this.awsProfileAPI.loadProfile();
                    console.log('✅ Profile loaded from AWS:', awsData);
                } catch (error) {
                    console.warn('⚠️ Could not load from AWS, using defaults:', error);
                }
            }

            if (awsData && Object.keys(awsData).length === 0) {
                awsData = null;
            }
            
            const normalizedAwsData = this.normalizeProfileData(awsData);
            const authFallback = this.getAuthFallbackData(userData || currentUser);
            
            // WICHTIG: "Test User" aus Auth-Daten ignorieren!
            const isTestUser = authFallback.firstName === 'Test' && authFallback.lastName === 'User';
            
            // Merge: AWS data + Auth data (AWS data has priority, auth only as fallback)
            // IMPORTANT: Saved profile data should not be overwritten by auth data
            this.profileData = {
                ...this.loadProfileData(), // Start with defaults
                ...normalizedAwsData, // Override with normalized AWS data (saved profile data has priority)
                // Use auth data ONLY if AWS data doesn't have these fields and NOT "Test User"
                firstName: normalizedAwsData.firstName || (!isTestUser ? authFallback.firstName : '') || '',
                lastName: normalizedAwsData.lastName || (!isTestUser ? authFallback.lastName : '') || '',
                email: normalizedAwsData.email || authFallback.email || ''
            };
            
            const coachingData = this.getCoachingDataFromStorage();
            if (coachingData && !this.profileData.coaching) {
                this.profileData.coaching = coachingData;
            }
            
            let fachlicheData = this.getFachlicheEntwicklungFromStorage();
            if (!fachlicheData) {
                fachlicheData = await this.loadFachlicheEntwicklungFromCloud();
            }
            if (fachlicheData && !this.profileData.fachlicheEntwicklung) {
                this.profileData.fachlicheEntwicklung = fachlicheData;
            }
            
            console.log('📋 Final profile data:', this.profileData);
            
            // Update form fields with merged data
            this.populateFormFields(this.profileData);
            
            // WICHTIG: UI aktualisieren (Name, Email, etc.) - NACH populateFormFields
            this.updateUIWithProfile(this.profileData);
            
            // Update profile image if available
            if (this.profileData.profileImageUrl) {
                const profileImg = document.getElementById('profileImage');
                if (profileImg) {
                    profileImg.src = this.profileData.profileImageUrl;
                }
            }
            
            // Also update from auth to ensure display is correct (aber nur wenn nicht "Test User")
            if (currentUser || userData) {
                this.updateUserInfoFromAuth(currentUser || userData, { allowOverwrite: false });
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
                    this.updateUserInfoFromAuth(currentUser, { allowOverwrite: false });
                }
            }
        }
    }

    normalizeProfileData(rawData) {
        if (!rawData) return {};
        const personal = rawData.personal || rawData.profile?.personal || {};
        const professional = rawData.professional || rawData.profile?.professional || {};
        const preferences = rawData.preferences || rawData.profile?.preferences || {};
        const name = rawData.name || rawData.profile?.name || '';
        const nameParts = name.split(' ').filter(Boolean);
        const nameFirst = nameParts[0] || '';
        const nameLast = nameParts.slice(1).join(' ') || '';
        
        // WICHTIG: Resume-Daten als Fallback nutzen (enthalten oft die echten Daten)
        let resumeData = {};
        if (rawData.resume) {
            try {
                const resume = typeof rawData.resume === 'string' ? JSON.parse(rawData.resume) : rawData.resume;
                const pi = resume.personalInfo || {};
                resumeData = {
                    firstName: pi.firstName || '',
                    lastName: pi.lastName || '',
                    email: pi.email || '',
                    phone: pi.phone || '',
                    location: pi.location || pi.address || '',
                    profession: pi.title || ''
                };
                console.log('📋 Resume-Daten als Fallback:', resumeData);
            } catch (e) {
                console.warn('⚠️ Konnte Resume nicht parsen:', e);
            }
        }
        
        // Priorität: Direkte Felder > personal > resume > name-parsing
        // ABER: Wenn Name = Auth-Testdaten ("Test", "User"), dann Resume bevorzugen
        const rawFirstName = rawData.firstName || rawData.profile?.firstName || personal.firstName || '';
        const rawLastName = rawData.lastName || rawData.profile?.lastName || personal.lastName || '';
        const isTestUser = (rawFirstName === 'Test' && rawLastName === 'User');
        
        return {
            ...rawData,
            firstName: (isTestUser && resumeData.firstName) ? resumeData.firstName : (rawFirstName || resumeData.firstName || nameFirst || ''),
            lastName: (isTestUser && resumeData.lastName) ? resumeData.lastName : (rawLastName || resumeData.lastName || nameLast || ''),
            email: rawData.email || rawData.profile?.email || personal.email || resumeData.email || '',
            phone: rawData.phone || rawData.profile?.phone || personal.phone || resumeData.phone || '',
            location: rawData.location || rawData.profile?.location || personal.location || resumeData.location || '',
            birthDate: rawData.birthDate || personal.birthDate || '',
            profession: rawData.profession || professional.profession || rawData.currentJob || resumeData.profession || '',
            company: rawData.company || professional.company || '',
            experience: rawData.experience || professional.experience || '',
            industry: rawData.industry || professional.industry || '',
            summary: rawData.summary || professional.summary || '',
            skills: rawData.skills || professional.skills || [],
            preferences: {
                ...preferences
            }
        };
    }

    getAuthFallbackData(authUser = {}) {
        const email = authUser.email || '';
        let firstName = authUser.firstName || '';
        let lastName = authUser.lastName || '';
        
        // WICHTIG: "Test User" ist ein Standard-Cognito-Name, nicht echte Daten
        if (firstName === 'Test' && lastName === 'User') {
            console.log('⚠️ Auth-Daten sind Testdaten, ignoriere für Name');
            firstName = '';
            lastName = '';
        }
        
        if (firstName || lastName) {
            return { firstName, lastName, email };
        }
        const name = authUser.name || '';
        const parts = name.split(' ').filter(Boolean);
        // Auch hier prüfen
        if (parts[0] === 'Test' && parts[1] === 'User') {
            return { firstName: '', lastName: '', email };
        }
        return {
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || '',
            email
        };
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
    
    /**
     * Aktualisiert UI-Elemente mit Profildaten
     */
    updateUIWithProfile(profile) {
        if (!profile) return;
        
        // WICHTIG: "Test User" komplett ignorieren
        const testNames = ['Test', 'Test User', 'TestUser', 'test', 'TEST'];
        const isTestUser = testNames.includes(profile.firstName) || 
                          (profile.firstName === 'Test' && (!profile.lastName || profile.lastName === 'User'));
        
        if (isTestUser) {
            console.log('⚠️ "Test User" erkannt in updateUIWithProfile, ignoriere');
            return; // Keine UI-Updates für Test-User
        }
        
        // Update Header-Bereich
        const userNameEl = document.getElementById('userName');
        const userEmailEl = document.getElementById('userEmail');
        const profileImageEl = document.getElementById('profileImage');
        
        if (userNameEl && profile.firstName) {
            const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
            // Zusätzliche Filterung für "Test"
            if (fullName && 
                fullName !== 'Test User' && 
                fullName !== 'Test' && 
                fullName !== 'TestUser' &&
                !fullName.startsWith('Test ')) {
                userNameEl.textContent = fullName;
                console.log('✅ Name aktualisiert:', fullName);
            } else {
                // Fallback: Email-Prefix verwenden
                const emailPrefix = profile.email?.split('@')[0] || '';
                if (emailPrefix && emailPrefix !== 'test') {
                    userNameEl.textContent = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
                    console.log('✅ Name aus Email generiert:', emailPrefix);
                }
            }
        }
        
        if (userEmailEl && profile.email) {
            userEmailEl.textContent = profile.email;
        }
        
        if (profileImageEl && profile.profileImageUrl) {
            profileImageEl.src = profile.profileImageUrl;
        }
        
        // Update auch Profile Header (falls vorhanden)
        const profileHeaderName = document.querySelector('.profile-header h2');
        if (profileHeaderName && userNameEl) {
            profileHeaderName.textContent = userNameEl.textContent;
        }
        
        console.log('✅ UI mit Profildaten aktualisiert:', {
            name: userNameEl?.textContent,
            email: userEmailEl?.textContent
        });
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
        const coachingData = this.getCoachingDataFromStorage();
        const fachlicheData = this.getFachlicheEntwicklungFromStorage(); // FEHLER BEHOBEN: Variable wurde nicht definiert
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
        
        if (coachingData || this.profileData.coaching) {
            profileToSave.coaching = coachingData || this.profileData.coaching;
        }
        if (fachlicheData || this.profileData.fachlicheEntwicklung) {
            profileToSave.fachlicheEntwicklung = fachlicheData || this.profileData.fachlicheEntwicklung;
        }

        // Preserve profileImageUrl if it exists
        if (this.profileData.profileImageUrl !== undefined) {
            profileToSave.profileImageUrl = this.profileData.profileImageUrl;
        }

        // Merge mit bestehenden Profildaten
        this.profileData = { ...this.profileData, ...profileToSave };
        
        console.log('💾 Zu speichernde Profildaten:', this.profileData);
        
        // Prüfe ob User angemeldet ist
        if (!window.realUserAuth?.isLoggedIn()) {
            console.log('ℹ️ Benutzer nicht angemeldet - zeige Login-Modal');
            this.showNotification('Bitte anmelden oder registrieren zum Speichern', 'info');
            // Login-Modal öffnen
            if (window.authModals?.showLogin) {
                window.authModals.showLogin();
            } else if (window.showLoginModal) {
                window.showLoginModal();
            }
            return null; // Kein Fehler werfen, nur abbrechen
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
            
            // WICHTIG: UnifiedProfileService aktualisieren, damit Dashboard auch die neuen Daten hat
            if (window.unifiedProfileService) {
                console.log('🔄 Aktualisiere UnifiedProfileService mit gespeicherten Daten...');
                // Lade Profil neu, damit alle Daten synchronisiert sind
                try {
                    await window.unifiedProfileService.loadFullProfile();
                    console.log('✅ UnifiedProfileService mit neuen Daten aktualisiert');
                } catch (error) {
                    console.warn('⚠️ Fehler beim Aktualisieren des UnifiedProfileService:', error);
                }
            }
            
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
                        
                        // UnifiedProfileService erneut aktualisieren mit validierten Daten
                        if (window.unifiedProfileService) {
                            try {
                                await window.unifiedProfileService.loadFullProfile();
                                console.log('✅ UnifiedProfileService mit validierten Daten aktualisiert');
                            } catch (error) {
                                console.warn('⚠️ Fehler beim Aktualisieren des UnifiedProfileService:', error);
                            }
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
            const result = await this.saveProfileData();
            this.hideLoading();
            
            // Wenn null zurückgegeben wurde, wurde Login-Modal gezeigt
            if (result === null) {
                return;
            }
            
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
        // Bei Erfolg: Zeige nur den animierten Haken
        if (type === 'success' && window.showSuccessCheck) {
            window.showSuccessCheck({ duration: 1500 });
            return;
        }
        
        // Für andere Typen (error, info, warning): Zeige normale Benachrichtigung
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : 'var(--primary-color)'};
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
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Applications Tab - Bewerbungsmanager
     * Dashboard wird jetzt als iframe eingebunden
     */
    initApplicationsTab() {
        // Dashboard wird im iframe geladen, keine Event Listener nötig
        // Das Dashboard hat seine eigenen Event Handler
    }
    
    /**
     * API-First: Lade Tab-Daten über API
     */
    async loadTabDataFromAPI(tabName) {
        try {
            const token = await this.getAuthToken();
            if (!token) {
                console.warn('⚠️ Kein Auth-Token für API-Call');
                return;
            }

            const apiBase = window.getApiUrl ? window.getApiUrl('USER_PROFILE_API') : (window.AWS_APP_CONFIG?.API_BASE ? `${window.AWS_APP_CONFIG.API_BASE}/user-profile-api` : '');
            let endpoint = '';

            switch (tabName) {
                case 'personal':
                    endpoint = '/personal';
                    break;
                case 'applications':
                    endpoint = '/applications';
                    break;
                case 'settings':
                    endpoint = '/settings';
                    break;
                case 'progress':
                    endpoint = '/progress';
                    break;
                case 'achievements':
                    endpoint = '/achievements';
                    break;
                case 'training':
                    endpoint = '/training';
                    break;
                case 'nutrition':
                    endpoint = '/nutrition';
                    break;
                case 'coach':
                    endpoint = '/coach';
                    break;
                case 'journal':
                    endpoint = '/journal';
                    break;
                default:
                    return;
            }

            const response = await fetch(`${apiBase}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Tab-Daten geladen für ${tabName}:`, data);
                
                // Verarbeite Daten je nach Tab
                if (tabName === 'personal' && data) {
                    this.populateFormFields(data);
                }
                // Weitere Tab-spezifische Verarbeitung kann hier hinzugefügt werden
            } else {
                console.warn(`⚠️ API-Call für ${tabName} fehlgeschlagen:`, response.status);
            }
        } catch (error) {
            console.error(`❌ Fehler beim Laden der Tab-Daten für ${tabName}:`, error);
        }
    }

    /**
     * Lade Anschreiben aus localStorage (cover_letter_drafts)
     */
    async loadCoverLetters() {
        try {
            // Lade aus localStorage (von quick-apply gespeichert)
            const draftsJson = localStorage.getItem('cover_letter_drafts');
            const coverLetters = draftsJson ? JSON.parse(draftsJson) : [];
            
            const coverLettersList = document.getElementById('coverLettersList');
            const emptyState = document.getElementById('coverLettersEmpty');
            
            if (!coverLettersList) return;

            if (coverLetters.length === 0) {
                // Empty state anzeigen
                if (emptyState) emptyState.style.display = 'block';
                coverLettersList.innerHTML = '';
                return;
            }

            // Empty state ausblenden
            if (emptyState) emptyState.style.display = 'none';

            // Render cover letters
            coverLettersList.innerHTML = coverLetters.map((letter, index) => {
                const company = letter.jobData?.company || 'Unbekanntes Unternehmen';
                const position = letter.jobData?.position || letter.jobData?.title || 'Allgemeines Anschreiben';
                const date = letter.createdAt ? new Date(letter.createdAt).toLocaleDateString('de-DE') : '';
                const preview = letter.content ? letter.content.substring(0, 100) + '...' : '';
                
                return `
                    <div class="application-item cover-letter-item" data-id="${letter.id}">
                        <div class="application-info">
                            <h4><i class="fas fa-file-alt"></i> ${this.escapeHtml(position)}</h4>
                            <p><strong>${this.escapeHtml(company)}</strong> - ${date}</p>
                            <p class="preview-text" style="font-size: 0.85em; color: #666; margin-top: 4px;">${this.escapeHtml(preview)}</p>
                        </div>
                        <div class="application-actions">
                            <button class="btn-icon" onclick="window.userProfile.viewCoverLetter('${letter.id}')" title="Anzeigen">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="window.userProfile.copyCoverLetter('${letter.id}')" title="Kopieren">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn-icon" onclick="window.userProfile.downloadCoverLetter('${letter.id}')" title="Herunterladen">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-icon btn-danger" onclick="window.userProfile.deleteCoverLetter('${letter.id}')" title="Löschen">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading cover letters:', error);
        }
    }
    
    /**
     * Anschreiben anzeigen
     */
    viewCoverLetter(id) {
        const drafts = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
        const letter = drafts.find(d => d.id === id);
        
        if (letter) {
            // Erstelle Modal für Vollansicht
            const modal = document.createElement('div');
            modal.className = 'cover-letter-modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-alt"></i> ${this.escapeHtml(letter.jobData?.position || 'Anschreiben')}</h3>
                        <button class="modal-close" onclick="this.closest('.cover-letter-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="letter-meta">
                            <span><strong>Unternehmen:</strong> ${this.escapeHtml(letter.jobData?.company || 'N/A')}</span>
                            <span><strong>Datum:</strong> ${new Date(letter.createdAt).toLocaleDateString('de-DE')}</span>
                        </div>
                        <pre class="letter-content">${this.escapeHtml(letter.content)}</pre>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.userProfile.copyCoverLetter('${id}'); this.closest('.cover-letter-modal').remove();">
                            <i class="fas fa-copy"></i> Kopieren
                        </button>
                        <button class="btn-primary" onclick="window.userProfile.downloadCoverLetter('${id}'); this.closest('.cover-letter-modal').remove();">
                            <i class="fas fa-download"></i> Herunterladen
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add styles if not already present
            if (!document.getElementById('cover-letter-modal-styles')) {
                const style = document.createElement('style');
                style.id = 'cover-letter-modal-styles';
                style.textContent = `
                    .cover-letter-modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 10000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .cover-letter-modal .modal-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.6);
                        cursor: pointer;
                    }
                    .cover-letter-modal .modal-content {
                        position: relative;
                        background: white;
                        border-radius: 12px;
                        width: 90%;
                        max-width: 700px;
                        max-height: 85vh;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    }
                    .cover-letter-modal .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px 20px;
                        border-bottom: 1px solid #eee;
                    }
                    .cover-letter-modal .modal-header h3 {
                        margin: 0;
                        font-size: 1.2em;
                    }
                    .cover-letter-modal .modal-close {
                        background: none;
                        border: none;
                        font-size: 1.2em;
                        cursor: pointer;
                        padding: 4px 8px;
                        color: #666;
                    }
                    .cover-letter-modal .modal-body {
                        padding: 20px;
                        overflow-y: auto;
                        flex: 1;
                    }
                    .cover-letter-modal .letter-meta {
                        display: flex;
                        gap: 20px;
                        margin-bottom: 16px;
                        font-size: 0.9em;
                        color: #666;
                    }
                    .cover-letter-modal .letter-content {
                        white-space: pre-wrap;
                        font-family: inherit;
                        font-size: 0.95em;
                        line-height: 1.6;
                        background: #f8f9fa;
                        padding: 16px;
                        border-radius: 8px;
                        margin: 0;
                    }
                    .cover-letter-modal .modal-footer {
                        display: flex;
                        justify-content: flex-end;
                        gap: 12px;
                        padding: 16px 20px;
                        border-top: 1px solid #eee;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    /**
     * Anschreiben kopieren
     */
    copyCoverLetter(id) {
        const drafts = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
        const letter = drafts.find(d => d.id === id);
        
        if (letter && letter.content) {
            navigator.clipboard.writeText(letter.content).then(() => {
                this.showNotification('Anschreiben in Zwischenablage kopiert!', 'success');
            }).catch(() => {
                this.showNotification('Fehler beim Kopieren', 'error');
            });
        }
    }
    
    /**
     * Anschreiben herunterladen
     */
    downloadCoverLetter(id) {
        const drafts = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
        const letter = drafts.find(d => d.id === id);
        
        if (letter && letter.content) {
            const company = letter.jobData?.company || 'Bewerbung';
            const date = new Date(letter.createdAt).toISOString().split('T')[0];
            
            const blob = new Blob([letter.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Anschreiben_${company}_${date}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showNotification('Anschreiben heruntergeladen', 'success');
        }
    }
    
    /**
     * HTML escapen
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        // Get token from localStorage session (where Cognito stores it)
        try {
            const storedSession = localStorage.getItem('aws_auth_session');
            if (storedSession) {
                const session = JSON.parse(storedSession);
                if (session.idToken) {
                    // Check if session is still valid
                    const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;
                    if (expiresAt && expiresAt > new Date()) {
                        return session.idToken;
                    }
                }
            }
        } catch (e) {
            console.error('Error reading session:', e);
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
     * Lösche Anschreiben aus localStorage
     */
    deleteCoverLetter(id) {
        if (confirm('Möchten Sie dieses Anschreiben wirklich löschen?')) {
            try {
                const drafts = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
                const filtered = drafts.filter(d => d.id !== id);
                localStorage.setItem('cover_letter_drafts', JSON.stringify(filtered));
                this.loadCoverLetters();
                this.showNotification('Anschreiben gelöscht', 'success');
            } catch (error) {
                console.error('Error deleting cover letter:', error);
                this.showNotification('Fehler beim Löschen', 'error');
            }
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
            
            // Prüfe ob User angemeldet ist und nutze AWS Applications API
            if (window.realUserAuth?.isLoggedIn() && window.awsApplicationsAPI) {
                try {
                    console.log('📡 Using AWS Applications API...');
                    const response = await window.awsApplicationsAPI.getApplications();
                    applications = response?.applications || response?.list || [];
                } catch (apiError) {
                    console.warn('⚠️ AWS Applications API nicht verfügbar:', apiError);
                }
            }
            
            // Fallback 1: Applications Core (falls vorhanden)
            if (applications.length === 0 && window.applicationsCore?.getApplicationData) {
                applications = await window.applicationsCore.getApplicationData() || [];
            }
            
            // Fallback 2: Profil-Daten
            if (applications.length === 0 && this.awsProfileAPI) {
                const profile = await this.awsProfileAPI.loadProfile();
                applications = profile?.applications || [];
            }
            
            console.log('✅ Applications loaded:', applications.length, 'items');
            
            // Speichere lokal für schnelleren Zugriff
            this.applications = applications;
            
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
            
            // Starte Workflow-Modal - nur wenn verfügbar
            if (typeof window.showSmartWorkflowModal === 'function') {
                window.showSmartWorkflowModal();
            } else if (typeof window.startSmartWorkflow === 'function') {
                window.startSmartWorkflow();
            } else {
                // Fallback: Navigiere zur Bewerbungsseite
                console.log('ℹ️ Workflow-Funktionen nicht verfügbar, navigiere zur Bewerbungsseite...');
                window.location.href = '/applications/dashboard.html?action=new-application';
            }
            
        } catch (error) {
            console.error('❌ Failed to start application workflow:', error);
            // Bei Fehler: Navigiere zur Bewerbungsseite
            console.log('ℹ️ Fehler beim Starten, navigiere zur Bewerbungsseite...');
            window.location.href = '/applications/dashboard.html?action=new-application';
        }
    }

    /**
     * Fülle Workflow-Daten mit Profildaten vor
     */
    prefillWorkflowFromProfile(profileData) {
        // Initialisiere Workflow-Daten falls nicht vorhanden
        if (!window.workflowData) {
            // Fallback: Falls shared-functions.js nicht geladen wurde
            if (typeof window.initializeWorkflowData !== 'function') {
                window.workflowData = {
                    currentStep: 0,
                    applicationType: null,
                    skipJobAnalysis: false,
                    company: '',
                    position: '',
                    jobDescription: '',
                    requirements: [],
                    aiAnalysisResult: null,
                    isInitiativeApplication: false
                };
            } else {
                window.initializeWorkflowData();
            }
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
        if (typeof window.saveWorkflowData === 'function') {
            window.saveWorkflowData();
        } else {
            // Fallback: Speichere direkt in localStorage
            try {
                localStorage.setItem('smartWorkflowData', JSON.stringify(window.workflowData));
            } catch (e) {
                console.warn('⚠️ Konnte Workflow-Daten nicht speichern:', e);
            }
        }

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

    // ========================================
    // JOURNAL/TAGEBUCH FUNKTIONEN
    // ========================================

    async initJournalTab() {
        if (this.journalInitialized) return;
        
        console.log('📓 Initialisiere Journal-Tab...');
        
        this.selectedJournalDate = new Date();
        this.selectedMood = null;
        this.journalEntryType = 'journal';
        
        // Event Listeners für Training Intensität
        const intensitySlider = document.getElementById('trainingIntensity');
        if (intensitySlider) {
            intensitySlider.addEventListener('input', (e) => {
                document.getElementById('intensityValue').textContent = `${e.target.value}/10`;
            });
        }
        
        // Tag-Navigation
        document.getElementById('journalPrevDay')?.addEventListener('click', () => this.navigateJournalDay(-1));
        document.getElementById('journalNextDay')?.addEventListener('click', () => this.navigateJournalDay(1));
        
        // Lade Daten
        await this.loadJournalData();
        this.generateHeatmap();
        this.updateJournalDayView();
        
        this.journalInitialized = true;
        console.log('✅ Journal-Tab initialisiert');
    }

    async loadJournalData() {
        try {
            if (!window.awsJournalAPI) {
                console.warn('⚠️ Journal API nicht verfügbar');
                return;
            }
            
            const data = await window.awsJournalAPI.getEntries();
            this.journalEntries = data.entries || [];
            this.journalStats = data.stats || {};
            
            // Update Stats Display
            this.updateJournalStats();
            this.updateRecentEntries();
            
            console.log('✅ Journal-Daten geladen:', this.journalEntries.length, 'Einträge');
        } catch (error) {
            console.error('❌ Fehler beim Laden der Journal-Daten:', error);
            this.journalEntries = [];
            this.journalStats = {};
        }
    }

    updateJournalStats() {
        const stats = this.journalStats;
        
        document.getElementById('journalTotalEntries').textContent = stats.totalEntries || 0;
        document.getElementById('journalStreak').textContent = stats.streakDays || 0;
        document.getElementById('journalThisMonth').textContent = stats.thisMonth || 0;
        document.getElementById('journalAvgMood').textContent = stats.avgMood ? stats.avgMood.toFixed(1) : '-';
    }

    generateHeatmap() {
        const container = document.getElementById('journalHeatmap');
        if (!container) return;
        
        container.innerHTML = '';
        
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364); // ~1 Jahr zurück
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start am Sonntag
        
        // Erzeuge Heatmap-Daten
        const heatmapData = {};
        this.journalEntries?.forEach(entry => {
            const date = entry.date.split('T')[0];
            heatmapData[date] = (heatmapData[date] || 0) + 1;
        });
        
        // Generiere Wochen
        let currentDate = new Date(startDate);
        const weeks = [];
        
        while (currentDate <= today) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                if (currentDate <= today) {
                    const dateStr = currentDate.toISOString().split('T')[0];
                    const count = heatmapData[dateStr] || 0;
                    let level = 0;
                    if (count >= 4) level = 4;
                    else if (count >= 3) level = 3;
                    else if (count >= 2) level = 2;
                    else if (count >= 1) level = 1;
                    
                    week.push({
                        date: dateStr,
                        count,
                        level,
                        display: this.formatDateDisplay(currentDate)
                    });
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            weeks.push(week);
        }
        
        // Render
        weeks.forEach(week => {
            const weekDiv = document.createElement('div');
            weekDiv.className = 'heatmap-week';
            
            week.forEach(day => {
                const dayDiv = document.createElement('div');
                dayDiv.className = `heatmap-day level-${day.level}`;
                dayDiv.dataset.date = day.date;
                dayDiv.title = `${day.display}: ${day.count} Einträge`;
                
                dayDiv.addEventListener('click', () => this.selectJournalDate(day.date));
                
                if (day.date === this.selectedJournalDate?.toISOString().split('T')[0]) {
                    dayDiv.classList.add('selected');
                }
                
                weekDiv.appendChild(dayDiv);
            });
            
            container.appendChild(weekDiv);
        });
    }

    formatDateDisplay(date) {
        return date.toLocaleDateString('de-DE', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
        });
    }

    selectJournalDate(dateStr) {
        this.selectedJournalDate = new Date(dateStr);
        
        // Update Heatmap Selection
        document.querySelectorAll('.heatmap-day').forEach(day => {
            day.classList.remove('selected');
            if (day.dataset.date === dateStr) {
                day.classList.add('selected');
            }
        });
        
        this.updateJournalDayView();
    }

    navigateJournalDay(offset) {
        this.selectedJournalDate.setDate(this.selectedJournalDate.getDate() + offset);
        this.updateJournalDayView();
        
        // Update Heatmap Selection
        const dateStr = this.selectedJournalDate.toISOString().split('T')[0];
        document.querySelectorAll('.heatmap-day').forEach(day => {
            day.classList.remove('selected');
            if (day.dataset.date === dateStr) {
                day.classList.add('selected');
            }
        });
    }

    updateJournalDayView() {
        const dateStr = this.selectedJournalDate.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        
        // Update Header
        const headerText = dateStr === today ? 'Heute' : this.formatDateDisplay(this.selectedJournalDate);
        document.getElementById('journalSelectedDate').textContent = headerText;
        
        // Filter entries for this date
        const dayEntries = this.journalEntries?.filter(entry => 
            entry.date.split('T')[0] === dateStr
        ) || [];
        
        // Render entries
        const container = document.getElementById('journalDayEntries');
        if (!container) return;
        
        if (dayEntries.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-calendar-times"></i>
                    <p>Keine Einträge für diesen Tag</p>
                    <span>Füge einen neuen Eintrag hinzu!</span>
                </div>
            `;
            return;
        }
        
        container.innerHTML = dayEntries.map(entry => this.renderDayEntry(entry)).join('');
    }

    renderDayEntry(entry) {
        const time = new Date(entry.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const typeIcons = {
            journal: '📝',
            training: '💪',
            mood: '😊',
            activity: '⚡',
            note: '📌'
        };
        
        const moodEmojis = ['', '😞', '😕', '😐', '🙂', '😄'];
        
        return `
            <div class="day-entry" data-id="${entry.id}">
                <div class="entry-time">
                    <span class="time">${time}</span>
                </div>
                <div class="entry-icon ${entry.type}">
                    ${typeIcons[entry.type] || '📝'}
                </div>
                <div class="entry-content">
                    <h5>${entry.title || 'Eintrag'}</h5>
                    <p>${entry.content || ''}</p>
                    ${entry.tags?.length ? `
                        <div class="entry-tags">
                            ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                ${entry.mood ? `<div class="entry-mood">${moodEmojis[entry.mood]}</div>` : ''}
            </div>
        `;
    }

    updateRecentEntries() {
        const container = document.getElementById('journalRecentEntries');
        if (!container) return;
        
        const recentEntries = (this.journalEntries || []).slice(0, 5);
        
        if (recentEntries.length === 0) {
            container.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-book-open"></i>
                    <p>Noch keine Einträge</p>
                    <span>Starte mit deinem ersten Tagebucheintrag!</span>
                </div>
            `;
            return;
        }
        
        const typeIcons = {
            journal: '📝',
            training: '💪',
            mood: '😊',
            activity: '⚡',
            note: '📌'
        };
        
        container.innerHTML = recentEntries.map(entry => {
            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
            
            return `
                <div class="recent-entry" onclick="window.userProfile.selectJournalDate('${entry.date.split('T')[0]}')">
                    <div class="recent-entry-icon entry-icon ${entry.type}">
                        ${typeIcons[entry.type] || '📝'}
                    </div>
                    <div class="recent-entry-content">
                        <h5>${entry.title || 'Eintrag'}</h5>
                        <p>${(entry.content || '').substring(0, 50)}${(entry.content || '').length > 50 ? '...' : ''}</p>
                    </div>
                    <div class="recent-entry-date">${dateStr}</div>
                </div>
            `;
        }).join('');
    }

    setJournalEntryType(type) {
        this.journalEntryType = type;
        
        // Update active button
        document.querySelectorAll('.entry-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });
        
        // Show/hide fields based on type
        const moodSelector = document.getElementById('moodSelector');
        const trainingFields = document.getElementById('trainingFields');
        const sleepFields = document.getElementById('sleepFields');
        const mealFields = document.getElementById('mealFields');
        
        if (moodSelector) {
            moodSelector.style.display = (type === 'journal' || type === 'mood') ? 'block' : 'none';
        }
        
        if (trainingFields) {
            trainingFields.style.display = type === 'training' ? 'block' : 'none';
        }
        
        if (sleepFields) {
            sleepFields.style.display = type === 'sleep' ? 'block' : 'none';
        }
        
        if (mealFields) {
            mealFields.style.display = type === 'meal' ? 'block' : 'none';
        }
        
        // Update placeholder
        const titleInput = document.getElementById('journalTitle');
        const contentInput = document.getElementById('journalContent');
        
        const placeholders = {
            journal: { title: 'Was beschäftigt dich heute?', content: 'Schreibe deine Gedanken...' },
            training: { title: 'Workout-Name', content: 'Notizen zum Training...' },
            mood: { title: 'Wie geht es dir?', content: 'Optional: Beschreibe deine Stimmung...' },
            note: { title: 'Kurze Notiz', content: 'Schnelle Notiz...' },
            sleep: { title: 'Schlafnotiz (optional)', content: 'Wie hast du geschlafen? Träume?' },
            meal: { title: 'Mahlzeit', content: 'Details zur Mahlzeit...' }
        };
        
        if (titleInput) titleInput.placeholder = placeholders[type]?.title || '';
        if (contentInput) contentInput.placeholder = placeholders[type]?.content || '';
    }

    selectMood(mood) {
        this.selectedMood = mood;
        
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.mood) === mood) {
                btn.classList.add('selected');
            }
        });
    }

    selectSleepQuality(quality) {
        this.selectedSleepQuality = quality;
        
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.quality) === quality) {
                btn.classList.add('active');
            }
        });
    }

    selectMealSatisfaction(satisfaction) {
        this.selectedMealSatisfaction = satisfaction;
        
        document.querySelectorAll('.satisfaction-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.satisfaction) === satisfaction) {
                btn.classList.add('active');
            }
        });
    }

    calculateSleepDuration(bedtime, wakeup) {
        if (!bedtime || !wakeup) return null;
        
        const [bedH, bedM] = bedtime.split(':').map(Number);
        const [wakeH, wakeM] = wakeup.split(':').map(Number);
        
        let bedMinutes = bedH * 60 + bedM;
        let wakeMinutes = wakeH * 60 + wakeM;
        
        // If wakeup is earlier than bedtime, assume next day
        if (wakeMinutes < bedMinutes) {
            wakeMinutes += 24 * 60;
        }
        
        const durationMinutes = wakeMinutes - bedMinutes;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        return { hours, minutes, totalMinutes: durationMinutes };
    }

    async saveJournalEntry() {
        // Prüfe ob Benutzer eingeloggt ist
        if (!window.realUserAuth?.isLoggedIn()) {
            this.showNotification('Bitte anmelden zum Speichern', 'info');
            // Login-Modal öffnen
            if (window.authModals?.showLogin) {
                window.authModals.showLogin();
            } else if (window.showLoginModal) {
                window.showLoginModal();
            }
            return;
        }
        
        const title = document.getElementById('journalTitle')?.value?.trim();
        const content = document.getElementById('journalContent')?.value?.trim();
        const tagsStr = document.getElementById('journalTags')?.value?.trim();
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
        
        // Validate based on type
        const type = this.journalEntryType;
        if (type === 'sleep') {
            const bedtime = document.getElementById('sleepBedtime')?.value;
            const wakeup = document.getElementById('sleepWakeup')?.value;
            if (!bedtime || !wakeup) {
                this.showNotification('Bitte gib Bettzeit und Aufstehzeit ein', 'error');
                return;
            }
        } else if (type === 'meal') {
            const mealDescription = document.getElementById('mealDescription')?.value?.trim();
            if (!mealDescription) {
                this.showNotification('Bitte beschreibe was du gegessen hast', 'error');
                return;
            }
        } else if (!title && !content) {
            this.showNotification('Bitte gib einen Titel oder Inhalt ein', 'error');
            return;
        }
        
        const entry = {
            type: this.journalEntryType,
            title,
            content,
            tags,
            mood: this.selectedMood,
            date: new Date().toISOString()
        };
        
        // Add training data if applicable
        if (this.journalEntryType === 'training') {
            entry.trainingData = {
                type: document.getElementById('trainingType')?.value || 'other',
                duration: parseInt(document.getElementById('trainingDuration')?.value) || 0,
                intensity: parseInt(document.getElementById('trainingIntensity')?.value) || 5
            };
        }
        
        // Add sleep data if applicable
        if (this.journalEntryType === 'sleep') {
            const bedtime = document.getElementById('sleepBedtime')?.value;
            const wakeup = document.getElementById('sleepWakeup')?.value;
            const lastScreen = document.getElementById('sleepLastScreen')?.value;
            const lastLight = document.getElementById('sleepLastLight')?.value;
            const interruptions = parseInt(document.getElementById('sleepInterruptions')?.value) || 0;
            
            const duration = this.calculateSleepDuration(bedtime, wakeup);
            
            entry.sleepData = {
                bedtime,
                wakeup,
                lastScreen,
                lastLight,
                quality: this.selectedSleepQuality || 3,
                interruptions,
                durationHours: duration?.hours || 0,
                durationMinutes: duration?.minutes || 0,
                totalMinutes: duration?.totalMinutes || 0
            };
            
            // Auto-generate title if not provided
            if (!entry.title) {
                entry.title = `Schlaf: ${duration?.hours || 0}h ${duration?.minutes || 0}min`;
            }
        }
        
        // Add meal data if applicable
        if (this.journalEntryType === 'meal') {
            const mealType = document.getElementById('mealType')?.value || 'snack';
            const mealTime = document.getElementById('mealTime')?.value;
            const mealDescription = document.getElementById('mealDescription')?.value?.trim();
            const calories = parseInt(document.getElementById('mealCalories')?.value) || 0;
            const protein = parseInt(document.getElementById('mealProtein')?.value) || 0;
            const syncToNutrition = document.getElementById('mealSyncToNutrition')?.checked ?? true;
            
            entry.mealData = {
                mealType,
                mealTime,
                description: mealDescription,
                calories,
                protein,
                satisfaction: this.selectedMealSatisfaction || 3
            };
            
            // Auto-generate title if not provided
            if (!entry.title) {
                const mealLabels = {
                    breakfast: 'Frühstück',
                    lunch: 'Mittagessen',
                    dinner: 'Abendessen',
                    snack: 'Snack'
                };
                entry.title = mealLabels[mealType] || 'Mahlzeit';
            }
            
            // Sync to nutrition tab if enabled
            if (syncToNutrition && window.awsNutritionAPI) {
                try {
                    await window.awsNutritionAPI.logMeal({
                        type: mealType,
                        time: mealTime,
                        description: mealDescription,
                        calories,
                        protein,
                        date: new Date().toISOString().split('T')[0]
                    });
                    console.log('✅ Mahlzeit auch zum Ernährungsplan hinzugefügt');
                } catch (syncError) {
                    console.warn('⚠️ Konnte nicht zum Ernährungsplan synchronisieren:', syncError);
                }
            }
        }
        
        try {
            if (!window.awsJournalAPI) {
                throw new Error('Journal API nicht verfügbar');
            }
            
            const result = await window.awsJournalAPI.createEntry(entry);
            
            // Clear form
            this.clearJournalForm();
            
            // Reload data
            await this.loadJournalData();
            this.generateHeatmap();
            this.updateJournalDayView();
            
            this.showNotification('Eintrag gespeichert!', 'success');
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            this.showNotification('Fehler beim Speichern: ' + error.message, 'error');
        }
    }

    clearJournalForm() {
        // Clear text inputs
        const inputs = ['journalTitle', 'journalContent', 'journalTags', 'mealDescription'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        // Clear number inputs
        const numberInputs = ['trainingDuration', 'mealCalories', 'mealProtein'];
        numberInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        // Reset selections
        this.selectedMood = null;
        this.selectedSleepQuality = null;
        this.selectedMealSatisfaction = null;
        
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.satisfaction-btn').forEach(btn => btn.classList.remove('active'));
        
        // Reset range input
        const intensityInput = document.getElementById('trainingIntensity');
        if (intensityInput) {
            intensityInput.value = 5;
            const intensityValue = document.getElementById('intensityValue');
            if (intensityValue) intensityValue.textContent = '5/10';
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
const userProfileAnimationStyle = document.createElement('style');
userProfileAnimationStyle.textContent = `
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
document.head.appendChild(userProfileAnimationStyle);