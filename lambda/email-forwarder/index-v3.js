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
 * E-Mail parsen (erweiterte Implementierung mit quoted-printable Support)
 */
function parseEmail(rawEmail) {
    const lines = rawEmail.split('\n');
    let subject = '';
    let from = '';
    let to = '';
    let date = '';
    let contentType = '';
    let contentTransferEncoding = '';
    let body = '';
    let inHeaders = true;
    let headerEnd = false;
    let currentHeader = '';
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Header-Bereich
        if (inHeaders && !headerEnd) {
            // Fortsetzung von mehrzeiligen Headern (beginnt mit Leerzeichen oder Tab)
            if ((line.startsWith(' ') || line.startsWith('\t')) && currentHeader) {
                line = line.trim();
                if (currentHeader === 'subject') {
                    subject += ' ' + line;
                } else if (currentHeader === 'from') {
                    from += ' ' + line;
                } else if (currentHeader === 'to') {
                    to += ' ' + line;
                } else if (currentHeader === 'date') {
                    date += ' ' + line;
                } else if (currentHeader === 'content-type') {
                    contentType += ' ' + line;
                } else if (currentHeader === 'content-transfer-encoding') {
                    contentTransferEncoding += ' ' + line;
                }
                continue;
            }
            
            if (line.trim() === '') {
                headerEnd = true;
                inHeaders = false;
                currentHeader = '';
                continue;
            }
            
            const lowerLine = line.toLowerCase();
            if (lowerLine.startsWith('subject:')) {
                subject = line.substring(8).trim();
                currentHeader = 'subject';
            } else if (lowerLine.startsWith('from:')) {
                from = line.substring(5).trim();
                currentHeader = 'from';
            } else if (lowerLine.startsWith('to:')) {
                to = line.substring(3).trim();
                currentHeader = 'to';
            } else if (lowerLine.startsWith('date:')) {
                date = line.substring(5).trim();
                currentHeader = 'date';
            } else if (lowerLine.startsWith('content-type:')) {
                contentType = line.substring(14).trim();
                currentHeader = 'content-type';
            } else if (lowerLine.startsWith('content-transfer-encoding:')) {
                contentTransferEncoding = line.substring(27).trim();
                currentHeader = 'content-transfer-encoding';
            } else {
                currentHeader = '';
            }
        } else {
            // Body-Bereich
            body += line + '\n';
        }
    }
    
    // Body dekodieren basierend auf Content-Transfer-Encoding
    const encoding = (contentTransferEncoding || '').toLowerCase();
    if (encoding.includes('quoted-printable')) {
        body = decodeQuotedPrintable(body);
    } else if (encoding.includes('base64')) {
        try {
            body = Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf-8');
        } catch (e) {
            console.log('⚠️ Base64 Dekodierung fehlgeschlagen:', e.message);
        }
    }
    
    // Subject dekodieren
    subject = decodeHeader(subject);
    
    // From dekodieren
    from = decodeHeader(from);
    // Extract email from "Name <email@domain.com>"
    const emailMatch = from.match(/<([^>]+)>/);
    if (emailMatch) {
        from = emailMatch[1];
    }
    
    return {
        subject: subject,
        from: from || 'unknown',
        to: to || 'unknown',
        date: date || new Date().toISOString(),
        body: body.trim()
    };
}

/**
 * Header dekodieren (erweiterte Implementierung)
 */
function decodeHeader(header) {
    if (!header) return '';
    
    // Entferne Leerzeichen zwischen kodierten Teilen
    header = header.replace(/\s*=\?/g, '=?');
    
    // Base64 dekodieren wenn vorhanden (=?UTF-8?B?...?=)
    try {
        if (header.includes('=?UTF-8?B?') || header.includes('=?utf-8?b?')) {
            const base64Parts = header.match(/=\?UTF-8\?B\?([^?]+)\?=/gi);
            if (base64Parts) {
                base64Parts.forEach(part => {
                    const match = part.match(/=\?UTF-8\?B\?([^?]+)\?=/i);
                    if (match) {
                        try {
                            const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
                            header = header.replace(part, decoded);
                        } catch (e) {
                            // Ignore decoding errors
                        }
                    }
                });
            }
        }
        
        // Quoted-Printable dekodieren wenn vorhanden (=?UTF-8?Q?...?=)
        if (header.includes('=?UTF-8?Q?') || header.includes('=?utf-8?q?')) {
            const qpParts = header.match(/=\?UTF-8\?Q\?([^?]+)\?=/gi);
            if (qpParts) {
                qpParts.forEach(part => {
                    const match = part.match(/=\?UTF-8\?Q\?([^?]+)\?=/i);
                    if (match) {
                        try {
                            const decoded = decodeQuotedPrintable(match[1].replace(/_/g, ' '));
                            header = header.replace(part, decoded);
                        } catch (e) {
                            // Ignore decoding errors
                        }
                    }
                });
            }
        }
    } catch (e) {
        // Ignore decoding errors
    }
    
    // Falls noch quoted-printable Zeichen vorhanden sind, dekodieren
    if (header.includes('=') && /=[0-9A-Fa-f]{2}/.test(header)) {
        header = decodeQuotedPrintable(header);
    }
    
    return header;
}

/**
 * Quoted-Printable dekodieren
 * Konvertiert =XX Hex-Codes zu Bytes und dekodiert als UTF-8
 */
function decodeQuotedPrintable(text) {
    if (!text) return '';
    
    // Entferne Soft-Line-Breaks (= am Ende einer Zeile)
    text = text.replace(/=\r?\n/g, '');
    
    // Sammle alle Bytes aus =XX Hex-Codes
    const bytes = [];
    let i = 0;
    
    while (i < text.length) {
        if (text[i] === '=' && i + 2 < text.length) {
            const hex = text.substring(i + 1, i + 3);
            if (/[0-9A-Fa-f]{2}/.test(hex)) {
                bytes.push(parseInt(hex, 16));
                i += 3;
                continue;
            }
        }
        // Normales Zeichen - konvertiere zu UTF-8 Byte
        const charCode = text.charCodeAt(i);
        if (charCode < 128) {
            // ASCII-Zeichen
            bytes.push(charCode);
        } else {
            // Multi-Byte UTF-8 Zeichen - konvertiere zu Bytes
            const utf8Bytes = Buffer.from(text[i], 'utf8');
            for (let j = 0; j < utf8Bytes.length; j++) {
                bytes.push(utf8Bytes[j]);
            }
        }
        i++;
    }
    
    // Konvertiere Bytes zu UTF-8 String
    try {
        return Buffer.from(bytes).toString('utf-8');
    } catch (e) {
        // Fallback: Einfache Ersetzung wenn UTF-8 Dekodierung fehlschlägt
        return text.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
            try {
                return String.fromCharCode(parseInt(hex, 16));
            } catch (e2) {
                return match;
            }
        });
    }
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


