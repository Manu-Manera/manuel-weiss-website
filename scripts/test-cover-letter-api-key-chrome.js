/**
 * Chrome Testloop für API-Key Integration Anschreibengenerator
 * Automatisierter Test mit Puppeteer, der alle Szenarien testet und bei Fehlern korrigiert
 */

const puppeteer = require('puppeteer');
const path = require('path');
const config = require('./test-cover-letter-api-key-chrome.config.js');
const TestUtils = require('./test-cover-letter-api-key-chrome-utils.js');

class ChromeAPITestLoop {
    constructor() {
        this.browser = null;
        this.page = null;
        this.utils = new TestUtils(config);
        this.consoleLogs = [];
        this.testResults = [];
        this.iteration = 0;
    }

    async init() {
        console.log('🚀 Initialisiere Chrome Testloop für API-Key Integration...\n');
        
        const launchOptions = {
            headless: config.headless ? 'new' : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ],
            defaultViewport: config.viewport,
            timeout: config.timeout,
            slowMo: config.slowMo
        };

        this.browser = await puppeteer.launch(launchOptions);
        const context = await this.browser.createBrowserContext();
        this.page = await context.newPage();

        // Console-Logs abfangen
        this.page.on('console', msg => {
            const logEntry = {
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
            };
            this.consoleLogs.push(logEntry);
            
            if (msg.type() === 'error' || msg.text().includes('❌')) {
                console.error(`[Browser ${msg.type()}]:`, msg.text());
            } else if (msg.text().includes('✅') || msg.text().includes('🔑')) {
                console.log(`[Browser ${msg.type()}]:`, msg.text());
            }
        });

        // Page Errors abfangen
        this.page.on('pageerror', error => {
            console.error('[Page Error]:', error.message);
            this.consoleLogs.push({
                type: 'pageerror',
                text: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        });

        // Request/Response Monitoring für API-Calls
        this.page.on('response', async response => {
            const url = response.url();
            if (url.includes('api-settings') || url.includes('openai')) {
                console.log(`[API Call]: ${response.status()} ${url}`);
            }
        });
    }

    async cleanup() {
        if (this.page) {
            await this.page.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }

    /**
     * Szenario 1: Page Load & Initialisierung
     */
    async testScenario1_PageLoad() {
        console.log('\n📋 Szenario 1: Page Load & Initialisierung');
        
        try {
            const url = config.useLocal ? 
                `${config.localUrl}/applications/cover-letter-editor.html` :
                `${config.baseUrl}/applications/cover-letter-editor.html`;
            
            console.log(`   Navigiere zu: ${url}`);
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: config.timeout });
            
            // Warte auf coverLetterEditor Initialisierung
            console.log('   Warte auf coverLetterEditor...');
            await this.page.waitForFunction(
                () => typeof window.coverLetterEditor !== 'undefined',
                { timeout: config.waitTimes.editorInit }
            );
            
            // Prüfe awsAPISettings
            const awsAPISettingsAvailable = await this.page.evaluate(() => {
                return typeof window.awsAPISettings !== 'undefined';
            });
            
            console.log(`   awsAPISettings verfügbar: ${awsAPISettingsAvailable}`);
            
            // Prüfe Console-Logs für Fehler
            const initErrors = this.consoleLogs.filter(log => 
                log.type === 'error' && 
                (log.text.includes('awsAPISettings') || log.text.includes('Initialisierung'))
            );
            
            if (initErrors.length > 0) {
                return {
                    success: false,
                    scenario: 'pageLoad',
                    reason: `Initialisierungsfehler gefunden: ${initErrors.map(e => e.text).join(', ')}`
                };
            }
            
            return {
                success: true,
                scenario: 'pageLoad',
                details: `Page geladen, coverLetterEditor initialisiert, awsAPISettings: ${awsAPISettingsAvailable}`
            };
        } catch (error) {
            await this.utils.takeScreenshot(this.page, 'scenario1-error');
            return {
                success: false,
                scenario: 'pageLoad',
                reason: error.message
            };
        }
    }

    /**
     * Szenario 2: API-Key aus admin_state
     */
    async testScenario2_AdminState() {
        console.log('\n📋 Szenario 2: API-Key aus admin_state');
        
        try {
            // Lösche alle Keys
            await this.utils.clearApiKeys(this.page);
            
            // Setze API-Key in admin_state
            await this.utils.setApiKeyInLocalStorage(this.page, 'admin_state', config.testApiKey);
            
            // Rufe getAPIKey() auf
            const apiKey = await this.page.evaluate(async () => {
                if (typeof window.coverLetterEditor !== 'undefined') {
                    return await window.coverLetterEditor.getAPIKey();
                }
                return null;
            });
            
            // Analysiere Console-Logs
            const recentLogs = this.consoleLogs.slice(-20);
            const analysis = this.utils.analyzeConsoleLogs(recentLogs);
            
            if (apiKey && apiKey.startsWith('sk-') && !apiKey.includes('...')) {
                return {
                    success: true,
                    scenario: 'adminState',
                    details: `API-Key gefunden: ${apiKey.substring(0, 10)}... (Quelle: ${analysis.source})`
                };
            } else {
                return {
                    success: false,
                    scenario: 'adminState',
                    reason: `API-Key nicht gefunden. Analysis: ${JSON.stringify(analysis)}`
                };
            }
        } catch (error) {
            await this.utils.takeScreenshot(this.page, 'scenario2-error');
            return {
                success: false,
                scenario: 'adminState',
                reason: error.message
            };
        }
    }

    /**
     * Szenario 3: API-Key aus global_api_keys
     */
    async testScenario3_GlobalApiKeys() {
        console.log('\n📋 Szenario 3: API-Key aus global_api_keys');
        
        try {
            // Lösche alle Keys
            await this.utils.clearApiKeys(this.page);
            
            // Setze API-Key in global_api_keys
            await this.utils.setApiKeyInLocalStorage(this.page, 'global_api_keys', config.testApiKey);
            
            // Rufe getAPIKey() auf
            const apiKey = await this.page.evaluate(async () => {
                if (typeof window.coverLetterEditor !== 'undefined') {
                    return await window.coverLetterEditor.getAPIKey();
                }
                return null;
            });
            
            // Analysiere Console-Logs
            const recentLogs = this.consoleLogs.slice(-20);
            const analysis = this.utils.analyzeConsoleLogs(recentLogs);
            
            if (apiKey && apiKey.startsWith('sk-') && !apiKey.includes('...')) {
                return {
                    success: true,
                    scenario: 'globalApiKeys',
                    details: `API-Key gefunden: ${apiKey.substring(0, 10)}... (Quelle: ${analysis.source})`
                };
            } else {
                return {
                    success: false,
                    scenario: 'globalApiKeys',
                    reason: `API-Key nicht gefunden. Analysis: ${JSON.stringify(analysis)}`
                };
            }
        } catch (error) {
            await this.utils.takeScreenshot(this.page, 'scenario3-error');
            return {
                success: false,
                scenario: 'globalApiKeys',
                reason: error.message
            };
        }
    }

    /**
     * Szenario 4: API-Key über awsAPISettings
     */
    async testScenario4_AwsApiSettings() {
        console.log('\n📋 Szenario 4: API-Key über awsAPISettings');
        
        try {
            // Lösche alle Keys
            await this.utils.clearApiKeys(this.page);
            
            // Mocke awsAPISettings.getFullApiKey()
            await this.page.evaluate((testApiKey) => {
                if (window.awsAPISettings) {
                    const originalGetFullApiKey = window.awsAPISettings.getFullApiKey.bind(window.awsAPISettings);
                    window.awsAPISettings.getFullApiKey = async function(provider, useGlobal) {
                        if (provider === 'openai' && useGlobal) {
                            return testApiKey;
                        }
                        return originalGetFullApiKey(provider, useGlobal);
                    };
                }
            }, config.testApiKey);
            
            // Rufe getAPIKey() auf
            const apiKey = await this.page.evaluate(async () => {
                if (typeof window.coverLetterEditor !== 'undefined') {
                    return await window.coverLetterEditor.getAPIKey();
                }
                return null;
            });
            
            // Analysiere Console-Logs
            const recentLogs = this.consoleLogs.slice(-20);
            const analysis = this.utils.analyzeConsoleLogs(recentLogs);
            
            if (apiKey && apiKey.startsWith('sk-') && !apiKey.includes('...')) {
                return {
                    success: true,
                    scenario: 'awsApiSettings',
                    details: `API-Key gefunden: ${apiKey.substring(0, 10)}... (Quelle: ${analysis.source})`
                };
            } else {
                return {
                    success: false,
                    scenario: 'awsApiSettings',
                    reason: `API-Key nicht gefunden. Analysis: ${JSON.stringify(analysis)}`
                };
            }
        } catch (error) {
            await this.utils.takeScreenshot(this.page, 'scenario4-error');
            return {
                success: false,
                scenario: 'awsApiSettings',
                reason: error.message
            };
        }
    }

    /**
     * Szenario 5: Vollständiger Generierungs-Flow
     */
    async testScenario5_FullGeneration() {
        console.log('\n📋 Szenario 5: Vollständiger Generierungs-Flow');
        
        try {
            // Setze API-Key
            await this.utils.setApiKeyInLocalStorage(this.page, 'admin_state', config.testApiKey);
            
            // Fülle Formular aus
            console.log('   Fülle Formular aus...');
            await this.utils.fillForm(this.page, config.testData);
            
            // Klicke "Anschreiben generieren"
            console.log('   Klicke "Anschreiben generieren"...');
            await this.page.click('#generateBtn');
            
            // Warte auf Generierung
            console.log('   Warte auf Generierung...');
            await new Promise(resolve => setTimeout(resolve, config.waitTimes.generation));
            
            // Prüfe Console-Logs für API-Key-Suche
            const recentLogs = this.consoleLogs.slice(-50);
            const analysis = this.utils.analyzeConsoleLogs(recentLogs);
            
            // Prüfe Toast-Messages
            const toastNoKey = await this.utils.checkToastMessage(
                this.page, 
                'Kein API-Key gefunden', 
                config.waitTimes.toastMessage
            );
            
            const toastSuccess = await this.utils.checkToastMessage(
                this.page,
                'Anschreiben erfolgreich generiert',
                config.waitTimes.toastMessage
            );
            
            // Prüfe ob Anschreiben generiert wurde
            const letterCheck = await this.utils.checkGeneratedLetter(this.page);
            
            if (toastNoKey && !analysis.apiKeyFound) {
                return {
                    success: false,
                    scenario: 'generation',
                    reason: 'API-Key wurde nicht gefunden, Template verwendet',
                    details: `Toast: "Kein API-Key gefunden", Analysis: ${JSON.stringify(analysis)}`
                };
            }
            
            if (!letterCheck.success) {
                return {
                    success: false,
                    scenario: 'generation',
                    reason: letterCheck.reason
                };
            }
            
            return {
                success: true,
                scenario: 'generation',
                details: `Anschreiben generiert (${letterCheck.isAI ? 'AI' : 'Template'}), Länge: ${letterCheck.length} Zeichen, API-Key gefunden: ${analysis.apiKeyFound}`
            };
        } catch (error) {
            await this.utils.takeScreenshot(this.page, 'scenario5-error');
            return {
                success: false,
                scenario: 'generation',
                reason: error.message
            };
        }
    }

    /**
     * Szenario 6: Fehlerhafte Keys
     */
    async testScenario6_InvalidKeys() {
        console.log('\n📋 Szenario 6: Fehlerhafte Keys');
        
        try {
            // Teste maskierten Key
            await this.utils.clearApiKeys(this.page);
            await this.utils.setApiKeyInLocalStorage(this.page, 'global_api_keys', 'sk-test...masked');
            
            const maskedKeyResult = await this.page.evaluate(async () => {
                if (typeof window.coverLetterEditor !== 'undefined') {
                    return await window.coverLetterEditor.getAPIKey();
                }
                return null;
            });
            
            if (maskedKeyResult && maskedKeyResult.includes('...')) {
                return {
                    success: false,
                    scenario: 'invalidKeys',
                    reason: 'Maskierter Key wurde zurückgegeben'
                };
            }
            
            // Teste ungültigen Key (ohne "sk-" Präfix)
            await this.utils.setApiKeyInLocalStorage(this.page, 'global_api_keys', 'invalid-key-123');
            
            const invalidKeyResult = await this.page.evaluate(async () => {
                if (typeof window.coverLetterEditor !== 'undefined') {
                    return await window.coverLetterEditor.getAPIKey();
                }
                return null;
            });
            
            if (invalidKeyResult && !invalidKeyResult.startsWith('sk-')) {
                return {
                    success: false,
                    scenario: 'invalidKeys',
                    reason: 'Ungültiger Key wurde zurückgegeben'
                };
            }
            
            return {
                success: true,
                scenario: 'invalidKeys',
                details: 'Maskierte und ungültige Keys wurden korrekt ignoriert'
            };
        } catch (error) {
            await this.utils.takeScreenshot(this.page, 'scenario6-error');
            return {
                success: false,
                scenario: 'invalidKeys',
                reason: error.message
            };
        }
    }

    /**
     * Szenario 7: Timing-Tests
     */
    async testScenario7_Timing() {
        console.log('\n📋 Szenario 7: Timing-Tests');
        
        try {
            // Setze API-Key
            await this.utils.setApiKeyInLocalStorage(this.page, 'admin_state', config.testApiKey);
            
            // Messung der getAPIKey() Ausführungszeit
            const timing = await this.page.evaluate(async () => {
                if (typeof window.coverLetterEditor !== 'undefined') {
                    const start = performance.now();
                    const key = await window.coverLetterEditor.getAPIKey();
                    const duration = performance.now() - start;
                    return { key: key ? key.substring(0, 10) : null, duration };
                }
                return { key: null, duration: 0 };
            });
            
            if (!timing.key) {
                return {
                    success: false,
                    scenario: 'timing',
                    reason: 'API-Key wurde nicht gefunden'
                };
            }
            
            if (timing.duration > 5000) {
                return {
                    success: false,
                    scenario: 'timing',
                    reason: `getAPIKey() dauerte zu lange: ${timing.duration}ms`
                };
            }
            
            return {
                success: true,
                scenario: 'timing',
                details: `API-Key gefunden in ${timing.duration.toFixed(0)}ms`
            };
        } catch (error) {
            await this.utils.takeScreenshot(this.page, 'scenario7-error');
            return {
                success: false,
                scenario: 'timing',
                reason: error.message
            };
        }
    }

    /**
     * Führt alle Tests aus
     */
    async runAllTests() {
        this.testResults = [];
        this.consoleLogs = [];
        
        const tests = [
            () => this.testScenario1_PageLoad(),
            () => this.testScenario2_AdminState(),
            () => this.testScenario3_GlobalApiKeys(),
            () => this.testScenario4_AwsApiSettings(),
            () => this.testScenario5_FullGeneration(),
            () => this.testScenario6_InvalidKeys(),
            () => this.testScenario7_Timing()
        ];

        for (const test of tests) {
            const result = await test();
            this.testResults.push(result);
            
            // Kurze Pause zwischen Tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return this.testResults;
    }

    /**
     * Haupt-Loop
     */
    async runLoop() {
        const args = process.argv.slice(2);
        const useLoop = args.includes('--loop');
        const maxIterations = useLoop ? config.maxIterations : 1;
        
        let allTestsPassed = false;
        this.iteration = 0;

        while (!allTestsPassed && this.iteration < maxIterations) {
            this.iteration++;
            console.log(`\n${'='.repeat(60)}`);
            console.log(`=== ITERATION ${this.iteration}/${maxIterations} ===`);
            console.log('='.repeat(60));
            
            // Initialisiere Browser
            await this.init();
            
            try {
                // Führe Tests aus
                const results = await this.runAllTests();
                
                // Analysiere Ergebnisse
                const failedTests = results.filter(r => !r.success);
                const passedTests = results.filter(r => r.success);
                
                console.log(`\n📊 Ergebnisse: ${passedTests.length}/${results.length} Tests erfolgreich`);
                
                if (failedTests.length === 0) {
                    allTestsPassed = true;
                    console.log('✅ Alle Tests erfolgreich!');
                } else {
                    console.log(`❌ ${failedTests.length} Tests fehlgeschlagen:`);
                    failedTests.forEach(test => {
                        console.log(`   - ${test.scenario}: ${test.reason}`);
                    });
                    
                    // Analysiere Fehler
                    const fixes = this.utils.analyzeFailures(failedTests, this.consoleLogs);
                    
                    if (fixes.length > 0 && useLoop) {
                        console.log(`\n🔧 Wende ${fixes.length} Korrekturen an...`);
                        const appliedFixes = await this.utils.applyFixes(fixes);
                        
                        if (appliedFixes.length > 0) {
                            console.log(`✅ ${appliedFixes.length} Korrekturen angewendet`);
                            
                            // Deploye
                            const deployed = await this.utils.deploy();
                            
                            if (deployed) {
                                // Warte auf CloudFront
                                await this.utils.waitForCloudFront(config.cloudFrontWaitTime);
                                
                                // Reload Page für neue Version
                                await this.page.reload({ waitUntil: 'networkidle2' });
                                
                                // Warte kurz auf Re-Initialisierung
                                await new Promise(resolve => setTimeout(resolve, 3000));
                            }
                        }
                    } else if (!useLoop) {
                        console.log('\n⚠️ Loop-Modus nicht aktiviert - keine automatischen Korrekturen');
                    }
                }
                
                // Erstelle Report
                this.utils.createReport(results, this.iteration);
                this.utils.saveConsoleLogs(this.consoleLogs, `iteration-${this.iteration}`);
                
            } catch (error) {
                console.error('❌ Fehler im Testloop:', error);
                await this.utils.takeScreenshot(this.page, 'loop-error');
            } finally {
                await this.cleanup();
            }
        }

        if (!allTestsPassed && this.iteration >= maxIterations) {
            console.log(`\n⚠️ Maximale Iterationen (${maxIterations}) erreicht`);
            console.log('Bitte manuell prüfen und korrigieren');
        }

        return allTestsPassed;
    }
}

// Haupt-Ausführung
(async () => {
    const tester = new ChromeAPITestLoop();
    
    try {
        const success = await tester.runLoop();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('❌ Fataler Fehler:', error);
        process.exit(1);
    }
})();
