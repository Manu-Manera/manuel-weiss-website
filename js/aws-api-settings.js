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
     * Nutzt zentrale API-Konfiguration für einfache Umschaltung
     */
    _getApiEndpoint() {
        // Verwende zentrale API-Konfiguration
        if (window.getApiUrl) {
            const apiSettingsUrl = window.getApiUrl('API_SETTINGS');
            if (apiSettingsUrl && typeof apiSettingsUrl === 'string') {
                return apiSettingsUrl.replace(/\/api-settings$/, '');
            }
        }
        return (window.AWS_APP_CONFIG && window.AWS_APP_CONFIG.API_BASE) ? window.AWS_APP_CONFIG.API_BASE : null;
    }

    /**
     * Prüft ob der User eingeloggt ist (entweder via awsAuth oder Admin Auth)
     */
    isUserLoggedIn() {
        // Prüfe awsAuth
        if (window.awsAuth && window.awsAuth.isLoggedIn()) {
            return true;
        }
        
        // Prüfe Admin Auth Session
        const adminSession = localStorage.getItem('admin_auth_session');
        if (adminSession) {
            try {
                const session = JSON.parse(adminSession);
                if (session.user?.accessToken || session.user?.idToken) {
                    return true;
                }
            } catch (e) {}
        }
        
        return false;
    }

    /**
     * Holt das Auth Token für API Requests
     */
    async getAuthToken() {
        // 1. Versuche awsAuth
        if (window.awsAuth && window.awsAuth.isLoggedIn()) {
            const currentUser = window.awsAuth.getCurrentUser();
            if (currentUser?.idToken) {
                return currentUser.idToken;
            }
        }
        
        // 2. Versuche Admin Auth Session
        const adminSession = localStorage.getItem('admin_auth_session');
        if (adminSession) {
            try {
                const session = JSON.parse(adminSession);
                // Admin Session hat das Token in session.user.idToken oder session.user.accessToken
                if (session.user?.idToken) {
                    return session.user.idToken;
                }
                if (session.user?.accessToken) {
                    return session.user.accessToken;
                }
            } catch (e) {
                console.error('❌ Fehler beim Parsen der Admin Session:', e);
            }
        }
        
        // 3. Fallback: aws_auth_session
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
     * Vollständigen (unverschlüsselten) API Key für einen Provider holen
     * ACHTUNG: Nur für Server-seitige Operationen verwenden!
     * @param {string} provider - Der Provider (openai, anthropic, google)
     * @param {boolean} useGlobal - Wenn true, versuche globale Keys ohne Login (nur für AWS API)
     */
    async getFullApiKey(provider, useGlobal = false) {
        // Für globale Keys ist kein Login erforderlich
        if (!useGlobal && !this.isUserLoggedIn()) {
            console.log('⚠️ User nicht eingeloggt - versuche globale Keys...');
            // Versuche globale Keys als Fallback
            return await this.getFullApiKey(provider, true);
        }

        try {
            let headers = {
                'Content-Type': 'application/json'
            };
            
            // Nur Auth-Header hinzufügen, wenn nicht global und eingeloggt
            if (!useGlobal && this.isUserLoggedIn()) {
                const token = await this.getAuthToken();
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            // AWS API Gateway: /api-settings/key?provider=openai&global=true
            // Legacy: /api-settings?action=key&provider=openai
            // Prüfe ob AWS API Gateway verwendet wird
            const apiSettingsUrl = window.getApiUrl ? window.getApiUrl('API_SETTINGS') : null;
            const base = apiSettingsUrl || (this.apiEndpoint ? this.apiEndpoint + '/api-settings' : null);
            if (!base) {
                throw new Error('API-URL nicht konfiguriert (getApiUrl oder AWS_APP_CONFIG.API_BASE)');
            }
            const url = `${base}?action=key&provider=${provider}${useGlobal ? '&global=true' : ''}`;
            
            console.log(`🔍 Lade vollständigen API Key von: ${url}`, { provider, useGlobal });
            
            let response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            console.log(`📡 Response Status: ${response.status}`, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                let error;
                try {
                    error = JSON.parse(errorText);
                } catch (e) {
                    error = { error: errorText || 'Unbekannter Fehler' };
                }
                console.error('❌ API Key Request fehlgeschlagen:', error);
                throw new Error(error.error || error.message || 'Fehler beim Laden des API Keys');
            }

            let data = await response.json();
            console.log(`✅ Response für ${provider} geladen${useGlobal ? ' (global)' : ''}`, {
                hasApiKey: !!data.apiKey,
                hasSettings: !!data.settings,
                keys: Object.keys(data)
            });
            
            // WORKAROUND: Wenn wir das falsche Format bekommen ({hasSettings: true, settings: {...}}),
            // bedeutet das, dass die falsche Route aufgerufen wurde. Versuche die /key Route explizit.
            if (data.hasSettings && data.settings && !data.apiKey) {
                console.warn('⚠️ Falsche Route erkannt - bekomme Settings-Format statt Key-Format');
                console.warn('⚠️ Das bedeutet, dass /api-settings/key nicht richtig erkannt wurde');
                console.warn('⚠️ Versuche alternative URL-Formate...');
                
                // Versuche verschiedene URL-Formate
                const baseUrl = apiSettingsUrl.replace(/\/api-settings$/, '');
                const alternativeUrls = [
                    // Format 1: Direkt /key
                    `${baseUrl}/api-settings/key?provider=${provider}${useGlobal ? '&global=true' : ''}`,
                    // Format 2: Mit trailing slash
                    `${baseUrl}/api-settings/key/?provider=${provider}${useGlobal ? '&global=true' : ''}`,
                    // Format 3: Legacy
                    `${this.apiEndpoint}/api-settings?action=key&provider=${provider}${useGlobal ? '&global=true' : ''}`
                ];
                
                for (const altUrl of alternativeUrls) {
                    try {
                        console.log(`🔄 Versuche alternative URL: ${altUrl}`);
                        const altResponse = await fetch(altUrl, {
                            method: 'GET',
                            headers: headers
                        });
                        
                        if (altResponse.ok) {
                            const altData = await altResponse.json();
                            if (altData.apiKey && typeof altData.apiKey === 'string' && altData.apiKey.startsWith('sk-')) {
                                console.log(`✅ Vollständiger API Key von alternativer Route geladen`);
                                data = altData;
                                break;
                            }
                        }
                    } catch (altError) {
                        console.warn(`⚠️ Alternative URL fehlgeschlagen: ${altUrl}`, altError);
                    }
                }
            }
            
            // Extrahiere den Key-String aus dem Response-Objekt
            // PRIORITÄT 1: Direkter apiKey im Response (Standard-Format von getFullApiKey)
            if (data.apiKey && typeof data.apiKey === 'string' && data.apiKey.startsWith('sk-') && data.apiKey.length > 20 && !data.apiKey.includes('...')) {
                console.log(`✅ API Key extrahiert (direkt): ${data.apiKey.substring(0, 10)}...`);
                return data.apiKey;
            }
            
            // PRIORITÄT 2: data.settings[provider].apiKey (falls Settings-Objekt zurückgegeben wurde)
            // WICHTIG: Dieses Format kommt von getApiSettings, nicht von getFullApiKey
            // Die Keys sind hier maskiert, also können wir sie nicht verwenden
            if (data.settings && data.settings[provider]) {
                const providerData = data.settings[provider];
                // Prüfe ob apiKey vorhanden ist
                if (providerData && providerData.apiKey) {
                    // Wenn der Key maskiert ist (enthält '...'), können wir ihn nicht verwenden
                    if (typeof providerData.apiKey === 'string' && providerData.apiKey.includes('...')) {
                        console.warn('⚠️ Key ist maskiert, kann nicht verwendet werden');
                        return null; // Wird im catch-Block behandelt
                    }
                    // Falls der Key nicht maskiert ist, verwende ihn
                    if (typeof providerData.apiKey === 'string' && providerData.apiKey.startsWith('sk-') && providerData.apiKey.length > 20 && !providerData.apiKey.includes('...')) {
                        console.log(`✅ API Key extrahiert (settings): ${providerData.apiKey.substring(0, 10)}...`);
                        return providerData.apiKey;
                    }
                }
            }
            
            // PRIORITÄT 3: data.key
            if (data.key && typeof data.key === 'string' && data.key.startsWith('sk-') && data.key.length > 20) {
                console.log(`✅ API Key extrahiert (key): ${data.key.substring(0, 10)}...`);
                return data.key;
            }
            
            // PRIORITÄT 4: data[provider] (z.B. data.openai)
            if (data[provider] && typeof data[provider] === 'string' && data[provider].startsWith('sk-') && data[provider].length > 20) {
                console.log(`✅ API Key extrahiert (provider): ${data[provider].substring(0, 10)}...`);
                return data[provider];
            }
            
            // PRIORITÄT 5: data[provider].apiKey (z.B. data.openai.apiKey)
            if (data[provider] && data[provider].apiKey && typeof data[provider].apiKey === 'string' && data[provider].apiKey.startsWith('sk-') && data[provider].apiKey.length > 20) {
                console.log(`✅ API Key extrahiert (provider.apiKey): ${data[provider].apiKey.substring(0, 10)}...`);
                return data[provider].apiKey;
            }
            
            // PRIORITÄT 6: Falls data selbst ein String ist (direkter Key)
            if (typeof data === 'string' && data.startsWith('sk-') && data.length > 20) {
                console.log(`✅ API Key extrahiert (string): ${data.substring(0, 10)}...`);
                return data;
            }
            
            console.warn('⚠️ API Key Format unerwartet:', data);
            console.warn('⚠️ Verfügbare Felder:', Object.keys(data));
            if (data.settings) {
                console.warn('⚠️ Settings-Felder:', Object.keys(data.settings));
                if (data.settings[provider]) {
                    console.warn(`⚠️ ${provider} Felder:`, Object.keys(data.settings[provider]));
                }
            }
            return null;
        } catch (error) {
            console.error(`❌ Fehler beim Laden des vollständigen API Keys für ${provider}:`, error);
            // Wenn nicht global versucht wurde, versuche es nochmal mit global
            if (!useGlobal) {
                console.log('🔄 Versuche globale Keys als Fallback...');
                return await this.getFullApiKey(provider, true);
            }
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
                model: options.model || 'gpt-5.2',
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
                model: kiSettings.model || globalKeys.openai?.model || 'gpt-5.2',
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
