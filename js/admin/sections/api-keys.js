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
    async init() {
        if (this.initialized) return;
        
        // Dependencies prüfen
        if (window.AdminApp && window.AdminApp.stateManager) {
            this.stateManager = window.AdminApp.stateManager;
        }
        
        if (window.globalAPIManager) {
            this.globalApiManager = window.globalAPIManager;
        }
        
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
        
        // Event Listeners hinzufügen (funktioniert auch ohne DOM, da bei Navigation erneut aufgerufen)
        this.attachEventListeners();
        
        // Prüfe, ob wir gerade auf der API-Keys-Sektion sind
        if (window.location.hash === '#api-keys') {
            console.log('ℹ️ API Keys Section: Direkt auf Section, lade Daten...');
            // Warte kurz auf DOM und lade dann
            setTimeout(() => this.onNavigate(), 500);
        } else {
            console.log('ℹ️ API Keys Section init() abgeschlossen - Laden passiert bei Navigation');
        }
    }
    
    /**
     * API Keys aus AWS Cloud laden
     * ACHTUNG: Diese Funktion erwartet, dass die DOM-Elemente bereits vorhanden sind!
     * Wird nur von onNavigate() aufgerufen, nachdem das Template geladen wurde.
     */
    async loadApiKeysFromAWS() {
        try {
            // Prüfe ob DOM-Elemente vorhanden sind
            if (!document.getElementById('openai-key')) {
                console.warn('⚠️ DOM-Elemente für API Keys nicht gefunden - überspringe Laden');
                return;
            }
            
            // Versuche aus awsAPISettings zu laden (Cloud-Speicherung)
            if (window.awsAPISettings && window.awsAPISettings.isUserLoggedIn()) {
                console.log('☁️ Lade API Keys aus AWS Cloud...');
                const awsSettings = await window.awsAPISettings.getSettings(true); // Force refresh
                
                if (awsSettings && awsSettings.hasSettings && awsSettings.settings) {
                    console.log('✅ API Keys aus AWS Cloud geladen:', awsSettings.settings);
                    const settings = awsSettings.settings;
                    
                    // Initialisiere Cache für vollständige Keys
                    if (!this.cachedApiKeys) {
                        this.cachedApiKeys = {};
                    }
                    
                    // Fülle Formulare und GlobalAPIManager
                    const services = ['openai', 'anthropic', 'google'];
                    services.forEach(service => {
                        const serviceData = settings[service];
                        console.log(`🔍 Prüfe ${service}:`, serviceData);
                        
                        // Prüfe ob Service-Daten vorhanden sind (configured, apiKey, oder keyMasked)
                        if (serviceData && (serviceData.configured || serviceData.apiKey || serviceData.keyMasked || serviceData.hasFullKey)) {
                            console.log(`✅ ${service} hat Daten, fülle Formular...`);
                            
                            // Speichere vollständigen Key im Cache (für späteren Gebrauch)
                            // WICHTIG: Wenn nur maskierter Key vorhanden, müssen wir den echten Key später laden
                            if (serviceData.apiKey && !serviceData.apiKey.includes('...') && serviceData.apiKey.length > 10) {
                                this.cachedApiKeys[service] = serviceData.apiKey;
                            } else if (serviceData.hasFullKey) {
                                // Key ist vorhanden, aber maskiert - markiere für späteres Laden
                                this.cachedApiKeys[service] = 'MASKED'; // Placeholder
                            }
                            
                            // Formular mit MASKIERTEM Key füllen (Sicherheit!)
                            const keyInput = document.getElementById(`${service}-key`);
                            if (keyInput) {
                                // Zeige maskierten Key an, oder den vollständigen wenn kein maskierter vorhanden
                                const displayKey = serviceData.keyMasked || serviceData.apiKey || '••••••••';
                                keyInput.value = displayKey;
                                keyInput.dataset.hasKey = 'true'; // Markiere dass ein Key vorhanden ist
                                keyInput.dataset.originalMasked = displayKey; // Speichere maskierten Wert
                                keyInput.dataset.configured = serviceData.configured ? 'true' : 'false';
                                console.log(`📝 ${service} Input gefüllt mit: ${displayKey.substring(0, 10)}...`);
                            }
                            
                            const modelSelect = document.getElementById(`${service}-model`);
                            if (modelSelect && serviceData.model) {
                                modelSelect.value = serviceData.model;
                            }
                            
                            const tokensInput = document.getElementById(`${service}-tokens`);
                            if (tokensInput && serviceData.maxTokens) {
                                tokensInput.value = serviceData.maxTokens;
                            }
                            
                            const tempSlider = document.getElementById(`${service}-temperature`);
                            const tempValue = document.getElementById(`${service}-temp-value`);
                            if (tempSlider && serviceData.temperature !== undefined) {
                                tempSlider.value = serviceData.temperature;
                                if (tempValue) tempValue.textContent = serviceData.temperature;
                            }
                            
                            // Auch in GlobalAPIManager synchronisieren (nur wenn vollständiger Key vorhanden)
                            if (window.GlobalAPIManager && serviceData.apiKey && !serviceData.apiKey.includes('...')) {
                                window.GlobalAPIManager.setAPIKey(service, serviceData.apiKey, {
                                    model: serviceData.model,
                                    maxTokens: serviceData.maxTokens,
                                    temperature: serviceData.temperature
                                });
                            }
                            
                            // Status aktualisieren - Force auf Aktiv wenn Key vorhanden
                            console.log(`🔄 Aktualisiere Status für ${service}...`);
                            this.updateServiceStatus(service, true);
                        } else {
                            console.log(`⚠️ ${service} hat keine Daten`);
                        }
                    });
                    
                    // Auch in StateManager aktualisieren
                    if (this.stateManager) {
                        const currentSettings = this.stateManager.getState('apiKeys') || {};
                        Object.keys(settings).forEach(service => {
                            if (settings[service] && settings[service].apiKey) {
                                currentSettings[service] = {
                                    ...currentSettings[service],
                                    apiKey: settings[service].apiKey,
                                    model: settings[service].model,
                                    maxTokens: settings[service].maxTokens,
                                    temperature: settings[service].temperature
                                };
                            }
                        });
                        this.stateManager.setState('apiKeys', currentSettings);
                    }
                } else {
                    console.log('ℹ️ Keine API Keys in AWS Cloud gespeichert');
                }
            } else {
                console.log('ℹ️ Nicht eingeloggt oder awsAPISettings nicht verfügbar', {
                    hasAwsAPISettings: !!window.awsAPISettings,
                    isLoggedIn: window.awsAPISettings ? window.awsAPISettings.isUserLoggedIn() : false
                });
            }
        } catch (error) {
            console.warn('⚠️ Fehler beim Laden der API Keys aus AWS:', error);
        }
        
        // Settings laden (aus localStorage als Fallback)
        this.loadApiSettings();
        
        // Temperature Sliders einrichten
        this.setupTemperatureSliders();
        
        this.initialized = true;
        console.log('API Keys Section initialized');
    }
    
    /**
     * Wird aufgerufen wenn zur Section navigiert wird
     */
    async onNavigate() {
        console.log('🔄 API Keys Section: onNavigate aufgerufen');
        
        // Warte bis DOM-Elemente vorhanden sind (max. 5 Sekunden)
        let attempts = 0;
        const maxAttempts = 50; // 50 * 100ms = 5 Sekunden
        
        while (attempts < maxAttempts) {
            const keyInput = document.getElementById('openai-key');
            if (keyInput) {
                console.log('✅ DOM-Elemente gefunden, lade API Keys...');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (attempts >= maxAttempts) {
            console.warn('⚠️ DOM-Elemente nicht gefunden nach 5 Sekunden');
        }
        
        // Lade Keys aus AWS
        await this.loadApiKeysFromAWS();
    }
    
    /**
     * Daten aus AWS neu laden und UI aktualisieren
     */
    async refreshFromAWS() {
        try {
            if (!window.awsAPISettings || !window.awsAPISettings.isUserLoggedIn()) {
                console.log('ℹ️ Nicht eingeloggt, überspringe AWS-Refresh');
                return;
            }
            
            console.log('🔄 Aktualisiere API Keys aus AWS...');
            const awsSettings = await window.awsAPISettings.getSettings(true);
            
            if (awsSettings && awsSettings.hasSettings && awsSettings.settings) {
                const services = ['openai', 'anthropic', 'google'];
                services.forEach(service => {
                    const serviceData = awsSettings.settings[service];
                    if (serviceData && (serviceData.apiKey || serviceData.configured)) {
                        const keyInput = document.getElementById(`${service}-key`);
                        if (keyInput) {
                            keyInput.value = serviceData.keyMasked || this.maskKey(serviceData.apiKey) || '••••••••';
                            keyInput.dataset.hasKey = 'true';
                        }
                        
                        // Status auf Aktiv setzen
                        this.updateServiceStatus(service, true);
                        
                        console.log(`✅ ${service} Key aus AWS geladen`);
                    }
                });
            }
        } catch (error) {
            console.warn('⚠️ Fehler beim Aktualisieren aus AWS:', error);
        }
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
        
        // Hash-Change Listener für Navigation zur API-Keys-Sektion
        // Speichere Referenz auf 'this' für den Callback
        const self = this;
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#api-keys') {
                console.log('🔄 Hash changed to #api-keys, triggering onNavigate');
                self.onNavigate();
            }
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
     * API Settings laden (aus GlobalAPIManager, StateManager, localStorage)
     */
    loadApiSettings() {
        const services = ['openai', 'anthropic', 'google'];
        
        services.forEach(service => {
            let serviceSettings = null;
            
            // 1. Versuch: GlobalAPIManager
            if (window.GlobalAPIManager) {
                const config = window.GlobalAPIManager.getServiceConfig(service);
                if (config && config.key) {
                    serviceSettings = {
                        apiKey: config.key,
                        model: config.model,
                        maxTokens: config.maxTokens,
                        temperature: config.temperature
                    };
                }
            }
            
            // 2. Versuch: State Manager
            if (!serviceSettings && this.stateManager) {
                const settings = this.stateManager.getState('apiKeys') || {};
                if (settings[service]) {
                    serviceSettings = settings[service];
                }
            }
            
            // 3. Versuch: Direkt aus global_api_keys
            if (!serviceSettings) {
                try {
                    const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
                    if (globalKeys[service] && globalKeys[service].key) {
                        serviceSettings = {
                            apiKey: globalKeys[service].key,
                            model: globalKeys[service].model,
                            maxTokens: globalKeys[service].maxTokens,
                            temperature: globalKeys[service].temperature
                        };
                    }
                } catch (e) {}
            }
            
            if (serviceSettings) {
                // API Key
                const keyInput = document.getElementById(`${service}-key`);
                if (keyInput && serviceSettings.apiKey) {
                    keyInput.value = serviceSettings.apiKey;
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
        // Modelle werden automatisch je nach Funktion gewählt
        // gpt-3.5-turbo ist das am weitesten verfügbare Modell
        const defaults = {
            'openai': 'gpt-5.2',
            'anthropic': 'claude-3-sonnet-20240229',
            'google': 'gemini-pro'
        };
        return defaults[service] || '';
    }
    
    /**
     * API Key maskieren für sichere Anzeige
     */
    maskKey(key) {
        if (!key || key.length < 8) return '••••••••';
        return key.substring(0, 7) + '...' + key.substring(key.length - 4);
    }
    
    /**
     * Service Status aktualisieren
     */
    updateServiceStatus(service, forceActive = false) {
        const keyInput = document.getElementById(`${service}-key`);
        const statusElement = document.getElementById(`${service}-status`);
        const cardElement = document.getElementById(`${service}-card`);
        
        if (!keyInput || !statusElement || !cardElement) {
            console.warn(`⚠️ DOM-Elemente für ${service} nicht gefunden`);
            return;
        }
        
        // Prüfe ob Key vorhanden: entweder im Input, im Cache oder als data-Attribut markiert
        const inputValue = keyInput.value.trim();
        const hasKeyInCache = this.cachedApiKeys && this.cachedApiKeys[service];
        const hasKeyMarked = keyInput.dataset.hasKey === 'true';
        const isConfigured = keyInput.dataset.configured === 'true';
        
        // Prüfe ob Input einen gültigen Key enthält (nicht leer, nicht nur Punkte/Striche)
        const hasValidInput = inputValue !== '' && 
                              !inputValue.includes('••••') && 
                              !inputValue.match(/^[.\-]+$/);
        
        const hasKey = forceActive || hasValidInput || hasKeyInCache || hasKeyMarked || isConfigured;
        
        console.log(`🔍 Status-Prüfung für ${service}:`, {
            forceActive,
            inputValue: inputValue.substring(0, 10) + '...',
            hasKeyInCache: !!hasKeyInCache,
            hasKeyMarked,
            isConfigured,
            hasValidInput,
            hasKey
        });
        
        if (hasKey) {
            statusElement.textContent = 'Aktiv';
            statusElement.style.background = '#dcfce7';
            statusElement.style.color = '#16a34a';
            cardElement.style.borderColor = '#10b981';
            console.log(`✅ ${service} als AKTIV markiert`);
        } else {
            statusElement.textContent = 'Inaktiv';
            statusElement.style.background = '#fee2e2';
            statusElement.style.color = '#991b1b';
            cardElement.style.borderColor = '#e2e8f0';
            console.log(`❌ ${service} als INAKTIV markiert`);
        }
    }
    
    /**
     * Service speichern
     */
    async saveService(service) {
        const keyInput = document.getElementById(`${service}-key`);
        let apiKey = keyInput.value;
        
        // Wenn der Wert maskiert ist (unverändert), verwende den gecacheten vollständigen Key
        const isMasked = apiKey.includes('...') || apiKey.includes('••••');
        if (isMasked && this.cachedApiKeys && this.cachedApiKeys[service]) {
            apiKey = this.cachedApiKeys[service];
            console.log(`📦 Verwende gecacheten Key für ${service}`);
        }
        
        // Validierung: Key muss vorhanden sein
        if (!apiKey || apiKey.includes('••••')) {
            this.showMessage(service, 'Bitte geben Sie einen gültigen API Key ein', 'error');
            return;
        }
        
        const serviceData = {
            apiKey: apiKey,
            model: document.getElementById(`${service}-model`).value,
            maxTokens: parseInt(document.getElementById(`${service}-tokens`).value),
            temperature: parseFloat(document.getElementById(`${service}-temperature`).value)
        };
        
        // Aktualisiere Cache mit neuem Key
        if (!this.cachedApiKeys) this.cachedApiKeys = {};
        this.cachedApiKeys[service] = apiKey;
        
        // State Manager aktualisieren (localStorage)
        if (this.stateManager) {
            const currentSettings = this.stateManager.getState('apiKeys') || {};
            currentSettings[service] = serviceData;
            this.stateManager.setState('apiKeys', currentSettings);
        }
        
        // WICHTIG: Auch in GlobalAPIManager speichern (für quick-apply.js etc.)
        if (window.GlobalAPIManager) {
            window.GlobalAPIManager.setAPIKey(service, serviceData.apiKey, {
                model: serviceData.model,
                maxTokens: serviceData.maxTokens,
                temperature: serviceData.temperature
            });
            console.log(`✅ ${service} API-Key in GlobalAPIManager gespeichert`);
        }
        // IMMER in global_api_keys – Fallback für BPMN/HR-Coach wenn AWS-Key nicht geladen wird
        try {
            const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
            globalKeys[service] = {
                key: serviceData.apiKey,
                model: serviceData.model,
                maxTokens: serviceData.maxTokens,
                temperature: serviceData.temperature,
                enabled: !!serviceData.apiKey
            };
            localStorage.setItem('global_api_keys', JSON.stringify(globalKeys));
            console.log(`✅ ${service} API-Key in global_api_keys gespeichert`);
        } catch (e) {
            console.error('Fehler beim Speichern in global_api_keys:', e);
        }
        
        // AWS Cloud-Speicherung über awsAPISettings (benutzerspezifisch)
        try {
            if (window.awsAPISettings && window.awsAPISettings.isUserLoggedIn()) {
                console.log('☁️ Speichere API-Key in AWS Cloud...');
                
                // Baue Settings-Objekt für AWS
                const awsSettings = {};
                awsSettings[service] = {
                    apiKey: serviceData.apiKey,
                    model: serviceData.model,
                    maxTokens: serviceData.maxTokens,
                    temperature: serviceData.temperature
                };
                
                // Speichere mit der entsprechenden Methode
                if (service === 'openai') {
                    await window.awsAPISettings.saveOpenAIKey(serviceData.apiKey, {
                        model: serviceData.model,
                        maxTokens: serviceData.maxTokens,
                        temperature: serviceData.temperature
                    });
                } else if (service === 'anthropic') {
                    await window.awsAPISettings.saveAnthropicKey(serviceData.apiKey, {
                        model: serviceData.model,
                        maxTokens: serviceData.maxTokens,
                        temperature: serviceData.temperature
                    });
                } else if (service === 'google') {
                    await window.awsAPISettings.saveGoogleKey(serviceData.apiKey, {
                        model: serviceData.model,
                        maxTokens: serviceData.maxTokens,
                        temperature: serviceData.temperature
                    });
                }
                
                console.log('✅ API-Key in AWS Cloud gespeichert für Service:', service);
            } else {
                console.log('ℹ️ Nicht eingeloggt - API-Key nur lokal gespeichert');
            }
        } catch (error) {
            console.error('❌ Fehler beim Speichern in AWS:', error);
            // Lokal ist bereits gespeichert
        }
        
        // Status aktualisieren
        this.updateServiceStatus(service);
        
        // Success Message
        this.showMessage(service, 'Einstellungen gespeichert!', 'success');
    }
    
    /**
     * Direkter DynamoDB-Zugriff zum Speichern (Fallback)
     */
    async saveToDynamoDBDirect(profileData) {
        try {
            if (!window.AWS || !window.AWS.DynamoDB) {
                throw new Error('AWS SDK nicht verfügbar');
            }
            
            const dynamoDB = new window.AWS.DynamoDB.DocumentClient({
                region: window.AWS_CONFIG?.region || 'eu-central-1'
            });
            
            const tableName = window.AWS_CONFIG?.dynamoDB?.tableName || 'mawps-user-profiles';
            
            await dynamoDB.put({
                TableName: tableName,
                Item: profileData
            }).promise();
            
            console.log('✅ Direkt in DynamoDB gespeichert');
        } catch (error) {
            console.error('❌ Direkter DynamoDB-Zugriff fehlgeschlagen:', error);
            throw error;
        }
    }
    
    /**
     * Direkter DynamoDB-Zugriff zum Laden (Fallback)
     */
    async loadFromDynamoDBDirect(userId) {
        try {
            if (!window.AWS || !window.AWS.DynamoDB) {
                throw new Error('AWS SDK nicht verfügbar');
            }
            
            const dynamoDB = new window.AWS.DynamoDB.DocumentClient({
                region: window.AWS_CONFIG?.region || 'eu-central-1'
            });
            
            const tableName = window.AWS_CONFIG?.dynamoDB?.tableName || 'mawps-user-profiles';
            
            const result = await dynamoDB.get({
                TableName: tableName,
                Key: {
                    userId: userId
                }
            }).promise();
            
            if (result.Item) {
                console.log('✅ Direkt aus DynamoDB geladen');
                return result.Item;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Direkter DynamoDB-Zugriff fehlgeschlagen:', error);
            return null;
        }
    }
    
    /**
     * Service testen
     */
    async testService(service) {
        let apiKey = document.getElementById(`${service}-key`).value;
        if (!apiKey) {
            this.showMessage(service, 'Bitte API Key eingeben', 'error');
            return;
        }
        
        this.showMessage(service, 'Teste Verbindung...', 'info');
        
        try {
            // Wenn der Key maskiert ist (enthält "..."), hole den echten Key aus AWS
            if (apiKey.includes('...')) {
                console.log(`🔑 Key ist maskiert, hole echten Key aus AWS für ${service}...`);
                
                // Versuche den echten Key vom Backend zu holen
                if (window.awsAPISettings && window.awsAPISettings.isUserLoggedIn()) {
                    try {
                        const fullKeyResponse = await window.awsAPISettings.getFullApiKey(service);
                        if (fullKeyResponse && fullKeyResponse.apiKey) {
                            apiKey = fullKeyResponse.apiKey;
                            console.log(`✅ Echter Key aus AWS geladen für ${service}`);
                        } else {
                            this.showMessage(service, 'Fehler: Konnte echten API Key nicht laden', 'error');
                            return;
                        }
                    } catch (err) {
                        console.error('Fehler beim Laden des echten Keys:', err);
                        this.showMessage(service, 'Fehler: Konnte echten API Key nicht laden', 'error');
                        return;
                    }
                } else {
                    this.showMessage(service, 'Bitte neu einloggen um den Key zu testen', 'error');
                    return;
                }
            }
            
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
            const section = new ApiKeysSection();
            window.AdminApp.sections.apiKeys = section;
            // Auch global verfügbar machen für einfachen Zugriff
            window.apiKeysSection = section;
            section.init();
        } else {
            setTimeout(initSection, 100);
        }
    };
    initSection();
});

// Global verfügbar machen
window.ApiKeysSection = ApiKeysSection;
