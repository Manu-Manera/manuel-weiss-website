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
 * E-Mail parsen (vollständige MIME-Implementierung mit multipart-Support)
 */
function parseEmail(rawEmail) {
    // Parse Haupt-Header (vor dem Body)
    const headerEndIndex = rawEmail.indexOf('\n\n');
    const headersText = headerEndIndex >= 0 ? rawEmail.substring(0, headerEndIndex) : rawEmail;
    const bodyText = headerEndIndex >= 0 ? rawEmail.substring(headerEndIndex + 2) : '';
    
    // Parse Header
    const headers = parseHeaders(headersText);
    
    // Subject, From, To, Date dekodieren
    const subject = decodeHeader(headers.subject || '');
    let from = decodeHeader(headers.from || '');
    const emailMatch = from.match(/<([^>]+)>/);
    if (emailMatch) {
        from = emailMatch[1];
    }
    const to = decodeHeader(headers.to || '');
    const date = headers.date || new Date().toISOString();
    
    // Content-Type prüfen
    const contentType = (headers['content-type'] || '').toLowerCase();
    
    let body = '';
    let htmlBody = '';
    
    // Prüfe ob multipart
    if (contentType.includes('multipart/')) {
        // Extrahiere Boundary (case-insensitive, unterstützt verschiedene Formate)
        const contentTypeHeader = headers['content-type'] || '';
        const boundaryMatch = contentTypeHeader.match(/boundary\s*=\s*["']?([^"'\s;]+)/i);
        if (boundaryMatch) {
            let boundary = boundaryMatch[1];
            // Entferne führende/trailing Anführungszeichen falls vorhanden
            boundary = boundary.replace(/^["']|["']$/g, '');
            const parts = parseMultipart(bodyText, boundary);
            
            // Durchsuche alle Parts nach Text und HTML
            for (const part of parts) {
                const partContentType = (part.headers['content-type'] || '').toLowerCase();
                const partEncoding = (part.headers['content-transfer-encoding'] || '').toLowerCase();
                let partBody = part.body;
                
                // Dekodiere Part-Body
                if (partEncoding.includes('quoted-printable')) {
                    partBody = decodeQuotedPrintable(partBody);
                } else if (partEncoding.includes('base64')) {
                    try {
                        partBody = Buffer.from(partBody.replace(/\s/g, ''), 'base64').toString('utf-8');
                    } catch (e) {
                        console.log('⚠️ Base64 Dekodierung fehlgeschlagen:', e.message);
                    }
                }
                
                // HTML bevorzugt, sonst Text
                if (partContentType.includes('text/html') && !htmlBody) {
                    htmlBody = partBody.trim();
                } else if (partContentType.includes('text/plain') && !body) {
                    body = partBody.trim();
                }
            }
        } else {
            console.log('⚠️ Multipart ohne Boundary gefunden');
            body = bodyText.trim();
        }
    } else {
        // Einfache E-Mail ohne multipart
        const encoding = (headers['content-transfer-encoding'] || '').toLowerCase();
        let decodedBody = bodyText;
    
    if (encoding.includes('quoted-printable')) {
            decodedBody = decodeQuotedPrintable(decodedBody);
    } else if (encoding.includes('base64')) {
        try {
                decodedBody = Buffer.from(decodedBody.replace(/\s/g, ''), 'base64').toString('utf-8');
        } catch (e) {
            console.log('⚠️ Base64 Dekodierung fehlgeschlagen:', e.message);
        }
    }
    
        const ct = (headers['content-type'] || '').toLowerCase();
        if (ct.includes('text/html')) {
            htmlBody = decodedBody.trim();
        } else {
            body = decodedBody.trim();
        }
    }
    
    // Verwende HTML wenn verfügbar, sonst Text
    const finalBody = htmlBody || body;
    
    return {
        subject: subject,
        from: from || 'unknown',
        to: to || 'unknown',
        date: date,
        body: finalBody,
        htmlBody: htmlBody || null
    };
}

/**
 * Header aus Text extrahieren
 */
function parseHeaders(headersText) {
    const headers = {};
    const lines = headersText.split(/\r?\n/);
    let currentHeader = null;
    let currentValue = '';
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Fortsetzung eines Headers (beginnt mit Leerzeichen oder Tab)
        if ((line.startsWith(' ') || line.startsWith('\t')) && currentHeader) {
            currentValue += ' ' + line.trim();
            continue;
        }
        
        // Neuer Header
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            // Speichere vorherigen Header
            if (currentHeader) {
                headers[currentHeader.toLowerCase()] = currentValue.trim();
            }
            
            // Neuer Header
            currentHeader = line.substring(0, colonIndex).trim();
            currentValue = line.substring(colonIndex + 1).trim();
        }
    }
    
    // Letzten Header speichern
    if (currentHeader) {
        headers[currentHeader.toLowerCase()] = currentValue.trim();
    }
    
    return headers;
}

/**
 * Multipart-Body in Parts aufteilen
 */
function parseMultipart(bodyText, boundary) {
    const parts = [];
    // Boundary kann mit oder ohne -- beginnen
    const boundaryMarker = boundary.startsWith('--') ? boundary : '--' + boundary;
    
    // Normalisiere Zeilenendings zu \n für konsistente Verarbeitung
    const normalizedBody = bodyText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Teile nach Boundary-Marker auf
    const sections = normalizedBody.split(boundaryMarker);
    
    for (let i = 1; i < sections.length; i++) {
        let section = sections[i];
        
        // Ignoriere End-Marker (-- am Ende)
        section = section.trim();
        if (section === '--' || section === '') {
            continue;
        }
        
        // Entferne führende Zeilenumbrüche
        section = section.replace(/^\n+/, '');
        
        // Trenne Header und Body (suche nach doppeltem Zeilenumbruch)
        const headerEndIndex = section.indexOf('\n\n');
        if (headerEndIndex < 0) {
            // Fallback: Suche nach einfachem Zeilenumbruch nach Header
            const firstLineBreak = section.indexOf('\n');
            if (firstLineBreak < 0) {
                continue;
            }
            // Versuche Header zu erkennen (enthält Doppelpunkt)
            const potentialHeader = section.substring(0, firstLineBreak);
            if (potentialHeader.includes(':')) {
                const partHeadersText = section.substring(0, firstLineBreak);
                const partBody = section.substring(firstLineBreak + 1);
                const partHeaders = parseHeaders(partHeadersText);
                parts.push({
                    headers: partHeaders,
                    body: partBody.trim()
                });
            }
            continue;
        }
        
        const partHeadersText = section.substring(0, headerEndIndex);
        const partBody = section.substring(headerEndIndex + 2);
        
        // Parse Part-Header
        const partHeaders = parseHeaders(partHeadersText);
        
        parts.push({
            headers: partHeaders,
            body: partBody.trim()
        });
    }
    
    return parts;
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
    
    // Entferne Soft-Line-Breaks (= am Ende einer Zeile, gefolgt von CRLF oder LF)
    text = text.replace(/=\r?\n/g, '');
    
    // Ersetze auch einzelnes = am Zeilenende (falls CRLF bereits entfernt wurde)
    text = text.replace(/=\r/g, '');
    
    // Sammle alle Bytes aus =XX Hex-Codes
    const bytes = [];
    let i = 0;
    
    while (i < text.length) {
        if (text[i] === '=' && i + 2 < text.length) {
            const hex = text.substring(i + 1, i + 3);
            if (/[0-9A-Fa-f]{2}/.test(hex)) {
                // Hex-Code zu Byte konvertieren
                bytes.push(parseInt(hex, 16));
                i += 3;
                continue;
            } else if (text[i + 1] === '\r' || text[i + 1] === '\n') {
                // Soft-Line-Break (sollte bereits entfernt sein, aber sicherheitshalber)
                i += 2;
                continue;
            }
        }
        
        // Normales Zeichen - konvertiere zu UTF-8 Byte
        const charCode = text.charCodeAt(i);
        if (charCode < 128) {
            // ASCII-Zeichen (0-127)
            bytes.push(charCode);
        } else {
            // Multi-Byte UTF-8 Zeichen - konvertiere zu Bytes
            // Verwende Buffer.from für korrekte UTF-8-Kodierung
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
        console.log('⚠️ UTF-8 Dekodierung fehlgeschlagen, verwende Fallback:', e.message);
        // Fallback: Einfache Ersetzung wenn UTF-8 Dekodierung fehlschlägt
        return text.replace(/=([0-9A-Fa-f]{2})/g, (match, hex) => {
            try {
                const byte = parseInt(hex, 16);
                // Versuche als einzelnes Byte zu dekodieren
                return String.fromCharCode(byte);
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
    // Verwende HTML-Body wenn verfügbar, sonst Text als HTML
    let emailContent = '';
    if (emailParts.htmlBody) {
        // HTML-Inhalt direkt einbetten (bereits dekodiert)
        emailContent = emailParts.htmlBody;
    } else if (emailParts.body) {
        // Text-Inhalt als HTML formatieren
        emailContent = '<div style="white-space: pre-wrap; word-wrap: break-word; font-family: Arial, sans-serif;">' + 
                      escapeHtml(emailParts.body) + '</div>';
    } else {
        emailContent = '<p style="color: #999; font-style: italic;">(Keine Nachricht)</p>';
    }
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .forwarded-header { background: #f0f7ff; padding: 15px; border-left: 4px solid #007bff; margin-bottom: 20px; border-radius: 4px; }
        .forwarded-header h3 { margin: 0 0 10px 0; color: #007bff; font-size: 16px; }
        .forwarded-info { font-size: 0.9em; color: #666; }
        .forwarded-info strong { color: #333; }
        .email-content { background: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px; margin-top: 20px; }
        .email-content :first-child { margin-top: 0; }
        .email-content :last-child { margin-bottom: 0; }
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
    
    <div class="email-content">
        ${emailContent}
    </div>
</body>
</html>
    `.trim();
}

/**
 * Text-Version der weitergeleiteten E-Mail erstellen
 */
function buildForwardedEmailText(emailParts, rawEmail, originalFrom, originalTo) {
    // Für Text-Version: HTML-Tags entfernen falls HTML-Body vorhanden
    let textBody = emailParts.body;
    if (emailParts.htmlBody && !textBody) {
        // Einfache HTML-Tag-Entfernung für Text-Version
        textBody = emailParts.htmlBody
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    }
    
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

${textBody || '(Keine Nachricht)'}

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

