/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED PROFILE SERVICE
 * Zentraler Service für alle Profildaten aus verschiedenen Quellen
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Datenquellen (Priorität hoch -> niedrig):
 * 1. Bewerbungsprofil (profile-setup)
 * 2. Lebenslauf (resume)
 * 3. Cloud-Profil (AWS/Netlify)
 * 4. Workflows (Fachliche Entwicklung, Coaching)
 * 5. Auth-Daten (Cognito) - niedrigste Priorität, da oft "Test User"
 */

class UnifiedProfileService {
    constructor() {
        this.profile = null;
        this.isInitialized = false;
        this.listeners = [];
        this.cacheKey = 'unified_profile_cache';
        this.cacheExpiry = 5 * 60 * 1000; // 5 Minuten
        
        this.init();
    }

    async init() {
        console.log('🔄 UnifiedProfileService wird initialisiert...');
        
        // Lade gecachte Daten für schnelle Anzeige
        this.loadFromCache();
        
        // Warte auf Auth-System
        await this.waitForAuth();
        
        // Lade vollständiges Profil
        await this.loadFullProfile();
        
        this.isInitialized = true;
        console.log('✅ UnifiedProfileService initialisiert');
        
        // Benachrichtige alle Listener
        this.notifyListeners();
    }

    async waitForAuth() {
        let attempts = 0;
        while (attempts < 50) {
            if (window.realUserAuth?.isInitialized || window.awsAuth?.isLoggedIn?.()) {
                return true;
            }
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }
        console.log('⚠️ Auth-System nicht verfügbar nach 5s');
        return false;
    }

    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < this.cacheExpiry) {
                    this.profile = data;
                    console.log('📦 Profil aus Cache geladen');
                    return true;
                }
            }
        } catch (e) {
            console.warn('Cache konnte nicht geladen werden:', e);
        }
        return false;
    }

    saveToCache() {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify({
                data: this.profile,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Cache konnte nicht gespeichert werden:', e);
        }
    }

    /**
     * Lädt und merged alle Profildaten aus allen Quellen
     */
    async loadFullProfile() {
        console.log('📊 Lade vollständiges Profil aus allen Quellen...');
        
        const sources = await Promise.allSettled([
            this.loadFromCloud(),
            this.loadFromLocalStorage(),
            this.loadFromResume(),
            this.loadFromWorkflows(),
            this.loadFromAuth()
        ]);

        const [cloudResult, localResult, resumeResult, workflowResult, authResult] = sources;

        const cloudData = cloudResult.status === 'fulfilled' ? cloudResult.value : {};
        const localData = localResult.status === 'fulfilled' ? localResult.value : {};
        const resumeData = resumeResult.status === 'fulfilled' ? resumeResult.value : {};
        const workflowData = workflowResult.status === 'fulfilled' ? workflowResult.value : {};
        const authData = authResult.status === 'fulfilled' ? authResult.value : {};

        console.log('📋 Geladene Datenquellen:', {
            cloud: Object.keys(cloudData).length,
            local: Object.keys(localData).length,
            resume: Object.keys(resumeData).length,
            workflow: Object.keys(workflowData).length,
            auth: Object.keys(authData).length
        });

        // Merge mit Priorität: Spezifische User-Eingaben > Generische Defaults
        this.profile = this.mergeProfiles(
            authData,      // Niedrigste Priorität (oft "Test User")
            cloudData,     // Cloud-gespeicherte Daten
            workflowData,  // Workflow-Daten
            localData,     // Lokale Daten
            resumeData     // Höchste Priorität (direkte User-Eingaben)
        );

        // Filter "Test User" und leere Werte
        this.sanitizeProfile();
        
        this.saveToCache();
        
        console.log('✅ Unified Profile erstellt:', {
            name: `${this.profile.firstName} ${this.profile.lastName}`,
            email: this.profile.email,
            hasExperience: (this.profile.experience?.length || 0) > 0,
            hasEducation: (this.profile.education?.length || 0) > 0,
            hasSkills: (this.profile.skills?.length || 0) > 0
        });

        return this.profile;
    }

    /**
     * Lädt Daten aus der Cloud (AWS/Netlify)
     */
    async loadFromCloud() {
        try {
            if (window.awsProfileAPI?.isInitialized) {
                const profile = await window.awsProfileAPI.loadProfile();
                if (profile) {
                    return this.normalizeCloudProfile(profile);
                }
            }
        } catch (e) {
            console.log('Cloud-Profil nicht verfügbar:', e.message);
        }
        return {};
    }

    normalizeCloudProfile(profile) {
        const personal = profile.personal || {};
        return {
            firstName: profile.firstName || personal.firstName || '',
            lastName: profile.lastName || personal.lastName || '',
            email: profile.email || personal.email || '',
            phone: profile.phone || personal.phone || '',
            location: profile.location || personal.location || '',
            birthDate: profile.birthDate || personal.birthDate || '',
            profession: profile.profession || profile.currentJob || '',
            summary: profile.summary || '',
            experience: profile.experience || [],
            education: profile.education || [],
            skills: this.normalizeSkills(profile.skills),
            languages: profile.languages || [],
            careerGoals: profile.careerGoals || {},
            profileImageUrl: profile.profileImageUrl || ''
        };
    }

    /**
     * Lädt Daten aus LocalStorage
     */
    async loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('bewerbungsmanager_profile');
            if (stored) {
                const data = JSON.parse(stored);
                return this.normalizeLocalProfile(data);
            }
        } catch (e) {
            console.log('LocalStorage-Profil nicht verfügbar:', e.message);
        }
        return {};
    }

    normalizeLocalProfile(profile) {
        const personal = profile.personal || {};
        return {
            firstName: profile.firstName || personal.firstName || '',
            lastName: profile.lastName || personal.lastName || '',
            email: profile.email || personal.email || '',
            phone: profile.phone || personal.phone || '',
            location: profile.location || personal.location || '',
            birthDate: profile.birthDate || personal.birthDate || '',
            profession: profile.profession || profile.currentJob || '',
            summary: profile.summary || '',
            experience: profile.experience || [],
            education: profile.education || [],
            skills: this.normalizeSkills(profile.skills),
            languages: profile.languages || [],
            careerGoals: profile.careerGoals || {},
            profileImageUrl: profile.profileImageUrl || ''
        };
    }

    /**
     * Lädt Daten aus gespeicherten Lebensläufen
     */
    async loadFromResume() {
        try {
            // Versuche Cloud-Resume
            if (window.cloudDataService) {
                try {
                    const resumes = await window.cloudDataService.getResumes();
                    if (resumes && resumes.length > 0) {
                        // Neueste Resume nehmen
                        const latest = resumes.sort((a, b) => 
                            new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
                        )[0];
                        return this.normalizeResumeData(latest);
                    }
                } catch (e) {
                    console.log('Cloud-Resume nicht verfügbar');
                }
            }

            // Fallback: LocalStorage Resume
            const stored = localStorage.getItem('resumeData');
            if (stored) {
                return this.normalizeResumeData(JSON.parse(stored));
            }
            
            // Versuche auch gespeicherte Lebenslauf-Versionen
            const versions = localStorage.getItem('resume_versions');
            if (versions) {
                const versionList = JSON.parse(versions);
                if (versionList.length > 0) {
                    const latest = versionList.sort((a, b) => 
                        new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
                    )[0];
                    return this.normalizeResumeData(latest.data || latest);
                }
            }
        } catch (e) {
            console.log('Resume-Daten nicht verfügbar:', e.message);
        }
        return {};
    }

    normalizeResumeData(resume) {
        const pi = resume.personalInfo || resume.personal || {};
        const sections = resume.sections || [];
        
        // Extrahiere Erfahrungen
        const experienceSection = sections.find(s => s.type === 'experience');
        const educationSection = sections.find(s => s.type === 'education');
        
        return {
            firstName: pi.firstName || '',
            lastName: pi.lastName || '',
            email: pi.email || '',
            phone: pi.phone || '',
            location: pi.location || pi.address || '',
            birthDate: pi.birthDate || '',
            profession: pi.title || pi.profession || '',
            summary: pi.summary || '',
            linkedin: pi.linkedin || '',
            website: pi.website || '',
            github: pi.github || '',
            experience: experienceSection?.entries || resume.experience || [],
            education: educationSection?.entries || resume.education || [],
            skills: this.normalizeSkills(resume.skills),
            languages: resume.languages || [],
            profileImageUrl: pi.profileImageUrl || ''
        };
    }

    /**
     * Lädt Daten aus Workflows (Fachliche Entwicklung, Coaching)
     */
    async loadFromWorkflows() {
        const workflowData = {
            fachlicheEntwicklung: {},
            coaching: {},
            skills: [],
            achievements: [],
            strengths: [],
            goals: []
        };

        try {
            // Fachliche Entwicklung Workflow
            for (let i = 1; i <= 6; i++) {
                const stepData = localStorage.getItem(`fachliche_entwicklung_step${i}`);
                if (stepData) {
                    try {
                        const parsed = JSON.parse(stepData);
                        workflowData.fachlicheEntwicklung[`step${i}`] = parsed;
                        
                        // Extrahiere relevante Daten
                        if (parsed.skills) workflowData.skills.push(...(Array.isArray(parsed.skills) ? parsed.skills : [parsed.skills]));
                        if (parsed.achievements) workflowData.achievements.push(...(Array.isArray(parsed.achievements) ? parsed.achievements : [parsed.achievements]));
                        if (parsed.strengths) workflowData.strengths.push(...(Array.isArray(parsed.strengths) ? parsed.strengths : [parsed.strengths]));
                        if (parsed.goals) workflowData.goals.push(...(Array.isArray(parsed.goals) ? parsed.goals : [parsed.goals]));
                    } catch (e) {}
                }
            }

            // Coaching Workflow
            for (let i = 1; i <= 10; i++) {
                const stepData = localStorage.getItem(`coaching_workflow_step${i}`);
                if (stepData) {
                    try {
                        const parsed = JSON.parse(stepData);
                        workflowData.coaching[`step${i}`] = parsed;
                        
                        if (parsed.skills) workflowData.skills.push(...(Array.isArray(parsed.skills) ? parsed.skills : [parsed.skills]));
                        if (parsed.insights) workflowData.strengths.push(...(Array.isArray(parsed.insights) ? parsed.insights : [parsed.insights]));
                    } catch (e) {}
                }
            }

            // Cloud-Workflows laden
            if (window.workflowAPI) {
                try {
                    const cloudWorkflows = await window.workflowAPI.getWorkflowData('fachliche-entwicklung');
                    if (cloudWorkflows) {
                        workflowData.fachlicheEntwicklung = {
                            ...workflowData.fachlicheEntwicklung,
                            ...cloudWorkflows
                        };
                    }
                } catch (e) {}
            }
        } catch (e) {
            console.log('Workflow-Daten nicht verfügbar:', e.message);
        }

        return {
            workflowData,
            skills: [...new Set(workflowData.skills.flat().filter(Boolean))],
            achievements: [...new Set(workflowData.achievements.flat().filter(Boolean))],
            strengths: [...new Set(workflowData.strengths.flat().filter(Boolean))],
            careerGoals: {
                goals: [...new Set(workflowData.goals.flat().filter(Boolean))]
            }
        };
    }

    /**
     * Lädt Daten aus dem Auth-System (niedrigste Priorität)
     */
    async loadFromAuth() {
        try {
            let userData = null;

            if (window.realUserAuth?.isLoggedIn?.()) {
                userData = window.realUserAuth.getCurrentUser();
            } else if (window.awsAuth?.isLoggedIn?.()) {
                userData = window.awsAuth.getUserDataFromToken();
            }

            if (userData) {
                // Prüfe auf "Test User" - diese Daten ignorieren
                const name = userData.name || '';
                const nameParts = name.split(' ');
                
                if (nameParts[0] === 'Test' && (nameParts[1] === 'User' || !nameParts[1])) {
                    console.log('⚠️ Auth-Daten sind Testdaten, werden ignoriert');
                    return { email: userData.email || '' };
                }

                return {
                    firstName: userData.firstName || nameParts[0] || '',
                    lastName: userData.lastName || nameParts.slice(1).join(' ') || '',
                    email: userData.email || '',
                    profileImageUrl: userData.picture || userData.avatar || ''
                };
            }
        } catch (e) {
            console.log('Auth-Daten nicht verfügbar:', e.message);
        }
        return {};
    }

    /**
     * Normalisiert Skills aus verschiedenen Formaten
     */
    normalizeSkills(skills) {
        if (!skills) return [];
        
        // Array von Strings
        if (Array.isArray(skills) && typeof skills[0] === 'string') {
            return skills;
        }
        
        // Array von Objekten mit name
        if (Array.isArray(skills) && skills[0]?.name) {
            return skills.map(s => s.name);
        }
        
        // Objekt mit technicalSkills/softSkills
        if (skills.technicalSkills || skills.softSkills || skills.technical) {
            const allSkills = [];
            
            if (skills.technicalSkills) {
                skills.technicalSkills.forEach(cat => {
                    if (cat.skills) allSkills.push(...cat.skills);
                });
            }
            if (skills.technical) {
                allSkills.push(...skills.technical);
            }
            if (skills.softSkills) {
                allSkills.push(...skills.softSkills);
            }
            
            return [...new Set(allSkills)];
        }
        
        return [];
    }

    /**
     * Merged Profile mit Priorität (spätere überschreiben frühere)
     */
    mergeProfiles(...profiles) {
        const merged = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            location: '',
            birthDate: '',
            profession: '',
            summary: '',
            linkedin: '',
            website: '',
            github: '',
            experience: [],
            education: [],
            skills: [],
            languages: [],
            careerGoals: {},
            achievements: [],
            strengths: [],
            profileImageUrl: '',
            workflowData: {}
        };

        for (const profile of profiles) {
            if (!profile) continue;
            
            // Einfache Felder: Überschreibe nur wenn neuer Wert nicht leer
            ['firstName', 'lastName', 'email', 'phone', 'location', 'birthDate', 
             'profession', 'summary', 'linkedin', 'website', 'github', 'profileImageUrl'
            ].forEach(field => {
                if (profile[field] && profile[field].trim?.()) {
                    merged[field] = profile[field];
                }
            });

            // Arrays: Merge und dedupliziere
            ['experience', 'education', 'languages'].forEach(field => {
                if (profile[field]?.length > 0) {
                    merged[field] = this.mergeArrays(merged[field], profile[field]);
                }
            });

            // Skills: Flatten und dedupliziere
            if (profile.skills?.length > 0) {
                const newSkills = Array.isArray(profile.skills) ? profile.skills : [];
                merged.skills = [...new Set([...merged.skills, ...newSkills])];
            }

            // Achievements & Strengths
            if (profile.achievements?.length > 0) {
                merged.achievements = [...new Set([...merged.achievements, ...profile.achievements])];
            }
            if (profile.strengths?.length > 0) {
                merged.strengths = [...new Set([...merged.strengths, ...profile.strengths])];
            }

            // Objects: Deep merge
            if (profile.careerGoals) {
                merged.careerGoals = { ...merged.careerGoals, ...profile.careerGoals };
            }
            if (profile.workflowData) {
                merged.workflowData = { ...merged.workflowData, ...profile.workflowData };
            }
        }

        return merged;
    }

    mergeArrays(existing, newItems) {
        if (!existing?.length) return newItems || [];
        if (!newItems?.length) return existing;

        // Versuche Duplikate zu erkennen und zu mergen
        const merged = [...existing];
        
        for (const newItem of newItems) {
            const existingIndex = merged.findIndex(e => 
                this.isSameEntry(e, newItem)
            );
            
            if (existingIndex === -1) {
                merged.push(newItem);
            } else {
                // Merge die Einträge
                merged[existingIndex] = { ...merged[existingIndex], ...newItem };
            }
        }

        return merged;
    }

    isSameEntry(a, b) {
        // Für Experience
        if (a.company && b.company) {
            return a.company.toLowerCase() === b.company.toLowerCase() &&
                   a.position?.toLowerCase() === b.position?.toLowerCase();
        }
        // Für Education
        if (a.institution && b.institution) {
            return a.institution.toLowerCase() === b.institution.toLowerCase();
        }
        // Für Languages
        if (a.language && b.language) {
            return a.language.toLowerCase() === b.language.toLowerCase();
        }
        return false;
    }

    /**
     * Bereinigt das Profil von ungültigen Daten
     */
    sanitizeProfile() {
        if (!this.profile) return;

        // Entferne "Test User" Namen
        if (this.profile.firstName === 'Test' && this.profile.lastName === 'User') {
            this.profile.firstName = '';
            this.profile.lastName = '';
        }

        // Trimme alle String-Felder
        for (const key of Object.keys(this.profile)) {
            if (typeof this.profile[key] === 'string') {
                this.profile[key] = this.profile[key].trim();
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Gibt das vollständige Profil zurück
     */
    getProfile() {
        return this.profile || {};
    }

    /**
     * Gibt den Anzeigenamen zurück
     */
    getDisplayName() {
        if (!this.profile) return 'Profil';
        
        const { firstName, lastName, email } = this.profile;
        
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        }
        if (firstName) {
            return firstName;
        }
        if (email) {
            const emailName = email.split('@')[0];
            return emailName.length > 3 ? emailName : 'Profil';
        }
        return 'Profil';
    }

    /**
     * Gibt den Vornamen zurück
     */
    getFirstName() {
        return this.profile?.firstName || '';
    }

    /**
     * Gibt die E-Mail zurück
     */
    getEmail() {
        return this.profile?.email || '';
    }

    /**
     * Gibt das Profilbild zurück
     */
    getProfileImage() {
        return this.profile?.profileImageUrl || '';
    }

    /**
     * Speichert das Profil
     */
    async saveProfile(data) {
        // Merge mit existierenden Daten
        this.profile = this.mergeProfiles(this.profile, data);
        this.sanitizeProfile();
        this.saveToCache();

        // Speichere in Cloud
        try {
            if (window.awsProfileAPI?.isInitialized) {
                const profileToSave = {
                    ...this.profile,
                    personal: {
                        firstName: this.profile.firstName,
                        lastName: this.profile.lastName,
                        email: this.profile.email,
                        phone: this.profile.phone,
                        location: this.profile.location,
                        birthDate: this.profile.birthDate
                    },
                    updatedAt: new Date().toISOString()
                };
                await window.awsProfileAPI.saveProfile(profileToSave);
                console.log('✅ Profil in Cloud gespeichert');
            }
        } catch (e) {
            console.error('Fehler beim Cloud-Speichern:', e);
        }

        // Speichere auch lokal
        try {
            localStorage.setItem('bewerbungsmanager_profile', JSON.stringify(this.profile));
        } catch (e) {
            console.error('Fehler beim lokalen Speichern:', e);
        }

        this.notifyListeners();
        return this.profile;
    }

    /**
     * Aktualisiert einzelne Felder
     */
    async updateField(field, value) {
        if (!this.profile) {
            this.profile = {};
        }
        this.profile[field] = value;
        await this.saveProfile(this.profile);
    }

    /**
     * Registriert einen Listener für Profil-Änderungen
     */
    onProfileChange(callback) {
        this.listeners.push(callback);
        // Sofort benachrichtigen wenn Profil bereits geladen
        if (this.profile) {
            callback(this.profile);
        }
    }

    notifyListeners() {
        for (const listener of this.listeners) {
            try {
                listener(this.profile);
            } catch (e) {
                console.error('Listener-Fehler:', e);
            }
        }
    }

    /**
     * Erzwingt Neuladen des Profils
     */
    async refresh() {
        localStorage.removeItem(this.cacheKey);
        await this.loadFullProfile();
        this.notifyListeners();
        return this.profile;
    }
}

// Global Instance
window.unifiedProfileService = new UnifiedProfileService();

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedProfileService;
}

console.log('✅ UnifiedProfileService geladen');
