// CV Tailor - Export Function
// Exportiert CV als DOCX oder PDF

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, error: 'Method not allowed' })
        };
    }

    try {
        const { format, cvContent, fileName } = JSON.parse(event.body);

        if (!['docx', 'pdf'].includes(format)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Ungültiges Format. Nur docx oder pdf erlaubt.' })
            };
        }

        // Für jetzt: Return CV als Text/HTML
        // In Produktion: Verwende docx/pdf Libraries (docx, pdfkit, puppeteer)
        // Hier würde normalerweise das Dokument generiert werden
        
        // Mock: Return Base64 encoded content (in Produktion wäre das das echte Dokument)
        const exportData = {
            format: format,
            content: cvContent,
            fileName: fileName || `cv-${Date.now()}.${format}`,
            message: 'Export erfolgreich. In Produktion würde hier das echte Dokument generiert werden.'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                ...exportData
            })
        };

    } catch (error) {
        console.error('CV Export Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};

