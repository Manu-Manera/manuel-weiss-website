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
// Hilfsfunktion: Reduziere HTML-Content auf Text-Inhalt (beschleunigt GPT-Verarbeitung)
function extractTextContent(html) {
    // Entferne Script- und Style-Tags komplett
    let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
    
    // Entferne Kommentare
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
    
    // Reduziere Whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Wenn zu lang (>20000 Zeichen), kürze auf wichtigsten Teil
    if (cleaned.length > 20000) {
        // Behalte Anfang und Ende (Header + Footer wichtig)
        const start = cleaned.substring(0, 10000);
        const end = cleaned.substring(cleaned.length - 10000);
        cleaned = start + '\n[... gekürzt ...]\n' + end;
    }
    
    return cleaned;
}

async function generateHTMLWithGPT52(content, settings, apiKey) {
    const openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Content optimieren: Nur Text-Inhalt extrahieren (reduziert Token-Anzahl)
    const optimizedContent = extractTextContent(content);
    console.log(`📊 Content optimiert: ${content.length} → ${optimizedContent.length} Zeichen`);
    
    const prompt = `Generiere vollständiges HTML5-Dokument für PDF-Export.

Anforderungen:
- Padding: ${settings.marginTop}mm/${settings.marginRight}mm/${settings.marginBottom}mm/${settings.marginLeft}mm
- Font: ${settings.fontFamily || 'Inter'}, ${settings.fontSize || 11}pt, Zeilenabstand ${settings.lineHeight || 1.5}
- Farben: Text ${settings.textColor || '#1e293b'}, Hintergrund ${settings.backgroundColor || '#ffffff'}
- Container: style="padding: ${settings.marginTop}mm ${settings.marginRight}mm ${settings.marginBottom}mm ${settings.marginLeft}mm; box-sizing: border-box; width: calc(210mm - ${settings.marginLeft}mm - ${settings.marginRight}mm);"
- HTML5 mit <!DOCTYPE html>, <head> (Meta, Fonts, <style>), <body>
- CSS: Padding in mm, box-sizing: border-box, @media print, @page { size: A4; margin: 0; }, body { width: 210mm; margin: 0; padding: 0; }

Inhalt:
${optimizedContent}

Antworte NUR mit HTML-Code, kein Markdown, keine Erklärungen.`;

    try {
        const response = await fetch(openaiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5.2', // Zurück zu gpt-5.2 (Projekt hat keinen Zugriff auf gpt-4o)
                reasoning_effort: 'low', // Optimiert für schnelle HTML-Generierung
                messages: [
                    {
                        role: 'system',
                        content: `HTML/CSS-Experte für PDF. Antworte NUR mit HTML5-Code, kein Markdown. CSS in mm, box-sizing: border-box.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_completion_tokens: 8000 // Reduziert für schnellere Antworten
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const htmlContent = data.choices[0]?.message?.content;
        
        if (!htmlContent) {
            throw new Error('Keine HTML-Antwort von GPT-4o erhalten');
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

        // Set content and wait for resources (maximal optimiert für Geschwindigkeit)
        await page.setContent(finalHTML, {
            waitUntil: 'domcontentloaded', // Schnellste Option - nur DOM, keine Ressourcen
            timeout: 10000 // Reduziert von 15s auf 10s
        });

        // Wait for fonts to load (minimal - nur 1 Sekunde)
        await Promise.race([
            page.evaluateHandle(() => document.fonts.ready),
            new Promise(resolve => setTimeout(resolve, 1000)) // Max 1 Sekunde für Fonts (war 2s)
        ]);

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
