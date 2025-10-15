#!/usr/bin/env node
/**
 * Repository-Analyse & Aufräumung
 * Analysiert das komplette Repository und erstellt eine klare Übersicht
 */

const fs = require('fs');
const path = require('path');

class RepositoryAnalyzer {
    constructor() {
        this.analysis = {
            timestamp: new Date().toISOString(),
            coreFiles: [],
            duplicateFiles: [],
            orphanedFiles: [],
            testFiles: [],
            documentationFiles: [],
            backupFiles: [],
            workflowFiles: [],
            adminFiles: [],
            unusedFiles: [],
            recommendations: []
        };
    }

    /**
     * Führt vollständige Repository-Analyse durch
     */
    async analyzeRepository() {
        console.log('🔍 REPOSITORY-ANALYSE GESTARTET');
        console.log('===============================');
        console.log('📋 Analysiere komplette Struktur...\n');

        try {
            // 1. Alle Dateien scannen
            await this.scanAllFiles();
            
            // 2. Kategorien analysieren
            await this.analyzeCategories();
            
            // 3. Duplikate finden
            await this.findDuplicates();
            
            // 4. Abhängigkeiten analysieren
            await this.analyzeDependencies();
            
            // 5. Empfehlungen generieren
            this.generateRecommendations();
            
        } catch (error) {
            console.error('❌ Analyse-Fehler:', error.message);
        }
    }

    /**
     * Scannt alle Dateien im Repository
     */
    async scanAllFiles() {
        console.log('📁 SCANNE ALLE DATEIEN');
        console.log('======================');

        const allFiles = this.getAllFiles('.');
        console.log(`📊 Gesamt gefunden: ${allFiles.length} Dateien`);

        for (const file of allFiles) {
            const stats = fs.statSync(file);
            const size = stats.size;
            const ext = path.extname(file);
            
            this.analysis.coreFiles.push({
                file: file,
                size: size,
                extension: ext,
                isDirectory: stats.isDirectory(),
                lastModified: stats.mtime
            });
        }
    }

    /**
     * Analysiert Datei-Kategorien
     */
    async analyzeCategories() {
        console.log('\n📂 ANALYSIERE KATEGORIEN');
        console.log('========================');

        // HTML-Dateien
        const htmlFiles = this.analysis.coreFiles.filter(f => f.extension === '.html');
        console.log(`\n🌐 HTML-DATEIEN (${htmlFiles.length}):`);
        htmlFiles.forEach(file => {
            const category = this.categorizeHTMLFile(file.file);
            console.log(`   ${category} ${file.file} (${this.formatSize(file.size)})`);
        });

        // JavaScript-Dateien
        const jsFiles = this.analysis.coreFiles.filter(f => f.extension === '.js');
        console.log(`\n⚡ JAVASCRIPT-DATEIEN (${jsFiles.length}):`);
        jsFiles.forEach(file => {
            const category = this.categorizeJSFile(file.file);
            console.log(`   ${category} ${file.file} (${this.formatSize(file.size)})`);
        });

        // CSS-Dateien
        const cssFiles = this.analysis.coreFiles.filter(f => f.extension === '.css');
        console.log(`\n🎨 CSS-DATEIEN (${cssFiles.length}):`);
        cssFiles.forEach(file => {
            const category = this.categorizeCSSFile(file.file);
            console.log(`   ${category} ${file.file} (${this.formatSize(file.size)})`);
        });

        // Markdown-Dateien
        const mdFiles = this.analysis.coreFiles.filter(f => f.extension === '.md');
        console.log(`\n📝 MARKDOWN-DATEIEN (${mdFiles.length}):`);
        mdFiles.forEach(file => {
            const category = this.categorizeMDFile(file.file);
            console.log(`   ${category} ${file.file} (${this.formatSize(file.size)})`);
        });

        // JSON-Dateien
        const jsonFiles = this.analysis.coreFiles.filter(f => f.extension === '.json');
        console.log(`\n📋 JSON-DATEIEN (${jsonFiles.length}):`);
        jsonFiles.forEach(file => {
            const category = this.categorizeJSONFile(file.file);
            console.log(`   ${category} ${file.file} (${this.formatSize(file.size)})`);
        });
    }

    /**
     * Findet Duplikate
     */
    async findDuplicates() {
        console.log('\n🔍 FINDET DUPLIKATE');
        console.log('==================');

        const htmlFiles = this.analysis.coreFiles.filter(f => f.extension === '.html');
        const duplicates = [];

        // Bewerbungsmanager-Duplikate
        const bewerbungsmanagerFiles = htmlFiles.filter(f => f.file.includes('bewerbungsmanager'));
        if (bewerbungsmanagerFiles.length > 1) {
            duplicates.push({
                type: 'BEWERBUNGSMANAGER_DUPLIKATE',
                files: bewerbungsmanagerFiles.map(f => f.file),
                recommendation: 'Nur eine bewerbungsmanager.html behalten'
            });
        }

        // Bewerbung-Duplikate
        const bewerbungFiles = htmlFiles.filter(f => f.file.includes('bewerbung') && !f.file.includes('bewerbungsmanager'));
        if (bewerbungFiles.length > 1) {
            duplicates.push({
                type: 'BEWERBUNG_DUPLIKATE',
                files: bewerbungFiles.map(f => f.file),
                recommendation: 'Nur eine bewerbung.html behalten'
            });
        }

        // Backup-Dateien
        const backupFiles = this.analysis.coreFiles.filter(f => 
            f.file.includes('backup') || 
            f.file.includes('old') || 
            f.file.includes('-backup') ||
            f.file.endsWith('.backup')
        );
        if (backupFiles.length > 0) {
            duplicates.push({
                type: 'BACKUP_DATEIEN',
                files: backupFiles.map(f => f.file),
                recommendation: 'Backup-Dateien können gelöscht werden'
            });
        }

        this.analysis.duplicateFiles = duplicates;

        duplicates.forEach(dup => {
            console.log(`\n🚨 ${dup.type}:`);
            dup.files.forEach(file => {
                console.log(`   - ${file}`);
            });
            console.log(`   💡 ${dup.recommendation}`);
        });
    }

    /**
     * Analysiert Abhängigkeiten
     */
    async analyzeDependencies() {
        console.log('\n🔗 ANALYSIERE ABHÄNGIGKEITEN');
        console.log('============================');

        // Haupt-HTML-Dateien
        const mainHTMLFiles = [
            'index.html',
            'admin.html',
            'bewerbungsmanager.html',
            'ki-bewerbungsworkflow.html'
        ];

        console.log('\n📄 HAUPT-HTML-DATEIEN:');
        mainHTMLFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const dependencies = this.extractDependencies(content);
                console.log(`\n   ${file}:`);
                dependencies.forEach(dep => {
                    console.log(`     - ${dep.type}: ${dep.file}`);
                });
            } else {
                console.log(`   ❌ ${file}: FEHLT`);
            }
        });

        // Workflow-HTML-Dateien
        const workflowFiles = [
            'bewerbungsart-wahl.html',
            'ki-stellenanalyse.html',
            'matching-skillgap.html',
            'anschreiben-generieren.html',
            'dokumente-optimieren.html',
            'design-layout.html',
            'export-versand.html'
        ];

        console.log('\n🔄 WORKFLOW-HTML-DATEIEN:');
        workflowFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const dependencies = this.extractDependencies(content);
                console.log(`\n   ${file}:`);
                dependencies.forEach(dep => {
                    console.log(`     - ${dep.type}: ${dep.file}`);
                });
            } else {
                console.log(`   ❌ ${file}: FEHLT`);
            }
        });
    }

    /**
     * Generiert Empfehlungen
     */
    generateRecommendations() {
        console.log('\n💡 EMPFEHLUNGEN FÜR AUFRÄUMUNG');
        console.log('==============================');

        // 1. Duplikate bereinigen
        if (this.analysis.duplicateFiles.length > 0) {
            console.log('\n🧹 DUPLIKATE BEREINIGEN:');
            this.analysis.duplicateFiles.forEach(dup => {
                console.log(`   - ${dup.recommendation}`);
            });
        }

        // 2. Backup-Dateien löschen
        const backupFiles = this.analysis.coreFiles.filter(f => 
            f.file.includes('backup') || 
            f.file.includes('old') || 
            f.file.includes('-backup') ||
            f.file.endsWith('.backup')
        );
        if (backupFiles.length > 0) {
            console.log('\n🗑️ BACKUP-DATEIEN LÖSCHEN:');
            backupFiles.forEach(file => {
                console.log(`   - ${file.file}`);
            });
        }

        // 3. Unbenutzte Dateien
        console.log('\n📋 UNBENUTZTE DATEIEN IDENTIFIZIEREN:');
        console.log('   - Prüfe welche HTML-Dateien nicht verlinkt sind');
        console.log('   - Prüfe welche JS-Dateien nicht eingebunden sind');
        console.log('   - Prüfe welche CSS-Dateien nicht verwendet werden');

        // 4. Struktur optimieren
        console.log('\n📁 STRUKTUR OPTIMIEREN:');
        console.log('   - Alle Workflow-Dateien in einen Ordner');
        console.log('   - Alle Test-Dateien in tests/');
        console.log('   - Alle Dokumentation in docs/');
        console.log('   - Alle Backup-Dateien in backup/');

        // 5. Abhängigkeiten prüfen
        console.log('\n🔗 ABHÄNGIGKEITEN PRÜFEN:');
        console.log('   - Alle CSS-Dateien werden verwendet');
        console.log('   - Alle JS-Dateien werden eingebunden');
        console.log('   - Alle HTML-Dateien sind verlinkt');

        // Speichere Analyse
        const analysisFile = 'repository-analysis.json';
        fs.writeFileSync(analysisFile, JSON.stringify(this.analysis, null, 2));
        console.log(`\n📄 Analyse gespeichert: ${analysisFile}`);
    }

    /**
     * Hilfsfunktionen
     */
    getAllFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // Ignoriere bestimmte Verzeichnisse
                if (!['node_modules', '.git', '.github'].includes(file)) {
                    this.getAllFiles(filePath, fileList);
                }
            } else {
                fileList.push(filePath);
            }
        });
        
        return fileList;
    }

    categorizeHTMLFile(file) {
        if (file.includes('bewerbungsmanager')) return '🎯 BEWERBUNGSMANAGER';
        if (file.includes('ki-bewerbungsworkflow')) return '🤖 KI-WORKFLOW';
        if (file.includes('bewerbungsart-wahl')) return '📋 BEWERBUNGSART';
        if (file.includes('ki-stellenanalyse')) return '🔍 STELLENANALYSE';
        if (file.includes('matching-skillgap')) return '⚖️ MATCHING';
        if (file.includes('anschreiben-generieren')) return '✍️ ANSCHREIBEN';
        if (file.includes('dokumente-optimieren')) return '📄 DOKUMENTE';
        if (file.includes('design-layout')) return '🎨 DESIGN';
        if (file.includes('export-versand')) return '📤 EXPORT';
        if (file.includes('admin')) return '🔧 ADMIN';
        if (file === 'index.html') return '🏠 HAUPTSEITE';
        if (file.includes('backup') || file.includes('old')) return '🗑️ BACKUP';
        return '📄 HTML';
    }

    categorizeJSFile(file) {
        if (file.includes('test')) return '🧪 TEST';
        if (file.includes('admin')) return '🔧 ADMIN';
        if (file.includes('workflow')) return '🔄 WORKFLOW';
        if (file.includes('sync')) return '🔄 SYNC';
        return '⚡ JS';
    }

    categorizeCSSFile(file) {
        if (file.includes('admin')) return '🔧 ADMIN';
        if (file.includes('modern')) return '✨ MODERN';
        return '🎨 CSS';
    }

    categorizeMDFile(file) {
        if (file.includes('README')) return '📖 README';
        if (file.includes('IMPLEMENTIERUNG')) return '📋 IMPLEMENTIERUNG';
        if (file.includes('TEST')) return '🧪 TEST';
        if (file.includes('ANALYSE')) return '🔍 ANALYSE';
        return '📝 MD';
    }

    categorizeJSONFile(file) {
        if (file.includes('package')) return '📦 PACKAGE';
        if (file.includes('config')) return '⚙️ CONFIG';
        if (file.includes('analysis')) return '🔍 ANALYSIS';
        return '📋 JSON';
    }

    extractDependencies(content) {
        const dependencies = [];
        
        // CSS-Dateien
        const cssMatches = content.match(/href="([^"]*\.css)"/g);
        if (cssMatches) {
            cssMatches.forEach(match => {
                const file = match.match(/href="([^"]*\.css)"/)[1];
                dependencies.push({ type: 'CSS', file: file });
            });
        }
        
        // JavaScript-Dateien
        const jsMatches = content.match(/src="([^"]*\.js)"/g);
        if (jsMatches) {
            jsMatches.forEach(match => {
                const file = match.match(/src="([^"]*\.js)"/)[1];
                dependencies.push({ type: 'JS', file: file });
            });
        }
        
        // HTML-Links
        const htmlMatches = content.match(/href="([^"]*\.html)"/g);
        if (htmlMatches) {
            htmlMatches.forEach(match => {
                const file = match.match(/href="([^"]*\.html)"/)[1];
                dependencies.push({ type: 'HTML', file: file });
            });
        }
        
        return dependencies;
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Repository-Analyse ausführen
if (require.main === module) {
    const analyzer = new RepositoryAnalyzer();
    analyzer.analyzeRepository().catch(console.error);
}

module.exports = RepositoryAnalyzer;
