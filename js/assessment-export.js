/**
 * Assessment Export Module
 * Provides Excel and PDF export functionality for KI-Readiness Assessments
 */

class AssessmentExporter {
    constructor() {
        this.loadLibraries();
    }

    async loadLibraries() {
        // Load SheetJS for Excel export
        if (!window.XLSX) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('XLSX library failed to load'));
                document.head.appendChild(script);
            });
        }

        // Load jsPDF for PDF export
        if (!window.jspdf) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('jsPDF library failed to load'));
                document.head.appendChild(script);
            });
        }

        // Load Chart.js for diagrams (optional, not blocking)
        if (!window.Chart) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            document.head.appendChild(script);
        }
    }

    /**
     * Export assessment data to Excel
     */
    async exportToExcel(data, filename = 'KI-Readiness-Assessment') {
        try {
            if (!window.XLSX) {
                const script = document.createElement('script');
                script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
                document.head.appendChild(script);
                await this.waitForLibrary('XLSX', 10000);
            }
        } catch (error) {
            console.error('Error loading XLSX library:', error);
            alert('Fehler beim Laden der Excel-Bibliothek. Bitte Seite neu laden.');
            return;
        }

        const workbook = window.XLSX.utils.book_new();
        
        // Create summary sheet
        const summaryData = this.prepareSummaryData(data);
        const summarySheet = window.XLSX.utils.aoa_to_sheet(summaryData);
        // Set column widths
        summarySheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 20 }];
        window.XLSX.utils.book_append_sheet(workbook, summarySheet, 'Zusammenfassung');

        // Create detailed sheets for each dimension
        if (data.dimensions) {
            Object.keys(data.dimensions).forEach(dimension => {
                const dimensionData = this.prepareDimensionData(data.dimensions[dimension], dimension);
                const dimensionSheet = window.XLSX.utils.aoa_to_sheet(dimensionData);
                dimensionSheet['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 20 }];
                window.XLSX.utils.book_append_sheet(workbook, dimensionSheet, this.getDimensionName(dimension).substring(0, 31));
            });
        }

        // Create charts sheet with data for charts
        const chartsData = this.prepareChartsData(data);
        const chartsSheet = window.XLSX.utils.aoa_to_sheet(chartsData);
        chartsSheet['!cols'] = [{ wch: 30 }, { wch: 15 }];
        window.XLSX.utils.book_append_sheet(workbook, chartsSheet, 'Diagramm-Daten');

        // Write file
        window.XLSX.writeFile(workbook, `${filename}.xlsx`);
    }

    /**
     * Export assessment data to PDF with diagrams
     */
    async exportToPDF(data, filename = 'KI-Readiness-Assessment') {
        try {
            if (!window.jspdf) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                document.head.appendChild(script);
                await this.waitForLibrary('jspdf', 10000);
            }
        } catch (error) {
            console.error('Error loading jsPDF library:', error);
            alert('Fehler beim Laden der PDF-Bibliothek. Bitte Seite neu laden.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - (2 * margin);

        // Title page
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('KI-Readiness Assessment', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, margin, yPos);
        
        yPos += 15;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const summaryText = this.getSummaryText(data);
        const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
        doc.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * 6;

        // Add new page for dimensions
        doc.addPage();
        yPos = 20;

        // Dimensions overview
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Dimensionen-Übersicht', margin, yPos);
        yPos += 10;

        if (data.dimensions) {
            Object.keys(data.dimensions).forEach((dimension, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                const dimensionName = this.getDimensionName(dimension);
                const score = data.dimensions[dimension].aggregated || 0;
                
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${dimensionName}:`, margin, yPos);
                
                yPos += 6;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Bewertung: ${score.toFixed(1)}/5.0`, margin + 5, yPos);
                yPos += 8;
            });
        }

        // Add page for detailed criteria
        doc.addPage();
        yPos = 20;

        if (data.dimensions) {
            Object.keys(data.dimensions).forEach(dimension => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                const dimensionData = data.dimensions[dimension];
                const dimensionName = this.getDimensionName(dimension);

                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(dimensionName, margin, yPos);
                yPos += 10;

                if (dimensionData.criteria) {
                    dimensionData.criteria.forEach(criterion => {
                        if (yPos > 250) {
                            doc.addPage();
                            yPos = 20;
                        }

                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'bold');
                        doc.text(criterion.title, margin, yPos);
                        yPos += 6;

                        if (criterion.subCriteria) {
                            criterion.subCriteria.forEach(subCriterion => {
                                if (yPos > 250) {
                                    doc.addPage();
                                    yPos = 20;
                                }

                                doc.setFontSize(9);
                                doc.setFont('helvetica', 'normal');
                                const value = data.details?.[`${criterion.id}_${subCriterion.id}`] || 0;
                                doc.text(`  • ${subCriterion.title}: ${value}/5`, margin + 5, yPos);
                                yPos += 5;
                            });
                        }
                        yPos += 3;
                    });
                }
                yPos += 5;
            });
        }

        // Save PDF
        doc.save(`${filename}.pdf`);
    }

    /**
     * Export assessment to PDF using Lambda pdf-generator-gpt52 (modern, with Glassmorphism)
     */
    async exportToPDFLambda(data, filename = 'Assessment', dimensionName = 'Assessment') {
        try {
            // Generiere modernes HTML für PDF
            const htmlContent = this.generateModernPDFHTML(data, dimensionName);
            
            // Hole Auth Token falls vorhanden
            let authToken = null;
            try {
                if (window.UnifiedAWSAuth && window.UnifiedAWSAuth.getInstance) {
                    const auth = window.UnifiedAWSAuth.getInstance();
                    if (auth && auth.getCurrentUser) {
                        const user = await auth.getCurrentUser();
                        if (user && user.signInUserSession) {
                            authToken = user.signInUserSession.idToken.jwtToken;
                        }
                    }
                }
            } catch (e) {
                console.warn('⚠️ Auth Token konnte nicht geladen werden:', e);
            }
            
            // Rufe PDF-Generator Lambda auf
            const apiUrl = window.getApiUrl('PDF_GENERATOR');
            if (!apiUrl) {
                throw new Error('PDF Generator API URL nicht gefunden. Bitte aws-app-config.js prüfen.');
            }
            
            const headers = {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            };
            
            const body = JSON.stringify({
                html: htmlContent,
                options: {
                    format: 'a4',
                    printBackground: true,
                    preferCSSPageSize: false,
                    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
                    displayHeaderFooter: true,
                    footerTemplate: `
                        <div style="font-size: 10px; text-align: center; width: 100%; padding: 0 20mm;">
                            <span class="pageNumber"></span> / <span class="totalPages"></span>
                        </div>
                    `
                }
            });
            
            // Retry-Mechanismus
            const maxAttempts = 3;
            let lastError = null;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 25000);
                
                try {
                    console.log(`📡 PDF-Export Attempt ${attempt}/${maxAttempts}`);
                    
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers,
                        signal: controller.signal,
                        body
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
                    }
                    
                    // PDF als Base64 erhalten
                    const result = await response.json();
                    const pdfBase64 = result.pdf || result.body || result;
                    
                    // Konvertiere Base64 zu Blob und download
                    const byteCharacters = atob(pdfBase64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${filename}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    console.log('✅ PDF erfolgreich generiert und heruntergeladen');
                    return true;
                    
                } catch (error) {
                    lastError = error;
                    console.warn(`⚠️ PDF-Export Versuch ${attempt}/${maxAttempts} fehlgeschlagen:`, error);
                    if (attempt < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            }
            
            throw lastError || new Error('PDF-Export fehlgeschlagen nach mehreren Versuchen');
            
        } catch (error) {
            console.error('❌ PDF-Export Fehler:', error);
            alert(`Fehler beim PDF-Export: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Generiere modernes HTML für PDF mit Glassmorphism-Effekten
     */
    generateModernPDFHTML(data, dimensionName) {
        const date = new Date().toLocaleDateString('de-DE');
        const overall = data.overall || data.aggregated || 0;
        
        // Generiere Dimensionen-Übersicht
        let dimensionsHTML = '';
        if (data.criteria && Array.isArray(data.criteria)) {
            data.criteria.forEach(criterion => {
                const avg = criterion.average || 0;
                const color = this.getScoreColor(avg);
                dimensionsHTML += `
                    <div class="dimension-card" style="background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(10px); border-radius: 16px; padding: 15mm; margin-bottom: 15mm; border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
                        <h3 style="color: ${color}; margin-bottom: 10mm;">${criterion.title}</h3>
                        <div style="font-size: 24pt; font-weight: bold; color: ${color}; margin-bottom: 5mm;">${avg.toFixed(1)}/5.0</div>
                        <p style="color: #6b7280; margin-bottom: 10mm;">${criterion.description || ''}</p>
                        ${this.generateSubCriteriaHTML(criterion)}
                    </div>
                `;
            });
        }
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20mm;
            width: 210mm;
            margin: 0;
        }
        .pdf-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 30mm;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 30mm;
            padding-bottom: 20mm;
            border-bottom: 3px solid #10b981;
        }
        .header h1 {
            font-size: 32pt;
            color: #1f2937;
            margin-bottom: 10mm;
        }
        .header p {
            font-size: 12pt;
            color: #6b7280;
        }
        .executive-summary {
            background: rgba(240, 253, 244, 0.6);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 20mm;
            margin-bottom: 20mm;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .executive-summary h2 {
            color: #059669;
            margin-bottom: 10mm;
            font-size: 20pt;
        }
        .score-large {
            font-size: 48pt;
            font-weight: bold;
            color: #10b981;
            text-align: center;
            margin: 10mm 0;
        }
        .dimension-card h3 {
            font-size: 18pt;
            margin-bottom: 8mm;
        }
        .sub-criterion-item {
            background: rgba(248, 250, 252, 0.8);
            border-radius: 8px;
            padding: 8mm;
            margin-bottom: 5mm;
            border-left: 4px solid #10b981;
        }
        .sub-criterion-item strong {
            color: #1f2937;
        }
        .sub-criterion-item .score {
            color: #059669;
            font-weight: bold;
            float: right;
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <header class="header">
            <h1>Organisationsentwicklung Assessment</h1>
            <p>${dimensionName}</p>
            <p>Erstellt am: ${date}</p>
        </header>
        
        <section class="executive-summary">
            <h2>Executive Summary</h2>
            <div class="score-large">${overall.toFixed(1)}/5.0</div>
            <p style="text-align: center; color: #6b7280; font-size: 14pt;">Gesamtbewertung</p>
        </section>
        
        <section class="dimensions-overview">
            <h2 style="color: #1f2937; margin-bottom: 20mm; font-size: 24pt;">Detaillierte Bewertung</h2>
            ${dimensionsHTML}
        </section>
    </div>
</body>
</html>
        `;
    }
    
    generateSubCriteriaHTML(criterion) {
        if (!criterion.subCriteria || !Array.isArray(criterion.subCriteria)) {
            return '';
        }
        
        return criterion.subCriteria.map(sub => {
            const score = sub.score || 0;
            return `
                <div class="sub-criterion-item">
                    <strong>${sub.title}</strong>
                    <span class="score">${score}/5</span>
                    ${sub.description ? `<p style="margin-top: 3mm; color: #6b7280;">${sub.description}</p>` : ''}
                </div>
            `;
        }).join('');
    }
    
    getScoreColor(score) {
        if (score <= 1.5) return '#ef4444';
        if (score <= 2.5) return '#f59e0b';
        if (score <= 3.5) return '#3b82f6';
        if (score <= 4.5) return '#10b981';
        return '#059669';
    }

    /**
     * Create a chart canvas for PDF embedding
     */
    async createChartCanvas(data, type = 'radar') {
        if (!window.Chart) {
            await this.waitForLibrary('Chart', 5000);
        }

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        const chartData = this.prepareChartData(data);

        new Chart(ctx, {
            type: type,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: type === 'bar' ? {
                    y: {
                        beginAtZero: true,
                        max: 5
                    }
                } : undefined
            }
        });

        return canvas;
    }

    prepareSummaryData(data) {
        const summary = [
            ['KI-Readiness Assessment - Zusammenfassung'],
            [''],
            ['Erstellt am:', new Date().toLocaleDateString('de-DE')],
            ['Uhrzeit:', new Date().toLocaleTimeString('de-DE')],
            [''],
            ['Dimension', 'Bewertung', 'Status'],
        ];

        if (data.dimensions) {
            Object.keys(data.dimensions).forEach(dimension => {
                const score = data.dimensions[dimension].aggregated || 0;
                const status = this.getStatusLabel(score);
                summary.push([
                    this.getDimensionName(dimension),
                    parseFloat(score.toFixed(1)),
                    status
                ]);
            });
        }

        summary.push(['']);
        summary.push(['Gesamtbewertung:', parseFloat((data.overall || 0).toFixed(1))]);
        summary.push(['Gesamtstatus:', this.getStatusLabel(data.overall || 0)]);
        summary.push(['']);
        summary.push(['Hinweis:', 'Bewertungen basieren auf einer Skala von 1-5']);
        summary.push(['1 = Anfänger, 2 = Aufsteiger, 3 = Fortgeschritten, 4 = Experte, 5 = Exzellent']);

        return summary;
    }

    prepareDimensionData(dimensionData, dimensionId) {
        const data = [
            [this.getDimensionName(dimensionId)],
            [''],
            ['Hauptkriterium', 'Bewertung', 'Status'],
        ];

        if (dimensionData.criterionAverages) {
            dimensionData.criterionAverages.forEach(criterion => {
                data.push([
                    criterion.criterionTitle || this.getCriterionName(criterion.criterionId),
                    parseFloat(criterion.average.toFixed(1)),
                    this.getStatusLabel(criterion.average)
                ]);
            });
        }

        data.push(['']);
        data.push(['Gesamtbewertung:', parseFloat((dimensionData.aggregated || 0).toFixed(1))]);
        data.push(['Status:', this.getStatusLabel(dimensionData.aggregated || 0)]);

        return data;
    }

    prepareChartsData(data) {
        const chartData = [
            ['Dimension', 'Bewertung'],
        ];

        if (data.dimensions) {
            Object.keys(data.dimensions).forEach(dimension => {
                chartData.push([
                    this.getDimensionName(dimension),
                    data.dimensions[dimension].aggregated || 0
                ]);
            });
        }

        return chartData;
    }

    prepareChartData(data) {
        const labels = [];
        const values = [];

        if (data.dimensions) {
            Object.keys(data.dimensions).forEach(dimension => {
                labels.push(this.getDimensionName(dimension));
                values.push(data.dimensions[dimension].aggregated || 0);
            });
        }

        return {
            labels: labels,
            datasets: [{
                label: 'KI-Readiness Bewertung',
                data: values,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        };
    }

    getSummaryText(data) {
        const overall = data.overall || 0;
        const status = this.getStatusLabel(overall);
        return `Gesamtbewertung: ${overall.toFixed(1)}/5.0\nStatus: ${status}\n\nDiese Bewertung basiert auf einer detaillierten Analyse aller KI-Readiness Dimensionen.`;
    }

    getStatusLabel(score) {
        if (score <= 1.5) return 'Anfänger';
        if (score <= 2.5) return 'Aufsteiger';
        if (score <= 3.5) return 'Fortgeschritten';
        if (score <= 4.5) return 'Experte';
        return 'Exzellent';
    }

    getDimensionName(dimensionId) {
        const names = {
            'dataQuality': 'Datenqualität & -verfügbarkeit',
            'techInfra': 'Technische Infrastruktur',
            'orgReadiness': 'Organisatorische Bereitschaft',
            'skills': 'Kompetenz & Skills',
            'governance': 'Governance & Compliance',
            'innovation': 'Innovation & Experimentierfreude'
        };
        return names[dimensionId] || dimensionId;
    }

    getCriterionName(criterionId) {
        // This would need to be populated from the actual criteria data
        return criterionId;
    }

    async waitForLibrary(libraryName, timeout) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                if (window[libraryName]) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`Library ${libraryName} failed to load`));
                }
            }, 100);
        });
    }
}

// Export for use in other files
window.AssessmentExporter = AssessmentExporter;

