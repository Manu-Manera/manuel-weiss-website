/**
 * Button Migration Script
 * Automatically converts all onclick buttons to the new system
 */

class ButtonMigrationTool {
    constructor() {
        this.migratedCount = 0;
        this.failedCount = 0;
        this.buttonMap = new Map();
        this.report = [];
    }

    /**
     * Extract function name and parameters from onclick attribute
     */
    parseOnClick(onclick) {
        // Match function calls like: functionName() or functionName(param1, param2)
        const match = onclick.match(/^(\w+)\((.*)\)$/);
        if (match) {
            return {
                functionName: match[1],
                parameters: match[2].trim()
            };
        }
        return null;
    }

    /**
     * Generate data-action name from function name
     */
    generateActionName(functionName, element) {
        // Special cases mapping
        const specialCases = {
            'adminPanel.logout': 'logout',
            'adminPanel.toggleDarkMode': 'toggle-dark-mode',
            'adminPanel.showNotifications': 'show-notifications',
            'adminPanel.showSection': 'show-section',
            'startSmartWorkflow': 'start-workflow',
            'openNewApplicationModal': 'new-application',
            'triggerDocumentUpload': 'upload-document',
            'analyzeJobRequirements': 'analyze-job',
            'generateSmartCoverLetter': 'generate-cover-letter',
            'saveOpenAIKey': 'save-openai-key',
            'testOpenAIConnection': 'test-openai-connection',
            'toggleAPIKeyVisibility': 'toggle-api-key',
            'generateAIRecipe': 'generate-recipe',
            'saveGeneratedRecipe': 'save-recipe',
            'regenerateRecipe': 'regenerate-recipe',
            'addNewService': 'add-service',
            'refreshServices': 'refresh-services',
            'syncServicesWithWebsite': 'sync-services',
            'loadServicesFromWebsite': 'load-services',
            'createNewService': 'create-service',
            'openPlanEditor': 'edit-training-plan'
        };

        if (specialCases[functionName]) {
            return specialCases[functionName];
        }

        // Check if it's a method call
        if (functionName.includes('.')) {
            const parts = functionName.split('.');
            return parts[parts.length - 1].replace(/([A-Z])/g, '-$1').toLowerCase();
        }

        // Convert camelCase to kebab-case
        return functionName.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    /**
     * Migrate a single button
     */
    migrateButton(button) {
        const onclick = button.getAttribute('onclick');
        if (!onclick) return false;

        try {
            const parsed = this.parseOnClick(onclick);
            if (!parsed) {
                this.report.push({
                    status: 'failed',
                    element: button,
                    reason: 'Could not parse onclick',
                    onclick: onclick
                });
                this.failedCount++;
                return false;
            }

            const actionName = this.generateActionName(parsed.functionName, button);
            
            // Set data-action attribute
            button.setAttribute('data-action', actionName);
            
            // Store additional data if needed
            if (parsed.parameters) {
                // Handle parameters
                if (parsed.parameters.includes("'") || parsed.parameters.includes('"')) {
                    // String parameter
                    const paramMatch = parsed.parameters.match(/['"]([^'"]+)['"]/);
                    if (paramMatch) {
                        button.setAttribute('data-param', paramMatch[1]);
                    }
                }
            }

            // Add to button map for reporting
            this.buttonMap.set(button, {
                original: onclick,
                action: actionName,
                parameters: parsed.parameters
            });

            // Remove onclick attribute
            button.removeAttribute('onclick');

            this.report.push({
                status: 'success',
                element: button,
                original: onclick,
                newAction: actionName
            });

            this.migratedCount++;
            return true;

        } catch (error) {
            this.report.push({
                status: 'error',
                element: button,
                reason: error.message,
                onclick: onclick
            });
            this.failedCount++;
            return false;
        }
    }

    /**
     * Migrate all buttons in a container
     */
    migrateContainer(container = document) {
        const buttons = container.querySelectorAll('button[onclick]');
        console.log(`[ButtonMigration] Found ${buttons.length} buttons to migrate`);

        buttons.forEach(button => {
            this.migrateButton(button);
        });

        return {
            total: buttons.length,
            migrated: this.migratedCount,
            failed: this.failedCount
        };
    }

    /**
     * Generate migration report
     */
    generateReport() {
        console.group('[ButtonMigration] Migration Report');
        console.log(`Total migrated: ${this.migratedCount}`);
        console.log(`Failed: ${this.failedCount}`);

        if (this.failedCount > 0) {
            console.group('Failed migrations:');
            this.report.filter(r => r.status !== 'success').forEach(item => {
                console.error(`Button: "${item.element.textContent.trim()}"`, {
                    onclick: item.onclick,
                    reason: item.reason,
                    element: item.element
                });
            });
            console.groupEnd();
        }

        console.group('Successful migrations:');
        console.table(this.report.filter(r => r.status === 'success').map(item => ({
            text: item.element.textContent.trim(),
            original: item.original,
            newAction: item.newAction
        })));
        console.groupEnd();

        console.groupEnd();
        return this.report;
    }

    /**
     * Generate code to register the migrated buttons
     */
    generateRegistrationCode() {
        const registrations = new Map();

        this.report.filter(r => r.status === 'success').forEach(item => {
            const action = item.newAction;
            if (!registrations.has(action)) {
                registrations.set(action, {
                    handler: item.original,
                    description: `Migrated from: ${item.original}`
                });
            }
        });

        console.group('[ButtonMigration] Registration Code');
        console.log('Add this to register-all-buttons.js:');
        console.log('```javascript');
        console.log('window.eventRegistry.registerBulk({');
        registrations.forEach((config, action) => {
            console.log(`    '${action}': {`);
            console.log(`        handler: () => { /* ${config.handler} */ },`);
            console.log(`        description: '${config.description}'`);
            console.log('    },');
        });
        console.log('});');
        console.log('```');
        console.groupEnd();
    }

    /**
     * Test the migration without applying changes
     */
    dryRun() {
        const buttons = document.querySelectorAll('button[onclick]');
        const results = [];

        buttons.forEach(button => {
            const onclick = button.getAttribute('onclick');
            const parsed = this.parseOnClick(onclick);
            
            results.push({
                text: button.textContent.trim(),
                onclick: onclick,
                wouldBecome: parsed ? this.generateActionName(parsed.functionName, button) : 'FAILED',
                valid: !!parsed
            });
        });

        console.table(results);
        return results;
    }
}

// Auto-migration function
function autoMigrateButtons() {
    const migrator = new ButtonMigrationTool();
    
    console.log('[ButtonMigration] Starting automatic migration...');
    
    // First do a dry run
    console.group('[ButtonMigration] Dry Run');
    const dryRunResults = migrator.dryRun();
    console.groupEnd();

    // Ask for confirmation
    const proceed = confirm(`Found ${dryRunResults.length} buttons to migrate. Proceed with migration?`);
    
    if (proceed) {
        // Perform actual migration
        const results = migrator.migrateContainer();
        
        // Generate report
        migrator.generateReport();
        
        // Generate registration code
        migrator.generateRegistrationCode();
        
        // Update button styles
        updateButtonStyles();
        
        console.log('[ButtonMigration] Migration complete!');
        console.log('[ButtonMigration] Don\'t forget to include the Event Registry scripts in your HTML!');
        
        return results;
    }
    
    return null;
}

// Update button styles to use new CSS classes
function updateButtonStyles() {
    const buttons = document.querySelectorAll('button[data-action]');
    
    buttons.forEach(button => {
        // Add base class
        if (!button.classList.contains('btn')) {
            button.classList.add('btn');
        }
        
        // Determine variant based on existing classes or content
        if (button.classList.contains('btn-primary') || 
            button.textContent.includes('Erstellen') || 
            button.textContent.includes('Speichern')) {
            button.classList.add('btn-primary');
        } else if (button.classList.contains('btn-danger') || 
                   button.textContent.includes('Löschen')) {
            button.classList.add('btn-danger');
        } else if (button.classList.contains('btn-success')) {
            button.classList.add('btn-success');
        } else {
            button.classList.add('btn-secondary');
        }
        
        // Determine size
        if (button.classList.contains('btn-lg') || button.classList.contains('large')) {
            button.classList.add('btn-large');
        } else if (button.classList.contains('btn-sm') || button.classList.contains('small')) {
            button.classList.add('btn-small');
        } else {
            button.classList.add('btn-medium');
        }
    });
}

// Export for manual use
window.ButtonMigrationTool = ButtonMigrationTool;
window.autoMigrateButtons = autoMigrateButtons;

// Show migration helper in console
console.log('%c[ButtonMigration] Ready to migrate buttons!', 'color: #10b981; font-weight: bold;');
console.log('Run autoMigrateButtons() to start the migration process');
console.log('Or use new ButtonMigrationTool() for manual control');
