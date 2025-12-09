/**
 * API Keys Section Module
 * Verwaltung der API Keys für das Admin Panel
 */
class ApiKeysSection {
    constructor() {
        this.stateManager = null;
        this.globalApiManager = null;
        this.initialized = false;
    }
    
    /**
     * Section initialisieren
     */
    init() {
        if (this.initialized) return;
        
        // Dependencies prüfen
        if (window.AdminApp && window.AdminApp.stateManager) {
            this.stateManager = window.AdminApp.stateManager;
        }
        
        if (window.globalAPIManager) {
            this.globalApiManager = window.globalAPIManager;
        }
        
        // Event Listeners hinzufügen
        this.attachEventListeners();
        
        // Settings laden
        this.loadApiSettings();
        
        // Temperature Sliders einrichten
        this.setupTemperatureSliders();
        
        this.initialized = true;
        console.log('API Keys Section initialized');
    }
    
    /**
     * Event Listeners hinzufügen
     */
    attachEventListeners() {
        // Temperature Sliders
        const sliders = ['openai', 'anthropic', 'google'];
        sliders.forEach(service => {
            const slider = document.getElementById(`${service}-temperature`);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const valueSpan = document.getElementById(`${service}-temp-value`);
                    if (valueSpan) {
                        valueSpan.textContent = e.target.value;
                    }
                });
            }
        });
        
        // Form Inputs
        const services = ['openai', 'anthropic', 'google'];
        services.forEach(service => {
            const inputs = document.querySelectorAll(`#${service}-key, #${service}-model, #${service}-tokens, #${service}-temperature`);
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.updateServiceStatus(service);
                });
            });
        });
    }
    
    /**
     * Temperature Sliders einrichten
     */
    setupTemperatureSliders() {
        const sliders = ['openai', 'anthropic', 'google'];
        sliders.forEach(service => {
            const slider = document.getElementById(`${service}-temperature`);
            const valueSpan = document.getElementById(`${service}-temp-value`);
            
            if (slider && valueSpan) {
                // Initial value setzen
                valueSpan.textContent = slider.value;
                
                // Event Listener
                slider.addEventListener('input', (e) => {
                    valueSpan.textContent = e.target.value;
                });
            }
        });
    }
    
    /**
     * API Settings laden
     */
    loadApiSettings() {
        const settings = this.stateManager?.getState('apiKeys') || {};
        
        const services = ['openai', 'anthropic', 'google'];
        services.forEach(service => {
            const serviceSettings = settings[service];
            if (serviceSettings) {
                // API Key
                const keyInput = document.getElementById(`${service}-key`);
                if (keyInput) {
                    keyInput.value = serviceSettings.apiKey || '';
                }
                
                // Model
                const modelSelect = document.getElementById(`${service}-model`);
                if (modelSelect) {
                    modelSelect.value = serviceSettings.model || this.getDefaultModel(service);
                }
                
                // Tokens
                const tokensInput = document.getElementById(`${service}-tokens`);
                if (tokensInput) {
                    tokensInput.value = serviceSettings.maxTokens || 1000;
                }
                
                // Temperature
                const tempSlider = document.getElementById(`${service}-temperature`);
                const tempValue = document.getElementById(`${service}-temp-value`);
                if (tempSlider && tempValue) {
                    tempSlider.value = serviceSettings.temperature || 0.3;
                    tempValue.textContent = serviceSettings.temperature || 0.3;
                }
                
                // Status aktualisieren
                this.updateServiceStatus(service);
            }
        });
    }
    
    /**
     * Default Model für Service
     */
    getDefaultModel(service) {
        const defaults = {
            'openai': 'gpt-4o-mini',
            'anthropic': 'claude-3-sonnet-20240229',
            'google': 'gemini-pro'
        };
        return defaults[service] || '';
    }
    
    /**
     * Service Status aktualisieren
     */
    updateServiceStatus(service) {
        const keyInput = document.getElementById(`${service}-key`);
        const statusElement = document.getElementById(`${service}-status`);
        const cardElement = document.getElementById(`${service}-card`);
        
        if (!keyInput || !statusElement || !cardElement) return;
        
        const hasKey = keyInput.value.trim() !== '';
        
        if (hasKey) {
            statusElement.textContent = 'Aktiv';
            statusElement.style.background = '#dcfce7';
            statusElement.style.color = '#16a34a';
            cardElement.style.borderColor = '#10b981';
        } else {
            statusElement.textContent = 'Inaktiv';
            statusElement.style.background = '#fee2e2';
            statusElement.style.color = '#991b1b';
            cardElement.style.borderColor = '#e2e8f0';
        }
    }
    
    /**
     * Service speichern
     */
    async saveService(service) {
        const serviceData = {
            apiKey: document.getElementById(`${service}-key`).value,
            model: document.getElementById(`${service}-model`).value,
            maxTokens: parseInt(document.getElementById(`${service}-tokens`).value),
            temperature: parseFloat(document.getElementById(`${service}-temperature`).value)
        };
        
        // State Manager aktualisieren (localStorage)
        if (this.stateManager) {
            const currentSettings = this.stateManager.getState('apiKeys') || {};
            currentSettings[service] = serviceData;
            this.stateManager.setState('apiKeys', currentSettings);
        }
        
        // ZUSÄTZLICH: In AWS DynamoDB speichern (für alle User verfügbar)
        try {
            // Warte auf awsProfileAPI Initialisierung
            if (window.awsProfileAPI && !window.awsProfileAPI.isInitialized) {
                await new Promise(resolve => {
                    const checkInit = setInterval(() => {
                        if (window.awsProfileAPI && window.awsProfileAPI.isInitialized) {
                            clearInterval(checkInit);
                            resolve();
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(checkInit);
                        resolve();
                    }, 5000);
                });
            }
            
            if (window.awsProfileAPI && window.awsProfileAPI.isInitialized) {
                // Lade aktuelle Admin-Konfiguration (userId: 'admin' oder 'owner')
                let adminProfile = {};
                try {
                    // Versuche zuerst mit 'admin' userId
                    const adminProfileAdmin = await window.awsProfileAPI.loadProfile().catch(() => null);
                    if (adminProfileAdmin && adminProfileAdmin.userId === 'admin') {
                        adminProfile = adminProfileAdmin;
                    } else {
                        // Fallback: Versuche mit 'owner' userId
                        const adminProfileOwner = await window.awsProfileAPI.loadProfile().catch(() => null);
                        if (adminProfileOwner && adminProfileOwner.userId === 'owner') {
                            adminProfile = adminProfileOwner;
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Fehler beim Laden des Admin-Profils:', error);
                }
                
                // Aktualisiere API Keys in Admin-Profil
                const updatedProfile = {
                    ...adminProfile,
                    userId: 'admin', // Admin-Konfiguration (konsistent)
                    type: 'admin-config',
                    apiKeys: {
                        ...(adminProfile?.apiKeys || {}),
                        [service]: {
                            ...serviceData, // Enthält den vollständigen API Key
                            updatedAt: new Date().toISOString()
                        }
                    },
                    updatedAt: new Date().toISOString()
                };
                
                // Speichere in AWS
                await window.awsProfileAPI.saveProfile(updatedProfile);
                console.log('✅ API Key in AWS gespeichert für Service:', service);
            } else {
                console.warn('⚠️ awsProfileAPI nicht verfügbar, speichere nur lokal');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern in AWS:', error);
            // Weiterhin lokal speichern, auch wenn AWS fehlschlägt
        }
        
        // Status aktualisieren
        this.updateServiceStatus(service);
        
        // Success Message
        this.showMessage(service, 'Einstellungen gespeichert!', 'success');
    }
    
    /**
     * Service testen
     */
    async testService(service) {
        const apiKey = document.getElementById(`${service}-key`).value;
        if (!apiKey) {
            this.showMessage(service, 'Bitte API Key eingeben', 'error');
            return;
        }
        
        this.showMessage(service, 'Teste Verbindung...', 'info');
        
        try {
            let result;
            
            if (this.globalApiManager) {
                // Global API Manager verwenden
                result = await this.globalApiManager.testService(service, apiKey);
            } else {
                // Fallback Test
                result = await this.performFallbackTest(service, apiKey);
            }
            
            if (result.success) {
                this.updateServiceStatus(service);
                this.showMessage(service, 'Verbindung erfolgreich!', 'success');
            } else {
                this.showMessage(service, `Fehler: ${result.error}`, 'error');
            }
            
        } catch (error) {
            console.error(`Test failed for ${service}:`, error);
            this.showMessage(service, `Fehler: ${error.message}`, 'error');
        }
    }
    
    /**
     * Fallback Test
     */
    async performFallbackTest(service, apiKey) {
        // Einfacher Format-Test
        const patterns = {
            openai: /^sk-[A-Za-z0-9_\-]{20,}$/,
            anthropic: /^sk-ant-[A-Za-z0-9_\-]{20,}$/,
            google: /^AIza[0-9A-Za-z_\-]{20,}$/
        };
        
        const pattern = patterns[service];
        if (pattern && !pattern.test(apiKey)) {
            return { success: false, error: 'Ungültiges API Key Format' };
        }
        
        return { success: true };
    }
    
    /**
     * Alle Services testen
     */
    async testAllServices() {
        const services = ['openai', 'anthropic', 'google'];
        
        for (const service of services) {
            const apiKey = document.getElementById(`${service}-key`).value;
            if (apiKey) {
                await this.testService(service);
                // Kurze Pause zwischen Tests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }
    
    /**
     * Alle Keys löschen
     */
    resetAllKeys() {
        if (confirm('Alle API Keys wirklich löschen?')) {
            // State Manager zurücksetzen
            if (this.stateManager) {
                this.stateManager.setState('apiKeys', {});
            }
            
            // Formular zurücksetzen
            this.loadApiSettings();
            
            // Success Message
            this.showMessage('openai', 'Alle Keys gelöscht', 'info');
        }
    }
    
    /**
     * Konfiguration exportieren
     */
    exportConfig() {
        const settings = this.stateManager?.getState('apiKeys') || {};
        
        // Sensitive Daten entfernen
        const exportData = {};
        Object.keys(settings).forEach(service => {
            exportData[service] = {
                model: settings[service].model,
                maxTokens: settings[service].maxTokens,
                temperature: settings[service].temperature,
                hasApiKey: !!settings[service].apiKey
            };
        });
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'api-keys-config.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Message anzeigen
     */
    showMessage(service, message, type) {
        const messageElement = document.getElementById(`${service}-message`);
        if (messageElement) {
            const colors = {
                'success': { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
                'error': { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
                'info': { bg: '#e0f2fe', color: '#0284c7', border: '#7dd3fc' }
            };
            
            const color = colors[type] || colors.info;
            
            messageElement.innerHTML = `
                <div style="
                    padding: 0.75rem; 
                    border-radius: 8px; 
                    margin-top: 1rem; 
                    font-weight: 600; 
                    background: ${color.bg}; 
                    color: ${color.color}; 
                    border: 1px solid ${color.border};
                ">
                    ${message}
                </div>
            `;
            
            // Auto-remove nach 5 Sekunden
            setTimeout(() => {
                messageElement.innerHTML = '';
            }, 5000);
        }
    }
    
    /**
     * Visibility Toggle
     */
    toggleVisibility(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const button = input.parentNode.querySelector('.toggle-visibility i');
        if (!button) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            button.classList.remove('fa-eye');
            button.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            button.classList.remove('fa-eye-slash');
            button.classList.add('fa-eye');
        }
    }
}

// Global Functions für Legacy Support
window.saveService = function(service) {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.apiKeys) {
        window.AdminApp.sections.apiKeys.saveService(service);
    }
};

window.testService = function(service) {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.apiKeys) {
        window.AdminApp.sections.apiKeys.testService(service);
    }
};

window.testAllServices = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.apiKeys) {
        window.AdminApp.sections.apiKeys.testAllServices();
    }
};

window.resetAllKeys = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.apiKeys) {
        window.AdminApp.sections.apiKeys.resetAllKeys();
    }
};

window.exportConfig = function() {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.apiKeys) {
        window.AdminApp.sections.apiKeys.exportConfig();
    }
};

window.toggleVisibility = function(inputId) {
    if (window.AdminApp && window.AdminApp.sections && window.AdminApp.sections.apiKeys) {
        window.AdminApp.sections.apiKeys.toggleVisibility(inputId);
    }
};

// Section initialisieren wenn DOM bereit
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis AdminApp verfügbar ist
    const initSection = () => {
        if (window.AdminApp && window.AdminApp.sections) {
            window.AdminApp.sections.apiKeys = new ApiKeysSection();
            window.AdminApp.sections.apiKeys.init();
        } else {
            setTimeout(initSection, 100);
        }
    };
    initSection();
});

// Global verfügbar machen
window.ApiKeysSection = ApiKeysSection;
