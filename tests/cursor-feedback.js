#!/usr/bin/env node
/**
 * Cursor Feedback System
 * Automatische Tests und Rückmeldungen für Cursor AI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CursorFeedbackSystem {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            errors: [],
            warnings: [],
            suggestions: []
        };
    }

    /**
     * Führt alle Tests aus und generiert Cursor-Feedback
     */
    async runAllTests() {
        console.log('🚀 CURSOR FEEDBACK SYSTEM GESTARTET');
        console.log('=====================================');

        try {
            // 1. Website-Funktionalität testen
            await this.testWebsiteFunctionality();
            
            // 2. Admin-Panel testen
            await this.testAdminPanel();
            
            // 3. KI-Workflow testen
            await this.testKIWorkflow();
            
            // 4. Datei-Integrität prüfen
            await this.testFileIntegrity();
            
            // 5. Deployment-Status prüfen
            await this.testDeploymentStatus();
            
            // 6. Feedback generieren
            this.generateCursorFeedback();
            
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
     * Testet die Hauptwebsite-Funktionalität
     */
    async testWebsiteFunctionality() {
        console.log('🔍 Teste Website-Funktionalität...');
        
        const websiteTests = [
            {
                name: 'index.html existiert',
                test: () => fs.existsSync('index.html'),
                critical: true
            },
            {
                name: 'styles.css existiert',
                test: () => fs.existsSync('styles.css'),
                critical: true
            },
            {
                name: 'script.js existiert',
                test: () => fs.existsSync('script.js'),
                critical: true
            },
            {
                name: 'Admin-Sync-Dateien existieren',
                test: () => fs.existsSync('js/admin-data-sync.js') && fs.existsSync('js/website-data-sync.js'),
                critical: true
            }
        ];

        for (const test of websiteTests) {
            try {
                const result = test.test();
                this.results.tests.push({
                    name: test.name,
                    status: result ? 'PASS' : 'FAIL',
                    critical: test.critical,
                    timestamp: new Date().toISOString()
                });
                
                if (!result && test.critical) {
                    this.results.errors.push({
                        type: 'CRITICAL_FILE_MISSING',
                        file: test.name,
                        message: `Kritische Datei fehlt: ${test.name}`,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                this.results.errors.push({
                    type: 'TEST_ERROR',
                    test: test.name,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    /**
     * Testet das Admin-Panel
     */
    async testAdminPanel() {
        console.log('🔍 Teste Admin-Panel...');
        
        const adminTests = [
            {
                name: 'admin.html existiert',
                test: () => fs.existsSync('admin.html'),
                critical: true
            },
            {
                name: 'admin-styles.css existiert',
                test: () => fs.existsSync('admin-styles.css'),
                critical: true
            },
            {
                name: 'admin-script.js existiert',
                test: () => fs.existsSync('admin-script.js'),
                critical: true
            }
        ];

        for (const test of adminTests) {
            try {
                const result = test.test();
                this.results.tests.push({
                    name: `Admin: ${test.name}`,
                    status: result ? 'PASS' : 'FAIL',
                    critical: test.critical,
                    timestamp: new Date().toISOString()
                });
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
     * Testet den KI-Workflow
     */
    async testKIWorkflow() {
        console.log('🔍 Teste KI-Workflow...');
        
        const kiWorkflowFiles = [
            'ki-bewerbungsworkflow.html',
            'bewerbungsart-wahl.html',
            'ki-stellenanalyse.html',
            'matching-skillgap.html',
            'anschreiben-generieren.html',
            'dokumente-optimieren.html',
            'design-layout.html',
            'export-versand.html'
        ];

        for (const file of kiWorkflowFiles) {
            try {
                const exists = fs.existsSync(file);
                this.results.tests.push({
                    name: `KI-Workflow: ${file}`,
                    status: exists ? 'PASS' : 'FAIL',
                    critical: true,
                    timestamp: new Date().toISOString()
                });

                if (!exists) {
                    this.results.errors.push({
                        type: 'KI_WORKFLOW_FILE_MISSING',
                        file: file,
                        message: `KI-Workflow Datei fehlt: ${file}`,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                this.results.errors.push({
                    type: 'KI_WORKFLOW_TEST_ERROR',
                    file: file,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    /**
     * Testet Datei-Integrität
     */
    async testFileIntegrity() {
        console.log('🔍 Teste Datei-Integrität...');
        
        const criticalFiles = [
            'index.html',
            'admin.html',
            'bewerbungsmanager.html',
            'ki-bewerbungsworkflow.html',
            'styles.css',
            'admin-styles.css',
            'script.js',
            'admin-script.js'
        ];

        for (const file of criticalFiles) {
            try {
                if (fs.existsSync(file)) {
                    const stats = fs.statSync(file);
                    const size = stats.size;
                    
                    this.results.tests.push({
                        name: `Integrität: ${file}`,
                        status: size > 0 ? 'PASS' : 'FAIL',
                        details: `Größe: ${size} bytes`,
                        timestamp: new Date().toISOString()
                    });

                    if (size === 0) {
                        this.results.warnings.push({
                            type: 'EMPTY_FILE',
                            file: file,
                            message: `Datei ist leer: ${file}`,
                            timestamp: new Date().toISOString()
                        });
                    }
                } else {
                    this.results.errors.push({
                        type: 'FILE_MISSING',
                        file: file,
                        message: `Kritische Datei fehlt: ${file}`,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                this.results.errors.push({
                    type: 'INTEGRITY_TEST_ERROR',
                    file: file,
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    /**
     * Testet Deployment-Status
     */
    async testDeploymentStatus() {
        console.log('🔍 Teste Deployment-Status...');
        
        try {
            // Git Status prüfen
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            const hasUncommittedChanges = gitStatus.trim().length > 0;
            
            this.results.tests.push({
                name: 'Git Status',
                status: hasUncommittedChanges ? 'WARNING' : 'PASS',
                details: hasUncommittedChanges ? 'Uncommitted changes vorhanden' : 'Clean working directory',
                timestamp: new Date().toISOString()
            });

            if (hasUncommittedChanges) {
                this.results.warnings.push({
                    type: 'UNCOMMITTED_CHANGES',
                    message: 'Es gibt uncommitted Änderungen',
                    timestamp: new Date().toISOString()
                });
            }

            // Netlify Config prüfen
            const netlifyConfigExists = fs.existsSync('netlify.toml');
            this.results.tests.push({
                name: 'Netlify Config',
                status: netlifyConfigExists ? 'PASS' : 'FAIL',
                timestamp: new Date().toISOString()
            });

            // GitHub Actions prüfen
            const workflowsDir = '.github/workflows';
            const workflowsExist = fs.existsSync(workflowsDir);
            this.results.tests.push({
                name: 'GitHub Actions',
                status: workflowsExist ? 'PASS' : 'FAIL',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.results.errors.push({
                type: 'DEPLOYMENT_TEST_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Generiert Cursor-Feedback
     */
    generateCursorFeedback() {
        console.log('\n📊 CURSOR FEEDBACK GENERIERT');
        console.log('============================');

        // Statistiken
        const totalTests = this.results.tests.length;
        const passedTests = this.results.tests.filter(t => t.status === 'PASS').length;
        const failedTests = this.results.tests.filter(t => t.status === 'FAIL').length;
        const criticalErrors = this.results.errors.filter(e => e.type.includes('CRITICAL')).length;

        console.log(`\n📈 TEST-STATISTIKEN:`);
        console.log(`   Gesamt: ${totalTests}`);
        console.log(`   ✅ Bestanden: ${passedTests}`);
        console.log(`   ❌ Fehlgeschlagen: ${failedTests}`);
        console.log(`   🚨 Kritische Fehler: ${criticalErrors}`);
        console.log(`   ⚠️  Warnungen: ${this.results.warnings.length}`);

        // Kritische Probleme
        if (criticalErrors > 0) {
            console.log(`\n🚨 KRITISCHE PROBLEME:`);
            this.results.errors
                .filter(e => e.type.includes('CRITICAL'))
                .forEach(error => {
                    console.log(`   ❌ ${error.type}: ${error.message}`);
                });
        }

        // Empfehlungen
        console.log(`\n💡 EMPFEHLUNGEN FÜR CURSOR:`);
        
        if (criticalErrors > 0) {
            console.log(`   🔧 Sofortige Aktionen erforderlich:`);
            console.log(`      - Fehlende kritische Dateien erstellen`);
            console.log(`      - Admin-Panel Funktionalität reparieren`);
            console.log(`      - KI-Workflow Seiten überprüfen`);
        }

        if (this.results.warnings.length > 0) {
            console.log(`   ⚠️  Verbesserungen empfohlen:`);
            this.results.warnings.forEach(warning => {
                console.log(`      - ${warning.message}`);
            });
        }

        // Erfolgreiche Komponenten
        const successfulComponents = this.results.tests
            .filter(t => t.status === 'PASS')
            .map(t => t.name);
        
        if (successfulComponents.length > 0) {
            console.log(`\n✅ FUNKTIONIERENDE KOMPONENTEN:`);
            successfulComponents.forEach(component => {
                console.log(`   ✅ ${component}`);
            });
        }

        // Feedback-Datei speichern
        const feedbackFile = 'cursor-feedback.json';
        fs.writeFileSync(feedbackFile, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Feedback gespeichert: ${feedbackFile}`);

        // Cursor-spezifische Nachricht
        console.log(`\n🤖 CURSOR AI FEEDBACK:`);
        console.log(`   Die Website hat ${criticalErrors} kritische Probleme.`);
        console.log(`   ${passedTests}/${totalTests} Tests bestanden.`);
        console.log(`   Empfehlung: Fokus auf kritische Fehler legen.`);
        
        return this.results;
    }
}

// Test-System ausführen
if (require.main === module) {
    const feedbackSystem = new CursorFeedbackSystem();
    feedbackSystem.runAllTests().catch(console.error);
}

module.exports = CursorFeedbackSystem;
