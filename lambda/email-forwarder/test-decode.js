/**
 * Test-Script für Quoted-Printable Dekodierung
 */

// Test-Funktion aus index-v3.js
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

// Test-Cases aus dem Beispiel des Benutzers
const testCases = [
    {
        name: "Quoted-Printable Body",
        input: "Gr=C3=BCezi Herr Weiss\n\nDanke f=C3=BCr Ihr Vertrauen und Ihre Bewerbung auf LinkedIn. Gerne m=C3=B6=\nchte ich\nSie im Rahmen eines Gespr=C3=A4ches, via google-Meet, einladen.",
        expected: "Grüezi Herr Weiss\n\nDanke für Ihr Vertrauen und Ihre Bewerbung auf LinkedIn. Gerne möchte ich\nSie im Rahmen eines Gespräches, via google-Meet, einladen."
    },
    {
        name: "Quoted-Printable mit Soft-Line-Break",
        input: "Gerne m=C3=B6=\nchte ich",
        expected: "Gerne möchte ich"
    },
    {
        name: "Quoted-Printable Header",
        input: "=?UTF-8?Q?Gr=C3=BCezi?=",
        expected: "Grüezi",
        useDecodeHeader: true
    },
    {
        name: "Komplexer Body",
        input: "Es w=C3=A4re zudem vorteilhaft, wenn Sie mir vorweg Ihre Zeugnisse und Dipl=\nome\nals PDF zusenden k=C3=B6nnten.",
        expected: "Es wäre zudem vorteilhaft, wenn Sie mir vorweg Ihre Zeugnisse und Diplome\nals PDF zusenden könnten."
    }
];

console.log("🧪 Teste Quoted-Printable Dekodierung...\n");

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    const result = testCase.useDecodeHeader ? decodeHeader(testCase.input) : decodeQuotedPrintable(testCase.input);
    const success = result === testCase.expected;
    
    if (success) {
        passed++;
        console.log(`✅ Test ${index + 1}: ${testCase.name}`);
    } else {
        failed++;
        console.log(`❌ Test ${index + 1}: ${testCase.name}`);
        console.log(`   Erwartet: ${testCase.expected}`);
        console.log(`   Erhalten: ${result}`);
    }
});

console.log(`\n📊 Ergebnis: ${passed} bestanden, ${failed} fehlgeschlagen`);

if (failed === 0) {
    console.log("✅ Alle Tests bestanden!");
    process.exit(0);
} else {
    console.log("❌ Einige Tests fehlgeschlagen!");
    process.exit(1);
}

