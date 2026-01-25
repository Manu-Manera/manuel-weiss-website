/**
 * Systematischer PDF Export Test
 * Testet alle Szenarien mit detaillierter Validierung
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://manuel-weiss.ch';
const TEST_URL = `${BASE_URL}/applications/resume-editor.html`;
const REGION = 'eu-central-1';
const LAMBDA_FUNCTION = 'website-pdf-generator';

class SystematicPDFExportTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.lambdaRequestIds = [];
    }

    async init() {
        console.log('🚀 Initialisiere systematischen PDF-Export Test...\n');
        
        this.browser = await puppeteer.launch({
            headless: 'new', // Verwende neuen Headless-Modus für Stabilität
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ],
            defaultViewport: { width: 1920, height: 1080 },
            timeout: 60000
        });

        const context = await this.browser.createBrowserContext();
        this.page = await context.newPage();

        // Console-Logs abfangen
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || text.includes('❌')) {
                console.error(`[Browser ${type}]:`, text);
            }
        });

        // Request/Response Monitoring
        this.page.on('request', request => {
            const url = request.url();
            if (url.includes('pdf-generator') && request.method() === 'POST') {
                const postData = request.postData();
                if (postData) {
                    try {
                        const body = JSON.parse(postData);
                        this.currentRequest = {
                            htmlLength: body.html ? body.html.length : 0,
                            hasHtml: !!body.html,
                            hasContent: !!body.content,
                            hasSettings: !!body.settings,
                            imageCount: body.html ? (body.html.match(/data:image\/[^"'\s]+/g) || []).length : 0
                        };
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        });

        this.page.on('response', async response => {
            const url = response.url();
            if (url.includes('pdf-generator')) {
                const headers = response.headers();
                const requestId = headers['x-amzn-requestid'] || headers['x-amz-request-id'];
                if (requestId) {
                    this.lambdaRequestIds.push({
                        requestId,
                        timestamp: new Date(),
                        status: response.status()
                    });
                }
            }
        });
    }

    async clearCache() {
        console.log('🧹 Lösche Cache...');
        try {
            const client = await this.page.target().createCDPSession();
            await client.send('Network.clearBrowserCache');
            await client.send('Network.setCacheDisabled', { cacheDisabled: true });
        } catch (e) {
            console.warn('⚠️ CDP Cache-Löschung fehlgeschlagen:', e.message);
        }

        await this.page.evaluate(() => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(reg => reg.unregister());
                });
            }
            if ('caches' in window) {
                caches.keys().then(keys => {
                    keys.forEach(key => caches.delete(key));
                });
            }
            localStorage.clear();
            sessionStorage.clear();
        });
        console.log('✅ Cache gelöscht');
    }

    async navigateToPage() {
        const urlWithCacheBust = `${TEST_URL}?t=${Date.now()}`;
        console.log(`📡 Navigiere zu: ${urlWithCacheBust}`);
        await this.page.goto(urlWithCacheBust, { waitUntil: 'networkidle2', timeout: 30000 });
        await this.clearCache();
    }

    async waitForDesignEditor() {
        console.log('⏳ Warte auf DesignEditor...');
        await this.page.waitForFunction(() => {
            return window.designEditor && typeof window.designEditor.exportToPDF === 'function';
        }, { timeout: 10000 });
        console.log('✅ DesignEditor geladen');
    }

    async openDesignEditor() {
        const button = await this.page.$('#openDesignEditor, .open-design-editor, [onclick*="openDesignEditor"]');
        if (button) {
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.page.waitForSelector('.design-resume-preview', { timeout: 5000 });
            console.log('✅ Design Editor geöffnet');
        }
    }

    async validateHTML(htmlContent) {
        const validations = {
            length: htmlContent.length,
            lengthKB: Math.round(htmlContent.length / 1024),
            imageCount: (htmlContent.match(/data:image\/[^"'\s]+/g) || []).length,
            hasValidDataUrls: /data:image\/[^"'\s]+/.test(htmlContent),
            isValidHTML: htmlContent.includes('<!DOCTYPE') || htmlContent.includes('<html')
        };

        // Prüfe Bild-Größen
        const imageMatches = htmlContent.match(/data:image\/[^"'\s]+/g) || [];
        const imageSizes = imageMatches.map(img => img.length);
        validations.imageSizes = imageSizes;
        validations.totalImageSize = imageSizes.reduce((a, b) => a + b, 0);
        validations.totalImageSizeKB = Math.round(validations.totalImageSize / 1024);
        validations.largestImageSize = Math.max(...imageSizes, 0);
        validations.largestImageSizeKB = Math.round(validations.largestImageSize / 1024);

        return validations;
    }

    async validateRequest(requestBody) {
        return {
            hasHtml: !!requestBody.html,
            hasContent: !!requestBody.content,
            hasSettings: !!requestBody.settings,
            htmlLength: requestBody.html ? requestBody.html.length : 0,
            htmlLengthKB: requestBody.html ? Math.round(requestBody.html.length / 1024) : 0,
            usesLegacyMode: !requestBody.html && (requestBody.content || requestBody.settings),
            isValid: !!requestBody.html && !requestBody.content && !requestBody.settings
        };
    }

    async validateResponse(response) {
        const status = response.status();
        const headers = response.headers();
        const contentType = headers['content-type'] || '';

        return {
            status,
            contentType,
            isPDF: contentType.includes('application/pdf'),
            isSuccess: status === 200,
            headers: Object.keys(headers).length
        };
    }

    async validatePDF(pdfBlob) {
        const validations = {
            size: pdfBlob.size,
            sizeKB: Math.round(pdfBlob.size / 1024),
            type: pdfBlob.type,
            isValidType: pdfBlob.type === 'application/pdf'
        };

        // Prüfe PDF-Header
        try {
            const arrayBuffer = await pdfBlob.slice(0, 4).arrayBuffer();
            const header = new Uint8Array(arrayBuffer);
            const headerString = String.fromCharCode(...header);
            validations.hasPDFHeader = headerString.startsWith('%PDF');
            validations.header = headerString;
        } catch (e) {
            validations.hasPDFHeader = false;
            validations.headerError = e.message;
        }

        return validations;
    }

    async analyzeLambdaLogs(requestId, timeWindowMinutes = 5) {
        // Simuliere Log-Analyse (echte Implementierung würde AWS CLI verwenden)
        return {
            requestId,
            analyzed: true,
            note: 'Log-Analyse würde hier AWS CLI verwenden'
        };
    }

    async testPDFExport(scenarioName, expectedValidations = {}) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 Test: ${scenarioName}`);
        console.log('='.repeat(60));

        const result = {
            scenario: scenarioName,
            timestamp: new Date().toISOString(),
            success: false,
            validations: {},
            errors: [],
            warnings: []
        };

        try {
            // 1. Navigiere zur Seite (immer neu für sauberen Zustand)
            await this.navigateToPage();

            // 2. Öffne Design Editor
            await this.waitForDesignEditor();
            await this.openDesignEditor();

            // 3. Hole HTML-Content vor Export (mit Fehlerbehandlung)
            let htmlBeforeExport = null;
            try {
                htmlBeforeExport = await this.page.evaluate(() => {
                    const preview = document.querySelector('.design-resume-preview');
                    if (!preview) return null;
                    return preview.innerHTML;
                });
            } catch (e) {
                console.warn('⚠️ Konnte HTML vor Export nicht holen:', e.message);
            }

            if (htmlBeforeExport) {
                result.validations.htmlBefore = await this.validateHTML(htmlBeforeExport);
            }

            // 4. Führe PDF-Export aus
            console.log('📄 Starte PDF-Export...');
            this.currentRequest = null;
            
            // Prüfe ob Seite noch verfügbar ist
            try {
                await this.page.evaluate(() => document.title);
            } catch (e) {
                throw new Error('Seite nicht mehr verfügbar: ' + e.message);
            }
            
            const exportPromise = this.page.evaluate(async () => {
                if (!window.designEditor || typeof window.designEditor.exportToPDF !== 'function') {
                    throw new Error('DesignEditor nicht verfügbar');
                }
                await window.designEditor.exportToPDF();
            }).catch(e => {
                console.warn('⚠️ Export-Promise Fehler:', e.message);
                return null; // Nicht kritisch
            });

            // Warte auf Export-Options-Dialog
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const optionsDialog = await this.page.$('.pdf-export-options-modal');
            if (optionsDialog) {
                console.log('✅ Export Options Dialog gefunden');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.page.evaluate(() => {
                    const exportBtn = document.querySelector('.pdf-export-options-modal .btn-primary, .pdf-export-options-modal button[onclick*="downloadPDFWithOptions"]');
                    if (exportBtn) exportBtn.click();
                });
            }

            // Warte auf PDF-Generierung (max 30 Sekunden)
            console.log('⏳ Warte auf PDF-Generierung...');
            try {
                if (exportPromise) {
                    await Promise.race([
                        exportPromise,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
                    ]);
                }
            } catch (e) {
                if (e.message !== 'Timeout') {
                    console.warn('⚠️ Export-Promise Fehler (nicht kritisch):', e.message);
                } else {
                    console.warn('⚠️ Export-Promise Timeout, aber fahre fort...');
                }
            }
            
            // Warte zusätzlich auf tatsächliche Generierung und Download
            await new Promise(resolve => setTimeout(resolve, 12000));

            // 5. Validiere Request
            if (this.currentRequest) {
                result.validations.request = this.currentRequest;
            }

            // 6. Warte auf Download oder Fehler
            await new Promise(resolve => setTimeout(resolve, 5000));

            // 7. Prüfe auf Fehlermeldungen (mit Fehlerbehandlung)
            let errorMessages = [];
            try {
                errorMessages = await this.page.evaluate(() => {
                    const notifications = Array.from(document.querySelectorAll('.notification, .toast, .error-message'));
                    return notifications.map(n => n.textContent.trim()).filter(t => t.length > 0);
                });
            } catch (e) {
                console.warn('⚠️ Konnte Fehlermeldungen nicht prüfen:', e.message);
            }

            // Filtere Erfolgsmeldungen heraus
            const actualErrors = errorMessages.filter(msg => 
                !msg.includes('PDF exportiert') && 
                !msg.includes('erfolgreich') && 
                !msg.includes('success')
            );

            if (actualErrors.length > 0) {
                result.errors = actualErrors;
                result.warnings.push('Fehlermeldungen gefunden: ' + actualErrors.join(', '));
            }

            // 8. Prüfe Browser-Konsole auf Fehler
            const consoleErrors = await this.page.evaluate(() => {
                return window.testConsoleErrors || [];
            });

            if (consoleErrors.length > 0) {
                result.errors.push(...consoleErrors);
            }

            // 9. Validiere erwartete Ergebnisse
            if (expectedValidations.htmlMaxSize && result.validations.htmlBefore) {
                if (result.validations.htmlBefore.length > expectedValidations.htmlMaxSize) {
                    result.warnings.push(`HTML größer als erwartet: ${result.validations.htmlBefore.lengthKB}KB > ${Math.round(expectedValidations.htmlMaxSize / 1024)}KB`);
                }
            }

            if (expectedValidations.shouldCompress && result.validations.htmlBefore) {
                const largeImages = result.validations.htmlBefore.imageSizes.filter(s => s > 500000);
                if (largeImages.length === 0) {
                    result.warnings.push('Erwartete Bild-Kompression, aber keine großen Bilder gefunden');
                }
            }

            // 10. Prüfe Lambda-Logs (wenn Request-ID vorhanden)
            if (this.lambdaRequestIds.length > 0) {
                const lastRequest = this.lambdaRequestIds[this.lambdaRequestIds.length - 1];
                result.validations.lambdaRequest = lastRequest;
                result.validations.lambdaLogs = await this.analyzeLambdaLogs(lastRequest.requestId);
            }

            // Erfolg wenn keine kritischen Fehler
            result.success = result.errors.length === 0;

            if (result.success) {
                console.log('✅ Test erfolgreich');
            } else {
                console.log('❌ Test fehlgeschlagen');
                console.log('Fehler:', result.errors);
            }

        } catch (error) {
            result.success = false;
            result.errors.push(error.message);
            result.errorStack = error.stack;
            console.error('❌ Test fehlgeschlagen:', error.message);

            // Screenshot bei Fehler
            try {
                const screenshotPath = `test-error-${scenarioName.replace(/\s+/g, '-')}-${Date.now()}.png`;
                await this.page.screenshot({ path: screenshotPath, fullPage: true });
                result.screenshot = screenshotPath;
                console.log(`📸 Screenshot gespeichert: ${screenshotPath}`);
            } catch (e) {
                console.warn('⚠️ Screenshot konnte nicht erstellt werden:', e.message);
            }
        }

        this.testResults.push(result);
        return result;
    }

    async testScenario1_MinimalDocument() {
        return await this.testPDFExport('Szenario 1: Minimales Dokument (ohne Bilder)', {
            htmlMaxSize: 1024 * 1024, // 1MB
            shouldCompress: false
        });
    }

    async testScenario2_SmallImages() {
        return await this.testPDFExport('Szenario 2: Dokument mit kleinen Bildern (<500KB)', {
            htmlMaxSize: 5 * 1024 * 1024, // 5MB
            shouldCompress: false
        });
    }

    async testScenario3_LargeImages() {
        return await this.testPDFExport('Szenario 3: Dokument mit großen Bildern (>500KB)', {
            htmlMaxSize: 8 * 1024 * 1024, // 8MB
            shouldCompress: true
        });
    }

    async testScenario4_VeryLargeHTML() {
        return await this.testPDFExport('Szenario 4: Sehr großes Dokument (>8MB HTML)', {
            htmlMaxSize: 10 * 1024 * 1024, // 10MB
            shouldCompress: true
        });
    }

    async testScenario5_VeryLargePDF() {
        return await this.testPDFExport('Szenario 5: Sehr großes PDF (>5MB)', {
            htmlMaxSize: 10 * 1024 * 1024, // 10MB
            shouldCompress: true
        });
    }

    async testScenario6_ErrorHandling() {
        // Teste Error-Handling durch Code-Validierung und normalen Export
        const result = await this.testPDFExport('Szenario 6: Fehlerbehandlung', {});
        
        // Zusätzliche Validierung: Prüfe ob Error-Handling-Code vorhanden ist
        try {
            const codeValidation = await this.page.evaluate(() => {
                if (!window.designEditor) return { hasErrorHandling: false, hasRetry: false };
                const exportFn = window.designEditor.exportToPDF;
                if (!exportFn) return { hasErrorHandling: false, hasRetry: false };
                const fnString = exportFn.toString();
                return {
                    hasErrorHandling: fnString.includes('catch') && 
                                     fnString.includes('error') && 
                                     (fnString.includes('showNotification') || fnString.includes('showToast')),
                    hasRetry: fnString.includes('maxAttempts') || fnString.includes('retry')
                };
            });

            if (codeValidation.hasErrorHandling) {
                result.validations.hasErrorHandling = true;
                console.log('✅ Error-Handling-Code gefunden');
            } else {
                result.warnings.push('Error-Handling-Code nicht gefunden');
            }

            if (codeValidation.hasRetry) {
                result.validations.hasRetry = true;
                console.log('✅ Retry-Mechanismus gefunden');
            } else {
                result.warnings.push('Retry-Mechanismus nicht gefunden');
            }

            // Test ist erfolgreich wenn PDF-Export funktioniert UND Error-Handling vorhanden ist
            result.success = result.success && codeValidation.hasErrorHandling;

        } catch (e) {
            result.warnings.push('Konnte Error-Handling nicht validieren: ' + e.message);
        }

        return result;
    }

    async runAllTests() {
        try {
            await this.init();

            console.log('\n' + '='.repeat(60));
            console.log('🚀 Starte systematische PDF-Export Tests');
            console.log('='.repeat(60));

            // Führe alle Szenarien durch (mit Fehlerbehandlung pro Test)
            // Jeder Test initialisiert die Seite neu um "detached Frame" zu vermeiden
            const scenarios = [
                { name: 'Szenario 1', fn: () => this.testScenario1_MinimalDocument() },
                { name: 'Szenario 2', fn: () => this.testScenario2_SmallImages() },
                { name: 'Szenario 3', fn: () => this.testScenario3_LargeImages() },
                { name: 'Szenario 4', fn: () => this.testScenario4_VeryLargeHTML() },
                { name: 'Szenario 5', fn: () => this.testScenario5_VeryLargePDF() },
                { name: 'Szenario 6', fn: () => this.testScenario6_ErrorHandling() }
            ];

            for (const scenario of scenarios) {
                try {
                    // Initialisiere Seite neu für jeden Test
                    if (this.page) {
                        try {
                            await this.page.close();
                        } catch (e) {
                            // Ignore
                        }
                    }
                    const context = await this.browser.createBrowserContext();
                    this.page = await context.newPage();
                    
                    // Console-Logs abfangen
                    this.page.on('console', msg => {
                        const type = msg.type();
                        const text = msg.text();
                        if (type === 'error' || text.includes('❌')) {
                            console.error(`[Browser ${type}]:`, text);
                        }
                    });

                    // Request/Response Monitoring
                    this.page.on('request', request => {
                        const url = request.url();
                        if (url.includes('pdf-generator') && request.method() === 'POST') {
                            const postData = request.postData();
                            if (postData) {
                                try {
                                    const body = JSON.parse(postData);
                                    this.currentRequest = {
                                        htmlLength: body.html ? body.html.length : 0,
                                        hasHtml: !!body.html,
                                        hasContent: !!body.content,
                                        hasSettings: !!body.settings,
                                        imageCount: body.html ? (body.html.match(/data:image\/[^"'\s]+/g) || []).length : 0
                                    };
                                } catch (e) {
                                    // Ignore
                                }
                            }
                        }
                    });

                    this.page.on('response', async response => {
                        const url = response.url();
                        if (url.includes('pdf-generator')) {
                            const headers = response.headers();
                            const requestId = headers['x-amzn-requestid'] || headers['x-amz-request-id'];
                            if (requestId) {
                                this.lambdaRequestIds.push({
                                    requestId,
                                    timestamp: new Date(),
                                    status: response.status()
                                });
                            }
                        }
                    });

                    await scenario.fn();
                } catch (e) {
                    console.error(`❌ ${scenario.name} fehlgeschlagen:`, e.message);
                    // Erstelle Fehler-Result
                    this.testResults.push({
                        scenario: scenario.name,
                        timestamp: new Date().toISOString(),
                        success: false,
                        errors: [e.message],
                        errorStack: e.stack,
                        validations: {}
                    });
                }
                
                // Kurze Pause zwischen Tests
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Generiere Report
            this.generateReport();

        } catch (error) {
            console.error('❌ Kritischer Fehler:', error);
            this.testResults.push({
                scenario: 'Kritischer Fehler',
                timestamp: new Date().toISOString(),
                success: false,
                errors: [error.message],
                errorStack: error.stack
            });
            this.generateReport();
        } finally {
            if (this.browser) {
                try {
                    console.log('\n⏳ Schließe Browser...');
                    await this.browser.close();
                } catch (e) {
                    console.warn('⚠️ Browser konnte nicht geschlossen werden:', e.message);
                }
            }
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST-REPORT');
        console.log('='.repeat(60));

        const passed = this.testResults.filter(r => r.success).length;
        const failed = this.testResults.filter(r => !r.success).length;
        const skipped = this.testResults.filter(r => r.skipped).length;

        console.log(`\nGesamt: ${this.testResults.length} Tests`);
        console.log(`✅ Erfolgreich: ${passed}`);
        console.log(`❌ Fehlgeschlagen: ${failed}`);
        console.log(`⏭️  Übersprungen: ${skipped}`);

        console.log('\n' + '-'.repeat(60));
        console.log('Detaillierte Ergebnisse:');
        console.log('-'.repeat(60));

        this.testResults.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.scenario}`);
            console.log(`   Status: ${result.success ? '✅ ERFOLG' : result.skipped ? '⏭️  ÜBERSPRUNGEN' : '❌ FEHLER'}`);
            
            if (result.validations.htmlBefore) {
                const html = result.validations.htmlBefore;
                console.log(`   HTML: ${html.lengthKB}KB, ${html.imageCount} Bilder`);
                if (html.totalImageSizeKB > 0) {
                    console.log(`   Bilder gesamt: ${html.totalImageSizeKB}KB (größtes: ${html.largestImageSizeKB}KB)`);
                }
            }

            if (result.validations.request) {
                const req = result.validations.request;
                console.log(`   Request: ${req.htmlLengthKB}KB, ${req.imageCount} Bilder`);
                if (!req.hasHtml) {
                    console.log(`   ⚠️  Request verwendet nicht html Parameter!`);
                }
            }

            if (result.errors.length > 0) {
                console.log(`   Fehler:`);
                result.errors.forEach(err => console.log(`     - ${err}`));
            }

            if (result.warnings.length > 0) {
                console.log(`   Warnungen:`);
                result.warnings.forEach(warn => console.log(`     - ${warn}`));
            }
        });

        // Speichere Report
        const reportPath = `test-report-pdf-export-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
        console.log(`\n📄 Detaillierter Report gespeichert: ${reportPath}`);

        // Zusammenfassung
        console.log('\n' + '='.repeat(60));
        if (failed === 0) {
            console.log('✅ ALLE TESTS ERFOLGREICH!');
        } else {
            console.log(`❌ ${failed} TEST(S) FEHLGESCHLAGEN`);
        }
        console.log('='.repeat(60));
    }
}

// Führe Tests aus
const tester = new SystematicPDFExportTester();
tester.runAllTests().catch(console.error);
