/**
 * PDF Export Test Script für Chrome (Privates Fenster)
 * Testet den PDF-Export im Design Editor
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://manuel-weiss.ch';
const TEST_TIMEOUT = 60000; // 60 Sekunden

async function testPDFExport() {
    console.log('🚀 Starte PDF-Export Test in Chrome (Privates Fenster)...\n');
    
    let browser;
    try {
        // Browser im privaten Modus starten (incognito)
        browser = await puppeteer.launch({
            headless: false, // Sichtbar für Debugging
            args: [
                '--incognito', // Privates Fenster
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ],
            defaultViewport: { width: 1920, height: 1080 }
        });

        const context = await browser.createBrowserContext();
        const page = await context.newPage();

        // EXPLIZITE CACHE-LÖSCHUNG vor Test-Start
        console.log('🧹 Lösche alle Caches vor Test-Start...');
        
        // CDP (Chrome DevTools Protocol) für Browser-Cache-Löschung
        try {
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCache');
            await client.send('Network.setCacheDisabled', { cacheDisabled: true });
            console.log('✅ Browser-Cache über CDP gelöscht');
        } catch (cdpError) {
            console.warn('⚠️ CDP Cache-Löschung fehlgeschlagen:', cdpError.message);
        }

        // Console-Logs vom Browser abfangen
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || text.includes('❌') || text.includes('Error')) {
                console.error(`[Browser ${type}]:`, text);
            } else if (text.includes('📡') || text.includes('✅') || text.includes('🔄')) {
                console.log(`[Browser]:`, text);
            }
        });

        // Page Errors abfangen
        page.on('pageerror', error => {
            console.error('❌ Page Error:', error.message);
        });

        // Request/Response Monitoring
        let pdfRequestBody = null;
        page.on('request', request => {
            const url = request.url();
            if (url.includes('pdf-generator') && request.method() === 'POST') {
                const postData = request.postData();
                if (postData) {
                    try {
                        pdfRequestBody = JSON.parse(postData);
                        console.log('📡 PDF-Generator Request Body:', {
                            hasHtml: !!pdfRequestBody.html,
                            hasContent: !!pdfRequestBody.content,
                            hasSettings: !!pdfRequestBody.settings,
                            htmlLength: pdfRequestBody.html ? pdfRequestBody.html.length : 0
                        });
                        
                        // Prüfe ob Request html Parameter enthält (nicht content + settings)
                        if (!pdfRequestBody.html && (pdfRequestBody.content || pdfRequestBody.settings)) {
                            console.error('❌ Request verwendet Legacy-Modus (content + settings statt html)');
                        }
                    } catch (e) {
                        console.warn('⚠️ Could not parse request body:', e.message);
                    }
                }
            }
        });

        page.on('response', async response => {
            const url = response.url();
            if (url.includes('pdf-generator')) {
                const status = response.status();
                console.log(`📡 PDF-Generator Response: ${status} ${response.statusText()}`);
                const contentType = response.headers()['content-type'];
                console.log(`📡 Response Content-Type: ${contentType}`);
                
                if (status !== 200) {
                    try {
                        const text = await response.text();
                        console.error('❌ Error Response:', text.substring(0, 500));
                    } catch (e) {
                        console.error('❌ Could not read error response');
                    }
                } else if (contentType && contentType.includes('application/pdf')) {
                    console.log('✅ PDF Response erhalten (Content-Type: application/pdf)');
                }
            }
        });

        console.log('1️⃣ Navigiere zu Resume Editor...');
        
        // URL mit Timestamp für Cache-Bypass
        const urlWithCacheBust = `${BASE_URL}/applications/resume-editor.html?t=${Date.now()}`;
        
        await page.goto(urlWithCacheBust, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Warte auf Seite geladen
        await new Promise(resolve => setTimeout(resolve, 2000));

        // EXPLIZITE CACHE-LÖSCHUNG nach Seitenladung (Service Worker, LocalStorage, etc.)
        console.log('🧹 Lösche Service Worker, LocalStorage und Cache API...');
        await page.evaluate(() => {
            // Service Worker löschen
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(reg => {
                        reg.unregister().catch(e => console.warn('Service Worker unregister failed:', e));
                    });
                });
            }
            
            // Cache API löschen
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        caches.delete(name).catch(e => console.warn('Cache delete failed:', e));
                    });
                });
            }
            
            // LocalStorage und SessionStorage löschen
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (e) {
                console.warn('Storage clear failed:', e);
            }
        });
        
        // Warte kurz, damit Cache-Löschung abgeschlossen ist
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Cache-Löschung abgeschlossen');

        console.log('2️⃣ Öffne Design Editor...');
        // Suche nach Design Editor Button
        const designEditorButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button, a'));
            return buttons.find(btn => {
                const text = btn.textContent || btn.innerText || '';
                return text.includes('Design') || text.includes('Gestaltung') || btn.id.includes('design');
            });
        });

        if (designEditorButton && designEditorButton.asElement()) {
            await designEditorButton.asElement().click();
            console.log('✅ Design Editor Button gefunden und geklickt');
        } else {
            // Versuche direkt über JavaScript
            await page.evaluate(() => {
                if (typeof openDesignEditor === 'function') {
                    openDesignEditor();
                } else if (window.designEditor) {
                    // Design Editor Modal öffnen
                    const modal = document.getElementById('designEditorModal');
                    if (modal) {
                        modal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                }
            });
            console.log('✅ Design Editor über JavaScript geöffnet');
        }

        // Warte auf Design Editor
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('3️⃣ Prüfe ob Design Editor geladen ist...');
        const designEditorLoaded = await page.evaluate(() => {
            return !!window.designEditor && !!document.querySelector('.design-resume-preview');
        });

        if (!designEditorLoaded) {
            throw new Error('Design Editor wurde nicht geladen');
        }
        console.log('✅ Design Editor geladen');

        console.log('4️⃣ Starte PDF-Export...');
        // Warte auf Export Button
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Klicke auf Export Button
        const exportClicked = await page.evaluate(() => {
            // Versuche verschiedene Wege, den Export zu starten
            if (window.designEditor && typeof window.designEditor.exportToPDF === 'function') {
                window.designEditor.exportToPDF();
                return true;
            }
            
            // Suche nach Export Button
            const exportBtn = document.querySelector('#designExportPdf, .design-export-btn, [onclick*="exportToPDF"]');
            if (exportBtn) {
                exportBtn.click();
                return true;
            }
            
            return false;
        });

        if (!exportClicked) {
            throw new Error('Export Button nicht gefunden oder konnte nicht geklickt werden');
        }
        console.log('✅ Export Button geklickt');

        // Warte auf Export Options Dialog
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('5️⃣ Warte auf Export Options Dialog...');
        const optionsDialogVisible = await page.waitForSelector('.pdf-export-options-modal', {
            timeout: 5000,
            visible: true
        }).catch(() => null);

        if (!optionsDialogVisible) {
            console.warn('⚠️ Export Options Dialog nicht gefunden - versuche direkt zu exportieren');
        } else {
            console.log('✅ Export Options Dialog gefunden');
            
            // Klicke auf Export Button im Dialog
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.evaluate(() => {
                const exportBtn = document.querySelector('.pdf-export-options-modal .btn-primary, .pdf-export-options-modal button[onclick*="downloadPDFWithOptions"]');
                if (exportBtn) {
                    exportBtn.click();
                }
            });
        }

        console.log('6️⃣ Warte auf PDF-Generierung...');
        
        // Warte auf PDF-Download oder Fehler
        let pdfGenerated = false;
        let errorOccurred = false;
        let errorMessage = '';

        // Monitor für Download
        const downloadPromise = new Promise((resolve) => {
            page.on('response', async (response) => {
                if (response.url().includes('pdf-generator')) {
                    const status = response.status();
                    if (status === 200) {
                        const contentType = response.headers()['content-type'];
                        if (contentType && contentType.includes('pdf')) {
                            pdfGenerated = true;
                            console.log('✅ PDF Response erhalten (200 OK)');
                            resolve('success');
                        }
                    } else {
                        errorOccurred = true;
                        try {
                            const text = await response.text();
                            const errorData = JSON.parse(text);
                            errorMessage = errorData.error || errorData.message || `HTTP ${status}`;
                            console.error('❌ PDF-Generator Fehler:', errorMessage);
                        } catch (e) {
                            errorMessage = `HTTP ${status}`;
                        }
                        resolve('error');
                    }
                }
            });
        });

        // Warte auf Ergebnis (max 30 Sekunden)
        const result = await Promise.race([
            downloadPromise,
            new Promise(resolve => setTimeout(() => resolve('timeout'), 30000))
        ]);

        // Prüfe auf Fehler in Console
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (result === 'timeout') {
            throw new Error('PDF-Generierung dauerte zu lange (Timeout nach 30 Sekunden)');
        }

        if (errorOccurred) {
            throw new Error(`PDF-Generierung fehlgeschlagen: ${errorMessage}`);
        }

        if (pdfGenerated || result === 'success') {
            console.log('\n✅ PDF-Export Test ERFOLGREICH!');
            console.log('✅ PDF wurde erfolgreich generiert');
            
            // Prüfe Request-Body (sollte html enthalten, nicht content + settings)
            if (pdfRequestBody) {
                if (pdfRequestBody.html && !pdfRequestBody.content) {
                    console.log('✅ Request verwendet korrekten Modus (html Parameter)');
                } else if (pdfRequestBody.content || pdfRequestBody.settings) {
                    console.warn('⚠️ Request verwendet Legacy-Modus (content + settings)');
                }
            }
            
            return true;
        }

        throw new Error('PDF-Generierung Status unklar');

    } catch (error) {
        console.error('\n❌ PDF-Export Test FEHLGESCHLAGEN!');
        console.error('❌ Fehler:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // Screenshot für Debugging
        if (browser) {
            const pages = await browser.pages();
            if (pages.length > 0) {
                await pages[0].screenshot({ path: 'pdf-export-test-error.png', fullPage: true });
                console.log('📸 Screenshot gespeichert: pdf-export-test-error.png');
            }
        }
        
        return false;
    } finally {
        if (browser) {
            console.log('\n⏳ Warte 5 Sekunden vor Browser-Schließung (für manuelle Inspektion)...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            await browser.close();
        }
    }
}

// Test ausführen
testPDFExport()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Unerwarteter Fehler:', error);
        process.exit(1);
    });
