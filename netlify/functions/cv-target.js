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

        // Generiere Targeted-CV mit GPT-5.2 (optimiert nach Prompting Guide)
        const prompt = `Passe diesen Lebenslauf präzise an die Stellenausschreibung an.

<baseline_cv>
${baselineCV}
</baseline_cv>

<job_posting>
Firma: ${jobData.company}
Position: ${jobData.position}
Anforderungen: ${JSON.stringify(jobData.requirements, null, 2)}
Schlüsselwörter: ${jobData.keywords?.join(', ') || ''}
</job_posting>

<design_and_scope_constraints>
- Implementiere EXAKT und NUR die Anpassung an diese Stelle
- ERFINDE NICHTS - nur vorhandene Informationen umformulieren
- Keywords aus der Stellenausschreibung natürlich einbauen
- Gleiche Struktur wie Baseline-CV beibehalten
- Maximal 2 Seiten
</design_and_scope_constraints>

<optimization_focus>
1. Relevante Erfahrungen und Skills hervorheben
2. Erfolge betonen, die zu Anforderungen passen
3. Professional Summary auf die Stelle zuschneiden
4. Skill-Reihenfolge nach Relevanz für die Stelle
</optimization_focus>`;

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
                        content: `Du bist ein Experte für zielgerichtete Lebensläufe.

<core_mission>
Passe CVs präzise an Stellenausschreibungen an.
Maximiere die Passung zwischen Kandidat und Stelle.
Professioneller, überzeugender Ton.
</core_mission>

<factuality>
- NIEMALS Informationen erfinden oder übertreiben
- Nur vorhandene Daten umformulieren und strategisch betonen
- Bei Lücken: elegant umschreiben, nicht erfinden
</factuality>

<high_risk_self_check>
Vor dem Finalisieren prüfen:
- Wurden ALLE relevanten Keywords natürlich eingebaut?
- Ist NICHTS erfunden oder übertrieben?
- Passt die Länge (max 2 Seiten)?
</high_risk_self_check>`
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

