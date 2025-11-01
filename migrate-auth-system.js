/**
 * AWS Auth System Migration Script
 * Aktualisiert alle HTML-Seiten auf das neue unified-aws-auth System
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Konfiguration
const config = {
    rootDir: '.',
    htmlPattern: '**/*.html',
    excludePatterns: [
        '**/node_modules/**',
        '**/build/**',
        '**/dist/**',
        '**/.git/**',
        '**/cdk.out/**'
    ],
    backup: true
};

// Alte Scripts die entfernt werden sollen
const oldScripts = [
    'js/real-aws-auth.js',
    'js/aws-auth-system.js',
    'js/auth-modals.js',
    'js/aws-auth.js',
    'js/real-user-auth-system.js'
];

// Alte Modal-Loader Patterns
const oldModalLoaderPatterns = [
    /fetch\(['"]components\/auth-modals\.html['"]\)/gi,
    /fetch\(['"]components\/unified-auth-modals\.html['"]\)/gi,
    /loadAuthModals\s*\(\)/gi
];

/**
 * Hauptfunktion
 */
async function migrateAllPages() {
    console.log('🚀 Starting AWS Auth System Migration...\n');

    // Finde alle HTML-Dateien
    const htmlFiles = await glob(config.htmlPattern, {
        ignore: config.excludePatterns,
        cwd: config.rootDir
    });

    console.log(`📁 Found ${htmlFiles.length} HTML files\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of htmlFiles) {
        try {
            const result = await migratePage(file);
            if (result.migrated) {
                migrated++;
                console.log(`✅ ${file}`);
            } else {
                skipped++;
                console.log(`⏭️  ${file} (${result.reason})`);
            }
        } catch (error) {
            errors++;
            console.error(`❌ ${file}: ${error.message}`);
        }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('\n✨ Migration complete!');
}

/**
 * Migriert eine einzelne Seite
 */
async function migratePage(filePath) {
    const fullPath = path.join(config.rootDir, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Prüfe ob bereits migriert
    if (content.includes('unified-auth-loader.js')) {
        return { migrated: false, reason: 'already migrated' };
    }

    // Prüfe ob überhaupt Auth verwendet wird
    const hasOldAuth = oldScripts.some(script => content.includes(script));
    const hasAuthModals = content.includes('auth-modals') || content.includes('authModals');
    
    if (!hasOldAuth && !hasAuthModals) {
        return { migrated: false, reason: 'no auth system found' };
    }

    // Backup erstellen
    if (config.backup) {
        const backupPath = `${fullPath}.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, content);
    }

    // Entferne alte Scripts
    oldScripts.forEach(script => {
        const patterns = [
            new RegExp(`<script[^>]*src=["']${script.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>\\s*</script>\\s*`, 'gi'),
            new RegExp(`<script[^>]*src=["']${script.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*/>\\s*`, 'gi')
        ];
        
        patterns.forEach(pattern => {
            content = content.replace(pattern, '');
        });
    });

    // Entferne alte Modal-Loader (behält aber container falls vorhanden)
    oldModalLoaderPatterns.forEach(pattern => {
        // Vorsichtiger: Nur spezifische Loader-Funktionen entfernen
        if (pattern.source.includes('loadAuthModals')) {
            // Entferne komplette loadAuthModals Funktionen
            content = content.replace(
                /\s*async\s+function\s+loadAuthModals\s*\([^)]*\)\s*\{[^}]*fetch\([^)]*auth-modals[^)]*\)[^}]*\}[^}]*\}/gs,
                ''
            );
        }
    });

    // Entferne alte auth-modals.html Loader
    content = content.replace(
        /fetch\(['"]components\/auth-modals\.html['"]\)/gi,
        'fetch(\'components/unified-auth-modals.html\')'
    );

    // Stelle sicher dass authModalsContainer vorhanden ist
    if (!content.includes('authModalsContainer')) {
        // Füge vor </body> ein
        const bodyEndMatch = content.match(/<\/body>/i);
        if (bodyEndMatch) {
            const insertIndex = bodyEndMatch.index;
            const container = '\n    <!-- Auth Modals Container -->\n    <div id="authModalsContainer"></div>\n';
            content = content.slice(0, insertIndex) + container + content.slice(insertIndex);
        }
    }

    // Füge unified-auth-loader hinzu
    const scriptInsertPatterns = [
        /<\/body>/i,
        /<\/html>/i,
        /<script[^>]*src=["']js\/script\.js["'][^>]*>\s*<\/script>/i
    ];

    let inserted = false;
    for (const pattern of scriptInsertPatterns) {
        const match = content.match(pattern);
        if (match) {
            const insertIndex = match.index;
            const loaderScript = '\n    <!-- Unified Auth System -->\n    <script src="js/unified-auth-loader.js"></script>\n';
            
            // Prüfe ob bereits vorhanden
            if (!content.includes('unified-auth-loader.js')) {
                content = content.slice(0, insertIndex) + loaderScript + content.slice(insertIndex);
                inserted = true;
                break;
            }
        }
    }

    // Falls nicht eingefügt, am Ende hinzufügen
    if (!inserted && !content.includes('unified-auth-loader.js')) {
        const lastScriptMatch = content.match(/<script[^>]*>[\s\S]*?<\/script>\s*(?=\s*<\/body>)/gi);
        if (lastScriptMatch) {
            const lastMatch = lastScriptMatch[lastScriptMatch.length - 1];
            const insertIndex = content.indexOf(lastMatch) + lastMatch.length;
            const loaderScript = '\n    <!-- Unified Auth System -->\n    <script src="js/unified-auth-loader.js"></script>\n';
            content = content.slice(0, insertIndex) + loaderScript + content.slice(insertIndex);
        }
    }

    // Schreibe zurück
    fs.writeFileSync(fullPath, content, 'utf8');

    return { migrated: true };
}

// Ausführung
if (require.main === module) {
    migrateAllPages().catch(error => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
}

module.exports = { migrateAllPages, migratePage };

