/**
 * AWS API SETTINGS SERVICE
 * Verwaltet die sichere Speicherung von API-Keys in AWS DynamoDB
 * Die Keys werden mit dem User-Account verknüpft und sind nach dem Login verfügbar
 */

class AWSAPISettingsService {
    constructor() {
        this.apiEndpoint = this._getApiEndpoint();
        this.cachedSettings = null;
        this.cacheExpiry = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten Cache
    }

    /**
     * API Endpoint ermitteln
     */
    _getApiEndpoint() {
        // Prüfe verschiedene Konfigurationsquellen
        if (window.AWS_CONFIG?.apiBaseUrl) {
            return window.AWS_CONFIG.apiBaseUrl;
        }
        if (window.AWS_CONFIG?.apiEndpoint) {
            return window.AWS_CONFIG.apiEndpoint;
        }
        
        // Fallback auf bekannte Endpoints
        return 'https://of2iwj7h2c.execute-api.eu-central-1.amazonaws.com/prod';
    }

    /**
     * Prüft ob der User eingeloggt ist
     */
    isUserLoggedIn() {
        return window.awsAuth && window.awsAuth.isLoggedIn();
    }

    /**
     * Holt das Auth Token für API Requests
     */
    async getAuthToken() {
        if (!this.isUserLoggedIn()) {
            throw new Error('Nicht angemeldet');
        }
        
        // Token direkt aus currentUser holen
        const currentUser = window.awsAuth.getCurrentUser();
        if (currentUser?.idToken) {
            return currentUser.idToken;
        }
        
        // Fallback: aus localStorage
        const storageKey = window.AWS_AUTH_CONFIG?.token?.storageKey || 'aws_auth_session';
        const session = localStorage.getItem(storageKey);
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed.idToken) {
                    return parsed.idToken;
                }
            } catch (e) {
                console.error('❌ Fehler beim Parsen der Session:', e);
            }
        }
        
        throw new Error('Kein gültiges Token gefunden');
    }

    /**
     * API-Einstellungen aus AWS laden
     */
    async getSettings(forceRefresh = false) {
        // Cache prüfen
        if (!forceRefresh && this.cachedSettings && this.cacheExpiry > Date.now()) {
            console.log('📦 API Settings aus Cache geladen');
            return this.cachedSettings;
        }

        if (!this.isUserLoggedIn()) {
            console.log('⚠️ User nicht eingeloggt - keine AWS API Settings verfügbar');
            return null;
        }

        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.apiEndpoint}/api-settings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Fehler beim Laden der Einstellungen');
            }

            const data = await response.json();
            
            // Cache aktualisieren
            this.cachedSettings = data;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;
            
            console.log('✅ API Settings aus AWS geladen:', data.hasSettings ? 'Vorhanden' : 'Nicht konfiguriert');
            return data;
        } catch (error) {
            console.error('❌ Fehler beim Laden der API Settings:', error);
            return null;
        }
    }

    /**
     * API-Einstellungen in AWS speichern
     */
    async saveSettings(settings) {
        if (!this.isUserLoggedIn()) {
            throw new Error('Bitte melden Sie sich an, um API-Einstellungen zu speichern');
        }

        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.apiEndpoint}/api-settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Fehler beim Speichern');
            }

            const data = await response.json();
            
            // Cache invalidieren
            this.cachedSettings = null;
            this.cacheExpiry = null;
            
            console.log('✅ API Settings in AWS gespeichert');
            return data;
        } catch (error) {
            console.error('❌ Fehler beim Speichern der API Settings:', error);
            throw error;
        }
    }

    /**
     * API-Einstellungen löschen
     */
    async deleteSettings() {
        if (!this.isUserLoggedIn()) {
            throw new Error('Nicht angemeldet');
        }

        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.apiEndpoint}/api-settings`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Fehler beim Löschen');
            }

            // Cache invalidieren
            this.cachedSettings = null;
            this.cacheExpiry = null;
            
            console.log('✅ API Settings aus AWS gelöscht');
            return await response.json();
        } catch (error) {
            console.error('❌ Fehler beim Löschen der API Settings:', error);
            throw error;
        }
    }

    /**
     * Prüft ob API-Key für einen Provider konfiguriert ist
     */
    async hasProvider(provider = 'openai') {
        const settings = await this.getSettings();
        return settings?.hasSettings && settings.settings?.[provider]?.configured;
    }

    /**
     * OpenAI API-Key speichern (Convenience-Methode)
     */
    async saveOpenAIKey(apiKey, options = {}) {
        return await this.saveSettings({
            openai: {
                apiKey,
                model: options.model || 'gpt-4o-mini',
                maxTokens: options.maxTokens || 1000,
                temperature: options.temperature ?? 0.7
            },
            preferredProvider: 'openai'
        });
    }

    /**
     * Anthropic API-Key speichern (Convenience-Methode)
     */
    async saveAnthropicKey(apiKey, options = {}) {
        return await this.saveSettings({
            anthropic: {
                apiKey,
                model: options.model || 'claude-3-sonnet-20240229',
                maxTokens: options.maxTokens || 1000,
                temperature: options.temperature ?? 0.7
            },
            preferredProvider: 'anthropic'
        });
    }

    /**
     * Google API-Key speichern (Convenience-Methode)
     */
    async saveGoogleKey(apiKey, options = {}) {
        return await this.saveSettings({
            google: {
                apiKey,
                model: options.model || 'gemini-pro',
                maxTokens: options.maxTokens || 1000,
                temperature: options.temperature ?? 0.7
            },
            preferredProvider: 'google'
        });
    }

    /**
     * API-Key Test - ruft die Test-Funktion im Backend auf
     */
    async testApiKey(provider = 'openai') {
        if (!this.isUserLoggedIn()) {
            throw new Error('Nicht angemeldet');
        }

        try {
            const token = await this.getAuthToken();
            
            const response = await fetch(`${this.apiEndpoint}/api-settings/test`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ provider })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Test fehlgeschlagen');
            }

            return await response.json();
        } catch (error) {
            console.error('❌ API Key Test fehlgeschlagen:', error);
            throw error;
        }
    }

    /**
     * Synchronisiert lokale Settings mit AWS (für Migration)
     */
    async syncLocalToAWS() {
        if (!this.isUserLoggedIn()) {
            console.log('⚠️ Sync nicht möglich - nicht angemeldet');
            return false;
        }

        try {
            // Prüfe ob bereits AWS Settings existieren
            const awsSettings = await this.getSettings(true);
            if (awsSettings?.hasSettings) {
                console.log('ℹ️ AWS Settings bereits vorhanden - kein Sync nötig');
                return true;
            }

            // Lade lokale Settings
            const localSettings = this._getLocalSettings();
            if (!localSettings) {
                console.log('ℹ️ Keine lokalen Settings zum Synchronisieren');
                return true;
            }

            // Speichere in AWS
            await this.saveSettings(localSettings);
            console.log('✅ Lokale Settings nach AWS synchronisiert');

            // Optional: Lokale Settings löschen nach erfolgreicher Migration
            // this._clearLocalSettings();
            
            return true;
        } catch (error) {
            console.error('❌ Sync fehlgeschlagen:', error);
            return false;
        }
    }

    /**
     * Holt lokale Settings aus localStorage
     */
    _getLocalSettings() {
        const settings = {};
        
        // Prüfe verschiedene localStorage Keys
        const openaiKey = localStorage.getItem('openai_api_key');
        const kiSettings = JSON.parse(localStorage.getItem('ki_settings') || '{}');
        const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');

        // OpenAI
        if (openaiKey || kiSettings.apiKey || globalKeys.openai?.key) {
            settings.openai = {
                apiKey: openaiKey || kiSettings.apiKey || globalKeys.openai?.key,
                model: kiSettings.model || globalKeys.openai?.model || 'gpt-4o-mini',
                maxTokens: kiSettings.maxTokens || globalKeys.openai?.maxTokens || 1000,
                temperature: kiSettings.temperature ?? globalKeys.openai?.temperature ?? 0.7
            };
        }

        // Anthropic
        if (globalKeys.anthropic?.key) {
            settings.anthropic = {
                apiKey: globalKeys.anthropic.key,
                model: globalKeys.anthropic.model || 'claude-3-sonnet-20240229',
                maxTokens: globalKeys.anthropic.maxTokens || 1000,
                temperature: globalKeys.anthropic.temperature ?? 0.7
            };
        }

        // Google
        if (globalKeys.google?.key) {
            settings.google = {
                apiKey: globalKeys.google.key,
                model: globalKeys.google.model || 'gemini-pro',
                maxTokens: globalKeys.google.maxTokens || 1000,
                temperature: globalKeys.google.temperature ?? 0.7
            };
        }

        if (Object.keys(settings).length === 0) {
            return null;
        }

        settings.preferredProvider = 'openai';
        return settings;
    }

    /**
     * Löscht lokale Settings nach erfolgreicher Migration
     */
    _clearLocalSettings() {
        localStorage.removeItem('openai_api_key');
        localStorage.removeItem('ki_settings');
        // global_api_keys lassen wir als Fallback
    }
}

// Globale Instanz erstellen
window.awsAPISettings = new AWSAPISettingsService();

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AWSAPISettingsService;
}
