// CV Tailor - Files Parse Function
// Parst CV (PDF/DOCX) und Zeugnisse (PDF) zu strukturierten Daten

// Ensure fetch is available (Node.js 18+ has native fetch)
let fetch;
if (typeof globalThis.fetch === 'function') {
    fetch = globalThis.fetch;
} else {
    // Fallback for older Node.js versions
    fetch = require('node-fetch');
}

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
        const body = JSON.parse(event.body);
        const { apiKey, files } = body;

        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Ungültiger API Key' })
            };
        }

        if (!files || !Array.isArray(files) || files.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Keine Dateien übermittelt' })
            };
        }

        // Extrahiere Text aus Base64-Dateien
        let combinedText = '';
        
        for (const file of files) {
            if (file.content) {
                try {
                    // Decode Base64
                    const decodedContent = Buffer.from(file.content, 'base64').toString('utf-8');
                    combinedText += `\n\n=== Datei: ${file.name} ===\n${decodedContent}`;
                } catch (e) {
                    console.warn(`Fehler beim Dekodieren von ${file.name}:`, e);
                    // Für PDF/DOCX würde hier spezialisierte Parsing-Logik kommen
                }
            }
        }

        // Wenn kein Text extrahiert werden konnte, verwende Mock-Daten
        if (!combinedText.trim()) {
            const parsedData = {
                personalInfo: {
                    name: 'Aus Datei extrahiert',
                    email: null,
                    phone: null,
                    address: null,
                    linkedin: null,
                    website: null
                },
                experience: [],
                education: [],
                skills: {
                    technical: [],
                    languages: [],
                    soft: []
                },
                certificates: []
            };
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: parsedData,
                    message: 'Dateien empfangen, aber Text-Extraktion nicht möglich (PDF/DOCX Parsing erforderlich)'
                })
            };
        }

        // Verwende GPT-5.2 für Text-Extraktion (optimiert nach Prompting Guide)
        const parsePrompt = `<extraction_spec>
Extrahiere strukturierte Daten aus diesem Lebenslauf.

SCHEMA (strikt einhalten, keine extra Felder):
{
    "personalInfo": {
        "name": string,
        "email": string | null,
        "phone": string | null,
        "address": string | null,
        "linkedin": string | null,
        "website": string | null
    },
    "experience": [
        {
            "title": string,
            "company": string,
            "period": string,
            "description": string (VOLLSTÄNDIG mit \\n),
            "achievements": [string]
        }
    ],
    "education": [
        {
            "degree": string,
            "institution": string,
            "period": string | null,
            "description": string | null
        }
    ],
    "skills": {
        "technical": [string],
        "languages": [{"language": string, "level": string}],
        "soft": [string]
    },
    "certificates": [
        {
            "name": string,
            "issuer": string | null,
            "date": string | null
        }
    ]
}

KRITISCHE REGELN:
- Wenn Feld nicht vorhanden → null setzen (nicht raten)
- description bei experience: EXAKT KOPIEREN - jeder Stichpunkt
- achievements: Alle messbaren Erfolge extrahieren
- Re-scan vor Finalisierung auf verpasste Informationen
</extraction_spec>

LEBENSLAUF-TEXT:
${combinedText.substring(0, 50000)}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5.2',
                reasoning_effort: 'low',
                messages: [
                    {
                        role: 'system',
                        content: `Du bist ein präziser Datenextraktions-Assistent für Lebensläufe.

<output_verbosity_spec>
- Antworte NUR mit validem JSON
- Keine Erklärungen, kein Markdown
- Exakte Reproduktion aller Beschreibungen
</output_verbosity_spec>

<extraction_completeness>
- Extrahiere JEDEN Stichpunkt aus Beschreibungen
- Bei Unsicherheit über Feldwert → null setzen
- Vor Finalisierung: Re-scan auf verpasste Informationen
</extraction_completeness>`
                    },
                    {
                        role: 'user',
                        content: parsePrompt
                    }
                ],
                max_completion_tokens: 16000,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API Fehler');
        }

        const data = await response.json();
        let parsedData;
        
        try {
            parsedData = JSON.parse(data.choices[0].message.content);
        } catch (parseError) {
            // Fallback: Versuche JSON aus Text zu extrahieren
            const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Konnte JSON nicht parsen');
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: parsedData,
                message: 'Dateien erfolgreich geparst',
                model: data.model,
                usage: data.usage
            })
        };

    } catch (error) {
        console.error('CV Parse Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Event:', JSON.stringify(event, null, 2));
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Unbekannter Fehler beim Parsen der Dateien',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

