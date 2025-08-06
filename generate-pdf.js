const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
    console.log('🚀 Starte PDF-Generierung...');
    
    try {
        // Browser starten
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // HTML-Datei laden
        const htmlPath = path.join(__dirname, 'beraterprofil.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // HTML in Page laden
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });
        
        // PDF generieren
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            },
            preferCSSPageSize: true
        });
        
        // PDF speichern
        const outputPath = path.join(__dirname, 'beraterprofil.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log('✅ PDF erfolgreich erstellt: beraterprofil.pdf');
        
        await browser.close();
        
    } catch (error) {
        console.error('❌ Fehler bei der PDF-Generierung:', error);
        process.exit(1);
    }
}

// PDF generieren wenn Skript direkt ausgeführt wird
if (require.main === module) {
    generatePDF();
}

module.exports = { generatePDF }; 