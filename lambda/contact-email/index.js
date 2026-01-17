/**
 * AWS Lambda: Contact Email
 * Sendet Kontaktformular-E-Mails über AWS SES
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({ region: process.env.AWS_REGION || 'eu-central-1' });

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@manuel-weiss.ch';
const TO_EMAIL = process.env.TO_EMAIL || 'kontakt@manuel-weiss.ch';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    console.log('Contact Email Lambda:', event.httpMethod);
    
    // CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    // Nur POST erlauben
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { name, email, message, subject, phone } = body;

        // Validierung
        if (!name || !name.trim()) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Name ist erforderlich' })
            };
        }

        if (!email || !email.trim() || !isValidEmail(email)) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Gültige E-Mail-Adresse ist erforderlich' })
            };
        }

        if (!message || !message.trim()) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Nachricht ist erforderlich' })
            };
        }

        // E-Mail zusammenstellen
        const emailSubject = subject 
            ? `Kontaktformular: ${subject}`
            : `Kontaktformular von ${name}`;

        const emailBody = `
Neue Kontaktanfrage von manuel-weiss.ch
========================================

Name: ${name}
E-Mail: ${email}
${phone ? `Telefon: ${phone}` : ''}

Nachricht:
----------
${message}

========================================
Gesendet am: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Zurich' })}
        `.trim();

        // E-Mail senden
        await ses.send(new SendEmailCommand({
            Source: FROM_EMAIL,
            Destination: {
                ToAddresses: [TO_EMAIL]
            },
            Message: {
                Subject: {
                    Data: emailSubject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Text: {
                        Data: emailBody,
                        Charset: 'UTF-8'
                    }
                }
            },
            ReplyToAddresses: [email]
        }));

        console.log('✅ Kontakt-E-Mail gesendet an:', TO_EMAIL);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                message: 'Ihre Nachricht wurde erfolgreich gesendet. Ich werde mich zeitnah bei Ihnen melden.'
            })
        };

    } catch (error) {
        console.error('Contact Email Error:', error);
        
        // SES-spezifische Fehler
        if (error.name === 'MessageRejected') {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'Die E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.'
                })
            };
        }

        if (error.name === 'MailFromDomainNotVerifiedException') {
            console.error('SES Domain nicht verifiziert:', FROM_EMAIL);
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    error: 'E-Mail-Konfiguration fehlerhaft. Bitte kontaktieren Sie den Administrator.'
                })
            };
        }

        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};

/**
 * Validiert eine E-Mail-Adresse
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
