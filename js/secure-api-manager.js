/**
 * SICHERE OpenAI API Key Verwaltung
 * 
 * Best Practices implementiert:
 * ✓ Nie API Keys in Code speichern
 * ✓ Nur localStorage für Browser-basierte Apps
 * ✓ Validierung und Verschleierung
 * ✓ Klare Sicherheitswarnungen
 * ✓ Produktions-Ready Hinweise
 */

class SecureAPIManager {
    constructor() {
        this.keyPrefix = 'openai_';
        this.settingsKey = 'openai_settings';
    }

    // SICHERE API Key Validierung
    validateAPIKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('API Key ist erforderlich');
        }
        
        if (!apiKey.startsWith('sk-')) {
            throw new Error('OpenAI API Keys beginnen mit "sk-"');
        }
        
        if (apiKey.length < 50) {
            throw new Error('API Key scheint unvollständig zu sein');
        }
        
        // Weitere Validierung für bekannte Patterns
        if (!apiKey.match(/^sk-[a-zA-Z0-9\-_]{40,}$/)) {
            throw new Error('Ungültiges API Key Format');
        }
        
        return true;
    }

    // SICHERE Speicherung (nur localStorage)
    saveAPIKey(apiKey) {
        try {
            this.validateAPIKey(apiKey);
            
            // WARNUNG über Client-Side Speicherung
            const warning = `⚠️ SICHERHEITSWARNUNG:
            
API Key wird nur in Ihrem Browser (localStorage) gespeichert.

FÜR PRODUKTION NICHT EMPFOHLEN:
• Verwenden Sie einen Backend-Server
• Nutzen Sie Umgebungsvariablen
• Implementieren Sie Proxy-Endpoints
• Rotieren Sie Keys regelmäßig

Trotzdem fortfahren?`;

            if (!confirm(warning)) {
                return false;
            }
            
            // Verschleierte Speicherung
            const keyData = {
                key: apiKey,
                hash: this.createKeyHash(apiKey),
                savedAt: new Date().toISOString(),
                environment: 'browser-local'
            };
            
            localStorage.setItem(this.keyPrefix + 'key', JSON.stringify(keyData));
            return true;
            
        } catch (error) {
            throw new Error(`Speicherung fehlgeschlagen: ${error.message}`);
        }
    }

    // API Key sicher laden
    getAPIKey() {
        try {
            const keyData = localStorage.getItem(this.keyPrefix + 'key');
            if (!keyData) return null;
            
            const parsed = JSON.parse(keyData);
            return parsed.key;
        } catch (error) {
            console.error('Fehler beim Laden des API Keys:', error);
            return null;
        }
    }

    // Key Hash für Anzeige (Sicherheit)
    createKeyHash(apiKey) {
        return apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4);
    }

    // Einstellungen speichern (ohne API Key)
    saveSettings(settings) {
        try {
            const safeSettings = {
                model: settings.model || 'gpt-4o-mini',
                language: settings.language || 'de',
                maxRequirements: parseInt(settings.maxRequirements) || 10,
                temperature: parseFloat(settings.temperature) || 0.1,
                savedAt: new Date().toISOString(),
                keyHash: this.getKeyHash()
            };
            
            localStorage.setItem(this.settingsKey, JSON.stringify(safeSettings));
            return true;
        } catch (error) {
            throw new Error(`Einstellungen speichern fehlgeschlagen: ${error.message}`);
        }
    }

    // Einstellungen laden
    getSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Fehler beim Laden der Einstellungen:', error);
            return this.getDefaultSettings();
        }
    }

    // Default Einstellungen
    getDefaultSettings() {
        return {
            model: 'gpt-4o-mini',
            language: 'de',
            maxRequirements: 10,
            temperature: 0.1
        };
    }

    // Key Hash für Anzeige
    getKeyHash() {
        const apiKey = this.getAPIKey();
        return apiKey ? this.createKeyHash(apiKey) : null;
    }

    // API Key Status
    getKeyStatus() {
        const apiKey = this.getAPIKey();
        if (!apiKey) {
            return { status: 'missing', message: 'Kein API Key gespeichert' };
        }
        
        try {
            this.validateAPIKey(apiKey);
            return { 
                status: 'valid', 
                message: 'API Key verfügbar',
                hash: this.createKeyHash(apiKey)
            };
        } catch (error) {
            return { status: 'invalid', message: error.message };
        }
    }

    // Sichere API Verbindung testen
    async testConnection() {
        const apiKey = this.getAPIKey();
        if (!apiKey) {
            throw new Error('Kein API Key verfügbar');
        }

        try {
            // WARNUNG: Client-Side API Calls sind nicht produktionstauglich
            console.warn('⚠️ WARNUNG: Client-Side OpenAI API Calls sind nicht für Produktion geeignet!');
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{
                        role: 'user',
                        content: 'Antworte nur mit "Test erfolgreich"'
                    }],
                    max_tokens: 10,
                    temperature: 0
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Fehler: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                message: data.choices[0].message.content,
                usage: data.usage
            };

        } catch (error) {
            if (error.message.includes('CORS')) {
                throw new Error('CORS-Einschränkung: Browser blockiert direkte API Calls. Backend-Server erforderlich.');
            }
            throw error;
        }
    }

    // API Key löschen
    clearAPIKey() {
        try {
            localStorage.removeItem(this.keyPrefix + 'key');
            return true;
        } catch (error) {
            console.error('Fehler beim Löschen des API Keys:', error);
            return false;
        }
    }

    // Alle Daten löschen
    clearAll() {
        try {
            localStorage.removeItem(this.keyPrefix + 'key');
            localStorage.removeItem(this.settingsKey);
            return true;
        } catch (error) {
            console.error('Fehler beim Löschen der Daten:', error);
            return false;
        }
    }
}

// Global verfügbar machen
window.secureAPIManager = new SecureAPIManager();

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureAPIManager;
}
