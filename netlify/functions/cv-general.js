// CV Tailor - Baseline CV Generation
// Generiert einen modernen, internationalen Baseline-CV

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
        const { apiKey, cvData } = JSON.parse(event.body);

        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Ungültiger API Key' })
            };
        }

        // Generiere Baseline-CV mit OpenAI GPT-4 Turbo
        const prompt = `Erstelle einen modernen, professionellen Lebenslauf (CV) basierend auf folgenden Daten:

${JSON.stringify(cvData, null, 2)}

Anforderungen:
- Modern-internationales Format
- Saubere Struktur und Lesbarkeit
- Professioneller Ton
- Fokus auf Leistungen und Erfolge
- Maximal 2 Seiten
- Format: Strukturierter Text mit klaren Abschnitten

Antworte als strukturierter Text mit folgenden Abschnitten:
1. PERSONAL INFORMATION
2. PROFESSIONAL SUMMARY
3. WORK EXPERIENCE (mit Bullet Points für Erfolge)
4. EDUCATION
5. SKILLS
6. CERTIFICATIONS (falls vorhanden)

Verwende klare Formatierung mit Absätzen und Bullet Points.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für professionelle Lebensläufe und CVs. Du erstellst moderne, strukturierte und überzeugende Lebensläufe.'
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
        const baselineCV = data.choices[0].message.content;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                baselineCV: baselineCV,
                model: data.model,
                usage: data.usage
            })
        };

    } catch (error) {
        console.error('Baseline CV Generation Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};

