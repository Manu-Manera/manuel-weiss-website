/**
 * Helper-Funktionen für Chrome Testloop
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestUtils {
    constructor(config) {
        this.config = config;
        this.reportDir = path.join(__dirname, '..', 'test-reports');
        this.ensureReportDir();
    }

    ensureReportDir() {
        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir, { recursive: true });
        }
    }

    /**
     * Analysiert Console-Logs für API-Key-Erkennung
     */
    analyzeConsoleLogs(logs) {
        const analysis = {
            apiKeyFound: false,
            source: null,
            errors: [],
            warnings: [],
            timing: null
        };

        for (const log of logs) {
            const text = log.text || '';
            
            // Erfolgreiche Key-Erkennung
            if (text.includes('✅ API-Key über') || text.includes('✅ API-Key aus')) {
                analysis.apiKeyFound = true;
                // Extrahiere Quelle
                if (text.includes('awsAPISettings')) {
                    analysis.source = 'awsAPISettings';
                } else if (text.includes('admin_state')) {
                    analysis.source = 'admin_state';
                } else if (text.includes('global_api_keys')) {
                    analysis.source = 'global_api_keys';
                } else if (text.includes('direkten API-Call')) {
                    analysis.source = 'directApiCall';
                } else if (text.includes('globalApiManager')) {
                    analysis.source = 'globalApiManager';
                }
                
                // Extrahiere Timing
                const timingMatch = text.match(/(\d+)ms/);
                if (timingMatch) {
                    analysis.timing = parseInt(timingMatch[1]);
                }
            }
            
            // Fehler
            if (text.includes('❌') || log.type === 'error') {
                analysis.errors.push(text);
            }
            
            // Warnungen
            if (text.includes('⚠️') || text.includes('Kein API-Key gefunden') || log.type === 'warning') {
                analysis.warnings.push(text);
            }
        }

        return analysis;
    }

    /**
     * Prüft ob Toast-Message erscheint
     */
    async checkToastMessage(page, expectedText, timeout = 5000) {
        try {
            // Warte auf Toast-Container
            await page.waitForSelector('#toastContainer, [id*="toast"], .toast', { timeout: 2000 }).catch(() => {});
            
            const found = await page.waitForFunction(
                (text) => {
                    // Prüfe Toast-Container
                    const container = document.getElementById('toastContainer');
                    if (container) {
                        const toasts = container.querySelectorAll('.toast, [class*="toast"], div');
                        for (const toast of toasts) {
                            if (toast.textContent && toast.textContent.includes(text)) {
                                return true;
                            }
                        }
                    }
                    
                    // Prüfe alle Toast-Elemente
                    const allToasts = document.querySelectorAll('.toast, [class*="toast"], [id*="toast"]');
                    for (const toast of allToasts) {
                        if (toast.textContent && toast.textContent.includes(text)) {
                            return true;
                        }
                    }
                    
                    // Prüfe auch in body für dynamisch erstellte Toasts
                    const bodyText = document.body.textContent || '';
                    if (bodyText.includes(text)) {
                        // Prüfe ob es ein Toast ist (nicht nur zufälliger Text)
                        const toastElements = document.querySelectorAll('[class*="notification"], [class*="alert"], [class*="message"]');
                        for (const element of toastElements) {
                            if (element.textContent && element.textContent.includes(text)) {
                                return true;
                            }
                        }
                    }
                    
                    return false;
                },
                { timeout },
                expectedText
            );
            return found;
        } catch (e) {
            // Prüfe auch in Console-Logs als Fallback
            return false;
        }
    }

    /**
     * Prüft ob Anschreiben generiert wurde
     */
    async checkGeneratedLetter(page) {
        try {
            // Warte kurz auf mögliche Generierung
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Suche nach generiertem Anschreiben-Text
            const letterData = await page.evaluate(() => {
                // Verschiedene Selektoren versuchen
                const selectors = [
                    '.generated-letter',
                    '[class*="generated"]',
                    '[id*="letter"]',
                    '.letter-content',
                    '#letterContent',
                    '[class*="cover-letter"]',
                    '.editor-content'
                ];
                
                let letterElement = null;
                for (const selector of selectors) {
                    letterElement = document.querySelector(selector);
                    if (letterElement && letterElement.textContent && letterElement.textContent.trim().length > 50) {
                        break;
                    }
                }
                
                // Falls nicht gefunden, suche nach Text-Content im Editor-Bereich
                if (!letterElement || !letterElement.textContent || letterElement.textContent.trim().length < 50) {
                    const editorArea = document.querySelector('.cover-letter-editor, main, [class*="editor"]');
                    if (editorArea) {
                        const text = editorArea.textContent || '';
                        if (text.length > 50 && (text.includes('Sehr geehrte') || text.includes('Bewerbung'))) {
                            return {
                                text: text,
                                found: true
                            };
                        }
                    }
                }
                
                return {
                    text: letterElement ? letterElement.textContent : null,
                    found: letterElement !== null
                };
            });

            if (!letterData.found || !letterData.text || letterData.text.trim().length < 50) {
                return { success: false, reason: 'Kein Anschreiben-Text gefunden oder zu kurz' };
            }

            const letterText = letterData.text.trim();
            
            // Prüfe ob Template oder AI verwendet wurde
            // Template hat typischerweise kürzere, generische Texte
            const isTemplate = (letterText.includes('Sehr geehrte') || letterText.includes('Guten Tag')) && letterText.length < 800;
            const isAI = letterText.length > 500 && !isTemplate;

            return {
                success: true,
                text: letterText.substring(0, 200),
                isTemplate,
                isAI,
                length: letterText.length
            };
        } catch (e) {
            return { success: false, reason: e.message };
        }
    }

    /**
     * Setzt API-Key in localStorage
     */
    async setApiKeyInLocalStorage(page, source, apiKey) {
        await page.evaluate((source, apiKey) => {
            switch (source) {
                case 'admin_state':
                    const adminState = {
                        services: {
                            openai: {
                                key: apiKey
                            }
                        }
                    };
                    localStorage.setItem('admin_state', JSON.stringify(adminState));
                    break;
                case 'global_api_keys':
                    const globalKeys = {
                        openai: {
                            key: apiKey
                        }
                    };
                    localStorage.setItem('global_api_keys', JSON.stringify(globalKeys));
                    break;
                case 'openai_api_key':
                    localStorage.setItem('openai_api_key', apiKey);
                    break;
            }
        }, source, apiKey);
    }

    /**
     * Löscht alle API-Keys aus localStorage
     */
    async clearApiKeys(page) {
        await page.evaluate(() => {
            localStorage.removeItem('admin_state');
            localStorage.removeItem('global_api_keys');
            localStorage.removeItem('openai_api_key');
        });
    }

    /**
     * Füllt Formular aus
     */
    async fillForm(page, testData) {
        const fields = {
            'companyName': testData.company,
            'jobTitle': testData.position,
            'jobDescription': testData.jobDescription,
            'contactPerson': testData.contactPerson
        };

        // Pflichtfelder
        for (const [id, value] of Object.entries(fields)) {
            try {
                await page.waitForSelector(`#${id}`, { timeout: 2000 });
                // Lösche vorhandenen Wert
                await page.click(`#${id}`, { clickCount: 3 });
                await page.type(`#${id}`, value, { delay: 50 });
            } catch (e) {
                console.warn(`⚠️ Feld #${id} nicht gefunden oder nicht editierbar`);
            }
        }

        // Optionale Felder (können verschiedene IDs haben)
        const optionalFields = [
            { id: 'firstName', value: testData.firstName },
            { id: 'lastName', value: testData.lastName },
            { id: 'location', value: testData.location },
            { name: 'firstName', value: testData.firstName },
            { name: 'lastName', value: testData.lastName },
            { name: 'location', value: testData.location }
        ];

        for (const field of optionalFields) {
            try {
                const selector = field.id ? `#${field.id}` : `[name="${field.name}"]`;
                await page.waitForSelector(selector, { timeout: 1000 });
                await page.click(selector, { clickCount: 3 });
                await page.type(selector, field.value, { delay: 50 });
            } catch (e) {
                // Ignoriere - Feld ist optional
            }
        }
    }

    /**
     * Erstellt Screenshot
     */
    async takeScreenshot(page, filename) {
        if (!this.config.screenshotOnFailure) return;
        
        const screenshotPath = path.join(this.reportDir, `${filename}-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        return screenshotPath;
    }

    /**
     * Speichert Console-Logs
     */
    saveConsoleLogs(logs, filename) {
        if (!this.config.saveConsoleLogs) return;
        
        const logPath = path.join(this.reportDir, `${filename}-${Date.now()}.json`);
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
        return logPath;
    }

    /**
     * Analysiert fehlgeschlagene Tests und identifiziert Korrekturen
     */
    analyzeFailures(failedTests, consoleLogs) {
        const fixes = [];
        const logAnalysis = this.analyzeConsoleLogs(consoleLogs);

        for (const test of failedTests) {
            // Prüfe alle Szenarien die API-Key-Erkennung betreffen
            if (['adminState', 'globalApiKeys', 'awsApiSettings', 'generation'].includes(test.scenario) && !logAnalysis.apiKeyFound) {
                // API-Key wurde nicht gefunden
                const errorText = logAnalysis.errors.join(' ') + ' ' + logAnalysis.warnings.join(' ');
                
                if (errorText.includes('awsAPISettings nicht verfügbar') || errorText.includes('awsAPISettings nach')) {
                    fixes.push({
                        type: 'initialization',
                        file: 'applications/cover-letter-editor.html',
                        description: 'awsAPISettings Initialisierung sicherstellen',
                        code: `if (typeof AWSAPISettingsService !== 'undefined' && !window.awsAPISettings) {
    window.awsAPISettings = new AWSAPISettingsService();
}`,
                        location: 'after aws-api-settings.js script tag'
                    });
                } else if (errorText.includes('nach') && errorText.includes('nicht verfügbar')) {
                    fixes.push({
                        type: 'timing',
                        file: 'applications/js/cover-letter-editor.js',
                        description: 'Wartezeit für awsAPISettings erhöhen',
                        line: '67-79',
                        change: 'maxAttempts von 10 auf 50 erhöhen',
                        search: 'attempts < 10',
                        replace: 'attempts < 50'
                    });
                } else if (!logAnalysis.source) {
                    // Keine Quelle gefunden - möglicherweise fehlt Logging
                    fixes.push({
                        type: 'logging',
                        file: 'applications/js/cover-letter-editor.js',
                        description: 'Detaillierteres Logging in getAPIKey() hinzufügen',
                        suggestion: 'Prüfe ob alle Quellen korrekt geloggt werden'
                    });
                }
            }

            if (test.scenario === 'generation' && test.reason && test.reason.includes('Template')) {
                // Template wurde verwendet statt AI
                if (!logAnalysis.apiKeyFound) {
                    fixes.push({
                        type: 'apiKey',
                        file: 'applications/js/cover-letter-editor.js',
                        description: 'API-Key-Erkennung verbessern',
                        suggestion: 'Prüfe getAPIKey() Implementierung - Key wird nicht gefunden'
                    });
                }
            }

            if (test.scenario === 'timing' && test.reason && test.reason.includes('zu lange')) {
                fixes.push({
                    type: 'performance',
                    file: 'applications/js/cover-letter-editor.js',
                    description: 'Performance-Optimierung für getAPIKey()',
                    suggestion: 'Parallele API-Calls oder frühere Abbruchbedingung'
                });
            }
        }

        return fixes;
    }

    /**
     * Wendet automatische Korrekturen an
     */
    async applyFixes(fixes) {
        const appliedFixes = [];

        for (const fix of fixes) {
            try {
                const filePath = path.join(__dirname, '..', fix.file);
                
                if (!fs.existsSync(filePath)) {
                    console.warn(`⚠️ Datei nicht gefunden: ${filePath}`);
                    continue;
                }
                
                let content = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                if (fix.type === 'initialization') {
                    // Prüfe ob bereits vorhanden
                    if (!content.includes('AWSAPISettingsService') || !content.includes('window.awsAPISettings = new')) {
                        // Finde Insert-Point nach aws-api-settings.js
                        const scriptTagIndex = content.indexOf('aws-api-settings.js');
                        if (scriptTagIndex > -1) {
                            // Finde schließendes </script> Tag
                            const scriptEndIndex = content.indexOf('</script>', scriptTagIndex);
                            if (scriptEndIndex > -1) {
                                const before = content.substring(0, scriptEndIndex);
                                const after = content.substring(scriptEndIndex);
                                
                                // Prüfe ob bereits Initialisierung vorhanden
                                if (!before.includes('window.awsAPISettings = new AWSAPISettingsService')) {
                                    content = before + '\n    <script>\n        ' + fix.code + '\n    </script>' + after;
                                    modified = true;
                                }
                            }
                        }
                    }
                } else if (fix.type === 'timing') {
                    // Erhöhe Wartezeit
                    if (fix.search && fix.replace) {
                        const regex = new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                        if (content.match(regex)) {
                            content = content.replace(regex, fix.replace);
                            modified = true;
                        }
                    } else {
                        // Fallback: Standard-Ersetzungen
                        if (content.includes('attempts < 10') || content.includes('maxAttempts = 10')) {
                            content = content.replace(/attempts < 10/g, 'attempts < 50');
                            content = content.replace(/maxAttempts = 10/g, 'maxAttempts = 50');
                            content = content.replace(/while \(!window\.awsAPISettings && attempts < 10\)/g, 'while (!window.awsAPISettings && attempts < 50)');
                            modified = true;
                        }
                    }
                } else if (fix.type === 'logging') {
                    // Füge detaillierteres Logging hinzu - wird manuell gemacht
                    console.log(`ℹ️ Logging-Verbesserung erforderlich: ${fix.description}`);
                    // Keine automatische Änderung, da zu komplex
                } else if (fix.type === 'apiKey' || fix.type === 'performance') {
                    // Zu komplex für automatische Korrektur
                    console.log(`ℹ️ Manuelle Korrektur erforderlich: ${fix.description}`);
                    console.log(`   Vorschlag: ${fix.suggestion}`);
                }
                
                if (modified) {
                    fs.writeFileSync(filePath, content);
                    appliedFixes.push(fix);
                    console.log(`✅ Fix angewendet: ${fix.description}`);
                } else {
                    console.log(`ℹ️ Fix nicht angewendet (bereits vorhanden oder nicht möglich): ${fix.description}`);
                }
            } catch (e) {
                console.error(`❌ Fehler beim Anwenden von Fix: ${fix.description}`, e.message);
            }
        }

        return appliedFixes;
    }

    /**
     * Deployt Änderungen
     */
    async deploy() {
        try {
            console.log('📤 Deploye Änderungen...');
            
            // Git commit
            execSync('git add -A', { cwd: path.join(__dirname, '..') });
            execSync(`git commit -m "Auto-fix: API-Key Integration Korrekturen"`, { cwd: path.join(__dirname, '..') });
            execSync('git push origin main', { cwd: path.join(__dirname, '..') });
            
            // AWS S3 Sync
            execSync('aws s3 sync . s3://manuel-weiss-website --exclude "*.git/*" --exclude "node_modules/*" --exclude "infrastructure/*" --exclude "lambda/*" --exclude "netlify/*" --exclude ".github/*" --region eu-central-1', {
                cwd: path.join(__dirname, '..')
            });
            
            // CloudFront Invalidation
            execSync('aws cloudfront create-invalidation --distribution-id E305V0ATIXMNNG --paths "/*" --region eu-central-1', {
                cwd: path.join(__dirname, '..')
            });
            
            console.log('✅ Deployment abgeschlossen');
            return true;
        } catch (e) {
            console.error('❌ Deployment fehlgeschlagen:', e.message);
            return false;
        }
    }

    /**
     * Wartet auf CloudFront Invalidation
     */
    async waitForCloudFront(waitTime) {
        console.log(`⏳ Warte ${waitTime / 1000} Sekunden auf CloudFront Invalidation...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    /**
     * Erstellt Test-Report
     */
    createReport(results, iteration) {
        const report = {
            timestamp: new Date().toISOString(),
            iteration,
            totalTests: results.length,
            passedTests: results.filter(r => r.success).length,
            failedTests: results.filter(r => !r.success).length,
            results: results
        };

        const reportPath = path.join(this.reportDir, `cover-letter-api-key-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`\n📊 Test-Report gespeichert: ${reportPath}`);
        return reportPath;
    }
}

module.exports = TestUtils;
