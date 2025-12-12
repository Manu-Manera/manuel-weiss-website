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
                await this.loadLibraries();
                await this.waitForLibrary('XLSX', 5000);
            }
        } catch (error) {
            console.error('Error loading libraries:', error);
            alert('Fehler beim Laden der Export-Bibliotheken. Bitte Seite neu laden.');
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
                await this.loadLibraries();
                await this.waitForLibrary('jspdf', 5000);
            }
        } catch (error) {
            console.error('Error loading libraries:', error);
            alert('Fehler beim Laden der Export-Bibliotheken. Bitte Seite neu laden.');
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

