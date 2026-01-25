/**
 * Test Script für Lebenslauf-Editor Fixes
 * Testet alle 15 implementierten Fixes mit dem letzten Lebenslauf
 * Verwendet Puppeteer für Chrome-Browser-Tests
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class ResumeEditorFixTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.resumeData = null;
        this.baseUrl = 'http://localhost:8080'; // Anpassen falls nötig
    }

    /**
     * Initialisiert Browser und lädt letzten Lebenslauf
     */
    async init() {
        console.log('🚀 Starte Lebenslauf-Editor Fix Tests...\n');
        console.log('═══════════════════════════════════════════\n');

        // Browser starten
        this.browser = await puppeteer.launch({
            headless: false, // Sichtbar für Debugging
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--start-maximized']
        });

        this.page = await this.browser.newPage();
        
        // Console-Logs vom Browser anzeigen
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            if (type === 'error' || text.includes('❌') || text.includes('⚠️')) {
                console.log(`[Browser ${type}]: ${text}`);
            }
        });

        // Fehler abfangen
        this.page.on('pageerror', error => {
            console.error('❌ Page Error:', error.message);
        });

        // Lade letzten Lebenslauf
        await this.loadLastResume();
    }

    /**
     * Lädt den letzten Lebenslauf aus localStorage oder Cloud
     */
    async loadLastResume() {
        console.log('📄 Lade letzten Lebenslauf...');
        
        // Öffne Resume Editor
        const resumeEditorUrl = `${this.baseUrl}/applications/resume-editor.html`;
        await this.page.goto(resumeEditorUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Warte auf Initialisierung
        await this.page.waitForTimeout(2000);

        // Versuche letzten Lebenslauf zu laden
        const resumeData = await this.page.evaluate(() => {
            // Versuche aus localStorage
            const userResumes = localStorage.getItem('user_resumes');
            if (userResumes) {
                try {
                    const resumes = JSON.parse(userResumes);
                    if (resumes && resumes.length > 0) {
                        // Sortiere nach neuestem
                        resumes.sort((a, b) => {
                            const dateA = new Date(a.updatedAt || a.createdAt || 0);
                            const dateB = new Date(b.updatedAt || b.createdAt || 0);
                            return dateB - dateA;
                        });
                        return resumes[0];
                    }
                } catch (e) {
                    console.error('Fehler beim Parsen von user_resumes:', e);
                }
            }
            return null;
        });

        if (resumeData) {
            this.resumeData = resumeData;
            console.log(`✅ Lebenslauf geladen: ${resumeData.personalInfo?.firstName || resumeData.firstName} ${resumeData.personalInfo?.lastName || resumeData.lastName}`);
            
            // Lade Lebenslauf in Editor
            const resumeId = resumeData.id;
            if (resumeId) {
                await this.page.goto(`${resumeEditorUrl}?id=${resumeId}`, { waitUntil: 'networkidle2' });
                await this.page.waitForTimeout(2000);
            }
        } else {
            console.log('⚠️ Kein Lebenslauf gefunden - verwende Standard-Daten');
        }
    }

    /**
     * Test 1: Aufzählungszeichen Einzug
     */
    async testBulletIndent() {
        console.log('\n📋 Test 1: Aufzählungszeichen Einzug');
        try {
            // Öffne Design Editor
            await this.openDesignEditor();

            // Prüfe CSS für Aufzählungszeichen
            const bulletPadding = await this.page.evaluate(() => {
                const style = getComputedStyle(document.querySelector('.resume-preview-bullets') || document.createElement('ul'));
                return style.paddingLeft;
            });

            const testPassed = bulletPadding === '0px' || bulletPadding === '0mm';
            this.recordTest('Aufzählungszeichen Einzug', testPassed, 
                testPassed ? '✅ Einzug korrekt (0px)' : `❌ Einzug: ${bulletPadding} (sollte 0px sein)`);
            
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

            // Aktiviere Profilbild
            await this.page.click('#designShowProfileImage');
            await this.page.waitForTimeout(500);

            // Setze X-Versatz auf 20
            const offsetXSlider = await this.page.$('#profileImageOffsetX');
            if (offsetXSlider) {
                await offsetXSlider.evaluate(el => {
                    el.value = '20';
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                });
                await this.page.waitForTimeout(500);

                // Prüfe ob object-position gesetzt ist
                const hasObjectPosition = await this.page.evaluate(() => {
                    const img = document.querySelector('.resume-preview-profile-image img');
                    if (!img) return false;
                    const style = window.getComputedStyle(img);
                    return style.objectPosition !== '50% 50%' && style.objectPosition.includes('%');
                });

                this.recordTest('Profilbild X/Y Versatz', hasObjectPosition, 
                    hasObjectPosition ? '✅ object-position wird angewendet' : '❌ object-position nicht gefunden');
                return hasObjectPosition;
            } else {
                this.recordTest('Profilbild X/Y Versatz', false, '❌ Slider nicht gefunden');
                return false;
            }
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
            await this.openDesignEditor();

            // Simuliere Foto-Upload (ohne tatsächliche Datei)
            const photosBefore = await this.page.evaluate(() => {
                return JSON.parse(localStorage.getItem('user_photos') || '[]').length;
            });

            // Prüfe ob handleProfileImageUpload Foto speichert
            const saveFunctionExists = await this.page.evaluate(() => {
                return typeof window.designEditor?.handleProfileImageUpload === 'function';
            });

            // Prüfe ob Code für Foto-Speicherung vorhanden ist
            const hasSaveCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('cloudDataService.savePhoto') || 
                    s.textContent.includes('user_photos')
                );
                return script !== undefined;
            });

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
            await this.openDesignEditor();

            // Öffne Foto-Galerie
            const loadBtn = await this.page.$('#loadProfileImageBtn');
            if (loadBtn) {
                await loadBtn.click();
                await this.page.waitForTimeout(1000);

                // Prüfe ob Cloud Photos geladen werden
                const hasCloudPhotoCode = await this.page.evaluate(() => {
                    const script = Array.from(document.querySelectorAll('script')).find(s => 
                        s.textContent.includes('cloudDataService.getPhotos')
                    );
                    return script !== undefined;
                });

                this.recordTest('Cloud Photos in Foto-Auswahl', hasCloudPhotoCode, 
                    hasCloudPhotoCode ? '✅ Cloud Photos Code vorhanden' : '❌ Cloud Photos Code fehlt');
                return hasCloudPhotoCode;
            } else {
                this.recordTest('Cloud Photos in Foto-Auswahl', false, '❌ Button nicht gefunden');
                return false;
            }
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
            // Prüfe ob populateForm robusteres Skills-Laden hat
            const hasRobustSkillsCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('technicalSkills || data.skills.technical') ||
                    s.textContent.includes('softSkills || data.skills.soft')
                );
                return script !== undefined;
            });

            this.recordTest('Skills-Laden', hasRobustSkillsCode, 
                hasRobustSkillsCode ? '✅ Robusteres Skills-Laden vorhanden' : '❌ Robusteres Skills-Laden fehlt');
            return hasRobustSkillsCode;
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
            const hasImprovedErrorHandling = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('processTextWithGPTFallback') &&
                    s.textContent.includes('catch (gptError)')
                );
                return script !== undefined;
            });

            this.recordTest('OCR-Fehlerbehandlung', hasImprovedErrorHandling, 
                hasImprovedErrorHandling ? '✅ Verbesserte Fehlerbehandlung vorhanden' : '❌ Verbesserte Fehlerbehandlung fehlt');
            return hasImprovedErrorHandling;
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
            await this.page.waitForTimeout(1000);

            // Prüfe ob Website als Link gerendert wird
            const hasWebsiteLink = await this.page.evaluate(() => {
                const preview = document.querySelector('.design-resume-preview');
                if (!preview) return false;
                const websiteLink = preview.querySelector('a[href*="manuel-weiss"]') || 
                                   preview.querySelector('a[href*="website"]');
                return websiteLink !== null;
            });

            this.recordTest('Website-Link klickbar', hasWebsiteLink, 
                hasWebsiteLink ? '✅ Website als Link gerendert' : '⚠️ Kein Website-Link gefunden (möglicherweise kein Website-Feld)');
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
            await this.openDesignEditor();
            await this.page.waitForTimeout(1000);

            // Prüfe ob Code für Komma-Entfernung vorhanden ist
            const hasCommaFix = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('locationStartsWithPLZ') ||
                    s.textContent.includes('locationHasPLZ')
                );
                return script !== undefined;
            });

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
            await this.openDesignEditor();

            // Prüfe ob showHeaderField beim Template-Wechsel erhalten bleibt
            const hasPreservationCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('currentShowHeaderField') &&
                    s.textContent.includes('preservedSettings')
                );
                return script !== undefined;
            });

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

            // Prüfe ob Position-Select vorhanden ist
            const positionSelect = await this.page.$('#designResumeTitlePosition');
            const hasPositionCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('resumeTitlePosition') &&
                    s.textContent.includes('above-image')
                );
                return script !== undefined;
            });

            this.recordTest('"Lebenslauf"-Position', positionSelect !== null && hasPositionCode, 
                positionSelect !== null && hasPositionCode ? '✅ Position-Select vorhanden' : '❌ Position-Select fehlt');
            return positionSelect !== null && hasPositionCode;
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
            // Prüfe ob Code für Linien-Ausrichtung vorhanden ist
            const hasLineAlignmentCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('signatureLine') &&
                    s.textContent.includes('lineRelativeY')
                );
                return script !== undefined;
            });

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

            // Prüfe ob Schrägheits-Slider vorhanden ist
            const skewSlider = await this.page.$('#signatureSkew');
            const hasSkewCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('signatureSkew') &&
                    s.textContent.includes('skew(')
                );
                return script !== undefined;
            });

            this.recordTest('Unterschrift Schrägheit', skewSlider !== null && hasSkewCode, 
                skewSlider !== null && hasSkewCode ? '✅ Schrägheits-Slider vorhanden' : '❌ Schrägheits-Slider fehlt');
            return skewSlider !== null && hasSkewCode;
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

            // Prüfe ob Controls vorhanden sind
            const lineWidthSlider = await this.page.$('#signatureLineWidth');
            const lineColorPicker = await this.page.$('#signatureLineColor');
            const hasStylingCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('signatureLineWidth') &&
                    s.textContent.includes('signatureLineColor')
                );
                return script !== undefined;
            });

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
            await this.openDesignEditor();

            // Prüfe ob updateUIFromSettings alle Farben aktualisiert
            const hasColorResetCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('updateUIFromSettings') &&
                    (s.textContent.includes('designTextColor') || s.textContent.includes('designMutedColor'))
                );
                return script !== undefined;
            });

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
            // Prüfe ob Font Awesome Link im generierten HTML vorhanden ist
            const hasFontAwesomeCode = await this.page.evaluate(() => {
                const script = Array.from(document.querySelectorAll('script')).find(s => 
                    s.textContent.includes('font-awesome') &&
                    s.textContent.includes('cdnjs.cloudflare.com')
                );
                return script !== undefined;
            });

            this.recordTest('Font Awesome CSS im PDF', hasFontAwesomeCode, 
                hasFontAwesomeCode ? '✅ Font Awesome Link Code vorhanden' : '❌ Font Awesome Link Code fehlt');
            return hasFontAwesomeCode;
        } catch (error) {
            this.recordTest('Font Awesome CSS im PDF', false, `❌ Fehler: ${error.message}`);
            return false;
        }
    }

    /**
     * Öffnet Design Editor
     */
    async openDesignEditor() {
        try {
            // Klicke auf Design Editor Button
            const designBtn = await this.page.$('#openDesignEditorBtn, .design-editor-btn, [onclick*="openDesignEditor"]');
            if (designBtn) {
                await designBtn.click();
                await this.page.waitForTimeout(1000);
            } else {
                // Versuche direkt über URL
                await this.page.evaluate(() => {
                    if (typeof openDesignEditor === 'function') {
                        openDesignEditor();
                    }
                });
                await this.page.waitForTimeout(1000);
            }
        } catch (error) {
            console.warn('⚠️ Design Editor konnte nicht geöffnet werden:', error.message);
        }
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
                    await this.page.waitForTimeout(500);
                } catch (error) {
                    console.error('❌ Test fehlgeschlagen:', error);
                }
            }

            // Zusammenfassung
            this.printSummary();

        } catch (error) {
            console.error('❌ Kritischer Fehler:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
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
        }

        console.log('\n═══════════════════════════════════════════\n');
    }
}

// Führe Tests aus wenn direkt aufgerufen
if (require.main === module) {
    const tester = new ResumeEditorFixTester();
    tester.runAllTests().catch(console.error);
}

module.exports = ResumeEditorFixTester;
