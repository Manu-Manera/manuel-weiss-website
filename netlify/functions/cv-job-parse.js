// CV Tailor - Job Posting Parse
// Parst Stellenausschreibung (URL, PDF oder Text)

// Ensure fetch is available
let fetch;
if (typeof globalThis.fetch === 'function') {
    fetch = globalThis.fetch;
} else {
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
        const { apiKey, jobInput, inputType } = body;

        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Ungültiger API Key' })
            };
        }

        if (!jobInput || !jobInput.trim()) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Keine Stellenausschreibung übermittelt' })
            };
        }

        let jobText = jobInput;

        // Wenn URL: Text extrahieren (vereinfacht, in Produktion mit Puppeteer/Cheerio)
        if (inputType === 'url') {
            // Hier würde normalerweise die URL gecrawlt werden
            // Für jetzt: Annahme dass jobInput bereits der Text ist
        }

        // Parse mit GPT-5.2 (optimiert nach Prompting Guide)
        const parsePrompt = `<extraction_spec>
Extrahiere strukturierte Daten aus dieser Stellenausschreibung.

SCHEMA (strikt einhalten):
{
    "company": string,
    "position": string,
    "location": string | null,
    "requirements": {
        "must_have": [string],
        "nice_to_have": [string]
    },
    "responsibilities": [string],
    "keywords": [string],
    "industry": string | null,
    "experience_level": string | null
}

REGELN:
- Wenn Feld nicht vorhanden → null setzen
- Keywords: Alle technischen Begriffe, Tools, Methoden extrahieren
- Requirements trennen in "must_have" vs "nice_to_have"
- Re-scan vor Finalisierung auf verpasste Keywords
</extraction_spec>

STELLENAUSSCHREIBUNG:
${jobText}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5.2',
                messages: [
                    {
                        role: 'system',
                        content: `Du bist ein präziser Datenextraktions-Assistent für Stellenausschreibungen.

<output_verbosity_spec>
- Antworte NUR mit validem JSON
- Keine Erklärungen, kein Markdown
</output_verbosity_spec>

<extraction_completeness>
- Extrahiere ALLE relevanten Keywords und Anforderungen
- Unterscheide klar zwischen Muss- und Kann-Anforderungen
- Bei Unsicherheit über Feldwert → null setzen
</extraction_completeness>`
                    },
                    {
                        role: 'user',
                        content: parsePrompt
                    }
                ],
                reasoning_effort: 'low',
                max_completion_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API Fehler');
        }

        const data = await response.json();
        let jobData;
        
        try {
            jobData = JSON.parse(data.choices[0].message.content);
        } catch (parseError) {
            // Fallback: Versuche JSON aus Text zu extrahieren
            const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jobData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Konnte JSON nicht parsen');
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                jobData: jobData,
                model: data.model,
                usage: data.usage
            })
        };

    } catch (error) {
        console.error('Job Parse Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Event:', JSON.stringify(event, null, 2));
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Unbekannter Fehler beim Parsen der Stellenausschreibung',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

