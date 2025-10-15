/**
 * Wheel of Life Smart Workflow - Moderne, detaillierte Implementierung
 * Basierend auf dem Ikigai-Workflow Design mit hoher Granularität
 */

class WheelOfLifeSmartWorkflow {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.workflowData = {
            career: 0,
            finance: 0,
            health: 0,
            relationships: 0,
            personalGrowth: 0,
            recreation: 0,
            physicalEnvironment: 0,
            contribution: 0,
            results: null
        };
        
        this.lifeAreas = [
            { key: 'career', name: 'Karriere & Beruf', color: '#3b82f6' },
            { key: 'finance', name: 'Finanzen & Geld', color: '#10b981' },
            { key: 'health', name: 'Gesundheit & Fitness', color: '#ef4444' },
            { key: 'relationships', name: 'Beziehungen & Familie', color: '#f59e0b' },
            { key: 'personalGrowth', name: 'Persönliche Entwicklung', color: '#8b5cf6' },
            { key: 'recreation', name: 'Freizeit & Hobbys', color: '#06b6d4' },
            { key: 'physicalEnvironment', name: 'Umgebung & Zuhause', color: '#84cc16' },
            { key: 'contribution', name: 'Beitrag & Sinn', color: '#f97316' }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing Wheel of Life Smart Workflow...');
        this.createWorkflowInterface();
        this.loadStep(1);
    }
    
    createWorkflowInterface() {
        // Create main workflow container
        const container = document.createElement('div');
        container.id = 'wheel-of-life-smart-workflow';
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
                <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 2rem; position: relative;">
                    <h2 style="margin: 0; font-size: 1.8rem;">🎯 Wheel of Life</h2>
                    <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Bewerte deine Lebensbereiche und finde dein Gleichgewicht</p>
                    <button onclick="window.wheelOfLifeSmartWorkflow.close()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                
                <!-- Progress Bar -->
                <div style="background: #f8fafc; padding: 1rem 2rem; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: #374151;">Schritt <span id="current-step">1</span> von <span id="total-steps">6</span></span>
                        <span style="color: #6b7280;" id="step-title">Lebensbereiche bewerten</span>
                    </div>
                    <div style="background: #e5e7eb; height: 4px; border-radius: 2px; overflow: hidden;">
                        <div id="progress-bar" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); height: 100%; width: 16.67%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Content -->
                <div id="wheel-content" style="flex: 1; padding: 2rem; overflow-y: auto;">
                    <!-- Step content will be loaded here -->
                </div>
                
                <!-- Navigation -->
                <div style="background: #f8fafc; padding: 1.5rem 2rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                    <button id="prev-btn" onclick="window.wheelOfLifeSmartWorkflow.previousStep()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: none;">
                        ← Zurück
                    </button>
                    <div style="flex: 1;"></div>
                    <button id="next-btn" onclick="window.wheelOfLifeSmartWorkflow.nextStep()" style="padding: 0.75rem 1.5rem; background: #06b6d4; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
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
        
        const content = document.getElementById('wheel-content');
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
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 1: Karriere & Beruf</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Wie zufrieden bist du mit deiner beruflichen Situation?</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 1rem;">Bewerte deine Karriere-Zufriedenheit (1-10):</label>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: #6b7280;">1 (sehr unzufrieden)</span>
                    <input type="range" id="career-slider" min="1" max="10" value="5" 
                        style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; outline: none;"
                        oninput="document.getElementById('career-value').textContent = this.value">
                    <span style="color: #6b7280;">10 (sehr zufrieden)</span>
                    <span id="career-value" style="font-weight: bold; color: #3b82f6; min-width: 2rem; text-align: center;">5</span>
                </div>
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h4 style="color: #0c4a6e; margin: 0 0 0.5rem 0;">💼 Karriere-Bereiche:</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 1.5rem;">
                    <li>Job-Zufriedenheit und Erfüllung</li>
                    <li>Karriere-Entwicklung und Aufstieg</li>
                    <li>Work-Life-Balance</li>
                    <li>Gehalt und Benefits</li>
                </ul>
            </div>
        `;
    }
    
    generateStep2() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 2: Finanzen & Geld</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Wie zufrieden bist du mit deiner finanziellen Situation?</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 1rem;">Bewerte deine Finanz-Zufriedenheit (1-10):</label>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: #6b7280;">1 (sehr unzufrieden)</span>
                    <input type="range" id="finance-slider" min="1" max="10" value="5" 
                        style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; outline: none;"
                        oninput="document.getElementById('finance-value').textContent = this.value">
                    <span style="color: #6b7280;">10 (sehr zufrieden)</span>
                    <span id="finance-value" style="font-weight: bold; color: #10b981; min-width: 2rem; text-align: center;">5</span>
                </div>
            </div>
            
            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #10b981;">
                <h4 style="color: #14532d; margin: 0 0 0.5rem 0;">💰 Finanz-Bereiche:</h4>
                <ul style="color: #14532d; margin: 0; padding-left: 1.5rem;">
                    <li>Einkommen und Verdienst</li>
                    <li>Sparen und Investitionen</li>
                    <li>Schulden und finanzielle Verpflichtungen</li>
                    <li>Finanzielle Sicherheit</li>
                </ul>
            </div>
        `;
    }
    
    generateStep3() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 3: Gesundheit & Fitness</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Wie zufrieden bist du mit deiner Gesundheit?</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 1rem;">Bewerte deine Gesundheits-Zufriedenheit (1-10):</label>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: #6b7280;">1 (sehr unzufrieden)</span>
                    <input type="range" id="health-slider" min="1" max="10" value="5" 
                        style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; outline: none;"
                        oninput="document.getElementById('health-value').textContent = this.value">
                    <span style="color: #6b7280;">10 (sehr zufrieden)</span>
                    <span id="health-value" style="font-weight: bold; color: #ef4444; min-width: 2rem; text-align: center;">5</span>
                </div>
            </div>
            
            <div style="background: #fef2f2; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ef4444;">
                <h4 style="color: #991b1b; margin: 0 0 0.5rem 0;">🏃‍♂️ Gesundheits-Bereiche:</h4>
                <ul style="color: #991b1b; margin: 0; padding-left: 1.5rem;">
                    <li>Körperliche Gesundheit und Fitness</li>
                    <li>Mentale Gesundheit und Wohlbefinden</li>
                    <li>Ernährung und Lebensstil</li>
                    <li>Medizinische Versorgung</li>
                </ul>
            </div>
        `;
    }
    
    generateStep4() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 4: Beziehungen & Familie</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Wie zufrieden bist du mit deinen Beziehungen?</p>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 1rem;">Bewerte deine Beziehungs-Zufriedenheit (1-10):</label>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: #6b7280;">1 (sehr unzufrieden)</span>
                    <input type="range" id="relationships-slider" min="1" max="10" value="5" 
                        style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; outline: none;"
                        oninput="document.getElementById('relationships-value').textContent = this.value">
                    <span style="color: #6b7280;">10 (sehr zufrieden)</span>
                    <span id="relationships-value" style="font-weight: bold; color: #f59e0b; min-width: 2rem; text-align: center;">5</span>
                </div>
            </div>
            
            <div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #92400e; margin: 0 0 0.5rem 0;">❤️ Beziehungs-Bereiche:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 1.5rem;">
                    <li>Partnerschaft und Liebe</li>
                    <li>Familie und Verwandte</li>
                    <li>Freundschaften und soziale Kontakte</li>
                    <li>Kommunikation und Konfliktlösung</li>
                </ul>
            </div>
        `;
    }
    
    generateStep5() {
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 5: Weitere Lebensbereiche</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Bewerte die restlichen Lebensbereiche</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Persönliche Entwicklung:</label>
                    <input type="range" id="personalGrowth-slider" min="1" max="10" value="5" 
                        style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; outline: none;"
                        oninput="document.getElementById('personalGrowth-value').textContent = this.value">
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                        <span style="color: #6b7280; font-size: 0.8rem;">1</span>
                        <span id="personalGrowth-value" style="font-weight: bold; color: #8b5cf6;">5</span>
                        <span style="color: #6b7280; font-size: 0.8rem;">10</span>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Freizeit & Hobbys:</label>
                    <input type="range" id="recreation-slider" min="1" max="10" value="5" 
                        style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; outline: none;"
                        oninput="document.getElementById('recreation-value').textContent = this.value">
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                        <span style="color: #6b7280; font-size: 0.8rem;">1</span>
                        <span id="recreation-value" style="font-weight: bold; color: #06b6d4;">5</span>
                        <span style="color: #6b7280; font-size: 0.8rem;">10</span>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Umgebung & Zuhause:</label>
                    <input type="range" id="physicalEnvironment-slider" min="1" max="10" value="5" 
                        style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; outline: none;"
                        oninput="document.getElementById('physicalEnvironment-value').textContent = this.value">
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                        <span style="color: #6b7280; font-size: 0.8rem;">1</span>
                        <span id="physicalEnvironment-value" style="font-weight: bold; color: #84cc16;">5</span>
                        <span style="color: #6b7280; font-size: 0.8rem;">10</span>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">Beitrag & Sinn:</label>
                    <input type="range" id="contribution-slider" min="1" max="10" value="5" 
                        style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; outline: none;"
                        oninput="document.getElementById('contribution-value').textContent = this.value">
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                        <span style="color: #6b7280; font-size: 0.8rem;">1</span>
                        <span id="contribution-value" style="font-weight: bold; color: #f97316;">5</span>
                        <span style="color: #6b7280; font-size: 0.8rem;">10</span>
                    </div>
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb;">
                <h4 style="color: #374151; margin: 0 0 1rem 0;">🎯 Lebensbereiche:</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <strong style="color: #8b5cf6;">Persönliche Entwicklung:</strong>
                        <p style="color: #6b7280; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Lernen, Wachstum, Selbstverbesserung</p>
                    </div>
                    <div>
                        <strong style="color: #06b6d4;">Freizeit & Hobbys:</strong>
                        <p style="color: #6b7280; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Erholung, Spaß, persönliche Interessen</p>
                    </div>
                    <div>
                        <strong style="color: #84cc16;">Umgebung & Zuhause:</strong>
                        <p style="color: #6b7280; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Wohnung, Arbeitsplatz, Umgebung</p>
                    </div>
                    <div>
                        <strong style="color: #f97316;">Beitrag & Sinn:</strong>
                        <p style="color: #6b7280; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Sinn, Zweck, Beitrag zur Gesellschaft</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateStep6() {
        const results = this.calculateWheelOfLifeResults();
        
        return `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">Schritt 6: Dein Wheel of Life</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Deine Lebensbereiche und Handlungsempfehlungen</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.5rem;">🎯 Dein Lebensrad</h4>
                <p style="margin: 0; font-size: 1.2rem; line-height: 1.6;">Durchschnittliche Zufriedenheit: ${results.average.toFixed(1)}/10</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                ${results.scores.map(score => `
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid ${score.color}; text-align: center;">
                        <h5 style="color: #374151; margin: 0 0 0.5rem 0;">${score.name}</h5>
                        <div style="font-size: 2rem; font-weight: bold; color: ${score.color}; margin-bottom: 0.5rem;">${score.value}/10</div>
                        <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: ${score.color}; height: 100%; width: ${score.value * 10}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                <h4 style="color: #0c4a6e; margin: 0 0 1rem 0;">💡 Deine Handlungsempfehlungen:</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 1.5rem;">
                    ${results.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 2px solid #e5e7eb; margin-top: 1rem;">
                <h4 style="color: #374151; margin: 0 0 1rem 0;">📊 Nächste Schritte:</h4>
                <ol style="color: #6b7280; margin: 0; padding-left: 1.5rem;">
                    <li>Fokussiere dich auf die Bereiche mit der niedrigsten Bewertung</li>
                    <li>Setze dir konkrete Ziele für jeden Lebensbereich</li>
                    <li>Erstelle einen Aktionsplan für die Verbesserung</li>
                    <li>Überprüfe regelmäßig dein Lebensrad</li>
                </ol>
            </div>
        `;
    }
    
    calculateWheelOfLifeResults() {
        const scores = this.lifeAreas.map(area => ({
            ...area,
            value: parseInt(document.getElementById(`${area.key}-slider`)?.value || '5')
        }));
        
        const average = scores.reduce((sum, score) => sum + score.value, 0) / scores.length;
        
        const recommendations = [];
        
        // Finde die Bereiche mit der niedrigsten Bewertung
        const lowestScores = scores
            .sort((a, b) => a.value - b.value)
            .slice(0, 3);
        
        lowestScores.forEach(score => {
            if (score.value < 6) {
                recommendations.push(`Fokussiere dich auf ${score.name} - aktuelle Bewertung: ${score.value}/10`);
            }
        });
        
        if (recommendations.length === 0) {
            recommendations.push('Dein Lebensrad ist gut ausbalanciert! Fokussiere dich auf die Bereiche mit dem größten Verbesserungspotential.');
        }
        
        return {
            scores,
            average,
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
            'Lebensbereiche bewerten',
            'Finanzen & Geld',
            'Gesundheit & Fitness',
            'Beziehungen & Familie',
            'Weitere Lebensbereiche',
            'Dein Wheel of Life'
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
                nextBtn.setAttribute('onclick', 'window.wheelOfLifeSmartWorkflow.finish()');
            } else {
                nextBtn.textContent = 'Weiter →';
                nextBtn.removeAttribute('onclick');
                nextBtn.setAttribute('onclick', 'window.wheelOfLifeSmartWorkflow.nextStep()');
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
        this.lifeAreas.forEach(area => {
            const slider = document.getElementById(`${area.key}-slider`);
            if (slider) {
                this.workflowData[area.key] = parseInt(slider.value);
            }
        });
    }
    
    finish() {
        this.saveCurrentStep();
        
        // Save to localStorage
        localStorage.setItem('wheelOfLifeSmartWorkflow', JSON.stringify(this.workflowData));
        
        // Show success message
        alert('🎉 Dein Wheel of Life wurde gespeichert! Nutze diese Erkenntnisse für deine Lebensplanung.');
        
        // Close workflow
        this.close();
    }
    
    close() {
        const container = document.getElementById('wheel-of-life-smart-workflow');
        if (container) {
            container.remove();
        }
    }
}

// Make globally available
window.WheelOfLifeSmartWorkflow = WheelOfLifeSmartWorkflow;
