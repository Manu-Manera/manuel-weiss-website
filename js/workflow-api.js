/**
 * Workflow API - Zentrale API-First Architektur für alle Workflows
 * Jede Eingabe wird über API gespeichert und geladen
 */

class WorkflowAPI {
    constructor() {
        // Wait for AWS_CONFIG to be available
        this.apiBaseUrl = null;
        this.isInitialized = false;
        this.userId = null;
        this.initApiBaseUrl();
    }

    initApiBaseUrl() {
        if (window.AWS_CONFIG && window.AWS_CONFIG.apiBaseUrl) {
            this.apiBaseUrl = window.AWS_CONFIG.apiBaseUrl;
        } else {
            // Default API base URL
            this.apiBaseUrl = 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
        }
    }

    /**
     * Initialisierung - Warte auf Auth
     */
    async init() {
        if (this.isInitialized) return;
        
        // Warte auf Auth-System
        if (window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) {
            this.userId = window.realUserAuth.getCurrentUser()?.id;
            this.isInitialized = true;
            console.log('✅ Workflow API initialized for user:', this.userId);
        } else {
            // Retry nach kurzer Zeit
            setTimeout(() => this.init(), 500);
        }
    }

    /**
     * Hole Auth-Token für API-Calls
     */
    async getAuthToken() {
        if (!window.realUserAuth || !window.realUserAuth.isLoggedIn || !window.realUserAuth.isLoggedIn()) {
            throw new Error('User not authenticated');
        }

        const sessionStr = localStorage.getItem('aws_auth_session');
        if (!sessionStr) {
            throw new Error('No valid session found');
        }

        const session = JSON.parse(sessionStr);
        return session.idToken;
    }

    /**
     * API Request Helper
     */
    async apiRequest(endpoint, method = 'GET', body = null) {
        await this.init();
        
        // Ensure apiBaseUrl is set
        if (!this.apiBaseUrl) {
            this.initApiBaseUrl();
        }
        
        const url = `${this.apiBaseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json'
        };

        // Füge Auth-Token hinzu wenn verfügbar
        try {
            const token = await this.getAuthToken();
            headers['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            // User nicht angemeldet - speichere lokal als Fallback
            console.warn('⚠️ User not authenticated, using local storage fallback');
            return this.localStorageFallback(endpoint, method, body);
        }

        const options = {
            method,
            headers
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ API Request failed:', error);
            // Fallback zu localStorage
            return this.localStorageFallback(endpoint, method, body);
        }
    }

    /**
     * LocalStorage Fallback für nicht-angemeldete User
     */
    localStorageFallback(endpoint, method, body) {
        const key = `workflow_${endpoint.replace(/\//g, '_')}`;
        
        if (method === 'GET') {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } else if (method === 'POST' || method === 'PUT') {
            localStorage.setItem(key, JSON.stringify(body));
            return body;
        }
        
        return null;
    }

    /**
     * Speichere Workflow-Schritt
     * POST /api/v1/workflows/{methodId}/steps/{stepId}
     */
    async saveWorkflowStep(methodId, stepId, stepData) {
        const endpoint = `/api/v1/workflows/${methodId}/steps/${stepId}`;
        const data = {
            methodId,
            stepId,
            stepData,
            timestamp: new Date().toISOString(),
            userId: this.userId
        };

        const result = await this.apiRequest(endpoint, 'POST', data);
        
        // Update auch Progress
        await this.updateWorkflowProgress(methodId, stepId);
        
        return result;
    }

    /**
     * Lade Workflow-Schritt
     * GET /api/v1/workflows/{methodId}/steps/{stepId}
     */
    async loadWorkflowStep(methodId, stepId) {
        const endpoint = `/api/v1/workflows/${methodId}/steps/${stepId}`;
        return await this.apiRequest(endpoint, 'GET');
    }

    /**
     * Lade alle Schritte eines Workflows
     * GET /api/v1/workflows/{methodId}/steps
     */
    async loadWorkflowSteps(methodId) {
        const endpoint = `/api/v1/workflows/${methodId}/steps`;
        return await this.apiRequest(endpoint, 'GET');
    }

    /**
     * Update Workflow Progress
     * PUT /api/v1/workflows/{methodId}/progress
     */
    async updateWorkflowProgress(methodId, currentStep, totalSteps = null) {
        const endpoint = `/api/v1/workflows/${methodId}/progress`;
        const progressData = {
            methodId,
            currentStep,
            totalSteps,
            completionPercentage: totalSteps ? Math.round((currentStep / totalSteps) * 100) : 0,
            lastUpdated: new Date().toISOString(),
            status: currentStep === totalSteps ? 'completed' : 'in-progress'
        };

        return await this.apiRequest(endpoint, 'PUT', progressData);
    }

    /**
     * Lade Workflow Progress
     * GET /api/v1/workflows/{methodId}/progress
     */
    async getWorkflowProgress(methodId) {
        const endpoint = `/api/v1/workflows/${methodId}/progress`;
        return await this.apiRequest(endpoint, 'GET');
    }

    /**
     * Speichere Workflow-Ergebnisse
     * POST /api/v1/workflows/{methodId}/results
     */
    async saveWorkflowResults(methodId, results) {
        const endpoint = `/api/v1/workflows/${methodId}/results`;
        const data = {
            methodId,
            results,
            completedAt: new Date().toISOString(),
            userId: this.userId
        };

        return await this.apiRequest(endpoint, 'POST', data);
    }

    /**
     * Lade Workflow-Ergebnisse
     * GET /api/v1/workflows/{methodId}/results
     */
    async getWorkflowResults(methodId) {
        const endpoint = `/api/v1/workflows/${methodId}/results`;
        return await this.apiRequest(endpoint, 'GET');
    }

    /**
     * Auto-Save Helper - speichert automatisch bei Änderungen
     */
    async autoSave(methodId, stepId, formData) {
        try {
            await this.saveWorkflowStep(methodId, stepId, formData);
            console.log(`💾 Auto-saved: ${methodId} step ${stepId}`);
        } catch (error) {
            console.error('❌ Auto-save failed:', error);
        }
    }

    /**
     * Lade gespeicherten Fortschritt beim Laden der Seite
     */
    async loadSavedProgress(methodId, stepId) {
        try {
            const stepData = await this.loadWorkflowStep(methodId, stepId);
            if (stepData && stepData.stepData) {
                return stepData.stepData;
            }
        } catch (error) {
            console.warn('⚠️ Could not load saved progress:', error);
        }
        return null;
    }
}

// Globale Instanz
window.workflowAPI = new WorkflowAPI();

// Auto-Init beim Laden
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.workflowAPI.init());
} else {
    window.workflowAPI.init();
}
