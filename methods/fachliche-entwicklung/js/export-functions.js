/**
 * Export Functions für Fachliche Entwicklung
 * PDF, Word, JSON Export
 */

class FachlicheEntwicklungExportFunctions {
    constructor() {
        this.workflowData = null;
    }

    setWorkflowData(data) {
        this.workflowData = data;
    }

    exportToPDF() {
        // Verwende jsPDF für PDF-Generierung
        if (typeof window.jsPDF === 'undefined') {
            console.error('jsPDF nicht geladen');
            alert('PDF-Export benötigt jsPDF. Bitte lade die Bibliothek.');
            return;
        }

        const doc = new jsPDF();
        let yPosition = 20;

        // Titel
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246); // Blau
        doc.text('Fachliche Entwicklung - Entwicklungsplan', 20, yPosition);
        yPosition += 15;

        // Datum
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, yPosition);
        yPosition += 20;

        // Schritt 1: Selbstanalyse
        if (this.workflowData && this.workflowData.selfAnalysis) {
            yPosition = this.addSection(doc, 'Schritt 1: Selbstanalyse & Standortbestimmung', yPosition);
            yPosition = this.addField(doc, 'Technische Kompetenzen', this.workflowData.selfAnalysis.technicalSkills, yPosition);
            yPosition = this.addField(doc, 'Soft Skills', this.workflowData.selfAnalysis.softSkills, yPosition);
            yPosition = this.addField(doc, 'Berufserfahrung', this.workflowData.selfAnalysis.experience, yPosition);
            yPosition += 10;
        }

        // Schritt 2: Skill-Gap-Analyse
        if (this.workflowData && this.workflowData.skillGapAnalysis) {
            yPosition = this.addSection(doc, 'Schritt 2: Skill-Gap-Analyse', yPosition);
            yPosition = this.addField(doc, 'Identifizierte Lücken', this.workflowData.skillGapAnalysis.gaps, yPosition);
            yPosition = this.addField(doc, 'Prioritäten', this.workflowData.skillGapAnalysis.priorities, yPosition);
            yPosition += 10;
        }

        // Weitere Schritte...
        // (Vereinfacht dargestellt - in Produktion alle Schritte)

        // Speichere PDF
        doc.save(`fachliche-entwicklung-${new Date().toISOString().split('T')[0]}.pdf`);
    }

    addSection(doc, title, yPosition) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text(title, 20, yPosition);
        return yPosition + 10;
    }

    addField(doc, label, value, yPosition) {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFontStyle('bold');
        doc.text(label + ':', 20, yPosition);
        yPosition += 7;

        doc.setFontStyle('normal');
        doc.setTextColor(60, 60, 60);
        
        if (value) {
            const lines = doc.splitTextToSize(value, 170);
            doc.text(lines, 20, yPosition);
            yPosition += lines.length * 7;
        } else {
            doc.text('___________________________', 20, yPosition);
            yPosition += 7;
        }

        return yPosition + 5;
    }

    exportToWord() {
        // Erstelle Word-Dokument als HTML
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Fachliche Entwicklung - Entwicklungsplan</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    h1 { color: #3B82F6; }
                    h2 { color: #8B5CF6; margin-top: 30px; }
                    .field { margin: 15px 0; }
                    .label { font-weight: bold; color: #1F2937; }
                    .value { margin-top: 5px; color: #4B5563; }
                </style>
            </head>
            <body>
                <h1>Fachliche Entwicklung - Entwicklungsplan</h1>
                <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
        `;

        // Füge alle Schritte hinzu
        if (this.workflowData) {
            if (this.workflowData.selfAnalysis) {
                htmlContent += '<h2>Schritt 1: Selbstanalyse</h2>';
                htmlContent += this.createFieldHTML('Technische Kompetenzen', this.workflowData.selfAnalysis.technicalSkills);
                htmlContent += this.createFieldHTML('Soft Skills', this.workflowData.selfAnalysis.softSkills);
                // ... weitere Felder
            }
        }

        htmlContent += `
            </body>
            </html>
        `;

        // Erstelle Blob und Download
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fachliche-entwicklung-${new Date().toISOString().split('T')[0]}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    }

    createFieldHTML(label, value) {
        return `
            <div class="field">
                <div class="label">${label}:</div>
                <div class="value">${value || '___________________________'}</div>
            </div>
        `;
    }

    exportToJSON() {
        const data = {
            workflow: this.workflowData,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fachliche-entwicklung-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

