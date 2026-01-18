// CV Tailor - Targeted CV Generation
// Generiert einen job-spezifischen CV basierend auf Baseline-CV und Stellenausschreibung

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
        const { apiKey, baselineCV, jobData } = body;

        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Ungültiger API Key' })
            };
        }

        if (!baselineCV || !baselineCV.trim()) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Kein Baseline-CV übermittelt' })
            };
        }

        if (!jobData || !jobData.company || !jobData.position) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Unvollständige Job-Daten übermittelt' })
            };
        }

        // Generiere Targeted-CV mit OpenAI GPT-4 Turbo
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
                model: 'gpt-5.2',
                reasoning_effort: 'medium',
                verbosity: 'high',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für zielgerichtete Lebensläufe. Du passt CVs präzise an Stellenausschreibungen an, ohne Informationen zu erfinden.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
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
            headers,
            body: JSON.stringify({
                success: true,
                targetedCV: targetedCV,
                model: data.model,
                usage: data.usage
            })
        };

    } catch (error) {
        console.error('Targeted CV Generation Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Event:', JSON.stringify(event, null, 2));
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Unbekannter Fehler bei der Targeted-CV Generierung',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

