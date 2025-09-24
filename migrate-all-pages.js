/**
 * Migrate All Pages Script
 * Automatically adds the button system to all HTML pages
 */

const fs = require('fs');
const path = require('path');

// HTML files to update
const htmlFiles = [
    'index.html',
    'persoenlichkeitsentwicklung-uebersicht.html',
    'persoenlichkeitsentwicklung.html',
    'ikigai.html',
    'email-verification.html',
    'ernaehrungsberatung.html',
    'admin-persoenlichkeitsentwicklung.html',
    'personal-training.html',
    'bewerbungen.html',
    'hr-designer.html',
    'bewerbung.html',
    'wohnmobil.html',
    'fotobox.html',
    'ebike.html',
    'sup.html',
    'lebenslauf.html',
    'lebenslauf-admin.html',
    'bewerbungsmappe.html',
    'beraterprofil.html',
    'en/index.html',
    'en/persoenlichkeitsentwicklung-uebersicht.html'
];

// Scripts to add before </body>
const scriptsToAdd = `
    <!-- Button System CSS -->
    <link rel="stylesheet" href="/css/button-system.css">
    
    <!-- Core Button System Scripts -->
    <script src="/js/event-registry.js"></script>
    <script src="/js/button-components.js"></script>
    <script src="/js/register-all-buttons.js"></script>
    
    <script>
        // Initialize button system
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[ButtonSystem] Initialized on ' + window.location.pathname);
        });
    </script>
`;

function updateHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if already has button system
        if (content.includes('event-registry.js')) {
            console.log(`✓ ${filePath} - Already has button system`);
            return;
        }
        
        // Find </body> tag
        const bodyCloseIndex = content.lastIndexOf('</body>');
        if (bodyCloseIndex === -1) {
            console.error(`✗ ${filePath} - No </body> tag found`);
            return;
        }
        
        // Insert scripts before </body>
        const updatedContent = 
            content.slice(0, bodyCloseIndex) + 
            scriptsToAdd + 
            content.slice(bodyCloseIndex);
        
        // Write back
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✓ ${filePath} - Updated successfully`);
        
    } catch (error) {
        console.error(`✗ ${filePath} - Error: ${error.message}`);
    }
}

// Update all files
console.log('Starting migration of all HTML pages...\n');

htmlFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        updateHtmlFile(fullPath);
    } else {
        console.log(`⚠ ${file} - File not found`);
    }
});

console.log('\nMigration complete!');
console.log('\nNext steps:');
console.log('1. Open each page in browser');
console.log('2. Open console and run: autoMigrateButtons()');
console.log('3. Test that all buttons work correctly');
