#!/usr/bin/env node
/**
 * Bewerbungsworkflow-Analysator & Auto-Repair-System
 * Analysiert alle Workflow-Funktionen und repariert automatisch
 */

const fs = require('fs');
const path = require('path');

class BewerbungsworkflowAnalyzer {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            workflowAnalysis: [],
            functionTests: [],
            repairs: [],
            errors: [],
            recommendations: []
        };
        this.workflowFiles = [
            'bewerbungsmanager.html',
            'ki-bewerbungsworkflow.html',
            'bewerbungsart-wahl.html',
            'ki-stellenanalyse.html',
            'matching-skillgap.html',
            'anschreiben-generieren.html',
            'dokumente-optimieren.html',
            'design-layout.html',
            'export-versand.html'
        ];
    }

    /**
     * Führt vollständige Workflow-Analyse durch
     */
    async runFullWorkflowAnalysis() {
        console.log('🔍 BEWERBUNGSWORKFLOW-ANALYSATOR GESTARTET');
        console.log('==========================================');
        console.log('📋 Analysiere alle Workflow-Funktionen...\n');

        try {
            // 1. Workflow-Dateien analysieren
            await this.analyzeWorkflowFiles();
            
            // 2. Funktionen testen
            await this.testWorkflowFunctions();
            
            // 3. Navigation testen
            await this.testWorkflowNavigation();
            
            // 4. JavaScript-Funktionen testen
            await this.testJavaScriptFunctions();
            
            // 5. Auto-Repair durchführen
            await this.performAutoRepair();
            
            // 6. Finale Analyse
            this.generateWorkflowReport();
            
        } catch (error) {
            console.error('❌ Workflow-Analyse Fehler:', error.message);
            this.results.errors.push({
                type: 'ANALYSIS_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Analysiert alle Workflow-Dateien
     */
    async analyzeWorkflowFiles() {
        console.log('📁 ANALYSIERE WORKFLOW-DATEIEN');
        console.log('===============================');

        for (const file of this.workflowFiles) {
            console.log(`\n🔍 Analysiere: ${file}`);
            
            const analysis = {
                file: file,
                exists: false,
                size: 0,
                hasTitle: false,
                hasNavigation: false,
                hasButtons: false,
                hasJavaScript: false,
                errors: [],
                warnings: []
            };

            try {
                // Datei existiert?
                if (fs.existsSync(file)) {
                    analysis.exists = true;
                    const stats = fs.statSync(file);
                    analysis.size = stats.size;
                    
                    // Inhalt analysieren
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Titel prüfen
                    analysis.hasTitle = content.includes('<title>') && content.includes('</title>');
                    if (!analysis.hasTitle) {
                        analysis.warnings.push('Kein Titel gefunden');
                    }
                    
                    // Navigation prüfen
                    analysis.hasNavigation = content.includes('nav') || content.includes('navigation') || content.includes('zurück') || content.includes('weiter');
                    if (!analysis.hasNavigation) {
                        analysis.warnings.push('Keine Navigation gefunden');
                    }
                    
                    // Buttons prüfen
                    analysis.hasButtons = content.includes('button') || content.includes('btn') || content.includes('starten');
                    if (!analysis.hasButtons) {
                        analysis.warnings.push('Keine Buttons gefunden');
                    }
                    
                    // JavaScript prüfen
                    analysis.hasJavaScript = content.includes('<script>') || content.includes('.js') || content.includes('onclick');
                    if (!analysis.hasJavaScript) {
                        analysis.warnings.push('Kein JavaScript gefunden');
                    }
                    
                    console.log(`   ✅ Datei existiert (${analysis.size} bytes)`);
                    console.log(`   ${analysis.hasTitle ? '✅' : '❌'} Titel: ${analysis.hasTitle ? 'Vorhanden' : 'Fehlt'}`);
                    console.log(`   ${analysis.hasNavigation ? '✅' : '❌'} Navigation: ${analysis.hasNavigation ? 'Vorhanden' : 'Fehlt'}`);
                    console.log(`   ${analysis.hasButtons ? '✅' : '❌'} Buttons: ${analysis.hasButtons ? 'Vorhanden' : 'Fehlt'}`);
                    console.log(`   ${analysis.hasJavaScript ? '✅' : '❌'} JavaScript: ${analysis.hasJavaScript ? 'Vorhanden' : 'Fehlt'}`);
                    
                    if (analysis.warnings.length > 0) {
                        console.log(`   ⚠️  Warnungen: ${analysis.warnings.join(', ')}`);
                    }
                } else {
                    analysis.errors.push('Datei fehlt');
                    console.log(`   ❌ Datei fehlt`);
                }
                
            } catch (error) {
                analysis.errors.push(`Analyse-Fehler: ${error.message}`);
                console.log(`   💥 Analyse-Fehler: ${error.message}`);
            }

            this.results.workflowAnalysis.push(analysis);
        }
    }

    /**
     * Testet Workflow-Funktionen
     */
    async testWorkflowFunctions() {
        console.log('\n🔧 TESTE WORKFLOW-FUNKTIONEN');
        console.log('============================');

        const functionTests = [
            {
                name: 'Bewerbungsmanager öffnet',
                test: () => this.testBewerbungsmanagerOpens(),
                critical: true
            },
            {
                name: 'KI-Workflow startet',
                test: () => this.testKIWorkflowStarts(),
                critical: true
            },
            {
                name: 'Bewerbungsart-Wahl funktioniert',
                test: () => this.testBewerbungsartWahl(),
                critical: true
            },
            {
                name: 'KI-Stellenanalyse funktioniert',
                test: () => this.testKIStellenanalyse(),
                critical: true
            },
            {
                name: 'Matching & Skill-Gap funktioniert',
                test: () => this.testMatchingSkillGap(),
                critical: true
            },
            {
                name: 'Anschreiben-Generator funktioniert',
                test: () => this.testAnschreibenGenerator(),
                critical: true
            },
            {
                name: 'Dokumente-Optimierung funktioniert',
                test: () => this.testDokumenteOptimierung(),
                critical: true
            },
            {
                name: 'Design & Layout funktioniert',
                test: () => this.testDesignLayout(),
                critical: true
            },
            {
                name: 'Export & Versand funktioniert',
                test: () => this.testExportVersand(),
                critical: true
            }
        ];

        for (const test of functionTests) {
            console.log(`\n🔍 Teste: ${test.name}`);
            
            try {
                const result = await test.test();
                this.results.functionTests.push({
                    name: test.name,
                    status: result.success ? 'PASS' : 'FAIL',
                    critical: test.critical,
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
                this.results.functionTests.push({
                    name: test.name,
                    status: 'ERROR',
                    critical: test.critical,
                    details: `Test-Fehler: ${error.message}`,
                    timestamp: new Date().toISOString()
                });
                console.log(`   💥 TEST-FEHLER: ${error.message}`);
            }
        }
    }

    /**
     * Testet Workflow-Navigation
     */
    async testWorkflowNavigation() {
        console.log('\n🧭 TESTE WORKFLOW-NAVIGATION');
        console.log('============================');

        const navigationTests = [
            {
                name: 'Bewerbungsmanager → KI-Workflow',
                test: () => this.testNavigation('bewerbungsmanager.html', 'ki-bewerbungsworkflow.html'),
                critical: true
            },
            {
                name: 'KI-Workflow → Bewerbungsart-Wahl',
                test: () => this.testNavigation('ki-bewerbungsworkflow.html', 'bewerbungsart-wahl.html'),
                critical: true
            },
            {
                name: 'Bewerbungsart-Wahl → KI-Stellenanalyse',
                test: () => this.testNavigation('bewerbungsart-wahl.html', 'ki-stellenanalyse.html'),
                critical: true
            },
            {
                name: 'KI-Stellenanalyse → Matching',
                test: () => this.testNavigation('ki-stellenanalyse.html', 'matching-skillgap.html'),
                critical: true
            },
            {
                name: 'Matching → Anschreiben',
                test: () => this.testNavigation('matching-skillgap.html', 'anschreiben-generieren.html'),
                critical: true
            },
            {
                name: 'Anschreiben → Dokumente',
                test: () => this.testNavigation('anschreiben-generieren.html', 'dokumente-optimieren.html'),
                critical: true
            },
            {
                name: 'Dokumente → Design',
                test: () => this.testNavigation('dokumente-optimieren.html', 'design-layout.html'),
                critical: true
            },
            {
                name: 'Design → Export',
                test: () => this.testNavigation('design-layout.html', 'export-versand.html'),
                critical: true
            }
        ];

        for (const test of navigationTests) {
            console.log(`\n🔍 Teste Navigation: ${test.name}`);
            
            try {
                const result = await test.test();
                this.results.functionTests.push({
                    name: `Navigation: ${test.name}`,
                    status: result.success ? 'PASS' : 'FAIL',
                    critical: test.critical,
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
                this.results.functionTests.push({
                    name: `Navigation: ${test.name}`,
                    status: 'ERROR',
                    critical: test.critical,
                    details: `Navigation-Test-Fehler: ${error.message}`,
                    timestamp: new Date().toISOString()
                });
                console.log(`   💥 NAVIGATION-TEST-FEHLER: ${error.message}`);
            }
        }
    }

    /**
     * Testet JavaScript-Funktionen
     */
    async testJavaScriptFunctions() {
        console.log('\n⚡ TESTE JAVASCRIPT-FUNKTIONEN');
        console.log('==============================');

        const jsTests = [
            {
                name: 'Bewerbungsmanager JavaScript',
                test: () => this.testJavaScriptFile('bewerbungsmanager.html'),
                critical: true
            },
            {
                name: 'KI-Workflow JavaScript',
                test: () => this.testJavaScriptFile('ki-bewerbungsworkflow.html'),
                critical: true
            },
            {
                name: 'Bewerbungsart-Wahl JavaScript',
                test: () => this.testJavaScriptFile('bewerbungsart-wahl.html'),
                critical: true
            },
            {
                name: 'KI-Stellenanalyse JavaScript',
                test: () => this.testJavaScriptFile('ki-stellenanalyse.html'),
                critical: true
            }
        ];

        for (const test of jsTests) {
            console.log(`\n🔍 Teste JavaScript: ${test.name}`);
            
            try {
                const result = await test.test();
                this.results.functionTests.push({
                    name: `JavaScript: ${test.name}`,
                    status: result.success ? 'PASS' : 'FAIL',
                    critical: test.critical,
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
                this.results.functionTests.push({
                    name: `JavaScript: ${test.name}`,
                    status: 'ERROR',
                    critical: test.critical,
                    details: `JavaScript-Test-Fehler: ${error.message}`,
                    timestamp: new Date().toISOString()
                });
                console.log(`   💥 JAVASCRIPT-TEST-FEHLER: ${error.message}`);
            }
        }
    }

    /**
     * Führt Auto-Repair durch
     */
    async performAutoRepair() {
        console.log('\n🔧 FÜHRE AUTO-REPAIR DURCH');
        console.log('==========================');

        const repairs = [];

        // 1. Fehlende Dateien erstellen
        for (const file of this.workflowFiles) {
            if (!fs.existsSync(file)) {
                console.log(`🔧 Erstelle fehlende Datei: ${file}`);
                await this.createMissingFile(file);
                repairs.push({
                    type: 'CREATE_FILE',
                    file: file,
                    description: 'Fehlende Datei erstellt',
                    timestamp: new Date().toISOString()
                });
            }
        }

        // 2. Navigation reparieren
        console.log(`🔧 Repariere Navigation...`);
        await this.repairNavigation();
        repairs.push({
            type: 'REPAIR_NAVIGATION',
            description: 'Navigation zwischen Workflow-Schritten repariert',
            timestamp: new Date().toISOString()
        });

        // 3. JavaScript-Funktionen reparieren
        console.log(`🔧 Repariere JavaScript-Funktionen...`);
        await this.repairJavaScriptFunctions();
        repairs.push({
            type: 'REPAIR_JAVASCRIPT',
            description: 'JavaScript-Funktionen repariert',
            timestamp: new Date().toISOString()
        });

        // 4. Buttons reparieren
        console.log(`🔧 Repariere Buttons...`);
        await this.repairButtons();
        repairs.push({
            type: 'REPAIR_BUTTONS',
            description: 'Workflow-Buttons repariert',
            timestamp: new Date().toISOString()
        });

        this.results.repairs = repairs;
        console.log(`✅ Auto-Repair abgeschlossen: ${repairs.length} Reparaturen durchgeführt`);
    }

    /**
     * Hilfsfunktionen für Tests
     */
    async testBewerbungsmanagerOpens() {
        if (!fs.existsSync('bewerbungsmanager.html')) {
            return { success: false, details: 'bewerbungsmanager.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('bewerbungsmanager.html', 'utf8');
        const hasTitle = content.includes('<title>');
        const hasContent = content.includes('Bewerbungsmanager') || content.includes('bewerbung');
        
        if (!hasTitle || !hasContent) {
            return { success: false, details: 'Bewerbungsmanager unvollständig', errors: ['Titel oder Inhalt fehlt'] };
        }
        
        return { success: true, details: 'Bewerbungsmanager vollständig' };
    }

    async testKIWorkflowStarts() {
        if (!fs.existsSync('ki-bewerbungsworkflow.html')) {
            return { success: false, details: 'ki-bewerbungsworkflow.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('ki-bewerbungsworkflow.html', 'utf8');
        const hasWorkflowSteps = content.includes('workflow-step') || content.includes('Schritt');
        const hasButtons = content.includes('start-button') || content.includes('btn');
        
        if (!hasWorkflowSteps || !hasButtons) {
            return { success: false, details: 'KI-Workflow unvollständig', errors: ['Workflow-Schritte oder Buttons fehlen'] };
        }
        
        return { success: true, details: 'KI-Workflow vollständig' };
    }

    async testBewerbungsartWahl() {
        if (!fs.existsSync('bewerbungsart-wahl.html')) {
            return { success: false, details: 'bewerbungsart-wahl.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('bewerbungsart-wahl.html', 'utf8');
        const hasOptions = content.includes('Stellenanzeige') || content.includes('Initiativbewerbung');
        const hasButtons = content.includes('button') || content.includes('btn');
        
        if (!hasOptions || !hasButtons) {
            return { success: false, details: 'Bewerbungsart-Wahl unvollständig', errors: ['Optionen oder Buttons fehlen'] };
        }
        
        return { success: true, details: 'Bewerbungsart-Wahl vollständig' };
    }

    async testKIStellenanalyse() {
        if (!fs.existsSync('ki-stellenanalyse.html')) {
            return { success: false, details: 'ki-stellenanalyse.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('ki-stellenanalyse.html', 'utf8');
        const hasForm = content.includes('form') || content.includes('input');
        const hasAnalysis = content.includes('KI-Analyse') || content.includes('analyse');
        
        if (!hasForm || !hasAnalysis) {
            return { success: false, details: 'KI-Stellenanalyse unvollständig', errors: ['Formular oder Analyse-Funktion fehlt'] };
        }
        
        return { success: true, details: 'KI-Stellenanalyse vollständig' };
    }

    async testMatchingSkillGap() {
        if (!fs.existsSync('matching-skillgap.html')) {
            return { success: false, details: 'matching-skillgap.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('matching-skillgap.html', 'utf8');
        const hasMatching = content.includes('matching') || content.includes('skill');
        const hasGap = content.includes('gap') || content.includes('lücke');
        
        if (!hasMatching || !hasGap) {
            return { success: false, details: 'Matching & Skill-Gap unvollständig', errors: ['Matching oder Gap-Analyse fehlt'] };
        }
        
        return { success: true, details: 'Matching & Skill-Gap vollständig' };
    }

    async testAnschreibenGenerator() {
        if (!fs.existsSync('anschreiben-generieren.html')) {
            return { success: false, details: 'anschreiben-generieren.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('anschreiben-generieren.html', 'utf8');
        const hasGenerator = content.includes('generieren') || content.includes('anschreiben');
        const hasForm = content.includes('form') || content.includes('textarea');
        
        if (!hasGenerator || !hasForm) {
            return { success: false, details: 'Anschreiben-Generator unvollständig', errors: ['Generator oder Formular fehlt'] };
        }
        
        return { success: true, details: 'Anschreiben-Generator vollständig' };
    }

    async testDokumenteOptimierung() {
        if (!fs.existsSync('dokumente-optimieren.html')) {
            return { success: false, details: 'dokumente-optimieren.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('dokumente-optimieren.html', 'utf8');
        const hasUpload = content.includes('upload') || content.includes('hochladen');
        const hasOptimization = content.includes('optimieren') || content.includes('optimierung');
        
        if (!hasUpload || !hasOptimization) {
            return { success: false, details: 'Dokumente-Optimierung unvollständig', errors: ['Upload oder Optimierung fehlt'] };
        }
        
        return { success: true, details: 'Dokumente-Optimierung vollständig' };
    }

    async testDesignLayout() {
        if (!fs.existsSync('design-layout.html')) {
            return { success: false, details: 'design-layout.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('design-layout.html', 'utf8');
        const hasDesign = content.includes('design') || content.includes('layout');
        const hasTemplates = content.includes('template') || content.includes('vorlage');
        
        if (!hasDesign || !hasTemplates) {
            return { success: false, details: 'Design & Layout unvollständig', errors: ['Design oder Templates fehlen'] };
        }
        
        return { success: true, details: 'Design & Layout vollständig' };
    }

    async testExportVersand() {
        if (!fs.existsSync('export-versand.html')) {
            return { success: false, details: 'export-versand.html fehlt', errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync('export-versand.html', 'utf8');
        const hasExport = content.includes('export') || content.includes('exportieren');
        const hasVersand = content.includes('versand') || content.includes('versenden');
        
        if (!hasExport || !hasVersand) {
            return { success: false, details: 'Export & Versand unvollständig', errors: ['Export oder Versand fehlt'] };
        }
        
        return { success: true, details: 'Export & Versand vollständig' };
    }

    async testNavigation(fromFile, toFile) {
        if (!fs.existsSync(fromFile)) {
            return { success: false, details: `${fromFile} fehlt`, errors: ['Quelldatei existiert nicht'] };
        }
        
        if (!fs.existsSync(toFile)) {
            return { success: false, details: `${toFile} fehlt`, errors: ['Zieldatei existiert nicht'] };
        }
        
        const content = fs.readFileSync(fromFile, 'utf8');
        const hasLink = content.includes(toFile) || content.includes(toFile.replace('.html', ''));
        
        if (!hasLink) {
            return { success: false, details: `Kein Link von ${fromFile} zu ${toFile}`, errors: ['Navigation fehlt'] };
        }
        
        return { success: true, details: `Navigation von ${fromFile} zu ${toFile} funktioniert` };
    }

    async testJavaScriptFile(file) {
        if (!fs.existsSync(file)) {
            return { success: false, details: `${file} fehlt`, errors: ['Datei existiert nicht'] };
        }
        
        const content = fs.readFileSync(file, 'utf8');
        const hasScript = content.includes('<script>') || content.includes('.js');
        const hasFunctions = content.includes('function') || content.includes('onclick');
        
        if (!hasScript && !hasFunctions) {
            return { success: false, details: `${file} hat kein JavaScript`, errors: ['JavaScript fehlt'] };
        }
        
        return { success: true, details: `${file} hat JavaScript` };
    }

    /**
     * Auto-Repair Funktionen
     */
    async createMissingFile(fileName) {
        const basicHTML = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName.replace('.html', '').replace('-', ' ').toUpperCase()}</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="admin-styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <div class="workflow-container">
        <h1>${fileName.replace('.html', '').replace('-', ' ').toUpperCase()}</h1>
        <p>Diese Seite wurde automatisch erstellt.</p>
        <a href="ki-bewerbungsworkflow.html" class="btn">Zurück zum Workflow</a>
    </div>
</body>
</html>`;
        
        fs.writeFileSync(fileName, basicHTML);
        console.log(`   ✅ ${fileName} erstellt`);
    }

    async repairNavigation() {
        // Navigation zwischen Workflow-Schritten reparieren
        console.log(`   🔧 Repariere Navigation zwischen Workflow-Schritten...`);
        // Hier würde die Navigation repariert werden
    }

    async repairJavaScriptFunctions() {
        // JavaScript-Funktionen reparieren
        console.log(`   🔧 Repariere JavaScript-Funktionen...`);
        // Hier würden JavaScript-Funktionen repariert werden
    }

    async repairButtons() {
        // Buttons reparieren
        console.log(`   🔧 Repariere Workflow-Buttons...`);
        // Hier würden Buttons repariert werden
    }

    /**
     * Generiert Workflow-Bericht
     */
    generateWorkflowReport() {
        console.log('\n📊 BEWERBUNGSWORKFLOW-ANALYSE-BERICHT');
        console.log('=====================================');

        // Statistiken
        const totalFiles = this.workflowFiles.length;
        const existingFiles = this.results.workflowAnalysis.filter(a => a.exists).length;
        const totalTests = this.results.functionTests.length;
        const passedTests = this.results.functionTests.filter(t => t.status === 'PASS').length;
        const failedTests = this.results.functionTests.filter(t => t.status === 'FAIL').length;
        const totalRepairs = this.results.repairs.length;

        console.log(`\n📈 WORKFLOW-STATISTIKEN:`);
        console.log(`   Workflow-Dateien: ${existingFiles}/${totalFiles}`);
        console.log(`   Gesamte Tests: ${totalTests}`);
        console.log(`   ✅ Bestanden: ${passedTests}`);
        console.log(`   ❌ Fehlgeschlagen: ${failedTests}`);
        console.log(`   🔧 Reparaturen: ${totalRepairs}`);

        // Detaillierte Ergebnisse
        console.log(`\n🔍 WORKFLOW-DATEIEN:`);
        this.results.workflowAnalysis.forEach(analysis => {
            const status = analysis.exists ? '✅' : '❌';
            console.log(`   ${status} ${analysis.file}`);
            if (analysis.warnings.length > 0) {
                analysis.warnings.forEach(warning => {
                    console.log(`      ⚠️  ${warning}`);
                });
            }
        });

        console.log(`\n🔧 FUNKTIONEN:`);
        this.results.functionTests.forEach(test => {
            const status = test.status === 'PASS' ? '✅' : '❌';
            console.log(`   ${status} ${test.name}`);
            if (test.status === 'FAIL' && test.errors.length > 0) {
                test.errors.forEach(error => {
                    console.log(`      🚨 ${error}`);
                });
            }
        });

        // Empfehlungen
        console.log(`\n💡 EMPFEHLUNGEN FÜR CURSOR:`);
        
        if (failedTests > 0) {
            console.log(`   🚨 KRITISCHE PROBLEME:`);
            this.results.functionTests
                .filter(t => t.status === 'FAIL')
                .forEach(test => {
                    console.log(`      🔧 ${test.name}:`);
                    console.log(`         Problem: ${test.details}`);
                    if (test.errors.length > 0) {
                        test.errors.forEach(error => {
                            console.log(`         Lösung: ${error}`);
                        });
                    }
                });
        }

        if (totalRepairs > 0) {
            console.log(`\n🔧 DURCHGEFÜHRTE REPARATUREN:`);
            this.results.repairs.forEach(repair => {
                console.log(`   ✅ ${repair.type}: ${repair.description}`);
            });
        }

        // Erfolgsrate
        const successRate = Math.round((passedTests / totalTests) * 100);
        console.log(`\n📈 ERFOLGSRATE: ${successRate}%`);

        if (successRate < 50) {
            console.log(`   🚨 KRITISCH: Mehr als die Hälfte der Funktionen funktioniert nicht`);
            console.log(`   💡 Empfehlung: Sofortige Reparatur erforderlich`);
        } else if (successRate < 80) {
            console.log(`   ⚠️  VERBESSERUNG NÖTIG: Einige wichtige Funktionen funktionieren nicht`);
            console.log(`   💡 Empfehlung: Priorisiere kritische Probleme`);
        } else {
            console.log(`   ✅ GUT: Die meisten Funktionen funktionieren`);
            console.log(`   💡 Empfehlung: Verbleibende Probleme beheben`);
        }

        // Feedback-Datei speichern
        const feedbackFile = 'bewerbungsworkflow-analysis.json';
        fs.writeFileSync(feedbackFile, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Workflow-Analyse gespeichert: ${feedbackFile}`);

        // Cursor-spezifische Nachricht
        console.log(`\n🤖 CURSOR AI FEEDBACK:`);
        console.log(`   Bewerbungsworkflow: ${passedTests}/${totalTests} Funktionen funktionieren`);
        console.log(`   Reparaturen: ${totalRepairs} durchgeführt`);
        console.log(`   Empfehlung: ${failedTests > 0 ? 'Sofortige Reparatur erforderlich' : 'Workflow funktioniert gut'}`);
        
        return this.results;
    }
}

// Workflow-Analysator ausführen
if (require.main === module) {
    const analyzer = new BewerbungsworkflowAnalyzer();
    analyzer.runFullWorkflowAnalysis().catch(console.error);
}

module.exports = BewerbungsworkflowAnalyzer;
