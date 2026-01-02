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
            this.setupAutoSave();
        });
        
        // Handle hash navigation - am Ende nach allen asynchronen Operationen
        // Verwende mehrschichtige Verzögerung für maximale Zuverlässigkeit
        const performHashNavigation = () => {
            // Prüfe sofort, ob Hash vorhanden ist
            const hash = window.location.hash.slice(1);
            if (hash && ['personal', 'settings', 'progress', 'achievements'].includes(hash)) {
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
            if (hash && ['personal', 'settings', 'progress', 'achievements'].includes(hash)) {
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
        const requiredTabs = ['personal', 'settings', 'progress', 'achievements'];
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
                if (!hash || !['personal', 'settings', 'progress', 'achievements'].includes(hash)) {
                    this.switchTab('personal');
                }
                return;
            }
        }
        
        const hash = window.location.hash.slice(1); // Remove the #
        if (hash && ['personal', 'settings', 'progress', 'achievements'].includes(hash)) {
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

        // Form inputs
        // Auto-save on form changes with debounce
        let saveTimeout;
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => {
                // Clear existing timeout
                clearTimeout(saveTimeout);
                
                // Set new timeout for auto-save
                saveTimeout = setTimeout(async () => {
                    try {
                        await this.saveProfileData();
                        this.showNotification('Änderungen automatisch gespeichert', 'success');
                    } catch (error) {
                        console.error('Auto-save failed:', error);
                    }
                }, 1000); // Save after 1 second of inactivity
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
            
            // Merge: AWS data + Auth data (auth takes priority for name/email)
            this.profileData = {
                ...this.loadProfileData(), // Start with defaults
                ...awsData, // Override with AWS data
                // Always use auth data for name/email if available
                firstName: userData?.firstName || currentUser?.firstName || awsData?.firstName || '',
                lastName: userData?.lastName || currentUser?.lastName || awsData?.lastName || '',
                email: userData?.email || currentUser?.email || awsData?.email || ''
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
        if (data.firstName !== undefined) document.getElementById('firstName').value = data.firstName;
        if (data.lastName !== undefined) document.getElementById('lastName').value = data.lastName;
        if (data.email !== undefined) document.getElementById('email').value = data.email;
        if (data.phone !== undefined) document.getElementById('phone').value = data.phone;
        if (data.birthDate !== undefined) document.getElementById('birthDate').value = data.birthDate;
        if (data.location !== undefined) document.getElementById('location').value = data.location;
        if (data.profession !== undefined) document.getElementById('profession').value = data.profession;
        if (data.company !== undefined) document.getElementById('company').value = data.company;
        if (data.experience !== undefined) document.getElementById('experience').value = data.experience;
        if (data.industry !== undefined) document.getElementById('industry').value = data.industry;
        if (data.goals !== undefined) document.getElementById('goals').value = data.goals;
        if (data.interests !== undefined) document.getElementById('interests').value = data.interests;
        
        // Settings
        if (data.emailNotifications !== undefined) {
            document.getElementById('emailNotifications').checked = data.emailNotifications;
        }
        if (data.weeklySummary !== undefined) {
            document.getElementById('weeklySummary').checked = data.weeklySummary;
        }
        if (data.reminders !== undefined) {
            document.getElementById('reminders').checked = data.reminders;
        }
        if (data.theme !== undefined) document.getElementById('theme').value = data.theme;
        if (data.language !== undefined) document.getElementById('language').value = data.language;
        if (data.dataSharing !== undefined) {
            document.getElementById('dataSharing').checked = data.dataSharing;
        }
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
    setupAutoSave() {
        // Prüfe ob User angemeldet ist
        if (!window.realUserAuth?.isLoggedIn() || !this.awsProfileAPI) {
            return;
        }
        
        // Alle Input-Felder im Profil finden
        const profileInputs = document.querySelectorAll('#userProfileForm input, #userProfileForm textarea, #userProfileForm select');
        
        // Debounce-Funktion für Auto-Save
        let autoSaveTimeout;
        const autoSave = async () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(async () => {
                try {
                    await this.saveProfileData();
                    console.log('✅ Profil automatisch gespeichert');
                } catch (error) {
                    console.warn('⚠️ Auto-Save fehlgeschlagen:', error);
                }
            }, 2000); // 2 Sekunden nach letzter Änderung
        };
        
        // Event-Listener für alle Inputs
        profileInputs.forEach(input => {
            input.addEventListener('input', autoSave);
            input.addEventListener('change', autoSave);
        });
        
        console.log('✅ Auto-Save aktiviert für', profileInputs.length, 'Felder');
    }

    async saveProfileData() {
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

        // Include profile image URL if available
        if (this.profileData.profileImageUrl) {
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

        this.profileData = { ...this.profileData, ...profileToSave };
        
        // Save to AWS (PRIMARY STORAGE - keine lokale Speicherung)
        if (window.realUserAuth?.isLoggedIn() && this.awsProfileAPI) {
            try {
                console.log('💾 Saving profile to AWS...');
                await this.awsProfileAPI.saveProfile(this.profileData);
                console.log('✅ Profile saved to AWS successfully');
            } catch (error) {
                console.error('❌ Failed to save profile to AWS:', error);
                throw error; // Re-throw to show error notification
            }
        } else {
            throw new Error('Benutzer nicht angemeldet oder AWS API nicht verfügbar');
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
                    this.showLoading('Profilbild wird hochgeladen...');
                    
                    // Upload to AWS S3
                    if (window.realUserAuth?.isLoggedIn() && this.awsProfileAPI) {
                        const imageUrl = await this.awsProfileAPI.uploadProfileImage(file);
                        
                        // Update profile image
                        const img = document.getElementById('profileImage');
                        if (img) {
                            img.src = imageUrl;
                        }
                        
                        // Save image URL to profile data
                        this.profileData.profileImageUrl = imageUrl;
                        
                        // Save profile to persist the image URL
                        await this.saveProfileData();
                        
                        this.hideLoading();
                        this.showNotification('Profilbild erfolgreich hochgeladen!', 'success');
                    } else {
                        // Fallback to local storage
            const reader = new FileReader();
            reader.onload = (e) => {
                    const img = document.getElementById('profileImage');
                    if (img) {
                        img.src = e.target.result;
                    }
                            this.hideLoading();
                            this.showNotification('Profilbild lokal gespeichert!', 'success');
            };
            reader.readAsDataURL(file);
                    }
                } catch (error) {
                    console.error('❌ Failed to upload avatar:', error);
                    this.hideLoading();
                    this.showNotification('Fehler beim Hochladen des Profilbilds. Bitte versuchen Sie es erneut.', 'error');
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