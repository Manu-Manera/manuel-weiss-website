/**
 * Script to clean up auth conflicts by removing disabled auth files
 */

import fs from 'fs';
import path from 'path';

// Get all HTML files in methods directory
function getAllMethodFiles() {
    const methodsDir = './methods';
    const htmlFiles = [];
    
    function scanDirectory(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (item.endsWith('.html')) {
                htmlFiles.push(fullPath);
            }
        }
    }
    
    scanDirectory(methodsDir);
    return htmlFiles;
}

// Clean up auth conflicts in a file
function cleanupAuthConflicts(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remove references to disabled auth files
        const disabledFiles = [
            'personality-auth-integration.js',
            'user-profile.js',
            'aws-auth-system.js'
        ];
        
        disabledFiles.forEach(file => {
            const oldPattern = new RegExp(`<script src="[^"]*${file.replace('.js', '')}[^"]*"></script>`, 'g');
            const newContent = content.replace(oldPattern, '');
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Cleaned ${filePath}`);
            return true;
        } else {
            console.log(`⏭️ No changes needed for ${filePath}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error cleaning ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
function main() {
    console.log('🧹 Cleaning up auth conflicts...');
    
    const htmlFiles = getAllMethodFiles();
    console.log(`📁 Found ${htmlFiles.length} HTML files`);
    
    let cleanedCount = 0;
    
    for (const file of htmlFiles) {
        if (cleanupAuthConflicts(file)) {
            cleanedCount++;
        }
    }
    
    console.log(`\n✅ Successfully cleaned ${cleanedCount} files`);
    console.log('🎯 Auth conflicts eliminated!');
}

// Run the script
main();
