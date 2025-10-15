// OpenAI API Key Manager - Globaler Zugriff
// Speichert und verwaltet den OpenAI API Key zentral

class OpenAIKeyManager {
    constructor() {
        this.API_KEY_STORAGE = 'openai_api_key';
        this.API_STATUS_STORAGE = 'openai_api_status';
        this.lastTestTime = null;
        this.testCache = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 Minuten Cache
    }

    // API Key speichern
    saveAPIKey(apiKey) {
        if (!apiKey || !apiKey.startsWith('sk-')) {
            throw new Error('Ungültiger API Key Format');
        }
        
        localStorage.setItem(this.API_KEY_STORAGE, apiKey);
        localStorage.removeItem(this.API_STATUS_STORAGE); // Status zurücksetzen
        this.lastTestTime = null;
        this.testCache = null;
        
        console.log('✅ OpenAI API Key gespeichert');
        return true;
    }

    // API Key abrufen
    getAPIKey() {
        const apiKey = localStorage.getItem(this.API_KEY_STORAGE);
        if (!apiKey) {
            throw new Error('OpenAI API Key nicht gefunden. Bitte im Admin-Panel konfigurieren.');
        }
        return apiKey;
    }

    // API Key testen
    async testAPIKey(apiKey = null) {
        const keyToTest = apiKey || this.getAPIKey();
        
        // Cache prüfen
        if (this.testCache && this.lastTestTime && 
            (Date.now() - this.lastTestTime) < this.cacheTimeout) {
            return this.testCache;
        }

        try {
            console.log('🧪 Teste OpenAI API Key...');
            
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${keyToTest}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const result = {
                    success: true,
                    message: 'OpenAI API Verbindung erfolgreich!',
                    data: data,
                    timestamp: new Date().toISOString()
                };
                
                // Cache speichern
                this.testCache = result;
                this.lastTestTime = Date.now();
                localStorage.setItem(this.API_STATUS_STORAGE, JSON.stringify(result));
                
                console.log('✅ OpenAI API Test erfolgreich');
                return result;
            } else {
                const errorData = await response.json();
                const result = {
                    success: false,
                    error: errorData.error?.message || `HTTP ${response.status}`,
                    status: response.status,
                    timestamp: new Date().toISOString()
                };
                
                console.error('❌ OpenAI API Test fehlgeschlagen:', result);
                return result;
            }
        } catch (error) {
            const result = {
                success: false,
                error: `Netzwerkfehler: ${error.message}`,
                timestamp: new Date().toISOString()
            };
            
            console.error('❌ OpenAI API Test Error:', error);
            return result;
        }
    }

    // API Key Status abrufen
    getAPIKeyStatus() {
        const status = localStorage.getItem(this.API_STATUS_STORAGE);
        if (status) {
            return JSON.parse(status);
        }
        return null;
    }

    // API Key löschen
    clearAPIKey() {
        localStorage.removeItem(this.API_KEY_STORAGE);
        localStorage.removeItem(this.API_STATUS_STORAGE);
        this.lastTestTime = null;
        this.testCache = null;
        console.log('🗑️ OpenAI API Key gelöscht');
    }

    // API Key für OpenAI Calls abrufen (mit automatischem Test)
    async getValidatedAPIKey() {
        const apiKey = this.getAPIKey();
        
        // Teste API Key wenn nötig
        const status = this.getAPIKeyStatus();
        if (!status || !status.success) {
            console.log('🔄 API Key Status unbekannt, teste...');
            const testResult = await this.testAPIKey(apiKey);
            if (!testResult.success) {
                throw new Error(`API Key ungültig: ${testResult.error}`);
            }
        }
        
        return apiKey;
    }

    // OpenAI Chat Completions Call
    async chatCompletions(messages, options = {}) {
        const apiKey = await this.getValidatedAPIKey();
        
        const defaultOptions = {
            model: 'gpt-4',
            max_tokens: 1000,
            temperature: 0.3
        };
        
        const requestOptions = { ...defaultOptions, ...options, messages };
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestOptions)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API Fehler: ${errorData.error?.message || response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('OpenAI Chat Completions Error:', error);
            throw error;
        }
    }
}

// Globale Instanz erstellen
window.OpenAIKeyManager = new OpenAIKeyManager();

// Convenience Functions für einfachen Zugriff
window.getOpenAIKey = () => window.OpenAIKeyManager.getAPIKey();
window.testOpenAIKey = (apiKey) => window.OpenAIKeyManager.testAPIKey(apiKey);
window.saveOpenAIKey = (apiKey) => window.OpenAIKeyManager.saveAPIKey(apiKey);
window.clearOpenAIKey = () => window.OpenAIKeyManager.clearAPIKey();
window.openAIChat = (messages, options) => window.OpenAIKeyManager.chatCompletions(messages, options);

console.log('🔑 OpenAI Key Manager geladen');
