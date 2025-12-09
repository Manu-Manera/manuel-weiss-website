// =================== BEWERBUNGSPROFIL SETUP SYSTEM ===================
// Vollständige Integration mit AWS Cognito und Adminpanel

class BewerbungsprofilManager {
    constructor() {
        this.currentUser = null;
        this.profileData = {};
        this.isAuthenticated = false;
        this.init();
    }

    async init() {
        console.log('🚀 Bewerbungsprofil Manager wird initialisiert...');
        
        // Warte auf realUserAuth falls nötig
        if (!window.realUserAuth) {
            console.log('⏳ Warte auf realUserAuth...');
            let attempts = 0;
            while (!window.realUserAuth && attempts < 100) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
        
        // Event Listeners setup
        this.setupEventListeners();
        
        // Auth-Status prüfen
        await this.checkAuthStatus();
        
        // Formular vorausfüllen falls User eingeloggt
        if (this.isAuthenticated) {
            await this.loadExistingProfile();
        }
        
        // Event-Listener für Auth-State-Änderungen
        document.addEventListener('userLogin', (e) => {
            console.log('🔔 User Login Event empfangen:', e.detail);
            this.currentUser = e.detail;
            this.isAuthenticated = true;
            this.updateAuthUI();
        });
        
        document.addEventListener('userLogout', () => {
            console.log('🔔 User Logout Event empfangen');
            this.currentUser = null;
            this.isAuthenticated = false;
            this.updateAuthUI();
        });
        
        // Prüfe Auth-Status regelmäßig (falls Session wiederhergestellt wird)
        setInterval(() => {
            if (!this.isAuthenticated && window.realUserAuth) {
                this.checkAuthStatus();
            }
        }, 5000);
    }

    async checkAuthStatus() {
        try {
            console.log('🔍 Prüfe Auth-Status...');
            console.log('  - realUserAuth verfügbar:', !!window.realUserAuth);
            
            // Warte auf Initialisierung falls nötig
            if (window.realUserAuth && !window.realUserAuth.isInitialized) {
                console.log('⏳ Warte auf Auth-System-Initialisierung...');
                let attempts = 0;
                while (!window.realUserAuth.isInitialized && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
            }
            
            // Prüfe ob real-user-auth-system verfügbar ist
            if (window.realUserAuth) {
                console.log('  - isInitialized:', window.realUserAuth.isInitialized);
                console.log('  - isAuthenticated:', window.realUserAuth.isAuthenticated);
                console.log('  - isLoggedIn():', window.realUserAuth.isLoggedIn ? window.realUserAuth.isLoggedIn() : 'N/A');
                
                // Prüfe auf verschiedene Arten
                const isLoggedIn = window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn();
                const isAuthenticated = window.realUserAuth.isAuthenticated === true;
                const hasCurrentUser = window.realUserAuth.getCurrentUser && window.realUserAuth.getCurrentUser();
                
                console.log('  - isLoggedIn:', isLoggedIn);
                console.log('  - isAuthenticated:', isAuthenticated);
                console.log('  - hasCurrentUser:', !!hasCurrentUser);
                
                if (isLoggedIn || isAuthenticated || hasCurrentUser) {
                    this.currentUser = window.realUserAuth.getCurrentUser();
                    this.isAuthenticated = true;
                    console.log('✅ User ist authentifiziert:', this.currentUser);
                    this.updateAuthUI();
                    return;
                }
            }
            
            // Fallback: Prüfe Session direkt
            const session = localStorage.getItem('aws_auth_session');
            if (session) {
                try {
                    const sessionData = JSON.parse(session);
                    if (sessionData.accessToken) {
                        console.log('✅ Session gefunden in localStorage');
                        // Versuche User-Info aus Token zu extrahieren
                        if (sessionData.idToken) {
                            // Token ist vorhanden, Benutzer sollte angemeldet sein
                            // Versuche realUserAuth zu initialisieren
                            if (window.realUserAuth && window.realUserAuth.init) {
                                await window.realUserAuth.init();
                                if (window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) {
                                    this.currentUser = window.realUserAuth.getCurrentUser();
                                    this.isAuthenticated = true;
                                    console.log('✅ User aus Session wiederhergestellt:', this.currentUser);
                                    this.updateAuthUI();
                                    return;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error('Fehler beim Parsen der Session:', e);
                }
            }
            
            console.log('⚠️ User nicht authentifiziert');
            this.showAuthPrompt();
        } catch (error) {
            console.error('❌ Auth-Status-Check fehlgeschlagen:', error);
            this.showAuthPrompt();
        }
    }

    updateAuthUI() {
        const authButton = document.getElementById('realAuthButton');
        const userButton = document.getElementById('realUserButton');
        const userMenu = document.getElementById('realUserMenu');
        const userName = document.getElementById('userName');
        const userAvatarImg = document.getElementById('userAvatarImg');
        const userInfoClickable = document.getElementById('userInfoClickable');

        if (this.isAuthenticated && this.currentUser) {
            // Auth-Button verstecken, User-Button zeigen
            if (authButton) authButton.style.display = 'none';
            if (userButton) userButton.style.display = 'block';
            
            // User-Menü sollte standardmäßig ausgeblendet sein (nur beim Klick sichtbar)
            if (userMenu) {
                userMenu.style.display = 'none';
            }
            
            // Click-Handler für Toggle (falls noch nicht vorhanden)
            if (userInfoClickable && !userInfoClickable.dataset.listenerAdded) {
                userInfoClickable.style.cursor = 'pointer';
                userInfoClickable.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isVisible = userMenu.style.display === 'block';
                    userMenu.style.display = isVisible ? 'none' : 'block';
                });
                
                // Schließe Menü beim Klick außerhalb
                const closeMenuHandler = (e) => {
                    if (!userMenu.contains(e.target) && !userInfoClickable.contains(e.target)) {
                        userMenu.style.display = 'none';
                    }
                };
                document.addEventListener('click', closeMenuHandler);
                userInfoClickable.dataset.listenerAdded = 'true';
                userInfoClickable.dataset.closeHandler = 'true';
            }
            
            // User-Info aktualisieren
            if (userName) userName.textContent = this.currentUser.name || this.currentUser.email;
            if (userAvatarImg) {
                userAvatarImg.src = this.currentUser.avatar || '../images/manuel-weiss-portrait.jpg';
                userAvatarImg.alt = this.currentUser.name || 'User Avatar';
            }
        } else {
            // Nicht authentifiziert: Auth-Button zeigen, User-Button verstecken
            if (authButton) authButton.style.display = 'block';
            if (userButton) userButton.style.display = 'none';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    showAuthPrompt() {
        const authButton = document.getElementById('realAuthButton');
        if (authButton) {
            authButton.style.display = 'block';
            authButton.innerHTML = '<i class="fas fa-user"></i> Anmelden';
        }
    }

    async loadExistingProfile() {
        try {
            if (!this.currentUser) return;

            console.log('📋 Lade existierendes Profil für:', this.currentUser.email);
            
            // API-Call um existierendes Profil zu laden
            const response = await fetch(`/api/applications/profile/${this.currentUser.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const profileData = await response.json();
                this.profileData = profileData;
                this.populateForm(profileData);
                console.log('✅ Profil erfolgreich geladen');
            } else {
                console.log('ℹ️ Kein existierendes Profil gefunden, neues Profil wird erstellt');
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden des Profils:', error);
        }
    }

    populateForm(profileData) {
        // Persönliche Daten
        if (profileData.personal) {
            const personal = profileData.personal;
            this.setFormValue('firstName', personal.firstName);
            this.setFormValue('lastName', personal.lastName);
            this.setFormValue('email', personal.email);
            this.setFormValue('phone', personal.phone);
            this.setFormValue('location', personal.location);
            this.setFormValue('birthDate', personal.birthDate);
        }

        // Berufserfahrung
        if (profileData.experience && profileData.experience.length > 0) {
            this.populateExperience(profileData.experience);
        }

        // Ausbildung
        if (profileData.education && profileData.education.length > 0) {
            this.populateEducation(profileData.education);
        }

        // Fähigkeiten
        if (profileData.skills) {
            this.setFormValue('technicalSkills', profileData.skills.technical?.join(', '));
            this.populateLanguages(profileData.skills.languages);
        }

        // Karriereziele
        if (profileData.careerGoals) {
            const goals = profileData.careerGoals;
            this.setFormValue('desiredPosition', goals.desiredPosition);
            this.setFormValue('desiredIndustry', goals.desiredIndustry);
            this.setFormValue('salaryExpectation', goals.salaryExpectation);
            this.setFormValue('workType', goals.workType);
            this.setFormValue('motivation', goals.motivation);
        }
    }

    setFormValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value) {
            field.value = value;
        }
    }

    populateExperience(experiences) {
        const container = document.getElementById('experienceContainer');
        if (!container) return;

        // Erste Erfahrung entfernen (Template)
        const firstExp = container.querySelector('.experience-item');
        if (firstExp) firstExp.remove();

        experiences.forEach((exp, index) => {
            this.addExperienceItem(exp);
        });
    }

    populateEducation(educations) {
        const container = document.getElementById('educationContainer');
        if (!container) return;

        // Erste Ausbildung entfernen (Template)
        const firstEdu = container.querySelector('.education-item');
        if (firstEdu) firstEdu.remove();

        educations.forEach((edu, index) => {
            this.addEducationItem(edu);
        });
    }

    populateLanguages(languages) {
        const container = document.querySelector('.languages-container');
        if (!container || !languages) return;

        // Erste Sprache entfernen (Template)
        const firstLang = container.querySelector('.language-item');
        if (firstLang) firstLang.remove();

        languages.forEach((lang, index) => {
            this.addLanguageItem(lang);
        });
    }

    setupEventListeners() {
        // Form Submit
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Experience Management
        const addExperienceBtn = document.getElementById('addExperience');
        if (addExperienceBtn) {
            addExperienceBtn.addEventListener('click', () => this.addExperienceItem());
        }

        // Education Management
        const addEducationBtn = document.getElementById('addEducation');
        if (addEducationBtn) {
            addEducationBtn.addEventListener('click', () => this.addEducationItem());
        }

        // Language Management
        const addLanguageBtn = document.getElementById('addLanguage');
        if (addLanguageBtn) {
            addLanguageBtn.addEventListener('click', () => this.addLanguageItem());
        }

        // Skills Input
        const technicalSkillsInput = document.getElementById('technicalSkills');
        if (technicalSkillsInput) {
            technicalSkillsInput.addEventListener('input', (e) => this.handleSkillsInput(e));
        }

        // Current Job Checkbox
        document.addEventListener('change', (e) => {
            if (e.target.name === 'currentJob') {
                this.handleCurrentJobChange(e.target);
            }
        });

        // Remove Buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-experience')) {
                this.removeExperienceItem(e.target);
            } else if (e.target.classList.contains('remove-education')) {
                this.removeEducationItem(e.target);
            } else if (e.target.classList.contains('remove-language')) {
                this.removeLanguageItem(e.target);
            }
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Prüfe Auth-Status erneut vor dem Speichern
        await this.checkAuthStatus();
        
        if (!this.isAuthenticated) {
            // Zeige Auth-Modal statt Alert
            if (window.realUserAuth && window.realUserAuth.showAuthModal) {
                window.realUserAuth.showAuthModal();
            } else {
                alert('❌ Bitte melden Sie sich zuerst an, um Ihr Profil zu speichern.');
            }
            return;
        }

        try {
            // Formular validieren
            if (!this.validateForm()) {
                return;
            }

            // Daten sammeln
            const profileData = this.collectFormData();
            
            // Loading State
            this.showLoadingState();

            // Profil speichern
            const result = await this.saveProfile(profileData);
            
            if (result.success) {
                this.showSuccessMessage();
                // Weiterleitung zum nächsten Schritt
                setTimeout(() => {
                    window.location.href = 'job-analysis.html';
                }, 2000);
                } else {
                this.showErrorMessage(result.error);
            }
        } catch (error) {
            console.error('❌ Formular-Submit-Fehler:', error);
            this.showErrorMessage('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    }

    validateForm() {
        const requiredFields = ['firstName', 'lastName', 'email', 'location'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showFieldError(fieldId, 'Dieses Feld ist erforderlich');
                isValid = false;
            } else {
                this.clearFieldError(fieldId);
            }
        });

        // E-Mail Validierung
        const emailField = document.getElementById('email');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                this.showFieldError('email', 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
                isValid = false;
            }
        }

        return isValid;
    }

    collectFormData() {
        return {
            userId: this.currentUser.id,
            personal: {
                firstName: document.getElementById('firstName')?.value,
                lastName: document.getElementById('lastName')?.value,
                email: document.getElementById('email')?.value,
                phone: document.getElementById('phone')?.value,
                location: document.getElementById('location')?.value,
                birthDate: document.getElementById('birthDate')?.value
            },
            experience: this.collectExperienceData(),
            education: this.collectEducationData(),
            skills: {
                technical: this.collectTechnicalSkills(),
                languages: this.collectLanguageData()
            },
            careerGoals: {
                desiredPosition: document.getElementById('desiredPosition')?.value,
                desiredIndustry: document.getElementById('desiredIndustry')?.value,
                salaryExpectation: document.getElementById('salaryExpectation')?.value,
                workType: document.getElementById('workType')?.value,
                motivation: document.getElementById('motivation')?.value
            },
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            }
        };
    }

    collectExperienceData() {
        const experiences = [];
        const experienceItems = document.querySelectorAll('.experience-item');
        
        experienceItems.forEach(item => {
            const experience = {
                position: item.querySelector('input[name="position"]')?.value,
                company: item.querySelector('input[name="company"]')?.value,
                startDate: item.querySelector('input[name="startDate"]')?.value,
                endDate: item.querySelector('input[name="endDate"]')?.value,
                currentJob: item.querySelector('input[name="currentJob"]')?.checked,
                description: item.querySelector('textarea[name="description"]')?.value
            };
            
            if (experience.position && experience.company) {
                experiences.push(experience);
            }
        });
        
        return experiences;
    }

    collectEducationData() {
        const educations = [];
        const educationItems = document.querySelectorAll('.education-item');
        
        educationItems.forEach(item => {
            const education = {
                degree: item.querySelector('select[name="degree"]')?.value,
                field: item.querySelector('input[name="field"]')?.value,
                institution: item.querySelector('input[name="institution"]')?.value,
                year: item.querySelector('input[name="year"]')?.value
            };
            
            if (education.degree && education.field) {
                educations.push(education);
            }
        });
        
        return educations;
    }

    collectTechnicalSkills() {
        const skillsInput = document.getElementById('technicalSkills');
        if (!skillsInput || !skillsInput.value) return [];
        
        return skillsInput.value
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
    }

    collectLanguageData() {
        const languages = [];
        const languageItems = document.querySelectorAll('.language-item');
        
        languageItems.forEach(item => {
            const language = item.querySelector('input[name="language"]')?.value;
            const level = item.querySelector('select[name="level"]')?.value;
            
            if (language && level) {
                languages.push({ language, level });
            }
        });
        
        return languages;
    }

    async saveProfile(profileData) {
        try {
            console.log('💾 Speichere Bewerbungsprofil:', profileData);
            
            // Versuche zuerst awsProfileAPI (falls verfügbar)
            if (window.awsProfileAPI && window.awsProfileAPI.isInitialized) {
                try {
                    console.log('📤 Verwende awsProfileAPI...');
                    const profileToSave = {
                        type: 'application-profile',
                        ...profileData,
                        userId: this.currentUser?.id || this.currentUser?.userId,
                        email: this.currentUser?.email
                    };
                    
                    await window.awsProfileAPI.saveProfile(profileToSave);
                    console.log('✅ Profil erfolgreich über awsProfileAPI gespeichert');
                    
                    return {
                        success: true,
                        profile: profileToSave,
                        message: 'Profil erfolgreich gespeichert'
                    };
                } catch (apiError) {
                    console.warn('⚠️ awsProfileAPI Fehler, versuche API-Endpoint:', apiError);
                }
            }
            
            // Fallback: API-Endpoint
            const apiBaseUrl = window.AWS_CONFIG?.apiBaseUrl || '';
            const apiUrl = apiBaseUrl ? `${apiBaseUrl}/profile` : '/api/applications/profile';
            
            console.log('📤 Verwende API-Endpoint:', apiUrl);
            
            const authToken = await this.getAuthToken();
            if (!authToken) {
                throw new Error('Kein Auth-Token verfügbar');
            }
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...profileData,
                    userId: this.currentUser?.id || this.currentUser?.userId,
                    email: this.currentUser?.email,
                    type: 'application-profile'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Profil erfolgreich über API gespeichert:', result);
                return {
                    success: true,
                    profile: result,
                    message: 'Profil erfolgreich gespeichert'
                };
            } else {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText || `HTTP ${response.status}` };
                }
                
                console.error('❌ API-Fehler:', response.status, errorData);
                return {
                    success: false,
                    error: errorData.message || `Profil konnte nicht gespeichert werden (${response.status})`
                };
            }
        } catch (error) {
            console.error('❌ Profil-Speicher-Fehler:', error);
            return {
                success: false,
                error: error.message || 'Fehler beim Speichern des Profils in AWS. Bitte versuchen Sie es erneut.'
            };
        }
    }

    async getAuthToken() {
        try {
            if (window.realUserAuth) {
                return await window.realUserAuth.getAuthToken();
            }
            return null;
        } catch (error) {
            console.error('❌ Auth-Token-Fehler:', error);
            return null;
        }
    }

    // Experience Management
    addExperienceItem(data = {}) {
        const container = document.getElementById('experienceContainer');
        if (!container) return;

        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item';
        experienceItem.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Position *</label>
                    <input type="text" name="position" class="form-input" placeholder="z.B. Softwareentwickler" value="${data.position || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Unternehmen *</label>
                    <input type="text" name="company" class="form-input" placeholder="z.B. Tech Corp GmbH" value="${data.company || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Von</label>
                    <input type="month" name="startDate" class="form-input" value="${data.startDate || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Bis</label>
                    <input type="month" name="endDate" class="form-input" value="${data.endDate || ''}" ${data.currentJob ? 'disabled' : ''}>
                    <div class="form-checkbox">
                        <input type="checkbox" name="currentJob" ${data.currentJob ? 'checked' : ''}>
                        <label>Aktuell</label>
                    </div>
                </div>
                
                <div class="form-group full-width">
                    <label class="form-label">Beschreibung</label>
                    <textarea name="description" class="form-textarea" rows="3" placeholder="Beschreiben Sie Ihre Aufgaben und Erfolge...">${data.description || ''}</textarea>
                </div>
            </div>
            
            <button type="button" class="btn btn-outline btn-sm remove-experience">
                <i class="fas fa-trash"></i>
                Entfernen
            </button>
        `;

        container.appendChild(experienceItem);
    }

    removeExperienceItem(button) {
        const experienceItem = button.closest('.experience-item');
        if (experienceItem) {
            experienceItem.remove();
        }
    }

    // Education Management
    addEducationItem(data = {}) {
        const container = document.getElementById('educationContainer');
        if (!container) return;

        const educationItem = document.createElement('div');
        educationItem.className = 'education-item';
        educationItem.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Abschluss *</label>
                    <select name="degree" class="form-select" required>
                        <option value="">Bitte wählen...</option>
                        <option value="abitur" ${data.degree === 'abitur' ? 'selected' : ''}>Abitur</option>
                        <option value="fachabitur" ${data.degree === 'fachabitur' ? 'selected' : ''}>Fachabitur</option>
                        <option value="ausbildung" ${data.degree === 'ausbildung' ? 'selected' : ''}>Ausbildung</option>
                        <option value="bachelor" ${data.degree === 'bachelor' ? 'selected' : ''}>Bachelor</option>
                        <option value="master" ${data.degree === 'master' ? 'selected' : ''}>Master</option>
                        <option value="diplom" ${data.degree === 'diplom' ? 'selected' : ''}>Diplom</option>
                        <option value="doktor" ${data.degree === 'doktor' ? 'selected' : ''}>Doktor</option>
                        <option value="zertifikat" ${data.degree === 'zertifikat' ? 'selected' : ''}>Zertifikat</option>
                        <option value="sonstiges" ${data.degree === 'sonstiges' ? 'selected' : ''}>Sonstiges</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Fachrichtung *</label>
                    <input type="text" name="field" class="form-input" placeholder="z.B. Informatik, BWL" value="${data.field || ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Institution</label>
                    <input type="text" name="institution" class="form-input" placeholder="z.B. Universität München" value="${data.institution || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Jahr</label>
                    <input type="number" name="year" class="form-input" placeholder="2020" min="1950" max="2030" value="${data.year || ''}">
                </div>
            </div>
            
            <button type="button" class="btn btn-outline btn-sm remove-education">
                <i class="fas fa-trash"></i>
                Entfernen
            </button>
        `;

        container.appendChild(educationItem);
    }

    removeEducationItem(button) {
        const educationItem = button.closest('.education-item');
        if (educationItem) {
            educationItem.remove();
        }
    }

    // Language Management
    addLanguageItem(data = {}) {
        const container = document.querySelector('.languages-container');
        if (!container) return;

        const languageItem = document.createElement('div');
        languageItem.className = 'language-item';
        languageItem.innerHTML = `
            <input type="text" name="language" class="form-input" placeholder="Sprache" value="${data.language || ''}">
            <select name="level" class="form-select">
                <option value="">Niveau</option>
                <option value="A1" ${data.level === 'A1' ? 'selected' : ''}>A1 - Anfänger</option>
                <option value="A2" ${data.level === 'A2' ? 'selected' : ''}>A2 - Grundkenntnisse</option>
                <option value="B1" ${data.level === 'B1' ? 'selected' : ''}>B1 - Mittelstufe</option>
                <option value="B2" ${data.level === 'B2' ? 'selected' : ''}>B2 - Gute Kenntnisse</option>
                <option value="C1" ${data.level === 'C1' ? 'selected' : ''}>C1 - Sehr gute Kenntnisse</option>
                <option value="C2" ${data.level === 'C2' ? 'selected' : ''}>C2 - Muttersprache</option>
            </select>
            <button type="button" class="btn btn-outline btn-sm remove-language">
                <i class="fas fa-trash"></i>
            </button>
        `;

        container.appendChild(languageItem);
    }

    removeLanguageItem(button) {
        const languageItem = button.closest('.language-item');
        if (languageItem) {
            languageItem.remove();
        }
    }

    // Skills Management
    handleSkillsInput(e) {
        const input = e.target;
        const tagsContainer = document.getElementById('technicalTags');
        if (!tagsContainer) return;

        const skills = input.value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
        
        tagsContainer.innerHTML = skills.map(skill => 
            `<span class="skill-tag">${skill}</span>`
        ).join('');
    }

    // Current Job Handling
    handleCurrentJobChange(checkbox) {
        const endDateInput = checkbox.closest('.form-group').querySelector('input[name="endDate"]');
        if (endDateInput) {
            endDateInput.disabled = checkbox.checked;
            if (checkbox.checked) {
                endDateInput.value = '';
            }
        }
    }

    // UI Helpers
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showLoadingState() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichern...';
        }
    }

    showSuccessMessage() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Erfolgreich gespeichert!';
            submitBtn.style.background = '#10b981';
        }
    }

    showErrorMessage(message) {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Profil speichern & weiter';
            submitBtn.style.background = '';
        }

        // Error Toast
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove nach 5 Sekunden
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Global Instance
window.bewerbungsprofilManager = new BewerbungsprofilManager();

// CSS für Error States und Toast
const additionalStyles = `
<style>
.form-input.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: white;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
}

.toast-error {
    border-left: 4px solid #ef4444;
}

.toast-success {
    border-left: 4px solid #10b981;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.toast-error .toast-content i {
    color: #ef4444;
}

.toast-success .toast-content i {
    color: #10b981;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.skill-tag {
    display: inline-block;
    background: #e0f2fe;
    color: #0277bd;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    margin: 0.25rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);

console.log('✅ Bewerbungsprofil Manager geladen');