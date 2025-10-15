/**
 * SWOT Smart Workflow - Moderne, detaillierte Implementierung
 * Basierend auf dem Ikigai-Workflow Design mit hoher Granularität
 */

class SWOTSmartWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.workflowData = {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: [],
            analysis: null
        };
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing SWOT Smart Workflow...');
        this.createWorkflowInterface();
        this.loadStep(1);
    }
    
    createWorkflowInterface() {
        // Create main workflow container
        const container = document.createElement('div');
        container.id = 'swot-smart-workflow';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        container.innerHTML = `
            <div style="background: white; width: 90%; max-width: 900px; height: 90%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; position: relative;">
                    <h2 style="margin: 0; font-size: 1.8rem;">🎯 SWOT-Analyse</h2>
                    <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Analysiere deine Stärken, Schwächen, Chancen und Risiken</p>
                    <button onclick="window.swotSmartWorkflow.close()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <!-- Progress Bar -->
                <div style="background: #f8fafc; padding: 1rem 2rem; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: #374151;">Schritt <span id="current-step">1</span> von <span id="total-steps">5</span></span>
                        <span style="color: #6b7280;" id="step-title">Stärken</span>
                    </div>
                    <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
                        <div id="progress-bar" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 100%; width: 20%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Content -->
                <div id="swot-content" style="flex: 1; padding: 2rem; overflow-y: auto;">
                    <!-- Step content will be loaded here -->
                </div>
                
                <!-- Navigation -->
                <div style="background: #f8fafc; padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                    <button id="prev-btn" onclick="window.swotSmartWorkflow.previousStep()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: none;">
                        ← Zurück
                    </button>
                    <div style="flex: 1;"></div>
                    <button id="next-btn" onclick="window.swotSmartWorkflow.nextStep()" style="padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Weiter →
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    }
    
    loadStep(step) {
        this.currentStep = step;
        this.updateProgress();
        
        const content = document.getElementById('swot-content');
        if (!content) return;
        
        let stepContent = '';
        
        switch(step) {
            case 1:
                stepContent = this.generateStep1();
                break;
            case 2:
                stepContent = this.generateStep2();
                break;
            case 3:
                stepContent = this.generateStep3();
                break;
            case 4:
                stepContent = this.generateStep4();
                break;
            case 5:
                stepContent = this.generateStep5();
                break;
        }
        
        content.innerHTML = stepContent;
        this.updateNavigation();
    }
    
    generateStep1() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 1: Stärken</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Was kannst du besonders gut? Was sind deine größten Vorteile?</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Deine Stärken und Fähigkeiten:</label>
                <textarea id="strengths" placeholder="z.B. Führungsqualitäten, technische Fähigkeiten, Kreativität, Kommunikationsstärke, Problemlösungskompetenz, Teamfähigkeit..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h4 style="color: #14532d; margin: 0 0 0.5rem 0;">💪 Stärken-Beispiele:</h4>
                <ul style="color: #14532d; margin: 0; padding-left: 1.5rem;">
                    <li>Fachliche Kompetenzen und Expertise</li>
                    <li>Persönliche Eigenschaften und Charakterstärken</li>
                    <li>Erfahrungen und Erfolge</li>
                    <li>Ressourcen und Netzwerke</li>
                </ul>
            </div>
        `;
    }
    
    generateStep2() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 2: Schwächen</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Wo hast du Verbesserungspotential? Was sind deine Herausforderungen?</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Deine Schwächen und Verbesserungsbereiche:</label>
                <textarea id="weaknesses" placeholder="z.B. Zeitmanagement, technische Defizite, Kommunikationsschwächen, fehlende Erfahrung, begrenzte Ressourcen..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #fef2f2; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ef4444;">
                <h4 style="color: #991b1b; margin: 0 0 0.5rem 0;">⚠️ Schwächen-Beispiele:</h4>
                <ul style="color: #991b1b; margin: 0; padding-left: 1.5rem;">
                    <li>Fachliche Lücken und Wissensdefizite</li>
                    <li>Persönliche Entwicklungsbereiche</li>
                    <li>Begrenzte Ressourcen und Kapazitäten</li>
                    <li>Externe Abhängigkeiten</li>
                </ul>
            </div>
        `;
    }
    
    generateStep3() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 3: Chancen</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Welche Möglichkeiten siehst du? Was sind deine Chancen?</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Deine Chancen und Möglichkeiten:</label>
                <textarea id="opportunities" placeholder="z.B. neue Märkte, technologische Trends, Netzwerke, Weiterbildungen, Partnerschaften, Marktveränderungen..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 0.5rem 0;">🚀 Chancen-Beispiele:</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 1.5rem;">
                    <li>Marktchancen und neue Trends</li>
                    <li>Technologische Entwicklungen</li>
                    <li>Netzwerk- und Kooperationsmöglichkeiten</li>
                    <li>Weiterbildungs- und Entwicklungsoptionen</li>
                </ul>
            </div>
        `;
    }
    
    generateStep4() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 4: Risiken</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Welche Bedrohungen siehst du? Was sind deine Risiken?</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Deine Risiken und Bedrohungen:</label>
                <textarea id="threats" placeholder="z.B. Konkurrenz, Marktveränderungen, technologische Disruption, wirtschaftliche Risiken, regulatorische Änderungen..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #92400e; margin: 0 0 0.5rem 0;">⚠️ Risiken-Beispiele:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
                    <li>Marktrisiken und Konkurrenz</li>
                    <li>Technologische Disruption</li>
                    <li>Wirtschaftliche und politische Risiken</li>
                    <li>Regulatorische und rechtliche Änderungen</li>
                </ul>
            </div>
        `;
    }
    
    generateStep5() {
        const analysis = this.generateSWOTAnalysis();
        
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 5: SWOT-Analyse Ergebnis</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Deine strategische Analyse und Handlungsempfehlungen</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border: 2px solid #22c55e;">
                    <h4 style="color: #14532d; margin: 0 0 1rem 0;">💪 Stärken</h4>
                    <p style="color: #14532d; margin: 0; font-size: 0.9rem;" id="summary-strengths">-</p>
                </div>
                <div style="background: #fef2f2; padding: 1.5rem; border-radius: 8px; border: 2px solid #ef4444;">
                    <h4 style="color: #991b1b; margin: 0 0 1rem 0;">⚠️ Schwächen</h4>
                    <p style="color: #991b1b; margin: 0; font-size: 0.9rem;" id="summary-weaknesses">-</p>
                </div>
                <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border: 2px solid #0ea5e9;">
                    <h4 style="color: #0c4a6e; margin: 0 0 1rem 0;">🚀 Chancen</h4>
                    <p style="color: #0c4a6e; margin: 0; font-size: 0.9rem;" id="summary-opportunities">-</p>
                </div>
                <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; border: 2px solid #f59e0b;">
                    <h4 style="color: #92400e; margin: 0 0 1rem 0;">⚠️ Risiken</h4>
                    <p style="color: #92400e; margin: 0; font-size: 0.9rem;" id="summary-threats">-</p>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🎯 Strategische Empfehlungen</h4>
                <ul style="margin: 0; padding-left: 1.5rem;">
                    ${analysis.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                <h4 style="color: #374151; margin: 0 0 1rem 0;">📊 Nächste Schritte:</h4>
                <ol style="color: #6b7280; margin: 0; padding-left: 1.5rem;">
                    <li>Stärken weiter ausbauen und nutzen</li>
                    <li>Schwächen gezielt angehen und verbessern</li>
                    <li>Chancen aktiv verfolgen und umsetzen</li>
                    <li>Risiken überwachen und minimieren</li>
                </ol>
            </div>
        `;
    }
    
    generateSWOTAnalysis() {
        const strengths = document.getElementById('strengths')?.value || '';
        const weaknesses = document.getElementById('weaknesses')?.value || '';
        const opportunities = document.getElementById('opportunities')?.value || '';
        const threats = document.getElementById('threats')?.value || '';
        
        const recommendations = [];
        
        // Stärken-Chancen-Strategien (SO)
        if (strengths.length > 50 && opportunities.length > 50) {
            recommendations.push('Nutze deine Stärken, um die identifizierten Chancen zu ergreifen');
        }
        
        // Stärken-Risiken-Strategien (ST)
        if (strengths.length > 50 && threats.length > 50) {
            recommendations.push('Setze deine Stärken ein, um die identifizierten Risiken abzuwehren');
        }
        
        // Schwächen-Chancen-Strategien (WO)
        if (weaknesses.length > 50 && opportunities.length > 50) {
            recommendations.push('Arbeite an deinen Schwächen, um die Chancen nutzen zu können');
        }
        
        // Schwächen-Risiken-Strategien (WT)
        if (weaknesses.length > 50 && threats.length > 50) {
            recommendations.push('Minimiere deine Schwächen, um den Risiken zu begegnen');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Führe eine detailliertere Analyse durch, um konkrete Handlungsempfehlungen zu entwickeln');
        }
        
        return {
            strengths: strengths.substring(0, 100) + '...',
            weaknesses: weaknesses.substring(0, 100) + '...',
            opportunities: opportunities.substring(0, 100) + '...',
            threats: threats.substring(0, 100) + '...',
            recommendations
        };
    }
    
    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.getElementById('progress-bar');
        const currentStepEl = document.getElementById('current-step');
        const stepTitle = document.getElementById('step-title');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (currentStepEl) currentStepEl.textContent = this.currentStep;
        
        const titles = [
            'Stärken',
            'Schwächen',
            'Chancen',
            'Risiken',
            'SWOT-Analyse Ergebnis'
        ];
        
        if (stepTitle) stepTitle.textContent = titles[this.currentStep - 1];
    }
    
    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        }
        
        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.textContent = 'Abschließen';
                nextBtn.removeAttribute('onclick');
                nextBtn.setAttribute('onclick', 'window.swotSmartWorkflow.finish()');
            } else {
                nextBtn.textContent = 'Weiter →';
                nextBtn.removeAttribute('onclick');
                nextBtn.setAttribute('onclick', 'window.swotSmartWorkflow.nextStep()');
            }
        }
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.saveCurrentStep();
            this.loadStep(this.currentStep + 1);
        }
    }
    
    previousStep() {
        if (this.currentStep > 1) {
            this.loadStep(this.currentStep - 1);
        }
    }
    
    saveCurrentStep() {
        switch(this.currentStep) {
            case 1:
                this.workflowData.strengths = document.getElementById('strengths')?.value || '';
                break;
            case 2:
                this.workflowData.weaknesses = document.getElementById('weaknesses')?.value || '';
                break;
            case 3:
                this.workflowData.opportunities = document.getElementById('opportunities')?.value || '';
                break;
            case 4:
                this.workflowData.threats = document.getElementById('threats')?.value || '';
                break;
        }
    }
    
    finish() {
        this.saveCurrentStep();
        
        // Save to localStorage
        localStorage.setItem('swotSmartWorkflow', JSON.stringify(this.workflowData));
        
        // Show success message
        alert('🎉 Deine SWOT-Analyse wurde gespeichert! Nutze diese Erkenntnisse für deine strategische Planung.');
        
        // Close workflow
        this.close();
    }
    
    close() {
        const container = document.getElementById('swot-smart-workflow');
        if (container) {
            container.remove();
        }
    }
}

// Make globally available
window.SWOTSmartWorkflow = SWOTSmartWorkflow;
