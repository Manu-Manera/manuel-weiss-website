#!/usr/bin/env node
/**
 * Intelligentes Benutzer-Test-System
 * Testet wie ein echter Benutzer und gibt detaillierte Rückmeldungen
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class UserBehaviorTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            userJourneys: [],
            errors: [],
            screenshots: [],
            performance: {},
            recommendations: []
        };
        this.browser = null;
        this.context = null;
    }

    /**
     * Startet den Browser und führt alle Benutzer-Tests durch
     */
    async runAllUserTests() {
        console.log('🤖 INTELLIGENTES BENUTZER-TEST-SYSTEM GESTARTET');
        console.log('===============================================');

        try {
            // Browser starten
            this.browser = await chromium.launch({ 
                headless: false, // Sichtbar für Debugging
                slowMo: 1000 // Langsamer für bessere Beobachtung
            });
            
            this.context = await this.browser.newContext({
                viewport: { width: 1920, height: 1080 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });

            // Benutzer-Journeys testen
            await this.testMainWebsiteJourney();
            await this.testAdminPanelJourney();
            await this.testKIWorkflowJourney();
            await this.testBewerbungsmanagerJourney();

            // Ergebnisse generieren
            this.generateDetailedReport();

        } catch (error) {
            console.error('❌ Test-System Fehler:', error.message);
            this.results.errors.push({
                type: 'SYSTEM_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    /**
     * Testet die Hauptwebsite wie ein echter Benutzer
     */
    async testMainWebsiteJourney() {
        console.log('🌐 Teste Hauptwebsite-Journey...');
        
        const page = await this.context.newPage();
        const journey = {
            name: 'Hauptwebsite-Besuch',
            steps: [],
            errors: [],
            screenshots: []
        };

        try {
            // Schritt 1: Website öffnen
            console.log('  📍 Öffne https://mawps.netlify.app...');
            await page.goto('https://mawps.netlify.app', { waitUntil: 'networkidle' });
            
            // Screenshot machen
            const screenshot1 = await page.screenshot({ path: 'test-screenshots/main-website.png' });
            journey.screenshots.push('test-screenshots/main-website.png');
            
            // Prüfen ob Seite lädt
            const title = await page.title();
            journey.steps.push({
                step: 'Website öffnen',
                status: title ? 'SUCCESS' : 'FAILED',
                details: `Titel: ${title}`,
                timestamp: new Date().toISOString()
            });

            // Schritt 2: Navigation testen
            console.log('  📍 Teste Navigation...');
            const navLinks = await page.$$('nav a, .nav a, header a');
            journey.steps.push({
                step: 'Navigation finden',
                status: navLinks.length > 0 ? 'SUCCESS' : 'FAILED',
                details: `${navLinks.length} Navigationslinks gefunden`,
                timestamp: new Date().toISOString()
            });

            // Schritt 3: Hero-Bereich prüfen
            console.log('  📍 Prüfe Hero-Bereich...');
            const heroElements = await page.$$('h1, .hero, .main-title');
            journey.steps.push({
                step: 'Hero-Bereich',
                status: heroElements.length > 0 ? 'SUCCESS' : 'FAILED',
                details: `${heroElements.length} Hero-Elemente gefunden`,
                timestamp: new Date().toISOString()
            });

            // Schritt 4: JavaScript-Funktionalität testen
            console.log('  📍 Teste JavaScript...');
            const jsErrors = await page.evaluate(() => {
                const errors = [];
                window.addEventListener('error', (e) => {
                    errors.push(e.message);
                });
                return errors;
            });
            
            journey.steps.push({
                step: 'JavaScript-Fehler',
                status: jsErrors.length === 0 ? 'SUCCESS' : 'FAILED',
                details: jsErrors.length === 0 ? 'Keine JS-Fehler' : `${jsErrors.length} JS-Fehler gefunden`,
                timestamp: new Date().toISOString()
            });

            // Schritt 5: Admin-Link testen
            console.log('  📍 Teste Admin-Link...');
            try {
                await page.click('a[href*="admin"], .admin-link');
                await page.waitForTimeout(2000);
                
                const currentUrl = page.url();
                journey.steps.push({
                    step: 'Admin-Link klicken',
                    status: currentUrl.includes('admin') ? 'SUCCESS' : 'FAILED',
                    details: `Aktuelle URL: ${currentUrl}`,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                journey.errors.push({
                    type: 'ADMIN_LINK_ERROR',
                    message: 'Admin-Link nicht klickbar',
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            journey.errors.push({
                type: 'MAIN_WEBSITE_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }

        this.results.userJourneys.push(journey);
        await page.close();
    }

    /**
     * Testet das Admin-Panel wie ein echter Benutzer
     */
    async testAdminPanelJourney() {
        console.log('🔧 Teste Admin-Panel-Journey...');
        
        const page = await this.context.newPage();
        const journey = {
            name: 'Admin-Panel-Besuch',
            steps: [],
            errors: [],
            screenshots: []
        };

        try {
            // Schritt 1: Admin-Panel öffnen
            console.log('  📍 Öffne Admin-Panel...');
            await page.goto('https://mawps.netlify.app/admin', { waitUntil: 'networkidle' });
            
            const screenshot = await page.screenshot({ path: 'test-screenshots/admin-panel.png' });
            journey.screenshots.push('test-screenshots/admin-panel.png');
            
            // Prüfen ob Admin-Panel lädt
            const adminTitle = await page.title();
            journey.steps.push({
                step: 'Admin-Panel öffnen',
                status: adminTitle ? 'SUCCESS' : 'FAILED',
                details: `Titel: ${adminTitle}`,
                timestamp: new Date().toISOString()
            });

            // Schritt 2: Admin-Elemente prüfen
            console.log('  📍 Prüfe Admin-Elemente...');
            const adminElements = await page.$$('.admin, .dashboard, .panel');
            journey.steps.push({
                step: 'Admin-Elemente',
                status: adminElements.length > 0 ? 'SUCCESS' : 'FAILED',
                details: `${adminElements.length} Admin-Elemente gefunden`,
                timestamp: new Date().toISOString()
            });

            // Schritt 3: Profilbild-Upload testen
            console.log('  📍 Teste Profilbild-Upload...');
            const uploadInput = await page.$('input[type="file"]');
            if (uploadInput) {
                journey.steps.push({
                    step: 'Profilbild-Upload',
                    status: 'SUCCESS',
                    details: 'Upload-Input gefunden',
                    timestamp: new Date().toISOString()
                });
            } else {
                journey.errors.push({
                    type: 'UPLOAD_INPUT_MISSING',
                    message: 'Kein Upload-Input für Profilbild gefunden',
                    timestamp: new Date().toISOString()
                });
            }

            // Schritt 4: Statistiken-Eingabe testen
            console.log('  📍 Teste Statistiken-Eingabe...');
            const statInputs = await page.$$('input[type="number"], input[type="text"]');
            journey.steps.push({
                step: 'Statistiken-Eingabe',
                status: statInputs.length > 0 ? 'SUCCESS' : 'FAILED',
                details: `${statInputs.length} Eingabefelder gefunden`,
                timestamp: new Date().toISOString()
            });

            // Schritt 5: Speichern-Button testen
            console.log('  📍 Teste Speichern-Button...');
            const saveButton = await page.$('button[type="submit"], .save-btn, .btn-save');
            if (saveButton) {
                journey.steps.push({
                    step: 'Speichern-Button',
                    status: 'SUCCESS',
                    details: 'Speichern-Button gefunden',
                    timestamp: new Date().toISOString()
                });
            } else {
                journey.errors.push({
                    type: 'SAVE_BUTTON_MISSING',
                    message: 'Kein Speichern-Button gefunden',
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            journey.errors.push({
                type: 'ADMIN_PANEL_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }

        this.results.userJourneys.push(journey);
        await page.close();
    }

    /**
     * Testet den KI-Workflow wie ein echter Benutzer
     */
    async testKIWorkflowJourney() {
        console.log('🤖 Teste KI-Workflow-Journey...');
        
        const page = await this.context.newPage();
        const journey = {
            name: 'KI-Workflow-Besuch',
            steps: [],
            errors: [],
            screenshots: []
        };

        try {
            // Schritt 1: Bewerbungsmanager öffnen
            console.log('  📍 Öffne Bewerbungsmanager...');
            await page.goto('https://mawps.netlify.app/bewerbungsmanager.html', { waitUntil: 'networkidle' });
            
            const screenshot1 = await page.screenshot({ path: 'test-screenshots/bewerbungsmanager.png' });
            journey.screenshots.push('test-screenshots/bewerbungsmanager.png');
            
            journey.steps.push({
                step: 'Bewerbungsmanager öffnen',
                status: 'SUCCESS',
                details: 'Bewerbungsmanager geladen',
                timestamp: new Date().toISOString()
            });

            // Schritt 2: KI-Workflow-Button testen
            console.log('  📍 Teste KI-Workflow-Button...');
            const kiButton = await page.$('a[href*="ki-bewerbungsworkflow"], .ki-workflow-btn');
            if (kiButton) {
                await kiButton.click();
                await page.waitForTimeout(2000);
                
                journey.steps.push({
                    step: 'KI-Workflow-Button',
                    status: 'SUCCESS',
                    details: 'KI-Workflow-Button geklickt',
                    timestamp: new Date().toISOString()
                });
            } else {
                journey.errors.push({
                    type: 'KI_BUTTON_MISSING',
                    message: 'KI-Workflow-Button nicht gefunden',
                    timestamp: new Date().toISOString()
                });
            }

            // Schritt 3: KI-Workflow-Seite prüfen
            console.log('  📍 Prüfe KI-Workflow-Seite...');
            const currentUrl = page.url();
            if (currentUrl.includes('ki-bewerbungsworkflow')) {
                const workflowSteps = await page.$$('.workflow-step-card, .step-card');
                journey.steps.push({
                    step: 'KI-Workflow-Seite',
                    status: 'SUCCESS',
                    details: `${workflowSteps.length} Workflow-Schritte gefunden`,
                    timestamp: new Date().toISOString()
                });
            } else {
                journey.errors.push({
                    type: 'KI_WORKFLOW_PAGE_ERROR',
                    message: 'KI-Workflow-Seite nicht erreicht',
                    timestamp: new Date().toISOString()
                });
            }

            // Schritt 4: Workflow-Schritte testen
            console.log('  📍 Teste Workflow-Schritte...');
            const stepButtons = await page.$$('.start-button, .btn-start');
            journey.steps.push({
                step: 'Workflow-Schritte',
                status: stepButtons.length > 0 ? 'SUCCESS' : 'FAILED',
                details: `${stepButtons.length} Schritt-Buttons gefunden`,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            journey.errors.push({
                type: 'KI_WORKFLOW_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }

        this.results.userJourneys.push(journey);
        await page.close();
    }

    /**
     * Testet den Bewerbungsmanager wie ein echter Benutzer
     */
    async testBewerbungsmanagerJourney() {
        console.log('📝 Teste Bewerbungsmanager-Journey...');
        
        const page = await this.context.newPage();
        const journey = {
            name: 'Bewerbungsmanager-Besuch',
            steps: [],
            errors: [],
            screenshots: []
        };

        try {
            // Schritt 1: Bewerbungsmanager öffnen
            console.log('  📍 Öffne Bewerbungsmanager...');
            await page.goto('https://mawps.netlify.app/bewerbungsmanager.html', { waitUntil: 'networkidle' });
            
            // Schritt 2: Feature-Buttons testen
            console.log('  📍 Teste Feature-Buttons...');
            const featureButtons = await page.$$('.feature-btn, .btn-feature');
            journey.steps.push({
                step: 'Feature-Buttons',
                status: featureButtons.length > 0 ? 'SUCCESS' : 'FAILED',
                details: `${featureButtons.length} Feature-Buttons gefunden`,
                timestamp: new Date().toISOString()
            });

            // Schritt 3: Analytics-Button testen
            console.log('  📍 Teste Analytics-Button...');
            const analyticsButton = await page.$('a[href*="analytics"], .analytics-btn');
            if (analyticsButton) {
                journey.steps.push({
                    step: 'Analytics-Button',
                    status: 'SUCCESS',
                    details: 'Analytics-Button gefunden',
                    timestamp: new Date().toISOString()
                });
            } else {
                journey.errors.push({
                    type: 'ANALYTICS_BUTTON_MISSING',
                    message: 'Analytics-Button nicht gefunden',
                    timestamp: new Date().toISOString()
                });
            }

            // Schritt 4: UI-Demo-Button testen
            console.log('  📍 Teste UI-Demo-Button...');
            const uiDemoButton = await page.$('a[href*="ui-demo"], .ui-demo-btn');
            if (uiDemoButton) {
                journey.steps.push({
                    step: 'UI-Demo-Button',
                    status: 'SUCCESS',
                    details: 'UI-Demo-Button gefunden',
                    timestamp: new Date().toISOString()
                });
            } else {
                journey.errors.push({
                    type: 'UI_DEMO_BUTTON_MISSING',
                    message: 'UI-Demo-Button nicht gefunden',
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            journey.errors.push({
                type: 'BEWERBUNGSMANAGER_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }

        this.results.userJourneys.push(journey);
        await page.close();
    }

    /**
     * Generiert detaillierten Bericht für Cursor
     */
    generateDetailedReport() {
        console.log('\n📊 DETAILLIERTER BENUTZER-TEST-BERICHT');
        console.log('=====================================');

        // Statistiken
        const totalJourneys = this.results.userJourneys.length;
        const totalSteps = this.results.userJourneys.reduce((sum, journey) => sum + journey.steps.length, 0);
        const successfulSteps = this.results.userJourneys.reduce((sum, journey) => 
            sum + journey.steps.filter(step => step.status === 'SUCCESS').length, 0);
        const totalErrors = this.results.userJourneys.reduce((sum, journey) => sum + journey.errors.length, 0);

        console.log(`\n📈 TEST-STATISTIKEN:`);
        console.log(`   Benutzer-Journeys: ${totalJourneys}`);
        console.log(`   Gesamte Schritte: ${totalSteps}`);
        console.log(`   ✅ Erfolgreich: ${successfulSteps}`);
        console.log(`   ❌ Fehlgeschlagen: ${totalSteps - successfulSteps}`);
        console.log(`   🚨 Fehler: ${totalErrors}`);

        // Detaillierte Ergebnisse pro Journey
        this.results.userJourneys.forEach((journey, index) => {
            console.log(`\n🔍 JOURNEY ${index + 1}: ${journey.name}`);
            console.log('   Schritte:');
            journey.steps.forEach(step => {
                const status = step.status === 'SUCCESS' ? '✅' : '❌';
                console.log(`     ${status} ${step.step}: ${step.details}`);
            });
            
            if (journey.errors.length > 0) {
                console.log('   Fehler:');
                journey.errors.forEach(error => {
                    console.log(`     ❌ ${error.type}: ${error.message}`);
                });
            }
        });

        // Empfehlungen für Cursor
        console.log(`\n💡 EMPFEHLUNGEN FÜR CURSOR:`);
        
        if (totalErrors > 0) {
            console.log(`   🚨 KRITISCHE PROBLEME:`);
            this.results.userJourneys.forEach(journey => {
                journey.errors.forEach(error => {
                    console.log(`     - ${error.type}: ${error.message}`);
                });
            });
        }

        if (successfulSteps / totalSteps < 0.8) {
            console.log(`   ⚠️  Viele Schritte fehlgeschlagen - Website-Funktionalität prüfen`);
        }

        // Spezifische Empfehlungen basierend auf Fehlern
        const errorTypes = new Set();
        this.results.userJourneys.forEach(journey => {
            journey.errors.forEach(error => errorTypes.add(error.type));
        });

        if (errorTypes.has('ADMIN_LINK_ERROR')) {
            console.log(`   🔧 Admin-Link reparieren`);
        }
        if (errorTypes.has('KI_BUTTON_MISSING')) {
            console.log(`   🔧 KI-Workflow-Button implementieren`);
        }
        if (errorTypes.has('UPLOAD_INPUT_MISSING')) {
            console.log(`   🔧 Profilbild-Upload implementieren`);
        }

        // Feedback-Datei speichern
        const feedbackFile = 'user-behavior-feedback.json';
        fs.writeFileSync(feedbackFile, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Detailliertes Feedback gespeichert: ${feedbackFile}`);

        // Cursor-spezifische Nachricht
        console.log(`\n🤖 CURSOR AI FEEDBACK:`);
        console.log(`   Erfolgsrate: ${Math.round((successfulSteps / totalSteps) * 100)}%`);
        console.log(`   Kritische Probleme: ${totalErrors}`);
        console.log(`   Empfehlung: ${totalErrors > 0 ? 'Sofortige Reparatur erforderlich' : 'System funktioniert gut'}`);
        
        return this.results;
    }
}

// Test-System ausführen
if (require.main === module) {
    const tester = new UserBehaviorTester();
    tester.runAllUserTests().catch(console.error);
}

module.exports = UserBehaviorTester;
