/**
 * Organisationsentwicklung API
 * API-First Ansatz für Assessment-Speicherung mit Fallback zu localStorage
 */

class OrgDevAPI {
    constructor() {
        this.apiBaseUrl = null;
        this.initApiBaseUrl();
    }

    initApiBaseUrl() {
        // Verwende zentrale API-Konfiguration
        if (window.getApiUrl) {
            this.apiBaseUrl = window.getApiUrl('ORG_DEV_ASSESSMENTS');
        } else if (window.AWS_APP_CONFIG?.API_BASE) {
            // Fallback auf AWS API Base
            this.apiBaseUrl = `${window.AWS_APP_CONFIG.API_BASE}/organisationsentwicklung/assessments`;
        } else {
            // Fallback: Verwende AWS API Gateway direkt
            console.warn('⚠️ ORG_DEV_ASSESSMENTS Endpoint nicht in aws-app-config.js gefunden. Verwende direkten API Gateway Pfad.');
            this.apiBaseUrl = `${window.AWS_APP_CONFIG?.API_BASE || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1'}/organisationsentwicklung/assessments`;
        }
    }

    /**
     * Hole Auth Token falls vorhanden
     */
    async getAuthToken() {
        try {
            if (window.UnifiedAWSAuth && window.UnifiedAWSAuth.getInstance) {
                const auth = window.UnifiedAWSAuth.getInstance();
                if (auth && auth.getCurrentUser) {
                    const user = await auth.getCurrentUser();
                    if (user && user.signInUserSession) {
                        return user.signInUserSession.idToken.jwtToken;
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ Auth Token konnte nicht geladen werden:', e);
        }
        return null;
    }

    /**
     * Hole User ID aus Auth
     */
    async getUserId() {
        try {
            if (window.UnifiedAWSAuth && window.UnifiedAWSAuth.getInstance) {
                const auth = window.UnifiedAWSAuth.getInstance();
                if (auth && auth.getCurrentUser) {
                    const user = await auth.getCurrentUser();
                    if (user && user.username) {
                        return user.username;
                    }
                    if (user && user.attributes && user.attributes.sub) {
                        return user.attributes.sub;
                    }
                }
            }
        } catch (e) {
            console.warn('⚠️ User ID konnte nicht geladen werden:', e);
        }
        return null;
    }

    /**
     * Speichere Assessment via API (mit Fallback zu localStorage)
     */
    async saveAssessment(dimension, assessmentData) {
        const userId = await this.getUserId();
        const authToken = await this.getAuthToken();

        // Erstelle Request Body
        const requestBody = {
            dimension: dimension,
            aggregated: assessmentData.aggregated,
            criteria: assessmentData.details || assessmentData.criteria,
            criterionAverages: assessmentData.criterionAverages || [],
            userId: userId,
            timestamp: assessmentData.timestamp || new Date().toISOString()
        };

        // Versuche API-Call (mit Retry)
        let apiSuccess = false;
        const maxAttempts = 2;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (authToken) {
                    headers['Authorization'] = `Bearer ${authToken}`;
                }

                const response = await fetch(`${this.apiBaseUrl}/save`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestBody)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Assessment erfolgreich via API gespeichert:', result);
                    apiSuccess = true;
                    break;
                } else {
                    const errorText = await response.text();
                    console.warn(`⚠️ API-Call fehlgeschlagen (Versuch ${attempt}/${maxAttempts}):`, response.status, errorText);
                    if (attempt < maxAttempts) {
                        // Warte kurz vor Retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            } catch (error) {
                console.warn(`⚠️ API-Call Fehler (Versuch ${attempt}/${maxAttempts}):`, error);
                if (attempt < maxAttempts) {
                    // Warte kurz vor Retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        // Fallback: localStorage (immer speichern, auch wenn API erfolgreich war)
        try {
            const allAssessments = JSON.parse(localStorage.getItem('orgDevDetailAssessments') || '{}');
            allAssessments[dimension] = {
                aggregated: assessmentData.aggregated,
                details: assessmentData.details || assessmentData.criteria,
                criteria: assessmentData.criteria || assessmentData.details, // Legacy support
                criterionAverages: assessmentData.criterionAverages || [],
                timestamp: assessmentData.timestamp || new Date().toISOString()
            };
            localStorage.setItem('orgDevDetailAssessments', JSON.stringify(allAssessments));
            console.log('✅ Assessment in localStorage gespeichert (Fallback)');
        } catch (error) {
            console.error('❌ Fehler beim Speichern in localStorage:', error);
            throw error;
        }

        return {
            success: true,
            apiSuccess: apiSuccess,
            savedLocally: true
        };
    }

    /**
     * Lade Assessment via API (mit Fallback zu localStorage)
     */
    async loadAssessment(dimension) {
        const authToken = await this.getAuthToken();

        // Versuche API-Call
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${this.apiBaseUrl}/${dimension}`, {
                method: 'GET',
                headers: headers
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Assessment erfolgreich via API geladen:', result);
                return result;
            } else {
                console.warn('⚠️ API-Call fehlgeschlagen, verwende localStorage:', response.status);
            }
        } catch (error) {
            console.warn('⚠️ API-Call Fehler, verwende localStorage:', error);
        }

        // Fallback: localStorage
        try {
            const allAssessments = JSON.parse(localStorage.getItem('orgDevDetailAssessments') || '{}');
            if (allAssessments[dimension]) {
                console.log('✅ Assessment aus localStorage geladen');
                return allAssessments[dimension];
            }
        } catch (error) {
            console.error('❌ Fehler beim Laden aus localStorage:', error);
        }

        return null;
    }

    /**
     * Lade alle Assessments via API (mit Fallback zu localStorage)
     */
    async loadAllAssessments() {
        const authToken = await this.getAuthToken();

        // Versuche API-Call
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${this.apiBaseUrl}/all`, {
                method: 'GET',
                headers: headers
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Alle Assessments erfolgreich via API geladen');
                return result;
            } else {
                console.warn('⚠️ API-Call fehlgeschlagen, verwende localStorage:', response.status);
            }
        } catch (error) {
            console.warn('⚠️ API-Call Fehler, verwende localStorage:', error);
        }

        // Fallback: localStorage
        try {
            const allAssessments = JSON.parse(localStorage.getItem('orgDevDetailAssessments') || '{}');
            console.log('✅ Alle Assessments aus localStorage geladen');
            return allAssessments;
        } catch (error) {
            console.error('❌ Fehler beim Laden aus localStorage:', error);
            return {};
        }
    }
}

// Globale Instanz
window.OrgDevAPI = OrgDevAPI;
