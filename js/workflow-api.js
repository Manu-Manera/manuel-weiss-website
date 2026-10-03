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
        // Verwende zentrale API-Konfiguration
        if (window.getApiUrl) {
            this.apiBaseUrl = window.getApiUrl('USER_DATA');
        } else if (window.AWS_APP_CONFIG?.API_BASE) {
            // Fallback auf AWS API Base
            this.apiBaseUrl = `${window.AWS_APP_CONFIG.API_BASE}/user-data`;
        } else {
            this.apiBaseUrl = (window.AWS_APP_CONFIG?.API_BASE ? window.AWS_APP_CONFIG.API_BASE + '/user-data' : '');
        }
    }

    /**
     * Initialisierung - Warte auf Auth
     */
    async init() {
        // userId wird bei jedem Request frisch aus der Session gelesen – kein Polling nötig.
        const u = this._currentUser();
        if (u && u.id) { this.userId = u.id; this.isInitialized = true; }
    }

    _currentUser() {
        try {
            if (window.awsAuth && window.awsAuth.isLoggedIn && window.awsAuth.isLoggedIn()) return window.awsAuth.getCurrentUser();
            if (window.realUserAuth && window.realUserAuth.isLoggedIn && window.realUserAuth.isLoggedIn()) return window.realUserAuth.getCurrentUser();
        } catch (e) {}
        return null;
    }

    /**
     * Hole Auth-Token für API-Calls.
     * Akzeptiert sowohl eine aktive Auth-Instanz als auch eine gültige, noch nicht
     * abgelaufene Session im localStorage (die Auth-Systeme initialisieren asynchron).
     */
    async getAuthToken() {
        const sessionStr = localStorage.getItem('aws_auth_session');
        if (!sessionStr) throw new Error('User not authenticated');
        let session;
        try { session = JSON.parse(sessionStr); } catch (e) { throw new Error('Invalid session'); }
        if (!session.idToken) throw new Error('No valid session found');

        const authSaysYes = !!this._currentUser();
        if (!authSaysYes) {
            // Auth-System evtl. noch nicht fertig: Token selbst auf Ablauf prüfen
            let exp = session.expiresAt ? new Date(session.expiresAt).getTime() : 0;
            if (!exp) { try { exp = JSON.parse(atob(session.idToken.split('.')[1])).exp * 1000; } catch (e) {} }
            if (!exp || exp <= Date.now() + 10000) throw new Error('Session expired');
        }
        if (session.id) this.userId = session.id;
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
            this.lastRequestSource = 'local';
            this.lastError = null;
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
                let detail = '';
                try { detail = (await response.json()).message || ''; } catch (e) {}
                throw new Error(`API Error: ${response.status}${detail ? ' – ' + detail : ''}`);
            }

            this.lastRequestSource = 'api';
            this.lastError = null;
            return await response.json();
        } catch (error) {
            console.error('❌ API Request failed:', error);
            // Fallback zu localStorage – Aufrufer können über lastRequestSource/lastError erkennen,
            // dass NICHT in der Cloud gespeichert wurde.
            this.lastRequestSource = 'local';
            this.lastError = error;
            return this.localStorageFallback(endpoint, method, body);
        }
    }

    /** true, wenn der letzte Request wirklich die API erreicht hat */
    lastWasCloud() { return this.lastRequestSource === 'api'; }

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
     * POST /workflows/{methodId}/steps/{stepId}
     */
    async saveWorkflowStep(methodId, stepId, stepData) {
        const endpoint = `/workflows/${methodId}/steps/${stepId}`;
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
     * GET /workflows/{methodId}/steps/{stepId}
     */
    async loadWorkflowStep(methodId, stepId) {
        const endpoint = `/workflows/${methodId}/steps/${stepId}`;
        return await this.apiRequest(endpoint, 'GET');
    }

    /**
     * Lade alle Schritte eines Workflows
     * GET /workflows/{methodId}/steps
     */
    async loadWorkflowSteps(methodId) {
        const endpoint = `/workflows/${methodId}/steps`;
        return await this.apiRequest(endpoint, 'GET');
    }

    /**
     * Update Workflow Progress
     * PUT /workflows/{methodId}/progress
     */
    async updateWorkflowProgress(methodId, currentStep, totalSteps = null) {
        const endpoint = `/workflows/${methodId}/progress`;
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
     * GET /workflows/{methodId}/progress
     */
    async getWorkflowProgress(methodId) {
        const endpoint = `/workflows/${methodId}/progress`;
        return await this.apiRequest(endpoint, 'GET');
    }

    /**
     * Speichere Workflow-Ergebnisse
     * POST /workflows/{methodId}/results
     */
    async saveWorkflowResults(methodId, results) {
        const endpoint = `/workflows/${methodId}/results`;
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
     * GET /workflows/{methodId}/results
     */
    async getWorkflowResults(methodId) {
        const endpoint = `/workflows/${methodId}/results`;
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
