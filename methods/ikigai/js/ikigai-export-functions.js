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

        // Lade Step-Daten
        for (let i = 1; i <= 7; i++) {
            const stepData = localStorage.getItem(`ikigaiStep${i}`);
            if (stepData) {
                this.exportData.workflow[`step${i}`] = JSON.parse(stepData);
            }
        }

        // Lade Analyse-Daten
        const analysisData = localStorage.getItem('ikigaiFinalAnalysis');
        if (analysisData) {
            this.exportData.analysis = JSON.parse(analysisData);
        }

        // Lade Diagramm-Daten
        const areas = ['passion', 'mission', 'profession', 'vocation'];
        this.exportData.diagram = {};
        areas.forEach(area => {
            const items = localStorage.getItem(`ikigai-${area}-items`);
            if (items) {
                this.exportData.diagram[area] = JSON.parse(items);
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

        Object.entries(this.exportData.workflow).forEach(([stepKey, stepData]) => {
            if (stepData) {
                content += `
                    <div class="step-content">
                        <h3>Schritt ${stepKey.replace('step', '')}: ${stepTitles[stepKey]}</h3>
                        ${this.formatStepData(stepData)}
                    </div>
                `;
            }
        });
        
        content += '</div>';
        return content;
    }

    formatStepData(stepData) {
        let content = '';
        const fields = Object.keys(stepData).filter(key => 
            key !== 'step' && key !== 'timestamp' && stepData[key]
        );
        
        fields.forEach(field => {
            const label = this.getFieldLabel(field);
            content += `
                <div class="form-group">
                    <label>${label}</label>
                    <div class="value">${stepData[field]}</div>
                </div>
            `;
        });
        
        return content;
    }

    getFieldLabel(field) {
        const labels = {
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
            support: 'Unterstützung'
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
