/**
 * PDF Generator Lambda Function mit GPT-5.2 Integration
 * Generiert HTML mit GPT-5.2 und rendert PDF mit Puppeteer
 * Unterstützt alle CSS-Features (Grid, Flexbox, @media print, etc.)
 */

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

// Node.js 18 hat fetch, aber für Sicherheit verwenden wir node-fetch falls nötig
let fetch;
try {
    // Versuche natives fetch (Node.js 18+)
    if (typeof globalThis.fetch === 'function') {
        fetch = globalThis.fetch;
    } else {
        // Fallback zu node-fetch
        fetch = require('node-fetch');
    }
} catch (e) {
    // Wenn node-fetch nicht verfügbar ist, verwende natives fetch
    fetch = globalThis.fetch;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Id',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Ruft GPT-5.2 auf, um HTML mit korrekten Padding-Werten zu generieren
 */
async function generateHTMLWithGPT52(content, settings, apiKey) {
    const openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
    
    const prompt = `Du bist ein Experte für HTML/CSS-Layouts für PDF-Exporte. 

Generiere ein vollständiges, valides HTML5-Dokument mit folgenden Anforderungen:

1. **Seitenränder (Padding):**
   - Oben: ${settings.marginTop}mm
   - Rechts: ${settings.marginRight}mm
   - Unten: ${settings.marginBottom}mm
   - Links: ${settings.marginLeft}mm
   
2. **Formatierung:**
   - Schriftart: ${settings.fontFamily || 'Inter'}
   - Schriftgröße: ${settings.fontSize || 11}pt
   - Zeilenabstand: ${settings.lineHeight || 1.5}
   - Textfarbe: ${settings.textColor || '#1e293b'}
   - Hintergrundfarbe: ${settings.backgroundColor || '#ffffff'}
   
3. **WICHTIG - Padding muss als inline-Style auf dem Hauptcontainer gesetzt werden:**
   - Das Element mit Klasse "design-resume-preview" MUSS inline-Styles haben:
     style="padding-top: ${settings.marginTop}mm; padding-right: ${settings.marginRight}mm; padding-bottom: ${settings.marginBottom}mm; padding-left: ${settings.marginLeft}mm; box-sizing: border-box; width: calc(210mm - ${settings.marginLeft}mm - ${settings.marginRight}mm);"
   
4. **HTML-Struktur:**
   - Vollständiges HTML5-Dokument mit <!DOCTYPE html>
   - <head> mit Meta-Tags, Google Fonts Link (falls benötigt), und <style> Block
   - <body> mit dem übergebenen Inhalt
   
5. **CSS-Anforderungen:**
   - Alle Padding-Werte MÜSSEN in mm angegeben werden
   - box-sizing: border-box verwenden
   - @media print Block für Print-Styles
   - @page { size: A4; margin: 0; }
   - Body: width: 210mm, margin: 0, padding: 0
   
6. **Inhalt:**
   ${content}

Antworte NUR mit dem vollständigen HTML-Code, ohne Markdown-Code-Blöcke, ohne Erklärungen, ohne zusätzlichen Text. Nur das HTML-Dokument.`;

    try {
        const response = await fetch(openaiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5.2', // GPT-5.2 für beste Qualität bei HTML/CSS-Generierung
                reasoning_effort: 'low', // Optimiert für schnelle HTML-Generierung
                messages: [
                    {
                        role: 'system',
                        content: `Du bist ein Experte für HTML/CSS-Layouts für PDF-Exporte.

<output_verbosity_spec>
- Antworte NUR mit vollständigem HTML5-Code
- Keine Markdown-Code-Blöcke, keine Erklärungen
- Nur das HTML-Dokument selbst
</output_verbosity_spec>

<layout_precision>
- Generiere immer vollständige, valide HTML5-Dokumente
- Verwende präzise CSS-Styles mit exakten mm-Werten
- Alle Padding-Werte MÜSSEN in mm angegeben werden
- box-sizing: border-box verwenden
</layout_precision>`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                // temperature wird nicht unterstützt von GPT-5.2 (nur Standardwert 1)
                max_completion_tokens: 16000 // Mehr Tokens für komplexe HTML-Strukturen
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const htmlContent = data.choices[0]?.message?.content;
        
        if (!htmlContent) {
            throw new Error('Keine HTML-Antwort von GPT-5.2 erhalten');
        }

        // Entferne Markdown-Code-Blöcke falls vorhanden
        let cleanHTML = htmlContent.trim();
        if (cleanHTML.startsWith('```html')) {
            cleanHTML = cleanHTML.replace(/^```html\n?/, '').replace(/\n?```$/, '');
        } else if (cleanHTML.startsWith('```')) {
            cleanHTML = cleanHTML.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        return cleanHTML.trim();

    } catch (error) {
        console.error('❌ GPT-5.2 HTML-Generierung fehlgeschlagen:', error);
        throw error;
    }
}

exports.handler = async (event) => {
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: ''
        };
    }

    try {
        // Parse Request Body
        let body;
        try {
            body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        } catch (e) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        const { 
            html, // Fallback: direktes HTML
            content, // HTML-Inhalt für GPT-5.2
            settings = {}, // Design-Settings (marginTop, marginRight, etc.)
            options = {},
            openaiApiKey // OpenAI API Key
        } = body;

        // Wenn kein API Key übergeben wurde, versuche aus Umgebungsvariable
        const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    error: 'OpenAI API Key fehlt. Bitte als openaiApiKey im Request oder als OPENAI_API_KEY Umgebungsvariable bereitstellen.' 
                })
            };
        }

        console.log('🔄 Starting PDF generation with GPT-5.2...');
        console.log('⚙️ Settings:', JSON.stringify(settings));
        console.log('📄 Content length:', content?.length || html?.length || 0);

        let finalHTML = html;

        // Wenn content und settings vorhanden, verwende GPT-5.2 für HTML-Generierung
        if (content && settings && Object.keys(settings).length > 0) {
            console.log('🤖 Generiere HTML mit GPT-5.2...');
            try {
                finalHTML = await generateHTMLWithGPT52(content, settings, apiKey);
                console.log('✅ HTML von GPT-5.2 generiert, Länge:', finalHTML.length);
            } catch (gptError) {
                console.error('⚠️ GPT-5.2 Fehler, verwende Fallback-HTML:', gptError.message);
                // Fallback: Verwende direktes HTML falls vorhanden
                if (!html) {
                    throw new Error(`GPT-5.2 Fehler und kein Fallback-HTML: ${gptError.message}`);
                }
                finalHTML = html;
            }
        } else if (!html) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    error: 'Entweder "html" oder "content" + "settings" müssen bereitgestellt werden' 
                })
            };
        }

        // Launch Puppeteer with Chromium
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true
        });

        const page = await browser.newPage();

        // Set content and wait for resources
        await page.setContent(finalHTML, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for fonts to load
        await page.evaluateHandle(() => document.fonts.ready);

        // Additional wait for any dynamic content
        await page.waitForTimeout(1000);

        // Generate PDF
        // WICHTIG: Margins werden im HTML als Padding gehandhabt, daher Puppeteer-Margins auf 0 setzen
        const pdfOptions = {
            format: options.format || 'A4',
            printBackground: options.printBackground !== false,
            preferCSSPageSize: false, // WICHTIG: false für korrekte Seitengröße
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            },
            displayHeaderFooter: options.displayHeaderFooter || false,
            headerTemplate: options.headerTemplate || '',
            footerTemplate: options.footerTemplate || ''
        };

        console.log('📄 Generating PDF with options:', JSON.stringify(pdfOptions));

        const pdf = await page.pdf(pdfOptions);

        await browser.close();

        console.log('✅ PDF generated successfully, size:', pdf.length, 'bytes');

        // Return PDF as base64
        return {
            statusCode: 200,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"'
            },
            body: pdf.toString('base64'),
            isBase64Encoded: true
        };

    } catch (error) {
        console.error('❌ PDF generation error:', error);
        
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                error: 'PDF generation failed',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
