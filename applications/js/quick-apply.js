/**
 * QUICK APPLY - 60 Sekunden Bewerbung
 * Stellenanzeige → KI-Anschreiben → Fertig!
 */

// ═══════════════════════════════════════════════════════════════════════════
// QUICK APPLY STATE
// ═══════════════════════════════════════════════════════════════════════════

const QuickApplyState = {
    inputType: 'url',
    jobData: null,
    tone: 'formal',
    length: 'medium',
    isGenerating: false,
    generatedText: '',
    hasProfile: false
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function initQuickApply() {
    console.log('⚡ Initializing Quick Apply...');
    
    // Check if profile exists
    checkProfileStatus();
    
    // Setup event listeners
    setupQuickApplyListeners();
    
    // Check API status and show hint
    updateAPIStatusDisplay();
    
    console.log('✅ Quick Apply ready');
}

/**
 * Zeigt den API-Status an und gibt Hinweis falls kein Key vorhanden
 */
function updateAPIStatusDisplay() {
    const apiConfig = getOpenAIConfig();
    const statusText = document.getElementById('apiStatusText');
    const generationInfo = document.getElementById('generationInfo');
    const apiHint = document.getElementById('apiHint');
    
    if (!statusText || !generationInfo) return;
    
    if (apiConfig && apiConfig.key) {
        // API Key vorhanden
        const model = apiConfig.model || 'gpt-4o-mini';
        statusText.textContent = `${model} • Durchschnittlich 15 Sekunden`;
        generationInfo.classList.add('has-api');
        generationInfo.classList.remove('no-api');
        if (apiHint) apiHint.classList.add('hidden');
    } else {
        // Kein API Key - Template-Modus
        statusText.textContent = 'Template-Modus (kein API-Key konfiguriert)';
        generationInfo.classList.add('no-api');
        generationInfo.classList.remove('has-api');
        if (apiHint) apiHint.classList.remove('hidden');
    }
}

function checkProfileStatus() {
    const profile = DashboardState.profile;
    QuickApplyState.hasProfile = !!(
        profile.firstName && 
        profile.skills && 
        profile.skills.length > 0
    );
    
    // Show/hide profile step
    const profileStep = document.getElementById('quickStep2');
    if (profileStep) {
        profileStep.classList.toggle('hidden', QuickApplyState.hasProfile);
    }
}

function setupQuickApplyListeners() {
    // URL input - enable button on valid URL
    const urlInput = document.getElementById('jobUrl');
    if (urlInput) {
        urlInput.addEventListener('input', handleUrlInput);
        urlInput.addEventListener('paste', handleUrlPaste);
    }
    
    // Text input
    const textInput = document.getElementById('jobText');
    if (textInput) {
        textInput.addEventListener('input', handleTextInput);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT TYPE TOGGLE
// ═══════════════════════════════════════════════════════════════════════════

function toggleInputType(type) {
    QuickApplyState.inputType = type;
    
    // Update buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.input === type);
    });
    
    // Show/hide inputs
    document.getElementById('inputUrl').classList.toggle('hidden', type !== 'url');
    document.getElementById('inputText').classList.toggle('hidden', type !== 'text');
    
    // Reset parsed preview
    document.getElementById('parsedJobPreview').classList.add('hidden');
    
    // Update generate button state
    updateGenerateButton();
}

// ═══════════════════════════════════════════════════════════════════════════
// URL INPUT HANDLING
// ═══════════════════════════════════════════════════════════════════════════

function handleUrlInput(event) {
    const url = event.target.value.trim();
    const parseBtn = document.getElementById('parseUrlBtn');
    
    // Enable/disable parse button
    const isValidUrl = isValidJobUrl(url);
    parseBtn.disabled = !isValidUrl;
    
    // Auto-parse on paste
    if (event.inputType === 'insertFromPaste' && isValidUrl) {
        parseJobUrl();
    }
}

function handleUrlPaste(event) {
    // Small delay to let the value update
    setTimeout(() => {
        const url = event.target.value.trim();
        if (isValidJobUrl(url)) {
            parseJobUrl();
        }
    }, 100);
}

function isValidJobUrl(url) {
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
}

async function parseJobUrl() {
    const url = document.getElementById('jobUrl').value.trim();
    const parseBtn = document.getElementById('parseUrlBtn');
    
    if (!isValidJobUrl(url)) {
        showToast('Bitte geben Sie eine gültige URL ein', 'error');
        return;
    }
    
    // Show loading
    parseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysiere...';
    parseBtn.disabled = true;
    
    try {
        // Versuche zuerst die Netlify Function
        let jobData = await fetchJobDataFromApi(url);
        
        // Fallback auf lokale Extraktion wenn API fehlschlägt
        if (!jobData || (!jobData.title && !jobData.company)) {
            console.log('API-Parsing unvollständig, nutze lokale Extraktion');
            jobData = await extractJobFromUrl(url);
        }
        
        if (jobData && (jobData.title || jobData.company)) {
            QuickApplyState.jobData = jobData;
            showParsedJob(jobData);
            showToast('Stellenanzeige erkannt!', 'success');
        } else {
            // Fallback: Show manual entry
            showToast('URL erkannt - bitte Details ergänzen', 'info');
            showParsedJob({
                title: '',
                company: extractCompanyFromUrl(url),
                location: '',
                requirements: [],
                url: url
            });
        }
    } catch (error) {
        console.error('Error parsing URL:', error);
        showToast('Analysieren fehlgeschlagen - bitte Text einfügen', 'error');
        toggleInputType('text');
    } finally {
        parseBtn.innerHTML = '<i class="fas fa-search"></i> Analysieren';
        parseBtn.disabled = false;
    }
}

/**
 * Rufe die Netlify Function zum Parsen der Job-URL auf
 */
async function fetchJobDataFromApi(url) {
    try {
        const response = await fetch('/.netlify/functions/job-parser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                type: 'url'
            })
        });
        
        if (!response.ok) {
            console.warn('Job Parser API returned:', response.status);
            return null;
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log('✅ Job-Daten von API erhalten:', result.data);
            return result.data;
        }
        
        return null;
    } catch (error) {
        console.warn('Job Parser API Fehler:', error);
        return null;
    }
}

async function extractJobFromUrl(url) {
    // In production, this would call a backend API to scrape the job posting
    // For now, we'll extract what we can from the URL
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Known job portals with URL patterns
    const jobData = {
        title: '',
        company: '',
        location: '',
        requirements: [],
        url: url
    };
    
    // StepStone pattern
    if (hostname.includes('stepstone')) {
        const pathParts = urlObj.pathname.split('/');
        // Try to extract title from URL
        const titlePart = pathParts.find(p => p.length > 20 && !p.includes('-'));
        if (titlePart) {
            jobData.title = titlePart.replace(/-/g, ' ');
        }
    }
    
    // Indeed pattern
    if (hostname.includes('indeed')) {
        const params = new URLSearchParams(urlObj.search);
        if (params.has('vjk')) {
            // Job ID found, would need API to get details
        }
    }
    
    // LinkedIn pattern
    if (hostname.includes('linkedin')) {
        const pathParts = urlObj.pathname.split('/');
        if (pathParts.includes('jobs') || pathParts.includes('view')) {
            // LinkedIn job posting
        }
    }
    
    // Extract company from hostname if possible
    jobData.company = extractCompanyFromUrl(url);
    
    return jobData;
}

function extractCompanyFromUrl(url) {
    try {
        const hostname = new URL(url).hostname;
        
        // Remove common prefixes/suffixes
        let company = hostname
            .replace('www.', '')
            .replace('.de', '')
            .replace('.com', '')
            .replace('.jobs', '')
            .replace('.careers', '')
            .replace('karriere.', '')
            .replace('jobs.', '');
        
        // Known portals - don't use as company name
        const portals = ['stepstone', 'indeed', 'linkedin', 'xing', 'monster', 'glassdoor', 'kununu'];
        if (portals.some(p => company.includes(p))) {
            return '';
        }
        
        // Capitalize first letter
        return company.charAt(0).toUpperCase() + company.slice(1);
    } catch {
        return '';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT INPUT HANDLING
// ═══════════════════════════════════════════════════════════════════════════

// Debounce Timer für Text-Parsing
let textParseTimeout = null;

function handleTextInput() {
    const text = document.getElementById('jobText').value;
    const charCount = document.getElementById('charCount');
    
    // Update char counter
    if (charCount) {
        charCount.textContent = text.length;
    }
    
    // Debounce: Parse text nach 500ms Pause
    clearTimeout(textParseTimeout);
    
    if (text.length > 100) {
        textParseTimeout = setTimeout(async () => {
            await parseAndShowJobText(text);
        }, 500);
    } else {
        document.getElementById('parsedJobPreview').classList.add('hidden');
    }
    
    updateGenerateButton();
}

/**
 * Parse Job-Text (lokal oder via API)
 */
async function parseAndShowJobText(text) {
    // Versuche zuerst lokales Parsing (schneller)
    let jobData = parseJobText(text);
    
    // Wenn lokales Parsing wenig findet, versuche API
    if ((!jobData.title || !jobData.company) && text.length > 200) {
        try {
            const apiData = await fetchJobTextFromApi(text);
            if (apiData) {
                // Merge API-Daten mit lokalem Parsing
                jobData = {
                    ...jobData,
                    ...apiData,
                    // Behalte lokale Werte wenn API leer
                    title: apiData.title || jobData.title,
                    company: apiData.company || jobData.company,
                    location: apiData.location || jobData.location,
                    requirements: [...new Set([...(apiData.requirements || []), ...(jobData.requirements || [])])]
                };
            }
        } catch (e) {
            console.warn('API Text-Parsing fehlgeschlagen:', e);
        }
    }
    
    if (jobData.title || jobData.company || jobData.requirements.length > 0) {
        QuickApplyState.jobData = jobData;
        showParsedJob(jobData);
    }
}

/**
 * Rufe die Netlify Function zum Parsen von Job-Text auf
 */
async function fetchJobTextFromApi(text) {
    try {
        const response = await fetch('/.netlify/functions/job-parser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                type: 'text'
            })
        });
        
        if (!response.ok) return null;
        
        const result = await response.json();
        return result.success ? result.data : null;
    } catch (error) {
        console.warn('Job Text Parser API Fehler:', error);
        return null;
    }
}

function parseJobText(text) {
    const jobData = {
        title: '',
        company: '',
        location: '',
        requirements: [],
        description: text
    };
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    // First non-empty line is often the title
    if (lines.length > 0) {
        const firstLine = lines[0];
        // Check if it looks like a job title (contains m/w/d, contains typical keywords)
        if (firstLine.length < 100 && 
            (firstLine.includes('(m/w/d)') || 
             firstLine.includes('(w/m/d)') ||
             /developer|manager|engineer|berater|consultant|spezialist/i.test(firstLine))) {
            jobData.title = firstLine.replace(/\(m\/w\/d\)|\(w\/m\/d\)/gi, '').trim();
        }
    }
    
    // Look for company name patterns
    const companyPatterns = [
        /(?:bei|für|company:|firma:|unternehmen:)\s*([A-Za-zäöüÄÖÜß\s&.-]+(?:GmbH|AG|SE|KG|Co\.?|Inc\.?)?)/i,
        /^([A-Za-zäöüÄÖÜß\s&.-]+(?:GmbH|AG|SE|KG))\s*$/m
    ];
    
    for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            jobData.company = match[1].trim();
            break;
        }
    }
    
    // Look for location
    const locationPatterns = [
        /(?:standort|location|ort):\s*([A-Za-zäöüÄÖÜß\s,-]+)/i,
        /(?:in|@)\s+(Berlin|München|Hamburg|Frankfurt|Köln|Stuttgart|Düsseldorf|Leipzig|Dresden|Nürnberg|Hannover|Bremen|Wien|Zürich)/i
    ];
    
    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            jobData.location = match[1].trim();
            break;
        }
    }
    
    // Extract requirements (bullet points or keywords)
    const requirementKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'React', 'Angular', 'Vue',
        'Node.js', 'SQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git',
        'Projektmanagement', 'Scrum', 'Agile', 'Führungserfahrung', 'Teamleitung',
        'SAP', 'Excel', 'PowerPoint', 'MS Office', 'ERP',
        'Kommunikationsstärke', 'Englisch', 'Deutsch', 'B2', 'C1',
        'Bachelor', 'Master', 'Studium', 'Ausbildung', 'Berufserfahrung'
    ];
    
    const foundRequirements = requirementKeywords.filter(kw => 
        text.toLowerCase().includes(kw.toLowerCase())
    );
    
    jobData.requirements = foundRequirements.slice(0, 8); // Max 8 tags
    
    return jobData;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARSED JOB PREVIEW
// ═══════════════════════════════════════════════════════════════════════════

function showParsedJob(jobData) {
    const preview = document.getElementById('parsedJobPreview');
    
    // Fill fields
    document.getElementById('parsedTitle').value = jobData.title || '';
    document.getElementById('parsedCompany').value = jobData.company || '';
    document.getElementById('parsedLocation').value = jobData.location || '';
    
    // Show requirements tags
    const tagsContainer = document.getElementById('parsedRequirements');
    if (jobData.requirements && jobData.requirements.length > 0) {
        tagsContainer.innerHTML = jobData.requirements.map(req => 
            `<span class="tag">${escapeHtml(req)}</span>`
        ).join('');
    } else {
        tagsContainer.innerHTML = '<span class="tag">Keine erkannt</span>';
    }
    
    preview.classList.remove('hidden');
    updateGenerateButton();
}

function editParsedJob() {
    // Focus on title field
    document.getElementById('parsedTitle').focus();
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATION OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

function selectTone(tone) {
    QuickApplyState.tone = tone;
    document.querySelectorAll('[data-tone]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tone === tone);
    });
}

function selectLength(length) {
    QuickApplyState.length = length;
    document.querySelectorAll('[data-length]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.length === length);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE BUTTON STATE
// ═══════════════════════════════════════════════════════════════════════════

function updateGenerateButton() {
    const btn = document.getElementById('generateBtn');
    if (!btn) return;
    
    // Check requirements
    let canGenerate = false;
    
    if (QuickApplyState.inputType === 'url') {
        const url = document.getElementById('jobUrl').value.trim();
        canGenerate = isValidJobUrl(url);
    } else {
        const text = document.getElementById('jobText').value.trim();
        canGenerate = text.length > 50;
    }
    
    // Also check if profile exists or quick profile is filled
    if (!QuickApplyState.hasProfile) {
        const quickName = document.getElementById('quickName');
        const quickSkills = document.getElementById('quickSkills');
        if (quickName && quickSkills) {
            canGenerate = canGenerate && quickName.value.trim() && quickSkills.value.trim();
        }
    }
    
    btn.disabled = !canGenerate;
}

// ═══════════════════════════════════════════════════════════════════════════
// COVER LETTER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateQuickApplication() {
    if (QuickApplyState.isGenerating) return;
    
    const btn = document.getElementById('generateBtn');
    
    // Collect data
    const jobData = collectJobData();
    const profileData = collectProfileData();
    
    if (!jobData.title && !jobData.description) {
        showToast('Bitte Stellenanzeige eingeben', 'error');
        return;
    }
    
    if (!profileData.name) {
        showToast('Bitte Namen eingeben', 'error');
        return;
    }
    
    // Start generation
    QuickApplyState.isGenerating = true;
    btn.classList.add('loading');
    btn.disabled = true;
    
    try {
        const coverLetter = await generateCoverLetter(jobData, profileData);
        
        // Save generated text
        QuickApplyState.generatedText = coverLetter;
        QuickApplyState.jobData = jobData;
        
        // Show result
        showGenerationResult(coverLetter, jobData);
        
        // Save profile if checkbox is checked
        const saveCheckbox = document.getElementById('saveQuickProfile');
        if (saveCheckbox && saveCheckbox.checked && !QuickApplyState.hasProfile) {
            saveQuickProfileData(profileData);
        }
        
        showToast('Anschreiben generiert!', 'success');
        
    } catch (error) {
        console.error('Generation error:', error);
        showToast('Fehler bei der Generierung: ' + error.message, 'error');
    } finally {
        QuickApplyState.isGenerating = false;
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

function collectJobData() {
    // From parsed preview or text input
    const parsedTitle = document.getElementById('parsedTitle');
    const parsedCompany = document.getElementById('parsedCompany');
    const parsedLocation = document.getElementById('parsedLocation');
    const jobText = document.getElementById('jobText');
    
    return {
        title: parsedTitle ? parsedTitle.value.trim() : '',
        company: parsedCompany ? parsedCompany.value.trim() : '',
        location: parsedLocation ? parsedLocation.value.trim() : '',
        description: jobText ? jobText.value.trim() : '',
        requirements: QuickApplyState.jobData?.requirements || []
    };
}

function collectProfileData() {
    // From existing profile or quick form
    if (QuickApplyState.hasProfile) {
        const p = DashboardState.profile;
        return {
            name: `${p.firstName} ${p.lastName}`.trim(),
            currentJob: p.currentJob,
            experience: p.experience,
            location: p.location,
            skills: p.skills,
            motivation: ''
        };
    }
    
    // From quick form
    return {
        name: document.getElementById('quickName')?.value.trim() || '',
        currentJob: document.getElementById('quickCurrentJob')?.value.trim() || '',
        experience: document.getElementById('quickExperience')?.value || '',
        location: document.getElementById('quickLocation')?.value.trim() || '',
        skills: (document.getElementById('quickSkills')?.value || '')
            .split(',').map(s => s.trim()).filter(s => s),
        motivation: document.getElementById('quickMotivation')?.value.trim() || ''
    };
}

async function generateCoverLetter(jobData, profileData) {
    // Get API Key from Admin Panel (global_api_keys)
    const apiConfig = getOpenAIConfig();
    
    if (apiConfig && apiConfig.key) {
        // Use OpenAI API with config from Admin Panel
        return await generateWithOpenAI(jobData, profileData, apiConfig);
    } else {
        // Use template-based generation (no API key)
        console.log('ℹ️ Kein API Key gefunden - nutze Template-Generator');
        return generateWithTemplate(jobData, profileData);
    }
}

/**
 * Hole OpenAI Konfiguration aus dem Admin Panel (global_api_keys)
 * Priorität: globalAPIManager > localStorage.global_api_keys
 */
function getOpenAIConfig() {
    // Nutze den zentralen AIProviderManager aus utils.js (falls verfügbar)
    // Synchrone Wrapper-Funktion für Kompatibilität
    
    // PRIORITÄT 1: GlobalAPIManager (falls geladen)
    if (window.globalAPIManager) {
        const config = window.globalAPIManager.getServiceConfig('openai');
        if (config && config.key && config.key.startsWith('sk-')) {
            return config;
        }
    }
    
    // PRIORITÄT 2: Direkt aus localStorage (global_api_keys vom Admin Panel)
    try {
        const raw = localStorage.getItem('global_api_keys');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.openai && parsed.openai.key && parsed.openai.key.startsWith('sk-')) {
                return {
                    key: parsed.openai.key,
                    model: parsed.openai.model || 'gpt-4o-mini',
                    maxTokens: parsed.openai.maxTokens || 1000,
                    temperature: parsed.openai.temperature || 0.7
                };
            }
        }
    } catch (error) {
        console.warn('⚠️ Konnte global_api_keys nicht lesen:', error);
    }
    
    // PRIORITÄT 3: Fallback zu altem localStorage Key (Legacy)
    const legacyKey = localStorage.getItem('openai_api_key');
    if (legacyKey && legacyKey.startsWith('sk-')) {
        return {
            key: legacyKey,
            model: 'gpt-4o-mini',
            maxTokens: 1000,
            temperature: 0.7
        };
    }
    
    return null;
}

async function generateWithOpenAI(jobData, profileData, apiConfig) {
    const prompt = buildPrompt(jobData, profileData);
    
    // Verwende Config aus Admin Panel
    const model = apiConfig.model || 'gpt-4o-mini';
    const temperature = apiConfig.temperature || 0.7;
    const maxTokens = apiConfig.maxTokens || 1000;
    
    console.log(`🤖 Generiere mit ${model} (temp: ${temperature}, tokens: ${maxTokens})`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.key}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: `Du bist ein erfahrener Karriereberater, der professionelle Bewerbungsanschreiben auf Deutsch verfasst. 
                    Schreibe ${QuickApplyState.tone === 'formal' ? 'formal und professionell' : QuickApplyState.tone === 'modern' ? 'modern und dynamisch' : 'kreativ und persönlich'}.
                    Länge: ${QuickApplyState.length === 'short' ? 'kurz (max 200 Wörter)' : QuickApplyState.length === 'long' ? 'ausführlich (ca 400 Wörter)' : 'mittel (ca 300 Wörter)'}.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: temperature,
            max_tokens: maxTokens
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API-Fehler');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

function buildPrompt(jobData, profileData) {
    return `Schreibe ein Bewerbungsanschreiben für folgende Stelle:

STELLE:
- Position: ${jobData.title || 'nicht angegeben'}
- Unternehmen: ${jobData.company || 'nicht angegeben'}
- Standort: ${jobData.location || 'nicht angegeben'}
- Anforderungen: ${jobData.requirements.join(', ') || 'nicht angegeben'}
${jobData.description ? `- Stellenbeschreibung: ${jobData.description.substring(0, 1000)}` : ''}

BEWERBER:
- Name: ${profileData.name}
- Aktuelle Position: ${profileData.currentJob || 'nicht angegeben'}
- Berufserfahrung: ${profileData.experience || 'nicht angegeben'}
- Standort: ${profileData.location || 'nicht angegeben'}
- Skills: ${profileData.skills.join(', ') || 'nicht angegeben'}
${profileData.motivation ? `- Motivation: ${profileData.motivation}` : ''}

Erstelle ein überzeugendes Anschreiben mit korrekter deutscher Briefform (Datum, Anrede, Grußformel).`;
}

function generateWithTemplate(jobData, profileData) {
    // Template-based fallback (no API key)
    const today = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    const greeting = jobData.company 
        ? `Sehr geehrte Damen und Herren bei ${jobData.company},`
        : 'Sehr geehrte Damen und Herren,';
    
    const skillsList = profileData.skills.length > 0
        ? profileData.skills.slice(0, 3).join(', ')
        : 'meine Fähigkeiten';
    
    const experienceText = getExperienceText(profileData.experience);
    
    const motivationText = profileData.motivation 
        ? profileData.motivation
        : jobData.company 
            ? `Die Stelle als ${jobData.title || 'Mitarbeiter'} bei ${jobData.company} hat mein Interesse geweckt, da sie optimal zu meinem Profil passt.`
            : `Die ausgeschriebene Stelle hat mein Interesse geweckt, da sie optimal zu meinem Profil passt.`;
    
    const template = `${profileData.name}
${profileData.location || 'Deutschland'}

${today}

Bewerbung als ${jobData.title || 'Ihre ausgeschriebene Stelle'}

${greeting}

${motivationText}

${experienceText} bringe ich fundierte Kenntnisse in ${skillsList} mit. ${getStrengthSentence(jobData, profileData)}

${getClosingSentence(QuickApplyState.tone)}

Mit freundlichen Grüßen

${profileData.name}`;

    return template;
}

function getExperienceText(experience) {
    const texts = {
        '0-1': 'Als motivierter Berufseinsteiger',
        '1-3': 'Mit meiner bisherigen Berufserfahrung',
        '3-5': 'Mit mehrjähriger Berufserfahrung',
        '5-10': 'Mit umfangreicher Berufserfahrung von über 5 Jahren',
        '10+': 'Mit über 10 Jahren Berufserfahrung'
    };
    return texts[experience] || 'Mit meiner Berufserfahrung';
}

function getStrengthSentence(jobData, profileData) {
    if (jobData.requirements && jobData.requirements.length > 0) {
        const matchingSkills = profileData.skills.filter(skill =>
            jobData.requirements.some(req => 
                req.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(req.toLowerCase())
            )
        );
        
        if (matchingSkills.length > 0) {
            return `Besonders meine Erfahrung mit ${matchingSkills.slice(0, 2).join(' und ')} macht mich zu einem idealen Kandidaten für diese Position.`;
        }
    }
    
    return 'Ich bin überzeugt, dass ich mit meinen Fähigkeiten einen wertvollen Beitrag zu Ihrem Team leisten kann.';
}

function getClosingSentence(tone) {
    const sentences = {
        formal: 'Über die Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.',
        modern: 'Ich freue mich darauf, Sie in einem Gespräch von meinen Qualifikationen zu überzeugen!',
        creative: 'Lassen Sie uns gemeinsam herausfinden, wie ich Ihr Team bereichern kann - ich freue mich auf unser Gespräch!'
    };
    return sentences[tone] || sentences.formal;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULT DISPLAY
// ═══════════════════════════════════════════════════════════════════════════

function showGenerationResult(coverLetter, jobData) {
    // Hide other steps
    document.getElementById('quickStep1').classList.add('hidden');
    document.getElementById('quickStep2').classList.add('hidden');
    document.getElementById('quickStep3').classList.add('hidden');
    
    // Show result
    const resultStep = document.getElementById('quickStep4');
    resultStep.classList.remove('hidden');
    
    // Fill result data
    document.getElementById('resultJobTitle').textContent = jobData.title || 'Bewerbung';
    document.getElementById('resultCompany').textContent = jobData.company ? `@ ${jobData.company}` : '';
    document.getElementById('resultText').value = coverLetter;
    
    // Scroll to result
    resultStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULT ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

function copyToClipboard() {
    const text = document.getElementById('resultText').value;
    navigator.clipboard.writeText(text).then(() => {
        showToast('In Zwischenablage kopiert!', 'success');
    }).catch(err => {
        showToast('Kopieren fehlgeschlagen', 'error');
    });
}

function downloadAsPdf() {
    const text = document.getElementById('resultText').value;
    const jobTitle = QuickApplyState.jobData?.title || 'Bewerbung';
    const company = QuickApplyState.jobData?.company || '';
    
    // Create printable HTML
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Bewerbung - ${jobTitle}</title>
            <style>
                body {
                    font-family: 'Georgia', serif;
                    font-size: 12pt;
                    line-height: 1.6;
                    max-width: 700px;
                    margin: 50px auto;
                    padding: 20px;
                }
                pre {
                    white-space: pre-wrap;
                    font-family: inherit;
                }
            </style>
        </head>
        <body>
            <pre>${escapeHtml(text)}</pre>
        </body>
        </html>
    `;
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    showToast('PDF-Druck geöffnet', 'info');
}

function downloadAsDocx() {
    // For now, download as .txt (docx would require a library)
    const text = document.getElementById('resultText').value;
    const jobTitle = QuickApplyState.jobData?.title || 'Bewerbung';
    const company = QuickApplyState.jobData?.company || '';
    
    const filename = `Anschreiben_${company || 'Bewerbung'}_${new Date().toISOString().split('T')[0]}.txt`;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('Download gestartet', 'success');
}

function sendViaEmail() {
    const text = document.getElementById('resultText').value;
    const jobTitle = QuickApplyState.jobData?.title || 'Bewerbung';
    const company = QuickApplyState.jobData?.company || '';
    
    const subject = encodeURIComponent(`Bewerbung als ${jobTitle}${company ? ` bei ${company}` : ''}`);
    const body = encodeURIComponent(text);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    showToast('E-Mail-Programm geöffnet', 'info');
}

function regenerateCoverLetter() {
    if (confirm('Neues Anschreiben generieren?')) {
        // Go back to step 3
        document.getElementById('quickStep4').classList.add('hidden');
        document.getElementById('quickStep1').classList.remove('hidden');
        document.getElementById('quickStep3').classList.remove('hidden');
        
        if (!QuickApplyState.hasProfile) {
            document.getElementById('quickStep2').classList.remove('hidden');
        }
        
        // Generate again
        generateQuickApplication();
    }
}

function improveText(type) {
    showToast(`"${type}" Verbesserung kommt bald!`, 'info');
    // TODO: Implement text improvement with AI
}

function startNewApplication() {
    // Reset state
    QuickApplyState.jobData = null;
    QuickApplyState.generatedText = '';
    
    // Reset form
    document.getElementById('jobUrl').value = '';
    document.getElementById('jobText').value = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('parsedJobPreview').classList.add('hidden');
    
    // Show steps
    document.getElementById('quickStep1').classList.remove('hidden');
    document.getElementById('quickStep3').classList.remove('hidden');
    
    if (!QuickApplyState.hasProfile) {
        document.getElementById('quickStep2').classList.remove('hidden');
    }
    
    // Hide result
    document.getElementById('quickStep4').classList.add('hidden');
    
    // Scroll to top
    document.querySelector('.quick-apply-container').scrollIntoView({ behavior: 'smooth' });
    
    updateGenerateButton();
}

function addToTracking() {
    const jobData = QuickApplyState.jobData;
    
    if (!jobData) {
        showToast('Keine Stellendaten vorhanden', 'error');
        return;
    }
    
    // Add to applications
    const newApp = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        position: jobData.title || 'Bewerbung',
        company: jobData.company || 'Unbekannt',
        location: jobData.location || '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: 'Erstellt mit Quick Apply',
        coverLetter: QuickApplyState.generatedText,
        createdAt: new Date().toISOString()
    };
    
    DashboardState.applications.unshift(newApp);
    calculateStats();
    saveState();
    updateStatsBar();
    
    showToast('Zum Tracking hinzugefügt!', 'success');
    
    // Switch to tracking tab
    setTimeout(() => {
        showTab('tracking');
    }, 1000);
}

// ═══════════════════════════════════════════════════════════════════════════
// SAVE QUICK PROFILE
// ═══════════════════════════════════════════════════════════════════════════

function saveQuickProfileData(profileData) {
    const nameParts = profileData.name.split(' ');
    
    DashboardState.profile = {
        ...DashboardState.profile,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        currentJob: profileData.currentJob,
        experience: profileData.experience,
        location: profileData.location,
        skills: profileData.skills
    };
    
    saveState();
    QuickApplyState.hasProfile = true;
    
    console.log('📝 Quick profile saved');
}

// ═══════════════════════════════════════════════════════════════════════════
// LINKEDIN IMPORT (Placeholder)
// ═══════════════════════════════════════════════════════════════════════════

function importFromLinkedIn() {
    showToast('LinkedIn-Import kommt bald!', 'info');
    // TODO: Implement LinkedIn OAuth or CSV import
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Calculate stats helper (imported from dashboard-core)
function calculateStats() {
    if (typeof window.calculateStats === 'function') {
        window.calculateStats();
    } else {
        const apps = DashboardState.applications;
        DashboardState.stats = {
            total: apps.length,
            pending: apps.filter(a => a.status === 'pending').length,
            interviews: apps.filter(a => a.status === 'interview').length,
            offers: apps.filter(a => a.status === 'offer').length,
            rejected: apps.filter(a => a.status === 'rejected').length,
            successRate: apps.length > 0 
                ? Math.round((apps.filter(a => a.status === 'offer').length / apps.length) * 100) 
                : 0
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

window.initQuickApply = initQuickApply;
window.toggleInputType = toggleInputType;
window.handleUrlInput = handleUrlInput;
window.handleUrlPaste = handleUrlPaste;
window.parseJobUrl = parseJobUrl;
window.handleTextInput = handleTextInput;
window.selectTone = selectTone;
window.selectLength = selectLength;
window.generateQuickApplication = generateQuickApplication;
window.copyToClipboard = copyToClipboard;
window.downloadAsPdf = downloadAsPdf;
window.downloadAsDocx = downloadAsDocx;
window.sendViaEmail = sendViaEmail;
window.regenerateCoverLetter = regenerateCoverLetter;
window.improveText = improveText;
window.startNewApplication = startNewApplication;
window.addToTracking = addToTracking;
window.importFromLinkedIn = importFromLinkedIn;

