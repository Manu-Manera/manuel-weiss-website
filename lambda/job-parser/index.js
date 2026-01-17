/**
 * AWS Lambda: Job Parser
 * Migrated from Netlify Function
 * Extrahiert Stellenanzeigen-Daten aus URLs oder Text
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Bekannte Job-Portal Patterns
const JOB_PORTALS = {
    stepstone: {
        pattern: /stepstone\.(de|at|ch)/i,
        selectors: { title: ['h1'], company: ['.company'], location: ['.location'] }
    },
    indeed: {
        pattern: /indeed\.(de|com|at|ch)/i,
        selectors: { title: ['h1'], company: ['.company'], location: ['.location'] }
    },
    linkedin: {
        pattern: /linkedin\.com/i,
        selectors: { title: ['h1'], company: ['.company'], location: ['.location'] }
    },
    xing: {
        pattern: /xing\.(com|de)/i,
        selectors: { title: ['h1'], company: ['.company'], location: ['.location'] }
    },
    generic: {
        pattern: /.*/,
        selectors: { title: ['h1'], company: ['.company'], location: ['.location'] }
    }
};

// Keywords für Skill-Erkennung
const SKILL_KEYWORDS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', '.NET', 'Laravel',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'NoSQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible',
    'Git', 'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban', 'DevOps', 'TDD',
    'Teamfähigkeit', 'Kommunikationsstärke', 'Eigeninitiative', 'Flexibilität',
    'Englisch', 'Deutsch', 'Französisch', 'B1', 'B2', 'C1', 'C2',
    'Bachelor', 'Master', 'Diplom', 'Berufserfahrung', 'Senior', 'Junior', 'Lead',
    'SAP', 'ERP', 'CRM', 'Excel', 'PowerPoint', 'MS Office', 'Salesforce',
    'Recruiting', 'Personalmanagement', 'HR', 'Projektmanagement', 'PMP', 'PRINCE2'
];

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { url, text, type } = JSON.parse(event.body || '{}');

        let result;

        if (type === 'url' && url) {
            result = await parseJobUrl(url);
        } else if (type === 'text' && text) {
            result = parseJobText(text);
        } else {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'URL oder Text erforderlich' })
            };
        }

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, data: result })
        };

    } catch (error) {
        console.error('Job Parser Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Fehler beim Parsen', message: error.message })
        };
    }
};

async function parseJobUrl(url) {
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error('Ungültige URL');
    }

    const portal = identifyPortal(url);
    
    let html;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        html = await response.text();
    } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return extractFromUrl(url, portal);
    }

    const extracted = extractFromHtml(html);
    extracted.url = url;
    extracted.portal = portal.name || 'unknown';
    
    return extracted;
}

function identifyPortal(url) {
    for (const [name, config] of Object.entries(JOB_PORTALS)) {
        if (config.pattern.test(url)) {
            return { name, ...config };
        }
    }
    return { name: 'generic', ...JOB_PORTALS.generic };
}

function extractFromHtml(html) {
    const result = {
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: [],
        salary: '',
        employmentType: ''
    };

    const cleanHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

    // Extract title
    const titleMatch = cleanHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                       cleanHtml.match(/<title>([^<|]+)/i);
    if (titleMatch) result.title = cleanText(titleMatch[1]);

    // Extract company
    const companyMatch = cleanHtml.match(/class="[^"]*company[^"]*"[^>]*>([^<]+)/i) ||
                        cleanHtml.match(/(?:bei|für|company:|firma:)\s*([A-Za-zäöüÄÖÜß\s&.-]+(?:GmbH|AG|SE)?)/i);
    if (companyMatch) result.company = cleanText(companyMatch[1]);

    // Extract location
    const locationMatch = cleanHtml.match(/class="[^"]*location[^"]*"[^>]*>([^<]+)/i) ||
                         cleanHtml.match(/(Berlin|München|Hamburg|Frankfurt|Köln|Stuttgart|Wien|Zürich|Remote)/i);
    if (locationMatch) result.location = cleanText(locationMatch[1]);

    // Extract description (first 2000 chars)
    const descMatch = cleanHtml.match(/class="[^"]*(?:description|job-description)[^"]*"[^>]*>([\s\S]{100,2000}?)<\/div>/i);
    if (descMatch) result.description = stripHtml(descMatch[1]).substring(0, 2000);

    // Extract skills
    result.requirements = extractSkills(cleanHtml);

    // Extract employment type
    const typeMatch = cleanHtml.match(/(Vollzeit|Teilzeit|Full-?time|Part-?time|Festanstellung|Remote)/i);
    if (typeMatch) result.employmentType = typeMatch[1];

    return result;
}

function extractSkills(html) {
    const foundSkills = new Set();
    const textContent = stripHtml(html).toLowerCase();

    for (const skill of SKILL_KEYWORDS) {
        const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
        if (regex.test(textContent)) {
            foundSkills.add(skill);
        }
    }

    return Array.from(foundSkills).slice(0, 12);
}

function stripHtml(html) {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')
        .replace(/\(m\/w\/d\)|\(w\/m\/d\)/gi, '')
        .trim();
}

function extractFromUrl(url, portal) {
    const result = {
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: [],
        url: url,
        portal: portal.name,
        fallback: true
    };

    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        const pathParts = pathname.split('/').filter(p => p.length > 3);
        for (const part of pathParts) {
            const decoded = decodeURIComponent(part).replace(/-/g, ' ');
            if (decoded.length > 10 && decoded.length < 100 && !decoded.match(/^\d+$/)) {
                result.title = decoded;
                break;
            }
        }
    } catch (e) {
        console.error('URL extraction error:', e);
    }

    return result;
}

function parseJobText(text) {
    const result = {
        title: '',
        company: '',
        location: '',
        description: text,
        requirements: [],
        source: 'text'
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.length < 100 && /developer|manager|engineer|berater|consultant|spezialist|leiter/i.test(firstLine)) {
            result.title = cleanText(firstLine);
        }
    }

    const companyMatch = text.match(/(?:bei|für|firma:|unternehmen:)\s*([A-Za-zäöüÄÖÜß\s&.-]+(?:GmbH|AG)?)/i);
    if (companyMatch) result.company = cleanText(companyMatch[1]);

    const locationMatch = text.match(/(?:standort|location|ort:)\s*([A-Za-zäöüÄÖÜß\s,-]+)/i);
    if (locationMatch) result.location = cleanText(locationMatch[1]);

    result.requirements = extractSkills(text);

    return result;
}
