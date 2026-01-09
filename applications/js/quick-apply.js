/**
 * QUICK APPLY - 60 Sekunden Bewerbung
 * ====================================
 * - Nicht angemeldet: Template-Modus mit Beispielsätzen
 * - Angemeldet: GPT-3.5-Turbo mit API-Key aus AWS DynamoDB
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
    hasProfile: false,
    isLoggedIn: false,
    apiKey: null
};

// ═══════════════════════════════════════════════════════════════════════════
// UMFANGREICHE TEMPLATE-DATENBANK (für nicht-angemeldete Nutzer)
// ═══════════════════════════════════════════════════════════════════════════

const CoverLetterTemplates = {
    // Eröffnungssätze nach Tonalität
    openings: {
        formal: [
            "mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als {{position}} bei {{company}} gelesen.",
            "auf Ihre Ausschreibung für die Position {{position}} bei {{company}} möchte ich mich hiermit bewerben.",
            "Ihre Stellenanzeige für {{position}} hat mein besonderes Interesse geweckt, da sie genau meinem Profil entspricht.",
            "bezugnehmend auf Ihre Stellenausschreibung für {{position}} bewerbe ich mich hiermit bei Ihrem Unternehmen.",
            "mit Begeisterung habe ich festgestellt, dass Sie aktuell einen {{position}} suchen.",
            "Ihre Ausschreibung für die Position {{position}} spricht mich besonders an, da ich hier meine Stärken optimal einbringen kann."
        ],
        modern: [
            "als ich Ihre Stellenanzeige für {{position}} bei {{company}} entdeckte, wusste ich sofort: Das ist genau das, wonach ich suche!",
            "die Position als {{position}} bei {{company}} hat mich sofort begeistert – hier möchte ich meine Karriere fortsetzen.",
            "{{company}} und ich – das könnte der perfekte Match werden! Ihre Ausschreibung für {{position}} spricht mich auf ganzer Linie an.",
            "Ihre Stellenausschreibung für {{position}} hat mich nicht nur interessiert, sondern richtig inspiriert.",
            "als {{position}}-Position bei einem innovativen Unternehmen wie {{company}}? Da musste ich mich einfach bewerben!",
            "ich möchte Teil von {{company}} werden! Die Position als {{position}} passt perfekt zu meinen Zielen."
        ],
        creative: [
            "stellen Sie sich vor: Ein {{position}}, der nicht nur Aufgaben erledigt, sondern echte Lösungen schafft. Das bin ich!",
            "was wäre, wenn Ihr neuer {{position}} genau die Person ist, die Sie noch nicht kannten, aber immer gesucht haben?",
            "drei Dinge, die mich auszeichnen: Leidenschaft, Expertise und der Wunsch, bei {{company}} als {{position}} durchzustarten.",
            "ich habe aufgehört zu träumen und angefangen zu handeln – deshalb bewerbe ich mich als {{position}} bei {{company}}.",
            "zwischen den Zeilen Ihrer Stellenanzeige habe ich gelesen: Sie suchen jemanden, der wirklich etwas bewegen will.",
            "mein nächstes Kapitel soll bei {{company}} geschrieben werden – und zwar als Ihr neuer {{position}}."
        ]
    },

    // Qualifikations-/Stärken-Sätze
    qualifications: {
        experience: [
            "In meiner {{experience}}-jährigen Berufserfahrung konnte ich umfangreiche Kompetenzen in {{skills}} aufbauen.",
            "Meine bisherige Tätigkeit hat mir ermöglicht, fundierte Kenntnisse in {{skills}} zu entwickeln.",
            "Als erfahrene Fachkraft mit {{experience}} Jahren Berufserfahrung bringe ich solide Expertise in {{skills}} mit.",
            "Während meiner {{experience}}-jährigen Laufbahn habe ich mich auf {{skills}} spezialisiert.",
            "Mit {{experience}} Jahren Erfahrung in der Branche verfüge ich über praxiserprobte Fähigkeiten in {{skills}}.",
            "Meine berufliche Entwicklung über {{experience}} Jahre hat mich zu einem Experten in {{skills}} gemacht."
        ],
        skills: [
            "Zu meinen Kernkompetenzen zählen {{skills}}, die ich erfolgreich in verschiedenen Projekten eingesetzt habe.",
            "Besonders stark bin ich in {{skills}} – Fähigkeiten, die für diese Position essentiell sind.",
            "Meine Stärken in {{skills}} ermöglichen es mir, komplexe Herausforderungen effizient zu lösen.",
            "{{skills}} sind nicht nur Fähigkeiten für mich, sondern meine Leidenschaft.",
            "Ich bringe fundierte Kenntnisse in {{skills}} mit, die ich kontinuierlich weiterentwickle.",
            "Mein Profil zeichnet sich besonders durch Expertise in {{skills}} aus."
        ],
        achievements: [
            "Ein besonderer Erfolg war die Steigerung der Team-Effizienz um 30% durch Prozessoptimierung.",
            "Ich konnte in meiner letzten Position maßgeblich zur Kostensenkung von 25% beitragen.",
            "Unter meiner Leitung wurde ein Projekt drei Wochen vor dem geplanten Termin erfolgreich abgeschlossen.",
            "Ich habe erfolgreich ein Team von fünf Mitarbeitern aufgebaut und entwickelt.",
            "Durch meine Initiative wurde ein neuer Arbeitsbereich etabliert, der heute zum Kerngeschäft gehört.",
            "Meine Strategie führte zu einer Umsatzsteigerung von 40% innerhalb eines Jahres."
        ]
    },

    // Motivation-Sätze
    motivation: {
        general: [
            "{{company}} als innovatives Unternehmen in der Branche reizt mich besonders.",
            "Die Möglichkeit, bei {{company}} zu arbeiten, entspricht genau meinen Karrierezielen.",
            "Ihr Unternehmen steht für Qualität und Innovation – Werte, die ich teile.",
            "Die Unternehmenskultur bei {{company}} und die spannenden Projekte haben mich überzeugt.",
            "Bei {{company}} sehe ich die perfekte Möglichkeit, meine Fähigkeiten einzusetzen und weiterzuentwickeln.",
            "Die Herausforderungen dieser Position und das Umfeld bei {{company}} motivieren mich sehr."
        ],
        custom: [
            "{{motivation}}",
            "Was mich besonders anspricht: {{motivation}}",
            "Meine persönliche Motivation für diese Stelle: {{motivation}}",
            "{{motivation}} – das ist der Grund, warum ich mich bei Ihnen bewerbe."
        ]
    },

    // Mehrwert-Sätze
    value: {
        formal: [
            "Mit meiner Expertise werde ich einen wertvollen Beitrag zu Ihrem Team leisten.",
            "Ich bin überzeugt, dass ich mit meinen Fähigkeiten Ihr Unternehmen bereichern kann.",
            "Meine Erfahrung wird es mir ermöglichen, schnell produktiv zu werden und Mehrwert zu schaffen.",
            "Ich bringe nicht nur Fachwissen mit, sondern auch die Motivation, Ihr Team voranzubringen.",
            "Mit meinem Engagement und meiner Expertise werde ich Ihre Erwartungen übertreffen."
        ],
        modern: [
            "Ich bin ready, bei {{company}} durchzustarten und echte Ergebnisse zu liefern!",
            "Lassen Sie uns gemeinsam Großes erreichen – ich bin bereit!",
            "Ich will nicht nur mitarbeiten, sondern aktiv zum Erfolg von {{company}} beitragen.",
            "Mit mir bekommen Sie nicht nur einen Mitarbeiter, sondern einen echten Teamplayer.",
            "Ich bin hungrig auf neue Herausforderungen und bereit, mein Bestes zu geben."
        ],
        creative: [
            "Stellen Sie mich ein – und Sie werden sich fragen, wie Sie je ohne mich ausgekommen sind!",
            "Ich verspreche Ihnen: Langeweile wird es mit mir nicht geben.",
            "Mein Ziel? {{company}} noch besser machen. Meine Methode? Engagement, Kreativität und harte Arbeit.",
            "Ich bin die fehlende Zutat in Ihrem Erfolgsrezept – probieren Sie es aus!",
            "Was ich mitbringe? 100% Einsatz, frische Ideen und die Bereitschaft, zu lernen und zu wachsen."
        ]
    },

    // Abschlusssätze
    closings: {
        formal: [
            "Über die Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.",
            "Gerne überzeuge ich Sie in einem persönlichen Gespräch von meinen Qualifikationen.",
            "Ich freue mich auf die Möglichkeit, meine Motivation in einem Gespräch zu vertiefen.",
            "Für ein persönliches Kennenlernen stehe ich Ihnen jederzeit gerne zur Verfügung.",
            "Ich würde mich freuen, meine Eignung für diese Position in einem Gespräch unter Beweis zu stellen."
        ],
        modern: [
            "Lassen Sie uns telefonieren! Ich freue mich auf den Austausch.",
            "Ich bin gespannt auf Ihre Rückmeldung und ein erstes Kennenlernen!",
            "Wann können wir uns treffen? Ich bin flexibel und freue mich auf das Gespräch!",
            "Neugierig geworden? Dann lassen Sie uns sprechen!",
            "Ich freue mich darauf, Sie persönlich von mir zu überzeugen!"
        ],
        creative: [
            "Der Ball liegt jetzt bei Ihnen – ich bin bereit für den nächsten Schritt!",
            "Ein Kaffee, ein Gespräch, eine Chance – mehr brauche ich nicht, um Sie zu überzeugen.",
            "Meine Bewerbung ist der erste Schritt. Das Gespräch der zweite. Wann starten wir?",
            "Ich habe Ihnen geschrieben. Jetzt sind Sie dran. Ich warte auf Ihren Anruf!",
            "Das war mein Pitch. Jetzt würde ich gerne Ihre Fragen beantworten – persönlich."
        ]
    },

    // Grußformeln
    greetings: {
        formal: ["Mit freundlichen Grüßen", "Hochachtungsvoll", "Mit besten Grüßen"],
        modern: ["Beste Grüße", "Herzliche Grüße", "Viele Grüße"],
        creative: ["Bis bald!", "Auf ein baldiges Kennenlernen!", "Freundliche Grüße"]
    },

    // Anreden
    salutations: {
        formal: ["Sehr geehrte Damen und Herren,", "Sehr geehrte Personalverantwortliche,"],
        modern: ["Guten Tag,", "Hallo zusammen,"],
        creative: ["Liebe Personalabteilung,", "Hallo Team von {{company}},"]
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

async function initQuickApply() {
    console.log('⚡ Initializing Quick Apply...');
    
    // Check login status first
    await checkLoginStatus();
    
    // Check if profile exists
    checkProfileStatus();
    
    // Setup event listeners
    setupQuickApplyListeners();
    
    // Update UI based on login status
    updateAPIStatusDisplay();
    
    console.log('✅ Quick Apply ready - Logged in:', QuickApplyState.isLoggedIn);
}

/**
 * Prüft Login-Status und lädt API-Key aus AWS wenn angemeldet
 */
async function checkLoginStatus() {
    // Prüfe ob Nutzer angemeldet ist
    if (window.realUserAuth) {
        try {
            QuickApplyState.isLoggedIn = window.realUserAuth.isLoggedIn?.() || false;
            
            if (QuickApplyState.isLoggedIn) {
                console.log('✅ Nutzer ist angemeldet, lade API-Key aus AWS...');
                await loadAPIKeyFromAWS();
            }
        } catch (error) {
            console.warn('⚠️ Auth-Check fehlgeschlagen:', error);
            QuickApplyState.isLoggedIn = false;
        }
    }
}

/**
 * Lädt den Admin-API-Key aus AWS DynamoDB
 */
async function loadAPIKeyFromAWS() {
    try {
        if (!window.awsProfileAPI) {
            console.warn('⚠️ awsProfileAPI nicht verfügbar');
            return null;
        }

        // Warte auf Initialisierung
        if (!window.awsProfileAPI.isInitialized) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
                const check = setInterval(() => {
                    if (window.awsProfileAPI.isInitialized) {
                        clearInterval(check);
                        clearTimeout(timeout);
                        resolve();
                    }
                }, 100);
            });
        }

        // Lade Admin-Konfiguration
        const adminProfile = await window.awsProfileAPI.loadProfile('admin').catch(() => null);
        
        if (adminProfile?.apiKeys?.openai?.apiKey) {
            const key = adminProfile.apiKeys.openai.apiKey;
            if (key && key.startsWith('sk-')) {
                QuickApplyState.apiKey = key;
                console.log('✅ API-Key aus AWS geladen');
                return key;
            }
        }
        
        console.log('ℹ️ Kein API-Key in AWS gefunden');
        return null;
    } catch (error) {
        console.warn('⚠️ Fehler beim Laden des API-Keys aus AWS:', error);
        return null;
    }
}

/**
 * Zeigt den Status an (Template-Modus vs GPT-3.5-Turbo)
 */
function updateAPIStatusDisplay() {
    const statusText = document.getElementById('apiStatusText');
    const generationInfo = document.getElementById('generationInfo');
    const apiHint = document.getElementById('apiHint');
    
    if (!statusText || !generationInfo) return;

    if (QuickApplyState.isLoggedIn && QuickApplyState.apiKey) {
        // Angemeldet MIT API-Key
        statusText.innerHTML = '<i class="fas fa-robot"></i> GPT-3.5-Turbo • KI-generierte Anschreiben';
        generationInfo.classList.add('has-api');
        generationInfo.classList.remove('no-api');
        if (apiHint) apiHint.classList.add('hidden');
    } else if (QuickApplyState.isLoggedIn) {
        // Angemeldet OHNE API-Key
        statusText.innerHTML = '<i class="fas fa-file-alt"></i> Template-Modus • Melden Sie sich ab und wieder an';
        generationInfo.classList.add('no-api');
        generationInfo.classList.remove('has-api');
        if (apiHint) {
            apiHint.classList.remove('hidden');
            apiHint.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <div>
                    <strong>API-Key nicht gefunden</strong> - 
                    <a href="/admin.html#api-keys" target="_blank">Im Admin Panel konfigurieren</a>
                </div>
            `;
        }
    } else {
        // Nicht angemeldet - Template-Modus
        statusText.innerHTML = '<i class="fas fa-magic"></i> Smart-Template • Anmelden für KI-Generierung';
        generationInfo.classList.add('no-api');
        generationInfo.classList.remove('has-api');
        if (apiHint) {
            apiHint.classList.remove('hidden');
            apiHint.innerHTML = `
                <i class="fas fa-user-plus"></i>
                <div>
                    <strong>Kostenlos testen!</strong> - 
                    <a href="#" onclick="showLoginModal(); return false;">Anmelden für GPT-3.5-Turbo</a>
                </div>
            `;
        }
    }
}

function showLoginModal() {
    if (window.realUserAuth?.showLoginModal) {
        window.realUserAuth.showLoginModal();
    } else {
        // Fallback: Button klicken
        const loginBtn = document.querySelector('.auth-btn');
        if (loginBtn) loginBtn.click();
    }
}

function checkProfileStatus() {
    const profile = window.DashboardState?.profile || {};
    QuickApplyState.hasProfile = !!(
        profile.firstName && 
        profile.skills && 
        profile.skills.length > 0
    );
}

function setupQuickApplyListeners() {
    const urlInput = document.getElementById('jobUrl');
    if (urlInput) {
        urlInput.addEventListener('input', handleUrlInput);
        urlInput.addEventListener('paste', handleUrlPaste);
    }
    
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
    
    const urlGroup = document.getElementById('urlInputGroup');
    const textGroup = document.getElementById('textInputGroup');
    const urlBtn = document.querySelector('[onclick*="toggleInputType(\'url\')"]');
    const textBtn = document.querySelector('[onclick*="toggleInputType(\'text\')"]');
    
    if (type === 'url') {
        urlGroup?.classList.remove('hidden');
        textGroup?.classList.add('hidden');
        urlBtn?.classList.add('active');
        textBtn?.classList.remove('active');
    } else {
        urlGroup?.classList.add('hidden');
        textGroup?.classList.remove('hidden');
        urlBtn?.classList.remove('active');
        textBtn?.classList.add('active');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// URL & TEXT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function handleUrlInput(e) {
    const url = e.target.value.trim();
    const analyzeBtn = document.getElementById('analyzeUrlBtn');
    
    if (analyzeBtn) {
        const isValid = isValidJobUrl(url);
        analyzeBtn.disabled = !isValid;
    }
}

function handleUrlPaste(e) {
    setTimeout(() => {
        handleUrlInput({ target: e.target });
    }, 100);
}

function handleTextInput(e) {
    const text = e.target.value.trim();
    updateGenerateButtonState();
    
    if (text.length > 100) {
        extractJobInfoFromText(text);
    }
}

function isValidJobUrl(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

function updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    if (!generateBtn) return;
    
    const nameInput = document.getElementById('quickName');
    const experienceSelect = document.getElementById('quickExperience');
    const skillsInput = document.getElementById('quickSkills');
    
    const hasName = nameInput?.value.trim().length > 0;
    const hasExperience = experienceSelect?.value !== '';
    const hasSkills = skillsInput?.value.trim().length > 0;
    const hasJobData = QuickApplyState.jobData !== null || 
                       document.getElementById('jobText')?.value.trim().length > 100;
    
    generateBtn.disabled = !(hasName && hasExperience && hasSkills);
}

// ═══════════════════════════════════════════════════════════════════════════
// JOB ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

async function analyzeJobUrl() {
    const urlInput = document.getElementById('jobUrl');
    const url = urlInput?.value.trim();
    
    if (!url || !isValidJobUrl(url)) {
        showToast('Bitte geben Sie eine gültige URL ein', 'error');
        return;
    }
    
    const analyzeBtn = document.getElementById('analyzeUrlBtn');
    const originalText = analyzeBtn?.innerHTML;
    
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analysiere...';
    }
    
    try {
        const response = await fetch('/.netlify/functions/job-parser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: url, inputType: 'url' })
        });
        
        if (!response.ok) throw new Error('Parsing fehlgeschlagen');
        
        const data = await response.json();
        
        if (data.parsedJob) {
            QuickApplyState.jobData = data.parsedJob;
            displayJobData(data.parsedJob);
            showToast('Stellenanzeige analysiert!', 'success');
        }
    } catch (error) {
        console.error('URL parsing failed:', error);
        showToast('Analyse fehlgeschlagen. Bitte Text einfügen.', 'error');
        toggleInputType('text');
    } finally {
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalText;
        }
    }
    
    updateGenerateButtonState();
}

function extractJobInfoFromText(text) {
    const positionPatterns = [
        /(?:Position|Stelle|Job|Jobtitel|Stellenbezeichnung)[:\s]+([^\n,]+)/i,
        /(?:suchen|gesucht)[:\s]+(?:eine?n?\s+)?([^\n,]+)/i,
        /^([A-Z][a-zA-Z\s\/\-]+)\s*\(m\/w\/d\)/m
    ];
    
    const companyPatterns = [
        /(?:Unternehmen|Firma|Arbeitgeber|Company)[:\s]+([^\n,]+)/i,
        /(?:bei|für)\s+(?:der|die|das)?\s*([A-Z][a-zA-Z\s&]+(?:GmbH|AG|SE|UG|KG|Inc|Ltd)?)/
    ];
    
    let position = '';
    let company = '';
    
    for (const pattern of positionPatterns) {
        const match = text.match(pattern);
        if (match) {
            position = match[1].trim();
            break;
        }
    }
    
    for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match) {
            company = match[1].trim();
            break;
        }
    }
    
    if (position || company) {
        QuickApplyState.jobData = {
            title: position || 'die ausgeschriebene Position',
            company: company || 'Ihr Unternehmen',
            description: text.substring(0, 500)
        };
    }
}

function displayJobData(jobData) {
    const container = document.getElementById('jobDataDisplay');
    if (!container) return;
    
    container.innerHTML = `
        <div class="job-data-card">
            <div class="job-data-header">
                <i class="fas fa-briefcase"></i>
                <span>Erkannte Stelleninformationen</span>
            </div>
            <div class="job-data-content">
                <div class="job-data-item">
                    <strong>Position:</strong> ${escapeHtml(jobData.title || 'Nicht erkannt')}
                </div>
                <div class="job-data-item">
                    <strong>Unternehmen:</strong> ${escapeHtml(jobData.company || 'Nicht erkannt')}
                </div>
                ${jobData.location ? `
                <div class="job-data-item">
                    <strong>Standort:</strong> ${escapeHtml(jobData.location)}
                </div>
                ` : ''}
            </div>
        </div>
    `;
    container.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════════════════
// COVER LETTER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateCoverLetter() {
    if (QuickApplyState.isGenerating) return;
    
    const userData = collectUserData();
    if (!validateUserData(userData)) return;
    
    QuickApplyState.isGenerating = true;
    showGeneratingState();
    
    try {
        let coverLetter;
        
        // Entscheidung: KI oder Template
        if (QuickApplyState.isLoggedIn && QuickApplyState.apiKey) {
            // GPT-3.5-Turbo für angemeldete Nutzer
            coverLetter = await generateWithGPT(userData);
        } else {
            // Template-Modus für nicht-angemeldete Nutzer
            coverLetter = generateFromTemplates(userData);
        }
        
        QuickApplyState.generatedText = coverLetter;
        displayGeneratedLetter(coverLetter);
        
        // In Tracking speichern wenn angemeldet
        if (QuickApplyState.isLoggedIn && window.DashboardState) {
            saveToTracking(userData);
        }
        
        showToast('Anschreiben erstellt!', 'success');
        
    } catch (error) {
        console.error('Generation failed:', error);
        showToast('Fehler bei der Generierung: ' + error.message, 'error');
        
        // Fallback auf Templates bei Fehler
        if (QuickApplyState.isLoggedIn) {
            showToast('Verwende Template als Fallback...', 'info');
            const coverLetter = generateFromTemplates(collectUserData());
            QuickApplyState.generatedText = coverLetter;
            displayGeneratedLetter(coverLetter);
        }
    } finally {
        QuickApplyState.isGenerating = false;
        hideGeneratingState();
    }
}

/**
 * Generiert Anschreiben mit GPT-3.5-Turbo
 */
async function generateWithGPT(userData) {
    const prompt = buildGPTPrompt(userData);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QuickApplyState.apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `Du bist ein erfahrener Bewerbungsberater aus dem DACH-Raum. 
Erstelle professionelle, authentische Bewerbungsanschreiben auf Deutsch.
- Verwende einen ${userData.tone === 'formal' ? 'professionellen und sachlichen' : userData.tone === 'modern' ? 'modernen und dynamischen' : 'kreativen und einzigartigen'} Ton.
- Das Anschreiben soll ${userData.length === 'short' ? 'kurz (ca. 150 Wörter)' : userData.length === 'long' ? 'ausführlich (ca. 350 Wörter)' : 'mittellang (ca. 250 Wörter)'} sein.
- Integriere die Stärken und Erfahrung des Bewerbers natürlich.
- Vermeide Floskeln und generische Phrasen.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

function buildGPTPrompt(userData) {
    const jobInfo = QuickApplyState.jobData || {};
    
    return `Erstelle ein Bewerbungsanschreiben mit folgenden Informationen:

BEWERBER:
- Name: ${userData.name}
- Aktuelle Position: ${userData.currentPosition || 'Nicht angegeben'}
- Berufserfahrung: ${userData.experience}
- Standort: ${userData.location || 'Nicht angegeben'}
- Top-Stärken: ${userData.skills}
${userData.motivation ? `- Motivation: ${userData.motivation}` : ''}

ZIELSTELLE:
- Position: ${jobInfo.title || 'die ausgeschriebene Position'}
- Unternehmen: ${jobInfo.company || 'das Unternehmen'}
${jobInfo.description ? `- Stellenbeschreibung (Auszug): ${jobInfo.description.substring(0, 500)}` : ''}

Erstelle ein überzeugendes, authentisches Anschreiben das die Stärken des Bewerbers mit den Anforderungen der Stelle verbindet.`;
}

/**
 * Generiert Anschreiben aus Templates (für nicht-angemeldete Nutzer)
 */
function generateFromTemplates(userData) {
    const tone = userData.tone;
    const templates = CoverLetterTemplates;
    const jobData = QuickApplyState.jobData || {
        title: 'die ausgeschriebene Position',
        company: 'Ihr Unternehmen'
    };
    
    // Zufällige Auswahl aus Arrays
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // Platzhalter ersetzen
    const replace = (text) => {
        return text
            .replace(/\{\{position\}\}/g, jobData.title || 'die ausgeschriebene Position')
            .replace(/\{\{company\}\}/g, jobData.company || 'Ihr Unternehmen')
            .replace(/\{\{name\}\}/g, userData.name)
            .replace(/\{\{skills\}\}/g, userData.skills)
            .replace(/\{\{experience\}\}/g, getExperienceYears(userData.experience))
            .replace(/\{\{motivation\}\}/g, userData.motivation || 'die spannenden Herausforderungen dieser Position');
    };
    
    // Anschreiben zusammenbauen
    const salutation = replace(pick(templates.salutations[tone]));
    const opening = replace(pick(templates.openings[tone]));
    const qualification1 = replace(pick(templates.qualifications.experience));
    const qualification2 = replace(pick(templates.qualifications.skills));
    
    // Bei längeren Anschreiben: mehr Inhalt
    let additionalContent = '';
    if (userData.length !== 'short') {
        const achievement = replace(pick(templates.qualifications.achievements));
        additionalContent = `\n\n${achievement}`;
    }
    
    const motivation = userData.motivation 
        ? replace(pick(templates.motivation.custom))
        : replace(pick(templates.motivation.general));
    
    const value = replace(pick(templates.value[tone]));
    const closing = replace(pick(templates.closings[tone]));
    const greeting = pick(templates.greetings[tone]);
    
    // Datum hinzufügen
    const today = new Date().toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    return `${today}

${salutation}

${opening}

${qualification1} ${qualification2}${additionalContent}

${motivation} ${value}

${closing}

${greeting}
${userData.name}`;
}

function getExperienceYears(experience) {
    const map = {
        '': '1',
        'entry': '1',
        'junior': '2',
        'mid': '4',
        'senior': '7',
        'expert': '10+'
    };
    return map[experience] || '3';
}

// ═══════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function collectUserData() {
    return {
        name: document.getElementById('quickName')?.value.trim() || '',
        currentPosition: document.getElementById('quickPosition')?.value.trim() || '',
        experience: document.getElementById('quickExperience')?.value || '',
        location: document.getElementById('quickLocation')?.value.trim() || '',
        skills: document.getElementById('quickSkills')?.value.trim() || '',
        motivation: document.getElementById('quickMotivation')?.value.trim() || '',
        tone: QuickApplyState.tone,
        length: QuickApplyState.length
    };
}

function validateUserData(userData) {
    if (!userData.name) {
        showToast('Bitte geben Sie Ihren Namen ein', 'error');
        document.getElementById('quickName')?.focus();
        return false;
    }
    if (!userData.experience) {
        showToast('Bitte wählen Sie Ihre Berufserfahrung', 'error');
        document.getElementById('quickExperience')?.focus();
        return false;
    }
    if (!userData.skills) {
        showToast('Bitte geben Sie Ihre Stärken ein', 'error');
        document.getElementById('quickSkills')?.focus();
        return false;
    }
    return true;
}

function showGeneratingState() {
    const generateBtn = document.getElementById('generateBtn');
    const resultSection = document.getElementById('resultSection');
    
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird erstellt...';
    }
    
    if (resultSection) {
        resultSection.innerHTML = `
            <div class="generating-animation">
                <div class="generating-icon">
                    <i class="fas fa-pen-fancy fa-3x"></i>
                </div>
                <h3>Anschreiben wird erstellt...</h3>
                <p>${QuickApplyState.isLoggedIn && QuickApplyState.apiKey ? 'GPT-3.5-Turbo formuliert Ihr individuelles Anschreiben' : 'Intelligente Templates werden zusammengestellt'}</p>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        resultSection.classList.remove('hidden');
    }
}

function hideGeneratingState() {
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Anschreiben generieren';
    }
}

function displayGeneratedLetter(letter) {
    const resultSection = document.getElementById('resultSection');
    if (!resultSection) return;
    
    const modeLabel = QuickApplyState.isLoggedIn && QuickApplyState.apiKey
        ? '<span class="mode-badge ai"><i class="fas fa-robot"></i> GPT-3.5-Turbo</span>'
        : '<span class="mode-badge template"><i class="fas fa-magic"></i> Smart-Template</span>';
    
    resultSection.innerHTML = `
        <div class="result-header">
            <h3><i class="fas fa-file-alt"></i> Ihr Anschreiben ${modeLabel}</h3>
            <div class="result-actions">
                <button onclick="copyToClipboard(QuickApplyState.generatedText)" class="btn-icon" title="Kopieren">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="downloadLetter()" class="btn-icon" title="Herunterladen">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="regenerateLetter()" class="btn-icon" title="Neu generieren">
                    <i class="fas fa-sync"></i>
                </button>
            </div>
        </div>
        <div class="result-content">
            <textarea id="generatedLetter" class="letter-textarea">${escapeHtml(letter)}</textarea>
        </div>
        <div class="result-footer">
            <button onclick="saveToDrafts()" class="btn-secondary">
                <i class="fas fa-save"></i> Als Entwurf speichern
            </button>
            <button onclick="sendApplication()" class="btn-primary">
                <i class="fas fa-paper-plane"></i> Bewerbung absenden
            </button>
        </div>
    `;
    
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function regenerateLetter() {
    generateCoverLetter();
}

function downloadLetter() {
    const letter = document.getElementById('generatedLetter')?.value || QuickApplyState.generatedText;
    const jobData = QuickApplyState.jobData || {};
    
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anschreiben_${jobData.company || 'Bewerbung'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Anschreiben heruntergeladen', 'success');
}

function saveToDrafts() {
    const letter = document.getElementById('generatedLetter')?.value || QuickApplyState.generatedText;
    
    const drafts = JSON.parse(localStorage.getItem('cover_letter_drafts') || '[]');
    drafts.unshift({
        id: Date.now().toString(36),
        content: letter,
        jobData: QuickApplyState.jobData,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('cover_letter_drafts', JSON.stringify(drafts.slice(0, 10)));
    
    showToast('Entwurf gespeichert', 'success');
}

function sendApplication() {
    showToast('Bewerbungsfunktion kommt bald!', 'info');
}

function saveToTracking(userData) {
    if (!window.DashboardState) return;
    
    const jobData = QuickApplyState.jobData || {};
    const application = {
        id: Date.now().toString(36),
        position: jobData.title || 'Unbekannte Position',
        company: jobData.company || 'Unbekanntes Unternehmen',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        coverLetter: QuickApplyState.generatedText,
        createdAt: new Date().toISOString()
    };
    
    window.DashboardState.applications.unshift(application);
    if (window.saveState) window.saveState();
    if (window.updateStatsBar) window.updateStatsBar();
}

// ═══════════════════════════════════════════════════════════════════════════
// TONE & LENGTH SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function setTone(tone) {
    QuickApplyState.tone = tone;
    
    document.querySelectorAll('.tone-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tone === tone);
    });
}

function setLength(length) {
    QuickApplyState.length = length;
    
    document.querySelectorAll('.length-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.length === length);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS (Fallbacks wenn utils.js nicht geladen)
// ═══════════════════════════════════════════════════════════════════════════

function escapeHtml(text) {
    if (window.escapeHtml) return window.escapeHtml(text);
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type) {
    if (window.showToast) return window.showToast(message, type);
    console.log(`[${type}] ${message}`);
}

function copyToClipboard(text) {
    if (window.copyToClipboard) return window.copyToClipboard(text);
    navigator.clipboard.writeText(text).then(() => {
        showToast('In Zwischenablage kopiert', 'success');
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

window.initQuickApply = initQuickApply;
window.toggleInputType = toggleInputType;
window.analyzeJobUrl = analyzeJobUrl;
window.generateCoverLetter = generateCoverLetter;
window.setTone = setTone;
window.setLength = setLength;
window.downloadLetter = downloadLetter;
window.saveToDrafts = saveToDrafts;
window.sendApplication = sendApplication;
window.regenerateLetter = regenerateLetter;
window.QuickApplyState = QuickApplyState;
