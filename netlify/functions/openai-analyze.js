exports.handler = async (event, context) => {
    // CORS Headers für alle Requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Nur POST requests erlauben
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { apiKey, prompt, model = 'gpt-5.2', max_tokens = 1000, temperature = 0.3 } = JSON.parse(event.body);
        
        if (!apiKey || !prompt) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'API Key und Prompt sind erforderlich' })
            };
        }

        // OpenAI API Call für Analyse
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für Stellenausschreibungen und HR-Analyse. Analysiere Stellenausschreibungen und extrahiere die wichtigsten Anforderungen.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: max_tokens,
                temperature: temperature
            })
        });

        if (openaiResponse.ok) {
            const data = await openaiResponse.json();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    data: data
                })
            };
        } else {
            const errorData = await openaiResponse.json();
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: errorData.error?.message || 'API Fehler'
                })
            };
        }

    } catch (error) {
        console.error('OpenAI Analyze Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: `Netzwerkfehler: ${error.message}` 
            })
        };
    }
};
