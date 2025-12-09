/**
 * AWS SES Email Forwarder Lambda Function (AWS SDK v3)
 * Liest eingehende E-Mails aus S3 und leitet sie weiter
 */

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { Readable } = require('stream');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-central-1' });
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'eu-central-1' });

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
        
        // Normalisiere source und destination (können Arrays sein)
        const sourceEmail = Array.isArray(source) ? source[0] : source;
        const destinationEmail = Array.isArray(destination) ? destination[0] : destination;
        
        console.log('📬 E-Mail empfangen:', {
            messageId,
            from: sourceEmail,
            to: destinationEmail,
            timestamp,
            action: action.type,
            s3Action: action.s3Action
        });
        
        // Bestimme S3 Bucket und Key
        let s3Bucket, s3Key;
        
        if (action.type === 'S3' && action.s3Action) {
            // E-Mail wurde über S3 Action gespeichert
            s3Bucket = action.s3Action.bucketName;
            s3Key = action.s3Action.objectKey;
            console.log('📦 S3 Action gefunden:', { bucket: s3Bucket, key: s3Key });
        } else {
            // Lambda wurde direkt aufgerufen, E-Mail sollte in S3 sein
            // Verwende den Standard-Bucket und konstruiere den Key aus messageId
            s3Bucket = process.env.EMAIL_BUCKET || 'manu-email-storage-038333965110';
            // Der Key ist normalerweise: emails/{messageId}
            s3Key = `emails/${messageId}`;
            console.log('📦 Keine S3 Action, versuche E-Mail aus S3 zu laden:', { bucket: s3Bucket, key: s3Key });
        }
        
        console.log('📦 Lade E-Mail aus S3:', { bucket: s3Bucket, key: s3Key });
        
        // E-Mail aus S3 laden (AWS SDK v3)
        const getObjectCommand = new GetObjectCommand({
            Bucket: s3Bucket,
            Key: s3Key
        });
        
        const emailObject = await s3Client.send(getObjectCommand);
        
        // Stream zu String konvertieren
        const chunks = [];
        for await (const chunk of emailObject.Body) {
            chunks.push(chunk);
        }
        const rawEmail = Buffer.concat(chunks).toString('utf-8');
        
        console.log('✅ E-Mail geladen, Größe:', rawEmail.length, 'bytes');
        
        // E-Mail parsen (einfache Extraktion)
        const emailParts = parseEmail(rawEmail);
        
        // Betreff mit Hinweis versehen
        const forwardedSubject = emailParts.subject 
            ? `[Weitergeleitet] ${emailParts.subject}`
            : `[Weitergeleitet] E-Mail von ${emailParts.from}`;
        
        // E-Mail weiterleiten (AWS SDK v3)
        console.log('📤 Leite E-Mail weiter an:', FORWARD_TO);
        
        const sendEmailCommand = new SendEmailCommand({
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
                        Data: buildForwardedEmailHtml(emailParts, rawEmail, sourceEmail, destinationEmail),
                        Charset: 'UTF-8'
                    },
                    Text: {
                        Data: buildForwardedEmailText(emailParts, rawEmail, sourceEmail, destinationEmail),
                        Charset: 'UTF-8'
                    }
                }
            },
            ReplyToAddresses: [emailParts.from || sourceEmail]
        });
        
        const result = await sesClient.send(sendEmailCommand);
        
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
    let bodyStartIndex = -1;
    
    // Finde das Ende der Header (erste leere Zeile)
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Header-Bereich
        if (inHeaders && !headerEnd) {
            if (line.trim() === '') {
                headerEnd = true;
                inHeaders = false;
                bodyStartIndex = i + 1;
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
        }
    }
    
    // Extrahiere Body ab der ersten Zeile nach den Headern
    if (bodyStartIndex >= 0) {
        const bodyLines = [];
        
        for (let i = bodyStartIndex; i < lines.length; i++) {
            const line = lines[i];
            
            // Überspringe MIME-Boundaries
            if (line.trim().startsWith('--') && (line.includes('boundary') || line.trim() === '--')) {
                continue;
            }
            
            // Stoppe bei weiteren Header-ähnlichen Zeilen, die nicht zum Body gehören
            // (außer Content-Type/Content-Transfer-Encoding, die direkt nach Headern kommen können)
            if (line.match(/^[A-Z][a-zA-Z0-9-]+:/) && 
                !line.toLowerCase().startsWith('content-transfer-encoding:') &&
                !line.toLowerCase().startsWith('content-type:') &&
                !line.toLowerCase().startsWith('mime-version:')) {
                // Möglicherweise ein weiterer Header-Block - nehmen wir den ersten Body-Teil
                if (bodyLines.length > 0) {
                    break;
                }
                continue;
            }
            
            bodyLines.push(line);
        }
        
        body = bodyLines.join('\n');
    }
    
    // Bereinige Body: Entferne MIME-Header und Base64-Encodings
    body = body
        // Entferne Content-Type/Transfer-Encoding Header, die im Body stehen könnten
        .replace(/^Content-Type:\s*[^\n]*$/gmi, '')
        .replace(/^Content-Transfer-Encoding:\s*[^\n]*$/gmi, '')
        .replace(/^Mime-Version:\s*[^\n]*$/gmi, '')
        // Entferne MIME boundaries
        .replace(/^--[a-zA-Z0-9_-]+$/gm, '')
        .replace(/^--$/gm, '')
        // Entferne leere Zeilen am Anfang/Ende
        .split('\n')
        .map(line => line.trim())
        .filter((line, index, arr) => {
            // Entferne Base64-ähnliche Zeilen (lange Zeilen ohne Leerzeichen, nur Base64-Zeichen)
            if (line.length > 60 && !line.includes(' ') && /^[A-Za-z0-9+/=]+$/.test(line)) {
                return false;
            }
            // Entferne leere Zeilen am Anfang
            if (index === 0 && line === '') {
                return false;
            }
            return true;
        })
        .join('\n')
        .trim();
    
    return {
        subject: decodeHeader(subject),
        from: from || 'unknown',
        to: to || 'unknown',
        date: date || new Date().toISOString(),
        body: body
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
    // Bereinige den Body - entferne leere Zeilen am Anfang/Ende
    const cleanBody = emailParts.body.trim();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .forwarded-header { background: #f0f7ff; padding: 15px; border-left: 4px solid #007bff; margin-bottom: 20px; border-radius: 4px; }
        .forwarded-header h3 { margin: 0 0 10px 0; color: #007bff; font-size: 16px; }
        .forwarded-info { font-size: 0.9em; color: #666; }
        .forwarded-info strong { color: #333; }
        .email-body { background: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px; margin-top: 20px; white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
        .email-body:empty::before { content: "(Keine Nachricht)"; color: #999; font-style: italic; }
        .technical-details { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; }
        .technical-details summary { cursor: pointer; color: #666; font-size: 0.85em; user-select: none; }
        .technical-details summary:hover { color: #333; }
        .technical-details pre { background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 0.75em; overflow-x: auto; max-height: 300px; overflow-y: auto; }
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
    
    <div class="email-body">${escapeHtml(cleanBody)}</div>
    
    <details class="technical-details">
        <summary>Technische Details anzeigen</summary>
        <pre>${escapeHtml(rawEmail)}</pre>
    </details>
</body>
</html>
    `.trim();
}

/**
 * Text-Version der weitergeleiteten E-Mail erstellen
 */
function buildForwardedEmailText(emailParts, rawEmail, originalFrom, originalTo) {
    // Bereinige den Body - entferne leere Zeilen am Anfang/Ende
    const cleanBody = emailParts.body.trim();
    
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 WEITERGELEITETE E-MAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Von: ${emailParts.from}
An: ${originalTo}
Datum: ${emailParts.date}
Betreff: ${emailParts.subject || '(Kein Betreff)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NACHRICHT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${cleanBody || '(Keine Nachricht)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
}

/**
 * HTML-Escape
 */
function escapeHtml(text) {
    // Handle null, undefined, arrays, and other non-string types
    if (!text) return '';
    if (Array.isArray(text)) {
        text = text.join(', ');
    }
    if (typeof text !== 'string') {
        text = String(text);
    }
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}


