/**
 * AWS SES Email Forwarder Lambda Function
 * Liest eingehende E-Mails aus S3 und leitet sie weiter
 */

const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.AWS_REGION || 'eu-central-1' });
const s3 = new AWS.S3();

// Ziel-E-Mail-Adresse (kann über Environment Variable gesetzt werden)
const FORWARD_TO = process.env.FORWARD_TO_EMAIL || 'weiss-manuel@gmx.de';
const FROM_EMAIL = process.env.FROM_EMAIL || 'mail@manuel-weiss.ch';

exports.handler = async (event) => {
    console.log('📧 Email Forwarder gestartet:', JSON.stringify(event, null, 2));
    
    try {
        // SES Event Structure
        const sesEvent = event.Records && event.Records[0] && event.Records[0].ses;
        
        if (!sesEvent) {
            console.log('⚠️ Kein SES Event gefunden, event:', JSON.stringify(event));
            return { statusCode: 200, body: 'No SES event' };
        }
        
        const { mail, receipt } = sesEvent;
        const { messageId, source, destination, timestamp } = mail;
        const { action, recipients } = receipt;
        
        console.log('📬 E-Mail empfangen:', {
            messageId,
            from: source,
            to: destination,
            timestamp,
            action: action.type,
            s3Action: action.s3Action
        });
        
        // Prüfe ob E-Mail in S3 gespeichert wurde
        if (action.type !== 'S3' || !action.s3Action) {
            console.log('⚠️ Keine S3 Action gefunden');
            return { statusCode: 200, body: 'No S3 action' };
        }
        
        const s3Bucket = action.s3Action.bucketName;
        const s3Key = action.s3Action.objectKey;
        
        console.log('📦 Lade E-Mail aus S3:', { bucket: s3Bucket, key: s3Key });
        
        // E-Mail aus S3 laden
        const emailObject = await s3.getObject({
            Bucket: s3Bucket,
            Key: s3Key
        }).promise();
        
        const rawEmail = emailObject.Body.toString();
        console.log('✅ E-Mail geladen, Größe:', rawEmail.length, 'bytes');
        
        // E-Mail parsen (einfache Extraktion)
        const emailParts = parseEmail(rawEmail);
        
        // Betreff mit Hinweis versehen
        const forwardedSubject = emailParts.subject 
            ? `[Weitergeleitet] ${emailParts.subject}`
            : `[Weitergeleitet] E-Mail von ${emailParts.from}`;
        
        // E-Mail weiterleiten
        console.log('📤 Leite E-Mail weiter an:', FORWARD_TO);
        
        const result = await ses.sendEmail({
            Source: FROM_EMAIL,
            Destination: {
                ToAddresses: [FORWARD_TO]
            },
            Message: {
                Subject: {
                    Data: forwardedSubject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: buildForwardedEmailHtml(emailParts, rawEmail, source, destination),
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: buildForwardedEmailText(emailParts, rawEmail, source, destination),
                        Charset: 'UTF-8'
                    }
                }
            },
            ReplyToAddresses: [emailParts.from || source]
        }).promise();
        
        console.log('✅ E-Mail erfolgreich weitergeleitet:', result.MessageId);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                messageId: result.MessageId,
                forwardedTo: FORWARD_TO,
                originalMessageId: messageId
            })
        };
        
    } catch (error) {
        console.error('❌ Fehler beim Weiterleiten der E-Mail:', error);
        console.error('Error Stack:', error.stack);
        
        // Fehler nicht werfen, damit Lambda nicht als fehlgeschlagen markiert wird
        // AWS kann die E-Mail sonst als nicht zugestellbar markieren
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: false,
                error: error.message,
                note: 'E-Mail wurde in S3 gespeichert, Weiterleitung fehlgeschlagen'
            })
        };
    }
};

/**
 * E-Mail parsen (einfache Implementierung)
 */
function parseEmail(rawEmail) {
    const lines = rawEmail.split('\n');
    let subject = '';
    let from = '';
    let to = '';
    let date = '';
    let body = '';
    let inHeaders = true;
    let headerEnd = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Header-Bereich
        if (inHeaders && !headerEnd) {
            if (line.trim() === '') {
                headerEnd = true;
                inHeaders = false;
                continue;
            }
            
            const lowerLine = line.toLowerCase();
            if (lowerLine.startsWith('subject:')) {
                subject = line.substring(8).trim();
                // Remove "=?UTF-8?B?" encoding if present
                subject = subject.replace(/=\?UTF-8\?B\?/gi, '').replace(/\?=/g, '');
            } else if (lowerLine.startsWith('from:')) {
                from = line.substring(5).trim();
                // Extract email from "Name <email@domain.com>"
                const emailMatch = from.match(/<([^>]+)>/);
                if (emailMatch) {
                    from = emailMatch[1];
                }
            } else if (lowerLine.startsWith('to:')) {
                to = line.substring(3).trim();
            } else if (lowerLine.startsWith('date:')) {
                date = line.substring(5).trim();
            }
        } else {
            // Body-Bereich
            body += line + '\n';
        }
    }
    
    return {
        subject: decodeHeader(subject),
        from: from || 'unknown',
        to: to || 'unknown',
        date: date || new Date().toISOString(),
        body: body.trim()
    };
}

/**
 * Header dekodieren (einfache Implementierung)
 */
function decodeHeader(header) {
    if (!header) return '';
    
    // Base64 dekodieren wenn vorhanden
    try {
        if (header.includes('=?UTF-8?B?')) {
            const base64Part = header.match(/=\?UTF-8\?B\?([^?]+)\?=/);
            if (base64Part) {
                return Buffer.from(base64Part[1], 'base64').toString('utf-8');
            }
        }
    } catch (e) {
        // Ignore decoding errors
    }
    
    return header;
}

/**
 * HTML-Version der weitergeleiteten E-Mail erstellen
 */
function buildForwardedEmailHtml(emailParts, rawEmail, originalFrom, originalTo) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .forwarded-header { background: #f0f0f0; padding: 15px; border-left: 4px solid #007bff; margin-bottom: 20px; }
        .forwarded-header h3 { margin: 0 0 10px 0; color: #007bff; }
        .forwarded-info { font-size: 0.9em; color: #666; }
        .forwarded-info strong { color: #333; }
        .original-email { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin-top: 20px; }
        .original-email pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <div class="forwarded-header">
        <h3>📧 Weitergeleitete E-Mail</h3>
        <div class="forwarded-info">
            <p><strong>Von:</strong> ${escapeHtml(emailParts.from)}</p>
            <p><strong>An:</strong> ${escapeHtml(originalTo)}</p>
            <p><strong>Datum:</strong> ${escapeHtml(emailParts.date)}</p>
            <p><strong>Betreff:</strong> ${escapeHtml(emailParts.subject || '(Kein Betreff)')}</p>
        </div>
    </div>
    
    <div class="original-email">
        <h4>Original-E-Mail:</h4>
        <pre>${escapeHtml(rawEmail)}</pre>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Text-Version der weitergeleiteten E-Mail erstellen
 */
function buildForwardedEmailText(emailParts, rawEmail, originalFrom, originalTo) {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 WEITERGELEITETE E-MAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Von: ${emailParts.from}
An: ${originalTo}
Datum: ${emailParts.date}
Betreff: ${emailParts.subject || '(Kein Betreff)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORIGINAL-E-MAIL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${rawEmail}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
}

/**
 * HTML-Escape
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
    return text.replace(/[&<>"']/g, m => map[m]);
}

