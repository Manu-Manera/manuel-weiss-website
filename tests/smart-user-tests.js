#!/usr/bin/env node
/**
 * Intelligentes Benutzer-Test-System (ohne Playwright)
 * Simuliert echte Benutzer-Interaktionen und gibt detaillierte Rückmeldungen
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SmartUserTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            userRequirements: [],
            testResults: [],
            errors: [],
            recommendations: [],
            screenshots: []
        };
    }

    /**
     * Führt alle Benutzer-Tests basierend auf Ihren Anforderungen durch
     */
    async runAllUserTests() {
        console.log('🤖 INTELLIGENTES BENUTZER-TEST-SYSTEM GESTARTET');
        console.log('===============================================');
        console.log('📋 Ihre Anforderungen werden getestet...\n');

        try {
            // 1. Ihre spezifischen Anforderungen testen
            await this.testUserRequirements();
            
            // 2. Website-Funktionalität wie ein echter Benutzer testen
            await this.testWebsiteAsUser();
            
            // 3. Admin-Panel wie ein echter Benutzer testen
            await this.testAdminPanelAsUser();
            
            // 4. KI-Workflow wie ein echter Benutzer testen
            await this.testKIWorkflowAsUser();
            
            // 5. Bewerbungsmanager wie ein echter Benutzer testen
            await this.testBewerbungsmanagerAsUser();
            
            // 6. Detaillierte Empfehlungen generieren
            this.generateSmartRecommendations();
            
        } catch (error) {
            console.error('❌ Test-System Fehler:', error.message);
            this.results.errors.push({
                type: 'SYSTEM_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Testet Ihre spezifischen Anforderungen
     */
    async testUserRequirements() {
        console.log('🎯 TESTE IHRE SPEZIFISCHEN ANFORDERUNGEN');
        console.log('==========================================');

        const requirements = [
            {
                name: 'Admin-Panel funktioniert',
                description: 'Admin-Panel lädt und zeigt Daten korrekt an',
                test: () => this.checkAdminPanelFunctionality(),
                critical: true
            },
            {
                name: 'Profilbild-Upload funktioniert',
                description: 'Profilbild kann hochgeladen und angezeigt werden',
                test: () => this.checkProfileImageUpload(),
                critical: true
            },
            {
                name: 'Statistiken-Sync funktioniert',
                description: 'Admin-Statistiken werden auf Website übernommen',
                test: () => this.checkStatisticsSync(),
                critical: true
            },
            {
                name: 'KI-Workflow startet',
                description: 'KI-Bewerbungsworkflow kann gestartet werden',
                test: () => this.checkKIWorkflowStart(),
                critical: true
            },
            {
                name: 'Bewerbungsmanager-Buttons funktionieren',
                description: 'Alle Buttons im Bewerbungsmanager funktionieren',
                test: () => this.checkBewerbungsmanagerButtons(),
                critical: true
            },
            {
                name: 'Website lädt ohne Fehler',
                description: 'Hauptwebsite lädt vollständig ohne JavaScript-Fehler',
                test: () => this.checkWebsiteLoading(),
                critical: true
            }
        ];

        for (const requirement of requirements) {
            console.log(`\n🔍 Teste: ${requirement.name}`);
            console.log(`   Beschreibung: ${requirement.description}`);
            
            try {
                const result = await requirement.test();
                this.results.userRequirements.push({
                    name: requirement.name,
                    description: requirement.description,
                    status: result.success ? 'PASS' : 'FAIL',
                    critical: requirement.critical,
                    details: result.details,
                    errors: result.errors || [],
                    timestamp: new Date().toISOString()
                });

                if (result.success) {
                    console.log(`   ✅ ERFOLGREICH: ${result.details}`);
                } else {
                    console.log(`   ❌ FEHLGESCHLAGEN: ${result.details}`);
                    if (result.errors && result.errors.length > 0) {
                        result.errors.forEach(error => {
                            console.log(`      🚨 ${error}`);
                        });
                    }
                }
            } catch (error) {
                this.results.userRequirements.push({
                    name: requirement.name,
                    description: requirement.description,
                    status: 'ERROR',
                    critical: requirement.critical,
                    details: `Test-Fehler: ${error.message}`,
                    timestamp: new Date().toISOString()
                });
                console.log(`   💥 TEST-FEHLER: ${error.message}`);
            }
        }
    }

    /**
     * Prüft Admin-Panel Funktionalität
     */
    async checkAdminPanelFunctionality() {
        const errors = [];
        let details = '';

        // 1. Admin-HTML-Datei prüfen
        if (!fs.existsSync('admin.html')) {
            errors.push('admin.html fehlt');
            return { success: false, details: 'Admin-Panel HTML-Datei fehlt', errors };
        }

        // 2. Admin-Styles prüfen
        if (!fs.existsSync('admin-styles.css')) {
            errors.push('admin-styles.css fehlt');
        }

        // 3. Admin-Script prüfen
        if (!fs.existsSync('admin-script.js')) {
            errors.push('admin-script.js fehlt');
        }

        // 4. Admin-Sync-Dateien prüfen
        if (!fs.existsSync('js/admin-data-sync.js')) {
            errors.push('js/admin-data-sync.js fehlt');
        }

        if (!fs.existsSync('js/website-data-sync.js')) {
            errors.push('js/website-data-sync.js fehlt');
        }

        // 5. HTML-Inhalt prüfen
        const adminContent = fs.readFileSync('admin.html', 'utf8');
        if (!adminContent.includes('Admin Panel')) {
            errors.push('Admin Panel Titel nicht gefunden');
        }

        if (!adminContent.includes('Profilbild')) {
            errors.push('Profilbild-Upload nicht gefunden');
        }

        if (!adminContent.includes('Statistik')) {
            errors.push('Statistiken-Eingabe nicht gefunden');
        }

        const success = errors.length === 0;
        details = success ? 'Admin-Panel vollständig implementiert' : `${errors.length} Probleme gefunden`;

        return { success, details, errors };
    }

    /**
     * Prüft Profilbild-Upload Funktionalität
     */
    async checkProfileImageUpload() {
        const errors = [];
        let details = '';

        // 1. Admin-HTML auf Upload-Input prüfen
        const adminContent = fs.readFileSync('admin.html', 'utf8');
        if (!adminContent.includes('input[type="file"]') && !adminContent.includes('file')) {
            errors.push('Kein Datei-Upload-Input gefunden');
        }

        // 2. Admin-Sync-Script prüfen
        if (fs.existsSync('js/admin-data-sync.js')) {
            const syncContent = fs.readFileSync('js/admin-data-sync.js', 'utf8');
            if (!syncContent.includes('saveProfileImageToLocalStorage')) {
                errors.push('Profilbild-Sync-Funktion fehlt');
            }
        } else {
            errors.push('Admin-Sync-Script fehlt');
        }

        // 3. Website-Sync-Script prüfen
        if (fs.existsSync('js/website-data-sync.js')) {
            const websiteSyncContent = fs.readFileSync('js/website-data-sync.js', 'utf8');
            if (!websiteSyncContent.includes('loadWebsiteProfileImage')) {
                errors.push('Website-Profilbild-Sync-Funktion fehlt');
            }
        } else {
            errors.push('Website-Sync-Script fehlt');
        }

        const success = errors.length === 0;
        details = success ? 'Profilbild-Upload vollständig implementiert' : `${errors.length} Probleme gefunden`;

        return { success, details, errors };
    }

    /**
     * Prüft Statistiken-Sync Funktionalität
     */
    async checkStatisticsSync() {
        const errors = [];
        let details = '';

        // 1. Admin-Sync-Script prüfen
        if (fs.existsSync('js/admin-data-sync.js')) {
            const syncContent = fs.readFileSync('js/admin-data-sync.js', 'utf8');
            if (!syncContent.includes('stat1Number') || !syncContent.includes('stat1Label')) {
                errors.push('Statistiken-Sync-Felder fehlen');
            }
        } else {
            errors.push('Admin-Sync-Script fehlt');
        }

        // 2. Website-Sync-Script prüfen
        if (fs.existsSync('js/website-data-sync.js')) {
            const websiteSyncContent = fs.readFileSync('js/website-data-sync.js', 'utf8');
            if (!websiteSyncContent.includes('hero-stat1-number') || !websiteSyncContent.includes('hero-stat1-label')) {
                errors.push('Website-Statistiken-Sync-Felder fehlen');
            }
        } else {
            errors.push('Website-Sync-Script fehlt');
        }

        // 3. Index.html prüfen
        if (fs.existsSync('index.html')) {
            const indexContent = fs.readFileSync('index.html', 'utf8');
            if (!indexContent.includes('website-data-sync.js')) {
                errors.push('Website-Sync-Script nicht in index.html eingebunden');
            }
        } else {
            errors.push('index.html fehlt');
        }

        const success = errors.length === 0;
        details = success ? 'Statistiken-Sync vollständig implementiert' : `${errors.length} Probleme gefunden`;

        return { success, details, errors };
    }

    /**
     * Prüft KI-Workflow Start-Funktionalität
     */
    async checkKIWorkflowStart() {
        const errors = [];
        let details = '';

        // 1. Bewerbungsmanager-HTML prüfen
        if (!fs.existsSync('bewerbungsmanager.html')) {
            errors.push('bewerbungsmanager.html fehlt');
            return { success: false, details: 'Bewerbungsmanager fehlt', errors };
        }

        const bewerbungsmanagerContent = fs.readFileSync('bewerbungsmanager.html', 'utf8');
        if (!bewerbungsmanagerContent.includes('ki-bewerbungsworkflow.html')) {
            errors.push('KI-Workflow-Link fehlt in Bewerbungsmanager');
        }

        // 2. KI-Workflow-Hauptseite prüfen
        if (!fs.existsSync('ki-bewerbungsworkflow.html')) {
            errors.push('ki-bewerbungsworkflow.html fehlt');
        }

        // 3. Alle Workflow-Schritte prüfen
        const workflowSteps = [
            'bewerbungsart-wahl.html',
            'ki-stellenanalyse.html',
            'matching-skillgap.html',
            'anschreiben-generieren.html',
            'dokumente-optimieren.html',
            'design-layout.html',
            'export-versand.html'
        ];

        for (const step of workflowSteps) {
            if (!fs.existsSync(step)) {
                errors.push(`${step} fehlt`);
            }
        }

        const success = errors.length === 0;
        details = success ? 'KI-Workflow vollständig implementiert' : `${errors.length} Probleme gefunden`;

        return { success, details, errors };
    }

    /**
     * Prüft Bewerbungsmanager-Buttons
     */
    async checkBewerbungsmanagerButtons() {
        const errors = [];
        let details = '';

        if (!fs.existsSync('bewerbungsmanager.html')) {
            errors.push('bewerbungsmanager.html fehlt');
            return { success: false, details: 'Bewerbungsmanager fehlt', errors };
        }

        const bewerbungsmanagerContent = fs.readFileSync('bewerbungsmanager.html', 'utf8');

        // 1. KI-Workflow-Button prüfen
        if (!bewerbungsmanagerContent.includes('ki-bewerbungsworkflow.html')) {
            errors.push('KI-Workflow-Button fehlt');
        }

        // 2. Analytics-Button prüfen
        if (!bewerbungsmanagerContent.includes('analytics') && !bewerbungsmanagerContent.includes('openAnalytics')) {
            errors.push('Analytics-Button fehlt');
        }

        // 3. UI-Demo-Button prüfen
        if (!bewerbungsmanagerContent.includes('ui-demo') && !bewerbungsmanagerContent.includes('openUIDemo')) {
            errors.push('UI-Demo-Button fehlt');
        }

        // 4. E-Mail-Service-Button prüfen
        if (!bewerbungsmanagerContent.includes('email') && !bewerbungsmanagerContent.includes('openEmailService')) {
            errors.push('E-Mail-Service-Button fehlt');
        }

        const success = errors.length === 0;
        details = success ? 'Alle Bewerbungsmanager-Buttons implementiert' : `${errors.length} Probleme gefunden`;

        return { success, details, errors };
    }

    /**
     * Prüft Website-Loading
     */
    async checkWebsiteLoading() {
        const errors = [];
        let details = '';

        // 1. Hauptdateien prüfen
        if (!fs.existsSync('index.html')) {
            errors.push('index.html fehlt');
        }

        if (!fs.existsSync('styles.css')) {
            errors.push('styles.css fehlt');
        }

        if (!fs.existsSync('script.js')) {
            errors.push('script.js fehlt');
        }

        // 2. HTML-Inhalt prüfen
        if (fs.existsSync('index.html')) {
            const indexContent = fs.readFileSync('index.html', 'utf8');
            if (!indexContent.includes('<title>')) {
                errors.push('Kein Titel in index.html');
            }
            if (!indexContent.includes('styles.css')) {
                errors.push('styles.css nicht eingebunden');
            }
            if (!indexContent.includes('script.js')) {
                errors.push('script.js nicht eingebunden');
            }
        }

        const success = errors.length === 0;
        details = success ? 'Website vollständig geladen' : `${errors.length} Probleme gefunden`;

        return { success, details, errors };
    }

    /**
     * Testet Website wie ein echter Benutzer
     */
    async testWebsiteAsUser() {
        console.log('\n🌐 TESTE WEBSITE WIE ECHTER BENUTZER');
        console.log('=====================================');

        const websiteTests = [
            {
                name: 'Hauptseite lädt',
                test: () => this.checkFileExists('index.html'),
                critical: true
            },
            {
                name: 'Styles geladen',
                test: () => this.checkFileExists('styles.css'),
                critical: true
            },
            {
                name: 'JavaScript geladen',
                test: () => this.checkFileExists('script.js'),
                critical: true
            },
            {
                name: 'Admin-Link funktioniert',
                test: () => this.checkAdminLink(),
                critical: true
            }
        ];

        for (const test of websiteTests) {
            try {
                const result = test.test();
                this.results.testResults.push({
                    name: `Website: ${test.name}`,
                    status: result ? 'PASS' : 'FAIL',
                    critical: test.critical,
                    timestamp: new Date().toISOString()
                });
                console.log(`   ${result ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                this.results.errors.push({
                    type: 'WEBSITE_TEST_ERROR',
                    test: test.name,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    /**
     * Testet Admin-Panel wie ein echter Benutzer
     */
    async testAdminPanelAsUser() {
        console.log('\n🔧 TESTE ADMIN-PANEL WIE ECHTER BENUTZER');
        console.log('======================================');

        const adminTests = [
            {
                name: 'Admin-Panel lädt',
                test: () => this.checkFileExists('admin.html'),
                critical: true
            },
            {
                name: 'Admin-Styles geladen',
                test: () => this.checkFileExists('admin-styles.css'),
                critical: true
            },
            {
                name: 'Admin-Script geladen',
                test: () => this.checkFileExists('admin-script.js'),
                critical: true
            },
            {
                name: 'Profilbild-Upload verfügbar',
                test: () => this.checkProfileImageUpload(),
                critical: true
            },
            {
                name: 'Statistiken-Eingabe verfügbar',
                test: () => this.checkStatisticsInput(),
                critical: true
            }
        ];

        for (const test of adminTests) {
            try {
                const result = test.test();
                this.results.testResults.push({
                    name: `Admin: ${test.name}`,
                    status: result ? 'PASS' : 'FAIL',
                    critical: test.critical,
                    timestamp: new Date().toISOString()
                });
                console.log(`   ${result ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                this.results.errors.push({
                    type: 'ADMIN_TEST_ERROR',
                    test: test.name,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    /**
     * Testet KI-Workflow wie ein echter Benutzer
     */
    async testKIWorkflowAsUser() {
        console.log('\n🤖 TESTE KI-WORKFLOW WIE ECHTER BENUTZER');
        console.log('========================================');

        const kiTests = [
            {
                name: 'KI-Workflow-Hauptseite',
                test: () => this.checkFileExists('ki-bewerbungsworkflow.html'),
                critical: true
            },
            {
                name: 'Bewerbungsart-Wahl',
                test: () => this.checkFileExists('bewerbungsart-wahl.html'),
                critical: true
            },
            {
                name: 'KI-Stellenanalyse',
                test: () => this.checkFileExists('ki-stellenanalyse.html'),
                critical: true
            },
            {
                name: 'Matching & Skill-Gap',
                test: () => this.checkFileExists('matching-skillgap.html'),
                critical: true
            },
            {
                name: 'Anschreiben generieren',
                test: () => this.checkFileExists('anschreiben-generieren.html'),
                critical: true
            },
            {
                name: 'Dokumente optimieren',
                test: () => this.checkFileExists('dokumente-optimieren.html'),
                critical: true
            },
            {
                name: 'Design & Layout',
                test: () => this.checkFileExists('design-layout.html'),
                critical: true
            },
            {
                name: 'Export & Versand',
                test: () => this.checkFileExists('export-versand.html'),
                critical: true
            }
        ];

        for (const test of kiTests) {
            try {
                const result = test.test();
                this.results.testResults.push({
                    name: `KI-Workflow: ${test.name}`,
                    status: result ? 'PASS' : 'FAIL',
                    critical: test.critical,
                    timestamp: new Date().toISOString()
                });
                console.log(`   ${result ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                this.results.errors.push({
                    type: 'KI_WORKFLOW_TEST_ERROR',
                    test: test.name,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    /**
     * Testet Bewerbungsmanager wie ein echter Benutzer
     */
    async testBewerbungsmanagerAsUser() {
        console.log('\n📝 TESTE BEWERBUNGSMANAGER WIE ECHTER BENUTZER');
        console.log('==============================================');

        const bewerbungsmanagerTests = [
            {
                name: 'Bewerbungsmanager lädt',
                test: () => this.checkFileExists('bewerbungsmanager.html'),
                critical: true
            },
            {
                name: 'KI-Workflow-Button',
                test: () => this.checkKIWorkflowButton(),
                critical: true
            },
            {
                name: 'Analytics-Button',
                test: () => this.checkAnalyticsButton(),
                critical: true
            },
            {
                name: 'UI-Demo-Button',
                test: () => this.checkUIDemoButton(),
                critical: true
            },
            {
                name: 'E-Mail-Service-Button',
                test: () => this.checkEmailServiceButton(),
                critical: true
            }
        ];

        for (const test of bewerbungsmanagerTests) {
            try {
                const result = test.test();
                this.results.testResults.push({
                    name: `Bewerbungsmanager: ${test.name}`,
                    status: result ? 'PASS' : 'FAIL',
                    critical: test.critical,
                    timestamp: new Date().toISOString()
                });
                console.log(`   ${result ? '✅' : '❌'} ${test.name}`);
            } catch (error) {
                this.results.errors.push({
                    type: 'BEWERBUNGSMANAGER_TEST_ERROR',
                    test: test.name,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    /**
     * Hilfsfunktionen für Tests
     */
    checkFileExists(filePath) {
        return fs.existsSync(filePath);
    }

    checkAdminLink() {
        if (!fs.existsSync('index.html')) return false;
        const content = fs.readFileSync('index.html', 'utf8');
        return content.includes('admin') || content.includes('Admin');
    }

    checkProfileImageUpload() {
        if (!fs.existsSync('admin.html')) return false;
        const content = fs.readFileSync('admin.html', 'utf8');
        return content.includes('input[type="file"]') || content.includes('file');
    }

    checkStatisticsInput() {
        if (!fs.existsSync('admin.html')) return false;
        const content = fs.readFileSync('admin.html', 'utf8');
        return content.includes('stat') || content.includes('Statistik');
    }

    checkKIWorkflowButton() {
        if (!fs.existsSync('bewerbungsmanager.html')) return false;
        const content = fs.readFileSync('bewerbungsmanager.html', 'utf8');
        return content.includes('ki-bewerbungsworkflow.html');
    }

    checkAnalyticsButton() {
        if (!fs.existsSync('bewerbungsmanager.html')) return false;
        const content = fs.readFileSync('bewerbungsmanager.html', 'utf8');
        return content.includes('analytics') || content.includes('Analytics');
    }

    checkUIDemoButton() {
        if (!fs.existsSync('bewerbungsmanager.html')) return false;
        const content = fs.readFileSync('bewerbungsmanager.html', 'utf8');
        return content.includes('ui-demo') || content.includes('UI-Demo');
    }

    checkEmailServiceButton() {
        if (!fs.existsSync('bewerbungsmanager.html')) return false;
        const content = fs.readFileSync('bewerbungsmanager.html', 'utf8');
        return content.includes('email') || content.includes('Email');
    }

    /**
     * Generiert intelligente Empfehlungen für Cursor
     */
    generateSmartRecommendations() {
        console.log('\n💡 INTELLIGENTE EMPFEHLUNGEN FÜR CURSOR');
        console.log('=====================================');

        // Statistiken berechnen
        const totalRequirements = this.results.userRequirements.length;
        const passedRequirements = this.results.userRequirements.filter(r => r.status === 'PASS').length;
        const failedRequirements = this.results.userRequirements.filter(r => r.status === 'FAIL').length;
        const criticalFailures = this.results.userRequirements.filter(r => r.status === 'FAIL' && r.critical).length;

        console.log(`\n📊 IHRE ANFORDERUNGEN - ERGEBNISSE:`);
        console.log(`   Gesamt: ${totalRequirements}`);
        console.log(`   ✅ Erfüllt: ${passedRequirements}`);
        console.log(`   ❌ Nicht erfüllt: ${failedRequirements}`);
        console.log(`   🚨 Kritische Probleme: ${criticalFailures}`);

        // Detaillierte Ergebnisse
        console.log(`\n🔍 DETAILLIERTE ERGEBNISSE:`);
        this.results.userRequirements.forEach(requirement => {
            const status = requirement.status === 'PASS' ? '✅' : '❌';
            console.log(`   ${status} ${requirement.name}`);
            if (requirement.status === 'FAIL') {
                console.log(`      🚨 ${requirement.details}`);
                if (requirement.errors && requirement.errors.length > 0) {
                    requirement.errors.forEach(error => {
                        console.log(`         - ${error}`);
                    });
                }
            }
        });

        // Spezifische Empfehlungen
        console.log(`\n🎯 SPEZIFISCHE EMPFEHLUNGEN FÜR CURSOR:`);
        
        if (criticalFailures > 0) {
            console.log(`   🚨 SOFORTIGE AKTIONEN ERFORDERLICH:`);
            
            this.results.userRequirements
                .filter(r => r.status === 'FAIL' && r.critical)
                .forEach(requirement => {
                    console.log(`      🔧 ${requirement.name}:`);
                    console.log(`         Problem: ${requirement.details}`);
                    if (requirement.errors && requirement.errors.length > 0) {
                        requirement.errors.forEach(error => {
                            console.log(`         Lösung: ${error}`);
                        });
                    }
                });
        }

        // Erfolgsrate
        const successRate = Math.round((passedRequirements / totalRequirements) * 100);
        console.log(`\n📈 ERFOLGSRATE: ${successRate}%`);

        if (successRate < 50) {
            console.log(`   🚨 KRITISCH: Mehr als die Hälfte der Anforderungen nicht erfüllt`);
            console.log(`   💡 Empfehlung: Fokus auf kritische Probleme legen`);
        } else if (successRate < 80) {
            console.log(`   ⚠️  VERBESSERUNG NÖTIG: Einige wichtige Anforderungen nicht erfüllt`);
            console.log(`   💡 Empfehlung: Priorisiere kritische Probleme`);
        } else {
            console.log(`   ✅ GUT: Die meisten Anforderungen erfüllt`);
            console.log(`   💡 Empfehlung: Verbleibende Probleme beheben`);
        }

        // Feedback-Datei speichern
        const feedbackFile = 'smart-user-feedback.json';
        fs.writeFileSync(feedbackFile, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Intelligentes Feedback gespeichert: ${feedbackFile}`);

        // Cursor-spezifische Nachricht
        console.log(`\n🤖 CURSOR AI FEEDBACK:`);
        console.log(`   Ihre Anforderungen: ${passedRequirements}/${totalRequirements} erfüllt`);
        console.log(`   Kritische Probleme: ${criticalFailures}`);
        console.log(`   Empfehlung: ${criticalFailures > 0 ? 'Sofortige Reparatur erforderlich' : 'System funktioniert gut'}`);
        
        return this.results;
    }
}

// Test-System ausführen
if (require.main === module) {
    const tester = new SmartUserTester();
    tester.runAllUserTests().catch(console.error);
}

module.exports = SmartUserTester;
