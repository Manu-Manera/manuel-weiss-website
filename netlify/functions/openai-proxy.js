// OpenAI Proxy - ECHTE LÖSUNG OHNE FALLBACKS
// Netlify Functions für CORS-Problem

exports.handler = async (event, context) => {
    // CORS Headers für alle Anfragen
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS für CORS Preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Nur POST Requests erlauben
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Method not allowed' 
            })
        };
    }

    try {
        const { apiKey, test } = JSON.parse(event.body);
        
        // API Key validieren
        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Ungültiger API Key' 
                })
            };
        }

        // ECHTE OpenAI API Anfrage
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Test' }],
                max_completion_tokens: 5,
                temperature: 0.1
            })
        });

        if (response.ok) {
            const data = await response.json();
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
            const errorData = await response.json();
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: errorData.error?.message || `HTTP ${response.status}`,
                    status: response.status
                })
            };
        }

    } catch (error) {
        console.error('OpenAI Proxy Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: `Server Error: ${error.message}` 
            })
        };
    }
};
