/**
 * Netlify Function: Send Contact Email
 * Sendet E-Mails über AWS SES für Kontaktformulare
 */

const AWS = require('aws-sdk');

// AWS SES Client initialisieren
const ses = new AWS.SES({ 
    region: process.env.AWS_REGION || 'eu-central-1',
    // AWS Credentials werden aus Environment Variables geladen
    // Diese müssen in Netlify Dashboard gesetzt werden:
    // AWS_ACCESS_KEY_ID
    // AWS_SECRET_ACCESS_KEY
});

// E-Mail-Konfiguration
const FROM_EMAIL = process.env.FROM_EMAIL || 'mail@manuel-weiss.ch';
const TO_EMAIL = process.env.TO_EMAIL || 'info@manuel-weiss.ch';

exports.handler = async (event, context) => {
    // CORS Headers für Browser-Anfragen
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Nur POST erlauben
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse Request Body
        let formData;
        try {
            formData = JSON.parse(event.body);
        } catch (e) {
            // Fallback: URL-encoded format
            const params = new URLSearchParams(event.body);
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
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Name und E-Mail sind erforderlich' 
                })
            };
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
            <h2>${subject}</h2>
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
        const params = {
            Source: FROM_EMAIL,
            Destination: {
                ToAddresses: [TO_EMAIL]
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
        };

        console.log('📧 Sende E-Mail über AWS SES...');
        const result = await ses.sendEmail(params).promise();

        console.log('✅ E-Mail erfolgreich gesendet:', result.MessageId);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                messageId: result.MessageId,
                message: 'E-Mail erfolgreich gesendet'
            })
        };

    } catch (error) {
        console.error('❌ Fehler beim Senden der E-Mail:', error);
        
        // Detaillierte Fehlerbehandlung
        let errorMessage = 'Fehler beim Senden der E-Mail';
        if (error.code === 'MessageRejected') {
            errorMessage = 'E-Mail-Adresse nicht verifiziert oder abgelehnt';
        } else if (error.code === 'AccessDenied') {
            errorMessage = 'AWS-Zugriff verweigert - bitte Credentials prüfen';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

/**
 * HTML-Escape Funktion
 */
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

