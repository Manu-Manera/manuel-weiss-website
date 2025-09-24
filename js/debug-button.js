/**
 * Debug Script für Button-Probleme
 */

console.log('🔍 DEBUG: Button Debug Script geladen');

// Warte bis DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEBUG: DOM loaded, checking button system...');
    
    // Check 1: Event Registry vorhanden?
    if (window.eventRegistry) {
        console.log('✅ Event Registry gefunden');
        console.log('📊 Registrierte Actions:', Object.keys(window.eventRegistry.registry || {}));
    } else {
        console.error('❌ Event Registry NICHT gefunden!');
    }
    
    // Check 2: Button vorhanden?
    const button = document.getElementById('smartWorkflowButton');
    if (button) {
        console.log('✅ Button gefunden:', button);
        console.log('   - data-action:', button.getAttribute('data-action'));
        console.log('   - onclick:', button.onclick);
        console.log('   - Event Listeners:', getEventListeners ? getEventListeners(button) : 'getEventListeners not available');
    } else {
        console.error('❌ Button NICHT gefunden!');
    }
    
    // Check 3: startSmartWorkflow Funktion vorhanden?
    if (window.startSmartWorkflow) {
        console.log('✅ startSmartWorkflow Funktion gefunden');
        console.log('   - Typ:', typeof window.startSmartWorkflow);
    } else {
        console.error('❌ startSmartWorkflow Funktion NICHT gefunden!');
    }
    
    // Check 4: Handler registriert?
    if (window.eventRegistry && window.eventRegistry.registry) {
        const workflowHandler = window.eventRegistry.registry.get('start-workflow');
        if (workflowHandler) {
            console.log('✅ start-workflow Handler registriert:', workflowHandler);
        } else {
            console.error('❌ start-workflow Handler NICHT registriert!');
        }
    }
    
    // Manueller Fix - direkt Event Listener hinzufügen
    console.log('🔧 Füge manuellen Event Listener hinzu...');
    
    if (button) {
        // Entferne alle existierenden Handler
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Füge neuen Handler hinzu
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🎯 Button geklickt!');
            
            if (window.startSmartWorkflow) {
                console.log('📞 Rufe startSmartWorkflow auf...');
                try {
                    window.startSmartWorkflow();
                } catch (error) {
                    console.error('❌ Fehler beim Aufruf:', error);
                }
            } else {
                console.error('❌ startSmartWorkflow nicht verfügbar!');
                // Fallback
                alert('Smart Workflow wird geladen...\n\nBitte laden Sie die Seite neu und versuchen Sie es erneut.');
            }
        });
        
        console.log('✅ Manueller Event Listener hinzugefügt');
    }
});

// Globale Debug-Funktion
window.debugWorkflowButton = function() {
    console.log('=== WORKFLOW BUTTON DEBUG ===');
    console.log('1. Event Registry:', window.eventRegistry);
    console.log('2. Button:', document.getElementById('smartWorkflowButton'));
    console.log('3. startSmartWorkflow:', window.startSmartWorkflow);
    console.log('4. Registry Map:', window.eventRegistry?.registry);
    
    // Test-Klick
    const button = document.getElementById('smartWorkflowButton');
    if (button) {
        console.log('🧪 Simuliere Button-Klick...');
        button.click();
    }
};
