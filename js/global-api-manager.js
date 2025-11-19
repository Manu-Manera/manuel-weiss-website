/**
 * GLOBALE API KEY VERWALTUNG
 * Zentrale Verwaltung von API Keys für alle Website-Seiten
 */

class GlobalAPIManager {
    constructor() {
        this.storageKey = 'global_api_keys';
        this.defaultKeys = {
            openai: {
                name: 'OpenAI',
                description: 'KI-Analyse und Text-Generierung',
                key: '',
                model: 'gpt-4o-mini',
                maxTokens: 1000,
                temperature: 0.3,
                enabled: false
            },
            anthropic: {
                name: 'Anthropic Claude',
                description: 'Alternative KI für Analyse',
                key: '',
                model: 'claude-3-sonnet-20240229',
                maxTokens: 1000,
                temperature: 0.3,
                enabled: false
            },
            google: {
                name: 'Google AI',
                description: 'Google Gemini für KI-Services',
                key: '',
                model: 'gemini-pro',
                maxTokens: 1000,
                temperature: 0.3,
                enabled: false
            }
        };
        
        this.loadKeys();
    }
    
    /**
     * Lade gespeicherte API Keys
     */
    loadKeys() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.keys = JSON.parse(stored);
            } else {
                this.keys = { ...this.defaultKeys };
            }
        } catch (error) {
            console.error('Fehler beim Laden der API Keys:', error);
            this.keys = { ...this.defaultKeys };
        }
        
        this.normalizeKeys();
        this.saveKeys();
    }

    normalizeKeys() {
        this.keys = this.keys || {};
        Object.keys(this.defaultKeys).forEach(service => {
            const defaultConfig = this.defaultKeys[service];
            const storedConfig = this.keys[service];
            
            if (!storedConfig) {
                this.keys[service] = { ...defaultConfig };
                return;
            }
            
            this.keys[service] = {
                ...defaultConfig,
                ...storedConfig
            };
            
            this.keys[service].enabled = !!this.keys[service].key;
        });
    }
    
    /**
     * Speichere API Keys
     */
    saveKeys() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.keys));
            return true;
        } catch (error) {
            console.error('Fehler beim Speichern der API Keys:', error);
            return false;
        }
    }
    
    /**
     * Setze API Key für einen Service
     */
    setAPIKey(service, key, options = {}) {
        if (!this.keys[service]) {
            this.keys[service] = { ...(this.defaultKeys[service] || {}) };
        } else {
            this.keys[service] = {
                ...(this.defaultKeys[service] || {}),
                ...this.keys[service]
            };
        }
        
        this.keys[service].key = key;
        this.keys[service].enabled = key.length > 0;
        
        // Aktualisiere zusätzliche Optionen
        if (options.model) this.keys[service].model = options.model;
        if (options.maxTokens) this.keys[service].maxTokens = options.maxTokens;
        if (options.temperature !== undefined) this.keys[service].temperature = options.temperature;
        
        return this.saveKeys();
    }
    
    /**
     * Hole API Key für einen Service
     */
    getAPIKey(service) {
        const config = this.keys[service];
        return (config && config.key) || '';
    }
    
    /**
     * Hole alle Konfigurationen für einen Service
     */
    getServiceConfig(service) {
        return this.keys[service] || null;
    }
    
    /**
     * Prüfe ob ein Service aktiviert ist
     */
    isServiceEnabled(service) {
        const config = this.keys[service];
        return !!(config && config.enabled);
    }
    
    /**
     * Teste API Key für einen Service
     */
    async testAPIKey(service) {
        const config = this.getServiceConfig(service);
        if (!config || !config.key) {
            throw new Error(`Kein API Key für ${service} konfiguriert`);
        }
        
        switch (service) {
            case 'openai':
                return await this.testOpenAI(config);
            case 'anthropic':
                return await this.testAnthropic(config);
            case 'google':
                return await this.testGoogle(config);
            default:
                throw new Error(`Unbekannter Service: ${service}`);
        }
    }
    
    /**
     * Teste OpenAI API
     */
    async testOpenAI(config) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.key}`
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: 'Test' }],
                    max_tokens: 5
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const error = await response.json();
                const errMsg = error && error.error && error.error.message ? error.error.message : 'API Fehler';
                return { success: false, error: errMsg };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Teste Anthropic API
     */
    async testAnthropic(config) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.key,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: config.model,
                    max_tokens: 5,
                    messages: [{ role: 'user', content: 'Test' }]
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const error = await response.json();
                const errMsg = error && error.error && error.error.message ? error.error.message : 'API Fehler';
                return { success: false, error: errMsg };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Teste Google AI API
     */
    async testGoogle(config) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'Test' }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 5,
                        temperature: config.temperature
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const error = await response.json();
                const errMsg = error && error.error && error.error.message ? error.error.message : 'API Fehler';
                return { success: false, error: errMsg };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Führe KI-Analyse mit dem besten verfügbaren Service durch
     */
    async performAnalysis(prompt, options = {}) {
        const services = ['openai', 'anthropic', 'google'];
        
        for (const service of services) {
            if (this.isServiceEnabled(service)) {
                try {
                    return await this.callService(service, prompt, options);
                } catch (error) {
                    console.warn(`${service} Fehler:`, error);
                    continue;
                }
            }
        }
        
        throw new Error('Kein aktiver KI-Service verfügbar');
    }
    
    /**
     * Rufe einen spezifischen Service auf
     */
    async callService(service, prompt, options = {}) {
        const config = this.getServiceConfig(service);
        if (!config) {
            throw new Error(`Service ${service} nicht konfiguriert`);
        }
        
        switch (service) {
            case 'openai':
                return await this.callOpenAI(config, prompt, options);
            case 'anthropic':
                return await this.callAnthropic(config, prompt, options);
            case 'google':
                return await this.callGoogle(config, prompt, options);
            default:
                throw new Error(`Unbekannter Service: ${service}`);
        }
    }
    
    /**
     * OpenAI API Call
     */
    async callOpenAI(config, prompt, options) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.key}`
            },
            body: JSON.stringify({
                model: options.model || config.model,
                messages: [
                    {
                        role: 'system',
                        content: options.systemPrompt || 'Du bist ein hilfreicher Assistent.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: options.maxTokens || config.maxTokens,
                temperature: options.temperature || config.temperature
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            const errMsg = error && error.error && error.error.message ? error.error.message : response.statusText;
            throw new Error(`OpenAI API Fehler: ${errMsg}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    /**
     * Anthropic API Call
     */
    async callAnthropic(config, prompt, options) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.key,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: options.model || config.model,
                max_tokens: options.maxTokens || config.maxTokens,
                messages: [{
                    role: 'user',
                    content: `${options.systemPrompt || ''}\n\n${prompt}`
                }]
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            const errMsg = error && error.error && error.error.message ? error.error.message : response.statusText;
            throw new Error(`Anthropic API Fehler: ${errMsg}`);
        }
        
        const data = await response.json();
        return data.content[0].text;
    }
    
    /**
     * Google AI API Call
     */
    async callGoogle(config, prompt, options) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${options.model || config.model}:generateContent?key=${config.key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${options.systemPrompt || ''}\n\n${prompt}` }]
                }],
                generationConfig: {
                    maxOutputTokens: options.maxTokens || config.maxTokens,
                    temperature: options.temperature || config.temperature
                }
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            const errMsg = error && error.error && error.error.message ? error.error.message : response.statusText;
            throw new Error(`Google AI API Fehler: ${errMsg}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
    
    /**
     * Hole alle verfügbaren Services
     */
    getAvailableServices() {
        return Object.keys(this.keys).filter(service => this.isServiceEnabled(service));
    }
    
    /**
     * Reset alle API Keys
     */
    resetAllKeys() {
        this.keys = { ...this.defaultKeys };
        return this.saveKeys();
    }
    
    /**
     * Exportiere Konfiguration (ohne Keys)
     */
    exportConfig() {
        const exportData = {};
        Object.keys(this.keys).forEach(service => {
            const config = this.keys[service];
            exportData[service] = {
                name: config.name,
                description: config.description,
                model: config.model,
                maxTokens: config.maxTokens,
                temperature: config.temperature,
                enabled: config.enabled
            };
        });
        return exportData;
    }
}

// Globale Instanz erstellen
window.GlobalAPIManager = new GlobalAPIManager();

// Für Rückwärtskompatibilität
window.APIManager = window.GlobalAPIManager;
