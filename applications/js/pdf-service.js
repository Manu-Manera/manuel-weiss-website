/**
 * Unified PDF Service
 * Zentrale Klasse für alle PDF-Operationen
 * 
 * Verwendet:
 * - jsPDF für Erstellung (Vektor-Text)
 * - pdf-lib für Manipulation (Merge, Split, etc.)
 * - PDF.js für Anzeige
 */

class UnifiedPDFService {
    constructor() {
        this.fonts = {};
        this.defaultOptions = {
            format: 'a4',
            orientation: 'portrait',
            unit: 'mm',
            margin: 20,
            fontSize: 11,
            lineHeight: 1.5,
            fontFamily: 'helvetica'
        };
        this.pageFormats = {
            a4: { width: 210, height: 297 },
            a3: { width: 297, height: 420 },
            a5: { width: 148, height: 210 },
            letter: { width: 215.9, height: 279.4 },
            legal: { width: 215.9, height: 355.6 }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LIBRARY LOADING
    // ═══════════════════════════════════════════════════════════════════════════

    async loadJsPDF() {
        if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
        if (window.jsPDF) return window.jsPDF;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                console.log('✅ jsPDF geladen');
                resolve(window.jspdf?.jsPDF || window.jsPDF);
            };
            script.onerror = () => reject(new Error('jsPDF konnte nicht geladen werden'));
            document.head.appendChild(script);
        });
    }

    async loadPDFLib() {
        if (window.PDFLib) return window.PDFLib;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
            script.onload = () => {
                console.log('✅ pdf-lib geladen');
                resolve(window.PDFLib);
            };
            script.onerror = () => reject(new Error('pdf-lib konnte nicht geladen werden'));
            document.head.appendChild(script);
        });
    }

    async loadHtml2Pdf() {
        if (window.html2pdf) return window.html2pdf;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => {
                console.log('✅ html2pdf geladen');
                resolve(window.html2pdf);
            };
            script.onerror = () => reject(new Error('html2pdf konnte nicht geladen werden'));
            document.head.appendChild(script);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DOCUMENT CREATION (jsPDF - Vektor)
    // ═══════════════════════════════════════════════════════════════════════════

    async createDocument(options = {}) {
        const jsPDF = await this.loadJsPDF();
        const opts = { ...this.defaultOptions, ...options };
        
        const doc = new jsPDF({
            orientation: opts.orientation,
            unit: opts.unit,
            format: opts.format,
            compress: true
        });

        // Metadaten setzen
        if (opts.title) doc.setProperties({ title: opts.title });
        if (opts.author) doc.setProperties({ author: opts.author });
        if (opts.subject) doc.setProperties({ subject: opts.subject });
        if (opts.keywords) doc.setProperties({ keywords: opts.keywords });
        
        doc.setCreationDate(new Date());
        
        return doc;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TEXT RENDERING
    // ═══════════════════════════════════════════════════════════════════════════

    renderText(doc, text, x, y, options = {}) {
        const {
            fontSize = 11,
            fontStyle = 'normal',
            color = '#000000',
            maxWidth = null,
            align = 'left',
            lineHeight = 1.5
        } = options;

        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        
        // Farbe setzen
        const rgb = this.hexToRgb(color);
        doc.setTextColor(rgb.r, rgb.g, rgb.b);
        
        if (maxWidth) {
            const lines = doc.splitTextToSize(text, maxWidth);
            let currentY = y;
            lines.forEach(line => {
                doc.text(line, x, currentY, { align });
                currentY += fontSize * 0.352778 * lineHeight; // pt zu mm
            });
            return currentY;
        } else {
            doc.text(text, x, y, { align });
            return y + fontSize * 0.352778 * lineHeight;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // IMAGE HANDLING
    // ═══════════════════════════════════════════════════════════════════════════

    async addImage(doc, imageSource, x, y, width, height, options = {}) {
        try {
            let imageData = imageSource;
            
            // URL zu Base64 konvertieren
            if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
                imageData = await this.urlToBase64(imageSource);
            }
            
            const format = options.format || this.detectImageFormat(imageData);
            doc.addImage(imageData, format, x, y, width, height);
            
            return true;
        } catch (error) {
            console.warn('Bild konnte nicht hinzugefügt werden:', error);
            return false;
        }
    }

    async urlToBase64(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    detectImageFormat(data) {
        if (data.includes('data:image/png')) return 'PNG';
        if (data.includes('data:image/jpeg') || data.includes('data:image/jpg')) return 'JPEG';
        if (data.includes('data:image/gif')) return 'GIF';
        return 'PNG';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PDF MERGE (pdf-lib)
    // ═══════════════════════════════════════════════════════════════════════════

    async mergePDFs(pdfDataArray, options = {}) {
        const PDFLib = await this.loadPDFLib();
        const { PDFDocument } = PDFLib;
        
        const mergedPdf = await PDFDocument.create();
        
        // Metadaten setzen
        if (options.title) mergedPdf.setTitle(options.title);
        if (options.author) mergedPdf.setAuthor(options.author);
        if (options.subject) mergedPdf.setSubject(options.subject);
        if (options.keywords) mergedPdf.setKeywords(options.keywords);
        mergedPdf.setCreationDate(new Date());
        
        const bookmarks = [];
        let currentPage = 0;
        
        for (let i = 0; i < pdfDataArray.length; i++) {
            const pdfData = pdfDataArray[i];
            let pdfBytes;
            
            // Verschiedene Input-Formate unterstützen
            if (pdfData.data) {
                pdfBytes = pdfData.data;
            } else if (pdfData instanceof ArrayBuffer) {
                pdfBytes = pdfData;
            } else if (typeof pdfData === 'string') {
                // Base64
                pdfBytes = this.base64ToArrayBuffer(pdfData);
            } else {
                pdfBytes = pdfData;
            }
            
            try {
                const sourcePdf = await PDFDocument.load(pdfBytes);
                const pageIndices = sourcePdf.getPageIndices();
                const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
                
                // Bookmark für dieses Dokument
                if (pdfData.title || pdfData.name) {
                    bookmarks.push({
                        title: pdfData.title || pdfData.name,
                        pageIndex: currentPage
                    });
                }
                
                copiedPages.forEach(page => {
                    mergedPdf.addPage(page);
                    currentPage++;
                });
            } catch (error) {
                console.error(`Fehler beim Merge von PDF ${i}:`, error);
            }
        }
        
        // Seitenzahlen hinzufügen wenn gewünscht
        if (options.addPageNumbers) {
            await this.addPageNumbersToPDF(mergedPdf, options.pageNumberOptions);
        }
        
        return {
            pdf: mergedPdf,
            bytes: await mergedPdf.save(),
            pageCount: currentPage,
            bookmarks
        };
    }

    base64ToArrayBuffer(base64) {
        // Entferne Data-URL Prefix falls vorhanden
        const base64Clean = base64.replace(/^data:application\/pdf;base64,/, '');
        const binaryString = atob(base64Clean);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE NUMBERS
    // ═══════════════════════════════════════════════════════════════════════════

    async addPageNumbersToPDF(pdfDoc, options = {}) {
        const {
            format = 'Seite {current} von {total}',
            fontSize = 10,
            position = 'bottom-center',
            margin = 15,
            color = { r: 0.4, g: 0.4, b: 0.4 }
        } = options;
        
        const PDFLib = await this.loadPDFLib();
        const { rgb } = PDFLib;
        
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        
        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            const text = format
                .replace('{current}', index + 1)
                .replace('{total}', totalPages);
            
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            
            let x, y;
            switch (position) {
                case 'bottom-left':
                    x = margin;
                    y = margin;
                    break;
                case 'bottom-right':
                    x = width - textWidth - margin;
                    y = margin;
                    break;
                case 'top-center':
                    x = (width - textWidth) / 2;
                    y = height - margin;
                    break;
                case 'bottom-center':
                default:
                    x = (width - textWidth) / 2;
                    y = margin;
            }
            
            page.drawText(text, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(color.r, color.g, color.b)
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // WATERMARK
    // ═══════════════════════════════════════════════════════════════════════════

    async addWatermark(pdfBytes, text, options = {}) {
        const PDFLib = await this.loadPDFLib();
        const { PDFDocument, rgb, degrees } = PDFLib;
        
        const {
            fontSize = 60,
            opacity = 0.15,
            rotation = -45,
            color = { r: 0.5, g: 0.5, b: 0.5 }
        } = options;
        
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        
        for (const page of pages) {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            
            page.drawText(text, {
                x: (width - textWidth) / 2,
                y: height / 2,
                size: fontSize,
                font,
                color: rgb(color.r, color.g, color.b),
                rotate: degrees(rotation),
                opacity
            });
        }
        
        return pdfDoc.save();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPRESSION
    // ═══════════════════════════════════════════════════════════════════════════

    async compressPDF(pdfBytes, quality = 'medium') {
        const PDFLib = await this.loadPDFLib();
        const { PDFDocument } = PDFLib;
        
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Speichern mit Komprimierung
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: quality === 'high' ? 50 : quality === 'low' ? 200 : 100
        });
        
        console.log(`📦 PDF komprimiert: ${(pdfBytes.byteLength / 1024).toFixed(1)}KB → ${(compressedBytes.byteLength / 1024).toFixed(1)}KB`);
        
        return compressedBytes;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HTML TO PDF (Fallback mit html2pdf)
    // ═══════════════════════════════════════════════════════════════════════════

    async htmlToPDF(element, options = {}) {
        const html2pdf = await this.loadHtml2Pdf();
        
        const defaultOpts = {
            margin: [10, 10, 10, 10],
            filename: 'dokument.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['css', 'legacy'], avoid: 'img' }
        };
        
        const finalOpts = { ...defaultOpts, ...options };
        
        return html2pdf().set(finalOpts).from(element).outputPdf('arraybuffer');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PREVIEW & DOWNLOAD
    // ═══════════════════════════════════════════════════════════════════════════

    showPreview(pdfBytes, options = {}) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Modal erstellen
        const modal = document.createElement('div');
        modal.className = 'pdf-preview-modal';
        modal.innerHTML = `
            <div class="pdf-preview-content">
                <div class="pdf-preview-header">
                    <h3><i class="fas fa-file-pdf"></i> ${options.title || 'PDF Vorschau'}</h3>
                    <button class="btn-close" onclick="this.closest('.pdf-preview-modal').remove(); URL.revokeObjectURL('${url}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="pdf-preview-body">
                    <iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>
                </div>
                <div class="pdf-preview-footer">
                    <span class="pdf-size">${(pdfBytes.byteLength / 1024).toFixed(1)} KB</span>
                    <div class="pdf-actions">
                        <button class="btn-secondary" onclick="this.closest('.pdf-preview-modal').remove(); URL.revokeObjectURL('${url}')">
                            <i class="fas fa-times"></i> Schließen
                        </button>
                        <button class="btn-primary" onclick="window.pdfService.downloadBlob('${url}', '${options.filename || 'dokument.pdf'}'); this.closest('.pdf-preview-modal').remove();">
                            <i class="fas fa-download"></i> Herunterladen
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Styles hinzufügen falls nicht vorhanden
        if (!document.getElementById('pdf-preview-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pdf-preview-styles';
            styles.textContent = `
                .pdf-preview-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .pdf-preview-content {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 900px;
                    height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                }
                .pdf-preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                }
                .pdf-preview-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .pdf-preview-header .btn-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pdf-preview-body {
                    flex: 1;
                    overflow: hidden;
                    background: #f5f5f5;
                }
                .pdf-preview-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                }
                .pdf-preview-footer .pdf-size {
                    color: #64748b;
                    font-size: 0.9rem;
                }
                .pdf-preview-footer .pdf-actions {
                    display: flex;
                    gap: 0.75rem;
                }
                .pdf-preview-footer button {
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }
                .pdf-preview-footer .btn-secondary {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                }
                .pdf-preview-footer .btn-primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border: none;
                    color: white;
                }
                .pdf-preview-footer .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(modal);
        
        return url;
    }

    downloadBlob(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    download(pdfBytes, filename = 'dokument.pdf') {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        this.downloadBlob(url, filename);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    mmToPt(mm) {
        return mm * 2.83465;
    }

    ptToMm(pt) {
        return pt / 2.83465;
    }
}

// Global instance
window.pdfService = new UnifiedPDFService();

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedPDFService;
}
