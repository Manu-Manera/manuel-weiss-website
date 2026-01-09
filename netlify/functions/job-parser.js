/**
 * JOB PARSER - Netlify Function
 * Extrahiert Stellenanzeigen-Daten aus URLs oder Text
 */

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Bekannte Job-Portal Patterns
const JOB_PORTALS = {
    stepstone: {
        pattern: /stepstone\.(de|at|ch)/i,
        selectors: {
            title: ['h1[data-at="header-job-title"]', 'h1.listing-content-provider-title', '.job-title h1', 'h1'],
            company: ['[data-at="header-company-name"]', '.listing-content-provider-company', '.company-name', '[itemprop="hiringOrganization"]'],
            location: ['[data-at="header-job-location"]', '.listing-content-provider-location', '[itemprop="jobLocation"]'],
            description: ['[data-at="job-ad-content"]', '.listing-content-provider-description', '[itemprop="description"]']
        }
    },
    indeed: {
        pattern: /indeed\.(de|com|at|ch)/i,
        selectors: {
            title: ['.jobsearch-JobInfoHeader-title', 'h1.icl-u-xs-mb--xs', '.job-title'],
            company: ['[data-company-name]', '.jobsearch-InlineCompanyRating-companyHeader', '.company'],
            location: ['[data-testid="job-location"]', '.jobsearch-JobInfoHeader-subtitle > div', '.location'],
            description: ['#jobDescriptionText', '.jobsearch-jobDescriptionText']
        }
    },
    linkedin: {
        pattern: /linkedin\.com/i,
        selectors: {
            title: ['.job-details-jobs-unified-top-card__job-title', '.topcard__title', 'h1'],
            company: ['.job-details-jobs-unified-top-card__company-name', '.topcard__org-name-link', '.company-name'],
            location: ['.job-details-jobs-unified-top-card__bullet', '.topcard__flavor--bullet', '.location'],
            description: ['.jobs-description__content', '.description__text', '.job-description']
        }
    },
    xing: {
        pattern: /xing\.(com|de)/i,
        selectors: {
            title: ['h1[data-testid="job-title"]', '.job-posting-title', 'h1'],
            company: ['[data-testid="company-name"]', '.company-name'],
            location: ['[data-testid="location"]', '.job-location'],
            description: ['[data-testid="description"]', '.job-description']
        }
    },
    monster: {
        pattern: /monster\.(de|com)/i,
        selectors: {
            title: ['.job-title', 'h1'],
            company: ['.company-name', '.company'],
            location: ['.job-location', '.location'],
            description: ['.job-description', '.description']
        }
    },
    // Generic fallback
    generic: {
        pattern: /.*/,
        selectors: {
            title: ['h1', '.job-title', '.position-title', '[itemprop="title"]'],
            company: ['.company', '.company-name', '.employer', '[itemprop="hiringOrganization"]'],
            location: ['.location', '.job-location', '[itemprop="jobLocation"]'],
            description: ['.description', '.job-description', '[itemprop="description"]', 'article', 'main']
        }
    }
};

// Keywords für Anforderungs-Erkennung
const SKILL_KEYWORDS = [
    // Programming
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C\\+\\+', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Frameworks
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', '.NET', 'Laravel',
    // Databases
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'NoSQL',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible',
    // Tools
    'Git', 'Jira', 'Confluence', 'Slack', 'Figma', 'Sketch',
    // Methodologies
    'Agile', 'Scrum', 'Kanban', 'DevOps', 'TDD', 'BDD',
    // Soft Skills (German)
    'Teamfähigkeit', 'Kommunikationsstärke', 'Eigeninitiative', 'Flexibilität', 'Belastbarkeit',
    // Languages
    'Englisch', 'Deutsch', 'Französisch', 'Spanisch', 'B1', 'B2', 'C1', 'C2',
    // Education
    'Bachelor', 'Master', 'Diplom', 'Promotion', 'Studium', 'Ausbildung',
    // Experience
    'Berufserfahrung', 'Jahre Erfahrung', 'Senior', 'Junior', 'Lead',
    // Business
    'SAP', 'ERP', 'CRM', 'Excel', 'PowerPoint', 'MS Office', 'Salesforce',
    // HR specific
    'Recruiting', 'Personalmanagement', 'HR', 'Talent Acquisition', 'Onboarding',
    // Project Management
    'Projektmanagement', 'PMP', 'PRINCE2', 'PMO', 'Stakeholder'
];

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
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
                headers,
                body: JSON.stringify({ error: 'URL oder Text erforderlich' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: result
            })
        };

    } catch (error) {
        console.error('Job Parser Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Fehler beim Parsen',
                message: error.message
            })
        };
    }
};

/**
 * Parse Job URL - Fetch und extrahiere Daten
 */
async function parseJobUrl(url) {
    // Validiere URL
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error('Ungültige URL');
    }

    // Identifiziere Portal
    const portal = identifyPortal(url);
    
    // Fetch the page
    let html;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache'
            },
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        html = await response.text();
    } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        // Fallback: Extrahiere was möglich aus URL
        return extractFromUrl(url, portal);
    }

    // Parse HTML und extrahiere Daten
    const extracted = extractFromHtml(html, portal);
    
    // Ergänze mit URL-Info
    extracted.url = url;
    extracted.portal = portal.name || 'unknown';
    
    return extracted;
}

/**
 * Identifiziere das Job-Portal anhand der URL
 */
function identifyPortal(url) {
    for (const [name, config] of Object.entries(JOB_PORTALS)) {
        if (config.pattern.test(url)) {
            return { name, ...config };
        }
    }
    return { name: 'generic', ...JOB_PORTALS.generic };
}

/**
 * Extrahiere Daten aus HTML (ohne DOM Parser - Regex basiert)
 */
function extractFromHtml(html, portal) {
    const result = {
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: [],
        salary: '',
        employmentType: ''
    };

    // Clean HTML
    const cleanHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

    // Extract title
    result.title = extractFirstMatch(cleanHtml, [
        /<h1[^>]*>([^<]+)<\/h1>/i,
        /<title>([^<|]+)/i,
        /class="[^"]*job-title[^"]*"[^>]*>([^<]+)/i,
        /data-at="header-job-title"[^>]*>([^<]+)/i
    ]);

    // Extract company
    result.company = extractFirstMatch(cleanHtml, [
        /class="[^"]*company[^"]*"[^>]*>([^<]+)/i,
        /data-at="header-company-name"[^>]*>([^<]+)/i,
        /itemprop="hiringOrganization"[^>]*>([^<]+)/i,
        /"employer"[^>]*:\s*"([^"]+)"/i,
        /(?:bei|für|company:|firma:|arbeitgeber:)\s*([A-Za-zäöüÄÖÜß\s&.-]+(?:GmbH|AG|SE|KG|Co\.?|Inc\.?)?)/i
    ]);

    // Extract location
    result.location = extractFirstMatch(cleanHtml, [
        /class="[^"]*location[^"]*"[^>]*>([^<]+)/i,
        /data-at="header-job-location"[^>]*>([^<]+)/i,
        /itemprop="jobLocation"[^>]*>([^<]+)/i,
        /(?:standort|location|ort|arbeitsort):\s*([^<\n,]+)/i,
        /(Berlin|München|Hamburg|Frankfurt|Köln|Stuttgart|Düsseldorf|Leipzig|Dresden|Nürnberg|Hannover|Bremen|Wien|Zürich|Remote)/i
    ]);

    // Extract description (first 2000 chars)
    const descMatch = cleanHtml.match(/class="[^"]*(?:description|job-description|job-content)[^"]*"[^>]*>([\s\S]{100,2000}?)<\/div>/i);
    if (descMatch) {
        result.description = stripHtml(descMatch[1]).substring(0, 2000);
    } else {
        // Fallback: Extract text between common markers
        const bodyMatch = cleanHtml.match(/<(?:article|main|section)[^>]*>([\s\S]{100,3000}?)<\/(?:article|main|section)>/i);
        if (bodyMatch) {
            result.description = stripHtml(bodyMatch[1]).substring(0, 2000);
        }
    }

    // Extract requirements/skills
    result.requirements = extractSkills(cleanHtml);

    // Extract salary (if present)
    const salaryMatch = cleanHtml.match(/(?:gehalt|salary|vergütung)[^<]*?(\d{2,3}\.?\d{0,3}\s*(?:€|EUR|k|tsd))/i);
    if (salaryMatch) {
        result.salary = salaryMatch[1];
    }

    // Extract employment type
    const typeMatch = cleanHtml.match(/(Vollzeit|Teilzeit|Full-?time|Part-?time|Festanstellung|Befristet|Freelance|Remote)/i);
    if (typeMatch) {
        result.employmentType = typeMatch[1];
    }

    // Clean up results
    result.title = cleanText(result.title);
    result.company = cleanText(result.company);
    result.location = cleanText(result.location);

    return result;
}

/**
 * Extrahiere Skills aus HTML
 */
function extractSkills(html) {
    const foundSkills = new Set();
    const textContent = stripHtml(html).toLowerCase();

    for (const skill of SKILL_KEYWORDS) {
        const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
        if (regex.test(textContent)) {
            // Finde Original-Schreibweise
            const originalMatch = html.match(new RegExp(`\\b(${skill})\\b`, 'i'));
            if (originalMatch) {
                foundSkills.add(originalMatch[1]);
            } else {
                foundSkills.add(skill);
            }
        }
    }

    return Array.from(foundSkills).slice(0, 12); // Max 12 Skills
}

/**
 * Hilfsfunktion: Ersten Match aus Pattern-Liste extrahieren
 */
function extractFirstMatch(text, patterns) {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return '';
}

/**
 * Hilfsfunktion: HTML-Tags entfernen
 */
function stripHtml(html) {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Hilfsfunktion: Text bereinigen
 */
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\(m\/w\/d\)|\(w\/m\/d\)|\(m\/w\/x\)|\(d\/m\/w\)/gi, '')
        .trim();
}

/**
 * Fallback: Extrahiere aus URL wenn Fetch fehlschlägt
 */
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
        const hostname = urlObj.hostname;
        const pathname = urlObj.pathname;

        // Versuche Company aus Hostname zu extrahieren
        const knownPortals = ['stepstone', 'indeed', 'linkedin', 'xing', 'monster', 'glassdoor'];
        const cleanHost = hostname.replace('www.', '').split('.')[0];
        
        if (!knownPortals.includes(cleanHost.toLowerCase())) {
            result.company = cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1);
        }

        // Versuche Titel aus Pfad zu extrahieren
        const pathParts = pathname.split('/').filter(p => p.length > 3);
        for (const part of pathParts) {
            // Decodiere URL-encoding
            const decoded = decodeURIComponent(part).replace(/-/g, ' ');
            // Check if it looks like a job title
            if (decoded.length > 10 && decoded.length < 100 && 
                !decoded.match(/^\d+$/) && // Keine reinen Zahlen
                !decoded.match(/^[a-f0-9-]{20,}$/i)) { // Keine UUIDs
                result.title = decoded;
                break;
            }
        }

    } catch (e) {
        console.error('URL extraction error:', e);
    }

    return result;
}

/**
 * Parse Job Text (kein URL, direkter Text)
 */
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

    // Erste Zeile ist oft der Titel
    if (lines.length > 0) {
        const firstLine = lines[0];
        if (firstLine.length < 100 && 
            (firstLine.includes('(m/w/d)') || 
             firstLine.includes('(w/m/d)') ||
             /developer|manager|engineer|berater|consultant|spezialist|leiter/i.test(firstLine))) {
            result.title = cleanText(firstLine);
        }
    }

    // Suche nach Company-Patterns
    const companyPatterns = [
        /(?:bei|für|company:|firma:|unternehmen:|arbeitgeber:)\s*([A-Za-zäöüÄÖÜß\s&.-]+(?:GmbH|AG|SE|KG|Co\.?|Inc\.?)?)/i,
        /^([A-Za-zäöüÄÖÜß\s&.-]+(?:GmbH|AG|SE|KG))\s*$/m
    ];
    
    for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            result.company = cleanText(match[1]);
            break;
        }
    }

    // Suche nach Location-Patterns
    const locationPatterns = [
        /(?:standort|location|ort|arbeitsort):\s*([A-Za-zäöüÄÖÜß\s,-]+)/i,
        /(?:in|@)\s+(Berlin|München|Hamburg|Frankfurt|Köln|Stuttgart|Düsseldorf|Leipzig|Dresden|Nürnberg|Hannover|Bremen|Wien|Zürich|Remote)/i
    ];
    
    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            result.location = cleanText(match[1]);
            break;
        }
    }

    // Extrahiere Skills
    result.requirements = extractSkills(text);

    return result;
}

