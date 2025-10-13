/**
 * Workflow Export System
 * PDF und Excel Export für Workflow-Zusammenfassungen
 */

class WorkflowExportSystem {
    constructor() {
        this.exportFormats = {
            pdf: 'PDF',
            excel: 'Excel',
            word: 'Word'
        };
    }

    // PDF Export
    async exportToPDF(workflowData, workflowType) {
        console.log('📄 Exporting to PDF:', workflowType);
        
        try {
            const pdfContent = this.generatePDFContent(workflowData, workflowType);
            const blob = new Blob([pdfContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workflowType}_Zusammenfassung_${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ PDF Export erfolgreich');
            return true;
        } catch (error) {
            console.error('❌ PDF Export fehlgeschlagen:', error);
            return false;
        }
    }

    // Excel Export
    async exportToExcel(workflowData, workflowType) {
        console.log('📊 Exporting to Excel:', workflowType);
        
        try {
            const csvContent = this.generateCSVContent(workflowData, workflowType);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workflowType}_Zusammenfassung_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Excel Export erfolgreich');
            return true;
        } catch (error) {
            console.error('❌ Excel Export fehlgeschlagen:', error);
            return false;
        }
    }

    // Word Export
    async exportToWord(workflowData, workflowType) {
        console.log('📝 Exporting to Word:', workflowType);
        
        try {
            const wordContent = this.generateWordContent(workflowData, workflowType);
            const blob = new Blob([wordContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workflowType}_Zusammenfassung_${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Word Export erfolgreich');
            return true;
        } catch (error) {
            console.error('❌ Word Export fehlgeschlagen:', error);
            return false;
        }
    }

    // PDF Content Generation
    generatePDFContent(workflowData, workflowType) {
        const currentDate = new Date().toLocaleDateString('de-DE');
        const currentTime = new Date().toLocaleTimeString('de-DE');
        
        return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${workflowType} - Zusammenfassung</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: white;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #6366f1; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .header h1 { 
            color: #6366f1; 
            font-size: 2.5rem; 
            margin: 0; 
            font-weight: 800;
        }
        .header p { 
            color: #666; 
            font-size: 1.1rem; 
            margin: 10px 0 0;
        }
        .section { 
            margin-bottom: 30px; 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #6366f1;
        }
        .section h2 { 
            color: #1f2937; 
            font-size: 1.5rem; 
            margin: 0 0 15px; 
            font-weight: 700;
        }
        .section h3 { 
            color: #374151; 
            font-size: 1.2rem; 
            margin: 15px 0 10px; 
            font-weight: 600;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin: 15px 0;
        }
        .info-item { 
            background: white; 
            padding: 15px; 
            border-radius: 6px; 
            border: 1px solid #e5e7eb;
        }
        .info-item strong { 
            color: #1f2937; 
            display: block; 
            margin-bottom: 5px;
        }
        .info-item span { 
            color: #6b7280;
        }
        .checkbox-list { 
            list-style: none; 
            padding: 0; 
            margin: 10px 0;
        }
        .checkbox-list li { 
            padding: 8px 0; 
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
        }
        .checkbox-list li:before { 
            content: "✓"; 
            color: #10b981; 
            font-weight: bold; 
            margin-right: 10px;
        }
        .text-content { 
            background: white; 
            padding: 15px; 
            border-radius: 6px; 
            border: 1px solid #e5e7eb; 
            white-space: pre-wrap;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            color: #6b7280; 
            font-size: 0.9rem;
        }
        .next-steps { 
            background: #fef3c7; 
            border: 2px solid #f59e0b; 
            border-radius: 8px; 
            padding: 20px; 
            margin-top: 30px;
        }
        .next-steps h3 { 
            color: #d97706; 
            margin: 0 0 15px;
        }
        .next-steps ul { 
            margin: 0; 
            padding-left: 20px;
        }
        .next-steps li { 
            margin: 8px 0;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${workflowType}</h1>
        <p>Strategische Zusammenfassung - Generiert am ${currentDate} um ${currentTime}</p>
    </div>

    ${this.generateWorkflowSections(workflowData, workflowType)}

    <div class="footer">
        <p>Erstellt mit Manuel Weiss HR Beratung | ${currentDate}</p>
    </div>
</body>
</html>
        `;
    }

    // CSV Content Generation
    generateCSVContent(workflowData, workflowType) {
        const currentDate = new Date().toLocaleDateString('de-DE');
        let csv = `"${workflowType} - Zusammenfassung","Generiert am ${currentDate}"\n\n`;
        
        // Basic Info
        csv += `"Unternehmensinformationen",""\n`;
        csv += `"Unternehmen","${workflowData.company || '-'}"\n`;
        csv += `"Branche","${workflowData.industry || '-'}"\n`;
        csv += `"Mitarbeiteranzahl","${workflowData.employeeCount || '-'}"\n\n`;
        
        // Goals
        if (workflowData.goals && workflowData.goals.length > 0) {
            csv += `"Ziele",""\n`;
            workflowData.goals.forEach(goal => {
                csv += `"${goal}",""\n`;
            });
            csv += `\n`;
        }
        
        // Areas
        if (workflowData.areas && workflowData.areas.length > 0) {
            csv += `"Prioritäre Bereiche",""\n`;
            workflowData.areas.forEach(area => {
                csv += `"${area}",""\n`;
            });
            csv += `\n`;
        }
        
        // Value KPIs
        csv += `"Erwartete Werthebel",""\n`;
        csv += `"Zeitersparnis","${workflowData.timeSavings || 0} Stunden/Woche"\n`;
        csv += `"Produktivitätssteigerung","${workflowData.productivityGain || 0}%"\n`;
        csv += `"Mitarbeiterzufriedenheit","${workflowData.employeeSatisfaction || 0}/10"\n`;
        csv += `"Kollaborationseffizienz","${workflowData.collaborationEfficiency || 0}%"\n\n`;
        
        // Next Steps
        csv += `"Nächste Schritte",""\n`;
        csv += `"1.","${workflowType} CoE einrichten"\n`;
        csv += `"2.","Pilotprojekte in priorisierten Bereichen starten"\n`;
        csv += `"3.","KI-Tools und Technologien evaluieren"\n`;
        csv += `"4.","Mitarbeiter in AI Literacy schulen"\n`;
        csv += `"5.","Transparenz und Vertrauen aufbauen"\n`;
        csv += `"6.","KPI-System implementieren und monitoren"\n`;
        
        return csv;
    }

    // Word Content Generation
    generateWordContent(workflowData, workflowType) {
        const currentDate = new Date().toLocaleDateString('de-DE');
        
        return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>${workflowType} - Zusammenfassung</title>
    <style>
        body { font-family: 'Calibri', sans-serif; line-height: 1.6; color: #333; }
        h1 { color: #2c3e50; font-size: 24px; }
        h2 { color: #34495e; font-size: 18px; }
        h3 { color: #7f8c8d; font-size: 16px; }
        .section { margin-bottom: 20px; }
        .info-item { margin: 10px 0; }
        .next-steps { background: #ecf0f1; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>${workflowType} - Strategische Zusammenfassung</h1>
    <p><strong>Generiert am:</strong> ${currentDate}</p>
    
    ${this.generateWorkflowSections(workflowData, workflowType)}
    
    <div class="next-steps">
        <h2>Nächste Schritte</h2>
        <ul>
            <li>${workflowType} CoE einrichten</li>
            <li>Pilotprojekte in priorisierten Bereichen starten</li>
            <li>KI-Tools und Technologien evaluieren</li>
            <li>Mitarbeiter in AI Literacy schulen</li>
            <li>Transparenz und Vertrauen aufbauen</li>
            <li>KPI-System implementieren und monitoren</li>
        </ul>
    </div>
</body>
</html>
        `;
    }

    // Generate Workflow Sections
    generateWorkflowSections(workflowData, workflowType) {
        let sections = '';
        
        // Basic Info Section
        sections += `
        <div class="section">
            <h2>📋 Unternehmensinformationen</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Unternehmen</strong>
                    <span>${workflowData.company || '-'}</span>
                </div>
                <div class="info-item">
                    <strong>Branche</strong>
                    <span>${workflowData.industry || '-'}</span>
                </div>
                <div class="info-item">
                    <strong>Mitarbeiteranzahl</strong>
                    <span>${workflowData.employeeCount || '-'}</span>
                </div>
                <div class="info-item">
                    <strong>Workflow-Typ</strong>
                    <span>${workflowType}</span>
                </div>
            </div>
        </div>
        `;
        
        // Goals Section
        if (workflowData.goals && workflowData.goals.length > 0) {
            sections += `
            <div class="section">
                <h2>🎯 Ziele</h2>
                <ul class="checkbox-list">
                    ${workflowData.goals.map(goal => `<li>${goal}</li>`).join('')}
                </ul>
            </div>
            `;
        }
        
        // Areas Section
        if (workflowData.areas && workflowData.areas.length > 0) {
            sections += `
            <div class="section">
                <h2>📊 Prioritäre Bereiche</h2>
                <ul class="checkbox-list">
                    ${workflowData.areas.map(area => `<li>${area}</li>`).join('')}
                </ul>
            </div>
            `;
        }
        
        // Value Section
        sections += `
        <div class="section">
            <h2>💰 Erwartete Werthebel</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Zeitersparnis</strong>
                    <span>${workflowData.timeSavings || 0} Stunden/Woche</span>
                </div>
                <div class="info-item">
                    <strong>Produktivitätssteigerung</strong>
                    <span>${workflowData.productivityGain || 0}%</span>
                </div>
                <div class="info-item">
                    <strong>Mitarbeiterzufriedenheit</strong>
                    <span>${workflowData.employeeSatisfaction || 0}/10</span>
                </div>
                <div class="info-item">
                    <strong>Kollaborationseffizienz</strong>
                    <span>${workflowData.collaborationEfficiency || 0}%</span>
                </div>
            </div>
        </div>
        `;
        
        // Next Steps Section
        sections += `
        <div class="next-steps">
            <h3>🚀 Nächste Schritte</h3>
            <ul>
                <li>${workflowType} CoE einrichten</li>
                <li>Pilotprojekte in priorisierten Bereichen starten</li>
                <li>KI-Tools und Technologien evaluieren</li>
                <li>Mitarbeiter in AI Literacy schulen</li>
                <li>Transparenz und Vertrauen aufbauen</li>
                <li>KPI-System implementieren und monitoren</li>
            </ul>
        </div>
        `;
        
        return sections;
    }
}

// Global Export Functions
window.exportWorkflowToPDF = async function(workflowData, workflowType) {
    const exporter = new WorkflowExportSystem();
    return await exporter.exportToPDF(workflowData, workflowType);
};

window.exportWorkflowToExcel = async function(workflowData, workflowType) {
    const exporter = new WorkflowExportSystem();
    return await exporter.exportToExcel(workflowData, workflowType);
};

window.exportWorkflowToWord = async function(workflowData, workflowType) {
    const exporter = new WorkflowExportSystem();
    return await exporter.exportToWord(workflowData, workflowType);
};
