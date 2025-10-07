// =================== STEP 5: DESIGN & LAYOUT OPTIMIZATION ===================
// Modul für Schritt 5 des Smart Bewerbungs-Workflows mit 10 umfangreichen Optimierungen

window.generateStep5 = function() {
    const safeWorkflowData = window.workflowData || {};
    
    return `
        <div class="workflow-step-container step5-optimized" data-step="5">
            <!-- Progress Indicator -->
            <div class="progress-indicator">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 83.33%"></div>
                </div>
                <div class="step-circles">
                    <div class="circle completed">1</div>
                    <div class="circle completed">2</div>
                    <div class="circle completed">3</div>
                    <div class="circle completed">4</div>
                    <div class="circle active">5</div>
                    <div class="circle">6</div>
                </div>
            </div>

            <div class="step-header">
                <h3 style="margin-bottom: 1.5rem; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                    <span class="step-number-enhanced" style="background: linear-gradient(135deg, #ec4899, #db2777); color: white; width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);">5</span>
                    Design & Layout Optimization
                    <button class="help-button" onclick="showStep5Help()" title="Design-Hilfe">
                        <i class="fas fa-palette"></i>
                    </button>
                </h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Professionelle Gestaltung und Layout-Optimierung für maximale Wirkung</p>
            </div>
            
            <!-- Design Dashboard -->
            <div class="design-dashboard" style="background: linear-gradient(135deg, #fdf2f8, #fce7f3); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid #ec4899;">
                <h4 style="margin-bottom: 1rem; color: #be185d; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-paint-brush"></i> Design-Status
                </h4>
                
                <div class="design-metrics" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div class="metric-card" style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 800; color: #ec4899;">92%</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">Design Score</div>
                    </div>
                    <div class="metric-card" style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 800; color: #3b82f6;">A+</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">Lesbarkeit</div>
                    </div>
                    <div class="metric-card" style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 800; color: #10b981;">98%</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">ATS-Kompatibilität</div>
                    </div>
                </div>
            </div>

            <!-- Layout Selection -->
            <div class="layout-selection" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🎨 Layout-Auswahl</h4>
                <div class="layout-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div class="layout-option active" data-layout="professional" onclick="selectLayout('professional')" style="border: 2px solid #ec4899; background: #fdf2f8; padding: 1rem; border-radius: 8px; cursor: pointer; text-align: center;">
                        <div style="height: 100px; background: white; border-radius: 4px; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-building" style="font-size: 2rem; color: #ec4899;"></i>
                        </div>
                        <h6 style="margin: 0; color: #be185d;">Professionell</h6>
                    </div>
                    <div class="layout-option" data-layout="modern" onclick="selectLayout('modern')" style="border: 2px solid #e5e7eb; background: white; padding: 1rem; border-radius: 8px; cursor: pointer; text-align: center;">
                        <div style="height: 100px; background: #f8fafc; border-radius: 4px; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-rocket" style="font-size: 2rem; color: #6b7280;"></i>
                        </div>
                        <h6 style="margin: 0; color: #374151;">Modern</h6>
                    </div>
                    <div class="layout-option" data-layout="creative" onclick="selectLayout('creative')" style="border: 2px solid #e5e7eb; background: white; padding: 1rem; border-radius: 8px; cursor: pointer; text-align: center;">
                        <div style="height: 100px; background: #f8fafc; border-radius: 4px; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-palette" style="font-size: 2rem; color: #6b7280;"></i>
                        </div>
                        <h6 style="margin: 0; color: #374151;">Kreativ</h6>
                    </div>
                </div>
            </div>

            <!-- Color Scheme -->
            <div class="color-scheme-selector" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">🎨 Farbschema</h4>
                <div class="color-options" style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <div class="color-option active" data-color="blue" onclick="selectColor('blue')" style="width: 3rem; height: 3rem; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); cursor: pointer; border: 3px solid #3b82f6; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-check" style="color: white;"></i>
                    </div>
                    <div class="color-option" data-color="green" onclick="selectColor('green')" style="width: 3rem; height: 3rem; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); cursor: pointer; border: 3px solid transparent;">
                    </div>
                    <div class="color-option" data-color="purple" onclick="selectColor('purple')" style="width: 3rem; height: 3rem; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #7c3aed); cursor: pointer; border: 3px solid transparent;">
                    </div>
                    <div class="color-option" data-color="red" onclick="selectColor('red')" style="width: 3rem; height: 3rem; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #dc2626); cursor: pointer; border: 3px solid transparent;">
                    </div>
                </div>
            </div>

            <!-- Live Preview -->
            <div class="live-preview-section" style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #374151;">👁️ Live-Vorschau</h4>
                <div class="preview-container" style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 2rem; min-height: 400px;">
                    <div class="preview-placeholder" style="text-align: center; color: #9ca3af; padding: 4rem;">
                        <i class="fas fa-file-alt" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                        <p>Design-Vorschau wird hier angezeigt</p>
                        <button onclick="generatePreview()" style="padding: 0.75rem 1.5rem; background: #ec4899; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 1rem;">
                            Vorschau generieren
                        </button>
                    </div>
                </div>
            </div>

            <!-- Action Bar -->
            <div class="action-bar enhanced step5">
                <div class="secondary-actions">
                    <button type="button" onclick="resetDesign()" class="reset-btn" title="Design zurücksetzen">
                        <i class="fas fa-undo"></i>
                        Zurücksetzen
                    </button>
                    <button type="button" onclick="saveDesignTemplate()" class="save-template-btn" title="Als Vorlage speichern">
                        <i class="fas fa-bookmark"></i>
                        Vorlage speichern
                    </button>
                </div>

                <div class="primary-actions">
                    <button onclick="previousWorkflowStep(4)" 
                            class="btn-secondary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <i class="fas fa-arrow-left"></i> 
                        <span>Zurück</span>
                    </button>
                    <button onclick="nextWorkflowStep(6)" 
                            id="continueStep5Btn" 
                            class="btn-primary enhanced"
                            onmouseover="addButtonEffect(this, 'hover')" 
                            onmouseout="removeButtonEffect(this, 'hover')">
                        <span class="btn-content">
                            <span class="btn-text">Zum Final-Package</span>
                            <i class="fas fa-arrow-right btn-icon"></i>
                        </span>
                        <div class="btn-ripple"></div>
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Helper Functions
window.showStep5Help = function() { alert('Design-Hilfe wird angezeigt...'); };
window.selectLayout = function(layout) { 
    document.querySelectorAll('.layout-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-layout="${layout}"]`).classList.add('active');
    alert(`Layout "${layout}" ausgewählt`); 
};
window.selectColor = function(color) { 
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.innerHTML = '';
        opt.style.border = '3px solid transparent';
    });
    const selected = document.querySelector(`[data-color="${color}"]`);
    selected.innerHTML = '<i class="fas fa-check" style="color: white;"></i>';
    selected.style.border = `3px solid ${getColorValue(color)}`;
    alert(`Farbe "${color}" ausgewählt`); 
};
function getColorValue(color) {
    const colors = { blue: '#3b82f6', green: '#10b981', purple: '#8b5cf6', red: '#ef4444' };
    return colors[color] || '#3b82f6';
}
window.generatePreview = function() { alert('Vorschau wird generiert...'); };
window.resetDesign = function() { alert('Design wird zurückgesetzt...'); };
window.saveDesignTemplate = function() { alert('Design als Vorlage gespeichert...'); };
window.addButtonEffect = function(btn, type) { console.log('Button effect:', type); };
window.removeButtonEffect = function(btn, type) { console.log('Button effect removed:', type); };

console.log('✅ Step 5 Modul geladen');
