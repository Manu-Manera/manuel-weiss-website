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
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Profilbild als Base64 einbetten
        const imagePath = path.join(__dirname, 'manuel-weiss-photo.jpg');
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = 'image/jpeg'; // oder 'image/png' je nach Dateityp
            
            // Bild im HTML durch Base64 ersetzen
            htmlContent = htmlContent.replace(
                'src="manuel-weiss-photo.jpg"',
                `src="data:${mimeType};base64,${base64Image}"`
            );
            
            console.log('📸 Profilbild als Base64 eingebettet');
        } else {
            console.log('⚠️  Profilbild nicht gefunden, verwende Platzhalter');
        }
        
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });
        
        // PDF generieren
        const pdfPath = path.join(__dirname, 'beraterprofil.pdf');
        
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });
        
        console.log('✅ PDF erfolgreich generiert: beraterprofil.pdf');
        
        await browser.close();
        
    } catch (error) {
        console.error('❌ Fehler bei der PDF-Generierung:', error);
        process.exit(1);
    }
}

// Script ausführen
generatePDF(); 