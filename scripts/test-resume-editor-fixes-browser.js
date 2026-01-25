/**
 * Browser-basiertes Test Script für Lebenslauf-Editor Fixes
 * 
 * Verwendung: 
 * 1. Öffne applications/resume-editor.html im Browser
 * 2. Öffne Browser-Konsole (F12)
 * 3. Führe aus: await window.resumeFixTester.runAllTests()
 * 
 * Oder lade dieses Script in die Seite ein:
 * <script src="scripts/test-resume-editor-fixes-browser.js"></script>
 */

class ResumeEditorFixTester {
    constructor() {
        this.testResults = [];
        this.resumeData = null;
    }

    /**
     * Initialisiert Tester und lädt letzten Lebenslauf
     */
    async init() {
        console.log('🚀 Starte Lebenslauf-Editor Fix Tests...\n');
        console.log('═══════════════════════════════════════════\n');

        // Lade letzten Lebenslauf
        await this.loadLastResume();
    }

    /**
     * Lädt den letzten Lebenslauf
     */
    async loadLastResume() {
        console.log('📄 Lade letzten Lebenslauf...');
        
        try {
            // Versuche aus localStorage
            const userResumes = localStorage.getItem('user_resumes');
            if (userResumes) {
                const resumes = JSON.parse(userResumes);
                if (resumes && resumes.length > 0) {
                    resumes.sort((a, b) => {
                        const dateA = new Date(a.updatedAt || a.createdAt || 0);
                        const dateB = new Date(b.updatedAt || b.createdAt || 0);
                        return dateB - dateA;
                    });
                    this.resumeData = resumes[0];
                    console.log(`✅ Lebenslauf geladen: ${this.resumeData.personalInfo?.firstName || this.resumeData.firstName} ${this.resumeData.personalInfo?.lastName || this.resumeData.lastName}`);
                    
                    // Lade in Editor falls vorhanden
                    if (typeof populateForm === 'function' && this.resumeData) {
                        populateForm(this.resumeData);
                        console.log('✅ Lebenslauf in Editor geladen');
                    }
                    return true;
                }
            }
            console.log('⚠️ Kein Lebenslauf gefunden');
            return false;
        } catch (error) {
            console.error('❌ Fehler beim Laden:', error);
            return false;
        }
    }

    /**
     * Öffnet Design Editor
     */
    async openDesignEditor() {
        try {
            if (typeof openDesignEditor === 'function') {
                openDesignEditor();
                await this.waitFor(() => document.getElementById('designEditorModal')?.classList.contains('active'), 3000);
                return true;
            }
            
            const btn = document.querySelector('#openDesignEditorBtn, .design-editor-btn, [onclick*="openDesignEditor"]');
            if (btn) {
                btn.click();
                await this.waitFor(() => document.getElementById('designEditorModal')?.classList.contains('active'), 3000);
                return true;
            }
            
            return false;
        } catch (error) {
            console.warn('⚠️ Design Editor konnte nicht geöffnet werden:', error);
            return false;
        }
    }

    /**
     * Wartet auf Bedingung
     */
    async waitFor(condition, timeout = 5000, interval = 100) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        return false;
    }

    /**
     * Test 1: Aufzählungszeichen Einzug
     */
    async testBulletIndent() {
        console.log('\n📋 Test 1: Aufzählungszeichen Einzug');
        try {
            await this.openDesignEditor();
            await this.waitFor(() => window.designEditor !== undefined, 3000);

            // Prüfe CSS
            const style = document.createElement('style');
            style.textContent = `
                .resume-preview-bullets {
                    margin: 0.5rem 0 0 0;
                    padding-left: 0;
                    list-style-type: disc;
                }
            `;
            document.head.appendChild(style);

            const testEl = document.createElement('ul');
            testEl.className = 'resume-preview-bullets';
            document.body.appendChild(testEl);
            
            const computedStyle = window.getComputedStyle(testEl);
            const paddingLeft = computedStyle.paddingLeft;
            
            document.body.removeChild(testEl);
            document.head.removeChild(style);

            // Prüfe ob Code in design-editor.css vorhanden ist
            const cssFile = await fetch('/applications/css/design-editor.css').then(r => r.text()).catch(() => '');
            const hasCorrectCSS = cssFile.includes('padding-left: 0') && cssFile.includes('.resume-preview-bullets');

            const testPassed = hasCorrectCSS;
            this.recordTest('Aufzählungszeichen Einzug', testPassed, 
                testPassed ? '✅ CSS korrekt (padding-left: 0)' : '❌ CSS nicht korrekt');
            
            return testPassed;
        } catch (error) {
            this.recordTest('Aufzählungszeichen Einzug', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 2: Profilbild X/Y Versatz
     */
    async testProfileImageOffset() {
        console.log('\n📋 Test 2: Profilbild X/Y Versatz');
        try {
            await this.openDesignEditor();
            await this.waitFor(() => window.designEditor !== undefined, 3000);

            // Prüfe ob object-position verwendet wird
            const hasObjectPosition = await this.checkCodeInScripts(
                'object-position:',
                'renderHeaderSection'
            );

            this.recordTest('Profilbild X/Y Versatz', hasObjectPosition, 
                hasObjectPosition ? '✅ object-position Code vorhanden' : '❌ object-position Code fehlt');
            return hasObjectPosition;
        } catch (error) {
            this.recordTest('Profilbild X/Y Versatz', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 3: Foto-Speicherung beim Upload
     */
    async testPhotoSaveOnUpload() {
        console.log('\n📋 Test 3: Foto-Speicherung beim Upload');
        try {
            const hasSaveCode = await this.checkCodeInScripts(
                'cloudDataService.savePhoto',
                'handleProfileImageUpload'
            );

            this.recordTest('Foto-Speicherung beim Upload', hasSaveCode, 
                hasSaveCode ? '✅ Foto-Speicherung Code vorhanden' : '❌ Foto-Speicherung Code fehlt');
            return hasSaveCode;
        } catch (error) {
            this.recordTest('Foto-Speicherung beim Upload', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 4: Cloud Photos in Foto-Auswahl
     */
    async testCloudPhotosInGallery() {
        console.log('\n📋 Test 4: Cloud Photos in Foto-Auswahl');
        try {
            const hasCloudPhotoCode = await this.checkCodeInScripts(
                'cloudDataService.getPhotos',
                'showApplicationImagesGallery'
            );

            this.recordTest('Cloud Photos in Foto-Auswahl', hasCloudPhotoCode, 
                hasCloudPhotoCode ? '✅ Cloud Photos Code vorhanden' : '❌ Cloud Photos Code fehlt');
            return hasCloudPhotoCode;
        } catch (error) {
            this.recordTest('Cloud Photos in Foto-Auswahl', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 5: Skills-Laden
     */
    async testSkillsLoading() {
        console.log('\n📋 Test 5: Skills-Laden');
        try {
            const hasRobustCode = await this.checkCodeInScripts(
                'technicalSkills || data.skills.technical',
                'populateForm'
            );

            this.recordTest('Skills-Laden', hasRobustCode, 
                hasRobustCode ? '✅ Robusteres Skills-Laden vorhanden' : '❌ Robusteres Skills-Laden fehlt');
            return hasRobustCode;
        } catch (error) {
            this.recordTest('Skills-Laden', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 6: OCR-Fehlerbehandlung
     */
    async testOCRErrorHandling() {
        console.log('\n📋 Test 6: OCR-Fehlerbehandlung');
        try {
            const hasErrorHandling = await this.checkCodeInScripts(
                'processTextWithGPTFallback',
                'uploadAndProcessPDF'
            );

            this.recordTest('OCR-Fehlerbehandlung', hasErrorHandling, 
                hasErrorHandling ? '✅ Verbesserte Fehlerbehandlung vorhanden' : '❌ Verbesserte Fehlerbehandlung fehlt');
            return hasErrorHandling;
        } catch (error) {
            this.recordTest('OCR-Fehlerbehandlung', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 7: Website-Link klickbar
     */
    async testWebsiteLinkClickable() {
        console.log('\n📋 Test 7: Website-Link klickbar');
        try {
            await this.openDesignEditor();
            await this.waitFor(() => window.designEditor !== undefined, 3000);

            // Aktualisiere Preview
            if (window.designEditor && typeof window.designEditor.updatePreview === 'function') {
                window.designEditor.updatePreview();
                await this.waitFor(() => document.querySelector('.design-resume-preview'), 3000);
            }

            // Prüfe ob Website als Link gerendert wird
            const hasWebsiteLink = await this.checkCodeInScripts(
                '<a href',
                'renderHeaderSection'
            ) && await this.checkCodeInScripts(
                'websiteUrl',
                'renderHeaderSection'
            );

            this.recordTest('Website-Link klickbar', hasWebsiteLink, 
                hasWebsiteLink ? '✅ Website-Link Code vorhanden' : '❌ Website-Link Code fehlt');
            return hasWebsiteLink;
        } catch (error) {
            this.recordTest('Website-Link klickbar', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 8: Komma nach Postleitzahl
     */
    async testPostalCodeComma() {
        console.log('\n📋 Test 8: Komma nach Postleitzahl');
        try {
            const hasCommaFix = await this.checkCodeInScripts(
                'locationStartsWithPLZ',
                'renderHeaderSection'
            );

            this.recordTest('Komma nach Postleitzahl', hasCommaFix, 
                hasCommaFix ? '✅ Komma-Entfernung Code vorhanden' : '❌ Komma-Entfernung Code fehlt');
            return hasCommaFix;
        } catch (error) {
            this.recordTest('Komma nach Postleitzahl', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 9: Geburtsdatum/GitHub-Toggle beim Template-Wechsel
     */
    async testTogglePreservation() {
        console.log('\n📋 Test 9: Geburtsdatum/GitHub-Toggle beim Template-Wechsel');
        try {
            const hasPreservationCode = await this.checkCodeInScripts(
                'currentShowHeaderField',
                'template'
            );

            this.recordTest('Toggle beim Template-Wechsel', hasPreservationCode, 
                hasPreservationCode ? '✅ Toggle-Erhaltung Code vorhanden' : '❌ Toggle-Erhaltung Code fehlt');
            return hasPreservationCode;
        } catch (error) {
            this.recordTest('Toggle beim Template-Wechsel', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 10: "Lebenslauf"-Position anpassbar
     */
    async testResumeTitlePosition() {
        console.log('\n📋 Test 10: "Lebenslauf"-Position anpassbar');
        try {
            await this.openDesignEditor();
            await this.waitFor(() => window.designEditor !== undefined, 3000);

            const positionSelect = document.getElementById('designResumeTitlePosition');
            const hasPositionCode = await this.checkCodeInScripts(
                'resumeTitlePosition',
                'renderHeaderSection'
            );

            const testPassed = positionSelect !== null && hasPositionCode;
            this.recordTest('"Lebenslauf"-Position', testPassed, 
                testPassed ? '✅ Position-Select vorhanden' : '❌ Position-Select fehlt');
            return testPassed;
        } catch (error) {
            this.recordTest('"Lebenslauf"-Position', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 11: Unterschrift Drag & Drop auf Linie
     */
    async testSignatureDragDrop() {
        console.log('\n📋 Test 11: Unterschrift Drag & Drop auf Linie');
        try {
            const hasLineAlignmentCode = await this.checkCodeInScripts(
                'lineRelativeY',
                'setupSignatureDragDrop'
            );

            this.recordTest('Unterschrift Drag & Drop auf Linie', hasLineAlignmentCode, 
                hasLineAlignmentCode ? '✅ Linien-Ausrichtung Code vorhanden' : '❌ Linien-Ausrichtung Code fehlt');
            return hasLineAlignmentCode;
        } catch (error) {
            this.recordTest('Unterschrift Drag & Drop auf Linie', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 12: Unterschrift Schrägheit
     */
    async testSignatureSkew() {
        console.log('\n📋 Test 12: Unterschrift Schrägheit');
        try {
            await this.openDesignEditor();
            await this.waitFor(() => window.designEditor !== undefined, 3000);

            const skewSlider = document.getElementById('signatureSkew');
            const hasSkewCode = await this.checkCodeInScripts(
                'signatureSkew',
                'renderSignatureSection'
            ) && await this.checkCodeInScripts(
                'skew(',
                'renderSignatureSection'
            );

            const testPassed = skewSlider !== null && hasSkewCode;
            this.recordTest('Unterschrift Schrägheit', testPassed, 
                testPassed ? '✅ Schrägheits-Slider vorhanden' : '❌ Schrägheits-Slider fehlt');
            return testPassed;
        } catch (error) {
            this.recordTest('Unterschrift Schrägheit', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 13: Unterschriftenlinie Dicke und Farbe
     */
    async testSignatureLineStyling() {
        console.log('\n📋 Test 13: Unterschriftenlinie Dicke und Farbe');
        try {
            await this.openDesignEditor();
            await this.waitFor(() => window.designEditor !== undefined, 3000);

            const lineWidthSlider = document.getElementById('signatureLineWidth');
            const lineColorPicker = document.getElementById('signatureLineColor');
            const hasStylingCode = await this.checkCodeInScripts(
                'signatureLineWidth',
                'renderSignatureSection'
            ) && await this.checkCodeInScripts(
                'signatureLineColor',
                'renderSignatureSection'
            );

            const testPassed = lineWidthSlider !== null && lineColorPicker !== null && hasStylingCode;
            this.recordTest('Unterschriftenlinie Styling', testPassed, 
                testPassed ? '✅ Linien-Styling Controls vorhanden' : '❌ Linien-Styling Controls fehlen');
            return testPassed;
        } catch (error) {
            this.recordTest('Unterschriftenlinie Styling', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 14: Designvorlagen Farben zurücksetzen
     */
    async testTemplateColorReset() {
        console.log('\n📋 Test 14: Designvorlagen Farben zurücksetzen');
        try {
            const hasColorResetCode = await this.checkCodeInScripts(
                'updateUIFromSettings',
                'designTextColor'
            ) || await this.checkCodeInScripts(
                'updateUIFromSettings',
                'designMutedColor'
            );

            this.recordTest('Designvorlagen Farben zurücksetzen', hasColorResetCode, 
                hasColorResetCode ? '✅ Farb-Reset Code vorhanden' : '❌ Farb-Reset Code fehlt');
            return hasColorResetCode;
        } catch (error) {
            this.recordTest('Designvorlagen Farben zurücksetzen', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Test 15: Font Awesome CSS im PDF Export
     */
    async testFontAwesomeInPDF() {
        console.log('\n📋 Test 15: Font Awesome CSS im PDF Export');
        try {
            const hasFontAwesomeCode = await this.checkCodeInScripts(
                'font-awesome',
                'generateCompleteHTMLDocument'
            ) || await this.checkCodeInScripts(
                'cdnjs.cloudflare.com',
                'generateCompleteHTMLDocument'
            );

            this.recordTest('Font Awesome CSS im PDF', hasFontAwesomeCode, 
                hasFontAwesomeCode ? '✅ Font Awesome Link Code vorhanden' : '❌ Font Awesome Link Code fehlt');
            return hasFontAwesomeCode;
        } catch (error) {
            this.recordTest('Font Awesome CSS im PDF', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Prüft ob Code in geladenen Scripts vorhanden ist
     */
    async checkCodeInScripts(searchTerm, contextFunction = '') {
        try {
            // Prüfe inline Scripts
            const scripts = Array.from(document.querySelectorAll('script'));
            for (const script of scripts) {
                const content = script.textContent || script.innerHTML;
                if (content.includes(searchTerm)) {
                    if (!contextFunction || content.includes(contextFunction)) {
                        return true;
                    }
                }
            }

            // Prüfe externe Scripts (nur wenn geladen)
            if (window.designEditor) {
                const designEditorCode = window.designEditor.toString();
                if (designEditorCode.includes(searchTerm)) {
                    if (!contextFunction || designEditorCode.includes(contextFunction)) {
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            console.warn('⚠️ Fehler beim Prüfen von Code:', error);
            return false;
        }
    }

    /**
     * Zeichnet Testergebnis auf
     */
    recordTest(name, passed, message) {
        this.testResults.push({ name, passed, message, timestamp: new Date().toISOString() });
        const icon = passed ? '✅' : '❌';
        console.log(`  ${icon} ${name}: ${message}`);
    }

    /**
     * Führt alle Tests aus
     */
    async runAllTests() {
        try {
            await this.init();

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
                    await test();
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error('❌ Test fehlgeschlagen:', error);
                }
            }

            // Zusammenfassung
            this.printSummary();

            // Gibt fehlgeschlagene Tests zurück für weitere Analyse
            return this.testResults.filter(r => !r.passed);

        } catch (error) {
            console.error('❌ Kritischer Fehler:', error);
            return [];
        }
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
            console.log('\n💡 Nächste Schritte:');
            console.log('   1. Analysiere fehlgeschlagene Tests');
            console.log('   2. Prüfe Code in den entsprechenden Dateien');
            console.log('   3. Korrigiere fehlende Implementierungen');
            console.log('   4. Führe Tests erneut aus: await window.resumeFixTester.runAllTests()');
        } else {
            console.log('🎉 Alle Tests bestanden!');
        }

        console.log('\n═══════════════════════════════════════════\n');
    }
}

// Exportiere für Browser
if (typeof window !== 'undefined') {
    window.resumeFixTester = new ResumeEditorFixTester();
    console.log('✅ Resume Editor Fix Tester geladen. Führe aus: await window.resumeFixTester.runAllTests()');
}

// Exportiere für Node.js (falls benötigt)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeEditorFixTester;
}
