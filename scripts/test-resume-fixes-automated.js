#!/usr/bin/env node
/**
 * Automatisierter Test-Loop für Lebenslauf-Editor Fixes
 * Prüft Code direkt in Dateien, analysiert Fehler, korrigiert und testet erneut
 * 
 * Verwendung: node scripts/test-resume-fixes-automated.js
 */

const fs = require('fs');
const path = require('path');

class AutomatedResumeFixTester {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.testResults = [];
        this.fixes = [];
    }

    /**
     * Test 1: Aufzählungszeichen Einzug
     */
    testBulletIndent() {
        const cssPath = path.join(this.projectRoot, 'applications/css/design-editor.css');
        const content = fs.readFileSync(cssPath, 'utf8');
        
        // Prüfe ob padding-left: 0 vorhanden ist
        const hasCorrectPadding = content.includes('.resume-preview-bullets') && 
                                  (content.match(/\.resume-preview-bullets\s*\{[^}]*padding-left:\s*0/) !== null);
        
        this.recordTest('Aufzählungszeichen Einzug', hasCorrectPadding, 
            hasCorrectPadding ? '✅ CSS korrekt' : '❌ CSS nicht korrekt - padding-left sollte 0 sein');
        
        if (!hasCorrectPadding) {
            this.fixes.push({
                test: 'Aufzählungszeichen Einzug',
                file: cssPath,
                issue: 'padding-left ist nicht 0',
                fix: () => {
                    const updated = content.replace(
                        /\.resume-preview-bullets\s*\{[^}]*padding-left:\s*[^;]+;/,
                        '.resume-preview-bullets {\n    margin: 0.5rem 0 0 0;\n    padding-left: 0;'
                    );
                    fs.writeFileSync(cssPath, updated);
                }
            });
        }
        
        return hasCorrectPadding;
    }

    /**
     * Test 2: Profilbild X/Y Versatz
     */
    testProfileImageOffset() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        // Prüfe ob object-position verwendet wird
        const hasObjectPosition = content.includes('object-position:') && 
                                 content.includes('renderHeaderSection') &&
                                 content.includes('object-position: ${posX}% ${posY}%');
        
        this.recordTest('Profilbild X/Y Versatz', hasObjectPosition, 
            hasObjectPosition ? '✅ object-position Code vorhanden' : '❌ object-position Code fehlt');
        
        if (!hasObjectPosition) {
            this.fixes.push({
                test: 'Profilbild X/Y Versatz',
                file: jsPath,
                issue: 'object-position wird nicht verwendet',
                fix: () => {
                    // Suche nach transform-origin und ersetze durch object-position
                    const updated = content.replace(
                        /transform:\s*scale\([^)]+\);\s*transform-origin:\s*[^;]+;/g,
                        'object-position: ${posX}% ${posY}%;\n                        transform: scale(${zoomFactor});'
                    );
                    fs.writeFileSync(jsPath, updated);
                }
            });
        }
        
        return hasObjectPosition;
    }

    /**
     * Test 3: Foto-Speicherung beim Upload
     */
    testPhotoSaveOnUpload() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasSaveCode = content.includes('handleProfileImageUpload') &&
                           (content.includes('cloudDataService.savePhoto') || 
                            content.includes('user_photos'));
        
        this.recordTest('Foto-Speicherung beim Upload', hasSaveCode, 
            hasSaveCode ? '✅ Foto-Speicherung Code vorhanden' : '❌ Foto-Speicherung Code fehlt');
        
        return hasSaveCode;
    }

    /**
     * Test 4: Cloud Photos in Foto-Auswahl
     */
    testCloudPhotosInGallery() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasCloudPhotoCode = content.includes('showApplicationImagesGallery') &&
                                 content.includes('cloudDataService.getPhotos');
        
        this.recordTest('Cloud Photos in Foto-Auswahl', hasCloudPhotoCode, 
            hasCloudPhotoCode ? '✅ Cloud Photos Code vorhanden' : '❌ Cloud Photos Code fehlt');
        
        return hasCloudPhotoCode;
    }

    /**
     * Test 5: Skills-Laden
     */
    testSkillsLoading() {
        const jsPath = path.join(this.projectRoot, 'applications/js/resume-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasRobustCode = content.includes('technicalSkills || data.skills.technical') ||
                             content.includes('softSkills || data.skills.soft');
        
        this.recordTest('Skills-Laden', hasRobustCode, 
            hasRobustCode ? '✅ Robusteres Skills-Laden vorhanden' : '❌ Robusteres Skills-Laden fehlt');
        
        return hasRobustCode;
    }

    /**
     * Test 6: OCR-Fehlerbehandlung
     */
    testOCRErrorHandling() {
        const jsPath = path.join(this.projectRoot, 'applications/js/resume-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasErrorHandling = content.includes('processTextWithGPTFallback') &&
                                content.includes('catch (gptError)');
        
        this.recordTest('OCR-Fehlerbehandlung', hasErrorHandling, 
            hasErrorHandling ? '✅ Verbesserte Fehlerbehandlung vorhanden' : '❌ Verbesserte Fehlerbehandlung fehlt');
        
        return hasErrorHandling;
    }

    /**
     * Test 7: Website-Link klickbar
     */
    testWebsiteLinkClickable() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasWebsiteLink = content.includes('websiteUrl') &&
                              content.includes('<a href="${websiteUrl}"') &&
                              content.includes('renderHeaderSection');
        
        this.recordTest('Website-Link klickbar', hasWebsiteLink, 
            hasWebsiteLink ? '✅ Website-Link Code vorhanden' : '❌ Website-Link Code fehlt');
        
        return hasWebsiteLink;
    }

    /**
     * Test 8: Komma nach Postleitzahl
     */
    testPostalCodeComma() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasCommaFix = content.includes('locationStartsWithPLZ') ||
                           content.includes('locationHasPLZ');
        
        this.recordTest('Komma nach Postleitzahl', hasCommaFix, 
            hasCommaFix ? '✅ Komma-Entfernung Code vorhanden' : '❌ Komma-Entfernung Code fehlt');
        
        return hasCommaFix;
    }

    /**
     * Test 9: Geburtsdatum/GitHub-Toggle beim Template-Wechsel
     */
    testTogglePreservation() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasPreservationCode = content.includes('currentShowHeaderField') &&
                                   content.includes('preservedSettings');
        
        this.recordTest('Toggle beim Template-Wechsel', hasPreservationCode, 
            hasPreservationCode ? '✅ Toggle-Erhaltung Code vorhanden' : '❌ Toggle-Erhaltung Code fehlt');
        
        return hasPreservationCode;
    }

    /**
     * Test 10: "Lebenslauf"-Position anpassbar
     */
    testResumeTitlePosition() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const htmlPath = path.join(this.projectRoot, 'applications/resume-editor.html');
        
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const hasPositionSelect = htmlContent.includes('designResumeTitlePosition');
        const hasPositionCode = jsContent.includes('resumeTitlePosition') &&
                               jsContent.includes('above-image');
        
        const testPassed = hasPositionSelect && hasPositionCode;
        this.recordTest('"Lebenslauf"-Position', testPassed, 
            testPassed ? '✅ Position-Select vorhanden' : '❌ Position-Select fehlt');
        
        return testPassed;
    }

    /**
     * Test 11: Unterschrift Drag & Drop auf Linie
     */
    testSignatureDragDrop() {
        const jsPath = path.join(this.projectRoot, 'applications/js/cover-letter-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasLineAlignmentCode = content.includes('lineRelativeY') &&
                                    content.includes('signatureLine');
        
        this.recordTest('Unterschrift Drag & Drop auf Linie', hasLineAlignmentCode, 
            hasLineAlignmentCode ? '✅ Linien-Ausrichtung Code vorhanden' : '❌ Linien-Ausrichtung Code fehlt');
        
        return hasLineAlignmentCode;
    }

    /**
     * Test 12: Unterschrift Schrägheit
     */
    testSignatureSkew() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const htmlPath = path.join(this.projectRoot, 'applications/resume-editor.html');
        
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const hasSlider = htmlContent.includes('signatureSkew');
        const hasSkewCode = jsContent.includes('signatureSkew') &&
                           jsContent.includes('skew(');
        
        const testPassed = hasSlider && hasSkewCode;
        this.recordTest('Unterschrift Schrägheit', testPassed, 
            testPassed ? '✅ Schrägheits-Slider vorhanden' : '❌ Schrägheits-Slider fehlt');
        
        return testPassed;
    }

    /**
     * Test 13: Unterschriftenlinie Dicke und Farbe
     */
    testSignatureLineStyling() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const htmlPath = path.join(this.projectRoot, 'applications/resume-editor.html');
        
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const hasLineWidthSlider = htmlContent.includes('signatureLineWidth');
        const hasLineColorPicker = htmlContent.includes('signatureLineColor');
        const hasStylingCode = jsContent.includes('signatureLineWidth') &&
                              jsContent.includes('signatureLineColor');
        
        const testPassed = hasLineWidthSlider && hasLineColorPicker && hasStylingCode;
        this.recordTest('Unterschriftenlinie Styling', testPassed, 
            testPassed ? '✅ Linien-Styling Controls vorhanden' : '❌ Linien-Styling Controls fehlen');
        
        return testPassed;
    }

    /**
     * Test 14: Designvorlagen Farben zurücksetzen
     */
    testTemplateColorReset() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasColorResetCode = content.includes('updateUIFromSettings') &&
                                 (content.includes('designTextColor') || 
                                  content.includes('designMutedColor')) &&
                                 content.includes('colorSettings.forEach');
        
        this.recordTest('Designvorlagen Farben zurücksetzen', hasColorResetCode, 
            hasColorResetCode ? '✅ Farb-Reset Code vorhanden' : '❌ Farb-Reset Code fehlt');
        
        return hasColorResetCode;
    }

    /**
     * Test 15: Font Awesome CSS im PDF Export
     */
    testFontAwesomeInPDF() {
        const jsPath = path.join(this.projectRoot, 'applications/js/design-editor.js');
        const content = fs.readFileSync(jsPath, 'utf8');
        
        const hasFontAwesomeCode = content.includes('font-awesome') &&
                                  content.includes('cdnjs.cloudflare.com') &&
                                  content.includes('generateCompleteHTMLDocument');
        
        this.recordTest('Font Awesome CSS im PDF', hasFontAwesomeCode, 
            hasFontAwesomeCode ? '✅ Font Awesome Link Code vorhanden' : '❌ Font Awesome Link Code fehlt');
        
        return hasFontAwesomeCode;
    }

    /**
     * Zeichnet Testergebnis auf
     */
    recordTest(name, passed, message) {
        this.testResults.push({ name, passed, message });
        const icon = passed ? '✅' : '❌';
        console.log(`  ${icon} ${name}: ${message}`);
    }

    /**
     * Führt alle Tests aus
     */
    async runAllTests() {
        console.log('🚀 Starte automatisierte Tests für Lebenslauf-Editor Fixes...\n');
        console.log('═══════════════════════════════════════════\n');

        const tests = [
            () => this.testBulletIndent(),
            () => this.testProfileImageOffset(),
            () => this.testPhotoSaveOnUpload(),
            () => this.testCloudPhotosInGallery(),
            () => this.testSkillsLoading(),
            () => this.testOCRErrorHandling(),
            () => this.testWebsiteLinkClickable(),
            () => this.testPostalCodeComma(),
            () => this.testTogglePreservation(),
            () => this.testResumeTitlePosition(),
            () => this.testSignatureDragDrop(),
            () => this.testSignatureSkew(),
            () => this.testSignatureLineStyling(),
            () => this.testTemplateColorReset(),
            () => this.testFontAwesomeInPDF()
        ];

        for (const test of tests) {
            try {
                test();
            } catch (error) {
                console.error('❌ Test fehlgeschlagen:', error);
            }
        }

        this.printSummary();
        return this.testResults.filter(r => !r.passed);
    }

    /**
     * Druckt Test-Zusammenfassung
     */
    printSummary() {
        console.log('\n═══════════════════════════════════════════');
        console.log('📊 TEST-ZUSAMMENFASSUNG\n');

        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;
        const total = this.testResults.length;

        console.log(`Gesamt: ${total} Tests`);
        console.log(`✅ Bestanden: ${passed}`);
        console.log(`❌ Fehlgeschlagen: ${failed}`);
        console.log(`📈 Erfolgsquote: ${((passed / total) * 100).toFixed(1)}%\n`);

        if (failed > 0) {
            console.log('❌ Fehlgeschlagene Tests:');
            this.testResults.filter(r => !r.passed).forEach(result => {
                console.log(`   - ${result.name}: ${result.message}`);
            });
        }

        console.log('\n═══════════════════════════════════════════\n');
    }

    /**
     * Führt Test-Loop aus: Test → Analyse → Korrektur → Retest
     */
    async runTestLoop(maxIterations = 3) {
        let iteration = 0;
        
        while (iteration < maxIterations) {
            iteration++;
            console.log(`\n🔄 Test-Loop Iteration ${iteration}/${maxIterations}\n`);
            
            // Führe Tests aus
            const failedTests = await this.runAllTests();
            
            if (failedTests.length === 0) {
                console.log('🎉 Alle Tests bestanden!');
                return true;
            }
            
            console.log(`\n⚠️ ${failedTests.length} Tests fehlgeschlagen. Analysiere und korrigiere...\n`);
            
            // Analysiere fehlgeschlagene Tests
            await this.analyzeAndFix(failedTests);
            
            // Warte kurz vor Retest
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('⚠️ Maximale Iterationen erreicht. Einige Tests sind möglicherweise noch fehlgeschlagen.');
        return false;
    }

    /**
     * Analysiert fehlgeschlagene Tests und korrigiert sie
     */
    async analyzeAndFix(failedTests) {
        for (const test of failedTests) {
            console.log(`\n🔍 Analysiere: ${test.name}`);
            
            // Finde entsprechenden Fix
            const fix = this.fixes.find(f => f.test === test.name);
            if (fix) {
                console.log(`   📝 Korrigiere: ${fix.issue}`);
                try {
                    fix.fix();
                    console.log(`   ✅ Korrektur angewendet`);
                } catch (error) {
                    console.error(`   ❌ Fehler bei Korrektur: ${error.message}`);
                }
            } else {
                console.log(`   ⚠️ Kein automatischer Fix verfügbar - manuelle Korrektur erforderlich`);
            }
        }
    }
}

// Führe Tests aus wenn direkt aufgerufen
if (require.main === module) {
    const tester = new AutomatedResumeFixTester();
    tester.runTestLoop().catch(console.error);
}

module.exports = AutomatedResumeFixTester;
