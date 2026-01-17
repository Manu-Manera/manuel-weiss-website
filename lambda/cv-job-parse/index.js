/**
 * AWS Lambda: CV Job Parse
 * Migrated from Netlify Function
 * Parst Stellenausschreibung (URL, PDF oder Text)
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
        const { apiKey, jobInput, inputType } = body;

        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: false, error: 'Ungültiger API Key' })
            };
        }

        if (!jobInput || !jobInput.trim()) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: false, error: 'Keine Stellenausschreibung übermittelt' })
            };
        }

        let jobText = jobInput;

        // Parse mit OpenAI
        const parsePrompt = `Analysiere diese Stellenausschreibung und extrahiere strukturierte Informationen.

${jobText}

Antworte NUR als valides JSON:
{
    "company": "Firmenname",
    "position": "Stellenbezeichnung",
    "location": "Standort",
    "requirements": {
        "must_have": ["Anforderung 1", "Anforderung 2"],
        "nice_to_have": ["Anforderung 1", "Anforderung 2"]
    },
    "responsibilities": ["Aufgabe 1", "Aufgabe 2"],
    "keywords": ["Keyword 1", "Keyword 2"],
    "industry": "Branche",
    "experience_level": "Erfahrungslevel"
}`;

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
                        content: 'Du bist ein Experte für Stellenausschreibungen. Du extrahierst präzise und strukturiert alle relevanten Informationen.'
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
        let jobData;
        
        try {
            jobData = JSON.parse(data.choices[0].message.content);
        } catch (parseError) {
            const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jobData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Konnte JSON nicht parsen');
            }
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                jobData: jobData,
                model: data.model,
                usage: data.usage
            })
        };

    } catch (error) {
        console.error('Job Parse Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Fehler beim Parsen der Stellenausschreibung'
            })
        };
    }
};
