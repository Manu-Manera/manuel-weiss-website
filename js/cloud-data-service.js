/**
 * CLOUD DATA SERVICE
 * Zentrale Verwaltung aller Benutzerdaten in AWS
 * Ersetzt localStorage durch Cloud-Speicherung
 */

class CloudDataService {
    constructor() {
        this.apiEndpoint = '/.netlify/functions/user-data';
        this.cache = {
            profile: null,
            resumes: null,
            documents: null,
            coverLetters: null,
            applications: null,
            photos: null
        };
        this.cacheExpiry = {};
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten
        this.syncInProgress = false;
    }

    /**
     * Prüft ob der User eingeloggt ist
     */
    isUserLoggedIn() {
        if (window.awsAuth && window.awsAuth.isLoggedIn()) {
            return true;
        }
        if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
            return true;
        }
        const session = localStorage.getItem('aws_auth_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                return !!parsed.idToken;
            } catch (e) {}
        }
        return false;
    }

    /**
     * Holt das Auth Token
     */
    async getAuthToken() {
        // 1. awsAuth
        if (window.awsAuth && window.awsAuth.isLoggedIn()) {
            const user = window.awsAuth.getCurrentUser();
            if (user?.idToken) return user.idToken;
        }
        
        // 2. realUserAuth
        if (window.realUserAuth && window.realUserAuth.isLoggedIn()) {
            const user = window.realUserAuth.getCurrentUser();
            if (user?.idToken) return user.idToken;
        }
        
        // 3. localStorage
        const session = localStorage.getItem('aws_auth_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed.idToken) return parsed.idToken;
            } catch (e) {}
        }
        
        throw new Error('Nicht angemeldet');
    }

    /**
     * API Request Helper
     */
    async apiRequest(path, method = 'GET', body = null) {
        if (!this.isUserLoggedIn()) {
            console.log('⚠️ User nicht eingeloggt - verwende localStorage');
            return null;
        }

        try {
            const token = await this.getAuthToken();
            const options = {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            if (body) {
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(`${this.apiEndpoint}${path}`, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API Error');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Cloud API Error:', error);
            throw error;
        }
    }

    // ========================================
    // PROFIL
    // ========================================
    
    /**
     * Profildaten laden
     */
    async getProfile(forceRefresh = false) {
        // Cache prüfen
        if (!forceRefresh && this.cache.profile && this.cacheExpiry.profile > Date.now()) {
            return this.cache.profile;
        }

        try {
            const profile = await this.apiRequest('/profile');
            if (profile) {
                this.cache.profile = profile;
                this.cacheExpiry.profile = Date.now() + this.CACHE_DURATION;
                console.log('✅ Profil aus Cloud geladen');
                return profile;
            }
        } catch (error) {
            console.warn('Cloud-Laden fehlgeschlagen, verwende localStorage');
        }
        
        // Fallback: localStorage
        const local = localStorage.getItem('bewerbungsmanager_profile');
        return local ? JSON.parse(local) : null;
    }

    /**
     * Profildaten speichern
     */
    async saveProfile(profileData) {
        // Immer lokal speichern als Backup
        localStorage.setItem('bewerbungsmanager_profile', JSON.stringify(profileData));
        
        try {
            const result = await this.apiRequest('/profile', 'PUT', profileData);
            if (result?.success) {
                this.cache.profile = result.profile;
                this.cacheExpiry.profile = Date.now() + this.CACHE_DURATION;
                console.log('✅ Profil in Cloud gespeichert');
                return result;
            }
        } catch (error) {
            console.warn('Cloud-Speichern fehlgeschlagen:', error);
        }
        
        return { success: true, local: true };
    }

    // ========================================
    // LEBENSLÄUFE
    // ========================================
    
    /**
     * Alle Lebensläufe laden
     */
    async getResumes(forceRefresh = false) {
        if (!forceRefresh && this.cache.resumes && this.cacheExpiry.resumes > Date.now()) {
            return this.cache.resumes;
        }

        try {
            const resumes = await this.apiRequest('/resumes');
            if (resumes) {
                this.cache.resumes = resumes;
                this.cacheExpiry.resumes = Date.now() + this.CACHE_DURATION;
                console.log('✅ Lebensläufe aus Cloud geladen:', resumes.length);
                return resumes;
            }
        } catch (error) {
            console.warn('Cloud-Laden fehlgeschlagen, verwende localStorage');
        }
        
        // Fallback: localStorage
        const local = localStorage.getItem('user_resumes');
        return local ? JSON.parse(local) : [];
    }

    /**
     * Lebenslauf speichern
     */
    async saveResume(resumeData) {
        // Lokal speichern
        let resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
        const existingIndex = resumes.findIndex(r => r.id === resumeData.id);
        if (existingIndex >= 0) {
            resumes[existingIndex] = resumeData;
        } else {
            resumes.push(resumeData);
        }
        localStorage.setItem('user_resumes', JSON.stringify(resumes));
        
        try {
            const result = await this.apiRequest('/resumes', 'POST', resumeData);
            if (result?.success) {
                this.cache.resumes = result.resumes;
                this.cacheExpiry.resumes = Date.now() + this.CACHE_DURATION;
                console.log('✅ Lebenslauf in Cloud gespeichert');
                return result;
            }
        } catch (error) {
            console.warn('Cloud-Speichern fehlgeschlagen:', error);
        }
        
        return { success: true, local: true, resume: resumeData };
    }

    /**
     * Lebenslauf löschen
     */
    async deleteResume(resumeId) {
        // Lokal löschen
        let resumes = JSON.parse(localStorage.getItem('user_resumes') || '[]');
        resumes = resumes.filter(r => r.id !== resumeId);
        localStorage.setItem('user_resumes', JSON.stringify(resumes));
        
        try {
            await this.apiRequest(`/resumes?id=${resumeId}`, 'DELETE');
            this.cache.resumes = resumes;
            console.log('✅ Lebenslauf aus Cloud gelöscht');
        } catch (error) {
            console.warn('Cloud-Löschen fehlgeschlagen:', error);
        }
        
        return { success: true };
    }

    // ========================================
    // DOKUMENTE (Zeugnisse, Zertifikate)
    // ========================================
    
    /**
     * Alle Dokumente laden
     */
    async getDocuments(forceRefresh = false) {
        if (!forceRefresh && this.cache.documents && this.cacheExpiry.documents > Date.now()) {
            return this.cache.documents;
        }

        try {
            const documents = await this.apiRequest('/documents');
            if (documents) {
                this.cache.documents = documents;
                this.cacheExpiry.documents = Date.now() + this.CACHE_DURATION;
                console.log('✅ Dokumente aus Cloud geladen:', documents.length);
                return documents;
            }
        } catch (error) {
            console.warn('Cloud-Laden fehlgeschlagen, verwende localStorage');
        }
        
        const local = localStorage.getItem('user_certificates');
        return local ? JSON.parse(local) : [];
    }

    /**
     * Dokument speichern
     */
    async saveDocument(documentData) {
        // Lokal speichern
        let documents = JSON.parse(localStorage.getItem('user_certificates') || '[]');
        const existingIndex = documents.findIndex(d => d.id === documentData.id);
        if (existingIndex >= 0) {
            documents[existingIndex] = documentData;
        } else {
            documents.push(documentData);
        }
        localStorage.setItem('user_certificates', JSON.stringify(documents));
        
        try {
            const result = await this.apiRequest('/documents', 'POST', documentData);
            if (result?.success) {
                this.cache.documents = result.documents;
                this.cacheExpiry.documents = Date.now() + this.CACHE_DURATION;
                console.log('✅ Dokument in Cloud gespeichert');
                return result;
            }
        } catch (error) {
            console.warn('Cloud-Speichern fehlgeschlagen:', error);
        }
        
        return { success: true, local: true, document: documentData };
    }

    /**
     * Dokument löschen
     */
    async deleteDocument(documentId) {
        let documents = JSON.parse(localStorage.getItem('user_certificates') || '[]');
        documents = documents.filter(d => d.id !== documentId);
        localStorage.setItem('user_certificates', JSON.stringify(documents));
        
        try {
            await this.apiRequest(`/documents?id=${documentId}`, 'DELETE');
            this.cache.documents = documents;
            console.log('✅ Dokument aus Cloud gelöscht');
        } catch (error) {
            console.warn('Cloud-Löschen fehlgeschlagen:', error);
        }
        
        return { success: true };
    }

    // ========================================
    // ANSCHREIBEN
    // ========================================
    
    /**
     * Alle Anschreiben laden
     */
    async getCoverLetters(forceRefresh = false) {
        if (!forceRefresh && this.cache.coverLetters && this.cacheExpiry.coverLetters > Date.now()) {
            return this.cache.coverLetters;
        }

        try {
            const coverLetters = await this.apiRequest('/cover-letters');
            if (coverLetters) {
                this.cache.coverLetters = coverLetters;
                this.cacheExpiry.coverLetters = Date.now() + this.CACHE_DURATION;
                console.log('✅ Anschreiben aus Cloud geladen:', coverLetters.length);
                return coverLetters;
            }
        } catch (error) {
            console.warn('Cloud-Laden fehlgeschlagen, verwende localStorage');
        }
        
        const local = localStorage.getItem('cover_letter_drafts');
        return local ? JSON.parse(local) : [];
    }

    /**
     * Anschreiben speichern
     */
    async saveCoverLetter(coverLetterData) {
        // Lokal speichern
        let coverLetters = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
        const existingIndex = coverLetters.findIndex(cl => cl.id === coverLetterData.id);
        if (existingIndex >= 0) {
            coverLetters[existingIndex] = coverLetterData;
        } else {
            coverLetters.push(coverLetterData);
        }
        localStorage.setItem('cover_letter_drafts', JSON.stringify(coverLetters));
        
        try {
            const result = await this.apiRequest('/cover-letters', 'POST', coverLetterData);
            if (result?.success) {
                this.cache.coverLetters = result.coverLetters;
                this.cacheExpiry.coverLetters = Date.now() + this.CACHE_DURATION;
                console.log('✅ Anschreiben in Cloud gespeichert');
                return result;
            }
        } catch (error) {
            console.warn('Cloud-Speichern fehlgeschlagen:', error);
        }
        
        return { success: true, local: true, coverLetter: coverLetterData };
    }

    /**
     * Anschreiben löschen
     */
    async deleteCoverLetter(coverLetterId) {
        let coverLetters = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
        coverLetters = coverLetters.filter(cl => cl.id !== coverLetterId);
        localStorage.setItem('cover_letter_drafts', JSON.stringify(coverLetters));
        
        try {
            await this.apiRequest(`/cover-letters?id=${coverLetterId}`, 'DELETE');
            this.cache.coverLetters = coverLetters;
            console.log('✅ Anschreiben aus Cloud gelöscht');
        } catch (error) {
            console.warn('Cloud-Löschen fehlgeschlagen:', error);
        }
        
        return { success: true };
    }

    // ========================================
    // BEWERBUNGEN
    // ========================================
    
    /**
     * Alle Bewerbungen laden
     */
    async getApplications(forceRefresh = false) {
        if (!forceRefresh && this.cache.applications && this.cacheExpiry.applications > Date.now()) {
            return this.cache.applications;
        }

        try {
            const applications = await this.apiRequest('/applications');
            if (applications) {
                this.cache.applications = applications;
                this.cacheExpiry.applications = Date.now() + this.CACHE_DURATION;
                console.log('✅ Bewerbungen aus Cloud geladen:', applications.length);
                return applications;
            }
        } catch (error) {
            console.warn('Cloud-Laden fehlgeschlagen, verwende localStorage');
        }
        
        const local = localStorage.getItem('bewerbungsmanager_applications');
        return local ? JSON.parse(local) : [];
    }

    /**
     * Bewerbung speichern
     */
    async saveApplication(applicationData) {
        // Lokal speichern
        let applications = JSON.parse(localStorage.getItem('bewerbungsmanager_applications') || '[]');
        const existingIndex = applications.findIndex(a => a.id === applicationData.id);
        if (existingIndex >= 0) {
            applications[existingIndex] = applicationData;
        } else {
            applications.push(applicationData);
        }
        localStorage.setItem('bewerbungsmanager_applications', JSON.stringify(applications));
        
        try {
            const result = await this.apiRequest('/applications', 'POST', applicationData);
            if (result?.success) {
                this.cache.applications = result.applications;
                this.cacheExpiry.applications = Date.now() + this.CACHE_DURATION;
                console.log('✅ Bewerbung in Cloud gespeichert');
                return result;
            }
        } catch (error) {
            console.warn('Cloud-Speichern fehlgeschlagen:', error);
        }
        
        return { success: true, local: true, application: applicationData };
    }

    // ========================================
    // BEWERBUNGSFOTOS
    // ========================================
    
    /**
     * Alle Fotos laden
     */
    async getPhotos(forceRefresh = false) {
        if (!forceRefresh && this.cache.photos && this.cacheExpiry.photos > Date.now()) {
            return this.cache.photos;
        }

        try {
            const photos = await this.apiRequest('/photos');
            if (photos) {
                this.cache.photos = photos;
                this.cacheExpiry.photos = Date.now() + this.CACHE_DURATION;
                // Auch lokal speichern für Offline-Zugriff
                localStorage.setItem('user_photos', JSON.stringify(photos));
                console.log('✅ Fotos aus Cloud geladen:', photos.length);
                return photos;
            }
        } catch (error) {
            console.warn('Cloud-Laden fehlgeschlagen, verwende localStorage');
        }
        
        const local = localStorage.getItem('user_photos');
        return local ? JSON.parse(local) : [];
    }

    /**
     * Foto speichern
     */
    async savePhoto(photoData) {
        // Lokal speichern
        let photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
        const existingIndex = photos.findIndex(p => p.id === photoData.id);
        if (existingIndex >= 0) {
            photos[existingIndex] = photoData;
        } else {
            photos.push(photoData);
        }
        localStorage.setItem('user_photos', JSON.stringify(photos));
        
        try {
            const result = await this.apiRequest('/photos', 'POST', photoData);
            if (result?.success) {
                this.cache.photos = result.photos;
                this.cacheExpiry.photos = Date.now() + this.CACHE_DURATION;
                console.log('✅ Foto in Cloud gespeichert');
                return result;
            }
        } catch (error) {
            console.warn('Cloud-Speichern fehlgeschlagen:', error);
        }
        
        return { success: true, local: true, photo: photoData };
    }

    /**
     * Foto löschen
     */
    async deletePhoto(photoId) {
        // Lokal löschen
        let photos = JSON.parse(localStorage.getItem('user_photos') || '[]');
        photos = photos.filter(p => p.id !== photoId);
        localStorage.setItem('user_photos', JSON.stringify(photos));
        
        // Selection entfernen wenn das gelöschte Foto ausgewählt war
        if (localStorage.getItem('selected_photo_id') === photoId) {
            localStorage.removeItem('selected_photo_id');
        }
        
        try {
            const result = await this.apiRequest(`/photos?id=${photoId}`, 'DELETE');
            if (result?.success) {
                this.cache.photos = photos;
                console.log('✅ Foto aus Cloud gelöscht');
                return result;
            }
        } catch (error) {
            console.warn('Cloud-Löschen fehlgeschlagen:', error);
        }
        
        return { success: true, local: true };
    }

    // ========================================
    // SYNCHRONISATION
    // ========================================
    
    /**
     * Alle lokalen Daten in die Cloud synchronisieren
     */
    async syncToCloud() {
        if (!this.isUserLoggedIn()) {
            console.log('⚠️ Nicht angemeldet - Sync nicht möglich');
            return { success: false, reason: 'not_logged_in' };
        }
        
        if (this.syncInProgress) {
            console.log('⏳ Sync läuft bereits');
            return { success: false, reason: 'in_progress' };
        }
        
        this.syncInProgress = true;
        console.log('🔄 Starte Cloud-Synchronisation...');
        
        try {
            // Profil
            const localProfile = localStorage.getItem('bewerbungsmanager_profile');
            if (localProfile) {
                await this.saveProfile(JSON.parse(localProfile));
            }
            
            // Lebensläufe
            const localResumes = localStorage.getItem('user_resumes');
            if (localResumes) {
                const resumes = JSON.parse(localResumes);
                for (const resume of resumes) {
                    await this.saveResume(resume);
                }
            }
            
            // Dokumente
            const localDocs = localStorage.getItem('user_certificates');
            if (localDocs) {
                const docs = JSON.parse(localDocs);
                for (const doc of docs) {
                    await this.saveDocument(doc);
                }
            }
            
            // Anschreiben
            const localCoverLetters = localStorage.getItem('cover_letter_drafts');
            if (localCoverLetters) {
                const coverLetters = JSON.parse(localCoverLetters);
                for (const cl of coverLetters) {
                    await this.saveCoverLetter(cl);
                }
            }
            
            // Bewerbungen
            const localApps = localStorage.getItem('bewerbungsmanager_applications');
            if (localApps) {
                const apps = JSON.parse(localApps);
                for (const app of apps) {
                    await this.saveApplication(app);
                }
            }
            
            // Fotos
            const localPhotos = localStorage.getItem('user_photos');
            if (localPhotos) {
                const photos = JSON.parse(localPhotos);
                for (const photo of photos) {
                    await this.savePhoto(photo);
                }
            }
            
            console.log('✅ Cloud-Synchronisation abgeschlossen');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Sync-Fehler:', error);
            return { success: false, error: error.message };
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Alle Daten aus der Cloud laden und lokal speichern
     */
    async syncFromCloud() {
        if (!this.isUserLoggedIn()) {
            console.log('⚠️ Nicht angemeldet - Sync nicht möglich');
            return { success: false, reason: 'not_logged_in' };
        }
        
        console.log('🔄 Lade Daten aus Cloud...');
        
        try {
            const allData = await this.apiRequest('');
            
            if (allData) {
                // Lokal speichern
                if (allData.profile) {
                    localStorage.setItem('bewerbungsmanager_profile', JSON.stringify(allData.profile));
                }
                if (allData.resumes?.length > 0) {
                    localStorage.setItem('user_resumes', JSON.stringify(allData.resumes));
                }
                if (allData.documents?.length > 0) {
                    localStorage.setItem('user_certificates', JSON.stringify(allData.documents));
                }
                if (allData.coverLetters?.length > 0) {
                    localStorage.setItem('cover_letter_drafts', JSON.stringify(allData.coverLetters));
                }
                if (allData.applications?.length > 0) {
                    localStorage.setItem('bewerbungsmanager_applications', JSON.stringify(allData.applications));
                }
                
                // Cache aktualisieren
                this.cache = {
                    profile: allData.profile,
                    resumes: allData.resumes || [],
                    documents: allData.documents || [],
                    coverLetters: allData.coverLetters || [],
                    applications: allData.applications || []
                };
                
                const now = Date.now() + this.CACHE_DURATION;
                this.cacheExpiry = {
                    profile: now,
                    resumes: now,
                    documents: now,
                    coverLetters: now,
                    applications: now
                };
                
                console.log('✅ Daten aus Cloud geladen und lokal gespeichert');
                return { success: true, data: allData };
            }
            
            return { success: true, data: null };
            
        } catch (error) {
            console.error('❌ Cloud-Laden fehlgeschlagen:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cache leeren
     */
    clearCache() {
        this.cache = {
            profile: null,
            resumes: null,
            documents: null,
            coverLetters: null,
            applications: null,
            photos: null
        };
        this.cacheExpiry = {};
        console.log('🗑️ Cache geleert');
    }
}

// Globale Instanz erstellen
window.cloudDataService = new CloudDataService();

// Bei Login automatisch syncen
window.addEventListener('userLoggedIn', async () => {
    console.log('🔄 User eingeloggt - starte Cloud-Sync...');
    setTimeout(async () => {
        await window.cloudDataService.syncFromCloud();
    }, 1000);
});

console.log('☁️ Cloud Data Service geladen');
