#!/usr/bin/env node
/**
 * VOLLSTÄNDIGE REPOSITORY-ANALYSE
 * Analysiert ALLE 907 Dateien und erstellt eine komplette Übersicht
 */

const fs = require('fs');
const path = require('path');

class CompleteRepositoryAnalyzer {
    constructor() {
        this.analysis = {
            timestamp: new Date().toISOString(),
            totalFiles: 0,
            totalDirectories: 0,
            fileTypes: {},
            directories: {},
            duplicates: [],
            largeFiles: [],
            unusedFiles: [],
            coreFiles: [],
            recommendations: []
        };
    }

    /**
     * Führt vollständige Repository-Analyse durch
     */
    async analyzeCompleteRepository() {
        console.log('🔍 VOLLSTÄNDIGE REPOSITORY-ANALYSE GESTARTET');
        console.log('============================================');
        console.log('📋 Analysiere ALLE Dateien und Ordner...\n');

        try {
            // 1. Alle Dateien und Ordner scannen
            await this.scanAllFilesAndDirectories();
            
            // 2. Dateitypen analysieren
            await this.analyzeFileTypes();
            
            // 3. Verzeichnisstruktur analysieren
            await this.analyzeDirectoryStructure();
            
            // 4. Duplikate und große Dateien finden
            await this.findDuplicatesAndLargeFiles();
            
            // 5. Kern-Dateien identifizieren
            await this.identifyCoreFiles();
            
            // 6. Empfehlungen generieren
            this.generateCompleteRecommendations();
            
        } catch (error) {
            console.error('❌ Analyse-Fehler:', error.message);
        }
    }

    /**
     * Scannt alle Dateien und Ordner
     */
    async scanAllFilesAndDirectories() {
        console.log('📁 SCANNE ALLE DATEIEN UND ORDNER');
        console.log('==================================');

        const allFiles = this.getAllFilesRecursive('.');
        const allDirectories = this.getAllDirectoriesRecursive('.');
        
        this.analysis.totalFiles = allFiles.length;
        this.analysis.totalDirectories = allDirectories.length;
        
        console.log(`📊 Gesamt gefunden:`);
        console.log(`   📄 Dateien: ${allFiles.length}`);
        console.log(`   📁 Ordner: ${allDirectories.length}`);
        console.log(`   📊 Gesamt: ${allFiles.length + allDirectories.length} Einträge`);

        // Dateien kategorisieren
        for (const file of allFiles) {
            const stats = fs.statSync(file);
            const ext = path.extname(file);
            const size = stats.size;
            
            // Dateityp zählen
            if (!this.analysis.fileTypes[ext]) {
                this.analysis.fileTypes[ext] = { count: 0, totalSize: 0, files: [] };
            }
            this.analysis.fileTypes[ext].count++;
            this.analysis.fileTypes[ext].totalSize += size;
            this.analysis.fileTypes[ext].files.push({
                file: file,
                size: size,
                lastModified: stats.mtime
            });
        }
    }

    /**
     * Analysiert Dateitypen
     */
    async analyzeFileTypes() {
        console.log('\n📂 DATEITYPEN-ANALYSE');
        console.log('=====================');

        const sortedTypes = Object.entries(this.analysis.fileTypes)
            .sort((a, b) => b[1].count - a[1].count);

        console.log('\n📊 TOP DATEITYPEN:');
        sortedTypes.slice(0, 15).forEach(([ext, data]) => {
            const avgSize = Math.round(data.totalSize / data.count);
            console.log(`   ${ext || 'KEINE_EXTENSION'}: ${data.count} Dateien (${this.formatSize(data.totalSize)}, Ø ${this.formatSize(avgSize)})`);
        });

        // HTML-Dateien detailliert
        if (this.analysis.fileTypes['.html']) {
            console.log('\n🌐 HTML-DATEIEN DETAILLIERT:');
            const htmlFiles = this.analysis.fileTypes['.html'].files;
            const sortedHtml = htmlFiles.sort((a, b) => b.size - a.size);
            
            sortedHtml.slice(0, 20).forEach(file => {
                const category = this.categorizeHTMLFile(file.file);
                console.log(`   ${category} ${file.file} (${this.formatSize(file.size)})`);
            });
        }

        // JavaScript-Dateien detailliert
        if (this.analysis.fileTypes['.js']) {
            console.log('\n⚡ JAVASCRIPT-DATEIEN DETAILLIERT:');
            const jsFiles = this.analysis.fileTypes['.js'].files;
            const sortedJs = jsFiles.sort((a, b) => b.size - a.size);
            
            sortedJs.slice(0, 20).forEach(file => {
                const category = this.categorizeJSFile(file.file);
                console.log(`   ${category} ${file.file} (${this.formatSize(file.size)})`);
            });
        }
    }

    /**
     * Analysiert Verzeichnisstruktur
     */
    async analyzeDirectoryStructure() {
        console.log('\n📁 VERZEICHNISSTRUKTUR-ANALYSE');
        console.log('==============================');

        const allDirectories = this.getAllDirectoriesRecursive('.');
        
        // Verzeichnisse nach Tiefe gruppieren
        const depthGroups = {};
        allDirectories.forEach(dir => {
            const depth = (dir.match(/\//g) || []).length;
            if (!depthGroups[depth]) depthGroups[depth] = [];
            depthGroups[depth].push(dir);
        });

        console.log('\n📊 VERZEICHNISSTRUKTUR NACH TIEFE:');
        Object.keys(depthGroups).sort((a, b) => a - b).forEach(depth => {
            console.log(`   Tiefe ${depth}: ${depthGroups[depth].length} Ordner`);
            if (depth <= 3) {
                depthGroups[depth].slice(0, 10).forEach(dir => {
                    console.log(`     - ${dir}`);
                });
                if (depthGroups[depth].length > 10) {
                    console.log(`     ... und ${depthGroups[depth].length - 10} weitere`);
                }
            }
        });

        // Große Verzeichnisse identifizieren
        console.log('\n📊 GRÖßTE VERZEICHNISSE:');
        const dirSizes = {};
        allDirectories.forEach(dir => {
            const files = this.getAllFilesRecursive(dir);
            const totalSize = files.reduce((sum, file) => {
                try {
                    return sum + fs.statSync(file).size;
                } catch {
                    return sum;
                }
            }, 0);
            dirSizes[dir] = { size: totalSize, fileCount: files.length };
        });

        const sortedDirs = Object.entries(dirSizes)
            .sort((a, b) => b[1].size - a[1].size)
            .slice(0, 10);

        sortedDirs.forEach(([dir, data]) => {
            console.log(`   ${dir}: ${this.formatSize(data.size)} (${data.fileCount} Dateien)`);
        });
    }

    /**
     * Findet Duplikate und große Dateien
     */
    async findDuplicatesAndLargeFiles() {
        console.log('\n🔍 DUPLIKATE UND GROßE DATEIEN');
        console.log('==============================');

        // Große Dateien finden
        const allFiles = this.getAllFilesRecursive('.');
        const largeFiles = allFiles
            .map(file => {
                try {
                    const stats = fs.statSync(file);
                    return { file, size: stats.size };
                } catch {
                    return { file, size: 0 };
                }
            })
            .filter(f => f.size > 100000) // > 100KB
            .sort((a, b) => b.size - a.size);

        console.log('\n📊 GRÖßTE DATEIEN (>100KB):');
        largeFiles.slice(0, 20).forEach(file => {
            console.log(`   ${file.file}: ${this.formatSize(file.size)}`);
        });

        // Duplikate nach Namen finden
        const nameGroups = {};
        allFiles.forEach(file => {
            const basename = path.basename(file);
            if (!nameGroups[basename]) nameGroups[basename] = [];
            nameGroups[basename].push(file);
        });

        const duplicates = Object.entries(nameGroups)
            .filter(([name, files]) => files.length > 1)
            .sort((a, b) => b[1].length - a[1].length);

        console.log('\n🚨 DUPLIKATE NACH NAMEN:');
        duplicates.slice(0, 15).forEach(([name, files]) => {
            console.log(`   ${name}: ${files.length} Dateien`);
            files.forEach(file => {
                console.log(`     - ${file}`);
            });
        });
    }

    /**
     * Identifiziert Kern-Dateien
     */
    async identifyCoreFiles() {
        console.log('\n🎯 KERN-DATEIEN IDENTIFIZIEREN');
        console.log('==============================');

        const coreFiles = [
            'index.html',
            'admin.html',
            'bewerbungsmanager.html',
            'ki-bewerbungsworkflow.html',
            'bewerbungsart-wahl.html',
            'ki-stellenanalyse.html',
            'matching-skillgap.html',
            'anschreiben-generieren.html',
            'dokumente-optimieren.html',
            'design-layout.html',
            'export-versand.html',
            'styles.css',
            'script.js',
            'package.json'
        ];

        console.log('\n✅ KERN-DATEIEN STATUS:');
        coreFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                console.log(`   ✅ ${file}: ${this.formatSize(stats.size)}`);
            } else {
                console.log(`   ❌ ${file}: FEHLT`);
            }
        });

        // Workflow-Dateien prüfen
        const workflowFiles = [
            'bewerbungsart-wahl.html',
            'ki-stellenanalyse.html',
            'matching-skillgap.html',
            'anschreiben-generieren.html',
            'dokumente-optimieren.html',
            'design-layout.html',
            'export-versand.html'
        ];

        console.log('\n🔄 WORKFLOW-DATEIEN STATUS:');
        workflowFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                console.log(`   ✅ ${file}: ${this.formatSize(stats.size)}`);
            } else {
                console.log(`   ❌ ${file}: FEHLT`);
            }
        });
    }

    /**
     * Generiert vollständige Empfehlungen
     */
    generateCompleteRecommendations() {
        console.log('\n💡 VOLLSTÄNDIGE AUFRÄUMUNGS-EMPFEHLUNGEN');
        console.log('==========================================');

        console.log('\n📊 REPOSITORY-STATISTIKEN:');
        console.log(`   📄 Gesamt Dateien: ${this.analysis.totalFiles}`);
        console.log(`   📁 Gesamt Ordner: ${this.analysis.totalDirectories}`);
        console.log(`   📊 Gesamt Einträge: ${this.analysis.totalFiles + this.analysis.totalDirectories}`);

        // Dateityp-Übersicht
        console.log('\n📂 DATEITYP-ÜBERSICHT:');
        const sortedTypes = Object.entries(this.analysis.fileTypes)
            .sort((a, b) => b[1].count - a[1].count);
        
        sortedTypes.slice(0, 10).forEach(([ext, data]) => {
            console.log(`   ${ext || 'KEINE_EXTENSION'}: ${data.count} Dateien (${this.formatSize(data.totalSize)})`);
        });

        // Empfehlungen
        console.log('\n🧹 AUFRÄUMUNGS-EMPFEHLUNGEN:');
        console.log('   1. 🗑️  Backup-Dateien löschen (alle .backup, -old, -backup)');
        console.log('   2. 📁 Duplikate bereinigen (gleiche Namen)');
        console.log('   3. 📂 Struktur organisieren:');
        console.log('      - workflow/ (alle Workflow-Dateien)');
        console.log('      - tests/ (alle Test-Dateien)');
        console.log('      - docs/ (alle Dokumentation)');
        console.log('      - backup/ (Backup-Dateien)');
        console.log('   4. 🔗 Abhängigkeiten reparieren');
        console.log('   5. 📄 Unbenutzte Dateien identifizieren');

        // Speichere vollständige Analyse
        const analysisFile = 'complete-repository-analysis.json';
        fs.writeFileSync(analysisFile, JSON.stringify(this.analysis, null, 2));
        console.log(`\n📄 Vollständige Analyse gespeichert: ${analysisFile}`);
    }

    /**
     * Hilfsfunktionen
     */
    getAllFilesRecursive(dir, fileList = []) {
        try {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    // Ignoriere bestimmte Verzeichnisse
                    if (!['node_modules', '.git', '.github', 'backup'].includes(file)) {
                        this.getAllFilesRecursive(filePath, fileList);
                    }
                } else {
                    fileList.push(filePath);
                }
            });
        } catch (error) {
            // Ignoriere Fehler beim Zugriff auf Verzeichnisse
        }
        
        return fileList;
    }

    getAllDirectoriesRecursive(dir, dirList = []) {
        try {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    dirList.push(filePath);
                    // Ignoriere bestimmte Verzeichnisse
                    if (!['node_modules', '.git', '.github', 'backup'].includes(file)) {
                        this.getAllDirectoriesRecursive(filePath, dirList);
                    }
                }
            });
        } catch (error) {
            // Ignoriere Fehler beim Zugriff auf Verzeichnisse
        }
        
        return dirList;
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
        if (file.includes('methods/')) return '📚 METHOD';
        return '📄 HTML';
    }

    categorizeJSFile(file) {
        if (file.includes('test')) return '🧪 TEST';
        if (file.includes('admin')) return '🔧 ADMIN';
        if (file.includes('workflow')) return '🔄 WORKFLOW';
        if (file.includes('sync')) return '🔄 SYNC';
        if (file.includes('methods/')) return '📚 METHOD';
        return '⚡ JS';
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Vollständige Repository-Analyse ausführen
if (require.main === module) {
    const analyzer = new CompleteRepositoryAnalyzer();
    analyzer.analyzeCompleteRepository().catch(console.error);
}

module.exports = CompleteRepositoryAnalyzer;
