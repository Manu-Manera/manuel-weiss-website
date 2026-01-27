/**
 * TESTSCRIPT: API-Key Integration Anschreibengenerator
 * Testet alle Szenarien für die API-Key-Erkennung
 */

class CoverLetterAPIKeyTester {
    constructor() {
        this.results = [];
        this.testApiKey = 'sk-test123456789012345678901234567890123456789012345678901234567890';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        console.log(logEntry);
        this.results.push({ timestamp, type, message });
    }

    async testScenario(name, testFn) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`TEST: ${name}`);
        console.log('='.repeat(60));
        
        try {
            const result = await testFn();
            if (result.success) {
                this.log(`✅ ${name}: ERFOLGREICH`, 'success');
                this.log(`   Details: ${result.details}`, 'info');
            } else {
                this.log(`❌ ${name}: FEHLGESCHLAGEN`, 'error');
                this.log(`   Grund: ${result.reason}`, 'error');
            }
            return result;
        } catch (error) {
            this.log(`❌ ${name}: EXCEPTION`, 'error');
            this.log(`   Fehler: ${error.message}`, 'error');
            this.log(`   Stack: ${error.stack}`, 'error');
            return { success: false, reason: error.message };
        }
    }

    // Szenario 1: API-Key im Admin Panel (admin_state)
    async testAdminState() {
        return await this.testScenario('Admin Panel (admin_state)', async () => {
            // Setup: Key in admin_state speichern
            const adminState = {
                services: {
                    openai: {
                        key: this.testApiKey
                    }
                }
            };
            localStorage.setItem('admin_state', JSON.stringify(adminState));

            // Test: getAPIKey() aufrufen
            if (typeof window.coverLetterEditor === 'undefined') {
                return { success: false, reason: 'coverLetterEditor nicht verfügbar' };
            }

            const apiKey = await window.coverLetterEditor.getAPIKey();
            
            // Cleanup
            localStorage.removeItem('admin_state');

            if (apiKey && apiKey.startsWith('sk-')) {
                return { success: true, details: `Key gefunden: ${apiKey.substring(0, 10)}...` };
            } else {
                return { success: false, reason: `Key nicht gefunden oder ungültig: ${apiKey}` };
            }
        });
    }

    // Szenario 2: API-Key über global_api_keys
    async testGlobalApiKeys() {
        return await this.testScenario('Global API Keys (localStorage)', async () => {
            // Setup
            const globalKeys = {
                openai: {
                    key: this.testApiKey
                }
            };
            localStorage.setItem('global_api_keys', JSON.stringify(globalKeys));

            // Test
            if (typeof window.coverLetterEditor === 'undefined') {
                return { success: false, reason: 'coverLetterEditor nicht verfügbar' };
            }

            const apiKey = await window.coverLetterEditor.getAPIKey();
            
            // Cleanup
            localStorage.removeItem('global_api_keys');

            if (apiKey && apiKey.startsWith('sk-')) {
                return { success: true, details: `Key gefunden: ${apiKey.substring(0, 10)}...` };
            } else {
                return { success: false, reason: `Key nicht gefunden: ${apiKey}` };
            }
        });
    }

    // Szenario 3: API-Key über awsAPISettings (global)
    async testAwsApiSettingsGlobal() {
        return await this.testScenario('AWS API Settings (global)', async () => {
            // Prüfe ob awsAPISettings verfügbar ist
            if (!window.awsAPISettings) {
                return { success: false, reason: 'awsAPISettings nicht verfügbar' };
            }

            try {
                // Versuche globalen Key zu holen
                const key = await window.awsAPISettings.getFullApiKey('openai', true);
                
                if (key && typeof key === 'string' && key.startsWith('sk-') && !key.includes('...')) {
                    return { success: true, details: `Key gefunden: ${key.substring(0, 10)}...` };
                } else if (key && typeof key === 'object') {
                    return { success: false, reason: `Key ist Objekt statt String: ${JSON.stringify(key).substring(0, 50)}` };
                } else {
                    return { success: false, reason: `Key nicht gefunden oder ungültig: ${key}` };
                }
            } catch (error) {
                return { success: false, reason: `Fehler beim Abrufen: ${error.message}` };
            }
        });
    }

    // Szenario 4: API-Key über direkten API-Call
    async testDirectApiCall() {
        return await this.testScenario('Direkter API-Call', async () => {
            try {
                const apiUrl = window.getApiUrl ? 
                    window.getApiUrl('API_SETTINGS') + '/key?provider=openai&global=true' : 
                    (window.AWS_APP_CONFIG?.API_BASE || 'https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1') + '/api-settings/key?provider=openai&global=true';
                
                this.log(`API URL: ${apiUrl}`, 'info');
                
                const response = await fetch(apiUrl, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    return { success: false, reason: `HTTP ${response.status}: ${response.statusText}` };
                }

                const data = await response.json();
                
                if (data.apiKey && typeof data.apiKey === 'string' && data.apiKey.startsWith('sk-') && !data.apiKey.includes('...')) {
                    return { success: true, details: `Key gefunden: ${data.apiKey.substring(0, 10)}...` };
                } else {
                    return { success: false, reason: `Ungültiges Response-Format: ${JSON.stringify(data).substring(0, 100)}` };
                }
            } catch (error) {
                return { success: false, reason: `Fehler beim API-Call: ${error.message}` };
            }
        });
    }

    // Szenario 5: Timing-Test (awsAPISettings verzögert)
    async testTiming() {
        return await this.testScenario('Timing-Test (awsAPISettings)', async () => {
            // Prüfe ob awsAPISettings verfügbar ist
            if (!window.awsAPISettings) {
                return { success: false, reason: 'awsAPISettings nicht verfügbar - kann Timing nicht testen' };
            }

            // Test: getAPIKey() sollte auch funktionieren wenn awsAPISettings vorhanden ist
            if (typeof window.coverLetterEditor === 'undefined') {
                return { success: false, reason: 'coverLetterEditor nicht verfügbar' };
            }

            const startTime = Date.now();
            const apiKey = await window.coverLetterEditor.getAPIKey();
            const duration = Date.now() - startTime;

            if (apiKey && apiKey.startsWith('sk-')) {
                return { success: true, details: `Key gefunden in ${duration}ms: ${apiKey.substring(0, 10)}...` };
            } else {
                return { success: false, reason: `Key nicht gefunden nach ${duration}ms: ${apiKey}` };
            }
        });
    }

    // Szenario 6: Fehlerhafte Keys (maskiert)
    async testMaskedKeys() {
        return await this.testScenario('Maskierte Keys (sollten ignoriert werden)', async () => {
            // Setup: Maskierten Key speichern
            const maskedKey = 'sk-test...masked';
            const globalKeys = {
                openai: {
                    key: maskedKey
                }
            };
            localStorage.setItem('global_api_keys', JSON.stringify(globalKeys));

            // Test: getAPIKey() sollte maskierten Key NICHT zurückgeben
            if (typeof window.coverLetterEditor === 'undefined') {
                return { success: false, reason: 'coverLetterEditor nicht verfügbar' };
            }

            const apiKey = await window.coverLetterEditor.getAPIKey();
            
            // Cleanup
            localStorage.removeItem('global_api_keys');

            if (apiKey && apiKey.includes('...')) {
                return { success: false, reason: `Maskierter Key wurde zurückgegeben: ${apiKey}` };
            } else if (!apiKey) {
                return { success: true, details: 'Maskierter Key korrekt ignoriert' };
            } else {
                return { success: true, details: `Anderer Key gefunden (korrekt): ${apiKey.substring(0, 10)}...` };
            }
        });
    }

    // Szenario 7: Vollständiger Integrationstest
    async testFullIntegration() {
        return await this.testScenario('Vollständiger Integrationstest', async () => {
            if (typeof window.coverLetterEditor === 'undefined') {
                return { success: false, reason: 'coverLetterEditor nicht verfügbar' };
            }

            // Simuliere generateCoverLetter() Aufruf
            const originalGetAPIKey = window.coverLetterEditor.getAPIKey.bind(window.coverLetterEditor);
            let apiKeyFound = false;
            let errorMessage = null;

            try {
                const apiKey = await originalGetAPIKey();
                apiKeyFound = !!(apiKey && apiKey.startsWith('sk-') && !apiKey.includes('...'));
                
                if (!apiKeyFound) {
                    errorMessage = `API-Key nicht gefunden: ${apiKey}`;
                }
            } catch (error) {
                errorMessage = `Exception: ${error.message}`;
            }

            if (apiKeyFound) {
                return { success: true, details: 'API-Key erfolgreich gefunden - Generierung sollte funktionieren' };
            } else {
                return { success: false, reason: errorMessage || 'API-Key nicht gefunden' };
            }
        });
    }

    // Alle Tests ausführen
    async runAllTests() {
        console.log('\n🚀 STARTE API-KEY INTEGRATION TESTS\n');
        console.log(`Test-Umgebung: ${window.location.href}`);
        console.log(`User-Agent: ${navigator.userAgent}`);
        console.log(`Timestamp: ${new Date().toISOString()}\n`);

        const tests = [
            () => this.testAdminState(),
            () => this.testGlobalApiKeys(),
            () => this.testAwsApiSettingsGlobal(),
            () => this.testDirectApiCall(),
            () => this.testTiming(),
            () => this.testMaskedKeys(),
            () => this.testFullIntegration()
        ];

        const results = [];
        for (const test of tests) {
            const result = await test();
            results.push(result);
            // Kurze Pause zwischen Tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Zusammenfassung
        console.log('\n' + '='.repeat(60));
        console.log('TEST-ZUSAMMENFASSUNG');
        console.log('='.repeat(60));
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`✅ Erfolgreich: ${successful}/${results.length}`);
        console.log(`❌ Fehlgeschlagen: ${failed}/${results.length}`);
        
        if (failed > 0) {
            console.log('\nFehlgeschlagene Tests:');
            results.forEach((result, index) => {
                if (!result.success) {
                    console.log(`  ${index + 1}. ${result.reason || 'Unbekannter Fehler'}`);
                }
            });
        }

        // Detaillierte Logs
        console.log('\n' + '='.repeat(60));
        console.log('DETAILLIERTE LOGS');
        console.log('='.repeat(60));
        this.results.forEach(log => {
            const icon = log.type === 'success' ? '✅' : log.type === 'error' ? '❌' : 'ℹ️';
            console.log(`${icon} ${log.message}`);
        });

        return {
            total: results.length,
            successful,
            failed,
            results
        };
    }
}

// Auto-Start wenn in Browser
if (typeof window !== 'undefined') {
    // Warte auf coverLetterEditor Initialisierung
    window.addEventListener('load', async () => {
        // Warte zusätzlich auf coverLetterEditor
        let attempts = 0;
        while (typeof window.coverLetterEditor === 'undefined' && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

        if (typeof window.coverLetterEditor !== 'undefined') {
            console.log('🧪 API-Key Tester wird gestartet...');
            const tester = new CoverLetterAPIKeyTester();
            window.apiKeyTester = tester; // Für manuellen Aufruf
            const summary = await tester.runAllTests();
            console.log('\n📊 Test-Zusammenfassung:', summary);
        } else {
            console.warn('⚠️ coverLetterEditor nicht gefunden - Tests können nicht ausgeführt werden');
            console.log('💡 Tipp: Öffne die Browser-Console und führe manuell aus:');
            console.log('   const tester = new CoverLetterAPIKeyTester();');
            console.log('   await tester.runAllTests();');
        }
    });
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoverLetterAPIKeyTester;
}
