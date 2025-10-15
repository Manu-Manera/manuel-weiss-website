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
        const { apiKey } = JSON.parse(event.body);
        
        if (!apiKey) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'API Key fehlt' })
            };
        }

        // OpenAI API Test Call
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: 'Test'
                    }
                ],
                max_tokens: 5
            })
        });

        if (openaiResponse.ok) {
            const data = await openaiResponse.json();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'OpenAI API Verbindung erfolgreich!',
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
        console.error('OpenAI Test Error:', error);
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
