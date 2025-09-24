#!/usr/bin/env node

/**
 * Automatic Button Migration Script
 * Migrates all onclick buttons to data-action across all HTML files
 */

const fs = require('fs');
const path = require('path');

// Statistics
let totalFiles = 0;
let totalButtons = 0;
let migratedButtons = 0;
let failedButtons = 0;

// Button mapping
const functionMapping = {
    // Admin Panel
    'adminPanel.logout()': 'logout',
    'adminPanel.toggleDarkMode()': 'toggle-dark-mode',
    'adminPanel.showNotifications()': 'show-notifications',
    'adminPanel.showSection': 'show-section',
    
    // Workflow
    'startSmartWorkflow()': 'start-workflow',
    'openNewApplicationModal()': 'new-application',
    'triggerDocumentUpload()': 'upload-document',
    'analyzeJobRequirements()': 'analyze-job',
    'generateSmartCoverLetter()': 'generate-cover-letter',
    'generateSentenceSuggestions()': 'generate-suggestions',
    
    // Services
    'addNewService()': 'add-service',
    'refreshServices()': 'refresh-services',
    'syncServicesWithWebsite()': 'sync-services',
    'loadServicesFromWebsite()': 'load-services',
    'createNewService()': 'create-service',
    
    // AI/Recipe
    'saveOpenAIKey()': 'save-openai-key',
    'testOpenAIConnection()': 'test-openai-connection',
    'toggleAPIKeyVisibility()': 'toggle-api-key',
    'generateAIRecipe()': 'generate-recipe',
    'saveGeneratedRecipe()': 'save-recipe',
    'regenerateRecipe()': 'regenerate-recipe',
    
    // Ikigai
    'startIkigaiWorkflow()': 'start-ikigai',
    'saveIkigaiProgress()': 'save-ikigai',
    'exportIkigaiPDF()': 'export-ikigai-pdf',
    
    // General
    'saveData()': 'save',
    'cancelEdit()': 'cancel',
    'deleteItem()': 'delete',
    'printPage()': 'print',
    'sharePage()': 'share'
};

// Convert function call to data-action
function getDataAction(onclick) {
    // Direct mapping
    if (functionMapping[onclick]) {
        return functionMapping[onclick];
    }
    
    // Extract function name with parameters
    const match = onclick.match(/^(\w+(?:\.\w+)?)\((.*?)\)$/);
    if (!match) return null;
    
    let functionName = match[1];
    const params = match[2];
    
    // Check mapping for function without params
    const baseFunction = `${functionName}()`;
    if (functionMapping[baseFunction]) {
        return functionMapping[baseFunction];
    }
    
    // Convert camelCase to kebab-case
    let action = functionName;
    if (functionName.includes('.')) {
        // Handle object.method notation
        const parts = functionName.split('.');
        action = parts[parts.length - 1];
    }
    
    // Convert to kebab-case
    action = action.replace(/([A-Z])/g, '-$1').toLowerCase();
    if (action.startsWith('-')) action = action.substring(1);
    
    return action;
}

// Extract parameters from onclick
function extractParameters(onclick) {
    const match = onclick.match(/\((.*?)\)$/);
    if (!match || !match[1]) return null;
    
    const params = match[1].trim();
    if (!params) return null;
    
    // Handle string parameters
    const stringMatch = params.match(/^['"](.+)['"]$/);
    if (stringMatch) {
        return { type: 'string', value: stringMatch[1] };
    }
    
    // Handle multiple parameters
    if (params.includes(',')) {
        return { type: 'multiple', value: params };
    }
    
    return { type: 'other', value: params };
}

// Process a single HTML file
function processFile(filePath) {
    console.log(`\n📄 Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileButtons = 0;
    let fileMigrated = 0;
    
    // Find all buttons with onclick
    const buttonRegex = /<button([^>]*?)onclick="([^"]+)"([^>]*?)>/gi;
    let match;
    const replacements = [];
    
    while ((match = buttonRegex.exec(content)) !== null) {
        fileButtons++;
        totalButtons++;
        
        const fullMatch = match[0];
        const beforeOnclick = match[1];
        const onclick = match[2];
        const afterOnclick = match[3];
        
        const dataAction = getDataAction(onclick);
        
        if (!dataAction) {
            console.log(`  ❌ Failed to convert: ${onclick}`);
            failedButtons++;
            continue;
        }
        
        // Build new button tag
        let newButton = `<button${beforeOnclick}data-action="${dataAction}"`;
        
        // Add parameters if needed
        const params = extractParameters(onclick);
        if (params) {
            if (params.type === 'string') {
                newButton += ` data-param="${params.value}"`;
            } else if (params.type === 'multiple') {
                newButton += ` data-params="${params.value.replace(/"/g, '&quot;')}"`;
            }
        }
        
        // Add button classes if not present
        if (!beforeOnclick.includes('class=') && !afterOnclick.includes('class=')) {
            newButton += ' class="btn btn-primary"';
        }
        
        newButton += `${afterOnclick}>`;
        
        replacements.push({
            original: fullMatch,
            replacement: newButton,
            onclick: onclick,
            action: dataAction
        });
        
        fileMigrated++;
        migratedButtons++;
    }
    
    // Apply replacements
    replacements.forEach(({ original, replacement }) => {
        content = content.replace(original, replacement);
    });
    
    // Write back if changes were made
    if (replacements.length > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Migrated ${fileMigrated}/${fileButtons} buttons`);
        
        // Log migrations
        replacements.forEach(({ onclick, action }) => {
            console.log(`     ${onclick} → ${action}`);
        });
    } else if (fileButtons === 0) {
        console.log(`  ℹ️  No onclick buttons found`);
    }
    
    totalFiles++;
}

// Find all HTML files
function findHtmlFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and hidden directories
            if (!item.startsWith('.') && item !== 'node_modules') {
                findHtmlFiles(fullPath, files);
            }
        } else if (item.endsWith('.html')) {
            files.push(fullPath);
        }
    });
    
    return files;
}

// Main execution
console.log('🚀 Starting Button Migration\n');
console.log('This will convert all onclick="..." to data-action="..."');
console.log('═══════════════════════════════════════════════════════\n');

const rootDir = process.cwd();
const htmlFiles = findHtmlFiles(rootDir);

console.log(`Found ${htmlFiles.length} HTML files to process\n`);

// Process each file
htmlFiles.forEach(processFile);

// Summary
console.log('\n═══════════════════════════════════════════════════════');
console.log('📊 Migration Summary:');
console.log(`   Total files processed: ${totalFiles}`);
console.log(`   Total buttons found: ${totalButtons}`);
console.log(`   Successfully migrated: ${migratedButtons} ✅`);
console.log(`   Failed to migrate: ${failedButtons} ❌`);
console.log(`   Success rate: ${totalButtons > 0 ? Math.round((migratedButtons / totalButtons) * 100) : 0}%`);

// Create migration report
const report = {
    timestamp: new Date().toISOString(),
    summary: {
        totalFiles,
        totalButtons,
        migratedButtons,
        failedButtons,
        successRate: totalButtons > 0 ? Math.round((migratedButtons / totalButtons) * 100) : 0
    },
    files: htmlFiles.map(file => ({
        path: path.relative(rootDir, file),
        processed: true
    }))
};

fs.writeFileSync('button-migration-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed report saved to: button-migration-report.json');

console.log('\n✨ Migration complete!');
console.log('\nNext steps:');
console.log('1. Test the migrated buttons in your browser');
console.log('2. Check that all functionality still works');
console.log('3. Commit the changes to git');
