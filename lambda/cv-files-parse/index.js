/**
 * AWS Lambda: CV Files Parse
 * Migrated from Netlify Function
 * Parst CV (PDF/DOCX) und Zeugnisse zu strukturierten Daten
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { apiKey, files } = body;

        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: false, error: 'Ungültiger API Key' })
            };
        }

        if (!files || !Array.isArray(files) || files.length === 0) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: false, error: 'Keine Dateien übermittelt' })
            };
        }

        // Extrahiere Text aus Base64-Dateien
        let combinedText = '';
        
        for (const file of files) {
            if (file.content) {
                try {
                    const decodedContent = Buffer.from(file.content, 'base64').toString('utf-8');
                    combinedText += `\n\n=== Datei: ${file.name} ===\n${decodedContent}`;
                } catch (e) {
                    console.warn(`Fehler beim Dekodieren von ${file.name}:`, e);
                }
            }
        }

        // Wenn kein Text extrahiert werden konnte
        if (!combinedText.trim()) {
            const parsedData = {
                personalInfo: { name: 'Aus Datei extrahiert', email: null, phone: null },
                experience: [],
                education: [],
                skills: { technical: [], languages: [], soft: [] },
                certificates: []
            };
            
            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    success: true,
                    data: parsedData,
                    message: 'Dateien empfangen, aber Text-Extraktion nicht möglich (PDF/DOCX Parsing erforderlich)'
                })
            };
        }

        // Verwende OpenAI für Text-Extraktion
        const parsePrompt = `Extrahiere strukturierte Informationen aus diesem Lebenslauf-Text. 
Antworte NUR als valides JSON in diesem exakten Format:
{
    "personalInfo": {
        "name": "Vollständiger Name",
        "email": "E-Mail oder null",
        "phone": "Telefon oder null",
        "address": "Adresse oder null",
        "linkedin": "LinkedIn URL oder null",
        "website": "Website URL oder null"
    },
    "experience": [
        {
            "title": "Jobtitel",
            "company": "Firmenname",
            "period": "Zeitraum",
            "description": "Beschreibung",
            "achievements": ["Erfolg 1", "Erfolg 2"]
        }
    ],
    "education": [
        {
            "degree": "Abschluss",
            "institution": "Institution",
            "period": "Zeitraum",
            "description": "Beschreibung"
        }
    ],
    "skills": {
        "technical": ["Skill 1", "Skill 2"],
        "languages": [{"language": "Sprache", "level": "Niveau"}],
        "soft": ["Soft Skill 1"]
    },
    "certificates": [
        {
            "name": "Zertifikat Name",
            "issuer": "Aussteller",
            "date": "Datum"
        }
    ]
}

Lebenslauf-Text:
${combinedText.substring(0, 15000)}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für Lebenslauf-Parsing. Du extrahierst präzise strukturierte Informationen aus Lebensläufen.'
                    },
                    { role: 'user', content: parsePrompt }
                ],
                max_tokens: 2000,
                temperature: 0.1,
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
            const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Konnte JSON nicht parsen');
            }
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
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
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Fehler beim Parsen der Dateien'
            })
        };
    }
};
