/**
 * 📄 Ikigai Export Functions
 * Export-Funktionen für PDF, Word und JSON
 * Autor: Manuel Weiss
 * Version: 1.0
 */

class IkigaiExportFunctions {
    constructor() {
        this.exportData = {};
        this.init();
    }

    init() {
        this.loadExportData();
        console.log('📄 Ikigai Export Functions initialized');
    }

    loadExportData() {
        // Lade alle Workflow-Daten
        this.exportData = {
            workflow: {},
            analysis: {},
            diagram: {},
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        // PRÜFE ZUERST: Neues Format (ikigaiSmartWorkflow)
        const smartWorkflowData = localStorage.getItem('ikigaiSmartWorkflow');
        if (smartWorkflowData) {
            try {
                const workflowData = JSON.parse(smartWorkflowData);
                
                // Konvertiere neues Format in altes Format für Kompatibilität
                this.exportData.workflow = {
                    step1: {
                        step: 1,
                        timestamp: new Date().toISOString(),
                        selfReflection: workflowData.selfReflection || ''
                    },
                    step2: {
                        step: 2,
                        timestamp: new Date().toISOString(),
                        passion: workflowData.passion || ''
                    },
                    step3: {
                        step: 3,
                        timestamp: new Date().toISOString(),
                        mission: workflowData.mission || ''
                    },
                    step4: {
                        step: 4,
                        timestamp: new Date().toISOString(),
                        profession: workflowData.profession || ''
                    },
                    step5: {
                        step: 5,
                        timestamp: new Date().toISOString(),
                        vocation: workflowData.vocation || ''
                    },
                    step6: {
                        step: 6,
                        timestamp: new Date().toISOString(),
                        synthesis: workflowData.synthesis || '',
                        synthesisPassionMission: workflowData.synthesisPassionMission || '',
                        synthesisMissionProfession: workflowData.synthesisMissionProfession || '',
                        synthesisProfessionVocation: workflowData.synthesisProfessionVocation || '',
                        synthesisVocationPassion: workflowData.synthesisVocationPassion || ''
                    },
                    step7: {
                        step: 7,
                        timestamp: new Date().toISOString(),
                        actionPlan: workflowData.actionPlan || ''
                    }
                };
                
                // Erstelle Analyse-Daten
                this.exportData.analysis = {
                    timestamp: new Date().toISOString(),
                    ikigai: {
                        passion: workflowData.passion || '',
                        mission: workflowData.mission || '',
                        profession: workflowData.profession || '',
                        vocation: workflowData.vocation || '',
                        synthesis: workflowData.synthesis || '',
                        actionPlan: workflowData.actionPlan || ''
                    }
                };
                
                console.log('✅ Daten aus neuem Format geladen');
                return;
            } catch (error) {
                console.warn('⚠️ Fehler beim Laden des neuen Formats:', error);
            }
        }

        // FALLBACK: Altes Format (ikigaiStep1, ikigaiStep2, etc.)
        for (let i = 1; i <= 7; i++) {
            const stepData = localStorage.getItem(`ikigaiStep${i}`);
            if (stepData) {
                try {
                this.exportData.workflow[`step${i}`] = JSON.parse(stepData);
                } catch (error) {
                    console.warn(`⚠️ Fehler beim Parsen von Step ${i}:`, error);
                }
            }
        }

        // Lade Analyse-Daten
        const analysisData = localStorage.getItem('ikigaiFinalAnalysis');
        if (analysisData) {
            try {
            this.exportData.analysis = JSON.parse(analysisData);
            } catch (error) {
                console.warn('⚠️ Fehler beim Laden der Analyse-Daten:', error);
            }
        }

        // Lade Diagramm-Daten
        const areas = ['passion', 'mission', 'profession', 'vocation'];
        this.exportData.diagram = {};
        areas.forEach(area => {
            const items = localStorage.getItem(`ikigai-${area}-items`);
            if (items) {
                try {
                this.exportData.diagram[area] = JSON.parse(items);
                } catch (error) {
                    console.warn(`⚠️ Fehler beim Laden von ${area}-Daten:`, error);
                }
            }
        });
    }

    // JSON Export
    exportToJSON() {
        const data = {
            ...this.exportData,
            exportType: 'json',
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        this.downloadFile(blob, `ikigai-workflow-${this.getDateString()}.json`);
    }

    // PDF Export
    exportToPDF() {
        const pdfContent = this.generatePDFContent();
        const blob = new Blob([pdfContent], { type: 'text/html' });
        
        // Öffne in neuem Fenster für PDF-Druck
        const newWindow = window.open('', '_blank');
        newWindow.document.write(pdfContent);
        newWindow.document.close();
        
        // Warte kurz und dann drucke
        setTimeout(() => {
            newWindow.print();
        }, 1000);
    }

    generatePDFContent() {
        const data = this.exportData;
        const date = new Date().toLocaleDateString('de-DE');
        
        return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ikigai Workflow - ${date}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #667eea;
            font-size: 2.5rem;
            margin: 0;
        }
        .header p {
            color: #666;
            font-size: 1.1rem;
            margin: 10px 0 0 0;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .step-content {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .step-content h3 {
            color: #333;
            margin-top: 0;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            font-weight: 600;
            color: #555;
            display: block;
            margin-bottom: 5px;
        }
        .form-group .value {
            background: white;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
            min-height: 50px;
        }
        .ikigai-summary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
        }
        .ikigai-summary h2 {
            color: white;
            border: none;
            margin-bottom: 20px;
        }
        .ikigai-score {
            font-size: 3rem;
            font-weight: bold;
            margin: 20px 0;
        }
        .recommendations {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .recommendations h3 {
            color: #667eea;
            margin-top: 0;
        }
        .recommendation-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border: 1px solid #ddd;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Ikigai Workflow</h1>
        <p>Dein persönlicher Lebenszweck - ${date}</p>
    </div>

    ${this.generateStepContent()}
    
    ${this.generateIkigaiSummary()}
    
    ${this.generateRecommendations()}
    
    <div class="footer">
        <p>Erstellt mit dem Ikigai Workflow von Manuel Weiss</p>
        <p>www.manuel-weiss.com</p>
    </div>
</body>
</html>`;
    }

    generateStepContent() {
        let content = '<div class="section"><h2>📝 Workflow-Schritte</h2>';
        
        const stepTitles = {
            step1: 'Selbstreflexion',
            step2: 'Passion',
            step3: 'Mission', 
            step4: 'Profession',
            step5: 'Vocation',
            step6: 'Synthese',
            step7: 'Aktionsplan'
        };

        // Zeige alle Schritte an, auch wenn leer
        for (let i = 1; i <= 7; i++) {
            const stepKey = `step${i}`;
            const stepData = this.exportData.workflow[stepKey] || {};
            
                content += `
                    <div class="step-content">
                    <h3>Schritt ${i}: ${stepTitles[stepKey]}</h3>
                    ${this.formatStepData(stepData, stepKey)}
                    </div>
                `;
            }
        
        content += '</div>';
        return content;
    }

    formatStepData(stepData, stepKey) {
        let content = '';
        
        // Definiere erwartete Felder für jeden Schritt
        const expectedFields = {
            step1: ['selfReflection'],
            step2: ['passion'],
            step3: ['mission'],
            step4: ['profession'],
            step5: ['vocation'],
            step6: ['synthesis', 'synthesisPassionMission', 'synthesisMissionProfession', 'synthesisProfessionVocation', 'synthesisVocationPassion'],
            step7: ['actionPlan']
        };
        
        const fields = expectedFields[stepKey] || Object.keys(stepData).filter(key => 
            key !== 'step' && key !== 'timestamp'
        );
        
        fields.forEach(field => {
            const value = stepData[field] || '';
            const hasData = value && value.trim();
            const label = this.getFieldLabel(field);
            
            // Mehr Zeilen wenn leer, weniger wenn ausgefüllt
            const lines = hasData ? Math.max(3, Math.ceil(value.length / 80)) : 8;
            
            content += `
                <div class="form-group">
                    <label>${label}</label>
                    <div class="value" style="min-height: ${lines * 20}px; ${hasData ? '' : 'color: #999; font-style: italic;'}">
                        ${hasData ? this.escapeHtml(value) : this.generateEmptyLines(lines, this.getPlaceholder(field))}
                    </div>
                </div>
            `;
        });
        
        return content;
    }
    
    /**
     * Generiert leere Zeilen zum manuellen Ausfüllen
     */
    generateEmptyLines(count, placeholder = '') {
        let lines = '';
        for (let i = 0; i < count; i++) {
            if (i === 0 && placeholder) {
                lines += `<div style="border-bottom: 1px dashed #ccc; padding-bottom: 2px; margin-bottom: 8px;">${this.escapeHtml(placeholder)}</div>`;
            } else {
                lines += '<div style="border-bottom: 1px dashed #ccc; padding-bottom: 2px; margin-bottom: 8px; min-height: 18px;">&nbsp;</div>';
            }
        }
        return lines;
    }
    
    /**
     * Gibt Platzhalter-Text für Felder zurück
     */
    getPlaceholder(field) {
        const placeholders = {
            selfReflection: 'Reflektiere über dein Leben: Was macht dich glücklich? Was belastet dich?',
            passion: 'Beschreibe deine Leidenschaften: Welche Aktivitäten machen dir Spaß?',
            mission: 'Überlege, wie du der Welt helfen kannst: Welche Probleme siehst du?',
            profession: 'Überlege deine beruflichen Möglichkeiten: Welche Fähigkeiten hast du?',
            vocation: 'Beschreibe deine Talente: Was kannst du gut? Was kommt dir natürlich?',
            synthesis: 'Deine persönliche Ikigai-Synthese - die Schnittmenge aller vier Bereiche',
            synthesisPassionMission: 'Wie verbinden sich deine Leidenschaften mit dem, was die Welt braucht?',
            synthesisMissionProfession: 'Wie verbindet sich deine Mission mit deinen beruflichen Möglichkeiten?',
            synthesisProfessionVocation: 'Wie verbinden sich deine beruflichen Möglichkeiten mit deinen Talenten?',
            synthesisVocationPassion: 'Wie verbinden sich deine Talente mit deinen Leidenschaften?',
            actionPlan: 'Erstelle einen konkreten Aktionsplan: Was sind deine nächsten Schritte?'
        };
        return placeholders[field] || 'Hier ausfüllen...';
    }
    
    /**
     * Escaped HTML für sichere Ausgabe
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getFieldLabel(field) {
        const labels = {
            // Alte Feldnamen
            values: 'Lebenswerte',
            strengths: 'Stärken & Talente',
            passions: 'Leidenschaften',
            experiences: 'Lebenserfahrungen',
            goals: 'Ziele & Träume',
            fears: 'Ängste & Hindernisse',
            activities: 'Aktivitäten',
            interests: 'Interessen',
            energy: 'Energiequellen',
            problems: 'Probleme',
            impact: 'Wirkung',
            contribution: 'Beitrag',
            legacy: 'Vermächtnis',
            skills: 'Fähigkeiten',
            market: 'Markt',
            opportunities: 'Chancen',
            income: 'Einkommen',
            talents: 'Talente',
            abilities: 'Fähigkeiten',
            expertise: 'Expertise',
            synthesis: 'Synthese',
            shortTerm: 'Kurzfristige Ziele',
            mediumTerm: 'Mittelfristige Ziele',
            longTerm: 'Langfristige Ziele',
            resources: 'Ressourcen',
            obstacles: 'Hindernisse',
            support: 'Unterstützung',
            // Neue Feldnamen (ikigai-smart-workflow.js)
            selfReflection: 'Selbstreflexion',
            passion: 'Passion - Was du liebst',
            mission: 'Mission - Was die Welt braucht',
            profession: 'Profession - Womit du Geld verdienen kannst',
            vocation: 'Vocation - Was du gut kannst',
            actionPlan: 'Aktionsplan',
            synthesisPassionMission: 'Schnittmenge: Passion & Mission',
            synthesisMissionProfession: 'Schnittmenge: Mission & Profession',
            synthesisProfessionVocation: 'Schnittmenge: Profession & Vocation',
            synthesisVocationPassion: 'Schnittmenge: Vocation & Passion'
        };
        
        return labels[field] || field;
    }

    generateIkigaiSummary() {
        const analysis = this.exportData.analysis;
        if (!analysis || !analysis.ikigai) {
            return '<div class="section"><h2>🎯 Ikigai-Zusammenfassung</h2><p>Noch keine Analyse verfügbar. Bitte schließe den Workflow ab.</p></div>';
        }

        const ikigai = analysis.ikigai;
        return `
            <div class="ikigai-summary">
                <h2>🎯 Dein Ikigai</h2>
                <div class="ikigai-score">${this.calculateIkigaiScore()}%</div>
                <p>Der Schnittpunkt deiner Leidenschaften, Mission, Profession und Vocation</p>
                
                ${ikigai.synthesis ? `
                    <div style="margin-top: 20px; text-align: left;">
                        <h3>Deine Ikigai-Synthese:</h3>
                        <p>${ikigai.synthesis}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    calculateIkigaiScore() {
        // Einfache Berechnung basierend auf verfügbaren Daten
        const steps = Object.keys(this.exportData.workflow).length;
        return Math.round((steps / 7) * 100);
    }

    generateRecommendations() {
        const recommendations = this.getPersonalizedRecommendations();
        
        if (!recommendations || recommendations.length === 0) {
            return '';
        }

        let content = '<div class="section"><h2>💡 Empfehlungen</h2><div class="recommendations">';
        
        recommendations.forEach(rec => {
            content += `
                <div class="recommendation-item">
                    <h3>${rec.title}</h3>
                    <p>${rec.description}</p>
                    <p><strong>Nächste Schritte:</strong> ${rec.action}</p>
                </div>
            `;
        });
        
        content += '</div></div>';
        return content;
    }

    getPersonalizedRecommendations() {
        // Vereinfachte Empfehlungen basierend auf den Daten
        const recommendations = [];
        
        const steps = Object.keys(this.exportData.workflow).length;
        
        if (steps < 3) {
            recommendations.push({
                title: 'Workflow fortsetzen',
                description: 'Du hast erst wenige Schritte abgeschlossen. Setze den Workflow fort, um dein Ikigai zu entdecken.',
                action: 'Gehe zurück zum Workflow und arbeite die verbleibenden Schritte ab.'
            });
        }
        
        if (steps >= 4) {
            recommendations.push({
                title: 'Verbindungen vertiefen',
                description: 'Du hast bereits gute Fortschritte gemacht. Vertiefe die Verbindungen zwischen den Bereichen.',
                action: 'Überlege, wie deine Leidenschaften mit deinen Fähigkeiten und der Welt zusammenhängen.'
            });
        }
        
        return recommendations;
    }

    // Word Export (HTML-Format für Word)
    exportToWord() {
        const wordContent = this.generateWordContent();
        const blob = new Blob([wordContent], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        this.downloadFile(blob, `ikigai-workflow-${this.getDateString()}.docx`);
    }

    generateWordContent() {
        const data = this.exportData;
        const date = new Date().toLocaleDateString('de-DE');
        
        return `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:rPr>
                    <w:b/>
                    <w:sz w:val="32"/>
                </w:rPr>
                <w:t>🎯 Ikigai Workflow - ${date}</w:t>
            </w:r>
        </w:p>
        
        <w:p>
            <w:r>
                <w:t>Dein persönlicher Lebenszweck</w:t>
            </w:r>
        </w:p>
        
        ${this.generateWordStepContent()}
        
        <w:p>
            <w:r>
                <w:t>Erstellt mit dem Ikigai Workflow von Manuel Weiss</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>`;
    }

    generateWordStepContent() {
        let content = '';
        
        Object.entries(this.exportData.workflow).forEach(([stepKey, stepData]) => {
            if (stepData) {
                content += `
                    <w:p>
                        <w:r>
                            <w:rPr>
                                <w:b/>
                            </w:rPr>
                            <w:t>Schritt ${stepKey.replace('step', '')}: ${this.getStepTitle(stepKey)}</w:t>
                        </w:r>
                    </w:p>
                    ${this.formatWordStepData(stepData)}
                `;
            }
        });
        
        return content;
    }

    getStepTitle(stepKey) {
        const titles = {
            step1: 'Selbstreflexion',
            step2: 'Passion',
            step3: 'Mission',
            step4: 'Profession',
            step5: 'Vocation',
            step6: 'Synthese',
            step7: 'Aktionsplan'
        };
        return titles[stepKey] || stepKey;
    }

    formatWordStepData(stepData) {
        let content = '';
        const fields = Object.keys(stepData).filter(key => 
            key !== 'step' && key !== 'timestamp' && stepData[key]
        );
        
        fields.forEach(field => {
            const label = this.getFieldLabel(field);
            content += `
                <w:p>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                        </w:rPr>
                        <w:t>${label}:</w:t>
                    </w:r>
                </w:p>
                <w:p>
                    <w:r>
                        <w:t>${stepData[field]}</w:t>
                    </w:r>
                </w:p>
            `;
        });
        
        return content;
    }

    // Hilfsmethoden
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    // Öffentliche Methoden
    exportAll() {
        return {
            json: () => this.exportToJSON(),
            pdf: () => this.exportToPDF(),
            word: () => this.exportToWord()
        };
    }

    getExportData() {
        return this.exportData;
    }

    updateExportData() {
        this.loadExportData();
    }
}

// Globale Funktionen für HTML-Integration
function exportIkigaiToJSON() {
    if (!window.ikigaiExportFunctions) {
        window.ikigaiExportFunctions = new IkigaiExportFunctions();
    }
    window.ikigaiExportFunctions.exportToJSON();
}

function exportIkigaiToPDF() {
    if (!window.ikigaiExportFunctions) {
        window.ikigaiExportFunctions = new IkigaiExportFunctions();
    }
    window.ikigaiExportFunctions.exportToPDF();
}

function exportIkigaiToWord() {
    if (!window.ikigaiExportFunctions) {
        window.ikigaiExportFunctions = new IkigaiExportFunctions();
    }
    window.ikigaiExportFunctions.exportToWord();
}

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IkigaiExportFunctions;
}
