/**
 * RAISEC Smart Workflow - Moderne, detaillierte Implementierung
 * Basierend auf dem Ikigai-Workflow Design mit hoher Granularität
 */

class RAISECSmartWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.workflowData = {
            realistic: [],
            analytical: [],
            artistic: [],
            social: [],
            enterprising: [],
            conventional: [],
            results: null
        };
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing RAISEC Smart Workflow...');
        this.createWorkflowInterface();
        this.loadStep(1);
    }
    
    createWorkflowInterface() {
        // Create main workflow container
        const container = document.createElement('div');
        container.id = 'raisec-smart-workflow';
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
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; padding: 2rem; position: relative;">
                    <h2 style="margin: 0; font-size: 1.8rem;">🎯 RAISEC - Berufsorientierung</h2>
                    <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Entdecke deine beruflichen Interessen und finde deinen idealen Karriereweg</p>
                    <button onclick="window.raisecSmartWorkflow.close()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <!-- Progress Bar -->
                <div style="background: #f8fafc; padding: 1rem 2rem; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: #374151;">Schritt <span id="current-step">1</span> von <span id="total-steps">6</span></span>
                        <span style="color: #6b7280;" id="step-title">Realistische Interessen</span>
                    </div>
                    <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
                        <div id="progress-bar" style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); height: 100%; width: 16.67%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Content -->
                <div id="raisec-content" style="flex: 1; padding: 2rem; overflow-y: auto;">
                    <!-- Step content will be loaded here -->
                </div>
                
                <!-- Navigation -->
                <div style="background: #f8fafc; padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                    <button id="prev-btn" onclick="window.raisecSmartWorkflow.previousStep()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: none;">
                        ← Zurück
                    </button>
                    <div style="flex: 1;"></div>
                    <button id="next-btn" onclick="window.raisecSmartWorkflow.nextStep()" style="padding: 0.75rem 1.5rem; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
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
        
        const content = document.getElementById('raisec-content');
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
            case 6:
                stepContent = this.generateStep6();
                break;
        }
        
        content.innerHTML = stepContent;
        this.updateNavigation();
    }
    
    generateStep1() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 1: Realistische Interessen</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Praktische, handwerkliche und technische Tätigkeiten</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Welche realistischen Tätigkeiten interessieren dich?</label>
                <textarea id="realistic-interests" placeholder="z.B. Werkzeuge verwenden, Maschinen bedienen, reparieren, konstruieren, körperliche Arbeit, praktische Probleme lösen..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #92400e; margin: 0 0 0.5rem 0;">🔧 Realistische Typen:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
                    <li>Ingenieure, Techniker, Handwerker</li>
                    <li>Landwirte, Gärtner, Tierpfleger</li>
                    <li>Mechaniker, Elektriker, Installateure</li>
                    <li>Piloten, Fahrer, Maschinenbediener</li>
                </ul>
            </div>
        `;
    }
    
    generateStep2() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 2: Analytische Interessen</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Wissenschaftliche, forschende und intellektuelle Tätigkeiten</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Welche analytischen Tätigkeiten interessieren dich?</label>
                <textarea id="analytical-interests" placeholder="z.B. forschen, analysieren, experimentieren, Daten auswerten, komplexe Probleme lösen, Theorien entwickeln..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 0.5rem 0;">🔬 Analytische Typen:</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 1.5rem;">
                    <li>Wissenschaftler, Forscher, Mathematiker</li>
                    <li>Ärzte, Psychologen, Biologen</li>
                    <li>Programmierer, Datenanalysten</li>
                    <li>Architekten, Ingenieure</li>
                </ul>
            </div>
        `;
    }
    
    generateStep3() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 3: Künstlerische Interessen</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Kreative, künstlerische und unkonventionelle Tätigkeiten</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Welche künstlerischen Tätigkeiten interessieren dich?</label>
                <textarea id="artistic-interests" placeholder="z.B. malen, schreiben, musizieren, designen, fotografieren, tanzen, schauspielern, kreativ arbeiten..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #fdf2f8; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ec4899;">
                <h4 style="color: #831843; margin: 0 0 0.5rem 0;">🎨 Künstlerische Typen:</h4>
                <ul style="color: #831843; margin: 0; padding-left: 1.5rem;">
                    <li>Künstler, Designer, Fotografen</li>
                    <li>Musiker, Schauspieler, Tänzer</li>
                    <li>Schriftsteller, Journalisten</li>
                    <li>Architekten, Innenarchitekten</li>
                </ul>
            </div>
        `;
    }
    
    generateStep4() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 4: Soziale Interessen</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Helfende, beratende und zwischenmenschliche Tätigkeiten</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Welche sozialen Tätigkeiten interessieren dich?</label>
                <textarea id="social-interests" placeholder="z.B. anderen helfen, beraten, unterrichten, pflegen, betreuen, kommunizieren, Teams leiten..." 
                    style="width: 100%; height: 120px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
            </div>
            
            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h4 style="color: #14532d; margin: 0 0 0.5rem 0;">🤝 Soziale Typen:</h4>
                <ul style="color: #14532d; margin: 0; padding-left: 1.5rem;">
                    <li>Lehrer, Erzieher, Sozialarbeiter</li>
                    <li>Ärzte, Pfleger, Therapeuten</li>
                    <li>Berater, Coaches, Trainer</li>
                    <li>Verkäufer, Servicekräfte</li>
                </ul>
            </div>
        `;
    }
    
    generateStep5() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 5: Unternehmerische & Konventionelle Interessen</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Führende, organisierende und strukturierte Tätigkeiten</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Unternehmerische Tätigkeiten:</label>
                    <textarea id="enterprising-interests" placeholder="z.B. führen, organisieren, verkaufen, verhandeln, Projekte leiten, Unternehmen gründen..." 
                        style="width: 100%; height: 100px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
                </div>
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Konventionelle Tätigkeiten:</label>
                    <textarea id="conventional-interests" placeholder="z.B. organisieren, verwalten, dokumentieren, kalkulieren, strukturiert arbeiten..." 
                        style="width: 100%; height: 100px; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; resize: vertical; font-family: inherit;"></textarea>
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                <h4 style="color: #374151; margin: 0 0 1rem 0;">💼 Berufliche Beispiele:</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong style="color: #8b5cf6;">Unternehmerisch:</strong>
                        <ul style="color: #6b7280; margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
                            <li>Manager, Unternehmer</li>
                            <li>Verkäufer, Berater</li>
                            <li>Politiker, Anwalt</li>
                        </ul>
                    </div>
                    <div>
                        <strong style="color: #6b7280;">Konventionell:</strong>
                        <ul style="color: #6b7280; margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
                            <li>Buchhalter, Sekretär</li>
                            <li>Bankangestellter, Sachbearbeiter</li>
                            <li>Bürokaufmann, Verwaltung</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateStep6() {
        const results = this.calculateRAISECResults();
        
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 6: Deine RAISEC-Ergebnisse</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Deine beruflichen Interessen und passende Karrierewege</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🎯 Dein RAISEC-Code</h4>
                <p style="margin: 0; font-size: 1.2rem; line-height: 1.6;">${results.code}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                ${results.scores.map(score => `
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb; text-align: center;">
                        <h5 style="color: #374151; margin: 0 0 0.5rem 0;">${score.type}</h5>
                        <div style="font-size: 2rem; font-weight: bold; color: #8b5cf6; margin-bottom: 0.5rem;">${score.value}%</div>
                        <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); height: 100%; width: ${score.value}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 1rem 0;">💡 Deine Empfehlungen:</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 1.5rem;">
                    ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    calculateRAISECResults() {
        const realistic = document.getElementById('realistic-interests')?.value || '';
        const analytical = document.getElementById('analytical-interests')?.value || '';
        const artistic = document.getElementById('artistic-interests')?.value || '';
        const social = document.getElementById('social-interests')?.value || '';
        const enterprising = document.getElementById('enterprising-interests')?.value || '';
        const conventional = document.getElementById('conventional-interests')?.value || '';
        
        // Einfache Bewertung basierend auf Textlänge und Schlüsselwörtern
        const scores = {
            R: Math.min(100, (realistic.length / 10) * 20 + this.countKeywords(realistic, ['werkzeug', 'maschine', 'reparieren', 'bauen', 'technik'])),
            A: Math.min(100, (analytical.length / 10) * 20 + this.countKeywords(analytical, ['forschen', 'analysieren', 'daten', 'wissenschaft', 'experiment'])),
            I: Math.min(100, (artistic.length / 10) * 20 + this.countKeywords(artistic, ['kreativ', 'künstlerisch', 'design', 'malen', 'musik'])),
            S: Math.min(100, (social.length / 10) * 20 + this.countKeywords(social, ['helfen', 'beraten', 'unterrichten', 'pflegen', 'kommunizieren'])),
            E: Math.min(100, (enterprising.length / 10) * 20 + this.countKeywords(enterprising, ['führen', 'verkaufen', 'organisieren', 'unternehmen', 'projekt'])),
            C: Math.min(100, (conventional.length / 10) * 20 + this.countKeywords(conventional, ['organisieren', 'verwalten', 'dokumentieren', 'strukturiert', 'büro']))
        };
        
        // Sortiere nach Werten
        const sortedScores = Object.entries(scores)
            .map(([type, value]) => ({ type, value: Math.round(value) }))
            .sort((a, b) => b.value - a.value);
        
        const code = sortedScores.slice(0, 3).map(s => s.type).join('');
        
        const recommendations = this.generateRecommendations(sortedScores);
        
        return {
            code,
            scores: sortedScores,
            recommendations
        };
    }
    
    countKeywords(text, keywords) {
        return keywords.reduce((count, keyword) => {
            return count + (text.toLowerCase().includes(keyword.toLowerCase()) ? 10 : 0);
        }, 0);
    }
    
    generateRecommendations(scores) {
        const topType = scores[0].type;
        const recommendations = {
            'R': ['Technische Berufe erkunden', 'Praktische Ausbildungen in Betracht ziehen', 'Handwerkliche Fähigkeiten entwickeln'],
            'A': ['Wissenschaftliche Studiengänge prüfen', 'Forschungsmöglichkeiten erkunden', 'Analytische Fähigkeiten vertiefen'],
            'I': ['Kreative Berufe erkunden', 'Künstlerische Fähigkeiten entwickeln', 'Design-Studiengänge prüfen'],
            'S': ['Soziale Berufe erkunden', 'Beratungsausbildungen prüfen', 'Kommunikationsfähigkeiten entwickeln'],
            'E': ['Führungspositionen anstreben', 'Unternehmertum erkunden', 'Management-Fähigkeiten entwickeln'],
            'C': ['Verwaltungsberufe erkunden', 'Organisatorische Fähigkeiten entwickeln', 'Büroberufe prüfen']
        };
        
        return recommendations[topType] || ['Weitere Berufsberatung in Anspruch nehmen'];
    }
    
    updateProgress() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.getElementById('progress-bar');
        const currentStepEl = document.getElementById('current-step');
        const stepTitle = document.getElementById('step-title');
        
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (currentStepEl) currentStepEl.textContent = this.currentStep;
        
        const titles = [
            'Realistische Interessen',
            'Analytische Interessen',
            'Künstlerische Interessen',
            'Soziale Interessen',
            'Unternehmerische & Konventionelle Interessen',
            'Deine RAISEC-Ergebnisse'
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
                nextBtn.setAttribute('onclick', 'window.raisecSmartWorkflow.finish()');
            } else {
                nextBtn.textContent = 'Weiter →';
                nextBtn.removeAttribute('onclick');
                nextBtn.setAttribute('onclick', 'window.raisecSmartWorkflow.nextStep()');
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
                this.workflowData.realistic = document.getElementById('realistic-interests')?.value || '';
                break;
            case 2:
                this.workflowData.analytical = document.getElementById('analytical-interests')?.value || '';
                break;
            case 3:
                this.workflowData.artistic = document.getElementById('artistic-interests')?.value || '';
                break;
            case 4:
                this.workflowData.social = document.getElementById('social-interests')?.value || '';
                break;
            case 5:
                this.workflowData.enterprising = document.getElementById('enterprising-interests')?.value || '';
                this.workflowData.conventional = document.getElementById('conventional-interests')?.value || '';
                break;
        }
    }
    
    finish() {
        this.saveCurrentStep();
        
        // Save to localStorage
        localStorage.setItem('raisecSmartWorkflow', JSON.stringify(this.workflowData));
        
        // Show success message
        alert('🎉 Deine RAISEC-Analyse wurde gespeichert! Nutze diese Erkenntnisse für deine Berufswahl.');
        
        // Close workflow
        this.close();
    }
    
    close() {
        const container = document.getElementById('raisec-smart-workflow');
        if (container) {
            container.remove();
        }
    }
}

// Make globally available
window.RAISECSmartWorkflow = RAISECSmartWorkflow;
