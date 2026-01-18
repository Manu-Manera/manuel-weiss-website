// CV Tailor - Baseline CV Generation
// Generiert einen modernen, internationalen Baseline-CV

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
        const { apiKey, cvData } = body;

        if (!apiKey || !apiKey.startsWith('sk-')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Ungültiger API Key' })
            };
        }

        if (!cvData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Keine CV-Daten übermittelt' })
            };
        }

        // Generiere Baseline-CV mit GPT-5.2 (optimiert nach Prompting Guide)
        const prompt = `Erstelle einen professionellen Lebenslauf basierend auf diesen Daten:

${JSON.stringify(cvData, null, 2)}

<output_verbosity_spec>
- Strukturierter Text mit klaren Abschnitten
- Maximal 2 Seiten Inhalt
- Konkrete Bullet Points für Erfolge (quantifiziert wo möglich)
- Professioneller, überzeugender Ton
</output_verbosity_spec>

<design_and_scope_constraints>
- EXAKT diese Struktur verwenden:
  1. PERSONAL INFORMATION
  2. PROFESSIONAL SUMMARY (2-3 prägnante Sätze)
  3. WORK EXPERIENCE (chronologisch, Bullet Points für Erfolge)
  4. EDUCATION
  5. SKILLS (kategorisiert)
  6. CERTIFICATIONS (falls vorhanden)
- Keine erfundenen Informationen
- Vorhandene Daten optimal präsentieren
</design_and_scope_constraints>`;

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
                        content: `Du bist ein Experte für professionelle Lebensläufe.

<core_mission>
Erstelle moderne, strukturierte und überzeugende CVs.
Fokus auf messbare Erfolge und konkrete Leistungen.
Professioneller Ton ohne Übertreibungen.
</core_mission>

<factuality>
- NIEMALS Informationen erfinden
- Nur vorhandene Daten verwenden und optimal präsentieren
- Bei fehlenden Daten: Abschnitt weglassen oder "Auf Anfrage" schreiben
</factuality>`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                reasoning_effort: 'medium',
                max_completion_tokens: 8000
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
        console.error('Error stack:', error.stack);
        console.error('Event:', JSON.stringify(event, null, 2));
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message || 'Unbekannter Fehler bei der Baseline-CV Generierung',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

