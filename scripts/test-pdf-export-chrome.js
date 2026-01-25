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
        page.on('response', async response => {
            const url = response.url();
            if (url.includes('pdf-generator')) {
                const status = response.status();
                console.log(`📡 PDF-Generator Response: ${status} ${response.statusText()}`);
                if (status !== 200) {
                    try {
                        const text = await response.text();
                        console.error('❌ Error Response:', text.substring(0, 500));
                    } catch (e) {
                        console.error('❌ Could not read error response');
                    }
                }
            }
        });

        console.log('1️⃣ Navigiere zu Resume Editor...');
        await page.goto(`${BASE_URL}/applications/resume-editor.html`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Warte auf Seite geladen
        await new Promise(resolve => setTimeout(resolve, 2000));

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
