/**
 * PDF Generator Lambda Function
 * Generiert PDFs aus HTML mit Puppeteer (Headless Chrome)
 * Unterstützt alle CSS-Features (Grid, Flexbox, @media print, etc.)
 */

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Id',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json'
};

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

        const { html, options = {} } = body;

        if (!html) {
            console.error('❌ PDF generation failed: HTML content is required');
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'HTML content is required' })
            };
        }

        // Validiere HTML-Länge (max 10MB)
        if (typeof html !== 'string' || html.length === 0) {
            console.error('❌ PDF generation failed: Invalid HTML content');
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Invalid HTML content' })
            };
        }

        if (html.length > 10 * 1024 * 1024) {
            console.error('❌ PDF generation failed: HTML content too large:', html.length, 'bytes');
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'HTML content exceeds maximum size of 10MB' })
            };
        }

        console.log('🔄 Starting PDF generation...');
        console.log('📄 HTML length:', html.length, 'bytes');
        console.log('⚙️ Options:', JSON.stringify(options));

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
        await page.setContent(html, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for fonts to load
        await page.evaluateHandle(() => document.fonts.ready);

        // Additional wait for any dynamic content
        // WICHTIG: page.waitForTimeout() ist deprecated, verwende Promise-basierte Lösung
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate PDF
        // WICHTIG: Margins werden im HTML als Padding gehandhabt, daher Puppeteer-Margins auf 0 setzen
        const pdfOptions = {
            format: options.format || 'A4',
            printBackground: options.printBackground !== false, // Default: true
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
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        // Unterscheide zwischen verschiedenen Fehlertypen
        let statusCode = 500;
        let errorMessage = 'PDF generation failed';
        
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
            statusCode = 504;
            errorMessage = 'PDF generation timed out. The HTML content may be too complex or resources may be loading too slowly.';
        } else if (error.message.includes('Navigation')) {
            statusCode = 400;
            errorMessage = 'Invalid HTML content: Navigation error during PDF generation.';
        } else if (error.message.includes('Protocol error')) {
            statusCode = 500;
            errorMessage = 'Browser protocol error during PDF generation.';
        }
        
        return {
            statusCode: statusCode,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                error: errorMessage,
                message: error.message,
                type: error.name,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
