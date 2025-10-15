/**
 * Workflow Navigation Test
 * Testet die komplette Navigation durch den KI-Bewerbungsworkflow
 */

class WorkflowNavigationTest {
    constructor() {
        this.testResults = {
            bewerbungsmanager: false,
            kiWorkflowOverview: false,
            step0: false,
            step1: false,
            step2: false,
            step3: false,
            step4: false,
            step5: false,
            step6: false,
            navigation: false
        };
    }

    async runTests() {
        console.log('🧪 WORKFLOW NAVIGATION TEST GESTARTET');
        console.log('=====================================');

        try {
            // Test 1: Bewerbungsmanager Button
            await this.testBewerbungsmanagerButton();
            
            // Test 2: KI-Workflow Übersicht
            await this.testKIWorkflowOverview();
            
            // Test 3: Alle Workflow-Schritte
            await this.testAllWorkflowSteps();
            
            // Test 4: Navigation zwischen Schritten
            await this.testStepNavigation();
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Test-Fehler:', error);
        }
    }

    async testBewerbungsmanagerButton() {
        console.log('\n🔍 Teste Bewerbungsmanager Button...');
        
        // Simuliere Button-Klick
        const startKIWorkflow = window.startKIWorkflow;
        if (typeof startKIWorkflow === 'function') {
            console.log('✅ startKIWorkflow Funktion gefunden');
            this.testResults.bewerbungsmanager = true;
        } else {
            console.log('❌ startKIWorkflow Funktion nicht gefunden');
        }
    }

    async testKIWorkflowOverview() {
        console.log('\n🔍 Teste KI-Workflow Übersicht...');
        
        // Prüfe ob ki-bewerbungsworkflow.html existiert
        try {
            const response = await fetch('ki-bewerbungsworkflow.html');
            if (response.ok) {
                console.log('✅ ki-bewerbungsworkflow.html erreichbar');
                this.testResults.kiWorkflowOverview = true;
            } else {
                console.log('❌ ki-bewerbungsworkflow.html nicht erreichbar');
            }
        } catch (error) {
            console.log('❌ Fehler beim Laden von ki-bewerbungsworkflow.html:', error);
        }
    }

    async testAllWorkflowSteps() {
        console.log('\n🔍 Teste alle Workflow-Schritte...');
        
        const steps = [
            { name: 'Step 0', file: 'bewerbungsart-wahl.html' },
            { name: 'Step 1', file: 'ki-stellenanalyse.html' },
            { name: 'Step 2', file: 'matching-skillgap.html' },
            { name: 'Step 3', file: 'anschreiben-generieren.html' },
            { name: 'Step 4', file: 'dokumente-optimieren.html' },
            { name: 'Step 5', file: 'design-layout.html' },
            { name: 'Step 6', file: 'export-versand.html' }
        ];

        for (const step of steps) {
            try {
                const response = await fetch(step.file);
                if (response.ok) {
                    console.log(`✅ ${step.name}: ${step.file} erreichbar`);
                    this.testResults[`step${steps.indexOf(step)}`] = true;
                } else {
                    console.log(`❌ ${step.name}: ${step.file} nicht erreichbar`);
                }
            } catch (error) {
                console.log(`❌ ${step.name}: Fehler beim Laden von ${step.file}:`, error);
            }
        }
    }

    async testStepNavigation() {
        console.log('\n🔍 Teste Navigation zwischen Schritten...');
        
        // Teste Navigation-Funktionen
        const navigationFunctions = [
            'startWorkflowStep',
            'proceedToNextStep',
            'selectApplicationType'
        ];

        let navigationWorking = true;
        for (const funcName of navigationFunctions) {
            if (typeof window[funcName] === 'function') {
                console.log(`✅ ${funcName} Funktion gefunden`);
            } else {
                console.log(`❌ ${funcName} Funktion nicht gefunden`);
                navigationWorking = false;
            }
        }

        this.testResults.navigation = navigationWorking;
    }

    generateReport() {
        console.log('\n📊 WORKFLOW NAVIGATION TEST REPORT');
        console.log('====================================');

        const totalTests = Object.keys(this.testResults).length;
        const passedTests = Object.values(this.testResults).filter(result => result).length;
        const failedTests = totalTests - passedTests;

        console.log(`\n📈 TEST-STATISTIKEN:`);
        console.log(`   Gesamte Tests: ${totalTests}`);
        console.log(`   ✅ Bestanden: ${passedTests}`);
        console.log(`   ❌ Fehlgeschlagen: ${failedTests}`);
        console.log(`   📊 Erfolgsrate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        console.log('\n🔍 EINZELNE TESTS:');
        for (const [test, result] of Object.entries(this.testResults)) {
            console.log(`   ${result ? '✅' : '❌'} ${test}: ${result ? 'ERFOLGREICH' : 'FEHLGESCHLAGEN'}`);
        }

        if (failedTests === 0) {
            console.log('\n🎉 ALLE TESTS BESTANDEN!');
            console.log('   Der KI-Bewerbungsworkflow ist vollständig funktionsfähig.');
        } else {
            console.log('\n⚠️  EINIGE TESTS FEHLGESCHLAGEN');
            console.log('   Bitte überprüfen Sie die fehlgeschlagenen Komponenten.');
        }

        // Speichere Testergebnisse
        const reportData = {
            timestamp: new Date().toISOString(),
            totalTests,
            passedTests,
            failedTests,
            successRate: (passedTests / totalTests) * 100,
            results: this.testResults
        };

        localStorage.setItem('workflow-navigation-test', JSON.stringify(reportData));
        console.log('\n📄 Test-Report in localStorage gespeichert');
    }
}

// Test ausführen wenn in Browser
if (typeof window !== 'undefined') {
    const test = new WorkflowNavigationTest();
    test.runTests();
}

// Export für Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkflowNavigationTest;
}
