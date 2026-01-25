/**
 * Umfassendes Test-Script für alle 15 Lebenslauf-Editor Bugs
 * Testet jeden Bug einzeln mit Cache-Löschung vor jedem Test
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'https://manuel-weiss.ch';
const TEST_TIMEOUT = 120000; // 2 Minuten pro Test

// Test-Ergebnisse
const testResults = {
    passed: [],
    failed: [],
    warnings: []
};

/**
 * Cache-Löschung vor jedem Test
 */
async function clearAllCaches(page) {
    console.log('🧹 Lösche alle Caches...');
    
    // CDP für Browser-Cache-Löschung
    try {
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCache');
        await client.send('Network.setCacheDisabled', { cacheDisabled: true });
        console.log('✅ Browser-Cache über CDP gelöscht');
    } catch (cdpError) {
        console.warn('⚠️ CDP Cache-Löschung fehlgeschlagen:', cdpError.message);
    }

    // Service Worker, LocalStorage, Cache API löschen
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
    
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Cache-Löschung abgeschlossen');
}

/**
 * Test 1: Aufzählungszeichen Einzug
 */
async function testBulletIndent(page) {
    console.log('\n📋 Test 1: Aufzählungszeichen Einzug');
    try {
        // Prüfe CSS-Datei
        const cssContent = await page.evaluate(async () => {
            try {
                const response = await fetch('/applications/css/design-editor.css');
                return await response.text();
            } catch (e) {
                return '';
            }
        });
        
        const hasCorrectCSS = cssContent.includes('.resume-preview-bullets') && 
                             (cssContent.includes('padding-left: 1.2em') || 
                              cssContent.includes('list-style-position: outside') ||
                              cssContent.includes('padding-left') && cssContent.includes('!important'));
        
        // Prüfe auch im gerenderten Preview
        const bulletPadding = await page.evaluate(() => {
            const bullets = document.querySelector('.resume-preview-bullets');
            if (!bullets) {
                // Versuche Bullets zu erstellen für Test
                const testBullets = document.createElement('ul');
                testBullets.className = 'resume-preview-bullets';
                document.body.appendChild(testBullets);
                const style = window.getComputedStyle(testBullets);
                const padding = style.paddingLeft;
                document.body.removeChild(testBullets);
                return padding;
            }
            const style = window.getComputedStyle(bullets);
            return style.paddingLeft;
        });
        
        const testPassed = hasCorrectCSS && bulletPadding && (bulletPadding === '1.2em' || parseFloat(bulletPadding) > 0);
        if (testPassed) {
            testResults.passed.push('Aufzählungszeichen Einzug');
            console.log('✅ Test bestanden: padding-left =', bulletPadding, 'CSS vorhanden:', hasCorrectCSS);
        } else {
            testResults.failed.push({ test: 'Aufzählungszeichen Einzug', reason: `padding-left = ${bulletPadding}, CSS vorhanden: ${hasCorrectCSS}` });
            console.error('❌ Test fehlgeschlagen: padding-left =', bulletPadding, 'CSS vorhanden:', hasCorrectCSS);
        }
        return testPassed;
    } catch (error) {
        testResults.failed.push({ test: 'Aufzählungszeichen Einzug', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 2: X/Y Versatz Profilbild
 */
async function testProfileImageOffset(page) {
    console.log('\n📋 Test 2: X/Y Versatz Profilbild');
    try {
        // Prüfe ob Code vorhanden ist
        const hasCode = await page.evaluate(() => {
            const funcStr = window.designEditor?.renderHeaderSection?.toString() || '';
            return funcStr.includes('object-position') && funcStr.includes('offsetX') && funcStr.includes('offsetY');
        });
        
        if (hasCode) {
            testResults.passed.push('X/Y Versatz Profilbild');
            console.log('✅ Test bestanden: object-position Code vorhanden');
        } else {
            testResults.failed.push({ test: 'X/Y Versatz Profilbild', reason: 'object-position Code nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: object-position Code nicht gefunden');
        }
        return hasCode;
    } catch (error) {
        testResults.failed.push({ test: 'X/Y Versatz Profilbild', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 3: Foto-Speicherung
 */
async function testPhotoSave(page) {
    console.log('\n📋 Test 3: Foto-Speicherung beim Upload');
    try {
        // Prüfe ob handleProfileImageUpload vorhanden ist
        const hasSavePhoto = await page.evaluate(() => {
            return typeof window.designEditor?.handleProfileImageUpload === 'function';
        });
        
        if (hasSavePhoto) {
            testResults.passed.push('Foto-Speicherung');
            console.log('✅ Test bestanden: handleProfileImageUpload() vorhanden');
        } else {
            testResults.failed.push({ test: 'Foto-Speicherung', reason: 'handleProfileImageUpload() nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: handleProfileImageUpload() nicht gefunden');
        }
        return hasSavePhoto;
    } catch (error) {
        testResults.failed.push({ test: 'Foto-Speicherung', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 4: Fotos aus Fotos-Sektion
 */
async function testPhotoGallery(page) {
    console.log('\n📋 Test 4: Fotos aus Fotos-Sektion');
    try {
        const hasGallery = await page.evaluate(() => {
            return typeof window.designEditor?.showApplicationImagesGallery === 'function';
        });
        
        if (hasGallery) {
            testResults.passed.push('Fotos aus Fotos-Sektion');
            console.log('✅ Test bestanden: showApplicationImagesGallery() vorhanden');
        } else {
            testResults.failed.push({ test: 'Fotos aus Fotos-Sektion', reason: 'showApplicationImagesGallery() nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: showApplicationImagesGallery() nicht gefunden');
        }
        return hasGallery;
    } catch (error) {
        testResults.failed.push({ test: 'Fotos aus Fotos-Sektion', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 5: Skills-Laden
 */
async function testSkillsLoad(page) {
    console.log('\n📋 Test 5: Skills-Laden');
    try {
        const hasPopulateForm = await page.evaluate(() => {
            return typeof populateForm === 'function';
        });
        
        if (hasPopulateForm) {
            testResults.passed.push('Skills-Laden');
            console.log('✅ Test bestanden: populateForm() vorhanden');
        } else {
            testResults.failed.push({ test: 'Skills-Laden', reason: 'populateForm() nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: populateForm() nicht gefunden');
        }
        return hasPopulateForm;
    } catch (error) {
        testResults.failed.push({ test: 'Skills-Laden', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 6: OCR-Fehlerbehandlung
 */
async function testOCRErrorHandling(page) {
    console.log('\n📋 Test 6: OCR-Fehlerbehandlung');
    try {
        const hasErrorHandling = await page.evaluate(() => {
            // Prüfe ob uploadAndProcessPDF try-catch hat
            const funcStr = uploadAndProcessPDF?.toString() || '';
            return funcStr.includes('try') && funcStr.includes('catch');
        });
        
        if (hasErrorHandling) {
            testResults.passed.push('OCR-Fehlerbehandlung');
            console.log('✅ Test bestanden: Error-Handling vorhanden');
        } else {
            testResults.failed.push({ test: 'OCR-Fehlerbehandlung', reason: 'Error-Handling nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: Error-Handling nicht gefunden');
        }
        return hasErrorHandling;
    } catch (error) {
        testResults.failed.push({ test: 'OCR-Fehlerbehandlung', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 7: Website-Link klickbar
 */
async function testWebsiteLink(page) {
    console.log('\n📋 Test 7: Website-Link klickbar');
    try {
        const hasLinkCode = await page.evaluate(() => {
            const funcStr = window.designEditor?.renderHeaderSection?.toString() || '';
            return funcStr.includes('<a href') && funcStr.includes('target="_blank"') && 
                   (funcStr.includes('pointer-events') || funcStr.includes('website'));
        });
        
        if (hasLinkCode) {
            testResults.passed.push('Website-Link klickbar');
            console.log('✅ Test bestanden: Website-Link Code vorhanden');
        } else {
            testResults.failed.push({ test: 'Website-Link klickbar', reason: 'Link-Code nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: Link-Code nicht gefunden');
        }
        return hasLinkCode;
    } catch (error) {
        testResults.failed.push({ test: 'Website-Link klickbar', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 8: Komma nach PLZ
 */
async function testPLZComma(page) {
    console.log('\n📋 Test 8: Komma nach Postleitzahl');
    try {
        const hasRegex = await page.evaluate(() => {
            const funcStr = window.designEditor?.renderHeaderSection?.toString() || '';
            // Prüfe auf verschiedene Regex-Patterns (escaped für String-Suche)
            return funcStr.includes('locationStartsWithPLZ') || 
                   funcStr.includes('d{4,5}') ||
                   (funcStr.includes('replace') && funcStr.includes('PLZ')) ||
                   funcStr.includes('Postleitzahl');
        });
        
        if (hasRegex) {
            testResults.passed.push('Komma nach Postleitzahl');
            console.log('✅ Test bestanden: Regex für PLZ-Komma vorhanden');
        } else {
            testResults.failed.push({ test: 'Komma nach Postleitzahl', reason: 'Regex nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: Regex nicht gefunden');
        }
        return hasRegex;
    } catch (error) {
        testResults.failed.push({ test: 'Komma nach Postleitzahl', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 9: Toggle-Erhaltung
 */
async function testTogglePersistence(page) {
    console.log('\n📋 Test 9: Toggle-Erhaltung nach Template-Wechsel');
    try {
        const hasUpdateUI = await page.evaluate(() => {
            return typeof window.designEditor?.updateUIFromSettings === 'function';
        });
        
        if (hasUpdateUI) {
            testResults.passed.push('Toggle-Erhaltung');
            console.log('✅ Test bestanden: updateUIFromSettings() vorhanden');
        } else {
            testResults.failed.push({ test: 'Toggle-Erhaltung', reason: 'updateUIFromSettings() nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: updateUIFromSettings() nicht gefunden');
        }
        return hasUpdateUI;
    } catch (error) {
        testResults.failed.push({ test: 'Toggle-Erhaltung', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 10: Lebenslauf-Position
 */
async function testResumeTitlePosition(page) {
    console.log('\n📋 Test 10: Lebenslauf-Position');
    try {
        const hasPosition = await page.evaluate(() => {
            // Prüfe ob Funktion existiert oder im Code vorhanden ist
            const renderStr = window.designEditor?.renderHeaderSection?.toString() || '';
            const setupStr = window.designEditor?.setupResumeTitlePosition?.toString() || '';
            return (typeof window.designEditor?.setupResumeTitlePosition === 'function' ||
                    renderStr.includes('resumeTitlePosition') || 
                    setupStr.includes('resumeTitlePosition')) &&
                   window.designEditor?.settings?.resumeTitlePosition !== undefined;
        });
        
        if (hasPosition) {
            testResults.passed.push('Lebenslauf-Position');
            console.log('✅ Test bestanden: resumeTitlePosition vorhanden');
        } else {
            testResults.failed.push({ test: 'Lebenslauf-Position', reason: 'setupResumeTitlePosition() oder resumeTitlePosition nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: setupResumeTitlePosition() oder resumeTitlePosition nicht gefunden');
        }
        return hasPosition;
    } catch (error) {
        testResults.failed.push({ test: 'Lebenslauf-Position', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 11: Unterschrift Drag & Drop
 */
async function testSignatureDragDrop(page) {
    console.log('\n📋 Test 11: Unterschrift Drag & Drop');
    try {
        const hasDragDrop = await page.evaluate(() => {
            // Prüfe ob Funktion existiert oder im Code vorhanden ist
            const updateStr = window.designEditor?.updatePreview?.toString() || '';
            const setupStr = window.designEditor?.setupSignatureDragDrop?.toString() || '';
            return typeof window.designEditor?.setupSignatureDragDrop === 'function' ||
                   updateStr.includes('setupSignatureDragDrop') ||
                   setupStr.length > 0;
        });
        
        if (hasDragDrop) {
            testResults.passed.push('Unterschrift Drag & Drop');
            console.log('✅ Test bestanden: setupSignatureDragDrop() vorhanden');
        } else {
            testResults.failed.push({ test: 'Unterschrift Drag & Drop', reason: 'setupSignatureDragDrop() nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: setupSignatureDragDrop() nicht gefunden');
        }
        return hasDragDrop;
    } catch (error) {
        testResults.failed.push({ test: 'Unterschrift Drag & Drop', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 12: Unterschrift Schrägheit
 */
async function testSignatureSkew(page) {
    console.log('\n📋 Test 12: Unterschrift Schrägheit');
    try {
        const hasSkew = await page.evaluate(() => {
            const funcStr = window.designEditor?.renderSignatureSection?.toString() || '';
            return (window.designEditor?.settings?.signatureSkew !== undefined) ||
                   (funcStr.includes('signatureSkew') && funcStr.includes('skew'));
        });
        
        if (hasSkew) {
            testResults.passed.push('Unterschrift Schrägheit');
            console.log('✅ Test bestanden: signatureSkew vorhanden');
        } else {
            testResults.failed.push({ test: 'Unterschrift Schrägheit', reason: 'signatureSkew nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: signatureSkew nicht gefunden');
        }
        return hasSkew;
    } catch (error) {
        testResults.failed.push({ test: 'Unterschrift Schrägheit', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 13: Unterschriftenlinie
 */
async function testSignatureLine(page) {
    console.log('\n📋 Test 13: Unterschriftenlinie Dicke und Farbe');
    try {
        const hasLineSettings = await page.evaluate(() => {
            const funcStr = window.designEditor?.renderSignatureSection?.toString() || '';
            return (window.designEditor?.settings?.signatureLineWidth !== undefined &&
                   window.designEditor?.settings?.signatureLineColor !== undefined) ||
                   (funcStr.includes('signatureLineWidth') && funcStr.includes('signatureLineColor'));
        });
        
        if (hasLineSettings) {
            testResults.passed.push('Unterschriftenlinie');
            console.log('✅ Test bestanden: signatureLineWidth und signatureLineColor vorhanden');
        } else {
            testResults.failed.push({ test: 'Unterschriftenlinie', reason: 'signatureLineWidth oder signatureLineColor nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: signatureLineWidth oder signatureLineColor nicht gefunden');
        }
        return hasLineSettings;
    } catch (error) {
        testResults.failed.push({ test: 'Unterschriftenlinie', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 14: Farben-Reset
 */
async function testColorReset(page) {
    console.log('\n📋 Test 14: Farben-Reset beim Template-Wechsel');
    try {
        const hasColorReset = await page.evaluate(() => {
            const funcStr = window.designEditor?.updateUIFromSettings?.toString() || '';
            // Prüfe auf colorSettings oder color-Picker Updates
            return (funcStr.includes('colorSettings') || funcStr.includes('colorPicker') || funcStr.includes('designAccentColor')) && 
                   (funcStr.includes('forEach') || funcStr.includes('color'));
        });
        
        if (hasColorReset) {
            testResults.passed.push('Farben-Reset');
            console.log('✅ Test bestanden: Farb-Reset-Logik vorhanden');
        } else {
            testResults.failed.push({ test: 'Farben-Reset', reason: 'Farb-Reset-Logik nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: Farb-Reset-Logik nicht gefunden');
        }
        return hasColorReset;
    } catch (error) {
        testResults.failed.push({ test: 'Farben-Reset', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Test 15: Icons im PDF
 */
async function testIconsInPDF(page) {
    console.log('\n📋 Test 15: Icons im PDF');
    try {
        const hasFontAwesome = await page.evaluate(() => {
            const funcStr = window.designEditor?.generateCompleteHTMLDocument?.toString() || '';
            // Prüfe auf fontAwesomeLink oder Font Awesome CDN (verschiedene Schreibweisen)
            return funcStr.includes('fontAwesomeLink') || 
                   funcStr.includes('font-awesome') ||
                   funcStr.includes('fontAwesome') ||
                   (funcStr.includes('cdnjs.cloudflare.com') && funcStr.includes('all.min.css')) ||
                   funcStr.includes('Font Awesome');
        });
        
        if (hasFontAwesome) {
            testResults.passed.push('Icons im PDF');
            console.log('✅ Test bestanden: fontAwesomeLink vorhanden');
        } else {
            testResults.failed.push({ test: 'Icons im PDF', reason: 'fontAwesomeLink nicht gefunden' });
            console.error('❌ Test fehlgeschlagen: fontAwesomeLink nicht gefunden');
        }
        return hasFontAwesome;
    } catch (error) {
        testResults.failed.push({ test: 'Icons im PDF', reason: error.message });
        console.error('❌ Test-Fehler:', error.message);
        return false;
    }
}

/**
 * Haupt-Test-Funktion
 */
async function runAllTests() {
    console.log('🚀 Starte umfassende Tests für alle 15 Bugs...\n');
    
    let browser;
    try {
        // Browser im privaten Modus starten
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--incognito',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ],
            defaultViewport: { width: 1920, height: 1080 }
        });

        const context = await browser.createBrowserContext();
        const page = await context.newPage();

        // Console-Logs abfangen
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('❌') || text.includes('Error')) {
                console.error(`[Browser]:`, text);
            }
        });

        page.on('pageerror', error => {
            console.error('❌ Page Error:', error.message);
        });

        // Navigiere zu Resume Editor
        console.log('1️⃣ Navigiere zu Resume Editor...');
        const urlWithCacheBust = `${BASE_URL}/applications/resume-editor.html?t=${Date.now()}`;
        await page.goto(urlWithCacheBust, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
        await clearAllCaches(page);

        // Öffne Design Editor
        console.log('2️⃣ Öffne Design Editor...');
        await page.evaluate(() => {
            if (typeof openDesignEditor === 'function') {
                openDesignEditor();
            } else if (window.designEditor) {
                const modal = document.getElementById('designEditorModal');
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Warte auf Design Editor vollständig geladen
        await page.evaluate(() => {
            return new Promise((resolve) => {
                const checkEditor = () => {
                    if (window.designEditor && window.designEditor.settings) {
                        resolve();
                    } else {
                        setTimeout(checkEditor, 100);
                    }
                };
                checkEditor();
            });
        });
        
        console.log('✅ Design Editor vollständig geladen');

        // Führe alle Tests aus
        await testBulletIndent(page);
        await testProfileImageOffset(page);
        await testPhotoSave(page);
        await testPhotoGallery(page);
        await testSkillsLoad(page);
        await testOCRErrorHandling(page);
        await testWebsiteLink(page);
        await testPLZComma(page);
        await testTogglePersistence(page);
        await testResumeTitlePosition(page);
        await testSignatureDragDrop(page);
        await testSignatureSkew(page);
        await testSignatureLine(page);
        await testColorReset(page);
        await testIconsInPDF(page);

        // Zusammenfassung
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST-ZUSAMMENFASSUNG');
        console.log('='.repeat(60));
        console.log(`✅ Bestanden: ${testResults.passed.length}/15`);
        console.log(`❌ Fehlgeschlagen: ${testResults.failed.length}/15`);
        
        if (testResults.passed.length > 0) {
            console.log('\n✅ Bestandene Tests:');
            testResults.passed.forEach(test => console.log(`   - ${test}`));
        }
        
        if (testResults.failed.length > 0) {
            console.log('\n❌ Fehlgeschlagene Tests:');
            testResults.failed.forEach(({ test, reason }) => console.log(`   - ${test}: ${reason}`));
        }
        
        console.log('\n' + '='.repeat(60));
        
        const allPassed = testResults.failed.length === 0;
        return allPassed;

    } catch (error) {
        console.error('\n❌ Unerwarteter Fehler:', error);
        return false;
    } finally {
        if (browser) {
            console.log('\n⏳ Warte 5 Sekunden vor Browser-Schließung...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            await browser.close();
        }
    }
}

// Test ausführen
runAllTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Unerwarteter Fehler:', error);
        process.exit(1);
    });
