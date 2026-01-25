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

    let browser = null;
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
            html, // Direktes HTML (OHNE GPT - wie andere Anwendungen)
            content, // HTML-Inhalt für GPT-5.2 (Legacy-Modus)
            settings = {}, // Design-Settings (marginTop, marginRight, etc.)
            options = {},
            openaiApiKey // OpenAI API Key (nur für GPT-Modus)
        } = body;

        // Validiere HTML-Länge (max 10MB)
        if (html && (typeof html !== 'string' || html.length === 0)) {
            console.error('❌ PDF generation failed: Invalid HTML content');
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Invalid HTML content' })
            };
        }

        if (html && html.length > 10 * 1024 * 1024) {
            console.error('❌ PDF generation failed: HTML content too large:', html.length, 'bytes');
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'HTML content exceeds maximum size of 10MB' })
            };
        }

        let finalHTML = html || '';

        // WICHTIG: Wenn html direkt bereitgestellt wird, verwende es OHNE GPT (schneller)
        if (html) {
            console.log('📄 HTML direkt bereitgestellt - verwende OHNE GPT (schneller)');
            console.log('📄 HTML length:', html.length);
        } else if (content && settings && Object.keys(settings).length > 0) {
            // Legacy-Modus: Wenn content + settings vorhanden, verwende GPT-5.2
            console.log('🤖 Legacy-Modus: Generiere HTML mit GPT-5.2...');
            const apiKey = openaiApiKey || process.env.OPENAI_API_KEY;
            
            if (!apiKey) {
                return {
                    statusCode: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ 
                        error: 'Für GPT-Modus wird openaiApiKey benötigt. Für direkten HTML-Export bitte "html" Parameter verwenden.' 
                    })
                };
            }
            
            try {
                finalHTML = await generateHTMLWithGPT52(content, settings, apiKey);
                console.log('✅ HTML von GPT-5.2 generiert, Länge:', finalHTML.length);
            } catch (gptError) {
                console.error('❌ GPT-5.2 Fehler:', gptError.message);
                throw new Error(`GPT-5.2 Fehler: ${gptError.message}`);
            }
        } else {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    error: 'Entweder "html" (direkt) oder "content" + "settings" + "openaiApiKey" (GPT-Modus) müssen bereitgestellt werden' 
                })
            };
        }
        
        if (!finalHTML) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ 
                    error: 'Kein HTML zum Rendern verfügbar' 
                })
            };
        }
        
        console.log('🔄 Starting PDF generation...');
        console.log('📄 Final HTML length:', finalHTML.length);

        // Launch Puppeteer with Chromium
        browser = await puppeteer.launch({
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
        // API Gateway Limit: ~6MB für Response-Payload
        const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB für Sicherheit (API Gateway Limit ist ~6MB)
        
        let pdfOptions = {
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

        let pdf = await page.pdf(pdfOptions);
        
        // Wenn PDF zu groß ist, reduziere Qualität
        if (pdf.length > MAX_PDF_SIZE) {
            console.warn(`⚠️ PDF zu groß (${Math.round(pdf.length / 1024)}KB), reduziere Qualität...`);
            
            // Versuche mit reduzierter Qualität (scale < 1 reduziert Dateigröße)
            pdfOptions = {
                ...pdfOptions,
                scale: 0.8 // Reduziere auf 80% für kleinere Dateigröße
            };
            
            pdf = await page.pdf(pdfOptions);
            console.log(`📦 PDF nach Qualitätsreduktion: ${Math.round(pdf.length / 1024)}KB`);
            
            // Wenn immer noch zu groß, versuche noch aggressiver
            if (pdf.length > MAX_PDF_SIZE) {
                console.warn(`⚠️ PDF immer noch zu groß (${Math.round(pdf.length / 1024)}KB), reduziere weiter...`);
                pdfOptions = {
                    ...pdfOptions,
                    scale: 0.6 // Reduziere auf 60%
                };
                
                pdf = await page.pdf(pdfOptions);
                console.log(`📦 PDF nach weiterer Qualitätsreduktion: ${Math.round(pdf.length / 1024)}KB`);
            }
        }

        await browser.close();
        browser = null;

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
        // Stelle sicher, dass finalHTML immer ein String ist
        const htmlSize = (finalHTML && typeof finalHTML === 'string') ? finalHTML.length : 0;
        const htmlSizeKB = Math.round(htmlSize / 1024);
        const imageCount = (finalHTML && typeof finalHTML === 'string') ? (finalHTML.match(/data:image\/[^"'\s]+/g) || []).length : 0;
        
        console.error('❌ PDF generation error:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ HTML size:', htmlSizeKB, 'KB');
        console.error('❌ Image count:', imageCount);
        
        // Unterscheide zwischen verschiedenen Fehlertypen
        let statusCode = 500;
        let errorMessage = 'PDF generation failed';
        let userFriendlyMessage = 'PDF-Generierung fehlgeschlagen';
        
        if (error.name === 'TimeoutError' || error.message.includes('timeout') || error.message.includes('exceeded')) {
            statusCode = 504;
            errorMessage = `PDF generation timed out. HTML size: ${htmlSizeKB}KB, Images: ${imageCount}. The HTML content may be too complex or resources may be loading too slowly.`;
            userFriendlyMessage = `PDF-Generierung dauerte zu lange (${htmlSizeKB}KB, ${imageCount} Bilder). Bitte vereinfachen Sie das Dokument.`;
        } else if (error.message.includes('Navigation') || error.message.includes('navigation')) {
            statusCode = 400;
            errorMessage = `Invalid HTML content: Navigation error during PDF generation. HTML size: ${htmlSizeKB}KB, Images: ${imageCount}.`;
            userFriendlyMessage = `Ungültiges HTML-Dokument (${htmlSizeKB}KB, ${imageCount} Bilder). Navigation-Fehler beim Rendern.`;
        } else if (error.message.includes('Protocol error') || error.message.includes('protocol')) {
            statusCode = 500;
            errorMessage = `Browser protocol error during PDF generation. HTML size: ${htmlSizeKB}KB, Images: ${imageCount}.`;
            userFriendlyMessage = `Browser-Protokoll-Fehler beim PDF-Export (${htmlSizeKB}KB, ${imageCount} Bilder).`;
        } else if (error.message.includes('Memory') || error.message.includes('memory') || error.message.includes('OOM')) {
            statusCode = 500;
            errorMessage = `Out of memory error during PDF generation. HTML size: ${htmlSizeKB}KB, Images: ${imageCount}. Document may be too large.`;
            userFriendlyMessage = `Speicher-Fehler beim PDF-Export (${htmlSizeKB}KB, ${imageCount} Bilder). Dokument zu groß.`;
        } else if (error.message.includes('Target closed') || error.message.includes('Session closed')) {
            statusCode = 500;
            errorMessage = `Browser session closed unexpectedly. HTML size: ${htmlSizeKB}KB, Images: ${imageCount}.`;
            userFriendlyMessage = `Browser-Session wurde unerwartet geschlossen (${htmlSizeKB}KB, ${imageCount} Bilder).`;
        } else {
            // Generischer Fehler mit Details
            errorMessage = `PDF generation failed: ${error.message}. HTML size: ${htmlSizeKB}KB, Images: ${imageCount}.`;
            userFriendlyMessage = `PDF-Generierung fehlgeschlagen (${htmlSizeKB}KB, ${imageCount} Bilder): ${error.message}`;
        }
        
        return {
            statusCode: statusCode,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                error: userFriendlyMessage,
                message: errorMessage,
                type: error.name,
                htmlSize: htmlSizeKB,
                imageCount: imageCount,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    } finally {
        // Wichtig: Chromium immer schließen, sonst kann die Lambda-Execution "vergiften"
        // und nachfolgende Requests über OOM/Timeout in Gateway-Errors laufen (dann ohne CORS).
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                console.warn('⚠️ Konnte Chromium nicht sauber schließen:', e && e.message ? e.message : e);
            }
        }
    }
};
