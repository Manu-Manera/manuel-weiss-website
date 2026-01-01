/**
 * AWS Lambda Function for Contact Email API
 * API-First System für Kontaktformulare (wie Rental Images API)
 * 
 * Endpoints:
 * - POST /contact/send - Sende Kontakt-E-Mail über AWS SES
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'eu-central-1' });

const FROM_EMAIL = process.env.FROM_EMAIL || 'mail@manuel-weiss.ch';
// Sende an info@manuel-weiss.ch (kann über Environment Variable überschrieben werden)
const TO_EMAIL = process.env.TO_EMAIL || 'info@manuel-weiss.ch';

const ALLOWED_ORIGINS = [
    'https://mawps.netlify.app',
    'https://www.manuel-weiss.ch',
    'https://manuel-weiss.ch',
    'http://localhost:3000',
    'http://localhost:8888'
];

// Helper function to create CORS headers
function getCORSHeaders(origin) {
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };
}

// Helper function to create response
function createResponse(statusCode, body, origin = '*') {
    return {
        statusCode,
        headers: getCORSHeaders(origin),
        body: JSON.stringify(body)
    };
}

// HTML-Escape Funktion
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

exports.handler = async (event) => {
    console.log('📧 Contact Email API Event:', JSON.stringify(event, null, 2));
    
    const origin = event.headers?.origin || event.headers?.Origin || '*';
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
        return createResponse(200, { message: 'OK' }, origin);
    }
    
    try {
        // Parse path
        const path = event.path || event.rawPath || '';
        const pathParts = path.split('/').filter(p => p);
        
        console.log('📋 Path parts:', pathParts);
        
        // Route: /contact/send
        if (pathParts.length === 2 && pathParts[0] === 'contact' && pathParts[1] === 'send' && method === 'POST') {
            return await sendContactEmail(event, origin);
        }
        
        return createResponse(404, { error: 'Not found' }, origin);
        
    } catch (error) {
        console.error('❌ Error:', error);
        return createResponse(
            500,
            { error: error.message || 'Internal server error' },
            origin
        );
    }
};

/**
 * POST /contact/send
 * Sende Kontakt-E-Mail über AWS SES
 */
async function sendContactEmail(event, origin) {
    try {
        // Parse Request Body
        let formData;
        try {
            formData = JSON.parse(event.body || '{}');
        } catch (e) {
            // Fallback: URL-encoded format
            const params = new URLSearchParams(event.body || '');
            formData = {
                name: params.get('name'),
                email: params.get('email'),
                eventDate: params.get('eventDate'),
                eventType: params.get('eventType'),
                package: params.get('package'),
                guests: params.get('guests'),
                message: params.get('message'),
                rental: params.get('rental')
            };
        }

        // Validierung
        if (!formData.name || !formData.email) {
            return createResponse(400, { 
                error: 'Name und E-Mail sind erforderlich' 
            }, origin);
        }

        // E-Mail-Inhalt erstellen
        const subject = formData.rental 
            ? `Neue Anfrage: ${formData.rental} Vermietung`
            : 'Neue Kontaktanfrage von manuel-weiss.ch';

        // HTML-Body erstellen
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #475569; margin-bottom: 5px; }
        .field-value { color: #1e293b; }
        .footer { background: #e2e8f0; padding: 15px; text-align: center; font-size: 0.875rem; color: #64748b; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>${escapeHtml(subject)}</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="field-label">Name:</div>
                <div class="field-value">${escapeHtml(formData.name)}</div>
            </div>
            <div class="field">
                <div class="field-label">E-Mail:</div>
                <div class="field-value"><a href="mailto:${escapeHtml(formData.email)}">${escapeHtml(formData.email)}</a></div>
            </div>
            ${formData.rental ? `
            <div class="field">
                <div class="field-label">Vermietung:</div>
                <div class="field-value">${escapeHtml(formData.rental)}</div>
            </div>
            ` : ''}
            ${formData.eventDate ? `
            <div class="field">
                <div class="field-label">Event-Datum:</div>
                <div class="field-value">${escapeHtml(formData.eventDate)}</div>
            </div>
            ` : ''}
            ${formData.eventType ? `
            <div class="field">
                <div class="field-label">Art der Veranstaltung:</div>
                <div class="field-value">${escapeHtml(formData.eventType)}</div>
            </div>
            ` : ''}
            ${formData.package ? `
            <div class="field">
                <div class="field-label">Gewünschtes Paket:</div>
                <div class="field-value">${escapeHtml(formData.package)}</div>
            </div>
            ` : ''}
            ${formData.guests ? `
            <div class="field">
                <div class="field-label">Anzahl Gäste:</div>
                <div class="field-value">${escapeHtml(formData.guests)}</div>
            </div>
            ` : ''}
            ${formData.message ? `
            <div class="field">
                <div class="field-label">Nachricht:</div>
                <div class="field-value" style="white-space: pre-wrap;">${escapeHtml(formData.message)}</div>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>Diese E-Mail wurde automatisch von manuel-weiss.ch gesendet.</p>
            <p>Gesendet am: ${new Date().toLocaleString('de-CH', { timeZone: 'Europe/Zurich' })}</p>
        </div>
    </div>
</body>
</html>
        `.trim();

        // Text-Body erstellen
        const textBody = `
${subject}

Name: ${formData.name}
E-Mail: ${formData.email}
${formData.rental ? `Vermietung: ${formData.rental}\n` : ''}
${formData.eventDate ? `Event-Datum: ${formData.eventDate}\n` : ''}
${formData.eventType ? `Art der Veranstaltung: ${formData.eventType}\n` : ''}
${formData.package ? `Gewünschtes Paket: ${formData.package}\n` : ''}
${formData.guests ? `Anzahl Gäste: ${formData.guests}\n` : ''}
${formData.message ? `\nNachricht:\n${formData.message}\n` : ''}

---
Diese E-Mail wurde automatisch von manuel-weiss.ch gesendet.
Gesendet am: ${new Date().toLocaleString('de-CH', { timeZone: 'Europe/Zurich' })}
        `.trim();

        // E-Mail über AWS SES senden
        // Sende an info@manuel-weiss.ch (und optional weitere Adressen)
        const toAddresses = [TO_EMAIL];
        // Falls eine zusätzliche CC-Adresse gewünscht ist, kann sie hier hinzugefügt werden
        // toAddresses.push('mail@manuel-weiss.ch');
        
        const command = new SendEmailCommand({
            Source: FROM_EMAIL,
            Destination: {
                ToAddresses: toAddresses
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: htmlBody,
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: textBody,
                        Charset: 'UTF-8'
                    }
                }
            },
            ReplyToAddresses: [formData.email]
        });

        console.log('📧 Sende E-Mail über AWS SES...');
        const result = await sesClient.send(command);

        console.log('✅ E-Mail erfolgreich gesendet:', result.MessageId);

        return createResponse(200, {
            success: true,
            messageId: result.MessageId,
            message: 'E-Mail erfolgreich gesendet'
        }, origin);

    } catch (error) {
        console.error('❌ Fehler beim Senden der E-Mail:', error);
        
        // Detaillierte Fehlerbehandlung
        let errorMessage = 'Fehler beim Senden der E-Mail';
        if (error.name === 'MessageRejected') {
            errorMessage = 'E-Mail-Adresse nicht verifiziert oder abgelehnt';
        } else if (error.name === 'AccessDenied') {
            errorMessage = 'AWS-Zugriff verweigert - bitte Credentials prüfen';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return createResponse(500, {
            success: false,
            error: errorMessage
        }, origin);
    }
}

