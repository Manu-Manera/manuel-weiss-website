/**
 * Kompletter PDF-Export Test
 * Testet alle Szenarien für den PDF-Export
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://manuel-weiss.ch';
const TEST_URL = `${BASE_URL}/applications/resume-editor.html`;

async function clearCache(page) {
    console.log('🧹 Lösche Cache...');
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCache');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    
    // Lösche auch Service Workers, Cache API, localStorage, sessionStorage
    await page.evaluate(() => {
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

async function waitForDesignEditor(page) {
    console.log('⏳ Warte auf DesignEditor...');
    await page.waitForFunction(() => {
        return window.designEditor && typeof window.designEditor.exportToPDF === 'function';
    }, { timeout: 10000 });
    console.log('✅ DesignEditor geladen');
}

async function testPDFExport(page, testName) {
    console.log(`\n🧪 Test: ${testName}`);
    
    try {
        // Warte auf DesignEditor
        await waitForDesignEditor(page);
        
        // Öffne Design Editor falls nötig
        const designEditorButton = await page.$('#openDesignEditor, .open-design-editor, [onclick*="openDesignEditor"]');
        if (designEditorButton) {
            console.log('📝 Öffne Design Editor...');
            await designEditorButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Warte auf Preview
        await page.waitForSelector('.design-resume-preview', { timeout: 5000 });
        console.log('✅ Preview gefunden');
        
        // Führe PDF-Export aus
        console.log('📄 Starte PDF-Export...');
        const exportResult = await page.evaluate(async () => {
            if (!window.designEditor || typeof window.designEditor.exportToPDF !== 'function') {
                return { success: false, error: 'DesignEditor nicht verfügbar' };
            }
            
            try {
                await window.designEditor.exportToPDF();
                return { success: true };
            } catch (error) {
                return { 
                    success: false, 
                    error: error.message,
                    stack: error.stack
                };
            }
        });
        
        // Warte auf Ergebnis (max 30 Sekunden)
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Prüfe auf Fehlermeldungen
        const errorMessages = await page.evaluate(() => {
            const notifications = Array.from(document.querySelectorAll('.notification, .toast, .error-message'));
            return notifications.map(n => n.textContent.trim()).filter(t => t.length > 0);
        });
        
        if (exportResult.success) {
            console.log('✅ PDF-Export erfolgreich');
            if (errorMessages.length > 0) {
                console.log('⚠️ Warnungen:', errorMessages);
            }
            return { success: true, warnings: errorMessages };
        } else {
            console.error('❌ PDF-Export fehlgeschlagen:', exportResult.error);
            console.error('Stack:', exportResult.stack);
            if (errorMessages.length > 0) {
                console.error('Fehlermeldungen:', errorMessages);
            }
            return { success: false, error: exportResult.error, messages: errorMessages };
        }
        
    } catch (error) {
        console.error(`❌ Test "${testName}" fehlgeschlagen:`, error.message);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('🚀 Starte PDF-Export Tests...\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // Navigiere zur Seite mit Cache-Busting
        const urlWithCacheBust = `${TEST_URL}?t=${Date.now()}`;
        console.log(`📡 Navigiere zu: ${urlWithCacheBust}`);
        await page.goto(urlWithCacheBust, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Lösche Cache
        await clearCache(page);
        
        // Test 1: PDF-Export ohne Bilder
        console.log('\n' + '='.repeat(60));
        const test1 = await testPDFExport(page, 'PDF-Export ohne Bilder');
        
        // Test 2: PDF-Export mit kleinen Bildern
        console.log('\n' + '='.repeat(60));
        const test2 = await testPDFExport(page, 'PDF-Export mit kleinen Bildern');
        
        // Test 3: PDF-Export mit großen Bildern (falls vorhanden)
        console.log('\n' + '='.repeat(60));
        const test3 = await testPDFExport(page, 'PDF-Export mit großen Bildern');
        
        // Zusammenfassung
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST-ZUSAMMENFASSUNG');
        console.log('='.repeat(60));
        console.log(`Test 1 (ohne Bilder): ${test1.success ? '✅ ERFOLG' : '❌ FEHLER'}`);
        if (!test1.success) console.log(`  Fehler: ${test1.error}`);
        console.log(`Test 2 (kleine Bilder): ${test2.success ? '✅ ERFOLG' : '❌ FEHLER'}`);
        if (!test2.success) console.log(`  Fehler: ${test2.error}`);
        console.log(`Test 3 (große Bilder): ${test3.success ? '✅ ERFOLG' : '❌ FEHLER'}`);
        if (!test3.success) console.log(`  Fehler: ${test3.error}`);
        
        const allPassed = test1.success && test2.success && test3.success;
        console.log('\n' + (allPassed ? '✅ ALLE TESTS ERFOLGREICH' : '❌ EINIGE TESTS FEHLGESCHLAGEN'));
        
    } catch (error) {
        console.error('❌ Kritischer Fehler:', error);
    } finally {
        await browser.close();
    }
}

// Führe Tests aus
runTests().catch(console.error);
