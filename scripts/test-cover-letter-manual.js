/**
 * Manueller Test für Cover Letter Editor - öffnet Browser und testet API-Key Integration
 */

const puppeteer = require('puppeteer');

async function manualTest() {
    console.log('🚀 Starte manuellen Test für Cover Letter Editor...\n');
    
    const browser = await puppeteer.launch({
        headless: false, // Browser sichtbar machen
        slowMo: 250, // Langsamer für besseres Debugging
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ],
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });
    
    const page = await browser.newPage();
    
    // Console-Logs abfangen
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push({ type: msg.type(), text, timestamp: new Date().toISOString() });
        
        // Wichtige Logs ausgeben
        if (text.includes('API-Key') || text.includes('✅') || text.includes('❌') || text.includes('🔑')) {
            console.log(`[Browser ${msg.type()}]:`, text);
        }
    });
    
    // Page Errors abfangen
    page.on('pageerror', error => {
        console.error('[Page Error]:', error.message);
    });
    
    try {
        console.log('📄 Lade Seite: https://manuel-weiss.ch/applications/cover-letter-editor.html');
        await page.goto('https://manuel-weiss.ch/applications/cover-letter-editor.html', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        console.log('⏳ Warte auf Editor-Initialisierung...');
        await page.waitForFunction(
            () => typeof window.coverLetterEditor !== 'undefined',
            { timeout: 10000 }
        );
        
        console.log('✅ Editor initialisiert\n');
        
        // Warte kurz auf vollständige Initialisierung
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Prüfe API-Key Verfügbarkeit
        console.log('🔍 Prüfe API-Key Verfügbarkeit...');
        const apiKeyCheck = await page.evaluate(async () => {
            if (typeof window.coverLetterEditor !== 'undefined') {
                const apiKey = await window.coverLetterEditor.getAPIKey();
                return {
                    found: !!apiKey,
                    key: apiKey ? apiKey.substring(0, 10) + '...' : null,
                    length: apiKey ? apiKey.length : 0
                };
            }
            return { found: false, key: null, length: 0 };
        });
        
        console.log('📊 API-Key Status:', apiKeyCheck);
        
        if (!apiKeyCheck.found) {
            console.log('\n⚠️ API-Key nicht gefunden! Prüfe localStorage...');
            const localStorageCheck = await page.evaluate(() => {
                const checks = {};
                
                // global_api_keys
                try {
                    const globalKeys = JSON.parse(localStorage.getItem('global_api_keys') || '{}');
                    checks.global_api_keys = {
                        exists: !!localStorage.getItem('global_api_keys'),
                        hasOpenAI: !!globalKeys.openai,
                        hasKey: !!globalKeys.openai?.key,
                        keyLength: globalKeys.openai?.key?.length || 0
                    };
                } catch (e) {
                    checks.global_api_keys = { error: e.message };
                }
                
                // admin_state
                try {
                    const adminState = JSON.parse(localStorage.getItem('admin_state') || '{}');
                    checks.admin_state = {
                        exists: !!localStorage.getItem('admin_state'),
                        hasServices: !!adminState.services,
                        hasOpenAI: !!adminState.services?.openai,
                        hasKey: !!adminState.services?.openai?.key,
                        keyLength: adminState.services?.openai?.key?.length || 0
                    };
                } catch (e) {
                    checks.admin_state = { error: e.message };
                }
                
                // GlobalAPIManager
                checks.GlobalAPIManager = {
                    exists: typeof window.GlobalAPIManager !== 'undefined',
                    hasGetAPIKey: typeof window.GlobalAPIManager?.getAPIKey === 'function'
                };
                
                if (checks.GlobalAPIManager.exists) {
                    try {
                        const key = window.GlobalAPIManager.getAPIKey('openai');
                        checks.GlobalAPIManager.hasKey = !!key;
                        checks.GlobalAPIManager.keyLength = key ? key.length : 0;
                    } catch (e) {
                        checks.GlobalAPIManager.error = e.message;
                    }
                }
                
                return checks;
            });
            
            console.log('📋 localStorage Status:', JSON.stringify(localStorageCheck, null, 2));
        }
        
        // Fülle Formular aus
        console.log('\n📝 Fülle Formular aus...');
        await page.evaluate(() => {
            const companyName = document.getElementById('companyName');
            const jobTitle = document.getElementById('jobTitle');
            const jobDescription = document.getElementById('jobDescription');
            
            if (companyName) companyName.value = 'Test Company GmbH';
            if (jobTitle) jobTitle.value = 'Senior Software Engineer';
            if (jobDescription) jobDescription.value = 'Wir suchen einen erfahrenen Software Engineer mit Kenntnissen in JavaScript, Node.js und AWS.';
        });
        
        console.log('✅ Formular ausgefüllt\n');
        
        // Klicke "Anschreiben generieren"
        console.log('🖱️ Klicke "Anschreiben generieren"...');
        const generateButton = await page.$('#generateBtn, button:has-text("Anschreiben generieren"), [onclick*="generateCoverLetter"]');
        
        if (generateButton) {
            await generateButton.click();
            console.log('✅ Button geklickt\n');
            
            // Warte auf Generierung
            console.log('⏳ Warte auf Generierung (max. 20 Sekunden)...');
            await new Promise(resolve => setTimeout(resolve, 20000));
            
            // Prüfe ob Anschreiben generiert wurde
            const generatedContent = await page.evaluate(() => {
                const selectors = [
                    '.generated-letter',
                    '[class*="generated"]',
                    '.letter-content',
                    '#letterContent',
                    '.editor-content'
                ];
                
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent && element.textContent.trim().length > 100) {
                        return {
                            found: true,
                            length: element.textContent.trim().length,
                            preview: element.textContent.trim().substring(0, 200)
                        };
                    }
                }
                
                return { found: false, length: 0, preview: null };
            });
            
            console.log('📄 Generiertes Anschreiben:', generatedContent);
            
            // Prüfe Console-Logs für API-Key Meldungen
            console.log('\n📋 Relevante Console-Logs:');
            const relevantLogs = consoleLogs.filter(log => 
                log.text.includes('API-Key') || 
                log.text.includes('Kein API-Key') ||
                log.text.includes('Template') ||
                log.text.includes('Generierung')
            );
            
            relevantLogs.forEach(log => {
                console.log(`  [${log.type}]: ${log.text}`);
            });
            
        } else {
            console.error('❌ Generate Button nicht gefunden!');
        }
        
        console.log('\n✅ Test abgeschlossen. Browser bleibt 10 Sekunden offen für manuelle Prüfung...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } catch (error) {
        console.error('❌ Fehler beim Test:', error);
    } finally {
        await browser.close();
    }
}

manualTest().catch(console.error);
