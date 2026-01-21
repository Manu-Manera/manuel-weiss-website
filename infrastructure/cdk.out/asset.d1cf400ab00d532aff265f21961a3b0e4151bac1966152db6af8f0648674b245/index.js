/**
 * AWS Lambda: CV Target (Targeted CV Generation)
 * Migrated from Netlify Function
 * Generiert einen job-spezifischen CV
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
        const { apiKey, baselineCV, jobData } = body;

        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: false, error: 'Ungültiger API Key' })
            };
        }

        if (!baselineCV || !baselineCV.trim()) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: false, error: 'Kein Baseline-CV übermittelt' })
            };
        }

        if (!jobData || !jobData.company || !jobData.position) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ success: false, error: 'Unvollständige Job-Daten übermittelt' })
            };
        }

        const prompt = `Passe diesen Lebenslauf präzise an die Stellenausschreibung an.

BASELINE CV:
${baselineCV}

STELLENAUSSCHREIBUNG:
Firma: ${jobData.company}
Position: ${jobData.position}
Anforderungen: ${JSON.stringify(jobData.requirements, null, 2)}
Schlüsselwörter: ${jobData.keywords?.join(', ') || ''}

WICHTIGE REGELN:
1. Erfinde NICHTS - nur vorhandene Informationen umformulieren und betonen
2. Hebe relevante Erfahrungen und Skills hervor
3. Verwende Keywords aus der Stellenausschreibung natürlich
4. Betone Erfolge, die zu den Anforderungen passen
5. Behalte die gleiche Struktur wie der Baseline-CV
6. Maximal 2 Seiten
7. Professioneller, überzeugender Ton

Erstelle den angepassten CV im gleichen Format wie der Baseline-CV.`;

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
                        content: 'Du bist ein Experte für zielgerichtete Lebensläufe. Du passt CVs präzise an Stellenausschreibungen an, ohne Informationen zu erfinden.'
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 3000,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API Fehler');
        }

        const data = await response.json();
        const targetedCV = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                targetedCV: targetedCV,
                model: data.model,
                usage: data.usage
            })
        };

    } catch (error) {
        console.error('Targeted CV Generation Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Fehler bei der Targeted-CV Generierung'
            })
        };
    }
};
